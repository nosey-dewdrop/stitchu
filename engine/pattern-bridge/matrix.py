# ============================================================================
# matrix.py — DRIVE THE CROSS PRODUCT, CELL BY CELL.
#
# The gallery decides taste one word at a time. This drives every sentence the
# words can spell, sends each through GATE 0, and writes what came out.
#
# THE POINT OF THE MANIFEST. Every cell records WHICH WORDS IT IS MADE OF. So
# when a word is struck off the gallery in the morning, the catalogue is not
# regenerated, it is FILTERED, in seconds, by filter.py. The expensive thing
# (drawing and judging) happens once tonight; the cheap thing (choosing)
# happens as often as she likes.
#
# Combinations that spell nothing are not driven. A cuff on a sleeveless
# garment is not a different garment, it is the same one, so the axes that go
# inert are collapsed and the collapse is recorded rather than assumed. What is
# left is 22704 sentences, and every one that is not driven is COUNTED and
# reported. A cap that is not printed reads as coverage.
#
#   <gc>/.venv/bin/python matrix.py --out Logs/katalog-<date> --minutes 180
# ============================================================================
import argparse
import datetime
import json
import random
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from itertools import product
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import atlas                       # noqa: E402
import vocab as vocablib           # noqa: E402

REPO = atlas.REPO

# The axes, in the order a garment is described. Short keys go in the cell id.
AXIS_KEY = {
    'meta.upper': 'up',
    'meta.bottom': 'bo',
    'meta.wb': 'wb',
    'collar.f_collar': 'nk',
    'collar.component.style': 'cp',
    'sleeve.sleeveless': 'sl',
    'sleeve.armhole_shape': 'ah',
    'sleeve.cuff.type': 'cf',
}


def cell_id(words):
    return '|'.join(f'{AXIS_KEY[p]}={atlas.word_label(v)}'
                    for p, v in words.items())


def cell_slug(words):
    return cell_id(words).replace('|', '_').replace('=', '-')


# ---------------------------------------------------------------------------
# Which sentences are sentences.
#
# An axis goes INERT when the garment has nothing for it to act on. Driving an
# inert axis produces the same pattern under a different name, so it is
# collapsed to one reading and the collapse is stated. This is the only place
# the product is reduced, and it removes no garment, only duplicate names for
# the same garment.
# ---------------------------------------------------------------------------
def collapse(words):
    """Return the words with inert axes pinned, or None if it spells nothing."""
    w = dict(words)
    if w['meta.upper'] is None:
        # No top: neckline, collar piece, sleeve and cuff have nothing to sit
        # on. A bottom with no top and no waistband and no bottom is nothing.
        if w['meta.bottom'] is None:
            return None
        for path in ('collar.f_collar', 'collar.component.style',
                     'sleeve.armhole_shape', 'sleeve.cuff.type'):
            w[path] = atlas.PLAIN[path]
        w['sleeve.sleeveless'] = True
    if w['sleeve.sleeveless'] is True:
        w['sleeve.cuff.type'] = None       # no sleeve, no cuff
    return w


def all_cells(words_by_axis):
    """Every distinct sentence, deduplicated after collapsing inert axes."""
    paths = list(AXIS_KEY)
    seen, cells, spelled_nothing = set(), [], 0
    raw = 0
    for combo in product(*[words_by_axis[p] for p in paths]):
        raw += 1
        w = collapse(dict(zip(paths, combo)))
        if w is None:
            spelled_nothing += 1
            continue
        key = cell_id(w)
        if key in seen:
            continue
        seen.add(key)
        cells.append(w)
    return cells, raw, spelled_nothing


def design_for(words):
    d = atlas.plain_design()
    for path, value in words.items():
        atlas.set_v(d, path, value)
    # A cuff needs a sleeve long enough to carry one; same fixed reading the
    # gallery used, applied to every cuffed cell equally.
    if words.get('sleeve.cuff.type') is not None:
        atlas.set_v(d, 'sleeve.length', 0.8)
    return d


# ---------------------------------------------------------------------------
# one worker process: the generator subprocess, the seam walk, the verdict
# ---------------------------------------------------------------------------
_W = {}


def _init(root, body_file, tries):
    _W['root'] = Path(root)
    _W['body'] = body_file
    _W['tries'] = tries
    _W['tree'] = atlas.load_tree()
    _W['dials'] = vocablib.dial_paths(_W['tree'])


def _drive(words):
    cid = cell_id(words)
    slug = cell_slug(words)
    try:
        rec = vocablib.search_cell(cid, design_for(words), _W['root'],
                                   _W['body'], _W['tries'], _W['tree'],
                                   _W['dials'], slug)
    except Exception as e:                              # noqa: BLE001
        return {'cell': cid, 'slug': slug, 'ok': False,
                'words': {p: atlas.word_label(v) for p, v in words.items()},
                'why': f'driver error: {type(e).__name__}: {e}'}
    row = {
        'cell': cid,
        'slug': slug,
        'words': {p: atlas.word_label(v) for p, v in words.items()},
        'ok': rec['ok'],
        'try': rec['try'],
        'tries_allowed': rec['tries_allowed'],
        'why': rec.get('why'),
    }
    # A cell whose audit crashed was NOT judged, and it is not a failure.
    # Counted under its own name so the pass rate is over what was judged.
    last = (rec.get('attempts') or [{}])[-1]
    if 'NOT JUDGED' in (rec.get('why') or '') or 'crashed' in str(last):
        row['not_judged'] = True
    if rec['ok']:
        g = rec['gate']
        row.update({
            'dir': str(Path(rec['dir']).relative_to(_W['root'])),
            'pairs': g['pairs'], 'gathered': g['gathered'],
            'worst_seam_mm': g['max_diff_mm'],
            'worst_off_mm': g['worst_off_mm'],
            'notches': g['notches'],
            'notch_worst_mm': g['notch_worst_mm'],
        })
    return row


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=None)
    ap.add_argument('--sozluk', default=None,
                    help='sozluk.json from vocab.py; words that could not be '
                         'drawn at all are still driven, and their cells are '
                         'reported apart')
    ap.add_argument('--tries', type=int, default=4)
    ap.add_argument('--jobs', type=int, default=6)
    ap.add_argument('--minutes', type=float, default=0,
                    help='wall clock budget; cells not reached are COUNTED '
                         'and named in the manifest, never silently dropped')
    ap.add_argument('--limit', type=int, default=0)
    args = ap.parse_args()

    date_str = datetime.date.today().isoformat()
    root = Path(args.out or (REPO / 'Logs' / f'katalog-{date_str}')).resolve()
    root.mkdir(parents=True, exist_ok=True)
    body_file = atlas.body_yaml(root / 'body-EU38.yaml')

    tree = atlas.load_tree()
    dials = vocablib.dial_paths(tree)
    words_by_axis = {}
    for w in atlas.vocabulary():
        words_by_axis.setdefault(w.axis_path, []).append(w.value)

    cells, raw, nothing = all_cells(words_by_axis)
    # Driven in a deterministic shuffled order, so that if the clock runs out
    # the part that was driven is spread over the whole product instead of
    # being the first axis exhausted.
    random.Random(20260804).shuffle(cells)
    if args.limit:
        cells = cells[:args.limit]

    print(f'{raw} raw combinations, {nothing} spell nothing, '
          f'{len(cells)} distinct sentences after collapsing inert axes')
    print(f'{args.tries} readings per cell, {args.jobs} workers, '
          f'budget {args.minutes or "none"} min\n')

    manifest = root / 'cells.jsonl'
    already = set()
    if manifest.exists():
        for line in manifest.read_text().splitlines():
            if line.strip():
                already.add(json.loads(line)['cell'])
        cells = [w for w in cells if cell_id(w) not in already]
        print(f'{len(already)} cells already in the manifest, '
              f'{len(cells)} left to drive')
    fh = manifest.open('a')
    t0 = time.time()
    done = passed = 0
    stopped = False

    # Processes, not threads. The seam walk is pure Python and holds the GIL,
    # so six threads measured 18 cells a minute against six processes at more
    # than three times that; the generator subprocess was never the wall.
    with ProcessPoolExecutor(max_workers=args.jobs, initializer=_init,
                             initargs=(str(root), str(body_file),
                                       args.tries)) as pool:
        for row in pool.map(_drive, cells, chunksize=1):
            if row is None:
                continue
            fh.write(json.dumps(row) + '\n')
            fh.flush()
            done += 1
            passed += 1 if row['ok'] else 0
            if done % 25 == 0 or done < 5:
                rate = done / max(1e-9, time.time() - t0)
                print(f'  {done:6d}/{len(cells)}  pass {passed:6d}  '
                      f'{rate * 60:6.1f} cells/min  {row["cell"][:64]}')
            if args.minutes and (time.time() - t0) > args.minutes * 60:
                stopped = True
                print('\nclock budget reached; the cells not driven are '
                      'counted below and stay in the product')
                break
        if stopped:
            for p in pool._processes.values():
                p.terminate()

    driven = done + len(already)
    passed += sum(1 for line in manifest.read_text().splitlines()
                  if line.strip() and json.loads(line)['ok']) - passed
    total = len(cells) + len(already)
    summary = {
        'date': date_str,
        'size': atlas.SIZE_LABEL,
        'raw_combinations': raw,
        'spelled_nothing': nothing,
        'distinct_sentences': total,
        'driven': driven,
        'not_reached': total - driven,
        'passed_gate0': passed,
        'not_judged': sum(1 for line in manifest.read_text().splitlines()
                          if line.strip() and json.loads(line).get('not_judged')),
        'tries_per_cell': args.tries,
        'stopped_on_clock': stopped,
        'minutes': round((time.time() - t0) / 60, 2),
    }
    (root / 'matrix-summary.json').write_text(json.dumps(summary, indent=2))
    fh.close()
    print('\n' + '=' * 78)
    for k, v in summary.items():
        print(f'  {k:22} {v}')
    print('=' * 78)
    print(f'\nmanifest {manifest}')


if __name__ == '__main__':
    main()
