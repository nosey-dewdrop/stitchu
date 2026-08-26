#!/usr/bin/env bash
# F4 HAKEM MUTASYONLARI — GECE7, §3.8 md.3.
#
# Bu betik AJANIN betiği değil. `f5d.mutasyon.sh` / `f4.mutasyon.sh` şeklinde
# yazıldı ve iki yerde sıkıldı:
#
#  1. ⚠ BAYAT İKİLİ TUZAĞI: her turda ikili SİLİNİR, yeniden derlenir ve
#     `shasum` ile GERÇEKTEN kımıldadığı kanıtlanır. Kımıldamadıysa
#     "HUKUM YOK" yazılır (HK-1'in dersi).
#  2. ⭐ ETİKET BİR ÖLÇÜMDÜR: her turun başında
#     `git diff --numstat F4-oncesi..HEAD -- <dosya>` BASILIR.
#     BOŞ = dosyaya BU KARTTA DOKUNULMADI.
#
# HAKEMİN BEŞ MUTASYONUNUN BEŞİ DE `numstat` BOŞ dosyalarda (ajanın hiç
# açmadığı dosyalar). Ajanın kendi beşlisiyle ÇAKIŞMIYOR.
set -uo pipefail
cd "$(dirname "$0")/../.."
B=engine/build

BINS="seam-plan shell-flat shell-audit"
hash_of() { shasum "$1" 2>/dev/null | cut -c1-8; }
ikili() { local o=""; for b in $BINS; do o="$o$(hash_of "$B/$b")"; done; echo "$o"; }

build() {
  for b in $BINS; do rm -f "$B/$b"; done
  cmake --build "$B" -j8 --target $BINS >/dev/null 2>&1
}

run_gate() { node "$@" >/dev/null 2>&1 && echo "EXIT 0 (YESIL)" || echo "EXIT $? (KIRMIZI)"; }

# ÖLÇÜLEN SAYILAR — ikili kımıldayıp sayı durursa hüküm YALNIZ kapının çıkışına
# dayanır ve bu satır satır yazılır (HK-1).
bodylen() {
  node engine/tests/flat_pattern_agree_check.mjs 2>/dev/null \
    | sed -n 's/.*body_length *\([0-9.]*\) .*/\1/p' | head -1
}
h6() {
  node engine/tests/flat_convention_check.mjs 2>/dev/null \
    | sed -n 's/.*H6 = \([0-9]*\).*/\1/p' | head -1
}
h5() {
  node engine/tests/hedef_kosu.mjs 2>/dev/null \
    | sed -n 's/.*\([0-9]*\) eşleşmeyen çift \/ \([0-9]*\) ölçülebilen çift.*/\1\/\2/p' | head -1
}
olcum() { echo "body_length=$(bodylen) H6=$(h6) H5=$(h5)"; }

etiket() {
  local d n; d="$1"
  n=$(git diff --numstat F4-oncesi..HEAD -- "$d")
  if [ -z "$n" ]; then echo "        YAYILIM: git numstat F4-oncesi..HEAD -- $d  BOS -> bu kartta DOKUNULMAMIS dosya"
  else echo "        YAYILIM: git numstat $n  -> bu kartta YAZILAN dosya"; fi
}

ORIG=/tmp/f4hakem.orig; ODOSYA=""
restore() { [ -n "$ODOSYA" ] && [ -f "$ORIG" ] && cp "$ORIG" "$ODOSYA"; ODOSYA=""; }
trap 'restore' EXIT INT TERM

mutate() {  # ad dosya perl-ifadesi kapi...
  local ad="$1" dosya="$2" ifade="$3"; shift 3
  ODOSYA="$dosya"
  cp "$dosya" "$ORIG"
  etiket "$dosya"
  build; local h0 m0; h0=$(ikili); m0=$(olcum)
  perl -0pi -e "$ifade" "$dosya"
  if cmp -s "$ORIG" "$dosya"; then
    echo "  $ad  ⚠ PERL IFADESI HICBIR SEYI DEGISTIRMEDI — HUKUM YOK"
    restore; return
  fi
  build; local h1 m1; h1=$(ikili); m1=$(olcum)
  if [ "$h0" = "$h1" ]; then
    echo "  $ad  IKILI KIMILDAMADI ($h0) — kaynak DEGISTI, derlenen yol yok;"
    echo "        hukum YALNIZ kapinin cikisina dayaniyor"
  else
    echo "  $ad  ikili[$BINS] $h0 -> $h1"
  fi
  if [ "$m0" = "$m1" ]; then
    echo "        ⚠ OLCULEN SAYI KIMILDAMADI ($m0) — hukum yalniz kapinin cikisina dayaniyor"
  else
    echo "        olculen: $m0  ->  $m1"
  fi
  for k in "$@"; do echo "        kapi $k: $(run_gate $k)"; done
  restore; build
  echo "        geri alindi: ikili $(ikili) (taban $h0) · olculen $(olcum)"
  for k in "$@"; do echo "        geri kapi $k: $(run_gate $k)"; done
}

echo "=== F4 HAKEM MUTASYONLARI — $(date '+%Y-%m-%d %H:%M') ==="
build
echo "    temiz agac: ikili $(ikili)"
echo "    temiz agac olculen: $(olcum)"
echo ""

echo "--- HM-1: K23'un onarimi KOKTEN mi, yoksa iki olcumu ayni yerden mi okuyor ---"
echo "    Ajan flat tarafini SurfacePattern::topColZMM'e bagladi. Eger KALIP"
echo "    tarafi da ayni sayidan turuyorsa kapi TOTOLOJIDIR ve EXIT 0 bir sey"
echo "    kanitlamaz. KALIP tarafini (panel merkez-on dikis toplami) +20mm"
echo "    bozuyorum. Kapi YANMALI."
mutate HM-1 engine/tools/pattern-measure.mjs \
  's/mm: bodyLengthOK \? r4\(cfTorso\.mm \+ cfSkirt\.mm\) : null/mm: bodyLengthOK ? r4(cfTorso.mm + cfSkirt.mm + 20) : null/' \
  engine/tests/flat_pattern_agree_check.mjs

echo ""
echo "--- HM-2: H6 = 0 gercek bir olcum mu, yoksa kapinin kendi tanimi mi ---"
echo "    Ajan M4'u web/lib/flat-core.js'te kosturdu. Ben URETIM KALEMININ"
echo "    kendisini (render-garment-flat.mjs) bozuyorum: croquis omuz ucu"
echo "    yatayda kayiyor. H6 SIFIRDAN BUYUMELI."
mutate HM-2 engine/tools/render-garment-flat.mjs \
  's/shoulderTipX/shoulderTipX_MUT_BOZUK/' \
  engine/tests/flat_convention_check.mjs

echo ""
echo "--- HM-3: H5 rolleri SILINIRSE circir bunu gorur mu (borc 73'un yani) ---"
echo "    bodice.cpp'nin armhole_back rolu siliniyor. Cift ya yok olur ya"
echo "    yariya duser. Eger H5 '0/0' basip YESIL kalirsa, rolleri silmek"
echo "    dikilebilirligi YUKSELTIYOR demektir ve bu bir DELIKTIR."
mutate HM-3 engine/src/bodice.cpp \
  's/isFront \? "armhole_front" : "armhole_back"/isFront ? "armhole_front" : "MUT_SILINDI"/g' \
  engine/tests/hedef_kosu.mjs

echo ""
echo "--- HM-4: manken zinciri INSAN cizelgesindeki bir yalani gorur mu ---"
echo "    contract/tables.json EU38 beli bozuluyor. Manken cizelgesi ondan"
echo "    TURUYOR (fark 0.0), yani zincir kolu (a) muhtemelen YESIL kalir —"
echo "    o bir KOR NOKTADIR ve olculmesi gerekir. Bolum 2 (olcek beyani,"
echo "    kaynakli beden cizelgesi) YANMALI."
mutate HM-4 contract/tables.json \
  's/"euSizeChart"/"euSizeChart_MUT"/' \
  engine/tests/flat_convention_check.mjs

echo ""
echo "--- HM-5: bu kartta DOGAN iki kirmizi KOKTEN mi kapandi (K51 ayrimi) ---"
echo "    Ajan flat_tables_check'i 'kendi ureteciyle yeniden basarak' kapatti."
echo "    Kapinin KENDISI o urectir (CMakeLists:760, gen-flat-tables.mjs --check)."
echo "    Ureteci bozuyorum: checked-in .gen.js artik kaynagindan turemiyor."
echo "    Kapi YANMALI — yanmazsa 'yeniden bastim' cumlesi olculmemis bir iddiadir."
mutate HM-5 engine/tools/gen-flat-tables.mjs \
  's/out \+= `export const \$\{name\} = \$\{JSON\.stringify\(json, null, 2\)\};\\n\\n`;/out += `export const ${name} = ${JSON.stringify(json, null, 1)};\\n\\n`;/' \
  engine/tools/gen-flat-tables.mjs --check

echo ""
echo "=== BITTI — agac: ==="
git status --short
