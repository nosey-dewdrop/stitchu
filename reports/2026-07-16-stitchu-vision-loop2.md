# stitchu — Vision LOOP 2 / patch 2.2 (V1: neckline disambiguation)

Date: 2026-07-16
Scope: worker.js vision prompt only. Zero C++, zero engine code, golden untouched.
Deploy: wrangler version `5cb94ca5-3bca-4615-813d-25022db14f2c`.

## GOAL
V0 (LOOP 1) located the cheapest lever: the neckline field. 5 of 7 vision misreads
were neckline, and the pattern was always the same — a garment's FRONT reads
correctly but its BACK/worn-view photo invents a different neckline (a nape bow read
as "halter", a back cut-out read as "vNeck"/"square"). LOOP 2's job: a prompt rule
so front+back are ONE garment with ONE neckline.

## CREDIT
Available. 1-photo probe on JACKIE (13.47.49) returned a valid vision spec before any
change (reproduced the `neckline=square` misread). Full 59-call live runs succeeded.

## CHANGE (worker.js, mapping rules)
Added a NECKLINE disambiguation block:
- Decide the neckline from the FRONT; a garment has ONE neckline.
- BACK/WORN VIEW: a bow/tie/cut-out at the NAPE is a back detail (backDetail/closure),
  NOT a halter and NOT a vNeck. If the front neckline is not visible, infer from the
  front collarbone line or return null — never guess an exotic neckline from back-only
  evidence.
- HALTER only when a band clearly rises from the front and wraps AROUND the neck with
  both shoulders bare (always sleeveless). A back bow/tie/keyhole is NOT a halter.
- DEFAULT to the common shape: when unsure, fall to {boat, crew, scoop} rather than
  reaching for square/vNeck/sweetheart/halter.
- Word (not photo) examples anchoring each case.

## MEASUREMENT (live FAST, same conditions before/after)
Baseline was the confirmed V0 numbers; after = fresh 59-call FAST run (8m20s).

| metric | before | after | delta |
|---|---|---|---|
| FULL PATTERN /54 | 22 | 24 | +2 |
| vision-accuracy | 46/53 (86.8%) | 51/54 (94.4%) | +7.6pp |
| neckline misreads | 5 | 2 | -3 |
| WRONG | 7 | 4 | -3 |
| ELEMENT ACCURACY /103 | 53 (51.5%) | 53 (51.5%) | 0 (vision loop) |

Note: the vision-accuracy denominator moved 53→54 because the photo that was ERROR in
the cached V0 run returned a valid spec on the fresh run (no cached-spec gap this time).

### The 3 fixed (all back/worn outliers)
- 13.48.06 Mira back (bow): halter → null neckline + backDetail=tieBack (front not
  visible → null, tolerated).
- 13.48.17 Jackie gingham back: vNeck → crew.
- 13.50.24 Tie Back polka back: halter → boat + backDetail=tieBack → **FULL**.

### The 2 still WRONG on neckline (honest ceiling)
- 13.47.49 JACKIE front: still square (should be boat/crew) — a genuinely ambiguous
  FRONT shot, not a back-view confusion.
- 13.48.42: vNeck (should be boat/crew) — FRONT read, ambiguous.
(The other 2 WRONG are non-neckline: a sleeveStyle and a shaping=princess misread.)

## REGRESSION GUARD
FULL rose (22 → 24). No revert. Had FULL dropped, the prompt change would have been
reverted per the loop rule.

## DELIVERABLES
- worker.js prompt block + wrangler deploy (live).
- reports/stitchu-vision-progress.md: L2 V1 row + 4 ASCII bars extended.
- BENCHMARK-58.md: status line + Sayı serisi entry.
- web/patches.html: patch 2.2 entry (now-highlighted), EN+TR, delta badge, honest note.
- linkedin.md Essay 15, devlog.md reels Z1/Z2.
- benchmark-58/vision-error-taxonomy.md stays as the V0 artifact (local, gitignored).

## NEXT
LOOP 3 (V3 / patch 2.3): front/back consistency — group the same product's front+back
photos so the remaining variance (and the null-when-back-only rule) is handled at the
source. Two of the three fixes here already lean on null-on-back; V3 formalizes it.
