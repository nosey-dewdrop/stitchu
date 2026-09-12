# patches on the vendored generator

`core/third_party/garmentcode/` is gitignored (465MB, carries its own venv), so
every change made to the generator lives here as a diff and nowhere else.
Upstream base is `d449629`.

Apply after a fresh clone:

    cd core/third_party/garmentcode
    git apply ../../../engine/pattern-bridge/patches/*.patch

## 0001 — interface matching

Two corrections to `StitchingRule` in `pygarment/garmentcode/connector.py`.
Together they are why a fitted bodice now sews to a bottom. Before, the fitted
bodice joined none of the eight bottoms in any of the three waistband options;
after, it joins 23 of 24. All 33 seam-deed tests stay green.

### a. the projection tolerance is a length, not a fraction

`match_interfaces` decides when a vertex on one side of a stitch IS a vertex on
the other. The threshold was `min(1e-2, min_frac/2)`, a pure fraction of the
interface. On a 72.6cm waist, 1e-2 is 7.3mm, nine times the 0.79375mm (1/32")
production standard the finished pattern is then measured against. Any two
vertices inside that window were welded together, and the length difference
they carried was not shared out, it was dropped onto whatever segment the
one-directional walk happened to be standing in.

The dart mouths came out identical at 41.8353mm, which looked like the one
thing working, and was the fault. They sat well inside the window, so the
0.17mm each should have carried went into the neighbour instead, and four such
pushes stacked into −1.47, −0.79, +0.80 and −1.47mm across the back waist. That
sequence is not its own mirror, so the two halves of the garment stopped
agreeing: 1.5904mm of spread at the front and 1.5904mm at the back, the same
number to four decimals on two seams that never touch.

`SNAP_CM = 0.01` bounds the snap in length, so a vertex can never move more
than 0.1mm, an order below the standard the seam is judged against.

Fitted bodice on a pencil skirt, no waistband:

| | edges | shortest edge | failing seams | mirror faults |
|---|---|---|---|---|
| before | 78 | 5.2343mm | 5 | 2 |
| after | 88 | 0.3705mm | 0 | 0 |

The ten extra vertices are the price. Pairs that used to be welded are two
segments now, the shortest 0.3705mm against a partner of 0.372mm, so the seam
is true to 0.0015mm and the segment is thinner than the line you cut along.

### b. panel joints are anchors, so a local error stays local

Matching by fraction of the WHOLE interface lets one local disagreement move
every seam on the garment. The fitted bodice and the trousers agree about the
front waist to **0.0000mm** and disagree about the back by 1.4734mm per side.
Because the front is a slightly different share of 726.2847mm than it is of
723.3380mm, the walk landed the front panel joint 0.7984mm off and cut a sliver
out of a seam that was already exact.

A front sews to a front. The panel runs are now held fixed and each side's
proportions are applied only within its own run, so the error stays where it is
produced, and since the runs come in mirrored pairs the subdivision comes out
mirrored too. The front waist is left untouched at 118.7585 / 77.2315 on both
sides; the back carries its own 1.4734mm as 0.5433, 0.0082, 0.3638, 0.0050 and
0.5531mm, every one inside the production standard.

Equal run counts alone are not enough to anchor on, and this cost a wrong
answer before it was gated. A four-panel skirt of four equal 180.8345mm panels
also presents four runs against the bodice's 195.99 / 195.99 / 167.15 / 167.15,
and its joints are nowhere near the bodice's side seams. Holding them fixed
sewed a 195.99mm run to a 180.83mm one and put 9.18mm of error into ten seams.
So the joints must already agree before they are held: every run boundary has
to land within `ANCHOR_REL = 1e-2` of the interface on both sides. The trouser
waist boundaries disagree by at most 0.22%, the four-panel skirt by 3.97%, and
1e-2 is the generator's own original notion of nearness, far too coarse to cut
with and exactly right for asking whether two joints are the same joint.

### what is still open

`SkirtManyPanels` with no waistband is the one failing cell of 24. It takes the
fallback path, where the joints genuinely do not correspond, and the plain
one-directional walk still splits its two halves at different points. With
either waistband it passes.
