# ============================================================================
# walk.py — the SEAM DEED (dikis tapusu). Our difference layer: the same job
# Gerber AccuMark's "Walk Pieces" and CLO3D's "Check Sewing Length" do, run
# automatically on every generated GarmentCode specification.
#
# For EVERY stitch pair in the spec it measures both edge lengths:
#   line      |b - a|
#   quadratic/cubic  Bezier built from RELATIVE control points
#                    (abs = a + rx*(b-a) + ry*perp(b-a), perp = (-dy, dx))
#   circle    params [radius, large_arc, right]: chord + radius -> arc angle
# Curves are measured with svgpathtools .length() — the same primitive
# pygarment itself draws with, so our meters and their drawing agree.
#
# Gathered seams are recognised from the DESIGN params, not guessed:
# skirt.ruffle / sleeve.connect_ruffle > 1.05 means the long side is meant
# to be ratio x the short side; if it is (within tolerance) the pair is
# GATHERED-PASS, otherwise it fails like any other seam.
#
# Verdicts per pair (diff in mm; spec units are cm, units_in_meter=100):
#   PASS           diff <= 1mm
#   GATHERED-PASS  |long - short*ratio| <= 1mm for the applicable ratio
#   FAIL           anything else
# ============================================================================
import argparse
import json
from pathlib import Path

import yaml
from svgpathtools import Arc, CubicBezier, Line, QuadraticBezier

TOL_MM = 1.0  # industry red line: CLO flags sewing-length gaps > 1mm


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


def walk(spec_path, design_path=None):
    with open(spec_path) as f:
        spec = json.load(f)
    pattern = spec['pattern']
    panels = pattern['panels']
    design = None
    if design_path:
        with open(design_path) as f:
            loaded = yaml.safe_load(f)
        design = loaded.get('design', loaded)
    ratios = gather_ratios(design)

    pairs = []
    for stitch in pattern['stitches']:
        (sa, sb) = stitch[0], stitch[1]
        la = edge_length_mm(panels[sa['panel']], panels[sa['panel']]['edges'][sa['edge']])
        lb = edge_length_mm(panels[sb['panel']], panels[sb['panel']]['edges'][sb['edge']])
        diff = abs(la - lb)
        short, long_ = min(la, lb), max(la, lb)
        entry = {
            'a': {'panel': sa['panel'], 'edge': sa['edge'], 'len_mm': round(la, 2)},
            'b': {'panel': sb['panel'], 'edge': sb['edge'], 'len_mm': round(lb, 2)},
            'diff_mm': round(diff, 2),
        }
        if diff <= TOL_MM:
            entry['status'] = 'PASS'
        else:
            ratio = expected_ratio(panel_role(sa['panel']), panel_role(sb['panel']), ratios)
            if ratio is not None:
                gather_dev = abs(long_ - short * ratio)
                entry['expected_ratio'] = ratio
                entry['measured_ratio'] = round(long_ / short, 4)
                entry['gather_dev_mm'] = round(gather_dev, 2)
                entry['status'] = 'GATHERED-PASS' if gather_dev <= TOL_MM else 'FAIL'
            else:
                entry['status'] = 'FAIL'
        pairs.append(entry)

    counts = {'PASS': 0, 'GATHERED-PASS': 0, 'FAIL': 0}
    for p in pairs:
        counts[p['status']] += 1
    report = {
        'spec': str(spec_path),
        'tolerance_mm': TOL_MM,
        'gather_ratios': ratios,
        'summary': {
            'pairs': len(pairs),
            'within_1mm': counts['PASS'],
            'gathered_pass': counts['GATHERED-PASS'],
            'fail': counts['FAIL'],
            'max_diff_mm': round(max((p['diff_mm'] for p in pairs), default=0.0), 2),
        },
        'pairs': pairs,
    }
    return report


def report_txt(report):
    s = report['summary']
    lines = [
        'SEAM DEED (dikis tapusu) — every stitch pair walked, both edges measured',
        f"spec: {report['spec']}",
        f"pairs: {s['pairs']}   PASS(<=1mm): {s['within_1mm']}   "
        f"GATHERED-PASS: {s['gathered_pass']}   FAIL: {s['fail']}",
        f"gather ratios from design: {report['gather_ratios'] or 'none'}",
        '',
        f"{'status':<14} {'diff mm':>8}  pair",
        '-' * 78,
    ]
    for p in sorted(report['pairs'], key=lambda x: -x['diff_mm']):
        pair = (f"{p['a']['panel']}[{p['a']['edge']}] {p['a']['len_mm']}mm  <->  "
                f"{p['b']['panel']}[{p['b']['edge']}] {p['b']['len_mm']}mm")
        extra = ''
        if 'expected_ratio' in p:
            extra = (f"  (gather: expected x{p['expected_ratio']}, measured "
                     f"x{p['measured_ratio']}, dev {p['gather_dev_mm']}mm)")
        lines.append(f"{p['status']:<14} {p['diff_mm']:>8.2f}  {pair}{extra}")
    return '\n'.join(lines) + '\n'


def main():
    ap = argparse.ArgumentParser(description='walk every stitch pair of a GarmentCode spec')
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
