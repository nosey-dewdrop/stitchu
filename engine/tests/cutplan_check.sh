#!/bin/sh
# cutplan_check — KESİM PLANI BİR KAPI MI, SEKİZ BEDENDE.
#
# Neden var: 17 Ağu'ya kadar cutplan.py'ın HİÇBİR HÜKMÜ yoktu. Exit kodu yok,
# __main__ yok. En sert bulgusu — `name_disagreement`: "X, Y'nin aynası diye
# adlandırılmış ama konturlar tutmuyor" — print-report.txt'ye BASILAN BİR
# CÜMLEYDİ, başka hiçbir şey değil.
#
# Bu, Tur 12/13'ün ayna-dikiş kusurunun TAM OLARAK sınıfı: o kusur da bir
# cümle olarak basılıyordu, kimse okumuyordu, ve 8 bedenin 5'inde sevk edilen
# giyside duruyordu. Hükmünü veren ama hükmünü kimseye iletemeyen hakem,
# hakem değildir — walkgate_check.sh'ın başlığındaki aynı cümle.
#
# Hangi bulgunun hüküm hangisinin bilgi olduğu cutplan.py'ın verdict()
# başlığında yazılı. Kısaca: `rivals` (aynı kontur, farklı kenar bölünmesi)
# BİLGİDİR — cutplan'ın doğru cevabıdır, ikisini ayrı çizer. Onu kırmızı
# saymak doğru bir cevaptan sahte bir kusur uydurmak olurdu.
#
# Spec'ler TAZE üretilir (surface-pattern, 8 beden).
#
# kullanım: cutplan_check.sh <surface-pattern-bin> <repo-kökü>
set -eu
BIN="$1"
ROOT="$2"
OUT="${TMPDIR:-/tmp}/cutplan-check.$$"
mkdir -p "$OUT"
trap 'rm -rf "$OUT"' EXIT

PY="$ROOT/core/third_party/garmentcode/.venv/bin/python"
if [ ! -x "$PY" ]; then
  echo "cutplan_check: $PY yok — sessiz skip yasak, FAIL" >&2
  exit 1
fi

SPECS=""
for S in EU34 EU36 EU38 EU40 EU42 EU44 EU46 EU48; do
  "$BIN" "$S" > "$OUT/$S.json" 2>"$OUT/$S.motor.txt"
  SPECS="$SPECS $OUT/$S.json"
done

# Sayım önce: plan sıfır panel üstünde de kusursuz görünür.
# shellcheck disable=SC2086
"$PY" "$ROOT/engine/tests/spec_census.py" 8 $SPECS

cd "$ROOT/engine/pattern-bridge"
# shellcheck disable=SC2086
"$PY" cutplan.py $SPECS
