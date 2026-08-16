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
struct SurfaceStitch {
    enum Kind { Waist, Princess, Side, Dart };
    int pa = 0, ea = 0, pb = 0, eb = 0;
    Kind kind = Waist;
};

struct SurfacePattern {
    std::vector<SurfacePanel> panels;
    std::vector<SurfaceStitch> stitches;
    double ringGirthMM = 0.0;          // the single sampled 3D waist ring (polyline)
    double bodiceWaistSumMM = 0.0;     // flattened, all torso panels
    double skirtWaistSumMM = 0.0;      // flattened, all skirt panels
};

struct SheathOptions {
    double hemDropBelowHipMM = 200.0;  // skirt length past the hip ring — a design dial
    // WEARING EASE per ring, mm of girth. A zero-ease garment is skin and
    // cannot be worn. Defaults are the fitted-dress band the trade agrees on
    // (Threads/RTW: 2" bust, 1" waist, 2" hip; Aldrich close-fitting carries
    // 7cm at the bust) — declared design dials, not laws.
    // SHOULDER TOP — off by default, and the reason is measured, not cautious.
    // With the real top boundary the bodice quarter-panel carries +52.5 deg of
    // develop-deficit (it was -0.20 deg as a strapless tube), and the flatten
    // cannot absorb it: cut-line strain goes to 46-65% and the panels fold
    // through themselves. The missing piece is named and known — Slit can only
    // anchor at the WAIST row, so a shoulder dart or a neckline dart cannot be
    // expressed at all, and those are exactly the two a bodice with shoulders
    // needs. Turn this on when Slit gains a top anchor, not before.
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
    double neckHalfWidthMM = 87.164;   // neck_w/2, EU38 contract body
    double frontNeckDropMM = 70.0;
    double backNeckDropMM = 20.0;
    double easeNeckMM = 0.0;   // a neckline is cut, not fitted — declared, not omitted
    double easeBustMM = 60.0;
    double easeWaistMM = 25.0;
    double easeHipMM = 50.0;
    int ringSamples = 128;             // the waist ring, sampled once; panels take half each
    double rowStepMM = 8;             // vertical mesh resolution
    int arapRounds = 60;
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
    double skirtApexFrac = 1.35;  // dart tip runs through the hip blend band
    double hipBlendMM = 90.0;  // hip-corner rounding half-width (drafting "hip curve")
};

// Builds the four-panel sheath from the body surface with zero ease.
// Throws if the body lacks bust/waist/hip levels.
SurfacePattern buildSheathPattern(const BodySurface& body, const SheathOptions& opt = {});

}  // namespace stitchu
