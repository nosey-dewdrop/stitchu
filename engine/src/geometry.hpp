#pragma once
// Stitchu engine geometry core. Semantics mirror the validated Swift engine
// exactly (see FORMULAS.md "Conventions"): mm units, y grows down, outline is
// the sewing line, cubic length via 24-step flattening.
#include <string>
#include <vector>

#include "constants.gen.hpp"

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

// EDGE ROLE (V7-C, 2026-08-24). Until now a PatternPiece carried no name for
// any of its edges, so every consumer that needed "the armhole" or "the cap"
// had to GUESS it back: by a substring of the piece name, by a hard-coded
// command index, or by a scalar length copied out of the draft. A guess cannot
// be wrong out loud, which is why the armhole<->cap agreement measured 0.00 mm
// (one scalar agreeing with itself) instead of measuring two drawn edges.
//
// An EdgeRole is a NAME given by the code that DRAWS the edge, and it ADDRESSES
// the edge instead of summarising it: `firstCommand..lastCommand` is an
// inclusive index range into PatternPiece::commands, so a consumer can rebuild
// the edge and measure its own arc length with pathLength(). No length is
// stored — a copied scalar is exactly the failure this replaces.
//
// `start`/`end` are the edge's endpoints as the drawing code knew them. They
// are an INTEGRITY ANCHOR, not data: a later post-pass that rewrites `commands`
// would leave the index range pointing at some other edge, and a name that can
// go quietly stale is worse than no name. edgePathOf() checks the anchor and
// returns EMPTY on a mismatch rather than handing back the wrong edge
// (RULES invariant 1: refuse, never coerce).
//
// Metadata only — never geometry, never a piece — so the golden dump (which
// reads commands + markings) is untouched, same discipline as `notches`.
struct EdgeRole {
    std::string role;       // "armhole_front" | "armhole_back"
                            // | "sleeve_cap" | "sleeve_underarm"
    int firstCommand = -1;  // inclusive index into PatternPiece::commands
    int lastCommand = -1;   // inclusive
    Point start;            // endpoint anchor: where the edge begins
    Point end;              // endpoint anchor: where the edge ends
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
    double seamAllowance = constants::kSeamAllowanceMM; // mm, drawn into cutLine
    // CUT ON FOLD (ASTM D6673 layer 6 "mirror line" / FreeSewing cutOnFold).
    // `onFold` mirrors the cut note ("cut 1 on fold"); `foldLine` is that note
    // turned into GEOMETRY — the straight x=0 mirror edge of the outline, so a
    // cutter can see which edge goes on the fabric fold instead of reading a
    // sentence. Kept OUT of `markings` on purpose: the golden dump reads
    // commands + markings, so the drawn sewing/cut geometry stays byte-identical
    // while this technical layer is added (same discipline as `notches`).
    // Empty when the piece is not cut on fold (never fabricated).
    bool onFold = false;
    std::vector<PathCommand> foldLine;
    // NAMED EDGES (see EdgeRole). Empty on a piece whose drafting code names
    // nothing — an absent name is reported as absent, never invented later.
    std::vector<EdgeRole> edgeRoles;
    // GEREKCE (F5-parca, 2026-09-02): why this piece EXISTS, in the engine's own
    // words — "on govde", "fermuar: yaka 36.0cm < bas 51.0cm", "iki pens: tek
    // pens agzi 5.1cm > 3.0cm". A piece with no reason is an error at the gate
    // (parca_sayisi_check): kosulsuz parca 0. Filled by the drafting block that
    // creates the piece, or by GarmentDrafter::fillGerekce for role pieces.
    std::string gerekce;
    // BITIRME class (F5-parca): a finishing strip (bias binding) is not a cut
    // PATTERN piece — it does not enter the cut-piece count, but it stays in
    // the list with its own gerekce. false = kesim parcasi (counted).
    bool bitirme = false;
};

// The commands of one named edge as a standalone path: a Move to `role.start`
// followed by commands[first..last]. Returns EMPTY when the range is out of
// bounds or when the endpoints no longer match the anchor (a stale role after
// some post-pass rewrote `commands`) — never a silently wrong edge.
std::vector<PathCommand> edgePathOf(const PatternPiece& piece, const EdgeRole& role,
                                    double tolMM = 1e-6);
// Arc length of one named edge, in mm, measured off the DRAWN commands with the
// same pathLength()/flattenCubic() primitives the rest of the engine uses.
// Returns 0 when edgePathOf() refuses the role.
double edgeLengthOf(const PatternPiece& piece, const EdgeRole& role,
                    double tolMM = 1e-6);

// RE-ADDRESS THE NAMED EDGES AFTER A POST-PASS (V7-D).
// An EdgeRole addresses `commands` by INDEX, so any pass that re-emits a piece's
// outline (the shoulder-panel split, the bardot/off-shoulder rework, the cup
// seam, the pleat, the Locket dart transfer) leaves every name pointing at some
// other edge.
// V7-C made that failure LOUD (edgePathOf refuses on a broken anchor) but nothing
// repaired it, so a piece that went through a post-pass simply lost its names.
//
// This repairs the ADDRESS from the role's own endpoint ANCHORS, which are
// coordinates and therefore survive a re-emission: find the two commands that
// still END at `start` and `end`, and re-point the index range between them.
// It never invents an edge — if either anchor is no longer a vertex of the
// outline (the post-pass genuinely reshaped that edge), the name is DROPPED, and
// a consumer then refuses BY NAME instead of measuring the wrong thing
// (RULES invariant 1). Roles that still resolve are left untouched.
void reanchorEdgeRoles(PatternPiece& piece, double tolMM = 1e-6);

// REHBER entry (F-H, 2026-08-23). The sewing GUIDE says what to do in what
// order; this says what to do it WITH and where this particular pattern will
// fight you. `basis` is the reason the sentence is allowed to exist:
//   "computed:<key>=<value>;..." a number this draft measured, or
//   "source:<id>"               a row in contract/guide-sources.json.
// Metadata only — never a piece, so the golden dump is untouched. Built by
// rehber.hpp; policed by engine/tests/guide_completeness_check.cpp.
struct GuideAdvice {
    std::string id;
    std::string text;
    std::string basis;
};

struct DraftedPattern {
    std::string garment;
    std::vector<PatternPiece> pieces;
    std::string fabricAdviceKey;
    double fabricMeters140 = 0.0;
    std::vector<std::string> guideSteps;
    // Material + technique layer beside the sewing order (F-H İŞ 2).
    std::vector<GuideAdvice> rehber;
    // Measured drop from the front bust apex to the natural waist, in the drafted
    // panel frame (drafted waist Y minus drafted apex Y). Carried out of the bodice
    // draft so the opt-in cup-seam post-pass can cut the second (waist) seam that
    // separates the Lower Cup from the Front Body without re-deriving the waist. 0
    // when there is no princess bodice / no bust apex to measure from. This is
    // metadata only (not a piece), so it never enters the golden dump.
    double cupSeamWaistBelowApex = 0.0;
    // Measured armhole (one arm, front half + back half, sewing line) + drafted
    // armhole depth, carried out of the bodice draft so the opt-in Locket sleeve
    // post-pass can refit its two-piece sleeve against the SAME armhole the base
    // sleeve was fit to, without re-deriving the bodice. Metadata only (not a
    // piece), so it never enters the golden dump.
    double sleeveArmholeLenMM = 0.0;
    double sleeveArmholeDepthMM = 0.0;
    // F5-parca: the DRESS block's own donning decision (gecis kurali,
    // contract/parca-gecis-v1.json). true = the narrowest passage (neck opening
    // stretched by the declared fabric, and the finished dress waist) is
    // narrower than the head reference, so the garment carries an invisible CB
    // zipper. `cbZipperGerekce` is the sentence WITH the numbers, stamped onto
    // the back pieces by annotateTechnical. Metadata only (not a piece).
    bool cbZipper = false;
    std::string cbZipperGerekce;
    // F7-edit: the edit program's own report (patternedit.cpp editJSON), set
    // ONLY when the spec declared an edit — so a no-edit draft's JSON stays
    // byte-identical. This is how a refused edit reaches the screen BY NAME
    // instead of dying as a discarded return value. Metadata only (no piece).
    std::string editProgramJSON;
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

// FOLD line (ASTM D6673 layer 6 mirror line): the straight x = 0 edge of a
// "cut on fold" outline, as a 2-point move+line path. Found by flattening the
// outline with the SAME 24-step flattening the offset/length code uses and
// keeping the edges whose BOTH endpoints sit on x = 0 (within `tolMM`); the
// returned segment spans their y range. Returns EMPTY when the outline has no
// such edge — an on-fold note without a fold edge is reported, never invented.
std::vector<PathCommand> foldLineOf(const std::vector<PathCommand>& outline,
                                    double tolMM = 0.5);

} // namespace stitchu
