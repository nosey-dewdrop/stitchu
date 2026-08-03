# ============================================================================
# printpack.py — GarmentCode specification -> PRINTABLE, CUTTABLE paper.
#
# What the raw GarmentCode print PDF lacks and this module adds:
#   1. Seam allowance as a TRUE CURVE OFFSET (not a polygon offset): every
#      edge curve is adaptively sampled (chord error < 0.05mm on both the
#      seam and the allowance line), each sample is pushed 10mm along the
#      OUTWARD ANALYTIC normal of its own curve. Corners are closed by
#      intersecting the two offset LINES (miter), boxed (straight cut) when
#      the miter would run past 4x the allowance, and trimmed at the exact
#      chain crossing on concave corners (dart wedges). Two expensive
#      lessons live here: a naive miter once turned 0.11mm-trued dart legs
#      into a fake +-12mm defect, and a central-difference tangent once cut
#      a collar-band corner at 45 degrees — tangents here are ANALYTIC
#      derivatives of the spec curves, never finite differences.
#   2. Notches from the stitch graph: every panel-to-panel stitch pair gets
#      notches at matching arc-length RATIOS (midpoint; 1/3 and 2/3 when the
#      seam is longer than 20cm). Convention: front seams single, back
#      seams double, center-back triple. Dart pairs (same-panel stitches)
#      are skipped: darts are marked by their own wedge, not by notches.
#   3. Grainline arrow + label block (panel name, piece i/N, size, cut 1,
#      stitchu + date) on every panel.
#   4. 1:1 pagination: A0 sheets and a tiled A4 booklet (10mm overlap,
#      alignment crosses, page codes A1/B2/..., a 4x4cm test square and a
#      page map on the first A4 page). Scale law: 1cm = 28.3465pt, checked
#      by an assert on the test square (113.386pt).
#
# Everything measurable is measured and written to print-report.txt:
# allowance distance stats per panel, notch position differences per pair,
# page counts, the test-square assert, and a content hash for determinism.
#
# Runs inside the GarmentCode venv (numpy, scipy, svgpathtools, cairosvg,
# matplotlib available). Pure consumer of the spec: touches no other stage.
# ============================================================================
import argparse
import datetime
import hashlib
import json
import math
import sys
from pathlib import Path

import numpy as np
from matplotlib.path import Path as MplPath
from scipy.spatial import cKDTree

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import walk as walklib  # noqa: E402  (edge_curve: spec edge -> svgpathtools segment)
import cutplan             # noqa: E402  (cut counts, measured off the outlines)
import seamrules           # noqa: E402  (roles, and the name a person reads)

# --- geometry constants (cm unless stated) ---------------------------------
ALLOW = 1.0            # seam allowance: 10mm (Bugra's bought patterns use it)
SAMPLE_TOL = 0.005     # max chord error while sampling: 0.05mm
MAX_SEG = 0.2          # max chord length: keeps pruning granular on straights
VERIFY_TOL = 0.001     # seam polyline density for distance checks: 0.01mm
PRUNE_EPS = 0.002      # offset points closer than ALLOW-this to the seam die
MITER_LIMIT = 4.0      # x ALLOW; past it the corner is cut straight (boxed)
CORNER_R = 0.25        # allowance points this close to a corner join are
                       # counted as corner region, not as smooth band
NOTCH_LEN = 0.8        # notch line: 8mm across the allowance band
NOTCH_GAP = 0.5        # spacing between the lines of a double/triple notch
LONG_EDGE = 20.0       # seams longer than this get notches at 1/3 and 2/3
MIN_NOTCH_EDGE = 3.0   # edges shorter than this need no matching notch
DIST_TOL = 0.005       # smooth-band allowance distance tolerance: 0.05mm
MIN_SMOOTH = 200       # every panel must yield at least this many checked pts

# --- paper constants -------------------------------------------------------
CM_PT = 72.0 / 2.54    # 28.3465pt per cm — THE scale law of the whole pack
A4_W, A4_H = 21.0, 29.7
A0_W, A0_H = 84.1, 118.9
MARGIN = 1.0           # printable margin on every page
OVERLAP = 1.0          # A4 tiling overlap: 10mm
A0_HEADER = 4.5        # strip on top of every A0 page: title + test square
GAP = 1.2              # spacing between packed panels

FRONT_HINTS = ('ftorso', 'front', '_f')
BACK_HINTS = ('btorso', 'back', '_b')


# ===========================================================================
# small geometry helpers (complex-number plane, like svgpathtools)
# ===========================================================================
def _unit(z):
    m = abs(z)
    return z / m if m > 1e-12 else complex(1, 0)


def _tangent(seg, t):
    """Analytic unit tangent. NEVER a finite difference (collar-band lesson)."""
    d = seg.derivative(t)
    if abs(d) < 1e-9:  # degenerate endpoint of a curve; step inside
        d = seg.derivative(min(max(t, 1e-4), 1 - 1e-4))
    return _unit(d)


def _seg_point_dist(p, a, b):
    """Distance from point p to segment ab (complex)."""
    ab = b - a
    L2 = (ab.real * ab.real + ab.imag * ab.imag)
    if L2 < 1e-18:
        return abs(p - a)
    t = ((p - a).real * ab.real + (p - a).imag * ab.imag) / L2
    t = min(1.0, max(0.0, t))
    return abs(p - (a + t * ab))


def _cross(a, b):
    return a.real * b.imag - a.imag * b.real


def _line_intersect(p, dp, q, dq):
    """Intersection of lines p+s*dp and q+u*dq; None if near-parallel."""
    den = _cross(dp, dq)
    if abs(den) < 1e-12:
        return None
    s = _cross(q - p, dq) / den
    return p + s * dp


def _seg_intersect(a1, a2, b1, b2):
    """Proper intersection point of segments a1a2 and b1b2, else None."""
    da, db = a2 - a1, b2 - b1
    den = _cross(da, db)
    if abs(den) < 1e-14:
        return None
    s = _cross(b1 - a1, db) / den
    u = _cross(b1 - a1, da) / den
    if -1e-9 <= s <= 1 + 1e-9 and -1e-9 <= u <= 1 + 1e-9:
        return a1 + s * da
    return None


def _signed_area(pts):
    area = 0.0
    for i in range(len(pts)):
        a, b = pts[i], pts[(i + 1) % len(pts)]
        area += _cross(a, b)
    return 0.5 * area


# ===========================================================================
# adaptive sampling: subdivide until BOTH the seam chord and the offset
# chord deviate < SAMPLE_TOL from their curves, and chords stay < MAX_SEG
# ===========================================================================
def _sample_edge(seg, orient, radius):
    """Return [(t, seam_pt, offset_pt)] from t=0 to t=1 inclusive."""
    def normal(t):
        # outward = rotate tangent -90deg for CCW loops, +90deg for CW
        return _tangent(seg, t) * complex(0, -1) * orient

    def off(t):
        return seg.point(t) + radius * normal(t)

    out = []

    def rec(t0, p0, q0, t1, p1, q1, depth):
        tm = 0.5 * (t0 + t1)
        pm, qm = seg.point(tm), off(tm)
        need = (_seg_point_dist(pm, p0, p1) > SAMPLE_TOL
                or _seg_point_dist(qm, q0, q1) > SAMPLE_TOL
                or abs(q1 - q0) > MAX_SEG or abs(p1 - p0) > MAX_SEG)
        if need and depth < 22:
            rec(t0, p0, q0, tm, pm, qm, depth + 1)
            rec(tm, pm, qm, t1, p1, q1, depth + 1)
        else:
            out.append((t1, p1, q1))

    p0, q0 = seg.point(0), off(0)
    p1, q1 = seg.point(1), off(1)
    out.append((0.0, p0, q0))
    rec(0.0, p0, q0, 1.0, p1, q1, 0)
    return out


def _sample_seam_dense(seg, tol, max_seg):
    """Seam-only polyline (for distance verification), chord error < tol."""
    out = []

    def rec(t0, p0, t1, p1, depth):
        tm = 0.5 * (t0 + t1)
        pm = seg.point(tm)
        if (_seg_point_dist(pm, p0, p1) > tol or abs(p1 - p0) > max_seg) \
                and depth < 24:
            rec(t0, p0, tm, pm, depth + 1)
            rec(tm, pm, t1, p1, depth + 1)
        else:
            out.append(p1)

    p0, p1 = seg.point(0), seg.point(1)
    out.append(p0)
    rec(0.0, p0, 1.0, p1, 0)
    return out


# ===========================================================================
# per-panel offset construction
# ===========================================================================
class PanelGeo:
    """One panel: seam curves, allowance loop, notches, placement anchors."""

    def __init__(self, name, panel):
        self.name = name
        self.segs = [walklib.edge_curve(panel['vertices'], e)
                     for e in panel['edges']]
        self.notches = []   # list of [(p0, p1)] line segments (seam coords)
        self._build()

    # -- seam ---------------------------------------------------------------
    def _build(self):
        # dense seam ring for all distance checks (VERIFY_TOL sagitta)
        ring = []
        for seg in self.segs:
            ring.extend(_sample_seam_dense(seg, VERIFY_TOL, 0.1)[:-1])
        self.seam_ring = ring
        self.orient = 1.0 if _signed_area(ring) > 0 else -1.0
        arr = np.array([[p.real, p.imag] for p in ring])
        self.seam_arr = arr
        self.seam_tree = cKDTree(arr)
        self.mpl_path = MplPath(arr)

        self._offset_loop()

    def _dist_to_seam(self, q):
        """Exact min distance from q to the dense seam ring polyline."""
        idxs = self.seam_tree.query_ball_point((q.real, q.imag), ALLOW + 0.3)
        if not idxs:
            d, i = self.seam_tree.query((q.real, q.imag))
            idxs = [int(i)]
        n = len(self.seam_ring)
        best = math.inf
        seen = set()
        for i in idxs:
            for j in (i - 1, i):
                j %= n
                if j in seen:
                    continue
                seen.add(j)
                d = _seg_point_dist(q, self.seam_ring[j],
                                    self.seam_ring[(j + 1) % n])
                if d < best:
                    best = d
        return best

    # -- allowance loop -------------------------------------------------------
    def _offset_loop(self):
        n_edges = len(self.segs)
        raw = []              # dicts: k(kind) q(point) e(edge)
        self.corners = []     # per-vertex report records

        for i, seg in enumerate(self.segs):
            for (t, p, q) in _sample_edge(seg, self.orient, ALLOW):
                raw.append({'k': 's', 'q': q, 'e': i})

            nxt = self.segs[(i + 1) % n_edges]
            v = seg.point(1)
            ta, tb = _tangent(seg, 1.0), _tangent(nxt, 0.0)
            turn = _cross(ta, tb)
            na = ta * complex(0, -1) * self.orient
            nb = tb * complex(0, -1) * self.orient
            qa, qb = v + ALLOW * na, v + ALLOW * nb
            ang = math.degrees(math.atan2(turn, ta.real * tb.real
                                          + ta.imag * tb.imag))
            if abs(qa - qb) < 2 * SAMPLE_TOL:
                self.corners.append({'edge': i, 'type': 'smooth',
                                     'turn_deg': round(ang, 2)})
            elif turn * self.orient > 0:  # convex: offset lines diverge
                m = _line_intersect(qa, ta, qb, tb)
                miter_len = abs(m - v) if m is not None else math.inf
                if m is not None and miter_len <= MITER_LIMIT * ALLOW:
                    raw.append({'k': 'm', 'q': m, 'e': i})
                    self.corners.append({'edge': i, 'type': 'miter',
                                         'turn_deg': round(ang, 2),
                                         'miter_mm': round(miter_len * 10, 2)})
                else:  # sharp spike (interior < ~29deg): boxed, cut straight
                    self.corners.append({'edge': i, 'type': 'boxed',
                                         'turn_deg': round(ang, 2)})
            else:  # concave (dart wedge, inner corner): chains cross; trimmed
                self.corners.append({'edge': i, 'type': 'concave-trim',
                                     'turn_deg': round(ang, 2)})

        # prune points that dive under the allowance distance (dart wedges):
        # the surviving boundary is exactly the true offset of the panel
        valid = [self._dist_to_seam(r['q']) >= ALLOW - PRUNE_EPS for r in raw]
        N = len(raw)
        loop = []
        self.trim_junctions = 0
        self.bevel_gaps = 0
        if all(valid):
            loop = list(raw)
        else:
            # walk circularly from a valid index; on each invalid run find
            # the exact crossing of the two chains near the gap and replace
            # the whole run with that single junction point
            start = next(k for k in range(N) if valid[k])
            order = [(start + k) % N for k in range(N)]
            k = 0
            while k < N:
                idx = order[k]
                if valid[idx]:
                    loop.append(raw[idx])
                    k += 1
                    continue
                run = []
                while k < N and not valid[order[k]]:
                    run.append(order[k])
                    k += 1
                # find crossing between chain windows around gap ends
                W = 12
                a_ids = [(run[0] - 1 - d) % N for d in range(W)][::-1] \
                    + run[:W]
                b_ids = run[-W:] + [(run[-1] + 1 + d) % N for d in range(W)]
                hit = None
                for ai in range(len(a_ids) - 1):
                    a1, a2 = raw[a_ids[ai]]['q'], raw[a_ids[ai + 1]]['q']
                    for bi in range(len(b_ids) - 1):
                        if {a_ids[ai], a_ids[ai + 1]} & {b_ids[bi],
                                                         b_ids[bi + 1]}:
                            continue
                        x = _seg_intersect(a1, a2, raw[b_ids[bi]]['q'],
                                           raw[b_ids[bi + 1]]['q'])
                        if x is not None:
                            hit = x
                            break
                    if hit is not None:
                        break
                if hit is not None:
                    loop.append({'k': 'j', 'q': hit, 'e': raw[run[0]]['e']})
                    self.trim_junctions += 1
                else:  # no crossing found: cut straight across the gap
                    self.bevel_gaps += 1

        self.cut_loop = loop

        # sanity: outward offset must ENLARGE the panel
        area_seam = abs(_signed_area(self.seam_ring))
        area_cut = abs(_signed_area([r['q'] for r in loop]))
        assert area_cut > area_seam, \
            f'{self.name}: offset shrank the panel (normal flipped?)'

    # -- verification ---------------------------------------------------------
    def verify_offset(self):
        """Perpendicular distance of the allowance line to the seam line.

        Smooth-band points must sit at ALLOW +- DIST_TOL; corner-region
        points (miter tips live BEYOND the allowance by design, trim
        junctions AT it) are counted and reported separately.
        """
        pts = self.cut_loop
        n = len(pts)
        # chain distance of each point to the nearest corner artifact
        special = [i for i, r in enumerate(pts) if r['k'] != 's']
        # points adjacent to an edge-to-edge join are fine (exactly ALLOW
        # from their own curve) so only artifacts span the corner region
        cum = [0.0]
        for i in range(1, n + 1):
            cum.append(cum[-1] + abs(pts[i % n]['q'] - pts[i - 1]['q']))
        total = cum[n]

        def chain_dist_to_special(i):
            if not special:
                return math.inf
            best = math.inf
            for si in special:
                d = abs(cum[i] - cum[si])
                best = min(best, d, total - d)
            return best

        smooth_dev, corner_dev = [], []
        for i, r in enumerate(pts):
            dev = self._dist_to_seam(r['q']) - ALLOW
            if r['k'] != 's' or chain_dist_to_special(i) <= CORNER_R:
                corner_dev.append(dev)
            else:
                smooth_dev.append(dev)

        assert len(smooth_dev) >= MIN_SMOOTH, \
            f'{self.name}: only {len(smooth_dev)} smooth check points'
        worst = max(abs(d) for d in smooth_dev)
        assert worst <= DIST_TOL, \
            f'{self.name}: allowance off by {worst*10:.3f}mm (> 0.05mm)'
        mm = [d * 10 for d in smooth_dev]
        return {
            'panel': self.name,
            'n_smooth': len(smooth_dev),
            'min_mm': round(min(mm), 4),
            'max_mm': round(max(mm), 4),
            'mean_mm': round(sum(mm) / len(mm), 4),
            'n_corner_pts': len(corner_dev),
            'corner_max_mm': round(max((d * 10 for d in corner_dev),
                                       default=0.0), 2),
            'corners': self.corners,
            'trim_junctions': self.trim_junctions,
            'bevel_gaps': self.bevel_gaps,
        }

    # -- notches --------------------------------------------------------------
    def add_notch(self, edge_idx, arc_pos, count):
        """count parallel 8mm lines across the band at arc position (cm).

        Returns the curve parameter of the CENTER notch (for verification).
        """
        seg = self.segs[edge_idx]
        L = seg.length()
        positions = [arc_pos + (k - (count - 1) / 2) * NOTCH_GAP
                     for k in range(count)]
        for s in positions:
            s = min(max(s, 0.3), L - 0.3)
            t = seg.ilength(s)
            p = seg.point(t)
            nrm = _tangent(seg, t) * complex(0, -1) * self.orient
            self.notches.append((p, p + NOTCH_LEN * nrm))
        return seg.ilength(min(max(arc_pos, 0.3), L - 0.3))

    # -- placement helpers ----------------------------------------------------
    def cut_bbox(self):
        xs = [r['q'].real for r in self.cut_loop]
        ys = [r['q'].imag for r in self.cut_loop]
        return min(xs), min(ys), max(xs), max(ys)

    def inside(self, x, y):
        return self.mpl_path.contains_point((x, y))


# ===========================================================================
# notches from the stitch graph
# ===========================================================================
def _panel_side(name):
    n = name.lower()
    if any(h in n or n.endswith(h) for h in BACK_HINTS):
        return 'back'
    if any(h in n or n.endswith(h) for h in FRONT_HINTS):
        return 'front'
    return 'front'


def _base_name(name):
    for pre in ('left_', 'right_'):
        if name.startswith(pre):
            return name[len(pre):]
    return name


def _arc_ratio(seg, t, n=2048):
    """Arc-length ratio at parameter t, by plain chord integration.

    Deliberately INDEPENDENT of svgpathtools ilength/length (which invert
    each other and would verify nothing): a fixed uniform chord sum, so the
    reported per-pair difference is a real cross-check, not an echo.
    """
    ts = np.linspace(0.0, 1.0, n + 1)
    pts = np.array([seg.point(x) for x in ts])
    chords = np.abs(np.diff(pts))
    total = chords.sum()
    k = int(t * n)
    part = chords[:k].sum()
    if k < n:  # fractional remainder of the chord t falls in
        part += abs(seg.point(t) - pts[k])
    return part / total


def build_notches(pattern, geos):
    """Place matched notches for every panel-to-panel stitch pair.

    Returns per-pair records with the re-measured arc-ratio difference in
    mm (must be < 1mm) plus the counts of skipped dart/short pairs.
    """
    records = []
    darts = 0
    short = 0
    # GarmentCode emits panels/stitches in nondeterministic order (measured
    # 2026-08-01: two runs, identical geometry, shuffled dicts). Everything
    # here iterates in canonical order so the print pack is byte-stable.
    # A stitch is two sides and, when the generator wants the right side of
    # one piece against the WRONG side of the other, a third entry that is a
    # bare string (connector.py:173). Iterating all three asked a string for
    # its 'panel' and took the whole print pack down with a TypeError, on
    # every lapel in the vocabulary, 38 of the first 384 cells driven. The
    # seam walk never saw it because it reads stitch[0] and stitch[1] by hand.
    stitches = sorted(pattern['stitches'],
                      key=lambda s: sorted((e['panel'], e['edge'])
                                           for e in s[:2]))
    for stitch in stitches:
        sa, sb = sorted(stitch[:2], key=lambda e: (e['panel'], e['edge']))
        if sa['panel'] == sb['panel']:
            darts += 1  # dart: marked by its wedge, not notched
            continue
        ga, gb = geos[sa['panel']], geos[sb['panel']]
        seg_a, seg_b = ga.segs[sa['edge']], gb.segs[sb['edge']]
        la, lb = seg_a.length(), seg_b.length()
        if min(la, lb) < MIN_NOTCH_EDGE:
            short += 1  # a 6mm stub needs no matching notch
            continue

        # notch class from the sewing side (industry convention):
        # front seams 1, back seams 2, center-back 3
        side_a, side_b = _panel_side(sa['panel']), _panel_side(sb['panel'])
        if side_a == 'back' and side_b == 'back':
            cb = (_base_name(sa['panel']) == _base_name(sb['panel'])
                  and sa['panel'] != sb['panel'])
            count = 3 if cb else 2
        else:
            count = 1

        fracs = [1 / 3, 2 / 3] if min(la, lb) > LONG_EDGE else [0.5]
        worst = 0.0
        for f in fracs:
            ta = ga.add_notch(sa['edge'], f * la, count)
            tb = gb.add_notch(sb['edge'], f * lb, count)
            # deed-style re-measure: take the PLACED parameter and get its
            # arc ratio back by independent chord integration on each edge
            ra, rb = _arc_ratio(seg_a, ta), _arc_ratio(seg_b, tb)
            worst = max(worst, abs(ra - rb) * min(la, lb) * 10.0)
        rec = {
            'a': f"{sa['panel']}[{sa['edge']}]",
            'b': f"{sb['panel']}[{sb['edge']}]",
            'len_a_mm': round(la * 10, 1), 'len_b_mm': round(lb * 10, 1),
            'notch': {1: 'single', 2: 'double', 3: 'triple'}[count],
            'positions': '1/3,2/3' if len(fracs) == 2 else 'mid',
            'ratio_diff_mm': round(worst, 4),
        }
        assert worst < 1.0, f'notch mismatch {worst:.3f}mm on {rec}'
        records.append(rec)
    return records, darts, short


# ===========================================================================
# panel drawing (local, y-flipped-for-paper coordinates)
# ===========================================================================
def clip_half(points, axis, eps=1e-9):
    """A closed polyline cut down to the half-plane x <= axis.

    Sutherland-Hodgman against one edge. This is what draws a piece that is
    cut on the fold: the drawing is the half, and the edge that lands on the
    fold carries NO seam allowance, because there is no seam there — the
    cloth runs continuously through it.
    """
    out, n = [], len(points)
    for i in range(n):
        cur, nxt = points[i], points[(i + 1) % n]
        cur_in, nxt_in = cur.real <= axis + eps, nxt.real <= axis + eps
        if cur_in:
            out.append(cur)
        if cur_in != nxt_in:
            t = (axis - cur.real) / (nxt.real - cur.real)
            out.append(complex(axis, cur.imag + t * (nxt.imag - cur.imag)))
    return out


class PanelArt:
    """Render-ready panel: polylines + texts in local paper coords (y down),
    origin at the top-left of the cut bounding box."""

    def __init__(self, geo, piece_no, piece_total, size_label, date_str,
                 cut_note='1 kes', fold_axis=None, human=None):
        self.name = geo.name
        self.human = human or geo.name
        self.fold = fold_axis is not None

        cut_pts = [r['q'] for r in geo.cut_loop]
        seam_pts = list(geo.seam_ring)
        notch_pts = list(geo.notches)
        if self.fold:
            cut_pts = clip_half(cut_pts, fold_axis)
            seam_pts = clip_half(seam_pts, fold_axis)
            notch_pts = [(a, b) for a, b in notch_pts
                         if 0.5 * (a.real + b.real) <= fold_axis + 1e-9]

        x0 = min(p.real for p in cut_pts)
        y1 = max(p.imag for p in cut_pts)
        self.w = max(p.real for p in cut_pts) - x0
        self.h = y1 - min(p.imag for p in cut_pts)

        def loc(p):
            return (p.real - x0, y1 - p.imag)

        self.cut = [loc(p) for p in cut_pts]
        self.seam = [loc(p) for p in seam_pts]
        self.notches = [(loc(a), loc(b)) for a, b in notch_pts]
        self.texts = []   # (x, y, size, text, anchor, rotation)
        self.lines = []   # grainline + arrowheads, list of (p0, p1)
        self.fold_edge = []   # the line the cloth is folded through

        if self.fold:
            on = [p for p in cut_pts if abs(p.real - fold_axis) <= 1e-7]
            if len(on) >= 2:
                self.fold_edge = [loc(min(on, key=lambda p: p.imag)),
                                  loc(max(on, key=lambda p: p.imag))]

        # grainline: vertical (local y = lengthwise grain), ~60% of height,
        # kept inside the seam outline
        cx = sum(p.real for p in seam_pts) / len(seam_pts)
        cy = sum(p.imag for p in seam_pts) / len(seam_pts)
        gx = cx - 0.18 * self.w
        half = 0.30 * self.h
        for _ in range(14):
            # the whole arrow must stay inside (darts cut wedges OUT of the
            # panel, so endpoints alone are not enough)
            probes = [cy + half * k / 3 for k in range(-3, 4)]
            if all(geo.inside(gx, py) for py in probes):
                break
            if not geo.inside(gx, cy):
                gx = 0.5 * (gx + cx)
            half *= 0.82
        if half >= 0.8:
            a, b = loc(complex(gx, cy - half)), loc(complex(gx, cy + half))
            self.lines.append((a, b))
            for tip, sgn in ((a, 1.0), (b, -1.0)):
                self.lines.append((tip, (tip[0] - 0.35, tip[1] + sgn * 0.6)))
                self.lines.append((tip, (tip[0] + 0.35, tip[1] + sgn * 0.6)))

        # Label block, on the roomiest point INSIDE the piece. The seam
        # centroid is not that point: an armhole scoops a bodice into an L and
        # the centroid of an L falls outside it, which is how the front bodice
        # came to have its own name printed across its own cut line.
        fs = min(0.75, max(0.38, 0.011 * min(self.w * 4, self.h * 8)))

        def room_at(px, py):
            if not geo.inside(px, py):
                return -1.0
            d = float(geo.seam_tree.query((px, py))[0])
            return min(d, fold_axis - px) if self.fold else d

        # first choice: on the grainline, clear of the arrow. The arrow and
        # the roomiest point of a panel are the same place, so searching for
        # room alone puts the text through the arrow.
        ax = ay = None
        if half >= 0.8:
            for cand in (cy - half - 2.2 * fs, cy + half + 2.2 * fs):
                if room_at(gx, cand) > 1.4 * fs:
                    ax, ay = gx, cand
                    break
        if ax is None:
            ax, ay, room = cx, cy, -1.0
            xs = np.linspace(min(p.real for p in seam_pts),
                             max(p.real for p in seam_pts), 45)
            ys = np.linspace(min(p.imag for p in seam_pts),
                             max(p.imag for p in seam_pts), 45)
            for px in xs:
                for py in ys:
                    d = room_at(px, py)
                    if d > room:
                        ax, ay, room = px, py, d
        lx, ly = loc(complex(ax, ay))
        rows = [
            (self.human, fs * 1.15),
            (f'parca {piece_no}/{piece_total} · {size_label} · {cut_note}',
             fs * 0.9),
            (f'stitchu · {date_str} · pay 10mm dahil', fs * 0.75),
        ]
        # Helvetica averages about half the point size per character. The
        # block is shrunk to fit the piece and then pulled back inside it:
        # a centred label anchored near an edge hangs half of itself over the
        # cut line, which is how 'etek arka' came to start outside its own
        # skirt.
        def block_w(rs):
            return max(0.5 * s * len(t) for t, s in rs)

        room_w = max(0.92 * self.w, 1.0)
        if block_w(rows) > room_w:
            k = room_w / block_w(rows)
            rows = [(t, s * k) for t, s in rows]
        half_w = 0.5 * block_w(rows)
        lx = min(max(lx, half_w + 0.2), max(self.w - half_w - 0.2,
                                            half_w + 0.2))

        ty = ly - 0.5 * sum(r[1] * 1.5 for r in rows)
        for txt, s in rows:
            ty += s * 1.5
            self.texts.append((lx, ty, s, txt, 'middle', 0.0))

        # The fold edge is named ALONG the edge and INSIDE the piece. Outside
        # it reads as belonging to whatever panel is packed next to it, and a
        # fold edge mistaken for a cut edge loses the whole piece.
        if self.fold_edge:
            (fx, fya), (_, fyb) = self.fold_edge
            self.texts.append((fx - 0.55 * fs, 0.5 * (fya + fyb), fs * 0.85,
                               'KATLAMA — buradan katla, dikis payi yok',
                               'middle', -90.0))

    # -- svg ------------------------------------------------------------------
    def svg(self, ox, oy):
        def pts(seq):
            return ' '.join(f'{ox+x:.3f},{oy+y:.3f}' for x, y in seq)

        parts = [f'<polygon points="{pts(self.cut)}" fill="none" '
                 'stroke="black" stroke-width="0.06"/>',
                 f'<polygon points="{pts(self.seam)}" fill="none" '
                 'stroke="black" stroke-width="0.025" '
                 'stroke-dasharray="0.6,0.35"/>']
        if self.fold_edge:
            (ax, ay), (bx, by) = self.fold_edge
            parts.append(f'<line x1="{ox+ax:.3f}" y1="{oy+ay:.3f}" '
                         f'x2="{ox+bx:.3f}" y2="{oy+by:.3f}" '
                         'stroke="black" stroke-width="0.09" '
                         'stroke-dasharray="1.8,0.5,0.35,0.5"/>')
        for a, b in self.notches:
            parts.append(f'<line x1="{ox+a[0]:.3f}" y1="{oy+a[1]:.3f}" '
                         f'x2="{ox+b[0]:.3f}" y2="{oy+b[1]:.3f}" '
                         'stroke="black" stroke-width="0.05"/>')
        for a, b in self.lines:
            parts.append(f'<line x1="{ox+a[0]:.3f}" y1="{oy+a[1]:.3f}" '
                         f'x2="{ox+b[0]:.3f}" y2="{oy+b[1]:.3f}" '
                         'stroke="black" stroke-width="0.04"/>')
        for x, y, s, txt, anchor, rot in self.texts:
            spin = ('' if abs(rot) < 1e-9 else
                    f' transform="rotate({rot:.1f} {ox+x:.3f} {oy+y:.3f})"')
            parts.append(f'<text x="{ox+x:.3f}" y="{oy+y:.3f}" '
                         f'font-size="{s:.3f}" text-anchor="{anchor}" '
                         'font-family="Helvetica, Arial, sans-serif" '
                         f'fill="black"{spin}>{txt}</text>')
        return '\n'.join(parts)


# ===========================================================================
# shelf packing (plain shelves: enough here, no hole-filling heroics)
# ===========================================================================
def shelf_pack(items, bin_w, bin_h):
    """items: [(key, w, h)] -> (pages, positions{key: (page, x, y)}).

    Deterministic: sorted by height desc then name.
    """
    items = sorted(items, key=lambda it: (-it[2], it[0]))
    pages = []  # each: {'shelves': [(y, height, x_cursor)], 'used_h': float}
    pos = {}
    for key, w, h in items:
        if w > bin_w or h > bin_h:
            raise ValueError(f'{key} ({w:.1f}x{h:.1f}cm) exceeds the bin')
        placed = False
        for pi, page in enumerate(pages):
            for si, (sy, sh, sx) in enumerate(page['shelves']):
                if h <= sh and sx + w <= bin_w:
                    pos[key] = (pi, sx, sy)
                    page['shelves'][si] = (sy, sh, sx + w + GAP)
                    placed = True
                    break
            if placed:
                break
            if page['used_h'] + h <= bin_h:
                sy = page['used_h']
                pos[key] = (pi, 0.0, sy)
                page['shelves'].append((sy, h + GAP, w + GAP))
                page['used_h'] = sy + h + GAP
                placed = True
                break
        if not placed:
            pages.append({'shelves': [(0.0, h + GAP, w + GAP)],
                          'used_h': h + GAP})
            pos[key] = (len(pages) - 1, 0.0, 0.0)
    return len(pages), pos


# ===========================================================================
# page rendering
# ===========================================================================
def _svg_doc(w_cm, h_cm, body):
    # 1 user unit == 1cm: width in pt over a cm viewBox. THE 1:1 guarantee.
    return (f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'width="{w_cm * CM_PT:.4f}pt" height="{h_cm * CM_PT:.4f}pt" '
            f'viewBox="0 0 {w_cm} {h_cm}">\n{body}\n</svg>\n')


def _cross_mark(x, y, arm=0.4):
    return (f'<line x1="{x-arm:.3f}" y1="{y:.3f}" x2="{x+arm:.3f}" '
            f'y2="{y:.3f}" stroke="black" stroke-width="0.03"/>'
            f'<line x1="{x:.3f}" y1="{y-arm:.3f}" x2="{x:.3f}" '
            f'y2="{y+arm:.3f}" stroke="black" stroke-width="0.03"/>')


def _text(x, y, s, txt, anchor='start', weight='normal'):
    return (f'<text x="{x:.3f}" y="{y:.3f}" font-size="{s:.3f}" '
            f'text-anchor="{anchor}" font-weight="{weight}" '
            f'font-family="Helvetica, Arial, sans-serif" '
            f'fill="black">{txt}</text>')


def _test_square(x, y):
    # the scale oath: exactly 4cm — as pt this MUST be 113.386
    sq_pt = 4 * CM_PT
    assert abs(sq_pt - 113.386) < 1e-3, f'test square {sq_pt}pt != 113.386pt'
    return (f'<rect x="{x}" y="{y}" width="4" height="4" fill="none" '
            'stroke="black" stroke-width="0.05"/>'
            + _text(x + 2, y + 2.15, 0.55, '4 cm', 'middle')
            + _text(x + 2, y + 4.6, 0.35, 'tam 4 cm olmali (olcek %100)',
                    'middle'))


def _row_code(r):
    """0->A, 25->Z, 26->AA ... (a klos maxi easily passes 26 rows)."""
    code = ''
    r += 1
    while r > 0:
        r, rem = divmod(r - 1, 26)
        code = chr(65 + rem) + code
    return code


def render_a0_pages(arts, size_label, date_str):
    """Shelf-packed A0 sheets; panels too big for ONE A0 (a klos maxi skirt
    is 200cm+ wide) are tiled over several A0 sheets with the same overlap
    and crosses as the A4 booklet — never scaled, never dropped."""
    usable_w, usable_h = A0_W - 2 * MARGIN, A0_H - 2 * MARGIN - A0_HEADER
    fits = {n: a for n, a in arts.items()
            if a.w <= usable_w and a.h <= usable_h}
    big = {n: a for n, a in arts.items() if n not in fits}

    svgs = []
    n_shelf = 0
    if fits:
        items = [(a.name, a.w, a.h) for a in fits.values()]
        n_shelf, pos = shelf_pack(items, usable_w, usable_h)
        for pi in range(n_shelf):
            body = [_text(MARGIN, MARGIN + 0.9, 0.8,
                          f'stitchu · {size_label} · A0 1:1 · sayfa '
                          f'{pi + 1}/{n_shelf} · {date_str}', weight='bold'),
                    _text(MARGIN, MARGIN + 1.9, 0.45,
                          'kesim cizgisi duz, dikis cizgisi kesikli · '
                          'pay 10mm dahil'),
                    _test_square(A0_W - MARGIN - 10.5, MARGIN)]
            oy0 = MARGIN + A0_HEADER
            for name, art in fits.items():
                p, x, y = pos[name]
                if p == pi:
                    body.append(art.svg(MARGIN + x, oy0 + y))
            svgs.append(_svg_doc(A0_W, A0_H, '\n'.join(body)))

    n_tiled = 0
    for name in sorted(big):
        tile_svgs, _, _, live = render_tiled(
            {name: big[name]}, size_label, date_str, A0_W, A0_H,
            with_map=False, note=f'{name} (tek A0 sheete sigmiyor, '
                                 'bindirmeli dosendi)')
        svgs.extend(tile_svgs)
        n_tiled += live
    return svgs, n_shelf, n_tiled


def render_tiled(arts, size_label, date_str, page_w, page_h,
                 with_map=True, note=''):
    """1:1 tiling of packed panels over page_w x page_h sheets with OVERLAP,
    alignment crosses and A1/B2 page codes. Any panel size prints: the
    virtual sheet is widened to the widest panel."""
    pw, ph = page_w - 2 * MARGIN, page_h - 2 * MARGIN      # printable
    sw, sh = pw - OVERLAP, ph - OVERLAP                    # tiling stride
    virt_w = max(4 * sw - GAP, max(a.w for a in arts.values()) + 0.1)
    _, pos = shelf_pack([(a.name, a.w, a.h) for a in arts.values()],
                        virt_w, 10 ** 9)
    used_w = max(pos[n][1] + a.w for n, a in arts.items())
    used_h = max(pos[n][2] + a.h for n, a in arts.items())
    cols = max(1, math.ceil((used_w - OVERLAP) / sw))
    rows = max(1, math.ceil((used_h - OVERLAP) / sh))

    place = {n: (x, y) for n, (p, x, y) in pos.items()}  # single virtual bin

    def cell_panels(r, c):
        vx, vy = c * sw, r * sh
        return [n for n, a in arts.items()
                if place[n][0] < vx + pw and place[n][0] + a.w > vx
                and place[n][1] < vy + ph and place[n][1] + a.h > vy]

    live = {(r, c) for r in range(rows) for c in range(cols)
            if cell_panels(r, c)}

    svgs = []

    # --- page 1: test square + page map (A4 booklet only) ---------------------
    if with_map:
        body = [_text(MARGIN, MARGIN + 0.9, 0.7,
                      f'stitchu · {size_label} · A4 1:1 · {date_str}',
                      weight='bold'),
                _text(MARGIN, MARGIN + 1.7, 0.4,
                      f'{len(live)} icerik sayfasi ({rows} satir x {cols} '
                      f'sutun; bos kalan {rows * cols - len(live)} hucre '
                      'basilmadi) · bindirme 10mm · kesim duz, dikis kesikli'),
                _text(MARGIN, MARGIN + 2.4, 0.4,
                      'once bu kareyi olc; 4 cm degilse yazici olcekliyor '
                      'demektir (%100 / actual size sec)'),
                _test_square(MARGIN, MARGIN + 3.2)]
        # page map: the whole virtual sheet, scaled into the lower half
        map_y = MARGIN + 9.5
        scale = min(pw / used_w, (page_h - MARGIN - map_y) / used_h)
        body.append(_text(MARGIN, map_y - 0.4, 0.4,
                          'yerlesim haritasi (hangi panel hangi sayfada):'))
        for r in range(rows):
            for c in range(cols):
                if (r, c) not in live:
                    continue
                x, y = MARGIN + c * sw * scale, map_y + r * sh * scale
                body.append(f'<rect x="{x:.3f}" y="{y:.3f}" '
                            f'width="{pw * scale:.3f}" '
                            f'height="{ph * scale:.3f}" '
                            'fill="none" stroke="#999999" '
                            'stroke-width="0.015"/>')
                body.append(f'<text x="{x + 0.12:.3f}" y="{y + 0.45:.3f}" '
                            'font-size="0.3" fill="#777777" '
                            'font-family="Helvetica, Arial, sans-serif">'
                            f'{_row_code(r)}{c + 1}</text>')
        for name, art in arts.items():
            x, y = place[name]
            body.append(f'<rect x="{MARGIN + x * scale:.3f}" '
                        f'y="{map_y + y * scale:.3f}" '
                        f'width="{art.w * scale:.3f}" '
                        f'height="{art.h * scale:.3f}" fill="none" '
                        'stroke="black" stroke-width="0.03"/>')
            body.append(_text(MARGIN + (x + art.w / 2) * scale,
                              map_y + (y + art.h / 2) * scale, 0.22,
                              name, 'middle'))
        svgs.append(_svg_doc(page_w, page_h, '\n'.join(body)))

    # --- content pages (empty grid cells are skipped) -------------------------
    for r in range(rows):
        for c in range(cols):
            if (r, c) not in live:
                continue
            vx, vy = c * sw, r * sh          # virtual window origin
            tx, ty = MARGIN - vx, MARGIN - vy
            code = f'{_row_code(r)}{c + 1}'
            body = [f'<clipPath id="clip"><rect x="{MARGIN}" y="{MARGIN}" '
                    f'width="{pw}" height="{ph}"/></clipPath>',
                    f'<g clip-path="url(#clip)">'
                    f'<g transform="translate({tx:.3f},{ty:.3f})">']
            for name in cell_panels(r, c):
                body.append(arts[name].svg(*place[name]))
            body.append('</g></g>')
            # alignment crosses on the shared overlap center lines
            xl, xr = MARGIN + OVERLAP / 2, MARGIN + pw - OVERLAP / 2
            yt, yb = MARGIN + OVERLAP / 2, MARGIN + ph - OVERLAP / 2
            for x, y in ((xl, yt), (xr, yt), (xl, yb), (xr, yb)):
                body.append(_cross_mark(x, y))
            body.append(f'<rect x="{xl}" y="{yt}" width="{xr-xl:.3f}" '
                        f'height="{yb-yt:.3f}" fill="none" stroke="black" '
                        'stroke-width="0.015" stroke-dasharray="0.9,0.5"/>')
            body.append(_text(MARGIN + 1.0, MARGIN + 1.15, 0.55, code,
                              weight='bold'))
            tag = f'stitchu {size_label} 1:1'
            if note:
                tag += f' · {note}'
            body.append(_text(page_w - MARGIN - 1.0, MARGIN + 1.05, 0.3,
                              tag, 'end'))
            svgs.append(_svg_doc(page_w, page_h, '\n'.join(body)))
    return svgs, rows, cols, len(live)


# ===========================================================================
# multi-page PDF: cairosvg draws each page SVG onto ONE shared cairo PDF
# surface (CairoSVG itself is single-page; its own cairocffi engine is not)
# ===========================================================================
def svgs_to_pdf(svgs, pdf_path, date_str):
    import cairocffi as cairo
    from cairosvg.parser import Tree
    from cairosvg.surface import PDFSurface

    shared = {'surface': None}

    class MultiPagePDF(PDFSurface):
        def _create_surface(self, width, height):
            if shared['surface'] is None:
                surface = cairo.PDFSurface(str(pdf_path), width, height)
                # pin the creation date: without this, cairo stamps wall
                # time and two identical runs differ in PDF bytes
                surface.set_metadata(cairo.PDF_METADATA_CREATE_DATE,
                                     f'{date_str}T00:00:00Z')
                shared['surface'] = surface
            else:
                shared['surface'].set_size(width, height)
            return shared['surface'], width, height

        def finish(self):
            self.cairo.show_page()  # next page, do NOT close the surface

    for svg in svgs:
        MultiPagePDF(Tree(bytestring=svg.encode()), None, 96).finish()
    shared['surface'].finish()


# ===========================================================================
# report
# ===========================================================================
def report_txt(offset_stats, notch_records, dart_pairs, short_pairs,
               pages_info, svg_hash, size_label, date_str, plan):
    lines = [
        'PRINT PACK (baski tapusu) — allowance, notches, pagination: '
        'measured, not claimed',
        f'size: {size_label}   date: {date_str}   allowance: 10mm   '
        f'scale: 1cm = {CM_PT:.4f}pt',
        '',
    ] + cutplan.report_lines(plan) + [
        '',
        'SEAM ALLOWANCE — perpendicular distance of the cut line to the '
        'seam line',
        f'(smooth band target 10.00mm +- {DIST_TOL*10:.2f}mm; corner '
        'points listed apart: miter tips sit BEYOND 10mm by design)',
        f"{'panel':<16} {'n':>5} {'min mm':>8} {'max mm':>8} {'mean mm':>8} "
        f"{'corner pts':>10}  corner closure",
        '-' * 96,
    ]
    for s in offset_stats:
        kinds = {}
        for c in s['corners']:
            kinds[c['type']] = kinds.get(c['type'], 0) + 1
        closure = ', '.join(f'{v}x {k}' for k, v in sorted(kinds.items()))
        if s['trim_junctions']:
            closure += f" ({s['trim_junctions']} trim junction"
            closure += 's)' if s['trim_junctions'] > 1 else ')'
        if s['bevel_gaps']:
            closure += f", {s['bevel_gaps']} bevel gap"
        lines.append(
            f"{s['panel']:<16} {s['n_smooth']:>5} "
            f"{10 + s['min_mm']:>8.3f} {10 + s['max_mm']:>8.3f} "
            f"{10 + s['mean_mm']:>8.3f} {s['n_corner_pts']:>10}  {closure}")
    lines += [
        '',
        'NOTCHES — from the stitch graph, matched at equal arc ratios',
        '(front seams single, back double, center-back triple; '
        f'{dart_pairs} dart pairs skipped: darts carry their wedge, '
        f'not a notch; {short_pairs} sub-3cm stub pairs skipped)',
        '(ratio diff re-measured by independent chord integration, '
        'must be < 1mm)',
        f"{'notch':<8} {'pos':<8} {'ratio diff mm':>13}  pair",
        '-' * 96,
    ]
    for r in notch_records:
        lines.append(f"{r['notch']:<8} {r['positions']:<8} "
                     f"{r['ratio_diff_mm']:>13.4f}  "
                     f"{r['a']} {r['len_a_mm']}mm <-> "
                     f"{r['b']} {r['len_b_mm']}mm")
    lines += [
        '',
        'PAGES',
        f"  A0: {pages_info['a0_shelf']} shelf-packed page(s)"
        + (f" + {pages_info['a0_tiled']} tiled A0 page(s) for panels "
           'bigger than one sheet' if pages_info['a0_tiled'] else
           ' (a full dress does not fit ONE A0)')
        + '; every shelf page carries a test square',
        f"  A4: 1 map page + {pages_info['a4_live']} content pages "
        f"(grid {pages_info['a4_rows']}x{pages_info['a4_cols']}, "
        f"{pages_info['a4_rows'] * pages_info['a4_cols'] - pages_info['a4_live']} empty cells skipped), "
        f'10mm overlap, page codes A1..'
        f"{_row_code(pages_info['a4_rows'] - 1)}{pages_info['a4_cols']}",
        f'  test square: 4cm = {4 * CM_PT:.4f}pt (assert 113.386pt PASSED '
        'in code)',
        '',
        f'determinism: sha256 over all page SVGs = {svg_hash}',
        '(two runs of the same state must print the same hash; the PDF '
        'creation date is pinned to the label date, so same-day runs are '
        'byte-identical PDFs too)',
    ]
    return '\n'.join(lines) + '\n'


# ===========================================================================
# entry point
# ===========================================================================
def build(out_dir, spec_path, size_label, date_str=None):
    """spec -> print-a0.pdf, print-a4.pdf, print-report.txt in out_dir."""
    out_dir = Path(out_dir)
    date_str = date_str or datetime.date.today().isoformat()
    with open(spec_path) as f:
        pattern = json.load(f)['pattern']
    panels = pattern['panels']

    # canonical panel order: the spec dict order is not deterministic
    names = sorted(panels)
    geos = {name: PanelGeo(name, panels[name]) for name in names}
    notch_records, dart_pairs, short_pairs = build_notches(pattern, geos)
    offset_stats = [geos[n].verify_offset() for n in names]

    # how many of each piece, and from what fold — measured off the outlines
    plan = cutplan.derive(names, geos)
    drawn = [n for n in names if plan[n]['printed']]
    total = len(drawn)
    arts = {name: PanelArt(geos[name], i + 1, total, size_label, date_str,
                           cut_note=plan[name]['label'],
                           fold_axis=(plan[name].get('fold_axis')
                                      if plan[name]['fold'] else None),
                           human=seamrules.human_name(name, panels[name]))
            for i, name in enumerate(drawn)}

    a0_svgs, a0_shelf, a0_tiled = render_a0_pages(arts, size_label, date_str)
    a4_svgs, rows, cols, a4_live = render_tiled(arts, size_label, date_str,
                                                A4_W, A4_H, with_map=True)

    svg_dir = out_dir / 'print-svg'
    svg_dir.mkdir(exist_ok=True)
    h = hashlib.sha256()
    for i, svg in enumerate(a0_svgs):
        (svg_dir / f'a0-page{i + 1}.svg').write_text(svg)
        h.update(svg.encode())
    for i, svg in enumerate(a4_svgs):
        (svg_dir / f'a4-page{i + 1}.svg').write_text(svg)
        h.update(svg.encode())

    svgs_to_pdf(a0_svgs, out_dir / 'print-a0.pdf', date_str)
    svgs_to_pdf(a4_svgs, out_dir / 'print-a4.pdf', date_str)

    txt = report_txt(offset_stats, notch_records, dart_pairs, short_pairs,
                     {'a0_shelf': a0_shelf, 'a0_tiled': a0_tiled,
                      'a4_rows': rows, 'a4_cols': cols, 'a4_live': a4_live},
                     h.hexdigest(), size_label, date_str, plan)
    (out_dir / 'print-report.txt').write_text(txt)
    return {
        'print_a0': out_dir / 'print-a0.pdf',
        'print_a4': out_dir / 'print-a4.pdf',
        'print_report': out_dir / 'print-report.txt',
    }


def main():
    ap = argparse.ArgumentParser(
        description='GarmentCode spec -> printable 1:1 pattern pack')
    ap.add_argument('out_dir', help='dir with stitchu_specification.json; '
                                    'print files land here too')
    ap.add_argument('--size', default='EU38')
    ap.add_argument('--date', default=None)
    args = ap.parse_args()
    spec = Path(args.out_dir) / 'stitchu_specification.json'
    paths = build(args.out_dir, spec, args.size, args.date)
    print((Path(args.out_dir) / 'print-report.txt').read_text())
    for k, p in paths.items():
        print(k, p, 'OK' if Path(p).exists() else 'MISSING')


if __name__ == '__main__':
    main()
