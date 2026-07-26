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


def chain_len(xy):
    return sum(np.hypot(xy[i+1][0]-xy[i][0], xy[i+1][1]-xy[i][1]) for i in range(len(xy)-1))


def join_chains(chains, max_gap):
    """uç uca yakın zincirleri birleştir (kesikliği kapatır). dashed adayları:
    kısa parçaların 3-10px aralıklı dizisi -> tek zincir + dashed bayrağı."""
    chains = [list(c) for c in chains]
    merged = True
    while merged:
        merged = False
        for i in range(len(chains)):
            if chains[i] is None: continue
            for j in range(len(chains)):
                if i == j or chains[j] is None: continue
                a, b = chains[i], chains[j]
                pairs = [(np.hypot(a[-1][0]-b[0][0], a[-1][1]-b[0][1]), 'ab'),
                         (np.hypot(a[-1][0]-b[-1][0], a[-1][1]-b[-1][1]), 'ar'),
                         (np.hypot(a[0][0]-b[0][0], a[0][1]-b[0][1]), 'fb'),
                         (np.hypot(a[0][0]-b[-1][0], a[0][1]-b[-1][1]), 'fr')]
                d, mode = min(pairs)
                # TEĞET ŞARTI: uç yönleri uyumsuzsa birleştirme (sahte köprü yasak)
                def tdir(ch, tail):
                    k = min(6, len(ch)-1)
                    v = (np.array(ch[-1])-np.array(ch[-1-k])) if tail else (np.array(ch[k])-np.array(ch[0]))
                    n = np.hypot(*v) or 1.0
                    return v/n
                ok = True
                if d <= max_gap:
                    if mode == 'ab':   va, vb = tdir(a, True), tdir(b, False)
                    elif mode == 'ar': va, vb = tdir(a, True), -tdir(b, True)
                    elif mode == 'fb': va, vb = -tdir(a, False), tdir(b, False)
                    else:              va, vb = -tdir(a, False), -tdir(b, True)
                    ok = float(np.dot(va, vb)) > 0.5   # < ~60 derece sapma
                if d <= max_gap and ok:
                    if mode == 'ab':   chains[i] = a + b
                    elif mode == 'ar': chains[i] = a + b[::-1]
                    elif mode == 'fb': chains[i] = a[::-1] + b
                    else:              chains[i] = b + a
                    chains[j] = None
                    merged = True
        chains = [c for c in chains if c is not None]
    return chains


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
    print('ham yol:', len(paths))
    H, W = A.shape

    xychains = [[(p[1], p[0]) for p in pa] for pa in paths]
    # 1) kısa dash parçalarını ayır (dikiş çizgileri): kısa + cok sayida
    solid = [c for c in xychains if chain_len(c) >= 14]
    dashes = [c for c in xychains if chain_len(c) < 14]
    # 2) kesikleri kapat: solid zincirler 6px'e kadar uç uca eklenir
    solid = join_chains(solid, 6)
    # 3) dash dizileri: 12px'e kadar birleşen kısa parçalar tek DASHED yol olur
    dash_chains = [c for c in join_chains(dashes, 12) if chain_len(c) >= 30]

    def to_path(xy, eps):
        simp = rdp(xy, eps)
        segs = catmull_to_bezier(simp)
        if not segs:
            return None
        d = f"M {segs[0][0][0]:.1f},{segs[0][0][1]:.1f}"
        for p1, c1, c2, p2 in segs:
            d += f" C {c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"
        return d

    # cizgi kalinligi tuvale ORANLI (solukluk fix): 940-genislik referansinda 1.9/1.05
    kw = W / 940.0
    wBody, wDet, wDash = 1.9*kw*1.6, 1.05*kw*1.6, 0.9*kw*1.6
    parts = []
    for c in solid:
        d = to_path(c, 1.6)
        if not d: continue
        cls = 'body' if chain_len(c) > 0.9*min(W, H) else 'detail'
        parts.append((chain_len(c), cls, d))
    for c in dash_chains:
        d = to_path(c, 2.2)
        if d: parts.append((chain_len(c), 'dash', d))
    parts.sort(reverse=True)
    svg = [f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">',
           f'<style>.body{{fill:none;stroke:#111;stroke-width:{wBody:.2f};stroke-linecap:round;stroke-linejoin:round}}'
           f'.detail{{fill:none;stroke:#111;stroke-width:{wDet:.2f};stroke-linecap:round}}'
           f'.dash{{fill:none;stroke:#111;stroke-width:{wDash:.2f};stroke-dasharray:{6*kw:.1f} {5*kw:.1f};stroke-linecap:round}}</style>']
    for ln, cls, d in parts:
        svg.append(f'<path class="{cls}" d="{d}"/>')
    svg.append('</svg>')
    os.makedirs(os.path.dirname(out_svg) or '.', exist_ok=True)
    open(out_svg, 'w').write('\n'.join(svg))
    print('yazıldı:', out_svg, f'({len(parts)} yol: solid {len(solid)}, dash {len(dash_chains)})')


if __name__ == '__main__':
    main()
