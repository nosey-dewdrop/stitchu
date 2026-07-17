#pragma once
// Shoulder / sleeve-join styles (patch 3.13): dropped shoulder + raglan.
//
// These are NOT post-passes that append a piece — they change HOW the sleeve
// meets the body, so they thread into the bodice + sleeve draft where the
// shoulder tip, armhole curve and cap solver all live in one body frame:
//
//   Set (default)  the classic set-in armhole. Every constant below is unused;
//                  the draft is BYTE-IDENTICAL to the pre-3.13 engine.
//   Dropped        the shoulder seam is slid DOWN the upper arm: the shoulder
//                  line extends past the natural shoulder point and the armhole
//                  point drops + widens. The cap then flattens on its own (the
//                  sleeve solver reads the longer/deeper armhole). Aldrich
//                  "dropped/extended shoulder": relaxed, no set-in crown.
//   Raglan         there is no shoulder seam. A diagonal seam runs from the
//                  underarm up to the neckline; the shoulder triangle belongs to
//                  the SLEEVE. Drawn as a raglan seam line on the front/back +
//                  a raglan sleeve whose upper edges are trued 1:1 to the bodice
//                  raglan arcs (Aldrich/Armstrong raglan construction).
//
// Honest limits (drawn as such, never silently wrong): a halter has no shoulder
// seam to move, so both styles are skipped on it; a saddle/epaulette raglan and
// a halter-raglan hybrid are NOT drawn.
#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {
namespace ShoulderBlock {

// ---- Dropped shoulder (applied to the bodice scalars, gated on Dropped) ----
// How far the shoulder tip slides out along the shoulder line, as a share of the
// half-shoulder. A relaxed dropped shoulder extends ~1/4 of the half shoulder
// past the natural point (a couture "soft drop"; an oversized tee drops more,
// but this stays sewable and true).
inline constexpr double dropExtendShare = 0.28;
// How far the underarm point drops, as a share of the (torso) armhole depth.
// The armhole lowers with the shoulder so the whole scye grows evenly.
inline constexpr double dropArmholeShare = 0.22;
// How far the underarm point moves OUTWARD (widens the chest at the scye), as a
// share of the drop. A dropped armhole is both lower and a touch wider.
inline constexpr double dropWidenShare = 0.55;

// ---- Raglan (applied as a post-pass on the finished draft) ----
// Where the raglan seam meets the neckline, as a share of the neck-point to
// shoulder-tip run measured from the neck point (0 = at the neck point, 1 = at
// the shoulder tip). A classic raglan hits the neckline a short way out from the
// centre-neck so the seam clears the neck.
inline constexpr double raglanNeckShare = 0.30;

// Reshapes the bodice shoulder + armhole for a DROPPED shoulder, in place, in
// the body frame the bodice builders use. Returns silently for Set (caller
// gates, but this is defensive). shoulderHalf/armholeY/chestWidthFront/Back are
// the scalars the bodice is about to draw with; they are adjusted in place.
void applyDropped(double& shoulderHalf, double& armholeY,
                  double& frontChestWidth, double& backChestWidth,
                  double torsoArmholeDepth);

// Post-pass: turns a finished set-in draft into a RAGLAN draft — draws the
// raglan seam line on the front/back body pieces (the shoulder corner above it
// is cut off and given to the sleeve) and, when a sleeve is present, extends the
// sleeve cap up into a raglan shoulder point whose two upper edges are trued to
// the bodice raglan arcs. Skips honestly (a note, no silent change) when there
// is no shoulder to move (halter) or no set-in sleeve to convert. Returns true
// if it drew the raglan, false if it skipped.
bool applyRaglan(DraftedPattern& pattern, double armholeDepth, double shoulderMM);

} // namespace ShoulderBlock
} // namespace stitchu
