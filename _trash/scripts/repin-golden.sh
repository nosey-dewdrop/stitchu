#!/bin/sh
# Declared golden re-pin. The ONLY sanctioned way to move the golden pin.
# Usage: scripts/repin-golden.sh "<declaration label>"
# Refuses to run without a label. After running, you MUST add a ledger entry
# to engine/GOLDEN-PIN.md (what changed, which commit, evidence, verification
# status) and have Damla's approval for any behavior change.
set -eu
cd "$(dirname "$0")/.."

LABEL="${1:-}"
if [ -z "$LABEL" ]; then
    echo "FAIL: a declaration label is required."
    echo "usage: scripts/repin-golden.sh \"<label, e.g. 'aldrich blok revizyonu (sha), paper-verified, muslin-pending'>\""
    exit 1
fi

[ -d engine/build ] || { echo "FAIL: engine/build missing, configure cmake first"; exit 1; }
cmake --build engine/build --target golden_dump >/dev/null
engine/build/golden_dump > /tmp/golden-repin.csv

OLD_LINES=$(wc -l < engine/golden-reference.csv | tr -d ' ')
NEW_LINES=$(wc -l < /tmp/golden-repin.csv | tr -d ' ')
if cmp -s /tmp/golden-repin.csv engine/golden-reference.csv; then
    echo "no-op: dump already byte-identical to pin ($OLD_LINES lines), nothing to re-pin"
    exit 0
fi

cp /tmp/golden-repin.csv engine/golden-reference.csv
NEW_MD5=$(md5 -q engine/golden-reference.csv 2>/dev/null || md5sum engine/golden-reference.csv | cut -d' ' -f1)
echo "re-pinned: $OLD_LINES -> $NEW_LINES lines, md5 $NEW_MD5"
echo "label: $LABEL"
echo ""
echo "NOW REQUIRED (the pin is not valid without these):"
echo "  1. add a dated ledger entry to engine/GOLDEN-PIN.md with this label,"
echo "     the divergence commit, a content diff summary (garments changed in"
echo "     place, not just line arithmetic), and evidence links."
echo "  2. Damla's explicit approval for the behavior change."
echo "  3. commit the csv + ledger together."
