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

// Point on a cubic (from -> cmd.to with cmd.cp1/cp2) at parameter t.
Point cubicPoint(Point from, const PathCommand& cmd, double t);

// De Casteljau split of a cubic at t: two cubics that together retrace the
// original exactly. first runs from `from` to the split point, second from the
// split point to cmd.to.
struct CubicSplit {
    PathCommand first;
    PathCommand second;
    Point at; // the split point (== first.to)
};
CubicSplit splitCubic(Point from, const PathCommand& cmd, double t);

// Parameter t where the cubic reaches the given x (coarse scan + bisection;
// intended for curves monotonic in x like waist curves).
double cubicTForX(Point from, const PathCommand& cmd, double x);
// Same for y (armhole curves are monotonic in y).
double cubicTForY(Point from, const PathCommand& cmd, double y);

// The same cubic traversed in the opposite direction (cp1/cp2 swapped).
// `from` is the original start point, which becomes the new target.
PathCommand reverseCubic(Point from, const PathCommand& cmd);

// Shift every coordinate (outline + markings + grainline) by (dx, dy).
void translatePiece(PatternPiece& piece, double dx, double dy);

} // namespace stitchu
