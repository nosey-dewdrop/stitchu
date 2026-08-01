# ============================================================================
# corpus.py — RUN THE INSTRUMENT OVER A CORPUS AND COUNT WHAT IS SEWABLE.
#
# The number nobody has published. The field's whole vocabulary of validity is
# "the simulator did not crash": a survey of five open pattern generators on
# 2026-08-02 found no seam length equality check in any of them, and the
# largest one refuses on purpose, splitting an edge to force a match rather
# than reporting the mismatch.
#
# Designs are sampled with the generator's OWN sampler, the one its published
# dataset was built with, so this measures the generator as it ships rather
# than as we drive it. Each sample is generated in a FRESH SUBPROCESS, which
# is the determinism law of this bridge, and each is walked with its own
# design file so a declared gather is read as a gather and not as a fault.
#
#   <gc>/.venv/bin/python corpus.py --count 40 --out Logs/corpus-<date>
# ============================================================================
import argparse
import json
import os
import random
import subprocess
import sys
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
GC_ROOT = REPO / 'core' / 'third_party' / 'garmentcode'
VENV_PY = GC_ROOT / '.venv' / 'bin' / 'python'

sys.path.insert(0, str(HERE))
import walk as walklib          # noqa: E402

DESIGN_FILE = GC_ROOT / 'assets' / 'design_params' / 'default.yaml'
BODY_FILE = GC_ROOT / 'assets' / 'bodies' / 'mean_all.yaml'

# One sample, generated on its own so a crash in the generator costs one
# pattern and not the run. Written as a script because pygarment has to be
# imported with the generator's own working directory.
GEN = r'''
import sys, json, yaml, random
from pathlib import Path
sys.path.insert(0, {gc!r})
import pygarment as pyg
from assets.garment_programs.meta_garment import MetaGarment
from assets.bodies.body_params import BodyParameters

seed = int(sys.argv[1]); out = Path(sys.argv[2])
random.seed(seed)
sampler = pyg.DesignSampler({design!r})
design = sampler.randomize()
body = BodyParameters({body!r})
piece = MetaGarment('sample', body, design)
pattern = piece.assembly()
out.mkdir(parents=True, exist_ok=True)
pattern.serialize(str(out), to_subfolder=False, tag='')
with open(out / 'design.yaml', 'w') as f:
    yaml.dump({{'design': design}}, f)
print('OK')
'''


def generate_one(seed, out_dir):
    script = GEN.format(gc=str(GC_ROOT), design=str(DESIGN_FILE),
                        body=str(BODY_FILE))
    # The generator pulls in matplotlib, whose macOS backend dies when it is
    # imported off the main thread of a plain subprocess. Nothing here draws.
    env = dict(os.environ, MPLBACKEND='Agg')
    r = subprocess.run([str(VENV_PY), '-c', script, str(seed), str(out_dir)],
                       cwd=str(GC_ROOT), capture_output=True, text=True,
                       env=env)
    if r.returncode != 0:
        return None, (r.stderr.strip().splitlines() or ['?'])[-1]
    specs = list(Path(out_dir).glob('*_specification.json'))
    if not specs:
        return None, 'generator wrote no specification'
    return specs[0], None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--count', type=int, default=40)
    ap.add_argument('--out', default=str(REPO / 'Logs' / 'corpus'))
    ap.add_argument('--start-seed', type=int, default=0)
    args = ap.parse_args()

    root = Path(args.out).resolve()
    root.mkdir(parents=True, exist_ok=True)

    rows, gen_failures = [], []
    for k in range(args.count):
        seed = args.start_seed + k
        out_dir = (root / f'sample-{seed:04d}').resolve()
        spec, err = generate_one(seed, out_dir)
        if spec is None:
            gen_failures.append({'seed': seed, 'error': err})
            print(f'  seed {seed:4d}  GENERATOR FAILED  {err[:70]}')
            continue
        design = out_dir / 'design.yaml'
        rep = walklib.walk(spec, design if design.exists() else None)
        s = rep['summary']
        mirror_seam = len([m for m in rep['mirror_seams']
                           if m['status'] == 'FAIL'])
        row = {
            'seed': seed,
            'pairs': s['pairs'],
            'fail': s['by_status'].get('FAIL', 0),
            'unverifiable': s['by_status'].get('UNVERIFIABLE', 0),
            'pass': s['by_status'].get('PASS', 0),
            'gathered': s['by_status'].get('GATHERED-PASS', 0),
            'max_diff_mm': s['max_diff_mm'],
            'not_closed': s['panels_not_closed'],
            'self_intersecting': s['panels_self_intersecting'],
            'mirror_panel': s['mirror_panel_faults'],
            'mirror_seam': mirror_seam,
            'unknown_kind': s['by_kind'].get('unknown', 0),
        }
        row['clean'] = (row['fail'] == 0 and row['not_closed'] == 0 and
                        row['self_intersecting'] == 0 and
                        row['mirror_panel'] == 0 and row['mirror_seam'] == 0)
        rows.append(row)
        flag = 'clean' if row['clean'] else (
            f"FAIL {row['fail']}  mirror {row['mirror_panel']}/"
            f"{row['mirror_seam']}  maxdiff {row['max_diff_mm']:.2f}mm")
        print(f"  seed {seed:4d}  {row['pairs']:3d} pairs  "
              f"{row['unverifiable']:2d} unverifiable  {flag}")

    walked = len(rows)
    clean = sum(1 for r in rows if r['clean'])
    fully_judged = [r for r in rows if r['unverifiable'] == 0]
    summary = {
        'requested': args.count,
        'generator_failed': len(gen_failures),
        'walked': walked,
        'clean': clean,
        'clean_rate': round(clean / walked, 4) if walked else None,
        'fully_judged': len(fully_judged),
        'clean_among_fully_judged': sum(1 for r in fully_judged if r['clean']),
        'patterns_with_a_failing_seam': sum(1 for r in rows if r['fail']),
        'patterns_with_an_open_contour': sum(1 for r in rows if r['not_closed']),
        'patterns_self_intersecting': sum(1 for r in rows
                                          if r['self_intersecting']),
        'patterns_with_a_mirror_fault': sum(1 for r in rows if r['mirror_panel']
                                            or r['mirror_seam']),
        'total_pairs': sum(r['pairs'] for r in rows),
        'total_failing_pairs': sum(r['fail'] for r in rows),
        'total_unverifiable_pairs': sum(r['unverifiable'] for r in rows),
        'worst_single_pair_mm': max((r['max_diff_mm'] for r in rows),
                                    default=0.0),
        'tolerance_mm': walklib.TOL_MM,
    }

    print()
    print('=' * 78)
    for k, v in summary.items():
        print(f'  {k:32} {v}')
    print('=' * 78)

    (root / 'corpus-report.json').write_text(json.dumps(
        {'summary': summary, 'rows': rows,
         'generator_failures': gen_failures}, indent=2))
    print(f"\nwrote {root / 'corpus-report.json'}")


if __name__ == '__main__':
    main()
