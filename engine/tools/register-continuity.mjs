// register-continuity.mjs — programmatic proof that the A4 register system is
// CONTINUOUS across neighbouring pages, in millimeters. Reads the SAME sheet.js
// markup the product prints, extracts every register mark's absolute strip
// coordinate, and asserts that a mark on one page's shared edge lands on the
// exact same strip point as its partner on the neighbour. If the corner squares
// and edge ticks do not meet when taped, this fails LOUD with the mm offset.
//
//   run: node engine/tools/register-continuity.mjs
// Exit 0 = every neighbour pair aligned to < TOL mm. Exit 1 = a real seam bug.
import { createRequire } from 'module';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const createEngine = require(join(here, '../dist/stitchu-engine.js'));
const sheet = await import(join(here, '../../web/js/sheet.js'));
const { PAGE_W, PAGE_H, packPieces, usedCells, sheetInner, sheetCode, bounds } = sheet;

const TOL = 0.01; // mm — tighter than a printer can hold; marks are computed, not measured.
const BODY = { bust: 90, waist: 72, hip: 98, shoulder: 38, backLength: 40, armLength: 58, neck: 36 };

// The Jackie-like spec (back-waist tie dress) Damla printed, plus a few multi-
// column / multi-row cases so continuity is proven across both axes.
const SPECS = [
  { name: 'jackie-back-waist-tie-dress', garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'boat', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'straight', skirtLength: 'mini',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, tie: 2 },
  { name: 'smocked-yoke-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, gatherType: 3, gatherZone: 0 },
  { name: 'puff-sleeve-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'scoop', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, sleeveCap: 2 },
  { name: 'slit-straight-skirt', garment: 'skirt', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'straight', skirtLength: 'maxi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, backSlit: 2 },
];

function draft(s) {
  const out = JSON.parse(engine.draftJSON({
    garment: s.garment, shaping: s.shaping, waistline: s.waistline, fabric: s.fabric,
    neckline: s.neckline, sleeveStyle: s.sleeveStyle, sleeveLength: s.sleeveLength,
    skirtStyle: s.skirtStyle, skirtLength: s.skirtLength, topLength: s.topLength,
    ruffleHem: s.ruffle, ruffleTiers: s.tiers, keyhole: s.keyhole,
    frontPlacket: s.frontPlacket === true, tieClosure: s.tie || 0, sleeveCap: s.sleeveCap || 0,
    collarType: s.collarType || 0, collarEdge: s.collarEdge || 0,
    gatherType: s.gatherType || 0, gatherZone: s.gatherZone || 0, backOpening: s.backOpening || 0,
    backSlit: s.backSlit || 0,
  }, { bust: BODY.bust, waist: BODY.waist, hip: BODY.hip, shoulder: BODY.shoulder, backLength: BODY.backLength, armLength: BODY.armLength, neck: BODY.neck }));
  return out;
}

// --- tiny SVG mark extractors (regex over the exact strings sheet.js emits) ---
function extractCornerSquares(svg) {
  const out = [];
  const re = /<rect x="([\-\d.]+)" y="([\-\d.]+)" width="9" height="9" fill="#111"\/>/g;
  let m; while ((m = re.exec(svg))) out.push({ cx: +m[1] + 4.5, cy: +m[2] + 4.5 });
  return out; // center of each square in strip coords
}
function extractTicks(svg, x0, y0) {
  const out = [];
  const re = /<line x1="([\-\d.]+)" y1="([\-\d.]+)" x2="([\-\d.]+)" y2="([\-\d.]+)" stroke="#111" stroke-width="0\.5"\/>/g;
  let m; while ((m = re.exec(svg))) {
    const [x1, y1, x2, y2] = [+m[1], +m[2], +m[3], +m[4]];
    if (Math.abs(y1 - y2) < 1e-6) { // horizontal tick -> left or right edge, at strip-Y y1
      const atLeft = Math.abs(Math.min(x1, x2) - x0) < 1e-6;
      const atRight = Math.abs(Math.max(x1, x2) - (x0 + PAGE_W)) < 1e-6;
      if (atLeft) out.push({ edge: 'L', pos: y1 });
      if (atRight) out.push({ edge: 'R', pos: y1 });
    } else if (Math.abs(x1 - x2) < 1e-6) { // vertical tick -> top or bottom edge, at strip-X x1
      const atTop = Math.abs(Math.min(y1, y2) - y0) < 1e-6;
      const atBottom = Math.abs(Math.max(y1, y2) - (y0 + PAGE_H)) < 1e-6;
      if (atTop) out.push({ edge: 'T', pos: x1 });
      if (atBottom) out.push({ edge: 'B', pos: x1 });
    }
  }
  return out;
}

const engine = await createEngine();
const isChalk = (p) => p.name.includes('Ruffle') || p.name.includes('Bias binding');
let failures = 0, pairChecks = 0;

for (const s of SPECS) {
  let cornerChecks = 0, tickChecks = 0, pieceChecks = 0;
  const out = draft(s);
  if (out.error) { console.log(`${s.name}: DRAFT ERROR ${out.error}`); failures++; continue; }
  const p = out.pattern;
  const paper = p.pieces.filter((x) => !isChalk(x));
  const layout = packPieces(paper.length ? paper : p.pieces);
  const { sheets, used } = usedCells(layout);
  const key = (r, c) => `${r},${c}`;
  const cell = new Map();
  for (const { col, row } of sheets) {
    const svg = sheetInner(layout, col, row, used);
    cell.set(key(row, col), {
      col, row,
      squares: extractCornerSquares(svg),
      ticks: extractTicks(svg, col * PAGE_W, row * PAGE_H),
    });
  }
  const near = (arr, val) => arr.some((v) => Math.abs(v - val) < TOL);

  for (const { col, row } of sheets) { // horizontal neighbours
    const a = cell.get(key(row, col)); const b = cell.get(key(row, col + 1));
    if (!b) continue; pairChecks++;
    const edgeX = (col + 1) * PAGE_W;
    const aR = a.ticks.filter((t) => t.edge === 'R').map((t) => t.pos);
    const bL = b.ticks.filter((t) => t.edge === 'L').map((t) => t.pos);
    for (const y of aR) { tickChecks++; if (!near(bL, y)) { failures++; console.log(`  ${s.name} ${sheetCode(row, col)}|${sheetCode(row, col + 1)} tick Y=${y.toFixed(3)} A-right no B-left partner`); } }
    for (const y of bL) if (!near(aR, y)) { failures++; console.log(`  ${s.name} ${sheetCode(row, col)}|${sheetCode(row, col + 1)} tick Y=${y.toFixed(3)} B-left no A-right partner`); }
    for (const cy of [row * PAGE_H, (row + 1) * PAGE_H]) {
      const aHas = a.squares.some((q) => Math.abs(q.cx - edgeX) < TOL && Math.abs(q.cy - cy) < TOL);
      const bHas = b.squares.some((q) => Math.abs(q.cx - edgeX) < TOL && Math.abs(q.cy - cy) < TOL);
      cornerChecks++;
      if (aHas !== bHas) { failures++; console.log(`  ${s.name} corner (${edgeX},${cy}) A=${aHas} B=${bHas} — square won't complete`); }
    }
  }
  for (const { col, row } of sheets) { // vertical neighbours
    const a = cell.get(key(row, col)); const b = cell.get(key(row + 1, col));
    if (!b) continue; pairChecks++;
    const edgeY = (row + 1) * PAGE_H;
    const aB = a.ticks.filter((t) => t.edge === 'B').map((t) => t.pos);
    const bT = b.ticks.filter((t) => t.edge === 'T').map((t) => t.pos);
    for (const x of aB) { tickChecks++; if (!near(bT, x)) { failures++; console.log(`  ${s.name} ${sheetCode(row, col)}/${sheetCode(row + 1, col)} tick X=${x.toFixed(3)} A-bottom no B-top partner`); } }
    for (const x of bT) if (!near(aB, x)) { failures++; console.log(`  ${s.name} ${sheetCode(row, col)}/${sheetCode(row + 1, col)} tick X=${x.toFixed(3)} B-top no A-bottom partner`); }
    for (const cx of [col * PAGE_W, (col + 1) * PAGE_W]) {
      const aHas = a.squares.some((q) => Math.abs(q.cx - cx) < TOL && Math.abs(q.cy - edgeY) < TOL);
      const bHas = b.squares.some((q) => Math.abs(q.cx - cx) < TOL && Math.abs(q.cy - edgeY) < TOL);
      cornerChecks++;
      if (aHas !== bHas) { failures++; console.log(`  ${s.name} corner (${cx},${edgeY}) A=${aHas} B=${bHas} — square won't complete`); }
    }
  }
  for (const d of layout.placed) { // piece never clipped off the printed set
    // footprint bbox in strip coords = the piece placement rectangle (rotation
    // aware): x0/y0 top-left, w/h the chosen-orientation footprint.
    const sx0 = d.x0, sx1 = d.x0 + d.w, sy0 = d.y0, sy1 = d.y0 + d.h;
    const c0 = Math.floor(sx0 / PAGE_W), c1 = Math.floor((sx1 - 1e-6) / PAGE_W);
    const r0 = Math.floor(sy0 / PAGE_H), r1 = Math.floor((sy1 - 1e-6) / PAGE_H);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      pieceChecks++;
      if (!used.has(key(r, c))) { failures++; console.log(`  ${s.name} piece "${d.p.name}" covers ${sheetCode(r, c)} but NOT printed (clipped)`); }
    }
  }
  console.log(`${s.name}: ${sheets.length} sheets, ${layout.cols} cols — corners ${cornerChecks}, ticks ${tickChecks}, pieceCells ${pieceChecks}`);
}

console.log(`\nneighbour pairs checked: ${pairChecks}`);
if (failures) { console.log(`CONTINUITY FAIL: ${failures} mismatch(es)`); process.exit(1); }
console.log('CONTINUITY OK: every shared edge mark aligns < 0.01 mm, no piece clipped');
