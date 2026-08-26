#!/usr/bin/env bash
# F4 MUTASYON KOŞUMU — GECE7, §3.8 md.3.
#
# F5-D'nin betiğinin halefi (kart onu "İYİ YAZILMIŞ, kopyala" dedi).
# Korunan dört şey:
#  1. ⚠ BAYAT İKİLİ TUZAĞI: her turda ikili SİLİNİR, yeniden derlenir ve `shasum`
#     ile gerçekten kımıldadığı kanıtlanır. Kımıldamadıysa "HUKUM YOK".
#  2. ⚠ İKİLİ KIMILDASA BİLE SAYI KIMILDAMAYABİLİR (hakemin HK-1'i): o yüzden
#     her turda ikilinin yanında ÖLÇÜLEN SAYI da basılır (body_length + H6).
#     İkisi de durduysa hüküm YOKTUR.
#  3. ⭐ ETİKET BİR ÖLÇÜMDÜR: her turun başında
#     `git diff --numstat F4-oncesi..HEAD -- <dosya>` BASILIR. BOŞ = bu kartta
#     dokunulmamış dosya. İKİ mutasyon bilerek boş dosyalara yayılıyor.
#  4. ⭐ Zincirler kısa: her tur tek dosya, `trap` ile geri alma, `git status`
#     ile sıfırlandığının doğrulanması.
#
# ikili sütunu = shasum ilk-8'lerin BİRLEŞİMİ, bu sırayla:
#     shell-flat | surface-pattern | seam-plan | shell-audit
# Yani 32 karakterlik bir dize ve DÖRT ayrı sayının yan yana hâli, tek hash değil.
set -uo pipefail
cd "$(dirname "$0")/../.."
B=engine/build
BINS="shell-flat surface-pattern seam-plan shell-audit"

hash_of() { shasum "$1" 2>/dev/null | cut -c1-8; }
ikili() { local o=""; for b in $BINS; do o="$o$(hash_of "$B/$b")"; done; echo "$o"; }
build() { for b in $BINS; do rm -f "$B/$b"; done; cmake --build "$B" -j8 --target $BINS >/dev/null 2>&1; }

AGREE="engine/tests/flat_pattern_agree_check.mjs"
CONV="engine/tests/flat_convention_check.mjs"
TEK="engine/tests/tek_nesne_check.mjs"

run_gate() { node "$1" >/dev/null 2>&1 && echo "EXIT 0 (YESIL)" || echo "EXIT $? (KIRMIZI)"; }
# ÖLÇÜLEN SAYILAR — ikili kımıldadı diye hüküm verilmesin diye (HK-1 dersi)
blen() { "$B/shell-flat" EU38 2>/dev/null | tr -d ' \n' | sed -n 's/.*"body_length","ring":"[^"]*","mm":\([0-9.]*\).*/\1/p'; }
h6()   { node "$CONV" 2>/dev/null | sed -n 's/.*H6 = \([0-9]*\) .*/\1/p' | head -1; }
sayilar() { echo "body_length=$(blen) H6=$(h6)"; }

etiket() {
  local d n; d="$1"; n=$(git diff --numstat F4-oncesi..HEAD -- "$d")
  if [ -z "$n" ]; then echo "        YAYILIM: git numstat F4-oncesi..HEAD -- $d  BOS -> bu kartta DOKUNULMAMIS dosya"
  else echo "        YAYILIM: git numstat $n  -> bu kartta YAZILAN dosya"; fi
}

ORIG=/tmp/f4.orig; ODOSYA=""
restore() { [ -n "$ODOSYA" ] && [ -f "$ORIG" ] && cp "$ORIG" "$ODOSYA"; ODOSYA=""; }
trap 'restore' EXIT INT TERM

mutate() {  # ad dosya perl-ifadesi kapi
  local ad="$1" dosya="$2" ifade="$3" kapi="$4"
  ODOSYA="$dosya"; cp "$dosya" "$ORIG"; etiket "$dosya"
  build; local h0 s0; h0=$(ikili); s0=$(sayilar)
  perl -0pi -e "$ifade" "$dosya"
  if cmp -s "$ORIG" "$dosya"; then
    echo "  $ad  KAYNAK DEGISMEDI — mutasyon tutmadi, HUKUM YOK"; restore; build; return
  fi
  build; local h1 s1; h1=$(ikili); s1=$(sayilar)
  if [ "$h0" = "$h1" ] && [ "$s0" = "$s1" ]; then
    # IKILI DE SAYI DA DURDU. Derlenen bir kaynak icin bu HUKUM YOK demektir
    # (bayat ikili / atil yol). Ama mutasyon bir VERI dosyasindaysa derlenecek
    # bir sey yoktur ve kapinin okudugu sayi kapinin KENDI icinde hesaplanir —
    # o yuzden kapi yine de kosulur ve hukmun neye dayandigi ACIKCA yazilir.
    echo "  $ad  IKILI DE OLCULEN SAYI DA KIMILDAMADI ($h0 · $s0)"
    echo "        kaynak DEGISTI (cmp farkli) — derlenen bir yol yok, hukum YALNIZ kapinin cikisina dayaniyor"
    echo "        kapi $kapi: $(run_gate "$kapi")"
  else
    echo "  $ad  ikili[shell-flat|surface-pattern|seam-plan|shell-audit] $h0 -> $h1"
    echo "        olculen: $s0  ->  $s1"
    [ "$s0" = "$s1" ] && echo "        ⚠ OLCULEN SAYI KIMILDAMADI — hukum yalniz kapinin cikisina dayaniyor"
    echo "        kapi $kapi: $(run_gate "$kapi")"
  fi
  restore; build
  echo "        geri alindi: ikili $(ikili) (taban $h0) · olculen $(sayilar) · kapi: $(run_gate "$kapi")"
  git status --short "$dosya"
}

echo "=== F4 MUTASYONLARI — $(date '+%Y-%m-%d %H:%M') ==="
build
echo "    temiz agac: ikili $(ikili)"
echo "    temiz agac olculen: $(sayilar)"
echo "    temiz agac kapilari: agree $(run_gate $AGREE) · conv $(run_gate $CONV)"
echo

echo "--- IS 1 (K23): body_length'in BASLANGICI bir kapiya bagli mi ---"
echo
echo "M1 engine/src/shellprojection.cpp — MERKEZ CIZGIYI YINE OMUZ HALKASINDAN BASLAT"
echo "    Kartin K23'u tam olarak bu haldeydi: flat merkez yayi omuz HALKASINDAN"
echo "    (yatay kesit) yururken kalip kumasin KESILDIGI yerden basliyordu."
echo "    flat_pattern_agree_check YANMALI ve sapma -3.7979%'a donmeli."
mutate M1 engine/src/shellprojection.cpp \
  's/    const double topZ = clothTopZ\(pat, front\);/    const double topZ = shoulder.h;  \/\/ MUTASYON M1: kesim degil, HALKA/' \
  "$AGREE"
echo

echo "M2 engine/src/surfacepattern.cpp — YAYINLANAN UST SINIR YUKSEKLIGINI BOZ  (numstat BOS)"
echo "    topColZMM cozulmus noktanin z'si olmaktan cikip 5mm yukari kayiyor."
echo "    Kalip panelleri DEGISMEZ (onlar tH[j]'yi kullaniyor), yalniz YAYINLANAN"
echo "    sinir yalan soyler. Kapi bunu gormezse 'flat, kalibin cozdugu siniri"
echo "    okuyor' cumlesi olculmemis bir iddiadir."
mutate M2 engine/src/surfacepattern.cpp \
  's/            pat\.topColZMM\[j\] = p\.z;/            pat.topColZMM[j] = p.z + 5.0;  \/\/ MUTASYON M2/' \
  "$AGREE"
echo

echo "--- IS 2 (H6): manken capasi ILAN EDILMIS bir bedene bagli mi ---"
echo
echo "M3 contract/mannequin-chart-v1.json — ZINCIRI KIR"
echo "    omuz/gogus orani 0.9570 -> 0.9000. Kanun dosyasindaki shoulderTipX"
echo "    artik mankenden TUREMIYOR. Sekiz stil hala birbirini tutuyor, yani"
echo "    bolum 1 YESIL kalir; yanmasi gereken 1d zincir kolu."
mutate M3 contract/mannequin-chart-v1.json \
  's/"omuzGogusOrani": 0\.9570/"omuzGogusOrani": 0.9000/' \
  "$CONV"
echo

echo "M4 web/lib/flat-core.js — CAPAYI OYNAT  (numstat BOS)"
echo "    Uretim kalemi omuz yari-genisligini croquis'ten 2 birim (6 mm) ICERI"
echo "    aliyor. H6 SIFIRDAN BUYUMELI: cizilen flat artik ilan edilmis mankenin"
echo "    capasinda degil."
mutate M4 web/lib/flat-core.js \
  's/  shoulderW: CQ\.shoulderTipX\.u,/  shoulderW: CQ.shoulderTipX.u - 2,  \/\/ MUTASYON M4/' \
  "$CONV"
echo

echo "M5 engine/src/seamplan.cpp — FARKIN KAYNAGINI SIL"
echo "    bedenlendirme blogu cizelgeyi ve donusumu hala basiyor ama farkin"
echo "    NEREDEN geldigini soylemiyor. tek_nesne_check'in sertlestirilmis §2"
echo "    kolu YANMALI: sessizce uydurulmus bir manken farki gecemez."
mutate M5 engine/src/seamplan.cpp \
  's/\\"fark_kaynagi\\": \\"BIZIM KARARIMIZ \(GECE7 \/ F4\)/\\"fark_kaynagi\\": \\"(kaynak yazilmadi)/' \
  "$TEK"
echo
echo "=== BITTI — agac: ==="
git status --short engine contract web | head
