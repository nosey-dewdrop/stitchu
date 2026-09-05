#!/usr/bin/env bash
# sinyal.sh — kosu isteklerle karsilastirilir. bash KOSU/sinyal.sh [hizli|tam]
#   hizli: muhur + enum tabani + kapanan fazlarin kabulu + madde defteri   (her faz sonu, her oturum basi)
#   tam  : + DEVIR.md KABUL (a)+(b) zinciri (ctest 27 + flat-olcum + pinler)  (faz kapatmadan once)
set -u; cd "$(git rev-parse --show-toplevel)" || exit 2
MOD=${1:-hizli}; K=0; echo "== SINYAL ($MOD) $(date '+%Y-%m-%d %H:%M') HEAD $(git rev-parse --short HEAD)"
echo "-- 1 muhur"; bash KOSU/muhur.sh kontrol || K=1
echo "-- 2 enum tabani (kat cikma dedektoru)"
d=$(bash engine/tests/enum_dallanma_check.sh --measure 2>/dev/null | grep -E '^cpp\.dallanma' | grep -oE '[0-9]+$'); t=$(python3 -c "import json;print(json.load(open('KOSU/sinyal.taban.json'))['cpp.dallanma'])")
if [ -z "${d:-}" ]; then echo "  KIRMIZI enum olcumu okunamadi"; K=1; elif [ "$d" -gt "$t" ]; then echo "  KIRMIZI cpp.dallanma $d > taban $t"; K=1; else echo "  YESIL cpp.dallanma $d (taban $t)"; fi
echo "-- 3 kapanan fazlarin kabulu (compounding error)"
for p in $(python3 -c "import json;print(' '.join(json.load(open('KOSU/sinyal.taban.json'))['kapanan']))"); do bash KOSU/kabul/$p.sh >/tmp/_k_$p.txt 2>&1 && echo "  YESIL $p" || { echo "  KIRMIZI $p"; grep KIRMIZI /tmp/_k_$p.txt | sed 's/^/    /'; K=1; }; done
if [ "$MOD" = tam ]; then echo "-- 4 DEVIR.md KABUL zinciri"
  cmake --build engine/build -j2 >/dev/null 2>&1 && ctest --test-dir engine/build -R 'golden|recipe|primitif|edit_locality|manken|kumas|parca|vocab|flatten|surface|enum_dallanma|body_check|gen_contract|bundle_fresh|graf_ir_check|graf_op_check|graf_dikilebilir_check' -j1 >/tmp/_ct.txt 2>&1 && echo "  YESIL ctest $(grep -oE '[0-9]+ tests passed' /tmp/_ct.txt | head -1)" || { echo "  KIRMIZI ctest"; grep -E 'Failed|\*\*\*' /tmp/_ct.txt | head -5 | sed 's/^/    /'; K=1; }
  python3 KOSU/flat-olcum.py >/tmp/_fo.txt 2>&1 && grep -q 'ESIK KONTROL OK' /tmp/_fo.txt && echo "  YESIL flat-olcum" || { echo "  KIRMIZI flat-olcum"; K=1; }
  node engine/tests/primitif_ifade_check.mjs >/dev/null 2>&1 && echo "  YESIL primitif_ifade" || { echo "  KIRMIZI primitif_ifade"; K=1; }
  if ! grep -q '"P4"' KOSU/sinyal.taban.json; then # P4'e kadar iki bilinen kirmizi sayi piniyle
    node KOSU/uret.mjs >/dev/null 2>&1; a=$(node engine/tests/flat_ayni_insan_check.mjs 2>&1 | grep -c 'FAIL  34 hukum kirmizi'); b=$(node engine/tests/cizim_giysi_mi.mjs 2>&1 | grep -c 'FAIL cizim_giysi_mi — 1 ihlal')
    [ "$a" = 1 ] && [ "$b" = 1 ] && echo "  YESIL bilinen kirmizi pinleri sabit (34 hukum, 1 ihlal)" || { echo "  KIRMIZI pin degisti: flat_ayni=$a cizim=$b (regresyon ya da ilan guncellenmeli)"; K=1; }
  fi
fi
echo "-- 5 madde defteri (KARARLAR.md)"; awk '/^## Madde defteri/,/^## Nerede/' KARARLAR.md | grep -E '^\| [0-9§]' | sed 's/^/  /'
echo "-- 6 nerede kaldik"; awk '/^## Nerede kaldık/,0' KARARLAR.md | tail -n +2 | grep -v '^$' | tail -3 | sed 's/^/  /'
[ $K -eq 0 ] && echo "== SINYAL: YESIL" || { echo "== SINYAL: KIRMIZI"; exit 1; }
