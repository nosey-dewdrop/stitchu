# vision — Track B: owning the eye

Goal (PLAN.md): kill the per-call Opus cost. The vision step is bounded classification
into the worker's fixed vocabulary — tractable to own.

## v0 result (2026-07-13): zero-shot is NOT enough — measured, not guessed

Eval corpus: real garment photos fetched from Wikimedia Commons (`fetch-eval.sh`),
19 keepers eye-labeled by hand in `eval/labels.json` (nulls = not visible; junk
search hits listed in `_dropped`, files kept on disk).

Per-attribute accuracy vs the eye labels (`node vision/eval.js <file>`):

| model | overall | notes |
|---|---|---|
| CLIP ViT-B/16 zero-shot (`clip-v0.js`) | 44% | neckline 6%, length 20% — unusable |
| SigLIP base zero-shot (`clip-v0-siglip.js`) | 65% | sleeves 88 / fabric 89 / waistline 79, but neckline 31, skirtStyle 38 |
| **Opus via live worker** (`eval/opus-predictions.json`, 9 photos) | **86%** | length/waistline/fabric 100%; half the misses are genuine boundary calls (cropped qipao dress-vs-top, square-vs-boat Edwardian neck) |

Product bar is ~95%; zero-shot open-vocab models don't reach it and prompt
tuning won't close a 30-point gap. FashionCLIP is gated on HF (couldn't test).

## v1 plan (unchanged from PLAN.md, now with numbers)

Distill the teacher: Opus auto-labels a large garment-image corpus with the exact
worker vocabulary (effective teacher quality ≈ 90%+ on unambiguous attributes) →
train a small per-attribute model (frozen encoder + heads) → replace the Opus call.
The @xenova/transformers ONNX stack used here runs in the BROWSER too, so the
student can ship client-side next to the WASM engine: zero marginal vision cost.

Files: `clip-v0*.js` (zero-shot runners), `eval.js` (scorer), `eval/labels.json`
(ground truth), `eval/*-predictions.json`, `fetch-eval.sh` (corpus fetcher).
Note: the public worker fuse (15/day/IP) caps Opus eval batches — 4 of 13 calls
hit the cap today; rerun tomorrow to extend `opus-predictions.json`.
