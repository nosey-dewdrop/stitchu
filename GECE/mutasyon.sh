#!/usr/bin/env bash
# GECE/mutasyon.sh <FAZ>   -> exit 0 kapi gercekten olcuyor, 1 kapi BOS
#
# §2.3. Yesil basmak kapinin calistigini KANITLAMAZ -- hic kosmamis da olabilir.
# Bu script kapinin olctugu seyi KASTEN bozar ve kapinin kirmiziya donmesini
# bekler. Donmuyorsa kapi bostur ve "yesil" kelimesi o gece kullanilmaz.
#
# MUHURLU DOSYA. Bir fazin ajani buraya dokunamaz (kapi.sh K5).
#
# Ajanin dokunabildigi tek sey GECE/mutasyon.tsv -- ve orada sadece BICAGIN
# NEREYE saplanacagini gosterebilir, mutasyonun ADINI ya da beklenen sonucunu
# secemez. Sahte bir knob gostermek ise yaramaz: bicak bir sey kesmezse
# (git diff bos) ya da kapi kirmizi donmezse mutasyon DUSER.
#
# GECE/mutasyon.tsv satir formati (TAB ile ayrilmis, # yorum):
#   FAZ <TAB> mutasyon_adi <TAB> kapi_testi <TAB> bozma_komutu
# ornek:
#   F3	omuz-6mm	flat_convention_check	sed -i '' 's/SHOULDER_Y = 412/SHOULDER_Y = 418/' engine/flat-engine/croquis.mjs
set -uo pipefail

F=${1:?faz adi lazim (F1..F8)}
cd "$(dirname "$0")/.."
ROOT=$(pwd)
# TMP fiziksel yol (kapi.sh'teki ayni symlink tuzagi -- /tmp -> /private/tmp).
TMP=$(mkdir -p /tmp/stitchu-gece && cd /tmp/stitchu-gece && pwd -P)
BUILD=$TMP/b-mut
mkdir -p "$TMP" GECE/log
MAN=GECE/mutasyon.tsv

say(){ echo "[mutasyon $F] $*"; }
RED=0
KIRMIZI(){ say "MUTASYON DUSTU -- $*"; RED=1; }

# --- her fazin ZORUNLU mutasyonlari (§2.3). Ajan bu listeyi degistiremez.
case "$F" in
  F1) ZORUNLU="flat-olcek-1.1" ;;
  F2) ZORUNLU="primitif-sil" ;;
  F3) ZORUNLU="omuz-6mm" ;;
  F4) ZORUNLU="kenar-arti-5mm centik-kaydir panel-sil kalip-olcek-1.1" ;;
  F5) ZORUNLU="kol-kapak-arti-5mm" ;;
  F6) ZORUNLU="kumas-sinifi-degistir" ;;
  F7) ZORUNLU="uzak-panel-oynat" ;;
  *)  say "bu faz icin zorunlu mutasyon tanimli degil -- gecildi"; exit 0 ;;
esac

# --- calisma agaci temiz baslamali, yoksa geri alma guvenli degil.
# GECE/log HARIC: gece.sh bu script'in ciktisini GECE/log/$F.mutasyon.txt'ye
# yonlendiriyor, yani dosya bu satir kosarken zaten VAR ve untracked. Haric
# tutulmazsa mutasyon KENDI LOGU yuzunden her fazda duser -- 21 Agu'da F1
# tam olarak boyle oldu (kapisi yesildi, mutasyon "agac kirli: ?? GECE/log/
# F1.mutasyon.txt" deyip fazi kapatmadi).
BASLANGIC=$(git status --porcelain -- . ':!GECE/log')
if [ -n "$BASLANGIC" ]; then
  KIRMIZI "calisma agaci kirli, mutasyon guvenle geri alinamaz:"
  echo "$BASLANGIC" | head -20
  exit 1
fi

GERI_AL(){
  git checkout -- . >/dev/null 2>&1
  git clean -fdq -- engine contract web knowledge >/dev/null 2>&1
}
trap 'say "kesildi -- geri aliniyor"; GERI_AL' INT TERM

[ -f "$MAN" ] || { KIRMIZI "$MAN yok. Faz mutasyon sozunu yazmamis (§2.3)."; exit 1; }

# --- build dizini bir kez kurulur, sonra artimli derlenir
cmake -S engine -B "$BUILD" -DCMAKE_BUILD_TYPE=Release >"$TMP/mut.cmake.log" 2>&1 \
  || { KIRMIZI "cmake configure patladi -- $TMP/mut.cmake.log"; exit 1; }

# NOT: hepsi </dev/null ile kosuyor -- yoksa ctest/cmake manifesto satirlarini
# stdin'den yer ve dongu sessizce yarim kalir.
derle(){ cmake --build "$BUILD" -j >"$TMP/mut.build.log" 2>&1 </dev/null; }
kapi_kos(){  # <test_adi> -> 0 yesil, 1 kirmizi
  ( cd "$BUILD" && ctest -R "^$1\$" --output-on-failure ) >"$TMP/mut.$1.txt" 2>&1 </dev/null
}
test_var(){ ( cd "$BUILD" && ctest -N -R "^$1\$" </dev/null ) 2>/dev/null | grep -q "Test *#"; }

BULUNAN=""
while IFS=$'\t' read -r MF AD KAPI KOMUT <&3; do
  case "$MF" in ''|'#'*) continue ;; esac
  [ "$MF" = "$F" ] || continue
  [ -n "${KOMUT:-}" ] || { KIRMIZI "$AD: manifestoda bozma komutu bos"; continue; }
  BULUNAN="$BULUNAN $AD"

  say "--- $AD -> $KAPI"

  # 1) kapi gercekten var mi
  if ! test_var "$KAPI"; then
    KIRMIZI "$AD: '$KAPI' diye bir ctest testi YOK. Var olmayan kapi olcmez."
    continue
  fi

  # 2) mutasyondan ONCE yesil olmali -- yoksa kirmizi hicbir sey kanitlamaz
  derle || { KIRMIZI "$AD: mutasyon oncesi derleme patladi"; GERI_AL; continue; }
  if ! kapi_kos "$KAPI"; then
    KIRMIZI "$AD: '$KAPI' mutasyondan ONCE zaten kirmizi -- mutasyon bir sey kanitlamaz"
    continue
  fi

  # 3) bicagi sapla
  bash -c "$KOMUT" >"$TMP/mut.$AD.komut.txt" 2>&1 </dev/null
  DIFF=$(git status --porcelain -- . ':!GECE/log')
  if [ -z "$DIFF" ]; then
    KIRMIZI "$AD: bozma komutu HICBIR SEYI degistirmedi (sahte knob). Komut: $KOMUT"
    cat "$TMP/mut.$AD.komut.txt"
    GERI_AL; continue
  fi
  # bicak kapinin kendisine saplanmis olamaz
  if echo "$DIFF" | grep -qE 'engine/tests/|GECE/kapi\.sh|GECE/mutasyon\.sh|GECE/kapi\.sha'; then
    KIRMIZI "$AD: mutasyon KAPIYA dokunmus, olculen nesneye degil:"
    echo "$DIFF" | head -10
    GERI_AL; continue
  fi

  # 4) kapi kirmiziya DONMEK ZORUNDA
  if ! derle; then
    say "$AD: mutasyon derlemeyi kirdi -- bu da bir kirmizidir, kabul"
  elif kapi_kos "$KAPI"; then
    KIRMIZI "$AD: nesne bozuldu ama '$KAPI' HALA YESIL. Kapi bos."
    say "  degisen: $(echo "$DIFF" | head -3 | tr '\n' ' ')"
    say "  kapi ciktisi: $TMP/mut.$KAPI.txt"
  else
    say "$AD: TAMAM -- nesne bozulunca '$KAPI' kirmiziya dondu"
  fi

  # 5) geri al
  GERI_AL
  if [ -n "$(git status --porcelain -- . ':!GECE/log')" ]; then
    KIRMIZI "$AD: mutasyon GERI ALINAMADI, agac hala kirli. Elle temizle."
    git status --porcelain -- . ':!GECE/log' | head -10
    exit 1
  fi
done 3< "$MAN"

# --- zorunlu mutasyonlarin hepsi manifestoda var miydi
for Z in $ZORUNLU; do
  case " $BULUNAN " in
    *" $Z "*) ;;
    *) KIRMIZI "zorunlu mutasyon '$Z' $MAN'de YOK. $F kapanamaz (§2.3)." ;;
  esac
done

# --- son kontrol: agac temiz, muhur saglam
derle >/dev/null 2>&1
[ -n "$(git status --porcelain -- . ':!GECE/log')" ] && { KIRMIZI "bitiste agac kirli"; git status --porcelain -- . ':!GECE/log' | head; }
[ -f GECE/kapi.sha ] && { sha256sum -c GECE/kapi.sha >/dev/null 2>&1 || KIRMIZI "bitiste kapi muhru kirik"; }

trap - INT TERM
if [ $RED -eq 0 ]; then say "MUTASYON GECTI -- kapi gercekten bir NESNE olcuyor"; else say "MUTASYON DUSTU -- '$F yesil' denemez"; fi
exit $RED
