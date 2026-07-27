#!/bin/sh
# recipe_dress_golden_check: the v1.1 top kernel vs the REPO PIN subset.
# Expected = grep '|top/square/tunic/none.short|' of the PINNED
# engine/golden-reference.csv, OUTLINE lines only (51 lines: 3 bodies x
# [Top Front 9 + Top Back 8]). The fabric + marking exclusions are DECLARED
# in recipe_dress_golden_dump.cpp and RECETE-SPEC §6. Byte gate is valid for
# this style: the pinned subset measured byte-identical under
# -ffp-contract=off (probe 2026-07-28, §2.1 rule). Filtering a FRESH motor
# dump instead would be regen-vs-regen and is forbidden as evidence
# (DERSLER.md:12 + golden_check.sh header).
# Usage: recipe_dress_golden_check.sh <dump-binary> <pin-csv> <recipe-json>
set -u
DUMP_BIN="$1"
PIN_CSV="$2"
RECIPE="$3"

[ -x "$DUMP_BIN" ] || { echo "FAIL: recipe_dress_golden_dump binary missing: $DUMP_BIN"; exit 1; }
[ -f "$PIN_CSV" ] || { echo "FAIL: repo pin missing: $PIN_CSV"; exit 1; }
[ -f "$RECIPE" ] || { echo "FAIL: recipe document missing: $RECIPE"; exit 1; }

EXPECTED="$(mktemp /tmp/recipe_dress_golden_expected.XXXXXX.csv)"
ACTUAL="$(mktemp /tmp/recipe_dress_golden_actual.XXXXXX.csv)"
trap 'rm -f "$EXPECTED" "$ACTUAL"' EXIT

grep '|top/square/tunic/none.short|' "$PIN_CSV" | grep ',outline,' > "$EXPECTED"
[ -s "$EXPECTED" ] || { echo "FAIL: pin subset grep came back empty"; exit 1; }

"$DUMP_BIN" "$RECIPE" > "$ACTUAL" || { echo "FAIL: recipe_dress_golden_dump crashed"; exit 1; }

if cmp -s "$EXPECTED" "$ACTUAL"; then
    echo "recipe_dress_golden_check PASS: recipe top path byte-identical to the repo pin subset ($(wc -l < "$EXPECTED" | tr -d ' ') outline lines, top/square/tunic/none.short x 3 bodies)"
    exit 0
fi

echo "recipe_dress_golden_check FAIL: recipe path differs from the REPO PIN subset."
echo "  recipe: $(wc -l < "$ACTUAL" | tr -d ' ') lines   pin subset: $(wc -l < "$EXPECTED" | tr -d ' ') lines"
echo "  first differing lines:"
diff "$EXPECTED" "$ACTUAL" | head -8
echo ""
echo "The pin does not move for this test. Fix the interpreter or the recipe"
echo "document until the recipe path reproduces the PINNED motor output;"
echo "formulas are read FROM bodice.cpp/garment.cpp, never adjusted to force"
echo "bytes (RECETE-SPEC §2.1/§6)."
exit 1
