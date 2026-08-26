#include "dartsuppress.hpp"

#include <cmath>
#include <stdexcept>

namespace stitchu {
namespace {

constexpr double kPi = 3.14159265358979323846;

double dist(const Vec2& a, const Vec2& b) { return std::hypot(b.x - a.x, b.y - a.y); }

Vec2 rot(const Vec2& p, const Vec2& o, double ang) {
    const double s = std::sin(ang), co = std::cos(ang);
    const double dx = p.x - o.x, dy = p.y - o.y;
    return {o.x + co * dx - s * dy, o.y + s * dx + co * dy};
}

bool segsCross(const Vec2& a, const Vec2& b, const Vec2& c, const Vec2& d) {
    const auto cr = [](const Vec2& p, const Vec2& q, const Vec2& r) {
        return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    };
    const double d1 = cr(a, b, c), d2 = cr(a, b, d), d3 = cr(c, d, a), d4 = cr(c, d, b);
    return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
           ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

}  // namespace

double contourPerimeterMM(const std::vector<Vec2>& c) {
    double p = 0.0;
    for (std::size_t i = 0; i < c.size(); ++i) p += dist(c[i], c[(i + 1) % c.size()]);
    return p;
}

// Shoelace. Reported as its magnitude: which way a panel's contour winds is a
// convention of whoever built it, and an operator that preserved |area| but
// flipped the winding would be an unnoticed mirror.
double contourAreaMM2(const std::vector<Vec2>& c) {
    double a = 0.0;
    for (std::size_t i = 0; i < c.size(); ++i) {
        const Vec2& p = c[i];
        const Vec2& q = c[(i + 1) % c.size()];
        a += p.x * q.y - q.x * p.y;
    }
    return std::fabs(0.5 * a);
}

// Proper crossings only; shared endpoints of adjacent edges are not crossings.
// O(n^2) on a 160-point panel is 25k pairs and runs in microseconds — the naive
// answer is the right one here and a sweep line would only add a place to be
// wrong.
bool contourSelfIntersects(const std::vector<Vec2>& c) {
    const std::size_t n = c.size();
    for (std::size_t i = 0; i < n; ++i)
        for (std::size_t j = i + 2; j < n; ++j) {
            if (i == 0 && j == n - 1) continue;
            if (segsCross(c[i], c[(i + 1) % n], c[j], c[(j + 1) % n])) return true;
        }
    return false;
}

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
    // construction, so the wedge is TRUE before any gate ever sees it and a
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

SuppressReport suppressPanel(const SurfacePanel& panel, std::size_t atIdx, double apexDepthMM,
                             Vec2 towards) {
    SuppressReport r;
    r.panel = panel.name;
    // ⭐ THE ONE LINE THAT MAKES THIS AN OPERATOR RATHER THAN A FIXTURE: the
    // angle is READ off the panel, and there is no parameter a caller could use
    // to overrule it.
    r.deficitDeg = panel.developDeficitDeg;
    r.apexDepthMM = apexDepthMM;
    r.contour = panel.contour;
    r.perimeterBeforeMM = contourPerimeterMM(panel.contour);
    r.areaBeforeMM2 = contourAreaMM2(panel.contour);
    r.perimeterAfterMM = r.perimeterBeforeMM;
    r.areaAfterMM2 = r.areaBeforeMM2;

    if (!(r.deficitDeg > kNothingToAbsorbDeg)) {
        r.opened = false;
        r.refusal = "panel \"" + panel.name + "\" develop-deficit " +
                    std::to_string(panel.developDeficitDeg) + " deg <= " +
                    std::to_string(kNothingToAbsorbDeg) +
                    " deg: this surface develops (or saddles), so there is NOTHING to suppress. "
                    "A dart cannot absorb a saddle and a dart with nothing to absorb is not a "
                    "dart; opening one would invent suppression the surface never asked for.";
        return r;
    }

    r.opened = true;
    r.wedgeDeg = r.deficitDeg;
    r.contour = suppressWedge(panel.contour, atIdx, apexDepthMM, towards, r.wedgeDeg, &r.apexIdx);
    r.perimeterAfterMM = contourPerimeterMM(r.contour);
    r.areaAfterMM2 = contourAreaMM2(r.contour);
    r.areaRemovedMM2 = r.areaBeforeMM2 - r.areaAfterMM2;
    const std::size_t n = r.contour.size();
    const Vec2 apex = r.contour[r.apexIdx];
    r.legAMM = dist(r.contour[(r.apexIdx + n - 1) % n], apex);
    r.legBMM = dist(r.contour[(r.apexIdx + 1) % n], apex);
    // The wedge's own sector area, 0.5 * L^2 * theta — a SECOND reading of the
    // cloth that left (the shoelace above walks the whole contour, this looks
    // only at the notch). ⚠ REPORTED, NOT GATED: see the header. The two are
    // 3.40% apart on EU38's front panel and 10.06% on its back, and the gap is
    // a shape term nobody has derived, so no threshold is invented for it.
    const double L = 0.5 * (r.legAMM + r.legBMM);
    r.sectorAreaMM2 = 0.5 * L * L * r.wedgeDeg * kPi / 180.0;
    // Read the opening back off the geometry that came out.
    {
        const Vec2& a = r.contour[(r.apexIdx + n - 1) % n];
        const Vec2& b = r.contour[(r.apexIdx + 1) % n];
        double d = std::atan2(b.y - apex.y, b.x - apex.x) -
                   std::atan2(a.y - apex.y, a.x - apex.x);
        while (d <= -kPi) d += 2 * kPi;
        while (d > kPi) d -= 2 * kPi;
        r.wedgeMeasuredDeg = std::fabs(d) * 180.0 / kPi;
    }
    r.selfIntersects = contourSelfIntersects(r.contour);
    return r;
}

}  // namespace stitchu
