# stitchu — neckline extension loop (patch 3.16): cowl + pussy-bow

2026-07-17 · background Opus loop · own worktree · zero credit spent (offline reclassify)

## What shipped
Two vocabulary necklines APPENDED to the `Neckline` enum, orthogonal to every
other block (sleeve/shoulder/armhole/pocket/hem untouched):

- **Cowl** (`Neckline::Cowl`, value 7) — a shape, no new piece. The front neck is
  cut WIDE (`neckWidthMultiplier` 1.4, wider than boat 1.35) + DEEP
  (`frontNeckDepth` neckW+90, deeper than scoop neckW+50), and `NecklineExtBlock`
  rotates the front grainline to 45° (bias) + appends "CUT ON THE BIAS … drape
  excess … self-facing" to the cut note. The bias + depth is the drape; the neck
  edge folds back on itself, no separate facing. Aldrich cowl.
- **Pussy-bow** (`Neckline::PussyBow`, value 8) — 2 new pieces via a post-pass.
  A high stand band (55mm, cf rise 12mm) whose attach edge is drafted STRAIGHT to
  the exact measured neckline length (band edge == neckline, 0.00mm, measured off
  the finished pieces by the same neck-point scan the collar uses) + a long
  self-lined tie tube (finished 55mm wide, length = 2× neck girth clamped
  [700,1400]mm). One tie sews into each CF band end, then knots into a bow.

New file: `engine/src/neckext.{hpp,cpp}` (`NecklineExtBlock::apply` +
`necklineLengthMM`), wired in `garment.cpp` after keyhole, keyed on the enum.

## (1) Two added, 7 byte-identical?
YES. Both are opt-in on the enum — `apply()` returns without touching anything for
Crew/Scoop/VNeck/Square/Boat/Sweetheart/Halter. **Golden byte-identical: 23034
lines, max delta 0.000000mm.**

## (2) RENDER-ONAY — what I saw
`render-pages.mjs` cowl-dress + pussybow-blouse → strip.svg → Chrome headless PNG
→ Read by eye:
- **cowl-dress**: full skirt/bodice panels + neck facings; the Bodice Center Front
  carries "CUT ON THE BIAS" and a 45° diagonal grainline (vs the vertical grain on
  every other piece). Register grid (A1..I2), cut+sew lines, grainlines all
  present; no hatch break across page boundaries.
- **pussybow-blouse**: bodice front/back/side + long sleeve, PLUS a long narrow
  strip in the left column (the tie, "cut 2 rectangle … bow" = bağ şeridi) and a
  short curved band piece (Pussy-bow Band, attach edge trued to the neckline).
  Placement notch on the front neck point. Clean pieces, no clipping.

Piece labels confirmed in the SVG text: `Pussy-bow Band`, `Pussy-bow Tie`,
`bağ şeridi`, `fiyonk`, `CUT ON THE BIAS`.

## (3) Benchmark number + attribution
**37/54 UNCHANGED** (offline cache reclassify, 0 vision calls, 0 credit).
Element accuracy 71/103 (68.9%) unchanged. This is the HONEST result and was
predictable from the manifest:
- No cowl / "draped neck" term exists in the 58-set at all → the cowl matcher
  matched nothing here.
- The pussy-bow's bow terms ("front tie bow", "neck bow tie", "back waist tie
  bow") were ALREADY counted as drawn by the Loop 4b applied-tie/bow rule, and
  are clustered with other still-missing elements (peplum, ruffled straps,
  drawstring, gathered bust) or are back/waist ties, not a pussy-bow neckline.
- I added a cowl matcher to `DRAWN_SINCE` (benchmark-58.mjs) for correctness on
  future data; it deliberately does NOT re-match the bow (no double-count).

This loop is a **vocabulary + moat add**, exactly as framed — accuracy on THIS
set does not move, and saying otherwise would be dishonest.

## (4) Deploy + proof
Proof regime, all green:
- ctest **23/23** (new `neckline_ext_check`: cowl deeper than scoop + bias
  grainline ~45° + cut note; pussy-bow band attach == half neckline 0.0000mm +
  self-lined cut-2 tie + front notch; 7 originals draw no band/tie; skirt skips
  honestly).
- golden byte-identical 23034 lines 0.000000mm; engine_check 70200 drafts PASS;
  cutline PASS; precision worst pair 0.00mm.
- web-fuzz **25730/0** (neckline sweep now includes cowl+pussyBow);
  vocab-sweep **48600/0** (2 necklines added to the matrix).
- style-lint clean (53 pages+7 css); header-diff clean (46 pages).

Bridge: `bindings.cpp` necklineFrom "cowl"/"pussyBow" (neckline crosses as a
STRING, not an int — the prompt's "Cowl=7/PussyBow=8 int" assumption did not match
this codebase; enum ordinal is 7/8 but the wire format is the string);
`backend/draft.js` ENUMS list; `web/js/create.js` manual neckline picker + vision
pass-through; `web/js/missing.js` suppresses a cowl/pussy-bow oov term when drawn
(asymmetric cowl / asymmetric bow stay honest); `backend/worker.js` vision schema
adds both neckline values (code ready, **worker deploy = Damla**). Two wasm targets
rebuilt (browser + worker) via build-wasm.sh.

Docs: FORMULAS.md "Cowl + pussy-bow neckline"; PROJECT.md roadmap checked;
patches.html patch 3.16 (EN/TR, honest note "vocabulary not accuracy"); ?v 74→75,
badge v74→v75.

## Honest boundaries (drawn, not silent)
- An asymmetric / multi-layer draped cowl is not drawn.
- An asymmetric bow is not drawn (the tie is a symmetric self-lined tube).
- Neither drafts on a skirt (no neckline → honest skip).
