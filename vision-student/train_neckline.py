"""Train the neckline student classifier.

Usage:
  python train_neckline.py --dataset ../dataset --epochs 30 --out runs/neckline.pt

Skeleton reality: with a tiny / empty ambar this still runs (it will warn and, if
--allow-empty, generate a synthetic overfit set for the smoke test). Real training
kicks in once dataset/labels/*.json has enough non-uncertain neckline labels.

Mac note: uses MPS backend automatically when available (Apple Silicon GPU), else CPU.
"""
import argparse
import os

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from dataset import NecklineDataset
from model import build_model, train_transform, IMG_SIZE
from vocab import NECKLINE_CLASSES


def pick_device():
    if torch.backends.mps.is_available():
        return torch.device("mps")
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


def synthetic_loader(n_per_class=1, batch_size=8):
    """Deterministic per-class tensors so 2 epochs can overfit -> proves the loop."""
    num = len(NECKLINE_CLASSES)
    xs, ys = [], []
    torch.manual_seed(0)
    for c in range(num):
        for _ in range(n_per_class):
            # each class = a distinct constant image, trivially separable
            img = torch.full((3, IMG_SIZE, IMG_SIZE), float(c) / num)
            xs.append(img)
            ys.append(c)
    x = torch.stack(xs)
    y = torch.tensor(ys)
    return DataLoader(TensorDataset(x, y), batch_size=batch_size, shuffle=True)


def build_loader(args):
    ds = NecklineDataset(args.dataset, field="neckline", transform=train_transform())
    print(f"[data] label scan: {ds.stats}")
    if len(ds) == 0:
        if not args.allow_empty:
            raise SystemExit(
                "No usable neckline labels found. The teacher ambar (dataset/labels) is "
                "empty or fully filtered. Re-run with --allow-empty for a synthetic smoke "
                "test, or wait for the D2 labelling loop to fill the ambar."
            )
        print("[data] ambar empty -> SYNTHETIC smoke set (not real training)")
        return synthetic_loader(n_per_class=args.synthetic_per_class,
                                 batch_size=args.batch_size), True
    return DataLoader(ds, batch_size=args.batch_size, shuffle=True), False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset", default="../dataset")
    ap.add_argument("--epochs", type=int, default=30)
    ap.add_argument("--batch-size", type=int, default=16)
    ap.add_argument("--lr", type=float, default=1e-3)
    ap.add_argument("--backbone", default="mobilenet_v3_small")
    ap.add_argument("--out", default="runs/neckline.pt")
    ap.add_argument("--allow-empty", action="store_true",
                    help="fall back to a synthetic set when the ambar is empty (smoke test)")
    ap.add_argument("--synthetic-per-class", type=int, default=1)
    ap.add_argument("--pretrained", action="store_true", default=True)
    ap.add_argument("--no-pretrained", dest="pretrained", action="store_false")
    args = ap.parse_args()

    device = pick_device()
    print(f"[device] {device}")

    loader, synthetic = build_loader(args)
    model = build_model(len(NECKLINE_CLASSES), backbone=args.backbone,
                        pretrained=args.pretrained and not synthetic).to(device)
    opt = torch.optim.Adam(model.parameters(), lr=args.lr)
    lossfn = nn.CrossEntropyLoss()

    model.train()
    for epoch in range(args.epochs):
        total, correct, run_loss = 0, 0, 0.0
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            opt.zero_grad()
            out = model(x)
            loss = lossfn(out, y)
            loss.backward()
            opt.step()
            run_loss += loss.item() * x.size(0)
            correct += (out.argmax(1) == y).sum().item()
            total += x.size(0)
        acc = correct / max(total, 1)
        print(f"[epoch {epoch+1}/{args.epochs}] loss={run_loss/max(total,1):.4f} acc={acc:.3f}")

    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    torch.save({"state_dict": model.state_dict(),
                "backbone": args.backbone,
                "classes": NECKLINE_CLASSES,
                "field": "neckline",
                "synthetic": synthetic}, args.out)
    print(f"[save] {args.out}")


if __name__ == "__main__":
    main()
