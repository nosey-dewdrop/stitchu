#pragma once
// Keyhole (anahtar deliği) — an enclosed teardrop opening on the center front,
// just below the neckline: slit-narrow at the top, round at the bottom. The
// opening is a stitch-line MARKING on the front piece (you never cut it out of
// the pattern paper); a shaped facing piece is sewn around the line, the
// opening slashed through both layers and the facing turned inside.
// Opt-in (GarmentSpec.keyhole); off by default so existing drafts are
// unchanged. See FORMULAS.md "Keyhole".
#include "geometry.hpp"

namespace stitchu {
namespace KeyholeBlock {

inline constexpr double gapBelowNeck = 15;  // teardrop top below the CF neck edge
inline constexpr double maxLength = 85;
inline constexpr double minLength = 40;     // shorter than this reads as a buttonhole
inline constexpr double waistClearance = 60;
inline constexpr double facingMargin = 32;  // solid facing beyond the stitch line

// Adds the keyhole marking to the front center piece + the facing piece +
// construction steps (inserted right after the neckline facing is finished).
// Returns false (and appends an honest guide note) when the bodice is too
// short to carry a keyhole — never fails silently.
bool apply(DraftedPattern& pattern);

} // namespace KeyholeBlock
} // namespace stitchu
