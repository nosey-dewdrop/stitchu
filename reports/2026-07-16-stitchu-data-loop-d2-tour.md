# stitchu — FAZ D / D2 NIGHT TOUR: open-set vocab mining (partial — credit died)

Date: 2026-07-16 (night)
Branch: FAZ D data pipeline. D1b closed the pool at 28,246 photos; this tour mined it.

## What was planned vs what happened
Plan: layered, category-balanced sample of ~2,500 photos from the open-set pool,
labelled through the live vision chain (FAST tempo, bench token), then aggregate +
anchor health test + canonicalized frequency table.

Reality: the credit probe passed (1 photo, full structured spec back), the batch
started healthy, and the API credit ran out at photo 227/2,500. Everything up to
that point is banked and valid; nothing after it is fabricated. 48 requests failed
with `credit balance is too low` (37 in-batch + the tail), 0 other error types.

## Numbers
- Labels banked THIS tour: **230** open-set (226 batch + 4 pipeline sanity run).
- Warehouse total: **389** labels (previous brand mining 159 + this tour 230).
  By source (names LOCAL only): open dataset 208 + open brand 22 + uniqlo 121 + handm 38.
- Balance held even in the partial batch — the round-robin sampler drew 22-24 per
  category across all 10 open-set categories before dying:
  blouses 24, dresses 24, jackets 24, cardigans 24, rompers 23, skirts 23,
  sweatshirts 22, tops 22, tees 22, sweaters 22.
- Raw out-of-vocab instances: **1,142** → canonical terms: **840**
  (canonicalization: 75-entry override map `dataset/vocab-canonical.json` +
  deterministic rule normalizer: hyphen/whitespace, plural, verb/adjective stems).
- Errors during labelling (before credit death): 0.

## ANCHOR HEALTH TEST — NOT RUN (AMBAR YASASI stamp)
The anchor test needs the same credit the batch exhausted; the probe returned the
same `credit balance too low` error. Per the warehouse law:
- **This batch carries NO health stamp → status: SUSPECT / NOT-FOR-TRAINING**
  until an anchor pass (>=80% agreement on 10 human-labelled benchmark photos)
  runs after credit refill: `node engine/tools/mine-vocab.mjs --anchor 10`.
- The labels stay valid as a vocab-frequency SIGNAL (frequency counting is robust
  to individual label noise); they do not enter student training unstamped.
- Labels are a CACHE: every one is re-producible from the local photo + manifest.

## CANONICAL TOP-20 (market frequency map — the new FAZ M compass)
Terms are canonical (synonym/plural surface forms merged; "forms" = how many
surface phrasings collapsed into the term). ★ = intersects the 58-set
marginal-gain list (reports/2026-07-16-stitchu-metrik-reformu.md).

| # | canonical term | freq | forms merged | 58-set marginal |
|--:|---|--:|--:|---|
| 1 | button cuff | 33 | 4 | |
| 2 | hood | 17 | 2 | |
| 3 | dropped shoulder | 15 | 3 | |
| 4 | side pocket | 14 | 3 | |
| 5 | patch pocket | 13 | 5 | |
| 6 | shirttail hem | 12 | | |
| 7 | ribbed cuff | 11 | | |
| 8 | ribbed hem | 10 | 2 | |
| 9 | front button placket | 10 | 4 | ★ placket (+1 FULL) |
| 10 | stripe print | 9 | 2 | |
| 11 | elastic waistband | 9 | 5 | ★ gathering family (+6 via drawstring/shirred) |
| 12 | shirred bodice panel | 8 | 3 | ★ drawstring/shirred gathering (+6 FULL, #1 marginal) |
| 13 | drawstring at hood | 7 | 2 | ★ drawstring family (different location) |
| 14 | belt loop | 7 | | |
| 15 | kangaroo pocket | 6 | 2 | |
| 16 | button-down collar | 6 | 2 | ★ collar |
| 17 | pussy-bow neckline | 6 | | |
| 18 | oversized boxy fit | 6 | 3 | |
| 19 | open front cardigan | 6 | 2 | |
| 20 | floral print | 5 | | |

Just below the cut: side hem slit (5) ★ hem slit (+2 FULL); strapless bodice/bandeau
(2+2) ★ cupSeams/strapless; peplum flounce at waist (1) ★ peplum (+2).

## What the map already says (even partial)
1. **The market's top misses are NOT the 58-set's top misses.** The 58-set compass
   points at gathering/open-back/peplum; the market compass points at button cuffs,
   hoods, dropped shoulders and pockets — casual/knitwear construction the Etsy-style
   benchmark barely contains. Both are real; they answer different questions
   ("win the benchmark" vs "cover the market").
2. **The two compasses AGREE on gathering and placket.** shirred bodice panel +
   elastic waistband + gather-waist variants (combined well over 20 instances) sit
   high in both lists — drawstring/shirred gathering stays the #1 engineering target.
3. **Canonicalization matters at scale:** 1,142 raw instances would have scattered
   into 900+ rows; 840 canonical terms with the head consolidated (button cuff's 33
   came from 4 phrasings). The override map is hand-curated and grows with the data.

## Cost / credit
- Credit state at end: EXHAUSTED (verified by probe; every call returns
  `invalid_request_error: credit balance is too low`).
- Spend this tour: 231 successful Opus vision calls (230 labels + 1 probe).

## Next (when credit refills)
1. `--anchor 10` FIRST → stamp this batch (it is retroactively stampable: same
   teacher version v1-postV1, unchanged prompt).
2. Resume the balanced batch: the sampler skips already-labelled hashes, so the
   same command continues where it died:
   `node engine/tools/mine-vocab.mjs --openset --limit 2270 --pool training`
3. Re-aggregate; the canonical map carries over.

## Red-line check
- dataset/ (photos, labels, manifests, canonical map, frequency table) gitignored —
  nothing pushed. Committed: tool code (openset sampler + canonicalizer), reports,
  progress line, patch-note count fix.
- Source names appear only in local files; public wording stays "open dataset".
