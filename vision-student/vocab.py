"""Shared vocabulary for the student CV heads.

The classes MUST stay identical to the teacher schema in backend/worker.js.
neckline (worker.js line ~296):
  "crew" | "scoop" | "vNeck" | "square" | "boat" | "sweetheart" | "halter" | null

AMBAR YASASI (see DEVAM-DATA-LOOP.md):
  - A label is a CACHE, not ground truth. The photo + source record is the asset.
  - null / missing / "belirsiz" (uncertain) => the sample is EXCLUDED from training,
    never mapped to a class. The student must not learn to guess where the teacher
    honestly abstained.
  - A whole labelling batch can be flagged "suspect" (teacher anchor check failed);
    suspect batches are excluded wholesale.
"""

# Field -> ordered class list (index == class id). null is intentionally NOT here.
NECKLINE_CLASSES = ["crew", "scoop", "vNeck", "square", "boat", "sweetheart", "halter"]

# Registry so more heads can be added later (sleeveStyle, skirtStyle, ...) without
# touching the training loop. For D3 stage 2 we only wire up neckline.
FIELDS = {
    "neckline": NECKLINE_CLASSES,
}

# Values that mean "teacher abstained / not applicable" -> drop the sample for that field.
UNCERTAIN_VALUES = {None, "", "null", "belirsiz", "uncertain", "unknown"}


def classes_for(field: str):
    if field not in FIELDS:
        raise KeyError(f"unknown field '{field}'; known: {list(FIELDS)}")
    return FIELDS[field]


def label_to_index(field: str, value):
    """Return class index, or None if the value is uncertain / out of vocab.

    None means: exclude this sample from training for this field (AMBAR YASASI).
    """
    if value in UNCERTAIN_VALUES:
        return None
    classes = classes_for(field)
    if value not in classes:
        # Out-of-vocab value in a label file => treat as uncertain, do not train on it.
        return None
    return classes.index(value)
