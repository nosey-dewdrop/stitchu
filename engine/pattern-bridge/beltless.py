# ============================================================================
# beltless.py — emit the recipe for the same dress with no waistband and the
# skirt cut in n equal panels.
#
# WHY THIS IS A SCRIPT AND NOT A RECIPE. A recipe is data and changing size is
# re-running it against a different body, because size moves numbers and not
# pieces. Panel count moves PIECES: n panels means n outlines, n side seams,
# and a waist ring cut in a different number of places. There is no body
# measurement that can say that, so the thing that varies with n is the recipe
# itself, and this file writes it.
#
# WHAT MAKES IT HARD. With a waistband the band absorbs the mismatch: its
# lower edge is cut into the segments the darted bodice presents, its upper
# edge is one straight line, and the skirt meets that straight line. Take the
# band away and the bodice's waist segments have to meet the skirt's waist
# directly, while the panel seams cut that same ring at n equal steps that
# know nothing about where the darts fell. So the waist ring is split at the
# UNION of the two, and both sides are cut at every position in it.
#
# The ring runs from centre front, through the left side and around to centre
# back, at which point the mirror copies carry it back to centre front. Ring
# distance is FINISHED length, so mapping a ring position onto the back waist
# line adds back the darts that lie between it and centre back.
# ============================================================================
import argparse
import json
from pathlib import Path

import mapping
import material

HERE = Path(__file__).resolve().parent
BASE = HERE / 'drafts' / 'eu38-fitted-dress.json'

# The left half of the waist ring, centre front to centre back, as the pieces
# and edges that already carry it. Each entry is one drawn waist edge:
#   piece, first point of the edge, ring position of that point,
#   ring position of the end of the edge, and how a ring position inside the
#   edge becomes a drawn point.
WAIST_RUN = [
    ('left_ftorso', 'f_cf_waist', '0', 'f_seg_cf', 'front_cf'),
    ('left_ftorso', 'f_d1b', 'f_seg_cf', 'front_waist', 'front_side'),
    ('left_btorso', 'b_side_waist', 'front_waist',
     'front_waist + b_seg_side', 'back_side'),
    ('left_btorso', 'b_d_out_a', 'front_waist + b_seg_side',
     'front_waist + b_seg_side + b_seg_mid', 'back_mid'),
    ('left_btorso', 'b_d_in_a', 'front_waist + b_seg_side + b_seg_mid',
     'front_waist + back_waist', 'back_cb'),
]
HALF = 'front_waist + back_waist'   # ring position of centre back


def split_point(pid, ring, how):
    """A point on the waist line at ring position `ring`, drawn the way that
    stretch of the waist is drawn."""
    if how == 'front_cf':
        # the front waist is level and measured from centre front
        return {'id': pid, 'op': 'origin', 'x': ring, 'y': '0'}
    if how == 'front_side':
        # past the waist dart, so the drawn x carries the dart's width
        return {'id': pid, 'op': 'origin', 'x': f'({ring}) + front_dart_w',
                'y': '0'}
    # the back waist line is slanted, so a position on it is a distance ALONG
    # it from centre back, and the darts between here and centre back are part
    # of that distance even though they are not part of the finished ring
    darts = {'back_cb': '0', 'back_mid': 'back_dart_w',
             'back_side': '2*back_dart_w'}[how]
    return {'id': pid, 'op': 'along', 'a': 'b_cb_waist', 'b': 'b_side_waist',
            'length': f'(({HALF}) - ({ring})) + {darts}'}


def build_recipe(n_panels, base=None):
    base = base or json.loads(BASE.read_text())
    scope = material.Scope(mapping.graded_body(mapping.SIZES.index('EU38'), []))
    for v in base['variables']:
        scope.declare(v['name'], v['formula'])
    ev = scope.eval
    waist, half = ev('waist'), ev(HALF)

    # ---- where the ring is cut ------------------------------------------
    # bodice boundaries on the left half, then the panel boundaries, then the
    # union. Positions are carried as formulas and compared as numbers.
    bodice_edges = [(ev(a), ev(b), piece, start, how)
                    for piece, start, a, b, how in WAIST_RUN]
    panel_cuts = [(k * waist / n_panels, f'{k}*waist/{n_panels}')
                  for k in range(1, n_panels)
                  if 1e-9 < k * waist / n_panels < half - 1e-9]

    # every bodice waist edge, cut at the panel boundaries inside it
    sub_edges = []          # (ring_start, ring_end, piece, start_point_id)
    extra_points = []       # points inserted into the bodice paths
    inserts = {}            # (piece, after_point_id) -> [point ids in order]
    for lo, hi, piece, start, how in bodice_edges:
        inner = [(pos, f) for pos, f in panel_cuts if lo + 1e-9 < pos < hi - 1e-9]
        prev_id, prev_pos = start, lo
        for i, (pos, formula) in enumerate(inner):
            pid = f'wcut_{piece}_{start}_{i}'
            extra_points.append(split_point(pid, formula, how))
            inserts.setdefault((piece, start), []).append(pid)
            sub_edges.append((prev_pos, pos, piece, prev_id))
            prev_id, prev_pos = pid, pos
        sub_edges.append((prev_pos, hi, piece, prev_id))

    # ---- the bodice, with those points in its paths ----------------------
    pieces, seam_syms = [], []
    for piece in base['pieces']:
        if piece['name'] in ('wb_front', 'wb_back', 'skirt_front', 'skirt_back'):
            continue
        p = json.loads(json.dumps(piece))
        path = []
        for step in p['path']:
            path.append(step)
            for pid in inserts.get((p['name'], step['pt']), []):
                path.append({'pt': pid})
        p['path'] = path
        pieces.append(p)

    # base seams, carried as (piece, point the edge leaves from) so that
    # inserting points cannot silently renumber them
    dropped = ('wb_front', 'wb_back', 'skirt_front', 'skirt_back')
    for a, b in base['seams']:
        (pa, ia), (pb, ib) = (a.split(':'), b.split(':'))
        if pa in dropped or pb in dropped:
            continue
        seam_syms.append(((pa, base_point(base, pa, int(ia))),
                          (pb, base_point(base, pb, int(ib)))))

    # ---- the skirt -------------------------------------------------------
    pieces += skirt_pieces(n_panels, sub_edges, waist, half, ev, seam_syms)

    points = [p for p in base['points']
              if not p['id'].startswith(('wbf_', 'wbb_', 'sf_', 'sb_'))]
    points += extra_points

    # A copy is the same drawing reflected, and reflecting a closed outline
    # reverses the direction it is walked in, so the copy's edge numbering
    # runs backwards: its edge N-1-i is its parent's edge i. Seams are carried
    # as (piece, the point its parent's edge leaves from) precisely so that
    # this conversion happens in one place instead of in every seam.
    index_now, mirrored = {}, {}
    for pc in pieces:
        index_now[pc['name']] = {s['pt']: i for i, s in enumerate(pc['path'])}
        for c in pc.get('copies', []):
            index_now[c['name']] = index_now[pc['name']]
            mirrored[c['name']] = len(pc['path'])

    def edge_no(piece, pt):
        i = index_now[piece][pt]
        return mirrored[piece] - 1 - i if piece in mirrored else i

    seams = [[f'{pa}:{edge_no(pa, qa)}', f'{pb}:{edge_no(pb, qb)}']
             for (pa, qa), (pb, qb) in seam_syms]

    return {
        'name': f'eu38-beltless-{n_panels}panel',
        'what': [
            f'The same fitted bodice with no waistband, over a skirt cut in '
            f'{n_panels} equal panels. The bodice meets the skirt directly, so '
            'the waist ring is cut at every position either side needs and '
            'both sides are cut at all of them.',
        ],
        'variables': base['variables'] + panel_vars(n_panels),
        'points': points,
        'pieces': pieces,
        'seams': seams,
    }


def base_point(base, piece, edge):
    """The parent point a base-recipe edge leaves from. On a copy the walk
    runs backwards, so its edge `edge` is its parent's edge N-1-edge."""
    for pc in base['pieces']:
        if pc['name'] == piece:
            return pc['path'][edge]['pt']
        for c in pc.get('copies', []):
            if c['name'] == piece:
                return pc['path'][len(pc['path']) - 1 - edge]['pt']
    raise KeyError(piece)


def panel_vars(n):
    return [
        {'name': 'pan_waist', 'formula': f'waist/{n}',
         'why': f'each of the {n} panels carries the same share of the waist'},
        {'name': 'pan_hip', 'formula': f'hips/{n}',
         'why': 'and the same share of the hip'},
        {'name': 'pan_take', 'formula': f'(hips - waist)/(2*{n})',
         'why': 'so each side seam of a panel leans in by half the difference'},
        {'name': 'pan_turn', 'formula': 'atanD(pan_take/hips_line)',
         'why': 'the panel seam leaves the hip line square and leans in to the '
                'waist, so its tangent turns by this much'},
        {'name': 'arc_k_pan',
         'formula': '(4/3)*tanD(pan_turn/4)/(2*sinD(pan_turn/2))',
         'why': 'the same circular-arc control length as the armhole, the '
                'neckline and the two-piece skirt, for this turn'},
        {'name': 'pan_r', 'formula': 'hips/6.283185307179586',
         'why': 'the body read as a cylinder, only so the panels can be laid '
                'around it for display'},
    ]


def skirt_pieces(n, sub_edges, waist, half, ev, seam_syms):
    """n panels round the ring, each cut at every boundary that falls in it,
    and the seams that join them to each other and to the bodice."""
    # the full ring of bodice sub-edges: the left half as drawn, then the same
    # positions reflected through centre back onto the mirror pieces
    ring = [(lo, hi, piece, pt) for lo, hi, piece, pt in sub_edges]
    for lo, hi, piece, pt in reversed(sub_edges):
        other = ('right_' + piece[5:]) if piece.startswith('left_') else piece
        ring.append((2 * half - hi, 2 * half - lo, other, pt))
    cuts = sorted({r for lo, hi, _, _ in ring for r in (lo, hi)}
                  | {k * waist / n for k in range(n + 1)})

    pieces = []
    for k in range(n):
        a, b = k * waist / n, (k + 1) * waist / n
        inside = [c for c in cuts if a + 1e-9 < c < b - 1e-9]
        name = panel_name(k, n)
        path = [{'pt': f'{name}_hem_l'}, {'pt': f'{name}_hem_r'},
                {'pt': f'{name}_hip_r',
                 'curve': curve('r', name)},
                {'pt': f'{name}_w_r'}]
        # the waist is walked from the panel's right edge back to its left
        for j, _ in enumerate(reversed(inside)):
            path.append({'pt': f'{name}_w_{j}'})
        path += [{'pt': f'{name}_w_l', 'curve': curve('l', name)},
                 {'pt': f'{name}_hip_l'}]
        pieces.append({'name': name, 'label': 'leg',
                       'place': place_of(k, n), 'path': path,
                       'points': panel_points(name, k, n, inside, a, b)})

        # waist attach: this panel's waist sub-edges, right to left, against
        # the bodice sub-edges that occupy the same stretch of the ring
        bounds = [a] + inside + [b]
        for j in range(len(bounds) - 1):
            lo, hi = bounds[len(bounds) - 2 - j], bounds[len(bounds) - 1 - j]
            mid = (lo + hi) / 2.0
            match = [(p, q) for rlo, rhi, p, q in ring if rlo < mid < rhi]
            if len(match) != 1:
                raise ValueError(f'panel {k} waist {lo:.4f}..{hi:.4f} matched '
                                 f'{len(match)} bodice edges')
            seam_syms.append(((name, path[3 + j]['pt']), match[0]))

    # panel to panel, all the way round
    for k in range(n):
        cur, nxt = panel_name(k, n), panel_name((k + 1) % n, n)
        seam_syms.append(((cur, f'{cur}_hem_r'), (nxt, f'{nxt}_hip_l')))
        seam_syms.append(((cur, f'{cur}_hip_r'), (nxt, f'{nxt}_w_l')))
    return pieces


def panel_name(k, n):
    """Panels that have a mirror are named so the mirror audit finds it.
    Reflecting the ring through centre front sends panel k to panel n-1-k."""
    j = n - 1 - k
    if j == k:
        return f'skirt_p{k}'
    return (f'left_skirt_p{min(k, j)}' if k < j
            else f'right_skirt_p{min(k, j)}')


def curve(side, name):
    a, b = ((f'{name}_hip_r', f'{name}_w_r') if side == 'r'
            else (f'{name}_hip_l', f'{name}_w_l'))
    if side == 'r':
        return {'op': 'spline', 'angle1': '90',
                'length1': f'arc_k_pan*Line_{a}_{b}',
                'angle2': f'AngleLine_{b}_{a}',
                'length2': f'arc_k_pan*Line_{a}_{b}'}
    return {'op': 'spline', 'angle1': f'AngleLine_{b}_{a}',
            'length1': f'arc_k_pan*Line_{a}_{b}',
            'angle2': '90', 'length2': f'arc_k_pan*Line_{a}_{b}'}


def panel_points(name, k, n, inside, a, b):
    pts = [
        {'id': f'{name}_hem_l', 'op': 'origin', 'x': '0', 'y': '0'},
        {'id': f'{name}_hem_r', 'op': 'origin', 'x': 'pan_hip', 'y': '0'},
        {'id': f'{name}_hip_r', 'op': 'origin', 'x': 'pan_hip',
         'y': 'skirt_len'},
        {'id': f'{name}_hip_l', 'op': 'origin', 'x': '0', 'y': 'skirt_len'},
        {'id': f'{name}_w_r', 'op': 'origin', 'x': 'pan_hip - pan_take',
         'y': 'skirt_waist_y'},
        {'id': f'{name}_w_l', 'op': 'origin', 'x': 'pan_take',
         'y': 'skirt_waist_y'},
    ]
    for j, cut in enumerate(reversed(inside)):
        # the cut is a ring position; on the panel it is that far from the
        # panel's own left end, carried as a formula so it grades
        frac = (cut - a) / (b - a)
        pts.append({'id': f'{name}_w_{j}', 'op': 'origin',
                    'x': f'pan_take + {frac!r}*pan_waist',
                    'y': 'skirt_waist_y'})
    return pts


def place_of(k, n):
    ang = 360.0 * ((k + 0.5) / n)
    return [f'pan_r*sinD({ang!r}) - pan_hip/2',
            'waist_level - skirt_waist_y', f'pan_r*cosD({ang!r})']


def main():
    ap = argparse.ArgumentParser(
        description='write the recipe for the beltless dress with an '
                    'n-panel skirt')
    ap.add_argument('--panels', type=int, required=True)
    ap.add_argument('-o', '--out', required=True)
    args = ap.parse_args()
    rec = build_recipe(args.panels)
    # panel points are declared per piece; hoist them into the recipe's points
    pts = list(rec['points'])
    for pc in rec['pieces']:
        pts += pc.pop('points', [])
    rec['points'] = pts
    Path(args.out).write_text(json.dumps(rec, indent=2))
    print(f"{args.out}: {len(rec['pieces'])} pieces, {len(rec['seams'])} "
          f"seams, {args.panels}-panel skirt, no waistband")


if __name__ == '__main__':
    main()
