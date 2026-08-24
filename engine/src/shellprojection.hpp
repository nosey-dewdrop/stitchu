#pragma once
// ---- ORTHOGRAPHIC PROJECTION OF THE GARMENT SHELL (V3-A) ----
//
// THE ONE CLAIM THIS FILE MAKES, AND IT IS NOT AN INVENTED ALGORITHM:
// an orthographic projection along -y (the front view) maps a point of the shell
// to (x, z). The silhouette of a convex section under that map is its EXTREME x,
// and for the section this engine uses — c(phi) = (a cos phi, bm sin phi +
// bd sin^2 phi) offset outward by the wearing ease d — the extreme x is attained
// where the outward normal is horizontal, i.e. at phi = 0, where the offset point
// is exactly (a + d, 0). So the silhouette half-width IS the section's semi-axis
// plus its ease offset. That is the definition of an orthographic projection
// applied to the shell that already exists; there is no fitted constant, no
// correction factor and no new parametrisation anywhere in this file.
//
// WHY IT EXISTS. The flat (technical drawing) line does not see the shell at all:
// tools/render-garment-flat.mjs draws from a 2D croquis (contract/flat-convention
// -v1.json) with zero ease, and the two lines disagreed by 24.89mm at the EU38
// waist (flat 700.0, pattern 724.89). This file computes the flat's outer contour
// from the SAME GarmentSurf the pattern is cut from, so the two cannot drift.
//
// WHAT IS DELIBERATELY NOT HERE:
//  * No smoothing algorithm. Between rings the contour is fitted with the
//    repo's existing Schneider cubic fit (curvefit.hpp), the same fitter the
//    pattern spec uses.
//  * No girth from width. A ring's circumference is the ELLIPSE-class section's
//    own perimeter (Gauss-Legendre, bodysurface.cpp) plus Steiner's exact
//    2*pi*d for the ease offset. Silhouette width x 2 would be an approximation
//    and an approximation is where a correction factor gets born.
//  * No front/back difference in the OUTLINE. Orthographic projection of one
//    convex shell gives the same silhouette from the front and from the back;
//    what differs between a front and a back technical drawing is the interior
//    (neckline depth, seams, closures), which this file does not draw. The back
//    view is the same curve mirrored in x, and saying so is honest where
//    inventing a difference would not be.
//
// Units mm throughout. Heights are the body's own z.
#include <string>
#include <vector>

#include "curvefit.hpp"
#include "surfacepattern.hpp"

namespace stitchu {

// One measured number and the ring it was read at. The ring name travels WITH
// the number so no consumer has to guess which level a measurement belongs to.
struct ShellMeasure {
    std::string name;
    std::string ring;
    double mm = 0.0;
};

// The contour between two consecutive rings: one fitted run, named by its ends.
struct ShellSpan {
    std::string name;   // e.g. "bust->waist"
    int firstPt = 0;    // index into ShellProjection::outline, inclusive
    int lastPt = 0;     // inclusive
    int firstSeg = 0;   // index into ShellProjection::segs, inclusive
    int segCount = 0;
    double polyLenMM = 0.0;  // sampled polyline length of this run
    double fitLenMM = 0.0;   // length of the fitted cubic chain, same run
};

struct ShellProjection {
    bool front = true;             // false = the same silhouette mirrored in x
    // The half silhouette, top (shoulder ring) to bottom (hem), one point per
    // sample: x = the signed silhouette half-width, y = height. The garment is
    // symmetric about x = 0 by construction, so the other half is this one
    // negated; nothing else is needed to close the outline.
    std::vector<Vec2> outline;
    std::vector<std::string> ptSpan;   // per outline point, the ring interval
    std::vector<CubicSeg> segs;        // curvefit.hpp, per span
    std::vector<std::string> segSpan;  // per segment, the ring interval
    std::vector<ShellSpan> spans;
    std::vector<ShellMeasure> measures;  // the gated six, then the ungated rest
    double topZMM = 0.0, bottomZMM = 0.0;
};

// The six numbers, all read off the SAME shell, each carrying its ring. The ring
// each one is read at is NOT restated here as a literal: every measure carries
// Ring::name, and the ring names themselves have exactly one authority,
// GarmentSurf::ringNames() — a second copy of that list in a comment is a second
// source, which is the failure mode this whole file was written against.
//   hem_circumference       ellipse perimeter + 2*pi*d, at the hem level
//   bust_circumference      ellipse perimeter + 2*pi*d
//   waist_circumference     ellipse perimeter + 2*pi*d
//   body_length         (top ring -> hem level)   ARC of the centre-front line
//                                                ALONG the shell surface
// and, after them, one measure that is reported but DELIBERATELY NOT GATED:
//   body_height_projected (same ring pair)       the vertical drop, top z - bottom z
//
// body_length WAS the vertical drop, and that was a definition mismatch, not a
// disagreement: tools/pattern-measure.mjs sums the centre-front seam's arc
// across the cloth, and an arc and a height are two quantities. The gate was
// therefore reading -1.9795% (EU38 flat 743.5050 vs pattern 728.7870) off a
// comparison that had no meaning. body_length is now the same KIND of thing on
// both sides — a length along the cloth — and the height is kept under its own
// name so nothing is lost. No factor was applied to make the two agree.
//   neck_opening_width      2*(a + d) at the topmost ring
//   shoulder_width          2*(a + d) at the ring below it
//
// neck_opening_width is the SHELL's neck ring, not a drafted neckline: where the
// neckline is actually cut is TopProfile's decision inside surfacepattern.cpp,
// and reporting that here would be a second copy of it.
ShellProjection projectFront(const GarmentSurf& surf);
ShellProjection projectBack(const GarmentSurf& surf);

}  // namespace stitchu
