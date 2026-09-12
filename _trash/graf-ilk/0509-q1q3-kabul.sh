#!/usr/bin/env bash
# KARAR Q1+Q2+Q3 (2026-09-07) kabul kapisi. exit 0 = gecti, 1 = dustu.
set -uo pipefail
cd "$(dirname "$0")/../../.." || exit 1
node -e '
const s=require("fs").readFileSync("KOSU/0509-kosu.js","utf8");
const t=[
 ["Q1 stateIzinListesi var", /function stateIzinListesi/.test(s)],
 ["Q1 --kilit state listesiyle", /--kilit \$\{JSON.stringify\(_izin\)\}/.test(s)],
 ["Q1 --kilit-diff state listesiyle", /izin listesi \$\{JSON.stringify\(_izin\)\}/.test(s)],
 ["Q1 brief izin artik girdi degil", !/el\("basla", faz, \{ izin/.test(s) && !/el\(.basla., faz, \{ izin/.test(s)],
 ["Q3 ILAN_GECIS tablosu", /const ILAN_GECIS = \{/.test(s)],
 ["Q3 ilanGecisi --kilit oncesi", /await ilanGecisi\(alt\)[\s\S]{0,400}?el\(.basla., faz, \{ altAdim: alt \}\)/.test(s)],
 ["Q3 A2c: kapi.sh duser, CMakeLists acilir", /A2bIzinListesi[\s\S]{0,200}engine\/tests\/0509-kapi\.sh[\s\S]{0,200}A2cIzinListesi[\s\S]{0,80}engine\/CMakeLists\.txt/.test(s)],
];
let red=0; for (const [ad,g] of t) { console.log((g?"OK  ":"FAIL")+" "+ad); if(!g) red++ }
process.exit(red?1:0)' || exit 1
# tek kosum, tek okuma: grep -q'nun SIGPIPE'i pipefail ile yanlis dusuruyordu
h7=$(bash engine/tests/0509-kapi.sh --kendi-check 2>&1 | grep -E "^(OK|FAIL) +H7")
echo "$h7"
case "$h7" in OK*) ;; *) exit 1;; esac
echo "KABUL Q1+Q2+Q3 GECTI"
