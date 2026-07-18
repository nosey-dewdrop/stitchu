#pragma once
// Pockets (cep) — patch 3.12 (BENCHMARK-58 data ray; side pocket freq 14 +
// patch pocket freq 13 = the highest drawable cluster the market compass and the
// 60s/70s collection both flagged).
//
// TWO honest pocket constructions are drawn, both as opt-in post-passes that
// leave every existing outline byte-identical when off (PocketStyle::None):
//
//  PATCH (yama cep): a SEPARATE flat pocket piece sewn onto the OUTSIDE of a body
//    panel. Rectangular with square, rounded, or pointed lower corners; the top
//    edge is a folded self-hem (a fold line marked above the pocket mouth). A
//    placement mark (an L-bracket of two tick runs) is stamped on the body front
//    so the sewer knows where to sit it. Its size is scaled to the garment (a
//    fraction of the front panel width) and TRUED to that measured width so it
//    grows with the body — never a bare scalar. The most common, lowest risk.
//
//  SIDE-SEAM (yan dikiş cebi / in-seam): a hidden bag set into the side seam.
//    Two pocket-bag pieces (front-bag + back-bag halves, cut as one mirrored
//    piece cut 2 pairs) join at their curved edge to make a pouch; the straight
//    edge sews into the side seam. A mouth-opening mark (the two tick points that
//    bracket the hand opening) is stamped on the body side seam. The bag depth is
//    MEASURED from the drafted side-seam length (Aldrich/Armstrong in-seam bag),
//    so it drifts by 0.00 mm from the seam it lives on.
//
// HONEST BOUNDARY (drawn on purpose, NOT here): welt / besom / bound pockets,
// cargo / flap pockets, and kangaroo pouches are DIFFERENT constructions that
// stay in the honesty layer (missing.js), never silently faked here.
#include "geometry.hpp"

namespace stitchu {

// Pocket treatment. None = no pocket drawn (byte-identical default);
// Patch    = a separate patch pocket piece + a placement mark on the body;
// SideSeam = two in-seam pocket-bag pieces + a mouth-opening mark on the seam.
enum class PocketStyle { None, Patch, SideSeam };

// Lower-corner shape of a patch pocket. Kept internal (the vision reads "patch
// pocket"; corner style follows the garment): a hip patch reads rounded, a chest
// or utility patch reads square, a Western yoke patch reads pointed.
enum class PatchCorner { Rounded, Square, Pointed };

namespace PocketBlock {

inline constexpr double SA = constants::kSeamAllowanceMM; // seam allowance per edge (constants.yaml)

// --- Patch pocket geometry (proportional to the garment) --------------------
inline constexpr double patchWidthFrac = 0.55;  // pocket width = 0.55 × front-panel width
inline constexpr double patchAspect = 1.12;     // height = 1.12 × width (a touch taller than wide)
inline constexpr double patchMinW = 110;        // clamp: no smaller than a child's hand
inline constexpr double patchMaxW = 210;        // clamp: no bigger than a large cargo patch
inline constexpr double patchHemDepth = 35;     // folded self-hem depth at the mouth
inline constexpr double patchCornerR = 28;      // rounded-corner radius

// --- Side-seam pocket geometry (Aldrich/Armstrong in-seam bag) --------------
inline constexpr double mouthOpening = 155;     // hand-opening length up the side seam
inline constexpr double bagWidth = 165;         // how far the bag reaches toward CF
inline constexpr double bagBelowMouth = 175;    // bag depth below the opening bottom
inline constexpr double mouthBelowWaist = 70;   // opening starts this far below the waist edge
inline constexpr double minSeamForBag = 320;    // shortest side seam that can host a bag

// Appends the pocket piece(s) + a placement/mouth mark + a guide step. Does
// nothing for PocketStyle::None. Returns false (with an honest guide note) when
// the draft has no panel to host the pocket — never fails silently. `frontWidthMM`
// is the drafted front-panel width the patch is trued to (passed from the drafter
// like the tie sash / peplum waist); it is ignored for the side-seam bag, which
// measures its own host seam.
bool apply(DraftedPattern& pattern, PocketStyle style, double frontWidthMM);

} // namespace PocketBlock
} // namespace stitchu
