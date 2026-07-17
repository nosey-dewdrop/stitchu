// Create flow: measurements (one per screen) -> garment spec -> WASM draft ->
// result. Photo -> AI analysis joins this flow when the Worker URL is live;
// until then the spec picker IS the flow (same manual path the iOS app had).
import { analyzePhoto, photoAvailable } from './analyze.js?v=78';
import { applyStatic, getLang, t } from './i18n.js?v=78';
import { draft, grade } from './engine.js?v=79';
import { printPattern, printGrade, printGradeNested } from './print.js?v=78';
import { renderResult } from './render.js?v=78';
import {
  MEASUREMENTS, loadMeasurements, saveMeasurements, saveToCloset,
  loadProfiles, saveProfile, deleteProfile,
} from './store.js?v=78';

const screen = document.getElementById('screen');
const saved = loadMeasurements();
// A standard EU38 body so a first-time visitor can SEE a real pattern before
// being asked to measure themselves, the "aha" comes before the 7-measurement
// ask, not after it. Replaced by the user's own numbers the moment they add them.
const DEMO_BODY = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40, armLength: 58, neck: 35 };
let usingDemo = !saved;
const values = { ...(saved || DEMO_BODY) };

const SPEC_GROUPS = [
  { key: 'garment', label: 'garment', trLabel: 'kıyafet', options: [['skirt', 'skirt', 'etek'], ['dress', 'dress', 'elbise'], ['top', 'top', 'üst']], for: () => true },
  { key: 'neckline', label: 'neckline', trLabel: 'yaka', options: [['crew', 'crew', 'bisiklet'], ['scoop', 'scoop', 'oval'], ['vNeck', 'v-neck', 'V yaka'], ['square', 'square', 'kare'], ['boat', 'boat', 'kayık'], ['sweetheart', 'sweetheart', 'kalp yaka'], ['halter', 'halter', 'halter (boyundan bağlı)'], ['cowl', 'cowl (draped)', 'kowl (dökümlü)'], ['pussyBow', 'pussy-bow', 'fiyonk yaka']], for: (s) => s.garment !== 'skirt' },
  { key: 'keyhole', label: 'front detail', trLabel: 'ön detay', options: [['none', 'plain', 'sade'], ['keyhole', 'keyhole cut-out', 'anahtar deliği']], for: (s) => s.garment !== 'skirt' && s.neckline !== 'halter' },
  // Loop 7/8: collar family, a separate collar piece, neck edge trued to the
  // neckline. Only for non-skirt, non-halter garments (a halter has no neckline
  // band to carry a collar).
  { key: 'collarType', label: 'collar', trLabel: 'yaka biçimi', options: [['none', 'none', 'yok'], ['stand', 'stand', 'dik'], ['mock', 'mock / mandarin', 'mandarin'], ['flat', 'flat', 'yatık'], ['peterPan', 'peter pan', 'bebe'], ['shirt', 'shirt', 'gömlek']], for: (s) => s.garment !== 'skirt' && s.neckline !== 'halter' },
  { key: 'collarEdge', label: 'collar edge', trLabel: 'yaka kenarı', options: [['round', 'round', 'yuvarlak'], ['pointed', 'pointed', 'sivri'], ['scallop', 'scalloped', 'fisto']], for: (s) => s.garment !== 'skirt' && s.neckline !== 'halter' && (s.collarType === 'flat' || s.collarType === 'peterPan') },
  // Patch 3.10: neckline + armhole edge finish. Bias binding is the DEFAULT
  // (thin trued 45° bias strip — the couture finish); facing is opt-in. Hidden
  // when a real collar is chosen (a collar always sits on a faced neck) or on a
  // halter (its own binding) or a skirt (no neckline).
  { key: 'edgeFinish', label: 'edge finish', trLabel: 'kenar bitişi', options: [['biasBinding', 'bias binding', 'biye'], ['facing', 'facing', 'pervaz']], for: (s) => s.garment !== 'skirt' && s.neckline !== 'halter' && (!s.collarType || s.collarType === 'none') },
  // A halter has no shoulders to hang a sleeve from, the pickers hide.
  { key: 'sleeveStyle', label: 'sleeves', trLabel: 'kol', options: [['none', 'sleeveless', 'kolsuz'], ['straight', 'straight', 'düz'], ['balloon', 'balloon', 'balon']], for: (s) => s.garment !== 'skirt' && s.neckline !== 'halter' },
  { key: 'sleeveLength', label: 'sleeve length', trLabel: 'kol boyu', options: [['short', 'short', 'kısa'], ['elbow', 'elbow', 'dirsek'], ['long', 'long', 'uzun']], for: (s) => s.garment !== 'skirt' && s.neckline !== 'halter' && s.sleeveStyle !== 'none' },
  // Loop 6: sleeve HEAD (cap) treatment. Puff = raised + gathered crown; gathered
  // = soft gather, no raise. Only shown when there IS a sleeve; balloon already
  // gathers the hem so the head stays plain there.
  { key: 'sleeveCap', label: 'sleeve head', trLabel: 'kol başı', options: [['plain', 'plain', 'düz'], ['gathered', 'gathered', 'büzgülü'], ['puffed', 'puff', 'puf'], ['cap', 'cap sleeve', 'cap (kısa kanat)']], for: (s) => s.garment !== 'skirt' && s.neckline !== 'halter' && s.sleeveStyle === 'straight' },
  // patch 3.13: sleeve-end cuff (manşet). A separate button (barrel) or ribbed
  // (knit) band at the wrist, the sleeve hem gathered in. Only a full-length
  // straight sleeve (long/elbow, not a cap wing) has a wrist to cuff.
  { key: 'cuffStyle', label: 'cuff', trLabel: 'manşet', options: [['none', 'none', 'yok'], ['button', 'button cuff', 'düğmeli (gömlek)'], ['ribbed', 'ribbed cuff', 'ribana (örme)']], for: (s) => s.garment !== 'skirt' && s.neckline !== 'halter' && s.sleeveStyle === 'straight' && (s.sleeveLength === 'long' || s.sleeveLength === 'elbow') && s.sleeveCap !== 'cap' },
  // Loop 8: drawstring / shirred / smocked gathering (büzgü), a separate gathered
  // panel (+ a drawstring cord) whose gathered edge is trued to the zone. Only on
  // a dress/top (needs a bodice to gather onto).
  { key: 'gatherType', label: 'gathering', trLabel: 'büzgü', options: [['none', 'none', 'yok'], ['drawstring', 'drawstring', 'ip büzgü'], ['shirred', 'shirred', 'lastik büzgü'], ['smocked', 'smocked', 'smok']], for: (s) => s.garment !== 'skirt' },
  { key: 'gatherZone', label: 'gather zone', trLabel: 'büzgü yeri', options: [['neckline', 'neckline', 'yaka'], ['bust', 'bust', 'büst'], ['waist', 'waist', 'bel'], ['sleeve', 'sleeve', 'kol']], for: (s) => s.garment !== 'skirt' && s.gatherType && s.gatherType !== 'none' },
  // Loop 9b: open-back cutout (açık sırt oyuğu), a shaped opening in the back
  // piece + a facing trued to the opening. Only on a dress/top (needs a back
  // bodice). Independent of a tie-back: a dress can have both.
  { key: 'backOpening', label: 'open back', trLabel: 'açık sırt', options: [['none', 'none', 'yok'], ['round', 'round cutout', 'yuvarlak oyuk'], ['lowV', 'low V', 'düşük V'], ['square', 'square', 'kare'], ['keyhole', 'keyhole', 'damla']], for: (s) => s.garment !== 'skirt' },
  { key: 'skirtStyle', label: 'skirt style', trLabel: 'etek stili', options: [['aLine', 'A-line', 'A kesim'], ['straight', 'straight', 'düz'], ['gathered', 'gathered', 'büzgülü'], ['halfCircle', 'half circle', 'yarım kloş'], ['pleated', 'pleated', 'pileli']], for: (s) => s.garment !== 'top' },
  { key: 'waistline', label: 'waistline', trLabel: 'bel hattı', options: [['natural', 'natural waist', 'normal bel'], ['empire', 'empire (under bust)', 'göğüs altı (babydoll)']], for: (s) => s.garment === 'dress' },
  { key: 'skirtLength', label: 'length', trLabel: 'boy', options: [['mini', 'mini', 'mini'], ['midi', 'midi', 'midi'], ['maxi', 'maxi', 'maksi']], for: (s) => s.garment !== 'top' },
  { key: 'ruffle', label: 'hem ruffle', trLabel: 'fırfır', options: [['none', 'none', 'yok'], ['single', 'hem ruffle', 'etek ucu fırfır'], ['tiered', 'tiered (3)', 'kademeli (3 kat)']], for: (s) => s.garment !== 'top' },
  // Loop M1: back hem slit / walking vent (arka etek yırtmacı). Only a fitted
  // straight/A-line skirt or dress hosts a center-back walking vent; gathered/
  // pleated/half-circle skirts walk freely and the engine skips it honestly.
  { key: 'backSlit', label: 'back slit', trLabel: 'arka yırtmaç', options: [['none', 'none', 'yok'], ['vent', 'walking vent', 'körük yırtmaç'], ['slit', 'plain slit', 'düz yırtmaç']], for: (s) => s.garment !== 'top' && (s.skirtStyle === 'straight' || s.skirtStyle === 'aLine') },
  // queue #3: ruffled shoulder straps (fırfırlı askı). A gathered self-fabric
  // frill strip drawn as a separate pair; only a sleeveless dress/top carries one
  // (a sleeved/halter garment frames the shoulder instead → engine skips honestly).
  { key: 'ruffledStraps', label: 'ruffled straps', trLabel: 'fırfırlı askı', options: [['none', 'none', 'yok'], ['ruffled', 'ruffled straps', 'fırfırlı askı']], for: (s) => s.sleeveStyle === 'none' && s.neckline !== 'halter' },
  // R1.1: peplum (bele takılan volan). A flared circular flounce hung from the
  // waist as a separate piece; only a waisted top/dress carries one (a
  // pleated/gathered/draped peplum stays honest → not offered here).
  { key: 'peplum', label: 'peplum', trLabel: 'peplum (bel volanı)', options: [['none', 'none', 'yok'], ['full', 'full circle', 'tam kloş'], ['half', 'half circle', 'yarım kloş'], ['pointed', 'pointed hem', 'sivri etek']], for: (s) => s.garment !== 'skirt' },
  // R1.2: asymmetric button placket (asimetrik düğme patı). The classic front
  // button stand shifted off center (the Jackie gingham). Only a dress/top hosts
  // one; a symmetric CF placket is still set by the front-closure read separately.
  { key: 'placketStyle', label: 'button placket', trLabel: 'düğme patı', options: [['none', 'none', 'yok'], ['standard', 'center front', 'ortadan'], ['asymmetric', 'asymmetric (off center)', 'asimetrik (yandan)']], for: (s) => s.garment !== 'skirt' && s.neckline !== 'halter' },
  // patch 3.12: pocket (cep). A patch pocket (a separate piece sewn onto the
  // outside + a placement mark) or a side-seam in-seam pocket (two bag pieces +
  // a mouth mark). Welt/besom/cargo/kangaroo stay honest → not offered here.
  { key: 'pocketStyle', label: 'pocket', trLabel: 'cep', options: [['none', 'none', 'yok'], ['patch', 'patch pocket', 'yama cep'], ['sideSeam', 'side-seam pocket', 'yan dikiş cebi']], for: () => true },
  // patch 3.15: hem shape (etek ucu şekli). Reshapes the fitted lower edge into a
  // shirt-tail (sides up, center long) or high-low (front short, back long). Only
  // a fitted straight/A-line skirt/dress or a top hosts it; a gathered/pleated/
  // circle skirt has no shaped side hem to lift (stays honest).
  { key: 'hemShape', label: 'hem shape', trLabel: 'etek ucu', options: [['straight', 'straight', 'düz'], ['shirttail', 'shirt-tail (curved)', 'gömlek eteği (kavisli)'], ['highLow', 'high-low', 'önü kısa arkası uzun']], for: (s) => s.garment === 'top' || ((s.garment === 'skirt' || s.garment === 'dress') && (s.skirtStyle === 'straight' || s.skirtStyle === 'aLine')) },
  { key: 'topLength', label: 'top length', trLabel: 'üst boyu', options: [['cropped', 'cropped', 'crop'], ['hip', 'hip', 'kalça'], ['tunic', 'tunic', 'tunik']], for: (s) => s.garment === 'top' },
  // Darts are the DEFAULT shaping (2026-07-17 minimal-piece policy): a plain
  // bodice stays ONE panel per side instead of splitting into a center + side
  // panel. Princess seams are the OPT-IN style — they double the bodice/skirt
  // piece count, so a clean pattern only spends them when the style asks for it.
  // Gathered and half-circle skirts have no waist shaping to convert.
  { key: 'shaping', label: 'shaping', trLabel: 'form', options: [['dart', 'darts', 'pens'], ['princess', 'princess seams', 'prenses dikiş']], for: (s) => s.garment !== 'skirt' || s.skirtStyle === 'aLine' || s.skirtStyle === 'straight' },
  { key: 'fabric', label: 'fabric', trLabel: 'kumaş', options: [['woven', 'woven (no stretch)', 'dokuma (esnemez)'], ['knit', 'knit / stretch', 'örgü / streç']], for: () => true },
];
const spec = {
  garment: 'dress', neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', shaping: 'dart',
  waistline: 'natural', fabric: 'woven', ruffle: 'none', keyhole: 'none', tieClosure: 'none',
  sleeveCap: 'plain', collarType: 'none', collarEdge: 'round',
  gatherType: 'none', gatherZone: 'neckline', backOpening: 'none', backSlit: 'none',
  ruffledStraps: 'none', peplum: 'none', placketStyle: 'none', edgeFinish: 'biasBinding', pocketStyle: 'none', cuffStyle: 'none', hemShape: 'straight',
};

// Preset from a style-library page: a link like create.html?garment=dress&
// neckline=sweetheart carries that page's exact style into the flow, so a
// visitor lands on the garment they were reading about, ready to print. Bridge
// layer only, no engine touched. We whitelist the keys the spec actually holds
// and coerce a couple of non-picker flags (frontPlacket bool) so a crafted URL
// can never inject an unknown field.
(function applyPreset() {
  const q = new URLSearchParams(location.search);
  if (![...q.keys()].length) return;
  const pickerVals = Object.fromEntries(
    SPEC_GROUPS.map((g) => [g.key, new Set(g.options.map((o) => o[0]))]),
  );
  for (const [k, raw] of q) {
    if (!(k in spec)) continue;
    const v = raw.trim();
    if (k === 'frontPlacket') { spec.frontPlacket = v === 'true' || v === '1' || v === 'on'; continue; }
    if (k === 'tieClosure') {
      if (['none', 'backWaistBow', 'tieBack', 'frontNeckBow', 'cuffTies'].includes(v)) spec.tieClosure = v;
      continue;
    }
    // Everything else must be a real option value for a real picker.
    if (pickerVals[k] && pickerVals[k].has(v)) spec[k] = v;
  }
})();

// Map the vision's yoke / straps / closure / oov terms to a drawable gathering
// (Loop 8). The engine draws a SEPARATE gathered panel (+ a drawstring cord)
// whose gathered edge is trued to the drafted zone edge, for a drawstring/tie
// gathered neckline, a shirred/smocked yoke, a gathered bust panel, or gathered
// straps read as a gathered neck. Returns { type, zone } or null (stays honest).
function pickGather(seen) {
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
function pickTiePlacement(seen) {
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
function pickCollar(seen) {
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
function pickBackOpening(seen) {
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
function pickHemSlit(seen) {
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
function pickRuffledStraps(seen) {
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
function pickPeplum(seen) {
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
function pickPocket(seen) {
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
function pickCuff(seen) {
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
function pickHemShape(seen) {
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
function pickPlacket(seen, frontButtons) {
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

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function sewingLoader(text) {
  const wrap = el('div', 'sewing-loader');
  wrap.appendChild(el('span', 'seam-track'));
  wrap.appendChild(el('span', 'loader-text', text));
  return wrap;
}

function progressSeam(done, total) {
  const wrap = el('div', 'stepline');
  wrap.appendChild(el('span', 'hint', `${done} / ${total}`));
  const track = el('span', 'seam-progress');
  const sewn = el('span', 'sewn');
  sewn.style.width = `${Math.round((done / total) * 100)}%`;
  track.appendChild(sewn);
  wrap.appendChild(track);
  return wrap;
}

// Measuring tape with the current value under the stitch marker (brand rule:
// sewing objects, never human figures).
function tapeSVG(value, min, max) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'tape');
  svg.setAttribute('viewBox', '0 0 340 110');
  const lo = Math.max(min, Math.min(Math.floor(value) - 3, max - 8));
  let inner = '<rect x="10" y="30" width="304" height="46" fill="none" stroke="#111" stroke-width="1.8"/>' +
              '<rect x="314" y="26" width="10" height="54" fill="none" stroke="#111" stroke-width="1.8"/>';
  for (let i = 0; i <= 8; i++) {
    const x = 26 + i * 36;
    const cm = lo + i;
    if (cm > max) break;
    const tall = cm % 2 === 0;
    inner += `<line x1="${x}" y1="30" x2="${x}" y2="${tall ? 56 : 48}" stroke="#111" stroke-width="1.4"/>`;
    if (tall && x <= 296) inner += `<text x="${x}" y="70" font-family="Helvetica" font-size="12" fill="#8a8a8a" text-anchor="middle">${cm}</text>`;
  }
  const mx = 26 + (value - lo) * 36;
  if (mx >= 10 && mx <= 324) {
    inner += `<line x1="${mx}" y1="12" x2="${mx}" y2="94" stroke="#8f2038" stroke-width="3" stroke-dasharray="9 6" stroke-linecap="round"/>`;
  }
  svg.innerHTML = inner;
  return svg;
}

// Where on the body each measurement is taken, drawn on a dress FORM (a sewing
// object, never a human figure, per the brand rule). The vişne line/arrow shows
// the tape placement for the current measurement so a non-drafter doesn't guess.
function measureDiagram(key) {
  // Shared dress-form silhouette (front): neck, shoulders, bust, waist, hip.
  const form = '<path d="M60 26 Q70 22 80 26 M62 30 Q70 46 70 58 Q70 70 58 82 ' +
    'M78 30 Q70 46 70 58 Q70 70 82 82 M45 44 Q58 34 62 30 M95 44 Q82 34 78 30 ' +
    'M45 44 Q40 64 52 84 M95 44 Q100 64 88 84 M52 84 Q50 104 56 120 M88 84 Q90 104 84 120 ' +
    'M56 120 Q70 128 84 120 M52 84 Q70 92 88 84" fill="none" stroke="#c7a6ac" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';
  const V = '#8f2038';
  const lines = {
    bust:      `<line x1="46" y1="60" x2="94" y2="60" stroke="${V}" stroke-width="2.4" stroke-dasharray="5 3"/><ellipse cx="70" cy="60" rx="26" ry="8" fill="none" stroke="${V}" stroke-width="1.2" opacity=".5"/>`,
    waist:     `<line x1="52" y1="86" x2="88" y2="86" stroke="${V}" stroke-width="2.4" stroke-dasharray="5 3"/><ellipse cx="70" cy="86" rx="19" ry="6" fill="none" stroke="${V}" stroke-width="1.2" opacity=".5"/>`,
    hip:       `<line x1="55" y1="118" x2="85" y2="118" stroke="${V}" stroke-width="2.4" stroke-dasharray="5 3"/><ellipse cx="70" cy="118" rx="17" ry="6" fill="none" stroke="${V}" stroke-width="1.2" opacity=".5"/>`,
    shoulder:  `<line x1="47" y1="43" x2="93" y2="43" stroke="${V}" stroke-width="2.4"/><circle cx="47" cy="43" r="2.4" fill="${V}"/><circle cx="93" cy="43" r="2.4" fill="${V}"/>`,
    neck:      `<ellipse cx="70" cy="27" rx="11" ry="5" fill="none" stroke="${V}" stroke-width="2.2" stroke-dasharray="4 3"/>`,
    backLength:`<line x1="70" y1="30" x2="70" y2="86" stroke="${V}" stroke-width="2.4"/><circle cx="70" cy="30" r="2.4" fill="${V}"/><path d="M66 84 L70 88 L74 84" fill="none" stroke="${V}" stroke-width="2"/>`,
    armLength: `<line x1="45" y1="44" x2="34" y2="96" stroke="${V}" stroke-width="2.4"/><circle cx="45" cy="44" r="2.4" fill="${V}"/><circle cx="34" cy="96" r="2.4" fill="${V}"/>`,
    upperBust: `<line x1="48" y1="50" x2="92" y2="50" stroke="${V}" stroke-width="2.4" stroke-dasharray="5 3"/><text x="70" y="46" font-size="6" fill="${V}" text-anchor="middle" font-family="Helvetica">above the bust</text>`,
  };
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'measure-diagram');
  svg.setAttribute('viewBox', '20 12 100 120');
  svg.innerHTML = form + (lines[key] || '');
  return svg;
}

function showMeasurement(index) {
  screen.className = 'wrap';
  const m = MEASUREMENTS[index];
  const tr = getLang() === 'tr';
  const mLabel = tr ? m.trLabel : m.label;
  screen.textContent = '';
  screen.appendChild(el('h1', 'screen-title', t('create.measure.title')));
  screen.appendChild(el('p', 'screen-sub', t('create.measure.sub')));
  screen.appendChild(progressSeam(index + 1, MEASUREMENTS.length));

  const block = el('div', 'measure-block');
  const lblRow = el('div', 'measure-label', mLabel);
  if (m.optional) {
    const opt = el('span', 'measure-optional', ' · ' + t('create.optional'));
    lblRow.appendChild(opt);
  }
  block.appendChild(lblRow);
  block.appendChild(el('div', 'measure-help', tr ? m.trHelp : m.help));
  block.appendChild(measureDiagram(m.key));

  const initial = values[m.key] ?? '';
  let tape = tapeSVG(Number(initial) || m.min, m.min, m.max);
  block.appendChild(tape);

  const row = el('div', 'measure-row');
  const input = document.createElement('input');
  input.inputMode = 'decimal';
  input.value = initial;
  input.setAttribute('aria-label', `${mLabel} (cm)`);
  row.appendChild(input);
  row.appendChild(el('span', 'unit', 'cm'));
  block.appendChild(row);
  const error = el('div', 'field-error', '');
  block.appendChild(error);
  block.appendChild(el('p', 'privacy-note', t('create.measure.privacy')));

  input.addEventListener('input', () => {
    const v = parseFloat(input.value.replace(',', '.'));
    if (!Number.isNaN(v)) {
      const fresh = tapeSVG(v, m.min, m.max);
      tape.replaceWith(fresh);
      tape = fresh;
    }
  });

  const nav = el('div', 'step-nav');
  if (index > 0) {
    const back = el('button', 'btn', t('create.back'));
    back.addEventListener('click', () => showMeasurement(index - 1));
    nav.appendChild(back);
  }
  const isLast = index === MEASUREMENTS.length - 1;
  const nextLabel = isLast ? t('create.done')
    : (m.optional ? t('create.skip') : t('create.next', { label: (tr ? MEASUREMENTS[index + 1].trLabel : MEASUREMENTS[index + 1].label).toLowerCase() }));
  const next = el('button', 'btn primary', nextLabel);
  const advance = () => {
    if (isLast) {
      saveMeasurements(values);
      usingDemo = false; // the pattern is now drafted to the real person
      showSpec();
    } else {
      showMeasurement(index + 1);
    }
  };
  next.addEventListener('click', () => {
    const raw = input.value.trim();
    // Optional field left blank: skip it (drop any old value) and move on.
    if (m.optional && raw === '') { delete values[m.key]; advance(); return; }
    const v = parseFloat(raw.replace(',', '.'));
    if (Number.isNaN(v)) { error.textContent = t('create.measure.numerror'); return; }
    if (v < m.min || v > m.max) {
      error.textContent = t('create.measure.rangeerror', { label: mLabel.toLowerCase(), min: m.min, max: m.max });
      return;
    }
    values[m.key] = v;
    advance();
  });
  nav.appendChild(next);
  block.appendChild(nav);
  screen.appendChild(block);
  input.focus();
}

function showSpec() {
  screen.textContent = '';
  screen.className = 'wrap spec-screen';
  screen.appendChild(el('h1', 'screen-title', t('create.spec.title')));
  const sub = el('p', 'screen-sub', usingDemo ? t('create.spec.subdemo') : t('create.spec.sub'));
  const edit = el('a', '', usingDemo ? t('create.spec.addmeasure') : t('create.spec.edit'));
  edit.href = '#';
  edit.style.color = 'inherit';
  edit.addEventListener('click', (e) => { e.preventDefault(); showMeasurement(0); });
  sub.appendChild(edit);
  screen.appendChild(sub);

  // Named bodies: for anyone drafting for OTHERS (a seller, a friend), keep
  // several measurement sets instead of overwriting one. Hidden until there's a
  // reason to show it (a saved profile exists, or the user has real measurements
  // worth naming), so a first-timer isn't cluttered.
  const profiles = loadProfiles();
  if (!usingDemo || profiles.length) {
    const pbar = el('div', 'profile-bar');
    if (profiles.length) {
      const sel = document.createElement('select');
      sel.className = 'profile-select';
      const optCur = el('option', '', t('create.profile.current'));
      optCur.value = '';
      sel.appendChild(optCur);
      for (const p of profiles) {
        const o = el('option', '', p.name);
        o.value = p.name;
        sel.appendChild(o);
      }
      sel.addEventListener('change', () => {
        const p = profiles.find((x) => x.name === sel.value);
        if (p) { Object.assign(values, p.m); usingDemo = false; saveMeasurements(values); showSpec(); }
      });
      pbar.appendChild(sel);
    }
    // Save the current body under a name (for a client / a friend).
    const nameInput = document.createElement('input');
    nameInput.className = 'profile-name';
    nameInput.placeholder = t('create.profile.nameph');
    const saveBtn = el('button', 'profile-save', t('create.profile.save'));
    saveBtn.addEventListener('click', () => {
      const nm = nameInput.value.trim();
      if (!nm) { nameInput.focus(); return; }
      saveProfile(nm, values);
      showSpec();
    });
    pbar.appendChild(nameInput);
    pbar.appendChild(saveBtn);
    screen.appendChild(pbar);
  }

  // Photo path: upload -> AI reads the garment -> picks below get prefilled,
  // user confirms or fixes. Hidden entirely until the Worker is live.
  if (photoAvailable()) {
    const photoBlock = el('div', 'spec-group');
    photoBlock.style.marginTop = '30px';
    photoBlock.appendChild(el('div', 'group-label', t('create.spec.photo')));
    const row = el('div', 'choice-row');
    const pick = el('button', 'choice', t('create.spec.photobtn'));
    const status = el('div', 'field-error', '');
    status.style.color = 'var(--gray)';
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.style.display = 'none';
    pick.addEventListener('click', () => file.click());
    file.addEventListener('change', async () => {
      if (!file.files[0]) return;
      pick.disabled = true;
      status.textContent = '';
      const loader = sewingLoader(t('create.spec.reading'));
      status.appendChild(loader);
      try {
        const seen = await analyzePhoto(file.files[0]);
        spec.garment = seen.garment;
        if (seen.neckline) spec.neckline = seen.neckline;
        if (seen.sleeveStyle) spec.sleeveStyle = seen.sleeveStyle;
        if (seen.sleeveLength) spec.sleeveLength = seen.sleeveLength;
        if (seen.skirtStyle) spec.skirtStyle = seen.skirtStyle;
        if (seen.length) spec.skirtLength = seen.length;
        if (seen.topLength) spec.topLength = seen.topLength;
        if (seen.shaping === 'princess' || seen.shaping === 'dart') spec.shaping = seen.shaping;
        if (seen.waistline === 'natural' || seen.waistline === 'empire') spec.waistline = seen.waistline;
        if (seen.fabric === 'woven' || seen.fabric === 'knit') spec.fabric = seen.fabric;
        if (['none', 'single', 'tiered'].includes(seen.hemRuffle)) spec.ruffle = seen.hemRuffle;
        if (typeof seen.keyhole === 'boolean') spec.keyhole = seen.keyhole ? 'keyhole' : 'none';
        // Front button placket (düğme patı): the engine now draws the grown-on
        // button stand + buttons/buttonholes when the vision reads a front
        // button/placket closure (Loop 3), and R1.2 draws an ASYMMETRIC (off
        // center) stand too. A back/side closure is not a front placket, so it
        // stays in the honesty layer.
        let frontButtons = false;
        if (seen.closure && (seen.closure.type === 'buttons' || seen.closure.type === 'placket')) {
          const loc = (seen.closure.location || '').toLowerCase();
          if (!loc || loc.includes('front') || loc.includes('center') || loc.includes('ön')) {
            frontButtons = true;
          }
        }
        // R1.2: pick the placket VARIANT. An asymmetric offset front is drawn even
        // when the closure location was ambiguous (the oov/details name it). A
        // symmetric front stand is Standard. Otherwise no placket.
        const placket = pickPlacket(seen, frontButtons);
        spec.placketStyle = placket || 'none';
        // Keep the legacy bool in sync so the honesty layer + any bool consumer
        // still fire for a symmetric front (asymmetric drives placketStyle only).
        spec.frontPlacket = placket === 'standard';
        // Gathered / puff / CAP sleeve HEAD (Loop 6 + R1.2): the engine now RAISES
        // + widens the cap and adds a crown gather for a gathered/puffed head, and
        // R1.2 draws the short CAP-sleeve WING. `puffed` = raised puff, `gathered`
        // = soft gather, `capped` = a short cap wing. A drawstring-gathered sleeve
        // (needs an arm casing) stays honest.
        if (seen.sleeveHead === 'puffed') spec.sleeveCap = 'puffed';
        else if (seen.sleeveHead === 'gathered') spec.sleeveCap = 'gathered';
        else if (seen.sleeveHead === 'capped') spec.sleeveCap = 'cap';
        // A gathered/puff/cap head needs an actual sleeve to sit on; if the vision
        // read a head but no sleeve style, give it a straight sleeve to carry it.
        if (spec.sleeveCap && spec.sleeveCap !== 'plain' && (!spec.sleeveStyle || spec.sleeveStyle === 'none')) {
          spec.sleeveStyle = 'straight';
        }
        // Fabric ties / sash / bow (bağ / kuşak / fiyonk, Loop 4b): the engine
        // now draws SIMPLE APPLIED ties as separate self-fabric strips + a
        // placement notch. A drawstring that GATHERS the fabric (needs a casing +
        // shirring) is NOT this, that stays honest. Map the vision closure/back
        // detail to a tie placement; leave it for the honesty layer otherwise.
        spec.tieClosure = pickTiePlacement(seen);
        // Collar family (yaka, Loop 7/8): the engine now draws a SEPARATE collar
        // piece (stand/mock/flat/peter-pan/shirt), neck edge trued to the
        // neckline. A bias-bound / notched / sailor finish is NOT drafted and
        // stays honest (pickCollar returns null).
        const collar = pickCollar(seen);
        if (collar) { spec.collarType = collar.type; spec.collarEdge = collar.edge; }
        else { spec.collarType = 'none'; spec.collarEdge = 'round'; }
        // Edge finish (patch 3.10): bias binding is the default on every dress
        // (Damla's call). A real collar keeps a faced neck inside the engine
        // regardless; a collarless neck + sleeveless armholes finish with a thin
        // trued bias strip. The vision doesn't override this — it's a finish
        // choice, not a garment read.
        spec.edgeFinish = 'biasBinding';
        // Drawstring / shirred / smocked gathering (büzgü, Loop 8): the engine now
        // draws a SEPARATE gathered panel (+ a drawstring cord) whose gathered
        // edge is trued to the drafted zone edge. Map the vision yoke / drawstring
        // neckline / gathered bust to a gathering; leave it honest otherwise.
        const gather = pickGather(seen);
        if (gather) { spec.gatherType = gather.type; spec.gatherZone = gather.zone; }
        else { spec.gatherType = 'none'; spec.gatherZone = 'neckline'; }
        // Open-back cutout (açık sırt oyuğu, Loop 9b): the engine now opens a
        // shaped cutout in the BACK piece + a facing trued to the opening. This is
        // INDEPENDENT of a tie-back (Loop 4b), a Tie Back Mini Dress gets both.
        const backOpen = pickBackOpening(seen);
        spec.backOpening = backOpen || 'none';
        // Back hem slit / walking vent (arka etek yırtmacı, Loop M1): the engine
        // cuts the back with a center-back seam and opens a walking slit from the
        // hem. Only a fitted straight/A-line skirt hosts one; a gathered/pleated
        // skirt walks freely (engine skips honestly). Gate on the skirt style so a
        // "slit" read on a gathered skirt stays in the honesty channel.
        const slit = pickHemSlit(seen);
        const slitHostable = spec.garment !== 'top' &&
          (spec.skirtStyle === 'straight' || spec.skirtStyle === 'aLine');
        spec.backSlit = (slit && slitHostable) ? slit : 'none';
        // Ruffled shoulder straps (fırfırlı askı, queue #3): the engine now draws a
        // gathered self-fabric frill strip as a separate strap pair + a placement
        // notch. Only a sleeveless dress/top carries one; a sleeved/halter garment
        // frames the shoulder instead (engine skips honestly). A plain/spaghetti/
        // one-shoulder strap stays in the honesty layer (pickRuffledStraps null).
        const straps = pickRuffledStraps(seen);
        const strapsHostable = (spec.sleeveStyle === 'none' || !spec.sleeveStyle) &&
          spec.neckline !== 'halter';
        spec.ruffledStraps = (straps && strapsHostable) ? straps : 'none';
        // Peplum (bele takılan volan, R1.1): the engine now hangs a flared
        // circular flounce from the waist as a separate piece, inner arc trued to
        // the finished waist. Only a waisted top/dress hosts one; a pleated/
        // gathered/draped peplum stays honest (pickPeplum null). A skirt has no
        // waisted bodice → gate it out.
        const peplum = pickPeplum(seen);
        spec.peplum = (peplum && spec.garment !== 'skirt') ? peplum : 'none';
        // Pocket (cep, patch 3.12): the engine now draws a patch pocket (a
        // separate piece + a placement mark) and a side-seam in-seam pocket (two
        // bag pieces + a mouth mark). A welt/besom/cargo/kangaroo pocket stays
        // honest (pickPocket null). The block itself skips honestly when the host
        // has no panel / no side seam (e.g. a cropped top for a side-seam bag).
        const pocket = pickPocket(seen);
        spec.pocketStyle = pocket || 'none';
        // Cuff (manşet, patch 3.13): the engine now draws a button or ribbed band
        // at the wrist end of a full-length sleeve, the sleeve hem gathered in.
        // Only a real full-length sleeve (Straight, long/elbow) hosts one — a
        // sleeveless / cap / short sleeve has no wrist, so gate it out (the engine
        // also skips honestly). A French / elastic cuff stays honest (pickCuff null).
        const cuff = pickCuff(seen);
        const cuffHostable = spec.sleeveStyle === 'straight' &&
          (spec.sleeveLength === 'long' || spec.sleeveLength === 'elbow') &&
          spec.sleeveCap !== 'cap';
        spec.cuffStyle = (cuff && cuffHostable) ? cuff : 'none';
        // Hem shape (etek ucu şekli, patch 3.15): the engine now reshapes the
        // fitted lower edge into a shirt-tail (sides up) or a high-low (front short,
        // back long). Only a fitted straight/A-line skirt/dress or a top hosts one;
        // a gathered/pleated/circle skirt has no shaped side hem to lift, and an
        // asymmetric/handkerchief hem stays honest (pickHemShape null).
        const hemShape = pickHemShape(seen);
        const hemHostable = spec.garment === 'top' ||
          ((spec.garment === 'skirt' || spec.garment === 'dress') &&
           (spec.skirtStyle === 'straight' || spec.skirtStyle === 'aLine'));
        spec.hemShape = (hemShape && hemHostable) ? hemShape : 'straight';
        if (typeof seen.fabricName === 'string' && seen.fabricName !== 'other') spec.photoFabric = seen.fabricName;
        // Structural fields the vision now reads but the engine cannot draw yet
        // (Loop 1 pipe: carried on the spec so later loops can consume them and
        // the honesty layer can tell the user what the pattern is missing).
        spec.seen = {
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
        };
        status.textContent = (seen.details ? seen.details + ', ' : '') + t('create.spec.checkpicks');
        rebuild();
      } catch (err) {
        status.textContent = err.message;
      }
      pick.disabled = false;
    });
    row.appendChild(pick);
    photoBlock.appendChild(row);
    photoBlock.appendChild(file);
    photoBlock.appendChild(status);
    screen.appendChild(photoBlock);
  }

  const groups = el('div', 'spec-groups');
  groups.style.marginTop = '34px';

  function rebuild() {
    groups.textContent = '';
    for (const group of SPEC_GROUPS) {
      if (!group.for(spec)) continue;
      const g = el('div', 'spec-group');
      g.appendChild(el('div', 'group-label', getLang() === 'tr' ? group.trLabel : group.label));
      const row = el('div', 'choice-row');
      for (const [value, label, trOption] of group.options) {
        const b = el('button', 'choice', getLang() === 'tr' ? trOption : label);
        b.setAttribute('aria-pressed', String(spec[group.key] === value));
        b.addEventListener('click', () => { spec[group.key] = value; rebuild(); });
        row.appendChild(b);
      }
      g.appendChild(row);
      groups.appendChild(g);
    }
  }
  rebuild();
  screen.appendChild(groups);

  const nav = el('div', 'step-nav');
  const go = el('button', 'btn primary', t('create.draft'));
  const drafting = el('div', '');
  go.addEventListener('click', async () => {
    go.disabled = true;
    go.textContent = t('create.drafting');
    drafting.appendChild(sewingLoader(t('create.drafting')));
    try {
      const result = await draft(spec, values);
      showResult(result);
    } catch (err) {
      go.disabled = false;
      go.textContent = t('create.draft');
      drafting.textContent = '';
      alert(t('create.engineerror'));
      console.error(err);
    }
  });
  nav.appendChild(go);
  screen.appendChild(nav);
  screen.appendChild(drafting);
}

function showResult(result) {
  screen.textContent = '';
  screen.className = 'wrap';
  const head = el('div', 'result-head');
  head.appendChild(el('h1', 'screen-title', t('create.result.title', { garment: result.pattern.garment.charAt(0).toUpperCase() + result.pattern.garment.slice(1) })));
  screen.appendChild(head);

  // Demo-body users: lead with the personalize CTA, they've now SEEN a real
  // pattern, so the ask to measure themselves has earned its place.
  if (usingDemo) {
    const fitBanner = el('div', 'fit-banner');
    fitBanner.appendChild(el('span', 'fit-banner-text', t('create.demo.banner')));
    const fitBtn = el('button', 'btn primary', t('create.demo.cta'));
    fitBtn.addEventListener('click', () => showMeasurement(0));
    fitBanner.appendChild(fitBtn);
    screen.appendChild(fitBanner);
  }

  const body = el('div');
  screen.appendChild(body);
  result.photoFabric = spec.photoFabric || null;
  result.demoBody = usingDemo;
  // Carry what the vision saw so the honesty layer (render + print) can tell
  // the user exactly which seen elements the pattern could not draw. sleeveStyle
  // rides along so the layer knows a seen puff WAS drawn (user picked balloon).
  result.seen = spec.seen ? { ...spec.seen, sleeveStyle: spec.sleeveStyle } : null;
  // The sewing companion (render.js -> sewing.js) reads the garment + silhouette
  // to pick the fabric reasoning; carry a shallow copy of the chosen spec.
  result.spec = { ...spec };
  renderResult(body, result);

  const nav = el('div', 'step-nav');
  const again = el('button', 'btn', t('create.changegarment'));
  again.addEventListener('click', showSpec);
  nav.appendChild(again);
  if (!result.issues.length) {
    const save = el('button', 'btn', t('create.save'));
    save.addEventListener('click', () => {
      saveToCloset({ spec: { ...spec }, result });
      window.location.href = 'closet.html';
    });
    nav.appendChild(save);
    const print = el('button', 'btn primary', t('create.print'));
    print.addEventListener('click', () => printPattern(result));
    nav.appendChild(print);
  }
  screen.appendChild(nav);

  // Grade: sellers turn one design into a full EU size run from the same engine.
  // Only offered for a valid draft (a blocked draft has nothing to grade).
  if (!result.issues.length) {
    screen.appendChild(gradePanel(result));
  }
}

const EU_SIZES = ['EU34', 'EU36', 'EU38', 'EU40', 'EU42', 'EU44', 'EU46', 'EU48', 'EU50', 'EU52'];

// A seller-facing panel under the result: pick a size range, generate the run,
// print all sizes as one document. Honest states, errors say so, no fake run.
function gradePanel(result) {
  const panel = el('div', 'grade-panel');
  panel.appendChild(el('h2', 'grade-title', t('create.grade.title')));
  panel.appendChild(el('p', 'grade-sub', t('create.grade.sub')));

  const row = el('div', 'grade-row');
  const fromSel = el('select', 'grade-select');
  const toSel = el('select', 'grade-select');
  for (const s of EU_SIZES) {
    fromSel.appendChild(new Option(s, s));
    toSel.appendChild(new Option(s, s));
  }
  fromSel.value = 'EU36';
  toSel.value = 'EU44';
  const fromLabel = el('label', 'grade-label', t('create.grade.from'));
  fromLabel.appendChild(fromSel);
  const toLabel = el('label', 'grade-label', t('create.grade.to'));
  toLabel.appendChild(toSel);
  row.appendChild(fromLabel);
  row.appendChild(toLabel);
  panel.appendChild(row);

  // Output layout: nested (all sizes on one set of sheets, one colour each,
  // the industry-standard multi-size PDF) or per-size (each size its own
  // cover + sheets). Nested is the default: it's the seller's real deliverable.
  const layoutRow = el('div', 'grade-row grade-layout');
  const nestWrap = el('label', 'grade-radio');
  const nestRadio = document.createElement('input');
  nestRadio.type = 'radio'; nestRadio.name = 'gradeLayout'; nestRadio.value = 'nested'; nestRadio.checked = true;
  nestWrap.appendChild(nestRadio);
  nestWrap.appendChild(el('span', '', t('create.grade.layout.nested')));
  const perWrap = el('label', 'grade-radio');
  const perRadio = document.createElement('input');
  perRadio.type = 'radio'; perRadio.name = 'gradeLayout'; perRadio.value = 'per';
  perWrap.appendChild(perRadio);
  perWrap.appendChild(el('span', '', t('create.grade.layout.per')));
  layoutRow.appendChild(nestWrap);
  layoutRow.appendChild(perWrap);
  panel.appendChild(layoutRow);

  const go = el('button', 'btn primary', t('create.grade.go'));
  const msg = el('p', 'grade-msg');
  go.addEventListener('click', async () => {
    let from = fromSel.value;
    let to = toSel.value;
    // Keep the range ordered so a seller can't ask for EU44..EU36.
    if (EU_SIZES.indexOf(from) > EU_SIZES.indexOf(to)) [from, to] = [to, from];
    go.disabled = true;
    msg.style.color = '';
    msg.textContent = t('create.grade.working');
    try {
      const graded = await grade(spec, from, to);
      const sizes = (graded.sizes || []).filter((s) => !s.draft.issues.length);
      if (!sizes.length) {
        msg.style.color = '#8f2038';
        msg.textContent = t('create.grade.none');
        go.disabled = false;
        return;
      }
      const dropped = (graded.sizes || []).length - sizes.length;
      msg.textContent = dropped
        ? t('create.grade.done.some', { n: sizes.length, dropped })
        : t('create.grade.done', { n: sizes.length });
      if (nestRadio.checked) printGradeNested(sizes, result.pattern.garment);
      else printGrade(sizes, result.pattern.garment);
    } catch (err) {
      msg.style.color = '#8f2038';
      msg.textContent = t('create.grade.error');
      console.error(err);
    }
    go.disabled = false;
  });
  panel.appendChild(go);
  panel.appendChild(msg);
  return panel;
}

applyStatic();
// Language toggle is owned by the canonical header (js/shared-header.js);
// mounting it here too would double the EN/TR control.

// Entry: EVERYONE lands on the garment picker so they see a real pattern first
// (drafted to a standard body for newcomers). The 7-measurement ask comes after
// the aha, offered on the result as "make it fit you".
showSpec();
