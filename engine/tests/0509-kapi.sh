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
  while IFS= read -r p; do alanlar+=("$p"); done < <(kilitli_yollar)
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
gecit_yaz() { # ad durum sayi esik kaynak not logSatir
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "${3:-null}" "${4:-null}" "${5:-}" "${6:-}" "${7:-null}" >> "$GECIT"
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
  kirmizi=$(printf '%s' "$out" | grep -c 'KIRMIZI')
  kirmizi="${kirmizi:-null}"
  if [ "$rc" -ge 126 ]; then
    gecit_yaz "sinyal_tam" "CRASH" null 0 "KOSU/sinyal.sh (muhurlu; DEVIR KABUL zinciri)" "exit $rc" "$bas"
  elif [ "$rc" -eq 0 ]; then
    gecit_yaz "sinyal_tam" "YESIL" "$kirmizi" 0 "KOSU/sinyal.sh (muhurlu; DEVIR KABUL zinciri)" "0 KIRMIZI satiri" "$bas"
  else
    gecit_yaz "sinyal_tam" "KIRMIZI" "$kirmizi" 0 "KOSU/sinyal.sh (muhurlu; DEVIR KABUL zinciri)" "$kirmizi KIRMIZI satiri (exit $rc)" "$bas"
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
  esik=$(python3 -c "
import json
c=json.load(open('contract/flat-convention-v1.json'))
def bul(o):
  if isinstance(o,dict):
    for k,v in o.items():
      if 'tolerans' in k.lower() or 'toleransMM'==k:
        if isinstance(v,(int,float)): return v
      r=bul(v)
      if r is not None: return r
  elif isinstance(o,list):
    for v in o:
      r=bul(v)
      if r is not None: return r
  return None
v=bul(c); print('' if v is None else v)" 2>>"$LOG")
  if [ -z "${sapma:-}" ]; then
    gecit_yaz "emsal_mm_olcum" "CRASH" null "${esik:-null}" "contract/flat-convention-v1.json" "olcum JSON'unda anaSapmaMM yok" "$bas"
    return
  fi
  local hukum
  hukum=$(python3 -c "
s=float('${sapma}'); e='${esik:-}'
print('YESIL' if (e!='' and s<=float(e)) else ('KIRMIZI' if e!='' else 'HENUZ-YOK'))" 2>>"$LOG")
  gecit_yaz "emsal_mm_olcum" "${hukum:-CRASH}" "$sapma" "${esik:-null}" "contract/flat-convention-v1.json (tolerans mm)" "emsale ana sapma" "$bas"
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
  # graftan cizim yokken mutlak sinir kutusu olculemez
  gecit_yaz "olcek_check" "HENUZ-YOK" null null "contract/body-v1.json olcekAraligi" "graftan cizim yok; degerlenmis bbox olculemiyor" "$bas"
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
  if [ "$rc" -eq 0 ]; then
    gecit_yaz "wasm_sanity" "YESIL" 0 0 "$WASM_SANITY" "trap/panic/bellek/native-fark yok" "$bas"
  elif [ "$rc" -eq 8 ]; then
    gecit_yaz "wasm_sanity" "HENUZ-YOK" null null "$WASM_SANITY" "graf wasm binding'i yok" "$bas"
  elif [ "$rc" -ge 126 ]; then
    gecit_yaz "wasm_sanity" "CRASH" null 0 "$WASM_SANITY" "node exit $rc" "$bas"
  else
    gecit_yaz "wasm_sanity" "KIRMIZI" null 0 "$WASM_SANITY" "wasm sanity kirmizi (exit $rc)" "$bas"
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
  if printf '%s' "$out" | grep -q '^kosmadi:'; then
    gecit_yaz "regresyon" "HENUZ-YOK" null null "$REGRESYON_DIZIN/girdiler.json" "$(printf '%s' "$out" | head -1)" "$bas"
  elif [ "$rc" -eq 0 ]; then
    gecit_yaz "regresyon" "YESIL" 0 0 "$REGRESYON_DIZIN/girdiler.json" "tabandan fark yok" "$bas"
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
        while len(p) < 7: p.append("")
        ad, durum, sayi, esik, kaynak, not_, logsat = p[:7]
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
  satir=$(KAPI_COMMIT="${commit:-}" KAPI_SAPMA="${sapma:-}" KAPI_ENUM="${enum:-}" KAPI_KIRMIZI="${kirmizi:-0}" \
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
  python3 - "$METRIK" <<'PY' 2>>"$LOG"
import json, sys, os
p = sys.argv[1]
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
# yerel minimum: hicbir sayisal metrik 3 commit'te %20 kapanmadi
hukum = True
detay = {}
for a, v in seri.items():
    bas, son_ = v[0], v[-1]
    if bas == 0:
        kapanma = 0.0 if son_ == 0 else -1.0
    else:
        kapanma = (bas - son_) / abs(bas)
    detay[a] = {"bas": bas, "son": son_, "kapanmaOran": round(kapanma, 4)}
    if kapanma >= 0.20: hukum = False
print(json.dumps({"yerelMinimum": hukum, "seri": detay, "satir": len(son)}, ensure_ascii=False))
PY
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
ctest_gecit kapi_sozlesme_check    "kapi.sh cikti sozlesmesi: 13 hukum"                      "engine/CMakeLists.txt add_test(kapi_sozlesme_check)"

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
