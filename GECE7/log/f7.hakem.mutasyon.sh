#!/usr/bin/env bash
# GECE7 / F7 — HAKEM MUTASYONLARI (§3.8 md.3).
# BES TUR, HEPSI AJANIN HIC DOKUNMADIGI DOSYALARDA.
# Ajanin F7'de degistirdigi dosyalar (git diff F7-oncesi..HEAD): garment.cpp,
# measurements.hpp, patternedit.*, tie.*, validator.cpp, attach_check.cpp,
# extend_check.cpp, fabric_catalog_check.cpp, indir_check.mjs, bindings.cpp,
# primitives-v1.json, CMakeLists.txt, build-wasm.sh. ASAGIDAKI BESI DE O LISTEDE DEGIL.
#
# KURAL: mutasyon CALISMA AGACINDA yapilir, commit'lenmez -> numstat BOS olmali.
# shasum ikilinin gercekten kimildadigini gosterir.
# BORC 89 DERSI: `git checkout --` commit'lenmemis isi siler. Hakem turunda
# calisma agaci TEMIZ (HEAD == agent commit), o yuzden checkout guvenli; yine de
# her tur oncesi yedek aliniyor.
set -u
cd "$(dirname "$0")/../.." || exit 1
R="$(pwd)"; B="$R/engine/build"
tur(){ echo; echo "================ $1 ================"; }
numstat(){ echo "--- git diff --numstat F7-oncesi..HEAD -- $1 ---"; git diff --numstat F7-oncesi..HEAD -- "$1"; echo "--- (BOSSA commit'lenmemis, dogru) ---"; }
rebuild(){ cmake --build "$B" -j8 >/dev/null 2>&1; }
yedek(){ cp "$1" "/tmp/hakem-yedek-$(basename $1)"; }
geri(){ cp "/tmp/hakem-yedek-$(basename $1)" "$1"; }

# ---------------------------------------------------------------- HM-1
tur "HM-1 — engine/src/fabricease.hpp : kCap'in DOKUMA capasi 0.04 -> 0.004"
echo "SORU: F7 zemini min(capEaseMin, capEase) yapti. capEase KAPISIZ bir tablodan"
echo "      geliyorsa, o tabloyu bozmak DOKUMA zeminini sessizce dusurur mu?"
numstat engine/src/fabricease.hpp; yedek engine/src/fabricease.hpp
perl -i -pe 's/Anchor\{0\.0, 0\.04\}, \{12\.5, 0\.02\}, \{38\.0, 0\.00\}/Anchor{0.0, 0.004}, {12.5, 0.02}, {38.0, 0.00}/' engine/src/fabricease.hpp
grep -n "Anchor{0.0, 0.004}" engine/src/fabricease.hpp || echo "!! perl tutmadi"
rebuild
for t in fabric_ease_check fabric_catalog_check sleeve_check validator_check; do
  [ -x "$B/$t" ] && { "$B/$t" >/dev/null 2>&1; echo "  $t EXIT=$?"; }
done
bash engine/build-wasm.sh >/dev/null 2>&1
shasum "$R/engine/dist/stitchu-engine.js" | cut -c1-16
node engine/tests/indir_check.mjs >/dev/null 2>&1; echo "  indir_check EXIT=$?"
node engine/tests/hedef_kosu.mjs >/dev/null 2>&1; echo "  hedef_kosu EXIT=$?"
geri engine/src/fabricease.hpp; bash engine/build-wasm.sh >/dev/null 2>&1; rebuild
shasum "$R/engine/dist/stitchu-engine.js" | cut -c1-16
node engine/tests/indir_check.mjs >/dev/null 2>&1; echo "  geri alindi, indir_check EXIT=$?"

# ---------------------------------------------------------------- HM-2
tur "HM-2 — web/js/download.js : relayDXF INEN DOSYADAN 'Bow' parcasini DUSURSUN"
echo "SORU: op.attach'in parcasi INEN DOSYAYA gercekten giriyor mu, yoksa yalnizca"
echo "      C++ tarafinda mi var? Sapma sorusunun tam kalbi."
numstat web/js/download.js; yedek web/js/download.js
perl -i -pe "s|^  if \(!out \|\| out\.error \|\| !out\.dxf\) return \(out && out\.error\) \|\| 'no geometry';|  if (!out || out.error || !out.dxf) return (out \&\& out.error) || 'no geometry';\n  out = { ...out, dxf: out.dxf.split('\\\\n').filter(l => l.indexOf('Bow') < 0).join('\\\\n') };|" web/js/download.js
grep -n "indexOf('Bow')" web/js/download.js || echo "!! perl tutmadi"
node engine/tests/indir_check.mjs >/dev/null 2>&1; echo "  indir_check EXIT=$?"
node engine/tests/hedef_kosu.mjs >/dev/null 2>&1; echo "  hedef_kosu EXIT=$?"
geri web/js/download.js
node engine/tests/indir_check.mjs >/dev/null 2>&1; echo "  geri alindi, indir_check EXIT=$?"

# ---------------------------------------------------------------- HM-3
tur "HM-3 — contract/fabric-catalog-v1.json : jersey stretchPct 50 -> 0"
echo "SORU: borc 88'in YENI iki kolu (oyuk + buzgu) gercekten yanabiliyor mu?"
numstat contract/fabric-catalog-v1.json; yedek contract/fabric-catalog-v1.json
perl -i -pe 's/"stretchPct": 50\.0,/"stretchPct": 0.0,/' contract/fabric-catalog-v1.json
grep -n '"stretchPct": 0.0,' contract/fabric-catalog-v1.json | head -2
rebuild
"$B/fabric_catalog_check" 2>&1 | grep -iE "FAIL|checks|kontrol" | head -5
"$B/fabric_catalog_check" >/dev/null 2>&1; echo "  fabric_catalog_check EXIT=$?"
geri contract/fabric-catalog-v1.json; rebuild
"$B/fabric_catalog_check" >/dev/null 2>&1; echo "  geri alindi, fabric_catalog_check EXIT=$?"

# ---------------------------------------------------------------- HM-4
tur "HM-4 — engine/src/skirt.cpp : ETEK UCU EGRISINI degistir (kontrol noktalari)"
echo "SORU: extend_check LEG 3 (etek ucu TASINDI, YENIDEN CIZILMEDI) mutlak mi,"
echo "      yoksa yalnizca ONCE/SONRA goreli mi? Goreli ise HUKUM YOK."
numstat engine/src/skirt.cpp; yedek engine/src/skirt.cpp
perl -i -pe 's/\{hemX \* 0\.6, length\},/{hemX * 0.9, length},/' engine/src/skirt.cpp
grep -n "hemX \* 0.9" engine/src/skirt.cpp || echo "!! perl tutmadi"
rebuild
"$B/extend_check" >/dev/null 2>&1; echo "  extend_check EXIT=$?"
"$B/attach_check" >/dev/null 2>&1; echo "  attach_check EXIT=$?"
"$B/golden_check" >/dev/null 2>&1; echo "  golden_check EXIT=$?"
geri engine/src/skirt.cpp; rebuild
"$B/extend_check" >/dev/null 2>&1; echo "  geri alindi, extend_check EXIT=$?"

# ---------------------------------------------------------------- HM-5
tur "HM-5 — engine/src/hem.cpp : (varsa) hem pasini bozarak extend'in ev sahibini kaydir"
numstat engine/src/hem.cpp; yedek engine/src/hem.cpp
perl -i -pe 's/^(\s*)pattern\.fabricMeters140 = roundToPlaces\(pattern\.fabricMeters140 \+ ([0-9.]+), 1\);/$1pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140, 1);/' engine/src/hem.cpp
git diff --stat engine/src/hem.cpp | tail -1
rebuild
"$B/extend_check" >/dev/null 2>&1; echo "  extend_check EXIT=$?"
"$B/attach_check" >/dev/null 2>&1; echo "  attach_check EXIT=$?"
geri engine/src/hem.cpp; rebuild
echo; echo "================ BITTI — calisma agaci geri alindi ================"
git status --short | grep -v "^??" || echo "(takipli degisiklik YOK — temiz)"
