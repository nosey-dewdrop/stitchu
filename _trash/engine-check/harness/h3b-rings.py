#!/usr/bin/env python3
# ============================================================================
# H3b-RINGS — L3b SINIR TESTİ: bel halkası tek sayı mı?
# Bir specification.json'daki HALKA BİRLEŞİMLERİNİ ölçer: gövde alt kenarı ↔
# kemer üstü ↔ etek üstü. Her birleşimin iki yakası toplamda TOL_MM içinde
# olmalı. 2.95mm / 17-kombinasyon arızası (Logs/paket-2026-08-06) tam bu
# delikten kaçmıştı: walk.py dikişleri tek tek yargılıyordu, halka TOPLAMINI
# kimse tutmuyordu. Bu test kontrat çıktısını okur (spec), üreticinin içini
# okumaz — FAIL ⇒ arıza L3b'de (walk/printpack aklanır).
# Kullanım: python3 h3b-rings.py <spec.json> [--tol-mm 1.0]
# ============================================================================
import json, sys, argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'engine/pattern-bridge'))
from walk import edge_length_mm, panel_role  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('spec')
ap.add_argument('--tol-mm', type=float, default=1.0)
args = ap.parse_args()

spec = json.loads(Path(args.spec).read_text())
pat = spec['pattern'] if 'pattern' in spec else spec
panels, stitches = pat['panels'], pat['stitches']

def grup(pa, pb):
    ra, rb = panel_role(pa), panel_role(pb)   # walk.panel_role: torso / wb / skirt / sleeve...
    key = tuple(sorted([ra, rb]))
    if key == ('torso', 'wb'): return 'govde↔kemer'
    if key == ('skirt', 'wb'): return 'kemer↔etek'
    if key == ('skirt', 'torso'): return 'govde↔etek'
    return None

toplam = {}
for st in stitches:
    sides = st if isinstance(st, list) else st.get('sides', st)
    try:
        (pa, ea), (pb, eb) = [(s['panel'], s['edge']) for s in sides[:2]]
    except Exception:
        continue
    g = grup(pa, pb)
    if not g: continue
    la = edge_length_mm(panels[pa], panels[pa]['edges'][ea])
    lb = edge_length_mm(panels[pb], panels[pb]['edges'][eb])
    t = toplam.setdefault(g, [0.0, 0.0, 0])
    # yaka ataması: alfabetik değil ROL — üst katman (gövde/kemer-üstü) A yakası
    ra = panel_role(pa)
    if ra == 'torso' or (ra == 'wb' and panel_role(pb) == 'skirt'):
        t[0] += la; t[1] += lb
    else:
        t[0] += lb; t[1] += la
    t[2] += 1

if not toplam:
    print('H3b-rings: bu spec halka birleşimi taşımıyor (tek parça?) — yargı yok'); sys.exit(0)

fails = []
for g, (a, b, n) in sorted(toplam.items()):
    fark = a - b
    durum = 'OK' if abs(fark) <= args.tol_mm else 'FAIL'
    if durum == 'FAIL': fails.append(g)
    print(f'{durum}  {g:14s} üst {a:9.2f}mm  alt {b:9.2f}mm  fark {fark:+7.3f}mm  ({n} dikiş, tol ±{args.tol_mm})')

if fails:
    print(f'\nH3b-rings FAIL: halka toplamı tutmuyor → arıza L3b (üreteç/mapping); '
          f'walk.py ve printpack.py AKLANDI (onlar dikişi tek tek ölçer, halkayı değil)')
    sys.exit(1)
print('\nH3b-rings OK: tüm halka birleşimleri tek sayıda buluşuyor')
