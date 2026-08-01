# ============================================================================
# seamrules.py — WHAT KIND OF SEAM IS THIS, AND WHAT IS IT ALLOWED TO DO.
#
# The layer walk.py was missing. Until now every stitch pair was judged by one
# rule, |a - b| <= 1mm, and that rule is wrong in three separate directions:
#
#   1. A sleeve cap is longer than the armhole BY DESIGN. Audaces ships a
#      "Descontar" field and Richpeace a 容量 field for exactly this number.
#      Judged by equality, a correctly drafted sleeve fails.
#   2. A back shoulder is longer than the front BY DESIGN, for the shoulder
#      blade. abs() throws the sign away, so a REVERSED shoulder passes as
#      long as it is small. Direction is the whole check, magnitude is not.
#   3. A pair we cannot classify was tested against the equality rule anyway
#      and silently passed. A pair that was never really checked is not a
#      pair that passed. It gets its own verdict here.
#
# Nothing in this file is guessed. Every band carries its source in the
# comment above it, and knowledge/drafting-math-eu38.md is the ground.
#
# CLASSIFICATION IS STRUCTURAL, NOT BY LABEL. In a real specification 78 of
# 94 edges carry no label at all, so the kind of a seam is derived from the
# panel roles, from whether the two sides belong to the same panel, and from
# where the seam sits on the body in world coordinates. That is the part no
# other tool does: every validator surveyed on 2026-08-02 takes the pairing,
# and the meaning of the pairing, as human input.
# ============================================================================
import math

# ---------------------------------------------------------------------------
# TOLERANCES
# ---------------------------------------------------------------------------
# The production standard, not the hobby one. Kathleen Fasanella, thirty years
# a production patternmaker: "My standard is 1/32. A sewing contractor is far
# more exacting than a home sewer." 1/32 inch = 0.79375 mm.
TOL_EQUAL_MM = 0.79375

# Below this a difference is arithmetic noise from curve sampling, not a
# pattern fact. svgpathtools .length() is adaptive; two identical curves
# measured twice agree far below this.
TOL_NOISE_MM = 0.01

# ---------------------------------------------------------------------------
# BANDS THAT ARE NOT EQUALITY
# ---------------------------------------------------------------------------
# Back shoulder longer than front, for the shoulder blade. Standard practice,
# recorded in CLAUDE.md 29 Jul from the field: normally 6-12mm, and the bought
# couture pattern sits at 1.0mm, which is tighter than standard but valid.
# So the band is open at the bottom and closed at 12mm. What is NOT allowed is
# the front coming out longer: that is a reversed shoulder at any magnitude.
SHOULDER_BACK_LONGER_MAX_MM = 12.0

# Cap ease = cap seam length - armhole length, over the WHOLE armhole.
# knowledge/drafting-math-eu38.md, HIGH confidence: woven fitted 30-45mm, by
# fabric shirt ~10mm, dress/blouse 20-30mm, jacket 40-60mm, and above 75mm the
# draft itself is suspect. There is a documented dissent: Fasanella holds that
# a well matched cap wants ~0 ease. Two schools, so this is NOT a pass/fail
# gate. The number is reported and named, and only the figure both schools
# call broken is failed.
CAP_EASE_ABSURD_MM = 75.0
CAP_EASE_SCHOOLS = [
    (-2.0, 2.0, 'zero-ease (Fasanella school: a cap that walks the armhole)'),
    (2.0, 15.0, 'light (shirt weight)'),
    (15.0, 35.0, 'dress/blouse'),
    (35.0, 62.0, 'jacket'),
]

# Underarm to notch, both sides of the armhole: 0% ease, matches the armhole
# exactly. Everyone agrees on this one (knowledge file, HIGH). We can only
# check it when notch positions exist; without them the claim is unverifiable
# and is reported as such rather than assumed.
TOL_UNDERARM_SEGMENT_MM = TOL_EQUAL_MM


# ---------------------------------------------------------------------------
# VERDICTS
# ---------------------------------------------------------------------------
PASS = 'PASS'
FAIL = 'FAIL'
UNVERIFIABLE = 'UNVERIFIABLE'   # we could not establish what this seam is
REPORTED = 'REPORTED'           # measured, but the field has no single answer


# ---------------------------------------------------------------------------
# GEOMETRY HELPERS
# ---------------------------------------------------------------------------
def edge_midpoint_world_height(panel, edge):
    """Height of an edge's midpoint in world coordinates, in cm.

    Panel vertices are 2D in the panel plane; the panel carries a translation
    and an euler rotation. In every specification measured so far the torso
    rotations are zero and the sleeves rotate about Z only, so the Z rotation
    is the one that moves panel-local y into world height. If a specification
    ever carries a non-zero X or Y rotation this returns None rather than a
    wrong number, and everything that depends on height becomes unverifiable.
    """
    rx, ry, rz = panel['rotation']
    if abs(rx) > 1e-6 or abs(ry) > 1e-6:
        return None
    a = panel['vertices'][edge['endpoints'][0]]
    b = panel['vertices'][edge['endpoints'][1]]
    mx, my = (a[0] + b[0]) / 2.0, (a[1] + b[1]) / 2.0
    t = math.radians(rz)
    return panel['translation'][1] + (mx * math.sin(t) + my * math.cos(t))


def side_of(panel_name):
    """left / right / centre, from the stable GarmentCode naming."""
    n = panel_name.lower()
    if n.startswith('left_') or '_left' in n:
        return 'left'
    if n.startswith('right_') or '_right' in n:
        return 'right'
    return 'centre'


def mirror_name(panel_name):
    """The name of this panel's mirror, or None if it has none."""
    n = panel_name
    if n.startswith('left_'):
        return 'right_' + n[5:]
    if n.startswith('right_'):
        return 'left_' + n[6:]
    return None


def front_back_of(panel_name):
    """front / back / None, from the stable GarmentCode naming."""
    n = panel_name.lower()
    if 'ftorso' in n or n.startswith('wb_front') or 'front' in n:
        return 'front'
    if 'btorso' in n or n.startswith('wb_back') or 'back' in n:
        return 'back'
    return None


def role_of(panel_name, panel):
    """Coarse role. Panel labels ('body'/'arm'/'leg') are trusted when present
    because GarmentCode writes them for every panel; the waistband is split
    out of 'body' by name because it behaves differently at the waist."""
    n = panel_name.lower()
    if n.startswith('wb'):
        return 'waistband'
    # A collar and a hood carry the label 'body', the same label the bodice
    # carries, and a seam between two things labelled 'body' has no front and
    # no back to tell a shoulder from a side seam. They were 52 of the 160
    # pairs a 57 pattern corpus could not judge. They are split out by name
    # for the same reason the waistband is: what they attach to is a neckline
    # and a neckline has its own rule.
    if 'collar' in n:
        return 'collar'
    if 'hood' in n:
        return 'hood'
    label = (panel.get('label') or '').lower()
    if label in ('arm', 'body', 'leg'):
        return {'arm': 'sleeve', 'body': 'torso', 'leg': 'skirt'}[label]
    if 'sleeve' in n:
        return 'sleeve'
    if 'skirt' in n:
        return 'skirt'
    if 'torso' in n:
        return 'torso'
    return None


# ---------------------------------------------------------------------------
# CLASSIFICATION
# ---------------------------------------------------------------------------
# Kinds and the rule each one is judged by:
#   dart              EQUAL   two legs of one dart, same panel
#   sleeve-seam       EQUAL   sleeve panel to sleeve panel
#   armhole-cap       CAP     sleeve to torso, judged as a group not a pair
#   shoulder          DIRECTIONAL  back longer than front, 0..12mm
#   side-seam         EQUAL   front torso to back torso, below the armhole
#   centre-seam       EQUAL   left panel to its own right mirror
#   waist-attach      EQUAL   torso or skirt to waistband, or skirt straight
#                             to the bodice when there is no waistband
#   neckline-attach   EQUAL   a collar or a hood to the body
#   collar-seam       EQUAL   collar to collar, or collar to hood
#   skirt-seam        EQUAL   skirt to skirt
#   gathered          RATIO   handled by the caller, from design intent
#   unknown           -       reported UNVERIFIABLE, never silently passed
# ---------------------------------------------------------------------------
def classify(a_panel_name, a_panel, a_edge, b_panel_name, b_panel, b_edge,
             shoulder_height_cm=None):
    """Return (kind, why). `why` records the evidence, so a wrong call is
    traceable to the signal that made it rather than to a hunch."""
    if a_panel_name == b_panel_name:
        return 'dart', 'both sides belong to the same panel'

    ra = role_of(a_panel_name, a_panel)
    rb = role_of(b_panel_name, b_panel)
    if ra is None or rb is None:
        return 'unknown', f'panel role not established ({a_panel_name}/{b_panel_name})'
    roles = {ra, rb}

    if roles == {'sleeve'}:
        return 'sleeve-seam', 'both panels are sleeve panels'
    if roles == {'sleeve', 'torso'}:
        return 'armhole-cap', 'one sleeve panel, one torso panel'
    if roles == {'skirt'}:
        return 'skirt-seam', 'both panels are skirt panels'
    if 'waistband' in roles:
        return 'waist-attach', f'one waistband panel ({ra}/{rb})'
    # A skirt joined straight to the bodice with no waistband between them.
    # The same seam as waist-attach and the same rule; only the piece it lands
    # on differs. 108 of the 160 unjudged pairs on the 57 pattern corpus.
    if roles == {'torso', 'skirt'}:
        return 'waist-attach', 'skirt joined to the bodice, with no waistband'
    if roles & {'collar', 'hood'}:
        if roles <= {'collar', 'hood'}:
            return 'collar-seam', f'two neckline pieces ({ra}/{rb})'
        return 'neckline-attach', f'a neckline piece joined to the body ({ra}/{rb})'

    if roles == {'torso'}:
        if mirror_name(a_panel_name) == b_panel_name:
            return 'centre-seam', 'the two panels are each other\'s mirror'
        fa, fb = front_back_of(a_panel_name), front_back_of(b_panel_name)
        if fa is None or fb is None or fa == fb:
            return 'unknown', f'torso pair with no front/back split ({fa}/{fb})'
        ha = edge_midpoint_world_height(a_panel, a_edge)
        hb = edge_midpoint_world_height(b_panel, b_edge)
        if ha is None or hb is None:
            return 'unknown', 'panel carries an X or Y rotation; height is not derivable'
        if shoulder_height_cm is None:
            return 'unknown', 'no shoulder height reference for this garment'
        h = (ha + hb) / 2.0
        if abs(h - shoulder_height_cm) < 1e-9:
            return 'shoulder', f'highest front-to-back torso seam on the body ({h:.1f}cm)'
        return 'side-seam', f'front-to-back torso seam below the shoulder ({h:.1f}cm)'

    return 'unknown', f'unhandled role combination ({ra}/{rb})'


def shoulder_reference_height(panels, stitches):
    """The height of the highest front-to-back torso seam. That seam is the
    shoulder; everything else joining front to back is the side seam, which
    may be split into several segments by the armhole and the waist.

    Returns None when the garment has no front-to-back torso seam at all, in
    which case every such pair stays unknown rather than being guessed at."""
    best = None
    for st in stitches:
        a, b = st[0], st[1]
        if a['panel'] == b['panel']:
            continue
        pa, pb = panels[a['panel']], panels[b['panel']]
        if role_of(a['panel'], pa) != 'torso' or role_of(b['panel'], pb) != 'torso':
            continue
        if mirror_name(a['panel']) == b['panel']:
            continue
        fa, fb = front_back_of(a['panel']), front_back_of(b['panel'])
        if fa is None or fb is None or fa == fb:
            continue
        ha = edge_midpoint_world_height(pa, pa['edges'][a['edge']])
        hb = edge_midpoint_world_height(pb, pb['edges'][b['edge']])
        if ha is None or hb is None:
            continue
        h = (ha + hb) / 2.0
        if best is None or h > best:
            best = h
    return best


# ---------------------------------------------------------------------------
# RULES
# ---------------------------------------------------------------------------
def judge_equal(len_a, len_b, tol=TOL_EQUAL_MM):
    diff = abs(len_a - len_b)
    return (PASS if diff <= tol else FAIL), {
        'rule': f'equal within {tol:.5f}mm (1/32 inch, production standard)',
        'diff_mm': round(diff, 4),
    }


def judge_shoulder(front_len, back_len):
    """Direction first, magnitude second. A front shoulder longer than the
    back is a reversed shoulder however small it is, because the extra length
    exists for the shoulder blade and the blade is at the back."""
    excess = back_len - front_len
    detail = {
        'rule': f'back longer than front by 0..{SHOULDER_BACK_LONGER_MAX_MM}mm '
                '(blade ease; direction is the check, not the size)',
        'front_mm': round(front_len, 4),
        'back_mm': round(back_len, 4),
        'back_excess_mm': round(excess, 4),
    }
    if excess < -TOL_NOISE_MM:
        detail['violation'] = 'reversed: the FRONT shoulder is the longer one'
        return FAIL, detail
    if excess > SHOULDER_BACK_LONGER_MAX_MM:
        detail['violation'] = (f'blade ease {excess:.2f}mm exceeds '
                               f'{SHOULDER_BACK_LONGER_MAX_MM}mm')
        return FAIL, detail
    return PASS, detail


def name_cap_ease(ease_mm):
    for lo, hi, name in CAP_EASE_SCHOOLS:
        if lo <= ease_mm < hi:
            return name
    if ease_mm < CAP_EASE_SCHOOLS[0][0]:
        return 'negative: the cap is shorter than the armhole'
    return 'above every published band'


def judge_cap_ease(cap_total_mm, armhole_total_mm):
    """Cap ease is a design decision with two schools, so this reports rather
    than gates. Only the figure both schools call a bad draft fails."""
    ease = cap_total_mm - armhole_total_mm
    detail = {
        'rule': 'cap ease reported and named; only >%.0fmm fails, because the '
                'field holds two positions on the right amount'
                % CAP_EASE_ABSURD_MM,
        'cap_mm': round(cap_total_mm, 4),
        'armhole_mm': round(armhole_total_mm, 4),
        'cap_ease_mm': round(ease, 4),
        'school': name_cap_ease(ease),
    }
    if abs(ease) > CAP_EASE_ABSURD_MM:
        detail['violation'] = 'outside every published band; suspect draft'
        return FAIL, detail
    return REPORTED, detail
