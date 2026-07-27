#!/bin/sh
# recipe_golden_check: Gate 1(b) — the recipe path vs the REPO PIN subset.
# Expected = grep '|skirt/aLine/' of the PINNED engine/golden-reference.csv
# (288 lines: 3 bodies x 3 lengths, fabric line + Front/Back/Waistband).
# Filtering a FRESH motor dump instead would be regen-vs-regen and is
# forbidden as evidence (DERSLER.md:12 + golden_check.sh header).
# Usage: recipe_golden_check.sh <recipe_golden_dump-binary> <pin-csv> <recipe-json>
set -u
DUMP_BIN="$1"
PIN_CSV="$2"
RECIPE="$3"

[ -x "$DUMP_BIN" ] || { echo "FAIL: recipe_golden_dump binary missing: $DUMP_BIN"; exit 1; }
[ -f "$PIN_CSV" ] || { echo "FAIL: repo pin missing: $PIN_CSV"; exit 1; }
[ -f "$RECIPE" ] || { echo "FAIL: recipe document missing: $RECIPE"; exit 1; }

EXPECTED="$(mktemp /tmp/recipe_golden_expected.XXXXXX.csv)"
ACTUAL="$(mktemp /tmp/recipe_golden_actual.XXXXXX.csv)"
trap 'rm -f "$EXPECTED" "$ACTUAL"' EXIT

grep '|skirt/aLine/' "$PIN_CSV" > "$EXPECTED"
[ -s "$EXPECTED" ] || { echo "FAIL: pin subset grep '|skirt/aLine/' came back empty"; exit 1; }

"$DUMP_BIN" "$RECIPE" > "$ACTUAL" || { echo "FAIL: recipe_golden_dump crashed"; exit 1; }

if cmp -s "$EXPECTED" "$ACTUAL"; then
    echo "recipe_golden_check PASS: recipe path byte-identical to the repo pin subset ($(wc -l < "$EXPECTED" | tr -d ' ') lines, skirt/aLine x 3 bodies x 3 lengths)"
    exit 0
fi

echo "recipe_golden_check FAIL: recipe path differs from the REPO PIN subset."
echo "  recipe: $(wc -l < "$ACTUAL" | tr -d ' ') lines   pin subset: $(wc -l < "$EXPECTED" | tr -d ' ') lines"
echo "  first differing lines:"
diff "$EXPECTED" "$ACTUAL" | head -8
echo ""
echo "The pin does not move for this test. Fix the interpreter or the recipe"
echo "document until the recipe path reproduces the PINNED motor output;"
echo "formulas are read FROM skirt.cpp, never adjusted to force bytes"
echo "(RECETE-SPEC §2.1). If the pin itself must move, that is golden_check's"
echo "declared re-pin protocol, not this test's."
exit 1
