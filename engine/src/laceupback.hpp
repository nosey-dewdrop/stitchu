#pragma once
// Corset lace-up back (korse bağcıklı sırt) — an eyelet-laced CENTER-BACK
// closure. Unlike the invisible CB zipper (which joins the two back halves) or
// the open-back cutout (a faced hole below the nape), a lace-up back leaves the
// two back edges APART: a gap at the center back is spanned by a cord that
// criss-crosses between two columns of eyelets, one down each back edge. The
// garment is therefore ADJUSTABLE — the lacing spans a range of body girths.
//
// On the pattern this block adds, per lace-up (Corset):
//   1) a CB facing/placket strip on EACH back edge (self-faced, interfaced) to
//      carry the eyelets — a straight foldless finished edge, NOT cut on fold;
//   2) a column of eyelet-position marks down each back edge at even spacing
//      (a corset ~28 mm pitch, first ~15 mm from the top). The two columns are
//      TRUED to the same y positions (<0.5 mm) so the lacing sits level;
//   3) a separate lacing CORD piece (a long narrow strip, cut 1), like the tie
//      block's cord, with a finished lace length trued to the eyelet-column
//      height (corset convention ≈ 3.5× the column height, to criss-cross the
//      whole run and tie off).
//
// Opt-in (GarmentSpec.laceUpBack); None by default → existing drafts are
// byte-identical. A skirt or a loose/gathered back is an honest no-op with a
// guide note (never a silent skip). See FORMULAS.md "Corset lace-up back".
//
// The open laced gap is inherently DONNABLE (the back is not closed — the body
// steps in through the unlaced gap, then the cord is laced up), so a lace-up
// back is a real donning opening (see wearability.cpp / opensForDonning).
#include "geometry.hpp"

namespace stitchu {

// Back closure style. None = no lace-up (byte-identical default).
enum class LaceUpBack { None, Corset };

namespace LaceUpBackBlock {

// Corset lacing conventions (FORMULAS.md "Corset lace-up back"; source: standard
// corsetry practice — see Waugh, "Corsets and Crinolines", and modern corset
// makers' ~1" eyelet pitch). Distances in mm.
inline constexpr double eyeletPitchMM = 28;      // spacing between eyelets (≈1")
inline constexpr double firstEyeletFromTopMM = 15; // top eyelet below the CB top edge
inline constexpr double eyeletBottomMarginMM = 20; // keep the last eyelet off the bottom edge
inline constexpr double facingWidthMM = 40;      // CB facing/placket strip width (carries eyelets)
inline constexpr double eyeletInsetMM = 20;      // eyelet column inset from the CB edge (mid-facing)
inline constexpr double eyeletMarkR = 3;         // drawn eyelet mark radius (a small ring)
inline constexpr double laceLengthFactor = 3.5;  // finished lace length / eyelet-column height
inline constexpr double gapMM = 30;              // the un-laced CB gap the lacing spans (nominal)
inline constexpr int minEyelets = 5;             // fewer than this is not a real corset back

// Adds the CB facing strip on each back edge, the trued eyelet columns, the
// lacing cord piece, and construction steps. Returns false (and appends an
// honest guide note) when there is no fitted (princess/dart) bodice back to
// host the lacing, or the back is too short to carry a real eyelet column —
// never fails silently.
bool apply(DraftedPattern& pattern, LaceUpBack style);

// A lace-up back opens the garment for donning (the CB gap is not closed — the
// body enters through the unlaced back). Single source of truth shared by the
// zipper-stamp (garment.cpp) and the wearability gate (wearability.cpp): a
// lace-up back must NOT also carry a redundant CB zipper.
inline bool opensForDonning(LaceUpBack style) {
    return style == LaceUpBack::Corset;
}

} // namespace LaceUpBackBlock
} // namespace stitchu
