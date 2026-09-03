#!/usr/bin/env node
// KOSU/bugra-spec-giysi.mjs — M2-bugra ÜRÜN ÇIKTISI.
//
// Soru (faz tarifi md. 4): "Bugra'nin tarif ettigi giysiyi — dugmeli, peter pan
// yakali, puf kollu fitted top — motor TAM cizebiliyor mu?" Bu dosya o tek
// spec'i sevk hattinin KENDISINDEN gecirir (web/js/engine.js draft ->
// download.js patternSVG/flatSVG, yani tarayicinin indirdigi cizimin ta kendisi)
// ve tek sayfada basar: solda kesilecek kalip, sagda teknik cizim.
// Motor reddederse red METNI basilir — sessiz atlama yok.
//
//   node KOSU/bugra-spec-giysi.mjs
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

const { draft } = await import(join(ROOT, 'web/js/engine.js'));
const { patternSVG, flatSVG } = await import(join(ROOT, 'web/js/download.js'));

// KOR SPEC tek kaynaktan: engine/tools/bugra-landmarks.mjs.
const { KOR_SPEC: SPEC } = await import(join(ROOT, 'engine/tools/bugra-landmarks.mjs'));
const MEAS = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 };

function embed(svgText, x, y, w) {
  const m = svgText.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>/);
  if (!m) throw new Error('viewBox yok');
  const [, vb] = m;
  const [, , vw, vh] = vb.split(/\s+/).map(Number);
  const h = w * (vh / vw);
  const body = svgText.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return { h, frag: `<svg x="${x}" y="${y}" width="${w}" height="${h.toFixed(1)}" viewBox="${vb}" preserveAspectRatio="xMidYMin meet">${body}</svg>` };
}
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
function png(svgPath, pngPath, w, h) {
  if (!existsSync(CHROME)) return false;
  const d = join(tmpdir(), `bugraspec-${Math.random().toString(36).slice(2)}`);
  mkdirSync(d, { recursive: true });
  execFileSync('cp', [svgPath, join(d, 'a.svg')]);
  writeFileSync(join(d, 'i.html'),
    `<html><body style="margin:0;background:#fff"><img src="a.svg" style="width:${w}px;display:block"></body></html>`);
  try {
    execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars',
      `--screenshot=${pngPath}`, `--window-size=${w},${h}`, '--no-sandbox',
      `--user-data-dir=${d}/chrome`, '--default-background-color=FFFFFF', `file://${d}/i.html`],
      { stdio: 'ignore', timeout: 90000, killSignal: 'SIGKILL' });
    return true;
  } catch { return false; } finally { rmSync(d, { recursive: true, force: true }); }
}

mkdirSync(OUT, { recursive: true });
const drafted = await draft(SPEC, MEAS);
if (drafted.error) { console.error('MOTOR REDDETTI:', drafted.error); process.exit(1); }
const issues = (drafted.issues ?? []).join(' · ');
const kalip = embed(patternSVG(drafted.pattern), 20, 92, 640);
const { svg: flatText } = await flatSVG(SPEC, { size: 'EU38' });
const flat = embed(flatText, 700, 92, 470);
const H = Math.max(kalip.h, flat.h) + 130;
const parcalar = drafted.pattern.pieces.map((p) => `${p.name} (${p.cutInstruction})`).join(' · ');
const doc = `<?xml version="1.0" encoding="UTF-8"?>\n`
  + `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${H.toFixed(0)}" viewBox="0 0 1200 ${H.toFixed(0)}">\n`
  + `<rect width="1200" height="${H.toFixed(0)}" fill="#ffffff"/>\n`
  + `<text x="20" y="30" font-family="Helvetica" font-size="20" fill="#1f3a5f">Bugra'nin tarifi, motorun kalemiyle: dugmeli · peter pan yakali · puf kollu fitted top · EU38</text>\n`
  + `<text x="20" y="52" font-family="Helvetica" font-size="12" fill="#5b7089">${parcalar}</text>\n`
  + `<text x="20" y="70" font-family="Helvetica" font-size="12" fill="${issues ? '#b03030' : '#5b7089'}">${issues ? 'motorun kendi uyarilari: ' + issues : 'motorun kendi uyarisi yok'} · sol: kesilecek kalip · sag: teknik cizim (flat)</text>\n`
  + `${kalip.frag}\n${flat.frag}\n</svg>\n`;
const svgPath = join(OUT, 'bugra-spec-giysi.svg');
writeFileSync(svgPath, doc);
let ok = png(svgPath, join(OUT, 'bugra-spec-giysi.png'), 1200, Math.ceil(H));
if (!ok) {
  // Chrome yoksa/reddederse resvg hattina duser (bugra-blind-compare ile ayni
  // rasterlayici) — urun PNG'siz kalmaz.
  try {
    const { rasterise } = await import(join(ROOT, 'engine/tools/raster.mjs'));
    rasterise(svgPath, join(OUT, 'bugra-spec-giysi.png'), 1800);
    ok = true;
  } catch (e) { console.error('PNG basilamadi:', e.message); }
}
console.log(`bugra-spec-giysi: ${svgPath}${ok ? ' + .png' : ' (png yok)'}\nparcalar: ${parcalar}\nuyarilar: ${issues || '(yok)'}`);
