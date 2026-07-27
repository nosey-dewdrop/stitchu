// spec-core.js — the PURE half of the draft API: request validation + the
// engine-boundary spec shape. No WASM import, no Workers runtime dependency,
// so the API wire is testable in plain node (engine/tests/api_wire_check.mjs).
// draft.js (the Worker half) imports these; behavior is identical.
//
// 2026-07-27 kopuk kablo fix: validateDraftRequest VALIDATED spec.skirtLengthMM
// but never COPIED it into the normalized spec, so engineSpec always read
// undefined and the API path silently sent 0 to the engine (the web path
// worked). The normalized spec now carries it; the round-trip test locks it.
//
// 2026-07-27 (bugra corset pass) SAME BUG, six more fields: cupSeam, laceUpBack,
// wrapFront, hemFlounce, yoke and boxPleat were validated by the ENUMS loop and
// then silently DROPPED by both validateDraftRequest's normalization and
// engineSpec — the API accepted "cupSeam": "horizontal" and drafted as if it
// were never sent (the web path carried them fine). All six are now wired;
// api_wire_check locks engineSpec against the whole vocabulary so a seventh
// field can never fall through the same hole.

// ---- API vocabulary. Generated from engine/vocab.json (gen-vocab.mjs) so the
// API, the web bridge and the C++ boundary can never drift apart. An unknown
// value is a clear 422, never a silent fallback to the default.
import { VOCAB, canonical } from './vocab.gen.js';

// Accepted strings per field: canonical values + documented synonyms
// (e.g. edgeFinish 'bias' -> 'biasBinding'). ruffle/keyhole are API-level
// conveniences that predate the vocabulary and map to bool/int in runDraft.
const ENUMS = Object.fromEntries(
  Object.entries(VOCAB).map(([field, def]) => [
    field,
    def.values.concat(Object.keys(def.synonyms || {})),
  ]),
);
ENUMS.ruffle = ['none', 'single', 'tiered'];
ENUMS.keyhole = ['none', 'keyhole'];

// Enum-int lookup. Absent -> 0 (the default); a present but unknown value
// throws — validateDraftRequest has already 422'd it, so a throw here means a
// coding error upstream, and it must be loud, not a silent None.
const enumIntOf = (field) => (s) => {
  if (s === undefined || s === null || s === '') return 0;
  const c = canonical(field, s);
  if (c === undefined) throw new Error(`invalid ${field} '${s}' (valid: ${VOCAB[field].values.join(', ')})`);
  return VOCAB[field].values.indexOf(c);
};
const tieInt = enumIntOf('tieClosure');
const sleeveCapInt = enumIntOf('sleeveCap');
const collarTypeInt = enumIntOf('collarType');
const collarEdgeInt = enumIntOf('collarEdge');
const gatherTypeInt = enumIntOf('gatherType');
const gatherZoneInt = enumIntOf('gatherZone');
const backOpeningInt = enumIntOf('backOpening');
const backSlitInt = enumIntOf('backSlit');
const ruffledStrapsInt = enumIntOf('ruffledStraps');
const peplumInt = enumIntOf('peplum');
const edgeFinishInt = enumIntOf('edgeFinish');
const pocketStyleInt = enumIntOf('pocketStyle');
const cuffStyleInt = enumIntOf('cuffStyle');
const hemShapeInt = enumIntOf('hemShape');
const shoulderStyleInt = enumIntOf('shoulderStyle');
const buttonRowInt = enumIntOf('buttonRow');
const exposedZipInt = enumIntOf('exposedZip');
const backDetailInt = enumIntOf('backDetail');
const bardotStyleInt = enumIntOf('bardotStyle');
const cupSeamInt = enumIntOf('cupSeam');
const locketTopInt = enumIntOf('locketTop');
const laceUpBackInt = enumIntOf('laceUpBack');
const wrapFrontInt = enumIntOf('wrapFront');
const hemFlounceInt = enumIntOf('hemFlounce');
const yokeInt = enumIntOf('yoke');
const boxPleatInt = enumIntOf('boxPleat');
// The legacy frontPlacket bool maps to Standard; asymmetric is the new mode.
const placketStyleEnumInt = enumIntOf('placketStyle');
const placketStyleInt = (spec) => {
  if (spec.placketStyle) return placketStyleEnumInt(spec.placketStyle);
  return spec.frontPlacket === true ? 1 : 0;
};

// Measurement bounds mirror the web UI ranges (web/js/store.js MEASUREMENTS).
// Out-of-range is a typo, not a body — reject it before the engine runs.
const MEASURE_RANGE = {
  bust: [60, 160], waist: [45, 140], hip: [60, 170], shoulder: [26, 52],
  backLength: [28, 55], armLength: [40, 75], neck: [26, 55],
};

// Validate + normalise the request body. Returns {spec, measurements} on
// success or {error, detail, field} on failure (mapped to 422 by the caller).
export function validateDraftRequest(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'invalid_body', detail: 'Request body must be a JSON object' };
  }
  const spec = body.spec;
  const m = body.measurements;
  if (!spec || typeof spec !== 'object') {
    return { error: 'missing_spec', detail: 'spec object is required', field: 'spec' };
  }
  if (!m || typeof m !== 'object') {
    return { error: 'missing_measurements', detail: 'measurements object is required', field: 'measurements' };
  }

  // Enum fields: every provided value must be in the vocabulary. garment is
  // required; the rest fall back to the engine defaults if omitted.
  if (!spec.garment) {
    return { error: 'missing_field', detail: 'spec.garment is required', field: 'spec.garment' };
  }
  for (const [key, allowed] of Object.entries(ENUMS)) {
    const v = spec[key];
    if (v === undefined || v === null) continue;
    if (!allowed.includes(v)) {
      return {
        error: 'invalid_value',
        detail: `spec.${key} must be one of: ${allowed.join(', ')}`,
        field: `spec.${key}`,
      };
    }
  }

  // Optional continuous skirt length (foto-oran kablosu): number in the same
  // band the engine clamps to; anything else is a clean 422, not a silent 0.
  if (spec.skirtLengthMM !== undefined && spec.skirtLengthMM !== null && spec.skirtLengthMM !== 0) {
    const sl = spec.skirtLengthMM;
    if (typeof sl !== 'number' || !Number.isFinite(sl) || sl < 250 || sl > 1200) {
      return { error: 'invalid_value', detail: 'spec.skirtLengthMM must be a number between 250 and 1200 (mm), or 0/omitted', field: 'spec.skirtLengthMM' };
    }
  }

  // Measurements: all seven required, numeric, in range (cm).
  const measurements = {};
  for (const [key, [lo, hi]] of Object.entries(MEASURE_RANGE)) {
    const v = m[key];
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      return { error: 'invalid_measurement', detail: `measurements.${key} must be a number (cm)`, field: `measurements.${key}` };
    }
    if (v < lo || v > hi) {
      return { error: 'measurement_out_of_range', detail: `measurements.${key} must be between ${lo} and ${hi} cm`, field: `measurements.${key}` };
    }
    measurements[key] = v;
  }

  // Optional 8th: upper/high bust for a full-bust adjustment. If given it must be
  // numeric and in range; if omitted the draft uses the B/C-cup assumption.
  if (m.upperBust !== undefined && m.upperBust !== null) {
    const ub = m.upperBust;
    if (typeof ub !== 'number' || !Number.isFinite(ub) || ub < 60 || ub > 150) {
      return { error: 'invalid_measurement', detail: 'measurements.upperBust must be a number 60–150 cm', field: 'measurements.upperBust' };
    }
    measurements.upperBust = ub;
  }

  return {
    spec: {
      garment: spec.garment,
      shaping: spec.shaping ?? 'princess',
      waistline: spec.waistline ?? 'natural',
      fabric: spec.fabric ?? 'woven',
      neckline: spec.neckline ?? 'crew',
      sleeveStyle: spec.sleeveStyle ?? 'none',
      sleeveLength: spec.sleeveLength ?? 'short',
      skirtStyle: spec.skirtStyle ?? 'aLine',
      skirtLength: spec.skirtLength ?? 'midi',
      // Foto-oran kablosu (2026-07-27 fix): the validated mm must SURVIVE
      // normalisation — engineSpec reads THIS object. Before this line the
      // field validated fine and then silently vanished (always 0 on the API
      // path). 0 = off, the mini/midi/maxi table drives.
      skirtLengthMM: (typeof spec.skirtLengthMM === 'number' && spec.skirtLengthMM > 0) ? spec.skirtLengthMM : 0,
      topLength: spec.topLength ?? 'hip',
      ruffle: spec.ruffle ?? 'none',
      keyhole: spec.keyhole ?? 'none',
      frontPlacket: spec.frontPlacket === true,
      tieClosure: spec.tieClosure ?? 'none',
      sleeveCap: spec.sleeveCap ?? 'plain',
      collarType: spec.collarType ?? 'none',
      collarEdge: spec.collarEdge ?? 'round',
      gatherType: spec.gatherType ?? 'none',
      gatherZone: spec.gatherZone ?? 'neckline',
      backOpening: spec.backOpening ?? 'none',
      backSlit: spec.backSlit ?? 'none',
      ruffledStraps: spec.ruffledStraps ?? 'none',
      peplum: spec.peplum ?? 'none',
      placketStyle: spec.placketStyle ?? 'none',
      edgeFinish: spec.edgeFinish ?? 'biasBinding',
      pocketStyle: spec.pocketStyle ?? 'none',
      cuffStyle: spec.cuffStyle ?? 'none',
      hemShape: spec.hemShape ?? 'straight',
      shoulderStyle: spec.shoulderStyle ?? 'set',
      buttonRow: spec.buttonRow ?? 'none',
      exposedZip: spec.exposedZip ?? 'none',
      backDetail: spec.backDetail ?? 'none',
      bardotStyle: spec.bardotStyle ?? 'none',
      cupSeam: spec.cupSeam ?? 'none',
      locketTop: spec.locketTop ?? 'none',
      laceUpBack: spec.laceUpBack ?? 'none',
      wrapFront: spec.wrapFront ?? 'none',
      hemFlounce: spec.hemFlounce ?? 'none',
      yoke: spec.yoke ?? 'none',
      boxPleat: spec.boxPleat ?? 'none',
    },
    measurements,
  };
}

// The single named-object spec the WASM boundary takes.
export function engineSpec(spec) {
  return {
    garment: spec.garment, shaping: spec.shaping, waistline: spec.waistline,
    fabric: spec.fabric, neckline: spec.neckline,
    sleeveStyle: spec.sleeveStyle, sleeveLength: spec.sleeveLength,
    skirtStyle: spec.skirtStyle, skirtLength: spec.skirtLength, topLength: spec.topLength,
    // Foto-oran kablosu: continuous mm target (0 = off, the table drives).
    skirtLengthMM: (typeof spec.skirtLengthMM === 'number' && spec.skirtLengthMM > 0) ? spec.skirtLengthMM : 0,
    ruffleHem: spec.ruffle !== 'none', ruffleTiers: spec.ruffle === 'tiered' ? 3 : 1,
    keyhole: spec.keyhole === 'keyhole', frontPlacket: spec.frontPlacket === true,
    tieClosure: tieInt(spec.tieClosure), sleeveCap: sleeveCapInt(spec.sleeveCap),
    collarType: collarTypeInt(spec.collarType), collarEdge: collarEdgeInt(spec.collarEdge),
    gatherType: gatherTypeInt(spec.gatherType), gatherZone: gatherZoneInt(spec.gatherZone),
    backOpening: backOpeningInt(spec.backOpening), backSlit: backSlitInt(spec.backSlit),
    ruffledStraps: ruffledStrapsInt(spec.ruffledStraps), peplum: peplumInt(spec.peplum),
    placketStyle: placketStyleInt(spec), edgeFinish: edgeFinishInt(spec.edgeFinish),
    pocketStyle: pocketStyleInt(spec.pocketStyle), cuffStyle: cuffStyleInt(spec.cuffStyle),
    hemShape: hemShapeInt(spec.hemShape), shoulderStyle: shoulderStyleInt(spec.shoulderStyle),
    buttonRow: buttonRowInt(spec.buttonRow), exposedZip: exposedZipInt(spec.exposedZip),
    backDetail: backDetailInt(spec.backDetail), bardotStyle: bardotStyleInt(spec.bardotStyle),
    cupSeam: cupSeamInt(spec.cupSeam), locketTop: locketTopInt(spec.locketTop),
    laceUpBack: laceUpBackInt(spec.laceUpBack),
    wrapFront: wrapFrontInt(spec.wrapFront), hemFlounce: hemFlounceInt(spec.hemFlounce),
    yoke: yokeInt(spec.yoke), boxPleat: boxPleatInt(spec.boxPleat),
  };
}
