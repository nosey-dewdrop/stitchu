#!/bin/bash
# f9.mutasyon.sh — F9'un mutasyon turu.
#
# ⚠ BORÇ 89: bu betik `git checkout --` KULLANMAZ. Her dosya `cp` ile yedeklenir
# ve `cp` ile geri konur, ve tur COMMIT'TEN SONRA koşar.
# ⚠ F7 HAKEMİNİN TUZAĞI: `cmake --build` sessizce rc=2 ile düşebilir ve BAYAT bir
# ikili ölçersin. Her turda dönüş kodu basılır. "Bayat ikili = HÜKÜM YOK."
# ⚠ Her turun başında `git diff --numstat HEAD` basılır: BOŞ olması, o dosyanın
# bu kartta hiç açılmadığının kanıtıdır.
set -uo pipefail
cd "$(dirname "$0")/../.."
BAK="${TMPDIR:-/tmp}/f9-mutasyon-yedek"
mkdir -p "$BAK"

say() { printf '\n========================================\n%s\n========================================\n' "$1"; }
yedekle() { cp "$1" "$BAK/$(echo "$1" | tr '/' '_')"; }
geri()    { cp "$BAK/$(echo "$1" | tr '/' '_')" "$1"; }

numstat() {
  echo "--- git diff --numstat HEAD -- $1 (BOŞ = bu kartta hiç açılmadı) ---"
  git diff --numstat HEAD -- "$1" | sed 's/^/    /'
  echo "--- (bitti) ---"
}
kapi() { local ad="$1"; shift; "$@" > "$BAK/gate.log" 2>&1; echo "   $ad -> EXIT $?"; }

echo "HEAD: $(git rev-parse --short HEAD)"
echo "ağaç: $(git status --porcelain -- engine web contract | grep -vc '^??' || true) kirli iz (0 olmalı)"

# ── M1 ─────────────────────────────────────────────────────────────────────
# BORÇ 99'UN KAPISI. Fotoğrafçının adındaki bağlantıyı kaldır. Veri hiç
# değişmiyor — `kunye.commons_page` yerinde duruyor — yani ESKİ kol (verinin
# künye taşıdığını ölçen `/^https?:/` kontrolü) bunu GÖREMEZ. Gören tek şey
# sayfanın bastığı ağacı ölçen yeni kol olabilir.
say "M1 — web/al-dene.html: künyedeki kaynak bağlantısı düşürülüyor (veri EL DEĞMEDEN)"
numstat web/al-dene.html
yedekle web/al-dene.html
perl -i -pe "s/^\s*src\.href = ex\.kunye\.commons_page;\n//" web/al-dene.html
echo "   diff satırı: $(git diff --numstat -- web/al-dene.html | awk '{print $1"+/"$2"-"}')"
kapi "al_dene_check      " node engine/tests/al_dene_check.mjs
kapi "vitrin_check       " node engine/tests/vitrin_check.mjs
geri web/al-dene.html
kapi "al_dene_check (geri)" node engine/tests/al_dene_check.mjs

# ── M2 ─────────────────────────────────────────────────────────────────────
# HAKEMİN HM-3'Ü, BİREBİR. `numstat` BOŞ: bu dosyayı bu kartta hiç açmadım.
# F8'de bu mutasyon kapıyı YEŞİL bırakıyordu (borç 98).
say "M2 — engine/tools/bugra/bugra-parity.mjs: topLength 'hip' -> 'tunic' (HAKEMİN HM-3'Ü)"
numstat engine/tools/bugra/bugra-parity.mjs
yedekle engine/tools/bugra/bugra-parity.mjs
perl -i -pe "s/topLength: 'hip', cupSeam: 1/topLength: 'tunic', cupSeam: 1/" engine/tools/bugra/bugra-parity.mjs
echo "   diff satırı: $(git diff --numstat -- engine/tools/bugra/bugra-parity.mjs | awk '{print $1"+/"$2"-"}')"
kapi "bugra_parity_check " node engine/tests/bugra_parity_check.mjs
geri engine/tools/bugra/bugra-parity.mjs
kapi "bugra_parity (geri)" node engine/tests/bugra_parity_check.mjs

# ── M3 ─────────────────────────────────────────────────────────────────────
# BAYAT SAYI. Sayfadaki üretilmiş sayıyı ELLE düzelt — kartın tarif ettiği
# tam kusur ("1 of 5 exact" haftalarca canlı kaldı).
say "M3 — web/index.html: üretilmiş sayı ELLE 10/10 -> 9/10 yapılıyor"
yedekle web/index.html
perl -i -pe 's/(data-v="H1\.deger">)10\/10(<)/${1}9\/10${2}/' web/index.html
echo "   diff satırı: $(git diff --numstat -- web/index.html | awk '{print $1"+/"$2"-"}')"
kapi "vitrin_check       " node engine/tests/vitrin_check.mjs
kapi "landing_truth_check" node engine/tests/landing_truth_check.mjs
geri web/index.html

# ── M4 ─────────────────────────────────────────────────────────────────────
say "M4 — web/index.html: K45'in yasak kelimesi geri konuyor"
yedekle web/index.html
perl -i -pe 's/A small vocabulary, a large space of garments\./Limited words, unlimited garments./' web/index.html
echo "   diff satırı: $(git diff --numstat -- web/index.html | awk '{print $1"+/"$2"-"}')"
kapi "vitrin_check       " node engine/tests/vitrin_check.mjs
geri web/index.html

# ── M5 ─────────────────────────────────────────────────────────────────────
# §4C md.7. Vitrinden satın alınmış kalıba bir bağlantı çıkarılıyor.
say "M5 — web/index.html: vitrinden patterns_real/ altına bir bağlantı"
yedekle web/index.html
perl -i -pe 's{<a class="chip" href="#photo"}{<a class="chip" href="patterns_real/geometry/geometry-full.json"}' web/index.html
echo "   diff satırı: $(git diff --numstat -- web/index.html | awk '{print $1"+/"$2"-"}')"
kapi "vitrin_check       " node engine/tests/vitrin_check.mjs
geri web/index.html

# ── M6 ─────────────────────────────────────────────────────────────────────
# C++ TARAFI. `numstat` BOŞ olan bir motor dosyası; borç 80 gereği ikilinin
# KIMILDADIĞI shasum ile gösterilir, yoksa cırcır bayat ikiliyi ölçer.
say "M6 — engine/src/dxf.cpp: dikiş katmanı (L14) sessizce iç çizgi katmanına (L8) çevriliyor"
numstat engine/src/dxf.cpp
yedekle engine/src/dxf.cpp
perl -i -pe 's/Layers::kSeamline/Layers::kInternal/g' engine/src/dxf.cpp
echo "   diff satırı: $(git diff --numstat -- engine/src/dxf.cpp | awk '{print $1"+/"$2"-"}')"
cmake --build engine/build -j8 > "$BAK/build.log" 2>&1; echo "   cmake --build rc=$?"
bash engine/build-wasm.sh > "$BAK/wasm.log" 2>&1
echo "   build-wasm rc=$?  dist $(shasum engine/dist/stitchu-engine.js | cut -c1-8)  vendor $(shasum web/vendor/stitchu-engine.js | cut -c1-8)"
kapi "dxf_check          " bash engine/tests/dxf_check.sh
kapi "indir_check        " node engine/tests/indir_check.mjs
geri engine/src/dxf.cpp
cmake --build engine/build -j8 > "$BAK/build.log" 2>&1; echo "   geri: cmake --build rc=$?"
bash engine/build-wasm.sh > "$BAK/wasm.log" 2>&1
echo "   geri: build-wasm rc=$?  dist $(shasum engine/dist/stitchu-engine.js | cut -c1-8)  vendor $(shasum web/vendor/stitchu-engine.js | cut -c1-8)"
kapi "dxf_check   (geri) " bash engine/tests/dxf_check.sh

say "AĞAÇ GERİ ALINDI MI?"
git status --porcelain -- engine web contract | grep -v '^??' || echo "   temiz — hiçbir mutasyon ağaçta kalmadı"
