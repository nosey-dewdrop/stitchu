"""Run the four K5 student heads on photo(s), print JSON {photo: {field: [pred, conf]}}.

Used by engine/tools/cascade-router.mjs (local/offline tooling only — the public web
photo->pattern path does NOT call this; the cascade ships flag-off).

Usage: .venv/bin/python infer_cascade.py photo1.jpg [photo2.jpg ...]
"""
import json
import os
import sys

import torch
import torch.nn.functional as F
from PIL import Image

from model import build_model, eval_transform

FIELDS = ["garment", "neckline", "sleeveLength", "skirtStyle"]


def main():
    photos = sys.argv[1:]
    if not photos:
        raise SystemExit("usage: infer_cascade.py <photo...>")
    here = os.path.dirname(os.path.abspath(__file__))
    tf = eval_transform()
    heads = {}
    for f in FIELDS:
        ckpt = torch.load(os.path.join(here, "runs", f"{f}.pt"), map_location="cpu")
        m = build_model(len(ckpt["classes"]), backbone=ckpt["backbone"], pretrained=False)
        m.load_state_dict(ckpt["state_dict"])
        m.eval()
        heads[f] = (m, ckpt["classes"])
    out = {}
    with torch.no_grad():
        for p in photos:
            img = tf(Image.open(p).convert("RGB")).unsqueeze(0)
            out[p] = {}
            for f, (m, classes) in heads.items():
                probs = F.softmax(m(img), dim=1)[0]
                conf, idx = probs.max(0)
                out[p][f] = [classes[int(idx)], round(float(conf), 4)]
    print(json.dumps(out))


if __name__ == "__main__":
    main()
