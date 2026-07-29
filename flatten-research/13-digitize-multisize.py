#!/usr/bin/env python3
# 13 — BEDEN-BAGIMSIZ DIJITALLESTIRICI (digitizer). 09-12'nin tek-beden hattini genellestirir.
#
# NEDEN: Locket-38 URUN DEGIL, HAKEM. Tek bedene kilitli olcum, "38'e uyduran" motor dogurur
# (fit-defterinin batan yolu). Motor generative + editable olacaksa, ayni deterministik kurulum
# 8 bedeni de uretmeli. Bu dosya o hakemi kurar: satin alinmis 2 couture kalibinin 8 bedeninin
# TAMAMINI makine-okunur seam-graph'a cevirir.
#
# 3 SOMUT DUZELTME (onceki turun bulgulari):
#   (1) YONTEM BIRLIGI — 12 miter kosesi kurmuyordu, 10 kuruyordu; ayni oyugu 430.4 vs 431.5
#       olcuyorlardi. Burada TEK yontem: miter'li dikis polyline'i, hem kenar hem centik-bolgesi
#       ayni polyline'dan olculur. (38 sayilari bu yuzden yeniden olculur; fark durustce basilir.)
#   (2) CENTIK/BEDEN — 11 sadece 38 rengini biliyordu ve Upper Sleeve'de 0 centik buluyordu.
#       Burada geometry-full.json'daki pdfColorToSize haritasi kullanilir: her centik KENDI
#       bedenine atanir, her halka KENDI centiklerini alir.
#   (3) ETIKET TASIMA — kose indeksleri elle yazilmaz. 38'in DOGRULANMIS etiketlemesi, normalize
#       kenar-uzunluk imzasi uzerinden cevrimsel hizalamayla diger bedenlere tasinir; hizalama
#       maliyeti basilir, kose sayisi tutmayan halka ATLANIR (tahmin YOK).
#
# CIKTI: patterns_real/geometry/seamgraph.json  +  ekrana grade/anomali raporu.
# Girdi telifli (satin alinmis Bugra PDF'leri) — cikti da gitignore'da kalir.
import json, math, importlib.util, sys
from collections import defaultdict
import numpy as np

ROOT = "/Users/damummyphus/damla_projects_2026/stitchu"
GEOM = ROOT + "/patterns_real/geometry/geometry-full.json"
OUT  = ROOT + "/patterns_real/geometry/seamgraph.json"
SA, STEP = 10.0, 1.0                      # dikis payi 10mm = satici talimati (s.3/4/7/8/9/11)
SIZES = ["34", "36", "38", "40", "42", "44", "46", "48"]
SEED_SIZE = "38"                          # etiketlemesi gozle+sayiyla dogrulanmis beden

# 38'de DOGRULANMIS kenar anlamlari (09 PNG + satici talimati ile capraz kontrol edildi).
# Isimlendirilmemis parcalar "edge-i" olarak kalir — uydurma YOK.
SEED_NAMES = {
    ("locket_top", "Front Body"):   ["yan-dikis-alt", "pens-bacak-1", "pens-bacak-2", "yan-dikis-ust",
                                     "OYUK-on", "omuz-on", "yaka-on", "on-orta(CF)", "etek-on"],
    ("locket_top", "Back Body"):    ["omuz-arka", "OYUK-arka", "yan-dikis-arka", "etek-arka",
                                     "arka-orta(CB)", "yaka-arka"],
    ("locket_top", "Upper Sleeve"): ["uc-A", "UST-kenar(buzgulu)", "uc-B", "ALT-kenar(buzgulu)"],
    ("locket_top", "Lower Sleeve"): ["uc-A", "KAPAK(oyuga giden)", "uc-B", "ALT-kenar"],
}

# ----------------------------------------------------------------- geometri
def resample(P, step=STEP):
    P = np.asarray(P, float)
    if np.hypot(*(P[0] - P[-1])) > 1e-9: P = np.vstack([P, P[0]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    P = P[np.concatenate([[True], seg > 1e-9])]
    if np.hypot(*(P[0] - P[-1])) > 1e-9: P = np.vstack([P, P[0]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    arc = np.concatenate([[0], np.cumsum(seg)])
    s = np.arange(0, arc[-1], step)
    return np.column_stack([np.interp(s, arc, P[:, 0]), np.interp(s, arc, P[:, 1])]), float(arc[-1])

def turning(Q, base_mm=6.0):
    m = len(Q); k = max(2, int(round(base_mm / STEP))); t = np.zeros(m)
    for i in range(m):
        a = Q[i] - Q[(i - k) % m]; b = Q[(i + k) % m] - Q[i]
        t[i] = math.degrees(math.atan2(a[0]*b[1] - a[1]*b[0], a[0]*b[0] + a[1]*b[1]))
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

def inward_offset(Q, d=SA):
    """her noktayi IC normal boyunca d otele; mesafe-alani budamasiyla ilmekleri at."""
    m = len(Q)
    tg = np.roll(Q, -1, axis=0) - np.roll(Q, 1, axis=0)
    tg /= (np.linalg.norm(tg, axis=1)[:, None] + 1e-12)
    ccw = signed_area(Q) > 0
    n = np.column_stack([-tg[:, 1], tg[:, 0]]) if ccw else np.column_stack([tg[:, 1], -tg[:, 0]])
    O = Q + d * n
    valid = np.ones(m, bool)
    for a in range(0, m, 2000):
        blk = O[a:a+2000]
        valid[a:a+2000] = np.sqrt(((blk[:, None, :] - Q[None, :, :])**2).sum(-1)).min(1) > d - 0.6
    return O, valid

def line_isect(p1, d1, p2, d2):
    den = d1[0]*d2[1] - d1[1]*d2[0]
    if abs(den) < 1e-9: return None
    t = ((p2[0]-p1[0])*d2[1] - (p2[1]-p1[1])*d2[0]) / den
    return p1 + t*d1

def stitch_polyline(Q, corners, d=SA):
    """TEK dogruluk kaynagi: miter'li dikis polyline'i.
    Doner: (idx[], pts[]) — her dikis noktasi hangi KESIM indeksine karsilik geliyor.
    Kose noktalarinda miter kesisimi eklenir; gecersiz (budanmis) offset noktalari atlanir."""
    m = len(Q); O, valid = inward_offset(Q, d); k = len(corners)
    cset = {c: i for i, c in enumerate(corners)}
    # her kenarin gecerli offset indeksleri
    runs = []
    for i in range(k):
        a, b = corners[i], corners[(i+1) % k]
        idx = [(a+t) % m for t in range((b-a) % m + 1)]
        runs.append([j for j in idx if valid[j]])
    # miter: kenar i'nin sonu ile kenar i+1'in basi
    miters = {}
    for i in range(k):
        va, vb = runs[i], runs[(i+1) % k]
        c = corners[(i+1) % k]
        if len(va) < 3 or len(vb) < 3: continue
        pa, pa2 = O[va[-1]], O[va[-3]]
        pb, pb2 = O[vb[0]],  O[vb[2]]
        da = pa - pa2; db = pb2 - pb
        na, nb = np.linalg.norm(da), np.linalg.norm(db)
        if na < 1e-9 or nb < 1e-9: continue
        X = line_isect(pa, da/na, pb, db/nb)
        if X is None or np.linalg.norm(X-pa) > 8*d or np.linalg.norm(X-pb) > 8*d:
            X = 0.5*(pa+pb)
        miters[c] = X
    # kesim indeksi sirasinda tek polyline kur
    idxs, pts = [], []
    for i in range(m):
        if i in miters:                       # kose -> miter noktasi
            idxs.append(i); pts.append(miters[i])
        elif valid[i] and i not in cset:      # normal gecerli offset noktasi
            idxs.append(i); pts.append(O[i])
    return np.array(idxs), np.array(pts)

def stitch_len(idxs, pts, i0, i1, m):
    """kesim indeksi araligi [i0,i1] (cevrimsel) icin DIKIS cizgisi uzunlugu."""
    span = (i1 - i0) % m
    rel = (idxs - i0) % m
    sel = np.where(rel <= span)[0]
    if len(sel) < 2: return 0.0
    order = sel[np.argsort(rel[sel])]
    P = pts[order]
    return float(np.sum(np.linalg.norm(np.diff(P, axis=0), axis=1)))

# --------------------------------------------------- etiket tasima (hizalama)
def edge_fracs(corners, m):
    k = len(corners)
    return np.array([((corners[(i+1) % k] - corners[i]) % m) / m for i in range(k)])

def align_to_seed(seed_f, f):
    """normalize kenar-uzunluk imzasini cevrimsel hizala. Doner (rotasyon, maliyet)."""
    k = len(f); best = (0, 1e9)
    for r in range(k):
        cost = float(np.abs(np.roll(f, -r) - seed_f).sum())
        if cost < best[1]: best = (r, cost)
    return best

# ------------------------------------------------------------------- centik
def load_notches(G):
    """her PDF'ten kucuk cizimleri cikar, RENGINDEN bedene ata (pdfColorToSize)."""
    spec = importlib.util.spec_from_file_location("bx", ROOT + "/patterns_real/tools/bugra-extract-full.py")
    bx = importlib.util.module_from_spec(spec); spec.loader.exec_module(bx)
    out = defaultdict(list)   # (pattern, size) -> [pts]
    for pat, pdf in G["meta"]["sourcePDFs"].items():
        col2size = {c: v["size"] for c, v in G["pdfColorToSize"][pat].items()}
        try:
            data = open(pdf, "rb").read()
        except FileNotFoundError:
            print(f"!! {pat}: PDF bulunamadi ({pdf}) — centikler atlandi", file=sys.stderr); continue
        polys = bx.parse_paths(bx.pick_geometry_stream(bx.decompress_streams(data)))
        n = 0
        for p in polys:
            pts = np.array(p["pts"], float)
            if len(pts) < 2: continue
            ext = max(pts[:, 0].max()-pts[:, 0].min(), pts[:, 1].max()-pts[:, 1].min())
            if ext <= 25.0 and bx.poly_len(p["pts"]) <= 60.0:
                sz = col2size.get(p["color"])
                if sz: out[(pat, sz)].append(pts); n += 1
        print(f"  {pat}: {len(polys)} yol -> {n} beden-atanmis centik adayi")
    return out

def notches_on_ring(cands, Q, tol=1.5, merge_mm=10.0):
    hits = []
    for pts in cands:
        dist = np.sqrt(((pts[:, None, :] - Q[None, :, :])**2).sum(-1))
        dmin = float(dist.min())
        if dmin <= tol: hits.append((int(dist.min(0).argmin()), dmin))
    hits.sort()
    merged = []
    for a, dm in hits:
        if merged and a - merged[-1][0] < merge_mm: continue
        merged.append((a, dm))
    return [a for a, _ in merged]

# --------------------------------------------------------------------- calis
G = json.load(open(GEOM))
R = {(x["pattern"], x["piece"], x["sizeGuess"]): x for x in G["rings"] if x["ring"] >= 0}
pieces = sorted({(p, pc) for (p, pc, s) in R})

print("=" * 104)
print("13 — BEDEN-BAGIMSIZ DIJITALLESTIRICI   (SA=10mm, tek yontem: miter'li dikis polyline'i)")
print("=" * 104)
print("centik cikarimi (renk -> beden):")
NOTCH = load_notches(G)

graph = {"meta": {"sa_mm": SA, "step_mm": STEP, "method": "miter stitch polyline",
                  "seed_size": SEED_SIZE, "source": "geometry-full.json (PDF vektor, mm)"},
         "pieces": {}}
skipped = []

for (pat, pc) in pieces:
    seed = R.get((pat, pc, SEED_SIZE))
    if seed is None: continue
    Qs, _ = resample(np.array(seed["polygon"], float))
    cs_seed = find_corners(Qs, turning(Qs))
    seed_f = edge_fracs(cs_seed, len(Qs))
    names = SEED_NAMES.get((pat, pc), [f"edge-{i}" for i in range(len(cs_seed))])
    if len(names) != len(cs_seed):
        names = [f"edge-{i}" for i in range(len(cs_seed))]

    for sz in SIZES:
        x = R.get((pat, pc, sz))
        if x is None: continue
        Q, L = resample(np.array(x["polygon"], float))
        m = len(Q)
        cs = find_corners(Q, turning(Q))
        if len(cs) != len(cs_seed):
            skipped.append((pat, pc, sz, f"kose {len(cs)} != seed {len(cs_seed)}"))
            continue
        rot, cost = align_to_seed(seed_f, edge_fracs(cs, m))
        cs_al = cs[rot:] + cs[:rot]                      # 38 ile ayni semantik sirada
        idxs, pts = stitch_polyline(Q, cs_al)
        nt = notches_on_ring(NOTCH.get((pat, sz), []), Q)
        edges = []
        for i, nm in enumerate(names):
            a, b = cs_al[i], cs_al[(i+1) % len(cs_al)]
            cut = float(np.sum(np.linalg.norm(np.diff(Q[[(a+t) % m for t in range((b-a) % m + 1)]], axis=0), axis=1)))
            st = stitch_len(idxs, pts, a, b, m)
            en = [int(v) for v in nt if (v - a) % m <= (b - a) % m and v not in (a, b)]
            edges.append({"name": nm, "i0": int(a), "i1": int(b),
                          "cutMM": round(cut, 2), "stitchMM": round(st, 2),
                          "notches": en})
        graph["pieces"].setdefault(f"{pat}/{pc}", {})[sz] = {
            "perimMM": round(L, 2), "align_cost": round(float(cost), 4),
            "notchArcs": [int(v) for v in nt], "edges": edges}

json.dump(graph, open(OUT, "w"), indent=1)
print(f"\nseam-graph -> {OUT}")
print(f"islenen halka: {sum(len(v) for v in graph['pieces'].values())} / {len(R)}")
if skipped:
    print("ATLANAN (tahmin YOK, durustce disarida):")
    for s in skipped: print("   ", s)

# ---------------------------------------------------------------- raporlama
def E(key, sz, nm):
    d = graph["pieces"].get(key, {}).get(sz)
    if not d: return None
    for e in d["edges"]:
        if e["name"] == nm: return e
    return None

print("\n" + "=" * 104)
print("A) HIZALAMA MALIYETI  (0 = 38 ile ayni kenar imzasi; buyukse etiket tasima supheli)")
print("=" * 104)
print(f"{'parca':38s} " + " ".join(f"{s:>7s}" for s in SIZES))
for key in sorted(graph["pieces"]):
    row = [f"{graph['pieces'][key][s]['align_cost']:.4f}" if s in graph["pieces"][key] else "  -  " for s in SIZES]
    print(f"{key:38s} " + " ".join(f"{r:>7s}" for r in row))

print("\n" + "=" * 104)
print("B) GRADE TABLOSU — isimlendirilmis dikisler, DIKIS cizgisinde (mm), 8 beden")
print("=" * 104)
for key in sorted(k for k in graph["pieces"] if not graph["pieces"][k][SEED_SIZE]["edges"][0]["name"].startswith("edge-")):
    print(f"\n--- {key} ---")
    print(f"{'dikis':>22s} " + " ".join(f"{s:>7s}" for s in SIZES) + "   34->48")
    for e0 in graph["pieces"][key][SEED_SIZE]["edges"]:
        nm = e0["name"]; vals = []
        for s in SIZES:
            e = E(key, s, nm); vals.append(e["stitchMM"] if e else None)
        cells = " ".join(f"{v:7.1f}" if v is not None else "      -" for v in vals)
        d = (vals[-1]-vals[0]) if (vals[0] is not None and vals[-1] is not None) else float('nan')
        print(f"{nm:>22s} " + cells + f"   {d:+7.1f}")

print("\n" + "=" * 104)
print("C) KURAL TESTLERI — 8 BEDENDE (anomali sistematik mi = gercek kalip ozelligi,")
print("   yoksa dagiliyor mu = bizim landmark hatamiz?)")
print("=" * 104)
LT = "locket_top"
hdr = f"{'test':>34s} " + " ".join(f"{s:>7s}" for s in SIZES)
def line(label, fn):
    vals = []
    for s in SIZES:
        try: v = fn(s)
        except Exception: v = None
        vals.append(v)
    print(f"{label:>34s} " + " ".join(f"{v:7.1f}" if v is not None else "      -" for v in vals))
    return vals

print(hdr); print("-" * 104)
line("omuz on (mm)",   lambda s: E(f"{LT}/Front Body", s, "omuz-on")["stitchMM"])
line("omuz arka (mm)", lambda s: E(f"{LT}/Back Body", s, "omuz-arka")["stitchMM"])
line("  -> fark (EŞİT olmali)", lambda s: E(f"{LT}/Back Body", s, "omuz-arka")["stitchMM"]
                                        - E(f"{LT}/Front Body", s, "omuz-on")["stitchMM"])
print()
line("yan dikis on (alt+ust)", lambda s: E(f"{LT}/Front Body", s, "yan-dikis-alt")["stitchMM"]
                                       + E(f"{LT}/Front Body", s, "yan-dikis-ust")["stitchMM"])
line("yan dikis arka", lambda s: E(f"{LT}/Back Body", s, "yan-dikis-arka")["stitchMM"])
line("  -> fark (EŞİT olmali)", lambda s: E(f"{LT}/Back Body", s, "yan-dikis-arka")["stitchMM"]
                                        - (E(f"{LT}/Front Body", s, "yan-dikis-alt")["stitchMM"]
                                         + E(f"{LT}/Front Body", s, "yan-dikis-ust")["stitchMM"]))
print()
line("OYUK on",  lambda s: E(f"{LT}/Front Body", s, "OYUK-on")["stitchMM"])
line("OYUK arka", lambda s: E(f"{LT}/Back Body", s, "OYUK-arka")["stitchMM"])
line("OYUK toplam (Aldrich 400-440)", lambda s: E(f"{LT}/Front Body", s, "OYUK-on")["stitchMM"]
                                             + E(f"{LT}/Back Body", s, "OYUK-arka")["stitchMM"])
line("KAPAK (under sleeve)", lambda s: E(f"{LT}/Lower Sleeve", s, "KAPAK(oyuga giden)")["stitchMM"])
line("  -> net cap ease", lambda s: E(f"{LT}/Lower Sleeve", s, "KAPAK(oyuga giden)")["stitchMM"]
                                  - (E(f"{LT}/Front Body", s, "OYUK-on")["stitchMM"]
                                   + E(f"{LT}/Back Body", s, "OYUK-arka")["stitchMM"]))
print()
line("PUFF ust buzgu %", lambda s: (E(f"{LT}/Upper Sleeve", s, "UST-kenar(buzgulu)")["stitchMM"]
                                   / E(f"{LT}/Lower Sleeve", s, "KAPAK(oyuga giden)")["stitchMM"] - 1) * 100)

print("\n" + "=" * 104)
print("D) CENTIK BOLGE YURUYUSU — 8 BEDENDE (07 kurali: koltukalti bolgeleri %0 ease)")
print("=" * 104)
print(f"{'beden':>6s} {'on koltukalti':>14s} {'kapak-eslesen':>14s} {'artik':>8s}   "
      f"{'arka koltukalti':>16s} {'kapak-eslesen':>14s} {'artik':>8s}   {'TAC ease':>9s}")
for s in SIZES:
    try:
        fe = E(f"{LT}/Front Body", s, "OYUK-on"); be = E(f"{LT}/Back Body", s, "OYUK-arka")
        ce = E(f"{LT}/Lower Sleeve", s, "KAPAK(oyuga giden)")
        Qf, _ = resample(np.array(R[(LT, "Front Body", s)]["polygon"], float))
        Qb, _ = resample(np.array(R[(LT, "Back Body", s)]["polygon"], float))
        Qc, _ = resample(np.array(R[(LT, "Lower Sleeve", s)]["polygon"], float))
        csf = find_corners(Qf, turning(Qf)); csb = find_corners(Qb, turning(Qb)); csc = find_corners(Qc, turning(Qc))
        If, Pf = stitch_polyline(Qf, csf); Ib, Pb = stitch_polyline(Qb, csb); Ic, Pc = stitch_polyline(Qc, csc)
        mf, mb, mc = len(Qf), len(Qb), len(Qc)
        if not fe["notches"] or not be["notches"] or len(ce["notches"]) < 2: raise ValueError
        fn = fe["notches"][0]; bn = be["notches"][-1]
        f_under = stitch_len(If, Pf, fe["i0"], fn, mf)          # koltukalti -> centik
        b_under = stitch_len(Ib, Pb, bn, be["i1"], mb)          # centik -> koltukalti
        f_crown = stitch_len(If, Pf, fn, fe["i1"], mf)
        b_crown = stitch_len(Ib, Pb, be["i0"], bn, mb)
        cn = sorted(ce["notches"]); a, b = ce["i0"], ce["i1"]
        zA = stitch_len(Ic, Pc, a, cn[0], mc)                   # A ucu -> ilk centik
        zB = stitch_len(Ic, Pc, cn[-1], b, mc)                  # son centik -> B ucu
        cap = ce["stitchMM"]
        # en iyi eslesme: hangi uc one gidiyor
        o1 = abs(zB - f_under) + abs(zA - b_under)
        o2 = abs(zA - f_under) + abs(zB - b_under)
        (cf, cb) = (zB, zA) if o1 <= o2 else (zA, zB)
        crown_cap = cap - zA - zB
        print(f"{s:>6s} {f_under:>14.1f} {cf:>14.1f} {cf-f_under:>+8.1f}   "
              f"{b_under:>16.1f} {cb:>14.1f} {cb-b_under:>+8.1f}   {crown_cap-(f_crown+b_crown):>+9.1f}")
    except Exception as ex:
        print(f"{s:>6s}   olculemedi ({type(ex).__name__}) — centik eksik, TAHMIN YOK")

print("\nNOT: bu dosya OLCUM verir, karar vermez. Anomali 8 bedende AYNI ise gercek kalip")
print("     ozelligi; dagiliyorsa bizim cikarim hatamiz. Hakem kalip, biz degiliz.")
