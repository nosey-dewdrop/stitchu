> **UNVERIFIED + PARK (K6, 2026-07-19).** Agent-drafted spec, never reviewed against the
> engine, never implemented. New vocabulary drawing = new feature = A1 forbidden in the
> v1.0 closing chain. PARKED as a v1.1 candidate; do not build from this file without
> Damla's approval and a fresh verification pass.

# Stitchu Engine — Specs for the Next Couture Vocabulary (Track A item 5)

> Written 2026-07-13. Research + engine-mapping spec for the NINE vocabulary items after
> tiered ruffle / sweetheart / keyhole / halter. Every feature follows the per-feature loop
> and the IRONCLAD DISCIPLINE in PLAN.md: opt-in field default OFF, 50400+ matrix stays
> ALL PASS, golden diff intact, `tests/<feature>_check.cpp` green, validator zero issues,
> piece rendered and LOOKED at before "done".
>
> Conventions (FORMULAS.md): all geometry in mm, local origin top-left, y grows down.
> Half bodice/skirt pieces put the center front/back at x = 0 and grow toward the side.
> Piece outline = sewing line; SA is metadata. Construction figures below come from real
> pattern-making sources (URLs at each section end); imperial values converted to mm.
> Anything a source did not give is marked **TBD (needs source)** or **ASSUMPTION**
> (FORMULAS.md convention: documented approximation, covered by the muslin warning).
> Numbers marked "proposed" are starting clamps for our block, to be tuned against renders.

Existing skeleton being reused throughout:
- **BodiceBlock** — frame-shift trick (halter): the whole half is drafted in a shifted
  local frame (`halterStrapRise`, `halterBackDropShare`), pieces keep their own top-left
  origin, `frontPieceWaistY/backPieceWaistY` carry the shifted waist level. Off-shoulder
  and one-shoulder reuse exactly this.
- **De Casteljau armhole split** (princess seam): splitting the shared armhole cubic at a
  chosen y. Off-shoulder reuses it to keep only the lower armhole.
- **SkirtBlock half-circle machinery** — r = easedWaist/pi, kappa 0.5523 quarter-annulus
  panels cut flat. Peplum and flutter are annulus pieces of the same construction.
- **SleeveBlock bisection cap fit** — cap width found by bisection against a target cap
  length. Cap sleeve refits the same cap with a lower ease target instead of new curves.
- **Post-pass blocks** (RuffleBlock, KeyholeBlock::apply on the finished pattern) — the
  asymmetric hem is a hem post-pass in the same spirit.
- **halterBinding strip generator** — a bias strip sized from measured edge length.
  Off-shoulder casing, one-shoulder binding and wrap-edge binding reuse the pattern.
- **Honest skip** (keyhole "too short" note) — every impossible combination below emits a
  guide note, never a silent no-op.

---

## 1. Cap sleeve

### Construction (sources)
Trace the sleeve block only to 19 mm (0.75 in) below the biceps line; mark 6 mm (0.25 in)
in from each side at that level (points A, B); lower the cap midpoint by 19 mm (0.75 in)
and redraw the cap between the notches through the lowered point — the block's cap ease
"is not required, so you need to reduce the cap height" (dresspatternmaking; 19 mm is
their stated "generic amount"). The hem edge A–B is a shallow curve; its exact shape is a
design choice. Preferred finished length ~89–114 mm (3.5–4.5 in, SewGuide). When
flattening a cap systematically, In the Folds keeps ~12 mm residual ease, split 1/3 front
/ 2/3 back. The sleeve still sews around the full armhole (it "can extend below the bicep
line at the underarm level for a small amount"), so no bound-armhole gap in v1.

### Engine mapping
- `SleeveStyle::Cap` (new enum value — an axis like Straight/Balloon, not a bool).
  `SleeveLength` is ignored for Cap (forced short) with an honest guide note.
- One piece, drafted in `sleeve.cpp`: **reuse the bisection cap fit** with the ease target
  dropped from 4% to ~1% (bisection converges the same way; no new curve code), total
  piece length = capHeight + 19, hem half-width = 0.40 x width − 6 (the A/B inset),
  hem edge a shallow cubic sagging ~8 mm at center (proposed).
- Underarm seam survives (length ≈ 19 mm) so construction stays the standard set-in flow.

> **v1 ATTEMPT 2026-07-15 — REVERTED, spec is incomplete.** Building it as written
> exposed a geometric contradiction: to length-match the FULL armhole at biceps
> width, the cap curve MUST be tall (measured capHeight 124-178 mm → total piece
> 143-235 mm), because a wide chord needs a tall cap to reach the armhole length.
> That is a *short set-in sleeve*, not the flat ~90-114 mm shoulder-cover a cap
> sleeve is. You cannot have all three of {biceps-wide, spans the full armhole,
> flat short cap} — the sources' 89-114 mm finished length assumes the sleeve does
> NOT span the full armhole. So the REAL cap sleeve is the v2 path the spec lists:
> open/bound lower armhole (the sleeve covers only the top of the armscye, the
> underarm is bound like a sleeveless edge — reuse `halterBinding`). v1-as-written
> is not shippable; do v2 (bound lower armhole) or drop cap sleeve. Keeping the
> engine clean beat shipping a 235 mm "cap".
- v2 option (not v1): open underarm + bias-bound lower armhole (In the Folds binding
  method), reusing the halterBinding strip generator.

### Geometry sketch (mm)
- capEaseFor(style): Cap → 0.01 target (proposed; window below). Knit cap → 0.005.
- length = capHeight + 19 (source: hem 19 below biceps line).
- hemHalf = 0.40 x width − 6; clamp hemHalf ≥ 60 so the arm can pass (ASSUMPTION).
- hem center drop 8, clamp 0–15 (proposed, render-tuned).

### Validator
- `capEase` window must follow style the way it already follows fabric ("validator target
  follows fabric"): Cap window 0–4% (proposed) instead of 1–9%.
- `capLength` tolerance 2.5 unchanged (cap still fitted by bisection).
- Honest skip: none needed — cap fits every body in the matrix by construction.

### Vision label
`sleeveStyle` gains `"cap"` — a very short fitted sleeve covering only the shoulder,
ending above mid-biceps; the underarm is nearly sleeveless.

### Tractability x value: 5 x 3 = 15
One file, one enum value, reuses the bisection fit; cap sleeves are everywhere on
Trendyol basics but rarely the reason a dress sells.

### Test plan — tests/cap_sleeve_check.cpp
1. Spec without Cap drafts byte-identical to before (enum addition changes nothing).
2. Cap sleeve piece exists, total height ≤ capHeight + 19 + hem-drop tolerance.
3. Measured cap ease lands in the 0–4% window; `PatternValidator::issues` empty.
4. Piece printable (≤ 3000 mm span) for the largest matrix body.
5. Guide contains the forced-short note when sleeveLength = Long was requested.
6. Hem half-width = 0.40 x width − 6 within 0.5 mm.

Sources: https://dresspatternmaking.com/patternmaking-basics/garment-elements/sleeves/cap-sleeves ·
https://sewguide.com/cap-sleeves/ ·
https://dresspatternmaking.com/patternmaking-basics/terminology/ease-sleeves ·
https://inthefolds.com/q-a-series/2020/4/15/issue-26-adding-and-removing-fullness-from-a-sleeve-hem-zl2nb ·
https://inthefolds.com/blog/2015/9/8/binding-the-armholes

---

## 2. Bell sleeve

### Construction (sources)
Slash-and-spread below a baseline "halfway down the sleeve": draw slash lines parallel to
the grainline, cut from hem to ~3 mm (1/8 in) paper hinges at the cap end, keep the cap
taped in place — **the cap is unchanged** — and spread each segment a consistent amount
(Seamwork used 25 mm/1 in per segment), then blend a smooth curved hemline through the
spread. dresspatternmaking's fully flared short sleeve uses 5 slash lines spread 44 mm
(1.75 in) each (≈ 222 mm total) and lowers the hem 44 mm at center to re-true the curve.
The Shapes of Fabric: bell = the flared sleeve "with much less volume added"; trumpet
pushes the flare below the elbow. Hem folded 15 mm (5/8 in) and edgestitched (Seamwork).

### Engine mapping
- `SleeveStyle::Bell`. Cap and upper sleeve identical to Straight (cap ease intact →
  `capEase`/`capLength` validator rules hold untouched, like Balloon does today).
- Flat equivalent of slash-and-spread in `sleeve.cpp`: side seams run straight from
  underarm to the flare-start line, then flare out to a widened hem; hem is a shallow
  curve dropped at center (the re-truing drop). This is the balloon "wider lower sleeve"
  machinery with the bulge moved to the hem and no cuff/gathers.
- Best at Elbow/Long lengths; Short + Bell = honest note "bell needs length to flare" and
  falls back to flutter-adjacent look — or simply allowed with small flare (decide at
  render time; spec default: allow, small flare).

### Geometry sketch (mm)
- flareStartY = capHeight + 0.5 x (length − capHeight) (source: baseline halfway down the
  sleeve; measured on the arm portion below the cap — interpretation, render-check).
- hemHalf = 0.40 x width + bellFlareMM. `GarmentSpec.bellFlareMM` NOT exposed v1; fixed
  constant 70 per side (total added spread 140, between Seamwork's subtle ~125 and
  dresspatternmaking's dramatic 222), clamp 30–110 if exposed later.
- hem center drop = 0.4 x bellFlareMM (≈ 28 for 70; scaled from dresspatternmaking's
  44 drop for 222 spread — ASSUMPTION, render-tuned). Hem = cubic through the drop.
- Hem circumference target figure in sources: TBD (needs source) — none found; the flare
  constant stands in.

### Validator
- `capEase`, `capLength` unchanged (cap untouched).
- `pairedSeam`: the two flared side seams must still measure equal (they are mirrored by
  construction; assert anyway).
- `kink` rule already guards the hem curve blend.

### Vision label
`sleeveStyle` gains `"bell"` — fitted through the cap and upper arm, flaring smoothly
from around the elbow to a wide open hem, no cuff and no gathers.

### Tractability x value: 4 x 4 = 16
Same file as cap, balloon precedent for a shaped lower sleeve; bell-sleeve blouses are a
persistent Trendyol/Etsy category.

### Test plan — tests/bell_sleeve_check.cpp
1. Non-bell drafts byte-identical.
2. Cap curve commands identical to the Straight sleeve of the same body (cap untouched).
3. Hem width = 2 x (0.40 x width + 70) within 0.5 mm; flare starts at flareStartY ± 1.
4. Validator zero issues; cap ease still inside the 1–9% window.
5. Piece printable for the largest matrix body at Long length.
6. Left/right flared side seam lengths equal within 0.5 mm.

Sources: https://www.seamwork.com/sewing-tutorials/pattern-hackers-14 ·
https://dresspatternmaking.com/garment-elements/sleeves/flared-sleeves/ ·
https://www.theshapesoffabric.com/2018/11/03/7-easy-sleeve-pattern-alterations/ ·
https://sewguide.com/bell-sleeves/

---

## 3. Peplum

### Construction (sources)
Drafted exactly like a circle skirt whose inner circle equals the seam it attaches to.
SewGuide (flat peplum): inner radius = attaching edge / 6.28 − 12.7 mm; gathered variant
doubles the edge first. The Shapes of Fabric circle-radius table: full circle r =
half-waist / 3.14 (same math). Outer arc = inner radius + peplum depth. Typical depth
~203–254 mm (8–10 in, create-enjoy); Megan Nielsen's finished peplum is 260 mm; justsewing
graduates 100 mm at CF to 200 mm at CB. Attach right sides together at the waist seam
(12.7 mm SA per SewGuide); hem = rolled/baby hem, or fully line and bag out. Slash-spread
alternative (Pattern Cutting School): spread 25/50/76–102 mm per section for subtle/
medium/dramatic flare, slashes stopped 3 mm from the waistline.

### Engine mapping
- `GarmentSpec.peplum = false` (opt-in bool) + `GarmentSpec.peplumDepthMM = 220`.
  v1 scope: **Top only, natural waist** (an empire peplum reads babydoll — honest note;
  a peplum on a Dress is an overskirt, out of scope v1).
- Peplum = a very short full-circle skirt joined at the bodice waist: **reuse the
  half-circle machinery** (kappa 0.5523 quarter-annulus panels) and **the dress-mode
  waist join** (draft against the bodice's SEWN waist, exactly like the skirt does).
- Pieces: front quarter-annulus cut 1 on fold (unfolds to the front half circle), back
  quarter-annulus cut 2 (CB seam continues the top's closure) — mirrors the skirt piece
  conventions. Pieces named "Peplum front/back" — peplum IS waist-bearing, so it is NOT
  excluded from waist sums (unlike "Ruffle").
- Top block: with peplum on, the bodice drafts CROPPED (no hip extension — the peplum
  replaces it); topLength forced Cropped with an honest note when Hip/Tunic requested.

### Geometry sketch (mm)
- innerR = bodiceSewnWaist / (2 x pi) (full circle; the source's −12.7 snugness term is
  dropped — our sewn-waist target already excludes ease games; ASSUMPTION).
- outerR = innerR + peplumDepthMM; depth default 220, clamp 120–300 (sources: 203–260
  typical; 100 CF graduation variant is v2).
- Per piece: quarter annulus, inner arc = bodiceSewnWaist/4, spans ≈ 2 x outerR — for
  waist 700 + depth 220: outerR ≈ 331, piece ≈ 662 wide → prints easily.
- Gathered peplum (inner circle doubled) = v2, one constant away.

### Validator
- `waistJoin` reused: sum of peplum inner arcs (front x2-from-fold + back x2) must match
  the bodice sewn waist within the existing 12 mm.
- Piece arcs flatten under the existing 24-segment rule; `kink` holds on annulus curves
  (same construction as half-circle skirt, already green in the matrix).
- Honest skip: peplum + Skirt/Dress or + Empire → guide note, no pieces.

### Vision label
New field `"peplum": true | false | null` — a short flared flounce attached at the waist
seam of a top or dress, flaring over the hips like a mini circle skirt; null when the
waist is not visible.

### Tractability x value: 4 x 4 = 16
Nearly all machinery exists (annulus panels + waist join); peplum tops/blouses are a
steady Etsy search category.

### Test plan — tests/peplum_check.cpp
1. peplum=false drafts byte-identical (matrix intact).
2. Peplum front + back pieces present with the right cuts (fold / cut 2).
3. Inner arc sum == bodice sewn waist within 12 mm; validator zero issues.
4. outerR − innerR == peplumDepthMM within 0.5 mm.
5. Printable on the largest body at depth clamp max (300).
6. peplum + empire top → no peplum pieces + honest guide note present.

Sources: https://sewguide.com/make-a-peplum-top/ ·
https://www.theshapesoffabric.com/2019/04/21/conquer-circle-skirt-patterns/ ·
https://justsewing.wordpress.com/2012/05/04/simple-wardrobe-updates-make-your-own-peplum-skirt/ ·
https://www.create-enjoy.com/2013/04/how-to-make-peplum-top-out-of-any-dress.html ·
https://blog.megannielsen.com/2018/09/darling-ranges-peplum-top/ ·
https://www.patterncuttingschool.com/blog/slash-and-spread-explained

---

## 4. Flutter sleeve

### Construction (sources)
Two source families. (a) Circle/flounce: a half circle (or "donut" segment) whose inner
edge sews to the TOP of the armhole only, hanging free — no underarm seam; inner radius =
covered edge / 6.28 (So Sew Easy: armhole/6.28 minus SA; Melly Sews: circumference/6.28);
flounce depths used: 76 and 127 mm (3 and 5 in, Melly Sews). No cap ease — none of the
circle tutorials add any. (b) Slash-and-spread of a short sleeve into eighths, ~25 mm
(1 in) between strips, hinged at the cap so the armscye length is unchanged (Love
Notions, Skirt Fixation). Drapey fabric mandatory ("may end up looking like wings" in
quilting cotton — Melly Sews); rolled hem on the curved edge.

### Engine mapping
- `SleeveStyle::Flutter`. v1 = the flounce family (family (a)): visually distinct from
  Bell, zero cap machinery, and it **reuses the annulus construction from the peplum**
  (same kappa arcs, different radii). Family (b) is the fallback if fit tests fail.
- One piece per arm: half-annulus "Flutter flounce", cut 2, bias grainline marking
  (drape). Inner arc length = coveredShare x armholeLength. The lower armhole is left
  sleeveless: finish with the existing facing/binding flow + a guide note (In the Folds
  bias-bound armhole steps), reusing the halterBinding strip generator for the binding
  strip sized to the UNCOVERED armhole length x 2.
- Cap ease rules do not apply — flutter is set flat with none.

### Geometry sketch (mm)
- coveredShare = 0.6 of armholeLength, clamp 0.5–0.7 — **TBD (needs source)**: Melly Sews
  says "only the top of the armhole" but gives no share; 0.6 is an ASSUMPTION to be
  fit-tested.
- Half-annulus inner radius: innerR = (coveredShare x armholeLength) / pi (a 180-degree
  flounce; the /6.28 sources describe a full circle — we cover half the angle for the
  over-shoulder drape).
- Depth (flounce length) default 110, clamp 76–127 (the two source depths).
- Hem: outer arc, rolled-hem allowance 10 (matches ruffle rolled hem convention).

### Validator
- New rule "flutter": inner arc == coveredShare x armholeLength within 2.5 (capLength
  tolerance reused); `capEase` must SKIP flutter (like sleeveless) — an honest structural
  skip, asserted in the test.
- Exclude "Flutter" pieces from cap checks by name, ruffle-precedent.
- Honest note: flutter + Knit allowed; flutter guide always carries the drape-fabric
  warning (source language).

### Vision label
`sleeveStyle` gains `"flutter"` — a loose flared flounce falling over the shoulder from
the top of the armhole, open at the underarm; reads as a soft ruffle, not a fitted cap.

### Tractability x value: 3 x 4 = 12
New piece + new validator rule, but the annulus math is shared with peplum; flutter
dresses/tops are a big feminine-summer category on Etsy and Trendyol.

### Test plan — tests/flutter_check.cpp
1. Non-flutter drafts byte-identical.
2. Flounce piece present, cut 2, bias grainline marking present.
3. Inner arc = 0.6 x armholeLength within 2.5 mm; validator zero issues (cap rules
   skipped, flutter rule green).
4. Depth clamps honored at both ends (spec 60 → 76, spec 200 → 127).
5. Printable; bounding box positive.
6. Guide contains the underarm-binding steps and the drape-fabric warning.

Sources: https://mellysews.com/circle-sleeve-tutorial-how-to-sew-a-sleeve-ruffle/ ·
https://so-sew-easy.com/adding-butterfly-sleeves/ ·
https://www.lovenotions.com/classic-tee-flutter-sleeve-hack ·
https://skirtfixation.wordpress.com/2018/06/07/flutter-sleeve-tutorial/ ·
https://sewguide.com/sew-flutter-sleeve/ ·
https://www.ageberry.com/how-to-make-flutter-sleeve/

---

## 5. Off-shoulder (bardot) neckline

### Construction (sources)
From a fitted block (Sewing Lab Milano): cut the shoulder seam and upper armhole away
above a new top edge; the edge starts at a right angle at center back, runs to the
armhole, and on the front meets the armhole **90 mm below the shoulder point**; front
waist darts widened (2 x 15 mm in their paneled version) so the strapless edge hugs the
body. By Hand London's princess hack draws the front edge "about half the way between the
top of the shoulder strap and the princess seam". Two hold-up systems: (1) elastic casing
— 30 mm elastic (Georgette), casing sewn 30–35 mm from the seam, elastic length = the
around-shoulders measure minus ~50 mm (icansewthis: shoulder circumference minus 2 in);
(2) fitted structure — organza underlining + lingerie elastic in the neckline SA (By Hand
London). Sleeves attached to the band need the cap redrawn to the shortened armhole
(Sewing Lab Milano).

### Engine mapping
- `Neckline::OffShoulder` (axis value, halter precedent — it restructures the block, it
  is not a curve swap).
- **Reuse the halter frame shift**: both front AND back drafted in a frame whose local
  y = 0 is the new dropped top edge (halter already does this for the back via
  `halterBackDropShare`; off-shoulder applies the same shift to both halves).
- **Reuse the de Casteljau armhole split**: keep only the armhole segment below the drop
  point (princess-split machinery on the same shared cubic).
- No shoulder seam, no facings; sleeves forced None v1 with the halter-style honest note
  (Sewing Lab's redrawn-cap sleeve = v2). Replaces facings with a "Neck casing" strip
  piece (halterBinding generator: length = measured top edge x both halves x 2 + 25
  overlap, width 70 for 30 mm elastic — proposed).
- Guide: elastic cut to the wearer's around-shoulders measure minus 50, measured at sew
  time (we do not collect that girth — honest instruction, muslin-warning class).
- Waist suppression: keep princess/dart shaping as-is; the source's widened-dart snugging
  (2 x 15 mm) is v2 fit tuning, flagged ASSUMPTION if added.

### Geometry sketch (mm)
- armholeMeetY = shoulderDrop + 90 (source: edge meets armhole 90 below the shoulder
  point; vertical approximation of their along-the-armhole measure — ASSUMPTION).
- CF/CB top edge depth: **TBD (needs source)** — sources give only "halfway between
  strap top and princess seam". Proposed start: topEdgeY(CF) = armholeMeetY + 15 with a
  gentle curve to the armhole point, clamped ≥ 50 above the front apex (apex y =
  armholeY + 40) so the edge never rides the bust. Back edge squared at CB (source).
- Frame shift = topEdgeY (whole half rises to local y = 0), waist levels carried in
  `frontPieceWaistY/backPieceWaistY` exactly like halter.
- Casing strip: width 70 (30 elastic + turn — proposed), length = edge + 25 overlap
  (SewGuide + 1 in).

### Validator
- `facing` rule exempts OffShoulder (replaced by the casing strip; halter already has the
  exemption path for its binding).
- New rule "offshoulder": casing strip length == measured top edge + 25 within 2 mm; top
  edge clears the front apex by ≥ 50.
- `pairedSeam` still applies to side seams; sleeve rules skip (sleeveless).
- Honest skip: sleeves requested → note; nothing skips silently.

### Vision label
`neckline` gains `"offShoulder"` — both shoulders bare, the top edge runs straight across
the chest and upper arms below the shoulder points (bardot); often elasticated or with a
matching band.

### Tractability x value: 3 x 5 = 15
Frame shift and split machinery exist (halter, princess); the elastic-fit unknowns are
guide-side, not geometry-side. Bardot is one of the strongest Etsy/Trendyol summer
necklines.

### Test plan — tests/offshoulder_check.cpp
1. Other necklines draft byte-identical.
2. No shoulder seam: front/back top edges are single curves ending at the armhole split
   point 90 below the shoulder point (± 1 mm).
3. Top edge ≥ 50 above the front apex on every matrix body (clamp active on petite).
4. Casing strip length matches the measured edge + 25 within 2 mm; validator zero issues.
5. Sleeves requested → sleeveless pieces + honest note (halter-style).
6. Waist/side-seam audit values unchanged vs the same spec with Crew (frame shift must
   not leak into suppression).

Sources: https://sewinglabmilano.com/tutorial/paneled-dress-with-bardot-neckline/ ·
https://sewinglabmilano.com/tutorial/bardot-long-dress/ ·
https://byhandlondon.com/blogs/by-hand-london/71696581-pattern-hacking-elisalex-the-ultimate-off-the-shoulder-velvet-princess-dress ·
https://www.georgettepatterns.com/blogs/news/free-off-the-shoulder-top-pattern ·
https://icansewthis.com/peasant-top-pattern/ ·
https://sewguide.com/off-shoulder-top-sewing-pattern/

---

## 6. Cowl (draped) neckline

### Construction (sources)
Classic slash-and-spread (Craftsy): mark the deepest neckline ~76–127 mm (3–5 in) below
the collarbone; two slash lines from the shoulder seam to CF, hinged at the shoulder;
spread to add 203–254 mm (8–10 in) of total length at center front; draw the cowl top
edge from the shoulder point squared 90 degrees to the new CF; FOLD the paper on that
line to trace a grown-on self-facing and true the shoulder edge through the fold.
SewGuide places hinges 20 mm inside the shoulder/armhole seam lines and draws the
self-facing 51 mm (2 in) deep; pattern-making.com uses a 25 mm (1 in) front-neck hem.
Bust dart value folds into the drape (Studio Faro transfers "all the bust darting into a
front neck cowl"). Cut on TRUE BIAS for wovens; the top edge ends up longer than the body
and is eased/pleated at the shoulder; optional weight in a small pocket on the facing.

### Engine mapping
- `Neckline::Cowl`. Front only; back stays the crew curve (house rule for every style).
- Flat equivalent: the front piece grows UPWARD at CF by the drape amount — the piece's
  top edge becomes a straight line from the shoulder neck point to a raised CF point,
  plus a grown-on self-facing extension (mirror of the top strip above that line). No
  separate facing piece: the `neckFacings` call is SKIPPED for Cowl (grown-on replaces
  it — halter-precedent exemption).
- Bust shaping: cowl forces the front UNSPLIT (frontPrincess = false) and drops the front
  dart, folding its value into the drape (source-backed); honest guide note names the
  approximation. Back keeps its princess seam/dart.
- Bias grainline marking (45 degrees) on the front piece for Woven; Knit keeps straight
  grain with an outside-bind guide option (Studio Faro).

### Geometry sketch (mm)
- drapeMM (CF added length) default 130, clamp 76–254 — inside Craftsy's neckline-depth
  and spread ranges; a single depth axis v1, no shallow/medium/deep enum (a named cm
  scale was not found in any source: TBD (needs source)).
- Top edge: line from (neckW, 0) to (0, −drapeMM) in the pre-shift frame; then the whole
  piece frame-shifts so local y = 0 is the raised CF point (halter frame-shift reuse).
- Self-facing: the strip between the top edge and top edge − 51 mirrored above the fold
  line (SewGuide 2 in), drawn as part of the outline with a fold-line marking.
- Shoulder edge gains length vs the back shoulder; the difference is EASED at sewing —
  guide step, and the validator must not fire on it (see below).

### Validator
- `facing` rule exempts Cowl (grown-on).
- Shoulder pair check (front vs back shoulder seam): Cowl front shoulder is INTENTIONALLY
  longer — the rule must allow up to drape-driven excess with a named ease note instead
  of failing (honest-skip inside the validator, asserted in the test). ASSUMPTION cap:
  excess ≤ 40 (render/fit test to tune).
- `kink` and self-intersection rules cover the folded-facing outline.
- Honest note: Cowl + Woven → "cut on true bias" step + fabric estimate note (SewGuide:
  bias needs ~2.5x — reflect in fabric meters with a conservative +0.4 m ASSUMPTION).

### Vision label
`neckline` gains `"cowl"` — soft horizontal draped folds hanging at the front neck; the
neckline has no fixed curve, it falls in a U of loose fabric.

### Tractability x value: 3 x 3 = 9
Geometry is easy (one raised edge + fold), but drape realism is fabric-dependent and the
result needs a physical test before trusting it; cowl sells, but below bardot/wrap.

### Test plan — tests/cowl_check.cpp
1. Other necklines byte-identical; cowl front is unsplit even under princess shaping.
2. CF raised by drapeMM (clamps honored at 76/254); top edge straight to the shoulder
   point; fold-line marking present.
3. No separate front/back neck facing pieces for cowl; validator zero issues (facing rule
   exempt, shoulder ease allowed and ≤ 40).
4. Bias grainline marking present on woven, absent on knit.
5. Printable; outline self-intersection free with the grown-on facing.
6. Guide contains bias-cut step (woven) and the dart-into-drape approximation note.

Sources: https://www.craftsy.com/post/how-to-make-a-cowl-neckline/ ·
https://sewguide.com/cowl-neck-top-pattern/ ·
https://pattern-making.com/high-cowl-neck-single-drape/ ·
https://www.studiofaro.com/cowl-drape-dress/ ·
https://www.studiofaro.com/asymmetric-cowl-drape/

---

## 7. Asymmetric / high-low hem

### Construction (sources)
Standard high-low: SHORT point at center front, LONG point at center back (This Blog Is
Not For You; Shwin & Shwin). Subtle version: front raised 51 mm (2 in) at the fold edge,
back lowered 51+ mm, squared off at the fold edges and curved to the side-seam corner
(Shwin & Shwin — the author goes lower in back than high in front). Dramatic version on a
knee-length dress: shorten front ≥ 200 mm, lengthen back 200–250 mm (This Blog Is Not For
You). The transition must be a smooth S-curve, never a straight diagonal, sloping down
steeply only after the middle of the front piece; **side seams must stay the same length
front and back**. Hem the curve with bias strips (Shwin & Shwin; Georgette: bias tape
with 0 hem allowance) or a narrow double-fold hem.

### Engine mapping
- `GarmentSpec.hemStyle` enum { Straight (default), HighLow } — opt-in axis on the skirt
  (standalone Skirt and Dress skirts).
- v1 scope: ALine + Straight skirts only (quarter panels with drawable hems).
  Gathered/Pleated (rectangles feeding gathers) and HalfCircle → honest skip note
  ("high-low on this style is a v2 drape") — never silent.
- Implementation as a hem reshape inside `skirt.cpp` piece building (NOT a post-pass:
  gore panels' hems must reshape consistently across center/side panels, easiest at
  draft time where panel arcs are known). The shared side-seam hem point is the FIXED
  anchor; front hems rise toward CF, back hems drop toward CB with an S-cubic.
- Ruffle interaction: hem circumference for `ruffleHem` must be measured along the ACTUAL
  curved hem (flatten, 24 segments) — extend `hemCircumferenceMM` accordingly.

### Geometry sketch (mm)
- frontRiseMM default 60, clamp 0–200; backDropMM default 120, clamp 0–250 (source
  ranges: 51 subtle → 200/250 dramatic). Back default > front default per Shwin & Shwin's
  stated practice.
- Clamp rise ≤ 0.25 x skirt length so a mini never rises into indecency (ASSUMPTION).
- Hem curve per quarter: cubic from (sideX, hemY) to (0, hemY − rise) [front] with cp
  weights putting the steep slope in the inner half (source: steeper after the middle);
  mirrored logic with +drop for back. Squared (horizontal tangent) at CF/CB fold.
- Maxi + backDrop can approach floor: cap total back length at 900 + 250 and add a guide
  note about train-like backs (honest, not silent).

### Validator
- `pairedSeam` already enforces equal side seams — the anchor construction satisfies it
  by design; assert it explicitly (the sources call this the critical rule).
- `kink` (25 degrees) guards the S-curve blend at the side seam.
- New rule "hemslope": CB hem y − CF hem y == frontRise + backDrop within 2 mm on the
  assembled quarters.
- Ruffle length check must use the flattened curved hem (extend the existing ruffle test
  tolerance path).

### Vision label
New field `"hem": "even" | "highLow" | null` — highLow = the hem is visibly shorter at
the front than the back (or rises diagonally), e.g. mullet/waterfall skirts; even = one
level all around.

### Tractability x value: 4 x 3 = 12
Pure 2D hem geometry, all inside the skirt block; steady but not top-tier demand.

### Test plan — tests/highlow_check.cpp
1. hemStyle Straight byte-identical (matrix intact).
2. CF hem sits frontRise higher and CB hem backDrop lower than the side-seam hem (± 1).
3. Front/back side-seam lengths equal within existing pairedSeam 3.0; validator zero
   issues incl. the new hemslope rule.
4. Gathered/pleated/halfCircle + HighLow → unchanged pieces + honest skip note.
5. ruffleHem + HighLow: ruffle cut length == flattened curved hem x fullness within 2 mm.
6. Clamps: rise capped at 0.25 x length on a mini; kink rule green at the side blend.

Sources: https://thisblogisnotforyou.com/how-to-draft-your-own-asymmetrical-hem-dress-pattern/ ·
https://shwinandshwin.com/2019/08/how-to-make-a-hi-low-hem.html ·
https://weallsew.com/high-low-skirt-by-mimi-g-for-weallsew/ ·
https://www.georgettepatterns.com/products/high-low-skirt-pattern ·
https://itch-to-stitch.com/make-narrow-hem-curves/ ·
https://www.theshapesoffabric.com/2019/03/04/simple-skirt-pattern-alterations/

---

## 8. One-shoulder (asymmetric) neckline

### Construction (sources)
The full front/back is drafted — never on fold. Knit method (Scattered Thoughts of a
Crafty Mom): join the two halves into one full piece, raise the armscye on the BARE side
by 25 mm (1 in), then draw "a gently sloping line" from the kept-shoulder corner to the
raised armscye top — that line IS the neckline. Woven hack (Dream.Cut.Sew): the kept
shoulder stays completely standard; the diagonal is cut from its neckline edge down to a
line 51 mm (2 in) above the original underarm seamline; the angled edge, back neck and
vertical edge finished with one run of binding. Gown method (Sew DIY, after Armstrong):
darts transferred to the single shoulder and gathered into the strap; a grosgrain waist
stay helps the dress hang evenly; the invisible zipper moves to the SIDE seam. How far
below the armpit the low side sits: not found — the raised-armscye number stands in.

### Engine mapping
- `Neckline::OneShoulder`. Structural prerequisite: **a mirror utility** that reflects a
  half piece's commands across x = 0 and splices them into one full-width outline. This
  utility is shared with the wrap front (build once, use twice) — the reason these two
  ship together at the end.
- Front and back become FULL pieces, cut 1 each (no fold). CB closure moves to the side
  seam (source-backed) — the side zipper note enters the guide; skirt back keeps cut 2
  only in dress mode if we keep the CB zipper for the skirt: simpler v1 = side zipper
  through bodice + skirt, so the skirt front/back also draft full (skirt halves mirrored
  — same utility).
- The kept shoulder stays IDENTICAL to the base draft (Dream.Cut.Sew precedent); the
  bare side reuses the halter-back treatment: armhole top raised/cut to a stub 25 above
  the underarm, diagonal cubic from kept-shoulder neck point to that stub.
- Shaping: princess seams stay on BOTH halves of the full piece (mirror splices them);
  the diagonal only replaces the top edge.
- Edge finish: one "Bias binding (one-shoulder)" strip via the halterBinding generator,
  length = diagonal + back-neck + stub edges measured from geometry.

### Geometry sketch (mm)
- bareArmholeStubY = underarm y − 25 (source: armscye raised 1 in).
- Diagonal: cubic from (keptNeckX, keptNeckY) to (−frontChestWidth + stubInset,
  bareArmholeStubY) in full-piece coordinates (kept side +x, bare side −x); cp's keep the
  curve "gently sloping" — near-chord, sag ≤ 15 (proposed, render-tuned).
- Bust clearance: the diagonal must pass ≥ 30 above the bare-side apex — clamp by lifting
  the curve at the apex x (ASSUMPTION; no source figure).
- Full-piece width = 2 x half width; widest matrix body ≈ 2 x 260 = 520 → printable.

### Validator
- Waist/chest audit rules (`dartSum`, `chestWidth`, sewn-waist sums) currently assume
  HALF pieces: full pieces must report doubled audit targets — this is the expensive
  part; a per-piece "fullWidth" audit flag with target x2 (validator change, tested).
- `facing` exemption (binding instead); new rule "oneshoulder": binding strip == measured
  raw edges within 2; diagonal clears the bare apex by ≥ 30; bare stub 25 above underarm.
- Self-intersection + kink already cover the diagonal splice.
- Honest skip: sleeves on the bare side impossible → force sleeveless with note
  (halter precedent); v2 may allow one sleeve on the kept side.

### Vision label
`neckline` gains `"oneShoulder"` — the neckline runs diagonally from one covered shoulder
across the chest to under the opposite arm; one shoulder fully bare.

### Tractability x value: 2 x 4 = 8
The mirror utility + validator audit overhaul make it the structural heavy; strong
eveningwear value but below wrap in everyday demand.

### Test plan — tests/oneshoulder_check.cpp
1. Other necklines byte-identical; matrix intact.
2. Front/back are full pieces cut 1, symmetric except the top edge (mirror correctness:
   bare-side waist/side seam mirror the kept side within 0.1).
3. Kept-shoulder region commands identical to the Crew draft of the same body.
4. Diagonal clears the bare apex ≥ 30; stub sits 25 above the underarm (± 1).
5. Binding strip length matches measured edges within 2; validator zero issues with the
   doubled full-width audit targets.
6. Guide contains side-zipper step and the bare-side sleeve skip note.

Sources: https://www.scatteredthoughtsofacraftymom.com/how-to-make-a-one-shoulder-dress-free-pattern/ ·
https://www.dreamcutsew.com/pattern-hacking-burdastyle-113-11-2018-again/ ·
https://www.sewdiy.com/blog/2023/diy-one-shoulder-evening-gown ·
https://www.professorpincushion.com/forums/topic/drafting-a-draped-one-shoulder-gown-bodice-pattern/

---

## 9. Wrap / surplice front

### Construction (sources)
Trace the FULL front (cut two mirrored pieces, never on fold). Mark the wrap extension
~127 mm (5 in) beyond center front at the waist (Bethany Lynne; In the Folds' wrap skirt
extends 120 mm, "just over halfway between CF and the side seam"). Draw the diagonal
surplice line from 45 mm in from the shoulder high point (Ploen) down to the opposite
side at the waist, slightly CURVED so the neckline lies flat (Bethany Lynne). Dart
handling: rotate bust shaping toward the wrap edge or convert the shoulder dart to
gathers (Melly Sews); Ploen rotates the bust dart into the armscye first. Gape
prevention (Sure-Fit): pinch 13–19 mm out of the wrap edge at bust level, pivoting closed
at the apex; add a shoulder-tapering pinch and a waist-level redraw; insert narrow stay
tape on the diagonal (it is bias and stretches). Finish: 25 mm bias-tape neckline,
understitched (Bethany Lynne) or a 90 mm self facing (In the Folds). Ties 50 x 660 mm
into the side seam for a true wrap; Melly Sews' version is a FIXED faux-wrap closed with
a back zipper. Wrap-skirt overlap rule of thumb: TBD (needs source) — the 150 mm page
could not be verified (403).

### Engine mapping
- `GarmentSpec.wrapFront = false` (opt-in bool; combines with V-ish necklines only — the
  crossover forms its own V, so `neckline` is ignored with an honest note).
- v1 scope: **faux-wrap** (Melly Sews precedent): two mirrored full-front bodice pieces,
  basted at the waist, normal skirt, CB zipper — the skirt and closure stay untouched,
  which contains the blast radius. True wrap with ties + extended underwrap = v2.
- Requires the same **mirror utility** as one-shoulder (build there, reuse here).
- Front piece = full front + wrapExtensionMM beyond CF; wrap edge cubic from the
  45-in-from-HPS shoulder point down across to the opposite side waist; the 15 mm
  bust-level gape inset baked into the curve (flat equivalent of the pinch).
- New pieces: "Wrap front (left/right)" cut 1 each (mirrored), "Wrap edge facing" strip
  (90 wide, In the Folds) OR binding for knit (25, Bethany) — fabric-dependent, both via
  existing facing/strip machinery. Stay-tape guide step on the diagonal.
- Back bodice, skirt, facings-back: unchanged.

### Geometry sketch (mm)
- wrapExtensionMM default 125, clamp 80–160 (sources: 120 and 127).
- Shoulder start: 45 in from HPS along the shoulder seam (Ploen).
- Wrap edge: cubic (slightly curved, sag 10–20 toward the body) ending at the opposite
  side seam AT the waist y; gape inset 15 at the bust level (Sure-Fit 13–19 window).
- Diagonal clears the near apex by ≥ 25 (ASSUMPTION, render-tuned).
- Full front width = 2 x frontWidth + 125 ≈ 625 on a 900 bust → printable.

### Validator
- Waist accounting is the tricky rule: each front layer's sewn waist runs from its wrap
  edge to its side seam; the layers overlap 2 x extension across CF. Skirt/dress
  `waistJoin` target = back sewn waist + (front layer arc) x 2 − (overlap arc) x 2 —
  measured from geometry, tolerance 12 unchanged. Spelled out in the test with hand
  math on one body.
- Full-width audit flag (from one-shoulder) reused for chest/dart rules.
- New rule "wrap": wrap edge length equal on both mirrored fronts within 2; facing/binding
  strip matches the measured edge; gape inset present (edge shorter than the un-inset
  chord by 13–19 at bust level).
- Honest notes: neckline ignored; knit recommended for unlined faux-wrap (source-backed
  bias-stretch warning enters the guide as the stay-tape step).

### Vision label
New field `"frontWrap": true | false | null` — the front closes by one side crossing
diagonally over the other (surplice/wrap), forming a V where they cross; ties or a fixed
crossover both count.

### Tractability x value: 2 x 5 = 10
Highest garment value of the nine (wrap dresses are a permanent Etsy/Trendyol bestseller)
but the widest blast radius: mirror machinery, layered waist accounting, gape control.

### Test plan — tests/wrap_check.cpp
1. wrapFront=false byte-identical; matrix intact.
2. Two mirrored front pieces; wrap edges equal within 2; extension = 125 beyond CF (± 1).
3. Gape inset: wrap edge 13–19 shorter than its chord at bust level; apex clearance ≥ 25.
4. Waist accounting: skirt waist target == back + 2 x front-layer arc − 2 x overlap arc,
   validator zero issues on the dress.
5. Facing (woven) or binding (knit) piece matches the measured wrap edge within 2.
6. Guide: stay-tape step, baste-at-waist step, neckline-ignored note present.

Sources: https://surefitdesigns.com/blogs/news/wrap-it-up-crossover-surplice-bodice-front ·
https://www.bethanylynnemakes.com/how-to-make-a-wrap-front-dress/ ·
https://inthefolds.com/blog/2016/2/9/how-to-draft-a-wrap-skirt ·
https://inthefolds.com/q-a-series/2022/wrap-skirt-with-more-coverage ·
https://ploenpatterns.com/blogs/news/how-to-draft-a-wrap-blouse-step-by-step-pattern-making-tutorial ·
https://mellysews.com/sewing-a-wrap-front-dress-with-a-train/

---

## Recommended implementation order

PLAN.md item 5 lists the batch as "off-shoulder / one-shoulder / cowl, flutter / cap /
bell, peplum, wrap / surplice, asymmetric hem" — necklines first, no internal ranking.
Proposed order re-ranks by tractability x value AND machinery batching (warm files,
shared utilities amortized):

1. **Cap sleeve (15)** — smallest full loop, one file, proves the style-aware capEase
   validator change that bell/flutter also need.
2. **Bell sleeve (16)** — same file while it is warm, balloon precedent, zero validator
   novelty beyond cap's.
3. **Peplum (16)** — highest reuse of existing machinery (annulus panels + waist join);
   first non-sleeve value hit.
4. **Flutter sleeve (12)** — annulus math fresh from peplum; introduces the one new
   sleeve-side validator rule.
5. **Off-shoulder (15)** — highest-value neckline of the nine; halter frame shift +
   princess armhole split already exist, so the risk is guide-side (elastic), not
   geometry-side.
6. **Cowl (9)** — small geometry, but park it after off-shoulder: both touch the facing
   exemption path, and cowl's drape needs a physical fabric sanity check before trusting
   the flat approximation.
7. **Asymmetric hem (12)** — independent skirt work, good palate cleanser before the
   heavy pair; also upgrades `hemCircumferenceMM` to curved hems, which ruffles need
   anyway.
8. **One-shoulder (8)** — builds the mirror utility + full-width validator audit ONCE,
   scoped to the simpler asymmetric garment.
9. **Wrap / surplice (10)** — the biggest value, shipped LAST on purpose: it consumes the
   mirror utility and full-width audit from one-shoulder and adds only the layered waist
   accounting and gape control on top. Doing wrap first would mean building all three
   hard parts in one feature.

Difference vs PLAN.md's listing order: sleeves and peplum move ahead of the necklines
(strictly cheaper loops, immediate vocabulary wins that keep the matrix cadence), and the
two fold-breaking features (one-shoulder, wrap) move to the end as a deliberate pair so
the mirror machinery is paid for once. Off-shoulder stays high because it inherits the
halter skeleton nearly for free.
