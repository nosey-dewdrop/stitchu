// vision-bridge.js — the SINGLE mapping from what the vision layer SAW to what
// the engine can DRAW. Extracted from create.js (2026-07-18) so the product
// bridge and the benchmark counter (engine/tools/benchmark-58.mjs) score with
// the SAME logic — a copy that drifts is how 'puff' once counted as FULL.
// Pure functions of the vision `seen` object; no DOM, no engine.

// F2-vision (2026-09-01): the carriage contract — ratio→axis wires and the
// out-of-vocab mapping table live as DATA in contract/vision-tasima-v1.json
// (embedded here through the same generated module every other cross-layer
// value rides). Numbers in it are the engine's own drafted mm (provenance in
// each entry); no threshold is invented in this file.
import { VISION_TASIMA } from './contract.gen.js?v=144';

// Map the vision's yoke / straps / closure / oov terms to a drawable gathering
// (Loop 8). The engine draws a SEPARATE gathered panel (+ a drawstring cord)
// whose gathered edge is trued to the drafted zone edge, for a drawstring/tie
// gathered neckline, a shirred/smocked yoke, a gathered bust panel, or gathered
// straps read as a gathered neck. Returns { type, zone } or null (stays honest).
export function pickGather(seen) {
  const words = [
    seen.yoke && seen.yoke.type, seen.yoke && seen.yoke.name,
    seen.straps && seen.straps.type,
    seen.closure && seen.closure.type, seen.closure && seen.closure.location,
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
  ].filter(Boolean).join(' ').toLowerCase();
  // Which construction gathers the panel?
  let type = null;
  if (words.includes('drawstring')) type = 'drawstring';
  else if (words.includes('smock')) type = 'smocked';
  else if (words.includes('shirr') || words.includes('gathered') || words.includes('gather'))
    type = 'shirred';
  if (!type) return null;
  // Which zone? Prefer the most explicit body word in the terms.
  let zone = null;
  if (words.includes('neck') || words.includes('yoke') || words.includes('milkmaid') ||
      words.includes('babydoll') || words.includes('strap')) zone = 'neckline';
  else if (words.includes('bust') || words.includes('chest')) zone = 'bust';
  else if (words.includes('waist')) zone = 'waist';
  else if (words.includes('sleeve')) zone = 'sleeve';
  // A drawstring/gathered SLEEVE is its own honest case elsewhere (needs the arm
  // casing); only draw sleeve gathering when the term clearly says sleeve AND is
  // a shirred/smocked panel, otherwise fall back to a neckline panel default.
  if (!zone) zone = 'neckline';
  return { type, zone };
}

// Map the vision's closure / backDetail to a drawable tie placement (Loop 4b).
// Only SIMPLE APPLIED ties become pieces; a drawstring that GATHERS the fabric
// (needs a casing + shirring the engine cannot draft) returns 'none' and stays
// in the honesty layer. A back-waist bow/sash, an open-back tie-back closure, a
// front neck bow and cuff ties are drawn; a neckline/waist DRAWSTRING is not.
export function pickTiePlacement(seen) {
  const isDrawstring = (s) => {
    const t = (s || '').toLowerCase();
    return t.includes('drawstring') || t.includes('gathered') || t.includes('shirr') || t.includes('smock');
  };
  // A drawstring named anywhere in the honesty channel = gathering construction.
  const oov = Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '';
  // Back tie-back closure (open-back dress that ties shut at the back).
  if (seen.backDetail === 'tieBack') return 'tieBack';
  const c = seen.closure;
  if (c && c.type === 'ties') {
    const loc = (c.location || '').toLowerCase();
    // A drawstring GATHERED neckline/waist is NOT a simple applied tie.
    if (isDrawstring(c.location) || (isDrawstring(oov) && (loc.includes('neck') || loc.includes('waist')))) {
      // only bail if the drawstring is the SAME location as this tie
      if (loc.includes('neck') && isDrawstring(oov)) return 'none';
    }
    if (loc.includes('waist')) return 'backWaistBow';
    if (loc.includes('back')) return 'backWaistBow';
    if (loc.includes('neck')) return isDrawstring(oov) ? 'none' : 'frontNeckBow';
    if (loc.includes('front') || loc.includes('center')) return 'frontNeckBow';
    // ties with no clear location: default to a back-waist sash (the manifest's
    // most common tie), still a simple applied strip.
    return 'backWaistBow';
  }
  return 'none';
}

// Map the vision's collar + oov terms to a drawable collar (Loop 7/8). The engine
// draws a SEPARATE collar piece, neck edge trued to the neckline, for the stand/
// mock/flat/peter-pan/shirt family. A special finish the engine does NOT draft,
// a bias-bound neckline (a bound raw edge, no piece), a notched/sailor tailored
// collar, returns {type:'none'} and stays in the honesty layer. Returns
// { type: spec collarType string, edge: collarEdge string } or null.
export function pickCollar(seen) {
  const words = [
    seen.collar && seen.collar.type, seen.collar && seen.collar.name,
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
  ].filter(Boolean).join(' ').toLowerCase();
  if (!words.includes('collar') && !(seen.collar && seen.collar.type &&
      seen.collar.type !== 'none')) return null;
  // Special finishes we do NOT draft, stay honest.
  if (words.includes('bias-bound') || words.includes('bias bound') ||
      words.includes('bound neckline') || words.includes('notch') ||
      words.includes('sailor') || words.includes('lapel')) return null;
  // Outer-edge shape.
  let edge = 'round';
  if (words.includes('scallop')) edge = 'scallop';
  else if (words.includes('point')) edge = 'pointed';
  // Collar family. The vision schema speaks a CLOSED camelCase enum
  // (contract/garment-spec.schema.json collar.type: stand/shirt/peterPan/
  // mandarin/notched/sailor/other) — map that enum FIRST, deterministically.
  // 2026-07-27 kopuk kablo: the camelCase 'peterPan' fell through the
  // 'peter pan'/'peter-pan' prose regex and the collar silently vanished; an
  // enum value never goes through a prose regex again. notched/sailor are
  // tailored collars the engine does not draft — an explicit null, the
  // honesty card in missing.js names them. The prose regex below keeps
  // serving the free-text channel (collar.name + outOfVocab) and 'other'.
  const COLLAR_ENUM_MAP = { stand: 'stand', shirt: 'shirt', peterPan: 'peterPan', mandarin: 'mock' };
  const enumType = seen.collar && seen.collar.type;
  if (enumType === 'notched' || enumType === 'sailor') return null;
  let type = COLLAR_ENUM_MAP[enumType] || null;
  if (!type) {
    if (words.includes('peter pan') || words.includes('peter-pan') ||
        words.includes('peterpan') || words.includes('bebe'))
      type = 'peterPan';
    else if (words.includes('mock') || words.includes('mandarin')) type = 'mock';
    else if (words.includes('stand')) type = 'stand';
    else if (words.includes('shirt') || words.includes('gömlek')) type = 'shirt';
    else if (words.includes('scallop')) type = 'peterPan';   // scallop = a flat collar edge
    else if (words.includes('rounded') || words.includes('round')) type = 'peterPan';
    else if (words.includes('flat') || words.includes('collar')) type = 'flat';
  }
  if (!type) return null;
  return { type, edge };
}

// Map the vision's backDetail + oov terms to a drawable open-back cutout shape
// (Loop 9b). The engine opens a shaped cutout in the BACK center piece + a facing
// whose inner edge is trued to the opening. This is INDEPENDENT of a tie-back
// (Loop 4b): a Tie Back Mini Dress has BOTH, the tie draws the closure, this
// draws the round opening it fastens over. Returns a spec backOpening string
// ('round'|'lowV'|'square'|'keyhole') or null (stays honest).
export function pickBackOpening(seen) {
  const words = [
    seen.backDetail,
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
  ].filter(Boolean).join(' ').toLowerCase();
  const named = /open.?back|back.?cutout|backless|open .?back|low open back/.test(words) ||
                seen.backDetail === 'openBack';
  if (!named) return null;
  // Shape from any descriptor; default to a round cutout (the set's common case).
  if (/keyhole/.test(words)) return 'keyhole';
  if (/square/.test(words)) return 'square';
  if (/\bv-?\b|low-?v|deep v|v cut|v-cut|plunge/.test(words)) return 'lowV';
  return 'round';
}

// Map the vision's back-closure fields to a corset lace-up back. The engine draws
// a CB facing strip on each back edge + two trued eyelet columns + a lacing cord
// (an eyelet-laced, open-gap, ADJUSTABLE back). A laced back reads as either a
// backDetail === 'lacedBack', a closure.type === 'lace-up', or a laced/eyelet/
// corset-lacing term in the oov/details channel. Returns 1 (Corset) or 0.
// Distinct from a tie-back (fabric ties, Loop 4b) and an open-back cutout (a
// faced hole, Loop 9b) — this is a criss-cross eyelet lacing across a CB gap.
export function pickLaceUpBack(seen) {
  if (seen.backDetail === 'lacedBack') return 1;
  if (seen.closure && seen.closure.type === 'lace-up') return 1;
  const words = [
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  // A corset / laced / eyelet-and-cord back. A plain fabric "tie back" bow is a
  // DIFFERENT construction (pickTiePlacement handles it) and is not this.
  if (/(corset|lace-?up|laced|eyelet|grommet)/.test(words) &&
      /back|corset|bodice|lacing|eyelet|grommet/.test(words)) return 1;
  return 0;
}

// Map the vision's fields to a TRUE wrap / surplice front (wrapfront.cpp). The
// engine reshapes the FRONT bodice into a crossed double front (each front laps
// past CF into a diagonal wrap edge, cut 2 mirror, surplice V). A wrap reads as a
// FRONT cue — most reliably in the honesty channel (a "wrap"/"surplice"/
// "crossover"/"faux wrap"/"kruvaze" phrase) or the details sentence — and usually
// pairs with a vNeck and a waist/side tie. It is DISTINCT from a corset lace-up
// (a back closure) and from a plain waist bow. A jacket-style "wrap coat" or a
// "wrap skirt" is a different (undrawn) build — require a FRONT/bodice/dress
// context and reject a skirt/coat-only phrase. Returns 1 (Surplice) or 0.
export function pickWrapFront(seen) {
  const words = [
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
    seen.closure && seen.closure.location,
  ].filter(Boolean).join(' ').toLowerCase();
  // A wrap / surplice / crossover / faux-wrap / cache-coeur / kruvaze FRONT.
  const isWrap = /surplice|cross[\s-]?over|crossover|faux[\s-]?wrap|cache[\s-]?c(o|œ)eur|kruvaze|wrap[\s-]?(front|bodice|dress|top|over)|\bwrap\b/.test(words);
  if (!isWrap) return 0;
  // A wrap SKIRT (lower body only) or a wrap COAT/robe (outerwear) is a different
  // construction the engine does not draft as a bodice surplice — stay honest.
  if (/wrap[\s-]?(skirt)/.test(words) && !/dress|bodice|top|surplice|cross/.test(words)) return 0;
  if (/(coat|jacket|robe|kimono|cardigan)/.test(words) && !/dress|surplice|cross|bodice/.test(words)) return 0;
  return 1;
}

// Map the vision's oov terms to a back hem slit / walking vent (Loop M1). The
// engine cuts the back with a center-back seam and opens a walking slit from the
// hem; a "vent"/"kick" reads as a lapped walking vent, else a plain slit (the
// set's common "back hem slit"). Only a straight/A-line skirt hosts one — the
// caller and the engine both gate on that. Returns 'vent'|'slit' or null (honest).
export function pickHemSlit(seen) {
  const words = [
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  // A back hem slit / vent / walking slit; a "kick pleat" reads as a vent too.
  const named = /back .?(hem )?slit|hem slit|walking (slit|vent)|back vent|kick (pleat|vent)|\bvent\b/.test(words);
  if (!named) return null;
  if (/vent|kick/.test(words)) return 'vent';
  return 'slit';
}

// Map the vision's straps / oov terms to a ruffled shoulder strap (queue #3).
// The engine draws ONLY the ruffled (gathered-strip) strap as a separate pair;
// a plain shoulder/wide strap is the engine's plain edge, and a spaghetti /
// one-shoulder / off-shoulder / halter strap is a different construction that
// stays in the honesty layer. Returns 'ruffled' or null.
export function pickRuffledStraps(seen) {
  if (seen.straps && seen.straps.type === 'ruffled') return 'ruffled';
  const words = [
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  // A ruffled / frilled / gathered / flutter shoulder strap. A spaghetti / halter
  // / one-shoulder / off-shoulder strap is NOT this (stays honest).
  if (/(ruffled?|frilled?|gathered|flutter)\s*(shoulder\s*)?strap/.test(words) &&
      !/spaghetti|halter|one[\s-]?shoulder|off[\s-]?shoulder/.test(words)) {
    return 'ruffled';
  }
  return null;
}

// Map the vision's oov / details to a peplum flare (R1.1). The engine draws the
// FULL-circle, HALF-circle and POINTED (handkerchief) flared peplum as a
// separate circular flounce trued to the waist. A pleated / gathered / draped /
// tiered peplum is a different construction that stays honest. Returns
// 'full'|'half'|'pointed' or null.
export function pickPeplum(seen) {
  const words = [
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  if (!/peplum|waist flounce|waist frill/.test(words)) return null;
  // A pleated / gathered / draped / tiered peplum is NOT the circular flare the
  // engine drafts — leave it honest.
  if (/pleated|gathered|draped|tiered|box[\s-]?pleat/.test(words)) return null;
  if (/pointed|handkerchief|dip|asymmetric/.test(words)) return 'pointed';
  if (/half[\s-]?circle/.test(words)) return 'half';
  return 'full';
}

// Map the vision's oov / details to an ALL-AROUND HEM FLOUNCE (etek ucu volanı) —
// a gathered flounce tier hung from the WHOLE hem (front + back), the dropped-
// waist tiered look. Distinct from a PEPLUM (a circular flare at the WAIST, above
// the hem) and from a BACK-ONLY ruffle/flounce (at the nape / back neck). The
// engine draws the GATHERED variant; a pleated / circular / multi-tier / one-
// sided hem flounce stays honest. Returns 'gathered' or null.
export function pickHemFlounce(seen) {
  const words = [
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  // A peplum sits at the WAIST — that is pickPeplum's job, not a hem flounce.
  const isPeplum = /peplum|waist flounce|waist frill/.test(words);
  // Read an all-around flounce/ruffle/frill/volan/tier AT THE HEM (or a dropped-
  // waist tier). Require a hem / all-around / dropped-waist / tiered signal so a
  // sleeve or neck ruffle does not trigger it.
  const flounceWord = /flounce|ruffle|frill|volan|tier(ed)?|flare/.test(words);
  const hemSignal = /hem|bottom|all[\s-]?around|all[\s-]?round|round the|dropped[\s-]?waist|drop[\s-]?waist|drop waist|skirt tier/.test(words);
  if (isPeplum) return null;
  if (!flounceWord || !hemSignal) return null;
  // Back-only / one-sided / nape flounce is not an all-around hem tier.
  if (/back[\s-]?only|nape|at the back|back neck|one[\s-]?side/.test(words)) return null;
  // Constructions the engine does NOT draft as a gathered hem tier — stay honest.
  if (/pleated|box[\s-]?pleat|circular|multi[\s-]?tier|two[\s-]?tier|three[\s-]?tier/.test(words)) return null;
  return 'gathered';
}

// Map the vision's oov / details to a pocket (patch 3.12; slash added later).
// The engine draws a PATCH pocket (a separate piece sewn onto the outside + a
// placement mark), a SIDE-SEAM in-seam pocket (two bag pieces + a mouth mark),
// and a SLASH pocket (a diagonal front-hip mouth + a facing + a bag — the jeans/
// trouser angled front pocket). A welt / besom / bound / cargo / flap / kangaroo
// pocket is a DIFFERENT construction that stays honest. Returns
// 'patch' | 'sideSeam' | 'slash' or null.
export function pickPocket(seen) {
  const words = [
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  if (!/pocket/.test(words)) return null;
  // Constructions the engine does NOT draft — leave them honest.
  if (/welt|besom|bound|jetted|cargo|flap|kangaroo|patch flap|zip(per)?\s*pocket/.test(words)) {
    return null;
  }
  // An angled / diagonal / slant / jeans / trouser front pocket = the slash
  // pocket (a diagonal mouth cut into the front hip). Checked BEFORE side-seam
  // so a "slash" read draws the real angled mouth, not a vertical in-seam bag.
  if (/slash|slant(ed)?|angled|diagonal|jeans?|trouser|western/.test(words)) return 'slash';
  // A side-seam / in-seam / hidden pocket rides the side seam (vertical mouth).
  if (/side[\s-]?seam|in[\s-]?seam|inseam|hidden|seam pocket/.test(words)) return 'sideSeam';
  // A patch pocket is a piece applied to the surface (the most common read).
  if (/patch|hip pocket|chest pocket|applied pocket/.test(words)) return 'patch';
  // A bare "pocket" with no welt/side/slash cue reads as the common patch pocket.
  return 'patch';
}

// Map the vision's oov / details to a sleeve-end cuff style (patch 3.13). A
// BUTTON (barrel/shirt) cuff → 'button'; a RIBBED (knit rib) cuff → 'ribbed'.
// Only a real cuff term matches; a FRENCH cuff (double turn-back) and an ELASTIC
// / casing cuff are NOT drawn → null (stay honest). Returns 'button', 'ribbed',
// or null. The sleeve gate (must be a full-length sleeve) is applied at the call
// site, mirroring the engine's honest skip.
export function pickCuff(seen) {
  const words = [
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  if (!/\bcuff\b/.test(words)) return null;
  // French / elastic-casing / ruffle / tie cuffs are a different construction.
  if (/french|elastic|casing|ruffle|frill|tie/.test(words)) return null;
  if (/rib(bed)?|knit|bomber|sweat/.test(words)) return 'ribbed';
  if (/button|barrel|shirt|placket/.test(words)) return 'button';
  return 'button'; // a plain "cuff" on a woven sleeve reads as the barrel cuff
}

// Map the vision's oov / details to a hem SHAPE (patch 3.15+). The engine reshapes
// the fitted lower edge into a shirt-tail (sides up, center long), a high-low (front
// short, back long), a corset/basque POINT (center dips to a V, sides level), or an
// inverted BOX-PLEAT / kick pleat released at the hem. A handkerchief (multi-point)
// / asymmetric-diagonal / mullet-on-a-gathered-skirt hem is a different construction
// that stays honest. Returns 'shirttail' | 'highLow' | 'pointedV' | 'boxPleatHem' or
// null. Gated onto the right host (pointedV = fitted bodice/top; boxPleatHem =
// straight/aLine) by the caller.
export function pickHemShape(seen) {
  const words = [
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  const hemContext = /hem|hemline|lower edge/.test(words);
  if (!hemContext &&
      !/high[\s-]?low|mullet|shirt[\s-]?tail|shirttail|corset|basque|box[\s-]?pleat|kick[\s-]?pleat/.test(words))
    return null;
  // A corset / basque / center-V POINT hem is now drawn (center dips, sides level).
  // A handkerchief / multi-point / diagonal / asymmetric hem is a DIFFERENT
  // construction — leave it honest. So a corset/basque cue wins first, otherwise a
  // pointed/V/angled/asymmetric/diagonal/handkerchief cue stays honest.
  if (/corset|basque/.test(words) ||
      ((/point|\bv[\s-]?hem|v[\s-]?shaped/.test(words)) &&
       !/handkerchief|multi|asymmetric|diagonal|angled/.test(words)))
    return 'pointedV';
  if (/handkerchief|pointed|asymmetric|diagonal|angled/.test(words)) return null;
  // An inverted box pleat / kick pleat released at the hem for kick/flare.
  if (/(inverted )?box[\s-]?pleat|kick[\s-]?pleat|kick pleat|pleated kick/.test(words))
    return 'boxPleatHem';
  if (/high[\s-]?low|mullet|dipped back|dip hem|longer at (the )?back/.test(words)) return 'highLow';
  if (/shirt[\s-]?tail|shirttail|curved hem|cowboy|rounded hem|curved hemline/.test(words)) return 'shirttail';
  return null;
}

// Map the vision's closure + oov to a placket style (R1.2). The engine draws a
// symmetric CF button stand (Standard) and now also an ASYMMETRIC one (the CF
// closure shifted off center — the Jackie gingham). Returns 'asymmetric',
// 'standard', or null. `frontButtons` is whether a front button closure was read.
export function pickPlacket(seen, frontButtons) {
  const words = [
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
    seen.closure ? `${seen.closure.type || ''} ${seen.closure.location || ''}` : '',
  ].filter(Boolean).join(' ').toLowerCase();
  // Asymmetric = an off-center / diagonal / offset button front. It must name a
  // button/placket closure so a non-closure "asymmetric hem" never matches.
  const asym = /(asymmetric|asymmetrical|offset|off[\s-]?cent|diagonal)\b/.test(words) &&
    /(button|placket|closure|front)/.test(words);
  if (asym) return 'asymmetric';
  return frontButtons ? 'standard' : null;
}

// vocab 2026-07-17. Map the vision oov/details to a back detail (arka pelerin/
// fırfır). The engine draws a back-neck ruffle, cape, or circular flounce.
// Returns 'ruffle' | 'cape' | 'flounce' or null. A hood / watteau / shoulder cape
// stays honest.
export function pickBackDetail(seen) {
  const words = [
    seen.backDetail || '',
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  if (!/back.*(cape|ruffle|frill|flounce|cascade)|caped back|pelerin|cape back/.test(words)) return null;
  if (/hood|watteau|train|shoulder cape/.test(words)) return null;
  if (/cape|pelerin/.test(words)) return 'cape';
  if (/flounce|cascade/.test(words)) return 'flounce';
  if (/ruffle|frill/.test(words)) return 'ruffle';
  return null;
}

// vocab 2026-07-17. Map the vision to an exposed/visible zipper (görünür fermuar).
// Returns 'centerFront' | 'centerBack' or null. A separating / two-way / diagonal
// zip stays honest.
export function pickExposedZip(seen) {
  const words = [
    seen.closure ? `${seen.closure.type || ''} ${seen.closure.location || ''}` : '',
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  if (!/exposed zip|visible zip|expose[d]? zipper|statement zip|contrast zip/.test(words)) return null;
  if (/separating|two[\s-]?way|diagonal|pocket/.test(words)) return null;
  if (/back/.test(words)) return 'centerBack';
  return 'centerFront';
}

// vocab 2026-07-17. Map the vision to an off-shoulder / bardot neckline (omuz
// açık). Returns 'frill' | 'plain' or null. A one-shoulder / strapless / structured
// off-shoulder stays honest.
export function pickBardot(seen) {
  const words = [
    seen.neckline || '',
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  if (!/off[\s-]?shoulder|bardot|off the shoulder|omuz açık/.test(words)) return null;
  if (/one[\s-]?shoulder|strapless|structured|boned/.test(words)) return null;
  if (/frill|ruffle|flounce|bardot frill/.test(words)) return 'frill';
  return 'plain';
}

// Map the vision's cupSeams read to a drawable horizontal cup seam (cupseam.cpp).
// The engine splits the princess front into an Upper Cup + Lower Cup + Front Body
// along a HORIZONTAL seam through the bust apex — the strapless/bustier
// construction. The host-gate (princess + strapless + a sweetheart/square/scoop
// top edge) is the ENGINE's rule and is enforced at the call site (create.js);
// this pick only reports whether the vision SAW that construction. Returns 1
// (horizontal) or null (no cup seam / stays honest). The vision carries a
// `cupSeams` boolean (true = separate bra-cup pieces joined by a curved seam);
// the oov/details channel names a bustier/corset-cup read too.
export function pickCupSeam(seen) {
  if (seen.cupSeams === true) return 1;
  const words = [
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  // A named bustier / corset-cup / seamed-cup bust construction. A moulded /
  // foam / padded cup with NO seam is a different (undrawn) build → stays honest.
  if (/moulded|molded|foam|padded/.test(words)) return null;
  if (/cup seam|bra[\s-]?cup|bustier cup|corset cup|seamed cup|underbust seam|cup bodice/.test(words)) return 1;
  return null;
}

// Map the vision's yoke read to a drawable yoke split (yoke.cpp). The engine
// splits the front+back bodice along a HORIZONTAL seam into a Yoke (shoulder
// panel) + a lower Body: yoke:1 = PLAIN seam, yoke:2 = GATHERED (the body
// gathers/shirrs onto the yoke seam — a doll/babydoll/swing dress). The host
// (a dress/top with a bodice) is gated at the call site. Vision carries
// `seen.yoke` = { type: none|shoulderYoke|shirring|smocking, location }; a
// shirring/smocking yoke reads as gathered, a plain shoulderYoke as plain.
// Returns 2 (gathered), 1 (plain) or null (no yoke / stays honest).
export function pickYoke(seen) {
  const type = seen.yoke && seen.yoke.type;
  const words = [
    type, seen.yoke && seen.yoke.location,
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  const structured = type && type !== 'none';
  const named = /\byoke\b|roba|babydoll|baby doll|doll dress|swing dress|smock(ed|ing)?\s*(bodice|yoke|panel)?|shirr(ed|ing)?\s*(bodice|yoke|panel)?/.test(words);
  if (!structured && !named) return null;
  // Gathered below the yoke seam (shirred/smocked/gathered body) → yoke:2.
  if (type === 'shirring' || type === 'smocking' ||
      /shirr|smock|gathered below|gather(ed)? (bodice|body|below)|babydoll|baby doll|swing/.test(words)) {
    return 2;
  }
  // A plain (un-gathered) yoke seam → yoke:1.
  return 1;
}

// Map the vision to a center box pleat (boxpleat.cpp). The engine folds a SINGLE
// inverted box pleat behind the center-front panel (a localized fold, not the
// distributed gather it already has) — the swing/doll center fold. There is NO
// structured vision field for a box pleat (the visionReading schema carries none),
// so this reads ONLY the free-text oov/details channel: a clear center box /
// inverted pleat read. A distributed knife/accordion/kick pleat is a DIFFERENT
// construction that stays honest. Returns 1 (centerInverted) or null.
export function pickBoxPleat(seen) {
  const words = [
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  // Must clearly name a CENTER box / inverted (single-fold) pleat. A skirt's
  // knife/accordion/sunburst/kick pleating is not this localized CF fold.
  if (/knife|accordion|sunburst|sunray|kick|side pleat/.test(words)) return null;
  if (/(center|centre|central|front|cf)[\s-]*(box|inverted)[\s-]*pleat|(box|inverted)[\s-]*pleat[\s-]*(center|centre|front|cf)|center fold pleat|inverted box pleat/.test(words)) {
    return 1;
  }
  return null;
}


// Olcum kapisi (2026-07-27, "LLM'den sayi istemeyi birak" adli raporu): the
// SINGLE door through which numbers enter `seen`. The LLM's ratios{} answer is
// never consumed (anchor-echo: minis clustered on the prompt's example 1.55);
// the only trusted source is the deterministic pixel measurement (measure.js)
// run on the SAME canvas the label read used. Rules:
// - measurement ok:true AND confidence >= MEASURE_MIN_CONFIDENCE
//   -> seen.ratios = the MEASURED ratios, seen.ratiosMeasured = true.
// - anything else -> seen.ratios = null, ratiosMeasured = false: every ratio
//   consumer below returns its honest default and the enum path drives,
//   exactly as before the photo-ratio wire existed.
// Returns 'measured' | 'belirsiz' | 'standard' so the result screen can say
// which one happened. Runs AFTER validateVision (the schema gate) in create.js.
// measure.js refuses below its own 0.45 floor; the wiring demands a margin on
// top because a wrong ratio silently reshapes the pattern, which is worse
// than falling back to the standard table.
//
// F2-vision (2026-09-01) — THE NULLING IS GONE. A measurement that ran but
// landed under the confidence margin used to be THROWN AWAY (seen.ratios =
// null, no trace). It is now CARRIED as 'belirsiz': seen.ratiosUncertain keeps
// the measured numbers + confidence, the user is told BY NAME which ratios
// were not read confidently, and the PATTERN uses the most constraining value
// — the standard table itself (every consumer still gates on
// seen.ratiosMeasured === true, so an uncertain ratio never reshapes the
// draft; it only stops being invisible). The LLM anchor-echo door stays shut:
// only the deterministic pixel measurement's own numbers ride this channel.
export const MEASURE_MIN_CONFIDENCE = 0.6;
export function applyMeasuredRatios(seen, measured) {
  const ran = !!(measured && measured.ratios &&
    typeof measured.confidence === 'number');
  const trusted = ran && measured.ok === true &&
    measured.confidence >= MEASURE_MIN_CONFIDENCE;
  seen.ratios = trusted ? measured.ratios : null;
  seen.ratiosMeasured = trusted;
  if (!trusted && ran) {
    // The measurement produced numbers but not enough confidence: keep them
    // labelled, never consumed by the draft.
    seen.ratiosUncertain = measured.ratios;
    seen.ratiosUncertainConfidence = measured.confidence;
    return 'belirsiz';
  }
  seen.ratiosUncertain = null;
  seen.ratiosUncertainConfidence = null;
  return trusted ? 'measured' : 'standard';
}

// The ratio names of a 'belirsiz' carry, for the screen sentence ("bu oranı
// emin okuyamadım: …"). Only numeric fields count — an honest null inside the
// measurement (e.g. sleeve not separable) is a different sentence and already
// carries its own reason in ratioNull.
export function uncertainRatioNames(seen) {
  const r = seen && seen.ratiosUncertain;
  if (!r) return [];
  return Object.keys(r).filter((k) => typeof r[k] === 'number' && Number.isFinite(r[k]));
}

// Oran kablosu 2 (2026-07-27): the first consumer of the MEASURED
// hemToWaistWidth — the skirt FULLNESS class. The measured hem-to-narrowest
// width ratio picks between the engine's EXISTING skirt styles (no invented
// motor parameter): thresholds sit at the midpoints of what each style
// actually drafts on the EU38 demo body (waist 700, hip 940 mm):
//   straight   hem = hip                    -> hem/waist ~ 1.34
//   aLine      hem = hip + 4x60mm flare     -> hem/waist ~ 1.69
//   gathered   hem = waist x 1.9 (skirt.hpp gatherRatio) -> 1.90
//   halfCircle hem/waist = (r+L)/r, r=waist/pi, midi -> ~ 3.2
// A structural pleated/gore label OUTRANKS the ratio: pleats and gore seams
// are fold/seam constructions a width ratio cannot see, only the label read
// can. A top has no skirt to shape. Out-of-contract-band values (0.5-5, the
// schema band) return null honestly.
export const SKIRT_FULLNESS_TABLE = [
  { below: 1.51, style: 'straight' },
  { below: 1.80, style: 'aLine' },
  { below: 2.55, style: 'gathered' },
  { below: Infinity, style: 'halfCircle' },
];
export function pickSkirtFullness(seen) {
  if (!seen || seen.ratiosMeasured !== true) return null;
  const r = seen.ratios;
  if (!r || typeof r.hemToWaistWidth !== 'number' || !Number.isFinite(r.hemToWaistWidth)) return null;
  if (r.hemToWaistWidth < 0.5 || r.hemToWaistWidth > 5) return null;
  if (seen.garment === 'top') return null;
  if (seen.skirtStyle === 'pleated' || seen.skirtStyle === 'gore') return null;
  for (const row of SKIRT_FULLNESS_TABLE) {
    if (r.hemToWaistWidth < row.below) return row.style;
  }
  return null;
}

// Foto-oran kablosu (2026-07-27): the first CONSUMER of visionReading.ratios.
// Turns the measured photo proportions into a CONTINUOUS skirt length in mm,
// scaled by the WEARER's own measurements — two different "midi" photos now
// draft different hems. Returns 0 (= off, the mini/midi/maxi table drives)
// whenever the read is not trustworthy. Since 2026-07-27 the ratios feeding
// this are the DETERMINISTIC pixel measurement only (applyMeasuredRatios):
// seen.ratiosMeasured is the structural witness, an LLM ratios{} without it
// returns 0. v1 honest scope: a DRESS with a
// natural waist. Empire stays off (the engine's empire lengthExtraMM already
// lengthens the skirt from the raised seam — feeding a seam-relative photo
// measure on top would double-count); a skirt stays off (the measurement
// anchors lengthToWidth to the BUST line, which a skirt photo does not have —
// that read is not defined yet). The engine clamps 250-1200 as the safety band.
export function pickSkirtLengthMM(seen, body) {
  if (!seen || seen.ratiosMeasured !== true) return 0;
  const r = seen.ratios;
  if (!r || typeof r.lengthToWidth !== 'number' || !(r.lengthToWidth > 0)) return 0;
  if (!body || !(body.bust > 0) || !(body.backLength > 0)) return 0;
  if (seen.garment !== 'dress') return 0;
  if (seen.waistline === 'empire') return 0;
  // Flat front width at the bust ≈ (bust + wearing ease) / 2. The 1.08 here is
  // a bridge ESTIMATE for photo scaling only — the drafted ease stays the
  // engine's own fabric-dependent table.
  const bustFlatMM = body.bust * 10 * 1.08 / 2;
  const garmentLenMM = r.lengthToWidth * bustFlatMM;    // shoulder → hem
  const skirtLenMM = garmentLenMM - body.backLength * 10; // minus nape → waist
  if (!Number.isFinite(skirtLenMM) || skirtLenMM <= 0) return 0;
  // Clamp to the engine's own 250-1200 safety band HERE, at the source: the
  // wasm clamps silently but the API validator honestly rejects out-of-band,
  // so an unclamped bridge value (a long maxi measuring 1204) would draft in
  // the browser and 422 on the API — two paths, two languages. One clamp,
  // one language (found by oran-kablo-proof.mjs on photo 13.50.29 + tall body).
  return Math.round(Math.min(1200, Math.max(250, skirtLenMM)));
}

// Foto-anı bug fix (2026-07-27): the mm above used to be computed ONCE, at the
// moment the photo was analyzed — usually against the EU38 demo body — and
// never again when the user entered her OWN measurements. This is the single
// re-derive rule create.js calls on EVERY spec-screen entry (measurement
// wizard done, profile switched): the photo read is a RATIO, the mm must
// always be ratio x the CURRENT body. A hand-picked mini/midi/maxi is an
// explicit order (create.js sets handPicked) — the photo mm stays dropped
// until a NEW photo is read. Returns the mm the spec should carry.
export function refreshSkirtLengthMM(currentMM, photoSeen, body, handPicked) {
  if (!photoSeen || handPicked) return currentMM || 0;
  return pickSkirtLengthMM(photoSeen, body);
}

// ── F2-vision ORAN KABLOLARI (2026-09-01) ──────────────────────────────────
// The photo measurement returns SEVEN continuous ratios (measure.js worker
// schema) and until F2 only two of them ever reached the engine
// (lengthToWidth → skirtLengthMM, hemToWaistWidth → skirt fullness). The five
// below now land on the engine's own axes through the SAME bridge estimate
// pickSkirtLengthMM already uses (ratio × the wearer's body → mm), against
// thresholds that are the engine's own drafted millimetres
// (contract/vision-tasima-v1.json oranKablolari, provenance per entry).
// Every consumer gates on seen.ratiosMeasured === true — an LLM ratios{} or a
// 'belirsiz' low-confidence read never reshapes the draft (photo_ratio_wire).
const ORAN = VISION_TASIMA.oranKablolari;

// Bridge estimate of the photographed garment's total length in mm (shoulder →
// hem), the same formula pickSkirtLengthMM documents: flat bust width ≈
// (bust + wearing ease) / 2, 1.08 is the photo-scaling bridge estimate only.
function garmentLengthEstMM(seen, body) {
  if (!seen || seen.ratiosMeasured !== true) return 0;
  const r = seen.ratios;
  if (!r || typeof r.lengthToWidth !== 'number' || !(r.lengthToWidth > 0)) return 0;
  if (!body || !(body.bust > 0)) return 0;
  return r.lengthToWidth * (body.bust * 10 * 1.08 / 2);
}

// waistYToLength → waistline (natural | empire). The measured waist (narrowest
// row) depth from the shoulder, in mm, against the midpoint of where the
// engine's own natural (445mm) and empire (306mm) bodices put the waist seam.
// A dress only — a top/skirt has no waist seam class to pick.
export function pickWaistlineFromRatio(seen, body) {
  if (!seen || seen.ratiosMeasured !== true || seen.garment !== 'dress') return null;
  const r = seen.ratios;
  if (!r || typeof r.waistYToLength !== 'number' || !(r.waistYToLength > 0)) return null;
  const L = garmentLengthEstMM(seen, body);
  if (!(L > 0)) return null;
  const waistMM = r.waistYToLength * L;
  return waistMM < ORAN.waistYToLength.esikMM ? 'empire' : 'natural';
}

// neckDepthToLength + neckWidthToShoulder → neckline, ONLY inside the round
// family (crew/scoop/boat). A structural label (vNeck, sweetheart, halter, …)
// OUTRANKS the ratio — depth cannot see a shape, only how far it drops
// (contract yasa 5). Width first (boat is the wide-and-shallow special case,
// engine crew 0.3626 vs boat 0.5128), then depth picks crew vs scoop against
// the engine's own drafted CF drops (74.5 vs 109.5mm).
const ROUND_FAMILY = ['crew', 'scoop', 'boat'];
export function pickNecklineFromRatios(seen, body) {
  if (!seen || seen.ratiosMeasured !== true) return null;
  if (!ROUND_FAMILY.includes(seen.neckline)) return null;
  const r = seen.ratios || {};
  if (typeof r.neckWidthToShoulder === 'number' &&
      r.neckWidthToShoulder > ORAN.neckWidthToShoulder.esikOran) return 'boat';
  if (typeof r.neckDepthToLength === 'number' && r.neckDepthToLength > 0) {
    const L = garmentLengthEstMM(seen, body);
    if (L > 0) {
      return (r.neckDepthToLength * L) < ORAN.neckDepthToLength.esikMM ? 'crew' : 'scoop';
    }
  }
  return null;
}

// strapWidthToShoulder → ruffledStraps (spaghetti | wide). Only when the vision
// actually saw straps (a sleeved / strapless garment has none to width-class),
// and a structural 'ruffled' read outranks the width (a frill is a build the
// width cannot see). Thresholds: the engine's own finished strap widths, 8mm
// spaghetti (strap.hpp:40) vs 22mm wide (constants.gen.hpp:33), midpoint 15.
export function pickStrapWidthClass(seen, body) {
  if (!seen || seen.ratiosMeasured !== true) return null;
  if (!seen.straps || !seen.straps.type || seen.straps.type === 'none') return null;
  if (seen.straps.type === 'ruffled') return null; // structural read wins
  const r = seen.ratios || {};
  if (typeof r.strapWidthToShoulder !== 'number' || !(r.strapWidthToShoulder > 0)) return null;
  if (!body || !(body.shoulder > 0)) return null;
  const strapMM = r.strapWidthToShoulder * body.shoulder * 10;
  return strapMM < ORAN.strapWidthToShoulder.esikMM ? 'spaghetti' : 'wide';
}

// sleeveLenToGarment → sleeveLength (short | elbow | long). measure.js v1
// honestly nulls this ratio (sleeve_not_separable_from_silhouette_v1); the wire
// exists so a reading that DOES carry it (a banked fixture, a future separable
// measurement) lands on the engine instead of dying in the bridge. Thresholds:
// the engine's own drafted sleeve piece lengths 227/340/556.8mm, midpoints.
export function pickSleeveLengthFromRatio(seen, body) {
  if (!seen || seen.ratiosMeasured !== true) return null;
  if (!seen.sleeveStyle || seen.sleeveStyle === 'none') return null;
  const r = seen.ratios || {};
  if (typeof r.sleeveLenToGarment !== 'number' || !(r.sleeveLenToGarment > 0)) return null;
  const L = garmentLengthEstMM(seen, body);
  if (!(L > 0)) return null;
  const sleeveMM = r.sleeveLenToGarment * L;
  const [e1, e2] = ORAN.sleeveLenToGarment.esiklerMM;
  if (sleeveMM < e1) return 'short';
  if (sleeveMM < e2) return 'elbow';
  return 'long';
}

// The ONE call product and measurement share for the four NEW wires (the two
// old wires — fullness and skirtLengthMM — keep their own asserted lines in
// create.js; photo_ratio_wire_check pins them verbatim and loosening someone
// else's gate is not this phase's call). Applies each pick to the spec and
// returns the applied list so origins can be labelled. vision_tasima_check
// asserts create.js calls THIS function on the product path.
export function applyRatioAxes(spec, seen, body) {
  const applied = [];
  const wl = pickWaistlineFromRatio(seen, body);
  if (wl) { spec.waistline = wl; applied.push({ oran: 'waistYToLength', eksen: 'waistline', deger: wl }); }
  const nl = pickNecklineFromRatios(seen, body);
  if (nl) { spec.neckline = nl; applied.push({ oran: 'neckDepthToLength/neckWidthToShoulder', eksen: 'neckline', deger: nl }); }
  const st = pickStrapWidthClass(seen, body);
  if (st) { spec.ruffledStraps = st; applied.push({ oran: 'strapWidthToShoulder', eksen: 'ruffledStraps', deger: st }); }
  const sl = pickSleeveLengthFromRatio(seen, body);
  if (sl) { spec.sleeveLength = sl; applied.push({ oran: 'sleeveLenToGarment', eksen: 'sleeveLength', deger: sl }); }
  return applied;
}

// ── F2-vision OOV TELİ (2026-09-01) ────────────────────────────────────────
// Every out-of-vocab term the vision reported gets EXACTLY ONE verdict:
// 'eslendi' (a data rule in contract/vision-tasima-v1.json maps it onto an
// engine axis, whose primitive bundle lives in vocab-resolution-v1.json) or
// 'reddedildi' (by name, with the reason and the nearest sewable suggestion).
// There is no third path — an unmatched term falls into the 'bilinmeyen'
// rejection, never silence. `spec` (optional) lets the verdict also say
// whether the mapped axis actually FIRED on this garment (a host gate may have
// honestly refused; the term then still shows with its axis named).
export function resolveOutOfVocab(seen, spec) {
  const terms = Array.isArray(seen && seen.outOfVocab)
    ? seen.outOfVocab.filter((s) => typeof s === 'string' && s.trim()) : [];
  const tbl = VISION_TASIMA.oovEsleme;
  return terms.map((term) => {
    for (const rule of tbl.kurallar) {
      if (!new RegExp(rule.ara, 'i').test(term)) continue;
      if (rule.durum === 'eslendi') {
        const drawn = !!(spec && spec[rule.eksen] && spec[rule.eksen] !== 'none' &&
          spec[rule.eksen] !== 'straight' && spec[rule.eksen] !== false);
        return { term, durum: 'eslendi', kural: rule.ad, eksen: rule.eksen,
          deger: rule.deger, cozum: rule.cozum, cizildi: drawn };
      }
      return { term, durum: 'reddedildi', kural: rule.ad, sebep: rule.sebep, oneri: rule.oneri };
    }
    return { term, durum: 'reddedildi', kural: 'bilinmeyen', sebep: tbl.bilinmeyen.sebep, oneri: tbl.bilinmeyen.oneri };
  });
}

// ── DÜRÜSTLÜK BAYRAKLARI (F-I, 2026-08-23) ─────────────────────────────────
// `spec.seen`: vision'ın GÖRDÜĞÜ yapısal alanlar + motorun onları ÇİZİP
// çizmediğini söyleyen bayraklar. missing.js'in tek girdisi budur; create.js
// (ürün) ve engine/tools/missing-olcum.mjs (ölçüm) AYNI fonksiyonu çağırır,
// çünkü buranın kopyası sürüklenirse dürüstlük katmanı ters yönde yalan söyler.
export function buildSeenRecord(spec, seen) {
  return {
    // Olcum kapisi: which proportion source drove this spec — true =
    // the deterministic pixel measurement, false = the standard enum
    // table (measurement honestly refused). The result screen prints
    // the matching one-line note; no third (silent) state exists.
    ratiosMeasured: seen.ratiosMeasured === true,
    // F2-vision: a low-confidence measurement is CARRIED, not thrown — the
    // numbers + confidence ride here so the result screen can name the ratios
    // it could not read confidently ("bu oranı emin okuyamadım"). The draft
    // itself used the standard table (the most constraining value); the label
    // is the difference between honest and silent.
    ratiosUncertain: seen.ratiosUncertain || null,
    ratiosUncertainConfidence: (typeof seen.ratiosUncertainConfidence === 'number')
      ? seen.ratiosUncertainConfidence : null,
    // F2-vision: one verdict per out-of-vocab term — mapped onto an axis or
    // rejected by name with the nearest sewable suggestion. missing.js prints
    // the rejections; zero silent drops (vision_tasima_check counts).
    oovKarar: resolveOutOfVocab(seen, spec),
    closure: seen.closure || null,
    collar: seen.collar || null,
    straps: seen.straps || null,
    cupSeams: typeof seen.cupSeams === 'boolean' ? seen.cupSeams : null,
    sleeveHead: seen.sleeveHead || null,
    yoke: seen.yoke || null,
    backDetail: seen.backDetail || null,
    outOfVocab: Array.isArray(seen.outOfVocab) ? seen.outOfVocab.filter((s) => typeof s === 'string' && s.trim()).slice(0, 12) : [],
    // Loop 3 + R1.2: the front button placket is now DRAWN (symmetric CF or
    // asymmetric off-center), so the honesty layer must NOT list it as
    // missing. Every other closure stays honest.
    closureDrawn: spec.frontPlacket === true || spec.placketStyle === 'asymmetric',
    // R1.2: an ASYMMETRIC button placket is now drawn, so an outOfVocab term
    // naming it is no longer missing. A symmetric front stays covered by
    // closureDrawn above.
    placketAsymDrawn: spec.placketStyle === 'asymmetric',
    // Loop 4b: a simple applied tie/sash/bow is now DRAWN as strips, so
    // the honesty layer must NOT list that tie/back-tie as missing.
    // Drawstring-gathered ties are NOT drawn → tieDrawn false, stay honest.
    tieDrawn: spec.tieClosure && spec.tieClosure !== 'none',
    // Loop 6 + R1.2: a gathered/puff sleeve HEAD (raised + widened cap +
    // crown gather) AND the short CAP-sleeve wing are now DRAWN, so the
    // honesty layer must NOT list them as missing. A drawstring-gathered
    // sleeve (needs an arm casing) stays honest.
    sleeveCapDrawn: !!(spec.sleeveCap && spec.sleeveCap !== 'plain'),
    // R1.2: whether the drawn head is specifically the CAP wing (so the
    // honesty layer can suppress the "cap sleeve" derivative note).
    capSleeveDrawn: spec.sleeveCap === 'cap',
    // Loop 7/8: a stand/mock/flat/peter-pan/shirt collar is now DRAWN as a
    // real piece, so the honesty layer must NOT list it as missing. A
    // bias-bound / notched / sailor finish stays honest (collarType none).
    collarDrawn: !!(spec.collarType && spec.collarType !== 'none'),
    // Loop 8: a drawstring/shirred/smocked gathered panel is now DRAWN, so
    // the honesty layer must NOT list that gathering as missing. A special
    // sub-type the engine still can't draft stays honest (gatherType none).
    gatherDrawn: !!(spec.gatherType && spec.gatherType !== 'none'),
    // Loop 9b: an open-back cutout (round/low-V/square/keyhole) is now DRAWN
    // as a facing-finished opening in the back piece, so the honesty layer
    // must NOT list the open-back as missing. A pocket / special back
    // finish clustered with it stays honest (its own oov term still shows).
    backOpeningDrawn: !!(spec.backOpening && spec.backOpening !== 'none'),
    // corset lace-up back: an eyelet-laced CB closure is now DRAWN (CB facing
    // strip + two trued eyelet columns + a lacing cord), so the honesty layer
    // must NOT list the laced back as missing / degrade it to a single tie.
    laceUpBackDrawn: !!(spec.laceUpBack && spec.laceUpBack !== 'none'),
    // wrapfront.cpp: a true wrap / surplice front is now DRAWN (the front
    // reshaped into a crossed double front, cut 2 mirror, surplice V), so the
    // honesty layer must NOT degrade a wrap/surplice read to a mere tie strip.
    wrapFrontDrawn: !!(spec.wrapFront && spec.wrapFront !== 'none'),
    // Loop M1: a back hem slit / walking vent is now DRAWN (CB seam +
    // top-point bar tack + a lapped extension for a vent), so the honesty
    // layer must NOT list the back slit as missing. A front/side slit stays
    // honest (only the CB walking vent is drawn). Also false when the slit
    // was read on a non-hosting (gathered) skirt → stays honest.
    hemSlitDrawn: !!(spec.backSlit && spec.backSlit !== 'none'),
    // queue #3: a ruffled shoulder strap is now DRAWN as a separate gathered
    // strip pair, so the honesty layer must NOT list it as missing. A plain /
    // spaghetti / one-shoulder / off-shoulder / halter strap stays honest
    // (ruffledStraps none — a different construction the engine does not draw).
    ruffledStrapsDrawn: !!(spec.ruffledStraps && spec.ruffledStraps !== 'none'),
    // R1.1: a full/half/pointed circular peplum is now DRAWN as a separate
    // flared piece trued to the waist, so the honesty layer must NOT list it
    // as missing. A pleated/gathered/draped/tiered peplum stays honest
    // (peplum none — a different construction the engine does not draw).
    peplumDrawn: !!(spec.peplum && spec.peplum !== 'none'),
    // All-around hem flounce: a gathered flounce is now DRAWN as a separate
    // strip trued to the whole hem, so the honesty layer must NOT list an
    // all-around / tiered hem flounce as missing. A pleated/circular/multi-
    // tier hem flounce stays honest (hemFlounce none).
    hemFlounceDrawn: !!(spec.hemFlounce && spec.hemFlounce !== 'none'),
    // vocab 2026-07-17: an OFF-SHOULDER / bardot neckline is now DRAWN
    // (top edge dropped below the shoulder + elastic casing + optional
    // frill), so the honesty layer must NOT list off-shoulder as missing. A
    // one-shoulder / strapless / structured off-shoulder stays honest.
    bardotDrawn: !!(spec.bardotStyle && spec.bardotStyle !== 'none'),
    // vocab 2026-07-17: a BACK DETAIL (ruffle/cape/flounce at the back neck)
    // is now DRAWN as a separate piece, so the honesty layer must NOT list a
    // caped/ruffled/flounced back as missing. A hood/watteau stays honest.
    backDetailDrawn: !!(spec.backDetail && spec.backDetail !== 'none'),
    // vocab 2026-07-17: an EXPOSED / visible zipper (CF or CB) is now DRAWN
    // as a teeth glyph + opened seam, so the honesty layer must NOT list an
    // exposed zip as missing. A separating/two-way zip stays honest.
    exposedZipDrawn: !!(spec.exposedZip && spec.exposedZip !== 'none'),
    // vocab 2026-07-17: a decorative/functional BUTTON ROW is now DRAWN as
    // real button circles down the front, so the honesty layer must NOT list
    // a plain button row as missing.
    buttonRowDrawn: !!(spec.buttonRow && spec.buttonRow !== 'none'),
    // patch 3.12: a patch pocket OR a side-seam in-seam pocket is now DRAWN
    // as real piece(s) + a placement/mouth mark, so the honesty layer must
    // NOT list that pocket as missing. A welt/besom/bound/cargo/kangaroo
    // pocket stays honest (pocketStyle none — a different construction the
    // engine does not draw).
    pocketDrawn: !!(spec.pocketStyle && spec.pocketStyle !== 'none'),
    // patch 3.13: a button/ribbed cuff at the sleeve end is now DRAWN as a
    // separate band trued to the wrist (the sleeve hem gathered in), so the
    // honesty layer must NOT list it as missing. A French / elastic-casing /
    // ruffle cuff stays honest (cuffStyle none — a construction the engine
    // does not draft).
    cuffDrawn: !!(spec.cuffStyle && spec.cuffStyle !== 'none'),
    // patch 3.15: a shirt-tail / high-low hem is now DRAWN by reshaping the
    // fitted lower edge, so the honesty layer must NOT list it as missing. An
    // asymmetric-diagonal / handkerchief / mullet-on-a-gathered-skirt hem is a
    // different construction that stays honest (hemShape straight).
    hemShapeDrawn: !!(spec.hemShape && spec.hemShape !== 'straight'),
    // cupseam.cpp: a horizontal bust-cup seam (Upper Cup + Lower Cup + Front
    // Body) is now DRAWN when the host is a strapless princess bustier, so the
    // honesty layer must NOT list cup seams as missing. A sleeved bodice cup
    // seam / a dart bust the engine refused stays honest (cupSeam none).
    cupSeamDrawn: spec.cupSeam !== 'none',
    // yoke.cpp: a plain/gathered yoke split (Front/Back Yoke + Body) is now
    // DRAWN, so the honesty layer must NOT list the yoke as missing. A yoke on
    // a skirt (no bodice) the engine refused stays honest (yoke none).
    yokeDrawn: spec.yoke !== 'none',
    // boxpleat.cpp: a center inverted box pleat is now DRAWN behind the CF
    // panel, so the honesty layer must NOT list a center box pleat as missing.
    boxPleatDrawn: spec.boxPleat !== 'none',
  };
}
