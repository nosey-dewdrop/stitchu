#!/usr/bin/env bash
# gradeset.sh — EU34..EU48 beden serisi + GRADE DENETIMI.
#
#   scripts/gradeset.sh default                       # SEVK EDILEN motor (varsayilan)
#   scripts/gradeset.sh default --motor garmentcode   # ARSIV hat
#   scripts/gradeset.sh path/to/durum.json [--motor M]
# Cikti: Logs/gradeset-<motor>-<tarih>/
#
# ---------------------------------------------------------------------------
# TUR 15 (17 Agu) — BU KAPI SEVK EDILMEYEN BIR MOTORU YARGILIYORDU.
# `scripts/taban.sh` (vardiya muhru) engine/build/surface-pattern'i, bu script
# ise generate.py -> GarmentCode hattini kosuyordu: 8 bedeni IKI AYRI HARNESS,
# IKI AYRI MOTORDA gradeliyorduk. HEDEF.md: "iki dogru birakilmaz."
#
# Karar (a): bu kapi SEVK EDILEN motora baglandi. Arsiv hat SILINMEDI —
# `--motor garmentcode` ile adiyla cagriliyor, cunku `green and unsewable` ve
# 22704 hucre sayilari o hattan cikti ve onu oldurmek o sayilarin tekrar
# uretilebilirligini oldururdu.
# ---------------------------------------------------------------------------
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV_PY="$ROOT/core/third_party/garmentcode/.venv/bin/python"
SURFACE_BIN="${STITCHU_SURFACE_BIN:-$ROOT/engine/build/surface-pattern}"

# walk.py (svgpathtools) ve cairosvg bu venv'de; motor secimi bunu degistirmez.
if [[ ! -x "$VENV_PY" ]]; then
  echo "GarmentCode venv yok: $VENV_PY" >&2
  echo "once scripts/setup-garmentcode.sh calistir" >&2
  exit 1
fi

# Varsayilan motor `surface`. Motor adi acikca verilmediyse sevk edilen ikili
# DERLENMIS OLMALI — yoksa kapi sessizce "kosulamadi" diye gecmez, duser.
if [[ " $* " != *" --motor "* && ! -x "$SURFACE_BIN" ]]; then
  echo "sevk edilen motor derlenmemis: $SURFACE_BIN" >&2
  echo "  cmake -S engine -B engine/build -DCMAKE_BUILD_TYPE=Release \\" >&2
  echo "  && cmake --build engine/build -j8" >&2
  echo "  (ya da STITCHU_SURFACE_BIN=<yol>)" >&2
  exit 1
fi

export STITCHU_SURFACE_BIN="$SURFACE_BIN"
exec "$VENV_PY" "$ROOT/engine/pattern-bridge/gradeset.py" "${1:-default}" "${@:2}"
