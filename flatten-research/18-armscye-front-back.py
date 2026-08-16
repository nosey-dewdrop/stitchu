#!/usr/bin/env python3
# 18 — K9 OLCUMU: Bugra Locket'te ON vs ARKA kol oyugu (armscye) YAYI ve OMUZ DIKISI.
#
# NEDEN: knowledge/drafting-math-eu38.md "ON armscye daha uzun, fark 1.5-2.5cm" diyor (HIGH).
# Bugra 8/8 bedende TERSINI olcuyor. Bu dosya celiskiyi SAYIYA baglar; hukum vermez, olcer.
#
# KAYNAK: patterns_real/geometry/geometry-full.json (PDF VEKTOR, mm-kalibre).
#         ring-trace-locket-front-38.json KULLANILMAZ (%40 bridge = uydurma).
# YONTEM: 0.25mm yeniden ornekleme -> donus acisiyla kose -> kenar = kose->kose yay.
#         Kenar->anlam atamasi 8 bedende YAPISAL olarak dogrulanir (kose sayisi + sira sabit),
#         korukorune indis kullanilmaz. CLAUDE.md'deki EU38 indisleri capraz kontrol edilir.
#
# DIKIS CIZGISI: dikis payi 10mm (satici talimati, KANITLI). Ofset nokta-normali ile yapilir
#         (miter YOK) -> kose yapaylıgı bu olcume girmez. Analitik capraz kontrol: dL = -d*(toplam donus).
import json, math, sys
import numpy as np

ROOT = "/Users/damummyphus/damla_projects_2026/stitchu"
GEOM = ROOT + "/patterns_real/geometry/geometry-full.json"
SIZES = ["34", "36", "38", "40", "42", "44", "46", "48"]
STEP = 0.25
SA = 10.0  # dikis payi mm


def resample(P, step):
    P = np.asarray(P, float)
    if np.hypot(*(P[0] - P[-1])) > 1e-9:
        P = np.vstack([P, P[0]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    P = P[np.concatenate([[True], seg > 1e-9])]
    if np.hypot(*(P[0] - P[-1])) > 1e-9:
        P = np.vstack([P, P[0]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    arc = np.concatenate([[0], np.cumsum(seg)])
    L = arc[-1]
    s = np.arange(0, L, step)
    return np.column_stack([np.interp(s, arc, P[:, 0]), np.interp(s, arc, P[:, 1])]), L, s


def turning(Q, base_mm=6.0, step=STEP):
    m = len(Q); k = max(2, int(round(base_mm / step))); t = np.zeros(m)
    for i in range(m):
        a = Q[i] - Q[(i - k) % m]; b = Q[(i + k) % m] - Q[i]
        t[i] = math.degrees(math.atan2(a[0]*b[1] - a[1]*b[0], a[0]*b[0] + a[1]*b[1]))
    return t


def corners(Q, turn, min_deg=22.0, min_sep_mm=10.0, step=STEP):
    m = len(Q); w = max(2, int(round(min_sep_mm / step))); at = np.abs(turn)
    cand = [i for i in range(m) if at[i] >= min_deg and
            at[i] >= max(at[(i + dd) % m] for dd in range(-w, w + 1)) - 1e-9]
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


def polyline(Q, i, j):
    """kose i -> kose j arasi nokta dizisi (dairesel)."""
    m = len(Q)
    n = (j - i) % m
    idx = [(i + k) % m for k in range(n + 1)]
    return Q[idx]


def plen(A):
    return float(np.sum(np.linalg.norm(np.diff(A, axis=0), axis=1)))


def tangents(A, win_mm=3.0, step=STEP):
    """+-win_mm merkezi farkla teget (0.25mm tek segmentin gurultusu ICERI GIRMEZ)."""
    k = max(1, int(round(win_mm / step)))
    n = len(A)
    lo = np.clip(np.arange(n) - k, 0, n - 1)
    hi = np.clip(np.arange(n) + k, 0, n - 1)
    T = A[hi] - A[lo]
    nrm = np.linalg.norm(T, axis=1, keepdims=True)
    nrm[nrm < 1e-12] = 1.0
    return T / nrm


def total_turn_deg(A):
    """polylinein toplam isaretli donusu (derece) — teget yonu +-3mm pencerede duzeltilmis."""
    T = tangents(A)
    ang = np.unwrap(np.arctan2(T[:, 1], T[:, 0]))
    return math.degrees(ang[-1] - ang[0])


def offset_polyline(A, d, ccw):
    """nokta-normali ile d kadar ICERI ofset (miter yok, teget +-3mm duzeltilmis)."""
    T = tangents(A)
    # ccw poligonda ic normal = sola donmus teget (-ty, tx)
    N = np.column_stack([-T[:, 1], T[:, 0]]) * (1.0 if ccw else -1.0)
    return A + N * d


d = json.load(open(GEOM))
ring = {}
for r in d["rings"]:
    if r["pattern"] == "locket_top" and r["ring"] >= 0:
        ring[(r["piece"], r["sizeGuess"])] = r

# --- yapisal atama: 8 bedende kose sayisi + sira sabit oldugu icin indis GUVENLI.
#     EU38'de CLAUDE.md'nin kayitli arc degerleriyle capraz kontrol edilir.
ASSIGN = {
    "Front Body": {"n": 9, "armscye": (4, 5), "shoulder": (5, 6),
                   "side_lo": (0, 1), "side_hi": (3, 4), "neck": (6, 7), "cf": (7, 8), "hem": (8, 0)},
    "Back Body":  {"n": 6, "armscye": (1, 2), "shoulder": (0, 1),
                   "side": (2, 3), "hem": (3, 4), "cb": (4, 5), "neck": (5, 0)},
}
CLAUDE38 = {"Front Body": [219, 406, 543, 681, 726, 937, 1001, 1220, 1641],
            "Back Body": [0, 65, 287, 532, 729, 1143]}

rows = []
print("=" * 108)
print("K9 — BUGRA LOCKET: ON vs ARKA armscye YAYI + OMUZ DIKISI, 8 beden")
print("kaynak: patterns_real/geometry/geometry-full.json (PDF vektor) | resample %.2fmm | dikis payi %.1fmm" % (STEP, SA))
print("=" * 108)

data = {}
for piece in ["Front Body", "Back Body"]:
    a = ASSIGN[piece]
    for size in SIZES:
        r = ring.get((piece, size))
        if r is None:
            print("!! %s EU%s halkasi YOK" % (piece, size)); continue
        P = np.array(r["polygon"], float)
        Q, L, s = resample(P, STEP)
        ccw = signed_area(np.vstack([Q, Q[0]])) > 0
        t = turning(Q)
        cs = corners(Q, t)
        if len(cs) != a["n"]:
            print("!! %s EU%s kose sayisi %d, beklenen %d — ATAMA GUVENSIZ" % (piece, size, len(cs), a["n"]))
            continue
        out = {"piece": piece, "size": size, "perim": L, "ccw": ccw,
               "corner_arc": [round(float(s[c]), 2) for c in cs]}
        for name, ij in a.items():
            if name == "n":
                continue
            i, j = ij
            A = polyline(Q, cs[i], cs[j])
            cut = plen(A)
            tt = total_turn_deg(A)
            B = offset_polyline(A, SA, ccw)
            seam = plen(B)
            out[name] = {"cut": cut, "chord": float(np.hypot(*(A[-1] - A[0]))),
                         "turn": tt, "seam": seam,
                         "seam_analytic": cut - SA * math.radians(tt),
                         "dx": float(abs(A[-1, 0] - A[0, 0])), "dy": float(abs(A[-1, 1] - A[0, 1]))}
        data[(piece, size)] = out

# EU38 capraz kontrol
print("\n--- CAPRAZ KONTROL: EU38 kose arc'lari vs CLAUDE.md kaydi ---")
for piece in ["Front Body", "Back Body"]:
    got = data[(piece, "38")]["corner_arc"]
    exp = CLAUDE38[piece]
    # dairesel hizalama: en yakin baslangici bul
    ok = all(min(abs(g - e) for e in exp) <= 1.0 for g in got) and len(got) == len(exp)
    print("  %-12s olculen %s" % (piece, got))
    print("  %-12s CLAUDE  %s   -> %s" % ("", exp, "UYUYOR (<=1mm)" if ok else "UYMUYOR"))

print("\n" + "=" * 108)
print("TABLO 1 — ARMSCYE (kol oyugu) YAYI")
print("=" * 108)
hdr = "%-5s %10s %10s %10s | %10s %10s %10s | %8s %8s" % (
    "beden", "on_kesim", "arka_kesim", "fark_mm", "on_dikis", "arka_dikis", "fark_mm", "on_a/k", "arka_a/k")
print(hdr); print("-" * len(hdr))
for size in SIZES:
    f = data[("Front Body", size)]["armscye"]; b = data[("Back Body", size)]["armscye"]
    print("%-5s %10.2f %10.2f %+10.2f | %10.2f %10.2f %+10.2f | %8.4f %8.4f" % (
        size, f["cut"], b["cut"], f["cut"] - b["cut"],
        f["seam"], b["seam"], f["seam"] - b["seam"],
        f["cut"] / f["chord"], b["cut"] / b["chord"]))

print("\n" + "=" * 108)
print("TABLO 2 — OMUZ DIKISI")
print("=" * 108)
hdr = "%-5s %10s %10s %10s | %10s %10s %10s" % (
    "beden", "on_kesim", "arka_kesim", "fark_mm", "on_dikis", "arka_dikis", "fark_mm")
print(hdr); print("-" * len(hdr))
for size in SIZES:
    f = data[("Front Body", size)]["shoulder"]; b = data[("Back Body", size)]["shoulder"]
    print("%-5s %10.2f %10.2f %+10.2f | %10.2f %10.2f %+10.2f" % (
        size, f["cut"], b["cut"], b["cut"] - f["cut"],
        f["seam"], b["seam"], b["seam"] - f["seam"]))
print("  NOT: omuz farki ARKA-ON yazildi (alan bilgisi arka uzun bekler); armscye farki ON-ARKA.")

print("\n" + "=" * 108)
print("TABLO 3 — 'DAHA DERIN/OYUK MU' AYRI OLCU: armscye kiris, egrilik, yatay/dikey acilim")
print("=" * 108)
hdr = "%-5s %8s %8s %8s %8s | %8s %8s %8s %8s" % (
    "beden", "on_kiris", "on_dx", "on_dy", "on_donus", "ar_kiris", "ar_dx", "ar_dy", "ar_donus")
print(hdr); print("-" * len(hdr))
for size in SIZES:
    f = data[("Front Body", size)]["armscye"]; b = data[("Back Body", size)]["armscye"]
    print("%-5s %8.2f %8.2f %8.2f %+8.1f | %8.2f %8.2f %8.2f %+8.1f" % (
        size, f["chord"], f["dx"], f["dy"], f["turn"], b["chord"], b["dx"], b["dy"], b["turn"]))

print("\n" + "=" * 108)
print("TABLO 4 — TOPLAM ARMHOLE (on+arka) ve YAN DIKIS (celiski disi, dokum)")
print("=" * 108)
hdr = "%-5s %12s %12s | %10s %10s %10s" % ("beden", "AH_kesim", "AH_dikis", "yan_on", "yan_arka", "fark")
print(hdr); print("-" * len(hdr))
for size in SIZES:
    f = data[("Front Body", size)]; b = data[("Back Body", size)]
    ah_c = f["armscye"]["cut"] + b["armscye"]["cut"]
    ah_s = f["armscye"]["seam"] + b["armscye"]["seam"]
    yf = f["side_lo"]["cut"] + f["side_hi"]["cut"]
    yb = b["side"]["cut"]
    print("%-5s %12.2f %12.2f | %10.2f %10.2f %+10.2f" % (size, ah_c, ah_s, yf, yb, yf - yb))
print("  yan_on = kesik iki parcanin (pens disi) toplami: kenar0-1 + kenar3-4.")

print("\n" + "=" * 108)
print("TABLO 5 — PLAKET/CF SORUSU: on parcanin CF kenari duz mu, armscye'ye komsu mu?")
print("=" * 108)
for size in SIZES:
    f = data[("Front Body", size)]
    cf = f["cf"]
    print("  EU%-3s CF kenari yay %8.2f kiris %8.2f (duzluk %.5f) | CF-armscye komsu mu: HAYIR "
          "(aralarinda yaka kenari %.2fmm var)" % (size, cf["cut"], cf["chord"], cf["cut"] / cf["chord"], f["neck"]["cut"]))

print("\n" + "=" * 108)
print("TABLO 6 — DIKIS CIZGISI CAPRAZ KONTROL (numerik ofset vs analitik dL = -d*dtheta)")
print("=" * 108)
for size in SIZES:
    for piece, key in [("Front Body", "armscye"), ("Back Body", "armscye"),
                       ("Front Body", "shoulder"), ("Back Body", "shoulder")]:
        e = data[(piece, size)][key]
        print("  EU%-3s %-11s %-9s numerik %8.3f  analitik %8.3f  fark %+6.3f" % (
            size, piece, key, e["seam"], e["seam_analytic"], e["seam"] - e["seam_analytic"]))

json.dump({("%s|%s" % k): v for k, v in data.items()},
          open(ROOT + "/flatten-research/out-18-armscye-front-back.json", "w"), indent=1)
print("\nJSON -> flatten-research/out-18-armscye-front-back.json")
