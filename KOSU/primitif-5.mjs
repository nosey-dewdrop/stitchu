#!/usr/bin/env node
// KOSU/primitif-5.mjs — KOMPOZISYON GIYSILERININ URUNU.
//
// contract/primitives-v1.json'daki `kompozisyonlar` blogunun HER kalemi icin
// KALIP (patternSVG) ve FLAT (flatSVG) cizilir, ikisi yan yana tek bir PNG
// levhaya basilir: KOSU/ciktilar/primitif-5.png. Yani vitrinde asili olan sey
// kapinin yesil yaktigi giysinin ta kendisidir, onun bir tarifi degil.
//
// Giysiler SABIT MENUDEN CIKMIYOR: engine/tests/primitif_ifade_check.mjs her
// biri icin sozlugun 132 degerini tek tek cizdirip carpisma aramistir.
//
//   node KOSU/primitif-5.mjs
import { mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from 'node:fs';
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
const { flatSVG, patternSVG } = await import(join(ROOT, 'web/js/download.js'));
const { engineSpec, bodyForSize } = await import(join(ROOT, 'web/js/engine.js'));

const PRIM = JSON.parse(readFileSync(join(ROOT, 'contract/primitives-v1.json'), 'utf8'));
const BODY = { size: 'EU38' };
const M = { ...bodyForSize('EU38'), upperBust: 0 };
mkdirSync(OUT, { recursive: true });

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
function shot(htmlPath, pngPath, w, h) {
  if (!existsSync(CHROME)) return false;
  const d = join(tmpdir(), `primitif-${Math.random().toString(36).slice(2)}`);
  mkdirSync(d, { recursive: true });
  try {
    execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars',
      `--user-data-dir=${d}/profil`, `--screenshot=${pngPath}`, `--window-size=${w},${h}`,
      '--no-sandbox', '--default-background-color=FFFFFF', `file://${htmlPath}`],
      { stdio: 'ignore', timeout: 120000, killSignal: 'SIGKILL' });
    return true;
  } catch { return false; } finally { rmSync(d, { recursive: true, force: true }); }
}

const kartlar = [];
for (const [ad, k] of Object.entries(PRIM.kompozisyonlar)) {
  if (ad.startsWith('_')) continue;
  const spec = Object.assign({}, k.taban, ...k.eksenler);
  const t0 = Date.now();
  const drafted = JSON.parse(engine.draftJSON(engineSpec(spec), M));
  if (drafted.error) { console.log(`${ad}  MOTOR REDDETTI: ${drafted.error}`); continue; }
  const kalip = patternSVG(drafted.pattern);
  // Flat REDDEDILEBILIR ve reddi de bir cevaptir: cizim hattinin bu sinifi
  // henuz cizemedigi levhada ADIYLA yazar. Yanlis bir resim basmaktansa
  // (roba bolmesinde elbisenin ETEK olarak basilmasi gibi) sebep basilir.
  let flat = null, flatRet = null;
  try { flat = (await flatSVG(spec, BODY)).svg; } catch (e) { flatRet = e.message; }
  writeFileSync(join(OUT, `primitif-${ad}-kalip.svg`), kalip);
  if (flat) writeFileSync(join(OUT, `primitif-${ad}-flat.svg`), flat);
  const eksenAdlari = k.eksenler.map((e) => Object.entries(e).map(([a, v]) => `${a}=${v}`).join(' '));
  kartlar.push({ ad, baslik: k.baslik, eksenler: eksenAdlari, kalip, flat, flatRet,
    parca: drafted.pattern.pieces.length, ms: Date.now() - t0 });
  console.log(`${ad}  ${drafted.pattern.pieces.length} parca  ${Date.now() - t0} ms  flat: ${flat ? 'cizildi' : 'RET'}`);
}

// Levha: her satirda bir giysi — solda KALIP, sagda FLAT.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const html = `<!doctype html><meta charset="utf-8">
<style>
 body{margin:0;background:#fff;font:13px/1.45 -apple-system,system-ui,sans-serif;color:#1f3a5f}
 .satir{padding:18px 22px;border-bottom:1px solid #e2e2de;page-break-inside:avoid}
 h3{margin:0 0 2px;font-size:14px;font-weight:600}
 .eks{margin:0 0 10px;font-size:11.5px;color:#6a7a8c;letter-spacing:.02em}
 .ikili{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
 .kutu{border:1px solid #e6e6e2;padding:8px;background:#fff}
 .kutu h4{margin:0 0 6px;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#8a97a6;font-weight:600}
 .kutu svg{width:100%;height:auto;display:block}
 header{padding:20px 22px 6px}
 header p{margin:4px 0 0;font-size:12px;color:#6a7a8c;max-width:70ch}
 .ret{margin:0;font-size:11.5px;line-height:1.5;color:#8a4b3c;background:#fdf6f4;border:1px solid #f0dcd6;padding:10px}
</style>
<header>
 <h3 style="font-size:16px">stitchu — KOMPOZISYON GIYSILERI · EU38</h3>
 <p>Hicbiri sabit menuden cikmiyor: her biri icin sozlugun 132 degeri tek tek cizdirildi,
 hicbir tek deger ayni cizimi vermedi (engine/tests/primitif_ifade_check.mjs). Sozluk
 (engine/vocab.json) bu kosuda BAYT-AYNI kaldi.</p>
</header>
${kartlar.map((c) => `<div class="satir">
 <h3>${esc(c.baslik)}</h3>
 <p class="eks">${esc(c.eksenler.join('  +  '))}  ·  ${c.parca} parca</p>
 <div class="ikili">
  <div class="kutu"><h4>kalip</h4>${c.kalip}</div>
  <div class="kutu"><h4>flat</h4>${c.flat || `<p class="ret">CIZIM HATTI REDDETTI (yanlis resim basilmadi):<br>${esc(c.flatRet)}</p>`}</div>
 </div>
</div>`).join('\n')}
`;
const htmlPath = join(OUT, 'primitif-5.html');
writeFileSync(htmlPath, html);
const w = 1500;
const h = 260 + kartlar.length * 620;
const okShot = shot(htmlPath, join(OUT, 'primitif-5.png'), w, h);
console.log(`\n${kartlar.length} kompozisyon  ->  ${join(OUT, 'primitif-5.png')}  ${okShot ? 'BASILDI' : 'PNG BASILAMADI (Chrome yok)'}`);
