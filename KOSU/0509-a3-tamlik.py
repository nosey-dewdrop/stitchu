#!/usr/bin/env python3
"""KOSU/0509-a3-tamlik.py — PRIMITIF KUMESININ TAMLIK KANITI (2026-09-09, Damla karari).

Soru: 5 fotograf, 10 prompt (4'u sozluk disi) ve Bugra'nin iki kalibi YALNIZ contract/graf-v1.json
oplar kumesiyle yazilabiliyor mu? Cevap tablo DEGIL, kosturmadir: her girdi icin bir primitif emir
listesi (ops.json) yazilir, motor (engine/build/grafuygula) tabana uygular, dogrulayici
(engine/build/grafdogrula gercek36) olcer, cizici (grafciz --ops croquis36 flat) cizer. Yazilamayan
her kalem eksikPrimitif olarak GEOMETRIK adiyla tabloya girer; fotograf/prompt basina op eklenmez.

Cikti: KOSU/ciktilar/giris/tamlik/<ad>/{ops.json, graf.json, flat.svg, flat.png, dogrula.json}
       KOSU/ciktilar/giris/TAMLIK.md (tablo)  +  KOSU/ciktilar/giris/tamlik-kontak.{svg,png}
Kosum: python3 KOSU/0509-a3-tamlik.py            (repo kokunden; ~2 dk, Chrome png)
       python3 KOSU/0509-a3-tamlik.py --pngsiz   (png uretmez)
"""
import json, os, re, subprocess, sys, glob
from collections import OrderedDict as OD

KOK = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True).stdout.strip()
os.chdir(KOK)
TABAN = "KOSU/ciktilar/graf-ilk/graf.json"
DIZIN = "KOSU/ciktilar/giris/tamlik"
PNG = "--pngsiz" not in sys.argv

# ------------------------------------------------------------------ RefPoint yardimcilari (uydurma mm yok)
def A(lm, xFactor=1.0, xOf=None, ring=None, yL=None, yL2=None, yLerp=None):
    d = OD([("landmark", "landmark." + lm)])
    if xOf: d["xOf"] = xOf
    if ring: d["ring"] = "girth." + ring
    d["xFactor"] = xFactor
    if yL: d["yLandmark"] = "landmark." + yL
    if yL2: d["yLandmark2"] = "landmark." + yL2; d["yLerp"] = yLerp
    return d
def combo(*terms): return OD([("combo", [OD([("w", w)] + list(a.items())) for w, a in terms])])
def E(id, kind, frm, to, finish=None, role=None, control=None):
    d = OD([("id", id), ("kind", kind)])
    if role: d["role"] = role
    d["from"] = frm; d["to"] = to
    if control: d["control"] = control
    if finish: d["finish"] = finish
    return d
def P(id, edges, onFold, cutCount, reason, ease=None):
    d = OD([("id", id), ("edges", edges), ("grainDeg", 0), ("onFold", onFold), ("cutCount", cutCount), ("seamAllowanceMM", 0)])
    if ease: d["ease"] = [OD([("ring", "girth." + r), ("mm", mm)]) for r, mm in ease]
    d["reason"] = reason
    return d
def op(name, args): return OD([("op", name), ("args", args)])
def ref(p, e): return OD([("panel", p), ("edge", e)])
X0 = lambda **k: A("waist", 0.0, **k)
Wq = lambda xf=1.0, **k: A("waist", xf, "ringQuarter", **k)

def extendTo(panel, edge, lm): return op("extendTo", OD([("panel", panel), ("edge", edge), ("yLandmark", "landmark." + lm), ("yOffsetMM", 0)]))
def flare(panel, edge, k): return op("flare", OD([("panel", panel), ("edge", edge), ("factor", k)]))
def drop(panel, finish): return op("drop", OD([("panel", panel), ("finish", finish)]))
def sew(seam, a, b, reverse, ratio=1.0): return op("sew", OD([("seam", seam), ("a", [ref(*x) for x in a]), ("b", [ref(*x) for x in b]), ("reverse", reverse), ("ratio", ratio)]))
def fitLength(panel, edge, seam, ratio=1.0): return op("fitLength", OD([("panel", panel), ("edge", edge), ("target", OD([("seam", seam), ("ratio", ratio), ("easeMM", 0)]))]))
def closure(seam, typ, f0, f1): return op("closure", OD([("seam", seam), ("type", typ), ("fromFraction", f0), ("toFraction", f1)]))
def subdivide(panel, edge, fr): return op("subdivide", OD([("panel", panel), ("edge", edge), ("fractions", fr)]))
def reshape(panel, edge, **kw): return op("reshapeEdge", OD([("panel", panel), ("edge", edge)] + list(kw.items())))
def split(panel, vA, vB, pA, pB, seam, ratio=1.0): return op("split", OD([("panel", panel), ("vertexA", vA), ("vertexB", vB), ("panelA", pA), ("panelB", pB), ("seam", seam), ("seamRatio", ratio)]))
def merge(seam, a, b, new): return op("merge", OD([("seam", seam), ("panelA", a), ("panelB", b), ("panel", new)]))
def gather(panel, edge, r): return op("gather", OD([("panel", panel), ("edge", edge), ("ratio", r)]))
def mirror(panel, new): return op("mirror", OD([("panel", panel), ("newId", new)]))
def addPanel(panel, onto=None):
    a = OD(); a["onto"] = onto; a["panel"] = panel
    if onto is None: del a["onto"]
    return op("addPanel", a)

# ------------------------------------------------------------------ tekrar eden geometri parcalari
def on_kapanma(edges, f0, f1, typ="buttons"):
    return [sew("on_orta", edges, edges, True), closure("on_orta", typ, f0, f1)]

def dik_bant(host_panel="on_beden", host_edge="neck_front", ratio=1.0, pid="boyun_bandi"):
    """boyun hattina dikilen dik bant; yukseklik = 1.5 x ense dususu (landmark.nape), ADIYLA."""
    top_cf = combo((1.0, A("neckFront", 0.0)), (1.5, A("nape", 0.0)), (-1.5, A("neckBase", 0.0)))
    top_sh = combo((1.0, A("neckBase", 1.0)), (1.5, A("nape", 0.0)), (-1.5, A("neckBase", 0.0)))
    edges = [E("alt", "seam", A("neckFront", 0.0), A("neckBase", 1.0), role="neck_front",
               control=[A("neckBase", 0.35, yL="neckFront"), A("neckBase", 0.85, yL="neckFront", yL2="neckBase", yLerp=0.6)]),
             E("dis", "cut", A("neckBase", 1.0), top_sh, finish="faced"),
             E("ust", "cut", top_sh, top_cf, finish="faced"),
             E("cf", "fold", top_cf, A("neckFront", 0.0), role="cf")]
    a = [(host_panel, host_edge)]; b = [(pid, "alt")]
    if ratio > 1.0:  # boyun tarafi buzgulu: a = uzun taraf
        return [addPanel(P(pid, edges, True, 1, "boyun hattinda dik bant; yukseklik 1.5 x ense dususu")),
                sew("boyun_dikisi", a, b, True, ratio), fitLength(pid, "alt", "boyun_dikisi", ratio)]
    return [addPanel(P(pid, edges, True, 1, "boyun hattinda dik bant; yukseklik 1.5 x ense dususu")),
            sew("boyun_dikisi", b, a, True, 1.0), fitLength(pid, "alt", "boyun_dikisi", 1.0)]

def yatik_parca(host_panel, host_edge, on=True, dis_oran=0.45, omuz_oran=0.6, pid=None, seam=None, ic_kind="seam"):
    """boyun hattina dikilen yatik genis parca (koseler SIVRI: cokgen kosesi)."""
    lmN = "neckFront" if on else "nape"
    pid = pid or ("boyun_parca" if on else "boyun_parca_arka"); seam = seam or ("boyun_dikisi" if on else "boyun_dikisi_arka")
    corner = combo((1 - omuz_oran, A("neckBase", 1.0)), (omuz_oran, A("shoulderTip", 1.0)))
    low = X0(yL=lmN, yL2="bustLine", yLerp=dis_oran)
    edges = [E("ic", ic_kind, A(lmN, 0.0), A("neckBase", 1.0), role="neck_front" if on else "neck_back", finish=None if ic_kind == "seam" else "raw",
               control=[A("neckBase", 0.35, yL=lmN), A("neckBase", 0.85, yL=lmN, yL2="neckBase", yLerp=0.6)]),
             E("omuz_ustu", "cut", A("neckBase", 1.0), corner, finish="faced"),
             E("dis", "cut", corner, low, finish="faced"),
             E("cf" if on else "cb", "fold" if on else "cut", low, A(lmN, 0.0), finish=None if on else "faced", role="cf" if on else "cb_seam")]
    ops = [addPanel(P(pid, edges, on, 1 if on else 2, f"boyun hattina dikili yatik parca; omuz ustunde {omuz_oran}, ortada {dis_oran} (neck..bustLine)"))]
    if ic_kind == "seam":
        ops += [sew(seam, [(pid, "ic")], [(host_panel, host_edge)], True), fitLength(pid, "ic", seam, 1.0)]
    return ops

def kol_bandi(ratio):
    """kol agzina dikilen bant: ust kenar kubik, uzunlugu dikise kisitli (her bedende cozulur)."""
    W = lambda xf, lerp=None: A("underarm", xf, "ringQuarter", "wrist", yL="wrist", yL2=None if lerp is None else "elbow", yLerp=lerp)
    edges = [E("ust", "seam", W(2.0), W(-2.0), role="sleeve_hem", control=[W(0.7), W(-0.7)]),
             E("dis", "cut", W(-2.0), W(-2.0, -0.12), finish="hem"),
             E("alt", "cut", W(-2.0, -0.12), W(2.0, -0.12), finish="hem"),
             E("ic", "cut", W(2.0, -0.12), W(2.0), finish="hem")]
    return [addPanel(P("kol_bandi", edges, False, 2, "kol agzi bandi; yukseklik bilek-dirsek araliginin 0.12'si")),
            sew("kol_agzi_dikisi", [("kol", "hem")], [("kol_bandi", "ust")], False, ratio),
            fitLength("kol_bandi", "ust", "kol_agzi_dikisi", ratio)]

def bel_bandi(on=True):
    pid = "on_bel_bandi" if on else "arka_bel_bandi"; host = "on_etek" if on else "arka_etek"
    w1, w2 = ("waist_front.1", "waist_front.2") if on else ("waist_back.1", "waist_back.2")
    top = lambda xf: A("waist", xf, "ringQuarter", yL="waist", yL2="underbust", yLerp=0.3)
    # alt kenar ucu 0.88 x bel ceyregi: dikilen bel zinciri pens agzi kadar kisadir (kubik kirisinden kisa olamaz; kalan fark fitLength'te)
    edges = [E("alt", "seam", X0(), Wq(0.88), role="waist_front" if on else "waist_back", control=[Wq(0.3), Wq(0.6)]),
             E("dis", "cut", Wq(0.88), top(1.0), finish="faced"),
             E("ust", "cut", top(1.0), A("waist", 0.0, yL="waist", yL2="underbust", yLerp=0.3), finish="faced"),
             E("cf" if on else "cb", "fold" if on else "cut", A("waist", 0.0, yL="waist", yL2="underbust", yLerp=0.3), X0(), finish=None if on else "faced", role="cf" if on else "cb_seam")]
    return [addPanel(P(pid, edges, on, 1 if on else 2, "bel bandi; yukseklik bel-gogusalti araliginin 0.3'u")),
            sew(("on" if on else "arka") + "_bel_dikisi", [(host, w1), (host, w2)], [(pid, "alt")], True),
            fitLength(pid, "alt", ("on" if on else "arka") + "_bel_dikisi", 1.0)]

def keyhole(panel="on_beden"):
    return [subdivide(panel, "cf", [0.35]),
            reshape(panel, "cf.1", to=X0(yL="neckFront", yL2="bustLine", yLerp=0.55), kind="cut", finish="faced",
                    control=[A("neckFront", 0.15, "ringQuarter", "neckBase", yL="neckFront", yL2="bustLine", yLerp=0.15),
                             A("neckFront", 0.15, "ringQuarter", "neckBase", yL="neckFront", yL2="bustLine", yLerp=0.45)])]

def prenses(on=True):
    """prenses dikisi: pens apeksinden kol oyuguna kesim; pens bacaklari dikise EMILIR (dartLeg -> seam)."""
    p = "on_beden" if on else "arka_beden"; arm = "armhole_front.1" if on else "armhole_back.1"
    d = "dart_on_beden" if on else "dart_arka_beden"; pre = "on" if on else "arka"
    return [subdivide(p, arm, [0.5]),
            split(p, d + ".2", arm + ".2", pre + "_yan", pre + "_orta", pre + "_prenses"),
            reshape(pre + "_yan", d + ".2", kind="seam"), reshape(pre + "_orta", d + ".1", kind="seam"),
            sew(pre + "_prenses_alt", [(pre + "_yan", d + ".2")], [(pre + "_orta", d + ".1")], True)]

def ust_kesim(on=True):
    """straplez ust kenar: CF/CB'de koltukalti hizasinda, yanda koltukalti kosesinde kesim; ust parca kaldirilir."""
    p = "on_beden" if on else "arka_beden"; eks = "cf" if on else "cb"; arm = "armhole_front.1" if on else "armhole_back.1"; pre = "on" if on else "arka"
    ops = [subdivide(p, eks, [0.5]), reshape(p, eks + ".1", to=X0(yL="underarm")),
           split(p, eks + ".2", arm, pre + "_alt", pre + "_ust", pre + "_ust_kesim"), drop(pre + "_ust", "faced")]
    if not on:  # arka orta kapanma dikisi ust parcayla birlikte silinir; alt parcada yeniden dikilir
        ops += [sew("arka_orta_alt", [("arka_alt", "cb.2")], [("arka_alt", "cb.2")], True), closure("arka_orta_alt", "zipper", 0, 1)]
    return ops

# ------------------------------------------------------------------ PROGRAMLAR
PROG = []
def prog(ad, girdi, kaynak, ops, eksik=(), not_=""):
    PROG.append(OD([("ad", ad), ("girdi", girdi), ("kaynak", kaynak), ("ops", ops), ("eksik", list(eksik)), ("not", not_)]))

prog("P1-keskin-koseli-yaka", "yatik bebe yaka ama koseleri sivri, kisa kollu, A etekli midi elbise", "KOSU/regresyon/girdiler.json P1",
     yatik_parca("on_beden", "neck_front", dis_oran=0.4, omuz_oran=0.6) + [flare("on_etek", "hem_front", 1.3), flare("arka_etek", "hem_back", 1.3),
     extendTo("on_etek", "hem_front", "knee"), extendTo("arka_etek", "hem_back", "knee")],
     eksik=["PRIMITIF: extendTo{yLandmark, yLandmark2, yLerp} — kenari iki landmark ARASI bir orana baglama (bugun yalniz tek landmark); omuz-dirsek arasi kol agzi boyu bununla yazilir"])

prog("P2-ayrik-panelli-buzgulu-kol", "prenses dikisli beden, balon kol, kolda lastik buzgu, uzun kollu maxi elbise", "girdiler.json P2",
     prenses(True) + prenses(False) + [extendTo("kol", "hem", "wrist"), gather("kol", "hem", 1.3)] + kol_bandi(2.2) +
     [extendTo("on_etek", "hem_front", "ankle"), extendTo("arka_etek", "hem_back", "ankle")],
     eksik=["OKUMA: bant dikisinin orani (2.2) secildi; lastik esnemesi kumas katalogundan gelir (A6 fabric-catalog), graf eksigi degil",
            "COZUCU (A6): dikise gomulu supresyon — A4 kapisi artik OLCUYOR (EMILMEYEN 37.62 mm: dikilen bel 722.62 vs 685.00), ama cozucu prenses dikisine intake yazmiyor; bacaklar seam olunca cozPens onlari gormez",
            "OKUMA/PROGRAM: kol agzi 1.3 acilinca koltukalti kenari kapakla kesisiyor (kendini_kesme kol); reshapeEdge ile duzeltilebilir, bu programda yazilmadi"])

prog("P3-etek-tek-topoloji", "A formlu kemerli midi etek", "girdiler.json P3",
     [drop("kol", "faced"), drop("on_beden", "faced"), drop("arka_beden", "faced")] + bel_bandi(True) + bel_bandi(False) +
     [flare("on_etek", "hem_front", 1.3), flare("arka_etek", "hem_back", 1.3), extendTo("on_etek", "hem_front", "knee"), extendTo("arka_etek", "hem_back", "knee")],
     eksik=["COZUCU (A6): cozum SIRASI — grafdogrula once fitLength (band kenari) sonra pens agzini (cozPens) cozuyor; A4 agiz/yan tepe kaydirmasi bandi yeniden uydurmuyor (dikis_uzunluk bel bandi, kendini_kesme bant)"])

prog("P4-kolsuz-dik-yaka-mini", "kolsuz, dik yakali, mini A etekli elbise", "girdiler.json P4",
     [drop("kol", "faced")] + dik_bant() + [flare("on_etek", "hem_front", 1.3), flare("arka_etek", "hem_back", 1.3),
     extendTo("on_etek", "hem_front", "crotch"), extendTo("arka_etek", "hem_back", "crotch")])

_fall_top_cf = combo((1.0, A("neckFront", 0.0)), (1.5, A("nape", 0.0)), (-1.5, A("neckBase", 0.0)))
_fall_top_sh = combo((1.0, A("neckBase", 1.0)), (1.5, A("nape", 0.0)), (-1.5, A("neckBase", 0.0)))
_fall = P("boyun_ust_parca", [
    E("alt", "seam", _fall_top_cf, _fall_top_sh, control=[combo((1.0, A("neckBase", 0.3)), (1.5, A("nape", 0.0)), (-1.5, A("neckBase", 0.0))), combo((1.0, A("neckBase", 0.7)), (1.5, A("nape", 0.0)), (-1.5, A("neckBase", 0.0)))]),
    E("dis", "cut", _fall_top_sh, A("neckBase", 1.6, yL="neckBase", yL2="neckFront", yLerp=0.9), finish="faced"),
    E("uc", "cut", A("neckBase", 1.6, yL="neckBase", yL2="neckFront", yLerp=0.9), X0(yL="neckFront", yL2="bustLine", yLerp=0.15), finish="faced"),
    E("cf", "fold", X0(yL="neckFront", yL2="bustLine", yLerp=0.15), _fall_top_cf, role="cf")], True, 1, "bandin ust kenarina dikilen sivri uclu ust parca")
prog("P5-ust-gomlek-yaka-buzgu", "gomlek yakali, uzun kollu, yakasi buzgulu bluz", "girdiler.json P5",
     [drop("on_etek", "hem"), drop("arka_etek", "hem"),
      extendTo("on_beden", "waist_front.1", "highHip"), extendTo("on_beden", "waist_front.2", "highHip"),
      extendTo("arka_beden", "waist_back.1", "highHip"), extendTo("arka_beden", "waist_back.2", "highHip"),
      gather("on_beden", "neck_front", 1.3), gather("arka_beden", "neck_back", 1.3)] + dik_bant(ratio=1.3) +
     [addPanel(_fall), sew("boyun_ust_dikisi", [("boyun_ust_parca", "alt")], [("boyun_bandi", "ust")], True), fitLength("boyun_ust_parca", "alt", "boyun_ust_dikisi", 1.0),
      extendTo("kol", "hem", "wrist")],
     eksik=["OKUMA/PROGRAM: bel altina uzayan bedende pens apeksi yerinde kalir, pens etek ucuna acik iner; reshapeEdge ile apeks tasinabilir, bu programda yazilmadi",
            "PRIMITIF: slashSpread{panel, edge, ratio} — kenara kumas EKLEME (yarip acma); gather komsu koseleri tasiyor, omuz/oyuk uzunlugu bozuluyor, band kisiti (1.3) cozulmuyor (kisit, boyun_ust_dikisi, kol_oyugu kirmizilari)"])

prog("P6-a2-cumlesi", "bel dikisli, kolsuz, yuvarlak yakali, etek ucu genisleyen, arkadan kapanan elbise", "0509-kosu.md A2 girdi cumlesi",
     [drop("kol", "faced"), flare("on_etek", "hem_front", 1.3), flare("arka_etek", "hem_back", 1.3)])

_fiyonk = P("bel_fiyonk", [E("ust", "cut", Wq(0.55, yL="waist", yL2="underbust", yLerp=0.15), Wq(0.95, yL="waist", yL2="underbust", yLerp=0.15), finish="hem"),
                           E("dis", "cut", Wq(0.95, yL="waist", yL2="underbust", yLerp=0.15), Wq(0.95, yL="waist", yL2="highHip", yLerp=0.15), finish="hem"),
                           E("alt", "cut", Wq(0.95, yL="waist", yL2="highHip", yLerp=0.15), Wq(0.55, yL="waist", yL2="highHip", yLerp=0.15), finish="hem"),
                           E("ic", "cut", Wq(0.55, yL="waist", yL2="highHip", yLerp=0.15), Wq(0.55, yL="waist", yL2="underbust", yLerp=0.15), finish="hem")], False, 1, "bel hizasinda yuze dikili serit (fiyonk govdesi)")
prog("P7-tek-omuz-asimetrik-fiyonk", "bel hizasinda fiyonklu tek omuz asimetrik elbise (SOZLUK DISI)", "A6 brief, 4 sozluk disi prompt",
     [mirror("on_beden", "on_ayna"), mirror("arka_beden", "arka_ayna"), mirror("on_etek", "on_etek_ayna"), mirror("arka_etek", "arka_etek_ayna"), mirror("kol", "kol_ayna"),
      sew("omuz_2", [("on_ayna", "shoulder")], [("arka_ayna", "shoulder")], False),
      sew("yan_beden_2", [("on_ayna", "side_front")], [("arka_ayna", "side_back")], False),
      sew("yan_etek_2", [("on_etek_ayna", "side_front.1"), ("on_etek_ayna", "side_front.2")], [("arka_etek_ayna", "side_back.1"), ("arka_etek_ayna", "side_back.2")], False),
      sew("bel_2", [("on_ayna", "waist_front.1"), ("on_ayna", "waist_front.2"), ("arka_ayna", "waist_back.2"), ("arka_ayna", "waist_back.1")],
                   [("on_etek_ayna", "waist_front.2"), ("on_etek_ayna", "waist_front.1"), ("arka_etek_ayna", "waist_back.1"), ("arka_etek_ayna", "waist_back.2")], False),
      sew("kol_oyugu_2", [("kol_ayna", "cap_back"), ("kol_ayna", "cap_front")], [("arka_ayna", "armhole_back.1"), ("arka_ayna", "armhole_back.2"), ("on_ayna", "armhole_front.2"), ("on_ayna", "armhole_front.1")], False, 1.04),
      sew("kol_alti_2", [("kol_ayna", "underarm_front")], [("kol_ayna", "underarm_back")], True),
      sew("on_orta_kat", [("on_beden", "cf")], [("on_ayna", "cf")], True), merge("on_orta_kat", "on_beden", "on_ayna", "on_tam"),
      sew("on_etek_kat", [("on_etek", "cf")], [("on_etek_ayna", "cf")], True), merge("on_etek_kat", "on_etek", "on_etek_ayna", "on_etek_tam"),
      # tek omuz: ayna tarafinin omuz + boyun kenari tek egik serbest kenar olur (sag omuzdan sol koltukaltina)
      reshape("on_tam", "shoulder.2", kind="cut", finish="faced"),
      addPanel(_fiyonk, onto="on_tam")],
     eksik=["PRIMITIF: resew{seam, a, b} — var olan dikisin kenar referanslarini yeniden yazma; ayna sonrasi kendi-ayna dikisi (arka_orta_beden: a=b=arka_beden/cb) iki panele acilamiyor, arka_ayna/cb acik kalir (kapanma/dikis_cifti kirmizi, ERR_NO_VIEW)",
            "PRIMITIF: joinEdges{panel, edgeA, edgeB} — bitisik iki kenari tek kenar yapma (subdivide'in tersi); tek omuzun egik hatti shoulder.2 + neck_front.2 tek kenar olmali"],
     not_="KISMEN: ayna + 6 dikis + iki birlestirme motordan gecti; kalan iki kalem eksikPrimitif")

_kimono_top = A("shoulderTip", 2.2, yL="shoulderTip", yL2="elbow", yLerp=0.3)
_kimono_alt = A("shoulderTip", 2.2, yL="underarm", yL2="elbow", yLerp=0.3)
prog("P8-kimono-kollu-wrap", "kimono kollu wrap (SOZLUK DISI)", "A6 brief",
     [drop("kol", "faced"),
      op("moveVertex", OD([("panel", "on_beden"), ("edge", "shoulder"), ("to", _kimono_top)])), op("moveVertex", OD([("panel", "on_beden"), ("edge", "armhole_front.2"), ("to", _kimono_alt)])),
      reshape("on_beden", "armhole_front.2", kind="cut", finish="hem", control=[]),
      op("moveVertex", OD([("panel", "arka_beden"), ("edge", "shoulder"), ("to", _kimono_top)])), op("moveVertex", OD([("panel", "arka_beden"), ("edge", "armhole_back.2"), ("to", _kimono_alt)])),
      reshape("arka_beden", "armhole_back.2", kind="cut", finish="hem", control=[]),
      reshape("on_beden", "armhole_front.1", control=[]), reshape("arka_beden", "armhole_back.1", control=[]),
      sew("kol_alti_kimono", [("on_beden", "armhole_front.1")], [("arka_beden", "armhole_back.1")], False)],
     eksik=["PRIMITIF: resew (P7 ile ayni) — wrap on parca CF'yi asip obur yan dikise gider; ayna + kendi-ayna dikisini acma gerekir"],
     not_="kimono kol: kol paneli kaldirilip omuz/oyuk koseleri disari tasindi (moveVertex), koltukalti hatti one-arkaya dikildi")

def _etek_bandi(on=True):
    pid = "on_etek_bandi" if on else "arka_etek_bandi"; host = "on_etek" if on else "arka_etek"; hem = "hem_front" if on else "hem_back"
    H = lambda xf, lerp=None: A("hip", xf, "ringQuarter", "hip", yL="knee", yL2=None if lerp is None else "ankle", yLerp=lerp)
    edges = [E("ust", "seam", X0(yL="knee"), H(1.0), role="hem_front" if on else "hem_back", control=[H(0.3), H(0.7)]),
             E("dis", "cut", H(1.0), H(1.0, 0.08), finish="hem"), E("alt", "cut", H(1.0, 0.08), X0(yL="knee", yL2="ankle", yLerp=0.08), finish="hem"),
             E("cf" if on else "cb", "fold" if on else "cut", X0(yL="knee", yL2="ankle", yLerp=0.08), X0(yL="knee"), finish=None if on else "faced", role="cf" if on else "cb_seam")]
    return [addPanel(P(pid, edges, on, 1 if on else 2, "etek ucu bandi (balon: etek ucu banda buzulur)")),
            sew(pid + "_dikisi", [(host, hem)], [(pid, "ust")], False, 1.5), fitLength(pid, "ust", pid + "_dikisi", 1.5)]
prog("P9-korse-ustlu-balon-etek", "korse ustlu balon etek (SOZLUK DISI)", "A6 brief",
     [drop("kol", "faced")] + ust_kesim(True) + ust_kesim(False) +
     [gather("on_etek", "hem_front", 1.5), gather("arka_etek", "hem_back", 1.5)] + _etek_bandi(True) + _etek_bandi(False),
     eksik=["OKUMA: ust kenar duz (koltukalti hizasi); gogus ustu kavis icin kontrol noktasi orani verilmedi, uydurulmadi"])

prog("P10-keyhole-yakali-dropped-waist", "keyhole yakali dropped waist (SOZLUK DISI)", "A6 brief",
     keyhole() + [extendTo("on_beden", "waist_front.1", "highHip"), extendTo("on_beden", "waist_front.2", "highHip"),
                  extendTo("on_etek", "waist_front.1", "highHip"), extendTo("on_etek", "waist_front.2", "highHip"),
                  extendTo("arka_beden", "waist_back.1", "highHip"), extendTo("arka_beden", "waist_back.2", "highHip"),
                  extendTo("arka_etek", "waist_back.1", "highHip"), extendTo("arka_etek", "waist_back.2", "highHip")])

# ---- Bugra 1: Buttoned Corset Bustier (patterns_real/BUGRA-DEFTER.md §1): ust kap + alt kap + yan on + orta on + yan arka + orta arka (kat)
prog("BUGRA-1-buttoned-corset-bustier", "Bugra Buttoned Corset Bustier: 6 parca — upper cup, lower cup, front side, front center, back side, back center (fold); onden dugmeli", "patterns_real/BUGRA-DEFTER.md §1",
     [drop("kol", "faced"), drop("on_etek", "hem"), drop("arka_etek", "hem")] + ust_kesim(True) + ust_kesim(False) +
     [subdivide("on_alt", "on_ust_kesim.a", [0.6]),
      split("on_alt", "dart_on_beden.2", "on_ust_kesim.a.2", "on_yan", "on_orta", "on_prenses"),
      reshape("on_yan", "dart_on_beden.2", kind="seam"), reshape("on_orta", "dart_on_beden.1", kind="seam"),
      sew("on_prenses_alt", [("on_yan", "dart_on_beden.2")], [("on_orta", "dart_on_beden.1")], True),
      # kap dikisi: orta on parcada yatay kesme (ust kap / alt kap)
      subdivide("on_orta", "cf.2", [0.5]), subdivide("on_orta", "on_prenses.b", [0.5]),
      split("on_orta", "cf.2.2", "on_prenses.b.2", "on_alt_kap", "on_ust_kap", "kap_dikisi"),
      # arka prenses
      subdivide("arka_alt", "arka_ust_kesim.a", [0.6]),
      split("arka_alt", "dart_arka_beden.2", "arka_ust_kesim.a.2", "arka_yan", "arka_orta", "arka_prenses"),
      reshape("arka_yan", "dart_arka_beden.2", kind="seam"), reshape("arka_orta", "dart_arka_beden.1", kind="seam"),
      sew("arka_prenses_alt", [("arka_yan", "dart_arka_beden.2")], [("arka_orta", "dart_arka_beden.1")], True),
      # on dugme: orta on kat kenarlari (ust kap + alt kap) kendi aynasiyla dikilir
      sew("on_orta_dugme", [("on_ust_kap", "cf.2.1"), ("on_alt_kap", "cf.2.2")], [("on_ust_kap", "cf.2.1"), ("on_alt_kap", "cf.2.2")], True),
      closure("on_orta_dugme", "buttons", 0.05, 0.95)],
     eksik=["Bugra'da orta arka KATLI ve kapanma onde: tabanin arka orta fermuar dikisi ust kesimle silinip alt parcada yeniden dikildi (arka_orta_alt zipper); fermuari HIC dikmemek icin dikis kaldiran primitif yok -> arka kapanma fazladan (Bugra'da yok)",
            "OKUMA/PROGRAM: kap dikisi duz (kavis orani yok); kesim noktasi apeksin altinda secildi, pens-dikisiyle kesisiyor (kendini_kesme on_alt_kap) — program duzeltilmedi",
            "COZUCU (A6): supresyon kapisi A4'te EMILMEYEN'i olcuyor (37.62 mm, KIRMIZI: pens yok, kup dikislerine intake yazilmamis); dikise gomulu intake cozucusu yok"],
     not_="6 parca: on_ust_kap, on_alt_kap, on_yan, arka_orta, arka_yan (+ arka orta 2 parca, kat degil)")

# ---- Bugra 2: Locket Top: front body (buttons), back body (dart, hip length), collar + lining, lower/upper sleeve (upper gathered %29-35)
_astar = P("boyun_parca_astar", [
    E("ic", "cut", A("neckFront", 0.0), A("neckBase", 1.0), finish="raw", control=[A("neckBase", 0.35, yL="neckFront"), A("neckBase", 0.85, yL="neckFront", yL2="neckBase", yLerp=0.6)]),
    E("omuz_ustu", "seam", A("neckBase", 1.0), combo((0.5, A("neckBase", 1.0)), (0.5, A("shoulderTip", 1.0)))),
    E("dis", "seam", combo((0.5, A("neckBase", 1.0)), (0.5, A("shoulderTip", 1.0))), X0(yL="neckFront", yL2="bustLine", yLerp=0.35)),
    E("cf", "fold", X0(yL="neckFront", yL2="bustLine", yLerp=0.35), A("neckFront", 0.0), role="cf")], True, 1, "yatik parcanin astari; dis kenarlari parcaya dikilir")
prog("BUGRA-2-locket-top", "Bugra Locket Top: front body (dugmeli), back body (bel pensi, kalca boyu), collar + collar lining, lower sleeve + upper sleeve (%29-35 buzgulu)", "patterns_real/BUGRA-DEFTER.md §2",
     [drop("on_etek", "hem"), drop("arka_etek", "hem"),
      extendTo("on_beden", "waist_front.1", "hip"), extendTo("on_beden", "waist_front.2", "hip"),
      extendTo("arka_beden", "waist_back.1", "hip"), extendTo("arka_beden", "waist_back.2", "hip")] +
     on_kapanma([("on_beden", "cf")], 0.05, 0.95) +
     yatik_parca("on_beden", "neck_front", dis_oran=0.35, omuz_oran=0.5, pid="boyun_parca", seam="boyun_dikisi") +
     [addPanel(_astar), sew("astar_dikisi", [("boyun_parca", "omuz_ustu"), ("boyun_parca", "dis")], [("boyun_parca_astar", "omuz_ustu"), ("boyun_parca_astar", "dis")], False),
      subdivide("kol", "underarm_front", [0.5]), subdivide("kol", "underarm_back", [0.5]),
      split("kol", "underarm_back.2", "underarm_front.2", "kol_ust", "kol_alt", "kol_kesim", 1.3)],
     eksik=["PRIMITIF: dart{panel, mouth a/b, apexUp, apexDown} — sifirdan ic halka (balik) pens; bugun Panel.darts yalniz merge ile dogar; Bugra arka bel pensi bu yuzden etek ucuna acik iniyor",
            "OKUMA: astar ic kenari raw (boyun dikisine ikinci katman olarak girmesi ayni-dikise-ucuncu-katman sinirina takilir; PRIMITIF adayi degil, dikis modeli siniri, foto 1 ile ayni)"],
     not_="6 parca: on_beden(2), arka_beden(2), boyun_parca, boyun_parca_astar, kol_ust(2), kol_alt(2)")

# ------------------------------------------------------------------ KOSTUR
def kos(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    return r.returncode, r.stdout, r.stderr

OPLAR = set(k for k in json.load(open("contract/graf-v1.json"))["oplar"] if not k.startswith("_"))
os.makedirs(DIZIN, exist_ok=True)
satirlar = []; kullanilan = set()
for pr in PROG:
    d = f"{DIZIN}/{pr['ad']}"; os.makedirs(d, exist_ok=True)
    json.dump(pr["ops"], open(f"{d}/ops.json", "w"), ensure_ascii=False, indent=1)
    disi = sorted({o["op"] for o in pr["ops"]} - OPLAR)
    rc, out, err = kos(["engine/build/grafuygula", TABAN, f"{d}/ops.json", "--id", pr["ad"]])
    motor = "UYGULANDI" if rc == 0 else ("RED: " + err.strip().split("\n")[-1][:140])
    kir, fails, panel = None, [], None
    if rc == 0:
        open(f"{d}/graf.json", "w").write(out)
        g = json.loads(out); panel = len(g["panels"])
        rc2, out2, err2 = kos(["engine/build/grafdogrula", f"{d}/graf.json", "gercek36", "--json"])
        try:
            j = json.loads(out2); kir = j["kirmizi"]
            fails = sorted({f"{h['kural']}:{h['hedef']}" for h in j["hukumler"] if not h.get("gecti") and not h.get("bilgi")})
            json.dump({"kirmizi": kir, "fails": fails}, open(f"{d}/dogrula.json", "w"), ensure_ascii=False, indent=1)
        except Exception:
            kir = "CRASH"; fails = [err2.strip()[:120]]
        rc3, out3, err3 = kos(["engine/build/grafciz", TABAN, "--ops", f"{d}/ops.json", "croquis36", "flat"])
        if rc3 == 0:
            open(f"{d}/flat.svg", "w").write(out3)
            if PNG: kos(["node", "-e", f"import('./KOSU/0509-a3-png.mjs').then(m=>m.png('{d}/flat.svg','{d}/flat.png',700,900))"])
        else:
            fails.append("CIZIM: " + err3.strip().split("\n")[-1][:100])
    else:
        for f in ("graf.json", "flat.svg", "flat.png", "dogrula.json"):
            try: os.remove(f"{d}/{f}")
            except FileNotFoundError: pass
    kullanilan |= {o["op"] for o in pr["ops"]}
    satirlar.append(OD([("ad", pr["ad"]), ("girdi", pr["girdi"]), ("kaynak", pr["kaynak"]), ("opSayisi", len(pr["ops"])),
                        ("primitifler", sorted({o["op"] for o in pr["ops"]})), ("kumeDisi", disi), ("motor", motor), ("panel", panel),
                        ("kirmizi", kir), ("fails", fails), ("eksik", pr["eksik"]), ("not", pr["not"])]))
    print(f"{pr['ad']:<36} op={len(pr['ops']):>2} motor={motor[:40]:<40} panel={panel} kirmizi={kir} {('; '.join(fails))[:120]}")

# fotograf satirlari (giris/1..5)
foto = []
for n in range(1, 6):
    d = f"KOSU/ciktilar/giris/{n}"
    ops = json.load(open(f"{d}/ops.json")); kaynak = open(f"{d}/kaynak-yolu.txt").read().split("\n")
    sha = kaynak[1].split(" ")[1]; okuma = json.load(open(f"KOSU/onbellek/{sha}.json"))
    rc2, out2, _ = kos(["engine/build/grafdogrula", f"{d}/graf.json", "gercek36", "--json"])
    j = json.loads(out2)
    fails = sorted({f"{h['kural']}:{h['hedef']}" for h in j["hukumler"] if not h.get("gecti") and not h.get("bilgi")})
    kullanilan |= {o["op"] for o in ops}
    foto.append(OD([("no", n), ("girdi", kaynak[0].split("/")[-1]), ("opSayisi", len(ops)), ("primitifler", sorted({o["op"] for o in ops})),
                    ("kirmizi", j["kirmizi"]), ("fails", fails), ("eksik", okuma.get("eksikPrimitif", []))]))

# ------------------------------------------------------------------ TABLO
def li(xs): return "<br>".join(xs) if xs else "—"
md = ["# Primitif kumesinin TAMLIK kaniti — 5 fotograf, 10 prompt, Bugra'nin 2 kalibi", "",
      "Uretici: `python3 KOSU/0509-a3-tamlik.py`. Her satir motordan GECTI ya da adiyla RED; tablo elle yazilmadi.",
      "Kume: `contract/graf-v1.json` oplar (19 op). Kural (Damla, 9 Eyl): fotograf/prompt basina op eklenmez; yazilamayan kalem",
      "**eksik primitif** olarak geometrik adiyla asagida durur, sozluk acilmaz. grafdogrula = gercek36, 0 kirmizi = dikilebilir tutarlilik.", "",
      f"**Kullanilan primitifler ({len(kullanilan)}/{len(OPLAR)}):** " + ", ".join(sorted(kullanilan)),
      f"**Kumede olup hic kullanilmayan:** " + (", ".join(sorted(OPLAR - kullanilan)) or "yok"), "",
      "## Fotograflar (KOSU/ciktilar/giris/N, okuma opDemeti = primitif)", "",
      "| # | fotograf | op | primitifler | grafdogrula | eksik primitif (geometrik adiyla) |", "|---|---|---|---|---|---|"]
for f in foto:
    dg = "**0 kirmizi**" if f["kirmizi"] == 0 else f"{f['kirmizi']} kirmizi: {'; '.join(f['fails'])}"
    md.append(f"| {f['no']} | {f['girdi']} | {f['opSayisi']} | {', '.join(f['primitifler'])} | {dg} | {li(f['eksik'])} |")
md += ["", "## Promptlar (10; P7-P10 sozluk disi) ve Bugra'nin iki kalibi", "",
       "| ad | girdi | op | primitifler | motor | panel | grafdogrula | eksik primitif / not |", "|---|---|---|---|---|---|---|---|"]
for s in satirlar:
    dg = "—" if s["kirmizi"] is None else ("**0 kirmizi**" if s["kirmizi"] == 0 else f"{s['kirmizi']} kirmizi: {'; '.join(s['fails'])}")
    md.append(f"| {s['ad']} | {s['girdi']} | {s['opSayisi']} | {', '.join(s['primitifler'])}{(' **KUME DISI: ' + ','.join(s['kumeDisi']) + '**') if s['kumeDisi'] else ''} | {s['motor']} | {s['panel'] or '—'} | {dg} | {li(s['eksik'] + ([s['not']] if s['not'] else []))} |")
# ozet
tam = [s for s in satirlar if s["motor"] == "UYGULANDI" and s["kirmizi"] == 0 and not s["eksik"]]
kismi = [s for s in satirlar if s["motor"] == "UYGULANDI" and (s["kirmizi"] not in (0, None) or s["eksik"])]
red = [s for s in satirlar if s["motor"] != "UYGULANDI"]
kova = OD([("PRIMITIF", OD()), ("COZUCU (A6)", OD()), ("OKUMA/PROGRAM", OD())])
for s in satirlar + foto:
    for e in s["eksik"]:
        k = "PRIMITIF" if e.startswith("PRIMITIF") else ("COZUCU (A6)" if e.startswith("COZUCU") else "OKUMA/PROGRAM")
        anahtar = e.split(" — ")[0] if k == "PRIMITIF" else e[:110]
        kova[k].setdefault(anahtar, []).append(s.get("ad") or f"foto {s.get('no')}")
md += ["", "## Ozet", "",
       f"- Motordan gecen ve 0 kirmizi ve eksiksiz: **{len(tam)}/{len(satirlar)}** ({', '.join(s['ad'] for s in tam) or '—'})",
       f"- Motordan gecen ama eksik primitif ilan eden ya da kirmizi tasiyan: **{len(kismi)}** ({', '.join(s['ad'] for s in kismi) or '—'})",
       f"- Motorun reddettigi program: **{len(red)}** ({', '.join(s['ad'] + ' — ' + s['motor'] for s in red) or '—'})",
       f"- Fotograflar: {sum(1 for f in foto if f['kirmizi']==0)}/5 grafdogrula 0 kirmizi; eksik primitif ilani olan: {sum(1 for f in foto if f['eksik'])}/5", "",
       "## Eksikler uc kovada (hakem A3 kusur 2: kovalar ayri)", "",
       "**1. EKSIK PRIMITIF — kumeye eklenecek op (ad + args imzasi; geometri emri, giysi adi degil):**", ""]
for e, kim in kova["PRIMITIF"].items(): md.append(f"- `{e.replace('PRIMITIF: ', '')}` — ({', '.join(kim)})")
md += ["", "**2. COZUCU / KAPI eksigi (primitif degil; A4 supresyon-kisit isi):**", ""]
for e, kim in kova["COZUCU (A6)"].items(): md.append(f"- {e.replace('COZUCU (A6): ', '')} — ({', '.join(kim)})")
md += ["", "**3. OKUMA / PROGRAM eksigi (oran verilmedi, kontrol noktasi uydurulmadi, program duzeltilmedi; kumeyle ilgisi yok):**", ""]
for e, kim in kova["OKUMA/PROGRAM"].items(): md.append(f"- {e.replace('OKUMA/PROGRAM: ', '').replace('OKUMA: ', '')} — ({', '.join(kim)})")
open("KOSU/ciktilar/giris/TAMLIK.md", "w").write("\n".join(md) + "\n")

# ------------------------------------------------------------------ KONTAK (12 flat)
def kutu(x, y, w, h, svgYol, etiket):
    if not os.path.exists(svgYol): return f'<text x="{x+6}" y="{y+h/2}" font-size="11" fill="#b00">RED: {etiket}</text><rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" stroke="#f99"/>'
    s = open(svgYol).read(); vb = re.search(r'viewBox="([^"]+)"', s)
    inner = re.sub(r'^[\s\S]*?<svg[^>]*>', '', s); inner = re.sub(r'</svg>\s*$', '', inner)
    vx, vy, vw, vh = [float(v) for v in vb.group(1).split()] if vb else (0, 0, 1000, 1000)
    k = min(w / vw, h / vh)
    return f'<g transform="translate({x+(w-vw*k)/2} {y+(h-vh*k)/2}) scale({k}) translate({-vx} {-vy})">{inner}</g><rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" stroke="#ddd"/>'
W, H, PAD, BAS, COLS = 200, 260, 12, 50, 4
g = "";
for i, s in enumerate(satirlar):
    x = PAD + (i % COLS) * (W + PAD); y = BAS + (i // COLS) * (H + 40)
    dg = "—" if s["kirmizi"] is None else f"{s['kirmizi']} kirmizi"
    g += f'<text x="{x}" y="{y-6}" font-size="10" font-weight="600">{s["ad"][:34]}</text>' + kutu(x, y, W, H, f"{DIZIN}/{s['ad']}/flat.svg", s["ad"]) + \
         f'<text x="{x}" y="{y+H+12}" font-size="9" fill="#555">{s["opSayisi"]} op · {s["motor"][:14]} · {dg}</text>'
rows = (len(satirlar) + COLS - 1) // COLS
svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{PAD+COLS*(W+PAD)}" height="{BAS+rows*(H+40)}" viewBox="0 0 {PAD+COLS*(W+PAD)} {BAS+rows*(H+40)}"><rect width="100%" height="100%" fill="#fff"/>' \
      f'<text x="{PAD}" y="24" font-size="14" font-weight="700">Tamlik — 10 prompt + Bugra 2 kalip, yalniz primitif kumesiyle (croquis36 flat)</text>' \
      f'<text x="{PAD}" y="40" font-size="10" fill="#666">Her kutu: taban + ops.json -> grafciz --ops. RED = motor programi reddetti. Kirmizi = grafdogrula gercek36.</text>{g}</svg>'
open("KOSU/ciktilar/giris/tamlik-kontak.svg", "w").write(svg)
if PNG: kos(["node", "-e", "import('./KOSU/0509-a3-png.mjs').then(m=>m.png('KOSU/ciktilar/giris/tamlik-kontak.svg','KOSU/ciktilar/giris/tamlik-kontak.png',860,1000))"])
print("\nTAMLIK.md yazildi;", f"tam={len(tam)} kismi={len(kismi)} red={len(red)}")
