#!/usr/bin/env python3
# 10 — GERCEK Bugra Locket-38: DIKIS CIZGISI (stitch line) cikarimi + SEAM WALK.
#
# NEDEN: basili kontur KESIM cizgisi. Kanit satIcinin kendi talimatinda (sayfa 3,4,7,8,9,11):
#   "stitch ... with a 1 cm (3/8 inch) seam allowance" — yani dikis cizgisi 10mm ICERIDE.
# Bu KRITIK: oyuk (armhole) ICBUKEY, kol kapagi DISBUKEY. Ayni 10mm oteleme oyugu UZATIR,
# kapagi KISALTIR (offset bir egrinin boyunu d * toplam_donus kadar degistirir, isaret egrilige
# bagli). Yani "kesim cizgisinde olculen ease" YANLIS sayidir. Burada ikisini de hesapliyoruz.
#
# ⚠ 2026-08-17 DUZELTME (Tur 5). ESKI YONTEM BOZUKTU, sayilari CLAUDE.md'ye zehirlemisti.
# Eski yontem: (a) "mesafe-alani budamasi" ile her kenarin UCLARINDAN 17-28 nokta atiyordu,
# (b) kalan uclari miter kesisimiyle uzatmaya calisiyordu. Sonuc: her kenar ~2*SA kisaliyordu.
# TEK SATIRLIK CURUTME: CF kenari DUZ bir cizgi, eski yontem 420.8 -> 401.5mm (-19.4) diyordu.
# DUZ bir cizgiyi paralel otelemek boyunu DEGISTIREMEZ. CB -20.1, etek -20.7, omuz -19.0:
# hepsi ~= -2*SA, yani budamanin kendisi. Ayni sinif hata pens bacaginda +6.6/-5.7 ile isaret
# bile degistiriyordu.
#
# YENI YONTEM (ajan 4B'nin `18-armscye-front-back.py`'de kurdugu, 32/32 olcumde dogrulanan):
#   1) kapali konturu 0.25mm'de yeniden ornekle, yonelimi (CW/CCW) isaretli alandan bul
#   2) kenari kendi kose indisleri arasinda KES (uc noktalar dahil), sonra
#   3) her noktayi IC normal boyunca 10mm otele — teget +-3mm merkezi farkla (tek segment
#      gurultusu iceri girmez), BUDAMA YOK, MITER YOK. Kose yapayligi olcume girmez.
#   4) ANALITIK CAPRAZ KONTROL: dL = -d * (toplam isaretli donus, radyan). Her kenarda basilir.
#   5) DUZ-KENAR TESTI: dogrulugun tek satirlik mandali, koşunun basinda calisir.
#
# CIKTI: her parca icin kenar-kenar kesim vs dikis uzunlugu, ve eslesmesi GEREKEN dikis ciftleri.
import json, math
import numpy as np

ROOT = "/Users/damummyphus/damla_projects_2026/stitchu"
GEOM = ROOT + "/patterns_real/geometry/geometry-full.json"
SIZE = "38"
SA = 10.0          # mm, satici talimatindan (1 cm), TAHMIN DEGIL
STEP = 0.25        # 18'le ayni (eskiden 1.0)

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

def polylen(P):
    return float(np.sum(np.linalg.norm(np.diff(P, axis=0), axis=1))) if len(P) > 1 else 0.0

def tangents(A, win_mm=3.0, step=STEP):
    """+-win_mm merkezi farkla teget (tek segmentin gurultusu ICERI GIRMEZ)."""
    k = max(1, int(round(win_mm / step)))
    n = len(A)
    lo = np.clip(np.arange(n) - k, 0, n - 1)
    hi = np.clip(np.arange(n) + k, 0, n - 1)
    T = A[hi] - A[lo]
    nrm = np.linalg.norm(T, axis=1, keepdims=True)
    nrm[nrm < 1e-12] = 1.0
    return T / nrm

def total_turn_deg(A):
    """polylinein toplam isaretli donusu (derece), teget +-3mm pencerede duzeltilmis."""
    T = tangents(A)
    ang = np.unwrap(np.arctan2(T[:, 1], T[:, 0]))
    return math.degrees(ang[-1] - ang[0])

def offset_polyline(A, d, ccw):
    """nokta-normali ile d kadar ICERI ofset (BUDAMA YOK, MITER YOK)."""
    T = tangents(A)
    N = np.column_stack([-T[:, 1], T[:, 0]]) * (1.0 if ccw else -1.0)
    return A + N * d

def stitch_seams(Q, corners, d=SA):
    """her kenar icin (kesim, dikis, analitik dikis, sapma). Kenar = kose->kose dilim."""
    m = len(Q); k = len(corners); ccw = signed_area(Q) > 0
    out = []
    for i in range(k):
        a, b = corners[i], corners[(i + 1) % k]
        idx = [(a + t) % m for t in range((b - a) % m + 1)]
        A = Q[idx]
        cut = polylen(A)
        seam = polylen(offset_polyline(A, d, ccw))
        tt = total_turn_deg(A)
        # ic ofset: dL = -d * dtheta  (ccw poligonda; cw'de isaret ters doner)
        ana = cut - d * math.radians(tt) * (1.0 if ccw else -1.0)
        out.append((cut, seam, ana, seam - ana))
    return out

# --- DOGRULAMA MANDALI: duz bir kenari otele, boyu DEGISMEMELI (eski yontem burada dusuyordu)
def selftest_straight(d=SA):
    A = np.column_stack([np.arange(0, 400.0 + STEP, STEP), np.zeros(int(400.0 / STEP) + 1)])
    for ccw in (True, False):
        L0, L1 = polylen(A), polylen(offset_polyline(A, d, ccw))
        assert abs(L1 - L0) < 1e-9, f"DUZ-KENAR TESTI DUSTU: {L0:.4f} -> {L1:.4f}"
    return polylen(A), polylen(offset_polyline(A, d, True))

# --------------------------------------------------------------------- calis
d = json.load(open(GEOM))
R = {r["piece"]: r for r in d["rings"]
     if r["pattern"] == "locket_top" and r["sizeGuess"] == SIZE and r["ring"] >= 0}

print("=" * 100)
print(f"LOCKET-38 SEAM WALK — kesim cizgisi vs DIKIS cizgisi (SA={SA:.0f}mm, satici talimatindan)")
print("=" * 100)
_L0, _L1 = selftest_straight()
print(f"DUZ-KENAR TESTI: {_L0:.4f}mm -> {_L1:.4f}mm  (fark {_L1-_L0:+.2e}mm)  GECTI")
print(f"resample {STEP:.2f}mm | teget penceresi +-3mm | budama YOK | miter YOK")

M = {}
for piece, names in SEAM_NAMES.items():
    Q, L = resample(np.array(R[piece]["polygon"], float))
    cs = find_corners(Q, turning(Q))
    if len(cs) != len(names):
        print(f"!! {piece}: {len(cs)} kose bulundu, {len(names)} bekleniyordu — atama GUVENSIZ, atlandi")
        continue
    seams = stitch_seams(Q, cs)
    print(f"\n--- {piece} ---   kontur {L:.1f}mm")
    print(f"    {'dikis':>22} {'kesim(mm)':>10} {'DIKIS(mm)':>10} {'fark':>8} {'analitik':>10} {'sapma':>8}")
    for nm, (cut, st, ana, dev) in zip(names, seams):
        M[(piece, nm)] = st
        print(f"    {nm:>22} {cut:>10.2f} {st:>10.2f} {st-cut:>+8.2f} {ana:>10.2f} {dev:>+8.3f}")
    worst = max(abs(r[3]) for r in seams)
    print(f"    -> analitik dL=-d*dtheta ile en kotu sapma: {worst:.4f}mm")

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
