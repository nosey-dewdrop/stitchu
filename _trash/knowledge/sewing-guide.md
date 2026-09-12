# Sewing companion knowledge base

The source of truth for the "you drafted it, now sew it" layer: which fabric,
in which order, with which tips. Everything the result page, the printed cover,
the guide/ content pages and future blog posts draw from lives here, so the
advice is one voice and every number has a source.

This file is deterministic and rule-based on purpose: there is ZERO runtime LLM
cost. The engine already knows the garment type, the silhouette and every block
it drew (dart, placket, tie, slit, strap, collar, gather, open-back, ...). This
layer maps those known facts to fabric families and a construction order. It
does not invent; where the engine draws a block it cannot yet, the honesty layer
(web/js/missing.js) already says so out loud.

Sources: Winifred Aldrich, *Metric Pattern Cutting for Women's Wear*;
Helen Joseph-Armstrong, *Patternmaking for Fashion Design*; *Reader's Digest
Complete Guide to Sewing* (construction order); M.Müller & Sohn; NMSU Extension
G-401, SDSU / UKY Extension fabric guides (weight/drape facts, already in
web/data/fabrics.json). Construction-order convention below follows the standard
tailoring sequence taught in all three pattern books.

---

## 1. Fabric selection logic (weight + drape, and WHY)

The question is never "which fabric" in the abstract; it is "which fabric for
THIS garment in THIS silhouette". Two levers decide it:

- **Weight (gramaj):** how heavy the cloth is, in grams per square metre. Light
  ~80-140 g/m², medium ~150-250 g/m², heavy 250 g/m²+. Weight sets how much the
  cloth can hold its own shape versus fall.
- **Drape:** how the cloth falls under its own weight. Crisp fabrics stand away
  from the body and hold a folded edge (a pleat, a stiff A-line); fluid fabrics
  pour straight down and pool. Drape is set by weight AND weave/fibre together.

The rule that ties them to the pattern: **a silhouette that STANDS AWAY from the
body wants a fabric that holds its shape (crisp, medium weight); a silhouette
that FALLS CLOSE to the body wants a fabric that drapes (fluid, light weight).**
Gathers and full skirts are the middle case: they need enough body to fill out
but enough drape not to stand out like a lampshade, so a soft-medium is the aim.

### Fabric families (from web/data/fabrics.json, sourced)

| family | weight | drape | holds a crisp edge? |
|---|---|---|---|
| cotton poplin | medium | crisp, holds shape | yes |
| linen | light-medium | somewhat stiff | yes (creases) |
| cotton lawn / voile | light | soft, slight drape | no |
| viscose / rayon | light | very fluid, flowing | no |
| crepe | light-medium | fluid with body | slightly |
| ponte / stable knit | medium | soft, holds shape | some |
| jersey (knit) | light-medium | very soft, stretchy | no |
| wool suiting / gabardine | medium-heavy | crisp, tailored | yes |

### Garment x silhouette -> fabric family + reason

Each row: what the shape needs, why, and the honest trade-off. This is the
"neden" the result page states in plain language.

- **Structured / fitted dress or top (princess or dart, straight/A-line, natural
  waist):** wants a MEDIUM CRISP woven (cotton poplin, linen, wool suiting) so
  the seams read as clean lines and the shape holds. A fluid viscose here goes
  limp and the fitted lines collapse. Trade-off: crisp cloth creases (linen) and
  needs pressing.
- **Fluid / bias-feeling dress (half-circle skirt, drapey top, cowl feel):**
  wants a FLUID LIGHT woven (viscose/rayon, crepe, lawn). The fall IS the design;
  a crisp poplin would stand out in a stiff bell instead of pouring. Trade-off:
  fluid cloth shifts while you cut and sew (cut single-layer, use a walking foot).
- **Gathered / babydoll / empire (gathered skirt, drawstring/shirred, ruffles):**
  wants a SOFT-MEDIUM woven with body but movement (cotton lawn, voile, soft
  crepe, chambray). Enough body to fill the gathers, enough softness that they
  fall rather than jut. Trade-off: too crisp = a stiff pouf; too heavy = the
  gathers sag and pull at the seam.
- **Knit / stretch garment (fabric = knit):** wants a STABLE KNIT (ponte, double
  knit) for structured shapes, a soft jersey for close drapey ones. The pattern
  is drafted with less ease because the cloth stretches. Trade-off: knits need a
  ballpoint needle and a stretch/zigzag stitch or the seams pop; a zipper is
  often optional (the garment pulls on over the head).
- **Tailored / collared / plackets (shirt collar, button placket, stand collar):**
  wants a CRISP MEDIUM woven that presses sharp (poplin, shirting, linen). The
  collar stand and the placket fold need a fabric that takes a hard press; a soft
  viscose collar will not stand. Trade-off: interfacing choice matters as much as
  the cloth (fuse a crisp interfacing to collar and placket).
- **Skirt, standalone, straight/A-line:** medium crisp woven (poplin, linen,
  gabardine, denim). Holds the A-line's stand-away flare and the straight skirt's
  clean side seam.
- **Skirt, gathered / pleated:** soft-medium with body (chambray, soft cotton,
  light wool) so the pleats or gathers fall in soft columns, not stiff cardboard.

### Weight cheat-line (what to ask for at the shop)

- Standing-away shapes (A-line, structured bodice, pleats): "medium weight,
  crisp, holds a fold" — 150-250 g/m².
- Falling-close shapes (drapey dress, half-circle, cowl): "light weight, fluid,
  pours" — 80-140 g/m².
- Gathered / babydoll: "light-medium, soft with a bit of body".
- Always PRESHRINK a natural fibre (cotton, linen) before cutting — it shrinks in
  the first wash and an un-preshrunk garment comes out a size small.

---

## 2. Construction order (the sequence, and why)

The standard tailoring order (Reader's Digest / Aldrich / Armstrong). You build
FLAT for as long as you can — every seam is easier to sew, press and finish while
the piece is still open. You close it into a tube (side seams, sleeves) only near
the end. The engine already emits the exact per-garment steps in this order
(web/js/render.js `guideSteps`, drawn from engine/src/garment.cpp); this is the
phase model behind them.

1. **Prep.** Print + check the calibration square. Cut every piece as labelled
   (on fold / cut 2). Sew a muslin first if the fit matters.
2. **Stabilise (staystitch).** Staystitch curved/bias raw edges (neckline, strap
   edges, low back) just inside the seam line so they cannot stretch out of shape
   while you handle them. Fuse interfacing to facings, collars, plackets NOW,
   while flat.
3. **Shape the panels (darts / princess / gathers).** Sew all darts, or the
   princess seams, first, while every panel is still flat and single. Form
   gathers and shirring now too. This is where the flat cloth becomes body-shaped.
4. **Structural add-ons on flat panels (placket, open-back facing, keyhole).**
   Work any opening that is easier flat — a button placket, a keyhole, a back
   cutout and its facing — before the side seams close the garment into a tube.
5. **Joins that keep it flat-ish (shoulders, then neckline finish).** Sew the
   shoulder seams. Attach and understitch the neckline facing OR set the collar OR
   run the bias binding (halter) — the neck is finished while you can still open
   the garment flat at the shoulders.
6. **Close the tube (side seams, sleeves).** Sew the side seams. Set in the
   sleeves (ease or gather the cap into the armhole). Finish armholes if sleeveless.
   Add ruffled/gathered straps here.
7. **Skirt + join (dresses).** Sew the skirt seams (leave the CB open for the
   zipper), join bodice to skirt at the waist/underbust seam matching side seams.
8. **Closure.** Insert the invisible zipper in the CB through bodice and skirt
   BEFORE closing the seam below it; tack the facing/binding ends over the tape.
   Sew ties/sashes and catch them at their placement notch.
9. **Hem last.** Try it on, mark, then hem — a bias/half-circle skirt hangs 24 h
   first so the bias drops before you cut it even.

Why this order matters: every step here is done at the LAST moment it is still
easy. Set a sleeve after the side seam is closed and you fight a tube; sew the
dart after the side seam and you can't press it open cleanly; hem before the
seams settle and the hemline goes wavy.

---

## 3. Block -> construction note map

Each opt-in block the engine can draw has one construction phase it belongs to
and one tip. The engine already places these in its guideSteps; this is the
reference so content pages and the result "sewing tips" summary agree with it.

| block (engine) | phase | tip |
|---|---|---|
| darts | 3 shape | press toward centre; a dart pressed the wrong way shows a ridge |
| princess seams | 3 shape | clip the side panel's curve over the bust inside the SA so it lies flat |
| gathers / shirring / drawstring | 3 shape | two rows of gathering thread, pull evenly, distribute fullness |
| button placket | 4 flat add-on | interface the stand; a mandatory button at the bust stops gaping |
| keyhole / open-back cutout | 4 flat add-on | sew on the marked line, slash inside, turn, understitch so it sits flat |
| collar (stand / flat / shirt) | 5 neck finish | trim + clip the neck seam; press the stand or roll before topstitching |
| neckline facing | 5 neck finish | understitch so the facing rolls to the inside and never shows |
| halter bias binding | 5 neck finish | stretch the binding slightly on inner curves so it lies flat |
| set-in sleeve | 6 close tube | run gathering between the cap notches, ease the cap in, no tucks |
| puff / gathered sleeve cap | 6 close tube | gather only the crown between the notches; below matches the armhole 1:1 |
| ruffled straps | 6 close tube | gather the strip down to the marked length, catch at the shoulder notch |
| back hem slit / walking vent | 7 skirt | bar-tack the top of the slit so the seam does not tear open |
| fabric ties / sashes / bows | 8 closure | fold the tube, turn, press; catch the tie at its placement notch |
| hem | 9 hem last | 2 cm double fold; a half-circle hangs 24 h first |

Honest boundary: where the engine cannot draw a block yet (spaghetti straps,
sailor collar, hand-smocking, side pockets...), the honesty layer says so and
this map stays silent rather than inventing a step.
