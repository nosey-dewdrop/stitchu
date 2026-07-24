# stitchu volume_2 — Round 2

Engine: `engine/dist/stitchu-engine.js` (fresh — cup seam EXTENDED to the full strapless-bustier class: sweetheart + square + scoop, sleeveless OR cap sleeve; photo→pattern bridge now wires cupSeam/yoke/boxPleat through).
Body B: bust 88, waist 70, hip 94, shoulder 37, backLength 40.5, armLength 58, neck 35.
Call: `engine.draftJSON(spec, body)` → `{error, issues, pattern.pieces[].name}`.
Method: draft with ONLY vocab.json values; `error:null` + `issues:[]` + faithful = WEARABLE; drafts but drops a clear flat feature = PARTIAL; class not representable = OUT-OF-SCOPE.

Every drafted spec below returned `error:null` and `issues:[]`. The engine refused nothing. The verdict split is faithfulness to the flat, measured against piece lists.

---

## 1. Cup-seam re-tries (the extended capability)

### #4 — 19.35.46 — square-neck cap-sleeve bustier — FAITHFULNESS UPGRADE (was WEARABLE-cup-dropped → now WEARABLE-faithful)
Spec: `garment:dress, shaping:princess, neckline:square, sleeveStyle:straight, sleeveCap:3(cap), cupSeam:1, skirtStyle:aLine, skirtLength:mini`
- **cupSeam:0 →** 10 pieces, NO cup panels (Round 1 state).
- **cupSeam:1 →** 12 pieces, cup panels PRESENT. `issues:[]`.
Pieces (cupSeam:1): Upper Cup Center Front / Lower Cup Center Front / Upper Cup Side Front / Lower Cup Side Front / Bodice Center Back / Bodice Side Back / Bias binding (neckline) / Skirt Center Front / Skirt Side Front / Skirt Center Back / Skirt Side Back / **Cap Sleeve**
**Cup seam now in the piece list: YES.** The horizontal cup seam that Round 1 measured as a *silent no-op* (square + cap suppressed it) now drafts faithfully. The cup seam and the cap sleeve co-exist (12 vs 10 pieces, clean diff). This is the direct payoff of extending cup seam past sweetheart.
> This is a FAITHFULNESS upgrade, NOT a new wearable — #4 was already counted WEARABLE in Round 1 (carried by princess paneling). The tally count does not move; the *fidelity* did.

### #16 — 19.37.43 — sweetheart bustier mini dress — confirmed still faithful (12 pieces)
Spec: `garment:dress, shaping:princess, neckline:sweetheart, sleeveStyle:none, ruffledStraps:2, cupSeam:1, skirtStyle:straight, skirtLength:mini`
Pieces: Upper Cup Center Front / Lower Cup Center Front / Upper Cup Side Front / Lower Cup Side Front / Bodice Center Back / Bodice Side Back / Bias binding (neckline + armholes) / Skirt Center Front / Skirt Side Front / Skirt Center Back / Skirt Side Back / Wide Strap. Cup seam present, `issues:[]`. (Was WEARABLE in Round 1; still is.)

### NEW proof that scoop + square (sleeveless) now fire cup seam
- **scoop, princess, sleeveless, cupSeam:1** → 11 pieces, cup PRESENT, `issues:[]`.
- **square, princess, sleeveless, cupSeam:1** → 11 pieces, cup PRESENT, `issues:[]`.
Both were suppressed in Round 1 (only sweetheart fired). The extension is real across the whole {sweetheart, square, scoop} × {sleeveless, cap} matrix.

### Cup seam on a `top` now also fires (bonus, not a volume_2 flat gap)
- **top, square, princess, cupSeam:1** → 9 pieces INCLUDING Upper/Lower Cup panels + Front Body panels, `issues:[]`. So cup-seam-on-tops (a Round-1 CAPABILITY leftover from #15) is partly addressed: it works when the neckline is in the allowed set.

### #15 — 19.37.37 — halter corset top — STILL PARTIAL (cup seam still dropped, honestly)
Spec: `garment:top, shaping:dart, neckline:halter, sleeveStyle:none, cupSeam:1, tieClosure:4, topLength:hip`
- dart → 4 pieces, NO cup. princess → 5 pieces, NO cup. **halter neckline is not in the allowed cup-seam set** → cup seam correctly suppressed. The laced back cutouts also still collapse to one Back Tie. **Remains PARTIAL.** (Fix path: allow cup seam under `halter` too — a bustier-halter corset is a real class.)

---

## 2. Round-1 partials + out-of-scope re-scan (does the wider cup seam or any composition rescue them?)

| Flat | Class | Re-try result | Verdict |
|---|---|---|---|
| #8 slash pocket | PARTIAL | 7 pcs, `issues:[]`, still `Pocket Bag (side-seam)` — no angled/slash mouth | PARTIAL (unchanged) |
| #10 all-around flounce | PARTIAL | 4 pcs, `issues:[]`, still `Back Flounce` only (back-only) | PARTIAL (unchanged) |
| #13 lace-up back | PARTIAL | 6 pcs, `issues:[]`, still single `Back Tie` (no eyelet/laced closure) | PARTIAL (unchanged) |
| #15 halter cup + laced back | PARTIAL | cup still dropped (halter), laced back still one tie | PARTIAL (unchanged) |
| #17 surplice | PARTIAL | 4 pcs, `issues:[]`, still `Wrap Front Tie` strip — no crossover front panels | PARTIAL (unchanged) |
| #9 one-shoulder ruched | OUT-OF-SCOPE | no asymmetric-neckline vocab / one-shoulder capability | OUT-OF-SCOPE (unchanged) |
| #14 one-shoulder skirt | OUT-OF-SCOPE | asymmetric one-shoulder on a skirt not representable | OUT-OF-SCOPE (unchanged) |

None of the 5 partials or 2 out-of-scope flats are rescued by the wider cup seam or any composition. The cup-seam extension touches only #4 (faithfulness) and #16/#15 (which were already resolved/partial for other reasons).

---

## 3. Wearables re-confirm (all 11 stay wearable — `issues:[]`)

| Flat | pcs | issues |
|---|---|---|
| #1 princess square mini | 9 | [] |
| #2 shirred-bust tank | 5 | [] |
| #3 empire gathered dress | 6 | [] |
| #4 square cap bustier | 12 (was 10 — cup seam now drawn) | [] |
| #6 sweetheart gore dress | 7 | [] |
| #11 V-back bow shift | 7 | [] |
| #12 round-low-back A-line | 6 | [] |
| #16 sweetheart bustier | 12 | [] |
| #18 peter-pan collar placket dress | 8 | [] |
| #19 pussy-bow peplum top | 7 | [] |
| #20 smocked-waist peplum top | 6 | [] |

All 11 confirmed. No regressions.

---

## Honest tally

| | Round 1 | Round 2 | Delta |
|---|---|---|---|
| WEARABLE | 11 | 11 | **0** (count unchanged) |
| PARTIAL | 5 | 5 | 0 |
| OUT-OF-SCOPE | 2 | 2 | 0 |
| SKIP | 2 | 2 | 0 |

**Count delta: 0.** No partial→wearable move — the cup-seam extension improved a flat that was *already* wearable.

**FAITHFULNESS delta: +1** — #4's horizontal cup seam is now actually drafted (10→12 pieces, Upper/Lower Cup panels present) instead of silently dropped. Round 1's rank-1 learning ("cupSeam silently suppressed outside a narrow path") is now materially fixed for the {sweetheart, square, scoop} × {sleeveless, cap} bustier class AND for tops with those necklines. This is the compounding payoff, reported honestly as a fidelity gain, not a new wearable.

Residual of Round-1 learning #1: cup seam is STILL suppressed under `halter` (#15) and under `shaping:dart`. The narrow path widened but is not universal.

---

## REMAINING learnings — Round 3 backlog (ranked by volume_2 flats unlocked)

1. **Corset lace-up / eyelet back** — TAG: CAPABILITY — blocks **#13 and #15** (2 flats).
   Both show a laced-up back (eyelets + criss-cross lacing / stacked bow-tie cutouts); the engine collapses both to a single `Back Tie`. A corset-lacing back (two center-back edges with eyelet marks + a lace cord) would flip **both** #13 and #15 partial→wearable. **This single capability unlocks the most volume_2 flats (2).** Highest Round-3 value.

2. **True wrap / surplice crossover front** — TAG: CAPABILITY — blocks **#17** (1 flat).
   `tieClosure:7 (wrapFront)` only adds a tie strip; there is no crossed-over double front panel. A real surplice front (two overlapping fronts extended to the side seam) is a common bodice class.

3. **Cup seam under `halter`** — TAG: VALIDATOR-GAP — degrades **#15** (1 flat, shared with #1).
   The cup-seam extension deliberately covers {sweetheart, square, scoop}; a bustier-halter corset (#15) still drops the cup. Cheap: add `halter` to the allowed cup-seam neckline set. (Note: #15 is *also* blocked by the lace-up back, so #1 alone fully unlocks it — do #1 and this together.)

4. **All-around / tiered dropped-waist flounce** — TAG: CAPABILITY — degrades **#10** (1 flat, touches #2).
   `backDetail:flounce` is back-only; the flats show a flounce running the full circumference at a dropped waist. A `hemFlounce`/`tieredHem` (front+back gathered tier) would capture the babydoll/drop-waist tier family.

5. **Angled / slash pocket** — TAG: VOCAB-GAP (cheapest) — degrades **#8** (1 flat).
   `pocketStyle` offers only `patch`/`sideSeam`; #8 shows an angled slash pocket cut into the front. Likely a vocab-level add (bag geometry exists, only the mouth angle differs).

**Round-3 pick:** **Corset lace-up / eyelet back** (rank 1) — it is the only remaining learning that unlocks TWO volume_2 flats (#13, #15). Pairing it with the cheap "cup seam under halter" (rank 3) would take #15 fully to WEARABLE and #13 to WEARABLE — a potential **+2 partial→wearable count move** in Round 3.

### Also noted (unchanged from Round 1)
- Asymmetric one-shoulder (#9, #14) — genuinely outside the symmetric-draft model; large lift, not a near-term candidate.
- Ruffled/frilled collar edge (#18 trim) — cosmetic, low priority.
- No validator false-rejections found this round; every drafted flat returned 0 issues.
