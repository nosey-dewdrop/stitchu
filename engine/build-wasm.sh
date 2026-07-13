#!/bin/bash
# Builds the engine to WebAssembly. Output: engine/dist/stitchu-engine.js
# (single file, wasm embedded — works from file:// too).
set -euo pipefail
cd "$(dirname "$0")"
source "$HOME/emsdk/emsdk_env.sh" >/dev/null 2>&1

mkdir -p dist
em++ -O2 -std=c++17 \
  src/geometry.cpp src/bodice.cpp src/skirt.cpp src/ruffle.cpp src/sleeve.cpp src/garment.cpp src/validator.cpp \
  wasm/bindings.cpp \
  -lembind \
  -sMODULARIZE=1 -sEXPORT_NAME=createStitchuEngine -sSINGLE_FILE=1 \
  -sALLOW_MEMORY_GROWTH=1 \
  -o dist/stitchu-engine.js

ls -la dist/stitchu-engine.js

# copy the wasm bundle where the web app serves it
cp dist/stitchu-engine.js ../web/vendor/stitchu-engine.js
echo "copied to web/vendor/"
