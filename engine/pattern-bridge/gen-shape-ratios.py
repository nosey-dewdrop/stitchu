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
                    "GarmentCode's own code, not assumed. ONLY incl_deg is still "
                    'consumed by the surface. TUR 16A measured width_cm against '
                    'Aldrich in eight sizes and it is -19.3...-10.6mm SHORT in all '
                    "eight, one direction; the chart's own shoulderCM lands within "
                    '+5.2...-2.9mm, so sizechart.hpp now drives the shoulder tip '
                    'from the chart column. width_cm is kept and published because '
                    'it is what the mean body says, and because retiring a number '
                    'silently is how the two shoulder widths got confused in the '
                    'first place.',
        'sizes': mapping.SIZES,
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
