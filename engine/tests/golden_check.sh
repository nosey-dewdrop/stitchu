#!/bin/sh
# golden_check: the REAL golden test. Diffs a fresh golden_dump against the
# REPO PIN engine/golden-reference.csv. Regen-vs-regen is NOT a golden check
# and is forbidden as evidence (2026-07-19 forensic lesson).
# Usage: golden_check.sh <golden_dump-binary> <pin-csv> <pin-ledger>
set -u
DUMP_BIN="$1"
PIN_CSV="$2"
LEDGER="$3"

[ -x "$DUMP_BIN" ] || { echo "FAIL: golden_dump binary missing: $DUMP_BIN"; exit 1; }
[ -f "$PIN_CSV" ] || { echo "FAIL: repo pin missing: $PIN_CSV"; exit 1; }

OUT="$(mktemp /tmp/golden_check.XXXXXX.csv)"
trap 'rm -f "$OUT"' EXIT
"$DUMP_BIN" > "$OUT" || { echo "FAIL: golden_dump crashed"; exit 1; }

if cmp -s "$OUT" "$PIN_CSV"; then
    echo "golden_check PASS: dump byte-identical to repo pin ($(wc -l < "$PIN_CSV" | tr -d ' ') lines)"
    exit 0
fi

echo "golden_check FAIL: engine output differs from the REPO PIN ($PIN_CSV)."
echo "  dump: $(wc -l < "$OUT" | tr -d ' ') lines   pin: $(wc -l < "$PIN_CSV" | tr -d ' ') lines"
echo "  first differing lines:"
diff "$PIN_CSV" "$OUT" | head -8
echo ""
echo "Two honest ways out, nothing else:"
echo "  1. UNINTENDED change -> fix the engine until this test passes."
echo "  2. INTENDED behavior change -> DECLARED re-pin: run scripts/repin-golden.sh"
echo "     with a declaration label, add the ledger entry ($LEDGER),"
echo "     and get Damla's approval BEFORE pinning."
echo "Comparing two fresh dumps to each other (regen-vs-regen) is not a golden"
echo "check and must never be reported as one."
exit 1
