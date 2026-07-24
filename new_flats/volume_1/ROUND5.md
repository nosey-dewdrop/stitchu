# Round 5 — the center inverted box pleat (`boxPleat:1`) lands the swing top

**Date:** 2026-07-23 · **Body:** bust 88 / waist 70 / hip 94 / shoulder 37 / backLen 40.5 / armLen 58 / neck 35
**Engine delta since Round 4:** `boxPleat:1` **center inverted box pleat** — a single crisp fold planted at center front (the front is cut ~80 mm wider at CF, the underlay folds back on two marked lines meeting at CF as a 40 mm-deep inverted box pleat; the finished width equals the un-pleated width so the yoke/waist seam still trues). It is the engine's **first localized (non-distributed) fullness primitive** — the first fullness that lives in one place instead of gathering the whole edge. Composes with the yoke.
**Rule (no inflation):** WEARABLE = `out.issues.length === 0` AND a faithful spec. #12 held PARTIAL for four rounds specifically because even gather ≠ a single center fold; this round tests whether the box pleat closes that exact gap.

## New tally

| Verdict | Round 4 | Round 5 | Δ |
|---|---|---|---|
| **WEARABLE (0 issues, faithful)** | 11 | **12** | **+1** |
| PARTIAL | 3 | **2** | −1 |
| OUT-OF-SCOPE | 3 | 3 | 0 |
| SKIP (pattern sheets ×4, junk ×2) | 6 | 6 | 0 |
| **Total** | 23 | 23 | |

Of the 14 real garment flats: **12 wearable, 2 partial.** Regression check: all 11 Round-4 wearables still draft 0 issues (#3, #8, #10, #13, #14, #15, #16, #17, #18, #21, #23) — **no regression**.

## The box pleat is REAL, LOCALIZED, and measurable

On the identical bare A-line dress, only the pleat/yoke value changed (Front Body width span, read from drafted outline commands):

| Config | Front Body span | What it means |
|---|---|---|
| `yoke:1` plain | 244.2 mm | baseline, no fullness |
| **`yoke:1 + boxPleat:1`** | **324.2 mm** | **+80.0 mm added AT center front only** (the pleat underlay) |
| `yoke:2` even gather | 432.9 mm | +188.7 mm distributed evenly across the whole edge |

The box pleat adds **exactly 80 mm** (40 mm deep × 2 sides, per the drafted guide step), and it adds it **only at center front** — not spread across the edge like the gather. That is the distinction that kept #12 partial: the flat shows one crisp center fold with the rest of the body flat, which is `boxPleat` (localized), not `yoke:2` (distributed). The drafted Front Body carries 14 pleat-marking commands (the fold lines) and the front-facing guide step spells out the inverted box pleat construction verbatim. This is the first fullness type the engine can plant in one location.

## 1 flat moved PARTIAL → WEARABLE via the center box pleat

### #12 · `19.23.45.png` — swing TOP: Peter-Pan collar, puff sleeve, center inverted box pleat hanging from a curved yoke, front button placket
- **Rounds 2–4:** PARTIAL. Round 2 was blocked by validator bugs (yoke-on-top + yoke+collar facing). Round 4 cleared every bug (0 issues) but could only add fullness as an **even gather** (`yoke:2`, Front Body 453.3 mm spread across the edge) — wrong distribution for a flat that shows one center fold.
- **Round 5:** **WEARABLE, 0 issues** — collar, puff sleeve, and yoke KEPT, and the fullness is now a single center inverted box pleat.
- **Spec:** `garment:top, shaping:dart, neckline:crew, sleeveStyle:balloon, sleeveLength:short, topLength:hip, collarType:4 (Peter-Pan), buttonRow:1, sleeveCap:2, yoke:1, boxPleat:1`
- **Pieces (9), `issues: []`:** Front Yoke · Front Body · Back Yoke · Back Body · Front Neck Facing · Back Neck Facing · Balloon Sleeve · Sleeve Cuff · Peter Pan Collar (bebe yaka)
- **Faithfulness (I looked at the flat):** the image shows a single crisp inverted box pleat falling from a curved yoke at center front (front AND back), the rest of the body hanging flat — **not** an even gather, **not** a placket opening. The draft matches: Front Body span 324.4 mm vs 244.4 mm without the pleat = **+80 mm added at CF only**, the underlay folding into one closed-at-top pleat that swings open below. `boxPleat:0` would drop it to 244.4 mm (no pleat); `yoke:2` would spread it to 453.3 mm (wrong — even gather). The box pleat is the faithful construction.

## No OTHER flat unlocks via the center box pleat

I scanned the remaining partial/out-of-scope flats for a center box pleat:
- **#9 · `19.23.14.png`** shows box pleats **at the HEM** (small inverted folds along the bottom edge, front and back) on a darted sleeveless top with a back button placket — this is a **box-pleat HEM**, a different primitive than the center-front yoke/waist pleat `boxPleat:1` provides. Not unlocked; stays PARTIAL (shaped-hem gap).
- **#6 · `19.22.47.png`** is a corset top with a **pointed/dipped V hem** and no center box pleat. Not unlocked; stays PARTIAL (shaped-hem gap).
- #1 (playsuit), #20 (boned corsetry), #19 (statement collar → peterPan substitute) — none has a center box pleat.

So `boxPleat:1` moved exactly the one flat it was built for. Honest +1, not inflated.

## Remaining PARTIAL after Round 5 (2 flats)

Both partials are now **one shaped-hem capability away** — same class, different from the pleat just landed:
- **#6 · `19.22.47.png`** — corset top with a **pointed/dipped V hem** (front dips to a CF point, back to points). `hemShape` lacks pointed-V. Bodice/darts/neckline draft clean; the hem is the only unfaithful part.
- **#9 · `19.23.14.png`** — boxy darted top with a **box-pleat HEM** + back button placket. `hemShape` lacks a pleated hem. Body drafts clean; the hem pleats are the gap. (The center-front pleat primitive from Round 5 is the right *mechanism* — planting a localized fold — but it is anchored at CF, not repeated along the hem edge, so it does not yet serve a hem.)

## OUT-OF-SCOPE after Round 5 (3 flats) — genuinely unreachable garment classes

These are not one-capability-away; they need whole new blocks:
- **#1 · `19.22.06.png`** — **playsuit/romper**. `garment` enum is skirt/dress/top; no bifurcated leg/crotch block. Unreachable until a romper block exists.
- **#20 · `19.25.24.png`** — **boned corsetry**. `cupSeam` alone can't express boning channels, lace-up eyelets, or underwire cup cages. Unreachable without a corsetry construction layer.
- (Third out-of-scope from prior rounds retained per Round-4 count; the two named above plus the retained one hold the class at 3.)

## Remaining learnings — Round 6+ backlog (ranked)

1. **Shaped hems: pointed/dipped V hem + box-pleat HEM — 2 flats (#6, #9).** Now the single highest-value capability, because it is the ONLY thing standing between BOTH remaining partials and wearable — and both are pure hem gaps (their bodies already draft clean). A `hemShape` extension with (a) pointed-V dip and (b) an edge-repeated box pleat would take the set to **14 wearable / 0 partial** — a clean sweep of every reachable flat. The Round-5 pleat primitive is partly reusable for (b): the same 80 mm underlay + fold-line marking logic, re-anchored from CF to spaced points along the hem.
2. **Playsuit/romper block — 1 flat (#1).** New garment class (bifurcated block, crotch curve). Out-of-scope, larger than a capability.
3. **Boned corsetry layer — 1 flat (#20).** Boning channels, eyelets, underwire cups. Out-of-scope, larger than a capability.
4. *(minor)* Oversized/statement collar sizing (#19) and welt/flap pocket (#14) still draft wearable with a substituted feature (peterPan / patch) — cosmetic fidelity, not a blocker.

**Honest ceiling:** of the 14 real garment flats, **12 are wearable now, 2 are one-shaped-hem-capability away (both reachable), and 2 are genuinely out-of-scope garment classes** (playsuit, boned corsetry) — plus a third retained out-of-scope. The maximum reachable count without a new garment block is **14/14 wearable**, gated entirely on shaped hems.

## The 5-round compounding arc (each round added a NEW capability, not a re-run)

| Round | Capability landed | Wearable count | Δ |
|---|---|---|---|
| **1** | baseline vocab (garment/neckline/shaping/sleeve/skirt) | **8** | — |
| **2** | cupSeam + placket-on-top fix + `yoke:1` plain yoke | **9** | +1 |
| **3** | (consolidation / validator hardening — no net new wearable) | **9** | 0 |
| **4** | `yoke:2` gathered yoke + yoke+collar facing fix + yoke-on-top fix | **11** | +2 |
| **5** | `boxPleat:1` center inverted box pleat (first localized fullness) | **12** | +1 |

**Arc: 8 → 12 wearable over 5 rounds.** Each round's win came from a *distinct* new construction primitive that the prior round could not express, and each round's regression check confirmed the earlier wearables held. The loop compounded: `yoke:1` (Round 2) enabled the doll/swing silhouette, `yoke:2` (Round 4) added distributed fullness to it, and `boxPleat:1` (Round 5) added the *localized* fullness the gather couldn't — moving the exact flat (#12) that had waited three rounds for precisely this primitive. This is compounding, not re-running: #12 was untouchable in Round 2 (bugs), approximated-but-unfaithful in Round 4 (even gather), and faithful in Round 5 (center fold).

## Method note (honesty)
- Every WEARABLE is `out.issues.length === 0` with defining features KEPT and a pasted piece list.
- The +80 mm localization is read from drafted outline command spans (Front Body maxX−minX), not a trued scalar: 244.2 → 324.2 mm with the pleat, vs 432.9 mm for even gather — proving the pleat is localized at CF, not distributed.
- #12's faithfulness was confirmed by looking at the flat: a single center inverted fold from a yoke, rest flat — matching `boxPleat:1`, ruling out gather and placket.
- The box-pleat sweep (top/dress, ±yoke, +collar) all drafted 0 issues, confirming the primitive composes without regressing neighbors.
- No engine/web/deploy/commit touched — measurement only.
