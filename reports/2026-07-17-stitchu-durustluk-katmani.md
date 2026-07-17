# stitchu honesty + source layer (2026-07-17)

An external LLM cloned the engine, read it, and made two sharp, correct calls.
This loop fixes both. No engine/golden/vision code was touched, only docs and site
copy (README, engine/FORMULAS.md, web/index.html, web/benchmark.html).

## The two critiques and what changed

| # | external LLM critique | fix |
|---|----------------------|-----|
| 1 | "measured, not claimed" reads as if it PROVES fit, but 70,200 drafts / 0.00 mm seams / golden byte-identical all prove the engine's INTERNAL CONSISTENCY, not fit. The real outside reference (the benchmark number) was buried at the bottom, behind four six-figure internal numbers. | Benchmark number (37/54, live) pulled to the TOP as the primary outside reference on both README and benchmark.html and into the index hero chip + first proof card. Internal-consistency numbers explicitly relabelled "internal consistency, not a fit proof" everywhere they appear. The "proven to fit" hero + "the finished waist lands within ~9 mm of your body" fit framing removed (it dressed an internal audit value as a fit guarantee). |
| 2 | The ASSUMPTION tags in FORMULAS.md (bicepsRatio 0.30, shoulderDrop 0.23, underbust bust-70, waist 48/52, button 18 mm) are where the craft sits and where it is unproven; the muslin warning covered them but the README retoric slid over that line. | Every ASSUMPTION reviewed and bound to a source OR honestly stamped unvalidated (ledger below). Muslin/toile limit turned from a hidden footnote into a VISIBLE honesty line on the landing, the benchmark page, and the README. |

## Assumption ledger (FORMULAS.md new "Assumption ledger" section + inline tags)

No source was invented. Where a book value could not be confirmed the item is stamped
UNVALIDATED, not given a fake citation. Values were NOT changed, only labelled.

| assumption | value | classification | basis |
|-----------|-------|----------------|-------|
| shoulderDrop | shoulderHalf * 0.23 (~13 deg) | UNVALIDATED | Aldrich uses a fixed slope drop (~37 mm at std size), not a width ratio; the ratio form is single-source, no confirmed published number. Validate with a muslin. |
| underbust | max(bust - 70, waist) | SOURCE-BOUND (range) | ~5 cm bust-to-underbust drop = standard B/C-cup relationship (Aldrich / Armstrong bust-dart + cup sizing); 70 mm in that band. Off for extreme cups, covered by the optional upperBust input + muslin. |
| waist split | back 48% / front 52% | SOURCE-BOUND (convention) | front carries slightly more than back = standard bodice balance (Aldrich, Armstrong); the exact ratio is a conventional design choice inside the convention. |
| biceps ratio | bust * 0.30 | UNVALIDATED | arm girth is not collected; 0.30 has no confirmed published number and biceps varies independently of bust. A future arm-girth input replaces it. |
| biceps ease | * (1 + 0.15) | SOURCE-BOUND | 15% set-in sleeve ease = FreeSewing Brian / standard practice. |
| placket stand | 18 mm (blouse button dia) | UNVALIDATED | button size is not collected; Aldrich/Armstrong drive the stand off button diameter, 18 mm is a typical blouse button, documented, swap + re-draft for another. |

Tally: 2 source-bound, 3 unvalidated, 1 mixed (biceps = unvalidated ratio x source-bound ease).

## Verified benchmark number
37/54 full patterns. This loop started at 31/54 (peplum patch 3.5); during the rebase the
merged Jackie combo commit ("engine drafts an asymmetric placket and a cap sleeve") had
already reclassified 31 to 37 of 54 (six jackie gingham photos). Every 31 in this loop's
copy was corrected to 37 to match the live counter (index gcount = 37) exactly. No
fabricated number, this is precisely the fabrication trap the external LLM caught in an
older commit (it saw 24 while the repo was ahead); the number is pinned to the live value.

## Engine untouched (proof)
git diff --name-only = README.md, engine/FORMULAS.md, web/index.html, web/benchmark.html
only. No .cpp/.hpp/.csv/.js/.wasm changed, so the golden reference is byte-identical by
construction (no engine code ran differently). style-lint clean (53 pages + 7 css),
header-diff clean (46 pages).

## Deploy
?v 73 -> 74 on both edited pages, version badge v68 -> v74. Committed, rebased onto main,
pushed to gh-pages, live-curl confirmed the benchmark number now leads.
