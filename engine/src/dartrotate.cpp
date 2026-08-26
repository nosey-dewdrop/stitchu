#include "dartrotate.hpp"

#include <cmath>
#include <stdexcept>
#include <string>

namespace stitchu {
namespace {

constexpr double kPi = 3.14159265358979323846;

double dist(const Vec2& a, const Vec2& b) { return std::hypot(b.x - a.x, b.y - a.y); }

double perimeter(const std::vector<Vec2>& c) {
    double p = 0.0;
    for (std::size_t i = 0; i < c.size(); ++i) p += dist(c[i], c[(i + 1) % c.size()]);
    return p;
}

// Shoelace. Signed area is reported as its magnitude: which way a panel's
// contour winds is a convention of whoever built it, and a transfer that
// preserved |area| but flipped the winding would be an unnoticed mirror.
double area2(const std::vector<Vec2>& c) {
    double a = 0.0;
    for (std::size_t i = 0; i < c.size(); ++i) {
        const Vec2& p = c[i];
        const Vec2& q = c[(i + 1) % c.size()];
        a += p.x * q.y - q.x * p.y;
    }
    return 0.5 * a;
}

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

bool segsCross(const Vec2& a, const Vec2& b, const Vec2& c, const Vec2& d) {
    const auto cr = [](const Vec2& p, const Vec2& q, const Vec2& r) {
        return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    };
    const double d1 = cr(a, b, c), d2 = cr(a, b, d), d3 = cr(c, d, a), d4 = cr(c, d, b);
    return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
           ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

// Proper crossings only; shared endpoints of adjacent edges are not crossings.
// O(n^2) on a 160-point panel is 25k pairs and runs in microseconds — the naive
// answer is the right one here and a sweep line would only add a place to be
// wrong.
bool selfIntersects(const std::vector<Vec2>& c) {
    const std::size_t n = c.size();
    for (std::size_t i = 0; i < n; ++i)
        for (std::size_t j = i + 2; j < n; ++j) {
            if (i == 0 && j == n - 1) continue;
            if (segsCross(c[i], c[(i + 1) % n], c[j], c[(j + 1) % n])) return true;
        }
    return false;
}

}  // namespace

std::vector<Vec2> suppressWedge(const std::vector<Vec2>& contour, std::size_t atIdx,
                                double apexDepthMM, Vec2 towards, double wedgeDeg,
                                std::size_t* apexIdxOut) {
    const std::size_t n = contour.size();
    if (n < 4 || atIdx >= n) throw std::invalid_argument("suppressWedge: bad contour/index");
    if (!(wedgeDeg > 0.0)) throw std::invalid_argument("suppressWedge: wedge must be > 0 deg");
    const Vec2 V = contour[atIdx];
    const double L = std::hypot(towards.x - V.x, towards.y - V.y);
    if (!(L > 1e-9)) throw std::invalid_argument("suppressWedge: apex direction is degenerate");
    const Vec2 apex{V.x + apexDepthMM * (towards.x - V.x) / L,
                    V.y + apexDepthMM * (towards.y - V.y) / L};
    // The two legs are ONE point and the same point rotated: equal by
    // construction, so the wedge is TRUE before the operator ever sees it and a
    // truing pass cannot be what makes the gate green.
    const double half = 0.5 * wedgeDeg * kPi / 180.0;
    const Vec2 legA = rot(V, apex, +half), legB = rot(V, apex, -half);

    // SUPPRESSION REMOVES CLOTH, so the boundary the wedge sweeps has to GO.
    // Splicing the two legs in beside their neighbours and leaving the swept
    // arc in place is what a first draft of this function did, and it produced
    // a self-intersecting panel every time — the legs cut straight across the
    // vertices they were supposed to replace. Every vertex whose bearing from
    // the apex lies inside the wedge is dropped; the legs land where the
    // boundary used to be and the piece stays simple.
    const double a0 = std::atan2(V.y - apex.y, V.x - apex.x);
    const auto rel = [&](const Vec2& q) {
        double d = std::atan2(q.y - apex.y, q.x - apex.x) - a0;
        while (d <= -kPi) d += 2 * kPi;
        while (d > kPi) d -= 2 * kPi;
        return d;
    };
    const auto inWedge = [&](std::size_t i) { return std::fabs(rel(contour[i])) < half; };
    if (!inWedge(atIdx))
        throw std::invalid_argument("suppressWedge: the attachment vertex is not inside its own "
                                    "wedge — the apex direction is wrong");
    std::size_t lo = atIdx, hi = atIdx;  // contiguous run of swept vertices
    while (inWedge((lo + n - 1) % n)) lo = (lo + n - 1) % n;
    while (inWedge((hi + 1) % n)) hi = (hi + 1) % n;
    // Whichever leg the FORWARD walk meets first goes in first, so the winding
    // the panel already has is the winding it keeps.
    const bool aFirst = rel(contour[(lo + n - 1) % n]) > 0.0;

    std::vector<Vec2> out;
    out.reserve(n + 2);
    for (std::size_t i = (hi + 1) % n;; i = (i + 1) % n) {
        if (i == lo) {
            out.push_back(aFirst ? legA : legB);
            if (apexIdxOut) *apexIdxOut = out.size();
            out.push_back(apex);
            out.push_back(aFirst ? legB : legA);
            break;
        }
        out.push_back(contour[i]);
    }
    return out;
}

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
