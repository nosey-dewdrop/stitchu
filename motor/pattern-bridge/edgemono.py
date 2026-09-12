"""edgemono.py — does a panel edge double back on itself?

Why this is not already covered. panelcheck.check_self_intersection walks the
whole outline as one ring and reports a PROPER crossing: the two steps must
have each other's ends strictly on opposite sides. That test says, in its own
words, that touching is not crossing. A cut line that runs out and folds back
along very nearly the same line never produces a proper crossing — the fold is
a tangency, the determinant is zero, and the ring check passes a piece that a
cutter cannot follow. That is the hole this file measures.

Two numbers per edge, both in the edge's own frame (chord from start to end):

  backtrack_mm    the furthest the curve retreats along the chord after having
                  advanced. Sample the curve, project onto the unit chord, and
                  track the drop from the running maximum. An edge that only
                  ever moves forward along its chord scores 0.

  reverse_deg     the largest angle between the tangent and the chord. Past 90
                  degrees the cut line is locally travelling backwards; at 180
                  it is a cusp.

Both are reported. Neither is silently thresholded here: the gate lives in
edgemono_check.py so that the measurement and the verdict are separate files
and a threshold cannot be quietly widened inside the thing that measures.

Sampling: 256 points per edge. A cubic's projection onto its chord is a cubic
in t, so it has at most two turning points and 256 samples locate a retreat of
any size that a 1mm cut tolerance would care about; the retreats this catches
in practice are structural, not sub-millimetre.
"""

SAMPLES = 256


def edge_monotonicity(seg):
    """(backtrack_mm, reverse_deg) for one svgpathtools segment.

    Coordinates arrive in cm, both outputs are mm and degrees.
    """
    import cmath

    a, b = seg.point(0.0), seg.point(1.0)
    chord = b - a
    n = abs(chord)
    if n == 0.0:
        # A closed edge has no chord to be monotonic against. It cannot be
        # judged here, and saying 0 would be claiming it passed.
        return None, None
    u = chord / n

    proj = []
    for k in range(SAMPLES + 1):
        p = seg.point(k / SAMPLES)
        proj.append(((p - a) / u).real)

    run_max = proj[0]
    backtrack = 0.0
    for s in proj:
        if s > run_max:
            run_max = s
        else:
            backtrack = max(backtrack, run_max - s)

    reverse = 0.0
    for k in range(SAMPLES + 1):
        try:
            d = seg.derivative(k / SAMPLES)
        except (ValueError, ZeroDivisionError):
            continue
        if abs(d) == 0.0:
            continue
        ang = abs(cmath.phase(d / u))
        reverse = max(reverse, ang)

    import math
    return backtrack * 10.0, math.degrees(reverse)


def measure_panel(panel_name, panel, edge_curve):
    """One row per edge of one panel."""
    rows = []
    for i, e in enumerate(panel['edges']):
        seg = edge_curve(panel['vertices'], e)
        back, rev = edge_monotonicity(seg)
        rows.append({
            'panel': panel_name,
            'edge': i,
            'length_mm': round(seg.length() * 10.0, 4),
            'backtrack_mm': None if back is None else round(back, 6),
            'reverse_deg': None if rev is None else round(rev, 4),
        })
    return rows
