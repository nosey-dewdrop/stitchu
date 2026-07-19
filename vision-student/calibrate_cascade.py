"""K5 cascade τ calibration — student margins vs cached teacher labels, VAL ONLY.

Per field: run the trained head over the GLOBAL val split (same md5 rule as
train_field.py — no photo here was ever trained on), record top-1 softmax confidence
+ teacher agreement, then pick the SMALLEST τ whose student-decided subset keeps
teacher-agreement >= --target (default 0.95) with at least --min-n samples. If no τ
reaches the target, the field is marked "no safe tau" and always routes to teacher.

Photo-level workload (the credit metric): a photo skips the teacher iff the garment
head is confident AND every field the predicted garment needs is confident:
  dress -> neckline+sleeveLength+skirtStyle, top -> neckline+sleeveLength,
  skirt -> skirtStyle, trousers/other -> nothing more (not draftable -> no teacher).
calls/100 photos: before = 100 (every photo hits the teacher), after = 100 x (1-skip).

Output: runs/cascade-calibration.json (consumed by engine/tools/cascade-router.mjs).
All numbers are measured against CACHED teacher labels — 0 live calls.
"""
import argparse
import hashlib
import json
import os

import torch
import torch.nn.functional as F

from dataset import NecklineDataset
from model import build_model, eval_transform
from vocab import FIELDS as VOCAB_FIELDS

CASCADE_FIELDS = ["garment", "neckline", "sleeveLength", "skirtStyle"]
NEEDS = {"dress": ["neckline", "sleeveLength", "skirtStyle"],
         "top": ["neckline", "sleeveLength"],
         "skirt": ["skirtStyle"],
         "trousers": [], "other": []}


def pick_device():
    if torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")


def is_val_photo(path: str) -> bool:
    base = os.path.splitext(os.path.basename(path))[0]
    return hashlib.md5(base.encode()).digest()[-1] % 5 == 0


def load_head(field):
    ckpt = torch.load(os.path.join("runs", f"{field}.pt"), map_location="cpu")
    model = build_model(len(ckpt["classes"]), backbone=ckpt["backbone"], pretrained=False)
    model.load_state_dict(ckpt["state_dict"])
    model.eval()
    return model, ckpt["classes"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset", default="../dataset")
    ap.add_argument("--target", type=float, default=0.95)
    ap.add_argument("--min-n", type=int, default=30)
    ap.add_argument("--out", default="runs/cascade-calibration.json")
    args = ap.parse_args()

    device = pick_device()
    tf = eval_transform()

    # teacher val labels per field: hash -> class name
    teacher = {f: {} for f in CASCADE_FIELDS}
    photo_paths = {}
    for f in CASCADE_FIELDS:
        ds = NecklineDataset(args.dataset, field=f, transform=None)
        for path, y in ds.samples:
            if not is_val_photo(path):
                continue
            h = os.path.splitext(os.path.basename(path))[0]
            teacher[f][h] = VOCAB_FIELDS[f][y]
            photo_paths[h] = path

    # student predictions: hash -> field -> (pred, conf)
    from PIL import Image
    heads = {f: load_head(f) for f in CASCADE_FIELDS}
    preds = {h: {} for h in photo_paths}
    hashes = sorted(photo_paths)
    with torch.no_grad():
        for i in range(0, len(hashes), 32):
            batch_h = hashes[i:i + 32]
            imgs = torch.stack([tf(Image.open(photo_paths[h]).convert("RGB")) for h in batch_h]).to(device)
            for f, (model, classes) in heads.items():
                model.to(device)
                probs = F.softmax(model(imgs), dim=1).cpu()
                conf, idx = probs.max(1)
                for j, h in enumerate(batch_h):
                    preds[h][f] = (classes[int(idx[j])], float(conf[j]))

    report = {"target_agreement": args.target, "min_n": args.min_n,
              "val_photos": len(photo_paths), "fields": {}}

    def sweep(pairs, min_n):
        """pairs: (conf, agree). Smallest tau with agreement >= target and n >= min_n."""
        for tau in [x / 100 for x in range(50, 100)]:
            sub = [a for c, a in pairs if c >= tau]
            if len(sub) < min_n:
                continue
            agree = sum(sub) / len(sub)
            if agree >= args.target:
                return {"tau": tau, "agreement": agree, "n_student_decided": len(sub),
                        "coverage": len(sub) / len(pairs)}
        return None

    # Two levels: a flat per-field tau, and CLASS-CONDITIONAL taus (selective
    # prediction per predicted class — a field whose flat tau fails can still safely
    # answer for the classes it is reliable on, e.g. a confident "top").
    taus = {}
    for f in CASCADE_FIELDS:
        pairs = []          # (conf, agree)
        by_class = {}       # predicted class -> [(conf, agree)]
        for h, t in teacher[f].items():
            p, c = preds[h][f]
            pairs.append((c, p == t))
            by_class.setdefault(p, []).append((c, p == t))
        best = sweep(pairs, args.min_n)
        per_class = {}
        for cls, cps in sorted(by_class.items()):
            b = sweep(cps, max(args.min_n // 2, 15))
            if b:
                per_class[cls] = b
        overall = sum(a for _, a in pairs) / max(len(pairs), 1)
        report["fields"][f] = {
            "n_val": len(pairs), "overall_agreement": overall,
            "calibrated": best or "no safe flat tau",
            "per_class": per_class or "no safe class tau — always teacher",
        }
        taus[f] = {"flat": best["tau"] if best else None,
                   "per_class": {c: b["tau"] for c, b in per_class.items()}}
        print(f"[{f}] val={len(pairs)} overall={overall:.3f} flat=" +
              (f"{best['tau']}" if best else "NONE") +
              " per_class=" + json.dumps({c: b['tau'] for c, b in per_class.items()}))

    def confident(h, f):
        p, c = preds[h][f]
        t_flat = taus[f]["flat"]
        t_cls = taus[f]["per_class"].get(p)
        cands = [t for t in (t_flat, t_cls) if t is not None]
        return bool(cands) and c >= min(cands)

    # photo-level workload
    skip = 0
    decided_pairs = []  # (field, agree) on skipped photos, teacher non-null
    for h in hashes:
        g_pred, g_conf = preds[h]["garment"]
        if not confident(h, "garment"):
            continue
        needed = NEEDS[g_pred]
        ok = all(confident(h, f) for f in needed)
        if not ok:
            continue
        skip += 1
        for f in ["garment"] + needed:
            t = teacher[f].get(h)
            if t is not None:
                decided_pairs.append((f, preds[h][f][0] == t))
    skip_rate = skip / max(len(hashes), 1)
    agree_sk = sum(a for _, a in decided_pairs) / max(len(decided_pairs), 1)
    report["photo_level"] = {
        "val_photos": len(hashes), "skipped_teacher": skip, "skip_rate": skip_rate,
        "teacher_calls_per_100_before": 100.0,
        "teacher_calls_per_100_after": round(100.0 * (1 - skip_rate), 1),
        "agreement_on_student_decided_fields": agree_sk,
        "n_student_decided_field_checks": len(decided_pairs),
    }
    print(f"[photo] skip={skip}/{len(hashes)} ({skip_rate*100:.1f}%) -> calls/100: 100 -> "
          f"{100*(1-skip_rate):.1f}; field-agreement on skipped: {agree_sk:.3f} ({len(decided_pairs)})")

    with open(args.out, "w") as fp:
        json.dump(report, fp, indent=1)
    print(f"[save] {args.out}")


if __name__ == "__main__":
    main()
