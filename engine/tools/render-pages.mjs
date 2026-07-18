// render-pages.mjs — headless print-output verification.
// Drafts real specs through the WASM engine, then renders every A4 sheet with
// the SAME sheet.js markup the product prints, so the output can be compared
// against professional reference patterns (BugraPatterns A4-mixte) page by page.
//   run:  node engine/tools/render-pages.mjs [outDir]
// Writes per-spec: sheet-<code>.svg (one per printed A4) + strip.svg (all
// pages in place, frames on — the "taped together" proof) + info.txt.
import { createRequire } from 'module';
import { createHash } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

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
  // Patch 3.10: bias binding is now the DEFAULT neck + armhole finish. Same
  // sleeveless scoop dress rendered two ways for the before/after: bias (default)
  // draws thin binding strips; facing (opt-in) restores the old facing pieces.
  { name: 'bias-default-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'scoop', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, edgeFinish: 0 /* bias (default) */ },
  { name: 'facing-optin-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'scoop', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, edgeFinish: 1 /* facing (opt-in, old default) */ },
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
  // Loop 8: drawstring / shirred / smocked gathering DRAWN — a separate gathered
  // panel (+ a drawstring cord) whose gathered edge is trued to the zone.
  { name: 'drawstring-neck-dress', garment: 'dress', shaping: 'princess', waistline: 'empire', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'mini',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, gatherType: 1 /* drawstring */, gatherZone: 0 /* neck */ },
  { name: 'shirred-bust-top', garment: 'top', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, gatherType: 2 /* shirred */, gatherZone: 1 /* bust */ },
  { name: 'smocked-yoke-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, gatherType: 3 /* smocked */, gatherZone: 0 /* neck */ },
  // Loop 9b: open-back cutout — the back piece carries a shaped opening marking +
  // a facing whose inner edge is trued to it.
  { name: 'openback-round-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'scoop', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, backOpening: 1 /* round */ },
  { name: 'openback-lowv-tieback-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, backOpening: 2 /* lowV */, tie: 2 /* back tie coexists */ },
  // Loop M1: back hem slit / walking vent — the back skirt piece flips to a CB
  // seam, marks the top-point bar tack, and (for a vent) grows the lapped
  // extension with a 45 degree top corner.
  { name: 'vent-straight-dress', garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'boat', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'straight', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, backSlit: 1 /* vent */ },
  { name: 'slit-straight-skirt', garment: 'skirt', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'straight', skirtLength: 'maxi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, backSlit: 2 /* plain slit */ },
  // queue #3: ruffled shoulder straps — a separate gathered strap pair on a
  // sleeveless babydoll dress, with a placement notch at each shoulder point.
  { name: 'ruffled-straps-babydoll', garment: 'dress', shaping: 'dart', waistline: 'empire', fabric: 'woven',
    neckline: 'square', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'mini',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, ruffledStraps: 1 /* ruffled */ },
  // R1.1: peplum — a flared circular flounce hung from the waist of a top, cut as
  // a separate annular sector whose inner arc is trued to the finished waist.
  { name: 'peplum-full-top', garment: 'top', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'vNeck', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, peplum: 1 /* full circle */ },
  { name: 'peplum-pointed-top', garment: 'top', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'vNeck', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, frontPlacket: true, peplum: 3 /* pointed */ },
  // R1.2: the Jackie combo — an asymmetric off-center button placket on the front
  // piece PLUS a short cap-sleeve wing, the two OOV items the Jackie gingham
  // photos wanted. Both must appear and pack in the printed sheets.
  { name: 'jackie-asym-cap-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'boat', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, sleeveCap: 3 /* cap */, placketStyle: 2 /* asymmetric */ },
  // External-audit repro: sleeveless gingham boat-neck FRONT-PLACKET blouse. The
  // audited bug was placket + cut-on-fold coexisting (unwearable). Renders here
  // so the CF opening, boat neckline and armhole finish can be checked by eye.
  { name: 'gingham-placket-blouse', garment: 'top', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'boat', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, frontPlacket: true },
  // patch 3.12: a PATCH pocket on a dress (a separate rounded patch piece + a
  // placement mark on the Bodice/Skirt front) and a SIDE-SEAM in-seam pocket on a
  // skirt (two bag pieces + a mouth mark on the side seam). Both must draw + pack.
  { name: 'patch-pocket-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'scoop', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, pocketStyle: 1 /* patch */ },
  { name: 'sideseam-pocket-skirt', garment: 'skirt', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, pocketStyle: 2 /* side-seam */ },
  // patch 3.16: cowl neckline on a dress — the front is cut wide + deep on the
  // bias with drape excess (a re-mark, no new piece). And a pussy-bow blouse — a
  // high neck band + a long self-lined tie strip that knots into a bow.
  { name: 'cowl-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'cowl', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false },
  { name: 'pussybow-blouse', garment: 'top', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'pussyBow', sleeveStyle: 'straight', sleeveLength: 'long', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false },
  // patch 3.13: a BUTTON cuff on a long-sleeve shirt dress + a RIBBED cuff on a
  // long-sleeve knit top. The wrist band must appear as a separate piece and pack.
  { name: 'button-cuff-shirt-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'long', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, frontPlacket: true, cuffStyle: 1 /* button */ },
  { name: 'ribbed-cuff-knit-top', garment: 'top', shaping: 'dart', waistline: 'natural', fabric: 'knit',
    neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'long', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, cuffStyle: 2 /* ribbed */ },
  // patch 3.15: hem shape — a shirt-tail top (sides up, center front + back long)
  // and a high-low dress (front short, back long). The reshaped hem must pack and
  // the side seams must meet.
  { name: 'shirttail-top', garment: 'top', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi',
    topLength: 'tunic', ruffle: false, tiers: 1, keyhole: false, hemShape: 1 /* shirttail */ },
  { name: 'highlow-dress', garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'scoop', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'straight', skirtLength: 'maxi',
    topLength: 'hip', ruffle: false, tiers: 1, keyhole: false, hemShape: 2 /* high-low */ },
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
    s.frontPlacket === true, s.tie || 0, s.sleeveCap || 0, s.collarType || 0, s.collarEdge || 0,
    s.gatherType || 0, s.gatherZone || 0, s.backOpening || 0, s.backSlit || 0, s.ruffledStraps || 0, s.peplum || 0,
    s.placketStyle || 0,
    s.edgeFinish || 0 /* patch 3.10: 0 = bias binding (default), 1 = facing */,
    s.pocketStyle || 0 /* patch 3.12: 0 = none, 1 = patch, 2 = side-seam */,
    s.cuffStyle || 0 /* patch 3.13: 0 = none, 1 = button, 2 = ribbed */,
    s.hemShape || 0 /* patch 3.15: 0 = straight, 1 = shirttail, 2 = high-low */,
    s.shoulderStyle || 0, s.buttonRow || 0, s.exposedZip || 0, s.backDetail || 0, s.bardotStyle || 0));
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
  const stripSvg = svgDoc(`0 0 ${layout.cols * PAGE_W} ${rows * PAGE_H}`, layout.cols * PAGE_W / 4, rows * PAGE_H / 4, strip);
  writeFileSync(join(dir, 'strip.svg'), stripSvg);
  // Visual verification is an OUTPUT, not a claim (RULES invariant 3): the PNG
  // artifact is produced here and its absolute path + sha256 go to stdout so a
  // report can quote them. No PNG path in the report = the render step did not
  // happen.
  const png = new Resvg(stripSvg, { fitTo: { mode: 'width', value: 1800 } }).render().asPng();
  const pngPath = resolve(join(dir, 'strip.png'));
  writeFileSync(pngPath, png);
  const pngHash = createHash('sha256').update(png).digest('hex');
  console.log(`PNG ${pngPath} sha256=${pngHash}`);

  const info = [
    `garment: ${p.garment}`, `pieces: ${p.pieces.length} (${p.pieces.map((x) => x.name).join(' | ')})`,
    `paper pieces: ${paper.length}`, `cols: ${layout.cols}  rows: ${rows}  printed sheets: ${sheets.length}`,
    `fabric: ${p.fabricMeters140} m @140cm`, `issues: ${JSON.stringify(out.issues || [])}`,
  ].join('\n');
  writeFileSync(join(dir, 'info.txt'), info + '\n');
  console.log(`${s.name}: ${paper.length} paper pieces, ${sheets.length} sheets (${layout.cols} cols)`);
}
