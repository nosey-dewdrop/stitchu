#!/usr/bin/env bash
# HAKEM MUTASYONLARI — F9. §3.8 md.3.
#
# Kurallar, hepsi kartın kendi yazdığı:
#  · commit'ten SONRA koşulur (borç 89)
#  · `git checkout --` KULLANILMAZ; `cp` ile yedeklenir
#  · her turun başında `git diff --numstat F9-oncesi..HEAD -- <dosya>` basılır;
#    BOŞ = ajan o dosyayı bu kartta HİÇ AÇMADI
#  · C++ mutasyonunda `cmake --build`in **rc**'si VE `build-wasm.sh`in rc'si
#    ve ikilinin `shasum`'u HER TURDA yazılır (borç 80). Bayat ikili = HÜKÜM YOK.
set -u
cd "$(git rev-parse --show-toplevel)"
LOG=GECE7/log/f9.hakem.mutasyon.txt
: > "$LOG"
say() { echo "$@" | tee -a "$LOG"; }
bar() { say ""; say "========================================"; say "$1"; say "========================================"; }

say "HEAD: $(git rev-parse --short HEAD)"
say "ağaç: $(git status --porcelain | wc -l | tr -d ' ') kirli iz (0 olmalı)"

numstat() {
  say "--- git diff --numstat F9-oncesi..HEAD -- $1 (BOŞ = ajan bu kartta HİÇ AÇMADI) ---"
  git diff --numstat F9-oncesi..HEAD -- "$1" | tee -a "$LOG"
  say "--- (bitti) ---"
}
run() { # run <ad> <komut...>
  local ad="$1"; shift
  "$@" >/tmp/hm.out 2>&1; local rc=$?
  say "   $ad -> EXIT $rc"
  [ $rc -ne 0 ] && grep -m4 -i "FAIL\|KIRMIZI\|Error" /tmp/hm.out | sed 's/^/       /' | tee -a "$LOG"
  return $rc
}
dist()   { shasum engine/dist/stitchu-engine.js 2>/dev/null | cut -c1-8; }
vendor() { shasum web/vendor/stitchu-engine.js  2>/dev/null | cut -c1-8; }

# ─────────────────────────────────────────────────────────────────────────────
bar "HM-1 — web/al-dene.html: künye YAZAR bağlantısı DÜZ METNE çevriliyor (kartın emrettiği mutasyon)"
numstat web/al-dene.html
cp web/al-dene.html /tmp/hm1.bak
perl -0pi -e "s/const src = document\.createElement\('a'\);/const src = document.createElement('span');/" web/al-dene.html
say "   diff satırı: $(git diff --numstat -- web/al-dene.html | awk '{print $1"+/"$2"-"}')"
run "al_dene_check      " node engine/tests/al_dene_check.mjs
run "vitrin_check       " node engine/tests/vitrin_check.mjs
cp /tmp/hm1.bak web/al-dene.html
run "al_dene_check (geri)" node engine/tests/al_dene_check.mjs

# ─────────────────────────────────────────────────────────────────────────────
bar "HM-2 — engine/tools/bugra/bugra-parity.mjs: topLength 'hip' -> 'tunic' (F8'in HM-3'ü, TEKRAR)"
numstat engine/tools/bugra/bugra-parity.mjs
cp engine/tools/bugra/bugra-parity.mjs /tmp/hm2.bak
perl -0pi -e "s/topLength: 'hip'/topLength: 'tunic'/g" engine/tools/bugra/bugra-parity.mjs
say "   diff satırı: $(git diff --numstat -- engine/tools/bugra/bugra-parity.mjs | awk '{print $1"+/"$2"-"}')"
run "bugra_parity_check " node engine/tests/bugra_parity_check.mjs
cp /tmp/hm2.bak engine/tools/bugra/bugra-parity.mjs
run "bugra_parity (geri)" node engine/tests/bugra_parity_check.mjs

# ─────────────────────────────────────────────────────────────────────────────
bar "HM-3 — contract/layers/shape-ratios.json: bir BEDEN düşürülüyor (vitrin sayısı BAYATLAR)"
numstat contract/layers/shape-ratios.json
cp contract/layers/shape-ratios.json /tmp/hm3.bak
node -e '
const f="contract/layers/shape-ratios.json";const fs=require("fs");
const j=JSON.parse(fs.readFileSync(f,"utf8"));
const k=Object.keys(j.sizes); delete j.sizes[k[k.length-1]];
fs.writeFileSync(f, JSON.stringify(j,null,2)+"\n");
console.log("beden", k.length, "->", Object.keys(j.sizes).length);' | tee -a "$LOG"
say "   diff satırı: $(git diff --numstat -- contract/layers/shape-ratios.json | awk '{print $1"+/"$2"-"}')"
run "vitrin_check       " node engine/tests/vitrin_check.mjs
cp /tmp/hm3.bak contract/layers/shape-ratios.json
run "vitrin_check (geri)" node engine/tests/vitrin_check.mjs

# ─────────────────────────────────────────────────────────────────────────────
bar "HM-4 — vision/eval/credits.json: bir fotoğrafın sha256'sı tek karakter değişiyor"
numstat vision/eval/credits.json
cp vision/eval/credits.json /tmp/hm4.bak
node -e '
const f="vision/eval/credits.json";const fs=require("fs");
const j=JSON.parse(fs.readFileSync(f,"utf8"));
const k=Object.keys(j)[0];
j[k].sha256 = (j[k].sha256[0]==="a"?"b":"a") + j[k].sha256.slice(1);
fs.writeFileSync(f, JSON.stringify(j,null,2)+"\n");
console.log("bozulan künye:", k);' | tee -a "$LOG"
say "   diff satırı: $(git diff --numstat -- vision/eval/credits.json | awk '{print $1"+/"$2"-"}')"
run "al_dene_check      " node engine/tests/al_dene_check.mjs
cp /tmp/hm4.bak vision/eval/credits.json
run "al_dene_check (geri)" node engine/tests/al_dene_check.mjs

# ─────────────────────────────────────────────────────────────────────────────
bar "HM-5 — engine/src/bodice.cpp: BOAT yaka eğrisinin kontrol noktası 0.85 -> 0.65 (GERÇEK GEOMETRİ)"
numstat engine/src/bodice.cpp
say "ÖNCE:  dist $(dist)  vendor $(vendor)"
cp engine/src/bodice.cpp /tmp/hm5.bak
perl -0pi -e "s/\{w \* 0\.85, d \* 0\.5\}/{w * 0.65, d * 0.5}/" engine/src/bodice.cpp
say "   diff satırı: $(git diff --numstat -- engine/src/bodice.cpp | awk '{print $1"+/"$2"-"}')"
cmake --build engine/build -j8 >/tmp/hm5.build 2>&1; say "   cmake --build rc=$?"
bash engine/build-wasm.sh >/tmp/hm5.wasm 2>&1;    say "   build-wasm   rc=$?"
say "SONRA: dist $(dist)  vendor $(vendor)   <-- KIMILDADI MI?"
run "golden/dxf: ctest -R 'golden|dxf_check|flat_convention'" \
    ctest --test-dir engine/build -R "golden|dxf_check|flat_convention" --output-on-failure
run "hedef_kosu         " node engine/tests/hedef_kosu.mjs
cp /tmp/hm5.bak engine/src/bodice.cpp
cmake --build engine/build -j8 >/tmp/hm5.build2 2>&1; say "   geri: cmake --build rc=$?"
bash engine/build-wasm.sh >/tmp/hm5.wasm2 2>&1;      say "   geri: build-wasm   rc=$?"
say "GERİ:  dist $(dist)  vendor $(vendor)"
run "golden/dxf (geri)  " ctest --test-dir engine/build -R "golden|dxf_check|flat_convention" --output-on-failure

bar "AĞAÇ GERİ ALINDI MI?"
git status --porcelain | tee -a "$LOG"
say "(yalnız takipsiz patterns_real/ kalemleri ve bu log görünmeli)"
