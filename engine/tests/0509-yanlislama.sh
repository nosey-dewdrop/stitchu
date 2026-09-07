#!/usr/bin/env bash
# 0509-yanlislama.sh — A2 OLCUT 4: METRIK KOR MU?
#
# NEDEN VAR: sanalDikisMM aylarca 0.00 bastı ve bu "yesil" sayildi. Sayinin sifir
# olmasi, olcunun DOGRU olmasindan degil, hicbir seyi GORMEMESINDEN geliyordu
# (KOSU/0509-DURDU.md kusur 3). Bir olcum aracinin gecerli olmasi icin, bozulmus
# girdiye KIRMIZI basabildiginin gosterilmesi gerekir. Bu test onu gosterir.
#
# SART (0509-kosu.md A2, kusur 3 kapanis olcutu):
#   bel cevresi elle 20 mm bozulunca sanalDikisMM > 2.0 KIRMIZI basmali.
#   Bozulmamis grafta ise esik altinda kalmali.
#
# KATMAN NOTU (2026-09-07, olculdu): beden olculeri contract/body-v1.json'dan
# engine/src/body.gen.hpp'ye DERLENIR (gen-contract.mjs). Yalnizca JSON'u bozmak
# motoru etkilemez — motor gen dosyasindaki sabitleri okur. Bu yuzden test
# sozlesmeyi bozar, gen'i yeniden uretir, YENIDEN DERLER, olcer ve her sey
# bittiginde ucunu de geri alir. Kestirme (yalniz JSON bozmak) sahte YESIL verir.
set -uo pipefail
cd "$(dirname "$0")/../.." || exit 2

GRAF=KOSU/ciktilar/graf-ilk/graf.json
BODY=contract/body-v1.json
YEDEK=$(mktemp -t body-yedek)
DOGRULA=engine/build/grafdogrula
ESIK=2.0
BOZMA=20.0

temizle() {
  [ -f "$YEDEK" ] && cp "$YEDEK" "$BODY" 2>/dev/null
  rm -f "$YEDEK"
  node engine/tools/gen-contract.mjs >/dev/null 2>&1
  cmake --build engine/build --target grafdogrula -j4 >/dev/null 2>&1
}
trap temizle EXIT

olc() {   # sanalDikisMM = max(|dikis artigi|, |halka kapanmasi|)
  "$DOGRULA" "$GRAF" gercek36 --json 2>/dev/null | python3 -c '
import json,sys
try: R=json.load(sys.stdin)
except Exception: print("HATA"); raise SystemExit(0)
d=max([abs(x["artikMM"]) for x in R.get("dikisler",[])]+[0.0])
h=max([abs(x["kapanmaMM"]) for x in R.get("halkalar",[])]+[0.0])
print("%.4f"%max(d,h))'
}

kur() {   # $1 = bel cevresi mm; sozlesmeyi yaz, gen uret, derle
  python3 - "$1" <<'PY'
import json,sys
b='contract/body-v1.json'
d=json.load(open(b))
d['bedenler']['gercek36']['halkalar']['girth.waist']['cevreMM']=float(sys.argv[1])
json.dump(d,open(b,'w'),ensure_ascii=False,indent=2)
PY
  node engine/tools/gen-contract.mjs >/dev/null 2>&1 || { echo "GEN_HATASI"; return 1; }
  cmake --build engine/build --target grafdogrula -j4 >/dev/null 2>&1 || { echo "DERLEME_HATASI"; return 1; }
}

[ -x "$DOGRULA" ] || { echo '{"ad":"yanlislama","durum":"CRASH","neden":"grafdogrula yok"}'; exit 3; }
cp "$BODY" "$YEDEK" || exit 3
BEL0=$(python3 -c "import json;print(json.load(open('$BODY'))['bedenler']['gercek36']['halkalar']['girth.waist']['cevreMM'])")

kur "$BEL0" || exit 3
SAGLAM=$(olc)
kur "$(python3 -c "print($BEL0+$BOZMA)")" || exit 3
BOZUK=$(olc)
temizle; trap - EXIT

python3 - "$SAGLAM" "$BOZUK" "$ESIK" "$BOZMA" "$BEL0" <<'PY'
import sys, json
saglam, bozuk, esik, bozma, bel0 = sys.argv[1:6]
try: s, b, e = float(saglam), float(bozuk), float(esik)
except ValueError:
    print(json.dumps({"ad":"yanlislama_check","durum":"CRASH","neden":"olcum sayisal degil: %r / %r"%(saglam,bozuk)})); raise SystemExit(3)
saglamOK = s <= e          # bozulmamis graf esik altinda
duyarli  = b > e           # bozulmus graf KIRMIZI basiyor
gecti = saglamOK and duyarli
print(json.dumps({
  "ad":"yanlislama_check","durum":"GECTI" if gecti else "KALDI",
  "saglamMM":s,"bozukMM":b,"esik":e,"bozmaMM":float(bozma),"belMM":float(bel0),
  "saglam_esik_alti":saglamOK,"bozukta_kirmizi":duyarli,
  "neden":"" if gecti else ("bozulmamis graf esigi asiyor (%.4f > %.2f)"%(s,e) if not saglamOK
           else "METRIK KOR: bel %.0f mm bozuldu, sanalDikisMM %.4f -> %.4f, esik %.2f asilmadi"%(float(bozma),s,b,e))
}, ensure_ascii=False))
raise SystemExit(0 if gecti else 1)
PY
