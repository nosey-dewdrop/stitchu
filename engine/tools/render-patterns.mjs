// render-patterns.mjs — one clean layout SVG per FULL benchmark pattern, for the
// pattern-library blog pages. Drafts each distinct product (deduped from the
// benchmark FULL set) through the SAME WASM engine the product ships, then lays
// every drafted piece out on one nested sheet (shelf-packed, real geometry).
// Source Etsy photos are NEVER used or referenced — only the engine's own output
// and a generic style name. Output: web/patterns/svg/<slug>.svg + info line.
//   run:  node engine/tools/render-patterns.mjs
import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const createEngine = require(join(here, '../dist/stitchu-engine.js'));
const flat = await import(join(here, 'render-flat.mjs'));
const { renderScattered, renderFrontBack } = flat;
const { renderOnFigure } = await import(join(here, 'render-on-figure.mjs'));
const { renderListingCard } = await import(join(here, 'render-listing-card.mjs'));

const OUT = join(here, '../../web/patterns/svg');
mkdirSync(OUT, { recursive: true });

// EU38 demo body (same as the site's demo / render-pages).
const BODY = { bust: 90, waist: 72, hip: 98, shoulder: 38, backLength: 40, armLength: 58, neck: 36 };

// The 12 distinct FULL products from benchmark-58/results-2026-07-16.json,
// deduped by garment identity (multiple photos of the same product collapse to
// one pattern). Each carries the engine params that reproduce it + the honest
// note (which patch made it drawable) that the page renders.
export const PATTERNS = [
  { slug: 'boat-neck-linen-shell', style: 'Boat neck linen shell top', garment: 'top',
    shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    patch: null, drawnBy: 'in-vocab from day one', photos: 4 },

  { slug: 'scoop-neck-tank-mini-dress', style: 'Scoop neck tank mini dress', garment: 'dress',
    shaping: 'dart', waistline: 'natural', fabric: 'knit', neckline: 'scoop', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'straight', skirtLength: 'mini', topLength: 'hip',
    patch: null, drawnBy: 'in-vocab from day one', photos: 1 },

  { slug: 'boat-neck-button-down-top', style: 'Boat neck button-down top', garment: 'top',
    shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    frontPlacket: true, patch: '1.3', drawnBy: 'the front button placket', photos: 4 },

  { slug: 'gingham-button-blouse', style: 'Sleeveless gingham button blouse', garment: 'top',
    shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    frontPlacket: true, patch: '1.3', drawnBy: 'the front button placket', photos: 1 },

  { slug: 'mandarin-collar-fitted-blouse', style: 'Mandarin-collar fitted blouse', garment: 'top',
    shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'crew', sleeveStyle: 'straight',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    frontPlacket: true, collarType: 1 /* stand */, collarEdge: 0, patch: '1.7', drawnBy: 'the collar family and the button placket', photos: 1 },

  { slug: 'back-tie-shift-mini-dress', style: 'Back-tie shift mini dress', garment: 'dress',
    shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'straight', skirtLength: 'mini', topLength: 'hip',
    tie: 2 /* backWaistBow */, patch: '1.4', drawnBy: 'the fabric back-waist tie', photos: 2 },

  { slug: 'square-neck-back-tie-babydoll-top', style: 'Square-neck back-tie babydoll top', garment: 'top',
    shaping: 'dart', waistline: 'empire', fabric: 'woven', neckline: 'square', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    tie: 4 /* tieBack */, patch: '1.4', drawnBy: 'the fabric back tie', photos: 1 },

  { slug: 'empire-waist-tie-back-dress', style: 'Empire-waist tie-back dress', garment: 'dress',
    shaping: 'dart', waistline: 'empire', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'midi', topLength: 'hip',
    tie: 2 /* backWaistBow */, gatherType: 2 /* shirred */, gatherZone: 1 /* bust */,
    patch: '1.9', drawnBy: 'the gathered bust panel and the back-waist bow', photos: 3 },

  { slug: 'square-neck-drawstring-babydoll-dress', style: 'Square-neck drawstring babydoll dress', garment: 'dress',
    shaping: 'dart', waistline: 'empire', fabric: 'woven', neckline: 'square', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'mini', topLength: 'hip',
    gatherType: 1 /* drawstring */, gatherZone: 1 /* bust */, patch: '1.8', drawnBy: 'the front bust drawstring gather', photos: 1 },

  { slug: 'open-back-princess-mini-dress', style: 'Open-back princess mini dress', garment: 'dress',
    shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'square', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    backOpening: 1 /* round */, patch: '2.0', drawnBy: 'the shaped open-back cutout', photos: 1 },

  { slug: 'open-back-tie-back-mini-dress', style: 'Open-back tie-back mini dress', garment: 'dress',
    shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    backOpening: 1 /* round */, tie: 2 /* backWaistBow coexists */, patch: '2.0', drawnBy: 'the open-back cutout with a tie-back closure', photos: 3 },

  { slug: 'peter-pan-collar-puff-sleeve-babydoll-dress', style: 'Peter-pan collar puff-sleeve babydoll dress', garment: 'dress',
    shaping: 'dart', waistline: 'empire', fabric: 'woven', neckline: 'crew', sleeveStyle: 'straight',
    sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'midi', topLength: 'hip',
    collarType: 4 /* peterPan */, collarEdge: 0 /* round */, sleeveCap: 2 /* puffed */,
    gatherType: 3 /* smocked */, gatherZone: 0 /* neck yoke */, patch: '1.8',
    drawnBy: 'the peter-pan collar, the puff sleeve head and the smocked yoke', photos: 2 },

  { slug: 'ruffled-strap-milkmaid-babydoll-dress', style: 'Ruffled-strap milkmaid babydoll dress', garment: 'dress',
    shaping: 'dart', waistline: 'empire', fabric: 'woven', neckline: 'square', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'mini', topLength: 'hip',
    tie: 3 /* frontNeckBow */, gatherType: 2 /* shirred */, gatherZone: 0 /* front yoke */, ruffledStraps: 1 /* ruffled */,
    patch: '3.1', drawnBy: 'the ruffled shoulder straps, the shirred bust yoke and the front tie', photos: 1 },

  { slug: 'shirt-collar-smocked-babydoll-top', style: 'Shirt-collar smocked babydoll top', garment: 'top',
    shaping: 'dart', waistline: 'empire', fabric: 'woven', neckline: 'crew', sleeveStyle: 'straight',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    frontPlacket: true, collarType: 5 /* shirt */, collarEdge: 1 /* pointed */, sleeveCap: 1 /* gathered */,
    gatherType: 3 /* smocked */, gatherZone: 0 /* front yoke */,
    patch: '3.1', drawnBy: 'the pointed shirt collar, the smocked chest yoke and the gathered puff sleeve head', photos: 1 },

  { slug: 'gathered-bust-empire-mini-dress', style: 'Gathered-bust empire mini dress', garment: 'dress',
    shaping: 'dart', waistline: 'empire', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'mini', topLength: 'hip',
    tie: 2 /* backWaistBow */, gatherType: 2 /* shirred */, gatherZone: 1 /* bust */,
    patch: '1.9', drawnBy: 'the gathered bust panel under the empire seam and the back-waist bow', photos: 3 },

  { slug: 'patch-pocket-shift-dress', style: 'Patch-pocket A-line shift dress', garment: 'dress',
    shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'scoop', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    pocketStyle: 1 /* patch */, patch: '3.12', drawnBy: 'the pair of patch pockets on the front skirt', photos: 2 },

  // v1.1, the first new capabilities after the v1.0 freeze.
  { slug: 'cup-seam-corset-bustier', style: 'Cup-seam corset bustier top', garment: 'top',
    shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'sweetheart', sleeveStyle: 'none',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    cupSeam: 1 /* upper cup + lower cup + front body */, patch: '3.27',
    drawnBy: 'the horizontal cup seam that splits the bustier front into three bands', photos: 1 },

  { slug: 'yoke-doll-dress', style: 'Yoke doll dress', garment: 'dress',
    shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'crew', sleeveStyle: 'straight',
    sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    yoke: 1 /* front + back yoke split */, patch: '3.29',
    drawnBy: 'the horizontal yoke seam that splits the bodice into a yoke and a lower body', photos: 1 },
];

const engine = await createEngine();
const meta = [];
for (const s of PATTERNS) {
  // edgeFinish stays 0 = bias binding (the default finish): no separate
  // neck-facing pieces unless a real collar forces them (the engine sets that
  // internally when collarType != None).
  const out = JSON.parse(engine.draftJSON({
    garment: s.garment, shaping: s.shaping, waistline: s.waistline, fabric: s.fabric,
    neckline: s.neckline, sleeveStyle: s.sleeveStyle, sleeveLength: s.sleeveLength,
    skirtStyle: s.skirtStyle, skirtLength: s.skirtLength, topLength: s.topLength,
    ruffleHem: false, ruffleTiers: 1, keyhole: false,
    frontPlacket: s.frontPlacket === true, tieClosure: s.tie || 0, sleeveCap: s.sleeveCap || 0,
    collarType: s.collarType || 0, collarEdge: s.collarEdge || 0,
    gatherType: s.gatherType || 0, gatherZone: s.gatherZone || 0, backOpening: s.backOpening || 0,
    backSlit: s.backSlit || 0, ruffledStraps: s.ruffledStraps || 0, peplum: s.peplum || 0,
    placketStyle: s.placketStyle || 0, edgeFinish: s.edgeFinish || 0, pocketStyle: s.pocketStyle || 0,
    cuffStyle: s.cuffStyle || 0, hemShape: s.hemShape || 0, shoulderStyle: s.shoulderStyle || 0,
    cupSeam: s.cupSeam || 0, yoke: s.yoke || 0,
  }, { bust: BODY.bust, waist: BODY.waist, hip: BODY.hip, shoulder: BODY.shoulder, backLength: BODY.backLength, armLength: BODY.armLength, neck: BODY.neck }));
  if (out.error) { console.log(s.slug, 'ERROR', out.error); continue; }
  const p = out.pattern;

  const closures = [...new Set(p.pieces.filter((x) => x.closure).map((x) => x.closure))];
  // Spec passed to the assembled-flat renderer so it can draw interior detail
  // lines (darts / princess seams / button row / empire seam / zip / tie).
  const flatSpec = {
    garment: s.garment, shaping: s.shaping, waistline: s.waistline, neckline: s.neckline,
    skirtStyle: s.skirtStyle, skirtLength: s.skirtLength, topLength: s.topLength,
    sleeveStyle: s.sleeveStyle, sleeveLength: s.sleeveLength, sleeveCap: s.sleeveCap || 0,
    collarType: s.collarType || 0, collarEdge: s.collarEdge || 0,
    frontPlacket: s.frontPlacket === true, placketStyle: s.placketStyle || 0,
    tie: s.tie || 0, gatherType: s.gatherType || 0, gatherZone: s.gatherZone || 0,
    backOpening: s.backOpening || 0, ruffledStraps: s.ruffledStraps || 0,
    peplum: s.peplum || 0, pocketStyle: s.pocketStyle || 0, hemRuffle: s.hemRuffle || 0,
    cupSeam: s.cupSeam || 0, yoke: s.yoke || 0,
    closure: closures[0] || null,
  };
  // (1) The scattered nested-piece layout — the CUTTING LAYOUT (secondary/PDF).
  writeFileSync(join(OUT, `${s.slug}.svg`), renderScattered(p.pieces));
  // (2) The ASSEMBLED front + back garment flat sketch — the HERO image.
  writeFileSync(join(OUT, `${s.slug}-flat.svg`), renderFrontBack(p.pieces, flatSpec));
  // (3) The ON-FIGURE croquis view — the same style worn on a fashion figure.
  const figureSvg = renderOnFigure(flatSpec);
  writeFileSync(join(OUT, `${s.slug}-figure.svg`), figureSvg);
  // (4) The ETSY-STYLE LISTING CARD — the cover/thumbnail. Composed 100% from
  // the engine's own output: name (typography) + flat + on-figure croquis +
  // honest badges. No Canva, no per-product design, no real photo.
  const cardSvg = renderListingCard(
    { slug: s.slug, style: s.style, pieces: p.pieces.length, closure: closures[0] || null },
    { piecesSvg: renderScattered(p.pieces), sizeRange: 'EU34-52' });
  writeFileSync(join(OUT, `${s.slug}-card.svg`), cardSvg);

  meta.push({ slug: s.slug, style: s.style, pieces: p.pieces.length,
    pieceNames: p.pieces.map((x) => x.name), fabric: p.fabricMeters140,
    garment: s.garment, patch: s.patch, drawnBy: s.drawnBy, photos: s.photos,
    flat: `${s.slug}-flat.svg`, onFigure: `${s.slug}-figure.svg`,
    card: `${s.slug}-card.svg`, closure: closures[0] || null });
  console.log(`${s.slug}: ${p.pieces.length} pieces, ${p.fabricMeters140} m` +
    (closures.length ? ` [closure: ${closures[0]}]` : ''));
}
writeFileSync(join(OUT, 'meta.json'), JSON.stringify(meta, null, 2));
console.log(`\n${meta.length} patterns rendered -> ${OUT}`);
