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
// which body piece carries the placement notch. Off = no tie drawn. APPEND-only
// enum — do not reorder (the JS/int bindings are positional).
//
// Front-tie variants (vocabulary expansion 2026-07-17, Damla: "önünden
// bağlamalı"): FrontWaistTie = a tie-front WAIST (two waist ties that knot at the
// center front); WrapFront = a wrap-front tie (a longer wrap tie that also SERVES
// AS THE FRONT OPENING, so it makes the garment donnable — wrap dresses/tops);
// FrontWaistBow = a front bow at the waist (decorative, ties at CF waist).
enum class TiePlacement {
    None, BackWaist, BackWaistBow, FrontNeckBow, TieBack, CuffTies,
    FrontWaistTie, WrapFront, FrontWaistBow,
};

namespace TieBlock {

// The FINISHED dimensions of one tie/bow, in mm, plus how many are cut. The
// numbers live here (not at each call site) so a second consumer cannot fork a
// copy of them: `op.attach` (patternedit.cpp) hangs the SAME bow this block
// already ships, and therefore adds no patternmaking number of its own.
struct Finished {
    double widthMM = 0;
    double lengthMM = 0;
    int count = 0;
};

// The decorative centre-front waist bow (TiePlacement::FrontWaistBow) — the
// figures FORMULAS.md "Fabric ties / sashes" already carries and this block has
// always drawn. Extracted VERBATIM, so `apply()` stays byte-identical.
Finished finishedBow();

// One self-fabric tie strip, cut as a rectangle folded lengthwise into a tube.
// `finishedW` / `finishedL` are FINISHED dimensions; the cut rectangle is
// (2*finishedW + 2*SA) wide x (finishedL + 2*SA) long. Exposed so op.attach
// draws the same component instead of a second, drifting copy of it.
PatternPiece strip(const std::string& name, const std::string& role,
                   double finishedW, double finishedL, int count);

// Appends the tie piece(s) for `placement` (a self-fabric strip cut as a
// rectangle, with a placement notch on the matching body piece) and a guide
// step. `waistMM` is the body waist circumference (sizes the back sash length).
// Does nothing for TiePlacement::None. Returns false (with an honest guide note)
// when there is no body piece to carry the placement — never fails silently.
bool apply(DraftedPattern& pattern, TiePlacement placement, double waistMM);

} // namespace TieBlock
} // namespace stitchu
