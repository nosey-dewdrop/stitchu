#!/usr/bin/env python3
# ============================================================================
# gen-shape-ratios — the body's FRONT/BACK split becomes a contract.
#
# Why this file exists. The engine modelled every cross-section as a centred
# ellipse, so the body had no front and no back: the printpack referee measured
# all four torso panels as ONE shape to 0.0000mm ("8 panels -> 2 pieces drawn").
# No real dress is cut that way. The fix needs one number per ring — how much of
# the girth belongs to the back — and that number must not be invented.
#
# WHERE IT COMES FROM (verified, not assumed). GarmentCode's own garment
# programs use back_width as an ARC of the girth, not a chord:
#     assets/garment_programs/bodice.py:22
#         front_frac = (body['bust'] - body['back_width']) / 2 / body['bust']
#     assets/garment_programs/bands.py:50
#         self.waist_back_frac = body['waist_back_width'] / body['waist']
#     assets/garment_programs/circle_skirt.py:150,156
#         front gets (waist - waist_back_width), back gets waist_back_width
# So back_width / girth is exactly the back's share of the girth arc, and that
# is what this file publishes.
#
# HONEST NOTE ON THE DRIFT (do not hide this). mapping.py grades by adding the
# same centimetres to the girth and to the back width, so the RATIO drifts with
# size: bust 47.19% at EU34 to 47.92% at EU48. That drift is an artefact of the
# grading rule, not an anthropometric measurement. It is small, it is monotone,
# and it is published here rather than smoothed away. mean_all (the MIT source
# body, ~EU44) sits at 47.75 / 46.41 / 52.98 and the EU44 row reproduces it.
#
#   gen-shape-ratios.py           write the contract JSON + the generated header
#   gen-shape-ratios.py --check   exit 1 if either is stale (harness H0/H1)
# ============================================================================
import json
import sys
from pathlib import Path

import mapping

ROOT = Path(__file__).resolve().parents[2]
OUT_JSON = ROOT / 'contract/layers/shape-ratios.json'
OUT_HPP = ROOT / 'engine/src/shaperatios.gen.hpp'

# ring name -> (girth field, back-arc field) in the graded body
RINGS = [
    ('bust', 'bust', 'back_width'),
    ('waist', 'waist', 'waist_back_width'),
    ('hip', 'hips', 'hip_back_width'),
]


# ---------------------------------------------------------------------------
# COLUMN CENSUS (TUR 17B, 2026-08-17). CARRYING EIGHT SIZES DOES NOT MAKE A
# COLUMN EIGHT MEASUREMENTS. Every column this file publishes descends from ONE
# body — bodies/mean_all.yaml, a single mean set anchored at ~EU44 — pushed
# through mapping.py's linear GRADE_PER_SIZE rule. Nothing here was measured on
# eight bodies, and nothing here was measured on eight garments. The census is
# published next to the numbers rather than hidden, because a reader who sees
# eight rows will otherwise assume eight readings.
#
# The signature is mechanical and reproducible from the JSON alone:
#   - a stretched column has a PERFECTLY CONSTANT step and a FROZEN decimal tail
#     (shoulder.width_cm: +1.0000 x7, tail .4568 in all eight rows)
#   - a copied column has a ZERO step (shoulder.incl_deg: 21.6777 x8, tail .6777)
#   - back_arc_fraction LOOKS measured because its steps decay, but it is the
#     ratio of two stretched numbers, so its curvature is arithmetic, not
#     anthropometry: (back + 2*delta) / (girth + 4*delta) over one (back, girth)
#     pair. That is the same fact the drift_note above states; the census names
#     it as PROVENANCE rather than as drift.
#
# Underlying body, counted (mapping.GRADE_PER_SIZE vs bodies/mean_all.yaml):
# 26 measurements, 16 stretched linearly off one number, 10 frozen at one number
# (arm_length, arm_pose_angle, bust_line, crotch_hip_diff, head_l, height,
# hip_inclination, hips_line, shoulder_incl, vert_bust_line). ZERO of the 26 is
# eight readings.
#
# ★ AND THE FROZEN SLOPE IS NOT A DEFECT — MEASURED, NOT ASSUMED. Tur 17B took
# the shoulder-seam slope off Buğra's bought industrial pattern (Locket Top,
# eight nested rings, PDF vector, mm calibrated) in all eight sizes, each piece
# measured against its own centre-front / centre-back fold edge so sheet
# rotation cannot enter (flatten-research/20-shoulder-slope.py):
#     front  12.5070 ... 12.6865 deg   range 0.1795 deg, NOT monotone
#     back   19.0619 ... 19.1493 deg   range 0.0874 deg, NOT monotone
# A real graded pattern holds shoulder SLOPE constant across eight sizes and
# grades shoulder LENGTH instead (front 63.00 -> 67.75mm, back 63.93 -> 68.70mm).
# So incl_deg standing still is the RIGHT behaviour and the thing that ought to
# grade — the width — already does. What is NOT verified is the VALUE 21.6777:
# it is nape-to-tip drop in this engine's construction (bodysurface.cpp) while
# the measured 12.6/19.1 are neck-point-to-tip seam slopes on a flat piece.
# Different quantities; the measurement licenses the CONSTANCY, not the number.
# ---------------------------------------------------------------------------
COLUMN_CENSUS = {
    '_law': 'carrying eight sizes does not make a column eight measurements; '
            'every column below is ONE number from bodies/mean_all.yaml pushed '
            'through mapping.py GRADE_PER_SIZE',
    'back_arc_fraction.bust': 'STRETCHED — ratio of two linearly graded numbers '
                              '(back_width +2.0/size over bust +4.0/size, both off '
                              'the single mean_all body). The decaying step is '
                              'arithmetic curvature, not anthropometry.',
    'back_arc_fraction.waist': 'STRETCHED — waist_back_width +2.0/size over waist '
                               '+4.0/size, same single body.',
    'back_arc_fraction.hip': 'STRETCHED — hip_back_width +2.0/size over hips '
                             '+4.0/size, same single body.',
    'shoulder.width_cm': 'STRETCHED — mean_all shoulder_w 36.4568 at EU44, +1.0000cm '
                         'per size, decimal tail .4568 frozen in all eight rows. '
                         'This is the column TUR 16A measured -19.3...-10.6mm short '
                         'of Aldrich in 8/8 sizes; the linear stretch off one anchor '
                         'is the mechanical reason a single-direction miss is possible.',
    'shoulder.incl_deg': 'COPIED — mean_all shoulder_incl 21.6777, absent from '
                         'GRADE_PER_SIZE, so one number appears eight times. ★ TUR 17B '
                         'measured a real 8-size industrial pattern and the shoulder '
                         'slope IS constant there (front range 0.18 deg, back range '
                         '0.09 deg, neither monotone) while shoulder LENGTH grades. '
                         'The constancy is therefore CORRECT and is no longer an open '
                         'question; the VALUE 21.6777 is a different quantity from what '
                         'was measured (nape-to-tip drop vs neck-point-to-tip seam '
                         'slope) and stays UNVERIFIED. Evidence: '
                         'flatten-research/20-shoulder-slope.py.',
    'EU50_EU52': 'ABSENT, and publishing incl_deg alone would NOT unblock them: '
                 'sizechart.hpp grafts a whole BackArcRow, so EU50/EU52 carry '
                 'shoulderWidthCM 0 AND shoulderInclDeg 0 AND all three back arc '
                 'fractions 0. Measured TUR 17B: surface-pattern EU50 does not draft '
                 'a shoulderless garment, it ABORTS — "need neck/shoulder/bust/waist/'
                 'hip rings". Extending mapping.SIZES to ten would extrapolate +4cm '
                 'girth per size while the chart itself steps +6cm from EU46 on, so '
                 'the two rows are a CHART decision, not a generator token.',
}


def build():
    table = {}
    shoulder = {}
    for i, label in enumerate(mapping.SIZES):
        b = mapping.graded_body(i, [])
        table[label] = {ring: round(b[back] / b[girth], 6)
                        for ring, girth, back in RINGS}
        # SHOULDER is shape, not girth: a chart gives shoulder-to-shoulder ACROSS
        # the body and never a girth around it. shoulder_w/2 is the x of the
        # shoulder tip in GarmentCode's own panels (bodice.py:58,
        # base_classes.py:37), and shoulder_incl is the slope in DEGREES
        # (body_params.py sets _shoulder_incl = shoulder_incl, and every use site
        # feeds it to np.deg2rad).
        shoulder[label] = {'width_cm': round(b['shoulder_w'], 4),
                           'incl_deg': round(b['shoulder_incl'], 4)}
    return {
        'comment': 'BACK share of the girth arc, per EU size. Source: '
                   'engine/pattern-bridge/bodies/mean_all.yaml (MIT) graded by '
                   'mapping.py. Semantics verified against GarmentCode bodice.py:22, '
                   'bands.py:50, circle_skirt.py:150 — back_width is an ARC of the '
                   'girth, not a chord. Produced by gen-shape-ratios.py; edit '
                   'mapping.py, then regenerate.',
        'drift_note': 'the ratio moves with size because the grade adds equal cm '
                      'to girth and to back width; that is a grading artefact, not '
                      'a measurement, and it is published rather than smoothed',
        'neck': 'NO SOURCE for a neck front/back split — the neck ring stays '
                'symmetric (0.5) and that is a DECLARED ASSUMPTION, not data',
        'shoulder_note': 'shoulder.width_cm is TIP-TO-TIP across the body and '
                    'shoulder.incl_deg is the slope in degrees; both verified in '
                    "GarmentCode's own code, not assumed. ⚠ width_cm IS THE WRONG "
                    'NUMBER FOR THIS BODY AND IS STILL THE ONE THE SURFACE USES. '
                    'TUR 16A measured it against Aldrich in eight sizes: -19.3...'
                    "-10.6mm SHORT in all eight, one direction, while the chart's "
                    'own shoulderCM lands within +5.2...-2.9mm. The switch to the '
                    'chart column was built, measured and BACKED OUT because it '
                    'breaks spec_census stitch-count constancy and with it three '
                    'shipped gates; the record and the ordered way out are in the '
                    "note over sizechart.hpp's grafting loop. This is published "
                    'rather than smoothed, and it is not a tolerance.',
        'sizes': mapping.SIZES,
        'column_census': COLUMN_CENSUS,
        'back_arc_fraction': table,
        'shoulder': shoulder,
    }


def header(doc):
    rows = ''.join(
        '    {{"{s}", {b}, {w}, {h}, {sw}, {si}}},\n'.format(
            s=s,
            b=doc['back_arc_fraction'][s]['bust'],
            w=doc['back_arc_fraction'][s]['waist'],
            h=doc['back_arc_fraction'][s]['hip'],
            sw=doc['shoulder'][s]['width_cm'],
            si=doc['shoulder'][s]['incl_deg'])
        for s in doc['sizes'])
    return (
        '#pragma once\n'
        '// GENERATED by engine/pattern-bridge/gen-shape-ratios.py from mapping.py\n'
        '// via contract/layers/shape-ratios.json — DO NOT EDIT.\n'
        '//\n'
        '// BACK share of the girth ARC per ring. Semantics verified in\n'
        '// GarmentCode\'s own programs (bodice.py:22, bands.py:50,\n'
        '// circle_skirt.py:150): back_width is an arc of the girth, not a chord.\n'
        '// 0.5 would mean "no front and no back", which is what the engine had.\n'
        '// The neck ring has NO source and stays 0.5 as a declared assumption.\n'
        '//\n'
        '// A plain table, not an X-macro: this one is consumed inside a function\n'
        '// body, and a macro expanding to statements there is a parse trap.\n'
        '\n'
        'namespace stitchu {\n'
        'namespace contract {\n'
        '\n'
        'struct BackArcRow {\n'
        '    const char* label;\n'
        '    double bust, waist, hip;\n'
        '    double shoulderWidthCM, shoulderInclDeg;\n'
        '};\n'
        '\n'
        '// Sizes absent here (EU50/EU52) have no published ratio and keep 0, so\n'
        '// the surface visibly falls back to the symmetric section.\n'
        'inline constexpr BackArcRow kBackArcFraction[] = {\n'
        + rows +
        '};\n'
        '\n'
        '} // namespace contract\n'
        '} // namespace stitchu\n')


def main():
    doc = build()
    fresh_json = json.dumps(doc, indent=2, ensure_ascii=False) + '\n'
    fresh_hpp = header(doc)
    if '--check' in sys.argv:
        stale = []
        if not OUT_JSON.exists() or OUT_JSON.read_text() != fresh_json:
            stale.append(str(OUT_JSON))
        if not OUT_HPP.exists() or OUT_HPP.read_text() != fresh_hpp:
            stale.append(str(OUT_HPP))
        if stale:
            print('shape-ratios BAYAT: ' + ', '.join(stale) +
                  ' — gen-shape-ratios.py koş')
            return 1
        print('shape-ratios taze')
        return 0
    OUT_JSON.write_text(fresh_json)
    OUT_HPP.write_text(fresh_hpp)
    print(f'yazıldı: {OUT_JSON}')
    print(f'yazıldı: {OUT_HPP}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
