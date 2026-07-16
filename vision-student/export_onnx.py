"""Export a trained neckline checkpoint to ONNX for onnxruntime-web (browser).

Usage:
  python export_onnx.py --ckpt runs/neckline.pt --out runs/neckline.onnx

Dynamic batch axis so the browser can send 1..N crops. Opset 17 is broadly supported
by onnxruntime-web. The consumer must feed 1x3x224x224 float tensors normalised with
the ImageNet mean/std from model.py.
"""
import argparse
import os

import torch

from model import build_model, IMG_SIZE
from vocab import NECKLINE_CLASSES


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ckpt", default="runs/neckline.pt")
    ap.add_argument("--out", default="runs/neckline.onnx")
    ap.add_argument("--opset", type=int, default=17)
    args = ap.parse_args()

    ckpt = torch.load(args.ckpt, map_location="cpu")
    backbone = ckpt.get("backbone", "mobilenet_v3_small")
    classes = ckpt.get("classes", NECKLINE_CLASSES)

    model = build_model(len(classes), backbone=backbone, pretrained=False)
    model.load_state_dict(ckpt["state_dict"])
    model.eval()

    dummy = torch.randn(1, 3, IMG_SIZE, IMG_SIZE)
    out_dir = os.path.dirname(args.out) or "."
    os.makedirs(out_dir, exist_ok=True)
    # Legacy (dynamo=False) exporter writes ONE self-contained .onnx (weights inline),
    # which is what onnxruntime-web wants — the dynamo path splits weights into a
    # sidecar .onnx.data the browser would have to fetch separately.
    torch.onnx.export(
        model, dummy, args.out,
        input_names=["image"], output_names=["logits"],
        dynamic_axes={"image": {0: "batch"}, "logits": {0: "batch"}},
        opset_version=args.opset,
        dynamo=False,
    )
    # Clean any stale sidecar from a previous dynamo export so it can't be loaded by mistake.
    sidecar = args.out + ".data"
    if os.path.exists(sidecar):
        os.remove(sidecar)
    size_kb = os.path.getsize(args.out) / 1024
    print(f"[onnx] {args.out}  classes={classes}  size={size_kb:.1f} KB  (single file, weights inline)")


if __name__ == "__main__":
    main()
