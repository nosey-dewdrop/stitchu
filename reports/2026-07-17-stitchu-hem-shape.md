# stitchu — hem shape (etek ucu / alt kenar şekli), patch 3.15

Date: 2026-07-17. Loop: ETEK UCU (hem shape) motor rayı, market-pusula önceliği
("shirttail hem" freq=12 in the 28k mining pool). Kredi harcanmadı (offline + cache
reclassify).

## What shipped

The engine now reshapes the fitted lower-edge line of the skirt / dress-skirt / top
pieces into two hem shapes. It does NOT add a piece — it modifies the outline of the
existing body pieces (like the back-slit block), opt-in, byte-identical off.

- **Shirttail** (`HemShape::Shirttail`): center front + center back stay long, the
  sides curve UP by a soft rise (120 mm at the side seam, tapering to 0 at center).
  Symmetric front↔back.
- **High-low** (`HemShape::HighLow`): the front is raised short (220 mm) and the back
  dropped long (120 mm), the two blending at the side seams.

`HemShape { Straight, Shirttail, HighLow }`, default Straight → golden BYTE-IDENTICAL.

## Geometry + truing

- Each hem-band vertex lifts by `centerDelta + (sideRise − centerDelta)·smoothstep(t)`,
  t = normalized horizontal position (0 at the piece's center/gore edge, 1 at its
  outer edge), depth-weighted to taper to 0 at the top of the band so the side seam
  blends in. Curve control points lift with the same function → the hem stays smooth.
- **Gore seam trued (0.0 mm)**: a princess Center panel spans fold→gore seam and stays
  long (shirttail: no lift); a Side panel's gore edge (its min-x, t=0) carries the SAME
  centerDelta the Center panel's gore edge carries, so both edges of every gore seam
  stay matched (validator gorepair passes).
- **Side-seam balance trued**: the front and back SIDE hems lift to the SAME height
  (shirttail: both by 120; high-low: both to sideCommon = (220−120)/2 = 50), so a front
  and its matching back still meet at the side seam. Verified numerically: high-low maxi
  dress Skirt Side Front outer hem y=862 == Skirt Side Back y=862; Center Front hem
  y=680 (short) vs Center Back y=1020 (long, +340 mm).

## Honest limits (gates, no silent no-op)

- Only the soft symmetric shirttail and front-short/back-long high-low are drawn. An
  asymmetric-diagonal hem, a handkerchief/pointed hem (peplum's pointed covers the flare
  case) and a mullet on a gathered/pleated/circle skirt stay in the honesty layer.
- A gathered/pleated/half-circle skirt has no shaped side hem → gated out at the garment
  level + refused honestly by HemBlock (guide note).
- A CROPPED top (< 380 mm host) is too short to curve without unbalancing the seams →
  refused honestly (it eats the side seam). Mini skirts (~462 mm) and hip/tunic tops
  (~467 mm) clear the gate.
- A DRESS bodice ("Bodice …") is never touched — only the dress's "Skirt …" pieces.
- The validator's top "hem extension did not apply" height check is relaxed by
  highLowFrontRise for a high-low front (the front is intentionally short).

## Proof regime (all green)

- **golden BYTE-IDENTICAL** (23034 lines, straight default).
- **ctest 23/23** including the new `hem_check`: straight byte-identical, shirttail
  side lift + center hold + waist untouched + front/back side balance, high-low front
  short/back long + sides meet, gathered skirt refused honestly, A-line dress hosts it.
- **engine_check** 70200 drafts ALL PASS · **cutline** clean · **precision** worst pair
  0.00 mm · **web-fuzz 20400 drafts, 0 FAILURES** (new hem sweep: shirttail + high-low
  × straight/A-line × princess/dart × dress/skirt × every length + tops) ·
  **vocab-sweep 37800/0** · style-lint clean (53 pages) · header-diff clean (46 pages).
- **RENDER-ONAY**: rendered a shirttail top (tunic) and a high-low dress (maxi) with
  render-pages.mjs → strip.svg → Chrome headless PNG → read by eye. Shirttail: center
  front/back panels level-long, side front/back panels sweep UP at the outer hem, both
  cut+sew lines present, no broken paths across sheet boundaries. High-low confirmed by
  geometry (front short 680, back long 1020, sides meet 862).

## Benchmark (honest attribution)

Cache reclassify, 0 vision calls: **FULL 34/54 UNCHANGED**, element accuracy
**71/103 UNCHANGED**. The 54-photo benchmark manifest contains ZERO shirttail/high-low/
mullet/curved-hem terms — none of those photos is a shaped hem — so the hem vocabulary
cannot move THIS benchmark (same shape as Loop 7 collar, which added 0 for the same
"no photo has it as the sole element" reason). This is a market-pusula capability add
(freq=12 in the broader 28k mining pool), proven correct rather than claimed.

## Bridge

create.js pickHemShape(seen) (shirt-tail / high-low / mullet / curved-hem terms; not
handkerchief/pointed/asymmetric/diagonal) → spec, gated to a fitted straight/A-line
skirt/dress or a top + a manual "hem shape" picker + seen.hemShapeDrawn suppresses the
missing.js note + the outOfVocab hem-shape term. engine.js/backend/bindings int hemShape
param (LAST arg). Two wasm targets rebuilt (build-wasm.sh + browser vendor + backend).
Worker VISION unchanged (redeploy only needed for /api/draft; the product flow uses the
browser wasm).

## Files

engine/src/hem.{hpp,cpp} (new), measurements.hpp (HemShape enum + spec.hemShape append),
garment.cpp (post-pass), validator.cpp (high-low height guard), CMakeLists.txt + tests/
hem_check.cpp, wasm/bindings.cpp, build-wasm.sh, tools/{web-fuzz.js, render-pages.mjs,
benchmark-58.mjs}, engine/FORMULAS.md "Hem shape". web/js/{engine.js, create.js,
missing.js}, backend/draft.js, web/patches.html (patch 3.15), ?v 74→75, js ?v 59→60,
badge v75.
