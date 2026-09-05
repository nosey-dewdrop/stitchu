#!/usr/bin/env bash
# muhur.sh — iscinin dokunamayacagi dosyalarin sha256'si. bash KOSU/muhur.sh yaz|kontrol
set -u; cd "$(git rev-parse --show-toplevel)" || exit 2
liste(){ { ls KOSU/kabul/*.sh KOSU/sinyal.sh KOSU/muhur.sh KOSU/flat-olcum.py KOSU/uret.mjs HEDEF.md engine/tests/enum-dallanma-baseline.json engine/tests/enum_dallanma_check.sh 2>/dev/null; find engine/tests -type f \( -name '*.mjs' -o -name '*.cpp' -o -name '*.sh' -o -name '*.py' \) ; } | sort -u; }
case "${1:-kontrol}" in
  yaz) liste | xargs shasum -a 256 > KOSU/muhur.txt; echo "muhur yazildi: $(wc -l < KOSU/muhur.txt | tr -d ' ') dosya";;
  kontrol) [ -f KOSU/muhur.txt ] || { echo "KIRMIZI muhur yok"; exit 1; }
    if shasum -a 256 -c KOSU/muhur.txt --status 2>/dev/null; then echo "YESIL muhur saglam ($(wc -l < KOSU/muhur.txt | tr -d ' ') dosya)"; yeni=$(comm -13 <(cut -c67- KOSU/muhur.txt | sort) <(liste)); [ -n "$yeni" ] && echo "  bilgi — yeni (muhursuz) test dosyalari:" && echo "$yeni" | sed 's/^/    /'; exit 0
    else echo "KIRMIZI muhur bozuldu:"; shasum -a 256 -c KOSU/muhur.txt 2>/dev/null | grep -v ': OK$' | sed 's/^/    /'; exit 1; fi;;
  *) echo "kullanim: muhur.sh yaz|kontrol"; exit 2;;
esac
