#!/usr/bin/env python3
"""FULL forensic geometry extraction from Bugra (BP) A0 nested-size PDFs.

Extends patterns_real/tools/bugra-extract.py (2026-07-23 bbox/perimeter pass):
  * per PIECE, per SIZE RING closed contour POLYGONS (beziers sampled ~2mm)
  * ring -> size mapping via nested-bbox ordering (+ color cross-check)
  * size chart (EU 34..48 -> bust/waist/hip mm) read from the seller's
    "Choose Your Size" / "Sizes" JPGs (same chart in both products)
  * per-pattern one-glance SVG + PNG check sheets

Scale proof (same as 23 Tem pass): calibration "4cm bar" = 113.386pt = 40.00mm,
MediaBox 821x1169mm ~= A0, mm = pt * 25.4/72. Pure-stdlib PDF parse
(q/Q graphics-state stack, translate-only `cm` matrices a=d=1,b=c=0);
PIL only for the PNG check sheets.

Outputs (kept OUT of the repo -- purchased pattern content never leaves /tmp):
  /tmp/bugra-yuzlesme/geometry-full.json
  /tmp/bugra-yuzlesme/corset-pieces.svg + corset-pieces.png
  /tmp/bugra-yuzlesme/locket-pieces.svg + locket-pieces.png
"""
import zlib, re, math, json, os

PT2MM = 25.4 / 72.0
OUT_DIR = "/tmp/bugra-yuzlesme"
ROOT = "/Users/damummyphus/damla_projects_2026/stitchu"

PDFS = {
    "corset_bustier": ROOT + "/new_flats/real patterns/Buttoned Corset Bustier - FIXED/PDFs/A0.pdf",
    "locket_top":     ROOT + "/new_flats/real patterns/Locket Top/PDF's/A0.pdf",
}

# ---------------------------------------------------------------- size chart
# Transcribed from the seller's size-chart JPGs (read 2026-07-27):
#   patterns_real/Buttoned Corset Bustier - FIXED/2 - Choose Your Size.jpg
#   patterns_real/Locket Top/1 Sizes.jpg
# Both products ship the IDENTICAL chart: EU 34..48 (US 2..16), cm values.
SIZE_CHART_MM = {
    "34": {"us": "2",  "bustMM": 840,  "waistMM": 640, "hipMM": 900},
    "36": {"us": "4",  "bustMM": 880,  "waistMM": 680, "hipMM": 940},
    "38": {"us": "6",  "bustMM": 920,  "waistMM": 720, "hipMM": 980},
    "40": {"us": "8",  "bustMM": 960,  "waistMM": 760, "hipMM": 1020},
    "42": {"us": "10", "bustMM": 1000, "waistMM": 800, "hipMM": 1060},
    "44": {"us": "12", "bustMM": 1040, "waistMM": 840, "hipMM": 1100},
    "46": {"us": "14", "bustMM": 1080, "waistMM": 880, "hipMM": 1140},
    "48": {"us": "16", "bustMM": 1120, "waistMM": 920, "hipMM": 1180},
}
SIZES_ASC = ["34", "36", "38", "40", "42", "44", "46", "48"]  # smallest->largest

# Visual identification notes (2026-07-27, from the PNG check sheets vs the
# sellers' "Pattern Cutting" JPGs). Names themselves stay as the defter named
# the 23 Tem clusters; the notes record where the defter looks WRONG.
NAME_NOTES = {
    ("locket_top", "EXTRA-TL (not in defter)"):
        "7th nested cluster the defter never listed. Shape (tall crescent) "
        "matches piece 3 'Collar' in 2 Pattern Cutting.jpg.",
    ("locket_top", "Collar"):
        "Defter's name. Shape is a curved BAND, which matches piece 4 "
        "'Collar Lining' in 2 Pattern Cutting.jpg - defter naming suspect.",
    ("locket_top", "Collar Lining"):
        "Defter's name. Likely the interfacing/tela drawing (cutting sheet "
        "lists interfacing '1 piece on fold' for collar+lining). Extra "
        "pink-pen contour inside; no size-48 ring found.",
    ("corset_bustier", "Front Body (side)"):
        "Defter recorded 169x294 perim 622 - that was a mixed OPEN-fragment "
        "measure; the closed size rings measure ~85..103mm wide.",
    ("corset_bustier", "Front Body (center)"):
        "Defter recorded 114x357 perim 615 - that exactly matches the OPEN "
        "size-48 outline stroke (chord-closed here as 'salvaged').",
}

# ------------------------------------------------- expected pieces (defter)
# Clusters are NAMED by centroid match against the 23 Tem pass
# (tools/bugra-geometry-2026-07-23.json) whose entries were named in
# BUGRA-DEFTER.md. Centroids are stable between runs (same PDF).
# DEFTER DISCREPANCY (found 2026-07-27): the locket A0 contains a 7th nested
# 8-ring cluster at T-L centroid (120,956), 203x301mm -- present in the 23 Tem
# JSON too but NEVER listed in the defter (defter says 6 pieces). The seller's
# "2 Pattern Cutting.jpg" also lists 6. Provisionally named below; final call
# from the PNG check sheet.
EXPECTED = {
    "corset_bustier": [
        # (name, centroid_x, centroid_y) from 23 Tem JSON
        ("Upper Cup",               183.9, 977.6),
        ("Lower Cup",               347.8, 930.3),
        ("Front Body (side)",       556.5, 834.6),
        ("Front Body (center)",     704.5, 786.8),
        ("Back Body (side)",        627.0, 1049.6),
        ("Back Body (center fold)", 312.7, 692.8),
    ],
    "locket_top": [
        ("Front Body",       204.2, 547.9),
        ("Back Body",        665.4, 516.6),
        ("Collar",           473.7, 579.0),
        ("Collar Lining",    491.3, 734.2),
        ("Lower Sleeve",     488.4, 876.9),
        ("Upper Sleeve",     495.9, 1016.4),
        ("EXTRA-TL (not in defter)", 120.2, 955.7),
    ],
}

NUM = r'[-+]?\d*\.?\d+'

# ------------------------------------------------------------- PDF plumbing

def decompress_streams(data):
    out = []
    for m in re.finditer(rb'stream\r?\n', data):
        start = m.end(); end = data.find(b'endstream', start)
        raw = data[start:end]
        for cand in (raw, raw.rstrip(b'\r\n')):
            try:
                out.append(zlib.decompress(cand)); break
            except Exception:
                continue
    return out

def pick_geometry_stream(streams):
    best = None; bl = -1
    for dec in streams:
        if b' cm' in dec and (b' m' in dec or b' l' in dec):
            cmn = len(re.findall(rb'\bcm\b', dec))
            if cmn > bl:
                bl = cmn; best = dec
    return best.decode('latin1') if best else None

def find_calibration(text):
    """Ruler draws a 4cm bar: '... 113.386 15.504 l ...' -> must be 40.00mm."""
    for val in re.findall(r'(\d+\.\d+)\s+15\.504\s+l', text):
        w = float(val) * PT2MM
        if 39.0 < w < 41.0:
            return ("ruler 4cm bar", float(val), w)
    return None

# ------------------------------------------------------- geometry sampling

def bezier_pts(p0, p1, p2, p3, step_mm=2.0):
    """Sample a cubic bezier at ~step_mm arc-length steps (control-net estimate)."""
    est = (math.hypot(p1[0]-p0[0], p1[1]-p0[1]) +
           math.hypot(p2[0]-p1[0], p2[1]-p1[1]) +
           math.hypot(p3[0]-p2[0], p3[1]-p2[1]))
    chord = math.hypot(p3[0]-p0[0], p3[1]-p0[1])
    length = (est + chord) / 2.0
    n = max(3, min(600, int(math.ceil(length / step_mm))))
    pts = []
    for i in range(1, n + 1):
        t = i / n; mt = 1 - t
        x = mt**3*p0[0] + 3*mt*mt*t*p1[0] + 3*mt*t*t*p2[0] + t**3*p3[0]
        y = mt**3*p0[1] + 3*mt*mt*t*p1[1] + 3*mt*t*t*p2[1] + t**3*p3[1]
        pts.append((x, y))
    return pts

def parse_paths(text):
    """Return subpaths: dict(pts=[(x,y)mm...], color=str, closed=bool).
    q/Q translate-only stack (a=d=1,b=c=0 verified in the 23 Tem pass)."""
    stack = []
    cur_tx, cur_ty = 0.0, 0.0
    color = "?"
    polylines = []
    cx = cy = 0.0
    start_x = start_y = 0.0
    cur = []
    closed_flag = False

    def push_seg():
        nonlocal cur, closed_flag
        if len(cur) >= 2:
            c = closed_flag
            gap = math.hypot(cur[0][0]-cur[-1][0], cur[0][1]-cur[-1][1])
            if c:
                gap = 0.0
            else:
                # tolerant closure: tiny gaps happen where the pen lifts;
                # honest -- the gap is RECORDED, never hidden.
                plen = poly_len(cur)
                if gap <= max(1.5, 0.015 * plen):
                    c = True
            polylines.append({"pts": cur, "color": color, "closed": c,
                              "closureGapMM": round(gap, 2)})
        cur = []
        closed_flag = False

    N = NUM
    pat = re.compile(
        r'(?P<q>q)(?=[\s])'
        r'|(?P<Q>Q)(?=[\s])'
        r'|(?P<cm>(' + N + r')\s+(' + N + r')\s+(' + N + r')\s+(' + N + r')\s+(' + N + r')\s+(' + N + r')\s+cm)'
        r'|(?P<rg>(' + N + r')\s+(' + N + r')\s+(' + N + r')\s+(?:RG|rg))'
        r'|(?P<re>(' + N + r')\s+(' + N + r')\s+(' + N + r')\s+(' + N + r')\s+re)'
        r'|(?P<c>(' + N + r')\s+(' + N + r')\s+(' + N + r')\s+(' + N + r')\s+(' + N + r')\s+(' + N + r')\s+c)(?=[\s])'
        r'|(?P<l>(' + N + r')\s+(' + N + r')\s+l)(?=[\s])'
        r'|(?P<m>(' + N + r')\s+(' + N + r')\s+m)(?=[\s])'
        r'|(?P<h>h)(?=[\s])'
        r'|(?P<paint>[SsFfBb]\*?|n)(?=[\s])'
    )
    for mt in pat.finditer(text):
        k = mt.lastgroup
        g = mt.groupdict()
        if k == 'q':
            stack.append((cur_tx, cur_ty))
        elif k == 'Q':
            push_seg()
            if stack:
                cur_tx, cur_ty = stack.pop()
        elif k == 'cm':
            nums = re.findall(N, g['cm'])
            a, b, c, d, e, f = [float(x) for x in nums[:6]]
            cur_tx += e; cur_ty += f
        elif k == 'rg':
            nums = [round(float(x), 3) for x in re.findall(N, g['rg'])[:3]]
            color = f"{nums[0]} {nums[1]} {nums[2]}"
        elif k == 're':
            nums = [float(x) for x in re.findall(N, g['re'])[:4]]
            x, y, w, h = nums
            X = (x + cur_tx) * PT2MM; Y = (y + cur_ty) * PT2MM
            W = w * PT2MM; H = h * PT2MM
            if abs(W) < 800 and abs(H) < 800:
                polylines.append({"pts": [(X, Y), (X+W, Y), (X+W, Y+H), (X, Y+H), (X, Y)],
                                  "color": color, "closed": True, "closureGapMM": 0.0})
        elif k == 'm':
            push_seg()
            nums = [float(x) for x in re.findall(N, g['m'])[:2]]
            x = (nums[0] + cur_tx) * PT2MM; y = (nums[1] + cur_ty) * PT2MM
            cx, cy = x, y; start_x, start_y = x, y; cur = [(x, y)]
        elif k == 'l':
            nums = [float(x) for x in re.findall(N, g['l'])[:2]]
            x = (nums[0] + cur_tx) * PT2MM; y = (nums[1] + cur_ty) * PT2MM
            if not cur: cur = [(cx, cy)]
            cur.append((x, y)); cx, cy = x, y
        elif k == 'c':
            nums = [float(x) for x in re.findall(N, g['c'])[:6]]
            x1 = (nums[0]+cur_tx)*PT2MM; y1 = (nums[1]+cur_ty)*PT2MM
            x2 = (nums[2]+cur_tx)*PT2MM; y2 = (nums[3]+cur_ty)*PT2MM
            x3 = (nums[4]+cur_tx)*PT2MM; y3 = (nums[5]+cur_ty)*PT2MM
            if not cur: cur = [(cx, cy)]
            cur.extend(bezier_pts((cx, cy), (x1, y1), (x2, y2), (x3, y3), 2.0))
            cx, cy = x3, y3
        elif k == 'h':
            if cur:
                cur.append((start_x, start_y)); cx, cy = start_x, start_y
                closed_flag = True
        elif k == 'paint':
            push_seg()
    push_seg()
    return polylines

# ------------------------------------------------------------------ helpers

def bbox(pts):
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)

def poly_len(pts):
    s = 0.0
    for i in range(1, len(pts)):
        s += math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1])
    return s

def contains(outer_b, inner_b, tol=5.0):
    return (outer_b[0] - tol <= inner_b[0] and outer_b[1] - tol <= inner_b[1] and
            outer_b[2] + tol >= inner_b[2] and outer_b[3] + tol >= inner_b[3])

# ------------------------------------------------------------------ process

def process(name, path):
    data = open(path, "rb").read()
    mb = re.search(rb'/MediaBox\s*\[([^\]]+)\]', data)
    mbvals = [float(x) for x in mb.group(1).split()]
    page_w_mm = (mbvals[2] - mbvals[0]) * PT2MM
    page_h_mm = (mbvals[3] - mbvals[1]) * PT2MM
    text = pick_geometry_stream(decompress_streams(data))
    calib = find_calibration(text)
    polys = parse_paths(text)

    # candidate size rings: CLOSED, garment-scale on both axes, not the page frame
    big = []
    open_strokes = []
    for p in polys:
        if not p["closed"]:
            b = bbox(p["pts"]); w = b[2]-b[0]; h = b[3]-b[1]
            if max(w, h) >= 80 and len(p["pts"]) >= 8:
                open_strokes.append({"pts": p["pts"], "bbox": b, "w": w, "h": h,
                                     "cx": (b[0]+b[2])/2, "cy": (b[1]+b[3])/2,
                                     "plen": poly_len(p["pts"]), "col": p["color"],
                                     "gap": p["closureGapMM"]})
            continue
        b = bbox(p["pts"]); w = b[2]-b[0]; h = b[3]-b[1]
        if w > 0.6*page_w_mm and h > 0.6*page_h_mm:
            continue  # page border / frame
        if min(w, h) >= 45 and max(w, h) >= 100 and len(p["pts"]) >= 8:
            pts = p["pts"]
            if math.hypot(pts[0][0]-pts[-1][0], pts[0][1]-pts[-1][1]) > 1e-9:
                pts = pts + [pts[0]]  # explicit closure for perimeter
            big.append({"pts": pts, "bbox": b, "w": w, "h": h,
                        "cx": (b[0]+b[2])/2, "cy": (b[1]+b[3])/2,
                        "area": w*h, "perim": poly_len(pts), "col": p["color"],
                        "gap": p.get("closureGapMM", 0.0)})

    # cluster nested size rings of one piece by centroid proximity (proven 23 Tem)
    THRESH = 70.0
    n = len(big); parent = list(range(n))
    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]; a = parent[a]
        return a
    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb: parent[ra] = rb
    for i in range(n):
        for j in range(i+1, n):
            if math.hypot(big[i]["cx"]-big[j]["cx"], big[i]["cy"]-big[j]["cy"]) < THRESH:
                union(i, j)
    groups = {}
    for i in range(n):
        groups.setdefault(find(i), []).append(i)

    pieces = []
    for idxs in groups.values():
        members = [big[i] for i in idxs]
        # one SIZE ring per color: the largest-area contour of that color.
        # Smaller same-color contours are kept aside as extraContours
        # (interfacing/tela outlines, internal markings).
        colors = {}
        for m in members:
            c = m["col"]
            if c not in colors or m["area"] > colors[c]["area"]:
                colors[c] = m
        extras = []
        for m in members:
            if colors[m["col"]] is not m and min(m["w"], m["h"]) >= 45:
                extras.append(m)
        ring_list = sorted(colors.values(), key=lambda m: m["area"])
        maxa = ring_list[-1]["area"]
        size_rings = [m for m in ring_list if m["area"] >= 0.15*maxa]
        outer = size_rings[-1]
        if max(outer["w"], outer["h"]) < 150:
            continue
        if len(size_rings) < 4:
            continue
        pieces.append({"rings": size_rings, "outer": outer, "extras": extras,
                       "cx": outer["cx"], "cy": outer["cy"]})
    pieces.sort(key=lambda p: p["outer"]["area"], reverse=True)

    # name pieces by centroid match against the 23 Tem named clusters
    exp = list(EXPECTED[name])
    cand = []
    for pi, p in enumerate(pieces):
        for ei, (ename, ex, ey) in enumerate(exp):
            d = math.hypot(p["cx"]-ex, p["cy"]-ey)
            cand.append((d, pi, ei))
    assign = {}
    used_p, used_e = set(), set()
    for d, pi, ei in sorted(cand):
        if pi in used_p or ei in used_e or d > 80:
            continue
        assign[pi] = (exp[ei][0], d)
        used_p.add(pi); used_e.add(ei)
    unnamed = 0
    for pi, p in enumerate(pieces):
        if pi in assign:
            p["name"], p["nameDist"] = assign[pi]
        else:
            unnamed += 1
            p["name"], p["nameDist"] = f"UNMATCHED-{unnamed}", None

    return {
        "page_w_mm": round(page_w_mm, 2), "page_h_mm": round(page_h_mm, 2),
        "calibration": None if not calib else
            {"source": calib[0], "pt": round(calib[1], 3), "mm": round(calib[2], 3)},
        "pieces": pieces,
        "open_strokes": open_strokes,
    }

# ---------------------------------------------- color -> size map + assign

def build_color_map(res):
    """Per pattern: sizes are COLOR-CODED. Learn color->size from the pieces
    with exactly 8 size rings (one per color), area-rank ascending -> 34..48,
    by majority vote. Nested area order can lie on non-uniformly graded pieces,
    the vote across pieces cancels that out."""
    votes = {}
    for p in res["pieces"]:
        if len(p["rings"]) != 8:
            continue
        for rank, ring in enumerate(sorted(p["rings"], key=lambda m: m["area"])):
            votes.setdefault(ring["col"], {}).setdefault(SIZES_ASC[rank], 0)
            votes[ring["col"]][SIZES_ASC[rank]] += 1
    cmap = {}
    for col, v in votes.items():
        best = max(v.items(), key=lambda kv: kv[1])
        total = sum(v.values())
        cmap[col] = {"size": best[0], "votes": f"{best[1]}/{total}",
                     "unanimous": best[1] == total}
    return cmap

def assign_sizes(res, cmap):
    """Assign each ring its size FROM ITS COLOR; order rings by size; flag
    anomalies (a color-assigned ring smaller than the ring 2 sizes below it =
    probably an interfacing/tela outline drawn in a size pen, not a size ring).
    Then containment check on the size-ordered sequence."""
    for p in res["pieces"]:
        for ring in p["rings"]:
            info = cmap.get(ring["col"])
            if info:
                ring["sizeGuess"] = info["size"]
                ring["sizeSource"] = ("color-map" if info["unanimous"]
                                      else "color-map (majority vote)")
            else:
                ring["sizeGuess"] = "?"
                ring["sizeSource"] = "unknown color"
            ring["salvagedChordMM"] = 0.0

        # SALVAGE: a size whose color has NO closed ring here may exist as an
        # OPEN outline (seller drew e.g. the straight center-front edge as a
        # separate stroke). Take the largest open stroke of that color inside
        # the piece's neighborhood and close it with a straight chord --
        # recorded, not hidden (salvagedChordMM = chord length).
        have = {r["sizeGuess"] for r in p["rings"]}
        need_cols = [col for col, info in cmap.items() if info["size"] not in have]
        if need_cols:
            ob = p["outer"]["bbox"]
            for col in need_cols:
                cands = [s for s in res.get("open_strokes", [])
                         if s["col"] == col
                         and ob[0]-40 <= s["cx"] <= ob[2]+40
                         and ob[1]-40 <= s["cy"] <= ob[3]+40
                         and max(s["w"], s["h"]) >= 0.5*max(p["outer"]["w"], p["outer"]["h"])]
                if not cands:
                    continue
                s = max(cands, key=lambda s: s["plen"])
                pts = s["pts"] + [s["pts"][0]]
                b = s["bbox"]
                p["rings"].append({
                    "pts": pts, "bbox": b, "w": s["w"], "h": s["h"],
                    "cx": s["cx"], "cy": s["cy"], "area": s["w"]*s["h"],
                    "perim": poly_len(pts), "col": col, "gap": s["gap"],
                    "sizeGuess": cmap[col]["size"],
                    "sizeSource": "color-map, SALVAGED open outline (chord-closed)",
                    "salvagedChordMM": round(s["gap"], 1),
                })
            p["outer"] = max(p["rings"], key=lambda m: m["area"])

        p["rings"].sort(key=lambda m: (SIZES_ASC.index(m["sizeGuess"])
                                       if m["sizeGuess"] in SIZES_ASC else 99))
        # anomaly: monotonic-area sanity along the size order
        areas = [(m["sizeGuess"], m["area"]) for m in p["rings"]
                 if m["sizeGuess"] in SIZES_ASC]
        anomalous = set()
        for i in range(len(areas)):
            smaller_than = sum(1 for j in range(i) if areas[i][1] < 0.85*areas[j][1])
            if smaller_than >= 2:
                anomalous.add(areas[i][0])
        for ring in p["rings"]:
            ring["anomaly"] = (ring["sizeGuess"] in anomalous)
        good = [m for m in p["rings"] if not m["anomaly"] and m["sizeGuess"] in SIZES_ASC]
        p["containmentOK"] = all(contains(good[k+1]["bbox"], good[k]["bbox"])
                                 for k in range(len(good)-1))
        p["sizesPresent"] = [m["sizeGuess"] for m in good]
        p["sizesMissing"] = [s for s in SIZES_ASC if s not in p["sizesPresent"]]
        # honest note for extras
        for m in p["extras"]:
            info = cmap.get(m["col"])
            m["sizeGuess"] = info["size"] if info else "?"
            m["anomaly"] = True

# ------------------------------------------------------------- check sheets

SIZE_COLORS = {   # display colors for the check sheet (NOT the PDF's own colors)
    "34": "#4477aa", "36": "#66ccee", "38": "#228833", "40": "#ccbb44",
    "42": "#ee7733", "44": "#cc3311", "46": "#ee3377", "48": "#000000",
    "?": "#999999",
}

def piece_label(p):
    o = p["outer"]
    lab = (f'{p["name"]}  {o["w"]:.0f}x{o["h"]:.0f}mm perim {o["perim"]:.0f}mm '
           f'rings {len(p["rings"])}')
    if p["sizesMissing"]:
        lab += f'  MISSING {",".join(p["sizesMissing"])}'
    salv = [m["sizeGuess"] for m in p["rings"] if m.get("salvagedChordMM", 0) > 0]
    if salv:
        lab += f'  SALVAGED {",".join(salv)}'
    if p["extras"]:
        lab += f'  +{len(p["extras"])} extra'
    return lab

def write_svg(name, res, path):
    W, H = res["page_w_mm"], res["page_h_mm"]
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}mm" height="{H}mm" '
         f'viewBox="0 0 {W:.1f} {H:.1f}" font-family="Helvetica">']
    s.append(f'<rect x="0" y="0" width="{W:.1f}" height="{H:.1f}" fill="#fdfcf8" stroke="#888" stroke-width="0.5"/>')
    for p in res["pieces"]:
        for ring in p["rings"] + p["extras"]:
            col = "#aaaaaa" if ring.get("anomaly") else SIZE_COLORS.get(ring["sizeGuess"], "#999")
            d = "M " + " L ".join(f"{x:.2f} {H-y:.2f}" for x, y in ring["pts"]) + " Z"
            width = 0.9 if ring is p["outer"] else 0.35
            dash = ' stroke-dasharray="3 2"' if ring.get("anomaly") else ""
            s.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{width}"{dash}/>')
        b = p["outer"]["bbox"]
        lx, ly = b[0], H - b[3] - 3
        s.append(f'<text x="{lx:.1f}" y="{ly:.1f}" font-size="9" fill="#111">{piece_label(p)}</text>')
    s.append(f'<text x="10" y="{H-8:.1f}" font-size="12" fill="#111">{name} — A0 {W:.0f}x{H:.0f}mm — '
             f'calib {res["calibration"]["pt"]}pt={res["calibration"]["mm"]}mm</text>')
    s.append('</svg>')
    open(path, "w").write("\n".join(s))

def write_png(name, res, path, scale=1.6):
    from PIL import Image, ImageDraw, ImageFont
    W, H = res["page_w_mm"], res["page_h_mm"]
    iw, ih = int(W*scale), int(H*scale)
    img = Image.new("RGB", (iw, ih), "#fdfcf8")
    dr = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
        font_big = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 34)
    except Exception:
        font = font_big = ImageFont.load_default()
    def T(x, y):  # mm -> px, flip y (PDF y-up)
        return (x*scale, (H-y)*scale)
    dr.rectangle([0, 0, iw-1, ih-1], outline="#888888")
    for p in res["pieces"]:
        for ring in p["rings"] + p["extras"]:
            col = "#aaaaaa" if ring.get("anomaly") else SIZE_COLORS.get(ring["sizeGuess"], "#999999")
            pts = [T(x, y) for x, y in ring["pts"]]
            wpx = 3 if ring is p["outer"] else 1
            dr.line(pts, fill=col, width=wpx)
        b = p["outer"]["bbox"]
        lx, ly = T(b[0], b[3])
        dr.text((max(2, lx-40), max(2, ly-30)), piece_label(p), fill="#111111", font=font)
    dr.text((16, ih-90), f"{name}  A0 {W:.0f}x{H:.0f}mm  calib {res['calibration']['pt']}pt="
                         f"{res['calibration']['mm']}mm  outer=thick  gray-dash=anomaly/tela",
            fill="#111111", font=font_big)
    x = 16
    for sz in SIZES_ASC:
        dr.text((x, ih-48), sz, fill=SIZE_COLORS[sz], font=font_big); x += 90
    img.save(path)

# ----------------------------------------------------------------------- main

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    results = {}
    cmaps = {}
    for name, path in PDFS.items():
        results[name] = process(name, path)
        cmaps[name] = build_color_map(results[name])
        assign_sizes(results[name], cmaps[name])

    rings_out = []
    for name, res in results.items():
        for p in res["pieces"]:
            for ri, ring in enumerate(p["rings"]):
                rings_out.append({
                    "pattern": name,
                    "piece": p["name"],
                    "ring": ri,                      # 0 = smallest size present
                    "sizeGuess": ring["sizeGuess"],
                    "sizeSource": ring["sizeSource"],
                    "anomaly": ring["anomaly"],
                    "salvagedChordMM": ring.get("salvagedChordMM", 0.0),
                    "containmentOK": p["containmentOK"],
                    "pdfStrokeColor": ring["col"],
                    "closureGapMM": ring["gap"],
                    "wMM": round(ring["w"], 2),
                    "hMM": round(ring["h"], 2),
                    "perimMM": round(ring["perim"], 1),
                    "polygon": [[round(x, 2), round(y, 2)] for x, y in ring["pts"]],
                })
            for m in p["extras"]:
                rings_out.append({
                    "pattern": name, "piece": p["name"], "ring": -1,
                    "sizeGuess": m["sizeGuess"],
                    "sizeSource": "extra contour, same pen as size (interfacing/tela?)",
                    "anomaly": True, "containmentOK": p["containmentOK"],
                    "pdfStrokeColor": m["col"], "closureGapMM": m["gap"],
                    "wMM": round(m["w"], 2), "hMM": round(m["h"], 2),
                    "perimMM": round(m["perim"], 1),
                    "polygon": [[round(x, 2), round(y, 2)] for x, y in m["pts"]],
                })

    out = {
        "meta": {
            "date": "2026-07-27",
            "sourcePDFs": PDFS,
            "unit": "mm (PDF pt * 25.4/72)",
            "calibration": {k: results[k]["calibration"] for k in results},
            "bezierStepMM": 2.0,
            "ringOrder": "ring 0 = smallest size present; ring=-1 = extra contour; sizes EU 34..48",
            "sizeMapping": "per-pattern color-coded pens; color->size learned by "
                           "area-rank majority vote over 8-ring pieces",
            "sizeChartSource": [
                "patterns_real/Buttoned Corset Bustier - FIXED/2 - Choose Your Size.jpg",
                "patterns_real/Locket Top/1 Sizes.jpg",
            ],
        },
        "sizeChartMM": SIZE_CHART_MM,
        "pdfColorToSize": cmaps,
        "pieces": [
            {"pattern": name, "piece": p["name"],
             "centroidMM": [round(p["cx"], 1), round(p["cy"], 1)],
             "outerWMM": round(p["outer"]["w"], 1),
             "outerHMM": round(p["outer"]["h"], 1),
             "outerPerimMM": round(p["outer"]["perim"], 1),
             "ringCount": len(p["rings"]),
             "sizesPresent": p["sizesPresent"], "sizesMissing": p["sizesMissing"],
             "salvagedSizes": [m["sizeGuess"] for m in p["rings"]
                               if m.get("salvagedChordMM", 0) > 0],
             "extraContours": len(p["extras"]),
             "containmentOK": p["containmentOK"],
             "nameNote": NAME_NOTES.get((name, p["name"]))}
            for name, res in results.items() for p in res["pieces"]
        ],
        "rings": rings_out,
    }
    jpath = os.path.join(OUT_DIR, "geometry-full.json")
    with open(jpath, "w") as f:
        json.dump(out, f)

    sheets = {"corset_bustier": "corset-pieces", "locket_top": "locket-pieces"}
    for name, base in sheets.items():
        write_svg(name, results[name], os.path.join(OUT_DIR, base + ".svg"))
        write_png(name, results[name], os.path.join(OUT_DIR, base + ".png"))

    # console report
    for name, res in results.items():
        print("=" * 92)
        print(f"PDF: {name}  page {res['page_w_mm']}x{res['page_h_mm']}mm  "
              f"calib {res['calibration']}")
        print(f"  pieces: {len(res['pieces'])}")
        for p in res["pieces"]:
            o = p["outer"]
            print(f"  {p['name']:28} centroid ({p['cx']:5.0f},{p['cy']:5.0f}) "
                  f"outer {o['w']:6.1f}x{o['h']:6.1f}mm perim {o['perim']:7.1f}mm "
                  f"rings {len(p['rings'])} containment {'OK' if p['containmentOK'] else 'FAIL'}"
                  + (f" MISSING {','.join(p['sizesMissing'])}" if p["sizesMissing"] else "")
                  + (f" +{len(p['extras'])} extra" if p["extras"] else ""))
            for ring in p["rings"]:
                mark = '*' if ring['anomaly'] else ('S' if ring.get('salvagedChordMM', 0) > 0 else ' ')
                print(f"      size {ring['sizeGuess']:>2}{mark}: "
                      f"{ring['w']:6.1f}x{ring['h']:6.1f}mm perim {ring['perim']:7.1f}mm "
                      f"pts {len(ring['pts']):4d} gap {ring['gap']:5.2f}mm col {ring['col']}")
            for m in p["extras"]:
                print(f"      EXTRA (pen of {m['sizeGuess']}): "
                      f"{m['w']:6.1f}x{m['h']:6.1f}mm perim {m['perim']:7.1f}mm")
        print(f"  color->size map ({name}):")
        for col, v in sorted(cmaps[name].items(), key=lambda kv: kv[1]["size"]):
            print(f"    {col:22} -> {v['size']}  votes {v['votes']}  "
                  f"{'UNANIMOUS' if v['unanimous'] else 'MAJORITY'}")
    print(f"\nJSON  -> {jpath}")
    for base in sheets.values():
        print(f"PNG   -> {os.path.join(OUT_DIR, base + '.png')}")

    # honest self-checks (no fabricated success):
    n_rings = sum(1 for r in rings_out if r["ring"] >= 0)
    n_poly = sum(len(r["polygon"]) for r in rings_out)
    print(f"\nself-check: {n_rings} size rings, {len(rings_out)-n_rings} extra contours, "
          f"{n_poly} polygon points total")

if __name__ == "__main__":
    main()
