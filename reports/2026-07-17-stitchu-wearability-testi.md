# Stitchu — Wearability Test Layer (giyilebilirlik testi)

**Date:** 2026-07-17
**Loop:** wearability oracle — turn the outside-LLM lesson into a permanent, deterministic, zero-cost test.
**Credit spent:** none (local engine loop).
**Golden:** byte-identical (23034 lines, 0.000000 mm). The gate READS geometry, mutates nothing.

## The lesson
An external LLM read a stitchu pattern and found it unwearable while every internal
test was green: a blouse drawn to button up the front had been saved as one piece
"cut on fold", so nothing opened and no head could pass the neck. Damla's diagnosis
(correct): the existing tests (golden, ctest, web-fuzz, validator) measure INTERNAL
CONSISTENCY, not WEARABILITY. "Passed the tests" gave false confidence because it
tested the wrong thing.

This loop does not fix the engine (a parallel loop, patch 3.8, fixed the placket +
boat-neck bugs). It builds the permanent defence: a deterministic gate that catches
that class of bug for free on every draft, forever.

## What was built — the LLM's hand-found rules turned into deterministic checks

| # | LLM/tailoring rule (hand-found) | Deterministic check (permanent) | Kind |
|---|---|---|---|
| 1 | A closed-neck garment with no opening must let a head through | HEAD ENTRY: refuse only when the finished neck opening (2x(front+back half-neck), measured off the drafted center pieces) has collapsed below `neckOpeningDegenerateMM = 150 mm` — a dropped/corrupt neckline. Dresses (CB zip), halters (nape), placket/tie/back-cutout exempt via `hasDonningOpening()`. | **blocking** |
| 2 | A declared front opening can't be "cut on fold" with nothing to open | FOLD vs OPENING: if `spec.frontPlacket` but the front piece is still a plain fold at x=0 with no grown stand (x<0) and no button/fold markings -> the closure was dropped. This is the exact outside-LLM bug. | **blocking** |
| 3 | Every raw edge (armhole) needs a finish | EDGE FINISH: a sleeveless bodiced garment (not skirt, not halter) must carry a binding/facing piece OR an honest guide note to bind the armhole; neither -> raw fraying edge. | **blocking** |
| 4 | A woven garment needs real chest ease | WOVEN EASE: `wovenChestEaseMinMM = 20 mm`, already enforced upstream by the chest-width invariant; kept as an independent report line in the ctest. | test WARN |

Location: `engine/src/wearability.{hpp,cpp}`, called at the end of
`PatternValidator::issues` so a wearability issue BLOCKS a draft exactly like a
facing/keyhole issue (it cannot reach a PDF). Thresholds justified in
`engine/FORMULAS.md` "Wearability invariants" against Aldrich/Armstrong tolerances.

## The honest calibration story (why the head-entry rule is narrow)
The first attempt used an absolute neck-opening floor (520 mm, then 300 mm), then a
body-relative floor (opening >= neck girth). BOTH false-positived: a wide-shallow
boat/bateau neck legitimately draws a perimeter WELL under the neck girth (measured
455 mm on a 500 mm neck), and the shoulder clamp shrinks it further on a
broad-neck / narrow-shoulder body — all perfectly wearable drafts. The engine_check
2805-draft matrix flagged 60 such false positives. The finished perimeter is simply
a NOISY head oracle. So the head-entry rule was narrowed to a pure DEGENERACY guard
(collapsed-to-nothing opening), which never false-positives and still catches the
dropped-neckline corruption. The strong, body-independent wearability gates are
rules 2 (fold vs opening) and 3 (edge finish). This is the honest limit, stated in
the code and FORMULAS.md rather than hidden behind a threshold that quietly blocks
good patterns.

## How many of the 54 benchmark specs FAIL wearability?
**0 of 55.** (55 garment specs in the 2026-07-17 results set; the "54 benchmark".)
Harness: `engine/tools/wearability-bench.{cpp,mjs}` maps each vision-labelled spec's
opening signals (closure->placket/tie, backDetail->back opening) the same way
create.js does, drafts on a standard adult body, and runs the gate.

This is the truthful result and it is expected:
- Every neckline the vision reads yields a real adult opening (>=360 mm), far above
  the 150 mm degeneracy floor.
- The fold-vs-opening bug needs a placket drawn then dropped; on the fixed engine
  (patch 3.8) plackets draw correctly, and back/side button closures don't set
  frontPlacket, so no live spec hits that path.
- Sleeveless armholes all carry the honest bias-binding guide note.

The value is not a one-time number bump — it is a **permanent guardrail** that
would block the LLM's bug the moment it ever recurs. Proven by the ctest, which
reproduces the exact corruption (a collapsed neckline, a dropped placket, an
unfinished armhole) and confirms each FAILs, while every real draft PASSES.

## Proof
- **ctest 23/23** (my `wearability_check` #21 + the parallel loop's cap_sleeve +
  placket_asym = 23). wearability_check: real drafts across all garment types pass;
  a collapsed neckline / dropped placket / unfinished armhole each FAIL; the gate
  mutates nothing.
- **golden byte-identical** — 23034 lines, 0.000000 mm.
- **vocab-sweep 37800/0** — zero false positives across the full vocabulary.
- **web-fuzz 20110/0** — zero wearability issues (the only blocks are 8 pre-existing
  proportion issues on the implausible extreme body b3, unchanged behavior).
- **engine_check 2805-draft matrix** — passes (this is what caught, and killed, the
  perimeter false positives during calibration).
- **RENDER-ONAY** — rendered a real crew top (open 360 mm neckline, blue arc, gate
  passes) and a collapsed neckline (neck edge pulled onto the shoulder, gate blocks)
  to PNG via Chrome headless and read them by eye: the collapsed top visibly has no
  neck opening; the engine geometry itself is intact in both (the gate only reads).
- **coordination with patch 3.8** — the parallel motor-fix loop fixed the bugs; my
  gate passes on both the pre-fix corruption (ctest) and the post-fix engine
  (benchmark 0 unwearable). Test catches the right bug in both states.

## Files
- `engine/src/wearability.hpp` / `engine/src/wearability.cpp` — the gate (new)
- `engine/src/validator.cpp` — calls `Wearability::issues` at the end of `issues()`
- `engine/tests/wearability_check.cpp` — ctest #21 (new)
- `engine/tools/wearability-bench.cpp` / `.mjs` — 54-spec benchmark harness (new)
- `engine/CMakeLists.txt` — engine lib + wearability_check test + bench target
- `engine/build-wasm.sh` — wearability.cpp added to both wasm compile lines
- `engine/FORMULAS.md` — "Wearability invariants" section
- `web/patches.html` — patch 3.9 (EN/TR); `web/*.html` ?v 73->74
- `web/vendor/stitchu-engine.js`, `backend/engine/stitchu-worker.wasm` — rebuilt

## Deploy
main 89e24fc -> gh-pages 0bbdb65 (subtree split of web/). Live curl confirmed: index
v=74 / 37 of 54, patches.html patch 3.9 present, HTTP 200.

## Next (Damla)
This is exactly the "periodic external-LLM pattern audit -> every flaw becomes a
permanent test" step the CLAUDE.md status named. Next external audit finding ->
another wearability/quality invariant here.
