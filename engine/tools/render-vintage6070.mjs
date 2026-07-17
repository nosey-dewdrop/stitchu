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
const flat = await import(join(here, 'render-flat.mjs'));
const { renderScattered, renderFrontBack } = flat;

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
    garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'knit',
    neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'long',
    skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    full: true,
    note_en: 'A crew-neck knit dress with waist darts, long fitted sleeves and a short A-line skirt. A soft knit fit-and-flare needs no princess panels; a simple darted bodice does the shaping. Every piece is in the engine’s core vocabulary, so it drafts complete.',
    note_tr: 'Bel pensli, uzun oturan kollu, kısa A kesim etekli bisiklet yaka örme elbise. Yumuşak örme vücuda oturan silüet prenses parça istemez; sade pensli beden biçimlendirir. Her parça motorun temel dağarcığında, bu yüzden tam çizilir.',
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

  { slug: 'sixties-boat-neck-shift-mini',
    en: 'Boat-neck sleeveless shift mini', tr: 'Kayık yakalı kolsuz shift mini',
    period: '1960s', house: 'André Courrèges style',
    garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'boat', sleeveStyle: 'none', sleeveLength: 'short',
    skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    full: true,
    note_en: 'A clean sleeveless A-line shift mini with a wide boat neckline, finished with a plain bias-bound neck (no collar; the classic 60s space-age line is collarless). A boxy shift is drafted with simple darts, not princess panels.',
    note_tr: 'Geniş kayık yakalı kolsuz A kesim shift mini; yaka biyeyle bitirilir (yaka yok; 60ların uzay-çağı çizgisi yakasızdır). Kutu gibi shift, prenses parça değil sade pensle çizilir.',
    oov: ['oval welt pockets, self-fabric belt (not drafted)'] },

  { slug: 'sixties-crew-neck-jersey-mini',
    en: 'Crew-neck long-sleeve jersey mini', tr: 'Bisiklet yakalı uzun kollu jarse mini',
    period: '1960s', house: 'Pucci style',
    garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'knit',
    neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'long',
    skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    full: true,
    note_en: 'A fitted long-sleeved jersey mini with a simple round crew neckline and an A-line mini skirt, finished with a plain bias-bound neck (no collar).',
    note_tr: 'Basit yuvarlak bisiklet yakalı, A kesim mini etekli, uzun kollu oturan jarse mini; yaka biyeyle bitirilir (yaka yok).',
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

  { slug: 'sixties-crew-neck-tent-mini',
    en: 'Crew-neck tent mini dress', tr: 'Bisiklet yakalı çadır mini elbise',
    period: '1960s', house: 'John Bates style',
    garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
    skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    full: true,
    note_en: 'A sleeveless A-line tent mini with a simple round crew neckline, finished with a plain bias-bound neck (no collar).',
    note_tr: 'Basit yuvarlak bisiklet yakalı kolsuz A kesim çadır mini; yaka biyeyle bitirilir (yaka yok).',
    oov: ['stacked horizontal ruffle tiers with corded edging (surface, not drafted)'] },

  // ---- More authentic 60s/70s MINI dresses (Damla asked for these: "mini ama
  // tarz"). All collarless (a simple round/boat/scoop neck, bias-bound), which
  // is the iconic Quant/Courreges/Twiggy mod line. Each drafts complete.
  { slug: 'sixties-mod-colorblock-mini',
    en: 'Mod colour-block A-line mini', tr: 'Mod renk-bloklu A kesim mini',
    period: '1960s', house: 'Mary Quant style',
    garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven',
    neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
    skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    full: true,
    note_en: 'A sleeveless princess-seam A-line mini with a round crew neckline, bias-bound (no collar). The princess seams are exactly where the two-tone mod colour-block would run.',
    note_tr: 'Kolsuz prenses dikişli A kesim mini, yuvarlak bisiklet yaka, biyeli (yaka yok). Prenses dikişleri iki-renk mod bloğunun geçtiği yerdir.',
    oov: ['contrast two-tone colour-block panels (colour placement, not drafted)'] },

  { slug: 'seventies-scoop-neck-shift-mini',
    en: 'Scoop-neck shift mini dress', tr: 'Oyuk yakalı shift mini elbise',
    period: '1970s', house: 'Biba style',
    garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
    neckline: 'scoop', sleeveStyle: 'straight', sleeveLength: 'short',
    skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    full: true,
    note_en: 'A short-sleeved scoop-neck A-line shift mini, bias-bound at the neck (no collar). The easy everyday early-70s mini.',
    note_tr: 'Kısa kollu oyuk yakalı A kesim shift mini, boyunda biye (yaka yok). 70lerin başının rahat günlük minisi.',
    oov: ['allover small floral print (print, not drafted)'] },

  { slug: 'sixties-babydoll-scoop-mini',
    en: 'Empire babydoll scoop mini', tr: 'Empire bebe oyuk yaka mini',
    period: '1960s', house: 'Twiggy mod style',
    garment: 'dress', shaping: 'dart', waistline: 'empire', fabric: 'woven',
    neckline: 'scoop', sleeveStyle: 'none', sleeveLength: 'short',
    skirtStyle: 'gathered', skirtLength: 'mini', topLength: 'hip',
    full: true,
    note_en: 'A sleeveless scoop-neck empire babydoll mini: a high seam under the bust flares into a gathered mini skirt, bias-bound at the neck (no collar).',
    note_tr: 'Kolsuz oyuk yakalı empire bebe mini: büst altındaki yüksek dikiş büzgülü mini eteğe açılır, boyunda biye (yaka yok).',
    oov: ['ribbon bow trim at the empire seam (surface, not drafted)'] },

  { slug: 'sixties-boat-neck-longsleeve-mini',
    en: 'Boat-neck long-sleeve mod mini', tr: 'Kayık yakalı uzun kollu mod mini',
    period: '1960s', house: 'Courrèges style',
    garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'knit',
    neckline: 'boat', sleeveStyle: 'straight', sleeveLength: 'long',
    skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip',
    full: true,
    note_en: 'A long-sleeved boat-neck knit mini shaped with simple darts, bias-bound at the neck (no collar). The sharp space-age mod silhouette needs no princess seams in a soft knit.',
    note_tr: 'Uzun kollu kayık yakalı, sade pensle biçimlenen örme mini, boyunda biye (yaka yok). Keskin uzay-çağı mod silueti yumuşak örmede prenses dikiş istemez.',
    oov: ['contrast go-go stripe at cuff and hem (colour, not drafted)'] },
];

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

  const closures = [...new Set(p.pieces.filter((x) => x.closure).map((x) => x.closure))];
  // Spec passed to the finished-garment flat renderer so it draws the correct
  // silhouette (neckline / sleeve present-or-absent / collar / placket / tie /
  // gather / empire seam) parametrically — NOT the mirrored pattern piece.
  const flatSpec = {
    garment: s.garment, shaping: s.shaping, waistline: s.waistline, neckline: s.neckline,
    skirtStyle: s.skirtStyle, skirtLength: s.skirtLength, topLength: s.topLength,
    sleeveStyle: s.sleeveStyle, sleeveLength: s.sleeveLength, sleeveCap: s.sleeveCap || 0,
    collarType: s.collarType || 0, frontPlacket: s.frontPlacket === true,
    tie: s.tie || 0, gatherType: s.gatherType || 0, gatherZone: s.gatherZone || 0,
    backOpening: s.backOpening || 0, closure: closures[0] || null,
  };
  // (1) scattered nested layout, (2) FRONT + BACK flat technical sketch (STEP 2).
  writeFileSync(join(OUT, `${s.slug}.svg`), renderScattered(p.pieces));
  writeFileSync(join(OUT, `${s.slug}-flat.svg`), renderFrontBack(p.pieces, flatSpec));

  meta.push({ slug: s.slug, en: s.en, tr: s.tr, period: s.period, house: s.house,
    pieces: p.pieces.length, pieceNames: p.pieces.map((x) => x.name),
    fabric: p.fabricMeters140, garment: s.garment, full: s.full,
    note_en: s.note_en, note_tr: s.note_tr, oov: s.oov,
    flat: `${s.slug}-flat.svg`, closure: closures[0] || null });
  console.log(`${s.slug}: ${p.pieces.length} pieces, ${p.fabricMeters140} m  [${s.full ? 'FULL' : 'PARTIAL'}]` +
    (closures.length ? ` [closure]` : ''));
}
writeFileSync(join(OUT, 'meta.json'), JSON.stringify(meta, null, 2));
console.log(`\n${meta.length} looks rendered -> ${OUT}`);
