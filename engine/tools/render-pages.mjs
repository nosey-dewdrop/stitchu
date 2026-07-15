// render-pages.mjs — headless print-output verification.
// Drafts real specs through the WASM engine, then renders every A4 sheet with
// the SAME sheet.js markup the product prints, so the output can be compared
// against professional reference patterns (BugraPatterns A4-mixte) page by page.
//   run:  node engine/tools/render-pages.mjs [outDir]
// Writes per-spec: sheet-<code>.svg (one per printed A4) + strip.svg (all
// pages in place, frames on — the "taped together" proof) + info.txt.
import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const createEngine = require(join(here, '../dist/stitchu-engine.js'));
const sheet = await import(join(here, '../../web/js/sheet.js'));
const { PAGE_W, PAGE_H, packPieces, usedCells, sheetInner, sheetCode } = sheet;

const OUT = process.argv[2] || '/tmp/stitchu-pages';

// EU38-ish demo body (same as web demo / web-fuzz body #0).
const BODY = { bust: 90, waist: 72, hip: 98, shoulder: 38, backLength: 40, armLength: 58, neck: 36 };

// Specs as the LIVE vision endpoint returned them for real Etsy photos
// (2026-07-15 test set) — this is the exact photo->pattern chain output.
const SPECS = [
  { name: 'celine-button-top', garment: 'top', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'boat', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'cropped', ruffle: false, tiers: 1, keyhole: false },
  { name: 'mauve-mini-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'boat', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false },
  { name: 'lua-babydoll', garment: 'dress', shaping: 'dart', waistline: 'empire', fabric: 'woven',
    neckline: 'square', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'mini',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false },
  { name: 'black-buttoned-blouse', garment: 'top', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false },
  { name: 'boatneck-buttondown-top', garment: 'top', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'boat', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false },
  // Loop 3: front button placket DRAWN — the front piece carries the grown-on
  // button stand + fold line + buttons/buttonholes in the printed sheets.
  { name: 'placket-shirt-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'vNeck', sleeveStyle: 'straight', sleeveLength: 'long', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, frontPlacket: true },
  { name: 'placket-button-top', garment: 'top', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, frontPlacket: true },
  // Loop 4b: fabric ties DRAWN as separate strips + a back-waist placement notch.
  { name: 'jackie-back-waist-tie-dress', garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'boat', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'straight', skirtLength: 'mini',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, tie: 2 /* backWaistBow */ },
  { name: 'tie-back-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'scoop', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, tie: 4 /* tieBack */ },
  // Loop 6: gathered / puff sleeve HEAD — raised + widened cap + crown gather.
  { name: 'puff-sleeve-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'scoop', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, sleeveCap: 2 /* puffed */ },
  { name: 'gathered-head-top', garment: 'top', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'elbow', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, sleeveCap: 1 /* gathered */ },
  // Loop 7/8: collar family DRAWN — a separate collar piece, neck edge trued to
  // the neckline (a band for stand, a shaped flat/peter-pan, a two-piece shirt).
  { name: 'stand-collar-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, collarType: 1 /* stand */ },
  { name: 'peterpan-collar-top', garment: 'top', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, collarType: 4 /* peterPan */, collarEdge: 0 /* round */ },
  { name: 'shirt-collar-top', garment: 'top', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, collarType: 5 /* shirt */, collarEdge: 1 /* pointed */ },
];

const isChalk = (p) => p.name.includes('Ruffle') || p.name.includes('Bias binding');
const svgDoc = (viewBox, wMM, hMM, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${wMM}mm" height="${hMM}mm" viewBox="${viewBox}">` +
  `<rect x="${viewBox.split(' ')[0]}" y="${viewBox.split(' ')[1]}" width="100%" height="100%" fill="#fff"/>${inner}</svg>`;

const engine = await createEngine();
for (const s of SPECS) {
  const out = JSON.parse(engine.draftJSON(
    s.garment, s.shaping, s.waistline, s.fabric, s.neckline, s.sleeveStyle, s.sleeveLength,
    s.skirtStyle, s.skirtLength, s.topLength, s.ruffle, s.tiers, s.keyhole,
    BODY.bust, BODY.waist, BODY.hip, BODY.shoulder, BODY.backLength, BODY.armLength, BODY.neck, 0,
    s.frontPlacket === true, s.tie || 0, s.sleeveCap || 0, s.collarType || 0, s.collarEdge || 0));
  const dir = join(OUT, s.name);
  mkdirSync(dir, { recursive: true });
  if (out.error) { writeFileSync(join(dir, 'info.txt'), `ERROR: ${out.error}\n`); console.log(s.name, 'ERROR', out.error); continue; }
  const p = out.pattern;
  const paper = p.pieces.filter((x) => !isChalk(x));
  const layout = packPieces(paper.length ? paper : p.pieces);
  const { sheets, used } = usedCells(layout);

  for (const { col, row } of sheets) {
    const inner = sheetInner(layout, col, row, used);
    writeFileSync(join(dir, `sheet-${sheetCode(row, col)}.svg`),
      svgDoc(`${col * PAGE_W} ${row * PAGE_H} ${PAGE_W} ${PAGE_H}`, PAGE_W, PAGE_H, inner));
  }
  // strip.svg: every printed page rendered IN PLACE — what a perfectly taped
  // assembly must look like. Any discontinuity here is a real product bug.
  const rows = Math.ceil(layout.stripH / PAGE_H);
  let strip = '';
  for (const { col, row } of sheets) strip += sheetInner(layout, col, row, used);
  writeFileSync(join(dir, 'strip.svg'),
    svgDoc(`0 0 ${layout.cols * PAGE_W} ${rows * PAGE_H}`, layout.cols * PAGE_W / 4, rows * PAGE_H / 4, strip));

  const info = [
    `garment: ${p.garment}`, `pieces: ${p.pieces.length} (${p.pieces.map((x) => x.name).join(' | ')})`,
    `paper pieces: ${paper.length}`, `cols: ${layout.cols}  rows: ${rows}  printed sheets: ${sheets.length}`,
    `fabric: ${p.fabricMeters140} m @140cm`, `issues: ${JSON.stringify(out.issues || [])}`,
  ].join('\n');
  writeFileSync(join(dir, 'info.txt'), info + '\n');
  console.log(`${s.name}: ${paper.length} paper pieces, ${sheets.length} sheets (${layout.cols} cols)`);
}
