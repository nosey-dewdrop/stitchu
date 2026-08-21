#!/usr/bin/env bash
# GECE/kapi.sh <FAZ> <once_commit>   -> exit 0 yesil, 1 kirmizi
#
# Bu kapi YARGILAMAZ, OLCER. Hicbir maddesi "iyi mi" diye sormaz;
# hepsi "su sayi su sayidan farkli mi" diye sorar.
#
# MUHURLU DOSYA. Degistirilirse GECE/kapi.sha tutmaz ve gece.sh kosuyu baslatmaz.
# Bir fazin ajani bu dosyaya dokunamaz (K5).
set -uo pipefail

F=${1:?faz adi lazim (F1..F8)}
ONCE=${2:?faz oncesi commit lazim}

cd "$(dirname "$0")/.."
ROOT=$(pwd)
# TMP FIZIKSEL yol olmak ZORUNDA. macOS'ta /tmp -> /private/tmp bir symlink'tir ve
# repodaki .mjs testleri "import.meta.url === pathToFileURL(argv[1])" deyimini
# kullaniyor: import.meta.url gercek yolu (/private/tmp/...), argv[1] verilen yolu
# (/tmp/...) verir, esitlik tutmaz, suit HIC KOSMAZ ve node 0 ile ciker.
# Olculdu 2026-08-21: figure-lint.mjs gercek yoldan exit 1, /tmp symlink'inden
# CIKTISIZ exit 0. Yani taban worktree'si gercekten daha YESIL gorunuyordu ve
# K1 her faza sahte "yeni kirmizi: figure_check" basacakti. Kapinin kendisi
# §2'nin yasakladigi vacuous-green'i uretiyordu.
TMP=$(mkdir -p /tmp/stitchu-gece && cd /tmp/stitchu-gece && pwd -P)
mkdir -p "$TMP" GECE/log

RED=0
say(){ echo "[$F] $*"; }
kirmizi(){ say "$*"; RED=1; }

# ---------------------------------------------------------------- yardimcilar
# ctest'in kirmizi test ISIMLERI. Sayi degil isim -- §0.6 "isim isim" diyor.
# Kaynak: Testing/Temporary/LastTestsFailed.log (format "78:test_adi").
# Eski log yaniltmasin diye once silinir.
kirmizilar(){
  local B=$1
  rm -f "$B/Testing/Temporary/LastTestsFailed.log"
  ( cd "$B" && ctest ) >"$TMP/$F.ctest.$(basename "$B").txt" 2>&1
  if [ -f "$B/Testing/Temporary/LastTestsFailed.log" ]; then
    cut -d: -f2- "$B/Testing/Temporary/LastTestsFailed.log" | sort
  fi
}

kur_ve_kos(){   # <kaynak_kok> <build_dir> -> kirmizi isimleri stdout'a
  local S=$1 B=$2
  cmake -S "$S/engine" -B "$B" -DCMAKE_BUILD_TYPE=Release >"$TMP/$F.cmake.log" 2>&1 \
    || { echo "__CMAKE_PATLADI__"; return; }
  cmake --build "$B" -j >"$TMP/$F.build.log" 2>&1 \
    || { echo "__BUILD_PATLADI__"; return; }
  kirmizilar "$B"
}

# ============================================================== K1
# Devralinan kirmizi KUMESI degismedi mi (§0.6).
# "before" olcumu ayri bir git worktree'de yapilir -- calisma agacina
# DOKUNULMAZ. (stash/checkout gece yarisi ajanin isini yiyebilir.)
WT=$TMP/wt-$F
# BONCE fazin ADIYLA anilir, sadece commit'le DEGIL. Sebep olculdu 21 Agu:
# build dizini yalniz commit'le anilinca ikinci faz ayni dizini yeniden
# yapilandirmaya calisiyor, ama CMake cache'i birinci fazin ARTIK SILINMIS
# worktree yolunu tutuyor -> "source directory does not match" -> configure
# patliyor -> K1 "before agaci DERLENMIYOR" diyor ve F2/F3/F4 hepsi bu
# yalanci sebeple kirmizi dustu.
BONCE=$TMP/b-once-$F-$(git rev-parse --short "$ONCE")
BNOW=$TMP/b-now-$F
rm -rf "$BONCE"

git worktree remove --force "$WT" >/dev/null 2>&1
if ! git worktree add --detach -f "$WT" "$ONCE" >"$TMP/$F.worktree.log" 2>&1; then
  kirmizi "K1 KIRMIZI -- '$ONCE' icin worktree acilamadi"
  cat "$TMP/$F.worktree.log"
else
  # Worktree SADECE takipli dosyalari alir. Gitignore'daki uretim artefaktlari
  # (wasm dist, venv'ler, node_modules) orada YOKTUR ve o eksiklik 16 testi
  # sahte kirmizi yapar -- olculdu, 2026-08-21: api_wire_check "engine/dist/
  # stitchu-engine.js yok", walkgate_check "garmentcode/.venv/bin/python yok",
  # dxf/nest_marker/tech_pack "ezdxf yok" (engine/.venv-dxf).
  # Once/sonra ayni ortamda olculmezse K1 hicbir sey karsilastirmiyor demektir.
  # Liste sabit degil, taranarak bulunur: yarin yeni bir artefakt dizini
  # dogarsa kimsenin bu dosyayi hatirlamasi gerekmesin.
  ARTEFAKT=$(git ls-files --others --ignored --exclude-standard --directory \
             | grep -E 'venv|node_modules|dist/' | sed 's:/$::')
  for A in $ARTEFAKT core/third_party; do
    if [ -e "$ROOT/$A" ] && [ ! -e "$WT/$A" ]; then
      mkdir -p "$(dirname "$WT/$A")"
      ln -s "$ROOT/$A" "$WT/$A" && say "K1 ortam: $A -> gercek agactan baglandi"
    fi
  done
  kur_ve_kos "$WT" "$BONCE" > GECE/log/$F.red.before
  git worktree remove --force "$WT" >/dev/null 2>&1
fi

kur_ve_kos "$ROOT" "$BNOW" > GECE/log/$F.red.after

for L in before after; do
  if grep -q '__CMAKE_PATLADI__\|__BUILD_PATLADI__' GECE/log/$F.red.$L 2>/dev/null; then
    kirmizi "K1 KIRMIZI -- $L agaci DERLENMIYOR ($(cat GECE/log/$F.red.$L))"
    tail -30 "$TMP/$F.build.log" 2>/dev/null
  fi
done

if [ $RED -eq 0 ]; then
  YENI=$(comm -13 GECE/log/$F.red.before GECE/log/$F.red.after)
  [ -n "$YENI" ] && kirmizi "K1 KIRMIZI -- yeni kirmizi: $(echo $YENI)"
  KAPANAN=$(comm -23 GECE/log/$F.red.before GECE/log/$F.red.after)
  [ -n "$KAPANAN" ] && say "K1 bilgi -- kapanan kirmizi: $(echo $KAPANAN)"
  say "K1 devralinan kirmizi sayisi: once=$(wc -l < GECE/log/$F.red.before) sonra=$(wc -l < GECE/log/$F.red.after)"
fi

# ============================================================== K2
# Vacuous test kapani: fazin EKLEDIGI her yeni test, faz oncesi commit'te
# kirmizi dusmus olmali (§2.2-4). Dusmuyorsa hicbir hukum kosmuyordur.
# DIKKAT: kapi, gece.sh'in commit'inden ONCE kosar, yani fazin ekledigi test
# hala UNTRACKED'dir ve `git diff` onu GORMEZ. 21 Agu'da F1 213 satirlik yeni
# bir test ekledi, K2 "faz yeni test eklememis" dedi: vacuous-test kapani
# yapisal olarak OLUYDU. Untracked olanlar da sayilir.
YENI_TESTLER=$( { git diff --name-only --diff-filter=A "$ONCE" -- 'engine/tests/*'
                  git ls-files --others --exclude-standard -- 'engine/tests/*'; } | sort -u )
if [ -n "$YENI_TESTLER" ]; then
  for P in $YENI_TESTLER; do
    T=$(basename "$P"); T=${T%%.*}
    if ! grep -qx "$T" GECE/log/$F.red.before; then
      kirmizi "K2 KIRMIZI -- $T faz oncesi commit'te kirmizi dusmuyor (bos test)"
    else
      say "K2 tamam -- $T faz oncesinde kirmiziydi"
    fi
  done
else
  say "K2 bilgi -- faz yeni test eklememis"
fi

# ============================================================== K3
# Rapordaki her dosya yolu diskte gercekten var mi (§0.2: kanit = dosya yolu).
if [ -f "GECE/$F.md" ]; then
  grep -oE '(GECE|engine|web|contract|knowledge|flatten-research|vision-student|scripts)/[A-Za-z0-9_./-]+' "GECE/$F.md" \
    | sed 's/[.,)]*$//' | sort -u > "$TMP/$F.yollar"
  : > "$TMP/$F.k3"
  while read -r P; do [ -e "$P" ] || echo "yok: $P" >> "$TMP/$F.k3"; done < "$TMP/$F.yollar"
  if [ -s "$TMP/$F.k3" ]; then
    kirmizi "K3 KIRMIZI -- raporda gecen yollar diskte yok:"; cat "$TMP/$F.k3"
  else
    say "K3 tamam -- $(wc -l < "$TMP/$F.yollar") yolun hepsi diskte var"
  fi
else
  kirmizi "K3 KIRMIZI -- GECE/$F.md yok"
fi

# ============================================================== K4
# Tolerans/esik sabiti MEVCUT bir dosyada oynatilmis mi (§2.2-2).
# Sadece DEGISTIRILMIS dosyalara bakilir: yeni bir kapi testinin kendi
# toleransini tanimlamasi mesru, var olan birinin gevsetilmesi degil.
DEGISEN=$(git diff --name-only --diff-filter=M "$ONCE" -- 'engine/*' 'contract/*' | grep -v '^engine/tests/' || true)
if [ -n "$DEGISEN" ]; then
  if git diff "$ONCE" -- $DEGISEN \
     | grep -E '^[+-][^+-]' \
     | grep -E 'tolerance|TOLERANCE|Tolerance|threshold|THRESHOLD|EPS|epsilon|0\.79375|kapi|gate' > "$TMP/$F.k4"; then
    kirmizi "K4 KIRMIZI -- esik sabiti mevcut dosyada oynamis:"; cat "$TMP/$F.k4"
  else
    say "K4 tamam -- degisen dosyalarda esik oynamasi yok"
  fi
else
  say "K4 bilgi -- mevcut kaynak dosyasi degismemis"
fi

# ============================================================== K5
# Dokunulmazlar + kapinin muhru.
DOKUNULMAZ=$(git diff --name-only "$ONCE" \
  | grep -E '^(patterns_real/|ANAYASA\.md$|GECE/kapi\.sh$|GECE/mutasyon\.sh$|GECE/kapi\.sha$)' || true)
[ -n "$DOKUNULMAZ" ] && kirmizi "K5 KIRMIZI -- dokunulmaz dosya degismis: $(echo $DOKUNULMAZ)"
if [ -f GECE/kapi.sha ]; then
  sha256sum -c GECE/kapi.sha >"$TMP/$F.sha" 2>&1 || { kirmizi "K5 KIRMIZI -- kapi muhru kirik"; cat "$TMP/$F.sha"; }
else
  kirmizi "K5 KIRMIZI -- GECE/kapi.sha yok, kapi muhursuz"
fi

# ============================================================== K6
# Var olan test SILINMIS ya da DEGISTIRILMIS mi (§2.2-1).
# Yeni test eklemek (A) serbest; M ve D kirmizi.
BOZULAN=$(git diff --name-status "$ONCE" -- 'engine/tests/*' | grep -E '^(D|M|R)' || true)
[ -n "$BOZULAN" ] && kirmizi "K6 KIRMIZI -- var olan teste dokunulmus:
$BOZULAN"
[ -z "$BOZULAN" ] && say "K6 tamam -- var olan testlerin hicbiri degismemis"

# ============================================================== K7
# Context hijyeni (§1): fazin yasakli dosyalari BUTUN olarak okumasi kirmizi.
# grep ile tek satir cekmek mesru, Read ile acmak degil.
LOG=GECE/log/$F.ajan.txt
if [ -f "$LOG" ]; then
  if grep -nE '"file_path": *"[^"]*(HEDEF\.md|DAMLA-KUYRUK\.md|devlog\.md|linkedin\.md|ANAYASA\.md)"' "$LOG" > "$TMP/$F.k7"; then
    kirmizi "K7 KIRMIZI -- yasakli dosya butun olarak okunmus:"; head -5 "$TMP/$F.k7"
  else
    say "K7 tamam -- yasakli dosya butun olarak acilmamis"
  fi
else
  say "K7 bilgi -- ajan logu yok, context hijyeni olculemedi"
fi

# ==============================================================
if [ $RED -eq 0 ]; then say "KAPI YESIL"; else say "KAPI KIRMIZI"; fi
exit $RED
