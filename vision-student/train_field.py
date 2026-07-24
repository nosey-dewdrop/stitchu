"""K5 cascade trainer: one head per field, GLOBAL leak-free photo split.

Difference vs train_val_run.py (neckline-only, per-field stratified split): the K5
cascade calibrates a PHOTO-level routing decision across four heads, so all heads
must share ONE deterministic photo split — otherwise a photo could be val for one
head and train for another and the photo-level metric would leak.

Split rule (deterministic, hash-based, no seed file needed):
  md5(photo_basename) last byte % 5 == 0  ->  VAL (~20%), else TRAIN.

AMBAR YASASI is enforced by NecklineDataset (dataset.py): teacher nulls, out-of-vocab
values, suspect batches and missing photos are excluded per field; filter stats are
printed and saved into the report.

Usage:
  PYTORCH_ENABLE_MPS_FALLBACK=1 .venv/bin/python train_field.py --field garment --epochs 12
"""
import argparse
import hashlib
import json
import os

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset

from dataset import NecklineDataset
from model import build_model, train_transform, eval_transform
from vocab import classes_for


def pick_device():
    if torch.backends.mps.is_available():
        return torch.device("mps")
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


def is_val_photo(path: str) -> bool:
    base = os.path.splitext(os.path.basename(path))[0]
    h = hashlib.md5(base.encode()).digest()
    return h[-1] % 5 == 0


def split_global(samples):
    train_idx, val_idx = [], []
    for i, (path, _y) in enumerate(samples):
        (val_idx if is_val_photo(path) else train_idx).append(i)
    return train_idx, val_idx


def evaluate(model, loader, device, n_classes):
    model.eval()
    agree = 0
    total = 0
    per_total = [0] * n_classes
    per_agree = [0] * n_classes
    with torch.no_grad():
        for x, y in loader:
            x = x.to(device)
            pred = model(x).argmax(1).cpu()
            for p, t in zip(pred.tolist(), y.tolist()):
                per_total[t] += 1
                total += 1
                if p == t:
                    agree += 1
                    per_agree[t] += 1
    return agree / max(total, 1), agree, total, per_agree, per_total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--field", required=True)
    ap.add_argument("--dataset", default="../dataset")
    ap.add_argument("--epochs", type=int, default=14)
    ap.add_argument("--batch-size", type=int, default=32)
    ap.add_argument("--lr", type=float, default=1e-3)
    ap.add_argument("--backbone", default="mobilenet_v3_small")
    ap.add_argument("--patience", type=int, default=4)
    args = ap.parse_args()

    classes = classes_for(args.field)
    device = pick_device()
    print(f"[device] {device}  [field] {args.field}  classes={classes}")

    ds_train_t = NecklineDataset(args.dataset, field=args.field, transform=train_transform())
    ds_eval_t = NecklineDataset(args.dataset, field=args.field, transform=eval_transform())
    print(f"[data] filter stats: {ds_train_t.stats}")
    train_idx, val_idx = split_global(ds_train_t.samples)
    print(f"[split] global hash split: train={len(train_idx)} val={len(val_idx)}")
    if not train_idx or not val_idx:
        raise SystemExit("empty split; not enough labels for this field")

    def dist(idxs, samples):
        d = {}
        for i in idxs:
            c = classes[samples[i][1]]
            d[c] = d.get(c, 0) + 1
        return d

    train_loader = DataLoader(Subset(ds_train_t, train_idx), batch_size=args.batch_size,
                              shuffle=True)
    val_loader = DataLoader(Subset(ds_eval_t, val_idx), batch_size=args.batch_size)

    model = build_model(len(classes), backbone=args.backbone, pretrained=True).to(device)
    opt = torch.optim.Adam(model.parameters(), lr=args.lr)
    lossfn = nn.CrossEntropyLoss()

    best_acc, best_epoch, since_best = 0.0, -1, 0
    out_ckpt = os.path.join("runs", f"{args.field}.pt")
    os.makedirs("runs", exist_ok=True)
    report = {
        "field": args.field,
        "classes": classes,
        "filter_stats": ds_train_t.stats,
        "split": {"rule": "md5(basename)[-1] % 5 == 0 -> val (global, shared by all heads)",
                  "train": len(train_idx), "val": len(val_idx),
                  "train_dist": dist(train_idx, ds_train_t.samples),
                  "val_dist": dist(val_idx, ds_train_t.samples)},
        "epochs": [],
    }

    for epoch in range(args.epochs):
        model.train()
        total, correct, run_loss = 0, 0, 0.0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            opt.zero_grad()
            out = model(x)
            loss = lossfn(out, y)
            loss.backward()
            opt.step()
            run_loss += loss.item() * x.size(0)
            correct += (out.argmax(1) == y).sum().item()
            total += x.size(0)
        val_acc, agree, vtotal, per_agree, per_total = evaluate(model, val_loader, device,
                                                                len(classes))
        print(f"[epoch {epoch+1}/{args.epochs}] loss={run_loss/max(total,1):.4f} "
              f"train_acc={correct/max(total,1):.3f} val_agree={val_acc:.3f}")
        report["epochs"].append({"epoch": epoch + 1, "train_acc": correct / max(total, 1),
                                 "val_agree": val_acc})
        if val_acc > best_acc:
            best_acc, best_epoch, since_best = val_acc, epoch + 1, 0
            torch.save({"state_dict": model.state_dict(), "backbone": args.backbone,
                        "classes": classes, "field": args.field,
                        "split_rule": "md5-global-mod5"}, out_ckpt)
            report["per_class"] = [
                {"class": classes[c], "agree": per_agree[c], "total": per_total[c],
                 "pct": per_agree[c] / per_total[c] if per_total[c] else None}
                for c in range(len(classes))]
        else:
            since_best += 1
            if since_best >= args.patience:
                print(f"[early-stop] no val improvement for {args.patience} epochs")
                break

    report["best_val_agree"] = best_acc
    report["best_epoch"] = best_epoch
    out_report = os.path.join("runs", f"{args.field}_report.json")
    with open(out_report, "w") as f:
        json.dump(report, f, indent=1)
    print(f"[save] {out_ckpt}  best val_agree={best_acc:.3f} (epoch {best_epoch})")
    print(f"[save] {out_report}")


if __name__ == "__main__":
    main()
