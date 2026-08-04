# ============================================================================
# mapping.py — two jobs that share one size ladder, and only one of them
# leaves this repository.
#
# GRADED BODY (graded_body, SIZES, GRADE_PER_SIZE). EU size -> 26 body
# measurements. Reads bodies/mean_all.yaml, which lives here. This is what
# draft.py hands to material.py, and nothing on this side needs a generator
# to be installed.
#
# ATOLYE STATE -> DESIGN (the rest of the file). Turns the workshop's own
# state (M + FLAGS + _neckShape + size) into a design tree for the third
# party generator, for the corpus and catalogue work that judges that
# generator. Every mapping is LINEAR over two documented ranges, ours from
# engine/tools/atolye/ingredients.js and theirs from the design yaml, and
# carries its reasoning as a comment. Anything the generator cannot express
# is not silently swallowed, it goes to the notes list and is written next
# to the output as mapping-notes.json (field, what was done, what was lost).
# Base design template: probe/stitchu_fitted_dress.yaml, a full design tree
# of which only 'v' values are overridden; ranges and types stay theirs.
# ============================================================================
import copy
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent
DESIGN_TEMPLATE = HERE / 'probe' / 'stitchu_fitted_dress.yaml'
# The measurements the drawing path grades from are ours to read, so they sit
# in this package. Nothing under core/third_party needs to exist for draft.py
# to run; the copy and its provenance are in bodies/mean_all.yaml.
BASE_BODY = HERE / 'bodies' / 'mean_all.yaml'

SIZES = ['EU34', 'EU36', 'EU38', 'EU40', 'EU42', 'EU44', 'EU46', 'EU48']


def lin(x, x0, x1, y0, y1):
    """Linear map [x0,x1] -> [y0,y1], clamped to the target interval."""
    t = (x - x0) / (x1 - x0)
    t = min(1.0, max(0.0, t))
    return y0 + t * (y1 - y0)


# ---------------------------------------------------------------------------
# Body: EU size -> graded body yaml (26 measurements, cm).
# mean_all.yaml has bust 99.84cm; EU size = bust/2 - 6 puts it at ~EU44
# (index 5). Grading is the standard EU girth grade: 4cm per size on the
# four girths, half of that on back widths (the back carries ~half the
# girth change), 1cm on shoulder width. Heights/lengths are NOT graded
# (length grade exists in real grading; loss is recorded in notes).
# ---------------------------------------------------------------------------
BASE_SIZE_INDEX = 5  # mean_all.yaml ~= EU44

GRADE_PER_SIZE = {
    'bust': 4.0,          # standard EU bust grade
    'underbust': 4.0,     # follows bust
    'waist': 4.0,         # standard EU waist grade
    'hips': 4.0,          # standard EU hip grade
    'back_width': 2.0,    # back carries ~half the bust girth change
    'waist_back_width': 2.0,
    'hip_back_width': 2.0,
    'shoulder_w': 1.0,    # shoulder grades ~1cm per size
    'neck_w': 0.5,        # neck grades slowly
    'leg_circ': 2.0,      # half the hip grade
    'wrist': 0.25,
    'bust_points': 0.5,   # bust points spread with girth
    'bum_points': 0.5,
    'armscye_depth': 0.5,  # armhole depth grades ~0.5cm per size
}


def graded_body(size_index, notes):
    with open(BASE_BODY) as f:
        body = yaml.safe_load(f)['body']
    delta = size_index - BASE_SIZE_INDEX
    for key, step in GRADE_PER_SIZE.items():
        body[key] = round(body[key] + delta * step, 4)
    notes.append({
        'field': 'size',
        'value': SIZES[size_index],
        'action': f'girth-graded mean_all.yaml by {delta} sizes '
                  f'({", ".join(GRADE_PER_SIZE)})',
        'lost': 'length grade: height/waist_line/arm_length stay at the '
                'mean-body values; only girths and widths are graded',
    })
    return body


# ---------------------------------------------------------------------------
# Neck shape: the only truly discrete dial in the atolye.
#
# 2026-08-01: the atolye's neck family grew to six. Two of the new members are
# not curve families at all (measured against the flat pen, byte comparison):
#   'boat'  the pen has no boat curve; a boat neck IS a wide+shallow round one,
#           so the atolye's boat button just moves the width/depth dials.
#           Here it is the same CircleNeckHalf, and the width already arrives
#           through collar.width below -> nothing is lost, no note needed.
#   'wrap'  a surplice is an overlapping FRONT, not a neck curve. GarmentCode
#           has no wrap front, so the base curve is the round one and the wrap
#           itself is recorded as a loss (see the flag loop below).
# A missing key used to raise KeyError and take the whole service down with a
# 500; the lookup is now defensive and says what it did.
# ---------------------------------------------------------------------------
NECK_SHAPE = {
    'round': 'CircleNeckHalf',
    'v': 'VNeckHalf',
    'square': 'SquareNeckHalf',
    'sweetheart': 'Bezier2NeckHalf',  # approximation, see note below
    'boat': 'CircleNeckHalf',         # = wide round; width carries it
    'wrap': 'CircleNeckHalf',         # base curve under the surplice
}


def map_state(state):
    """atolye state dict -> (design dict, body dict, notes list)."""
    with open(DESIGN_TEMPLATE) as f:
        design = yaml.safe_load(f)['design']
    design = copy.deepcopy(design)
    notes = []

    def set_v(path, value):
        node = design
        for p in path[:-1]:
            node = node[p]
        node[path[-1]]['v'] = value

    # --- size -> graded body ------------------------------------------------
    size_index = int(state.get('size', 2))
    body = graded_body(size_index, notes)

    # --- levels ---------------------------------------------------------------
    # hemLevel 8..112 (our full crop..maxi dial) -> skirt.length -0.2..0.95
    # (their fraction of leg length below the waist). Both dials mean
    # "where the hem ends on the body", so ends map to ends linearly.
    hem = lin(state['hemLevel'], 8, 112, -0.2, 0.95)

    # neckDepth 2..30 cm (front-center drop) -> collar.fc_depth 0.3..2
    # (their unitless front-collar depth factor). Linear ends-to-ends;
    # fc_angle stays at the template's 95deg (we have no angle dial).
    set_v(['collar', 'fc_depth'], round(lin(state['neckDepth'], 2, 30, 0.3, 2.0), 4))

    # neckDepthBack 1..20 cm -> collar.bc_depth 0..2, same reasoning.
    set_v(['collar', 'bc_depth'], round(lin(state['neckDepthBack'], 1, 20, 0.0, 2.0), 4))

    # neckWidth 0.85..1.75 (our widening factor, bateau = big) ->
    # collar.width -0.5..1 (their shoulder-ward widening). Ends-to-ends.
    set_v(['collar', 'width'], round(lin(state['neckWidth'], 0.85, 1.75, -0.5, 1.0), 4))

    # _neckShape -> front collar curve family. Back stays CircleNeckHalf:
    # in the atolye the shape dial describes the FRONT neckline; a round
    # back is the default construction in both systems.
    shape = state.get('_neckShape', 'round')
    if shape not in NECK_SHAPE:
        notes.append({
            'field': '_neckShape', 'value': shape,
            'action': 'unknown neck shape -> fell back to CircleNeckHalf',
            'lost': 'whatever that shape meant; add it to mapping.NECK_SHAPE',
        })
    set_v(['collar', 'f_collar'], NECK_SHAPE.get(shape, 'CircleNeckHalf'))
    set_v(['collar', 'b_collar'], 'CircleNeckHalf')
    if shape == 'sweetheart':
        # Bezier2NeckHalf with a high inner control point is the closest
        # single-curve stand-in for a sweetheart; the true two-lobe heart
        # form (center peak) cannot be expressed -> recorded as loss.
        set_v(['collar', 'f_bezier_x'], 0.4)
        set_v(['collar', 'f_bezier_y'], 0.3)
        notes.append({
            'field': '_neckShape',
            'value': 'sweetheart',
            'action': 'approximated with Bezier2NeckHalf (f_bezier 0.4/0.3)',
            'lost': 'the center peak of a true sweetheart; GarmentCode has '
                    'no two-lobe neckline curve',
        })

    # --- sleeves --------------------------------------------------------------
    # sleeve flag: our "kol var" == their not-sleeveless.
    set_v(['sleeve', 'sleeveless'], not bool(state.get('sleeve', True)))

    # sleeveLen 5..48 cm -> sleeve.length 0.1..1.15 (fraction of arm).
    set_v(['sleeve', 'length'], round(lin(state['sleeveLen'], 5, 48, 0.1, 1.15), 4))

    # sleeveWidth 3..15 cm (circumference dial) drives BOTH of their width
    # params linearly: connecting_width 0..2 (at the armhole) and
    # end_width 0.2..2 (at the hem) — one circumference dial, uniform tube.
    set_v(['sleeve', 'connecting_width'], round(lin(state['sleeveWidth'], 3, 15, 0.0, 2.0), 4))
    set_v(['sleeve', 'end_width'], round(lin(state['sleeveWidth'], 3, 15, 0.2, 2.0), 4))

    # capPuff 0..4 (cap height dial) -> sleeve.connect_ruffle 1..2 (their
    # gather ratio at the cap; gathering is how a puff cap is built).
    set_v(['sleeve', 'connect_ruffle'], round(lin(state['capPuff'], 0, 4, 1.0, 2.0), 4))

    # --- fit ------------------------------------------------------------------
    # waistNip 0..0.38 (amount REMOVED at the waist; 0 = box) splits into
    # their discrete upper choice + continuous width:
    #   waistNip >= 0.08 -> FittedShirt (darted bodice), else Shirt (box).
    #   shirt.width 1.3..1.0 INVERSE-linear: more nip = less ease.
    fitted = state['waistNip'] >= 0.08
    design['meta']['upper']['v'] = 'FittedShirt' if fitted else 'Shirt'
    set_v(['shirt', 'width'], round(lin(state['waistNip'], 0.0, 0.38, 1.3, 1.0), 4))

    # --- bodice base ---------------------------------------------------------
    # 2026-08-01: the atolye used to have ONE 'aski' checkbox doing two jobs
    # (band bodice + strap pieces). They are separate controls now, and this
    # side has to follow: the BAND BASE is what maps to shirt.strapless.
    # Old states carry no _bodice; falling back to the straps flag keeps them
    # mapping exactly as before.
    band_bodice = state.get('_bodice', 'band' if state.get('straps') else 'shoulder') == 'band'
    if band_bodice:
        set_v(['shirt', 'strapless'], True)
        set_v(['sleeve', 'sleeveless'], True)
        notes.append({
            'field': '_bodice',
            'value': 'band',
            'action': 'mapped to shirt.strapless=true (band bodice)',
            'lost': 'nothing at the bodice base; GarmentCode drafts the same '
                    'strapless torso',
        })
    if state.get('straps'):
        notes.append({
            'field': 'straps/strapWidth/strapLen',
            'value': [state.get('strapWidth'), state.get('strapLen')],
            'action': 'not mapped',
            'lost': 'the strap pieces themselves; GarmentCode cannot draft '
                    'spaghetti straps (strapWidth/strapLen dropped)',
        })

    # --- topology: dress or top ----------------------------------------------
    # THE HONEST GATE. A top is not a short dress: it has no skirt panel at
    # all. GarmentCode says this natively -- meta.bottom is a select_null and
    # None is inside its own range (assets/design_params/default.yaml) -- so a
    # top maps to "upper only, no bottom, no waistband". Nothing is invented.
    #
    # What CANNOT be said, and is therefore recorded rather than faked:
    # their FittedShirt draws its length from the body (bodice.py:105,
    # length = body['waist_line'] - back_adjustment) and IGNORES shirt.length.
    # So a FITTED top always ends at the natural waist; cropped/hip/tunic only
    # survives on the boxy Shirt program (tee.py:34 reads shirt.length as a
    # fraction of waist_line). We do not silently ship a waist-length pattern
    # for a tunic: the loss is written into mapping-notes.json.
    is_top = state.get('_garment') == 'top'
    if is_top:
        design['meta']['bottom']['v'] = None
        design['meta']['wb']['v'] = None
        # our continuous hem dial rounds to the pen's three top buckets
        hem_lvl = state.get('hemLevel', 16)
        bucket = min([('cropped', 5), ('hip', 16), ('tunic', 30)],
                     key=lambda b: abs(b[1] - hem_lvl))[0]
        # Shirt length is a fraction of waist_line measured from the shoulder:
        # 1.0 lands on the natural waist, so cropped sits above it and tunic
        # below. Ends map to ends over their own 0.5..3.5 range.
        length_frac = {'cropped': 0.9, 'hip': 1.2, 'tunic': 1.55}[bucket]
        set_v(['shirt', 'length'], length_frac)
        notes.append({
            'field': '_garment', 'value': 'top',
            'action': f'meta.bottom=None, meta.wb=None, shirt.length='
                      f'{length_frac} ({bucket})',
            'lost': 'nothing at the topology level; a top is upper-only',
        })
        if fitted:
            notes.append({
                'field': 'hemLevel/topLength', 'value': [hem_lvl, bucket],
                'action': 'shirt.length written but NOT USED by FittedShirt',
                'lost': 'THE TOP LENGTH. GarmentCode FittedShirt takes its '
                        'length from body.waist_line (bodice.py) and ignores '
                        'shirt.length, so this pattern ends at the natural '
                        'waist whatever the dial says. Only the boxy Shirt '
                        'program (waistNip < 0.08) honours the length.',
            })

    # --- skirt (DRESS ONLY; a top has no bottom, meta.bottom stays None) ------
    if not is_top:
        # skirtFull 1.0..2.9 (added fabric; 1.0 straight, ~1.95 A, 2.6+ klos)
        # picks the skirt program, then drives its own flare dial:
        #   gorePanels flag  -> SkirtManyPanels (goreCount -> n_panels)
        #   skirtFull >= 2.6 -> SkirtCircle (klos), suns 1.0..1.95
        #   else             -> Skirt2, flare int 0..20 over 1.0..2.6
        skirt_full = state['skirtFull']
        if state.get('gorePanels'):
            design['meta']['bottom']['v'] = 'SkirtManyPanels'
            n = int(min(15, max(4, state.get('goreCount', 6))))
            design['flare-skirt']['skirt-many-panels']['n_panels']['v'] = n
            set_v(['flare-skirt', 'length'], round(lin(state['hemLevel'], 8, 112, 0.2, 0.95), 4))
            set_v(['flare-skirt', 'suns'], round(lin(skirt_full, 1.0, 2.9, 0.1, 1.95), 4))
            if state.get('goreCount', 6) < 4:
                notes.append({
                    'field': 'goreCount', 'value': state['goreCount'],
                    'action': 'clamped to 4', 'lost': 'their n_panels floor is 4',
                })
        elif skirt_full >= 2.6:
            design['meta']['bottom']['v'] = 'SkirtCircle'
            set_v(['flare-skirt', 'length'], round(lin(state['hemLevel'], 8, 112, 0.2, 0.95), 4))
            set_v(['flare-skirt', 'suns'], round(lin(skirt_full, 2.6, 2.9, 1.0, 1.95), 4))
        else:
            design['meta']['bottom']['v'] = 'Skirt2'
            set_v(['skirt', 'length'], round(hem, 4))
            set_v(['skirt', 'flare'], int(round(lin(skirt_full, 1.0, 2.6, 0, 20))))

        # gatherRatio 1.0..3.4 (how many widths gathered in) -> skirt.ruffle
        # 1..2. Identity below 2, CLIPPED above their ceiling -> noted.
        ruffle = min(2.0, state['gatherRatio'])
        set_v(['skirt', 'ruffle'], round(ruffle, 4))
        if state['gatherRatio'] > 2.0:
            notes.append({
                'field': 'gatherRatio', 'value': state['gatherRatio'],
                'action': 'clipped to 2.0',
                'lost': 'gather beyond 2x; their skirt.ruffle ceiling is 2',
            })
        # skirt.ruffle is a Skirt2 dial; circle/gore skirts do not gather.
        if state['gatherRatio'] > 1.05 and design['meta']['bottom']['v'] != 'Skirt2':
            notes.append({
                'field': 'gatherRatio', 'value': state['gatherRatio'],
                'action': 'ignored for ' + design['meta']['bottom']['v'],
                'lost': 'waist gathering; only their Skirt2 has a ruffle dial',
            })

        # yokeDrop 6..26 cm (waist-seam height; empire = small) -> skirt.rise
        # 1.0..0.5 INVERSE-linear (their 1.0 = natural waist, lower = dropped).
        set_v(['skirt', 'rise'], round(lin(state['yokeDrop'], 6, 26, 1.0, 0.5), 4))
        if state['yokeDrop'] < 12:
            notes.append({
                'field': 'yokeDrop', 'value': state['yokeDrop'],
                'action': 'mapped into skirt.rise (floor: natural waist)',
                'lost': 'an empire seam ABOVE the natural waist; their rise '
                        'cannot go above 1.0',
            })

    # --- everything the target system cannot say (recorded, not swallowed) ---
    for field, why in [
        ('armholeHollow', 'armhole scoop depth; their armhole_shape is a '
                          'curve-family choice, not a depth dial'),
        ('shoulderSlope', 'shoulder slope comes from the body '
                          '(shoulder_incl), not from the design'),
        ('bustProject', 'bust dart volume comes from body bust/underbust, '
                        'not from a design dial'),
        ('bustHeight', 'bust height comes from body bust_line'),
        ('skirtCurve', 'side-seam bow (cone vs bombe fall) is fixed per '
                       'skirt program'),
        ('ruffle', 'applied hem ruffle strip; no hem-ruffle program in '
                   'their dress stack'),
        ('cuffGather', 'cuff gather needs a cuff band; enabling cuff.type '
                       'changes the garment beyond what the dial promises'),
        ('collarWidth', 'sewn-on collar BAND depth; their collar component '
                        'styles (Turtle/Lapel/Hood) are different objects'),
        ('collarGap', 'collar band front gap; same reason'),
        ('shirrRows', 'shirring row count; no shirring in GarmentCode'),
        ('tieLength', 'neck/waist ties; no tie pieces in GarmentCode'),
        ('laceWidth', 'lace/binding strip depth; trim, not a drafted piece'),
        ('laceScallops', 'lace scallop count; trim, not a drafted piece'),
    ]:
        if field in state:
            notes.append({'field': field, 'value': state[field],
                          'action': 'not mapped', 'lost': why})

    # A top carries no bottom at all, so the skirt dials were never read.
    if is_top:
        for field in ['skirtFull', 'gatherRatio', 'goreCount', 'yokeDrop']:
            if field in state:
                notes.append({'field': field, 'value': state[field],
                              'action': 'not mapped (topology = top)',
                              'lost': 'nothing: a top has no skirt panel, so '
                                      'no skirt dial applies'})

    for flag, why in [
        ('collar', 'sewn-on neck band (see collarWidth)'),
        ('princessSeam', 'FittedShirt shapes with darts; the dart AMOUNT '
                         'survives, its PATH (princess seam) does not'),
        ('backSeam', 'their torso back is drafted whole or per their own '
                     'panel plan; no center-back-seam switch'),
        ('tie', 'no tie pieces'),
        ('tieBack', 'no tie pieces'),
        ('wrapTie', 'no tie pieces'),
        ('shirr', 'no shirring'),
        ('casing', 'no drawstring casing'),
        ('cfGather', 'centre-front gathering; no shirring/gather at the '
                     'neckline in their bodice stack'),
        ('laceNeck', 'trim, not geometry'),
        ('laceSleeve', 'trim, not geometry'),
        ('laceHem', 'trim, not geometry'),
        # --- 2026-08-01, the newly unlocked pen fields. Every one of them is
        # a real cut in the flat and NONE of them exists in GarmentCode, so
        # every one is written down instead of quietly disappearing.
        ('gorePanels', 'panelled skirt is mapped when it is a dress; on a '
                       'top there is no bottom to panel'),
        ('spaghettiStrap', 'shoulder-tied spaghetti strap: no strap pieces '
                           'in GarmentCode'),
        ('fittedBand', 'fitted (contoured) band bodice: their strapless '
                       'torso has one width, no separate band draft'),
        ('boxy', 'boxy cut is expressed through waistNip -> Shirt vs '
                 'FittedShirt + shirt.width; the pen ALSO opens the waist to '
                 'the bust line, which their Shirt does by construction'),
        ('peplumRuffle', 'ruffle strip on the peplum hem; no peplum, so no '
                         'peplum ruffle'),
    ]:
        if state.get(flag):
            notes.append({'field': flag, 'value': True,
                          'action': 'not mapped', 'lost': why})

    # Enum-valued fields whose non-default value the target system cannot say.
    if state.get('_neckShape') == 'wrap':
        notes.append({
            'field': '_neckShape', 'value': 'wrap',
            'action': 'base curve = CircleNeckHalf, surplice NOT drafted',
            'lost': 'the wrap/surplice front itself: no overlapping-panel '
                    'front in their dress stack',
        })
    if state.get('_peplum', 'none') != 'none':
        notes.append({
            'field': '_peplum', 'value': state['_peplum'],
            'action': 'not mapped',
            'lost': 'the peplum is a separate flared piece seamed at the '
                    'waist; GarmentCode has no peplum program (their '
                    'flare-skirt starts at the waist and IS the bottom)',
        })
    if state.get('_waistTie', 'none') != 'none':
        notes.append({
            'field': '_waistTie', 'value': state['_waistTie'],
            'action': 'not mapped', 'lost': 'no tie pieces in GarmentCode',
        })
    if state.get('_wrapDir', 'right') != 'right':
        notes.append({
            'field': '_wrapDir', 'value': state['_wrapDir'],
            'action': 'not mapped',
            'lost': 'wrap overlap direction; there is no wrap front to give '
                    'a direction to (see _neckShape=wrap above)',
        })

    # Pen-only dials: they shape the DRAWING, not the garment. A real
    # pattern has no ink density; nothing is lost garment-wise.
    for field in ['foldCount', 'drape', 'hemWave', 'hemDip', 'seed',
                  '_ink', '_asym']:
        if field in state:
            notes.append({'field': field, 'value': state[field],
                          'action': 'not mapped (pen-only)',
                          'lost': 'nothing: drawing style, not geometry'})

    return design, body, notes
