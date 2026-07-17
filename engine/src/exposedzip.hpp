#pragma once
// Exposed / visible zipper (görünür fermuar) — vocabulary expansion 2026-07-17.
//
// Distinct from the INVISIBLE center-back zipper the dress always carries
// (garment.cpp annotateTechnical draws that hidden zip). An EXPOSED zipper is a
// DESIGN feature: the zip is visible on the outside as a teeth line down the
// center front or center back, topstitched flat (an athletic / utility / couture
// look). It is drawn as a zipper teeth glyph on the piece with the correct
// exposed-zip seam allowance (an exposed zip is set into a slot/faced opening,
// NOT folded under like an invisible zip, so it needs a narrower, marked stitch
// line rather than the standard 15 mm turned allowance).
//
// It only ADDS a teeth glyph + a closure tag + a guide step to a body piece and
// opens the seam for donning — it never touches the outline, so with no exposed
// zip in the spec every golden dump stays byte-identical (opt-in,
// GarmentSpec.exposedZip == ExposedZip::None off by default).
//
// SCOPE (honest boundary): a straight center-front or center-back exposed zip is
// drawn. A separating/two-way/diagonal/pocket zip stays honest (missing.js).
//
// Formulas (see FORMULAS.md "Exposed zipper"): the exposed zip is set into the
// CF/CB seam; the teeth glyph is drawn on the seam edge and the piece is cut to
// open there (cut 2, not on fold). The seam allowance at an exposed zip is 10 mm
// (the fabric is turned back and topstitched flat over the tape, not the 15 mm an
// invisible zip hides).
#include "geometry.hpp"

namespace stitchu {

// Placement of a visible/exposed zipper. None = nothing drawn (byte-identical
// default). CenterFront = an exposed zip down the CF (opens the front for
// donning). CenterBack = an exposed zip down the CB (replaces the hidden zip
// glyph with a visible one; still opens the back for donning).
enum class ExposedZip { None, CenterFront, CenterBack };

namespace ExposedZipBlock {

inline constexpr double seamAllowance = 10; // exposed-zip SA (mm), narrower than 15

// Draws the exposed zipper teeth glyph on the CF or CB body piece(s), tags the
// closure, opens the seam for donning (cut 2, not on fold), and adds a guide
// step. Does nothing for ExposedZip::None. Returns false (with an honest guide
// note) when there is no matching body piece — never fails silently.
bool apply(DraftedPattern& pattern, ExposedZip placement);

} // namespace ExposedZipBlock
} // namespace stitchu
