#!/usr/bin/env bash
# 0509-kapi.sh — 0509 kosusunun TEK gecit scripti (A1a, 2026-09-06).
#
# NEDEN VAR. Kosu her adimda "gecti mi" sorusunu ayni sekilde sormak zorunda.
# Bugun bu soru dagilmis durumda: ctest, sinyal.sh, enum_dallanma_check, elle
# bakilan png'ler. Bu script hepsini TEK deterministik ciktida toplar: stdout'a
# YALNIZ JSON basar, exit 0 (hepsi yesil) / 1 (kirmizi var) / 3 (kapi bozuk).
#
# KATI KURALLAR (brief madde 1):
#  - Her alt surec (ctest, node, python3, bash) stdout+stderr'i LOG'a yonlendirir.
#    Tek bir warning satiri sizarsa JSON bozulur; bu yuzden hicbir alt surec
#    dogrudan stdout'a yazamaz.
#  - BOS DEGISKEN YASAGI: her sayi "${DEGER:-null}" ile yazilir.
#  - Alt surec cokerse (segfault / exit >= 126 / cikti bozuk) o gecit
#    durum="CRASH", sayi=null, log="KOSU/0509-kapi.log:<satir>" olur.
#  - Script ASLA yarim JSON basmaz: JSON once gecici dosyada kurulur,
#    python3 -m json.tool ile dogrulanir, gecmezse {"hata":"KAPI_BOZUK_JSON"}
#    basar ve exit 3.
#  - set -u var, set -e YOK (kizaran gecit scripti oldurmemeli).
#
# DURUMLAR:
#   YESIL     gecit kosuldu, gecti
#   KIRMIZI   gecit kosuldu, kalmadi
#   HENUZ-YOK olculemiyor (girdi/CLI/cikti yok) — kirmizi SAYILMAZ.
#             ilk yesil oldugu adimdan sonra kirmizi sayilir: state.json ilkYesil
#             alaninda o adim yazilidir; bu script ilkYesil'i OKUR ve bir gecit
#             ilkYesil'de kayitliysa HENUZ-YOK'u KIRMIZI'ya cevirir.
#   CRASH     alt surec coktu / cikti bozuk — kirmizi sayilir, arac onarimi (8.3)
#
# KULLANIM
#   bash engine/tests/0509-kapi.sh                 tam gecit tablosu (JSON, exit 0/1/3)
#   bash engine/tests/0509-kapi.sh --kisa          ucuz tek satir metrik JSON (<60 s, ctest yok)
#   bash engine/tests/0509-kapi.sh --ivme          son 3 metrik satirindan yerel minimum hukmu
#   bash engine/tests/0509-kapi.sh --kilit "<glob listesi>"   referans kilidi kur, izin listesi yazilir
#   bash engine/tests/0509-kapi.sh --kilit-ac      kilidi ac (kosu durunca/bitince)
#   bash engine/tests/0509-kapi.sh --kilit-diff <tag>  izin disi dokunulan kilitli dosyalari bas
#   bash engine/tests/0509-kapi.sh --regresyon [--taban]   (A1b kurar; yoksa "kosmadi" der)
#   bash engine/tests/0509-kapi.sh --kendi-check   A1a KABUL KOMUTU: kapinin kendi cikti
#                                                  sozlesmesi + A1a'nin uc karari, exit 0/1
#
# ESIK KAYNAGI: her gecidin esigi ve kaynagi JSON'da "esik" + "kaynak" alanlarinda.
# Koda gomulu esik yoktur; sayilar contract/ ve engine/tests/*-baseline.json'dan gelir.

set -u
cd "$(git rev-parse --show-toplevel 2>/dev/null)" || { echo '{"hata":"KAPI_BOZUK_JSON","neden":"git kok bulunamadi"}'; exit 3; }

LOG=KOSU/0509-kapi.log
STATE=KOSU/0509-state.json
METRIK=KOSU/0509-metrik.jsonl
BUILD=engine/build
EMSAL=engine/tests/0509-emsal-olcum.mjs        # A1b yazar
WASM_SANITY=engine/tests/0509-wasm-sanity.mjs  # A1b yazar
REGRESYON_DIZIN=KOSU/regresyon                 # A1b kurar
TMPD=$(mktemp -d) || { echo '{"hata":"KAPI_BOZUK_JSON","neden":"mktemp"}'; exit 3; }
temizle() { rm -rf "$TMPD"; }
trap temizle EXIT

mkdir -p "$(dirname "$LOG")"
: >> "$LOG"
log_satir() { wc -l < "$LOG" | tr -d ' '; }
logla() { printf '\n===== %s  %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >> "$LOG" 2>&1; }

# ---------------------------------------------------------------- kilitli alan
# DIZINLER yazilabilir kalir (yeni 0509-* dosya acilabilsin); yalniz DOSYALAR a-w.
kilitli_yollar() {
  # var olanlari bas; olmayan (grafdogrula.* / solver_utils.* A2a'nin isi) sessiz gecilir
  for p in contract engine/tests engine/golden-reference.csv \
           engine/src/grafdogrula.hpp engine/src/grafdogrula.cpp \
           engine/src/solver_utils.hpp engine/src/solver_utils.cpp; do
    [ -e "$p" ] && echo "$p"
  done
}

# --kilit-diff'in TARADIGI alan (karar 3, 6 Eyl): kilitli alan + engine/CMakeLists.txt.
# CMakeLists chmod ile KILITLENMEZ (yazilabilir kalir, test eklemek serbest) ama
# diff'te gorulunce izin listesine karsi denetlenir ve satir yonu okunur.
izlenen_yollar() {
  kilitli_yollar
  [ -e engine/CMakeLists.txt ] && echo engine/CMakeLists.txt
  return 0
}

# SATIR YONU DENETIMI (karar 3): stdin'den bir diff okur; silinen ('-') bir
# add_test( / add_executable( satiri varsa KILIT_IHLALI basar. Ekleme ('+')
# temiz sayilir. Gerekce: kirmiziya duen bir gecidin add_test satirini silmek
# gecidi sessizce yesil yapar; ekleme zararsiz, silme kanit yok ediyor.
# HEDEF DEGISIMI (karar defteri 6 Eyl, A1b teslimi): satiri SILMEK ile bir
# add_test'in HEDEFINI degistirmek ayni sonucu verir — add_test'i /bin/true'ya
# yoneltmek gecidi sessizce yesil yapar ve eski kural bunu TEMIZ sayardi
# (3.7 reward hacking: test degistirme). Bu yuzden ayni test adinin COMMAND'i
# degisiyorsa da KILIT_IHLALI basilir. YASAK degil, ILANA tabi: degisiklik
# state.json.kararDefteri'ne (eski hedef -> yeni hedef -> sebep) yazilmadan
# gecit yesil sayilmaz. 97559b95 geriye donuk ilan edildi (kapi_sozlesme_check).
cmake_satir_yonu() {
  local satir ad
  local silinen_adlar="" eklenen_adlar=""
  while IFS= read -r satir; do
    case "$satir" in
      ---*|+++*) continue;;
      -*add_test\(*|-*add_executable\(*)
        echo "KILIT_IHLALI engine/CMakeLists.txt silinen satir: ${satir#-}"
        ad=$(printf '%s' "$satir" | sed -n 's/.*add_test(NAME[[:space:]]*\([A-Za-z0-9_.-]*\).*/\1/p')
        [ -n "$ad" ] && silinen_adlar="$silinen_adlar $ad";;
      +*add_test\(*)
        ad=$(printf '%s' "$satir" | sed -n 's/.*add_test(NAME[[:space:]]*\([A-Za-z0-9_.-]*\).*/\1/p')
        [ -n "$ad" ] && eklenen_adlar="$eklenen_adlar $ad";;
    esac
  done
  # ayni ad hem silinmis hem eklenmis => satir SILINMEDI, HEDEFI degisti
  local a b
  for a in $silinen_adlar; do
    for b in $eklenen_adlar; do
      [ "$a" = "$b" ] && echo "KILIT_IHLALI engine/CMakeLists.txt add_test hedefi degisti: $a (ilan sarti: state.json kararDefteri'ne eski hedef -> yeni hedef -> sebep)"
    done
  done
  return 0
}

kilit_kur() { # $1 = bosluklu izin listesi (glob)
  local izin="${1:-}" n=0 m=0
  while IFS= read -r p; do
    [ -n "$p" ] || continue
    if [ -d "$p" ]; then
      while IFS= read -r f; do chmod a-w "$f" 2>>"$LOG" && n=$((n+1)); done < <(find "$p" -type f)
    else
      chmod a-w "$p" 2>>"$LOG" && n=$((n+1))
    fi
  done < <(kilitli_yollar)
  # izin listesi: glob genisletilir, yalniz kilitli alanin ICINDEKILER acilir
  local g
  for g in $izin; do
    for f in $g; do
      [ -f "$f" ] || continue
      chmod u+w "$f" 2>>"$LOG" && m=$((m+1))
    done
  done
  echo "kilit: $n dosya salt-okunur, izin listesinden $m dosya yazilabilir"
  echo "izin: ${izin:-<bos>}"
}

kilit_ac() {
  local n=0
  while IFS= read -r p; do
    [ -n "$p" ] || continue
    if [ -d "$p" ]; then
      while IFS= read -r f; do chmod u+w "$f" 2>>"$LOG" && n=$((n+1)); done < <(find "$p" -type f)
    else
      chmod u+w "$p" 2>>"$LOG" && n=$((n+1))
    fi
  done < <(kilitli_yollar)
  echo "kilit acildi: $n dosya yazilabilir"
}

kilit_diff() { # $1 = tag; izin listesi $2 (opsiyonel)
  local tag="${1:-}" izin="${2:-}"
  [ -n "$tag" ] || { echo "kullanim: --kilit-diff <tag> [\"izin listesi\"]"; return 2; }
  local alanlar=() p
  while IFS= read -r p; do alanlar+=("$p"); done < <(izlenen_yollar)
  # karar 3: CMakeLists satir yonu — silinen add_test(/add_executable( = KILIT_IHLALI,
  # dosya izin listesinde olsa BILE (izin listesi bunu affetmez).
  if [ -e engine/CMakeLists.txt ]; then
    git diff "$tag"..HEAD -- engine/CMakeLists.txt 2>>"$LOG" | cmake_satir_yonu
  fi
  [ ${#alanlar[@]} -gt 0 ] || { echo ""; return 0; }
  local dokunulan
  dokunulan=$(git diff --name-only "$tag"..HEAD -- "${alanlar[@]}" 2>>"$LOG")
  [ -n "$dokunulan" ] || { echo ""; return 0; }
  # izin listesindeki globlarla eslesenler dusulur
  local f g izinli
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    izinli=0
    for g in $izin; do
      case "$f" in $g) izinli=1; break;; esac
    done
    [ "$izinli" -eq 0 ] && echo "$f"
  done <<< "$dokunulan"
  return 0
}

# ---------------------------------------------------------------- gecit toplayici
# Her gecit bir satir: ad<TAB>durum<TAB>sayi<TAB>esik<TAB>kaynak<TAB>not<TAB>logSatir
GECIT="$TMPD/gecitler.tsv"
: > "$GECIT"
gecit_yaz() { # ad durum sayi esik kaynak not logSatir [ekAlan: "anahtar=deger" tek adet]
  # 8. alan opsiyonel: gecit JSON'una ek bir ADLI alan basar (KARAR 5, nativeKiyas).
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "${3:-null}" "${4:-null}" "${5:-}" "${6:-}" "${7:-null}" "${8:-}" >> "$GECIT"
}

# ctest_gecit <ad> <esik-metni> <kaynak>
# ctest cikisi: 0 = yesil, 8 = "no tests found" (=> HENUZ-YOK), digeri kirmizi.
# 126+ / >=128 sinyal => CRASH.
ctest_gecit() {
  local ad="$1" esik="${2:-0 kirmizi hukum}" kaynak="${3:-engine/CMakeLists.txt add_test(NAME $1)}"
  local bas rc out
  bas=$(log_satir)
  logla "ctest $ad"
  if [ ! -d "$BUILD" ]; then
    gecit_yaz "$ad" "HENUZ-YOK" null null "$kaynak" "engine/build yok (cmake kurulmadi)" "$bas"
    return
  fi
  out=$(cd "$BUILD" && ctest -R "^${ad}\$" -j1 --output-on-failure 2>&1); rc=$?
  printf '%s\n' "$out" >> "$LOG" 2>&1
  # ctest ictek test cokerse "Subprocess aborted"/"SEGFAULT"/"Exception" basar
  if printf '%s' "$out" | grep -qE 'SEGFAULT|Subprocess aborted|Exception: (SegFault|Other)'; then
    gecit_yaz "$ad" "CRASH" null null "$kaynak" "alt surec coktu (ctest SEGFAULT/abort)" "$bas"
    return
  fi
  if printf '%s' "$out" | grep -q 'No tests were found'; then
    gecit_yaz "$ad" "HENUZ-YOK" null null "$kaynak" "ctest'te boyle bir test yok" "$bas"
    return
  fi
  local fail
  fail=$(printf '%s' "$out" | grep -oE '[0-9]+ tests failed out of' | grep -oE '^[0-9]+' | head -1)
  fail="${fail:-}"
  if [ "$rc" -eq 0 ]; then
    gecit_yaz "$ad" "YESIL" "${fail:-0}" 0 "$kaynak" "$esik" "$bas"
  elif [ "$rc" -ge 126 ]; then
    gecit_yaz "$ad" "CRASH" null 0 "$kaynak" "ctest exit $rc" "$bas"
  else
    gecit_yaz "$ad" "KIRMIZI" "${fail:-null}" 0 "$kaynak" "$esik" "$bas"
  fi
}

# ---------------------------------------------------------------- enum circiri
enum_olc() { # cpp.dallanma sayisini basar (bos ise bos)
  bash engine/tests/enum_dallanma_check.sh --measure 2>>"$LOG" \
    | grep -E '^cpp\.dallanma' | grep -oE '[0-9]+$' | head -1
}

enum_gecit() {
  local bas taban simdi rc
  bas=$(log_satir)
  logla "enum_dallanma_check --measure"
  if [ ! -f engine/tests/enum_dallanma_check.sh ]; then
    gecit_yaz "enum_dallanma_check" "HENUZ-YOK" null null "engine/tests/enum-dallanma-baseline.json" "script yok" "$bas"
    return
  fi
  simdi=$(enum_olc); rc=$?
  taban=$(python3 -c "import json;print(json.load(open('engine/tests/enum-dallanma-baseline.json'))['toplam'])" 2>>"$LOG")
  if [ -z "${simdi:-}" ]; then
    gecit_yaz "enum_dallanma_check" "CRASH" null "${taban:-null}" "engine/tests/enum-dallanma-baseline.json:toplam" "--measure sayi basmadi (exit $rc)" "$bas"
    return
  fi
  if [ -z "${taban:-}" ]; then
    gecit_yaz "enum_dallanma_check" "CRASH" "$simdi" null "engine/tests/enum-dallanma-baseline.json:toplam" "taban okunamadi" "$bas"
    return
  fi
  if [ "$simdi" -gt "$taban" ]; then
    gecit_yaz "enum_dallanma_check" "KIRMIZI" "$simdi" "$taban" "engine/tests/enum-dallanma-baseline.json:toplam" "cpp.dallanma ARTTI (+$((simdi-taban))); circir yalniz duser" "$bas"
  else
    gecit_yaz "enum_dallanma_check" "YESIL" "$simdi" "$taban" "engine/tests/enum-dallanma-baseline.json:toplam" "cpp.dallanma <= taban" "$bas"
  fi
}

# ---------------------------------------------------------------- sinyal.sh tam
sinyal_gecit() {
  local bas rc kirmizi
  bas=$(log_satir)
  logla "KOSU/sinyal.sh tam"
  if [ ! -f KOSU/sinyal.sh ]; then
    gecit_yaz "sinyal_tam" "HENUZ-YOK" null null "KOSU/sinyal.sh" "sinyal.sh yok" "$bas"
    return
  fi
  local out
  out=$(bash KOSU/sinyal.sh tam 2>&1); rc=$?
  printf '%s\n' "$out" >> "$LOG" 2>&1
  # SAYIM: sinyal.sh'in KENDI kirmizi isaretcisi "  KIRMIZI <ad>" (iki bosluk + KIRMIZI, sinyal.sh:203 bicimi).
  # Duz 'grep -c KIRMIZI' YANLIS sayar: sinyal.sh bolum 6'da KOSU/0509-ilerleme.md satirlarini aynen basiyor,
  # icinde "KIRMIZI" gecen bir ilerleme satiri sayiyi sahte yukseltiyor (6 Eyl'de 2 -> 3 oldu, yeni kirmizi yoktu).
  kirmizi=$(printf '%s\n' "$out" | grep -cE '^  KIRMIZI ')
  kirmizi="${kirmizi:-null}"
  # ilanli kumeye ait olmayan yeni bir kirmizi adi var mi (karar 6 Eyl: kume dondu)
  # Ad kumesi: "  KIRMIZI ctest" isaretcisi altinda sinyal.sh dusen ALT TEST adlarini basiyor
  # ("    	  8 - bundle_fresh_check (Failed)"). Karar 6 Eyl 2(a) alt test KUMESINI donduruyor,
  # o yuzden ad olarak "ctest" degil dusen alt testler yazilir; yakalanamayan isaretci adiyla kalir.
  KIRMIZI_ADLARI=$(printf '%s\n' "$out" \
    | sed -n -e 's/^[[:space:]]*[0-9][0-9]* - \([A-Za-z0-9_.-]*\) (Failed).*$/\1/p' \
             -e 's/^  KIRMIZI \(.*\)$/\1/p' \
    | grep -v '^ctest$' | sort -u | tr '\n' ',')
  [ -n "$KIRMIZI_ADLARI" ] || KIRMIZI_ADLARI=$(printf '%s\n' "$out" | sed -n 's/^  KIRMIZI \(.*\)$/\1/p' | tr '\n' ',')
  if [ "$rc" -ge 126 ]; then
    gecit_yaz "sinyal_tam" "CRASH" null 0 "KOSU/sinyal.sh (muhurlu; DEVIR KABUL zinciri)" "exit $rc" "$bas"
  elif [ "$rc" -eq 0 ]; then
    gecit_yaz "sinyal_tam" "YESIL" "$kirmizi" 0 "KOSU/sinyal.sh (muhurlu; DEVIR KABUL zinciri)" "0 KIRMIZI satiri" "$bas"
  else
    gecit_yaz "sinyal_tam" "KIRMIZI" "$kirmizi" 0 "KOSU/sinyal.sh (muhurlu; DEVIR KABUL zinciri)" "kirmizi adlari: ${KIRMIZI_ADLARI%,} (exit $rc)" "$bas"
  fi
}

# ---------------------------------------------------------------- emsal mm olcumu (A1b)
emsal_olc() { # ana sapma mm basar; yoksa bos
  [ -f "$EMSAL" ] || return 1
  node "$EMSAL" --json 2>>"$LOG" \
    | python3 -c "import json,sys
try:
  d=json.load(sys.stdin)
  v=d.get('anaSapmaMM')
  print('' if v is None else v)
except Exception: print('')" 2>>"$LOG"
}

emsal_gecit() {
  local bas sapma esik
  bas=$(log_satir)
  logla "emsal olcum"
  if [ ! -f "$EMSAL" ]; then
    gecit_yaz "emsal_mm_olcum" "HENUZ-YOK" null null "contract/flat-convention-v1.json + KOSU/ciktilar/flat-olcum.json" "$EMSAL yok (A1b yazar)" "$bas"
    return
  fi
  sapma=$(emsal_olc)
  # ESIK: ACIK YOL ile okunur, alt dize taramasiyla DEGIL.
  # A1 gecit hakemi (6 Eyl) kusuru: eski okuyucu contract icinde adinda
  # 'tolerans' gecen ILK sayisal anahtari aliyordu; o anahtar
  # /sevkPoz/yakaParcasi/boyToleransOran = 0.05, yani BIRIMSIZ BIR ORAN.
  # Gercek mm toleransi /croquis/toleranceMM = 2.0 ('toleranceMM' ingilizce
  # yazildigi icin taramaya hic girmiyordu). Bir MILIMETRE sapmasi birimsiz bir
  # orana vuruluyordu: esik gevsemiyor, 40 kat SIKILASIYORDU — yani gecit
  # olmayan bir geometri kusuru icin YANLIS KIRMIZI yaniyordu.
  # Olculdu (6 Eyl, A1b): anaSapmaMM 0.693 mm, eski okuyucuyla esik 0.05 ->
  # KIRMIZI; acik yolla esik 2.0 -> YESIL. Esik GEVSETILMEDI, contract'ta
  # yazili olan mm toleransi dogru anahtardan okundu.
  esik=$(python3 -c "
import json,sys
c=json.load(open('contract/flat-convention-v1.json'))
v=c.get('croquis',{}).get('toleranceMM')
print('' if not isinstance(v,(int,float)) or isinstance(v,bool) else v)" 2>>"$LOG")
  if [ -z "${sapma:-}" ]; then
    gecit_yaz "emsal_mm_olcum" "CRASH" null "${esik:-null}" "contract/flat-convention-v1.json" "olcum JSON'unda anaSapmaMM yok" "$bas"
    return
  fi
  local hukum
  hukum=$(python3 -c "
s=float('${sapma}'); e='${esik:-}'
print('YESIL' if (e!='' and s<=float(e)) else ('KIRMIZI' if e!='' else 'HENUZ-YOK'))" 2>>"$LOG")
  gecit_yaz "emsal_mm_olcum" "${hukum:-CRASH}" "$sapma" "${esik:-null}" "contract/flat-convention-v1.json /croquis/toleranceMM" "emsale ana sapma (medyan, mm); olcum engine/tests/0509-emsal-olcum.mjs" "$bas"
}

# ---------------------------------------------------------------- olcek gecidi (A1b)
olcek_gecit() {
  local bas
  bas=$(log_satir)
  local aralik
  aralik=$(python3 -c "
import json
b=json.load(open('contract/body-v1.json'))
o=b.get('olcekAraligi') or b.get('olcek_araligi')
print('' if o is None else json.dumps(o,ensure_ascii=False))" 2>>"$LOG")
  if [ -z "${aralik:-}" ]; then
    gecit_yaz "olcek_check" "HENUZ-YOK" null null "contract/body-v1.json olcekAraligi" "olcek araligi contract'ta yok (A1b kaynakli ekler)" "$bas"
    return
  fi
  # A2c/Q1: cizim VAR (engine/build/grafciz) -> gercek olcum. Olculemezse HENUZ-YOK degil CRASH.
  local graf="KOSU/ciktilar/graf-ilk/graf.json"
  if [ ! -x "$BUILD/grafciz" ]; then
    gecit_yaz "olcek_check" "CRASH" null null "contract/body-v1.json olcekAraligi" "$BUILD/grafciz yok ya da calistirilabilir degil" "$bas"
    return
  fi
  if [ ! -f "$graf" ]; then
    gecit_yaz "olcek_check" "CRASH" null null "contract/body-v1.json olcekAraligi" "graf girdisi yok: $graf" "$bas"
    return
  fi
  local err rc mm lo hi hukum
  err=$("$BUILD/grafciz" "$graf" gercek36 kalip 2>&1 >/dev/null); rc=$?
  printf '%s\n' "$err" >> "$LOG" 2>&1
  # olculen mm: grafciz stderr'i "... giysi yuksekligi <N> mm ..." basar (kalipsvg.cpp olcekDogrula)
  mm=$(printf '%s' "$err" | sed -n 's/.*giysi yuksekligi \([0-9.][0-9.]*\) mm.*/\1/p' | head -1)
  lo=$(printf '%s' "$aralik" | python3 -c "import json,sys; print(json.load(sys.stdin)['giysiYuksekligiMM']['min'])" 2>>"$LOG")
  hi=$(printf '%s' "$aralik" | python3 -c "import json,sys; print(json.load(sys.stdin)['giysiYuksekligiMM']['max'])" 2>>"$LOG")
  if [ -z "${mm:-}" ] || [ -z "${lo:-}" ] || [ -z "${hi:-}" ]; then
    gecit_yaz "olcek_check" "CRASH" "${mm:-null}" null "contract/body-v1.json olcekAraligi" "olculen mm ya da contract araligi okunamadi (grafciz rc=$rc)" "$bas"
    return
  fi
  # hukum: grafciz cikis kodu 0 VE olculen mm contract araliginda
  hukum=$(KAPI_MM="$mm" KAPI_LO="$lo" KAPI_HI="$hi" KAPI_RC="$rc" python3 -c "
import os
mm=float(os.environ['KAPI_MM']); lo=float(os.environ['KAPI_LO']); hi=float(os.environ['KAPI_HI'])
print('YESIL' if (os.environ['KAPI_RC']=='0' and lo<=mm<=hi) else 'KIRMIZI')" 2>>"$LOG")
  gecit_yaz "olcek_check" "${hukum:-CRASH}" "$mm" "$hi" "contract/body-v1.json olcekAraligi.giysiYuksekligiMM" "grafciz gercek36 kalip: rc=$rc, olculen $mm mm, aralik [$lo, $hi]" "$bas"
}

# ---------------------------------------------------------------- wasm sanity (A1b)
wasm_gecit() {
  local bas rc out
  bas=$(log_satir)
  if [ ! -f "$WASM_SANITY" ]; then
    gecit_yaz "wasm_sanity" "HENUZ-YOK" null null "engine/build-wasm.sh + $WASM_SANITY" "$WASM_SANITY yok (A1b yazar)" "$bas"
    return
  fi
  logla "wasm sanity"
  out=$(node "$WASM_SANITY" 2>&1); rc=$?
  printf '%s\n' "$out" >> "$LOG" 2>&1
  # KARAR 5: gecit ne olcmedigini de tasir. nativeKiyas degeri UYDURULMAZ,
  # wasm sanity raporunun kendi nativeKiyasi alanindan okunur; alan yoksa
  # gecit bunu "rapor soylemedi" diye adiyla basar.
  local nk
  nk=$(printf '%s' "$out" | python3 -c "
import sys,json
try:
    d=json.loads(sys.stdin.read())
    v=d.get('nativeKiyasi')
except Exception:
    v=None
print('nativeKiyas=' + (v.replace(chr(9),' ').replace(chr(10),' ') if isinstance(v,str) and v.strip() else 'rapor bu alani basmadi'))" 2>>"$LOG")
  nk="${nk:-nativeKiyas=rapor okunamadi}"
  if [ "$rc" -eq 0 ]; then
    # KARAR 5 (2026-09-06): hukum YALNIZ "bellek sinirli wasm == commit li taban"
    # iddiasini tasir; "native == wasm" iddiasini TASIMAZ. nativeKiyas alt alani
    # gecit JSON'una bu yuzden ADIYLA basilir (asagida nativeKiyas cikarimi).
    gecit_yaz "wasm_sanity" "YESIL" 0 0 "$WASM_SANITY" "0 trap / 0 fark: bellek sinirli wasm ciktisi == commit li taban (native kiyasi YAPILMADI)" "$bas" "$nk"
  elif [ "$rc" -eq 8 ]; then
    gecit_yaz "wasm_sanity" "HENUZ-YOK" null null "$WASM_SANITY" "graf wasm binding'i yok" "$bas"
  elif [ "$rc" -ge 126 ]; then
    gecit_yaz "wasm_sanity" "CRASH" null 0 "$WASM_SANITY" "node exit $rc" "$bas" "$nk"
  else
    gecit_yaz "wasm_sanity" "KIRMIZI" null 0 "$WASM_SANITY" "wasm sanity kirmizi (exit $rc)" "$bas" "$nk"
  fi
}

# ---------------------------------------------------------------- regresyon (A1b)
regresyon() { # $1 = --taban veya bos
  local taban="${1:-}"
  if [ ! -f "$REGRESYON_DIZIN/girdiler.json" ]; then
    echo "kosmadi: $REGRESYON_DIZIN/girdiler.json yok (A1b kurar)"
    return 0
  fi
  if [ ! -f "$REGRESYON_DIZIN/kos.mjs" ]; then
    echo "kosmadi: $REGRESYON_DIZIN/kos.mjs yok (A1b kurar)"
    return 0
  fi
  logla "regresyon $taban"
  node "$REGRESYON_DIZIN/kos.mjs" $taban 2>>"$LOG"
  return $?
}

regresyon_gecit() {
  local bas out rc
  bas=$(log_satir)
  out=$(regresyon 2>&1); rc=$?
  printf '%s\n' "$out" >> "$LOG" 2>&1
  # HENUZ-YOK yalniz SETIN KENDISI yokken: girdiler.json / kos.mjs / taban yok.
  # TEK BIR GIRDININ dusmesi (K2 gibi, kendi DUSEN notunda ilan edilmis) setin
  # yoklugu DEGILDIR — set kosuyor, o girdi adiyla reddediliyor (madde 4).
  # Eski hal her 'kosmadi:' satirini setin yokluu sayiyordu ve calisan bir
  # regresyon setini HENUZ-YOK gosteriyordu (olculdu 6 Eyl: 7 girdi kostu,
  # 0 fark vardi, gecit yine de HENUZ-YOK basiyordu).
  if printf '%s' "$out" | grep -qE '^kosmadi: (KOSU|.*girdiler\.json yok|.*kos\.mjs yok)'; then
    gecit_yaz "regresyon" "HENUZ-YOK" null null "$REGRESYON_DIZIN/girdiler.json" "$(printf '%s' "$out" | grep -E '^kosmadi: (KOSU|.*girdiler\.json yok|.*kos\.mjs yok)' | head -1)" "$bas"
  elif [ "$rc" -eq 0 ]; then
    gecit_yaz "regresyon" "YESIL" 0 0 "$REGRESYON_DIZIN/girdiler.json" "tabandan fark yok | $(printf '%s' "$out" | grep -E '^OZET ' | head -1)" "$bas"
  else
    local n; n=$(printf '%s' "$out" | grep -c 'FARK'); n="${n:-null}"
    gecit_yaz "regresyon" "KIRMIZI" "$n" 0 "$REGRESYON_DIZIN/girdiler.json" "tabandan $n fark" "$bas"
  fi
}

# ---------------------------------------------------------------- JSON kurma
json_bas() { # $1 = mod ("tam")
  python3 - "$GECIT" "$STATE" "$LOG" "$TMPD/cikti.json" <<'PY' 2>>"$LOG"
import json, subprocess, sys, os
gecit_p, state_p, log_p, out_p = sys.argv[1:5]

def komut(c):
    try: return subprocess.run(c, shell=True, capture_output=True, text=True, timeout=20).stdout.strip()
    except Exception: return ""

ilkYesil = {}
try:
    with open(state_p) as f: ilkYesil = (json.load(f) or {}).get("ilkYesil") or {}
except Exception: ilkYesil = {}

gecitler = []
with open(gecit_p) as f:
    for satir in f:
        satir = satir.rstrip("\n")
        if not satir: continue
        p = satir.split("\t")
        while len(p) < 8: p.append("")
        ad, durum, sayi, esik, kaynak, not_, logsat, ek = p[:8]
        def num(v):
            if v in ("", "null"): return None
            try:
                f_ = float(v)
                return int(f_) if f_ == int(f_) else f_
            except Exception: return None
        # HENUZ-YOK ilk yesilden SONRA kirmizi sayilir (brief madde 1)
        if durum == "HENUZ-YOK" and ad in ilkYesil:
            durum = "KIRMIZI"
            not_ = (not_ + " | " if not_ else "") + "ilkYesil=%s kayitli: yokluk artik kirmizi" % ilkYesil[ad]
        g = {"ad": ad, "durum": durum, "sayi": num(sayi), "esik": num(esik),
             "kaynak": kaynak, "not": not_,
             "log": "%s:%s" % (log_p, logsat) if logsat not in ("", "null") else None}
        # ek adli alan (KARAR 5): "anahtar=deger". Gecit ne OLCMEDIGINI de adiyla tasir.
        if ek and "=" in ek:
            k, _, v = ek.partition("=")
            k = k.strip()
            if k: g[k] = v
        gecitler.append(g)

kirmizi = [g["ad"] for g in gecitler if g["durum"] in ("KIRMIZI", "CRASH")]
henuz  = [g["ad"] for g in gecitler if g["durum"] == "HENUZ-YOK"]
crash  = [g["ad"] for g in gecitler if g["durum"] == "CRASH"]

cikti = {
    "kapi": "0509-kapi.sh",
    "commit": komut("git rev-parse --short HEAD") or None,
    "tarih": komut("date '+%Y-%m-%d %H:%M:%S'") or None,
    "gecitSayisi": len(gecitler),
    "kirmiziSayisi": len(kirmizi),
    "kirmizilar": kirmizi,
    "henuzYok": henuz,
    "crash": crash,
    "gecitYesil": len(kirmizi) == 0,
    "log": log_p,
    "gecitler": gecitler,
}
with open(out_p, "w") as f:
    json.dump(cikti, f, ensure_ascii=False, indent=2)
print(len(kirmizi))
PY
}

# ---------------------------------------------------------------- --kisa (ucuz metrik)
kisa() {
  local commit enum sapma kirmizi
  commit=$(git rev-parse --short HEAD 2>>"$LOG")
  enum=$(enum_olc)
  sapma=""
  [ -f "$EMSAL" ] && sapma=$(emsal_olc)
  # hizli kirmizi: ctest'siz — enum circiri + emsal esigi
  : > "$GECIT"
  enum_gecit
  [ -f "$EMSAL" ] && emsal_gecit
  kirmizi=$(awk -F'\t' '$2=="KIRMIZI"||$2=="CRASH"' "$GECIT" 2>/dev/null | wc -l | tr -d ' ')
  kirmizi="${kirmizi:-0}"
  # cikti once degiskene alinir, sonra JSON'lugu dogrulanir: python3 patlarsa
  # BOS satir degil, adiyla bir hata satiri basilir (sessiz default yasagi).
  local satir
  # KAPI_SANAL: bu adimin urun olcusu (sanalDikisMM). Isci doldurur; yoksa null basar
  # (ivme null'i zaten muaf tutuyor). ctest KOSMAZ, uretilmis cizimden okunur: 60 s tavani korunur.
  satir=$(KAPI_COMMIT="${commit:-}" KAPI_SAPMA="${sapma:-}" KAPI_SANAL="${KAPI_SANAL:-}" KAPI_ENUM="${enum:-}" KAPI_KIRMIZI="${kirmizi:-0}" \
    python3 -c '
import json, os
def n(v):
    if v in ("", "null", None): return None
    try:
        f = float(v); return int(f) if f == int(f) else f
    except Exception: return None
import datetime
print(json.dumps({"commit": os.environ.get("KAPI_COMMIT") or None,
                  "anaSapmaMM": n(os.environ.get("KAPI_SAPMA")),
                  "sanalDikisMM": n(os.environ.get("KAPI_SANAL")),
                  "enum": n(os.environ.get("KAPI_ENUM")),
                  "kirmizi": n(os.environ.get("KAPI_KIRMIZI")),
                  "tarih": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")}, ensure_ascii=False))' 2>>"$LOG")
  if [ -z "${satir:-}" ] || ! printf '%s' "$satir" | python3 -m json.tool >/dev/null 2>>"$LOG"; then
    echo '{"hata":"KAPI_KISA_BOZUK","neden":"metrik satiri kurulamadi","log":"'"$LOG"'"}'
    return 1
  fi
  printf '%s\n' "$satir"
}

# ---------------------------------------------------------------- --ivme
ivme() {
  python3 - "$METRIK" "$STATE" <<'PY' 2>>"$LOG"
import json, sys, os
p = sys.argv[1]
state_p = sys.argv[2] if len(sys.argv) > 2 else ""
if not os.path.exists(p):
    print(json.dumps({"yerelMinimum": False, "neden": "metrik dosyasi yok", "seri": []}, ensure_ascii=False)); raise SystemExit(0)
satirlar = []
with open(p) as f:
    for s in f:
        s = s.strip()
        if not s: continue
        try: satirlar.append(json.loads(s))
        except Exception: continue
son = satirlar[-3:]
# YALNIZ sayisal metrikler; boolean/string muaf
alanlar = ["anaSapmaMM", "sanalDikisMM", "enum"]
seri = {}
for a in alanlar:
    v = [r.get(a) for r in son]
    v = [x for x in v if isinstance(x, (int, float)) and not isinstance(x, bool)]
    if len(v) == len(son) and len(v) >= 3:
        seri[a] = v
if not seri:
    print(json.dumps({"yerelMinimum": False, "neden": "3 satirlik tek sayisal metrik yok", "seri": []}, ensure_ascii=False)); raise SystemExit(0)

# KARAR Q1 (2026-09-06, A2 karar ajani): ESIK ALTINDAKI METRIK IVMEDEN MUAFTIR.
# Gerekce kayitta: bas==0 iken kapanma sabit 0.0 doner -> sifira inmis bir metrik
# 8.4'u ASLA gecemez; contract esiginin ZATEN altindaki bir metrigin %20 kapanmasi
# ancak once BOZULMASIYLA mumkundur. Bu esik gevsetmesi DEGILDIR: esik contract'tan
# okunur, asilirsa metrik seriye GERI GIRER ve kesme aynen uygulanir.
# Esik kaynagi ACIK YOL ile contract'tan okunur; kaynagi olmayan metrik DUSURULMEZ.
ESIK_KAYNAK = {
    # metrik: (dosya, [json yolu], yon)  — yon "kucukIyi": deger <= esik ise esik alti
    "anaSapmaMM": ("contract/flat-convention-v1.json", ["croquis", "toleranceMM"], "kucukIyi"),
    "sanalDikisMM": ("contract/graf-v1.json", ["toleranslar", "dikisUzunlukMM", "deger"], "kucukIyi"),
}
def _esik_oku(metrik):
    ent = ESIK_KAYNAK.get(metrik)
    if not ent: return None, "esik kaynagi YOK (contract'ta tanimli degil) — metrik seride kalir"
    dosya, yol, yon = ent
    try:
        with open(dosya) as f: d = json.load(f)
        for k in yol: d = d[k]
    except Exception as e:
        return None, "esik okunamadi: %s (%s)" % (dosya, type(e).__name__)
    if not isinstance(d, (int, float)) or isinstance(d, bool):
        return None, "esik sayisal degil: %s /%s" % (dosya, "/".join(yol))
    return float(d), "%s /%s = %s" % (dosya, "/".join(yol), d)

# yerel minimum: hicbir sayisal metrik 3 commit'te %20 kapanmadi
detay = {}
dusurulen = {}
sayilan = {}
for a, v in seri.items():
    bas, son_ = v[0], v[-1]
    if bas == 0:
        kapanma = 0.0 if son_ == 0 else -1.0
    else:
        kapanma = (bas - son_) / abs(bas)
    kayit = {"bas": bas, "son": son_, "kapanmaOran": round(kapanma, 4)}
    esik, esik_not = _esik_oku(a)
    if esik is not None and son_ <= esik:
        kayit["esik"] = esik
        kayit["esikKaynagi"] = esik_not
        kayit["seriden"] = "DUSURULDU: son deger (%s) contract esiginin (%s) altinda" % (son_, esik)
        dusurulen[a] = kayit
    else:
        if esik is not None:
            kayit["esik"] = esik
            kayit["esikKaynagi"] = esik_not
        else:
            kayit["esik"] = None
            kayit["esikKaynagi"] = esik_not
        sayilan[a] = kayit
    detay[a] = kayit

if not sayilan:
    # Hicbir sayisal metrik kalmadi: hepsi esik altinda. Kesme sebebi YOKTUR.
    cikti = {"yerelMinimum": False,
             "neden": "tum metrikler esik altinda",
             "seri": detay, "dusurulen": sorted(dusurulen.keys()),
             "sayilan": [], "satir": len(son)}
else:
    hukum = True
    for a, kayit in sayilan.items():
        if kayit["kapanmaOran"] >= 0.20: hukum = False
    cikti = {"yerelMinimum": hukum, "seri": detay,
             "dusurulen": sorted(dusurulen.keys()),
             "sayilan": sorted(sayilan.keys()), "satir": len(son)}
# KARAR 6 (2026-09-06): ivme muafiyeti. HUKUM DEGISTIRILMEZ, yalniz ADIYLA
# ilan edilir; muafiyet state.json'dan okunur ve HANGI ADIMDA OLDUGU yazilir.
# 8.4 ivme kurali urunu ILERLETEN adimlar icindir; gecit KURAN adim muaftir.
# Muafiyet DAR: yalniz muafAdim icin gecerli, sonrasinda BAGLAYICI.
if cikti.get("yerelMinimum") is True:
    # Muafiyet ADIYLA ilan edilir: state.json'da "ivmeMuafiyeti" alani. Bulanik
    # ad eslemesi YOK — adim adi degisince muafiyet sessizce dusmesin/kalmasin.
    adim, ilan = None, None
    try:
        with open(state_p) as f: st = json.load(f) or {}
        adim = st.get("adim") or ""
        ilan = st.get("ivmeMuafiyeti")
    except Exception:
        adim = None
    muaf = isinstance(ilan, dict) and ilan.get("gecerli") is True
    cikti["muafiyet"] = {
        "gecerli": muaf,
        "kaynak": "KOSU/0509-state.json /ivmeMuafiyeti (ilan yoksa muafiyet YOK)",
        "ilanEdildi": bool(ilan),
        "okunanAdim": adim if adim is not None else "state.json okunamadi",
        "gerekce": ((ilan or {}).get("gerekce") if muaf
                    else "Bu adim ivmeden MUAF DEGIL: yerelMinimum=true kesilme sebebidir (8.4)."),
        "biter": (ilan or {}).get("biter", "A2'den itibaren muafiyet YOK; A2/A4 sapmayi kapatmakla yukumlu."),
    }
print(json.dumps(cikti, ensure_ascii=False))
PY
}

# ---------------------------------------------------------------- --kendi-check
# A1a KABUL KOMUTU. Kapinin kendi cikti sozlesmesini ve A1a'nin uc kararini
# olcer. Ayri dosya DEGIL, bu scriptin bir modu: onceki denemede ayri dosya
# acmak referans kilidini kirdi (banned[]), kabul komutu izin listesindeki
# dosyanin icinde yasar.
# Her hukum tek satir: "OK  <ad>" / "FAIL <ad>: <sebep>". Son satir ozet.
# exit 0 = tum hukumler gecti, 1 = en az bir hukum kirmizi.
kendi_check() {
  local gecti=0 kaldi=0 out rc
  ok()   { printf 'OK   %s\n' "$1"; gecti=$((gecti+1)); }
  fail() { printf 'FAIL %s: %s\n' "$1" "$2"; kaldi=$((kaldi+1)); }

  # --- H1: --kisa TEK satir basar, bos degil
  out=$("$0" --kisa 2>/dev/null); rc=$?
  if [ -z "$out" ]; then fail "H1 kisa-bos" "--kisa hic satir basmadi (rc=$rc)"
  elif [ "$(printf '%s\n' "$out" | wc -l | tr -d ' ')" != "1" ]; then
    fail "H1 kisa-tek-satir" "$(printf '%s\n' "$out" | wc -l | tr -d ' ') satir basti, 1 bekleniyor"
  else ok "H1 kisa-tek-satir"; fi

  # --- H2: --kisa ciktisi gecerli JSON
  if printf '%s' "$out" | python3 -m json.tool >/dev/null 2>&1; then ok "H2 kisa-json"
  else fail "H2 kisa-json" "python3 -m json.tool gecmedi: $out"; fi

  # --- H3: --kisa'da dort alan var ve enum sayisal (bos degisken yasagi)
  if printf '%s' "$out" | python3 -c '
import json,sys
d=json.load(sys.stdin)
for a in ("commit","anaSapmaMM","enum","kirmizi","tarih"):
    assert a in d, "eksik alan: "+a
assert isinstance(d["enum"],(int,float)), "enum sayisal degil: %r"%d["enum"]
assert isinstance(d["kirmizi"],(int,float)), "kirmizi sayisal degil: %r"%d["kirmizi"]
' 2>/dev/null; then ok "H3 kisa-alanlar"
  else fail "H3 kisa-alanlar" "alan eksik ya da enum/kirmizi sayisal degil"; fi

  # --- H4: bilinmeyen mod sessiz gecmez, adiyla ret (madde 4)
  out=$("$0" --uydurma-mod 2>/dev/null); rc=$?
  if [ "$rc" = "3" ] && printf '%s' "$out" | grep -q 'BILINMEYEN_MOD'; then ok "H4 bilinmeyen-mod-ret"
  else fail "H4 bilinmeyen-mod-ret" "rc=$rc cikti=$out (rc=3 + BILINMEYEN_MOD bekleniyor)"; fi

  # --- H5: --ivme sayisal metrik yoksa false doner, NaN/exception degil
  # NaN taramasi ALT DIZE ile YAPILMAZ: duz metin alanlarinda "nan" harfleri
  # gecebiliyor (ornek: "tikanmanin") ve tarama yanlis kirmizi yakiyordu —
  # gecidin kendi H5'i 6 Eyl'de tam boyle yandi. Esik GEVSETILMEDI: kontrol
  # daraltilmadi, DOGRU YERE baglandi; artik her SAYISAL degerin gercekten
  # sonlu olduguna bakiliyor (math.isfinite), ki asil olculmek istenen buydu.
  out=$("$0" --ivme 2>/dev/null)
  if printf '%s' "$out" | python3 -c '
import json,sys,math
d=json.load(sys.stdin)
assert isinstance(d.get("yerelMinimum"),bool), "yerelMinimum bool degil"
def gez(o,yol="/"):
    if isinstance(o,bool): return
    if isinstance(o,(int,float)):
        assert math.isfinite(o), "sonlu olmayan sayi: "+yol
    elif isinstance(o,dict):
        for k,v in o.items(): gez(v,yol+str(k)+"/")
    elif isinstance(o,list):
        for i,v in enumerate(o): gez(v,yol+str(i)+"/")
gez(d)
' 2>/dev/null && ! printf '%s' "$out" | grep -qE '(^|[][{}:,[:space:]])-?(NaN|Infinity)([][}{:,[:space:]]|$)'; then ok "H5 ivme-bool"
  else fail "H5 ivme-bool" "ivme JSON degil / bool degil / NaN: $out"; fi

  # --- H6: --kilit-diff tag'siz cagrilirsa kullanim basar, rc=2
  out=$("$0" --kilit-diff 2>/dev/null); rc=$?
  if [ "$rc" = "2" ]; then ok "H6 kilit-diff-tagsiz"
  else fail "H6 kilit-diff-tagsiz" "rc=$rc (2 bekleniyor)"; fi

  # --- H7: referans kilidi kurulu (kilitli alanda IZIN DISI yazilabilir dosya YOK)
  # KARAR Q3 (2026-09-06, A2 karar ajani): KURAL IZIN LISTESINI SAYMAZ.
  # Eski hali sabit bir tavan (<=2) tasiyordu; mesru izin listesi 2'yi asinca
  # KACINILMAZ kirmizi yaniyor, isciyi izin istemek yerine ihtiyacini kirpmaya
  # itiyordu. Olculen dogru sey "ilan edilmemis dosyaya dokunulabilirligi"dir,
  # dosya SAYISI degil: bu yuzden sayim yalniz IZIN DISI dosyalari kapsar ve
  # tavani <=0'dir (daha SIKI, gevsetme degil). Izin listesi state.json'da
  # adim adiyla ILAN edilir; ilan yoksa izin de yoktur (sessiz default yok, 2.4).
  local yazilabilir izin_globlari h7not
  local h7oku="$TMPD/h7-izin-oku.py"
  cat > "$h7oku" <<'PY'
import json, sys
try:
    st = json.load(open(sys.argv[1])) or {}
except Exception:
    sys.exit(0)
adim = (st.get("adim") or "").strip()
# altAdim SOZLUK olabilir ({"A2a":"GECTI","A2b":"ACIK"}): ACIK olan alt adim aktiftir.
alt = ""
_a = st.get("altAdim")
if isinstance(_a, str):
    alt = _a.strip()
elif isinstance(_a, dict):
    for k, v in _a.items():
        if isinstance(v, str) and v.strip().upper().startswith("ACIK"):
            alt = k.strip(); break
# Ilan aranan anahtarlar, EN OZELDEN genele: "<altAdim>IzinListesi", "<adim>IzinListesi".
# Bulanik esleme YOK: adim adi degisince izin sessizce tasinmaz.
for ad in (alt, adim):
    if not ad: continue
    v = st.get(ad + "IzinListesi")
    if isinstance(v, list):
        for g in v:
            if isinstance(g, str):
                # "yol (YALNIZ ... aciklama)" formatinda yalniz yol kismi glob'dur
                print(g.split(" (")[0].strip())
        break
PY
  izin_globlari=$(python3 "$h7oku" "$STATE" 2>>"$LOG")
  local h7suz="$TMPD/h7-suzgec.py"
  cat > "$h7suz" <<'PY'
import sys, fnmatch
globlar = [g for g in open(sys.argv[1]).read().splitlines() if g.strip()]
disi = []
for f in sys.stdin:
    f = f.strip()
    if not f: continue
    if any(fnmatch.fnmatch(f, g) or f.startswith(g.rstrip("*/") + "/") for g in globlar):
        continue
    disi.append(f)
print(len(disi))
for f in disi[:10]:
    sys.stderr.write("  izin disi yazilabilir: %s\n" % f)
PY
  printf '%s\n' "$izin_globlari" > "$TMPD/h7-izin.txt"
  yazilabilir=$(while IFS= read -r p; do find "$p" -type f -perm -u+w 2>/dev/null; done < <(kilitli_yollar) \
                | python3 "$h7suz" "$TMPD/h7-izin.txt" 2>>"$LOG")
  h7not="izin globlari: $(printf '%s' "$izin_globlari" | tr '\n' ' ')"
  if [ "${yazilabilir:-99}" -eq 0 ]; then ok "H7 kilit-kurulu (izin disi yazilabilir: 0; ${h7not})"
  else fail "H7 kilit-kurulu" "kilitli alanda ${yazilabilir} IZIN DISI yazilabilir dosya var, kilit acik (${h7not})"; fi

  # --- H8: state.json gecerli JSON ve zorunlu alanlari var
  if python3 -c '
import json
d=json.load(open("KOSU/0509-state.json"))
for a in ("adim","durum","deneme","butce","banned","devredilen","ilkYesil","kabulKomutlari"):
    assert a in d, "eksik alan: "+a
' 2>/dev/null; then ok "H8 state-semasi"
  else fail "H8 state-semasi" "KOSU/0509-state.json bozuk ya da alan eksik"; fi

  # --- H9 (karar 1): flat_ayni_insan_check ilanli kirmizi, tavan 34, kapanacak adim A4
  if python3 -c '
import json
d=json.load(open("KOSU/0509-state.json"))
k=[x for x in d.get("ilanliKirmizi",[]) if x.get("gecit")=="flat_ayni_insan_check"]
assert k, "ilanliKirmizi listesinde flat_ayni_insan_check yok"
k=k[0]
assert k.get("tavan")==34, "tavan 34 degil: %r"%k.get("tavan")
assert k.get("kapanacakAdim")=="A4", "kapanacak adim A4 degil: %r"%k.get("kapanacakAdim")
' 2>/dev/null; then ok "H9 karar1-flat-ayni-insan"
  else fail "H9 karar1-flat-ayni-insan" "ilan/tavan 34/kapanacakAdim A4 state.json'da yok"; fi

  # --- H10 (karar 1): tavan asilmadi — gecidin bugunku sayisi <= 34
  local sayi
  sayi=$(ctest --test-dir "$BUILD" -R '^flat_ayni_insan_check$' -j1 --output-on-failure 2>>"$LOG" \
         | sed -n 's/.*[^0-9]\([0-9][0-9]*\) hukum kirmizi.*/\1/p' | head -1)
  if [ -z "${sayi:-}" ]; then fail "H10 karar1-tavan" "sayi olculemedi (ctest ciktisi eslesmedi), log: $LOG"
  elif [ "$sayi" -le 34 ]; then ok "H10 karar1-tavan (sayi=$sayi <= 34)"
  else fail "H10 karar1-tavan" "sayi=$sayi > tavan 34"; fi

  # --- H11 (karar 2): sinyal_tam ilani, dondurulmus alt test kumesi
  if python3 -c '
import json
d=json.load(open("KOSU/0509-state.json"))
k=[x for x in d.get("ilanliKirmizi",[]) if x.get("gecit")=="sinyal_tam"]
assert k, "ilanliKirmizi listesinde sinyal_tam yok"
k=k[0]
assert k.get("kapanacakAdim")=="A9", "kapanacak adim A9 degil: %r"%k.get("kapanacakAdim")
assert k.get("kirmiziAltTestKumesi")==["bundle_fresh_check"], "alt test kumesi donuk degil: %r"%k.get("kirmiziAltTestKumesi")
' 2>/dev/null; then ok "H11 karar2-sinyal-kume"
  else fail "H11 karar2-sinyal-kume" "sinyal_tam ilani / A9 / donuk kume {bundle_fresh_check} state.json'da yok"; fi

  # --- H12 (karar 2): sinyal_tam --kisa'ya GIRMEZ (ucuz yol sinyal.sh cagirmaz)
  if "$0" --kisa >/dev/null 2>&1 && ! grep -q 'sinyal_gecit\|sinyal\.sh' <(sed -n '/^kisa() {/,/^}/p' "$0"); then
    ok "H12 karar2-kisa-sinyalsiz"
  else fail "H12 karar2-kisa-sinyalsiz" "--kisa govdesinde sinyal.sh cagrisi var"; fi

  # --- H13 (karar 3): --kilit-diff engine/CMakeLists.txt'i IZLIYOR
  if grep -q 'engine/CMakeLists.txt' <(sed -n '/^izlenen_yollar()/,/^}/p' "$0"); then ok "H13 karar3-cmake-izlenir"
  else fail "H13 karar3-cmake-izlenir" "izlenen_yollar() icinde engine/CMakeLists.txt yok"; fi

  # --- H14 (karar 3): CMakeLists KILIDE ALINMAZ (yazilabilir kalir)
  if [ -w engine/CMakeLists.txt ]; then ok "H14 karar3-cmake-yazilabilir"
  else fail "H14 karar3-cmake-yazilabilir" "engine/CMakeLists.txt salt-okunur; karar 3 kilide ALINMAZ diyor"; fi

  # --- H15 (karar 3): satir yonu denetimi — silinen add_test( yakalanir
  #    sentetik diff uzerinde olculur, repoya dokunmaz
  local sy
  sy=$(printf -- '-add_test(NAME olu_gecit COMMAND x)\n+add_test(NAME yeni COMMAND y)\n' | cmake_satir_yonu)
  if printf '%s' "$sy" | grep -q 'KILIT_IHLALI'; then ok "H15 karar3-satir-yonu"
  else fail "H15 karar3-satir-yonu" "silinen add_test( satiri KILIT_IHLALI basmadi: $sy"; fi

  # --- H16: kabul komutlari state.json'da ve hepsi VAR olan dosyaya isaret ediyor
  if python3 -c '
import json,os,shlex
d=json.load(open("KOSU/0509-state.json"))
ks=d.get("kabulKomutlari",[])
assert ks, "kabulKomutlari bos"
for k in ks:
    parts=shlex.split(k)
    yol=[p for p in parts if "/" in p]
    for p in yol:
        assert os.path.exists(p), "kabul komutu olmayan dosyaya isaret ediyor: "+p
' 2>/dev/null; then ok "H16 kabul-komutu-var"
  else fail "H16 kabul-komutu-var" "kabulKomutlari bos ya da silinmis dosyaya isaret ediyor"; fi

  # --- H18 (karar defteri 6 Eyl, A1b teslimi): add_test HEDEF DEGISIMI de
  #    KILIT_IHLALI basar. Satiri silmek ile hedefi /bin/true'ya cevirmek ayni
  #    sonucu verir; eski kural yalniz SILMEYI goruyordu. Uc halde de olculur:
  #    (a) ayni ad silinip yeniden eklenmis (hedef degisimi) -> IHLAL
  #    (b) saf ekleme -> TEMIZ
  #    (c) saf silme -> IHLAL (eski kural korunuyor)
  local h18a h18b h18c
  h18a=$(printf -- '-add_test(NAME x_check COMMAND eski.sh)\n+add_test(NAME x_check COMMAND /bin/true)\n' | cmake_satir_yonu)
  h18b=$(printf -- '+add_test(NAME yepyeni COMMAND x)\n' | cmake_satir_yonu)
  h18c=$(printf -- '-add_test(NAME olu COMMAND x)\n' | cmake_satir_yonu)
  if printf '%s' "$h18a" | grep -q 'hedefi degisti' \
     && [ -z "$h18b" ] \
     && printf '%s' "$h18c" | grep -q 'KILIT_IHLALI'; then
    ok "H18 karar4-addtest-hedef-degisimi"
  else
    fail "H18 karar4-addtest-hedef-degisimi" "hedef degisimi=$(printf '%s' "$h18a" | tr '\n' ';') / saf-ekleme=$(printf '%s' "$h18b" | tr '\n' ';') / saf-silme=$(printf '%s' "$h18c" | tr '\n' ';')"
  fi

  # --- H17 (karar defteri 6 Eyl, A1b teslimi): ALT SUREC SIZINTI TARAMASI.
  #    Iddia "hicbir alt surec stdout'a sizmiyor" bugune kadar stderr BAYTIYLA
  #    olculuyordu; o olcum, stdout'a JSON-BENZERI basan bir alt sureci
  #    yakalamaz. Statik tarama: kapi.sh'in KENDI kaynagindaki her alt surec
  #    cagrisi (ctest|node|python3|cmake) ya '>> $LOG 2>&1' ile yonlendirilmis,
  #    ya $(...) ile YAKALANMIS, ya da bir boruya girmis olmali. Ciplak cagri =
  #    KIRMIZI, satir numarasiyla. Regresyon/wasm/emsal alt surec sayisini
  #    buyuttugu icin tarama tam bu buyumeyle geliyor.
  #
  #    TARAYICININ KENDI SAGLIGI ONCE OLCULUR. Ilk yazimda (6 Eyl, A1b) awk
  #    deseninde '/' karakter sinifi icinde kacirilmamisti; awk "nonterminated
  #    character class" ile OLUYOR, cikti BOS geliyor ve bos cikti "sizinti yok"
  #    diye okunuyordu — yani gecit, bozuk tarayiciyla YESIL yaniyordu. Olculdu:
  #    kapi.sh'e ciplak 'node --version' eklendi, H17 yine OK dedi. Bu yuzden
  #    once SENTETIK bir ornek taranir: bilinen 3 ciplak cagriyi bulamayan bir
  #    tarayici KIRMIZI'dir (arac onarimi, 8.3), sessizce gecmez.
  local tarayici sentetik bulunan ciplak
  tarayici="$TMPD/sizinti.awk"
  cat > "$tarayici" <<'AWK'
/^[[:space:]]*#/ { next }
/<<.?PY/ { icinde=1 }
icinde && /^PY$/ { icinde=0; next }
icinde { next }
{
  satir = $0
  sub(/#.*$/, "", satir)
  if (bekleyen != "") { satir = bekleyen " " satir; bekleyen = "" }
  if (satir ~ /\\[[:space:]]*$/) { sub(/\\[[:space:]]*$/, "", satir); bekleyen = satir; next }
  ham = satir
  # HAM satirda: zaten yonlendirilmis / yakalanmis / boruya girmis mi?
  if (ham ~ /\$\(/) next
  if (ham ~ />>[[:space:]]*"?\$LOG/) next
  if (ham ~ /\|[[:space:]]*(grep|sed|awk|python3|head|tail|wc|tr|sort)/) next
  if (ham ~ /^[[:space:]]*(local|[A-Za-z_][A-Za-z0-9_]*=)/) next
  # tirnakli dizeleri sil: icindeki "ctest"/"node" bir METINDIR, cagri degil
  gsub(/"[^"]*"/, "", satir)
  tek = sprintf("%c", 39)
  gsub(tek "[^" tek "]*" tek, "", satir)
  if (satir ~ /(^|[;|&(){}]|&&|\|\|)[[:space:]]*(ctest|node|python3|cmake)([[:space:]]|$)/) {
    printf "%d:%s\n", NR, substr($0, 1, 90)
  }
}
AWK
  sentetik="$TMPD/sizinti-ornek.sh"
  {
    printf '  node --version\n'
    printf '  ctest -R foo\n'
    printf '  python3 -c "x"\n'
    printf '  out=$(ctest -R bar)\n'
    printf '  ctest -R baz >> "$LOG" 2>&1\n'
  } > "$sentetik"
  bulunan=$(awk -f "$tarayici" "$sentetik" 2>>"$LOG" | wc -l | tr -d ' ')
  if [ "${bulunan:-0}" != "3" ]; then
    fail "H17 sizinti-taramasi" "TARAYICI BOZUK (arac onarimi): sentetik ornekte 3 ciplak cagri bekleniyordu, ${bulunan:-0} bulundu; bos cikti 'temiz' sayilamaz"
  else
    ciplak=$(awk -f "$tarayici" "$0" 2>>"$LOG")
    if [ -z "$ciplak" ]; then ok "H17 sizinti-taramasi (tarayici dogrulandi: 3/3)"
    else fail "H17 sizinti-taramasi" "ciplak alt surec cagrisi (stdout sizabilir): $(printf '%s' "$ciplak" | tr '\n' ';')"; fi
  fi

  printf 'OZET %s hukum gecti, %s kirmizi\n' "$gecti" "$kaldi"
  [ "$kaldi" -eq 0 ] && return 0
  return 1
}

# ---------------------------------------------------------------- ana akis
MOD="${1:-tam}"
case "$MOD" in
  --kilit)      kilit_kur "${2:-}"; exit 0;;
  --kilit-ac)   kilit_ac; exit 0;;
  --kilit-diff) kilit_diff "${2:-}" "${3:-}"; exit $?;;
  --kisa)       kisa; exit $?;;
  --ivme)       ivme; exit 0;;
  --regresyon)  regresyon "${2:-}"; exit $?;;
  --kendi-check) kendi_check; exit $?;;
  tam|"")       ;;
  *)            echo "{\"hata\":\"BILINMEYEN_MOD\",\"mod\":\"$MOD\"}"; exit 3;;
esac

logla "===== TAM GECIT KOSUMU ====="

# 1) ctest gecitleri (adlari engine/CMakeLists.txt add_test'lerinde)
ctest_gecit graf_ir_check          "graf IR + contract/graf-v1.json sema dogrulama: 0 hata" "engine/CMakeLists.txt:1523 add_test(graf_ir_check)"
ctest_gecit graf_op_check          "op araliklari contract/graf-v1.json'dan: 0 hata"        "engine/CMakeLists.txt:1529 add_test(graf_op_check)"
ctest_gecit graf_dikilebilir_check "sanal dikis: 0 kapanmayan halka"                        "engine/CMakeLists.txt:1534 add_test(graf_dikilebilir_check)"
ctest_gecit flat_convention_check  "flat konvansiyonu: contract/flat-convention-v1.json"    "engine/CMakeLists.txt:174 add_test(flat_convention_check)"
ctest_gecit parca_sayisi_check     "parca sayisi kaliptaki ile ayni"                        "engine/CMakeLists.txt:381 add_test(parca_sayisi_check)"
ctest_gecit edit_locality_check    "edit locality: contract/edit-locality-v1.json"          "engine/CMakeLists.txt:1257 add_test(edit_locality_check)"
ctest_gecit flat_ayni_insan_check  "flat'ler ayni insana: contract ayniInsan, tolerans 2 mm" "engine/CMakeLists.txt:1490 add_test(flat_ayni_insan_check)"
ctest_gecit edge_case_supurme_check "kenar durum supurmesi: 0 sessiz default"               "engine/CMakeLists.txt:498 add_test(edge_case_supurme_check)"
# HUKUM SAYISI URETILIR, ELLE YAZILMAZ. A1 gecit hakemi kusuru (6 Eyl):
# etiket "13 hukum" diyordu, kabul komutunun kendi ozeti "16 hukum gecti"
# basiyordu — tur 2'de H14/H15/H16 eklenmis, etiket guncellenmemisti. Hicbir
# esik bundan turemiyordu ama Damla'nin gordugu JSON'da kapinin KENDI hukum
# sayisi gercekle celisiyordu. Cozum: sayiyi kendi_check govdesindeki AYRIK
# H-numaralarindan say; etiket artik guncellenmeyi UNUTAMAZ.
# NOT (6 Eyl, olculdu): once sayim 'sed -n /^kendi_check/,/^}/p' ile yapiliyordu;
# H17'nin awk heredoc'u '}' ile baslayan bir satir icerdigi icin aralik ERKEN
# kesiliyor ve H17 sayilmiyordu (etiket 17, gercek 18 — yine bir "uretilen sayi
# ile basilan sayi celisiyor" hali, kapatilan kusurun aynisi). Sayim artik
# ok()/fail() CAGRILARINDAN yapiliyor; heredoc icerigi cagri olmadigi icin girmez.
HUKUM_SAYISI=$(grep -oE '\b(ok|fail) +"H[0-9]+' "$0" 2>>"$LOG" | grep -oE 'H[0-9]+' | sort -u | wc -l | tr -d ' ')
ctest_gecit kapi_sozlesme_check    "kapi.sh cikti sozlesmesi: ${HUKUM_SAYISI:-?} hukum (kaynaktan sayildi, elle yazilmadi)" "engine/CMakeLists.txt add_test(kapi_sozlesme_check)"

# 2) enum dallanma circiri (--measure; taban yalniz duser)
enum_gecit

# 3) emsal mm olcumu (A1b)
emsal_gecit

# 4) olcek gecidi (A1b: contract/body-v1.json olcekAraligi)
olcek_gecit

# 5) wasm sanity (A1b)
wasm_gecit

# 6) sessiz regresyon seti (A1b)
regresyon_gecit

# 7) sinyal.sh tam — DEVIR KABUL zinciri (muhurlu, dokunulmaz)
sinyal_gecit

# ---------------------------------------------------------------- cikti
KIRMIZI=$(json_bas)
if [ ! -s "$TMPD/cikti.json" ]; then
  echo '{"hata":"KAPI_BOZUK_JSON","neden":"json kurulamadi"}'
  exit 3
fi
if ! python3 -m json.tool "$TMPD/cikti.json" > "$TMPD/dogru.json" 2>>"$LOG"; then
  echo '{"hata":"KAPI_BOZUK_JSON","neden":"json.tool gecmedi"}'
  exit 3
fi
cat "$TMPD/dogru.json"
[ "${KIRMIZI:-1}" = "0" ] && exit 0
exit 1
