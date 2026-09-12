#include "dartrotate.hpp"

#include "dartsuppress.hpp"

#include <cmath>
#include <stdexcept>
#include <string>

namespace stitchu {
namespace {

constexpr double kPi = 3.14159265358979323846;

double dist(const Vec2& a, const Vec2& b) { return std::hypot(b.x - a.x, b.y - a.y); }

// ⭐ ONE RULER FOR BOTH OPERATORS (GECE7 / F5-B). `perimeter`, the shoelace and
// the self-intersection scan used to live here as rotate's private copies; they
// are now dartsuppress.cpp's, and both operators call the same three functions.
// Two files each writing their own shoelace is how a panel "keeps its area"
// under one operator and "loses" it under the other with nobody able to see
// which one is lying.
double perimeter(const std::vector<Vec2>& c) { return contourPerimeterMM(c); }
double area2(const std::vector<Vec2>& c) { return contourAreaMM2(c); }

Vec2 rot(const Vec2& p, const Vec2& o, double ang) {
    const double s = std::sin(ang), co = std::cos(ang);
    const double dx = p.x - o.x, dy = p.y - o.y;
    return {o.x + co * dx - s * dy, o.y + s * dx + co * dy};
}

// Signed angle that carries ray o->from onto ray o->to, in (-pi, pi].
double signedAngle(const Vec2& o, const Vec2& from, const Vec2& to) {
    const double a1 = std::atan2(from.y - o.y, from.x - o.x);
    const double a2 = std::atan2(to.y - o.y, to.x - o.x);
    double d = a2 - a1;
    while (d <= -kPi) d += 2 * kPi;
    while (d > kPi) d -= 2 * kPi;
    return d;
}

bool selfIntersects(const std::vector<Vec2>& c) { return contourSelfIntersects(c); }

}  // namespace

RotateReport rotateDart(const std::vector<Vec2>& contour, std::size_t apexIdx,
                        std::size_t targetIdx) {
    const std::size_t n = contour.size();
    if (n < 5) throw std::invalid_argument("rotateDart: contour too small to carry a dart");
    if (apexIdx >= n || targetIdx >= n) throw std::invalid_argument("rotateDart: index out of range");

    const std::size_t iA = (apexIdx + n - 1) % n;  // leg A boundary end
    const std::size_t iB = (apexIdx + 1) % n;      // leg B boundary end
    if (targetIdx == apexIdx || targetIdx == iA || targetIdx == iB)
        throw std::invalid_argument("rotateDart: target vertex is the dart itself — a transfer "
                                    "that moves nothing is refused, not reported as done");

    const Vec2 apex = contour[apexIdx];
    RotateReport r;
    r.legBeforeAMM = dist(contour[iA], apex);
    r.legBeforeBMM = dist(contour[iB], apex);
    if (!(r.legBeforeAMM > 1e-9) || !(r.legBeforeBMM > 1e-9))
        throw std::invalid_argument("rotateDart: contour[apexIdx] is not a notch tip "
                                    "(a leg has zero length)");
    // Rotate leg B onto leg A: that closes the old wedge.
    const double theta = signedAngle(apex, contour[iB], contour[iA]);
    r.wedgeBeforeDeg = std::fabs(theta) * 180.0 / kPi;
    r.perimeterBeforeMM = perimeter(contour);
    r.areaBeforeMM2 = std::fabs(area2(contour));

    // The MOVING sub-piece is the boundary walked forward from leg B to the
    // target; the rest of the panel stands still. That split is what makes the
    // transfer rigid: one piece pivots about the apex through exactly the wedge
    // angle, and every edge inside each piece keeps its length to the double.
    std::vector<Vec2> out;
    out.reserve(n);
    for (std::size_t k = iB;; k = (k + 1) % n) {
        if (k != iB) out.push_back(rot(contour[k], apex, theta));  // first merges into leg A
        if (k == targetIdx) break;
    }
    const Vec2 qMoved = out.back();  // the target's rotated image = new leg
    r.apexIdx = out.size();
    out.push_back(apex);
    for (std::size_t k = targetIdx;; k = (k + 1) % n) {
        out.push_back(contour[k]);
        if (k == iA) break;
    }
    if (out.size() != n)
        throw std::runtime_error("rotateDart: vertex count changed (" + std::to_string(out.size()) +
                                 " vs " + std::to_string(n) + ")");

    r.contour = out;
    r.legAfterAMM = dist(qMoved, apex);
    r.legAfterBMM = dist(contour[targetIdx], apex);
    r.wedgeAfterDeg =
        std::fabs(signedAngle(apex, out[(r.apexIdx + 1) % n], out[(r.apexIdx + n - 1) % n])) *
        180.0 / kPi;
    r.perimeterAfterMM = perimeter(out);
    r.areaAfterMM2 = std::fabs(area2(out));
    const double lOld = 0.5 * (r.legBeforeAMM + r.legBeforeBMM);
    const double lNew = 0.5 * (r.legAfterAMM + r.legAfterBMM);
    r.perimeterIdentityResidualMM =
        std::fabs(r.perimeterAfterMM - (r.perimeterBeforeMM - 2.0 * lOld + 2.0 * lNew));
    r.selfIntersects = selfIntersects(out);
    return r;
}

}  // namespace stitchu
