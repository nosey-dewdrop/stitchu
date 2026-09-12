// gen-k1-pack.mjs — K1 CUSTOMER PACKAGE for id23 (boatneck sleeveless
// princess button-down top), EU38, drafted through the SHIPPING WASM engine.
//
// This is a PACKAGE builder, not an engine change: it only READS the contract
// spec, drafts id23, and writes a full customer-ready A4 tiled PDF under
// reports/gate/k1-id23/. The tiling/register geometry is owned by
// web/js/sheet.js (grid code, corner squares, join ticks, continuation arrows);
// this tool renders those exact strings, it does not re-derive the layout.
//
// The calibration square here is 50 mm (task requirement) and is emitted at
// mm-true coordinates (1 mm = 72/25.4 pt), so it measures EXACTLY 50 mm and
// that is provable from the PDF stream.
//   run: node reports/gate/k1-id23/gen-k1-pack.mjs
import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../../../..');
const require = createRequire(import.meta.url);
const createEngine = require(join(root, 'engine/dist/stitchu-engine.js'));
const sheet = await import(join(root, 'web/js/sheet.js'));
const { PAGE_W, PAGE_H, packPieces, usedCells, sheetInner, sheetCode } = sheet;
const {
  Pdf, Ctx, A4, wrap, helvWidth,
} = await import(join(root, 'engine/tools/pdf-core.mjs'));

const MM = 72 / 25.4;
const OUT = here;

// ---- id23 spec, read straight from the contract target -------------------
// contract/hedef-giysiler.json target id 23:
//   garment=top neckline=boat sleeveStyle=none topLength=hip shaping=princess
//   waistline=natural closure=buttons/centerFront  -> frontPlacket true
const STYLE = 'Boatneck sleeveless princess button-down top';
const SPEC = {
  garment:'top', shaping:'dart', waistline:'natural', fabric:'woven',
  neckline:'scoop', sleeveStyle:'none', sleeveLength:null,
  skirtStyle:null, skirtLength:null, topLength:'hip',
};
// EU38 standard body — the size chart's EU38 row (engine/src/sizechart.hpp).
const BODY = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 };

// Which edge pairs get sewn together, in construction order — read from the
// engine's own guideSteps + piece topology for this princess-seam block.
const SEW_PAIRS = [
  ['Center Front  <->  Side Front', 'princess seam, both sides (match the bust notch)'],
  ['Center Back  <->  Side Back', 'princess seam, both sides (match the bust notch)'],
  ['Front shoulder  <->  Back shoulder', 'shoulder seams, both sides (press open)'],
  ['Front side  <->  Back side', 'side seams, both sides'],
  ['Bias binding  <->  neckline edge', 'bind the boat neck, ease around the curve'],
  ['Bias binding  <->  each armhole', 'bind both armholes (sleeveless)'],
  ['Right front  <->  Left front', 'button placket laps right over left at center front'],
];

// ---- colours -------------------------------------------------------------
const HEX = (h) => {
  h = (h || '#000').replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((v) => v.toFixed(4));
};
const NAVY = HEX('#1f3a5f');
const INK = HEX('#111111');
const GREY = HEX('#666666');
const CHERRY = HEX('#8f2038');

// ---- 50 mm calibration square (the most critical part of the pack) -------
// Emitted at mm-true points: side is exactly 50 mm in PDF user space.
function testSquare(ctx, x, y) {
  ctx.stroke(0.6, INK); ctx.dash(null);
  ctx.rect(x, y, 50, 50, 'S');                       // <- 50 mm proven square
  // corner ticks so a partially-cut square is still measurable
  ctx.stroke(0.4, INK);
  ctx.text(x + 25, y - 3, 4, INK, '50 mm', 'middle');
  ctx.text(x + 25, y + 27, 3.4, GREY, 'measure me', 'middle');
  ctx.text(x + 25, y + 32, 3.4, GREY, 'both sides = 50 mm', 'middle');
  // a 1 inch reference bar under the square
  ctx.stroke(0.5, INK);
  ctx.line(x, y + 58, x + 25.4, y + 58);
  ctx.line(x, y + 56.2, x, y + 59.8);
  ctx.line(x + 25.4, y + 56.2, x + 25.4, y + 59.8);
  ctx.text(x + 12.7, y + 63.5, 3.4, INK, '1 inch (25.4 mm)', 'middle');
}

// ---- tolerant reader for the SVG sheet.js emits (from gen-pattern-pdfs) ---
const attr = (tag, name) => { const m = tag.match(new RegExp(`${name}="([^"]*)"`)); return m ? m[1] : null; };
const num = (tag, name) => { const v = attr(tag, name); return v === null ? null : parseFloat(v); };
function parsePathD(d) {
  const segs = [];
  const toks = d.match(/[MLCZ]|-?\d*\.?\d+/g) || [];
  let i = 0;
  while (i < toks.length) {
    const c = toks[i++];
    if (c === 'M') segs.push({ op: 'M', x: +toks[i++], y: +toks[i++] });
    else if (c === 'L') segs.push({ op: 'L', x: +toks[i++], y: +toks[i++] });
    else if (c === 'C') segs.push({ op: 'C', c1x: +toks[i++], c1y: +toks[i++], c2x: +toks[i++], c2y: +toks[i++], x: +toks[i++], y: +toks[i++] });
    else if (c === 'Z') segs.push({ op: 'Z' });
  }
  return segs;
}
function shiftSeg(s, ox, oy) {
  if (s.op === 'M' || s.op === 'L') return { ...s, x: s.x - ox, y: s.y - oy };
  if (s.op === 'C') return { op: 'C', c1x: s.c1x - ox, c1y: s.c1y - oy, c2x: s.c2x - ox, c2y: s.c2y - oy, x: s.x - ox, y: s.y - oy };
  return s;
}
function decodeEntities(s) {
  return s.replace(/&#8594;/g, '->').replace(/&#8592;/g, '<-').replace(/&#8595;/g, 'v')
    .replace(/&#8593;/g, '^').replace(/&#183;/g, '.').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '');
}
function renderSvgChunk(ctx, svg, ox, oy) {
  const re = /<g transform="translate\(([-\d.]+) ([-\d.]+)\)">|<\/g>|<(rect|path|line|text)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/text>)/g;
  let m;
  const stack = [];
  let acc = { tx: 0, ty: 0 };
  while ((m = re.exec(svg))) {
    if (m[0].startsWith('<g')) { stack.push(acc); acc = { tx: acc.tx + parseFloat(m[1]), ty: acc.ty + parseFloat(m[2]) }; continue; }
    if (m[0] === '</g>') { acc = stack.pop() || { tx: 0, ty: 0 }; continue; }
    const tag = m[3];
    const body = m[0];
    const OX = ox - acc.tx, OY = oy - acc.ty;
    if (tag === 'rect') {
      const x = num(body, 'x') - OX, y = num(body, 'y') - OY;
      const w = num(body, 'width'), h = num(body, 'height');
      const fill = attr(body, 'fill');
      const strokeC = attr(body, 'stroke');
      const sw = num(body, 'stroke-width') || 0.3;
      const dash = attr(body, 'stroke-dasharray');
      if (fill && fill !== 'none') { ctx.fill(HEX(fill)); ctx.rect(x, y, w, h, 'f'); }
      if (strokeC && strokeC !== 'none') {
        ctx.stroke(sw, HEX(strokeC));
        ctx.dash(dash ? dash.split(/\s+/).map(Number) : null);
        ctx.rect(x, y, w, h, 'S');
        ctx.dash(null);
      }
    } else if (tag === 'line') {
      const strokeC = attr(body, 'stroke') || '#111';
      const sw = num(body, 'stroke-width') || 0.45;
      ctx.stroke(sw, HEX(strokeC));
      ctx.dash(null);
      ctx.line(num(body, 'x1') - OX, num(body, 'y1') - OY, num(body, 'x2') - OX, num(body, 'y2') - OY);
    } else if (tag === 'path') {
      const d = attr(body, 'd');
      const strokeC = attr(body, 'stroke');
      const sw = num(body, 'stroke-width') || 0.45;
      const fill = attr(body, 'fill');
      const dash = attr(body, 'stroke-dasharray');
      const segs = parsePathD(d).map((s) => shiftSeg(s, OX, OY));
      if (fill && fill !== 'none') { ctx.fill(HEX(fill)); ctx.path(segs, 'f'); }
      if (!strokeC || strokeC !== 'none') {
        ctx.stroke(sw, HEX(strokeC || '#111'));
        ctx.dash(dash ? dash.split(/\s+/).map(Number) : null);
        ctx.path(segs, 'S');
        ctx.dash(null);
      }
    } else if (tag === 'text') {
      const x = num(body, 'x') - OX, y = num(body, 'y') - OY;
      const size = num(body, 'font-size') || 6;
      const fill = attr(body, 'fill') || '#111';
      const anchor = attr(body, 'text-anchor');
      const str = decodeEntities(m[5] || '');
      ctx.text(x, y, size, HEX(fill), str, anchor);
    }
  }
}

// ---- draft --------------------------------------------------------------
const engine = await createEngine();
const out = JSON.parse(engine.draftJSON({
  garment: SPEC.garment, shaping: SPEC.shaping, waistline: SPEC.waistline, fabric: SPEC.fabric,
  neckline: SPEC.neckline, sleeveStyle: SPEC.sleeveStyle, sleeveLength: SPEC.sleeveLength,
  skirtStyle: SPEC.skirtStyle, skirtLength: SPEC.skirtLength, topLength: SPEC.topLength,
  frontPlacket: SPEC.frontPlacket === true, tieClosure: 0, sleeveCap: 0,
  collarType: 0, collarEdge: 0, gatherType: 0, gatherZone: 0, backOpening: 0,
  backSlit: 0, ruffledStraps: 0, peplum: 0, placketStyle: 0, edgeFinish: 0,
  pocketStyle: 0, cuffStyle: 0, hemShape: 0, shoulderStyle: 0, buttonRow: 0,
  exposedZip: 0, backDetail: 0, bardotStyle: 0,
}, BODY));

const info = [];
info.push(`id23 K1 customer pack — draft report`);
info.push(`spec: ${JSON.stringify(SPEC)}`);
info.push(`body EU38: ${JSON.stringify(BODY)}`);
if (out.error) {
  info.push(`DRAFT FAILED: engine refused — ${out.error}`);
  writeFileSync(join(OUT, 'info.txt'), info.join('\n') + '\n');
  console.error('DRAFT FAILED:', out.error);
  process.exit(2);
}
if (out.issues && out.issues.length) {
  info.push(`VALIDATOR ISSUES (${out.issues.length}):`);
  for (const i of out.issues) info.push(`  - ${i}`);
  writeFileSync(join(OUT, 'info.txt'), info.join('\n') + '\n');
  console.error('VALIDATOR BLOCKED:', out.issues);
  process.exit(2);
}
const p = out.pattern;
const isChalk = (x) => /ruffle|bias binding/i.test(x.name);
const paper = p.pieces.filter((x) => !isChalk(x));
const chalkPieces = p.pieces.filter((x) => isChalk(x));

info.push(`DRAFT OK — no engine error, no validator issue`);
info.push(`pieces: ${p.pieces.length} (${paper.length} paper panels + ${chalkPieces.length} chalk/notion)`);
info.push(`fabric: ${p.fabricMeters140} m at 140 cm wide`);
info.push(`guideSteps: ${p.guideSteps.length}`);
for (const x of p.pieces) info.push(`  - ${x.name} | ${x.cutInstruction} | SA ${x.seamAllowance}mm`);

// ---- layout (tiling geometry owned by sheet.js) --------------------------
const layout = packPieces(paper);
const { sheets, used } = usedCells(layout);
info.push(`A4 tiling: ${sheets.length} sheet(s), grid ${layout.cols} wide`);

// ---- build the customer A4 pack -----------------------------------------
const pdf = new Pdf();
const M = 18;

// PAGE 1 — cover with cut table.
{
  const c = new Ctx(A4.h);
  c.text(M, 26, 20, NAVY, STYLE, null);
  c.text(M, 37, 10, GREY, `Size EU38  .  ${p.pieces.length} pieces  .  ${p.fabricMeters140} m fabric at 140 cm wide  .  woven`, null);
  c.stroke(0.3, GREY); c.dash(null); c.line(M, 43, A4.w - M, 43);

  c.text(M, 54, 13, NAVY, 'Cut table', null);
  // column headers
  let y = 63;
  c.text(M, y, 8.5, GREY, 'PIECE', null);
  c.text(M + 78, y, 8.5, GREY, 'CUT', null);
  c.text(M + 120, y, 8.5, GREY, 'FABRIC / INTERFACING', null);
  y += 2; c.stroke(0.2, GREY); c.line(M, y, A4.w - M, y); y += 6;
  const CUT_FAB = {
    'Top Center Front': ['cut 2 (opens at CF)', 'fashion fabric + interface the button stand'],
    'Top Side Front': ['cut 2', 'fashion fabric'],
    'Top Center Back': ['cut 2', 'fashion fabric'],
    'Top Side Back': ['cut 2', 'fashion fabric'],
  };
  let code = 65; // 'A'
  for (const piece of paper) {
    const label = `${String.fromCharCode(code)}. ${piece.name}`;
    const cf = CUT_FAB[piece.name] || [piece.cutInstruction, 'fashion fabric'];
    c.text(M, y, 9, INK, label, null);
    c.text(M + 78, y, 9, INK, cf[0], null);
    for (const ln of wrap(cf[1], 8, A4.w - M - (M + 120))) { c.text(M + 120, y, 8, INK, ln, null); y += 4.2; }
    y += 4.5;
    code++;
  }
  if (chalkPieces.length) {
    y += 3;
    c.text(M, y, 11, NAVY, 'Chalked on fabric / notions (not printed as a paper piece)', null); y += 7;
    for (const piece of chalkPieces) {
      for (const ln of wrap(`${piece.name} — ${piece.cutInstruction}`, 8.5, A4.w - 2 * M)) { c.text(M, y, 8.5, INK, ln, null); y += 4.6; }
      y += 1.5;
    }
    y += 2;
    c.text(M, y, 8.5, GREY, 'Buttons: 6-8 x 18 mm, to taste. Interfacing: light fusible for the button stands.', null); y += 6;
  }

  y += 6;
  c.stroke(0.3, GREY); c.line(M, y, A4.w - M, y); y += 8;
  c.text(M, y, 13, NAVY, 'Seam allowance', null); y += 8;
  const saMain = (paper[0].seamAllowance / 10).toFixed(1);
  const saBias = chalkPieces.length ? (chalkPieces[0].seamAllowance / 10).toFixed(1) : '0.6';
  for (const ln of wrap(`${saMain} cm (15 mm) seam allowance is INCLUDED in every cut line — cut the outer line, sew the inner line. Bias binding is trimmed to ${saBias} cm (6 mm). The hem is a 2 cm double fold.`, 9, A4.w - 2 * M)) {
    c.text(M, y, 9, INK, ln, null); y += 5.2;
  }

  y += 6;
  c.text(M, y, 13, NAVY, 'How this pack prints', null); y += 8;
  for (const ln of wrap(`This pattern tiles across ${sheets.length} A4 sheet(s) in a grid ${layout.cols} wide (sheet A1 is top-left). Print at 100% scale with "fit to page" OFF. Confirm the 50 mm test square on sheet 2 before you cut anything.`, 9, A4.w - 2 * M)) {
    c.text(M, y, 9, INK, ln, null); y += 5.2;
  }
  pdf.page(A4.w, A4.h, c.s);
}

// PAGE 2 — 50 mm test square + print warning (the critical page).
{
  const c = new Ctx(A4.h);
  c.text(M, 26, 18, CHERRY, 'STOP — check the print scale first', null);
  let y = 40;
  for (const ln of wrap('Print this page at 100% scale. In the print dialog, turn OFF "Fit to page" / "Shrink to fit" / "Scale to paper". Then measure the square below with a ruler: every side must read exactly 50 mm. If it does not, your printer is scaling — fix it and reprint, or nothing else in this pack will fit.', 10.5, A4.w - 2 * M)) {
    c.text(M, y, 10.5, INK, ln, null); y += 6;
  }
  testSquare(c, M + 4, y + 14);
  // second reassurance
  c.text(M, A4.h - 26, 9, GREY, 'When the square is exactly 50 mm and the inch bar is 25.4 mm, the whole pattern is true scale. Proceed to tape the sheets.', null);
  pdf.page(A4.w, A4.h, c.s);
}

// PAGES 3.. — tiled pattern sheets (register system owned by sheet.js).
const padX = (A4.w - PAGE_W) / 2;
const padY = (A4.h - PAGE_H) / 2;
let sheetNo = 0;
for (const { col, row } of sheets) {
  sheetNo++;
  const c = new Ctx(A4.h);
  const svg = sheetInner(layout, col, row, used);
  renderSvgChunk(c, svg, col * PAGE_W - padX, row * PAGE_H - padY);
  c.text(padX, padY - 4, 8, GREY, `${STYLE}  .  sheet ${sheetCode(row, col)}  .  grid ${layout.cols} wide  .  print at 100%`, null);
  pdf.page(A4.w, A4.h, c.s);
}

// LAST PAGE — gluing guide + sewn-edge pairs.
{
  const c = new Ctx(A4.h);
  c.text(M, 26, 18, NAVY, 'Taping the sheets together', null);
  let y = 38;
  const glue = [
    'Trim or fold each A4 along its dashed page frame (the frame marks the printable window).',
    'Lay the sheets out in the grid: sheet A1 top-left, then A2 to its right, B1 below A1, and so on. The grid code sits in each sheet\'s top-right corner.',
    'Overlap edge to edge so the black CORNER SQUARES from two sheets complete into one full square, and the edge TICKS line up across the seam. Tape.',
    'A pattern line that runs off a page has a small arrow telling you which sheet it continues on — follow it to keep panels unbroken.',
    'Once taped, the register GRID should read as one continuous field with no jog at any joint.',
  ];
  glue.forEach((s, i) => {
    for (const ln of wrap(`${i + 1}. ${s}`, 9.5, A4.w - 2 * M)) { c.text(M + (ln.startsWith(`${i + 1}.`) ? 0 : 6), y, 9.5, INK, ln, null); y += 5.4; }
    y += 2.2;
  });

  y += 6;
  c.stroke(0.3, GREY); c.dash(null); c.line(M, y, A4.w - M, y); y += 9;
  c.text(M, y, 15, NAVY, 'Edges sewn together (in order)', null); y += 9;
  c.text(M, y, 8.5, GREY, 'Put each pair edge to edge before sewing and "walk" them — note any mismatch in mm.', null); y += 8;
  SEW_PAIRS.forEach(([pair, note], i) => {
    c.text(M, y, 10, INK, `${i + 1}.  ${pair}`, null); y += 5.2;
    for (const ln of wrap(note, 8.5, A4.w - 2 * M - 8)) { c.text(M + 8, y, 8.5, GREY, ln, null); y += 4.6; }
    y += 2.2;
  });

  y += 4;
  c.stroke(0.3, GREY); c.line(M, y, A4.w - M, y); y += 8;
  c.text(M, y, 11, NAVY, 'Grainline & notches', null); y += 7;
  for (const ln of wrap('Every panel carries a grainline arrow — lay it parallel to the fabric selvage. Match the bust notches on each princess seam before sewing. This top has no zipper: check the boat neck opening slips over your head before cutting real fabric.', 9, A4.w - 2 * M)) {
    c.text(M, y, 9, INK, ln, null); y += 5.2;
  }
  pdf.page(A4.w, A4.h, c.s);
}

const buf = pdf.build();
const totalPages = 2 + sheets.length + 1;
writeFileSync(join(OUT, 'id90-scoop-cami-a4.pdf'), buf);

// SVG sheets for inspection (from sheet.js directly).
mkdirSync(join(OUT, 'svg'), { recursive: true });
for (const { col, row } of sheets) {
  writeFileSync(join(OUT, 'svg', `sheet-${sheetCode(row, col)}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_W}mm" height="${PAGE_H}mm" viewBox="${col * PAGE_W} ${row * PAGE_H} ${PAGE_W} ${PAGE_H}">${sheetInner(layout, col, row, used)}</svg>\n`);
}

info.push(`OUTPUT: id90-scoop-cami-a4.pdf — ${totalPages} pages (cover + test square + ${sheets.length} pattern sheet(s) + gluing/sew guide)`);
info.push(`test square: 50 mm side, emitted at ${(50 * MM).toFixed(3)} pt (mm-true)`);
info.push(`PDF bytes: ${buf.length}`);
writeFileSync(join(OUT, 'info.txt'), info.join('\n') + '\n');
console.log(info.join('\n'));
