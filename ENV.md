# ENV — machine, commands, paths (stable facts only; no status, no strategy)

## Repo layout
- `engine/` — C++ core (src/, tests/, tools/), CMakeLists.txt, golden-reference.csv + golden-diff.py
- `engine/flat-engine/` — fashion-flat display engine (front/back technical drawing)
- `engine/build-wasm.sh` — Emscripten build → wasm for web; `engine/setup-toolchain.sh` — CMake + emsdk setup
- `web/` — plain JS, no framework (web/js/*.js: create, render, print, missing, draft-bridge etc.)
- `backend/` — Cloudflare Worker (worker.js, draft.js, wrangler.toml, DEPLOY.md, API.md)
- `vision/`, `knowledge/`, `mocks/`, `App/` (old iOS app, reference only)
- Reports → `~/damla_projects_2026/reports/YYYY-MM-DD-topic.md` (+ .txt copy for Damla)

## Build + test
- Engine: cmake + ctest from `engine/` (engine-check harness = full draft matrix; must be FULLY green)
- Golden: `engine/golden-reference.csv`, diff via `engine/golden-diff.py` (byte-identical when features off)
- Fuzz/sweep: `engine/tools/web-fuzz.js`, `engine/tools/vocab-sweep.cpp`
- Precision: `engine/tools/precision-report.js`; benchmark: `engine/tools/benchmark-58.mjs`
- Render to PNG (visual-proof artifacts): `engine/tools/render-pages.mjs`, `render-flat.mjs`,
  `render-garment-flat.mjs` — output PNG path goes in the report (RULES invariant 3)
- Header consistency: `engine/tools/header-diff.mjs`; style lint: `style-lint.allow.json`

## Deploy
- Web: GitHub Pages via subtree. GOTCHA: after a `?v` cache bump, `git add web/` ALL files before the
  subtree split — staging only touched files ships stale HTML (v41 HTML + v43 JS mismatch, seen live).
- Worker: `wrangler deploy` is DAMLA'S step (see backend/DEPLOY.md); never claim the worker is live.
- Git: lowercase english commit messages, no co-author tags, push after each coherent chunk.
