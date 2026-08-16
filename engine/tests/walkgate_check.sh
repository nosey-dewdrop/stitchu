#!/bin/sh
# walkgate_check — DİKİŞ TAPUSU BİR KAPI MI, SEKİZ BEDENDE.
#
# Neden var: 17 Ağu'ya kadar walk.py bir kapı değil, bir YAZICI'ydı. main()
# raporu basıyor ve None döndürüyordu, yani süreç ne bulursa bulsun 0 ile
# çıkıyordu. scripts/taban.sh o exit koduna bakıp sekiz bedenin sekizine de
# `walk:OK` yazdı; aynı anda 64 panelin 60'ında kontur kendini kesiyordu ve
# walk.py bunu KENDİ raporunda FAIL diye basıyordu. Hükmünü veren ama hükmünü
# kimseye iletemeyen hakem, hakem değildir.
#
# Bu kapı walk.py'ın exit kodunu bağlar: hüküm sınıfından (dikiş / kol oyuğu
# grubu / kapalı kontur / kendini kesme / ayna) tek bir FAIL varsa süit
# KIRMIZI. Hangi bulgunun hüküm hangisinin bilgi olduğu walk.py içinde gate()
# başlığında yazılı; eşik burada gevşetilmez, sınıf burada taşınmaz.
#
# Spec'ler TAZE üretilir (surface-pattern, 8 beden) — diskteki bir paketi
# okumak motorun bugünkü hâlini değil geçmiş bir koşuyu mühürlerdi.
#
# kullanım: walkgate_check.sh <surface-pattern-bin> <repo-kökü>
set -eu
BIN="$1"
ROOT="$2"
OUT="${TMPDIR:-/tmp}/walkgate-check.$$"
mkdir -p "$OUT"
trap 'rm -rf "$OUT"' EXIT

# svgpathtools eğri okuyucusunun yaşadığı venv. Yoksa SESSİZ SKIP YOK: FAIL.
PY="$ROOT/core/third_party/garmentcode/.venv/bin/python"
if [ ! -x "$PY" ]; then
  echo "walkgate_check: $PY yok — sessiz skip yasak, FAIL" >&2
  exit 1
fi

RED=0
TOTAL=0
for S in EU34 EU36 EU38 EU40 EU42 EU44 EU46 EU48; do
  "$BIN" "$S" > "$OUT/$S.json" 2>"$OUT/$S.motor.txt"
  if "$PY" "$ROOT/engine/pattern-bridge/walk.py" "$OUT/$S.json" \
       --out-txt "$OUT/$S.walk.txt" > "$OUT/$S.walk.log" 2>&1; then
    RC=0
  else
    RC=$?
  fi
  LINE=$(grep '^KAPI  hukum-FAIL' "$OUT/$S.walk.txt" 2>/dev/null || true)
  N=$(printf '%s' "$LINE" | sed -n 's/^KAPI  hukum-FAIL: \([0-9]*\).*/\1/p')
  N=${N:-0}
  TOTAL=$((TOTAL + N))

  # Kapının kendisi de denetlenir: exit kodu ile rapordaki hüküm sayısı
  # birbirini tutmuyorsa kapı yine sahtedir.
  if [ "$RC" -eq 0 ] && [ "$N" -ne 0 ]; then
    echo "walkgate_check: $S — walk.py 0 ile çıktı ama $N hüküm-FAIL bastı" >&2
    RED=$((RED + 1))
  fi
  if [ "$RC" -ne 0 ] && [ "$N" -eq 0 ]; then
    echo "walkgate_check: $S — walk.py $RC ile çıktı ama hüküm-FAIL 0" >&2
    RED=$((RED + 1))
  fi

  if [ "$N" -ne 0 ]; then
    echo "$S  KIRMIZI  ${LINE#KAPI  }" >&2
    RED=$((RED + 1))
  else
    echo "$S  yeşil"
  fi
done

if [ "$RED" -ne 0 ]; then
  echo "walkgate_check: 8 bedende toplam $TOTAL hüküm-FAIL — DİKİLEMEZ" >&2
  echo "walkgate_check: bu kapı boyanmaz. Kusur T8/H1.0'ın alanında." >&2
  exit 1
fi
echo "walkgate_check: 8 beden, hüküm-FAIL 0"
exit 0
