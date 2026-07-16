// Thin loader for the WASM engine (web/vendor/stitchu-engine.js, built by
// engine/build-wasm.sh). draft() returns {pattern, issues}; non-empty issues
// means the validator blocked the draft, callers must not show a PDF.
let enginePromise = null;

// TiePlacement enum (must match engine/src/tie.hpp order). 0 = None.
const TIE_PLACEMENT = {
  none: 0, backWaist: 1, backWaistBow: 2, frontNeckBow: 3, tieBack: 4, cuffTies: 5,
};
export function tieClosureValue(spec) {
  return TIE_PLACEMENT[spec && spec.tieClosure] || 0;
}

// SleeveCap enum (must match engine/src/measurements.hpp order). 0 = Plain.
const SLEEVE_CAP = { plain: 0, gathered: 1, puffed: 2 };
export function sleeveCapValue(spec) {
  return SLEEVE_CAP[spec && spec.sleeveCap] || 0;
}

// CollarType enum (must match engine/src/collar.hpp order). 0 = None.
const COLLAR_TYPE = { none: 0, stand: 1, mock: 2, flat: 3, peterPan: 4, shirt: 5 };
export function collarTypeValue(spec) {
  return COLLAR_TYPE[spec && spec.collarType] || 0;
}
// CollarEdge enum (flat family outer edge). 0 = Round.
const COLLAR_EDGE = { round: 0, pointed: 1, scallop: 2 };
export function collarEdgeValue(spec) {
  return COLLAR_EDGE[spec && spec.collarEdge] || 0;
}

// GatherType enum (must match engine/src/gather.hpp order). 0 = None.
const GATHER_TYPE = { none: 0, drawstring: 1, shirred: 2, smocked: 3 };
export function gatherTypeValue(spec) {
  return GATHER_TYPE[spec && spec.gatherType] || 0;
}
// GatherZone enum. 0 = Neckline.
const GATHER_ZONE = { neckline: 0, bust: 1, waist: 2, sleeve: 3 };
export function gatherZoneValue(spec) {
  return GATHER_ZONE[spec && spec.gatherZone] || 0;
}

// BackOpening enum (must match engine/src/openback.hpp order). 0 = None.
const BACK_OPENING = { none: 0, round: 1, lowV: 2, square: 3, keyhole: 4 };
export function backOpeningValue(spec) {
  return BACK_OPENING[spec && spec.backOpening] || 0;
}

export function loadEngine() {
  if (!enginePromise) {
    enginePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'vendor/stitchu-engine.js';
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
  const json = engine.gradeJSON(
    spec.garment, spec.shaping ?? 'princess', spec.waistline ?? 'natural', spec.fabric ?? 'woven',
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
  );
  return JSON.parse(json);
}

export async function draft(spec, measurements) {
  const engine = await loadEngine();
  const json = engine.draftJSON(
    spec.garment, spec.shaping ?? 'princess', spec.waistline ?? 'natural', spec.fabric ?? 'woven',
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
  );
  return JSON.parse(json);
}
