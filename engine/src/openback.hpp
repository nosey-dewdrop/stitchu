#pragma once
// Open-back cutout (açık sırt oyuğu) — an enclosed opening in the BACK center
// piece, below the nape: a bare span of back with a shaped facing finishing the
// edge. This is the back-panel analogue of the keyhole (KeyholeBlock): the
// opening is a stitch-line MARKING on the back piece (never cut out of the
// pattern paper), and a shaped FACING piece — an offset copy of the opening
// edge, exactly like the keyhole facing — is sewn around the line, the opening
// slashed through both layers and the facing turned inside.
//
// Four cutout shapes (BENCHMARK-58 Loop 9b):
//   RoundCutout — a wide circular/oval opening against the CB fold (Tie Back
//                 Mini Dress, low round backless).
//   LowV        — a deep V that opens wider as it descends (low open back).
//   Square      — a rectangular scoop.
//   Keyhole     — a teardrop, narrow at the nape, round at the bottom
//                 (keyhole-back), enclosed.
//
// The facing edge length is TRUED to the opening edge length (measured off the
// drawn opening, same discipline as the keyhole facing) so it can never drift.
// Opt-in (GarmentSpec.backOpening); None by default → existing drafts are
// byte-identical. See FORMULAS.md "Open-back cutout".
#include "geometry.hpp"

namespace stitchu {

// Back opening shape. None = no cutout (byte-identical default).
enum class BackOpening { None, RoundCutout, LowV, Square, Keyhole };

namespace OpenBackBlock {

inline constexpr double gapBelowNape = 40;  // opening top below the CB nape edge
                                            // (a yoke of fabric hangs the garment)
inline constexpr double waistClearance = 55; // keep the opening off the waist seam
inline constexpr double minLength = 55;      // shorter than this reads as a keyhole/slit
inline constexpr double maxLength = 320;     // a deep backless span
inline constexpr double facingMargin = 34;   // solid facing beyond the opening edge
inline constexpr double roundHalfW = 0.42;   // round/oval opening half-width / length
inline constexpr double vHalfW = 0.34;       // low-V opening half-width / length
inline constexpr double squareHalfW = 0.36;  // square opening half-width / length
inline constexpr double keyholeHalfW = 0.24; // keyhole opening half-width / length

// Adds the back-opening marking to the back center piece + the facing piece +
// construction steps. Returns false (and appends an honest guide note) when the
// garment has no back piece, or the back is too short to carry the opening —
// never fails silently.
bool apply(DraftedPattern& pattern, BackOpening shape);

} // namespace OpenBackBlock
} // namespace stitchu
