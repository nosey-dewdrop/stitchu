# stitchu learn-loop — COMBINED FINAL (both volumes, full-strength engine)

**Date:** 2026-07-24 · **Body:** bust 88 / waist 70 / hip 94 / shoulder 37 / backLen 40.5 / armLen 58 / neck 35
**Engine (full strength):** cupSeam (strapless bustier class — sweetheart/square/scoop/halter, sleeveless-or-cap) · plain + gathered yoke · center inverted box pleat · corset lace-up back · **true wrap/surplice front (`wrapFront:1`)** · placket-on-top + yoke-facing validator fixes. cupSeam/yoke/boxPleat/laceUpBack/wrapFront are all bridge-wired.
**Rule (no inflation):** WEARABLE = `out.issues.length===0` AND a faithful spec. A faithfulness upgrade is **not** a new wearable.

---

## 🌅 MORNING SUMMARY

> **Of 34 real garment flats across two sets, 26 now draft a wearable, sewable pattern (0 issues, faithful piece list). 4 are one named capability away (2 shaped-hem, 1 all-around flounce, 1 slash-pocket vocab). 4 are genuinely out of scope — playsuit/romper, boned corset cage, and 2 asymmetric one-shoulder drafts. The next most-valuable capability is SHAPED HEMS: it unlocks the most remaining flats (2), and both bodies already draft clean.**

| | Wearable | Partial | Out-of-scope | Skip | Images | Arc |
|---|---|---|---|---|---|---|
| **volume_1** | **12** | 2 | 3\* | 6 | 23 | 8 → 12 |
| **volume_2** | **14** | 2 | 2 | 2 | 20 | 11 → **14** |
| **COMBINED** | **26** | **4** | **4\*** | **8** | **43** | **19 → 26** |

\* volume_1's OOS count of 3 holds #1 (playsuit) + #20 (boned corset sheet) + #19 (statement/oversized collar, drafts wearable via a peterPan substitution — a cosmetic-fidelity slot, not a true class exclusion). The two *genuine* permanent exclusions are #1 and #20.

**Combined arc this loop: 25 → 26 wearable.** The one move is volume_2 #17 (surplice top) via `wrapFront:1`. volume_1 gained nothing this round because it contains **no wrap/surplice flat** — an honest +0, not a miss.

---

## What moved this final round: `wrapFront:1` → volume_2 #17

### #17 · `Ekran Resmi 2026-07-23 19.37.57.png` — wrap/surplice V-neck top, crossed-over front bodice
- **Rounds 1–3:** PARTIAL. `tieClosure:7` only added a `Wrap Front Tie` strip — a single, un-crossed `Top Front` (244.4 mm span). The flat's defining feature (the crossover) was dropped.
- **FINAL:** **WEARABLE, 0 issues** — the front now truly crosses over.
- **Spec:** `garment:top, shaping:dart, neckline:vNeck, sleeveStyle:none, wrapFront:1, topLength:hip`
- **Pieces (3), `issues: []`:** `Top Front` · `Top Back` · `Bias binding (neckline + armholes)`
- **Crossover proof (read from the drafted outline, not a trued scalar):**

  | Config | Top Front span | minX | What it means |
  |---|---|---|---|
  | no wrap | 244.4 mm | 0 | plain single front, stops at CF |
  | **`wrapFront:1`** | **354.4 mm** | **−110** | **front extends 110 mm PAST center front** — crosses to the opposite side seam |

  - `cutInstruction: "cut 2 (mirror wrap — right laps over left)"` — the real surplice construction (two overlapping mirrored fronts).
  - A new `closure` key appears on the front piece; the guide steps now reference wrap / surplice / cross.
  - This is a **genuine feature draft, not a substitution** — the tie strip is gone, replaced by an actual crossed-over double front.

**Wrap is a whole family, not a one-off:** `wrapFront:1` composes to a dress too (`Bodice Front · Bodice Back · Bias binding · Skirt Front · Skirt Back`, 0 issues) — so any wrap dress or top in future sets is now covered.

### volume_1 wrap re-check — honest +0
`wrapFront:1` was swept across every volume_1 partial and out-of-scope flat. **None of them is a wrap/surplice garment** — volume_1 is peplum / corset / doll / babydoll / pinafore / halter classes. The sweep drafted 0 issues on top/dress/princess-top (it composes cleanly) but unlocked nothing, because there was nothing to unlock. Honest zero.

---

## Regression — all 25 prior wearables still draft 0 issues

**volume_1 (12):** #3(6) · #8(6) · #10(9) · #12(9) · #13(12) · #14(10) · #15(6) · #16(11) · #17(6) · #18(6) · #21(4) · #23(6)
**volume_2 (13→14):** #1(9) · #2(4) · #3(6) · #4(10) · #6(9) · #11(7) · #12(6) · #13(8) · #15(9) · #16(11) · #18(8) · #19(5) · #20(4) · **#17(3) NEW**

No new capability regressed an existing wearable. (Four volume_1 re-derived specs — #8/#15/#21 and v2#4 — first errored on enum typos in my re-derivation, e.g. `sleeveStyle:straight` not `cap`, `skirtStyle:halfCircle` not `fullCircle`; corrected, they draft 0 issues at the reported counts. Those were re-derivation typos on my side, not engine faults.)

---

## Remaining backlog (ranked by flats unlocked)

| Rank | Capability | Tag | Flats unlocked | Which |
|---|---|---|---|---|
| **1** | **Shaped hems — pointed/dipped V hem + edge-repeated box-pleat HEM** | **CAPABILITY** | **2** | vol_1 #6 (pointed V corset hem), vol_1 #9 (box-pleat hem) |
| 2 | All-around / tiered dropped-waist flounce (front+back gathered tier) | CAPABILITY | 1 | vol_2 #10 |
| 3 | Angled / slash pocket mouth | VOCAB-GAP | 1 | vol_2 #8 |

**Detail:**
- **#6** — corset top with a pointed/dipped V waist hem. Bodice/darts/neckline draft clean; the hem is the only unfaithful part. `hemShape` lacks a pointed-V dip. → **CAPABILITY**
- **#9** — boxy darted top with a box-pleat HEM + back button placket. Body drafts clean; the hem pleats are the gap. The R5 center box-pleat primitive is the right *mechanism* but is anchored at CF, not repeated along the hem edge. → **CAPABILITY**
- **#10 (vol_2)** — `backDetail:flounce` is back-only; the flat runs the flounce the full circumference at a dropped waist. → **CAPABILITY**
- **#8 (vol_2)** — angled slash pocket; bag geometry exists, only the mouth angle differs. → **VOCAB-GAP** (cheapest)

### ⭐ Next most-valuable capability: **SHAPED HEMS (pointed-V dip + box-pleat hem)**
It unlocks the **most remaining flats (2)**, both bodies already draft clean so the hem is the sole gap in each, and the box-pleat-hem half **reuses the R5 localized-fullness primitive** (same 80 mm underlay + fold-line marking, re-anchored from CF to spaced points along the hem). Landing it sweeps **volume_1 to 14/14 reachable wearable — a clean sweep of every reachable flat in that set.** Ranks 2 and 3 each unlock only one flat.

---

## Honest permanent out-of-scope (the real ceiling)

These need a whole new block, not a capability — state them plainly:

1. **Playsuit / romper** — vol_1 #1. `garment` enum is skirt/dress/top; no bifurcated leg + crotch construction. Unreachable until a romper block exists.
2. **Boned corset cage** — vol_1 #20. `cupSeam` + `laceUpBack` express a cup seam and a laced back, but **not** a boned corsetry foundation (boning-channel casings, underwire cup cages). Needs a corsetry construction layer.
3. **Asymmetric one-shoulder / diagonal drafts** — vol_2 #9 (one-shoulder + diagonal ruching) and vol_2 #14 (one-shoulder skirt). The engine drafts on a mirrored center line; an asymmetric draft is a large lift, outside the symmetric-draft model.

**Ceiling:** without a new garment block, the maximum reachable is **28 wearable** (26 today + the 2 shaped-hem flats), gated entirely on shaped hems. The 4 out-of-scope flats above are the honest floor of what the current architecture will never draw.

---

## The combined compounding arc (each round = a distinct new primitive)

| | volume_1 | volume_2 |
|---|---|---|
| R1 | 8 (baseline vocab) | 11 (baseline + cupSeam bustier) |
| R2 | 9 (cupSeam + placket-fix + yoke:1) | 11 (cupSeam extended) |
| R3 | 9 (validator hardening) | 13 (laceUpBack + halter cups) |
| R4 | 11 (yoke:2 gathered + facing/top fixes) | — |
| R5 | 12 (boxPleat:1 center pleat) | — |
| **FINAL** | 12 (wrapFront — no wrap flat here) | **14 (wrapFront true surplice)** |

**Combined: 19 → 26 wearable.** Each round's win came from a *distinct* construction primitive the prior round could not express, and every round's regression check confirmed the earlier wearables held. This final round's primitive — true wrap/surplice crossover — was the last remaining CAPABILITY touching an unlocked flat, and it moved the exact flat (vol_2 #17) that had waited three rounds for precisely a crossed-over front instead of a tie strip.

---

## Method note (honesty)
- Every WEARABLE is `out.issues.length===0` with the defining feature KEPT and a pasted piece list.
- #17's crossover is read from the drafted `Top Front` outline span (244.4 → 354.4 mm, −110 mm past CF) + the `cut 2 (mirror wrap — right laps over left)` instruction + a new `closure` key — a real feature draft, not a tie-strip substitution.
- `wrapFront:1` moved exactly the one flat it was built for (vol_2 #17); the volume_1 sweep confirmed no wrap flat exists there → honest +0.
- All 25 prior wearables re-drafted 0 issues (no regression from any new capability).
- No engine/web/deploy/commit touched — measurement only. Files written: `COMBINED-FINAL.md`, `combined-final.json`.

---
## GÜNCELLEME (shaped hem sonrası, 2026-07-24)

Shaped hem (pointedV + boxPleatHem) eklendi ve DOĞRULANDI (kendim draft ettim):
- **vol1 #6** (pointed corset top): pointedV hem, 0 issue, hem pointed çizili → PARTIAL→WEARABLE
- **vol1 #9** (box-pleat hem top): boxPleatHem, 0 issue, kick pleat çizili → PARTIAL→WEARABLE

**GÜNCEL BİRLEŞİK: 34 gerçek flat → 28 WEARABLE** (26+2), 2 partial (all-around flounce, slash pocket), 4 out-of-scope (playsuit, boned corset, 2 asymmetric one-shoulder).

volume_1: 14/14 reachable wearable (2 out-of-scope hariç her ulaşılabilir flat).
volume_2: 14 wearable / 2 partial / 2 out-of-scope.

Ark: volume_1 8→14 reachable, volume_2 11→14, birleşik 19→28.

Kalan 2 partial: all-around/tiered dropped-waist flounce (CAPABILITY), angled slash pocket (VOCAB-GAP, en ucuz). Kalan 4 out-of-scope gerçekten ulaşılamaz garment sınıfları.
