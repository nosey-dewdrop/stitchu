# ============================================================================
# test_seamdeed.py — the rule layer, pinned.
#
# Every test here is a case the flat |a - b| <= 1mm rule got WRONG. If any of
# them goes green by accident the rule layer has been reverted, so each one
# states what the old behaviour was.
#
# Run with the GarmentCode venv python (svgpathtools + yaml live there):
#   core/third_party/garmentcode/.venv/bin/python engine/pattern-bridge/test_seamdeed.py
# ============================================================================
import json
import math
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import panelcheck            # noqa: E402
import seamrules             # noqa: E402
import walk                  # noqa: E402

REPO = HERE.parent.parent
GRADESET = REPO / 'Logs' / 'gradeset-2026-08-01'
SIZES = ['EU34', 'EU36', 'EU38', 'EU40', 'EU42', 'EU44', 'EU46', 'EU48']

_results = []


def check(name, cond, detail=''):
    _results.append((name, bool(cond), detail))


def close(a, b, eps=1e-6):
    return abs(a - b) < eps


# ---------------------------------------------------------------------------
# 1. Shoulder: direction is the check, not the size.
# ---------------------------------------------------------------------------
# OLD BEHAVIOUR: abs(front - back) <= 1mm, so a shoulder with the extra length
# on the FRONT passed whenever it was small. The extra length exists for the
# shoulder blade and the blade is at the back, so this is a reversed shoulder
# at any magnitude.
status, d = seamrules.judge_shoulder(front_len=87.42, back_len=87.12)
check('reversed shoulder fails even at 0.30mm',
      status == seamrules.FAIL,
      f'got {status}, excess {d["back_excess_mm"]}mm (old rule: PASS)')

# OLD BEHAVIOUR: 1.22mm > 1mm, so a correctly drafted shoulder FAILED.
status, d = seamrules.judge_shoulder(front_len=87.12, back_len=88.35)
check('correct shoulder passes at 1.22mm back excess',
      status == seamrules.PASS,
      f'got {status} (old rule: FAIL)')

status, _ = seamrules.judge_shoulder(front_len=87.12, back_len=87.12 + 12.5)
check('blade ease beyond 12mm fails', status == seamrules.FAIL, f'got {status}')

status, _ = seamrules.judge_shoulder(front_len=87.12, back_len=87.12 + 6.0)
check('blade ease inside the standard 6-12mm band passes',
      status == seamrules.PASS, f'got {status}')

# ---------------------------------------------------------------------------
# 2. Equality tolerance is the production standard, not 1mm.
# ---------------------------------------------------------------------------
check('equality tolerance is 1/32 inch',
      close(seamrules.TOL_EQUAL_MM, 25.4 / 32.0),
      f'{seamrules.TOL_EQUAL_MM} vs {25.4 / 32.0}')

status, _ = seamrules.judge_equal(100.0, 100.9)
check('a 0.90mm equality seam fails at the production standard',
      status == seamrules.FAIL, f'got {status} (old rule: PASS at <=1mm)')

status, _ = seamrules.judge_equal(100.0, 100.7)
check('a 0.70mm equality seam passes', status == seamrules.PASS, f'got {status}')

# ---------------------------------------------------------------------------
# 3. Cap ease is reported, not gated, because the field holds two positions.
# ---------------------------------------------------------------------------
status, d = seamrules.judge_cap_ease(cap_total_mm=516.28, armhole_total_mm=516.10)
check('a zero-ease cap is reported, not failed',
      status == seamrules.REPORTED and 'Fasanella' in d['school'],
      f'got {status} / {d["school"]}')

status, d = seamrules.judge_cap_ease(cap_total_mm=540.0, armhole_total_mm=516.10)
check('a 24mm cap ease is named as dress/blouse',
      d['school'] == 'dress/blouse', d['school'])

status, _ = seamrules.judge_cap_ease(cap_total_mm=620.0, armhole_total_mm=516.10)
check('a 104mm cap ease fails as a suspect draft',
      status == seamrules.FAIL, f'got {status}')

# ---------------------------------------------------------------------------
# 4. An unidentified seam is never a passing seam.
# ---------------------------------------------------------------------------
mystery_a = {'label': None, 'translation': [0, 0, 0], 'rotation': [0, 0, 0],
             'vertices': [[0, 0], [10, 0]], 'edges': [{'endpoints': [0, 1]}]}
mystery_b = {'label': None, 'translation': [0, 0, 0], 'rotation': [0, 0, 0],
             'vertices': [[0, 0], [10, 0]], 'edges': [{'endpoints': [0, 1]}]}
kind, why = seamrules.classify('mystery_one', mystery_a, mystery_a['edges'][0],
                               'mystery_two', mystery_b, mystery_b['edges'][0])
check('an unrecognised pair is classified unknown', kind == 'unknown', why)

status, _ = walk._judge_pair('unknown', {}, {}, {'panel': 'mystery_one'},
                             {'panel': 'mystery_two'}, 10.0, 10.0, {})
check('an unknown pair is UNVERIFIABLE, not PASS',
      status == seamrules.UNVERIFIABLE,
      f'got {status} (old rule: PASS, it was measured by the equality test)')

# ---------------------------------------------------------------------------
# 5. Height derivation refuses rather than guesses.
# ---------------------------------------------------------------------------
tilted = {'translation': [0, 100, 0], 'rotation': [30, 0, 0],
          'vertices': [[0, 0], [10, 10]], 'edges': [{'endpoints': [0, 1]}]}
check('a panel rotated about X yields no height rather than a wrong one',
      seamrules.edge_midpoint_world_height(tilted, tilted['edges'][0]) is None)

flat = {'translation': [0, 100, 0], 'rotation': [0, 0, 0],
        'vertices': [[0, 0], [10, 10]], 'edges': [{'endpoints': [0, 1]}]}
check('a flat panel yields translation + local height',
      close(seamrules.edge_midpoint_world_height(flat, flat['edges'][0]), 105.0))

# ---------------------------------------------------------------------------
# 6. Mirror alignment: a mirror reverses the edge loop.
# ---------------------------------------------------------------------------
# This is the bug the first version of the mirror audit had: comparing edge i
# to edge i reported every mirrored panel as a 226mm fault.
lens = [287.283, 141.554, 88.347, 255.134, 6.975, 142.847, 55.67,
        115.507, 115.507, 40.5, 128.34, 128.34, 60.75]
worst, reverse, shift, _ = panelcheck._best_alignment(lens, list(reversed(lens)))
check('a reversed edge loop is recognised as reversed, at zero difference',
      close(worst, 0.0, 1e-9) and reverse is True and shift == 0,
      f'worst {worst}, reversed={reverse}, shift={shift}')

# Rolling the loop forward by 3 means the alignment has to roll back by 3,
# which on a 13 edge loop is a shift of 10.
worst, reverse, shift, _ = panelcheck._best_alignment(lens, lens[3:] + lens[:3])
check('a rotated edge loop is recognised, at zero difference',
      close(worst, 0.0, 1e-9) and reverse is False and shift == 10,
      f'worst {worst}, reversed={reverse}, shift={shift}')

# The same outline written with a different edge count is NOT a fault. Taken
# from a shipped reference pattern, where one copy carries 14.786 and 81.653
# where the other carries 96.440, and the perimeters agree to 0.000mm.
split_a = [96.440, 200.0, 50.0]
split_b = [14.786, 81.653, 200.0, 50.0]
check('an outline split into more edges still lines up',
      panelcheck._merge_alignment(split_a, split_b,
                                  panelcheck.TOL_MIRROR_MM) is not None,
      'this false positive fired on every shipped reference pattern')

check('a genuinely different outline does not line up',
      panelcheck._merge_alignment([96.44, 200.0, 50.0],
                                  [14.786, 81.653, 200.0, 61.0],
                                  panelcheck.TOL_MIRROR_MM) is None)

# A genuinely different panel must NOT be aligned into a false match.
bent = list(lens)
bent[4] += 9.0
worst, _, _, _ = panelcheck._best_alignment(lens, list(reversed(bent)))
check('a panel that really differs is not aligned away',
      close(worst, 9.0, 1e-9), f'worst {worst}')

# ---------------------------------------------------------------------------
# 7. Contour and self-intersection, on shapes built to break.
# ---------------------------------------------------------------------------
broken = {'vertices': [[0, 0], [10, 0], [10, 10], [0, 10]],
          'edges': [{'endpoints': [0, 1]}, {'endpoints': [1, 2]},
                    {'endpoints': [2, 3]}, {'endpoints': [0, 3]}]}
r = panelcheck.check_closed('broken', broken, walk.edge_curve)
check('a chain break is caught', r['status'] == 'FAIL' and
      any(p['kind'] == 'chain-break' for p in r['problems']), str(r['problems']))

square = {'vertices': [[0, 0], [10, 0], [10, 10], [0, 10]],
          'edges': [{'endpoints': [0, 1]}, {'endpoints': [1, 2]},
                    {'endpoints': [2, 3]}, {'endpoints': [3, 0]}]}
check('a clean square closes',
      panelcheck.check_closed('square', square, walk.edge_curve)['status'] == 'PASS')
check('a clean square does not self-intersect',
      panelcheck.check_self_intersection('square', square,
                                         walk.edge_curve)['status'] == 'PASS')

bowtie = {'vertices': [[0, 0], [10, 10], [10, 0], [0, 10]],
          'edges': [{'endpoints': [0, 1]}, {'endpoints': [1, 2]},
                    {'endpoints': [2, 3]}, {'endpoints': [3, 0]}]}
r = panelcheck.check_self_intersection('bowtie', bowtie, walk.edge_curve)
check('a self-crossing outline is caught', r['status'] == 'FAIL', str(r['hits']))

# ---------------------------------------------------------------------------
# 8. The real pattern: the graded mirror fault.
# ---------------------------------------------------------------------------
if not GRADESET.exists():
    check('gradeset present', False, f'{GRADESET} missing; size-run tests skipped')
else:
    spreads, maxdiffs, reports = [], [], {}
    for size in SIZES:
        spec = GRADESET / size / 'stitchu_specification.json'
        if not spec.exists():
            continue
        rep = walk.walk(spec)
        reports[size] = rep
        faults = [m for m in rep['mirror_seams'] if m['status'] == 'FAIL']
        spreads.append((size, max((m['spread_mm'] for m in faults), default=0.0)))
        maxdiffs.append((size, rep['summary']['max_diff_mm']))

    check('every size in the run was walked', len(reports) == 8, str(list(reports)))

    check('every seam in every size was identified',
          all(r['summary']['by_kind'].get('unknown', 0) == 0
              for r in reports.values()),
          str({k: v['summary']['by_kind'].get('unknown', 0)
               for k, v in reports.items()}))

    check('no panel is open or self-intersecting in any size',
          all(r['summary']['panels_not_closed'] == 0 and
              r['summary']['panels_self_intersecting'] == 0
              for r in reports.values()))

    check('every panel is its own mirror in every size',
          all(r['summary']['mirror_panel_faults'] == 0 for r in reports.values()),
          'panels are symmetric; the fault is in the panel that spans both sides')

    check('the mirror fault is present in every size',
          all(s > 0 for _, s in spreads), str(spreads))

    growing = all(spreads[i][1] < spreads[i + 1][1]
                  for i in range(len(spreads) - 1))
    check('the mirror fault grows monotonically with size', growing, str(spreads))

    steps = [round(spreads[i + 1][1] - spreads[i][1], 4)
             for i in range(len(spreads) - 1)]
    check('the growth per size is a constant step, so it is graded not noise',
          max(steps) - min(steps) < 0.005, f'steps {steps}')

    # The point of the whole exercise: at the tolerance the nearest open source
    # validator ships with, this pattern is clean at every size.
    worst_pair = max(m for _, m in maxdiffs)
    check('at a 3mm tolerance every size reports a clean pattern',
          worst_pair < 3.0,
          f'worst single pair across the run is {worst_pair}mm')

    check('at the production standard the fault is visible',
          any(r['summary']['by_status'].get('FAIL', 0) > 0
              for r in reports.values()))

    # And the fault is invisible pair by pair, because one half of each
    # mirrored pair sits inside tolerance.
    eu36 = reports.get('EU36')
    if eu36:
        faults = [m for m in eu36['mirror_seams'] if m['status'] == 'FAIL']
        halves_passing = sum(
            1 for m in faults
            if min(abs(m['diff_mm']), abs(m['mirror_diff_mm']))
            <= seamrules.TOL_EQUAL_MM)
        check('one half of each mirrored fault passes on its own',
              halves_passing == len(faults) and len(faults) == 2,
              f'{halves_passing} of {len(faults)} faults have a passing half')


# ---------------------------------------------------------------------------
# 8. A STRAPLESS GARMENT HAS NO SHOULDER SEAM. 2026-08-17, ring T11.
#
# The side seam of the sheath was being called a shoulder and judged by the
# shoulder's directional rule, which reported "reversed: the FRONT shoulder is
# the longer one" on a garment with no shoulder at all. The reference height
# was a maximum over front-to-back torso seams, and a maximum always exists.
# Below: a strapless tube, panels left at the origin the way surface-pattern
# writes them, one front-to-back seam per side running into the waistline.
# ---------------------------------------------------------------------------
def _tube_panel(label, verts):
    # edge 0 is the waist, edge 1 the front-to-back seam; the contour closes,
    # so the two share a vertex and the seam runs into the waistline
    return {'label': label, 'translation': [0, 0, 0], 'rotation': [0, 0, 0],
            'vertices': verts,
            'edges': [{'endpoints': [0, 1]}, {'endpoints': [1, 2]},
                      {'endpoints': [2, 0]}]}


tube = {
    'right_ftorso': _tube_panel('body', [[0, 0], [20, 0], [20, 18]]),
    'left_btorso': _tube_panel('body', [[0, 0], [20, 0], [20, 18]]),
    'right_skirt_front': _tube_panel('leg', [[0, 0], [20, 0], [20, 40]]),
    'left_skirt_back': _tube_panel('leg', [[0, 0], [20, 0], [20, 40]]),
}
tube_stitches = [
    [{'panel': 'right_ftorso', 'edge': 0},
     {'panel': 'right_skirt_front', 'edge': 0}],          # waist, front
    [{'panel': 'left_btorso', 'edge': 0},
     {'panel': 'left_skirt_back', 'edge': 0}],            # waist, back
    [{'panel': 'right_ftorso', 'edge': 1},
     {'panel': 'left_btorso', 'edge': 1}],                # the side seam
]
side = seamrules.side_seam_edges(tube, tube_stitches)
check('a front-to-back seam running into the waistline is proven a side seam',
      ('right_ftorso', 1) in side and ('left_btorso', 1) in side,
      f'proven: {sorted(side)}')

check('a strapless garment reports no shoulder reference height',
      seamrules.shoulder_reference_height(tube, tube_stitches,
                                          side_seams=side) is None,
      'the tallest side seam was promoted into a shoulder')

kind, why = seamrules.classify(
    'right_ftorso', tube['right_ftorso'], tube['right_ftorso']['edges'][1],
    'left_btorso', tube['left_btorso'], tube['left_btorso']['edges'][1],
    shoulder_height_cm=None, known_side_seam=True)
check('the strapless side seam is a side seam, not a shoulder',
      kind == 'side-seam', f'got {kind}: {why}')

# and the height heuristic still runs where nothing is proven, so a garment
# that really has a shoulder keeps its directional check
check('with no contour proof the shoulder reference is still derived',
      seamrules.shoulder_reference_height(tube, tube_stitches) is not None,
      'the height heuristic was removed rather than deferred')


# ---------------------------------------------------------------------------
print('SEAM DEED RULE LAYER')
print('-' * 78)
failed = 0
for name, ok, detail in _results:
    mark = 'ok  ' if ok else 'FAIL'
    if not ok:
        failed += 1
    print(f'{mark}  {name}' + (f'\n        {detail}' if not ok and detail else ''))
print('-' * 78)
print(f'{len(_results) - failed} passed, {failed} failed, {len(_results)} total')
sys.exit(1 if failed else 0)
