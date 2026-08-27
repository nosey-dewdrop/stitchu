#!/usr/bin/env python3
"""gen-al-dene — build web/data/al-dene.json for the AL DENE page (GECE7 / F8).

WHY THIS IS GENERATED AND NOT WRITTEN BY HAND.

The AL DENE page shows ten real photographs and, for each, the garment reading
the pipeline already banked. Every one of those three things already exists in
this repo under a seal:

  * WHICH ten          contract/hedef-kosu-taban.json `_olcum_seti.hedef_10`
                       (§3.8 md.2 — the phase agent may not choose the set, add
                       to it or remove from it; the referee chose it)
  * the READINGS       vision/eval/live-2026-08-22.json (five) and
                       vision/eval/live-hedef10-2026-08-26.json (five) — the
                       SAME banked answers hedef_kosu.mjs runs against, so the
                       page and the ratchet cannot disagree about what the
                       model said
  * the CREDIT         vision/eval/credits.json — author, licence, licence URL,
                       Commons page, and the sha256 of the file that was fetched

Typing any of that into a page by hand creates a second copy that drifts, and
the drift would be invisible: a stale label under a photo still looks fine. So
the page reads a file, and this tool writes it from the seals.

🚨 THE HOLDOUT IS NOT IN THE SET AND CANNOT BE. `hedef_10` is the only list read;
the referee's holdout (11 · 12 · 30 · 35) and reserve five (10 · 14 · 15 · 34 ·
36, K16) are in neither fixture and are not reachable from here.

🚨 ZERO API CALLS (§3.9). This tool reads JSON off disk. The page it feeds calls
no VLM either — the labels are banked. The MEASUREMENT half of the pipeline
(measure.js) still runs for real in the visitor's browser, on the same image.

The web copies of the photographs are asserted BYTE-IDENTICAL to the files whose
sha256 the credits file recorded at fetch time. A re-encoded or cropped copy
would measure differently from the banked run and the page would quietly stop
being the same experiment.

usage: python3 engine/tools/gen-al-dene.py [repo-root]
"""
import hashlib
import json
import os
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "..")
ROOT = os.path.abspath(ROOT)

FIXTURES = [
    "vision/eval/live-2026-08-22.json",
    "vision/eval/live-hedef10-2026-08-26.json",
]
TABAN = "contract/hedef-kosu-taban.json"
CREDITS = "vision/eval/credits.json"
PHOTOS = "web/ornek"
OUT = "web/data/al-dene.json"


def load(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return json.load(f)


def sealed_ten(obj):
    """Pull `_olcum_seti.hedef_10` out of the baseline wherever it sits.

    Read rather than restated: if the referee ever moves the set, this follows
    it instead of shipping a stale ten under the same name.
    """
    if isinstance(obj, dict):
        if "hedef_10" in obj:
            return obj["hedef_10"]
        for v in obj.values():
            got = sealed_ten(v)
            if got:
                return got
    return None


def main():
    seen = {}
    for fx in FIXTURES:
        seen.update(load(fx))
    credits = load(CREDITS)
    ten = sealed_ten(load(TABAN))
    if not ten:
        sys.exit(f"FAIL: no _olcum_seti.hedef_10 in {TABAN}")

    items = []
    for name in ten:
        if name not in seen:
            sys.exit(f"FAIL: '{name}' is in the sealed ten but in neither banked fixture")
        if name not in credits:
            sys.exit(f"FAIL: '{name}' has no credit line; an uncredited photo does not ship")
        path = os.path.join(ROOT, PHOTOS, name)
        if not os.path.exists(path):
            sys.exit(f"FAIL: {PHOTOS}/{name} missing — copy it from vision/eval/photos/")
        with open(path, "rb") as f:
            digest = hashlib.sha256(f.read()).hexdigest()
        c = credits[name]
        if digest != c["sha256"]:
            sys.exit(
                f"FAIL: {PHOTOS}/{name} is not the credited file "
                f"({digest[:12]} vs {c['sha256'][:12]}). A re-encoded copy measures "
                f"differently from the banked run."
            )
        items.append({
            "dosya": name,
            "no": name.split("-")[0],
            "seen": seen[name],
            "kunye": {
                "author": c["author"],
                "license": c["license"],
                "license_url": c["license_url"],
                "commons_page": c["commons_page"],
                "sha256": c["sha256"],
            },
        })

    doc = {
        "_ne": "AL DENE — on gercek fotograf, on bankali goru okumasi.",
        "_uretildi": "engine/tools/gen-al-dene.py — ELLE YAZILMAZ.",
        # ⚠ THE KEY IS `olcum_seti`, NOT `set`. `set` is a shipped shoulderStyle
        # enum VALUE (measurements.hpp ShoulderStyle::Set), and
        # vocab_reference_check counts every `"set"` in its scope as a reference
        # to that word. A JSON key spelled the same way grows a closed enum's
        # reference count by one and burns the gate red — measured, F8.
        "_kaynak": {"goru": FIXTURES, "kunye": CREDITS, "olcum_seti": f"{TABAN} _olcum_seti.hedef_10"},
        "_sifir_api": (
            "Bu sayfa VLM cagirmaz (§3.9). Etiketler bankali; olcum (measure.js) "
            "ziyaretcinin tarayicisinda GERCEKTEN kosar, ayni goruntu uzerinde."
        ),
        "_holdout": (
            "Hakemin holdout dortlusu (11 12 30 35) ve yedek besi (10 14 15 34 36) "
            "BU DOSYADA YOKTUR ve buradan erisilemez (K16)."
        ),
        "ornekler": items,
    }
    out = os.path.join(ROOT, OUT)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"gen-al-dene: wrote {OUT} — {len(items)} example(s), every photo byte-checked")


if __name__ == "__main__":
    main()
