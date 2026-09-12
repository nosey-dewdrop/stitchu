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
//   Crescent — the Bugra Locket Top's deep U-crescent collar: ONE full drawn
//              U-band spanning the whole neckline (CF tip to CF tip) whose
//              inner (neck) edge is trued to the garment neckline, PLUS a
//              SEPARATE smaller Collar Lining piece cut on the fold — the
//              lining is cut smaller on purpose so the outer seam rolls to the
//              underside (patterns_real/BUGRA-DEFTER.md, Locket pieces 3+4).
enum class CollarType { None, Stand, Mock, Flat, PeterPan, Shirt, Crescent };

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

// The neckline's SHAPE, not just its length (F-K root cause: flatCollar() only
// ever received a scalar, so it could not know which way — or how hard — the
// neckline it sews to curves, and drew a dead-straight seam = a rectangular
// strip that stands up like a band instead of lying flat).
//
// All three numbers are MEASURED off the finished front/back pieces:
//   lengthMM     — full neckline (front + back, both sides)
//   halfTurnRad  — total turning of HALF the neckline (centre back round to
//                  centre front = exactly the span one on-fold collar half
//                  covers): |turn(back half)| + |turn(front half)|
//   shoulderMM   — the drafted front shoulder-seam length; the flat-collar
//                  draft pivots the shoulders about the neck point, so the
//                  2 cm shoulder overlap converts to an angle through it
// Zeroes when no neckline piece is present.
struct NecklineShape {
    double lengthMM = 0;
    double halfTurnRad = 0;
    double shoulderMM = 0;
};
NecklineShape necklineShapeMM(const DraftedPattern& pattern);

// The turning (rad) of the flat/peter-pan collar's neck edge as this block
// drafts it: the measured half-neckline turning MINUS the shoulder-overlap
// pivot angle. Exposed so the gate can re-derive it instead of trusting a
// number printed by the code under test. Returns 0 when the overlap eats the
// whole turning (the honest band-collar limit).
double flatCollarNeckTurnRad(const NecklineShape& shape);

} // namespace CollarBlock
} // namespace stitchu
