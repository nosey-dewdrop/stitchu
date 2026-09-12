#!/usr/bin/env python3
"""trace-flat v0 — BELİRLEYİCİ DENEY (2026-07-27, Damla yöntemi: suçluyu daralt).

Hipotez: "motor çizemiyor"un kökü kalem temsili. Kalemi tamamen atlayıp
referansın çizgilerini OKU (iskelet) + PÜRÜZSÜZ eğriye oturt (fit) + yeniden çiz.
Eski batış (radial-trace "tırtık tırtık") ham izlemeydi; eğri-oturtma katmanı yoktu.
LLM yok, tahmin yok — saf görüntü işleme.

v8 (2026-07-28): doku/zemin bağışıklığı — beyaz-zemin girdi ESKİ yoldan bayt-bayt
gider (regresyon yok); renkli/dokulu zemin (keten + bej, IZLEYICI-V6-HIRES duvarı)
yeni yoldan: zemin rengi tespiti (kenar bandı medyanı) + medyan doku bastırma +
zemin-uzaklık silüeti (Otsu) + Sobel kenar haritası. Ham INK eşiği dokulu yolda
kullanılmaz.

kullanım: trace-flat.py <img> <x0,y0,x1,y1|-> <out.svg>
"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter

INK = int(__import__("os").environ.get("INK","120"))


def sobel_mag(L):
    """Sobel gradyan büyüklüğü (float). Kenar haritası: doku medyanla
    bastırıldıktan sonra kalan güçlü gradyan = çizilmiş çizgi / silüet sınırı."""
    Lf = L.astype(np.float64)
    def sh(dy, dx):
        return np.roll(np.roll(Lf, dy, 0), dx, 1)
    gx = (sh(-1,1) + 2*sh(0,1) + sh(1,1)) - (sh(-1,-1) + 2*sh(0,-1) + sh(1,-1))
    gy = (sh(1,-1) + 2*sh(1,0) + sh(1,1)) - (sh(-1,-1) + 2*sh(-1,0) + sh(-1,1))
    return np.hypot(gx, gy)


def otsu_threshold(vals, bins=256):
    """deterministik Otsu: histogram sınıf-içi varyansı minimize eden eşik."""
    hist, edges = np.histogram(vals, bins=bins)
    hist = hist.astype(np.float64)
    total = hist.sum()
    if total <= 0:
        return 0.0
    centers = 0.5 * (edges[:-1] + edges[1:])
    w0 = np.cumsum(hist)
    w1 = total - w0
    m0 = np.cumsum(hist * centers) / np.maximum(w0, 1e-9)
    m1 = (np.sum(hist * centers) - np.cumsum(hist * centers)) / np.maximum(w1, 1e-9)
    between = w0 * w1 * (m0 - m1) ** 2
    between[w1 <= 0] = -1
    return float(centers[int(np.argmax(between))])


def border_bg(rgb):
    """zemin rengi tespiti: kenar bandının (8px) kanal-medyanı — gürültüye
    dayanıklı, deterministik."""
    b = 8
    band = np.concatenate([
        rgb[:b].reshape(-1, 3), rgb[-b:].reshape(-1, 3),
        rgb[:, :b].reshape(-1, 3), rgb[:, -b:].reshape(-1, 3)])
    return np.median(band, axis=0)


def textured_masks(im_rgb, bg):
    """dokulu/renkli zemin yolu: medyan doku bastırma + zemin-uzaklık silüeti
    (Otsu) + Sobel kenar haritası + karanlık-vuruş eşiği. INK ham eşiği YOK."""
    imf = im_rgb.filter(ImageFilter.MedianFilter(3))     # doku bastırma
    # (5'lik pencere ince çizgiyi/minik düğmeyi eritiyor: keten ölçümünde pat
    # p0.5 91→196'ya fırladı; 3'lük koru, kalan doku eşiklere bırakılır)
    F = np.asarray(imf).astype(np.int16)
    Lm = np.asarray(imf.convert('L')).astype(np.float64)
    bgL = float(0.299*bg[0] + 0.587*bg[1] + 0.114*bg[2])
    E = sobel_mag(Lm)
    # GEÇİŞ 1 — SİLÜET: kaba koyu-vuruş maskesi (zeminden belirgin karanlık)
    # kapalı dış konturu verir; flood o konturun ÇEVRELEDİĞİ iç bölgeyi bulur.
    # Zemin-uzaklık bölgesi (dolgu rengi zeminden gerçekten farklıysa) katkı verir.
    stroke0 = Lm < (bgL - 60.0)
    st1 = stroke0.copy()
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
        st1 |= np.roll(np.roll(stroke0, dy, 0), dx, 1)
    interior = ~flood_bg(~st1) & ~st1
    D = np.abs(F - bg.reshape(1, 1, 3)).max(axis=2).astype(np.float64)
    tau_fig = max(otsu_threshold(D), 12.0)
    figD = D > tau_fig
    if figD.mean() < 0.03:      # anlamlı dolgu-ayrımı yoksa katkıyı kapat
        figD[:] = False
    sil = close_mask(stroke0 | interior | figD, 3)
    G = largest_region(sil)
    holes = ~flood_bg(~G) & ~G   # kapalı iç delikleri doldur
    G = G | holes
    # GEÇİŞ 2 — MÜREKKEP: eşikler silüet İÇİNDE ölçülür (doku istatistiği).
    # Ölçüm (IZLEYICI-V8 keten kanıtı): doku L 197-235 / E p95≈56; gerçek çizgi
    # L<130 / kenar E≥270 — aralık geniş, formül veriye oturur.
    if G.any():
        p1g = float(np.percentile(Lm[G], 1))
        medg = float(np.median(Lm[G]))
        tau_dark = p1g + 0.35 * (medg - p1g) if p1g < bgL - 80 else bgL - 70.0
        noise = float(np.median(E[G]))
        tau_e = max(6.0 * noise, 60.0)
    else:
        tau_dark, noise, tau_e = bgL - 70.0, 0.0, 60.0
    stroke = (Lm < tau_dark) | (E > tau_e)
    print(f'zemin: rgb={tuple(int(v) for v in bg)} L={bgL:.0f} | silüet px={int(G.sum())} '
          f'tau_fig={tau_fig:.1f} | tau_dark={tau_dark:.1f} tau_e={tau_e:.1f} (doku gürültüsü {noise:.1f})')
    Gd = G.copy()
    for _ in range(2):
        n = Gd.copy()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            n |= np.roll(np.roll(Gd, dy, 0), dx, 1)
        Gd = n
    ink = stroke & Gd
    # silüet sınırı iskelete girsin (eski yolun fill-kenarı davranışıyla aynı rol)
    er = G.copy()
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
        er = er & np.roll(np.roll(G, dy, 0), dx, 1)
    ink |= (G & ~er)
    # ufak doku kırıntılarını at (<10 px bileşen) — sahte düğme/dash tohumu
    from collections import deque as _dq
    inkb = ink.copy(); lab = np.zeros(ink.shape, bool)
    for sy, sx in zip(*np.nonzero(inkb)):
        if lab[sy, sx]:
            continue
        comp = [(sy, sx)]; lab[sy, sx] = True; q = _dq(comp)
        while q:
            cy, cx = q.popleft()
            for dy, dx in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
                ny, nx = cy+dy, cx+dx
                if 0 <= ny < ink.shape[0] and 0 <= nx < ink.shape[1] and inkb[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = True; q.append((ny, nx)); comp.append((ny, nx))
        if len(comp) < 10:
            for cy, cx in comp:
                ink[cy, cx] = 0
    fill = (G & ~ink)
    return ink.astype(np.uint8), fill.astype(np.uint8), G


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
    if np.hypot(*(b - a)) < 1e-6:
        # KAPALI DÖNGÜ: uçlar çakışık -> kord 0, klasik RDP her şeyi 2 noktaya
        # indirir (dış kontur sessizce kaybolur). En uzak noktadan ikiye böl.
        dists = [np.hypot(p[0]-a[0], p[1]-a[1]) for p in pts]
        k = int(np.argmax(dists))
        if k <= 0 or k >= len(pts) - 1:
            return [pts[0], pts[-1]]
        return rdp(pts[:k+1], eps)[:-1] + rdp(pts[k:], eps)
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


def flood_bg(nonink):
    """zemin taraması: kenarlardan ulaşılabilir non-ink pikseller (BFS).
    Zemine ULAŞAMAYAN boşluk = kapalı iç bölge — dolgu olmayan çizimde
    (kalıp parçası: içi beyaz kontur) silüeti tanım gereği kapalı yapar."""
    from collections import deque
    H, W = nonink.shape
    bg = np.zeros((H, W), bool)
    q = deque()
    for x in range(W):
        for y in (0, H-1):
            if nonink[y, x] and not bg[y, x]:
                bg[y, x] = True; q.append((y, x))
    for y in range(H):
        for x in (0, W-1):
            if nonink[y, x] and not bg[y, x]:
                bg[y, x] = True; q.append((y, x))
    while q:
        cy, cx = q.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = cy+dy, cx+dx
            if 0 <= ny < H and 0 <= nx < W and nonink[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True; q.append((ny, nx))
    return bg


def largest_region(mask):
    """maskede en büyük 4-bağlı bileşen (BFS)."""
    from collections import deque
    H, W = mask.shape
    lab = np.zeros((H, W), bool)
    best = None
    for sy, sx in zip(*np.nonzero(mask)):
        if lab[sy, sx]:
            continue
        comp = [(sy, sx)]; lab[sy, sx] = True; q = deque(comp)
        while q:
            cy, cx = q.popleft()
            for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                ny, nx = cy+dy, cx+dx
                if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = True; q.append((ny, nx)); comp.append((ny, nx))
        if best is None or len(comp) > len(best):
            best = comp
    out = np.zeros((H, W), bool)
    if best:
        ys = [p[0] for p in best]; xs = [p[1] for p in best]
        out[ys, xs] = True
    return out


def outer_contour(mask):
    """SİLÜET SINIRI = tek KAPALI kesintisiz eğri (Moore boundary trace).
    Kesik imkânsız: dolu bölgenin sınırı tanım gereği kapalı döngüdür."""
    ys, xs = np.nonzero(mask)
    if not len(ys):
        return []
    # en üst satırdaki en soldaki dolu piksel; batısı tanım gereği boş
    top = ys.min()
    s = (top, xs[ys == top].min())
    CW = [(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1)]  # saat yönü
    def filled(p):
        return 0 <= p[0] < mask.shape[0] and 0 <= p[1] < mask.shape[1] and mask[p]
    contour = [s]
    b0 = (s[0], s[1] - 1)   # ilk backtrack: batı komşusu (boş)
    b, c = b0, s
    for _ in range(200000):
        # backtrack'ten saat yönünde tarayarak ilk dolu komşuya geç
        # (ders kitabı Moore-komşu izleme; önceki sürüm sağ-el sezgiseliydi ve
        # 1px çıkıntıda minik döngüye takılıp izi yarım bırakıyordu)
        bi = CW.index((b[0] - c[0], b[1] - c[1]))
        nxt = None
        for k in range(1, 9):
            d = CW[(bi + k) % 8]
            p = (c[0] + d[0], c[1] + d[1])
            if filled(p):
                nxt = p
                pb = CW[(bi + k - 1) % 8]
                b = (c[0] + pb[0], c[1] + pb[1])
                break
        if nxt is None:
            break               # izole piksel
        c = nxt
        contour.append(c)
        if c == s and b == b0:  # Jacob durması: aynı backtrack ile ikinci giriş
            break
    return contour


def main():
    img_path, crop_arg, out_svg = sys.argv[1], sys.argv[2], sys.argv[3]
    im0 = Image.open(img_path)
    if crop_arg != '-':
        c = [float(x) for x in crop_arg.split(',')]
        w, h = im0.size
        im0 = im0.crop((int(c[0]*w), int(c[1]*h), int(c[2]*w), int(c[3]*h)))
    im_rgb = im0.convert('RGB')
    im = im0.convert('L')
    A = np.asarray(im)
    # ZEMİN TESPİTİ (v8): kenar bandı beyaza yakınsa ESKİ yol bayt-bayt aynı
    # çalışır (regresyon garantisi); değilse dokulu/renkli-zemin yolu devreye girer.
    bg = border_bg(np.asarray(im_rgb))
    textured = float(bg.min()) < 240.0   # gerçek beyaz zemin 248-255; bej/krem 230 civarı
    if textured:
        ink, _fill, sil = textured_masks(im_rgb, bg)
        return finish(A, ink, sil, out_svg)
    ink = (A < INK).astype(np.uint8)
    fill = ((A < 240) & (A >= INK)).astype(np.uint8)
    # SİLÜET yol 1 (dolgusuz çizim, ör. kalıp parçası): zemin flood — kenardan
    # ulaşılamayan boşluk = kapalı iç bölge. Antialias iğne deliği sızdırmasın
    # diye ink 1px şişirilerek taranır. İç bölge anlamlıysa ana parça dışındaki
    # mürekkep bileşenleri (komşu parça artığı) atılır.
    ink1 = ink.astype(bool).copy()
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
        ink1 |= np.roll(np.roll(ink.astype(bool), dy, 0), dx, 1)
    interior = ~flood_bg(~ink1) & ~ink1
    sil = None
    if interior.sum() > 0.02 * A.size:
        main_int = largest_region(interior)
        keep = main_int.copy()
        for _ in range(4):
            n = keep.copy()
            for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                n |= np.roll(np.roll(keep, dy, 0), dx, 1)
            keep = n
        # ana iç bölgeye değmeyen mürekkep bileşenlerini at (BFS etiketleme)
        from collections import deque as _dq
        inkb = ink.astype(bool); lab = np.zeros(A.shape, bool)
        dropped = 0
        for sy, sx in zip(*np.nonzero(inkb)):
            if lab[sy, sx]:
                continue
            comp = [(sy, sx)]; lab[sy, sx] = True; q = _dq(comp); touch = False
            while q:
                cy, cx = q.popleft()
                if keep[cy, cx]:
                    touch = True
                for dy, dx in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
                    ny, nx = cy+dy, cx+dx
                    if 0 <= ny < A.shape[0] and 0 <= nx < A.shape[1] and inkb[ny, nx] and not lab[ny, nx]:
                        lab[ny, nx] = True; q.append((ny, nx)); comp.append((ny, nx))
            if not touch:
                dropped += 1
                for cy, cx in comp:
                    ink[cy, cx] = 0
        print('zemin-flood: iç bölge px', int(main_int.sum()), '| atılan dış bileşen:', dropped)
        sil = close_mask(ink.astype(bool) | main_int, 3)
    if sil is None:
        # SİLÜET yol 2 (eski davranış, dolgulu flat): mürekkep + dolgu birlikte
        sil = close_mask((ink | fill).astype(bool), 3)
    # en büyük bileşeni al (etiketleme pahalı; flood yerine: sınır izinden gelen kontur zaten en üst bileşen)
    if fill.sum() > 500:
        er = fill.copy()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            er &= np.roll(np.roll(fill, dy, 0), dx, 1)
        ink = (ink | (fill & ~er)).astype(np.uint8)
    return finish(A, ink, sil, out_svg)


def finish(A, ink, sil, out_svg):
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
    # DIŞ KONTUR: Moore sınır izi — dolu bölgenin sınırı TANIM GEREĞİ tek kapalı
    # döngü (v3 iddiasının gerçek uygulaması; halka-iskelet yolu kesik/çentik
    # çıkıntılarında kavşak üretip bölünüyordu, o yol artık yedek).
    # Moore en üst pikselden başlar — artık/parça kalıntısı yanıltmasın diye
    # en büyük silüet bileşeninden izlenir.
    moore = outer_contour(largest_region(sil.astype(bool)))
    if len(moore) > 100:
        oc_list = [[(p[1], p[0]) for p in moore]]
    else:
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

    # SİMETRİ TAMAMLAMA (v6): referans flat'ler CF eksenine göre simetriktir;
    # iskelet bir tarafta İZLEDİĞİ uzun yapısal çizgiyi (pens/dikiş/yaka kenarı)
    # öbür tarafta kaçırdıysa aynasını ekle. ESTETİK KORUMASI (ink-asimetri
    # dersi): kısa organik tiklere (büzgü/kırışık) DOKUNULMAZ — sadece uzun
    # (>60px) zincir + aynada gerçekten iz yoksa (<0.35 kapsama). Silüetin
    # kendisi simetrik değilse (wrap/asimetrik pat) pas tamamen atlanır.
    mirrored_solid = []
    if oc_xy:
        xs_oc = [p[0] for p in oc_xy]
        axis = 0.5 * (min(xs_oc) + max(xs_oc))
        ocset2 = set((round(x), round(y)) for x, y in oc_xy)
        hits = tot2 = 0
        for x, y in oc_xy[::5]:
            tot2 += 1
            mx = round(2 * axis - x)
            if any((mx+dx, round(y)+dy) in ocset2 for dy in (-3,-2,-1,0,1,2,3) for dx in (-3,-2,-1,0,1,2,3)):
                hits += 1
        if tot2 and hits / tot2 > 0.9:
            skxy = set((x, y) for y, x in skel)   # iskelet (x,y)
            def mirror_cov(c):
                cnt = hit = 0
                for x, y in c[::3]:
                    mx, my = round(2*axis - x), round(y)
                    cnt += 1
                    if any((mx+dx, my+dy) in skxy or (mx+dx, my+dy) in ocset2
                           for dy in (-4,-3,-2,-1,0,1,2,3,4) for dx in (-4,-3,-2,-1,0,1,2,3,4)):
                        hit += 1
                return hit / max(1, cnt)
            for c in solid:
                if chain_len(c) < 60:
                    continue
                xs_c = [p[0] for p in c]
                # ekseni kesen ya da eksene yapışık (pat/CF) zincirler aynalanmaz
                if min(xs_c) - axis < 12 and axis - max(xs_c) < 12:
                    if (min(xs_c) < axis < max(xs_c)) or abs(0.5*(min(xs_c)+max(xs_c)) - axis) < 15:
                        continue
                if mirror_cov(c) < 0.35:
                    mirrored_solid.append([(2*axis - x, y) for x, y in c])
            if mirrored_solid:
                print('simetri tamamlama:', len(mirrored_solid), 'zincir aynalandı')
            solid = solid + mirrored_solid

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
