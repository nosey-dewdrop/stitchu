#!/usr/bin/env python3
"""trace-flat v0 — BELİRLEYİCİ DENEY (2026-07-27, Damla yöntemi: suçluyu daralt).

Hipotez: "motor çizemiyor"un kökü kalem temsili. Kalemi tamamen atlayıp
referansın çizgilerini OKU (iskelet) + PÜRÜZSÜZ eğriye oturt (fit) + yeniden çiz.
Eski batış (radial-trace "tırtık tırtık") ham izlemeydi; eğri-oturtma katmanı yoktu.
LLM yok, tahmin yok — saf görüntü işleme.

kullanım: trace-flat.py <img> <x0,y0,x1,y1|-> <out.svg>
"""
import sys, os
import numpy as np
from PIL import Image

INK = int(__import__("os").environ.get("INK","120"))


def thin(img):
    """Zhang-Suen inceltme -> 1px iskelet."""
    I = img.astype(np.uint8).copy()
    def neighbors(I):
        P = [np.roll(np.roll(I, dy, 0), dx, 1) for dy, dx in
             [(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1)]]  # P2..P9
        return P
    while True:
        changed = False
        for step in (0, 1):
            P = neighbors(I)
            B = sum(P)
            seq = P + [P[0]]
            A = sum(((seq[i] == 0) & (seq[i+1] == 1)).astype(np.uint8) for i in range(8))
            if step == 0:
                cond = (I == 1) & (B >= 2) & (B <= 6) & (A == 1) & \
                       ((P[0]*P[2]*P[4]) == 0) & ((P[2]*P[4]*P[6]) == 0)
            else:
                cond = (I == 1) & (B >= 2) & (B <= 6) & (A == 1) & \
                       ((P[0]*P[2]*P[6]) == 0) & ((P[0]*P[4]*P[6]) == 0)
            if cond.any():
                I[cond] = 0
                changed = True
        if not changed:
            return I


def paths_from_skeleton(S):
    """iskelet pikselleri -> kavşaklarda bölünmüş sıralı polyline'lar."""
    pts = set(zip(*np.nonzero(S)))
    NB = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
    def deg(p):
        return sum(((p[0]+d[0], p[1]+d[1]) in pts) for d in NB)
    nodes = {p for p in pts if deg(p) != 2}
    visited = set()
    paths = []
    def walk(start, first):
        path = [start, first]
        visited.add((start, first)); visited.add((first, start))
        cur, prev = first, start
        while cur not in nodes:
            nxt = [ (cur[0]+d[0], cur[1]+d[1]) for d in NB
                    if (cur[0]+d[0], cur[1]+d[1]) in pts and (cur[0]+d[0], cur[1]+d[1]) != prev ]
            if not nxt: break
            n = nxt[0]
            if (cur, n) in visited: break
            visited.add((cur, n)); visited.add((n, cur))
            path.append(n); prev, cur = cur, n
        return path
    for p in nodes:
        for d in NB:
            q = (p[0]+d[0], p[1]+d[1])
            if q in pts and (p, q) not in visited:
                paths.append(walk(p, q))
    # kalan saf döngüler
    seen = {p for pa in paths for p in pa}
    for p in pts - seen - nodes:
        for d in NB:
            q = (p[0]+d[0], p[1]+d[1])
            if q in pts and (p, q) not in visited:
                paths.append(walk(p, q)); break
    return [pa for pa in paths if len(pa) >= 6]


def rdp(pts, eps):
    """Ramer-Douglas-Peucker sadeleştirme."""
    if len(pts) < 3:
        return pts
    a, b = np.array(pts[0], float), np.array(pts[-1], float)
    ab = b - a
    L = np.hypot(*ab) or 1.0
    d = [abs(ab[0]*(p[1]-a[1]) - ab[1]*(p[0]-a[0])) / L for p in pts[1:-1]]
    if not d:
        return [pts[0], pts[-1]]
    i = int(np.argmax(d))
    if d[i] > eps:
        left = rdp(pts[:i+2], eps)
        right = rdp(pts[i+1:], eps)
        return left[:-1] + right
    return [pts[0], pts[-1]]


def catmull_to_bezier(pts):
    """Catmull-Rom -> pürüzsüz cubic bezier zinciri (tırtık burada ölür)."""
    if len(pts) < 3:
        return None
    P = [pts[0]] + list(pts) + [pts[-1]]
    segs = []
    for i in range(1, len(P)-2):
        p0, p1, p2, p3 = (np.array(P[j], float) for j in (i-1, i, i+1, i+2))
        c1 = p1 + (p2 - p0) / 6.0
        c2 = p2 - (p3 - p1) / 6.0
        segs.append((p1, c1, c2, p2))
    return segs


def main():
    img_path, crop_arg, out_svg = sys.argv[1], sys.argv[2], sys.argv[3]
    im = Image.open(img_path).convert('L')
    if crop_arg != '-':
        c = [float(x) for x in crop_arg.split(',')]
        w, h = im.size
        im = im.crop((int(c[0]*w), int(c[1]*h), int(c[2]*w), int(c[3]*h)))
    A = np.asarray(im)
    ink = (A < INK).astype(np.uint8)
    print('ink px:', int(ink.sum()))
    S = thin(ink)
    print('iskelet px:', int(S.sum()))
    paths = paths_from_skeleton(S)
    print('yol sayısı:', len(paths))
    H, W = A.shape
    parts = []
    for pa in paths:
        xy = [(p[1], p[0]) for p in pa]          # (x,y)
        simp = rdp(xy, 1.6)
        segs = catmull_to_bezier(simp)
        if not segs:
            continue
        d = f"M {segs[0][0][0]:.1f},{segs[0][0][1]:.1f}"
        for p1, c1, c2, p2 in segs:
            d += f" C {c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"
        # uzunluk ~ dış hat / iç detay ayrımı (v0 sezgisel: uzun = gövde)
        ln = sum(np.hypot(xy[i+1][0]-xy[i][0], xy[i+1][1]-xy[i][1]) for i in range(len(xy)-1))
        cls = 'body' if ln > 0.9*min(W, H) else 'detail'
        parts.append((ln, cls, d))
    parts.sort(reverse=True)
    svg = [f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">',
           '<style>.body{fill:none;stroke:#111;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}'
           '.detail{fill:none;stroke:#111;stroke-width:1.05;stroke-linecap:round}</style>']
    for ln, cls, d in parts:
        svg.append(f'<path class="{cls}" d="{d}"/>')
    svg.append('</svg>')
    os.makedirs(os.path.dirname(out_svg) or '.', exist_ok=True)
    open(out_svg, 'w').write('\n'.join(svg))
    print('yazıldı:', out_svg, f'({len(parts)} yol)')


if __name__ == '__main__':
    main()
