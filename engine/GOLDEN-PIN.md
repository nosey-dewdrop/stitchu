# Golden pin declaration ledger

Every re-pin of engine/golden-reference.csv is DECLARED here. A re-pin without
a ledger entry is invalid. The ctest golden_check diffs each build's dump
against this repo pin (never regen-vs-regen); a FAIL means either fix the
engine or do a declared re-pin via scripts/repin-golden.sh (Damla approval
required for behavior changes).

## Pin history

### 2026-08-24 — 23406 lines, md5 d5b5f28b2ef41a776b14699e9220982a (DAMLA ONAYI BEKLIYOR, K-V1A)
- Label: "scye derinligi Aldrich p.11'e baglandi (52ae85c) — depth = 0.10*bust
  + 122mm + nape ofseti, kaynaksiz backLength*0.44 kolonu terk edildi; bagimsiz
  tanik sloper_check (temmuz pini) scye depth 189.0 -> 210.0mm, Aldrich 215
  icinde".
- Divergence commit: 52ae85c "KIRMIZI: source the scye depth to aldrich, solve
  the scye hollow, gate the shipped line" (23 Aug 2026). Site of the change:
  `engine/src/bodice.cpp:905-907` (shoulder seam length now bust-sourced) and
  `engine/src/bodice.cpp:917-924` (scye depth).
  - OLD: `torsoArmholeY = backLength * armholeDepthFactor + shoulderDrop`
    (backLength * 0.44, an unsourced size-table column that STALLS at EU44->46 —
    that stall is where the armhole grade broke).
  - NEW: `torsoArmholeY = bust * scyeDepthPerBust + scyeDepthInterceptMM +
    neck * backNeckCutoutFactor`, i.e. `0.10*bust + 122mm` from Aldrich p.11's
    two published points (21.0cm @ bust 88, 21.4cm @ bust 92), plus the nape
    offset because Aldrich measures the depth FROM THE NAPE while our y origin
    is the neck-point line.
  - Same commit also sources the shoulder seam to Aldrich p.11 (12.25cm @ bust
    88, 12.5cm @ bust 92 -> `shoulderSeamMM = 0.0625*bust + 67.5`), replacing a
    flat 126mm that was only right at one size.
- CONTENT DIFF (what moved, not line arithmetic). 23406 -> 23406 lines, ZERO
  keys added or removed, key order byte-identical. 9651 lines (41.23%) changed
  IN PLACE; overall max delta 62.7764mm, median 5.6000mm. Per piece
  (`n` = changed lines, max/median in mm):

  | piece | n | max mm | median mm |
  |---|---|---|---|
  | Bodice Front | 1020 | 62.7764 | 6.1286 |
  | Top Front | 615 | 62.7764 | 6.1286 |
  | Balloon Sleeve | 2520 | 49.7051 | 23.7478 |
  | Sleeve | 1995 | 49.7051 | 23.2728 |
  | Bodice Back | 2120 | 47.4355 | 0.0022 |
  | Top Back | 840 | 47.4355 | 3.2499 |
  | fabric (yardage rows) | 41 | 0.1000 | 0.1000 |
  | Skirt Front | 150 | 0.0001 | 0.0001 |
  | Skirt Back | 150 | 0.0001 | 0.0001 |
  | Skirt Skirt Panel (quarter circle) | 200 | 0.0001 | 0.0001 |

  Reading: everything that moved is a BODICE/SLEEVE piece — the six garment
  pieces the scye depth and shoulder seam actually feed. The skirt pieces DID
  NOT MOVE: their largest delta across all 500 changed skirt rows is 0.0001mm
  (last-digit print noise, not geometry). The 41 `fabric` rows moved by exactly
  0.1 (yardage rounding step) and no more. Sleeves carry the largest median
  because the cap re-seats by bisection onto the new armhole.
- INDEPENDENT WITNESS: `sloper_check` (ctest #51) — pinned in July from an
  independent Aldrich hand-draft, i.e. it was NOT written to match this change.
  It was RED before 52ae85c and is GREEN today with the NEW number:
  `engine/build/sloper_check` prints
  `scye depth below nape   engine 210.0   aldrich 215.0   err -5.0 mm`
  `[PASS] scye depth below nape within 15 mm of the Aldrich draft`
  `all sloper checks pass — EU38 block within the pinned Aldrich bounds`
  (`ctest -R ^sloper_check$` -> `100% tests passed, 0 tests failed out of 1`).
  So this re-pin seals a real improvement measured by a third party; it does not
  silence a red.
- Recipe path shipped in the same chain: `recipes/shift-dress-square-spaghetti.json`
  now draws the scye with the motor's OWN solver (`scye` op, e4516cf) instead of
  copying its control points. `recipe_dress_check` -> PASS 125 / FAIL 0, exit 0.
  Evidence log: `GECE/log/V1-A.olcum.txt`, full ctest `GECE/log/V1-A.ctest.after.txt`.
- APPROVAL STATUS: **DAMLA ONAYI BEKLIYOR (K-V1A)** — varsayilan yurudu (the pin
  and the ledger are committed together so the tree is coherent), but the
  behavior change is NOT taste-approved yet. Damla's eye on the new armhole is
  the open gate.

### 2026-07-28 — 23406 lines, md5 fcaa935448b58ef38d108ffeda49e2df (DAMLA APPROVAL PENDING)
- Label (pending Damla's wording): "set-in armscye — kollu giysiler artik
  set-in kol oyugu aliyor, kolsuz-teget degil".
- What changed vs previous pin (7c3d83f...): the set-in armscye kernel model
  (bodice.hpp setInArmhole*) is wired into the engine's own SLEEVED drafting
  (makePiece + makePrincessPieces, setInScye = !sleeveless && neckline!=Halter).
  cp1 breaks from the shoulder-seam tangent and drops into the scye; deeper
  hollow than the sleeveless curve. 5372 lines changed, ALL sleeved dresses
  (balloon/straight sleeves); ZERO sleeveless (none.*) and ZERO skirt lines
  changed. Zero keys added/removed. Example (dress/crew/aLine/straight.short,
  Bodice Front armhole cubic): cp1 (222.3,65.8)->(180.4,122.0),
  cp2 (217.1,186.2)->(211.6,171.9); shoulder tip + underarm endpoints unchanged.
- Why: a set-in sleeve needs a set-in armhole; the old tangent-continuous
  sleeveless scye was geometrically wrong under a sleeve (the Bugra-Locket bridge
  measured a 20.6mm structural residual from exactly this). Geometry, not a
  reference copy (Damla 2026-07-28: "geometri knows it all").
- Verification: full ctest 79/79 green incl. sleeve_check + cap_sleeve_check
  (sleeve caps RE-SEAT to the new armhole by bisection — the seam-match invariant
  holds) + all validators clean; golden dump byte-deterministic (2 runs == pin).
  Visual before/after: ~/Desktop/SETIN-ARMSCYE-before-after.png.
- Approval status: DAMLA TASTE-CHECK PENDING (Kapi 2). Geometrically verified;
  awaiting Damla's eye on the visual + her approval label before this pin is
  final. NOT committed until approved.

### 2026-07-19 — 23406 lines, md5 7c3d83f237c7596d573f6155da72a918
- Label (Damla's approval wording): "Aldrich blok revizyonu (20cc289),
  kagit-dogrulanmis, muslin-bekliyor".
- What changed vs previous pin (23034): single divergence commit 20cc289
  "refine dart drafting to aldrich" (18 Jul). Shoulder seam 78.5mm/32.8deg ->
  117.7mm/22deg (Aldrich block), bust dart 11.5deg -> 15.4deg, straight-skirt
  waist dart splits above 30mm. 537 of 561 garments changed in place (max
  delta 79.2mm, bigNeckSmallShoulder shoulder tip); +372 lines = 62 garments
  x split dart (+6 lines each). Zero keys added or removed.
- Evidence: reports/2026-07-19-stitchu-golden-adli.md (forensic, per-commit
  dumps) + reports/2026-07-19-stitchu-golden-fark-ozeti.md (landmark tables,
  5 side-by-side renders in reports/golden-fark/).
- Verification status: paper-verified (K4 sloper, Aldrich 6th ed. independent
  hand calculation, ctest sloper_check pins the new values). MUSLIN PENDING:
  no sewn proof yet; first muslin planned from the bigNeckSmallShoulder body
  (largest shoulder delta, +75mm).
- Approved by Damla 2026-07-19 with the label above.

### 2026-07-17 — 23034 lines, md5 0f1ff71b (retired)
- Pinned at 234659b "smooth bezier armholes". Last reproducible from commit
  00f429c; retired because 20cc289 changed drawing behavior. Kept in git
  history; restoring it requires reverting 20cc289's drawing values (would
  break sloper_check, see forensic report question 2/A).
