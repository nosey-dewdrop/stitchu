#!/usr/bin/env bash
# P6 fotograf -> graf — ADIM 2,3,4 · ISTEK 1.1 1.7 1.8 1.11 3.1 3.2
source "$(dirname "$0")/_ortak.sh"; D=$C/giris
var $D/giris-foto-20.png $D/onizleme.png; png_boyut $D/giris-foto-20.png $D/onizleme.png
n=$(ls $D/foto-*.graf.json 2>/dev/null | wc -l | tr -d ' '); [ "$n" -ge 20 ] && ok "$n foto graf" || kir "20 foto gerekli, $n var"
for g in $D/foto-*.graf.json; do b=${g%.graf.json}; var $b-overlay.png $b-flat.png $b-kalip.svg; dogrula $g gercek36; done
farkli $D/foto-*.graf.json
# 3.1: arka fotografi olmayan her graf 'uydur' ilani tasir; arka cifti en az 2
u=$(grep -l -i "uydur" $D/foto-*.graf.json 2>/dev/null | wc -l | tr -d ' '); a=$(ls $D/foto-*-arka.* 2>/dev/null | wc -l | tr -d ' ')
[ "$a" -ge 2 ] && ok "$a on+arka cifti" || kir "en az 2 on+arka cifti gerekli"
[ "$u" -ge 1 ] && ok "$u grafta arka uydurma ilani" || kir "arka uydurma ilani hicbir grafta yok"
for s in bulanik "giysi olmayan" "birden fazla" "kismi"; do grep -qi "$s" $C/edge-case-tablosu.md && ok "edge: $s" || kir "edge tabloda yok: $s"; done
grep -qi "landmark\|siluet" $C/edge-case-tablosu.md && ok "landmark/siluet kaynagi tabloda" || kir "landmark/siluet kaynagi anilmiyor"
hukum P6
