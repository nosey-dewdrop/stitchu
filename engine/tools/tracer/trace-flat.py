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


def close_mask(m, r=3):
    """morfolojik kapama: küçük delik/boşlukları doldur (dilate sonra erode)."""
    d = m.copy()
    for _ in range(r):
        n = d.copy()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            n |= np.roll(np.roll(d, dy, 0), dx, 1)
        d = n
    e = d.copy()
    for _ in range(r):
        n = e.copy()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            n &= np.roll(np.roll(e, dy, 0), dx, 1)
        e = n
    return e


def outer_contour(mask):
    """SİLÜET SINIRI = tek KAPALI kesintisiz eğri (Moore boundary trace).
    Kesik imkânsız: dolu bölgenin sınırı tanım gereği kapalı döngüdür."""
    ys, xs = np.nonzero(mask)
    if not len(ys):
        return []
    start = (ys[xs == xs[ys.argmin()]].min() if False else ys.min(), 0)
    # en üst satırdaki en soldaki dolu piksel
    top = ys.min()
    start = (top, xs[ys == top].min())
    DIRS = [(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1)]
    def inside(p):
        return 0 <= p[0] < mask.shape[0] and 0 <= p[1] < mask.shape[1] and mask[p]
    contour = [start]
    prev_dir = 6  # geldiğimiz yön (batı)
    cur = start
    for _ in range(200000):
        found = False
        for k in range(8):
            d = (prev_dir + 6 + k) % 8   # sağ el kuralı
            nxt = (cur[0] + DIRS[d][0], cur[1] + DIRS[d][1])
            if inside(nxt):
                contour.append(nxt)
                prev_dir = d
                cur = nxt
                found = True
                break
        if not found:
            break
        if cur == start and len(contour) > 10:
            break
    return contour


def main():
    img_path, crop_arg, out_svg = sys.argv[1], sys.argv[2], sys.argv[3]
    im = Image.open(img_path).convert('L')
    if crop_arg != '-':
        c = [float(x) for x in crop_arg.split(',')]
        w, h = im.size
        im = im.crop((int(c[0]*w), int(c[1]*h), int(c[2]*w), int(c[3]*h)))
    A = np.asarray(im)
    ink = (A < INK).astype(np.uint8)
    fill = ((A < 240) & (A >= INK)).astype(np.uint8)
    # SİLÜET: mürekkep + dolgu birlikte, kapatılmış -> dış kontur tek kapalı eğri
    sil = close_mask((ink | fill).astype(bool), 3)
    # en büyük bileşeni al (etiketleme pahalı; flood yerine: sınır izinden gelen kontur zaten en üst bileşen)
    if fill.sum() > 500:
        er = fill.copy()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            er &= np.roll(np.roll(fill, dy, 0), dx, 1)
        ink = (ink | (fill & ~er)).astype(np.uint8)
    print('ink px:', int(ink.sum()))
    # DÜĞME AVI (v5): iskeletten ÖNCE, mürekkep maskesinde KÜÇÜK kare-oranlı bağlı
    # bileşenleri bul — iskelet daireyi yaya kırar, bileşen kırmaz. Bulunan düğme
    # pikselleri maskeden düşülür ki geride C-yayı artığı kalmasın.
    comp_circles = []
    inkpts = set(zip(*np.nonzero(ink)))
    NB8 = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
    seen_px = set()
    for p in list(inkpts):
        if p in seen_px:
            continue
        comp = [p]; seen_px.add(p); qi = 0
        while qi < len(comp):
            cy, cx = comp[qi]; qi += 1
            for dy, dx in NB8:
                q = (cy+dy, cx+dx)
                if q in inkpts and q not in seen_px:
                    seen_px.add(q); comp.append(q)
            if len(comp) > 900:   # düğme olamayacak kadar büyük — erken çık
                break
        if len(comp) > 900 or len(comp) < 8:
            continue
        ys_ = [c[0] for c in comp]; xs_ = [c[1] for c in comp]
        bh_, bw_ = max(ys_)-min(ys_), max(xs_)-min(xs_)
        # dash tireleri küçük/çizgisel: min 9px kutu + gerçek halka şartı onları eler
        if not (9 <= bw_ <= 26 and 9 <= bh_ <= 26):
            continue
        if abs(bw_-bh_) > 0.5*max(bw_, bh_):
            continue
        cy_, cx_ = float(np.mean(ys_)), float(np.mean(xs_))
        rad = [np.hypot(y-cy_, x-cx_) for y, x in comp]
        r_ = float(np.mean(rad))
        # daire tutarlılığı: halka/disk yarıçap dağılımı dar; çizgi parçası (std/mean ~0.58) elenir
        if r_ < 3.2 or float(np.std(rad)) > 0.35*max(r_, 1.0):
            continue
        comp_circles.append((cx_, cy_, max(2.0, 0.5*(bw_+bh_)/2.0)))
        for q in comp:
            ink[q] = 0
    print('bileşen-düğme:', len(comp_circles))
    S = thin(ink)
    print('iskelet px:', int(S.sum()))
    paths = paths_from_skeleton(S)
    print('ham yol:', len(paths))
    H, W = A.shape

    xychains = [[(p[1], p[0]) for p in pa] for pa in paths]
    # DIŞ KONTUR: silüet sınır HALKASI (sil - erode) tek piksel genişliğinde kapalı
    # yoldur; zincir yürüteçle gez, en uzun zincir = kesintisiz dış kontur.
    er2 = sil.copy()
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
        er2 = er2 & np.roll(np.roll(sil, dy, 0), dx, 1)
    ring = (sil & ~er2).astype(np.uint8)
    ring_paths = paths_from_skeleton(ring)
    ring_chains = join_chains([[(p[1], p[0]) for p in pa] for pa in ring_paths], 8)
    oc_list = [c for c in ring_chains if chain_len(c) > 60]
    # KAYMA FİX: halka noktalarını gerçek çizgi İSKELETİNE mıknatısla (r=5).
    # Kesintisizlik halkadan, metrik doğruluk iskeletten gelir.
    skel = set(zip(*np.nonzero(S)))
    OFFS = sorted(((dy, dx) for dy in range(-5, 6) for dx in range(-5, 6)),
                  key=lambda o: o[0]*o[0]+o[1]*o[1])
    def snap(pt):
        y, x = round(pt[1]), round(pt[0])
        for dy, dx in OFFS:
            if (y+dy, x+dx) in skel:
                return (x+dx, y+dy)
        return pt
    oc_list = [[snap(p) for p in c] for c in oc_list]
    oc_xy = max(oc_list, key=chain_len) if oc_list else []
    print('dış kontur parça:', len(oc_list), 'en uzun:', len(oc_xy))
    # dış konturun yakınındaki iskelet zincirleri (5px) dış hattın kopyası — ele
    ocset = set()
    for x, y in oc_xy:
        for dy in range(-4, 5):
            for dx in range(-4, 5):
                ocset.add((x+dx, y+dy))
    def near_oc(c):
        hits = sum((round(x), round(y)) in ocset for x, y in c[::3])
        return hits > 0.35 * max(1, len(c[::3]))   # çift-çizgi kopyaları agresif ele
    inner = [c for c in xychains if not near_oc(c)]
    # DÜĞMELER: küçük parçaları yakınlık KÜMESİNE topla, küme daire gibiyse mühürle
    # eşik 80: tam düğme dairesi ~44px çevre; gerçek boyut bekçisi zaten 24px bbox (v4 kök: <40 tam daireyi dışlıyordu)
    small = [c for c in inner if chain_len(c) < 80 and
             (max(p[0] for p in c)-min(p[0] for p in c)) < 24 and
             (max(p[1] for p in c)-min(p[1] for p in c)) < 24]
    big = [c for c in inner if c not in small]
    used = [False]*len(small)
    circles, rest = list(comp_circles), list(big)
    def center(c):
        return (float(np.mean([p[0] for p in c])), float(np.mean([p[1] for p in c])))
    for i, c in enumerate(small):
        if used[i]: continue
        grp = [c]; used[i] = True
        ci = center(c)
        for j in range(i+1, len(small)):
            if used[j]: continue
            cj = center(small[j])
            if np.hypot(ci[0]-cj[0], ci[1]-cj[1]) < 12:
                grp.append(small[j]); used[j] = True
        pts = [p for g in grp for p in g]
        xs_, ys_ = [p[0] for p in pts], [p[1] for p in pts]
        bw_, bh_ = max(xs_)-min(xs_), max(ys_)-min(ys_)
        tot = sum(chain_len(g) for g in grp)
        if bw_ < 24 and bh_ < 24 and bw_ > 4 and bh_ > 4 and tot > 0.7*3.14*max(bw_, bh_)/1.0 and abs(bw_-bh_) < 0.6*max(bw_, bh_):
            cx_, cy_ = float(np.mean(xs_)), float(np.mean(ys_))
            r_ = float(np.mean([np.hypot(x-cx_, y-cy_) for x, y in pts]))
            circles.append((cx_, cy_, max(2.0, r_)))
        else:
            rest.extend(grp)
    # 1) iç çizgileri birleştir (teğet şartlı, geniş boşluk 10px)
    joined = join_chains(rest, 10)
    solid = [c for c in joined if chain_len(c) >= 22]
    dashes = [c for c in joined if chain_len(c) < 22]
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
    for occ in oc_list:
        step = max(1, len(occ)//400)
        closed = np.hypot(occ[0][0]-occ[-1][0], occ[0][1]-occ[-1][1]) < 12
        d = to_path(occ[::step] + ([occ[0]] if closed else []), 2.4)
        if d:
            parts.append((1e9, 'body', d + (' Z' if closed else '')))
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
    for cx_, cy_, r_ in circles:
        svg.append(f'<circle cx="{cx_:.1f}" cy="{cy_:.1f}" r="{r_:.1f}" fill="#fff" stroke="#111" stroke-width="{wDet:.2f}"/>')
    svg.append('</svg>')
    os.makedirs(os.path.dirname(out_svg) or '.', exist_ok=True)
    open(out_svg, 'w').write('\n'.join(svg))
    print('yazıldı:', out_svg, f'({len(parts)} yol: solid {len(solid)}, dash {len(dash_chains)})')


if __name__ == '__main__':
    main()
