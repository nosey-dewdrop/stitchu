#!/usr/bin/env node
// f-e-shot.mjs — F-E'nin ÖNCE/SONRA çekimi. F-D'nin locket-EU38 flat'i ad-hoc
// bir komuttan çıkmıştı (repoda üreteci yoktu, yani "önce" tekrar üretilemezdi).
// Bu dosya o boşluğu kapatır: locket spec'i BURADA yazılı, çıktı deterministik.
//
//   node GECE/f-e-shot.mjs <cikti-dizini> <etiket>
//
// Yazdıkları: <dizin>/<etiket>.svg + <dizin>/<etiket>.png (rsvg/cairosvg varsa).

import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const { renderGarmentFlat } = await import(join(root, 'engine/tools/render-garment-flat.mjs'));

// Buğra "Locket" EU38: düğmeli placket, Peter Pan yaka, PUFF kısa kol, pensli
// oturan gövde. (CLAUDE.md "GERÇEK BUĞRA LOCKET-38" bölümü.)
// DOĞRULANDI: bu spec, F-D'nin GECE/log/F-D.shots/locket-EU38-flat.svg dosyasını
// BAYT BAYT yeniden üretiyor (7276 bayt) — yani "önce" görüntüsü artık üretilebilir.
export const LOCKET_EU38 = {
  garment: 'top', neckline: 'crew', shaping: 'darts', topLength: 'crop',
  sleeveStyle: 'set', sleeveLength: 'short', sleeveCap: 2,
  collarType: 4, frontPlacket: 1,
};

const outDir = process.argv[2] || join(root, 'GECE/log/F-E.shots');
const tag = process.argv[3] || 'locket-EU38-flat';

mkdirSync(outDir, { recursive: true });
const svg = renderGarmentFlat([], LOCKET_EU38);
const svgPath = join(outDir, `${tag}.svg`);
writeFileSync(svgPath, svg);
console.log(`svg  ${svgPath}  ${svg.length} bayt`);

const pngPath = join(outDir, `${tag}.png`);
let done = false;
for (const [bin, args] of [
  ['rsvg-convert', ['-w', '1400', '-o', pngPath, svgPath]],
  ['cairosvg', [svgPath, '-o', pngPath, '--output-width', '1400']],
]) {
  try { execFileSync(bin, args, { stdio: 'pipe' }); done = true; console.log(`png  ${pngPath}  (${bin})`); break; }
  catch { /* sonraki aday */ }
}
if (!done) {                       // macOS yedeği: QuickLink thumbnail (bu makinede tek çalışan)
  try {
    execFileSync('qlmanage', ['-t', '-s', '1400', '-o', outDir, svgPath], { stdio: 'pipe' });
    execFileSync('mv', [join(outDir, `${tag}.svg.png`), pngPath]);
    done = true; console.log(`png  ${pngPath}  (qlmanage)`);
  } catch { /* yok */ }
}
if (!done) console.log(`png  ATLANDI — rsvg-convert / cairosvg yok`);
