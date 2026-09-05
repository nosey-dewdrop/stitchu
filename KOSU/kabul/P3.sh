#!/usr/bin/env bash
# P3 sinirsizlik — ADIM 9 · ISTEK 1.5 1.7 1.9 1.12
source "$(dirname "$0")/_ortak.sh"; D=$C/graf
var $C/flat-ayni-insan.png $C/emsal-vs-biz.png $C/_yerel/bugra-bindirme.png $C/_yerel/bugra-bindirme.md
png_boyut $C/flat-ayni-insan.png $C/emsal-vs-biz.png
n=$(ls $D/*.graf.json 2>/dev/null | wc -l | tr -d ' '); [ "$n" -ge 16 ] && ok "$n graf (2 Bugra + 9 kompozisyon + 5 emsal)" || kir "16 graf gerekli, $n var"
for g in $D/*.graf.json; do dogrula $g gercek36; dogrula $g croquis36; done
farkli $D/*.graf.json
grep -qE 'mm' $C/_yerel/bugra-bindirme.md && ok "bugra bindirme mm raporu" || kir "bugra raporunda mm yok"
node engine/tests/flat_ayni_insan_check.mjs >/tmp/_fai.txt 2>&1 && ok "flat_ayni_insan yesil" || { kir "flat_ayni_insan kirmizi"; tail -3 /tmp/_fai.txt; }
hukum P3
