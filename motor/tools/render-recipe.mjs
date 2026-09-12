// render-recipe.mjs — Gate 1(d) visual proof: the RECIPE-path pattern packed
// into A4 print sheets with the SAME web/js/sheet.js markup the product
// prints, rendered to strip.png. Visual verification is an OUTPUT, not a
// claim (RULES invariant 3): the PNG path + sha256 go to stdout so the report
// can quote them; no PNG path in the report = the step did not happen.
//   usage: node render-recipe.mjs <pattern.json from recipe-json-dump> [outDir]
import { createHash } from 'crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const here = dirname(fileURLToPath(import.meta.url));
const sheet = await import(join(here, '../../web/js/sheet.js'));
const { PAGE_W, PAGE_H, packPieces, usedCells, sheetInner, sheetCode } = sheet;

const patternPath = process.argv[2];
if (!patternPath) {
  console.error('usage: node render-recipe.mjs <pattern.json> [outDir]');
  process.exit(2);
}
const OUT = process.argv[3] || '/tmp/stitchu-recipe-render';
const p = JSON.parse(readFileSync(patternPath, 'utf8'));

const svgDoc = (viewBox, wMM, hMM, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${wMM}mm" height="${hMM}mm" viewBox="${viewBox}">` +
  `<rect x="${viewBox.split(' ')[0]}" y="${viewBox.split(' ')[1]}" width="100%" height="100%" fill="#fff"/>${inner}</svg>`;

mkdirSync(OUT, { recursive: true });
const layout = packPieces(p.pieces);
const { sheets, used } = usedCells(layout);

for (const { col, row } of sheets) {
  const inner = sheetInner(layout, col, row, used);
  writeFileSync(join(OUT, `sheet-${sheetCode(row, col)}.svg`),
    svgDoc(`${col * PAGE_W} ${row * PAGE_H} ${PAGE_W} ${PAGE_H}`, PAGE_W, PAGE_H, inner));
}
const rows = Math.ceil(layout.stripH / PAGE_H);
let strip = '';
for (const { col, row } of sheets) strip += sheetInner(layout, col, row, used);
const stripSvg = svgDoc(`0 0 ${layout.cols * PAGE_W} ${rows * PAGE_H}`,
  layout.cols * PAGE_W / 4, rows * PAGE_H / 4, strip);
writeFileSync(join(OUT, 'strip.svg'), stripSvg);

const png = new Resvg(stripSvg, { fitTo: { mode: 'width', value: 1800 } }).render().asPng();
const pngPath = resolve(join(OUT, 'strip.png'));
writeFileSync(pngPath, png);
const pngHash = createHash('sha256').update(png).digest('hex');
console.log(`PNG ${pngPath} sha256=${pngHash}`);
console.log(`garment: ${p.garment}  pieces: ${p.pieces.length} (${p.pieces.map((x) => x.name).join(' | ')})`);
console.log(`A4 sheets: ${sheets.length} (${layout.cols} cols x ${rows} rows)`);
