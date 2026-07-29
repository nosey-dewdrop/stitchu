#!/usr/bin/env python3
# 09 — GERCEK Bugra Locket size-38 parcalarindan LANDMARK cikarimi (kanit uretir, tahmin etmez).
#
# KAYNAK DUZELTMESI: 08 'ring-trace-locket-front-38.json' kullandi; o dosya RASTER trace ve
# 1626mm cevresinin 652mm'i "bridge" (duz-cizgi tahmini) = %40 uydurma. Dogru kaynak
# 'patterns_real/geometry/geometry-full.json' — dogrudan PDF icerik akisindan (vektor, mm-kalibre).
# Front-38 cevresi orada 1686mm. Bu dosya SADECE vektor kaynagi kullanir.
#
# NE YAPAR: her parcanin size-38 halkasini alir, 1mm'de yeniden ornekler, donus-acisiyla KOSE
# (landmark) noktalarini bulur, kenar tablosunu (kose->kose yay + kiris) basar, ve gorsel
# denetim icin etiketli PNG panel uretir. Landmark ATAMASI (hangi kenar oyuk/omuz/yan dikis)
# bir sonraki adimda GOZLE + sayiyla dogrulanir; bu dosya olcumu verir.
import json, math, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = "/Users/damummyphus/damla_projects_2026/stitchu"
GEOM = ROOT + "/patterns_real/geometry/geometry-full.json"
SIZE = "38"
PATTERN = "locket_top"
PIECES = ["Front Body", "Back Body", "Upper Sleeve", "Lower Sleeve", "EXTRA-TL (not in defter)"]

# --------------------------------------------------------------- yardimcilar
def resample(P, step=1.0):
    """kapali poligonu esit arc-length adimlarina yeniden ornekle."""
    P = np.asarray(P, float)
    if np.hypot(*(P[0] - P[-1])) > 1e-9:
        P = np.vstack([P, P[0]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    keep = np.concatenate([[True], seg > 1e-9])
    P = P[keep]
    if np.hypot(*(P[0] - P[-1])) > 1e-9:
        P = np.vstack([P, P[0]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    arc = np.concatenate([[0], np.cumsum(seg)])
    L = arc[-1]
    s = np.arange(0, L, step)
    X = np.interp(s, arc, P[:, 0]); Y = np.interp(s, arc, P[:, 1])
    return np.column_stack([X, Y]), L, s

def turning(Q, base_mm=6.0, step=1.0):
    """her noktada +-base_mm yonler arasi isaretli donus acisi (derece)."""
    m = len(Q); k = max(2, int(round(base_mm / step)))
    t = np.zeros(m)
    for i in range(m):
        a = Q[i] - Q[(i - k) % m]
        b = Q[(i + k) % m] - Q[i]
        t[i] = math.degrees(math.atan2(a[0]*b[1] - a[1]*b[0], a[0]*b[0] + a[1]*b[1]))
    return t

def corners(Q, turn, min_deg=22.0, min_sep_mm=10.0, step=1.0):
    """yerel |donus| maksimumlari = kose adaylari; yakin olanlar birlestirilir."""
    m = len(Q); w = max(2, int(round(min_sep_mm / step)))
    at = np.abs(turn)
    cand = [i for i in range(m) if at[i] >= min_deg and
            at[i] >= max(at[(i + d) % m] for d in range(-w, w + 1)) - 1e-9]
    out = []
    for c in cand:
        if out and min(abs(c - out[-1]), m - abs(c - out[-1])) < w:
            if at[c] > at[out[-1]]: out[-1] = c
        else:
            out.append(c)
    if len(out) > 1 and min(abs(out[0] - out[-1]), m - abs(out[0] - out[-1])) < w:
        out.pop() if at[out[0]] >= at[out[-1]] else out.pop(0)
    return out

def signed_area(P):
    x, y = P[:, 0], P[:, 1]
    return 0.5 * float(np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y))

# --------------------------------------------------------------------- veri
d = json.load(open(GEOM))
rings = {}
for r in d["rings"]:
    if r["pattern"] == PATTERN and r["sizeGuess"] == SIZE and r["ring"] >= 0:
        rings[r["piece"]] = r

print("=" * 96)
print(f"LOCKET size-{SIZE} — VEKTOR kaynak (geometry-full.json, PDF icerik akisi)")
print("=" * 96)

panels = []
for name in PIECES:
    r = rings.get(name)
    if r is None:
        print(f"!! {name}: size-{SIZE} halkasi YOK"); continue
    P = np.array(r["polygon"], float)
    Q, L, s = resample(P, 1.0)
    A = abs(signed_area(np.vstack([Q, Q[0]])))
    t = turning(Q)
    cs = corners(Q, t)
    print(f"\n--- {name} ---  cevre {L:.1f} mm   alan {A/100:.1f} cm2   "
          f"bbox {r['wMM']:.1f}x{r['hMM']:.1f} mm   kapanma-gap {r['closureGapMM']} mm")
    print(f"    {len(cs)} kose (>=22 deg, >=10mm ayrik):")
    print(f"    {'#':>3} {'arc(mm)':>9} {'x':>8} {'y':>8} {'donus':>8}   {'-> sonraki kenar yay':>22} {'kiris':>8}")
    for i, c in enumerate(cs):
        nxt = cs[(i + 1) % len(cs)]
        seg = (nxt - c) % len(Q)
        chord = float(np.hypot(*(Q[nxt] - Q[c])))
        print(f"    {i:>3} {s[c]:>9.1f} {Q[c,0]:>8.1f} {Q[c,1]:>8.1f} {t[c]:>+8.1f}   "
              f"{seg:>22.1f} {chord:>8.1f}")
    panels.append({"name": name, "Q": Q, "corners": cs, "L": L, "turn": t, "s": s})

# ------------------------------------------------------------------- render
if panels:
    SC = 1.5; PAD = 30; GAP = 20
    dims = []
    for p in panels:
        q = p["Q"]; w = q[:,0].max()-q[:,0].min(); h = q[:,1].max()-q[:,1].min()
        dims.append((w, h))
    Wtot = int(sum(w for w, _ in dims) * SC + PAD * 2 * len(panels) + GAP * (len(panels) - 1))
    Htot = int(max(h for _, h in dims) * SC + PAD * 2 + 60)
    img = Image.new("RGB", (Wtot, Htot), "#fdfcf8"); dr = ImageDraw.Draw(img)
    try:
        f1 = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
        f2 = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    except Exception:
        f1 = f2 = ImageFont.load_default()
    xoff = PAD
    for p, (w, h) in zip(panels, dims):
        q = p["Q"]; minx = q[:,0].min(); maxy = q[:,1].max()
        def T(pt): return ((pt[0]-minx)*SC + xoff, (maxy-pt[1])*SC + PAD + 30)
        dr.line([T(pt) for pt in q] + [T(q[0])], fill="#333333", width=2)
        for i, c in enumerate(p["corners"]):
            px, py = T(q[c])
            dr.ellipse([px-5, py-5, px+5, py+5], fill="#cc3311")
            dr.text((px+7, py-9), str(i), fill="#cc3311", font=f2)
        dr.text((xoff, 8), f'{p["name"]}  {p["L"]:.0f}mm  {len(p["corners"])} kose',
                fill="#111111", font=f1)
        xoff += int(w * SC) + PAD * 2 + GAP
    out = ROOT + "/flatten-research/09-locket-38-landmarks.png"
    img.save(out)
    print(f"\nPNG -> {out}")
print("\nNOT: bu pas OLCUM verir. Kenar->anlam atamasi (oyuk/omuz/yan/kapak) gorsel + sayisal")
print("     capraz kontrolle bir sonraki adimda yapilir; TAHMIN yok.")
