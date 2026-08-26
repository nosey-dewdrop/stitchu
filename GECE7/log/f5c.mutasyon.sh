#!/usr/bin/env bash
# F5-C MUTASYON KOŞUMU — GECE7, §3.8 md.3.
#
# F5-B'nin betiğinin halefi (hakem onu "iyi yazılmış" buldu; kopyalandı ve ÜÇ
# yerde sıkıldı):
#
#  1. ⚠ BAYAT İKİLİ TUZAĞI, aynen: her turda ikili SİLİNİR, yeniden derlenir ve
#     `shasum` ile GERÇEKTEN kımıldadığı kanıtlanır. Kımıldamadıysa HÜKÜM
#     VERİLMEZ, "HUKUM YOK" yazılır.
#
#  2. ⭐ `ikili` ALANI KENDİ KENDİNİ AÇIKLAR (hakemin F5-A notu, F5-B'de
#     uygulandı, burada da). Aşağıdaki `ikili` sütunu şu DÖRT ikilinin
#     shasum'larının ilk 8 karakterinin BİRLEŞİMİDİR, bu sırayla:
#         seam-plan | rotate-op | suppress-op | split-op
#     Yani 32 karakterlik bir dize ve dört ayrı sayının yan yana yazılmış hâli,
#     TEK BİR HASH DEĞİL. İki tur arasında yalnız son sekizli değişmişse yalnız
#     split-op kımıldamıştır.
#
#  3. ⭐ ZİNCİRLER KISA (F5-B'de betik bir kez ARADA ÖLDÜ ve ağacı mutasyonlu
#     bıraktı). Her `mutate` turu tek dosyaya dokunur, `trap` ile her çıkışta
#     geri alır, ve her turdan sonra `git status` ile sıfırlandığını doğrular.
#
#  4. ⭐ İŞ 0d (borç 47): F5-B'nin ETİKETLEMESİ yanlıştı — M1/M7/M7b "yazmadım"
#     diye işaretlenmişti ama ajan o dosyalara yazmıştı. Burada her mutasyonun
#     yanında `git diff --numstat F5C-oncesi..HEAD -- <dosya>` çıktısı BASILIR:
#     etiket bir iddia değil, bir ÖLÇÜM. BOŞ satır = dosyaya dokunulmadı.
set -uo pipefail
cd "$(dirname "$0")/../.."
B=engine/build

BINS="seam-plan rotate-op suppress-op split-op shell-audit"
hash_of() { shasum "$1" 2>/dev/null | cut -c1-8; }
ikili() { local o=""; for b in seam-plan rotate-op suppress-op split-op; do o="$o$(hash_of "$B/$b")"; done; echo "$o"; }

build() {
  for b in $BINS; do rm -f "$B/$b"; done
  cmake --build "$B" -j8 --target $BINS >/dev/null 2>&1
}

run_gate() { node "$@" >/dev/null 2>&1 && echo "EXIT 0 (YESIL)" || echo "EXIT $? (KIRMIZI)"; }
nodeid() { "$B/seam-plan" EU38 --kalip 2>/dev/null | sed -n 's/.*"dugum": "\(.*\)".*/\1/p'; }

# ⭐ ETİKET BİR ÖLÇÜMDÜR (İŞ 0d). Bu satır boşsa dosya bu kartta HİÇ
# DEĞİŞMEDİ; doluysa değişti ve öyle yazılır.
etiket() {
  local d n; d="$1"
  n=$(git diff --numstat F5C-oncesi..HEAD -- "$d")
  if [ -z "$n" ]; then echo "        YAYILIM: git numstat F5C-oncesi..HEAD -- $d  BOS -> bu kartta DOKUNULMAMIS dosya"
  else echo "        YAYILIM: git numstat $n  -> bu kartta YAZILAN dosya"; fi
}

ORIG=""; ODOSYA=""
restore() { [ -n "$ODOSYA" ] && [ -f "$ORIG" ] && cp "$ORIG" "$ODOSYA"; ODOSYA=""; }
trap 'restore' EXIT INT TERM

mutate() {  # ad dosya perl-ifadesi kapi...
  local ad="$1" dosya="$2" ifade="$3"; shift 3
  ORIG=/tmp/f5c.orig; ODOSYA="$dosya"
  cp "$dosya" "$ORIG"
  etiket "$dosya"
  build; local h0 n0; h0=$(ikili); n0=$(nodeid)
  perl -0pi -e "$ifade" "$dosya"
  if cmp -s "$ORIG" "$dosya"; then
    echo "  $ad  KAYNAK DEGISMEDI — mutasyon tutmadi, HUKUM YOK"; restore; build; return
  fi
  build; local h1 n1; h1=$(ikili); n1=$(nodeid)
  if [ "$h0" = "$h1" ]; then
    echo "  $ad  IKILI KIMILDAMADI ($h0) — HUKUM YOK (bayat ikili / atil yol)"
  else
    echo "  $ad  ikili[seam-plan|rotate-op|suppress-op|split-op] $h0 -> $h1"
    echo "        dugum $n0 -> $n1"
    echo "        kapi: $(run_gate "$@")"
  fi
  restore; build
  echo "        geri alindi: ikili $(ikili) (taban $h0) · kapi: $(run_gate "$@")"
  git status --short "$dosya"
}

# ⏱ IS 0a'NIN FIKSTURU BURADA DA KULLANILIYOR, VE SEBEBI OLCULMUS: suppress-op
# 375.74 sn suruyor (bu makinede olculdu: shipped 4.58 + following 8.57 +
# doubled 366.17). Onu her mutasyon turunda IKI KEZ kosturmak bu betigi saatlere
# cikarirdi. Fikstur BIR KEZ uretilir; suppress-op'un CIKTISINI degistirmeyen
# mutasyonlar (rotate-op, panelsplit, shellprojection, sozlesme) onu okur.
# ⚠ suppress-op'un cikti sayilarini DEGISTIREN tek mutasyon MU1'dir ve o kendi
# fiksturunu YENIDEN URETIR — bayat fikstur uzerinde hukum verilmez.
SUPFIX=/tmp/f5c-sup.json
genfix() { "$B/suppress-op" EU38 -o "$SUPFIX" >/dev/null 2>&1; }

SPL="engine/tests/split_check.mjs $B/split-op"
SUP="engine/tests/suppress_check.mjs $SUPFIX"
ROT="engine/tests/rotate_check.mjs $B/rotate-op $SUPFIX"
TEK="engine/tests/tek_nesne_check.mjs $B/seam-plan $B/shell-audit"
EXP=engine/tests/expressability_check.mjs

echo "=== F5-C MUTASYONLARI — $(date '+%Y-%m-%d %H:%M') ==="
echo "    ikili sutunu = shasum ilk-8'lerin BIRLESIMI: seam-plan|rotate-op|suppress-op|split-op"
build
echo "    temiz agac fiksturu uretiliyor (suppress-op ~376 sn)..."
genfix
echo "    fikstur: $SUPFIX  shasum $(hash_of "$SUPFIX")"
echo
echo "--- IS 1: op.split GERCEK BIR OPERATOR MU (kartin iki sart mutasyonu) ---"
echo
echo "MS1 engine/src/panelsplit.cpp — BOLMEYI KIMLIKSIZLESTIR"
echo "    'bolundu' isaretlenir, geometriye DOKUNULMAZ: iki parca da BUTUN"
echo "    konturun kopyasi olur. Kartin 1. sart mutasyonu."
echo "    SP3 (alan A+B = butun) ve SP4 (nokta sayisi n+2) YANMALI."
mutate MS1 engine/src/panelsplit.cpp \
  's/    r\.pieceA\.assign\(p\.contour\.begin\(\) \+ static_cast<long>\(lo\),\n                    p\.contour\.begin\(\) \+ static_cast<long>\(hi\) \+ 1\);/    r.pieceA = p.contour;  \/\/ MUTASYON: bolundu isaretli, geometri birakildi/' \
  $SPL
echo
echo "MS2 engine/src/panelsplit.cpp — BOLME YERINI SABITE CEVIR"
echo "    argmin yerine panelin ortasi (colsN\/2). Kartin 2. sart mutasyonu, ve"
echo "    kapinin SP0 kolunun tam olarak varlik sebebi: split_check argmin'i"
echo "    KENDI yeniden hesapliyor. SP0 ve SP5 (kesir artik SABIT) YANMALI."
mutate MS2 engine/src/panelsplit.cpp \
  's/    r\.atColumn = bestCol;/    bestCol = colsN \/ 2;  \/\/ MUTASYON: kadran geri geldi\n    r.atColumn = bestCol;/' \
  $SPL
echo
echo "MS3 engine/src/surfacepattern.cpp — SUTUN PROFILINI DUZLESTIR (bu kartta YAZILAN dosya)"
echo "    her sutun panelin ortalamasini alir: toplam AYNI kalir (SP1 ve SP2"
echo "    gecer!) ama profil DUZ olur ve argmin artik bir sey olcmez."
echo "    SP0 ya da SP5 YANMALI — 'toplami koruyan' bir sahtecilik de yakalanmali."
mutate MS3 engine/src/surfacepattern.cpp \
  's/        for \(double d : defCol\) out\.deficitColumnDeg\.push_back\(d \* 180\.0 \/ kPi\);/        {  \/\/ MUTASYON: profil duzlestirildi, TOPLAM korunuyor\n            double t = 0; for (double d : defCol) t += d;\n            for (std::size_t q = 0; q < defCol.size(); ++q)\n                out.deficitColumnDeg.push_back(t \/ static_cast<double>(defCol.size()) * 180.0 \/ kPi);\n        }/' \
  $SPL
echo
echo "--- IS 0d (borc 47): YAYILIM — UC AYRI, GERCEKTEN DOKUNULMAMIS DOSYA ---"
echo "    Her turun basinda git numstat basiliyor; BOS satir = dokunulmadi."
echo
echo "MU1 engine/src/dartsuppress.cpp — F5-C'nin YAZMADIGI dosya"
echo "    op.suppress'in acisi bir sabite cevrilir (41.48). suppress_check'in"
echo "    S1/S2 kollari YANMALI. F5-B'nin kapisinin hala kapi oldugunu olcer."
echo "    ⚠ BU TUR KENDI FIKSTURUNU YENIDEN URETIR (2 x ~376 sn): mutasyon"
echo "       suppress-op'un CIKTI SAYILARINI degistiriyor, bayat fikstur uzerinde"
echo "       hukum verilmez."
etiket engine/src/dartsuppress.cpp
cp engine/src/dartsuppress.cpp /tmp/f5c.mu1
build; MU1H0=$(ikili)
perl -0pi -e 's/    r\.deficitDeg = panel\.developDeficitDeg;/    r.deficitDeg = 41.48;  \/\/ MUTASYON/' engine/src/dartsuppress.cpp
if cmp -s /tmp/f5c.mu1 engine/src/dartsuppress.cpp; then
  echo "  MU1 KAYNAK DEGISMEDI — mutasyon tutmadi, HUKUM YOK"
else
  build; MU1H1=$(ikili); genfix
  if [ "$MU1H0" = "$MU1H1" ]; then
    echo "  MU1 IKILI KIMILDAMADI ($MU1H0) — HUKUM YOK"
  else
    echo "  MU1 ikili[seam-plan|rotate-op|suppress-op|split-op] $MU1H0 -> $MU1H1"
    echo "        fikstur shasum $(hash_of "$SUPFIX") (YENIDEN URETILDI)"
    echo "        kapi: $(run_gate $SUP)"
  fi
fi
cp /tmp/f5c.mu1 engine/src/dartsuppress.cpp; build; genfix
echo "        geri alindi: ikili $(ikili) (taban $MU1H0) · fikstur $(hash_of "$SUPFIX") · kapi: $(run_gate $SUP)"
git status --short engine/src/dartsuppress.cpp
echo
echo "MU2 engine/src/shellprojection.cpp — F5-C'nin YAZMADIGI dosya"
echo "    HM3 aynen: bust_circumference BELIN cevresini basar. tek_nesne_check"
echo "    YANMALI."
mutate MU2 engine/src/shellprojection.cpp \
  's/    out\.measures\.push_back\(\{"bust_circumference", bust\.name, girthAt\(surf, bust\.h\)\}\);/    out.measures.push_back({"bust_circumference", bust.name, girthAt(surf, waist.h)});/' \
  $TEK
echo
echo "MU3 engine/tools/rotate-op.cpp — F5-C'nin YAZMADIGI dosya"
echo "    apeks kesri motordan okunmak yerine yerel bir sabitten alinir."
echo "    rotate_check'in R8 kolu YANMALI — ve bu tur ayrica IS 0a'nin"
echo "    fikstur degisikliginin R0'i bozmadigini gosterir."
mutate MU3 engine/tools/rotate-op.cpp \
  's/        const double apexDepth = plan\.opt\.bodiceApexFrac \* colLen;/        const double kCopiedApexFrac = 0.80;  \/\/ MUTASYON\n        const double apexDepth = kCopiedApexFrac * colLen;/' \
  $ROT
echo
echo "--- IS 0e (borc 48): K6 OZET SATIRI ARTIK KOSULLU — HM-B TEKRARLANIYOR ---"
echo
echo "MB  engine/src/surfacepattern.cpp — GarmentSurf::at() yuzeyi %5 buyutur."
echo "    F5-B'de bu mutasyon tek_nesne_check'i EXIT 1 yapiyordu (10 FAIL) AMA"
echo "    'ok K6 14 yayinlanan olcu ... dogrulandi' satiri YINE BASILIYORDU."
echo "    Beklenen: EXIT 1, ve o satir BASILMAZ."
cp engine/src/surfacepattern.cpp /tmp/f5c.hmb
perl -0pi -e 's/    s\.offsetPoint\(d, phi, px, py\);\n    return \{px, py, h\};/    s.offsetPoint(d, phi, px, py);\n    return {px * 1.05, py * 1.05, h};  \/\/ MUTASYON HM-B/' engine/src/surfacepattern.cpp
build
TEKOUT=$(node $TEK 2>&1); TEKRC=$?
echo "    kapi: EXIT $TEKRC ($([ $TEKRC -eq 0 ] && echo YESIL || echo KIRMIZI))"
echo "    K6 FAIL sayisi        : $(printf '%s\n' "$TEKOUT" | grep -c '^FAIL  K6')"
echo "    K6 OZET SATIRI basildi mi: $(printf '%s\n' "$TEKOUT" | grep -c 'BAGIMSIZ İKİNCİ YOLDAN doğrulandı\|BAĞIMSIZ İKİNCİ YOLDAN doğrulandı') kez (BEKLENEN 0)"
printf '%s\n' "$TEKOUT" | grep 'K6 ÖZET BASILMADI' | sed 's/^/    /'
cp /tmp/f5c.hmb engine/src/surfacepattern.cpp
build
TEKOUT=$(node $TEK 2>&1); TEKRC=$?
echo "    geri alindi · kapi: EXIT $TEKRC · K6 ozet satiri: $(printf '%s\n' "$TEKOUT" | grep -c 'BAĞIMSIZ İKİNCİ YOLDAN doğrulandı') kez (BEKLENEN 1)"
echo
echo "--- §0B: SAYACIN KENDISI (K35 hala yururlukte mi) ---"
echo
echo "MC1 contract/primitives-v1.json — ODUNC AD (hakemin HM-A'si, ARTIK op.split GERCEK)"
echo "    op.split'in motorda_kapi'si VAR OLAN ama alakasiz bir teste ('geometry')"
echo "    cevrilir. K35 kolu KIRMIZI yakmali — operatorun kendisi artik gercek"
echo "    olsa bile, KAPI KENDI ADINI tasimak zorunda."
cp contract/primitives-v1.json /tmp/f5c.contract
python3 - <<'PY'
import json,collections
p='contract/primitives-v1.json'
d=json.load(open(p,encoding='utf8'),object_pairs_hook=collections.OrderedDict)
d['primitifler']['op.split']['motorda_kapi']='geometry'
open(p,'w',encoding='utf8').write(json.dumps(d,ensure_ascii=False,indent=2)+"\n")
PY
echo "    kapi: $(run_gate $EXP)"
cp /tmp/f5c.contract contract/primitives-v1.json
echo "        geri alindi · kapi: $(run_gate $EXP)"
echo
echo "MC2 contract/primitives-v1.json — OLMAYAN KAPI (F5-B'nin M8'i)"
echo "    op.attach kendine olmayan bir kapi (attach_check) gosterir."
cp contract/primitives-v1.json /tmp/f5c.contract
python3 - <<'PY'
import json,collections
p='contract/primitives-v1.json'
d=json.load(open(p,encoding='utf8'),object_pairs_hook=collections.OrderedDict)
d['primitifler']['op.attach']['motorda_kapi']='attach_check'
open(p,'w',encoding='utf8').write(json.dumps(d,ensure_ascii=False,indent=2)+"\n")
PY
echo "    kapi: $(run_gate $EXP)"
cp /tmp/f5c.contract contract/primitives-v1.json
echo "        geri alindi · kapi: $(run_gate $EXP)"
echo
echo "MC3 engine/tests/expressability_check.mjs — PAYDAYI DARALT (hakemin HM4'u)"
echo "    freesewing-aaron listeden silinir. Muhur (TABAN_PAYDA) KIRMIZI yakmali."
echo "    ⚠ Muhre DOKUNULMUYOR; silinen GIYSI satiri, muhur degil."
cp engine/tests/expressability_check.mjs /tmp/f5c.exp
python3 - <<'PY'
p='engine/tests/expressability_check.mjs'
s=open(p,encoding='utf8').read()
i=s.index('    ad: "freesewing-aaron",')
a=s.rindex('  {',0,i)
b=s.index('];',i)
s=s[:a]+s[b:]
open(p,'w',encoding='utf8').write(s)
PY
echo "    kapi: $(run_gate $EXP)"
cp /tmp/f5c.exp engine/tests/expressability_check.mjs
echo "        geri alindi · kapi: $(run_gate $EXP)"
echo
echo "=== git status (temiz olmali) ==="
git status --short engine/src engine/tools engine/tests contract
