#pragma once
// ---- op.rotate — DART TRANSFER / PIVOT (GECE7 / F5-A, contract/primitives-v1.json) ----
//
// WHAT THIS IS. §4A calls `rotate` "klasik kalıpçılığın ANA işlemi" and defines
// it in one line: move a dart around its apex onto another edge. It is the
// first of the eight missing operators (K27) and it is the only one that can be
// proved against the LIVE seam plan, because the class the surface line ships
// is literally named `top/dart/woven`.
//
// WHAT IT IS NOT, AND THIS IS MEASURED RATHER THAN CLAIMED. `rotate` does not
// create a dart and it does not destroy one. It moves one, RIGIDLY, and the
// three quantities that survive a rigid motion are what make the operator
// checkable rather than plausible:
//   * AREA is preserved exactly. A pivot is an isometry of one sub-piece of the
//     panel about a point; it moves cloth, it does not add or remove any.
//   * The WEDGE ANGLE is preserved exactly. That is the whole content of dart
//     transfer: the suppression is a fixed amount of develop-deficit and the
//     operator only decides where it comes out.
//   * The two LEGS stay TRUE by construction, not by a truing pass: the new
//     legs are one boundary point and its rotated image about the apex, so they
//     are equal to the last bit of the double.
//
// PERIMETER IS *NOT* PRESERVED, AND SAYING IT IS WOULD BE A FALSE INVARIANT.
// Closing the old wedge removes two legs of length Lold; opening the new one
// adds two of length Lnew, and Lold != Lnew whenever the two attachment points
// sit at different distances from the apex — which is the normal case (a bust
// dart at the waist edge is far longer than the same dart at the armhole). The
// exact law is
//
//     perimeter_after  ==  perimeter_before  -  2*Lold  +  2*Lnew
//
// and rotateDart() reports the residual of that identity so a caller can gate
// on it. A gate that demanded equal perimeters would be gating on a wrong
// statement, and a wrong gate is worse than none (KOSU-v7 §3.8).
//
// UNITS mm throughout; angles reported in degrees.
#include <cstddef>
#include <vector>

#include "flatten.hpp"  // Vec2

namespace stitchu {

// The numbers a dart transfer has to answer for. Every one of them is measured
// off the two contours, none is passed through from the request.
struct RotateReport {
    std::vector<Vec2> contour;   // the panel after the transfer, closed
    std::size_t apexIdx = 0;     // where the apex sits in `contour`

    double perimeterBeforeMM = 0.0, perimeterAfterMM = 0.0;
    double areaBeforeMM2 = 0.0, areaAfterMM2 = 0.0;
    double wedgeBeforeDeg = 0.0, wedgeAfterDeg = 0.0;
    double legBeforeAMM = 0.0, legBeforeBMM = 0.0;   // TRUE means these two are equal
    double legAfterAMM = 0.0, legAfterBMM = 0.0;
    // |perimeterAfter - (perimeterBefore - 2*Lold + 2*Lnew)| — the identity above.
    double perimeterIdentityResidualMM = 0.0;
    bool selfIntersects = false;
};

// ⭐ `suppressWedge` MOVED OUT (GECE7 / F5-B). It was declared here with a note
// saying it WAS `op.suppress` and that it was a FIXTURE — `rotate` needed a
// dart to move and the shipped plan carries none. It now lives in
// `dartsuppress.{hpp,cpp}` beside the real operator `suppressPanel()`, which
// takes its wedge angle from the panel's OWN measured develop-deficit and has
// no angle parameter at all. `rotate` no longer declares its own dart: the
// driver asks op.suppress for one and reports whatever op.suppress said,
// refusal included.
//
// ⭐ op.rotate. Move the dart whose apex is `contour[apexIdx]` onto the boundary
// vertex `targetIdx`, pivoting about the apex. Throws std::invalid_argument on
// a degenerate request (apex not a notch tip, target on the dart itself) —
// never a silent no-op, which would let a caller report a transfer that did not
// happen (RULES invariant 1).
RotateReport rotateDart(const std::vector<Vec2>& contour, std::size_t apexIdx,
                        std::size_t targetIdx);

}  // namespace stitchu
