#pragma once
// Fabric ties / sashes / bows (bağ / kuşak / fiyonk) — BENCHMARK-58 Loop 4b.
//
// A tie is a self-fabric strip, cut as a rectangle, folded lengthwise into a
// self-lined tube, turned right side out, and stitched to a garment edge where
// it knots into a bow. This block adds those tie PIECES (their own cut rectangle
// with a full cut note) plus a placement notch on the body piece — it never
// touches the bodice outline, so with no tie in the spec every golden dump stays
// byte-identical (opt-in, GarmentSpec.tieClosure == TiePlacement::None off by
// default, exactly like the keyhole and the placket post-passes).
//
// SCOPE (honest boundary): only SIMPLE APPLIED ties are drawn — a plain fabric
// strip stitched at an edge (back waist sash/bow, front neck/bust bow, open-back
// tie-back, cuff ties). A DRAWSTRING that GATHERS the fabric through a casing is
// a different construction (needs a casing channel + shirring the engine cannot
// draft) and stays in the honesty layer (missing.js), NOT here.
//
// Formulas (Aldrich / Armstrong doctrine + couture/high-street practice, see
// FORMULAS.md "Fabric ties / sashes"): a finished tie of width W and length L is
// cut as a rectangle (2W + 2·SA) wide × (L + 2·SA) long, self-lined by the fold.
#include "geometry.hpp"

namespace stitchu {

// Where a set of ties sits on the garment; drives the finished dimensions and
// which body piece carries the placement notch. Off = no tie drawn.
enum class TiePlacement { None, BackWaist, BackWaistBow, FrontNeckBow, TieBack, CuffTies };

namespace TieBlock {

// Appends the tie piece(s) for `placement` (a self-fabric strip cut as a
// rectangle, with a placement notch on the matching body piece) and a guide
// step. `waistMM` is the body waist circumference (sizes the back sash length).
// Does nothing for TiePlacement::None. Returns false (with an honest guide note)
// when there is no body piece to carry the placement — never fails silently.
bool apply(DraftedPattern& pattern, TiePlacement placement, double waistMM);

} // namespace TieBlock
} // namespace stitchu
