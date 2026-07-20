#!/usr/bin/env node
// full-scan-27.mjs — READ-ONLY analysis. Runs the 27 FULL specs (from the latest
// benchmark results-*.json) through the REAL engine via the SAME mapVisionSpec
// bridge benchmark-58.mjs uses, then measures each drafted pattern the way
// precision-report.js does: sewn edge-pair Δmm, sleeve cap ease, facing match,
// piece count, A4 page count. Does NOT touch the engine, golden, or any output.
//   node engine/tools/full-scan-27.mjs
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { canonical, enumInt } from '../../web/js/vocab.gen.js';
import {
  pickGather, pickTiePlacement, pickCollar, pickBackOpening, pickHemSlit,
  pickRuffledStraps, pickPeplum, pickPocket, pickCuff, pickHemShape,
  pickPlacket, pickBackDetail, pickExposedZip, pickBardot,
} from '../../web/js/vision-bridge.js';
import { CONTRACT } from '../../web/js/contract.gen.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const require2 = createRequire(import.meta.url);
const engine = await require2(join(root, 'engine', 'dist', 'stitchu-engine.js'))();

const RESULTS = join(root, 'benchmark-58', 'results-2026-07-18.json');
const data = JSON.parse(readFileSync(RESULTS, 'utf8'));

const SLEEVE_CAP_MAP = Object.fromEntries(
  Object.entries(CONTRACT.mappings.sleeveHeadToSleeveCap)
    .map(([w, e]) => [w, enumInt('sleeveCap', e)]),
);

// EXACT copy of benchmark-58.mjs mapVisionSpec (bridge behavior).
function mapVisionSpec(seen) {
  const fieldMisses = [];
  const str = (field, dflt) => {
    const v = seen[field];
    if (v === undefined || v === null || v === '') return dflt;
    const c = canonical(field, v) ?? canonical(field, String(v).toLowerCase());
    if (c === undefined) { fieldMisses.push(`${field}='${v}'`); return dflt; }
    return c;
  };
  const o = {
    garment: str('garment', 'dress'), shaping: str('shaping', 'dart'),
    waistline: str('waistline', 'natural'), fabric: str('fabric', 'woven'),
    neckline: str('neckline', 'crew'), sleeveStyle: str('sleeveStyle', 'none'),
    sleeveLength: str('sleeveLength', 'short'), skirtStyle: str('skirtStyle', 'aLine'),
    skirtLength: str('skirtLength', 'midi'), topLength: str('topLength', 'hip'),
  };
  if (seen.sleeveHead) {
    const cap = SLEEVE_CAP_MAP[String(seen.sleeveHead).toLowerCase()];
    if (cap) { o.sleeveCap = cap; if (o.sleeveStyle === 'none' && cap !== 3) o.sleeveStyle = 'straight'; if (cap === 3) o.sleeveStyle = 'straight'; }
  }
  const iv = (field, name) => (name ? Math.max(0, enumInt(field, name)) : 0);
  o.tieClosure = iv('tieClosure', pickTiePlacement(seen));
  const collar = pickCollar(seen);
  if (collar) { o.collarType = iv('collarType', collar.type); o.collarEdge = iv('collarEdge', collar.edge); }
  const gather = pickGather(seen);
  if (gather) { o.gatherType = iv('gatherType', gather.type); o.gatherZone = iv('gatherZone', gather.zone); }
  o.backOpening = iv('backOpening', pickBackOpening(seen));
  o.backSlit = iv('backSlit', pickHemSlit(seen));
  if (o.sleeveStyle === 'none' && o.neckline !== 'halter') o.ruffledStraps = iv('ruffledStraps', pickRuffledStraps(seen));
  o.peplum = iv('peplum', pickPeplum(seen));
  o.pocketStyle = iv('pocketStyle', pickPocket(seen));
  if (o.sleeveStyle === 'straight') o.cuffStyle = iv('cuffStyle', pickCuff(seen));
  o.hemShape = iv('hemShape', pickHemShape(seen));
  const frontButtons = !!(seen.closure && ['buttons', 'placket'].includes(seen.closure.type));
  o.placketStyle = iv('placketStyle', pickPlacket(seen, frontButtons));
  if (!o.placketStyle && frontButtons) o.frontPlacket = true;
  o.backDetail = iv('backDetail', pickBackDetail(seen));
  o.exposedZip = iv('exposedZip', pickExposedZip(seen));
  if (o.shaping === 'dart' && o.neckline !== 'halter') o.bardotStyle = iv('bardotStyle', pickBardot(seen));
  return { mapped: o, fieldMisses };
}

// ---- geometry measurement (from precision-report.js) ----
function flat(cmds) {
  const pts = []; let cur = null, start = null;
  for (const c of cmds) {
    if (c.type === 'move') { cur = [c.x, c.y]; start = cur; pts.push({ p: cur, cmd: c }); }
    else if (c.type === 'line') { pts.push({ p: [c.x, c.y], from: cur, cmd: c }); cur = [c.x, c.y]; }
    else if (c.type === 'curve') {
      const seg = [];
      for (let i = 1; i <= 24; i++) {
        const t = i / 24, mt = 1 - t;
        seg.push([mt*mt*mt*cur[0] + 3*mt*mt*t*c.cp1x + 3*mt*t*t*c.cp2x + t*t*t*c.x,
                  mt*mt*mt*cur[1] + 3*mt*mt*t*c.cp1y + 3*mt*t*t*c.cp2y + t*t*t*c.y]);
      }
      pts.push({ p: [c.x, c.y], from: cur, seg, cmd: c }); cur = [c.x, c.y];
    } else if (c.type === 'close') { pts.push({ p: start, from: cur, cmd: c }); cur = start; }
  }
  return pts;
}
function segLen(entry) {
  if (!entry || !entry.from) return 0;
  if (entry.seg) { let L = 0, prev = entry.from; for (const q of entry.seg) { L += Math.hypot(q[0]-prev[0], q[1]-prev[1]); prev = q; } return L; }
  return Math.hypot(entry.p[0]-entry.from[0], entry.p[1]-entry.from[1]);
}
function cmdLen(cmds, i) { const f = flat(cmds); return i < f.length ? segLen(f[i]) : 0; }

// A4 page count via bounding boxes (printable 180x267mm, matches print pipeline band).
function pageCount(pieces) {
  const A4W = 180, A4H = 267;
  let totalArea = 0;
  for (const p of pieces) {
    const f = flat(p.commands);
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (const e of f) {
      const pts = e.seg ? [e.p, ...e.seg] : [e.p];
      for (const q of pts) { if (!q) continue; minx = Math.min(minx, q[0]); miny = Math.min(miny, q[1]); maxx = Math.max(maxx, q[0]); maxy = Math.max(maxy, q[1]); }
    }
    if (minx === Infinity) continue;
    totalArea += (maxx - minx) * (maxy - miny);
  }
  // rough lower bound; report as "area pages" (bbox-sum / A4). Real packer differs.
  return Math.ceil(totalArea / (A4W * A4H));
}

const body = { bust: 90, waist: 72, hip: 98, shoulder: 38, backLength: 40, armLength: 58, neck: 36 };

const rows = [];
for (const [file, v] of Object.entries(data)) {
  if (!v || v.cls !== 'FULL') continue;
  const { mapped, fieldMisses } = mapVisionSpec(v.spec);
  let out;
  try { out = JSON.parse(engine.draftJSON(mapped, body)); }
  catch (e) { rows.push({ name: v.name, err: 'engine threw: ' + String(e).slice(0, 80) }); continue; }
  if (out.error) { rows.push({ name: v.name, err: 'refused: ' + out.error }); continue; }
  if (out.issues && out.issues.length) { rows.push({ name: v.name, err: 'validator: ' + out.issues[0] }); continue; }

  const P = out.pattern.pieces;
  const g = (n) => P.find(x => x.name === n);
  const gi = (sub) => P.find(x => x.name.includes(sub));
  const r = { name: v.name, pieces: P.length, pieceNames: P.map(x => x.name), garment: mapped.garment, spec: mapped, pairs: {}, worst: 0, ease: null };
  const record = (label, a, b) => { if (a == null || b == null) return; const d = Math.abs(a - b); r.pairs[label] = { a: +a.toFixed(2), b: +b.toFixed(2), d: +d.toFixed(2) }; r.worst = Math.max(r.worst, d); };

  const cf = g('Bodice Center Front') || g('Bodice Front') || g('Top Front');
  const cb = g('Bodice Center Back') || g('Bodice Back') || g('Top Back');
  const sf = g('Bodice Side Front');
  const sb = g('Bodice Side Back');
  const halter = mapped.neckline === 'halter';

  if (!halter && cf && cb) record('shoulder F/B', cmdLen(cf.commands, 2), cmdLen(cb.commands, 2));
  const sfl = sf ? cmdLen(sf.commands, 2) : cf ? cmdLen(cf.commands, 4) : null;
  const sbl = sb ? cmdLen(sb.commands, 2) : cb ? cmdLen(cb.commands, 4) : null;
  record('side seam F/B', sfl, sbl);
  for (const [half, c, s] of [['front', cf, sf], ['back', cb, sb]]) {
    if (!c || !s) continue;
    const center = cmdLen(c.commands, 4) + cmdLen(c.commands, 5);
    const side = cmdLen(s.commands, 4) + cmdLen(s.commands, 5);
    record('princess ' + half, center, side);
  }
  const skCF = g('Skirt Center Front');
  if (skCF && cf) record('waist F', cmdLen(cf.commands, 6), cmdLen(skCF.commands, 1));
  const skCB = g('Skirt Center Back');
  if (skCB && cb) record('waist B', cmdLen(cb.commands, 6), cmdLen(skCB.commands, 1));
  const facing = g('Front Neck Facing');
  if (facing && cf && !halter) record('facing/neck', cmdLen(facing.commands, 1), cmdLen(cf.commands, 1));

  // sleeve cap ease window
  const sleeve = P.find(x => x.name.includes('Sleeve') && !x.name.includes('Cuff'));
  if (sleeve && cf) {
    const cap = cmdLen(sleeve.commands, 1) + cmdLen(sleeve.commands, 2);
    let armhole = cmdLen(cf.commands, 3);
    if (sf) armhole += cmdLen(sf.commands, 1);
    if (cb) armhole += cmdLen(cb.commands, 3);
    if (sb) armhole += cmdLen(sb.commands, 1);
    if (cap > 0 && armhole > 0) r.ease = +((cap / armhole - 1) * 100).toFixed(1);
  }
  r.areaPages = pageCount(P);
  r.fieldMisses = fieldMisses;
  rows.push(r);
}

// print
console.log('\n=== 27 FULL SCAN ===\n');
for (const r of rows) {
  if (r.err) { console.log(`✗ ${r.name}\n    ${r.err}\n`); continue; }
  const pairsStr = Object.entries(r.pairs).map(([k, x]) => `${k} Δ${x.d}`).join('  ');
  console.log(`• ${r.name}`);
  console.log(`    garment=${r.garment} pieces=${r.pieces} areaPages=${r.areaPages} worstΔ=${r.worst.toFixed(2)}mm ease=${r.ease}%`);
  console.log(`    pairs: ${pairsStr || '(none)'}`);
  if (r.fieldMisses.length) console.log(`    fieldMisses: ${r.fieldMisses.join(', ')}`);
  console.log('');
}
console.log(JSON.stringify(rows, null, 0));
