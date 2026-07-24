# Round 1 — 23 fashion-flats vs the stitchu engine

**Date:** 2026-07-23 · **Body:** bust 88 / waist 70 / hip 94 / shoulder 37 / backLen 40.5 / armLen 58 / neck 35
**Rule:** WEARABLE requires `out.issues.length === 0` AND a faithful spec. PARTIAL = drafts wearable but drops a defining feature, OR drafts with a wearability issue. OUT-OF-SCOPE = engine can't represent the class. Junk/blank images and pattern-pieces sheets are skipped.

## Tallies (no inflation)

| Verdict | Count |
|---|---|
| **WEARABLE (0 issues, faithful)** | **8** |
| PARTIAL (wearable but feature dropped, or unwearable-as-drafted) | 6 |
| OUT-OF-SCOPE | 3 |
| SKIP (pattern-pieces sheets ×4, blank/junk ×2) | 6 |
| **Total** | **23** |

Of the 14 real garment flats that map to a garment class: **8 wearable, 6 partial**. 3 flats are whole classes the engine can't touch, 6 images are not garment flats.

## Per-screenshot

| # | File | Garment | Verdict | Pieces | Issue |
|---|---|---|---|---|---|
| 1 | 19.22.06 | Sleeveless peplum-bodice **playsuit/romper**, deep bow back | OUT-OF-SCOPE | — | romper (no leg/crotch) |
| 2 | 19.22.15 | Pattern-pieces sheet (5 pcs) | SKIP | — | — |
| 3 | 19.22.21 | V-neck blouse, long balloon slv + cuff, button front, cup seam, ruffle peplum | **WEARABLE** | 6 | — |
| 4 | 19.22.32 | Blank gray strip | SKIP | — | junk |
| 5 | 19.22.42 | Pattern-pieces sheet | SKIP | — | — |
| 6 | 19.22.47 | Fitted V-neck corset top, short slv, button front, **pointed waist hem** | PARTIAL | 6 | pointed corset hem dropped |
| 7 | 19.22.56 | Blank yellow strip | SKIP | — | junk |
| 8 | 19.23.01 | V-neck empire top, cap slv, shirred midriff, back tie | **WEARABLE** | 6 | — |
| 9 | 19.23.14 | Sleeveless boat top, princess, back button, **box-pleat hem** | PARTIAL | 3 | box pleat dropped |
| 10 | 19.23.31 | Mock-collar blouse, puff slv, **asym placket**, back bow, peplum | PARTIAL | 9 | **NOT WEARABLE: side-seam 324.9 vs 350.4** |
| 11 | 19.23.38 | Pattern-pieces sheet + cut-list table | SKIP | — | — |
| 12 | 19.23.45 | Peter-Pan collar swing top, puff slv, **box-pleat body** | PARTIAL | 7 | swing/box-pleat body dropped |
| 13 | 19.24.04 | Doll dress, collar + **yoke**, puff slv, gathered A-line | PARTIAL | 9 | yoke dropped |
| 14 | 19.24.20 | Sleeveless A-line dress, V-neck, princess, waist pockets | **WEARABLE** | 10 | welt→patch pocket |
| 15 | 19.24.39 | Sheath dress, boat neck, cap slv, **asym placket** | **WEARABLE** | 6 | (asym placket OK on dress) |
| 16 | 19.24.51 | Babydoll dress, Peter-Pan collar, puff slv, **yoke**-gathered | PARTIAL | 10 | yoke approximated |
| 17 | 19.25.03 | Babydoll peplum top, square neck, wide straps, shirred | **WEARABLE** | 6 | — |
| 18 | 19.25.11 | Empire top, scoop neck, puff slv, button front, shirred bust | **WEARABLE** | 6 | — |
| 19 | 19.25.20 | Annotated: scoop, **statement collar**, shirred, peplum, sleeveless | PARTIAL | 8 | statement collar → peterPan |
| 20 | 19.25.24 | 4× **boned corset** flats (lace-up, underwire, boning) | OUT-OF-SCOPE | — | corsetry |
| 21 | 19.25.31 | Halter dress, deep-V halter + neck tie, empire, circle skirt | **WEARABLE** | 4 | — |
| 22 | 19.25.46 | Pattern-pieces sheet (one-shoulder dress, 4 pcs) | SKIP | — | — |
| 23 | 19.25.52 | Gingham pinafore/tank dress, square neck, wide straps, A-line | **WEARABLE** | 6 | — |

### Wearable piece lists (proof: 0 issues)

- **#3** Top Front · Top Back · Bias binding (neckline) · Balloon Sleeve · Sleeve Cuff · Peplum
- **#8** Top Front · Top Back · Bias binding (neckline) · Cap Sleeve · Waist Tie · Shirred Waist Panel
- **#14** Bodice Center/Side Front · Bodice Center/Side Back · Bias binding · Skirt Center/Side Front · Skirt Center/Side Back · Patch Pocket
- **#15** Bodice Front · Bodice Back · Bias binding · Skirt Front · Skirt Back · Cap Sleeve
- **#17** Top Front · Top Back · Bias binding · Shirred Waist Panel · Wide Strap · Peplum
- **#18** Top Front · Top Back · Bias binding · Balloon Sleeve · Sleeve Cuff · Shirred Bust Panel
- **#21** Bodice Front · Bodice Back · Bias binding (halter) · Skirt Panel (quarter circle)
- **#23** Bodice Front · Bodice Back · Bias binding · Skirt Front · Skirt Back · Wide Strap

## LEARNINGS (Round 2 backlog, most-frequent first)

1. **Bodice/skirt YOKE split — 3 flats** (#13, #16, #12). Doll/babydoll/swing garments hang the lower body from a curved horizontal yoke seam. Engine only has a full-length darted/princess bodice, so it approximates with a gathered skirt or shirred panel. Highest-frequency real gap.
2. **Shaped hems beyond straight/shirttail/highLow — 3 flats** (#6 pointed corset hem, #9 & #12 inverted box-pleat hem). `hemShape` lacks pointed-V and pleated hems.
3. **ASYMMETRIC PLACKET on `garment=top` is a WEARABILITY BUG (fix, not gap) — 1 flat** (#10). `placketStyle:2` on a top **always** makes front side seam ~25mm shorter than back (`[sideseam] 324.9 vs 350.4`) — side seams won't sew. Isolated & reproducible: it's the placket alone, not the peplum/tie/collar. Works cleanly on `garment=dress` (#15 drafts 0 issues). Round-2 fix: apply the same front-length/side-seam balancing the dress path uses to the top path.
4. **Playsuit / romper class — 1 flat** (#1). `garment` enum is skirt/dress/top only; no leg/crotch construction. Whole class unrepresentable.
5. **Boned corsetry — 1 flat** (#20). Boning channels, lace-up eyelets, underwire cups. `cupSeam` exists but no boning/lacing/cup-cage; forcing it yields a non-functional "corset".
6. *(minor)* Oversized/statement collar sizing (#19) and welt/flap pocket (#14) — garments still draft wearable, but the feature they're "about" is substituted by peterPan collar / patch pocket.

**Round-2 priority:** the asymmetric-placket-on-top side-seam bug (#3) is the cheapest, highest-value fix — it's a one-condition wearability regression that turns a PARTIAL back into a WEARABLE, and the same construction already works on dresses. Then the yoke split (learning #1) unlocks the most flats.
