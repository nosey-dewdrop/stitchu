# Golden pin declaration ledger

Every re-pin of engine/golden-reference.csv is DECLARED here. A re-pin without
a ledger entry is invalid. The ctest golden_check diffs each build's dump
against this repo pin (never regen-vs-regen); a FAIL means either fix the
engine or do a declared re-pin via scripts/repin-golden.sh (Damla approval
required for behavior changes).

## Pin history

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
