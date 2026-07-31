#!/usr/bin/env python3
"""
03-band-ingredients.py  (2026-07-31)

CLAIM UNDER TEST
----------------
"There is no such thing as a collar TYPE. There is a curved BAND: an attach edge of
length L, a depth profile w(s) (= stand + fall), and a curvature profile k(s) that
decides how much the free edge is longer than the attach edge (= flare/fullness).
Change those numbers and you get a mandarin, a Peter Pan, a shirt collar, or a shape
that is on nobody's list."

METHOD (falsifiable, no engine output used as evidence)
------------------------------------------------------
Ground truth = the traced vector outline of a BOUGHT couture pattern
(patterns_real/geometry/geometry-full.json, mm-calibrated from the PDF, size 38).
For each band piece:
  1. split the closed outline into attach edge / free edge / two end edges,
  2. measure w(s) and k(s) along the attach edge,
  3. FIT each to a low-order polynomial  -> a small fixed number of ingredient values,
  4. REGENERATE the whole outline from those values only,
  5. report deviation from the traced outline in mm.

If a handful of numbers reproduces the piece, the piece needs no NAME, and the enum
that has no slot for it is the wrong vocabulary.
"""
import json, sys, numpy as np

SRC = 'patterns_real/geometry/geometry-full.json'
DEG = 3  # polynomial degree for k(s) and w(s) -> (DEG+1) coefficients each


def load(pattern, piece, size):
    d = json.load(open(SRC))
    for r in d['rings']:
        if r['pattern'] == pattern and r['piece'] == piece and r['sizeGuess'] == size:
            return np.array(r['polygon'], float)
    raise KeyError(piece)


def resample_closed(P, n):
    q = np.vstack([P, P[:1]])
    seg = np.linalg.norm(np.diff(q, axis=0), axis=1)
    cs = np.concatenate([[0], np.cumsum(seg)])
    t = np.linspace(0, cs[-1], n, endpoint=False)
    return np.c_[np.interp(t, cs, q[:, 0]), np.interp(t, cs, q[:, 1])]


def resample_open(P, n):
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    cs = np.concatenate([[0], np.cumsum(seg)])
    t = np.linspace(0, cs[-1], n)
    return np.c_[np.interp(t, cs, P[:, 0]), np.interp(t, cs, P[:, 1])], cs[-1]


def corners(P, thresh=40):
    n = len(P); k = max(4, n // 40); dev = np.empty(n)
    for i in range(n):
        a = P[(i - k) % n] - P[i]; b = P[(i + k) % n] - P[i]
        c = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9)
        dev[i] = 180 - np.degrees(np.arccos(np.clip(c, -1, 1)))
    idx = []
    for i in np.argsort(-dev):
        if dev[i] < thresh: break
        if all(min(abs(i - j), n - abs(i - j)) > k * 3 for j in idx): idx.append(int(i))
    return sorted(idx)


def edges(P, idx):
    n = len(P); out = []
    for a, b in zip(idx, idx[1:] + [idx[0]]):
        seg = P[a:b + 1] if a < b else np.vstack([P[a:], P[:b + 1]])
        L = np.linalg.norm(np.diff(seg, axis=0), axis=1).sum()
        out.append((a, b, L, seg))
    return out


def curvature(C):
    """signed curvature along an open, arc-length-uniform polyline"""
    d1 = np.gradient(C, axis=0)
    d2 = np.gradient(d1, axis=0)
    sp = np.linalg.norm(d1, axis=1) + 1e-12
    return (d1[:, 0] * d2[:, 1] - d1[:, 1] * d2[:, 0]) / sp ** 3


def widths(A, F):
    """for each point of attach edge A, nearest distance to free edge F"""
    D = np.linalg.norm(A[:, None, :] - F[None, :, :], axis=2)
    return D.min(axis=1)


def regenerate(L, kc, wc, p0, th0, n=400):
    """Build the band outline from ingredients ONLY.
       L  = attach-edge length (mm)              -> GIRTH
       kc = poly coeffs of curvature k(s)        -> how the edge curves == FLARE source
       wc = poly coeffs of depth w(s)            -> BAND DEPTH (stand+fall)
       p0,th0 = placement (rigid, not shape)"""
    s = np.linspace(0, 1, n)
    ds = L / (n - 1)
    k = np.polyval(kc, s)
    th = th0 + np.concatenate([[0], np.cumsum(k[:-1] * ds)])
    A = np.c_[p0[0] + np.concatenate([[0], np.cumsum(np.cos(th[:-1]) * ds)]),
              p0[1] + np.concatenate([[0], np.cumsum(np.sin(th[:-1]) * ds)])]
    w = np.polyval(wc, s)
    N = np.c_[-np.sin(th), np.cos(th)]
    F = A + N * w[:, None]
    return A, F


def hausdorff_to(Q, P):
    """max & mean distance of each point of Q to polyline P"""
    D = np.linalg.norm(Q[:, None, :] - P[None, :, :], axis=2).min(axis=1)
    return D.mean(), D.max()


def analyse(pattern, piece, size, label):
    raw = load(pattern, piece, size)
    P = resample_closed(raw, 900)
    idx = corners(P)
    E = edges(P, idx)
    E.sort(key=lambda e: -e[2])
    if len(E) < 2:
        print(f'  !! {label}: only {len(E)} edges detected, skipping'); return None
    long2 = sorted(E[:2], key=lambda e: e[2])          # shorter long edge first
    inner_raw, outer_raw = long2[0][3], long2[1][3]
    N = 240
    A, Lin = resample_open(inner_raw, N)
    F, Lout = resample_open(outer_raw, N)
    # orient free edge to run the same way as attach edge
    if np.linalg.norm(A[0] - F[0]) > np.linalg.norm(A[0] - F[-1]):
        F = F[::-1]
    s = np.linspace(0, 1, N)
    k = curvature(A) * (N - 1) / Lin
    w = widths(A, F)
    # normal side: does the free edge sit on +N or -N ?
    d1 = np.gradient(A, axis=0); sp = np.linalg.norm(d1, axis=1)[:, None]
    T = d1 / (sp + 1e-12); Nv = np.c_[-T[:, 1], T[:, 0]]
    side = np.sign(np.mean(np.einsum('ij,ij->i', F - A, Nv)))
    w = w * side
    kc = np.polyfit(s, k, DEG)
    wc = np.polyfit(s, w, DEG)
    th0 = np.arctan2(T[0, 1], T[0, 0])
    A2, F2 = regenerate(Lin, kc, wc, A[0], th0, n=N)
    am, ax = hausdorff_to(A2, A)
    fm, fx = hausdorff_to(F2, F)
    flare = Lout / Lin
    print(f'  {label}')
    print(f'      attach edge (GIRTH)      {Lin:8.1f} mm')
    print(f'      free   edge              {Lout:8.1f} mm')
    print(f'      FLARE  free/attach       {flare:8.3f}   (1.00 = straight band = stands upright)')
    print(f'      DEPTH  w(s)              {w.min():6.1f} .. {w.max():6.1f} mm  (mean {w.mean():.1f})')
    print(f'      curvature k(s)           {k.min():8.5f} .. {k.max():8.5f} 1/mm')
    print(f'      INGREDIENT VALUES: L=1 + k coeffs={DEG+1} + w coeffs={DEG+1}  ->  {1+2*(DEG+1)} numbers')
    print(f'      traced outline stores    {len(raw)*2} numbers')
    print(f'      REGEN vs TRACED  attach edge  mean {am:6.2f} mm   max {ax:6.2f} mm')
    print(f'      REGEN vs TRACED  free   edge  mean {fm:6.2f} mm   max {fx:6.2f} mm')
    return dict(label=label, Lin=Lin, Lout=Lout, flare=flare, kc=kc.tolist(), wc=wc.tolist(),
                wmean=float(w.mean()), err=[am, ax, fm, fx], A=A, F=F, A2=A2, F2=F2)


if __name__ == '__main__':
    print(__doc__)
    print('=' * 78)
    print('BOUGHT COUTURE PATTERN  "Locket Top"  size EU38  (vector-traced from the A0 PDF)')
    print('=' * 78)
    res = []
    for piece, label in [('EXTRA-TL (not in defter)', 'piece 3  COLLAR  (tracer could not name it)'),
                         ('Collar', 'band B  (tracer called it Collar)'),
                         ('Collar Lining', 'band C  (tracer called it Collar Lining)')]:
        r = analyse('locket_top', piece, '38', label)
        if r: res.append(r)
        print()
    np.save('/tmp/stitchu-audit/bands.npy', np.array(
        [{k: v for k, v in r.items() if k in ('label', 'A', 'F', 'A2', 'F2')} for r in res], dtype=object))
    json.dump([{k: (v if not isinstance(v, np.ndarray) else v.tolist())
                for k, v in r.items() if k not in ('A', 'F', 'A2', 'F2')} for r in res],
              open('/tmp/stitchu-audit/bands.json', 'w'), indent=1)
