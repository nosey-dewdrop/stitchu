#!/usr/bin/env bash
# gradeset.sh — bir atolye durumundan EU34..EU48 beden serisi + grading denetimi.
#   scripts/gradeset.sh default              # atolye varsayilan durumu
#   scripts/gradeset.sh path/to/durum.json   # herhangi bir atolye durumu
# Cikti: Logs/gradeset-<tarih>/ (beden klasorleri + gradeset-report.txt + nest'ler)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV_PY="$ROOT/core/third_party/garmentcode/.venv/bin/python"

if [[ ! -x "$VENV_PY" ]]; then
  echo "GarmentCode venv yok: $VENV_PY" >&2
  echo "once scripts/setup-garmentcode.sh calistir" >&2
  exit 1
fi

exec "$VENV_PY" "$ROOT/engine/pattern-bridge/gradeset.py" "${1:-default}" "${@:2}"
