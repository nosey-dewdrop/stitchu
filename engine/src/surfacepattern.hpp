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
    bool shoulderSeam = true;
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
};

// Builds the four-panel sheath from the body surface with zero ease.
// Throws if the body lacks bust/waist/hip levels.
SurfacePattern buildSheathPattern(const BodySurface& body, const SheathOptions& opt = {});

}  // namespace stitchu
