# patches on the vendored generator

`core/third_party/garmentcode/` is gitignored (465MB, carries its own venv), so
every change made to the generator lives here as a diff and nowhere else.
Upstream base is `d449629`.

Apply after a fresh clone:

    cd core/third_party/garmentcode
    git apply ../../../engine/pattern-bridge/patches/*.patch

## 0001 — projection tolerance in length, not in fraction

`StitchingRule.match_interfaces` decides when a vertex on one side of a stitch
IS a vertex on the other side. The tolerance was purely relative:
`min(1e-2, min_frac/2)`. On a 72.6cm waist, 1e-2 is 7.3mm — nine times the
0.79375mm (1/32") production standard the finished pattern is then measured
against. Any two vertices inside that window were welded together, and the
length difference they carried was not shared out: it was dropped onto whatever
segment the one-directional walk happened to be standing in.

That is why a fitted bodice would not sew to a skirt. The waist mismatch was
2.95mm across the whole circumference, which is 0.4% and, spread evenly, would
have left every segment inside tolerance. Instead the dart mouths snapped to
each other at exactly 41.8353mm and the whole 2.95mm landed on four segments as
−1.47, −0.79, +0.80, −1.47mm. That sequence is not its own mirror, so the two
halves of the same garment stopped matching: 1.5904mm of spread at the front
and 1.5904mm at the back, to four decimal places.

The patch bounds the snap in length instead: `SNAP_CM = 0.01`, so a vertex can
never be moved further than 0.1mm, an order below the standard the seam is
judged against.

Measured, EU38, fitted bodice on a pencil skirt with no waistband:

| | edges | shortest edge | failing seams | mirror faults |
|---|---|---|---|---|
| before | 78 | 5.2343mm | 5 | 2 |
| after | 88 | 0.3705mm | 0 | 0 |

The cost is ten extra vertices, some of them hairline: the pairs that used to be
welded are now two real segments, and one of them can be a third of a
millimetre. They are paired to 0.0015mm, so the seam is true; they are shorter
than a pencil line, so nothing is cut differently.
