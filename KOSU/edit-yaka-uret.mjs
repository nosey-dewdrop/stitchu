#!/usr/bin/env node
// KOSU/edit-yaka-uret.mjs — F7-edit URUN CIKTISI.
//
// Ayni elbisenin edit ONCESI ve SONRASI (yakayi 2cm derinlestir) hali:
// kalip (panel cizimleri) + flat (satilir teknik cizim) yan yana, tek dosyada.
// Kalip web/js/engine.js engineSpec -> wasm draftJSON hattindan, flat sevk
// edilen web/js/download.js flatSVG hattindan gelir — vitrinde asili olan sey
// urunun ta kendisi (KOSU/uret.mjs ile ayni disiplin).
//
//   node KOSU/edit-yaka-uret.mjs
//
// Cikti: KOSU/ciktilar/edit-yaka.svg + edit-yaka.png (gitignore'da, commit yok).
import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
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
const { draft, patternSVG } = await import(join(ROOT, 'engine/tools/spec-diff.mjs'));
const { pieceBytes } = await import(join(ROOT, 'engine/tools/spec-diff.mjs'));

const BASE = {
  garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
  neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'long',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
};
const EDITED = { ...BASE, editNeckDeepenMM: 20 }; // "yakayi 2cm derinlestir"

const once = await draft(BASE);
const sonra = await draft(EDITED);
if (once.error || sonra.error) {
  console.error('URETIM HATASI:', once.error || sonra.error);
  process.exit(1);
}
const bm = new Map(once.pattern.pieces.map((p) => [p.name, pieceBytes(p)]));
const changed = new Set(sonra.pattern.pieces
  .filter((p) => bm.get(p.name) !== pieceBytes(p)).map((p) => p.name));
console.log('degisen paneller:', [...changed].join(', ') || '-');
const editStep = sonra.pattern.edit && sonra.pattern.edit.adimlar
  .find((a) => a.op === 'op.neckDeepen');
if (!editStep || !editStep.uygulandi) {
  console.error('op.neckDeepen UYGULANMADI:', editStep && editStep.ret_gerekcesi);
  process.exit(1);
}
console.log('motorun cumlesi:', editStep.sebep);

const kalipOnce = patternSVG(once.pattern, new Set(), 'KALIP - ONCE (crew yaka)');
const kalipSonra = patternSVG(sonra.pattern, changed, 'KALIP - SONRA (yaka 2cm derin)');
const flatOnce = (await flatSVG(BASE, { size: 'EU38' })).svg;
const flatSonra = (await flatSVG(EDITED, { size: 'EU38' })).svg;

// Dort cizimi tek SVG'de 2x2 yerlestir. Nested <svg> kendi viewBox'unu korur;
// geometriye dokunulmaz, sadece hucreye sigdirilir.
const cell = (svg, x, y, w, h) => svg
  .replace(/<svg /, `<svg x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" `)
  .replace(/ width="[0-9.]+mm"/, '')
  .replace(/ height="[0-9.]+mm"/, '');
const W = 1700, H = 1300, half = W / 2, row = (H - 110) / 2;
const birlesik = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#faf8f4"/>
<text x="24" y="34" font-family="monospace" font-size="22" fill="#111">F7-edit: "yakayı 2cm derinleştir" — kalıp + flat, önce/sonra (EU38, aynı elbise)</text>
${editStep.sebep.split('. ').map((s, i) =>
  `<text x="24" y="${56 + i * 18}" font-family="monospace" font-size="13" fill="#555">${s.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`).join('\n')}
${cell(kalipOnce, 0, 110, half, row)}
${cell(kalipSonra, half, 110, half, row)}
${cell(flatOnce, 0, 110 + row, half, row)}
${cell(flatSonra, half, 110 + row, half, row)}
<line x1="${half}" y1="110" x2="${half}" y2="${H}" stroke="#d8d2c8"/>
</svg>`;

mkdirSync(OUT, { recursive: true });
const svgPath = join(OUT, 'edit-yaka.svg');
writeFileSync(svgPath, birlesik);
console.log('yazildi:', svgPath);

// PNG headless Chrome ile (KOSU/uret.mjs ile ayni yontem; repoda rsvg yok).
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (existsSync(CHROME)) {
  const d = join(tmpdir(), `edityaka-${Math.random().toString(36).slice(2)}`);
  const pngPath = join(OUT, 'edit-yaka.png');
  execFileSync(CHROME, [
    '--headless', '--disable-gpu', `--user-data-dir=${d}`,
    `--screenshot=${pngPath}`, `--window-size=${W},${H}`, '--force-device-scale-factor=1',
    `file://${svgPath}`,
  ], { stdio: 'ignore' });
  rmSync(d, { recursive: true, force: true });
  console.log('yazildi:', pngPath);
} else {
  console.log('Chrome yok — PNG atlandi, SVG duruyor.');
}
