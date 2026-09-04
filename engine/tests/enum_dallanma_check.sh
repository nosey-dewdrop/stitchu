#!/bin/bash
# enum_dallanma_check.sh — KAPI A: ENUM DALLANMA CIRCIRI (F0, 2026-09-05).
#
# NEDEN VAR. HEDEF.md madde 9: sozluk bust/kol/heartneck gibi sabit tabirlerden
# yapilmayacak; Edge/Panel/Stitch primitifleriyle ilerlenecek. Bugun engine/src
# icindeki CIZIM kodu `switch (spec.neckline)` / `case Neckline::VNeck` /
# `== SleeveStyle::Balloon` dallariyla cizer: her dal, menudeki bir kelimeye
# gomulmus bir ozel durumdur ve menuyu buyutmeden yeni bir giysi cizilemez.
# Bu kapi o dallarin SAYISINI olcer ve bir circir kurar: sayi ARTAMAZ (kirmizi),
# azalinca yeni taban yazilir. F3'un bitis sarti: 0.
#
# NE SAYAR. engine/src altindaki her .cpp/.hpp'de (giris katmani HARIC:
# specparse.hpp, *.gen.hpp; engine/wasm/bindings.cpp zaten kapsam disi),
# asagidaki SPEC ENUM'lari uzerine:
#   (1) `case <Enum>::Deger`     — switch dali
#   (2) `== <Enum>::Deger` / `!= <Enum>::Deger` / `<Enum>::Deger ==` — karsilastirma
# Iki sayi toplanir. Tek satirdaki birden fazla eslesme ayri ayri sayilir
# (grep -o). Yorum satirlari da sayilir (vocab_reference_check ile ayni
# gerekce: kararlilik dogruluktan once; yorumdaki `case X::Y` zaten koddan
# kopyalanmis bir daldir).
#
# SPEC ENUM NEDIR. engine/src/*.hpp icinde `enum class` ile tanimlanan her tip,
# su UC istisna disinda: CmdType (geometry.hpp, yol komutu — cizim cekirdegi,
# giysi sozlugu degil), SpringKind (drape.hpp, fizik yayi), Girth
# (fabricease.hpp, beden HALKASI adi — contract/body-v1.json halkalarina
# karsilik gelir, menu degil). .cpp icinde tanimlanan enum'lar (recipe.cpp'nin
# JSON ayristirici T/K/Op tipleri) spec degil, sayilmaz. Liste her kosuda
# grep ile yeniden cikarilir ve basilir; elle tutulan enum listesi yoktur.
#
# TABAN. engine/tests/enum-dallanma-baseline.json: {"toplam": N, "dosya": {...},
# "enum": {...}}. Kapi toplami tabanla karsilastirir:
#   toplam > taban  -> KIRMIZI (menuye dal eklendi; madde 9 ihlali)
#   toplam == taban -> yesil
#   toplam < taban  -> yesil, taban dosyasi YENI toplamla yeniden yazilir
#                      (brief: "azalis yeni taban"); commit'e girer, diff'te gorunur.
# Dosya/enum dagilimi bilgi icindir, circir yalniz toplam uzerindedir (kodun
# dosyalar arasi tasinmasi kirmizi olmasin diye).
#
# KULLANIM
#   bash engine/tests/enum_dallanma_check.sh            # kapi
#   bash engine/tests/enum_dallanma_check.sh --measure  # dagilimi bas, taban karsilastirma yok
#   bash engine/tests/enum_dallanma_check.sh --baseline # tabani bugunku sayiyla kes (ilk kurulum)
set -uo pipefail
cd "$(dirname "$0")/../.."
SRC=engine/src
BASE=engine/tests/enum-dallanma-baseline.json
MODE="${1:-gate}"

# grep -E (BSD/GNU ortak): ripgrep bu makinede kurulu degil (rg bir shell
# fonksiyonu), ctest altinda hicbir kabuk fonksiyonu yok — bu yuzden grep.

# --- spec enum listesi -------------------------------------------------------
EXCL_ENUM='^(CmdType|SpringKind|Girth)$'
ENUMS=$(grep -ohE 'enum class [A-Za-z_]+' $SRC/*.hpp | sed 's/enum class //' \
        | grep -vE "$EXCL_ENUM" | sort -u)
[ -n "$ENUMS" ] || { echo "FAIL  hic spec enum bulunamadi"; exit 2; }
N_ENUM=$(echo "$ENUMS" | wc -l | tr -d ' ')

# --- kapsam: cizim dosyalari ------------------------------------------------
FILES=$(ls $SRC/*.cpp $SRC/*.hpp | grep -vE 'specparse\.hpp$|\.gen\.hpp$' | sort)

ALT=$(echo "$ENUMS" | paste -sd'|' -)
RE_CASE="case[[:space:]]+(${ALT})::[A-Za-z_]+"
RE_CMP="([=!]=[[:space:]]*(${ALT})::[A-Za-z_]+|(${ALT})::[A-Za-z_]+[[:space:]]*[=!]=)"

TMP=$(mktemp)
for f in $FILES; do
  grep -ohE "$RE_CASE|$RE_CMP" "$f" 2>/dev/null | while read -r m; do
    e=$(echo "$m" | grep -oE "(${ALT})::" | head -1 | sed 's/:://')
    echo "$(basename "$f") $e"
  done
done > "$TMP"

TOTAL=$(wc -l < "$TMP" | tr -d ' ')
DIST_FILE=$(awk '{print $1}' "$TMP" | sort | uniq -c | sort -rn | awk '{printf "    \"%s\": %d,\n", $2, $1}' | sed '$ s/,$//')
DIST_ENUM=$(awk '{print $2}' "$TMP" | sort | uniq -c | sort -rn | awk '{printf "    \"%s\": %d,\n", $2, $1}' | sed '$ s/,$//')
rm -f "$TMP"

write_baseline() {
  {
    echo "{"
    echo "  \"_ne\": \"enum_dallanma_check.sh circir tabani. Toplam ARTAMAZ. Azalis bu dosyayi otomatik yeniden yazar. Sayim: case <SpecEnum>::X + [=!]= <SpecEnum>::X, engine/src/*.cpp|*.hpp, specparse.hpp ve *.gen.hpp haric. Hedef (F3 sonu): 0.\","
    echo "  \"_kesildi\": \"$(date +%Y-%m-%d) $(git rev-parse --short HEAD 2>/dev/null || echo '?')\","
    echo "  \"specEnumSayisi\": $N_ENUM,"
    echo "  \"toplam\": $TOTAL,"
    echo "  \"dosya\": {"; echo "$DIST_FILE"; echo "  },"
    echo "  \"enum\": {"; echo "$DIST_ENUM"; echo "  }"
    echo "}"
  } > "$BASE"
}

echo "spec enum ($N_ENUM): $(echo "$ENUMS" | paste -sd' ' -)"
echo "kapsam: $(echo "$FILES" | wc -l | tr -d ' ') dosya (engine/src, specparse/gen haric)"
echo "toplam dallanma: $TOTAL"

if [ "$MODE" = "--measure" ]; then
  echo "--- dosya dagilimi"; echo "$DIST_FILE" | sed 's/^    //; s/,$//'
  echo "--- enum dagilimi"; echo "$DIST_ENUM" | sed 's/^    //; s/,$//'
  exit 0
fi

if [ "$MODE" = "--baseline" ]; then
  write_baseline; echo "taban yazildi: $BASE (toplam $TOTAL)"; exit 0
fi

[ -f "$BASE" ] || { echo "FAIL  taban yok: $BASE  (once --baseline)"; exit 1; }
FLOOR=$(python3 -c "import json;print(json.load(open('$BASE'))['toplam'])")
echo "taban: $FLOOR"
if [ "$TOTAL" -gt "$FLOOR" ]; then
  echo "FAIL  enum dallanma ARTTI: $FLOOR -> $TOTAL (+$((TOTAL-FLOOR))). HEDEF madde 9: menuye dal eklenmez; formul parametreyle degisir."
  echo "      hangi dosya: bash engine/tests/enum_dallanma_check.sh --measure  | diff ile $BASE"
  exit 1
elif [ "$TOTAL" -lt "$FLOOR" ]; then
  write_baseline
  echo "OK    enum dallanma AZALDI: $FLOOR -> $TOTAL (-$((FLOOR-TOTAL))). yeni taban yazildi: $BASE (commit et)"
else
  echo "OK    enum dallanma sabit: $TOTAL (hedef 0)"
fi
exit 0
