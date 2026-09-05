#!/usr/bin/env bash
# P7 terzilik — ADIM 5,7 · ISTEK 1.6 1.7 1.10 3.2
source "$(dirname "$0")/_ortak.sh"; D=$C/kumas-farki
var $D/kumas-farki.png $D/malzeme.md $D/rehber-tr.md $D/rehber-en.md; png_boyut $D/kumas-farki.png
for k in cotton-lawn cotton-modal-jersey viscose-crepe; do var $D/kalip-$k.svg $D/flat-$k.svg $D/dikilebilir-$k.md; done
farkli $D/kalip-cotton-lawn.svg $D/kalip-cotton-modal-jersey.svg $D/kalip-viscose-crepe.svg
cmp -s $D/flat-cotton-lawn.svg $D/flat-cotton-modal-jersey.svg && cmp -s $D/flat-cotton-lawn.svg $D/flat-viscose-crepe.svg && ok "flat 3 kumasta bayt-ayni" || kir "flat kumasla degisti (degismemeli)"
grep -qi "pervaz\|facing" $D/kalip-cotton-lawn.svg && ok "pervaz parcasi kalipta" || kir "pervaz yok"
grep -qiE "fermuar|zip" $D/malzeme.md && grep -qiE "cm|m\b" $D/malzeme.md && ok "malzeme listesi" || kir "malzeme listesinde fermuar/metraj yok"
grep -qE "\[[0-9]+\]|http|kaynak" $D/rehber-tr.md && ok "rehber kaynakli" || kir "rehber kaynaksiz"
hukum P7
