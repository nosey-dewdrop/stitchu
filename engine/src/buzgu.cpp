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

bool samePoint(Point a, Point b, double tol = 1e-6) {
    return std::fabs(a.x - b.x) <= tol && std::fabs(a.y - b.y) <= tol;
}

Point scaleAbout(Point p, Point c, double s) {
    return {c.x + (p.x - c.x) * s, c.y + (p.y - c.y) * s};
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
    const double s = target / res.beforeMM;
    if (!(s > kMinScale) || !(s < kMaxScale)) {
        res.reason = "buzgu reddedildi: istenen oran bu kenarda " + std::to_string(s) +
                     " katlik bir yayma demek (izin " + std::to_string(kMinScale) + "-" +
                     std::to_string(kMaxScale) + "); kenar zaten " +
                     std::to_string(res.beforeMM / finishedMM) + " kat cizili";
        return res;
    }

    // --- the similarity, about the chord midpoint of the edge itself --------
    const Point mid{(r.start.x + r.end.x) / 2, (r.start.y + r.end.y) / 2};
    const Point oldStart = r.start, oldEnd = r.end;
    for (int i = r.firstCommand; i <= r.lastCommand; ++i) {
        PathCommand& c = piece.commands[static_cast<size_t>(i)];
        c.to = scaleAbout(c.to, mid, s);
        if (c.type == CmdType::Curve) {
            c.cp1 = scaleAbout(c.cp1, mid, s);
            c.cp2 = scaleAbout(c.cp2, mid, s);
        }
    }
    const Point newStart = scaleAbout(oldStart, mid, s);
    const Point newEnd = scaleAbout(oldEnd, mid, s);
    // Retarget every command OUTSIDE the edge that ended on one of the two
    // moved endpoints, so the outline stays closed. On a sleeve that is two
    // commands, not one: the opening Move (the cap's left corner) AND the
    // closing underarm curve, which comes back to that same corner. Retargeting
    // only the command before the edge would leave the outline open at the end.
    for (size_t i = 0; i < piece.commands.size(); ++i) {
        if (static_cast<int>(i) >= r.firstCommand && static_cast<int>(i) <= r.lastCommand) continue;
        PathCommand& c = piece.commands[i];
        if (c.type == CmdType::Close) continue;
        if (samePoint(c.to, oldStart)) c.to = newStart;
        else if (samePoint(c.to, oldEnd)) c.to = newEnd;
    }
    // Every role anchored on the two moved endpoints follows them (the sleeve's
    // two underarm seams share the cap's corners); indices are untouched, so no
    // name is lost.
    for (auto& role2 : piece.edgeRoles) {
        if (samePoint(role2.start, oldStart)) role2.start = newStart;
        else if (samePoint(role2.start, oldEnd)) role2.start = newEnd;
        if (samePoint(role2.end, oldStart)) role2.end = newStart;
        else if (samePoint(role2.end, oldEnd)) role2.end = newEnd;
    }

    const std::vector<PathCommand> after = edgePathOf(piece, *findRole(piece, role));
    res.flatMM = after.empty() ? 0.0 : pathLength(after);
    res.scale = s;
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
