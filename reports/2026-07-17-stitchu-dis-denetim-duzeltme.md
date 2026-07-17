# stitchu — external-audit fix (patch 3.8)

2026-07-17. An independent LLM measured a live A4 pattern (sleeveless gingham
boat-neck button blouse) as vectors and found a real engine bug. This report
records the audit report verbatim, the reproduction, the fixes, before/after
measurements, and the render-onax PNG findings.

## The external audit (verbatim, condensed)

Root bug (most critical): the engine drew this blouse with a FRONT button
placket — 7 evenly-spaced button marks down the center front + a placket fold
line 1.8 cm inside CF — while the front was still "cut 1 on fold". You cannot sew
buttons onto a fold; the result never opens, the head never goes through (neck
circumference 36.8 cm), unwearable. Evidence: the sewing line spills OUTSIDE the
cutting line at CF by exactly 1.8 cm (the leftover stand allowance). The placket
decision and the fold decision contradict, one was never cleaned up. Back center
also inconsistent (SA 2.35 cm at hem vs 1.5 cm at neck).

Secondary (all to be verified):
1. No armhole finish on a sleeveless garment (neck has facings, armhole has
   neither facing, bias, nor yardage).
2. Facings lack grainline; Back Neck Facing "cut 2" lacks a fold note.
3. Boat neck wrong: engine draws a standard round neck (front width 16 cm) while
   a real bateau is 20-24 cm, opening to the shoulders, wide and shallow.
4. Ease low (~2 cm bust vs 6-10 cm woven); fabric estimate high (1.7 m vs ~1.2 m).

## Reproduction (before fix)

Spec: top / dart / natural / woven / boat / sleeveless / frontPlacket, EU38 body.
The engine ITSELF emitted a validator issue confirming the bug:

    Top Front | cut="cut 1 on fold" | marking point (-24.0, 48.0) falls outside the piece

Worse than the audit thought: on the extended-TOP topology the CF edge is a
straight LINE, and the old placket code only offset "the final CURVE, i+2 >=
size" — so the stand grew NOTHING, yet buttonholes were still stamped past CF.
The princess-DRESS topology (audit's PDF) DID grow the stand but stayed "cut 1 on
fold" → the 1.8 cm sewing-line-past-cut-line spill the audit measured. Two
topologies, same class of bug.

## Fixes (each with proof)

### (A) Placket / fold mutual exclusion — DONE (priority 1)
- `placket.cpp`: replaced the fragile index-based CF-edge detection with a
  geometry-driven rule — every outline vertex on the CF (|x| < 1 mm) grows outward
  by standWidth, except the true neck point; a jog line closes the stand top back
  to neck. Works on BOTH the curve-CF (dress) and line-CF (extended top) shapes.
- When a placket is applied the front (and its Front Neck Facing) flip from
  "cut 1 on fold" to "cut 2 (center front opening)". Placket and cut-on-fold are
  now mutually exclusive in the engine.
- Result: the gingham blouse now drafts with `issues: []` (was the spill error).
  Front reaches x = -18 mm (stand present) and is cut 2. WEARABLE.
- A secondary validator index-fragility surfaced (`topSideSeamLength` read the
  side seam by fixed index; the inserted jog line shifted it) → made that finder
  skip trailing near-center lines so it lands on the side seam in every topology.

### (B) Armhole finish — DONE (bias binding, no extra piece)
- Damla prefers bias binding over a separate facing piece. A sleeveless
  (non-halter) garment now COUNTS the armhole bias-binding fabric
  (`armholeBiasFabricMeters`, from the drafted armhole length), so the "finish the
  armholes with bias binding" guide step has real yardage behind it. Honest limit:
  bias binding is a strip cut on the fold at sewing time, not a drawn pattern
  piece — that is stated, not faked with a fake piece.

### (C) Facing grainline + fold note — DID NOT REPRODUCE (reported honestly)
- The engine already sets grainline on ALL pieces including both facings
  (`makeFacing` line 853, rendered by render.js:74 / sheet.js:374). Verified in the
  after-PNG: both facings carry grainline arrows. No change needed.
- Back Neck Facing "cut 2" is CORRECT (it mirrors the back bodice's CB seam), not
  a missing fold note. Audit misread; reported, not "fixed" for show.

### (D) Boat neck — DONE
- `neckWidthMultiplier(Boat)` 1.35 → 1.85 (still under the shoulder-share clamp).
- Front full neck width 166 mm → 226 mm (in the 200-240 mm bateau target), depth
  stays shallow (28 mm), neck opening 378 mm → 505 mm. Boat now reads distinct
  from a round neck. (For a placket blouse the CF opening handles head entry; a
  fitted crew/scoop also can't clear a head without an opening — that is normal.)

### (E) Ease + fabric — verified, no change
- `chestEase = 0.11` already yields ~9.9 cm woven bust ease (in the 6-10 cm
  range the audit wanted). The audit's "~2 cm" did not reproduce. Fabric estimate
  left conservative (safe over-estimate beats under-buying); the armhole binding
  from (B) is added for accuracy.

## Before / after measurements (gingham boat placket blouse, EU38)

| | before | after |
|---|---|---|
| Top Front cut | cut 1 on fold | cut 2 (center front opening) |
| Front stand reach | x = 0 (no stand grown) | x = -18 mm |
| Front Neck Facing cut | cut 1 on fold, interface | cut 2 (center front opening), interface |
| validator issues | marking (-24,48) outside piece | none |
| boat front neck width | 166 mm | 226 mm |
| boat neck opening | 378 mm | 505 mm |
| fabric estimate | 1.7 m | 1.8 m (+armhole bias) |

## RENDER-ONAY (Chrome headless PNG, eyeballed)

Rendered the blouse strip.svg before and after, rasterized with Chrome
`--headless --screenshot`, read both PNGs.
- BEFORE: Top Front labeled "cut 1 on fold"; the fold line + buttonhole ticks sit
  on/past the left CF fold edge with NO stand — marks spill outside the cut line.
- AFTER: Top Front labeled "cut 2 (center front opening)"; TWO parallel dashed
  lines (CF fold + fold-back facing) with the cut outline grown OUT past them, the
  buttonhole ticks now INSIDE the cut line on the stand. Front Neck Facing labeled
  "cut 2 (center front opening), interface". Boat neckline visibly wide + shallow.
  Both facings + both body pieces carry grainline arrows. No page-boundary breaks,
  cut + sew lines both present, register/grainline/cut notes in place.

## Golden change (re-pinned, every line attributed)

The golden reference moved, as a real bug fix. Every changed line was checked:
- Boat width: 1708 lines changed, ALL on `/boat/` drafts, ZERO non-boat lines.
- Armhole bias: 65 `fabric,X` lines changed, ALL on sleeveless (`none.`) drafts,
  +0.1 m each, ZERO non-fabric / non-sleeveless lines.
Golden re-pinned; diff now 0.000000 mm across 23034 lines.

## Proof regime

- ctest 20/20 (incl. placket_check: petite crop TOP now grows the stand, which it
  silently failed to do before).
- golden diff PASS (0.000000 mm, re-pinned).
- web-fuzz 20110 drafts / 0 failures (placket axis covers boat + all necklines,
  dress + top, princess + dart).
- vocab-sweep 37800 / 0 sewability failures.
- style-lint clean (53 pages + 7 css), header-diff clean (46 pages).

## Benchmark (0-credit cache reclassify)

FULL PATTERN unchanged by this fix (published count is 37/54 after the parallel Jackie asymmetric-placket loop; a pre-rebase 0-credit reclassify on the older cache read 31/54, this fix does not move either). This is a correctness fix, not a new element:
front placket was already counted as "drawn" (just drawn wrong), so the count
does not move. vision-accuracy 94.4%, element accuracy 58.3% — unchanged
(this loop is C++ geometry, not the JS classifier). No photo regressed. Honest:
no number to celebrate here; the win is that a pattern the count already claimed
is now actually wearable.

## Files touched

engine/src/placket.cpp, engine/src/bodice.cpp, engine/src/bodice.hpp,
engine/src/garment.cpp, engine/src/validator.cpp, engine/golden-reference.csv,
engine/tools/render-pages.mjs (added the gingham repro spec),
web/vendor/stitchu-engine.js + backend/engine/stitchu-worker.{js,wasm} (rebuilt),
web/patches.html (patch 3.8), web/js/engine.js (wasm ?v), site ?v 73→74 / js 58→59.
