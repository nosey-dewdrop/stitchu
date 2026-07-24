#pragma once
// All-around hem flounce (etek ucu volanı — dropped-waist tiered flounce).
//
// A hem flounce is a gathered (or, later, circular) tier hung from the WHOLE hem
// of a dress/top — front hem + back hem together — the dropped-waist tiered
// look. It is NOT a peplum (that attaches to the WAIST, inner arc = finished
// waist) and NOT a back-neck flounce (backDetail:flounce, back-only at the nape).
// This block hangs a flounce from the drafted BOTTOM edge, all the way around.
//
// GATHERED variant (this block): the flounce is a flat strip cut WIDER than the
// hem (fullness ~2:1, the shirred ratio read from the K1 contract) by a fixed
// flounce depth, then drawn up so its gathered top edge shrinks to the finished
// hem length. The finished hem length is MEASURED off the drafted front + back
// bottom edges (exactly like the peplum measures the waist and the gather block
// measures its zone edge) so the flat cut width = hem × fullness is trued to that
// hem to 0.00 mm. Attaches around the whole hem (front + back), so the strip is
// cut in fabric-width segments and pieced into one long ring, then joined all the
// way around. This block only ADDS a piece + a placement notch (it never touches
// an existing outline), so with HemFlounce::None every golden dump stays
// byte-identical (opt-in, off by default, like the tie / gather / peplum passes).
//
// SCOPE (honest boundary): only the GATHERED all-around hem flounce is drawn (the
// look this flat reads — a gathered tier around a dropped-waist hem). A circular
// (un-gathered, flat-flared) hem flounce reuses the peplum's annular-sector
// geometry and is left as room in the enum (Circular) for a later loop; a pleated
// / tiered-multi-layer / asymmetric hem flounce stays in the honesty layer
// (missing.js), NOT here.
//
// Formulas (see FORMULAS.md "All-around hem flounce"): finished hem H (the drafted
// front + back bottom edges, both halves, cut on fold → whole circumference),
// fullness f = contract shirred ratio (2:1), depth D. The flat gathered edge =
// H · f is trued to the measured hem so it drifts by 0.00 mm; the cut depth =
// D + hem allowance + SA.
#include "geometry.hpp"

namespace stitchu {

// Hem flounce treatment. None = nothing drawn (byte-identical default);
// Gathered = a gathered strip cut ~2:1 wider than the hem, drawn up to fit it.
// (Circular is reserved for a later loop — a flat annular-sector flounce reusing
// the peplum geometry; append-only so the enum values never renumber.)
enum class HemFlounce { None, Gathered };

namespace HemFlounceBlock {

// Appends the flounce piece (a flat gathered strip whose gathered top edge is
// trued to the finished hem) + a placement notch on the front body + a guide
// step. Does nothing for HemFlounce::None. Returns false (with an honest guide
// note) when there is no measurable hosting hem to hang a flounce from — never
// fails silently.
bool apply(DraftedPattern& pattern, HemFlounce style);

} // namespace HemFlounceBlock
} // namespace stitchu
