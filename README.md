# stitchu

stitchu turns a photo of a garment into a sewing pattern drafted to your own body measurements, printed true-scale on A4.

Live: https://damlahelloworld.github.io/stitchu (web v27)

## How it works

1. You enter 7 body measurements (bust, waist, hip, shoulder, back length, arm length, neck) — stored locally, never uploaded.
2. You upload a garment photo. A Cloudflare Worker calls Claude vision and classifies it into a fixed drafting vocabulary (garment, neckline, sleeve, skirt style, waistline, fabric behavior). You confirm or correct the reading.
3. A C++ drafting engine, compiled to WebAssembly and running entirely in your browser, drafts the pattern pieces to your measurements using published pattern-making formulas (FreeSewing, Muller & Sohn, Winifred Aldrich — every constant sourced in `engine/FORMULAS.md` and `knowledge/`).
4. Output: SVG pattern pieces with darts, grainlines, drawn seam allowance (outer cut line / inner sew line), a tiled A4 PDF with a 3 cm calibration square, fabric meter estimate, and a step-by-step sewing guide.

## Engineering

- Drafting vocabulary: princess/dart shaping, natural/empire/babydoll waistlines, woven/knit, 5 skirt styles, set-in and balloon sleeves, tiered ruffles, sweetheart, keyhole (cut-out + shaped facing), halter (frame-shift bodice with bias binding).
- Validation matrix: 70,200 drafts (EU 34-52 plus tall/petite/pear/apple/edge bodies × the full spec space), all passing geometric invariants — side-seam balance, dart sums, armhole/cap ease, waist joins, self-intersection, print fit. 8/8 ctest suites green.
- Seam-pair precision: `tools/precision-report.js` measures every seam pair a sewist actually pins (shoulder, side, princess, waist join, sleeve cap, facing); anything over 1.0 mm fails. Two real gaps found (shoulder pair 8-10 mm, empire side seam ~2 mm) and trued — worst pair now 0.00 mm.
- Seam allowance is drawn, not implied: outward envelope offset with a guarantee that no cut-line point sits closer than the allowance, fold-aware, mitered/beveled corners, Douglas-Peucker simplified to 0.2 mm.
- Golden reference pinned in-repo (`engine/golden-reference.csv`, 23k lines); `golden-diff.py` diffs deterministic draft output at 0.1 mm tolerance. The engine was originally ported from Swift against a 2805-draft golden matrix, then deliberately diverged when truing improved on the Swift reference.
- Web-layer fuzz: `tools/web-fuzz.js` walks the UI's whole spec space across body-corner measurements and simulates the print packer — 19,555 drafts, 0 failures, no piece can be clipped.
- Vision cost track: zero-shot CLIP scored 44% and SigLIP 65% against hand labels — dead end. Claude Opus as teacher scores 86%; plan is to distill it into a browser ONNX student (corpus of 70 licensed images + labeling pipeline in `vision/`). Measured, not guessed: `vision/README.md`.
- Drafting knowledge base: SQLite (`knowledge/`), where formula claims enter as `verified` only after adversarial source-checking; refuted claims are kept so they are never reused.

## Stack

- Engine: C++17, CMake, ctest; Emscripten/embind build to a single-file WASM bundle (`engine/dist/stitchu-engine.js`, ~218 KB)
- Web: static HTML/CSS/JS on GitHub Pages, no framework; patterns render as SVG, print via client-side tiled A4 PDF; measurements and closet in local storage/IndexedDB
- Backend: one Cloudflare Worker (`backend/`) proxying Claude vision behind an app token with per-IP rate limits — the browser never holds the API key
- Vision experiments: Node + @xenova/transformers (ONNX) in `vision/`
- Knowledge: SQLite drafting-formula database in `knowledge/`

## Repo layout

- `engine/` — C++ engine, tests, tools, WASM build, `FORMULAS.md` (drafting spec)
- `web/` — the live site
- `backend/` — Cloudflare Worker (vision proxy)
- `vision/` — Track B: owning the vision model (eval + distillation corpus)
- `knowledge/` — verified drafting-formula database
- `App/` — original Swift iOS app, kept as reference; the C++ core will feed iOS/Android later
- `docs/ARCHITECTURE.md` — layers, data flow, design decisions

## Status

Web flow is live end to end (photo → analysis → draft → print). Next: batch-labeling the vision corpus for the distilled student model, a real `POST /api/draft` API (the engine already runs in Workers), and physical sew tests. Detail lives in `PROJECT.md` and `PLAN.md`.
