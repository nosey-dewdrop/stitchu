"""One fitted bodice on one bottom, generated and judged, with the waist
seam printed segment by segment.

The catalogue driver answers pass or fail. This answers WHERE the millimetres
went, which is the only thing worth looking at while the waist is open.

    python probe/dressprobe.py PencilSkirt            # one bottom
    python probe/dressprobe.py --all                  # every bottom, no wb
    python probe/dressprobe.py PencilSkirt --wb StraightWB
"""
import argparse
import json
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

import atlas                                            # noqa: E402
import walk as walklib                                  # noqa: E402

BOTTOMS = ['PencilSkirt', 'SkirtCircle', 'AsymmSkirtCircle', 'GodetSkirt',
           'Pants', 'Skirt2', 'SkirtManyPanels', 'SkirtLevels']


def build(bottom, wb, root, body_file, upper='FittedShirt'):
    d = atlas.plain_design()
    atlas.set_v(d, 'meta.upper', upper)
    atlas.set_v(d, 'meta.bottom', bottom)
    atlas.set_v(d, 'meta.wb', wb)
    out = Path(root) / f'{upper}--{bottom}--{wb}'
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    err = atlas.generate_batch(
        [{'id': 'one', 'design': d, 'out': str(out)}], root, body_file)['one']
    return out, err


def waist_pairs(rep):
    """Every judged pair that is a waist join, with both sides in mm."""
    rows = []
    for p in rep['pairs']:
        kind = (p.get('kind') or '')
        if 'waist' not in kind and 'WAIST' not in kind.upper():
            continue
        rows.append(p)
    return rows


def report(bottom, wb, root, body_file):
    out, err = build(bottom, wb, root, body_file)
    if err:
        return {'bottom': bottom, 'wb': wb, 'generator_error': err}
    v = atlas.gate(out)
    specs = list(Path(out).glob('*_specification.json'))
    rep = walklib.walk(specs[0], Path(out) / 'design.yaml')
    row = {
        'bottom': bottom, 'wb': wb, 'ok': v['ok'], 'why': v.get('why'),
        'fail': v['fail'], 'mirror_panel': v['mirror_panel'],
        'mirror_seam': v['mirror_seam'], 'max_diff_mm': v['max_diff_mm'],
    }
    row['failing'] = [
        {'kind': p.get('kind'), 'a': p.get('a'), 'b': p.get('b'),
         'len_a': p.get('len_a_mm'), 'len_b': p.get('len_b_mm'),
         'diff': p.get('diff_mm')}
        for p in rep['pairs'] if p.get('status') == 'FAIL']
    row['mirror_seam_faults'] = [
        m for m in rep['mirror_seams'] if m['status'] == 'FAIL']
    row['dir'] = str(out)
    return row


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('bottom', nargs='?', default='PencilSkirt')
    ap.add_argument('--wb', default=None)
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--root', default='/tmp/dressprobe')
    ap.add_argument('--json', action='store_true')
    a = ap.parse_args()

    root = Path(a.root)
    root.mkdir(parents=True, exist_ok=True)
    body_file = atlas.body_yaml(root / 'body.yaml')

    todo = BOTTOMS if a.all else [a.bottom]
    rows = []
    for b in todo:
        r = report(b, a.wb, root, body_file)
        rows.append(r)
        if a.json:
            continue
        head = f"{b} + {a.wb or 'no wb'}"
        if r.get('generator_error'):
            print(f"{head:38s} GENERATOR: {r['generator_error']}")
            continue
        print(f"{head:38s} {'OK' if r['ok'] else 'FAIL'}  "
              f"mirror_panel={r['mirror_panel']} mirror_seam={r['mirror_seam']} "
              f"seam_fail={r['fail']}  worst={r['max_diff_mm']:.4f}mm")
        # A pair can fail BEFORE it is classified, and then kind and the two
        # lengths are all None. Formatting them crashed the printout halfway
        # down a failing run, which loses exactly the rows worth reading.
        def num(v, fmt):
            return format(v, fmt) if isinstance(v, (int, float)) else '   ?  '

        for f in r['failing'][:6]:
            print(f"    {str(f['kind'] or 'unclassified'):22s} "
                  f"{f['a']} | {f['b']}  "
                  f"{num(f['len_a'], '.2f')} vs {num(f['len_b'], '.2f')}  "
                  f"{num(f['diff'], '+.4f')}mm")
        for m in r['mirror_seam_faults'][:6]:
            print(f"    mirror {m.get('seam')} ~ {m.get('mirror')}  "
                  f"{num(m.get('mirror_diff_mm'), '+.4f')}mm")
    if a.json:
        print(json.dumps(rows, indent=1, default=str))


if __name__ == '__main__':
    main()
