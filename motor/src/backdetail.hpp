#pragma once
// Back detail — ruffle / cape / flounce at the back (arkası pelerinli / fırfırlı)
// — vocabulary expansion 2026-07-17 (Damla: "arkası pelerinli/fırfırlı").
//
// A separate cut piece attached at the BACK neckline / yoke and falling down the
// back: a soft gathered RUFFLE frill, a flat draped CAPE panel, or a circular
// FLOUNCE. Its attach (top) edge is TRUED to the drafted back neck edge so it
// seams on cleanly; it hangs free below. It is its OWN cut piece and never
// touches an existing outline, so with no back detail in the spec every golden
// dump stays byte-identical (opt-in, GarmentSpec.backDetail == BackDetail::None
// off by default, exactly like the peplum / strap / tie passes).
//
// SCOPE (honest boundary): a back-neck-attached ruffle strip, a rectangular cape
// panel, and a circular flounce are drawn. A hooded cape, a watteau/train back,
// and a shoulder-attached cape stay honest (missing.js).
//
// Formulas (Aldrich circular flare + gathered frill doctrine, see FORMULAS.md
// "Back detail"): the attach edge = the finished back neck edge N (measured from
// the drafted back center piece, both halves). Ruffle = a strip N·fullness long
// (fullness 2.2) × depth, gathered to N. Cape = a flat panel N wide (the two back
// necks) × capeDrop long, softly shaped at the hem. Flounce = an annular sector
// whose inner arc = N (r0 = N / (2π) worn as a part-circle) and outer arc longer,
// so it ripples like a circular peplum worn at the back neck.
#include "geometry.hpp"

namespace stitchu {

// Back detail treatment. None = nothing drawn (byte-identical default).
// Ruffle  = a gathered self-fabric frill at the back neck.
// Cape     = a flat draped cape panel at the back neck/yoke.
// Flounce  = a circular flounce (self-rippling, no gathering) at the back neck.
enum class BackDetail { None, Ruffle, Cape, Flounce };

namespace BackDetailBlock {

inline constexpr double SA = constants::kSeamAllowanceMM; // seam allowance per edge (constants.yaml)
inline constexpr double ruffleFullness = constants::kBackRuffleFullness; // ruffle gather ratio (constants.yaml)
inline constexpr double ruffleDepth = 140;    // ruffle drop (mm)
inline constexpr double capeDrop = 380;       // cape panel length down the back (mm)
inline constexpr double flounceDepth = 200;   // flounce drop (mm)

// Appends the back-detail piece (attach edge trued to the finished back neck edge)
// + a placement notch on the back center piece + a guide step. Does nothing for
// BackDetail::None. Returns false (with an honest guide note) when there is no
// back body piece to attach it to — never fails silently.
bool apply(DraftedPattern& pattern, BackDetail detail);

} // namespace BackDetailBlock
} // namespace stitchu
