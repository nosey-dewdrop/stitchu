#!/bin/bash
# vitrin-build.sh — F10-vitrin İŞ 1: landing'in SAYILARINI ve ÇİZİMLERİNİ
# motora sorup sayfaya basan tek build adımı. Elle sayı yazılmaz; bu script
# koşar, iki üreteç sayfayı bugünkü koşuya çeker, kapı da aynı üreteçleri
# yeniden koşturup sapmayı KIRMIZI yakar.
#
#   1. engine/tools/gen-landing-motor.mjs — engine.draftJSON'dan parça/kumaş/
#      adım sayıları + web/assets/motor/ altına kalıp ve flat SVG'leri
#      (data-motor öğeleri).
#   2. engine/tools/gen-vitrin.mjs — hedef_kosu ölçümleri (data-v öğeleri).
#
# Kabul: node engine/tests/vitrin_gercek_check.mjs (ctest: vitrin_gercek_check)
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== vitrin-build: motor sayilari + cizimler (gen-landing-motor) =="
node engine/tools/gen-landing-motor.mjs

echo "== vitrin-build: hedef_kosu sayilari (gen-vitrin) =="
node engine/tools/gen-vitrin.mjs

echo "== vitrin-build: kapi (vitrin_gercek_check) =="
node engine/tests/vitrin_gercek_check.mjs
