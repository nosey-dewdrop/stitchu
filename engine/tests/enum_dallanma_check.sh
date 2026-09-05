#!/bin/bash
# enum_dallanma_check.sh — KAPI A: ENUM DALLANMA CIRCIRI (F0, 2026-09-05; F0 hakem turu ile duzeltildi).
#
# NEDEN VAR. HEDEF.md madde 9: sozluk bust/kol/heartneck gibi sabit tabirlerden
# yapilmayacak; Edge/Panel/Stitch primitifleriyle ilerlenecek. Bugun engine/src
# icindeki CIZIM kodu `switch (spec.neckline)` / `case Neckline::VNeck` /
# `== SleeveStyle::Balloon` dallariyla cizer: her dal, menudeki bir kelimeye
# gomulmus bir ozel durumdur ve menuyu buyutmeden yeni bir giysi cizilemez.
# Bu kapi o dallarin SAYISINI olcer ve bir circir kurar: sayi ARTAMAZ (kirmizi).
# Azalis tabani KENDILIGINDEN dusurmez: yesil kalir ve "--baseline ile kes" der;
# taban dususu bilincli, ayri bir commit'tir (vocab_reference_check modeli,
# karar ajani #4). F3'un bitis sarti: 0.
#
# UC KOVA (ucu de baseline'da, ucu de ayri circir):
#
#  (1) cpp.dallanma — engine/src altindaki her .cpp/.hpp'de (giris katmani HARIC:
#      specparse.hpp, *.gen.hpp; engine/wasm/bindings.cpp zaten kapsam disi),
#      SPEC ENUM'lar uzerine:
#        `case <Enum>::Deger`                             — switch dali
#        `== <Enum>::Deger` / `!= <Enum>::Deger` / `<Enum>::Deger ==` — karsilastirma
#      Tek satirdaki birden fazla eslesme ayri sayilir (grep -o). Yorum satirlari
#      da sayilir (kararlilik dogruluktan once; yorumdaki `case X::Y` koddan
#      kopyalanmis bir daldir).
#      SERIALIZASYON SAYILMAZ: `case <Enum>::X: return "...";` satirlari (enum ->
#      string ad tablosu; measurements.hpp raw(), sleeve.hpp, openback.cpp) cizim
#      dali degildir, ayri kovada (cpp.serializasyon) basilir ve toplama GIRMEZ.
#      F0 hakemi: ilk tabanin 488'inin 52'si buydu; bunlar toplamda kalsaydi ad
#      tablosunu tasimak "dal azalttim" diye sahte ilerleme uretebilirdi.
#
#  (2) js.dallanma — flat'i bugun cizen JS kalemi (web/lib/flat-*.js,
#      web/lib/arka-koken.js): `=== 'kelime'` / `!== 'kelime'` string-literal
#      dallari. Haric: yol komutu turleri (close/move/line/curve — CmdType'in JS
#      karsiligi) ve typeof sonuclari (number/object/string/undefined/function/
#      boolean). Kalan her literal (tur === 'gomlek', 'dik', 'yatik', 'pens',
#      which === 'on', yon === 'disari' ...) bir menu/ozel-durum dalidir.
#      F0 hakemi [ENGEL]: satilacak flat'i cizen kalem web/lib/flat-from-pattern.js
#      (2551 satir) ve kapi ona kordu. F2 flat'i C++'a tasiyinca bu kova 0 olur
#      (dosya silinir ya da yalniz SVG serializasyonu kalir).
#
#  (3) js.sabitMM — ayni JS dosyalarinda `const/let/var <AD>_MM = <sayi>`
#      satirlari: koda gomulu mm sabiti (MANKEN_FARK_CEYREK_MM = 12.7417,
#      MANKEN_KALCA_DERINLIK_MM = 200). HEDEF madde 4/5: beden sayisi
#      contract/body-v1.json'dan okunur, koda gomulmez. Hedef 0.
#
# SPEC ENUM NEDIR. engine/src/*.hpp icinde `enum class` ile tanimlanan her tip,
# su UC istisna disinda: CmdType (geometry.hpp, yol komutu — cizim cekirdegi,
# giysi sozlugu degil), SpringKind (drape.hpp, fizik yayi), Girth
# (fabricease.hpp, beden HALKASI adi — contract/body-v1.json halkalarina
# karsilik gelir, menu degil). .cpp icinde tanimlanan enum'lar (recipe.cpp'nin
# JSON ayristirici T/K/Op tipleri) spec degil, sayilmaz. Liste her kosuda
# grep ile yeniden cikarilir ve basilir; elle tutulan enum listesi yoktur.
#
# TABAN. engine/tests/enum-dallanma-baseline.json:
#   {"toplam": N, "cpp": {"dallanma", "serializasyon", "dosya", "enum"},
#    "js": {"dallanma", "sabitMM", "dosya"}}
#   toplam = cpp.dallanma (ana circir; F3 hedefi 0)
#   js.dallanma ve js.sabitMM ayri circir (her biri kendi tabanini ASAMAZ; F2 hedefi 0)
#   cpp.serializasyon bilgi icindir, circir degil.
# Gate modu:
#   herhangi bir circir > taban -> KIRMIZI (menuye dal / sabite sayi eklendi)
#   hepsi == taban              -> yesil
#   biri < taban                -> yesil, "taban dusurulebilir: --baseline (commit et)" basar;
#                                  dosya YAZILMAZ (ctest kaynak agacina yazmaz).
# Eski taban dosyasi (tek "toplam", cpp+serializasyon karisik) okunursa js
# alanlari yok sayilir; ilk --baseline ile yeni sema yazilir.
#
# KULLANIM
#   bash engine/tests/enum_dallanma_check.sh            # kapi
#   bash engine/tests/enum_dallanma_check.sh --measure  # dagilimi bas, taban karsilastirma yok
#   bash engine/tests/enum_dallanma_check.sh --baseline # tabani bugunku sayiyla kes (bilincli commit)
set -uo pipefail
cd "$(dirname "$0")/../.."
SRC=engine/src
JSFILES=$(ls web/lib/flat-*.js web/lib/arka-koken.js 2>/dev/null | sort)
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
RE_SER="case[[:space:]]+(${ALT})::[A-Za-z_]+:[[:space:]]*return[[:space:]]+\""

TMP=$(mktemp); TMPS=$(mktemp)
for f in $FILES; do
  # serializasyon satirlari once ayrilir; kalan satirlarda dallar sayilir
  grep -E "$RE_SER" "$f" 2>/dev/null | sed "s|^|$(basename "$f") |" >> "$TMPS"
  grep -vE "$RE_SER" "$f" 2>/dev/null | grep -ohE "$RE_CASE|$RE_CMP" | while read -r m; do
    e=$(echo "$m" | grep -oE "(${ALT})::" | head -1 | sed 's/:://')
    echo "$(basename "$f") $e"
  done
done > "$TMP"

TOTAL=$(wc -l < "$TMP" | tr -d ' ')
SER=$(wc -l < "$TMPS" | tr -d ' ')
DIST_FILE=$(awk '{print $1}' "$TMP" | sort | uniq -c | sort -rn | awk '{printf "      \"%s\": %d,\n", $2, $1}' | sed '$ s/,$//')
DIST_ENUM=$(awk '{print $2}' "$TMP" | sort | uniq -c | sort -rn | awk '{printf "      \"%s\": %d,\n", $2, $1}' | sed '$ s/,$//')
DIST_SER=$(awk '{print $1}' "$TMPS" | sort | uniq -c | sort -rn | awk '{printf "      \"%s\": %d,\n", $2, $1}' | sed '$ s/,$//')
rm -f "$TMP" "$TMPS"

# --- JS kovalari --------------------------------------------------------------
RE_JS_CMP="[=!]==[[:space:]]*'[A-Za-z_]+'"
RE_JS_EXCL="'(close|move|line|curve|number|object|string|undefined|function|boolean)'"
RE_JS_MM="^[[:space:]]*(const|let|var)[[:space:]]+[A-Za-z_]+_MM[[:space:]]*=[[:space:]]*[0-9]"
JS_CMP=0; JS_MM=0; JS_DIST=""
for f in $JSFILES; do
  c=$(grep -oE "$RE_JS_CMP" "$f" 2>/dev/null | grep -vE "$RE_JS_EXCL" | wc -l | tr -d ' ')
  m=$(grep -cE "$RE_JS_MM" "$f" 2>/dev/null); m=${m:-0}
  JS_CMP=$((JS_CMP + c)); JS_MM=$((JS_MM + m))
  JS_DIST="${JS_DIST}      \"$(basename "$f")\": {\"dallanma\": $c, \"sabitMM\": $m},
"
done
JS_DIST=$(printf "%s" "$JS_DIST" | sed '$ s/,$//')

write_baseline() {
  {
    echo "{"
    echo "  \"_ne\": \"enum_dallanma_check.sh circir tabani. Uc circir: toplam(=cpp.dallanma), js.dallanma, js.sabitMM — hicbiri ARTAMAZ. Azalis bu dosyayi OTOMATIK YAZMAZ; taban --baseline ile bilincli, ayri commit'te kesilir (gerekce commit mesajinda). cpp.serializasyon (case E::X: return \\\"...\\\") bilgi icindir, toplama girmez. Sayim: case <SpecEnum>::X + [=!]= <SpecEnum>::X, engine/src/*.cpp|*.hpp, specparse.hpp ve *.gen.hpp haric; js: web/lib/flat-*.js + arka-koken.js icinde === 'kelime' (yol komutu/typeof haric) ve <AD>_MM = sayi. Hedef: cpp F3 sonu 0; js F2 sonu 0.\","
    echo "  \"_kesildi\": \"$(date +%Y-%m-%d) $(git rev-parse --short HEAD 2>/dev/null || echo '?')\","
    echo "  \"specEnumSayisi\": $N_ENUM,"
    echo "  \"toplam\": $TOTAL,"
    echo "  \"cpp\": {"
    echo "    \"dallanma\": $TOTAL,"
    echo "    \"serializasyon\": $SER,"
    echo "    \"dosya\": {"; echo "$DIST_FILE"; echo "    },"
    echo "    \"serializasyonDosya\": {"; echo "$DIST_SER"; echo "    },"
    echo "    \"enum\": {"; echo "$DIST_ENUM"; echo "    }"
    echo "  },"
    echo "  \"js\": {"
    echo "    \"dallanma\": $JS_CMP,"
    echo "    \"sabitMM\": $JS_MM,"
    echo "    \"dosya\": {"; echo "$JS_DIST"; echo "    }"
    echo "  }"
    echo "}"
  } > "$BASE"
}

echo "spec enum ($N_ENUM): $(echo "$ENUMS" | paste -sd' ' -)"
echo "kapsam cpp: $(echo "$FILES" | wc -l | tr -d ' ') dosya (engine/src, specparse/gen haric)"
echo "kapsam js : $(echo "$JSFILES" | wc -l | tr -d ' ') dosya ($(echo "$JSFILES" | xargs -n1 basename | paste -sd' ' -))"
echo "cpp.dallanma (toplam, circir): $TOTAL"
echo "cpp.serializasyon (bilgi, toplama girmez): $SER"
echo "js.dallanma (circir): $JS_CMP"
echo "js.sabitMM (circir): $JS_MM"

if [ "$MODE" = "--measure" ]; then
  echo "--- cpp dosya dagilimi"; echo "$DIST_FILE" | sed 's/^ *//; s/,$//'
  echo "--- cpp serializasyon dagilimi"; echo "$DIST_SER" | sed 's/^ *//; s/,$//'
  echo "--- cpp enum dagilimi"; echo "$DIST_ENUM" | sed 's/^ *//; s/,$//'
  echo "--- js dagilimi"; echo "$JS_DIST" | sed 's/^ *//; s/,$//'
  exit 0
fi

if [ "$MODE" = "--baseline" ]; then
  write_baseline; echo "taban yazildi: $BASE (cpp.dallanma $TOTAL, cpp.serializasyon $SER, js.dallanma $JS_CMP, js.sabitMM $JS_MM)"; exit 0
fi

[ -f "$BASE" ] || { echo "FAIL  taban yok: $BASE  (once --baseline)"; exit 1; }
read -r FLOOR FLOOR_JS FLOOR_MM <<< "$(python3 -c "
import json; b=json.load(open('$BASE')); js=b.get('js') or {}
print(b['toplam'], js.get('dallanma', -1), js.get('sabitMM', -1))")"
echo "taban: cpp.dallanma $FLOOR, js.dallanma $FLOOR_JS, js.sabitMM $FLOOR_MM"

FAILS=0; DROPS=0
ratchet() { # ad bugun taban
  local ad=$1 now=$2 floor=$3
  if [ "$floor" -lt 0 ]; then echo "      $ad: tabanda yok (eski sema) — --baseline ile kes"; return; fi
  if [ "$now" -gt "$floor" ]; then
    echo "FAIL  $ad ARTTI: $floor -> $now (+$((now-floor))). HEDEF madde 9: menuye dal / koda sabit eklenmez; formul parametreyle degisir."
    FAILS=$((FAILS+1))
  elif [ "$now" -lt "$floor" ]; then
    echo "OK    $ad AZALDI: $floor -> $now (-$((floor-now))). taban dusurulebilir: bash engine/tests/enum_dallanma_check.sh --baseline (commit et, gerekce commit mesajinda)"
    DROPS=$((DROPS+1))
  else
    echo "OK    $ad sabit: $now"
  fi
}
ratchet cpp.dallanma "$TOTAL" "$FLOOR"
ratchet js.dallanma "$JS_CMP" "$FLOOR_JS"
ratchet js.sabitMM "$JS_MM" "$FLOOR_MM"
if [ "$FAILS" -gt 0 ]; then
  echo "      hangi dosya: bash engine/tests/enum_dallanma_check.sh --measure  | diff ile $BASE"
  exit 1
fi
[ "$DROPS" -gt 0 ] && echo "      (taban dosyasi YAZILMADI; ctest kaynak agacina yazmaz)"
exit 0
