# stitchu — FAZ D / D3 Stage-2 prep: student CV training skeleton + smoke test

**2026-07-16.** D3 stage 2: stand up the training skeleton for our own CV (Track B
distillation), wire up ONE field (neckline — the most-labelled), and prove the pipeline
runs end to end. No real (long) training yet — that waits for the ambar to fill. Git NOT
committed (files left in place per instruction).

## What the student learns
Neckline classes copied verbatim from the teacher schema in `backend/worker.js` (~L296):
`crew, scoop, vNeck, square, boat, sweetheart, halter` (+ `null`). `null`/uncertain is a
first-class exclusion, never a class.

## Skeleton files (all under `vision-student/`)
- `vocab.py` — class lists (must mirror worker.js) + uncertain-value filter (`label_to_index`
  returns `None` for null/"belirsiz"/out-of-vocab → sample dropped).
- `dataset.py` — `NecklineDataset`: reads `dataset/labels/*.json`, pairs with
  `dataset/<brand>/<hash>.jpg`. Handles the real label form (fields nested under `spec`,
  confidence as a dict, `pool:"training"` but photo under the brand folder) and a flat form.
  Enforces **AMBAR YASASI**: uncertain → drop, suspect batch (via
  `dataset/labels/suspect-batches.json`) → drop, missing photo → drop, low confidence → drop.
  Every run prints filter stats `{seen, kept, no_photo, uncertain, suspect, low_conf}`.
- `model.py` — small backbone (`mobilenet_v3_small` default; `efficientnet_b0` option) +
  single Linear head; ImageNet transforms (224, mean/std the ONNX consumer must match).
- `train_neckline.py` — training loop; auto-selects MPS on Apple Silicon; `--allow-empty`
  falls back to a synthetic per-class set for a no-ambar smoke test.
- `export_onnx.py` — checkpoint → **single-file** ONNX (dynamo=False so weights are inline;
  dynamic batch axis; opset 17). Browser target (onnxruntime-web).
- `eval_agreement.py` — student vs teacher agreement, overall + per class; go-live gate at
  **≥85%**; writes disagreements to `runs/neckline-disagreements.json` (seeds Denetim A audit).
- `test_onnx_load.py` — loads the ONNX and runs one forward pass (deploy-target proof).
- `requirements.txt`, `README.md`, `.gitignore` (ignores `.venv/`, `runs/`, `*.pt`, `*.onnx`).

## Environment note (real gotcha)
System Python is 3.14 — **torch has no stable wheels for 3.14 yet**. Built a venv on
**Python 3.11** (`vision-student/.venv`, gitignored): torch 2.13.0 (MPS available),
torchvision 0.28.0, onnx 1.22.0, onnxruntime 1.27.0, + onnxscript 0.7.1 (torch≥2.13's
onnx exporter needs it). Mac: training uses the **MPS** backend; set
`PYTORCH_ENABLE_MPS_FALLBACK=1`.

## Smoke test — PASSED (end to end)
Ran against the **real ambar** (the D2 labelling loop was actively filling
`dataset/labels/` during this session, ~30→46 labels):

| stage | result |
|---|---|
| dataloader | seen 34, **kept 31**, uncertain 3 dropped, no_photo 0, suspect 0 (AMBAR filter working) |
| train 2 epochs (MPS) | loss **1.93 → 0.92**, acc **0.13 → 0.71** — loop learns |
| ONNX export | single file, 7-class output, **5.97 MB** (5966.5 KB), opset 17, weights inline, no sidecar |
| ONNX load test | graph valid (ir_version 8), forward ok output `(1,7)`, **LOAD TEST PASSED** |
| agreement eval | ran clean; **62.9% (22/35)** at 2 epochs → correctly reports **HOLD** (below 85% gate); 13 disagreements written |

The 62.9% is meaningless as accuracy (only 2 epochs, tiny set) — the point is the gate,
per-class breakdown, and disagreement dump all produce correct output. Real training
(`--epochs 30`) waits until the ambar has enough non-null neckline labels; then the same
`eval_agreement.py` decides if neckline can go live.

## Not committed / local only
`.venv/` and `runs/` (weights `neckline.pt` ~6 MB + `neckline.onnx` ~6 MB) are gitignored,
same rejim as `dataset/`. Only the code stays in the repo.

## Next (D3 stage 3, later)
Add per-field heads (sleeveStyle, skirtStyle, ...) via the `FIELDS` registry; quantize the
ONNX (fp32 6 MB → int8) for a lighter browser payload; embed in the create flow once a
field clears 85% agreement.
