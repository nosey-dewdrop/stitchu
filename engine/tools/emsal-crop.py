#!/usr/bin/env python3
"""
emsal-crop.py — crop embedded fashion flat technical drawings out of raw
Etsy/Pinterest screenshots.

Method (imagemagick-free, PIL + numpy only):
  1. Downscale-safe: work on full res.
  2. Build a "dark line" mask (near-black thin strokes on a light ground).
  3. Dilate the mask so strokes of one garment merge into one blob, then
     label connected components (pure-numpy flood via a grid-union).
  4. For each component bounding box, expand a touch, score it with the
     flat-detector (white_frac / lowsat_frac / skin_frac / dark_frac).
  5. Keep boxes that pass the flat gate and geometry gate; save PNG crops.

Output: design_patterns/crops/<img>-<n>.png
"""
import os, glob, sys, json, re
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DP = os.path.join(ROOT, "design_patterns")
OUT = os.path.join(DP, "crops")
os.makedirs(OUT, exist_ok=True)

# irrelevant screenshots (terminal / app / icon-illustration panels)
# 29.png is a "how it works" panel of flat-shaded ICONS (printer, scroll)
# that pass the line-flat gate statistically but are not garments.
SKIP = {"1.png", "86.png", "88.png", "29.png"}

MIN_SIDE = 200          # px, drop tiny boxes / slivers
MAX_ASPECT = 2.6        # drop very long/thin (text ribbons, ui bars)
MIN_ASPECT = 0.34       # 1/MAX_ASPECT-ish
MAX_AREA_FRAC = 0.22    # a single flat never fills > this frac of the page
                        # (bigger blob = merged grid / whole-page chrome)

# flat gate thresholds (from working prototype)
WHITE_MIN = 0.45
LOWSAT_MIN = 0.60
SKIN_MAX = 0.08
DARK_MIN = 0.02
DARK_MAX = 0.10         # flats are thin outlines; >0.10 = text/photo/solid block
ROWSTD_MAX = 0.08       # per-row dark density std; text banding spikes this


def to_rgb(im):
    if im.mode != "RGB":
        im = im.convert("RGB")
    return im


def flat_score(arr):
    """arr: HxWx3 uint8. Returns dict of fractions."""
    r = arr[..., 0].astype(np.int32)
    g = arr[..., 1].astype(np.int32)
    b = arr[..., 2].astype(np.int32)
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    lum = (r + g + b) / 3.0
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0.0)

    n = arr.shape[0] * arr.shape[1]
    white_frac = np.mean(lum > 225)
    lowsat_frac = np.mean(sat < 0.18)
    dark_frac = np.mean(lum < 110)
    # skin: warm mid tone, R>G>B, moderate luminance
    skin = (r > 95) & (r > g) & (g > b) & (r - b > 15) & (r - b < 120) & (lum > 60) & (lum < 220)
    skin_frac = np.mean(skin)
    # per-row dark-density std: text blocks spike (dense text rows vs gaps),
    # line flats spread the strokes evenly.
    perrow = (lum < 110).mean(axis=1)
    rowstd = float(perrow.std())
    return dict(white=white_frac, lowsat=lowsat_frac, dark=dark_frac,
                skin=skin_frac, rowstd=rowstd)


def is_flat(s):
    return (s["white"] > WHITE_MIN and s["lowsat"] > LOWSAT_MIN and
            s["skin"] < SKIN_MAX and DARK_MIN < s["dark"] < DARK_MAX and
            s["rowstd"] < ROWSTD_MAX)


def classify(s):
    """Every kept box is a garment target. Split into:
      flat  — technical line drawing (white ground, low sat, thin dark strokes)
      photo — model/worn photo (visible skin)
      cover — everything else (colored cover art, shaded illustration, product
              still on colored ground)."""
    if is_flat(s):
        return "flat"
    if s["skin"] > 0.10:
        return "photo"
    # a looser flat: mostly white + low-sat but a touch outside the strict gate
    if s["white"] > 0.42 and s["lowsat"] > 0.55 and s["skin"] < 0.08:
        return "flat"
    return "cover"


def is_junk(s, h, w):
    """Reject boxes that are clearly not a single garment image: near-empty
    white tiles, or dense text/UI blocks (very high dark density with banding)."""
    if s["dark"] < 0.006 and s["skin"] < 0.02:
        return True                       # essentially blank
    if s["dark"] > 0.30 and s["skin"] < 0.05 and s["rowstd"] > 0.12:
        return True                       # dense banded text / UI block
    return False


def source_name(path):
    base = os.path.basename(path)
    m = re.match(r"(\d+)\.png$", base)
    if m:
        return m.group(1)
    m2 = re.search(r"(\d{2})\.(\d{2})\.(\d{2})\.png$", base)   # archive timestamp
    if m2:
        return "ar-" + "".join(m2.groups())
    return re.sub(r"[^0-9a-zA-Z]", "", base)[:12] or "x"


def dilate(mask, k):
    """Box dilation by radius k via separable max over a summed-area trick.
    Downscale-block dilation: OR-pool the mask onto a coarse grid, dilate
    there cheaply, this is enough to merge nearby garment strokes."""
    m = mask
    for _ in range(k):
        out = m.copy()
        out[1:, :] |= m[:-1, :]
        out[:-1, :] |= m[1:, :]
        out[:, 1:] |= m[:, :-1]
        out[:, :-1] |= m[:, 1:]
        m = out
    return m


def label_components(mask, min_pixels):
    """Connected-component labelling (4-conn) via union-find over a coarse
    block grid (blocks that contain any mask pixel). Coarse grid keeps it
    fast on full-res screenshots; boxes are refined back to pixel extent.
    Returns list of (y0,y1,x0,x1,count)."""
    H, W = mask.shape
    B = 6  # block size in px
    gh, gw = (H + B - 1) // B, (W + B - 1) // B
    # block occupancy + per-block mask-pixel count
    trimH, trimW = gh * B, gw * B
    pad = np.zeros((trimH, trimW), dtype=bool)
    pad[:H, :W] = mask
    blk = pad.reshape(gh, B, gw, B)
    occ = blk.any(axis=(1, 3))
    cnt = blk.sum(axis=(1, 3)).astype(np.int32)

    parent = np.full(gh * gw, -1, dtype=np.int64)

    def find(x):
        root = x
        while parent[root] != root:
            root = parent[root]
        while parent[x] != root:
            parent[x], x = root, parent[x]
        return root

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[max(ra, rb)] = min(ra, rb)

    idx = np.argwhere(occ)
    for (gy, gx) in idx:
        i = gy * gw + gx
        parent[i] = i
    for (gy, gx) in idx:
        i = gy * gw + gx
        if gx + 1 < gw and occ[gy, gx + 1]:
            union(i, gy * gw + gx + 1)
        if gy + 1 < gh and occ[gy + 1, gx]:
            union(i, (gy + 1) * gw + gx)

    comps = {}
    for (gy, gx) in idx:
        i = gy * gw + gx
        r = find(i)
        c = comps.setdefault(r, [gy, gy, gx, gx, 0])
        c[0] = min(c[0], gy); c[1] = max(c[1], gy)
        c[2] = min(c[2], gx); c[3] = max(c[3], gx)
        c[4] += int(cnt[gy, gx])

    boxes = []
    for c in comps.values():
        if c[4] < min_pixels:
            continue
        y0 = c[0] * B
        y1 = min(H, (c[1] + 1) * B)
        x0 = c[2] * B
        x1 = min(W, (c[3] + 1) * B)
        boxes.append((y0, y1, x0, x1, c[4]))
    return boxes


def trim_caption(sub):
    """Trim a bottom text/caption band (Etsy title+price rows sit under the
    card image on a light ground). Scan up from the bottom while rows look like
    caption rows (light ground + sparse thin dark strokes) and stop at the
    image body. Also trim such a band from the top (badges/ratings)."""
    sub_i = sub.astype(np.int32)
    lum = sub.mean(axis=2)
    sat_px = (sub_i.max(axis=2) - sub_i.min(axis=2))   # 0..255, low = grayscale
    H = lum.shape[0]
    dark_row = (lum < 120).mean(axis=1)          # dark px frac per row
    # caption ground: light (white OR light-gray) and near-grayscale
    ground = ((lum > 195) & (sat_px < 40))
    light_row = ground.mean(axis=1)
    caption = (light_row > 0.5) & (dark_row > 0.006) & (dark_row < 0.30)
    # blank rows count as trimmable too (padding around caption)
    blank = (light_row > 0.9) & (dark_row < 0.01)
    trimmable = caption | blank

    top = 0
    while top < H and trimmable[top]:
        top += 1
    bot = H
    while bot > top and trimmable[bot - 1]:
        bot -= 1
    # allow trimming down to a garment-sized core (caption bands can be tall);
    # only refuse if we'd shave away almost everything.
    if (bot - top) < max(160, int(0.45 * H)):
        return sub, 0
    return sub[top:bot], top


def is_text_block(sub):
    """A crop that is mostly caption/UI text (light ground, many thin dark
    rows across most of the height) rather than a garment image."""
    lum = sub.mean(axis=2)
    dark_row = (lum < 120).mean(axis=1)
    light_row = (lum > 225).mean(axis=1)
    caption_rows = ((light_row > 0.5) & (dark_row > 0.01) & (dark_row < 0.32))
    return caption_rows.mean() > 0.55


def process(path):
    name = os.path.basename(path)
    im = to_rgb(Image.open(path))
    arr = np.asarray(im)
    H, W = arr.shape[:2]

    r = arr[..., 0].astype(np.int32)
    g = arr[..., 1].astype(np.int32)
    b = arr[..., 2].astype(np.int32)
    lum = arr.mean(axis=2)
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0.0)

    # "content" = anything that stands out from the near-white grid ground:
    #   dark line strokes (flats)  OR  saturated/colored pixels (photos, covers).
    # This catches photos too (a flat-only dark mask would miss skin/color).
    content = (lum < 150) | ((sat > 0.15) & (lum < 240))
    # remove UI chrome: OS menu bar + browser tab strip (top ~9%),
    # dock/bottom (~4.5%), and the left browser sidebar (~x<4.5%) which
    # otherwise chains every cell into one blob.
    content[: int(H * 0.09), :] = False
    content[int(H * 0.955):, :] = False
    content[:, : int(W * 0.045)] = False

    # dilate lightly: merge one garment's strokes but NOT across grid gutters
    merged = dilate(content, 4)
    boxes = label_components(merged, min_pixels=MIN_SIDE * MIN_SIDE // 6)

    saved = 0
    recs = []
    src = source_name(path)
    for (y0, y1, x0, x1, cnt) in boxes:
        h = y1 - y0
        w = x1 - x0
        if h < MIN_SIDE or w < MIN_SIDE:
            continue
        asp = w / h
        if asp > MAX_ASPECT or asp < MIN_ASPECT:
            continue
        if (h * w) > (H * W * MAX_AREA_FRAC):
            continue  # oversized = merged grid / page chrome, not one garment
        # pad a little, clamp
        py = int(h * 0.06); px = int(w * 0.06)
        yy0 = max(0, y0 - py); yy1 = min(H, y1 + py)
        xx0 = max(0, x0 - px); xx1 = min(W, x1 + px)
        sub = arr[yy0:yy1, xx0:xx1]
        sub, off = trim_caption(sub)
        if sub.shape[0] < 160 or sub.shape[1] < MIN_SIDE:
            continue
        s = flat_score(sub)
        if is_junk(s, sub.shape[0], sub.shape[1]) or is_text_block(sub):
            continue
        yy0 = yy0 + off                             # keep bbox in sync with trim
        yy1 = yy0 + sub.shape[0]
        kind = classify(s)
        saved += 1
        fname = f"{src}-{saved}.png"
        Image.fromarray(sub).save(os.path.join(OUT, fname))
        recs.append({
            "file": fname,
            "source": name,
            "kind": kind,
            "bbox": [int(xx0), int(yy0), int(xx1), int(yy1)],
            "flat_score": round(
                (s["white"] + s["lowsat"] + min(s["dark"], 0.10)) / 3
                - s["skin"], 3),
            "skin_score": round(float(s["skin"]), 3),
        })
    return recs


def main():
    # fresh run: clear stale crops (there is no prior manifest to preserve)
    for f in glob.glob(os.path.join(OUT, "*.png")):
        os.remove(f)

    imgs = sorted(glob.glob(os.path.join(DP, "*.png"))) + \
           sorted(glob.glob(os.path.join(DP, "arsiv", "*.png")))
    records = []
    per = {}
    for p in imgs:
        if os.path.basename(p) in SKIP:
            continue
        try:
            recs = process(p)
        except Exception as e:
            print("ERR", p, e)
            recs = []
        records.extend(recs)
        if recs:
            per[os.path.basename(p)] = len(recs)

    with open(os.path.join(OUT, "manifest.json"), "w") as fh:
        json.dump(records, fh, indent=1)

    from collections import Counter
    kinds = Counter(x["kind"] for x in records)
    print(f"TOTAL CROPS: {len(records)} from {len(imgs)} screenshots")
    print(f"screenshots yielding crops: {len(per)}")
    print(f"kinds: {dict(kinds)}")
    top = sorted(per.items(), key=lambda kv: -kv[1])[:12]
    print("top yielders:", top)


if __name__ == "__main__":
    main()
