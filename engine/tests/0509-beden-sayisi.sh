#!/usr/bin/env bash
# 0509-beden-sayisi.sh — "8 bedende yesil" iddiasi GERCEK mi?
#
# NEDEN VAR (2026-09-08, Damla karari; 8 Eyl hakemi): hakem "EU34..EU44 diye beden YOK,
# contract/body-v1.json bedenler = {gercek36, croquis36}; 8 bedende yesil ifadesi 8
# BAGIMSIZ olcu setinde yesil anlamina gelmiyor olabilir" dedi ve OLCEMEDIM birakti.
# Bu test o soruyu kapatir: her bedenin ADI degil, OLCUSU farkli mi?
#
# Olculen: gercek36 + croquis36 dogrudan bedenler[] altinda; EU34..EU44 ise
# gradeTablosu.degerler sutunlarindan turer (Body::graded, engine/src/body.cpp:86).
# Ikisi de gecerli kaynaktir; sart, motorun her beden icin FARKLI sayi okumasidir.
# Bir beden digeriyle ayni cikiyorsa "8 bedende dogrulandi" cumlesi disari SOYLENMEZ.
set -uo pipefail
cd "$(dirname "$0")/../.." || exit 2

GRAF=KOSU/ciktilar/graf-ilk/graf.json
DOGRULA=engine/build/grafdogrula
[ -x "$DOGRULA" ] || { echo '{"ad":"beden_sayisi_check","durum":"CRASH","neden":"grafdogrula yok"}'; exit 3; }

python3 - "$GRAF" "$DOGRULA" <<'PY'
import json, subprocess, sys
graf, dogrula = sys.argv[1], sys.argv[2]
bedenler = ["gercek36","croquis36","EU34","EU36","EU38","EU40","EU42","EU44"]

contract = json.load(open("contract/body-v1.json"))
dogrudan = [k for k in contract.get("bedenler",{}) if not k.startswith("_") and k != "farkTablosu"]
grade = contract.get("gradeTablosu",{}).get("bedenler",[])

satir, imza = [], {}
for b in bedenler:
    r = subprocess.run([dogrula, graf, b, "--json"], capture_output=True)
    if not r.stdout.strip():
        satir.append({"beden":b,"durum":"CRASH","neden":r.stderr.decode()[:120]}); continue
    R = json.loads(r.stdout)
    sup = next((h["deger"] for h in R["hukumler"] if h["kural"]=="supresyon"), "")
    # olcu imzasi: halka toplamlari — ayni sayi seti iki bedende cikiyorsa AYNI olcudur
    halkalar = tuple(round(h["toplamMM"],3) for h in R["halkalar"])
    kaynak = "bedenler[]" if b in dogrudan else ("gradeTablosu" if b in grade else "BILINMIYOR")
    satir.append({"beden":b,"kaynak":kaynak,"kirmizi":R["kirmizi"],"dikilebilir":R["dikilebilir"],
                  "halkaToplamlari":list(halkalar),"supresyon":sup[:90]})
    imza.setdefault(halkalar, []).append(b)

# BEKLENEN CAKISMA: gercek36 ve EU36 AYNI insandir (36 bedeni) — bedenler[] ile
# gradeTablosu ayni olcuyu iki adla tasir. Bu bir kusur DEGIL, tutarlilik KANITIDIR:
# iki ayri kaynak ayni bedende ayni sayiyi veriyor. Baska her cakisma kirmizidir.
BEKLENEN = [{"gercek36","EU36"}]
cakisan = {}
for k, v in imza.items():
    if len(v) <= 1: continue
    if any(set(v) == b for b in BEKLENEN): continue
    cakisan[",".join(v)] = list(k)
beklenenCakisma = [",".join(v) for k, v in imza.items() if len(v) > 1 and any(set(v) == b for b in BEKLENEN)]
bilinmeyen = [x["beden"] for x in satir if x.get("kaynak")=="BILINMIYOR"]
crash = [x["beden"] for x in satir if x.get("durum")=="CRASH"]
gecti = not crash and not bilinmeyen and not cakisan

print(json.dumps({
  "ad":"beden_sayisi_check",
  "durum":"GECTI" if gecti else "KALDI",
  "kaynaklar":{"bedenler[]":dogrudan,"gradeTablosu":grade},
  "bagimsizOlcuSeti": len(imza),
  "istenen": len(bedenler),
  "beklenenCakisma": beklenenCakisma,
  "cakisanOlcuSetleri": cakisan,
  "bedenler": satir,
  "not2":"8 ad, 7 bagimsiz olcu seti: gercek36 == EU36 (ayni insan, iki kaynak). Disari 'sekiz bedende dogrulandi' DEGIL, 'yedi bagimsiz olcu setinde dogrulandi' denir.",
  "not":"Supresyon her bedende ayni cikabilir: Burda tablosunda gogus ve bel AYNI adimla (40 mm) buyuyor, fark sabit kalir. Bu tablonun ozelligidir, olcu setlerinin ayni oldugu anlamina GELMEZ — halkaToplamlari farkliysa bedenler bagimsizdir.",
  "neden":"" if gecti else ("CRASH: "+",".join(crash) if crash else
           ("kaynagi bilinmeyen beden: "+",".join(bilinmeyen) if bilinmeyen else
            "iki beden AYNI olcu setini veriyor: "+json.dumps(cakisan,ensure_ascii=False)))
}, ensure_ascii=False, indent=2))
raise SystemExit(0 if gecti else 1)
PY
