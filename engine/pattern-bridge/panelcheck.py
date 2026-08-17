import cutplan

# ============================================================================
# panelcheck.py — the checks that are about ONE PIECE, or about a piece and
# its mirror, rather than about a pair of edges being sewn together.
#
# Three of them, and no tool surveyed on 2026-08-02 runs any of them over a
# whole pattern:
#
#   CLOSED CONTOUR      an outline that does not close is not a piece. Cheap,
#                       absolute, and the one failure that makes every other
#                       measurement on that piece meaningless.
#   SELF-INTERSECTION   an outline that crosses itself cannot be cut. The
#                       market ledger recorded that no tool shows this at all.
#   MIRROR SYMMETRY     a garment drawn symmetric must come out symmetric.
#                       Nothing checks it, and the failure is invisible in a
#                       per-seam report because it shows up as two unrelated
#                       pairs with unremarkable numbers.
#
# The mirror check earns its place: on the 8-size run of 2026-08-01 the same
# waistband seam deviated 1.77mm on the left and 0.23mm on the right. Read as
# two separate pairs, one failed and one passed and neither said anything.
# Read as a mirror, the waistband panel is 1.54mm out of symmetry.
# ============================================================================

TOL_CLOSURE_MM = 0.01     # curve sampling noise, not a pattern fact
TOL_MIRROR_MM = 0.79375   # same production standard as an equality seam

# The outline is walked as a polyline rather than as curves. svgpathtools does
# not intersect arcs reliably, which is not our finding: the generator says so
# in its own source, cites the upstream issue, and linearizes for the same
# reason. Calling that solver on a circular skirt returns crossings at points
# the arcs never reach, and the check has to be built out of segment against
# segment, where the answer is a determinant and there is nothing to trust.
#
# Step is the resample distance along an edge. A chord of s on radius r sits
# s^2/8r off the true curve, so 1mm on the tightest curve a pattern carries,
# a 1cm dart tip, is 0.0125mm of error, sixty times under the tolerance a seam
# is judged at. The cap keeps a 150cm hem arc from becoming fifteen hundred
# segments; at the cap its chords are 3.8mm and its error 0.07mm, still ten
# times under tolerance.
STEP_MM = 1.0
MAX_STEPS_PER_EDGE = 400


def _panel_segments(panel, edge_curve):
    """The panel outline as an ordered list of svgpathtools segments."""
    return [edge_curve(panel['vertices'], e) for e in panel['edges']]


def check_closed(panel_name, panel, edge_curve):
    """Does the outline chain up and come back to where it started?

    Two failures are distinguished, because they have different causes: a
    break in the vertex chain is a topology error in the specification, and a
    geometric gap at a joint that chains correctly is a curve construction
    error in our own reader.
    """
    edges = panel['edges']
    problems = []

    for i, e in enumerate(edges):
        nxt = edges[(i + 1) % len(edges)]
        if e['endpoints'][1] != nxt['endpoints'][0]:
            problems.append({
                'kind': 'chain-break',
                'at_edge': i,
                'detail': f"edge {i} ends at vertex {e['endpoints'][1]} but "
                          f"edge {(i + 1) % len(edges)} starts at "
                          f"{nxt['endpoints'][0]}",
            })

    segs = _panel_segments(panel, edge_curve)
    for i, seg in enumerate(segs):
        nxt = segs[(i + 1) % len(segs)]
        gap = abs(seg.end - nxt.start) * 10.0   # cm -> mm
        if gap > TOL_CLOSURE_MM:
            problems.append({
                'kind': 'geometric-gap',
                'at_edge': i,
                'gap_mm': round(gap, 4),
                'detail': f'edge {i} ends {gap:.4f}mm away from where edge '
                          f'{(i + 1) % len(segs)} begins',
            })

    return {
        'panel': panel_name,
        'status': 'PASS' if not problems else 'FAIL',
        'problems': problems,
    }


def _ring(panel, edge_curve):
    """The outline as one closed polyline, remembering which edge each step
    came from so a crossing can be reported in the pattern's own vocabulary."""
    pts, owner = [], []
    for idx, seg in enumerate(_panel_segments(panel, edge_curve)):
        length_mm = seg.length() * 10.0
        n = int(min(MAX_STEPS_PER_EDGE, max(1, round(length_mm / STEP_MM))))
        for k in range(n):                      # end point is the next start
            p = seg.point(k / n)
            pts.append((p.real, p.imag))
            owner.append(idx)
    return pts, owner


_EPS_CM = 1e-9    # below this a point is ON the line, not to one side of it


def _side(p, q, r):
    """How far r sits off the line pq, signed. Positive is one side."""
    ux, uy = q[0] - p[0], q[1] - p[1]
    n = (ux * ux + uy * uy) ** 0.5
    if n == 0.0:
        return 0.0
    return (ux * (r[1] - p[1]) - uy * (r[0] - p[0])) / n


def _crosses(a, b, c, d):
    """Where two segments properly cross, or None.

    Each segment must have the other's ends strictly on opposite sides. That
    is four sign tests and no division, which matters: solving for the two
    parameters instead divides by a determinant that is 1e-19 rather than 0
    for two collinear steps of the same straight edge, and the parameters
    that come back are rounding noise that lands inside [0,1] often enough to
    report a straight line as crossing itself. It did, on a four sided skirt
    panel, in all eight sizes of a run that is known clean.

    Touching is not crossing. Two steps that share a point, an outline that
    grazes itself and comes back the same side, a dart leg that ends exactly
    on another edge: all read as zero here and none is a piece that cannot be
    cut. Only a real pass-through is a fault.
    """
    d1, d2 = _side(c, d, a), _side(c, d, b)
    if not ((d1 > _EPS_CM) != (d2 > _EPS_CM)) or abs(d1) <= _EPS_CM or abs(d2) <= _EPS_CM:
        return None
    d3, d4 = _side(a, b, c), _side(a, b, d)
    if not ((d3 > _EPS_CM) != (d4 > _EPS_CM)) or abs(d3) <= _EPS_CM or abs(d4) <= _EPS_CM:
        return None
    t = d1 / (d1 - d2)                          # safe: d1 and d2 differ in sign
    return (a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]))


def check_self_intersection(panel_name, panel, edge_curve):
    """Does the outline cross itself?

    The outline is resampled into one closed polyline and every pair of steps
    that does not share a point is tested. Two things fall out of walking the
    piece as one ring instead of comparing edge to edge. A curved edge that
    doubles back through itself is caught, which pairwise edge comparison
    cannot see at all. And adjacency stops being a special case: steps that
    touch are neighbours in the ring, whether they belong to the same edge or
    to two edges that meet at a vertex.

    A piece is allowed to be concave. It is not allowed to cross.
    """
    pts, owner = _ring(panel, edge_curve)
    n = len(pts)
    hits = []
    if n < 4:
        return {'panel': panel_name, 'status': 'PASS', 'hits': hits}

    # Buckets by cell so a 6000 step ring is not 18 million comparisons. Cell
    # is the longest step, so a step can only meet steps in its own cell or
    # one cell out, and the sweep stays linear in the number of steps.
    seg = [(pts[i], pts[(i + 1) % n]) for i in range(n)]
    cell = max(max(abs(a[0] - b[0]), abs(a[1] - b[1])) for a, b in seg) or 1.0
    grid = {}
    for i, (a, b) in enumerate(seg):
        for gx in range(int(min(a[0], b[0]) // cell), int(max(a[0], b[0]) // cell) + 1):
            for gy in range(int(min(a[1], b[1]) // cell), int(max(a[1], b[1]) // cell) + 1):
                grid.setdefault((gx, gy), []).append(i)

    tested = set()
    for (gx, gy), bucket in grid.items():
        near = [k for dx in (-1, 0, 1) for dy in (-1, 0, 1)
                for k in grid.get((gx + dx, gy + dy), ())]
        for i in bucket:
            for j in near:
                if j <= i or (j - i) % n <= 1 or (i - j) % n <= 1:
                    continue
                if (i, j) in tested:
                    continue
                tested.add((i, j))
                p = _crosses(seg[i][0], seg[i][1], seg[j][0], seg[j][1])
                if p is None:
                    continue
                hits.append({
                    'kind': 'crossing',
                    'edges': sorted({owner[i], owner[j]}),
                    'at_cm': [round(p[0], 4), round(p[1], 4)],
                })

    return {'panel': panel_name,
            'status': 'FAIL' if hits else 'PASS',
            'hits': hits}


def _merge_alignment(lens_a, lens_b, tol):
    """Line two edge loops up when one side splits an edge the other keeps.

    The same outline can be written with different edge counts: a panel whose
    left copy carries 14.786 and 81.653 where its right copy carries 96.440 is
    the same shape, cut into pieces differently. Comparing edge to edge calls
    that a fault, and it is not one. Here the two loops are walked together,
    accumulating on whichever side is behind, and they match when every run
    closes on the same length.

    Returns (reversed, shift) for an alignment that works, or None.
    """
    n, m = len(lens_a), len(lens_b)
    for reverse in (False, True):
        base = list(reversed(lens_b)) if reverse else list(lens_b)
        for shift in range(m):
            rolled = [base[(k + shift) % m] for k in range(m)]
            i = j = 0
            acc_a = acc_b = 0.0
            ok = True
            while i < n or j < m:
                if abs(acc_a - acc_b) <= tol and acc_a > 0:
                    acc_a = acc_b = 0.0          # a run closed; start the next
                if acc_a <= acc_b and i < n:
                    acc_a += lens_a[i]
                    i += 1
                elif j < m:
                    acc_b += rolled[j]
                    j += 1
                else:
                    ok = False
                    break
                if min(acc_a, acc_b) > 0 and abs(acc_a - acc_b) > sum(lens_a):
                    ok = False
                    break
            if ok and abs(acc_a - acc_b) <= tol:
                return reverse, shift
    return None


def _best_alignment(lens_a, lens_b):
    """How does one panel's edge loop line up with its mirror's?

    A mirror reverses orientation, so the corresponding edge is normally the
    reversed one, and the loop can also start at a different vertex. Rather
    than assume either, every rotation of both directions is scored and the
    one with the smallest worst-case difference wins. The alignment that was
    used is reported, because a fault found under an alignment nobody stated
    is not a finding, it is an artefact of the comparison.
    """
    n = len(lens_a)
    best = None
    for reverse in (True, False):
        base = list(reversed(lens_b)) if reverse else list(lens_b)
        for shift in range(n):
            rolled = [base[(i + shift) % n] for i in range(n)]
            worst = max(abs(x - y) for x, y in zip(lens_a, rolled))
            if best is None or worst < best[0]:
                best = (worst, reverse, shift, rolled)
    return best


def check_mirror_symmetry(panels, edge_length_mm, mirror_name,
                          segments_for=None):
    """Every panel that has a mirror is compared to it.

    The difference between the two sides of a symmetric garment is zero by
    construction, not by tolerance. What that zero is measured ON matters
    more than the tolerance around it.

    This audit used to compare the two EDGE LENGTH SEQUENCES. That reads a
    fault the cloth does not have, and it did: on a fitted shirt over a
    many-panelled skirt it reported 89.9209mm between the two front bodices.
    Both panels carry 13 edges and the same 1647.7872mm perimeter, but the
    generator splits them in different places — the left writes 89.921 plus
    28.838 where the right writes one 118.759, and the right writes 62.813
    plus 14.419 where the left writes one 77.231. Equal counts, different
    partition, so a sequence comparison lines up the wrong edges. Walked as
    an OUTLINE the same two panels differ by 0.0000mm.

    So when `segments_for` is supplied the verdict comes from the outline:
    resampled at equal arc length, reflected, landed on the other over every
    rotation and both directions. The edge table is still reported, as the
    detail of where the two panels are written differently, but it no longer
    decides. Without `segments_for` the old sequence comparison stands, so
    callers that have no curves keep working.
    """
    results = []
    seen = set()
    for name in panels:
        other = mirror_name(name)
        if other is None or other not in panels:
            continue
        key = tuple(sorted((name, other)))
        if key in seen:
            continue
        seen.add(key)

        a, b = panels[key[0]], panels[key[1]]
        lens_a = [edge_length_mm(a, e) for e in a['edges']]
        lens_b = [edge_length_mm(b, e) for e in b['edges']]

        if segments_for is not None:
            worst_mm = 10.0 * cutplan.shape_distance_cm(
                cutplan.Loop(segments_for(a)), cutplan.Loop(segments_for(b)),
                reflect_a=True)
            split = (len(lens_a) != len(lens_b)
                     or abs(sum(lens_a) - sum(lens_b)) > TOL_MIRROR_MM)
            results.append({
                'pair': list(key),
                'status': 'PASS' if worst_mm <= TOL_MIRROR_MM else 'FAIL',
                'worst_diff_mm': round(worst_mm, 4),
                'measured_on': 'outline',
                'reason': f'the outlines differ by {worst_mm:.4f}mm once the '
                          f'traversal offset and direction are removed'
                          + ('; the two panels are written with a different '
                             'edge split, which the edge table shows and the '
                             'outline does not care about' if not split and
                             len(lens_a) == len(lens_b) else ''),
                'edges': [],
                'edge_counts': [len(lens_a), len(lens_b)],
                'perimeter_diff_mm': round(abs(sum(lens_a) - sum(lens_b)), 4),
            })
            continue

        if len(lens_a) != len(lens_b):
            # Different edge counts are a difference in how the outline was
            # written, not necessarily in the outline. Perimeter decides.
            perim = abs(sum(lens_a) - sum(lens_b))
            merged = _merge_alignment(lens_a, lens_b, TOL_MIRROR_MM)
            results.append({
                'pair': list(key),
                'status': 'PASS' if (perim <= TOL_MIRROR_MM and merged) else 'FAIL',
                'reason': f"the two copies are cut into a different number of "
                          f"edges ({len(lens_a)} vs {len(lens_b)}); perimeters "
                          f"differ by {perim:.4f}mm and the loops "
                          f"{'do' if merged else 'do NOT'} line up when the "
                          f"split runs are merged",
                'perimeter_diff_mm': round(perim, 4),
                'edges': [],
            })
            continue

        worst, reverse, shift, rolled = _best_alignment(lens_a, lens_b)

        rows = []
        for i, (la, lb) in enumerate(zip(lens_a, rolled)):
            d = abs(la - lb)
            if d > TOL_MIRROR_MM:
                rows.append({'edge': i, 'left_mm': round(la, 4),
                             'right_mm': round(lb, 4), 'diff_mm': round(d, 4)})
        results.append({
            'pair': list(key),
            'status': 'PASS' if not rows else 'FAIL',
            'worst_diff_mm': round(worst, 4),
            'alignment': {'reversed': reverse, 'shift': shift},
            'edges': rows,
        })
    return results


def edge_mirror_map(panels, edge_length_mm, mirror_name, unmapped=None):
    """(panel, edge) -> (mirror panel, mirror edge), for panels that mirror.

    Derived from the same alignment the panel audit found, so an edge is only
    mapped when the two loops actually line up. Panels with no mirror, such as
    a single waistband spanning both sides of the body, are absent from the
    map on purpose.

    `unmapped`, if a list is passed, collects the pairs that DO have a mirror
    partner and still could not be aligned. T12/TUR 12: that case used to be a
    bare `continue`. It is not a "no mirror here" — it is a pair whose seams
    then receive NO mirror-seam verdict at all, and the pair that fails to
    align is by construction the WORST-deviating pair in the garment. Measured
    on today's engine, EU34/36/42/44/46: left_btorso/right_btorso misaligns by
    3.77-3.94mm (~5x the 0.79375mm production standard), drops out here, and
    the mirror-seam audit falls from 10 judged seam pairs to 4 — six verdicts
    vanish and walk.py printed `mirror-seam 0 ... KAPI HUKUM: YESIL`.
    The panel-level audit does NOT cover it: called with `segments_for` it
    measures the OUTLINE on purpose (0.0005mm, PASS) and says so in its own
    `reason`. So both levels excused it. Silence is now a finding.
    """
    mapping, seen = {}, set()
    for name in panels:
        other = mirror_name(name)
        if other is None or other not in panels:
            continue
        key = tuple(sorted((name, other)))
        if key in seen:
            continue
        seen.add(key)
        a, b = panels[key[0]], panels[key[1]]
        if len(a['edges']) != len(b['edges']):
            if unmapped is not None:
                unmapped.append({
                    'pair': list(key),
                    'why': 'edge counts differ '
                           f"({len(a['edges'])} vs {len(b['edges'])})",
                    'worst_diff_mm': None,
                })
            continue
        n = len(a['edges'])
        lens_a = [edge_length_mm(a, e) for e in a['edges']]
        lens_b = [edge_length_mm(b, e) for e in b['edges']]
        worst, reverse, shift, _ = _best_alignment(lens_a, lens_b)
        if worst > TOL_MIRROR_MM:
            # the loops do not correspond; do not pretend — AND do not go
            # quiet about it, see the docstring.
            if unmapped is not None:
                unmapped.append({
                    'pair': list(key),
                    'why': 'no rotation or direction lines the two edge '
                           f'tables up: best is {worst:.4f}mm against the '
                           f'{TOL_MIRROR_MM}mm standard',
                    'worst_diff_mm': round(worst, 4),
                })
            continue
        for i in range(n):
            j = (i + shift) % n
            if reverse:
                j = n - 1 - j
            mapping[(key[0], i)] = (key[1], j)
            mapping[(key[1], j)] = (key[0], i)
    return mapping


def check_stitch_mirror_symmetry(panels, stitches, edge_length_mm, mirror_name):
    """The same audit one level up, on seams instead of panels.

    Every panel can be perfectly symmetric and the garment still not be, when
    a panel that spans both sides is longer on one of them. That fault is
    invisible in a per-pair report: it shows up as two unrelated seams with
    unremarkable numbers, one under tolerance and one over. Comparing a seam
    to its mirror is what makes it a single finding.

    The mirror of a seam is found through the panel alignment, not by taking
    the first seam that happens to join the mirrored panels. A side that has
    no mirror panel is matched on the panel alone, which is exactly the
    waistband case.
    """
    unmapped = []
    emap = edge_mirror_map(panels, edge_length_mm, mirror_name,
                           unmapped=unmapped)

    index = {}
    for st in stitches:
        a, b = st[0], st[1]
        la = edge_length_mm(panels[a['panel']],
                            panels[a['panel']]['edges'][a['edge']])
        lb = edge_length_mm(panels[b['panel']],
                            panels[b['panel']]['edges'][b['edge']])
        index[(a['panel'], a['edge'], b['panel'], b['edge'])] = la - lb

    results, seen = [], set()
    for (ap, ae, bp, be), diff in index.items():
        tgt_a = emap.get((ap, ae))
        tgt_b = emap.get((bp, be))
        if tgt_a is None and tgt_b is None:
            continue   # neither side mirrors; this seam has no mirror seam

        partner = None
        for cand, other in index.items():
            if cand == (ap, ae, bp, be):
                continue
            cp, ce, dp, de = cand
            # the seam is unordered, so try it both ways round
            for (xa, xe, xb, xf) in ((cp, ce, dp, de), (dp, de, cp, ce)):
                if tgt_a is not None:
                    if (xa, xe) != tgt_a:
                        continue
                elif xa != ap:          # unmirrored side: same panel is enough
                    continue
                if tgt_b is not None:
                    if (xb, xf) != tgt_b:
                        continue
                elif xb != bp:
                    continue
                partner = (cand, other if (xa, xe) == (cp, ce) else -other)
                break
            if partner:
                break
        if partner is None:
            continue

        key = tuple(sorted([(ap, ae, bp, be), partner[0]]))
        if key in seen:
            continue
        seen.add(key)
        spread = abs(diff - partner[1])
        results.append({
            'seam': f'{ap}[{ae}]<->{bp}[{be}]',
            'mirror': f'{partner[0][0]}[{partner[0][1]}]<->'
                      f'{partner[0][2]}[{partner[0][3]}]',
            'diff_mm': round(diff, 4),
            'mirror_diff_mm': round(partner[1], 4),
            'spread_mm': round(spread, 4),
            'status': 'PASS' if spread <= TOL_MIRROR_MM else 'FAIL',
        })

    # A pair that has a mirror partner and could not be aligned produced no
    # verdict above. That absence is the finding, and it is emitted as one so
    # the caller's FAIL count can carry it. No threshold is introduced here:
    # the number compared is the same TOL_MIRROR_MM the rest of the file uses.
    for u in unmapped:
        results.append({
            'seam': f"{u['pair'][0]} <-> {u['pair'][1]}",
            'mirror': 'NONE — no mirror-seam verdict was produced',
            'diff_mm': None,
            'mirror_diff_mm': None,
            'spread_mm': u['worst_diff_mm'],
            'status': 'FAIL',
            'reason': 'this pair mirrors by name but ' + u['why']
                      + '; every seam on it went UNJUDGED',
        })
    return results
