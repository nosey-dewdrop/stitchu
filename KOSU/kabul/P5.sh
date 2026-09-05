#!/usr/bin/env bash
# P5 prompt -> graf — ADIM 2 · ISTEK 1.1 1.9 2.11 3.2
source "$(dirname "$0")/_ortak.sh"; D=$C/giris
var $D/giris-prompt-10.png; png_boyut $D/giris-prompt-10.png
n=$(ls $D/prompt-*.txt 2>/dev/null | wc -l | tr -d ' '); [ "$n" -ge 10 ] && ok "$n prompt" || kir "10 prompt gerekli, $n var"
for t in $D/prompt-*.txt; do g=${t%.txt}.graf.json; var $g ${t%.txt}-flat.png ${t%.txt}-kalip.svg; dogrula $g gercek36; done
farkli $D/prompt-*.graf.json
for s in "fiyonklu tek omuz" "kimono kollu" "korse" "keyhole"; do grep -qil "$s" $D/prompt-*.txt && ok "sozluk-disi prompt var: $s" || kir "sozluk-disi prompt yok: $s"; done
grep -qi "celis" $C/edge-case-tablosu.md && ok "celiskili prompt tabloda" || kir "celiskili prompt edge-case tablosunda yok"
hukum P5
