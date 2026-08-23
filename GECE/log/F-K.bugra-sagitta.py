#!/usr/bin/env python3
"""F-K PARITE OLCUMU (kapi degil, hukum vermez).

Bugra Locket'in gercek yaka parcalarinin BOYUN (ic) kenarinin sagitta'sini olcer.
Amac tek: "duz yakanin boyun kenari duz bir cizgi DEGILDIR" iddiasinin gercek,
satin alinmis bir kalipta karsiligi var mi -- ve buyuklugu ne.

Kaynak: patterns_real/geometry/geometry-full.json (PDF vektor, mm-kalibre).
Yontem: kapali halka poligonunun uzun ekseninin iki ucu = CF uclari (tips).
Poligon o iki noktadan iki zincire bolunur; ikisi de ayni kirise (tip-tip) gore
sagitta verir. Kucuk sagitta'li zincir = IC (boyun) kenar, buyuk = DIS kenar.
Olculen: kiris c, sagitta s, yay uzunlugu L, ve donme acisi
    Phi = 4*atan(2s/c)  (dairesel yay varsayimi)
Phi boyutsuzdur -> bizim YARIM yaka parcamizla dogrudan kiyaslanabilir.
"""
import json, math, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SRC = os.path.join(ROOT, "patterns_real/geometry/geometry-full.json")

def dist(a, b):
    return math.hypot(a[0]-b[0], a[1]-b[1])

def chain_len(pts):
    return sum(dist(pts[i], pts[i+1]) for i in range(len(pts)-1))

def sagitta(pts):
    """max perpendicular distance from the chain to its own chord."""
    a, b = pts[0], pts[-1]
    c = dist(a, b)
    if c < 1e-9:
        return 0.0, 0.0
    ux, uy = (b[0]-a[0])/c, (b[1]-a[1])/c
    best = 0.0
    for p in pts:
        px, py = p[0]-a[0], p[1]-a[1]
        d = abs(px*(-uy) + py*ux)
        best = max(best, d)
    return best, c

def farthest_pair(poly):
    """index pair with the maximum separation = the two crescent tips."""
    n = len(poly)
    bi, bj, bd = 0, 0, -1.0
    for i in range(n):
        for j in range(i+1, n):
            d = dist(poly[i], poly[j])
            if d > bd:
                bi, bj, bd = i, j, d
    return bi, bj, bd

def main():
    d = json.load(open(SRC))
    want = {"EXTRA-TL (not in defter)", "Collar", "Collar Lining"}
    print("F-K PARITE — Bugra Locket yaka parcalari, boyun (ic) kenar sagitta")
    print("kaynak:", os.path.relpath(SRC, ROOT))
    print("NOT: PARITE gozlemi (v5 SC). Kapi degil, hicbir fazi kirmizi dusurmez.\n")
    print(f"{'parca':<26}{'beden':>6}{'kiris c':>10}{'sagitta s':>11}{'yay L':>9}{'s/c':>8}{'Phi (deg)':>11}")
    for r in d["rings"]:
        if r["pattern"] != "locket_top" or r["piece"] not in want:
            continue
        poly = r["polygon"]
        if len(poly) < 8:
            continue
        # decimate to keep the O(n^2) tip search cheap, then refine on the full ring
        step = max(1, len(poly)//400)
        thin = poly[::step]
        i, j, _ = farthest_pair(thin)
        # map back to full-resolution indices
        fi, fj = poly.index(thin[i]), poly.index(thin[j])
        a, b = min(fi, fj), max(fi, fj)
        ch1 = poly[a:b+1]
        ch2 = poly[b:] + poly[:a+1]
        s1, c1 = sagitta(ch1)
        s2, c2 = sagitta(ch2)
        inner = ch1 if s1 <= s2 else ch2
        s, c = (s1, c1) if s1 <= s2 else (s2, c2)
        L = chain_len(inner)
        phi = math.degrees(4*math.atan(2*s/c)) if c > 1e-9 else 0.0
        name = r["piece"].replace(" (not in defter)", "")
        print(f"{name:<26}{r['sizeGuess']:>6}{c:>10.2f}{s:>11.2f}{L:>9.2f}{s/c:>8.4f}{phi:>11.2f}")
    print("\nHUKUM YOK. Tek soylenen: bu kenarlarin sagitta'si SIFIR DEGIL.")

if __name__ == "__main__":
    main()
