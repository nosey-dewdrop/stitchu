# ============================================================================
# walk.py — the SEAM DEED (dikis tapusu). The same job Gerber AccuMark's
# "Walk Pieces" and CLO3D's "Check Sewing Length" do by hand, one pair at a
# time, run automatically over every pair in a specification.
#
# 2026-08-02 — THE RULE LAYER LANDED. Until today every pair was judged by
# one test, |a - b| <= 1mm, and that test was wrong in three directions:
#   · a sleeve cap is longer than the armhole by design, so a correct sleeve
#     failed
#   · abs() discards the sign, so a REVERSED shoulder passed whenever it was
#     small, and the sign is the whole check
#   · a pair we could not identify was measured by the equality rule anyway
#     and passed silently
# The kinds and the bands now live in seamrules.py, with their sources. The
# checks that are about one piece rather than a pair live in panelcheck.py.
# Tolerance for an equality seam is 1/32 inch = 0.79375mm, the production
# patternmaker's standard, not the 1mm a commercial suite paints red at.
#
# HOW A SEAM IS IDENTIFIED. Not from labels: in a real specification 78 of 94
# edges carry none. The kind is derived from panel roles, from whether the two
# sides are the same panel, and from where the seam sits on the body. Every
# validator surveyed on 2026-08-02 takes both the pairing and its meaning as
# human input; this file derives the meaning from the file.
#
# Geometry, unchanged and proven:
#   line      |b - a|
#   quadratic/cubic  Bezier from RELATIVE control points
#                    (abs = a + rx*(b-a) + ry*perp(b-a), perp = (-dy, dx))
#   circle    params [radius, large_arc, right]: chord + radius -> arc angle
# Curves measured with svgpathtools .length(), the same primitive pygarment
# draws with, so our millimetres and their drawing agree.
#
# Gathered seams are read from the DESIGN params, not guessed: skirt.ruffle /
# sleeve.connect_ruffle > 1.05 means the long side is meant to be ratio x the
# short side.
#
# Verdicts:
#   PASS           the rule for this kind of seam is satisfied
#   GATHERED-PASS  the long side is the declared gather ratio of the short one
#   REPORTED       measured, but the field holds more than one position on
#                  what the right value is (cap ease)
#   UNVERIFIABLE   we could not establish what this seam is, so it was not
#                  judged. This is NOT a pass.
#   FAIL           the rule for this kind of seam is broken
# ============================================================================
import argparse
import json
from pathlib import Path

import yaml
from svgpathtools import Arc, CubicBezier, Line, QuadraticBezier

import panelcheck
import seamrules

TOL_MM = seamrules.TOL_EQUAL_MM  # 1/32 inch, the production standard


def rel_to_abs(a, b, rel):
    """Edge-local relative coords -> absolute point (pygarment convention)."""
    ex, ey = b[0] - a[0], b[1] - a[1]
    # perpendicular of the edge vector, same orientation pygarment uses
    px, py = -ey, ex
    return (a[0] + rel[0] * ex + rel[1] * px,
            a[1] + rel[0] * ey + rel[1] * py)


def edge_curve(vertices, edge):
    """Build the svgpathtools segment for one spec edge (coords in cm)."""
    a = vertices[edge['endpoints'][0]]
    b = vertices[edge['endpoints'][1]]
    ca, cb = complex(*a), complex(*b)
    curv = edge.get('curvature')
    if curv is None:
        return Line(ca, cb)
    if isinstance(curv, list):  # legacy quadratic: bare [rx, ry]
        return QuadraticBezier(ca, complex(*rel_to_abs(a, b, curv)), cb)
    if curv['type'] == 'quadratic':
        cp = rel_to_abs(a, b, curv['params'][0])
        return QuadraticBezier(ca, complex(*cp), cb)
    if curv['type'] == 'cubic':
        cps = [complex(*rel_to_abs(a, b, p)) for p in curv['params']]
        return CubicBezier(ca, *cps, cb)
    if curv['type'] == 'circle':
        radius, large_arc, right = curv['params']
        return Arc(ca, complex(radius, radius), 0.0,
                   bool(large_arc), not bool(right), cb)
    raise ValueError(f"unknown curvature type: {curv['type']}")


def edge_length_mm(panel, edge):
    return edge_curve(panel['vertices'], edge).length() * 10.0  # cm -> mm


# ---------------------------------------------------------------------------
# Gather recognition from design params.
# Panel roles come from the stable GarmentCode panel names:
#   wb_*     waistband    *skirt*  skirt    *sleeve*  sleeve    else torso
# skirt.ruffle gathers the skirt onto the waistband (or torso);
# sleeve.connect_ruffle gathers the sleeve cap into the armhole.
# ---------------------------------------------------------------------------
def panel_role(name):
    n = name.lower()
    if n.startswith('wb'):
        return 'wb'
    if 'skirt' in n:
        return 'skirt'
    if 'sleeve' in n:
        return 'sleeve'
    return 'torso'


def gather_ratios(design):
    """Extract gather ratios > 1.05 from a design dict (or None)."""
    ratios = {}
    if not design:
        return ratios
    try:
        r = float(design['skirt']['ruffle']['v'])
        if r > 1.05:
            ratios['skirt'] = r
    except (KeyError, TypeError):
        pass
    try:
        r = float(design['sleeve']['connect_ruffle']['v'])
        if r > 1.05:
            ratios['sleeve'] = r
    except (KeyError, TypeError):
        pass
    return ratios


def expected_ratio(role_a, role_b, ratios):
    roles = {role_a, role_b}
    if 'skirt' in ratios and roles == {'skirt', 'wb'}:
        return ratios['skirt']
    if 'skirt' in ratios and roles == {'skirt', 'torso'}:
        return ratios['skirt']
    if 'sleeve' in ratios and roles == {'sleeve', 'torso'}:
        return ratios['sleeve']
    return None


# ---------------------------------------------------------------------------
# Judging one pair, once its kind is known.
# ---------------------------------------------------------------------------
def _judge_pair(kind, entry, panels, sa, sb, la, lb, ratios):
    """Returns (status, detail). Armhole/cap pairs are deferred: cap ease is a
    property of the whole armhole, not of one of the three seams that make it
    up, so those are judged as a group after this pass."""
    if kind == 'armhole-cap':
        return 'DEFERRED', {'rule': 'judged with the whole armhole group'}

    if kind == 'shoulder':
        fb_a = seamrules.front_back_of(sa['panel'])
        fb_b = seamrules.front_back_of(sb['panel'])
        if fb_a == 'front' and fb_b == 'back':
            return seamrules.judge_shoulder(la, lb)
        if fb_a == 'back' and fb_b == 'front':
            return seamrules.judge_shoulder(lb, la)
        return seamrules.UNVERIFIABLE, {
            'rule': 'shoulder needs a front side and a back side',
            'detail': f'sides read as {fb_a}/{fb_b}',
        }

    if kind == 'unknown':
        return seamrules.UNVERIFIABLE, {
            'rule': 'no rule applied: the kind of this seam was not established',
        }

    # Every remaining kind is an equality seam, unless the design declares a
    # gather across these two roles.
    ratio = expected_ratio(panel_role(sa['panel']), panel_role(sb['panel']),
                           ratios)
    if ratio is not None:
        short, long_ = min(la, lb), max(la, lb)
        dev = abs(long_ - short * ratio)
        detail = {
            'rule': f'gathered: the long side is {ratio}x the short side',
            'expected_ratio': ratio,
            'measured_ratio': round(long_ / short, 4) if short else None,
            'gather_dev_mm': round(dev, 4),
        }
        if dev <= TOL_MM:
            return 'GATHERED-PASS', detail
        # A declared gather that does not hold is only a failure if the pair
        # is not simply equal; a 1.0-ratio seam between gathered roles is a
        # plain seam.
        if abs(la - lb) <= TOL_MM:
            return seamrules.PASS, {
                'rule': f'equal within {TOL_MM:.5f}mm (a gather is declared '
                        f'for these roles but this pair is not gathered)',
                'diff_mm': round(abs(la - lb), 4),
            }
        return seamrules.FAIL, detail

    return seamrules.judge_equal(la, lb)


def _judge_armhole_groups(pairs, panels):
    """Cap ease is measured over the whole armhole, per side of the body."""
    groups = {}
    for p in pairs:
        if p['kind'] != 'armhole-cap':
            continue
        side = seamrules.side_of(p['a']['panel'])
        if side == 'centre':
            side = seamrules.side_of(p['b']['panel'])
        groups.setdefault(side, []).append(p)

    reports = []
    for side, members in sorted(groups.items()):
        cap = arm = 0.0
        for p in members:
            for endpoint in ('a', 'b'):
                name = p[endpoint]['panel']
                length = p[endpoint]['len_mm']
                if seamrules.role_of(name, panels[name]) == 'sleeve':
                    cap += length
                else:
                    arm += length
        status, detail = seamrules.judge_cap_ease(cap, arm)
        detail['side'] = side
        detail['segments'] = len(members)
        reports.append({'status': status, **detail})
        for p in members:
            p['status'] = status
            p['detail'] = {
                'rule': 'part of the %s armhole; cap ease is judged over the '
                        'whole armhole, not this segment' % side,
                'group_cap_ease_mm': detail['cap_ease_mm'],
            }
    return reports


# ---------------------------------------------------------------------------
def walk(spec_path, design_path=None):
    with open(spec_path) as f:
        spec = json.load(f)
    pattern = spec['pattern']
    panels = pattern['panels']
    stitches = pattern['stitches']

    design = None
    if design_path:
        with open(design_path) as f:
            loaded = yaml.safe_load(f)
        design = loaded.get('design', loaded)
    ratios = gather_ratios(design)

    shoulder_h = seamrules.shoulder_reference_height(panels, stitches)

    pairs = []
    for stitch in stitches:
        sa, sb = stitch[0], stitch[1]
        pa, pb = panels[sa['panel']], panels[sb['panel']]
        ea, eb = pa['edges'][sa['edge']], pb['edges'][sb['edge']]
        la, lb = edge_length_mm(pa, ea), edge_length_mm(pb, eb)

        kind, why = seamrules.classify(sa['panel'], pa, ea,
                                       sb['panel'], pb, eb,
                                       shoulder_height_cm=shoulder_h)
        entry = {
            'a': {'panel': sa['panel'], 'edge': sa['edge'],
                  'len_mm': round(la, 4)},
            'b': {'panel': sb['panel'], 'edge': sb['edge'],
                  'len_mm': round(lb, 4)},
            'diff_mm': round(abs(la - lb), 4),
            'kind': kind,
            'kind_evidence': why,
        }
        status, detail = _judge_pair(kind, entry, panels, sa, sb, la, lb,
                                     ratios)
        entry['status'] = status
        entry['detail'] = detail
        pairs.append(entry)

    armholes = _judge_armhole_groups(pairs, panels)

    closed = [panelcheck.check_closed(n, p, edge_curve)
              for n, p in panels.items()]
    selfx = [panelcheck.check_self_intersection(n, p, edge_curve)
             for n, p in panels.items()]
    mirror_panels = panelcheck.check_mirror_symmetry(
        panels, edge_length_mm, seamrules.mirror_name)
    mirror_seams = panelcheck.check_stitch_mirror_symmetry(
        panels, stitches, edge_length_mm, seamrules.mirror_name)

    counts = {}
    for p in pairs:
        counts[p['status']] = counts.get(p['status'], 0) + 1
    kinds = {}
    for p in pairs:
        kinds[p['kind']] = kinds.get(p['kind'], 0) + 1

    def _fails(rows):
        return [r for r in rows if r['status'] == 'FAIL']

    report = {
        'spec': str(spec_path),
        'tolerance_mm': TOL_MM,
        'tolerance_source': "1/32 inch, the production patternmaker's standard",
        'gather_ratios': ratios,
        'shoulder_reference_height_cm': (round(shoulder_h, 3)
                                         if shoulder_h is not None else None),
        'summary': {
            'pairs': len(pairs),
            'by_status': counts,
            'by_kind': kinds,
            'max_diff_mm': round(max((p['diff_mm'] for p in pairs),
                                     default=0.0), 4),
            'panels_not_closed': len(_fails(closed)),
            'panels_self_intersecting': len(_fails(selfx)),
            'mirror_panel_faults': len(_fails(mirror_panels)),
            'mirror_seam_faults': len(_fails(mirror_seams)),
        },
        'armholes': armholes,
        'pairs': pairs,
        'closed_contour': closed,
        'self_intersection': selfx,
        'mirror_panels': mirror_panels,
        'mirror_seams': mirror_seams,
    }
    return report


def report_txt(report):
    s = report['summary']
    lines = [
        'SEAM DEED (dikis tapusu) — every pair walked, judged by its own rule',
        f"spec: {report['spec']}",
        f"equality tolerance: {report['tolerance_mm']:.5f}mm "
        f"({report['tolerance_source']})",
        f"pairs: {s['pairs']}   " + '   '.join(
            f'{k}: {v}' for k, v in sorted(s['by_status'].items())),
        'kinds: ' + '   '.join(f'{k}: {v}' for k, v in sorted(
            s['by_kind'].items())),
        f"gather ratios from design: {report['gather_ratios'] or 'none'}",
        '',
    ]

    for a in report['armholes']:
        lines.append(
            f"ARMHOLE {a['side']:>5}  cap {a['cap_mm']:.2f}mm  "
            f"armhole {a['armhole_mm']:.2f}mm  "
            f"cap ease {a['cap_ease_mm']:+.2f}mm  [{a['status']}] {a['school']}")
    if report['armholes']:
        lines.append('')

    lines += [f"{'status':<14} {'kind':<14} {'diff mm':>9}  pair", '-' * 96]
    order = {'FAIL': 0, 'UNVERIFIABLE': 1, 'REPORTED': 2,
             'GATHERED-PASS': 3, 'PASS': 4}
    for p in sorted(report['pairs'],
                    key=lambda x: (order.get(x['status'], 9), -x['diff_mm'])):
        pair = (f"{p['a']['panel']}[{p['a']['edge']}] {p['a']['len_mm']:.2f}mm "
                f"<-> {p['b']['panel']}[{p['b']['edge']}] "
                f"{p['b']['len_mm']:.2f}mm")
        extra = ''
        d = p.get('detail') or {}
        if 'violation' in d:
            extra = f"  ! {d['violation']}"
        elif 'back_excess_mm' in d:
            extra = f"  (back longer by {d['back_excess_mm']:.2f}mm)"
        elif 'gather_dev_mm' in d:
            extra = (f"  (gather x{d.get('expected_ratio')}, measured "
                     f"x{d.get('measured_ratio')}, dev {d['gather_dev_mm']:.2f}mm)")
        elif p['status'] == 'UNVERIFIABLE':
            extra = f"  ? {p['kind_evidence']}"
        lines.append(f"{p['status']:<14} {p['kind']:<14} "
                     f"{p['diff_mm']:>9.3f}  {pair}{extra}")

    faults = [c for c in report['closed_contour'] if c['status'] != 'PASS']
    if faults:
        lines += ['', 'CONTOUR']
        for c in faults:
            for pr in c['problems']:
                lines.append(f"  {c['status']:<13} {c['panel']}: {pr['detail']}")

    faults = [c for c in report['self_intersection'] if c['status'] != 'PASS']
    if faults:
        lines += ['', 'SELF-INTERSECTION']
        for c in faults:
            for h in c['hits']:
                lines.append(f"  {c['status']:<13} {c['panel']}: edges "
                             f"{h['edges']} {h.get('at_cm', h.get('detail'))}")

    faults = [m for m in report['mirror_panels'] if m['status'] == 'FAIL']
    if faults:
        lines += ['', 'MIRROR (panels)']
        for m in faults:
            head = f"  FAIL          {m['pair'][0]} vs {m['pair'][1]}"
            lines.append(head + f"  worst {m.get('worst_diff_mm', 0):.3f}mm")
            for e in m['edges']:
                lines.append(f"      edge {e['edge']}: {e['left_mm']:.3f} vs "
                             f"{e['right_mm']:.3f}  ({e['diff_mm']:.3f}mm)")

    faults = [m for m in report['mirror_seams'] if m['status'] == 'FAIL']
    if faults:
        lines += ['', 'MIRROR (seams) — the same seam deviating differently '
                      'on the two sides of a garment drawn symmetric']
        for m in faults:
            lines.append(f"  FAIL          {m['seam']}  {m['diff_mm']:+.3f}mm")
            lines.append(f"                {m['mirror']}  "
                         f"{m['mirror_diff_mm']:+.3f}mm")
            lines.append(f"                spread {m['spread_mm']:.3f}mm")

    return '\n'.join(lines) + '\n'


def main():
    ap = argparse.ArgumentParser(
        description='walk every stitch pair of a GarmentCode spec, judging '
                    'each one by the rule for its kind of seam')
    ap.add_argument('spec', help='path to *_specification.json')
    ap.add_argument('--design', help='design yaml (for gather recognition)')
    ap.add_argument('--out-json', help='write seam-report.json here')
    ap.add_argument('--out-txt', help='write seam-report.txt here')
    args = ap.parse_args()

    report = walk(args.spec, args.design)
    txt = report_txt(report)
    if args.out_json:
        Path(args.out_json).write_text(json.dumps(report, indent=2))
    if args.out_txt:
        Path(args.out_txt).write_text(txt)
    print(txt)


if __name__ == '__main__':
    main()
