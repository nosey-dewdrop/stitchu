# ============================================================================
# atlas.py — THE GARMENT DICTIONARY, AND THE MACHINE THAT DRIVES IT.
#
# A garment is not a shape, it is a SENTENCE: one word per axis.
#
#     upper x bottom x waistband x collar x collar-piece x armhole x cuff
#
# Every word already exists in the generator's design tree. Nothing here is
# invented; the vocabulary is READ out of default.yaml, so a word the
# generator gains tomorrow appears in the gallery without a code change.
#
# Two things run on top of this file:
#   vocab.py   isolates ONE word per garment and prints a single gallery page
#   matrix.py  drives the cross product cell by cell
#
# WHY THE GALLERY COMES FIRST. Taste cannot be judged ten thousand times. It
# can be judged forty times. A word approved once is approved in every
# combination that contains it, so the taste gate closes at the vocabulary
# and the matrix inherits it. That is the multiplier.
#
# GATE 0 is defined once, here, and is not loosened to raise a rate.
# ============================================================================
import copy
import json
import os
import subprocess
import sys
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
GC_ROOT = REPO / 'core' / 'third_party' / 'garmentcode'
VENV_PY = GC_ROOT / '.venv' / 'bin' / 'python'
DESIGN_FILE = GC_ROOT / 'assets' / 'design_params' / 'default.yaml'

sys.path.insert(0, str(HERE))
import walk as walklib          # noqa: E402
import printpack                # noqa: E402

NAME = 'stitchu'
SIZE_LABEL = 'EU38'
SIZE_INDEX = 2                  # mapping.SIZES.index('EU38')

# printpack re-measures every notch by independent chord integration and the
# pair must agree to under a millimetre. Same number the print report prints.
NOTCH_TOL_MM = 1.0


# ===========================================================================
# the vocabulary, read out of the generator's own design tree
# ===========================================================================
# Each axis: (dotted path into the design tree, human axis name). Only
# discrete axes are words. Floats (length, width, flare) are not words, they
# are how loud a word is said, and they stay at their defaults so that one
# word is the only thing that changes between two squares.
AXES = [
    ('meta.upper',            'upper'),
    ('meta.bottom',           'bottom'),
    ('meta.wb',               'waistband'),
    ('collar.f_collar',       'neckline'),
    ('collar.component.style', 'collar piece'),
    ('sleeve.sleeveless',     'sleeve'),
    ('sleeve.armhole_shape',  'armhole'),
    ('sleeve.cuff.type',      'cuff'),
]


def load_tree():
    with open(DESIGN_FILE) as f:
        return yaml.safe_load(f)['design']


def _node(tree, dotted):
    node = tree
    for p in dotted.split('.'):
        node = node[p]
    return node


def set_v(design, dotted, value):
    _node(design, dotted)['v'] = value


def get_v(design, dotted):
    return _node(design, dotted)['v']


# ---------------------------------------------------------------------------
# What the word is called on the page. The generator's class names ARE the
# vocabulary and they stay in every file and every manifest, but a gallery is
# read by eye, and `CircleNeckHalf` is not a garment word. These are
# translations of names, not of geometry: nothing here changes what is drawn,
# and a name with no entry keeps its own.
# ---------------------------------------------------------------------------
GLOSS = {
    ('meta.upper', 'FittedShirt'): 'oturan ust',
    ('meta.upper', 'Shirt'): 'duz ust',
    ('meta.upper', None): 'ustsuz',
    ('meta.bottom', 'SkirtCircle'): 'kloş etek',
    ('meta.bottom', 'AsymmSkirtCircle'): 'asimetrik kloş',
    ('meta.bottom', 'GodetSkirt'): 'godeli etek',
    ('meta.bottom', 'Pants'): 'pantolon',
    ('meta.bottom', 'Skirt2'): 'iki parca etek',
    ('meta.bottom', 'SkirtManyPanels'): 'cok panelli etek',
    ('meta.bottom', 'PencilSkirt'): 'kalem etek',
    ('meta.bottom', 'SkirtLevels'): 'katli etek',
    ('meta.bottom', None): 'altsiz',
    ('meta.wb', 'StraightWB'): 'duz kemer',
    ('meta.wb', 'FittedWB'): 'oturan kemer',
    ('meta.wb', None): 'kemersiz',
    ('collar.f_collar', 'CircleNeckHalf'): 'yuvarlak yaka',
    ('collar.f_collar', 'CurvyNeckHalf'): 'kavisli yaka',
    ('collar.f_collar', 'VNeckHalf'): 'V yaka',
    ('collar.f_collar', 'SquareNeckHalf'): 'kare yaka',
    ('collar.f_collar', 'TrapezoidNeckHalf'): 'trapez yaka',
    ('collar.f_collar', 'CircleArcNeckHalf'): 'daire yayi yaka',
    ('collar.f_collar', 'Bezier2NeckHalf'): 'serbest egri yaka',
    ('collar.component.style', 'Turtle'): 'balikci yaka',
    ('collar.component.style', 'SimpleLapel'): 'klapa',
    ('collar.component.style', 'Hood2Panels'): 'kapuson',
    ('collar.component.style', None): 'yakasiz',
    ('sleeve.sleeveless', True): 'kolsuz',
    ('sleeve.sleeveless', False): 'kollu',
    ('sleeve.armhole_shape', 'ArmholeSquare'): 'kare oyuntu',
    ('sleeve.armhole_shape', 'ArmholeAngle'): 'kose oyuntu',
    ('sleeve.armhole_shape', 'ArmholeCurve'): 'kavisli oyuntu',
    ('sleeve.cuff.type', 'CuffBand'): 'mansetli',
    ('sleeve.cuff.type', 'CuffSkirt'): 'firfirli kol agzi',
    ('sleeve.cuff.type', 'CuffBandSkirt'): 'mansetli firfir',
    ('sleeve.cuff.type', None): 'mansetsiz',
}


def word_label(value):
    return 'yok' if value is None else str(value)


# ---------------------------------------------------------------------------
# The plain sentence. Every axis at its quietest reading, so that when one
# word is swapped in, the square shows THAT word and nothing else.
#
# sleeveless=true and no bottom is the plainest top the generator can draw;
# floats stay at the defaults default.yaml ships with.
# ---------------------------------------------------------------------------
PLAIN = {
    'meta.upper': None,
    'meta.bottom': None,
    'meta.wb': None,
    'collar.f_collar': 'CircleNeckHalf',
    'collar.b_collar': 'CircleNeckHalf',
    'collar.component.style': None,
    'sleeve.sleeveless': True,
    'sleeve.armhole_shape': 'ArmholeCurve',
    'sleeve.cuff.type': None,
    'left.enable_asym': False,
}

TOP = 'FittedShirt'
BOTTOM = 'PencilSkirt'


def plain_design():
    """The base sentence: nothing said loudly, nothing said at all yet."""
    d = copy.deepcopy(load_tree())
    for path, value in PLAIN.items():
        set_v(d, path, value)
    return d


# ---------------------------------------------------------------------------
# Context: the minimum the rest of the garment must be for a word to be
# visible at all. A collar needs a top under it. A waistband needs a skirt to
# sit on. Written out so it can be read and argued with, not buried in ifs.
# ---------------------------------------------------------------------------
def context_for(axis_path, value):
    """Extra overrides that make this one word legible, and nothing more."""
    ctx = {}
    if axis_path == 'meta.upper':
        # No upper at all is still a word: it means a bottom worn alone.
        ctx['meta.bottom'] = BOTTOM if value is None else None
    elif axis_path == 'meta.bottom':
        # No bottom is a word too: the top worn alone.
        ctx['meta.upper'] = TOP if value is None else None
    elif axis_path == 'meta.wb':
        ctx['meta.bottom'] = BOTTOM
    elif axis_path in ('collar.f_collar', 'collar.component.style'):
        ctx['meta.upper'] = TOP
    elif axis_path == 'sleeve.sleeveless':
        ctx['meta.upper'] = TOP
    elif axis_path == 'sleeve.armhole_shape':
        ctx['meta.upper'] = TOP
        ctx['sleeve.sleeveless'] = False
    elif axis_path == 'sleeve.cuff.type':
        ctx['meta.upper'] = TOP
        ctx['sleeve.sleeveless'] = False
        # A cuff on a 0.3 sleeve is a cuff on a cap: the word would not be
        # readable. This is the ONE float this file moves, and it moves for
        # every cuff square equally.
        ctx['sleeve.length'] = 0.8
    return ctx


class Word:
    def __init__(self, axis_path, axis_name, value):
        self.axis_path = axis_path
        self.axis_name = axis_name
        self.value = value
        self.label = word_label(value)
        self.gloss = GLOSS.get((axis_path, value), self.label)
        self.wid = f'{axis_path}={self.label}'
        self.slug = (axis_path.replace('.', '-') + '--' + self.label)

    def design(self):
        d = plain_design()
        for path, v in context_for(self.axis_path, self.value).items():
            set_v(d, path, v)
        set_v(d, self.axis_path, self.value)
        # The back neckline follows the front unless the front is the plain
        # one; a garment with a square front and a round back is two words.
        if self.axis_path == 'collar.f_collar':
            set_v(d, 'collar.b_collar', self.value)
        return d

    def __repr__(self):
        return f'<Word {self.wid}>'


def vocabulary():
    """Every word in the generator's design tree, in axis order."""
    tree = load_tree()
    words = []
    for path, axis_name in AXES:
        node = _node(tree, path)
        rng = list(node['range'])
        if node['type'] == 'select_null' and None not in rng:
            rng.append(None)
        for value in rng:
            words.append(Word(path, axis_name, value))
    return words


# ===========================================================================
# generation — one worker imports the generator once and then loops
# ===========================================================================
# Same law as corpus.py: a fresh interpreter per WORKER, never a shared
# in-process generator, because the generator keeps module state. Each item
# is rebuilt from its own design dict and serialized on its own.
GEN = r"""
import sys, json, yaml, traceback
from pathlib import Path
sys.path.insert(0, {gc!r})
import pygarment as pyg
from assets.garment_programs.meta_garment import MetaGarment
from assets.bodies.body_params import BodyParameters


def _coeff(intf, i):
    for r in intf.ruffle:
        if r['sec'][0] <= i < r['sec'][1]:
            return float(r['coeff'])
    return 1.0


def stitch_intent(piece):
    '''What the generator MEANT each stitch to be, in its own bookkeeping.

    Every interface carries a ruffle coefficient, and the generator matches
    two interfaces by their PROJECTED length: len / coeff. So the length
    ratio it intends for a stitch is coeff_a / coeff_b, exactly. Read here
    and written next to the specification, because the specification does
    not carry it.
    '''
    rows = []

    def collect(c):
        if hasattr(c, '_get_subcomponents'):
            for s in c._get_subcomponents():
                collect(s)
        rules = getattr(getattr(c, 'stitching_rules', None), 'rules', [])
        for rule in rules:
            i1, i2 = rule.int1, rule.int2
            for i in range(min(len(i1.edges), len(i2.edges))):
                rows.append({{
                    'a': {{'panel': i1.panel[i].name,
                          'edge': i1.edges[i].geometric_id}},
                    'b': {{'panel': i2.panel[i].name,
                          'edge': i2.edges[i].geometric_id}},
                    'ruffle_a': _coeff(i1, i),
                    'ruffle_b': _coeff(i2, i),
                }})
    collect(piece)
    return rows


jobs = json.loads(Path(sys.argv[1]).read_text())
body_file = sys.argv[2]

for job in jobs:
    out = Path(job['out'])
    try:
        out.mkdir(parents=True, exist_ok=True)
        with open(out / 'design.yaml', 'w') as f:
            yaml.dump({{'design': job['design']}}, f, sort_keys=True)
        body = BodyParameters(body_file)
        piece = MetaGarment({name!r}, body, job['design'])
        own_gate = bool(piece.is_self_intersecting())
        pattern = piece.assembly()
        pattern.serialize(str(out), tag='', to_subfolder=False,
                          with_3d=False, with_text=False, view_ids=False,
                          with_printable=True)
        with open(out / 'stitch-intent.json', 'w') as f:
            json.dump(stitch_intent(piece), f, indent=1)
        with open(out / 'generator-verdict.json', 'w') as f:
            json.dump({{'is_self_intersecting': own_gate}}, f)
        print('OK ' + job['id'], flush=True)
    except BaseException:
        line = traceback.format_exc().strip().splitlines()[-1]
        print('ERR ' + job['id'] + ' ' + line.replace('\n', ' '), flush=True)
"""


def body_yaml(dest):
    """EU38, girth-graded off the generator's mean body (mapping.py's rule)."""
    sys.path.insert(0, str(HERE))
    import mapping
    body = mapping.graded_body(SIZE_INDEX, [])
    with open(dest, 'w') as f:
        yaml.dump({'body': body}, f, sort_keys=True)
    return dest


def generate_batch(jobs, root, body_file):
    """jobs = [{'id':..., 'design':..., 'out':...}]. Returns {id: err|None}."""
    if not jobs:
        return {}
    jobs_file = Path(root) / f'.jobs-{os.getpid()}-{id(jobs)}.json'
    jobs_file.write_text(json.dumps(jobs))
    script = GEN.format(gc=str(GC_ROOT), name=NAME)
    env = dict(os.environ, MPLBACKEND='Agg')
    r = subprocess.run([str(VENV_PY), '-c', script, str(jobs_file),
                        str(body_file)],
                       cwd=str(GC_ROOT), capture_output=True, text=True,
                       env=env)
    out = {j['id']: 'worker produced no verdict for this item' for j in jobs}
    for line in r.stdout.splitlines():
        if line.startswith('OK '):
            out[line[3:].strip()] = None
        elif line.startswith('ERR '):
            rest = line[4:]
            for j in jobs:
                if rest.startswith(j['id'] + ' '):
                    out[j['id']] = rest[len(j['id']) + 1:]
                    break
    if r.returncode != 0 and all(v is not None for v in out.values()):
        last = (r.stderr.strip().splitlines() or ['?'])[-1]
        out = {j['id']: last for j in jobs}
    try:
        jobs_file.unlink()
    except OSError:
        pass
    return out


# ===========================================================================
# GATE 0 — the machine definition of faultless. Do not loosen this.
# ===========================================================================
def notch_check(spec_path):
    """printpack's own notch audit, without paying for the PDFs.

    Returns (worst_mm, count). The paper is only printed for cells that pass,
    so this runs the measurement and skips the rendering.
    """
    with open(spec_path) as f:
        pattern = json.load(f)['pattern']
    panels = pattern['panels']
    geos = {n: printpack.PanelGeo(n, panels[n]) for n in sorted(panels)}
    records, _, _ = printpack.build_notches(pattern, geos)
    worst = max((abs(r['ratio_diff_mm']) for r in records), default=0.0)
    return worst, len(records)


def _py(x):
    """numpy scalars out of the walk report, so a verdict is JSON."""
    if hasattr(x, 'item'):
        return x.item()
    return x


def gate(out_dir):
    """Everything GATE 0 asks of one generated garment.

    · every panel contour closed
    · no panel crosses itself (1mm walk, four-mark test)
    · mirror symmetry exact, unless the design declared asymmetry
    · every seam pair judged: UNVERIFIABLE zero
    · every seam pair PASS or scored GATHERED-PASS: GATHERED-UNSCORED zero
    · every notch pair agrees under a millimetre by independent integration
    """
    out_dir = Path(out_dir)
    specs = list(out_dir.glob('*_specification.json'))
    if not specs:
        return {'ok': False, 'why': 'generator wrote no specification'}
    design = out_dir / 'design.yaml'
    rep = walklib.walk(specs[0], design if design.exists() else None)
    s = rep['summary']
    b = s['by_status']
    v = {
        'pairs': s['pairs'],
        'fail': b.get('FAIL', 0),
        'unverifiable': b.get('UNVERIFIABLE', 0),
        'unscored': b.get('GATHERED-UNSCORED', 0),
        'pass': b.get('PASS', 0),
        'gathered': b.get('GATHERED-PASS', 0),
        'max_diff_mm': s['max_diff_mm'],
        'not_closed': s['panels_not_closed'],
        'self_intersecting': s['panels_self_intersecting'],
        'mirror_panel': s['mirror_panel_faults'],
        'mirror_seam': len([m for m in rep['mirror_seams']
                            if m['status'] == 'FAIL']),
        'panels': len(rep.get('panels', [])) or s.get('panels'),
    }
    v = {k: _py(x) for k, x in v.items()}
    v['clean'] = (v['fail'] == 0 and v['not_closed'] == 0 and
                  v['self_intersecting'] == 0 and v['mirror_panel'] == 0 and
                  v['mirror_seam'] == 0)
    v['fully_judged'] = (v['unverifiable'] == 0 and v['unscored'] == 0)
    # The notch audit re-integrates every seam by chord, which costs more than
    # the whole seam walk. A pattern that already failed the walk cannot pass
    # GATE 0, so it is not paid for. Skipped is recorded, not read as passed.
    if not (v['clean'] and v['fully_judged']):
        v['notch_worst_mm'] = None
        v['notches'] = 0
        v['notches_ok'] = False
        v['notch_skipped'] = 'not run: the seam walk already failed'
        v['ok'] = False
        v['why'] = _why(v)
        return v
    try:
        worst, n = notch_check(specs[0])
        v['notch_worst_mm'] = round(float(worst), 4)
        v['notches'] = int(n)
        v['notches_ok'] = bool(float(worst) < NOTCH_TOL_MM)
    except Exception as e:                      # noqa: BLE001
        v['notch_worst_mm'] = None
        v['notches'] = 0
        v['notches_ok'] = False
        v['notch_error'] = f'{type(e).__name__}: {e}'
    v['ok'] = v['clean'] and v['fully_judged'] and v['notches_ok']
    if not v['ok']:
        v['why'] = _why(v)
    return v


def _why(v):
    why = []
    if v['fail']:
        why.append(f"{v['fail']} seam(s) fail at {v['max_diff_mm']:.2f}mm")
    if v['not_closed']:
        why.append(f"{v['not_closed']} open contour(s)")
    if v['self_intersecting']:
        why.append(f"{v['self_intersecting']} self-intersecting panel(s)")
    if v['mirror_panel'] or v['mirror_seam']:
        why.append('mirror fault')
    if v['unverifiable']:
        why.append(f"{v['unverifiable']} unjudged pair(s)")
    if v['unscored']:
        why.append(f"{v['unscored']} unscored gather(s)")
    if not v.get('notches_ok') and not v.get('notch_skipped'):
        why.append(v.get('notch_error') or
                   f"notch diff {v.get('notch_worst_mm')}mm")
    return '; '.join(why) or 'gate 0 not satisfied'


# ===========================================================================
# the picture: the pattern piece itself, no decoration
# ===========================================================================
def pattern_png(out_dir):
    p = Path(out_dir) / f'{NAME}_pattern.png'
    return p if p.exists() else None
