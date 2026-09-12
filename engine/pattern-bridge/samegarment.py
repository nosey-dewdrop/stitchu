# ============================================================================
# samegarment.py — is the piece drawn from ingredients the same piece?
#
# Gate A (walk.py) asks whether a pattern is sewable. It cannot tell a fitted
# dress from a sack: a sack whose seams match passes every rule in the file.
# So the second gate is the one that says WHICH garment came out, and it is
# answered against a piece that already exists rather than against a drawing.
#
# The measure is cutplan.shape_distance_cm, the same one that decides whether
# a left and a right panel are one piece cut twice. It lands one outline on the
# other as well as it can — both traversal directions, the phase searched
# continuously — and reports the worst point-to-point gap left over. Zero is
# not the target and would be suspicious: two of the numbers below are
# deliberate changes and they have to show up here, or this gate is not
# measuring anything.
# ============================================================================
import argparse
import json
import sys

import cutplan
import walk


def loops(spec):
    panels = spec['pattern']['panels']
    return {n: cutplan.Loop([walk.edge_curve(p['vertices'], e)
                             for e in p['edges']])
            for n, p in panels.items()}


def compare(a_path, b_path):
    a = loops(json.load(open(a_path)))
    b = loops(json.load(open(b_path)))
    rows = []
    for name in sorted(set(a) & set(b)):
        d = cutplan.shape_distance_cm(a[name], b[name], reflect_a=False)
        dm = cutplan.shape_distance_cm(a[name], b[name], reflect_a=True)
        rows.append({'panel': name,
                     'worst_mm': round(min(d, dm) * 10, 4),
                     'reflected': dm < d,
                     'perimeter_mm': round(a[name].total * 10, 2),
                     'ref_perimeter_mm': round(b[name].total * 10, 2)})
    return rows, sorted(set(a) ^ set(b))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('mine')
    ap.add_argument('reference')
    args = ap.parse_args()
    rows, missing = compare(args.mine, args.reference)
    print(f"{'panel':<16}{'worst mm':>10}{'perimeter mm':>15}{'reference':>12}"
          f"{'delta':>9}")
    print('-' * 62)
    for r in rows:
        print(f"{r['panel']:<16}{r['worst_mm']:>10.4f}"
              f"{r['perimeter_mm']:>15.2f}{r['ref_perimeter_mm']:>12.2f}"
              f"{r['perimeter_mm'] - r['ref_perimeter_mm']:>9.2f}")
    if missing:
        print('panels on one side only:', missing)
    # T12/TUR 12. `sys.exit(main())` at the bottom of this file LOOKED armed
    # and was not: main() returned None, so this compared two garments and
    # exited 0 no matter what came out — including when the two specs shared
    # NOT ONE panel, where the max() below raises and the "verdict" is a
    # traceback.
    #
    # What is NOT armed here, deliberately: the millimetre. The header of
    # this file says zero is not the target and would be suspicious — two of
    # the numbers are intentional changes and must show up. Putting a pass
    # threshold on worst_mm would be inventing a number, which is the one
    # thing forbidden. The mm stays a measurement.
    #
    # What IS armed: the cases where there is no comparison at all. A panel
    # present on one side only is not a tolerance question — that piece is
    # not in the other garment. Same for zero panels in common: an
    # instrument that judged nothing did not return a green.
    faults = []
    if not rows:
        faults.append('the two specifications share NO panel — '
                      'nothing was compared')
    if missing:
        faults.append(f'{len(missing)} panels exist on ONE side only: '
                      + ', '.join(missing))
    if faults:
        print('SAMEGARMENT HÜKÜM: KIRMIZI — ' + '; '.join(faults),
              file=sys.stderr)
        return 1
    print(f"worst panel: {max(rows, key=lambda r: r['worst_mm'])['panel']} "
          f"{max(r['worst_mm'] for r in rows):.4f}mm")
    print(f'SAMEGARMENT: {len(rows)} panels compared, 0 unmatched '
          '(the mm above is a MEASUREMENT, not a gate — see header)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
