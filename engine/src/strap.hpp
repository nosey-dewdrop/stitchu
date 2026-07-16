#pragma once
// Ruffled / gathered shoulder straps (fırfırlı askı) — BENCHMARK-58 queue #3.
//
// A ruffled strap is a self-fabric strip cut LONGER than the finished strap and
// gathered down along its length so it ruffles, then attached at the front and
// back bodice top edges (a babydoll / camisole frilled strap). Unlike a plain
// shoulder strap (a rectangle at finished length) it carries fullness: the cut
// length = finished strap length x fullness, so gathered it returns to the strap
// span. This block adds those strap PIECES (their own cut rectangle with a full
// cut note + a gather line) plus a placement notch at each shoulder point on the
// front and back — it never touches an existing outline, so with no ruffled strap
// in the spec every golden dump stays byte-identical (opt-in,
// GarmentSpec.ruffledStraps == StrapStyle::None off by default, exactly like the
// tie / placket / keyhole post-passes).
//
// SCOPE (honest boundary): only the RUFFLED (gathered-strip) strap is drawn here
// — a plain shoulder / wide strap is already the engine's plain sleeveless edge,
// and a spaghetti / one-shoulder / off-shoulder / halter strap is a DIFFERENT
// construction that stays in the honesty layer (missing.js), NOT here.
//
// Formulas (Aldrich Metric Pattern Cutting + Armstrong + high-street babydoll
// practice, see FORMULAS.md "Ruffled straps"): a finished strap of width W and
// span L, gathered at fullness F, is cut (2W + 2·SA) wide x (L·F + 2·SA) long,
// self-lined by the lengthwise fold; the cut strip is gathered back down to L.
#include "geometry.hpp"

namespace stitchu {

// Shoulder-strap treatment. None = no strap piece drawn (byte-identical default);
// Ruffled = a gathered self-fabric frill strip drawn as a separate pair.
enum class StrapStyle { None, Ruffled };

namespace StrapBlock {

inline constexpr double SA = 15;             // 15 mm seam allowance per edge
inline constexpr double finishedWidth = 22;  // finished ruffled-strap width (mm)
inline constexpr double fullness = 2.2;      // gather ratio for a soft shoulder frill
inline constexpr double defaultSpan = 130;   // over-shoulder strap span (mm)
inline constexpr double minSpan = 90;        // shortest sensible shoulder-strap span
inline constexpr double maxSpan = 220;       // ceiling (over-shoulder run)

// Appends the ruffled-strap pair (a self-fabric strip cut at span x fullness,
// with a lengthwise fold + gather line + a placement notch at the shoulder point
// on the front and back body pieces) and a guide step. Does nothing for
// StrapStyle::None. Returns false (with an honest guide note) when there is no
// sleeveless bodice/top top edge to carry the straps — never fails silently.
bool apply(DraftedPattern& pattern, StrapStyle style);

} // namespace StrapBlock
} // namespace stitchu
