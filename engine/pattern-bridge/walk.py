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
#   GATHERED-UNSCORED  the design gathers this seam and does not fix its
#                  length. Not a pass. Counted and published separately.
#   REPORTED       measured, but the field holds more than one position on
#                  what the right value is (cap ease)
#   UNVERIFIABLE   we could not establish what this seam is, so it was not
#                  judged. This is NOT a pass.
#   FAIL           the rule for this kind of seam is broken
#
# 2026-08-17 — THE GATE. Until today this file was a PRINTER, not a gate:
# main() ended with print() and returned None, so the process exited 0 whatever
# it had just found. scripts/taban.sh read that exit code and wrote `walk:OK`
# on all eight sizes while sixty of sixty-four panels carried a self-crossing
# outline. A referee whose verdict cannot be read by the thing that calls it is
# not a referee. See gate() below for which finding is a VERDICT and which is
# INFORMATION, and why.
# ============================================================================
import argparse
import json
import sys
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
    """Build the svgpathtools segment for one spec edge (coords in cm).

    The sweep flag of a circular edge is written for the space the piece is
    drawn in, where Y points down, and the specification stores the piece in
    the space it is cut in, where Y points up. Read with the drawing flag an
    arc bulges away from the side it belongs on: on a tiered skirt the waist
    arc turns its centre 28cm to the wrong side of the hem arc and the two
    cross twice, at points 17cm outside a piece 13cm wide. The generator keeps
    both conventions itself, `sweep=right` where it builds the mesh and
    `not right` where it draws, and the mesh is the piece. Radius, chord and
    the large-arc flag are untouched by this, so an arc's LENGTH is the same
    either way and no seam verdict moved when it was corrected.
    """
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
                   bool(large_arc), bool(right), cb)
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
    """Every gather ratio the design declares, wherever it sits in the tree.

    The first version of this read two fields, skirt.ruffle and
    sleeve.connect_ruffle. The design space carries eighteen gather-like
    parameters and seven of them are real gathers, including a whole mirrored
    branch for asymmetric garments. A ratio that is not read becomes a seam
    that is failed for doing what it was told, so the tree is walked instead
    of named field by field.

    A ratio is a gather when the parameter's name ends in `ruffle`. `flare`
    reshapes a piece rather than setting a ratio between two edges, so it is
    NOT collected: treating it as one would excuse real mismatches.
    """
    ratios = {}
    if not design:
        return ratios

    def visit(node, path):
        if not isinstance(node, dict):
            return
        if 'v' in node and 'type' in node:
            name = path.split('.')[-1]
            if name.endswith('ruffle'):
                try:
                    r = float(node['v'])
                except (TypeError, ValueError):
                    return
                if r > 1.05:
                    ratios[path] = r
            return
        for key, value in node.items():
            visit(value, f'{path}.{key}' if path else key)

    visit(design, '')
    return ratios


def declares_asymmetry(design):
    """Did the design ask for a garment whose two sides differ?

    Asked about which axis. The mirror audit pairs `left_x` with `right_x`,
    so the only declaration that can excuse a difference is one that makes
    the two SIDES differ. `left.enable_asym` does exactly that: it feeds the
    left bodice a separate design subtree, and the sampler turns it on about
    one sample in five. A mirror audit run over such a garment reports every
    seam on the left as a fault, so the audits do not run and say so.

    `flare-skirt.asymm.front_length` was read as a declaration too and it is
    not one. It drives AsymmSkirtCircle, which shortens the FRONT against the
    back and leaves left and right identical, and it is sampled from 0.1-0.9
    on every design whether a circle skirt is used or not. Reading it silenced
    the mirror audit on 33 of 57 patterns, most of which had no circle skirt
    at all, and none of which was asymmetric across the axis being audited.
    """
    if not design:
        return None
    reasons = []
    try:
        if bool(design['left']['enable_asym']['v']):
            reasons.append('left.enable_asym')
    except (KeyError, TypeError):
        pass
    return reasons or None


# WHICH GATHERS CAN BE SCORED AT ALL. Measured over 57 patterns, against the
# 1/32 inch tolerance, a declared ratio lands on the seam only when the
# generator applies it to the EDGE:
#   sleeve.connect_ruffle    median miss 0.66mm    25 of 44 inside tolerance
#   pants.cuff.skirt_ruffle  median miss 0.14mm     4 of 4
#   sleeve.cuff.top_ruffle   median miss 12.9mm     6 of 40
#   pants.cuff.top_ruffle    median miss 25.8mm     6 of 34
#   skirt.ruffle             median miss 37.6mm     8 of 79
#   levels-skirt.level_ruffle median miss 95.8mm    0 of 38
# The split is not noise, it is where the multiplication happens. connect_ruffle
# extends the sleeve's own open shape (sleeves.py:130). skirt.ruffle multiplies
# waist_length, a BODY measurement, into a panel's top edge
# (skirt_paneled.py:16-25), and that edge is then sewn to a drafted bodice
# bottom which was never that measurement. level_ruffle is worse: it scales
# lbody['waist'] and leaves lbody['hips'] alone (skirt_levels.py:41), and the
# next tier interpolates between the two, so the ratio asked for is not the
# ratio built, in any of the 38 tiers measured.
# So a gather that reaches a seam through a body measurement says the seam is
# unequal ON PURPOSE and does not say by how much. Failing it is a false
# positive and passing it at any ratio is not a check. It is reported unscored,
# counted apart, and published.
#
# Which two pieces a declared gather is allowed to act on. Read out of the
# generator's own assembly, not inferred: `connect_ruffle` extends the sleeve's
# open shape before it meets the armhole (sleeves.py:130), `cuff.top_ruffle`
# sizes the cuff from the sleeve or trouser bottom (sleeves.py:304,
# pants.py:247), `cuff.skirt_ruffle` sizes the flounce hanging off a cuff
# (bands.py:203), `skirt.ruffle` gathers a panelled skirt onto the waistband
# and only when it sits on one (skirt_paneled.py:416), and `level_ruffle`
# sizes each skirt level from the bottom of the level above it
# (skirt_levels.py:41), so both of its sides are skirt.
_SCOPES = [
    ('cuff.skirt_ruffle', ('cuff_skirt', 'cuff')),
    ('cuff.top_ruffle',   ('cuff', 'sleeve|pant')),
    ('connect_ruffle',    ('sleeve', 'torso')),
    ('level_ruffle',      ('skirt', 'skirt')),
    ('skirt.ruffle',      ('skirt', 'wb|torso')),
]


def _touches(panel_name, want):
    n = panel_name.lower()
    if 'cuff_skirt' in n:
        here = {'cuff_skirt'}
    elif 'cuff' in n:
        here = {'cuff'}
    elif n.startswith('wb'):
        here = {'wb'}
    elif 'sleeve' in n:
        here = {'sleeve'}
    elif n.startswith('pant'):
        here = {'pant'}
    elif 'skirt' in n:
        here = {'skirt'}
    else:
        here = {'torso'}
    return bool(here & set(want.split('|')))


def ratio_applies(path, name_a, name_b):
    """Can this declared gather act on this pair of pieces?

    It can not, most of the time. The sampler writes a value for every gather
    in the design space on every design, so a garment with no cuff and no
    trousers still declares four cuff ratios and two trouser ratios. Ten of
    them were being offered to every seam in the pattern, and a seam that is
    wrong by any amount that happens to land on any of the ten was excused.
    The ratio is bound to the two pieces the generator applies it between, and
    a seam that is not between those two pieces cannot claim it.
    """
    if path.startswith('left.') and not (name_a.lower().startswith('left')
                                         or name_b.lower().startswith('left')):
        return False
    for tail, (want_a, want_b) in _SCOPES:
        if path.endswith(tail):
            return ((_touches(name_a, want_a) and _touches(name_b, want_b))
                    or (_touches(name_b, want_a) and _touches(name_a, want_b)))
    return False    # a gather whose reach is not known does not excuse anything


def match_declared_ratio(len_a, len_b, ratios, tol, names=None):
    """Is this pair's inequality one the design asked for?

    A pair that is not equal is checked against the ratios the design DECLARED
    that can reach it, and the one it matches is named in the report. A pair
    matching no reachable declared ratio fails.

    This can still excuse a broken seam that happens to land on the ratio that
    governs it, so a gathered verdict always carries which ratio it matched
    and they are counted apart from plain passes.
    """
    short, long_ = min(len_a, len_b), max(len_a, len_b)
    if short <= 0:
        return None
    best = None
    for name, ratio in ratios.items():
        if names is not None and not ratio_applies(name, names[0], names[1]):
            continue
        dev = abs(long_ - short * ratio)
        if dev <= tol and (best is None or dev < best[2]):
            best = (name, ratio, dev)
    return best


# ---------------------------------------------------------------------------
# Judging one pair, once its kind is known.
# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------
# THE GENERATOR'S OWN BOOKKEEPING, read instead of guessed.
#
# Every interface in GarmentCode carries a ruffle coefficient, and two
# interfaces are matched by their PROJECTED length, len / coeff
# (interface.py:104, projecting_edges extends by 1/coeff). So the length ratio
# the generator INTENDS for a stitch is coeff_a / coeff_b, exactly, per seam.
#
# This replaces reading a ratio out of the design tree and hoping it lands on
# the edge. It never did: `skirt.ruffle` multiplies a BODY measurement into a
# panel edge, and the piece on the other side of the seam was drafted from a
# different one, which is why 1708 pairs came back GATHERED-UNSCORED on the
# 500-design corpus of 2026-08-03. The coefficient on the interface is the
# ratio AFTER the generator has done that arithmetic, so there is nothing left
# to derive. It is not written into the specification file, so it is captured
# at generation time into `stitch-intent.json` next to the spec (atlas.py).
#
# It cuts both ways. A pair the design tree called gathered but that the
# generator built at 1:1 is no longer excused, and a pair with no ratio
# anywhere in the design tree can still be declared unequal by the piece that
# owns it. Read the deed, not the wish.
# ---------------------------------------------------------------------------
def load_stitch_intent(spec_path):
    """{(panel_a, edge_a), (panel_b, edge_b): (coeff_a, coeff_b)} or {}."""
    path = Path(spec_path).parent / 'stitch-intent.json'
    if not path.exists():
        return {}
    intent = {}
    for row in json.loads(path.read_text()):
        a, b = row['a'], row['b']
        ka, kb = (a['panel'], a['edge']), (b['panel'], b['edge'])
        ra, rb = float(row['ruffle_a']), float(row['ruffle_b'])
        intent[(ka, kb)] = (ra, rb)
        intent[(kb, ka)] = (rb, ra)
    return intent


def judge_by_intent(la, lb, ra, rb):
    """Judge a pair against the ratio the generator built into it."""
    if ra <= 0 or rb <= 0:
        return None
    expected_lb = la * rb / ra
    dev = abs(lb - expected_lb)
    ratio = rb / ra
    even = abs(ratio - 1.0) < 1e-6
    detail = {
        'rule': ('equal within 0.79375mm (1/32 inch, production standard)'
                 if even else
                 f'the generator gathers this pair at {ratio:.4f} (interface '
                 f'coefficients {ra:.4f} / {rb:.4f}), and the two measured '
                 f'sides must sit on that ratio'),
        'expected_ratio': round(ratio, 6),
        'measured_ratio': round(lb / la, 6) if la else None,
        'declared_by': 'generator interface coefficients',
        'dev_mm': round(dev, 4),
    }
    if dev > TOL_MM:
        return 'FAIL', detail
    return ('PASS' if even else 'GATHERED-PASS'), detail


def _judge_pair(kind, entry, panels, sa, sb, la, lb, ratios, intent=None):
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

    # Every remaining kind is an equality seam, unless a gather was declared.
    # When the generator's own coefficients for this pair are on hand they are
    # the declaration, and they are exact, so nothing else is consulted.
    if intent is not None:
        verdict = judge_by_intent(la, lb, *intent)
        if verdict is not None:
            return verdict

    status, detail = seamrules.judge_equal(la, lb)
    if status == seamrules.PASS:
        return status, detail

    hit = match_declared_ratio(la, lb, ratios, TOL_MM,
                               (sa['panel'], sb['panel']))
    short, long_ = min(la, lb), max(la, lb)
    if hit is not None:
        name, ratio, dev = hit
        return 'GATHERED-PASS', {
            'rule': f'not equal, but the design declares {name} = {ratio} and '
                    f'the long side is that multiple of the short one',
            'declared_by': name,
            'expected_ratio': ratio,
            'measured_ratio': round(long_ / short, 4),
            'gather_dev_mm': round(dev, 4),
        }

    reach = {n: r for n, r in ratios.items()
             if ratio_applies(n, sa['panel'], sb['panel'])}
    if reach and not any(n.endswith('connect_ruffle') for n in reach):
        return 'GATHERED-UNSCORED', {
            'rule': 'the design gathers this seam, and does not say by how '
                    'much: the ratio is applied to a body measurement and the '
                    'seam is between two drafted edges',
            'declared_by': sorted(reach),
            'declared_ratio': sorted(reach.values()),
            'measured_ratio': round(long_ / short, 4),
            'diff_mm': round(long_ - short, 4),
        }
    if reach:
        detail['declared_ratios_checked'] = sorted(reach)
    return status, detail


def _judge_armhole_groups(pairs, panels, ratios=None):
    """Cap ease is measured over the whole armhole, per side of the body.

    A gathered sleeve is not an eased sleeve. When the design declares a
    gather onto the armhole the cap is a multiple of it by intent, and cap
    ease bands do not apply: a puff sleeve at a declared 1.8 was being called
    a suspect draft for a 390mm ease.
    """
    ratios = ratios or {}
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
        # Named from a sleeve side and a torso side because that is what an
        # armhole group is; the group is only built from armhole-cap pairs.
        hit = match_declared_ratio(cap, arm, ratios, TOL_MM * len(members),
                                   (f'{side}_sleeve', f'{side}_ftorso'))
        if hit is not None:
            name, ratio, dev = hit
            status = 'GATHERED-PASS'
            detail = {
                'rule': f'the cap is gathered into the armhole at a declared '
                        f'{name} = {ratio}, so cap ease does not apply',
                'cap_mm': round(cap, 4),
                'armhole_mm': round(arm, 4),
                'declared_by': name,
                'expected_ratio': ratio,
                'measured_ratio': round(cap / arm, 4) if arm else None,
                'gather_dev_mm': round(dev, 4),
                'cap_ease_mm': round(cap - arm, 4),
                'school': 'gathered, not eased',
            }
        else:
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
    intents = load_stitch_intent(spec_path)

    # Contour proof first, height heuristic second: an edge that runs into the
    # waistline is a side seam whatever its height says, and the height only
    # means anything once the seams that are settled are out of the running.
    side_seams = seamrules.side_seam_edges(panels, stitches)
    shoulder_h = seamrules.shoulder_reference_height(panels, stitches,
                                                     side_seams=side_seams)

    pairs = []
    for stitch in stitches:
        sa, sb = stitch[0], stitch[1]
        pa, pb = panels[sa['panel']], panels[sb['panel']]
        ea, eb = pa['edges'][sa['edge']], pb['edges'][sb['edge']]
        la, lb = edge_length_mm(pa, ea), edge_length_mm(pb, eb)

        kind, why = seamrules.classify(
            sa['panel'], pa, ea, sb['panel'], pb, eb,
            shoulder_height_cm=shoulder_h,
            known_side_seam=((sa['panel'], sa['edge']) in side_seams
                             or (sb['panel'], sb['edge']) in side_seams))
        entry = {
            'a': {'panel': sa['panel'], 'edge': sa['edge'],
                  'len_mm': round(la, 4)},
            'b': {'panel': sb['panel'], 'edge': sb['edge'],
                  'len_mm': round(lb, 4)},
            'diff_mm': round(abs(la - lb), 4),
            'kind': kind,
            'kind_evidence': why,
        }
        intent = intents.get(((sa['panel'], sa['edge']),
                              (sb['panel'], sb['edge'])))
        status, detail = _judge_pair(kind, entry, panels, sa, sb, la, lb,
                                     ratios, intent)
        if intent is not None:
            entry['intent_ratio'] = round(intent[1] / intent[0], 6)
        entry['status'] = status
        entry['detail'] = detail
        pairs.append(entry)

    armholes = _judge_armhole_groups(pairs, panels, ratios)

    closed = [panelcheck.check_closed(n, p, edge_curve)
              for n, p in panels.items()]
    selfx = [panelcheck.check_self_intersection(n, p, edge_curve)
             for n, p in panels.items()]
    # A garment the design asked to be asymmetric must not be audited for
    # symmetry. The sampler turns asymmetry on in roughly one design in five,
    # and auditing those would report a fault on every seam of one side.
    asym = declares_asymmetry(design)
    if asym:
        mirror_panels, mirror_seams = [], []
    else:
        def _segments_for(panel):
            return [edge_curve(panel['vertices'], e) for e in panel['edges']]

        mirror_panels = panelcheck.check_mirror_symmetry(
            panels, edge_length_mm, seamrules.mirror_name,
            segments_for=_segments_for)
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
        'stitch_intent_pairs': len(intents) // 2,
        'shoulder_reference_height_cm': (round(shoulder_h, 3)
                                         if shoulder_h is not None else None),
        'asymmetry_declared': asym,
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
            'mirror_audited': not asym,
        },
        'armholes': armholes,
        'pairs': pairs,
        'closed_contour': closed,
        'self_intersection': selfx,
        'mirror_panels': mirror_panels,
        'mirror_seams': mirror_seams,
    }
    return report


# ---------------------------------------------------------------------------
# THE GATE — VERDICT (hüküm) against INFORMATION (bilgi).
#
# The split is not a matter of taste and it is not a threshold. A finding is a
# VERDICT when it says, of a specific piece or a specific pair, that the thing
# as drawn cannot be cut or cannot be sewn. It is INFORMATION when the check
# did not reach a judgement — because the seam's kind could not be established,
# because the design declared an inequality without saying how much, or because
# the field itself holds more than one answer. An unreached judgement is not a
# defect and must not fail the gate; a reached one is a defect and must, no
# matter how many of them there are.
#
# VERDICT — the gate falls (exit 1):
#   pair FAIL             the rule for this kind of seam is broken. The two
#                         edges are stitched together and do not match.
#   armhole group FAIL    cap ease outside every school's band, judged over the
#                         whole armhole (seamrules.judge_cap_ease).
#   closed_contour FAIL   an outline that does not close is not a piece.
#   self_intersection FAIL an outline that crosses itself cannot be cut. This
#                         is the class that was invisible until today.
#   mirror_panels FAIL    a garment drawn symmetric that comes out asymmetric.
#   mirror_seams FAIL     the same seam deviating differently on the two sides.
#
# INFORMATION — reported, counted, printed, does NOT fail the gate:
#   UNVERIFIABLE          the kind of this seam was not established, so no rule
#                         was applied. Not a pass either: it is a hole in
#                         coverage, and it is printed with its count so the
#                         hole cannot be mistaken for a clean run.
#   GATHERED-UNSCORED     the design gathers this seam and does not fix its
#                         length. Failing it would be a false positive.
#   REPORTED              measured, but the field holds more than one position
#                         on what the right value is (cap ease bands).
#   DEFERRED              judged inside its armhole group; the group carries
#                         the verdict, this row must not carry it twice.
#
# PASS / GATHERED-PASS are passes and count as neither.
#
# Nothing moves between these two lists to make a run green. If a class of
# defect is real and reached, it stays a verdict and the gate stays red.
# ---------------------------------------------------------------------------
VERDICT_CLASSES = ('seam', 'armhole', 'closed_contour', 'self_intersection',
                   'mirror_panels', 'mirror_seams', 'census')
INFORMATION_STATUSES = ('UNVERIFIABLE', 'GATHERED-UNSCORED', 'REPORTED',
                        'DEFERRED')


def gate(report):
    """Split the report into verdicts and information. Returns a dict with the
    per-class verdict-failure counts, the information counts, and `red`.

    TUR 11 (17 Agu) — EMPTY DEED. Every verdict class above counts FAIL rows,
    so a specification carrying NOTHING scored zero in all six and the gate
    printed YESIL. Measured, not argued: a spec with `panels: {}` and
    `stitches: []` exited 0, and so did a REAL eight-panel EU38 spec with all
    twenty-six of its stitches deleted — a garment whose pieces are never
    joined to each other was called sewable. That is the `taban.sh` BOS MUHUR
    class (the sha256 of the empty string) one level up: a deed with no
    entries is not a clean deed, it is no deed.

    This is a census, not a threshold. Nothing is tuned here: the counts are
    zero or they are not. A pattern is a set of pieces AND the seams that join
    them, so both floors are 1.
    """
    def n_fail(rows):
        return sum(1 for r in rows if r.get('status') == 'FAIL')

    census = []
    # one closed-contour row per panel, so this is the panel count as the
    # audit itself saw it, not as the file claims it.
    n_panels = len(report.get('closed_contour') or [])
    n_pairs = len(report.get('pairs') or [])
    if n_panels == 0:
        census.append('the specification carries NO panel — nothing was judged')
    if n_pairs == 0:
        census.append('the specification carries NO stitch pair — the pieces '
                      'are never joined, so no seam was judged')

    verdicts = {
        'seam': n_fail(report['pairs']),
        'armhole': n_fail(report['armholes']),
        'closed_contour': n_fail(report['closed_contour']),
        'self_intersection': n_fail(report['self_intersection']),
        'mirror_panels': n_fail(report['mirror_panels']),
        'mirror_seams': n_fail(report['mirror_seams']),
        'census': len(census),
    }
    information = {}
    for row in report['pairs']:
        st = row.get('status')
        if st in INFORMATION_STATUSES:
            information[st] = information.get(st, 0) + 1
    for row in report['armholes']:
        st = row.get('status')
        if st in INFORMATION_STATUSES:
            information[st] = information.get(st, 0) + 1
    total = sum(verdicts.values())
    return {'verdicts': verdicts, 'verdict_fails': total,
            'census': census, 'panels': n_panels, 'judged_pairs': n_pairs,
            'information': information, 'red': total > 0}


def gate_txt(g):
    """The machine-readable tail of the report.

    Prefixed `KAPI` rather than FAIL/PASS on purpose: taban.sh counts lines
    beginning with those words and a summary line must never be counted as one
    more finding.
    """
    v = g['verdicts']
    info = '  '.join(f'{k} {n}' for k, n in sorted(g['information'].items()))
    lines = [
        '',
        'KAPI — hüküm (dikilebilirliği bozar, kapıyı düşürür)',
        f"KAPI  sayım: panel {g['panels']}  dikiş çifti {g['judged_pairs']}",
        f"KAPI  hukum-FAIL: {g['verdict_fails']}  "
        f"(seam {v['seam']}  armhole {v['armhole']}  "
        f"contour {v['closed_contour']}  "
        f"self-intersection {v['self_intersection']}  "
        f"mirror-panel {v['mirror_panels']}  mirror-seam {v['mirror_seams']}  "
        f"census {v['census']})",
    ]
    for c in g['census']:
        lines.append(f"KAPI  BOŞ TAPU: {c}")
    lines += [
        f"KAPI  bilgi (kapıyı düşürmez): {info or 'yok'}",
        f"KAPI  HUKUM: {'KIRMIZI' if g['red'] else 'YESIL'}",
    ]
    return lines


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
            # T12/TUR 12: a mirror pair that could not be aligned now arrives
            # here as a FAIL with no numbers to print — the finding IS that no
            # seam verdict exists. Print the reason instead of crashing on it.
            if m['diff_mm'] is None:
                lines.append(f"  FAIL          {m['seam']}  "
                             'UNJUDGED — no mirror-seam verdict')
                lines.append(f"                {m.get('reason', '')}")
                if m['spread_mm'] is not None:
                    lines.append(f"                best alignment "
                                 f"{m['spread_mm']:.3f}mm")
                continue
            lines.append(f"  FAIL          {m['seam']}  {m['diff_mm']:+.3f}mm")
            lines.append(f"                {m['mirror']}  "
                         f"{m['mirror_diff_mm']:+.3f}mm")
            lines.append(f"                spread {m['spread_mm']:.3f}mm")

    lines += gate_txt(gate(report))
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
    g = gate(report)
    report['gate'] = g
    txt = report_txt(report)
    if args.out_json:
        Path(args.out_json).write_text(json.dumps(report, indent=2))
    if args.out_txt:
        Path(args.out_txt).write_text(txt)
    print(txt)
    # The verdict leaves this process as an exit code, so the thing that calls
    # it can read it. 1 = at least one verdict-class failure.
    return 1 if g['red'] else 0


if __name__ == '__main__':
    sys.exit(main())
