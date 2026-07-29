# Golden pin declaration ledger

Every re-pin of engine/golden-reference.csv is DECLARED here. A re-pin without
a ledger entry is invalid. The ctest golden_check diffs each build's dump
against this repo pin (never regen-vs-regen); a FAIL means either fix the
engine or do a declared re-pin via scripts/repin-golden.sh (Damla approval
required for behavior changes).

## Pin history

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
