# Round 2 — 23 flats re-measured with the STRONGER engine

**Date:** 2026-07-23 · **Body:** bust 88 / waist 70 / hip 94 / shoulder 37 / backLen 40.5 / armLen 58 / neck 35
**Engine delta since Round 1:** `cupSeam` (sweetheart+princess bustier cup split), `yoke` (bodice yoke split → Front/Back Yoke + Front/Back Body), and a **placket-on-top wearability fix**.
**Rule (no inflation):** WEARABLE = `out.issues.length===0` AND a faithful spec. A yoke that only drafts 0 issues after dropping the flat's collar, or that doesn't gather where the flat gathers, is still **PARTIAL**.

## New tally

| Verdict | Round 1 | Round 2 | Δ |
|---|---|---|---|
| **WEARABLE (0 issues, faithful)** | 8 | **9** | **+1** |
| PARTIAL | 6 | 5 | −1 |
| OUT-OF-SCOPE | 3 | 3 | 0 |
| SKIP (pattern sheets ×4, junk ×2) | 6 | 6 | 0 |
| **Total** | 23 | 23 | |

Of the 14 real garment flats: **9 wearable, 5 partial**. Regression check: all 8 Round-1 wearables still draft 0 issues with the new engine — no regression.

## The delta — 1 flat moved PARTIAL → WEARABLE (placket-on-top fix)

### #10 · `19.23.31.png` — mock-collar blouse, puff sleeve, asymmetric placket, back bow, peplum
- **Round 1:** PARTIAL — `[sideseam] Top: front side seam 324.9 vs back 350.4` (asymmetric placket on a top broke the side seam).
- **Round 2:** **WEARABLE, 0 issues.** The placket-on-top fix balances the front side seam.
- **Spec:** `garment:top, shaping:dart, neckline:crew, sleeveStyle:balloon, sleeveLength:short, topLength:hip, collarType:2(mock), placketStyle:2(asymmetric), buttonRow:1, tieClosure:4, peplum:1, sleeveCap:2`
- **Pieces (9), 0 issues:** Top Front · Top Back · Front Neck Facing · Back Neck Facing · Balloon Sleeve · Sleeve Cuff · Back Tie · Mock Collar · Peplum
- **Isolation proof:** `placketStyle:2` alone on a bare top (Top Front · Top Back · Bias binding) also drafts **0 issues** — the regression is genuinely fixed, not masked by the other features.

## Yoke: capability is REAL, but no yoke flat reaches a faithful 0-issue draft yet (honest hold)

`yoke:1` **does** produce a true yoke split — `Front Yoke · Front Body · Back Yoke · Back Body` (and the princess variant splits each into Center/Side, 8 body pieces). On a **dress with bias binding and no collar it drafts 0 issues.** But every yoke flat in this set carries a Peter-Pan collar and/or is a top, and hits two **new validator bugs** the yoke split introduced:

| Flat | yoke split works? | Why it's still PARTIAL |
|---|---|---|
| #13 `19.24.04` doll dress | yes | Peter-Pan collar → neck facing → **yoke+facing validator bug** (2 issues). Drop the collar → 0 issues, but that drops a defining feature. |
| #16 `19.24.51` babydoll dress | yes | Same yoke+facing bug **and** the body clearly gathers into the yoke — plain yoke adds no fullness at the yoke seam. Two problems. |
| #12 `19.23.45` swing top | partial | `yoke:1` on `garment=top` → **yoke-on-top validator bug** (always "Front/Back piece missing"), 4 issues. Also needs a center inverted box-pleat body. |

The yoke bugs are the same shape as the placket bug just fixed: the split renamed the main pieces, but the facing/top-completeness validators still look for the **old** names (`Front body piece`, `Front piece`), so they report them missing. Isolation proof:
- `dress + yoke:1 + edgeFinish:facing` → `[facing] Front body piece missing` ×2.
- `dress + yoke:1 + biasBinding` → **0 issues.**
- `top + yoke:1` → `[top] Front piece missing` + `Back piece missing` (always).

## cupSeam: no faithful target in this set
- **#6 `19.22.47`** is a V-neck princess corset TOP with a **pointed hem** — no horizontal cup seam. Forcing `sweetheart+cupSeam:1` drafts 0 issues but is the wrong garment (adds Upper/Lower Cup the flat doesn't have). Real gap unchanged: the pointed/dipped waist hem. Stays PARTIAL.
- **#20 `19.25.24`** boned corsets — cupSeam adds a cup seam but still no boning/lacing/underwire. Stays OUT-OF-SCOPE.

## Remaining learnings — Round 3 backlog (ranked)

1. **`yoke:1` + neck facing (collar / edgeFinish:facing) validator bug — 3 flats** (#13, #16, #12). Cheapest, highest-value fix: teach the facing validator the yoke piece names. This one fix lets #13 draft its collar faithfully at 0 issues → **partial→wearable**. Same pattern as the placket fix.
2. **`yoke:1` on `garment=top` validator bug — 1 flat** (#12). Top-completeness check looks for the pre-split `Front piece`/`Back piece`. Same root cause, top code path.
3. **Gathered yoke + swing/box-pleat body — 2 flats** (#16 gathered yoke, #12 center box pleat). `yoke` vocab is `[none, plain]` only; babydoll gathers *into* the yoke seam and swing hangs a center pleat from it. Even with bugs 1–2 fixed, the plain yoke won't add this fullness. Needs a gathered/pleated yoke variant.
4. **Shaped hems beyond straight/shirttail/highLow — 3 flats** (#6 pointed corset hem, #9 & #12 box-pleat hem). `hemShape` lacks pointed-V and pleated hems.
5. **Playsuit/romper class — 1 flat** (#1). No leg/crotch construction.
6. **Boned corsetry — 1 flat** (#20). No boning/lacing/underwire.
7. *(minor)* Statement collar sizing (#19), welt/flap pocket (#14) — still draft wearable, feature substituted.

**Round-3 priority:** fix the two yoke validator bugs (learnings 1–2) — same class of fix that just moved #10, and #13 is one facing-name fix away from wearable. Then the gathered/pleated yoke variant (learning 3) unlocks the babydoll/swing silhouettes properly.
