# ============================================================================
# vocab.py — THE DICTIONARY GALLERY. Forty squares, one word each.
#
# Taste cannot be judged ten thousand times. It can be judged forty times.
#
# Every garment this engine can make is a sentence built from a small closed
# vocabulary: an upper, a bottom, a waistband, a neckline, a collar piece, an
# armhole, a cuff. Thirty five words in total, read out of the generator's own
# design tree. This prints ONE page: each word drawn in isolation, everything
# else held plain, so the square shows that word and nothing else.
#
# A word approved on this page is approved in every combination that contains
# it. That is why the page exists: it closes the beauty gate at the vocabulary
# instead of at the catalogue, and the matrix inherits the verdict.
#
# A word that cannot pass GATE 0 in ANY configuration gets an EMPTY square
# saying so. It is not skipped and it is not quietly dropped: a vocabulary
# with a hole in it is a fact about the engine, and the page states it.
#
#   <gc>/.venv/bin/python vocab.py --out Logs/sozluk-<date> --tries 24
# ============================================================================
import argparse
import copy
import datetime
import io
import json
import random
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import cairosvg
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import atlas                       # noqa: E402

REPO = atlas.REPO

# ---------------------------------------------------------------------------
# the search: the words are fixed, only the dials move
# ---------------------------------------------------------------------------
# A cell is defined by its WORDS. When the plain reading of a cell does not
# pass GATE 0, the dials are what may move: lengths, widths, flares, angles.
# Discrete choices are never swapped, because swapping one would make it a
# different cell. Every attempt is seeded off the cell id, so the same cell
# searched twice searches the same way.
SKIP_SUBTREES = ('left',)          # asymmetry lives here; the plain sentence is symmetric


def dial_paths(tree, prefix=()):
    """Every continuous leaf in the design tree, dotted."""
    out = []
    for key, node in tree.items():
        if key in SKIP_SUBTREES and not prefix:
            continue
        if isinstance(node, dict) and 'v' in node:
            if node.get('type') in ('float', 'int'):
                out.append('.'.join(prefix + (key,)))
        elif isinstance(node, dict):
            out.extend(dial_paths(node, prefix + (key,)))
    return out


def turn_dials(design, tree, rng, dials):
    """One sampled reading of the same sentence, louder or quieter."""
    d = copy.deepcopy(design)
    for path in dials:
        node = atlas._node(tree, path)
        lo, hi = node['range'][0], node['range'][1]
        if node['type'] == 'int':
            atlas.set_v(d, path, int(round(rng.uniform(lo, hi))))
        else:
            atlas.set_v(d, path, round(rng.uniform(lo, hi), 4))
    return d


def attempt_design(base_design, tree, dials, cell_id, k):
    """Attempt k of a cell. Attempt 0 is always the plain reading."""
    if k == 0:
        return copy.deepcopy(base_design)
    return turn_dials(base_design, tree, random.Random(f'{cell_id}|{k}'), dials)


def search_cell(cell_id, base_design, root, body_file, tries, tree, dials,
                slug):
    """Try readings of one cell until GATE 0 passes. Returns the record."""
    tried = []
    for k in range(tries):
        out = Path(root) / slug / f'try{k:02d}'
        design = attempt_design(base_design, tree, dials, cell_id, k)
        # Every attempt is a pure function of (cell, k), so a reading already
        # on disk is the same reading; a rerun re-judges instead of redrawing.
        if (list(out.glob('*_specification.json'))
                and (out / 'stitch-intent.json').exists()):
            err = None
        else:
            err = atlas.generate_batch(
                [{'id': cell_id, 'design': design, 'out': str(out)}],
                root, body_file)[cell_id]
        if err:
            tried.append({'try': k, 'ok': False, 'why': f'generator: {err}'})
            continue
        v = atlas.gate(out)
        tried.append({'try': k, 'ok': v['ok'], 'why': v.get('why'),
                      'max_diff_mm': v.get('max_diff_mm')})
        if v['ok']:
            return {'ok': True, 'try': k, 'dir': str(out), 'gate': v,
                    'tries_used': k + 1, 'tries_allowed': tries,
                    'attempts': tried}
    return {'ok': False, 'try': None, 'dir': None,
            'tries_used': tries, 'tries_allowed': tries, 'attempts': tried,
            'why': _dominant_reason(tried)}


def _dominant_reason(tried):
    reasons = {}
    for t in tried:
        if t.get('why'):
            key = t['why'].split(';')[0]
            reasons[key] = reasons.get(key, 0) + 1
    if not reasons:
        return 'no attempt produced a verdict'
    top = max(reasons.items(), key=lambda kv: kv[1])
    return f'{top[0]} (in {top[1]} of {len(tried)} readings)'


# ---------------------------------------------------------------------------
# the page
# ---------------------------------------------------------------------------
PAPER = (250, 247, 240)
INK = (24, 22, 20)
GREY = (130, 126, 120)
RED = (150, 40, 30)

FONT_DIR = Path('/System/Library/Fonts/Supplemental')


def font(size, bold=False):
    name = 'Arial Bold.ttf' if bold else 'Arial.ttf'
    try:
        return ImageFont.truetype(str(FONT_DIR / name), size)
    except OSError:
        return ImageFont.load_default()


def render_pattern(svg_path, box_w, box_h):
    """The pattern piece itself, on paper. No lines added, none taken away."""
    png = cairosvg.svg2png(url=str(svg_path), output_width=box_w * 2)
    im = Image.open(io.BytesIO(png)).convert('RGBA')
    bg = Image.new('RGBA', im.size, PAPER + (255,))
    bg.alpha_composite(im)
    im = bg.convert('RGB')
    im.thumbnail((box_w, box_h), Image.LANCZOS)
    return im


def gallery(records, out_png, date_str, cols=6):
    cell_w, cell_h, pad = 440, 400, 26
    label_h = 78
    rows = (len(records) + cols - 1) // cols
    head = 210
    W = cols * cell_w + pad * 2
    H = head + rows * (cell_h + label_h) + pad * 2

    page = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(page)

    passed = sum(1 for r in records if r['ok'])
    d.text((pad + 8, 44), 'SOZLUK', font=font(64, True), fill=INK)
    d.text((pad + 8, 122),
           'the whole vocabulary this engine can speak, one word per square, '
           'everything else held plain',
           font=font(26), fill=GREY)
    d.text((pad + 8, 158),
           f'{len(records)} words   ·   {passed} drawn and sewable   ·   '
           f'{len(records) - passed} could not pass the gate   ·   '
           f'EU38   ·   {date_str}',
           font=font(26), fill=INK)
    d.line([(pad + 8, head - 16), (W - pad - 8, head - 16)], fill=INK, width=2)

    for i, r in enumerate(records):
        cx = pad + (i % cols) * cell_w
        cy = head + (i // cols) * (cell_h + label_h)
        box = (cx + 14, cy + 8, cx + cell_w - 14, cy + cell_h - 8)
        d.rectangle(box, outline=(214, 208, 198), width=2)
        if r['ok'] and r.get('svg') and Path(r['svg']).exists():
            im = render_pattern(r['svg'], cell_w - 60, cell_h - 50)
            page.paste(im, (cx + (cell_w - im.width) // 2,
                            cy + (cell_h - im.height) // 2))
        else:
            d.text((cx + 26, cy + cell_h // 2 - 30), 'gecmedi',
                   font=font(38, True), fill=RED)
            why = r.get('why', '')
            for j, line in enumerate(_wrap(why, 34)[:4]):
                d.text((cx + 26, cy + cell_h // 2 + 22 + j * 26), line,
                       font=font(20), fill=GREY)
        ly = cy + cell_h
        d.text((cx + 16, ly + 2), r.get('gloss') or r['label'],
               font=font(30, True), fill=INK if r['ok'] else RED)
        d.text((cx + 16, ly + 38), f"{r['axis']}  ·  {r['label']}",
               font=font(21), fill=GREY)
        if r['ok']:
            g = r['gate']
            d.text((cx + 16, ly + 62),
                   f"{g['pairs']} seams  worst {g['max_diff_mm']:.2f}mm  "
                   f"try {r['try'] + 1}/{r['tries_allowed']}",
                   font=font(19), fill=GREY)
    page.save(out_png)
    return out_png


def _wrap(text, n):
    words, lines, cur = (text or '').split(), [], ''
    for w in words:
        if len(cur) + len(w) + 1 > n:
            lines.append(cur)
            cur = w
        else:
            cur = (cur + ' ' + w).strip()
    if cur:
        lines.append(cur)
    return lines


# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=None)
    ap.add_argument('--tries', type=int, default=24,
                    help='readings tried per word before the square is '
                         'printed empty; the limit is reported on the page')
    ap.add_argument('--jobs', type=int, default=6)
    args = ap.parse_args()

    date_str = datetime.date.today().isoformat()
    root = Path(args.out or (REPO / 'Logs' / f'sozluk-{date_str}')).resolve()
    root.mkdir(parents=True, exist_ok=True)
    body_file = atlas.body_yaml(root / 'body-EU38.yaml')

    tree = atlas.load_tree()
    dials = dial_paths(tree)
    words = atlas.vocabulary()
    print(f'{len(words)} words, {len(dials)} dials, {args.tries} readings max '
          f'per word\n')

    def run(w):
        rec = search_cell(w.wid, w.design(), root, body_file, args.tries,
                          tree, dials, w.slug)
        rec.update({'word': w.wid, 'label': w.label, 'gloss': w.gloss,
                    'axis': w.axis_name, 'axis_path': w.axis_path,
                    'value': w.value, 'slug': w.slug})
        if rec['ok']:
            rec['svg'] = str(Path(rec['dir']) / f'{atlas.NAME}_pattern.svg')
        print(f"  {w.wid:<40} "
              f"{'PASS try %d' % (rec['try'] + 1) if rec['ok'] else 'EMPTY'}"
              f"   {rec.get('why') or ''}")
        return rec

    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        records = list(pool.map(run, words))

    out_png = gallery(records, root / 'galeri.png', date_str)
    (root / 'sozluk.json').write_text(json.dumps(
        {'date': date_str, 'size': atlas.SIZE_LABEL,
         'tries_allowed': args.tries, 'words': records}, indent=2))

    passed = [r for r in records if r['ok']]
    print(f'\n{len(passed)}/{len(records)} words drawn and sewable')
    for r in records:
        if not r['ok']:
            print(f"  EMPTY  {r['word']:<40} {r['why']}")
    print(f'\nwrote {out_png}')


if __name__ == '__main__':
    main()
