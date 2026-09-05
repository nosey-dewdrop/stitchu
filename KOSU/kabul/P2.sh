#!/usr/bin/env bash
# P2 edit = op — ADIM 4,8 · ISTEK 1.2 1.9
source "$(dirname "$0")/_ortak.sh"; G=$C/graf-ilk/graf.json; D=$C/edit
var $D/kontak.png; png_boyut $D/kontak.png
n=$(ls $D/*.ops.json 2>/dev/null | wc -l | tr -d ' '); [ "$n" -ge 8 ] && ok "$n edit" || kir "8 edit gerekli, $n var"
for o in $D/*.ops.json; do ad=$(basename $o .ops.json)
  var $D/$ad-once.png $D/$ad-sonra.png
  [ -x engine/build/grafop ] || { kir "engine/build/grafop yok (P2 kurar: grafop <graf> <ops.json> > graf)"; break; }
  engine/build/grafop $G $o > /tmp/_e1.json 2>/dev/null; engine/build/grafop $G $o > /tmp/_e2.json 2>/dev/null
  cmp -s /tmp/_e1.json /tmp/_e2.json && [ -s /tmp/_e1.json ] && ok "op deterministik: $ad" || kir "op deterministik degil/bos: $ad"
  dogrula /tmp/_e1.json gercek36; dogrula /tmp/_e1.json croquis36
  # edit-locality: ops'ta adi gecmeyen paneller bayt-ayni
  python3 - "$G" /tmp/_e1.json "$o" <<'PY' && ok "bolge disi paneller bayt-ayni: $ad" || kir "bolge disi panel degisti: $ad"
import json,sys
a=json.load(open(sys.argv[1]));b=json.load(open(sys.argv[2]));ops=json.load(open(sys.argv[3]))
touched=set(); s=json.dumps(ops)
for p in a['panels']:
    if p['id'] in s: touched.add(p['id'])
B={p['id']:p for p in b['panels']}
for p in a['panels']:
    if p['id'] in touched: continue
    if json.dumps(p,sort_keys=True)!=json.dumps(B.get(p['id']),sort_keys=True): sys.exit(1)
PY
done
hukum P2
