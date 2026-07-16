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

## ASCII BARS (each loop one triplet: FULL, ELEMENT ACCURACY, VISION-ACCURACY)

FULL PATTERN /54 (target 54)
```
L1 V0  22/54  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  40.7%   results-2026-07-16.json
L4 VIT 22/54  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  40.7%   vitrin loop — engine untouched, published 22/54 on the new patch-notes page
```

ELEMENT ACCURACY /103 (daily compass)
```
L1 V0  53/103 █████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░  51.5%   results-2026-07-16.json
```

VISION-ACCURACY (critical-field clean, /53 draftable garments)
```
L1 V0  46/53  ███████████████████████████████████████████░░░░░░  86.8%   results-2026-07-16.json
```

NECKLINE MISREADS (lower is better; the LOOP 2 target)
```
L1 V0   5     █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  5 photos   results-2026-07-16.json
```

## READING THIS
- FULL is the true product metric (whole pattern, no missing element) — clustered,
  moves slowly. ELEMENT ACCURACY is the daily compass (per-element).
- VISION-ACCURACY is NEW this loop: it isolates the vision layer from the engine.
  86.8% already looks high, but the 7 misses are the CHEAP wins (no C++, no risk) —
  5 of them are one field: neckline, on the back/worn-view photo of a product whose
  front reads correctly. LOOP 2 (V1) attacks exactly this.
