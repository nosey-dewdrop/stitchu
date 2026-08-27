#!/usr/bin/env bash
# GECE7 / F7 — AJAN MUTASYONLARI. f6.hakem.mutasyon.sh'ten kopyalandı (kart §NOTLAR).
#
# KURAL: her turun başında `git diff --numstat F7-oncesi..HEAD` basılır (mutasyon
# ÇALIŞMA AĞACINDA yapılır, commit'lenmez → numstat BOŞ olmalı), `shasum` ikilinin
# gerçekten kımıldadığını gösterir, sonra kapı koşar ve mutasyon GERİ ALINIR.
# ⚠ İkili kımıldasa bile ölçülen sayı kımıldamayabilir — o da "HÜKÜM YOK" (HM-1/HM-4).
set -u
cd "$(dirname "$0")/../.." || exit 1
R="$(pwd)"
B="$R/engine/build"

tur() { echo; echo "================ $1 ================"; }
numstat() {
  echo "--- git diff --numstat F7-oncesi..HEAD  (mutasyon ÇALIŞMA AĞACINDA, commit YOK) ---"
  git diff --numstat F7-oncesi..HEAD -- "$1" || true
  echo "--- (yukarısı BOŞSA mutasyon commit'lenmemiştir, doğru) ---"
}
rebuild() { cmake --build "$B" -j8 >/dev/null 2>&1; }

# ---------------------------------------------------------------- M1
tur "M1 — engine/src/patternedit.cpp : op.extend'in mm'sini YUT (hem yarısı kadar taşı)"
numstat engine/src/patternedit.cpp
shasum "$B/extend_check"
perl -i -pe 's/^    hem\.to\.y \+= mm;$/    hem.to.y += mm * 0.5;/' engine/src/patternedit.cpp
grep -n "hem.to.y" engine/src/patternedit.cpp
rebuild
shasum "$B/extend_check"
"$B/extend_check" >/dev/null 2>&1; echo "extend_check EXIT=$?"
"$B/attach_check" >/dev/null 2>&1; echo "attach_check EXIT=$?"
git checkout -- engine/src/patternedit.cpp; rebuild
"$B/extend_check" >/dev/null 2>&1; echo "geri alindi, extend_check EXIT=$?"

# ---------------------------------------------------------------- M2
tur "M2 — engine/src/patternedit.cpp : op.attach'in ÇENTİĞİNİ ELLE YAZ (kutu ortası)"
numstat engine/src/patternedit.cpp
shasum "$B/attach_check"
perl -i -pe 's/^                crossNotch\(pattern\.pieces\[hi\]\.notches, anchor\);$/                { const Rect _b = boundingBox({PathCommand::move(from), pattern.pieces[hi].commands[h]}); crossNotch(pattern.pieces[hi].notches, Point{_b.x + _b.width \/ 2, _b.y + _b.height \/ 2}); }/' engine/src/patternedit.cpp
grep -n "crossNotch(pattern" engine/src/patternedit.cpp
rebuild
shasum "$B/attach_check"
"$B/attach_check" >/dev/null 2>&1; echo "attach_check EXIT=$?"
"$B/extend_check" >/dev/null 2>&1; echo "extend_check EXIT=$?"
git checkout -- engine/src/patternedit.cpp; rebuild
"$B/attach_check" >/dev/null 2>&1; echo "geri alindi, attach_check EXIT=$?"

# ---------------------------------------------------------------- M3
tur "M3 — engine/src/validator.cpp : BORÇ 86'nın tabanını geri al (zemin yine 0.01)"
numstat engine/src/validator.cpp
shasum "$B/../dist/stitchu-engine.js" 2>/dev/null || shasum "$R/engine/dist/stitchu-engine.js"
perl -i -pe 's/^    const double easeFloor = std::max\(0\.0, std::min\(capEaseMin, capEase\)\);$/    const double easeFloor = capEaseMin;/' engine/src/validator.cpp
perl -i -pe 's/^    const bool convergedOnTarget = std::fabs\(ease - capEase\) <= easeSlack;$/    const bool convergedOnTarget = false;/' engine/src/validator.cpp
grep -n "easeFloor =\|convergedOnTarget =" engine/src/validator.cpp
bash engine/build-wasm.sh >/dev/null 2>&1
shasum "$R/engine/dist/stitchu-engine.js"
node engine/tests/indir_check.mjs >/dev/null 2>&1; echo "indir_check EXIT=$?"
git checkout -- engine/src/validator.cpp
bash engine/build-wasm.sh >/dev/null 2>&1; rebuild
shasum "$R/engine/dist/stitchu-engine.js"
node engine/tests/indir_check.mjs >/dev/null 2>&1; echo "geri alindi, indir_check EXIT=$?"

# ---------------------------------------------------------------- M4
tur "M4 — engine/tests/fabric_catalog_check.cpp DEĞİL, MOTOR: borç 88'in oyuk kolunu aç"
echo "Kapak yerine OYUĞU kumaş ekseninden kopar (bodice.cpp armhole ease'i sabitle)."
numstat engine/src/bodice.cpp
shasum "$B/fabric_catalog_check"
perl -i -pe 's/^inline double chestEaseFor\(const FabricAxis& f\) \{ return FabricBand::easeFor\(FabricBand::Girth::Chest, f\); \}$/inline double chestEaseFor(const FabricAxis\& f) { (void)f; return chestEase; }/' engine/src/bodice.hpp
grep -n "chestEaseFor" engine/src/bodice.hpp
rebuild
shasum "$B/fabric_catalog_check"
"$B/fabric_catalog_check" 2>&1 | grep -E "FAIL|checks," || true
"$B/fabric_catalog_check" >/dev/null 2>&1; echo "fabric_catalog_check EXIT=$?"
git checkout -- engine/src/bodice.hpp; rebuild
"$B/fabric_catalog_check" >/dev/null 2>&1; echo "geri alindi, fabric_catalog_check EXIT=$?"

# ---------------------------------------------------------------- M5
tur "M5 — contract/primitives-v1.json : op.extend'in kapısını ÖDÜNÇ AL (K35)"
numstat contract/primitives-v1.json
perl -i -pe 's/"motorda_kapi": "extend_check"/"motorda_kapi": "geometry"/' contract/primitives-v1.json
grep -n '"motorda_kapi": "geometry"' contract/primitives-v1.json
node engine/tests/expressability_check.mjs 2>&1 | grep -E "FAIL|H8-İFADE ="
node engine/tests/expressability_check.mjs >/dev/null 2>&1; echo "expressability_check EXIT=$?"
git checkout -- contract/primitives-v1.json
node engine/tests/expressability_check.mjs 2>&1 | grep -E "H8-İFADE ="
node engine/tests/expressability_check.mjs >/dev/null 2>&1; echo "geri alindi, expressability_check EXIT=$?"

echo; echo "================ SON: git status ================"
git status --porcelain -- engine/ contract/ web/ | head -20
