#!/usr/bin/env node
// KOSU/kumas-farki.mjs — F4-kumas URUN CIKTISI.
// AYNI ELBISE, IKI KUMAS: cotton-modal-jersey (%50 strec orme) vs cotton-lawn
// (%0 strec dokuma). Kalip parcalari UST USTE iki renkte + flat'ler yan yana,
// farklar mm etiketiyle. Cizim SEVK EDILEN hattan gelir (web/vendor bundle +
// web/js/download.js flatSVG + web/js/fabric-catalog.js preset'i).
//
//   node KOSU/kumas-farki.mjs   ->  KOSU/ciktilar/kumas-farki.svg (+ .png varsa Chrome)

import { mkdirSync, writeFileSync, existsSync, readdirSync, copyFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..');
const OUT = join(here, 'ciktilar');
const require = createRequire(import.meta.url);

const engine = await require(join(ROOT, 'web/vendor/stitchu-engine.js'))();
globalThis.document = {
  createElement: () => ({ click() {}, style: {} }),
  head: { appendChild: (el) => { queueMicrotask(() => el.onload && el.onload()); } },
};
globalThis.window = { createStitchuEngine: () => Promise.resolve(engine) };
globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };
const { flatSVG } = await import(join(ROOT, 'web/js/download.js'));
const { applyFabricPreset, FABRIC_CATALOG } = await import(join(ROOT, 'web/js/fabric-catalog.js'));

const BODY = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40, armLength: 58, neck: 35 };
const SPEC = {
  garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
  neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'short',
  skirtStyle: 'gathered', skirtLength: 'midi', topLength: 'hip',
};

const A = 'cotton-lawn';           // %0 strec dokuma
const B = 'cotton-modal-jersey';   // %50 strec orme

const draftOf = (id) => {
  const wire = applyFabricPreset({ ...SPEC, fabricPreset: id });
  const d = JSON.parse(engine.draftJSON(wire, BODY));
  if (d.error || (d.issues || []).length) throw new Error(`${id}: ${d.error || d.issues.join('|')}`);
  return d;
};
const dA = draftOf(A), dB = draftOf(B);

// ── piece path helpers (mm space) ──────────────────────────────────────────
const pathOf = (cmds) => cmds.map((c) =>
  c.type === 'move' ? `M ${c.x} ${c.y}` :
  c.type === 'line' ? `L ${c.x} ${c.y}` :
  c.type === 'curve' ? `C ${c.cp1x} ${c.cp1y} ${c.cp2x} ${c.cp2y} ${c.x} ${c.y}` : 'Z').join(' ');
const bbox = (cmds) => {
  const xs = [], ys = [];
  for (const c of cmds) {
    for (const [kx, ky] of [['x', 'y'], ['cp1x', 'cp1y'], ['cp2x', 'cp2y']]) {
      if (typeof c[kx] === 'number') { xs.push(c[kx]); ys.push(c[ky]); }
    }
  }
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
};
const bottomWidth = (piece) => {
  const pts = [];
  for (const c of piece.commands) {
    for (const [kx, ky] of [['x', 'y'], ['cp1x', 'cp1y'], ['cp2x', 'cp2y']]) {
      if (typeof c[kx] === 'number') pts.push([c[kx], c[ky]]);
    }
  }
  const maxY = Math.max(...pts.map((p) => p[1]));
  const band = pts.filter((p) => p[1] > maxY - 60);
  return Math.max(...band.map((p) => p[0])) - Math.min(...band.map((p) => p[0]));
};

// Overlay the pieces both drafts share, piece by piece, lawn grey / jersey red.
const NAMES = ['Bodice Front', 'Bodice Back', 'Skirt Front', 'Sleeve'];
const S = 0.32;               // mm -> px
const colW = 30, rowH = 46;
let x = colW;
const cells = [];
let maxH = 0;
for (const name of NAMES) {
  const pa = dA.pattern.pieces.find((p) => p.name === name);
  const pb = dB.pattern.pieces.find((p) => p.name === name);
  if (!pa || !pb) continue;
  const ba = bbox(pa.commands), bb = bbox(pb.commands);
  const w = Math.max(ba.x1 - ba.x0, bb.x1 - bb.x0) * S;
  const h = Math.max(ba.y1 - ba.y0, bb.y1 - bb.y0) * S;
  const wa = bottomWidth(pa), wb = bottomWidth(pb);
  const dxA = -ba.x0 * S, dyA = -ba.y0 * S, dxB = -bb.x0 * S, dyB = -bb.y0 * S;
  const cw = Math.max(w, 190);
  cells.push({ name, x, w: cw, h, pa, pb, ba, bb, wa, wb, dxA, dyA, dxB, dyB });
  x += cw + colW;
  maxH = Math.max(maxH, h);
}
const panelW = x;
const headH = 92, labelH = 78;
const patH = headH + maxH + labelH;

// ── the two flats, embedded as nested SVGs under the pattern row ───────────
const stripDecl = (s) => s.replace(/<\?xml[^>]*\?>\s*/, '');
const sizeOf = (s) => {
  const m = /viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/.exec(s);
  return { w: Number(m[3]), h: Number(m[4]) };
};
const flatA = (await flatSVG({ ...SPEC, fabricPreset: A }, { size: 'EU38' })).svg;
const flatB = (await flatSVG({ ...SPEC, fabricPreset: B }, { size: 'EU38' })).svg;
const dataURI = (s) => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
const fa = sizeOf(flatA), fb = sizeOf(flatB);
const FS = 0.30;
const flatY = patH + 40;
const flatH = Math.max(fa.h, fb.h) * FS + 70;
const W = Math.max(panelW, (fa.w + fb.w) * FS + 3 * colW);
const H = flatY + flatH + 30;

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const parts = [];
parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W.toFixed(0)}" height="${H.toFixed(0)}" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" font-family="Helvetica, Arial, sans-serif">`);
parts.push(`<rect width="100%" height="100%" fill="#faf8f5"/>`);
parts.push(`<text x="${colW}" y="30" font-size="19" fill="#1a1a1a" font-weight="bold">AYNI ELBISE, IKI KUMAS — EU38, dart, buzgulu midi etek, kisa duz kol</text>`);
parts.push(`<text x="${colW}" y="52" font-size="13" fill="#555">gri = ${A} (%0 strec dokuma, 87 g/m2, 142 cm)   ·   kirmizi = ${B} (%50 strec orme — sinif-tipik bant alt ucu, OLCULMEDI — 200 g/m2, 148 cm)</text>`);
parts.push(`<text x="${colW}" y="70" font-size="12" fill="#555">orme kalibi negatif payla kesilir: min((1 − 1/1.5)×100, sinif tavani %5) = %5 — kaynaklar contract/fabric-catalog-v1.json</text>`);

for (const c of cells) {
  const gy = headH;
  parts.push(`<g transform="translate(${c.x},${gy})">`);
  parts.push(`<path d="${pathOf(c.pa.commands)}" transform="translate(${c.dxA},${c.dyA}) scale(${S})" fill="none" stroke="#8a8a8a" stroke-width="${(1.6 / S).toFixed(2)}"/>`);
  parts.push(`<path d="${pathOf(c.pb.commands)}" transform="translate(${c.dxB},${c.dyB}) scale(${S})" fill="none" stroke="#c0392b" stroke-width="${(1.6 / S).toFixed(2)}"/>`);
  parts.push(`</g>`);
  const ly = gy + maxH + 20;
  parts.push(`<text x="${c.x}" y="${ly}" font-size="13" fill="#1a1a1a" font-weight="bold">${esc(c.name)}</text>`);
  parts.push(`<text x="${c.x}" y="${ly + 17}" font-size="12" fill="#666">alt kenar ${c.wa.toFixed(1)} mm</text>`);
  parts.push(`<text x="${c.x}" y="${ly + 33}" font-size="12" fill="#c0392b">alt kenar ${c.wb.toFixed(1)} mm (${(c.wb - c.wa) >= 0 ? '+' : ''}${(c.wb - c.wa).toFixed(1)} mm)</text>`);
}

// waist girth callout, measured off the drawn pieces (front+back, both halves)
const beltA = 2 * (bottomWidth(dA.pattern.pieces.find((p) => p.name === 'Bodice Front')) + bottomWidth(dA.pattern.pieces.find((p) => p.name === 'Bodice Back')));
const beltB = 2 * (bottomWidth(dB.pattern.pieces.find((p) => p.name === 'Bodice Front')) + bottomWidth(dB.pattern.pieces.find((p) => p.name === 'Bodice Back')));
parts.push(`<text x="${colW}" y="${headH + maxH + labelH - 6}" font-size="14" fill="#1a1a1a">BEL KENARI TOPLAMI (cizimden): dokuma ${beltA.toFixed(1)} mm  →  orme ${beltB.toFixed(1)} mm  (${(beltB - beltA).toFixed(1)} mm)   |   metraj: ${dA.pattern.fabricMeters140} m @142cm vs ${dB.pattern.fabricMeters140} m @148cm esdegeri</text>`);

parts.push(`<text x="${colW}" y="${flatY - 8}" font-size="15" fill="#1a1a1a" font-weight="bold">SATILIR FLAT — solda ${A}, sagda ${B} (ikisi de kalibin izdusumu)</text>`);
parts.push(`<image x="${colW}" y="${flatY}" width="${(fa.w * FS).toFixed(1)}" height="${(fa.h * FS).toFixed(1)}" href="${dataURI(flatA)}"/>`);
parts.push(`<image x="${(colW * 2 + fa.w * FS).toFixed(1)}" y="${flatY}" width="${(fb.w * FS).toFixed(1)}" height="${(fb.h * FS).toFixed(1)}" href="${dataURI(flatB)}"/>`);
parts.push(`</svg>`);

mkdirSync(OUT, { recursive: true });
const svgPath = join(OUT, 'kumas-farki.svg');
writeFileSync(svgPath, parts.join('\n'));
console.log(`yazildi: ${svgPath}`);
console.log(`  bel kenari: ${A} ${beltA.toFixed(1)} mm | ${B} ${beltB.toFixed(1)} mm | fark ${(beltB - beltA).toFixed(1)} mm`);

// PNG via headless Chrome, same route as KOSU/uret.mjs.
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (existsSync(CHROME)) {
  const d = join(tmpdir(), `kumasfarki-${Math.random().toString(36).slice(2)}`);
  mkdirSync(d, { recursive: true });
  copyFileSync(svgPath, join(d, 'in.svg'));
  try {
    execFileSync(CHROME, ['--headless', '--disable-gpu', `--screenshot=${join(d, 'out.png')}`,
      `--window-size=${Math.ceil(W)},${Math.ceil(H)}`, '--default-background-color=FFFFFFFF',
      `file://${join(d, 'in.svg')}`], { stdio: 'ignore' });
    copyFileSync(join(d, 'out.png'), join(OUT, 'kumas-farki.png'));
    console.log(`yazildi: ${join(OUT, 'kumas-farki.png')}`);
  } catch (e) {
    console.log(`png basilamadi (Chrome): ${e.message}`);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
} else {
  console.log('Chrome yok — sadece SVG.');
}
