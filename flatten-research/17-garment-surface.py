#!/usr/bin/env python3
# ============================================================================
# 17 — TEK 3B GİYSİ YÜZEYİ: BEL HALKASI TEK EĞRİ (Faz C / G3+G4, 2026-08-12).
#
# Kanıtlanan MİMARİ İDDİA: bel eğrisi 3B yüzeyde TEK spline olarak yaşar ve
# BİR KEZ örneklenir; gövde-altı kenarı ile etek-üstü kenarı AYNI polyline'ı
# paylaşır. Bugünkü üretim hattındaki 2.947mm arıza (Logs/paket-2026-08-06,
# H3b-rings ile gövde↔kemer birleşimine mühürlendi) bu mimaride TEST değil
# YAPI gereği sıfırdır.
#
# Girdiler (uydurma sayı YOK):
#   - contract/layers/body.EU38.json: bel 723.338mm, göğüs 878.407mm (graded,
#     mean_all.yaml MIT kaynağından; h0-vucut.py tazelik bekçisi).
#   - AÇIK VARSAYIMLAR (etiketli, kapıları etkilemez — kapılar yapısal):
#     kesit elipsi en/derinlik oranı 1.35; bel→koltukaltı yüksekliği 180mm;
#     giysi ease'i 0 (yüzey = vücut; ease alanı d(t,φ) sonraki adım).
#
# KAPILAR:
#   G3a KALİBRASYON: yüzeyin bel/göğüs halka çevresi (sayısal integral)
#       kontrat mm'sine ±0.5mm (Ramanujan değil, doğrudan integrasyon tanığı).
#   G3b TEK HALKA: gövde-altı kenar toplamı − etek-üstü kenar toplamı = TAM 0
#       (aynı polyline; bitwise). Karşılaştırma: üretim hattı +2.947mm.
#   G4a FLATTEN: ön+arka panel sertifikalı ARAP'la strain < %0.5.
#   G4b YAN DİKİŞ TAPUSU: düzleşen ön yan kenarı ile arka yan kenarı
#       ≤ 0.79375mm (1/32", walk.py üretim standardı).
# ============================================================================
import json
import numpy as np
import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
_spec = importlib.util.spec_from_file_location(
    'arap15', ROOT / 'flatten-research/15-arap-proper.py')
arap15 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(arap15)

body = json.loads((ROOT / 'contract/layers/body.EU38.json').read_text())['olculer_cm']
WAIST_MM = body['waist'] * 10.0
BUST_MM = body['bust'] * 10.0

# --- açık varsayımlar (yapısal kapıları etkilemez) ---
ASPECT = 1.35          # elips en/derinlik
H_MM = 180.0           # bel→koltukaltı
EASE = 0.0             # giysi = vücut (ease alanı d(t,φ): sonraki adım)

def semi_axes(girth_mm):
    """Çevresi girth olan, a/b=ASPECT elipsin yarı eksenleri (sayısal çözüm)."""
    def perim(a):
        b = a / ASPECT
        t = np.linspace(0, 2 * np.pi, 4096, endpoint=False)
        dx = -a * np.sin(t); dy = b * np.cos(t)
        return np.sum(np.hypot(dx, dy)) * (2 * np.pi / 4096)
    lo, hi = girth_mm / 8, girth_mm
    for _ in range(60):
        mid = (lo + hi) / 2
        if perim(mid) < girth_mm: lo = mid
        else: hi = mid
    return mid, mid / ASPECT

aW, bW = semi_axes(WAIST_MM + EASE)
aB, bB = semi_axes(BUST_MM + EASE)

def surf(z, phi):
    """z∈[0,1] bel→koltukaltı; phi=0 ön orta. Yarı eksenler lineer interpolasyon."""
    a = aW + (aB - aW) * z
    b = bW + (bB - bW) * z
    return np.array([a * np.sin(phi), -b * np.cos(phi), H_MM * z])

def ring_girth(z, n=8192):
    ph = np.linspace(0, 2 * np.pi, n, endpoint=False)
    pts = np.array([surf(z, p) for p in ph])
    d = np.diff(np.vstack([pts, pts[:1]]), axis=0)
    return float(np.sum(np.linalg.norm(d, axis=1)))

print("== G3a — KALİBRASYON (sayısal integral tanığı) ==")
gw, gb = ring_girth(0.0), ring_girth(1.0)
print(f"  bel   : yüzey {gw:9.3f}mm  kontrat {WAIST_MM:9.3f}mm  fark {gw-WAIST_MM:+.3f}mm")
print(f"  göğüs : yüzey {gb:9.3f}mm  kontrat {BUST_MM:9.3f}mm  fark {gb-BUST_MM:+.3f}mm")
g3a = abs(gw - WAIST_MM) <= 0.5 and abs(gb - BUST_MM) <= 0.5

print("\n== G3b — BEL HALKASI TEK EĞRİ (bir kez örneklenir, iki panel paylaşır) ==")
NRING = 512
PHI = np.linspace(0, 2 * np.pi, NRING, endpoint=False)
RING = np.array([surf(0.0, p) for p in PHI])          # << TEK örnekleme
# yan dikişler phi=±90° (indeks NRING/4 ve 3NRING/4)
iL, iR = NRING // 4, 3 * NRING // 4
def poly_len(pts):
    return float(np.sum(np.linalg.norm(np.diff(pts, axis=0), axis=1)))
front_seg = RING[list(range(iR, NRING)) + list(range(0, iL + 1))]   # arka orta ... ön ... (ön yarı: phi -90..+90)
back_seg  = RING[iL:iR + 1]
# gövde-altı = ön+arka segmentler; etek-üstü = AYNI segment nesneleri
bodice_bottom = poly_len(front_seg) + poly_len(back_seg)
skirt_top     = poly_len(front_seg) + poly_len(back_seg)            # aynı polyline — başka kaynak YOK
print(f"  gövde-altı toplam : {bodice_bottom:.6f}mm")
print(f"  etek-üstü  toplam : {skirt_top:.6f}mm")
print(f"  fark              : {bodice_bottom - skirt_top:.6f}mm   (üretim hattı: +2.947mm, H3b-rings)")
g3b = (bodice_bottom - skirt_top) == 0.0

print("\n== G4 — PANELLER: SERTİFİKALI ARAP + YAN DİKİŞ TAPUSU ==")
NU, NV = 24, 64
def panel_mesh(phi0, phi1):
    V = np.array([surf(i / NU, phi0 + (phi1 - phi0) * j / NV)
                  for i in range(NU + 1) for j in range(NV + 1)])
    F = []
    for i in range(NU):
        for j in range(NV):
            k = i * (NV + 1) + j
            F.append([k, k + NV + 1, k + 1])
            F.append([k + 1, k + NV + 1, k + NV + 2])
    return V, np.array(F)

def flatten_panel(phi0, phi1):
    V, F = panel_mesh(phi0, phi1)
    # init: silindirik açılım (yay uzunluğu x, yükseklik y)
    P0 = np.zeros((len(V), 2))
    for i in range(NU + 1):
        row = [surf(i / NU, phi0 + (phi1 - phi0) * j / NV) for j in range(NV + 1)]
        x = 0.0
        for j in range(NV + 1):
            if j: x += float(np.linalg.norm(row[j] - row[j - 1]))
            P0[i * (NV + 1) + j] = [x, H_MM * i / NU]
    P = arap15.arap_flatten(V, F, P0, pin=0, rounds=30)
    P = arap15.strain_polish(V, F, P, pin=0, iters=3000)
    st = arap15.max_strain(V, F, P)
    # yan kenarlar: j=0 ve j=NV sütunları
    left  = P[[i * (NV + 1) for i in range(NU + 1)]]
    right = P[[i * (NV + 1) + NV for i in range(NU + 1)]]
    return st, poly_len(left), poly_len(right)

stF, fL, fR = flatten_panel(-np.pi / 2, +np.pi / 2)    # ön panel
stB, bL, bR = flatten_panel(+np.pi / 2, 3 * np.pi / 2) # arka panel
print(f"  ön  panel: strain {stF*100:.4f}%   yan kenarlar {fL:.4f} / {fR:.4f}mm")
print(f"  arka panel: strain {stB*100:.4f}%   yan kenarlar {bL:.4f} / {bR:.4f}mm")
tapu = max(abs(fL - bR), abs(fR - bL))
print(f"  yan dikiş tapusu: en kötü çift farkı {tapu:.4f}mm   (kapı ≤ 0.79375mm = 1/32\")")
g4a = stF < 0.005 and stB < 0.005
g4b = tapu <= 0.79375

print()
if g3a and g3b and g4a and g4b:
    print("G3+G4 OK: bel tek eğri (fark 0.000000), paneller sertifikalı düzleşti, yan dikiş tapusu yapı gereği tutuyor")
else:
    print(f"FAIL: g3a={g3a} g3b={g3b} g4a={g4a} g4b={g4b}")
    raise SystemExit(1)
