# vision-student — our own CV (Track B distillation)

The **student** learns each construction field from the teacher's cached labels
(`dataset/labels/*.json`, produced by the D2 labelling loop). Goal: run in the browser
via ONNX at zero LLM cost. This directory is D3 stage 2: the training skeleton with a
single field wired up — **neckline** (the most-labelled field).

The classes are copied verbatim from the teacher schema in `backend/worker.js`:
`crew, scoop, vNeck, square, boat, sweetheart, halter` (+ `null`). See `vocab.py`.

## AMBAR YASASI (why the dataloader drops samples)
A label is a **cache**, not ground truth (see `../DEVAM-DATA-LOOP.md`). The dataloader
enforces the ambar law so nothing downstream can bypass it:
- teacher abstained (`neckline: null` / `"belirsiz"`) → sample **excluded** (never
  mapped to a class);
- suspect batch (teacher anchor check failed, listed in
  `dataset/labels/suspect-batches.json`) → whole batch **excluded**;
- missing photo file → excluded;
- low confidence (once the teacher emits calibrated confidences) → excluded.

Every training run prints its filter stats: `{seen, kept, no_photo, uncertain, suspect, low_conf}`.

## Files
- `vocab.py` — class lists (must stay identical to `backend/worker.js`) + uncertain-value filter.
- `dataset.py` — reads `dataset/labels/*.json`, pairs with `dataset/<brand>/<hash>.jpg`,
  applies the ambar filters. Handles both the nested `spec` label form and a flat form.
- `model.py` — small backbone (`mobilenet_v3_small` default, `efficientnet_b0` option) +
  a single Linear head; ImageNet transforms.
- `train_neckline.py` — training loop.
- `export_onnx.py` — checkpoint → ONNX (dynamic batch, opset 17), browser target.
- `eval_agreement.py` — student vs teacher agreement per class; the go-live gate.
- `test_onnx_load.py` — loads the ONNX and runs one forward pass (deploy-target proof).

## Setup (Python 3.11, Apple Silicon)
Torch has no stable wheels for Python 3.14 yet, so use 3.11:
```
python3.11 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```
**Mac note:** training auto-selects the **MPS** backend (Apple Silicon GPU) when available,
else CPU. Set `PYTORCH_ENABLE_MPS_FALLBACK=1` so any op MPS lacks falls back to CPU
instead of erroring.

## Run
```
# train (real ambar; needs enough non-null neckline labels)
PYTORCH_ENABLE_MPS_FALLBACK=1 .venv/bin/python train_neckline.py --epochs 30 --out runs/neckline.pt

# export for the browser
.venv/bin/python export_onnx.py --ckpt runs/neckline.pt --out runs/neckline.onnx

# how well does the student agree with the teacher?
PYTORCH_ENABLE_MPS_FALLBACK=1 .venv/bin/python eval_agreement.py --ckpt runs/neckline.pt

# smoke test with no ambar yet:
.venv/bin/python train_neckline.py --allow-empty --epochs 2
```

## Thresholds
- **Field go-live: ≥ 85 % student↔teacher agreement** on the labelled ambar
  (`eval_agreement.py` prints PASS/HOLD). Below that, keep serving the teacher for that field.
- Disagreements are written to `runs/<field>-disagreements.json` → seeds the periodic
  suspect-label audit (Denetim A): student vs teacher conflicts are the first place to
  look for bad cached labels.

## Not committed
`.venv/`, `runs/` (weights + onnx), `*.pt`, `*.onnx` are gitignored — same rejim as the
`dataset/` photos. The repo keeps only code; artifacts stay local.
