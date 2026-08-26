// Thin loader for the WASM engine (web/vendor/stitchu-engine.js, built by
// engine/build-wasm.sh). draft() returns {pattern, issues}; non-empty issues
// means the validator blocked the draft, callers must not show a PDF.
let enginePromise = null;

import { VOCAB, canonical } from './vocab.gen.js?v=136';

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
      script.src = 'vendor/stitchu-engine.js?v=136';
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

/** The KALIP reading — human body, real seam allowance. What gets sewn. */
export async function seamPlanPattern(sizeLabel, neckDropMM = 0) {
  const engine = await loadEngine();
  return JSON.parse(engine.planJSON(String(sizeLabel), Number(neckDropMM) || 0));
}

/** The FLAT reading — the technical drawing. What gets sold. */
export async function seamPlanFlat(sizeLabel, neckDropMM = 0) {
  const engine = await loadEngine();
  return JSON.parse(engine.flatJSON(String(sizeLabel), Number(neckDropMM) || 0));
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
export function engineSpec(spec) {
  return {
    garment: spec.garment,
    shaping: spec.shaping ?? 'dart',
    waistline: spec.waistline ?? 'natural',
    fabric: spec.fabric ?? 'woven',
    // KUMAŞ EKSENİ (F-H): -1 = undeclared, the fabric word's own band drives.
    fabricStretchPct: (typeof spec.fabricStretchPct === 'number' && spec.fabricStretchPct >= 0)
      ? Math.min(spec.fabricStretchPct, 100) : -1,
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
