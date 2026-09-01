// Create flow: measurements (one per screen) -> garment spec -> WASM draft ->
// result. Photo -> AI analysis joins this flow when the Worker URL is live;
// until then the spec picker IS the flow (same manual path the iOS app had).
import { analyzePhoto, analyzeBankedPhoto, photoAvailable } from './analyze.js?v=141';
import { validateVision } from './spec-validate.js?v=141';
import { CONTRACT } from './contract.gen.js?v=141';
import { applyStatic, getLang, t } from './i18n.js?v=141';
import { draft, grade, operatorProgram } from './engine.js?v=141';
import { printPattern, printGrade, printGradeNested } from './print.js?v=141';
import { renderResult } from './render.js?v=141';
import {
  MEASUREMENTS, loadMeasurements, saveMeasurements, saveToCloset,
  loadProfiles, saveProfile, deleteProfile,
} from './store.js?v=141';
import { pickGather, pickTiePlacement, pickCollar, pickBackOpening, pickLaceUpBack, pickWrapFront, pickHemSlit, pickRuffledStraps, pickPeplum, pickHemFlounce, pickPocket, pickCuff, pickHemShape, pickPlacket, pickBackDetail, pickExposedZip, pickBardot, pickCupSeam, pickYoke, pickBoxPleat, refreshSkirtLengthMM, applyMeasuredRatios, pickSkirtFullness, buildSeenRecord, applyRatioAxes, uncertainRatioNames } from './vision-bridge.js?v=141';
import { measureGarment } from './measure.js?v=141';
// F-İNDİR: the take-it-home path. Measured 26 Aug — this file had ZERO lines
// matching `download` or `dxf`, so a shopper could see a pattern and carry
// nothing out of the browser. The writers are shared with studio.html, one
// module for the whole site; see the header of download.js.
import { safeName, saveSVG, saveDXF, saveA4Pdf, saveA0Pdf, saveFlatSVG } from './download.js?v=141';
// F0: KÖKEN. Every axis below carries where its value came from, and the two
// files the user takes home carry the derived list by name. See provenance.js.
import { yeniKoken, isaretle, ilanEdilecek, kokenCumlesi } from './provenance.js?v=141';
// F1: PROMPT GİRİŞİ. Serbest metin ("puf kollu mini elbise") deterministik
// parser'la aynı spec eksenlerine iner — LLM yok, ağ yok. Anlaşılmayan kelime
// ADIYLA ekrana düşer (sessiz düşme 0), en yakın Edge/Panel/Stitch primitifine
// işaret eder. Öncelik kuralı: prompt, fotoğraf okumasını EZER (madde 3).
import { parsePrompt, birlestir } from './prompt-parse.js?v=141';

const screen = document.getElementById('screen');
const saved = loadMeasurements();
// A standard EU38 body so a first-time visitor can SEE a real pattern before
// being asked to measure themselves, the "aha" comes before the 7-measurement
// ask, not after it. Replaced by the user's own numbers the moment they add them.
const DEMO_BODY = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40, armLength: 58, neck: 35 };
let usingDemo = !saved;
const values = { ...(saved || DEMO_BODY) };

// THE CLASS TEST, WRITTEN ONCE (F-İNDİR 2nd round, 2026-08-26). `garment` is a
// closed three-value enum and this file asked it thirty-one times in thirty-one
// places — `s.garment !== 'skirt'` copy-pasted down the table and again through
// the vision block. That is precisely what vocab_reference_check counts, and
// precisely what the direction it enforces forbids: the menu is to be
// DISMANTLED, not spread. Three predicates, one reference each; adding a fourth
// class (or renaming the axis) is now one edit instead of thirty-one.
const isSkirt = (s) => s.garment === 'skirt';
const isTop = (s) => s.garment === 'top';
const isDress = (s) => s.garment === 'dress';

const SPEC_GROUPS = [
  { key: 'garment', label: 'garment', trLabel: 'kıyafet', options: [['skirt', 'skirt', 'etek'], ['dress', 'dress', 'elbise'], ['top', 'top', 'üst']], for: () => true },
  { key: 'neckline', label: 'neckline', trLabel: 'yaka', options: [['crew', 'crew', 'bisiklet'], ['scoop', 'scoop', 'oval'], ['vNeck', 'v-neck', 'V yaka'], ['square', 'square', 'kare'], ['boat', 'boat', 'kayık'], ['sweetheart', 'sweetheart', 'kalp yaka'], ['halter', 'halter', 'halter (boyundan bağlı)'], ['cowl', 'cowl (draped)', 'kowl (dökümlü)'], ['pussyBow', 'pussy-bow', 'fiyonk yaka']], for: (s) => !isSkirt(s) },
  { key: 'keyhole', label: 'front detail', trLabel: 'ön detay', options: [['none', 'plain', 'sade'], ['keyhole', 'keyhole cut-out', 'anahtar deliği']], for: (s) => !isSkirt(s) && s.neckline !== 'halter' },
  // Loop 7/8: collar family, a separate collar piece, neck edge trued to the
  // neckline. Only for non-skirt, non-halter garments (a halter has no neckline
  // band to carry a collar).
  { key: 'collarType', label: 'collar', trLabel: 'yaka biçimi', options: [['none', 'none', 'yok'], ['stand', 'stand', 'dik'], ['mock', 'mock / mandarin', 'mandarin'], ['flat', 'flat', 'yatık'], ['peterPan', 'peter pan', 'bebe'], ['shirt', 'shirt', 'gömlek']], for: (s) => !isSkirt(s) && s.neckline !== 'halter' },
  { key: 'collarEdge', label: 'collar edge', trLabel: 'yaka kenarı', options: [['round', 'round', 'yuvarlak'], ['pointed', 'pointed', 'sivri'], ['scallop', 'scalloped', 'fisto']], for: (s) => !isSkirt(s) && s.neckline !== 'halter' && (s.collarType === 'flat' || s.collarType === 'peterPan') },
  // Patch 3.10: neckline + armhole edge finish. Bias binding is the DEFAULT
  // (thin trued 45° bias strip — the couture finish); facing is opt-in. Hidden
  // when a real collar is chosen (a collar always sits on a faced neck) or on a
  // halter (its own binding) or a skirt (no neckline).
  { key: 'edgeFinish', label: 'edge finish', trLabel: 'kenar bitişi', options: [['biasBinding', 'bias binding', 'biye'], ['facing', 'facing', 'pervaz']], for: (s) => !isSkirt(s) && s.neckline !== 'halter' && (!s.collarType || s.collarType === 'none') },
  // A halter has no shoulders to hang a sleeve from, the pickers hide.
  { key: 'sleeveStyle', label: 'sleeves', trLabel: 'kol', options: [['none', 'sleeveless', 'kolsuz'], ['straight', 'straight', 'düz'], ['balloon', 'balloon', 'balon']], for: (s) => !isSkirt(s) && s.neckline !== 'halter' },
  { key: 'sleeveLength', label: 'sleeve length', trLabel: 'kol boyu', options: [['short', 'short', 'kısa'], ['elbow', 'elbow', 'dirsek'], ['long', 'long', 'uzun']], for: (s) => !isSkirt(s) && s.neckline !== 'halter' && s.sleeveStyle !== 'none' },
  // Loop 6: sleeve HEAD (cap) treatment. Puff = raised + gathered crown; gathered
  // = soft gather, no raise. Only shown when there IS a sleeve; balloon already
  // gathers the hem so the head stays plain there.
  { key: 'sleeveCap', label: 'sleeve head', trLabel: 'kol başı', options: [['plain', 'plain', 'düz'], ['gathered', 'gathered', 'büzgülü'], ['puffed', 'puffed', 'puf'], ['cap', 'cap sleeve', 'cap (kısa kanat)']], for: (s) => !isSkirt(s) && s.neckline !== 'halter' && s.sleeveStyle === 'straight' },
  // patch 3.13: sleeve-end cuff (manşet). A separate button (barrel) or ribbed
  // (knit) band at the wrist, the sleeve hem gathered in. Only a full-length
  // straight sleeve (long/elbow, not a cap wing) has a wrist to cuff.
  { key: 'cuffStyle', label: 'cuff', trLabel: 'manşet', options: [['none', 'none', 'yok'], ['button', 'button cuff', 'düğmeli (gömlek)'], ['ribbed', 'ribbed cuff', 'ribana (örme)']], for: (s) => !isSkirt(s) && s.neckline !== 'halter' && s.sleeveStyle === 'straight' && (s.sleeveLength === 'long' || s.sleeveLength === 'elbow') && s.sleeveCap !== 'cap' },
  // Loop 8: drawstring / shirred / smocked gathering (büzgü), a separate gathered
  // panel (+ a drawstring cord) whose gathered edge is trued to the zone. Only on
  // a dress/top (needs a bodice to gather onto).
  { key: 'gatherType', label: 'gathering', trLabel: 'büzgü', options: [['none', 'none', 'yok'], ['drawstring', 'drawstring', 'ip büzgü'], ['shirred', 'shirred', 'lastik büzgü'], ['smocked', 'smocked', 'smok']], for: (s) => !isSkirt(s) },
  { key: 'gatherZone', label: 'gather zone', trLabel: 'büzgü yeri', options: [['neckline', 'neckline', 'yaka'], ['bust', 'bust', 'büst'], ['waist', 'waist', 'bel'], ['sleeve', 'sleeve', 'kol']], for: (s) => !isSkirt(s) && s.gatherType && s.gatherType !== 'none' },
  // Loop 9b: open-back cutout (açık sırt oyuğu), a shaped opening in the back
  // piece + a facing trued to the opening. Only on a dress/top (needs a back
  // bodice). Independent of a tie-back: a dress can have both.
  { key: 'backOpening', label: 'open back', trLabel: 'açık sırt', options: [['none', 'none', 'yok'], ['round', 'round cutout', 'yuvarlak oyuk'], ['lowV', 'low V', 'düşük V'], ['square', 'square', 'kare'], ['keyhole', 'keyhole', 'damla']], for: (s) => !isSkirt(s) },
  // corset lace-up back (korse bağcıklı sırt): an eyelet-laced CB closure — the
  // two back halves leave an open gap spanned by a criss-cross lace. Adds a CB
  // facing strip + trued eyelet columns + a lacing cord. Only a fitted dress/top
  // back hosts one (needs a fitted bodice back).
  { key: 'laceUpBack', label: 'lace-up back', trLabel: 'bağcıklı sırt', options: [['none', 'none', 'yok'], ['corset', 'corset lace-up', 'korse bağcık']], for: (s) => !isSkirt(s) },
  // wrapfront.cpp: true wrap / surplice front (kruvaze — the wrap-dress family). The
  // FRONT is reshaped into a crossed double front (each front laps past CF into a
  // diagonal wrap edge, cut 2 mirror, surplice V). Only a dress/top (needs a front
  // bodice). Pairs naturally with the wrap-front tie above.
  { key: 'wrapFront', label: 'wrap / surplice front', trLabel: 'kruvaze ön', options: [['none', 'none', 'yok'], ['surplice', 'surplice wrap', 'kruvaze (çapraz ön)']], for: (s) => !isSkirt(s) },
  // vocab 2026-07-17: back detail (arka pelerin/fırfır — Damla "arkası pelerinli/
  // fırfırlı"). A separate cut piece at the back neck: gathered ruffle, draped
  // cape, or circular flounce. Only a dress/top (needs a back bodice).
  { key: 'backDetail', label: 'back detail', trLabel: 'arka detay', options: [['none', 'none', 'yok'], ['ruffle', 'back ruffle', 'arka fırfır'], ['cape', 'back cape', 'arka pelerin'], ['flounce', 'back flounce', 'arka volan']], for: (s) => !isSkirt(s) },
  // vocab 2026-07-17: off-shoulder / bardot neckline (omuz açık / bardot). The
  // bodice top edge drops below the shoulder onto an elastic casing (+ optional
  // bardot frill) — the pink gingham dress. Needs a plain (dart) bodiced garment.
  { key: 'bardotStyle', label: 'off-shoulder', trLabel: 'omuz açık (bardot)', options: [['none', 'none', 'yok'], ['plain', 'off-shoulder band', 'omuz açık bant'], ['frill', 'bardot (with frill)', 'bardot (fırfırlı)']], for: (s) => !isSkirt(s) && s.neckline !== 'halter' && s.shaping === 'dart' },
  // vocab 2026-07-17: button row (düğme sırası). A drawn vertical row of buttons —
  // functional (a real CF opening) or decorative (buttons for looks). Dress/top.
  { key: 'buttonRow', label: 'button row', trLabel: 'düğme sırası', options: [['none', 'none', 'yok'], ['functional', 'functional (opens)', 'fonksiyonel (açılır)'], ['decorative', 'decorative', 'süs (kapanmaz)']], for: (s) => !isSkirt(s) && s.neckline !== 'halter' },
  // vocab 2026-07-17: exposed / visible zipper (görünür fermuar). A visible design
  // zip on the CF or CB seam (distinct from the hidden CB zip a dress carries).
  { key: 'exposedZip', label: 'exposed zip', trLabel: 'görünür fermuar', options: [['none', 'none', 'yok'], ['centerFront', 'center front', 'ön ortası'], ['centerBack', 'center back', 'arka ortası']], for: (s) => !isSkirt(s) },
  // vocab 2026-07-17: front tie (önden bağlamalı — Damla). A front bow / wrap-
  // front tie / tie-front waist as self-fabric strips. A wrap-front tie also
  // serves as the front opening. Only a dress/top (needs a front bodice).
  { key: 'tieClosure', label: 'front tie', trLabel: 'ön bağ', options: [['none', 'none', 'yok'], ['frontNeckBow', 'front neck bow', 'ön yaka fiyonku'], ['frontWaistTie', 'tie-front waist', 'önden bel bağı'], ['frontWaistBow', 'front waist bow', 'ön bel fiyonku'], ['wrapFront', 'wrap-front tie', 'kruvaze (önden bağlı)']], for: (s) => !isSkirt(s) && s.neckline !== 'halter' },
  { key: 'skirtStyle', label: 'skirt style', trLabel: 'etek stili', options: [['aLine', 'A-line', 'A kesim'], ['straight', 'straight', 'düz'], ['gathered', 'gathered', 'büzgülü'], ['halfCircle', 'half circle', 'yarım kloş'], ['pleated', 'pleated', 'pileli'], ['gore', 'gored (6-panel)', 'godeli (6 panel)']], for: (s) => !isTop(s) },
  { key: 'waistline', label: 'waistline', trLabel: 'bel hattı', options: [['natural', 'natural waist', 'normal bel'], ['empire', 'empire (under bust)', 'göğüs altı (babydoll)']], for: (s) => isDress(s) },
  { key: 'skirtLength', label: 'length', trLabel: 'boy', options: [['mini', 'mini', 'mini'], ['midi', 'midi', 'midi'], ['maxi', 'maxi', 'maksi']], for: (s) => !isTop(s) },
  { key: 'ruffle', label: 'hem ruffle', trLabel: 'fırfır', options: [['none', 'none', 'yok'], ['single', 'hem ruffle', 'etek ucu fırfır'], ['tiered', 'tiered (3)', 'kademeli (3 kat)']], for: (s) => !isTop(s) },
  // Loop M1: back hem slit / walking vent (arka etek yırtmacı). Only a fitted
  // straight/A-line skirt or dress hosts a center-back walking vent; gathered/
  // pleated/half-circle skirts walk freely and the engine skips it honestly.
  { key: 'backSlit', label: 'back slit', trLabel: 'arka yırtmaç', options: [['none', 'none', 'yok'], ['vent', 'walking vent', 'körük yırtmaç'], ['slit', 'plain slit', 'düz yırtmaç']], for: (s) => !isTop(s) && (s.skirtStyle === 'straight' || s.skirtStyle === 'aLine') },
  // queue #3: ruffled shoulder straps (fırfırlı askı). A gathered self-fabric
  // frill strip drawn as a separate pair; only a sleeveless dress/top carries one
  // (a sleeved/halter garment frames the shoulder instead → engine skips honestly).
  { key: 'ruffledStraps', label: 'ruffled straps', trLabel: 'fırfırlı askı', options: [['none', 'none', 'yok'], ['ruffled', 'ruffled straps', 'fırfırlı askı']], for: (s) => s.sleeveStyle === 'none' && s.neckline !== 'halter' },
  // R1.1: peplum (bele takılan volan). A flared circular flounce hung from the
  // waist as a separate piece; only a waisted top/dress carries one (a
  // pleated/gathered/draped peplum stays honest → not offered here).
  { key: 'peplum', label: 'peplum', trLabel: 'peplum (bel volanı)', options: [['none', 'none', 'yok'], ['full', 'full circle', 'tam kloş'], ['half', 'half circle', 'yarım kloş'], ['pointed', 'pointed hem', 'sivri etek']], for: (s) => !isSkirt(s) },
  // R1.2: asymmetric button placket (asimetrik düğme patı). The classic front
  // button stand shifted off center (the Jackie gingham). Only a dress/top hosts
  // one; a symmetric CF placket is still set by the front-closure read separately.
  { key: 'placketStyle', label: 'button placket', trLabel: 'düğme patı', options: [['none', 'none', 'yok'], ['standard', 'center front', 'ortadan'], ['asymmetric', 'asymmetric (off center)', 'asimetrik (yandan)']], for: (s) => !isSkirt(s) && s.neckline !== 'halter' },
  // patch 3.12: pocket (cep). A patch pocket (a separate piece sewn onto the
  // outside + a placement mark) or a side-seam in-seam pocket (two bag pieces +
  // a mouth mark). Welt/besom/cargo/kangaroo stay honest → not offered here.
  { key: 'pocketStyle', label: 'pocket', trLabel: 'cep', options: [['none', 'none', 'yok'], ['patch', 'patch pocket', 'yama cep'], ['sideSeam', 'side-seam pocket', 'yan dikiş cebi'], ['slash', 'slash pocket (angled front)', 'eğik cep (ön hip)']], for: () => true },
  // patch 3.15: hem shape (etek ucu şekli). Reshapes the fitted lower edge into a
  // shirt-tail (sides up, center long) or high-low (front short, back long). Only
  // a fitted straight/A-line skirt/dress or a top hosts it; a gathered/pleated/
  // circle skirt has no shaped side hem to lift (stays honest).
  { key: 'hemShape', label: 'hem shape', trLabel: 'etek ucu', options: [['straight', 'straight', 'düz'], ['shirttail', 'shirt-tail (curved)', 'gömlek eteği (kavisli)'], ['highLow', 'high-low', 'önü kısa arkası uzun'], ['pointedV', 'pointed / corset (V)', 'sivri / korse (V)'], ['boxPleatHem', 'box-pleat kick', 'kutu pili (kick)']], for: (s) => isTop(s) || ((isSkirt(s) || isDress(s)) && (s.skirtStyle === 'straight' || s.skirtStyle === 'aLine')) },
  { key: 'topLength', label: 'top length', trLabel: 'üst boyu', options: [['cropped', 'cropped', 'crop'], ['hip', 'hip', 'kalça'], ['tunic', 'tunic', 'tunik']], for: (s) => isTop(s) },
  // Darts are the DEFAULT shaping (2026-07-17 minimal-piece policy): a plain
  // bodice stays ONE panel per side instead of splitting into a center + side
  // panel. Princess seams are the OPT-IN style — they double the bodice/skirt
  // piece count, so a clean pattern only spends them when the style asks for it.
  // Gathered and half-circle skirts have no waist shaping to convert.
  { key: 'shaping', label: 'shaping', trLabel: 'form', options: [['dart', 'darts', 'pens'], ['princess', 'princess seams', 'prenses dikiş']], for: (s) => !isSkirt(s) || s.skirtStyle === 'aLine' || s.skirtStyle === 'straight' },
  { key: 'fabric', label: 'fabric', trLabel: 'kumaş', options: [['woven', 'woven (no stretch)', 'dokuma (esnemez)'], ['knit', 'knit / stretch', 'örgü / streç']], for: () => true },
  // F6 — KUMAŞ KATALOĞU. The woven/knit word above decides SEWING (needle,
  // stitch, whether a zip is needed). It cannot decide the CUT, because the word knit
  // covers a 5%-stretch ponte and a 90%-stretch swim knit. This dial hands the
  // engine the four MEASURED numbers instead (crosswise stretch, D3107
  // recovery/growth, FAST-2 drape inputs, bolt width) from
  // the kumaş catalog in contract/. The option labels carry NO measurements:
  // a number printed on the site is a claim and needs a provider (landing_truth_
  // check L1). The four measured numbers are printed on the RESULT page instead,
  // each next to the basis it stands on. `unset` overlays nothing and the draft is
  // exactly what it was before the catalog existed.
  { key: 'fabricPreset', label: 'material (measured)', trLabel: 'kumaş (ölçülmüş)', options: [['unset', 'use the word above', 'yukarıdaki kelime geçerli'], ['cotton-poplin', 'cotton poplin (crisp woven)', 'pamuklu poplin (sert dokuma)'], ['viscose-crepe', 'viscose crepe (drapey woven)', 'viskon krep (düşümlü dokuma)'], ['single-jersey', 'single jersey (stretch knit)', 'single jersey (esneyen örme)']], for: () => true },
];
// Foto-anı bug fix (2026-07-27): the last validated vision reading + whether
// the user hand-picked a length AFTER it. The photo mm is a ratio x body — it
// used to freeze at the values present when the photo was uploaded (usually
// the EU38 demo) and never follow the user's own measurements. Kept at module
// level so every re-entry into the spec screen re-derives it (see showSpec).
let photoSeen = null;
let photoLenHandPicked = false;

// F1: the last APPLIED prompt parse + its raw text. Module level for the same
// reason photoSeen is: a photo analyzed AFTER the prompt must not silently
// undo the user's written ask — ingestReading re-applies it (madde 3: the
// prompt is the explicit ask, label `soruldu`; untouched photo axes stay
// `gorulen`).
let promptParsed = null;
let promptText = '';

/** Apply the stored prompt onto the spec + origin record. Priority rule F1/3. */
function uygulaPrompt() {
  if (!promptParsed) return;
  const { zorunlu } = birlestir(spec, promptParsed);
  for (const f of Object.keys(promptParsed.eksenler)) isaretle(koken, f, 'soruldu');
  for (const f of zorunlu) {
    isaretle(koken, f, 'zorunlu', 'bilinmiyor', 'kol başı/boyu istendi, taşıyacak kol gerekti');
  }
  // A written length is an explicit order, same latch as a hand-picked one:
  // drop the photo-measured mm so mini/midi/maxi does exactly what it says.
  if (promptParsed.eksenler.skirtLength) { spec.skirtLengthMM = 0; photoLenHandPicked = true; }
}

const spec = {
  garment: 'dress', neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', shaping: 'dart',
  waistline: 'natural', fabric: 'woven', fabricPreset: 'unset', ruffle: 'none', keyhole: 'none', tieClosure: 'none',
  sleeveCap: 'plain', collarType: 'none', collarEdge: 'round',
  gatherType: 'none', gatherZone: 'neckline', backOpening: 'none', laceUpBack: 'none', wrapFront: 'none', backSlit: 'none',
  ruffledStraps: 'none', peplum: 'none', placketStyle: 'none', edgeFinish: 'biasBinding', pocketStyle: 'none', cuffStyle: 'none', hemShape: 'straight',
  cupSeam: 'none', yoke: 'none', boxPleat: 'none', hemFlounce: 'none',
};

// ── KÖKEN (F0, 2026-08-26) ──────────────────────────────────────────────────
// The axes above are a COMPLETE spec the moment this file loads: nothing is
// blank, and that is deliberate (§0B — the engine fills every field, there is
// no empty output). The cost is that a value the user's photo never showed
// looks exactly like a value it did. Measured: 70 of 120 fields inferred,
// %58.3, and no shipped surface said so. So every axis starts labelled
// `cikarildi` — the honest default, because a field IS host-derived until
// something proves otherwise — and is re-labelled at the exact line that
// overwrites it: `gorulen` from the photo, `soruldu` from the user's own tap,
// `zorunlu` when coherence forces it. `beden` rides along as an axis of its
// own because §4C md.2 makes the EU38 demo body a derived value too: drafting
// a stranger's dress on a standard body without saying so is the same lie in
// centimetres.
//
// THE LIST NAMES NO AXIS OF ITS OWN (F0 2nd round, 2026-08-26). The first
// round spelled the hem-flounce axis out as a string literal here and
// vocab_reference_check went red: 26 -> 27 references to a closed enum, which
// is exactly the growth that gate exists to forbid. The literal was a symptom.
// ROOT CAUSE: that axis was the ONLY one the engine reads (see engine.js) that
// appeared neither in the defaults above nor in SPEC_GROUPS — it existed
// solely as a runtime write from the vision block, so `Object.keys(spec)`
// could not see it until a photo had already been read, and the list had to
// name it by hand. It now sits in the defaults with its siblings, where every
// other axis lives, and this list stays derived from two sources with no third
// place to keep in sync.
const KOKEN_ALANLARI = [...new Set([
  ...Object.keys(spec), ...SPEC_GROUPS.map((g) => g.key), 'beden',
])];
const koken = yeniKoken(KOKEN_ALANLARI);

/**
 * Write an axis FROM THE PHOTO. A missing / 'none' / empty reading is not a
 * reading: the axis keeps its host default and stays labelled `cikarildi`.
 * Returns whether the photo actually drove it, so a host gate can still veto
 * the value without the label lying about where it came from.
 */
function fotoSet(field, value) {
  if (value === null || value === undefined || value === 'none' || value === false || value === '') return false;
  spec[field] = value;
  isaretle(koken, field, 'gorulen');
  return true;
}

/** An axis the user set with their own hand (a tap, or a style-page link). */
const elleSet = (field, value) => { spec[field] = value; isaretle(koken, field, 'soruldu'); };

/**
 * A photo reading this host cannot carry. The read is NOT dropped in silence:
 * the axis falls back to `bos` and is labelled `zorunlu` — buildability
 * overrode what was seen (§4B md.2, §0B). Silence here is exactly the 2026-07-18
 * puff sleeve, dropped without a word.
 */
function konakSet(field, value, hostable, bos = 'none') {
  if (value && hostable) { spec[field] = value; isaretle(koken, field, 'gorulen'); return; }
  spec[field] = bos;
  if (value) isaretle(koken, field, 'zorunlu', 'bilinmiyor', 'fotoğrafta okundu, bu giysi taşıyamıyor');
}

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
      // A style-page link is the user's own choice, arriving one screen early.
      if (['none', 'backWaistBow', 'tieBack', 'frontNeckBow', 'cuffTies'].includes(v)) elleSet('tieClosure', v);
      continue;
    }
    // Everything else must be a real option value for a real picker.
    if (pickerVals[k] && pickerVals[k].has(v)) elleSet(k, v);
  }
})();

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
  // Foto-anı bug fix (2026-07-27): the photo-measured hem mm is a RATIO x the
  // CURRENT body. Every entry into this screen (first visit, measurement
  // wizard finished, profile switched) re-derives it from the values as they
  // are NOW — it no longer freezes at whatever body was loaded when the photo
  // was uploaded. A hand-picked mini/midi/maxi keeps its explicit-order drop.
  spec.skirtLengthMM = refreshSkirtLengthMM(spec.skirtLengthMM, photoSeen, values, photoLenHandPicked);
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

  // ---- THE PHOTO INGEST, ONE COPY (GECE7 / F8) ------------------------------
  //
  // This used to live inline inside the file-picker's change handler, which was
  // fine while there was exactly one way a photograph could enter. F8 adds a
  // second: the AL DENE page hands `create.html?ornek=NN` a photograph whose
  // vision labels were bought once and banked (analyze.js `analyzeBankedPhoto`).
  //
  // 🚨 IT IS EXTRACTED RATHER THAN COPIED, and the reason is written two hundred
  // lines below in this same file: the honesty layer's flags were once carried
  // in two places, one drifted, and missing.js started telling a buyer the
  // engine could not draw something it draws. A second copy of THIS block would
  // be the same failure with a bigger blast radius — the whole spec surface.
  // One reading path, two front doors.
  //
  // `seenRaw` is the raw vision answer; `pixels` is the canvas it was read from
  // (measure.js needs the image, not the answer). `status` is where a sentence
  // for the human goes.
  async function ingestReading(seenRaw, pixels, status) {
      // K1 contract gate: the vision answer must speak the SEMANTIC garment
      // language (contract/garment-spec.schema.json visionReading,
      // additionalProperties:false). Unknown fields are stripped, out-of-enum
      // values nulled — a render knob can never enter through this door.
      const { clean: seen, report: schemaStrikes } = validateVision(seenRaw);
      if (schemaStrikes.length) console.warn('vision schema strikes:', schemaStrikes);
      // Olcum kapisi (2026-07-27): the NUMBERS come from the same canvas the
      // labels came from, measured deterministically (measure.js). The LLM
      // answer's ratios{} is never consumed: applyMeasuredRatios replaces it
      // with the measurement, or with null when the measurement honestly
      // refused (then the enum-default path drives, exactly as before, and
      // the result screen says "standard proportions"). LLM = labels only.
      // F2-vision: the return is kept — 'belirsiz' means the measurement RAN
      // but under the confidence margin; the numbers are carried on seen
      // (ratiosUncertain), the draft uses the standard table (the most
      // constraining value), and the status sentence below names the ratios
      // it could not read confidently. Nulling-and-forgetting is gone.
      const oranDurum = applyMeasuredRatios(seen, measureGarment(pixels));
      // Each fotoSet is a LABEL as much as an assignment: what the photo
      // showed becomes `gorulen`, what it did not stays `cikarildi` and is
      // named to the user on the result screen and inside both files.
      fotoSet('garment', seen.garment);
      fotoSet('neckline', seen.neckline);
      fotoSet('sleeveStyle', seen.sleeveStyle);
      fotoSet('sleeveLength', seen.sleeveLength);
      fotoSet('skirtStyle', seen.skirtStyle);
      // Oran kablosu 2 — hemToWaistWidth's first consumer: the MEASURED
      // hem-to-waist width picks the skirt fullness class inside the
      // engine's existing enum (straight/aLine/gathered/halfCircle,
      // thresholds at the midpoints of what each style actually drafts). A
      // structural pleated/gore label outranks the ratio (pickSkirtFullness
      // returns null and the label keeps driving). Placed BEFORE the host
      // gates below so backSlit/hemShape/pocket see the final skirt style.
      const fullness = pickSkirtFullness(seen);
      // Spelled out rather than routed through fotoSet: photo_ratio_wire_check
      // asserts THIS line verbatim on the product path, and loosening someone
      // else's gate is not a phase agent's call (§3.8 md.4). The origin label
      // rides on the next line instead, which is all F0 needs.
      if (fullness) spec.skirtStyle = fullness;
      if (fullness) isaretle(koken, 'skirtStyle', 'gorulen');
      fotoSet('skirtLength', seen.length);
      // Foto-oran kablosu: the measured ratios scale the hem to the WEARER's
      // own body — a continuous mm target next to the coarse mini/midi/maxi.
      // 0 = not trustworthy → the table drives, exactly as before. The seen
      // is KEPT so showSpec re-derives the mm whenever the body changes
      // (foto-anı bug fix, 2026-07-27); a fresh photo clears the hand-pick.
      photoSeen = seen;
      photoLenHandPicked = false;
      spec.skirtLengthMM = refreshSkirtLengthMM(spec.skirtLengthMM, photoSeen, values, photoLenHandPicked);
      fotoSet('topLength', seen.topLength);
      if (seen.shaping === 'princess' || seen.shaping === 'dart') fotoSet('shaping', seen.shaping);
      if (seen.waistline === 'natural' || seen.waistline === 'empire') fotoSet('waistline', seen.waistline);
      if (seen.fabric === 'woven' || seen.fabric === 'knit') fotoSet('fabric', seen.fabric);
      // A read of 'none' IS a reading here (the eye looked at the hem and saw
      // no ruffle), so it is labelled `gorulen` by hand rather than through
      // fotoSet, which treats 'none' as "nothing was read".
      if (['none', 'single', 'tiered'].includes(seen.hemRuffle)) {
        spec.ruffle = seen.hemRuffle; isaretle(koken, 'ruffle', 'gorulen');
      }
      // Same: `false` is a declaration of absence (§3.6 H3), not a silence.
      if (typeof seen.keyhole === 'boolean') {
        spec.keyhole = seen.keyhole ? 'keyhole' : 'none'; isaretle(koken, 'keyhole', 'gorulen');
      }
      // F2-vision ORAN KABLOLARI: the four NEW measured-ratio wires (waistline,
      // round-family neckline, strap width class, sleeve length class) — one
      // shared function, the same one vision_tasima_check runs, so the product
      // path and the gate cannot drift. Each fires only on a trusted
      // measurement (seen.ratiosMeasured) and lands as `gorulen`.
      for (const w of applyRatioAxes(spec, seen, values)) {
        isaretle(koken, w.eksen, 'gorulen');
      }
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
      konakSet('placketStyle', placket, true);
      // Keep the legacy bool in sync so the honesty layer + any bool consumer
      // still fire for a symmetric front (asymmetric drives placketStyle only).
      spec.frontPlacket = placket === 'standard';
      // Gathered / puff / CAP sleeve HEAD (Loop 6 + R1.2): the engine now RAISES
      // + widens the cap and adds a crown gather for a gathered/puffed head, and
      // R1.2 draws the short CAP-sleeve WING. `puffed` = raised puff, `gathered`
      // = soft gather, `capped` = a short cap wing. A drawstring-gathered sleeve
      // (needs an arm casing) stays honest.
      // K1: the vision-word -> engine-word translation is contract data
      // (contract/tables.json mappings.sleeveHeadToSleeveCap), not an if-chain.
      const capWord = seen.sleeveHead && CONTRACT.mappings.sleeveHeadToSleeveCap[seen.sleeveHead];
      if (capWord && capWord !== 'plain') fotoSet('sleeveCap', capWord);
      // A gathered/puff/cap head needs an actual sleeve to sit on; if the vision
      // read a head but no sleeve style, give it a straight sleeve to carry it.
      if (spec.sleeveCap && spec.sleeveCap !== 'plain' && (!spec.sleeveStyle || spec.sleeveStyle === 'none')) {
        // A head needs an arm to sit on: the sleeve is not a reading, it is a
        // construction consequence of one.
        spec.sleeveStyle = 'straight';
        isaretle(koken, 'sleeveStyle', 'zorunlu', 'bilinmiyor', 'kol başı okundu, taşıyacak kol gerekti');
      }
      // Fabric ties / sash / bow (bağ / kuşak / fiyonk, Loop 4b): the engine
      // now draws SIMPLE APPLIED ties as separate self-fabric strips + a
      // placement notch. A drawstring that GATHERS the fabric (needs a casing +
      // shirring) is NOT this, that stays honest. Map the vision closure/back
      // detail to a tie placement; leave it for the honesty layer otherwise.
      konakSet('tieClosure', pickTiePlacement(seen), true);
      // Collar family (yaka, Loop 7/8): the engine now draws a SEPARATE collar
      // piece (stand/mock/flat/peter-pan/shirt), neck edge trued to the
      // neckline. A bias-bound / notched / sailor finish is NOT drafted and
      // stays honest (pickCollar returns null).
      const collar = pickCollar(seen);
      konakSet('collarType', collar && collar.type, true);
      if (collar) fotoSet('collarEdge', collar.edge); else spec.collarEdge = 'round';
      // Edge finish (patch 3.10): bias binding is the default on every dress
      // (Damla's call). A real collar keeps a faced neck inside the engine
      // regardless; a collarless neck + sleeveless armholes finish with a thin
      // trued bias strip. The vision doesn't override this — it's a finish
      // choice, not a garment read.
      spec.edgeFinish = 'biasBinding';
      isaretle(koken, 'edgeFinish', 'cikarildi', 'bilinmiyor', 'ev bitişi, fotoğraftan okunmadı');
      // Drawstring / shirred / smocked gathering (büzgü, Loop 8): the engine now
      // draws a SEPARATE gathered panel (+ a drawstring cord) whose gathered
      // edge is trued to the drafted zone edge. Map the vision yoke / drawstring
      // neckline / gathered bust to a gathering; leave it honest otherwise.
      const gather = pickGather(seen);
      konakSet('gatherType', gather && gather.type, true);
      if (gather) fotoSet('gatherZone', gather.zone); else spec.gatherZone = 'neckline';
      // Open-back cutout (açık sırt oyuğu, Loop 9b): the engine now opens a
      // shaped cutout in the BACK piece + a facing trued to the opening. This is
      // INDEPENDENT of a tie-back (Loop 4b), a Tie Back Mini Dress gets both.
      const backOpen = pickBackOpening(seen);
      konakSet('backOpening', backOpen, true);
      // Corset lace-up back (korse bağcıklı sırt): the engine now draws a CB
      // facing strip on each back edge + two trued eyelet columns + a lacing cord
      // (an eyelet-laced, open-gap, ADJUSTABLE back). Only a fitted (princess/dart)
      // bodice back on a dress/top hosts one; a skirt or loose/gathered back is
      // refused honestly by the engine, so gate the same way (a laced read on a
      // skirt stays in the honesty channel). Distinct from a tie-back (fabric ties)
      // and an open-back cutout (a faced hole) — this is criss-cross eyelet lacing.
      const laced = pickLaceUpBack(seen);
      const lacedHostable = !isSkirt(spec);
      konakSet('laceUpBack', laced && 'corset', lacedHostable);
      // True wrap / surplice front (kruvaze, wrapfront.cpp): the engine now
      // reshapes the FRONT bodice into a crossed double front — each front laps
      // past CF into a diagonal wrap edge, cut 2 mirror-image, forming the surplice
      // V (the wrap-dress family). Only a dress/top with a front bodice hosts one;
      // a skirt is refused honestly by the engine, so gate the same way (a wrap read
      // on a skirt stays in the honesty channel). A wrap-front TIE composes on top
      // to cinch it. Mirror the engine host gate exactly.
      const wrap = pickWrapFront(seen);
      const wrapHostable = !isSkirt(spec);
      konakSet('wrapFront', wrap && 'surplice', wrapHostable);
      // Back hem slit / walking vent (arka etek yırtmacı, Loop M1): the engine
      // cuts the back with a center-back seam and opens a walking slit from the
      // hem. Only a fitted straight/A-line skirt hosts one; a gathered/pleated
      // skirt walks freely (engine skips honestly). Gate on the skirt style so a
      // "slit" read on a gathered skirt stays in the honesty channel.
      const slit = pickHemSlit(seen);
      const slitHostable = !isTop(spec) &&
        (spec.skirtStyle === 'straight' || spec.skirtStyle === 'aLine');
      konakSet('backSlit', slit, slitHostable);
      // Ruffled shoulder straps (fırfırlı askı, queue #3): the engine now draws a
      // gathered self-fabric frill strip as a separate strap pair + a placement
      // notch. Only a sleeveless dress/top carries one; a sleeved/halter garment
      // frames the shoulder instead (engine skips honestly). A plain/spaghetti/
      // one-shoulder strap stays in the honesty layer (pickRuffledStraps null).
      const straps = pickRuffledStraps(seen);
      const strapsHostable = (spec.sleeveStyle === 'none' || !spec.sleeveStyle) &&
        spec.neckline !== 'halter';
      konakSet('ruffledStraps', straps, strapsHostable);
      // Peplum (bele takılan volan, R1.1): the engine now hangs a flared
      // circular flounce from the waist as a separate piece, inner arc trued to
      // the finished waist. Only a waisted top/dress hosts one; a pleated/
      // gathered/draped peplum stays honest (pickPeplum null). A skirt has no
      // waisted bodice → gate it out.
      const peplum = pickPeplum(seen);
      konakSet('peplum', peplum, !isSkirt(spec));
      // All-around hem flounce (etek ucu volanı — dropped-waist tiered look): the
      // engine hangs a gathered flounce from the WHOLE hem (front + back) as a
      // separate strip, gathered edge trued to the finished hem. Only a dress/top
      // with a real hem hosts one (a gathered/flared skirt already ripples). A
      // peplum (waist) or a back-only ruffle stays honest (pickHemFlounce null).
      const hemFlounceHostable = isDress(spec) || isTop(spec);
      konakSet('hemFlounce', pickHemFlounce(seen), hemFlounceHostable);
      // Pocket (cep, patch 3.12): the engine now draws a patch pocket (a
      // separate piece + a placement mark), a side-seam in-seam pocket (two bag
      // pieces + a mouth mark), and a SLASH pocket (a diagonal front-hip mouth +
      // a facing + a bag). A welt/besom/cargo/kangaroo pocket stays honest
      // (pickPocket null). The block itself skips honestly when the host has no
      // panel / no side seam (e.g. a cropped top for a side-seam bag).
      const pocket = pickPocket(seen);
      // A slash pocket needs a lower-body hip: a dress, or a fitted/A-line skirt
      // (a gathered/pleated/circle skirt is a no-waist rectangle, and a bodice-
      // only top has no hip). Gate it out otherwise (the engine also skips
      // honestly); the pocket then falls back to the honest missing note.
      const slashHostable = isDress(spec) ||
        (isSkirt(spec) && (spec.skirtStyle === 'straight' || spec.skirtStyle === 'aLine'));
      konakSet('pocketStyle', pocket, !(pocket === 'slash' && !slashHostable));
      // Cuff (manşet, patch 3.13): the engine now draws a button or ribbed band
      // at the wrist end of a full-length sleeve, the sleeve hem gathered in.
      // Only a real full-length sleeve (Straight, long/elbow) hosts one — a
      // sleeveless / cap / short sleeve has no wrist, so gate it out (the engine
      // also skips honestly). A French / elastic cuff stays honest (pickCuff null).
      const cuff = pickCuff(seen);
      const cuffHostable = spec.sleeveStyle === 'straight' &&
        (spec.sleeveLength === 'long' || spec.sleeveLength === 'elbow') &&
        spec.sleeveCap !== 'cap';
      konakSet('cuffStyle', cuff, cuffHostable);
      // Hem shape (etek ucu şekli, patch 3.15+): the engine now reshapes the
      // fitted lower edge into a shirt-tail (sides up), a high-low (front short,
      // back long), a corset/basque POINT (center dips to a V), or an inverted
      // BOX-PLEAT / kick pleat released at the hem. Only a fitted straight/A-line
      // skirt/dress or a top hosts one; a gathered/pleated/circle skirt has no
      // shaped lower edge, and a handkerchief/asymmetric-diagonal hem stays honest
      // (pickHemShape null). boxPleatHem also needs a center-fold panel — the C++
      // block honest-no-ops (guide note) if the host has no CF/CB fold.
      const hemShape = pickHemShape(seen);
      const hemHostable = isTop(spec) ||
        ((isSkirt(spec) || isDress(spec)) &&
         (spec.skirtStyle === 'straight' || spec.skirtStyle === 'aLine'));
      konakSet('hemShape', hemShape, hemHostable, 'straight');
      // vocab 2026-07-17: back detail (arka pelerin/fırfır). A separate ruffle/
      // cape/flounce piece at the back neck. Only a dress/top hosts one.
      const backDet = pickBackDetail(seen);
      konakSet('backDetail', backDet, !isSkirt(spec));
      // vocab: exposed / visible zipper (görünür fermuar). A visible design zip.
      konakSet('exposedZip', pickExposedZip(seen), true);
      // vocab: off-shoulder / bardot (omuz açık). The bodice top drops below the
      // shoulder onto an elastic casing (+ optional frill). Needs a plain (dart)
      // bodiced garment — a princess/skirt garment stays honest.
      const bardot = pickBardot(seen);
      const bardotHostable = !isSkirt(spec) && spec.neckline !== 'halter' &&
        spec.shaping !== 'princess';
      konakSet('bardotStyle', bardot, bardotHostable);
      // Cup seam (kup dikişi, cupseam.cpp): the engine now splits the princess
      // front into Upper Cup + Lower Cup + Front Body along a horizontal seam
      // through the bust apex — the strapless/bustier bust. The host-gate MIRRORS
      // the engine EXACTLY: a princess-seamed dress/top, strapless (sleeveless or
      // a cap-sleeve wing), with a sweetheart/square/scoop top edge above the
      // apex. Any other host the engine refuses honestly, so we don't send it and
      // it stays in the honesty layer (a sleeved bodice cup seam, a dart bust).
      const cupSeamHostable = (isDress(spec) || isTop(spec)) &&
        spec.shaping === 'princess' &&
        (spec.sleeveStyle === 'none' || spec.sleeveCap === 'cap') &&
        (spec.neckline === 'sweetheart' || spec.neckline === 'square' || spec.neckline === 'scoop');
      konakSet('cupSeam', pickCupSeam(seen) && 'horizontal', cupSeamHostable);
      // Yoke split (roba — doll/babydoll/swing dress, yoke.cpp): the engine now
      // splits the front+back bodice into a Yoke + a lower Body along a horizontal
      // chest seam — plain (yoke:1) or gathered/shirred/smocked below (yoke:2).
      // Host: a dress/top with a bodice (a skirt has none). Composes safely with a
      // collar (the engine faces the yoke) and with the box pleat below. A yoke the
      // engine refuses (a skirt) stays honest.
      const yokePick = pickYoke(seen);
      const yokeHostable = !isSkirt(spec);
      konakSet('yoke', yokePick && (yokePick === 2 ? 'gathered' : 'plain'), yokeHostable);
      // Center box pleat (orta ters kutu pili, boxpleat.cpp): a single inverted
      // fold behind the center-front panel — the swing/doll center fold. Host: a
      // dress/top (a skirt's CF panel is a different build). Composes with the yoke
      // above (a swing top is yoke + CF box pleat). No structured vision field
      // carries a box pleat, so pickBoxPleat reads only the free-text channel.
      const boxPleat = pickBoxPleat(seen);
      konakSet('boxPleat', boxPleat && 'centerInverted', !isSkirt(spec));
      // A drawn button row is DECORATIVE from vision (a functional row is the
      // placket path above); a visible run of buttons with no read closure reads
      // decorative. A front placket already drew a functional row, so only add a
      // decorative row when the placket did NOT fire.
      const buttonsRead = /button/.test(
        (Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' ') : '') + ' ' + (seen.details || ''),
      );
      konakSet('buttonRow', buttonsRead && 'decorative',
        spec.placketStyle === 'none' && !spec.frontPlacket && !isSkirt(spec) && spec.neckline !== 'halter');
      if (typeof seen.fabricName === 'string' && seen.fabricName !== 'other') spec.photoFabric = seen.fabricName;
      // Structural fields the vision now reads but the engine cannot draw yet
      // (Loop 1 pipe: carried on the spec so later loops can consume them and
      // the honesty layer can tell the user what the pattern is missing).
      // F-I (2026-08-23): bu blok vision-bridge.js'e TAŞINDI (buildSeenRecord).
      // Sebep: dürüstlük katmanının "çizdim mi" bayrakları ürün yolunda burada,
      // ölçüm yolunda bir kopyada duruyordu; kopya sürüklenirse missing.js alıcıya
      // motorun çizebildiğini "çizemedim" der. Tek gerçek kaynağı artık orası.
      // `ratiosMeasured` BURADA açıkça yazılı kalır: photo_ratio_wire_check
      // ölçüm tanığının ÜRÜN yolunda görünür olmasını şart koşuyor, ve kapı
      // gevşetilmedi. Değeri buildSeenRecord'unkiyle birebir aynı ifade.
      // F1 ÖNCELİK KURALI (madde 3): daha önce yazılmış bir prompt varsa
      // fotoğrafın okumasını EZER — kullanıcının açık isteği kazanır, etiketi
      // `soruldu`; fotoğrafın çakışmayan alanları `gorulen` kalır. buildSeen-
      // Record'dan ÖNCE koşar ki dürüstlük kaydı nihai spec'i anlatsın.
      uygulaPrompt();
      spec.seen = { ...buildSeenRecord(spec, seen), ratiosMeasured: seen.ratiosMeasured === true };
      // F2-vision: name the ratios the measurement could not read confidently
      // — the pattern used the standard table for them, and saying so is the
      // difference between a fallback and a silent lie.
      const belirsizler = oranDurum === 'belirsiz' ? uncertainRatioNames(seen) : [];
      status.textContent = (seen.details ? seen.details + ', ' : '') +
        (belirsizler.length ? t('create.spec.ratiobelirsiz') + ' ' + belirsizler.join(', ') + '. ' : '') +
        t('create.spec.checkpicks');
      rebuild();
  }

  // ---- F1: PROMPT PATH — describe the garment in words, with or without a
  // photo. Deterministic (web/js/prompt-parse.js): the words land on the SAME
  // spec axes the pickers hold, so the user sees and can fix every read below.
  // Zero API calls, zero cost. A word the parser does not know is printed BY
  // NAME with a pointer to the nearest Edge/Panel/Stitch primitive — nothing
  // is dropped in silence.
  {
    const promptBlock = el('div', 'spec-group');
    promptBlock.style.marginTop = '30px';
    promptBlock.appendChild(el('div', 'group-label', t('create.spec.prompt')));
    const ta = document.createElement('textarea');
    ta.rows = 2;
    ta.placeholder = t('create.spec.promptph');
    ta.style.cssText = 'width:100%;box-sizing:border-box;font:inherit;padding:10px;' +
      'border:1px solid var(--bb-line, #ccc);resize:vertical;background:transparent';
    ta.value = promptText;
    const pRow = el('div', 'choice-row');
    const pBtn = el('button', 'choice', t('create.spec.promptbtn'));
    const pStatus = el('div', 'field-error', '');
    pStatus.style.color = 'var(--gray)';
    pBtn.addEventListener('click', () => {
      pStatus.textContent = '';
      const parsed = parsePrompt(ta.value);
      if (parsed.bos) { pStatus.textContent = t('create.spec.promptempty'); return; }
      promptParsed = parsed;
      promptText = ta.value;
      uygulaPrompt();
      const okList = Object.entries(parsed.eksenler)
        .map(([f, e]) => `${e.kelime} → ${f}: ${e.value}`).join(' · ');
      if (okList) pStatus.appendChild(el('div', '', t('create.spec.promptok', { what: okList })));
      for (const u of parsed.anlasilmadi) {
        const line = el('div', '', t('create.spec.promptunknown', { word: u.kelime, hint: u.oneri }));
        line.style.color = '#8f2038';
        pStatus.appendChild(line);
      }
      if (!okList && !parsed.anlasilmadi.length) pStatus.textContent = t('create.spec.promptempty');
      rebuild();
    });
    promptBlock.appendChild(ta);
    pRow.appendChild(pBtn);
    promptBlock.appendChild(pRow);
    promptBlock.appendChild(pStatus);
    screen.appendChild(promptBlock);
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
        const { reading: seenRaw, pixels } = await analyzePhoto(file.files[0]);
        await ingestReading(seenRaw, pixels, status);
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

  // ---- AL DENE: `create.html?ornek=NN` (GECE7 / F8) --------------------------
  //
  // Ten real photographs, ten patterns, one line. The al-dene.html gallery links
  // here with the example's number; this loads that photograph and its BANKED
  // vision labels and hands them to the very same ingestReading() the upload
  // path uses. Nothing is pre-computed and nothing is hand-corrected: the
  // visitor watches the engine draft, and then downloads the DXF / A4 / A0 /
  // flat with the ordinary buttons on the result screen.
  //
  // ⭐ IT LIVES OUTSIDE the photoAvailable() guard above ON PURPOSE. That guard
  // asks whether the paid Worker is configured; this path never calls it (§3.9
  // — zero API calls, zero cost). A stranger can therefore walk the whole chain
  // even when photo upload is closed, which is the only reason the sentence
  // "al dene" can be said out loud today.
  const ornekNo = new URLSearchParams(location.search).get('ornek');
  if (ornekNo) {
    const block = el('div', 'spec-group');
    block.style.marginTop = '30px';
    const ornekStatus = el('div', 'field-error', '');
    ornekStatus.style.color = 'var(--gray)';
    block.appendChild(ornekStatus);
    screen.appendChild(block);
    ornekStatus.appendChild(sewingLoader('reading the example photo'));
    (async () => {
      try {
        const res = await fetch('data/al-dene.json?v=141');
        if (!res.ok) throw new Error('The examples list could not be loaded.');
        const data = await res.json();
        const ex = (data.ornekler || []).find((o) => o.no === String(ornekNo));
        if (!ex) throw new Error(`There is no example ${ornekNo}.`);
        const { reading, pixels } = await analyzeBankedPhoto(`ornek/${ex.dosya}?v=141`, ex.seen);
        await ingestReading(reading, pixels, ornekStatus);
        // The credit rides WITH the result, not in a footer nobody reads: these
        // are other people's photographs under a named licence.
        const cite = el('div', 'field-error',
          `example photo: ${ex.kunye.author} · ${ex.kunye.license} · ` +
          'garment labels were banked once and replayed — no API call was made');
        cite.style.color = 'var(--gray)';
        block.appendChild(cite);
      } catch (err) {
        ornekStatus.textContent = err.message;
      }
    })();
  }

  const groups = el('div', 'spec-groups');
  groups.style.marginTop = '34px';

  function rebuild() {
    groups.textContent = '';
    for (const group of SPEC_GROUPS) {
      if (!group.for(spec)) {
        // A hidden picker must not carry a stale choice into the draft: the
        // engine now REFUSES incoherent specs (e.g. a v-neck skirt) instead of
        // silently ignoring the field, so what the user can't see resets to
        // the group default (first option).
        // Not a preference and not a reading: the engine REFUSES an incoherent
        // spec, so this reset is a buildability requirement (§4B md.2) and it is
        // labelled as one instead of quietly looking like a default.
        if (spec[group.key] !== group.options[0][0]) {
          isaretle(koken, group.key, 'zorunlu', 'bilinmiyor', 'bu giyside bu eksen yok');
        }
        spec[group.key] = group.options[0][0];
        continue;
      }
      const g = el('div', 'spec-group');
      g.appendChild(el('div', 'group-label', getLang() === 'tr' ? group.trLabel : group.label));
      const row = el('div', 'choice-row');
      for (const [value, label, trOption] of group.options) {
        const b = el('button', 'choice', getLang() === 'tr' ? trOption : label);
        b.setAttribute('aria-pressed', String(spec[group.key] === value));
        b.addEventListener('click', () => {
          elleSet(group.key, value);   // the user's own hand -> `soruldu`
          // A hand-picked length is an explicit order: drop the photo-measured
          // mm override so mini/midi/maxi does exactly what it says. The latch
          // keeps it dropped across showSpec re-entries (measurement edits)
          // until a NEW photo is analyzed (foto-anı bug fix, 2026-07-27).
          if (group.key === 'skirtLength') { spec.skirtLengthMM = 0; photoLenHandPicked = true; }
          rebuild();
        });
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
      if (result.error || !result.pattern) {
        // The engine refused the spec (unknown value / invalid combination).
        // Show the exact sentence — it names the field and the accepted values;
        // the missing.js honesty layer has already run on the vision path.
        go.disabled = false;
        go.textContent = t('create.draft');
        drafting.textContent = '';
        alert(result.error || (result.issues && result.issues[0]) || t('create.engineerror'));
        return;
      }
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

// The drafted class, Title Case, in ONE place. It was spelled out four times
// across three panels (title, file base, PDF title, grade run) and each copy
// reached into result.pattern for the same field — the kind of repetition the
// closed-enum ratchet (vocab_reference_check) is measuring when it counts
// references to a menu we are supposed to be dismantling, not growing.
const drafted = (result) => result.pattern.garment;
const draftedTitle = (result) => {
  const g = drafted(result);
  return g.charAt(0).toUpperCase() + g.slice(1);
};

function showResult(result) {
  screen.textContent = '';
  screen.className = 'wrap';
  const head = el('div', 'result-head');
  head.appendChild(el('h1', 'screen-title', t('create.result.title', { garment: draftedTitle(result) })));
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

  // §4C md.2: whose body was this drafted to? A stranger who never typed a
  // measurement gets the EU38 standard, and that is a DERIVED value like any
  // other — in centimetres instead of enum words. Marked here, at the one place
  // that knows the answer for certain, so the label cannot drift from the draft.
  isaretle(koken, 'beden', usingDemo ? 'cikarildi' : 'soruldu', 'bilinmiyor',
    usingDemo ? 'kendi ölçün girilmedi, EU38 standardına çizildi' : 'kendi ölçülerin');

  // Take it home. Placed ABOVE the grade panel on purpose: grading is a seller's
  // job, downloading is everyone's, and the phase this shipped in (F-İNDİR)
  // exists because the shopper's job was the one with no button.
  if (!result.issues.length) {
    screen.appendChild(downloadPanel(result));
  }

  // Grade: sellers turn one design into a full EU size run from the same engine.
  // Only offered for a valid draft (a blocked draft has nothing to grade).
  if (!result.issues.length) {
    screen.appendChild(gradePanel(result));
  }
}

// The three files, plus the print-shop A0. Every one of them is written by
// download.js from the pattern already on screen — the same drafted geometry,
// serialized four ways, no second draft and no re-render. A blocked draft never
// reaches here (showResult only calls this when issues is empty), and the DXF
// path refuses again inside the engine for the same reason.
function downloadPanel(result) {
  const panel = el('div', 'dl-panel');
  panel.appendChild(el('h2', 'dl-title', t('create.dl.title')));
  panel.appendChild(el('p', 'dl-sub', t('create.dl.sub')));

  const base = `stitchu-${safeName(drafted(result))}-${safeName(spec.silhouette || spec.skirtStyle || spec.neckline || 'pattern')}`;
  const title = draftedTitle(result);
  const msg = el('p', 'dl-msg', '');

  // KÖKEN, ON THE RESULT SCREEN, BY NAME (F0 gate item 3). The `flatgap`
  // precedent from F-İNDİR spelled out the one axis the pen could not cut; this
  // is the same sentence widened to every axis the PHOTO did not show. It is
  // printed before the buttons, not after a click: the user should know what
  // they are taking home before they take it.
  const derived = ilanEdilecek(koken);
  const kokenSatiri = el('p', 'dl-koken', kokenCumlesi(koken, getLang() === 'tr'));
  kokenSatiri.setAttribute('data-koken-cikarildi', String(derived.length));
  panel.appendChild(kokenSatiri);

  // One handler shape for all four: disable, do the work, report the refusal in
  // words if it comes. A silent no-op button is the failure mode this phase was
  // opened to kill, so nothing here fails quietly (yasak 8).
  const wire = (btn, run) => {
    btn.addEventListener('click', async () => {
      const label = btn.textContent;
      btn.disabled = true; btn.textContent = t('create.dl.working');
      msg.textContent = '';
      try {
        const refusal = await run();
        if (refusal) msg.textContent = t('create.dl.refused', { why: refusal });
      } catch (e) {
        msg.textContent = t('create.dl.refused', { why: e instanceof Error ? e.message : String(e) });
      } finally {
        btn.disabled = false; btn.textContent = label;
      }
    });
  };

  const row = el('div', 'dl-row');
  const pdfBtn = el('button', 'btn', t('create.dl.pdf'));
  // The A4 pack carries the same list on its cover, so the answer survives
  // being printed and read with no browser in the room.
  wire(pdfBtn, () => { saveA4Pdf(result.pattern, title, `${base}-a4.pdf`, koken, KOKEN_ALANLARI); return null; });
  row.appendChild(pdfBtn);

  const svgBtn = el('button', 'btn', t('create.dl.svg'));
  wire(svgBtn, () => { saveSVG(result.pattern, `${base}.svg`); return null; });
  row.appendChild(svgBtn);

  const dxfBtn = el('button', 'btn', t('create.dl.dxf'));
  wire(dxfBtn, () => saveDXF({ kind: 'spec', spec, measurements: values }, `${base}.dxf`));
  row.appendChild(dxfBtn);

  // THE FLAT. The other three buttons are the same drawing serialized three
  // ways — pieces to cut. This one is the other half of the target sentence:
  // the finished-garment technical drawing, drawn from the spec by the same pen
  // the flat gates judge. It is a separate file because it answers a separate
  // question (what IS this), and it comes with the pen's own refusal: any axis
  // the engine cannot cut is named on screen, not swallowed.
  // ⭐ 2026-09-01: THIS BUTTON'S DRAWING NOW COMES OFF THE PATTERN.
  // It used to be the 3D surface line's projection (engine.flatJSON ->
  // web/lib/flat-from-plan.js). That line has no sleeve, no collar and no dart
  // in its types, so what downloaded was a torso outline whatever the shopper
  // picked — and it took 7.5 to 30.9 SECONDS. The drawing is now assembled from
  // the drafted pattern's own 2D panels (engine.draftJSON ->
  // web/lib/flat-from-pattern.js) in single-digit milliseconds, with the
  // armhole, the cap, the darts and the collar all coming out of the very
  // geometry the shopper is about to cut. The switch is SILENT: no counter, no
  // badge, no "you are on the new line" — the shopper sees their garment.
  const flatBtn = el('button', 'btn', t('create.dl.flat'));
  wire(flatBtn, async () => {
    // The flat leaves with the origin record on its root element.
    const eksenler = await saveFlatSVG(spec, { size: FLAT_BEDEN }, `${base}-flat.svg`,
                                       koken, KOKEN_ALANLARI);
    // REFUSALS, ON SCREEN — the wire is kept even though the list is empty
    // today. The pattern line carries every axis create.html offers, so there is
    // no axis to report; the day one cannot be drawn, the drawer names it and
    // this line prints it rather than letting the omission be silent, which is
    // the failure H2 was opened to end.
    //
    // Not a refusal — the file IS on their disk — so it does not go through the
    // refusal string. It is the honest footnote: drawn, but not carried.
    if (eksenler && eksenler.length) {
      msg.textContent = t('create.dl.flataxes', { what: eksenler.join(' · ') });
    }
    return null;
  });
  row.appendChild(flatBtn);
  panel.appendChild(row);

  // ⭐ THE OPERATOR PROGRAM, ON THE RESULT SCREEN (GECE7 / F5-D, K46).
  //
  // Three sub-cards built op.split, op.suppress and op.rotate, each with its own
  // gate, and the referee measured three times that the three headers appeared
  // in ZERO lines of garment.cpp, wasm/bindings.cpp and web/js — the user could
  // not divide a panel, open a dart or move one. This is the surface where they
  // can ask, and where the engine answers in its own words.
  //
  // ⚠ AND THE REFUSAL IS THE ANSWER, NOT AN ERROR. The shipped bodice is a cone
  // and a cone develops exactly: op.suppress refuses it with the panel's own
  // measured deficit. Printing that refusal is the whole point — a button that
  // silently did nothing on the shipped garment would hide that the operator
  // does not touch the product, which is precisely what happened for three
  // cards. The sentence carries the number.
  //
  // ⚠ NO COUNTER, NO BADGE (F3's rule, kept). The panel names the operator and
  // the panel it acted on; it does not tell the shopper which internal line they
  // are on.
  // ⭐ EDİT SATIRI (GECE7 / F7) — indirdiğin şeyi düzenle, yeniden indir.
  //
  // Bu ekran on iki fazdır tek yönlüydü: kalıp çıkıyor, dosya iniyor, bitiyor.
  // Madde 2'nin istediği şey bu değil. Burada kullanıcı ÇİZİLMİŞ kalıbın üstünde
  // iki şey söyleyebiliyor — "şu kadar uzat" ve "fiyonk ekle" — ve dört indirme
  // düğmesi de bundan sonra BAŞKA bir dosya veriyor.
  //
  // ⚠ VE CEVAP SAYIYLA GELİYOR. Uygulandıktan sonra ekran ne değiştiğini ölçüyle
  // yazıyor: hangi parçanın boyu kaç mm oynadı, kaç parça oldu, metraj ne oldu.
  // "Edit uygulandı" cümlesi bir cevap değildir; motorun kendi ölçtüğü mm'dir.
  const editMsg = el('div', 'dl-ops');
  const editRow = el('div', 'dl-edit');
  const uzatLabel = el('label', 'dl-edit-label', t('create.edit.lengthen'));
  const uzat = el('input', 'dl-edit-num');
  uzat.type = 'number'; uzat.min = '0'; uzat.max = '150'; uzat.step = '1'; uzat.value = '0';
  uzatLabel.appendChild(uzat);
  editRow.appendChild(uzatLabel);
  const fiyonkLabel = el('label', 'dl-edit-label', t('create.edit.bow'));
  const fiyonk = el('input', 'dl-edit-check');
  fiyonk.type = 'checkbox';
  fiyonkLabel.insertBefore(fiyonk, fiyonkLabel.firstChild);
  editRow.appendChild(fiyonkLabel);
  const editBtn = el('button', 'dl-alt', t('create.edit.apply'));
  wire(editBtn, async () => {
    editMsg.textContent = '';
    const cm = Number(uzat.value);
    if (!Number.isFinite(cm) || cm < 0) return t('create.edit.badnum');
    // ÖNCE ölç, sonra yaz: the same three numbers, before and after, off the
    // engine's own draft rather than off this file's expectations.
    const oncePiece = result.pattern.pieces.length;
    const onceMeters = result.pattern.fabricMeters140;
    const boyOf = (p) => {
      const pc = (p.pieces || []).find((x) => x.name === 'Skirt Front' || x.name === 'Bodice Front');
      if (!pc) return null;
      const ys = (pc.commands || []).filter((c) => c.type !== 'close').map((c) => c.y);
      return ys.length ? Math.max(...ys) - Math.min(...ys) : null;
    };
    const onceBoy = boyOf(result.pattern);
    spec.editExtendMM = cm * 10;
    spec.editAttach = fiyonk.checked ? 1 : 0;
    const yeni = await draft(spec, values);
    if (yeni.error || !yeni.pattern) return yeni.error || (yeni.issues && yeni.issues[0]) || '';
    result.pattern = yeni.pattern;
    result.issues = yeni.issues;
    const sonraBoy = boyOf(yeni.pattern);
    editMsg.appendChild(el('p', 'dl-ops-title', t('create.edit.head')));
    if (onceBoy !== null && sonraBoy !== null)
      editMsg.appendChild(el('p', 'dl-ops-yes', t('create.edit.length', {
        once: onceBoy.toFixed(1), sonra: sonraBoy.toFixed(1),
      })));
    editMsg.appendChild(el('p', 'dl-ops-yes', t('create.edit.pieces', {
      once: String(oncePiece), sonra: String(yeni.pattern.pieces.length),
    })));
    editMsg.appendChild(el('p', 'dl-ops-yes', t('create.edit.yardage', {
      once: String(onceMeters), sonra: String(yeni.pattern.fabricMeters140),
    })));
    return null;
  });
  editRow.appendChild(editBtn);
  panel.appendChild(editRow);
  panel.appendChild(editMsg);

  const opsMsg = el('div', 'dl-ops');
  const opsBtn = el('button', 'dl-alt', t('create.ops.run'));
  wire(opsBtn, async () => {
    opsMsg.textContent = '';
    // The same size the FLAT is valued at on this screen, so the two readings
    // answer about one garment rather than two.
    const prog = await operatorProgram(FLAT_BEDEN, 0);
    if (prog.error) return prog.error;
    opsMsg.appendChild(el('p', 'dl-ops-title', t('create.ops.head')));
    // ⭐ BOTH DECLARED SURFACES, EACH BY NAME (F5-E İŞ 2, borç 68).
    //
    // This loop used to read a single `prog.adimlar`, and that single reading was
    // the shipped cone. Measured consequence: `op.split` was the ONLY operator a
    // shopper could ever see act — 2 applied against 26 refused — because on a
    // cone op.suppress has nothing to absorb and op.rotate has nothing to move.
    // The second surface is where they do act, and it is printed with the
    // engine's OWN `yuzey` sentence rather than a wording invented here, so the
    // reader can see WHICH garment each answer is about. Not a hidden dial: the
    // shipped reading is still first and still says its own name.
    for (const okuma of (prog.okumalar || [])) {
      opsMsg.appendChild(el('p', 'dl-ops-surface', okuma.yuzey || okuma.etiket || ''));
      for (const step of (okuma.adimlar || [])) {
        const line = el('p', step.uygulandi ? 'dl-ops-yes' : 'dl-ops-no',
          `${step.op} · ${step.panel} — ${step.uygulandi ? t('create.ops.did') : t('create.ops.didnt')}`);
        // The engine's own sentence, with the engine's own number in it. Not
        // re-worded here: a second wording is a second truth.
        line.appendChild(el('span', 'dl-ops-why', ` ${step.sebep}`));
        opsMsg.appendChild(line);
      }
    }
    return null;
  });
  panel.appendChild(opsBtn);
  panel.appendChild(opsMsg);

  // A0 is a print-shop errand, not a home one, so it is a link and not a fourth
  // equal button — but it is offered, because pdf-core builds it for free and a
  // single-sheet pattern is what a copy shop actually wants.
  const a0 = el('button', 'dl-alt', t('create.dl.a0'));
  wire(a0, () => { saveA0Pdf(result.pattern, title, `${base}-a0.pdf`); return null; });
  panel.appendChild(a0);

  panel.appendChild(msg);
  return panel;
}

// The sizes the ENGINE publishes a shape ratio for, not the sizes the body
// chart happens to list. Source: contract/layers/shape-ratios.json `sizes`
// (8 labels, EU34..EU48). engine/src/shaperatios.gen.hpp:21 says it in the
// engine's own words: "Sizes absent here (EU50/EU52) have no published ratio
// and keep 0" — i.e. EU50/EU52 would enter the draft with bustBackFrac = 0
// and shoulderWidthCM = 0. Offering them here would be offering a size the
// engine cannot shape. If shape-ratios.json grows, this list grows with it.
const EU_SIZES = ['EU34', 'EU36', 'EU38', 'EU40', 'EU42', 'EU44', 'EU46', 'EU48'];

// The size the RESULT SCREEN's flat and operator panel are valued at. Written
// once, here, because H3 made the flat require a body: `download.js` used to
// carry a default 'EU38' of its own and a default in the exporter is exactly
// the silent size RULES invariant 1 forbids. The engine now refuses a body with
// no size, so this screen has to name one — and it names it in ONE place.
const FLAT_BEDEN = 'EU38';

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
      const all = graded.sizes || [];
      const sizes = all.filter((s) => !s.draft.issues.length);
      // RULES invariant 1: a size the engine refuses is REFUSED BY NAME, never
      // dropped in silence. Before this, only a count reached the user and the
      // print stamp still carried the label they had picked.
      const refused = all.filter((s) => s.draft.issues.length);
      if (!sizes.length) {
        msg.style.color = '#8f2038';
        msg.textContent = t('create.grade.none');
        go.disabled = false;
        return;
      }
      msg.textContent = refused.length
        ? t('create.grade.done.some', {
            n: sizes.length,
            names: refused.map((s) => s.size).join(', '),
          })
        : t('create.grade.done', { n: sizes.length });
      // And the reason, per size, under the message.
      panel.querySelectorAll('.grade-refused').forEach((n) => n.remove());
      for (const r of refused) {
        const first = r.draft.issues[0];
        const why = typeof first === 'string' ? first : (first && (first.message || first.code)) || '';
        const line = el('p', 'grade-refused', t('create.grade.refused.detail', { size: r.size, issue: why }));
        line.style.color = '#8f2038';
        line.style.fontSize = '12px';
        panel.appendChild(line);
      }
      if (nestRadio.checked) printGradeNested(sizes, drafted(result));
      else printGrade(sizes, drafted(result));
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
