#pragma once
// Ruffle (fırfır) trim pieces. A straight strip gathered down to the edge it
// trims: cut length = finished edge x fullness; gathered it returns to `edge`.
// Tiers cascade: tier i attaches to tier i-1's bottom edge, so its edge is
// edge x fullness^(i-1) and its cut length edge x fullness^i.
// Opt-in (GarmentSpec.ruffleHem); off by default so existing drafts are
// unchanged. See FORMULAS.md "Ruffle".
#include <vector>

#include "geometry.hpp"

namespace stitchu {
namespace RuffleBlock {

// edgeMM: the finished (sewn) edge the ruffle attaches to (e.g. hem circumference).
// fullness: gather ratio, 2.0–3.0 typical. depthMM: how deep it hangs.
// notches: even gather segments (each strip segment matches an edge segment).
PatternPiece draft(double edgeMM, double fullness = 2.5, double depthMM = 80, int notches = 4);

// Cascading tiers (kademeli fırfır). tier i (1-based) gathers onto an edge of
// edgeMM x fullness^(i-1). Every tier is depthMM deep; only the LAST tier
// carries a rolled-hem allowance — the others end in a seam that receives the
// next tier. tiers=1 returns exactly {draft(...)}.
std::vector<PatternPiece> draftTiers(
    double edgeMM, double fullness = 2.5, double depthMM = 80, int tiers = 1, int notches = 4);

} // namespace RuffleBlock
} // namespace stitchu
