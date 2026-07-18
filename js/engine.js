// Thin loader for the WASM engine (web/vendor/stitchu-engine.js, built by
// engine/build-wasm.sh). draft() returns {pattern, issues}; non-empty issues
// means the validator blocked the draft, callers must not show a PDF.
let enginePromise = null;

import { VOCAB, canonical } from './vocab.gen.js?v=81';

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
export function backSlitValue(spec) { return intValue('backSlit', spec && spec.backSlit); }
export function ruffledStrapsValue(spec) { return intValue('ruffledStraps', spec && spec.ruffledStraps); }
export function peplumValue(spec) { return intValue('peplum', spec && spec.peplum); }
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

export function loadEngine() {
  if (!enginePromise) {
    enginePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'vendor/stitchu-engine.js?v=81';
      script.onload = () => window.createStitchuEngine().then(resolve, reject);
      script.onerror = () => reject(new Error('engine failed to load'));
      document.head.appendChild(script);
    });
  }
  return enginePromise;
}

// Grade a design across a standard EU size run (fromLabel..toLabel). Returns
// { sizes: [{ size, draft: {pattern, issues} }, ...] }, the seller deliverable.
export async function grade(spec, fromLabel, toLabel) {
  const engine = await loadEngine();
  let json;
  try {
    json = engine.gradeJSON(
    spec.garment, spec.shaping ?? 'dart', spec.waistline ?? 'natural', spec.fabric ?? 'woven',
    spec.neckline ?? 'crew',
    spec.sleeveStyle ?? 'none', spec.sleeveLength ?? 'short',
    spec.skirtStyle ?? 'aLine', spec.skirtLength ?? 'midi', spec.topLength ?? 'hip',
    (spec.ruffle ?? 'none') !== 'none', spec.ruffle === 'tiered' ? 3 : 1,
    spec.keyhole === 'keyhole',
    fromLabel, toLabel,
    spec.frontPlacket === true,
    tieClosureValue(spec), // Loop 4b: fabric ties / sash / bow
    sleeveCapValue(spec),  // Loop 6: gathered/puff sleeve head
    collarTypeValue(spec), // Loop 7/8: collar family
    collarEdgeValue(spec), // Loop 7/8: flat-family outer edge
    gatherTypeValue(spec), // Loop 8: drawstring/shirred/smocked gathering
    gatherZoneValue(spec), // Loop 8: gather zone
    backOpeningValue(spec), // Loop 9b: open-back cutout
    backSlitValue(spec),    // Loop M1: back hem slit / walking vent
    ruffledStrapsValue(spec), // queue #3: ruffled shoulder straps
    peplumValue(spec),      // R1.1: peplum flare
    placketStyleValue(spec), // R1.2: asymmetric placket
    edgeFinishValue(spec),  // patch 3.10: neckline/armhole edge finish
    pocketStyleValue(spec),  // patch 3.12: patch / side-seam pocket
    cuffStyleValue(spec),   // patch 3.13: sleeve-end cuff
    hemShapeValue(spec),    // patch 3.15: hem shape
    shoulderStyleValue(spec), // patch 3.13: dropped shoulder / raglan
    buttonRowValue(spec),   // vocab: button row
    exposedZipValue(spec),  // vocab: exposed zipper
    backDetailValue(spec),  // vocab: back detail
    bardotStyleValue(spec), // vocab: off-shoulder / bardot
    );
  } catch (e) {
    // Invalid spec value (thrown by intValue or the WASM boundary): no size
    // run, the message names the field and the accepted values.
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg, sizes: [], issues: [msg] };
  }
  return JSON.parse(json);
}

export async function draft(spec, measurements) {
  const engine = await loadEngine();
  let json;
  try {
    json = engine.draftJSON(
    spec.garment, spec.shaping ?? 'dart', spec.waistline ?? 'natural', spec.fabric ?? 'woven',
    spec.neckline ?? 'crew',
    spec.sleeveStyle ?? 'none', spec.sleeveLength ?? 'short',
    spec.skirtStyle ?? 'aLine', spec.skirtLength ?? 'midi', spec.topLength ?? 'hip',
    (spec.ruffle ?? 'none') !== 'none', spec.ruffle === 'tiered' ? 3 : 1,
    spec.keyhole === 'keyhole',
    measurements.bust, measurements.waist, measurements.hip, measurements.shoulder,
    measurements.backLength, measurements.armLength, measurements.neck,
    measurements.upperBust || 0, // optional full-bust adjustment
    spec.frontPlacket === true,  // Loop 3: front button placket
    tieClosureValue(spec),       // Loop 4b: fabric ties / sash / bow
    sleeveCapValue(spec),        // Loop 6: gathered/puff sleeve head
    collarTypeValue(spec),       // Loop 7/8: collar family
    collarEdgeValue(spec),       // Loop 7/8: flat-family outer edge
    gatherTypeValue(spec),       // Loop 8: drawstring/shirred/smocked gathering
    gatherZoneValue(spec),       // Loop 8: gather zone
    backOpeningValue(spec),      // Loop 9b: open-back cutout
    backSlitValue(spec),         // Loop M1: back hem slit / walking vent
    ruffledStrapsValue(spec),    // queue #3: ruffled shoulder straps
    peplumValue(spec),           // R1.1: peplum flare
    placketStyleValue(spec),     // R1.2: asymmetric placket
    edgeFinishValue(spec),       // patch 3.10: neckline/armhole edge finish
    pocketStyleValue(spec),      // patch 3.12: patch / side-seam pocket
    cuffStyleValue(spec),        // patch 3.13: sleeve-end cuff
    hemShapeValue(spec),         // patch 3.15: hem shape
    shoulderStyleValue(spec),    // patch 3.13: dropped shoulder / raglan
    buttonRowValue(spec),        // vocab: button row
    exposedZipValue(spec),       // vocab: exposed zipper
    backDetailValue(spec),       // vocab: back detail
    bardotStyleValue(spec),      // vocab: off-shoulder / bardot
    );
  } catch (e) {
    // Invalid spec value: no pattern, no PDF. The message names the field and
    // the accepted values; issues carries it so every existing guard blocks.
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg, pattern: null, issues: [msg] };
  }
  return JSON.parse(json);
}
