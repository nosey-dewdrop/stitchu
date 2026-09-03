#!/usr/bin/env node
// KOSU/primitif-5.mjs — KOMPOZISYON GIYSILERININ URUNU.
//
// contract/primitives-v1.json'daki `kompozisyonlar` blogunun HER kalemi icin
// KALIP (patternSVG) ve FLAT (flatSVG) cizilir; CIZILEBILENLER tek bir levhaya
// yan yana basilir: KOSU/ciktilar/primitif-5.png (+ .svg).
//
// ⚖ IKI KURAL, 2026-09-03 (hakem maddeleri 2 ve 3):
//
//  1. KOSU KENDI URETMEDIGI DOSYAYI KLASORDE BIRAKMAZ. Onceki kosuda kapi K2
//     ve K5 icin "flat: ADIYLA RET" diyordu, ama klasorde o iki giysinin
//     ONCEKI kosudan kalma flat SVG'leri DURUYORDU (mtime 08:07 vs 08:28) ve
//     acan herkes 8 basarili giysi goruyordu. Bir kosu, bayat bir ciktinin
//     uzerinden kendi hukmunu YALANLAYAMAZ: uretimden once eski primitif-*
//     ciktilarinin hepsi SILINIR.
//  2. REDDEDILEN GIYSININ FLAT'I KLASORDE DURMAZ. Yerine reddin gerekcesini
//     tasiyan `primitif-<ad>-flat-RET.txt` yazilir, ve o giysi levhaya
//     GIRMEZ — levhada yalnizca gercekten cizilmis giysiler asilidir.
//
// Giysiler SABIT MENUDEN CIKMIYOR: engine/tests/primitif_ifade_check.mjs her
// biri icin sozlugun 132 degerini tek tek cizdirip carpisma arar, ve AYRICA
// her birinin adini veren ozelligi cizimde SAYAR.
//
//   node KOSU/primitif-5.mjs
import { mkdirSync, writeFileSync, readdirSync, rmSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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
const { flatSVG, patternSVG } = await import(join(ROOT, 'web/js/download.js'));
const { engineSpec, bodyForSize } = await import(join(ROOT, 'web/js/engine.js'));
const { rasterise } = await import(join(ROOT, 'engine/tools/raster.mjs'));

const PRIM = JSON.parse(readFileSync(join(ROOT, 'contract/primitives-v1.json'), 'utf8'));
const BODY = { size: 'EU38' };
const M = { ...bodyForSize('EU38'), upperBust: 0 };
mkdirSync(OUT, { recursive: true });

// (1) KOSU KENDI URETMEDIGI DOSYAYI BIRAKMAZ.
let silinen = 0;
for (const f of readdirSync(OUT)) {
  if (/^primitif-/.test(f)) { rmSync(join(OUT, f), { force: true }); silinen++; }
}
console.log(`eski primitif-* ciktisi silindi: ${silinen}`);

const kartlar = [];
for (const [ad, k] of Object.entries(PRIM.kompozisyonlar)) {
  if (ad.startsWith('_')) continue;
  const spec = Object.assign({}, k.taban, ...k.eksenler);
  const t0 = Date.now();
  const drafted = JSON.parse(engine.draftJSON(engineSpec(spec), M));
  if (drafted.error) { console.log(`${ad}  MOTOR REDDETTI: ${drafted.error}`); continue; }
  const kalip = patternSVG(drafted.pattern);
  writeFileSync(join(OUT, `primitif-${ad}-kalip.svg`), kalip);
  let flat = null, flatRet = null;
  try { flat = (await flatSVG(spec, BODY)).svg; } catch (e) { flatRet = e.message; }
  if (flat) {
    writeFileSync(join(OUT, `primitif-${ad}-flat.svg`), flat);
  } else {
    // (2) Reddedilen giysinin flat'i klasorde DURMAZ; yerine reddin kendisi.
    writeFileSync(join(OUT, `primitif-${ad}-flat-RET.txt`),
      `${k.baslik}\n\nCIZIM HATTI BU SINIFI CIZEMEDI VE ADIYLA REDDETTI:\n${flatRet}\n\n` +
      `Bu kalem canli listede duruyorsa kapi KIRMIZI yanar: contract/primitives-v1.json\n` +
      `-> ya cizilecek ya dusen_kompozisyonlar blogunda kok sebep + sonraki adimla dusecek.\n`);
  }
  const eksenAdlari = k.eksenler.map((e) => Object.entries(e).map(([a, v]) => `${a}=${v}`).join(' '));
  kartlar.push({ ad, baslik: k.baslik, eksenler: eksenAdlari, kalip, flat, flatRet,
    parca: drafted.pattern.pieces.length, ms: Date.now() - t0 });
  console.log(`${ad}  ${drafted.pattern.pieces.length} parca  ${Date.now() - t0} ms  flat: ${flat ? 'cizildi' : 'ADIYLA RET'}`);
}

// ------------------------------------------------------- DUSEN KOMPOZISYONLAR
// Hakem karari 1 (2026-09-03): cizilemeyen kompozisyon listeden duser. Sessizce
// silinmez — kalibi burada YINE uretilir (dusen sey CIZIM, giysi degil) ve
// dusme sebebi klasorde yazili durur.
for (const [ad, k] of Object.entries(PRIM.dusen_kompozisyonlar || {})) {
  if (ad.startsWith('_')) continue;
  const spec = Object.assign({}, k.taban, ...k.eksenler);
  const drafted = JSON.parse(engine.draftJSON(engineSpec(spec), M));
  if (drafted.error) { console.log(`DUSEN ${ad}  MOTOR REDDETTI: ${drafted.error}`); continue; }
  writeFileSync(join(OUT, `primitif-DUSEN-${ad}-kalip.svg`), patternSVG(drafted.pattern));
  writeFileSync(join(OUT, `primitif-DUSEN-${ad}.txt`),
    `${k.baslik}\n\nDUSTU (${k.dusme_tarihi}) — KALIP CIKIYOR (${drafted.pattern.pieces.length} parca), ` +
    `CIZILEMEYEN SEY FLAT.\n\nKOK SEBEP:\n${k.kok_sebep}\n\nSONRAKI ADIM:\n${k.sonraki_adim}\n`);
  console.log(`DUSEN ${ad}  ${drafted.pattern.pieces.length} parca kalip yazildi, flat YOK`);
}

// ---------------------------------------------------------------- LEVHA
// Levhaya YALNIZCA cizilmis giysiler girer. Her satir: solda kalip, sagda flat.
// Ic ic gecmis <svg> kullanilir, boylece her cizim KENDI viewBox'ini korur ve
// hicbir sey kirpilmaz (qlmanage -s ile alinan kare ilk turda K7'yi kirpmisti;
// rasterlestirme repo'nun kendi engine/tools/raster.mjs'iyle yapilir).
const cizilen = kartlar.filter((c) => c.flat);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const govde = (svg) => {
  const i = svg.indexOf('>', svg.indexOf('<svg'));
  const j = svg.lastIndexOf('</svg>');
  const vb = /viewBox="([\d.\-\s]+)"/.exec(svg);
  return { ic: svg.slice(i + 1, j), vb: vb ? vb[1].trim() : '0 0 100 100' };
};
const INK = '#1f3a5f';
const HUCRE_W = 1150, HUCRE_H = 780, PAD = 40, BASLIK = 80;
const W = PAD * 2 + HUCRE_W * 2 + 40;
const H = 120 + cizilen.length * (HUCRE_H + BASLIK);
const parcalar = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
  `<rect width="${W}" height="${H}" fill="#ffffff"/>`,
  `<g font-family="sans-serif" fill="${INK}">`,
  `<text x="${PAD}" y="46" font-size="26" font-weight="600">stitchu — KOMPOZISYON GIYSILERI · EU38</text>`,
  `<text x="${PAD}" y="74" font-size="15">Hicbiri sabit menuden cikmiyor: her biri icin sozlugun 132 degeri tek tek cizdirildi, hicbir tek deger ayni cizimi vermedi.</text>`,
  `<text x="${PAD}" y="96" font-size="15">Her giysinin ADINI veren ozellik cizimde SAYILDI (engine/tests/primitif_ifade_check.mjs). Sozluk bu kosuda BAYT-AYNI kaldi.</text>`,
  '</g>',
];
cizilen.forEach((c, i) => {
  const y0 = 120 + i * (HUCRE_H + BASLIK);
  parcalar.push(`<g font-family="sans-serif" fill="${INK}">`);
  parcalar.push(`<text x="${PAD}" y="${y0 + 26}" font-size="19" font-weight="600">${esc(c.baslik)}</text>`);
  parcalar.push(`<text x="${PAD}" y="${y0 + 50}" font-size="13" fill="#6a7a8c">${esc(c.eksenler.join('   +   '))}   ·   ${c.parca} parca</text>`);
  parcalar.push('</g>');
  [c.kalip, c.flat].forEach((svg, j) => {
    const g = govde(svg);
    const x = PAD + j * (HUCRE_W + 40);
    parcalar.push(`<rect x="${x}" y="${y0 + BASLIK}" width="${HUCRE_W}" height="${HUCRE_H}" fill="none" stroke="#e6e6e2"/>`);
    parcalar.push(`<svg x="${x + 8}" y="${y0 + BASLIK + 8}" width="${HUCRE_W - 16}" height="${HUCRE_H - 16}" ` +
                  `viewBox="${g.vb}" preserveAspectRatio="xMidYMid meet">${g.ic}</svg>`);
    parcalar.push(`<text x="${x + 8}" y="${y0 + BASLIK + HUCRE_H - 6}" font-family="sans-serif" font-size="11" ` +
                  `letter-spacing="1.6" fill="#8a97a6">${j ? 'FLAT' : 'KALIP'}</text>`);
  });
});
parcalar.push('</svg>');
const svgPath = join(OUT, 'primitif-5.svg');
writeFileSync(svgPath, parcalar.join('\n'));
const pngPath = join(OUT, 'primitif-5.png');
rasterise(svgPath, pngPath, Math.max(2400, W));

const ret = kartlar.filter((c) => !c.flat);
console.log(`\nlevhada ${cizilen.length} giysi  ->  ${pngPath}`);
if (ret.length) console.log(`levhaya GIRMEYEN (flat adiyla reddedildi): ${ret.map((c) => c.ad).join(', ')}`);
