#pragma once
// Drawstring / shirred / smocked gathering (büzgü) — BENCHMARK-58 Loop 8.
//
// A gathered panel is a flat piece cut WIDER (and, at a neckline, taller) than
// the edge it joins, then drawn up so its long gathered edge shrinks to the
// finished length of that edge. The three sub-types differ only in HOW the
// fullness is controlled and therefore in the gather RATIO:
//
//   DRAWSTRING  a channel (casing) is folded at the panel's top edge and a cord
//               runs through it; pulling the cord gathers the fabric along the
//               casing. Piece: a flat panel + a folded casing line + eyelet /
//               opening marks + a SEPARATE self-fabric cord (a long narrow tube,
//               like a tie). Ratio ~1.8:1 (couture drawstring waist / babydoll
//               neckline pulls up to a little over half its flat width).
//   SHIRRED     parallel rows of gathering (elastic thread / gathering stitch)
//               shrink the panel evenly. Piece: a flat panel + parallel shirring
//               guide rows. Ratio 2:1 (Aldrich / high-street shirred bodice:
//               2 in of flat fabric -> 1 in shirred).
//   SMOCKED     decorative geometric shirring — the fancy shirred. Same base
//               panel + a smocking dot GRID to gauge the pleats. Ratio 3:1
//               (couture smocking: 3 in -> 1 in).
//
// The finished (gathered) edge length is MEASURED off the drafted body piece at
// the chosen zone (the neckline, the bust seam or the waist seam of the front),
// exactly like the collar reads the neckline — so the flat cut width = measured
// edge x ratio is trued to that edge to 0.00 mm. This block only ADDS pieces +
// notches (never touches an existing outline), so with GatherType::None every
// golden dump is byte-identical (opt-in, off by default, like the tie / collar
// / placket post-passes).
//
// SCOPE (honest boundary): the panel + casing + cord + shirring/smocking grid
// are drawn. Anything the engine still cannot draft (e.g. a fully smocked
// three-dimensional couture panel with shaped honeycomb) stays approximate and
// is noted, not silently wrong.
#include "geometry.hpp"

namespace stitchu {

// Which construction gathers the panel. Off = nothing drawn (byte-identical).
enum class GatherType { None, Drawstring, Shirred, Smocked };

// Where on the body the gather sits — drives which drafted edge is measured for
// the finished (gathered) length and which body piece carries the placement.
enum class GatherZone { Neckline, Bust, Waist, Sleeve };

namespace GatherBlock {

// Appends the gathered panel piece (+ a drawstring cord piece when Drawstring)
// and a placement notch on the matching body piece, sized so the panel's
// gathered edge equals the drafted `zone` edge. Does nothing for
// GatherType::None. Returns false (with an honest guide note) when there is no
// measurable edge to gather onto — never fails silently.
bool apply(DraftedPattern& pattern, GatherType type, GatherZone zone);

} // namespace GatherBlock
} // namespace stitchu
