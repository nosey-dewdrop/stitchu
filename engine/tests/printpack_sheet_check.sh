#!/usr/bin/env bash
# T10 regresyon mandalı — BASILI PAKETİN TAŞIDIĞI SÖZLER
#
# Bu mandal iki kez düşen aynı kusuru kapatır:
#   T4: montaj sırası üretiliyordu ama sadece print-report.txt'e (DENETİM
#       dosyası) gidiyordu; alıcının eline geçen üç PDF'in hiçbirinde yoktu.
#   T10: açıklık uyarısı ("BURAYI DİKMEYİN") aynı yoldan aynı şekilde düştü.
# İkisi de "commit mesajı doğru, ürün yanlış" sınıfıydı ve ikisini de tutan
# hiçbir test yoktu: printpack Python, ctest süiti C++. Bu dosya o boşluk.
#
# İDDİA ETMEZ, ÜRETİR: spec'i motorun kendisinden (surface-pattern) alır,
# paketi basar, sonra BASILAN PDF'in içindeki metne bakar. Sessiz atlama yok —
# araç eksikse FAIL eder, çünkü koşmayan mandal düşmüş mandaldır.
#
# argv: $1 = surface-pattern ikilisi   $2 = repo kökü
set -u
SP="$1"
ROOT="$(cd "$2" && pwd)"
FAILS=0
say() { printf '%s\n' "$*"; }
fail() { say "FAIL: $*"; FAILS=$((FAILS + 1)); }

PY="$ROOT/core/third_party/garmentcode/.venv/bin/python"
[ -x "$PY" ] || { say "FAIL: printpack venv yok: $PY"; exit 1; }
command -v pdftotext >/dev/null 2>&1 || {
  say "FAIL: pdftotext (poppler) yok — basılan PDF okunamıyor, mandal sessizce"
  say "      geçemez: okunamayan pakete 'taşıyor' denemez."
  exit 1
}

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
D="$TMP/pack"
mkdir -p "$D"

"$SP" EU38 >"$D/stitchu_specification.json" 2>"$TMP/motor.txt" \
  || { say "FAIL: surface-pattern EU38 çalışmadı"; exit 1; }

# Bu mandalın konusu açıklık: spec açıklık taşımıyorsa test yargılayacak bir
# şey bulamaz. Bunu "geçti" saymak, tam olarak T10'un kaçtığı delik.
"$PY" - "$D/stitchu_specification.json" <<'EOF' || exit 1
import json, sys
spec = json.load(open(sys.argv[1]))
pat = spec.get('pattern', spec)
op = pat.get('openings') or {}
if not op.get('stitches'):
    print('FAIL: spec bir açıklık (openings) taşımıyor — yargılanacak uyarı yok')
    sys.exit(1)
EOF

"$PY" "$ROOT/engine/pattern-bridge/printpack.py" "$D" --size EU38 \
  --date 2026-01-01 >"$TMP/printpack.log" 2>&1 \
  || { say "FAIL: printpack çalışmadı"; tail -20 "$TMP/printpack.log"; exit 1; }

INFO_TXT="$TMP/info.txt"
pdftotext "$D/print-info.pdf" "$INFO_TXT" || { say "FAIL: pdftotext"; exit 1; }

# ---------------------------------------------------------------- 1. TALİMAT
# T4'ün halkası: montaj sırası basılı sayfada mı?
grep -q 'MONTAJ SIRASI' "$INFO_TXT" \
  || fail "print-info.pdf 'MONTAJ SIRASI' başlığını taşımıyor (T4 geri düştü)"
grep -Eq '[0-9]+ adim, [0-9]+ kapatan dikis' "$INFO_TXT" \
  || fail "print-info.pdf adım sayısı satırını taşımıyor"
STEPS=$(grep -cE '^[0-9]+\.$' "$INFO_TXT")
[ "$STEPS" -ge 5 ] \
  || fail "print-info.pdf'te sadece $STEPS numaralı adım var (>=5 bekleniyor)"

# ---------------------------------------------------------------- 2. AÇIKLIK
# T10'un halkası: dikilmeyecek dikiş basılı sayfada mı?
grep -q 'BURAYI DİKMEYİN' "$INFO_TXT" \
  || fail "print-info.pdf açıklık uyarısını taşımıyor (T10 geri düştü)"
grep -q 'kafadan geçmez' "$INFO_TXT" \
  || fail "print-info.pdf uyarının SONUCUNU söylemiyor (elbise kafadan geçmez)"
grep -Eq 'Fermuar: [0-9]+ inç' "$INFO_TXT" \
  || fail "print-info.pdf satın alınacak fermuar boyunu söylemiyor"

# ---------------------------------------------------------------- 3. KALIP
# Uyarı sadece talimat sayfasında kalırsa, sayfayı kaybeden alıcı kalıba bakıp
# arka ortayı diker. Kenarın kendi üstünde de yazması gerekiyor.
# NOT: pdftotext DÖNDÜRÜLMÜŞ yazıyı okumuyor (KATLAMA etiketi de görünmez),
# o yüzden kalıp etiketi PDF'in kaynağı olan SVG'de aranır — aynı dosyalardan
# aynı koşuda basılıyorlar, sha256'ları pakete giriyor.
LBL=$(grep -o 'BURAYI DİKMEYİN — FERMUAR AÇIKLIĞI' "$D"/print-svg/a0-page*.svg \
      | wc -l | tr -d ' ')
[ "$LBL" -ge 2 ] \
  || fail "A0 kalıp sayfasında açıklık etiketi $LBL kez var (>=2 bekleniyor: \
beden arka + etek arka)"
LBL4=$(grep -o 'BURAYI DİKMEYİN — FERMUAR AÇIKLIĞI' "$D"/print-svg/a4-page*.svg \
       | wc -l | tr -d ' ')
[ "$LBL4" -ge 2 ] \
  || fail "A4 kalıp sayfalarında açıklık etiketi $LBL4 kez var (>=2 bekleniyor)"

# ---------------------------------------------------------------- 4. TEK KAYNAK
# Sayfa ile denetim dosyası aynı cümleyi basmalı; ayrılabiliyorlarsa T4/T10
# tekrar olur (biri düzelir, diğeri bayatlar).
grep -q 'BURAYI DİKMEYİN' "$D/print-report.txt" \
  || fail "print-report.txt açıklık uyarısını taşımıyor"
ZIP_SHEET=$(grep -oE 'Fermuar: [0-9]+ inç' "$INFO_TXT" | head -1)
ZIP_RPT=$(grep -oE 'Fermuar: [0-9]+ inç' "$D/print-report.txt" | head -1)
[ -n "$ZIP_SHEET" ] && [ "$ZIP_SHEET" = "$ZIP_RPT" ] \
  || fail "sayfa ve rapor farklı fermuar boyu söylüyor: '$ZIP_SHEET' vs '$ZIP_RPT'"

# ---------------------------------------------------------------- 5. DETERMİNİZM
D2="$TMP/pack2"
mkdir -p "$D2"
cp "$D/stitchu_specification.json" "$D2/"
"$PY" "$ROOT/engine/pattern-bridge/printpack.py" "$D2" --size EU38 \
  --date 2026-01-01 >"$TMP/printpack2.log" 2>&1 \
  || { say "FAIL: ikinci printpack koşusu çalışmadı"; exit 1; }
for f in print-info.pdf print-a0.pdf print-a4.pdf print-report.txt; do
  cmp -s "$D/$f" "$D2/$f" || fail "$f iki koşuda bayt-özdeş değil"
done

if [ "$FAILS" -eq 0 ]; then
  say "OK printpack_sheet_check: montaj sırası + açıklık uyarısı basılı pakette \
(talimat sayfası + $LBL A0 / $LBL4 A4 kalıp etiketi), rapor ile aynı fermuar \
boyu, iki koşu bayt-özdeş"
  exit 0
fi
say "printpack_sheet_check: $FAILS FAIL"
exit 1
