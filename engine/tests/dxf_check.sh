#!/bin/sh
# dxf_check — DXF-AAMA/ASTM export mandalı (PIPELINE Aşama 5, KAPI 5 adayı).
# Üç iddia, üçü de çalıştırma kanıtıyla:
#   1. Determinizm: dxf-export aynı reçete+gövde+param için İKİ koşu bayt-özdeş
#      (tarih/handle/rastgelelik yok — model in → aynı dosya out).
#   2. Yapı: üretilen .dxf STANDART bir araçla (ezdxf) açılır; AAMA/ASTM
#      layer'ları (1 sınır, 8 dikiş, 7 grainline, 4 çentik, 11 iç, 15 metin)
#      LAYER tablosunda tanımlı; $INSUNITS = mm.
#   3. mm paritesi: her layer'ın her vertex'i motorun KENDİ geometrisiyle
#      (recipe-json-dump JSON'u, aynı 24-adım flatten) ≤ 1e-4 mm eşit — sahte
#      sayı yok, exporter motorun mm'ini taşıyor.
# İki reçete üzerinde koşar (skirt.aline.dart + shift-dress top kerneli).
# ezdxf yoksa SESSİZCE ATLAMAZ: FAIL eder (kanıt aracı olmadan kapı geçilmez).
# kullanım: dxf_check.sh <dxf-export> <recipe-json-dump> <repo-kökü>
set -eu
DXF_EXPORT="$1"
JSON_DUMP="$2"
ROOT="$3"

# ezdxf venv python'u: engine/.venv-dxf (harness kurar; yoksa sistem python3
# ezdxf'siz kalır ve verify FAIL eder — dürüst).
VENV_PY="$ROOT/engine/.venv-dxf/bin/python"
if [ -x "$VENV_PY" ]; then
    PY="$VENV_PY"
else
    PY="python3"
fi

VERIFY="$ROOT/engine/tools/dxf-verify.py"
OUT="${TMPDIR:-/tmp}/dxf-check.$$"
mkdir -p "$OUT"
trap 'rm -rf "$OUT"' EXIT

check_one() {
    RECIPE="$1"; BODY="$2"; PARAM="$3"; TAG="$4"

    # 1) determinizm ×2
    "$DXF_EXPORT" "$RECIPE" "$BODY" "$PARAM" > "$OUT/$TAG.1.dxf"
    "$DXF_EXPORT" "$RECIPE" "$BODY" "$PARAM" > "$OUT/$TAG.2.dxf"
    cmp "$OUT/$TAG.1.dxf" "$OUT/$TAG.2.dxf"
    echo "[$TAG] 1) determinizm: 2 kosu bayt-ozdes"

    # motor JSON'u (parite beklentisinin kaynagi)
    "$JSON_DUMP" "$RECIPE" "$BODY" "$PARAM" > "$OUT/$TAG.motor.json"

    # 2+3) ezdxf ile ac + layer + mm paritesi
    "$PY" "$VERIFY" "$OUT/$TAG.1.dxf" "$OUT/$TAG.motor.json"
}

check_one "$ROOT/recipes/skirt-aline-dart.json"            "EU38" "450" "skirt-eu38"
check_one "$ROOT/recipes/skirt-aline-dart.json"            "pear" "650" "skirt-pear"
check_one "$ROOT/recipes/shift-dress-square-spaghetti.json" "EU38" "300" "dress-eu38"

echo "dxf_check: PASS"
