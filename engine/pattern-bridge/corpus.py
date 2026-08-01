# ============================================================================
# corpus.py — RUN THE INSTRUMENT OVER A CORPUS AND COUNT WHAT IS SEWABLE.
#
# GREEN AND UNSEWABLE. The name for what this measures. A pattern is green and
# unsewable when it passes every gate its own generator runs and still carries
# a seam that cannot be sewn. On 500 designs asked of GarmentCode's own
# sampler, 472 of which produced a pattern, 318 passed the generator's gate and
# 202 of those were green and unsewable. The gate is not wrong, it is narrow:
# it looks for a piece whose outline crosses itself, which it finds well, and
# it never compares the two sides of a seam.
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
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
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

# A BATCH of samples in one worker. The first version spawned a process per
# sample so a crash cost one pattern and not the run, and that is still true
# per batch. What it also cost was an `import pygarment` per sample: numpy,
# scipy and matplotlib, about four seconds, against roughly one second of
# actual generation. Running twelve of those at once made every one of them
# slower rather than faster, 4.8s alone against 13-34s with five siblings,
# and the whole run came out no quicker than serial.
#
# So the import is paid once per worker and the worker loops. Every sample
# still reseeds and rebuilds from nothing, and that this is the same run was
# checked rather than assumed. Seeds 0-56 were regenerated batched and set
# against the same seeds generated one process each. The design files are
# byte identical on all 57. The specifications are NOT, and the reason is not
# ours: the generator serializes its panels in an unstable order, so the same
# pattern comes out with a different panel first. Compared by content the 57
# specifications are identical, and walked end to end all 57 produce the same
# verdict on every pair. Nothing here reads panel order.
GEN = r"""
import sys, json, yaml, random, traceback
from pathlib import Path
sys.path.insert(0, {gc!r})
import pygarment as pyg
from assets.garment_programs.meta_garment import MetaGarment
from assets.bodies.body_params import BodyParameters

root = Path(sys.argv[1])
seeds = [int(x) for x in sys.argv[2:]]
sampler = pyg.DesignSampler({design!r})

for seed in seeds:
    out = root / ('sample-%04d' % seed)
    try:
        random.seed(seed)
        design = sampler.randomize()
        body = BodyParameters({body!r})
        piece = MetaGarment('sample', body, design)
        # The generator's OWN gate, the one its published dataset passed
        # through: pattern_sampler.py rejects a design and redraws when this
        # comes back True. Recorded rather than acted on, so the same sample
        # can be judged by both.
        own_gate = bool(piece.is_self_intersecting())
        pattern = piece.assembly()
        out.mkdir(parents=True, exist_ok=True)
        pattern.serialize(str(out), to_subfolder=False, tag='')
        with open(out / 'design.yaml', 'w') as f:
            yaml.dump({{'design': design}}, f)
        with open(out / 'generator-verdict.json', 'w') as f:
            json.dump({{'is_self_intersecting': own_gate}}, f)
        print('OK %d' % seed, flush=True)
    except BaseException:
        line = traceback.format_exc().strip().splitlines()[-1]
        print('ERR %d %s' % (seed, line), flush=True)
"""


def generate_batch(seeds, root):
    """Generate these seeds in one worker. Returns {seed: error or None}."""
    script = GEN.format(gc=str(GC_ROOT), design=str(DESIGN_FILE),
                        body=str(BODY_FILE))
    # The generator pulls in matplotlib, whose macOS backend dies when it is
    # imported off the main thread of a plain subprocess. Nothing here draws.
    env = dict(os.environ, MPLBACKEND='Agg')
    r = subprocess.run(
        [str(VENV_PY), '-c', script, str(root)] + [str(s) for s in seeds],
        cwd=str(GC_ROOT), capture_output=True, text=True, env=env)
    out = {s: 'worker produced no verdict for this seed' for s in seeds}
    for line in r.stdout.splitlines():
        if line.startswith('OK '):
            out[int(line.split()[1])] = None
        elif line.startswith('ERR '):
            parts = line.split(None, 2)
            out[int(parts[1])] = parts[2] if len(parts) > 2 else '?'
    if r.returncode != 0 and all(v is not None for v in out.values()):
        last = (r.stderr.strip().splitlines() or ['?'])[-1]
        out = {s: last for s in seeds}
    return out


def walk_sample(seed, root, walklib):
    """Everything the instrument says about one generated sample."""
    out_dir = root / f'sample-{seed:04d}'
    specs = list(out_dir.glob('*_specification.json'))
    if not specs:
        return None
    design = out_dir / 'design.yaml'
    own = out_dir / 'generator-verdict.json'
    own_gate = (json.loads(own.read_text())['is_self_intersecting']
                if own.exists() else None)
    rep = walklib.walk(specs[0], design if design.exists() else None)
    s = rep['summary']
    row = {
        'seed': seed,
        'pairs': s['pairs'],
        'fail': s['by_status'].get('FAIL', 0),
        'unverifiable': s['by_status'].get('UNVERIFIABLE', 0),
        'unscored': s['by_status'].get('GATHERED-UNSCORED', 0),
        'pass': s['by_status'].get('PASS', 0),
        'gathered': s['by_status'].get('GATHERED-PASS', 0),
        'max_diff_mm': s['max_diff_mm'],
        'not_closed': s['panels_not_closed'],
        'self_intersecting': s['panels_self_intersecting'],
        'mirror_panel': s['mirror_panel_faults'],
        'mirror_seam': len([m for m in rep['mirror_seams']
                            if m['status'] == 'FAIL']),
        'unknown_kind': s['by_kind'].get('unknown', 0),
        'generator_says_self_intersecting': own_gate,
    }
    row['clean'] = (row['fail'] == 0 and row['not_closed'] == 0 and
                    row['self_intersecting'] == 0 and
                    row['mirror_panel'] == 0 and row['mirror_seam'] == 0)
    # Fully judged means every pair got a verdict a rule produced. A seam the
    # design gathers without fixing its length did not, and neither did one
    # whose kind was never established. Both are named so the headline rate
    # can be quoted with them and without them.
    row['fully_judged'] = (row['unverifiable'] == 0 and row['unscored'] == 0)
    return row


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--count', type=int, default=40)
    ap.add_argument('--out', default=str(REPO / 'Logs' / 'corpus'))
    ap.add_argument('--start-seed', type=int, default=0)
    ap.add_argument('--jobs', type=int, default=os.cpu_count() or 4,
                    help='worker processes; each imports the generator once '
                         'and then loops over its share of the seeds')
    args = ap.parse_args()

    root = Path(args.out).resolve()
    root.mkdir(parents=True, exist_ok=True)

    seeds = [args.start_seed + k for k in range(args.count)]
    jobs = max(1, min(args.jobs, len(seeds)))
    batches = [seeds[i::jobs] for i in range(jobs)]

    with ThreadPoolExecutor(max_workers=jobs) as pool:
        errs = {}
        for part in pool.map(lambda b: generate_batch(b, root), batches):
            errs.update(part)

    rows, gen_failures = [], []
    for seed in seeds:
        if errs.get(seed) is not None:
            gen_failures.append({'seed': seed, 'error': errs[seed]})
            print(f"  seed {seed:4d}  GENERATOR FAILED  {errs[seed][:70]}")
            continue
        r = walk_sample(seed, root, walklib)
        if r is None:
            gen_failures.append({'seed': seed,
                                 'error': 'generator wrote no specification'})
            print(f'  seed {seed:4d}  GENERATOR WROTE NOTHING')
            continue
        rows.append(r)
        flag = 'clean' if r['clean'] else (
            f"FAIL {r['fail']}  mirror {r['mirror_panel']}/{r['mirror_seam']}  "
            f"maxdiff {r['max_diff_mm']:.2f}mm")
        print(f"  seed {seed:4d}  {r['pairs']:3d} pairs  "
              f"{r['unscored']:2d} unscored  {r['unverifiable']:2d} unjudged  {flag}")

    walked = len(rows)
    clean = sum(1 for r in rows if r['clean'])
    fully_judged = [r for r in rows if r['fully_judged']]
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
        'total_unscored_pairs': sum(r['unscored'] for r in rows),
        # The comparison the headline rests on: of the patterns the generator's
        # own gate lets through, how many carry a seam that cannot be sewn.
        'passed_generator_own_gate': sum(
            1 for r in rows if r['generator_says_self_intersecting'] is False),
        'clean_among_those': sum(
            1 for r in rows
            if r['generator_says_self_intersecting'] is False and r['clean']),
        'generator_own_gate_rejected': sum(
            1 for r in rows if r['generator_says_self_intersecting'] is True),
        'patterns_carrying_an_unscored_seam': sum(1 for r in rows
                                                  if r['unscored']),
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
