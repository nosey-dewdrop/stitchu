#!/usr/bin/env python3
"""fit-golden — TAKLİT DÖNGÜSÜ: kalemi bir GERÇEK golden flat'e oturt.

Damla emri (2026-07-26): "kalıpları Bugra ve Etsy ss'lerini kopyalamayı öğret."
Golden'ın silüeti piksel piksel ölçülür; kalem knob'ları koordinat inişiyle
golden profiline OTURTULUR. Kanıt: üst üste bindirme (golden gri + biz kırmızı)
+ sayısal mesafe. Kapanmayan fark = kalemdeki YAPISAL hata (knob'la çözülmez),
rapora yazılır. LLM yok.

kullanım: python3 fit-golden.py <golden.png|crop@x0,y0,x1,y1> <style> <outdir>
"""
import sys, os, json, subprocess, importlib.util
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('fm', os.path.join(HERE, 'flat-metre.py'))
fm = importlib.util.module_from_spec(spec); spec.loader.exec_module(fm)

NODE = ['node', os.path.join(HERE, 'render-one.mjs')]


def measure_png(path, crop=None):
    if crop:
        im = Image.open(path); w, h = im.size
        box = (int(crop[0]*w), int(crop[1]*h), int(crop[2]*w), int(crop[3]*h))
        tmp = '/tmp/fit-crop.png'; im.crop(box).save(tmp); path = tmp
    m = fm.measure(path)
    if m:
        m['aspect'] = m['bbox'][0] / m['bbox'][1]
    return m


def dist(a, b):
    """profil L1 + en-boy + bel/etek oran farkları. Küçük = benzer silüet."""
    prof = float(np.mean(np.abs(np.array(a['profile21']) - np.array(b['profile21']))))
    asp = abs(a['aspect'] - b['aspect'])
    wr = abs((a['waist_ratio'] or 0) - (b['waist_ratio'] or 0))
    hr = abs((a['hem_ratio'] or 0) - (b['hem_ratio'] or 0))
    return prof + 0.5*asp + 0.25*wr + 0.15*hr, {'prof': round(prof,4), 'aspect': round(asp,3), 'waist': round(wr,3), 'hem': round(hr,3)}


def render(style, ov, out):
    subprocess.run(NODE + [style, out, json.dumps(ov)], check=True, capture_output=True)
    return measure_png(out)


# silüet maskesi (ana bileşen, bbox'a kırpık) — bindirme için
def mask_of(path, crop=None):
    if crop:
        im = Image.open(path); w, h = im.size
        box = (int(crop[0]*w), int(crop[1]*h), int(crop[2]*w), int(crop[3]*h))
        tmp = '/tmp/fit-mask.png'; im.crop(box).save(tmp); path = tmp
    img = np.asarray(Image.open(path).convert('L'))
    ink = img < fm.INK_THR
    ink = fm.split_views(ink)
    labels, _ = fm.label(ink)
    sizes = np.bincount(labels.ravel()); sizes[0] = 0
    main = sizes.argmax()
    ys, xs = np.nonzero(labels == main)
    return (labels == main)[ys.min():ys.max()+1, xs.min():xs.max()+1]


def overlay(golden_mask, our_mask, out, H=640):
    def scale(m):
        h, w = m.shape
        nw = max(1, int(w * H / h))
        return np.asarray(Image.fromarray((m*255).astype(np.uint8)).resize((nw, H))) > 127
    g, o = scale(golden_mask), scale(our_mask)
    W = max(g.shape[1], o.shape[1])
    img = np.full((H, W, 3), 255, np.uint8)
    def place(m):
        pad = (W - m.shape[1]) // 2
        full = np.zeros((H, W), bool); full[:, pad:pad+m.shape[1]] = m
        return full
    G, O = place(g), place(o)
    img[G] = [150, 150, 150]      # golden gri
    img[O] = [220, 40, 40]        # biz kırmızı
    img[np.logical_and(G, O)] = [90, 40, 120]  # örtüşme mor
    Image.fromarray(img).save(out)


def main():
    golden_arg, style, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(outdir, exist_ok=True)
    crop = None
    if '@' in golden_arg:
        golden_arg, c = golden_arg.split('@')
        crop = [float(x) for x in c.split(',')]
    gold = measure_png(golden_arg, crop)
    print('GOLDEN:', {k: gold[k] for k in ('waist_ratio','hem_ratio','aspect')})

    # başlangıç (mevcut kalem) — inkAsym açık (mürekkep kanadı zaten onaylı yönde)
    base = {'inkAsym': 1}
    cur = dict(base)
    first = os.path.join(outdir, 'once.png')
    m0 = render(style, cur, first)
    d0, det0 = dist(gold, m0)
    print('BAŞLANGIÇ mesafe:', round(d0,4), det0)

    KNOBS = {
        'skirtFull':    [1.2, 1.6, 2.0, 2.4, 2.8, 3.2],
        'skirtCurve':   [0, 0.35, 0.7, 1.0],
        'waistNip':     [0.05, 0.15, 0.28, 0.4],
        'bustProject':  [0.0, 0.25, 0.5, 0.9],
        'hemDip':       [0.5, 1, 2, 3.5],
        'shoulderSlope':[1.2, 1.6, 2.0],
        'yokeDrop':     [9, 13, 18, 24, 30],
        'length':       ['mini', 'midi'],
        'foldCount':    [6, 10, 14],
        'hemWave':      [0.5, 1, 1.8],
        'strapLen':     [2, 4, 7],       # band-top üst kenar yüksekliği
        'bustHeight':   [0.15, 0.3, 0.5],
    }
    best, bestd = dict(cur), d0
    for round_i in range(2):
        for k, vals in KNOBS.items():
            for v in vals:
                cand = dict(best); cand[k] = v
                try:
                    m = render(style, cand, '/tmp/fit-cand.png')
                except subprocess.CalledProcessError:
                    continue
                if not m: continue
                d, _ = dist(gold, m)
                if d < bestd - 1e-4:
                    bestd, best = d, cand
        print(f'tur {round_i+1}: mesafe {round(bestd,4)} | {json.dumps({k:v for k,v in best.items() if k not in ("inkAsym",)})}')

    after = os.path.join(outdir, 'sonra.png')
    mA = render(style, best, after)
    dA, detA = dist(gold, mA)
    print('SONUÇ mesafe:', round(dA,4), detA, '(başlangıç', round(d0,4), ')')

    overlay(mask_of(golden_arg, crop), mask_of(first), os.path.join(outdir, 'bindirme_ONCE.png'))
    overlay(mask_of(golden_arg, crop), mask_of(after), os.path.join(outdir, 'bindirme_SONRA.png'))
    json.dump({'golden': golden_arg, 'style': style, 'once': det0, 'sonra': detA,
               'mesafe_once': d0, 'mesafe_sonra': dA, 'learned': best},
              open(os.path.join(outdir, 'learned.json'), 'w'), indent=1)
    print('çıktı:', outdir, '(bindirme_ONCE/SONRA.png, learned.json)')


if __name__ == '__main__':
    main()
