#!/usr/bin/env python3
# 11 — GERCEK Bugra Locket-38 CENTIKLERINI (notch) PDF'ten cikar.
#
# NEDEN KRITIK: 07'nin cekirdek iddiasi "ease SADECE centiklerin ustunde, koltukalti-centik
# bolgeleri %0 (birebir)". Bu iddiayi bugune kadar SENTETIK sayilarla test ettik. Centikler
# gercek kalibin uzerinde CIZILI — cikarirsak iddiayi SATIN ALINMIS couture kalibinda olceriz.
# Ayrica centikler oyugun nerede bittigini kesinlestirir (yan dikis / kapak sinirlari).
#
# YONTEM: A0 PDF icerik akisindaki TUM cizim yollarini ayristir (bugra-extract-full.py'nin
# kanitlanmis parser'i), KUCUK olanlari (<=25mm) centik adayi al, ve her adayi size-38
# halkasina uzakligina gore parcaya + arc konumuna esle. Renk capraz kontrolu yapilir
# (38 = "0.294 1.0 0.0") ama filtre DEGIL — once olcup sonra siniflandiriyoruz.
import json, math, importlib.util
import numpy as np

ROOT = "/Users/damummyphus/damla_projects_2026/stitchu"
PDF = ROOT + "/new_flats/real patterns/Locket Top/PDF's/A0.pdf"
SIZE38_COLOR = "0.294 1.0 0.0"
STEP = 1.0

spec = importlib.util.spec_from_file_location("bx", ROOT + "/patterns_real/tools/bugra-extract-full.py")
bx = importlib.util.module_from_spec(spec); spec.loader.exec_module(bx)

data = open(PDF, "rb").read()
text = bx.pick_geometry_stream(bx.decompress_streams(data))
polys = bx.parse_paths(text)
print(f"toplam yol: {len(polys)}")

# --- centik adaylari: kucuk cizimler ---
cands = []
for p in polys:
    pts = np.array(p["pts"], float)
    if len(pts) < 2: continue
    w = pts[:,0].max()-pts[:,0].min(); h = pts[:,1].max()-pts[:,1].min()
    ext = max(w, h); L = bx.poly_len(p["pts"])
    if ext <= 25.0 and L <= 60.0:
        cands.append({"pts": pts, "col": p["color"], "ext": ext, "len": L,
                      "c": pts.mean(0)})
print(f"kucuk cizim adayi (<=25mm): {len(cands)}")
from collections import Counter
print("adaylarin renk dagilimi:", Counter(c["col"] for c in cands).most_common(10))

# --- size-38 halkalari ---
G = json.load(open(ROOT + "/patterns_real/geometry/geometry-full.json"))
rings = {r["piece"]: r for r in G["rings"]
         if r["pattern"] == "locket_top" and r["sizeGuess"] == "38" and r["ring"] >= 0}

def resample(P, step=STEP):
    P = np.asarray(P, float)
    if np.hypot(*(P[0]-P[-1])) > 1e-9: P = np.vstack([P, P[0]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    P = P[np.concatenate([[True], seg > 1e-9])]
    if np.hypot(*(P[0]-P[-1])) > 1e-9: P = np.vstack([P, P[0]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    arc = np.concatenate([[0], np.cumsum(seg)]); L = arc[-1]
    s = np.arange(0, L, step)
    return np.column_stack([np.interp(s, arc, P[:,0]), np.interp(s, arc, P[:,1])]), L

PIECES = ["Front Body", "Back Body", "Upper Sleeve", "Lower Sleeve"]
Q = {}
for name in PIECES:
    Q[name], _ = resample(np.array(rings[name]["polygon"], float))

print("\n" + "="*92)
print("CENTIK ESLEME — her aday en yakin size-38 halkasina, arc konumuyla")
print("="*92)
hits = {n: [] for n in PIECES}
for cd in cands:
    best = None
    for name in PIECES:
        R = Q[name]
        dist = np.sqrt(((cd["pts"][:, None, :] - R[None, :, :])**2).sum(-1))
        dmin = float(dist.min()); j = int(dist.min(0).argmin())
        if best is None or dmin < best[0]:
            best = (dmin, name, j)
    dmin, name, j = best
    if dmin <= 1.5:                       # halkaya DEGIYOR = o bedenin centigi
        hits[name].append({"arc": j*STEP, "d": dmin, "col": cd["col"],
                           "len": cd["len"], "ext": cd["ext"]})

for name in PIECES:
    hs = sorted(hits[name], key=lambda h: h["arc"])
    # ayni centigin birden cok parcasini birlestir (10mm icinde)
    merged = []
    for h in hs:
        if merged and h["arc"] - merged[-1]["arc"] < 10.0:
            merged[-1]["n"] += 1
        else:
            h = dict(h); h["n"] = 1; merged.append(h)
    L = len(Q[name]) * STEP
    print(f"\n--- {name} ---  halka {L:.0f}mm   {len(merged)} centik")
    for h in merged:
        c38 = "38" if h["col"] == SIZE38_COLOR else f"?{h['col']}"
        print(f"    arc {h['arc']:7.1f} mm   uzaklik {h['d']:4.2f}   uzunluk {h['len']:5.1f}mm   "
              f"parca {h['n']}   renk {c38}")
