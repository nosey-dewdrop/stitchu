#include "geometry.hpp"

#include <algorithm>
#include <cmath>
#include <limits>

namespace stitchu {

double distance(Point a, Point b) {
    return std::hypot(b.x - a.x, b.y - a.y);
}

std::vector<Point> flattenCubic(Point from, Point to, Point cp1, Point cp2, int steps) {
    std::vector<Point> points;
    points.reserve(static_cast<size_t>(steps) + 1);
    points.push_back(from);
    for (int i = 1; i <= steps; ++i) {
        const double t = static_cast<double>(i) / steps;
        const double mt = 1.0 - t;
        points.push_back({
            mt * mt * mt * from.x + 3 * mt * mt * t * cp1.x + 3 * mt * t * t * cp2.x + t * t * t * to.x,
            mt * mt * mt * from.y + 3 * mt * mt * t * cp1.y + 3 * mt * t * t * cp2.y + t * t * t * to.y,
        });
    }
    return points;
}

double pathLength(const std::vector<PathCommand>& commands) {
    double length = 0.0;
    Point current{0.0, 0.0};
    Point subpathStart{0.0, 0.0};
    for (const auto& cmd : commands) {
        switch (cmd.type) {
            case CmdType::Move:
                current = cmd.to;
                subpathStart = cmd.to;
                break;
            case CmdType::Line:
                length += distance(current, cmd.to);
                current = cmd.to;
                break;
            case CmdType::Curve: {
                const auto samples = flattenCubic(current, cmd.to, cmd.cp1, cmd.cp2, 24);
                for (size_t i = 1; i < samples.size(); ++i) {
                    length += distance(samples[i - 1], samples[i]);
                }
                current = cmd.to;
                break;
            }
            case CmdType::Close:
                length += distance(current, subpathStart);
                current = subpathStart;
                break;
        }
    }
    return length;
}

Rect boundingBox(const std::vector<PathCommand>& commands) {
    double minX = std::numeric_limits<double>::max();
    double minY = std::numeric_limits<double>::max();
    double maxX = std::numeric_limits<double>::lowest();
    double maxY = std::numeric_limits<double>::lowest();
    auto eat = [&](Point p) {
        minX = std::min(minX, p.x);
        minY = std::min(minY, p.y);
        maxX = std::max(maxX, p.x);
        maxY = std::max(maxY, p.y);
    };
    for (const auto& cmd : commands) {
        switch (cmd.type) {
            case CmdType::Move:
            case CmdType::Line:
                eat(cmd.to);
                break;
            case CmdType::Curve:
                eat(cmd.to);
                eat(cmd.cp1);
                eat(cmd.cp2);
                break;
            case CmdType::Close:
                break;
        }
    }
    if (!(minX < maxX) || !(minY < maxY)) return {};
    return {minX, minY, maxX - minX, maxY - minY};
}

namespace {
Point lerp(Point a, Point b, double t) {
    return {a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t};
}
} // namespace

Point cubicPoint(Point from, const PathCommand& cmd, double t) {
    const double mt = 1.0 - t;
    return {
        mt * mt * mt * from.x + 3 * mt * mt * t * cmd.cp1.x + 3 * mt * t * t * cmd.cp2.x + t * t * t * cmd.to.x,
        mt * mt * mt * from.y + 3 * mt * mt * t * cmd.cp1.y + 3 * mt * t * t * cmd.cp2.y + t * t * t * cmd.to.y,
    };
}

CubicSplit splitCubic(Point from, const PathCommand& cmd, double t) {
    const Point q0 = lerp(from, cmd.cp1, t);
    const Point q1 = lerp(cmd.cp1, cmd.cp2, t);
    const Point q2 = lerp(cmd.cp2, cmd.to, t);
    const Point r0 = lerp(q0, q1, t);
    const Point r1 = lerp(q1, q2, t);
    const Point s = lerp(r0, r1, t);
    CubicSplit split;
    split.first = PathCommand::curve(s, q0, r0);
    split.second = PathCommand::curve(cmd.to, r1, q2);
    split.at = s;
    return split;
}

namespace {

// Coarse scan to bracket the target, then bisection. Works for either axis as
// long as the curve is monotonic enough on that axis (waist/armhole curves are).
double cubicTForAxis(Point from, const PathCommand& cmd, double target, bool useX) {
    auto value = [&](double t) {
        const Point p = cubicPoint(from, cmd, t);
        return useX ? p.x : p.y;
    };
    const int scanSteps = 64;
    double bestT = 0;
    double bestDelta = std::numeric_limits<double>::max();
    double lo = 0, hi = 1;
    bool bracketed = false;
    double prevT = 0, prevV = value(0);
    for (int i = 1; i <= scanSteps; ++i) {
        const double t = static_cast<double>(i) / scanSteps;
        const double v = value(t);
        if (!bracketed && ((prevV <= target && v >= target) || (prevV >= target && v <= target))) {
            lo = prevT;
            hi = t;
            bracketed = true;
        }
        if (std::fabs(v - target) < bestDelta) {
            bestDelta = std::fabs(v - target);
            bestT = t;
        }
        prevT = t;
        prevV = v;
    }
    if (!bracketed) return bestT; // target outside the curve: nearest endpoint
    for (int i = 0; i < 48; ++i) {
        const double mid = (lo + hi) / 2;
        const double v = value(mid);
        if (std::fabs(v - target) < 1e-4) return mid;
        const bool ascending = value(hi) >= value(lo);
        if ((v < target) == ascending) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
}

} // namespace

double cubicTForX(Point from, const PathCommand& cmd, double x) {
    return cubicTForAxis(from, cmd, x, /*useX=*/true);
}

double cubicTForY(Point from, const PathCommand& cmd, double y) {
    return cubicTForAxis(from, cmd, y, /*useX=*/false);
}

PathCommand reverseCubic(Point from, const PathCommand& cmd) {
    return PathCommand::curve(from, cmd.cp2, cmd.cp1);
}

void translatePiece(PatternPiece& piece, double dx, double dy) {
    auto shift = [&](std::vector<PathCommand>& commands) {
        for (auto& cmd : commands) {
            cmd.to.x += dx; cmd.to.y += dy;
            if (cmd.type == CmdType::Curve) {
                cmd.cp1.x += dx; cmd.cp1.y += dy;
                cmd.cp2.x += dx; cmd.cp2.y += dy;
            }
        }
    };
    shift(piece.commands);
    shift(piece.markings);
    shift(piece.cutLine);
    shift(piece.notches);
    shift(piece.foldLine);
    piece.grainline.from.x += dx; piece.grainline.from.y += dy;
    piece.grainline.to.x += dx; piece.grainline.to.y += dy;
    // Named edges move with the piece: the index range is unaffected, but the
    // endpoint anchors are coordinates and would otherwise go stale the moment a
    // panel is rebased to its own origin (the princess side panel does exactly
    // this), which would make edgePathOf() refuse a perfectly valid name.
    for (auto& role : piece.edgeRoles) {
        role.start.x += dx; role.start.y += dy;
        role.end.x += dx;   role.end.y += dy;
    }
}

std::vector<PathCommand> edgePathOf(const PatternPiece& piece, const EdgeRole& role,
                                    double tolMM) {
    const int n = static_cast<int>(piece.commands.size());
    if (role.firstCommand < 0 || role.lastCommand < role.firstCommand || role.lastCommand >= n)
        return {};
    // The last command of the range must still END where the drawing code said,
    // and the command before the range must still end at `start` (a range that
    // begins at index 0 starts at the Move itself).
    const Point drawnEnd = piece.commands[static_cast<size_t>(role.lastCommand)].to;
    if (std::fabs(drawnEnd.x - role.end.x) > tolMM || std::fabs(drawnEnd.y - role.end.y) > tolMM)
        return {};
    const Point drawnStart = role.firstCommand == 0
        ? piece.commands[0].to
        : piece.commands[static_cast<size_t>(role.firstCommand - 1)].to;
    if (std::fabs(drawnStart.x - role.start.x) > tolMM ||
        std::fabs(drawnStart.y - role.start.y) > tolMM)
        return {};

    std::vector<PathCommand> out{PathCommand::move(role.start)};
    for (int i = role.firstCommand; i <= role.lastCommand; ++i) {
        if (i == 0) continue; // the Move is already the start point
        out.push_back(piece.commands[static_cast<size_t>(i)]);
    }
    if (out.size() < 2) return {};
    return out;
}

double edgeLengthOf(const PatternPiece& piece, const EdgeRole& role, double tolMM) {
    const std::vector<PathCommand> path = edgePathOf(piece, role, tolMM);
    if (path.empty()) return 0.0;
    return pathLength(path);
}

namespace {

// Douglas-Peucker on an open polyline (first/last kept).
void simplifyRange(const std::vector<Point>& pts, size_t lo, size_t hi, double tol,
                   std::vector<bool>& keep) {
    if (hi <= lo + 1) return;
    const Point a = pts[lo], b = pts[hi];
    const double abx = b.x - a.x, aby = b.y - a.y;
    const double abLen = std::hypot(abx, aby);
    double worst = -1;
    size_t worstAt = lo;
    for (size_t i = lo + 1; i < hi; ++i) {
        double d;
        if (abLen < 1e-9) {
            d = distance(pts[i], a);
        } else {
            d = std::fabs((pts[i].x - a.x) * aby - (pts[i].y - a.y) * abx) / abLen;
        }
        if (d > worst) { worst = d; worstAt = i; }
    }
    if (worst > tol) {
        keep[worstAt] = true;
        simplifyRange(pts, lo, worstAt, tol, keep);
        simplifyRange(pts, worstAt, hi, tol, keep);
    }
}

} // namespace

std::vector<PathCommand> offsetOutline(
    const std::vector<PathCommand>& outline, double sa, bool clampFoldX) {
    if (sa <= 0.01 || outline.size() < 3) return {};

    // 1. Flatten the closed outline to a polygon (curves at 24 steps, the
    // engine-wide flattening resolution).
    std::vector<Point> poly;
    Point current{0, 0}, start{0, 0};
    for (const auto& cmd : outline) {
        switch (cmd.type) {
            case CmdType::Move:
                current = cmd.to; start = cmd.to;
                poly.push_back(current);
                break;
            case CmdType::Line:
                poly.push_back(cmd.to);
                current = cmd.to;
                break;
            case CmdType::Curve: {
                const auto pts = flattenCubic(current, cmd.to, cmd.cp1, cmd.cp2, 24);
                for (size_t i = 1; i < pts.size(); ++i) poly.push_back(pts[i]);
                current = cmd.to;
                break;
            }
            case CmdType::Close:
                break;
        }
    }
    // Drop a duplicated closing vertex.
    while (poly.size() > 1 && distance(poly.front(), poly.back()) < 0.01) poly.pop_back();
    const size_t n = poly.size();
    if (n < 3) return {};

    // 2. Which side is "outward"? Don't trust traversal direction (pieces are
    // authored both ways) — test it: nudge the first edge's midpoint along the
    // candidate normal and ask if it landed inside the polygon.
    auto insidePoly = [](const std::vector<Point>& pg, Point p) {
        bool in = false;
        for (size_t i = 0, j = pg.size() - 1; i < pg.size(); j = i++) {
            const Point& a = pg[i];
            const Point& b = pg[j];
            if ((a.y > p.y) != (b.y > p.y) &&
                p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) in = !in;
        }
        return in;
    };

    // 2b. Drop zero-length edges: duplicated vertices make garbage normals.
    std::vector<Point> clean;
    clean.reserve(n);
    for (const Point& p : poly) {
        if (clean.empty() || distance(clean.back(), p) > 0.01) clean.push_back(p);
    }
    while (clean.size() > 1 && distance(clean.front(), clean.back()) < 0.01) clean.pop_back();
    if (clean.size() < 3) return {};
    const size_t cn = clean.size();

    // Probe the longest edge (a stable witness) for the outward direction.
    size_t probe = 0;
    double probeLen = 0;
    for (size_t i = 0; i < cn; ++i) {
        const double len = distance(clean[i], clean[(i + 1) % cn]);
        if (len > probeLen) { probeLen = len; probe = i; }
    }
    const Point pa = clean[probe], pb = clean[(probe + 1) % cn];
    const double pex = (pb.x - pa.x) / probeLen, pey = (pb.y - pa.y) / probeLen;
    const Point mid{(pa.x + pb.x) / 2, (pa.y + pb.y) / 2};
    const Point tryLeft{mid.x + pey * 1.0, mid.y - pex * 1.0};
    const double outwardSign = insidePoly(clean, tryLeft) ? -1.0 : 1.0;

    // 3. Offset every EDGE along its outward normal, then join neighbours:
    // concave corner -> offset lines intersect, take the intersection (exactly
    // sa from both edges); convex corner -> miter if modest, else a bevel of
    // the two edge endpoints (each exactly sa from its own edge, so a sharp
    // gore/strap tip can never dip under the allowance the way a clamped
    // single-vertex miter does).
    struct Edge { Point a, b; double nx, ny; };
    std::vector<Edge> edges(cn);
    for (size_t i = 0; i < cn; ++i) {
        const Point& p = clean[i];
        const Point& q = clean[(i + 1) % cn];
        double ex = q.x - p.x, ey = q.y - p.y;
        const double len = std::hypot(ex, ey);
        ex /= len; ey /= len;
        const double nx = outwardSign * ey, ny = outwardSign * -ex;
        edges[i] = {{p.x + nx * sa, p.y + ny * sa}, {q.x + nx * sa, q.y + ny * sa}, nx, ny};
    }
    std::vector<Point> off;
    off.reserve(cn * 2);
    for (size_t i = 0; i < cn; ++i) {
        const Edge& e1 = edges[(i + cn - 1) % cn]; // arrives at vertex i
        const Edge& e2 = edges[i];                 // leaves vertex i
        // Line intersection of (e1.a->e1.b) and (e2.a->e2.b).
        const double d1x = e1.b.x - e1.a.x, d1y = e1.b.y - e1.a.y;
        const double d2x = e2.b.x - e2.a.x, d2y = e2.b.y - e2.a.y;
        const double denom = d1x * d2y - d1y * d2x;
        if (std::fabs(denom) < 1e-9) {
            // Collinear edges: the shared endpoint is the join.
            off.push_back(e1.b);
            continue;
        }
        const double t = ((e2.a.x - e1.a.x) * d2y - (e2.a.y - e1.a.y) * d2x) / denom;
        const Point meet{e1.a.x + t * d1x, e1.a.y + t * d1y};
        const double miter = distance(meet, clean[i]);
        if (miter <= sa * 2.5) {
            off.push_back(meet); // concave trim or modest convex miter
        } else {
            off.push_back(e1.b); // sharp convex tip: bevel with both endpoints
            off.push_back(e2.a);
        }
    }
    if (clampFoldX) {
        for (auto& p : off)
            if (p.x < 0) p.x = 0;
    }

    // 3b. ENVELOPE GUARANTEE: a concave stretch whose radius is tighter than
    // the allowance makes the raw offset curl back toward the outline (the
    // sleeve underarm, skirt gore valleys). Relax every offset point out to
    // the true distance-sa envelope: push any point that measures closer than
    // sa (against the sewing outline, fold edges excluded) straight away from
    // its nearest outline point. Three passes converge well below 0.1 mm.
    struct Seg { Point a, b; };
    std::vector<Seg> sew;
    sew.reserve(cn);
    for (size_t i = 0; i < cn; ++i) {
        const Point& a = clean[i];
        const Point& b = clean[(i + 1) % cn];
        if (clampFoldX && a.x < 0.5 && b.x < 0.5) continue; // the fold is not a seam
        sew.push_back({a, b});
    }
    auto nearestOnSeg = [](Point p, const Seg& s) {
        const double abx = s.b.x - s.a.x, aby = s.b.y - s.a.y;
        const double len2 = abx * abx + aby * aby;
        double t = len2 < 1e-12 ? 0 : ((p.x - s.a.x) * abx + (p.y - s.a.y) * aby) / len2;
        t = std::max(0.0, std::min(1.0, t));
        return Point{s.a.x + t * abx, s.a.y + t * aby};
    };
    for (int pass = 0; pass < 3; ++pass) {
        bool moved = false;
        for (auto& p : off) {
            if (clampFoldX && p.x < 0.1) continue; // on-fold points stay on the fold
            double bestD = 1e18;
            Point bestQ{0, 0};
            for (const auto& s : sew) {
                const Point q = nearestOnSeg(p, s);
                const double d = distance(p, q);
                if (d < bestD) { bestD = d; bestQ = q; }
            }
            if (bestD < sa - 0.05 && bestD > 1e-9) {
                const double push = sa / bestD;
                p = {bestQ.x + (p.x - bestQ.x) * push, bestQ.y + (p.y - bestQ.y) * push};
                if (clampFoldX && p.x < 0) p.x = 0;
                moved = true;
            }
        }
        if (!moved) break;
    }
    const size_t on = off.size();

    // 4. Simplify (0.2 mm) so the cut line stays light for JSON/print.
    std::vector<bool> keep(on, false);
    keep[0] = keep[on - 1] = true;
    simplifyRange(off, 0, on - 1, 0.2, keep);

    std::vector<PathCommand> result;
    result.push_back(PathCommand::move(off[0]));
    for (size_t i = 1; i < on; ++i)
        if (keep[i]) result.push_back(PathCommand::line(off[i]));
    result.push_back(PathCommand::close());
    return result;
}

std::vector<PathCommand> foldLineOf(const std::vector<PathCommand>& outline,
                                    double tolMM) {
    if (outline.size() < 3) return {};

    // Flatten to the same polygon the offset/length code walks (24 steps), so
    // the fold edge is read off the engine's own samples, not re-derived math.
    std::vector<Point> poly;
    Point current{0, 0};
    for (const auto& cmd : outline) {
        switch (cmd.type) {
            case CmdType::Move:
                current = cmd.to;
                poly.push_back(current);
                break;
            case CmdType::Line:
                poly.push_back(cmd.to);
                current = cmd.to;
                break;
            case CmdType::Curve: {
                const auto pts = flattenCubic(current, cmd.to, cmd.cp1, cmd.cp2, 24);
                for (size_t i = 1; i < pts.size(); ++i) poly.push_back(pts[i]);
                current = cmd.to;
                break;
            }
            case CmdType::Close:
                break;
        }
    }
    while (poly.size() > 1 && distance(poly.front(), poly.back()) < 0.01) poly.pop_back();
    const size_t n = poly.size();
    if (n < 3) return {};

    // Keep the edges whose BOTH ends sit on the fold axis x = 0. A single
    // vertex grazing x = 0 (a dart tip, a curve turning point) is not a fold
    // edge and is deliberately not enough.
    bool found = false;
    double yMin = 0, yMax = 0;
    for (size_t i = 0; i < n; ++i) {
        const Point& a = poly[i];
        const Point& b = poly[(i + 1) % n];
        if (std::fabs(a.x) > tolMM || std::fabs(b.x) > tolMM) continue;
        if (std::fabs(a.y - b.y) <= tolMM) continue;   // zero-length on the axis
        const double lo = std::min(a.y, b.y), hi = std::max(a.y, b.y);
        if (!found) { yMin = lo; yMax = hi; found = true; }
        else { yMin = std::min(yMin, lo); yMax = std::max(yMax, hi); }
    }
    if (!found) return {};

    return { PathCommand::move({0.0, yMin}), PathCommand::line({0.0, yMax}) };
}

} // namespace stitchu
