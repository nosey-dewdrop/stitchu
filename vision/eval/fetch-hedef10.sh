#!/bin/bash
# fetch-hedef10.sh — HEDEF 10'un bankalanmamış BEŞ fotoğrafını canlı worker'ın
# vision ucundan BİR KEZ okur ve ham JSON'u fixture olarak diske yazar (§3.9).
#
# NEDEN VAR: hedef koşusu (engine/tests/hedef_kosu.mjs) SIFIR API ÇAĞRISI ile
# koşar. Ölçüm seti n=5'ten n=10'a çıkarken beş yeni VLM turu gerekti; o beş tur
# BİR KEZ ödendi ve buraya bankalandı. Bu betik bir daha koşturulmaz — koşarsa
# fixture yenilenir ve bu bir FAZ KARARIDIR, kartta maliyetiyle yazılır (§3.9).
#
# SET SEÇİMİ AJANA AİT DEĞİL: aşağıdaki beş ad contract/hedef-kosu-taban.json
# `_olcum_seti.hedef_10`'dan gelir ve seti HAKEM seçti (§3.8 md.2). Hakemin
# YEDEK 5'i (10 · 14 · 15 · 34 · 36) bu betikte YOKTUR ve buraya yazılmaz (K16).
#
#   bash vision/eval/fetch-hedef10.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
URL="https://stitchu-api.damummyphus.workers.dev/api/analyze"
OUT="vision/eval/live-hedef10-2026-08-26.json"

FILES=(
  13-keyhole-neckline-dress.jpg
  31-denim-skirt.jpg
  32-sleeveless-dress-mannequin.jpg
  37-tunic-blouse.jpg
  38-evening-gown-museum.jpg
)

echo "{" > "$OUT"
first=1
for base in "${FILES[@]}"; do
  img="vision/eval/photos/$base"
  b64=$(base64 -i "$img" | tr -d '\n')
  resp=$(curl -s -X POST "$URL" -H "content-type: application/json" \
    -d "{\"image\":\"$b64\",\"mediaType\":\"image/jpeg\"}")
  txt=$(printf '%s' "$resp" | python3 -c "import sys,json;print(json.load(sys.stdin).get('content',[{}])[0].get('text',''))" 2>/dev/null || true)
  if [ -z "$txt" ]; then
    echo "READ-FAIL $base: $(printf '%s' "$resp" | head -c 200)" >&2
    exit 1
  fi
  [ $first -eq 0 ] && echo "," >> "$OUT"
  printf '"%s": %s' "$base" "$txt" >> "$OUT"
  first=0
  echo "ok $base" >&2
  sleep 25   # public uç 3/dk + 15/gün ile sigortalı; sıraya girme, sınırı zorlama
done
printf '\n}\n' >> "$OUT"
python3 -c "import json,sys;d=json.load(open('$OUT'));print(len(d),'kayıt ->','$OUT')"
