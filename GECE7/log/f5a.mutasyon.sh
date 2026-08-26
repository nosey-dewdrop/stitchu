#!/usr/bin/env bash
# F5-A MUTASYON KOŞUMU — GECE7, §3.8 md.3.
#
# ⚠ BAYAT İKİLİ TUZAĞI. F3 ajanının mutasyon betiği İKİ KEZ yalan söyledi ve
# hakem de HM-F3'te aynı tuzağa düştü: `make` saniye karşılaştırır, ve
# mutasyon-derle-geri-al bir saniyenin içinde kapanırsa kapı MUTASYONSUZ ikiliye
# karşı koşar ve "yeşil — kapı değil" der. Burada her turda ikili SİLİNİR,
# yeniden derlenir ve `shasum` ile GERÇEKTEN kımıldadığı kanıtlanır. Kımıldamadıysa
# HÜKÜM VERİLMEZ, "HUKUM YOK" yazılır.
set -uo pipefail
cd "$(dirname "$0")/../.."
B=engine/build

hash_of() { shasum "$1" 2>/dev/null | cut -c1-8; }

build() {
  rm -f "$B/seam-plan" "$B/rotate-op"
  cmake --build "$B" -j8 --target seam-plan rotate-op >/dev/null 2>&1
}

run_gate() {  # $1 = gate script, rest = args
  node "$@" >/dev/null 2>&1 && echo "EXIT 0 (YESIL)" || echo "EXIT $? (KIRMIZI)"
}

nodeid() { "$B/seam-plan" EU38 --kalip 2>/dev/null | sed -n 's/.*"dugum": "\(.*\)".*/\1/p'; }

mutate() {  # ad dosya sed-ifadesi kapi...
  local ad="$1" dosya="$2" sed_ifade="$3"; shift 3
  cp "$dosya" /tmp/f5a.orig
  build; local h0; h0=$(hash_of "$B/seam-plan")$(hash_of "$B/rotate-op"); local n0; n0=$(nodeid)
  perl -0pi -e "$sed_ifade" "$dosya"
  if cmp -s /tmp/f5a.orig "$dosya"; then
    echo "  $ad  KAYNAK DEGISMEDI — mutasyon tutmadi, HUKUM YOK"; cp /tmp/f5a.orig "$dosya"; return
  fi
  build; local h1; h1=$(hash_of "$B/seam-plan")$(hash_of "$B/rotate-op"); local n1; n1=$(nodeid)
  if [ "$h0" = "$h1" ]; then
    echo "  $ad  IKILI KIMILDAMADI ($h0) — HUKUM YOK (bayat ikili / atil yol)"
  else
    echo "  $ad  ikili $h0 -> $h1 · dugum $n0 -> $n1"
    echo "        kapi: $(run_gate "$@")"
  fi
  cp /tmp/f5a.orig "$dosya"; build
  local h2; h2=$(hash_of "$B/seam-plan")$(hash_of "$B/rotate-op")
  echo "        geri alindi: ikili $h2 (taban $h0) · kapi: $(run_gate "$@")"
}

TEK=engine/tests/tek_nesne_check.mjs
ROT=engine/tests/rotate_check.mjs
EXP=engine/tests/expressability_check.mjs

echo "=== F5-A MUTASYONLARI — $(date '+%Y-%m-%d %H:%M') ==="
echo
echo "M1  HAKEMIN HM-F2'si, AYNEN: engine/src/shellprojection.cpp (F5-A'nin YAZMADIGI dosya)"
echo "    projectBack := projectFront  — arka teknik cizim = on teknik cizim"
mutate M1 engine/src/shellprojection.cpp \
  's/ShellProjection projectBack\(const GarmentSurf& surf\) \{ return project\(surf, false\); \}/ShellProjection projectBack(const GarmentSurf\& surf) { return project(surf, true); }/' \
  "$TEK"
echo
echo "M2  engine/src/shellprojection.cpp (F5-A'nin YAZMADIGI dosya)"
echo "    kSampleStepMM 4.0 -> 5.0 — YALNIZ cizilen siluet degisir; halkalar ve"
echo "    ust sinir aynen kalir. Dugumun siluete BAGLI oldugunun olumlu kontrolu:"
echo "    dugum kimildamak ZORUNDA, kapi ise YESIL kalmali (mesru bir degisiklik)."
mutate M2 engine/src/shellprojection.cpp \
  's/constexpr double kSampleStepMM = 4\.0;/constexpr double kSampleStepMM = 5.0;/' \
  "$TEK"
echo
echo "M3  engine/src/seamplan.cpp — IS 0'IN KENDISI GERI ALINIRSA"
echo "    mixProjection cagrilari silinir: dugum F3'un sayisina geri doner."
mutate M3 engine/src/seamplan.cpp \
  's/    mixProjection\(h, projectFront\(pattern\.surf\)\);\n    mixProjection\(h, projectBack\(pattern\.surf\)\);\n//' \
  "$TEK"
echo
echo "M4  engine/src/dartrotate.cpp — TRANSFERI KIMLIKSIZLESTIR (kartin istedigi mutasyon)"
echo "    theta := 0 — pens 'tasindi' diye isaretlenir, geometri yerinde birakilir."
mutate M4 engine/src/dartrotate.cpp \
  's/const double theta = signedAngle\(apex, contour\[iB\], contour\[iA\]\);/const double theta = 0.0;/' \
  "$ROT"
echo
echo "M5  engine/src/dartrotate.cpp — ESKI PENS KAPANMASIN"
echo "    birlesen tepe noktasi da yazilir: alan ve cevre kimligi bozulur."
mutate M5 engine/src/dartrotate.cpp \
  's/        if \(k != iB\) out\.push_back\(rot\(contour\[k\], apex, theta\)\);  \/\/ first merges into leg A/        out.push_back(rot(contour[k], apex, theta));/' \
  "$ROT"
echo
echo "M6  contract/primitives-v1.json — UYGULANMAMIS OPERATORU UYGULANMIS SAY (§0B)"
echo "    op.split kendine olmayan bir kapi (split_check) gosterir."
cp contract/primitives-v1.json /tmp/f5a.contract
python3 - <<'PY'
import json,collections
p='contract/primitives-v1.json'
d=json.load(open(p),object_pairs_hook=collections.OrderedDict)
d['primitifler']['op.split']['motorda_kapi']='split_check'
open(p,'w').write(json.dumps(d,ensure_ascii=False,indent=2)+"\n")
PY
echo "    kapi: $(run_gate "$EXP")"
cp /tmp/f5a.contract contract/primitives-v1.json
echo "        geri alindi · kapi: $(run_gate "$EXP")"
echo
echo "=== git status (temiz olmali) ==="
git status --short engine/src contract engine/tests
