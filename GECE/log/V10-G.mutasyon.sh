#!/usr/bin/env bash
# V10-G MUTASYON — kart §3. L2'ye EKLENEN HER YENİ KALIP için ayrı kasıtlı yalan.
# YASAK: web/ altına mutasyon yazmak. Mutasyon `git worktree` fikstüründe koşar
# (/tmp/v10g-mutasyon), kapıya `--dir=` ile gösterilir. Emsal: V10-B.mutasyon.sh.
# Geri alma `git checkout` ile DEĞİL, koşu başında alınan bayt kopyasıyla yapılır.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FIX=/tmp/v10g-mutasyon
GATE="$ROOT/engine/tests/landing_truth_check.mjs"
BASE="$ROOT/engine/tests/landing-truth-baseline.json"
TARGET="$FIX/web/index.html"
PRISTINE=/tmp/v10g-index-pristine.html
cp "$TARGET" "$PRISTINE"

run() { node "$GATE" --dir="$FIX/web" >/tmp/v10g.out 2>&1; echo $?; }
verdict() { grep -m1 '^HÜKÜM' /tmp/v10g.out; }
inject() {
  python3 - "$TARGET" "$1" <<'PY'
import sys
p, snip = sys.argv[1], sys.argv[2]
s = open(p, encoding='utf-8').read()
i = s.rindex('</body>')
open(p, 'w', encoding='utf-8').write(s[:i] + snip + '\n' + s[i:])
PY
}
revert() { cp "$PRISTINE" "$TARGET"; }

echo "# V10-G MUTASYON KANITI"
echo "# tarih: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "# fikstür: $FIX (git worktree @ $(git -C "$FIX" rev-parse --short HEAD)) — web/ DIŞINDA"
echo "# kapı: $ROOT/engine/tests/landing_truth_check.mjs (V10-G'nin 7 yeni L2 kalıbı ile)"
echo "# ana ağaç web/ durumu (KOŞU BAŞI):"
git -C "$ROOT" status --porcelain web/ | sed 's/^/#   /'
echo

cp "$BASE" /tmp/v10g-baseline-yedek.json
node "$GATE" --baseline --dir="$FIX/web" --note="MUTASYON FİKSTÜRÜ TABANI — geçici; koşu sonunda gerçek web/ tabanı geri kesilir" >/dev/null
echo "== 0. MUTASYONSUZ FİKSTÜR (taban fikstürden kesildi) =="
E=$(run); echo "exit=$E"; verdict; echo

names=(
  "from your body"
  "your seven measurements"
  "sized from your <x>"
  "not fixed sizes"
  "per body"
  "drafted per <non-size>"
  "your <olcu> measurement/girth"
)
snips=(
  '<p>Every panel is drafted from your body.</p>'
  '<p>The draft follows your seven measurements exactly.</p>'
  '<p>The cuff is sized from your arm.</p>'
  '<p>We cut to your shape, not fixed sizes.</p>'
  '<p>The block is recomputed per body.</p>'
  '<p>Each panel is drafted per customer.</p>'
  '<p>The neckline is cut to your own neck measurement.</p>'
)

for i in "${!names[@]}"; do
  echo "== KALIP: ${names[$i]} =="
  echo "-- sokulan yalan: ${snips[$i]}"
  inject "${snips[$i]}"
  E=$(run); echo "MUTASYONLU  exit=$E"; verdict
  grep -E "^  hit " /tmp/v10g.out | sed 's/^/   /'
  grep -E "^ +[0-9]+  (from your body|your seven|sized from|not fixed|per body|drafted per|your <)" /tmp/v10g.out | sed 's/^/   kanıt: /'
  revert
  E=$(run); echo "GERİ ALINDI exit=$E"; verdict
  if [ "$E" != "0" ]; then echo "   ⚠ GERİ ALINDIKTAN SONRA YEŞİLE DÖNMEDİ — kapı kararsız."; fi
  echo
done

# ── NEGATİF KONTROL: dürüst cümle kapıyı KIRMAMALI ─────────────────────────
echo "== NEGATİF KONTROL (yanlış pozitif avı) =="
NEG='<p>EU34 to EU48, re-drafted per size, refusals named.</p>'
echo "-- sokulan DÜRÜST cümle: $NEG"
inject "$NEG"
E=$(run); echo "DÜRÜST CÜMLE exit=$E"; verdict
if [ "$E" != "0" ]; then echo "   ⚠ DÜRÜST CÜMLE KAPIYI KIRDI — kalıp fazla geniş."; fi
revert
echo

node "$GATE" --baseline --note="V10-G: kapıdan kaçan MTM kalıpları eklendi" >/dev/null
echo "== taban gerçek web/ ağacına geri kesildi =="
node "$GATE" >/tmp/v10g.out 2>&1; echo "exit=$?"; verdict
echo
echo "# ana ağaç web/ durumu (KOŞU SONU):"
git -C "$ROOT" status --porcelain web/ | sed 's/^/#   /'
