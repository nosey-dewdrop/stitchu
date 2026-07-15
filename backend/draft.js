// POST /api/draft — the sellable API core. Runs stitchu's OWN C++ pattern
// engine (compiled to WASM) INSIDE the Cloudflare Worker: measurements + a
// garment spec go in, a true-scale sewing pattern (pieces, sewing guide, fabric
// estimate) comes out. No per-call LLM cost — this is the margin story.
//
// The .wasm is imported as a Workers WASM module (a pre-compiled
// WebAssembly.Module) and handed to the emscripten glue through instantiateWasm
// so nothing ever fetches at runtime. The engine is instantiated once per
// isolate and reused across requests.
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
  neckline: ['crew', 'scoop', 'vNeck', 'square', 'boat', 'sweetheart', 'halter'],
  sleeveStyle: ['none', 'straight', 'balloon'],
  sleeveLength: ['short', 'elbow', 'long'],
  skirtStyle: ['aLine', 'straight', 'gathered', 'halfCircle', 'pleated'],
  skirtLength: ['mini', 'midi', 'maxi'],
  topLength: ['cropped', 'hip', 'tunic'],
  ruffle: ['none', 'single', 'tiered'],
  keyhole: ['none', 'keyhole'],
};

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
  );
  return JSON.parse(json);
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
