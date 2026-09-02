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
// HOW IT MOVES THE CLOTH. Slash-and-spread, ANISOTROPIC: the edge's own chord
// is HELD (both endpoints are fixed points of the map) and only the component
// perpendicular to that chord is multiplied, by a factor solved by bisection so
// the drawn arc equals the target. On a sleeve cap the chord IS THE BICEPS LINE,
// and a biceps is a body measurement, not gather allowance — the first cut of
// this file used one uniform similarity and grew the biceps 24% along with the
// crown, which is precisely the fault `sleeveLaw._a3` names ("fullness at the
// top, cloth drawn in below"). Holding the chord also means nothing outside the
// edge moves: the outline stays closed with no retargeting, and the underarm
// seams keep their drafted length.
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
    double scale = 0;          // the applied similarity factor
    int notches = 0;           // gather marks stamped on the edge
};

namespace BuzguBlock {

// Refusal guards. A slash-and-spread that shrinks an edge is not a gather, and
// one that quadruples it is not wearable cloth; both are refused with the number.
inline constexpr double kMinScale = 1.0;
inline constexpr double kMaxScale = 3.0;
// And the sagitta search ceiling. Holding the chord means the whole surplus has
// to come out of the cap's height, so the solved perpendicular factor is always
// LARGER than the arc ratio; a cap that cannot reach its target inside this
// ceiling is refused with both numbers rather than half-gathered.
inline constexpr double kMaxPerp = 8.0;

// Gathers the edge named `role` on `piece` so its drawn arc length becomes
// `ratio * finishedMM`, and stamps `notchCount` evenly spaced gather marks
// along it (piece.notches — the technical layer, so the sewing/cut geometry
// dump of every UNGATHERED piece stays byte-identical). Returns a BuzguResult;
// on failure the piece is NOT touched.
BuzguResult gatherEdge(PatternPiece& piece, const std::string& role,
                       double finishedMM, double ratio, int notchCount);

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
