#!/bin/bash
# Fetches a small real-photo eval corpus from Wikimedia Commons (free licenses).
# One representative photo per search term, 800px thumb, into vision/eval/photos/.
set -uo pipefail
cd "$(dirname "$0")/eval/photos"
i=0
while IFS='|' read -r term; do
  i=$((i+1))
  slug=$(echo "$term" | tr ' ' '-' | tr -cd 'a-z0-9-')
  api="https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=filetype:bitmap%20$(echo "$term" | sed 's/ /%20/g')&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=800"
  url=$(curl -s -m 20 "$api" | python3 -c "import json,sys; d=json.load(sys.stdin); pages=d.get('query',{}).get('pages',{}); print(next(iter(pages.values()))['imageinfo'][0]['thumburl'] if pages else '')" 2>/dev/null)
  if [ -n "$url" ]; then
    curl -s -m 30 -L -o "$(printf '%02d' $i)-$slug.jpg" -A "stitchu-eval/0.1 (damummyphus@gmail.com)" "$url" && echo "ok  $(printf '%02d' $i)-$slug.jpg"
  else
    echo "MISS $term"
  fi
  sleep 1
done << 'TERMS'
a-line cocktail dress mannequin
ball gown exhibit
wedding dress mannequin
babydoll dress
empire waist gown
pleated skirt
circle skirt dancing
denim pencil skirt
gathered skirt folk costume
tiered ruffle dress
flamenco dress ruffles
sweetheart neckline gown
keyhole neckline dress
v-neck dress mannequin
square neckline dress
boat neck top
knit sweater mannequin
jersey t-shirt mannequin
blouse long sleeves mannequin
puff sleeve dress
sleeveless summer dress
maxi dress mannequin
mini dress 1960s mannequin
midi shirt dress
crop top mannequin
tunic top
evening gown red carpet
lace dress mannequin
satin slip dress
linen dress mannequin
TERMS
