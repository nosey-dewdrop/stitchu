#!/bin/bash
# bundle_fresh_check.sh — the SHIPPED PAIR may not be older than the source it
# was built from.
#
# WHY THIS FILE EXISTS. On 22 Aug 2026 the night run measured that
# web/vendor/stitchu-engine.js was last compiled on 28 Jul (dd30846) and that
# 53 commits had landed in engine/src since. For four weeks the engine running
# in the browser — and the one running in the Cloudflare Worker behind
# /api/draft — saw none of that month's fixes. Every native ctest was green the
# whole time, because not one of them looks at the shipped artefact. The repo
# could tell you the source was correct; nothing in it could tell you the
# correct source had ever been shipped.
#
# WHAT IT MEASURES, AND WHY IT IS THE COMMIT DATE AND NOT THE FILE MTIME.
# mtime is worthless here: `touch`, a fresh `git clone`, a checkout, or any
# build that copies the file forward all move it, and none of them mean the
# bundle was rebuilt from current source. Worse, mtime would let the gate be
# turned green by a command that changes zero bytes. So the gate reads the
# COMMIT DATE of the artefact and compares it to the COMMIT DATE of its
# sources. The only way to move an artefact's commit date is to commit that
# artefact — which, since the bytes are the compiler's output, means actually
# rebuilding it.
#
# SOURCES = everything whose bytes end up inside the bundle:
#   engine/src/            the engine itself
#   engine/wasm/           the embind boundary (draftJSON/gradeJSON/dxfRecipeJSON)
#   engine/build-wasm.sh   the flags — -sSINGLE_FILE, memory model, DYNAMIC_EXECUTION
# A change to any of them changes the shipped bytes, so any of them being
# newer than the artefact means the artefact is stale.
#
# THIS GATE IS ALLOWED TO BE RED. Red here does not mean "a test is broken", it
# means "what you are serving is not what you wrote". The fix is never to edit
# this file; it is `bash engine/build-wasm.sh` and commit the result.
set -uo pipefail

cd "$(dirname "$0")/../.." || exit 1

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "NOTICE: not a git work tree — freshness is a git-history property and"
    echo "cannot be measured here. This gate is not applicable in this checkout."
    exit 0
fi

# The shipped pair: what the browser loads, and what the Worker imports.
ARTEFACTS=(
    "web/vendor/stitchu-engine.js"
    "backend/engine/stitchu-worker.js"
    "backend/engine/stitchu-worker.wasm"
)
SOURCES=(
    "engine/src"
    "engine/wasm"
    "engine/build-wasm.sh"
)

# Newest source commit across all source paths.
SRC_EPOCH=$(git log -1 --format=%ct -- "${SOURCES[@]}")
SRC_SHA=$(git log -1 --format=%h -- "${SOURCES[@]}")
SRC_DATE=$(git log -1 --format=%cs -- "${SOURCES[@]}")

if [ -z "$SRC_EPOCH" ]; then
    echo "FAIL: no commit found for engine sources (${SOURCES[*]})."
    echo "      Cannot establish what the shipped bundle should have been built from."
    exit 1
fi

echo "engine source HEAD : $SRC_SHA  $SRC_DATE"
echo

STALE=0
for art in "${ARTEFACTS[@]}"; do
    if [ ! -f "$art" ]; then
        echo "FAIL  $art"
        echo "      missing from the working tree — nothing is being shipped."
        STALE=1
        continue
    fi
    if ! git ls-files --error-unmatch "$art" >/dev/null 2>&1; then
        echo "FAIL  $art"
        echo "      exists but is NOT tracked by git, so its freshness cannot be"
        echo "      proven and it is not what a deploy from this repo would serve."
        STALE=1
        continue
    fi

    ART_EPOCH=$(git log -1 --format=%ct -- "$art")
    ART_SHA=$(git log -1 --format=%h -- "$art")
    ART_DATE=$(git log -1 --format=%cs -- "$art")

    if [ -z "$ART_EPOCH" ]; then
        echo "FAIL  $art"
        echo "      tracked but has no commit of its own — freshness unknown."
        STALE=1
        continue
    fi

    if [ "$ART_EPOCH" -lt "$SRC_EPOCH" ]; then
        # How far behind, counted in commits that actually touched the sources.
        BEHIND=$(git rev-list --count "${ART_SHA}..HEAD" -- "${SOURCES[@]}")
        DAYS=$(( (SRC_EPOCH - ART_EPOCH) / 86400 ))
        echo "FAIL  $art"
        echo "      built  : $ART_SHA  $ART_DATE"
        echo "      source : $SRC_SHA  $SRC_DATE"
        echo "      STALE BY $BEHIND COMMITS to engine sources ($DAYS days)."
        echo "      The engine being served is not the engine in this repo."
        echo "      Fix: bash engine/build-wasm.sh && git add $art && commit it."
        STALE=1
    else
        echo "ok    $art  ($ART_SHA $ART_DATE >= source $SRC_DATE)"
    fi
done

echo
if [ "$STALE" -ne 0 ]; then
    echo "bundle_fresh_check: FAIL — the shipped engine is behind its source."
    exit 1
fi

echo "bundle_fresh_check: PASS — every shipped artefact is at or ahead of engine source."
exit 0
