#pragma once
// Yoke split (roba / omuz-yakası — the doll / babydoll / swing-dress yoke). This is
// the horizontal shoulder / upper-chest seam that a doll dress hangs its flared or
// gathered lower body from (new_flats/volume_1 "Doll Dress": Peter-Pan collar + puff
// sleeve + a horizontal YOKE across the shoulders/upper chest, the body flaring below
// it). A forensic pass over 23 fashion flats found this the single highest-frequency
// missing capability (3 flats need it) — the motor could draw the collar, the sleeve
// and the flare, but not the horizontal seam that carries them.
//
// This block splits BOTH the FRONT and BACK bodice panels along a HORIZONTAL seam
// high on the chest (the yoke line), producing a Front Yoke + Back Yoke (the upper
// panels, shoulder line down to the yoke line) and a Front / Back lower body (the
// yoke line down to the hem). It is the SAME technique as the cup seam (cupseam.hpp)
// — a horizontal cut of a drafted bodice panel into two length-matched, notched
// pieces — but at a DIFFERENT y (the yoke line, ABOVE the bust, not through the apex)
// and on BOTH front and back (a doll dress yokes across the whole shoulder, not just
// the front cups).
//
// The yoke y is MEASURED, never hardcoded: it is read from each panel's own drawn
// outline — a fraction (kYokeDropShare) of that panel's shoulder-to-hem drop below
// its own top (shoulder/neck) edge. So the seam scales with the drafted body and can
// never drift from a hardcoded mm; the front and back yokes land at the same
// proportional level.
//
// The yoke's lower edge and the lower body's top edge are the SAME horizontal cut by
// construction, so they are length-matched to <0.5 mm and sew together; a matching
// notch is stamped at each end of every seam so the sewer pairs them.
//
// GATHER (Yoke::Gathered): the lower BODY pieces are drawn WIDER at their top (yoke-
// seam) edge by a babydoll fullness ratio and a "gather the body top edge to fit the
// yoke lower edge (ratio N)" note + gather notches stamped (mirroring gather.cpp),
// while the SEWN (gathered-down) length still trues to the yoke's lower edge <0.5 mm.
// The widening is added ONLY to the body top edge (the side seams below flow to the
// original hem) so the head opening / armholes / collar-facing on the Yoke piece are
// untouched. Plain keeps the doll-dress A-line flare that the skirt block already
// draws below the seam.
//
// It is an OPT-IN post-pass exactly like cup seam / peplum / collar / gather: with
// GarmentSpec.yoke == Yoke::None the drafted pattern is BYTE-IDENTICAL (the golden
// dump is unchanged).
//
// HOST (honest boundary): only a dress/top with a princess or dart bodice FRONT and
// BACK. A skirt, or anything without a bodice front/back to split, is a documented
// honest no-op (a guideStep explains the skip) — never a silent no-op. (The garment-
// level guard in garment.cpp also gates it to dress/top, so a skirt is byte-identical
// and the block's own refusal is the belt-and-braces.)
#include "geometry.hpp"

namespace stitchu {

// Yoke treatment. None = no yoke (byte-identical default);
// Plain = split the front + back bodice panels into a Yoke + a lower body at a
// measured yoke line high on the chest (the doll-dress construction, the lower body
// hanging plain from the yoke seam);
// Gathered = the same split, but the lower BODY pieces are drawn WIDER at their top
// edge (the edge that sews to the yoke's lower edge) by a babydoll fullness ratio
// (contract::kGatherRatio_shirred, 2:1) and gathered to fit the yoke — the swing /
// babydoll dress where the body gathers into the yoke seam. The gathered-down (sewn)
// length still trues to the yoke's lower edge <0.5 mm, exactly like the gather block:
// the top edge is physically wider but gathers back down to the yoke edge.
enum class Yoke { None, Plain, Gathered };

namespace YokeBlock {

// Where the yoke line sits: this fraction of a panel's OWN drawn shoulder-to-hem
// drop, below that panel's own top (shoulder/neck) edge. 0.28 puts the seam high on
// the chest — above the bust apex, at roughly the doll-dress yoke level (the flat's
// yoke sits just below the shoulder, across the upper chest). MEASURED off the drawn
// panel, so it scales with the body and never drifts from a hardcoded mm.
inline constexpr double kYokeDropShare = 0.28;

// Applies the yoke split. Does nothing for Yoke::None. Returns false (with an honest
// guide note) when the draft has no matching host (no bodice front/back to split) —
// never fails silently. Splits both the front and the back bodice panel(s) at their
// own measured yoke line, replacing each with a Yoke (upper) + a lower body piece.
bool apply(DraftedPattern& pattern, Yoke style);

} // namespace YokeBlock
} // namespace stitchu
