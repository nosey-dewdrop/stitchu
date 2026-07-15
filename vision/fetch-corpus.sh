#!/bin/bash
# Track B v1 training corpus fetcher.
# Bulk-downloads openly licensed garment photos from Wikimedia Commons and
# Openverse, with search terms covering every vocabulary value in
# vision/eval/labels.json (garment, neckline, sleeveStyle, skirtStyle,
# length, waistline, fabric, hemRuffle, keyhole).
#
# Usage:
#   ./fetch-corpus.sh              # default LIMIT=70 (evidence batch)
#   LIMIT=400 ./fetch-corpus.sh    # full capacity run (300-500 target)
#
# Output: vision/corpus/photos/NN-source-term.jpg + vision/corpus/manifest.json
# Re-runnable: continues numbering, merges manifest, md5-dedupes everything.
set -uo pipefail

UA="stitchu-eval/0.1 (damummyphus@gmail.com)"
LIMIT="${LIMIT:-70}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/corpus"
PHOTOS="$OUT/photos"
CAND="$OUT/.candidates.tsv"
LOG="$OUT/.fetch-log.jsonl"
MANIFEST="$OUT/manifest.json"
mkdir -p "$PHOTOS"
: > "$CAND"
: > "$LOG"

# One term per vocabulary value (comments = what each covers).
TERMS=(
  "a-line skirt"                # skirtStyle aLine, garment skirt
  "pencil skirt"                # skirtStyle straight
  "gathered skirt"              # skirtStyle gathered
  "circle skirt"                # skirtStyle halfCircle
  "pleated skirt"               # skirtStyle pleated
  "crew neck t-shirt"           # neckline crew, garment top
  "scoop neck top"              # neckline scoop
  "v-neck dress"                # neckline vNeck
  "square neckline dress"       # neckline square
  "boat neck top"               # neckline boat
  "sweetheart neckline gown"    # neckline sweetheart
  "halter neck dress"           # neckline halter
  "keyhole neckline dress"      # keyhole true
  "puff sleeve blouse"          # sleeveStyle balloon
  "long sleeve dress"           # sleeveStyle straight
  "sleeveless summer dress"     # sleeveStyle none
  "mini dress"                  # length mini
  "midi dress"                  # length midi
  "maxi dress"                  # length maxi
  "empire waist dress"          # waistline empire
  "fit and flare dress"         # waistline natural
  "knit sweater"                # fabric knit
  "linen dress"                 # fabric woven
  "satin dress"                 # fabricName satin
  "denim skirt"                 # fabricName denim
  "lace dress"                  # fabricName lace
  "ruffle hem dress"            # hemRuffle single
  "tiered ruffle dress"         # hemRuffle tiered
  # --- runway / couture: the HARD real-user condition (model, pose, editorial
  # light, dramatic garments). Named houses + fashion-week terms. This is what a
  # user actually photographs, and what Track B must learn to read.
  "Versace runway"
  "Dior haute couture runway"
  "Chanel fashion show"
  "Yves Saint Laurent runway"
  "Schiaparelli couture"
  "Armani runway"
  "Valentino runway gown"
  "fashion week runway dress"
  "haute couture gown runway"
  "evening gown red carpet"
  "runway model dress"
  "couture ball gown"
  "cocktail dress fashion"
  "designer evening dress"
)
NTERMS=${#TERMS[@]}
# Ask each source for ~1.5x headroom per term so misses/dupes still fill LIMIT.
PER_Q=$(( (LIMIT * 3 / 2 + NTERMS * 2 - 1) / (NTERMS * 2) ))
[ "$PER_Q" -lt 1 ] && PER_Q=1
echo "LIMIT=$LIMIT terms=$NTERMS per_source_per_term=$PER_Q"

# ---- phase 1: collect candidates (term \t source \t img \t page \t license) ----
for term in "${TERMS[@]}"; do
  # Wikimedia Commons
  curl -sG -m 20 -A "$UA" "https://commons.wikimedia.org/w/api.php" \
    --data-urlencode "action=query" --data-urlencode "format=json" \
    --data-urlencode "generator=search" \
    --data-urlencode "gsrsearch=filetype:bitmap $term" \
    --data-urlencode "gsrnamespace=6" --data-urlencode "gsrlimit=$PER_Q" \
    --data-urlencode "prop=imageinfo" \
    --data-urlencode "iiprop=url|size|extmetadata" \
    --data-urlencode "iiurlwidth=800" \
  | python3 -c "
import json,sys
try: d=json.load(sys.stdin)
except Exception: d={}
pages=d.get('query',{}).get('pages',{})
for p in sorted(pages.values(),key=lambda x:x.get('index',0)):
    ii=(p.get('imageinfo') or [{}])[0]
    url=ii.get('thumburl') or ii.get('url')
    if not url: continue
    if ii.get('width',0)<200 or ii.get('height',0)<200: continue
    lic=(ii.get('extmetadata') or {}).get('LicenseUrl',{}).get('value','')
    print('\t'.join([sys.argv[1],'commons',url,ii.get('descriptionurl',''),lic]))
" "$term" >> "$CAND"
  sleep 1
  # Openverse
  curl -sG -m 20 -A "$UA" "https://api.openverse.org/v1/images/" \
    --data-urlencode "q=$term" --data-urlencode "page_size=$PER_Q" \
  | python3 -c "
import json,sys
try: d=json.load(sys.stdin)
except Exception: d={}
for r in d.get('results',[]):
    url=r.get('url')
    if not url: continue
    w=r.get('width') or 0; h=r.get('height') or 0
    if (w and w<200) or (h and h<200): continue
    print('\t'.join([sys.argv[1],'openverse',url,r.get('foreign_landing_url') or '',r.get('license_url') or '']))
" "$term" >> "$CAND"
  sleep 1
done
echo "candidates: $(wc -l < "$CAND" | tr -d ' ')"

# ---- phase 2: interleave by term/source (fair coverage), drop duplicate URLs ----
python3 -c "
import sys
groups={}; order=[]
for line in open(sys.argv[1]):
    line=line.rstrip('\n')
    if not line: continue
    parts=line.split('\t')
    key=(parts[0],parts[1])
    if key not in groups: groups[key]=[]; order.append(key)
    groups[key].append(line)
seen=set(); out=[]
while any(groups.values()):
    for k in order:
        if groups[k]:
            line=groups[k].pop(0)
            url=line.split('\t')[2]
            if url in seen: continue
            seen.add(url); out.append(line)
print('\n'.join(out))
" "$CAND" > "$CAND.rr"
mv "$CAND.rr" "$CAND"

# ---- phase 3: download until LIMIT, validate mime + min 200px ----
n=0
for f in "$PHOTOS"/*.jpg; do
  [ -e "$f" ] || continue
  num=$(basename "$f" | sed 's/[^0-9].*//')
  [ -n "$num" ] && [ "$((10#$num))" -gt "$n" ] && n=$((10#$num))
done
count=0
while IFS=$'\t' read -r term source imgurl srcurl licurl; do
  [ "$count" -ge "$LIMIT" ] && break
  [ -z "$imgurl" ] && continue
  tmp="$PHOTOS/.tmp.download"
  curl -s -m 40 -L -A "$UA" -o "$tmp" "$imgurl" || { rm -f "$tmp"; continue; }
  sleep 1
  mime=$(file -b --mime-type "$tmp" 2>/dev/null || echo "")
  case "$mime" in image/*) ;; *) rm -f "$tmp"; echo "drop non-image ($mime) $imgurl"; continue;; esac
  w=$(sips -g pixelWidth  "$tmp" 2>/dev/null | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$tmp" 2>/dev/null | awk '/pixelHeight/{print $2}')
  if [ -z "${w:-}" ] || [ -z "${h:-}" ] || [ "$w" -lt 200 ] || [ "$h" -lt 200 ]; then
    rm -f "$tmp"; echo "drop small (${w:-?}x${h:-?}) $imgurl"; continue
  fi
  n=$((n+1)); count=$((count+1))
  slug=$(echo "$term" | tr 'A-Z' 'a-z' | tr ' ' '-' | tr -cd 'a-z0-9-')
  name="$(printf '%02d' "$n")-$source-$slug.jpg"
  mv "$tmp" "$PHOTOS/$name"
  python3 -c "
import json,sys
print(json.dumps({'file':sys.argv[1],'source_url':sys.argv[2] or None,'license_info_url':sys.argv[3] or None,'search_term':sys.argv[4]}))
" "$name" "$srcurl" "$licurl" "$term" >> "$LOG"
  echo "ok  $name (${w}x${h})"
done < "$CAND"

# ---- phase 4: md5 dedupe across ALL photos, write merged manifest ----
python3 -c "
import hashlib,json,os,sys
photos,log,manifest_path=sys.argv[1:4]
old=[]
if os.path.exists(manifest_path):
    try: old=json.load(open(manifest_path))
    except Exception: old=[]
new=[json.loads(l) for l in open(log) if l.strip()]
by_file={e['file']:e for e in old+new}
files=sorted(f for f in os.listdir(photos) if f.lower().endswith('.jpg'))
seen={}; dropped=0; kept=[]
for f in files:
    p=os.path.join(photos,f)
    h=hashlib.md5(open(p,'rb').read()).hexdigest()
    if h in seen:
        os.remove(p); dropped+=1
        print(f'dedupe drop {f} (dup of {seen[h]})')
        continue
    seen[h]=f
    kept.append(by_file.get(f) or {'file':f,'source_url':None,'license_info_url':None,'search_term':None})
json.dump(kept,open(manifest_path,'w'),indent=2)
print(f'RESULT kept={len(kept)} deduped={dropped}')
" "$PHOTOS" "$LOG" "$MANIFEST"
rm -f "$CAND" "$LOG"
echo "done -> $PHOTOS"
