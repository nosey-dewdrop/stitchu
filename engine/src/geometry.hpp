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
    std::vector<PathCommand> commands;   // outline (SEWING line)
    std::vector<PathCommand> markings;   // darts, fold lines, notches
    // CUTTING line: the sewing line offset outward by seamAllowance (empty for
    // strip pieces whose cut note already includes every allowance). Cut on
    // this line, sew on `commands`.
    std::vector<PathCommand> cutLine;
    // BALANCE NOTCHES: short match marks on curved seams that must align when
    // sewn (armhole<->sleeve cap, bodice waist<->skirt waist, princess seams).
    // Kept SEPARATE from `markings` so the sewing/cut geometry (and the golden
    // dump, which reads commands + markings) stays byte-identical while the
    // technical layer is added. Convention: a "single" notch = one short line,
    // a "double" notch = two parallel short lines (front vs back match).
    std::vector<PathCommand> notches;
    // CLOSURE: a human label of the donning closure this piece carries, e.g.
    // "invisible zipper (center back)". Empty when the piece has no closure.
    // The zipper glyph itself is drawn into `notches` at the closure edge.
    std::string closure;
    bool hasGrainline = false;
    Grainline grainline;
    double seamAllowance = 15.0;         // mm, drawn into cutLine
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

// CUTTING line: offset the closed sewing outline outward by `sa` mm.
// Cubics are flattened, vertices move along averaged edge normals with a
// clamped miter (sharp corners like strap tips can't spike), and the result
// is simplified (Douglas-Peucker, 0.2 mm) back into a line path.
// clampFoldX: for "on fold" pieces the fold edge lives at x = 0 — the cut
// line is clamped to x >= 0 so no allowance is ever added across the fold.
std::vector<PathCommand> offsetOutline(
    const std::vector<PathCommand>& outline, double sa, bool clampFoldX);

} // namespace stitchu
