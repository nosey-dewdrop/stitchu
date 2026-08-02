"""Which dial moves which seam.

Turning forty dials at once rescued none of fifty-eight failing cells. Turning
ONE dial, chosen because it is the dial that moves the seam that failed, closed
the fitted bodice's underarm seam at a threshold between 0.610 and 0.615. The
difference is not luck, it is that a random reading is a step in 40 dimensions
and almost every direction is worse.

So the engine learns the map once and then never searches blind again. This
file does two things.

    build   perturb every continuous dial on a garment that carries every seam
            kind, and record how far each seam kind moved. Written to
            knowledge/dial-seam-table.json.

    close   given a cell that failed and the kind of seam that failed, take the
            dials that move that kind, in order of how much they move it, and
            search each one alone by bisection.

The table is measured, not asserted. A dial that does nothing to a seam kind is
recorded as doing nothing, and a kind with no dial behind it is recorded as
having none, because that is a finding rather than a gap to fill.

    python dials.py build --out knowledge/dial-seam-table.json
"""
import argparse
import copy
import json
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import atlas                                            # noqa: E402
import vocab as vocablib                                # noqa: E402
import walk as walklib                                  # noqa: E402

TABLE_PATH = HERE.parent.parent / 'knowledge' / 'dial-seam-table.json'

# A dial has to move a seam by more than this before it is written down as
# moving it. Half the smallest number the seam judgement cares about, so a
# dial that only shifts the last digit is not recorded as a lever.
NOTICE_MM = 0.05


def rich_design():
    """One garment that carries every seam kind the classifier knows.

    Bodice, sleeve with a cuff, collar, waistband and a skirt. Kinds with no
    panel in this garment cannot be measured here and are absent from the
    table rather than being given a zero, which would read as measured.
    """
    d = atlas.plain_design()
    atlas.set_v(d, 'meta.upper', 'FittedShirt')
    atlas.set_v(d, 'meta.bottom', 'PencilSkirt')
    atlas.set_v(d, 'meta.wb', 'StraightWB')
    atlas.set_v(d, 'sleeve.sleeveless', False)
    atlas.set_v(d, 'sleeve.length', 0.8)
    return d


# ---------------------------------------------------------------------------
# reading one garment
# ---------------------------------------------------------------------------
def by_kind(out_dir):
    """{kind: worst distance from that kind's own rule, in mm} plus the fails.

    Distance from the rule, not raw inequality. A skirt gathered onto a
    waistband at 1.3 is twelve millimetres unequal and zero millimetres wrong,
    and a search that chased the twelve would walk away from a passing seam.
    """
    out_dir = Path(out_dir)
    specs = list(out_dir.glob('*_specification.json'))
    if not specs:
        return None
    design = out_dir / 'design.yaml'
    rep = walklib.walk(specs[0], design if design.exists() else None)
    worst, fails = {}, {}
    for p in rep['pairs']:
        kind = p.get('kind') or 'unknown'
        off = atlas._off(p)
        worst[kind] = max(worst.get(kind, 0.0), float(off))
        if p.get('status') == 'FAIL':
            fails[kind] = fails.get(kind, 0) + 1
    mirror = len([m for m in rep['mirror_seams'] if m['status'] == 'FAIL'])
    mirror += rep['summary']['mirror_panel_faults']
    return {'worst': worst, 'fails': fails, 'mirror': mirror,
            'total_fails': sum(fails.values())}


def draw(design, out, root, body_file):
    """Generate one reading. Returns the reading or None if it did not draw."""
    out = Path(out)
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    err = atlas.generate_batch(
        [{'id': 'one', 'design': design, 'out': str(out)}], root,
        body_file)['one']
    if err:
        return None
    return by_kind(out)


# ---------------------------------------------------------------------------
# build the table
# ---------------------------------------------------------------------------
def build(root, body_file, tree, dials, base=None):
    base = base if base is not None else rich_design()
    root = Path(root)
    ref = draw(base, root / 'base', root, body_file)
    if ref is None:
        raise RuntimeError('the reference garment did not draw')

    table, missed = {}, []
    for i, path in enumerate(dials):
        node = atlas._node(tree, path)
        lo, hi = node['range'][0], node['range'][1]
        moved = {}
        seen = False
        for tag, value in (('lo', lo), ('hi', hi)):
            d = copy.deepcopy(base)
            if node['type'] == 'int':
                value = int(round(value))
            atlas.set_v(d, path, value)
            got = draw(d, root / f'probe-{i:03d}-{tag}', root, body_file)
            if got is None:
                continue
            seen = True
            for kind in set(got['worst']) | set(ref['worst']):
                delta = abs(got['worst'].get(kind, 0.0)
                            - ref['worst'].get(kind, 0.0))
                if delta > NOTICE_MM:
                    moved[kind] = max(moved.get(kind, 0.0), round(delta, 4))
        if not seen:
            missed.append(path)
            continue
        table[path] = {'range': [lo, hi], 'type': node['type'],
                       'moves': moved}
        print(f'  {path:44s} {"  ".join(f"{k} {v:.2f}mm" for k, v in sorted(moved.items(), key=lambda kv: -kv[1])[:4]) or "nothing"}',
              flush=True)

    return {'reference': {'worst': ref['worst'], 'fails': ref['fails']},
            'notice_mm': NOTICE_MM,
            'dials': table,
            'never_drew': missed}


def levers(table, kind, limit=4):
    """The dials that move this seam kind, strongest first."""
    rows = [(d, info['moves'][kind])
            for d, info in table['dials'].items()
            if kind in info.get('moves', {})]
    rows.sort(key=lambda r: -r[1])
    return [d for d, _ in rows[:limit]]


# ---------------------------------------------------------------------------
# close one failing cell
# ---------------------------------------------------------------------------
def _score(reading, kind):
    """Lower is better. Gate 0 first, then the seam that actually failed."""
    if reading is None:
        return (10 ** 6, 10 ** 6)
    return (reading['total_fails'] + reading['mirror'],
            reading['worst'].get(kind, 0.0))


def bisect_dial(design, path, kind, tree, root, body_file, steps=6,
                tag='bis'):
    """Search one dial alone. Returns (value, reading, evaluations).

    Bisection over one dial, which is the search that worked: the underarm
    seam closed between 0.610 and 0.615 this way after a forty dial random
    walk had closed nothing. The interval is halved toward whichever end
    scores better, so the cost is `steps` readings and not a sweep.
    """
    node = atlas._node(tree, path)
    lo, hi = float(node['range'][0]), float(node['range'][1])
    is_int = node['type'] == 'int'
    evals = []

    def at(value):
        v = int(round(value)) if is_int else round(value, 4)
        d = copy.deepcopy(design)
        atlas.set_v(d, path, v)
        where = Path(root) / f'{tag}-{len(evals):02d}'
        r = draw(d, where, root, body_file)
        evals.append({'value': v, 'score': _score(r, kind),
                      'ok': bool(r and r['total_fails'] == 0
                                 and r['mirror'] == 0)})
        return v, r, where

    best = (None, None, (10 ** 6, 10 ** 6), None)

    def done():
        return (best[1] is not None and best[1]['total_fails'] == 0
                and best[1]['mirror'] == 0)

    for _ in range(max(1, steps)):
        mid = (lo + hi) / 2.0
        va, ra, wa = at(lo + (mid - lo) / 2.0)
        if _score(ra, kind) < best[2]:
            best = (va, ra, _score(ra, kind), wa)
        if done():
            break
        vb, rb, wb = at(mid + (hi - mid) / 2.0)
        if _score(rb, kind) < best[2]:
            best = (vb, rb, _score(rb, kind), wb)
        if done():
            break
        if _score(ra, kind) <= _score(rb, kind):
            hi = mid
        else:
            lo = mid
        if is_int and hi - lo < 1:
            break
    return best[0], best[1], evals, best[3]


def close_cell(design, reading, table, tree, root, body_file, limit=3,
               steps=5):
    """Take the kind of seam that failed and search its dials, one at a time.

    Returns a record naming every dial tried, every value read, and the one
    that closed it, so a cell that stays open says WHICH lever was pulled how
    far rather than saying it was tried.
    """
    if reading is None:
        return {'closed': False, 'why': 'the reading did not draw'}
    failing = sorted(reading['fails'].items(), key=lambda kv: -kv[1])
    if not failing and reading['mirror']:
        return {'closed': False, 'why': 'mirror fault, no seam kind to aim at',
                'tried': []}
    if not failing:
        return {'closed': True, 'why': 'nothing failed', 'tried': []}
    kind = failing[0][0]
    chosen = levers(table, kind, limit)
    if not chosen:
        return {'closed': False, 'kind': kind, 'tried': [],
                'why': f'no dial in the table moves a {kind} seam'}

    tried = []
    work = copy.deepcopy(design)
    for path in chosen:
        value, got, evals, where = bisect_dial(
            work, path, kind, tree, root, body_file, steps=steps,
            tag=f'bis-{path.replace(".", "-")}')
        tried.append({'dial': path, 'kind': kind, 'value': value,
                      'readings': len(evals),
                      'worst_mm': None if got is None
                      else round(got['worst'].get(kind, 0.0), 4),
                      'fails': None if got is None else got['total_fails'],
                      'evals': evals})
        if got is not None and got['total_fails'] == 0 and got['mirror'] == 0:
            atlas.set_v(work, path, value)
            return {'closed': True, 'kind': kind, 'dial': path,
                    'value': value, 'design': work, 'dir': str(where),
                    'tried': tried}
        # Keep the best value found for this dial and move to the next one,
        # so the levers compose instead of each starting from scratch.
        if value is not None:
            atlas.set_v(work, path, value)
    return {'closed': False, 'kind': kind, 'tried': tried, 'design': work,
            'why': f'{len(chosen)} dial(s) searched, {kind} still open'}


def load_table(path=None):
    p = Path(path or TABLE_PATH)
    if not p.exists():
        return None
    with open(p) as f:
        return json.load(f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['build', 'show'])
    ap.add_argument('--out', default=str(TABLE_PATH))
    ap.add_argument('--root', default='/tmp/dialtable')
    a = ap.parse_args()

    if a.cmd == 'show':
        t = load_table(a.out)
        if not t:
            print('no table at', a.out)
            return
        kinds = {}
        for d, info in t['dials'].items():
            for k, v in info.get('moves', {}).items():
                kinds.setdefault(k, []).append((v, d))
        for k in sorted(kinds):
            rows = sorted(kinds[k], reverse=True)[:5]
            print(f'{k:18s} ' + ', '.join(f'{d} {v:.2f}mm' for v, d in rows))
        return

    root = Path(a.root)
    root.mkdir(parents=True, exist_ok=True)
    body_file = atlas.body_yaml(root / 'body.yaml')
    tree = atlas.load_tree()
    dial_list = vocablib.dial_paths(tree)
    print(f'{len(dial_list)} dials, two readings each, on one garment that '
          f'carries every seam kind', flush=True)
    table = build(root, body_file, tree, dial_list)
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, 'w') as f:
        json.dump(table, f, indent=1, sort_keys=True)
    moved = sum(1 for v in table['dials'].values() if v['moves'])
    print(f'\n{moved} of {len(table["dials"])} dials move at least one seam '
          f'kind by more than {NOTICE_MM}mm')
    print('written', out)


if __name__ == '__main__':
    main()
