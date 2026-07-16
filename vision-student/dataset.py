"""Dataloader for the student CV.

Reads dataset/labels/*.json (produced by the D2 teacher-labelling loop) and pairs
each label with its photo in dataset/<pool>/<hash>.jpg.

AMBAR YASASI filters, applied here so no downstream code can bypass them:
  1. Uncertain field value (null / "belirsiz") -> sample dropped for that field.
  2. Suspect batch (teacher anchor check failed) -> whole batch dropped.
  3. Missing photo file -> dropped (label without asset is worthless).
  4. Confidence below MIN_CONFIDENCE (if the label carries one) -> dropped.

Expected label file shape (one JSON per photo, flexible to what the teacher writes):
  {
    "hash": "8f2021156690e712",         # or "id" / "image"
    "pool": "uniqlo",                    # subfolder; optional, we also search all pools
    "fields": {"neckline": "vNeck", ...} # or fields at top level
    "teacherVersion": "v27",
    "date": "2026-07-16",
    "confidence": 0.9,                    # optional
    "batch": "batch-01",                 # optional, matched against suspect list
    "suspect": false                     # optional per-label override
  }
Missing keys degrade gracefully: this is skeleton code that must run before the real
ambar exists, so it also accepts a flat {"hash":..,"neckline":..} form.
"""
import json
import os
from pathlib import Path

from PIL import Image
from torch.utils.data import Dataset

from vocab import label_to_index

MIN_CONFIDENCE = 0.0  # raise once the teacher emits calibrated confidences
IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".webp")


def _load_suspect_batches(dataset_root: Path):
    """A batch is excluded wholesale if listed here (health-check failed)."""
    f = dataset_root / "labels" / "suspect-batches.json"
    if f.exists():
        try:
            return set(json.loads(f.read_text()))
        except Exception:
            return set()
    return set()


def _find_photo(dataset_root: Path, pool, key):
    """Locate the photo file for a label. Try pool/<key>.ext, else search all pools."""
    candidates = []
    if pool:
        candidates.append(dataset_root / pool)
    # fall back: every immediate subdir that is not 'labels'
    for d in dataset_root.iterdir():
        if d.is_dir() and d.name != "labels" and d not in candidates:
            candidates.append(d)
    for d in candidates:
        for ext in IMAGE_EXTS:
            p = d / f"{key}{ext}"
            if p.exists():
                return p
    return None


def _extract(label: dict):
    """Pull (key, pool, fields, confidence, batch, suspect) from a label dict."""
    key = label.get("hash") or label.get("id") or label.get("image")
    if key and isinstance(key, str):
        key = os.path.splitext(os.path.basename(key))[0]
    # Photo lives under dataset/<brand>/; "pool" in the real labels is a logical split
    # ("training"), not a photo folder — so prefer brand, then pool as fallback.
    pool = label.get("brand") or label.get("pool")
    # Real teacher labels nest the structured fields under "spec"; older/flat forms
    # keep them at top level. Support both.
    fields = label.get("spec")
    if not isinstance(fields, dict):
        fields = label.get("fields")
    if not isinstance(fields, dict):
        meta = {"hash", "id", "image", "pool", "brand", "category", "source",
                "workerVersion", "teacherVersion", "date", "confidence", "batch",
                "suspect", "spec", "outOfVocab", "details"}
        fields = {k: v for k, v in label.items() if k not in meta}
    # confidence may be a number, or a dict ({"source":..,"reported":{}}) that carries
    # no calibrated value — in that case treat it as "no numeric confidence".
    conf = label.get("confidence", 1.0)
    if isinstance(conf, dict):
        conf = conf.get("value")
    batch = label.get("batch") or label.get("teacherVersion")
    suspect = bool(label.get("suspect", False))
    return key, pool, fields, conf, batch, suspect


class NecklineDataset(Dataset):
    """One (image, neckline_class_index) pair per usable label."""

    def __init__(self, dataset_root, field="neckline", transform=None):
        self.root = Path(dataset_root)
        self.field = field
        self.transform = transform
        self.samples = []            # list of (photo_path, class_index)
        self.stats = {"seen": 0, "kept": 0, "no_photo": 0, "uncertain": 0,
                      "suspect": 0, "low_conf": 0}

        suspect_batches = _load_suspect_batches(self.root)
        labels_dir = self.root / "labels"
        label_files = sorted(labels_dir.glob("*.json")) if labels_dir.exists() else []
        # skip control files
        label_files = [f for f in label_files if f.name != "suspect-batches.json"]

        for lf in label_files:
            try:
                data = json.loads(lf.read_text())
            except Exception:
                continue
            records = data if isinstance(data, list) else [data]
            for label in records:
                if not isinstance(label, dict):
                    continue
                self.stats["seen"] += 1
                key, pool, fields, conf, batch, suspect = _extract(label)

                if suspect or (batch is not None and batch in suspect_batches):
                    self.stats["suspect"] += 1
                    continue
                if isinstance(conf, (int, float)) and conf < MIN_CONFIDENCE:
                    self.stats["low_conf"] += 1
                    continue

                idx = label_to_index(self.field, fields.get(self.field))
                if idx is None:
                    self.stats["uncertain"] += 1
                    continue

                photo = _find_photo(self.root, pool, key) if key else None
                if photo is None:
                    self.stats["no_photo"] += 1
                    continue

                self.samples.append((str(photo), idx))
                self.stats["kept"] += 1

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, i):
        path, y = self.samples[i]
        img = Image.open(path).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, y
