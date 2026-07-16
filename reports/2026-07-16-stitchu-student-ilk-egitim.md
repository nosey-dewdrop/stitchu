# stitchu — vision-student first real neckline training run (D3 stage 2)

Date: 2026-07-16
Field: `neckline` (7 classes: crew, scoop, vNeck, square, boat, sweetheart, halter)
Backbone: mobilenet_v3_small (ImageNet pretrained), MPS (Apple Silicon)

## Verdict: HOLD — does NOT pass the 85% gate
Held-out validation agreement student↔teacher: **49.3% (73/148)**. Gate is 85%.
Keep serving the teacher for neckline. This is the honest first number, not a claim.

## Ambar snapshot + AMBAR YASASI filter stats
Snapshot taken at run start: **913 label files** in `dataset/labels/`
(a parallel miner keeps writing; worked off a `/tmp` copy + the live count).
No `suspect-batches.json` exists yet → 0 suspect drops.

Dataloader filter result (`{seen, kept, no_photo, uncertain, suspect, low_conf}`):
```
{seen: 913, kept: 741, no_photo: 0, uncertain: 172, suspect: 0, low_conf: 0}
```
- **seen 913** → **kept 741**, **172 excluded** as uncertain (teacher wrote
  `neckline: null` / value out of the 7-class vocab — dropped per ambar law, never
  mapped to a class).

### Photo-path bug found + fixed (this is why the number is 741, not 141)
Before the fix the loader reported `no_photo: 600` — it only searched
`dataset/<brand>/` and the immediate subdirs of `dataset/`. But 679
`deepfashion-inshop` + 75 `princesspolly` labels store their photos one level
deeper, under `dataset/openset/<brand>/<hash>.jpg`. The photos were present the
whole time; the loader just never looked in `openset/`. Fix: `_find_photo` now
also searches `dataset/<aggregate>/<pool>/`. Result: `no_photo` 600 → 0, usable
samples 141 → **741**. Without this fix the first real run would have trained on a
crippled fifth of the ambar.

## Train/val split (leak-free, photo-based)
Stratified by class, seed 42, val_frac 0.2. Each label is one unique photo hash, so
a class-stratified label split is a photo split with zero photo shared across sides.
Singleton classes go to train only.
- **train = 593**, **val = 148**

Per-class distribution:
| class      | train | val |
|------------|-------|-----|
| crew       | 280   | 70  |
| scoop      | 122   | 30  |
| vNeck      | 107   | 27  |
| boat       | 39    | 10  |
| square     | 21    | 5   |
| sweetheart | 13    | 3   |
| halter     | 11    | 3   |

Training: class-weighted cross-entropy (to fight the crew majority), Adam lr 1e-3,
weight decay 1e-4, light aug (resize 224 + hflip), early stop on val acc (patience 6).
Best val at **epoch 2** (val_acc 0.493); train_acc climbed to 0.90 by epoch 7 while
val fell — textbook overfit on too little per-class data.

## Per-class agreement on held-out val (the honest gate)
| class      | agree/total | %     |
|------------|-------------|-------|
| crew       | 55/70       | 78.6  |
| scoop      | 15/30       | 50.0  |
| vNeck      | 2/27        | 7.4   |
| square     | 1/5         | 20.0  |
| boat       | 0/10        | 0.0   |
| sweetheart | 0/3         | 0.0   |
| halter     | 0/3         | 0.0   |
| **overall**| **73/148**  | **49.3** |

**Worst 2 classes: boat (0/10, 0.0%) and vNeck (2/27, 7.4%).**
(sweetheart and halter are also 0% but on only 3 val samples each — too few to trust
either way.) The model collapses toward the two majority classes (crew, scoop) and
barely learns the rest. vNeck is the sharpest failure: 107 train samples yet 7.4% val
agreement — the teacher's vNeck/scoop/crew boundary is likely noisy (a known suspect
for the periodic label audit; 75 disagreements written to
`runs/neckline-disagreements.json`).

## Data-scarcity analysis — why it fails and what each class needs
The blocker is **too few samples in the minority classes**, made worse by teacher-label
noise on the crew/scoop/vNeck cluster:
- crew (350 total) is the only class with enough data to reach ~79%.
- boat/square/sweetheart/halter have 14–49 total each → the val slices (3–10) are too
  small to learn OR to measure reliably.
- vNeck has volume (134) but near-zero agreement → suggests systematic teacher
  confusion between vNeck and crew/scoop, not just scarcity.

## Artifacts
- ONNX exported + load-tested: `runs/neckline.onnx`, 5.97 MB, forward pass valid
  (opset 17, dynamic batch, `[1,7]` output). Weights/onnx/report stay in `runs/`
  (gitignored) — only this report + script fixes are committed.
- `runs/train_val_report.json` — machine-readable metrics.
- `runs/neckline-disagreements.json` — 75 val disagreements, seeds Denetim A.

## Next threshold — when to retry
Do NOT retry on marginally more labels; the bottleneck is minority-class volume +
teacher noise, not total count. Concrete gates before the next run:
1. **≥100 samples per class for the 5 rare classes** (boat, square, sweetheart,
   halter, and cleaner vNeck). Miner should bias sampling toward photos the teacher
   labels as these rare necklines. At current 741 the rare classes are 11–49 each.
2. **Audit the vNeck/crew/scoop teacher labels** (use the disagreements file) before
   trusting more of them — a noisy majority label poisons the student regardless of count.
3. Rough target: **~1,500–2,000 usable neckline labels with the rare classes each
   ≥100**, then re-run `train_val_run.py`. Re-measure the same held-out-style gate;
   only claim PASS when val agreement ≥85% AND no class sits at 0% on ≥10 val samples.

## Files touched
- `vision-student/dataset.py` — `_find_photo` now searches nested `openset/<brand>/`
  (surgical; recovers 600 previously-dropped samples).
- `vision-student/train_val_run.py` — NEW leak-free trainer: stratified seeded split,
  class-weighted loss, val early-stop, per-class held-out agreement + JSON report.
  (The skeleton `train_neckline.py` + `eval_agreement.py` both train and measure on the
  same ambar = leakage; this runner replaces that path for real runs.)
