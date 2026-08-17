#!/usr/bin/env python3
# 20-panel-png.py — draw the engine's own panel contours to a PNG so a HUMAN can
# look at them (HEDEF.md § YASALAR-5: an SVG path you liked is not evidence).
#   run:  engine/build-6a/surface-pattern EU38 > /tmp/eu38.json
#         python3 flatten-research/20-panel-png.py /tmp/eu38.json /tmp/eu38.png
import json
import sys

from PIL import Image, ImageDraw

spec = json.load(open(sys.argv[1]))
out = sys.argv[2]
panels = spec["pattern"]["panels"]
names = [n for n in panels if "torso" in n] + [n for n in panels if "torso" not in n]

COLS, PAD, W = 4, 24, 470
rows = (len(names) + COLS - 1) // COLS
img = Image.new("RGB", (COLS * W, rows * W), "white")
d = ImageDraw.Draw(img)

for i, name in enumerate(names):
    v = panels[name]["vertices"]
    xs = [p[0] for p in v]
    ys = [p[1] for p in v]
    sx, sy = max(xs) - min(xs), max(ys) - min(ys)
    s = (W - 2 * PAD) / max(sx, sy, 1e-9)
    ox, oy = (i % COLS) * W, (i // COLS) * W
    pts = [(ox + PAD + (p[0] - min(xs)) * s, oy + W - PAD - (p[1] - min(ys)) * s) for p in v]
    d.polygon(pts, outline="black")
    # every vertex, so a corner that is really a 40-point curve is visible as one
    for p in pts:
        d.ellipse([p[0] - 1, p[1] - 1, p[0] + 1, p[1] + 1], fill="red")
    d.text((ox + 6, oy + 6), f"{name}  {sx:.0f}x{sy:.0f}mm  n={len(v)}", fill="blue")
    d.rectangle([ox, oy, ox + W - 1, oy + W - 1], outline="#cccccc")

img.save(out)
print(f"{out}  {len(names)} panel")
