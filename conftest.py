"""Root pytest scope — declares which python files on disk are pytest tests.

Measured 2026-08-26 (GECE7/F2): `python3 -m pytest -q` at the repo root died with
4 collection ERRORs, so the repo's python runner was red on a base nobody had
looked at. The cause is not failing code; it is that NONE of the four
`test_*.py` files on disk is a pytest test:

  core/third_party/garmentcode/test_garmentcode.py    vendored upstream (gitignored),
  core/third_party/garmentcode/test_garment_sim.py    needs pygarment + svgpathtools
  engine/pattern-bridge/test_seamdeed.py              a SCRIPT: runs its 37 checks at
                                                      import time and ends in sys.exit(),
                                                      which is a collection error even
                                                      when its deps are installed. Its own
                                                      header names its interpreter:
                                                      core/third_party/garmentcode/.venv/bin/python

They are ignored here BY NAME, each with the reason above, and none of them is
weakened or deleted: they keep being run by their own documented routes
(engine-check/harness/run-all.sh, the GarmentCode venv). A fourth entry named
vision-student/test_onnx_load.py was dropped on 2026-08-29 because the H1 "depo
temiz" pass took that file out of the tree; a collect_ignore line for a file
that does not exist is a claim about a path, and this repo does not keep those. Nothing a gate used to
judge stopped being judged — pytest never judged them, it only crashed on them.

What pytest DOES judge from here on is engine/tests/py/, which is a real suite
with a real subject (the §1F photo-pool credits). See
engine/tests/py/test_kaynak_kunye.py.
"""

collect_ignore = [
    "core/third_party/garmentcode/test_garmentcode.py",
    "core/third_party/garmentcode/test_garment_sim.py",
    "engine/pattern-bridge/test_seamdeed.py",
]
