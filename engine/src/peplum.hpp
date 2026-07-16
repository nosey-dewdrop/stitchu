#pragma once
// Peplum (bele takılan volan / flared waist flounce) — RAY 1 loop R1.1.
//
// A peplum is a flared panel gathered onto NOTHING — it is cut as a flat
// circular (or part-circular) segment whose INNER arc equals the finished waist
// and whose OUTER arc is longer, so it flares out and ripples below the waist
// seam without being gathered. It is the same construction as a circle skirt,
// scaled down and attached at the waist of a bodice/top (Aldrich Metric Pattern
// Cutting "circular flare" + Armstrong "circular peplum": inner radius r0 set so
// the inner arc = finished waist, outer radius r0 + depth). This block adds that
// peplum PIECE (its own cut outline: a flat annular sector with an inner waist
// arc trued to the drafted waist edge, an outer hem arc, and a grainline) — it
// never touches an existing outline, so with no peplum in the spec every golden
// dump stays byte-identical (opt-in, GarmentSpec.peplum == PeplumStyle::None off
// by default, exactly like the tie / strap / slit / open-back post-passes).
//
// SCOPE (honest boundary): only the FULL-circle and HALF-circle flared peplum
// are drawn (level even hem, or a pointed/handkerchief hem = the full-circle cut
// worn on point). A pleated / gathered / draped / asymmetric-tiered peplum is a
// DIFFERENT construction that stays in the honesty layer (missing.js), NOT here.
//
// Formulas (see FORMULAS.md "Peplum"): finished waist W (the drafted waist arc,
// front + back, both halves) and depth D. Inner radius r0 = W / (k · 2π) where
// k = 1 for a full circle (waist all the way round) and k = 0.5 for a half
// circle (the peplum is cut in two on-fold pieces spanning π each). Inner arc
// (per drawn piece) is trued to the drafted waist so it drifts by 0.00 mm; the
// outer arc = (r0 + D) · (same swept angle). The pointed hem uses the full-circle
// cut, its swept angle unchanged, so the corners fall on the true bias.
#include "geometry.hpp"

namespace stitchu {

// Peplum treatment. None = no peplum piece drawn (byte-identical default);
// Full  = full-circle flared peplum (even level hem, maximum flare);
// Half  = half-circle flared peplum (softer flare, two on-fold pieces);
// Pointed = full-circle cut worn to points (handkerchief / pointed hem).
enum class PeplumStyle { None, Full, Half, Pointed };

namespace PeplumBlock {

inline constexpr double SA = 15;          // 15 mm seam allowance per edge
inline constexpr double depth = 180;      // peplum drop below the waist (mm)
inline constexpr double minWaist = 500;   // shortest sensible finished waist arc
inline constexpr double maxWaist = 1400;  // ceiling (very large waist)

// Appends the peplum piece(s) (a flat circular/part-circular flare whose inner
// arc is trued to the finished waist `waistMM`) + a guide step. Does nothing for
// PeplumStyle::None. Returns false (with an honest guide note) when there is no
// waisted bodice/top to carry it — never fails silently. waistMM is the finished
// (measured) waist the inner arc is trued to, passed from the drafter exactly
// like the tie block's sash length.
bool apply(DraftedPattern& pattern, PeplumStyle style, double waistMM);

} // namespace PeplumBlock
} // namespace stitchu
