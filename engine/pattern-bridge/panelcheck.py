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


def check_self_intersection(panel_name, panel, edge_curve):
    """Does the outline cross itself?

    Every non-adjacent pair of segments is tested. Adjacent segments are
    excluded because they share an endpoint by construction, and in a closed
    loop the first and last segment are adjacent too. A dart notch touching
    its own leg is a real intersection and is reported; a piece is allowed to
    be concave, it is not allowed to cross.
    """
    segs = _panel_segments(panel, edge_curve)
    n = len(segs)
    hits = []
    for i in range(n):
        for j in range(i + 1, n):
            adjacent = (j == i + 1) or (i == 0 and j == n - 1)
            if adjacent:
                continue
            try:
                crossings = segs[i].intersect(segs[j])
            except Exception as exc:              # noqa: BLE001
                hits.append({'kind': 'not-computable', 'edges': [i, j],
                             'detail': f'{type(exc).__name__}: {exc}'})
                continue
            for (t1, t2) in crossings:
                p = segs[i].point(t1)
                hits.append({
                    'kind': 'crossing',
                    'edges': [i, j],
                    'at_cm': [round(p.real, 4), round(p.imag, 4)],
                })

    computable = [h for h in hits if h['kind'] == 'crossing']
    failed = [h for h in hits if h['kind'] == 'not-computable']
    if failed and not computable:
        status = 'UNVERIFIABLE'
    elif computable:
        status = 'FAIL'
    else:
        status = 'PASS'
    return {'panel': panel_name, 'status': status, 'hits': hits}


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


def check_mirror_symmetry(panels, edge_length_mm, mirror_name):
    """Every panel that has a mirror is compared to it, edge by edge.

    A mirrored pair must carry the same number of edges and the same length
    on each, because the difference between the two sides of a symmetric
    garment is zero by construction, not by tolerance. The production
    tolerance is still applied, so sampling noise does not raise a fault.
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


def edge_mirror_map(panels, edge_length_mm, mirror_name):
    """(panel, edge) -> (mirror panel, mirror edge), for panels that mirror.

    Derived from the same alignment the panel audit found, so an edge is only
    mapped when the two loops actually line up. Panels with no mirror, such as
    a single waistband spanning both sides of the body, are absent from the
    map on purpose.
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
            continue
        n = len(a['edges'])
        lens_a = [edge_length_mm(a, e) for e in a['edges']]
        lens_b = [edge_length_mm(b, e) for e in b['edges']]
        worst, reverse, shift, _ = _best_alignment(lens_a, lens_b)
        if worst > TOL_MIRROR_MM:
            continue          # the loops do not correspond; do not pretend
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
    emap = edge_mirror_map(panels, edge_length_mm, mirror_name)

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
    return results
