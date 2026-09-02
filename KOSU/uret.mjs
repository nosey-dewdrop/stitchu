#!/usr/bin/env node
// KOSU/uret.mjs — KOSU/ciktilar/ altindaki SVG + PNG'leri ve KOSU/vitrin.html'i
// uretir. Cizimler tarayicinin yukledigi hattin ta kendisinden gelir
// (web/js/download.js flatSVG), yani vitrinde asili olan sey urunun ta kendisi.
//
//   node KOSU/uret.mjs
//
// PNG'ler headless Chrome ile basiliyor (repoda rsvg/imagemagick yok).

import { mkdirSync, writeFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..');
const OUT = join(here, 'ciktilar');
const require = createRequire(import.meta.url);

const BUNDLE = join(ROOT, 'web/vendor/stitchu-engine.js');
const engine = await require(BUNDLE)();
globalThis.document = {
  createElement: () => ({ click() {}, style: {} }),
  head: { appendChild: (el) => { queueMicrotask(() => el.onload && el.onload()); } },
};
globalThis.window = { createStitchuEngine: () => Promise.resolve(engine) };
globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };
const { flatSVG } = await import(join(ROOT, 'web/js/download.js'));

const BODY = { size: 'EU38' };
const SPECS = [
  ['01-elbise-duz-kol-bebe-yaka', 'elbise · duz kol · bebe yaka · A etek',
   { garment: 'dress', shaping: 'dart', fabric: 'woven', neckline: 'scoop', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', collarType: 'peterPan' }],
  ['02-elbise-balon-uzun-kol-dik-yaka', 'elbise · balon uzun kol · dik yaka · duz maxi etek',
   // neckline crew (2026-09-02 hakem karari 3): vNeck+stand kombosunda dik
   // yaka V'yi ucuna kadar takip ediyordu — konvansiyonun dogru uygulamasi ama
   // vitrinde garip; crew+stand durust vitrin. Kod degismedi, spec degisti.
   { garment: 'dress', shaping: 'dart', fabric: 'woven', neckline: 'crew', sleeveStyle: 'balloon', sleeveLength: 'long', skirtStyle: 'straight', skirtLength: 'maxi', collarType: 'stand' }],
  ['03-elbise-kolsuz', 'elbise · kolsuz · yakasiz · A etek',
   { garment: 'dress', shaping: 'dart', fabric: 'woven', neckline: 'crew', sleeveStyle: 'none', skirtStyle: 'aLine', skirtLength: 'midi' }],
  ['04-elbise-uzun-kol-yatik-yaka-mini', 'elbise · uzun kol · yatik yaka · mini A etek',
   { garment: 'dress', shaping: 'dart', fabric: 'woven', neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'long', skirtStyle: 'aLine', skirtLength: 'mini', collarType: 'flat' }],
  ['05-ust-balon-uzun-kol', 'ust · balon uzun kol · manset',
   { garment: 'top', shaping: 'dart', fabric: 'woven', neckline: 'vNeck', sleeveStyle: 'balloon', sleeveLength: 'long', topLength: 'hip' }],
  ['06-ust-kolsuz', 'ust · kolsuz · biye ile temizlenmis',
   { garment: 'top', shaping: 'dart', fabric: 'woven', neckline: 'crew', sleeveStyle: 'none', topLength: 'hip' }],
  ['07-etek-a-line', 'etek · A form · kemerli',
   { garment: 'skirt', shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine', skirtLength: 'midi' }],
  ['08-elbise-prenses', 'elbise · prenses dikis · duz kol · A etek',
   { garment: 'dress', shaping: 'princess', fabric: 'woven', neckline: 'scoop', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi' }],
  ['09-elbise-gomlek-yaka', 'elbise · duz kol · gomlek yakasi · A etek',
   { garment: 'dress', shaping: 'dart', fabric: 'woven', neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', collarType: 'shirt' }],
];

mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) if (/\.(svg|png)$/.test(f)) rmSync(join(OUT, f));

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
function png(svgPath, pngPath, w, h) {
  if (!existsSync(CHROME)) return false;
  const d = join(tmpdir(), `flatshot-${Math.random().toString(36).slice(2)}`);
  mkdirSync(d, { recursive: true });
  execFileSync('cp', [svgPath, join(d, 'a.svg')]);
  writeFileSync(join(d, 'i.html'),
    `<html><body style="margin:0;background:#fff"><img src="a.svg" style="width:${w}px;display:block"></body></html>`);
  try {
    // --user-data-dir izole: profil verilmeyince headless Chrome, ACIK duran
    // kullanici Chrome'unun SingletonLock'una takilip suresiz asili kaliyordu
    // (2026-09-02'de olculdu: 9 PNG'lik kosu 20+ dk asili kaldi, uc kez).
    execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars',
      `--user-data-dir=${d}/profil`,
      `--screenshot=${pngPath}`, `--window-size=${w},${h}`,
      '--no-sandbox', '--default-background-color=FFFFFF', `file://${d}/i.html`],
      // killSignal SIGKILL (2026-09-02 hakem karari 4): timeout'un varsayilan
      // SIGTERM'ini headless Chrome bazen yutup PNG basina 60 sn surundugu
      // icin; SIGKILL yutulamaz.
      { stdio: 'ignore', timeout: 60000, killSignal: 'SIGKILL' });
    return true;
  } catch { return false; } finally { rmSync(d, { recursive: true, force: true }); }
}

const made = [];
for (const [ad, baslik, spec] of SPECS) {
  const t0 = Date.now();
  const { svg } = await flatSVG(spec, BODY);
  const ms = Date.now() - t0;
  const svgPath = join(OUT, `${ad}.svg`);
  writeFileSync(svgPath, svg);
  // G2-goz (2026-09-02): the PNG was printed into a FIXED 760x900 window. The
  // SVG is 1:1 mm (~900-1100 mm wide), so a 2 mm outline landed at ~1.5 px and
  // a 1 mm seam under 1 px — hairlines a shopper can barely see next to any
  // vendor flat — and the fixed height left a dead white band under every
  // drawing whose aspect was wider than 760:900. The raster now follows the
  // SVG's own declared mm frame: 1.6 px/mm (outline ~3.2 px, like the
  // references), height from the drawing's own aspect, no dead band.
  const dim = svg.match(/width="([\d.]+)mm" height="([\d.]+)mm"/);
  const wmm = dim ? parseFloat(dim[1]) : 760, hmm = dim ? parseFloat(dim[2]) : 900;
  const pxW = Math.min(1700, Math.round(wmm * 1.6));
  const pxH = Math.round(pxW * hmm / wmm);
  png(svgPath, join(OUT, `${ad}.png`), pxW, pxH);
  made.push({ ad, baslik, ms, yol: `${ad}.png` });
  console.log(`${ad}  ${ms} ms  ${(svg.match(/<path/g) || []).length} path`);
}

// -------- VITRIN: bizim ciktimiz ile satici referanslari YAN YANA, yazi yok --
const REF_DIR = join(ROOT, 'GIRDI/iyi-flat/adaylar');
const refs = existsSync(REF_DIR)
  ? readdirSync(REF_DIR).filter((f) => /\.png$/i.test(f)).sort()
  : [];

const html = `<!doctype html>
<meta charset="utf-8">
<title>stitchu — vitrin</title>
<style>
  body { margin:0; background:#f2f2f0; font:14px/1.4 -apple-system,system-ui,sans-serif; color:#1f3a5f }
  .band { padding:24px }
  .band + .band { border-top:1px solid #d8d8d4 }
  h2 { font-size:13px; letter-spacing:.14em; text-transform:uppercase; font-weight:600; margin:0 0 16px }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px }
  figure { margin:0; background:#fff; border:1px solid #e2e2de; padding:10px }
  img { width:100%; height:auto; display:block }
</style>
<div class="band">
  <h2>stitchu — ${made.length} cizim, EU38</h2>
  <div class="grid">
${made.map((m) => `    <figure><img src="ciktilar/${m.yol}" alt=""></figure>`).join('\n')}
  </div>
</div>
<div class="band">
  <h2>satici referanslari — GIRDI/iyi-flat/adaylar</h2>
  <div class="grid">
${refs.map((f) => `    <figure><img src="../GIRDI/iyi-flat/adaylar/${f}" alt=""></figure>`).join('\n')}
  </div>
</div>
`;
writeFileSync(join(here, 'vitrin.html'), html);
console.log(`\nvitrin: ${join(here, 'vitrin.html')}  (${made.length} bizim + ${refs.length} referans)`);
