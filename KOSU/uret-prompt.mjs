#!/usr/bin/env node
// KOSU/uret-prompt.mjs — F1 ÜRÜN ÇIKTISI. Üç örnek PROMPT'un kalıp + flat
// çiftini tek sayfada basar: KOSU/ciktilar/prompt-01..03.svg (+ Chrome varsa
// .png). Çizimler tarayıcının indirdiği hattın kendisinden gelir:
// spec = web/js/prompt-parse.js (deterministik parser) → web/js/engine.js
// draft() (wasm draftJSON) → download.js patternSVG / flatSVG.
//
//   node KOSU/uret-prompt.mjs
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

const { parsePrompt, birlestir } = await import(join(ROOT, 'web/js/prompt-parse.js'));
const { draft } = await import(join(ROOT, 'web/js/engine.js'));
const { patternSVG, flatSVG } = await import(join(ROOT, 'web/js/download.js'));

const DEFAULTS = {
  garment: 'dress', neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', shaping: 'dart',
  waistline: 'natural', fabric: 'woven',
};
// EU38 demo gövdesi (create.js DEMO_BODY ile aynı sayılar).
const MEAS = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40, armLength: 58, neck: 35 };

const PROMPTS = [
  ['prompt-01', 'puf kollu mini elbise'],
  ['prompt-02', 'square neckline, long fitted sleeves'],
  ['prompt-03', 'kruvaze elbise, uzun kollu'],
];

// Bir SVG belgesini, verilen genişliğe ölçekli gömülü <svg> parçasına çevirir.
function embed(svgText, x, y, w) {
  const m = svgText.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>/);
  if (!m) throw new Error('viewBox yok');
  const [, vb] = m;
  const [, , vw, vh] = vb.split(/\s+/).map(Number);
  const h = w * (vh / vw);
  const body = svgText.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return {
    h,
    frag: `<svg x="${x}" y="${y}" width="${w}" height="${h.toFixed(1)}" viewBox="${vb}" preserveAspectRatio="xMidYMin meet">${body}</svg>`,
  };
}

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
function png(svgPath, pngPath, w, h) {
  if (!existsSync(CHROME)) return false;
  const d = join(tmpdir(), `promptshot-${Math.random().toString(36).slice(2)}`);
  mkdirSync(d, { recursive: true });
  execFileSync('cp', [svgPath, join(d, 'a.svg')]);
  writeFileSync(join(d, 'i.html'),
    `<html><body style="margin:0;background:#fff"><img src="a.svg" style="width:${w}px;display:block"></body></html>`);
  try {
    execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars',
      `--screenshot=${pngPath}`, `--window-size=${w},${h}`,
      '--no-sandbox', '--default-background-color=FFFFFF', `file://${d}/i.html`],
      { stdio: 'ignore', timeout: 60000 });
    return true;
  } catch { return false; } finally { rmSync(d, { recursive: true, force: true }); }
}

mkdirSync(OUT, { recursive: true });
for (const [ad, text] of PROMPTS) {
  const parsed = parsePrompt(text);
  const spec = { ...DEFAULTS };
  birlestir(spec, parsed);
  const drafted = await draft(spec, MEAS);
  if (drafted.error || (drafted.issues && drafted.issues.length)) {
    throw new Error(`${ad}: motor red — ${drafted.error || drafted.issues.join('; ')}`);
  }
  const kalip = embed(patternSVG(drafted.pattern), 20, 70, 620);
  const { svg: flatText } = await flatSVG(spec, { size: 'EU38' });
  const flat = embed(flatText, 680, 70, 480);
  const H = Math.max(kalip.h, flat.h) + 100;
  const eksenler = Object.entries(parsed.eksenler).map(([f, e]) => `${f}=${e.value}`).join('  ');
  const doc = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${H.toFixed(0)}" viewBox="0 0 1200 ${H.toFixed(0)}">\n` +
    `<rect width="1200" height="${H.toFixed(0)}" fill="#ffffff"/>\n` +
    `<text x="20" y="30" font-family="Helvetica" font-size="20" fill="#1f3a5f">prompt: “${text}”</text>\n` +
    `<text x="20" y="52" font-family="Helvetica" font-size="13" fill="#5b7089">okunan eksenler: ${eksenler} · beden EU38 · sol: kalıp (kesilecek parçalar) · sağ: flat (teknik çizim)</text>\n` +
    `${kalip.frag}\n${flat.frag}\n</svg>\n`;
  const svgPath = join(OUT, `${ad}.svg`);
  writeFileSync(svgPath, doc);
  const p = png(svgPath, join(OUT, `${ad}.png`), 1200, Math.ceil(H));
  console.log(`${ad}: ${svgPath}${p ? ' + .png' : ' (png yok: Chrome bulunamadı)'}  [${text}]`);
}
