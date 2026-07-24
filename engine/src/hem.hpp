#pragma once
// Hem shape (etek ucu / alt kenar şekli) — opt-in loop patch 3.15.
//
// Reshapes the LOWER-edge line of the fitted skirt / dress-skirt / top pieces.
// It does NOT add a piece: it lifts the SIDE hem up (or drops the BACK hem down)
// along a smooth curve while the CENTER hem and the waist stay put, so the finished
// garment reads as a shirt-tail or a high-low hem instead of a level hem.
//
//   Straight  = the level hem the engine already draws (byte-identical default).
//   Shirttail = center front + center back stay long; the sides curve UP by a soft
//               rise (a gentle shirt-tail / cowboy-shirt hem). Symmetric front↔back.
//   HighLow   = the FRONT hem is raised (short) and the BACK hem is dropped (long),
//               a dramatic high-low. The side hems blend between the two.
//   PointedV  = a corset / basque point: the CENTER hem (center front + center back)
//               DROPS to a point while the sides stay level — the classic
//               corset-bottom V. Symmetric front↔back; the two halves meet cleanly
//               at the CF/CB on-fold line (the point trues). Only a fitted
//               (princess/dart) bodice-to-waist or a top hosts a point.
//   BoxPleatHem = an inverted box pleat RELEASED at the center of the hem for a
//               kick / flare — reuses the box-pleat underlay primitive
//               (boxpleat.cpp): the center-front panel is cut WIDER at the CF fold
//               by an underlay folded behind, so the finished (pressed) width trues
//               back to the original. v1 releases the pleat down the whole CF fold
//               of a fitted straight/A-line skirt (or a top center panel) — it
//               reads as a hem kick pleat. Host: a straight/A-line skirt or a top.
//
// It reshapes only the hem band (the lowest edge of each qualifying piece); the
// waist edge, the side-seam LENGTH balance and the center hem are left trued. The
// side-seam stays balanced because the rise applied to the front side hem equals
// the rise applied to the back side hem (both lift by the SAME sideRise at the
// side edge), so a front and its matching back still meet edge-to-edge when sewn.
//
// HONEST LIMIT (scope): only a soft symmetric shirttail curve and a front-short/
// back-long high-low are drawn. An asymmetric-diagonal hem, a handkerchief / pointed
// hem (the peplum block's pointed variant covers the flare case) and a mullet hem on
// a gathered/pleated/circle skirt are DIFFERENT constructions that stay in the
// honesty layer (missing.js), NOT here — a fitted straight/A-line lower edge is the
// only host. See FORMULAS.md "Hem shape".
#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {

// Hem lower-edge shape. Straight = the level default (byte-identical).
// APPEND-only (index == enum value == vocab order): PointedV = corset/basque point
// (center drops to a V), BoxPleatHem = inverted box pleat released at the hem.
enum class HemShape { Straight, Shirttail, HighLow, PointedV, BoxPleatHem };

namespace HemBlock {

// How far the SIDE hem rises above the center hem (mm) for a shirttail, and the
// front-rise / back-drop for a high-low. Chosen from ready-to-wear practice: a
// soft shirttail lifts ~120 mm at the side; a dramatic high-low lifts the front
// ~220 mm and drops the back ~120 mm below the drafted length.
inline constexpr double shirttailSideRise = 120;
inline constexpr double highLowFrontRise  = 220;
inline constexpr double highLowBackDrop   = 120;
// PointedV: how far the CENTER hem (CF/CB) drops below the level side hem, in mm.
// A sensible basque / corset-point depth (ready-to-wear basque points run ~60-90 mm
// below the side line); 75 mm sits mid-range so the V reads without over-dipping.
// The side hem stays level and the center dips by this depth (adaptive-scaled by
// the same shortest-host cap as the other shapes so it never eats the side seam).
inline constexpr double pointedVCenterDrop = 75;
// A host shorter than this (a cropped top) has no real hem to curve — reshaping it
// would eat the side seam and let the front/back seam curves diverge. Refuse it
// honestly (guide note) rather than draw an unbalanced hem. Mini skirts (~460 mm)
// and hip/tunic tops (~470 mm) clear it; a cropped top (~280 mm) does not.
inline constexpr double minHostLength = 380;

// Reshapes the hem of the fitted skirt/dress-skirt/top pieces. Does nothing for
// HemShape::Straight (byte-identical). Returns false (with an honest guide note)
// when there is no fitted lower edge to reshape — never fails silently. Gated at
// the garment level to a straight/A-line skirt/dress or a top; a
// gathered/pleated/half-circle panel is refused honestly.
bool apply(DraftedPattern& pattern, HemShape shape);

} // namespace HemBlock
} // namespace stitchu
