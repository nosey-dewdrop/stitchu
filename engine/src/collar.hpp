#pragma once
// Collar family (yaka) — BENCHMARK-58 Loop 7 (+8 birleşik: stand/mock + flat/
// peter-pan/shirt collar).
//
// A collar is a SEPARATE piece stitched to the garment neckline. Two structural
// families, one shared governing constraint:
//   (a) STAND / MOCK — a band standing up at the neckline; its bottom (attach)
//       edge equals the neckline length, curved up at centre front so the band
//       hugs the neck.
//   (b) FLAT (peter-pan / flat / shirt) — a piece that lies on the shoulders,
//       its NECK edge matched to the neckline, its OUTER edge stylised
//       (round / pointed / scallop). A shirt collar is drawn as a two-piece
//       stand + blade.
//
// THE GOVERNING CONSTRAINT (trued, measured, not asserted): the collar's
// neck-edge sewing-line length == the garment neckline length (back neck arc +
// front neck arc, both sides). We measure that neckline straight off the
// FINISHED front + back centre pieces (the same outline the bodice drew), so the
// collar can never drift from the neckline it sews to — truing is by
// construction, and the ctest re-measures it to 0.00 mm.
//
// Post-pass like the tie / placket / keyhole: runs on the finished pattern, adds
// the collar PIECE(S) + a neckline placement notch, and NEVER touches an existing
// outline. With no collar in the spec (collarType == CollarType::None) every
// golden dump stays byte-identical.
//
// HONEST BOUNDARY: a bias-bound neckline (a bound raw edge, no collar piece) and
// a grown-on/knit band are NOT collars — they stay in the honesty layer
// (missing.js). This block draws stand, mock, flat, peter-pan and shirt collars
// only.
#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {

// Which collar the spec asks for. Off = no collar piece (byte-identical base).
//   Stand    — full stand-up band (~35 mm), hugs the neck (cf rise 15 mm).
//   Mock     — short mock/mandarin band (~30 mm), same construction, lower.
//   Flat     — flat collar, slight roll (shoulder overlap ~20 mm).
//   PeterPan — fully flat rounded collar (shoulder overlap ~15 mm).
//   Shirt    — convertible shirt collar drawn as a two-piece stand + blade.
enum class CollarType { None, Stand, Mock, Flat, PeterPan, Shirt };

// Outer-edge shape for the FLAT family (ignored by stand/mock/shirt, which have
// their own fixed edge). Round = classic peter-pan curve; Pointed = shirt-style
// points; Scallop = a wavy scalloped edge.
enum class CollarEdge { Round, Pointed, Scallop };

namespace CollarBlock {

// Appends the collar piece(s) for `type` (neck-edge trued to the garment
// neckline) + a placement notch on the neckline, and a guide step. `edge` shapes
// the flat family's outer edge. Does nothing for CollarType::None. Returns false
// (with an honest guide note) when there is no neckline to measure — never fails
// silently, never touches an existing outline.
bool apply(DraftedPattern& pattern, CollarType type, CollarEdge edge);

// The measured garment neckline length (mm, full: both sides, front + back) off
// the finished pieces — exposed so the ctest can prove the collar neck edge
// equals it to 0.00 mm. Returns 0 when no neckline piece is present.
double necklineLengthMM(const DraftedPattern& pattern);

} // namespace CollarBlock
} // namespace stitchu
