"""Smoke test: load the exported ONNX and run one forward pass.

Proves the browser target (onnxruntime) can consume the file end to end.
Usage: python test_onnx_load.py --onnx runs/neckline.onnx
"""
import argparse

import numpy as np
import onnx
import onnxruntime as ort

from model import IMG_SIZE
from vocab import NECKLINE_CLASSES


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--onnx", default="runs/neckline.onnx")
    args = ap.parse_args()

    m = onnx.load(args.onnx)
    onnx.checker.check_model(m)
    print(f"[onnx] graph valid, ir_version={m.ir_version}")

    sess = ort.InferenceSession(args.onnx, providers=["CPUExecutionProvider"])
    inp = sess.get_inputs()[0]
    x = np.random.randn(1, 3, IMG_SIZE, IMG_SIZE).astype(np.float32)
    out = sess.run(None, {inp.name: x})[0]
    print(f"[onnx] forward ok, output shape={out.shape}")
    assert out.shape[1] == len(NECKLINE_CLASSES), "class count mismatch"
    pred = NECKLINE_CLASSES[int(out.argmax(1)[0])]
    print(f"[onnx] argmax class = {pred}  (random input, meaningless label — load proof only)")
    print("[onnx] LOAD TEST PASSED")


if __name__ == "__main__":
    main()
