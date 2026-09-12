#!/bin/sh
# nest_marker_check — MARKER export mandalı (PIPELINE Aşama 6, marker/yerleşim).
# nest_check (C++) overlap==0'ı MOTORUN kendi tipleriyle kanıtlar; bu test aynı
# marker'ı DIŞARIDAN kanıtlar — bağımsız bir CAD (ezdxf) + bağımsız bir geometri
# çekirdeği (shapely/pure-python):
#   1. Determinizm: nest-marker aynı reçete+gövde+param+en için İKİ koşu
#      bayt-özdeş (marker DXF'i; tarih/handle/rastgelelik yok).
#   2. Dış CAD: üretilen marker .dxf STANDART ezdxf ile açılır; AAMA boundary
#      layer "1" var; $INSUNITS = mm.
#   3. Sınır: her parça kumaş şeridinin içinde [0,W] x [-L,0] (DXF y-up).
#   4. Overlap=0 dış çekirdekle: hiçbir iki parça çakışmıyor (üçüncü-taraf
#      geometri motorunun gördüğü de sıfır) — iddia CAD + geometri turundan sağ.
# İki reçete + iki endüstri kumaş eni üzerinde koşar.
# ezdxf yoksa SESSİZCE ATLAMAZ: FAIL eder.
# kullanım: nest_marker_check.sh <nest-marker> <repo-kökü>
set -eu
NEST="$1"
ROOT="$2"

VENV_PY="$ROOT/engine/.venv-dxf/bin/python"
if [ -x "$VENV_PY" ]; then PY="$VENV_PY"; else PY="python3"; fi
VERIFY="$ROOT/engine/tools/nest-verify.py"

OUT="${TMPDIR:-/tmp}/nest-marker-check.$$"
mkdir -p "$OUT"
trap 'rm -rf "$OUT"' EXIT

check_one() {
    RECIPE="$1"; BODY="$2"; PARAM="$3"; WIDTH="$4"; TAG="$5"

    # 1) determinizm ×2 (marker DXF bayt-özdeş)
    "$NEST" "$RECIPE" "$BODY" "$PARAM" "$WIDTH" --dxf "$OUT/$TAG.1.dxf" >/dev/null
    "$NEST" "$RECIPE" "$BODY" "$PARAM" "$WIDTH" --dxf "$OUT/$TAG.2.dxf" >/dev/null
    cmp "$OUT/$TAG.1.dxf" "$OUT/$TAG.2.dxf"
    echo "[$TAG] 1) determinizm: 2 kosu bayt-ozdes"

    # 2+3+4) ezdxf ile ac + layer + sinir + dis-cekirdek overlap=0
    "$PY" "$VERIFY" "$OUT/$TAG.1.dxf" "$WIDTH"
}

check_one "$ROOT/recipes/skirt-aline-dart.json"            "EU38" "450" "1400" "skirt-eu38-1400"
check_one "$ROOT/recipes/skirt-aline-dart.json"            "pear" "650" "900"  "skirt-pear-900"
check_one "$ROOT/recipes/shift-dress-square-spaghetti.json" "EU38" "300" "1400" "dress-eu38-1400"
check_one "$ROOT/recipes/shift-dress-square-spaghetti.json" "pear" "420" "900"  "dress-pear-900"

echo "nest_marker_check: PASS"
