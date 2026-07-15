#pragma once
// Front button placket (düğme patı) — a grown-on button stand extending the
// center-front edge outward, with a fold line at CF, buttons marked ON the CF
// line, and buttonholes offset 3 mm past CF into the stand. Womenswear laps
// RIGHT over LEFT (this front is drafted as the buttonhole side; the mirror
// image is the button underlap). Opt-in (GarmentSpec.frontPlacket); off by
// default so existing drafts are byte-identical. See FORMULAS.md "Front button
// placket".
//
// Post-pass like the keyhole (KeyholeBlock::apply): runs on the FINISHED
// front-center piece, so BodiceBlock and every golden dump are untouched when
// the placket is off. Unlike the keyhole this one DOES move the outline (it
// grows the CF edge outward) — that only ever happens on a closure-ON draft,
// which the golden set never exercises.
#include "geometry.hpp"

namespace stitchu {
namespace PlacketBlock {

// Aldrich / Armstrong doctrine, buttonDiameter-driven (FORMULAS.md). We do not
// collect a button size, so a couture blouse default (18 mm button) is used and
// documented; the guide's muslin note covers swapping the button.
inline constexpr double buttonDiameter = 18;          // ASSUMPTION: blouse button
inline constexpr double standWidth = 18;              // = button diameter, extension past CF
inline constexpr double facingDepth = 40;             // grown-on fold-back facing (35–50 range)
inline constexpr double buttonholeOffset = 3;         // horizontal hole starts 3 mm past CF
inline constexpr double buttonholeLength = 21;        // Ø + thickness + 2 mm ease
inline constexpr double topFromNeck = 20;             // first button below the CF neck edge
inline constexpr double hemClearance = 20;            // last button above the CF bottom edge

// Adds the front button placket to the front center piece: extends the CF edge
// outward by standWidth (grown-on stand + fold-back facing marking), marks the
// fold line at CF, and marks buttons (on CF) + buttonholes (3 mm past CF, at the
// mandatory bust level + evenly spaced). `bustApexY` is the bust level in the
// front piece's local frame (an existing apex notch is used when present, this
// is the fallback). Appends construction steps. Returns false (with an honest
// guide note) when there is no front piece or no room — never fails silently.
bool apply(DraftedPattern& pattern, double bustApexY);

} // namespace PlacketBlock
} // namespace stitchu
