#!/usr/bin/env bash
# 0509-vision-sema.sh — A3 gecidi: KOSU/onbellek/*.json'u contract/vision-graf-v1.json
# semasina gore dogrular. Sema DOSYADAN okunur; bu scriptte alan adi/esik SABITLENMEZ.
#
# NE OLCER:
#   - VisionOkuma ve alt tiplerin zorunlu alanlari var mi; aralik:[a,b] tasiyan sayilar aralikta mi
#   - _yasa 5: Celiski.kazanan == 'olcum'; celiskiTablosu bos ise olculmedi[] dolu olmali
#   - _yasa 9 (2026-09-09): opDemeti[].op YALNIZ contract/graf-v1.json oplar kumesinden; nedensiz op yok
#   - sema metninde giysi/parca kelimesi yok (Damla karari: "semada giysi kelimesi yok"); kisaltma alani yok
#   - sha256 == dosya adi == fotografin gercek sha256'si; landmark adlari body-v1'de var
#
# Kullanim: bash engine/tests/0509-vision-sema.sh [--json]
# Cikis 0 = 0 kirmizi.
set -uo pipefail
cd "$(dirname "$0")/../.."
exec python3 - "$@" <<'PY'
import json, os, sys, glob, hashlib, re

BICIM = "json" if "--json" in sys.argv[1:] else "metin"
sema = json.load(open("contract/vision-graf-v1.json"))
LM = {k for k in json.load(open("contract/body-v1.json"))["landmarklar"] if k.startswith("landmark.")}
OPLAR = {k for k in json.load(open("contract/graf-v1.json"))["oplar"] if not k.startswith("_")}
T = sema["tipler"]
kirmizi, hukumler = [], []

def ok(ad, not_=""):    hukumler.append(("OK", ad, not_))
def fail(ad, not_=""):  hukumler.append(("FAIL", ad, not_)); kirmizi.append((ad, not_))

def zorunlular(tip):
    return [k for k, v in T[tip]["alanlar"].items() if v.get("zorunlu")]
def araliklar(tip):
    return {k: v["aralik"] for k, v in T[tip]["alanlar"].items() if "aralik" in v}
def alanKontrol(etiket, tip, nesne):
    for k in zorunlular(tip):
        if k not in nesne:
            fail(f"{etiket}.{k}", f"{tip} zorunlu alani YOK")
    for k, (lo, hi) in araliklar(tip).items():
        if k in nesne and isinstance(nesne[k], (int, float)):
            if not (lo <= nesne[k] <= hi):
                fail(f"{etiket}.{k}", f"{nesne[k]} aralik disi [{lo},{hi}]")

# --- SEMANIN KENDISI: giysi/parca kelimesi yok, ad sozlugu (kisaltma) alani yok, op adlari kumeden
GIYSI = r"peplum|yaka|sweetheart|roba|\bcep\b|kusak|volan|fiyonk|elbise|gomlek|neckline|collar|pocket|sleeve|dress|skirt|kemer|bluz|korse|bustier"
sema_metin = json.dumps(sema, ensure_ascii=False)
bulunan = sorted({m.group(0).lower() for m in re.finditer(GIYSI, sema_metin, re.I)})
if bulunan: fail("sema.giysi-kelimesi", f"semada giysi/parca kelimesi var: {', '.join(bulunan)}")
else: ok("sema.giysi-kelimesi", "semada giysi/parca kelimesi yok")
if "kisaltmalar" in T["VisionOkuma"]["alanlar"] or "Kisaltma" in T: fail("sema.kisaltma", "ad sozlugu (kisaltma) alani semada duruyor")
else: ok("sema.kisaltma", "ad sozlugu alani yok (yasa 1)")
if "hedefler" in T["VisionOkuma"]["alanlar"] and "opDemeti" in T["VisionOkuma"]["alanlar"]: ok("sema.alanlar", "hedefler[] (cozucu) ve opDemeti[] (primitif) ayri")
else: fail("sema.alanlar", "hedefler/opDemeti alani yok")

dosyalar = sorted(glob.glob("KOSU/onbellek/*.json"))
if not dosyalar:
    fail("onbellek", "KOSU/onbellek/ altinda json YOK")
v1 = [d for d in dosyalar if json.load(open(d)).get("semaSurumu") == "vision-graf-v1"]

for yol in dosyalar:
    d = json.load(open(yol))
    ad = os.path.basename(yol)[:-5]
    if d.get("semaSurumu") != "vision-graf-v1":
        hukumler.append(("ATLA", ad[:8], f"semaSurumu={d.get('semaSurumu')} (vision-graf-v1 degil)"))
        continue
    e = ad[:8]
    alanKontrol(e, "VisionOkuma", d)
    if d.get("sha256") != ad:
        fail(f"{e}.sha256", "alan dosya adiyla ayni degil")
    g = d.get("girdiYolu", "")
    if not os.path.exists(g):
        fail(f"{e}.girdiYolu", f"dosya yok: {g}")
    else:
        gercek = hashlib.sha256(open(g, "rb").read()).hexdigest()
        if gercek != ad: fail(f"{e}.sha256-gercek", f"fotografin sha'si {gercek[:8]}, dosya adi {ad[:8]}")
        else: ok(f"{e}.sha256", "dosya adi = alan = fotografin gercek sha256'si")

    for i, p in enumerate(d.get("paneller", [])):   alanKontrol(f"{e}.paneller[{i}]", "PanelOkuma", p)
    for i, k in enumerate(d.get("kenarlar", [])):   alanKontrol(f"{e}.kenarlar[{i}]", "KenarOkuma", k)
    for i, s in enumerate(d.get("dikisler", [])):   alanKontrol(f"{e}.dikisler[{i}]", "DikisOkuma", s)
    for i, k in enumerate(d.get("katmanlar", [])):  alanKontrol(f"{e}.katmanlar[{i}]", "KatmanOkuma", k)
    for i, h in enumerate(d.get("hedefler", [])):   alanKontrol(f"{e}.hedefler[{i}]", "Hedef", h)
    if "kapanma" in d: alanKontrol(f"{e}.kapanma", "KapanmaOkuma", d["kapanma"])
    if "simetri" in d: alanKontrol(f"{e}.simetri", "SimetriOkuma", d["simetri"])
    if "arka" in d:    alanKontrol(f"{e}.arka",    "ArkaOkuma",    d["arka"])
    if "guvenliTaban" in d: alanKontrol(f"{e}.guvenliTaban", "GuvenliTaban", d["guvenliTaban"])
    if "kisaltmalar" in d or "eksikOp" in d:
        fail(f"{e}.ad-sozlugu", "okumada kisaltmalar/eksikOp alani duruyor (yasa 1: ad sozlugu yok)")

    for i, c in enumerate(d.get("celiskiTablosu", [])):
        alanKontrol(f"{e}.celiskiTablosu[{i}]", "Celiski", c)
        if c.get("kazanan") != "olcum":
            fail(f"{e}.celiskiTablosu[{i}].kazanan", f"'{c.get('kazanan')}' — yasa 5 geregi 'olcum' olmali")
    if not d.get("celiskiTablosu"):
        if not d.get("olculmedi"): fail(f"{e}.celiskiTablosu", "bos, ve olculmedi[] de bos: 'celiski yok' iddiasi olculmemis")
        else: ok(f"{e}.celiskiTablosu", "bos ama olculmedi[] dolu — aranmadigi ADIYLA yazili")
    else:
        ok(f"{e}.celiskiTablosu", f"{len(d['celiskiTablosu'])} satir, hepsinde kazanan=olcum")

    # yasa 9: op adi kumeden, nedensiz op yok, bos liste = op'suz cizim (kirmizi)
    nedensiz, disi = 0, []
    for i, o in enumerate(d.get("opDemeti", [])):
        alanKontrol(f"{e}.opDemeti[{i}]", "OpKaydi", o)
        if not str(o.get("neden", "")).strip():
            nedensiz += 1; fail(f"{e}.opDemeti[{i}].neden", f"op '{o.get('op')}' nedensiz (semaya aykiri)")
        if o.get("op") not in OPLAR:
            disi.append(str(o.get("op"))); fail(f"{e}.opDemeti[{i}].op", f"'{o.get('op')}' graf-v1 oplar kumesinde YOK (yasa 9: sozluk acilmaz)")
    if not d.get("opDemeti"):
        fail(f"{e}.opDemeti", "bos: op'suz cizim yok (yasa 9) — fotograf tabana hicbir emir vermiyorsa okuma degil kopyadir")
    elif nedensiz == 0 and not disi:
        ok(f"{e}.opDemeti", f"{len(d['opDemeti'])} primitif, hepsi kumeden ve bir okuma kalemine bagli")

    ham = json.dumps(d, ensure_ascii=False)
    yok = sorted({m for m in re.findall(r'"(landmark\.[A-Za-z]+)"', ham) if m not in LM})
    if yok: fail(f"{e}.landmark-adlari", f"body-v1'de olmayan ad: {', '.join(yok)}")
    else: ok(f"{e}.landmark-adlari", f"{len(set(re.findall(chr(34)+r'(landmark\.[A-Za-z]+)'+chr(34), ham)))} ad, hepsi contract/body-v1.json'da")
    tg = d.get("tabanGraf")
    if tg and not os.path.exists(tg): fail(f"{e}.tabanGraf", f"yok: {tg}")

if BICIM == "json":
    print(json.dumps({"gecit": "vision_sema_check", "dosya": len(dosyalar), "visionGrafV1": len(v1),
                      "hukum": len(hukumler), "kirmizi": len(kirmizi),
                      "kirmizilar": [{"ad": a, "not": n} for a, n in kirmizi]}, ensure_ascii=False))
else:
    for d, a, n in hukumler:
        print(f"{d:4} {a}" + (f"  -- {n}" if n else ""))
    print(f"OZET dosya={len(dosyalar)} vision-graf-v1={len(v1)} hukum={len(hukumler)} kirmizi={len(kirmizi)}")
sys.exit(1 if kirmizi else 0)
PY
