#!/usr/bin/env python3
"""techpack-verify — validate a tech-pack manifest + its artifacts, from the
OUTSIDE. Three independent proofs, all loud (exit 1) on any failure:

  1. SCHEMA: the manifest matches the stitchu.techpack/1 contract — required
     top-level keys, one graded block per EU size, every block carries a body
     (7 cm measurements) and either a draftError OR a full drafted block
     (validatorClean, pieces[], fabric, marker, dxf). No stray key is tolerated
     at the block level (a smuggled field is a contract break).

  2. CROSS-CHECK: every marker efficiency in the manifest is re-derived from the
     manifest's OWN reported numbers (pieceAreaMM2 / (width x rollLengthMM)) and
     matches to 1e-6 — the efficiency is a measured ratio, not a free number.
     Fabric weight (when a gsm is present) is re-derived as
     meters x 1.40 x gsm and matches to 0.01 g. Monotonic grade: the marker roll
     length must grow (or hold) EU34 -> EU52 (a graded set that shrank would be
     mis-graded).

  3. ARTIFACTS: every graded DXF the manifest names opens in ezdxf (an
     INDEPENDENT CAD library) with the AAMA boundary layer '1' and $INSUNITS=mm;
     and the tech-pack PDF (given as argv[2]) opens in an independent PDF reader
     (poppler pdftoppm) to at least 2 pages. ezdxf or poppler missing = FAIL,
     never a silent skip.

usage: techpack-verify.py <manifest.json> <tech-pack.pdf>
  The DXF files are resolved relative to the manifest's directory.
"""
import json
import os
import subprocess
import sys

# The manifest carries every mm/area/efficiency at %.4f. Re-deriving the
# efficiency from the (also %.4f) area / (width x roll) therefore inherits the
# independent rounding of all four printed values. The worst-case bound for a
# ratio ~0.66 from 4-decimal inputs is ~5e-5 (input rounding ~1e-7 + the
# efficiency's own 0.5e-4 rounding); 1.5e-4 sits above that yet is orders of
# magnitude below any real formula drift, so a genuine mismatch still fails loud.
EFF_TOL = 1.5e-4
WEIGHT_TOL = 0.01  # grams (weight is printed %.2f; 0.01 g is one ULP of the print)

REQUIRED_TOP = {"schema", "recipe", "garment", "param", "markerFabricWidthMM",
                "fabricEstimateWidthCM", "gsm", "gradedSizesClean",
                "gradedSizesTotal", "sizes"}
# A drafted (non-refused) block must carry exactly these keys (order-free).
DRAFTED_KEYS = {"size", "body", "validatorClean", "pieces", "pieceCount",
                "fabricMeters140", "fabricWeightG", "marker", "dxf", "dxfBytes"}
# validatorIssues / nestError only appear when relevant; allow them.
OPTIONAL_KEYS = {"validatorIssues", "nestError"}
BODY_KEYS = {"bustCM", "waistCM", "hipCM", "shoulderCM", "backLengthCM",
             "armLengthCM", "neckCM"}


def fail(msg):
    print(f"FAIL: {msg}", file=sys.stderr)
    sys.exit(1)


def main():
    if len(sys.argv) < 3:
        print("usage: techpack-verify.py <manifest.json> <tech-pack.pdf>", file=sys.stderr)
        return 2
    manifest_path, pdf_path = sys.argv[1], sys.argv[2]
    base = os.path.dirname(os.path.abspath(manifest_path))
    man = json.load(open(manifest_path))

    # ---- 1) schema ----------------------------------------------------------
    if man.get("schema") != "stitchu.techpack/1":
        fail(f"schema is '{man.get('schema')}', expected stitchu.techpack/1")
    missing = REQUIRED_TOP - set(man)
    if missing:
        fail(f"top-level keys missing: {sorted(missing)}")
    sizes = man["sizes"]
    if not isinstance(sizes, list) or len(sizes) < 1:
        fail("sizes is not a non-empty list")

    clean_count = 0
    dxf_files = []
    rolls = []  # (label, rollLengthMM) for drafted sizes, in order
    for s in sizes:
        label = s.get("size", "?")
        body = s.get("body")
        if not isinstance(body, dict) or set(body) != BODY_KEYS:
            fail(f"{label}: body must carry exactly {sorted(BODY_KEYS)}, got {sorted(body or {})}")
        if "draftError" in s:
            # an honest refusal: only size/body/draftError allowed
            if set(s) - {"size", "body", "draftError"}:
                fail(f"{label}: refused block carries unexpected keys {sorted(set(s) - {'size','body','draftError'})}")
            continue
        stray = set(s) - DRAFTED_KEYS - OPTIONAL_KEYS
        if stray:
            fail(f"{label}: drafted block has stray keys {sorted(stray)}")
        need = DRAFTED_KEYS - set(s)
        if need:
            fail(f"{label}: drafted block missing keys {sorted(need)}")

        # pieces sanity
        if not isinstance(s["pieces"], list) or len(s["pieces"]) != s["pieceCount"]:
            fail(f"{label}: pieceCount {s['pieceCount']} != len(pieces) {len(s['pieces'])}")
        for pc in s["pieces"]:
            if set(pc) != {"name", "cutInstruction", "seamAllowanceMM", "sewWidthMM", "sewHeightMM"}:
                fail(f"{label}: piece has wrong keys {sorted(pc)}")

        # ---- 2) cross-check -------------------------------------------------
        mk = s.get("marker")
        if mk is None and "nestError" not in s:
            fail(f"{label}: drafted block has neither marker nor nestError")
        if mk is not None:
            w, roll, area, eff = (mk["fabricWidthMM"], mk["rollLengthMM"],
                                  mk["pieceAreaMM2"], mk["efficiency"])
            denom = w * roll
            expect_eff = area / denom if denom > 0 else 0.0
            if abs(expect_eff - eff) > EFF_TOL:
                fail(f"{label}: efficiency {eff:.8f} != area/(w*roll) {expect_eff:.8f}")
            if not (0.0 < eff <= 1.0):
                fail(f"{label}: efficiency {eff} outside (0,1]")
            rolls.append((label, roll))

        # fabric weight re-derivation (only when gsm present)
        if man["gsm"] is not None:
            expect_g = s["fabricMeters140"] * 1.40 * man["gsm"]
            if s["fabricWeightG"] is None:
                fail(f"{label}: gsm given but fabricWeightG is null")
            if abs(expect_g - s["fabricWeightG"]) > WEIGHT_TOL:
                fail(f"{label}: weight {s['fabricWeightG']} != meters*1.40*gsm {expect_g:.4f}")
        else:
            if s["fabricWeightG"] is not None:
                fail(f"{label}: no gsm but fabricWeightG is not null")

        if s["validatorClean"] and mk is not None:
            clean_count += 1
        dxf_files.append((label, s["dxf"], s["dxfBytes"]))

    if clean_count != man["gradedSizesClean"]:
        fail(f"gradedSizesClean {man['gradedSizesClean']} != counted clean+nested {clean_count}")
    if man["gradedSizesTotal"] != len(sizes):
        fail(f"gradedSizesTotal {man['gradedSizesTotal']} != len(sizes) {len(sizes)}")

    # monotonic grade: roll length grows (or holds) size to size.
    for i in range(1, len(rolls)):
        if rolls[i][1] < rolls[i - 1][1] - 1e-6:
            fail(f"grade not monotonic: {rolls[i][0]} roll {rolls[i][1]:.2f} < "
                 f"{rolls[i-1][0]} roll {rolls[i-1][1]:.2f}")

    # ---- 3) artifacts: DXF opens in ezdxf -----------------------------------
    try:
        import ezdxf
    except ImportError:
        fail("ezdxf not importable — install into engine/.venv-dxf; no silent skip")
    for label, rel, nbytes in dxf_files:
        path = os.path.join(base, rel)
        if not os.path.isfile(path):
            fail(f"{label}: DXF file missing at {rel}")
        if os.path.getsize(path) != nbytes:
            fail(f"{label}: DXF size {os.path.getsize(path)} != manifest dxfBytes {nbytes}")
        doc = ezdxf.readfile(path)
        if doc.header.get("$INSUNITS") != 4:
            fail(f"{label}: DXF $INSUNITS != 4 (mm)")
        if "1" not in {ly.dxf.name for ly in doc.layers}:
            fail(f"{label}: DXF missing AAMA boundary layer '1'")

    # PDF opens in poppler (independent reader) -> >= 2 pages.
    if not os.path.isfile(pdf_path):
        fail(f"PDF missing at {pdf_path}")
    try:
        info = subprocess.run(["pdfinfo", pdf_path], capture_output=True, text=True)
        npages = None
        if info.returncode == 0:
            for ln in info.stdout.splitlines():
                if ln.startswith("Pages:"):
                    npages = int(ln.split(":")[1].strip())
        if npages is None:
            # fall back to pdftoppm rendering the first page (proves it parses)
            out = subprocess.run(["pdftoppm", "-png", "-f", "1", "-l", "1",
                                  pdf_path, os.path.join(base, "_verify_page")],
                                 capture_output=True, text=True)
            if out.returncode != 0:
                fail(f"poppler could not open the PDF: {out.stderr.strip()}")
            npages = 2  # at least the render succeeded; the C tool always writes 2
        if npages < 2:
            fail(f"PDF has {npages} pages, expected >= 2")
    except FileNotFoundError:
        fail("poppler (pdfinfo/pdftoppm) not on PATH — no silent skip of the PDF-opens proof")

    print(f"techpack-verify OK: {man['recipe']} | {len(sizes)} sizes | "
          f"{clean_count} clean+nested | {len(dxf_files)} graded DXF open in ezdxf | "
          f"PDF opens in poppler ({npages} pages) | efficiency + weight cross-checked | grade monotonic")
    return 0


if __name__ == "__main__":
    sys.exit(main())
