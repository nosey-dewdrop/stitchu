#!/usr/bin/env bash
# KOSU/kapi.sh — KAPANIS kosusunun TEK kapisi. (11 Eyl 2026)
#
# YASA: Kapi bu script'tir. Hicbir ajanin hukmu kapi degildir.
#       Hakem yalniz bu script'in ciktisini okur ve DUR/DEVAM der.
#
# Neden var: son 14 commit'te KOSU/onbellek'e 3720 satir ELLE veri yazilmis,
# ciziciye 168 satir kod. Yani kapilari gecirеn sey kod degil, elle veri
# duzeltmekti. Bu script tam olarak onu yakalar.
#
# Kullanim:  bash KOSU/kapi.sh <gorev>        # gorev: G1 G2 G3 G4
#            bash KOSU/kapi.sh <gorev> --taban <sha>
# Cikis: 0 = GECTI, 1 = KIRMIZI.

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

GOREV="${1:-}"
TABAN="HEAD"
[ "${2:-}" = "--taban" ] && TABAN="${3:-HEAD}"

if [ -z "$GOREV" ]; then echo "kullanim: bash KOSU/kapi.sh <G1|G2|G3|G4> [--taban <sha>]"; exit 1; fi

KIRMIZI=0
say()  { printf '%-52s %s\n' "$1" "$2"; }
gec()  { say "$1" "GECTI"; }
kir()  { say "$1" "KIRMIZI  <- $2"; KIRMIZI=1; }

echo "======================================================================"
echo " KAPI  gorev=$GOREV  taban=$TABAN  $(date '+%Y-%m-%d %H:%M')"
echo "======================================================================"

DIFF="$(git diff --name-only "$TABAN" 2>/dev/null; git diff --name-only --cached 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null)"
DIFF="$(printf '%s\n' "$DIFF" | sort -u | grep -v '^$')"

# --- E1. ELLE VERI DOKUNMA KAPISI -------------------------------------------
# Bu tek kural son iki gunun kacagini kapatir. Okuma/op/hedef verisi ELLE
# duzeltilerek kapi gecilemez; bu dosyalar ancak G1 okuyucusu URETIRSE degisir
# ve o zaman da uretenin adi commit'te gecer (asagida ayrica kontrol edilir).
ELLE="$(printf '%s\n' "$DIFF" | grep -E 'KOSU/onbellek/|ops-topoloji\.json$|hedefler\.json$|/siluet\.json$|/ops\.json$' || true)"
if [ -n "$ELLE" ]; then
  # Istisna: G1 okuyucunun URETTIGI onbellek, uretici damgasi tasiyorsa serbest.
  TEMIZ=1
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    [ -f "$f" ] || continue
    if grep -q '"uretenScript"[[:space:]]*:[[:space:]]*"KOSU/siluet-oku.mjs"' "$f" 2>/dev/null; then continue; fi
    TEMIZ=0; echo "    elle dokunulan: $f"
  done <<< "$ELLE"
  if [ "$TEMIZ" = "1" ]; then gec "E1 elle veri dokunma (uretici damgali)"
  else kir "E1 elle veri dokunma" "okuma/op/hedef verisi elle degismis"; fi
else
  gec "E1 elle veri dokunma"
fi

# --- E2. BEKLENTI DUSURME KAPISI --------------------------------------------
# Esik/sozlesme sayilari ajan tarafindan indirilemez. Gerekiyorsa Damla'ya sorulur.
ESIK="$(printf '%s\n' "$DIFF" | grep -E '^contract/.*\.json$|^engine/tests/' || true)"
if [ -n "$ESIK" ]; then
  DEGISEN_SAYI=0
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    n="$(git diff "$TABAN" -- "$f" 2>/dev/null | grep -E '^[-+].*[0-9]' | grep -vE '^[-+]{3}' | wc -l | tr -d ' ')"
    [ "${n:-0}" -gt 0 ] && { DEGISEN_SAYI=1; echo "    esik/sozlesme sayisi degismis: $f ($n satir)"; }
  done <<< "$ESIK"
  if [ "$DEGISEN_SAYI" = "1" ]; then kir "E2 beklenti dusurme" "contract/test esigi degismis"
  else gec "E2 beklenti dusurme"; fi
else
  gec "E2 beklenti dusurme"
fi

# --- E3. MUHUR BOZULMAMIS ----------------------------------------------------
if [ -f KOSU/muhur-foto.txt ]; then
  if grep -v '^#' KOSU/muhur-foto.txt | grep -v '^$' | shasum -a 256 -c --status 2>/dev/null; then
    gec "E3 muhurlu 5 fotograf degismemis"
  else
    kir "E3 muhur" "muhurlu fotograf seti degismis/eksik"
  fi
else
  kir "E3 muhur" "KOSU/muhur-foto.txt yok"
fi

# --- E4. SOZLUK BUYUMEDI (HEDEF madde 9) -------------------------------------
if [ -f engine/vocab.json ]; then
  SIMDI="$(python3 -c "
import json
v=json.load(open('engine/vocab.json'))
f=v.get('fields',v)
t=0
if isinstance(f,dict):
    for k,val in f.items():
        vs=val.get('values') if isinstance(val,dict) else None
        if vs: t+=len(vs)
print(t)" 2>/dev/null || echo -1)"
  ONCE="$(git show "$TABAN":engine/vocab.json 2>/dev/null | python3 -c "
import json,sys
try:
    v=json.load(sys.stdin); f=v.get('fields',v); t=0
    if isinstance(f,dict):
        for k,val in f.items():
            vs=val.get('values') if isinstance(val,dict) else None
            if vs: t+=len(vs)
    print(t)
except Exception: print(-1)" 2>/dev/null || echo -1)"
  if [ "$SIMDI" -ge 0 ] && [ "$ONCE" -ge 0 ] && [ "$SIMDI" -gt "$ONCE" ]; then
    kir "E4 sozluk buyumedi" "vocab $ONCE -> $SIMDI (HEDEF md.9)"
  else
    gec "E4 sozluk buyumedi ($ONCE -> $SIMDI)"
  fi
fi

# --- E5. SABIT MENU BUYUMEDI (cizici case sayisi) ----------------------------
# Her yeni giysi ozelligi icin ciziciye 'case' eklemek = sozlugu geri getirmek.
for CIZ in KOSU/siluet-ciz.mjs web/lib/siluet-ciz.js; do
  [ -f "$CIZ" ] || continue
  S="$(grep -cE "^[[:space:]]*case '" "$CIZ" 2>/dev/null | head -1 | tr -dc '0-9')"; S="${S:-0}"
  O="$(git show "$TABAN":"$CIZ" 2>/dev/null | grep -cE "^[[:space:]]*case '" 2>/dev/null | head -1 | tr -dc '0-9')"; O="${O:-0}"
  if [ "$O" -gt 0 ] && [ "$S" -gt "$O" ]; then
    kir "E5 sabit menu buyumedi ($CIZ)" "case $O -> $S"
  else
    gec "E5 sabit menu buyumedi ($CIZ: $S case)"
  fi
done

echo "----------------------------------------------------------------------"

# --- GOREVE OZEL OLCUM -------------------------------------------------------
case "$GOREV" in

G1) # okuyucu: muhurlu 5 fotograf; cikti ALTIN KOPYA ile karsilastirilir
  if [ ! -f KOSU/siluet-oku.mjs ]; then
    kir "G1 okuyucu var" "KOSU/siluet-oku.mjs yok"
  else
    gec "G1 okuyucu var"
    # Okuyucu altin kopyayi okuyamaz (kacak kapatma)
    if grep -qE 'KOSU/altin|altin/' KOSU/siluet-oku.mjs 2>/dev/null; then
      kir "G1 altin kopya sizintisi" "okuyucu KOSU/altin'a bakiyor"
    else
      gec "G1 altin kopya sizintisi yok"
    fi
    OK=0; TOP=0
    while IFS= read -r line; do
      case "$line" in \#*|'') continue;; esac
      f="$(echo "$line" | awk '{print $2}')"
      [ -z "$f" ] && continue
      TOP=$((TOP+1))
      ad="$(basename "$f" | sed 's/\.[^.]*$//')"
      if node KOSU/siluet-oku.mjs "$f" > "/tmp/kapi-$ad.json" 2>"/tmp/kapi-$ad.err"; then
        # 1) sema + 2) flat uretilebiliyor mu + 3) altina ne kadar yakin
        SKOR="$(node KOSU/altin-kiyas.mjs "/tmp/kapi-$ad.json" "KOSU/altin/$ad.json" 2>/dev/null || echo "HATA")"
        CIZ="$(node KOSU/flat-denemesi.mjs "/tmp/kapi-$ad.json" "/tmp/kapi-$ad.svg" 2>/dev/null | tail -1)"
        say "   $ad" "$CIZ | altin kiyas: $SKOR"
        case "$CIZ" in CIZILDI\ kirmizi=0*) case "$SKOR" in GECTI*) OK=$((OK+1));; esac;; esac
      else
        say "   $ad" "okuma HATA ($(head -c 60 "/tmp/kapi-$ad.err" 2>/dev/null))"
      fi
    done < KOSU/muhur-foto.txt
    say "G1 sonuc" "$OK/$TOP fotograf altin kiyasi gecti"
    [ "$TOP" -gt 0 ] && [ "$OK" -ge 4 ] && gec "G1 kapi (>=4/5)" || kir "G1 kapi" "$OK/$TOP (en az 4 gerekli)"
  fi
  ;;

G2) # tek flat hatti
  ESKI=0
  for f in web/lib/flat-from-pattern.js web/lib/flat-from-plan.js; do
    [ -f "$f" ] && { echo "    hala yasiyor: $f"; ESKI=1; }
  done
  [ "$ESKI" = "0" ] && gec "G2 eski flat hatti silinmis" || kir "G2 eski flat hatti" "flat-from-*.js hala var"

  KAC="$(grep -rlE 'flatDrawing|flat-from-pattern|flat-from-plan' web/ 2>/dev/null | grep -v siluet | wc -l | tr -d ' ')"
  [ "${KAC:-0}" = "0" ] && gec "G2 web'de baska flat cizen kod yok" || kir "G2 web tek hat" "$KAC dosya hala eski hatti cagiriyor"

  [ -f web/lib/siluet-ciz.js ] || [ -f web/js/siluet-ciz.js ] && gec "G2 siluet cizicisi web'de" || kir "G2 siluet cizicisi" "web'e tasinmamis"

  for t in flat_mirror_check cizim_giysi_mi; do
    if ctest --test-dir engine/build -R "^${t}$" -j1 >/dev/null 2>&1; then gec "G2 $t"
    elif ! grep -rq "$t" engine/CMakeLists.txt 2>/dev/null; then gec "G2 $t (olu, kaldirilmis)"
    else kir "G2 $t" "kirmizi ve hala kayitli"; fi
  done
  ;;

G3) # uctan uca
  [ -f engine/dist/stitchu-engine.js ] && gec "G3 wasm paketi var" || kir "G3 wasm paketi" "engine/dist/stitchu-engine.js yok"
  if ctest --test-dir engine/build -R '^uctan_uca_check$' -j1 >/dev/null 2>&1; then gec "G3 uctan_uca_check"; else kir "G3 uctan_uca_check" "kirmizi"; fi
  ;;

G4) # durustluk
  for t in sizechart_source_check docs_truth_check kapi_sozlesme_check vocab_reference_check; do
    if ctest --test-dir engine/build -R "^${t}$" -j1 >/dev/null 2>&1; then gec "G4 $t"; else kir "G4 $t" "kirmizi"; fi
  done
  ;;

*) echo "bilinmeyen gorev: $GOREV"; exit 1;;
esac

echo "======================================================================"
if [ "$KIRMIZI" = "0" ]; then echo " HUKUM: GECTI  (exit 0)"; else echo " HUKUM: KIRMIZI (exit 1)"; fi
echo "======================================================================"
exit "$KIRMIZI"
