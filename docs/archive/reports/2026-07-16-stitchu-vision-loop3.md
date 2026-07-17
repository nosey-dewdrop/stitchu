# stitchu — VISION LOOP 3 / PATCH 2.3 (V3: front/back consistency) — REVERTED

**PATCH 2.3 — front/back consistency (reverted)**
- 2026-07-16. Broadened the worker vision prompt: on a back / worn / close-up
  detail photo, leave the front-only fields (neckline, shaping, waistline,
  skirtStyle) `null` instead of inventing them from partial evidence — one
  garment, one reading, and `null` is the honest answer the pattern tolerates.
- FULL 24/54 → **21/54** (measured live) → reverted → 24/54. vision-accuracy
  86.8% → 87.0%. Front/back field conflicts 15 (V0) → 8 (this loop's before).
- Honest note: the right instinct, the wrong lever. The benchmark manifest still
  credits a back-view photo for the front's neckline, so nulling it *loses* a
  FULL. Regression guard fired; change rolled back.

## What LOOP 3 was supposed to do
DEVAM-VISION-LOOP.md LOOP 3 (V3): the same dress's front and back photos are read
as two garments and conflict. Two candidate fixes; pick the smaller:
- (a) prompt rule — a back/worn view leaves front-only fields null (fixes the
  product too);
- (b) benchmark-side grouping — same-product photos vote by majority (fixes only
  the measurement).
Instruction: **try (a) first.** Same regression guard as LOOP 2.

## Credit check (first thing)
Live probe against the worker `/api/analyze` with the FAST bypass token returned a
valid vision spec (`claude-opus-4-8`, clean JSON) — **credit available.** No
fabricated numbers below; the reverted run was a real 59-call FAST measurement.

## Before state (post-2.2, this loop's baseline)
From `results-before-2.3.json` (the on-disk post-2.2 results):
- FULL **24/54**, correct-reject 4/5, WRONG 4, MISSING 26.
- vision-accuracy 51/54 (94.4%) at the moment of the frozen file; neckline
  misreads 2.
- **Front/back field conflicts: 8, across 4 products** (V0 counted 15 across 8 —
  LOOP 2's neckline block already cut it roughly in half). Remaining conflicts:
  - priscilla babydoll :: neckline scoop vs square
  - jackie 60s linen mini :: neckline square/crew/boat · shaping princess/null/dart · skirt aLine/straight
  - mira dress :: shaping princess/dart · waistline empire/natural · skirt gathered/aLine
  - the jackie gingham :: neckline crew/boat
  These are exactly the back / worn / macro-detail photos inventing a front-only
  field — V3's target.

## The change (candidate (a))
Two sentences appended to the worker prompt's neckline block:
- FRONT-ONLY FIELDS ON A PARTIAL VIEW — on a back / close-up / flat-lay / cropped
  shot where the front bodice and hem are not both plainly visible, return null
  for any of {neckline, shaping, waistline, skirtStyle} not actually visible from
  the front; a back or detail photo contributes only what it genuinely shows.
- ONE GARMENT, ONE READING — front-facing fields belong to a front you may not be
  seeing; leave them null rather than assigning a value that disagrees with the
  true front.
Zero C++, zero engine/motor code, golden untouched. `wrangler deploy` (version
d1dff290) — the vision worker only; the product flow uses the browser wasm.

## Measurement (live FAST, 59 calls, ~8m, same conditions as 2.2)
| metric | before (2.2) | after (2.3) |
|---|---|---|
| FULL | 24/54 | **21/54** |
| correct-reject | 4/5 | 1/5 |
| vision-accuracy | 86.8% | 87.0% |
| neckline misreads | 5 | 4 |

The rule DID what it was designed to (JACKIE back crew→null, Priscilla worn
square→null-on-front), and vision-accuracy ticked up. But FULL fell:
- **JACKIE back (tie visible): FULL → WRONG** (crew → null). The manifest accepts
  `crew` here (it was labeled with the front's neckline), so nulling it — even
  though nulling is the *honest* read of a back photo — drops the photo out of
  FULL. This is the rule's direct cost.
- Additional noise from vision run-to-run variance, not the rule: 2 control
  screenshots parse-failed to ERROR (transient prose-not-JSON), 1 control flipped
  REJECT-OK→REJECT-FAIL, and several clear FRONT shots drifted (Celine boat→vNeck,
  Mira front boat→square, Boat-Neck-Top dart→princess, Heloise vNeck→boat in our
  favor). These are the model's nondeterminism, independent of the prompt line.

## Regression guard → REVERT
LOOP rule: **if FULL drops, the prompt change is reverted and reported.** FULL
went 24 → 21. Even isolating the rule's own effect, JACKIE back FULL→WRONG is a
genuine rule-caused regression. Reverted:
- worker.js restored to the 2.2 prompt (byte-clean: `git diff backend/worker.js`
  is empty), redeployed (version c9fcc992).
- `results-2026-07-16.json` restored from `results-before-2.3.json` so the
  published score stays at the honest 2.2 baseline.

## Why (a) was the wrong lever — and what the right one is
Candidate (a) *does* fix the garment (a back photo should not claim a front
neckline). But this benchmark measures per-photo, and the manifest labels each
back photo with the whole garment's neckline. So the moment vision honestly says
"I can't see the front, null," the benchmark — which was rewarding the lucky
correct guess — records a loss. The instinct is right; the measurement punishes
it. The real fix is candidate (b), **measurement-side**: group the same product's
front+back+detail photos and take a field-level majority vote, so one honest null
on the back is covered by the front's real read. That is a benchmark-script
change (no prompt, no risk to the live product), and it is the correct next loop —
not another prompt sentence.

## CHAIN TOTAL (V0 → V3), the three-loop effect
| metric | chain start (V0 baseline) | chain end (after 2.2, held) |
|---|---|---|
| FULL /54 | 22 | **24** (+2) |
| ELEMENT ACCURACY /103 | 53 (51.5%) | 53 (51.5%) — vision chain, engine untouched |
| vision-accuracy | 46/53 (86.8%) | 51/54 (94.4%) |
| neckline misreads | 5 | 2 |
| front/back field conflicts | 15 (8 products) | 8 (4 products) |

The whole vision chain moved FULL +2 and roughly halved both neckline misreads
and front/back conflicts — all from prompt wording, zero engine code, zero golden
drift. LOOP 3 added no FULL: it proved that the remaining front/back conflicts are
a *measurement* artifact, not a prompt one.

## Next-phase decision (Damla's call)
- **V3 done as (b):** benchmark-script majority vote across same-product photos —
  cleanest remaining vision win, measurement-only, no product risk.
- **FAZ K** (bridge holes: cupSeams/strapless — L1 sees, L3 can't draw), or
- **V4** (vision confidence threshold: say "uncertain" → honest MISSING instead of
  a false FULL). The 2.3 experiment is real evidence FOR V4: an honest null is
  currently penalized, which is the same tension V4 must resolve.
Keypoint / backend-move / morphing remain proven-rejected (mimari-derin-analiz).

## Deliverables
- Report: this file. Score row + 4 ASCII bars (incl. new front/back-conflict bar):
  reports/stitchu-vision-progress.md.
- Patch note: web/patches.html patch 2.3 entry (EN/TR, "reverted" honest, misses
  included), cache-bust v60, deployed.
- Content: linkedin.md Essay 16 (the reverted-loop essay) + devlog.md series Z3.
- CLAUDE.md status + DEVAM-VISION-LOOP.md NEREDEYİZ updated.
