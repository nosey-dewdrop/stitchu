#!/usr/bin/env python3
"""Independent cross-check for web/js/measure.js (kapi-3 hazirlik, 2026-07-28).

Purpose: the anchor-echo forensics (reports/2026-07-27-stitchu-json-el-adli.txt)
proved a number can LOOK measured while being an echo. This tool re-measures the
same cropped garment photo with a DIFFERENT language (Python/numpy vs JS), a
DIFFERENT threshold rule (Otsu over the color-distance histogram vs the node
module's 3.2 x border-noise-p90 rule) and an independent component/profile
walk. If two unrelated implementations agree on lengthToWidth / hemToWaistWidth
within tolerance, the number comes from the pixels, not from the code's own
assumptions. (First draft used Otsu on LUMINANCE; it broke on a white garment
over a pink ground — same luminance, different color — so the distance map is
computed from the border-median color, which is the physically correct ground
definition, while the threshold CHOICE stays independent.)

The landmark SEMANTICS are intentionally shared (bust band 10-22%, waist min in
24-62%, hem max in 88-100%, 8% thin-row trim) — the cross-check validates the
segmentation and the profile, not a different definition.

Usage: python3 kapi3-cross-measure.py input.png
Prints one JSON line: {"ok": true, "lengthToWidth": ..., "hemToWaistWidth": ...,
"waistYToLength": ...} or {"ok": false, "reason": "..."}.
Deterministic: same file -> same output. No network, no LLM.
"""
import json
import sys

import numpy as np
from PIL import Image


def otsu_threshold(gray):
    hist, _ = np.histogram(gray, bins=256, range=(0, 256))
    total = gray.size
    sum_all = np.dot(np.arange(256), hist)
    sum_b = 0.0
    w_b = 0
    best_t, best_var = 0, -1.0
    for t in range(256):
        w_b += hist[t]
        if w_b == 0:
            continue
        w_f = total - w_b
        if w_f == 0:
            break
        sum_b += t * hist[t]
        m_b = sum_b / w_b
        m_f = (sum_all - sum_b) / w_f
        var_between = w_b * w_f * (m_b - m_f) ** 2
        if var_between > best_var:
            best_var = var_between
            best_t = t
    return best_t


def largest_component(fg):
    h, w = fg.shape
    label = np.zeros((h, w), dtype=np.int32)
    best_id, best_area = 0, 0
    cur = 0
    for sy in range(h):
        for sx in range(w):
            if not fg[sy, sx] or label[sy, sx]:
                continue
            cur += 1
            stack = [(sy, sx)]
            label[sy, sx] = cur
            area = 0
            while stack:
                y, x = stack.pop()
                area += 1
                if x > 0 and fg[y, x - 1] and not label[y, x - 1]:
                    label[y, x - 1] = cur
                    stack.append((y, x - 1))
                if x < w - 1 and fg[y, x + 1] and not label[y, x + 1]:
                    label[y, x + 1] = cur
                    stack.append((y, x + 1))
                if y > 0 and fg[y - 1, x] and not label[y - 1, x]:
                    label[y - 1, x] = cur
                    stack.append((y - 1, x))
                if y < h - 1 and fg[y + 1, x] and not label[y + 1, x]:
                    label[y + 1, x] = cur
                    stack.append((y + 1, x))
            if area > best_area:
                best_area, best_id = area, cur
    return label, best_id, best_area


def main(path):
    img = Image.open(path).convert("RGB")
    rgb = np.asarray(img, dtype=np.int16)
    h, w = rgb.shape[:2]
    if h < 40 or w < 24:
        return {"ok": False, "reason": "image_too_small"}

    # ground color = per-channel median of the border ring
    ring = max(2, round(0.03 * min(h, w)))
    border_px = np.concatenate([
        rgb[:ring, :].reshape(-1, 3), rgb[-ring:, :].reshape(-1, 3),
        rgb[ring:-ring, :ring].reshape(-1, 3), rgb[ring:-ring, -ring:].reshape(-1, 3),
    ])
    ground = np.median(border_px, axis=0)
    # distance map = max abs channel difference from the ground color
    dist = np.abs(rgb - ground).max(axis=2).astype(np.uint8)
    t = otsu_threshold(dist)
    fg = dist > t
    label, best_id, best_area = largest_component(fg)
    if best_area < 0.004 * h * w:
        return {"ok": False, "reason": "no_garment_found"}

    on = label == best_id
    rows = np.where(on.any(axis=1))[0]
    y0, y1 = int(rows[0]), int(rows[-1])
    span = np.zeros(h, dtype=np.int64)
    for y in range(y0, y1 + 1):
        xs = np.where(on[y])[0]
        if xs.size:
            span[y] = int(xs[-1]) - int(xs[0]) + 1
    max_span = int(span.max())
    bbox_h = y1 - y0 + 1
    trim_top = y0 + round(0.25 * bbox_h)
    trim_bot = y1 - round(0.15 * bbox_h)
    while y0 < trim_top and span[y0] < 0.08 * max_span:
        y0 += 1
    while y1 > trim_bot and span[y1] < 0.08 * max_span:
        y1 -= 1
    length = y1 - y0 + 1
    if length < 40 or max_span < 24:
        return {"ok": False, "reason": "garment_too_small"}

    def band(f0, f1):
        s = y0 + round(f0 * length)
        e = min(y0 + round(f1 * length), y1)
        vals = [int(span[y]) for y in range(s, e + 1) if span[y] > 0]
        return vals

    bust_vals = band(0.10, 0.22)
    bust = sorted(bust_vals)[len(bust_vals) // 2] if bust_vals else 0
    waist, waist_y = None, None
    for y in range(y0 + round(0.24 * length), min(y0 + round(0.62 * length), y1) + 1):
        if span[y] > 0 and (waist is None or span[y] < waist):
            waist, waist_y = int(span[y]), y
    hem_vals = band(0.88, 1.0)
    hem = max(hem_vals) if hem_vals else 0
    if not bust or not hem or waist is None:
        return {"ok": False, "reason": "profile_incomplete"}
    return {
        "ok": True,
        "lengthToWidth": round(length / bust, 3),
        "hemToWaistWidth": round(hem / waist, 3),
        "waistYToLength": round((waist_y - y0) / length, 3),
        "otsu": int(t),
        "px": {"L": int(length), "bust": int(bust), "waist": int(waist), "hem": int(hem)},
    }


if __name__ == "__main__":
    print(json.dumps(main(sys.argv[1]), sort_keys=True))
