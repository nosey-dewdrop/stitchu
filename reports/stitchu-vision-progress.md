# stitchu VISION PROGRESS — one line per loop (append only)

Single shared score file for the vision loop chain. Each loop appends ONE row +
extends the ASCII bars. Numbers come straight from benchmark-58/results-*.json
reclassified against the current DRAWN_SINCE (no fabricated numbers; unmeasured =
left out, not guessed). Bars are proportional (█ = filled), source file named.

## SCORE TABLE

| loop | date | FULL /54 | ELEMENT ACC /103 | vision-acc | neckline misreads | note | source |
|---|---|---|---|---|---|---|---|
| 1 (V0 baseline) | 2026-07-16 | 22 | 53 (51.5%) | 46/53 (86.8%) | 5 | taxonomy + baseline only; no prompt/code fix. dominant vision error = neckline (5/7 WRONG, 5/8 conflicting products); 15 front/back field conflicts | results-2026-07-16.json |
| 4 (vitrin / patch 2.1) | 2026-07-16 | 22 | 53 (51.5%) | 46/53 (86.8%) | 5 | showcase loop — NO vision/engine change (reskin + patch-notes page + beta funnel only). numbers held by definition; the engine wasn't touched. waitlist endpoint probed live (HTTP 200). | results-2026-07-16.json (unchanged) |
| 2 (V1 neckline / patch 2.2) | 2026-07-16 | 24 | 53 (51.5%) | 51/54 (94.4%) | 2 | neckline disambiguation block in worker prompt (front+back = ONE garment; back/worn view never invents a neckline; halter only when a band wraps the neck; default to boat/crew/scoop). Live FAST run (59 calls, 8m20s). neckline misreads 5→2, FULL 22→24 (guard: FULL rose, no revert). The 3 fixed were all back/worn outliers (Mira back, Jackie gingham back, TieBack polka back); the 2 left are genuinely-ambiguous FRONT reads (JACKIE front, one vNeck). | results-2026-07-16.json (fresh live) |
| 3 (V3 front/back / patch 2.3, REVERTED) | 2026-07-16 | 24 | 53 (51.5%) | 51/54 (94.4%) | 2 | broadened the prompt: on a back/worn/close-up view, null the front-only fields (neckline/shaping/waistline/skirtStyle) instead of guessing. Live FAST run (59 calls, 8m). vision-accuracy 86.8%→87.0%, but FULL 24→21 — a back photo the manifest still credits for its front neckline went null and left FULL. REGRESSION GUARD fired → reverted, 2.2 worker redeployed, results restored. Front/back field conflicts 15 (V0)→8 (post-2.2, this loop's before). The real fix is measurement-side (group same-product photos, majority vote), not another prompt sentence. | results-before-2.3.json (before) + measured-then-reverted run |

## ASCII BARS (each loop one triplet: FULL, ELEMENT ACCURACY, VISION-ACCURACY)

FULL PATTERN /54 (target 54)
```
L1 V0  22/54  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  40.7%   results-2026-07-16.json
L4 VIT 22/54  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  40.7%   vitrin loop — engine untouched, published 22/54 on the new patch-notes page
L2 V1  24/54  ██████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  44.4%   results-2026-07-16.json (fresh) — +2 from neckline flips
L3 V3  24/54  ██████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  44.4%   REVERTED — broad null rule measured 21/54 live, guard fired, rolled back to 2.2
```

ELEMENT ACCURACY /103 (daily compass)
```
L1 V0  53/103 █████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░  51.5%   results-2026-07-16.json
L2 V1  53/103 █████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░  51.5%   unchanged — vision loop, not an engine/element loop
L3 V3  53/103 █████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░  51.5%   unchanged — reverted vision loop, engine untouched
```

VISION-ACCURACY (critical-field clean, /54 draftable garments)
```
L1 V0  46/53  ███████████████████████████████████████████░░░░░░  86.8%   results-2026-07-16.json
L2 V1  51/54  ███████████████████████████████████████████████░  94.4%   results-2026-07-16.json (fresh) — the ERROR photo now returns a valid spec too
L3 V3  51/54  ███████████████████████████████████████████████░  94.4%   held (reverted) — the 2.3 run measured 87.0% but cost FULL; kept 2.2's 94.4%
```

FRONT/BACK FIELD CONFLICTS (lower is better; the LOOP 3 target)
```
L1 V0  15     ███████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  15 conflicts (8 products)   taxonomy build (V0)
L2 V1   8     ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   8 conflicts (4 products)   results-2026-07-16.json (neckline conflicts mostly gone after 2.2)
L3 V3   8     ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   8 conflicts (4 products)   held — null rule cut conflicts but cost FULL, reverted; measurement-side vote is the real fix
```

NECKLINE MISREADS (lower is better; the LOOP 2 target)
```
L1 V0   5     █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  5 photos   results-2026-07-16.json
L2 V1   2     ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  2 photos   results-2026-07-16.json (fresh) — 3 back/worn outliers fixed
```

## READING THIS
- FULL is the true product metric (whole pattern, no missing element) — clustered,
  moves slowly. ELEMENT ACCURACY is the daily compass (per-element).
- VISION-ACCURACY is NEW this loop: it isolates the vision layer from the engine.
  86.8% already looks high, but the 7 misses are the CHEAP wins (no C++, no risk) —
  5 of them are one field: neckline, on the back/worn-view photo of a product whose
  front reads correctly. LOOP 2 (V1) attacks exactly this.
