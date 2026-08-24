#!/usr/bin/env node
// flat-board.mjs — ZEVK PANOSU üreteci (GECE V4-C).
//
// NE YAPAR: bugünkü flat üretim kalemlerinin çıktısını TEK bir panoya dizer,
// her hücreye stil adı + hangi kalemden çıktığı yazılır. Kırpma / retuş /
// yeniden çizim YOK — çıktı neyse o, ölçekli olarak gömülür.
//
// NEDEN YENİ DOSYA: render-garment-flat.mjs bir MODÜL (CLI'ı yok), render-pages
// /render-flat A4 sayfa + parça dizimi için; hiçbiri "n stili yan yana bas"
// yapmıyor (grep edildi: gen-*-contact/grid kalemleri kendi stil kümelerine
// bağlı ve ESKİ|YENİ sütun düzeni taşımıyor). Bu dosya SADECE dizer, çizmez.
//
// DÜZEN (V4-D bunu aynen kullanacak):
//   Her SATIR = bir stil. Sol sütun = ESKİ (bugünkü çıktı). Sağ sütun = YENİ,
//   bugün BOŞ bırakılır. `--yeni <dir>` verilirse sağ sütun o dizindeki
//   <stil>.svg dosyalarından doldurulur; verilmezse "YENİ — boş" kutusu basılır.
//
//   node engine/tools/flat-board.mjs <outDir> [--yeni <dir>]
//
// Hücre içi SVG'ler <svg x y width height viewBox> olarak GÖMÜLÜR:
// preserveAspectRatio="xMidYMid meet", yani ölçeklenir ama KIRPILMAZ.

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rasterise } from './raster.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(here, '../..');

const OUT = process.argv[2] || '/tmp/stitchu-flat-board';
const yeniIdx = process.argv.indexOf('--yeni');
const YENI_DIR = yeniIdx > 0 ? process.argv[yeniIdx + 1] : null;

// --- pano kalemleri --------------------------------------------------------
// Stil adları engine/flat-engine/styles.json `styles` anahtarlarından.
// Aileler BİLEREK birbirinden uzak seçildi (elbise · üst · prenses · puf kol ·
// peplum · bandeau · gore · wrap).
const STYLES = [
  { key: 'dress_princess_scoop_aline', family: 'elbise · prenses · A-line' },
  { key: 'gore_skirt_dress',           family: 'elbise · gore etek' },
  { key: 'wrap_dress',                 family: 'elbise · kruvaze' },
  { key: 'top_crew_dart',              family: 'üst · pensli' },
  { key: 'top_boat_princess',          family: 'üst · prenses' },
  { key: 'peterpan_puff',              family: 'üst · puf kol · peter pan yaka' },
  { key: 'top_princess_peplum',        family: 'üst · peplum' },
  { key: 'top_bandeau_shirred_peplum', family: 'üst · bandeau · büzgü' },
  { key: 'dress_bandeau_circle',       family: 'elbise · bandeau · daire etek' },
];

const NAVY = '#1f3a5f';
const RULE = '#c8d2df';

// --- SVG gömme -------------------------------------------------------------
function embed(svg, x, y, w, h) {
  const vb = svg.match(/viewBox="([^"]+)"/);
  if (!vb) throw new Error('viewBox yok, gömülemez');
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vb[1]}" ` +
    `preserveAspectRatio="xMidYMid meet" overflow="visible">${inner}</svg>`;
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const txt = (x, y, s, size, weight, anchor, fill) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor || 'start'}" font-family="Helvetica,Arial,sans-serif" ` +
  `font-size="${size}" font-weight="${weight || 400}" fill="${fill || NAVY}">${esc(s)}</text>`;

// --- ölçüler ---------------------------------------------------------------
const PAD = 46, HEAD = 128, COLGAP = 34, ROWGAP = 30;
const CELL_W = 640, CELL_H = 460, CAPTION = 58;
const ROW_H = CELL_H + CAPTION + ROWGAP;
const BOARD_W = PAD * 2 + CELL_W * 2 + COLGAP;

function cell(x, y, svg, label, pen, side) {
  let s = `<rect x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H}" fill="#fff" stroke="${RULE}" stroke-width="1.5"/>`;
  if (svg) s += embed(svg, x + 10, y + 10, CELL_W - 20, CELL_H - 20);
  else {
    s += txt(x + CELL_W / 2, y + CELL_H / 2, 'YENİ — boş (V4-D dolduracak)', 26, 600, 'middle', '#9fb0c4');
  }
  s += txt(x, y + CELL_H + 26, label, 22, 700);
  s += txt(x, y + CELL_H + 48, pen, 16, 400, 'start', '#5c7080');
  return s;
}

function board(items, title, sub) {
  const H = HEAD + items.length * ROW_H + PAD;
  let inner = `<rect width="${BOARD_W}" height="${H}" fill="#ffffff"/>`;
  inner += txt(PAD, 56, title, 34, 700);
  inner += txt(PAD, 84, sub, 17, 400, 'start', '#5c7080');
  inner += txt(PAD, HEAD - 14, 'ESKİ — bugünkü çıktı (kırpmasız)', 20, 700);
  inner += txt(PAD + CELL_W + COLGAP, HEAD - 14, 'YENİ', 20, 700, 'start', '#9fb0c4');
  inner += `<line x1="${PAD}" y1="${HEAD - 6}" x2="${BOARD_W - PAD}" y2="${HEAD - 6}" stroke="${RULE}" stroke-width="1.5"/>`;
  items.forEach((it, i) => {
    const y = HEAD + 18 + i * ROW_H;
    inner += cell(PAD, y, it.svg, it.label, it.pen, 'eski');
    inner += cell(PAD + CELL_W + COLGAP, y, it.yeni || null, it.label, it.yeni ? it.yeniPen : '—', 'yeni');
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOARD_W} ${H}" width="${BOARD_W}" height="${H}">${inner}</svg>`;
}

// --- üretim ----------------------------------------------------------------
mkdirSync(OUT, { recursive: true });
const gf = await import('./render-garment-flat.mjs');

const items = [];
for (const st of STYLES) {
  const svg = await gf.renderGarmentFlatAsync(null, { referenceStyle: st.key });
  const sync = gf.renderGarmentFlat(null, { referenceStyle: st.key });
  const pen = svg === sync
    ? 'render-garment-flat.mjs (üretim flat yolu, contract/flat-convention-v1.json)'
    : 'render-garment-flat.mjs → flat-engine/_engine-full.mjs renderStyle()';
  writeFileSync(join(OUT, `${st.key}.svg`), svg);
  const yeniPath = YENI_DIR ? join(YENI_DIR, `${st.key}.svg`) : null;
  items.push({
    label: `${st.key}  —  ${st.family}`, svg, pen,
    yeni: yeniPath && existsSync(yeniPath) ? readFileSync(yeniPath, 'utf8') : null,
    yeniPen: 'YENİ kalem',
  });
}

// shell-flat: hesaplanan kabuk konturu (C++ motorun kendi çıktısı)
const shellSvg = execFileSync(join(REPO, 'engine/build/shell-flat'), ['EU38', '--svg'], { encoding: 'utf8' });
writeFileSync(join(OUT, 'shell-flat-EU38.svg'), shellSvg);
items.push({
  label: 'shell-flat EU38  —  hesaplanan kabuk konturu (stil değil)',
  svg: shellSvg, pen: 'engine/build/shell-flat EU38 --svg (GarmentSurf)',
  yeni: null, yeniPen: '—',
});

// panoyu sayfalara böl (tek PNG çok uzun olurdu; düzen her sayfada AYNI)
const PER = 5;
const stamp = new Date().toISOString().slice(0, 10);
const pngs = [];
for (let i = 0, p = 1; i < items.length; i += PER, p++) {
  const chunk = items.slice(i, i + PER);
  const total = Math.ceil(items.length / PER);
  const svg = board(chunk, `ZEVK PANOSU — ESKİ (sayfa ${p}/${total})`,
    `stitchu · ${stamp} · kırpma/retuş/yeniden çizim YOK · sağ sütun V4-D için ayrıldı`);
  const svgPath = join(OUT, `board-eski-${p}.svg`);
  const pngPath = join(OUT, `board-eski-${p}.png`);
  writeFileSync(svgPath, svg);
  rasterise(svgPath, pngPath, 1600);
  pngs.push(pngPath);
}
console.log(pngs.join('\n'));
