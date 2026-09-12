#!/usr/bin/env python3
"""flat-metre — flat teknik çizimleri DETERMİNİSTİK ölçer. LLM/kanaat yok.

Golden = design_patterns/flats-clean (gerçek Etsy flat'leri) + Bugra kapak flat'leri.
Bizimki = flat-metre/out/*.png (rasterize.mjs).

Metrikler (hepsi en büyük bağlı bileşen = ön görünüm gövdesi üzerinde):
  profile21   : 21 normalize yükseklikte silüet genişliği / maks genişlik
  waist_ratio : %40-70 bandındaki min genişlik / omuz bandı (%8-18) genişliği
                (1.0'a yakın = bel oyuğu YOK = "üçgen heyula/kutu")
  hem_ratio   : etek ucu genişliği / omuz genişliği (kloşluk)
  symmetry    : mürekkep pikselinin bbox-merkez aynasıyla IoU'su
                (1.0 = piksel-simetrik = robotik; gerçek el çizimi < 1)
  frag        : 1000 mürekkep pikseli başına kopuk parça sayısı (titreklik/kıl-çizgi)
"""
import sys, os, json, glob
import numpy as np
from PIL import Image

INK_THR = 200      # gri < 200 = mürekkep (beyaz zemin varsayımı)
MIN_BLOB = 400     # px; küçük lekeler figür seçilirken elenir


def label(binary):
    """8-komşuluk bağlı bileşen etiketleme (BFS, stdlib+numpy)."""
    h, w = binary.shape
    labels = np.zeros((h, w), np.int32)
    cur = 0
    stack = []
    for sy in range(h):
        row = binary[sy]
        for sx in np.nonzero(row)[0]:
            if labels[sy, sx]:
                continue
            cur += 1
            stack.append((sy, sx)); labels[sy, sx] = cur
            while stack:
                y, x = stack.pop()
                y0, y1 = max(0, y-1), min(h, y+2)
                x0, x1 = max(0, x-1), min(w, x+2)
                for ny in range(y0, y1):
                    for nx in range(x0, x1):
                        if binary[ny, nx] and not labels[ny, nx]:
                            labels[ny, nx] = cur
                            stack.append((ny, nx))
    return labels, cur


def dilate(b, r=2):
    out = b.copy()
    for dy in range(-r, r+1):
        for dx in range(-r, r+1):
            if dy == 0 and dx == 0:
                continue
            s = np.roll(np.roll(b, dy, 0), dx, 1)
            out |= s
    return out


def split_views(ink):
    """FRONT+BACK yan yana çizimlerde SOL görünümü ver. Kontur çiziminde giysi
    İÇİ de boş olduğundan projeksiyon-vadisi güvenilmez; kural: mürekkep
    bbox'ı iki-görünüm kadar genişse (en/boy > 1.15) bbox ortasından kes."""
    ys, xs = np.nonzero(ink)
    if not len(xs):
        return ink
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    bw, bh = x1 - x0 + 1, y1 - y0 + 1
    if bw / bh <= 1.15:
        return ink
    cut = x0 + bw // 2
    left = ink[:, :cut]
    return left if left.sum() > MIN_BLOB else ink


def measure(path):
    img = np.asarray(Image.open(path).convert('L'))
    ink = img < INK_THR
    if ink.sum() < MIN_BLOB:
        return None
    ink = split_views(ink)
    labels, n = label(ink)
    sizes = np.bincount(labels.ravel()); sizes[0] = 0
    main = sizes.argmax()
    ys, xs = np.nonzero(labels == main)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    bh, bw = y1 - y0 + 1, x1 - x0 + 1
    comp = (labels == main)[y0:y1+1, x0:x1+1]

    # genişlik profili: satırda ilk-son mürekkep aralığı
    spans = np.zeros(bh)
    for r in range(bh):
        c = np.nonzero(comp[r])[0]
        spans[r] = (c[-1] - c[0] + 1) if len(c) else 0
    prof = [float(spans[min(bh-1, int(t/20*(bh-1)))] / bw) for t in range(21)]

    def band(a, b):
        s = spans[int(a*bh):max(int(a*bh)+1, int(b*bh))]
        s = s[s > 0]
        return float(np.median(s)) if len(s) else 0.0

    shoulder = band(0.08, 0.18)
    waist_min = float(spans[int(0.40*bh):int(0.70*bh)][spans[int(0.40*bh):int(0.70*bh)] > 0].min()) \
        if (spans[int(0.40*bh):int(0.70*bh)] > 0).any() else 0.0
    hem = band(0.95, 1.0)

    # simetri: 2px dilate edilmiş mürekkep, EKSEN-TARAMALI yatay ayna IoU
    # (giysi ekseni bbox merkezinde olmayabilir; ±%12 tarayıp en iyi eksen alınır.
    #  dilate: 1-2px hiza kayması ince kurşun çizgide IoU'yu haksız çökertmesin)
    d = dilate(comp, 2)
    flip = d[:, ::-1]
    symmetry = 0.0
    for off in range(-bw // 8, bw // 8 + 1, max(1, bw // 100)):
        f = np.roll(flip, 2 * off, axis=1)
        inter = np.logical_and(d, f).sum()
        union = np.logical_or(d, f).sum()
        if union:
            symmetry = max(symmetry, float(inter / union))

    # parçalılık: bbox içindeki tüm mürekkep bileşenleri
    sub = ink[y0:y1+1, x0:x1+1]
    _, nsub = label(sub)
    frag = float(nsub / max(1, sub.sum()) * 1000)

    return {
        'file': os.path.basename(path), 'bbox': [int(bw), int(bh)],
        'waist_ratio': round(waist_min / shoulder, 3) if shoulder else None,
        'hem_ratio': round(hem / shoulder, 3) if shoulder else None,
        'symmetry': round(symmetry, 3), 'frag': round(frag, 2),
        'profile21': [round(p, 3) for p in prof],
    }


def measure_cropped(path, crop):
    if crop is None:
        return measure(path)
    im = Image.open(path)
    w, h = im.size
    box = (int(crop[0]*w), int(crop[1]*h), int(crop[2]*w), int(crop[3]*h))
    tmp = '/tmp/flat-metre-crop.png'
    im.crop(box).save(tmp)
    m = measure(tmp)
    if m: m['file'] = os.path.basename(path)
    return m


def main():
    here = os.path.dirname(os.path.abspath(sys.argv[0]))
    root = os.path.normpath(os.path.join(here, '..', '..', '..'))
    rows = []

    # 1) küratörlü goldenlar (goldens.json)
    g = json.load(open(os.path.join(here, 'goldens.json')))
    for spec in g['goldens']:
        p = os.path.join(root, g['dir'], spec['file'])
        m = measure_cropped(p, spec['crop'])
        if m:
            m['kind'] = 'GOLDEN'; m['class'] = spec['class']; rows.append(m)

    # 2) bizim render'lar (argüman ya da out/*.png)
    args = sys.argv[1:] or [os.path.join(here, 'out', '*.png')]
    paths = []
    for a in args:
        paths += sorted(glob.glob(a)) if any(c in a for c in '*?[') else [a]
    for p in paths:
        m = measure(p)
        if m:
            m['kind'] = 'BİZ'; rows.append(m)
        else:
            print(f'  atlandı (mürekkep yok): {p}', file=sys.stderr)

    print(f"{'':7s}{'dosya':38s} {'waist':>6s} {'hem':>6s} {'simetri':>8s} {'parça/1k':>9s}")
    for r in rows:
        print(f"{r['kind']:7s}{r['file'][:38]:38s} {str(r['waist_ratio']):>6s} {str(r['hem_ratio']):>6s} "
              f"{r['symmetry']:>8.3f} {r['frag']:>9.2f}")

    gr = [r for r in rows if r['kind'] == 'GOLDEN']
    if gr:
        def band(k):
            v = sorted(r[k] for r in gr if r[k] is not None)
            return v[0], v[-1]
        print('\nGOLDEN BANDI (küratörlü emsal aralığı):')
        for k in ('waist_ratio', 'hem_ratio', 'symmetry', 'frag'):
            lo, hi = band(k)
            print(f'  {k:12s} {lo:.3f} – {hi:.3f}')

    out = os.path.join(here, 'metre-sonuc.json')
    json.dump(rows, open(out, 'w'), indent=1)
    print(f'\njson: {out}')


if __name__ == '__main__':
    main()
