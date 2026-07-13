#pragma once
// Ruffle (fırfır) trim piece. A straight strip gathered down to the edge it
// trims: cut length = finished edge x fullness; gathered it returns to `edge`.
// Opt-in (GarmentSpec.ruffleHem); off by default so existing drafts are
// unchanged. See FORMULAS.md "Ruffle".
#include "geometry.hpp"

namespace stitchu {
namespace RuffleBlock {

// edgeMM: the finished (sewn) edge the ruffle attaches to (e.g. hem circumference).
// fullness: gather ratio, 2.0–3.0 typical. depthMM: how deep it hangs.
// notches: even gather segments (each strip segment matches an edge segment).
PatternPiece draft(double edgeMM, double fullness = 2.5, double depthMM = 80, int notches = 4);

} // namespace RuffleBlock
} // namespace stitchu
