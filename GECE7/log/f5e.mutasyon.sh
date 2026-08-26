#!/usr/bin/env bash
# F5-E MUTASYON KOŞUMU — GECE7, §3.8 md.3.
#
# `f5d.mutasyon.sh`'in halefi. Kart onu "İYİ YAZILMIŞ, kopyala" dedi; kopyalandı
# ve ÜÇ yerde değişti:
#
#  1. ⚠ BAYAT İKİLİ TUZAĞI aynen korunuyor: her turda ikili SİLİNİR, yeniden
#     derlenir ve `shasum` ile GERÇEKTEN kımıldadığı kanıtlanır. Kımıldamadıysa
#     HÜKÜM VERİLMEZ, "HUKUM YOK" yazılır (hakemin HM-J4'ü tam olarak böyle
#     düştü ve doğru davranış oydu).
#
#  2. ⭐ `ikili` sütunu = şu BEŞ ikilinin shasum ilk-8'lerinin BİRLEŞİMİ, bu
#     sırayla: seam-plan | rotate-op | suppress-op | split-op | plan-ops.
#     40 karakterlik bir dize, TEK BİR HASH DEĞİL.
#
#  3. ⭐ ETİKET BİR ÖLÇÜMDÜR (borç 47): her turun başında
#     `git diff --numstat F5E-oncesi..HEAD -- <dosya>` BASILIR. BOŞ satır =
#     dosyaya bu kartta DOKUNULMADI.
#
#  4. ⭐ BİRİNCİ TUR ZORUNLUDUR VE HAKEMİN KENDİ MUTASYONUDUR (K49 / borç 66):
#     HM-J2r. Hakem `theta * 0.90` ile `rotate_check`'i KIRMIZI, ama
#     `op_program_check`'i YEŞİL bulmuştu. Bu kartın İŞ 0'ı o deliği kapattı;
#     bu tur onun kanıtıdır ve ikisi de kırmızı yanmalıdır.
set -uo pipefail
cd "$(dirname "$0")/../.."
B=engine/build

BINS="seam-plan rotate-op suppress-op split-op plan-ops shell-audit"
hash_of() { shasum "$1" 2>/dev/null | cut -c1-8; }
ikili() { local o=""; for b in seam-plan rotate-op suppress-op split-op plan-ops; do o="$o$(hash_of "$B/$b")"; done; echo "$o"; }

build() {
  for b in $BINS; do rm -f "$B/$b"; done
  cmake --build "$B" -j8 --target $BINS >/dev/null 2>&1
}

run_gate() { node "$@" >/dev/null 2>&1 && echo "EXIT 0 (YESIL)" || echo "EXIT $? (KIRMIZI)"; }
nodeid() { "$B/seam-plan" EU38 --kalip 2>/dev/null | sed -n 's/.*"dugum": "\(.*\)".*/\1/p'; }

etiket() {
  local d n; d="$1"
  n=$(git diff --numstat F5E-oncesi..HEAD -- "$d")
  if [ -z "$n" ]; then echo "        YAYILIM: git numstat F5E-oncesi..HEAD -- $d  BOS -> bu kartta DOKUNULMAMIS dosya"
  else echo "        YAYILIM: git numstat $n  -> bu kartta YAZILAN dosya"; fi
}

ORIG=/tmp/f5e.orig; ODOSYA=""
restore() { [ -n "$ODOSYA" ] && [ -f "$ORIG" ] && cp "$ORIG" "$ODOSYA"; ODOSYA=""; }
trap 'restore' EXIT INT TERM

mutate() {  # ad dosya perl-ifadesi kapi...
  local ad="$1" dosya="$2" ifade="$3"; shift 3
  ODOSYA="$dosya"
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
    echo "  $ad  ikili[seam-plan|rotate-op|suppress-op|split-op|plan-ops] $h0 -> $h1"
    echo "        dugum $n0 -> $n1"
    echo "        kapi: $(run_gate "$@")"
  fi
  restore; build
  echo "        geri alindi: ikili $(ikili) (taban $h0) · kapi: $(run_gate "$@")"
  git status --short "$dosya"
}

SUPFIX=/tmp/f5e-sup.json
SPL="engine/tests/split_check.mjs $B/split-op"
OPP="engine/tests/op_program_check.mjs $B/plan-ops"
ROT="engine/tests/rotate_check.mjs $B/rotate-op $SUPFIX"

echo "=== F5-E MUTASYONLARI — $(date '+%Y-%m-%d %H:%M') ==="
echo "    ikili sutunu = shasum ilk-8'lerin BIRLESIMI: seam-plan|rotate-op|suppress-op|split-op|plan-ops"
build
echo "    temiz agac: ikili $(ikili) · dugum $(nodeid)"
echo "    temiz agac kapilari: op_program_check $(run_gate $OPP) · split_check $(run_gate $SPL)"
echo

echo "--- IS 0 (BORC 66 / K49): HAKEMIN HM-J2'SI AYNEN TEKRARLANIYOR ---"
echo "HM-J2r engine/src/dartrotate.cpp — TRANSFER ACISI x0.90"
echo "    Hakemin olcumu: rotate_check EXIT 1 (ALAN 32473.1791 -> 36134.0402 mm²,"
echo "    fark 3660.861111584; ACI 55.173533 -> 49.656180 derece) ama"
echo "    op_program_check EXIT 0 — urun yolundaki bir transfer 3660 mm² kumas"
echo "    uretti ve urun kapisinin sekiz kolunun sekizi de gecti."
echo "    F5-E SARTI: ayni mutasyon simdi op_program_check'i KIRMIZI yakmali (OP8)."
mutate HM-J2r engine/src/dartrotate.cpp \
  's/    const double theta = signedAngle\(apex, contour\[iB\], contour\[iA\]\);/    const double theta = signedAngle(apex, contour[iB], contour[iA]) * 0.90;  \/\/ MUTASYON HM-J2r/' \
  $OPP
echo

echo "--- YAYILIM (borc 47): UC AYRI, GERCEKTEN DOKUNULMAMIS DOSYA ---"
echo "    Her turun basinda git numstat basiliyor; BOS satir = dokunulmadi."
echo
echo "MU1 engine/src/dartsuppress.cpp — SHOELACE'IN KAPANIS TERIMINI DUSUR"
echo "    contourAreaMM2 son kenari (n-1 -> 0) saymaz. Adimin ILAN ETTIGI alan"
echo "    yanlis olur; kapinin KENDI yurudugu kontur dogru kalir."
echo "    OP8/R8 (beyan == olcum) YANMALI — bu tam olarak 'rapor geometriden"
echo "    bagimsiz yaziliyor' sinifidir."
mutate MU1 engine/src/dartsuppress.cpp \
  's/    for \(std::size_t i = 0; i < c\.size\(\); \+\+i\) \{\n        const Vec2& p = c\[i\];\n        const Vec2& q = c\[\(i \+ 1\) % c\.size\(\)\];/    for (std::size_t i = 0; i + 1 < c.size(); ++i) {  \/\/ MUTASYON MU1\n        const Vec2\& p = c[i];\n        const Vec2\& q = c[(i + 1) % c.size()];/' \
  $OPP
echo
echo "MU2 engine/src/panelsplit.cpp — KESIGIN IKI UCUNU AYIR"
echo "    B parcasi bir kose ILERIDEN baslar: iki kapanis segmenti artik AYNI"
echo "    iki koordinati birlestirmiyor. op_program_check'in OP3 kolu YANMALI."
mutate MU2 engine/src/panelsplit.cpp \
  's/    r\.pieceB\.assign\(p\.contour\.begin\(\) \+ static_cast<long>\(hi\), p\.contour\.end\(\)\);/    r.pieceB.assign(p.contour.begin() + static_cast<long>(hi) + 1, p.contour.end());  \/\/ MUTASYON MU2/' \
  $OPP
echo
echo "MU3 engine/src/surfacepattern.cpp — SUTUN PROFILINI AYNALA (hakemin HM-1'i)"
echo "    Profilin COKLUGU, TOPLAMI ve IPTALI degismez; yalniz SIRASI degisir."
echo "    split_check'in SP9 kolu YANMALI (borc 56 / K43 gercekten kapali mi)."
mutate MU3 engine/src/surfacepattern.cpp \
  's/        out\.deficitColumnDeg\.reserve\(defCol\.size\(\)\);\n        for \(double d : defCol\) out\.deficitColumnDeg\.push_back\(d \* 180\.0 \/ kPi\);/        out.deficitColumnDeg.reserve(defCol.size());\n        \/\/ MUTASYON MU3: profil AYNALANDI\n        for (std::size_t q = 0; q < defCol.size(); ++q)\n            out.deficitColumnDeg.push_back(defCol[defCol.size() - 1 - q] * 180.0 \/ kPi);/' \
  $SPL
echo

echo "--- BU KARTIN KENDI YAZDIGI DOSYA ---"
echo "MP1 engine/src/planops.cpp — KONTURU ADIMLA BIRLIKTE GONDERME"
echo "    Adim UYGULANDI der, dort sayisini basar, ama plana yazdigi konturu"
echo "    TASIMAZ: kapi yeniden olcemez. OP8 YANMALI (kanitsiz bir beyan)."
mutate MP1 engine/src/planops.cpp \
  's/            ro\.contourAfter = rot\.contour;/            ro.contourAfter.clear();  \/\/ MUTASYON MP1/' \
  $OPP
echo
echo "=== BITTI — $(date '+%Y-%m-%d %H:%M') ==="
git status --short engine/src engine/tests
