#pragma once
// Least-squares cubic Bézier fitting (Schneider, Graphics Gems "FitCurve").
// The flattened panel boundary is a dense polyline; a sellable pattern edge is
// a handful of smooth curves. Fitting is subdivision-based: one cubic is fit
// with chord-length parametrisation, and wherever the worst deviation exceeds
// the tolerance the run splits at that point and both halves refit — so the
// output is guaranteed within `tolMM` of the measured boundary everywhere.
#include <vector>

#include "flatten.hpp"  // Vec2

namespace stitchu {

struct CubicSeg {
    Vec2 p0, c1, c2, p3;
};

// Fits the open polyline `pts` (>= 2 points) within tolMM. Endpoints are
// interpolated exactly. A two-point run comes back as one straight cubic.
// `breaksOut`, when given, receives the polyline indices the subdivision chose.
// Feed the UNION of two sides' breaks to fitCubicsAtBreaks so a seam's two
// edges are segmented identically — otherwise they come back with different
// edge counts and the stitch plan has nothing to pair.
std::vector<CubicSeg> fitCubics(const std::vector<Vec2>& pts, double tolMM,
                                std::vector<int>* breaksOut = nullptr);

// Fit with the breakpoints dictated rather than discovered. Every run between
// consecutive breaks becomes exactly one cubic.
std::vector<CubicSeg> fitCubicsAtBreaks(const std::vector<Vec2>& pts,
                                        const std::vector<int>& breaks);

// Arc length of one segment by uniform flattening (for parity checks).
double cubicLength(const CubicSeg& s, int steps = 64);

}  // namespace stitchu
