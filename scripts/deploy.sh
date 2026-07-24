#!/bin/bash
# deploy.sh — THE one deploy command for the stitchu site (K6, 2026-07-19).
#
# Kills the "forgotten ?v bump" class of bug: the bump is computed and applied
# to EVERY page automatically, the proof chain runs before anything ships, and
# the existing deploy mechanics (git add web/ ALL -> subtree split -> force
# push gh-pages -> live curl check) are WRAPPED here unchanged.
#
# Usage:
#   scripts/deploy.sh "commit message"        bump + proofs + commit + deploy
#   scripts/deploy.sh --no-bump "message"     deploy without a version bump
#
# Proof chain (deploy refuses to ship on any failure):
#   1. style-lint  (house style + render-lint + preview-truth, chained)
#   2. header-diff (canonical header byte-identical on every page)
#   3. validate-contract (contract/vocab/gen drift)
#   4. ctest       (full engine suite, only if engine/build exists)
#   5. worker-URL single-source guard: every hardcoded workers.dev URL in web/
#      must equal BACKEND_URL in web/js/config.js (K0 5.5 divergence class)
#
# Motor guard (K0 5.9): if unpushed commits touch engine/src or engine/wasm,
# the deploy stops and demands the full motor proof set (two wasm builds via
# engine/build-wasm.sh + golden diff + vocab-sweep + web-fuzz). Set
# STITCHU_MOTOR_PROOF=done only after actually running it.
#
# GOTCHA (K4, 2026-07-19): a stray /tmp/package.json with type:commonjs breaks
# node ESM in any /tmp worktree. Never open worktrees under /tmp; use ~/.cache.
# This script warns if /tmp/package.json exists.

set -euo pipefail
cd "$(dirname "$0")/.."

BUMP=1
if [ "${1:-}" = "--no-bump" ]; then BUMP=0; shift; fi
MSG="${1:-}"
if [ -z "$MSG" ]; then echo "usage: scripts/deploy.sh [--no-bump] \"commit message\""; exit 2; fi

# auto-regenerate sitemap.xml from every real page (no manual per-page indexing)
echo "== deploy.sh: regenerating sitemap =="
python3 web/gen-sitemap.py || { echo "sitemap generation failed"; exit 3; }

LIVE_BASE="https://stitchu.noseydewdrop.com"

echo "== deploy.sh: preflight =="
if [ -f /tmp/package.json ]; then
  echo "WARN: /tmp/package.json exists — it breaks node ESM in /tmp worktrees (K4 gotcha)."
fi

# Motor guard: unpushed commits touching the engine demand the full proof set.
git fetch origin main --quiet || true
MOTOR_TOUCHED=$(git log --name-only --pretty=format: origin/main..HEAD 2>/dev/null | grep -c '^engine/\(src\|wasm\)/' || true)
if ! git diff --quiet HEAD -- engine/src engine/wasm 2>/dev/null; then MOTOR_TOUCHED=$((MOTOR_TOUCHED+1)); fi
if [ "$MOTOR_TOUCHED" -gt 0 ] && [ "${STITCHU_MOTOR_PROOF:-}" != "done" ]; then
  echo "STOP: engine/src or engine/wasm changed in undeployed work."
  echo "Run the full motor proof set FIRST (engine/build-wasm.sh both targets,"
  echo "golden diff, ctest, vocab-sweep, web-fuzz, render + eyes), then re-run"
  echo "with STITCHU_MOTOR_PROOF=done."
  exit 3
fi

# 1) ?v bump on EVERY page (html/js/css) — single new version, no drift.
if [ "$BUMP" = "1" ]; then
  CUR=$(grep -rho '?v=[0-9]*' web --include='*.html' --include='*.js' --include='*.css' | sed 's/?v=//' | sort -n | tail -1)
  NEW=$((CUR + 1))
  echo "== bump ?v=$CUR -> ?v=$NEW on all pages =="
  find web -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' \) \
    -exec perl -i -pe "s/\\?v=[0-9]+/?v=$NEW/g" {} +
else
  NEW=$(grep -rho '?v=[0-9]*' web --include='*.html' | sed 's/?v=//' | sort -n | tail -1)
  echo "== no bump requested, current ?v=$NEW =="
fi
VCOUNT=$(grep -rho '?v=[0-9]*' web --include='*.html' --include='*.js' --include='*.css' | sort -u | wc -l | tr -d ' ')
if [ "$VCOUNT" != "1" ]; then
  echo "FAIL: web/ carries $VCOUNT distinct ?v versions after bump (must be exactly 1)."; exit 4
fi

# 2) worker-URL single-source guard (K0 5.5): inline copies must equal config.js.
CANON=$(grep -o "https://[a-z0-9.-]*workers\.dev" web/js/config.js | head -1)
BAD=$(grep -rho "https://[a-z0-9.-]*\.workers\.dev" web --include='*.html' --include='*.js' | grep -v '<account>' | grep -vF "$CANON" || true)
if [ -n "$BAD" ]; then
  echo "FAIL: worker URL drift vs config.js ($CANON):"; echo "$BAD"; exit 5
fi

# 3) proof chain.
echo "== proof: style-lint (+render-lint +preview-truth) =="
node engine/tools/style-lint.mjs > /tmp/stitchu-stylelint.log 2>&1 || { tail -20 /tmp/stitchu-stylelint.log; exit 6; }
tail -2 /tmp/stitchu-stylelint.log
echo "== proof: header-diff =="
node engine/tools/header-diff.mjs > /tmp/stitchu-headerdiff.log 2>&1 || { tail -20 /tmp/stitchu-headerdiff.log; exit 7; }
tail -1 /tmp/stitchu-headerdiff.log
echo "== proof: validate-contract =="
node engine/tools/validate-contract.mjs > /tmp/stitchu-contract.log 2>&1 || { tail -20 /tmp/stitchu-contract.log; exit 8; }
tail -1 /tmp/stitchu-contract.log
if [ -d engine/build ]; then
  echo "== proof: ctest (full suite) =="
  ctest --test-dir engine/build > /tmp/stitchu-ctest.log 2>&1 || { tail -20 /tmp/stitchu-ctest.log; exit 9; }
  grep "tests passed" /tmp/stitchu-ctest.log
else
  echo "WARN: engine/build missing, ctest skipped (build it for the full proof chain)."
fi

# 4) commit: web/ is staged in FULL (ENV.md gotcha — staging only touched files
# once shipped stale HTML live). Anything else already staged rides along.
echo "== commit + push main =="
git add web/
if git diff --cached --quiet; then
  echo "nothing to commit (tree already committed), deploying HEAD"
else
  git commit -m "$MSG"
fi
git pull --rebase origin main
git push origin main

# 5) subtree split -> force push gh-pages (existing mechanics, wrapped verbatim).
echo "== subtree deploy =="
SHA=$(git subtree split --prefix=web HEAD | tail -1)
git push --force origin "$SHA":gh-pages
echo "gh-pages <- $SHA"

# 6) live curl verify: page reachable + serving exactly the new single version.
echo "== live verify (cache-bust) =="
OK=0
for i in $(seq 1 30); do
  BODY=$(curl -fs "$LIVE_BASE/index.html?fresh=$(date +%s)" || true)
  if [ -n "$BODY" ] && echo "$BODY" | grep -q "?v=$NEW" && ! echo "$BODY" | grep -o '?v=[0-9]*' | grep -qv "?v=$NEW"; then
    OK=1; break
  fi
  sleep 10
done
if [ "$OK" != "1" ]; then echo "FAIL: live index not serving single version ?v=$NEW yet (check Pages build)."; exit 10; fi
for PAGE in patches.html create.html benchmark.html; do
  CODE=$(curl -so /dev/null -w '%{http_code}' "$LIVE_BASE/$PAGE?fresh=$(date +%s)")
  echo "live $PAGE -> HTTP $CODE"
  [ "$CODE" = "200" ] || { echo "FAIL: $PAGE not 200"; exit 11; }
done
echo "== DEPLOYED: ?v=$NEW live and single-versioned =="

# 7) IndexNow: tell Bing/Yandex/Seznam the pages changed so they recrawl now
# instead of on their own schedule. Best-effort: a ping failure never fails the
# deploy (the pages are already live). Skipped if no key file is present.
if node -e 'process.exit(require("fs").readdirSync("web").some(f=>/^[a-f0-9]{32}\.txt$/.test(f))?0:1)' 2>/dev/null; then
  echo "== IndexNow ping =="
  node engine/tools/indexnow-ping.mjs || echo "WARN: IndexNow ping failed (pages still live)."
fi
