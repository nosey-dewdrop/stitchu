# Stitchu Engine — Drafting Spec

Extracted from the validated Swift engine (App/Stitchu/Engine/, 2805-draft matrix green on 2026-07-07).
This file is the source of truth for the C++ port: the port implements THIS, not a line-by-line
translation of Swift. Every constant traces to knowledge/stitchu.db (drafting_formulas) —
FreeSewing (Bella/Titan/Brian), Muller & Sohn, Winifred Aldrich. Items marked ASSUMPTION are
documented approximations for measurements the app does not collect; the sewing guide's muslin
warning covers them.

## Assumption ledger (source-bound vs unvalidated)
Honesty pass 2026-07-17: every ASSUMPTION in this file is a value the app does not collect
from the user, so the engine fills it in. Each one is classified here as either SOURCE-BOUND
(a published pattern-cutting reference supports the value or its range) or UNVALIDATED (a design
assumption with no confirmed published number, validate with a muslin/toile). No reference is
invented; where a book value could not be confirmed the item stays UNVALIDATED rather than
citing a source that does not exist. These values are NOT changed by this pass, only labelled;
changing a constant is a separate engine decision.

K4 update (2026-07-19): these constants now live in ONE machine-readable table,
`engine/constants.yaml` → generated `engine/src/constants.gen.hpp` (gen-constants.mjs;
drift guarded by ctest contract_check). Each row carries {value, unit, source,
status: verified|assumed|refuted, experiment}. The 2026-07-19 paper-sloper comparison
(engine EU38 block vs an independent Aldrich hand draft, ctest sloper_check +
reports/2026-07-19-stitchu-k4-sabitler-sloper.md) set the statuses: shoulderSlopeDeg and
shoulderSeamTargetMM VERIFIED; bicepsBustRatio 0.30 and the legacy shoulderDropFactor
0.23 REFUTED (values unchanged in the closing chain — v1.1 candidates); the rest ASSUMED.
constants.yaml is the source of truth for status; the prose below is the history.

- shoulderDrop = shoulderHalf * 0.23 (~13 deg): UNVALIDATED design assumption. Aldrich's block
  uses a fixed shoulder-slope drop (~37 mm at the standard size) rather than a ratio of shoulder
  width; the ratio form here is not from a single published number. It stays in the wearable
  range for standard bodies; validate the shoulder line with a muslin. (The benchmark page marks
  this "single-source" for the same reason.)
- underbust = max(bust - 70, waist), B/C cup offset 70 mm: SOURCE-BOUND (range). A ~5 cm
  bust-to-underbust drop is the standard B/C-cup relationship in fitting references (Aldrich,
  Armstrong bust-dart / cup sizing); 70 mm sits in that band. It is off for very full or very
  shallow cups, which is exactly what the optional full-bust upperBust input and a muslin cover.
- waist split back 48% / front 52%: SOURCE-BOUND (convention). Splitting the waist so the front
  carries slightly more than the back is standard bodice practice (Aldrich, Armstrong front/back
  balance); 48/52 is a conventional split rather than an exact cited constant, so the precise
  ratio is a design choice inside the accepted convention.
- biceps = bust * 0.30 * (1 + 0.15): MIXED. The 15% biceps ease is SOURCE-BOUND (FreeSewing
  Brian / standard set-in sleeve ease); the 0.30 bust-to-biceps RATIO is an UNVALIDATED design
  assumption, used only because arm girth is not one of the seven measurements. Biceps girth
  varies independently of bust, so this can miss on non-average arms; validate the sleeve on a
  muslin. A future arm-girth input would replace the ratio.
- front placket stand = 18 mm blouse-button diameter: UNVALIDATED assumption (button size is not
  collected). Aldrich/Armstrong drive the stand off button diameter; 18 mm is a typical blouse
  button, documented; swap it and re-draft for a different button. See the placket section note.

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
- shoulderHalf = shoulder/2; shoulderDrop = shoulderHalf * 0.23  [ASSUMPTION ~13 deg, UNVALIDATED — see ledger]
- armholeY = backLength * 0.44 + shoulderDrop
- underbust = max(bust - 70, waist)  [ASSUMPTION B/C cup offset 70 mm, SOURCE-BOUND range — see ledger]
- neck widths: back = neck * 0.197, front = neck * 0.17; boat neckline multiplies both by 1.85;
  both capped at shoulderHalf * 0.72 (a neckline can never eat the shoulder seam)
  (2026-07-17 external-audit fix: boat was 1.35 → ~166 mm front, read like a wide
  round neck; a true bateau opens wide + shallow toward the shoulders. 1.85 → ~226 mm
  front, still under the shoulder-share clamp. Only /boat/ golden drafts changed.)
- back neck cutout = neck * 0.06; back neckline is always a shallow crew curve
- front neck depth by style: crew = neckW + 15, scoop = neckW + 50, v = neckW + 75,
  square = neckW + 40, boat = 28
- widths: back = underbust/4 * (1+chestEase); front = bust/4 * (1+chestEase)
- waist split: back 48%, front 52% of full waist  [ASSUMPTION, SOURCE-BOUND convention — see ledger]
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
- armhole curve: ONE cubic from shoulderTip to (chestWidth, armholeY), the
  concave scye. TANGENT-CONTINUOUS with the shoulder seam: cp1 leaves the tip
  PURELY along the shoulder-seam direction (neckPoint->shoulderTip unit vector)
  by armholeShoulderTangentShare (0.26) of the shoulder->underarm chord — so the
  seam and the scye share a tangent and there is NO angular V-kink at the
  shoulder point (the old cp1 dived straight down, a ~77 deg spike the external
  render-audit flagged). The scye HOLLOW is carried entirely by cp2:
  cp1 = shoulderTip + tangentUnit * chord*0.26,
  cp2 = (chest - dx*0.06 - hollow, drop + dy*0.78),
  hollow = (front 0.34 | back 0.24) * dx  (front scooped deeper than back).
  Measurements (armholeY depth, chestWidth, underarm point) are UNCHANGED — only
  the drawn smoothness. The sleeve cap resizes to the (slightly changed) armhole
  arc length via the one-truth armholeLength, so it still seats 1:1.
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
- biceps = bust * 0.30 * (1 + 0.15)  [ASSUMPTION: 0.30 ratio UNVALIDATED, 15% ease SOURCE-BOUND — see ledger]
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

## Gathered/puff sleeve cap (Loop 6, opt-in — plain default byte-identical)
The classic slash-and-spread adds fullness across the CROWN only; the length below
the notches stays matched 1:1 to the armhole, so the sleeve still sets into the SAME
armhole and the surplus is GATHERED in (not eased). Two levels (SleeveCap enum):
- **Gathered** (soft / high-street, Zara/Bershka): spread = 0.20·W, cap NOT raised.
- **Puffed** (full / couture gigot, Dior/YSL): spread = 0.45·W, cap RAISED by the spread.
Formula, given the fitted base cap width W and height H (from the set-in solver above):
- `spread = capSpreadFrac · W`  (0.20 gathered, 0.45 puffed, 0 plain)
- `capWidth = W + spread`  → the widened crown chord (also the finished biceps line)
- `capRise = (puffed ? spread : 0)`; `capHeight = H + capRise`
- VERIFIED invariant (dresspatternmaking.com; M.Müller & Sohn gigot): **the cap-height
  raise equals the spread** for a puff. A plain gathered head keeps the height (depth of
  scye unchanged → less pouf). Müller gigot corroborates: slash 3–4 cm each side of the
  shoulder point, raise the cap 4–5 cm.
- Crown gather runs BETWEEN the two crown notches across the top; notches at ±capHalf·0.60
  (~7.5–9 cm from the underarm on a real cap), a dashed gather line dips toward the raised
  top. Below the notches the seam is unchanged and matches the armhole 1:1.
- Gather ratio (finished crown arc / armhole) lands ~1.25 soft → ~1.75–2.5 full; the arc
  grows nonlinearly in the spread, so the validator accepts a WIDE band per style
  (spreadFrac·0.5 .. spreadFrac·2.5+0.20) instead of the plain 1–9% ease window.
- The biceps floor still holds (widened crown ≥ base width ≥ biceps). Hem width stays on
  the base W so the sleeve still clears the arm. Balloon (hem gather) is a separate style;
  its head stays plain. Honest boundary: a "cap sleeve" (short-cap SHAPE) and a
  drawstring-gathered sleeve (needs a casing) are NOT this and stay in the honesty layer.

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
  finished edge). No button size is collected → 18 mm blouse button ASSUMPTION
  (UNVALIDATED, see ledger), documented; the guide's muslin note + placket step cover swapping it.
- Geometry (front piece, CF at x = 0): EVERY outline vertex on the CF edge (|x| <
  1 mm) is offset outward by standWidth = 18 mm (= button Ø) so the finished front
  edge lands at x = -18, EXCEPT the true neck point cmds[0]; a short horizontal
  LINE joins the grown stand top back to the neck point. This geometry-driven rule
  handles BOTH front topologies (bodice/dress returns to CF on a curve; extended
  top returns on a straight line). The neckline itself and every other edge are
  UNTOUCHED → the neck facing still matches (its validator would fire otherwise).
- CUT vs FOLD (2026-07-17 external-audit fix): a placket OPENS at CF, so the front
  cannot be cut on the fold — the two are mutually exclusive. PlacketBlock flips
  the front AND its Front Neck Facing from "cut 1 on fold" to "cut 2 (center front
  opening)". The old code left "cut 1 on fold" in place AND only offset "the final
  curve, i+2 >= size" — so the extended-top CF (a line) grew no stand yet still got
  buttonholes past CF (sewing line spilled outside the cut line; piece unwearable).
  Both are fixed; placket_check's petite crop TOP now grows the stand it silently
  missed before. Note: this changed topSideSeamLength in validator.cpp to skip the
  extra CENTER jog line the placket inserts (it read the side seam by fixed index).
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

## Collar family (yaka) — opt-in (BENCHMARK-58 Loop 7/8: stand + flat/peter-pan/shirt)
- GarmentSpec.collarType (int CollarType enum: 0=None 1=Stand 2=Mock 3=Flat 4=PeterPan
  5=Shirt, default 0 → every existing draft byte-identical) + collarEdge (int CollarEdge:
  0=Round 1=Pointed 2=Scallop, flat-family outer edge only). Post-pass like the tie/placket
  (CollarBlock::apply on the finished pattern): it only ADDS the collar piece(s) + a
  neckline placement notch, never touches an existing outline, so BodiceBlock and the golden
  dumps are untouched with it off. Runs only for Dress/Top.
- Research: Aldrich (Metric Pattern Cutting) + Joseph-Armstrong (Patternmaking for Fashion
  Design) + Müller & Sohn + couture (Dior/Chanel tailored collar, YSL) + high street
  (Zara/Bershka peter-pan, shirt collars). Two structural families:
  - STAND / MOCK — a band standing up at the neckline. Band height: Stand 35 mm, Mock 30 mm
    (mandarin). The bottom (attach) edge is drafted STRAIGHT to the exact neckline length,
    and the CF top edge is pulled in by cfRise = 15 mm so the finished band hugs the neck
    (Aldrich/M&S: raise/tilt the front to close the band round the throat). Cut 2 on the CB
    fold (self + interfacing).
  - FLAT family (Flat / PeterPan / Shirt) — a collar piece lying on the shoulders. Finished
    width 60 mm (peter-pan). The NECK (attach) edge is drafted STRAIGHT to the neckline
    length; the free OUTER edge is shaped Round (peter-pan curve), Pointed (shirt-style
    corner) or Scallop (a run of 4 arcs). Cut 2 + interfacing (upper + under). A SHIRT collar
    is a two-piece convertible: a stand band (28 mm) + a turnover blade (48 mm = stand + 20,
    so the blade covers the stand seam), the blade drawn pointed.
- THE GOVERNING CONSTRAINT (trued, MEASURED — not asserted): the collar's neck-edge
  sewing-line length == the garment neckline length (back neck arc + front neck arc, both
  sides). We measure the neckline straight off the FINISHED front + back centre pieces —
  the neckline is commands[0]..the min-y (neck-point) vertex of each piece, exactly the
  outline the bodice drew — so the collar can NEVER drift from the neckline it sews to. Each
  on-fold collar half covers neckFull/2. collar_check re-measures neckEdge − half to 0.0000
  mm across stand/mock/flat/peter-pan/shirt on standard/petite/plus bodies.
- SCOPE / honest boundary: a BIAS-BOUND neckline (a bound raw edge, no collar piece) and a
  notched / sailor / lapel tailored collar are NOT drafted → they stay in the honesty layer
  (missing.js); pickCollar() returns null for them. The engine draws the stand/mock/flat/
  peter-pan/shirt family only.
- Fabric: +0.15 m for the collar + interfacing.
- Vision→spec: create.js pickCollar(seen) maps the vision collar type + oov terms (peter pan,
  mock/mandarin, stand, shirt, scallop, rounded, pointed, flat) to collarType/collarEdge;
  bias-bound/notched/sailor/lapel → null (honest). A manual collar picker (+ edge picker for
  flat/peter-pan) covers the no-photo path. seen.collarDrawn suppresses the missing.js note
  when a drawable collar was chosen.
- Covered by tests/collar_check (stand/mock/flat/peter-pan/shirt on standard/petite/plus:
  exactly N extra pieces, existing outlines byte-identical, neck edge trued to half-neckline
  0.0000 mm, placement notch, flat sits wider off the neck than the stand band, scallop adds
  curve segments). render-pages adds stand-collar-dress + peterpan-collar-top + shirt-collar-top.

## Drawstring / shirred / smocked gathering (büzgü / kanal / shirring) — opt-in (BENCHMARK-58 Loop 8 / queue 9a)
- GarmentSpec.gatherType (int GatherType enum: 0=None 1=Drawstring 2=Shirred 3=Smocked,
  default 0=None → every existing draft byte-identical) + gatherZone (0=Neckline 1=Bust
  2=Waist 3=Sleeve). Post-pass like the tie/collar (GatherBlock::apply on the finished
  pattern): it ADDS a gathered PANEL piece (+ a drawstring cord piece when Drawstring) + a
  placement notch, and NEVER touches an existing outline, so the golden dumps are untouched
  with it off.
- Difference from a ruffle (a separate frill strip) and a tie (a plain applied strip,
  Loop 4b): here the PANEL ITSELF gathers — the neckline edge / the bust panel / a yoke is
  cut WIDE and drawn up to fit. Loop 4b left drawstring-that-gathers honest; this draws it.
- Research: Aldrich (Metric Pattern Cutting) + Armstrong + M.Müller & Sohn + ASG smocking
  guide. High-street (Zara/Bershka babydoll/milkmaid) = elastic shirring + folded self-
  casing; couture (Dior/Chanel) = true hand-smocking (honeycomb/lattice embroidery — a
  surface stitch geometry, OUT OF SCOPE, honest note only).
- GATHER RATIO r (flat cut gathered edge = finished edge × r), by construction:
  - Drawstring (casing + cord; babydoll neckline) ... r = 1.8
  - Shirred (parallel elastic rows; bodice/back panel) r = 2.0   [ASG "2in→1in"]
  - Smocked (couture, simplified to a shirred grid) .. r = 3.0   [ASG "3in→1in"]
  (Ruffle strips stay 2.0–3.0, unchanged.)
- Panel = a rectangle cutW × cutH, cutW = segFlatW + 2·SA, cutH = panelDepth + 2·SA,
  SA = 15 mm. panelDepth by zone: neck 130, bust 110, waist 90, sleeve 120 mm. The GATHERED
  edge is the top; grain runs vertically. The cut note states flat edge → finished edge so
  the sewer knows how much to draw up. SEGMENTATION: a very wide flat edge is cut in N =
  ceil(flatEdge / 1400 mm) segments no wider than one 140 cm fabric width and joined at the
  sides (standard practice, like a pieced ruffle); the DRAWN tile is one segment (segFlatW =
  flatEdge/N) so it packs on A4, and the cut note gives N + the full flat edge. On the
  benchmark bodies N=1, so gather_check's flat-edge truing is unaffected.
- Drawstring: casing = a channel folded down casingDepth = 22 mm below the top seam line
  (two parallel stitch lines) + two eyelet ticks at centre where the cord exits; the cord is
  a separate self-fabric tube (same rectangle-fold construction as a tie), finished 12 ×
  (finishedEdge + 500) mm for the pull-through/tie margin.
- Shirred/smocked: N parallel gather rows shirRowGap = 12 mm apart from the seam line down
  (shirred 4 rows, smocked 6 rows); smocked adds a dot grid between the top rows to gauge
  the pleats (worked by hand — noted, not silently claimed).
- Finished edge is MEASURED off the drafted body pieces for the zone (neckline = 2·front-
  half + 2·back-half via the same neck-point scan the collar uses; bust/waist = the front +
  back widths in that y-band, ×2 each; sleeve = the bicep band) — so the gathered edge can
  never drift from what it sews to. If the edge is < 60 mm the block skips with an honest
  guide note (never a silent no-op). Fabric: +0.2 m (a gathered panel eats fabric).
- TRUING invariant (MEASURED on the drawn panel, ctest tests/gather_check to 0.005 mm):
  panelFlatEdge / r == finishedEdge. Covered: dress+drawstring neckline (panel + cord = 2
  pieces), top+shirred bust (1 piece), dress+smocked yoke (3:1), dress+shirred waist; ratio
  ordering smocked > shirred > drawstring at the same zone; drawstring adds a cord, shirred
  does not; existing outlines byte-identical; base draft valid; placement notch on a body
  piece.
- SCOPE / honest boundary: neckline / bust / yoke / back / waist PANEL gathering is drawn.
  A drawstring GATHERED SLEEVE (a casing round the arm) and gathered STRAPS are a different
  piece and stay honest (missing.js); a fully hand-smocked couture panel (shaped honeycomb)
  is approximated (panel × 3 + gauge dots) with the smocking noted, not silently wrong.
- Vision→spec (create.js pickGather): reads the vision yoke (shirring/smocking), a
  drawstring/gathered neckline or bust from closure/oov → { gatherType, gatherZone }; a
  gathered SLEEVE stays honest. A manual gathering + zone picker covers the no-photo path.
  seen.gatherDrawn suppresses the missing.js note when a drawable gathering was chosen.

## Open-back cutout (açık sırt oyuğu) — opt-in (BENCHMARK-58 Loop 9b)
- WHAT: a shaped opening in the BACK center piece, below the nape, finished with a
  facing — the back-panel analogue of the front keyhole. Four shapes (couture back
  décolletage — Dior/YSL backless; high-street backless — Zara/Bershka):
  `BackOpening { None, RoundCutout, LowV, Square, Keyhole }`. Opt-in
  (GarmentSpec.backOpening); None → golden BYTE-IDENTICAL. openback.hpp/.cpp,
  post-pass in garment.cpp after the gather block. Off/on both stay byte-identical.
- ANATOMY (research — Aldrich/Armstrong + couture/high-street backless): the opening
  NEVER starts at the neck edge — a yoke of fabric at the shoulders hangs the
  garment. Top of the opening = `gapBelowNape = 40 mm` below the CB nape; it must
  clear the waist seam (`waistClearance = 55 mm`). Length = the back span between
  those, clamped to `[55, 320] mm` (55 = shorter reads as a keyhole/slit; 320 = a
  deep backless span). Half-width / length by shape: round 0.42, low-V 0.34,
  square 0.36, keyhole 0.24. The opening is drawn as the HALF against the CB fold
  (x=0..+halfW); the back is cut 2 with a CB SEAM (the mirror axis), so the half
  unfolds into the full symmetric cutout — same on-fold convention as the keyhole.
- SHAPES: round = a wide oval bulging out to halfW at mid-height, rounding back to
  the CB; low-V = narrow at the nape, straight edges widening to a low point;
  square = a rectangular scoop with a softened bottom corner; keyhole = a teardrop
  (slit-narrow top, round bottom), the front keyhole mirrored onto the back.
- FACING + TRUING: a solid facing piece (cut 1 on fold, interface) = the opening
  silhouette pushed OUT by `facingMargin = 34 mm` on every side, so it covers the
  opening + margin. The facing carries the SAME opening stitch line as a MARKING;
  that marked line is BYTE-IDENTICAL to the opening drawn on the back → truing
  0.00 mm (backopen_check), the facing can never drift from the hole it finishes.
  seamAllowance = 0 (sewn ON the marked line, then slashed + turned). Construction
  steps inserted right after the neckline facing understitch (same slot as the
  keyhole): fuse → pin RST on the marked line → slash inside → turn + understitch.
- COEXISTS WITH A TIE-BACK (Loop 4b): a Tie Back Mini Dress has BOTH — the tie
  (TieBlock) draws the closure strips, this draws the round opening it fastens over.
  Independent enums, independent post-passes; both pieces appear on the same draft.
- HONEST LIMIT: a back with side-seam POCKETS or another undrawn feature clustered
  with the cutout still lists that feature (missing.js) — only the open-back itself
  is suppressed (seen.backOpeningDrawn). A laced back / back button placket stay honest.
- Vision→spec (create.js pickBackOpening): reads seen.backDetail (openBack) + oov
  terms (open-back / back cutout / backless / low open back) → a shape; keyhole/
  square/low-V descriptors pick the silhouette, else round (the set's common case).
  A manual "open back" shape picker covers the no-photo path.

## Corset lace-up back (korse bağcıklı sırt) — opt-in
- WHAT: an eyelet-laced CENTER-BACK closure. Unlike the invisible CB zip (which
  joins the two back halves) or the open-back cutout (a faced hole below the nape),
  a lace-up back leaves the two back edges APART — a CB gap spanned by a cord that
  criss-crosses between two columns of eyelets, one down each back edge. The garment
  is therefore ADJUSTABLE (the lacing spans a range of body girths).
  `LaceUpBack { None, Corset }`. Opt-in (GarmentSpec.laceUpBack); None → golden
  BYTE-IDENTICAL. laceupback.hpp/.cpp, post-pass in garment.cpp right after the
  open-back block (both are back-center operations).
- HOST: a fitted (princess or dart) bodice back on a dress/top (the piece
  backCenter() finds: Bodice/Top Center Back / Back). A skirt or a loose/gathered
  back is an honest NO-OP with a guide note (never a silent skip) — the garment gate
  only calls the block for dress/top, and the block itself refuses if it finds no
  fitted back piece.
- EYELET CONVENTION (source: standard corsetry practice — Waugh, "Corsets and
  Crinolines"; modern corset makers' ~1" eyelet pitch): eyelet pitch
  `eyeletPitchMM = 28` (≈1"), first eyelet `firstEyeletFromTopMM = 15` below the CB
  top edge, last kept `eyeletBottomMarginMM = 20` off the bottom. The column height
  = the back's own CB-edge span (measured off the drawn outline: min-x edge, top y to
  bottom y — can't drift). Count = floor(height / pitch) + 1, then RE-SPACED evenly
  to fill the column exactly (spacing = height / (count-1)) so the top + bottom
  eyelets anchor the run. Refused honestly if fewer than `minEyelets = 5` fit.
- TRUING (eyelet-column y-alignment, <0.5 mm): the eyelet y series is built once and
  the garment is cut 2, so the second physical back edge mirrors THIS piece and its
  eyelet column lands at the SAME heights → the lacing sits level by construction.
  The drawn series is even to 0.0000 mm (laceupback_check verifies max spacing
  deviation < 0.5 mm, i.e. the two columns align to < 0.5 mm).
- FACING: a straight foldless CB facing/placket strip `facingWidthMM = 40` in from
  the CB edge is drawn as a MARKING on the back (self-faced, interfaced — NOT cut on
  fold), carrying the eyelet column at `eyeletInsetMM = 20` from the CB edge. This
  stiff band carries the grommets and keeps the laced edge from stretching.
- LACING CORD: a separate strip piece (like the tie block's cord), cut 1, self-lined
  tube. Finished lace length = `round(columnHeight × laceLengthFactor)`,
  `laceLengthFactor = 3.5` (corset convention — long enough to criss-cross the whole
  run and tie off), trued to the drawn column height (can't drift).
- DONNING: the open laced gap IS the donning opening (the body enters through the
  unlaced back, then the cord is laced up) — LaceUpBackBlock::opensForDonning is the
  single source of truth shared by garment.cpp (suppresses the redundant invisible CB
  zipper) and wearability.cpp (hasDonningOpening). A laced-back dress carries NO CB
  zipper.
- COMPOSES: with a cup seam (a laced-back bustier) — independent enums, independent
  post-passes; both the Upper/Lower cup pieces AND the lacing cord appear on the same
  draft (laceupback_check). Distinct from a tie-back (fabric ties, TieBlock) and an
  open-back cutout (a faced hole, OpenBackBlock).
- Vision→spec (create.js pickLaceUpBack): reads seen.backDetail === 'lacedBack',
  seen.closure.type === 'lace-up', or oov/details terms (corset / lace-up / laced /
  eyelet / grommet + back/bodice/lacing) → corset. Gated to a non-skirt host. A
  manual "lace-up back" picker covers the no-photo path. missing.js suppresses the
  "laced back → single tie / closed back" honest note when laceUpBackDrawn (both the
  closure-side 'lace-up' note and the backDetail 'lacedBack' note).

## Back hem slit / walking vent (arka etek yırtmacı) — opt-in (BENCHMARK-58 Loop M1)
- WHAT: a walking slit (vent) rising from the hem up the CENTER-BACK seam of a
  fitted/straight skirt or dress back, so the wearer can walk. `HemSlit { None,
  Vent, Slit }`. Opt-in (GarmentSpec.backSlit); None → golden BYTE-IDENTICAL.
  slit.hpp/.cpp, post-pass in garment.cpp after the open-back block. Off/on both
  stay byte-identical.
- WHY IT NEEDS A CB SEAM: a slit is an opening in a SEAM. In this engine the back
  is cut on the fold (one CB fold). A slit converts that back to `cut 2` with a
  CENTER-BACK SEAM: the seam is stitched from the waist down to the slit TOP
  POINT, and left open below it. So SlitBlock's first job is to change the back's
  cut note (on fold → cut 2 CB seam) and draw the seam/opening markings; the
  outline geometry (waist, hip, hem) is unchanged → the fold-side outline is
  byte-identical, only the cut note + markings differ. (A gathered/flared skirt
  already has walking room and no CB seam to host a vent — SlitBlock skips it
  honestly rather than forcing a seam into a fold panel.)
- ANATOMY (research — Aldrich/Armstrong + fabrics-store/Professor Pincushion vent
  tutorials): the slit rises from the hem `height` up the CB seam, clamped to
  `[100, 350] mm` (≈4–14 in; the rule of thumb is "hem to just above the knee",
  and it must clear the seat — kept `seatClearance = 60 mm` below the hip line so
  it never opens over the seat). Two finishes:
  - VENT: a folded-back EXTENSION (underlap/overlap) `ventExtension = 40 mm` wide
    (≈1.5 in) grown onto the CB below the top point, with a 45° angled top corner
    (the classic tailored vent that laps closed). The extension is drawn OUTSIDE
    the CB line (x = 0 → −extension on the fold-mirror, i.e. added width on the
    seam side) and folds back on the CB, so the two backs lap and the vent stays
    closed when standing.
  - SLIT: a plain faced opening, no extension — the CB seam simply stops at the
    top point and both edges are turned under (a straight hem slit, common on
    dresses / high-street). Drawn as a facing-free marking; the hem allowance
    turns up the open edges.
- TOP POINT + BAR TACK: the seam/opening boundary at `y = hemY − height` is marked
  with a horizontal top bar (a bar-tack line) so the sewer knows exactly where the
  seam stops and the opening begins — the single most-missed vent detail. A "cut 2
  / CB seam, leave open below the mark" note carries the change.
- TRUING: the vent extension's fold line is drawn ON the CB (x = 0); the extension
  edge is the CB offset OUT by `ventExtension`, so the extension width is exactly
  `ventExtension` at every y (slit_check measures fold-to-edge = 40.00 mm). The
  top-point y is `hemY − height` measured off the piece's own hem (deepest CB
  outline point), so the bar tack, the seam stop, and the extension top corner
  all share one measured y and cannot drift.
- COEXISTS: a back tie (Loop 4b) and an open-back cutout (Loop 9b) sit ABOVE on the
  bodice; the hem slit sits at the skirt hem — independent, both draw on the same
  dress. The slit only touches the back skirt/dress piece.
- HONEST LIMIT: only a straight/fitted back with a CB seam candidate (straight or
  A-line skirt, princess Center Back panel, or a plain Back panel) gets a vent; a
  gathered/pleated/half-circle skirt has walking ease already and is skipped with
  an honest guide note (never a silent no-op). A front slit / side slit stay honest
  (missing.js) — only the CB walking vent is drawn.
- Vision→spec (create.js pickHemSlit): reads seen.oov terms (back hem slit / back
  vent / walking slit / kick pleat-ish "slit") → Vent when "vent/kick" wording,
  else Slit (the set's common "back hem slit"). A manual "back slit / vent" picker
  covers the no-photo path; seen.hemSlitDrawn suppresses the missing.js note.

## Ruffled straps (fırfırlı askı) — opt-in (BENCHMARK-58 queue #3)
- WHAT: a gathered self-fabric frilled shoulder strap, drawn as a SEPARATE cut
  piece (a pair) plus a placement notch at each shoulder point on the front and
  back. `StrapStyle { None, Ruffled }`. Opt-in (GarmentSpec.ruffledStraps); None →
  golden BYTE-IDENTICAL. strap.hpp/.cpp, post-pass in garment.cpp after the hem
  slit block. It only ADDS a piece + notches, never touches an existing outline, so
  off/on both stay byte-identical.
- RESEARCH (Aldrich Metric Pattern Cutting + Armstrong + high-street babydoll/
  camisole practice): a ruffled strap is a straight self-fabric strip cut LONGER
  than the finished strap span, then gathered down along its length so it ruffles,
  and attached at the front and back top edges. Couture (Dior/Chanel camisole
  straps) and high street (Stradivarius/Bershka babydolls) build it the same way —
  a plain rectangle gathered to length; the difference is only fabric/finish.
- MASTER RECTANGLE RULE: a finished strap of width W = 22 mm and over-shoulder span
  L, gathered at fullness F = 2.2, is cut `(2·W + 2·SA)` wide × `(round(L·F) + 2·SA)`
  long, SA = 15 mm. The lengthwise centre fold self-lines it (a tube like the tie);
  the extra length (L·F − L) becomes the ruffle when gathered back down to L.
  Markings = the centre fold line + the two long seam lines + a gather line just
  inside one long edge (where the two rows of gathering pull the strip to L); grain
  runs the strap length. cut note = "cut 2 ... gathered down to a L mm strap".
- SPAN (finished, mm): the over-shoulder run, `defaultSpan = 130` nudged a little by
  the front/back shoulder-point x (wider shoulder → slightly longer strap), clamped
  to `[minSpan 90, maxSpan 220]`, then ROUNDED to a whole mm so the cut note and the
  trued cut length are derived from the same value.
- TRUING: the cut length carries the fullness — `cutL − 2·SA == round(span · fullness)`
  exactly (strap_check measures it to 0.00 mm), and the cut width is exactly
  `2·finishedWidth + 2·SA` (a self-lined tube). The span is read from the drafted
  front/back shoulder points, so the strap tracks the real body, not a scalar.
- PLACEMENT NOTCH: a small cross tick is stamped at each shoulder point (the top-of-
  piece vertex furthest from the centre fold) on the front AND back — stamped BEFORE
  the strap piece is pushed (push_back can reallocate pattern.pieces and invalidate
  the piece pointers). Harmless-by-refusal if no front/back top edge exists.
- COEXISTS: the strap sits on the bodice; a hem slit (Loop M1) sits on the back
  skirt and an open-back cutout (Loop 9b) on the back bodice — all independent
  opt-in post-passes, all draw on the same sleeveless dress.
- HONEST LIMIT: only the RUFFLED (gathered-strip) strap is drawn. A plain shoulder /
  wide strap is already the engine's plain sleeveless edge; a spaghetti / one-
  shoulder / off-shoulder / halter strap is a DIFFERENT construction that stays in
  the honesty layer (missing.js). A sleeved or halter garment carries no separate
  shoulder strap → StrapBlock skips it with an honest guide note (never a silent
  no-op).
- Vision→spec (create.js pickRuffledStraps): reads seen.straps.type === 'ruffled'
  and seen.oov terms ("ruffled/frilled/flutter/gathered shoulder strap", not
  spaghetti/halter/one-/off-shoulder) → 'ruffled', gated on a sleeveless non-halter
  garment. A manual "ruffled straps" picker covers the no-photo path;
  seen.ruffledStrapsDrawn suppresses the missing.js note + the outOfVocab strap term.

## Peplum (bele takılan volan) — opt-in (BENCHMARK-58 RAY 1 / R1.1)
- WHAT: a flared peplum flounce hung from the waist, drawn as a SEPARATE cut
  piece (a flat circular / part-circular annular sector), inner arc trued to the
  finished waist. `PeplumStyle { None, Full, Half, Pointed }`. Opt-in
  (GarmentSpec.peplum); None → golden BYTE-IDENTICAL. peplum.hpp/.cpp, post-pass
  in garment.cpp after the ruffled-straps block. It only ADDS a piece, never
  touches an existing outline, so off/on both stay byte-identical.
- RESEARCH (Aldrich Metric Pattern Cutting "circular flare" + Armstrong
  "circular peplum" + high-street practice): a peplum is a circle-skirt segment
  scaled to the waist. It is NOT gathered — it is cut so its INNER arc equals the
  finished waist and its OUTER arc is longer, and the difference falls into ripples
  below the waist seam. A full circle spreads the waist through the maximum flare;
  a half circle spreads the same waist over a softer flare; a pointed (handkerchief)
  hem is the full-circle cut worn to points on the true bias.
- MASTER SECTOR RULE: finished waist W (the wearer's measured waist, passed in like
  the tie sash) and depth D = 180 mm. Each drawn piece is an annular sector swept
  through π radians, carrying HALF the waist (share = W/2). Inner radius
  `r0 = share / π` so the inner arc = `r0 · π = share`; outer radius `r0 + D`,
  outer arc `(r0 + D) · π`. Full/Pointed = one piece cut twice (two halves seam at
  the sides into a full circle); Half = two on-fold pieces (front + back). SA = 15 mm.
  The pointed variant keeps the same inner arc + swept angle; only the hem line
  dips to a corner on the downward axis instead of a smooth arc.
- TRUING: the inner (waist) arc of the drawn outline equals the finished waist to
  0.00 mm (peplum_check flattens the outline arc and measures it; the arc is built
  from `r0 = share / π`, so the waist edge can never drift). The finished waist is
  clamped to `[minWaist 500, maxWaist 1400]` mm.
- COEXISTS: the peplum sits at the waist; a front placket (Loop 3) and ruffled
  straps (queue #3) sit on the bodice — all independent opt-in post-passes, all
  draw on one waisted top.
- HONEST LIMIT: only the FULL-circle, HALF-circle and POINTED (handkerchief)
  circular flare is drawn. A PLEATED / GATHERED / DRAPED / TIERED peplum is a
  DIFFERENT construction that stays in the honesty layer (missing.js). A garment
  with no waisted bodice/top (a skirt) carries no peplum → PeplumBlock skips it with
  an honest guide note (never a silent no-op).
- Vision→spec (create.js pickPeplum): reads seen.oov terms ("peplum", "waist
  flounce/frill", not pleated/gathered/draped/tiered/box-pleat) → full / half /
  pointed (pointed on "pointed/handkerchief/dip/asymmetric"), gated off a skirt. A
  manual "peplum" picker covers the no-photo path; seen.peplumDrawn suppresses the
  missing.js note + the outOfVocab peplum term.

## Asymmetric button placket (asimetrik düğme patı) — opt-in (BENCHMARK-58 RAY 1 / R1.2)
- WHAT: the front button placket carried OFF the center front so the closure sits
  to one side (the couture / sixties shift-dress front). `PlacketStyle { None,
  Standard, Asymmetric }` (measurements.hpp) + `GarmentSpec.placketStyle`. Standard
  and None mirror the legacy `frontPlacket` bool (byte-identical); Asymmetric is the
  new mode. `PlacketBlock::apply(pattern, bustApexY, offsetMM)` — offsetMM == 0 is
  the classic symmetric CF placket, every expression collapses to the old value, so
  that path is BYTE-IDENTICAL to before. asymOffset = 55 mm.
- CONSTRUCTION: the whole closure shifts out by offsetMM. The fold line sits at
  `foldX = -offsetMM` (0 when symmetric); the grown front edge reaches
  `-(standWidth + offsetMM)` so the button stand still sits proud of the shifted
  fold; the fold-back facing marking is at `foldX + standWidth`; the buttons are
  centered on `foldX` and the buttonholes start `foldX - buttonholeOffset`. When
  asymmetric, the TRUE center front (x = 0) is ALSO marked as a reference line so
  the sewer sees how far over the closure sits. The mirror (under) front is cut to
  the same offset so the two fronts overlap (noted in the guide step).
- COEXISTS: independent of every other opt-in post-pass; draws on a dress/top.
- HONEST LIMIT: only a symmetric-or-offset FRONT button stand is drawn. A back
  asymmetric closure, a double-breasted front, or a wrap closure stays honest
  (benchmark rule + missing.js). No front bodice (a skirt) → skips with a note.
- Vision→spec (create.js pickPlacket): reads an "asymmetric / offset / diagonal /
  off-center" + "button/placket/closure/front" oov/detail → 'asymmetric'; a plain
  front button closure → 'standard'. `spec.placketStyle` drives it; the legacy bool
  stays in sync for symmetric. seen.closureDrawn (symmetric or asymmetric) and
  seen.placketAsymDrawn suppress the missing.js closure note + the outOfVocab
  asymmetric-placket term.

## Cap sleeve (kısa kanat cap) — opt-in (BENCHMARK-58 RAY 1 / R1.2)
- WHAT: a short cap-sleeve WING that covers the top of the shoulder and dies at the
  underarm with NO underarm seam and no length. `SleeveCap::Cap` (the 4th value of
  the existing SleeveCap enum, 0=Plain 1=Gathered 2=Puffed 3=Cap). Plain default →
  byte-identical; the Cap branch returns its own piece and skips the full-sleeve body.
- CONSTRUCTION: the cap sleeve keeps the ORDINARY set-in cap. The width/cap-height
  fitting runs exactly like a plain sleeve (spread 0, no rise), so the cap edge
  length matches the armhole 1:1 and it sets in like any sleeve (cap_sleeve_check
  proves the cap edge == the plain sleeve's cap edge to < 0.5 mm). Instead of the
  underarm-seamed body running down to a hem, the OUTER edge is a shallow arc a
  short depth (capWingDepth = 55 mm) below the crown, sweeping from one underarm
  point to the other — a little wing. Two crown notches, a center grainline, cut 2,
  SA 15 mm. The guide step tells the sewer to finish the outer edge and set the cap
  into the armhole (no seam to sew shut).
- COEXISTS: it is a sleeve HEAD variant, so it composes with an asymmetric placket
  (the Jackie combo) and any bodice post-pass.
- HONEST LIMIT: only the plain button-stand cap wing is drawn. A dropped/off-shoulder
  sleeve is a different shape and stays honest (benchmark rule + missing.js).
- Vision→spec (create.js): `seen.sleeveHead === 'capped'` → sleeveCap = 'cap' (a
  straight sleeve is assumed if none was read, to carry the head). seen.capSleeveDrawn
  suppresses the missing.js "cap sleeve" derivative + the outOfVocab cap-sleeve term.
## Bias binding edge finish (biye) — DEFAULT (patch 3.10, 2026-07-17)
- Damla's call (17 Jul, approved): the neckline + armhole finish DEFAULTS to bias
  binding (biye) on every dress, not a facing. A separate collar piece / facing is
  the EXCEPTION, kept only where a real collar sits on the fabric (shirt/stand/
  mock/flat/peter-pan). `EdgeFinish { BiasBinding (default), Facing }` on the spec.
- WHY bias on curves (Aldrich/Armstrong): a bias strip is cut at 45° to the grain,
  so it has the give to wrap a curved raw edge (neckline, armhole) flat and thin,
  cleaner than a facing which is a bulky shaped panel that must be understitched and
  can roll out. The couture default finish for a bound edge.
- STRIP CUT: `biasBinding(edgeMM, label)`. length = finished edge circumference +
  `bindingOverlap` (20 mm join/overlap); width = `bindingCutWidth` (25 mm =
  4·`bindingFinishedWidth`(6 mm)+1, so it folds double and wraps a 6 mm finished
  edge). Segmented ≤1400 mm for the printable chalk note. Center fold marking +
  grainline drawn on the strip; the cut note says ON THE BIAS (45°) — the strip is
  DRAWN flat (rectangle) but CUT on the bias, exactly like the halter binding.
- TRUING (one truth, one place): the strip length is measured off the DRAWN edge, not
  a scalar. `neckEdgeLength(m, neckline)` flattens the SAME `neckCommands` the bodice
  and the facing draw (front half + back half, ×2 for the mirrored on-fold halves),
  so the neck strip can never drift from the neckline it binds (bias_check: strip
  length == neckEdgeLength + overlap, 0.00 mm, across every neckline). The armhole
  strip length = 2·`bodice.armholeLength` (both armholes, front+back half each),
  added only when the garment is sleeveless.
- REAL-COLLAR EXCEPTION: `collarType != None` forces the FACING back (the collar
  attaches to a faced neck exactly as before → collar path byte-identical). So: an
  open (collarless) neck → bias; a real collar → collar piece on a faced neck. An
  armhole: sleeveless → bias; sleeved → the sleeve is set in, no binding.
- HONEST LIMIT: a very sharp inner corner (a true notched collar, a sailor corner)
  is not a bias case; those stay collar/facing pieces or honest in missing.js. No
  silent no-op — the finish is always a real piece.
- GOLDEN: patch 3.10 CHANGED the default (facing → bias), so golden was re-pinned by
  making golden_dump set `edgeFinish = Facing` (the Swift reference predates bias) —
  the surface stays BYTE-IDENTICAL (0.000000 mm / 23034 lines) AND this proves the
  Facing opt-in reproduces the pre-3.10 output exactly. bias_check independently
  proves the new bias default + the facing/collar exceptions.
- Fabric: a bias pair adds `bindingFabricMeters` (0.1 m) vs the facing's 0.2 m —
  bias uses less fabric (metrage swapped, not dropped).
- Bridge: create.js edgeFinish picker (default bias / facing) + the vision path pins
  bias (a finish choice, not a garment read); missing.js treats a "bias-bound / bound"
  neck read as DRAWN now; engine.js/backend/bindings int edgeFinish param (LAST arg,
  0 = bias default); both wasm targets rebuilt.
## Pockets (patch + side-seam) (cep) — opt-in (BENCHMARK-58 data ray, patch 3.12)
- WHAT: two honest pocket constructions, each a SEPARATE opt-in post-pass that
  leaves every existing outline byte-identical when off. `PocketStyle { None,
  Patch, SideSeam }`. pocket.hpp/.cpp, post-pass in garment.cpp after the peplum
  block. Chosen from the data: the market compass (dataset/vocab-frequency) and
  the 60s/70s collection both flag side pocket (freq 14) + patch pocket (freq 13)
  as the highest drawable out-of-vocab cluster.
- PATCH (yama cep): a separate flat pocket piece sewn onto the OUTSIDE of a body
  panel. A rounded-corner rectangle W × (H + hem), W = `clamp(frontWidth · 0.55,
  110, 210)` mm, H = `1.12 · W`; the top folds a `patchHemDepth = 35` mm self-hem
  for the mouth (a fold line marked above the mouth). `frontWidth` is the measured
  front-panel width passed from the drafter = `bust / 4` (the drafted front
  quarter) — so the patch grows with the body, TRUED to that measured width (the
  cut note quotes it; pocket_check reproduces `clamp(bust/4 · 0.55)`). A placement
  mark (an L-bracket of tick runs) is stamped on the front panel at its upper-hip
  band, read from the panel's own bounding box (each piece is drafted in local
  coordinates). SA = 15 mm; corner radius 28 mm. cut 2.
- SIDE-SEAM (yan dikiş cebi / in-seam): a hidden bag set into the side seam. One
  mirrored teardrop bag piece (cut 2 pairs = 4) with a straight side-seam edge and
  a curved pouch edge that seams to its mate. The host is the SIDE panel (max-x
  edge = the side seam); the mouth opening (`mouthOpening = 155` mm) starts
  `min(70, sideLen·0.25)` mm below the waist, and the bag hangs `bagBelowMouth =
  175` mm below the opening, both MEASURED from the drafted side-seam length so the
  bag never runs past the hem. A mouth mark (two inward ticks bracketing the hand
  opening + a dashed open run between them) is stamped on the side seam. Needs a
  side seam ≥ `minSeamForBag = 320` mm (a cropped top is skipped honestly).
- BYTE-IDENTICAL: with pocketStyle None (default) nothing is added and the golden
  dump is unchanged (23034 lines). Neither pocket ever rewrites an existing
  outline — a patch/mouth MARK is added to the host body panel's `markings`, but
  the OUTLINE (`commands`) of every piece is byte-identical (pocket_check asserts
  this). The validator excludes any "Pocket" piece from the skirt-waist sum (a
  pocket is an attachment, not a waist-bearing panel) so it never distorts the
  waist-join check.
- HONEST LIMIT: only the patch pocket and the in-seam side-seam pocket are drawn.
  A WELT / BESOM / BOUND / JETTED pocket, a CARGO / FLAP pocket and a KANGAROO
  pouch are DIFFERENT constructions that stay in the honesty layer (missing.js),
  never silently faked (there is no enum for them — the surface is exactly {None,
  Patch, SideSeam}). The block returns false + an honest guide note when the host
  has no panel / too-short a side seam (never a silent no-op).
- Vision→spec (create.js pickPocket): reads seen.oov/details for "pocket" (not
  welt/besom/bound/jetted/cargo/flap/kangaroo/zip) → sideSeam on side/in-seam/
  hidden/slash cues, else patch (a bare "pocket" reads as the common patch). A
  manual "cep" picker covers the no-photo path; seen.pocketDrawn suppresses the
  missing.js pocket note + the outOfVocab pocket term (welt etc. stay honest).

## Cowl + pussy-bow neckline (kowl / fiyonk yaka) — opt-in (patch 3.16)
Two vocabulary necklines APPENDED to the Neckline enum (Cowl=7, PussyBow=8 after
Crew..Halter). Both are ORTHOGONAL: for the 7 original necklines nothing changes,
so the base draft is BYTE-IDENTICAL (golden 23034 lines, 0.000000 mm). Only
neckline shape/pieces are touched — sleeve/shoulder/armhole/pocket/hem are not.
- COWL (bodice.cpp shape, no new piece): the front neck is cut WIDE + DEEP and
  the front is re-marked to cut on the BIAS with drape excess, so the fabric
  falls into soft self-facing folds (Aldrich cowl: add width AND depth, bias
  grainline). neckWidthMultiplier(Cowl)=1.4 (wider than boat 1.35); frontNeckDepth
  (Cowl)=neckW+90 (deeper than scoop neckW+50, shy of a plunge); neckCommands
  draws a deep rounded scoop-like drape curve. NecklineExtBlock::apply then rotates
  the front piece grainline to 45° (bias) about its own grainline midpoint and
  appends "CUT ON THE BIAS … drape excess … self-facing" to the cut note. No
  separate facing — the bias fold self-faces the neck. Measured, not maximal: a
  soft cowl, not a gaping hole. HONEST BOUNDARY: an asymmetric / multi-layer
  draped cowl is NOT drawn (stays honest via missing.js).
- PUSSYBOW (NecklineExtBlock post-pass, 2 new pieces): the neckline SHAPE is a
  shallow crew-depth opening (the band + bow live high on the throat). Two pieces
  are appended:
    · Pussy-bow Band — a high stand band (bandH 55 mm, cfRise 12 mm). The bottom
      (attach) SEAM edge is drafted STRAIGHT to the exact measured neckline length
      (CB fold x=0 → CF x=half, on y=0), so band edge == neckline to 0.00 mm
      (neckline measured off the finished pieces by the same neck-point scan the
      collar uses — truing by construction, cannot drift). cut 2 on fold at CB.
    · Pussy-bow Tie — a self-lined tube rectangle (2·W+2·SA wide × L+2·SA long,
      finished W 55 mm). Length L = 2× neck girth (each end reaches round + hangs),
      clamped [700, 1400] mm — MEASURED off the body, not a magic number. cut 2;
      one end sews into each CF band end, then they knot into a bow at the throat.
  A placement notch is stamped on the front neck point. HONEST BOUNDARY: an
  asymmetric bow is not drawn (the tie is a symmetric self-lined tube).
- Neither drafts on a skirt (no neckline to measure → honest skip, not a silent
  no-op). Guarded to dress/top in garment.cpp, keyed on the Neckline enum.
- Truing proven by neckline_ext_check (ctest): cowl front deeper than scoop +
  bias grainline ~45° + cut note; pussy-bow band attach == half neckline (0.0000
  mm) + tie is a self-lined cut-2 rectangle + notch on the front; the 7 originals
  draft zero band/tie pieces; a skirt skips honestly.
- Bridge: bindings.cpp necklineFrom "cowl"/"pussyBow" (neckline crosses as a
  STRING, not int); backend/draft.js ENUMS neckline list; web/js/create.js manual
  neckline picker (cowl + pussy-bow) + vision passes seen.neckline through;
  missing.js suppresses a cowl/pussy-bow oov term when that neckline is drawn (an
  asymmetric cowl / asymmetric bow stays honest). worker.js vision schema adds
  the two neckline values (code ready, deploy = Damla). Two wasm targets rebuilt.
## Cuff family (manşet) — opt-in (patch 3.13)
- WHAT: the SLEEVE-END finish — a separate band stitched to the wrist end of a
  full-length sleeve, the wider sleeve hem gathered/pleated in. `CuffStyle { None,
  Button, Ribbed }`. Opt-in (GarmentSpec.cuffStyle); None → golden BYTE-IDENTICAL.
  cuff.hpp/.cpp, post-pass in garment.cpp after the peplum block. It only ADDS a
  piece + a wrist notch, never touches an existing outline.
- TWO FAMILIES (Aldrich/Armstrong shirt-cuff + knit-band practice):
  - BUTTON (barrel/shirt) cuff: a woven rectangular band, cut to the wrist girth +
    a button/buttonhole OVERLAP, interfaced, cut 2 (+ tela). Band height 60 mm,
    overlap 25 mm. The sleeve hem is wider, so the surplus is gathered/pleated to
    the band. Grain runs along the band length.
  - RIBBED (knit rib) cuff: a rib-knit band cut SHORTER than the wrist so it hugs
    when it stretches on (the bomber/sweatshirt cuff). Cut length = wrist ×
    `ribStretchBack 0.80`; cut height 70 mm (folds to ~35 finished). Grain runs
    ACROSS the band (rib stretch runs around the wrist). No separate gathering row
    — the rib's recovery draws the hem in.
- WRIST ESTIMATE: `wrist ≈ 0.155 · bust` (passed from garment.cpp). ASSUMPTION
  (anthropometric — the wrist is roughly half the biceps, biceps ~0.30 bust);
  UNVALIDATED, validate with a muslin. The band clamps so it can never come out
  wider than the sleeve hem it gathers.
- GOVERNING CONSTRAINT / TRUING: the sleeve HEM width is measured straight off the
  FINISHED sleeve piece (the two lowest outline vertices of "Sleeve"/"Puff Sleeve"/
  "Gathered-Head Sleeve"), so the fullness surplus (hem − attach) is real, not
  asserted. cuff_check proves hem > attach on every body (fullness ~1.5× woven,
  ~2.0× knit), every existing outline byte-identical, and a sleeveless / short /
  cap garment gets an honest "cuff skipped" note (no silent no-op). A BALLOON
  sleeve already carries its own cuff band (drawn in the sleeve block), so the
  post-pass targets only the straight/puff/gathered-head sleeves — never double-cuffs.
- HONEST LIMIT: only the BUTTON (barrel) and RIBBED (knit) cuff are drawn. A FRENCH
  cuff (double turn-back, folded band, cufflinks), an ELASTIC-CASING cuff (a
  channel, no separate band), and a RUFFLE / TIE cuff are DIFFERENT constructions
  that stay in the honesty layer (missing.js).
- BENCHMARK HONESTY: this vocabulary moves the 58-set FULL count by ZERO. There is
  no photo in the set whose ONLY out-of-vocab item is a button/ribbed cuff — the
  three cuff photos are BALLOON SHORT-sleeve garments with "sleeve cuff ties" /
  "sleeve ruffle cuffs" (a different construction), and "button cuff"/"ribbed cuff"
  do not appear in the set at all. The market compass freq (button cuff 33) is
  EXTERNAL product-demand mining, not the ground-truth set. Added for
  vocabulary/moat coverage of real long-sleeve garments — measured, not claimed.
- Vision→spec (create.js pickCuff): reads seen.oov/details for a "cuff" naming
  button/barrel/shirt/rib/knit (not french/elastic/casing/ruffle/tie) → button /
  ribbed, gated to a full-length straight sleeve (long/elbow, not a cap wing). A
  manual "cuff" picker covers the no-photo path; seen.cuffDrawn suppresses the
  missing.js note + the outOfVocab cuff term.
## Hem shape (etek ucu / alt kenar şekli) — opt-in (patch 3.15)
- WHAT: reshapes the LOWER-edge line of the fitted skirt / dress-skirt / top
  pieces. It does NOT add a piece — it lifts the SIDE hem up (shirttail) or drops
  the BACK hem down (high-low) along a smooth curve while the CENTER hem and the
  waist stay put. `HemShape { Straight, Shirttail, HighLow }`. Opt-in
  (GarmentSpec.hemShape); Straight → golden BYTE-IDENTICAL. hem.hpp/.cpp,
  post-pass in garment.cpp after the peplum block, BEFORE the ruffle (so a ruffled
  hem attaches to the reshaped edge) and BEFORE the cutting lines.
- RESEARCH (ready-to-wear practice + Aldrich/Armstrong shaped-hem): a shirttail is
  a level hem lifted at the sides on a soft curve (shirttailSideRise 120 mm at the
  side, 0 at center front + center back). A high-low raises the front (highLowFrontRise
  220 mm) and drops the back (highLowBackDrop 120 mm), the two blending at the side
  seams. Both are cut, not gathered/draped.
- GEOMETRY: each hem vertex in the hem band (within `band` mm of the piece's lowest
  point) is lifted by `centerDelta + (sideRise − centerDelta)·smoothstep(t)`,
  where t is the vertex's normalized horizontal position (0 at the piece's center
  edge / gore seam, 1 at its outer side edge), then depth-weighted so the lift
  tapers to 0 at the top of the band (the side seam blends in). Curve control
  points in the band are lifted with the same function so the hem stays a smooth
  curve.
- GORE SEAM TRUING: a princess skirt splits each half into a Center panel (fold→
  gore seam, all long, no lift on a shirttail) and a Side panel (gore seam→side
  seam). The Side panel's gore edge is its min-x (t=0) and lifts by the SAME
  centerDelta the Center panel's gore edge carries, so the two edges of every gore
  seam stay matched (validator gorepair 0.0 mm). SIDE-SEAM BALANCE: the front and
  back SIDE hems lift to the SAME height (shirttail: both by shirttailSideRise;
  high-low: both to sideCommon = (front−back)/2), so a front and its back still
  meet at the side seam (hem_check + validator sideseam < tolerance).
- ADAPTIVE + HONEST GATES: the rises scale down for a short host so they never
  exceed ~45% of the shortest host's length; a host shorter than minHostLength
  (380 mm — a CROPPED top) is refused honestly (no hem to curve without
  unbalancing the seams). A gathered / pleated / half-circle skirt has no shaped
  side hem → gated out at the garment level + refused honestly by HemBlock. A DRESS
  BODICE ("Bodice …") is never touched — only the dress's "Skirt …" pieces. The
  validator's top "hem extension did not apply" height check is relaxed by
  highLowFrontRise for a high-low front (the front is intentionally short).
- HONEST LIMIT: only the soft symmetric shirttail and the front-short/back-long
  high-low are drawn. An asymmetric-diagonal hem, a handkerchief / pointed hem
  (the peplum block's pointed variant covers the flare case) and a mullet on a
  gathered skirt stay in the honesty layer (missing.js), NOT here.
- Vision→spec (create.js pickHemShape): reads seen.oov / details ("shirt-tail",
  "high-low/mullet/dipped back", "curved hem"; not handkerchief/pointed/asymmetric/
  diagonal) → shirttail / highLow, gated to a fitted straight/A-line skirt/dress or
  a top. A manual "hem shape" picker covers the no-photo path; seen.hemShapeDrawn
  suppresses the missing.js note + the outOfVocab hem-shape term.

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

## Wearability invariants (giyilebilirlik testi) — 2026-07-17
The internal validator proves a pattern is CONSISTENT (seams sew, curves don't
fold, waists match). Wearability proves a human can PUT IT ON and wear it — the
gap an outside LLM found: a draft green on every internal test yet un-donnable.
Lives in `src/wearability.cpp`, called at the end of `PatternValidator::issues`,
so a wearability issue BLOCKS a draft exactly like a facing/keyhole issue. Reads
only the drafted geometry (finished neckline off the front/back center pieces) +
spec — never a recomputed ideal — so it catches a draft that drifted from its
own intent. Thresholds set against Aldrich/Armstrong tolerances so a real
tight-but-wearable draft never trips (proven: engine_check 2805-draft matrix,
vocab-sweep 37800, web-fuzz 20110 — zero false positives).

- **Rule 1 — HEAD ENTRY (blocking, collapsed-opening guard).** A closed-neck
  garment that must slip over the head (a TOP with no zipper/placket/tie/back
  opening) is refused only when its finished neck OPENING (= 2×(front half-neck +
  back half-neck)) has collapsed below `neckOpeningDegenerateMM = 150` mm — a hole
  no head could pass. NOT a "does a head fit" estimator: the finished perimeter is
  a NOISY head oracle (a wide-shallow boat/bateau neck legitimately sits well
  under the neck girth — measured 455 mm on a 500 mm neck — and the shoulder clamp
  shrinks it further on a broad-neck/narrow-shoulder body), so any perimeter
  threshold above trivia false-positives on real drafts. The floor sits far under
  the smallest real draft (267 mm across every harness body/neckline). Dresses
  (CB zipper), halters (nape closure), plackets/ties/back-cutouts are exempt via
  `hasDonningOpening()`.
- **Rule 2 — FOLD vs OPENING (blocking).** A declared front button placket must
  not collapse to a plain center-front fold with nothing to open (the exact
  outside-LLM bug: drawn front-buttoned, saved as cut-on-fold). When the placket
  is drawn the engine grows the front edge past the CF (x < 0) and adds
  button/fold-line markings; if `spec.frontPlacket` is set but the front is still
  a plain fold at x = 0 with no stand/markings, the closure was dropped → FAIL.
- **Rule 3 — EDGE FINISH (blocking).** A sleeveless bodiced garment (top/dress,
  not skirt, not halter) leaves a raw armhole; it must carry a binding/facing
  piece OR an honest guide note to bind it (the engine emits "bias binding
  (sleeveless)"). Neither → the armhole is an unfinished fraying edge → FAIL.
- **Rule 4 — WOVEN EASE (test WARN, not a blocker).** A woven garment needs real
  chest ease (`wovenChestEaseMinMM = 20` mm total); this is already enforced
  upstream by the chest-width invariant, so wearability keeps it as an independent
  report line in the ctest, not a second blocker.

Proof: `tests/wearability_check.cpp` (ctest #21) — real drafts across all garment
types pass, a collapsed neckline / dropped placket / unfinished armhole each FAIL,
golden byte-identical (the module READS geometry, mutates nothing).
Benchmark harness: `tools/wearability-bench.{cpp,mjs}` runs the 54 vision-labelled
specs through the gate (0 unwearable on the current benchmark — the gate is a
permanent guardrail, not a one-time fix).

## Dropped shoulder + raglan (düşük omuz + reglan) — opt-in (patch 3.13)
- WHAT: two ways the sleeve joins the body at the shoulder.
  `ShoulderStyle { Set, Dropped, Raglan }` (GarmentSpec.shoulderStyle, APPEND-only
  enum). Set (default) → golden BYTE-IDENTICAL (23034 lines, 0.000000 mm): every
  Dropped/Raglan effect is HARD-GATED behind `if (style == Dropped/Raglan)`, so
  the Set code paths are untouched. shoulder.hpp/.cpp.
- WHERE (deliberate, not a pure post-pass): DROPPED reshapes the ARMHOLE, so it is
  threaded into the bodice draft (BodiceOptions.shoulderStyle) where the shoulder
  tip, armhole curve and cap solver all live in one body frame — a post-pass
  cannot re-fit the sleeve cap. RAGLAN is a post-pass in garment.cpp
  (ShoulderBlock::applyRaglan) because it re-marks finished pieces + converts the
  sleeve, without moving any body outline.
- DROPPED (Aldrich "dropped/extended shoulder"): the shoulder tip slides OUT along
  the shoulder line by `dropExtendShare 0.28 · half-shoulder` (the slope
  shoulderDrop is taken from the NATURAL shoulder first, so the seam runs roughly
  straight out onto the arm, not steeper). The underarm point DROPS by
  `dropArmholeShare 0.22 · torso armhole depth` (clamped above the waist seam) and
  the chest WIDENS on BOTH halves by `dropWidenShare 0.55 · that drop` (equal, so
  the side seams still pair). The sleeve solver then reads the LONGER, DEEPER
  armhole and flattens/widens the cap on its own — a dropped shoulder wears with
  almost no set-in crown, which is exactly a longer armhole with a shallower cap.
  `BodiceDraft.droppedWiden` is read back by the validator so its "ease is being
  eaten" chest check knows the widen is intentional (Set/Raglan → 0).
- RAGLAN (Aldrich/Armstrong raglan): NO shoulder seam. A diagonal raglan seam is
  MARKED on the front + back from a neck point (`raglanNeckShare 0.30` of the way
  from the neck-shoulder point back toward the centre neck) down to the underarm,
  bowed toward the scye; the shoulder corner above it is noted "cut off" in the
  cut instruction. The set-in sleeve OUTLINE is KEPT (it still eases into the lower
  armhole and stays validatable) — a raglan sleeve's shoulder point is the TOP of
  its own cap — and on the cap we MARK the two raglan seam lines (front + back cap
  corner → cap top) + a small crown DART that rounds the flat cap into the shoulder
  point. All raglan markings sit ON the pieces (within the bounding box), so no
  outline moves → the body pieces are byte-identical, the sleeve is renamed
  "Raglan …" and carries only extra markings.
- TRUING: the raglan seam lines run from real outline vertices (neck point,
  underarm) so the seam sews to the armhole arc it was read from; the dropped
  armhole re-fits its sleeve cap through the existing bisection solver, so cap ease
  stays inside the validator window (shoulder_check confirms the dropped armhole is
  longer + deeper, both halves widen equally, and every raglan body outline is
  byte-identical).
- HONEST LIMITS: a halter has no shoulder seam → both styles are IGNORED
  (byte-identical), never mis-drawn. A saddle/epaulette raglan and a halter-raglan
  hybrid are DIFFERENT constructions and stay in the honesty layer (missing.js). A
  sleeveless raglan draws the seam on the body only (a cut-on shoulder) with an
  honest note. A dropped shoulder on an EXTENDED dart-mode top can unbalance the
  front/back side seam — that draft is REFUSED by the validator with a clear reason
  (giyilebilirlik birinci), not shipped unsewable; princess mode (the default) and
  every dropped DRESS validate.
- Vision→spec (create.js pickShoulder): reads "raglan" (not saddle/epaulette) →
  raglan; "dropped/extended shoulder" (not off-shoulder) → dropped; gated off a
  skirt/halter. A manual "shoulder" picker covers the no-photo path;
  seen.shoulderDrawn suppresses the missing.js note + the outOfVocab shoulder term.


## Button rows (vocab 2026-07-17)
A drawn vertical row of round BUTTON CIRCLES down the front (distinct from the
button PLACKET geometry — this draws the actual glyphs). Two modes:
- Functional: reuses PlacketBlock::apply (grown 18 mm CF stand, fold line,
  buttonholes, opens for donning — cut 2, not on fold), then draws real button
  circles ON the CF line (x = 0, which now sits on the piece past the stand).
- Decorative: buttons sewn on for looks, NO opening; the tube keeps its zip. The
  circles nudge inward by r + 4 mm so the whole circle stays on the fabric (the CF
  fold is the piece's x = 0 edge).
Button diameter 18 mm, spacing ~90 mm on center. buttonrow_check proves: decorative
= outline byte-identical + ≥3 circles + still needs a zip; functional = grown stand
+ circles + closure tag + wearable. None = byte-identical.

## Exposed zipper (vocab 2026-07-17)
A VISIBLE design zip (distinct from the invisible CB zip a dress always carries),
drawn as a teeth glyph (a seam line + alternating-side teeth ticks) on the CF or CB
seam edge. The exposed-zip seam allowance is 10 mm (turned back + topstitched flat
over the tape, not the 15 mm an invisible zip hides). Opens the seam for donning
(cut 2, not on fold) + tags the closure. exposedzip_check proves the glyph + open
seam + closure + wearability. None = byte-identical.

## Back detail — ruffle / cape / flounce (vocab 2026-07-17, "arkası pelerinli/fırfırlı")
A separate cut piece attached at the back neck, attach edge TRUED to the finished
back neck edge N (= 2 × the back center piece's neck sub-path, the same measure the
wearability neck invariant uses). Ruffle = a strip N·2.2 long gathered to N. Cape =
a flat on-fold panel N wide flaring to 1.5 N at a 380 mm hem. Flounce = a half-circle
annular sector, inner (attach) arc = N (r0 = N/π), outer arc longer so it ripples.
backdetail_check proves one trued piece per detail, outlines byte-identical, valid.
Hood/watteau/shoulder-cape stay honest (missing.js). None = byte-identical.

## Front-tie variants (vocab 2026-07-17, "önünden bağlamalı")
Appended to TiePlacement (append-only enum): FrontWaistTie (two waist ties knotting
at CF, each ≈ half the waist + a knot margin), WrapFront (a long wrap tie that
crosses the front and IS the opening — it makes the garment donnable, so the dress
drops its redundant CB zip and a top is wearable), FrontWaistBow (a decorative CF
waist bow). Same self-fabric strip construction as the back ties, front-piece
placement notch on the waist edge. fronttie_check proves the pieces + wrap-front
donning. None = byte-identical.

## Off-shoulder / bardot (vocab 2026-07-17, the pink gingham dress)
The bodice top edge is REShaped DOWN by 55 mm below the shoulder point into a
straight bardot band (shoulders bare, no shoulder seam / top-edge sleeve), from CF
to the armhole point. The CF-returning outline vertex is retargeted to the band top
so the CF edge stops cleanly (no self-cross). An elastic casing is marked at the top
edge + an elastic cut length ≈ 0.85 × the finished top-edge circumference (2×(front
half + back half)) so it holds off the shoulders. Frill adds a bardot ruffle strip
(top·2.0 gathered to the top edge). The wide elastic top stretches over the
shoulders → hasDonningOpening treats it as a stretch opening (donnable).
offshoulder_check proves the dropped edge + elastic piece + frill + wearability.
Needs a plain (dart) bodiced front + back; princess/skirt garments stay honest.
None = byte-identical.
