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
