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
//
// Validation + the engine-boundary spec shape live in spec-core.js (pure, no
// WASM import) so the API wire is testable in plain node
// (engine/tests/api_wire_check.mjs); this file owns the Worker/WASM half.
import createStitchuEngine from './engine/stitchu-worker.js';
import wasmModule from './engine/stitchu-worker.wasm';
import { validateDraftRequest, engineSpec } from './spec-core.js';
import { CONTRACT } from './contract.gen.js';

export { validateDraftRequest, engineSpec };

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

export async function runDraft(spec, measurements) {
  const eng = await engine();
  const json = eng.draftJSON(engineSpec(spec), {
    bust: measurements.bust, waist: measurements.waist, hip: measurements.hip,
    shoulder: measurements.shoulder, backLength: measurements.backLength,
    armLength: measurements.armLength, neck: measurements.neck,
    upperBust: measurements.upperBust || 0,
  });
  return JSON.parse(json);
}

// Grade a design across a standard EU size run. The seller/brand deliverable:
// one spec, a whole size chart, from the same engine — no manual grade rules.
// K1 contract: the size list is the engine size chart's list, one source
// (contract/tables.json draft.euSizes; the C++ chart is generated from it too).
const EU_SIZES = CONTRACT.draft.euSizes;
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
    const json = eng.gradeJSON(engineSpec(spec), { from, to });
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
