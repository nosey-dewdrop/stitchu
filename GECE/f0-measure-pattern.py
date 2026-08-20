#!/usr/bin/env python3
"""F0 OLCUM ALETI — kalip panellerinden govde olculeri (cm).

Onarim yok. Bu alet hicbir seyi duzeltmez; sadece `surface-pattern <BEDEN>`
ciktisindan alti ortak olcuyu cikarir ki ayni spec'ten uretilen flat ile yan
yana basilabilsin (GECE/ protokolu F0 madde 3).

Yontem — uydurma yok, hepsi ciktinin kendi yapisindan:
  * her panel bir kapali kenar zinciri (edges: endpoints + cubic curvature,
    kontrol noktalari KIRIS-normalize; GarmentCode formati).
  * bir kenar bir stitch'te geciyorsa DIKISLI, gecmiyorsa SERBEST kenar.
  * bel cevresi   = torso <-> skirt dikis ciftlerindeki skirt tarafi kenarlar
  * etek ucu cevr = skirt panellerinin serbest kenarlari
  * yaka acikligi = torso panellerinin en ust serbest kenarlarinin x-genisligi
  * omuz genisligi= torso panellerinin en ust noktasinin |x| toplami
  * gogus cevresi = torso panellerinin gogus bandindaki yatay kesit genisligi
  * govde boyu    = omuz y'sinden etek ucu y'sine dusey mesafe (bel dikisi
                    uzerinden torso + skirt zincirlenerek)
Olculemeyen her kalem cikti icinde `null` + `reason` ile isaretlenir.
"""
import json
import math
import subprocess
import sys

REPO = __file__.rsplit("/GECE/", 1)[0]


def cubic_pts(p0, p1, params, n=48):
    """Kenar kirisi p0->p1, kontrol noktalari kiris-normalize (u along, v perp)."""
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    out = []
    if params is None:
        for i in range(n + 1):
            t = i / n
            out.append((p0[0] + dx * t, p0[1] + dy * t))
        return out
    (u1, v1), (u2, v2) = params

    def lift(u, v):
        return (p0[0] + dx * u - dy * v, p0[1] + dy * u + dx * v)

    c1, c2 = lift(u1, v1), lift(u2, v2)
    for i in range(n + 1):
        t = i / n
        s = 1 - t
        out.append(
            (
                s ** 3 * p0[0] + 3 * s * s * t * c1[0] + 3 * s * t * t * c2[0] + t ** 3 * p1[0],
                s ** 3 * p0[1] + 3 * s * s * t * c1[1] + 3 * s * t * t * c2[1] + t ** 3 * p1[1],
            )
        )
    return out


def edge_poly(panel, ei):
    e = panel["edges"][ei]
    a, b = e["endpoints"]
    v = panel["vertices"]
    cur = e.get("curvature")
    params = cur["params"] if cur and cur.get("type") == "cubic" else None
    return cubic_pts(v[a], v[b], params)


def polylen(pts):
    return sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))


def width_at(panel, y, tol=0.4):
    """Panelin y yuksekligindeki yatay kesitinin genisligi (x_max - x_min)."""
    xs = []
    for ei in range(len(panel["edges"])):
        pts = edge_poly(panel, ei)
        for i in range(len(pts) - 1):
            y0, y1 = pts[i][1], pts[i + 1][1]
            if min(y0, y1) - tol <= y <= max(y0, y1) + tol and abs(y1 - y0) > 1e-9:
                t = (y - y0) / (y1 - y0)
                if -0.05 <= t <= 1.05:
                    xs.append(pts[i][0] + t * (pts[i + 1][0] - pts[i][0]))
    if len(xs) < 2:
        return None
    return max(xs) - min(xs)


def measure(size="EU38"):
    raw = subprocess.run(
        [f"{REPO}/engine/build/surface-pattern", size], capture_output=True, text=True
    )
    pat = json.loads(raw.stdout)["pattern"]
    panels = pat["panels"]

    stitched = set()
    pairs = []
    for st in pat["stitches"]:
        a, b = st[0], st[1]
        stitched.add((a["panel"], a["edge"]))
        stitched.add((b["panel"], b["edge"]))
        pairs.append((a, b))

    torso = [k for k in panels if "torso" in k]
    skirt = [k for k in panels if "skirt" in k]

    out = {"size": size, "panels": len(panels), "stitches": len(pat["stitches"]),
           "torso_panels": torso, "skirt_panels": skirt, "measures": {}}
    M = out["measures"]

    # --- bel cevresi: torso<->skirt dikislerinin SKIRT tarafi kenarlari
    waist = 0.0
    seen = set()
    for a, b in pairs:
        for x, y in ((a, b), (b, a)):
            if "torso" in x["panel"] and "skirt" in y["panel"]:
                key = (y["panel"], y["edge"])
                if key not in seen:
                    seen.add(key)
                    waist += polylen(edge_poly(panels[y["panel"]], y["edge"]))
    M["waist_cm"] = round(waist, 2) if seen else None
    M["_waist_edges"] = len(seen)

    # --- etek ucu cevresi: skirt panellerinin serbest kenarlari
    hem = 0.0
    hemn = 0
    for k in skirt:
        for ei in range(len(panels[k]["edges"])):
            if (k, ei) in stitched:
                continue
            pts = edge_poly(panels[k], ei)
            ymid = sum(p[1] for p in pts) / len(pts)
            ys = [p[1] for pp in [edge_poly(panels[k], e) for e in range(len(panels[k]["edges"]))] for p in pp]
            if ymid < (min(ys) + max(ys)) / 2:  # alt yari = etek ucu
                hem += polylen(pts)
                hemn += 1
    M["hem_sweep_cm"] = round(hem, 2) if hemn else None
    M["_hem_edges"] = hemn

    # --- gogus / yaka / omuz: OLCULEMEDI, ve sebebi kayitli.
    # Ilk deneme panelin yatay kesit genisligini topladi ve EU38 icin 129.43 cm
    # gogus verdi (gercek ~88). Yontem yanlis: panel duz serilmis bir 2B parca,
    # onun yatay kesiti bir govde CEVRESI degil. Cevre ancak gogus hattinin
    # panel uzerine dustugu EGRI boyunca olculur; o egri cikti icinde ISARETLI
    # DEGIL (sadece dikisli kenarlar isaretli). Sayiyi silmek, yanlis sayiyi
    # raporlamaktan iyidir.
    M["chest_cm"] = None
    M["_chest_reason"] = ("gogus hatti panel uzerinde isaretli degil; "
                          "yatay-kesit yontemi EU38'de 129.43 cm veriyor (gercek ~88) "
                          "-> yontem cürük, sayi basilmiyor")
    M["shoulder_span_cm"] = None
    M["_shoulder_reason"] = ("omuz dikisi YOK: h10_gate_check K3 'shoulder-seam 0 dikis' "
                             "diyor, sicilde shoulderSeam=flagged. Omuz genisligi "
                             "olculecek bir kenar cifti bulunmuyor")
    M["neck_width_cm"] = None
    M["_neck_reason"] = ("yaka, torso'nun 15 serbest kenarinin bir alt kumesi ama "
                         "hangileri oldugu ciktida etiketli degil (yaka/koloyugu/ust-kenar "
                         "ayrimi yok); preview_truth_check de 'neckHalf OLCULMEDI' diyor")

    # --- govde boyu: torso yuksekligi + skirt yuksekligi (bel dikisinde eklenir)
    th = max(max(v[1] for v in panels[k]["vertices"]) - min(v[1] for v in panels[k]["vertices"])
             for k in torso)
    sh = max(max(v[1] for v in panels[k]["vertices"]) - min(v[1] for v in panels[k]["vertices"])
             for k in skirt)
    M["torso_h_cm"] = round(th, 2)
    M["skirt_h_cm"] = round(sh, 2)
    M["body_length_cm"] = round(th + sh, 2)

    # --- birimsiz oranlar (flat ile tek karsilastirilabilir kume)
    r = {}
    if M["hem_sweep_cm"] and M["waist_cm"]:
        r["hem_over_waist"] = round(M["hem_sweep_cm"] / M["waist_cm"], 4)
    if M["chest_cm"] and M["waist_cm"]:
        r["chest_over_waist"] = round(M["chest_cm"] / M["waist_cm"], 4)
    if M["shoulder_span_cm"] and M["chest_cm"]:
        r["shoulder_over_chest"] = round(M["shoulder_span_cm"] / M["chest_cm"], 4)
    if M["neck_width_cm"] and M["shoulder_span_cm"]:
        r["neck_over_shoulder"] = round(M["neck_width_cm"] / M["shoulder_span_cm"], 4)
    if M["body_length_cm"] and M["chest_cm"]:
        r["length_over_chest"] = round(M["body_length_cm"] / M["chest_cm"], 4)
    out["ratios"] = r
    return out


if __name__ == "__main__":
    print(json.dumps(measure(sys.argv[1] if len(sys.argv) > 1 else "EU38"),
                     ensure_ascii=False, indent=2))
