// Thin loader for the WASM engine (web/vendor/stitchu-engine.js, built by
// engine/build-wasm.sh). draft() returns {pattern, issues}; non-empty issues
// means the validator blocked the draft, callers must not show a PDF.
let enginePromise = null;

import { VOCAB, canonical } from './vocab.gen.js?v=144';
// KUMAŞ KATALOĞU (F6): the three presets a shopper can pick, each carrying its
// four measured numbers. `unset` overlays nothing.
import { applyFabricPreset } from './fabric-catalog.js?v=144';

// Int-enum lookup against the generated vocabulary (engine/vocab.json).
// ABSENT (undefined/null/'') means "the default" and maps to 0 — absence is
// not a wrong word. A PRESENT but unknown value THROWS: silence here is how
// 'puff' once drafted a sleeveless dress and nobody saw it.
function intValue(field, v) {
  if (v === undefined || v === null || v === '') return 0;
  const c = canonical(field, v);
  if (c === undefined) {
    throw new Error(`invalid ${field} '${v}' (valid: ${VOCAB[field].values.join(', ')})`);
  }
  return VOCAB[field].values.indexOf(c);
}

export function tieClosureValue(spec) { return intValue('tieClosure', spec && spec.tieClosure); }
export function sleeveCapValue(spec) { return intValue('sleeveCap', spec && spec.sleeveCap); }
export function collarTypeValue(spec) { return intValue('collarType', spec && spec.collarType); }
export function collarEdgeValue(spec) { return intValue('collarEdge', spec && spec.collarEdge); }
export function gatherTypeValue(spec) { return intValue('gatherType', spec && spec.gatherType); }
export function gatherZoneValue(spec) { return intValue('gatherZone', spec && spec.gatherZone); }
export function backOpeningValue(spec) { return intValue('backOpening', spec && spec.backOpening); }
export function laceUpBackValue(spec) { return intValue('laceUpBack', spec && spec.laceUpBack); }
export function wrapFrontValue(spec) { return intValue('wrapFront', spec && spec.wrapFront); }
export function backSlitValue(spec) { return intValue('backSlit', spec && spec.backSlit); }
export function ruffledStrapsValue(spec) { return intValue('ruffledStraps', spec && spec.ruffledStraps); }
export function peplumValue(spec) { return intValue('peplum', spec && spec.peplum); }
export function hemFlounceValue(spec) { return intValue('hemFlounce', spec && spec.hemFlounce); }
export function pocketStyleValue(spec) { return intValue('pocketStyle', spec && spec.pocketStyle); }
// The legacy frontPlacket bool maps to Standard; asymmetric is the new mode.
export function placketStyleValue(spec) {
  if (spec && spec.placketStyle) return intValue('placketStyle', spec.placketStyle);
  return spec && spec.frontPlacket === true ? 1 : 0;
}
export function edgeFinishValue(spec) { return intValue('edgeFinish', spec && spec.edgeFinish); }
export function cuffStyleValue(spec) { return intValue('cuffStyle', spec && spec.cuffStyle); }
export function hemShapeValue(spec) { return intValue('hemShape', spec && spec.hemShape); }
export function shoulderStyleValue(spec) { return intValue('shoulderStyle', spec && spec.shoulderStyle); }
export function buttonRowValue(spec) { return intValue('buttonRow', spec && spec.buttonRow); }
export function exposedZipValue(spec) { return intValue('exposedZip', spec && spec.exposedZip); }
export function backDetailValue(spec) { return intValue('backDetail', spec && spec.backDetail); }
export function bardotStyleValue(spec) { return intValue('bardotStyle', spec && spec.bardotStyle); }
export function cupSeamValue(spec) { return intValue('cupSeam', spec && spec.cupSeam); }
export function yokeValue(spec) { return intValue('yoke', spec && spec.yoke); }
export function boxPleatValue(spec) { return intValue('boxPleat', spec && spec.boxPleat); }

export function loadEngine() {
  if (!enginePromise) {
    enginePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'vendor/stitchu-engine.js?v=144';
      script.onload = () => window.createStitchuEngine().then(resolve, reject);
      script.onerror = () => reject(new Error('engine failed to load'));
      document.head.appendChild(script);
    });
  }
  return enginePromise;
}

// ---- THE SEAM PLAN, BOTH READINGS (GECE7 / F3) ----------------------------
//
// ONE object, two readings, and the browser gets them from the SAME wasm
// functions the native seam-plan tool and the tek_nesne_check gate call. That
// is not a convention: measured 2026-08-26, the wasm bundle and the native
// binary print the SAME node id for EU38 and the same id after a 20mm neck
// drop. Two engines would not.
//
// ⚠ THE ID ITSELF MOVED IN GECE7 / F5-A AND THAT IS THE POINT (K24). It used to
// be 3f3869aaee8b56b1 / 35eb8d7cf33be3ef; it is now 0c1d52866882ce53 /
// d90bb6c4e1b3554d because nodeId() folds in the DRAWN SILHOUETTE, which it
// previously did not. The referee's mutation HM-F2 made the back technical
// drawing literally the front one and this token did not budge; it does now.
// The numbers are not restated as a gate anywhere — tests/tek_nesne_check.mjs
// reads them off the engine, so a stale pair here can never make a gate lie.
//
// `dugum` is the shared-ancestor token. A flat and a pattern carrying the same
// one came out of one object; carrying different ones, they did not — whatever
// the surrounding prose says.
//
// An unknown size comes back as { error }. It is NOT normalised to EU38 here:
// silently substituting a size is how somebody sews a garment for a body that
// was never asked about (RULES invariant 1).

// ⭐ H2 — BOTH READINGS NOW TAKE THE SPEC.
//
// They used to take (sizeLabel, neckDropMM): two scalars, and the site passed
// 0 for the drop from every call site. So the shopper's neckline, skirt style
// and fabric drove `draftJSON` (the 2D formula line) and drove NOTHING here —
// the flat was byte-identical for a crew and for a v-neck. The signature is now
// the SAME (spec, body) pair draftJSON takes, so one spec moves one object and
// both readings come out of it.
//
// `body.size` is the published EU label the surface is valued at and it is
// REQUIRED — a missing one comes back as { error }, not as a silent EU38.
// Every axis the surface line cannot carry comes back in
// `desteklenmeyen_eksenler`, and create.js prints it on screen.

// ⛔ BOTH READINGS TAKE THE SPEC THROUGH engineSpec(), LIKE EVERY OTHER CALL.
// They did not, and it was not cosmetic: the WASM boundary takes the axis words
// as INTEGERS (`intValue` above turns 'none' into 0, 'bow' into 1, ...). Handing
// it the raw shopper spec meant every one of those fields arrived as a string,
// came back out of `numField` as NaN, and the engine refused by name —
// "invalid tieClosure NaN". Measured 2026-09-01: the flat download failed 5
// times out of 5 from create.html and nothing downloaded at all. Lines 156, 311
// and 328 of this same file had always called engineSpec(); these two were the
// two that did not.
/** The KALIP reading — human body, real seam allowance. What gets sewn. */
export async function seamPlanPattern(spec, body) {
  const engine = await loadEngine();
  return JSON.parse(engine.planJSON(engineSpec(spec), body));
}

/** The FLAT reading — the 3D SURFACE line. Kept for research and cross-checking
 *  against the drawing; NOT what the shopper downloads any more (see
 *  flatDrawing below and the header of web/lib/flat-from-pattern.js). */
export async function seamPlanFlat(spec, body) {
  const engine = await loadEngine();
  return JSON.parse(engine.flatJSON(engineSpec(spec), body));
}

/**
 * ⭐ THE OPERATOR PROGRAM — op.split / op.suppress / op.rotate ON THIS GARMENT.
 *
 * Three sub-cards built three real operators and until F5-D a user could not
 * reach any of them: `panelsplit.hpp`, `dartsuppress.hpp` and `dartrotate.hpp`
 * appeared in ZERO lines of garment.cpp, wasm/bindings.cpp and web/js (the
 * referee measured it three times, K46). This is the wire.
 *
 * Returns the engine's own answers, REFUSALS INCLUDED and each one carrying the
 * number it was refused on — the shipped bodice is a cone, op.suppress refuses
 * it (deficit −1.9628°) and that refusal IS the product's answer. A silent empty
 * result would be a §0B violation, so callers get steps where every one has
 * `uygulandi`, `plana_yazildi`, `ret_gerekcesi` and a `sebep`.
 *
 * ⭐ TWO READINGS, NOT ONE (F5-E İŞ 2, borç 68). The shape is now
 * `{ okumalar: [ { etiket, yuzey, adimlar[] }, … ] }`. Until this change the
 * browser only ever built the shipped cone, and on a cone op.suppress and
 * op.rotate can only ever REFUSE: the referee measured 2 applied / 26 refused,
 * with `op.split` the only operator that ever acted. A user could divide a panel
 * and never open or move a dart. The second reading is the body-following bodice
 * where they do act (30 applied / 10 refused) — declared BY NAME on its own
 * `yuzey` string, not a hidden dial, and the shipped reading is still first and
 * still unchanged.
 *
 * The program runs on a COPY of the seam plan: the pattern and the flat this
 * page draws do not move.
 */
export async function operatorProgram(sizeLabel, neckDropMM = 0) {
  const engine = await loadEngine();
  return JSON.parse(engine.opsJSON(String(sizeLabel), Number(neckDropMM) || 0));
}

// Grade a design across a standard EU size run (fromLabel..toLabel). Returns
// { sizes: [{ size, draft: {pattern, issues} }, ...] }, the seller deliverable.
export async function grade(spec, fromLabel, toLabel) {
  const engine = await loadEngine();
  let json;
  try {
    json = engine.gradeJSON(engineSpec(spec), { from: fromLabel, to: toLabel });
  } catch (e) {
    // Invalid spec value (thrown by intValue or the WASM boundary): no size
    // run, the message names the field and the accepted values.
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg, sizes: [], issues: [msg] };
  }
  return JSON.parse(json);
}

// The single named-object spec the WASM boundary takes (34 positional args
// died 2026-07-18 — a one-slot shift silently drafted a different dress).
// Exported so the API round-trip test (engine/tests/api_wire_check.mjs) can
// prove the web path and the backend path hand the SAME values to the engine.
// F6 axis numbers: a real measurement passes through, anything else is -1
// (UNDECLARED). Never coerce a missing measurement to 0 — 0 is a claim.
function axisNum(v) {
  return (typeof v === 'number' && isFinite(v) && v >= 0) ? v : -1;
}

export function engineSpec(rawSpec) {
  // F6: a chosen kumaş preset is folded in HERE, at the single chokepoint every
  // caller already goes through, so the pattern the browser downloads and the
  // pattern the API returns are drafted from the same numbers.
  const spec = applyFabricPreset(rawSpec);
  return {
    garment: spec.garment,
    shaping: spec.shaping ?? 'dart',
    waistline: spec.waistline ?? 'natural',
    fabric: spec.fabric ?? 'woven',
    // KUMAŞ EKSENİ (F-H): -1 = undeclared, the fabric word's own band drives.
    fabricStretchPct: (typeof spec.fabricStretchPct === 'number' && spec.fabricStretchPct >= 0)
      ? Math.min(spec.fabricStretchPct, 100) : -1,
    // F6: the other three numbers of the axis. -1 = undeclared (contract/
    // the kumaş catalog). Recovery/growth are a CONDITION on the negative
    // branch; weight+bending length give the FAST-2 drape number; width drives
    // the yardage. An undeclared number never reaches the draft.
    fabricRecovery15sPct: axisNum(spec.fabricRecovery15sPct),
    fabricRecovery30minPct: axisNum(spec.fabricRecovery30minPct),
    fabricGrowthPct: axisNum(spec.fabricGrowthPct),
    fabricWeightGSM: axisNum(spec.fabricWeightGSM),
    fabricBendingLengthMM: axisNum(spec.fabricBendingLengthMM),
    fabricWidthCM: axisNum(spec.fabricWidthCM),
    neckline: spec.neckline ?? 'crew',
    sleeveStyle: spec.sleeveStyle ?? 'none',
    sleeveLength: spec.sleeveLength ?? 'short',
    skirtStyle: spec.skirtStyle ?? 'aLine',
    skirtLength: spec.skirtLength ?? 'midi',
    // Foto-oran kablosu: continuous mm target (0 = off, the table drives).
    skirtLengthMM: (typeof spec.skirtLengthMM === 'number' && spec.skirtLengthMM > 0) ? spec.skirtLengthMM : 0,
    topLength: spec.topLength ?? 'hip',
    ruffleHem: (spec.ruffle ?? 'none') !== 'none',
    ruffleTiers: spec.ruffle === 'tiered' ? 3 : 1,
    keyhole: spec.keyhole === 'keyhole',
    frontPlacket: spec.frontPlacket === true,
    tieClosure: tieClosureValue(spec),
    sleeveCap: sleeveCapValue(spec),
    collarType: collarTypeValue(spec),
    collarEdge: collarEdgeValue(spec),
    gatherType: gatherTypeValue(spec),
    gatherZone: gatherZoneValue(spec),
    backOpening: backOpeningValue(spec),
    laceUpBack: laceUpBackValue(spec),
    wrapFront: wrapFrontValue(spec),
    backSlit: backSlitValue(spec),
    ruffledStraps: ruffledStrapsValue(spec),
    peplum: peplumValue(spec),
    hemFlounce: hemFlounceValue(spec),
    placketStyle: placketStyleValue(spec),
    edgeFinish: edgeFinishValue(spec),
    pocketStyle: pocketStyleValue(spec),
    cuffStyle: cuffStyleValue(spec),
    hemShape: hemShapeValue(spec),
    shoulderStyle: shoulderStyleValue(spec),
    buttonRow: buttonRowValue(spec),
    exposedZip: exposedZipValue(spec),
    backDetail: backDetailValue(spec),
    bardotStyle: bardotStyleValue(spec),
    cupSeam: cupSeamValue(spec),
    yoke: yokeValue(spec),
    boxPleat: boxPleatValue(spec),
    // ⭐ EDİT KATMANI (GECE7 / F7) — "10 cm uzat" ve "fiyonk ekle" burada,
    // motora giden TEK boğazda. İkisi de OPT-IN: bildirilmemiş bir edit
    // taslağı bayt-birebir bırakır (RULES 4).
    //   editExtendMM  etek ucuna GRAIN yönünde eklenen mm (0 = kapalı).
    //                 Negatif değer kısaltma demektir ve motor onu bir SAYIYLA
    //                 reddeder; burada 0'a kırpılmaz, olduğu gibi geçer, çünkü
    //                 sessizce yutulan bir istek kullanıcıya yalan söyler.
    //   editAttach    0 = yok, 1 = fiyonk. Yeni bir PARÇA doğar, çift çentik
    //                 düşer ve metraj değişir (patternedit.hpp).
    editExtendMM: (typeof spec.editExtendMM === 'number' && Number.isFinite(spec.editExtendMM))
      ? spec.editExtendMM : 0,
    // F7-edit: üç mm alanı daha, aynı yasayla — sonlu sayı olduğu gibi geçer,
    // negatifi motor ADIYLA reddeder (kısaltma ≠ negatif uzatma; patternedit.cpp
    // ikisini ayrı operatör olarak kendi cümlesiyle söyler).
    editShortenMM: (typeof spec.editShortenMM === 'number' && Number.isFinite(spec.editShortenMM))
      ? spec.editShortenMM : 0,
    editSleeveExtendMM: (typeof spec.editSleeveExtendMM === 'number' && Number.isFinite(spec.editSleeveExtendMM))
      ? spec.editSleeveExtendMM : 0,
    editNeckDeepenMM: (typeof spec.editNeckDeepenMM === 'number' && Number.isFinite(spec.editNeckDeepenMM))
      ? spec.editNeckDeepenMM : 0,
    editAttach: spec.editAttach === 'bow' || spec.editAttach === 1 ? 1 : 0,
  };
}

// Recipe path (PIPELINE Aşama 2 kanvas): recipe JSON text + measurements (cm)
// + params in, the SAME {pattern, issues} shape out as draft(), so render.js /
// sheet.js / print.js consume both paths identically. The C++ interpreter
// enforces the whole contract (docs/RECETE-SPEC.md): undeclared param,
// out-of-range value, missing measurement all come back as an honest error in
// `error` + `issues`, never a silent default.
export async function draftRecipe(recipeText, measurements, params) {
  const engine = await loadEngine();
  let json;
  try {
    json = engine.draftRecipeJSON(recipeText, {
      bust: measurements.bust || 0, waist: measurements.waist || 0, hip: measurements.hip || 0,
      shoulder: measurements.shoulder || 0, backLength: measurements.backLength || 0,
      armLength: measurements.armLength || 0, neck: measurements.neck || 0,
      upperBust: measurements.upperBust || 0,
    }, params || {});
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg, pattern: null, issues: [msg] };
  }
  return JSON.parse(json);
}

// DXF-AAMA/ASTM export at the recipe boundary (PIPELINE Aşama 5, in-browser).
// Same recipe + measurements + params as draftRecipe → the industry interchange
// file for THIS body, straight from the motor's mm geometry. Returns
// { dxf: '<R12 text>' } on success or { error, dxf: null } on an honest refusal
// (out-of-range param, missing measurement, unknown recipe, validator block).
// The wasm output is byte-identical to the native dxf-export tool the outside-
// CAD proof runs on (ctest dxf_wasm_parity): what downloads here is the exact
// geometry ezdxf verified, not a redraw.
export async function dxfRecipe(recipeText, measurements, params) {
  const engine = await loadEngine();
  let json;
  try {
    json = engine.dxfRecipeJSON(recipeText, {
      bust: measurements.bust || 0, waist: measurements.waist || 0, hip: measurements.hip || 0,
      shoulder: measurements.shoulder || 0, backLength: measurements.backLength || 0,
      armLength: measurements.armLength || 0, neck: measurements.neck || 0,
      upperBust: measurements.upperBust || 0,
    }, params || {});
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg, dxf: null };
  }
  return JSON.parse(json);
}

// DXF-AAMA/ASTM export at the SPEC boundary — the create.html shopper's path.
// dxfRecipe() only serves the recipe DSL (studio.html), and the photo -> pattern
// flow has no recipe text, so this is what lets a create.html user take the
// industry file home. Same spec + body draftJSON drafted, serialized by the same
// dxf::exportPattern: the download is the motor's own mm geometry, not a redraw.
// { dxf } on success, { error, dxf: null } on an honest refusal (bad enum,
// unusable body, validator-blocked draft).
export async function dxfSpec(spec, measurements) {
  const engine = await loadEngine();
  let json;
  try {
    json = engine.dxfSpecJSON(engineSpec(spec), {
      bust: measurements.bust, waist: measurements.waist, hip: measurements.hip,
      shoulder: measurements.shoulder, backLength: measurements.backLength,
      armLength: measurements.armLength, neck: measurements.neck,
      upperBust: measurements.upperBust || 0,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg, dxf: null };
  }
  return JSON.parse(json);
}

export async function draft(spec, measurements) {
  const engine = await loadEngine();
  let json;
  try {
    json = engine.draftJSON(engineSpec(spec), {
      bust: measurements.bust, waist: measurements.waist, hip: measurements.hip,
      shoulder: measurements.shoulder, backLength: measurements.backLength,
      armLength: measurements.armLength, neck: measurements.neck,
      upperBust: measurements.upperBust || 0,
    });
  } catch (e) {
    // Invalid spec value: no pattern, no PDF. The message names the field and
    // the accepted values; issues carries it so every existing guard blocks.
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg, pattern: null, issues: [msg] };
  }
  return JSON.parse(json);
}

// ---------------------------------------------------------------------------
// THE TECHNICAL DRAWING — FROM THE PATTERN, NOT FROM THE SURFACE
// ---------------------------------------------------------------------------
// The shipped flat is drawn from draftJSON's own 2D pieces. The reasoning, the
// measurements behind it and what it replaced are in web/lib/flat-from-pattern.js
// and are not restated here.
import { CONTRACT } from './contract.gen.js?v=144';
import { renderFlatFromPattern } from '../lib/flat-from-pattern.js?v=144';

/** The published EU chart body, from the SAME contract table the engine's own
 *  size chart is generated from. An unknown label is refused by name — a
 *  silently substituted size is a garment sewn for a body nobody asked about
 *  (RULES invariant 1). */
export function bodyForSize(label) {
  const chart = CONTRACT.draft.euSizeChart, fields = CONTRACT.draft.euSizeChartFields;
  const row = chart[label];
  if (!Array.isArray(row)) {
    throw new Error(`unknown size '${label}' (valid: ${Object.keys(chart).join(', ')})`);
  }
  const g = (n) => row[fields.indexOf(n)];
  return { bust: g('bustCM'), waist: g('waistCM'), hip: g('hipCM'), shoulder: g('shoulderCM'),
           backLength: g('backLengthCM'), armLength: g('armLengthCM'), neck: g('neckCM') };
}

/**
 * The shared-ancestor token, computed over the DRAFTED PATTERN ITSELF.
 *
 * The surface line's `dugum` was a hash of the surface's own inputs. This one is
 * stronger and needs no second implementation to trust: two files carrying the
 * same token were written from the same drafted geometry, byte for byte, so a
 * flat and a pattern that disagree cannot both carry it. FNV-1a, 64 bit, over
 * the engine's own JSON text.
 */
export function patternDugum(patternJSONText) {
  let h = 0xcbf29ce484222325n;
  const s = String(patternJSONText);
  for (let i = 0; i < s.length; i++) {
    h ^= BigInt(s.charCodeAt(i) & 0xff);
    h = (h * 0x100000001b3n) & 0xffffffffffffffffn;
  }
  return h.toString(16).padStart(16, '0');
}

/**
 * THE TECHNICAL FLAT for one spec at one published size.
 *
 * `body` is either a measured body (bust/waist/... in cm) or `{ size: 'EU38' }`.
 * Returns { svg, dugum, beden, issues }. It REFUSES rather than draw a lie: a
 * validator-blocked draft comes back as a throw with the engine's own words, so
 * a blocked pattern can never leave as a picture that looks fine.
 */
export async function flatDrawing(spec, body, arka = null) {
  const engine = await loadEngine();
  const beden = body && body.size ? String(body.size) : null;
  const m = beden ? bodyForSize(beden) : body;
  const es = engineSpec(spec);
  const text = engine.draftJSON(es, {
    bust: m.bust, waist: m.waist, hip: m.hip, shoulder: m.shoulder,
    backLength: m.backLength, armLength: m.armLength, neck: m.neck,
    upperBust: m.upperBust || 0,
  });
  const drafted = JSON.parse(text);
  if (drafted.error) throw new Error(drafted.error);
  const dugum = patternDugum(text);
  const svg = renderFlatFromPattern(drafted, {
    beden: beden || '', dugum,
    sinif: { garment: es.garment, shaping: es.shaping, fabric: es.fabric },
    // F3-arka: 'gorulen' | 'uydurma' | 'soruldu' | 'cikarildi' | null.
    // null = the caller carries no köken record; the drawing then claims
    // nothing about the back either way (research/legacy paths stay byte-same).
    arka,
  });
  return { svg, dugum, beden: beden || '', issues: drafted.issues || [] };
}
