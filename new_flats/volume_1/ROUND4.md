# Round 4 — the gathered yoke (`yoke:2`) lands the babydoll/swing family

**Date:** 2026-07-23 · **Body:** bust 88 / waist 70 / hip 94 / shoulder 37 / backLen 40.5 / armLen 58 / neck 35
**Engine delta since Round 2:** `yoke:2` **gathered yoke** (lower body cut ~1.7× wider and gathered into the yoke seam — babydoll/swing fullness), on top of `yoke:1` plain yoke, the **yoke+collar facing fix**, the **yoke-on-top fix**, cup seam, and the placket-on-top fix.
**Rule (no inflation):** WEARABLE = `out.issues.length === 0` AND a faithful spec. A gathered yoke where the flat actually wants a **center box pleat** is still PARTIAL.

## New tally

| Verdict | Round 2 | Round 4 | Δ |
|---|---|---|---|
| **WEARABLE (0 issues, faithful)** | 9 | **11** | **+2** |
| PARTIAL | 5 | 3 | −2 |
| OUT-OF-SCOPE | 3 | 3 | 0 |
| SKIP (pattern sheets ×4, junk ×2) | 6 | 6 | 0 |
| **Total** | 23 | 23 | |

Of the 14 real garment flats: **11 wearable, 3 partial.** Regression check: all 9 Round-2 wearables still draft 0 issues (#3, #8, #10, #14, #15, #17, #18, #21, #23) — no regression.

## The gathered yoke is REAL and measurable

On the identical bare A-line dress, only the `yoke` value changed:

| | Front Body width span | Front Yoke width span |
|---|---|---|
| `yoke:1` (plain) | 244.2 mm | 210.6 mm |
| `yoke:2` (gathered) | **421.1 mm** | 210.6 mm |

The body is cut **1.72×** wider while the yoke seam stays the same width — i.e. the extra 177 mm of body edge **gathers into the yoke seam**. That is exactly the babydoll/swing construction the flats show (cut full, gather into a fitted yoke), not a wider yoke. This is the fullness `yoke:1` could not add in Rounds 2–3.

Two validator bugs from Round 2 are also gone: `yoke:2` + Peter-Pan collar (neck facing) drafts **0 issues** (was 2), and `yoke:2` on `garment=top` drafts **0 issues** (was 4). Isolation: `dress + yoke:2 + edgeFinish:facing` → **0 issues** (Round-2 repro was 2 `[facing] Front body piece missing`).

## 2 flats moved PARTIAL → WEARABLE via the gathered yoke

### #13 · `19.24.04.png` — doll dress: chest yoke seam, Peter-Pan collar, puff sleeve, A-line/gathered body from the yoke
- **Round 2:** PARTIAL — yoke+collar facing bug (2 issues); dropping the collar reached 0 but dropped a defining feature.
- **Round 4:** **WEARABLE, 0 issues** — collar KEPT, and the body now gathers into the yoke.
- **Spec:** `garment:dress, shaping:dart, neckline:crew, sleeveStyle:balloon, sleeveLength:short, skirtStyle:aLine, skirtLength:midi, collarType:4 (Peter-Pan), sleeveCap:2, yoke:2`
- **Pieces (11), `issues: []`:** Front Yoke · Front Body · Back Yoke · Back Body · Front Neck Facing · Back Neck Facing · Skirt Front · Skirt Back · Balloon Sleeve · Sleeve Cuff · Peter Pan Collar (bebe yaka)
- **Fullness:** Front Body span 432.9 mm vs 244.2 mm at `yoke:1` — faithful gather into the chest yoke, matching the flat's soft fullness falling from the yoke seam.

### #16 · `19.24.51.png` — babydoll dress: Peter-Pan collar, puff sleeve, body clearly GATHERED into the yoke seam
- **Round 2:** PARTIAL — same yoke+collar facing bug, AND the plain yoke added no fullness where the flat densely gathers. The exact flat this capability was built for.
- **Round 4:** **WEARABLE, 0 issues** — collar KEPT, dense gather into the yoke rendered.
- **Spec:** `garment:dress, shaping:dart, neckline:crew, sleeveStyle:balloon, sleeveLength:short, skirtStyle:aLine, skirtLength:mini, collarType:4 (Peter-Pan), sleeveCap:2, yoke:2`
- **Pieces (11), `issues: []`:** Front Yoke · Front Body · Back Yoke · Back Body · Front Neck Facing · Back Neck Facing · Skirt Front · Skirt Back · Balloon Sleeve · Sleeve Cuff · Peter Pan Collar (bebe yaka)
- **Fullness:** Front Body span 432.9 mm (1.77× the plain-yoke 244.2 mm) — the heavy gather this flat visibly wants is now the actual construction, not an approximation.

## Held PARTIAL — honest (no inflation)

### #12 · `19.23.45.png` — swing TOP: Peter-Pan collar, puff sleeve, **center inverted box pleat** hanging from a yoke
- **Round 2:** PARTIAL — yoke-on-top validator bug (4 issues) + box-pleat body gap.
- **Round 4:** the bugs are **fixed** — `garment:top, yoke:2, collarType:4, buttonRow:1, sleeveCap:2` drafts **0 issues** (9 pieces). BUT `yoke:2` distributes fullness **evenly** across the whole body edge (Front Body span 453.3 mm), while the flat hangs one **center inverted box pleat** from the yoke with the rest of the body flat. Even gather ≠ a single center box pleat — the fullness distribution is wrong. **Stays PARTIAL** on faithfulness, not on issues.
- The yoke-on-top / facing bugs that blocked it are cleared, so #12 is now a pure box-pleat gap, no longer a validator problem.

## Remaining learnings — Round 5 backlog (ranked)

1. **Center inverted box pleat (from a yoke or a waist) — 1–2 flats** (#12 swing top; the box-pleat hem also touches #9). This is the single highest-value Round-5 capability: it is the ONLY thing keeping #12 partial (its bugs are already fixed and its collar/sleeve/yoke all draft clean), and it also feeds the box-pleat hem family. A `pleatStyle` / box-pleat-panel variant that plants one center inverted pleat and keeps the rest of the body flat would move #12 partial→wearable and give the engine its first non-gather fullness primitive.
2. **Shaped hems beyond straight/shirttail/highLow — 2 flats** (#6 pointed/dipped corset waist hem, #9 box-pleat hem). `hemShape` still lacks pointed-V and pleated hems. (#12's hem is subsumed by learning 1.)
3. **Playsuit/romper class — 1 flat** (#1). `garment` enum is skirt/dress/top only; no leg/crotch construction. Out-of-scope until a bifurcated block exists.
4. **Boned corsetry — 1 flat** (#20). `cupSeam` alone is insufficient; no boning channels, lace-up eyelets, or underwire cups. Out-of-scope.
5. *(minor)* Oversized/statement collar sizing (#19), welt/flap pocket (#14) — still draft wearable with the feature substituted (peterPan / patch).

**Round-5 priority:** the **center inverted box pleat** (learning 1). It is the last feature standing between #12 and wearable, and unlike the yoke/facing/placket fixes (which were validator bugs) this is a genuine new construction primitive — the first fullness type that is *localized* rather than distributed. Landing it would take the set to 12 wearable / 2 partial and give the engine a pleat primitive it can reuse for pleated hems and pleated skirts.

## Method note (honesty)
- `yoke:1` vs `yoke:2` measured on the identical bare dress isolates the capability: Front Body 244.2 → 421.1 mm, yoke seam unchanged. The extra width is gather, verified from the drafted outline commands, not a trued scalar.
- Every WEARABLE above is `issues.length === 0` with the collar and defining features KEPT, and a pasted piece list.
- #12 is held PARTIAL despite 0 issues because even gather is not the center box pleat the flat shows. Drafting clean is necessary but not sufficient — faithfulness governs.
