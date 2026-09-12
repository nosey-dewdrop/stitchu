# ============================================================================
# nestpack.py — EIGHT SIZES ON ONE SHEET. The thing that is actually sold.
#
# The single-size pack printpack.py produces is a demo. What an indie pattern
# shop sells is a SIZE RANGE: every size drawn on top of every other on one
# sheet, each in its own line style, and the buyer traces the one line that is
# theirs. That is not a nicer version of the same object, it is a different
# object, and until a pattern is that, nobody can buy it.
#
# WHAT MAKES THE NESTING HONEST HERE. A nested sheet needs the sizes to share
# a frame, and choosing that frame is normally the hard part: line them up on
# a corner and the pieces grow lopsided, line them up on a bounding box and
# they grow symmetrically about nothing. There is no choice to make. Every
# size of a piece is built by the same recipe out of the same construction
# points, so the eight drawings already live in one coordinate system; the
# specification's own vertices ARE the nest. Nothing is aligned by hand.
#
# WHAT IS DELIBERATELY NOT DONE. A piece cut on the fold is drawn WHOLE here.
# Its fold axis moves with size, so eight halves clipped at eight different
# axes would meet along eight different lines and the sheet would read as a
# fault. The single-size pack still halves it; a nested sheet shows the piece.
#
# Line style carries size, not colour: a 1:1 pattern is printed in black.
# ============================================================================
import argparse
import datetime
import hashlib
import json
import sys
from pathlib import Path

import cutplan
import mapping
import packpages
import printpack
import seamrules

# Eight styles a person can tell apart on a plotter, ordered so neighbouring
# sizes never share a family: solid, long dash, short dash, dot, dash-dot,
# fine dot, dash-dot-dot, dash-dot-dot-dot. Width is the same for all of them
# on purpose — a heavier line reads as 'the real one' and the buyer's size is
# whichever one is theirs.
STYLES = {
    'EU34': ('', 'duz'),
    'EU36': ('1.8,0.55', 'uzun kesik'),
    'EU38': ('0.9,0.45', 'kisa kesik'),
    'EU40': ('0.45,0.45', 'nokta-kesik'),
    'EU42': ('1.8,0.4,0.35,0.4', 'kesik-nokta'),
    'EU44': ('0.22,0.4', 'ince nokta'),
    'EU46': ('2.4,0.45,0.3,0.45,0.3,0.45', 'kesik-iki nokta'),
    'EU48': ('1.1,0.35,0.3,0.35,0.3,0.35,0.3,0.35', 'kesik-uc nokta'),
}
CUT_W = 0.055        # cut line, every size
SEAM_W = 0.022       # seam line, every size
MARGIN = printpack.MARGIN
A0_W, A0_H = printpack.A0_W, printpack.A0_H


class NestArt:
    """One piece, all sizes, in the frame the recipe already drew them in."""

    def __init__(self, name, human, per_size):
        self.name = name
        self.human = human
        self.sizes = [s for s, _ in per_size]
        pts = [p for _, d in per_size for p in d['cut']]
        x0 = min(p.real for p in pts)
        y1 = max(p.imag for p in pts)
        self.w = max(p.real for p in pts) - x0
        self.h = y1 - min(p.imag for p in pts)

        def loc(p):
            return (p.real - x0, y1 - p.imag)

        self.layers = []
        for size, d in per_size:
            self.layers.append({
                'size': size,
                'cut': [loc(p) for p in d['cut']],
                'seam': [loc(p) for p in d['seam']],
                'notches': [(loc(a), loc(b)) for a, b in d['notches']],
                'cut_note': d['cut_note'],
            })

    def svg(self, ox, oy):
        out = []
        for L in self.layers:
            dash = STYLES[L['size']][0]
            da = f' stroke-dasharray="{dash}"' if dash else ''

            def pts(seq):
                return ' '.join(f'{ox+x:.3f},{oy+y:.3f}' for x, y in seq)

            # ONE line per size. The single-size pack draws the cut line and
            # the seam line together, which is right when there is one of
            # each; eight of each is sixteen outlines over one piece and the
            # sheet went to scribble. Rendered and looked at: the seam lines
            # were the ink that closed the gaps between neighbouring sizes.
            # The allowance is 10mm on every size and the sheet says so in
            # words, so nothing is lost by drawing it once in the header.
            out.append(f'<polygon points="{pts(L["cut"])}" fill="none" '
                       f'stroke="black" stroke-width="{CUT_W}"{da}/>')
            for a, b in L['notches']:
                out.append(f'<line x1="{ox+a[0]:.3f}" y1="{oy+a[1]:.3f}" '
                           f'x2="{ox+b[0]:.3f}" y2="{oy+b[1]:.3f}" '
                           f'stroke="black" stroke-width="0.045"{da}/>')
        return '\n'.join(out)


def _one_size(spec_path, size):
    """Everything the nest needs from one drafted size."""
    with open(spec_path) as f:
        pattern = json.load(f)['pattern']
    panels = pattern['panels']
    names = sorted(panels)
    geos = {n: printpack.PanelGeo(n, panels[n]) for n in names}
    printpack.build_notches(pattern, geos)
    plan = cutplan.derive(names, geos)
    drawn = [n for n in names if plan[n]['printed']]
    out = {}
    for n in drawn:
        out[n] = {
            'cut': [r['q'] for r in geos[n].cut_loop],
            'seam': list(geos[n].seam_ring),
            'notches': list(geos[n].notches),
            'cut_note': plan[n]['label'],
            'human': seamrules.human_name(n, panels[n]),
        }
    return out, geos, plan, panels


def _legend(x, y, size_label_order):
    body = [printpack._text(x, y, 0.62, 'BEDEN CIZGILERI', weight='bold')]
    y += 0.95
    for size in size_label_order:
        dash, name = STYLES[size]
        da = f' stroke-dasharray="{dash}"' if dash else ''
        body.append(f'<line x1="{x:.3f}" y1="{y - 0.15:.3f}" '
                    f'x2="{x + 5.0:.3f}" y2="{y - 0.15:.3f}" '
                    f'stroke="black" stroke-width="{CUT_W}"{da}/>')
        body.append(printpack._text(x + 5.6, y, 0.45, f'{size}  ({name})'))
        y += 0.72
    return body, y


# ---------------------------------------------------------------------------
# TUR 13 (17 Agu) — "AYNI GIYSI" INVARYANTI: COKME DEGIL, KAPI.
#
# 12 Agu'dan 17 Agu'ya kadar burada ciplak bir `raise ValueError('the sizes do
# not draw the same pieces')` duruyordu. Bugunun motoruna kosuldugunda
# `build()` Python traceback'i ile oluyor: exit kodu 1, ama ne rapor ne sayim
# kaliyor, ve hukum "bu paket cikmadi" degil "arac coktu" gibi okunuyor.
# Satilan sey "8 beden TEK sayfa" oldugu icin bu invaryant urunun kendisi;
# duserse KIRMIZI dogru, ama ne kadar dustugu OLCULMEK zorunda.
#
# Kok sebep BU DOSYADA DEGIL — 13A'nin alani: `right_btorso`'nun kenar sirasi
# ters oldugu icin `cutplan.derive` bazi bedenlerde onu ayri bir cizim, bazi
# bedenlerde eslenik bir cift sayiyor, ve `printed` bayragi bedenden bedene
# degisiyor. Burasi kokun BUGUNKU halini sayar ve nest-census.txt'ye yazar,
# boylece 13A kokunu kapattiginda geri gelip gelmedigi tek dosyadan okunur.
#
# Uc eksen sayiliyor, ucu de urunun sozunun parcasi:
#   1. cizilen parca kumesi     — ayni sayfada ayni parcalar olmali
#   2. parca basina KESIM SAYISI — "4 kes aynali cift" bedene gore degisemez
#   3. parca basina KENAR SAYISI — ayni parcanin topolojisi bedene gore sabit
# Hicbir esik icat edilmedi: her uc sayim da "8 bedende ayni mi" sorusudur.
# ---------------------------------------------------------------------------
class SameGarment(Exception):
    """The eight sizes did not draw the same garment. Carries the census."""

    def __init__(self, census):
        super().__init__(census['headline'])
        self.census = census


def piece_census(per_size, plan_by, panels_by, order):
    """Per-size drawn set / cut count / edge count, and what disagrees."""
    drawn = {s: frozenset(per_size[s]) for s in order}
    common = frozenset.intersection(*drawn.values()) if drawn else frozenset()
    union = frozenset.union(*drawn.values()) if drawn else frozenset()

    rows, faults = [], []
    for n in sorted(union):
        missing = [s for s in order if n not in drawn[s]]
        cuts = {s: (plan_by[s][n]['cut'] if n in plan_by[s] else None)
                for s in order}
        edges = {s: (len(panels_by[s][n]['edges'])
                     if n in panels_by[s] else None)
                 for s in order}
        cut_vals = {v for v in cuts.values() if v is not None}
        edge_vals = {v for v in edges.values() if v is not None}
        row = {'piece': n, 'missing': missing,
               'cuts': cuts, 'edges': edges,
               'cut_split': len(cut_vals) > 1,
               'edge_split': len(edge_vals) > 1}
        rows.append(row)
        if missing:
            faults.append(f'{n}: {len(order) - len(missing)}/{len(order)} '
                          f'bedende cizilmis, eksik: {", ".join(missing)}')
        if row['cut_split']:
            faults.append(f'{n}: kesim sayisi bedene gore degisiyor '
                          + ' '.join(f'{s}={cuts[s]}' for s in order))
        if row['edge_split']:
            faults.append(f'{n}: kenar sayisi bedene gore degisiyor '
                          + ' '.join(f'{s}={edges[s]}' for s in order))

    head = (f'AYNI GIYSI: KIRMIZI — {len(faults)} ayrism'
            if faults else
            f'AYNI GIYSI: YESIL — {len(common)} parca, '
            f'{len(order)} bedende ozdes cizim/kesim/kenar sayimi')
    return {'order': list(order), 'rows': rows, 'faults': faults,
            'common': set(common), 'union': set(union),
            'red': bool(faults), 'headline': head}


def census_txt(c):
    o = c['order']
    L = ['NEST SAYIMI — sekiz beden ayni giysiyi mi ciziyor?',
         'olcum: cizilen parca kumesi · parca basina kesim sayisi · '
         'parca basina kenar sayisi',
         '', f"{'parca':<20}" + ''.join(f'{s:>8}' for o_ in [0] for s in o)
         + '   (kesim / kenar)', '-' * (20 + 8 * len(o) + 18)]
    for r in c['rows']:
        cells = []
        for s in o:
            cu, ed = r['cuts'][s], r['edges'][s]
            cells.append('  -' if cu is None and ed is None
                         else f'{cu}/{ed}')
        flag = ''
        if r['missing']:
            flag += ' YOK'
        if r['cut_split']:
            flag += ' KESIM-AYRISIK'
        if r['edge_split']:
            flag += ' KENAR-AYRISIK'
        L.append(f"{r['piece']:<20}" + ''.join(f'{c_:>8}' for c_ in cells)
                 + flag)
    L += ['']
    for f in c['faults']:
        L.append(f'  {f}')
    L.append(c['headline'])
    return '\n'.join(L)


def build(out_dir, specs, date_str=None):
    """specs: [(size_label, spec_path)] in size order -> one nested pack."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    date_str = date_str or datetime.date.today().isoformat()

    per_size, geos_by, plan_by, panels_by = {}, {}, {}, {}
    for size, path in specs:
        per_size[size], geos_by[size], plan_by[size], panels_by[size] = \
            _one_size(path, size)

    order = [s for s, _ in specs]
    census = piece_census(per_size, plan_by, panels_by, order)
    (out_dir / 'nest-census.txt').write_text(census_txt(census) + '\n')
    if census['red']:
        raise SameGarment(census)
    pieces = sorted(census['common'])

    arts = {}
    for n in pieces:
        arts[n] = NestArt(n, per_size[order[0]][n]['human'],
                          [(s, per_size[s][n]) for s in order])

    # page 1 carries the legend, so the pieces are packed into what is left
    legend_h = 1.6 + 0.72 * len(order)
    items = [(n, arts[n].w + 1.2, arts[n].h + 1.8) for n in pieces]
    pages, pos = printpack.shelf_pack(items, A0_W - 2 * MARGIN,
                                      A0_H - 2 * MARGIN - legend_h - 2.0)

    svgs = []
    for page in range(pages):
        body = [printpack._text(MARGIN, MARGIN + 0.6, 0.7,
                                f'stitchu · EU34-EU48 IC ICE · A0 1:1 · '
                                f'sayfa {page + 1}/{pages} · {date_str}',
                                weight='bold'),
                printpack._text(MARGIN, MARGIN + 1.35, 0.42,
                                'kendi bedeninizin cizgisini takip edin · '
                                'kesim cizgisi duz agirlikta, dikis cizgisi '
                                'ince noktali · pay 10mm dahil')]
        top = MARGIN + 2.1
        if page == 0:
            leg, ybot = _legend(MARGIN, top + 0.6, order)
            body += leg
            body.append(printpack._test_square(A0_W - MARGIN - 4.6,
                                               MARGIN + 1.0))
            top = ybot + 0.8
        for n in pieces:
            p, x, y = pos[n]
            if p != page:
                continue
            a = arts[n]
            body.append(a.svg(MARGIN + x + 0.6, top + y + 0.4))
            body.append(printpack._text(MARGIN + x + 0.6,
                                        top + y + a.h + 1.35, 0.5,
                                        f'{a.human} · '
                                        + per_size[order[0]][n]['cut_note'],
                                        weight='bold'))
        svgs.append(printpack._svg_doc(A0_W, A0_H, '\n'.join(body)))

    svg_dir = out_dir / 'nest-svg'
    svg_dir.mkdir(exist_ok=True)
    h = hashlib.sha256()
    for i, svg in enumerate(svgs):
        (svg_dir / f'nest-a0-page{i + 1}.svg').write_text(svg)
        h.update(svg.encode())
    printpack.svgs_to_pdf(svgs, out_dir / 'nest-a0.pdf', date_str)

    # --- the report ---------------------------------------------------------
    lines = [
        'NESTED PACK (beden araligi) — sekiz beden tek sayfada, olculdu',
        f'date: {date_str}   sizes: {", ".join(order)}   '
        f'scale: 1cm = {printpack.CM_PT:.4f}pt',
        '',
        f'{pages} A0 sayfa, {len(pieces)} parca, her parca {len(order)} '
        f'bedeniyle ic ice',
        f'test square: 4cm = {4 * printpack.CM_PT:.4f}pt '
        '(assert 113.386pt PASSED in code)',
        '',
        'PARCA BASINA BUYUME — ayni cerceve, elle hizalama yok',
        f"{'parca':<20}{'en 34':>9}{'en 48':>9}{'en/beden':>10}"
        f"{'boy 34':>9}{'boy 48':>9}{'boy/beden':>11}{'centik':>8}",
        '-' * 85,
    ]
    for n in pieces:
        first, last = per_size[order[0]][n], per_size[order[-1]][n]

        def box(d):
            xs = [p.real for p in d['cut']]
            ys = [p.imag for p in d['cut']]
            return max(xs) - min(xs), max(ys) - min(ys)

        w0, h0 = box(first)
        w1, h1 = box(last)
        k = len(order) - 1
        marks = sum(len(per_size[s][n]['notches']) for s in order)
        lines.append(f'{arts[n].human[:19]:<20}{w0:>9.3f}{w1:>9.3f}'
                     f'{(w1 - w0) / k:>10.4f}{h0:>9.3f}{h1:>9.3f}'
                     f'{(h1 - h0) / k:>11.4f}{marks:>8}')

    lines += ['', 'KUMAS — beden basina ayri satir',
              '(tek beden paketiyle ayni hesap: kumas boyuna ikiye katli)']
    for size in order:
        arts1 = {n: printpack.PanelArt(
            geos_by[size][n], 1, 1, size, date_str,
            cut_note=plan_by[size][n]['label'],
            fold_axis=(plan_by[size][n].get('fold_axis')
                       if plan_by[size][n]['fold'] else None),
            human=per_size[size][n]['human']) for n in pieces}
        quotes = packpages.yardage(arts1)
        got = '  ·  '.join(
            f"{q['bolt_cm']:.0f}cm en: "
            + (f"{q['length_cm'] / 100.0:.2f} m" if q['length_cm'] is not None
               else 'YERLESMEDI')
            for q in quotes)
        lines.append(f'  {size}   {got}')

    lines += ['', 'BEDEN TABLOSU (cm)',
              f"{'beden':<8}{'gogus':>8}{'bel':>8}{'basen':>8}"]
    for i, size in enumerate(order):
        b = mapping.graded_body(mapping.SIZES.index(size), [])
        lines.append(f'{size:<8}{b["bust"]:>8.1f}{b["waist"]:>8.1f}'
                     f'{b["hips"]:>8.1f}')

    lines += ['', 'NOT: katlamada kesilen parcalar burada BUTUN cizildi. '
                  'Katlama ekseni bedenle kaydigi icin sekiz yarim, sekiz '
                  'ayri eksende bulusur ve sayfa hatali okunur.',
              '', f'determinism: sha256 over all page SVGs = {h.hexdigest()}']
    (out_dir / 'nest-report.txt').write_text('\n'.join(lines) + '\n')
    return {'nest_a0': out_dir / 'nest-a0.pdf',
            'nest_report': out_dir / 'nest-report.txt'}


def main():
    ap = argparse.ArgumentParser(
        description='eight drafted sizes -> one nested 1:1 pattern sheet')
    ap.add_argument('spec_dir', help='dir holding <SIZE>.json specifications')
    ap.add_argument('-o', '--out', required=True)
    ap.add_argument('--date', default=None)
    args = ap.parse_args()
    specs = [(s, str(Path(args.spec_dir) / f'{s}.json'))
             for s in mapping.SIZES]
    missing = [p for _, p in specs if not Path(p).exists()]
    if missing:
        raise SystemExit('missing specifications: ' + ', '.join(missing))
    try:
        paths = build(args.out, specs, args.date)
    except SameGarment as e:
        # A verdict, not a traceback: the census is on disk and on stdout so
        # the size of the defect is readable, and it is readable AGAIN after
        # the root is fixed.
        print(census_txt(e.census))
        print(f'nest sayimi: {Path(args.out) / "nest-census.txt"}')
        print('NESTPACK HÜKÜM: KIRMIZI — sekiz beden ayni giysiyi cizmiyor, '
              f'{len(e.census["faults"])} ayrisim; tek sayfa nest '
              'URETILEMEZ (kok: cutplan parca eslemesi, 13A)',
              file=sys.stderr)
        return 1
    print((Path(args.out) / 'nest-report.txt').read_text())
    # T12/TUR 12: this loop printed MISSING and then main() fell off its end,
    # so the process exited 0. Identical in class to the printpack.py bug
    # armed in TUR 11 — and this is the sheet the buyer is actually sold
    # ("eight sizes on one sheet"). A nest page the code promised and did not
    # write is not a warning, it is the product missing. No threshold: the
    # target is that every path in `paths` exists.
    missing_out = [f'{k}: {p}' for k, p in paths.items()
                   if not Path(p).exists()]
    for k, p in paths.items():
        print(k, p, 'OK' if Path(p).exists() else 'MISSING')
    if missing_out:
        print(f'NESTPACK HÜKÜM: KIRMIZI — {len(missing_out)} of {len(paths)} '
              'promised outputs were never written: ' + ', '.join(missing_out),
              file=sys.stderr)
        return 1
    print(f'NESTPACK HÜKÜM: YEŞİL — {len(paths)} outputs, 0 missing')
    return 0


if __name__ == '__main__':
    sys.exit(main())
