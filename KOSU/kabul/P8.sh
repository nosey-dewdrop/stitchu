#!/usr/bin/env bash
# P8 urun ve paket — ADIM 1,6,7,8 · ISTEK 1.10 1.13 4.4 HEDEF §4
source "$(dirname "$0")/_ortak.sh"; D=$C/paket-03
var $D/README.md $D/flat.svg $D/flat.png $D/rehber-tr.md $D/rehber-en.md $D/dikilebilir.md $D/malzeme.md $D/beden-tablosu.md $D/prova-listesi.md $D/graf.json $D/damga.json $C/canli-ekran.png
ls $D/kalip-A4-EU36.pdf >/dev/null 2>&1 && ok "A4 pdf" || kir "kalip-A4-EU36.pdf yok"
[ "$(ls $D/ekran-*.png 2>/dev/null | wc -l | tr -d ' ')" -ge 3 ] && ok "ekranlar" || kir "en az 3 ekran png"
grep -qiE "fotograf|foto" $D/README.md && ! grep -qi "PROMPT KOKENLI" $D/README.md && ok "koken fotograf" || kir "paket fotograf kokenli degil"
grep -qE "[0-9]+(\.[0-9]+)? ?mm" $D/dikilebilir.md && ok "dikilebilirlik mm tablosu" || kir "dikilebilir.md'de mm yok"
grep -qi "beklenen" $D/prova-listesi.md && ok "prova listesi beklenen sayilarla" || kir "prova listesinde beklenen sayi yok"
python3 engine/tools/techpack-verify.py $D >/dev/null 2>&1 && ok "techpack-verify" || kir "techpack-verify kirmizi"
! rg -qiE '\$[0-9]|₺|€[0-9]|price|fiyat' web/index.html && ok "landing'de fiyat yok" || kir "landing'de fiyat/price"
! rg -qi "patch-notes\|patch notes" web/index.html && ok "patch notes yok" || kir "landing'de patch notes"
curl -s --max-time 20 https://stitchu.noseydewdrop.com/create.html | grep -q "stitchu" && ok "canli 200" || kir "canli site cevap vermiyor"
dogrula $D/graf.json gercek36
hukum P8
