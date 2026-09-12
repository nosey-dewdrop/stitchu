# ============================================================================
# generate.py — atolye state JSON -> real sewing pattern.
#
#   state JSON -> mapping.py -> design.yaml + body.yaml + mapping-notes.json
#              -> GarmentCode (core/third_party/garmentcode, pinned d449629)
#              -> specification.json / pattern.svg / pattern.png / print PDF
#              -> walk.py seam deed (seam-report.json + seam-report.txt)
#              -> printpack.py 1:1 paper (print-a0.pdf / print-a4.pdf /
#                 print-report.txt: allowance, notches, grainline, tiling)
#
# Must run with the GarmentCode venv python:
#   PYTHONPATH=<gc root> <gc root>/.venv/bin/python generate.py state.json out/
# (scripts/atolye-serve.sh and the e2e commands below set this up.)
# ============================================================================
import argparse
import copy
import json
import os
import sys
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent
GC_ROOT = HERE.parent.parent / 'core' / 'third_party' / 'garmentcode'

sys.path.insert(0, str(HERE))
sys.path.insert(0, str(GC_ROOT))

from mapping import map_state, SIZES  # noqa: E402
import printpack  # noqa: E402
import walk as walklib  # noqa: E402

NAME = 'stitchu'


def generate(state, out_dir, no_print=False):
    """State dict -> pattern files in out_dir. Returns dict of output paths.

    no_print=True skips the printpack stage (A0/A4 1:1 paper); used by
    gradeset.py where 8 sizes are audited and the paper pack is not the
    object under test. Everything up to and including the seam deed runs
    unchanged.
    """
    out_dir = Path(out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    design, body, notes = map_state(state)

    design_path = out_dir / 'design.yaml'
    body_path = out_dir / 'body.yaml'
    notes_path = out_dir / 'mapping-notes.json'
    with open(design_path, 'w') as f:
        yaml.dump({'design': design}, f, sort_keys=True)
    with open(body_path, 'w') as f:
        yaml.dump({'body': body}, f, sort_keys=True)
    notes_path.write_text(json.dumps(notes, indent=2, ensure_ascii=False))

    # GarmentCode resolves its asset paths relative to its repo root.
    prev_cwd = os.getcwd()
    os.chdir(GC_ROOT)
    try:
        from assets.garment_programs.meta_garment import MetaGarment
        from assets.bodies.body_params import BodyParameters

        # GarmentCode's cut_corner places the armhole with a bounded
        # optimizer; on the boundary of its feasible region the cut
        # degenerates ("Start and end of an edge should differ") and the
        # boundary is a knife-edge (measured 2026-08-01: EU46/EU48 defaults
        # flip OK/crash on sub-mm body changes). Escape ladder: retry with
        # a small shoulder_w nudge. Every non-zero nudge is RECORDED in
        # mapping-notes.json — nothing is silently changed.
        NUDGES = [0.0, 0.3, -0.3, 0.6, -0.6, 1.0, -1.0]
        pattern = None
        for nudge in NUDGES:
            body_try = dict(body)
            body_try['shoulder_w'] = round(body['shoulder_w'] + nudge, 4)
            with open(body_path, 'w') as f:
                yaml.dump({'body': body_try}, f, sort_keys=True)
            try:
                body_params = BodyParameters(str(body_path))
                piece = MetaGarment(NAME, body_params, copy.deepcopy(design))
                pattern = piece.assembly()
            except Exception as e:  # noqa: BLE001 — GarmentCode raises bare AssertionError here
                if nudge == NUDGES[-1]:
                    raise
                print(f'GarmentCode assembly failed (shoulder_w nudge {nudge}): '
                      f'{type(e).__name__}: {e}', file=sys.stderr)
                continue
            if nudge != 0.0:
                notes.append({
                    'field': 'body.shoulder_w', 'value': body_try['shoulder_w'],
                    'action': f'nudged by {nudge:+.1f}cm to escape a GarmentCode '
                              'cut_corner boundary degeneracy',
                    'lost': 'nothing measurable: below tape precision, recorded here',
                })
                notes_path.write_text(json.dumps(notes, indent=2, ensure_ascii=False))
            break
        if piece.is_self_intersecting():
            print(f'WARNING: {piece.name} is self-intersecting', file=sys.stderr)
        pattern.serialize(
            str(out_dir), tag='', to_subfolder=False,
            with_3d=False, with_text=False, view_ids=False,
            with_printable=True)
    finally:
        os.chdir(prev_cwd)

    spec_path = out_dir / f'{NAME}_specification.json'
    report = walklib.walk(spec_path, design_path)
    (out_dir / 'seam-report.json').write_text(json.dumps(report, indent=2))
    (out_dir / 'seam-report.txt').write_text(walklib.report_txt(report))

    if no_print:
        print_paths = {}
    else:
        size_label = SIZES[int(state.get('size', 2))]
        print_paths = printpack.build(out_dir, spec_path, size_label)

    return {
        'specification': spec_path,
        'svg': out_dir / f'{NAME}_pattern.svg',
        'png': out_dir / f'{NAME}_pattern.png',
        'pdf': out_dir / f'{NAME}_print_pattern.pdf',
        'print_svg': out_dir / f'{NAME}_print_pattern.svg',
        'seam_json': out_dir / 'seam-report.json',
        'seam_txt': out_dir / 'seam-report.txt',
        **print_paths,
        'notes': notes_path,
        'design': design_path,
        'body': body_path,
    }


def main():
    ap = argparse.ArgumentParser(description='atolye state JSON -> sewing pattern')
    ap.add_argument('state_json', help='atolye state JSON file (POST body of /api/pattern)')
    ap.add_argument('out_dir', help='output directory')
    ap.add_argument('--no-print', action='store_true',
                    help='skip the printpack stage (gradeset audit mode)')
    args = ap.parse_args()

    with open(args.state_json) as f:
        state = json.load(f)
    paths = generate(state, args.out_dir, no_print=args.no_print)
    for k, p in paths.items():
        exists = Path(p).exists()
        print(f'{k}: {p} {"OK" if exists else "MISSING"}')
    if not all(Path(p).exists() for p in paths.values()):
        sys.exit(1)


if __name__ == '__main__':
    main()
