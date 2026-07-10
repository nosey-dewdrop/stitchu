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

} // namespace stitchu
