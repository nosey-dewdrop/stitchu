"""Student vs teacher agreement, per field.

Runs the trained student over the labelled ambar and reports how often the student's
top-1 class matches the teacher's cached label. This is the D3 milestone gate:
  neckline agreement >= 85%  ->  the neckline field can be served by the student.

Uncertain teacher labels are excluded (AMBAR YASASI) — you cannot measure agreement
against a null. Disagreements are written to runs/<field>-disagreements.json, which
seeds the periodic suspect-label audit (Denetim A).

Usage:
  python eval_agreement.py --ckpt runs/neckline.pt --dataset ../dataset
"""
import argparse
import json
import os

import torch

from dataset import NecklineDataset
from model import build_model, eval_transform
from vocab import NECKLINE_CLASSES


def pick_device():
    if torch.backends.mps.is_available():
        return torch.device("mps")
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ckpt", default="runs/neckline.pt")
    ap.add_argument("--dataset", default="../dataset")
    ap.add_argument("--field", default="neckline")
    ap.add_argument("--threshold", type=float, default=0.85)
    ap.add_argument("--out-disagree", default="runs/neckline-disagreements.json")
    args = ap.parse_args()

    device = pick_device()
    ckpt = torch.load(args.ckpt, map_location="cpu")
    classes = ckpt.get("classes", NECKLINE_CLASSES)
    model = build_model(len(classes), backbone=ckpt.get("backbone", "mobilenet_v3_small"),
                        pretrained=False)
    model.load_state_dict(ckpt["state_dict"])
    model.to(device).eval()

    ds = NecklineDataset(args.dataset, field=args.field, transform=eval_transform())
    print(f"[data] {ds.stats}")
    if len(ds) == 0:
        print("[eval] no usable labels to measure agreement against.")
        return

    per_class_total = [0] * len(classes)
    per_class_agree = [0] * len(classes)
    disagreements = []
    agree = 0

    with torch.no_grad():
        for i in range(len(ds)):
            img, teacher_idx = ds[i]
            path = ds.samples[i][0]
            logits = model(img.unsqueeze(0).to(device))
            pred = int(logits.argmax(1).item())
            per_class_total[teacher_idx] += 1
            if pred == teacher_idx:
                agree += 1
                per_class_agree[teacher_idx] += 1
            else:
                disagreements.append({
                    "photo": os.path.basename(path),
                    "teacher": classes[teacher_idx],
                    "student": classes[pred],
                })

    overall = agree / len(ds)
    print(f"\n[agreement] {args.field}: {overall*100:.1f}%  ({agree}/{len(ds)})")
    print(f"[gate] threshold {args.threshold*100:.0f}%  ->  "
          f"{'PASS - field can go live' if overall >= args.threshold else 'HOLD - keep teacher'}")
    print("\nper class:")
    for c, name in enumerate(classes):
        t = per_class_total[c]
        pct = (per_class_agree[c] / t * 100) if t else float("nan")
        print(f"  {name:<11} {per_class_agree[c]:>3}/{t:<3}  {pct:5.1f}%")

    os.makedirs(os.path.dirname(args.out_disagree) or ".", exist_ok=True)
    with open(args.out_disagree, "w") as f:
        json.dump(disagreements, f, indent=2)
    print(f"\n[audit] {len(disagreements)} disagreements -> {args.out_disagree}")


if __name__ == "__main__":
    main()
