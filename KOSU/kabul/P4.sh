#!/usr/bin/env bash
# P4 tek hat — ADIM 6 · ISTEK 1.9 1.13 1.14
source "$(dirname "$0")/_ortak.sh"
d=$(bash engine/tests/enum_dallanma_check.sh --measure 2>/dev/null | grep -E '^cpp\.dallanma' | grep -oE '[0-9]+$'); [ "${d:-x}" = 0 ] && ok "enum dallanma 0" || kir "enum dallanma ${d:-?} (0 olmali)"
[ -z "$(rg -l 'flat-from-pattern|flat-geom' web/js web/create.html 2>/dev/null)" ] && ok "web flat'i C++'tan" || kir "flat-from-pattern hala cagriliyor"
var $C/once-sonra.png; png_boyut $C/once-sonra.png
for f in $C/0[1-9]-*.svg; do katman $f; done
[ -z "$(git ls-files $C/paket-01 $C/paket-02 $C/vitrin $C/puf)" ] && ok "onaysiz ciktilar silindi" || kir "paket-01/02, vitrin, puf hala git'te"
! grep -q "Buğra'nın 2 kalıbının" CLAUDE.md 2>/dev/null && ok "CLAUDE.md eski hedef satiri silindi" || kir "CLAUDE.md'de 29 Tem hedef satiri duruyor"
hukum P4
