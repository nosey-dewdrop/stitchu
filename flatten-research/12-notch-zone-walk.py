#!/usr/bin/env python3
# 12 — 07'nin CEKIRDEK IDDIASINI gercek couture kalibinda test et.
# IDDIA (Aldrich/Armstrong, knowledge/drafting-math-eu38.md, HIGH):
#   koltukalti->centik bolgeleri %0 ease (armhole'a BIREBIR), TUM ease centiklerin USTUNDE.
# TEST: gercek Bugra Locket-38'in CIZILI centiklerini kullanarak, dikis cizgisinde
#   armhole bolgeleri vs kol kapagi bolgelerini olc. Kalibi biz cizmedik — kalip HAKEM.
import json, math
import numpy as np

ROOT = "/Users/damummyphus/damla_projects_2026/stitchu"
SA, STEP = 10.0, 1.0

def resample(P, step=STEP):
    P = np.asarray(P, float)
    if np.hypot(*(P[0]-P[-1])) > 1e-9: P = np.vstack([P, P[0]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    P = P[np.concatenate([[True], seg > 1e-9])]
    if np.hypot(*(P[0]-P[-1])) > 1e-9: P = np.vstack([P, P[0]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    arc = np.concatenate([[0], np.cumsum(seg)])
    s = np.arange(0, arc[-1], step)
    return np.column_stack([np.interp(s, arc, P[:,0]), np.interp(s, arc, P[:,1])])

def sarea(P):
    x, y = P[:,0], P[:,1]
    return 0.5*float(np.sum(x*np.roll(y,-1) - np.roll(x,-1)*y))

# ⚠ 2026-08-17 DUZELTME (Tur 5): eski `offset_valid` "mesafe-alani budamasi" ile ofset
# noktalarini ATIYORDU; bolge ucu bir KOSEYE dayaniyorsa oradan ~SA kadar uzunluk siliniyordu.
# Curutme: duz bir kenari 10mm otelemek boyunu DEGISTIREMEZ, eski yontem degistiriyordu
# (10-seam-walk-real.py, CF kenari 420.8 -> 401.5mm). Yeni yontem 18-armscye-front-back.py'nin
# nokta-normali ofseti: teget +-3mm merkezi farkla, BUDAMA YOK, MITER YOK.
# Analitik mandal: dL = -d * (toplam isaretli donus).
def _tangents(A, win_mm=3.0, step=STEP):
    k = max(1, int(round(win_mm/step))); n = len(A)
    lo = np.clip(np.arange(n)-k, 0, n-1); hi = np.clip(np.arange(n)+k, 0, n-1)
    T = A[hi] - A[lo]
    nrm = np.linalg.norm(T, axis=1, keepdims=True); nrm[nrm < 1e-12] = 1.0
    return T/nrm

def zone_stitch_len(Q, i0, i1, d=SA):
    """cut-line indeks araligi [i0,i1] icin DIKIS cizgisi uzunlugu (nokta-normali ofset)."""
    m = len(Q)
    idx = [(i0+t) % m for t in range((i1-i0) % m + 1)]
    A = Q[idx]
    if len(A) < 2: return 0.0
    T = _tangents(A)
    N = np.column_stack([-T[:,1], T[:,0]]) * (1.0 if sarea(Q) > 0 else -1.0)
    P = A + N*d
    return float(np.sum(np.linalg.norm(np.diff(P,axis=0),axis=1)))

def _selftest_straight(d=SA):
    A = np.column_stack([np.arange(0, 400.0+STEP, STEP), np.zeros(int(400.0/STEP)+1)])
    T = _tangents(A); P = A + np.column_stack([-T[:,1], T[:,0]])*d
    L0 = float(np.sum(np.linalg.norm(np.diff(A,axis=0),axis=1)))
    L1 = float(np.sum(np.linalg.norm(np.diff(P,axis=0),axis=1)))
    assert abs(L1-L0) < 1e-9, f"DUZ-KENAR TESTI DUSTU: {L0} -> {L1}"
    return L0, L1

G = json.load(open(ROOT + "/patterns_real/geometry/geometry-full.json"))
R = {r["piece"]: r for r in G["rings"]
     if r["pattern"] == "locket_top" and r["sizeGuess"] == "38" and r["ring"] >= 0}
Q = {n: resample(np.array(R[n]["polygon"], float)) for n in
     ["Front Body","Back Body","Lower Sleeve"]}
_L0, _L1 = _selftest_straight()   # dogrulama mandali: duz kenar, boy degismemeli

# --- 09'dan dogrulanmis kose indeksleri, 11'den 38-rengi centik arc'lari ---
FRONT_UNDERARM, FRONT_SHOULDER = 726, 937      # oyuk: kose4 -> kose5
FRONT_NOTCH = 769
BACK_SHOULDER, BACK_UNDERARM = 65, 287         # oyuk: kose1 -> kose2
BACK_NOTCH = 242
CAP_A, CAP_B = 42, 494                         # under sleeve kapak: kose1 -> kose2
CAP_NOTCHES = [127, 412, 446]

F, B, S = Q["Front Body"], Q["Back Body"], Q["Lower Sleeve"]

f_under = zone_stitch_len(F, FRONT_UNDERARM, FRONT_NOTCH)
f_crown = zone_stitch_len(F, FRONT_NOTCH, FRONT_SHOULDER)
b_crown = zone_stitch_len(B, BACK_SHOULDER, BACK_NOTCH)
b_under = zone_stitch_len(B, BACK_NOTCH, BACK_UNDERARM)

print("="*88)
print("GERCEK BUGRA LOCKET-38 — CENTIK BOLGELERI, DIKIS CIZGISI (SA=10mm)")
print("="*88)
print(f"OYUK (armhole):")
print(f"   on  koltukalti->centik : {f_under:7.1f} mm")
print(f"   on  centik->omuz       : {f_crown:7.1f} mm")
print(f"   arka omuz->centik      : {b_crown:7.1f} mm")
print(f"   arka centik->koltukalti: {b_under:7.1f} mm")
arm_under = f_under + b_under; arm_crown = f_crown + b_crown
print(f"   TOPLAM oyuk            : {arm_under+arm_crown:7.1f} mm   "
      f"(koltukalti bolgeleri {arm_under:.1f} / tac {arm_crown:.1f})")

print(f"\nKAPAK (under sleeve) — 3 centik: arc {CAP_NOTCHES}")
segs = [CAP_A] + CAP_NOTCHES + [CAP_B]
for i in range(len(segs)-1):
    print(f"   bolge {i}: arc {segs[i]:4d}->{segs[i+1]:4d}  dikis {zone_stitch_len(S,segs[i],segs[i+1]):7.1f} mm")
cap_tot = zone_stitch_len(S, CAP_A, CAP_B)
print(f"   TOPLAM kapak           : {cap_tot:7.1f} mm")

print("\n" + "="*88)
print("EŞLEŞTIRME — hangi centik hangi centige? (kalip hakem, biz degil)")
print("="*88)
# sleeve iki yonde takilabilir; her iki yonelim icin koltukalti-bolge artigi
for flip in (False, True):
    a_end, b_end = (CAP_A, CAP_B) if not flip else (CAP_B, CAP_A)
    # her kapak centigini iki uca gore olc
    dA = [(nt, zone_stitch_len(S, min(CAP_A,nt), max(CAP_A,nt))) for nt in CAP_NOTCHES]
    dB = [(nt, zone_stitch_len(S, min(nt,CAP_B), max(nt,CAP_B))) for nt in CAP_NOTCHES]
    front_side = dA if not flip else dB
    back_side  = dB if not flip else dA
    bf = min(front_side, key=lambda x: abs(x[1]-f_under))
    bb = min(back_side,  key=lambda x: abs(x[1]-b_under))
    lbl = "A=on, B=arka" if not flip else "A=arka, B=on"
    print(f"\n  yonelim [{lbl}]")
    print(f"    on  koltukalti bolgesi : oyuk {f_under:6.1f}  vs kapak {bf[1]:6.1f} (centik arc {bf[0]})"
          f"   artik {bf[1]-f_under:+6.1f} mm")
    print(f"    arka koltukalti bolgesi: oyuk {b_under:6.1f}  vs kapak {bb[1]:6.1f} (centik arc {bb[0]})"
          f"   artik {bb[1]-b_under:+6.1f} mm")
    used = {bf[0], bb[0]}
    crown_cap = cap_tot - bf[1] - bb[1]
    print(f"    TAC bolgesi            : oyuk {arm_crown:6.1f}  vs kapak {crown_cap:6.1f}"
          f"   EASE {crown_cap-arm_crown:+6.1f} mm = %{(crown_cap-arm_crown)/arm_crown*100:+.1f}")
    print(f"    kullanilmayan centik   : {sorted(set(CAP_NOTCHES)-used)}")

print("\n" + "="*88)
print(f"TOPLAM: oyuk {arm_under+arm_crown:.1f} vs kapak {cap_tot:.1f}  ->  net ease {cap_tot-(arm_under+arm_crown):+.1f} mm")
print("IDDIA (07): koltukalti bolgeleri ~0 artik, TUM ease tacta. Yukaridaki artiklar HAKEM.")
