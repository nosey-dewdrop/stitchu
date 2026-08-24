#!/bin/bash
# vocab_source_check.sh — THE VISION WORD LIST IS A BUILD PRODUCT (§6/X madde c).
#
# WHY THIS FILE EXISTS. vision-student/vocab.py opened with the sentence "The
# classes MUST stay identical to the teacher schema", and nothing in the repo
# checked it. Measured 2026-08-24 against engine/vocab.json, the authority
# (GECE/V2-R.md §3.3), the sentence was false on three of its four lists:
#   neckline    7 classes, `cowl` and `pussyBow` missing
#   garment     ["skirt","dress","top","trousers","other"] — the last two exist
#               on NO engine axis and in NO resolution-table entry
#   skirtStyle  5 classes, `gore` missing
# A third hand-copied word list is the same defect the repo already closed twice
# (vocab.gen.* and garment-spec-v2.schema.json): a derivative kept in sync by
# hand is kept in sync until the day nobody looks.
#
# WHAT IT ENFORCES — regen-and-diff, the Go / Kubernetes / Bazel pattern
# (GECE/V2-R.md §2.2, and the precedent already in this tree,
# engine/tools/specv2-check.mjs:46 over engine/tools/gen-spec-v2.mjs). There is
# no threshold to pick here and that is the point: the tolerance is ZERO BYTES.
#   1. the generator runs and produces something
#   2. it is DETERMINISTIC — two runs, byte-identical (gen-vocab.mjs:3 claims
#      this for its own output and nothing has ever checked the claim)
#   3. the file on disk equals that output, byte for byte
#   4. the _UNRESOLVED block is still telling the truth
#
# WHY IT WRITES TO A TEMP DIR. The k8s move (hack/lib/verify-generated.sh): the
# gate may not modify the tree it is judging. Our other generators write
# straight into the working tree, so a check that regenerates in place would
# fix the drift it exists to report and then pass. This one passes --out into
# mktemp -d and diffs; run it on a dirty tree and it still tells the truth.
# It deliberately does NOT use `git worktree`+HEAD like the ratchet does: a
# HAND-EDIT is the thing being caught here, and a hand-edit lives in the working
# tree before it is ever committed.
#
# 4 IS NOT AN ARBITRARY AUDIT. Step 4 exists because step 3 alone can be passed
# by a lie: the generator could emit an _UNRESOLVED entry for a word that IS
# resolvable, or emit a word in both _UNRESOLVED and FIELDS, and the diff would
# be empty because the generator wrote both sides. So the block is re-derived
# from the two JSON tables independently of the generator.
#
# HOW TO GO GREEN. Never by editing vision-student/vocab.py. Edit
# engine/vocab.json or contract/vocab-resolution-v1.json, then
#   node engine/tools/gen-vision-vocab.mjs
# and commit the two in the same commit.
set -uo pipefail
export LC_ALL=C

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
GEN="engine/tools/gen-vision-vocab.mjs"
OUT="vision-student/vocab.py"
cd "$ROOT" || exit 1

TMP=$(mktemp -d) || exit 1
trap 'rm -rf "$TMP"' EXIT

fail=0
say_fail() { echo "FAIL: $*"; fail=$((fail + 1)); }

# A MISSING LAW IS NEVER A PASS.
for f in "$GEN" "$OUT" engine/vocab.json contract/vocab-resolution-v1.json; do
  if [ ! -f "$f" ]; then
    echo "FAIL: $f missing — a missing law is never a pass."
    exit 1
  fi
done

# ---- 1 + 2. the generator runs, twice, and is deterministic ------------------
if ! node "$GEN" --out "$TMP/a.py" >/dev/null 2>"$TMP/err1"; then
  echo "FAIL: $GEN exited nonzero:"; sed 's/^/      /' "$TMP/err1"; exit 1
fi
if ! node "$GEN" --out "$TMP/b.py" >/dev/null 2>"$TMP/err2"; then
  echo "FAIL: $GEN exited nonzero on the second run:"; sed 's/^/      /' "$TMP/err2"; exit 1
fi
if ! cmp -s "$TMP/a.py" "$TMP/b.py"; then
  say_fail "$GEN is NOT deterministic — two runs, different bytes."
  diff -u "$TMP/a.py" "$TMP/b.py" | head -40 | sed 's/^/      /'
else
  echo "ok: generator deterministic — two runs, byte-identical ($(wc -c < "$TMP/a.py" | tr -d ' ') bytes)"
fi

# ---- 3. the committed file equals the generator's output --------------------
if ! cmp -s "$TMP/a.py" "$OUT"; then
  say_fail "$OUT is STALE or HAND-EDITED — it is not what $GEN produces."
  echo "      fix: node $GEN   (never by editing $OUT)"
  echo "      --- diff (generated <-> on disk) ---"
  diff -u "$TMP/a.py" "$OUT" | sed 's/^/      /'
else
  echo "ok: $OUT is byte-identical to the generator's output"
fi

# ---- 4. the _UNRESOLVED block is audited against the tables, not the gen ----
python3 - "$OUT" engine/vocab.json contract/vocab-resolution-v1.json <<'PY' || fail=$((fail + 1))
import json, sys, importlib.util

out_path, vocab_path, res_path = sys.argv[1:4]
vocab = json.load(open(vocab_path))["fields"]
res = json.load(open(res_path))["resolutions"]

spec = importlib.util.spec_from_file_location("_vv", out_path)
m = importlib.util.module_from_spec(spec)
try:
    spec.loader.exec_module(m)
except Exception as e:                       # a generated file that will not
    print("FAIL: %s does not import: %s" % (out_path, e))   # import is not a file
    sys.exit(1)

bad = 0
def fail(msg):
    global bad
    print("FAIL:", msg); bad += 1

for name in ("FIELDS", "_UNRESOLVED", "UNCERTAIN_VALUES", "classes_for", "label_to_index"):
    if not hasattr(m, name):
        fail("%s lost its published name '%s' — six files in vision-student/ import from here" % (out_path, name))

# every shipped class must be a resolved word on its own axis
for field, classes in getattr(m, "FIELDS", {}).items():
    if field not in vocab:
        fail("FIELDS names axis '%s', which engine/vocab.json does not define" % field)
        continue
    for c in classes:
        if c not in vocab[field]["values"]:
            fail("FIELDS['%s'] carries '%s', which is not a value of that axis" % (field, c))
        r = res.get("%s.%s" % (field, c))
        if r is None:
            fail("FIELDS['%s'] carries '%s', absent from the resolution table" % (field, c))
        elif r["status"] != "resolved":
            fail("FIELDS['%s'] carries '%s' with status=%s — only `resolved` ships as a class"
                 % (field, c, r["status"]))
    # order must be enum declaration order, so index == enum value
    want = [v for v in vocab[field]["values"]
            if res.get("%s.%s" % (field, v), {}).get("status") == "resolved"]
    if classes != want:
        fail("FIELDS['%s'] order/content drift: %s != %s" % (field, classes, want))

# and every _UNRESOLVED entry must still be genuinely unshippable
unres = getattr(m, "_UNRESOLVED", {})
if not unres:
    fail("_UNRESOLVED is empty — the two words the hand list carried "
         "(garment.trousers, garment.other) resolve to nothing and may not vanish quietly")
for key, reason in unres.items():
    field, value = key
    if not reason or len(reason) < 20:
        fail("_UNRESOLVED[%r] has no usable reason" % (key,))
    if value in getattr(m, "FIELDS", {}).get(field, []):
        fail("'%s.%s' is in BOTH FIELDS and _UNRESOLVED" % (field, value))
    r = res.get("%s.%s" % (field, value))
    in_vocab = field in vocab and value in vocab[field]["values"]
    if r is not None and r["status"] == "resolved" and in_vocab:
        fail("_UNRESOLVED['%s.%s'] is resolvable today — it must ship as a class, not sit here"
             % (field, value))

if bad:
    print("_UNRESOLVED/FIELDS audit: %d FAIL" % bad); sys.exit(1)
print("ok: %d heads, %d classes, %d unresolved names — every class resolved, every "
      "unresolved name still unresolvable"
      % (len(m.FIELDS), sum(len(c) for c in m.FIELDS.values()), len(unres)))
PY

echo "----"
if [ "$fail" -ne 0 ]; then
  echo "vocab_source_check: HUKUM FAIL ($fail)"
  echo "The vision word list is a BUILD PRODUCT. It stopped matching its sources."
  exit 1
fi
echo "vocab_source_check: HUKUM YESIL"
exit 0
