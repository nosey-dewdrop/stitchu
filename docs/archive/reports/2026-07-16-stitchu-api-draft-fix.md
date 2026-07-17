# stitchu — /api/draft 500 engine_error fixed (live 200)

2026-07-16. The public B2B endpoints `/api/draft` and `/api/grade` on
`https://stitchu-api.damummyphus.workers.dev` were returning HTTP 500
`{"error":"engine_error"}`. They are now **live 200**. No C++ source changed, no
golden touched, the browser flow was never affected — this was a packaging/build
bug in the Cloudflare Worker WASM target only.

## Root cause (diagnosed, not guessed)

The Loop 4b report noted the failure was "Cloudflare wasm instantiation" and
hypothesised a SINGLE_FILE worker build would fix it. Reproduced the 500 locally
in `wrangler dev --local` (the real Workers runtime), then temporarily surfaced
the swallowed catch detail. The 500 was **two stacked Cloudflare-CSP bans**, one
uncovering the next as each was fixed:

1. **`self.location.href` crash.** The worker build used
   `-sENVIRONMENT=web,worker`. In the Cloudflare Workers runtime
   `globalThis.WorkerGlobalScope` is truthy, so the emscripten glue took the
   WebWorker branch and ran `_scriptName = self.location.href`. `self.location`
   is `undefined` in CF Workers → `TypeError: Cannot read properties of
   undefined (reading 'href')`, thrown *before* `instantiateWasm` ever ran.

2. **`new Function` / wasm-compile bans.** Testing SINGLE_FILE (the Loop 4b
   hypothesis) revealed why that path can't work on CF: SINGLE_FILE decodes the
   embedded base64 wasm and calls `WebAssembly.instantiate(bytes)` at runtime,
   which CF forbids — `CompileError: Wasm code generation disallowed by
   embedder`. So the pre-compiled `WebAssembly.Module` (CompiledWasm import +
   `instantiateWasm`) is the *only* allowed path and must stay. But even the
   two-file path then hit `EvalError: Code generation from strings disallowed`:
   embind builds its call invokers with `new Function(...)`, which CF also bans.

## Fix (build/packaging only)

`engine/build-wasm.sh`, worker target flags:
`-sENVIRONMENT=web,worker` → **`-sENVIRONMENT=web -sDYNAMIC_EXECUTION=0`**.

- `ENVIRONMENT=web` (drop `worker`) → plain web branch, never reads
  `self.location`.
- `DYNAMIC_EXECUTION=0` → removes all `eval`/`new Function`; embind falls back to
  a non-eval invoker.
- Kept the two-file build (separate `.wasm` via the CompiledWasm rule +
  `instantiateWasm`) — SINGLE_FILE is impossible on CF (runtime wasm compile is
  banned).

`backend/draft.js`: unchanged in behaviour (import + `instantiateWasm` hook
restored exactly). Browser target flags untouched → `web/vendor/stitchu-engine.js`
byte-identical (270577 bytes, not in git diff). Golden untouched.

## Proof

Local (`wrangler dev --local`, real Workers runtime): draft 200 / 10 pieces,
grade 200 / 4 sizes.

Deployed: `npx wrangler deploy` → version `4a8ddf97-9e92-4d25-9ee7-0eaef1ff16a0`.

Live curl (`https://stitchu-api.damummyphus.workers.dev`):

- **`POST /api/draft`** dress, measurements 92/74/98/39/42/58/36 →
  **HTTP 200, 10 pieces**: Bodice Center Front, Bodice Side Front, Bodice Center
  Back, Bodice Side Back, Front Neck Facing, Back Neck Facing, Skirt Center
  Front, Skirt Side Front, Skirt Center Back, Skirt Side Back.
- **`POST /api/grade`** dress EU36→EU42 → **HTTP 200, 4 sizes**
  (EU36, EU38, EU40, EU42).

## Deliverables

- This report.
- `web/patches.html` patch 2.4 "API draft endpoint fixed" (EN/TR, delta badge
  `500 → 200`, honest note: packaging bug not engine bug), cache-bust v60→v61.
- Worker deployed (version above).
- Files changed: `engine/build-wasm.sh`, `backend/draft.js` (comment only, code
  restored to two-file path), `backend/engine/stitchu-worker.js` (rebuilt),
  `web/patches.html`. `stitchu-worker.wasm` unchanged (219529 bytes).
