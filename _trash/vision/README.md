# vision — Track B: owning the eye

Goal (PLAN.md): kill the per-call Opus cost. The vision step is bounded classification
into the worker's fixed vocabulary — tractable to own.

## v0 result (2026-07-13): zero-shot is NOT enough — measured, not guessed

Eval corpus: real garment photos fetched from Wikimedia Commons (`fetch-eval.sh`,
since deleted; recovered from `0af5f83`), 19 keepers labeled in `eval/labels.json`
(nulls = not visible).

★ CORRECTED 2026-08-26 (GECE7/F2 İŞ 1). Two sentences here were false; both
corrections are measured, not argued:

- *"junk search hits … files kept on disk"* — they are **not** kept any more. The
  10 `_dropped` files were deleted from disk and from the index; the pool is 19.
  `engine/tests/py/test_kaynak_kunye.py` keeps them gone.
- *"eye-labeled by hand"* — the labels are a **model's** labels, as `labels.json`'s
  own header says (*"labeled by eye (Fable, 2026-07-13)"*). Every accuracy number
  below, and `hedef_kosu`'s H2, is therefore a model scored against a model, and is
  provisional until the referee fills `eval/labels-hakem-BOS.json` (§1F md.3).

Per-file credit (Commons page, author, license, capture condition) now exists and is
proved by sha256 identity, not by resemblance: `eval/recover-credits.py` →
`eval/credits.json` → `dataset/hedef-10/KAYNAK.md`. **The filename is the SEARCH
TERM, not the content** — the fetcher wrote `NN-<query slug>.jpg` whatever Commons
returned, which is why `17-knit-sweater-mannequin.jpg` was a WW2 museum vitrine.

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
