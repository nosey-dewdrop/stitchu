#!/usr/bin/env python3
# Score a live-predictions.json: how many photos the vision step read as a
# drawable garment vs the flow-killing garment="other"/null, plus the spread of
# what it read. Real product-accuracy signal for photo -> pattern.
#   usage: python3 vision/live-eval-score.py vision/eval/live-predictions.json
import json, sys
from collections import Counter

path = sys.argv[1] if len(sys.argv) > 1 else 'vision/eval/live-predictions.json'
d = json.load(open(path))

total = len(d)
other = [k for k, v in d.items() if v.get('garment') in ('other', None)]
garments = Counter(v.get('garment') for v in d.values())
necklines = Counter(v.get('neckline') for v in d.values())

print(f'photos read: {total}')
print(f'flow-killing garment=other/null: {len(other)}  ({100*len(other)/total:.1f}%)')
for k in other:
    print(f'   {k[:44]:44}  {d[k].get("garment")}  |  {d[k].get("details","")[:50]}')
print(f'\ngarment spread: {dict(garments)}')
print(f'neckline spread: {dict(necklines)}')
