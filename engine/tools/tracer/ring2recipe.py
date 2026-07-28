#!/usr/bin/env python3
"""ring2recipe v1 — tracer→reçete köprüsü (PIPELINE Aşama 3, köprü v1, 2026-07-28).

İzlenen mm konturu (trace-ring dökümü) → RECETE-SPEC v1.1 formatında GERÇEK
reçete + fit edilen parametre DEFTERİ. Nokta dökümü değil: çıktı belge, motorun
anlamlı operasyonlarıyla (bel/2+bolluk mantığı) yazılır; Buğra'ya oturtulan her
sabit defterde tek satır gerekçeyle durur. Sihirli sayı yığını yasak.

YÖNTEM (deterministik, LLM yok):
1. Gövde ölçüleri Buğra'nın kendi beden çizelgesinden alınır
   (geometry-full.json sizeChartMM — reçete parametreleri Buğra'nın REFERANS
   ölçülerine fit edilir; kontur gövde ölçüsü uydurmaz).
2. Konturdan deterministik yer-imleri çıkarılır (ring-compare.landmarks):
   bbox, yaka noktası, omuz ucu, CF yaka derinliği, koltukaltı, etek yanı.
3. Kesim→dikiş çerçeve indirimi KAPALI GEOMETRİYLE yapılır (izlenen kontur
   kesim çizgisidir; Buğra payları DAHİL basar): bbox uçları dik teğetli
   olduğundan W/H tam -20; kenar-üstü yer-imleri kenar normali yönünde -10;
   köşe yer-imlerinde normalin eksen-dışı bileşeni ihmal edilir (≤8mm,
   yalnız gate-dışı omuz sabitlerine gider; defterde işaretli). Deneme
   turunda kural-tabanlı sabit-nokta geri beslemesi IRAKSADI (yer-imi
   karşılıkları şekil bozulunca kayıyor) — bilinçli olarak tek atış.
4. Serbest parametreler KAPALI FORM ters çevrimle yer-imlerinden çözülür
   (her parametre = tek yer-iminin motor formülünün tersi; kara kutu
   optimizasyon yok — formül tersi denetlenebilir). Çizim sonrası kalıntılar
   yalnız RAPOR edilir; hakem ring-compare mandalıdır.
5. Yan göğüs pensi (Buğra ön gövdede kontura AÇIK basılı V) dile marking
   move/line olarak, koltukaltı çapasına bağlı formüllerle yazılır.

kullanım: ring2recipe.py <trace.json> <geometry-full.json> <recipe-json-dump>
                         <out-recipe.json> <out-fit.json> <out-defter.txt>
Aynı girdi → bayt aynı çıktı (sabit iterasyon, sabit yuvarlama).
"""
import json
import math
import os
import subprocess
import sys
import tempfile
from importlib import util as _u

_here = os.path.dirname(os.path.abspath(__file__))
_spec = _u.spec_from_file_location('rc', os.path.join(_here, 'ring-compare.py'))
rc = _u.module_from_spec(_spec)
_argv, sys.argv = sys.argv, [sys.argv[0]]
_spec.loader.exec_module(rc)
sys.argv = _argv

CUT_IN = 9.0            # motor cutInMM (shift reçetesiyle aynı, sabit)
NECK_CM = 35.0          # gövde boyun çevresi: Buğra çizelgesinde yok; EU38
                        # standardı. Yaka genişliğine yalnız neckWidthMult
                        # çarpımı üzerinden girer (mult fit, çarpım ölçülür).
ARM_CM = 58.0           # kol boyu: üst reçetede kullanılmıyor (snapshot dolgusu)
SEAM_MM = 10.0          # Buğra baskısı: "dikiş payı 1cm dahil" (BUGRA-DEFTER)


def recipe_template(consts, extend_range, dart_scalars, has_dart):
    """Shift reçetesinin formül yapısı (motor operasyonları birebir), stile
    çözülmüş sabitler Buğra fit'inden. Formüller docs/RECETE-SPEC.md §6."""
    front_markings = []
    front_scalars = [
        {"id": "tipX",     "f": "shoulderHalf - cutInMM"},
        {"id": "dx",       "f": "frontWidth - tipX"},
        {"id": "dy",       "f": "underarmY - shoulderDrop"},
        {"id": "hollow",   "f": "hollowShareFront * dx"},
        {"id": "chord",    "f": "hypot(dx, dy)"},
        {"id": "stxRaw",   "f": "tipX - frontNeckW"},
        {"id": "slen",     "f": "hypot(stxRaw, shoulderDrop)"},
        {"id": "stx",      "f": "stxRaw / slen"},
        {"id": "sty",      "f": "shoulderDrop / slen"},
        {"id": "tanReach", "f": "chord * tangentShare"},
        {"id": "cp1x",     "f": "tipX + stx * tanReach"},
        {"id": "cp1y",     "f": "shoulderDrop + sty * tanReach"},
        {"id": "cp2x",     "f": "frontWidth - dx * 0.06 - hollow"},
        {"id": "cp2y",     "f": "shoulderDrop + dy * lowerDropShare"},
    ]
    if has_dart:
        front_scalars += [{"id": k, "f": f"{v}"} for k, v in dart_scalars]
        # yan göğüs pensi: Buğra baskıda kontura AÇIK basılı V; burada dikiş
        # hattı işareti olarak, koltukaltı çapasına bağlı üç komut.
        front_markings = [
            {"op": "move", "to": ["frontWidth - dartMouthLowInMM",
                                  "underarmY + dartMouthLowDropMM"]},
            {"op": "line", "to": ["frontWidth - dartApexInMM",
                                  "underarmY + dartApexDropMM"]},
            {"op": "line", "to": ["frontWidth - dartMouthTopInMM",
                                  "underarmY + dartMouthTopDropMM"]},
        ]
    return {
        "recipeVersion": 1,
        "id": "top.locket.front38.fit",
        "title": "Bugra Locket Top front-body fit (size 38 trace bridge v1)",
        "units": "mm",
        "kernel": {"garment": "top", "neckline": "square", "topLength": "tunic",
                   "straps": "spaghetti", "shaping": "dart", "fabric": "woven"},
        "measurements": ["bustMM", "waistMM", "hipMM", "shoulderMM", "backLengthMM", "neckMM"],
        "params": {
            "extendMM": {"min": extend_range[0], "max": extend_range[1]}
        },
        "consts": consts,
        "scalars": [
            {"id": "shoulderHalfRaw",    "f": "shoulderMM / 2"},
            {"id": "frontNeckWSlope",    "f": "min(neckMM * frontNeckWidthFactor * neckWidthMult, shoulderHalfRaw * maxNeckShoulderShare)"},
            {"id": "shoulderDrop",       "f": "shoulderSeamTargetMM * sinShoulderSlope"},
            {"id": "shoulderHalf",       "f": "frontNeckWSlope + shoulderSeamTargetMM * cosShoulderSlope"},
            {"id": "torsoArmholeY",      "f": "backLengthMM * armholeDepthFactor + shoulderDrop"},
            {"id": "bicepsGirth",        "f": "bustMM * bicepsRatioForArmscye"},
            {"id": "armholeDepthForArm", "f": "bicepsGirth * armscyeArmFactor + shoulderDrop"},
            {"id": "armholeDepthCap",    "f": "backLengthMM * armscyeMaxDepthShare + shoulderDrop"},
            {"id": "armholeY",           "f": "min(armholeDepthCap, max(torsoArmholeY, armholeDepthForArm))"},
            {"id": "underarmY",          "f": "armholeY - underarmRaiseMM"},
            {"id": "frontLength",        "f": "backLengthMM + frontBalanceDrop"},
            {"id": "frameGirth",         "f": "min(bustMM - underbustOffset, bustMM - 20)"},
            {"id": "underbust",          "f": "max(frameGirth, waistMM)"},
            {"id": "frontNeckW",         "f": "min(neckMM * frontNeckWidthFactor * neckWidthMult, shoulderHalf * maxNeckShoulderShare)"},
            {"id": "backNeckW",          "f": "min(neckMM * backNeckWidthFactor * neckWidthMult, shoulderHalf * maxNeckShoulderShare)"},
            {"id": "backCutout",         "f": "neckMM * backNeckCutoutFactor"},
            {"id": "backWidth",          "f": "underbust / 4 * (1 + chestEase)"},
            {"id": "frontShoulderLen",   "f": "hypot(shoulderHalf - frontNeckW, shoulderDrop)"},
            {"id": "backRunX",           "f": "shoulderHalf - backNeckW"},
            {"id": "backSeamRaw",        "f": "hypot(backRunX, shoulderDrop)"},
            {"id": "tipScale",           "f": "frontShoulderLen / backSeamRaw"},
            {"id": "bTipHalf",           "f": "backNeckW + backRunX * tipScale"},
            {"id": "bTipDrop",           "f": "shoulderDrop * tipScale"},
            {"id": "backWaistTarget",    "f": "waistMM * backWaistShare / 2 * (1 + waistEase)"},
            {"id": "backReduction",      "f": "max(0, backWidth - backWaistTarget)"},
            {"id": "backDart",           "f": "backReduction * (1 - centerBackReduction * 0.5)"},
            {"id": "cbTakeIn",           "f": "backReduction * centerBackReduction * 0.5"},
            {"id": "backWaistlineWidth", "f": "cbTakeIn + backWaistTarget + backDart"},
            {"id": "frontWidth",         "f": "bustMM / 4 * (1 + chestEase)"},
            {"id": "frontWaistTarget",   "f": "waistMM * (1 - backWaistShare) / 2 * (1 + waistEase)"},
            {"id": "frontReduction",     "f": "max(0, frontWidth - frontWaistTarget)"},
            {"id": "sideTake",           "f": "min(frontReduction, extSideTakeCap)"},
            {"id": "frontDart",          "f": "frontReduction - sideTake"},
            {"id": "frontWaistlineWidth","f": "frontWaistTarget + frontDart"},
            {"id": "hipHalfQuarter",     "f": "hipMM / 4 * hipExtendEase"},
            {"id": "frontCutout",        "f": "frontNeckW + squareNeckDrop"},
        ],
        "pieces": [
            {
                "name": "Top Front",
                "cut": "cut 2 mirrored",
                "seamAllowanceMM": SEAM_MM,
                "scalars": front_scalars,
                "points": [
                    {"id": "centerNeck",  "x": "0",              "y": "frontCutout"},
                    {"id": "neckCorner",  "x": "frontNeckW",     "y": "frontCutout"},
                    {"id": "neckPoint",   "x": "frontNeckW",     "y": "0"},
                    {"id": "shoulderTip", "x": "tipX",           "y": "shoulderDrop"},
                    {"id": "underarm",    "x": "frontWidth",     "y": "underarmY"},
                    {"id": "hemSide",     "x": "hipHalfQuarter", "y": "backLengthMM + extendMM - 10"},
                    {"id": "hemCenter",   "x": "0",              "y": "frontLength + extendMM"},
                ],
                "outline": [
                    {"op": "move",  "to": "centerNeck"},
                    {"op": "line",  "to": "neckCorner"},
                    {"op": "line",  "to": "neckPoint"},
                    {"op": "line",  "to": "shoulderTip"},
                    {"op": "curve", "to": "underarm",
                     "cp1": ["cp1x", "cp1y"],
                     "cp2": ["cp2x", "cp2y"]},
                    {"op": "curve", "to": "hemSide",
                     "cp1": ["frontWaistlineWidth", "backLengthMM + extendMM * 0.35"],
                     "cp2": ["hipHalfQuarter", "backLengthMM + extendMM * 0.7"]},
                    {"op": "curve", "to": "hemCenter",
                     "cp1": ["hipHalfQuarter * 0.6", "frontLength + extendMM"],
                     "cp2": ["hipHalfQuarter * 0.25", "frontLength + extendMM"]},
                    {"op": "line",  "to": "centerNeck"},
                    {"op": "close"},
                ],
                "markings": front_markings,
                "grainline": {"from": ["max(0, 20) + 20", "armholeY"],
                              "to":   ["max(0, 20) + 20", "backLengthMM - 30"]},
            },
            {
                "name": "Top Back",
                "cut": "cut 2",
                "seamAllowanceMM": SEAM_MM,
                "scalars": [
                    {"id": "tipX",     "f": "bTipHalf - cutInMM"},
                    {"id": "dx",       "f": "backWidth - tipX"},
                    {"id": "dy",       "f": "underarmY - bTipDrop"},
                    {"id": "hollow",   "f": "hollowShareBack * dx"},
                    {"id": "chord",    "f": "hypot(dx, dy)"},
                    {"id": "stxRaw",   "f": "tipX - backNeckW"},
                    {"id": "slen",     "f": "hypot(stxRaw, bTipDrop)"},
                    {"id": "stx",      "f": "stxRaw / slen"},
                    {"id": "sty",      "f": "bTipDrop / slen"},
                    {"id": "tanReach", "f": "chord * tangentShare"},
                    {"id": "cp1x",     "f": "tipX + stx * tanReach"},
                    {"id": "cp1y",     "f": "bTipDrop + sty * tanReach"},
                    {"id": "cp2x",     "f": "backWidth - dx * 0.06 - hollow"},
                    {"id": "cp2y",     "f": "bTipDrop + dy * lowerDropShare"},
                    {"id": "grainX",   "f": "max(cbTakeIn, 20) + 20"},
                ],
                "points": [
                    {"id": "centerNeck",  "x": "0",              "y": "backCutout"},
                    {"id": "neckPoint",   "x": "backNeckW",      "y": "0"},
                    {"id": "shoulderTip", "x": "tipX",           "y": "bTipDrop"},
                    {"id": "underarm",    "x": "backWidth",      "y": "underarmY"},
                    {"id": "hemSide",     "x": "hipHalfQuarter", "y": "backLengthMM + extendMM - 10"},
                    {"id": "hemCenter",   "x": "0",              "y": "backLengthMM + extendMM"},
                ],
                "outline": [
                    {"op": "move",  "to": "centerNeck"},
                    {"op": "curve", "to": "neckPoint",
                     "cp1": ["backNeckW * 0.55", "backCutout"],
                     "cp2": ["backNeckW * 0.9", "backCutout * 0.35"]},
                    {"op": "line",  "to": "shoulderTip"},
                    {"op": "curve", "to": "underarm",
                     "cp1": ["cp1x", "cp1y"],
                     "cp2": ["cp2x", "cp2y"]},
                    {"op": "curve", "to": "hemSide",
                     "cp1": ["backWaistlineWidth", "backLengthMM + extendMM * 0.35"],
                     "cp2": ["hipHalfQuarter", "backLengthMM + extendMM * 0.7"]},
                    {"op": "curve", "to": "hemCenter",
                     "cp1": ["hipHalfQuarter * 0.6", "backLengthMM + extendMM"],
                     "cp2": ["hipHalfQuarter * 0.25", "backLengthMM + extendMM"]},
                    {"op": "line",  "to": "centerNeck"},
                    {"op": "close"},
                ],
                "markings": [],
                "grainline": {"from": ["grainX", "armholeY"],
                              "to":   ["grainX", "backLengthMM - 30"]},
            },
        ],
    }


def solve_params(E, body_mm, strict=False):
    """Kapalı-form ters çevrim: sew-çerçevesi yer-imi hedefleri E → reçete
    sabitleri. Her satır tek formülün tersi; defter bu türetimleri yazar.
    strict: dal denetimleri yalnız SON çözümde koşar — sabit-nokta ara
    adımları kesim-çerçevesi düzeltmesi otururken sınırda sallanabilir;
    nihai belge yanlış daldaysa iş dürüstçe patlar."""
    bust, waist, hip = body_mm['bust'], body_mm['waist'], body_mm['hip']
    neck_mm = NECK_CM * 10
    A = E['neckPtX']                       # frontNeckW hedefi
    shoulder_half = E['tipX'] + CUT_IN     # tipX = shoulderHalf - cutInMM tersi
    run = shoulder_half - A
    drop = E['tipY']
    L = math.hypot(run, drop)              # omuz dikişi uzunluğu (ölçülen)
    sin_s, cos_s = drop / L, run / L       # ölçülen birim yön; sin²+cos²=1
    shoulder_mm = 2 * shoulder_half        # motor: omuz yarımı = shoulderMM/2
    mult = A / (0.17 * neck_mm)            # frontNeckW = neck*0.17*mult tersi
    bl = (E['underarmY'] + 6 - drop) / 0.44  # underarmY=bl*0.44+drop-6 tersi
    chest_ease = 4 * E['W'] / bust - 1     # frontWidth = bust/4*(1+ease) tersi
    hip_ext = 4 * E['hemSideX'] / hip      # hemSide.x = hip/4*hipExtendEase tersi
    fbd = (E['H'] - E['hemSideY']) - 10    # hemCenter-hemSide farkı = fBD+10
    extend = E['H'] - bl - fbd             # H = backLength+fBD+extend tersi
    sq_drop = E['cfNeckY'] - A             # frontCutout = frontNeckW+drop tersi
    p = {'A': A, 'shoulderHalf': shoulder_half, 'L': L, 'sin': sin_s,
         'cos': cos_s, 'shoulderMM': shoulder_mm, 'mult': mult, 'bl': bl,
         'chestEase': chest_ease, 'hipExt': hip_ext, 'fbd': fbd,
         'extend': extend, 'sqDrop': sq_drop, 'neckMM': neck_mm}
    # dal denetimleri (sessiz sapma yok; motor formülünün seçtiği dal fit'in
    # varsaydığı dal OLMALI) — yalnız nihai çözümde:
    if strict:
        torso = bl * 0.44 + drop
        for_arm = bust * 0.30 * 0.60 + drop
        cap = bl * 0.72 + drop
        assert for_arm <= torso <= cap, f'armhole dal ihlali: {for_arm} {torso} {cap}'
        assert neck_mm * 0.17 * mult <= shoulder_half * 0.72 + 1e-9, 'yaka cap dali ihlali'
        assert shoulder_mm / 2 * 0.72 >= A, 'frontNeckWSlope cap dali ihlali'
        assert bust - 70 > waist, 'underbust dal ihlali'
        front_wt = waist * 0.52 / 2 * 1.05
        assert E['W'] - front_wt >= 15, 'sideTake cap dali ihlali (frontDart<0 olurdu)'
    return p


def _cubic_samples(p0, p1, p2, p3, n=32):
    out = []
    for k in range(n + 1):
        u = k / n
        w = 1 - u
        out.append((w**3 * p0[0] + 3 * w * w * u * p1[0] + 3 * w * u * u * p2[0] + u**3 * p3[0],
                    w**3 * p0[1] + 3 * w * w * u * p1[1] + 3 * w * u * u * p2[1] + u**3 * p3[1]))
    return out


def _sew_band(walk, sel):
    """Seçilen ÖLÇÜLÜ kesim noktalarını dikişe indir: yerel teğetten normal,
    iç yöne +10 (pay), çerçeve -10/-10 (sew = cut_local - (10,10) + 10·n̂_iç)."""
    pts = [q for q, m in walk if m]
    n_all = len(walk)
    cx = sum(q[0] for q, _ in walk) / n_all
    cy = sum(q[1] for q, _ in walk) / n_all
    out = []
    for i, q in enumerate(pts):
        if not sel(q):
            continue
        a = pts[max(0, i - 1)]
        b = pts[min(len(pts) - 1, i + 1)]
        tx, ty = b[0] - a[0], b[1] - a[1]
        L = math.hypot(tx, ty)
        if L < 1e-9:
            continue
        nx, ny = -ty / L, tx / L
        if nx * (cx - q[0]) + ny * (cy - q[1]) < 0:
            nx, ny = -nx, -ny
        out.append((q[0] - 10 + 10 * nx, q[1] - 10 + 10 * ny))
    return out


def _poly_sse(targets, poly):
    s = 0.0
    for q in targets:
        best = float('inf')
        for j in range(len(poly) - 1):
            ax, ay = poly[j]
            bx, by = poly[j + 1]
            ex, ey = bx - ax, by - ay
            L2 = ex * ex + ey * ey
            u = 0.0 if L2 < 1e-12 else max(0.0, min(1.0, ((q[0] - ax) * ex + (q[1] - ay) * ey) / L2))
            d = math.hypot(q[0] - (ax + u * ex), q[1] - (ay + u * ey))
            if d < best:
                best = d
        s += best * best
    return s


def fit_side(walk, T, E, p, dart):
    """Yan dikiş bel payı — motorun KENDİ sabiti extSideTakeCap — Buğra'nın
    pens altı yan dikiş noktalarına tek-değişken sabit-ızgara LSQ (tur 3).
    Motor varsayılanı 15mm; Buğra beli yan dikişten çok daha fazla alıyor
    (tur 2 ölçümü: yan bölge ~25mm dışarıda). Eğri cp'si frontWaistlineWidth
    = frontWidth - sideTake üzerinden tek serbestlik; ızgara 0..80 adım 1,
    en iyi çevresinde adım 0.1 (üst sınır cap dalı korumasıyla ayrıca kelepçeli).
    6'dan az nokta = fit yok."""
    if dart:
        pts_all = [q for q, _ in walk]
        mouth_low_y = max(pts_all[dart[0]][1], pts_all[dart[1]][1])
    else:
        mouth_low_y = T['underarmY'] + 30
    targets = _sew_band(walk, lambda q: mouth_low_y + 8 < q[1] < T['hemSideY'] - 25
                        and q[0] > 0.6 * T['W'])
    if len(targets) < 6:
        return None
    bl, ext = p['bl'], p['extend']
    hip_q = E['hemSideX']
    p0 = (E['W'], E['underarmY'])
    p3 = (hip_q, bl + ext - 10)

    def sse_cap(cap):
        cp1 = (E['W'] - cap, bl + ext * 0.35)
        cp2 = (hip_q, bl + ext * 0.7)
        return _poly_sse(targets, _cubic_samples(p0, cp1, cp2, p3))

    best = None
    cap = 0.0
    while cap <= 80.0 + 1e-9:
        s = sse_cap(round(cap, 2))
        if best is None or s < best[0] - 1e-12:
            best = (s, round(cap, 2))
        cap += 1.0
    _, c0 = best
    cap = max(0.0, c0 - 1.0)
    while cap <= min(80.0, c0 + 1.0) + 1e-9:
        s = sse_cap(round(cap, 2))
        if s < best[0] - 1e-12:
            best = (s, round(cap, 2))
        cap += 0.1
    s, cap = best
    return {'extSideTakeCap': cap, 'rms': math.sqrt(s / len(targets)),
            'nPts': len(targets)}


def fit_armhole(walk, T, E, p):
    """Kol oyuğu eğri payları — motorun KENDİ adlı sabitleri (tangentShare,
    hollowShareFront, lowerDropShare) — Buğra'nın ölçülü oyuk noktalarına
    oturtulur. Motorun kolsuz-armscye varsayılanı dışa taşan bir süpürme
    çizer; Buğra takma-kol oyuğu içe oyuktur (tur 1 ölçümü: 63mm max sapma
    buradan). Eğri şeklinin kapalı-form tersi yok; fit deterministik İKİ
    kademeli sabit ızgara en-küçük-kare (kaba adım 0.02/0.05/0.05 → en iyi
    çevresinde 1/5 adım) — kara kutu değil, adımlar burada yazılı.
    Kesim→dikiş indirimi: nokta başına yerel teğetten normal, iç yöne +10
    (sew = cut_local - (10,10) + 10·n̂_iç). 6'dan az ölçülü nokta = fit yok,
    motor varsayılanı kalır (dürüst geri çekilme)."""
    targets = _sew_band(walk, lambda q: T['tipY'] + 8 < q[1] < T['underarmY'] - 8
                        and q[0] > 0.6 * T['W'])
    if len(targets) < 6:
        return None
    drop = p['L'] * p['sin']
    tip = (p['shoulderHalf'] - CUT_IN, drop)
    ua = (E['W'], E['underarmY'])
    dx, dy = ua[0] - tip[0], ua[1] - drop
    chord = math.hypot(dx, dy)
    sdir = (p['cos'], p['sin'])

    def sse(ts, hs, ld):
        cp1 = (tip[0] + sdir[0] * chord * ts, tip[1] + sdir[1] * chord * ts)
        cp2 = (ua[0] - dx * 0.06 - hs * dx, drop + dy * ld)
        return _poly_sse(targets, _cubic_samples(tip, cp1, cp2, ua))

    def grid(ts0, ts1, tstep, hs0, hs1, hstep, ld0, ld1, lstep):
        best = None
        ts = ts0
        while ts <= ts1 + 1e-9:
            hs = hs0
            while hs <= hs1 + 1e-9:
                ld = ld0
                while ld <= ld1 + 1e-9:
                    s = sse(round(ts, 4), round(hs, 4), round(ld, 4))
                    if best is None or s < best[0] - 1e-12:
                        best = (s, round(ts, 4), round(hs, 4), round(ld, 4))
                    ld += lstep
                hs += hstep
            ts += tstep
        return best
    b1 = grid(0.02, 0.40, 0.02, 0.0, 0.90, 0.05, 0.30, 0.90, 0.05)
    _, ts, hs, ld = b1
    b2 = grid(max(0.02, ts - 0.02), min(0.40, ts + 0.02), 0.004,
              max(0.0, hs - 0.05), min(0.90, hs + 0.05), 0.01,
              max(0.30, ld - 0.05), min(0.90, ld + 0.05), 0.01)
    s, ts, hs, ld = b2
    rms = math.sqrt(s / len(targets))
    return {'tangentShare': ts, 'hollowShareFront': hs, 'lowerDropShare': ld,
            'rms': rms, 'nPts': len(targets)}


def build_consts(p, arm=None, side=None):
    r6 = lambda v: round(v, 6)
    return {
        "chestEase": r6(p['chestEase']),
        "waistEase": 0.05,
        "underbustOffset": 70,
        "neckWidthMult": r6(p['mult']),
        "frontNeckWidthFactor": 0.17,
        "backNeckWidthFactor": 0.197,
        "backNeckCutoutFactor": 0.06,
        "maxNeckShoulderShare": 0.72,
        "sinShoulderSlope": r6(p['sin']),
        "cosShoulderSlope": r6(p['cos']),
        "shoulderSeamTargetMM": r6(p['L']),
        "armholeDepthFactor": 0.44,
        "bicepsRatioForArmscye": 0.30,
        "armscyeArmFactor": 0.60,
        "armscyeMaxDepthShare": 0.72,
        "backWaistShare": 0.48,
        "centerBackReduction": 0.35,
        "frontBalanceDrop": r6(p['fbd']),
        "extSideTakeCap": side['extSideTakeCap'] if side else 15,
        "squareNeckDrop": r6(p['sqDrop']),
        "cutInMM": CUT_IN,
        "underarmRaiseMM": 6,
        "hollowShareFront": r6(arm['hollowShareFront']) if arm else 0.34,
        "hollowShareBack": 0.24,
        "tangentShare": r6(arm['tangentShare']) if arm else 0.26,
        "lowerDropShare": r6(arm['lowerDropShare']) if arm else 0.78,
        "hipExtendEase": r6(p['hipExt']),
    }


def body_cm(p, chart):
    return [round(chart['bustMM'] / 10, 4), round(chart['waistMM'] / 10, 4),
            round(chart['hipMM'] / 10, 4), round(p['shoulderMM'] / 10, 4),
            round(p['bl'] / 10, 4), ARM_CM, NECK_CM]


def draft_landmarks(binary, recipe_path, body, extend):
    bodyarg = 'custom:' + ','.join(f'{v:g}' for v in body)
    out = subprocess.run([binary, recipe_path, bodyarg, f'{extend:.4f}'],
                         capture_output=True, text=True)
    if out.returncode != 0:
        raise SystemExit(f'draft HATA: {out.stderr.strip()}')
    poly = rc.draft_piece_poly(json.loads(out.stdout), 'Top Front')
    return rc.landmarks([(pt, True) for pt in poly])


def sew_targets(T):
    """Kesim-yereli hedefler → dikiş (sew) çerçevesi hedefleri; kapalı geometri.
    Genel bağıntı: cut_local = sew + pay·n̂ + (pay, pay)  [kesim bbox'ı dikişin
    pay kadar dışında: sol/üst uçlar dik teğetli]. Landmark başına n̂:
    - W: sol CF kenarı dikey + sağ uç dikey teğet → tam -2·pay
    - H: üst köşe beveli (~-pay·cos(omuz eğimi), ±0.6mm ihmal) + etek +pay → -2·pay
    - underarm: kenar normali +x → y'ye yalnız çerçeve: -pay
    - hemSide köşesi: yan normal +x, etek normal +y → (-2·pay, -2·pay)
    - neckPt köşesi: n̂ ≈ (0,-1) → (x-pay, 0); tip köşesi: n̂ ≈ (0,-1) + eksen-dışı
      bileşen ihmal (≤8mm, gate-dışı omuz sabitlerine gider; defterde işaretli)
    - cfNeckY: yaka kesimi oyuğun İÇİNE +pay (dikiş +pay aşağıda), çerçeve -pay:
      birbirini götürür → aynen"""
    sa = SEAM_MM
    return {'W': T['W'] - 2 * sa, 'H': T['H'] - 2 * sa,
            'neckPtX': T['neckPtX'] - sa,
            'tipX': T['tipX'] - sa, 'tipY': T['tipY'],
            'cfNeckY': T['cfNeckY'],
            'underarmY': T['underarmY'] - sa,
            'hemSideX': T['hemSideX'] - 2 * sa, 'hemSideY': T['hemSideY'] - 2 * sa}


def main():
    trace_path, geom_path, binary, out_recipe, out_fit, out_defter = sys.argv[1:7]
    doc, segs = rc.load_trace(trace_path)
    walk = rc.flatten(segs)
    lm = rc.landmarks(walk)
    chart = json.load(open(geom_path))['sizeChartMM'][doc['size']]
    body_mm = {'bust': chart['bustMM'], 'waist': chart['waistMM'], 'hip': chart['hipMM']}
    # kesim-çizgisi hedefleri (izlenen kontur = kesim çizgisi)
    T = {'W': lm['W'], 'H': lm['H'], 'neckPtX': lm['neckPt'][0],
         'tipX': lm['tip'][0], 'tipY': lm['tip'][1],
         'cfNeckY': lm['cfNeck'][1], 'underarmY': lm['underarm'][1],
         'hemSideX': lm['hemSide'][0], 'hemSideY': lm['hemSide'][1]}
    E = sew_targets(T)
    dart = rc.find_dart(walk)
    p = solve_params(E, body_mm, strict=True)
    arm = fit_armhole(walk, T, E, p)
    side = fit_side(walk, T, E, p, dart)
    if side is not None:
        # sideTake = cap dalı korunmalı: cap <= frontReduction, yoksa fit düşer
        front_wt = body_mm['waist'] * 0.52 / 2 * 1.05
        if side['extSideTakeCap'] > E['W'] - front_wt:
            side = None
    consts = build_consts(p, arm, side)
    dart_scalars, has_dart = dart_fields(dart, walk, E, p)
    rec = recipe_template(consts, extend_range(p), dart_scalars, has_dart)
    with open(out_recipe, 'w') as f:
        json.dump(rec, f, indent=2)
        f.write('\n')
    body = body_cm(p, chart)
    # çizim-sonrası kalıntı (yalnız RAPOR; hakem ring-compare mandalı)
    A = draft_landmarks(binary, out_recipe, body, p['extend'])
    Ad = {'W': A['W'], 'H': A['H'], 'neckPtX': A['neckPt'][0],
          'tipX': A['tip'][0], 'tipY': A['tip'][1],
          'cfNeckY': A['cfNeck'][1], 'underarmY': A['underarm'][1],
          'hemSideX': A['hemSide'][0], 'hemSideY': A['hemSide'][1]}
    resid = {k: T[k] - Ad[k] for k in T}
    fit = {
        'tool': 'ring2recipe v1',
        'source': os.path.basename(trace_path),
        'recipe': rec['id'],  # sabit reçete kimliği — çıktı yolu değil (determinizm)
        'bodyCM': {'bustCM': body[0], 'waistCM': body[1], 'hipCM': body[2],
                   'shoulderCM': body[3], 'backLengthCM': body[4],
                   'armLengthCM': body[5], 'neckCM': body[6]},
        'bodySource': 'Bugra size chart ' + doc['size'] +
                      ' (bust/waist/hip) + fit (shoulder/backLength) + EU38 std (neck/arm)',
        'params': {'extendMM': round(p['extend'], 4)},
    }
    with open(out_fit, 'w') as f:
        json.dump(fit, f, indent=2)
        f.write('\n')
    write_defter(out_defter, doc, chart, T, E, p, dart, dart_scalars, resid, arm, side)
    print(f'ring2recipe v1 | {doc["pattern"]} {doc["piece"]} beden {doc["size"]}')
    print('cizim-sonrasi kalintilar (kesim hedef - cizilen kural-tabanli, mm): '
          + ' '.join(f'{k}={v:+.2f}' for k, v in resid.items()))
    print(f'recete: {out_recipe}')
    print(f'fit:    {out_fit}')
    print(f'defter: {out_defter}')
    return 0


def extend_range(p):
    # Buğra Locket bel-altı kısa (üst, elbise değil): tunic tablosunun (300)
    # sürekli aralığı fit değerini kapsayacak şekilde alta genişletilir; belge
    # kendi aralığını beyan eder, yorumlayıcı zorlar (RECETE-SPEC §2.2).
    lo = min(40.0, math.floor(p['extend'] / 10) * 10)
    return [lo, 480]


def dart_fields(dart, walk, E, p):
    """Pens V'sini (kesim çerçevesi) dikiş çerçevesine indir: çerçeve kayması
    -10/-10 (kesim bbox'ı dikişin 10mm dışında), kenar ÜSTÜNDEKİ ağız noktaları
    ayrıca kenar normali boyunca -10 (yan dikiş normali ≈ +x). Apeks iç nokta:
    yalnız çerçeve kayması."""
    if not dart:
        return [], False
    pts = [q for q, _ in walk]
    i0, i1 = dart[0], dart[1]
    apex = pts[dart[4]]
    m_low = max((pts[i0], pts[i1]), key=lambda q: q[1])   # alt ağız (etek yönü)
    m_top = min((pts[i0], pts[i1]), key=lambda q: q[1])   # üst ağız (koltukaltı)
    fw = E['W']            # sew frontWidth hedefi
    uy = E['underarmY']
    r2 = lambda v: round(v, 2)
    fields = [
        ('dartMouthLowInMM',   r2(fw - (m_low[0] - 20))),
        ('dartMouthLowDropMM', r2((m_low[1] - 10) - uy)),
        ('dartApexInMM',       r2(fw - (apex[0] - 10))),
        ('dartApexDropMM',     r2((apex[1] - 10) - uy)),
        ('dartMouthTopInMM',   r2(fw - (m_top[0] - 20))),
        ('dartMouthTopDropMM', r2((m_top[1] - 10) - uy)),
    ]
    return fields, True


def write_defter(path, doc, chart, T, E, p, dart, dart_scalars, resid, arm=None, side=None):
    r = lambda v: f'{v:.2f}'
    lines = []
    w = lines.append
    w('FIT DEFTERI — ring2recipe v1 (tracer→reçete köprüsü, köprü v1)')
    w(f'kaynak: {doc["pattern"]} | {doc["piece"]} | beden {doc["size"]} | '
      f'izlenen kontur {doc["raster"]} (trace-ring v3 dökümü)')
    w('kural: her fit sabiti tek yer-iminin motor formülünün TERSİ; sihirli sayı yok.')
    w('çerçeve: izlenen kontur KESİM çizgisi (Buğra payları dahil basar, 1cm; etek 3cm).')
    w('kesim→dikiş indirimi kapalı geometri (sew_targets): bbox uçları dik teğet → W/H -20;')
    w('kenar-üstü yer-imi kenar normali -10; köşe normalinin eksen-dışı bileşeni ihmal')
    w('(≤8mm, yalnız gate-dışı omuz sabitlerine gider). Kural-tabanlı sabit-nokta geri')
    w('beslemesi denendi ve IRAKSADI — bilinçli tek atış; kalıntılar aşağıda raporlu.')
    w('')
    w('YER-İMLERİ (kesim-yereli ölçüm -> sew hedefi, mm):')
    for k in T:
        w(f'  {k}: {r(T[k])} -> {r(E[k])}')
    w('')
    w('GÖVDE (reçete girdisi, çizim değil):')
    w(f'  bust/waist/hip = {chart["bustMM"]}/{chart["waistMM"]}/{chart["hipMM"]} mm '
      f'<- Buğra beden çizelgesi {doc["size"]} (geometry-full.json sizeChartMM; '
      'reçete parametreleri Buğra REFERANS ölçülerine fit edilir)')
    w(f'  shoulderMM = {r(p["shoulderMM"])} <- 2×shoulderHalf; shoulderHalf = '
      f'omuz-ucu x + cutInMM = {r(E["tipX"])}+{CUT_IN:g} (motor: omuz yarımı = shoulderMM/2; '
      'Buğra çizelgesinde omuz yok, konturdan)')
    w(f'  backLengthMM = {r(p["bl"])} <- (underarmY + underarmRaise - shoulderDrop)/armholeDepthFactor '
      f'= ({r(E["underarmY"])}+6-{r(p["L"]*p["sin"])})/0.44 (koltukaltı derinliği tersi; torso dalı doğrulandı)')
    w(f'  neckCM = {NECK_CM:g} (EU38 standardı; yaka genişliğine yalnız neckWidthMult çarpımıyla girer), '
      f'armLengthCM = {ARM_CM:g} (üst reçetede kullanılmıyor)')
    w('')
    w('FIT SABİTLERİ (reçete consts; her satır: değer <- ters çevrim <- yer-imi):')
    w(f'  chestEase = {p["chestEase"]:.6f} <- 4×frontWidth/bust - 1; frontWidth(sew) = {r(E["W"])} '
      '<- kontur max genişlik. NOT: Buğra ön parçayı arkadan geniş keser; motor ön/arka simetrik '
      'böldüğünden ön-parça payı bu sabite katlanır (ön+arka dikilen çevre defter kıyasında).')
    w(f'  hipExtendEase = {p["hipExt"]:.6f} <- 4×hemSideX/hip; hemSideX(sew) = {r(E["hemSideX"])} '
      '<- etek yan köşesi (Buğra 3cm etek payının 1cm payımızdan fazlası extend fitine katlanır)')
    w(f'  sinShoulderSlope = {p["sin"]:.6f}, cosShoulderSlope = {p["cos"]:.6f} '
      f'<- omuz dikişinin ÖLÇÜLEN birim yönü (koşu {r(p["cos"]*p["L"])} / düşüş {r(p["sin"]*p["L"])}); '
      'sin²+cos²=1 kuruluş gereği; motor trig çifti Buğra omuz eğimine fit edildi')
    w(f'  shoulderSeamTargetMM = {p["L"]:.6f} <- omuz dikişi ölçülen uzunluk (yaka noktası→omuz ucu)')
    w(f'  neckWidthMult = {p["mult"]:.6f} <- frontNeckW/(neck×0.17); frontNeckW(sew) = {r(p["A"])} '
      '<- tepe yaka noktası x (Locket geniş yakası: çarpan ölçümden; cap dalları doğrulandı)')
    w(f'  squareNeckDrop = {p["sqDrop"]:.6f} <- CF yaka derinliği - frontNeckW = '
      f'{r(E["cfNeckY"])} - {r(p["A"])} (NEGATİF: Locket yakası geniş ama sığ; kare-yaka modelinde '
      'derinlik = frontNeckW + drop tanımından işaret böyle çıkar)')
    w(f'  frontBalanceDrop = {p["fbd"]:.6f} <- (H - hemSideY) - 10 = '
      f'({r(E["H"])} - {r(E["hemSideY"])}) - 10 (CF eteğin yan köşeden sarkması; model hemSide -10 taşır)')
    w(f'  extendMM (param) = {p["extend"]:.4f} <- H - backLength - frontBalanceDrop '
      f'(bel-altı uzatma; Buğra 30mm etek payı ile 10mm payımızın 20mm farkını içerir — kontur eşleme fiti)')
    if arm:
        w(f'  tangentShare = {arm["tangentShare"]}, hollowShareFront = {arm["hollowShareFront"]}, '
          f'lowerDropShare = {arm["lowerDropShare"]} <- kol oyuğu eğrisi Buğra ölçülü oyuk '
          f'noktalarına iki-kademeli sabit-ızgara LSQ (n={arm["nPts"]}, rms {arm["rms"]:.2f} mm); '
          'motor kolsuz-armscye varsayılanı dışa süpürür, Buğra takma-kol oyuğu içe oyuk (tur 2)')
    else:
        w('  kol oyuğu payları: yetersiz ölçülü nokta — motor varsayılanı korundu')
    if side:
        w(f'  extSideTakeCap = {side["extSideTakeCap"]} <- yan dikiş bel payı, pens altı yan dikiş '
          f'noktalarına tek-değişken ızgara LSQ (n={side["nPts"]}, rms {side["rms"]:.2f} mm); '
          'motor varsayılanı 15mm — Buğra beli yan dikişten daha derin alıyor (tur 3)')
    else:
        w('  extSideTakeCap = 15 (motor varsayılanı; yan fit yapılamadı ya da cap dalı bozulurdu)')
    w('  değişmeyenler: waistEase 0.05, backWaistShare 0.48, hollowShareBack, '
      'yaka faktörleri — motor varsayılanı; yan/kol eğrilerinde kalan fark '
      'nokta-mesafe metriğinde raporlu')
    w('')
    if dart:
        w('YAN GÖĞÜS PENSİ (Buğra baskıda kontura AÇIK basılı V; reçetede marking move/line):')
        w(f'  kontur V: yay {dart[2]:.1f} mm, ağız kirişi {dart[3]:.1f} mm (hull-atlama tespiti)')
        for k, v in dart_scalars:
            w(f'  {k} = {v} (koltukaltı çapası frontWidth/underarmY üzerinden; kesim→dikiş '
              'indirimi: çerçeve -10/-10, kenar noktalarına ek kenar-normali -10)')
        w('')
    w('ÇİZİM-SONRASI KALINTI (kesim hedef - çizilen, kural-tabanlı çıkarım; yalnız rapor,')
    w('hakem ring-compare mandalı; köşe bevel/kural farkları dahildir):')
    w('  ' + ' '.join(f'{k}={v:+.2f}' for k, v in resid.items()))
    w('')
    w('deterministik: tek atış kapalı form + sabit yuvarlama; aynı girdi -> bayt aynı çıktı.')
    with open(path, 'w') as f:
        f.write('\n'.join(lines) + '\n')


if __name__ == '__main__':
    sys.exit(main())
