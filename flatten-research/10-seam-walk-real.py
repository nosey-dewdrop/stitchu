#!/usr/bin/env python3
# 10 — GERCEK Bugra Locket-38: DIKIS CIZGISI (stitch line) cikarimi + SEAM WALK.
#
# NEDEN: basili kontur KESIM cizgisi. Kanit satIcinin kendi talimatinda (sayfa 3,4,7,8,9,11):
#   "stitch ... with a 1 cm (3/8 inch) seam allowance" — yani dikis cizgisi 10mm ICERIDE.
# Bu KRITIK: oyuk (armhole) ICBUKEY, kol kapagi DISBUKEY. Ayni 10mm oteleme oyugu UZATIR,
# kapagi KISALTIR (offset bir egrinin boyunu d * toplam_donus kadar degistirir, isaret egrilige
# bagli). Yani "kesim cizgisinde olculen ease" YANLIS sayidir. Burada ikisini de hesapliyoruz.
#
# YONTEM (CAD'in yaptigi):
#   1) kapali konturu 1mm'de yeniden ornekle, yonelimi (CW/CCW) isaretli alandan bul
#   2) her noktayi IC normal boyunca 10mm otele
#   3) GECERSIZ offset noktalarini at: gecerli bir offset noktasinin ORIJINAL kontura uzakligi
#      TAM 10mm olmali; ic-bukey/konveks kose ilmeklerinde bu deger kucuk cikar -> at (mesafe-alani budamasi)
#   4) komsu iki dikisin offset cizgilerini KESISTIR (miter) -> gercek dikis-cizgisi kosesi
#   5) her dikisi kendi miter koseleri arasinda olc
#
# CIKTI: her parca icin kenar-kenar kesim vs dikis uzunlugu, ve eslesmesi GEREKEN dikis ciftleri.
import json, math
import numpy as np

ROOT = "/Users/damummyphus/damla_projects_2026/stitchu"
GEOM = ROOT + "/patterns_real/geometry/geometry-full.json"
SIZE = "38"
SA = 10.0          # mm, satici talimatindan (1 cm), TAHMIN DEGIL
STEP = 1.0

# --- landmark atamasi: 09'un kose indekslerinden, GORSEL + sayisal capraz kontrol edildi ---
# (kose sirasi 09 ciktisiyla ayni; anlamlar 09 PNG'si + satici talimat/gorselleriyle dogrulandi)
SEAM_NAMES = {
    "Front Body":   ["yan-dikis-alt", "pens-bacak-1", "pens-bacak-2", "yan-dikis-ust",
                     "OYUK-on", "omuz-on", "yaka-on", "on-orta(CF)", "etek-on"],
    "Back Body":    ["omuz-arka", "OYUK-arka", "yan-dikis-arka", "etek-arka",
                     "arka-orta(CB)", "yaka-arka"],
    "Upper Sleeve": ["uc-A", "UST-kenar(buzgulu)", "uc-B", "ALT-kenar(buzgulu)"],
    "Lower Sleeve": ["uc-A", "KAPAK(oyuga giden)", "uc-B", "ALT-kenar"],
}

# ------------------------------------------------------------------ geometri
def resample(P, step=STEP):
    P = np.asarray(P, float)
    if np.hypot(*(P[0] - P[-1])) > 1e-9: P = np.vstack([P, P[0]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    P = P[np.concatenate([[True], seg > 1e-9])]
    if np.hypot(*(P[0] - P[-1])) > 1e-9: P = np.vstack([P, P[0]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    arc = np.concatenate([[0], np.cumsum(seg)]); L = arc[-1]
    s = np.arange(0, L, step)
    return np.column_stack([np.interp(s, arc, P[:, 0]), np.interp(s, arc, P[:, 1])]), L

def turning(Q, base_mm=6.0):
    m = len(Q); k = max(2, int(round(base_mm / STEP))); t = np.zeros(m)
    for i in range(m):
        a = Q[i] - Q[(i - k) % m]; b = Q[(i + k) % m] - Q[i]
        t[i] = math.degrees(math.atan2(a[0]*b[1]-a[1]*b[0], a[0]*b[0]+a[1]*b[1]))
    return t

def find_corners(Q, turn, min_deg=22.0, min_sep=10.0):
    m = len(Q); w = max(2, int(round(min_sep / STEP))); at = np.abs(turn)
    cand = [i for i in range(m) if at[i] >= min_deg and
            at[i] >= max(at[(i+d) % m] for d in range(-w, w+1)) - 1e-9]
    out = []
    for c in cand:
        if out and min(abs(c-out[-1]), m-abs(c-out[-1])) < w:
            if at[c] > at[out[-1]]: out[-1] = c
        else: out.append(c)
    if len(out) > 1 and min(abs(out[0]-out[-1]), m-abs(out[0]-out[-1])) < w:
        out.pop() if at[out[0]] >= at[out[-1]] else out.pop(0)
    return out

def signed_area(P):
    x, y = P[:, 0], P[:, 1]
    return 0.5*float(np.sum(x*np.roll(y, -1) - np.roll(x, -1)*y))

def inward_offset(Q, d):
    """her noktayi IC normal boyunca d otele + mesafe-alani budamasi (ilmekleri atar)."""
    m = len(Q)
    tang = np.roll(Q, -1, axis=0) - np.roll(Q, 1, axis=0)
    tang /= (np.linalg.norm(tang, axis=1)[:, None] + 1e-12)
    ccw = signed_area(Q) > 0
    n = np.column_stack([-tang[:, 1], tang[:, 0]]) if ccw else np.column_stack([tang[:, 1], -tang[:, 0]])
    O = Q + d * n
    # gecerlilik: offset noktasinin ORIJINAL kontura uzakligi ~d olmali
    valid = np.ones(m, bool)
    CH = 2000
    for a in range(0, m, CH):
        blk = O[a:a+CH]
        dist = np.sqrt(((blk[:, None, :] - Q[None, :, :])**2).sum(-1)).min(1)
        valid[a:a+CH] = dist > d - 0.6
    return O, valid, n

def line_isect(p1, d1, p2, d2):
    """iki dogru kesisimi (p+t*d); paralel ise None."""
    den = d1[0]*d2[1] - d1[1]*d2[0]
    if abs(den) < 1e-9: return None
    t = ((p2[0]-p1[0])*d2[1] - (p2[1]-p1[1])*d2[0]) / den
    return p1 + t*d1

def polylen(P):
    return float(np.sum(np.linalg.norm(np.diff(P, axis=0), axis=1))) if len(P) > 1 else 0.0

def stitch_seams(Q, corners, d=SA):
    """her kenar icin dikis-cizgisi uzunlugu (miter kosesinden miter kosesine)."""
    m = len(Q); O, valid, n = inward_offset(Q, d)
    k = len(corners)
    runs = []   # her kenarin gecerli offset noktalari (indeks listesi)
    for i in range(k):
        a, b = corners[i], corners[(i+1) % k]
        idx = [(a+t) % m for t in range((b-a) % m + 1)]
        vi = [j for j in idx if valid[j]]
        runs.append((idx, vi))
    # miter koseleri: kenar i'nin sonu ile kenar i+1'in basi
    miters = [None]*k
    for i in range(k):
        _, vi_a = runs[i]; _, vi_b = runs[(i+1) % k]
        if len(vi_a) < 3 or len(vi_b) < 3:
            miters[i] = None; continue
        pa, pa2 = O[vi_a[-1]], O[vi_a[-3]]
        pb, pb2 = O[vi_b[0]],  O[vi_b[2]]
        da = pa - pa2; db = pb2 - pb
        na = np.linalg.norm(da); nb = np.linalg.norm(db)
        if na < 1e-9 or nb < 1e-9: miters[i] = None; continue
        X = line_isect(pa, da/na, pb, db/nb)
        # asiri uzayan miter (cok sivri kose) guvenlik siniri
        if X is None or np.linalg.norm(X-pa) > 8*d or np.linalg.norm(X-pb) > 8*d:
            X = 0.5*(pa+pb)
        miters[i] = X
    out = []
    for i in range(k):
        idx, vi = runs[i]
        cut = polylen(Q[idx])
        if len(vi) < 3:
            out.append((cut, None, 0)); continue
        P = O[vi]
        start = miters[(i-1) % k]; end = miters[i]
        chain = [start] if start is not None else []
        chain.append(P); chain2 = []
        for c in chain:
            chain2.append(c.reshape(1, 2) if c.ndim == 1 else c)
        if end is not None: chain2.append(end.reshape(1, 2))
        full = np.vstack(chain2)
        out.append((cut, polylen(full), len(idx)-len(vi)))
    return out

# --------------------------------------------------------------------- calis
d = json.load(open(GEOM))
R = {r["piece"]: r for r in d["rings"]
     if r["pattern"] == "locket_top" and r["sizeGuess"] == SIZE and r["ring"] >= 0}

print("=" * 100)
print(f"LOCKET-38 SEAM WALK — kesim cizgisi vs DIKIS cizgisi (SA={SA:.0f}mm, satici talimatindan)")
print("=" * 100)

M = {}
for piece, names in SEAM_NAMES.items():
    Q, L = resample(np.array(R[piece]["polygon"], float))
    cs = find_corners(Q, turning(Q))
    if len(cs) != len(names):
        print(f"!! {piece}: {len(cs)} kose bulundu, {len(names)} bekleniyordu — atama GUVENSIZ, atlandi")
        continue
    seams = stitch_seams(Q, cs)
    print(f"\n--- {piece} ---   kontur {L:.1f}mm")
    print(f"    {'dikis':>22} {'kesim(mm)':>10} {'DIKIS(mm)':>10} {'fark':>8} {'budanan':>8}")
    for nm, (cut, st, pruned) in zip(names, seams):
        M[(piece, nm)] = st
        st_s = f"{st:10.1f}" if st is not None else "      n/a "
        df = f"{st-cut:+8.1f}" if st is not None else "     n/a"
        print(f"    {nm:>22} {cut:>10.1f} {st_s} {df} {pruned:>8}")

print("\n" + "=" * 100)
print("SEAM WALK — eslesmesi GEREKEN dikisler (dikis cizgisinde)")
print("=" * 100)

def show(label, a, b, rule):
    va, vb = M.get(a), M.get(b)
    if va is None or vb is None:
        print(f"  {label:<34} olculemedi"); return None
    print(f"  {label:<34} {va:7.1f} vs {vb:7.1f}   fark {vb-va:+7.1f} mm ({(vb-va)/va*100:+5.1f}%)   [{rule}]")
    return vb - va

show("omuz  (on vs arka)", ("Front Body","omuz-on"), ("Back Body","omuz-arka"), "EŞİT olmali")
show("kol ucu (upper A vs B)", ("Upper Sleeve","uc-A"), ("Upper Sleeve","uc-B"), "EŞİT (kol halkasi)")
show("kol ucu (under A vs B)", ("Lower Sleeve","uc-A"), ("Lower Sleeve","uc-B"), "EŞİT (kol halkasi)")

fs = M.get(("Front Body","yan-dikis-alt")); fu = M.get(("Front Body","yan-dikis-ust"))
bs = M.get(("Back Body","yan-dikis-arka"))
if None not in (fs, fu, bs):
    print(f"  {'yan dikis (on toplam vs arka)':<34} {fs+fu:7.1f} vs {bs:7.1f}   fark {bs-(fs+fu):+7.1f} mm "
          f"({(bs-(fs+fu))/(fs+fu)*100:+5.1f}%)   [EŞİT olmali]")

fa = M.get(("Front Body","OYUK-on")); ba = M.get(("Back Body","OYUK-arka"))
cap = M.get(("Lower Sleeve","KAPAK(oyuga giden)"))
if None not in (fa, ba, cap):
    arm = fa + ba
    print(f"\n  OYUK (armhole) dikis cizgisi   : on {fa:.1f} + arka {ba:.1f} = {arm:.1f} mm  ({arm/10:.1f} cm)")
    print(f"  KAPAK (under sleeve) dikis     : {cap:.1f} mm")
    print(f"  GERCEK CAP EASE                : {cap-arm:+.1f} mm  = {(cap-arm)/arm*100:+.1f}%")
    print(f"  dogrulanmis kural (Aldrich)    : dokuma elbise/bluz 20-30mm; >75mm kotu draft supheli")
    print(f"  on/arka oyuk orani             : on %{fa/arm*100:.1f} / arka %{ba/arm*100:.1f}")

ut = M.get(("Upper Sleeve","UST-kenar(buzgulu)")); ub = M.get(("Upper Sleeve","ALT-kenar(buzgulu)"))
lt = M.get(("Lower Sleeve","KAPAK(oyuga giden)")); lb = M.get(("Lower Sleeve","ALT-kenar"))
if None not in (ut, ub, lt, lb):
    print(f"\n  PUFF buzgu orani (satici: 'gather to equal length'):")
    print(f"    ust kenar : upper {ut:.1f} -> under {lt:.1f}   buzgu {ut-lt:+.1f} mm = %{(ut-lt)/lt*100:.1f}")
    print(f"    alt kenar : upper {ub:.1f} -> under {lb:.1f}   buzgu {ub-lb:+.1f} mm = %{(ub-lb)/lb*100:.1f}")
print("\nNOT: SA=10mm satici talimatindan (sayfa 3/4/7/8/9/11 'stitch with a 1cm seam allowance').")
