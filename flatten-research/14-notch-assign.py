#!/usr/bin/env python3
# 14 — WHICH NOTCH ON THE SLEEVE IS WHICH NOTCH ON THE ARMHOLE, SOLVED.
#
# 12 hardcoded the answer: CAP_NOTCHES = [127, 412, 446], picked by pen colour
# because those three are drawn in the size 38 pen. That choice left the walk
# with two errors that cancelled each other, +41.4mm at the back underarm and
# -46.3mm over the crown, and the file recorded it as unproven.
#
# It was wrong, and pen colour is why. A notch is a notch whatever pen drew
# it: the underarm mark sits at the same place for neighbouring sizes, so it
# is drawn once, in one size's colour, and a filter on colour throws it away.
# Here every small mark on the ring is a candidate and the assignment is
# SOLVED against the armhole rather than assumed.
#
# RESULT (this file, on the bought couture pattern):
#   back underarm notch  arc 87   residual -1.1mm   (optimum sits at arc 88,
#                                 residual +0.02mm, and the ring is resampled
#                                 at 1mm, so the drawn notch is on the optimum)
#   front underarm notch arc 446  residual -0.1mm
#   crown                         residual -3.8mm
#   total residual 4.9mm, against 87.7mm for the colour-filtered answer
#
# The two notches left over, arc 127 and arc 412, have no counterpart on the
# armhole. They are the alignment marks for the gathered outer sleeve, which
# is what 12 guessed about arc 127 and got right for the wrong notch.
#
# What this closes: the claim from 07, that the underarm to notch zones carry
# no ease and match the armhole exactly, is now confirmed on BOTH sides of a
# pattern we did not draw. -0.1mm at the front and -1.1mm at the back.
import json
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

# Reuse 12's proven geometry: resample, signed area, seam-line offset and the
# zone length measured ON THE SEAM LINE rather than the cut line.
_src = (HERE / '12-notch-zone-walk.py').read_text()
exec(_src.split('print("="*88)')[0])          # noqa: S102  (shared geometry)

S, F, B = Q['Lower Sleeve'], Q['Front Body'], Q['Back Body']

# Armhole zones, from the landmark corners proven in 09.
ARM = {
    'front_underarm': zone_stitch_len(F, FRONT_UNDERARM, FRONT_NOTCH),
    'front_crown': zone_stitch_len(F, FRONT_NOTCH, FRONT_SHOULDER),
    'back_crown': zone_stitch_len(B, BACK_SHOULDER, BACK_NOTCH),
    'back_underarm': zone_stitch_len(B, BACK_NOTCH, BACK_UNDERARM),
}
ARM['crown'] = ARM['front_crown'] + ARM['back_crown']
ARM['total'] = ARM['crown'] + ARM['front_underarm'] + ARM['back_underarm']

# Every small mark found on the Lower Sleeve ring by 11, WITHOUT the colour
# filter. arc 87 is drawn in a neighbouring size's pen and 12 discarded it.
CAP_CANDIDATES = [87, 127, 412, 446, 456]


def solve(candidates, orientation):
    """Pick the two notches that split the cap into the armhole's three zones.

    orientation says which end of the cap meets the back of the armhole. Both
    are tried, because a sleeve can be walked either way round and the pattern
    is the referee, not us.
    """
    if orientation == 'back-first':
        near, far = 'back_underarm', 'front_underarm'
    else:
        near, far = 'front_underarm', 'back_underarm'

    best = None
    for i, n_near in enumerate(candidates):
        for n_far in candidates[i + 1:]:
            z_near = zone_stitch_len(S, CAP_A, n_near)
            z_crown = zone_stitch_len(S, n_near, n_far)
            z_far = zone_stitch_len(S, n_far, CAP_B)
            r = (abs(z_near - ARM[near]) + abs(z_crown - ARM['crown']) +
                 abs(z_far - ARM[far]))
            row = {
                'orientation': orientation,
                'notches': (n_near, n_far),
                'zones': (z_near, z_crown, z_far),
                'residuals': (z_near - ARM[near], z_crown - ARM['crown'],
                              z_far - ARM[far]),
                'total_residual': r,
                'unused': [c for c in candidates if c not in (n_near, n_far)],
            }
            if best is None or r < best['total_residual']:
                best = row
    return best


def main():
    print('=' * 88)
    print('NOTCH ASSIGNMENT — solved against the armhole, not read off pen colour')
    print('=' * 88)
    print(f"ARMHOLE   back underarm {ARM['back_underarm']:6.1f}   "
          f"crown {ARM['crown']:6.1f}   front underarm {ARM['front_underarm']:6.1f}"
          f"   total {ARM['total']:6.1f} mm")
    print(f"CAP       total {zone_stitch_len(S, CAP_A, CAP_B):6.1f} mm   "
          f"candidates {CAP_CANDIDATES}")
    print()

    solutions = [solve(CAP_CANDIDATES, o)
                 for o in ('back-first', 'front-first')]
    best = min(solutions, key=lambda s: s['total_residual'])

    for s in sorted(solutions, key=lambda s: s['total_residual']):
        mark = '  <== CHOSEN' if s is best else ''
        rn, rc, rf = s['residuals']
        print(f"  {s['orientation']:<12} notches {str(s['notches']):<12} "
              f"residuals {rn:+6.1f} / {rc:+6.1f} / {rf:+6.1f}  "
              f"total {s['total_residual']:6.1f} mm{mark}")
    print()

    # The answer 12 shipped, for scale.
    old = None
    for o in ('back-first', 'front-first'):
        cand = solve([127, 412, 446], o)
        if old is None or cand['total_residual'] < old['total_residual']:
            old = cand
    print(f"  colour-filtered answer  notches {old['notches']}  "
          f"total residual {old['total_residual']:.1f} mm")
    print(f"  solved answer           notches {best['notches']}  "
          f"total residual {best['total_residual']:.1f} mm")
    print(f"  improvement             {old['total_residual'] / best['total_residual']:.1f}x")
    print()
    print(f"  notches with no counterpart on the armhole: {best['unused']}")
    print('  those are the alignment marks for the gathered outer sleeve.')
    print()

    # Resolution check: the ring is resampled at 1mm, so a notch can only be
    # located to that precision. Where does the ideal split actually sit?
    n_near = best['notches'][0]
    near_key = ('back_underarm' if best['orientation'] == 'back-first'
                else 'front_underarm')
    scan = [(c, zone_stitch_len(S, CAP_A, c) - ARM[near_key])
            for c in range(n_near - 25, n_near + 25)]
    opt = min(scan, key=lambda r: abs(r[1]))
    print(f"  ideal split for the near zone sits at arc {opt[0]} "
          f"(residual {opt[1]:+.2f}mm); the drawn notch is at arc {n_near}, "
          f"{abs(opt[0] - n_near)}mm away, and the ring is sampled at {STEP:.0f}mm.")

    out = HERE / 'out-14-notch-assign.json'
    out.write_text(json.dumps({
        'armhole': {k: round(v, 3) for k, v in ARM.items()},
        'cap_total': round(zone_stitch_len(S, CAP_A, CAP_B), 3),
        'candidates': CAP_CANDIDATES,
        'chosen': {
            'orientation': best['orientation'],
            'notches': list(best['notches']),
            'zones': [round(z, 3) for z in best['zones']],
            'residuals': [round(r, 3) for r in best['residuals']],
            'total_residual_mm': round(best['total_residual'], 3),
            'gather_marks': best['unused'],
        },
        'colour_filtered_total_residual_mm': round(old['total_residual'], 3),
        'ideal_near_split_arc': opt[0],
        'resample_step_mm': STEP,
    }, indent=2))
    print(f'\nwrote {out}')


if __name__ == '__main__':
    main()
