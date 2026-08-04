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

    def __init__(self, segs, step_cm=TABLE_STEP_CM):
        segs = getattr(segs, 'segs', segs)      # a PanelGeo or a bare list
        pts = []
        starts = []                             # where each edge begins
        for seg in segs:
            starts.append(len(pts))
            k = max(2, int(math.ceil(seg.length() / step_cm)))
            pts.extend(seg.point(i / k) for i in range(k))   # endpoint = next
        p = np.array([[q.real, q.imag] for q in pts], dtype=float)
        closed = np.vstack([p, p[:1]])
        d = np.linalg.norm(np.diff(closed, axis=0), axis=1)
        self.p = closed                                       # n+1 points
        self.s = np.concatenate([[0.0], np.cumsum(d)])        # n+1 arc lengths
        self.total = float(self.s[-1])
        # where the outline is cut into edges, as arc length. The contour says
        # what shape the piece is; this says where its seams start and stop.
        self.breaks = [float(self.s[i]) for i in starts]

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


def match_landing(loop_a, loop_b, reflect_a, n=SAMPLES):
    """Land a on b as well as it can be landed, and say how it was landed.

    Which vertex each outline happens to start from, and which way round it is
    written, are bookkeeping. Only what is left after both are removed is
    geometry. Returns (worst_cm, phase, reverse), so the same landing can be
    asked about anything else the two outlines carry.
    """
    b = _normalise(loop_b.sample(n))
    step = loop_a.total / n
    best = (math.inf, 0.0, False)

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
        phase = 0.5 * (lo + hi)
        d = at(phase)
        if d < best[0]:
            best = (d, phase, reverse)

    return best


def shape_distance_cm(loop_a, loop_b, reflect_a, n=SAMPLES):
    """Worst point-to-point distance once a is landed on b as well as it can
    be. The landing itself is in match_landing."""
    return match_landing(loop_a, loop_b, reflect_a, n)[0]


def _circular_reach(xs, ys, total):
    """Worst distance from a position in xs to the nearest position in ys,
    measured around a closed loop of length `total`."""
    worst = 0.0
    for x in xs:
        near = min(min(abs(x - y), total - abs(x - y)) for y in ys)
        worst = max(worst, near)
    return worst


def edge_gap_cm(loop_a, loop_b, phase, reverse, n=SAMPLES):
    """Worst gap between the two outlines' EDGE BREAKS under a given landing.

    Contour equality says the two pieces are the same SHAPE. It does not say
    they are the same PIECE, because what makes a piece is where its outline
    is cut into edges: that is where one seam ends and the next begins, and it
    is what a notch, a seam name and a sewing order are hung on. Five panels
    of a five-panel skirt are the same trapezium and carry 7, 8, 7, 8 and 9
    edges, so one drawing cut five times loses four pieces' worth of seams.

    The landing is the one the contour match already found, so this asks the
    question in the frame where the two outlines are on top of each other.
    """
    step_a, step_b = loop_a.total / n, loop_b.total / n
    carried = []
    for s in loop_a.breaks:
        # invert the sampling: which sample index of a sits on this break
        i = ((loop_a.total - s - phase) if reverse else (s - phase)) / step_a
        carried.append((i * step_b) % loop_b.total)   # that index's arc on b
    own = [x % loop_b.total for x in loop_b.breaks]
    return max(_circular_reach(carried, own, loop_b.total),
               _circular_reach(own, carried, loop_b.total))


def mirror_distance_cm(geo_a, geo_b):
    return shape_distance_cm(Loop(geo_a), Loop(geo_b), reflect_a=True)


def _invariants(loop):
    """Perimeter and bounding box: true whatever way round the loop is
    written, so they shortlist candidates before the expensive comparison."""
    p = loop.p[:-1]
    return (loop.total,
            float(p[:, 0].max() - p[:, 0].min()),
            float(p[:, 1].max() - p[:, 1].min()))


def _invariants_close(a, b):
    return all(abs(x - y) <= TOL_CM for x, y in zip(a, b))


def _same_piece(loop_a, loop_b):
    """(same, mirrored, contour_cm, edge_cm), or None if the contours differ.

    Two gates, and the second one was missing until the five-panel skirt found
    it. The contour gate says the two pieces are the same shape. The edge gate
    says the shape is cut into edges in the same places, which is what makes it
    the same PIECE: a seam that starts halfway down one panel and a third of
    the way down its twin are different seams, and a cutter given one drawing
    cannot know which of the two is in their hands.

    An unreflected landing is tried first, because a piece that lands on
    another without reflecting is a repeat rather than a mirror. Both landings
    are tried in full: the five-panel skirt's left and right halves land on
    each other either way at 0.0000mm of contour, and only the reflected
    landing brings their edges together too.
    """
    best = None
    for mirrored in (False, True):
        d, phase, reverse = match_landing(loop_a, loop_b, mirrored)
        if d > TOL_CM:
            continue
        gap = edge_gap_cm(loop_a, loop_b, phase, reverse)
        if gap <= TOL_CM:
            return True, mirrored, d, gap
        if best is None or gap < best[3]:
            best = (False, mirrored, d, gap)
    return best


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
    near_misses = []      # same outline, different edges: reported, not merged

    for name in sorted(panel_names):
        for cls in classes:
            rep = cls['rep']
            if not _invariants_close(inv[name], inv[rep]):
                continue
            verdict = _same_piece(loops[name], loops[rep])
            if verdict is None:
                continue
            same, mirrored, d, gap = verdict
            if not same:                   # contour agreed, edges did not
                near_misses.append((name, rep, d, gap))
                continue
            cls['members'].append(name)
            cls['worst_cm'] = max(cls['worst_cm'], d)
            cls['edge_cm'] = max(cls['edge_cm'], gap)
            if mirrored:
                cls['mirrored'] = True
            break
        else:
            classes.append({'rep': name, 'members': [name], 'mirrored': False,
                            'worst_cm': 0.0, 'edge_cm': 0.0})
    return classes, loops, near_misses


def derive(panel_names, geos):
    """name -> what the page should say about cutting this piece.

    Every record carries the measurement that produced it. 'printed' is False
    for the copies that are not drawn: they are the same piece.
    """
    classes, loops, near_misses = _classify(panel_names, geos)
    plan = {}

    for cls in classes:
        rep, members = cls['rep'], cls['members']
        cut = len(members)
        mm = round(cls['worst_cm'] * 10.0, 4)
        edge_mm = round(cls['edge_cm'] * 10.0, 4)

        fold_cm, fold_phase, fold_rev = match_landing(loops[rep], loops[rep],
                                                      True)
        fold_edge_cm = edge_gap_cm(loops[rep], loops[rep], fold_phase,
                                   fold_rev)
        # both gates again: a half drawing carries half the edge breaks, so a
        # piece whose seams do not fall symmetrically cannot be cut on the fold
        # however symmetric its outline is
        fold = fold_cm <= TOL_CM and fold_edge_cm <= TOL_CM
        # in the PANEL's own coordinates, because that is where the drawing
        # gets cut in half
        raw = loops[rep].p[:-1]
        axis = 0.5 * (float(raw[:, 0].min()) + float(raw[:, 0].max()))

        bits = [f'{cut} kes']
        if cut > 1 and cls['mirrored']:
            bits.append('aynali cift')
        if fold:
            bits.append('katlamada')

        rivals = [a for a, b, _, _ in near_misses if b == rep]
        if cut > 1:
            why = ['%d panel in the specification measure as one shape' % cut]
        elif rivals:
            worst = max(g for a, b, _, g in near_misses if b == rep)
            why = [f'one panel; {len(rivals)} other piece'
                   f'{"s carry" if len(rivals) > 1 else " carries"} this '
                   f'outline but {"are" if len(rivals) > 1 else "is"} cut into '
                   f'edges elsewhere ({worst * 10:.4f}mm), so they are '
                   f'different pieces']
        else:
            why = ['one panel, no other piece measures like it']
        if cut > 1:
            why.append(f'({", ".join(members)}) to {mm:.4f}mm'
                       + (', and only after a reflection, so they are a '
                          'mirrored pair' if cls['mirrored'] else
                          ', without reflecting, so they are identical')
                       + f', with their edges falling in the same places to '
                         f'{edge_mm:.4f}mm')
        if fold:
            why.append(f'symmetric about its own centre line to '
                       f'{fold_cm * 10:.4f}mm and cut into edges symmetrically '
                       f'to {fold_edge_cm * 10:.4f}mm, so it is drawn as a '
                       f'half and cut on the fold')
        elif fold_cm <= TOL_CM:
            why.append(f'symmetric about its own centre line to '
                       f'{fold_cm * 10:.4f}mm, but its edges are not '
                       f'({fold_edge_cm * 10:.4f}mm), so a half drawing would '
                       f'lose seams and it is drawn whole')
        else:
            why.append(f'not symmetric about its own centre line '
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
            'evidence_mm': mm, 'edge_mm': edge_mm,
            'fold_axis': round(float(axis), 6),
            'rivals': [(a, round(g * 10.0, 4))
                       for a, b, _, g in near_misses if b == rep],
            'why': '; '.join(why), 'name_disagreement': disagree,
        }
        for other in members:
            if other == rep:
                continue
            plan[other] = {
                'printed': False, 'cut': 0, 'fold': fold, 'kind': 'copy-of',
                'members': members, 'label': '', 'evidence_mm': mm,
                'edge_mm': edge_mm, 'rivals': [],
                'why': f'same drawing as {rep}', 'name_disagreement': None,
            }

    return plan


def report_lines(plan):
    """The cut plan as it goes into print-report.txt."""
    out = [
        'CUT PLAN — derived from the outlines, not written down',
        '(a mirrored pair is one drawing cut twice; a panel symmetric about '
        'its own centre line is cut on the fold; the phase between two '
        'outlines is searched continuously, not in sample steps; two pieces '
        'are one drawing only if the outlines AND the places the outline is '
        'cut into edges both land, because the edges are where the seams '
        f'start and stop; tolerance {TOL_CM * 10:.1f}mm against a 0.79375mm '
        'production standard)',
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

    rivals = sorted({(a, name, gap) for name, r in plan.items()
                     for a, gap in r.get('rivals', ())})
    if rivals:
        out += ['',
                'SAME OUTLINE, DIFFERENT PIECE',
                '(these land on each other to within the tolerance and are '
                'still not one drawing: the outline is cut into edges in '
                'different places, so the seams they carry are different)']
        out += [f'  {a} and {b} agree as shapes and their edge breaks are '
                f'{gap:.4f}mm apart' for a, b, gap in rivals]

    rows = [r for r in plan.values() if r.get('name_disagreement')]
    if rows:
        out += ['',
                'WHERE THE NAMES AND THE OUTLINES DISAGREE',
                '(the outlines decide; this is here so the naming rule can be '
                'fixed rather than trusted)']
        out += [f'  {r["name_disagreement"]}' for r in rows]
    return out
