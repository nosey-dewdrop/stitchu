#!/usr/bin/env python3
# 19 — T14: NET CAP EASE NEGATIF. Hangi kenar oyuga gidiyor?
#
# SORU (HEDEF.md T14): duzeltilmis olcum oyuk 468.33mm, Lower Sleeve kapagi 446.43mm,
# net cap ease -21.90mm = -4.7%. Duz bir set-in dikiste kapak oyuktan UZUN olur.
# Uc ihtimal, hicbiri dogrulanmamisti:
#   (a) oyuga giden kenar aslinda Upper Sleeve'in ust kenari (dis buzgulu katman)
#   (b) Lower Sleeve tam oyuga oturmuyor (kismi dikis)
#   (c) KAPAK landmark atamasi hatali
#
# BU DOSYA HUKUM VERMEZ ICIN DEGIL, AYIRMAK ICIN OLCER. Yontem 18-armscye-front-back.py'nin
# yontemi: 0.25mm yeniden ornekleme, nokta-normali ic ofset, teget +-3mm, BUDAMA YOK, MITER YOK,
# analitik mandal dL = -d*dtheta (SARILIM CARPANIYLA — 13'un T12 turunda bulunan kusur).
# Kaynak: patterns_real/geometry/geometry-full.json (PDF vektor, mm-kalibre) — SADECE OKUNUR.
import json, math
import numpy as np

ROOT = "/Users/damummyphus/damla_projects_2026/stitchu"
GEOM = ROOT + "/patterns_real/geometry/geometry-full.json"
OUT = ROOT + "/flatten-research/out-19-cap-vs-armscye.json"
SIZES = ["34", "36", "38", "40", "42", "44", "46", "48"]
STEP = 0.25
SA = 10.0

# ---- 18'in yontemi (birebir), + T12'de bulunan sarilim carpani -----------------
def resample(P, step=STEP):
    P = np.asarray(P, float)
    if np.hypot(*(P[0] - P[-1])) > 1e-9: P = np.vstack([P, P[0]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    P = P[np.concatenate([[True], seg > 1e-9])]
    if np.hypot(*(P[0] - P[-1])) > 1e-9: P = np.vstack([P, P[0]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    arc = np.concatenate([[0], np.cumsum(seg)])
    s = np.arange(0, arc[-1], step)
    return np.column_stack([np.interp(s, arc, P[:, 0]), np.interp(s, arc, P[:, 1])]), float(arc[-1]), s

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
        else: out.append(c)
    if len(out) > 1 and min(abs(out[0] - out[-1]), m - abs(out[0] - out[-1])) < w:
        out.pop() if at[out[0]] >= at[out[-1]] else out.pop(0)
    return out

def signed_area(P):
    x, y = P[:, 0], P[:, 1]
    return 0.5 * float(np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y))

def polyline(Q, i, j):
    m = len(Q); n = (j - i) % m
    return Q[[(i + k) % m for k in range(n + 1)]]

def plen(A): return float(np.sum(np.linalg.norm(np.diff(A, axis=0), axis=1)))

def tangents(A, win_mm=3.0, step=STEP):
    k = max(1, int(round(win_mm / step))); n = len(A)
    lo = np.clip(np.arange(n) - k, 0, n - 1); hi = np.clip(np.arange(n) + k, 0, n - 1)
    T = A[hi] - A[lo]
    nrm = np.linalg.norm(T, axis=1, keepdims=True); nrm[nrm < 1e-12] = 1.0
    return T / nrm

def total_turn_deg(A):
    T = tangents(A); ang = np.unwrap(np.arctan2(T[:, 1], T[:, 0]))
    return math.degrees(ang[-1] - ang[0])

def offset_polyline(A, d, ccw):
    T = tangents(A)
    N = np.column_stack([-T[:, 1], T[:, 0]]) * (1.0 if ccw else -1.0)
    return A + N * d

def measure(Q, ccw, i, j):
    A = polyline(Q, i, j)
    cut = plen(A); tt = total_turn_deg(A)
    seam = plen(offset_polyline(A, SA, ccw))
    ana = cut - (1.0 if ccw else -1.0) * SA * math.radians(tt)
    return {"cut": cut, "seam": seam, "seam_analytic": ana, "turn": tt,
            "chord": float(np.hypot(*(A[-1] - A[0]))),
            "dx": float(abs(A[-1, 0] - A[0, 0])), "dy": float(abs(A[-1, 1] - A[0, 1]))}

# ---- yapisal atama (18 ile ayni; sleeve'ler 4 koseli) --------------------------
ASSIGN = {
    "Front Body":   {"n": 9, "OYUK-on": (4, 5)},
    "Back Body":    {"n": 6, "OYUK-arka": (1, 2)},
    "Upper Sleeve": {"n": 4, "uc-A": (0, 1), "UST-kenar": (1, 2), "uc-B": (2, 3), "ALT-kenar": (3, 0)},
    "Lower Sleeve": {"n": 4, "uc-A": (0, 1), "KAPAK": (1, 2), "uc-B": (2, 3), "ALT-kenar": (3, 0)},
}

d = json.load(open(GEOM))
ring = {}
for r in d["rings"]:
    if r["pattern"] == "locket_top" and r["ring"] >= 0:
        ring[(r["piece"], r["sizeGuess"])] = r

data = {}
warn = []
for piece, a in ASSIGN.items():
    for size in SIZES:
        r = ring.get((piece, size))
        if r is None: warn.append(f"{piece} EU{size} halkasi YOK"); continue
        Q, L, s = resample(np.array(r["polygon"], float))
        ccw = signed_area(Q) > 0
        cs = corners(Q, turning(Q))
        if len(cs) != a["n"]:
            warn.append(f"{piece} EU{size} kose {len(cs)} != {a['n']} — ATLANDI (tahmin YOK)"); continue
        rec = {"perim": L, "ccw": ccw, "corner_arc": [round(float(s[c]), 2) for c in cs]}
        for nm, ij in a.items():
            if nm == "n": continue
            i, j = ij
            rec[nm] = measure(Q, ccw, cs[i], cs[j])
        data[(piece, size)] = rec

W = 112
print("=" * W)
print("19 — T14: OYUGA GIDEN KENAR HANGISI?  (kaynak PDF vektor, resample %.2fmm, SA %.1fmm)" % (STEP, SA))
print("=" * W)
for w in warn: print("  !!", w)

# --- 0) SARILIM ve MANDAL
print("\n" + "=" * W)
print("0) SARILIM + ANALITIK MANDAL (dL = -d*dtheta, sarilim carpaniyla)")
print("=" * W)
print("  %-14s %s" % ("parca", "poligon sarilimi (CCW/CW) 8 bedende"))
for piece in ASSIGN:
    ws = [("CCW" if data[(piece, s)]["ccw"] else "CW") for s in SIZES if (piece, s) in data]
    print("  %-14s %s" % (piece, " ".join(ws)))
worst = (0.0, "")
for (piece, size), rec in data.items():
    for nm, v in rec.items():
        if not isinstance(v, dict): continue
        e = abs(v["seam"] - v["seam_analytic"])
        if e > worst[0]: worst = (e, f"{piece} EU{size} {nm}")
print("  en kotu numerik-analitik sapma: %.4fmm  (%s)" % worst)

# --- 1) ANA TABLO
print("\n" + "=" * W)
print("1) OYUK (on+arka) vs HER SLEEVE KENARI — DIKIS cizgisi, 8 beden")
print("=" * W)
CAND = [("Lower Sleeve", "KAPAK"), ("Upper Sleeve", "UST-kenar"),
        ("Upper Sleeve", "ALT-kenar"), ("Lower Sleeve", "ALT-kenar")]
hdr = "%-5s %9s | " % ("beden", "OYUK") + " ".join("%-20s" % (p.split()[0] + " " + n) for p, n in CAND)
print(hdr); print("-" * len(hdr))
rows = {}
for size in SIZES:
    if ("Front Body", size) not in data or ("Back Body", size) not in data: continue
    ah = data[("Front Body", size)]["OYUK-on"]["seam"] + data[("Back Body", size)]["OYUK-arka"]["seam"]
    ahc = data[("Front Body", size)]["OYUK-on"]["cut"] + data[("Back Body", size)]["OYUK-arka"]["cut"]
    rows[size] = (ah, ahc)
    cells = []
    for p, n in CAND:
        if (p, size) not in data: cells.append("%-20s" % "     -"); continue
        v = data[(p, size)][n]["seam"]
        cells.append("%8.2f %+6.2f%%" % (v, 100 * (v - ah) / ah) + "   ")
    print("%-5s %9.2f | " % (size, ah) + " ".join(cells))

print("\n  AYNI TABLO, KESIM CIZGISINDE (ofsete girmeyen ham kontur):")
print(hdr); print("-" * len(hdr))
for size in SIZES:
    if size not in rows: continue
    ahc = rows[size][1]
    cells = []
    for p, n in CAND:
        if (p, size) not in data: cells.append("%-20s" % "     -"); continue
        v = data[(p, size)][n]["cut"]
        cells.append("%8.2f %+6.2f%%" % (v, 100 * (v - ahc) / ahc) + "   ")
    print("%-5s %9.2f | " % (size, ahc) + " ".join(cells))

# --- 2) IKI-KATMAN mi, YATAY-BOLUNMUS mu?
print("\n" + "=" * W)
print("2) SLEEVE TOPOLOJISI — Upper ve Lower ayni sleeve'in IKI KATMANI mi, ALT-UST iki PARCASI mi?")
print("=" * W)
print("  IKI KATMAN olsaydi: iki parcanin YAN dikisleri (uc-A, uc-B) esit olurdu.")
print("  YATAY BOLUNME olsaydi: Upper'in ALT kenari Lower'in UST kenarina esit olurdu.")
h = "%-5s | %8s %8s %8s %8s | %10s %10s %8s" % (
    "beden", "Up ucA", "Lo ucA", "Up ucB", "Lo ucB", "Up ALT", "Lo KAPAK", "fark")
print(h); print("-" * len(h))
for size in SIZES:
    if ("Upper Sleeve", size) not in data or ("Lower Sleeve", size) not in data: continue
    U, Lo = data[("Upper Sleeve", size)], data[("Lower Sleeve", size)]
    print("%-5s | %8.2f %8.2f %8.2f %8.2f | %10.2f %10.2f %+8.2f" % (
        size, U["uc-A"]["seam"], Lo["uc-A"]["seam"], U["uc-B"]["seam"], Lo["uc-B"]["seam"],
        U["ALT-kenar"]["seam"], Lo["KAPAK"]["seam"], U["ALT-kenar"]["seam"] - Lo["KAPAK"]["seam"]))

# --- 3) SEKIL: kiris ve toplam donus
print("\n" + "=" * W)
print("3) SEKIL TANIGI — kiris (koltukalti-koltukalti acikligi) ve toplam donus")
print("=" * W)
print("  Set-in kolda kapagin KIRISI oyugun kirisine yakin olur (ayni koltukalti noktalarina dikilir).")
h = "%-5s | %10s %10s | %10s %10s %10s %10s" % (
    "beden", "OYUK kiris", "OYUK donus", "LoKAPAK k.", "LoKAPAK d.", "UpUST k.", "UpUST d.")
print(h); print("-" * len(h))
for size in SIZES:
    if size not in rows or ("Lower Sleeve", size) not in data or ("Upper Sleeve", size) not in data: continue
    F = data[("Front Body", size)]["OYUK-on"]; B = data[("Back Body", size)]["OYUK-arka"]
    LK = data[("Lower Sleeve", size)]["KAPAK"]; UU = data[("Upper Sleeve", size)]["UST-kenar"]
    # oyugun "kirisi" = on ve arka oyugun omuz uclarindan koltukaltina; birlestirilmis oyugun
    # acikligi icin iki kirisin toplami degil, koltukalti-koltukalti mesafesi anlamlidir.
    # On/arka ayri parcalar oldugu icin burada iki kirisi ayri ayri basiyoruz (toplam DEGIL).
    print("%-5s | %5.1f+%-4.1f %5.1f+%-4.1f | %10.2f %+10.1f %10.2f %+10.1f" % (
        size, F["chord"], B["chord"], F["turn"], B["turn"],
        LK["chord"], LK["turn"], UU["chord"], UU["turn"]))

# --- 4) OFSETIN ISARETI — negatif ease'in KAYNAGI
print("\n" + "=" * W)
print("4) NEGATIF EASE NEREDEN GELIYOR? kesim -> dikis kaymasi, parca parca (EU38 ornek, 8 beden tablo)")
print("=" * W)
h = "%-5s | %9s %9s %8s | %9s %9s %8s | %9s %9s" % (
    "beden", "OYUK kes", "OYUK dik", "kayma", "LoKAPAK k", "LoKAPAK d", "kayma", "ease kes", "ease dik")
print(h); print("-" * len(h))
for size in SIZES:
    if size not in rows or ("Lower Sleeve", size) not in data: continue
    ah, ahc = rows[size]
    LK = data[("Lower Sleeve", size)]["KAPAK"]
    print("%-5s | %9.2f %9.2f %+8.2f | %9.2f %9.2f %+8.2f | %+9.2f %+9.2f" % (
        size, ahc, ah, ah - ahc, LK["cut"], LK["seam"], LK["seam"] - LK["cut"],
        LK["cut"] - ahc, LK["seam"] - ah))

# --- 5) HANGI DIKIS PAYINDA ISARET DONUYOR?
print("\n" + "=" * W)
print("5) ISARET DONUM NOKTASI — hangi dikis payi 'd'de kapak ile oyugun DIKIS cizgileri esitlenir?")
print("=" * W)
print("  L_oyuk(d)  = kes_oyuk  + d*|dtheta_oyuk|    (oyuk ICBUKEY -> ic ofset UZATIR)")
print("  L_kapak(d) = kes_kapak - d*|dtheta_kapak|   (kapak DISBUKEY -> ic ofset KISALTIR)")
print("  d0 = ikisinin esitlendigi pay. Satici talimati 10mm diyor (s.3/4/7/8/9/11).")
h = "%-5s | %9s %9s %8s | %8s %8s %8s | %8s" % (
    "beden", "kes_oyuk", "kes_kapak", "kes ease", "th_oyuk", "th_kapak", "toplam", "d0 (mm)")
print(h); print("-" * len(h))
d0s = []
for size in SIZES:
    if size not in rows or ("Lower Sleeve", size) not in data: continue
    F = data[("Front Body", size)]["OYUK-on"]; B = data[("Back Body", size)]["OYUK-arka"]
    LK = data[("Lower Sleeve", size)]["KAPAK"]
    ahc = rows[size][1]
    ka = abs(math.radians(F["turn"]) + math.radians(B["turn"]))   # oyuk, ic ofset UZATIR
    kc = abs(math.radians(LK["turn"]))                            # kapak, ic ofset KISALTIR
    d0 = (LK["cut"] - ahc) / (ka + kc)
    d0s.append(d0)
    print("%-5s | %9.2f %9.2f %+8.2f | %8.4f %8.4f %8.4f | %8.3f" % (
        size, ahc, LK["cut"], LK["cut"] - ahc, ka, kc, ka + kc, d0))
if d0s:
    print("  d0 bandi: %.3f - %.3f mm  (ortalama %.3f)" % (min(d0s), max(d0s), sum(d0s) / len(d0s)))
    print("  -> 10mm payda ease 8/8 NEGATIF; d0'in altinda kalan her payda da negatif.")
    print("  -> Kesim cizgisi (d=0) ease'i 8/8 POZITIF. Isaret d'nin fonksiyonu, kalibin degil.")

# --- 6) PARCA SEKLI — "iki KATMAN mi, yatay iki PARCA mi" sorusunun kesin tanigi
print("\n" + "=" * W)
print("6) SEKIL TANIGI — her sleeve parcasinin bbox'i ve her kenarinin kirisi/sagittasi")
print("=" * W)
print("  YATAY BOLUNME olsaydi: alt parcanin UST kenari duz-ce bir bicep cizgisi olurdu (sagitta ~ 0)")
print("  ve iki parcanin mate kenarlarinin KIRISI esit olurdu.")
print("  IKI KATMAN ise: iki parca da TAM bir kapak tasir (buyuk sagitta, iki ucu ayni yukseklikte),")
print("  disttaki katman yatayda olceklenmis olur.")
h = "%-14s %-4s %9s %9s | %-11s %8s %8s %8s %8s" % (
    "parca", "sz", "bbox_w", "bbox_h", "kenar", "yay", "kiris", "sagitta", "uc dy")
print(h); print("-" * len(h))
NAMES = {"Upper Sleeve": ["uc-A", "UST-kenar", "uc-B", "ALT-kenar"],
         "Lower Sleeve": ["uc-A", "KAPAK", "uc-B", "ALT-kenar"]}
shape = {}
for piece in ("Lower Sleeve", "Upper Sleeve"):
    for size in SIZES:
        r = ring.get((piece, size))
        if r is None: continue
        Q, L, s = resample(np.array(r["polygon"], float))
        cs = corners(Q, turning(Q))
        if len(cs) != 4: continue
        bw = Q[:, 0].max() - Q[:, 0].min(); bh = Q[:, 1].max() - Q[:, 1].min()
        for i, nm in enumerate(NAMES[piece]):
            A = polyline(Q, cs[i], cs[(i + 1) % 4]); v = A[-1] - A[0]; n = float(np.hypot(*v))
            dd = A - A[0]
            sag = float(np.max(np.abs(v[0] * dd[:, 1] - v[1] * dd[:, 0])) / n) if n > 1e-9 else 0.0
            shape[(piece, size, nm)] = (plen(A), n, sag, abs(float(v[1])))
            if size in ("34", "38", "48"):
                print("%-14s %-4s %9.1f %9.1f | %-11s %8.2f %8.2f %8.2f %8.2f"
                      % (piece if i == 0 else "", size if i == 0 else "", bw if i == 0 else 0,
                         bh if i == 0 else 0, nm, *shape[(piece, size, nm)]))
print("\n  OLCEK ORANI (Upper / Lower), 8 beden — sabitse Upper, Lower'in yatayda olceklenmis KOPYASIDIR:")
print("  %-5s %10s %10s %10s" % ("beden", "kapak kiris", "kapak sag.", "alt kiris"))
for size in SIZES:
    k = [("Upper Sleeve", size, "UST-kenar"), ("Lower Sleeve", size, "KAPAK"),
         ("Upper Sleeve", size, "ALT-kenar"), ("Lower Sleeve", size, "ALT-kenar")]
    if any(x not in shape for x in k): continue
    print("  %-5s %10.3f %10.3f %10.3f" % (
        size, shape[k[0]][1] / shape[k[1]][1], shape[k[0]][2] / shape[k[1]][2],
        shape[k[2]][1] / shape[k[3]][1]))

json.dump({("%s|%s" % k): v for k, v in data.items()}, open(OUT, "w"), indent=1)
print("\nJSON -> %s" % OUT)
