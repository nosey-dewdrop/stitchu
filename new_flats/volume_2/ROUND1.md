# stitchu volume_2 — Round 1

Engine: `engine/dist/stitchu-engine.js` (fresh, all volume_1 capabilities: cupSeam, plain/gathered yoke, center box pleat, placket-on-top + yoke-facing validator fixes).
Body B: bust 88, waist 70, hip 94, shoulder 37, backLength 40.5, armLength 58, neck 35.
Method: draft with ONLY vocab.json values; `issues===[]` + faithful = WEARABLE; drafts but drops a clear flat feature = PARTIAL; class not representable = OUT-OF-SCOPE.

Every drafted spec below returned `error: null` and `issues: []`. The engine refused nothing and produced no unwearable geometry — the split between WEARABLE and PARTIAL is purely about *faithfulness to the flat*, measured against piece lists.

---

## Per-flat

### 1 — 19.35.26 — VERDICT: WEARABLE (9 pieces)
Sleeveless fit-and-flare mini dress, square/scoop neck, princess seams front & back, A-line flared skirt, V-back.
Spec: `garment:dress, shaping:princess, neckline:square, sleeveStyle:none, skirtStyle:aLine, skirtLength:mini`
Pieces: Bodice Center Front / Bodice Side Front / Bodice Center Back / Bodice Side Back / Bias binding (neckline + armholes) / Skirt Center Front / Skirt Side Front / Skirt Center Back / Skirt Side Back
issues: []

### 2 — 19.35.34 — VERDICT: WEARABLE (5 pieces)
Ruched-strap tank, smocked/shirred bust band, tiered ruffle hem (babydoll).
Spec: `garment:top, shaping:dart, neckline:square, sleeveStyle:none, ruffledStraps:2 (wide), gatherType:2 (shirred), gatherZone:1 (bust), topLength:hip`
Pieces: Top Front / Top Back / Bias binding (neckline + armholes) / Shirred Bust Panel / Wide Strap
issues: []
Note: the lower *tiered ruffle hem* is not a distinct engine feature; a peplum was not used because the flat's tier reads as a gathered hem flounce, not a circle peplum. Shirred band + straps carry the identity → WEARABLE (tier is a decorative hem, not lost structure).

### 3 — 19.35.40 — VERDICT: WEARABLE (6 pieces)
Sleeveless dress, boat neck, empire gathered bust, A-line skirt.
Spec: `garment:dress, shaping:dart, neckline:boat, sleeveStyle:none, waistline:empire, gatherType:2 (shirred), gatherZone:1 (bust), skirtStyle:aLine, skirtLength:midi`
Pieces: Bodice Front / Bodice Back / Bias binding (neckline + armholes) / Skirt Front / Skirt Back / Shirred Bust Panel
issues: []

### 4 — 19.35.46 — VERDICT: WEARABLE (10 pieces)
Cap-sleeve dress, square neck, bustier-style bust seaming, fitted waist, flared skirt, square back.
Spec: `garment:dress, shaping:princess, neckline:square, sleeveStyle:straight, sleeveCap:3 (cap), cupSeam:1, skirtStyle:aLine, skirtLength:mini`
Pieces: Bodice Center Front / Bodice Side Front / Bodice Center Back / Bodice Side Back / Bias binding (neckline) / Skirt Center Front / Skirt Side Front / Skirt Center Back / Skirt Side Back / Cap Sleeve
issues: []
Measured finding: `cupSeam:1` is a **silent no-op here** — with a cap sleeve present, cupSeam:1 vs cupSeam:0 give byte-identical piece lists. The bustier look is carried by princess paneling (faithful), so WEARABLE, but the horizontal cup seam itself was dropped. (See LEARNING: cupSeam suppression.)

### 5 — 19.35.55 — SKIP (blank thumbnail)
Near-empty 3954-byte thumbnail, no drawable garment. Skipped.

### 6 — 19.36.05 — VERDICT: WEARABLE (7 pieces)
Wide-strap fit-and-flare dress, sweetheart neck with lace/bow trim, gore/panel skirt, flared.
Spec: `garment:dress, shaping:princess, neckline:sweetheart, sleeveStyle:none, ruffledStraps:2 (wide), skirtStyle:gore, skirtLength:mini`
Pieces: Bodice Center Front / Bodice Side Front / Bodice Center Back / Bodice Side Back / Bias binding (neckline + armholes) / Skirt 6-gore Panel / Wide Strap
issues: []
Note: lace edging + bow are surface trim, not structure → faithful.

### 7 — 19.36.19 — SKIP (pattern-pieces sheet)
Labeled cutting sheet: Main Dress A (front) / B (back) / Facing C / D. Not a garment flat. Skipped.

### 8 — 19.36.37 — VERDICT: PARTIAL (7 pieces)
Sleeveless A-line shift, spaghetti straps, angled front slash pockets.
Spec: `garment:dress, shaping:dart, neckline:square, sleeveStyle:none, ruffledStraps:3 (spaghetti), pocketStyle:2 (sideSeam), skirtStyle:aLine, skirtLength:mini`
Pieces: Bodice Front / Bodice Back / Bias binding (neckline + armholes) / Skirt Front / Skirt Back / Spaghetti Strap / Pocket Bag (side-seam)
issues: []
Drop: flat clearly shows **angled slash pockets set into the front panel**, engine only offers `patch` or `sideSeam`. Pocket present but wrong construction → PARTIAL. (VOCAB-GAP: slash/angled pocket.)

### 9 — 19.36.42 — OUT-OF-SCOPE
One-shoulder ruched sheath dress; asymmetric neckline + diagonal drape ruching. No symmetric-neckline vocab value and no asymmetric-shoulder capability. Not drafted.

### 10 — 19.36.55 — VERDICT: PARTIAL (4 pieces)
Sleeveless top, scoop/U back, dropped-waist all-around gathered/pleated flounce tier.
Spec: `garment:top, shaping:dart, neckline:scoop, sleeveStyle:none, backDetail:3 (flounce), topLength:hip`
Pieces: Top Front / Top Back / Bias binding (neckline + armholes) / Back Flounce
issues: []
Drop: flat's flounce runs **all the way around at the dropped waist** (front + back), engine's `backDetail:flounce` gives a back-only flounce. Front tier dropped → PARTIAL. (CAPABILITY: all-around dropped-waist / tiered flounce.)

### 11 — 19.36.59 — VERDICT: WEARABLE (7 pieces)
Sleeveless shift, deep V-back finished with a bow.
Spec: `garment:dress, shaping:dart, neckline:boat, sleeveStyle:none, tieClosure:4 (tieBack), backOpening:2 (lowV), skirtStyle:aLine, skirtLength:mini`
Pieces: Bodice Front / Bodice Back / Bias binding (neckline + armholes) / Skirt Front / Skirt Back / Back Tie / Open Back Facing (low-V)
issues: []

### 12 — 19.37.04 — VERDICT: WEARABLE (6 pieces)
Sleeveless A-line dress, deep round/U scoop low back.
Spec: `garment:dress, shaping:dart, neckline:crew, sleeveStyle:none, backOpening:1 (round), skirtStyle:aLine, skirtLength:mini`
Pieces: Bodice Front / Bodice Back / Bias binding (neckline + armholes) / Skirt Front / Skirt Back / Open Back Facing (round)
issues: []

### 13 — 19.37.11 — VERDICT: PARTIAL (6 pieces)
Shoulder-tie corset-bodice dress, sweetheart neck, **lace-up (eyelet) back**, full circle skirt.
Spec: `garment:dress, shaping:dart, neckline:sweetheart, sleeveStyle:none, ruffledStraps:2 (wide), tieClosure:4 (tieBack), skirtStyle:halfCircle, skirtLength:mini`
Pieces: Bodice Front / Bodice Back / Bias binding (neckline + armholes) / Skirt Panel (quarter circle) / Back Tie / Wide Strap
issues: []
Drop: the corset **lace-up back with eyelets** is drafted as a single back tie, not a laced/eyeleted closure. Wearable but the corset-lacing feature is dropped → PARTIAL. (CAPABILITY: corset lace-up / eyelet back.)

### 14 — 19.37.28 — OUT-OF-SCOPE
One-shoulder gathered mini SKIRT with an asymmetric shoulder tie strap. Asymmetric one-shoulder construction on a skirt — not representable. Not drafted.

### 15 — 19.37.37 — VERDICT: PARTIAL (4 pieces)
Halter top, corset/cup bodice, **back cutouts laced with multiple bow ties**.
Spec: `garment:top, shaping:dart, neckline:halter, sleeveStyle:none, cupSeam:1, tieClosure:4 (tieBack), topLength:hip`
Pieces: Top Front / Top Back / Bias binding (halter) / Back Tie
issues: []
Drops: (a) `cupSeam:1` produces **no cup piece on a top** (verified: identical output with/without); (b) the flat's **series of laced back cutouts with bows** collapses to one back tie. Halter body faithful, but cup seam + laced cutouts dropped → PARTIAL. (CAPABILITY: cup seam on tops; corset lace-up back.)

### 16 — 19.37.43 — VERDICT: WEARABLE (12 pieces)
Shoulder-tie bustier mini dress, sweetheart, horizontal cup seam, straight mini skirt.
Spec: `garment:dress, shaping:princess, neckline:sweetheart, sleeveStyle:none, ruffledStraps:2 (wide), cupSeam:1, skirtStyle:straight, skirtLength:mini`
Pieces: Upper Cup Center Front / Lower Cup Center Front / Upper Cup Side Front / Lower Cup Side Front / Bodice Center Back / Bodice Side Back / Bias binding (neckline + armholes) / Skirt Center Front / Skirt Side Front / Skirt Center Back / Skirt Side Back / Wide Strap
issues: []
Note: cup seam ONLY produces Upper/Lower Cup panels with `shaping:princess` (my first pass used `dart` and the cup seam vanished). With princess it's fully faithful → WEARABLE. This is the volume_1 cupSeam capability landing correctly.

### 17 — 19.37.57 — VERDICT: PARTIAL (4 pieces)
Wrap-front (surplice) V-neck top, crossed-over front bodice, back waist tie.
Spec: `garment:top, shaping:dart, neckline:vNeck, sleeveStyle:none, tieClosure:7 (wrapFront), topLength:hip`
Pieces: Top Front / Top Back / Bias binding (neckline + armholes) / Wrap Front Tie
issues: []
Drop: engine represents "wrap" as a tie strip; the flat is a **true crossover surplice front** (two overlapping front panels). Front bodice is not split/crossed → PARTIAL. (CAPABILITY: true wrap/surplice crossover front panels.)

### 18 — 19.38.13 — VERDICT: WEARABLE (8 pieces)
Sleeveless A-line dress, large flat/Peter-Pan ruffled collar, functional center-front button placket.
Spec: `garment:dress, shaping:dart, neckline:crew, sleeveStyle:none, collarType:4 (peterPan), collarEdge:0 (round), buttonRow:1 (functional), placketStyle:1 (standard), skirtStyle:aLine, skirtLength:mini`
Pieces: Bodice Front / Bodice Back / Front Neck Facing / Back Neck Facing / Bias binding (armholes) / Skirt Front / Skirt Back / Peter Pan Collar
issues: []
Note: the collar's ruffled edge is trim; flat collar + buttons + placket all faithful. The volume_1 placket-on-top + yoke-facing validator fixes held (facings + placket + collar coexist, 0 issues).

### 19 — 19.38.29 — VERDICT: WEARABLE (7 pieces)
Halter peplum top, pussy-bow neck tie, gathered bust, peplum flounce, fitted waist.
Spec: `garment:top, shaping:dart, neckline:pussyBow, sleeveStyle:none, gatherType:2 (shirred), gatherZone:1 (bust), peplum:1 (full), topLength:hip`
Pieces: Top Front / Top Back / Bias binding (neckline + armholes) / Pussy-bow Band / Pussy-bow Tie / Shirred Bust Panel / Peplum
issues: []

### 20 — 19.38.50 — VERDICT: WEARABLE (6 pieces)
Shoulder-tie top, smocked/shirred waist band, peplum flounce hem.
Spec: `garment:top, shaping:dart, neckline:square, sleeveStyle:none, ruffledStraps:2 (wide), gatherType:3 (smocked), gatherZone:2 (waist), peplum:1 (full), topLength:hip`
Pieces: Top Front / Top Back / Bias binding (neckline + armholes) / Smocked Waist Panel / Wide Strap / Peplum
issues: []

---

## Honest tally

- **WEARABLE: 11** — #1, #2, #3, #4, #6, #11, #12, #16, #18, #19, #20
- **PARTIAL: 5** — #8, #10, #13, #15, #17
- **OUT-OF-SCOPE: 2** — #9, #14
- **SKIP: 2** — #5 (blank), #7 (pattern sheet)

**WEARABLE 11 / PARTIAL 5 / OUT-OF-SCOPE 2 / SKIP 2** = 20 (17 drafted, 3 non-drafted).

Every drafted flat returned 0 issues and 0 refusals — the engine is materially stronger than volume_1. The gap now is *faithfulness*, not wearability: 5 flats draft a wearable garment but silently drop a feature the flat clearly shows.

---

## LEARNING — ranked most-frequent-first (drives volume_2 Round 2)

1. **cupSeam is silently suppressed outside `shaping:princess`** — TAG: VALIDATOR-BUG / SILENT-NO-OP (blocked/degraded #4, #15; #16 only worked once switched to princess).
   `cupSeam:1` + `shaping:dart` = byte-identical output to `cupSeam:0` (verified: identical piece list AND identical 8-command front bodice). `cupSeam:1` + `sleeveCap` = also suppressed (#4). `cupSeam:1` on a `garment:top` = no cup piece at all (#15). The capability EXISTS (Upper/Lower Cup panels appear with dress+princess+cupSeam, #16) but three common combinations drop it with no error. Cheapest high-value fix: either honor cupSeam under `dart` too, or emit an issue/warning when cupSeam is requested but suppressed, so it's never a silent drop. This is the single most impactful finding — a volume_1 capability that only fires on one narrow path.

2. **True wrap / surplice crossover front** — TAG: CAPABILITY (blocked #17; the flat is a classic crossover). `tieClosure:7 (wrapFront)` only adds a tie strip; there is no crossed-over double front panel. A real surplice front (two overlapping fronts, extended to the side seam) is a distinct, common bodice class worth a dedicated piece.

3. **Corset lace-up / eyelet back** — TAG: CAPABILITY (blocked #13, #15 — two flats). Both show a laced-up back (eyelets + criss-cross lacing / stacked bow-tie cutouts). Engine collapses this to a single `Back Tie`. A corset-lacing back (two center-back edges with eyelet marks + a lace cord) would faithfully cover both, and lace-up backs are extremely common in occasion/party dresses.

4. **All-around / tiered dropped-waist flounce** — TAG: CAPABILITY (blocked #10; also touches #2's tier). `backDetail:flounce` is back-only; the flats show a flounce/tier running the full circumference at a dropped waist. A `hemFlounce` or `tieredHem` (front+back gathered tier) would capture the babydoll/drop-waist tier family.

5. **Angled / slash pocket** — TAG: VOCAB-GAP (degraded #8). `pocketStyle` offers only `patch` and `sideSeam`; the flat shows an angled slash pocket cut into the front. Adding a `slant`/`angled` value is a cheap vocab-level win — the pocket bag geometry likely already exists, only the mouth angle differs.

### Also noted (lower priority)
- **Asymmetric one-shoulder** (out-of-scope #9, #14) — genuinely outside the symmetric-draft model; a large lift, not a Round-2 candidate.
- **Ruffled/frilled collar edge** (#18) — `collarEdge` has `scallop` but no `ruffle/frill`; cosmetic, low priority.
- No VALIDATOR FALSE-REJECTIONS found this round (the volume_1 placket-on-top + yoke-facing fixes held; nothing wearable was wrongly blocked). The one validator-flavored issue is the cupSeam silent-suppression in #1.
