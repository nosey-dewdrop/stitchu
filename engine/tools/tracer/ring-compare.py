#!/usr/bin/env python3
"""ring-compare v1 — tracer→reçete köprüsünün karşılaştırma hakemi (2026-07-28).

Girdi 1: trace-ring.py mm kontur dökümü (ölçülü/köprü işaretli, sayfa-mm).
Girdi 2: recipe-json-dump çıktısı (reçete yolundan çizilmiş kalıp JSON'u).
İki kontur da KESİM çizgisidir: Buğra baskısı dikiş payı DAHİL basar (defter:
1cm pay; etek 3cm), reçete tarafında da cutLine (offsetOutline) alınır.
Hizalama: iki kontur da kendi bbox min köşesine çevrilir (x sağa, y aşağı) —
serbest parametre yok, çakıştırma çapası bbox.

Metrikler (GECE HEDEFİ toleransları):
- bbox W/H sapması: gate ±%1.3 (trace metodolojisinin kendi bbox sınırı;
  298mm'de ±3.9mm).
- çevre: reçete cutLine çevresi vs izlenen kontur DART-KAPALI çevresi.
  Buğra ön gövdede yan pens AÇIK basılıdır (kontur pens V'sine girer); reçete
  dış hattı pensi markings'te taşır, dış hat pürüzsüzdür — bire bir çevre
  karşılaştırması ancak pens V'si çıkarılıp ağzı düz kapatılınca anlamlıdır.
  Gate ±%3.6 (trace çevre metodolojisinin kanıtlı sınırı, bugra-ring raporu).
- nokta-mesafe: yalnız ÖLÇÜLÜ trace noktaları (köprü uydurma çizgidir, hakem
  olamaz), pens V bölgesi hariç; her noktadan reçete cutLine poligonuna dik
  mesafe. medyan + p95 + max raporlanır; gate v1 mandalı MEVCUT başarımın
  kilididir (kare-yaka modeli vs Buğra oyuk yakası bilinen fark — regresyon
  kilidi, kalite iddiası değil; sayılar reports/gate/kopru-v1-*.txt).

Pens tespiti deterministik: kontur konveks gövdesi (hull) üzerinde atlanan
yaylardan (yay − kiriş) farkı en büyük olan bölge = pens V'si (Buğra ön
gövdede 275mm yay / 98mm kiriş; yaka ve kol oyuğu oyukları çok daha küçük
fark taşır). 30mm altı fark = pens yok.

LLM yok, tahmin yok. Aynı girdi → bayt aynı çıktı.
kullanım: ring-compare.py <trace.json> <draft.json> [pieceName] [--gate]
"""
import json
import math
import sys

# --- toleranslar (GECE HEDEFİ 2026-07-28; gerekçeler yukarıda) ---
BBOX_TOL_FRAC = 0.013
# çevre hakemi: reçete cutLine vs PENS-KAPALI VEKTÖR gerçeği. Köprülü trace
# çevresi hakem OLAMAZ: düz köprü kirişleri yayı sistematik kısaltır (bu
# parçada %40 köprü → −59mm, bugra-ring raporu); vektör gerçek zaten
# trace-ring'in kendi hakemi. Trace-kıyası bilgi satırı olarak raporda kalır.
# Gate ±%1.3: bbox metodolojisiyle aynı ölçüt (vektör çevre kesin).
PERIM_TOL_FRAC = 0.013
# nokta-mesafe regresyon kilidi (v2, 2026-07-28): SET-IN scye kernel modeli
# (bodice.hpp setInArmhole*) yapısal kaynak (a)'yı çözdü — köprü artık kolsuz
# teğet ailesi yerine set-in scye fit'i kullanıyor; ölçüm medyan 4.77->4.34,
# p95 34.19->24.37, max 34.52->24.58 (arclen-regülarize, çevre 0.99% gate içi).
# Kilit yeni başarıma çekildi (26mm; kalan p95/max kaynağı (b) kare-yaka modeli
# vs Buğra oyuk yaka köşesi + kalıntı armscye — v2 adayı). Bu kilit kalite
# iddiası değil REGRESYON mandalı; iyileşme sayıları düşürür (v1 38mm -> v2 26mm).
DIST_MEDIAN_MM = 5.0
DIST_P95_MM = 26.0
DIST_MAX_MM = 26.0
DART_MIN_EXCESS_MM = 30.0


def load_trace(path):
    d = json.load(open(path))
    xs = [p[0] for s in d['segments'] for p in s['pts']]
    ys = [p[1] for s in d['segments'] for p in s['pts']]
    xmin, ymax = min(xs), max(ys)  # sayfa-mm y yukarı -> yerel y aşağı
    segs = [{'kind': s['kind'],
             'pts': [(p[0] - xmin, ymax - p[1]) for p in s['pts']]}
            for s in d['segments']]
    return d, segs


def flatten(segs):
    """Yürüyüş sırasında (nokta, ölçülü mü) listesi; segment uçları tekrar
    etmesin diye köprünün ilk noktası atlanır (önceki segmentin son noktası)."""
    out = []
    for s in segs:
        pts = s['pts']
        meas = s['kind'] == 'measured'
        start = 1 if out and pts and out[-1][0] == pts[0] else 0
        for p in pts[start:]:
            out.append((p, meas))
    return out


def plen(pts):
    return sum(math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
               for i in range(len(pts) - 1))


def hull_indices(pts):
    """Andrew monotone chain; kontur noktalarından hull'a düşenlerin
    yürüyüş-indeksleri (küme)."""
    idx = sorted(range(len(pts)), key=lambda i: (pts[i][0], pts[i][1]))

    def cross(o, a, b):
        return ((pts[a][0] - pts[o][0]) * (pts[b][1] - pts[o][1]) -
                (pts[a][1] - pts[o][1]) * (pts[b][0] - pts[o][0]))
    lower, upper = [], []
    for i in idx:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], i) <= 1e-9:
            lower.pop()
        lower.append(i)
    for i in reversed(idx):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], i) <= 1e-9:
            upper.pop()
        upper.append(i)
    return set(lower[:-1] + upper[:-1])


def _cyc_slice(n, i0, i1):
    return list(range(i0, i1 + 1)) if i1 >= i0 else list(range(i0, n)) + list(range(0, i1 + 1))


def _max_dev_idx(pts, idxs):
    """idxs dizisinde uçları birleştiren kirişten en uzak noktanın indeksi +
    mesafesi (Douglas-Peucker köşe kuralı)."""
    ax, ay = pts[idxs[0]]
    bx, by = pts[idxs[-1]]
    L = max(math.hypot(bx - ax, by - ay), 1e-9)
    dd, di = -1.0, idxs[0]
    for i in idxs:
        px, py = pts[i]
        d = abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / L
        if d > dd:
            dd, di = d, i
    return di, dd


def find_dart(walk):
    """Pens V tespiti, iki adım (deterministik):
    1. hull'da atlanan yaylardan (yay − kiriş) farkı en büyük koşu — Buğra ön
       gövdede bu koşu yan dikişin hafif iç bükeyliği yüzünden etek yanından
       koltukaltına kadar uzar (V'yi İÇERİR ama ondan büyüktür);
    2. koşu içinde apeks = kirişten en uzak nokta; ağızlar = apeks-kiriş DP
       köşeleri (koşu ucuna 5mm'den yakın köşe = ucun kendisi: ağız hull
       tepe noktasıyla çakışık, ör. koltukaltı köşesi).
    Dönen: (m1, m2, arcVMM, chordVMM, apexIdx) ya da None (V yay−kiriş <30mm)."""
    pts = [p for p, _ in walk]
    hull = hull_indices(pts)
    n = len(pts)
    order = [i for i in range(n) if i in hull]
    best = None
    for k in range(len(order)):
        i0, i1 = order[k], order[(k + 1) % len(order)]
        idxs = _cyc_slice(n, i0, i1)
        if len(idxs) < 3:
            continue
        seg = [pts[i] for i in idxs]
        arc = plen(seg)
        chord = math.hypot(pts[i1][0] - pts[i0][0], pts[i1][1] - pts[i0][1])
        if best is None or arc - chord > best[0]:
            best = (arc - chord, i0, i1)
    if best is None or best[0] < DART_MIN_EXCESS_MM:
        return None
    _, i0, i1 = best
    run = _cyc_slice(n, i0, i1)
    apex, _ = _max_dev_idx(pts, run)
    ap = run.index(apex)
    m1, d1 = _max_dev_idx(pts, run[:ap + 1]) if ap > 0 else (i0, 0.0)
    m2, d2 = _max_dev_idx(pts, run[ap:]) if ap < len(run) - 1 else (i1, 0.0)
    if d1 < 5.0:
        m1 = i0
    if d2 < 5.0:
        m2 = i1
    vidx = _cyc_slice(n, m1, m2)
    arc_v = plen([pts[i] for i in vidx])
    chord_v = math.hypot(pts[m2][0] - pts[m1][0], pts[m2][1] - pts[m1][1])
    if arc_v - chord_v < DART_MIN_EXCESS_MM:
        return None
    return m1, m2, arc_v, chord_v, apex


def in_range_cyclic(i, i0, i1, n):
    if i0 <= i1:
        return i0 < i < i1
    return i > i0 or i < i1


def draft_piece_poly(draft, piece_name, step=2.0):
    piece = next((p for p in draft['pieces'] if p['name'] == piece_name), None)
    if piece is None:
        raise SystemExit(f'HATA: draft içinde parça yok: {piece_name}')
    pts = []
    cur = None
    for c in piece['cutLine']:
        t = c['type']
        if t == 'move':
            cur = (c['x'], c['y'])
            pts.append(cur)
        elif t == 'line':
            nxt = (c['x'], c['y'])
            d = math.hypot(nxt[0] - cur[0], nxt[1] - cur[1])
            for k in range(1, max(1, int(d / step)) + 1):
                u = k / max(1, int(d / step))
                pts.append((cur[0] + (nxt[0] - cur[0]) * u,
                            cur[1] + (nxt[1] - cur[1]) * u))
            cur = nxt
        elif t == 'curve':
            p0, p3 = cur, (c['x'], c['y'])
            p1, p2 = (c['cp1x'], c['cp1y']), (c['cp2x'], c['cp2y'])
            for k in range(1, 33):
                u = k / 32.0
                w = 1 - u
                pts.append((w**3 * p0[0] + 3 * w * w * u * p1[0] + 3 * w * u * u * p2[0] + u**3 * p3[0],
                            w**3 * p0[1] + 3 * w * w * u * p1[1] + 3 * w * u * u * p2[1] + u**3 * p3[1]))
            cur = p3
        elif t == 'close':
            if pts:
                pts.append(pts[0])
    xmin = min(p[0] for p in pts)
    ymin = min(p[1] for p in pts)
    return [(p[0] - xmin, p[1] - ymin) for p in pts]


def pt_poly_dist(pt, poly):
    px, py = pt
    best = float('inf')
    for i in range(len(poly) - 1):
        ax, ay = poly[i]
        bx, by = poly[i + 1]
        dx, dy = bx - ax, by - ay
        L2 = dx * dx + dy * dy
        if L2 < 1e-12:
            d = math.hypot(px - ax, py - ay)
        else:
            u = ((px - ax) * dx + (py - ay) * dy) / L2
            u = 0.0 if u < 0 else (1.0 if u > 1 else u)
            d = math.hypot(px - (ax + u * dx), py - (ay + u * dy))
        if d < best:
            best = d
    return best


def landmarks(walk):
    """Deterministik uç-nokta kuralları (köprü v1; tek parça hedefi Locket ön
    gövde sınıfı: CF sol dik kenar, tepe = omuz-yaka noktası)."""
    pts = [p for p, _ in walk]
    W = max(p[0] for p in pts)
    H = max(p[1] for p in pts)
    neck_pt = min(pts, key=lambda p: (p[1], p[0]))
    # CF yaka derinliği: Buğra baskısında CF kenarı + CF-yakın yaka ucu üst
    # halkalarca örtülür (izde uzun köprü) — ölçülü en derin CF-yakın yaka
    # noktası alınır (x <= 0.30W, üst yarı). Kare-yaka modelinin düz yaka
    # tabanı da aynı kuralla aynı çizgiyi ölçer.
    # x > 3: CF kenarının kendisi (dikey çizgi) derinlik adayı değildir.
    cf = [p for p in pts if 3.0 < p[0] <= 0.30 * W and p[1] < 0.5 * H]
    cf_neck = max(cf, key=lambda p: (p[1], -p[0])) if cf else None
    top_band = [p for p in pts if p[1] <= 45.0]
    tip = max(top_band, key=lambda p: (p[0], -p[1])) if top_band else None
    underarm = max(pts, key=lambda p: (p[0], -p[1]))
    hem_side = max(pts, key=lambda p: (p[0] + p[1], p[0]))
    return {'W': W, 'H': H, 'neckPt': neck_pt, 'cfNeck': cf_neck,
            'tip': tip, 'underarm': underarm, 'hemSide': hem_side}


def compare(trace_path, draft_path, piece_name):
    doc, segs = load_trace(trace_path)
    walk = flatten(segs)
    poly = draft_piece_poly(json.load(open(draft_path)), piece_name)
    lm = landmarks(walk)
    rW = max(p[0] for p in poly)
    rH = max(p[1] for p in poly)
    dart = find_dart(walk)
    n = len(walk)
    total = plen([p for p, _ in walk] + [walk[0][0]])
    if dart:
        i0, i1, arc, chord, apex = dart
        closed = total - arc + chord
    else:
        closed = total
    perim_r = plen(poly)
    dists = []
    for i, (p, meas) in enumerate(walk):
        if not meas:
            continue
        if dart and in_range_cyclic(i, dart[0], dart[1], n):
            continue
        dists.append(pt_poly_dist(p, poly))
    dists.sort()
    med = dists[len(dists) // 2]
    p95 = dists[int(len(dists) * 0.95)]
    mx = dists[-1]
    rows = []

    def row(name, val, lim, ok):
        rows.append((name, val, lim, ok))
    dW, dH = rW - lm['W'], rH - lm['H']
    row('bbox W mm (recete-trace)', f'{rW:.2f}-{lm["W"]:.2f} = {dW:+.2f} ({100*dW/lm["W"]:+.2f}%)',
        f'±{100*BBOX_TOL_FRAC:.1f}%', abs(dW) <= BBOX_TOL_FRAC * lm['W'])
    row('bbox H mm (recete-trace)', f'{rH:.2f}-{lm["H"]:.2f} = {dH:+.2f} ({100*dH/lm["H"]:+.2f}%)',
        f'±{100*BBOX_TOL_FRAC:.1f}%', abs(dH) <= BBOX_TOL_FRAC * lm['H'])
    truth = doc.get('truthMM')
    if truth:
        # pens V trace'ten ölçülür (vektör V'siyle farkı <3mm bu parçada);
        # penssiz parçada vektör çevre olduğu gibi hakemdir.
        truth_closed = truth['perim'] - (arc - chord if dart else 0.0)
        dPt = perim_r - truth_closed
        row('cevre mm (recete vs dart-kapali VEKTOR)',
            f'{perim_r:.1f}-{truth_closed:.1f} = {dPt:+.1f} ({100*dPt/truth_closed:+.2f}%)',
            f'±{100*PERIM_TOL_FRAC:.1f}%', abs(dPt) <= PERIM_TOL_FRAC * truth_closed)
    dP = perim_r - closed
    row('cevre mm (recete vs dart-kapali trace; BILGI — kopru kirisleri yayi kisaltir)',
        f'{perim_r:.1f}-{closed:.1f} = {dP:+.1f} ({100*dP/closed:+.2f}%)',
        'gate yok', True)
    row('nokta-mesafe medyan mm', f'{med:.2f}', f'<={DIST_MEDIAN_MM}', med <= DIST_MEDIAN_MM)
    row('nokta-mesafe p95 mm', f'{p95:.2f}', f'<={DIST_P95_MM}', p95 <= DIST_P95_MM)
    row('nokta-mesafe max mm', f'{mx:.2f}', f'<={DIST_MAX_MM}', mx <= DIST_MAX_MM)
    info = {
        'trace': f'{doc["pattern"]} | {doc["piece"]} | beden {doc["size"]}',
        'traceTotalPerim': total, 'dart': dart, 'nMeasured': len(dists),
        'truth': doc.get('truthMM'), 'recipePerim': perim_r,
        'landmarks': lm,
    }
    return rows, info


def main():
    args = [a for a in sys.argv[1:] if a != '--gate']
    gate = '--gate' in sys.argv
    trace_path, draft_path = args[0], args[1]
    piece_name = args[2] if len(args) > 2 else 'Top Front'
    rows, info = compare(trace_path, draft_path, piece_name)
    print(f'ring-compare v1 | {info["trace"]} | parca: {piece_name}')
    print(f'trace toplam cevre {info["traceTotalPerim"]:.1f} mm; '
          + (f'pens V: yay {info["dart"][2]:.1f} / kiris {info["dart"][3]:.1f} mm '
             f'(indeks {info["dart"][0]}..{info["dart"][1]})' if info['dart'] else 'pens V yok'))
    if info['truth']:
        t = info['truth']
        print(f'vektor gercek (ikincil referans): w {t["w"]} h {t["h"]} cevre {t["perim"]} mm')
    print(f'olculu nokta (pens haric) {info["nMeasured"]}; recete cutLine cevre {info["recipePerim"]:.1f} mm')
    fails = 0
    for name, val, lim, ok in rows:
        mark = 'GECTI' if ok else 'KALDI'
        if not ok:
            fails += 1
        print(f'{mark} | {name:41s} | {val} | tolerans {lim}')
    if gate and fails:
        print(f'MANDAL: {fails} metrik tolerans disi -> FAIL')
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
