// gen-taste-pool.mjs — STEP ONE of the "aesthetic judge" that learns DAMLA'S
// taste (not an AI's opinion). It builds a diverse POOL of drafted garment
// specs by sampling combinations across the orthogonal style axes, drafts each
// through the SAME shipping WASM engine (which validates the combo and rejects
// invalid ones), and renders BOTH views a human judges from:
//   - the ON-FIGURE croquis (how a size-36 would look worn) — reuses render-on-figure.mjs
//   - the technical FLAT (front + back line-art)            — reuses render-garment-flat.mjs
//
// Output: dataset/taste-pool/svg/<id>-figure.svg + <id>-flat.svg, plus an
// index.json listing each item (id, spec, image paths, human description). The
// index + generator are committed; the SVGs are gitignored (heavy, regenerable).
//
// These are the items Damla will label in label.html ("Wear It" / "Not for Me"
// / "If Fixed"). We do NOT train the model here — that's the next step, after
// she has labeled ~150. Zero LLM cost: every image is the engine's own geometry.
//
//   run:  node engine/tools/gen-taste-pool.mjs
//   then: cd dataset/taste-pool && python3 -m http.server, open label.html
//
// Reuses render-on-figure.mjs / render-garment-flat.mjs untouched.

import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const createEngine = require(join(here, '../dist/stitchu-engine.js'));
const { renderOnFigure } = await import(join(here, 'render-on-figure.mjs'));
const { renderGarmentFlat } = await import(join(here, 'render-garment-flat.mjs'));

const ROOT = join(here, '../../dataset/taste-pool');
const SVG = join(ROOT, 'svg');
mkdirSync(SVG, { recursive: true });

// EU38 demo body (same as render-patterns / the site demo).
const BODY = { bust: 90, waist: 72, hip: 98, shoulder: 38, backLength: 40, armLength: 58, neck: 36 };

// ---------------------------------------------------------------------------
// THE ORTHOGONAL STYLE AXES. Values are the exact tokens / integer codes the
// engine + renderers accept (taken from render-patterns.mjs, the ground-truth
// vocabulary). Integer-coded axes carry a human label for the description.
// ---------------------------------------------------------------------------
const NECKLINES = ['crew', 'scoop', 'vNeck', 'square', 'boat', 'sweetheart', 'halter', 'cowl', 'offShoulder'];
const SLEEVES = [
  { style: 'none', length: 'short', cap: 0, label: 'sleeveless' },
  { style: 'cap', length: 'short', cap: 0, label: 'cap sleeve' },
  { style: 'straight', length: 'short', cap: 0, label: 'short sleeve' },
  { style: 'straight', length: 'elbow', cap: 0, label: 'elbow sleeve' },
  { style: 'straight', length: 'long', cap: 0, label: 'long sleeve' },
  { style: 'straight', length: 'short', cap: 2, label: 'puff sleeve' },
  { style: 'straight', length: 'short', cap: 1, label: 'gathered puff sleeve' },
];
const SHAPINGS = [
  { v: 'dart', label: 'darted' },
  { v: 'princess', label: 'princess-seamed' },
];
const WAISTS = [
  { v: 'natural', label: 'natural-waist' },
  { v: 'empire', label: 'empire-waist' },
];
const SKIRT_STYLES = [
  { v: 'straight', label: 'straight' },
  { v: 'aLine', label: 'A-line' },
  { v: 'gathered', label: 'gathered' },
  { v: 'circle', label: 'circle' },
  { v: 'full', label: 'full' },
];
const SKIRT_LENGTHS = [
  { v: 'mini', label: 'mini' },
  { v: 'midi', label: 'midi' },
  { v: 'maxi', label: 'maxi' },
];
const TOP_LENGTHS = [
  { v: 'crop', label: 'cropped' },
  { v: 'waist', label: 'waist-length' },
  { v: 'hip', label: 'hip-length' },
  { v: 'tunic', label: 'tunic-length' },
];
const COLLARS = [
  { t: 0, e: 0, label: '' },
  { t: 1, e: 0, label: 'mandarin collar' },
  { t: 4, e: 0, label: 'peter-pan collar' },
  { t: 5, e: 1, label: 'pointed shirt collar' },
];
const TIES = [
  { v: 0, label: '' },
  { v: 2, label: 'back-waist bow' },
  { v: 3, label: 'front neck bow' },
  { v: 4, label: 'back tie' },
];
const GATHERS = [
  { type: 0, zone: 0, label: '' },
  { type: 2, zone: 1, label: 'shirred bust' },
  { type: 3, zone: 0, label: 'smocked yoke' },
  { type: 1, zone: 1, label: 'drawstring bust' },
];
const RUFFLED_STRAPS = [{ v: 0, label: '' }, { v: 1, label: 'ruffled straps' }];
const BACK_OPENINGS = [{ v: 0, label: '' }, { v: 1, label: 'open back' }];
const PLACKETS = [false, true];
const POCKETS = [{ v: 0, label: '' }, { v: 1, label: 'patch pockets' }];
const PEPLUMS = [{ v: 0, label: '' }, { v: 1, label: 'peplum' }];

// deterministic PRNG (mulberry32) so the pool is reproducible run-to-run.
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20260717);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

// Build ONE candidate spec by sampling across the axes for a given garment.
function sampleSpec(garment) {
  const isDress = garment === 'dress';
  const sl = pick(SLEEVES);
  const sh = pick(SHAPINGS);
  const wl = pick(WAISTS);
  const col = pick(COLLARS);
  const tie = pick(TIES);
  const gat = pick(GATHERS);
  const rs = pick(RUFFLED_STRAPS);
  const bo = pick(BACK_OPENINGS);
  const placket = pick(PLACKETS);
  const pk = pick(POCKETS);
  const pep = pick(PEPLUMS);

  // a collar and a front neck bow both want the neck -> avoid piling both.
  const collar = tie.v === 3 ? COLLARS[0] : col;
  // ruffled straps only make sense sleeveless.
  const ruffledStraps = sl.style === 'none' ? rs : RUFFLED_STRAPS[0];
  // a placket + a collar go together; a bare placket also fine, but never
  // place a front placket AND a front neck bow (they fight for the same space).
  const frontPlacket = tie.v === 3 ? false : placket;

  return {
    garment,
    shaping: sh.v, shapingLabel: sh.label,
    waistline: wl.v, waistLabel: wl.label,
    fabric: 'woven',
    neckline: pick(NECKLINES),
    sleeveStyle: sl.style, sleeveLength: sl.length, sleeveCap: sl.cap, sleeveLabel: sl.label,
    skirtStyle: isDress ? pick(SKIRT_STYLES).v : 'aLine',
    skirtLength: isDress ? pick(SKIRT_LENGTHS).v : 'midi',
    topLength: isDress ? 'hip' : pick(TOP_LENGTHS).v,
    frontPlacket,
    tie: tie.v, tieLabel: tie.label,
    collarType: collar.t, collarEdge: collar.e, collarLabel: collar.label,
    gatherType: gat.type, gatherZone: gat.zone, gatherLabel: gat.label,
    backOpening: bo.v, backLabel: bo.label,
    ruffledStraps: ruffledStraps.v, ruffledLabel: ruffledStraps.label,
    peplum: pep.v, peplumLabel: pep.label,
    pocketStyle: pk.v, pocketLabel: pk.label,
  };
}

// A short human description of what the garment IS (for the labeler card).
function describe(s) {
  const parts = [];
  parts.push(s.waistLabel);
  if (s.gatherLabel) parts.push(s.gatherLabel);
  parts.push(s.neckline === 'vNeck' ? 'V-neck' : s.neckline + ' neck');
  if (s.collarLabel) parts.push(s.collarLabel);
  parts.push(s.sleeveLabel);
  if (s.ruffledLabel) parts.push(s.ruffledLabel);
  if (s.frontPlacket) parts.push('button front');
  if (s.tieLabel) parts.push(s.tieLabel);
  if (s.backLabel) parts.push(s.backLabel);
  if (s.pocketLabel) parts.push(s.pocketLabel);
  if (s.peplumLabel) parts.push(s.peplumLabel);
  if (s.garment === 'dress') {
    parts.push(s.skirtStyle === 'aLine' ? 'A-line' : s.skirtStyle);
    parts.push(s.skirtLength);
    parts.push('dress');
  } else {
    parts.push(s.topLength === 'hip' ? 'top' : s.topLength + ' top');
  }
  // Title Case first word, join, single spaces.
  const str = parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// A stable dedupe key: the full combination of style-bearing fields.
function key(s) {
  return [s.garment, s.shaping, s.waistline, s.neckline, s.sleeveStyle, s.sleeveLength,
    s.sleeveCap, s.skirtStyle, s.skirtLength, s.topLength, s.frontPlacket, s.tie,
    s.collarType, s.collarEdge, s.gatherType, s.gatherZone, s.backOpening,
    s.ruffledStraps, s.peplum, s.pocketStyle].join('|');
}

// flatSpec: the exact fields both renderers read (they ignore the *Label helpers).
function flatSpecOf(s, closure) {
  return {
    garment: s.garment, shaping: s.shaping, waistline: s.waistline, neckline: s.neckline,
    skirtStyle: s.skirtStyle, skirtLength: s.skirtLength, topLength: s.topLength,
    sleeveStyle: s.sleeveStyle, sleeveLength: s.sleeveLength, sleeveCap: s.sleeveCap,
    collarType: s.collarType, collarEdge: s.collarEdge,
    frontPlacket: s.frontPlacket === true, tie: s.tie,
    gatherType: s.gatherType, gatherZone: s.gatherZone, backOpening: s.backOpening,
    ruffledStraps: s.ruffledStraps, peplum: s.peplum, pocketStyle: s.pocketStyle,
    closure: closure || null,
  };
}

// ---------------------------------------------------------------------------
const engine = await createEngine();
const TARGET = 180;          // aim; the seen-set keeps them distinct
const MAX_TRIES = 6000;      // safety bound on sampling
const seen = new Set();
const items = [];
let tries = 0, errors = 0;

while (items.length < TARGET && tries < MAX_TRIES) {
  tries++;
  const garment = rand() < 0.6 ? 'dress' : 'top';
  const s = sampleSpec(garment);
  const k = key(s);
  if (seen.has(k)) continue;

  const out = JSON.parse(engine.draftJSON({
    garment: s.garment, shaping: s.shaping, waistline: s.waistline, fabric: s.fabric,
    neckline: s.neckline, sleeveStyle: s.sleeveStyle, sleeveLength: s.sleeveLength,
    skirtStyle: s.skirtStyle, skirtLength: s.skirtLength, topLength: s.topLength,
    ruffleHem: false, ruffleTiers: 1, keyhole: false,
    frontPlacket: s.frontPlacket === true, tieClosure: s.tie, sleeveCap: s.sleeveCap,
    collarType: s.collarType, collarEdge: s.collarEdge,
    gatherType: s.gatherType, gatherZone: s.gatherZone, backOpening: s.backOpening,
    ruffledStraps: s.ruffledStraps, peplum: s.peplum, pocketStyle: s.pocketStyle,
  }, { bust: BODY.bust, waist: BODY.waist, hip: BODY.hip, shoulder: BODY.shoulder, backLength: BODY.backLength, armLength: BODY.armLength, neck: BODY.neck }));

  if (out.error) { errors++; continue; }   // engine rejected the combo — skip.
  seen.add(k);
  const p = out.pattern;
  const closures = [...new Set(p.pieces.filter((x) => x.closure).map((x) => x.closure))];
  const flatSpec = flatSpecOf(s, closures[0]);

  const id = 'g' + String(items.length + 1).padStart(3, '0');
  let figureSvg, flatSvg;
  try {
    figureSvg = renderOnFigure(flatSpec);
    flatSvg = renderGarmentFlat(p.pieces, flatSpec);
  } catch (e) {
    errors++; seen.delete(k); continue;    // a renderer choke — skip this combo.
  }
  writeFileSync(join(SVG, `${id}-figure.svg`), figureSvg);
  writeFileSync(join(SVG, `${id}-flat.svg`), flatSvg);

  // features = the notable non-default axes, for the labeler card chips.
  const features = [s.collarLabel, s.gatherLabel, s.tieLabel, s.ruffledLabel,
    s.backLabel, s.pocketLabel, s.peplumLabel, s.frontPlacket ? 'button front' : '']
    .filter(Boolean);

  items.push({
    id,
    name: describe(s),
    garment: s.garment,
    features,
    figure: `svg/${id}-figure.svg`,
    flat: `svg/${id}-flat.svg`,
    pieces: p.pieces.length,
    // the raw style spec — this is what a trained taste model would key on.
    spec: {
      garment: s.garment, shaping: s.shaping, waistline: s.waistline, fabric: s.fabric,
      neckline: s.neckline, sleeveStyle: s.sleeveStyle, sleeveLength: s.sleeveLength,
      sleeveCap: s.sleeveCap, skirtStyle: s.skirtStyle, skirtLength: s.skirtLength,
      topLength: s.topLength, frontPlacket: s.frontPlacket === true, tie: s.tie,
      collarType: s.collarType, collarEdge: s.collarEdge, gatherType: s.gatherType,
      gatherZone: s.gatherZone, backOpening: s.backOpening, ruffledStraps: s.ruffledStraps,
      peplum: s.peplum, pocketStyle: s.pocketStyle,
    },
  });
}

const index = {
  generated: new Date().toISOString(),
  body: BODY,
  count: items.length,
  tries, errors,
  note: 'Diverse drafted-pattern pool for Damla to label (Wear It / Not for Me / If Fixed). '
    + 'Every item is the engine\'s own geometry — zero LLM cost. Images are gitignored (regenerable via gen-taste-pool.mjs).',
  items,
};
writeFileSync(join(ROOT, 'index.json'), JSON.stringify(index, null, 2));

console.log(`taste pool: ${items.length} distinct garments`);
console.log(`  tries=${tries}  engine/renderer rejects=${errors}`);
const dresses = items.filter((i) => i.garment === 'dress').length;
console.log(`  ${dresses} dresses, ${items.length - dresses} tops`);
console.log(`  -> dataset/taste-pool/index.json + svg/`);
