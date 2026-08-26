#!/usr/bin/env bash
# F5-D MUTASYON KOŞUMU — GECE7, §3.8 md.3.
#
# F5-C'nin betiğinin halefi (kart onu "İYİ YAZILMIŞ, kopyala" dedi; kopyalandı ve
# İKİ yerde sıkıldı):
#
#  1. ⚠ BAYAT İKİLİ TUZAĞI, aynen: her turda ikili SİLİNİR, yeniden derlenir ve
#     `shasum` ile GERÇEKTEN kımıldadığı kanıtlanır. Kımıldamadıysa HÜKÜM
#     VERİLMEZ, "HUKUM YOK" yazılır. (Betik bu koşuda iki kez yalan söylemişti.)
#
#  2. ⭐ `ikili` ALANI KENDİ KENDİNİ AÇIKLAR. Aşağıdaki `ikili` sütunu şu BEŞ
#     ikilinin shasum'larının ilk 8 karakterinin BİRLEŞİMİDİR, bu sırayla:
#         seam-plan | rotate-op | suppress-op | split-op | plan-ops
#     Yani 40 karakterlik bir dize ve BEŞ ayrı sayının yan yana yazılmış hâli,
#     TEK BİR HASH DEĞİL. İki tur arasında yalnız son sekizli değişmişse yalnız
#     plan-ops kımıldamıştır.
#
#  3. ⭐ ZİNCİRLER KISA. Her `mutate` turu tek dosyaya dokunur, `trap` ile her
#     çıkışta geri alır, ve her turdan sonra `git status` ile sıfırlandığını
#     doğrular.
#
#  4. ⭐ ETİKET BİR ÖLÇÜMDÜR (borç 47'nin dersi): her turun başında
#     `git diff --numstat F5D-oncesi..HEAD -- <dosya>` BASILIR. BOŞ satır =
#     dosyaya bu kartta DOKUNULMADI. Üç mutasyon bilerek BOŞ dosyalara yayılır.
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
run_ctest() { ctest --test-dir "$B" -R "$1" >/dev/null 2>&1 && echo "EXIT 0 (YESIL)" || echo "EXIT $? (KIRMIZI)"; }
nodeid() { "$B/seam-plan" EU38 --kalip 2>/dev/null | sed -n 's/.*"dugum": "\(.*\)".*/\1/p'; }

etiket() {
  local d n; d="$1"
  n=$(git diff --numstat F5D-oncesi..HEAD -- "$d")
  if [ -z "$n" ]; then echo "        YAYILIM: git numstat F5D-oncesi..HEAD -- $d  BOS -> bu kartta DOKUNULMAMIS dosya"
  else echo "        YAYILIM: git numstat $n  -> bu kartta YAZILAN dosya"; fi
}

ORIG=/tmp/f5d.orig; ODOSYA=""
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

SUPFIX=/tmp/f5d-sup.json
genfix() { "$B/suppress-op" EU38 -o "$SUPFIX" >/dev/null 2>&1; }

SPL="engine/tests/split_check.mjs $B/split-op"
OPP="engine/tests/op_program_check.mjs $B/plan-ops"
ROT="engine/tests/rotate_check.mjs $B/rotate-op $SUPFIX"
TEK="engine/tests/tek_nesne_check.mjs $B/seam-plan $B/shell-audit"

echo "=== F5-D MUTASYONLARI — $(date '+%Y-%m-%d %H:%M') ==="
echo "    ikili sutunu = shasum ilk-8'lerin BIRLESIMI: seam-plan|rotate-op|suppress-op|split-op|plan-ops"
build
echo "    temiz agac: ikili $(ikili) · dugum $(nodeid)"
echo "    temiz agac kapilari: split_check $(run_gate $SPL) · op_program_check $(run_gate $OPP)"
echo

echo "--- IS 0a (BORC 56 / K43): HAKEMIN HM-1'I AYNEN TEKRARLANIYOR ---"
echo "HM-1r engine/src/surfacepattern.cpp — SUTUN PROFILINI AYNALA"
echo "    defCol[j] -> defCol[cols-j]. Profilin COKLUGU, TOPLAMI ve IPTALI"
echo "    degismez; yalniz SIRASI degisir. Hakemin olcumu: kesim sutunlari"
echo "    16->15 / 11->20 / 13->18 kaydi ve split_check EXIT 0, SIFIR FAIL kaldi."
echo "    F5-D SARTI: ayni mutasyon simdi KIRMIZI yanmali (SP9)."
mutate HM-1r engine/src/surfacepattern.cpp \
  's/        out\.deficitColumnDeg\.reserve\(defCol\.size\(\)\);\n        for \(double d : defCol\) out\.deficitColumnDeg\.push_back\(d \* 180\.0 \/ kPi\);/        out.deficitColumnDeg.reserve(defCol.size());\n        \/\/ MUTASYON HM-1r: profil AYNALANDI (coklugu, toplami, iptali AYNI)\n        for (std::size_t q = 0; q < defCol.size(); ++q)\n            out.deficitColumnDeg.push_back(defCol[defCol.size() - 1 - q] * 180.0 \/ kPi);/' \
  $SPL
echo

echo "--- IS 1 (BORC 45+49+51 / K46): URUN YOLUNUN KENDISI ---"
echo
echo "MP1 engine/src/planops.cpp — KESIGI DIKIS CIFTI OLARAK ILAN ETME"
echo "    Iki parca plana girer ama kesilen kenarin iki tarafi bir CIFT olarak"
echo "    ilan EDILMEZ. Kartin 1. sart mutasyonu ('baglantiyi kimliksizlestir')."
echo "    op_program_check'in OP2 (dikis sayisi kimligi) ve OP3 kollari YANMALI."
mutate MP1 engine/src/planops.cpp \
  's/        pat\.stitches\.push_back\(cut\);/        (void)cut;  \/\/ MUTASYON MP1: cift ILAN EDILMEDI/' \
  $OPP
echo
echo "MP2 engine/src/planops.cpp — OPERATORUN CIKTISINI PLANA YAZMA"
echo "    op.suppress ve op.rotate 'uygulandi' der ama sonuclari panele"
echo "    YAZILMAZ. Kartin 2. sart mutasyonu ('sahte ilan')."
echo "    OP1 kolu YANMALI: uygulandi ama PLANA YAZILMADI = hala bir rapor."
mutate MP2 engine/src/planops.cpp \
  's/                su\.writtenBack = true;/                su.writtenBack = false;  \/\/ MUTASYON MP2/' \
  $OPP
echo
echo "MP3 engine/src/panelsplit.cpp — KESIGIN IKI UCUNU AYIR"
echo "    B parcasi bir kose ILERIDEN baslar: iki kapanis segmenti artik AYNI"
echo "    iki koordinati birlestirmiyor. Iki uzunluk IKI AYRI kontur uzerinde"
echo "    olculdugu icin (kopyalanmadigi icin) fark GORUNUR."
echo "    split_check SP3/SP4 ve op_program_check OP3 YANMALI."
mutate MP3 engine/src/panelsplit.cpp \
  's/    r\.pieceB\.assign\(p\.contour\.begin\(\) \+ static_cast<long>\(hi\), p\.contour\.end\(\)\);/    r.pieceB.assign(p.contour.begin() + static_cast<long>(hi) + 1, p.contour.end());  \/\/ MUTASYON MP3/' \
  $SPL
echo

echo "--- YAYILIM (borc 47): UC AYRI, GERCEKTEN DOKUNULMAMIS DOSYA ---"
echo "    Her turun basinda git numstat basiliyor; BOS satir = dokunulmadi."
echo
echo "    fikstur uretiliyor (suppress-op ~376 sn, rotate_check onu okuyor)..."
genfix
echo "    fikstur: $SUPFIX  shasum $(hash_of "$SUPFIX")"
echo
echo "MU1 engine/tools/rotate-op.cpp — F5-D'nin YAZMADIGI dosya"
echo "    apeks kesri motordan okunmak yerine yerel bir sabitten alinir."
echo "    rotate_check'in R8 kolu YANMALI."
mutate MU1 engine/tools/rotate-op.cpp \
  's/        const double apexDepth = plan\.opt\.bodiceApexFrac \* colLen;/        const double kCopiedApexFrac = 0.80;  \/\/ MUTASYON\n        const double apexDepth = kCopiedApexFrac * colLen;/' \
  $ROT
echo
echo "MU2 engine/src/shellprojection.cpp — F5-D'nin YAZMADIGI dosya"
echo "    bust_circumference BELIN cevresini basar. tek_nesne_check YANMALI."
mutate MU2 engine/src/shellprojection.cpp \
  's/    out\.measures\.push_back\(\{"bust_circumference", bust\.name, girthAt\(surf, bust\.h\)\}\);/    out.measures.push_back({"bust_circumference", bust.name, girthAt(surf, waist.h)});/' \
  $TEK
echo
echo "MU3 engine/src/dartsuppress.cpp — F5-D'nin YAZMADIGI dosya"
echo "    op.suppress'in acisi bir sabite cevrilir (41.48). Bu kartin URUN"
echo "    YOLU kapisi onu gormek zorunda: plan-ops o aciyi motordan okuyor."
echo "    op_program_check'in OP5 kolu (yarimlarin kendi payini bastirmasi)"
echo "    YANMALI — sabit bir aci artik yarimlarin payi degildir."
mutate MU3 engine/src/dartsuppress.cpp \
  's/    r\.deficitDeg = panel\.developDeficitDeg;/    r.deficitDeg = 41.48;  \/\/ MUTASYON/' \
  $OPP
echo
echo "=== BITTI — $(date '+%Y-%m-%d %H:%M') ==="
git status --short engine/src engine/tools | sed 's/^/    /'
