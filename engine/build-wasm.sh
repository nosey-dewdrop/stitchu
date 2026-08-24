#!/bin/bash
# Builds the engine to WebAssembly. Output: engine/dist/stitchu-engine.js
# (single file, wasm embedded — works from file:// too).
set -euo pipefail
cd "$(dirname "$0")"
source "$HOME/emsdk/emsdk_env.sh" >/dev/null 2>&1

mkdir -p dist

# ---- SOURCE STAMP ----------------------------------------------------------
# WHY. bundle_fresh_check reads the COMMIT DATE of each shipped artefact and
# compares it to the commit date of engine/src + engine/wasm + build-wasm.sh.
# Git cannot commit a file whose bytes did not change, so an engine change that
# leaves the emscripten GLUE byte-identical (measured: 5d649d2 changed
# wasm/bindings.cpp + src/bodice.cpp, stitchu-worker.wasm changed, but
# stitchu-worker.js did not) freezes the glue's commit date in the past and the
# gate goes red forever. Stamping the glue with a digest of the watched sources
# makes the glue's bytes a FUNCTION of those sources: change any watched byte
# and the glue changes too, so it lands in the same commit and the gate's
# "built commit" tells the truth.
#
# The digest, not the HEAD commit sha: a sha stamp is only correct if the build
# runs after the source commit, so building from a dirty tree (the normal order:
# edit, build, commit once) would re-emit the same sha and leave the gate red —
# the exact failure being fixed. The digest is also DETERMINISTIC: the same
# sources produce the same byte, so a rebuild with no source change produces no
# diff. It is a JS line comment on line 1, so the glue's behaviour is untouched.
src_stamp() {
  { find src wasm -type f -print0 | sort -z | xargs -0 shasum -a 256
    shasum -a 256 build-wasm.sh; } | shasum -a 256 | cut -c1-16
}
STAMP="$(src_stamp)"
echo "source stamp: $STAMP"

# copy a built glue file to its shipped path with the stamp line prepended
stamp_copy() {
  printf '// stitchu source-stamp %s -- sha256 of engine/src + engine/wasm + engine/build-wasm.sh (see bundle_fresh_check)\n' "$STAMP" > "$2"
  cat "$1" >> "$2"
}

# -fexceptions + DISABLE_EXCEPTION_CATCHING=0: the boundary throws
# std::invalid_argument on an unknown spec value and catches it INSIDE
# draftJSON/gradeJSON (returns {"error": ...}); without these flags a C++ throw
# aborts the whole module instead of reaching that catch.
em++ -O2 -std=c++17 -fexceptions -sDISABLE_EXCEPTION_CATCHING=0 \
  src/geometry.cpp src/bodice.cpp src/skirt.cpp src/ruffle.cpp src/keyhole.cpp src/placket.cpp src/tie.cpp src/collar.cpp src/gather.cpp src/openback.cpp src/laceupback.cpp src/wrapfront.cpp src/slit.cpp src/strap.cpp src/peplum.cpp src/hemflounce.cpp src/cupseam.cpp src/locket.cpp src/yoke.cpp src/boxpleat.cpp src/pocket.cpp src/neckext.cpp src/cuff.cpp src/hem.cpp src/shoulder.cpp src/buttonrow.cpp src/exposedzip.cpp src/backdetail.cpp src/offshoulder.cpp src/sleeve.cpp src/garment.cpp src/wearability.cpp src/validator.cpp src/recipe.cpp src/dxf.cpp \
  wasm/bindings.cpp \
  -lembind \
  -sMODULARIZE=1 -sEXPORT_NAME=createStitchuEngine -sSINGLE_FILE=1 \
  -sINITIAL_MEMORY=64MB -sALLOW_MEMORY_GROWTH=0 \
  -o dist/stitchu-engine.js
# NOTE: fixed (non-growable) memory on purpose. ALLOW_MEMORY_GROWTH=1 makes the
# WASM heap a *resizable* ArrayBuffer; modern Chromium's TextDecoder.decode()
# rejects a resizable buffer ("must not be resizable"), which threw on every
# draftJSON return and left create.html blank after the pattern picker. A draft
# needs only a few MB, so a fixed 64MB heap is ample and keeps the buffer plain.

ls -la dist/stitchu-engine.js

# copy the wasm bundle where the web app serves it
stamp_copy dist/stitchu-engine.js ../web/vendor/stitchu-engine.js
echo "copied to web/vendor/ (stamped $STAMP)"

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
em++ -O2 -std=c++17 -fexceptions -sDISABLE_EXCEPTION_CATCHING=0 \
  src/geometry.cpp src/bodice.cpp src/skirt.cpp src/ruffle.cpp src/keyhole.cpp src/placket.cpp src/tie.cpp src/collar.cpp src/gather.cpp src/openback.cpp src/laceupback.cpp src/wrapfront.cpp src/slit.cpp src/strap.cpp src/peplum.cpp src/hemflounce.cpp src/cupseam.cpp src/locket.cpp src/yoke.cpp src/boxpleat.cpp src/pocket.cpp src/neckext.cpp src/cuff.cpp src/hem.cpp src/shoulder.cpp src/buttonrow.cpp src/exposedzip.cpp src/backdetail.cpp src/offshoulder.cpp src/sleeve.cpp src/garment.cpp src/wearability.cpp src/validator.cpp src/recipe.cpp src/dxf.cpp \
  wasm/bindings.cpp \
  -lembind \
  -sMODULARIZE=1 -sEXPORT_NAME=createStitchuEngine \
  -sENVIRONMENT=web -sALLOW_MEMORY_GROWTH=1 -sDYNAMIC_EXECUTION=0 \
  -o dist/stitchu-worker.js

# copy the worker bundle where the backend imports it (dist/ is gitignored)
stamp_copy dist/stitchu-worker.js ../backend/engine/stitchu-worker.js
cp dist/stitchu-worker.wasm ../backend/engine/stitchu-worker.wasm
echo "copied to backend/engine/ (glue stamped $STAMP)"
