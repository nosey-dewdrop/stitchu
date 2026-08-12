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
    int ringSamples = 128;             // the waist ring, sampled once; panels take half each
    double rowStepMM = 8.0;            // vertical mesh resolution
    int arapRounds = 60;
    int polishIters = 12000;
    double cutEmphasis = 120.0;  // polish weight locking the metric onto cut lines
    // SUPPRESSION LAYOUT — design decisions (G2: only the total is a law).
    // cutFracs are FULL vertical cuts through the half-panel (princess seams;
    // the production Buğra spec splits the torso the same way); dartFracs are
    // waist darts within the resulting sub-panels. Fractions of the half-panel
    // phi span. Apex height is a fraction of the shaped region (bodice:
    // waist->bust, skirt: waist->hip).
    std::vector<double> bodiceCutFracs = {0.5};
    std::vector<double> bodiceDartFracs = {};
    std::vector<double> skirtCutFracs = {0.5};
    std::vector<double> skirtDartFracs = {0.25, 0.75};  // one dart per quarter, the classic sheath
    double bodiceApexFrac = 0.80;
    double skirtApexFrac = 1.15;  // dart tip reaches into the hip blend band
    double hipBlendMM = 70.0;  // hip-corner rounding half-width (drafting "hip curve")
};

// Builds the four-panel sheath from the body surface with zero ease.
// Throws if the body lacks bust/waist/hip levels.
SurfacePattern buildSheathPattern(const BodySurface& body, const SheathOptions& opt = {});

}  // namespace stitchu
