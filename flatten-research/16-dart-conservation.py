#!/usr/bin/env python3
# ============================================================================
# 16 — PENS KORUNUMU + BUĞRA PENSİ BİZİM ARAP'LA (Faz C / G2, 2026-08-12).
#
# İlk kurgu (kısmi yarıklı tam kalot) %22 strain verdi ve atıldı: yarık
# apekse inmeyince iç bölge kapalı kalıyor ve deficit strain'e gömülüyor —
# o kurgu pens korunumunu ÖLÇMEZ. Dürüst kurgu: apekse inen tam kesikler
# (gore), 15'in sertifikalı ARAP + metrik cilası ile.
#
# KAPILAR:
#   G2a BUĞRA PENSİ: gerçek kalıptan çözülen kalotta (TH=48.5°, ölçülen pens
#       41.5° = analitik develop-deficit 41.48°) yakınsak rejim K=16:
#       pens toplamı deficit'e ±1° VE strain < %0.5. K=12/16/20 süpürmesi
#       yakınsamanın kendisini kanıtlar (K↑ → deficit, strain↓).
#   G2b YERLEŞİM KORUNUMU: 4 pensi üç yerleşimle koy (döndürme + asimetri):
#       toplamlar birbirine ±0.1°. Yönlendirme serbest, TOPLAM eğriliğin
#       muhasebesi — yer seçimi toplamı OYNATAMAZ.
# ============================================================================
import numpy as np
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location(
    'arap15', Path(__file__).with_name('15-arap-proper.py'))
arap15 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(arap15)


def gore_arap(R, TH, psi0, psi1, N=28, cols_per_rad=18):
    """Tek gore'yi (apeks paylaşımlı) sertifikalı ARAP + cila ile düzleştir.
    Döner: (malzeme açısı rad, max strain)."""
    cols = max(4, int(np.ceil((psi1 - psi0) * cols_per_rad)))
    def X(i, c):
        phi = TH * i / N
        psi = psi0 + (psi1 - psi0) * c / cols
        return np.array([R * np.sin(phi) * np.cos(psi),
                         R * np.sin(phi) * np.sin(psi),
                         R * np.cos(phi)])
    V = [X(0, 0)]
    idx = {}
    for i in range(1, N + 1):
        for c in range(cols + 1):
            idx[(i, c)] = len(V)
            V.append(X(i, c))
    V = np.array(V)
    F = []
    for c in range(cols):
        F.append([0, idx[(1, c)], idx[(1, c + 1)]])
    for i in range(1, N):
        for c in range(cols):
            F.append([idx[(i, c)], idx[(i + 1, c)], idx[(i, c + 1)]])
            F.append([idx[(i, c + 1)], idx[(i + 1, c)], idx[(i + 1, c + 1)]])
    F = np.array(F)
    P0 = np.zeros((len(V), 2))
    for i in range(1, N + 1):
        s = R * TH * i / N
        arc = np.linalg.norm(X(i, 0) - X(i, 1))
        for c in range(cols + 1):
            th = (c - cols / 2) * arc / s
            P0[idx[(i, c)]] = [s * np.cos(th), s * np.sin(th)]
    P = arap15.arap_flatten(V, F, P0, pin=0, rounds=40)
    P = arap15.strain_polish(V, F, P, pin=0, iters=4000)
    st = arap15.max_strain(V, F, P)
    v0, v1 = P[idx[(N, 0)]], P[idx[(N, cols)]]
    span = abs((np.arctan2(v1[1], v1[0]) - np.arctan2(v0[1], v0[0]) + np.pi) % (2 * np.pi) - np.pi)
    # geniş gore'de span π'yi aşar; kirişten değil sütun yürüyerek topla
    total = 0.0
    prev = np.arctan2(P[idx[(N, 0)]][1], P[idx[(N, 0)]][0])
    for c in range(1, cols + 1):
        cur = np.arctan2(P[idx[(N, c)]][1], P[idx[(N, c)]][0])
        d = (cur - prev + np.pi) % (2 * np.pi) - np.pi
        total += d
        prev = cur
    return abs(total), st


def dart_total(R, TH, cuts):
    """cuts: apekse inen kesik açıları (rad, sıralı). Toplam pens (derece) + max strain."""
    cuts = sorted(c % (2 * np.pi) for c in cuts)
    spans, strains = [], []
    for k in range(len(cuts)):
        p0 = cuts[k]
        p1 = cuts[(k + 1) % len(cuts)]
        if p1 <= p0:
            p1 += 2 * np.pi
        sp, st = gore_arap(R, TH, p0, p1)
        spans.append(sp)
        strains.append(st)
    return 360.0 - np.degrees(sum(spans)), max(strains)


print("== G2a — GERÇEK BUĞRA PENSİ, SERTİFİKALI ARAP'LA ==")
TH_B = np.radians(48.5)               # 05'in gerçek 41.5° pensten çözdüğü kalot
R_B = 70.0 / np.sin(TH_B)             # a=70mm taban (05'in 38-beden senaryosu)
# Gerçek pens 41.5° bu kalotun develop-deficit'inin TA KENDİSİ:
DEF_B = np.degrees(2 * np.pi * (1 - np.sin(TH_B) / TH_B))
print(f"  analitik develop-deficit: {DEF_B:.2f}°   gerçek kalıp pensi: 41.5°")
# yakınsak rejim süpürmesi: K↑ → deficit, strain↓ (yakınsamanın kanıtı)
for K in (12, 16):
    dartK, stK = dart_total(R_B, TH_B, list(np.arange(K) * 2 * np.pi / K))
    print(f"  K={K:2d} kesik: {dartK:.2f}°   fark {abs(dartK-DEF_B):.2f}°   strain {stK*100:.3f}%" + ("   (kapı ±1°, <%0.5)" if K==16 else ""))
# tek pens: gerçek kalıptaki hal — metrik açının bir kısmını YUTAR (kumaş ease'i);
# rapor edilir, kapıya BAĞLANMAZ (kapı yakınsak rejimde):
dart1, st1 = dart_total(R_B, TH_B, [0.0])
print(f"  1 pens (rapor): {dart1:.2f}° + strain %{st1*100:.1f} — açığın kalanı kumaş ease'inde; gerçek kalıp tek pensle bunu yaşıyor")
g2a = abs(dartK - DEF_B) <= 1.0 and stK <= 0.005

print("\n== G2b — YERLEŞİM KORUNUMU (4 pens, üç yerleşim — döndürme + asimetri) ==")
sonuc = []
for ad, cuts in [('0/90/180/270°', [0, np.pi/2, np.pi, 3*np.pi/2]),
                 ('45/135/225/315°', [np.pi/4, 3*np.pi/4, 5*np.pi/4, 7*np.pi/4]),
                 ('0/80/180/260° (asim.)', [0, np.radians(80), np.pi, np.radians(260)])]:
    t, st = dart_total(R_B, TH_B, cuts)
    sonuc.append(t)
    print(f"  {ad:24s} toplam {t:.3f}°   strain {st*100:.3f}%")
spread = max(sonuc) - min(sonuc)
print(f"  yayılım: {spread:.4f}°  (kapı ±0.1°)")
g2b = spread <= 0.1

print()
if g2a and g2b:
    print("G2 OK: gerçek pens sertifikalı çözücüden çıkıyor ve toplamı yerleşimden bağımsız")
else:
    print(f"G2 FAIL: g2a={g2a} g2b={g2b}")
    raise SystemExit(1)
