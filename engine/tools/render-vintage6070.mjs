// render-vintage6070.mjs — one clean layout SVG per 60s/70s collection look.
// Each look's engine params were mapped from a LIVE vision read of a public-
// domain museum photo (banked in dataset/labels/, pool "vintage"). The SOURCE
// photos are NEVER used or shipped — only the engine's own drafted pieces and a
// generic period/style description. Same WASM engine the create page runs.
// Uses sheet.pieceTransform so rotated pieces place correctly.
//   run:  node engine/tools/render-vintage6070.mjs
import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const createEngine = require(join(here, '../dist/stitchu-engine.js'));
const sheet = await import(join(here, '../../web/js/sheet.js'));
const { pathD, bounds, shelfPack, pieceTransform } = sheet;

const OUT = join(here, '../../web/patterns/vintage6070');
mkdirSync(OUT, { recursive: true });

// EU38 demo body (same as render-patterns / render-pages).
const BODY = { bust: 90, waist: 72, hip: 98, shoulder: 38, backLength: 40, armLength: 58, neck: 36 };

// Collar enum: none0 stand1 mock2 flat3 peterPan4 shirt5.
// Tie enum: none0 waistSash1 backWaistBow2 frontNeckBow3 tieBack4.
// Gather type: none0 drawstring1 shirred2 smocked3 ; zone: neck0 bust1 waist2 sleeve3.
// Each look records: what fully drafts + the honest OOV (surface décor the
// engine does not draw), straight from the vision read.
export const LOOKS = [
  { slug: 'sixties-fit-flare-knit-dress',
    en: 'Fit-and-flare knit dress', tr: 'Vücuda oturan, etek ucu açılan örme elbise',
    period: '1960s', house: 'Mary Quant style',
    garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'knit',
    neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'long',
    skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    full: true,
    note_en: 'A crew-neck knit dress with princess seams, long fitted sleeves and a short A-line skirt. Every piece is in the engine’s core vocabulary, so it drafts complete.',
    note_tr: 'Prenses dikişli, uzun oturan kollu, kısa A kesim etekli bisiklet yaka örme elbise. Her parça motorun temel dağarcığında, bu yüzden tam çizilir.',
    oov: ['contrast waist stripe band (surface trim, not drafted)'] },

  { slug: 'sixties-mondrian-shift-mini',
    en: 'Sleeveless shift mini dress', tr: 'Kolsuz shift mini elbise',
    period: '1960s', house: 'John Bates for Jean Varon style',
    garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'boat', sleeveStyle: 'none', sleeveLength: 'short',
    skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    full: true,
    note_en: 'A boat-neck sleeveless shift that swings into a boxy A-line mini. Pure silhouette, drafted complete.',
    note_tr: 'Kayık yakalı, kutu gibi A kesim miniye açılan kolsuz shift. Sade siluet, tam çizilir.',
    oov: ['contrast cross/grid graphic (surface applique, not drafted)'] },

  { slug: 'sixties-princess-seam-shift',
    en: 'Short-sleeve princess-seam shift', tr: 'Kısa kollu prenses dikişli shift',
    period: '1960s', house: 'Guy Laroche style',
    garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'short',
    skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    full: true,
    note_en: 'A wool shift with short set-in sleeves and curved princess seams shaping the bust. Drafts complete.',
    note_tr: 'Kısa oturtma kollu, büstü biçimlendiren eğri prenses dikişli yarım elbise. Tam çizilir.',
    oov: ['decorative circular hip welt pockets (not drafted)'] },

  { slug: 'sixties-empire-knit-mini',
    en: 'Empire-seam knit mini dress', tr: 'Empire dikişli örme mini elbise',
    period: '1960s', house: 'sweater-knit style',
    garment: 'dress', shaping: 'dart', waistline: 'empire', fabric: 'knit',
    neckline: 'boat', sleeveStyle: 'straight', sleeveLength: 'short',
    skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    full: true,
    note_en: 'A ribbed knit bodice joined at a high empire seam to an A-line mini skirt, with smooth short set-in sleeves and a wide boat neckline.',
    note_tr: 'Yüksek empire dikişiyle A kesim mini eteğe birleşen fitilli örme beden, düz kısa oturtma kol ve geniş kayık yaka.',
    oov: ['checkerboard pattern panel (print, not drafted)'] },

  { slug: 'sixties-stand-collar-shift',
    en: 'Stand-collar sleeveless shift', tr: 'Dik yakalı kolsuz shift',
    period: '1960s', house: 'André Courrèges style',
    garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'boat', sleeveStyle: 'none', sleeveLength: 'short',
    skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    collarType: 1, collarEdge: 0,
    full: true,
    note_en: 'A sleeveless A-line shift finished with a funnel stand collar, drafted as its own piece with the neck edge trued to the neckline.',
    note_tr: 'Huni dik yakalı kolsuz A kesim shift; yaka ayrı parça olarak, boyun kenarı yaka çizgisine birebir çizilir.',
    oov: ['oval welt pockets, self-fabric belt (not drafted)'] },

  { slug: 'sixties-mandarin-collar-shift',
    en: 'Mandarin-collar long-sleeve shift', tr: 'Mandarin yakalı uzun kollu shift',
    period: '1960s', house: 'Pucci style',
    garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'knit',
    neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'long',
    skirtStyle: 'straight', skirtLength: 'midi', topLength: 'hip',
    collarType: 2, collarEdge: 0,
    full: true,
    note_en: 'A fitted long-sleeved jersey shift with a low mandarin stand collar and a straight waist-seamed skirt.',
    note_tr: 'Alçak mandarin dik yakalı, bele dikili düz etekli, uzun kollu oturan jarse shift.',
    oov: ['self-fabric tasselled tie belt (not drafted)'] },

  { slug: 'sixties-pointed-collar-tunic',
    en: 'Pointed-collar tunic top', tr: 'Sivri yakalı tunik üst',
    period: '1960s', house: 'Biba style',
    garment: 'top', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'vNeck', sleeveStyle: 'straight', sleeveLength: 'long',
    skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'tunic',
    collarType: 5, collarEdge: 1,
    full: true,
    note_en: 'A loose tunic-length pullover with a large pointed shirt collar and a split V opening at the front neck.',
    note_tr: 'Büyük sivri gömlek yakalı, ön boynu yarık V açıklı bol tunik boy pullover.',
    oov: ['contrast collar and cuffs, polka dot print (colour, not drafted)'] },

  { slug: 'sixties-front-button-pinafore',
    en: 'Front-button pinafore dress', tr: 'Ön düğmeli jile elbise',
    period: '1960s', house: 'Mary Quant style',
    garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'vNeck', sleeveStyle: 'none', sleeveLength: 'short',
    skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    frontPlacket: true,
    full: true,
    note_en: 'A sleeveless pinafore with a full front button placket, drafted as a grown-on stand with buttons and buttonholes.',
    note_tr: 'Tam ön düğme patılı kolsuz jile; pat bütün-kesim bant olarak düğme ve iliklerle çizilir.',
    oov: ['front patch pockets, layered pussy-bow blouse (styling, not drafted)'] },

  { slug: 'sixties-vneck-front-zip-dress',
    en: 'V-neck front-zip dress', tr: 'V yakalı ön fermuarlı elbise',
    period: '1960s', house: 'Marimekko style',
    garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'vNeck', sleeveStyle: 'none', sleeveLength: 'short',
    skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    tie: 3, /* frontNeckBow-> front waist bow proxy */
    full: true,
    note_en: 'A sleeveless fit-and-flare dress shaped by waist darts, with a fabric bow drafted as a separate cut piece at the front.',
    note_tr: 'Bel pensleriyle biçimlenen kolsuz elbise; öndeki kumaş fiyonk ayrı kesim parçası olarak çizilir.',
    oov: ['exposed decorative front zipper, waist pleats (not drafted)'] },

  { slug: 'sixties-side-tie-tweed-shift',
    en: 'Side-tie sleeveless shift', tr: 'Yandan bağlı kolsuz shift',
    period: '1960s', house: 'Bonnie Cashin style',
    garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'boat', sleeveStyle: 'none', sleeveLength: 'short',
    skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
    tie: 1, /* waistSash */
    full: true,
    note_en: 'A high boat-neck A-line shift in nubby wool tweed with a self-fabric tie drafted as its own cut piece.',
    note_tr: 'Yüksek kayık yakalı, düğümlü yUn tvit A kesim shift; öz-kumaş bağ ayrı kesim parçası olarak çizilir.',
    oov: ['coordinating matching coat (separate garment, not drafted)'] },

  { slug: 'sixties-empire-gathered-babydoll',
    en: 'Empire gathered babydoll dress', tr: 'Empire büzgülü bebe elbise',
    period: '1960s', house: 'Oscar de la Renta style',
    garment: 'dress', shaping: 'dart', waistline: 'empire', fabric: 'woven',
    neckline: 'vNeck', sleeveStyle: 'straight', sleeveLength: 'long',
    skirtStyle: 'gathered', skirtLength: 'mini', topLength: 'hip',
    full: true,
    note_en: 'A deep-V empire babydoll with long straight sleeves and a gathered A-line skirt, drafted from the empire seam down.',
    note_tr: 'Derin V empire bebe elbise; uzun düz kollu, empire dikişinden aşağı büzgülü A kesim etekli.',
    oov: ['allover bead/sequin embellishment, scalloped beaded hem (not drafted)'] },

  { slug: 'sixties-stand-collar-tent-mini',
    en: 'Stand-collar tent mini dress', tr: 'Dik yakalı çadır mini elbise',
    period: '1960s', house: 'John Bates style',
    garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
    skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    collarType: 1, collarEdge: 0,
    full: true,
    note_en: 'A sleeveless A-line tent mini with a narrow stand collar, drafted as its own piece.',
    note_tr: 'Dar dik yakalı kolsuz A kesim çadır mini; yaka ayrı parça olarak çizilir.',
    oov: ['stacked horizontal ruffle tiers with corded edging (surface, not drafted)'] },
];

const svgDoc = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" ` +
  `width="100%" role="img"><rect width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#fff"/>${inner}</svg>`;

const engine = await createEngine();
const meta = [];
for (const s of LOOKS) {
  const out = JSON.parse(engine.draftJSON(
    s.garment, s.shaping, s.waistline, s.fabric, s.neckline, s.sleeveStyle, s.sleeveLength,
    s.skirtStyle, s.skirtLength, s.topLength, false, 1, false,
    BODY.bust, BODY.waist, BODY.hip, BODY.shoulder, BODY.backLength, BODY.armLength, BODY.neck, 0,
    s.frontPlacket === true, s.tie || 0, s.sleeveCap || 0, s.collarType || 0, s.collarEdge || 0,
    s.gatherType || 0, s.gatherZone || 0, s.backOpening || 0));
  if (out.error) { console.log(s.slug, 'ERROR', out.error); continue; }
  const p = out.pattern;

  const dims = p.pieces.map((pc) => {
    const b = bounds(pc);
    return { p: pc, b, w: b.maxX - b.minX, h: b.maxY - b.minY };
  });
  const minCols = Math.max(1, Math.ceil((Math.max(...dims.map((d) => d.w)) + 1) / 190));
  let layout = null, bestScore = Infinity;
  for (let c = minCols; c <= minCols + 5; c++) {
    const l = shelfPack(dims.map((d) => ({ ...d })), c);
    const score = Math.abs(Math.log((l.stripW / l.stripH) / 1.15));
    if (score < bestScore) { bestScore = score; layout = l; }
  }

  let inner = '';
  for (const d of layout.placed) {
    const off = pieceTransform(d); // rotation-safe
    const pc = d.p;
    if (pc.cutLine && pc.cutLine.length) {
      inner += `<path transform="${off}" d="${pathD(pc.cutLine, 1)}" fill="none" ` +
        `stroke="#8fbfe8" stroke-width="1.1" stroke-dasharray="5 4"/>`;
    }
    inner += `<path transform="${off}" d="${pathD(pc.commands, 1)}" fill="rgba(63,116,168,.06)" ` +
      `stroke="#1f3a5f" stroke-width="1.4"/>`;
    if (pc.markings && pc.markings.length) {
      inner += `<path transform="${off}" d="${pathD(pc.markings, 1)}" fill="none" ` +
        `stroke="#3f74a8" stroke-width="0.8" stroke-dasharray="3 3"/>`;
    }
    if (pc.grainline) {
      const g = pc.grainline;
      inner += `<line transform="${off}" x1="${g.fromX.toFixed(1)}" y1="${g.fromY.toFixed(1)}" ` +
        `x2="${g.toX.toFixed(1)}" y2="${g.toY.toFixed(1)}" stroke="#3f74a8" stroke-width="0.9"/>`;
    }
    inner += `<text transform="${off}" x="${(d.b.minX + 4).toFixed(1)}" y="${(d.b.minY + 14).toFixed(1)}" ` +
      `font-family="Helvetica,Arial,sans-serif" font-size="11" fill="#1f3a5f">${pc.name}</text>`;
  }
  writeFileSync(join(OUT, `${s.slug}.svg`), svgDoc(layout.stripW, layout.stripH, inner));
  meta.push({ slug: s.slug, en: s.en, tr: s.tr, period: s.period, house: s.house,
    pieces: p.pieces.length, pieceNames: p.pieces.map((x) => x.name),
    fabric: p.fabricMeters140, garment: s.garment, full: s.full,
    note_en: s.note_en, note_tr: s.note_tr, oov: s.oov });
  console.log(`${s.slug}: ${p.pieces.length} pieces, ${p.fabricMeters140} m  [${s.full ? 'FULL' : 'PARTIAL'}]`);
}
writeFileSync(join(OUT, 'meta.json'), JSON.stringify(meta, null, 2));
console.log(`\n${meta.length} looks rendered -> ${OUT}`);
