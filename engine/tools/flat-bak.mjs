#!/usr/bin/env node
// flat-bak.mjs — "BUTONA BASINCA NE INIYOR?" tek komutta, gozle bakmak icin.
//
// Denetci bir CUMLE yazip inen dosyaya bakiyor. Bu arac ayni seyi terminalde
// yapar: cumle -> parsePrompt -> spec -> SEVK EDILEN flat + kalip + dosya adi
// + baslik. Kapi degil, MIKROSKOP: hicbir sey yargilamaz, ne indigini gosterir.
//
//   node engine/tools/flat-bak.mjs "a maxi tiered skirt, gathered, three tiers"
//   node engine/tools/flat-bak.mjs --spec '{"garment":"skirt",...}'
//
// Cikti: /tmp/flat-bak/<slug>-flat.svg + -kalip.svg (+ Chrome varsa .png).
import { createRequire } from 'node:module';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const require = createRequire(import.meta.url);

const BUNDLE = join(ROOT, 'web/vendor/stitchu-engine.js');
const engine = existsSync(BUNDLE) ? await require(BUNDLE)() : null;
if (!engine) { console.error(`sevk edilen wasm paketi YOK: ${BUNDLE}`); process.exit(1); }
globalThis.document = {
  createElement: () => ({ click() {}, style: {} }),
  head: { appendChild: (el) => { queueMicrotask(() => el.onload && el.onload()); } },
};
globalThis.window = { createStitchuEngine: () => Promise.resolve(engine) };
globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };

const { flatSVG, patternSVG, safeName } = await import(join(ROOT, 'web/js/download.js'));
const { flatDrawing, bodyForSize, draft } = await import(join(ROOT, 'web/js/engine.js'));
const { parsePrompt, birlestir } = await import(join(ROOT, 'web/js/prompt-parse.js'));
const { giysiBasligi } = await import(join(ROOT, 'web/lib/baslik.js'));
const { yeniKoken, isaretle } = await import(join(ROOT, 'web/js/provenance.js'));

const args = process.argv.slice(2);
const SIZE = process.env.BEDEN || 'EU38';
// create.js'in ACILIS SPEC'i, birebir. Elle kisaltilirsa arac sevk edilen
// yolu degil kendi uydurdugu bir yolu olcer.
const VARSAYILAN = () => ({
  garment: 'dress', neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', shaping: 'dart',
  waistline: 'natural', fabric: 'woven', fabricPreset: 'unset', ruffle: 'none', keyhole: 'none', tieClosure: 'none',
  sleeveCap: 'plain', collarType: 'none', collarEdge: 'round',
  gatherType: 'none', gatherZone: 'neckline', backOpening: 'none', laceUpBack: 'none', wrapFront: 'none', backSlit: 'none',
  ruffledStraps: 'none', peplum: 'none', placketStyle: 'none', edgeFinish: 'biasBinding', pocketStyle: 'none', cuffStyle: 'none', hemShape: 'straight',
  cupSeam: 'none', yoke: 'none', boxPleat: 'none', hemFlounce: 'none',
});
let spec = VARSAYILAN(); let okuma = null; let cumle = '';
if (args[0] === '--spec') { Object.assign(spec, JSON.parse(args[1])); }
else {
  cumle = args.join(' ');
  if (!cumle) { console.error('kullanim: flat-bak.mjs "<cumle>"'); process.exit(2); }
  okuma = parsePrompt(cumle);
  birlestir(spec, okuma);
}

const koken = yeniKoken(Object.keys(spec));
for (const alan of Object.keys((okuma && okuma.eksenler) || {})) isaretle(koken, alan, 'soruldu');

const body = { size: SIZE };
const drafted = await draft(spec, bodyForSize(SIZE));
if (drafted.error) { console.error('MOTOR REDDETTI:', drafted.error); process.exit(3); }
const pattern = drafted.pattern;
const flat = (await flatSVG(spec, body, koken, Object.keys(spec))).svg;
const kalip = patternSVG(pattern);

const { baslik, atlanan } = giysiBasligi({
  spec, koken, okuma, etiketler: {}, isim: spec.garment || pattern.garment,
});

const out = '/tmp/flat-bak';
mkdirSync(out, { recursive: true });
const slug = safeName(cumle || spec.garment || 'spec').slice(0, 48);
writeFileSync(join(out, `${slug}-flat.svg`), flat);
writeFileSync(join(out, `${slug}-kalip.svg`), kalip);

console.log('CUMLE      :', cumle || '(--spec)');
console.log('SPEC       :', JSON.stringify(spec));
console.log('BASLIK     :', baslik);
console.log('MOTOR ADI  :', pattern.garment);
console.log('ATLANAN    :', atlanan.join(', ') || '(yok)');
console.log('PARCALAR   :', (pattern.pieces || []).map((p) => `${p.name}`).join(' | '));
console.log('DOSYA      :', join(out, `${slug}-flat.svg`));

// Raster tek yerden: engine/tools/raster.mjs. Kendi Chrome cagrisini yazmak
// (width="100%" olan bir SVG'yi 0 px'e cizip bos PNG uretmek) bu araci
// gorunmez kilar; ilk denemede tam olarak o oldu.
if (!process.env.NO_PNG) {
  const { rasterise } = await import(join(here, 'raster.mjs'));
  for (const name of ['flat', 'kalip']) {
    const png = join(out, `${slug}-${name}.png`);
    try { rasterise(join(out, `${slug}-${name}.svg`), png, 1100); console.log(`PNG        : ${png}`); }
    catch (e) { console.log(`PNG        : YOK (${name}) — ${e.message}`); }
  }
  try { execFileSync('/usr/bin/pkill', ['-f', 'stitchu-raster-'], { stdio: 'pipe' }); } catch { /* none */ }
}
process.exit(0);
