#pragma once
// Marker / nesting engine (PIPELINE Aşama 6 — CAD yüzeyi: marker/yerleşim).
// Lays the motor's PatternPiece cut geometry onto a fabric of a given width
// (mm) WITHOUT overlap, packs the pieces down the roll, and reports the marker
// efficiency (used piece area ÷ consumed fabric rectangle). This is NOT a
// drawing generator and holds NO LLM/heuristic guess: it reads the deterministic
// kernel geometry (geometry.hpp) — the same flattened polygons the DXF exporter
// emits, via the motor's own flattenCubic(...,24) — and places them by a fixed,
// deterministic algorithm. Same DraftedPattern + same fabric width + same
// options → the same marker (no dates, no randomness).
//
// Coordinate convention is the motor's: mm, y grows down (geometry.hpp:2-4). The
// fabric is a half-open strip x ∈ [0, fabricWidthMM], y ∈ [0, ∞) (the roll runs
// down +y). A placed piece is the original cut polygon rotated 0° or 90° and
// translated so it sits inside the strip. Every claim this module makes is
// checkable by the ctest gate (tests/nest_check.cpp): NO placed polygon overlaps
// another (real polygon intersection, not bbox), every piece is inside the
// fabric width, and the reported efficiency is derived from measured areas.
#include <string>
#include <vector>

#include "geometry.hpp"

namespace stitchu {
namespace nest {

// A closed polygon of a piece's CUT boundary in mm (motor frame, y-down). Built
// by flattening the piece's cutLine — or, honestly, the seamline when a strip
// piece carries no cut line (same rule as dxf::flattenPiece) — with the motor's
// own flattenCubic. The first and last point are NOT duplicated (the polygon is
// implicitly closed edge last->first).
struct PiecePolygon {
    std::string name;
    std::vector<Point> pts;   // motor frame, mm
    double area = 0.0;        // |signed shoelace area|, mm² (true polygon area)
};

// One piece placed on the fabric: which source polygon, whether it was rotated
// 90° clockwise, and the translation that put its (rotated) min-corner where the
// packer decided. The placed polygon is reconstructed by placedPolygon(...).
struct Placement {
    int pieceIndex = -1;   // index into the input polygon list
    bool rotated90 = false; // 90° CW rotation applied before translation
    double dx = 0.0;        // translation applied after rotation (mm)
    double dy = 0.0;
};

// The result of a nest: the placements, the fabric width it was packed into, the
// consumed roll LENGTH (max y reached, mm), and the efficiency in [0, 1]
// (sum piece area ÷ (fabricWidthMM × usedLengthMM)). `ok` is false with a reason
// when a piece cannot fit the fabric width in either orientation (honest refuse,
// never a silent drop).
struct NestResult {
    bool ok = false;
    std::string error;
    double fabricWidthMM = 0.0;
    double usedLengthMM = 0.0;
    double usedAreaMM2 = 0.0;    // Σ piece area
    double efficiency = 0.0;     // usedAreaMM2 / (fabricWidthMM × usedLengthMM)
    std::vector<Placement> placements;
};

// Options for the packer. gapMM is the minimum clearance the packer LEAVES
// between a placed piece's bounding box and its neighbours (a cutting margin) —
// it does NOT relax the overlap invariant (the invariant is checked on the true
// cut polygons with zero tolerance). rotate allows the 90° orientation.
struct NestOptions {
    double gapMM = 5.0;
    bool rotate = true;
};

// Flatten every piece of a drafted pattern into its cut polygon. `steps` is the
// cubic flattening resolution (24 = the motor's own, geometry.cpp). Pieces with
// no drawable boundary (empty polygon) are skipped honestly (not fabricated).
std::vector<PiecePolygon> piecePolygons(const DraftedPattern& pattern, int steps = 24);

// |signed shoelace area| of a closed polygon (mm²). 0 for < 3 points.
double polygonArea(const std::vector<Point>& pts);

// The axis-aligned bounding box of a polygon (mm).
Rect polygonBounds(const std::vector<Point>& pts);

// Reconstruct the placed polygon (motor frame, mm) for a placement against the
// source polygon list: rotate 90° CW if flagged, then translate by (dx, dy).
std::vector<Point> placedPolygon(const std::vector<PiecePolygon>& polys,
                                 const Placement& pl);

// TRUE polygon overlap test (not bounding box). Two closed polygons OVERLAP iff
// any pair of their edges properly cross, OR one polygon contains a vertex of
// the other (nested without edge crossing). Shared touching (an edge grazing) is
// NOT overlap. This is the geometric fact the nest gate proves == 0 over all
// pairs.
bool polygonsOverlap(const std::vector<Point>& a, const std::vector<Point>& b);

// Nest the pieces onto fabric of the given width (mm). Deterministic greedy
// shelf packer: pieces are sorted by descending bounding-box height (a stable,
// input-order tiebreak), each piece is placed left-to-right on the current shelf
// (or a new shelf below) in whichever allowed orientation fits the width and
// packs shortest; the gap margin is honoured between bounding boxes. Returns a
// NestResult with the placements + measured efficiency, or ok=false when a piece
// is wider than the fabric in both orientations.
NestResult nestPieces(const std::vector<PiecePolygon>& polys,
                      double fabricWidthMM,
                      const NestOptions& opts = {});

// Serialize a nest to an SVG string (mm units, y-down like the motor; a light
// fabric strip + every placed cut polygon outlined + a piece label). Deterministic
// text. The renderer tool rasterizes this to PNG (visual proof, RULES invariant 3).
std::string nestSVG(const std::vector<PiecePolygon>& polys,
                    const NestResult& result);

// Serialize a nest to a DXF-AAMA/ASTM R12 document (reusing dxf.cpp's writer):
// every placed cut polygon on the boundary layer, at its marker position, so an
// independent CAD opens the whole marker. Deterministic.
std::string nestDXF(const std::vector<PiecePolygon>& polys,
                    const NestResult& result);

} // namespace nest
} // namespace stitchu
