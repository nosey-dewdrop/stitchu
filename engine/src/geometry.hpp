#pragma once
// Stitchu engine geometry core. Semantics mirror the validated Swift engine
// exactly (see FORMULAS.md "Conventions"): mm units, y grows down, outline is
// the sewing line, cubic length via 24-step flattening.
#include <string>
#include <vector>

namespace stitchu {

struct Point {
    double x = 0.0;
    double y = 0.0;
};

enum class CmdType { Move, Line, Curve, Close };

struct PathCommand {
    CmdType type = CmdType::Close;
    Point to;   // Move/Line/Curve target
    Point cp1;  // Curve only
    Point cp2;  // Curve only

    static PathCommand move(Point p) { return {CmdType::Move, p, {}, {}}; }
    static PathCommand line(Point p) { return {CmdType::Line, p, {}, {}}; }
    static PathCommand curve(Point to, Point cp1, Point cp2) { return {CmdType::Curve, to, cp1, cp2}; }
    static PathCommand close() { return {CmdType::Close, {}, {}, {}}; }
};

struct Rect {
    double x = 0.0, y = 0.0, width = 0.0, height = 0.0;
};

struct Grainline {
    Point from;
    Point to;
};

struct PatternPiece {
    std::string name;
    std::string cutInstruction;
    std::vector<PathCommand> commands;   // outline (sewing line)
    std::vector<PathCommand> markings;   // darts, fold lines, notches
    bool hasGrainline = false;
    Grainline grainline;
    double seamAllowance = 15.0;         // mm, metadata
};

struct DraftedPattern {
    std::string garment;
    std::vector<PatternPiece> pieces;
    std::string fabricAdviceKey;
    double fabricMeters140 = 0.0;
    std::vector<std::string> guideSteps;
};

// Flatten one cubic to `steps` segments; returns steps+1 points incl. `from`.
// Same parameterization as the Swift engine (uniform t).
std::vector<Point> flattenCubic(Point from, Point to, Point cp1, Point cp2, int steps);

// Approximate path length in mm, cubics flattened to 24 segments.
// Matches Swift pathLength(): current starts at origin, close returns to the
// last subpath start.
double pathLength(const std::vector<PathCommand>& commands);

// Bounding box over outline points INCLUDING curve control points (matches
// Swift PatternPiece.boundingBox). Zero rect when degenerate.
Rect boundingBox(const std::vector<PathCommand>& commands);

double distance(Point a, Point b);

} // namespace stitchu
