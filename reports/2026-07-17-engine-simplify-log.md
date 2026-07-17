# Engine simplify: stop over-splitting, fewer pieces by default — 2026-07-17

Damla's #1 complaint: the engine over-splits every garment. A simple square-neck
babydoll top came out at 7-14 pieces (princess-seam center+side panels + separate
front/back neck facings on everything) where a clean commercial pattern
(BugraPatterns / Burda level) uses 2-4. Rule: fewer, simpler pieces is a QUALITY
metric. This loop changed the DEFAULTS so a plain garment comes out at the piece
count a tailor would actually cut, while the extra-piece paths stay OPT-IN.

## What I found (root cause)

Two systematic over-splitters, both in DEFAULTS not in the geometry:

1. **Shaping defaulted to Princess everywhere.** `GarmentSpec.shaping =
   Shaping::Princess` (measurements.hpp), the live product default
   (`create.js DEFAULT_SPEC.shaping='princess'` + `engine.js spec.shaping ?? 'princess'`),
   and 7 of the 12 pattern specs in `render-patterns.mjs`. Princess splits EACH
   bodice half into a center + side panel (2 -> 4) and, on a fitted skirt, does
   the same to the skirt (2 -> 4). Proven directly: a default dress went from
   **10 pieces (princess) to 6 pieces (dart)** — verbatim probe output:
   - princess: Bodice Center Front / Side Front / Center Back / Side Back + 2 bias + Skirt Center Front / Side Front / Center Back / Side Back
   - dart:     Bodice Front / Bodice Back + 2 bias + Skirt Front / Skirt Back

2. **Facings vs bias binding.** The engine ALREADY defaults to bias binding
   (`edgeFinish=0=BiasBinding`, patch 3.10) — a real collar forces facings
   internally, which is correct. But the pattern SVGs / meta.json were STALE
   (rendered before the bias-binding patch) and still listed "Front Neck Facing +
   Back Neck Facing" on all 12. The render tool also crashed (a `d.ox` NaN bug on
   rotated pieces) so meta.json was never regenerated. So part of the fix was
   just running the (repaired) renderer so the published data matches the engine.

Non-over-splitting piece counts (bias binding = 2 strips, tie = 1 rectangle, etc.)
are honest cut pieces and were left as the engine draws them.

## Policy chosen (minimal-piece default)

- **Darts are the DEFAULT bust/waist shaping.** A plain bodice/skirt stays ONE
  panel per side. Documented in a comment on `GarmentSpec.shaping`.
- **Princess seams are OPT-IN** — only when the STYLE asks for it (vision reads
  "princess", the user picks it, or a pattern is literally a princess style). The
  full princess path is untouched and still works when selected (orthogonal
  architecture, nothing deleted).
- **Bias binding stays the default neck/armhole finish** (already true); a REAL
  collar still forces its neck facings (wearability: a collar needs a faced edge).
- **Wearability respected**: front-buttoned / open-back garments are NOT cut on
  fold; the placket/cutout still draws under dart shaping (verified by render).

## What I changed (surgical, no rewrite)

Engine:
- `engine/src/measurements.hpp` — `GarmentSpec.shaping` default `Princess -> Dart`
  (+ policy comment). Golden pins Dart+Facing explicitly, so this is a pure
  default change; golden stays byte-identical.
- `engine/src/tie.cpp` — **fixed a latent dangling-pointer bug** surfaced by the
  new piece layout: the tie's body pointer was captured via findPiece, then
  `pieces.push_back(tie)` could reallocate the vector and dangle it, so the
  placement notch wrote to freed memory. Now captures an INDEX (survives the
  append) and re-derives the pointer after the push. This is why the front-neck
  tie notch silently vanished under dart shaping.

Tests (pinned intent, didn't weaken):
- `engine/tests/cutline_check.cpp` — pinned `Shaping::Princess` on the two cases
  that need >=3 body pieces (they exist to prove princess panels still get cut
  lines and the keyhole facing stays single-line among many pieces).
- `engine/tests/sweetheart_check.cpp` — pinned `Shaping::Princess` (the test reads
  "Bodice Center Front"; dart renames it "Bodice Front", which null-deref'd it).

Live product defaults:
- `web/js/create.js` — `DEFAULT_SPEC.shaping 'princess' -> 'dart'`, dart listed
  first in the picker, comment flipped (princess is now the opt-in advanced form).
- `web/js/engine.js` — both `spec.shaping ?? 'princess'` fallbacks -> `?? 'dart'`.

Tooling + generated content:
- `engine/tools/render-patterns.mjs` — 5 pattern specs `princess -> dart` (kept
  `open-back-princess` princess — princess IS its style); fixed the `d.ox` crash
  by disabling rotation for the gallery thumbnails; passed the full draftJSON arg
  list (edgeFinish=0 bias binding + trailing params).
- `engine/tools/gen-pattern-pdfs.mjs` — synced the mirrored spec list + full
  draftJSON args; regenerated all 36 PDFs (fewer pieces => fewer A4 pages).
- `engine/tools/gen-pattern-pages.mjs` — updated editorial copy (EN+TR) that
  described "princess seams"/"facings" for the now-dart/bias patterns so the page
  text is honest; added the `blog` nav link that the committed pages already had
  (the generator template lagged the parallel blog work — this restores header
  parity WITHOUT touching any blog file).
- Rebuilt WASM (`engine/build-wasm.sh`): `web/vendor/stitchu-engine.js` +
  `backend/engine/stitchu-worker.wasm` now carry the dart default.
- Version chain bumped 78 -> 79 for the changed JS/WASM
  (create.html -> create.js -> engine.js -> vendor/stitchu-engine.js).

## Before -> after piece counts (all 12 patterns, EU38 demo body)

Before = old (stale, princess+facing) meta.json. After = regenerated from the
new engine. Total **92 -> 80 pieces (-12)**.

```
 4 ->  4  boat-neck-linen-shell            (was already dart; facings -> bias, same count)
 6 ->  6  scoop-neck-tank-mini-dress       (dart; facings -> bias)
 6 ->  4  boat-neck-button-down-top        (-2 princess -> dart)
 4 ->  4  gingham-button-blouse            (dart; facings -> bias)
 8 ->  6  mandarin-collar-fitted-blouse    (-2 princess -> dart; keeps facings, real collar)
 7 ->  7  back-tie-shift-mini-dress        (dart; facings -> bias)
 7 ->  5  square-neck-back-tie-babydoll-top (-2 princess -> dart)  <-- the headline babydoll top
 9 ->  8  empire-waist-tie-back-dress      (-1 princess -> dart)
 8 ->  8  square-neck-drawstring-babydoll-dress (dart; facings -> bias)
11 -> 11  open-back-princess-mini-dress    (KEPT princess — princess is the style)
12 ->  8  open-back-tie-back-mini-dress    (-4 princess -> dart)
10 ->  9  peter-pan-collar-puff-sleeve-babydoll-dress (-1 princess -> dart; keeps facings, real collar)
```

Headline: the square-neck babydoll top **7 -> 5** (Top Front, Top Back, 2 bias
binding strips, Back Tie) — a clean cut-on-fold front + back, no princess split,
no separate facing. The 2 bias-binding strips are the honest edge-finish pieces
(a real pattern lists them as "cut a 2.5cm bias strip"); the body of the garment
is now the 2-3 panels Damla asked for.

Honest note on what did NOT drop further:
- Patterns with a REAL collar (mandarin, peter-pan) keep front+back neck facings
  by design — a collar attaches to a faced neck edge (wearability). Correct, not
  over-splitting.
- `open-back-princess-mini-dress` stays 11: princess is its defining style, so it
  keeps the split panels on purpose (opt-in still works).
- Bias binding counts as 2 pieces (neckline strip + armhole strip). Representing
  binding as a note instead of a piece would be a deeper change and risks the
  wearability edge-finish gate; left as the engine's honest cut piece.

## Proof (every test, with counts)

- **ctest: 29/29 passed** (fixed cutline_check, tie_check, sweetheart_check; the
  rest untouched). tie_check now passes because the dangling-pointer bug is fixed.
- **golden: byte-identical, 23034 lines, 0 diff** — the golden harness pins
  Dart+Facing explicitly, so the default flip cannot move it. Regenerated + diffed
  twice (after C++ change, after WASM rebuild).
- **web-fuzz: 26260 drafts, 0 FAILURES** (6521 validator-blocked = honest, e.g.
  keyhole-on-dart-front correctly rejected).
- **vocab-sweep: 37800 drafts, 0 SEWABILITY FAILURES.**
- **wearability-bench: 55 specs, 0 UNWEARABLE (head=0 fold=0 edge=0)** — no
  head-entry, fold-vs-opening, or edge-finish violation introduced. No cut-on-fold
  on any opening garment.
- **style-lint: clean** (54 pages + 7 css). **header-diff: identical across 47
  pages.**

## RENDER-ONAY (eyeballed the pieces)

Rasterized 3 simplified patterns to PNG (Chrome headless) and looked at each:
- `/tmp/simplified-square-neck-back-tie-babydoll-top.png` — Top Front (square neck,
  clean cut-on-fold center), Top Back, Back Tie rectangle. Each a single
  continuous outline with cut line (dashed) + sew line (solid) + grainline. No
  fragmentation.
- `/tmp/simplified-open-back-tie-back-mini-dress.png` — Bodice Front (bust dart
  visible), Bodice Back (round open-back cutout drawn in), Skirt Front + Skirt
  Back (each with a waist dart — WHOLE panels, no princess split), Waist Tie, Open
  Back Facing, Bias binding. Clean sewable set (down from 4+4 princess panels).
- `/tmp/simplified-boat-neck-button-down-top.png` — Top Front with the grown-on
  button placket (fold line, facing line, button/buttonhole ticks) still drawing
  correctly under dart; Top Back a whole panel. Front-buttoned => NOT cut on fold,
  wearability respected.

All three read as clean, few-piece, sewable patterns — not fragmented.

## Scope / safety

- Touched only: engine/, web/js/engine.js, web/js/create.js, web/patterns/,
  web/vendor, backend/engine, web/create.html (version bump for the changed JS).
- Did NOT touch the 3 protected dirty files (DEVAM-RAY-LOOP.md, backend/worker.js,
  web/css/landing.css) — verified still M, unmodified.
- Did NOT touch the parallel agent's files (web/blog, web/collection-60s70s.html,
  new blog page).

## Deploy

(commit SHA + gh-pages subtree + live curl recorded below after commit)
