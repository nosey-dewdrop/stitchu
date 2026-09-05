#!/usr/bin/env bash
# sinyal.sh — kosu isteklerle karsilastirilir. TEK dosya: kabul (P1-P9) + muhur + sinyal.
#   bash KOSU/sinyal.sh hizli      muhur + enum tabani + kapanan fazlarin kabulu + madde defteri  (her faz sonu, oturum basi)
#   bash KOSU/sinyal.sh tam        + DEVIR KABUL zinciri (27 ctest + flat-olcum + primitif + pinler)  (faz kapatmadan once)
#   bash KOSU/sinyal.sh kabul P3   tek fazin kabulunu kos
#   bash KOSU/sinyal.sh muhurle    muhur yaz (yalniz ana oturum, faz baslamadan)
#   bash KOSU/sinyal.sh kapat P3   kabul + tam sinyal yesilse fazi tabana isle
# Taban durumu 0509-kosu.md icindeki tek satirda: <!-- sinyal.taban dallanma=436 kapanan= -->
# Isci bu dosyaya DOKUNMAZ (muhurlu).
set -u; cd "$(git rev-parse --show-toplevel)" || exit 2
DOC=0509-kosu.md
taban_oku(){ grep -oE '<!-- sinyal\.taban [^>]*-->' $DOC | grep -oE "$1=[^ >]*" | cut -d= -f2; }
taban_yaz(){ python3 - "$1" "$2" <<'PY'
import re,sys;k,v=sys.argv[1],sys.argv[2];p='0509-kosu.md';s=open(p).read()
s=re.sub(r'(<!-- sinyal\.taban [^>]*?)'+k+r'=[^ >]*',lambda m:m.group(1)+k+'='+v,s);open(p,'w').write(s)
PY
}
# ---------------------------------------------------------------- kabul yardimcilari
C=KOSU/ciktilar
C=KOSU/ciktilar; K=0
ok(){ printf '  YESIL  %s\n' "$*"; }
kir(){ printf '  KIRMIZI %s\n' "$*"; K=1; }
var(){ for f in "$@"; do [ -s "$f" ] && ok "var: $f" || kir "yok/bos: $f"; done; }
png_boyut(){ # png en az 400px genis olsun (bos/kirik png dedektoru)
  for f in "$@"; do w=$(python3 -c "import struct,sys;d=open(sys.argv[1],'rb').read(24);print(struct.unpack('>I',d[16:20])[0] if d[:8]==b'\x89PNG\r\n\x1a\n' else 0)" "$f" 2>/dev/null || echo 0)
  [ "${w:-0}" -ge 400 ] && ok "png ${w}px: $f" || kir "png kucuk/bozuk (${w:-0}px): $f"; done; }
dogrula(){ # graf json dogrulayicidan gecsin: engine/build/grafdogrula <graf.json> <bodyId>  (P1 bu CLI'yi kurar)
  local g=$1 b=${2:-gercek36}
  if [ -x engine/build/grafdogrula ]; then engine/build/grafdogrula "$g" "$b" >/dev/null 2>&1 && ok "dogrulayici 0 kirmizi ($b): $g" || kir "dogrulayici kirmizi ($b): $g"
  else kir "engine/build/grafdogrula yok (P1 kurar)"; fi; }
ciz_iki_kez(){ # determinizm: ayni graf+beden iki kosumda bayt-ayni SVG. CLI: engine/build/grafciz <graf.json> <bodyId> flat|kalip > svg
  local g=$1 b=$2 m=$3; [ -x engine/build/grafciz ] || { kir "engine/build/grafciz yok (P1 kurar)"; return; }
  engine/build/grafciz "$g" "$b" "$m" > /tmp/_a.svg 2>/dev/null; engine/build/grafciz "$g" "$b" "$m" > /tmp/_b.svg 2>/dev/null
  [ -s /tmp/_a.svg ] && cmp -s /tmp/_a.svg /tmp/_b.svg && ok "deterministik ($b/$m): $g" || kir "iki kosum farkli ya da bos ($b/$m): $g"; }
katman(){ for id in outline seams topstitch details; do grep -q "id=\"$id\"" "$1" && ok "katman $id: $1" || kir "katman yok $id: $1"; done; }
farkli(){ # dosyalar ikiser ikiser farkli olsun (sessiz ayni-giysiye-donus dedektoru)
  local a; local -a fs=("$@"); for ((i=0;i<${#fs[@]};i++)); do for ((j=i+1;j<${#fs[@]};j++)); do cmp -s "${fs[i]}" "${fs[j]}" && kir "AYNI icerik: ${fs[i]} = ${fs[j]}"; done; done; ok "${#fs[@]} dosya ikiser ikiser farkli"; }
hukum(){ [ $K -eq 0 ] && { echo "KABUL $1: GECTI"; return 0; } || { echo "KABUL $1: GECMEDI"; return 1; }; }

# ---------------------------------------------------------------- fazlarin kabulu (fazdan ONCE yazildi, muhurlu)
kabul_P1(){ K=0
# P1 graftan cizim — ADIM 3,6 · ISTEK 1.3 1.4 1.5 1.9
G=$C/graf-ilk/graf.json
var $G $C/graf-ilk/flat.svg $C/graf-ilk/flat.png $C/graf-ilk/kalip-36.svg $C/graf-ilk/kalip-36.png $C/graf-ilk/seri.png
png_boyut $C/graf-ilk/flat.png $C/graf-ilk/kalip-36.png $C/graf-ilk/seri.png
katman $C/graf-ilk/flat.svg
for b in gercek36 croquis36; do dogrula $G $b; done
ciz_iki_kez $G croquis36 flat; ciz_iki_kez $G gercek36 kalip
# 1.4: flat croquis36'dan, kalip gercek36'dan — ikisi ayni dosya olamaz
cmp -s $C/graf-ilk/flat.svg $C/graf-ilk/kalip-36.svg && kir "flat ve kalip ayni svg" || ok "flat != kalip"
# 1.5: flat svg croquis landmark'larini ilan eder (data-y-waist/bust/hip), contract ile +-2mm
python3 - <<'PY' && ok "croquis landmark ilan +-2mm" || kir "croquis landmark ilan yok ya da sapmis (data-y-waist/bust/hip, +-2mm)"
import json,re,sys
s=open('KOSU/ciktilar/graf-ilk/flat.svg').read(); b=json.load(open('contract/body-v1.json'))['bedenler']['croquis36']['landmarklar']
for k,lm in (('waist','landmark.waist'),('bust','landmark.bustLine'),('hip','landmark.hip')):
    m=re.search(r'data-y-%s="([-\d.]+)"'%k,s)
    if not m or abs(float(m.group(1))-b[lm]['y'])>2.0: sys.exit(1)
PY
# seri: 34-44 alti beden gercek grade'de degerlenir, hepsi dogrulayicidan gecer, ciktilar ikiser farkli
fs=(); for b in EU34 EU36 EU38 EU40 EU42 EU44; do dogrula $G $b; [ -x engine/build/grafciz ] && engine/build/grafciz $G $b kalip > /tmp/_s_$b.svg 2>/dev/null && fs+=(/tmp/_s_$b.svg); done
[ ${#fs[@]} -eq 6 ] && farkli "${fs[@]}" || kir "seri 6 beden cizilemedi"
# wasm parite: flatSVG binding native ile bayt-ayni (P1 binding adi: flatSVG(grafJSON, bodyId))
node -e "
const m=require('./web/vendor/stitchu-engine.js');(async()=>{const e=await (m.default||m)();const g=require('fs').readFileSync('$G','utf8');
const s=e.flatSVG?e.flatSVG(g,'croquis36'):'';require('fs').writeFileSync('/tmp/_w.svg',s);process.exit(s?0:1)})().catch(()=>process.exit(1))" 2>/dev/null \
 && engine/build/grafciz $G croquis36 flat 2>/dev/null | cmp -s - /tmp/_w.svg && ok "wasm = native (flatSVG)" || kir "wasm flatSVG yok ya da native'den farkli"
hukum P1
}

kabul_P2(){ K=0
# P2 edit = op — ADIM 4,8 · ISTEK 1.2 1.9
G=$C/graf-ilk/graf.json; D=$C/edit
var $D/kontak.png; png_boyut $D/kontak.png
n=$(ls $D/*.ops.json 2>/dev/null | wc -l | tr -d ' '); [ "$n" -ge 8 ] && ok "$n edit" || kir "8 edit gerekli, $n var"
for o in $D/*.ops.json; do ad=$(basename $o .ops.json)
  var $D/$ad-once.png $D/$ad-sonra.png
  [ -x engine/build/grafop ] || { kir "engine/build/grafop yok (P2 kurar: grafop <graf> <ops.json> > graf)"; break; }
  engine/build/grafop $G $o > /tmp/_e1.json 2>/dev/null; engine/build/grafop $G $o > /tmp/_e2.json 2>/dev/null
  cmp -s /tmp/_e1.json /tmp/_e2.json && [ -s /tmp/_e1.json ] && ok "op deterministik: $ad" || kir "op deterministik degil/bos: $ad"
  dogrula /tmp/_e1.json gercek36; dogrula /tmp/_e1.json croquis36
  # edit-locality: ops'ta adi gecmeyen paneller bayt-ayni
  python3 - "$G" /tmp/_e1.json "$o" <<'PY' && ok "bolge disi paneller bayt-ayni: $ad" || kir "bolge disi panel degisti: $ad"
import json,sys
a=json.load(open(sys.argv[1]));b=json.load(open(sys.argv[2]));ops=json.load(open(sys.argv[3]))
touched=set(); s=json.dumps(ops)
for p in a['panels']:
    if p['id'] in s: touched.add(p['id'])
B={p['id']:p for p in b['panels']}
for p in a['panels']:
    if p['id'] in touched: continue
    if json.dumps(p,sort_keys=True)!=json.dumps(B.get(p['id']),sort_keys=True): sys.exit(1)
PY
done
hukum P2
}

kabul_P3(){ K=0
# P3 sinirsizlik — ADIM 9 · ISTEK 1.5 1.7 1.9 1.12
D=$C/graf
var $C/flat-ayni-insan.png $C/emsal-vs-biz.png $C/_yerel/bugra-bindirme.png $C/_yerel/bugra-bindirme.md
png_boyut $C/flat-ayni-insan.png $C/emsal-vs-biz.png
n=$(ls $D/*.graf.json 2>/dev/null | wc -l | tr -d ' '); [ "$n" -ge 16 ] && ok "$n graf (2 Bugra + 9 kompozisyon + 5 emsal)" || kir "16 graf gerekli, $n var"
for g in $D/*.graf.json; do dogrula $g gercek36; dogrula $g croquis36; done
farkli $D/*.graf.json
grep -qE 'mm' $C/_yerel/bugra-bindirme.md && ok "bugra bindirme mm raporu" || kir "bugra raporunda mm yok"
node engine/tests/flat_ayni_insan_check.mjs >/tmp/_fai.txt 2>&1 && ok "flat_ayni_insan yesil" || { kir "flat_ayni_insan kirmizi"; tail -3 /tmp/_fai.txt; }
hukum P3
}

kabul_P4(){ K=0
# P4 tek hat — ADIM 6 · ISTEK 1.9 1.13 1.14
d=$(bash engine/tests/enum_dallanma_check.sh --measure 2>/dev/null | grep -E '^cpp\.dallanma' | grep -oE '[0-9]+$'); [ "${d:-x}" = 0 ] && ok "enum dallanma 0" || kir "enum dallanma ${d:-?} (0 olmali)"
[ -z "$(rg -l 'flat-from-pattern|flat-geom' web/js web/create.html 2>/dev/null)" ] && ok "web flat'i C++'tan" || kir "flat-from-pattern hala cagriliyor"
var $C/once-sonra.png; png_boyut $C/once-sonra.png
for f in $C/0[1-9]-*.svg; do katman $f; done
[ -z "$(git ls-files $C/paket-01 $C/paket-02 $C/vitrin $C/puf)" ] && ok "onaysiz ciktilar silindi" || kir "paket-01/02, vitrin, puf hala git'te"
! grep -q "Buğra'nın 2 kalıbının" CLAUDE.md 2>/dev/null && ok "CLAUDE.md eski hedef satiri silindi" || kir "CLAUDE.md'de 29 Tem hedef satiri duruyor"
hukum P4
}

kabul_P5(){ K=0
# P5 prompt -> graf — ADIM 2 · ISTEK 1.1 1.9 2.11 3.2
D=$C/giris
var $D/giris-prompt-10.png; png_boyut $D/giris-prompt-10.png
n=$(ls $D/prompt-*.txt 2>/dev/null | wc -l | tr -d ' '); [ "$n" -ge 10 ] && ok "$n prompt" || kir "10 prompt gerekli, $n var"
for t in $D/prompt-*.txt; do g=${t%.txt}.graf.json; var $g ${t%.txt}-flat.png ${t%.txt}-kalip.svg; dogrula $g gercek36; done
farkli $D/prompt-*.graf.json
for s in "fiyonklu tek omuz" "kimono kollu" "korse" "keyhole"; do grep -qil "$s" $D/prompt-*.txt && ok "sozluk-disi prompt var: $s" || kir "sozluk-disi prompt yok: $s"; done
grep -qi "celis" $C/edge-case-tablosu.md && ok "celiskili prompt tabloda" || kir "celiskili prompt edge-case tablosunda yok"
hukum P5
}

kabul_P6(){ K=0
# P6 fotograf -> graf — ADIM 2,3,4 · ISTEK 1.1 1.7 1.8 1.11 3.1 3.2
D=$C/giris
var $D/giris-foto-20.png $D/onizleme.png; png_boyut $D/giris-foto-20.png $D/onizleme.png
n=$(ls $D/foto-*.graf.json 2>/dev/null | wc -l | tr -d ' '); [ "$n" -ge 20 ] && ok "$n foto graf" || kir "20 foto gerekli, $n var"
for g in $D/foto-*.graf.json; do b=${g%.graf.json}; var $b-overlay.png $b-flat.png $b-kalip.svg; dogrula $g gercek36; done
farkli $D/foto-*.graf.json
# 3.1: arka fotografi olmayan her graf 'uydur' ilani tasir; arka cifti en az 2
u=$(grep -l -i "uydur" $D/foto-*.graf.json 2>/dev/null | wc -l | tr -d ' '); a=$(ls $D/foto-*-arka.* 2>/dev/null | wc -l | tr -d ' ')
[ "$a" -ge 2 ] && ok "$a on+arka cifti" || kir "en az 2 on+arka cifti gerekli"
[ "$u" -ge 1 ] && ok "$u grafta arka uydurma ilani" || kir "arka uydurma ilani hicbir grafta yok"
for s in bulanik "giysi olmayan" "birden fazla" "kismi"; do grep -qi "$s" $C/edge-case-tablosu.md && ok "edge: $s" || kir "edge tabloda yok: $s"; done
grep -qi "landmark\|siluet" $C/edge-case-tablosu.md && ok "landmark/siluet kaynagi tabloda" || kir "landmark/siluet kaynagi anilmiyor"
hukum P6
}

kabul_P7(){ K=0
# P7 terzilik — ADIM 5,7 · ISTEK 1.6 1.7 1.10 3.2
D=$C/kumas-farki
var $D/kumas-farki.png $D/malzeme.md $D/rehber-tr.md $D/rehber-en.md; png_boyut $D/kumas-farki.png
for k in cotton-lawn cotton-modal-jersey viscose-crepe; do var $D/kalip-$k.svg $D/flat-$k.svg $D/dikilebilir-$k.md; done
farkli $D/kalip-cotton-lawn.svg $D/kalip-cotton-modal-jersey.svg $D/kalip-viscose-crepe.svg
cmp -s $D/flat-cotton-lawn.svg $D/flat-cotton-modal-jersey.svg && cmp -s $D/flat-cotton-lawn.svg $D/flat-viscose-crepe.svg && ok "flat 3 kumasta bayt-ayni" || kir "flat kumasla degisti (degismemeli)"
grep -qi "pervaz\|facing" $D/kalip-cotton-lawn.svg && ok "pervaz parcasi kalipta" || kir "pervaz yok"
grep -qiE "fermuar|zip" $D/malzeme.md && grep -qiE "cm|m\b" $D/malzeme.md && ok "malzeme listesi" || kir "malzeme listesinde fermuar/metraj yok"
grep -qE "\[[0-9]+\]|http|kaynak" $D/rehber-tr.md && ok "rehber kaynakli" || kir "rehber kaynaksiz"
hukum P7
}

kabul_P8(){ K=0
# P8 urun ve paket — ADIM 1,6,7,8 · ISTEK 1.10 1.13 4.4 HEDEF §4
D=$C/paket-03
var $D/README.md $D/flat.svg $D/flat.png $D/rehber-tr.md $D/rehber-en.md $D/dikilebilir.md $D/malzeme.md $D/beden-tablosu.md $D/prova-listesi.md $D/graf.json $D/damga.json $C/canli-ekran.png
ls $D/kalip-A4-EU36.pdf >/dev/null 2>&1 && ok "A4 pdf" || kir "kalip-A4-EU36.pdf yok"
[ "$(ls $D/ekran-*.png 2>/dev/null | wc -l | tr -d ' ')" -ge 3 ] && ok "ekranlar" || kir "en az 3 ekran png"
grep -qiE "fotograf|foto" $D/README.md && ! grep -qi "PROMPT KOKENLI" $D/README.md && ok "koken fotograf" || kir "paket fotograf kokenli degil"
grep -qE "[0-9]+(\.[0-9]+)? ?mm" $D/dikilebilir.md && ok "dikilebilirlik mm tablosu" || kir "dikilebilir.md'de mm yok"
grep -qi "beklenen" $D/prova-listesi.md && ok "prova listesi beklenen sayilarla" || kir "prova listesinde beklenen sayi yok"
python3 engine/tools/techpack-verify.py $D >/dev/null 2>&1 && ok "techpack-verify" || kir "techpack-verify kirmizi"
! rg -qiE '\$[0-9]|₺|€[0-9]|price|fiyat' web/index.html && ok "landing'de fiyat yok" || kir "landing'de fiyat/price"
! rg -qi "patch-notes\|patch notes" web/index.html && ok "patch notes yok" || kir "landing'de patch notes"
curl -s --max-time 20 https://stitchu.noseydewdrop.com/create.html | grep -q "stitchu" && ok "canli 200" || kir "canli site cevap vermiyor"
dogrula $D/graf.json gercek36
hukum P8
}

kabul_P9(){ K=0
# P9 tur — iki temiz tur ust uste
ls -d $C/tur-* >/dev/null 2>&1 || kir "tur-N yok"
son=$(ls -d $C/tur-* 2>/dev/null | sort -V | tail -2)
c=0; for t in $son; do var $t/hukum.json; python3 -c "import json,sys;h=json.load(open('$t/hukum.json'));sys.exit(0 if h.get('kusur',[])==[] and h.get('alirMiydim')=='ALIRDIM' else 1)" && { ok "temiz: $t"; c=$((c+1)); } || kir "temiz degil: $t"; done
[ $c -eq 2 ] && ok "iki temiz tur" || kir "iki ust uste temiz tur yok"
hukum P9
}

# ---------------------------------------------------------------- muhur
liste(){ { ls KOSU/sinyal.sh KOSU/flat-olcum.py KOSU/uret.mjs HEDEF.md engine/tests/enum-dallanma-baseline.json engine/tests/enum_dallanma_check.sh 2>/dev/null; find engine/tests -type f \( -name '*.mjs' -o -name '*.cpp' -o -name '*.sh' -o -name '*.py' \) ; } | sort -u; }
muhur_yaz(){ liste | xargs shasum -a 256 > KOSU/muhur.txt; echo "muhur yazildi: $(wc -l < KOSU/muhur.txt | tr -d ' ') dosya"; }
muhur_kontrol(){ [ -f KOSU/muhur.txt ] || { echo "  KIRMIZI muhur yok"; return 1; }
  if shasum -a 256 -c KOSU/muhur.txt --status 2>/dev/null; then echo "  YESIL muhur saglam ($(wc -l < KOSU/muhur.txt | tr -d ' ') dosya)"; yeni=$(comm -13 <(cut -c67- KOSU/muhur.txt | sort) <(liste)); [ -n "$yeni" ] && echo "  bilgi — yeni (muhursuz) test dosyalari:" && echo "$yeni" | sed 's/^/    /'; return 0
  else echo "  KIRMIZI muhur bozuldu:"; shasum -a 256 -c KOSU/muhur.txt 2>/dev/null | grep -v ': OK$' | sed 's/^/    /'; return 1; fi; }
# ---------------------------------------------------------------- sinyal
sinyal(){ MOD=$1; K=0; echo "== SINYAL ($MOD) $(date '+%Y-%m-%d %H:%M') HEAD $(git rev-parse --short HEAD)"
  echo "-- 1 muhur"; muhur_kontrol || K=1
  echo "-- 2 enum tabani (kat cikma dedektoru)"
  d=$(bash engine/tests/enum_dallanma_check.sh --measure 2>/dev/null | grep -E '^cpp\.dallanma' | grep -oE '[0-9]+$'); t=$(taban_oku dallanma)
  if [ -z "${d:-}" ]; then echo "  KIRMIZI enum olcumu okunamadi"; K=1; elif [ "$d" -gt "$t" ]; then echo "  KIRMIZI cpp.dallanma $d > taban $t"; K=1; else echo "  YESIL cpp.dallanma $d (taban $t)"; fi
  echo "-- 3 kapanan fazlarin kabulu (compounding error)"
  for p in $(taban_oku kapanan | tr ',' ' '); do kabul_$p >/tmp/_k_$p.txt 2>&1 && echo "  YESIL $p" || { echo "  KIRMIZI $p"; grep KIRMIZI /tmp/_k_$p.txt | sed 's/^/    /'; K=1; }; done
  if [ "$MOD" = tam ]; then echo "-- 4 DEVIR.md KABUL zinciri"
    cmake --build engine/build -j2 >/dev/null 2>&1 && ctest --test-dir engine/build -R 'golden|recipe|primitif|edit_locality|manken|kumas|parca|vocab|flatten|surface|enum_dallanma|body_check|gen_contract|bundle_fresh|graf_ir_check|graf_op_check|graf_dikilebilir_check' -j1 >/tmp/_ct.txt 2>&1 && echo "  YESIL ctest $(grep -oE '[0-9]+ tests passed' /tmp/_ct.txt | head -1)" || { echo "  KIRMIZI ctest"; grep -E 'Failed|\*\*\*' /tmp/_ct.txt | head -5 | sed 's/^/    /'; K=1; }
    python3 KOSU/flat-olcum.py >/tmp/_fo.txt 2>&1 && grep -q 'ESIK KONTROL OK' /tmp/_fo.txt && echo "  YESIL flat-olcum" || { echo "  KIRMIZI flat-olcum"; K=1; }
    node engine/tests/primitif_ifade_check.mjs >/dev/null 2>&1 && echo "  YESIL primitif_ifade" || { echo "  KIRMIZI primitif_ifade"; K=1; }
    if ! taban_oku kapanan | grep -q P4; then # P4'e kadar iki bilinen kirmizi sayi piniyle
      node KOSU/uret.mjs >/dev/null 2>&1; a=$(node engine/tests/flat_ayni_insan_check.mjs 2>&1 | grep -c 'FAIL  34 hukum kirmizi'); b=$(node engine/tests/cizim_giysi_mi.mjs 2>&1 | grep -c 'FAIL cizim_giysi_mi — 1 ihlal')
      [ "$a" = 1 ] && [ "$b" = 1 ] && echo "  YESIL bilinen kirmizi pinleri sabit (34 hukum, 1 ihlal)" || { echo "  KIRMIZI pin degisti: flat_ayni=$a cizim=$b (regresyon ya da ilan guncellenmeli)"; K=1; }
    fi
  fi
  echo "-- 5 defter (0509-kosu.md §5.1-5.2)"; grep -E '^5\.[12]\.' 0509-kosu.md | sed 's/^/  /'
  echo "-- 6 nerede kaldik (KOSU/0509-ilerleme.md)"; grep -E '^\| 20' KOSU/0509-ilerleme.md | tail -2 | cut -c1-200 | sed 's/^/  /'
  [ $K -eq 0 ] && echo "== SINYAL: YESIL" || { echo "== SINYAL: KIRMIZI"; exit 1; }
}
case "${1:-hizli}" in
  hizli|tam) sinyal "$1";;
  kabul) kabul_"$2";;
  muhurle) muhur_yaz;;
  kapat) kabul_"$2" && sinyal tam && { k=$(taban_oku kapanan); taban_yaz kapanan "${k:+$k,}$2"; [ "$2" = P4 ] && taban_yaz dallanma 0; echo "== $2 tabana islendi"; };;
  *) echo "kullanim: sinyal.sh hizli|tam|kabul PN|muhurle|kapat PN"; exit 2;;
esac
