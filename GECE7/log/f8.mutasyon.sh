#!/bin/bash
# f8.mutasyon.sh — F8'in mutasyon turu.
#
# ⚠ BORÇ 89'UN DERSİ: bu betik `git checkout --` KULLANMAZ. F7 ajanının mutasyon
# betiği onu kullandı ve commit'lenmemiş işi sildi. Burada her dosya `cp` ile
# yedeklenir ve `cp` ile geri konur, ve tur commit'ten SONRA koşar.
#
# ⚠ F7 HAKEMİNİN BAŞINA GELEN TUZAK: `cmake --build` sessizce rc=2 ile düşebilir
# ve sen BAYAT bir ikiliyi ölçersin. Her turda derlemenin DÖNÜŞ KODU basılır, ve
# wasm gereken turlarda `shasum` ikilinin kımıldadığını gösterir.
# "Bayat ikili = HÜKÜM YOK."
set -uo pipefail
cd "$(dirname "$0")/../.."
ROOT="$(pwd)"
BAK="${TMPDIR:-/tmp}/f8-mutasyon-yedek"
mkdir -p "$BAK"

say() { printf '\n========================================\n%s\n========================================\n' "$1"; }

yedekle() { cp "$1" "$BAK/$(echo "$1" | tr '/' '_')"; }
geri()    { cp "$BAK/$(echo "$1" | tr '/' '_')" "$1"; }

numstat() {
  echo "--- git diff --numstat HEAD (BOŞ olmalı: mutasyon ÖNCESİ ağaç temiz) ---"
  git diff --numstat HEAD -- engine web contract | sed 's/^/    /'
  echo "--- (bitti) ---"
}

derle() {
  cmake --build engine/build -j8 > "$BAK/build.log" 2>&1
  local rc=$?
  echo "   cmake --build rc=$rc   $( [ $rc -ne 0 ] && echo '<<< DERLEME DÜŞTÜ — bu tur HÜKÜM TAŞIR ancak beklenen buysa' )"
  return $rc
}

wasm() {
  bash engine/build-wasm.sh > "$BAK/wasm.log" 2>&1
  echo "   build-wasm rc=$?   dist shasum: $(shasum engine/dist/stitchu-engine.js | cut -c1-8)  web/vendor: $(shasum web/vendor/stitchu-engine.js | cut -c1-8)"
}

kapi() {  # kapi <ad> <komut...>
  local ad="$1"; shift
  "$@" > "$BAK/gate.log" 2>&1
  echo "   $ad -> EXIT $?"
}

say "TUR 0 — MUTASYONSUZ TABAN (her sayı buradan okunur)"
numstat
echo "dist shasum: $(shasum engine/dist/stitchu-engine.js | cut -c1-8)  web/vendor: $(shasum web/vendor/stitchu-engine.js | cut -c1-8)"
kapi "bugra_parity_check" node engine/tests/bugra_parity_check.mjs
kapi "al_dene_check"      node engine/tests/al_dene_check.mjs
kapi "indir_check"        node engine/tests/indir_check.mjs
kapi "dxf_check"          ctest --test-dir engine/build -R "^dxf_check$"

# ---------------------------------------------------------------------------
say "M1 — borç 93: kCap'in %38 ÇAPASI 0.00 -> 0.05 (hakemin HM-1b'sinin AYNISI)"
echo "F7'de bu mutasyon derlendi, ikiliyi kımıldattı ve YEDİ KAPI DA YEŞİL kaldı."
echo "F8'in iddiası: artık DERLENMEZ. Beklenen: cmake --build rc != 0."
numstat
yedekle engine/src/fabricease.hpp
sed -i '' 's/Anchor{0.0, 0.04}, {12.5, 0.02}, {38.0, 0.00}/Anchor{0.0, 0.04}, {12.5, 0.02}, {38.0, 0.05}/' engine/src/fabricease.hpp
grep -n "kCap = {" -A 2 engine/src/fabricease.hpp | sed 's/^/    /'
derle
geri engine/src/fabricease.hpp
derle
numstat

# ---------------------------------------------------------------------------
say "M2 — borç 94: TARAYICI EDİT TELİ SESSİZCE YUTUYOR (hakemin HM-2b'sinin AYNISI)"
echo "F7'de BEŞ KAPI DA YEŞİL kaldı. F8'in iddiası: indir_check KIRMIZI yanar."
numstat
yedekle web/js/engine.js
sed -i '' "s/      ? spec.editExtendMM : 0,/      ? 0 : 0,/" web/js/engine.js
sed -i '' "s/    editAttach: spec.editAttach === 'bow' || spec.editAttach === 1 ? 1 : 0,/    editAttach: 0,/" web/js/engine.js
grep -n "editExtendMM:\|editAttach:" web/js/engine.js | sed 's/^/    /'
kapi "indir_check (BEKLENEN: EXIT 1)" node engine/tests/indir_check.mjs
grep -E "FAIL" "$BAK/gate.log" | head -6 | sed 's/^/       /'
kapi "al_dene_check" node engine/tests/al_dene_check.mjs
geri web/js/engine.js
kapi "indir_check (geri alındı)" node engine/tests/indir_check.mjs
numstat

# ---------------------------------------------------------------------------
say "M3 — DXF: DİKİŞ ÇİZGİSİ ESKİ YANLIŞ KATMANA (14 -> 8) GERİ DÖNÜYOR"
echo "Bu tam olarak bugün düzeltilen kusur. Beklenen: dxf_check ve indir_check kırmızı."
numstat
yedekle engine/src/dxf.hpp
sed -i '' 's|static constexpr const char\* kSeamline    = "14";  // sew line|static constexpr const char* kSeamline    = "8";   // sew line|' engine/src/dxf.hpp
grep -n "kSeamline\|kInternal" engine/src/dxf.hpp | grep constexpr | sed 's/^/    /'
derle
kapi "dxf_check (BEKLENEN: EXIT != 0)" ctest --test-dir engine/build -R "^dxf_check$"
tail -4 "$BAK/gate.log" | sed 's/^/       /'
wasm
kapi "indir_check (BEKLENEN: EXIT 1)" node engine/tests/indir_check.mjs
grep -E "FAIL" "$BAK/gate.log" | head -4 | sed 's/^/       /'
geri engine/src/dxf.hpp
derle
wasm
kapi "dxf_check (geri alındı)" ctest --test-dir engine/build -R "^dxf_check$"
kapi "indir_check (geri alındı)" node engine/tests/indir_check.mjs
numstat

# ---------------------------------------------------------------------------
say "M4 — KÖR KONTROL AYAR VİDASINA ÇEVRİLİYOR: harness ezber preset'i seçiyor"
echo "bugra-parity'nin bustier draft'ı cupSeam: 1 (horizontal) yerine 2 (bugra)."
echo "garment.cpp:568 o değeri görünce Buğra'nın KENDİ ölçülen ease/princess"
echo "paylarını sabit yüklüyor — yani kıyas Buğra'yı Buğra'nın ezberiyle kıyaslar."
echo "Beklenen: bugra_parity_check KIRMIZI."
numstat
yedekle engine/tools/bugra/bugra-parity.mjs
sed -i '' "s/  sleeveStyle: 'none', topLength: 'hip', cupSeam: 1 }, 'BUSTIER');/  sleeveStyle: 'none', topLength: 'hip', cupSeam: 2 }, 'BUSTIER');/" engine/tools/bugra/bugra-parity.mjs
grep -n "cupSeam: " engine/tools/bugra/bugra-parity.mjs | grep draft | sed 's/^/    /'
kapi "bugra_parity_check (BEKLENEN: EXIT 1)" node engine/tests/bugra_parity_check.mjs
grep -E "FAIL" "$BAK/gate.log" | head -4 | sed 's/^/       /'
geri engine/tools/bugra/bugra-parity.mjs
kapi "bugra_parity_check (geri alındı)" node engine/tests/bugra_parity_check.mjs
numstat

# ---------------------------------------------------------------------------
say "M5 — 'PARÇA DEĞİL AD' SALDIRISI: bölme sahte, iki parça AYNI kontur"
echo "Kartın 2. şartı: 'Bir parçaya Front Side yazıp listeyi kapatmak SAPMADIR.'"
echo "Burada Front Body Side Front'un konturu Center'ınkiyle DEĞİŞTİRİLİYOR:"
echo "parça sayısı ve eşleşme aynı kalır, MOTOR EKSİĞİ hâlâ 0 basar."
echo "Beklenen: bugra_parity_check'in ANTI-NAMING kolu KIRMIZI yanar."
numstat
yedekle engine/src/garment.cpp
python3 - <<'PY'
import re
p='engine/src/garment.cpp'
s=open(p,encoding='utf-8').read()
# Son parça listesine, iki panelin konturunu esitleyen bir satir enjekte et.
needle='    return pattern;'
idx=s.rfind(needle)
inject='''    // [F8 MUTASYON M5] SAHTE BOLME: iki panel ayni sekil, iki ad.
    {
        PatternPiece* a = nullptr; PatternPiece* b = nullptr;
        for (auto& pc : pattern.pieces) {
            if (pc.name == "Front Body Center Front") a = &pc;
            if (pc.name == "Front Body Side Front")   b = &pc;
        }
        if (a && b) { b->commands = a->commands; }
    }
'''
s=s[:idx]+inject+s[idx:]
open(p,'w',encoding='utf-8').write(s)
print("    M5 enjekte edildi (garment.cpp)")
PY
derle
if [ $? -eq 0 ]; then
  wasm
  kapi "bugra_parity_check (BEKLENEN: EXIT 1)" node engine/tests/bugra_parity_check.mjs
  grep -E "FAIL|MOTOR EKSİĞİ: corset" "$BAK/gate.log" | head -6 | sed 's/^/       /'
else
  echo "   DERLEME DÜŞTÜ — M5 HÜKÜMSÜZ, ölçüm yapılmadı."
fi
geri engine/src/garment.cpp
derle
wasm
kapi "bugra_parity_check (geri alındı)" node engine/tests/bugra_parity_check.mjs
numstat

# ---------------------------------------------------------------------------
say "M6 — AL DENE: HOLDOUT SIZDIRILIYOR (hakemin 11 numarası sayfaya konuyor)"
echo "Dokuz karttır harcanmamış bir holdout fotoğrafını yayına almak GERİ ALINAMAZ."
echo "Beklenen: al_dene_check KIRMIZI."
numstat
yedekle web/data/al-dene.json
python3 - <<'PY'
import json
p='web/data/al-dene.json'
d=json.load(open(p,encoding='utf-8'))
first=json.loads(json.dumps(d['ornekler'][0]))
first['dosya']='11-flamenco-dress-ruffles.jpg'; first['no']='11'
d['ornekler'].append(first)
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print("    holdout 11 sayfaya eklendi")
PY
kapi "al_dene_check (BEKLENEN: EXIT 1)" node engine/tests/al_dene_check.mjs
grep -E "FAIL" "$BAK/gate.log" | head -5 | sed 's/^/       /'
geri web/data/al-dene.json
kapi "al_dene_check (geri alındı)" node engine/tests/al_dene_check.mjs
numstat

# ---------------------------------------------------------------------------
say "M7 — AL DENE: ÖRNEK YOLU PARA HARCAMAYA BAŞLIYOR (§3.9)"
echo "analyzeBankedPhoto Worker'a gidiyor. Beklenen: al_dene_check KIRMIZI."
numstat
yedekle web/js/analyze.js
python3 - <<'PY'
p='web/js/analyze.js'
s=open(p,encoding='utf-8').read()
s=s.replace("  const res = await fetch(url);\n  if (!res.ok) throw new Error('That example image could not be loaded.');",
            "  const res = await fetch(BACKEND_URL + '/api/analyze');\n  if (!res.ok) throw new Error('That example image could not be loaded.');")
open(p,'w',encoding='utf-8').write(s)
print("    banked reader artik BACKEND_URL'e gidiyor")
PY
kapi "al_dene_check (BEKLENEN: EXIT 1)" node engine/tests/al_dene_check.mjs
grep -E "FAIL" "$BAK/gate.log" | head -4 | sed 's/^/       /'
geri web/js/analyze.js
kapi "al_dene_check (geri alındı)" node engine/tests/al_dene_check.mjs
numstat

say "KAPANIŞ — ağaç mutasyon öncesiyle aynı olmalı"
numstat
echo "dist shasum: $(shasum engine/dist/stitchu-engine.js | cut -c1-8)  web/vendor: $(shasum web/vendor/stitchu-engine.js | cut -c1-8)"
echo "git status (takipli):"
git status --porcelain | grep -v '^??' | sed 's/^/    /'
echo "(boş = mutasyonların hiçbiri ağaçta iz bırakmadı)"
