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

// ★ THE SLASH-AND-SPREAD, TWO COMPONENTS, THE BAND AS THE CEILING (round 3).
//
// Round 1 used ONE similarity about the chord midpoint, so the chord grew with
// the arc: at ratio 1.29 the sleeve's biceps line grew 24% too.
// Round 2 over-corrected and HELD the chord, which forced the entire 1.29 into
// the sagitta: EU38 cap height 202.7 mm against an Aldrich band of 130-150 mm,
// and the engine's own `sleeve_check` went red 45 times with "crown wider than
// plain (217 > 217)" — its law is that a gathered crown IS wider.
//
// Round 3 is the measured witness's own split, with the published band as a
// hard ceiling. The Bugra Locket's gathered Upper Sleeve is its Lower cap with
// the chord x1.459 and the sagitta x1.227 (knowledge/cap-ease-isareti-2026-08-17.md
// §2.1): BOTH grow, and the chord grows MORE. So:
//   * the sagitta is filled first, up to `perpMax` (a cap-height ceiling the
//     caller states from a published band — never invented here);
//   * the remainder goes into the chord, solved by bisection so the drawn arc
//     equals the target to floating point.
// The width the chord gains is not arm girth: it is gather allowance standing
// on the biceps line, drawn up on the thread into the same armhole. The engine's
// own gate says the same thing in one line — sleeve_check "crown >= biceps".
Point spreadAniso(Point p, Point origin, Point u, Point n, double kc, double kp) {
    const double a = (p.x - origin.x) * u.x + (p.y - origin.y) * u.y;
    const double b = (p.x - origin.x) * n.x + (p.y - origin.y) * n.y;
    return {origin.x + kc * a * u.x + kp * b * n.x,
            origin.y + kc * a * u.y + kp * b * n.y};
}

// Arc length the edge would have under the two-component map.
double anisoLength(const std::vector<PathCommand>& edge, Point origin, Point u,
                   Point n, double kc, double kp) {
    std::vector<PathCommand> t = edge;
    for (PathCommand& c : t) {
        c.to = spreadAniso(c.to, origin, u, n, kc, kp);
        if (c.type == CmdType::Curve) {
            c.cp1 = spreadAniso(c.cp1, origin, u, n, kc, kp);
            c.cp2 = spreadAniso(c.cp2, origin, u, n, kc, kp);
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
//
// WHICH LAYER (round 3). `gatherEdge` MOVES the cloth, so the piece it hands
// back is already a different drawn piece; its gather marks are a drawn sewing
// instruction like a dart or a fold line and go into `markings`, where a
// pattern's instructions live and where the engine's own `sleeve_check` looks
// for them ("crown gather marks present"). `markGatheredEdge` is the opposite
// contract — it promises not to move a single point — so ITS marks stay in the
// technical `notches` layer, and every ungathered piece stays byte-identical in
// the golden dump (which reads commands + markings).
void stampMarks(std::vector<PathCommand>& into, const PatternPiece& piece,
                const std::vector<PathCommand>& edge, int count) {
    const double half = std::max(4.0, piece.seamAllowance * 0.4);
    for (const EdgeSample& s : walkEdge(edge, count)) {
        const Point n{-s.t.y, s.t.x};   // normal to the seam
        into.push_back(PathCommand::move({s.p.x - n.x * half, s.p.y - n.y * half}));
        into.push_back(PathCommand::line({s.p.x + n.x * half, s.p.y + n.y * half}));
    }
}

} // namespace

BuzguFrame solveFrame(const std::vector<PathCommand>& edge, Point start, Point end,
                      double targetMM, double perpMax) {
    BuzguFrame f;
    if (edge.size() < 2) {
        f.reason = "buzgu cercevesi reddedildi: kenar bos";
        return f;
    }
    f.beforeMM = pathLength(edge);
    const double chord = distance(start, end);
    if (!(chord > 1e-6)) {
        f.reason = "buzgu cercevesi reddedildi: kenarin kirisi 0 mm";
        return f;
    }
    if (!(perpMax >= 1.0)) {
        f.reason = "buzgu cercevesi reddedildi: sagitta tavani " +
                   std::to_string(perpMax) + " — 1'den kucuk bir tavan kapagi ALCALTIR";
        return f;
    }
    const Point u{(end.x - start.x) / chord, (end.y - start.y) / chord};
    const Point n{-u.y, u.x};
    // THE ORIGIN IS THE CHORD MIDPOINT, NOT AN ENDPOINT. Round 2 could anchor
    // anywhere because it never scaled along the chord; the moment the chord
    // grows, an endpoint anchor pushes the whole cap sideways — the first draw
    // of round 3 produced a sleeve whose left underarm point had not moved and
    // whose right one had moved twice as far, a bat wing. About the midpoint
    // both underarm points travel outward by the same distance.
    const Point mid{(start.x + end.x) / 2, (start.y + end.y) / 2};

    // 1. SAGITTA FIRST, up to the caller's published ceiling. If the target is
    //    reached before the ceiling, the chord is not touched at all.
    double kp = 1.0;
    if (anisoLength(edge, mid, u, n, 1.0, perpMax) >= targetMM) {
        double lo = 1.0, hi = perpMax;
        for (int i = 0; i < 80; ++i) {
            const double t = (lo + hi) / 2;
            if (anisoLength(edge, mid, u, n, 1.0, t) < targetMM) lo = t; else hi = t;
        }
        kp = (lo + hi) / 2;
        f.ok = true;
        f.chordScale = 1.0;
        f.perpScale = kp;
        f.arcMM = anisoLength(edge, mid, u, n, 1.0, kp);
        return f;
    }
    // 2. The ceiling binds: the sagitta sits ON the band top and the REST of the
    //    gather goes into the chord.
    kp = perpMax;
    double lo = 1.0, hi = 1.0;
    while (anisoLength(edge, mid, u, n, hi, kp) < targetMM) {
        hi *= 1.5;
        if (hi > kMaxChord) {
            f.reason = "buzgu cercevesi reddedildi: sagitta tavani " +
                       std::to_string(perpMax) + " katta dolduruldu, kiris " +
                       std::to_string(kMaxChord) + " katina cikarilsa bile yay " +
                       std::to_string(anisoLength(edge, mid, u, n, kMaxChord, kp)) +
                       " mm, hedef " + std::to_string(targetMM) + " mm";
            return f;
        }
    }
    for (int i = 0; i < 80; ++i) {
        const double t = (lo + hi) / 2;
        if (anisoLength(edge, mid, u, n, t, kp) < targetMM) lo = t; else hi = t;
    }
    f.ok = true;
    f.chordScale = (lo + hi) / 2;
    f.perpScale = kp;
    f.arcMM = anisoLength(edge, mid, u, n, f.chordScale, kp);
    return f;
}

double edgeLengthMM(const PatternPiece& piece, const std::string& role) {
    const EdgeRole* r = findRole(piece, role);
    return r ? edgeLengthOf(piece, *r) : 0.0;
}

BuzguResult gatherEdge(PatternPiece& piece, const std::string& role,
                       double finishedMM, double ratio, int notchCount,
                       double perpMax) {
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

    // --- the spread: sagitta to the ceiling, the rest into the chord -------
    const BuzguFrame f = solveFrame(before, r.start, r.end, target, perpMax);
    if (!f.ok) { res.reason = f.reason; return res; }
    const double chord = distance(r.start, r.end);
    const Point u{(r.end.x - r.start.x) / chord, (r.end.y - r.start.y) / chord};
    const Point n{-u.y, u.x};
    const Point mid{(r.start.x + r.end.x) / 2, (r.start.y + r.end.y) / 2};
    const Point oldStart = r.start, oldEnd = r.end;
    const Point newStart = spreadAniso(oldStart, mid, u, n, f.chordScale, f.perpScale);
    const Point newEnd   = spreadAniso(oldEnd,   mid, u, n, f.chordScale, f.perpScale);

    for (int i = r.firstCommand; i <= r.lastCommand; ++i) {
        PathCommand& c = piece.commands[static_cast<size_t>(i)];
        c.to = spreadAniso(c.to, mid, u, n, f.chordScale, f.perpScale);
        if (c.type == CmdType::Curve) {
            c.cp1 = spreadAniso(c.cp1, mid, u, n, f.chordScale, f.perpScale);
            c.cp2 = spreadAniso(c.cp2, mid, u, n, f.chordScale, f.perpScale);
        }
    }
    // RETARGETING. When the chord grows the two endpoints move, so every OTHER
    // command and every OTHER named edge that lands on them has to follow, or
    // the outline tears open. Only points that sat EXACTLY on an endpoint are
    // moved (0.001 mm) — the rest of the piece keeps its drafted coordinates,
    // which is what makes this a slash-and-spread of the head and not a rescale
    // of the sleeve.
    auto snap = [&](Point& p) {
        if (distance(p, oldStart) < 1e-3) p = newStart;
        else if (distance(p, oldEnd) < 1e-3) p = newEnd;
    };
    for (int i = 0; i < static_cast<int>(piece.commands.size()); ++i) {
        if (i >= r.firstCommand && i <= r.lastCommand) continue;
        PathCommand& c = piece.commands[static_cast<size_t>(i)];
        snap(c.to);
        if (c.type == CmdType::Curve) { snap(c.cp1); snap(c.cp2); }
    }
    for (EdgeRole& e : piece.edgeRoles) { snap(e.start); snap(e.end); }

    const std::vector<PathCommand> after = edgePathOf(piece, *findRole(piece, role));
    res.flatMM = after.empty() ? 0.0 : pathLength(after);
    res.scale = f.chordScale;
    res.perpScale = f.perpScale;
    if (!after.empty() && notchCount > 0) {
        stampMarks(piece.markings, piece, after, notchCount);
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
    res.perpScale = 1.0;
    if (!(res.ratio > 1.0)) {
        res.reason = "buzgu isareti reddedildi: kenar hedefinden uzun degil (oran " +
                     std::to_string(res.ratio) + ") — burada buzgu YOK";
        return res;
    }
    if (notchCount > 0) {
        stampMarks(piece.notches, piece, edge, notchCount);
        res.notches = notchCount;
    }
    res.ok = true;
    return res;
}

} // namespace BuzguBlock
} // namespace stitchu
