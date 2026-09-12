#!/usr/bin/env bash
# atolye-serve.sh — serve web/ + the local pattern API (POST /api/pattern).
# Usage: scripts/atolye-serve.sh [--port 8137]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV_PY="$ROOT/core/third_party/garmentcode/.venv/bin/python"

if [ ! -x "$VENV_PY" ]; then
  echo "GarmentCode venv missing: $VENV_PY" >&2
  echo "run scripts/setup-garmentcode.sh first" >&2
  exit 1
fi

exec "$VENV_PY" "$ROOT/engine/pattern-bridge/serve.py" "$@"
