# stitchu — bias binding default edge finish (patch 3.10)

Date: 2026-07-17
Loop: BİYE (bias binding) DEFAULT edge finish
Credit spent: 0 (local engine + web loop; no vision calls)

## Decision (Damla, 17 Jul, approved)
"Yaka parçası istemiyorum, biye her elbisede." The neckline + armhole finish now
DEFAULTS to bias binding (biye) — a thin 45° bias strip wrapped over the raw
curved edge, the couture finish. A separate facing / real collar is the
EXCEPTION, kept only where a real collar sits up on the fabric.

## What changed (engine)
- New `EdgeFinish { BiasBinding (default), Facing }` on GarmentSpec.
- `biasBinding(edgeMM, label)` (bodice.cpp): a self-lined bias strip, length =
  finished edge circumference + 20 mm overlap, width 25 mm (4× the 6 mm finished
  width), bias cut note (45°) + center fold + grainline. Same construction class
  as the existing halter binding.
- `neckEdgeLength(m, neckline)` (bodice.cpp): TRUING source — flattens the SAME
  neckCommands the bodice/facing draw (front half + back half, ×2 for the on-fold
  mirror). Verified vs native: crew 360 mm, scoop 420 mm, vNeck 450 mm, square
  476 mm, boat 378 mm.
- garment.cpp `edgeFinishPieces()`: collarless non-halter neck → bias strip;
  sleeveless armhole → a second bias strip trued to 2×armholeLength. A real
  collar (collarType != None) or edgeFinish == Facing → the old neck facings.
  Guide steps + fabric metrage (bias 0.1 m vs facing 0.2 m) branch on the finish.

## (1) Bias default + facing opt-in — WORKS
Native + wasm both confirmed:
- Default sleeveless scoop dress → `Bias binding (neckline)` (edge 420 mm) +
  `Bias binding (armholes)` (752 mm = 2×armhole), no facing, 0 issues.
- Facing opt-in (edgeFinish=facing) → Front + Back Neck Facing, NO bias, 0 issues.
- Sleeved top → neck bias only, no armhole strip. Correct.

## (2) Real-collar exception — CORRECT (render-approved)
- Shirt/stand collar top → keeps Neck Facing, draws NO neck bias, collar piece
  present, 0 issues. Rendered shirt-collar-top.png: collar stayed a separate
  piece on a faced neck.
- RENDER-APPROVAL (Chrome headless PNG, read + eyeballed):
  - `bias-default-dress`: 8 paper pieces (bodice panels + skirt), clean necklines
    + armholes ready to bind, register/grainline/cut+sew lines all present, no
    page-boundary breaks. Bias strips are thin chalk-note strips.
  - `facing-optin-dress`: 10 paper pieces — the two curved neck FACING panels
    appear (the bulk the bias replaces). Clear before/after.
  - fabric: bias 2.4 m vs facing 2.5 m (bias uses less).

## (3) Golden CHANGED + reproducible
- Patch 3.10 changes the DEFAULT (facing → bias). Golden was re-pinned by making
  golden_dump set `edgeFinish = Facing` (the Swift reference predates bias) →
  surface stays BYTE-IDENTICAL: 0.000000 mm, 23034 lines. This is the proof the
  Facing opt-in reproduces the pre-3.10 output exactly, byte for byte.
- New `bias_check` (independent) proves: strip length == neckEdgeLength + overlap
  (0.00 mm across every neckline), 45° bias cut note, real collar → no bias, bias
  neck sleeveless → armhole strip, facing opt-in reproduces facings + no armhole
  strip, bias uses less fabric.

## (4) Benchmark number — HONESTLY UNCHANGED (31/54)
Edge finish is a finish-QUALITY change, not a new drawable element. The neckline
and armhole were ALWAYS finished (facing before, bias now); they were never in
the out-of-vocab gap list, so no photo's "missing" set shrinks. The local
benchmark-58 dataset + vision are not available here (gitignored + no credit), so
no reclassify was run — and none would move the count. Counter stays 31/54,
stated honestly in patch 3.10.

## (D) Honest limit
A very sharp inner corner (a true notched / sailor collar) is not a bias case; it
stays a collar/facing piece or honest in missing.js. No silent no-op — the finish
is always a real piece.

## Proof regime (all green)
- ctest 21/21 (incl. new bias_check; sweetheart/keyhole/collar updated to the new
  default: sweetheart + collar validate the facing so they opt into it, keyhole
  anchors its steps after either finish).
- golden byte-identical (0.000000 mm / 23034 lines).
- web-fuzz 20260 drafts / 0 failures (added a 150-draft bias/facing/collar sweep).
- vocab-sweep 37800 / 0.
- precision worst pair 0.00 mm.
- render-pages 0 issues; 3 PNGs eyeballed (bias / facing / collar).
- style-lint clean (53 pages + 7 css); header-diff clean (46 pages).

## Bridge
- create.js: manual "kenar bitişi: biye / pervaz" picker (default bias, hidden on
  collar/halter/skirt); vision path pins bias (a finish choice, not a garment read).
- missing.js: a "bias-bound / bound" neck read now counts as DRAWN (bias is the
  default finish), no longer listed as honest-missing.
- engine.js / backend/draft.js / wasm bindings: int `edgeFinish` param (LAST
  positional arg, 0 = bias default). Both wasm targets rebuilt.
- API.md: edgeFinish row added.

## Files
- engine/src/measurements.hpp (EdgeFinish enum + spec field)
- engine/src/bodice.hpp / bodice.cpp (biasBinding, neckEdgeLength, halfNeckLength)
- engine/src/garment.cpp (edgeFinishPieces + guide steps + metrage, both blocks)
- engine/src/validator.cpp (facingIssues bias branch)
- engine/src/keyhole.cpp (step anchor after bias OR facing)
- engine/tests/bias_check.cpp (new) + CMakeLists.txt
- engine/tests/golden_dump.cpp, sweetheart_check.cpp, collar_check.cpp, keyhole_check.cpp (pinned to Facing where they test facings)
- engine/wasm/bindings.cpp, engine/build-wasm.sh outputs
- engine/tools/web-fuzz.js, render-pages.mjs
- web/js/engine.js, create.js, missing.js; backend/draft.js
- engine/FORMULAS.md ("Bias binding edge finish"); backend/API.md
- web/patches.html (3.10), web/index.html + ?v bump (pages 75, js 59)
