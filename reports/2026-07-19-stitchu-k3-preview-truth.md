# K3 — PREVIEW-TRUTH (structural equality + landmark deviation)

Date: 2026-07-19 · Closing chain rail K3 · patch 3.23 · deploy ?v94
Producer agent. Engine C++ untouched (no wasm rebuild needed); flat engine
touched only to export an existing function (CLI proven byte-identical).

## What was built

One semantic garment record per flat style now lives in the contract
(`contract/preview-truth.json` `specs`), and two projections are derived from
it and diffed by `engine/tools/preview-truth.mjs`:

- DISPLAY projection = the flat-engine recipe of the same key
  (`engine/flat-engine/styles.json`, rendered by `_engine-full.mjs` — the
  exact code path the listing cards use).
- DRAFT projection = the committed product engine
  (`web/vendor/stitchu-engine.js`, the same wasm the browser drafts with)
  via `draftJSON`, on the deterministic demo body (render-pages / web-fuzz
  body #0, recorded in the contract file).

Three checks, one script, one mandal:

1. STRUCTURAL EQUALITY (hard). Every structural element the flat draws must
   have a counterpart cut piece in the pattern, and every cut piece must be
   represented in the flat. Undeclared gaps FAIL on either side. Declared
   gaps live in `structuralAllow`, each with a contract reference.
2. LANDMARK DEVIATION (soft, 8%). The same landmarks measured on both sides,
   normalised by each projection's bust half-width anchor. Above-threshold
   deviations must cite a contract-declared stylisation and are PINNED
   (`landmarkAllow.maxAbsDevPct`) — the ratchet: drift beyond a pin FAILS.
3. SHARED-PACKER GUARD (K0 4.3). `web/js/render.js appendAssembledPreview`
   must keep rendering through `web/js/sheet.js` packPieces/usedCells/
   sheetInner (the print pipeline's packer). A private preview packer FAILS.

Mandal: `ctest preview_truth_check` (the suite's 45th test,
engine/CMakeLists.txt) + chained into `style-lint.mjs` after render-lint, so
the existing deploy proof step runs it automatically.

## Structural equality — result: GREEN, 4/4 styles

| style | flat structural parts | draft counterpart |
|---|---|---|
| drawstring_babydoll | shirr, casing, tie, backSeam | Drawstring Yoke Panel · casing on panel · Drawstring Cord (the bow IS the knotted cord) · Skirt/Bodice Back CB seam |
| lace_vneck_70s | sleeve, tie, backSeam | Puff Sleeve · Neck/Front Tie · CB seam |
| peterpan_puff | collar, sleeve, shirr, backSeam | Peter Pan Collar · Puff Sleeve · Shirred Bust Panel · CB seam |
| courtney_lace_vneck | sleeve, tie, backSeam | Puff Sleeve · Neck/Front Tie · CB seam |

Reverse direction (draft pieces → flat): Bodice/Skirt Front/Back = the
silhouette itself; Bias binding and Neck Facings = internal construction,
invisible on a worn flat (deterministic class rule in the tool); everything
else must map to a drawn flat part or fail.

### Allowlist (declared gaps, none silent)

1. `drawstring_babydoll` straps + ruffledStraps — the flat DECLARES the flags
   but `render()` never reads them (K2 `composition.json`
   `flatComponents.declaredButNotDrawn`, code wins). The DRAFT does cut the
   Ruffled Strap piece, so the pattern is complete; the gap is in the flat
   drawing. Already in PARK from K2: draw-or-drop (v1.1).
2. `laceNeck / laceSleeve / laceHem` (lace_vneck_70s, courtney_lace_vneck) —
   lace trim bands drawn as illustration; no pattern piece exists and drawing
   one is a NEW capability (A1 → PARK, v1.1 candidate). PUBLISH NOTE: any
   listing built on these flats must state lace is purchased trim, not a
   pattern piece.
3. `cfGather` — pure 'ink'-class decorative strokes (same decorative class
   render-lint exempts); no cut-piece implication.

## Landmark deviation table (bust-anchor-normalised, dev% = flat vs draft)

Anchor = bust half-width of each projection (0% by construction, printed as
ANCHOR). Body: 90/72/98 EU38-ish demo.

| landmark | drawstring | lace_vneck | peterpan | courtney | status |
|---|---|---|---|---|---|
| bustHalf | 0.0 | 0.0 | 0.0 | 0.0 | ANCHOR |
| neckHalf | — | +99.4 | +140.4 | +99.4 | DECLARED (pin 150, flat._layer stylised units) |
| neckDepth | — | +54.3 | +53.2 | +54.3 | DECLARED (pin 62) |
| shoulderLen | — | −38.0 | −56.9 | −38.0 | DECLARED (pin 62) |
| armholeDepth | — | +68.1 | +68.9 | +68.1 | DECLARED (pin 75, review.armholeHollow) |
| waistHalf | −16.7 | −16.7 | −16.7 | −16.7 | DECLARED (pin 22, review.waistNip) |
| hemSweepHalf | **+0.1** | **+0.1** | **+0.1** | **+0.1** | **OK** |
| skirtLen | +15.4 | +15.4 | +15.4 | +15.4 | DECLARED (pin 21, flat.len declared two quantities) |
| sleeveLen | — | −49.1 | −38.2 | **−7.3 OK** | DECLARED (pin 55, flat.derived drawing knobs) |
| sleeveWidth | — | −78.6 | −75.8 | −71.0 | DECLARED (pin 84, cut carries gather fullness) |
| panelCutWidth ratio | **1.800 vs 1.8 (+0.0)** | — | **1.998 vs 2.0 (−0.1)** | — | **OK — one ratio truth proven** |

Band top (drawstring) has no neck/shoulder/armhole/sleeve landmarks on the
flat — honestly skipped, not faked.

Worst deviations per style: drawstring waist −16.7 / skirtLen +15.4;
lace_vneck neckHalf +99.4 / sleeveWidth −78.6; peterpan neckHalf +140.4 /
sleeveWidth −75.8; courtney neckHalf +99.4 / sleeveWidth −71.0.

### The honest reading, and the resolution choice

The flat is a deliberately stylised fashion illustration — display beauty
ratio, not a scale drawing. This was a known principle; the table QUANTIFIES
it for the first time. Where the two engines share a truth they agree to
0.1% (hem sweep; gathered-panel cut ratio vs `draft.gatherRatios` — the K1
one-table rule holds in both engines). The stylised landmarks all exceed 8%.

K3's rule says: fix in-contract or PARK + publish block. Re-tuning the flats
to engineering ratios would change Damla-approved, photo-derived art
(design is hers; mockup = contract), so the resolution chosen is IN-CONTRACT
DECLARATION + RATCHET: every exceedance cites the contract clause that
already declares the stylisation (`tables.json flat._layer` "stylised
drawing units, NOT millimetres"; `flat.len` two-quantities note;
`flat.derived` drawing-knobs note; `review.waistNip` / `review.armholeHollow`
registered knobs) and is pinned at its measured envelope — any future drift
beyond a pin fails the deploy chain. No recipe was PARKed because no
deviation is undeclared. This is a judgment call, stated openly for the
mini-audit and for Damla: if she rules the flats must approach draft truth,
the pins tighten and the recipes go to work orders.

Open review question restated (from K1): waistNip 0.07 and armholeHollow
0.10 — fit or style? The waist and armhole rows above are exactly that
question in numbers.

## Mandal proven by mutation (all restored after)

- Pin tightened below current dev (waistHalf 22→10) → exit 1,
  "BEYOND its 10% pin (ratchet)".
- Lace allowlist entry removed → exit 1, "flat draws 'laceNeck' but the
  draft has no counterpart piece and no allowlist entry".
- tieClosure dropped from the lace_vneck semantic spec → exit 1, "flat draws
  'tie' but the draft has no counterpart piece".
- Clean run after restore → exit 0.

## Evidence

- ctest 45/45 (new: preview_truth_check; full suite rebuilt and run).
- style-lint: 81 pages + 7 css clean + chained render-lint green + chained
  preview-truth green (deploy proof step now covers the boundary).
- Flat engine change is export-only (`puffSleeve` added to the export list so
  the tool measures the EXACT worn-sleeve geometry render() draws): CLI SVG
  output cmp byte-identical for all 4 styles, pre vs post.
- Motor C++ untouched: no .cpp/.hpp in the diff, no wasm rebuild, golden
  byte-identical by construction (and the golden ctest passed in the 45).
- Credit: 0 API / 0 vision calls (A5 clean).

## K0 closure

- 4.3 "preview↔kalıp ölçüsüz" — CLOSED: preview_truth measures the boundary
  (structural + landmark) and guards the shared packer single-source.
- K0 list item 10 (preview_truth.mjs, "şu an 0 ölçüm") — CLOSED.

## PARK / notes forward

- PARK (already listed in K2, reaffirmed): straps/ruffledStraps draw-or-drop;
  lace trim as a drawable capability (v1.1).
- Publish note attached to the lace allowlist entry: listings built on the
  lace flats must state the trim is purchased, not patterned.
- v1.1 candidate: preview-truth currently measures the 4 stored flat styles;
  if the flat style library grows, the missing-spec check forces every new
  style to bring its semantic record (already enforced by the tool).

## Files

- contract/preview-truth.json (semantic specs + structural/landmark allowlists)
- engine/tools/preview-truth.mjs (the test; precision-report family)
- engine/CMakeLists.txt (preview_truth_check, 45th test)
- engine/tools/style-lint.mjs (deploy-chain hook)
- engine/flat-engine/_engine-full.mjs (export-only, cmp-proven)
- web/patches.html (3.23 EN/TR) + ?v 93→94 all pages
