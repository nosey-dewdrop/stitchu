#pragma once
// DXF-AAMA/ASTM exporter (PIPELINE Aşama 5 — endüstri sınırı). Serializes the
// motor's PatternPiece geometry (mm, y grows down; geometry.hpp) into a DXF R12
// ASCII interchange file whose layers follow the ASTM D6673-10 (WITHDRAWN 2019,
// not replaced) sewn-products convention so an independent CAD (Valentina,
// Seamly2D, ezdxf) can
// open it. This is NOT a drawing generator: it reads the deterministic kernel
// geometry and re-encodes it — LLM'siz, tahminsiz. Same DraftedPattern in →
// byte-identical DXF out (no dates/handles by content, no randomness).
//
// Coordinate convention: DXF is y-up; the motor is y-down. We NEGATE y on the
// way out (yDXF = -yMM) so a piece reads upright in a standard CAD viewer, and
// keep x as-is. mm are preserved exactly (DXF unit = mm, $INSUNITS = 4). A
// reader multiplies nothing: value in the file == motor mm (with y sign
// flipped). The parity proof (tools/dxf-export + ezdxf harness) checks this.
//
// Curves flatten with the SAME flattenCubic(...,24) the motor uses for lengths
// (geometry.cpp:13); the exported polyline vertices are therefore the motor's
// own flattened samples — no independent curve math that could drift.
#include <string>
#include <vector>

#include "geometry.hpp"

namespace stitchu {
namespace dxf {

// ASTM D6673 layer names for sewn-products piece exchange. These are the
// de-facto interchange layers (piece boundary, seamline, grainline, notch,
// internal, annotation); a receiving CAD keys off the NAME, not the color.
//
// ⚠ THE CITATION, STATED THE WAY A STRANGER CAN CHECK IT (GECE7 / F9, borç 100).
// The document is ASTM D6673-10, "Standard Practice for Sewn Products Pattern
// Data Interchange — Data Format", and it was WITHDRAWN IN 2019 WITH NO
// REPLACEMENT (store.astm.org marks it "(Withdrawn 2019)"). Its predecessor,
// cited normatively inside it, is ANSI/AAMA-292 / 292A — there is no such
// document as "AAMA-250", and this header used to name one. The layer
// assignment below is still what every CAD in the trade reads and writes, so
// the numbers do not move; what moves is the sentence around them. Calling a
// withdrawn standard "the current standard" is the mistake K63 already cost
// this repo once.
//
// ⭐ TWO NUMBERS WERE WRONG UNTIL GECE7 / F8, AND THEY WERE WRONG IN THE
// EXPENSIVE DIRECTION. Shipped until today: kSeamline = "8", kInternal = "11".
// In the ASTM D6673 layer assignment L8 is "internal line(s)" and L14 is
// "sew line(s)". So every DXF this engine has ever exported told a cutting room
// that our stitching line was an internal marking. A shop that keys off the
// layer name — which is the whole point of writing named layers — would sew the
// wrong line or drop it.
//
// 🚨 AND THE OLD DART LAYER WAS WORSE THAN THE PREVIOUS COMMENT CLAIMED. That
// comment said L11 is "a layer the convention does not define". IT IS DEFINED:
// L11 is "internal cutout(s)" — geometry that is CUT OUT OF THE PIECE AND
// THROWN AWAY (D6673-10 §3.1.4), as opposed to L8 internal lines, which are
// marked and NOT cut (§3.1.5). So the engine was not shipping darts into an
// undefined void; it was shipping them into a layer that instructs the cutting
// room to remove them. The bug was more expensive than the comment admitted,
// and it is written down here at its real size.
//
// ⚠ ONE OPEN ITEM, NAMED RATHER THAN SMOOTHED OVER. In D6673-10 the PIECE NAME
// ("Piece System Text", §4.3.1.1–2) belongs on Layer 1 with the boundary; L15
// is plotted annotation text. This exporter puts the piece name on L15. The
// layer numbers in this struct are sealed for this card (GECE7/F9.md
// DEĞİŞMEZLER: "KATMAN NUMARALARI DEĞİŞMEZ"), so the divergence is RECORDED,
// not silently claimed correct — a reader keying off L1 for the piece name will
// not find ours there.
//
// This is a RENAME, not a geometry change: the same polylines, the same mm, the
// same vertices, moved onto the layer whose published meaning they already had.
// The three readers that spell the numbers out rather than including this
// header move with it: tools/dxf-verify.py (the ezdxf parity harness behind
// dxf_check), tests/indir_check.mjs (the download gate) and tests/dxf_check.sh's
// own header comment. Everything inside the engine goes through the symbols
// below and needed no edit — which is why the bug survived: nothing in C++ ever
// wrote "8" by hand, so nothing in C++ could notice it meant the wrong thing.
struct Layers {
    static constexpr const char* kBoundary   = "1";   // cut line (piece boundary)
    static constexpr const char* kSeamline    = "14";  // sew line
    static constexpr const char* kGrainline   = "7";   // grainline
    static constexpr const char* kNotch       = "4";   // balance notches
    static constexpr const char* kFold        = "6";   // mirror line (cut on fold)
    static constexpr const char* kInternal    = "8";   // internal lines (darts, fold lines)
    static constexpr const char* kAnnotation  = "15";  // piece-name text
};

// One flattened polyline (closed or open) tagged with its target layer.
struct DxfPolyline {
    std::string layer;
    bool closed = false;
    std::vector<Point> points; // already in DXF frame (y negated)
};

// A text annotation (piece name) placed at a point in the DXF frame.
struct DxfText {
    std::string layer;
    Point at;         // DXF frame
    double height;    // mm
    std::string text;
};

// The full flattened model for one piece, layer by layer — the intermediate the
// serializer AND the ezdxf parity harness both read. Building this separately
// from the string writer keeps the geometry testable without parsing text.
struct DxfPiece {
    std::string name;
    std::vector<DxfPolyline> polylines;
    std::vector<DxfText> texts;
};

// Flatten one PatternPiece into layered DXF polylines/text. `steps` is the cubic
// flattening resolution (24 = the motor's own). cutLine may be empty (strip
// pieces): then the boundary layer carries the seam outline offset is skipped
// and only the seamline is emitted for that piece (honest: no fabricated cut
// line). Grainline is emitted only when piece.hasGrainline.
DxfPiece flattenPiece(const PatternPiece& piece, int steps = 24);

// Serialize one or more flattened pieces into a single DXF R12 ASCII document.
// All pieces share the file's coordinate space (no auto-nesting here; that is
// the marker/packing job, PIPELINE Aşama 6). Deterministic text output.
std::string writeDocument(const std::vector<DxfPiece>& pieces);

// Convenience: flatten + serialize a whole DraftedPattern.
std::string exportPattern(const DraftedPattern& pattern, int steps = 24);

} // namespace dxf
} // namespace stitchu
