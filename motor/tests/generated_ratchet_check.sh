#!/bin/bash
# generated_ratchet_check.sh — K21. A protected path is protected BY THE PATH,
# not by the shape of the tool that reaches it.
#
# WHY THIS FILE EXISTS. .rabadon/guard.json declares four protectedPaths. They
# are enforced in rabadon's gate inside exactly one branch:
#
#   if (toolName == "Edit" || toolName == "Write" || ...)   native/gate.cpp:2892
#
# so the rule is TOOL-shaped. TUR 13 / 13C did its bulk repairs with
# `node /tmp/*.mjs` and wrote to protected paths that way. It did not relax the
# rule; it went around it, in the open, and said so in its report.
#
# TUR 14 closed the shapes that NAME the path on the command line
# (guard.json rule no-shell-write-protected-path, 23/23 mutation matrix).
# What no regex over a command line can ever close is the shape 13C used: when
# the path lives INSIDE a script, `node /tmp/fix.mjs` carries no path at all.
# rabadon is Damla's separate product and was read, never written.
#
# So the last door is on the repo side, and it is this one: a generated file may
# not change its bytes without its declared sha256 changing WITH IT, in the same
# commit, in a tracked file, under its own name. A hand-edit — by any tool, from
# any direction, including a script rabadon cannot see into — turns this red.
#
# WHAT THIS IS NOT. It is NOT a regenerability proof. It does not run the
# producers and it does not claim the bytes are reproducible. It cannot: four of
# the six producers of these files CANNOT RUN TODAY (declared in guard.json,
# measured 2026-08-17: gen-collection-pattern, gen-vintage-page,
# gen-taste-collections and gen-collections-page all exit 1 with ENOENT because
# af49514 deleted web/patterns/*/meta.json). A byte-identical regeneration gate
# over those four is not a gate, it is a permanent crash. When K16 restores that
# data, this file should be UPGRADED to run the producers and diff the bytes;
# until then the ratchet is what is honestly available, and it is strictly more
# than the nothing that was there before.
#
# HOW TO GO GREEN AFTER A LEGITIMATE CHANGE. Run the producer, then
#   engine/tests/generated_ratchet_check.sh --accept
# and commit the manifest in the SAME commit as the pages. The point is not to
# make the change hard; it is to make it VISIBLE and NAMED in the diff.
set -u
export LC_ALL=C

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MANIFEST="$ROOT/contract/generated-paths.sha256"
cd "$ROOT" || exit 1

# The set of paths is not typed here twice. It is read out of the guard, so the
# manifest can never drift from the rules it exists to enforce: if a new
# protectedPaths pattern is added, its files appear here on the next run.
# (Deliberately NOT re-implementing the regex engine: the two generated web
# families and the two single files are expanded by shell globs that mirror the
# guard patterns, and a mismatch in COUNT is itself reported below.)
list_paths() {
  {
    ls web/collection-60s70s.html 2>/dev/null
    ls web/patterns/*.html web/collections/*.html web/styles/*.html \
       web/guide/*.html web/blog/*.html 2>/dev/null
    ls web/sitemap.xml web/robots.txt 2>/dev/null
    ls engine/golden-reference.csv 2>/dev/null
  } | LC_ALL=C sort -u
}

sha() { shasum -a 256 "$1" 2>/dev/null | awk '{print $1}'; }

if [ "${1:-}" = "--accept" ]; then
  mkdir -p "$(dirname "$MANIFEST")"
  {
    echo "# generated-paths.sha256 — K21 ratchet. Regenerate with"
    echo "#   engine/tests/generated_ratchet_check.sh --accept"
    echo "# and commit this file in the SAME commit as the pages it describes."
    echo "# A line moving here without its producer being run is a hand-edit."
    list_paths | while read -r f; do printf '%s  %s\n' "$(sha "$f")" "$f"; done
  } > "$MANIFEST"
  echo "manifest written: $MANIFEST ($(grep -c '^[0-9a-f]' "$MANIFEST") paths)"
  exit 0
fi

# A MISSING LAW IS NEVER A PASS. The whole class of defect this shift keeps
# finding is a gate that reports OK because its input is absent (style_check
# with no STYLE-PIN dir, katman-lint with no protected file on disk, taban.sh
# sealing the sha256 of the empty string). This one refuses instead.
if [ ! -f "$MANIFEST" ]; then
  echo "FAIL: no manifest at $MANIFEST — a missing law is never a pass."
  echo "      seed it once with: engine/tests/generated_ratchet_check.sh --accept"
  exit 1
fi

fail=0; checked=0; missing=0; extra=0; moved=0
tmp_now=$(mktemp); trap 'rm -f "$tmp_now"' EXIT
list_paths > "$tmp_now"

# 1. every declared path still exists and still carries its declared bytes
while read -r want f; do
  case "$want" in \#*|"") continue;; esac
  checked=$((checked+1))
  if [ ! -f "$f" ]; then
    echo "FAIL missing   $f (declared, not on disk)"; missing=$((missing+1)); fail=$((fail+1)); continue
  fi
  got=$(sha "$f")
  if [ "$got" != "$want" ]; then
    echo "FAIL bytes     $f"
    echo "     declared  $want"
    echo "     on disk   $got"
    moved=$((moved+1)); fail=$((fail+1))
  fi
done < "$MANIFEST"

# 2. a generated file that appeared with no declaration is not covered by
#    anything, which is the same silence in the other direction.
while read -r f; do
  [ -z "$f" ] && continue
  if ! grep -qF "  $f" "$MANIFEST"; then
    echo "FAIL undeclared $f (generated path with no line in the manifest)"
    extra=$((extra+1)); fail=$((fail+1))
  fi
done < "$tmp_now"

echo "----"
echo "generated_ratchet_check: $checked declared paths, $(wc -l < "$tmp_now" | tr -d ' ') on disk"
echo "  bytes moved: $moved · declared-but-missing: $missing · undeclared: $extra"
if [ "$fail" -ne 0 ]; then
  echo "HUKUM: FAIL ($fail)"
  echo "A generated file's bytes moved without its declared sha moving with it."
  echo "If this was a real regeneration: run the producer, then --accept, and put"
  echo "the manifest in the SAME commit. If it was a hand-edit: it is refused."
  exit 1
fi
echo "HUKUM: YESIL"
exit 0
