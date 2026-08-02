# ============================================================================
# rejudge.py — RE-READ THE VERDICT WITHOUT REDRAWING THE GARMENT.
#
# The drawing is the expensive half and it is already on disk. When a rule
# changes, or a bug in the gate is fixed, the honest move is to judge the same
# pattern again rather than to leave a verdict standing that was produced by
# code that no longer exists.
#
# Written for one such fix. Every lapel in the vocabulary was being recorded
# as failed because the notch audit crashed on a stitch that carries a third
# entry, and 38 of the first 384 cells driven carried that verdict. The
# patterns were fine.
#
#   rejudge.py Logs/katalog-<date>                 only the crashed verdicts
#   rejudge.py Logs/katalog-<date> --all           every cell in the manifest
# ============================================================================
import argparse
import json
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import atlas                       # noqa: E402

CRASH_MARKS = ('TypeError', 'driver error', 'Error:')


def needs_rejudging(row, everything):
    if everything:
        return True
    return any(m in (row.get('why') or '') for m in CRASH_MARKS)


def _judge(job):
    root, row = job
    slug = row['slug']
    tries = sorted((Path(root) / slug).glob('try*'))
    for out in tries:
        if not list(out.glob('*_specification.json')):
            continue
        v = atlas.gate(out)
        if v['ok']:
            row = dict(row)
            row.update({
                'ok': True, 'try': int(out.name[3:]), 'why': None,
                'dir': str(out.relative_to(root)),
                'pairs': v['pairs'], 'gathered': v['gathered'],
                'worst_seam_mm': v['max_diff_mm'],
                'worst_off_mm': v['worst_off_mm'],
                'notches': v['notches'], 'notch_worst_mm': v['notch_worst_mm'],
                'rejudged': True,
            })
            return row
        last = v
    row = dict(row)
    row['why'] = last.get('why') if tries else row.get('why')
    row['rejudged'] = True
    return row


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('root')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--jobs', type=int, default=4)
    args = ap.parse_args()

    root = Path(args.root).resolve()
    manifest = root / 'cells.jsonl'
    rows = [json.loads(l) for l in manifest.read_text().splitlines()
            if l.strip()]
    todo = [i for i, r in enumerate(rows) if needs_rejudging(r, args.all)]
    print(f'{len(rows)} cells, {len(todo)} to judge again')
    if not todo:
        return

    jobs = [(str(root), rows[i]) for i in todo]
    with ProcessPoolExecutor(max_workers=args.jobs) as pool:
        for i, new in zip(todo, pool.map(_judge, jobs, chunksize=4)):
            rows[i] = new

    flipped = sum(1 for i in todo if rows[i]['ok'])
    manifest.write_text('\n'.join(json.dumps(r) for r in rows) + '\n')
    print(f'{flipped} of {len(todo)} pass on the second reading; '
          f'manifest rewritten')


if __name__ == '__main__':
    main()
