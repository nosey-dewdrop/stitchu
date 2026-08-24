"""Shared vocabulary for the student CV heads. URETILMISTIR — ELLE DUZENLENMEZ.

Ureteci     : engine/tools/gen-vision-vocab.mjs
Kaynaklar   : engine/vocab.json (hangi kelime var)
              contract/vocab-resolution-v1.json (kelime neye cozuluyor)
Kapi        : engine/tests/vocab_source_check.sh (ctest: vocab_source_check)

Bu dosyaya elle bir kelime eklemek testi KIRAR. Sinif listesi degisecekse
yukaridaki iki tabloyu degistir ve ureteci yeniden kostur:
    node engine/tools/gen-vision-vocab.mjs

Bir kelime ancak cozum tablosunda status=resolved ise SINIF olur.
  sentinel ("none" = yokluk) sinif DEGILDIR — yokluk tahmin edilmez.
  absent (sozlukte var, cozulemiyor) SILINMEZ — _UNRESOLVED'a gerekcesiyle duser.

AMBAR YASASI (see DEVAM-DATA-LOOP.md):
  - A label is a CACHE, not ground truth. The photo + source record is the asset.
  - null / missing / "belirsiz" (uncertain) => the sample is EXCLUDED from training,
    never mapped to a class. The student must not learn to guess where the teacher
    honestly abstained.
  - A whole labelling batch can be flagged "suspect" (teacher anchor check failed);
    suspect batches are excluded wholesale.
"""

# Field -> ordered class list (index == class id). null is intentionally NOT here.
# Order is engine/vocab.json declaration order, so index == enum value.

# neckline: K5 kaskadinin ilk kafasi; egitilen tek kafa buydu (train_neckline.py).
NECKLINE_CLASSES = ["crew", "scoop", "vNeck", "square", "boat", "sweetheart", "halter", "cowl", "pussyBow"]

# garment: Kaskadin koku: giysi ailesi secilmeden diger kafalar anlamsiz.
GARMENT_CLASSES = ["skirt", "dress", "top"]

# sleeveLength: Fotograftan okunabilen, motorun da tanidigi tek kol ekseni.
SLEEVE_LENGTH_CLASSES = ["short", "elbow", "long"]

# skirtStyle: Etek ailesi; motorun skirtStyle ekseniyle birebir.
SKIRT_STYLE_CLASSES = ["aLine", "straight", "gathered", "halfCircle", "pleated", "gore"]

# Registry so more heads can be added later without touching the training loop.
FIELDS = {
    "neckline": NECKLINE_CLASSES,
    "garment": GARMENT_CLASSES,
    "sleeveLength": SLEEVE_LENGTH_CLASSES,
    "skirtStyle": SKIRT_STYLE_CLASSES,
}

# Names that reached this module but CANNOT be a class today. Kept, never deleted:
# RULES invariant 1 — an unsupported value is refused out loud, not silently dropped.
# vocab_source_check audits this block: every entry must still be unresolvable, and
# no entry may also appear in FIELDS.
_UNRESOLVED = {
    ("garment", "trousers"):
        "engine/vocab.json fields.garment [\"skirt\",\"dress\",\"top\"] icinde YOK ve contract/vocab-resolution-v1.json'da garment.trousers kalemi YOK: motor pantolon cizmiyor. Elle yazilmis listeden devralindi (kaynagini \"backend/worker.js prompt\" diye veriyordu). SILINMEDI cunku ogretmen sema fotografta pantolon gorebiliyor; bir sinif olarak egitilemez.",
    ("garment", "other"):
        "Ayni sekilde hicbir eksende YOK. \"other\" bir giysi degil, bir kacis kutusudur; UNCERTAIN_VALUES zaten cekimserligi disliyor, bu yuzden ayri bir sinif olarak egitilmesi AMBAR YASASI ile celisir.",
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
