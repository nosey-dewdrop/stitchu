#pragma once
// True wrap / surplice crossover front (kruvaze / surplice ön) — a REAL crossed
// double front, not a decorative tie. This is the wrap-dress / surplice-bodice
// family: the LEFT and RIGHT front panels each extend PAST the center front to
// the opposite side, so when worn the right front laps over the left (women's
// convention) and the two overlapping diagonal edges form a surplice V neckline.
//
// Unlike the wrap-front TIE (tie.cpp, TiePlacement::WrapFront), which only adds a
// tie strip and leaves the front cut on the fold, this block reshapes the FRONT
// panel geometry itself:
//   - the on-fold half front is REBUILT as a full asymmetric panel whose center-
//     front edge is extended past CF into a diagonal WRAP edge that crosses the
//     body centerline (the wrap allowance);
//   - because both fronts wrap, the front is cut as TWO mirror-image asymmetric
//     panels (cut 2, NOT cut 1 on fold) — a left-wrap and a right-wrap that lap
//     over each other at CF;
//   - the surplice V neckline is the drafted neck edge (unchanged, so the neck
//     facing still trues to it) meeting the new diagonal wrap edge at the CF-neck
//     point — together they read as the plunging surplice V of a wrap dress.
//
// The overlap is REAL and wearable: each panel laps `kWrapPastCFShare` of the
// drafted front-chest width PAST the center front, so the two panels together
// cover the center front with a generous overlap. A wrap tie at the side seam /
// waist holds it (an existing WrapFront tie composes on top); the wrap itself is
// the donning opening, so the dress needs no extra zip.
//
// Opt-in (GarmentSpec.wrapFront); None by default → existing drafts are
// byte-identical. Only a dress/top bodice FRONT (dart or princess) hosts one; a
// skirt (or any draft with no front bodice panel) is an honest no-op with a guide
// note, never a silent skip. See FORMULAS.md "Wrap / surplice front".
#include "geometry.hpp"

namespace stitchu {

// Front closure/silhouette style. None = no wrap (byte-identical default).
// Surplice = the crossed-over double front (the wrap-dress family).
enum class WrapFront { None, Surplice };

namespace WrapFrontBlock {

// Wrap convention (FORMULAS.md "Wrap / surplice front"; source: Aldrich
// "Metric Pattern Cutting" wrap block + Armstrong "Patternmaking" surplice/wrap
// front — each front laps past CF to at least the opposite side-front so the two
// crossed fronts give real coverage and the wrap holds closed). Distances in mm
// unless noted.

// How far past the center front each panel laps, as a share of the drafted
// FRONT-CHEST width (a quarter of the bust girth). ~1/2 of that quarter reaches
// roughly the opposite bust point, so the two fronts overlap generously across
// CF and neither gapes open. A real wrap laps 1/2 to a full front width; half is
// the conservative, always-covered choice.
inline constexpr double kWrapPastCFShare = 0.50;
// Floor / ceiling on the wrap-past-CF distance so a tiny or huge frame still gets
// a sane, wearable overlap (never a token 5 mm crossover, never past the side).
inline constexpr double kWrapPastCFMinMM = 90;
inline constexpr double kWrapPastCFMaxMM = 260;

// Reshapes the front bodice panel(s) into two mirror-image asymmetric wrap
// panels that lap past the center front and adds the surplice construction
// steps. `frontChestWidth` is the drafted front-chest width (bust/4-ish) the
// wrap allowance scales from — passed in so the block never re-derives the body.
// Returns false (leaving the draft untouched) and appends an honest guide note
// when there is no front bodice panel to host the wrap (a skirt / bodiceless
// draft) — never fails silently.
bool apply(DraftedPattern& pattern, WrapFront style, double frontChestWidth);

// A wrap front IS the donning opening (the front laps over itself and opens at
// the wrap, like a wrap dress). Single source of truth shared by the zipper-stamp
// (garment.cpp) and the wearability gate (wearability.cpp): a wrapped front must
// NOT also carry a redundant invisible CB zipper.
inline bool opensForDonning(WrapFront style) {
    return style == WrapFront::Surplice;
}

} // namespace WrapFrontBlock
} // namespace stitchu
