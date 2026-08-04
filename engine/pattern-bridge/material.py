# ============================================================================
# material.py — THE INGREDIENT LAYER. A pattern written as constructions on
# measurements, with no word in it for a finished garment.
#
# WHY THIS FILE EXISTS. Until tonight a garment was named: the engine held a
# vocabulary of 35 finished-garment words (dress, bodice, waistband, pencil
# skirt) and each word was a class that knew how to draw itself. A vocabulary
# of finished things can only ever say what is already in it. The recipe for a
# cake is not the word 'cake'; it is flour, sugar, an oven temperature and a
# time. So the words here are points, lines, curves and formulas bound to body
# measurements, and 'corset' is not a word — a corset is something you build
# out of these.
#
# WHERE THE SET COMES FROM. Not invented. Read out of Seamly2D/Valentina's own
# pattern schema (src/libs/ifc/schema/pattern/v0.7.4.xsd) and its tool classes
# (src/libs/vtools/tools/drawTools/), which between them define 34 point and
# curve tools and a formula namespace of M_ / Line_ / AngleLine_ / Spl_ /
# Seg_ / RadiusArc_. Twelve of those 34 earn a place here; the reason each one
# is in, and the reason the rest are out, is written next to it. A tool that no
# draft has yet asked for is not a primitive, it is a guess.
#
# WHAT A FORMULA CAN SEE. Body measurements by name, variables declared earlier
# in the same recipe, and the geometry already built: Line_A_B is the distance
# between two placed points and AngleLine_A_B the angle of that line, resolved
# lazily, exactly Valentina's namespace. That is what makes a size change a
# re-evaluation rather than a redraw.
#
# WHAT COMES OUT. The same specification JSON the rest of the engine already
# judges — panels of vertices and edges, a stitch list — so walk.py, seamrules,
# panelcheck, printpack and cutplan read a garment drawn from ingredients
# without knowing anything changed. The referee is the unchanged part on
# purpose: a new drawing layer that also brought its own referee would be
# marking its own homework.
# ============================================================================
import json
import math
import re

# ---------------------------------------------------------------------------
# FORMULAS
# ---------------------------------------------------------------------------
# Valentina's function list, read off vtranslatevars.cpp. Degree-taking trig is
# kept alongside the radian kind because a drafter states angles in degrees and
# a formula that has to write degTorad() around every angle stops being
# readable, which is the whole point of a formula being text.
_FUNCS = {
    'sin': math.sin, 'cos': math.cos, 'tan': math.tan,
    'asin': math.asin, 'acos': math.acos, 'atan': math.atan,
    'sinD': lambda d: math.sin(math.radians(d)),
    'cosD': lambda d: math.cos(math.radians(d)),
    'tanD': lambda d: math.tan(math.radians(d)),
    'asinD': lambda v: math.degrees(math.asin(v)),
    'acosD': lambda v: math.degrees(math.acos(v)),
    'atanD': lambda v: math.degrees(math.atan(v)),
    'atan2D': lambda y, x: math.degrees(math.atan2(y, x)),
    'degTorad': math.radians, 'radTodeg': math.degrees,
    'sqrt': math.sqrt, 'exp': math.exp, 'ln': math.log,
    'log': math.log10, 'log2': math.log2,
    'abs': abs, 'sign': lambda v: (v > 0) - (v < 0),
    'min': min, 'max': max, 'fmod': math.fmod,
    'hypot': math.hypot,
}

_NAME = re.compile(r'[A-Za-z_][A-Za-z_0-9]*')


class Scope:
    """The namespace a formula is evaluated in.

    Three layers, resolved in this order: measurements, declared variables,
    and the geometry already drawn. The third layer is the one that matters —
    Line_A_B and AngleLine_A_B are not stored anywhere, they are measured off
    the points when a formula asks for them, so a draft can say 'half of what
    the shoulder seam turned out to be' without anyone having to compute and
    name that number first.
    """

    def __init__(self, measurements):
        self.m = dict(measurements)
        self.v = {}
        self.pts = {}

    def declare(self, name, formula):
        self.v[name] = self.eval(formula)
        return self.v[name]

    def place(self, name, xy):
        if name in self.pts:
            raise ValueError(f'point {name} already placed')
        self.pts[name] = (float(xy[0]), float(xy[1]))
        return self.pts[name]

    def point(self, name):
        try:
            return self.pts[name]
        except KeyError:
            raise ValueError(f'point {name} is not drawn yet') from None

    def _derived(self, token):
        """Line_A_B and AngleLine_A_B, measured on demand."""
        for prefix, fn in (('AngleLine_', self._angle), ('Line_', self._dist)):
            if not token.startswith(prefix):
                continue
            rest = token[len(prefix):]
            # point names may themselves contain '_', so every split is tried
            # and exactly one has to name two drawn points
            hits = [(rest[:i], rest[i + 1:])
                    for i, ch in enumerate(rest) if ch == '_'
                    and rest[:i] in self.pts and rest[i + 1:] in self.pts]
            if len(hits) == 1:
                return fn(*hits[0])
            if len(hits) > 1:
                raise ValueError(f'{token} splits into more than one pair of '
                                 f'drawn points: {hits}')
        return None

    def _dist(self, a, b):
        (ax, ay), (bx, by) = self.pts[a], self.pts[b]
        return math.hypot(bx - ax, by - ay)

    def _angle(self, a, b):
        (ax, ay), (bx, by) = self.pts[a], self.pts[b]
        return math.degrees(math.atan2(by - ay, bx - ax))

    def eval(self, expr):
        if isinstance(expr, (int, float)):
            return float(expr)
        env = dict(_FUNCS)
        for token in set(_NAME.findall(expr)):
            if token in env:
                continue
            if token in self.v:
                env[token] = self.v[token]
            elif token in self.m:
                env[token] = self.m[token]
            else:
                d = self._derived(token)
                if d is not None:
                    env[token] = d
        try:
            return float(eval(expr, {'__builtins__': {}}, env))  # noqa: S307
        except NameError as e:
            raise ValueError(f'formula {expr!r}: {e}') from None


# ---------------------------------------------------------------------------
# THE TWELVE POINT PRIMITIVES
# ---------------------------------------------------------------------------
# Each one earns its place by being a construction a drafter actually performs
# and that the others cannot express without arithmetic done by hand. Valentina
# ships 34; the 22 left out are listed at the bottom of this section with the
# reason, because a set is defined as much by what it refuses.
#
# Angles are degrees, counter-clockwise, x to the right and y UP — the space
# the specification stores a cut piece in, so no axis is flipped on the way
# out.
# ---------------------------------------------------------------------------
def _polar(x, y, deg, length):
    r = math.radians(deg)
    return (x + length * math.cos(r), y + length * math.sin(r))


def _line_cross(p1, p2, p3, p4):
    """Two INFINITE lines, not two segments. A drafter squares a line down
    from a point 'until it meets' another; the meeting place is regularly off
    the end of both drawn strokes, so a segment test would refuse the most
    common construction there is."""
    (x1, y1), (x2, y2), (x3, y3), (x4, y4) = p1, p2, p3, p4
    d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(d) < 1e-12:
        raise ValueError('lines are parallel; they do not cross')
    a = x1 * y2 - y1 * x2
    b = x3 * y4 - y3 * x4
    return ((a * (x3 - x4) - (x1 - x2) * b) / d,
            (a * (y3 - y4) - (y1 - y2) * b) / d)


def build_point(op, s):
    """op is one recipe step; s is the scope. Returns (x, y)."""
    kind = op['op']
    f = s.eval
    P = s.point

    # the one point in a block that is not derived from another
    if kind == 'origin':
        return (f(op['x']), f(op['y']))

    # from a point, at an angle, a measured distance. 'square down 21.4' is
    # this with angle 270; every measured step a drafter takes is this.
    if kind == 'polar':
        x, y = P(op['from'])
        return _polar(x, y, f(op['angle']), f(op['length']))

    # a rectangular step. The same thing polar does, said the way a draft says
    # it when the number is an offset from a construction line rather than a
    # measurement taken at an angle.
    if kind == 'offset':
        x, y = P(op['from'])
        return (x + f(op.get('dx', 0)), y + f(op.get('dy', 0)))

    # along the line a->b, a distance from a. May run past b: 'extend the
    # shoulder line 1.5 beyond the neck point' is this with length > Line_a_b.
    if kind == 'along':
        (ax, ay), (bx, by) = P(op['a']), P(op['b'])
        d = math.hypot(bx - ax, by - ay)
        if d < 1e-12:
            raise ValueError(f"along: {op['a']} and {op['b']} are the same point")
        t = f(op['length']) / d
        return (ax + t * (bx - ax), ay + t * (by - ay))

    # a fraction of the way from a to b. Darts and notches sit at fractions of
    # a seam, not at absolute distances, and a fraction survives a size change
    # without being recomputed.
    if kind == 'fraction':
        (ax, ay), (bx, by) = P(op['a']), P(op['b'])
        t = f(op['t'])
        return (ax + t * (bx - ax), ay + t * (by - ay))

    # where two lines meet. The verb 'square across until it hits the side
    # seam' — the most used construction in flat pattern.
    if kind == 'cross_lines':
        return _line_cross(P(op['a']), P(op['b']), P(op['c']), P(op['d']))

    # the same, when one side is stated as an axis through a point at an angle
    # rather than as two placed points.
    if kind == 'cross_axis':
        px, py = P(op['through'])
        q = _polar(px, py, f(op['angle']), 1.0)
        return _line_cross(P(op['a']), P(op['b']), (px, py), q)

    # foot of the perpendicular from p onto line a-b. How a bust point lands on
    # the centre front, and how a shoulder tip lands on the chest line.
    if kind == 'perp_foot':
        (px, py), (ax, ay), (bx, by) = P(op['p']), P(op['a']), P(op['b'])
        ex, ey = bx - ax, by - ay
        t = ((px - ax) * ex + (py - ay) * ey) / (ex * ex + ey * ey)
        return (ax + t * ex, ay + t * ey)

    # the compass: the point r1 from a and r2 from b. The one construction that
    # needs neither square nor protractor, and the one Aldrich uses to land a
    # shoulder tip and to close a sleeve cap.
    if kind == 'swing':
        (ax, ay), (bx, by) = P(op['a']), P(op['b'])
        r1, r2 = f(op['r1']), f(op['r2'])
        dx, dy = bx - ax, by - ay
        d = math.hypot(dx, dy)
        if d > r1 + r2 + 1e-9 or d < abs(r1 - r2) - 1e-9:
            raise ValueError(f'swing: circles do not meet (d={d:.4f}, '
                             f'r1={r1:.4f}, r2={r2:.4f})')
        a = (r1 * r1 - r2 * r2 + d * d) / (2 * d)
        h = math.sqrt(max(0.0, r1 * r1 - a * a))
        mx, my = ax + a * dx / d, ay + a * dy / d
        sign = -1.0 if op.get('side', 'left') == 'right' else 1.0
        return (mx - sign * h * dy / d, my + sign * h * dx / d)

    # a distance along the bisector of the angle a-b-c, out of b. The corner
    # ease point: an armhole and a neckline are drawn through a point set this
    # way at the square corner, and no other primitive states it in one step.
    if kind == 'bisect':
        (ax, ay), (bx, by), (cx, cy) = P(op['a']), P(op['b']), P(op['c'])
        a1 = math.atan2(ay - by, ax - bx)
        a2 = math.atan2(cy - by, cx - bx)
        half = a1 + ((a2 - a1 + math.pi) % (2 * math.pi) - math.pi) / 2.0
        return _polar(bx, by, math.degrees(half), f(op['length']))

    # reflect across a line. The second leg of a dart, and the right half of a
    # body that was drawn once on the left.
    if kind == 'mirror':
        (px, py), (ax, ay), (bx, by) = P(op['p']), P(op['a']), P(op['b'])
        ex, ey = bx - ax, by - ay
        n = ex * ex + ey * ey
        t = ((px - ax) * ex + (py - ay) * ey) / n
        fx, fy = ax + t * ex, ay + t * ey
        return (2 * fx - px, 2 * fy - py)

    # rotate about a point. Dart pivot. This is the one operation flat pattern
    # cannot fake with squares and measurements: moving a dart from the waist
    # to the shoulder is a rotation about the apex and nothing else.
    if kind == 'spin':
        (px, py), (cx, cy) = P(op['p']), P(op['centre'])
        r = math.radians(f(op['angle']))
        dx, dy = px - cx, py - cy
        return (cx + dx * math.cos(r) - dy * math.sin(r),
                cy + dx * math.sin(r) + dy * math.cos(r))

    raise ValueError(f'unknown point primitive: {kind}')


# LEFT OUT ON PURPOSE, and why. Valentina's triangle, pointOfContact,
# pointOfIntersectionArcs, pointOfIntersectionCircles, pointFromArcAndTangent,
# pointFromCircleAndTangent, curveIntersectAxis, cutArc, cutSpline,
# cutSplinePath, flippingByAxis, moving, elArc and the five spline-path
# variants are all real tools; none of them is needed to draw the block this
# recipe draws, and a primitive nobody has drafted with is a guess about the
# future. flippingByAxis is mirror with the axis named instead of drawn.
# pointOfIntersectionCircles is swing. trueDarts is not a primitive at all: it
# is mirror plus cross_lines, which is exactly how a drafter trues one.
# The set grows when a draft demands it and only then.


# ---------------------------------------------------------------------------
# THE THREE EDGE PRIMITIVES
# ---------------------------------------------------------------------------
# line     between two path points, needs nothing said
# spline   a cubic whose handles are given as a tangent ANGLE and a LENGTH at
#          each end. This is Valentina's own spline record (angle1/length1,
#          angle2/length2 in the schema) and it is how a drafter states a
#          curve: leave the shoulder square to the shoulder line, arrive at the
#          underarm at 45 degrees. Absolute control points say the same thing
#          in a language nobody drafts in.
# arc      a circular edge given by radius. A neckline and a waistband ARE
#          circles; drawing one as a bezier is a small lie about its curvature
#          that the seam walk then has to absorb.
# ---------------------------------------------------------------------------
def _rel(a, b, c):
    """Absolute control point -> the edge-relative pair the spec stores.

    walk.py reads these back as a + rx*(b-a) + ry*perp(b-a) with
    perp = (-dy, dx); this is that map inverted, so a curve drawn here and a
    curve measured there are the same curve.
    """
    ex, ey = b[0] - a[0], b[1] - a[1]
    det = ex * ex + ey * ey
    dx, dy = c[0] - a[0], c[1] - a[1]
    return [(ex * dx + ey * dy) / det, (-ey * dx + ex * dy) / det]


def edge_curvature(spec, a, b, s):
    """The 'curvature' field for one edge, or None for a straight one."""
    if spec is None:
        return None
    kind = spec['op']
    f = s.eval

    if kind == 'spline':
        c1 = _polar(a[0], a[1], f(spec['angle1']), f(spec['length1']))
        c2 = _polar(b[0], b[1], f(spec['angle2']), f(spec['length2']))
        return {'type': 'cubic', 'params': [_rel(a, b, c1), _rel(a, b, c2)]}

    if kind == 'arc':
        return {'type': 'circle',
                'params': [f(spec['radius']),
                           int(bool(spec.get('large', 0))),
                           int(bool(spec.get('right', 1)))]}

    raise ValueError(f'unknown edge primitive: {kind}')


# ---------------------------------------------------------------------------
# A RECIPE
# ---------------------------------------------------------------------------
def draw(recipe, measurements):
    """Run a recipe and return the specification dict.

    A recipe is data, not code: measurements in, variables declared as
    formulas, points constructed by the primitives above, pieces named as a
    closed walk over those points, seams named as pairs of piece edges. Nothing
    in it knows the word for the garment it draws.
    """
    s = Scope(measurements)
    for var in recipe.get('variables', []):
        s.declare(var['name'], var['formula'])
    for op in recipe.get('points', []):
        s.place(op['id'], build_point(op, s))

    panels, order = {}, []
    for piece in recipe['pieces']:
        panels[piece['name']] = _panel(piece, s)
        order.append(piece['name'])
        for copy in piece.get('copies', []):
            panels[copy['name']] = _mirror_panel(panels[piece['name']], copy, s)
            order.append(copy['name'])

    stitches = [[{'panel': a.split(':')[0], 'edge': int(a.split(':')[1])},
                 {'panel': b.split(':')[0], 'edge': int(b.split(':')[1])}]
                for a, b in recipe['seams']]

    return {
        'pattern': {'panels': panels, 'stitches': stitches,
                    'panel_order': order},
        'parameters': {}, 'parameter_order': [],
        'properties': {'curvature_coords': 'relative',
                       'normalize_panel_translation': False,
                       'normalized_edge_loops': True,
                       'units_in_meter': 100},
    }


def _panel(piece, s):
    """One closed walk over drawn points becomes one panel.

    The walk is stated in the recipe as the order a person would cut in. The
    panel's own coordinates are the drawing's, shifted so the piece sits at its
    own origin, and the shift is added to the placement, so where the piece
    lives on the body and where its points live on the paper stay one number.
    """
    pts = [s.point(step['pt']) for step in piece['path']]
    ox = min(p[0] for p in pts)
    oy = min(p[1] for p in pts)
    verts = [[p[0] - ox, p[1] - oy] for p in pts]

    edges = []
    n = len(pts)
    for i, step in enumerate(piece['path']):
        nxt = (i + 1) % n
        # the curve on the edge LEAVING this point
        curv = edge_curvature(step.get('curve'), pts[i], pts[nxt], s)
        e = {'endpoints': [i, nxt]}
        if curv is not None:
            e['curvature'] = curv
        if step.get('label'):
            e['label'] = step['label']
        edges.append(e)

    place = piece.get('place', [0, 0, 0])
    return {
        'translation': [s.eval(place[0]) + ox, s.eval(place[1]) + oy,
                        s.eval(place[2])],
        'rotation': [s.eval(r) for r in piece.get('rotate', [0, 0, 0])],
        'vertices': verts, 'edges': edges, 'label': piece['label'],
    }


def _mirror_panel(panel, copy, s):
    """The other half of the body: the same drawing, reflected in x.

    A left and a right panel are equal by construction, which is the claim
    cutplan.py measures. Reflecting the drawing rather than re-running the
    recipe with negated formulas is what makes that claim true by construction
    rather than true to four decimals.
    """
    verts = [[-x, y] for x, y in panel['vertices']]
    ox = min(v[0] for v in verts)
    verts = [[x - ox, y] for x, y in verts]
    n = len(verts)

    # reversing the walk keeps the outline turning the same way it did before
    # the reflection, which is what the print side and the seam side both
    # assume
    idx = [0] + list(range(n - 1, 0, -1))
    pos = {old: new for new, old in enumerate(idx)}
    edges = []
    for new, old in enumerate(idx):
        prev = idx[(new - 1) % n]
        src = panel['edges'][prev]          # the edge INTO old, walked back
        e = {'endpoints': [new, (new + 1) % n]}
        if 'curvature' in src:
            e['curvature'] = _flip_curvature(src['curvature'])
        if 'label' in src:
            e['label'] = _flip_label(src['label'])
        edges.append(e)
    assert pos  # keeps the mapping visible for anyone reading the walk

    t = panel['translation']
    return {
        'translation': [s.eval(copy['place'][0]) + ox,
                        s.eval(copy['place'][1]) if len(copy['place']) > 1
                        else t[1], s.eval(copy['place'][2])],
        'rotation': list(panel['rotation']),
        'vertices': verts, 'edges': edges, 'label': panel['label'],
    }


def _flip_curvature(curv):
    """A reflected, reversed edge keeps its shape: swapping the two control
    points reverses it and negating the perpendicular component reflects it,
    and the two together are the identity on the curve's geometry."""
    if curv['type'] == 'cubic':
        (a, b), (c, d) = curv['params'][1], curv['params'][0]
        return {'type': 'cubic',
                'params': [[1 - a, b], [1 - c, d]]}
    if curv['type'] == 'quadratic':
        a, b = curv['params'][0]
        return {'type': 'quadratic', 'params': [[1 - a, b]]}
    if curv['type'] == 'circle':
        r, large, right = curv['params']
        return {'type': 'circle', 'params': [r, large, right]}
    raise ValueError(f"cannot reflect curvature {curv['type']}")


def _flip_label(label):
    if label.startswith('left_'):
        return 'right_' + label[5:]
    if label.startswith('right_'):
        return 'left_' + label[6:]
    return label


def load(path):
    with open(path) as f:
        return json.load(f)
