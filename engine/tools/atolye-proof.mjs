// ============================================================================
// atolye-proof.mjs — M3 kanit kosucusu (2026-08-01)
//
// web/atolye.html'den (once `node engine/tools/build-atolye.mjs`) modul
// script'ini keser, UI katmanini atar, draw()'u dogrudan cagirir:
//   1. ANLAMLI CIZGI SAYACI: 4 konfigde ink/st path sayisi (govde/panel
//      konturlari — body/piece/tie/seam — sayilmaz). Hedef (ROADMAP M3):
//      varsayilan 50+, klos 60+.
//   2. DETERMINIZM: her konfig iki kez cizilir, bayt esitligi assert edilir.
//
// Kullanim: node engine/tools/atolye-proof.mjs [out-dir]
//   out-dir verilirse her konfigin SVG'si oraya yazilir (PNG icin cairosvg:
//   core/third_party/garmentcode/.venv/bin/python -c "import cairosvg; ...").
// ============================================================================
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = process.argv[2] || null;
if (outDir) mkdirSync(outDir, { recursive: true });

const html = readFileSync(join(ROOT, 'web/atolye.html'), 'utf8');
const m = html.match(/<script type="module">\n([\s\S]*?)\n<\/script>/);
if (!m) { console.error('PROOF FAIL: atolye.html icinde modul script yok'); process.exit(1); }
let src = m[1];
const cut = src.indexOf('// TEZGAH');            // ui.js basligi — DOM kullanan katman
if (cut === -1) { console.error('PROOF FAIL: TEZGAH isareti yok'); process.exit(1); }
src = src.slice(0, src.lastIndexOf('// ====', cut));

const CONFIGS = [
  ['varsayilan', {}, 50],
  ['klos-maxi', { hemLevel: 105, skirtFull: 2.55, skirtCurve: 0.8 }, 60],
  ['buzgulu', { shirr: true, gatherRatio: 2.2 }, 50],
  ['puf-kollu', { sleeve: true, capPuff: 2.4, sleeveLen: 12 }, 50],
];

src += `
const __CONFIGS = ${JSON.stringify(CONFIGS)};
const __OUT = ${JSON.stringify(outDir)};
import { writeFileSync as __wf } from 'node:fs';
let __fail = 0;
for (const [name, over, floor] of __CONFIGS) {
  const mk = () => draw(Object.assign(defaultState(), over));
  const svg = mk(), svg2 = mk();
  const det = svg === svg2;
  const ink = (svg.match(/<path class="ink"/g) || []).length;
  const st = (svg.match(/<path class="st"/g) || []).length;
  const all = (svg.match(/<path/g) || []).length;
  const ok = det && (ink + st) >= floor;
  if (!ok) __fail = 1;
  console.log(
    name.padEnd(12), 'anlamli', String(ink + st).padStart(3),
    '(ink ' + ink + ' + st ' + st + ', toplam path ' + all + ')',
    'hedef ' + floor + (ink + st >= floor ? ' GECTI' : ' KALDI'),
    det ? '| determinist' : '| DETERMINIST DEGIL');
  if (__OUT) __wf(__OUT + '/' + name + '.svg', svg);
}
process.exit(__fail);
`;

const tmp = join(tmpdir(), 'atolye-proof-run.mjs');
writeFileSync(tmp, src);
await import(tmp);
