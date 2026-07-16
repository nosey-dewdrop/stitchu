#!/bin/bash
# Builds the engine to WebAssembly. Output: engine/dist/stitchu-engine.js
# (single file, wasm embedded — works from file:// too).
set -euo pipefail
cd "$(dirname "$0")"
source "$HOME/emsdk/emsdk_env.sh" >/dev/null 2>&1

mkdir -p dist
em++ -O2 -std=c++17 \
  src/geometry.cpp src/bodice.cpp src/skirt.cpp src/ruffle.cpp src/keyhole.cpp src/placket.cpp src/tie.cpp src/collar.cpp src/gather.cpp src/openback.cpp src/sleeve.cpp src/garment.cpp src/validator.cpp \
  wasm/bindings.cpp \
  -lembind \
  -sMODULARIZE=1 -sEXPORT_NAME=createStitchuEngine -sSINGLE_FILE=1 \
  -sALLOW_MEMORY_GROWTH=1 \
  -o dist/stitchu-engine.js

ls -la dist/stitchu-engine.js

# copy the wasm bundle where the web app serves it
cp dist/stitchu-engine.js ../web/vendor/stitchu-engine.js
echo "copied to web/vendor/"

# Second target: the Cloudflare Worker build for the /api/draft engine. TWO
# files — the .wasm is a separate module Cloudflare pre-compiles (CompiledWasm
# rule in wrangler.toml) and hands to the glue via instantiateWasm. The Workers
# runtime forbids runtime WebAssembly.instantiate(bytes)/compile() from raw
# bytes ("Wasm code generation disallowed by embedder"), so SINGLE_FILE (base64
# decode + instantiate) can NOT run there — the pre-compiled Module path is the
# only one allowed.
#
# The engine_error 500 was TWO stacked bugs the Workers CSP triggered:
#  1. -sENVIRONMENT=web,worker made the glue take the WebWorker branch
#     (globalThis.WorkerGlobalScope is truthy in CF Workers) and run
#     `_scriptName = self.location.href` — self.location is undefined in CF, so
#     it threw "reading 'href'" before instantiateWasm ran. Fix: ENVIRONMENT=web
#     only — the plain web branch never touches self.location.
#  2. embind builds its call invokers with `new Function(...)`; CF Workers ban
#     runtime code generation ("Code generation from strings disallowed"). Fix:
#     -sDYNAMIC_EXECUTION=0 removes all eval/new Function (embind falls back to a
#     non-eval invoker).
# The wasm still arrives pre-compiled via instantiateWasm, so nothing is fetched
# or compiled at runtime either. Verified end-to-end in wrangler dev + live.
em++ -O2 -std=c++17 \
  src/geometry.cpp src/bodice.cpp src/skirt.cpp src/ruffle.cpp src/keyhole.cpp src/placket.cpp src/tie.cpp src/collar.cpp src/gather.cpp src/openback.cpp src/sleeve.cpp src/garment.cpp src/validator.cpp \
  wasm/bindings.cpp \
  -lembind \
  -sMODULARIZE=1 -sEXPORT_NAME=createStitchuEngine \
  -sENVIRONMENT=web -sALLOW_MEMORY_GROWTH=1 -sDYNAMIC_EXECUTION=0 \
  -o dist/stitchu-worker.js

# copy the worker bundle where the backend imports it (dist/ is gitignored)
cp dist/stitchu-worker.js ../backend/engine/stitchu-worker.js
cp dist/stitchu-worker.wasm ../backend/engine/stitchu-worker.wasm
echo "copied to backend/engine/"
