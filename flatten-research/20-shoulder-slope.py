#!/usr/bin/env python3
# 20 — OMUZ EGIMI 8 BEDENDE OLCULUYOR (TUR 17 / 17B).
#
# NEDEN: contract/layers/shape-ratios.json'da shoulderInclDeg sekiz bedende de 21.6777°.
# Bu bir grade degil, mean_all.yaml'daki TEK vucuttan tasinan TEK sayi (mapping.py
# GRADE_PER_SIZE'da 'shoulder_incl' YOK). Soru: gercek bir endustriyel kalipta omuz
# egimi bedenle degisiyor mu? Bu dosya UYDURMUYOR, OLCUYOR.
#
# KAYNAK: patterns_real/geometry/geometry-full.json (Bugra Locket Top, PDF VEKTOR,
#         mm-kalibre, 8 ic ice halka = 8 beden). ring-trace-*.json KULLANILMAZ.
#
# YONTEM (18-armscye-front-back.py'nin DOGRULANMIS kose atamasi birebir):
#   0.25mm yeniden ornekleme -> donus acisiyla kose -> kose sayisi 8/8 bedende sabit
#   oldugu icin kenar->anlam atamasi yapisal olarak guvenli (front n=9, back n=6).
#
# ⚠ SAYFA DONUKLUGU: kalip parcalari A0 sayfasina serbest yerlestirilmis olabilir, o
#   yuzden SAYFA yataylik ekseni bir vucut ekseni DEGILDIR. Omuz egimi burada parcanin
#   KENDI ekseninden olculur: on parcada CF (kenar 7-8), arka parcada CB (kenar 4-5)
#   duz katlama kenaridir ve vucut DIKEY'ini tanimlar. Egim = omuz kirisi ile o dikeyin
#   dikinin (yani vucut yataylig) arasindaki aci. Duzluk (yay/kiris) her bedende
#   basiliyor: 1.00'dan sapiyorsa eksen guvenilmez, o satir DAMGALANIR.
#
# ⚠ BU SAYI MOTORA DOGRUDAN GRAFT EDILEMEZ ve edilmiyor: motorun bodysurface.cpp:338
#   kullandigi shoulderInclDeg NAPE'den (ense) omuz ucuna dusustur; burada olculen ise
#   BOYUN NOKTASI'ndan omuz ucuna olan kalip dikisidir. Iki farkli buyukluk. Bu dosyanin
#   verdigi hukum sadece sudur: omuz egimi bedenle GRADE EDILIYOR MU, ne kadar?
import json
import math
import sys

import numpy as np

ROOT = "/Users/damummyphus/damla_projects_2026/stitchu"
GEOM = ROOT + "/patterns_real/geometry/geometry-full.json"
SIZES = ["34", "36", "38", "40", "42", "44", "46", "48"]
STEP = 0.25

# 18-armscye-front-back.py ile BIREBIR ayni atama (orada 8/8 bedende dogrulandi)
ASSIGN = {
    "Front Body": {"n": 9, "shoulder": (5, 6), "axis": (7, 8), "axis_name": "CF"},
    "Back Body": {"n": 6, "shoulder": (0, 1), "axis": (4, 5), "axis_name": "CB"},
}


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
    s = np.arange(0, arc[-1], step)
    return np.column_stack([np.interp(s, arc, P[:, 0]), np.interp(s, arc, P[:, 1])]), arc[-1], s


def turning(Q, base_mm=6.0, step=STEP):
    m = len(Q)
    k = max(2, int(round(base_mm / step)))
    t = np.zeros(m)
    for i in range(m):
        a = Q[i] - Q[(i - k) % m]
        b = Q[(i + k) % m] - Q[i]
        t[i] = math.degrees(math.atan2(a[0] * b[1] - a[1] * b[0], a[0] * b[0] + a[1] * b[1]))
    return t


def corners(Q, turn, min_deg=22.0, min_sep_mm=10.0, step=STEP):
    m = len(Q)
    w = max(2, int(round(min_sep_mm / step)))
    at = np.abs(turn)
    cand = [i for i in range(m) if at[i] >= min_deg and
            at[i] >= max(at[(i + dd) % m] for dd in range(-w, w + 1)) - 1e-9]
    out = []
    for c in cand:
        if out and min(abs(c - out[-1]), m - abs(c - out[-1])) < w:
            if at[c] > at[out[-1]]:
                out[-1] = c
        else:
            out.append(c)
    if len(out) > 1 and min(abs(out[0] - out[-1]), m - abs(out[0] - out[-1])) < w:
        out.pop() if at[out[0]] >= at[out[-1]] else out.pop(0)
    return out


def polyline(Q, i, j):
    m = len(Q)
    n = (j - i) % m
    return Q[[(i + k) % m for k in range(n + 1)]]


def plen(A):
    return float(np.sum(np.linalg.norm(np.diff(A, axis=0), axis=1)))


d = json.load(open(GEOM))
ring = {}
for r in d["rings"]:
    if r["pattern"] == "locket_top" and r["ring"] >= 0:
        ring[(r["piece"], r["sizeGuess"])] = r

print("=" * 104)
print("TUR 17B — OMUZ EGIMI, BUGRA LOCKET 8 BEDEN (olculdu, uydurulmadi)")
print("kaynak: patterns_real/geometry/geometry-full.json | resample %.2fmm" % STEP)
print("egim = omuz kirisi ile parcanin KENDI dikey ekseninin (CF/CB katlama kenari) diki arasindaki aci")
print("=" * 104)

out = {}
fails = 0
for piece in ["Front Body", "Back Body"]:
    a = ASSIGN[piece]
    print("\n--- %s (eksen kenari: %s) ---" % (piece, a["axis_name"]))
    hdr = "%-6s %10s %10s %10s %12s %11s" % (
        "beden", "omuz_yay", "omuz_kiris", "EGIM_deg", "eksen_duzluk", "eksen_uzun")
    print(hdr)
    print("-" * len(hdr))
    prev = None
    for size in SIZES:
        r = ring.get((piece, size))
        if r is None:
            print("!! %s EU%s halkasi YOK" % (piece, size))
            fails += 1
            continue
        Q, L, s = resample(np.array(r["polygon"], float), STEP)
        cs = corners(Q, turning(Q))
        if len(cs) != a["n"]:
            print("!! %s EU%s kose sayisi %d != %d — ATAMA GUVENSIZ, SATIR DAMGALANDI"
                  % (piece, size, len(cs), a["n"]))
            fails += 1
            continue
        i, j = a["shoulder"]
        S = polyline(Q, cs[i], cs[j])
        p, q = a["axis"]
        X = polyline(Q, cs[p], cs[q])
        ax = X[-1] - X[0]
        ax_len = float(np.hypot(*ax))
        straight = plen(X) / ax_len if ax_len > 1e-9 else float("nan")
        # vucut dikeyi = eksen kirisi; vucut yatayi = onun diki
        u = ax / ax_len                       # dikey birim
        v = np.array([-u[1], u[0]])           # yatay birim
        ch = S[-1] - S[0]
        # egim = kirisin yataydan sapmasi, isaretsiz (parca yonu/aynasi bilgi degil)
        incl = abs(math.degrees(math.atan2(abs(float(np.dot(ch, u))),
                                           abs(float(np.dot(ch, v))))))
        chord = float(np.hypot(*ch))
        flag = "" if abs(straight - 1.0) < 0.01 else "  ⚠EKSEN EGRI"
        print("%-6s %10.2f %10.2f %10.4f %12.5f %11.2f%s"
              % ("EU" + size, plen(S), chord, incl, straight, ax_len, flag))
        out.setdefault(piece, {})[size] = {"incl_deg": incl, "chord": chord,
                                           "arc": plen(S), "axis_straightness": straight}
        prev = incl

print("\n" + "=" * 104)
print("HUKUM — omuz egimi bedenle GRADE EDILIYOR MU?")
print("=" * 104)
for piece in ["Front Body", "Back Body"]:
    if piece not in out:
        continue
    vals = [out[piece][s]["incl_deg"] for s in SIZES if s in out[piece]]
    steps = [vals[i + 1] - vals[i] for i in range(len(vals) - 1)]
    rng = max(vals) - min(vals)
    print("  %-12s min %.4f  max %.4f  ARALIK %.4f°  ortalama %.4f°"
          % (piece, min(vals), max(vals), rng, sum(vals) / len(vals)))
    print("  %-12s adimlar: %s" % ("", " ".join("%+.4f" % x for x in steps)))
    mono = all(x > 0 for x in steps) or all(x < 0 for x in steps)
    print("  %-12s monoton: %s  |  aralik < 1.0°: %s"
          % ("", "EVET" if mono else "HAYIR", "EVET" if rng < 1.0 else "HAYIR"))

print("\n  KIYAS: shape-ratios.json shoulderInclDeg = 21.6777° x 8 beden (mean_all.yaml, TEK vucut)")
print("  ⚠ O sayi NAPE->omuz ucu dususu, buradaki ise BOYUN NOKTASI->omuz ucu kalip dikisi.")
print("     Ayni buyukluk DEGIL; buradaki olcum sadece 'grade ediliyor mu' sorusunu yanitlar.")

json.dump(out, open(ROOT + "/flatten-research/out-20-shoulder-slope.json", "w"), indent=1)
print("\nJSON -> flatten-research/out-20-shoulder-slope.json")
sys.exit(1 if fails else 0)
