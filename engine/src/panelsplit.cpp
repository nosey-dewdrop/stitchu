// op.split — divide a panel along the column its own deficit profile picks.
// Header carries the law and the measured numbers; this file carries only the
// arithmetic.
#include "panelsplit.hpp"

#include <cmath>
#include <cstddef>
#include <stdexcept>
#include <string>
#include <vector>

#include "dartsuppress.hpp"  // contourPerimeterMM / contourAreaMM2 /
                             // contourSelfIntersects / kNothingToAbsorbDeg
                             // — ONE RULER. A panel that "kept its area" under
                             // split and "lost area" under suppress because the
                             // two files each wrote their own shoelace would be
                             // a bug nobody could see (dartsuppress.hpp says so).

namespace stitchu {

double splitFloorDeg() { return kNothingToAbsorbDeg; }

namespace {

double segLen(const Vec2& a, const Vec2& b) { return std::hypot(b.x - a.x, b.y - a.y); }

// The contour index of the boundary vertex at column j on a run whose edge
// indices are `run` (edge k joins contour[run[k]] -> contour[run[k]+1]).
//
// A run may be listed with ASCENDING or DESCENDING contour indices — the waist
// run of the shipped EU38 torso ascends (0..31) and the far run descends
// (111..80) because the two walk the closed boundary in opposite senses. Which
// end of an edge is "column j" therefore depends on the sense, and guessing it
// wrong silently cuts one column off. So the sense is READ off the run and the
// two ends are named, not assumed.
std::size_t vertexAtColumn(const std::vector<int>& run, std::size_t j, std::size_t n) {
    const std::size_t m = run.size();
    const bool ascending = m < 2 || run[1] > run[0];
    if (ascending) {
        if (j < m) return static_cast<std::size_t>(run[j]);
        return (static_cast<std::size_t>(run[m - 1]) + 1) % n;
    }
    if (j < m) return (static_cast<std::size_t>(run[j]) + 1) % n;
    return static_cast<std::size_t>(run[m - 1]);
}

}  // namespace

SplitReport splitPanel(const SurfacePanel& p) {
    SplitReport r;
    r.panel = p.name;
    r.axis = "vertical";
    r.deficitWholeDeg = p.developDeficitDeg;
    r.columnDeficitDeg = p.deficitColumnDeg;
    r.engineMaxDartDeg = SheathOptions().maxDartDeg;

    const std::size_t n = p.contour.size();
    if (n < 4) throw std::invalid_argument("splitPanel: panel contour has fewer than 4 points");
    if (p.waistEdges.empty() || p.farEdges.empty())
        throw std::invalid_argument("splitPanel: panel has no waist run or no far run");
    if (p.waistEdges.size() != p.farEdges.size())
        throw std::invalid_argument(
            "splitPanel: waist run and far run have different arc counts; the column "
            "correspondence this operator divides along is gone");

    const std::size_t colsN = p.waistEdges.size();
    r.colsN = colsN;
    if (p.deficitColumnDeg.size() != colsN + 1)
        throw std::invalid_argument("splitPanel: per-column deficit profile has " +
                                    std::to_string(p.deficitColumnDeg.size()) +
                                    " entries, the panel has " + std::to_string(colsN) +
                                    " columns; the profile is not this panel's");

    // ---- the measured facts the cut is chosen from -------------------------
    double signedSum = 0.0, absSum = 0.0;
    for (double d : p.deficitColumnDeg) { signedSum += d; absSum += std::fabs(d); }
    r.columnSumDeg = signedSum;
    r.absColumnSumDeg = absSum;
    r.cancelledWholeDeg = absSum - std::fabs(signedSum);

    if (colsN < 4) {
        r.refusal = "panelin " + std::to_string(colsN) +
                    " sutunu var; dorde bolunemeyen bir profil bir kesim yeri adlandiramaz";
        return r;
    }
    if (absSum < splitFloorDeg()) {
        char b[256];
        std::snprintf(b, sizeof b,
                      "sutun profilinin mutlak toplami %.6f deg, motorun kendi tabani %.2f "
                      "deg'in altinda: profil DUZ, hicbir sutun digerinden ayrilmiyor ve "
                      "gurultu uzerinde argmin bir yazi-tura",
                      absSum, splitFloorDeg());
        r.refusal = b;
        return r;
    }

    // ---- THE CUT: argmin over the measured profile, no dial ----------------
    double best = -1.0;
    std::size_t bestCol = 1;
    double running = p.deficitColumnDeg[0];
    for (std::size_t c = 1; c < colsN; ++c) {
        running += p.deficitColumnDeg[c];
        const double worse = std::max(std::fabs(running), std::fabs(signedSum - running));
        if (best < 0.0 || worse < best) { best = worse; bestCol = c; }
    }
    r.atColumn = bestCol;
    r.atFractionMeasured = static_cast<double>(bestCol) / static_cast<double>(colsN);

    for (std::size_t j = 0; j <= bestCol; ++j) {
        r.deficitADeg += p.deficitColumnDeg[j];
        r.absSumADeg += std::fabs(p.deficitColumnDeg[j]);
    }
    for (std::size_t j = bestCol + 1; j <= colsN; ++j) {
        r.deficitBDeg += p.deficitColumnDeg[j];
        r.absSumBDeg += std::fabs(p.deficitColumnDeg[j]);
    }
    r.deficitSumDeg = r.deficitADeg + r.deficitBDeg;
    r.cancelledADeg = r.absSumADeg - std::fabs(r.deficitADeg);
    r.cancelledBDeg = r.absSumBDeg - std::fabs(r.deficitBDeg);

    // What op.suppress would open on each piece. It has no angle argument, so
    // the wedge IS the deficit, judged through the same floor.
    auto wedge = [](double deficit) {
        return deficit > kNothingToAbsorbDeg ? deficit : 0.0;
    };
    r.wedgeWholeDeg = wedge(r.deficitWholeDeg);
    r.wedgeADeg = wedge(r.deficitADeg);
    r.wedgeBDeg = wedge(r.deficitBDeg);
    r.wedgeMaxAfterDeg = std::max(r.wedgeADeg, r.wedgeBDeg);

    // ---- the two pieces ----------------------------------------------------
    const std::size_t iw = vertexAtColumn(p.waistEdges, bestCol, n);
    const std::size_t ifr = vertexAtColumn(p.farEdges, bestCol, n);
    if (iw == ifr)
        throw std::invalid_argument("splitPanel: the cut's two ends land on the same "
                                    "contour point; the panel's runs do not span it");
    const std::size_t lo = std::min(iw, ifr), hi = std::max(iw, ifr);
    r.cutIdxWaist = iw;
    r.cutIdxFar = ifr;

    // A closed boundary cut at two of its own points is two closed boundaries.
    // No new points are invented: the cut is the CHORD between the two vertices
    // the columns name, so both pieces end at exactly the same two coordinates
    // and the seam that joins them back is equal-length by construction. That
    // is stated as a construction, and then MEASURED on the two contours below
    // anyway, because a construction claim nobody checks is a comment.
    r.pieceA.assign(p.contour.begin() + static_cast<long>(lo),
                    p.contour.begin() + static_cast<long>(hi) + 1);
    // Piece B is the rest of the SAME boundary, walked the same way round:
    // contour[hi..n) then contour[0..lo]. Both pieces are stored the way every
    // other contour in this engine is — closed implicitly, first point not
    // repeated — so each one's closing segment IS the cut, and the two closing
    // segments join the same two coordinates.
    r.pieceB.assign(p.contour.begin() + static_cast<long>(hi), p.contour.end());
    for (std::size_t k = 0; k <= lo; ++k) r.pieceB.push_back(p.contour[k]);

    r.areaWholeMM2 = contourAreaMM2(p.contour);
    r.areaAMM2 = contourAreaMM2(r.pieceA);
    r.areaBMM2 = contourAreaMM2(r.pieceB);
    r.areaSumMM2 = r.areaAMM2 + r.areaBMM2;
    r.perimWholeMM = contourPerimeterMM(p.contour);
    r.perimAMM = contourPerimeterMM(r.pieceA);
    r.perimBMM = contourPerimeterMM(r.pieceB);
    // The cut edge as it exists ON EACH PIECE: the closing segment of piece A
    // (last point back to first) and the closing segment of piece B.
    r.cutLenAMM = segLen(r.pieceA.back(), r.pieceA.front());
    r.cutLenBMM = segLen(r.pieceB.back(), r.pieceB.front());
    r.aSelfIntersects = contourSelfIntersects(r.pieceA);
    r.bSelfIntersects = contourSelfIntersects(r.pieceB);

    r.split = true;
    return r;
}

}  // namespace stitchu
