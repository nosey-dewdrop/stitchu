#!/usr/bin/env bash
# 0509-yanlislama.sh — A2 OLCUT 4: METRIK KOR MU?
#
# NEDEN VAR: sanalDikisMM aylarca 0.00 basti ve bu "yesil" sayildi. Sayinin sifir olmasi
# olcunun DOGRU olmasindan degil, hicbir seyi GORMEMESINDEN geliyordu (KOSU/0509-DURDU.md
# kusur 3). Bir olcum aracinin gecerli olmasi icin bozulmus girdiye KIRMIZI basabildiginin
# GOSTERILMESI gerekir. Bu test onu gosterir.
#
# IKI BOLUM (Damla karari, 2026-09-07):
#   A) ASIL TEST — GRAF DUZEYI. TEK panelin bel kenari 20 mm bozulur (on_beden/waist_front.2
#      yan ucu). Dikisin yalniz BIR tarafi kayar; obur taraf (etek) yerinde kalir, yani
#      esitlik gercekten KIRILIR. sanalDikisMM > 2.0 KIRMIZI basmali.
#   B) TUTARLILIK TESTI — BEDEN DUZEYI. contract'ta bel cevresi 20 mm buyutulur. Burada
#      dikisin IKI tarafi da ayni olcuden turedigi icin birlikte olceklenir; beklenen sey
#      kirmizi DEGIL, olcunun bozulmaya DUYARLI olmasidir (deger degismeli). Bu bolum
#      esik hukmu vermez; sadece "sayi ölçüye bagli mi" sorusunu cevaplar.
#
# KATMAN NOTU (olculdu, 2026-09-07): beden olculeri contract/body-v1.json'dan
# engine/src/body.gen.hpp'ye DERLENIR (gen-contract.mjs). Yalnizca JSON'u bozmak motoru
# etkilemez. B bolumu bu yuzden gen'i yeniden uretip YENIDEN DERLER ve sonunda ucunu de
# geri alir. A bolumu grafi bozdugu icin derleme gerektirmez (graf calisma zamani girdisi).
set -uo pipefail
cd "$(dirname "$0")/../.." || exit 2

GRAF=KOSU/ciktilar/graf-ilk/graf.json
BODY=contract/body-v1.json
DOGRULA=engine/build/grafdogrula
ESIK=2.0
BOZMA=20.0
TMPG=$(mktemp -t graf-bozuk-XXXXXX).json
YEDEK=$(mktemp -t body-yedek-XXXXXX).json
# 2026-09-08 (Damla karari; 8 Eyl hakemi'nin ayak kapani uyarisi): B bolumu contract'i
# YAZIP gen-contract ile engine/src/*.gen.hpp'yi YENIDEN URETIR. Test yarida kesilirse
# (Ctrl+C, kill, disk dolmasi) repo BOZUK contract + BOZUK gen.hpp ile kalirdi. Simdi
# uretilen dosyalarin da yedegi alinir ve trap ucunu birden geri alir; trap yalniz EXIT'te
# degil INT/TERM/HUP'ta da calisir. Geri alma DOGRULANIR: gen dosyalari yedekle ayni mi.
GEN_DOSYALAR="engine/src/contract.gen.hpp engine/src/composition.gen.hpp engine/src/body.gen.hpp web/js/contract.gen.js backend/contract.gen.js"
GENYEDEK=$(mktemp -d -t gen-yedek-XXXXXX)
gen_yedekle() {
  for f in $GEN_DOSYALAR; do
    [ -f "$f" ] && mkdir -p "$GENYEDEK/$(dirname "$f")" && cp "$f" "$GENYEDEK/$f"
  done
}
gen_geri_al() {
  local bozuk=""
  for f in $GEN_DOSYALAR; do
    [ -f "$GENYEDEK/$f" ] || continue
    cmp -s "$GENYEDEK/$f" "$f" || { cp "$GENYEDEK/$f" "$f" 2>/dev/null || bozuk="$bozuk $f"; }
  done
  [ -n "$bozuk" ] && printf 'UYARI: gen dosyasi geri alinamadi:%s (elle: node engine/tools/gen-contract.mjs)\n' "$bozuk" >&2
  return 0
}
temizle() {
  rm -f "$TMPG"
  if [ -f "$YEDEK" ] && [ -s "$YEDEK" ]; then
    cp "$YEDEK" "$BODY" 2>/dev/null || printf 'UYARI: %s geri alinamadi (yedek: %s)\n' "$BODY" "$YEDEK" >&2
  fi
  gen_geri_al
  # gen geri alindiktan sonra binary da eski haline donmeli, yoksa sonraki olcum bozuk
  # gen ile derlenmis motoru kullanir (sessiz yanlis sayi).
  cmake --build engine/build --target grafdogrula -j4 >/dev/null 2>&1
  rm -f "$YEDEK"; rm -rf "$GENYEDEK"
}
trap temizle EXIT INT TERM HUP

[ -x "$DOGRULA" ] || { echo '{"ad":"yanlislama_check","durum":"CRASH","neden":"engine/build/grafdogrula yok"}'; exit 3; }

# Pens agzi (mm): cozucunun bu bedende buldugu deger. 2026-09-08 (Damla karari (a),
# solver baglandi) sonrasi B bolumunun DOGRU gostergesi budur: cozucu bel dikisi artigini
# her bedende ~0'a cekiyor, dolayisiyla sanalDikisMM beden bozmasina artik tepki VERMEZ
# (bu bir kusur degil, cozucunun isini yaptiginin isareti). Olcuye baglilik AGIZDA gorunur:
# supresyon buyudukce agiz acilir (olculdu: gogus 840/880/920 -> agiz 8.96/10.62/12.29).
pensAgzi() {
  "$DOGRULA" "$1" gercek36 --json 2>/dev/null | python3 -c '
import json,sys,re
try: R=json.load(sys.stdin)
except Exception: print("HATA"); raise SystemExit(0)
h=[x for x in R.get("hukumler",[]) if x["kural"]=="pens_cozum"]
if not h: print("YOK"); raise SystemExit(0)
m=re.search(r"agiz ([0-9.]+) mm", h[0]["deger"])
print(m.group(1) if m else "YOK")'
}

# sanalDikisMM = max(|dikis artigi|, |halka kapanmasi|) — kapi.sh ile AYNI tanim
olc() {
  "$DOGRULA" "$1" gercek36 --json 2>/dev/null | python3 -c '
import json,sys
try: R=json.load(sys.stdin)
except Exception: print("HATA"); raise SystemExit(0)
d=max([abs(x["artikMM"]) for x in R.get("dikisler",[])]+[0.0])
h=max([abs(x["kapanmaMM"]) for x in R.get("halkalar",[])]+[0.0])
print("%.4f"%max(d,h))'
}

# ---------------------------------------------------------------- A) GRAF DUZEYI (asil)
SAGLAM=$(olc "$GRAF")
python3 - "$GRAF" "$TMPG" "$BOZMA" <<'PY' || exit 3
import json,sys
kaynak,hedef,bozma = sys.argv[1],sys.argv[2],float(sys.argv[3])
d=json.load(open(kaynak))
P={x['id']:x for x in d['panels']}
# TEK panel, TEK kenar: on_beden/waist_front.2'nin YAN ucu. Bu uc tek terimli bir Anchor
# (ringQuarter, xFactor 1) — xOffsetMM ile 20 mm disari kaydirilir. Bel dikisinin yalniz
# a tarafi uzar; b tarafi (etek) yerinde kalir. Kalipta bu "bir panel yanlis cizilmis"
# durumudur ve dogrulayici bunu yakalamak ZORUNDA.
e=[x for x in P['on_beden']['edges'] if x['id']=='waist_front.2'][0]
uc=e['to']
if 'combo' in uc: sys.stderr.write('waist_front.2.to combo; tek terim bekleniyordu\n'); raise SystemExit(3)
uc['xOffsetMM']=uc.get('xOffsetMM',0.0)+bozma
json.dump(d,open(hedef,'w'),ensure_ascii=False,indent=2)
PY
BOZUK=$(olc "$TMPG")

# ---------------------------------------------------------------- B) BEDEN DUZEYI (tutarlilik)
BEDEN_SAGLAM=""; BEDEN_BOZUK=""; BEDEN_NOT="atlandi (contract yazilabilir degil)"
if cp "$BODY" "$YEDEK" 2>/dev/null && [ -w "$BODY" ]; then
  gen_yedekle
  BEDEN_SAGLAM=$(pensAgzi "$GRAF")
  python3 - "$BODY" "$BOZMA" <<'PY'
import json,sys
b,bozma=sys.argv[1],float(sys.argv[2])
d=json.load(open(b))
w=d['bedenler']['gercek36']['halkalar']['girth.waist']
w['cevreMM']=float(w['cevreMM'])+bozma
json.dump(d,open(b,'w'),ensure_ascii=False,indent=2)
PY
  if node engine/tools/gen-contract.mjs >/dev/null 2>&1 && cmake --build engine/build --target grafdogrula -j4 >/dev/null 2>&1; then
    BEDEN_BOZUK=$(pensAgzi "$GRAF"); BEDEN_NOT="olculdu"
  else
    BEDEN_NOT="atlandi (gen/derleme basarisiz)"
  fi
  temizle; trap - EXIT
fi

python3 - "$SAGLAM" "$BOZUK" "$ESIK" "$BOZMA" "$BEDEN_SAGLAM" "$BEDEN_BOZUK" "$BEDEN_NOT" <<'PY'
import sys, json
saglam,bozuk,esik,bozma,bs,bb,bnot = sys.argv[1:8]
try: s,b,e = float(saglam),float(bozuk),float(esik)
except ValueError:
    print(json.dumps({"ad":"yanlislama_check","durum":"CRASH","neden":"olcum sayisal degil: %r / %r"%(saglam,bozuk)},ensure_ascii=False)); raise SystemExit(3)

saglamOK = s <= e            # bozulmamis graf esik altinda
duyarli  = b > e             # TEK PANEL bozulunca KIRMIZI
gecti = saglamOK and duyarli

# B bolumu hukum vermez; yalniz "sayi olcuye bagli mi" sorusunu cevaplar.
beden = {"durum": bnot}
if bs and bb:
    try:
        bsf,bbf=float(bs),float(bb)
        beden = {"durum":"olculdu","olculen":"pens agzi (mm)","saglam":bsf,"bozuk":bbf,
                 "olcuyeDuyarli": abs(bbf-bsf) > 1e-6,
                 "not":"Bel 20 mm buyuyunce supresyon (gogus-bel) 20 mm KUCULUR; cozucu pens agzini o kadar KAPATIR. Beklenen KIRMIZI degil, agzin DEGISMESIdir. sanalDikisMM'e bakilmaz: cozucu artigi her bedende ~0'a ceker (2026-09-08 (a))."}
    except ValueError: pass

print(json.dumps({
  "ad":"yanlislama_check","durum":"GECTI" if gecti else "KALDI",
  "grafDuzeyi":{"saglamMM":s,"bozukMM":b,"esik":e,"bozmaMM":float(bozma),
                "nerede":"on_beden/waist_front.2 yan ucu (+%.0f mm)"%float(bozma),
                "saglam_esik_alti":saglamOK,"bozukta_kirmizi":duyarli},
  "bedenDuzeyi":beden,
  "neden":"" if gecti else ("bozulmamis graf esigi asiyor (%.4f > %.2f)"%(s,e) if not saglamOK
           else "METRIK KOR: tek panelin bel kenari %.0f mm bozuldu, sanalDikisMM %.4f -> %.4f, esik %.2f asilmadi"%(float(bozma),s,b,e))
}, ensure_ascii=False, indent=2))
raise SystemExit(0 if gecti else 1)
PY
