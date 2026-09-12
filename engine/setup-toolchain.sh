#!/bin/bash
# stitchu engine toolchain setup: CMake + Emscripten SDK.
# Run this yourself in your terminal:  cd engine && bash setup-toolchain.sh
set -euo pipefail

if ! command -v brew >/dev/null; then
  echo "homebrew missing — install from https://brew.sh first"; exit 1
fi

if ! command -v cmake >/dev/null; then
  echo "installing cmake..."
  brew install cmake
fi
echo "cmake: $(cmake --version | head -1)"

EMSDK_DIR="$HOME/emsdk"
if [ ! -d "$EMSDK_DIR" ]; then
  echo "cloning emscripten sdk into $EMSDK_DIR..."
  git clone https://github.com/emscripten-core/emsdk.git "$EMSDK_DIR"
fi
cd "$EMSDK_DIR"
./emsdk install latest
./emsdk activate latest
source "$EMSDK_DIR/emsdk_env.sh"
echo "emcc: $(emcc --version | head -1)"

echo
echo "done. for future shells, either run:  source ~/emsdk/emsdk_env.sh"
echo "or add that line to your ~/.zshrc"
