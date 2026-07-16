// gen-pattern-pdfs.mjs — printable PDF packs, one set per benchmark pattern.
// PHASE 1: PRODUCTION ONLY (no page/site wiring — that is phase 2).
//
// For each of the 12 FULL products (the canonical spec list exported by
// render-patterns.mjs), at EU38, drafted through the SAME WASM engine the
// product ships, this writes three files under web/patterns/pdf/:
//   <slug>-a4.pdf    tiled A4 sheets, the real product register system
//                    (frame, grid code, corner squares, join ticks,
//                    continuation arrows) from web/js/sheet.js, plus a cover
//                    with the piece list, fabric estimate and the 3 cm
//                    calibration square + register marks. The single truth
//                    for the tiling geometry is sheet.js (packPieces /
//                    usedCells / sheetInner) — this tool renders those exact
//                    strings to PDF, it does not re-derive the layout.
//   <slug>-a0.pdf    the whole pattern on one A0 sheet (print shop).
//   <slug>-guide.pdf text-first instruction booklet from the engine's own
//                    guideSteps + piece list + fabric estimate (illustration
//                    free first edition; the cover says so, honestly).
//
// No external dependency: a small vector PDF writer emits mm-true coordinates
// (1 mm = 72/25.4 pt), so the calibration square measures EXACTLY 30 mm and
// that is provable from the PDF stream. Source Etsy photos are never touched;
// only the engine's own output and generic style names.
//   run:  node engine/tools/gen-pattern-pdfs.mjs [outDir]
import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const createEngine = require(join(here, '../dist/stitchu-engine.js'));
const sheet = await import(join(here, '../../web/js/sheet.js'));
const { PAGE_W, PAGE_H, packPieces, usedCells, sheetInner, sheetCode } = sheet;

// Canonical spec list, mirrored from render-patterns.mjs (PATTERNS). Copied
// rather than imported because that module runs its SVG generator on import
// (writes into web/patterns/svg/, another owner's territory). If a spec there
// changes, update it here too; the 12 slugs are the FULL benchmark set.
const PATTERNS = [
  { slug: 'boat-neck-linen-shell', style: 'Boat neck linen shell top', garment: 'top',
    shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip' },
  { slug: 'scoop-neck-tank-mini-dress', style: 'Scoop neck tank mini dress', garment: 'dress',
    shaping: 'dart', waistline: 'natural', fabric: 'knit', neckline: 'scoop', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'straight', skirtLength: 'mini', topLength: 'hip' },
  { slug: 'boat-neck-button-down-top', style: 'Boat neck button-down top', garment: 'top',
    shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', frontPlacket: true },
  { slug: 'gingham-button-blouse', style: 'Sleeveless gingham button blouse', garment: 'top',
    shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', frontPlacket: true },
  { slug: 'mandarin-collar-fitted-blouse', style: 'Mandarin-collar fitted blouse', garment: 'top',
    shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'crew', sleeveStyle: 'straight',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    frontPlacket: true, collarType: 1, collarEdge: 0 },
  { slug: 'back-tie-shift-mini-dress', style: 'Back-tie shift mini dress', garment: 'dress',
    shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'straight', skirtLength: 'mini', topLength: 'hip', tie: 2 },
  { slug: 'square-neck-back-tie-babydoll-top', style: 'Square-neck back-tie babydoll top', garment: 'top',
    shaping: 'princess', waistline: 'empire', fabric: 'woven', neckline: 'square', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', tie: 4 },
  { slug: 'empire-waist-tie-back-dress', style: 'Empire-waist tie-back dress', garment: 'dress',
    shaping: 'princess', waistline: 'empire', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'midi', topLength: 'hip',
    tie: 2, gatherType: 2, gatherZone: 1 },
  { slug: 'square-neck-drawstring-babydoll-dress', style: 'Square-neck drawstring babydoll dress', garment: 'dress',
    shaping: 'dart', waistline: 'empire', fabric: 'woven', neckline: 'square', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'mini', topLength: 'hip',
    gatherType: 1, gatherZone: 1 },
  { slug: 'open-back-princess-mini-dress', style: 'Open-back princess mini dress', garment: 'dress',
    shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'square', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip', backOpening: 1 },
  { slug: 'open-back-tie-back-mini-dress', style: 'Open-back tie-back mini dress', garment: 'dress',
    shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip', backOpening: 1, tie: 2 },
  { slug: 'peter-pan-collar-puff-sleeve-babydoll-dress', style: 'Peter-pan collar puff-sleeve babydoll dress', garment: 'dress',
    shaping: 'princess', waistline: 'empire', fabric: 'woven', neckline: 'crew', sleeveStyle: 'straight',
    sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'midi', topLength: 'hip',
    collarType: 4, collarEdge: 0, sleeveCap: 2, gatherType: 3, gatherZone: 0 },
];

const OUT = process.argv[2] || join(here, '../../web/patterns/pdf');
mkdirSync(OUT, { recursive: true });

// EU38 standard body — the size chart's EU38 row (engine/src/sizechart.hpp:24).
const BODY = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 };

// ---- units --------------------------------------------------------------
const MM = 72 / 25.4;            // mm -> PDF points (user space unit)
const mm = (v) => v * MM;
const A4 = { w: 210, h: 297 };   // mm
const A0 = { w: 841, h: 1189 };  // mm

// ---- minimal vector PDF writer -----------------------------------------
// One page = one content stream in PDF user space (points, origin bottom-left).
// We author in mm with a top-left origin (SVG convention) and flip Y per page.
class Pdf {
  constructor() { this.objects = []; this.pages = []; }
  add(body) { this.objects.push(body); return this.objects.length; } // 1-based id
  // page: { wMM, hMM, ops }  where ops is a PDF content string already in points
  page(wMM, hMM, ops) { this.pages.push({ wMM, hMM, ops }); }
  build() {
    const enc = [];
    const offsets = [];
    let out = '%PDF-1.4\n';
    const push = (id, body) => { offsets[id] = out.length; out += `${id} 0 obj\n${body}\nendobj\n`; };

    const catalogId = 1, pagesId = 2, fontId = 3;
    const pageIds = [];
    const contentIds = [];
    let next = 4;
    for (let i = 0; i < this.pages.length; i++) { pageIds.push(next++); contentIds.push(next++); }

    push(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    push(pagesId, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`);
    push(fontId, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    for (let i = 0; i < this.pages.length; i++) {
      const pg = this.pages[i];
      const wpt = (pg.wMM * MM).toFixed(3);
      const hpt = (pg.hMM * MM).toFixed(3);
      push(pageIds[i], `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${wpt} ${hpt}] ` +
        `/Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`);
      const stream = pg.ops;
      push(contentIds[i], `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
    }
    const xrefStart = out.length;
    const count = next; // total objects + 1 (slot 0)
    out += `xref\n0 ${count}\n0000000000 65535 f \n`;
    for (let id = 1; id < count; id++) {
      out += `${String(offsets[id] || 0).padStart(10, '0')} 00000 n \n`;
    }
    out += `trailer\n<< /Size ${count} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
    return Buffer.from(out, 'latin1');
  }
}

// ---- PDF page builder in mm (top-left origin, Y-down like SVG) ----------
// Emits ops in points. `hMM` is the page height so we can flip Y.
class Ctx {
  constructor(hMM) { this.h = hMM; this.s = ''; }
  X(x) { return (x * MM).toFixed(3); }
  Y(y) { return ((this.h - y) * MM).toFixed(3); }     // flip
  DY(v) { return (v * MM).toFixed(3); }               // a length in y (no flip)
  stroke(w, rgb) { const [r, g, b] = rgb; this.s += `${(w * MM).toFixed(3)} w ${r} ${g} ${b} RG\n`; }
  fill(rgb) { const [r, g, b] = rgb; this.s += `${r} ${g} ${b} rg\n`; }
  dash(a) { this.s += a && a.length ? `[${a.map((v) => (v * MM).toFixed(2)).join(' ')}] 0 d\n` : `[] 0 d\n`; }
  line(x1, y1, x2, y2) { this.s += `${this.X(x1)} ${this.Y(y1)} m ${this.X(x2)} ${this.Y(y2)} l S\n`; }
  rect(x, y, w, h, mode) {
    // mode: 'S' stroke, 'f' fill
    this.s += `${this.X(x)} ${this.Y(y + h)} ${this.DY(w)} ${this.DY(h)} re ${mode}\n`;
  }
  // path from an array of absolute-mm segments {op,coords}
  path(segs, mode) {
    for (const sg of segs) {
      if (sg.op === 'M') this.s += `${this.X(sg.x)} ${this.Y(sg.y)} m\n`;
      else if (sg.op === 'L') this.s += `${this.X(sg.x)} ${this.Y(sg.y)} l\n`;
      else if (sg.op === 'C') this.s += `${this.X(sg.c1x)} ${this.Y(sg.c1y)} ${this.X(sg.c2x)} ${this.Y(sg.c2y)} ${this.X(sg.x)} ${this.Y(sg.y)} c\n`;
      else if (sg.op === 'Z') this.s += 'h\n';
    }
    this.s += `${mode}\n`;
  }
  text(x, y, size, rgb, str, anchor) {
    const [r, g, b] = rgb;
    let tx = x;
    if (anchor === 'middle' || anchor === 'end') {
      const wpt = helvWidth(str, size);
      const wmm = wpt / MM;
      tx = anchor === 'middle' ? x - wmm / 2 : x - wmm;
    }
    this.s += `BT /F1 ${(size).toFixed(2)} Tf ${r} ${g} ${b} rg ${this.X(tx)} ${this.Y(y)} Td (${pdfStr(str)}) Tj ET\n`;
  }
}

// Helvetica AFM advance widths (per 1000 units) for the glyphs we emit.
const HELV_W = { ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191,
  '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556, '8': 556, '9': 556,
  ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556, '@': 1015,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556,
  M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  '[': 278, '\\': 278, ']': 278, '^': 469, '_': 556, '`': 333,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222,
  m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  '{': 334, '|': 260, '}': 334, '~': 584 };
function helvWidth(str, size) {
  let w = 0;
  for (const ch of String(str)) w += (HELV_W[ch] ?? 556);
  return (w / 1000) * size;
}
function pdfStr(s) { return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'); }

// ---- tolerant reader for the SVG our own sheet.js emits -----------------
// sheet.js produces only <rect>, <path>, <line>, <text> with the attributes
// below. We translate each to Ctx ops so the tiling geometry stays defined in
// ONE place (sheet.js), not forked here.
const HEX = (h) => {
  h = (h || '#000').replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((v) => v.toFixed(4));
};
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

// Render a chunk of sheet.js SVG (already offset into strip mm coords) into ctx,
// subtracting (ox,oy) so a sheet's window sits at the page origin.
function renderSvgChunk(ctx, svg, ox, oy) {
  // handle <g transform="translate(a b)">...</g> by carrying an offset
  const tags = svg.match(/<(rect|path|line|text)\b[^>]*?(?:\/>|>[\s\S]*?<\/text>)/g) || [];
  // groups: split manually because translate wraps pieceGroup content
  let cur = { tx: 0, ty: 0 };
  // We re-walk the raw string to track <g translate> scope.
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

// ---- shared pieces ------------------------------------------------------
const NAVY = HEX('#1f3a5f');
const INK = HEX('#111111');
const GREY = HEX('#666666');

// The exact calibration square from print.js:calibrationSVG (30 mm side).
function calibration(ctx, x, y) {
  ctx.stroke(0.5, INK); ctx.dash(null);
  ctx.rect(x + 2, y + 2, 30, 30, 'S');              // <- 30 mm proven square
  ctx.text(x + 17, y + 37, 3.2, INK, '3 cm, measure me before cutting', 'middle');
  ctx.line(x + 2, y + 41, x + 27.4, y + 41);
  ctx.line(x + 2, y + 39.2, x + 2, y + 42.8);
  ctx.line(x + 27.4, y + 39.2, x + 27.4, y + 42.8);
  ctx.text(x + 14.7, y + 46.2, 3.2, INK, '1 inch', 'middle');
}

// Word-wrap plain text to a max width in mm at a given font size.
function wrap(str, size, maxMM) {
  const words = String(str).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (helvWidth(test, size) / MM > maxMM && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

// ---- build one pattern's three PDFs ------------------------------------
const engine = await createEngine();

function draft(s) {
  const out = JSON.parse(engine.draftJSON(
    s.garment, s.shaping, s.waistline, s.fabric, s.neckline, s.sleeveStyle, s.sleeveLength,
    s.skirtStyle, s.skirtLength, s.topLength, false, 1, false,
    BODY.bust, BODY.waist, BODY.hip, BODY.shoulder, BODY.backLength, BODY.armLength, BODY.neck, 0,
    s.frontPlacket === true, s.tie || 0, s.sleeveCap || 0, s.collarType || 0, s.collarEdge || 0,
    s.gatherType || 0, s.gatherZone || 0, s.backOpening || 0));
  return out;
}

const isChalk = (p) => /ruffle|bias binding/i.test(p.name);

function a4Pdf(s, p, layout, sheets, used) {
  const pdf = new Pdf();
  // Cover page (A4).
  {
    const c = new Ctx(A4.h);
    const M = 18;
    c.text(M, 28, 20, NAVY, s.style, null);
    c.text(M, 40, 10, GREY, `EU38  .  ${p.pieces.length} pieces  .  ${p.fabricMeters140} m fabric at 140 cm wide`, null);
    const saCm = (p.pieces[0].seamAllowance / 10).toFixed(1);
    c.text(M, 49, 9, GREY, `seam allowance ${saCm} cm included in the cut line (outer line cut, inner line sew).`, null);
    c.stroke(0.3, GREY); c.dash(null); c.line(M, 55, A4.w - M, 55);
    c.text(M, 66, 12, NAVY, 'Pieces', null);
    let y = 76;
    const paper = p.pieces.filter((x) => !isChalk(x));
    for (const piece of (paper.length ? paper : p.pieces)) {
      c.text(M, y, 9, INK, `${piece.name}, ${piece.cutInstruction}`, null); y += 7;
    }
    y += 6;
    c.text(M, y, 12, NAVY, 'Assembly'); y += 9;
    const asm = `${sheets.length} sheets in a grid ${layout.cols} across (A1 top-left). Print at 100% scale, headers and footers off. ` +
      `Cut or fold along the dashed page frame and tape edge to edge: the black corner squares and edge ticks complete across each joint, ` +
      `and a piece running off a page tells you which sheet it continues on. Verify the 3 cm square before cutting.`;
    for (const ln of wrap(asm, 9, A4.w - 2 * M)) { c.text(M, y, 9, INK, ln); y += 5.4; }
    calibration(c, M, y + 8);
    pdf.page(A4.w, A4.h, c.s);
  }
  // Tiled sheets: draw sheet.js markup, but recentre the used region on the
  // physical A4 (the product's PAGE_W/H is a printable window inside A4).
  const padX = (A4.w - PAGE_W) / 2;
  const padY = (A4.h - PAGE_H) / 2;
  for (const { col, row } of sheets) {
    const c = new Ctx(A4.h);
    const svg = sheetInner(layout, col, row, used);
    // sheet coords live at (col*PAGE_W .. +PAGE_W). Shift that window to (padX,padY).
    renderSvgChunk(c, svg, col * PAGE_W - padX, row * PAGE_H - padY);
    // page label
    c.text(padX, padY - 4, 8, GREY, `${s.style}  .  sheet ${sheetCode(row, col)}  .  grid ${layout.cols} wide`, null);
    pdf.page(A4.w, A4.h, c.s);
  }
  return pdf.build();
}

function a0Pdf(s, p, layout, used) {
  // One A0 sheet: the whole packed strip, scaled to fit A0 with a margin, plus
  // the calibration square drawn at TRUE size in a corner (so a print shop can
  // confirm 100%). The pieces themselves are true scale when the strip fits A0
  // at 1:1; if the strip is larger than A0 we scale down and say so honestly.
  const M = 25;
  const stripW = layout.cols * PAGE_W;
  const rows = Math.ceil(layout.stripH / PAGE_H);
  const stripH = rows * PAGE_H;
  const availW = A0.w - 2 * M, availH = A0.h - 2 * M - 40;
  const scale = Math.min(1, availW / stripW, availH / stripH);
  const c = new Ctx(A0.h);
  c.text(M, 30, 30, NAVY, s.style, null);
  c.text(M, 46, 14, GREY, `EU38  .  ${p.pieces.length} pieces  .  ${p.fabricMeters140} m at 140 cm  .  single-sheet A0 (print shop)`, null);
  if (scale < 1) c.text(M, 60, 12, INK, `NOTE: this pattern is larger than A0; printed here at ${(scale * 100).toFixed(1)}% to fit. Scale up to the calibration square before cutting.`, null);
  else c.text(M, 60, 12, GREY, 'true scale at 100%. Confirm with the calibration square, then cut.', null);
  // Draw the whole strip, all sheets, no register frames (single sheet), scaled.
  // We render each used cell's geometry (paths only) via sheetInner but strip
  // the register marks by re-running with a whole-strip window and manual scale.
  // Simplest faithful path: emit every piece from the layout directly.
  const ox0 = M, oy0 = 72;
  for (const d of layout.placed) {
    drawPieceScaled(c, d, ox0, oy0, scale);
  }
  // calibration at TRUE size, bottom-left corner.
  calibration(c, M, A0.h - M - 47);
  const pdf = new Pdf();
  pdf.page(A0.w, A0.h, c.s);
  return pdf.build();
}

// Draw one placed piece (cut line + sewing line + markings + grainline + label)
// at `scale`, offset to (ox,oy). Coordinates: strip-space (d.ox/d.oy) * scale.
function drawPieceScaled(c, d, ox, oy, scale) {
  const p = d.p;
  const tx = (x) => ox + (x + d.ox) * scale;
  const ty = (y) => oy + (y + d.oy) * scale;
  const mapSeg = (sg) => {
    if (sg.type === 'move') return { op: 'M', x: tx(sg.x), y: ty(sg.y) };
    if (sg.type === 'line') return { op: 'L', x: tx(sg.x), y: ty(sg.y) };
    if (sg.type === 'curve') return { op: 'C', c1x: tx(sg.cp1x), c1y: ty(sg.cp1y), c2x: tx(sg.cp2x), c2y: ty(sg.cp2y), x: tx(sg.x), y: ty(sg.y) };
    if (sg.type === 'close') return { op: 'Z' };
    return null;
  };
  const toSegs = (cmds) => cmds.map(mapSeg).filter(Boolean);
  if ((p.cutLine || []).length) {
    c.stroke(0.6 * scale + 0.3, INK); c.dash([1.4, 1]);
    c.path(toSegs(p.cutLine), 'S'); c.dash(null);
  }
  c.stroke(0.7, NAVY); c.dash(null);
  c.path(toSegs(p.commands), 'S');
  if ((p.markings || []).length) { c.stroke(0.5, HEX('#3f74a8')); c.dash([3, 3]); c.path(toSegs(p.markings), 'S'); c.dash(null); }
  if (p.grainline) {
    const g = p.grainline;
    c.stroke(0.6, HEX('#3f74a8')); c.dash(null);
    c.line(tx(g.fromX), ty(g.fromY), tx(g.toX), ty(g.toY));
  }
  c.text(tx(d.b.minX) + 3, ty(d.b.minY) + 12, 11 * Math.max(scale, 0.5), NAVY, p.name, null);
}

function guidePdf(s, p) {
  const pdf = new Pdf();
  const M = 20;
  const lineH = 5.6;
  const paper = p.pieces.filter((x) => !isChalk(x));
  let c = new Ctx(A4.h);
  let y = 28;
  const newPage = () => { pdf.page(A4.w, A4.h, c.s); c = new Ctx(A4.h); y = 24; };
  const need = (h) => { if (y + h > A4.h - M) newPage(); };

  c.text(M, y, 20, NAVY, s.style, null); y += 11;
  c.text(M, y, 10, GREY, `EU38 sewing guide  .  ${p.pieces.length} pieces  .  ${p.fabricMeters140} m fabric at 140 cm`, null); y += 7;
  c.text(M, y, 9, GREY, 'text-first guide, no illustrations in this edition. Every step is the engine\'s own instruction.', null); y += 12;

  c.text(M, y, 13, NAVY, 'Cut list', null); y += 8;
  for (const piece of (paper.length ? paper : p.pieces)) {
    need(lineH); c.text(M, y, 9.5, INK, `${piece.name}  -  ${piece.cutInstruction}`, null); y += lineH;
  }
  y += 8;
  need(20);
  c.text(M, y, 13, NAVY, 'Steps', null); y += 8;
  p.guideSteps.forEach((step, i) => {
    const lines = wrap(`${i + 1}. ${step}`, 9.5, A4.w - 2 * M - 6);
    need(lines.length * lineH + 3);
    for (const ln of lines) { c.text(M + (ln === lines[0] ? 0 : 6), y, 9.5, INK, ln); y += lineH; }
    y += 2.4;
  });
  newPage();
  return pdf.build();
}

// ---- main ---------------------------------------------------------------
const report = [];
for (const s of PATTERNS) {
  const out = draft(s);
  if (out.error) { console.log(s.slug, 'ERROR', out.error); continue; }
  const p = out.pattern;
  const paper = p.pieces.filter((x) => !isChalk(x));
  const layout = packPieces(paper.length ? paper : p.pieces);
  const { sheets, used } = usedCells(layout);

  const a4 = a4Pdf(s, p, layout, sheets, used);
  const a0 = a0Pdf(s, p, layout, used);
  const gd = guidePdf(s, p);

  writeFileSync(join(OUT, `${s.slug}-a4.pdf`), a4);
  writeFileSync(join(OUT, `${s.slug}-a0.pdf`), a0);
  writeFileSync(join(OUT, `${s.slug}-guide.pdf`), gd);

  report.push({ slug: s.slug, pieces: p.pieces.length, a4pages: sheets.length + 1,
    a4bytes: a4.length, a0bytes: a0.length, guidebytes: gd.length,
    guideSteps: p.guideSteps.length, cols: layout.cols });
  console.log(`${s.slug}: A4 ${sheets.length + 1}p ${(a4.length / 1024).toFixed(0)}k | A0 ${(a0.length / 1024).toFixed(0)}k | guide ${(gd.length / 1024).toFixed(0)}k`);
}
console.log(`\n${report.length * 3} files -> ${OUT}`);
writeFileSync(join(OUT, 'pdf-manifest.json'), JSON.stringify(report, null, 2));
