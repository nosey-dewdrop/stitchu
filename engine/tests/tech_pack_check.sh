#!/bin/sh
# tech_pack_check — üretim/fabrika paketi mandalı (PIPELINE Aşama 5/6 birleşimi).
# Bir reçeteyi TÜM EU beden serisine grade'ler ve fabrikanın istediği paketi tek
# makine-okur manifest + insan-okur PDF olarak üretir; sonra DIŞARIDAN kanıtlar.
# Beş iddia, hepsi çalıştırma kanıtıyla:
#   1. Determinizm (manifest): tech-pack aynı reçete+param+en+gsm için İKİ koşu
#      manifest.json bayt-özdeş (tarih/handle/rastgelelik yok).
#   2. Determinizm (DXF): aynı koşunun her graded DXF'i de bayt-özdeş.
#   3. Şema + çapraz-kontrol: manifest stitchu.techpack/1 şemasına uyar; her
#      marker verimi = ölçülen alan / (en × top boyu) (%.4f yuvarlama bandında);
#      gramaj verildiyse ağırlık = metre × 1.40 × gsm; grade monotonik büyür;
#      hiçbir blokta kaçak alan yok.
#   4. Graded DXF açılır: manifestin adlandırdığı HER beden DXF'i STANDART ezdxf
#      ile açılır (AAMA boundary layer "1" + $INSUNITS=mm).
#   5. PDF açılır: üretilen tech-pack.pdf STANDART bir okuyucuyla (poppler)
#      açılır, >= 2 sayfa.
# İki reçete üzerinde koşar (skirt.aline.dart + shift-dress top kerneli).
# ezdxf/poppler yoksa SESSİZCE ATLAMAZ: FAIL eder.
# kullanım: tech_pack_check.sh <tech-pack> <gen-pdf.mjs> <repo-kökü>
set -eu
TECHPACK="$1"
GENPDF="$2"
ROOT="$3"

VENV_PY="$ROOT/engine/.venv-dxf/bin/python"
if [ -x "$VENV_PY" ]; then PY="$VENV_PY"; else PY="python3"; fi
VERIFY="$ROOT/engine/tools/techpack-verify.py"

OUT="${TMPDIR:-/tmp}/tech-pack-check.$$"
mkdir -p "$OUT"
trap 'rm -rf "$OUT"' EXIT

check_one() {
    RECIPE="$1"; PARAM="$2"; WIDTH="$3"; GSM="$4"; TAG="$5"

    D1="$OUT/$TAG.1"; D2="$OUT/$TAG.2"
    mkdir -p "$D1/dxf" "$D2/dxf"

    # 1+2) determinizm ×2 (manifest + DXF bayt-özdeş)
    "$TECHPACK" "$RECIPE" "$PARAM" "$WIDTH" "$D1" --gsm "$GSM" >/dev/null
    "$TECHPACK" "$RECIPE" "$PARAM" "$WIDTH" "$D2" --gsm "$GSM" >/dev/null
    cmp "$D1/manifest.json" "$D2/manifest.json"
    for f in "$D1"/dxf/*.dxf; do
        cmp "$f" "$D2/dxf/$(basename "$f")"
    done
    echo "[$TAG] 1+2) determinizm: manifest + $(ls "$D1"/dxf | wc -l | tr -d ' ') DXF bayt-ozdes"

    # insan-okur PDF (manifestten; kendisi de deterministik, ayri satirda kanit)
    node "$GENPDF" "$D1/manifest.json" "$D1/tech-pack.pdf" >/dev/null
    node "$GENPDF" "$D2/manifest.json" "$D2/tech-pack.pdf" >/dev/null
    cmp "$D1/tech-pack.pdf" "$D2/tech-pack.pdf"
    echo "[$TAG] pdf: iki kosu bayt-ozdes"

    # 3+4+5) sema + capraz-kontrol + graded DXF acilir + PDF acilir
    "$PY" "$VERIFY" "$D1/manifest.json" "$D1/tech-pack.pdf"
}

check_one "$ROOT/recipes/skirt-aline-dart.json"            "450" "1400" "220" "skirt-eu-1400-220"
check_one "$ROOT/recipes/shift-dress-square-spaghetti.json" "300" "1400" "180" "dress-eu-1400-180"

# gsm'siz koşu da geçmeli (ağırlık dürüstçe null; verify null'ı doğrular).
D3="$OUT/skirt-nogsm"; mkdir -p "$D3/dxf"
"$TECHPACK" "$ROOT/recipes/skirt-aline-dart.json" "450" "900" "$D3" >/dev/null
node "$GENPDF" "$D3/manifest.json" "$D3/tech-pack.pdf" >/dev/null
"$PY" "$VERIFY" "$D3/manifest.json" "$D3/tech-pack.pdf"
echo "[skirt-nogsm] gramaj yok: agirlik null, sema + acilir kanit gecti"

echo "tech_pack_check: PASS"
