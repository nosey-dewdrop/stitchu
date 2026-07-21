// gen-tr-pack.mjs — TURKISH customer package for id82 (crew-neck sleeveless
// boxy crop tank, "Elle Top"), EU38, drafted through the SHIPPING WASM engine.
//
// This is a PACKAGE builder, NOT an engine change. It only READS the contract
// spec, drafts id82 via engine/dist/stitchu-engine.js, and writes a full
// customer-ready A4 tiled PDF (all text Turkish) to ~/Desktop/stitchu-numune-01/.
// Tiling/register geometry is owned by web/js/sheet.js — this tool renders those
// exact strings, it does not re-derive the layout.
//
// The 50 mm calibration square is emitted at mm-true PDF points (1 mm = 72/25.4
// pt), so it measures EXACTLY 50 mm — provable from the PDF stream.
//
// Full Turkish glyph support: the PDF font is Helvetica with WinAnsiEncoding +
// a /Differences array that maps the Turkish glyphs missing from WinAnsi
// (scedilla, gbreve, dotlessi, Idotaccent, Scedilla, Gbreve) into free slots.
//   run: node reports/gate/lansman/id82/gen-tr-pack.mjs
import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../../../..');
const require = createRequire(import.meta.url);
const createEngine = require(join(root, 'engine/dist/stitchu-engine.js'));
const sheet = await import(join(root, 'web/js/sheet.js'));
const { PAGE_W, PAGE_H, packPieces, usedCells, sheetInner, sheetCode } = sheet;

const MM = 72 / 25.4;
const OUT = join(homedir(), 'Desktop', 'stitchu-numune-01');
mkdirSync(OUT, { recursive: true });

// ---------- colours ----------
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

// ---------- Turkish glyph encoding ----------
// WinAnsiEncoding covers: ç Ç ö Ö ü Ü â î û etc. Missing Turkish glyphs get
// custom code points via /Differences. We remap those chars before writing.
const TR_MAP = {
  'ş': '\x81', 'Ş': '\x82', 'ğ': '\x83', 'Ğ': '\x84', 'ı': '\x85', 'İ': '\x86',
};
// The rest (ç Ç ö Ö ü Ü) are native WinAnsi bytes.
const WINANSI = {
  'ç': 0xE7, 'Ç': 0xC7, 'ö': 0xF6, 'Ö': 0xD6, 'ü': 0xFC, 'Ü': 0xDC,
  'â': 0xE2, 'î': 0xEE, 'û': 0xFB, '“': 0x93, '”': 0x94, '’': 0x92, '–': 0x96, '—': 0x97, '°': 0xB0,
};
function pdfStr(s) {
  let out = '';
  for (const ch of String(s)) {
    if (TR_MAP[ch]) { out += TR_MAP[ch]; continue; }
    if (WINANSI[ch] !== undefined) { out += String.fromCharCode(WINANSI[ch]); continue; }
    if (ch === '\\') { out += '\\\\'; continue; }
    if (ch === '(') { out += '\\('; continue; }
    if (ch === ')') { out += '\\)'; continue; }
    const cp = ch.codePointAt(0);
    out += cp < 256 ? ch : '?'; // fall back for anything exotic
  }
  return out;
}

// Helvetica AFM widths (per 1000 em) incl. the Turkish/accented chars we use.
const HELV_W = { ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191,
  '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556, '8': 556, '9': 556,
  ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556, '@': 1015,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556,
  M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  '[': 278, '\\': 278, ']': 278, '^': 469, '_': 556, '`': 333,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222,
  m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  '{': 334, '|': 260, '}': 334, '~': 584,
  // Turkish + accented (Helvetica AFM widths for the base letters)
  'ç': 500, 'Ç': 722, 'ö': 556, 'Ö': 778, 'ü': 556, 'Ü': 722,
  'ş': 500, 'Ş': 667, 'ğ': 556, 'Ğ': 778, 'ı': 278, 'İ': 278,
  'â': 556, 'î': 278, 'û': 556, '“': 556, '”': 556, '’': 222, '–': 556, '—': 1000, '°': 400 };
function helvWidth(str, size) {
  let w = 0;
  for (const ch of String(str)) w += (HELV_W[ch] ?? 556);
  return (w / 1000) * size;
}
function wrap(str, size, maxMM) {
  const words = String(str).split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (helvWidth(test, size) / MM > maxMM && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

// ---------- PDF writer (self-contained, Turkish font) ----------
class Ctx {
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

class Pdf {
  constructor() { this.pages = []; }
  page(wMM, hMM, ops) { this.pages.push({ wMM, hMM, ops }); }
  build() {
    const offsets = [];
    let out = '%PDF-1.4\n';
    const push = (id, body) => { offsets[id] = out.length; out += `${id} 0 obj\n${body}\nendobj\n`; };
    const catalogId = 1, pagesId = 2, fontId = 3, encId = 4;
    const pageIds = [];
    const contentIds = [];
    let next = 5;
    for (let i = 0; i < this.pages.length; i++) { pageIds.push(next++); contentIds.push(next++); }
    push(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    push(pagesId, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`);
    push(fontId, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding ${encId} 0 R >>`);
    // WinAnsiEncoding + Turkish glyphs in the custom slots we remapped above.
    push(encId, `<< /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences [ ` +
      `129 /scedilla 130 /Scedilla 131 /gbreve 132 /Gbreve 133 /dotlessi 134 /Idotaccent ] >>`);
    for (let i = 0; i < this.pages.length; i++) {
      const pg = this.pages[i];
      const wpt = (pg.wMM * MM).toFixed(3);
      const hpt = (pg.hMM * MM).toFixed(3);
      push(pageIds[i], `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${wpt} ${hpt}] ` +
        `/Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`);
      const stream = pg.ops;
      push(contentIds[i], `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`);
    }
    const xrefStart = out.length;
    const count = next;
    out += `xref\n0 ${count}\n0000000000 65535 f \n`;
    for (let id = 1; id < count; id++) out += `${String(offsets[id] || 0).padStart(10, '0')} 00000 n \n`;
    out += `trailer\n<< /Size ${count} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
    return Buffer.from(out, 'latin1');
  }
}

const A4 = { w: 210, h: 297 };

// ---------- tolerant SVG chunk renderer (for tiled sheets from sheet.js) ----
const attr = (tag, name) => { const m = tag.match(new RegExp(`${name}="([^"]*)"`)); return m ? m[1] : null; };
const num = (tag, name) => { const v = attr(tag, name); return v === null ? null : parseFloat(v); };
function parsePathD(d) {
  const segs = []; const toks = d.match(/[MLCZ]|-?\d*\.?\d+/g) || []; let i = 0;
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
// Turkish sheet labels — decode sheet.js entities to plain ASCII arrows.
function decodeEntities(s) {
  return s.replace(/&#8594;/g, '->').replace(/&#8592;/g, '<-').replace(/&#8595;/g, 'v')
    .replace(/&#8593;/g, '^').replace(/&#183;/g, '.').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '');
}
function renderSvgChunk(ctx, svg, ox, oy) {
  const re = /<g transform="translate\(([-\d.]+) ([-\d.]+)\)">|<\/g>|<(rect|path|line|text)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/text>)/g;
  let m; const stack = []; let acc = { tx: 0, ty: 0 };
  while ((m = re.exec(svg))) {
    if (m[0].startsWith('<g')) { stack.push(acc); acc = { tx: acc.tx + parseFloat(m[1]), ty: acc.ty + parseFloat(m[2]) }; continue; }
    if (m[0] === '</g>') { acc = stack.pop() || { tx: 0, ty: 0 }; continue; }
    const tag = m[3]; const body = m[0]; const OX = ox - acc.tx, OY = oy - acc.ty;
    if (tag === 'rect') {
      const x = num(body, 'x') - OX, y = num(body, 'y') - OY, w = num(body, 'width'), h = num(body, 'height');
      const fill = attr(body, 'fill'), strokeC = attr(body, 'stroke'), sw = num(body, 'stroke-width') || 0.3, dash = attr(body, 'stroke-dasharray');
      if (fill && fill !== 'none') { ctx.fill(HEX(fill)); ctx.rect(x, y, w, h, 'f'); }
      if (strokeC && strokeC !== 'none') { ctx.stroke(sw, HEX(strokeC)); ctx.dash(dash ? dash.split(/\s+/).map(Number) : null); ctx.rect(x, y, w, h, 'S'); ctx.dash(null); }
    } else if (tag === 'line') {
      const strokeC = attr(body, 'stroke') || '#111', sw = num(body, 'stroke-width') || 0.45;
      ctx.stroke(sw, HEX(strokeC)); ctx.dash(null);
      ctx.line(num(body, 'x1') - OX, num(body, 'y1') - OY, num(body, 'x2') - OX, num(body, 'y2') - OY);
    } else if (tag === 'path') {
      const d = attr(body, 'd'), strokeC = attr(body, 'stroke'), sw = num(body, 'stroke-width') || 0.45, fill = attr(body, 'fill'), dash = attr(body, 'stroke-dasharray');
      const segs = parsePathD(d).map((s) => shiftSeg(s, OX, OY));
      if (fill && fill !== 'none') { ctx.fill(HEX(fill)); ctx.path(segs, 'f'); }
      if (!strokeC || strokeC !== 'none') { ctx.stroke(sw, HEX(strokeC || '#111')); ctx.dash(dash ? dash.split(/\s+/).map(Number) : null); ctx.path(segs, 'S'); ctx.dash(null); }
    } else if (tag === 'text') {
      const x = num(body, 'x') - OX, y = num(body, 'y') - OY, size = num(body, 'font-size') || 6;
      const fill = attr(body, 'fill') || '#111', anchor = attr(body, 'text-anchor');
      ctx.text(x, y, size, HEX(fill), decodeEntities(m[5] || ''), anchor);
    }
  }
}

// ================= DRAFT id82 through the shipping engine =================
const STYLE = 'Bisiklet yaka kolsuz boxy crop atlet';
const SPEC = {
  garment: 'top', shaping: 'dart', waistline: 'natural', fabric: 'woven',
  neckline: 'crew', sleeveStyle: 'none', sleeveLength: null,
  skirtStyle: null, skirtLength: null, topLength: 'cropped',
};
const BODY = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 };

const engine = await createEngine();
const out = JSON.parse(engine.draftJSON({
  garment: SPEC.garment, shaping: SPEC.shaping, waistline: SPEC.waistline, fabric: SPEC.fabric,
  neckline: SPEC.neckline, sleeveStyle: SPEC.sleeveStyle, sleeveLength: SPEC.sleeveLength,
  skirtStyle: SPEC.skirtStyle, skirtLength: SPEC.skirtLength, topLength: SPEC.topLength,
  frontPlacket: false, tieClosure: 0, sleeveCap: 0, collarType: 0, collarEdge: 0,
  gatherType: 0, gatherZone: 0, backOpening: 0, backSlit: 0, ruffledStraps: 0, peplum: 0,
  placketStyle: 0, edgeFinish: 0, pocketStyle: 0, cuffStyle: 0, hemShape: 0, shoulderStyle: 0,
  buttonRow: 0, exposedZip: 0, backDetail: 0, bardotStyle: 0,
}, BODY));
if (out.error) { console.error('DRAFT FAILED:', out.error); process.exit(2); }
if (out.issues && out.issues.length) { console.error('VALIDATOR BLOCKED:', out.issues); process.exit(2); }

const p = out.pattern;
const isChalk = (x) => /ruffle|bias binding|biye|şerit/i.test(x.name);
const paper = p.pieces.filter((x) => !isChalk(x));
const chalkPieces = p.pieces.filter((x) => isChalk(x));

const layout = packPieces(paper);
const { sheets, used } = usedCells(layout);

// ================= build the Turkish A4 pack =================
const pdf = new Pdf();
const M = 18;

// ---------- PAGE 1 — cover + piece/cut table ----------
{
  const c = new Ctx(A4.h);
  c.text(M, 24, 19, NAVY, STYLE, null);
  c.text(M, 34, 9.5, GREY, `Beden EU38  .  ${p.pieces.length} parça  .  ${p.fabricMeters140} m kumaş (140 cm en)  .  dokuma`, null);
  c.stroke(0.3, GREY); c.dash(null); c.line(M, 40, A4.w - M, 40);

  c.text(M, 51, 13, NAVY, 'Kesim tablosu', null);
  let y = 60;
  c.text(M, y, 8, GREY, 'PARÇA', null);
  c.text(M + 80, y, 8, GREY, 'ADET / KESİM', null);
  c.text(M + 128, y, 8, GREY, 'KUMAŞ / TELA', null);
  y += 2; c.stroke(0.2, GREY); c.line(M, y, A4.w - M, y); y += 6;
  const CUT = {
    'Top Front': ['1 adet KATLI kes (ön ortası katta)', 'ana kumaş'],
    'Top Back': ['2 adet kes', 'ana kumaş'],
  };
  const TRNAME = { 'Top Front': 'Ön Beden', 'Top Back': 'Arka Beden' };
  let code = 65;
  for (const piece of paper) {
    const label = `${String.fromCharCode(code)}. ${TRNAME[piece.name] || piece.name}`;
    const cf = CUT[piece.name] || [piece.cutInstruction, 'ana kumaş'];
    c.text(M, y, 9, INK, label, null);
    c.text(M + 80, y, 8.5, INK, cf[0], null);
    for (const ln of wrap(cf[1], 8, A4.w - M - (M + 128))) { c.text(M + 128, y, 8, INK, ln, null); y += 4.2; }
    y += 5;
    code++;
  }
  if (chalkPieces.length) {
    y += 3;
    c.text(M, y, 10.5, NAVY, 'Kumaşa tebeşirle çizilir (kağıt parça olarak basılmaz)', null); y += 7;
    for (const piece of chalkPieces) {
      const desc = `Biye şeridi (yaka + kol oyuntuları) — 1 şerit, 1116 x 25 mm, VEREV (grene 45°) kesilir, uç uca eklenir, toplam 1116 mm (kenar 1096 mm + bindirme), ikiye katlanıp kenara sarılır ve fazlası kesilir. Dikiş payı 6 mm.`;
      for (const ln of wrap(desc, 8.5, A4.w - 2 * M)) { c.text(M, y, 8.5, INK, ln, null); y += 4.6; }
      y += 2;
    }
  }

  y += 6;
  c.stroke(0.3, GREY); c.line(M, y, A4.w - M, y); y += 8;

  // BIG seam-allowance declaration (task requirement, uppercase)
  c.fill(HEX('#f3e9ec')); c.rect(M, y - 5, A4.w - 2 * M, 15, 'f');
  c.text(M + 4, y + 5, 12.5, CHERRY, 'TÜM DİKİŞ PAYLARI 1,5 CM (15 MM) DAHİLDİR.', null);
  y += 16;
  for (const ln of wrap('Biye 6 mm\'ye traşlanır. Etek ucu 2 cm çift kat kıvrılır. Dış çizgiyi (kesim çizgisi) kes, iç çizgiyi (dikiş çizgisi) dik.', 9, A4.w - 2 * M)) {
    c.text(M, y, 9, INK, ln, null); y += 5.2;
  }

  y += 6;
  c.text(M, y, 13, NAVY, 'Bu paket nasıl basılır', null); y += 8;
  for (const ln of wrap(`Kalıp ${sheets.length} adet A4 sayfaya, ${layout.cols} sütun genişliğinde döşenir (sol üst sayfa A1). %100 ölçekte, "sayfaya sığdır" KAPALI olarak bas. Kesmeden önce 2. sayfadaki 50 mm test karesini cetvelle ölç.`, 9, A4.w - 2 * M)) {
    c.text(M, y, 9, INK, ln, null); y += 5.2;
  }
  pdf.page(A4.w, A4.h, c.s);
}

// ---------- PAGE 2 — 50 mm test square (critical) ----------
{
  const c = new Ctx(A4.h);
  c.text(M, 24, 17, CHERRY, 'DUR — önce baskı ölçeğini kontrol et', null);
  let y = 38;
  for (const ln of wrap('Bu sayfayı %100 ölçekte bas. Yazıcı penceresinde "Sayfaya sığdır" / "Küçült" / "Ölçekle" seçeneklerini KAPAT. Sonra aşağıdaki kareyi cetvelle ölç: her kenar tam 50 mm olmalı. Değilse yazıcın ölçek uyguluyordur — düzelt ve yeniden bas, yoksa paketteki hiçbir parça birbirine uymaz.', 10.5, A4.w - 2 * M)) {
    c.text(M, y, 10.5, INK, ln, null); y += 6;
  }
  // 50 mm mm-true square
  const sx = M + 4, sy = y + 16;
  c.stroke(0.6, INK); c.dash(null);
  c.rect(sx, sy, 50, 50, 'S');
  c.text(sx + 25, sy - 3, 4, INK, '50 mm', 'middle');
  c.text(sx + 25, sy + 27, 3.4, GREY, 'ölç beni', 'middle');
  c.text(sx + 25, sy + 32, 3.4, GREY, 'iki kenar da = 50 mm', 'middle');
  // 1 inch reference bar
  c.stroke(0.5, INK);
  c.line(sx, sy + 58, sx + 25.4, sy + 58);
  c.line(sx, sy + 56.2, sx, sy + 59.8);
  c.line(sx + 25.4, sy + 56.2, sx + 25.4, sy + 59.8);
  c.text(sx + 12.7, sy + 63.5, 3.4, INK, '1 inç (25,4 mm)', 'middle');
  c.text(M, A4.h - 26, 9, GREY, 'Kare tam 50 mm ve inç çubuğu 25,4 mm ise kalıbın ölçeği doğrudur. Sayfaları bantlamaya geç.', null);
  pdf.page(A4.w, A4.h, c.s);
}

// ---------- PAGES 3.. — tiled pattern sheets (register geometry: sheet.js) ----
const padX = (A4.w - PAGE_W) / 2;
const padY = (A4.h - PAGE_H) / 2;
for (const { col, row } of sheets) {
  const c = new Ctx(A4.h);
  const svg = sheetInner(layout, col, row, used);
  renderSvgChunk(c, svg, col * PAGE_W - padX, row * PAGE_H - padY);
  c.text(padX, padY - 4, 8, GREY, `${STYLE}  .  sayfa ${sheetCode(row, col)}  .  ${layout.cols} sütun ızgara  .  %100 ölçekte bas`, null);
  pdf.page(A4.w, A4.h, c.s);
}

// ---------- PAGE — cutting layouts (140 cm AND 110 cm) ----------
{
  const c = new Ctx(A4.h);
  c.text(M, 24, 16, NAVY, 'Kesim şeması', null);
  c.text(M, 33, 9, GREY, `Metraj: 140 cm ende ${p.fabricMeters140} m. 110 cm ende ~1,5 m (aşağıda ayrı şema).`, null);

  // helper to draw a fabric strip layout schematic (not to scale, schematic)
  function fabricSchema(cx, cy, widthLabel, fabricW_mm, drawText) {
    // Fixed drawn column so the two schemas never collide on the page;
    // it is a schematic (labelled "temsilidir, ölçekli değildir"), the real
    // yardage number is stated in words below each column.
    const fw = 78;                 // drawn width of the fabric column (fits half page)
    const fh = 150;                // drawn fabric length (schematic)
    c.stroke(0.5, INK); c.dash(null);
    c.rect(cx, cy, fw, fh, 'S');
    // fold line down the middle-left (fabric folded selvedge to selvedge)
    c.stroke(0.4, GREY); c.dash([3, 2]);
    c.line(cx + fw / 2, cy, cx + fw / 2, cy + fh);
    c.dash(null);
    c.text(cx + fw / 2, cy - 3, 6, GREY, widthLabel, 'middle');
    c.text(cx + fw / 2 + 1, cy + fh / 2, 5, GREY, 'kat', 'middle');
    // front piece (on fold, left against the fold)
    c.fill(HEX('#e7edf5')); c.rect(cx + 4, cy + 8, fw / 2 - 8, 62, 'f');
    c.stroke(0.4, NAVY); c.rect(cx + 4, cy + 8, fw / 2 - 8, 62, 'S');
    c.text(cx + 4 + (fw / 2 - 8) / 2, cy + 40, 6, NAVY, 'A Ön (katlı)', 'middle');
    // back piece x2
    c.fill(HEX('#f0e9ee')); c.rect(cx + fw / 2 + 4, cy + 8, fw / 2 - 8, 40, 'f');
    c.stroke(0.4, CHERRY); c.rect(cx + fw / 2 + 4, cy + 8, fw / 2 - 8, 40, 'S');
    c.text(cx + fw / 2 + 4 + (fw / 2 - 8) / 2, cy + 26, 6, CHERRY, 'B Arka x2', 'middle');
    c.rect(cx + fw / 2 + 4, cy + 52, fw / 2 - 8, 40, 'f');
    c.stroke(0.4, CHERRY); c.rect(cx + fw / 2 + 4, cy + 52, fw / 2 - 8, 40, 'S');
    c.text(cx + fw / 2 + 4 + (fw / 2 - 8) / 2, cy + 70, 6, CHERRY, 'B Arka', 'middle');
    // biye strip along the bottom on the bias
    c.stroke(0.5, GREY); c.dash([2, 2]);
    c.line(cx + 4, cy + 100, cx + fw - 4, cy + 130);
    c.dash(null);
    c.text(cx + fw / 2, cy + fh + 8, 6, GREY, 'Biye şeridi VEREV (45°) kesilir', 'middle');
    for (let i = 0; i < drawText.length; i++) c.text(cx, cy + fh + 20 + i * 5, 8, INK, drawText[i], null);
  }
  fabricSchema(M, 48, '140 cm en', 1400, [
    'Kumaş kat (yüz yüze). Ön parça ön ortası katta.',
    `Metraj: ${p.fabricMeters140} m yeter.`,
  ]);
  fabricSchema(A4.w / 2 + 4, 48, '110 cm en', 1100, [
    'Dar ende parçalar alt alta yerleşir.',
    'Metraj: ~1,5 m (0,3 m fazlası biye + emniyet).',
  ]);

  let y = 250;
  c.stroke(0.3, GREY); c.line(M, y, A4.w - M, y); y += 8;
  c.text(M, y, 10, GREY, 'Şemalar temsilidir, ölçekli değildir. Parçaları grene (boy ipliği) paralel yerleştir; biyeyi 45° verevde kes.', null);
  pdf.page(A4.w, A4.h, c.s);
}

// ---------- PAGE — body vs finished-garment measurement tables ----------
{
  const c = new Ctx(A4.h);
  c.text(M, 24, 16, NAVY, 'Ölçü tabloları', null);
  let y = 38;

  c.text(M, y, 12.5, NAVY, '1) VÜCUT ölçüsü (EU38)', null); y += 4;
  c.text(M, y + 3, 8.5, GREY, 'Bu beden bu vücut ölçüleri için çizildi.', null); y += 10;
  const bodyRows = [
    ['Göğüs çevresi', '88 cm'],
    ['Bel çevresi', '70 cm'],
    ['Kalça çevresi', '94 cm'],
    ['Omuz genişliği', '37 cm'],
    ['Sırt boyu', '40,5 cm'],
    ['Boyun çevresi', '35 cm'],
  ];
  c.stroke(0.2, GREY); c.line(M, y, M + 120, y); y += 5;
  for (const [k, v] of bodyRows) { c.text(M, y, 9.5, INK, k, null); c.text(M + 100, y, 9.5, INK, v, 'end'); y += 6; }

  y += 8;
  c.text(M, y, 12.5, NAVY, '2) BİTMİŞ GİYSİ ölçüsü', null); y += 4;
  c.text(M, y + 3, 8.5, GREY, 'Dikilmiş atletin gerçek ölçüleri (dikiş payları çıkmış, düz serilmiş çevre).', null); y += 10;
  const garRows = [
    ['Göğüs çevresi (bitmiş)', '93,8 cm', '+5,8 cm bolluk (boxy)'],
    ['Etek ucu çevresi (bitmiş)', '93,2 cm', 'düz kesim, boxy'],
    ['Yaka açıklığı çevresi (bitmiş)', '35,0 cm', 'boyun ölçüsüne eşit'],
    ['Kol oyuntusu (bir taraf, bitmiş)', '37,3 cm', 'kolsuz, biye ile bitiriliyor'],
    ['Ön beden boyu (yaka-etek, crop)', '~37 cm', 'crop uzunluk'],
  ];
  c.stroke(0.2, GREY); c.line(M, y, A4.w - M, y); y += 5;
  c.text(M, y, 8, GREY, 'ÖLÇÜ', null); c.text(M + 95, y, 8, GREY, 'BİTMİŞ', null); c.text(M + 130, y, 8, GREY, 'NOT', null); y += 6;
  for (const [k, v, n] of garRows) {
    c.text(M, y, 9, INK, k, null); c.text(M + 95, y, 9, INK, v, null);
    for (const ln of wrap(n, 8, A4.w - M - (M + 130))) { c.text(M + 130, y, 8, GREY, ln, null); y += 4; }
    y += 4;
  }

  y += 10;
  c.fill(HEX('#fff7e0')); c.rect(M, y - 5, A4.w - 2 * M, 34, 'f');
  c.text(M + 4, y + 4, 11, CHERRY, 'ÖNEMLİ — YAKA / KUMAŞ UYARISI', null); y += 11;
  for (const ln of wrap('Bitmiş yaka açıklığı 35 cm çevredir. Bu atlet KAFADAN geçmelidir (fermuar/pat yok). 35 cm açıklık, ESNEK ÖRME (penye/jarse/ribana) kumaşta kafadan rahat geçer — referans model örme atlettir. DOKUMA (esnemeyen) kumaş kullanırsan 35 cm açıklık yetişkin kafasından GEÇMEZ; o durumda yaka açıklığını büyütmen ya da arkaya küçük bir düğme/pat açman gerekir. ÖNERİ: bu numuneyi hafif esnek örme kumaşla dik.', 9, A4.w - 2 * M - 8)) {
    c.text(M + 4, y, 9, INK, ln, null); y += 5;
  }
  pdf.page(A4.w, A4.h, c.s);
}

// ---------- PAGE — taping + numbered sewing instructions ----------
{
  const c = new Ctx(A4.h);
  c.text(M, 24, 16, NAVY, 'Sayfaları bantlama', null);
  let y = 36;
  const glue = [
    'Her A4\'ü kesikli sayfa çerçevesinden katla veya kes (çerçeve baskı alanını gösterir).',
    'Sayfaları ızgara sırasına diz: A1 sol üst, A2 sağına, B1 A1\'in altına... Izgara kodu her sayfanın sağ üst köşesinde.',
    'Kenarları üst üste getir: iki sayfanın siyah KÖŞE KARELERİ birleşip tek kare oluştursun, kenar ÇENTİKLERİ dikişte üst üste gelsin. Bantla.',
    'Sayfadan taşan bir kalıp çizgisinin yanında küçük bir ok, hangi sayfada devam ettiğini söyler — takip et.',
    'Bantlanınca ızgara tek sürekli alan gibi okunmalı, hiçbir ekte kayma olmamalı.',
  ];
  glue.forEach((s, i) => {
    for (const ln of wrap(`${i + 1}. ${s}`, 9.5, A4.w - 2 * M - 6)) { c.text(M + (ln.startsWith(`${i + 1}.`) ? 0 : 6), y, 9.5, INK, ln, null); y += 5.4; }
    y += 2;
  });

  y += 6;
  c.stroke(0.3, GREY); c.dash(null); c.line(M, y, A4.w - M, y); y += 9;
  c.text(M, y, 15, NAVY, 'Dikim talimatı (sırayla)', null); y += 5;
  c.text(M, y + 3, 8.5, GREY, 'Her adımdan önce parçaları kenar kenara koyup "yürüt" — sapma varsa mm cinsinden not et.', null); y += 10;
  const steps = [
    'Yaka kenarını, çalışırken esnemesin diye dikiş çizgisinin hemen içinden teyelle (staystitch).',
    'Ön beledeki pensi (dart) dik, ortaya doğru ütüle.',
    'Ön ve arka bedenleri omuz dikişlerinden birleştir, dikişleri açık ütüle.',
    'Biye şeridini hazırla: uçları gerektiği kadar ekle, boyuna ikiye katlayıp işaretli katlama çizgisinden ütüle.',
    'Yakayı biye ile temizle: yüz yüze, ham kenarlar aynı hizada, kavislerde biyeyi hafif gerdirerek ilerle. 6 mm\'ye traşla, katlı kenarı içe çevirip üstten dik veya el ile gizle.',
    'Yan dikişleri dik.',
    'Her kol oyuntusunu kendi biyesiyle temizle: ikiye katlı, yüz yüze bindir, kavisi gererek dik, içe çevirip üstten dik.',
    'Etek ucunu 2 cm çift kat kıvırıp dik.',
  ];
  steps.forEach((s, i) => {
    for (const ln of wrap(`${i + 1}. ${s}`, 9, A4.w - 2 * M - 6)) { c.text(M + (ln.startsWith(`${i + 1}.`) ? 0 : 6), y, 9, INK, ln, null); y += 5; }
    y += 2;
  });

  y += 4;
  c.stroke(0.3, GREY); c.line(M, y, A4.w - M, y); y += 8;
  c.text(M, y, 11, NAVY, 'Grene, çentik, katlama ve CF/CB işaretleri', null); y += 7;
  for (const ln of wrap('Her parçada bir GRENE (boy ipliği) oku var — kumaşın kenar selvedge\'ine paralel yerleştir. ÖN parça ön ortasından (CF) KATLI kesilir. ARKA 2 adet kesilir; arka ortası (CB) dikişli değil, katta değil — iki arka parça birbirine değil, ön parçaya omuz ve yandan birleşir. Yan dikişteki ÇENTİKLERİ ön ve arkada eşleştir. Fermuar YOK: gerçek kumaşı kesmeden önce yaka açıklığının kafandan geçtiğini kontrol et.', 9, A4.w - 2 * M)) {
    c.text(M, y, 9, INK, ln, null); y += 5.2;
  }
  pdf.page(A4.w, A4.h, c.s);
}

// ---------- PAGE — fabric type & weight recommendation ----------
{
  const c = new Ctx(A4.h);
  c.text(M, 24, 16, NAVY, 'Kumaş önerisi', null);
  let y = 40;
  const recs = [
    ['Önerilen (numune için)', 'Hafif–orta esnek ÖRME: penye (jersey), süprem, hafif ribana. 180–240 g/m². Boxy crop atletin duruşunu verir ve 35 cm yaka açıklığı kafadan rahat geçer.'],
    ['Dokuma denemek istersen', 'Poplin, keten karışımı, hafif gabardin (140–200 g/m²) — AMA dokuma esnemez; bu durumda yaka açıklığını büyüt ya da arka yakaya küçük düğme/ilik ekle, yoksa kafadan geçmez.'],
    ['Kaçın', 'Çok kalın/sert kumaş (kot, kaba keten) — boxy kesimde balon yapar. Çok ince şeffaf kumaş — biye kenarı belli olur.'],
    ['Biye', 'Aynı kumaştan verev (bias) şerit; ya da hazır 25 mm verev biye bant. Yakada ve kol oyuntularında kullanılır.'],
    ['Tela', 'Bu modelde tela gerekmez (yaka/pat yok).'],
    ['İğne/iplik', 'Örme için streç/jersey iğne + polyester iplik; dokuma için 70/80 universal iğne.'],
  ];
  recs.forEach(([k, v]) => {
    c.text(M, y, 10.5, NAVY, k, null); y += 6;
    for (const ln of wrap(v, 9, A4.w - 2 * M)) { c.text(M, y, 9, INK, ln, null); y += 5; }
    y += 4;
  });
  pdf.page(A4.w, A4.h, c.s);
}

// ---------- PAGE — tailor feedback form (blank checkboxes) ----------
{
  const c = new Ctx(A4.h);
  c.text(M, 24, 16, NAVY, 'Terzi geri bildirim formu', null);
  c.text(M, 33, 9, GREY, 'Lütfen numuneyi diktikten sonra doldurun. Ürünü birlikte iyileştiriyoruz.', null);
  let y = 48;
  const box = (yy) => { c.stroke(0.5, INK); c.dash(null); c.rect(M, yy - 4, 5, 5, 'S'); };
  const boxAt = (xx, yy) => { c.stroke(0.5, INK); c.dash(null); c.rect(xx, yy - 4, 5, 5, 'S'); };

  // 1
  c.text(M + 9, y, 10.5, INK, 'Parçalar birbirine eşleşti mi (kenarlar tuttu mu)?', null); box(y);
  c.text(M + 9, y + 8, 9, GREY, 'Evet', null); boxAt(M + 26, y + 8);
  c.text(M + 40, y + 8, 9, GREY, 'Hayır', null); boxAt(M + 59, y + 8);
  y += 22;

  // 2
  for (const ln of wrap('2. Belirsiz / anlaşılmayan bir adım oldu mu? Varsa yazın:', 10.5, A4.w - 2 * M)) { c.text(M, y, 10.5, INK, ln, null); y += 6; }
  for (let i = 0; i < 3; i++) { c.stroke(0.3, GREY); c.line(M, y + 6, A4.w - M, y + 6); y += 9; }
  y += 6;

  // 3
  c.text(M + 9, y, 10.5, INK, 'Verilen metraj yetti mi?', null); box(y);
  c.text(M + 9, y + 8, 9, GREY, 'Evet', null); boxAt(M + 26, y + 8);
  c.text(M + 40, y + 8, 9, GREY, 'Hayır — kaç metre gerekti?', null); boxAt(M + 59, y + 8);
  c.stroke(0.3, GREY); c.line(M + 100, y + 10, A4.w - M, y + 10);
  y += 22;

  // 4
  c.text(M, y, 10.5, INK, '4. Ölçü sapması gördün mü? (mm cinsinden, hangi kenar)', null); y += 8;
  c.stroke(0.3, GREY); c.line(M, y + 4, A4.w - M, y + 4); y += 10;
  c.stroke(0.3, GREY); c.line(M, y + 4, A4.w - M, y + 4); y += 16;

  // 5
  for (const ln of wrap('5. Bu kalıbı bir müşteriye verir miydin?', 10.5, A4.w - 2 * M)) { c.text(M, y, 10.5, INK, ln, null); y += 6; }
  c.text(M + 9, y + 4, 9, GREY, 'Evet', null); boxAt(M, y + 4);
  c.text(M + 45, y + 4, 9, GREY, 'Hayır', null); boxAt(M + 36, y + 4);
  y += 14;
  c.text(M, y, 9.5, INK, 'Neden?', null); y += 6;
  for (let i = 0; i < 3; i++) { c.stroke(0.3, GREY); c.line(M, y + 6, A4.w - M, y + 6); y += 9; }

  y += 10;
  c.stroke(0.3, GREY); c.line(M, y, A4.w - M, y); y += 8;
  c.text(M, y, 9, GREY, 'Terzi adı: ____________________          Tarih: ____________', null);
  pdf.page(A4.w, A4.h, c.s);
}

const buf = pdf.build();
const totalPages = pdf.pages.length;
const outPath = join(OUT, 'id82-numune-TR-a4.pdf');
writeFileSync(outPath, buf);

console.log(`OK — ${outPath}`);
console.log(`pages: ${totalPages}`);
console.log(`pattern sheets: ${sheets.length} (grid ${layout.cols} wide)`);
console.log(`fabric: ${p.fabricMeters140} m at 140 cm`);
console.log(`test square: 50 mm at ${(50 * MM).toFixed(3)} pt (mm-true)`);
console.log(`bytes: ${buf.length}`);
