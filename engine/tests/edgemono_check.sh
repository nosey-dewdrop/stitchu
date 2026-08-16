#!/bin/sh
# edgemono_check — panel kenarı kendi üstüne geri dönüyor mu, SEKİZ BEDENDE.
#
# Neden ayrı bir kapı: panelcheck.check_self_intersection konturu tek halka
# yürütüp GERÇEK kesişme arıyor — iki adımın uçları birbirinin kesin ters
# tarafında olmak zorunda, ve dosyanın kendi sözleriyle "değme kesişme
# değildir". Dışarı çıkıp neredeyse aynı çizgi üzerinden geri katlanan bir
# kesim çizgisi gerçek kesişme üretmez: kat bir teğetliktir, determinant
# sıfırdır, halka testi kesicinin takip edemeyeceği bir parçayı GEÇİRİR.
# Bu script o deliği kapatır.
#
# Spec'ler burada TAZE üretilir (surface-pattern, 8 beden). Diskteki bir paketi
# okumak, motorun bugünkü hâlini değil geçmiş bir koşuyu mühürlerdi.
#
# kullanım: edgemono_check.sh <surface-pattern-bin> <repo-kökü>
set -eu
BIN="$1"
ROOT="$2"
OUT="${TMPDIR:-/tmp}/edgemono-check.$$"
mkdir -p "$OUT"
trap 'rm -rf "$OUT"' EXIT

# svgpathtools eğri okuyucusunun yaşadığı venv. Yoksa SESSİZ SKIP YOK: FAIL.
PY="$ROOT/core/third_party/garmentcode/.venv/bin/python"
if [ ! -x "$PY" ]; then
  echo "edgemono_check: $PY yok — sessiz skip yasak, FAIL" >&2
  exit 1
fi

SPECS=""
for S in EU34 EU36 EU38 EU40 EU42 EU44 EU46 EU48; do
  "$BIN" "$S" > "$OUT/$S.json" 2>"$OUT/$S.motor.txt"
  SPECS="$SPECS $OUT/$S.json"
done

# shellcheck disable=SC2086
"$PY" "$ROOT/engine/pattern-bridge/edgemono_check.py" $SPECS
