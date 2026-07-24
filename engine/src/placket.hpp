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

// Placket variant (R1.2). None = no placket (the legacy `frontPlacket` bool off);
// Standard = the classic symmetric CF button stand (== frontPlacket true);
// Asymmetric = the CF button stand shifted off center (couture asymmetric front,
// the Jackie gingham). Kept alongside the `frontPlacket` bool so old callers and
// presets keep working: Standard/None mirror the bool, Asymmetric is the new mode.
enum class PlacketStyle { None, Standard, Asymmetric };

namespace PlacketBlock {

// Aldrich / Armstrong doctrine, buttonDiameter-driven (FORMULAS.md). We do not
// collect a button size, so a couture blouse default (18 mm button) is used and
// documented; the guide's muslin note covers swapping the button.
inline constexpr double buttonDiameter = constants::kButtonDiameterMM; // ASSUMPTION: blouse button (constants.yaml)
inline constexpr double standWidth = constants::kButtonDiameterMM;     // = button diameter, extension past CF
inline constexpr double facingDepth = 40;             // grown-on fold-back facing (35–50 range)
inline constexpr double buttonholeOffset = 3;         // horizontal hole starts 3 mm past CF
inline constexpr double buttonholeLength = 21;        // Ø + thickness + 2 mm ease
inline constexpr double topFromNeck = 20;             // first button below the CF neck edge
inline constexpr double hemClearance = 20;            // last button above the CF bottom edge

// Asymmetric offset (R1.2, Jackie): a couture asymmetric placket carries the
// button line OFF the center front, so the closure sits to one side of the body
// instead of down the middle. This is how far past CF (toward the wearer's left,
// i.e. more negative x on this drafted-right front) the button line is shifted.
inline constexpr double asymOffset = 55;              // button line shift off CF (mm)

// Adds the front button placket to the front center piece: extends the closure
// edge outward by standWidth (grown-on stand + fold-back facing marking), marks
// the fold line, and marks buttons + buttonholes (3 mm past the fold, at the
// mandatory bust level + evenly spaced). `bustApexY` is the bust level in the
// front piece's local frame (an existing apex notch is used when present, this
// is the fallback). `offsetMM` shifts the whole closure OFF the center front for
// an ASYMMETRIC placket (0 = the classic symmetric CF placket, byte-identical to
// before). Appends construction steps. Returns false (with an honest guide note)
// when there is no front piece or no room — never fails silently.
bool apply(DraftedPattern& pattern, double bustApexY, double offsetMM = 0.0);

} // namespace PlacketBlock
} // namespace stitchu
