// render-patterns.mjs — one clean layout SVG per FULL benchmark pattern, for the
// pattern-library blog pages. Drafts each distinct product (deduped from the
// benchmark FULL set) through the SAME WASM engine the product ships, then lays
// every drafted piece out on one nested sheet (shelf-packed, real geometry).
// Source Etsy photos are NEVER used or referenced — only the engine's own output
// and a generic style name. Output: web/patterns/svg/<slug>.svg + info line.
//   run:  node engine/tools/render-patterns.mjs
import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const createEngine = require(join(here, '../dist/stitchu-engine.js'));
const sheet = await import(join(here, '../../web/js/sheet.js'));
const { pathD, bounds, shelfPack } = sheet;

const OUT = join(here, '../../web/patterns/svg');
mkdirSync(OUT, { recursive: true });

// EU38 demo body (same as the site's demo / render-pages).
const BODY = { bust: 90, waist: 72, hip: 98, shoulder: 38, backLength: 40, armLength: 58, neck: 36 };

// The 12 distinct FULL products from benchmark-58/results-2026-07-16.json,
// deduped by garment identity (multiple photos of the same product collapse to
// one pattern). Each carries the engine params that reproduce it + the honest
// note (which patch made it drawable) that the page renders.
export const PATTERNS = [
  { slug: 'boat-neck-linen-shell', style: 'Boat neck linen shell top', garment: 'top',
    shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    patch: null, drawnBy: 'in-vocab from day one', photos: 4 },

  { slug: 'scoop-neck-tank-mini-dress', style: 'Scoop neck tank mini dress', garment: 'dress',
    shaping: 'dart', waistline: 'natural', fabric: 'knit', neckline: 'scoop', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'straight', skirtLength: 'mini', topLength: 'hip',
    patch: null, drawnBy: 'in-vocab from day one', photos: 1 },

  { slug: 'boat-neck-button-down-top', style: 'Boat neck button-down top', garment: 'top',
    shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    frontPlacket: true, patch: '1.3', drawnBy: 'the front button placket', photos: 4 },

  { slug: 'gingham-button-blouse', style: 'Sleeveless gingham button blouse', garment: 'top',
    shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    frontPlacket: true, patch: '1.3', drawnBy: 'the front button placket', photos: 1 },

  { slug: 'mandarin-collar-fitted-blouse', style: 'Mandarin-collar fitted blouse', garment: 'top',
    shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'crew', sleeveStyle: 'straight',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    frontPlacket: true, collarType: 1 /* stand */, collarEdge: 0, patch: '1.7', drawnBy: 'the collar family and the button placket', photos: 1 },

  { slug: 'back-tie-shift-mini-dress', style: 'Back-tie shift mini dress', garment: 'dress',
    shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'straight', skirtLength: 'mini', topLength: 'hip',
    tie: 2 /* backWaistBow */, patch: '1.4', drawnBy: 'the fabric back-waist tie', photos: 2 },

  { slug: 'square-neck-back-tie-babydoll-top', style: 'Square-neck back-tie babydoll top', garment: 'top',
    shaping: 'princess', waistline: 'empire', fabric: 'woven', neckline: 'square', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    tie: 4 /* tieBack */, patch: '1.4', drawnBy: 'the fabric back tie', photos: 1 },

  { slug: 'empire-waist-tie-back-dress', style: 'Empire-waist tie-back dress', garment: 'dress',
    shaping: 'princess', waistline: 'empire', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'midi', topLength: 'hip',
    tie: 2 /* backWaistBow */, gatherType: 2 /* shirred */, gatherZone: 1 /* bust */,
    patch: '1.9', drawnBy: 'the gathered bust panel and the back-waist bow', photos: 3 },

  { slug: 'square-neck-drawstring-babydoll-dress', style: 'Square-neck drawstring babydoll dress', garment: 'dress',
    shaping: 'dart', waistline: 'empire', fabric: 'woven', neckline: 'square', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'mini', topLength: 'hip',
    gatherType: 1 /* drawstring */, gatherZone: 1 /* bust */, patch: '1.8', drawnBy: 'the front bust drawstring gather', photos: 1 },

  { slug: 'open-back-princess-mini-dress', style: 'Open-back princess mini dress', garment: 'dress',
    shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'square', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    backOpening: 1 /* round */, patch: '2.0', drawnBy: 'the shaped open-back cutout', photos: 1 },

  { slug: 'open-back-tie-back-mini-dress', style: 'Open-back tie-back mini dress', garment: 'dress',
    shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    backOpening: 1 /* round */, tie: 2 /* backWaistBow coexists */, patch: '2.0', drawnBy: 'the open-back cutout with a tie-back closure', photos: 3 },

  { slug: 'peter-pan-collar-puff-sleeve-babydoll-dress', style: 'Peter-pan collar puff-sleeve babydoll dress', garment: 'dress',
    shaping: 'princess', waistline: 'empire', fabric: 'woven', neckline: 'crew', sleeveStyle: 'straight',
    sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'midi', topLength: 'hip',
    collarType: 4 /* peterPan */, collarEdge: 0 /* round */, sleeveCap: 2 /* puffed */,
    gatherType: 3 /* smocked */, gatherZone: 0 /* neck yoke */, patch: '1.8',
    drawnBy: 'the peter-pan collar, the puff sleeve head and the smocked yoke', photos: 2 },
];

const svgDoc = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" ` +
  `width="100%" role="img"><rect width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#fff"/>${inner}</svg>`;

const engine = await createEngine();
const meta = [];
for (const s of PATTERNS) {
  const out = JSON.parse(engine.draftJSON(
    s.garment, s.shaping, s.waistline, s.fabric, s.neckline, s.sleeveStyle, s.sleeveLength,
    s.skirtStyle, s.skirtLength, s.topLength, false, 1, false,
    BODY.bust, BODY.waist, BODY.hip, BODY.shoulder, BODY.backLength, BODY.armLength, BODY.neck, 0,
    s.frontPlacket === true, s.tie || 0, s.sleeveCap || 0, s.collarType || 0, s.collarEdge || 0,
    s.gatherType || 0, s.gatherZone || 0, s.backOpening || 0));
  if (out.error) { console.log(s.slug, 'ERROR', out.error); continue; }
  const p = out.pattern;

  // Lay every drafted piece out on one nested strip (3-wide, mm units).
  const dims = p.pieces.map((pc) => {
    const b = bounds(pc);
    return { p: pc, b, w: b.maxX - b.minX, h: b.maxY - b.minY };
  });
  // Pick the strip width (in 190 mm columns) that gives the SQUAREST layout, so
  // the thumbnail reads well in the gallery grid instead of a tall ribbon.
  const minCols = Math.max(1, Math.ceil((Math.max(...dims.map((d) => d.w)) + 1) / 190));
  let layout = null;
  let bestScore = Infinity;
  for (let c = minCols; c <= minCols + 5; c++) {
    const l = shelfPack(dims.map((d) => ({ ...d })), c);
    const ratio = l.stripW / l.stripH;
    const score = Math.abs(Math.log(ratio / 1.15)); // target ~1.15:1 landscape
    if (score < bestScore) { bestScore = score; layout = l; }
  }

  let inner = '';
  for (const d of layout.placed) {
    const off = `translate(${d.ox.toFixed(1)} ${d.oy.toFixed(1)})`;
    const pc = d.p;
    // seam-allowance cut line (outer, dashed) then the sewing line (solid).
    if (pc.cutLine && pc.cutLine.length) {
      inner += `<path transform="${off}" d="${pathD(pc.cutLine, 1)}" fill="none" ` +
        `stroke="#8fbfe8" stroke-width="1.1" stroke-dasharray="5 4"/>`;
    }
    inner += `<path transform="${off}" d="${pathD(pc.commands, 1)}" fill="rgba(63,116,168,.06)" ` +
      `stroke="#1f3a5f" stroke-width="1.4"/>`;
    if (pc.markings && pc.markings.length) {
      inner += `<path transform="${off}" d="${pathD(pc.markings, 1)}" fill="none" ` +
        `stroke="#3f74a8" stroke-width="0.8" stroke-dasharray="3 3"/>`;
    }
    if (pc.grainline) {
      const g = pc.grainline;
      inner += `<line transform="${off}" x1="${g.fromX.toFixed(1)}" y1="${g.fromY.toFixed(1)}" ` +
        `x2="${g.toX.toFixed(1)}" y2="${g.toY.toFixed(1)}" stroke="#3f74a8" stroke-width="0.9"/>`;
    }
    // piece label at its top-left.
    inner += `<text transform="${off}" x="${(d.b.minX + 4).toFixed(1)}" y="${(d.b.minY + 14).toFixed(1)}" ` +
      `font-family="Helvetica,Arial,sans-serif" font-size="11" fill="#1f3a5f">${pc.name}</text>`;
  }
  const W = layout.stripW;
  const H = layout.stripH;
  writeFileSync(join(OUT, `${s.slug}.svg`), svgDoc(W, H, inner));
  meta.push({ slug: s.slug, style: s.style, pieces: p.pieces.length,
    pieceNames: p.pieces.map((x) => x.name), fabric: p.fabricMeters140,
    garment: s.garment, patch: s.patch, drawnBy: s.drawnBy, photos: s.photos });
  console.log(`${s.slug}: ${p.pieces.length} pieces, ${p.fabricMeters140} m`);
}
writeFileSync(join(OUT, 'meta.json'), JSON.stringify(meta, null, 2));
console.log(`\n${meta.length} patterns rendered -> ${OUT}`);
