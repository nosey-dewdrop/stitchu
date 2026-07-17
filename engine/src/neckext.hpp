#pragma once
// Neckline extensions (patch 3.16): the two vocabulary necklines that need more
// than a cut shape.
//
//   COWL  — the front neck is cut wide + deep (bodice.cpp neckWidthMultiplier /
//           frontNeckDepth already give it the width + drape depth). This block
//           does the CLOTH part the outline can't: it re-marks the front piece
//           to be cut on the BIAS with drape excess, so the deep neck falls into
//           soft self-facing folds instead of gaping. No new piece, no outline
//           change — a grainline + cut-note change on the existing front.
//
//   PUSSYBOW — a high neck band + a long self-lined tie strip that ties into a
//           bow at the throat. The band's attach edge is drafted to the exact
//           measured neckline length (trued like a stand collar, 0.00 mm), and
//           the tie is a self-lined tube (like tie.cpp). Two new pieces + a
//           placement notch; existing outlines untouched.
//
// Both are opt-in on the Neckline enum: for any of the 7 original necklines this
// block does nothing, so the base draft is BYTE-IDENTICAL. Truing: the band
// attach edge == neckline length; the tie is a measured rectangle (self-lined
// tube). HONEST BOUNDARY: an asymmetric / draped multi-layer cowl and an
// asymmetric bow are NOT drawn — the cowl excess is measured, the bow is a
// symmetric self-lined tie.

#include "measurements.hpp"
#include "geometry.hpp"

namespace stitchu {
namespace NecklineExtBlock {

// Applies the cowl bias re-mark OR the pussy-bow band + tie, depending on
// `neckline`. Does nothing for the 7 original necklines. `neckCM` sizes the tie
// length off the body. Returns true if it drew/marked something.
bool apply(DraftedPattern& pattern, Neckline neckline, double neckCM);

// The measured garment neckline length (mm, full: front + back, both sides) off
// the finished pieces — exposed so the ctest can prove the pussy-bow band attach
// edge equals it to 0.00 mm. Returns 0 when no neckline piece is present.
double necklineLengthMM(const DraftedPattern& pattern);

} // namespace NecklineExtBlock
} // namespace stitchu
