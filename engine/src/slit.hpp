#pragma once
// Back hem slit / walking vent (arka etek yırtmacı) — a walking opening rising
// from the hem up the CENTER-BACK seam of a fitted/straight skirt or dress back,
// so the wearer can walk. A slit is an opening in a SEAM: in this engine the back
// is cut on the fold, so SlitBlock converts the back to `cut 2` with a CB SEAM
// (stitched from the waist to the slit TOP POINT, left open below), draws that
// seam-stop/opening boundary as a bar-tack marking, and — for a Vent — grows a
// folded-back extension (underlap/overlap) with a 45° top corner off the CB.
//
// Two finishes (BENCHMARK-58 Loop M1):
//   Vent — a folded-back extension that laps the two backs closed when standing
//          (the classic tailored vent), 40 mm wide with a 45° top corner.
//   Slit — a plain faced opening: the CB seam simply stops at the top point and
//          both edges turn under (a straight hem slit, common on dresses).
//
// The outline geometry (waist, hip, hem) is untouched — only the cut note and
// markings change — so the fold-side outline stays byte-identical. A gathered /
// flared skirt already has walking ease (and no CB seam to host a vent) and is
// skipped with an honest note rather than forcing a seam into a fold panel.
// The extension width is TRUED to the CB fold offset (fold-to-edge = ventExtension
// at every y) so it can never drift. Opt-in (GarmentSpec.backSlit); None by
// default → existing drafts are byte-identical. See FORMULAS.md "Back hem slit".
#include "geometry.hpp"

namespace stitchu {

// Hem-slit finish. None = no slit (byte-identical default).
enum class HemSlit { None, Vent, Slit };

namespace SlitBlock {

inline constexpr double defaultHeight = 180;  // slit rise from the hem (≈7 in)
inline constexpr double minHeight = 100;      // shorter than this is not a walking slit
inline constexpr double maxHeight = 350;      // "hem to just above the knee" ceiling
inline constexpr double seatClearance = 60;   // keep the top point below the hip/seat line
inline constexpr double ventExtension = 40;   // folded-back underlap/overlap width (≈1.5 in)

// Adds the CB walking vent/slit to the back skirt/dress piece: flips its cut note
// to a CB seam, marks the seam-stop bar tack at the top point, and (for a Vent)
// draws the folded-back extension with its 45° top corner. Returns false (and
// appends an honest guide note) when there is no straight/fitted back CB seam to
// host a slit (gathered/pleated/half-circle skirt, or too short a back) — never
// fails silently.
bool apply(DraftedPattern& pattern, HemSlit finish);

} // namespace SlitBlock
} // namespace stitchu
