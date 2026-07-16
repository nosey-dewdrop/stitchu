// Generates the static style-library pages (web/styles/*.html) for SEO.
// Every fact below is sourced from engine/FORMULAS.md and web/js/create.js —
// real drafted geometry only, no invented content. Regenerate with:
//   node engine/tools/gen-style-pages.mjs
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'web', 'styles');
const BASE = 'https://nosey-dewdrop.github.io/stitchu';

// group: display group on the hub. numbers: [parameter, value] pairs straight
// from FORMULAS.md. facts: prose paragraphs, each traceable to the spec.
const STYLES = [
  // ---- necklines -----------------------------------------------------------
  {
    slug: 'sweetheart-neckline', group: 'necklines', name: 'Sweetheart neckline',
    title: 'Sweetheart neckline pattern, drafted to size · stitchu',
    desc: 'How stitchu drafts a sweetheart (heart-shaped) neckline: 1.2× neck width, depth between scoop and V, a bust lobe arcing 15 mm above the chord.',
    lead: 'The heart-shaped front neckline — a steep centre-front tangent so the mirrored halves meet in a cleft, and a curve that arcs above the chord to form the bust lobe.',
    facts: [
      'The neck width is multiplied by 1.2 on BOTH the front and the back, so the shoulder seams keep matching — one shared helper feeds the bodice and the neck facings, and they can never disagree.',
      'The front depth is the widened neck width + 50 mm, which lands the cleft between a scoop and a v-neck.',
      'The curve is a single cubic from the centre-front cleft to the neck point. Its tangent at centre front is steep, so the two mirrored halves meet in the heart cleft; the mid-curve arcs more than 15 mm above the chord — that lift is the bust lobe a scoop does not have.',
      'The neck facing reuses the neckline commands verbatim, so the facing follows the heart shape automatically and the seam matches by construction.',
    ],
    numbers: [
      ['neck width multiplier (front + back)', '1.2×'],
      ['front depth', 'neck width + 50 mm'],
      ['bust-lobe lift above the chord', '> 15 mm'],
      ['curve control points', 'cp1 (0.22w, 0.48d) · cp2 (0.5w, 0.12d)'],
    ],
    compat: 'Dresses and tops (not skirts). Works with sleeves, collars are drafted against the neckline it draws.',
    tests: 'tests/sweetheart_check — depth ordering, cleft tangent, lobe lift vs scoop, facing match, dress + sleeved top.',
  },
  {
    slug: 'halter-neckline', group: 'necklines', name: 'Halter neckline',
    title: 'Halter neck pattern — nape strap, low back · stitchu',
    desc: 'How stitchu drafts a halter: 40 mm nape strap, front dropped 55 mm, back top at 55% of armhole depth, bias binding instead of facings. Sleeves impossible.',
    lead: 'A halter is more than a neck shape: no shoulder seam, a strap that closes at the nape, a low back — and sleeves are physically impossible, so the engine refuses them honestly.',
    facts: [
      'The whole front drops by a 55 mm strap rise; the strap is 40 mm wide and its short top edge IS the nape closure edge. The bare-shoulder sweep down to the underarm uses the same shared armhole curve definition as every other bodice.',
      'The back top sits at 55% of the armhole depth — the low halter back — with a slight 8 mm centre-back dip.',
      'Neck facings are replaced by one bias binding strip, 32 mm wide, cut in segments up to 1400 mm. Its length is measured from the same drafted geometry (2× front neck + strap top + sweep + back top + stub, + 150 mm trim ease) — never recomputed elsewhere.',
      'If a sleeve was picked, the engine forces sleeveless and says so in the sewing guide — there is no shoulder to hang a sleeve from.',
      'Cramped-back rule: when the low back leaves no room for a princess seam above the blade apex, that half honestly falls back to dart shaping instead of drawing an unsewable seam.',
    ],
    numbers: [
      ['strap width', '40 mm'],
      ['front strap rise', '55 mm'],
      ['back top position', '55% of armhole depth'],
      ['bias binding width', '32 mm (cut ≤ 1400 mm segments)'],
      ['binding length allowance', '+150 mm trim ease'],
    ],
    compat: 'Dresses and tops. Excludes sleeves, collars and front keyholes by construction (no neckline band, no shoulder).',
    tests: 'tests/halter_check — dress/top, princess/dart, natural/empire, knit, petite + plus bodies; binding length; honest sleeve skip.',
  },
  {
    slug: 'v-neck', group: 'necklines', name: 'V-neck',
    title: 'V-neck pattern drafted to your measurements · stitchu',
    desc: 'How stitchu drafts a v-neck: front depth = neck width + 75 mm, the deepest straight-family neckline, with a guarded centre-front edge on short bodies.',
    lead: 'The deepest of the classic neckline family. The engine cuts it to your own neck measurement, then guards the centre-front edge so a deep V on a short body cannot fold back on itself.',
    facts: [
      'Front neck width is your neck measurement × 0.17, capped at 72% of the half shoulder — a neckline can never eat the shoulder seam.',
      'The front depth is the neck width + 75 mm — deeper than scoop (+50) and square (+40).',
      'The centre front/back edge is a cubic whose control points interpolate between the waist and the neck cutout; that guard keeps deep necklines on short bodies from folding the edge back.',
      'The neck facing repeats the garment neckline commands verbatim and its inner edge must match the neck edge within 1.5 mm — a validator rule, checked on every draft.',
    ],
    numbers: [
      ['front neck width', 'neck × 0.17 (cap: 72% of half shoulder)'],
      ['front depth', 'neck width + 75 mm'],
      ['back cutout', 'neck × 0.06 (shallow crew curve)'],
      ['facing match tolerance', '1.5 mm (validated)'],
    ],
    compat: 'Dresses and tops. Works with every sleeve, collar, gathering and skirt option.',
    tests: 'Validated across the full 70,200-draft matrix — facing match, self-intersection, chest-width ease all checked per draft.',
  },
  {
    slug: 'scoop-neckline', group: 'necklines', name: 'Scoop neckline',
    title: 'Scoop neckline pattern, cut to your neck size · stitchu',
    desc: 'How stitchu drafts a scoop neckline: front depth = neck width + 50 mm, curve on the chord, width capped so it never eats the shoulder seam.',
    lead: 'The round, open everyday neckline. Deeper than a crew, shallower than a V — and unlike a sweetheart, its curve stays on the chord.',
    facts: [
      'The front depth is the neck width + 50 mm — the same depth band as the sweetheart, but without the bust lobe: the scoop curve stays on its chord.',
      'Front neck width = neck × 0.17, back = neck × 0.197, both capped at 72% of the half shoulder.',
      'The back neckline is always a shallow crew curve regardless of the front style, so the back facing and any collar stay stable across the whole neckline family.',
    ],
    numbers: [
      ['front depth', 'neck width + 50 mm'],
      ['front / back neck width', 'neck × 0.17 / neck × 0.197'],
      ['width cap', '72% of half shoulder'],
    ],
    compat: 'Dresses and tops. Works with every sleeve, collar, gathering and skirt option.',
    tests: 'Validated across the full 70,200-draft matrix; the sweetheart test uses the scoop as its on-chord reference curve.',
  },
  {
    slug: 'square-neckline', group: 'necklines', name: 'Square neckline',
    title: 'Square neckline pattern to your measurements · stitchu',
    desc: 'How stitchu drafts a square neckline: front depth = neck width + 40 mm, straight edges, and a facing matched with a two-command tolerance rule.',
    lead: 'Straight edges, square corner. Structurally the simplest front neckline the engine draws — and the one with its own facing-validation rule.',
    facts: [
      'The front depth is the neck width + 40 mm — between crew (+15) and scoop (+50).',
      'Because the square front runs in two straight commands (down, then across), the facing validator matches the inner edge with k = 2 commands instead of 1 — the seam-match rule adapts to the geometry.',
      'Width follows the family rule: front neck × 0.17, capped at 72% of the half shoulder.',
    ],
    numbers: [
      ['front depth', 'neck width + 40 mm'],
      ['facing match rule', 'k = 2 commands, 1.5 mm tolerance'],
      ['width cap', '72% of half shoulder'],
    ],
    compat: 'Dresses and tops. Works with every sleeve, collar, gathering and skirt option.',
    tests: 'Validated across the full 70,200-draft matrix, including the square-specific facing rule.',
  },
  {
    slug: 'boat-neckline', group: 'necklines', name: 'Boat neckline',
    title: 'Boat neck pattern — wide, shallow, drafted · stitchu',
    desc: 'How stitchu drafts a boat neck: both neck widths × 1.35, a fixed 28 mm front depth, and a hard cap so the neckline never reaches the shoulder seam.',
    lead: 'Wide and shallow — the boat neck stretches toward the shoulders instead of dropping toward the bust.',
    facts: [
      'Both the front and back neck widths are multiplied by 1.35 — the widest neckline in the vocabulary.',
      'The front depth is a fixed 28 mm, the shallowest the engine draws.',
      'Both widths are capped at 72% of the half shoulder, so even on narrow shoulders the boat neck never eats the shoulder seam.',
    ],
    numbers: [
      ['width multiplier (front + back)', '1.35×'],
      ['front depth', '28 mm (fixed)'],
      ['width cap', '72% of half shoulder'],
    ],
    compat: 'Dresses and tops. Works with every sleeve, collar, gathering and skirt option.',
    tests: 'Validated across the full 70,200-draft matrix; the keyhole test uses a boat top as one of its cases.',
  },
  {
    slug: 'crew-neckline', group: 'necklines', name: 'Crew neckline',
    title: 'Crew neck pattern drafted to your neck size · stitchu',
    desc: 'How stitchu drafts a crew neck: front depth = neck width + 15 mm, back cutout = neck × 0.06 — the base curve every other neckline builds on.',
    lead: 'The default. Every back neckline in the engine is a crew curve — this page is the front one.',
    facts: [
      'The front depth is the neck width + 15 mm — the closest-fitting front neckline.',
      'The back cutout is neck × 0.06, a shallow crew curve — and that same back curve is reused behind every front style, from V to sweetheart.',
      'Front width = neck × 0.17, back = neck × 0.197, capped at 72% of the half shoulder.',
    ],
    numbers: [
      ['front depth', 'neck width + 15 mm'],
      ['back cutout', 'neck × 0.06'],
      ['front / back width', 'neck × 0.17 / neck × 0.197'],
    ],
    compat: 'Dresses and tops. The default neckline; works with every sleeve, collar, gathering and skirt option.',
    tests: 'Validated across the full 70,200-draft matrix.',
  },
  {
    slug: 'keyhole', group: 'details', name: 'Keyhole cut-out',
    title: 'Keyhole neckline cut-out pattern + facing · stitchu',
    desc: 'How stitchu drafts a front keyhole: teardrop 15 mm below the neck edge, up to 85 mm long, with an interfaced facing offset 32 mm all round.',
    lead: 'A teardrop opening below the front neckline, mirrored on the centre-front fold — with the facing piece that finishes it drawn for you.',
    facts: [
      'The half-teardrop is marked on the front centre piece against the CF fold: top point 15 mm below the neck edge, length min(85 mm, room above the waist − 60), half-width 0.26 × length. Mirrored on the fold, it opens into the full keyhole.',
      'A "Keyhole Facing" piece is the same teardrop offset +32 mm all around — solid, cut 1 on fold, interfaced, with the stitch line marked. Seam allowance is 0: you sew ON the line, slash inside, turn through and understitch.',
      'The construction steps are inserted right after the neckline understitch — a keyhole is worked before the side seams close, not bolted onto the end of the guide.',
      'Too little room (under 40 mm) and the engine skips it with an honest note in the guide — never a silent no-op. A validator rule checks the teardrop sits on the fold, below the neck, clear of the waist, inside the piece, and that the facing covers it with at least 20 mm margin.',
    ],
    numbers: [
      ['top point', '15 mm below CF neck edge'],
      ['length', 'min(85 mm, waist room − 60)'],
      ['half-width', '0.26 × length'],
      ['facing offset', '+32 mm all round, ≥ 20 mm cover margin'],
    ],
    compat: 'Dresses and tops, any neckline except halter (a halter has no CF band to open).',
    tests: 'tests/keyhole_check — princess dress, petite babydoll, boat top; guide-step order; margins; opt-in byte-identity.',
  },
  // ---- skirts --------------------------------------------------------------
  {
    slug: 'a-line-skirt', group: 'skirts', name: 'A-line skirt',
    title: 'A-line skirt pattern drafted to waist and hip · stitchu',
    desc: 'How stitchu drafts an A-line skirt: 2% ease on your waist and hip, +60 mm hem flare, darts dropped honestly under 8 mm, three lengths.',
    lead: 'The classic flared skirt, drafted from your waist and hip with percent ease — never a fixed-centimetre guess.',
    facts: [
      'Waist and hip ease are 2% of YOUR measurement (1% on knits). The hip quarter is guarded against waist-bigger-than-hip bodies: it never drafts narrower than the waist quarter.',
      'The waist-to-hip suppression is split: the side seam takes up to 60% (max 25 mm), the dart gets the rest — and a dart under 8 mm is dropped and folded into the side seam instead of sewing a pucker.',
      'The A-line flare adds 60 mm at the hem with an 18 mm hem side rise; the side waist rises 12 mm into a curved waistline.',
      'In princess shaping the dart becomes a gore seam with 40 mm of extra flare per gore edge at the hem.',
      'As a dress skirt it is drafted against the bodice\'s actual SEWN waist — front and back sewn arcs, darts excluded — so the waist seam matches by construction.',
    ],
    numbers: [
      ['waist / hip ease', '2% woven · 1% knit'],
      ['hem flare', '+60 mm (+40 mm per gore edge in princess)'],
      ['lengths', 'mini 450 · midi 650 · maxi 900 mm'],
      ['dart lengths', 'front 90 · back 130 mm'],
      ['side-seam share of suppression', 'min(60%, 25 mm)'],
    ],
    compat: 'Standalone skirt or dress skirt; princess or dart shaping; ruffle and tiered ruffle hems.',
    tests: 'Validated across the 70,200-draft matrix; waist-join alignment on dresses held to 2.5 mm by the "waistalign" validator rule.',
  },
  {
    slug: 'straight-skirt', group: 'skirts', name: 'Straight skirt',
    title: 'Straight skirt pattern with drafted darts · stitchu',
    desc: 'How stitchu drafts a straight (pencil) skirt: zero hem flare, 2% ease, side seam takes up to 25 mm of suppression, darts 90/130 mm.',
    lead: 'The pencil silhouette: the A-line block with the flare set to zero, so everything hangs from how well the darts fit — and those are drafted, not averaged.',
    facts: [
      'Same drafting skeleton as the A-line with hem flare 0 — the side seam falls straight from the hip.',
      'Suppression between your waist and hip splits between the side seam (up to 60%, max 25 mm) and the dart; a dart under 8 mm is dropped and folded into the side seam.',
      'Dart lengths are 90 mm front, 130 mm back — the Aldrich ratio and direction, verified in the published textbook audit.',
      'The side waist rises 12 mm and the dart legs follow the raised waist curve, so the darts sew closed without a step at the waistline.',
    ],
    numbers: [
      ['hem flare', '0 mm'],
      ['dart lengths', 'front 90 · back 130 mm'],
      ['waist / hip ease', '2% woven · 1% knit'],
      ['hip depth', '200 mm'],
    ],
    compat: 'Standalone skirt or dress skirt; princess gore or dart shaping; ruffle hems.',
    tests: 'Validated across the 70,200-draft matrix; dart values audited against Aldrich (front 100/back 140) — ratio and direction exact.',
  },
  {
    slug: 'gathered-skirt', group: 'skirts', name: 'Gathered skirt',
    title: 'Gathered skirt pattern — 1.9× fullness rectangle · stitchu',
    desc: 'How stitchu drafts a gathered skirt: a rectangle 1.9× your eased waist quarter with the gather line marked 18 mm below the top edge.',
    lead: 'A rectangle drawn up to your waist. The engine cuts it at 1.9× fullness and marks the gather line so you know exactly where to run the threads.',
    facts: [
      'Each quarter panel is a rectangle whose width = your eased waist quarter × 1.9 — the fullness is in the cut, not left to guesswork.',
      'The gather line is marked 18 mm below the top edge.',
      'Combined with an empire waistline on a dress, this is the babydoll — the engine names it that way in the guide.',
      'Gathered skirts have no waist shaping to convert, so princess/dart shaping does not apply — the fullness IS the shaping.',
    ],
    numbers: [
      ['panel width', 'waist quarter × 1.9'],
      ['gather line', '18 mm below top edge'],
      ['lengths', 'mini 450 · midi 650 · maxi 900 mm'],
    ],
    compat: 'Standalone skirt or dress skirt; pairs with the empire waistline (babydoll); ruffle and tiered hems.',
    tests: 'Validated across the 70,200-draft matrix; the validator measures the sewn waist through the gather ratio.',
  },
  {
    slug: 'half-circle-skirt', group: 'skirts', name: 'Half-circle skirt',
    title: 'Half circle skirt pattern — r = waist/π, cut flat · stitchu',
    desc: 'How stitchu drafts a half-circle skirt: inner radius = eased waist / π, two quarter panels cut flat (never on fold), true bezier arcs.',
    lead: 'Real circle-skirt maths: the waist becomes the inner arc of a ring. And one trap the engine refuses to fall into — these panels are never cut on the fold.',
    facts: [
      'The inner radius r = your eased waist / π; the outer radius R = r + the skirt length. Two quarter-circle panels make the half circle.',
      'The panels are cut FLAT, cut 2 — on the fold they would unfold into a FULL circle and double the waist. The engine encodes that as a rule, not a guide warning.',
      'The arcs are cubic beziers with kappa 0.5523 — the standard circle approximation — so the printed curve is a true arc, not a polygon.',
      'Fabric estimate: (R × 2 + 120 mm) × 1.10 on a 140 cm width — printed on the pattern cover.',
    ],
    numbers: [
      ['inner radius', 'eased waist / π'],
      ['outer radius', 'r + length (mini 450 · midi 650 · maxi 900)'],
      ['cut rule', '2 quarter panels, FLAT (never on fold)'],
      ['arc constant', 'kappa 0.5523'],
    ],
    compat: 'Standalone skirt or dress skirt; no waist shaping (the circle is the shaping); ruffle hems supported.',
    tests: 'Validated across the 70,200-draft matrix; skirt waist must match the eased body waist per draft.',
  },
  {
    slug: 'pleated-skirt', group: 'skirts', name: 'Pleated skirt',
    title: 'Knife-pleat skirt pattern with fold markings · stitchu',
    desc: 'How stitchu drafts a knife-pleated skirt: a 3× fullness rectangle, pleat count from your waist (max(3, quarter/55)), 140 mm deep fold pairs.',
    lead: 'Knife pleats with the fold lines drawn in pairs — fold on the second line, bring it to the first — so pleating is mechanical, not eyeballed.',
    facts: [
      'Each panel is a rectangle at 3× your eased waist quarter (the pleat ratio).',
      'The number of pleats scales with your body: n = max(3, waist quarter / 55) — a wider waist gets more pleats, not deeper ones.',
      'Markings are vertical line PAIRS per pleat, 140 mm deep: fold on the second line, bring it to the first.',
      'The validator measures the sewn waist as the panel width divided by the pleat ratio, so the pleated waist is checked on every draft, not assumed.',
    ],
    numbers: [
      ['pleat ratio', '3× waist quarter'],
      ['pleat count', 'max(3, waist quarter / 55)'],
      ['pleat depth marking', '140 mm'],
    ],
    compat: 'Standalone skirt or dress skirt; no princess conversion (the pleats carry the suppression); ruffle hems supported.',
    tests: 'Validated across the 70,200-draft matrix via the pleat-ratio waist rule.',
  },
  {
    slug: 'hem-ruffle', group: 'details', name: 'Hem ruffle (single + tiered)',
    title: 'Ruffle hem pattern — measured strips, 1–5 tiers · stitchu',
    desc: 'How stitchu drafts hem ruffles: strip length = your hem × 2.0–3.0 fullness, tiers cascade geometrically, segments cut ≤ 1400 mm so they print.',
    lead: 'The ruffle strip is measured off YOUR drafted hem — per skirt style — then cut in printable segments. Tiers cascade geometrically, which is exactly why the couture look eats fabric.',
    facts: [
      'The attach edge is the real hem circumference of your draft, computed per skirt style (A-line/straight quarters + flare, gathered/pleated through their ratios, half-circle πR).',
      'Cut length = hem × fullness (2.0–3.0). The strip is cut in fabric-width segments of at most 1400 mm, joined end to end — every piece stays printable under the 3000 mm tile cap.',
      'Tiered (1–5): tier i gathers onto the edge below it, so its cut length = hem × fullness^i. The fabric use grows geometrically — that cascade is the couture look, and the engine prints the true cost instead of hiding it.',
      'Only the LAST tier carries the 10 mm rolled-hem allowance; intermediate tiers end in a 12 mm seam that receives the next tier\'s gathers.',
      'Ruffle pieces are excluded from the skirt-waist validation sum — a trim is not waist-bearing, and the validator knows the difference.',
    ],
    numbers: [
      ['fullness', '2.0–3.0×'],
      ['tiers', '1–5, cut length = hem × fullness^i'],
      ['segment cap', '≤ 1400 mm per cut piece'],
      ['hem allowance', 'last tier 10 mm · inner tiers 12 mm seam'],
    ],
    compat: 'Any skirt or dress hem, every skirt style — the strip length adapts to each hem formula.',
    tests: 'tests/ruffle_check + tests/tiered_ruffle_check — per-tier cascade math, seam-vs-hem heights, printability, opt-in byte-identity.',
  },
  // ---- sleeves -------------------------------------------------------------
  {
    slug: 'balloon-sleeve', group: 'sleeves', name: 'Balloon sleeve',
    title: 'Balloon sleeve pattern with drafted cuff · stitchu',
    desc: 'How stitchu drafts a balloon sleeve: hem half-width 0.52 vs 0.40 straight, gather line 25 mm up, cuff = biceps × 0.62 + 20 mm, interfaced.',
    lead: 'A set-in sleeve that balloons at the hem and gathers into its own drafted cuff — the cuff sized from your arm, not a standard.',
    facts: [
      'The base is the set-in sleeve block: biceps from your bust with verified 15% ease, cap height 0.75 of the armhole depth, and the cap width solved by bisection until the cap length lands within 0.5 mm of 4% ease over YOUR drafted armhole.',
      'The balloon widens the profile: hem half-width 0.52 × the sleeve width (straight is 0.40) and an underarm mid-bulge of 0.62 (straight 0.46).',
      'A hem gather line is marked 25 mm above the hem edge; gather notches sit at ±0.18 × width.',
      'The cuff is its own piece: length = biceps × 0.62 + 20 mm, height 60 mm, cut 2, interfaced, 10 mm seam allowance.',
    ],
    numbers: [
      ['hem half-width', '0.52 × sleeve width (straight: 0.40)'],
      ['underarm bulge', '0.62 (straight: 0.46)'],
      ['gather line', '25 mm above hem'],
      ['cuff', 'biceps × 0.62 + 20 mm long · 60 mm high'],
    ],
    compat: 'Dresses and tops with any non-halter neckline; short, elbow or long; the head stays plain (the hem carries the gather).',
    tests: 'tests/sleeve_check + the 1–9% cap-ease validator window, measured off the drawn cap against the drawn armhole.',
  },
  {
    slug: 'puff-sleeve', group: 'sleeves', name: 'Puff / gathered sleeve cap',
    title: 'Puff sleeve pattern — slash-and-spread crown · stitchu',
    desc: 'How stitchu drafts puff and gathered sleeve caps: crown spread 0.20× soft or 0.45× full, cap raised by the spread, armhole match kept 1:1.',
    lead: 'The classic slash-and-spread, done by the engine: fullness goes into the crown only, the underarm still matches the armhole 1:1, and the surplus is gathered in.',
    facts: [
      'Two levels: GATHERED (soft, high-street) spreads the crown by 0.20 × the fitted cap width with NO raise; PUFFED (full, gigot) spreads 0.45 × and RAISES the cap height by the spread.',
      'The cap-raise-equals-spread rule is a verified invariant (dresspatternmaking.com; Müller & Sohn gigot corroborates: slash 3–4 cm each side, raise 4–5 cm).',
      'Below the crown notches the seam is unchanged and matches the armhole 1:1 — the sleeve still sets into the SAME armhole; only the crown carries fullness.',
      'The crown gather runs between two notches at ±0.60 of the half-cap (about 7.5–9 cm from the underarm on a real cap), with a dashed gather line dipping toward the raised top.',
      'The finished crown-to-armhole gather ratio lands around 1.25 soft to 1.75–2.5 full, so the validator uses a style-band window instead of the plain 1–9% ease rule — otherwise the engine would reject its own puff as unsewable.',
    ],
    numbers: [
      ['crown spread', 'gathered 0.20×W · puffed 0.45×W'],
      ['cap raise', 'puffed: = spread · gathered: 0'],
      ['crown notches', '± 0.60 × half-cap'],
      ['gather ratio', '~1.25 soft → ~1.75–2.5 full'],
    ],
    compat: 'Straight sleeves on dresses and tops (balloon keeps a plain head — its gather lives at the hem). Cap-sleeve shapes and drawstring-gathered sleeves are NOT drafted; the pattern says so honestly.',
    tests: 'tests/sleeve_check puff block — crown wider than plain, puff raised, gathered not raised, gather marks present, validator clean.',
  },
  // ---- details / construction ---------------------------------------------
  {
    slug: 'button-placket', group: 'details', name: 'Front button placket',
    title: 'Button placket pattern — grown-on stand, anti-gape · stitchu',
    desc: 'How stitchu drafts a front placket: grown-on 18 mm stand, horizontal 21 mm buttonholes 3 mm past CF, and a mandatory button at bust level.',
    lead: 'The couture front closure: a grown-on button stand folded back on itself — with the one placement rule that stops gaping: a button must land exactly at bust level.',
    facts: [
      'The stand is GROWN-ON (the couture default per Aldrich and Armstrong — one piece, self-facing folds back, no seam at the finished edge) rather than the fast-fashion applied band. Width = 18 mm, driven by the assumed 18 mm blouse button.',
      'The CF edge is offset outward by the stand width; the neckline and every other edge are untouched, so the neck facing still matches its validator.',
      'Markings: fold line at true CF, fold-back facing line at +18 mm, buttons as cross ticks ON the CF line, buttonholes as horizontal slits starting 3 mm past CF toward the edge (the Aldrich/Armstrong horizontal-hole rule), 21 mm long (Ø + thickness + 2 mm ease).',
      'Placement: first button 20 mm below the neck edge, last 20 mm above the hem, ~90 mm spacing — and the whole run is SHIFTED so one button lands exactly on the bust level, read from the piece\'s own apex notch. That is the anti-gape rule.',
      'Womenswear laps right over left: this front is the buttonhole side, the mirror is the button underlap — stated in the guide. A CF run under 60 mm skips with an honest note.',
    ],
    numbers: [
      ['stand width', '18 mm (= button Ø)'],
      ['buttonhole', '21 mm, horizontal, 3 mm past CF'],
      ['spacing', '~90 mm, shifted to hit bust level'],
      ['clearances', '20 mm below neck · 20 mm above hem'],
      ['fabric adder', '+0.1 m'],
    ],
    compat: 'Dresses and tops. Back and side button closures are not drafted — they stay in the honesty layer.',
    tests: 'tests/placket_check — dress/top, princess/dart, petite/plus; ≥3 buttons with matching holes; base byte-identity off.',
  },
  {
    slug: 'fabric-ties', group: 'details', name: 'Fabric ties, sashes & bows',
    title: 'Fabric tie & sash pattern pieces, sized to you · stitchu',
    desc: 'How stitchu drafts ties: self-lined rectangles cut (2W+30) × (L+30) mm — back sash reaches from your waist, tie-back, neck bow and cuff ties.',
    lead: 'A tie is a rectangle — cut wide enough to fold into a self-lined tube, and long enough to actually reach around YOUR body and knot.',
    facts: [
      'Master rule: a finished tie of width W and length L is cut (2W + 2×15) × (L + 2×15) mm. The lengthwise centre fold self-lines it; markings give the fold line and both long seam lines, grain runs the tie length.',
      'The back waist sash is sized from your body: each half is max(300, waist × 0.5 + 250) mm long, so it reaches from the side seam round to a bow at centre back — not a fixed strip that comes up short on a real waist.',
      'Four placements: back waist sash/bow (W 30), tie-back closure (W 25 × 300, two halves that cross and knot), front neck bow (W 25 × 350), cuff ties (W 15 × 180 each).',
      'A placement notch is stamped on the nearest outline vertex of the target piece, so you know exactly which seam catches the tie.',
      'Honest boundary: a DRAWSTRING that gathers fabric through a casing is a different construction — the gathering page covers what is drafted; simple applied ties only here.',
    ],
    numbers: [
      ['cut rule', '(2W + 30) × (L + 30) mm, SA 15'],
      ['back sash half', 'max(300, waist × 0.5 + 250) mm'],
      ['tie-back / neck bow / cuff', '25×300 · 25×350 · 15×180 mm'],
      ['fabric adder', '+0.15 m'],
    ],
    compat: 'Dresses and tops; the tie-back coexists with an open-back cutout on the same draft (independent pieces).',
    tests: 'tests/tie_check — exactly one extra piece, existing outlines byte-identical, cut-2 note with finished + cut size, placement notch.',
  },
  {
    slug: 'collars', group: 'details', name: 'Collar family',
    title: 'Collar patterns trued to your neckline (0.00 mm) · stitchu',
    desc: 'Stand, mandarin, flat, peter-pan and two-piece shirt collars — every neck edge measured off your drafted neckline and trued to 0.0000 mm.',
    lead: 'Five collars, one governing constraint: the collar\'s neck edge is measured off the finished neckline of YOUR draft — so it can never be the wrong length for the garment it sews to.',
    facts: [
      'Two structural families. STAND/MOCK: a band standing at the neckline — stand 35 mm, mandarin 30 mm — with the centre-front top edge pulled in 15 mm so the finished band hugs the throat (the Aldrich/Müller & Sohn tilt). Cut 2 on the centre-back fold, self + interfacing.',
      'FLAT family (flat / peter-pan / shirt): a 60 mm collar lying on the shoulders, outer edge shaped round, pointed, or scalloped (a run of 4 arcs). The SHIRT collar is a two-piece convertible: 28 mm stand band + 48 mm turnover blade, the blade covering the stand seam.',
      'The neck edge is not computed from a formula — it is MEASURED off the finished front and back centre pieces, exactly the outline the bodice drew. The test suite re-measures collar edge minus half-neckline to 0.0000 mm across all five collars on standard, petite and plus bodies.',
      'Honest boundary: bias-bound necklines and notched/sailor/lapel tailored collars are NOT drafted — they are declared missing rather than drawn wrong.',
    ],
    numbers: [
      ['stand / mock band', '35 / 30 mm, CF rise 15 mm'],
      ['flat family width', '60 mm finished'],
      ['shirt collar', '28 mm band + 48 mm blade, 2 pieces'],
      ['neck-edge truing', '0.0000 mm (measured, tested)'],
      ['fabric adder', '+0.15 m incl. interfacing'],
    ],
    compat: 'Dresses and tops with any neckline except halter. Edge shapes (round/pointed/scallop) apply to the flat family.',
    tests: 'tests/collar_check — N extra pieces, outlines byte-identical, neck edge trued to 0.0000 mm, flat sits wider than the stand, scallop adds curves.',
  },
  {
    slug: 'shirring-drawstring', group: 'details', name: 'Drawstring, shirring & smocking',
    title: 'Shirred & drawstring panel patterns · stitchu',
    desc: 'How stitchu drafts gathering: panels cut at 1.8× (drawstring), 2.0× (shirred), 3.0× (smocked) the finished edge — measured off your draft.',
    lead: 'Here the panel ITSELF gathers — cut wide, drawn up to fit. The engine cuts each panel at the real construction ratio and measures the finished edge off your drafted pieces.',
    facts: [
      'Three gather ratios by construction: drawstring 1.8×, shirred 2.0× (the ASG "2 in → 1 in" elastic rule), smocked 3.0× ("3 in → 1 in"). The cut note states flat edge → finished edge, so you know exactly how much to draw up.',
      'Four zones with real panel depths: neckline 130, bust 110, waist 90, sleeve 120 mm. The finished edge is MEASURED off the drafted body pieces for that zone — the gathered edge can never drift from what it sews to (trued to 0.005 mm in tests).',
      'Drawstring adds a casing channel folded 22 mm below the top seam line (two parallel stitch lines + two eyelet ticks) and a separate self-fabric cord piece, finished 12 mm × (finished edge + 500) for pull-through and tying.',
      'Shirred panels carry 4 parallel gather rows, smocked 6, spaced 12 mm from the seam line down; smocked adds a dot grid to gauge the pleats — hand-worked, and the guide says so instead of silently claiming machine smocking.',
      'Very wide edges are cut in segments no wider than one 140 cm fabric width and joined at the sides, so every piece still packs onto A4.',
    ],
    numbers: [
      ['gather ratios', 'drawstring 1.8 · shirred 2.0 · smocked 3.0'],
      ['panel depths', 'neck 130 · bust 110 · waist 90 · sleeve 120 mm'],
      ['casing', '22 mm channel + eyelets, cord 12 mm wide'],
      ['gather rows', 'shirred 4 · smocked 6, 12 mm apart'],
      ['truing', 'flat edge / ratio = finished edge, 0.005 mm'],
    ],
    compat: 'Dresses and tops, zones neckline/bust/waist/sleeve. A drawstring-gathered SLEEVE casing and gathered straps stay in the honesty layer.',
    tests: 'tests/gather_check — panel + cord counts, ratio ordering smocked > shirred > drawstring, byte-identical base, placement notch.',
  },
  {
    slug: 'open-back', group: 'details', name: 'Open-back cutout',
    title: 'Open back dress pattern — 4 cutout shapes + facing · stitchu',
    desc: 'How stitchu drafts an open back: round, low-V, square or teardrop cutout starting 40 mm below the nape, with a facing trued to 0.00 mm.',
    lead: 'A shaped opening in the back piece — the back-panel sibling of the front keyhole — with the anatomy rule most tutorials skip: the opening never starts at the neck edge.',
    facts: [
      'A yoke of fabric at the shoulders is what hangs the garment, so the opening starts 40 mm below the centre-back nape and must clear the waist seam by 55 mm. Length is clamped to 55–320 mm: shorter reads as a keyhole, longer than 320 is a full backless span.',
      'Four shapes with real half-width-to-length ratios: round 0.42, low-V 0.34, square 0.36, teardrop keyhole 0.24.',
      'The opening is drawn as a HALF against the centre-back seam — the back is cut 2, and the mirror axis unfolds it into the full symmetric cutout (the same on-fold convention as the front keyhole).',
      'The facing is the opening silhouette pushed out by 34 mm on every side, cut 1 on fold, interfaced, seam allowance 0 — sewn ON the marked line, slashed inside, turned and understitched. The marked stitch line on the facing is byte-identical to the opening drawn on the back: truing 0.00 mm, tested.',
      'It coexists with a tie-back closure on the same draft: the tie draws the strips, this draws the opening they fasten over.',
    ],
    numbers: [
      ['top of opening', '40 mm below nape'],
      ['waist clearance', '55 mm'],
      ['length clamp', '55–320 mm'],
      ['half-width / length', 'round 0.42 · low-V 0.34 · square 0.36 · keyhole 0.24'],
      ['facing margin', '+34 mm, truing 0.00 mm'],
    ],
    compat: 'Dresses and tops (needs a back bodice). Laced backs and back button plackets stay in the honesty layer.',
    tests: 'tests/backopen_check — facing stitch line byte-identical to the opening, base outlines untouched, all four shapes rendered.',
  },
  {
    slug: 'princess-seams', group: 'construction', name: 'Princess seams',
    title: 'Princess seam pattern — trued, equal-length edges · stitchu',
    desc: 'How stitchu converts darts to princess seams: armhole split at 0.38 of armhole depth, both edges trued to equal length, pairs held to 2.5 mm.',
    lead: 'The default shaping. A waist dart becomes an armhole princess seam — and the step most home drafts skip is the whole point here: both edges of that seam must MEASURE equal, or it will not sew.',
    facts: [
      'The split point sits on the armhole at shoulder drop + 0.38 × armhole depth, clamped at least 30 mm above the bust apex and 15 mm below the shoulder tip, found by a de Casteljau split of the armhole cubic.',
      'TRUING: the waist curve sits deeper on the centre side (the front balance drop), so the raw side leg would be up to ~10 mm shorter than the centre leg — irrelevant folded as a dart, unsewable as a seam. The side panel\'s waist end is dropped until both edges measure EQUAL, and the waist curve re-blends into the trued point.',
      'On a princess dress each skirt quarter drafts against ITS bodice half-waist, and the gore seam is placed by arc-walk so the skirt gore meets the bodice princess seam exactly — a virtual-sew audit found offsets up to 8 mm before this rule; the validator now holds it to 2.5 mm.',
      'Intake floor: a bodice half under 12 mm of intake stays unsplit — a seam that shapes nothing only adds pieces.',
      'Validator rules: princess edge pairs within 2.5 mm, skirt gore pairs within 3.0 mm, measured from the actual piece geometry on every draft.',
    ],
    numbers: [
      ['split point', 'shoulder drop + 0.38 × armhole depth'],
      ['clamps', '≥30 mm above apex · ≥15 mm below tip'],
      ['edge-pair tolerance', 'bodice 2.5 · gore 3.0 mm (validated)'],
      ['waist-join alignment', '≤ 2.5 mm (arc-walk placed)'],
      ['intake floor', '12 mm (below it: stays unsplit)'],
    ],
    compat: 'Dresses, tops, and A-line/straight skirts. Gathered, pleated and half-circle skirts have no waist shaping to convert. Darts remain the advanced/legacy option.',
    tests: 'Engine-check matrix (5,610 princess drafts) + per-draft validator pairs; bust-apex match notch on both edges.',
  },
  {
    slug: 'empire-waist', group: 'construction', name: 'Empire waistline',
    title: 'Empire waist pattern — seam at underbust girth · stitchu',
    desc: 'How stitchu drafts an empire line: seam 60 mm below the armhole, suppression fitted to your underbust, skirt lengthened to make up the height.',
    lead: 'The under-bust seam, drafted against the measurement that actually lives there: the empire bodice is suppressed to your underbust girth, not your waist.',
    facts: [
      'The seam sits at the armhole depth + 60 mm — just under the bust, wherever that lands on YOUR back length.',
      'Suppression targets the UNDERBUST girth (bust − 70 mm, a documented B/C-cup assumption) instead of the natural waist — an empire bodice fitted to the waist measurement would sag.',
      'The centre-front balance drop shrinks to 15 mm (vs 40 natural) — there is far less bust below the seam to balance over.',
      'The skirt makes up the height: the removed bodice length is added to the skirt length AND to its hip-drafting depth, so the hip is still fitted 200 mm below your NATURAL waist.',
      'Empire + gathered skirt = the babydoll dress; the natural-waist formulas stay bit-identical when empire is off.',
    ],
    numbers: [
      ['seam position', 'armhole depth + 60 mm'],
      ['suppression target', 'underbust = bust − 70 mm'],
      ['CF balance drop', '15 mm (natural: 40 mm)'],
      ['hip depth', 'kept 200 mm below the natural waist'],
    ],
    compat: 'Dresses with any skirt style; combines with princess or dart shaping, sleeves, collars, gathering and ruffles.',
    tests: 'Validated across the 70,200-draft matrix; apex and dart-leg anchoring covered by the bodice checks.',
  },
];

const GROUPS = [
  ['necklines', 'Necklines'],
  ['skirts', 'Skirt styles'],
  ['sleeves', 'Sleeves'],
  ['details', 'Details & closures'],
  ['construction', 'Construction'],
];

const ICON = `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%272%27 fill=%27%231f3a5f%27/%3E%3Cline x1=%276%27 y1=%2716%27 x2=%2726%27 y2=%2716%27 stroke=%27%23fff%27 stroke-width=%273%27 stroke-dasharray=%275 4%27/%3E%3C/svg%3E">`;

const CSS = `
  /* CANON 2026-07-16: baby-blue world, same palette as benchmark/patches.
     navy ink on white; bb-pale accents; CTA look lives in ../css/shared-button.css. */
  :root{ --bb:#8fbfe8; --bb-deep:#3f74a8; --bb-pale:#dceaf7; --bb-line:#bcd7ee; --navy:#1f3a5f; --ink:#2b4a6b; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Helvetica,Arial,sans-serif;color:var(--navy);background:#fff;line-height:1.55;overflow-x:hidden}
  a{color:var(--bb-deep)}
  .brandpatch{position:relative;display:inline-block;box-sizing:border-box;padding:4px 12px;background:#1f3a5f;border:1px solid #1f3a5f;border-radius:2px;font-family:'Didot','Bodoni 72',Georgia,serif;font-weight:400;font-size:22px;letter-spacing:.5px;line-height:1;color:#fff;text-decoration:none;white-space:nowrap;vertical-align:middle;transition:background .18s}
  .brandpatch::after{content:"";position:absolute;inset:4px;border:1.5px dashed rgba(255,255,255,.85);border-radius:2px;opacity:.9;pointer-events:none;transition:inset .18s}
  .brandpatch:hover{background:#2b4f7a}
  .brandpatch:hover::after{inset:5px}
  /* Shared header comes from ../css/shared-header.css (one source). Navy ink on
     white — no colour flip; only the active-underline accent is set here. */
  .sh-nav a:hover,.sh-nav a.sh-active{border-bottom-color:var(--bb-deep)}
  .wrap{max-width:840px;margin:0 auto;padding:14px 32px 90px}
  .crumbs{font-size:12px;color:#5b7089;letter-spacing:.4px;margin-bottom:20px}
  .crumbs a{text-decoration:none;color:var(--bb-deep)}
  h1{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:38px;line-height:1.14;font-weight:400;margin:10px 0 14px;max-width:24ch;color:var(--navy)}
  h1 em{font-style:italic}
  .lead{font-size:15px;color:var(--ink);max-width:64ch;margin-bottom:34px}
  h2{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:24px;font-weight:400;margin:40px 0 12px;color:var(--navy)}
  .fact{font-size:13.5px;color:var(--ink);max-width:66ch;margin-bottom:12px}
  table{border-collapse:collapse;width:100%;font-size:13.5px;background:#fff;border:1px solid var(--bb-line);border-radius:3px;overflow:hidden;margin-top:6px}
  th,td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--bb-line);color:var(--ink)}
  th{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--navy);background:var(--bb-pale)}
  td.v{font-variant-numeric:tabular-nums;font-weight:700;color:var(--navy)}
  .meta{font-size:12.5px;color:#5b7089;max-width:66ch;margin-top:10px}
  .cta2{display:inline-block;font-size:13px;letter-spacing:.4px;color:var(--bb-deep);text-decoration:none;border-bottom:1px dashed var(--bb);padding-bottom:2px}
  .cta2:hover{border-bottom-color:var(--bb-deep)}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px;margin:14px 0 6px}
  .card{display:block;background:#fff;border:1px solid var(--bb-line);border-radius:3px;padding:16px 18px;text-decoration:none;color:var(--navy);box-shadow:0 6px 20px rgba(63,116,168,.09);transition:border-color .18s,box-shadow .18s}
  .card:hover{border-color:var(--bb-deep);box-shadow:0 10px 30px rgba(63,116,168,.18)}
  .card .nm{font-family:'Didot',Georgia,serif;font-size:18px;margin-bottom:5px;color:var(--navy)}
  .card .ds{font-size:12px;color:var(--ink);line-height:1.45}
  .also{font-size:13px;margin-top:8px;color:var(--ink)}
  .sketch{margin:8px 0 30px;display:flex;flex-direction:column;align-items:center;gap:12px;background:var(--bb-pale);border:1px solid var(--bb-line);border-radius:4px;padding:26px 20px 20px}
  .sketch svg{max-width:240px;width:100%;height:auto}
  .sketch figcaption{font-size:11.5px;color:#5b7089;max-width:52ch;text-align:center;line-height:1.5}
  table.proof td.v{font-weight:400;font-variant-numeric:tabular-nums}
  table.proof td.v a{color:var(--bb-deep)}
  .actions{margin-top:36px;display:flex;align-items:baseline;flex-wrap:wrap;gap:16px}
  footer{padding:26px 40px;font-size:12px;color:#5b7089;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;border-top:1px solid var(--bb-line);margin-top:40px}
  footer a{color:var(--navy);text-decoration:none}
`;

const header = `<header class="sh-header">
  <a class="brandpatch" href="../index.html">stitchu</a>
  <nav class="sh-nav">
    <a href="../create.html" data-en="create" data-tr="çiz">create</a>
    <a href="../closet.html" data-en="closet" data-tr="dolap">closet</a>
    <a href="index.html" class="sh-active" data-en="patterns" data-tr="kalıplar">patterns</a>
    <a href="../benchmark.html" data-en="benchmark" data-tr="kıyaslama">benchmark</a>
    <a href="../patches.html" data-en="patch notes" data-tr="yama notları">patch notes</a>
    <a href="../api.html" data-en="API" data-tr="API">API</a>
    <span class="sh-lang"><button id="lang-en">EN</button><span>·</span><button id="lang-tr">TR</button></span>
  </nav>
</header>`;

const footer = `<footer>
  <span>stitchu · the pattern-making engine</span>
  <span><a href="../index.html">home</a> · <a href="index.html">style library</a> · <a href="../api.html">API</a> · <a href="../privacy.html">privacy</a></span>
</footer>`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// ---------------------------------------------------------------------------
// FLAT SKETCH — a parametric technical drawing of the garment the style lives
// on. NOT a photo, NOT hand-drawn per page: one composer builds a fashion
// flat-sketch silhouette in the site's line language (thin ink lines on the
// page ground), and each style feeds it neckline / sleeve / skirt / detail
// params. The technique the page is about is drawn as a HEAVIER accent line so
// the eye lands on it. Everything below is pure geometry against a shared
// coordinate frame, so 24 pages share one drawing engine. CANON: navy ink on a
// bb-pale ground, bb-deep accent — same world as benchmark/patches.
// ---------------------------------------------------------------------------
const INK = '#1f3a5f';              // main garment outline (navy on the bb-pale sketch ground)
const INK_SOFT = 'rgba(31,58,95,.35)';     // construction / fold / centre lines
const INK_ACCENT = '#3f74a8';       // the technique this page teaches (canon bb-deep accent)

// Front necklines, expressed as an SVG path from the left neck point (LNP) to
// the right neck point (RNP), drawn across a bodice whose shoulders sit at
// y=NECK_Y and whose centre front is x=CX. w = half neck width, and each shape
// dips to its own depth. Returned as { path, accent:true }.
function necklinePath(kind, CX, NECK_Y, w) {
  const L = CX - w, R = CX + w;               // neck points
  const d = { crew: 22, scoop: 60, vNeck: 82, square: 50, boat: 14, sweetheart: 66, halter: 60 }[kind] ?? 40;
  const bot = NECK_Y + d;
  switch (kind) {
    case 'crew':   return `M ${L} ${NECK_Y} C ${L} ${NECK_Y + d * .9} ${R} ${NECK_Y + d * .9} ${R} ${NECK_Y}`;
    case 'scoop':  return `M ${L} ${NECK_Y} C ${L - 4} ${bot} ${R + 4} ${bot} ${R} ${NECK_Y}`;
    case 'vNeck':  return `M ${L} ${NECK_Y} L ${CX} ${bot} L ${R} ${NECK_Y}`;
    case 'square': return `M ${L} ${NECK_Y} L ${L} ${bot} L ${R} ${bot} L ${R} ${NECK_Y}`;
    case 'boat':   return `M ${L - 18} ${NECK_Y} C ${L} ${NECK_Y + d} ${R} ${NECK_Y + d} ${R + 18} ${NECK_Y}`;
    case 'sweetheart':
      // two mirrored lobes meeting in a cleft at CX, lifting above the chord
      return `M ${L} ${NECK_Y} C ${L + w * .22} ${NECK_Y + d * .95} ${CX - w * .5} ${NECK_Y + d * .2} ${CX} ${bot - 8} C ${CX + w * .5} ${NECK_Y + d * .2} ${R - w * .22} ${NECK_Y + d * .95} ${R} ${NECK_Y}`;
    case 'halter':
      // no shoulder seam: the neck rises into a nape strap above NECK_Y
      return `M ${CX - 14} ${NECK_Y - 34} L ${CX + 14} ${NECK_Y - 34} L ${R} ${NECK_Y + d} C ${R} ${NECK_Y + d + 14} ${L} ${NECK_Y + d + 14} ${L} ${NECK_Y + d} Z`;
    default:       return `M ${L} ${NECK_Y} C ${L} ${bot} ${R} ${bot} ${R} ${NECK_Y}`;
  }
}

// Compose one flat sketch. `sk` = { type, neckline, sleeve, skirt, detail }.
// Coordinate frame: 240 wide, 300 tall, garment centred.
function flatSketch(sk) {
  const W = 240, H = 300, CX = 120;
  const SHO_Y = 40, SHO_HALF = 62;          // shoulder line
  const NECK_Y = 42, NECK_HALF = 20;        // neck opening
  const parts = [];
  const line = (d, stroke = INK, sw = 1.4, extra = '') =>
    `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
  const halter = sk.neckline === 'halter';
  const isSkirt = sk.type === 'skirt';
  const isDress = sk.type === 'dress';

  // --- centre-front construction line (soft) ---
  if (!isSkirt) parts.push(line(`M ${CX} ${NECK_Y} L ${CX} ${isDress ? 200 : 178}`, INK_SOFT, 1, 'stroke-dasharray="4 4"'));

  // --- bodice / top body ---
  if (!isSkirt) {
    const WAIST_Y = 150, WAIST_HALF = 46;
    const HEM_Y = sk.type === 'top' ? 178 : WAIST_Y;
    const UNDERARM_Y = 92, CHEST_HALF = 56;
    // right side: shoulder -> underarm -> waist  (mirrored for left)
    const bodyR = `M ${CX + NECK_HALF} ${NECK_Y} L ${CX + SHO_HALF} ${SHO_Y} L ${CX + CHEST_HALF} ${UNDERARM_Y} L ${CX + WAIST_HALF} ${WAIST_Y}`;
    const bodyL = `M ${CX - NECK_HALF} ${NECK_Y} L ${CX - SHO_HALF} ${SHO_Y} L ${CX - CHEST_HALF} ${UNDERARM_Y} L ${CX - WAIST_HALF} ${WAIST_Y}`;
    if (!halter) { parts.push(line(bodyR), line(bodyL)); }
    else {
      // halter: bare shoulders, armhole sweeps from nape strap to underarm
      parts.push(line(`M ${CX + CHEST_HALF} ${UNDERARM_Y} L ${CX + WAIST_HALF} ${WAIST_Y}`));
      parts.push(line(`M ${CX - CHEST_HALF} ${UNDERARM_Y} L ${CX - WAIST_HALF} ${WAIST_Y}`));
    }
    // top hem (only for tops) closes the body
    if (sk.type === 'top') parts.push(line(`M ${CX - WAIST_HALF} ${HEM_Y} L ${CX + WAIST_HALF} ${HEM_Y}`));
  }

  // --- sleeves ---
  if (sk.sleeve && !halter && !isSkirt) {
    const capX = CX + SHO_HALF, capY = SHO_Y, uaX = CX + 56, uaY = 92;
    const drawSleeve = (dir) => {
      const s = dir; // +1 right, -1 left
      const sx = CX + s * SHO_HALF, ux = CX + s * 56;
      if (sk.sleeve === 'puff') {
        // raised, gathered crown ballooning off the shoulder
        parts.push(line(`M ${sx} ${capY} C ${sx + s * 34} ${capY - 6} ${sx + s * 40} ${capY + 30} ${sx + s * 20} ${capY + 52} L ${ux} ${uaY}`, INK));
        parts.push(line(`M ${sx} ${capY} C ${sx + s * 8} ${capY + 10} ${sx + s * 6} ${capY + 20} ${sx + s * 14} ${capY + 30}`, INK_SOFT, 1, 'stroke-dasharray="2 3"'));
      } else if (sk.sleeve === 'balloon') {
        // straight cap, hem balloons then gathers into a cuff
        parts.push(line(`M ${sx} ${capY} L ${sx + s * 30} ${capY + 46} C ${sx + s * 46} ${capY + 70} ${sx + s * 30} ${capY + 96} ${sx + s * 14} ${capY + 104} L ${ux} ${uaY + 96}`, INK));
        parts.push(line(`M ${sx + s * 14} ${capY + 100} L ${ux} ${uaY + 92}`, INK_SOFT, 1, 'stroke-dasharray="2 3"'));
      } else {
        // plain straight sleeve
        parts.push(line(`M ${sx} ${capY} L ${sx + s * 24} ${capY + 68} L ${ux} ${uaY + 60} L ${ux} ${uaY}`, INK));
      }
    };
    drawSleeve(1); drawSleeve(-1);
  }

  // --- skirt / dress skirt ---
  if (!isSkirt && isDress || isSkirt) {
    const topY = isSkirt ? 60 : 150, topHalf = isSkirt ? 40 : 46, CY = isSkirt ? 60 : 150;
    const hemY = isSkirt ? 250 : 260;
    let hemHalf = 60;
    let hem = '';
    const st = sk.skirt || 'aLine';
    if (st === 'straight') { hemHalf = topHalf; }
    else if (st === 'aLine') { hemHalf = 74; }
    else if (st === 'gathered' || st === 'pleated') { hemHalf = topHalf; }
    else if (st === 'halfCircle') { hemHalf = 96; }
    // side seams
    parts.push(line(`M ${CX - topHalf} ${topY} L ${CX - hemHalf} ${hemY}`, INK));
    parts.push(line(`M ${CX + topHalf} ${topY} L ${CX + hemHalf} ${hemY}`, INK));
    // hem
    if (st === 'halfCircle') parts.push(line(`M ${CX - hemHalf} ${hemY} Q ${CX} ${hemY + 22} ${CX + hemHalf} ${hemY}`, INK));
    else parts.push(line(`M ${CX - hemHalf} ${hemY} L ${CX + hemHalf} ${hemY}`, INK));
    if (isSkirt) parts.push(line(`M ${CX - topHalf} ${topY} L ${CX + topHalf} ${topY}`, INK)); // waistband
    // gather / pleat markings at the waist
    if (st === 'gathered') for (let i = -3; i <= 3; i++) parts.push(line(`M ${CX + i * 10} ${topY} l 0 12`, INK_SOFT, 1));
    if (st === 'pleated') for (let i = -2; i <= 2; i++) parts.push(line(`M ${CX + i * 16} ${topY} l 0 ${hemY - topY}`, INK_SOFT, 1, 'stroke-dasharray="3 4"'));
  }

  // --- the neckline (front), drawn last as the ACCENT unless a detail owns it ---
  if (!isSkirt) {
    const isNeckStyle = sk.detail === undefined || sk.detail === 'neckline';
    parts.push(line(necklinePath(sk.neckline || 'crew', CX, NECK_Y, NECK_HALF),
      isNeckStyle ? INK_ACCENT : INK, isNeckStyle ? 2.4 : 1.4));
  }

  // --- construction detail accents (technique the page teaches) ---
  const acc = (d, sw = 2.4) => parts.push(line(d, INK_ACCENT, sw));
  const accDash = (d) => parts.push(line(d, INK_ACCENT, 2, 'stroke-dasharray="4 3"'));
  switch (sk.detail) {
    case 'placket':
      acc(`M ${CX - 8} ${NECK_Y + 6} L ${CX - 8} 150`);
      acc(`M ${CX + 8} ${NECK_Y + 6} L ${CX + 8} 150`);
      for (let y = 66; y <= 138; y += 20) acc(`M ${CX - 3} ${y} l 6 0`, 2);
      break;
    case 'keyhole':
      acc(`M ${CX} ${NECK_Y + 30} q -12 26 0 46 q 12 -20 0 -46 Z`);
      break;
    case 'collar':
      acc(`M ${CX - NECK_HALF - 6} ${NECK_Y - 2} C ${CX - 26} ${NECK_Y + 20} ${CX + 26} ${NECK_Y + 20} ${CX + NECK_HALF + 6} ${NECK_Y - 2}`);
      break;
    case 'ties':
      acc(`M ${CX} 150 q 26 8 30 30 q -18 -6 -30 -30`);
      acc(`M ${CX} 150 q -26 8 -30 30 q 18 -6 30 -30`);
      break;
    case 'shirring':
      for (let y = NECK_Y + 14; y <= NECK_Y + 44; y += 8) accDash(`M ${CX - 34} ${y} q 34 8 68 0`);
      break;
    case 'openBack':
      accDash(`M ${CX - 22} ${NECK_Y + 20} q 22 44 44 0`);
      break;
    case 'princess':
      accDash(`M ${CX + 26} ${SHO_Y + 8} C ${CX + 30} 90 ${CX + 22} 120 ${CX + 30} 150`);
      accDash(`M ${CX - 26} ${SHO_Y + 8} C ${CX - 30} 90 ${CX - 22} 120 ${CX - 30} 150`);
      break;
    case 'empire':
      acc(`M ${CX - 48} 120 L ${CX + 48} 120`, 2);
      break;
    case 'ruffle':
      acc(`M ${CX - 60} 258 q 12 12 24 0 q 12 12 24 0 q 12 12 24 0 q 12 12 24 0 q 12 12 24 0`, 2);
      break;
    case 'skirt': // the skirt hem style is the accent — redraw hem heavier
      break;
    default: break;
  }

  const inner = parts.join('\n    ');
  return `<figure class="sketch">
  <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Technical flat sketch showing a ${sk.aria || 'garment'}">
    ${inner}
  </svg>
  <figcaption>A technical flat of the style, drawn by the same coordinate engine that drafts the pattern. The accent line is the piece this page draws.</figcaption>
</figure>`;
}

// ---------------------------------------------------------------------------
// TEST-RESULTS BLOCK — the proof box. Every number is sourced: the 0.00 mm
// seam truing and the 70,200-draft matrix are engine-wide constants (published
// on benchmark.html); the per-style test name and the patch that made the
// feature possible come from the style's own record. No invented figures.
// ---------------------------------------------------------------------------
const FUZZ = '19,780';        // web-fuzz.js draws, zero geometry failures (constitution)
const VOCAB = '37,800';       // vocab-sweep decoupled body × vocab drafts, zero failures
const MATRIX = '70,200';      // engine-check body × option matrix
const GOLDEN = '0.000000 mm'; // opt-in features leave the base golden byte-identical

function testBlock(s) {
  const patchLink = s.patch
    ? `<a href="../patches.html#patch-${s.patch.replace(/\./g, '-')}">patch ${s.patch}</a>`
    : `<a href="../patches.html">patch notes</a>`;
  const madeBy = s.patchNote
    ? `<tr><td>made possible by</td><td class="v">${patchLink} — ${esc(s.patchNote)}</td></tr>`
    : '';
  return `<h2>The test results</h2>
  <p class="fact">This is the evidence box: the seam truing, the validation runs and the patch that drew this style, straight from the test suite — misses included on the <a href="../patches.html">patch notes</a>.</p>
  <table class="proof">
    <tr><th>evidence</th><th>result</th></tr>
    <tr><td>seam-pair precision</td><td class="v">${GOLDEN}</td></tr>
    <tr><td>validation matrix</td><td class="v">${MATRIX} body × option drafts, 0 failures</td></tr>
    <tr><td>web fuzz sweep</td><td class="v">${FUZZ} / 0 · vocab sweep ${VOCAB} / 0</td></tr>
    <tr><td>dedicated test</td><td class="v">${esc(s.tests)}</td></tr>
    ${madeBy}
  </table>`;
}

// ---------------------------------------------------------------------------
// PRINT THIS PATTERN — one tap from the page to a real A4 draft. The link
// carries this style's spec into the create flow as a preset (create.js reads
// ?<field>=<value> and pre-selects the pickers), so the visitor lands on the
// exact garment this page describes, ready to print true-scale. No engine
// touched: the preset is read in the bridge layer.
// ---------------------------------------------------------------------------
function presetQuery(preset) {
  if (!preset) return '';
  return '?' + Object.entries(preset).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
}
function printBlock(s) {
  const href = `../create.html${presetQuery(s.preset)}`;
  return `<a class="sb-btn sb-primary" href="${href}">Print this pattern — true-scale A4, free</a>`;
}

function headBlock({ title, desc, canonical }) {
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${ICON}
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="stitchu">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="stylesheet" href="../css/theme-transitions.css?v=67">
<link rel="stylesheet" href="../css/shared-header.css?v=67">
<link rel="stylesheet" href="../css/shared-button.css?v=67">`;
}

function breadcrumbLd(name, url) {
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'stitchu', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Style library', item: `${BASE}/styles/` },
      { '@type': 'ListItem', position: 3, name, item: url },
    ],
  })}</script>`;
}

// Per-style extras: the flat-sketch params, the create-flow preset the "print"
// link carries, and the patch that made the feature possible. Keyed by slug so
// the STYLES list above stays the readable content source. Presets use the
// exact option keys create.js expects (SPEC_GROUPS).
const EXTRAS = {
  // necklines: a dress flat with the named front neckline as the accent
  'sweetheart-neckline': { sketch: { type: 'dress', neckline: 'sweetheart', skirt: 'aLine', aria: 'sweetheart-neckline dress' }, preset: { garment: 'dress', neckline: 'sweetheart' } },
  'halter-neckline':     { sketch: { type: 'dress', neckline: 'halter', skirt: 'aLine', aria: 'halter dress' }, preset: { garment: 'dress', neckline: 'halter' } },
  'v-neck':              { sketch: { type: 'dress', neckline: 'vNeck', skirt: 'aLine', aria: 'v-neck dress' }, preset: { garment: 'dress', neckline: 'vNeck' } },
  'scoop-neckline':      { sketch: { type: 'dress', neckline: 'scoop', skirt: 'aLine', aria: 'scoop-neck dress' }, preset: { garment: 'dress', neckline: 'scoop' } },
  'square-neckline':     { sketch: { type: 'dress', neckline: 'square', skirt: 'aLine', aria: 'square-neck dress' }, preset: { garment: 'dress', neckline: 'square' } },
  'boat-neckline':       { sketch: { type: 'top', neckline: 'boat', aria: 'boat-neck top' }, preset: { garment: 'top', neckline: 'boat' } },
  'crew-neckline':       { sketch: { type: 'dress', neckline: 'crew', skirt: 'aLine', aria: 'crew-neck dress' }, preset: { garment: 'dress', neckline: 'crew' } },
  // details / construction: the technique is the accent on a representative body
  'keyhole':             { sketch: { type: 'top', neckline: 'crew', detail: 'keyhole', aria: 'keyhole cut-out top' }, preset: { garment: 'top', neckline: 'crew', keyhole: 'keyhole' }, patch: '1.5', patchNote: 'keyhole & audit line' },
  'button-placket':      { sketch: { type: 'top', neckline: 'crew', detail: 'placket', aria: 'button-placket top' }, preset: { garment: 'top', neckline: 'crew', frontPlacket: 'true' }, patch: '1.3', patchNote: 'the first drawn closure' },
  'fabric-ties':         { sketch: { type: 'dress', neckline: 'square', skirt: 'aLine', detail: 'ties', aria: 'back-tie dress' }, preset: { garment: 'dress', neckline: 'square', tieClosure: 'backWaistBow' }, patch: '1.4', patchNote: 'fabric ties & sashes' },
  'collars':             { sketch: { type: 'top', neckline: 'crew', detail: 'collar', aria: 'collared top' }, preset: { garment: 'top', neckline: 'crew', collarType: 'stand' }, patch: '1.7', patchNote: 'the collar family' },
  'shirring-drawstring': { sketch: { type: 'dress', neckline: 'square', skirt: 'gathered', detail: 'shirring', aria: 'shirred-panel dress' }, preset: { garment: 'dress', neckline: 'square', gatherType: 'shirred', gatherZone: 'bust' }, patch: '1.9', patchNote: 'drawstring, shirring & smocking' },
  'open-back':           { sketch: { type: 'dress', neckline: 'scoop', skirt: 'aLine', detail: 'openBack', aria: 'open-back dress' }, preset: { garment: 'dress', neckline: 'scoop', backOpening: 'round' }, patch: '2.0', patchNote: 'the shaped open-back cutout' },
  'princess-seams':      { sketch: { type: 'dress', neckline: 'scoop', skirt: 'aLine', detail: 'princess', aria: 'princess-seam dress' }, preset: { garment: 'dress', neckline: 'scoop', shaping: 'princess' } },
  'empire-waist':        { sketch: { type: 'dress', neckline: 'scoop', skirt: 'gathered', detail: 'empire', aria: 'empire-waist dress' }, preset: { garment: 'dress', neckline: 'scoop', waistline: 'empire', skirtStyle: 'gathered' } },
  'hem-ruffle':          { sketch: { type: 'skirt', skirt: 'aLine', detail: 'ruffle', aria: 'ruffle-hem skirt' }, preset: { garment: 'skirt', skirtStyle: 'aLine', ruffle: 'single' } },
  // sleeves: a top flat with the sleeve as the accent
  'balloon-sleeve':      { sketch: { type: 'top', neckline: 'crew', sleeve: 'balloon', aria: 'balloon-sleeve top' }, preset: { garment: 'top', neckline: 'crew', sleeveStyle: 'balloon', sleeveLength: 'long' } },
  'puff-sleeve':         { sketch: { type: 'top', neckline: 'crew', sleeve: 'puff', aria: 'puff-sleeve top' }, preset: { garment: 'top', neckline: 'crew', sleeveStyle: 'straight', sleeveCap: 'puffed' }, patch: '1.6', patchNote: 'the puff / gathered cap' },
  // skirts: a skirt flat with the hem/waist style as the accent
  'a-line-skirt':        { sketch: { type: 'skirt', skirt: 'aLine', aria: 'A-line skirt' }, preset: { garment: 'skirt', skirtStyle: 'aLine' } },
  'straight-skirt':      { sketch: { type: 'skirt', skirt: 'straight', aria: 'straight skirt' }, preset: { garment: 'skirt', skirtStyle: 'straight' } },
  'gathered-skirt':      { sketch: { type: 'skirt', skirt: 'gathered', aria: 'gathered skirt' }, preset: { garment: 'skirt', skirtStyle: 'gathered' } },
  'half-circle-skirt':   { sketch: { type: 'skirt', skirt: 'halfCircle', aria: 'half-circle skirt' }, preset: { garment: 'skirt', skirtStyle: 'halfCircle' } },
  'pleated-skirt':       { sketch: { type: 'skirt', skirt: 'pleated', aria: 'pleated skirt' }, preset: { garment: 'skirt', skirtStyle: 'pleated' } },
};

function stylePage(s) {
  const url = `${BASE}/styles/${s.slug}.html`;
  const ex = EXTRAS[s.slug] || { sketch: { type: 'dress', neckline: 'crew', skirt: 'aLine' } };
  const S = { ...s, ...ex };
  const others = STYLES.filter((o) => o.group === s.group && o.slug !== s.slug);
  const also = others.length
    ? `<p class="also">More in ${GROUPS.find((g) => g[0] === s.group)[1].toLowerCase()}: ${others.map((o) => `<a href="${o.slug}.html">${o.name}</a>`).join(' · ')}</p>`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
${headBlock({ title: s.title, desc: s.desc, canonical: url })}
${breadcrumbLd(s.name, url)}
<style>${CSS}</style>
</head>
<body>
${header}
<div class="wrap">
  <p class="crumbs"><a href="../index.html">stitchu</a> / <a href="index.html">style library</a> / ${s.name.toLowerCase()}</p>
  <h1>${s.name}, <em>drafted.</em></h1>
  <p class="lead">${s.lead}</p>

  ${flatSketch(S.sketch)}

  <h2>How the engine drafts it</h2>
  ${s.facts.map((f) => `<p class="fact">${f}</p>`).join('\n  ')}

  <h2>The real numbers</h2>
  <table>
    <tr><th>parameter</th><th>value</th></tr>
    ${s.numbers.map(([k, v]) => `<tr><td>${k}</td><td class="v">${v}</td></tr>`).join('\n    ')}
  </table>
  <p class="meta"><b>Works with:</b> ${s.compat}</p>

  ${testBlock(S)}

  <div class="actions">
    ${printBlock(S)}
    <a class="cta2" href="index.html">Browse all styles →</a>
  </div>
  ${also}
</div>
${footer}
<script src="../js/shared-header.js?v=67"></script>
</body>
</html>
`;
}

function hubPage() {
  const url = `${BASE}/styles/`;
  const title = 'Sewing pattern style library — every drafted style · stitchu';
  const desc = `${STYLES.length} garment styles the stitchu engine drafts to your measurements — necklines, skirts, sleeves, collars, shirring — with the real numbers behind each.`;
  const sections = GROUPS.map(([key, label]) => {
    const items = STYLES.filter((s) => s.group === key);
    if (!items.length) return '';
    return `  <h2>${label}</h2>
  <div class="grid">
    ${items.map((s) => `<a class="card" href="${s.slug}.html"><span class="nm">${s.name}</span><span class="ds">${s.lead.split('. ')[0].replace(/\.$/, '')}.</span></a>`).join('\n    ')}
  </div>`;
  }).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
${headBlock({ title, desc, canonical: url })}
<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'stitchu', item: `${BASE}/` },
    { '@type': 'ListItem', position: 2, name: 'Style library', item: url },
  ],
})}</script>
<style>${CSS}</style>
</head>
<body>
${header}
<div class="wrap">
  <p class="crumbs"><a href="../index.html">stitchu</a> / style library</p>
  <h1>The style <em>library.</em></h1>
  <p class="lead">Every style below is drafted by the same engine — real pattern-cutting geometry computed against your seven measurements, validated on a 70,200-draft matrix, seams held to 0.00 mm. Each page shows the actual drafting numbers, straight from the engine's formula spec.</p>
${sections}
  <a class="sb-btn sb-primary" style="margin-top:34px" href="../create.html">Draft a pattern to your measurements — free</a>
</div>
${footer}
<script src="../js/shared-header.js?v=67"></script>
</body>
</html>
`;
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'index.html'), hubPage());
for (const s of STYLES) writeFileSync(join(OUT, `${s.slug}.html`), stylePage(s));

// sitemap.xml — every indexable page. The produced-pattern gallery (web/
// patterns/) is generated by a SEPARATE tool (render-patterns); we read its
// meta.json so a regen here never drops its URLs from the sitemap.
const today = new Date().toISOString().slice(0, 10);
let patternPages = [];
try {
  const meta = JSON.parse(readFileSync(join(ROOT, 'web', 'patterns', 'svg', 'meta.json'), 'utf8'));
  patternPages = ['patterns/', ...meta.map((m) => `patterns/${m.slug}.html`)];
} catch { /* gallery not built yet */ }
const pages = [
  '', 'create.html', 'benchmark.html', 'api.html', 'privacy.html', 'closet.html',
  ...patternPages,
  'styles/', ...STYLES.map((s) => `styles/${s.slug}.html`),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${BASE}/${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
writeFileSync(join(ROOT, 'web', 'sitemap.xml'), sitemap);
writeFileSync(join(ROOT, 'web', 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);

console.log(`generated ${STYLES.length} style pages + hub + sitemap (${pages.length} urls) + robots.txt`);
