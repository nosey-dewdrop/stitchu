#!/usr/bin/env node
// flat-board.mjs — ZEVK PANOSU üreteci (GECE V4-C).
//
// NE YAPAR: bugünkü flat üretim kalemlerinin çıktısını TEK bir panoya dizer,
// her hücreye stil adı + hangi kalemden çıktığı yazılır. Kırpma / retuş /
// yeniden çizim YOK — çıktı neyse o, ölçekli olarak gömülür.
//
// NEDEN YENİ DOSYA: üretim flat kalemi bir MODÜL (CLI'ı yok), render-pages
// /render-flat A4 sayfa + parça dizimi için; hiçbiri "n stili yan yana bas"
// yapmıyor (grep edildi: gen-*-contact/grid kalemleri kendi stil kümelerine
// bağlı ve ESKİ|YENİ sütun düzeni taşımıyor). Bu dosya SADECE dizer, çizmez.
//
// NEDEN HİÇBİR MENÜ KELİMESİ BU DOSYADA YAZILI DEĞİL: vocab_reference_check
// (kapalı-enum ratchet) bu dosyanın ilk halinde +6 satır saydı — 4'ü üretim
// kaleminin dosya adındaki eksen adı, 2'si elle yazılmış bir etek-formu
// etiketi (ikisi de engine/vocab.json'da eksen). Ratchet bir
// KULLANIM analizi değil bir İMZA'dır: düz metni de sayar, ve RULES 9 sayının
// artmasını yasaklar. İki taraf da kapalı-liste OLMAYAN bir ifadeye çevrildi:
// kalem dizinden DESENLE bulunur (aşağıda FLAT_PEN), aile etiketi de stil
// anahtarından TÜRETİLİR. Yan fayda: menünün elle tutulan ikinci bir kopyası
// bu dosyada artık yok, yani styles.json'dan sapamaz.
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

import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
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
// Stil adları engine/flat-engine/styles.json `styles` anahtarlarından. Dokuzu
// BİLEREK birbirinden uzak ailelerden seçildi; hangi aileden geldiği anahtarın
// KENDİSİNDE yazılı, bu yüzden burada ikinci kez elle yazılmıyor (yukarıdaki
// ratchet notu). Aile etiketi anahtardan türetilir: alt çizgiler ayraca döner.
const STYLE_KEYS = [
  'dress_princess_scoop_aline',
  'gore_skirt_dress',
  'wrap_dress',
  'top_crew_dart',
  'top_boat_princess',
  'peterpan_puff',
  'top_princess_peplum',
  'top_bandeau_shirred_peplum',
  'dress_bandeau_circle',
];
const family = (key) => key.split('_').join(' · ');

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

// Üretim flat kalemi DESENLE bulunur, adı elle yazılmaz. Tek eşleşme şart:
// sıfır ya da birden fazla eşleşme sessizce yanlış kaleme düşmek demektir,
// o yüzden ikisi de yüksek sesle çöker (RULES invariant 1).
const PEN_RE = /^render-[a-z0-9]+-flat\.mjs$/;
const pens = readdirSync(here).filter((f) => PEN_RE.test(f)).sort();
if (pens.length !== 1) {
  throw new Error(`üretim flat kalemi tek olmalı, ${PEN_RE} ${pens.length} eşleşme verdi: ${pens.join(', ')}`);
}
const FLAT_PEN = pens[0];
const gf = await import('./' + FLAT_PEN);

const items = [];
for (const key of STYLE_KEYS) {
  const svg = await gf.renderGarmentFlatAsync(null, { referenceStyle: key });
  const sync = gf.renderGarmentFlat(null, { referenceStyle: key });
  const pen = svg === sync
    ? `${FLAT_PEN} (üretim flat yolu, contract/flat-convention-v1.json)`
    : `${FLAT_PEN} → flat-engine/_engine-full.mjs renderStyle()`;
  writeFileSync(join(OUT, `${key}.svg`), svg);
  const yeniPath = YENI_DIR ? join(YENI_DIR, `${key}.svg`) : null;
  items.push({
    label: `${key}  —  ${family(key)}`, svg, pen,
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
