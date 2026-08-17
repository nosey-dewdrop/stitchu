#pragma once
// The single-surface pattern line (Faz C carried into the motor, 2026-08-12).
//
// The garment is ONE 3D surface on the body. Panels are CUTS of that surface,
// the waist ring is sampled ONCE and the bodice-bottom edge and the skirt-top
// edge are the SAME polyline — so the 2.947mm class of ring failure (H3b-rings,
// Logs/paket-2026-08-06) is structurally impossible: there is no second waist
// number anywhere for the two panels to disagree about. Flattening is the
// certified ARAP solver (flatten.hpp, gate flatten_check); what remains between
// the two flattened waist edges is the solver's metric residual, measured and
// gated, never a modelling difference.
//
// The referee object built here is the SHEATH DRESS the proofs used:
// bodice (waist→bust level) + skirt (waist→hem) as front/back panels, side
// seams on the surface, zero declared ease (surface = body; the ease field
// d(t,phi) is the next open front, as recorded in CLAUDE.md). Below the hip
// the body surface narrows toward the pole, which no skirt does — the garment
// surface continues the hip section STRAIGHT DOWN (a generalized cylinder,
// developable, and exactly what a sheath skirt is).
//
// Units mm.
#include <cstdlib>
#include <string>
#include <vector>

#include "bodysurface.hpp"
#include "flatten.hpp"

namespace stitchu {

struct SurfacePanel {
    std::string name;             // walk.py role comes from the name (torso/skirt)
    std::vector<Vec2> contour;    // closed boundary polyline, cut space, mm
    // edge k joins contour[k] -> contour[k+1 mod n]; the lists below give the
    // edge indices of each logical side in ascending grid order, so stitches
    // pair index-to-index across panels.
    std::vector<int> waistEdges;  // along the shared ring, phi ascending (ring arcs only)
    // waist arcs grouped into SEAM RUNS: breaks fall at this panel's darts AND
    // at the opposing layer's dart columns, so bodice run r and skirt run r
    // always span the same ring arc — one stitch per run, both sides congruent
    std::vector<std::vector<int>> waistRuns;
    std::vector<int> farEdges;    // bodice top / skirt hem, phi ascending
    std::vector<int> seam0Edges;  // side seam at the panel's first phi, row ascending
    std::vector<int> seam1Edges;  // side seam at the panel's last phi, row ascending
    // Darts, G2 law: the surface's develop-deficit opens as wedges where the
    // mesh is slit; the two legs of one dart are sewn to each other. Ring
    // points are NEVER consumed — a dart is extra boundary, not missing ring.
    struct Dart {
        std::vector<int> legA;    // edge indices, apex-ward order
        std::vector<int> legB;    // edge indices, apex-ward order (pairs with legA)
        double openingDeg = 0.0;  // measured wedge angle at the waist end
    };
    std::vector<Dart> darts;
    // The two honest numbers of a flattened panel:
    //  - boundaryStrain: worst metric error on the CONTOUR (cut lines). This is
    //    the sewable contract; gate 0.5%.
    //  - maxStrain: worst edge anywhere. On a shaped skirt this is the hip ease
    //    band — the amount real patterns instruct to "ease over the hip" — and
    //    is reported, bounded, and disclosed, not hidden.
    double boundaryStrain = 0.0;
    double maxStrain = 0.0;
    double waistLenMM = 0.0;      // flattened waist edge total (ring arcs only)
    int ringOffset = 0;           // global index of this panel's first ring arc,
                                  // so bodice and skirt zip waist stitches 1:1
};

// One seam of the plan: edge `ea` of panel `pa` is sewn to edge `eb` of `pb`.
// The plan is BUILT with the panels — seam matching is construction, not search.
// An OPENING is a seam that is NOT sewn: the two edges still face each other,
// still have to be the same length, and still get cut and finished — but a
// zipper goes in instead of a stitch line. It stays a PAIR rather than becoming
// two free edges, precisely because a zip whose two sides differ in length
// buckles. So the walk still judges it as an equality seam; only the assembly
// verb changes, and that is the whole difference.
//
// The transition from Opening to Princess along the centre-back seam IS the zip
// end, and that point is where the notch goes. Consumers find it by scanning
// for the last Opening on the seam rather than being handed a separate
// coordinate — one source for where the zip stops, the waist ring's law again.
struct SurfaceStitch {
    // SHOULDER is a kind of its own and NOT because a name passes a gate —
    // docs/H1.0-KAPI.md § K3 says outright that adding the value proves
    // nothing. It is here because the seam it names is the only one in the
    // plan that joins a FRONT panel's far edge to a BACK panel's far edge,
    // and every consumer that groups seams by kind (equality referees,
    // assembly order, the printed instructions) has to be able to say
    // "shoulder" without re-deriving the topology.
    enum Kind { Waist, Princess, Side, Dart, Shoulder, Opening };
    int pa = 0, ea = 0, pb = 0, eb = 0;
    Kind kind = Waist;
};

// ★ TUR 18 — WHY THE SPEC'S STITCH COUNT MOVES WITH SIZE, MEASURED.
//
// spec_census requires the eight sizes to publish the SAME number of stitches,
// and it is right to: one graded pattern is one recipe. Tur 16's shoulder
// source switch broke that (29/29/27/27/27/27/26/26) and took three shipped
// gates red with it. The count that moved is not this list — it is the SPEC's,
// and the spec's count is not a recipe fact at all. It is decided by the
// adaptive cubic fit in tools/surface-pattern.cpp (naturalBreaks -> fitCubics,
// kFitTolMM = 0.15mm): a seam side is cut into as many cubics as it takes to
// stay inside that tolerance, and the chain emits one stitch per cubic. So the
// stitch count is a FITTING RESIDUAL, not a construction.
//
// AND TODAY'S CONSTANT 26 IS LUCK, NOT LAW. Worst fit deviation per size on the
// shipped tree (STITCHU_FIT_DEBUG=1, commit cd8456f), against the 0.15mm gate:
//   EU34 0.1298  EU36 0.1251  EU38 0.1261  EU40 0.1246
//   EU42 0.1299  EU44 0.1307  EU46 0.1296  EU48 0.1305
// Every size sits 0.019..0.025mm under the threshold. Two hundredths of a
// millimetre of geometry anywhere in the bodice flips a seam from two cubics to
// three and the census goes red — which is exactly what the shoulder switch
// did. Under the switch the same worst deviations run 0.1472 (EU42) and 0.1474
// (EU48), i.e. 0.003mm of margin, and the two seams that flip are the BACK
// WAIST run (4 stitches <-> 5) and the FRONT PRINCESS (2 <-> 3).
//
// NOT 16B's CLASS. 16B found a chain that jumps because it has no stitch
// partner to dictate its segmentation (the free `far` edge). This one is
// dictated on both sides — the two sides take the UNION of their breaks — and
// still moves, because what dictates it is a threshold, not a partner. Fixing
// it means giving a seam a segmentation that is a property of the STYLE and
// not of the size's fit residual. That work is in tools/surface-pattern.cpp and
// it will move every golden pin, so it is not smuggled in under a K6 fix.
struct SurfacePattern {
    std::vector<SurfacePanel> panels;
    std::vector<SurfaceStitch> stitches;
    double ringGirthMM = 0.0;          // the single sampled 3D waist ring (polyline)
    double bodiceWaistSumMM = 0.0;     // flattened, all torso panels
    double skirtWaistSumMM = 0.0;      // flattened, all skirt panels
    // The back opening as BUILT, measured on the flattened centre-back seam —
    // which is the length the buyer's zip has to be. It lands on a whole mesh
    // edge, so it is at or just under the requested backOpeningMM, never over:
    // a zip longer than its opening cannot be sewn in, a shorter one can.
    double backOpeningMM = 0.0;

    // ---- DOES THE GARMENT HANG FROM THE SHOULDER? (H1.0 gate, K6) ----
    //
    // A strapless tube and a garment that rests on the shoulders are told apart
    // by ONE number: how far below the shoulder level the top boundary sits at
    // the shoulder point. The gate asks for it, and until this field existed the
    // gate could not ask at all — the top boundary was a private detail of the
    // .cpp. Sign convention: POSITIVE is above the shoulder level, NEGATIVE is
    // below it, so "carries" is shoulderCarryMM >= -tolerance and the tube's
    // failure reads as the large negative number it is.
    //
    // shoulderCarryMM is the WORSE of the front and the back, because a garment
    // supported on one face only is not supported. Both are published so the
    // difference is visible rather than averaged away.
    double shoulderCarryMM = 0.0;   // min(front, back), mm above the shoulder level
    double frontCarryMM = 0.0;
    double backCarryMM = 0.0;
    double shoulderLevelMM = 0.0;   // the body's own shoulder height, for reference
    double shoulderPointXMM = 0.0;  // where the question is asked: shoulderHalf - 10mm
    // How far out the surface actually REACHES at its top boundary. If this is
    // short of shoulderPointXMM the carry number is being read off a column that
    // never gets to the shoulder at all, and the honest reading is "the cloth
    // does not arrive", not "the cloth is low".
    double carryReachXMM = 0.0;
    // PER-COLUMN TOP-BOUNDARY X, mm, signed, length NR+1 (the ring's own column
    // count, phi ascending, column NR repeating column 0).
    //
    // WHY IT IS PUBLISHED. The engine already evaluates this array inside the
    // K6 block; not handing it out forced every consumer to rebuild it from the
    // ZONE MODEL instead (x = shoulderHalf * cos phi), which is a different
    // curve: the surface's own x comes from a fixed-point solve, and the two
    // disagree by -9.4 to -9.7mm at the shoulder point in all eight sizes
    // (docs/H1.0-KAPI.md § 4.1). A second parallel model of the same boundary
    // is exactly the class of error the single-waist-ring law killed, so the
    // boundary is now single-sourced upward as well as downward.
    // Signed, not |x|: the sign is the only thing that separates the two sides
    // of the garment, and a consumer that wants the magnitude can take it.
    std::vector<double> topColXMM;
};

struct SheathOptions {
    double hemDropBelowHipMM = 200.0;  // skirt length past the hip ring — a design dial
    // WEARING EASE per ring, mm of girth. A zero-ease garment is skin and
    // cannot be worn. Defaults are the fitted-dress band the trade agrees on
    // (Threads/RTW: 2" bust, 1" waist, 2" hip; Aldrich close-fitting carries
    // 7cm at the bust) — declared design dials, not laws.
    // SHOULDER TOP — on, and the old warning that sat here was STALE. It said
    // "off by default … cut-line strain goes to 46-65% and the panels fold
    // through themselves. Turn this on when Slit gains a top anchor, not
    // before." The code said `true`. Re-measured 17.08, eight sizes, and both
    // halves of that sentence were out of date:
    //   * shoulderTop=true, skimBodice=true (what ships): cut-line strain
    //     0.0071-0.1501%, all eight sizes under the 0.5% gate. The quarter
    //     panel's develop-deficit is -0.03 to -0.31 deg, not +52.5 — because
    //     skimBodice turned the bodice into a CONE, and a cone develops. The
    //     warning was written before the skim existed and was never re-measured.
    //   * shoulderTop=true, skimBodice=false (the body-following bodice the
    //     warning was actually about): cut-line strain 2.96-48.12%, worst EU48.
    //     Still bad, still not 46-65%, and the number band was stale too.
    // What was NOT stale is the named blocker: Slit could only anchor at the
    // WAIST row. That is now fixed (see topDartFrac), so the sentence has no
    // remaining claim to make.
    bool shoulderTop = true;
    // SKIM: the bodice runs straight from the waist ring to the shoulder instead
    // of following the bust and the neck. This is what a 1960s shift IS, and it
    // is a cone, so it develops exactly.
    bool skimBodice = true;
    // A-LINE HEM SWEEP, mm of finished lower-edge circumference. SOURCED from
    // 1960s Big-4 envelope backs, which printed "width at lower edge" for
    // exactly this garment: 48.5-52.5 inches over a 36 inch hip (Simplicity
    // 7129 c.1967, Vogue 6900 c.1966, Vogue Couturier 2063 / Valentino 1969).
    // 1270mm = 50 inches, the middle of that measured band. 0 = straight sheath.
    //
    // ★ TUR 17 — THIS NUMBER USED TO SHIP AS AN ABSOLUTE, AND THAT WAS THE BUG.
    // Read the source line again: it is a PAIR, "50 inches OVER A 36 INCH HIP".
    // Shipping only the left half of the pair gave every size the same 1270mm
    // hem (measured, 8 sizes, 1269.86mm, total spread 0.03mm) while the waist
    // ring grades +40mm a size — so the A closed as the size grew: EU34 got a
    // full A, EU48 got very nearly a straight skirt. The same style was not the
    // same style at eight sizes. A constant CIRCUMFERENCE is not a measurement,
    // it is one body's number worn by eight bodies.
    //
    // The pair is one data point, and one point cannot by itself say whether
    // the law is a RATIO (hem = hip x 1.3889) or an OFFSET (hem = hip + 355.6).
    // What decides it is how a flared skirt is GRADED: below the hip the side
    // seam is moved PARALLEL, so the hem gains exactly the hip grade and the
    // flare -- the amount the hem stands OUT past the hip -- is what stays
    // constant between sizes. That is the offset law. Its geometric meaning is
    // the thing a buyer actually feels: a constant added circumference is a
    // constant radial stand-off (355.6/2pi = 56.6mm) and therefore the SAME
    // A-angle at every size. The ratio law opens the angle by a third from
    // EU34 to EU48, which is the same defect this ring names, only mirrored.
    // Both laws were measured on all eight sizes; the numbers and the gate
    // counts are in HEDEF.md Tur 17.
    //
    // So: the sweep is DERIVED per size = body hip girth + hemSweepOverHipMM,
    // and 355.6mm is 50 - 36 inches, the source's own pair, subtracted rather
    // than truncated. Negative = fall back to the absolute hemSweepMM below.
    double hemSweepOverHipMM = 355.6;
    // Ratio law, kept because it was measured and because a spec may want it:
    // > 0 overrides the offset (sweep = hip * ratio). 1270/914.4 = 1.38889 is
    // the same source pair read the other way. Default 0 = off.
    double hemSweepHipRatio = 0.0;
    // ABSOLUTE sweep, used only when hemSweepOverHipMM < 0 and the ratio is off.
    // 0 = straight sheath. This is what garment-spec-v2's `hemSweepMM` binds to
    // when a spec states an explicit lower-edge width.
    double hemSweepMM = 1270.0;

    // NECKLINE — design dials, and declared as such. A neckline depth is not a
    // body measurement: the same body wears a crew and a scoop. The one thing
    // that is universal is that the back is shallower than the front, and that
    // is why these are two numbers rather than one.
    // BACK OPENING — a garment you cannot put on is not a garment. The neck
    // opening measured 352.5mm (13.88 inches) against a sourced minimum of 22
    // inches for a PULL-ON garment (Ladies' Garment Cutting and Making, Ch. X).
    // Reaching 22 inches by dropping the front alone needs 190mm, nearly to the
    // bust — so the number was never the fix. Every 1960s A-line envelope lists
    // a closure instead: "22 inch neckline zipper" (Vogue 6900, Vogue Couturier
    // 2063), "16 inch neck zipper" (Simplicity 7129 Jiffy). 558.8mm = 22 inches,
    // the period default. 0 = no closure, and then wearable_check binds.
    double backOpeningMM = 558.8;

    // ---- THE NECKLINE IS DRAFTED, NOT CHOSEN ----
    //
    // These were three numbers I made up: half-width 87.164 (the contract body's
    // neck_w/2, which is a BODY width and not a neckline), front drop 70, back
    // drop 20. Aldrich drafts all three off the neck measurement, and two
    // further systems land on the same width, which is how I know the invented
    // half-width was the one that was wrong:
    //
    //   Aldrich, Metric Pattern Cutting for Women's Wear, 5th ed. p.16
    //     back neck width    0-9  = one fifth neck size minus 0.2 cm
    //     front neck width   4-20 = one fifth neck size minus 0.7 cm
    //     front neck drop    4-21 = one fifth neck size minus 0.2 cm
    //     back neck drop     0-1  = 1.5 cm
    //   GRAFIS CAD, Maße OB 10/50/60:  bHlh = (uHa + 30)/5 - 15  [mm]
    //   Hofenbitzer, Band 1 p.12 (Reihenmessung 1995): HlB Gr.38 = 6.7 cm
    //
    // At our EU38 neck of 35.0 cm those give 6.3 / 6.8 / 6.3 / 6.7 cm — three
    // independent systems inside 5mm. My 8.7 cm was 2 cm too wide, a neckline
    // falling off the shoulder. Coefficients, not numbers, so every size drafts
    // its own neckline from its own neck measurement and the constants die.
    //
    // ONE HONEST SIMPLIFICATION, written down rather than hidden: Aldrich's
    // front neck is 0.5 cm narrower than the back. This surface carries ONE top
    // boundary sampled once over the whole circle (the second law), so the width
    // where the shoulder ends is single-valued and cannot differ front to back.
    // The back value is used, because the shoulder is drawn from it. Expressing
    // the 5mm front difference needs the boundary to carry two widths, and that
    // is a change to the law, not a number to nudge.
    double neckWidthCoefCM = -0.2;    // Aldrich back neck width, off 1/5 neck
    double frontNeckDropCoefCM = -0.2;  // Aldrich front neck drop, off 1/5 neck
    double backNeckDropMM = 15.0;     // Aldrich 0-1, a flat 1.5 cm at every size

    // ---- ARMHOLE ----
    // Without this the shoulder line runs to the side seam and the garment has
    // no armhole: a strap closed from neck to side, which is a yoke and not a
    // sleeveless dress. Aldrich's close fitting sleeveless block, p.28:
    // "Mark points 3 and 4 1 cm in from shoulder edge" and "Draw new armscye
    // depth line 1 cm above original line". The depth itself grades out of the
    // bust — see TopProfile for the derivation and for the one instruction on
    // that page deliberately NOT applied.
    bool armhole = true;
    // ★ H1.0b (Tur 11) — THE STRAP POINT IS ONE NUMBER, AND IT HAS TO BE.
    //
    // This inset decides THREE things that must agree or nothing can be
    // measured: where the engine's scoop starts (TopProfile::strapHalfMM),
    // where the shoulder seam band ends (CrestFold), and which contour edges
    // h10_gate_check counts as ARMHOLE rather than shoulder (its own
    // `strapHalf = shoulderHalf - opt.shoulderNarrowMM`). All three read THIS
    // field, and the gate builds a default-constructed SheathOptions, so the
    // dial has to live in the DEFAULT or the three readers disagree.
    //
    // They did disagree, and it invalidated a rejection. STITCHU_ARMHOLE_SPANDEG
    // (Tur 9) clamps the scoop's start ANGLE inside solveTopH and leaves this
    // inset at 10mm. So at 40 deg the engine cut a hole opening to phi=39.4 deg
    // while the gate still called everything inside phi=20 deg the armhole and
    // the rest "shoulder" — it measured the first third of the scoop. Tur 9 read
    // the result (K1 330 -> 158 -> 88 -> 70mm) as "a wide angle eats the
    // shoulder". MEASURED, Tur 11, EU38, same tree, same run:
    //   3D armhole run, underarm -> shoulder point   as-is 165.26mm
    //     STITCHU_ARMHOLE_SPANDEG=30  179.36  =40  191.39  =50  212.51mm
    //   h10_gate_check K1 for those same runs        as-is 330.13mm
    //                                  =30 158.15  =40  88.27  =50  70.47mm
    // The hole got LONGER in every case the gate called shorter. The angle dial
    // is not measurable by that gate and its rejection does not stand; it is
    // kept, off, with this correction written next to it.
    //
    // So the span is declared HERE, in mm, and in mm on purpose: a drafter's
    // inset is a distance across the shoulder, not an angle, and an angle would
    // not grade — the same degree count is a different inset in every size.
    // Default 10.0 = Aldrich, "Mark points 3 and 4 1 cm in from shoulder edge".
    // ★ THE DEFAULT STAYS A LITERAL ON PURPOSE. It was briefly a call to
    // defaultShoulderNarrowMM() and specv2_check went RED, correctly: the
    // contract declares this quantity's default and reads it out of THIS text
    // (tools/specv2-check.mjs matches `field = <number>`). A field whose default
    // is a function call has no default the contract can check, so the probe
    // moved into the constructor below and the declared value stayed declared.
    double shoulderNarrowMM = 10.0;   // Aldrich: 1 cm in from the shoulder edge

    // ---- THE SHOULDER SEAM: the surface stops being a tube ----
    //
    // MEASURED DIAGNOSIS (Tur 5, ajan 5B; confirmed here): the garment surface
    // is a (h, phi) TUBE. The front panel's top edge lives at y > 0 and the
    // back's at y < 0. Over the shoulder they sit at the SAME height and are
    // never the same curve, so no amount of naming produces a shoulder seam —
    // K3 reads 0 because the topology has no place to put one. The top of the
    // shoulder is a nearly HORIZONTAL region crossed in y, and a tube cannot
    // cross it.
    //
    // So in the shoulder band the top of the surface is folded onto ONE curve,
    // the shoulder seam line, which lies on the crest of the shoulder (y ~ 0).
    // Front and back then share it by construction, exactly as a garment does,
    // and the neck hole and the armhole close at its two ends: the seam runs
    // from the neck point (x = neckHalf) out to the shoulder point
    // (x = strapHalf), and outside that band the weight eases to zero because
    // that is precisely where the two edges are SUPPOSED to part company —
    // into the neckline at the centre and into the armhole at the side.
    // ⚠ OFF BY DEFAULT, AND THAT IS A REVERT, NOT A DESIGN CHOICE.
    //
    // The construction below WORKS and is measured: with it on, h10_gate_check
    // goes 52 -> 24 FAIL of 63 and closes K3 (0 -> 30 shoulder stitches, 8/8),
    // K5 neck-closed (8/8), K5 neck-girth (4/8 -> 8/8) and K6 (8/8), while K2
    // grade stays 7/7. But it BREAKS two taban gates that were green:
    //   surface_pattern_check  0 -> 4 FAIL (torso cut-line strain 0.0071-0.1501%
    //                          -> 1.83/1.86% against a 0.5% gate)
    //   walkgate_check         0 -> 6 hüküm-FAIL, all self-intersection
    // HEDEF.md § YASALAR and RULES 9 say a change that breaks a test is
    // reverted, not shipped, and the taban is the condition of finishing rather
    // than a target. So the switch ships OFF and the ring goes back on the queue
    // with its diagnosis written down instead of patched. Turn it on and the
    // whole shoulder is there; nothing here is a stub.
    //
    // ROOT, MEASURED: the fold's Gaussian curvature has to leave through
    // top-anchored darts, and it cannot.
    //   (a) ⚠ WITHDRAWN 17.08 (Tur 7) — THE DIAGNOSIS WAS WRONG, AND IT IS
    //       WITHDRAWN BY MEASUREMENT, NOT BY OPINION. It said "the top darts
    //       CROSS the waist darts on the torso panels". They do not, because
    //       THERE ARE NO WAIST DARTS ON THE TORSO — with the flag on OR off,
    //       in every size, the torso derives top anchors only and the skirt
    //       derives none at all (STITCHU_SLIT_DEBUG=1, EU34/38/42/48: torso
    //       "T19 T25" / "T18 T24", skirt empty; skirt develop-deficit +0.000
    //       deg, because skimBodice + hemSweep make it a cone). What WAS true
    //       is the row arithmetic: a waist slit duplicates rows [0,
    //       bodiceApexFrac = 0.80) and a top slit duplicates (topDartApexFrac
    //       = 0.55, rowsN], the ranges overlap, and two slits sharing a column
    //       would duplicate every row and sever the panel. So the claim that
    //       they "cannot cross by construction" was indeed FALSE — it just was
    //       not what is breaking the gates today. It is now ENFORCED rather
    //       than asserted: flattenGrid throws on a column carrying both
    //       anchors, and the caller steps a colliding top dart aside first, so
    //       the throw is unreachable rather than merely unobserved.
    //   (b) ⚠ ALSO NOT THE ROOT, MEASURED. The claim was that the front's
    //       deficit sits beside the centre-front cut where
    //       dartColumnsFromDeficitRows weights suppression to zero, so nothing
    //       is derived there. The weighting is real, but the deficit it drops
    //       LEAVES THROUGH THE SEAM, exactly as the weighting says it should:
    //       on EU38 left_ftorso the two vertical seam edges carry 0.012% and
    //       0.092% boundary strain and the waist carries 0.011%, all far under
    //       the 0.5% gate. The 1.83% that fails the gate is on the DART LEGS
    //       (8.929%), not beside the seams.
    //   (c) WHAT THE INSTRUMENT ACTUALLY SHOWS (EU38, STITCHU_SP_DEBUG=1,
    //       left_ftorso): the panel's deficit is not spread, it is a spike and
    //       a trough in the top two row bands — +34.57 deg then -64.34 deg,
    //       against -0.12..-0.18 everywhere below. The trough is a SADDLE, and
    //       a dart cannot absorb a saddle: dartColumnsFromDeficitRows clamps
    //       negative bands to zero for placement, so the fold's negative
    //       curvature is never given anywhere to go and surfaces as leg strain.
    //       That is the next ring's problem, and it is a question about the
    //       fold's shape (CrestFold collapses y onto the crest over bandMM
    //       while the neckline zone keeps its own y), not about dart bookkeeping.
    // Two fixes were tried and BOTH made it worse, so neither is in the code:
    //   crest band 60 -> 120mm: cut line 1.83 -> 0.46% (inside the gate) but
    //     walkgate 6 -> 30 hüküm-FAIL, every size self-intersecting. Rejected
    //     under the Tur 5 precedent — the better number was the worse garment.
    //   topDartApexFrac 0.55 -> 0.80 (ranges made to meet, not overlap):
    //     cut line 1.83 -> 0.91% but interior 6.96 -> 11.67%. Still 4 FAIL.
    bool shoulderSeam = false;
    // How far FORWARD of the crest the seam is placed, mm. A design decision
    // and declared as one: trade practice runs from on-the-crest to about a
    // centimetre forward, and 0 is the neutral reading (the seam on the crest).
    double shoulderSeamForwardMM = 0.0;
    // Vertical depth of the fold, mm — the band below the top boundary over
    // which the surface turns from the body's front/back onto the crest. This
    // is the shoulder CAP, and it is a declared modelling dial like
    // topDartApexFrac, not a drafting number: it says how much of the garment
    // is treated as lying over the top of the shoulder rather than hanging off
    // it. Too small and the fold is a crease no dart set can absorb; too large
    // and the bodice stops following the body well below the armhole.
    //
    // MEASURED BOTH WAYS — see the shoulderSeam note above for the table and
    // for why 120mm was rejected even though it lowers a FAIL count.
    double shoulderCrestBandMM = 60.0;
    double easeNeckMM = 0.0;   // a neckline is cut, not fitted — declared, not omitted
    double easeBustMM = 60.0;
    double easeWaistMM = 25.0;
    double easeHipMM = 50.0;
    int ringSamples = 128;             // the waist ring, sampled once; panels take half each
    double rowStepMM = 8;             // vertical mesh resolution
    int arapRounds = 2000;       // CEILING, not a count — arapFlatten stops on
                                 // its own convergence (max vertex move < 1e-4mm
                                 // over a local/global round). This was 60, and
                                 // 60 did not converge: three of eight sizes kept
                                 // a fold in the last waist column that a
                                 // finished solve does not have.
    int polishIters = 12000;
    int cutRounds = 40;          // alternations of {relax, project} — the
                                 // constraint lives INSIDE the solve, not after it
    int cutSweeps = 400;         // hard projection of the cut lines onto their
                                 // 3D lengths after the energy has run
    double cutEmphasis = 120.0;  // polish weight locking the metric onto cut lines
    // SUPPRESSION LAYOUT — design decisions (G2: only the total is a law).
    // cutFracs are FULL vertical cuts through the half-panel (princess seams;
    // the production Buğra spec splits the torso the same way); dartFracs are
    // waist darts within the resulting sub-panels. Fractions of the half-panel
    // phi span. Apex height is a fraction of the shaped region (bodice:
    // waist->bust, skirt: waist->hip).
    // DART CAP, degrees of develop-deficit per dart. When > 0 the dart COLUMNS
    // are derived from the panel's measured deficit instead of the fraction
    // lists below, and the COUNT follows the load — the front and the back of a
    // real body do not want the same number of darts, and once the body has a
    // front and a back the engine can no longer pretend they do. Set 0 to use
    // the declared fractions (the symmetric-body behaviour).
    double maxDartDeg = 14;
    std::vector<double> bodiceCutFracs = {0.5};
    std::vector<double> bodiceDartFracs = {};
    std::vector<double> skirtCutFracs = {0.5};
    std::vector<double> skirtDartFracs = {0.25, 0.75};  // one dart per quarter, the classic sheath
    double bodiceApexFrac = 0.80;
    // TOP-ANCHORED DARTS. A dart is a slit in the mesh, and until now every slit
    // started at the WAIST row. That is a statement about the garment, not about
    // the solver: a bodice whose deficit sits up under the shoulder had no way
    // to let it out, because the only cut that existed opened from the hem end.
    // A shoulder dart and a neckline dart are the two a bodice with shoulders
    // needs, and both anchor on the TOP boundary.
    //
    // So the deficit is now measured in two bands rather than one, and each band
    // gets the darts that can actually reach it: the band below topDartSplitFrac
    // leaves through waist-anchored slits, the band above it through slits that
    // open from the far edge. Nothing is redistributed and no total is invented —
    // it is the same per-column angle defect, summed over two row ranges instead
    // of all of them.
    //
    // topDartApexFrac is where the top dart's TIP sits, as a fraction of the
    // panel's height above the waist. DECLARED, not measured: 0.55 puts the tip
    // at roughly the shoulder-blade / bust level, which is where drafting texts
    // end a shoulder dart, and it is above the waist dart's own reach so the two
    // cuts cannot cross. Set topDartSplitFrac to 1.0 to switch top darts off
    // entirely and get the waist-only behaviour back, unchanged.
    double topDartSplitFrac = 0.55;   // band boundary, fraction of panel height
    double topDartApexFrac = 0.55;    // top dart tip height, same fraction scale
    double skirtApexFrac = 1.35;  // dart tip runs through the hip blend band
    double hipBlendMM = 90.0;  // hip-corner rounding half-width (drafting "hip curve")

    // THE ONE PLACE A PROBE CAN MOVE THE STRAP POINT FOR THE ENGINE AND ITS
    // JUDGE AT ONCE. h10_gate_check and surface-pattern both build
    // `const SheathOptions opt;`, so an override applied anywhere else reaches
    // one of them and not the other — which is exactly how Tur 9 rejected the
    // span dial on a reading the gate could not make (see shoulderNarrowMM).
    // Unset = every field above, unchanged; the shipped garment is bit-identical.
    SheathOptions() {
        if (const char* e = std::getenv("STITCHU_SHOULDER_NARROW")) {
            const double v = std::atof(e);
            if (v > 0.0 && v < 120.0) shoulderNarrowMM = v;
        }
        // RESOLUTION PROBE, not a dial to turn a gate green. h10_gate_check's
        // splitFar sums WHOLE columns, so every zone length carries a
        // quantisation error of up to one column edge. The only way to tell a
        // real grade break from that error is to make the column narrower and
        // watch: an artefact shrinks with the column, a real break does not.
        // Even is enforced by buildSheathPattern (two halves), so an odd value
        // throws rather than silently rounding.
        if (const char* e = std::getenv("STITCHU_RING_SAMPLES")) {
            const int v = std::atoi(e);
            if (v >= 16 && v <= 4096) ringSamples = v;
        }
    }
};

// Builds the four-panel sheath from the body surface with zero ease.
// Throws if the body lacks bust/waist/hip levels.
SurfacePattern buildSheathPattern(const BodySurface& body, const SheathOptions& opt = {});

}  // namespace stitchu
