// vision-bridge.js — the SINGLE mapping from what the vision layer SAW to what
// the engine can DRAW. Extracted from create.js (2026-07-18) so the product
// bridge and the benchmark counter (engine/tools/benchmark-58.mjs) score with
// the SAME logic — a copy that drifts is how 'puff' once counted as FULL.
// Pure functions of the vision `seen` object; no DOM, no engine.

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
  // Collar family.
  let type = null;
  if (words.includes('peter pan') || words.includes('peter-pan') || words.includes('bebe'))
    type = 'peterPan';
  else if (words.includes('mock') || words.includes('mandarin')) type = 'mock';
  else if (words.includes('stand')) type = 'stand';
  else if (words.includes('shirt') || words.includes('gömlek')) type = 'shirt';
  else if (words.includes('scallop')) type = 'peterPan';   // scallop = a flat collar edge
  else if (words.includes('rounded') || words.includes('round')) type = 'peterPan';
  else if (words.includes('flat') || words.includes('collar')) type = 'flat';
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

// Map the vision's oov / details to a pocket (patch 3.12). The engine draws a
// PATCH pocket (a separate piece sewn onto the outside + a placement mark) and a
// SIDE-SEAM in-seam pocket (two bag pieces + a mouth mark). A welt / besom /
// bound / cargo / flap / kangaroo pocket is a DIFFERENT construction that stays
// honest. Returns 'patch' | 'sideSeam' or null.
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
  // A side-seam / in-seam / hidden / slash pocket rides the side seam.
  if (/side[\s-]?seam|in[\s-]?seam|inseam|hidden|slash|seam pocket/.test(words)) return 'sideSeam';
  // A patch pocket is a piece applied to the surface (the most common read).
  if (/patch|hip pocket|chest pocket|applied pocket/.test(words)) return 'patch';
  // A bare "pocket" with no welt/side cue reads as the common patch pocket.
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

// Map the vision's oov / details to a hem SHAPE (patch 3.15). The engine reshapes
// the fitted lower edge into a shirt-tail (sides up, center long) or a high-low
// (front short, back long). An asymmetric-diagonal / handkerchief / mullet hem on
// a gathered skirt is a different construction that stays honest. Returns
// 'shirttail' | 'highLow' or null. Gated off a fitted straight/A-line skirt/dress
// or a top by the caller.
export function pickHemShape(seen) {
  const words = [
    Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '',
    seen.details || '',
  ].filter(Boolean).join(' ').toLowerCase();
  if (!/hem|hemline|lower edge/.test(words) &&
      !/high[\s-]?low|mullet|shirt[\s-]?tail|shirttail/.test(words)) return null;
  // A handkerchief / pointed / asymmetric-diagonal hem is NOT the soft symmetric
  // shirttail / front-short-back-long high-low the engine draws — leave it honest.
  if (/handkerchief|pointed|asymmetric|diagonal|angled/.test(words)) return null;
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

