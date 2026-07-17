# Engine defaults: vintage simpler pieces + front/back flat sketch + technical markings — 2026-07-17

Engine track of the layered stitchu loop. Three jobs, all shipped, all proven.

## STEP 1 — simpler defaults across the WHOLE catalog (incl 60s/70s)

The main catalog was already disciplined by the prior pass (commit `1ab88ae`:
princess -> dart default, bias binding not facing). Re-audit confirms the main
specs are already at their right counts (bias binding is an honest cut strip;
princess is used only where the style is a princess style). This pass applied
the SAME discipline to the 60s/70s vintage specs, which still defaulted several
soft-knit / boxy-shift looks to Princess (splitting each bodice + skirt half into
center + side panels, 2 -> 4 each).

Rule applied: princess seams ONLY when the style truly calls for it. Kept
princess on `sixties-princess-seam-shift` (the name IS the style) and
`sixties-mod-colorblock-mini` (the princess seams are where the two-tone
colour-block runs — structural). Flipped the rest to dart and updated the EN/TR
note copy so the page text stays honest.

### Vintage before -> after piece counts (EU38 demo body)

| slug | before | after |
|---|---|---|
| sixties-fit-flare-knit-dress | 10 | **6** |
| sixties-boat-neck-shift-mini | 10 | **6** |
| sixties-boat-neck-longsleeve-mini | 10 | **6** |
| sixties-princess-seam-shift | 10 | 10 (princess IS the style — kept) |
| sixties-mod-colorblock-mini | 10 | 10 (colour-block runs on the seams — kept) |
| sixties-mondrian-shift-mini | 6 | 6 |
| sixties-empire-knit-mini | 6 | 6 |
| sixties-crew-neck-jersey-mini | 6 | 6 |
| sixties-pointed-collar-tunic | 7 | 7 |
| sixties-front-button-pinafore | 6 | 6 |
| sixties-vneck-front-zip-dress | 7 | 7 |
| sixties-side-tie-tweed-shift | 7 | 7 |
| sixties-empire-gathered-babydoll | 6 | 6 |
| sixties-crew-neck-tent-mini | 6 | 6 |
| seventies-scoop-neck-shift-mini | 6 | 6 |
| sixties-babydoll-scoop-mini | 6 | 6 |

Three vintage dresses dropped 10 -> 6. Two stayed at 10 because princess is
truly their identity.

### Main catalog piece counts (before == after, already disciplined)

| slug | pieces |
|---|---|
| boat-neck-linen-shell | 4 |
| scoop-neck-tank-mini-dress | 6 |
| boat-neck-button-down-top | 4 |
| gingham-button-blouse | 4 |
| mandarin-collar-fitted-blouse | 6 |
| back-tie-shift-mini-dress | 7 |
| square-neck-back-tie-babydoll-top | 5 |
| empire-waist-tie-back-dress | 8 |
| square-neck-drawstring-babydoll-dress | 8 |
| open-back-princess-mini-dress | 11 (princess bodice+skirt+open-back facing — its identity) |
| open-back-tie-back-mini-dress | 8 |
| peter-pan-collar-puff-sleeve-babydoll-dress | 9 (real collar keeps its facings) |

## STEP 2 — FRONT + BACK flat technical sketch

New shared renderer `engine/tools/render-flat.mjs` (imported by both
render-patterns.mjs and render-vintage6070.mjs). `renderFrontBack(pieces)`
splits the drafted pieces into a FRONT view and a BACK view (front-named pieces
on the left, back-named on the right; shared structural pieces — sleeve, collar,
yoke — drawn in BOTH so each view reads as a complete garment; strips once) and
draws two labelled panels with a divider, the clean commercial front/back look.
Each garment now writes BOTH `<slug>.svg` (nested cut layout) and
`<slug>-flat.svg` (front + back flat). meta.json carries `flat` for each entry.
collection-60s70s.html now shows the front/back flat as the primary figure with
the nested layout below.

Verified by Chrome PNG (RENDER-ONAY): scoop-neck-tank and the peter-pan
collar/puff-sleeve dress both show a clean FRONT panel and BACK panel; the back
pieces carry the visible zipper-teeth glyph + closure label; sleeve/collar/yoke
appear in both views; darts, grainlines and notches all present.

## STEP 3 — technical soundness (grainline, notches, closure)

New fields on `PatternPiece` (geometry.hpp): `std::vector<PathCommand> notches`
and `std::string closure`. Kept SEPARATE from `commands`/`markings` so the
sewing + cut geometry (and the golden dump, which reads commands + markings)
stays BYTE-IDENTICAL — the technical layer is purely additive.

New post-pass `annotateTechnical()` in garment.cpp runs after every geometry
post-pass, before the cutting-line offset:
- **GRAINLINE** — every piece must carry one; a straight vertical fallback is
  added to any piece missing it (most already had one).
- **BALANCE NOTCHES** — front = single notch, back = double notch, on the seams
  that must align: bodice/top side-seam armhole + waist points, skirt side-seam
  waist point. The sleeve cap already carried its own front/back notches; the
  bodice armhole now carries the matching counterpart.
- **CLOSURE** — a dress carries an invisible center-back zipper (mirrors
  `wearability::hasDonningOpening`): the back bodice + skirt back get a zipper
  glyph down the CB edge + the label "invisible zipper (center back)". Suppressed
  when the garment already opens elsewhere (open-back cutout, back tie/bow, front
  placket, halter) so no redundant zipper is stamped.

Wired through `bindings.cpp` JSON (`notches` + `closure`) -> WASM -> web
render + meta. Verified: sleeved dress front pieces get single notches, back
pieces get double notches + the CB zipper; open-back / back-tie dresses correctly
get NO zipper.

## Proof

- ctest **29/29**.
- golden **BYTE-IDENTICAL** (23034 lines, max delta 0.000000 mm). The task
  allowed a deliberate golden regen; the separate-field design made it
  unnecessary — byte-identical is a stronger no-regression proof.
- engine_check **70200 drafts ALL PASS**.
- vocab-sweep **37800 / 0 failures**.
- web-fuzz **26260 drafts / 0 failures** (6521 honestly validator-blocked).
- wearability-bench **55 specs / 0 unwearable**.
- render-pages **0 issues**, register-continuity **131 pairs OK, no clipping**.
- style-lint **clean, 70 pages + 7 css**; header-diff **identical across 46 pages**.
- RENDER-ONAY: Chrome PNGs of two flat sketches + the collection page eyeballed.
- WASM rebuilt (web/vendor/stitchu-engine.js + backend/engine/stitchu-worker.wasm).

## Files

Engine: geometry.hpp (notches/closure fields), geometry.cpp (translate notches),
garment.cpp (annotateTechnical post-pass), wasm/bindings.cpp (JSON).
Tools: render-flat.mjs (new shared renderer), render-patterns.mjs,
render-vintage6070.mjs (dart flips + copy), gen-vintage-page.mjs (front/back +
closure caption).
Data: web/patterns/svg/*.svg + *-flat.svg + meta.json, web/patterns/vintage6070/
*.svg + *-flat.svg + meta.json, web/collection-60s70s.html (v86).
