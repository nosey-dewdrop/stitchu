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
# A4'te SAYMAK YETMEZ: her karo panelin TAMAMINI çizip pencereyle kırpıyor, o
# yüzden etiket 10 SVG'de "var" ama çoğunda karonun dışında kalıyor. Şart:
# her etiketin çapası EN AZ BİR karonun 21x29.7 penceresine düşsün.
LBL4=$("$PY" - "$D" <<'EOF'
import glob, re, sys
seen = set()
for f in sorted(glob.glob(sys.argv[1] + '/print-svg/a4-page*.svg')):
    s = open(f).read()
    m = re.search(r'translate\(([-0-9.]+),([-0-9.]+)\)', s)
    if not m:
        continue
    tx, ty = float(m.group(1)), float(m.group(2))
    for rot in re.findall(
            r'transform="rotate\(([^)]*)\)"[^>]*>BURAYI DİKMEYİN', s):
        _, ax, ay = [float(v) for v in rot.split()]
        x, y = ax + tx, ay + ty
        if 0 <= x <= 21.0 and 0 <= y <= 29.7:
            seen.add((round(ax, 3), round(ay, 3)))
print(len(seen))
EOF
)
[ "${LBL4:-0}" -ge 2 ] \
  || fail "A4 karolarında GÖRÜNÜR açıklık etiketi $LBL4 tane (>=2 bekleniyor: \
etiket her karoda çiziliyor ama çoğunda pencerenin dışında kalıyor)"

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

# =========================================================================
# ==== 8C BLOĞU BAŞLANGIÇ (H1.1a + H1.1b) — bu blok dışına dokunulmadı ====
# =========================================================================
# ---------------------------------------------------------------- 6. NESTING
# H1.1a. Şartname §3 "nesting yarım parçalarla: sayfa sayısı önce/sonra
# raporlanır" diyor. Kazanç ŞART DEĞİL, ÖLÇÜM şart: bugün kazanç 0 ve 0 da
# basılmak zorunda. Bu mandal sayının VARLIĞINI değil, DOĞRULUĞUNU tutuyor:
# basılan sayfa sayısı gerçekten basılan PDF'in sayfa sayısına eşit olmalı,
# yoksa "15 sayfa" yazan bir kalıp 16 sayfa çıkar.
grep -q 'NESTING — half pieces' "$D/print-report.txt" \
  || fail "print-report.txt nesting önce/sonra bloğunu taşımıyor (H1.1a)"
grep -Eq 'A4 pages: [0-9]+ whole -> [0-9]+ folded' "$D/print-report.txt" \
  || fail "print-report.txt A4 önce/sonra satırını taşımıyor"
grep -Eq 'A0 pages: [0-9]+ whole -> [0-9]+ folded' "$D/print-report.txt" \
  || fail "print-report.txt A0 önce/sonra satırını taşımıyor"
grep -q 'BASKI: A4' "$INFO_TXT" \
  || fail "print-info.pdf sayfa sayısını (BASKI satırı) taşımıyor — rapor \
dosyası alıcının eline geçmiyor (T4/T10 sınıfı)"

if command -v pdfinfo >/dev/null 2>&1; then
  A4_REAL=$(pdfinfo "$D/print-a4.pdf" | awk '/^Pages:/{print $2}')
  A0_REAL=$(pdfinfo "$D/print-a0.pdf" | awk '/^Pages:/{print $2}')
  A4_SAID=$(grep -oE 'A4 pages: [0-9]+ whole -> [0-9]+ folded' \
            "$D/print-report.txt" | awk '{print $6}')
  A0_SAID=$(grep -oE 'A0 pages: [0-9]+ whole -> [0-9]+ folded' \
            "$D/print-report.txt" | awk '{print $6}')
  [ "$A4_SAID" = "$A4_REAL" ] \
    || fail "nesting 'sonra' A4 sayısı $A4_SAID, basılan print-a4.pdf $A4_REAL sayfa"
  [ "$A0_SAID" = "$A0_REAL" ] \
    || fail "nesting 'sonra' A0 sayısı $A0_SAID, basılan print-a0.pdf $A0_REAL sayfa"
  A4_SHEET=$(grep -oE 'BASKI: A4 [0-9]+ sayfa' "$INFO_TXT" | awk '{print $3}')
  [ "$A4_SHEET" = "$A4_REAL" ] \
    || fail "alıcının sayfası A4 $A4_SHEET sayfa diyor, PDF $A4_REAL sayfa"
else
  fail "pdfinfo (poppler) yok — basılan sayfa sayısı doğrulanamıyor"
fi

# ----------------------------------------------------------------- 7. KUMAS
# H1.1b. Şartname §4 "kumaş önerisi, weight/drape GEREKÇESİYLE" diyor. Üç şart
# ve üçü de ayrı bir yalanı kapatıyor:
#   (a) sayfa var mı           — paket kumaş türünü hiç söylemiyordu,
#   (b) gerekçe var mı         — isim tek başına öneri değil,
#   (c) isim KAYNAKTAN mı      — en önemlisi. Basılan kumaş adı
#       knowledge/stitchu.db'nin fabrics tablosunda GERÇEKTEN olmalı; elle
#       yazılmış bir kumaş adı bu satırdan geçemez.
# satır BAŞLIĞIN kendisi olmalı: s.1'in "…KUMAS SECIMI sayfasi" işaretçisi
# sayfanın yerine geçemez (M2 mutasyonu tam buradan sızıyordu)
grep -q '^KUMAS SECIMI$' "$INFO_TXT" \
  || fail "print-info.pdf KUMAS SECIMI sayfasını taşımıyor (H1.1b)"
grep -q 'ONERILEN:' "$INFO_TXT" \
  || fail "print-info.pdf önerilen kumaşı adıyla söylemiyor"
grep -q 'KACININ:' "$INFO_TXT" \
  || fail "print-info.pdf kaçınılacak kumaşları söylemiyor"
grep -Eq 'agirlik: [0-9]+-[0-9]+ g/m2' "$INFO_TXT" \
  || fail "print-info.pdf kumaş AĞIRLIĞINI (gramaj) söylemiyor — \
şartname weight/drape gerekçesi istiyor"
grep -q 'acilma orani' "$INFO_TXT" \
  || fail "print-info.pdf öneriyi kalıbın kendi ölçüsüne bağlamıyor \
(döküm gerekçesi yok, genel liste olur)"
grep -q 'knowledge/stitchu.db' "$INFO_TXT" \
  || fail "print-info.pdf kumaş önerisinin kaynağını söylemiyor"

DBOK=$("$PY" - "$ROOT" "$INFO_TXT" <<'EOF'
import re, sqlite3, sys, unicodedata
root, txt = sys.argv[1], sys.argv[2]
db = root + '/knowledge/stitchu.db'
try:
    con = sqlite3.connect('file:%s?mode=ro' % db, uri=True)
    names = {r[0] for r in con.execute('SELECT name FROM fabrics')}
    con.close()
except Exception as e:
    print('NODB %s' % e)
    raise SystemExit
body = open(txt, encoding='utf-8', errors='replace').read()
body = ''.join(c for c in unicodedata.normalize('NFKD', body)
               if not unicodedata.combining(c))
body = body.replace('-\n', '').replace('\n', ' ')
m = re.search(r'ONERILEN:(.*?)agirlik:', body, re.S)
hit = sorted(n for n in names if m and n in m.group(1))
print('OK %d %s' % (len(hit), ','.join(hit)) if hit else 'MISS')
EOF
)
case "$DBOK" in
  OK*) : ;;
  *) fail "basılan kumaş adı knowledge/stitchu.db fabrics tablosunda YOK \
($DBOK) — öneri kaynaktan gelmiyor, elle yazılmış olabilir" ;;
esac
# =========================================================================
# ==== 8C BLOĞU SON ========================================================
# =========================================================================

if [ "$FAILS" -eq 0 ]; then
  say "OK printpack_sheet_check: montaj sırası + açıklık uyarısı basılı pakette \
(talimat sayfası + $LBL A0 / $LBL4 A4 kalıp etiketi), rapor ile aynı fermuar \
boyu, iki koşu bayt-özdeş; nesting önce/sonra basılı ve basılan sayfa sayısı \
PDF ile aynı; kumaş önerisi $DBOK (stitchu.db fabrics)"
  exit 0
fi
say "printpack_sheet_check: $FAILS FAIL"
exit 1
