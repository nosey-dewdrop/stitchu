#!/bin/bash
# live-eval.sh — run every corpus photo through the LIVE worker vision endpoint
# and record what it read. Use to measure the real product accuracy (photo ->
# garment spec), especially the flow-killing garment="other"/null rate, and to
# compare before/after a prompt change once the worker is redeployed.
#
# The x-app-token bypasses the public 15/day fuse (20/min instead). Put the
# token in App/Stitchu/.app-token-note.txt (gitignored).
#
# usage: bash vision/live-eval.sh > vision/eval/live-predictions.json
#   then: python3 vision/live-eval-score.py vision/eval/live-predictions.json
set -euo pipefail
cd "$(dirname "$0")/.."
TOKEN=$(cat App/Stitchu/.app-token-note.txt 2>/dev/null | tr -d '[:space:]')
URL="https://stitchu-api.damummyphus.workers.dev/api/analyze"
[ -z "$TOKEN" ] && { echo "no app token" >&2; exit 1; }

echo "{"
first=1
for img in vision/corpus/photos/*.jpg; do
  base=$(basename "$img")
  b64=$(base64 -i "$img" 2>/dev/null | tr -d '\n')
  resp=$(curl -s -X POST "$URL" -H "x-app-token: $TOKEN" -H "content-type: application/json" \
    -d "{\"image\":\"$b64\",\"mediaType\":\"image/jpeg\"}" 2>/dev/null)
  txt=$(echo "$resp" | python3 -c "import sys,json;print(json.load(sys.stdin).get('content',[{}])[0].get('text',''))" 2>/dev/null || true)
  if [ -n "$txt" ]; then
    [ $first -eq 0 ] && echo ","
    printf '"%s": %s' "$base" "$txt"
    first=0
  else
    echo "READ-FAIL $base: $(echo "$resp" | head -c 120)" >&2
  fi
  sleep 3.5
done
echo ""
echo "}"
