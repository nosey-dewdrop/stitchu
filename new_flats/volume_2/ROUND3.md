# stitchu volume_2 — Round 3

Engine: `engine/dist/stitchu-engine.js` (fresh — cup seam EXTENDED to include **halter** (a sleeveless princess halter bodice now gets Upper/Lower cups); new **CORSET LACE-UP BACK** `laceUpBack:1` — an eyelet column marked on the CB back edge + a continuous `Lacing Cord` piece, composes with cup seam; both bridge-wired).
Body B: bust 88, waist 70, hip 94, shoulder 37, backLength 40.5, armLength 58, neck 35.
Call: `JSON.parse(engine.draftJSON(spec, body))` → `{ pattern.pieces[].name, issues, error? }`. (Note: `draftJSON` returns a JSON **string**; `error` is absent on success, `issues:[]`.)
Method (compounding, targeted): re-try Round 2's lace-up holds (#13, #15) with `laceUpBack:1` + halter cups; re-check halter bustier faithfulness; reconfirm the 11 wearables + #4. WEARABLE = `error:null` + `issues:[]` + faithful to the flat.

Every drafted spec below returned `error:null` and `issues:[]`. The engine refused nothing. The verdict split is faithfulness measured against piece lists.

---

## 1. The two capabilities, measured

### `laceUpBack:1` — corset lace-up / eyelet back (NEW)
Isolated on a plain fitted back it replaces the single `Back Tie` with a real corset closure:
- **Eyelet column** — 13 evenly-spaced (~29 mm) diamond markings punched down the CB edge (x≈17–23, y=36→385) of `Bodice Center Back`. Eyelets are *markings on the panel*, not a separate cut piece (correct — eyelets are holes, not fabric).
- **Lacing Cord (korse bağcığı)** — a real cut piece: `cut 1 rectangle 54 x 1252 mm (finished 12 x 1222 mm), one continuous lace, criss-cross between the two eyelet columns and tie off at the top`.

Isolation proof: `princess dress square + laceUpBack:1` → 10 pcs incl. `Lacing Cord`, `issues:[]`. `dart top crew + laceUpBack:1` → 4 pcs incl. `Lacing Cord`, `issues:[]`. It works on any fitted (princess/dart) back.

### Cup seam now fires under `halter` (EXTENDED)
- `halter + princess + cupSeam:1` **top** → 8 pcs, Upper/Lower Cup panels PRESENT, `issues:[]`.
- `halter + princess + cupSeam:1` **dress** → 10 pcs, cup PRESENT, `issues:[]`.
- `halter + dart + cupSeam:1` → cup still suppressed (3 pcs) — correct: cup needs princess, unchanged from Round 2.

---

## 2. The two moved flats — PARTIAL → WEARABLE (count move: +2)

### #13 — 19.37.11 — shoulder-tie corset dress, sweetheart, lace-up eyelet back, circle skirt
Spec: `garment:dress, shaping:princess, neckline:sweetheart, sleeveStyle:none, ruffledStraps:2, laceUpBack:1, skirtStyle:halfCircle, skirtLength:mini`
- **8 pieces, `error:null`, `issues:[]`.**
- Pieces: Bodice Center Front / Bodice Side Front / Bodice Center Back / Bodice Side Back / Bias binding (neckline + armholes) / Skirt Panel (quarter circle) / **Lacing Cord (korse bağcığı)** / Wide Strap.
- Lacing cord piece: **YES**. Eyelet pieces: **markings** (13-eyelet column on CB back, no separate piece — faithful).
- Round 2 collapsed the laced back to a single `Back Tie`; now the eyelet column + criss-cross lacing cord draft faithfully. **PARTIAL → WEARABLE.**
> Note: `laceUpBack:1` replaces the old `tieClosure:4` back tie — you use one or the other, not both. `laceUpBack` is the faithful corset path.

### #15 — 19.37.37 — halter corset top, cup bodice, laced eyelet back
Spec: `garment:top, shaping:princess, neckline:halter, sleeveStyle:none, cupSeam:1, laceUpBack:1, topLength:hip`
- **9 pieces, `error:null`, `issues:[]`.**
- Pieces: Upper Cup Center Front / Lower Cup Center Front / Front Body Center Front / Upper Cup Side Front / Lower Cup Side Front / Front Body Side Front / Top Back / Bias binding (halter) / **Lacing Cord (korse bağcığı)**.
- Lacing cord piece: **YES**. Cup panels: **YES** (Upper/Lower Cup ×2). Eyelet column: **markings** on Top Back.
- **BOTH** new capabilities fire together on the same draft: halter now gets cups AND the laced back is a real corset lacing. Round 2 dropped the cup (halter not allowed) AND collapsed the laced back to one tie — both are now faithful. **PARTIAL → WEARABLE.**
> Round 2 required BOTH "cup under halter" + "lace-up back" to flip #15. Both landed. `shaping:princess` (not `dart`) is required for the cup — under `dart` the cup silently drops (residual of Round 1's princess-only cup rule).

---

## 3. Faithfulness upgrades (NOT count moves — no inflation)

- **Halter bustier cup class** — like #4 in Round 2, any strapless/halter princess bustier now draws the horizontal cup seam instead of relying on princess paneling alone. Verified: `halter+princess+cup` top (8 pcs, cup present) and dress (10 pcs, cup present). No volume_2 flat beyond #15 depends on this, so it is a **fidelity gain, not a new wearable**.

---

## 4. Wearables re-confirm (all 11 + #4 stay wearable, `issues:[]` — no regression)

| Flat | pcs | issues |
|---|---|---|
| #1 princess square mini | 9 | [] |
| #2 shirred-bust tank | 5 | [] |
| #3 empire gathered dress | 6 | [] |
| #4 square cap bustier (cup drawn) | 12 | [] |
| #6 sweetheart gore dress | 7 | [] |
| #11 V-back bow shift | 7 | [] |
| #12 round-low-back A-line | 6 | [] |
| #16 sweetheart bustier | 12 | [] |
| #18 peter-pan collar placket dress | 8 | [] |
| #19 pussy-bow peplum top | 7 | [] |
| #20 smocked-waist peplum top | 6 | [] |

Remaining partials unchanged: #8 slash pocket (7 pcs, still `Pocket Bag (side-seam)`), #10 all-around flounce (4 pcs, still `Back Flounce` only), #17 surplice (4 pcs, still `Wrap Front Tie` strip). #9/#14 out-of-scope (asymmetric one-shoulder), #5/#7 skip.

---

## Honest tally

| | Round 2 | Round 3 | Delta |
|---|---|---|---|
| WEARABLE | 11 | **13** | **+2** |
| PARTIAL | 5 | **3** | −2 |
| OUT-OF-SCOPE | 2 | 2 | 0 |
| SKIP | 2 | 2 | 0 |

**Count delta: +2** — #13 and #15 both moved PARTIAL → WEARABLE. #13 via the lace-up back alone; #15 via lace-up back **and** halter cups together (it needed both). This is the compounding payoff of Round 2's rank-1 pick (corset lace-up, unlocks 2) + rank-3 (cup under halter) landing together.

**Faithfulness delta: +1** — halter bustier cup class (fidelity, not a new wearable).

Every WEARABLE = `issues.length === 0` + a piece list that includes the faithful feature (lacing cord present for #13/#15, cup panels present for #15). No inflation.

---

## REMAINING learnings — Round 4 backlog (ranked by volume_2 flats unlocked)

1. **True wrap / surplice crossover front** — TAG: **CAPABILITY** — blocks **#17** (1 flat).
   `tieClosure:7 (wrapFront)` only adds a `Wrap Front Tie` strip; there is no crossed-over double front panel. A real surplice front = two overlapping fronts extended past CF to the side seam. A common, high-frequency bodice class (wrap dresses/tops). **Highest-value remaining capability** — it is a whole bodice family, not a one-off, and it is the only remaining CAPABILITY that unlocks a volume_2 flat cleanly.

2. **All-around / tiered dropped-waist flounce** — TAG: **CAPABILITY** — degrades **#10** (1 flat, touches #2).
   `backDetail:flounce` is back-only; the flats show a flounce running the full circumference at a dropped waist. A `hemFlounce`/`tieredHem` (front+back gathered tier) captures the babydoll/drop-waist tier family.

3. **Angled / slash pocket** — TAG: **VOCAB-GAP** (cheapest) — degrades **#8** (1 flat).
   `pocketStyle` offers only `patch`/`sideSeam`; #8 shows an angled slash pocket cut into the front. Bag geometry already exists; only the mouth angle differs — likely a vocab-level add, not new construction.

**Round-4 pick:** **True wrap / surplice crossover front** (rank 1, CAPABILITY). It is now the single highest-value learning: the lace-up + halter-cup work cleared the 2-flat item, so surplice is the last remaining *capability* touching an unlocked flat, and it represents an entire wrap-front garment family (dresses + tops) rather than a single flat. Slash pocket (rank 3) is cheaper but only cosmetic-VOCAB and touches one flat.

### Residuals (unchanged)
- **Cup under `dart`** — still silently suppressed; cup needs `shaping:princess` (Round 1 residual). Consider emitting an issue when `cupSeam:1` is requested but the shaping suppresses it, so it is never a silent drop.
- **Asymmetric one-shoulder** (#9, #14) — outside the symmetric-draft model; large lift, not near-term.
- **Ruffled collar edge** (#18 trim) — cosmetic, low priority.
- No validator false-rejections this round; every drafted flat returned 0 issues.
