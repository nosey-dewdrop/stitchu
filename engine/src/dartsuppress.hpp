#pragma once
// ---- op.suppress — SUPPRESSION (GECE7 / F5-B, contract/primitives-v1.json) ----
//
// WHAT THIS IS. §4A lists `suppress` first among the seven ops the primitives
// contract already names, and HEDEF.md states the law it has to obey in one
// line: a dart is NOT a formula, it is the surface's own develop-deficit opened
// where the flattening says it has to open. So this operator has no angle
// parameter. It is handed a PANEL and it takes the panel's own measured
// deficit (SurfacePanel::developDeficitDeg); there is no way for a caller to
// write the number, which is the whole difference between an operator and the
// fixture F5-A had to declare.
//
// ⚠ WHAT IT IS NOT: `suppressWedge()` below. That function CUTS a wedge of a
// size it is told, and it lived in dartrotate.cpp as `rotate`'s private helper
// with a comment saying so ("THIS IS op.suppress, NOT rotate, AND IT IS A
// FIXTURE"). It is still here and still does exactly that — a cutting
// primitive is not an operator. The operator is suppressPanel(), which decides
// the size from geometry and REFUSES when the geometry says there is nothing
// to take out.
//
// ---------------------------------------------------------------------------
// THE REFUSAL IS THE POINT, AND IT IS WHERE THE PRODUCT ACTUALLY IS TODAY.
//
// RULES invariant 1: an unsupported request is Result::Err, never a silent
// coercion. A panel whose deficit is zero or NEGATIVE has nothing to suppress —
// a negative band is a SADDLE and a dart cannot absorb a saddle
// (surfacepattern.cpp says so where it clamps them). Opening a wedge anyway
// would be inventing suppression the surface never asked for, and
// surfacepattern.cpp has the measurement of what that costs: the clamp
// "invented" two 24.4 deg wedges and they surfaced as 8.929% leg strain.
//
// MEASURED ON THE SHIPPED TREE, EU38, AND IT IS UNCOMFORTABLE (K28):
//
//   shipped (skimBodice on)   left_ftorso  develop-deficit  -1.9628 deg
//                             -> op.suppress REFUSES. Nothing to take out.
//                                This is WHY all eight shipped panels print
//                                "pens": 0 while the class is called
//                                `top/dart/woven`: the skim makes the bodice a
//                                cone and a cone develops exactly.
//   body-following (skim off) left_ftorso  develop-deficit +27.8788 deg
//                             -> op.suppress OPENS a 27.8788 deg wedge.
//
// Neither number is 41.48 (the real Buğra Locket dart, measured as
// develop-deficit in flatten-research/16). They are written next to it and NOT
// tuned towards it: 41.48 belongs to a different garment on a different body,
// and moving a dial until a measurement matched a number from another pattern
// is the thing §3.10 forbids.
//
// UNITS mm; angles in degrees.
#include <cstddef>
#include <string>
#include <vector>

#include "surfacepattern.hpp"  // SurfacePanel, Vec2

namespace stitchu {

// The engine's own "a dart with nothing to absorb is not a dart" threshold.
// NOT a new number: surfacepattern.cpp's dartColumnsFromDeficitRows already
// refuses to derive a dart below this, in radians, with its own reason written
// beside it ("below half a degree there is nothing to let out and the panel is
// cut whole"). One threshold, one authority.
constexpr double kNothingToAbsorbDeg = 0.5;

// What a suppression has to answer for. Every number is measured off the two
// contours or off the panel; none is passed through from the request.
struct SuppressReport {
    bool opened = false;
    // Non-empty EXACTLY when opened == false. A refusal that does not say why
    // is indistinguishable from a crash (RULES invariant 1).
    std::string refusal;

    std::string panel;          // whose deficit this is
    double deficitDeg = 0.0;    // what the SURFACE asked for — measured, not chosen
    double wedgeDeg = 0.0;      // what was opened; == deficitDeg exactly, or 0
    double apexDepthMM = 0.0;

    std::vector<Vec2> contour;  // the panel after suppression, closed
    std::size_t apexIdx = 0;    // where the apex sits in `contour`

    // SUPPRESSION REMOVES CLOTH. That is the one thing that separates it from a
    // relabelling, so it is reported as a number rather than asserted:
    // areaRemoved > 0 always, and it agrees with the wedge's own sector area.
    double areaBeforeMM2 = 0.0, areaAfterMM2 = 0.0, areaRemovedMM2 = 0.0;
    // 0.5 * L^2 * theta for the mean leg L. ⚠ REPORTED, NOT GATED, AND THAT IS
    // DELIBERATE (K29: a made-up threshold is worse than no gate). The swept
    // boundary is the panel's real edge, not a circular arc at radius L, so the
    // two readings differ by a SHAPE term nobody has derived: measured EU38,
    // 3.40% on the front panel and 10.06% on the back. Picking a tolerance that
    // happens to admit 10.06% would be fitting a threshold to today's number.
    // What IS gated is exact: area strictly decreased, and wedgeMeasuredDeg.
    double sectorAreaMM2 = 0.0;
    double perimeterBeforeMM = 0.0, perimeterAfterMM = 0.0;
    // ⭐ THE WEDGE ANGLE READ BACK OFF THE RESULT, not off the request. The
    // angle legA-apex-legB measured on the contour that came out. This is what
    // separates "a wedge was opened" from "a field was set": marking the report
    // opened while leaving the geometry alone leaves this at 0 (or at whatever
    // the untouched boundary happened to subtend) and never at deficitDeg.
    double wedgeMeasuredDeg = 0.0;
    double legAMM = 0.0, legBMM = 0.0;  // TRUE means these two are equal
    bool selfIntersects = false;
};

// ⭐ op.suppress. Open the panel's OWN develop-deficit as a wedge at boundary
// vertex `atIdx`, with the apex `apexDepthMM` in from that vertex along the ray
// towards `towards`.
//
// There is no angle argument and there will not be one: the angle is
// `panel.developDeficitDeg`. Returns a report whose `opened` is false, with a
// reason, when the panel's deficit is at or below kNothingToAbsorbDeg — that is
// a refusal, not a failure, and it is the shipped garment's actual answer.
// Throws std::invalid_argument only on a malformed request (bad index,
// degenerate apex direction), never on a geometrically honest "no".
SuppressReport suppressPanel(const SurfacePanel& panel, std::size_t atIdx, double apexDepthMM,
                             Vec2 towards);

// The cutting primitive underneath, moved here from dartrotate.cpp unchanged.
// Cut a wedge of `wedgeDeg` out of a closed contour at vertex `atIdx`, with the
// apex `apexDepthMM` in from that vertex along the ray towards `towards`.
//
// ⚠ THIS IS NOT THE OPERATOR. It cuts whatever size it is told, so a caller
// that reaches for it directly is declaring a dart rather than deriving one.
// `rotate` still uses it that way on purpose and says so.
std::vector<Vec2> suppressWedge(const std::vector<Vec2>& contour, std::size_t atIdx,
                                double apexDepthMM, Vec2 towards, double wedgeDeg,
                                std::size_t* apexIdxOut);

// Shared with dartrotate.cpp so the two operators measure with ONE ruler: a
// panel that "kept its area" under rotate and "lost area" under suppress
// because the two files each wrote their own shoelace would be a bug nobody
// could see.
double contourPerimeterMM(const std::vector<Vec2>& c);
double contourAreaMM2(const std::vector<Vec2>& c);  // |signed area|
bool contourSelfIntersects(const std::vector<Vec2>& c);

}  // namespace stitchu
