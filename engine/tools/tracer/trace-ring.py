#!/usr/bin/env python3
"""trace-ring v3 — Buğra A0 rasterinden TEK BEDEN halkası izleme + mm bağlama
(2026-07-28 gece, PIPELINE Aşama 3 malzemesi; CLAUDE.md açık iş 2).

8 beden renk-kodlu nested halkadan SEÇİLEN bedenin halkasını RENK ayrımıyla
izole eder ("8-halkadan tek beden seçimi" açık işi) ve merkez-çizgiden ölçer —
dış-sınır izlemesinin çentik-dolaşım şişmesi (72dpi turunda +%47) bu yolla ölür.
mm kesin: A0'da 1px = (72/dpi) pt, mm = pt × 25.4/72.

ÖĞRENİLEN GERÇEKLER (2026-07-28 gece, ölçümle):
- Rasterizasyon -aaVector no İSTER: antialias komşu halkalardan SAHTE renk
  üretir (AA'da "48 pembesi" sanılan pikseller 46-magenta × 34-kırmızı
  karışımıydı). AA kapalıyken renkler PDF değerinin birebir kendisi.
- En büyük beden (48) sayfada KENDİ renginde çizilmiyor; 34-46 renkli var.
- Sayfa çerçevesi = geometri JSON çerçevesi (offset 0,0; y ters:
  y_px = H - y_mm*s). Grid aramayla doğrulandı (Front Body %88 kapsama).
- Halka, üstte çizilen diğer bedenlerin çakışan bölümlerinde ÖRTÜLÜR
  (painter's algorithm) → kendi renginde boşluklar. Dilate-kaynatma denemesi
  BATTI: yakınsama bölgelerinde komşu halkalar 1mm'e iner, kaynak onları
  eritip ağ kurdu (collar denemesi). Doğru yol: PARÇA KÖPRÜLEME — yalnız
  kendi renk parçaları izlenir, truth poligonunun yay-uzunluğuna göre
  sıralanır, boşluklar DÜZ köprüyle kapanır; ölçülü mm ile köprü mm AYRI
  raporlanır (truth yalnız sıralama/kimlik; ölçülen sayı raster pikseli).

kullanım: trace-ring.py <raster.png> <pattern> <piece> <size> [overlay.png] [dump.json]
dump.json (2026-07-28, köprü v1): izlenen halkanın mm kontur dökümü —
ölçülü parça polyline'ları (rdp 1.5, mm'e çevrili; ÇEVRE HESABIYLA AYNI veri)
+ köprü segmentleri AYRI işaretli, sayfa-mm çerçevesinde (geometry-full.json
ile aynı: x sağa, y yukarı). tracer→reçete köprüsünün (ring2recipe.py) girdisi.
LLM yok, tahmin yok — deterministik görüntü işleme.
"""
import sys, os, json
import numpy as np
from PIL import Image, ImageDraw

Image.MAX_IMAGE_PIXELS = None

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
GEOM = os.path.join(REPO, 'patterns_real', 'geometry', 'geometry-full.json')
PAGE_W_MM = 821.0      # A0 MediaBox (her iki Buğra PDF'i, defter kanıtı)
COLOR_TOL = 12         # aa kapalı: renkler birebir
CORR_OWN_MM = 2.5      # lokalizasyon koridoru (aynı renk komşu parçalarda da var)
MIN_FRAG_PX = 12       # kırıntı eşiği

from importlib import util as _u
_spec = _u.spec_from_file_location('tf', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'trace-flat.py'))
_tf = _u.module_from_spec(_spec)
_orig_argv, sys.argv = sys.argv, [sys.argv[0]]
_spec.loader.exec_module(_tf)
sys.argv = _orig_argv
thin, rdp, paths_from_skeleton = _tf.thin, _tf.rdp, _tf.paths_from_skeleton

NB8 = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]


def components8(mask):
    from collections import deque
    H, W = mask.shape
    lab = np.zeros((H, W), bool)
    comps = []
    for sy, sx in zip(*np.nonzero(mask)):
        if lab[sy, sx]:
            continue
        comp = [(sy, sx)]; lab[sy, sx] = True; q = deque(comp)
        while q:
            cy, cx = q.popleft()
            for dy, dx in NB8:
                ny, nx = cy+dy, cx+dx
                if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = True; q.append((ny, nx)); comp.append((ny, nx))
        comps.append(comp)
    return comps


def plen(xy):
    return sum(np.hypot(xy[i+1][0]-xy[i][0], xy[i+1][1]-xy[i][1]) for i in range(len(xy)-1))


def main():
    raster, pattern, piece, size = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    overlay = sys.argv[5] if len(sys.argv) > 5 else None
    dumppath = sys.argv[6] if len(sys.argv) > 6 else None
    d = json.load(open(GEOM))
    rs = [r for r in d['rings'] if r['pattern'] == pattern and r['piece'] == piece
          and r.get('sizeGuess') == size]
    if not rs:
        print(f'HATA: truth ring yok ({pattern}/{piece}/{size})'); return 1
    r = rs[0]
    col = np.array([round(float(c) * 255) for c in r['pdfStrokeColor'].split()])
    truth = (r['wMM'], r['hMM'], r['perimMM'])
    poly = np.array(r['polygon'])
    im = Image.open(raster).convert('RGB')
    W, H = im.size
    s = W / PAGE_W_MM
    mmpp = 1.0 / s
    pxs, pys = poly[:, 0] * s, H - poly[:, 1] * s    # sayfa mm -> px (y ters, offset 0)
    m = 60
    x0, x1 = max(0, int(pxs.min())-m), min(W, int(pxs.max())+m)
    y0, y1 = max(0, int(pys.min())-m), min(H, int(pys.max())+m)
    a = np.asarray(im.crop((x0, y0, x1, y1))).astype(np.int16)
    own_raw = np.abs(a - col.reshape(1, 1, 3)).max(axis=2) < COLOR_TOL
    cpts = [(float(px-x0), float(py-y0)) for px, py in zip(pxs, pys)]
    corr = Image.new('L', (x1-x0, y1-y0), 0)
    ImageDraw.Draw(corr).line(cpts + [cpts[0]], fill=255, width=max(3, int(2*CORR_OWN_MM*s)))
    own = own_raw & (np.asarray(corr) > 0)
    # parçalar: kendi renk bileşenleri -> iskelet -> polyline'lar
    frags = []
    for comp in components8(own):
        if len(comp) < MIN_FRAG_PX:
            continue
        ys_ = [p[0] for p in comp]; xs_ = [p[1] for p in comp]
        by0, by1, bx0, bx1 = min(ys_)-2, max(ys_)+3, min(xs_)-2, max(xs_)+3
        sub = np.zeros((by1-by0, bx1-bx0), np.uint8)
        for py, px in comp:
            sub[py-by0, px-bx0] = 1
        S = thin(sub)
        for pa in paths_from_skeleton(S):
            xy = [(p[1]+bx0, p[0]+by0) for p in pa]
            if plen(xy) >= MIN_FRAG_PX:
                frags.append(xy)
    if not frags:
        print('HATA: parça yok'); return 1
    # truth yay-uzunluğu parametrizasyonu (yalnız SIRALAMA için).
    # İzdüşüm SEGMENTE yapılır, köşeye değil: uzun düz kenarda (2 köşe) köşe
    # izdüşümü bütün parçaları aynı köşe çiftine eşleyip birleştirmede
    # yutturuyordu (Upper Sleeve 'parça 1' batışının kökü).
    P = np.array(cpts)
    Q = np.vstack([P, P[:1]])
    dP = np.diff(Q, axis=0)
    seg = np.hypot(dP[:, 0], dP[:, 1])
    seg[seg < 1e-9] = 1e-9
    cum = np.concatenate([[0.0], np.cumsum(seg)])[:-1]
    L = float(cum[-1] + seg[-1])
    def tpos(pt):
        rel = np.array(pt) - Q[:-1]
        u = np.clip((rel[:, 0]*dP[:, 0] + rel[:, 1]*dP[:, 1]) / (seg*seg), 0.0, 1.0)
        proj = Q[:-1] + u[:, None]*dP
        dd = np.hypot(proj[:, 0]-pt[0], proj[:, 1]-pt[1])
        i = int(np.argmin(dd))
        return float(cum[i] + u[i]*seg[i]), float(dd[i])
    # SIRALAMA: orta-nokta izdüşümü + FİZİKSEL uzunlukla bağlı aralık.
    # Uç-nokta aralığı iki tuzağa düşdü: (a) köşe-izdüşümü düz kenarda herkesi
    # aynı köşeye eşledi, (b) parametrizasyon dikişini (t=0) kesen minik parça
    # [~0, ~L] aralığına yayılıp birleştirmede her şeyi yuttu. Bir halka
    # parçasının yay kapsamı kendi uzunluğunu aşamaz — aralık = t_mid ± len/2.
    items = []
    dropped = 0
    for xy in frags:
        t0, _ = tpos(xy[0]); t1, _ = tpos(xy[-1])
        # yönlendirme: dairesel ileri mesafe L/2'yi aşıyorsa ters çevir
        if (t1 - t0) % L > L / 2:
            xy = xy[::-1]; t0, t1 = t1, t0
        ln = plen(xy)
        # DİK-ÖĞE FİLTRESİ: çentik tiki / işaret halkayı DİK keser —
        # uzunluğu var, uçlarının dairesel yay açıklığı ~0.
        span = min((t1 - t0) % L, (t0 - t1) % L)
        if ln > 3.0 * (span + 8.0):
            dropped += 1
            continue
        tm, _ = tpos(xy[len(xy)//2])
        items.append((tm - ln/2.0, tm + ln/2.0, xy))
    items.sort(key=lambda it: (it[0], it[1]))
    # ÖRTÜŞME BİRLEŞTİRME: öncekinin aralığında tamamen kalan kısa parçayı at
    merged = []
    for it in items:
        if (merged and it[0] >= merged[-1][0] - 2.0 and it[1] <= merged[-1][1] + 2.0
                and (merged[-1][1] - merged[-1][0]) >= (it[1] - it[0])):
            continue
        merged.append(it)
    items = merged
    # sırayla köprüle
    loop = []
    meas_px = 0.0
    bridges = []
    for t0, t1, xy in items:
        if loop:
            bridges.append((loop[-1], xy[0]))
        loop.extend(xy)
        meas_px += plen(rdp(xy, 1.5))
    bridges.append((loop[-1], loop[0]))   # kapanış köprüsü
    bridge_px = sum(np.hypot(b[0]-a2[0], b[1]-a2[1]) for a2, b in bridges)
    allx = [p[0] for it in items for p in it[2]]
    ally = [p[1] for it in items for p in it[2]]
    bw = (max(allx) - min(allx)) * mmpp
    bh = (max(ally) - min(ally)) * mmpp
    per = (meas_px + bridge_px) * mmpp
    covm = meas_px * mmpp
    brm = bridge_px * mmpp
    print(f'{pattern} | {piece} | beden {size} | renk {tuple(int(c) for c in col)} | '
          f'kendi px {int(own.sum())} | parça {len(items)} (+{dropped} dik-öğe atıldı) | köprü {len(bridges)}')
    print(f'ÖLÇÜM  w {bw:8.2f} | h {bh:8.2f} | çevre {per:9.1f} mm '
          f'(ölçülü {covm:.1f} + köprü {brm:.1f} = %{100*brm/per:.1f} köprü)')
    print(f'GERÇEK w {truth[0]:8.2f} | h {truth[1]:8.2f} | çevre {truth[2]:9.1f} mm (vektör)')
    print(f'SAPMA  w {100*(bw-truth[0])/truth[0]:+7.2f}% | h {100*(bh-truth[1])/truth[1]:+7.2f}% | '
          f'çevre {100*(per-truth[2])/truth[2]:+7.2f}%')
    if overlay:
        ov = im.crop((x0, y0, x1, y1)).convert('RGB')
        dr = ImageDraw.Draw(ov)
        for _, _, xy in items:
            dr.line([(float(px), float(py)) for px, py in xy], fill=(0, 0, 0), width=6)
        for a2, b in bridges:
            dr.line([(float(a2[0]), float(a2[1])), (float(b[0]), float(b[1]))],
                    fill=(255, 0, 0), width=4)
        sc = 800.0 / max(ov.size)
        if sc < 1:
            ov = ov.resize((int(ov.size[0]*sc), int(ov.size[1]*sc)))
        os.makedirs(os.path.dirname(overlay) or '.', exist_ok=True)
        ov.save(overlay)
        print('overlay:', overlay)
    if dumppath:
        # sayfa-mm çerçevesi (geometry-full.json ile aynı): x sağa, y yukarı.
        # ölçülü segment = rdp(1.5) polyline (ÇEVRE hesabıyla birebir aynı veri);
        # köprü segment = 2 nokta düz çizgi. 4 ondalık: 288dpi pikseli 0.0882mm,
        # 1e-4 mm kayıpsız.
        def mm(pt):
            return [round((x0 + pt[0]) * mmpp, 4), round((H - (y0 + pt[1])) * mmpp, 4)]
        segs = []
        prev_end = None
        for _, _, xy in items:
            simp = rdp(xy, 1.5)
            if prev_end is not None:
                segs.append({'kind': 'bridge', 'pts': [mm(prev_end), mm(simp[0])]})
            segs.append({'kind': 'measured', 'pts': [mm(p) for p in simp]})
            prev_end = simp[-1]
        first = rdp(items[0][2], 1.5)[0]
        segs.append({'kind': 'bridge', 'pts': [mm(prev_end), mm(first)]})
        dump = {
            'tool': 'trace-ring v3 dump (köprü v1)',
            'pattern': pattern, 'piece': piece, 'size': size,
            'raster': os.path.basename(raster), 'mmPerPx': round(mmpp, 6),
            'strokeColor': [int(c) for c in col],
            'summaryMM': {'w': round(bw, 2), 'h': round(bh, 2),
                          'perim': round(per, 1), 'measured': round(covm, 1),
                          'bridge': round(brm, 1)},
            'truthMM': {'w': truth[0], 'h': truth[1], 'perim': truth[2]},
            'frame': 'page mm, x right, y up (geometry-full.json ile ayni)',
            'segments': segs,
        }
        os.makedirs(os.path.dirname(dumppath) or '.', exist_ok=True)
        with open(dumppath, 'w') as f:
            json.dump(dump, f, separators=(',', ':'))
            f.write('\n')
        print('dump:', dumppath)
    return 0


if __name__ == '__main__':
    sys.exit(main())
