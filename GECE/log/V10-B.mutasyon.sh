#!/usr/bin/env bash
# V10-B MUTASYON — kart §4.5. Beş denetimin HER BİRİ için ayrı kasıtlı yalan.
# YASAK: web/ altına tek bayt yazmak. Bu yüzden mutasyon `git worktree` fikstüründe
# (/tmp/v10b-mutasyon) koşar; kapıya `--dir=` parametresi bunun için eklendi.
# Ana çalışma ağacına HİÇ dokunulmaz (paralel işçi V10-C orada yazıyor).
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FIX=/tmp/v10b-mutasyon
GATE="$ROOT/engine/tests/landing_truth_check.mjs"
BASE="$ROOT/engine/tests/landing-truth-baseline.json"
TARGET="$FIX/web/index.html"

run() { node "$GATE" --dir="$FIX/web" >/tmp/v10b.out 2>&1; echo $?; }
verdict() { grep -m1 '^HÜKÜM' /tmp/v10b.out; }

inject() {  # $1 = </body> önüne sokulacak HTML
  python3 - "$TARGET" "$1" <<'PY'
import sys
p, snip = sys.argv[1], sys.argv[2]
s = open(p, encoding='utf-8').read()
i = s.rindex('</body>')
open(p, 'w', encoding='utf-8').write(s[:i] + snip + '\n' + s[i:])
PY
}
revert() { git -C "$FIX" checkout -- web/index.html; }

echo "# V10-B MUTASYON KANITI"
echo "# tarih: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "# fikstür: $FIX (git worktree @ $(git -C "$FIX" rev-parse --short HEAD)) — web/ DIŞINDA"
echo "# ana ağaç durumu (mutasyon boyunca değişmemeli): git status --porcelain web/ ->"
git -C "$ROOT" status --porcelain web/ | sed 's/^/#   /' ; echo "#   (yukarısı boşsa V10-C'nin işi de bozulmadı demektir)"
echo

# ── 0. Fikstürü TABAN olarak kes: mutasyonsuz hâl YEŞİL olmalı ──────────────
cp "$BASE" /tmp/v10b-baseline-yedek.json 2>/dev/null || true
node "$GATE" --baseline --dir="$FIX/web" --note="MUTASYON FİKSTÜRÜ TABANI — geçici, koşu sonunda gerçek web/ tabanı geri kesilir" >/dev/null
echo "== 0. MUTASYONSUZ FİKSTÜR (taban fikstürden kesildi) =="
E=$(run); echo "exit=$E"; verdict; echo

for M in L1 L2 L3 L4 L5; do
  case $M in
    L1) SNIP='<p>Every seam on this page matches to 0.25 mm across all sizes.</p>' ;;
    L2) SNIP='<p>Drafted to your own measurements, always, with no fixed sizes.</p>' ;;
    L3) SNIP='<section data-vision="1"><p>The Android app generates full size runs and produces print packs.</p></section>' ;;
    L4) SNIP='<a href="v10b-hayalet-sayfa.html">bir yere gitmeyen link</a>' ;;
    L5) SNIP='<p>Now drafting EU54 and EU56 as well.</p>' ;;
  esac
  echo "== $M MUTASYONU =="
  echo "-- sokulan yalan: $SNIP"
  inject "$SNIP"
  E=$(run); echo "MUTASYONLU  exit=$E"; verdict
  grep -E "^  (sayı\+birim|hit |data-vision|  koşuldu|kaçak)" /tmp/v10b.out | sed 's/^/   /'
  grep -E "IHLAL|USTKUME|KACAK.*EU5[46]|0\.25 mm|your own measurements" /tmp/v10b.out | head -4 | sed 's/^/   kanıt: /'
  revert
  E=$(run); echo "GERİ ALINDI exit=$E"; verdict
  if [ "$E" != "0" ]; then echo "   ⚠ GERİ ALINDIKTAN SONRA YEŞİLE DÖNMEDİ — kapı kararsız."; fi
  echo
done

# ── taban geri: gerçek web/ ağacına karşı yeniden kes ───────────────────────
node "$GATE" --baseline --note="V10-B ilk kesim: canlı web/ ağacı, 2026-08-25" >/dev/null
echo "== taban gerçek web/ ağacına geri kesildi =="
node "$GATE" >/tmp/v10b.out 2>&1; echo "exit=$?"; verdict
echo
echo "# ana ağaç web/ durumu (koşu SONU):"
git -C "$ROOT" status --porcelain web/ | sed 's/^/#   /'; echo "#   (boşsa web/'e tek bayt yazılmadı)"
