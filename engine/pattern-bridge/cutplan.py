# ============================================================================
# cutplan.py — how many of this piece, and from what fold. MEASURED.
#
# The pattern page carries exactly one sentence written for a human: how many
# times to cut the piece. Until now the engine printed "cut 1" under every
# panel as a literal string, while the same run measured 22704 garments down
# to four decimal places. That line was the only claim on the sheet nobody
# had checked.
#
# It is checkable. A garment's left and right halves are equal BY
# CONSTRUCTION, not by tolerance, so a panel and its mirror are the same piece
# cut twice: one drawing, "cut 2 mirrored", one sheet of paper instead of two.
# The same reflection run against a panel's OWN outline answers the second
# question a bought pattern answers and this one did not, whether the piece is
# symmetric about its own centre line and can be cut on the fold.
#
# HOW THE DISTANCE IS TAKEN, and two wrong ways that had to be thrown out.
# Both wrong answers came from the measurement, not the cloth, and both looked
# like real sub-millimetre faults.
#
#   1. Nearest-neighbour between the two dense seam rings read 0.4902mm on the
#      back bodice. A KD-tree returns the nearest sampled POINT, the ring is
#      sampled at a 1mm step, and one extra vertex on the left panel puts its
#      samples half a step out of phase with the right. Half of 1mm is 0.49mm.
#   2. Resampling both outlines at equal arc length and searching only whole
#      sample shifts read 0.60mm on the skirt front. The true symmetry axis
#      does not land on a sample, and a discrete search cannot reach it.
#
# So: both loops are resampled at the same number of equal arc-length steps,
# which puts the samples in phase by construction; the traversal offset is
# then searched coarsely over whole steps AND refined as a CONTINUOUS phase,
# in both directions. Walked that way the flagship garment's two back bodices
# differ by 0.0000mm, which is what "equal by construction" has to mean.
#
# Distances are in spec units (cm) internally and reported in mm.
# ============================================================================
import math

import numpy as np

import seamrules

# A mirrored pair is equal by construction, so this is not a fit window: it is
# the arc-length table's own quantisation. It sits an order of magnitude under
# the 0.79375mm production standard.
TOL_CM = 0.01          # 0.1mm
TABLE_STEP_CM = 0.02   # 0.2mm between arc-length table entries
SAMPLES = 720          # points compared per outline
REFINE_STEPS = 40      # ternary-search iterations on the continuous phase


class Loop:
    """A panel outline as an arc-length table, sampleable at any phase.

    Built from the spec curves, not from the print-time seam ring: the table
    is what makes two panels cut into a different number of edges comparable
    at all.
    """

    def __init__(self, geo, step_cm=TABLE_STEP_CM):
        pts = []
        for seg in geo.segs:
            k = max(2, int(math.ceil(seg.length() / step_cm)))
            pts.extend(seg.point(i / k) for i in range(k))   # endpoint = next
        p = np.array([[q.real, q.imag] for q in pts], dtype=float)
        closed = np.vstack([p, p[:1]])
        d = np.linalg.norm(np.diff(closed, axis=0), axis=1)
        self.p = closed                                       # n+1 points
        self.s = np.concatenate([[0.0], np.cumsum(d)])        # n+1 arc lengths
        self.total = float(self.s[-1])

    def sample(self, n=SAMPLES, phase=0.0, reverse=False):
        t = (np.arange(n) * (self.total / n) + phase) % self.total
        if reverse:
            t = (self.total - t) % self.total
        return np.stack([np.interp(t, self.s, self.p[:, 0]),
                         np.interp(t, self.s, self.p[:, 1])], axis=1)


def _normalise(arr):
    """Shift a point set so its bounding box starts at the origin."""
    return arr - arr.min(axis=0)


def _reflect(arr):
    out = arr.copy()
    out[:, 0] = -out[:, 0]
    return _normalise(out)


def _worst(a, b):
    diff = a - b
    return float(np.sqrt(np.einsum('ij,ij->i', diff, diff)).max())


def shape_distance_cm(loop_a, loop_b, reflect_a, n=SAMPLES):
    """Worst point-to-point distance once a is landed on b as well as it can be.

    Which vertex each outline happens to start from, and which way round it is
    written, are bookkeeping. Only what is left after both are removed is
    geometry.
    """
    b = _normalise(loop_b.sample(n))
    step = loop_a.total / n
    best = math.inf

    for reverse in (False, True):
        a0 = loop_a.sample(n, 0.0, reverse)
        a0 = _reflect(a0) if reflect_a else _normalise(a0)
        coarse = min(range(n),
                     key=lambda k: _worst(np.roll(a0, k, axis=0), b))

        def at(phase):
            a = loop_a.sample(n, phase, reverse)
            a = _reflect(a) if reflect_a else _normalise(a)
            return _worst(a, b)

        # the coarse winner rolled a forward by k, which is the same shape as
        # starting it a step earlier, so the true phase is within one step
        lo, hi = -(coarse + 1) * step, -(coarse - 1) * step
        for _ in range(REFINE_STEPS):
            m1, m2 = lo + (hi - lo) / 3.0, hi - (hi - lo) / 3.0
            if at(m1) < at(m2):
                hi = m2
            else:
                lo = m1
        best = min(best, at(0.5 * (lo + hi)))

    return best


def mirror_distance_cm(geo_a, geo_b):
    return shape_distance_cm(Loop(geo_a), Loop(geo_b), reflect_a=True)


def self_symmetry_cm(geo):
    """Worst distance between a panel's outline and its own reflection.

    Small means the piece is symmetric about its own centre line: the drawing
    can be halved and the cloth cut on the fold.
    """
    loop = Loop(geo)
    arr = _normalise(loop.sample())
    axis = 0.5 * (arr[:, 0].min() + arr[:, 0].max())
    return shape_distance_cm(loop, loop, reflect_a=True), axis


def _invariants(loop):
    """Perimeter and bounding box: true whatever way round the loop is
    written, so they shortlist candidates before the expensive comparison."""
    p = loop.p[:-1]
    return (loop.total,
            float(p[:, 0].max() - p[:, 0].min()),
            float(p[:, 1].max() - p[:, 1].min()))


def _invariants_close(a, b):
    return all(abs(x - y) <= TOL_CM for x, y in zip(a, b))


def _classify(panel_names, geos):
    """Group panels that are the SAME PIECE, by shape rather than by name.

    Names were the authority here until the cuff bands disproved them:
    seamrules.mirror_name reads a leading left_/right_ and returns None for
    sl_left_cuff_b, while that panel reflects onto sl_right_cuff_b at
    0.0000mm. A pattern piece is a shape, so the shape decides and the name
    is only kept to report where the two disagree.
    """
    loops = {n: Loop(geos[n]) for n in panel_names}
    inv = {n: _invariants(loops[n]) for n in panel_names}
    classes = []

    for name in sorted(panel_names):
        for cls in classes:
            rep = cls['rep']
            if not _invariants_close(inv[name], inv[rep]):
                continue
            direct = shape_distance_cm(loops[name], loops[rep], False)
            flipped = shape_distance_cm(loops[name], loops[rep], True)
            if min(direct, flipped) > TOL_CM:
                continue
            cls['members'].append(name)
            cls['worst_cm'] = max(cls['worst_cm'], min(direct, flipped))
            if direct > TOL_CM:            # only lands after a reflection
                cls['mirrored'] = True
            break
        else:
            classes.append({'rep': name, 'members': [name],
                            'mirrored': False, 'worst_cm': 0.0})
    return classes, loops


def derive(panel_names, geos):
    """name -> what the page should say about cutting this piece.

    Every record carries the measurement that produced it. 'printed' is False
    for the copies that are not drawn: they are the same piece.
    """
    classes, loops = _classify(panel_names, geos)
    plan = {}

    for cls in classes:
        rep, members = cls['rep'], cls['members']
        cut = len(members)
        mm = round(cls['worst_cm'] * 10.0, 4)

        fold_cm = shape_distance_cm(loops[rep], loops[rep], True)
        fold = fold_cm <= TOL_CM
        arr = _normalise(loops[rep].sample())
        axis = 0.5 * (arr[:, 0].min() + arr[:, 0].max())

        bits = [f'{cut} kes']
        if cut > 1 and cls['mirrored']:
            bits.append('aynali cift')
        if fold:
            bits.append('katlamada')

        why = [f'{cut} panel in the specification measure as one shape'
               if cut > 1 else 'one panel, no other piece measures like it']
        if cut > 1:
            why.append(f'({", ".join(members)}) to {mm:.4f}mm'
                       + (', and only after a reflection, so they are a '
                          'mirrored pair' if cls['mirrored'] else
                          ', without reflecting, so they are identical'))
        why.append(f'symmetric about its own centre line to {fold_cm * 10:.4f}'
                   'mm, so it is drawn as a half and cut on the fold' if fold
                   else f'not symmetric about its own centre line '
                        f'({fold_cm * 10:.4f}mm), so it is drawn whole')

        named = seamrules.mirror_name(rep)
        disagree = None
        if cut > 1 and cls['mirrored'] and (named is None
                                            or named not in members):
            disagree = (f'the naming rule does not pair {rep} with '
                        f'{[m for m in members if m != rep]}; the outlines do')
        elif cut == 1 and named in panel_names:
            disagree = (f'{rep} is named as the mirror of {named} but the '
                        f'outlines do not match')

        plan[rep] = {
            'printed': True, 'cut': cut, 'fold': fold,
            'kind': ('mirrored' if cls['mirrored'] else
                     'repeat' if cut > 1 else 'single'),
            'members': members, 'label': ' · '.join(bits),
            'evidence_mm': mm, 'fold_axis': round(float(axis), 6),
            'why': '; '.join(why), 'name_disagreement': disagree,
        }
        for other in members:
            if other == rep:
                continue
            plan[other] = {
                'printed': False, 'cut': 0, 'fold': fold, 'kind': 'copy-of',
                'members': members, 'label': '', 'evidence_mm': mm,
                'why': f'same drawing as {rep}', 'name_disagreement': None,
            }

    return plan


def report_lines(plan):
    """The cut plan as it goes into print-report.txt."""
    out = [
        'CUT PLAN — derived from the outlines, not written down',
        '(a mirrored pair is one drawing cut twice; a panel symmetric about '
        'its own centre line is cut on the fold; the phase between two '
        'outlines is searched continuously, not in sample steps; tolerance '
        f'{TOL_CM * 10:.1f}mm against a 0.79375mm production standard)',
        f"{'panel':<18} {'drawn':<7} {'says':<21} {'worst mm':>9}  why",
        '-' * 112,
    ]
    for name in sorted(plan):
        r = plan[name]
        out.append(f"{name:<22} {'yes' if r['printed'] else 'no':<7} "
                   f"{r['label'] or '-':<25} {r['evidence_mm']:>9.4f}  "
                   f"{r['why']}")
    drawn = sum(1 for r in plan.values() if r['printed'])
    out += ['',
            f'{len(plan)} panels in the specification -> {drawn} pieces drawn '
            f'-> {sum(r["cut"] for r in plan.values())} pieces cut from cloth']

    rows = [r for r in plan.values() if r.get('name_disagreement')]
    if rows:
        out += ['',
                'WHERE THE NAMES AND THE OUTLINES DISAGREE',
                '(the outlines decide; this is here so the naming rule can be '
                'fixed rather than trusted)']
        out += [f'  {r["name_disagreement"]}' for r in rows]
    return out
