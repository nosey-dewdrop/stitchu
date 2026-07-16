"""First real neckline training run: leak-free stratified train/val split + early stop.

Why this exists (vs train_neckline.py): the skeleton trainer trains on the WHOLE ambar
and eval_agreement.py then measures agreement on that SAME ambar — that is train-on-test
leakage and would report a dishonest number. This runner:
  1. builds the ambar via NecklineDataset (all AMBAR YASASI filters already applied);
  2. does a stratified, seeded split by neckline class (photo == label here, so a
     class-stratified label split IS a photo split with no photo in both sides);
  3. trains ONLY on train, early-stops on VAL accuracy (MPS-friendly, short);
  4. reports student<->teacher agreement on the HELD-OUT val split, per class;
  5. saves the best checkpoint to runs/neckline.pt for export_onnx.py.

Usage:
  PYTORCH_ENABLE_MPS_FALLBACK=1 python train_val_run.py --epochs 40 --patience 6
"""
import argparse
import json
import os
import random
from collections import defaultdict

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset

from dataset import NecklineDataset
from model import build_model, train_transform, eval_transform
from vocab import NECKLINE_CLASSES


def pick_device():
    if torch.backends.mps.is_available():
        return torch.device("mps")
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


def stratified_split(labels, val_frac, seed):
    """Return (train_idx, val_idx). Stratify per class so rare classes appear in both
    sides when they have >=2 samples; a singleton class goes to TRAIN (can't be split)."""
    by_class = defaultdict(list)
    for i, y in enumerate(labels):
        by_class[y].append(i)
    rng = random.Random(seed)
    train_idx, val_idx = [], []
    for y, idxs in by_class.items():
        idxs = idxs[:]
        rng.shuffle(idxs)
        n_val = int(round(len(idxs) * val_frac))
        if len(idxs) >= 2:
            n_val = max(1, min(n_val, len(idxs) - 1))  # keep >=1 in each side
        else:
            n_val = 0  # singleton -> train only
        val_idx.extend(idxs[:n_val])
        train_idx.extend(idxs[n_val:])
    return sorted(train_idx), sorted(val_idx)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset", default="../dataset")
    ap.add_argument("--epochs", type=int, default=40)
    ap.add_argument("--batch-size", type=int, default=32)
    ap.add_argument("--lr", type=float, default=1e-3)
    ap.add_argument("--backbone", default="mobilenet_v3_small")
    ap.add_argument("--val-frac", type=float, default=0.2)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--patience", type=int, default=6)
    ap.add_argument("--out", default="runs/neckline.pt")
    ap.add_argument("--report-json", default="runs/train_val_report.json")
    args = ap.parse_args()

    device = pick_device()
    print(f"[device] {device}")

    # One dataset object per transform (train aug vs deterministic eval).
    ds_train_t = NecklineDataset(args.dataset, field="neckline", transform=train_transform())
    ds_eval_t = NecklineDataset(args.dataset, field="neckline", transform=eval_transform())
    print(f"[data] filter stats: {ds_train_t.stats}")
    labels = [y for _, y in ds_train_t.samples]
    if len(labels) == 0:
        raise SystemExit("empty ambar; nothing to train")

    train_idx, val_idx = stratified_split(labels, args.val_frac, args.seed)
    print(f"[split] train={len(train_idx)} val={len(val_idx)} (val_frac={args.val_frac})")

    # class distribution per side
    def dist(idxs):
        d = defaultdict(int)
        for i in idxs:
            d[NECKLINE_CLASSES[labels[i]]] += 1
        return dict(d)
    train_dist, val_dist = dist(train_idx), dist(val_idx)
    print(f"[split] train dist: {train_dist}")
    print(f"[split] val   dist: {val_dist}")

    train_loader = DataLoader(Subset(ds_train_t, train_idx), batch_size=args.batch_size,
                              shuffle=True)
    val_loader = DataLoader(Subset(ds_eval_t, val_idx), batch_size=args.batch_size,
                            shuffle=False)

    # class weights to fight imbalance (crew dominates)
    counts = torch.zeros(len(NECKLINE_CLASSES))
    for i in train_idx:
        counts[labels[i]] += 1
    weights = counts.sum() / (counts.clamp(min=1) * len(NECKLINE_CLASSES))
    weights = weights.to(device)

    model = build_model(len(NECKLINE_CLASSES), backbone=args.backbone, pretrained=True).to(device)
    opt = torch.optim.Adam(model.parameters(), lr=args.lr, weight_decay=1e-4)
    lossfn = nn.CrossEntropyLoss(weight=weights)

    best_val, best_state, best_epoch, since_improve = -1.0, None, 0, 0
    for epoch in range(args.epochs):
        model.train()
        tr_correct = tr_total = 0
        run_loss = 0.0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            opt.zero_grad()
            out = model(x)
            loss = lossfn(out, y)
            loss.backward()
            opt.step()
            run_loss += loss.item() * x.size(0)
            tr_correct += (out.argmax(1) == y).sum().item()
            tr_total += x.size(0)

        # val
        model.eval()
        v_correct = v_total = 0
        with torch.no_grad():
            for x, y in val_loader:
                x, y = x.to(device), y.to(device)
                pred = model(x).argmax(1)
                v_correct += (pred == y).sum().item()
                v_total += x.size(0)
        tr_acc = tr_correct / max(tr_total, 1)
        v_acc = v_correct / max(v_total, 1)
        print(f"[epoch {epoch+1}/{args.epochs}] loss={run_loss/max(tr_total,1):.4f} "
              f"train_acc={tr_acc:.3f} val_acc={v_acc:.3f}")

        if v_acc > best_val:
            best_val, best_epoch = v_acc, epoch + 1
            best_state = {k: v.detach().cpu().clone() for k, v in model.state_dict().items()}
            since_improve = 0
        else:
            since_improve += 1
            if since_improve >= args.patience:
                print(f"[early-stop] no val improvement in {args.patience} epochs")
                break

    print(f"[best] val_acc={best_val:.3f} @ epoch {best_epoch}")
    model.load_state_dict(best_state)

    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    torch.save({"state_dict": model.state_dict(), "backbone": args.backbone,
                "classes": NECKLINE_CLASSES, "field": "neckline", "synthetic": False,
                "val_idx": val_idx, "seed": args.seed}, args.out)
    print(f"[save] {args.out}")

    # per-class agreement on held-out val (the honest gate)
    model.eval()
    per_total = [0] * len(NECKLINE_CLASSES)
    per_agree = [0] * len(NECKLINE_CLASSES)
    disagreements = []
    with torch.no_grad():
        for i in val_idx:
            img, ty = ds_eval_t[i]
            pred = int(model(img.unsqueeze(0).to(device)).argmax(1).item())
            per_total[ty] += 1
            if pred == ty:
                per_agree[ty] += 1
            else:
                disagreements.append({
                    "photo": os.path.basename(ds_eval_t.samples[i][0]),
                    "teacher": NECKLINE_CLASSES[ty],
                    "student": NECKLINE_CLASSES[pred],
                })
    agree = sum(per_agree)
    total = sum(per_total)
    overall = agree / max(total, 1)
    print(f"\n[VAL agreement] neckline: {overall*100:.1f}%  ({agree}/{total})")
    print(f"[gate] 85%  ->  {'PASS' if overall >= 0.85 else 'HOLD - keep teacher'}")
    print("\nper class (held-out val):")
    report_classes = []
    for c, name in enumerate(NECKLINE_CLASSES):
        t = per_total[c]
        pct = (per_agree[c] / t * 100) if t else float("nan")
        print(f"  {name:<11} {per_agree[c]:>3}/{t:<3}  {pct:5.1f}%")
        report_classes.append({"class": name, "agree": per_agree[c], "total": t,
                               "pct": (per_agree[c] / t) if t else None})

    report = {
        "filter_stats": ds_train_t.stats,
        "split": {"train": len(train_idx), "val": len(val_idx), "val_frac": args.val_frac,
                  "seed": args.seed, "train_dist": train_dist, "val_dist": val_dist},
        "best_val_acc": best_val, "best_epoch": best_epoch,
        "val_agreement": overall, "val_agree": agree, "val_total": total,
        "gate_pass": overall >= 0.85,
        "per_class": report_classes,
        "n_disagreements": len(disagreements),
    }
    os.makedirs(os.path.dirname(args.report_json) or ".", exist_ok=True)
    with open(args.report_json, "w") as f:
        json.dump(report, f, indent=2)
    with open("runs/neckline-disagreements.json", "w") as f:
        json.dump(disagreements, f, indent=2)
    print(f"\n[report] {args.report_json}  ({len(disagreements)} disagreements)")


if __name__ == "__main__":
    main()
