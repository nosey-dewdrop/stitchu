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
#       olcuyorlardi. Burada TEK yontem, hem kenar hem centik-bolgesi ayni yontemle olculur.
#       ⚠ T12 (17.08): o TEK yontem BOZUKTU (budama+miter, her kenar ~ -2xSA). 10 ve 12 Tur 5'te
#       duzeltilmisti, 13 unutulmustu. Artik 18-armscye'nin nokta-normali ofseti kullaniliyor;
#       B/C/D tablolarinin BUTUN dikis-cizgisi sayilari degisti (kesim sayilari degismedi).
#   (2) CENTIK/BEDEN — 11 sadece 38 rengini biliyordu ve Upper Sleeve'de 0 centik buluyordu.
#       Burada geometry-full.json'daki pdfColorToSize haritasi kullanilir: her centik KENDI
#       bedenine atanir, her halka KENDI centiklerini alir.
#   (3) ETIKET TASIMA — kose indeksleri elle yazilmaz. 38'in DOGRULANMIS etiketlemesi, normalize
#       kenar-uzunluk imzasi uzerinden cevrimsel hizalamayla diger bedenlere tasinir; hizalama
#       maliyeti basilir, kose sayisi tutmayan halka ATLANIR (tahmin YOK).
#
# CIKTI: flatten-research/out-13-seamgraph.json  +  ekrana grade/anomali raporu.
# Girdi telifli (satin alinmis Bugra PDF'leri) — poligon KOORDINATI cikmiyor, sadece uzunluk/indis.
import json, math, importlib.util, sys
from collections import defaultdict
import numpy as np

ROOT = "/Users/damummyphus/damla_projects_2026/stitchu"
GEOM = ROOT + "/patterns_real/geometry/geometry-full.json"
# CIKTI YERI DEGISTI (T12, 17.08): eskiden patterns_real/geometry/seamgraph.json'a yaziyordu.
# patterns_real/ SATIN ALINMIS ve SADECE-OKU (repo yasasi) — arastirma ciktisi oraya yazilmaz.
# Oradaki dosya HEAD'de duruyor ve `patterns_real/tools/trace-match.py` onu okuyor; o dosyanin
# `cutMM`/`notches` alanlari BOZUK OFSETTEN ETKILENMEZ (kesim cizgisi ofsete girmiyor), sadece
# `stitchMM` alani zehirliydi ve `stitchMM`'in bu repoda 13 disinda TEK BIR TUKETICISI YOK.
OUT  = ROOT + "/flatten-research/out-13-seamgraph.json"
REF  = ROOT + "/patterns_real/geometry/seamgraph.json"   # sadece CAPRAZ KONTROL icin okunur
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

# --------------------------------------------------------- DIKIS CIZGISI (T12)
# ESKI YONTEM SILINDI — neden: `inward_offset` mesafe-alani budamasi + `line_isect`
# miter'i. Budama her kenarin UCLARINDAN 17-28 nokta atiyordu => her kenar ~ -2xSA
# kisaliyordu; miter onu geri getiremiyordu. Tek satirlik curutme: on-orta (CF) kenari
# DUZ bir cizgidir, paralel otelemek boyunu DEGISTIREMEZ — eski yontem EU38'de
# 421.0 yerine 401.5 basiyordu (-19.5 = -2xSA). Ayrinti: knowledge/seam-line-offset-2026-08-17.md
# YERINE: 18-armscye-front-back.py'nin yontemi — nokta-normali ofset, teget +-3mm
# merkezi farkla, BUDAMA YOK, MITER YOK. Mandal: duz kenar + analitik dL = -d*dtheta.

def polyline(Q, i, j):
    """kose i -> kose j arasi nokta dizisi (dairesel)."""
    m = len(Q); n = (j - i) % m
    return Q[[(i + k) % m for k in range(n + 1)]]

def plen(A):
    return float(np.sum(np.linalg.norm(np.diff(A, axis=0), axis=1)))

def tangents(A, win_mm=3.0, step=STEP):
    """+-win_mm merkezi farkla teget (tek segmentin gurultusu ICERI GIRMEZ)."""
    k = max(1, int(round(win_mm / step))); n = len(A)
    lo = np.clip(np.arange(n) - k, 0, n - 1); hi = np.clip(np.arange(n) + k, 0, n - 1)
    T = A[hi] - A[lo]
    nrm = np.linalg.norm(T, axis=1, keepdims=True); nrm[nrm < 1e-12] = 1.0
    return T / nrm

def total_turn_deg(A):
    T = tangents(A)
    ang = np.unwrap(np.arctan2(T[:, 1], T[:, 0]))
    return math.degrees(ang[-1] - ang[0])

def offset_polyline(A, d, ccw):
    """nokta-normali ile d kadar ICERI ofset (miter yok, budama yok)."""
    T = tangents(A)
    N = np.column_stack([-T[:, 1], T[:, 0]]) * (1.0 if ccw else -1.0)
    return A + N * d

def seam_len(Q, ccw, i0, i1, d=SA):
    """kose i0 -> i1 arasi DIKIS cizgisi uzunlugu (ic ofset)."""
    A = polyline(Q, i0, i1)
    if len(A) < 2: return 0.0
    return plen(offset_polyline(A, d, ccw))

def seam_len_analytic(Q, ccw, i0, i1, d=SA):
    """analitik mandal: L' = INTEGRAL(1 - d*kappa) ds = L - d*(toplam isaretli donus).
    ⚠ ISARET SARILIMA BAGLI: ic normal CCW'de tegetin SOLU, CW'de SAGI. 18-armscye'nin
    mandali bu carpani tasimiyor (orada iki parca da CCW oldugu icin hic yakalanmadi);
    Lower/Upper Sleeve poligonlari TERS SARIM ve carpansiz formul 2*d*dtheta kadar
    (EU38'de 14.2 / 20.9mm) sahte sapma basiyordu. Kusur mandaldaydi, ofsette degil."""
    A = polyline(Q, i0, i1)
    if len(A) < 2: return 0.0
    return plen(A) - (1.0 if ccw else -1.0) * d * math.radians(total_turn_deg(A))

# --- SENTETIK MANDAL: duz kenari otele, boyu DEGISMEMELI. Eski yontem bunu gecemezdi.
_str = np.column_stack([np.arange(0.0, 400.0 + 1e-9, STEP), np.zeros(int(400.0 / STEP) + 1)])
_off = plen(offset_polyline(_str, SA, True))
assert abs(_off - 400.0) < 1e-6, f"DUZ-KENAR MANDALI DUSTU: {_off:.6f} != 400.0"

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
print("13 — BEDEN-BAGIMSIZ DIJITALLESTIRICI   (SA=10mm, dikis cizgisi = 18'in nokta-normali ofseti)")
print("     DUZ-KENAR MANDALI: 400.0000mm duz kenar, %.1fmm ic ofset -> %.4fmm (fark %.2e)" % (SA, _off, abs(_off - 400.0)))
print("=" * 104)
print("centik cikarimi (renk -> beden):")
NOTCH = load_notches(G)

graph = {"meta": {"sa_mm": SA, "step_mm": STEP,
                  "method": "point-normal inward offset, tangent +-3mm, NO pruning, NO miter (18)",
                  "seed_size": SEED_SIZE, "source": "geometry-full.json (PDF vektor, mm)"},
         "pieces": {}}
skipped = []
ANALYTIC = []          # (pat, pc, sz, isim, numerik_dikis, analitik_dikis) — T12 mandali

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
        ccw = signed_area(Q) > 0
        nt = notches_on_ring(NOTCH.get((pat, sz), []), Q)
        edges = []
        for i, nm in enumerate(names):
            a, b = cs_al[i], cs_al[(i+1) % len(cs_al)]
            cut = plen(polyline(Q, a, b))
            st = seam_len(Q, ccw, a, b)
            an = seam_len_analytic(Q, ccw, a, b)
            ANALYTIC.append((pat, pc, sz, nm, st, an))
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

# ------------------------------------------------- T12 MANDALLARI (dikis cizgisi)
print("\n" + "=" * 104)
print("0) DIKIS-CIZGISI MANDALLARI (T12) — analitik dL = -d*dtheta ve HEAD'deki seamgraph ile kesim karsilastirmasi")
print("=" * 104)
_named = [r for r in ANALYTIC if r[0] == "locket_top" and r[1] in
          ("Front Body", "Back Body", "Upper Sleeve", "Lower Sleeve")]
for lbl, rows in (("locket_top ISIMLENDIRILMIS (K9/T14 hatti)", _named), ("TUM kenarlar", ANALYTIC)):
    rows = sorted(rows, key=lambda r: -abs(r[4] - r[5]))
    print("  %-38s %3d olcum, en kotu sapma %.4fmm" % (lbl, len(rows), abs(rows[0][4] - rows[0][5])))
    for r in rows[:3]:
        print("      %-34s EU%-3s %-24s numerik %8.3f analitik %8.3f fark %+7.3f"
              % (r[0] + "/" + r[1], r[2], r[3], r[4], r[5], r[4] - r[5]))
print("  NOT: dL=-d*dtheta mandali TEK bir teget dalinda gecerli; 'EXTRA-TL' (deftere girmeyen,")
print("       hic incelenmemis parca) ve corset kupleri sivri uclarda teget sarmali yapiyor.")
_T14 = {"OYUK-on", "OYUK-arka", "KAPAK(oyuga giden)", "UST-kenar(buzgulu)"}
_t14 = sorted([r for r in _named if r[3] in _T14], key=lambda r: -abs(r[4] - r[5]))
print("  T14 KENARLARI (oyuk + kapak + puf ust kenari), %d olcum, en kotu sapma %.4fmm:"
      % (len(_t14), abs(_t14[0][4] - _t14[0][5])))
for r in _t14[:4]:
    print("      %-14s EU%-3s %-22s numerik %8.3f analitik %8.3f fark %+7.4f"
          % (r[1], r[2], r[3], r[4], r[5], r[4] - r[5]))
try:
    _ref = json.load(open(REF))["pieces"]
    dcut = dnot = 0; ncmp = 0; mx = 0.0
    for key, szs in graph["pieces"].items():
        for sz, dd in szs.items():
            r = _ref.get(key, {}).get(sz)
            if not r: continue
            for e, re_ in zip(dd["edges"], r["edges"]):
                ncmp += 1
                if abs(e["cutMM"] - re_["cutMM"]) > 1e-9:
                    dcut += 1; mx = max(mx, abs(e["cutMM"] - re_["cutMM"]))
                if e["notches"] != re_["notches"]: dnot += 1
    print("  HEAD'deki patterns_real/geometry/seamgraph.json ile %d kenar karsilastirildi:" % ncmp)
    print("    cutMM farki olan kenar: %d (en buyuk %.4fmm)   notches farki olan kenar: %d" % (dcut, mx, dnot))
    print("    -> KESIM CIZGISI ve CENTIKLER OFSET HATASINDAN ETKILENMEDI; K1 bandi (h10_gate_check")
    print("       kBugraArmholeMM, trace-match.py cutMM'den) BU DUZELTMEDEN ETKILENMEZ." if dcut == 0
          else "    -> !! KESIM CIZGISI DEGISTI, K1 bandi YENIDEN INCELENMELI")
except FileNotFoundError:
    print("  (REF bulunamadi, capraz kontrol atlandi)")

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
        wf, wb, wc = signed_area(Qf) > 0, signed_area(Qb) > 0, signed_area(Qc) > 0
        mf, mb, mc = len(Qf), len(Qb), len(Qc)
        if not fe["notches"] or not be["notches"] or len(ce["notches"]) < 2: raise ValueError
        fn = fe["notches"][0]; bn = be["notches"][-1]
        f_under = seam_len(Qf, wf, fe["i0"], fn)                # koltukalti -> centik
        b_under = seam_len(Qb, wb, bn, be["i1"])                # centik -> koltukalti
        f_crown = seam_len(Qf, wf, fn, fe["i1"])
        b_crown = seam_len(Qb, wb, be["i0"], bn)
        cn = sorted(ce["notches"]); a, b = ce["i0"], ce["i1"]
        zA = seam_len(Qc, wc, a, cn[0])                         # A ucu -> ilk centik
        zB = seam_len(Qc, wc, cn[-1], b)                        # son centik -> B ucu
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
