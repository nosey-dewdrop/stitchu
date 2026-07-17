// POST /api/draft — the sellable API core. Runs stitchu's OWN C++ pattern
// engine (compiled to WASM) INSIDE the Cloudflare Worker: measurements + a
// garment spec go in, a true-scale sewing pattern (pieces, sewing guide, fabric
// estimate) comes out. No per-call LLM cost — this is the margin story.
//
// The .wasm is imported as a Workers WASM module (a pre-compiled
// WebAssembly.Module) and handed to the emscripten glue through instantiateWasm
// so nothing ever fetches or compiles at runtime (the Workers runtime forbids
// runtime wasm compilation from bytes). The glue is built with -sENVIRONMENT=web
// (NOT web,worker): the WebWorker branch reads self.location.href, which is
// undefined in CF Workers and threw engine_error before instantiateWasm ran.
// The engine is instantiated once per isolate and reused across requests.
import createStitchuEngine from './engine/stitchu-worker.js';
import wasmModule from './engine/stitchu-worker.wasm';

// ---- API vocabulary. Single source of truth for what the API accepts; kept in
// lockstep with engine/wasm/bindings.cpp (*From) so an unknown value is a clear
// 422, never a silent fallback to the default.
const ENUMS = {
  garment: ['dress', 'top', 'skirt'],
  shaping: ['princess', 'dart'],
  waistline: ['natural', 'empire'],
  fabric: ['woven', 'knit'],
  neckline: ['crew', 'scoop', 'vNeck', 'square', 'boat', 'sweetheart', 'halter', 'cowl', 'pussyBow'],
  sleeveStyle: ['none', 'straight', 'balloon'],
  sleeveLength: ['short', 'elbow', 'long'],
  skirtStyle: ['aLine', 'straight', 'gathered', 'halfCircle', 'pleated'],
  skirtLength: ['mini', 'midi', 'maxi'],
  topLength: ['cropped', 'hip', 'tunic'],
  ruffle: ['none', 'single', 'tiered'],
  keyhole: ['none', 'keyhole'],
  tieClosure: ['none', 'backWaist', 'backWaistBow', 'frontNeckBow', 'tieBack', 'cuffTies'],
  sleeveCap: ['plain', 'gathered', 'puffed', 'cap'],
  collarType: ['none', 'stand', 'mock', 'flat', 'peterPan', 'shirt'],
  collarEdge: ['round', 'pointed', 'scallop'],
  gatherType: ['none', 'drawstring', 'shirred', 'smocked'],
  gatherZone: ['neckline', 'bust', 'waist', 'sleeve'],
  backOpening: ['none', 'round', 'lowV', 'square', 'keyhole'],
  backSlit: ['none', 'vent', 'slit'],
  ruffledStraps: ['none', 'ruffled'],
  peplum: ['none', 'full', 'half', 'pointed'],
  placketStyle: ['none', 'standard', 'asymmetric'],
  edgeFinish: ['biasBinding', 'bias', 'facing'],
  pocketStyle: ['none', 'patch', 'sideSeam'],
  cuffStyle: ['none', 'button', 'ribbed'],
  hemShape: ['straight', 'shirttail', 'highLow'],
  shoulderStyle: ['set', 'dropped', 'raglan'],
};

// TiePlacement enum int (must match engine/src/tie.hpp order). 0 = None.
const TIE_PLACEMENT = { none: 0, backWaist: 1, backWaistBow: 2, frontNeckBow: 3, tieBack: 4, cuffTies: 5 };
const tieInt = (s) => TIE_PLACEMENT[s] || 0;
// SleeveCap enum int (must match engine/src/measurements.hpp order). 0 = Plain.
const SLEEVE_CAP = { plain: 0, gathered: 1, puffed: 2, cap: 3 };
const sleeveCapInt = (s) => SLEEVE_CAP[s] || 0;
// CollarType/CollarEdge enum ints (must match engine/src/collar.hpp order).
const COLLAR_TYPE = { none: 0, stand: 1, mock: 2, flat: 3, peterPan: 4, shirt: 5 };
const collarTypeInt = (s) => COLLAR_TYPE[s] || 0;
const COLLAR_EDGE = { round: 0, pointed: 1, scallop: 2 };
const collarEdgeInt = (s) => COLLAR_EDGE[s] || 0;
// GatherType/GatherZone enum ints (must match engine/src/gather.hpp order).
const GATHER_TYPE = { none: 0, drawstring: 1, shirred: 2, smocked: 3 };
const gatherTypeInt = (s) => GATHER_TYPE[s] || 0;
const GATHER_ZONE = { neckline: 0, bust: 1, waist: 2, sleeve: 3 };
const gatherZoneInt = (s) => GATHER_ZONE[s] || 0;
// BackOpening enum int (must match engine/src/openback.hpp order). 0 = None.
const BACK_OPENING = { none: 0, round: 1, lowV: 2, square: 3, keyhole: 4 };
const backOpeningInt = (s) => BACK_OPENING[s] || 0;
// HemSlit enum int (must match engine/src/slit.hpp order). 0 = None.
const HEM_SLIT = { none: 0, vent: 1, slit: 2 };
const backSlitInt = (s) => HEM_SLIT[s] || 0;
// StrapStyle enum int (must match engine/src/strap.hpp order). 0 = None.
const STRAP_STYLE = { none: 0, ruffled: 1 };
const ruffledStrapsInt = (s) => STRAP_STYLE[s] || 0;
// PeplumStyle enum int (must match engine/src/peplum.hpp order). 0 = None.
const PEPLUM_STYLE = { none: 0, full: 1, half: 2, pointed: 3 };
const peplumInt = (s) => PEPLUM_STYLE[s] || 0;
// PlacketStyle enum int (must match engine/src/placket.hpp order). 0 = None.
// The legacy frontPlacket bool maps to Standard; asymmetric is the new mode.
const PLACKET_STYLE = { none: 0, standard: 1, asymmetric: 2 };
const placketStyleInt = (spec) => {
  if (spec.placketStyle) return PLACKET_STYLE[spec.placketStyle] || 0;
  return spec.frontPlacket === true ? 1 : 0;
};
// EdgeFinish enum int (must match engine/src/measurements.hpp order).
// 0 = BiasBinding (patch 3.10 default), 1 = Facing (opt-in).
const EDGE_FINISH = { biasBinding: 0, bias: 0, facing: 1 };
const edgeFinishInt = (s) => EDGE_FINISH[s] || 0;
// PocketStyle enum int (must match engine/src/pocket.hpp order). 0 = None.
const POCKET_STYLE = { none: 0, patch: 1, sideSeam: 2 };
const pocketStyleInt = (s) => POCKET_STYLE[s] || 0;
// CuffStyle enum int (must match engine/src/cuff.hpp order). 0 = None.
const CUFF_STYLE = { none: 0, button: 1, ribbed: 2 };
const cuffStyleInt = (s) => CUFF_STYLE[s] || 0;
// HemShape enum int (must match engine/src/hem.hpp order). 0 = Straight.
const HEM_SHAPE = { straight: 0, shirttail: 1, highLow: 2 };
const hemShapeInt = (s) => HEM_SHAPE[s] || 0;
// ShoulderStyle enum int (must match engine/src/measurements.hpp order). 0 = Set.
const SHOULDER_STYLE = { set: 0, dropped: 1, raglan: 2 };
const shoulderStyleInt = (s) => SHOULDER_STYLE[s] || 0;

// Measurement bounds mirror the web UI ranges (web/js/store.js MEASUREMENTS).
// Out-of-range is a typo, not a body — reject it before the engine runs.
const MEASURE_RANGE = {
  bust: [60, 160], waist: [45, 140], hip: [60, 170], shoulder: [26, 52],
  backLength: [28, 55], armLength: [40, 75], neck: [26, 55],
};

let enginePromise = null;
function engine() {
  if (!enginePromise) {
    // If the first instantiate rejects (corrupt wasm, cold-start OOM), clear the
    // cache so the NEXT request retries instead of every future request awaiting
    // a permanently-rejected promise and 500ing for the life of the isolate.
    enginePromise = createStitchuEngine({
      instantiateWasm(imports, successCallback) {
        WebAssembly.instantiate(wasmModule, imports).then((inst) =>
          successCallback(inst, wasmModule),
        );
        return {};
      },
    }).catch((e) => {
      enginePromise = null;
      throw e;
    });
  }
  return enginePromise;
}

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
      shoulderStyle: spec.shoulderStyle ?? 'set',
    },
    measurements,
  };
}

// Run the engine. Returns the parsed engine JSON {pattern, issues}.
export async function runDraft(spec, measurements) {
  const eng = await engine();
  const json = eng.draftJSON(
    spec.garment, spec.shaping, spec.waistline, spec.fabric,
    spec.neckline, spec.sleeveStyle, spec.sleeveLength,
    spec.skirtStyle, spec.skirtLength, spec.topLength,
    spec.ruffle !== 'none', spec.ruffle === 'tiered' ? 3 : 1,
    spec.keyhole === 'keyhole',
    measurements.bust, measurements.waist, measurements.hip, measurements.shoulder,
    measurements.backLength, measurements.armLength, measurements.neck,
    measurements.upperBust || 0, // optional full-bust adjustment
    spec.frontPlacket === true,  // Loop 3: front button placket
    tieInt(spec.tieClosure),     // Loop 4b: fabric ties / sash / bow
    sleeveCapInt(spec.sleeveCap), // Loop 6: gathered/puff sleeve head
    collarTypeInt(spec.collarType), // Loop 7/8: collar family
    collarEdgeInt(spec.collarEdge), // Loop 7/8: flat-family outer edge
    gatherTypeInt(spec.gatherType), // Loop 8: drawstring/shirred/smocked gathering
    gatherZoneInt(spec.gatherZone), // Loop 8: gather zone
    backOpeningInt(spec.backOpening), // Loop 9b: open-back cutout
    backSlitInt(spec.backSlit),       // Loop M1: back hem slit / walking vent
    ruffledStrapsInt(spec.ruffledStraps), // queue #3: ruffled shoulder straps
    peplumInt(spec.peplum),           // R1.1: peplum flare
    placketStyleInt(spec),            // R1.2: asymmetric placket
    edgeFinishInt(spec.edgeFinish),   // patch 3.10: neckline/armhole edge finish
    pocketStyleInt(spec.pocketStyle), // patch 3.12: patch / side-seam pocket
    cuffStyleInt(spec.cuffStyle),     // patch 3.13: sleeve-end cuff
    hemShapeInt(spec.hemShape),       // patch 3.15: hem shape
    shoulderStyleInt(spec.shoulderStyle), // patch 3.13: dropped shoulder / raglan
  );
  return JSON.parse(json);
}

// Grade a design across a standard EU size run. The seller/brand deliverable:
// one spec, a whole size chart, from the same engine — no manual grade rules.
const EU_SIZES = ['EU34','EU36','EU38','EU40','EU42','EU44','EU46','EU48','EU50','EU52'];
export async function handleGrade(request) {
  let raw;
  try { raw = await request.text(); } catch { return { status: 400, payload: { error: 'invalid_body' } }; }
  if (raw.length > 20_000) return { status: 413, payload: { error: 'body_too_large' } };
  let body;
  try { body = JSON.parse(raw); } catch { return { status: 400, payload: { error: 'invalid_json' } }; }
  if (!body || typeof body !== 'object' || !body.spec || !body.spec.garment) {
    return { status: 422, payload: { error: 'missing_spec', detail: 'spec.garment is required' } };
  }
  // Validate the spec vocabulary with the same rules as a draft (reuse the
  // validator by wrapping the spec with a valid dummy body).
  const check = validateDraftRequest({ spec: body.spec, measurements: { bust: 90, waist: 70, hip: 96, shoulder: 38, backLength: 40, armLength: 58, neck: 36 } });
  if (check.error) return { status: 422, payload: check };
  const from = EU_SIZES.includes(body.from) ? body.from : 'EU34';
  const to = EU_SIZES.includes(body.to) ? body.to : 'EU52';
  const spec = check.spec;
  let result;
  try {
    const eng = await engine();
    const json = eng.gradeJSON(
      spec.garment, spec.shaping, spec.waistline, spec.fabric,
      spec.neckline, spec.sleeveStyle, spec.sleeveLength,
      spec.skirtStyle, spec.skirtLength, spec.topLength,
      spec.ruffle !== 'none', spec.ruffle === 'tiered' ? 3 : 1,
      spec.keyhole === 'keyhole', from, to,
      spec.frontPlacket === true, // Loop 3: front button placket
      tieInt(spec.tieClosure),    // Loop 4b: fabric ties / sash / bow
      sleeveCapInt(spec.sleeveCap), // Loop 6: gathered/puff sleeve head
      collarTypeInt(spec.collarType), // Loop 7/8: collar family
      collarEdgeInt(spec.collarEdge), // Loop 7/8: flat-family outer edge
      gatherTypeInt(spec.gatherType), // Loop 8: drawstring/shirred/smocked gathering
      gatherZoneInt(spec.gatherZone), // Loop 8: gather zone
      backOpeningInt(spec.backOpening), // Loop 9b: open-back cutout
      backSlitInt(spec.backSlit),       // Loop M1: back hem slit / walking vent
      ruffledStrapsInt(spec.ruffledStraps), // queue #3: ruffled shoulder straps
      peplumInt(spec.peplum),           // R1.1: peplum flare
      placketStyleInt(spec),            // R1.2: asymmetric placket
      edgeFinishInt(spec.edgeFinish),   // patch 3.10: neckline/armhole edge finish
      pocketStyleInt(spec.pocketStyle), // patch 3.12: patch / side-seam pocket
      cuffStyleInt(spec.cuffStyle),     // patch 3.13: sleeve-end cuff
      hemShapeInt(spec.hemShape),       // patch 3.15: hem shape
      shoulderStyleInt(spec.shoulderStyle), // patch 3.13: dropped shoulder / raglan
    );
    result = JSON.parse(json);
  } catch { return { status: 500, payload: { error: 'engine_error' } }; }
  return { status: 200, payload: { apiVersion: '1', spec, from, to, sizes: result.sizes } };
}

// Full handler: validate -> draft -> shape the public response envelope.
// A validator-blocked draft (impossible body, unsewable combo) is a 422 with
// the reasons, NOT a 200 with a broken pattern — the API never returns a
// pattern that would waste a customer's fabric.
export async function handleDraft(request) {
  // Enforce the size cap on the ACTUAL bytes read, not the content-length header
  // (which a caller can omit or lie about). A draft request is tiny; anything
  // over 20 KB is abuse.
  let raw;
  try {
    raw = await request.text();
  } catch {
    return { status: 400, payload: { error: 'invalid_body', detail: 'Could not read request body' } };
  }
  if (raw.length > 20_000) {
    return { status: 413, payload: { error: 'body_too_large', detail: 'Draft request body too large' } };
  }
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return { status: 400, payload: { error: 'invalid_json', detail: 'Request body is not valid JSON' } };
  }

  const validated = validateDraftRequest(body);
  if (validated.error) {
    return { status: 422, payload: validated };
  }

  const { spec, measurements } = validated;
  let result;
  try {
    result = await runDraft(spec, measurements);
  } catch (e) {
    return { status: 500, payload: { error: 'engine_error', detail: 'The pattern engine failed to run' } };
  }

  if (result.issues && result.issues.length) {
    // Honest refusal: the requested body/spec cannot be drafted into a sewable
    // pattern. Surface every reason so the caller can fix the input.
    return {
      status: 422,
      payload: {
        error: 'undraftable',
        detail: 'This measurement + spec combination did not pass the pattern safety checks',
        reasons: result.issues,
        spec,
      },
    };
  }

  return {
    status: 200,
    payload: {
      apiVersion: '1',
      spec,
      measurements,
      pattern: result.pattern,
    },
  };
}
