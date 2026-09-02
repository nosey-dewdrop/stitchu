#include "buzgu.hpp"

#include <algorithm>
#include <cmath>

namespace stitchu {
namespace BuzguBlock {

namespace {

const EdgeRole* findRole(const PatternPiece& piece, const std::string& role) {
    for (const auto& r : piece.edgeRoles)
        if (r.role == role) return &r;
    return nullptr;
}

// ★ THE SLASH-AND-SPREAD, ANISOTROPIC (M1-puf round 2).
//
// The first cut applied ONE similarity about the chord midpoint, so the chord
// grew with the arc: at ratio 1.29 the sleeve's biceps line grew 24% too, and a
// biceps is a BODY measurement, not gather allowance. `sleeveLaw._a3` ("fullness
// at the top, the cloth drawn in below") is exactly what that broke.
//
// What replaces it moves the cloth the way a puff pattern actually moves it:
// the CHORD IS HELD (both endpoints are fixed, so the biceps line, the two
// underarm corners and the whole seam below them are untouched, and the outline
// stays closed with no retargeting at all), and only the component PERPENDICULAR
// to the chord — the cap's sagitta direction — is multiplied, by the factor that
// makes the drawn arc equal the target. That factor is SOLVED, not stated,
// because arc length is not linear in it.
//
// ⚠ THIS IS A DECLARED DEPARTURE FROM THE BUGRA MEASUREMENT, NOT A COPY OF IT,
// and the numbers are in contract/tables.json draft.gatherRatios._anizotropiNot:
// Bugra's Upper Sleeve grows the chord 1.459x and the sagitta 1.227x at EU38
// (knowledge/cap-ease-isareti-2026-08-17.md §2.1), i.e. its outer layer gets
// WIDER than the arm — which it is allowed to be, because it is a separate
// layer laid over a Lower Sleeve that still carries the biceps. Our sleeve is
// ONE piece and must carry the biceps itself, so it keeps chord 1.000 and puts
// the whole surplus in the sagitta. Same gather ratio, different distribution,
// said out loud.
Point spreadPerp(Point p, Point origin, Point u, Point n, double k) {
    const double a = (p.x - origin.x) * u.x + (p.y - origin.y) * u.y;
    const double b = (p.x - origin.x) * n.x + (p.y - origin.y) * n.y;
    return {origin.x + a * u.x + k * b * n.x, origin.y + a * u.y + k * b * n.y};
}

// Arc length the edge would have if the perpendicular component were scaled k x.
double perpLength(const std::vector<PathCommand>& edge, Point origin, Point u,
                  Point n, double k) {
    std::vector<PathCommand> t = edge;
    for (PathCommand& c : t) {
        c.to = spreadPerp(c.to, origin, u, n, k);
        if (c.type == CmdType::Curve) {
            c.cp1 = spreadPerp(c.cp1, origin, u, n, k);
            c.cp2 = spreadPerp(c.cp2, origin, u, n, k);
        }
    }
    return pathLength(t);
}

// Even-arc-length points + unit tangents along a standalone edge path
// (Move + the edge's own commands), used to place the gather marks.
struct EdgeSample {
    Point p;
    Point t;  // unit tangent
};

std::vector<EdgeSample> walkEdge(const std::vector<PathCommand>& edge, int count) {
    std::vector<EdgeSample> out;
    if (edge.size() < 2 || count <= 0) return out;
    // Flatten the whole edge into a dense polyline with cumulative length.
    std::vector<Point> poly{edge[0].to};
    for (size_t i = 1; i < edge.size(); ++i) {
        const PathCommand& c = edge[i];
        if (c.type == CmdType::Curve) {
            const std::vector<Point> seg = flattenCubic(poly.back(), c.to, c.cp1, c.cp2, 48);
            for (size_t k = 1; k < seg.size(); ++k) poly.push_back(seg[k]);
        } else if (c.type == CmdType::Line || c.type == CmdType::Move) {
            poly.push_back(c.to);
        }
    }
    if (poly.size() < 2) return out;
    std::vector<double> acc{0.0};
    for (size_t i = 1; i < poly.size(); ++i)
        acc.push_back(acc.back() + distance(poly[i - 1], poly[i]));
    const double total = acc.back();
    if (!(total > 1e-9)) return out;

    for (int n = 0; n < count; ++n) {
        // Marks sit strictly INSIDE the edge (a gather mark on the seam corner
        // would be a corner notch, a different thing): n+1 of count+1 steps.
        const double want = total * (n + 1) / (count + 1);
        size_t i = 1;
        while (i + 1 < acc.size() && acc[i] < want) ++i;
        const double span = acc[i] - acc[i - 1];
        const double u = span > 1e-9 ? (want - acc[i - 1]) / span : 0.0;
        const Point a = poly[i - 1], b = poly[i];
        Point p{a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u};
        double tx = b.x - a.x, ty = b.y - a.y;
        const double len = std::sqrt(tx * tx + ty * ty);
        if (len > 1e-9) { tx /= len; ty /= len; }
        out.push_back(EdgeSample{p, Point{tx, ty}});
    }
    return out;
}

// The gather mark itself: a short tick ACROSS the seam line, the standard
// pattern notation for "gather between these marks". Length is one seam
// allowance, so it scales with the piece's own drafted allowance.
void stampMarks(PatternPiece& piece, const std::vector<PathCommand>& edge, int count) {
    const double half = std::max(4.0, piece.seamAllowance * 0.4);
    for (const EdgeSample& s : walkEdge(edge, count)) {
        const Point n{-s.t.y, s.t.x};   // normal to the seam
        piece.notches.push_back(PathCommand::move({s.p.x - n.x * half, s.p.y - n.y * half}));
        piece.notches.push_back(PathCommand::line({s.p.x + n.x * half, s.p.y + n.y * half}));
    }
}

} // namespace

double edgeLengthMM(const PatternPiece& piece, const std::string& role) {
    const EdgeRole* r = findRole(piece, role);
    return r ? edgeLengthOf(piece, *r) : 0.0;
}

BuzguResult gatherEdge(PatternPiece& piece, const std::string& role,
                       double finishedMM, double ratio, int notchCount) {
    BuzguResult res;
    res.finishedMM = finishedMM;
    res.ratio = ratio;

    const EdgeRole* rp = findRole(piece, role);
    if (!rp) {
        res.reason = "buzgu reddedildi: '" + piece.name + "' parcasinda '" + role +
                     "' adli kenar yok — buzgu ancak ADI OLAN bir kenara uygulanir";
        return res;
    }
    const EdgeRole r = *rp;   // copy: the vector is rewritten below
    const std::vector<PathCommand> before = edgePathOf(piece, r);
    if (before.empty()) {
        res.reason = "buzgu reddedildi: '" + role +
                     "' kenarinin adresi bayat (bir post-pass konturu yeniden yazmis)";
        return res;
    }
    res.beforeMM = pathLength(before);
    if (!(finishedMM > 0)) {
        res.reason = "buzgu reddedildi: buzgunun uzerine dikilecegi kenar olculemedi (0 mm)";
        return res;
    }
    if (!(ratio > 1.0)) {
        res.reason = "buzgu reddedildi: buzgu orani " + std::to_string(ratio) +
                     " — 1'den buyuk olmayan bir oran buzgu degildir";
        return res;
    }
    const double target = finishedMM * ratio;
    if (!(res.beforeMM > 1e-6)) {
        res.reason = "buzgu reddedildi: '" + role + "' kenarinin cizili boyu 0 mm";
        return res;
    }
    const double arcRatio = target / res.beforeMM;
    if (!(arcRatio > kMinScale) || !(arcRatio < kMaxScale)) {
        res.reason = "buzgu reddedildi: istenen oran bu kenarda " + std::to_string(arcRatio) +
                     " katlik bir yayma demek (izin " + std::to_string(kMinScale) + "-" +
                     std::to_string(kMaxScale) + "); kenar zaten " +
                     std::to_string(res.beforeMM / finishedMM) + " kat cizili";
        return res;
    }

    // --- the spread: chord HELD, sagitta solved ----------------------------
    const double chord = distance(r.start, r.end);
    if (!(chord > 1e-6)) {
        res.reason = "buzgu reddedildi: '" + role +
                     "' kenarinin kirisi 0 mm — yonu olmayan bir kenar yayilamaz";
        return res;
    }
    const Point u{(r.end.x - r.start.x) / chord, (r.end.y - r.start.y) / chord};
    const Point n{-u.y, u.x};
    // Solve k. perpLength is monotone increasing in k (every sample's distance
    // from the chord grows, the along-chord component is fixed), so bisection is
    // exact to the tolerance and cannot land on the wrong branch.
    double lo = 1.0, hi = 1.0;
    while (perpLength(before, r.start, u, n, hi) < target) {
        hi *= 2.0;
        if (hi > kMaxPerp) {
            res.reason = "buzgu reddedildi: kiris sabit tutulunca bu kenar hedefe ulasamiyor — "
                         "sagitta " + std::to_string(kMaxPerp) +
                         " katina cikarilsa bile yay " +
                         std::to_string(perpLength(before, r.start, u, n, kMaxPerp)) +
                         " mm, hedef " + std::to_string(target) + " mm";
            return res;
        }
    }
    for (int i = 0; i < 80; ++i) {
        const double mid = (lo + hi) / 2;
        if (perpLength(before, r.start, u, n, mid) < target) lo = mid; else hi = mid;
    }
    const double k = (lo + hi) / 2;
    for (int i = r.firstCommand; i <= r.lastCommand; ++i) {
        PathCommand& c = piece.commands[static_cast<size_t>(i)];
        c.to = spreadPerp(c.to, r.start, u, n, k);
        if (c.type == CmdType::Curve) {
            c.cp1 = spreadPerp(c.cp1, r.start, u, n, k);
            c.cp2 = spreadPerp(c.cp2, r.start, u, n, k);
        }
    }
    // The two endpoints are FIXED POINTS of this map (their perpendicular
    // component is 0), so nothing outside the edge moves, the outline stays
    // closed, and every other edge role keeps its own coordinates. That is the
    // second reason to hold the chord: the previous similarity had to retarget
    // neighbouring commands and rewrite four role endpoints to stay closed.

    const std::vector<PathCommand> after = edgePathOf(piece, *findRole(piece, role));
    res.flatMM = after.empty() ? 0.0 : pathLength(after);
    res.scale = k;
    if (!after.empty() && notchCount > 0) {
        stampMarks(piece, after, notchCount);
        res.notches = notchCount;
    }
    res.ok = true;
    return res;
}

BuzguResult markGatheredEdge(PatternPiece& piece, const std::string& role,
                             double finishedMM, int notchCount) {
    BuzguResult res;
    res.finishedMM = finishedMM;
    const EdgeRole* rp = findRole(piece, role);
    if (!rp) {
        res.reason = "buzgu isareti reddedildi: '" + piece.name + "' parcasinda '" +
                     role + "' adli kenar yok";
        return res;
    }
    const std::vector<PathCommand> edge = edgePathOf(piece, *rp);
    if (edge.empty()) {
        res.reason = "buzgu isareti reddedildi: '" + role + "' kenarinin adresi bayat";
        return res;
    }
    res.beforeMM = res.flatMM = pathLength(edge);
    if (!(finishedMM > 0)) {
        res.reason = "buzgu isareti reddedildi: uzerine dikilecek kenar olculemedi (0 mm)";
        return res;
    }
    res.ratio = res.flatMM / finishedMM;
    res.scale = 1.0;
    if (!(res.ratio > 1.0)) {
        res.reason = "buzgu isareti reddedildi: kenar hedefinden uzun degil (oran " +
                     std::to_string(res.ratio) + ") — burada buzgu YOK";
        return res;
    }
    if (notchCount > 0) {
        stampMarks(piece, edge, notchCount);
        res.notches = notchCount;
    }
    res.ok = true;
    return res;
}

} // namespace BuzguBlock
} // namespace stitchu
