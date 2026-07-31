#!/usr/bin/env python3
"""
KURAL TESTI: kol oyugu yan dikise ve omuz dikisine DIK mi giriyor?

Literatur (31 Tem arastirmasi, kaynakli):
  "the armhole curve should be perpendicular to the side seam and shoulder seams"
  "Pattern pieces should meet at a 90-degree angle for the first 0.5-1cm to
   prevent irregular angles or 'V' shapes"

Bizim motorumuz omuz ucunda kol oyugunu omuz dikisi YONUNDE (teget) cikariyor
(bodice.cpp:159-166 yorumu bunu acikca soyluyor) ve koltukaltina 65.6 derece ile
giriyor. Ikisi de kurala aykiri gorunuyor.

Web'e koru korune guvenmiyoruz: SATIN ALINMIS GERCEK COUTURE KALIBINDA olcuyoruz.
Kaynak: patterns_real/geometry/geometry-full.json (PDF vektorunden izlenmis).

UYARI: bu korpusun 7/13 parcasi beden-monotonlugunu ihlal ediyor (tracer suphesi).
AMA aci olcumu uzunluk olcumunden cok daha dayanikli: yerel teget yonu, halkanin
global olcek/monotonluk hatalarindan etkilenmiyor. Yine de sonuc "isaret" olarak
okunur, mutlak hakem olarak degil.
"""

import json
import numpy as np

GEOM = "patterns_real/geometry/geometry-full.json"

# CLAUDE.md'de kayitli landmark indisleri (flatten-research/09 ciktisi, 1mm resample)
# Front Body:  yan-dikis 681->726, kol oyugu 726->937, omuz 937->1001
# Back Body:   omuz 0->65, kol oyugu 65->287, yan-dikis 287->532
LANDMARKS = {
    ("locket_top", "Front Body"): {
        "side_seam": (681, 726),
        "armhole":   (726, 937),
        "shoulder":  (937, 1001),
        "underarm_idx": 726,
        "shoulder_tip_idx": 937,
    },
    ("locket_top", "Back Body"): {
        "shoulder":  (0, 65),
        "armhole":   (65, 287),
        "side_seam": (287, 532),
        "underarm_idx": 287,
        "shoulder_tip_idx": 65,
    },
}


def resample_1mm(poly):
    """Halkayi 1mm araliklarla yeniden ornekle (landmark indisleri buna gore)."""
    p = np.asarray(poly, float)
    if np.linalg.norm(p[0] - p[-1]) > 1e-9:
        p = np.vstack([p, p[0]])
    seg = np.linalg.norm(np.diff(p, axis=0), axis=1)
    cum = np.concatenate([[0.0], np.cumsum(seg)])
    total = cum[-1]
    n = int(round(total))                      # 1mm adim
    targets = np.linspace(0.0, total, n, endpoint=False)
    x = np.interp(targets, cum, p[:, 0])
    y = np.interp(targets, cum, p[:, 1])
    return np.column_stack([x, y]), total


def tangent_at(pts, idx, span, direction):
    """
    idx noktasindan baslayarak `direction` yonunde `span` mm'lik yerel teget.
    direction = +1 ileri, -1 geri. Cizgi uydurma (least squares) ile gurultuye
    dayanikli.
    """
    n = len(pts)
    if direction > 0:
        seg = np.array([pts[(idx + k) % n] for k in range(span)])
    else:
        seg = np.array([pts[(idx - k) % n] for k in range(span)])
    c = seg - seg.mean(axis=0)
    # en buyuk tekil vektor = en iyi uyan dogru yonu
    _, _, vt = np.linalg.svd(c, full_matrices=False)
    d = vt[0]
    # yonu, idx'ten uzaklasan tarafa cevir
    if np.dot(seg[-1] - seg[0], d) < 0:
        d = -d
    return d / np.linalg.norm(d)


def angle_between(u, v):
    c = float(np.clip(abs(np.dot(u, v)), -1.0, 1.0))   # dogrular arasi aci (0-90)
    return float(np.degrees(np.arccos(c)))


def main():
    data = json.load(open(GEOM))
    rings = data["rings"]

    print("=" * 78)
    print("GERCEK BUGRA KALIBI: kol oyugu, yan dikis ve omuz dikisine kac derece?")
    print("=" * 78)
    print("Kural (literatur): 90 derece (dik). Sapma -> birlestirilince V olusur.")
    print("Olcum: her kosede 3/6/10 mm'lik yerel tegetler, SVD ile dogru uydurma.\n")

    for (pattern, piece), lm in LANDMARKS.items():
        print("-" * 78)
        print(f"{piece}  ({pattern})")
        print("-" * 78)
        for size in ["36", "38", "40", "42"]:
            ring = next((r for r in rings
                         if r["pattern"] == pattern and r["piece"] == piece
                         and r["sizeGuess"] == size), None)
            if ring is None:
                print(f"  beden {size}: BULUNAMADI")
                continue

            pts, total = resample_1mm(ring["polygon"])
            n = len(pts)
            ua = lm["underarm_idx"] % n
            st = lm["shoulder_tip_idx"] % n

            row = [f"  beden {size} (cevre {total:7.1f}mm, {n} nokta)"]
            for span in (3, 6, 10):
                # koltukalti: yan dikis tegeti vs kol oyugu tegeti
                # (indis sirasi: ... yan-dikis -> [ua] -> kol oyugu ...)
                t_side = tangent_at(pts, ua, span, direction=-1)
                t_arm  = tangent_at(pts, ua, span, direction=+1)
                a_ua = angle_between(t_side, t_arm)

                # omuz ucu: kol oyugu tegeti vs omuz dikisi tegeti
                t_arm2 = tangent_at(pts, st, span, direction=-1)
                t_sh   = tangent_at(pts, st, span, direction=+1)
                a_st = angle_between(t_arm2, t_sh)

                row.append(f"{span:2d}mm: koltukalti {a_ua:5.1f}째  omuz {a_st:5.1f}째")
            print(row[0])
            for r in row[1:]:
                print(f"      {r}")
        print()

    # --- bizim motorumuzun acilari (bodice.cpp'den birebir) --------------------
    print("=" * 78)
    print("BIZIM MOTORUMUZ (bodice.cpp armholeCurveFor, front)")
    print("=" * 78)
    shoulder       = np.array([188.0,  42.0])
    armhole_bottom = np.array([232.0, 218.0])
    neck_point     = np.array([ 62.0,   0.0])
    dx = armhole_bottom[0] - shoulder[0]
    dy = armhole_bottom[1] - shoulder[1]
    hollow = 0.34 * dx
    chord = float(np.hypot(dx, dy))
    st_dir = (shoulder - neck_point) / np.linalg.norm(shoulder - neck_point)
    cp1 = shoulder + st_dir * (chord * 0.26)
    cp2 = np.array([armhole_bottom[0] - dx * 0.06 - hollow, shoulder[1] + dy * 0.78])

    # kol oyugunun uc tegetleri
    t_arm_at_shoulder = (cp1 - shoulder) / np.linalg.norm(cp1 - shoulder)
    t_arm_at_underarm = (armhole_bottom - cp2) / np.linalg.norm(armhole_bottom - cp2)
    # yan dikis: koltukaltindan asagi (dikey varsayimi -- motorda yan dikis
    # sideWaist'e giden dogru; burada dikeye yakin)
    t_side = np.array([0.0, 1.0])
    # omuz dikisi: neck -> shoulder
    t_shoulder = st_dir

    print(f"  koltukalti (kol oyugu vs dikey yan dikis) : "
          f"{angle_between(t_arm_at_underarm, t_side):5.1f}째   (kural 90째)")
    print(f"  omuz ucu   (kol oyugu vs omuz dikisi)     : "
          f"{angle_between(t_arm_at_shoulder, t_shoulder):5.1f}째   (kural 90째)")
    print()
    print("  NOT: bodice.cpp:159-166 yorumu kol oyugunun omuz ucundan omuz dikisi")
    print("       YONUNDE (teget) ciktigini acikca soyluyor -> 0 derece hedefleniyor.")
    print("       Literatur 90 derece diyor. Bu bir TASARIM KARARI degil, kural ihlali")
    print("       olabilir -- ustteki gercek kalip olcumu hakem.")


if __name__ == "__main__":
    main()
