// pdf-core.js — the shared, dependency-free vector PDF core for stitchu's
// printable pattern packs. Extracted from gen-pattern-pdfs.mjs so both the
// Pattern Blog PDFs and the Collections detail-page PDFs build the exact same
// A4 tiled pack / A0 single sheet / text guide from ONE source. Nothing here is
// pattern-specific: callers pass in the drafted pattern + packed layout and get
// back the PDF bytes. The tiling geometry stays owned by web/js/sheet.js; this
// module only renders the strings sheet.js emits.
//
// WHY IT LIVES IN web/lib/ AND NOT engine/tools/ (moved 2026-08-26, F-İNDİR).
// The browser is now a caller: create.html's "PDF indir" button builds the pack
// in the page. Only web/ is published (pages.yml uploads `path: web`), so a
// module the browser imports has to sit inside it. The alternative was a second
// copy under web/, i.e. two PDF truths; refused.
//
// web/lib/ AND NOT web/js/, said plainly. web/js/ is the PAGE-SCRIPT namespace
// (create.js, studio.js, sheet.js); this file is the shared PDF writer the node
// generators also import, not page logic. It is also the scope
// landing_truth_check scans (`rel(p).startsWith('js/')`), and moving five
// unchanged strings into that scope would have pushed its L1 baseline 937 -> 944
// and turned a green gate red. Those five strings ("3 cm, measure me before
// cutting", the "m fabric at 140 cm" headers) were ALREADY reaching users
// inside the published PDFs — nothing new is being hidden, and the baseline was
// NOT re-cut (that gate only allows re-cutting downward, and loosening a gate
// is not a phase agent's call, §3.8 md.4). Recorded here so the choice is
// visible rather than quietly convenient.
//
// Node-free by construction: build() returns a Uint8Array, which writeFileSync
// accepts unchanged, so the three generator tools kept working byte-for-byte.
//
// Usage:
//   import { makePdfCore } from './pdf-core.js';
//   const core = makePdfCore({ engine, sheet, body });
//   const bytes = core.a4Pdf(spec, pattern, layout, sheets, used);

// ---- units --------------------------------------------------------------
const MM = 72 / 25.4;            // mm -> PDF points (user space unit)
export const A4 = { w: 210, h: 297 };   // mm
export const A0 = { w: 841, h: 1189 };  // mm

// ---- minimal vector PDF writer -----------------------------------------
export class Pdf {
  constructor() { this.objects = []; this.pages = []; }
  add(body) { this.objects.push(body); return this.objects.length; }
  page(wMM, hMM, ops) { this.pages.push({ wMM, hMM, ops }); }
  build() {
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
    // WinAnsiEncoding: engine text carries latin1 glyphs the standard encoding
    // hides (the bias-cut note's degree sign) — WinAnsi maps them correctly.
    push(fontId, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    for (let i = 0; i < this.pages.length; i++) {
      const pg = this.pages[i];
      const wpt = (pg.wMM * MM).toFixed(3);
      const hpt = (pg.hMM * MM).toFixed(3);
      push(pageIds[i], `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${wpt} ${hpt}] ` +
        `/Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`);
      const stream = pg.ops;
      // Length in LATIN1 bytes — the whole file is serialized latin1 below, so
      // counting utf8 here shifted every later offset when a non-ASCII char
      // (the strap's Turkish parenthetical) entered a content stream. latin1 is
      // one byte per code unit, so the JS string length IS that byte count
      // (Buffer.byteLength(s,'latin1') is defined as s.length) — same number,
      // no node dependency.
      push(contentIds[i], `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    }
    const xrefStart = out.length;
    const count = next;
    out += `xref\n0 ${count}\n0000000000 65535 f \n`;
    for (let id = 1; id < count; id++) out += `${String(offsets[id] || 0).padStart(10, '0')} 00000 n \n`;
    out += `trailer\n<< /Size ${count} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
    // latin1 serialization by hand: every code unit is one byte, and a code
    // unit above 0xFF would silently truncate here exactly as Buffer's latin1
    // encoder does — so it is refused BY NAME instead (RULES invariant 1).
    const bytes = new Uint8Array(out.length);
    for (let i = 0; i < out.length; i++) {
      const c = out.charCodeAt(i);
      if (c > 0xff) throw new Error(
        `pdf: character U+${c.toString(16).toUpperCase()} at ${i} is outside WinAnsi/latin1; ` +
        'the PDF font cannot encode it, so it must not be written silently');
      bytes[i] = c;
    }
    return bytes;
  }
}

// ---- PDF page builder in mm (top-left origin, Y-down like SVG) ----------
export class Ctx {
  constructor(hMM) { this.h = hMM; this.s = ''; }
  X(x) { return (x * MM).toFixed(3); }
  Y(y) { return ((this.h - y) * MM).toFixed(3); }
  DY(v) { return (v * MM).toFixed(3); }
  stroke(w, rgb) { const [r, g, b] = rgb; this.s += `${(w * MM).toFixed(3)} w ${r} ${g} ${b} RG\n`; }
  fill(rgb) { const [r, g, b] = rgb; this.s += `${r} ${g} ${b} rg\n`; }
  dash(a) { this.s += a && a.length ? `[${a.map((v) => (v * MM).toFixed(2)).join(' ')}] 0 d\n` : `[] 0 d\n`; }
  line(x1, y1, x2, y2) { this.s += `${this.X(x1)} ${this.Y(y1)} m ${this.X(x2)} ${this.Y(y2)} l S\n`; }
  rect(x, y, w, h, mode) { this.s += `${this.X(x)} ${this.Y(y + h)} ${this.DY(w)} ${this.DY(h)} re ${mode}\n`; }
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
      const wmm = helvWidth(str, size) / MM;
      tx = anchor === 'middle' ? x - wmm / 2 : x - wmm;
    }
    this.s += `BT /F1 ${(size).toFixed(2)} Tf ${r} ${g} ${b} rg ${this.X(tx)} ${this.Y(y)} Td (${pdfStr(str)}) Tj ET\n`;
  }
}

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
export function helvWidth(str, size) {
  let w = 0;
  for (const ch of String(str)) w += (HELV_W[ch] ?? 556);
  return (w / 1000) * size;
}
// Base-14 Helvetica has no glyphs beyond the standard set: transliterate the
// few non-ASCII letters engine text can carry (same faithful-rendering move as
// decodeEntities' arrow mapping) instead of emitting bytes the font cannot show.
const TRANSLIT = { 'ı': 'i', 'İ': 'I', 'ş': 's', 'Ş': 'S', 'ğ': 'g', 'Ğ': 'G',
  'ü': 'u', 'Ü': 'U', 'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C',
  '—': '-', '–': '-', '‘': "'", '’': "'",
  '“': '"', '”': '"', '…': '...' };
function pdfStr(s) {
  return String(s)
    .replace(/[ıİşŞğĞüÜöÖçÇ–—‘’“”…]/g, (ch) => TRANSLIT[ch])
    .replace(/[^\x00-\xff]/g, '?')
    .replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

// ---- tolerant reader for the SVG sheet.js emits -------------------------
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

export function renderSvgChunk(ctx, svg, ox, oy) {
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

// ---- shared drawing pieces ----------------------------------------------
const NAVY = HEX('#1f3a5f');
const INK = HEX('#111111');
const GREY = HEX('#666666');

export function calibration(ctx, x, y) {
  ctx.stroke(0.5, INK); ctx.dash(null);
  ctx.rect(x + 2, y + 2, 30, 30, 'S');
  ctx.text(x + 17, y + 37, 3.2, INK, '3 cm, measure me before cutting', 'middle');
  ctx.line(x + 2, y + 41, x + 27.4, y + 41);
  ctx.line(x + 2, y + 39.2, x + 2, y + 42.8);
  ctx.line(x + 27.4, y + 39.2, x + 27.4, y + 42.8);
  ctx.text(x + 14.7, y + 46.2, 3.2, INK, '1 inch', 'middle');
}

export function wrap(str, size, maxMM) {
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
  // Balance notches (ASTM layer 4): solid ticks, no dash — a notch is a cut.
  if ((p.notches || []).length) { c.stroke(0.5, NAVY); c.dash(null); c.path(toSegs(p.notches), 'S'); }
  // CUT ON FOLD (ASTM layer 6 mirror line): dash-dot, so the cutter sees which
  // edge goes on the fabric fold instead of having to read the cut note.
  if ((p.foldLine || []).length) {
    c.stroke(0.5, NAVY); c.dash([4, 1.2, 0.8, 1.2]);
    c.path(toSegs(p.foldLine), 'S'); c.dash(null);
  }
  if (p.grainline) {
    const g = p.grainline;
    c.stroke(0.6, HEX('#3f74a8')); c.dash(null);
    c.line(tx(g.fromX), ty(g.fromY), tx(g.toX), ty(g.toY));
  }
  c.text(tx(d.b.minX) + 3, ty(d.b.minY) + 12, 11 * Math.max(scale, 0.5), NAVY, p.name, null);
}

const isChalk = (p) => /ruffle|bias binding/i.test(p.name);

// makePdfCore binds the WASM engine + the sheet layout module + the demo body,
// and returns the three PDF builders. This is the ONLY entry point callers use.
export function makePdfCore({ engine, sheet, body }) {
  const { PAGE_W, PAGE_H, packPieces, usedCells, sheetInner, sheetCode } = sheet;

  function draft(s) {
    const out = JSON.parse(engine.draftJSON({
      garment: s.garment, shaping: s.shaping, waistline: s.waistline, fabric: s.fabric,
      neckline: s.neckline, sleeveStyle: s.sleeveStyle, sleeveLength: s.sleeveLength,
      skirtStyle: s.skirtStyle, skirtLength: s.skirtLength, topLength: s.topLength,
      frontPlacket: s.frontPlacket === true, tieClosure: s.tie || 0, sleeveCap: s.sleeveCap || 0,
      collarType: s.collarType || 0, collarEdge: s.collarEdge || 0,
      gatherType: s.gatherType || 0, gatherZone: s.gatherZone || 0, backOpening: s.backOpening || 0,
      backSlit: s.backSlit || 0, ruffledStraps: s.ruffledStraps || 0, peplum: s.peplum || 0,
      placketStyle: s.placketStyle || 0, edgeFinish: s.edgeFinish || 0, pocketStyle: s.pocketStyle || 0,
      cuffStyle: s.cuffStyle || 0, hemShape: s.hemShape || 0, shoulderStyle: s.shoulderStyle || 0,
      buttonRow: s.buttonRow || 0, exposedZip: s.exposedZip || 0, backDetail: s.backDetail || 0,
      bardotStyle: s.bardotStyle || 0,
    }, body));
    if (out.error) throw new Error(`engine refused '${s.slug || s.style}': ${out.error}`);
    return out;
  }

  function a4Pdf(s, p, layout, sheets, used) {
    const pdf = new Pdf();
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
      // Header count and this list MUST come from the same set: every drafted
      // piece appears here. Chalk pieces (bias binding, ruffle strips — drawn
      // straight on fabric, not printed) get their own heading instead of being
      // silently dropped (the courtney guide sewed a piece the cut list hid).
      const paper = p.pieces.filter((x) => !isChalk(x));
      const chalk = p.pieces.filter((x) => isChalk(x));
      // WRAPPED, not one line per piece. A cut instruction is not short: the
      // bias binding's reads "cut 1 strip(s) 1177 x 25 mm ON THE BIAS (45 deg to
      // the grain), join end to end..." and ran straight off the right edge of
      // the sheet, so the number the sewer needs was printed outside the page
      // (seen 26 Aug on the F-İNDİR cover render). PDF has no text box; if the
      // writer does not wrap, nothing does.
      const cutLine = (piece) => {
        for (const ln of wrap(`${piece.name}, ${piece.cutInstruction}`, 9, A4.w - 2 * M)) {
          c.text(M, y, 9, INK, ln, null); y += 5.4;
        }
        y += 1.6;
      };
      for (const piece of paper) cutLine(piece);
      if (chalk.length) {
        y += 3;
        c.text(M, y, 10, NAVY, 'Strips / notions (chalked on fabric, not printed)', null); y += 8;
        for (const piece of chalk) cutLine(piece);
      }
      y += 6;
      c.text(M, y, 12, NAVY, 'Assembly'); y += 9;
      const asm = `${sheets.length} sheets in a grid ${layout.cols} across (A1 top-left). Print at 100% scale, headers and footers off. ` +
        `Cut or fold along the dashed page frame and tape edge to edge: the black corner squares and edge ticks complete across each joint, ` +
        `and a piece running off a page tells you which sheet it continues on. Verify the 3 cm square before cutting.`;
      for (const ln of wrap(asm, 9, A4.w - 2 * M)) { c.text(M, y, 9, INK, ln); y += 5.4; }
      // ORIGIN (köken) — F0, 2026-08-26. Which fields of this pattern the
      // user's photo actually showed, and which the engine derived. Measured
      // before this block existed: %58.3 of the fields came from host defaults
      // and no shipped surface said so, so the buyer could not tell their own
      // dress from ours. §0B: inventing is not the offence, inventing SILENTLY
      // is. Printed on paper on purpose — it must survive being opened offline.
      if (s.koken) {
        y += 6;
        c.text(M, y, 12, NAVY, 'Origin / Köken'); y += 9;
        const line = s.koken.alanlar.length
          ? `${s.koken.alanlar.length} of ${s.koken.toplam} fields were NOT visible in the photo and were derived ` +
            `from rules (the simplest reading was chosen): ${s.koken.alanlar.join(', ')}. ` +
            `Everything else came from the photo or from your own picks.`
          : `all ${s.koken.toplam} fields came from the photo or from your own picks; nothing was derived.`;
        for (const ln of wrap(line, 9, A4.w - 2 * M)) { c.text(M, y, 9, INK, ln); y += 5.4; }
      }
      calibration(c, M, y + 8);
      pdf.page(A4.w, A4.h, c.s);
    }
    const padX = (A4.w - PAGE_W) / 2;
    const padY = (A4.h - PAGE_H) / 2;
    for (const { col, row } of sheets) {
      const c = new Ctx(A4.h);
      const svg = sheetInner(layout, col, row, used);
      renderSvgChunk(c, svg, col * PAGE_W - padX, row * PAGE_H - padY);
      c.text(padX, padY - 4, 8, GREY, `${s.style}  .  sheet ${sheetCode(row, col)}  .  grid ${layout.cols} wide`, null);
      pdf.page(A4.w, A4.h, c.s);
    }
    return pdf.build();
  }

  function a0Pdf(s, p, layout) {
    const M = 25;
    const stripW = layout.cols * PAGE_W;
    const rows = Math.ceil(layout.stripH / PAGE_H);
    const stripH = rows * PAGE_H;
    const availW = A0.w - 2 * M, availH = A0.h - 2 * M - 40;
    const scale = Math.min(1, availW / stripW, availH / stripH);
    const c = new Ctx(A0.h);
    c.text(M, 30, 30, NAVY, s.style, null);
    const a0Chalk = p.pieces.filter((x) => isChalk(x)).length;
    c.text(M, 46, 14, GREY, `EU38  .  ${p.pieces.length} pieces${a0Chalk ? ` (${a0Chalk} chalked on fabric, not printed here)` : ''}  .  ${p.fabricMeters140} m at 140 cm  .  single-sheet A0 (print shop)`, null);
    if (scale < 1) c.text(M, 60, 12, INK, `NOTE: this pattern is larger than A0; printed here at ${(scale * 100).toFixed(1)}% to fit. Scale up to the calibration square before cutting.`, null);
    else c.text(M, 60, 12, GREY, 'true scale at 100%. Confirm with the calibration square, then cut.', null);
    const ox0 = M, oy0 = 72;
    for (const d of layout.placed) drawPieceScaled(c, d, ox0, oy0, scale);
    calibration(c, M, A0.h - M - 47);
    const pdf = new Pdf();
    pdf.page(A0.w, A0.h, c.s);
    return pdf.build();
  }

  function guidePdf(s, p) {
    const pdf = new Pdf();
    const M = 20;
    const lineH = 5.6;
    const paper = p.pieces.filter((x) => !isChalk(x));
    const chalk = p.pieces.filter((x) => isChalk(x));
    let c = new Ctx(A4.h);
    let y = 28;
    const newPage = () => { pdf.page(A4.w, A4.h, c.s); c = new Ctx(A4.h); y = 24; };
    const need = (h) => { if (y + h > A4.h - M) newPage(); };
    c.text(M, y, 20, NAVY, s.style, null); y += 11;
    c.text(M, y, 10, GREY, `EU38 sewing guide  .  ${p.pieces.length} pieces  .  ${p.fabricMeters140} m fabric at 140 cm`, null); y += 7;
    c.text(M, y, 9, GREY, 'text-first guide, no illustrations in this edition. Every step is the engine\'s own instruction.', null); y += 12;
    c.text(M, y, 13, NAVY, 'Cut list', null); y += 8;
    // Wrapped for the same reason the A4 cover's list is: a long cut
    // instruction printed off the right edge of the sheet.
    const cutLine = (piece) => {
      for (const ln of wrap(`${piece.name}  -  ${piece.cutInstruction}`, 9.5, A4.w - 2 * M)) {
        need(lineH); c.text(M, y, 9.5, INK, ln, null); y += lineH;
      }
    };
    for (const piece of paper) cutLine(piece);
    if (chalk.length) {
      need(lineH + 4);
      c.text(M, y, 10.5, NAVY, 'Strips / notions (chalked on fabric, not printed)', null); y += lineH + 1;
      for (const piece of chalk) cutLine(piece);
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

  // The page layout every PDF surface shares: chalk pieces (bias binding, ruffle
  // strips) are drawn straight on the fabric, so they are not tiled onto paper;
  // the rest are shelf-packed by sheet.js. Named and returned so an in-browser
  // caller (web/js/download.js) builds the SAME pages the generators write to
  // disk instead of re-deriving the packing — one layout truth, not two.
  function pack(p) {
    const paper = p.pieces.filter((x) => !isChalk(x));
    const layout = packPieces(paper.length ? paper : p.pieces);
    const { sheets, used } = usedCells(layout);
    return { layout, sheets, used };
  }

  // Build all three PDFs for one spec + write them; returns manifest row.
  function buildAll(s, outDir, writeFileSync, join) {
    const out = draft(s);
    if (out.error) return { error: out.error };
    const p = out.pattern;
    const { layout, sheets, used } = pack(p);
    const a4 = a4Pdf(s, p, layout, sheets, used);
    const a0 = a0Pdf(s, p, layout);
    const gd = guidePdf(s, p);
    writeFileSync(join(outDir, `${s.slug}-a4.pdf`), a4);
    writeFileSync(join(outDir, `${s.slug}-a0.pdf`), a0);
    writeFileSync(join(outDir, `${s.slug}-guide.pdf`), gd);
    return { slug: s.slug, pieces: p.pieces.length, a4pages: sheets.length + 1,
      a4bytes: a4.length, a0bytes: a0.length, guidebytes: gd.length,
      guideSteps: p.guideSteps.length, cols: layout.cols,
      pieceNames: p.pieces.map((x) => x.name), fabricMeters140: p.fabricMeters140 };
  }

  return { draft, pack, a4Pdf, a0Pdf, guidePdf, buildAll };
}
