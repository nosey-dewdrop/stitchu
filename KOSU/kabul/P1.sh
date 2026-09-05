#!/usr/bin/env bash
# P1 graftan cizim — ADIM 3,6 · ISTEK 1.3 1.4 1.5 1.9
source "$(dirname "$0")/_ortak.sh"; G=$C/graf-ilk/graf.json
var $G $C/graf-ilk/flat.svg $C/graf-ilk/flat.png $C/graf-ilk/kalip-36.svg $C/graf-ilk/kalip-36.png $C/graf-ilk/seri.png
png_boyut $C/graf-ilk/flat.png $C/graf-ilk/kalip-36.png $C/graf-ilk/seri.png
katman $C/graf-ilk/flat.svg
for b in gercek36 croquis36; do dogrula $G $b; done
ciz_iki_kez $G croquis36 flat; ciz_iki_kez $G gercek36 kalip
# 1.4: flat croquis36'dan, kalip gercek36'dan — ikisi ayni dosya olamaz
cmp -s $C/graf-ilk/flat.svg $C/graf-ilk/kalip-36.svg && kir "flat ve kalip ayni svg" || ok "flat != kalip"
# 1.5: flat svg croquis landmark'larini ilan eder (data-y-waist/bust/hip), contract ile +-2mm
python3 - <<'PY' && ok "croquis landmark ilan +-2mm" || kir "croquis landmark ilan yok ya da sapmis (data-y-waist/bust/hip, +-2mm)"
import json,re,sys
s=open('KOSU/ciktilar/graf-ilk/flat.svg').read(); b=json.load(open('contract/body-v1.json'))['bedenler']['croquis36']['landmarklar']
for k,lm in (('waist','landmark.waist'),('bust','landmark.bustLine'),('hip','landmark.hip')):
    m=re.search(r'data-y-%s="([-\d.]+)"'%k,s)
    if not m or abs(float(m.group(1))-b[lm]['y'])>2.0: sys.exit(1)
PY
# seri: 34-44 alti beden gercek grade'de degerlenir, hepsi dogrulayicidan gecer, ciktilar ikiser farkli
fs=(); for b in EU34 EU36 EU38 EU40 EU42 EU44; do dogrula $G $b; [ -x engine/build/grafciz ] && engine/build/grafciz $G $b kalip > /tmp/_s_$b.svg 2>/dev/null && fs+=(/tmp/_s_$b.svg); done
[ ${#fs[@]} -eq 6 ] && farkli "${fs[@]}" || kir "seri 6 beden cizilemedi"
# wasm parite: flatSVG binding native ile bayt-ayni (P1 binding adi: flatSVG(grafJSON, bodyId))
node -e "
const m=require('./web/vendor/stitchu-engine.js');(async()=>{const e=await (m.default||m)();const g=require('fs').readFileSync('$G','utf8');
const s=e.flatSVG?e.flatSVG(g,'croquis36'):'';require('fs').writeFileSync('/tmp/_w.svg',s);process.exit(s?0:1)})().catch(()=>process.exit(1))" 2>/dev/null \
 && engine/build/grafciz $G croquis36 flat 2>/dev/null | cmp -s - /tmp/_w.svg && ok "wasm = native (flatSVG)" || kir "wasm flatSVG yok ya da native'den farkli"
hukum P1
