#pragma once
// Button rows (düğme sırası) — vocabulary expansion 2026-07-17.
//
// A row of buttons down a garment front: either a FUNCTIONAL center-front button
// row (a real front-buttoned bodice — the front opens down the CF so a non-stretch
// garment is donnable, with a button stand + a buttonhole side) or a DECORATIVE
// button row (a vertical run of buttons sewn on for looks, no opening). This is
// distinct from PlacketBlock (which grows the CF stand/fold geometry): this block
// draws the actual VERTICAL ROW OF BUTTON CIRCLES + buttonhole ticks on the front
// piece so the sewer can mark and space them, and for the functional row it also
// grows the center-front button stand and notes the CF opening.
//
// It never touches an existing outline UNLESS the functional row grows the CF
// stand (mirroring PlacketBlock's grown-on stand), so with no button row in the
// spec every golden dump stays byte-identical (opt-in, GarmentSpec.buttonRow ==
// ButtonRow::None off by default, exactly like the placket / tie / peplum passes).
//
// SCOPE (honest boundary): a straight VERTICAL row of round buttons down the CF is
// drawn (functional or decorative). A diagonal/asymmetric offset button front is
// the ASYMMETRIC PLACKET (placket.cpp), a double-breasted two-column front and
// covered/toggle/frog closures stay honest (missing.js).
//
// Formulas (Aldrich / Armstrong + couture practice, see FORMULAS.md "Button
// rows"): button diameter d = 18 mm (couture default), spacing s = 90 mm on
// center down the bust-to-hem run, first button anchored at the bust apex level
// so a woven front does not gape. A FUNCTIONAL row grows the CF button stand by
// standWidth = d (= 18 mm) exactly like a placket, with the buttons on the CF
// line and the buttonholes 3 mm out (horizontal-buttonhole convention).
#include "geometry.hpp"

namespace stitchu {

// A button row down the garment front. None = nothing drawn (byte-identical
// default). Functional = a real CF button opening (grown stand + buttons +
// buttonholes, the front opens for donning). Decorative = a vertical run of
// buttons sewn on for looks, no opening drawn (the tube still needs its zip).
enum class ButtonRow { None, Functional, Decorative };

namespace ButtonRowBlock {

inline constexpr double buttonDia = constants::kButtonDiameterMM; // button diameter (constants.yaml)
inline constexpr double spacing = 90;      // on-center vertical spacing (mm)
inline constexpr double standWidth = constants::kButtonDiameterMM; // CF button stand width (= button dia)

// Appends the button-row markings (a vertical row of button circles + buttonhole
// ticks) to the front center piece, and — for a Functional row — grows the CF
// button stand so the front opens for donning + adds a guide step. Does nothing
// for ButtonRow::None. Returns false (with an honest guide note) when there is no
// front body piece to carry the row — never fails silently.
bool apply(DraftedPattern& pattern, ButtonRow row);

} // namespace ButtonRowBlock
} // namespace stitchu
