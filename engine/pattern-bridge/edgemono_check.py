"""edgemono_check.py — the verdict on edge monotonicity, over every size.

Measurement lives in edgemono.py. This file only decides, and the two are kept
apart so a threshold cannot be widened inside the code that produces the
number it is compared against.

TWO GATES, and where each number comes from:

  backtrack > 0.01mm   FAIL. Zero is the real requirement — a cut line that
                       retreats along its own chord is a line a cutter cannot
                       follow. 0.01mm is not a tolerance on the pattern, it is
                       the same float-noise floor panelcheck already uses for
                       contour closure (TOL_CLOSURE_MM), borrowed rather than
                       invented so there is one noise floor in the codebase.

  reverse >= 90deg     FAIL. This is a definition, not a fitted number: at
                       exactly 90 degrees the tangent has no forward component
                       along the chord, past it the cut line is travelling
                       backwards, at 180 it is a cusp. There is nothing to
                       tune here.

Usage:  edgemono_check.py <spec.json> [<spec.json> ...]
Prints one line per specification and a census, exits 1 on any violation.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import edgemono                                             # noqa: E402
import panelcheck                                           # noqa: E402
from walk import edge_curve                                 # noqa: E402

BACKTRACK_FLOOR_MM = panelcheck.TOL_CLOSURE_MM   # 0.01, the shared noise floor
REVERSE_LIMIT_DEG = 90.0                         # definitional, not tuned


def check_spec(path):
    spec = json.load(open(path))
    panels = spec['pattern']['panels']
    rows = []
    for name, panel in panels.items():
        rows += edgemono.measure_panel(name, panel, edge_curve)

    violations = []
    unjudged = []
    for r in rows:
        if r['backtrack_mm'] is None:
            unjudged.append(r)
            continue
        if r['backtrack_mm'] > BACKTRACK_FLOOR_MM:
            violations.append(('backtrack', r))
        if r['reverse_deg'] >= REVERSE_LIMIT_DEG:
            violations.append(('reverse', r))

    judged = [r for r in rows if r['backtrack_mm'] is not None]
    return {
        'spec': path,
        'panels': len(panels),
        'edges': len(rows),
        'judged': len(judged),
        'unjudged': unjudged,
        'max_backtrack_mm': max((r['backtrack_mm'] for r in judged), default=0.0),
        'max_reverse_deg': max((r['reverse_deg'] for r in judged), default=0.0),
        'violations': violations,
    }


def main(argv):
    if len(argv) < 2:
        print('usage: edgemono_check.py <spec.json> [...]', file=sys.stderr)
        return 2

    tot_panels = tot_edges = tot_judged = tot_unjudged = tot_viol = 0
    worst_back = worst_rev = 0.0

    for path in argv[1:]:
        r = check_spec(path)
        tot_panels += r['panels']
        tot_edges += r['edges']
        tot_judged += r['judged']
        tot_unjudged += len(r['unjudged'])
        tot_viol += len(r['violations'])
        worst_back = max(worst_back, r['max_backtrack_mm'])
        worst_rev = max(worst_rev, r['max_reverse_deg'])

        tag = os.path.basename(path)
        print(f"  {tag:28s} panels {r['panels']:3d}  edges {r['edges']:5d}  "
              f"max backtrack {r['max_backtrack_mm']:.6f}mm  "
              f"max reverse {r['max_reverse_deg']:7.3f}deg  "
              f"violations {len(r['violations'])}")
        for kind, v in r['violations']:
            print(f"      FAIL {kind}: panel {v['panel']} edge {v['edge']} "
                  f"len {v['length_mm']}mm backtrack {v['backtrack_mm']}mm "
                  f"reverse {v['reverse_deg']}deg")
        for v in r['unjudged']:
            print(f"      UNJUDGED: panel {v['panel']} edge {v['edge']} "
                  f"has no chord (start == end)")

    print(f"CENSUS  specifications {len(argv) - 1}  panels {tot_panels}  "
          f"edges {tot_edges}  judged {tot_judged}  unjudged {tot_unjudged}  "
          f"violations {tot_viol}")
    print(f"WORST   backtrack {worst_back:.6f}mm (gate >{BACKTRACK_FLOOR_MM}mm)  "
          f"reverse {worst_rev:.3f}deg (gate >={REVERSE_LIMIT_DEG}deg)")

    # An edge that could not be judged is not an edge that passed.
    if tot_viol or tot_unjudged:
        print('EDGE MONOTONICITY: FAIL')
        return 1

    # TUR 11 (17 Agu) — NOTHING TO ENFORCE IS NOT A PASS. Every number above
    # is a max() with default 0.0 and a counter that starts at 0, so a
    # specification with no panels scored a perfect run: measured, a spec with
    # `panels: {}` printed "edges 0 ... violations 0 / EDGE MONOTONICITY: PASS"
    # and exited 0. That is the T17 style_check class (a gate looking at a
    # directory that does not exist and reporting "PASS, nothing to enforce").
    # Census, not threshold: the floor is one judged edge, and it is not tuned.
    if tot_edges == 0 or tot_judged == 0:
        print(f'EDGE MONOTONICITY: FAIL — hiç kenar yargılanmadı '
              f'(edges {tot_edges}, judged {tot_judged}); '
              f'yargılanacak şey olmaması bir GEÇME değildir')
        return 1
    print('EDGE MONOTONICITY: PASS')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
