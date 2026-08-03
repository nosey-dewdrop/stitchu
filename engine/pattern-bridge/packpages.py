# ============================================================================
# packpages.py — the pages of a pattern pack that are not the pattern.
#
# A bought pattern is not a sheet of outlines. Before the outlines there is a
# page telling you which size you are, how much cloth to buy, and how to lay
# the pieces on it. Those pages were the whole difference between what this
# engine printed and what a person can act on, and none of them can be
# written down: the yardage is a consequence of the pieces, so it has to be
# packed and measured, and it changes with every dial.
#
# HOW THE CLOTH IS LAID. The industry default, and what every indie pattern
# assumes: the fabric is folded in half along its length, selvedge to
# selvedge. A piece cut ON THE FOLD is placed with its fold edge on that
# fold. Every other piece is cut through both layers at once, which is why a
# mirrored pair is drawn once and appears once in the layout while yielding
# two of cloth. So the usable width of the layout is HALF the bolt width, and
# the length that comes out of packing it is the yardage.
#
# The layout is drawn to scale, stated on the page, and the length is read
# off the packing rather than quoted from a table.
# ============================================================================
SELVEDGE = 1.0         # cm lost at each selvedge, both edges of the folded bolt
GAP = 1.0              # cm between pieces on the cloth
BOLTS = (110.0, 140.0)  # the two bolt widths an indie pattern quotes


def _open_pack(items, bin_w, gap=GAP):
    """Shelf-pack into a strip of fixed width and UNLIMITED length.

    items: [(key, w, h)] -> (positions{key: (x, y)}, used_length)
    Deterministic: tallest first, then by name. Returns None if any single
    piece is wider than the strip, because a piece that does not fit the
    cloth is a fact about the cloth, not something to pack around.
    """
    if any(w > bin_w for _, w, _ in items):
        return None
    order = sorted(items, key=lambda it: (-it[2], it[0]))
    pos, shelves = {}, []          # shelves: [y, height, x_cursor]
    used = 0.0
    for key, w, h in order:
        for sh in shelves:
            if h <= sh[1] and sh[2] + w <= bin_w:
                pos[key] = (sh[2], sh[0])
                sh[2] += w + gap
                break
        else:
            y = used
            pos[key] = (0.0, y)
            shelves.append([y, h, w + gap])
            used = y + h + gap
    return pos, max(0.0, used - gap)


def cut_layout(arts, bolt_w):
    """Lay every drawn piece on cloth folded in half, and measure the length.

    Pieces cut on the fold are placed against the fold first, because the
    fold is the one position they cannot be moved from. What is left of the
    width takes the rest.
    """
    fold_x = bolt_w / 2.0 - SELVEDGE      # the fold, measured from a selvedge
    on_fold = [(n, a) for n, a in arts.items() if a.fold]
    free = [(n, a) for n, a in arts.items() if not a.fold]

    pos, y = {}, 0.0
    for name, art in sorted(on_fold, key=lambda kv: (-kv[1].h, kv[0])):
        if art.w > fold_x:
            return None
        pos[name] = (fold_x - art.w, y)   # fold edge ON the fold
        y += art.h + GAP
    fold_len = max(0.0, y - GAP)
    fold_col = max([a.w for _, a in on_fold], default=0.0)

    rest_w = fold_x - fold_col - GAP
    packed = _open_pack([(n, a.w, a.h) for n, a in free], rest_w) if free \
        else ({}, 0.0)
    if packed is None:
        # nothing fits beside the folded column; run the free pieces below it
        packed = _open_pack([(n, a.w, a.h) for n, a in free], fold_x)
        if packed is None:
            return None
        for name, (px, py) in packed[0].items():
            pos[name] = (px, fold_len + GAP + py)
        return pos, fold_len + GAP + packed[1], fold_x
    for name, (px, py) in packed[0].items():
        pos[name] = (px, py)
    return pos, max(fold_len, packed[1]), fold_x


def yardage(arts):
    """Cloth length needed at each bolt width, measured by laying it out."""
    out = []
    for bolt in BOLTS:
        laid = cut_layout(arts, bolt)
        out.append({'bolt_cm': bolt,
                    'length_cm': None if laid is None else round(laid[1], 1),
                    'laid': laid})
    return out
