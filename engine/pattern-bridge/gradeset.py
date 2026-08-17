# ============================================================================
# gradeset.py — one atolye state -> the FULL SIZE RUN EU34..EU48 + audit.
#
# What a pattern house calls "grading the style": the same design is drafted
# on every body of the size chart and the result is AUDITED, not eyeballed:
#
#   1. SEAM DEED per size    walk.py runs inside every generate.py call;
#                            the per-size PASS/GATHERED/FAIL counts are
#                            collected here — does FAIL grow with size?
#   2. MONOTONICITY          every panel edge length across 34->48. Girth
#                            edges must GROW; length edges may stay CONSTANT
#                            (this is a girth-only grade: heights are not
#                            graded, recorded loss in mapping.py). A DECREASE
#                            anywhere is a violation. Same audit we ran on
#                            the bought couture corpus.
#   3. GRADE STEPS           bust-line girth (max horizontal cross-section
#                            of the four torso panels, summed) and the waist
#                            seam girth (torso<->waistband stitch lengths,
#                            torso side) per size; consecutive deltas should
#                            be ~constant (industry: a smooth grade).
#   4. NEST                  classic grading nest: main panels of all 8
#                            sizes aligned on the bottom-center of their
#                            seam bbox, drawn nested (SVG + PNG) for a
#                            human eye pass.
#   5. DETERMINISM           one size (EU38) is generated TWICE in fresh
#                            subprocesses; canonicalised specs must be
#                            byte-equal.
#
# Every generation is a FRESH SUBPROCESS of generate.py (the determinism
# law of the bridge); this file only reads what those runs wrote.
#
# Run with the GarmentCode venv python (scripts/gradeset.sh does):
#   <gc>/.venv/bin/python gradeset.py <state.json|default> [--out DIR]
# ============================================================================
import argparse
import datetime
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
GC_ROOT = REPO / 'core' / 'third_party' / 'garmentcode'
VENV_PY = GC_ROOT / '.venv' / 'bin' / 'python'
GENERATE = HERE / 'generate.py'

sys.path.insert(0, str(HERE))
from mapping import SIZES  # noqa: E402
import walk as walklib     # noqa: E402

TOL_MM = 0.1     # below this an edge-length change is "constant", not motion
SCAN_STEP = 0.05  # cm; horizontal cross-section scan resolution

# The atolye default state, verbatim from web/atolye.html defaultState()
# (M defaults column + FLAGS defaults + _neckShape/_ink/_asym). If the
# atolye defaults change, this copy must follow; the audit is only as
# honest as its input state.
DEFAULT_STATE = {
    '_neckShape': 'round', '_ink': 'orta', '_asym': True,
    'size': 2, 'hemLevel': 74, 'neckDepth': 12, 'neckDepthBack': 3,
    'yokeDrop': 12, 'shoulderSlope': 1.6, 'sleeveLen': 14,
    'neckWidth': 1.05, 'sleeveWidth': 7, 'armholeHollow': 0.12,
    'strapWidth': 2.6, 'strapLen': 8,
    'waistNip': 0.12, 'bustProject': 0.5, 'bustHeight': 0.3,
    'skirtFull': 1.6, 'skirtCurve': 0.4, 'gatherRatio': 1.0, 'ruffle': 0,
    'capPuff': 0, 'cuffGather': 0, 'collarWidth': 4.6, 'collarGap': 0.5,
    'shirrRows': 6, 'goreCount': 6, 'tieLength': 22,
    'foldCount': 10, 'drape': 1, 'hemWave': 1, 'hemDip': 2, 'seed': 7,
    'sleeve': True, 'collar': False, 'straps': False, 'princessSeam': True,
    'backSeam': True, 'gorePanels': False, 'wrapSurplice': False,
    'tie': False, 'tieBack': False, 'shirr': False, 'casing': False,
    'laceNeck': False, 'laceSleeve': False, 'laceHem': False,
}

NEST_PANELS = ['right_ftorso', 'right_btorso', 'skirt_front', 'right_sleeve_f']


# ---------------------------------------------------------------------------
# generation
# ---------------------------------------------------------------------------
def run_size(state, size_index, out_dir):
    """Fresh-subprocess generate.py for one size. Returns the out dir."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    st = dict(state)
    st['size'] = size_index
    state_path = out_dir / 'state.json'
    state_path.write_text(json.dumps(st, indent=2, sort_keys=True))
    proc = subprocess.run(
        [str(VENV_PY), str(GENERATE), str(state_path), str(out_dir),
         '--no-print'],
        capture_output=True, text=True, timeout=600)
    if proc.returncode != 0:
        sys.stderr.write(proc.stdout + proc.stderr)
        raise RuntimeError(f'generate.py failed for {SIZES[size_index]}')
    return out_dir


def canonical_spec(spec_path):
    """Spec JSON -> canonical string (GarmentCode emits dicts in
    nondeterministic order; geometry, not order, is the object)."""
    with open(spec_path) as f:
        spec = json.load(f)
    pat = spec['pattern']
    pat['stitches'] = sorted(
        pat['stitches'], key=lambda s: sorted((e['panel'], e['edge'])
                                              for e in s))
    return json.dumps(spec, sort_keys=True)


# ---------------------------------------------------------------------------
# measurements
# ---------------------------------------------------------------------------
def load_spec(out_dir):
    with open(Path(out_dir) / 'stitchu_specification.json') as f:
        return json.load(f)['pattern']


def edge_lengths(pattern):
    """{panel: [edge lengths mm]} for every panel of a spec."""
    out = {}
    for name in sorted(pattern['panels']):
        panel = pattern['panels'][name]
        out[name] = [walklib.edge_length_mm(panel, e)
                     for e in panel['edges']]
    return out


# GarmentCode's cut_corner sometimes emits the armhole corner as a
# micro stub edge (measured 2026-08-01: ~3.2-4.3mm on ftorso/sleeve_b at
# EU36/40/44/46/48 but NOT at EU34/38/42 — the edge count flip-flops
# with size, it is NOT monotone in size). For edgewise comparison the
# (n+1)-edge sizes are aligned to the n-edge sizes by merging exactly ONE
# adjacent pair — the pair chosen by MINIMAL length mismatch against the
# mean n-edge profile, not by a magic threshold (a threshold once merged
# a genuinely shrinking 4mm back-neck edge and broke the alignment).
# Every merge is reported, never silent.
def align_lengths(lengths_by_size):
    """Build a size-aligned edge-length table per panel.

    Returns (aligned, notes, skipped):
      aligned  {panel: (labels, [[mm per size] per edge])}
      notes    human-readable structural notes (merge positions etc.)
      skipped  panels whose structure could not be aligned
    """
    aligned, notes, skipped = {}, [], []
    panels = sorted(lengths_by_size[0])
    for L in lengths_by_size[1:]:
        assert sorted(L) == panels, 'panel set differs across sizes'

    for panel in panels:
        counts = [len(L[panel]) for L in lengths_by_size]
        if len(set(counts)) == 1:
            labels = [str(i) for i in range(counts[0])]
            seqs = [[L[panel][i] for L in lengths_by_size]
                    for i in range(counts[0])]
            aligned[panel] = (labels, seqs)
            continue

        nmin, nmax = min(counts), max(counts)
        if nmax - nmin != 1:
            skipped.append(panel)
            notes.append(f'{panel}: kenar sayisi bedene gore {counts}; '
                         'fark 1 kenardan buyuk, hizalanamadi — '
                         'kenar bazli tablo disi')
            continue

        # reference profile: mean of the n-edge sizes
        small = [L[panel] for L in lengths_by_size if len(L[panel]) == nmin]
        ref = [sum(v[i] for v in small) / len(small) for i in range(nmin)]
        big = [(si, L[panel]) for si, L in enumerate(lengths_by_size)
               if len(L[panel]) == nmax]

        # ONE merge position for the whole panel: merging the micro edge
        # into either neighbour is near-equal cost per size (the ambiguity
        # is inherent), and a per-size choice flip-flopped — so k is the
        # argmin of the TOTAL cost over all (n+1)-edge sizes.
        def merged(lens, k):
            return lens[:k] + [lens[k] + lens[k + 1]] + lens[k + 2:]

        best_k = min(range(nmax - 1), key=lambda k: sum(
            sum(abs(a - b) for a, b in zip(merged(lens, k), ref))
            for _, lens in big))

        merged_per_size, merge_info = [], []
        for si, L in enumerate(lengths_by_size):
            lens = L[panel]
            if len(lens) == nmin:
                merged_per_size.append(list(lens))
            else:
                merged_per_size.append(merged(lens, best_k))
                merge_info.append(
                    f'{SIZES[si]} '
                    f'({min(lens[best_k], lens[best_k + 1]):.2f}mm '
                    'mikro-kenar)')

        labels = [str(i) for i in range(nmin)]
        labels[best_k] = f'{best_k}+{best_k + 1}'
        seqs = [[merged_per_size[si][i]
                 for si in range(len(lengths_by_size))]
                for i in range(nmin)]
        aligned[panel] = (labels, seqs)
        notes.append(f'{panel}: ham kenar sayisi bedene gore {counts} '
                     '(GarmentCode cut_corner mikro-kenari, bedenle '
                     'monoton DEGIL); tum bedenlerde ayni pozisyonda '
                     f'[{best_k}]+[{best_k + 1}] birlestirildi: '
                     + '; '.join(merge_info)
                     + f' — tablo indeksleri {nmin}-kenarli bedenlerin '
                       'numarasidir, birlesik satir fazla-kenarli '
                       'bedenlerde o cifttir')
    return aligned, notes, skipped


def panel_outline(panel, per_edge=64):
    """Closed polyline (complex, cm) of the seam outline."""
    pts = []
    for e in panel['edges']:
        seg = walklib.edge_curve(panel['vertices'], e)
        pts.extend(seg.point(t / per_edge) for t in range(per_edge))
    return pts


def max_cross_width(panel):
    """Max horizontal cross-section width (cm) by scanline over the
    seam outline polygon. For a fitted bodice this scanline sits at the
    bust/underarm level — the widest line of the panel."""
    pts = panel_outline(panel, per_edge=128)
    n = len(pts)
    ys = [p.imag for p in pts]
    y0, y1 = min(ys), max(ys)
    best = 0.0
    y = y0 + SCAN_STEP
    while y < y1:
        xs = []
        for i in range(n):
            a, b = pts[i], pts[(i + 1) % n]
            if (a.imag - y) * (b.imag - y) <= 0 and a.imag != b.imag:
                t = (y - a.imag) / (b.imag - a.imag)
                xs.append(a.real + t * (b.real - a.real))
        if len(xs) >= 2:
            best = max(best, max(xs) - min(xs))
        y += SCAN_STEP
    return best


def bust_girth_mm(pattern):
    """Bust-line girth of the garment: sum of the max horizontal
    cross-sections of the four torso panels (each panel is a quarter of
    the body: left/right x front/back)."""
    total = 0.0
    used = []
    for name in sorted(pattern['panels']):
        if 'torso' in name:
            w = max_cross_width(pattern['panels'][name])
            total += w
            used.append((name, round(w * 10, 2)))
    return total * 10.0, used


def waist_seam_girth_mm(pattern):
    """Waist girth from the stitch graph: total torso-side length of
    every torso<->waistband stitch pair."""
    total = 0.0
    n = 0
    for stitch in pattern['stitches']:
        roles = {walklib.panel_role(e['panel']): e for e in stitch}
        if set(roles) == {'torso', 'wb'}:
            e = roles['torso']
            panel = pattern['panels'][e['panel']]
            total += walklib.edge_length_mm(panel, panel['edges'][e['edge']])
            n += 1
    return total, n


# ---------------------------------------------------------------------------
# monotonicity audit
# ---------------------------------------------------------------------------
def monotonicity(aligned):
    """aligned: {panel: (labels, [[mm per size] per edge])} from
    align_lengths().

    Returns (rows, counts). Per panel edge:
      artan   every step >= -TOL and total > +TOL
      sabit   |every step| stays within TOL and |total| <= TOL
      IHLAL   any consecutive step below -TOL (a size DECREASED the edge)
    """
    rows = []
    counts = {'artan': 0, 'sabit': 0, 'IHLAL': 0}
    for panel in sorted(aligned):
        labels, seqs = aligned[panel]
        for ei, seq in enumerate(seqs):
            steps = [seq[i + 1] - seq[i] for i in range(len(seq) - 1)]
            worst = min(steps)
            total = seq[-1] - seq[0]
            if worst < -TOL_MM:
                verdict = 'IHLAL'
                at = steps.index(worst)
                detail = (f'{SIZES[at]}->{SIZES[at + 1]} '
                          f'{worst:+.2f}mm')
            elif total > TOL_MM:
                verdict, detail = 'artan', f'toplam {total:+.2f}mm'
            else:
                verdict, detail = 'sabit', f'toplam {total:+.2f}mm'
            counts[verdict] += 1
            rows.append({'panel': panel, 'edge': labels[ei],
                         'verdict': verdict, 'detail': detail,
                         'seq': [round(x, 2) for x in seq]})
    return rows, counts


# ---------------------------------------------------------------------------
# nest drawing
# ---------------------------------------------------------------------------
NEST_STROKES = ['#b0b0b0', '#9a9a9a', '#848484', '#6e6e6e',
                '#585858', '#424242', '#2c2c2c', '#000000']


def nest_svg(panel_name, patterns):
    """All 8 sizes of one panel, aligned on the bottom-center of the seam
    bbox, nested. Returns (svg string, width cm, height cm)."""
    outlines = []
    for pat in patterns:
        pts = panel_outline(pat['panels'][panel_name], per_edge=96)
        xs = [p.real for p in pts]
        ys = [p.imag for p in pts]
        # anchor: bbox bottom-center -> origin. Spec y grows UP (body
        # coords); paper y grows down, so flip y and anchor at max-y
        # of the flipped frame = min spec y = the hem side... The spec's
        # LOW y is the bottom of the garment piece; after the paper flip
        # it becomes max y. Anchor on the pre-flip bbox bottom (min y).
        cx = 0.5 * (min(xs) + max(xs))
        y_bot = min(ys)
        outlines.append([complex(p.real - cx, p.imag - y_bot) for p in pts])

    all_pts = [p for o in outlines for p in o]
    x0 = min(p.real for p in all_pts)
    x1 = max(p.real for p in all_pts)
    y1 = max(p.imag for p in all_pts)
    pad = 1.5
    label_w = 3.2
    w = (x1 - x0) + 2 * pad + label_w
    h = y1 + 2 * pad + 1.2

    def X(v):
        return v - x0 + pad

    def Y(v):
        return y1 - v + pad + 1.2  # flip: spec y-up -> paper y-down

    body = [f'<text x="{pad:.2f}" y="{pad * 0.7 + 0.4:.2f}" '
            'font-size="0.62" font-weight="bold" '
            'font-family="Helvetica, Arial, sans-serif">'
            f'{panel_name} — grading nest EU34..EU48 (dikis cizgisi, '
            'bbox alt-orta hizali)</text>']
    for i, pts in enumerate(outlines):
        d = ' '.join(f'{X(p.real):.3f},{Y(p.imag):.3f}' for p in pts)
        body.append(f'<polygon points="{d}" fill="none" '
                    f'stroke="{NEST_STROKES[i]}" stroke-width="0.045"/>')
    # labels on the right, one row per size, leader dot on that size's
    # rightmost outline point
    for i, pts in enumerate(outlines):
        pr = max(pts, key=lambda p: p.real)
        lx, ly = X(x1) + 0.35, pad + 1.9 + i * 0.75
        body.append(f'<circle cx="{X(pr.real):.3f}" cy="{Y(pr.imag):.3f}" '
                    f'r="0.09" fill="{NEST_STROKES[i]}"/>')
        body.append(f'<text x="{lx:.2f}" y="{ly:.2f}" font-size="0.55" '
                    f'fill="{NEST_STROKES[i]}" '
                    'font-family="Helvetica, Arial, sans-serif">'
                    f'{SIZES[i]}</text>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" '
           f'width="{w * 40:.1f}" height="{h * 40:.1f}" '
           f'viewBox="0 0 {w:.3f} {h:.3f}">'
           f'<rect width="{w:.3f}" height="{h:.3f}" fill="white"/>'
           + '\n'.join(body) + '</svg>')
    return svg, w, h


def build_nests(patterns, out_dir):
    """Per-panel nest SVG+PNG. Returns list of written paths."""
    import cairosvg
    paths = []
    for name in NEST_PANELS:
        if name not in patterns[0]['panels']:
            continue
        svg, w, h = nest_svg(name, patterns)
        svg_path = Path(out_dir) / f'nest-{name}.svg'
        png_path = Path(out_dir) / f'nest-{name}.png'
        svg_path.write_text(svg)
        cairosvg.svg2png(bytestring=svg.encode(), write_to=str(png_path),
                         output_width=max(1200, int(w * 55)),
                         background_color='white')
        paths += [svg_path, png_path]
    return paths


# ---------------------------------------------------------------------------
# report
# ---------------------------------------------------------------------------
# --- VERDICT -----------------------------------------------------------------
# Until 2026-08-17 this script's ONLY exit condition was `if not det_equal`.
# It measured the per-size seam-deed FAIL counts and the monotonicity IHLAL
# count, printed both, and then threw them away: every size could report
# broken seams and the grading audit still exited 0. scripts/gradeset.sh execs
# this file, so the shell inherited the same blind verdict. That is the T7/T17
# class — a report wearing a gate's exit code.
#
# The three things this tool already MEASURES now all bind the exit code.
# Nothing was added to the measurement, no threshold was invented: the seam
# tolerance is walk.py's 1mm and the monotonicity threshold is TOL_MM, both
# unchanged.
#
# TUR 11 (17 Agu) — HER UC HUKUM DE BIR SIFIRIN UZERINDE DURUYORDU.
# `sum(... for d in deed)` bos bir listede 0 verir, `mono_counts.get('IHLAL')`
# bos bir tabloda None verir: sekiz bedenin sekizi de uretilemese ya da kenar
# tablosunun tamami hizalanamasa bu fonksiyon YINE bos liste dondurur ve
# "KAPI: YESIL — 0 FAIL, 0 IHLAL" basardi. Ustelik align_lengths, kenar sayisi
# bedene gore 1'den fazla degisen paneli tablo DISINDA birakip `struct_skipped`
# diye rapora yaziyordu; o panel bir daha hicbir hukme girmiyordu — TUR 9'un
# katman-lint bulgusunun aynisi (korunan sey yoksa kural sessizce atlanir).
# Asagisi sayimdir, esik degil: hicbir tolerans gevsetilmedi, olculen uc sey
# aynen duruyor, sadece "olculecek sey yok" hali artik bir GECME degil.
# TUR 13 (17 Agu) — BU KAPI HIC KOSMUYORDU: `d['summary']['fail']` KeyError.
# walk.py'nin `summary` semasi duz sayaclardan (`within_1mm`/`gathered_pass`/
# `fail`) `by_status` sozlugune tasindi; gradeset iki yerde (426 verdict, 485
# fmt_report) eski adi okumaya devam etti. fmt_report once cagrildigi icin
# `KeyError: 'within_1mm'` ile cokuyor, rapor DISKE HIC YAZILMIYORDU ve bu
# hukum satiri da hicbir zaman degerlendirilemiyordu. Cokme durusttu (sahte
# yesil yok) ama grade raporu 8 bedeni uretip cope atiyordu.
#
# Ayni okumada ikinci ve daha buyuk delik: bu kapi walk.py'nin ALTI hukum
# sinifindan (seam · armhole · closed_contour · self_intersection ·
# mirror_panels · mirror_seams) SADECE birincisini sayiyordu, ve walk'un
# BOS TAPU sayimini (panel 0 / dikis cifti 0) hic sormuyordu. Kendini kesen
# panel TUR 8'de gercek bir kusurdu ve bu kapidan gecerdi. Yeni esik
# ICAT EDILMEDI: her bedenin kendi seam-report.json'u walk.gate()'e — walk'un
# KENDI hukmune — geri veriliyor, sadece 8 bedene toplaniyor.
def size_gates(deed):
    """walk.py's own verdict, re-run per size on that size's full report."""
    return [walklib.gate(d) for d in deed]


# Schema guard: the drift above was silent for as long as it took someone to
# run the script. A name that walk.py no longer writes must be a HUKUM, not a
# traceback and not a zero.
_DEED_KEYS = ('pairs', 'armholes', 'closed_contour', 'self_intersection',
              'mirror_panels', 'mirror_seams', 'summary')
_SUMMARY_KEYS = ('pairs', 'by_status', 'max_diff_mm')


def deed_schema_faults(deed):
    """Return ['EU38: summary.by_status yok', ...] for every drifted report."""
    out = []
    for i, d in enumerate(deed):
        label = SIZES[i] if i < len(SIZES) else f'#{i}'
        for k in _DEED_KEYS:
            if k not in d:
                out.append(f'{label}: {k} yok')
        s = d.get('summary') or {}
        for k in _SUMMARY_KEYS:
            if k not in s:
                out.append(f'{label}: summary.{k} yok')
    return out


def status_counts(d):
    """(pairs, PASS, GATHERED-PASS, FAIL, other) — `other` so the row sums."""
    bs = d['summary']['by_status']
    npass = bs.get('PASS', 0)
    ngath = bs.get('GATHERED-PASS', 0)
    nfail = bs.get('FAIL', 0)
    other = sum(v for k, v in bs.items()
                if k not in ('PASS', 'GATHERED-PASS', 'FAIL'))
    return d['summary']['pairs'], npass, ngath, nfail, other


def verdict(deed, mono_counts, det_equal, struct_skipped=()):
    """Return the list of (name, count) findings that make this run RED."""
    red = []
    drift = deed_schema_faults(deed)
    if drift:
        red.append((f'SEMA: dikis tapusu walk.py semasini tasimiyor '
                    f'({"; ".join(drift)}) — okunamayan alan sifir '
                    f'sayilamaz', len(drift)))
        # Every count below reads those fields; judging on a drifted report
        # would be inventing zeroes. Say so and stop.
        return red

    gates = size_gates(deed)
    per_class = {}
    for g in gates:
        for k, n in g['verdicts'].items():
            per_class[k] = per_class.get(k, 0) + n
    for k in sorted(per_class):
        if per_class[k]:
            red.append((f'walk.py hukum-FAIL [{k}] (tolerans 1mm)',
                        per_class[k]))
    bos_tapu = [f'{SIZES[i]}: {c}' for i, g in enumerate(gates)
                for c in g['census']]
    if bos_tapu:
        red.append((f'BOS TAPU ({"; ".join(bos_tapu)})', len(bos_tapu)))
    if mono_counts.get('IHLAL'):
        red.append(('monotonluk IHLAL (girth-only grade\'de AZALMA)',
                    mono_counts['IHLAL']))
    if not det_equal:
        red.append(('determinizm: EU38 iki kosuda ayni spec\'i vermedi', 1))

    # --- SAYIM: yargilanacak sey olmamasi bir gecme degildir ---------------
    if len(deed) != len(SIZES):
        red.append((f'SAYIM: {len(SIZES)} beden bekleniyordu, dikis tapusu '
                    f'{len(deed)} bedenden geldi', len(SIZES) - len(deed)))
    bos = [SIZES[i] for i, d in enumerate(deed)
           if not d['summary'].get('pairs')]
    if bos:
        red.append((f'SAYIM: dikis cifti OLMAYAN beden ({", ".join(bos)}) — '
                    f'parcalari birbirine hic baglanmamis giysi yargilanmis '
                    f'sayilmaz', len(bos)))
    judged = sum(mono_counts.get(k, 0)
                 for k in ('artan', 'sabit', 'IHLAL'))
    if judged == 0:
        red.append(('SAYIM: monotonluk tablosunda TEK kenar yargilanmadi', 1))
    if struct_skipped:
        red.append((f'SAYIM: kenar tablosu disinda birakilan panel '
                    f'({", ".join(struct_skipped)}) — hizalanamayan panel '
                    f'monotonlukta hic yargilanmiyor, bu bir atlama, gecme '
                    f'degil', len(struct_skipped)))
    return red


def verdict_lines(deed, mono_counts, det_equal, struct_skipped=()):
    red = verdict(deed, mono_counts, det_equal, struct_skipped)
    if not red:
        return ['KAPI: YESIL — dikis tapusu 0 FAIL, monotonluk 0 IHLAL, '
                'determinizm ozdes']
    out = [f'KAPI: KIRMIZI — {len(red)} hukum:']
    out += [f'  {n}: {c}' for n, c in red]
    return out


def fmt_report(deed, mono_rows, mono_counts, bust, waist, nudges,
               det_equal, nest_paths, state_src,
               struct_notes=(), struct_skipped=()):
    L = []
    L.append('GRADESET RAPORU — bir atolye durumu, 8 beden (EU34..EU48), '
             'denetimli uretim')
    L.append(f'tarih: {datetime.date.today().isoformat()}   '
             f'durum kaynagi: {state_src}')
    L.append('her beden taze subprocess generate.py --no-print '
             '(mapping -> GarmentCode -> walk dikis tapusu)')
    L.append('')

    L.append('1) DIKIS TAPUSU BEDEN BAZINDA (walk.py, tolerans 1mm)')
    drift = deed_schema_faults(deed)
    if drift:
        # The table below reads walk.py's fields by name. If the names moved,
        # print the drift instead of a table of invented numbers.
        L.append('SEMA IHLALI — tablo basilamadi, alanlar walk.py semasinda '
                 'degil:')
        for f in drift:
            L.append(f'  {f}')
        L.append('')
        return '\n'.join(L)
    # `diger` = REPORTED/UNVERIFIABLE/... — carried as its own column so the
    # row sums to `cift`; a status walk.py adds tomorrow cannot vanish here.
    L.append(f"{'beden':<7} {'cift':>5} {'PASS':>5} {'GATHERED':>9} "
             f"{'FAIL':>5} {'diger':>6} {'max fark mm':>12}")
    L.append('-' * 58)
    fails = []
    for i, d in enumerate(deed):
        npair, npass, ngath, nfail, other = status_counts(d)
        fails.append(nfail)
        L.append(f"{SIZES[i]:<7} {npair:>5} {npass:>5} "
                 f"{ngath:>9} {nfail:>5} {other:>6} "
                 f"{d['summary']['max_diff_mm']:>12.2f}")
    L.append(f'FAIL serisi 34->48: {fails} — '
             + ('bedenle BUYUYOR' if fails[-1] > fails[0]
                else 'bedenle buyumuyor (sabit/dalgali)'))
    gates = size_gates(deed)
    L.append('walk.py hukum-FAIL (alti sinif, beden toplami): ' + '   '.join(
        f'{k} {sum(g["verdicts"][k] for g in gates)}'
        for k in sorted(gates[0]['verdicts'])) if gates else '')
    L.append('')

    L.append('2) MONOTONLUK — her panelin her kenari, 34->48 uzunluk (mm)')
    L.append(f'olcum: walk.edge_length_mm (spec egrileri, svgpathtools); '
             f'esik {TOL_MM}mm')
    L.append('kural: girth-only grade\'de AZALMA ihlaldir; sabit kalmak '
             'degildir (boy kenarlari gradelenmiyor, mapping-notes kaydi)')
    for n in struct_notes:
        L.append(f'YAPI NOTU: {n}')
    for p in struct_skipped:
        L.append(f'YAPI UYARI: {p} kenar tablosu disinda birakildi '
                 '(hizalanamadi)')
    total = sum(mono_counts.values())
    L.append(f"kenar toplami: {total}   monoton artan: "
             f"{mono_counts['artan']}   sabit: {mono_counts['sabit']}   "
             f"IHLAL: {mono_counts['IHLAL']}")
    if mono_counts['IHLAL']:
        L.append('ihlaller:')
        for r in mono_rows:
            if r['verdict'] == 'IHLAL':
                L.append(f"  {r['panel']}[{r['edge']}]  {r['detail']}   "
                         f"seri: {r['seq']}")
    L.append('')
    L.append('panel x kenar dokumu (kenar: karar, detay):')
    cur = None
    for r in mono_rows:
        if r['panel'] != cur:
            cur = r['panel']
            L.append(f'  {cur}:')
        L.append(f"    [{r['edge']:>2}] {r['verdict']:<6} {r['detail']}")
    L.append('')
    L.append('karsilastirma: satin alinmis couture kalibin 8 bedenlik '
             'korpusunda ayni denetim 13 parcanin 7\'sinde beden-'
             'monotonlugu ihlali olcmustu (tracer mi kalip mi ayrismamisti).')
    n_panel_viol = len({r['panel'] for r in mono_rows
                        if r['verdict'] == 'IHLAL'})
    n_panels = len({r['panel'] for r in mono_rows})

    def piece(name):  # left_/right_ mirrors are ONE pattern piece
        for pre in ('left_', 'right_'):
            if name.startswith(pre):
                return name[len(pre):]
        return name
    u_all = {piece(r['panel']) for r in mono_rows}
    u_viol = {piece(r['panel']) for r in mono_rows
              if r['verdict'] == 'IHLAL'}
    L.append(f'bizim seri: {n_panels} panelin {n_panel_viol}\'inde ihlal; '
             f'tekil parca bazinda (sol/sag tek parca sayilir) '
             f'{len(u_all)} parcanin {len(u_viol)}\'unde: '
             f'{", ".join(sorted(u_viol))}.')
    L.append('')

    L.append('3) GRADE ADIMI DUZGUNLUGU')
    L.append('gogus hatti cevresi = 4 torso panelinin max yatay kesit '
             'genisligi toplami (scanline 0.5mm); bel dikisi = torso<->'
             'korsaj bandi dikis ciftlerinin torso tarafi toplami')
    L.append(f"{'beden':<7} {'gogus mm':>10} {'delta':>8} "
             f"{'bel dikisi mm':>14} {'delta':>8}")
    L.append('-' * 52)
    for i in range(8):
        db = f'{bust[i] - bust[i - 1]:+8.2f}' if i else ' ' * 8
        dw = f'{waist[i] - waist[i - 1]:+8.2f}' if i else ' ' * 8
        L.append(f'{SIZES[i]:<7} {bust[i]:>10.2f} {db} '
                 f'{waist[i]:>14.2f} {dw}')
    bd = [bust[i + 1] - bust[i] for i in range(7)]
    wd = [waist[i + 1] - waist[i] for i in range(7)]
    L.append(f'gogus delta araligi: {min(bd):.2f}..{max(bd):.2f}mm '
             f'(hedef girth grade 4cm/beden -> desen duzleminde ~sabit '
             'artis; ease carpani mutlak degeri buyutebilir)')
    L.append(f'bel dikisi delta araligi: {min(wd):.2f}..{max(wd):.2f}mm')
    med = sorted(bd)[len(bd) // 2]
    for i, d in enumerate(bd):
        if abs(d - med) > 2.0:
            L.append(f'  DIKKAT: {SIZES[i]}->{SIZES[i + 1]} gogus adimi '
                     f'{d:.2f}mm (medyan {med:.2f}mm) — duzgun grade '
                     'disi sapma')
    med_w = sorted(wd)[len(wd) // 2]
    for i, d in enumerate(wd):
        if abs(d - med_w) > 2.0:
            L.append(f'  DIKKAT: {SIZES[i]}->{SIZES[i + 1]} bel adimi '
                     f'{d:.2f}mm (medyan {med_w:.2f}mm)')
    L.append('')

    L.append('4) OMUZ NUDGE KAYITLARI (generate.py cut_corner merdiveni)')
    any_nudge = False
    for i, n in enumerate(nudges):
        if n:
            any_nudge = True
            for rec in n:
                L.append(f"  {SIZES[i]}: shoulder_w={rec['value']} "
                         f"({rec['action']})")
    if not any_nudge:
        L.append('  hicbir bedende nudge gerekmedi (0.0 ilk denemede gecti)')
    L.append('')

    L.append('5) DETERMINIZM')
    L.append('  EU38 iki kez taze subprocess ile uretildi; kanonik spec '
             + ('ESIT — deterministik.' if det_equal else
                'FARKLI — DETERMINIZM KIRIK, incele!'))
    L.append('')

    L.append('6) NEST (goz icin)')
    for p in nest_paths:
        L.append(f'  {p}')
    return '\n'.join(L) + '\n'


# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(
        description='atolye state -> EU34..EU48 size run + grading audit')
    ap.add_argument('state', help="atolye state JSON path, or 'default'")
    ap.add_argument('--out', default=None,
                    help='output dir (default Logs/gradeset-<date>/)')
    args = ap.parse_args()

    if args.state == 'default':
        state, state_src = dict(DEFAULT_STATE), 'atolye defaults (embedded)'
    else:
        with open(args.state) as f:
            state = json.load(f)
        state_src = args.state

    out = Path(args.out) if args.out else \
        REPO / 'Logs' / f'gradeset-{datetime.date.today().isoformat()}'
    out.mkdir(parents=True, exist_ok=True)

    # --- generate all 8 sizes (fresh subprocess each) ----------------------
    patterns, deed, nudges = [], [], []
    lengths_by_size = []
    for i, label in enumerate(SIZES):
        d = run_size(state, i, out / label)
        print(f'{label} uretildi: {d}')
        pat = load_spec(d)
        patterns.append(pat)
        lengths_by_size.append(edge_lengths(pat))
        with open(d / 'seam-report.json') as f:
            deed.append(json.load(f))
        with open(d / 'mapping-notes.json') as f:
            notes = json.load(f)
        nudges.append([n for n in notes
                       if n.get('field') == 'body.shoulder_w'])

    # --- audits ------------------------------------------------------------
    aligned, struct_notes, struct_skipped = align_lengths(lengths_by_size)
    mono_rows, mono_counts = monotonicity(aligned)
    bust, waist = [], []
    for pat in patterns:
        b, _ = bust_girth_mm(pat)
        w, _ = waist_seam_girth_mm(pat)
        bust.append(b)
        waist.append(w)

    # --- determinism: EU38 twice -------------------------------------------
    det_dir = run_size(state, 2, out / 'EU38-rerun')
    det_equal = (canonical_spec(det_dir / 'stitchu_specification.json')
                 == canonical_spec(out / 'EU38'
                                   / 'stitchu_specification.json'))

    # --- nest ---------------------------------------------------------------
    nest_paths = build_nests(patterns, out)

    report = fmt_report(deed, mono_rows, mono_counts, bust, waist, nudges,
                        det_equal, nest_paths, state_src,
                        struct_notes, struct_skipped)
    (out / 'gradeset-report.txt').write_text(report)
    print(report)
    print(f'rapor: {out / "gradeset-report.txt"}')

    for line in verdict_lines(deed, mono_counts, det_equal, struct_skipped):
        print(line)
    if verdict(deed, mono_counts, det_equal, struct_skipped):
        sys.exit(1)


if __name__ == '__main__':
    main()
