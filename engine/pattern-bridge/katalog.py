# ============================================================================
# katalog.py — SIEVE THE MATRIX, PRINT THE PAPER.
#
# The matrix is driven once. This is the part that runs again every time a
# word is struck off the gallery, and it must take seconds, because it is
# the part a person waits on.
#
# Every cell in cells.jsonl carries the words it is made of, so striking a
# word is a filter over a text file, not a regeneration. Nothing is drawn
# again, nothing is judged again.
#
#   sieve and lay out the contact sheets
#     katalog.py --out Logs/katalog-<date> --drop collar.f_collar=VNeckHalf
#                                          --drop meta.bottom=Pants
#   print 1:1 paper for what survived
#     katalog.py --out Logs/katalog-<date> --drop ... --print 40
#
# --print pays for the A0 and A4 packs, which is the expensive half, so it is
# bounded and the bound is stated in the index. Everything else is free.
# ============================================================================
import argparse
import datetime
import io
import json
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import cairosvg
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import atlas                       # noqa: E402
import printpack                   # noqa: E402
import walk as walklib             # noqa: E402
from vocab import PAPER, INK, GREY, font   # noqa: E402


def load(root):
    rows = []
    for line in (Path(root) / 'cells.jsonl').read_text().splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def sieve(rows, drop):
    """Keep the cells that contain none of the struck words."""
    dropped = {}
    for spec in drop:
        path, _, value = spec.partition('=')
        dropped.setdefault(path.strip(), set()).add(value.strip())
    kept = []
    for r in rows:
        words = r['words']
        if any(words.get(p) in vals for p, vals in dropped.items()):
            continue
        kept.append(r)
    return kept, dropped


# ---------------------------------------------------------------------------
# the contact sheet: every surviving garment, small, side by side
# ---------------------------------------------------------------------------
SHORT = {'up': '', 'bo': '', 'wb': 'kemer ', 'nk': '', 'cp': '', 'sl': '',
         'ah': '', 'cf': ''}


def cell_caption(row):
    """What the square is, in the words it is made of."""
    parts = []
    for path, value in row['words'].items():
        val = None if value == 'yok' else value
        if value == 'True':
            val = True
        elif value == 'False':
            val = False
        gloss = atlas.GLOSS.get((path, val), value)
        parts.append(gloss)
    return ' + '.join(parts)


def thumb(svg_path, w, h):
    png = cairosvg.svg2png(url=str(svg_path), output_width=w * 2)
    im = Image.open(io.BytesIO(png)).convert('RGBA')
    bg = Image.new('RGBA', im.size, PAPER + (255,))
    bg.alpha_composite(im)
    im = bg.convert('RGB')
    im.thumbnail((w, h), Image.LANCZOS)
    return im


def _one_thumb(job):
    idx, svg, w, h = job
    try:
        im = thumb(svg, w, h)
        return idx, im.tobytes(), im.size, im.mode
    except Exception:                                   # noqa: BLE001
        return idx, None, None, None


def contact_pages(rows, root, out_dir, date_str, cols=8, rows_per=7,
                  jobs=4, odd_cells=()):
    """Contact sheets, paged. Returns the list of page paths."""
    cw, ch, cap = 330, 270, 58
    per = cols * rows_per
    pages = []
    out_dir.mkdir(parents=True, exist_ok=True)
    for pno in range((len(rows) + per - 1) // per):
        chunk = rows[pno * per:(pno + 1) * per]
        used_rows = (len(chunk) + cols - 1) // cols
        W = cols * cw + 40
        H = 120 + used_rows * (ch + cap) + 30
        page = Image.new('RGB', (W, H), PAPER)
        d = ImageDraw.Draw(page)
        d.text((22, 28), 'KATALOG', font=font(40, True), fill=INK)
        d.text((22, 78),
               f'sayfa {pno + 1}   ·   {len(rows)} kesilip dikilebilir kalip   '
               f'·   EU38   ·   {date_str}', font=font(20), fill=GREY)
        jobs_list = []
        for i, r in enumerate(chunk):
            svg = Path(root) / r['dir'] / f'{atlas.NAME}_pattern.svg'
            if svg.exists():
                jobs_list.append((i, svg, cw - 18, ch - 14))
        made = {}
        with ProcessPoolExecutor(max_workers=jobs) as pool:
            for idx, raw, size, mode in pool.map(_one_thumb, jobs_list):
                if raw is not None:
                    made[idx] = Image.frombytes(mode, size, raw)
        for i, r in enumerate(chunk):
            cx = 20 + (i % cols) * cw
            cy = 120 + (i // cols) * (ch + cap)
            d.rectangle((cx + 4, cy, cx + cw - 8, cy + ch),
                        outline=(220, 214, 204), width=1)
            im = made.get(i)
            if im is not None:
                page.paste(im, (cx + (cw - im.width) // 2,
                                cy + (ch - im.height) // 2))
            caption = cell_caption(r)
            for j, line in enumerate(_wrap(caption, 34)[:2]):
                d.text((cx + 8, cy + ch + 5 + j * 19), line,
                       font=font(16), fill=INK)
            note = f"{r['pairs']} dikis  en kotu {r['worst_seam_mm']:.2f}mm"
            if r['cell'] in odd_cells:
                note += '   AYRILDI'
            d.text((cx + 8, cy + ch + 5 + 40), note, font=font(14),
                   fill=(150, 40, 30) if r['cell'] in odd_cells else GREY)
        path = out_dir / f'kontakt-{pno + 1:03d}.png'
        page.save(path)
        pages.append(path)
        print(f'  {path}  ({len(chunk)} squares)')
    return pages


def _wrap(text, n):
    words, lines, cur = text.split(), [], ''
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
# THE ODDITY LIST. The seam deed says a pattern can be sewn. It says nothing
# about whether the piece is a sane size, and a driven cross product produces
# some that are not. Two things are measured rather than judged.
#
#   · a piece wider than the cloth. Bolt widths run 140 to 150cm, so a panel
#     whose bounding box exceeds 150cm in either direction cannot be laid on
#     the fabric at all, whatever the seams say.
#   · a piece longer than the person. EU38 body height is on file; a panel
#     taller than the wearer is a drafting runaway, not a garment.
#
# Neither excludes a cell. They put it on a list beside the catalogue, with
# the number, so the count of what was set aside is visible.
# ---------------------------------------------------------------------------
BOLT_CM = 150.0


def panel_extents(spec_path):
    """Widest piece in the pattern, measured on the CURVES not the corners.

    A circle skirt panel is two arcs between four corners; its corner box is
    81cm and the piece is wider than that. Bounding a curved edge by its
    endpoints understates every flared panel in the vocabulary, which is most
    of them, so the same curve builder the seam walk measures with is used.
    """
    with open(spec_path) as f:
        panels = json.load(f)['pattern']['panels']
    worst_w = worst_h = 0.0
    worst_name = None
    for name, p in panels.items():
        xs, ys = [], []
        for e in p['edges']:
            x0, x1, y0, y1 = walklib.edge_curve(p['vertices'], e).bbox()
            xs += [x0, x1]
            ys += [y0, y1]
        w, h = max(xs) - min(xs), max(ys) - min(ys)
        if max(w, h) > max(worst_w, worst_h):
            worst_w, worst_h, worst_name = w, h, name
    return worst_name, round(worst_w, 2), round(worst_h, 2), len(panels)


def oddities(rows, root, body_height_cm):
    out = []
    for r in rows:
        d = Path(root) / r['dir']
        specs = list(d.glob('*_specification.json'))
        if not specs:
            continue
        name, w, h, n = panel_extents(specs[0])
        reasons = []
        if max(w, h) > BOLT_CM:
            reasons.append(f'{name} is {max(w, h):.0f}cm across, wider than '
                           f'{BOLT_CM:.0f}cm cloth')
        if h > body_height_cm:
            reasons.append(f'{name} is {h:.0f}cm tall, taller than the '
                           f'{body_height_cm:.0f}cm body')
        if reasons:
            out.append({'cell': r['cell'], 'panel': name, 'width_cm': w,
                        'height_cm': h, 'panels': n, 'why': reasons})
    return out


def _print_one(job):
    root, rel, cell = job
    d = Path(root) / rel
    specs = list(d.glob('*_specification.json'))
    if not specs:
        return cell, 'no specification'
    try:
        printpack.build(d, specs[0], atlas.SIZE_LABEL)
        return cell, None
    except Exception as e:                              # noqa: BLE001
        return cell, f'{type(e).__name__}: {e}'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    ap.add_argument('--drop', action='append', default=[],
                    help='a word to strike, e.g. --drop meta.bottom=Pants; '
                         'repeatable')
    ap.add_argument('--print', dest='print_n', type=int, default=0,
                    help='print 1:1 A0 and A4 packs for this many survivors; '
                         '0 prints none, -1 prints all')
    ap.add_argument('--jobs', type=int, default=4)
    ap.add_argument('--pages', type=int, default=0,
                    help='cap the contact sheets; 0 lays out all of them')
    args = ap.parse_args()

    root = Path(args.out).resolve()
    date_str = datetime.date.today().isoformat()
    rows = load(root)
    ok = [r for r in rows if r['ok']]
    kept, dropped = sieve(ok, args.drop)
    kept.sort(key=lambda r: r['cell'])

    print(f'{len(rows)} cells driven, {len(ok)} passed gate 0')
    if dropped:
        for p, vals in dropped.items():
            print(f'  struck {p}: {", ".join(sorted(vals))}')
        print(f'{len(kept)} survive the sieve')

    import yaml
    body = yaml.safe_load((root / 'body-EU38.yaml').read_text())['body']
    odd = oddities(kept, root, float(body['height']))
    odd_cells = {o['cell'] for o in odd}
    if odd:
        print(f'{len(odd)} of {len(kept)} carry a piece that cannot be cut '
              f'or worn at this size; listed apart, not removed')

    sheets = root / 'kontakt'
    shown = kept
    if args.pages:
        per = 80
        shown = kept[:args.pages * per]
        if len(shown) < len(kept):
            print(f'  contact sheets capped at {args.pages} pages: '
                  f'{len(shown)} of {len(kept)} laid out, '
                  f'{len(kept) - len(shown)} not drawn')
    pages = contact_pages(shown, root, sheets, date_str, jobs=args.jobs,
                          odd_cells=odd_cells)

    printed, print_errors = [], []
    if args.print_n:
        want = kept if args.print_n < 0 else kept[:args.print_n]
        jobs = [(str(root), r['dir'], r['cell']) for r in want]
        with ProcessPoolExecutor(max_workers=args.jobs) as pool:
            for cell, err in pool.map(_print_one, jobs):
                (print_errors if err else printed).append((cell, err))
        print(f'{len(printed)} print packs written, '
              f'{len(print_errors)} failed')
        if len(want) < len(kept):
            print(f'  {len(kept) - len(want)} survivors were NOT printed; '
                  f'rerun with --print -1 to print all of them')

    index = {
        'date': date_str,
        'size': atlas.SIZE_LABEL,
        'cells_driven': len(rows),
        'passed_gate0': len(ok),
        'struck_words': {p: sorted(v) for p, v in dropped.items()},
        'survivors': len(kept),
        'contact_pages': [str(p.relative_to(root)) for p in pages],
        'contact_squares_laid_out': len(shown),
        'print_packs_written': len(printed),
        'print_packs_failed': [c for c, _ in print_errors],
        'print_packs_not_written': max(0, len(kept) - len(printed)),
        'set_aside_by_eye': len(odd),
        'set_aside': odd,
        'cells': [{'cell': r['cell'], 'dir': r['dir'],
                   'words': r['words'], 'pairs': r['pairs'],
                   'worst_seam_mm': r['worst_seam_mm'],
                   'notch_worst_mm': r['notch_worst_mm']} for r in kept],
    }
    (root / 'katalog-index.json').write_text(json.dumps(index, indent=2))
    print(f"\nwrote {root / 'katalog-index.json'}")


if __name__ == '__main__':
    main()
