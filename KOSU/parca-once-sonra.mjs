#!/usr/bin/env node
// KOSU/parca-once-sonra.mjs — F5-parca ürün görseli.
// A-line kolsuz elbisenin (örme, streç %50) F5 ÖNCESİ / SONRASI parça yerleşimi:
// 5 parça -> 3 kesim parçası (+1 bitirme şeridi), gerekçeler görselde.
// ÖNCE verisi F5 kodu değişmeden ÖNCE alınmış gerçek motor çıktısıdır
// (KOSU/ciktilar/.once-parcalar.json, 2026-09-02 başında banka edildi);
// SONRA verisi şu anki motordan canlı çizilir. Çıktı: KOSU/ciktilar/parca-once-sonra.svg
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..');
const { draft } = await import(join(ROOT, 'engine/tools/spec-diff.mjs'));

const SPEC = { garment: 'dress', skirtStyle: 'aLine', sleeveStyle: 'none', fabric: 'knit', fabricStretchPct: 50 };
const once = JSON.parse(readFileSync(join(here, 'ciktilar/.once-parcalar.json'), 'utf8'))['aline-kolsuz'];
const simdi = (await draft(SPEC)).pattern.pieces;

// ── piece outline -> svg path (commands use x/y + cp1x.., or from/foldLine absent)
const pathOf = (cmds) => {
  let d = '', sx = 0, sy = 0;
  for (const c of cmds) {
    if (c.type === 'move') { d += `M${c.x.toFixed(1)},${c.y.toFixed(1)}`; sx = c.x; sy = c.y; }
    else if (c.type === 'line') d += `L${c.x.toFixed(1)},${c.y.toFixed(1)}`;
    else if (c.type === 'curve') d += `C${c.cp1x.toFixed(1)},${c.cp1y.toFixed(1)} ${c.cp2x.toFixed(1)},${c.cp2y.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`;
    else if (c.type === 'close') d += `L${sx.toFixed(1)},${sy.toFixed(1)}Z`;
  }
  return d;
};
const bboxOf = (cmds) => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const c of cmds) {
    for (const [x, y] of [[c.x, c.y], [c.cp1x, c.cp1y], [c.cp2x, c.cp2y]]) {
      if (typeof x !== 'number') continue;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};

// Bias binding strip'in geometrisi 1140mm'lik bir çubuk — görselde gerçek boyu
// yerleşimi ezer; şerit 1:1 çizilmez, etiketle temsil edilir (dürüst kısaltma,
// notu görselde yazılı).
const drawSet = (pieces, ox, baslik, altyazi) => {
  const S = 0.22; // mm -> px
  let cursorX = ox + 20, out = '', maxH = 0;
  out += `<text x="${ox + 20}" y="46" class="baslik">${baslik}</text>`;
  out += `<text x="${ox + 20}" y="66" class="alt">${altyazi}</text>`;
  const gy = 92;
  const strips = [];
  for (const p of pieces) {
    const isStrip = p.name.includes('Bias binding');
    if (isStrip) { strips.push(p); continue; }
    const bb = bboxOf(p.commands);
    const w = bb.w * S, h = bb.h * S;
    out += `<g transform="translate(${cursorX - bb.x * S},${gy - bb.y * S}) scale(1)">`;
    out += `<path d="${pathOf(p.commands)}" transform="scale(${S})" class="${(p.closure || '').includes('zipper') ? 'parca zip' : 'parca'}"/>`;
    if (p.markings && p.markings.length)
      out += `<path d="${pathOf(p.markings)}" transform="scale(${S})" class="pens"/>`;
    out += `</g>`;
    const cx = cursorX + Math.max(w, 90) / 2;
    out += `<text x="${cx}" y="${gy + h + 18}" class="ad" text-anchor="middle">${p.name}</text>`;
    out += `<text x="${cx}" y="${gy + h + 33}" class="cut" text-anchor="middle">${p.cutInstruction || ''}</text>`;
    if ((p.closure || '').includes('zipper'))
      out += `<text x="${cx}" y="${gy + h + 48}" class="zipnot" text-anchor="middle">⚡ ${p.closure}</text>`;
    maxH = Math.max(maxH, h + 56);
    cursorX += Math.max(w, 90) + 84;
  }
  let y = gy + maxH + 26;
  for (const p of strips) {
    out += `<rect x="${ox + 20}" y="${y}" width="220" height="10" class="serit"/>`;
    out += `<text x="${ox + 250}" y="${y + 9}" class="ad">${p.name} — 1:1 çizilmedi (1140mm şerit)</text>`;
    y += 26;
  }
  return { svg: out, endX: Math.max(cursorX, ox + 640), stripY: y };
};

// gerekce listesi
const gerekceList = (pieces, x, y) => {
  let out = `<text x="${x}" y="${y}" class="baslik2">gerekçeler (motorun kendi cümleleri)</text>`;
  let yy = y + 20;
  for (const p of pieces) {
    const g = p.gerekce || '(F5 öncesi: gerekçe alanı YOKTU — koşulsuz parça)';
    const sinif = p.sinif ? ` [${p.sinif}]` : '';
    out += `<text x="${x}" y="${yy}" class="ger">• ${p.name}${sinif}: ${g}</text>`;
    yy += 17;
  }
  return { svg: out, endY: yy };
};

const once5 = drawSet(once, 0, `ÖNCE — ${once.length} parça`,
  'koşulsuz arka fermuar + CB dikişli ayrı arka etek + sayıma giren bias şerit');
const kesimSayi = simdi.filter((p) => p.sinif !== 'bitirme').length;
const sonra = drawSet(simdi, 700, `SONRA — ${kesimSayi} kesim parçası (+${simdi.length - kesimSayi} bitirme)`,
  'geçiş kuralı: yaka 36.0cm × 1.5 (streç) = 54.0cm ≥ baş 51.0cm → fermuar düştü, etek tek kalıp');

let listY = Math.max(once5.stripY, sonra.stripY) + 30;
const g1 = gerekceList(once, 20, listY);
const g2 = gerekceList(simdi, 20, g1.endY + 14);
const H = g2.endY + 30;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="${H}" viewBox="0 0 1400 ${H}">
<style>
  text { font-family: Menlo, monospace; fill: #222; }
  .baslik { font-size: 19px; font-weight: bold; }
  .baslik2 { font-size: 14px; font-weight: bold; }
  .alt { font-size: 11px; fill: #666; }
  .ad { font-size: 11px; }
  .cut { font-size: 10px; fill: #666; }
  .ger { font-size: 11px; }
  .zipnot { font-size: 10px; fill: #b3261e; }
  .parca { fill: #f3ede4; stroke: #333; stroke-width: 1.4; vector-effect: non-scaling-stroke; }
  .zip { fill: #fbe3e0; stroke: #b3261e; }
  .pens { fill: none; stroke: #8a6d3b; stroke-width: 1; vector-effect: non-scaling-stroke; }
  .serit { fill: #ddd0b8; stroke: #333; }
</style>
<rect width="1400" height="${H}" fill="#fffdf8"/>
<text x="20" y="24" class="baslik">F5-parca — A-line kolsuz elbise (örme, streç %50): görseldeki kadar parça</text>
<line x1="680" y1="34" x2="680" y2="${listY - 20}" stroke="#bbb" stroke-dasharray="4 4"/>
${once5.svg}
${sonra.svg}
${g1.svg}
${g2.svg}
</svg>`;

const out = join(here, 'ciktilar/parca-once-sonra.svg');
writeFileSync(out, svg);
console.log(`yazildi: ${out}  (once ${once.length} parca -> sonra ${kesimSayi} kesim + ${simdi.length - kesimSayi} bitirme)`);
