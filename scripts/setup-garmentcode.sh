#!/usr/bin/env bash
# setup-garmentcode.sh — reproduce the pinned GarmentCode install from scratch.
# The clone + venv are gitignored; this script is the source of truth for them.
#
#   commit  d449629979028123a5c4dc9e732a2ec19b7fce31 (MIT), depth-1 fetch
#   venv    python3.11, minimal pip list — NO `pip install -e .`:
#           the editable install pulls cgal (GPL) which we must not ship.
#   extras  system.json (copy of the template), probe files from
#           engine/pattern-bridge/probe/ (the working generation example)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GC="$ROOT/core/third_party/garmentcode"
REPO_URL="https://github.com/maria-korosteleva/GarmentCode.git"
COMMIT="d449629979028123a5c4dc9e732a2ec19b7fce31"
PY="${PYTHON:-python3.11}"

# --- clone, pinned, depth-1 --------------------------------------------------
if [ ! -d "$GC/.git" ]; then
  mkdir -p "$GC"
  git -C "$GC" init -q
  git -C "$GC" remote add origin "$REPO_URL"
  git -C "$GC" fetch -q --depth 1 origin "$COMMIT"
  git -C "$GC" checkout -q "$COMMIT"
else
  echo "clone exists: $GC"
fi
[ "$(git -C "$GC" rev-parse HEAD)" = "$COMMIT" ] || {
  echo "ERROR: clone is not at pinned commit $COMMIT" >&2; exit 1; }

# --- venv (minimal, cgal-free) ----------------------------------------------
if [ ! -x "$GC/.venv/bin/python" ]; then
  "$PY" -m venv "$GC/.venv"
fi
"$GC/.venv/bin/pip" install -q \
  "numpy==1.26.4" \
  "PyYAML==6.0.3" \
  "scipy==1.17.1" \
  "matplotlib==3.11.1" \
  "svgwrite==1.4.3" \
  "svgpathtools==1.7.2" \
  "CairoSVG==2.9.0" \
  "psutil==7.2.2"

# --- local config + probe files ---------------------------------------------
[ -f "$GC/system.json" ] || cp "$GC/system.template.json" "$GC/system.json"
cp "$ROOT/engine/pattern-bridge/probe/stitchu_generate.py" "$GC/"
cp "$ROOT/engine/pattern-bridge/probe/stitchu_fitted_dress.yaml" "$GC/"

# --- smoke test: generate one stock pattern ---------------------------------
( cd "$GC" && PYTHONPATH=. ./.venv/bin/python stitchu_generate.py Logs/setup-check )
echo "setup OK: $GC (commit $COMMIT, python $("$GC/.venv/bin/python" -V 2>&1))"
