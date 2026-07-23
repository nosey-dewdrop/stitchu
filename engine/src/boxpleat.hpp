#pragma once
// Center inverted box pleat (orta ters kutu pili) — the first LOCALIZED fullness
// in the engine. Where the gather block (gather.cpp) and the gathered yoke
// (yoke.cpp Yoke::Gathered) spread their extra fabric EVENLY across a whole
// edge, an inverted box pleat is a SINGLE fold at ONE location: the center front
// (or center back). The piece is cut WIDER at the CF line by a fixed pleat
// underlay; the extra width is folded UNDER (the two outer folds meet at the
// center on the right side, the underlay tucks behind), so the FINISHED (sewn/
// pressed) width equals the original un-pleated width.
//
// This unlocks the swing / doll top (new_flats/volume_1 flat #12): a yoke with a
// single inverted box pleat hanging from it at center front, the body swinging
// free below the pleat. It is also reusable for pleated hems later (the same
// "widen at one line, fold the underlay out, true the finished width back"
// construction).
//
// GEOMETRY (Aldrich / Armstrong "inverted box pleat"): at the CF fold line the
// piece is extended outward (into negative x, past the fold) by 2 × depth — the
// two halves of the underlay that fold back behind the pleat. Because the piece
// is cut on the fold, the DRAWN half carries HALF the pleat: it grows by 2 × depth
// past x = 0 and stamps the two fold lines (the CF center line the pleat presses
// to, and the underlay fold at x = -2·depth) + a marking. The whole cut piece
// (mirrored on the fold) therefore adds 4 × depth of underlay, and once the pleat
// is folded out the finished width returns to the original — the truing.
//
// DEPTH: 40 mm each side (a classic swing / kick-pleat depth — Aldrich gives 20-
// 40 mm per side for a box pleat; 40 is the deep-swing end used on a swing top so
// the pleat reads). Total added underlay on the whole (mirrored) piece = 4 × 40 =
// 160 mm; on the drawn half = 2 × 40 = 80 mm past the CF fold.
//
// OPT-IN post-pass exactly like the yoke / peplum / gather blocks: with
// GarmentSpec.boxPleat == BoxPleat::None the drafted pattern is BYTE-IDENTICAL
// (the golden dump is unchanged).
//
// HOST (honest boundary): a dress/top FRONT panel that is cut ON THE FOLD at the
// CF (the pleat presses to that fold). The yoke block renames the lower front
// panel to "Front Body", so this block acts on that too (a swing top is yoke +
// box-pleat body). A skirt-only draft, a princess/cut-2 CF piece that has no CF
// fold to press the pleat to, or any garment without a foldable front panel is a
// documented HONEST no-op (a guideStep explains the skip) — never silent.
#include "geometry.hpp"

namespace stitchu {

// Box pleat treatment. None = no pleat (byte-identical default);
// CenterInverted = a single inverted box pleat at the center front, the underlay
// folded behind so the finished width equals the original.
enum class BoxPleat { None, CenterInverted };

namespace BoxPleatBlock {

// Pleat depth PER SIDE, in mm. 40 mm is a deep swing-pleat depth (Aldrich box-
// pleat range 20-40 mm/side; 40 = the deep end for a swing top so the pleat
// hangs open and reads). On the drawn on-fold half the piece grows 2 × depth
// (80 mm) past the CF fold; the whole mirrored piece adds 4 × depth (160 mm) of
// underlay, which folds out to true the finished width back to the original.
inline constexpr double depthMM = 40.0;

// Applies the center inverted box pleat. Does nothing for BoxPleat::None. Widens
// the front panel (or the yoke's "Front Body") at its CF fold by 2 × depth,
// stamps the pleat fold lines + a "form an inverted box pleat, N mm deep, fold to
// center" marking, and adds a guide step. The finished (folded-out) width equals
// the original — the truing. Returns false (with an honest guide note) when the
// draft has no CF-foldable front panel to host the pleat; never fails silently.
bool apply(DraftedPattern& pattern, BoxPleat style);

} // namespace BoxPleatBlock
} // namespace stitchu
