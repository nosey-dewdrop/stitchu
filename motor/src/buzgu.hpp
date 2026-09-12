#pragma once
// BÜZGÜ — the gathered-edge operator (M1-puf, 2026-09-02).
//
// WHAT WAS MISSING. Until today the engine had exactly one gathering object:
// GatherBlock, which ADDS a separate flat rectangle panel (drawstring /
// shirred / smocked) next to the body. It could not gather an edge that a
// piece ALREADY HAS. So a puff sleeve was faked: sleeve.cpp widened the crown
// by an INVENTED fraction of the sleeve width (`puffedSpreadFrac = 0.45`,
// `gatheredSpreadFrac = 0.20` — two numbers with no source) and the resulting
// surplus was whatever fell out. KOSU/ciktilar/kusur-listesi.md A1 named the
// consequence: "balon kol PUF hacmi yok ... kok neden KALIP/motor".
//
// WHAT A GATHERED EDGE IS. Not a squeeze. A gathered seam is a seam where one
// side is DRAWN LONGER than the side it is sewn to, and the surplus is drawn
// up on a gathering thread. So the operator is: take a NAMED edge of a piece,
// make its drawn arc length equal `ratio x finishedMM` (the length of the edge
// it will be sewn ONTO), and let the rest of the piece follow geometrically.
//
// HOW IT MOVES THE CLOTH. Slash-and-spread, ANISOTROPIC, in TWO components —
// and the split between them is CAPPED, not chosen. The edge's own chord and
// the perpendicular (sagitta) direction are scaled by two different factors:
//
//   1. the perpendicular factor is filled FIRST, up to a ceiling the caller
//      passes in (`perpMax`). On a sleeve cap that ceiling is a cap HEIGHT
//      limit, and it is a published band, not a taste: Aldrich's EU38 sleeve
//      cap height runs 130-150 mm (knowledge/cap-ease-isareti-2026-08-17.md
//      §2, "Aldrich EU38 bandi 13-15cm"). A puff head may sit ON the top of
//      that band; it may not sit above it.
//   2. whatever surplus does NOT fit under that ceiling goes into the CHORD,
//      by a factor solved by bisection so the drawn arc equals the target.
//
// Both extremes were tried and both were wrong. ONE uniform similarity (round
// 1) grew the chord and the sagitta together by 1.24 and made the cap 24%
// wider than the arm. Chord HELD, all surplus in the sagitta (round 2) put the
// EU38 cap height at 202.7 mm — 35% above the top of the Aldrich band, a
// number no reference carries. The measured witness sits between them and says
// BOTH move: the Bugra Locket's gathered Upper Sleeve is its own Lower cap with
// the chord x1.459 and the sagitta x1.227 (§2.1 of the same file). So the law
// here is the witness's shape with the band as the ceiling: sagitta up to the
// band top, the rest into the chord.
//
// A chord that grows means the two endpoints MOVE, so the operator retargets
// every command and every named edge that ends on them — nothing else in the
// piece is touched, and the outline stays closed.
//
// WHAT IT REFUSES, BY NAME (never a silent default): an edge whose role is not
// on the piece; a finished length that could not be measured; a ratio that is
// not > 1; and a solved scale outside a sane band. Every refusal returns the
// numbers it refused on.
//
// WHERE THE RATIO COMES FROM. Not from here. `ratio` is passed in, and the
// only ratios shipped today are the ones MEASURED on the purchased Bugra
// Locket (contract/tables.json draft.gatherRatios.sleeveCap*, source in that
// file). This file invents no number at all; the two bounds below are refusal
// guards, not design values.
#include <string>
#include <vector>

#include "geometry.hpp"

namespace stitchu {

// The report of one gathered edge. `ok == false` always carries `reason`.
struct BuzguResult {
    bool ok = false;
    std::string reason;        // named refusal, empty when ok
    double finishedMM = 0;     // the edge it is gathered ONTO
    double beforeMM = 0;       // drawn arc length before the operator
    double flatMM = 0;         // drawn arc length after (== finishedMM * ratio)
    double ratio = 0;          // flatMM / finishedMM, as asked
    double scale = 0;          // the applied CHORD factor (1.0 = chord held)
    double perpScale = 0;      // the applied SAGITTA factor (capped by perpMax)
    int notches = 0;           // gather marks stamped on the edge
};

// The solved two-component frame, WITHOUT touching a piece. Exposed because the
// two-layer Bugra puff (locket.cpp) draws its outer crown from the same law: it
// must not carry a second, private idea of how a gather spreads.
struct BuzguFrame {
    bool ok = false;
    std::string reason;
    double chordScale = 1.0;
    double perpScale = 1.0;
    double beforeMM = 0;
    double arcMM = 0;
};

namespace BuzguBlock {

// Refusal guards. A slash-and-spread that shrinks an edge is not a gather, and
// one that quadruples it is not wearable cloth; both are refused with the number.
inline constexpr double kMinScale = 1.0;
inline constexpr double kMaxScale = 3.0;
// And the chord search ceiling, once the sagitta has been filled to `perpMax`.
// An edge that still cannot reach its target with the chord tripled is refused
// with both numbers rather than half-gathered.
inline constexpr double kMaxChord = 3.0;

// Solves the two factors for an edge WITHOUT moving it. `perpMax` is the
// ceiling on the perpendicular (sagitta) factor; 1.0 means "hold the height,
// all of the gather goes into the chord" (a soft gathered head).
BuzguFrame solveFrame(const std::vector<PathCommand>& edge, Point start, Point end,
                      double targetMM, double perpMax);

// Gathers the edge named `role` on `piece` so its drawn arc length becomes
// `ratio * finishedMM`, and stamps `notchCount` evenly spaced gather marks
// along it (into piece.markings, where a pattern's sewing instructions live —
// a gather mark tells the sewer where to draw the thread up, so it belongs
// with the darts and fold lines, and `sleeve_check` reads it there). Returns a
// BuzguResult; on failure the piece is NOT touched.
BuzguResult gatherEdge(PatternPiece& piece, const std::string& role,
                       double finishedMM, double ratio, int notchCount,
                       double perpMax);

// Measures the drawn arc length of a named edge without changing anything.
// Returns 0 when the piece has no such edge.
double edgeLengthMM(const PatternPiece& piece, const std::string& role);

// Names an edge that is ALREADY drawn longer than the seam it joins, without
// moving a single point: stamps the gather marks and returns the measured
// ratio. This is the honest half of the operator — a balloon sleeve's hem is
// drafted wider than its cuff, so its gather is a MEASUREMENT, not a change,
// and inventing a ratio for it would overwrite a real one.
BuzguResult markGatheredEdge(PatternPiece& piece, const std::string& role,
                             double finishedMM, int notchCount);

} // namespace BuzguBlock
} // namespace stitchu
