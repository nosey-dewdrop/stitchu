# stitchu engine — collarless by default, smoother armhole, more sixties minis (2026-07-17)

Sequential log for the three engine/pattern issues Damla raised. All proven, all in-lane
(engine/src, engine/tools, web/patterns, web/vendor, web/collection-60s70s.html, backend/engine).
Parallel agent owned README.md/docs (its commit bccbf80 landed cleanly, no overlap).

## Issue 1 — no collar unless the garment truly needs one

The honesty layer was already correct: `create.js` SPEC default is `collarType: 'none'`, and the
vision→spec bridge (`pickCollar`) only sets a collar when the word "collar" is actually seen. Nothing
adds a collar by accident from the create flow.

The unnecessary collars were HARD-CODED in the 60s/70s vintage collection specs
(`engine/tools/render-vintage6070.mjs`). Three plain-shift garments carried a collar they did not need:

REMOVED (3 unnecessary collars → now plain bias-bound necklines):
- `sixties-stand-collar-shift` (stand collar on a plain sleeveless shift) → `sixties-boat-neck-shift-mini`, boat neck, bias-bound, and shortened to a mini.
- `sixties-mandarin-collar-shift` (mandarin collar on a plain jersey shift) → `sixties-crew-neck-jersey-mini`, crew neck, bias-bound, A-line mini.
- `sixties-stand-collar-tent-mini` (stand collar on a tent mini) → `sixties-crew-neck-tent-mini`, crew neck, bias-bound.

KEPT (1 genuinely collared style — Damla's own keep-example "a shirt"):
- `sixties-pointed-collar-tunic` — a shirt-style tunic top; the pointed shirt collar IS the style.

Verified in `web/patterns/vintage6070/meta.json`: exactly ONE look emits a Collar piece
(the pointed-collar tunic: "Shirt Collar Stand" + "Shirt Collar Blade"). Every shift/mini is
collarless. The collar code stays fully available as opt-in (nothing deleted from the engine);
the showcase patterns `mandarin-collar-fitted-blouse` and `peter-pan-collar-puff-sleeve-babydoll-dress`
(web/patterns/svg) are deliberate collared showcases and stay — a mandarin-collar blouse where the
collar IS the style is exactly the keep-case.

## Issue 2 — armhole (kol oyuntusu) geometry

Root cause found in `engine/src/bodice.cpp` `armholeCurveFor()`: the armhole was ONE lazy cubic whose
control points produced a near-straight diagonal (a bent stick), identical for sleeved and sleeveless,
identical front and back.

Fix (still a single cubic so the princess `splitCubic` machinery is untouched, rendered as a native
SVG cubic so it is perfectly smooth):
- Reshaped the control points into a proper scye: the curve leaves the shoulder heading down and
  slightly in, HOLLOWS inward through the middle (the concave scye), and arrives at the underarm
  near-tangent to the side seam (smooth turn, not a corner). Shares added to bodice.hpp
  (`armholeHollowShareFront 0.34`, `armholeHollowShareBack 0.24`, upper/lower drop shares).
- FRONT scye is scooped deeper than BACK (anatomy) — new `isFront` flag threaded through
  makePiece / makePrincessPieces.
- SLEEVELESS armhole is now cut in: shoulder tip moved in 9 mm, underarm raised 6 mm, so a bare-
  shoulder edge hugs the body instead of gaping. Set-in-sleeve armholes keep full width so the cap
  seats. `options.sleeveless` set in garment.cpp (halter excluded — it has its own frame).

Before/after eyeball (isolated bodice pieces, EU38, Chrome raster):
- BEFORE: `/tmp/armhole-before-sleeved-crew-dress.png`, `/tmp/armhole-before-sleeveless-scoop-dress.png`
  — armhole a near-straight slash, sleeveless == sleeved.
- AFTER: `/tmp/armhole-after-sleeved-crew-dress.png`, `/tmp/armhole-after-sleeveless-scoop-dress.png`,
  `/tmp/armhole-after-sleeved-princess-top.png`, `/tmp/armhole-after-sleeveless-boat-shift.png`
  — clear concave scoop on the front, gentler curve on the back, sleeveless shows the cut-in
  shoulder + raised underarm.
- Assembled full print (sleeveless mini, taped): `/tmp/onay-mauve.png` — hollowed scye on the
  Bodice Center Front/Back pieces, no page-boundary breaks, register + grainlines intact.

Sleeve cap still seats: precision-report sleeve cap ease 4.0% (0-10% window), all seam pairs 0.00 mm.

## Issue 3 — real 60s/70s mini dresses

Was 8 genuine mini DRESSES (the other 4 were midi/top/collared). Added 4 authentic collarless minis
and converted 2 former collar-midis into minis. Now **13 mini dresses** of 16 looks, all drafting
FULL (complete piece sets, no missing pieces), all collarless (bias-bound round/boat/scoop necks):

Added:
- `sixties-mod-colorblock-mini` (Quant, princess A-line, crew, 10 pcs)
- `seventies-scoop-neck-shift-mini` (Biba, scoop, short sleeve, 6 pcs)
- `sixties-babydoll-scoop-mini` (Twiggy, empire gathered babydoll, scoop, 6 pcs)
- `sixties-boat-neck-longsleeve-mini` (Courrèges, princess knit, boat, long sleeve, 10 pcs)

`web/collection-60s70s.html` regenerated (16 looks, ?v=81). EM DASHES removed from all new visible
copy (Damla rule). Style-lint clean (54 pages + 7 css, 0 violations) after adding the new mini titles
to `style-lint.allow.json` (catalog labels, DESIGN-RULES rule 4).

## Proof battery (all green)

- ctest: **29/29** passed.
- golden: deliberately regenerated (armhole reshape changes all bodices + sleeve caps). Line count
  identical (23034), self-verifies at **0.000000 mm**. `golden-reference.csv` updated.
- precision-report: worst seam pair **0.00 mm**, sleeve cap ease 4.0%.
- vocab-sweep: **37800 drafts, 0 sewability failures**.
- web-fuzz: **26260 drafts, 0 FAILURES** (6521 honest validator-blocks, unchanged behavior).
- wearability-bench: **55 specs, 0 UNWEARABLE** (head=0 fold=0 edge=0) — armhole edge-finish still passes.
- render-pages RENDER-ONAY: 0 issues; assembled mini strip eyeballed (`/tmp/onay-mauve.png`).
- style-lint clean, header-diff: collection-60s70s.html is variant-2 (pre-existing — it has its own
  local nav, header untouched by this change; 0 hard failures).

WASM rebuilt (engine/build-wasm.sh, emscripten) → web/vendor/stitchu-engine.js + backend/engine/.
Pattern SVGs + pages regenerated with the new armhole.

## Deltas
- Unnecessary collars removed: **3** (2 stand + 1 mandarin, all on plain shifts). 1 legitimate collar kept (shirt-collar tunic).
- Armhole: near-straight diagonal → proper hollowed scye, front deeper than back, sleeveless cut-in. Golden updated 0.00 mm self-verify.
- 60s/70s mini dresses: **8 → 13**, all collarless, all draft complete.
