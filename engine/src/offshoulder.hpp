#pragma once
// Off-shoulder / bardot neckline (omuz açık / bardot yaka) — vocabulary
// expansion 2026-07-17 (Damla wants to sew a pink gingham off-shoulder dress).
//
// A REAL off-shoulder / bardot neckline: the bodice top edge DROPS below the
// shoulder line so the shoulders are bare, and the wide top edge is gathered onto
// an elastic casing (a "bardot" frill often sits above it). This block reshapes
// the front AND back top edge of a bodiced garment down to a straight band below
// the shoulder point, marks the elastic casing at that top edge, adds the casing
// elastic as a cut length, and optionally adds a bardot ruffle FLOUNCE piece
// trued to the new (dropped) top edge.
//
// It reshapes the top edge (so it is NOT byte-identical when ON), but only ever
// runs on an OFF-SHOULDER draft, which the golden set never exercises — with
// bardot OFF (BardotStyle::None) every existing outline and golden dump stays
// byte-identical, exactly like the other opt-in post-passes.
//
// WEARABILITY: an off-shoulder must still be donnable. The dropped elastic top
// edge is wide + gathered onto elastic, so it stretches over the shoulders/head;
// the garment is donnable through the elastic neck (hasDonningOpening treats a
// bardot elastic top like a stretch opening). The engine keeps the dress CB
// zipper too (belt-and-suspenders) unless the bodice is knit.
//
// SCOPE (honest boundary): a straight elastic-cased off-shoulder band across the
// front + back (optionally with a bardot ruffle) is drawn. A one-shoulder
// asymmetric bardot, a boned strapless, and a structured off-shoulder with
// separate sleeves stay honest (missing.js).
//
// Formulas (see FORMULAS.md "Off-shoulder / bardot"): drop the top edge by
// dropMM = 55 mm below the shoulder point so the shoulders are bare; the top edge
// runs straight from CF to the armhole point at that dropped level. Elastic
// casing = a channel folded at the top edge; elastic cut = ~0.85 × the bare
// chest/back width so it holds. Optional bardot ruffle = a strip topW·fullness
// long × frillDepth, gathered to the dropped top edge.
#include "geometry.hpp"

namespace stitchu {

// Bardot / off-shoulder treatment. None = nothing changed (byte-identical
// default). Plain = the dropped elastic-cased off-shoulder band. Frill = the same
// band with a bardot ruffle flounce above it.
enum class BardotStyle { None, Plain, Frill };

namespace OffShoulderBlock {

inline constexpr double dropMM = 55;       // top edge drop below the shoulder point
inline constexpr double SA = 15;           // seam allowance (mm)
inline constexpr double casingDepth = 22;  // elastic casing channel depth (mm)
inline constexpr double frillDepth = 90;   // bardot frill drop (mm)
inline constexpr double frillFullness = 2.0; // frill gather ratio

// Reshapes the front + back top edge down to a straight bardot band below the
// shoulder, marks the elastic casing, and (Frill) adds a bardot ruffle piece
// trued to the dropped top edge, plus guide steps. Does nothing for
// BardotStyle::None. Returns false (with an honest guide note) when there is no
// bodiced front+back to reshape — never fails silently.
bool apply(DraftedPattern& pattern, BardotStyle style);

} // namespace OffShoulderBlock
} // namespace stitchu
