# Stitchu Engine — Drafting Spec

Extracted from the validated Swift engine (App/Stitchu/Engine/, 2805-draft matrix green on 2026-07-07).
This file is the source of truth for the C++ port: the port implements THIS, not a line-by-line
translation of Swift. Every constant traces to knowledge/stitchu.db (drafting_formulas) —
FreeSewing (Bella/Titan/Brian), Muller & Sohn, Winifred Aldrich. Items marked ASSUMPTION are
documented approximations for measurements the app does not collect; the sewing guide's muslin
warning covers them.

## Conventions
- All geometry in millimeters. Each piece in its own local space, origin top-left, y grows down.
- Piece outline = the SEWING line. Seam allowance is metadata (15 mm default, 10 mm bands/cuffs), not drawn.
- Path model: move / line / cubic curve (to, cp1, cp2) / close.
- Curve length: flatten cubics to 24 segments (used for armhole, cap, waist measurements).
- Self-intersection segments: flatten to 16 segments per curve.

## Measurements (input, cm; engine works in mm)
bust, waist, hip, shoulder (full shoulder width), backLength (nape to waist), armLength, neck.

## Bodice block (FreeSewing Bella + M&S)
- chestEase = 11% of body, waistEase = 5% of body (percent ease, never fixed cm)
- shoulderHalf = shoulder/2; shoulderDrop = shoulderHalf * 0.23  [ASSUMPTION ~13 deg]
- armholeY = backLength * 0.44 + shoulderDrop
- underbust = max(bust - 70, waist)  [ASSUMPTION B/C cup offset 70 mm]
- neck widths: back = neck * 0.197, front = neck * 0.17; boat neckline multiplies both by 1.35;
  both capped at shoulderHalf * 0.72 (a neckline can never eat the shoulder seam)
- back neck cutout = neck * 0.06; back neckline is always a shallow crew curve
- front neck depth by style: crew = neckW + 15, scoop = neckW + 50, v = neckW + 75,
  square = neckW + 40, boat = 28
- widths: back = underbust/4 * (1+chestEase); front = bust/4 * (1+chestEase)
- waist split: back 48%, front 52% of full waist  [ASSUMPTION]
- back suppression: reduction = backWidth - backWaistTarget (clamped >= 0);
  centerBack take-in = reduction * 0.35 * 0.5; dart = reduction - take-in (dropped if <= 0);
  waist edge width = takeIn + target + dart
- front suppression: up to 15 mm slants the side seam in AT THE WAIST ONLY (never at chest —
  that would eat bust ease); the rest is the waist dart
- balance (M&S): front length = back length + 40 mm, the drop lives at CENTER FRONT only;
  side waist sits at the same y for front and back (side seams must sew together), side point
  raised 8 mm above the waist line
- darts: legs ON the drafted waist curve (project x to curve y), apex above legs;
  back dart length = backLength - armholeY + 40; front = frontLength - armholeY - 40
- armhole curve: cubic from shoulderTip to (chestWidth, armholeY),
  cp1 = (shoulderHalf + (chest-shoulderHalf)*0.25, drop + (armholeY-drop)*0.55),
  cp2 = (chest - (chest-shoulderHalf)*0.45, armholeY - (armholeY-drop)*0.12)
- waist curve: side -> center cubic, cp1 = (takeIn + span*0.6, sideY + (centerY-sideY)*0.55),
  cp2 = (takeIn + span*0.25, centerY)
- center front/back edge: cubic whose cps interpolate between waist and neck cutout
  (guards deep necklines on short bodies from folding the edge back)
- back = cut 2 (CB seam carries take-in + zipper), front = cut 1 on fold

## Skirt block (FreeSewing Titan philosophy: body measurement + % ease)
- waistEase = hipEase = 2%; hipDepth = 200; lengths: mini 450, midi 650, maxi 900
- hipQuarter = max(hip*(1+ease)/4, waistQuarter)  (waist > hip bodies)
- suppression = hipQuarter - waistQuarter; side seam takes min(60%, 25 mm);
  dart gets the rest; dart under 8 mm is dropped and folded into the side seam
- side waist rises 12 mm; A-line flare = +60 at hem with 18 mm hem side rise; straight flare 0
- dart lengths: front 90, back 130; dart legs y follow the raised waist curve
- gathered: rectangle, width = waistQuarter * 1.9, gather line marking 18 mm below top
- half-circle: r = easedWaist / pi, R = r + length; TWO quarter-circle panels cut FLAT
  (cut 2 — on fold they would unfold into a full circle, doubling the waist);
  bezier arcs use kappa 0.5523
- waistband: half length = easedWaist/2 + 30 (button stand), height 80 (folds to 40),
  cut 2 interface 1, SA 10, fold line marking
- dress mode: skirt drafted against targetWaist = the bodice's SEWN waist (front+back sewn
  waists, darts excluded, x2); skirt back becomes "cut 2 (center back seam)" for the zipper
- fabric estimate (140 cm fabric, 10% margin): quarter styles ((len*2)/piecesPerWidth + 120)*1.10,
  piecesPerWidth = 2 if hem half-width*2 < 700 else 1; gathered same with panel width;
  half-circle (R*2 + 120)*1.10; meters rounded to 1 decimal

## Sleeve block (set-in, FreeSewing Brian technique)
- biceps = bust * 0.30 * (1 + 0.15)  [ASSUMPTION ratio + verified 15% ease]
- capHeight = armholeDepth * 0.75 (armholeDepth = armholeY - shoulderDrop)
- target cap length = armholeLength * 1.04 (4% cap ease)
- cap width found by BISECTION (cap length grows monotonically with width; fixed-step
  multiplicative walks oscillate): lo=60, hi=max(biceps,200)*3 grown x1.5 while too short
  (bounded 8000), 60 iterations max, stop when |cap - target| <= 0.5 mm
- cap = two S-curves (capLeft->top, top->capRight): hollow 0.24 front / 0.18 back,
  cp1 = (from + dx*hollow, from + dy*0.02), cp2 = (from + dx*0.55, from + dy*0.98)
- lengths: short = capHeight + 90, elbow = capHeight + arm*0.35, long = arm*0.96
- hem half-width: straight 0.40 * width, balloon 0.52; underarm mid-bulge 0.46 / 0.62
- gather notches at x = +-width*0.18; balloon adds hem gather line 25 mm up
- balloon cuff: length = biceps*0.62 + 20, height 60, cut 2 interface, SA 10
- validator window: actual cap ease must land in 1–9%

## Top block
- hem extra below waist: cropped 0, hip 180, tunic 300
- hip width per quarter = hip/4 * 1.04
- extension replaces the waist edge: side curve out to (hipWidth, sideWaistY + extra - 10),
  hem curve back to center at (0, centerWaistY + extra); front keeps its center balance drop;
  hem side depth measured from the SHARED side waist so side seams stay equal
- cropped tops keep waist darts; extended tops clear dart markings (no seam edge for legs)

## Dress block
- fitted bodice + skirt joined at the waist seam, invisible zipper runs CB through both
- fabric = skirt estimate + 0.7 bodice (+0.4 short/elbow or +0.7 long sleeves)

## Princess shaping (DEFAULT since 2026-07-13; darts = advanced/legacy option)
Applies to bodice halves (dress AND top) and A-line/straight skirt quarters;
gathered/half-circle have no waist shaping to convert.
- Bodice: the waist dart becomes an armhole princess seam. Same skeleton as the dart piece;
  split point on the armhole at shoulderDrop + armholeDepth * 0.38, clamped >= 30 mm above
  the apex and >= 15 mm below the shoulder tip (de Casteljau split of the armhole cubic).
- Seam = shared upper cubic split->apex (cp1 = split + 0.3/0.25 of the delta, cp2 vertical
  above apex at 0.30 of the rise; identical on both panels) + straight leg apex->waist.
- TRUING (the key correctness step): the waist curve sits deeper on the center side (front
  balance drop), so the raw side leg would be up to ~10 mm shorter than the center leg --
  irrelevant folded as a dart, unsewable as a seam. The side panel's waist end drops to
  apexY + sqrt(centerLeg^2 - (dart/2)^2) so both edges measure EQUAL; the side waist curve
  re-blends into the trued point (cp2 shifted by the same delta).
- Center front = cut 1 on fold, side front / center back / side back = cut 2. Side panels
  rebased to their own top-left origin. Bust-apex match notch marked on both edges.
- Skirt gore: dart legs become the gore seam legA/legB -> old dart tip -> straight to hem
  at the dart center x; A-line adds 40 mm flare per gore edge at the hem (straight adds 0);
  same truing applied against the 12 mm side-waist rise. Center panels on fold, side cut 2.
  Dress mode: skirt CENTER back carries the CB zipper seam (cut 2).
- Audit values: sewn waist measured along the actual split+trued curves (dress skirt is
  drafted against this); straight waist span basis unchanged (dartsum check identical).
- WAIST-JOIN ALIGNMENT (princess dress, A-line/straight): each skirt quarter drafts
  against ITS bodice half-waist (48/52 split respected) and the gore seam is placed by
  arc-walk so arc(CF -> gore) == arc(CF -> princess seam). Found by the virtual-sew
  audit (offsets up to ~8 mm before); validator rule "waistalign" <= 2.5 mm. Dart mode
  keeps the legacy centered dart (golden-diff surface, and a folded dart is internal).
- Armhole length, side seams, sleeve drafting: identical to dart mode by construction.
- Validator adds: princess edge pair |center - side| <= 2.5 mm (bodice, from audit values);
  gore seam pair <= 3.0 mm (skirt, measured from piece geometry: center [1].to+[2]+[3],
  side [4].to+[5]+[6]); skirt side-seam pairing prefers the "Side Front/Back" panels.
- Intake floor: bodice halves under 12 mm intake and skirt quarters under the 8 mm dart
  minimum stay unsplit (a seam that shapes nothing only adds pieces).
- Princess TOPS: the panels continue through the waist; the seam gap closes linearly to
  zero at hip depth (200), the side seam nips at the waist and flares to hip/4 * 1.04 in
  one curve (same construction as the dart-mode extension), sewn hem = hip quarter exactly.
  Trued legs share one y, so the below-waist edges mirror and measure equal by symmetry.
  A half under the 12 mm intake floor stays unsplit and uses the classic boxy extension
  (its audit side seam is reported extended so front/back stay comparable).
- Golden diff vs Swift runs with shaping pinned to Dart (Swift engine has no princess);
  princess correctness is covered by the engine-check matrix (5610 drafts).

## Waistline (dress): natural | empire
- Empire: seam sits at armholeY + 60 (empireDrop), CF balance drop 15 (vs 40 natural),
  suppression target = UNDERBUST girth (bust - 70 assumption) instead of waist.
- Apex stays at the bust point: front dart/seam leg = max(12, seamY-8 - (armholeY+40));
  back apex stays armholeY - 40 -> leg = empireDrop + 32. Natural formulas bit-identical.
- The skirt makes up the height: lengthExtra = backLength - waistSeamY added to the skirt
  length AND to the hip drafting depth (hip sits 200 below the NATURAL waist).
- empire + gathered = "babydoll dress"; other styles = "empire <style> dress".

## Fabric: woven | knit (ease scaling)
- bodice chest ease 11% -> 4% knit, waist ease 5% -> 2%; skirt waist/hip 2% -> 1%;
  sleeve biceps 15% -> 6%, cap ease 4% -> 2% (validator target follows fabric).
- Guides gain knit steps (zigzag/stretch stitch, ballpoint needle, optional zipper skip).

## Pleated skirt (knife pleats)
- Rectangle width = waistQuarter * 3 (pleatRatio); pleats n = max(3, waistQuarter/55);
  markings = vertical line PAIRS per pleat (fold on the second, bring to the first),
  140 mm deep; validator measures sewn waist as width / pleatRatio.

## Neck facings (dress + top, all necklines)
- Inner edge repeats the garment neckline commands VERBATIM (seam match by construction);
  outer edge = the neckline flattened to a polyline (12 steps/curve) and offset 55 mm along
  averaged vertex normals oriented away from the neck opening; shoulder end walks 55 mm
  (capped at 60% of the shoulder seam) from the neck point toward the shoulder tip.
- Front facing cut = front piece cut (cut 1 on fold), back = cut 2; both "interface".
- Fabric adder facingFabricMeters = 0.2 on dress/top (golden dump subtracts it).
- Validator rule "facing": both facings present; inner edge length == garment neck edge
  within 1.5 mm (k = 2 commands for the square front neckline, else 1).

## Validator invariants (port 1:1, tolerances in mm)
pairedSeam 3.0 · waistJoin 12.0 · dartSum 2.0 · chestWidth 1.5 · capLength 2.5 ·
capEase 1–9% · kink max 25 deg per flattened step (24 steps, skip steps < 0.3 mm) ·
maxPieceSpan 3000 · markingSlack 8 · fabric sane (0, 30] m
- every coordinate finite; every piece has a positive bounding box
- outline self-intersection: proper-crossing test on flattened segments, shared endpoints
  (eps 0.01) excluded, closing wrap excluded
- bodice front/back side seams equal; chest widths match eased targets (ease not eaten)
- straight waist span minus dart intake equals the waist target (dartsum)
- sleeve cap within tolerance AND ease window of its armhole
- dress: skirt sewn waist matches bodice sewn waist; skirt back carries a CB seam (zipper)
- standalone skirt: waist matches eased body waist; waistband (x2 - 60 stand) matches skirt
- top: hem extension actually applied (bounding-box heights); extended side seams equal
- dart intake detection: marking triplets move/line/line, near-horizontal (width > 2, drop < width)

## Acceptance for the C++ port (definition of done)
1. Port the engine-check harness matrix: 14 bodies (EU34–EU52 German chart + tall, petite,
   pear, apple, edge cases — exact values in engine-check/main.swift) x all garment specs
   = 2805 drafts, ZERO validation issues.
2. Golden files: Swift engine dumps piece outlines per (body, spec); C++ output diffs equal
   within 0.1 mm on every coordinate (deterministic formulas — no RNG anywhere).
3. WASM smoke test: one draft runs in a browser via the embind bindings.

## Platform notes for the port
- Replace CGPoint with a plain Point{double x, y}; no UUID (pieces identified by name/index);
  serialization to JSON at the WASM boundary only.
- No floating-point platform tricks: plain doubles, same flattening step counts as Swift,
  so golden diffs stay meaningful.

## Ruffle (fırfır) — opt-in hem trim (2026-07-13)
- GarmentSpec.ruffleHem (default false → every existing draft byte-identical).
- Attaches to a skirt/dress hem. Edge = SkirtBlock::hemCircumferenceMM (per style:
  ALine/Straight hipQuarter+flare(+gore) ×4; gathered/pleated waist×ratio×4; halfCircle πR).
- Cut length = hem × fullness (2.0–3.0). Cut in fabric-width segments ≤1400 mm, joined
  end to end (each piece printable, under the 3000 mm tile cap); gathered it returns to hem.
- Depth = ruffleDepthMM (+10 hem +12 SA in the strip height). Notches = even gather segments.
- Validator excludes "Ruffle" pieces from the skirt-waist sum (it's a trim, not waist-bearing).
- Covered by tests/ruffle_check (dress/skirt/babydoll: valid, printable, base unchanged, math).

## Tiered ruffle (kademeli fırfır) — cascade (2026-07-13)
- GarmentSpec.ruffleTiers (default 1 = the single ruffle above; clamped 1–5, active only
  with ruffleHem).
- Tier i (1-based) gathers onto the edge below it: edge_i = hem × fullness^(i-1), so its
  cut length = hem × fullness^i. Fabric use grows geometrically — that is the couture look.
- Every tier is ruffleDepthMM deep. Only the LAST tier carries the 10 mm rolled-hem
  allowance; intermediate tiers end in a 12 mm seam that receives the next tier's gathers.
- Same ≤1400 mm segmenting per tier; every piece stays under the 3000 mm print cap.
- Pieces named "Ruffle tier N (fırfır)" so the validator's trim exclusion still applies.
- Covered by tests/tiered_ruffle_check (opt-in, tiers=1 byte-identical to single, per-tier
  cascade math, seam-vs-hem heights, validity, printability).

## Sweetheart neckline (kalp yaka) (2026-07-13)
- Neckline::Sweetheart, front only (back stays a crew curve, as with every style).
- Width: neckWidthMultiplier 1.2 on BOTH front and back neck widths (boat 1.35 precedent) so
  the shoulder seams keep matching; ONE shared helper feeds the bodice AND neckFacings —
  they must never disagree or the facing validator fires.
- Depth: frontNeckDepth = neckW + 50 (neckW already widened) → the cleft lands between
  scoop and v-neck.
- Curve: one cubic from centerNeck(0,d) to neckPoint(w,0), cp1=(0.22w, 0.48d),
  cp2=(0.5w, 0.12d). Steep tangent at CF = the mirrored halves meet in the heart cleft;
  the mid-curve arcs >15 mm above the chord = the bust lobe (scoop stays on the chord).
  Candidates were rendered side by side first (engine/tools note) — "rounder" won.
- Facing: makeFacing reuses neckCommands verbatim, so the facing follows automatically.
- Covered by tests/sweetheart_check (depth ordering, cleft tangent, lobe lift vs scoop,
  facing match via validator, dress + sleeved top).

## Keyhole (anahtar deliği) — opt-in front opening (2026-07-13)
- GarmentSpec.keyhole (default false → base draft byte-identical). Dress + top only.
- Post-pass like the ruffle (KeyholeBlock::apply on the finished pattern), so BodiceBlock
  and the golden dumps are untouched by construction.
- Geometry: half teardrop MARKING on the front center piece against the CF fold — top point
  15 mm below the CF neck edge, length min(85, room above the waist − 60), half-width 0.26 L,
  slit-narrow at the top / round at the bottom (two cubics). Mirrored on CF = the keyhole.
- "Keyhole Facing" piece: the same teardrop offset +32 mm all around, solid, cut 1 on fold,
  interfaced, stitch line marked so it aligns; grainline vertical; seamAllowance 0 (you sew
  ON the line, slash inside, turn through, understitch).
- Construction steps insert right AFTER the neckline understitch step (a keyhole is worked
  before the side seams close), not appended at the end.
- Too little room (< 40 mm) → honest "Keyhole: skipped" guide note, never a silent no-op.
- Validator rule "keyhole": front teardrop present on the CF fold, below the neck edge,
  clear of the waist, inside the piece; facing covers it with ≥ 20 mm margin; a request
  with neither the pieces nor the skip note fails validation.
- Covered by tests/keyhole_check (dress princess, petite babydoll empire with the unsplit
  front, boat top; order of guide steps; margins; opt-in byte-identity).

## Halter (2026-07-13)
- Neckline::Halter — MORE than a neck shape: no shoulder seam, nape strap, low back,
  sleeves impossible (engine forces None + honest guide note when sleeves were picked).
- FRAME SHIFT reuses the whole makePiece/makePrincessPieces skeleton, no signature change:
  FRONT: local y=0 = the strap top edge; whole front drops by halterStrapRise (55).
  neckPoint := strap inner corner (fNeckW = frontNeckW × 0.55), shoulderTip := strap outer
  corner (fNeckW + halterStrapWidth 40, drop 10 → that short "shoulder" line IS the nape
  closure edge), "armhole" := the bare-shoulder sweep to the underarm (same shared
  armholeCurveFor cubic — ONE definition used by both piece builders AND the binding
  measure). Halter neck curve: cubic cp1=(0.75w, 0.5d), cp2=(w, 0.08d); depth = neckW+65
  (+ rise at the call site).
  BACK: local y=0 = the low top edge; backTopY = armholeY × halterBackDropShare (0.55).
  backCutout := 8 (slight CB dip), backNeckW := 0.7 × backWidth, shoulder stub at 0.85 ×
  backWidth / drop 2, short "armhole" stub to the underarm. Crew curve reused for the top
  edge. All returned scalars stay in BODY frame; piece-frame values live in
  frontPieceWaistY/backPieceWaistY/frontPieceLength/backPieceLength (extendPiece + top
  validator use these — identical to body frame off-halter).
- CRAMPED BACK RULE: when the princess split's exit point would be pushed down against the
  blade apex (splitTarget > apexY − princessApexClearance), the low back has no room for a
  princess seam and that half honestly falls back to dart mode (the EU50+empire kink).
- FACINGS → BINDING: one "Bias binding (halter)" strip (halterBindingWidth 32, bias, center
  fold marking, segmented ≤1400) replaces the neck facings. Its length comes from
  BodiceDraft.halterBindingEdgeMM = 2×(front neck + strap top + sweep + back top + stub)
  + 150 trim ease, measured in BodiceBlock::draft from the SAME geometry (never recomputed
  elsewhere). Print treats it as a chalk piece (no pattern paper).
- Validator: facingIssues halter branch (binding present, sane strip, NO neck facings),
  sleeveIssues expects none, topIssues heights use the piece-frame lengths.
- Covered by tests/halter_check (dress/top, princess/dart, natural/empire, knit, petite +
  plus bodies: valid, sleeves skipped honestly, strap width, low back vs crew, binding).

## Front button placket (düğme patı) — opt-in grown-on button stand (BENCHMARK-58 Loop 3)
- GarmentSpec.frontPlacket (default false → every existing draft byte-identical).
  Dress + top only. Post-pass like the keyhole (PlacketBlock::apply on the finished
  pattern), so BodiceBlock and the golden dumps are untouched with it off.
- Research: Aldrich (Metric Pattern Cutting for Women's Wear) + Armstrong
  (Patternmaking for Fashion Design, ch.16 buttons/buttonholes/facings). The stand
  is button-diameter driven; couture blouse/dress fronts use a GROWN-ON stand
  (self-facing folds back), fast fashion (Stradivarius/Bershka shirting) uses an
  applied band. We chose GROWN-ON (couture default, one piece, no seam at the
  finished edge). No button size is collected → 18 mm blouse button ASSUMPTION,
  documented; the guide's muslin note + placket step cover swapping it.
- Geometry (front piece, CF at x = 0): the CF EDGE (the last outline curve, waist
  → neck point) is offset outward by standWidth = 18 mm (= button Ø) so the
  finished front edge lands at x = -18; a short horizontal LINE joins the grown
  stand top back to the TRUE neck point. The neckline itself and every other edge
  are UNTOUCHED → the neck facing still matches (its validator would fire otherwise).
- Markings: fold line at the true CF (x = 0, neck→bottom); fold-back facing line at
  x = +18 (facing turns back this far); buttons = short cross ticks ON the CF line;
  buttonholes = horizontal slits starting buttonholeOffset = 3 mm past CF toward the
  edge (Aldrich/Armstrong horizontal-hole rule), buttonholeLength = 21 mm (Ø + thickness
  + 2 mm ease). Womenswear laps RIGHT over LEFT: this front is the buttonhole side,
  the mirror is the button underlap (stated in the guide step).
- Placement: first button topFromNeck = 20 mm below the CF neck edge, last hemClearance
  = 20 mm above the CF bottom; ~90 mm target spacing (gaps = round(run/90), floor 3);
  the run is SHIFTED so a button lands exactly on the bust level (mandatory bust button
  = anti-gape, Aldrich/Armstrong). Bust level read from the piece's own apex NOTCH
  (princess + dart both stamp it) with a run-midpoint fallback (empire waist seam above
  the apex).
- Fabric: +0.1 m for the stand + fold-back facing.
- Too short (CF run < 60 mm) → honest "Front placket: skipped" guide note, never a
  silent no-op (same discipline as the keyhole skip).
- Covered by tests/placket_check (dress/top, princess/dart, petite/plus: base
  byte-identity except the front, stand extends past CF, fold line at CF, ≥3 buttons +
  matching buttonholes, valid). web-fuzz adds a placket axis (65 drafts, 0 issues).
- Honesty layer: web/js/missing.js no longer lists a FRONT buttons/placket closure
  (seen.closureDrawn set by create.js when spec.frontPlacket is on) — it is DRAWN now.
  Back/side button closures stay in the honesty layer.

## Fabric ties / sashes / bows (bağ / kuşak / fiyonk) — opt-in (BENCHMARK-58 Loop 4b)
- GarmentSpec.tieClosure (int TiePlacement enum, default 0=None → every existing draft
  byte-identical). Post-pass like the placket (TieBlock::apply on the finished pattern):
  it only ADDS a tie piece + a placement notch, never touches an existing outline, so
  BodiceBlock and the golden dumps are untouched with it off.
- Research: Aldrich (Metric Pattern Cutting) + Armstrong + couture/high-street practice.
  A tie is a SELF-FABRIC strip cut as a rectangle, folded lengthwise into a self-lined
  tube, sewn + turned + pressed, then caught in a seam at the placement notch and knotted
  into a bow. Couture (Dior/Chanel sashes) and high street (Stradivarius/Bershka babydolls)
  build it the same way — a plain rectangle; the difference is only fabric/finish.
- Master rectangle rule: a finished tie of width W and length L is cut
  (2·W + 2·SA) wide × (L + 2·SA) long, SA = 15 mm. The lengthwise centre fold self-lines
  it. The piece IS the cut rectangle (SA baked into the cut note, like the ruffle strip);
  markings = the centre fold line + the two long seam lines; grain runs the tie length.
- Placements + finished dims (mm):
  - BackWaist / BackWaistBow: W 30, L = max(300, waist·0.5 + 250) so each of the 2 halves
    reaches from the side seam round to a bow at centre back; notch on the Bodice/Top Back
    waist edge.
  - TieBack (open-back tie-back closure): W 25, L 300, 2 halves that cross + knot to close
    the back; notch on the back waist edge.
  - FrontNeckBow: W 25, L 350, a narrower bow at the front neckline/CF; notch near the
    front top edge.
  - CuffTies: W 15, L 180, ties at each sleeve opening.
- Fabric: +0.15 m for the self-fabric ties.
- Placement notch: a small cross tick stamped on the nearest outline vertex of the target
  body piece (body-frame independent — finds the closest real edge point whatever block drew
  the piece); harmless if the target piece is absent (honest guide note, never a silent
  no-op).
- SCOPE / honest boundary: only SIMPLE APPLIED ties are drawn. A DRAWSTRING that GATHERS
  the fabric through a casing (drawstring/gathered/shirred/smocked neckline or sleeve) is a
  DIFFERENT construction the engine cannot draft (needs a casing channel + shirring) → it
  stays in the honesty layer (missing.js), pickTiePlacement() returns 'none' for it.
- Covered by tests/tie_check (dress/top, back sash / tie-back / front bow, plus body:
  exactly one extra piece, existing outlines byte-identical, tie is a rectangle with a
  cut-2 note giving finished + cut size + grainline, placement notch added). render-pages
  adds jackie-back-waist-tie-dress + tie-back-dress specs (tie strip tiles onto the sheets).
- Honesty layer: web/js/missing.js no longer lists a DRAWN tie closure / tieBack
  (seen.tieDrawn set by create.js when spec.tieClosure ≠ none). Drawstring-gathered ties,
  open-back cutouts and every non-tie back detail stay honest.

## Cutting line (dikiş payı ÇİZİLİ) + precision pass (2026-07-13 night)
- PatternPiece.cutLine: the sewing outline offset OUTWARD by seamAllowance —
  cut on the outer solid line, sew on the inner fine line. Strip pieces
  (Ruffle*/Bias binding — allowances already in their cut note) and
  zero-allowance pieces (Keyhole Facing) stay single-line on purpose.
- geometry offsetOutline(): flatten (24 steps) → dedupe → outward side found
  EMPIRICALLY (probe the longest edge's normal with point-in-polygon; NEVER
  trust traversal direction — pieces are authored both ways, the area-sign
  heuristic shipped an inward offset) → per-EDGE offset joined by intersection
  (concave) / miter ≤2.5×sa / bevel (sharp gore & strap tips) → ENVELOPE
  GUARANTEE: 3 relax passes push any point measuring < sa (against non-fold
  outline edges) out to exactly sa — this is what tames concave curves whose
  radius < sa (sleeve underarm) → Douglas-Peucker 0.2 mm.
- "on fold" pieces: fold edge is NOT a seam — cut line clamped to x >= 0,
  fold-clamped points exempt from the envelope audit.
- Validator "cutline" (cheap, all 70200 drafts): present on real pieces, absent
  on strips, finite, FLATTENED bbox clears the sewing bbox on every free side
  (boundingBox() counts curve control points — balloon sleeves fake-fail with
  it), never crosses the fold. Deep sampled-distance audit: tests/cutline_check
  (min ≥ sa-1.5, max ≤ 2.5×sa across dress/halter/ruffle/keyhole cases).
- PRECISION TRUING found by tools/precision-report.js (the tailor's micrometer;
  run it after any bodice change):
  1. SHOULDER: back neck is wider than front, shared tip made the back shoulder
     seam 8-10 mm SHORT. Back tip now slides out along its own seam direction
     until front == back (halter exempt: no shoulder seam).
  2. SIDE SEAM: halves slant differently; on short empire bodices the pair
     mismatched ~2 mm. The shorter half's side-waist end drops (legBTrued move)
     until the pair matches — ONLY when extendBelowWaist == 0 (extended tops
     sew the extension curves, which already pair; moving their waist anchor
     skews them, the pear-body top caught it).
  After truing: precision report worst pair = 0.00 mm.
- GOLDEN RE-PINNED: engine/golden-reference.csv (committed) replaces the Swift
  dump as the reference — the truing deliberately diverges from the Swift port
  (compare: ./engine/build/golden_dump | python3 engine/golden-diff.py
  engine/golden-reference.csv /dev/stdin). The Swift diff served port fidelity
  and was PASS right up to this change.
- Web: outer/inner line in preview + print, legend + cover updated EN/TR;
  bounds()/packing include cutLine; old closet saves (no cutLine) render the
  single line as before.
