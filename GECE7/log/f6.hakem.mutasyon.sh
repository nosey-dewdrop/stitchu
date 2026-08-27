#!/usr/bin/env bash
# F6 HAKEM MUTASYONLARI — GECE7, §3.8 md.3.
#
# f4.hakem.mutasyon.sh'in disiplini aynen: (1) her turda ikili SILINIR ve
# yeniden derlenir, `shasum` kimildadigini KANITLAR — kimildamadiysa HUKUM YOK;
# (2) her turun basinda `git diff --numstat F6-oncesi..HEAD -- <dosya>` BASILIR,
# BOS = bu kartta o dosyaya DOKUNULMADI.
#
# DORT TURUN DORDU DE `numstat` BOS dosyalarda — ajanin hic acmadigi yerler.
# HM-1/HM-2 C++ (native kapilar), HM-3/HM-4 JS (circira dogrudan ulasir,
# borc 80'in wasm tuzagina girmezler).
set -uo pipefail
cd "$(dirname "$0")/../.."
B=engine/build
BINS="fabric_catalog_check guide_completeness_check fabric_ease_check"
hash_of(){ shasum "$B/$1" 2>/dev/null | cut -c1-8; }
ikili(){ local o=""; for b in $BINS; do o="$o$(hash_of "$b")"; done; echo "$o"; }
build(){ for b in $BINS; do rm -f "$B/$b"; done; cmake --build "$B" -j8 --target $BINS >/dev/null 2>&1; }
gate(){ "$B/$1" >/dev/null 2>&1 && echo "EXIT 0 (YESIL)" || echo "EXIT $? (KIRMIZI)"; }
jgate(){ node "$1" >/dev/null 2>&1 && echo "EXIT 0 (YESIL)" || echo "EXIT $? (KIRMIZI)"; }

tur(){ local ad="$1" dosya="$2" ifade="$3" kip="$4"; shift 4
  echo ""; echo "================================================================"
  echo "$ad — $dosya  [$kip]"; echo "  $*"
  echo "  numstat (F6-oncesi..HEAD): [$(git diff --numstat F6-oncesi..HEAD -- "$dosya" | tr '\n' ' ')]"
  local once; once="$(ikili)"
  cp "$dosya" /tmp/f6h.mut.bak
  perl -0pi -e "$ifade" "$dosya"
  if cmp -s "$dosya" /tmp/f6h.mut.bak; then
    echo "  ⚠ KAYNAK KIMILDAMADI — perl ifadesi tutmadi. HUKUM YOK."; cp /tmp/f6h.mut.bak "$dosya"; return; fi
  if [ "$kip" = "cpp" ]; then
    build; local sonra; sonra="$(ikili)"
    if [ "$once" = "$sonra" ]; then echo "  ikili: $once -> $sonra  ⚠ KIMILDAMADI -> HUKUM YOK"; cp /tmp/f6h.mut.bak "$dosya"; build; return; fi
    echo "  ikili: $once -> $sonra  (KIMILDADI)"
    echo "  fabric_catalog_check     : $(gate fabric_catalog_check)"
    echo "  guide_completeness_check : $(gate guide_completeness_check)"
    echo "  fabric_ease_check        : $(gate fabric_ease_check)"
    cp /tmp/f6h.mut.bak "$dosya"; build
    echo "  GERI ALINDI -> fabric_catalog_check $(gate fabric_catalog_check) · fabric_ease_check $(gate fabric_ease_check)"
  else
    echo "  ikili: JS kaynagi, derleme yok — kapi dogrudan dosyayi okuyor"
    echo "  indir_check  : $(jgate engine/tests/indir_check.mjs)"
    echo "  hedef_kosu   : $(jgate engine/tests/hedef_kosu.mjs)"
    cp /tmp/f6h.mut.bak "$dosya"
    echo "  GERI ALINDI -> indir_check $(jgate engine/tests/indir_check.mjs) · hedef_kosu $(jgate engine/tests/hedef_kosu.mjs)"
  fi
}
echo "F6 HAKEM MUTASYON LOGU — $(date '+%Y-%m-%d %H:%M')"
echo "HEAD: $(git rev-parse --short HEAD)   etiket: F6-oncesi   realpath: $(realpath .)"
build
echo "TEMIZ AGAC: fabric_catalog_check $(gate fabric_catalog_check) · guide_completeness_check $(gate guide_completeness_check) · fabric_ease_check $(gate fabric_ease_check)"
echo "TEMIZ AGAC(JS): indir_check $(jgate engine/tests/indir_check.mjs) · hedef_kosu $(jgate engine/tests/hedef_kosu.mjs)"

tur "HM-1" engine/src/skirt.cpp \
  's{m\.waistMM\(\) \* \(1 \+ waistEaseFor\(fabric\)\)}{m.waistMM() * (1 + 0.0)}g' cpp \
  "etegin bel cevresi kumas payindan koparildi -> jersey ile poplin ayni beli almali"
tur "HM-2" engine/src/bodice.cpp \
  's{: waistEaseFor\(options\.fabric\);}{: 0.0;}' cpp \
  "bedenin bel payi kumastan koparildi -> negatif pay kalibin beline inmemeli"
tur "HM-3" web/js/provenance.js \
  's{export function dogrula}{export function dogrulaXX}' js \
  "koken dogrulayicisinin adi degistirildi -> indir kapisi kokeni okuyamamali"
tur "HM-4" web/lib/flat-core.js \
  's{shoulderY: 0,}{shoulderY: 2,}' js \
  "croquis omuz capasi 0 -> 2 kaydirildi (flat-core.js:316) -> H6 (0/16 flat) yanmali"
