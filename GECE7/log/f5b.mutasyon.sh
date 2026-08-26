#!/usr/bin/env bash
# F5-B MUTASYON KOŞUMU — GECE7, §3.8 md.3.
#
# F5-A'nın betiğinin halefi (hakem onu "iyi yazılmış" buldu; kopyalandı ve iki
# yerde SIKILDI):
#
#  1. ⚠ BAYAT İKİLİ TUZAĞI, aynen: `make` saniye karşılaştırır, ve
#     mutasyon-derle-geri-al bir saniyenin içinde kapanırsa kapı MUTASYONSUZ
#     ikiliye karşı koşar ve "yeşil — kapı değil" der. Her turda ikili SİLİNİR,
#     yeniden derlenir ve `shasum` ile GERÇEKTEN kımıldadığı kanıtlanır.
#     Kımıldamadıysa HÜKÜM VERİLMEZ, "HUKUM YOK" yazılır.
#
#  2. ⭐ `ikili` ALANI KENDİ KENDİNİ AÇIKLAR (hakemin F5-A notu). F5-A'da o alan
#     İKİ hash'in birleşimiydi ve logda yazmıyordu; hakem kaynaktan okumak
#     zorunda kaldı. Burada her satır hangi ikilileri karıştırdığını YAZAR.
#
#  3. Mutasyonlar TEK DOSYAYA SIKIŞTIRILMAZ (kartın uyarısı: hakem kapsam
#     boşluğunu tam orada bulur). Aşağıda 8 mutasyon, 6 ayrı dosya, ve
#     ÜÇÜ F5-B ajanının HİÇ YAZMADIĞI dosyalarda (surfacepattern.cpp'nin
#     kendi flatten'ı, shellprojection.cpp, curvefit yolu).
set -uo pipefail
cd "$(dirname "$0")/../.."
B=engine/build

# İKİLİ ALANININ TANIMI, LOGUN İÇİNDE: aşağıdaki `ikili` sütunu şu ÜÇ ikilinin
# shasum'larının ilk 8 karakterinin BİRLEŞİMİDİR, bu sırayla:
#     seam-plan | rotate-op | suppress-op
# Yani 24 karakterlik bir dize ve üç ayrı sayının yan yana yazılmış hâli, tek
# bir hash DEĞİL. İki tur arasında yalnız ortadaki sekizli değişmişse yalnız
# rotate-op kımıldamıştır.
BINS="seam-plan rotate-op suppress-op shell-audit"
hash_of() { shasum "$1" 2>/dev/null | cut -c1-8; }
ikili() { local o=""; for b in seam-plan rotate-op suppress-op; do o="$o$(hash_of "$B/$b")"; done; echo "$o"; }

build() {
  for b in $BINS; do rm -f "$B/$b"; done
  cmake --build "$B" -j8 --target $BINS >/dev/null 2>&1
}

run_gate() { node "$@" >/dev/null 2>&1 && echo "EXIT 0 (YESIL)" || echo "EXIT $? (KIRMIZI)"; }
nodeid() { "$B/seam-plan" EU38 --kalip 2>/dev/null | sed -n 's/.*"dugum": "\(.*\)".*/\1/p'; }

mutate() {  # ad dosya perl-ifadesi kapi...
  local ad="$1" dosya="$2" ifade="$3"; shift 3
  cp "$dosya" /tmp/f5b.orig
  build; local h0 n0; h0=$(ikili); n0=$(nodeid)
  perl -0pi -e "$ifade" "$dosya"
  if cmp -s /tmp/f5b.orig "$dosya"; then
    echo "  $ad  KAYNAK DEGISMEDI — mutasyon tutmadi, HUKUM YOK"; cp /tmp/f5b.orig "$dosya"; return
  fi
  build; local h1 n1; h1=$(ikili); n1=$(nodeid)
  if [ "$h0" = "$h1" ]; then
    echo "  $ad  IKILI KIMILDAMADI ($h0) — HUKUM YOK (bayat ikili / atil yol)"
  else
    echo "  $ad  ikili[seam-plan|rotate-op|suppress-op] $h0 -> $h1"
    echo "        dugum $n0 -> $n1"
    echo "        kapi: $(run_gate "$@")"
  fi
  cp /tmp/f5b.orig "$dosya"; build
  echo "        geri alindi: ikili $(ikili) (taban $h0) · kapi: $(run_gate "$@")"
}

SUP="engine/tests/suppress_check.mjs $B/suppress-op"
ROT="engine/tests/rotate_check.mjs $B/rotate-op $B/suppress-op"
TEK="engine/tests/tek_nesne_check.mjs $B/seam-plan $B/shell-audit"
EXP=engine/tests/expressability_check.mjs

echo "=== F5-B MUTASYONLARI — $(date '+%Y-%m-%d %H:%M') ==="
echo "    ikili sutunu = shasum ilk-8'lerin BIRLESIMI: seam-plan|rotate-op|suppress-op"
echo
echo "--- IS 0a: APEKS KUNYESI BAGLI MI (hakem mutasyonu HM1, karar K30) ---"
echo
echo "M1  engine/src/surfacepattern.hpp — HM1 AYNEN TEKRARLANIYOR"
echo "    SheathOptions::bodiceApexFrac 0.80 -> 0.60. F5-A'da rotate-op hala 0.80"
echo "    basiyordu ve rotate_check YESIL kaliyordu. Artik plan.opt'tan OKUNUYOR,"
echo "    yani kapinin R0b kolu (kunye artik bir ESIK) KIRMIZI yanmali."
mutate M1 engine/src/surfacepattern.hpp \
  's/    double bodiceApexFrac = 0\.80;/    double bodiceApexFrac = 0.60;/' \
  $ROT
echo
echo "M2  engine/tools/rotate-op.cpp — KUNYEYI GERI KOPYALA (F5-A'nin hali)"
echo "    apeks kesri motordan okunmak yerine yerel bir sabitten alinir."
echo "    R8 (iki kosum, oran) KIRMIZI yanmali: --apex-frac artik hicbir sey yapmaz."
mutate M2 engine/tools/rotate-op.cpp \
  's/        const double apexDepth = plan\.opt\.bodiceApexFrac \* colLen;/        const double kCopiedApexFrac = 0.80;  \/\/ MUTASYON\n        const double apexDepth = kCopiedApexFrac * colLen;/' \
  $ROT
echo
echo "--- IS 0b: YAYINLANAN SAYININ DOGRULUGU (hakem mutasyonu HM3, karar K30) ---"
echo
echo "M3  engine/src/shellprojection.cpp — HM3 AYNEN TEKRARLANIYOR"
echo "    bust_circumference BELIN cevresini basar. Kullaniciya inen teknik cizim"
echo "    YANLIS bir bust olcusu yayinlar. F5-A'da tek_nesne_check YESILDI."
mutate M3 engine/src/shellprojection.cpp \
  's/    out\.measures\.push_back\(\{"bust_circumference", bust\.name, girthAt\(surf, bust\.h\)\}\);/    out.measures.push_back({"bust_circumference", bust.name, girthAt(surf, waist.h)});/' \
  $TEK
echo
echo "M4  engine/src/shellprojection.cpp — OLCU DOGRU YUKSEKLIKTE AMA YANLIS NICELIK"
echo "    shoulder_width yarim genislik basar (2* carpani dusurulur). HM3'un ayni"
echo "    sinifi, baska bir yuzu: ad bir seyi soyluyor, sayi baskasini olcuyor."
mutate M4 engine/src/shellprojection.cpp \
  's/    out\.measures\.push_back\(\{"shoulder_width", shoulder\.name,\n                            2\.0 \* halfWidthAt\(surf, shoulder\.h\)\}\);/    out.measures.push_back({"shoulder_width", shoulder.name,\n                            halfWidthAt(surf, shoulder.h)});/' \
  $TEK
echo
echo "--- IS 1: op.suppress GERCEK BIR OPERATOR MU ---"
echo
echo "M5  engine/src/dartsuppress.cpp — ACIYI SABITE CEVIR (kartin 1. mutasyonu)"
echo "    deficitDeg := 41.48. Pens artik bir SAYIDAN dusmez, YAZILIR — kartin"
echo "    '41.48'i koda sabit yazmak bu karti KAPATMAZ' cumlesinin kapisi."
echo "    S1 (sevk edilen panel artik REDDETMEZ) ve S2 (aci artik SABIT) yanmali."
mutate M5 engine/src/dartsuppress.cpp \
  's/    r\.deficitDeg = panel\.developDeficitDeg;/    r.deficitDeg = 41.48;  \/\/ MUTASYON/' \
  $SUP
echo
echo "M6  engine/src/dartsuppress.cpp — KIMLIKSIZLESTIR (kartin 2. mutasyonu)"
echo "    'acildi' isaretlenir, geometriye DOKUNULMAZ. S3'un 'cikan konturda"
echo "    apeksin gerdigi aci' kolu ve 'alan gercekten gitti' kolu yanmali."
mutate M6 engine/src/dartsuppress.cpp \
  's/    r\.contour = suppressWedge\(panel\.contour, atIdx, apexDepthMM, towards, r\.wedgeDeg, &r\.apexIdx\);/    (void)atIdx; (void)apexDepthMM; (void)towards;  \/\/ MUTASYON: geometri birakildi/' \
  $SUP
echo
echo "M7  engine/src/surfacepattern.cpp — F5-B'NIN YAZMADIGI KOD YOLU (flatten'in kendisi)"
echo "    develop-deficit'in NEGATIF bantlari sifira KIRPILIR. Sevk edilen panelin"
echo "    -1.9628'i pozitife doner, op.suppress 'evet' der ve K28'in kok sebebi"
echo "    sessizce kaybolur. S1 KIRMIZI yanmali: eyeri pens yutamaz."
mutate M7 engine/src/surfacepattern.cpp \
  's/                defBand\[band\] \+= 2 \* kPi - angSum\[v\];/                defBand[band] += std::max(0.0, 2 * kPi - angSum[v]);  \/\/ MUTASYON/' \
  $SUP
echo
echo "--- §0B: SAYACIN KENDISI ---"
echo
echo "M8  contract/primitives-v1.json — UYGULANMAMIS OPERATORU UYGULANMIS SAY"
echo "    op.split kendine olmayan bir kapi (split_check) gosterir; H8-ifade"
echo "    motora tek satir yazmadan duserdi."
cp contract/primitives-v1.json /tmp/f5b.contract
python3 - <<'PY'
import json,collections
p='contract/primitives-v1.json'
d=json.load(open(p,encoding='utf8'),object_pairs_hook=collections.OrderedDict)
d['primitifler']['op.split']['motorda_kapi']='split_check'
open(p,'w',encoding='utf8').write(json.dumps(d,ensure_ascii=False,indent=2)+"\n")
PY
echo "    kapi: $(run_gate $EXP)"
cp /tmp/f5b.contract contract/primitives-v1.json
echo "        geri alindi · kapi: $(run_gate $EXP)"
echo
echo "M9  engine/tests/expressability_check.mjs — PAYDAYI DARALT (hakemin HM4'u)"
echo "    freesewing-bella listeden silinir. Muhur (TABAN_PAYDA) KIRMIZI yakmali."
echo "    ⚠ Muhre DOKUNULMUYOR; silinen GIYSI satiri, muhur degil."
cp engine/tests/expressability_check.mjs /tmp/f5b.exp
python3 - <<'PY'
import re
p='engine/tests/expressability_check.mjs'
s=open(p,encoding='utf8').read()
i=s.index('    ad: "freesewing-bella",')
j=s.index('    ad: "freesewing-aaron",')
s=s[:s.rindex('{',0,i)]+s[s.rindex('{',0,j):]
open(p,'w',encoding='utf8').write(s)
PY
echo "    kapi: $(run_gate $EXP)"
cp /tmp/f5b.exp engine/tests/expressability_check.mjs
echo "        geri alindi · kapi: $(run_gate $EXP)"
echo
echo "=== git status (temiz olmali) ==="
git status --short engine/src engine/tools engine/tests contract
