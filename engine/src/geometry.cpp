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
    piece.grainline.from.x += dx; piece.grainline.from.y += dy;
    piece.grainline.to.x += dx; piece.grainline.to.y += dy;
}

} // namespace stitchu
