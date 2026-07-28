#!/bin/sh
# bugra_bridge_check — tracer→reçete köprüsü v1 mandalı (PIPELINE Aşama 3,
# 2026-07-28). Üç iddia, üçü de çalıştırma kanıtıyla:
#   1. Yeniden üretim: ring2recipe.py pinli trace dökümünden reçete+fit+defter
#      üretir; İKİ koşu bayt-özdeş VE repoya commit edilen üçlüyle bayt-özdeş
#      (commit edilen dosya = aracın ürettiği dosya, elle rötuş yok).
#   2. Determinizm: reçete yolu çizimi (recipe-json-dump) iki koşu bayt-özdeş.
#   3. Tolerans mandalı: ring-compare gate'leri (bbox ±%1.3, çevre vs
#      pens-kapalı vektör ±%1.3, nokta-mesafe regresyon kilidi) — aşım = FAIL;
#      karşılaştırma çıktısı da iki koşu bayt-özdeş.
# kullanım: bugra_bridge_check.sh <recipe-json-dump> <repo-kökü>
set -eu
BIN="$1"
ROOT="$2"
OUT="${TMPDIR:-/tmp}/bugra-bridge-check.$$"
mkdir -p "$OUT"
trap 'rm -rf "$OUT"' EXIT

TR="$ROOT/patterns_real/geometry/ring-trace-locket-front-38.json"
GEOM="$ROOT/patterns_real/geometry/geometry-full.json"
TOOLS="$ROOT/engine/tools/tracer"

# 1) yeniden üretim ×2 + pin karşılaştırması
python3 "$TOOLS/ring2recipe.py" "$TR" "$GEOM" "$BIN" \
    "$OUT/recipe1.json" "$OUT/fit1.json" "$OUT/defter1.txt" > "$OUT/gen1.log"
python3 "$TOOLS/ring2recipe.py" "$TR" "$GEOM" "$BIN" \
    "$OUT/recipe2.json" "$OUT/fit2.json" "$OUT/defter2.txt" > "$OUT/gen2.log"
cmp "$OUT/recipe1.json" "$OUT/recipe2.json"
cmp "$OUT/fit1.json" "$OUT/fit2.json"
cmp "$OUT/defter1.txt" "$OUT/defter2.txt"
cmp "$OUT/recipe1.json" "$ROOT/recipes/bugra-locket-top-front-38.json"
cmp "$OUT/fit1.json" "$ROOT/reports/gate/kopru-v1/fit-locket-front-38.json"
cmp "$OUT/defter1.txt" "$ROOT/reports/gate/kopru-v1/fit-defteri-locket-front-38.txt"
echo "1) yeniden uretim: 2 kosu + repo pini bayt-ozdes"

# 2) çizim determinizmi (fit gövdesi + extend fit dosyasından, gizli eşleme yok)
BODYARG=$(python3 -c "
import json,sys
f=json.load(open('$OUT/fit1.json'))
b=f['bodyCM']
print('custom:'+','.join(str(b[k]) for k in ['bustCM','waistCM','hipCM','shoulderCM','backLengthCM','armLengthCM','neckCM']))")
EXT=$(python3 -c "
import json;print(json.load(open('$OUT/fit1.json'))['params']['extendMM'])")
"$BIN" "$OUT/recipe1.json" "$BODYARG" "$EXT" > "$OUT/draft1.json"
"$BIN" "$OUT/recipe1.json" "$BODYARG" "$EXT" > "$OUT/draft2.json"
cmp "$OUT/draft1.json" "$OUT/draft2.json"
echo "2) recete yolu cizimi: 2 kosu bayt-ozdes"

# 3) tolerans mandalı ×2 (gate aşımı = python exit 1 = test FAIL)
python3 "$TOOLS/ring-compare.py" "$TR" "$OUT/draft1.json" "Top Front" --gate > "$OUT/cmp1.txt"
python3 "$TOOLS/ring-compare.py" "$TR" "$OUT/draft1.json" "Top Front" --gate > "$OUT/cmp2.txt"
cmp "$OUT/cmp1.txt" "$OUT/cmp2.txt"
cat "$OUT/cmp1.txt"
echo "3) tolerans mandali: tum gate'ler GECTI (yukarida sayilarla)"
echo "bugra_bridge_check: PASS"
