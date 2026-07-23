#pragma once
// Cup seam (kup dikişi) — the Corset Bustier construction (Buğra Buttoned Corset
// Bustier, patterns_real/BUGRA-DEFTER.md). This is the engine's highest-impact
// missing capability: a forensic comparison of a purchased professional pattern
// vs the motor proved the motor gives the bust curve through a VERTICAL princess
// panel, while the professional pattern gives it through a HORIZONTAL cup seam
// (an Upper Cup + a Lower Cup) at the bust apex. That horizontal seam is what
// makes a strapless/sweetheart bodice cup the bust and stand up without straps.
//
// This block splits an already-drafted princess FRONT panel into pieces along
// HORIZONTAL seams, matching the real Buğra Corset Bustier front, which has THREE
// horizontal bands per princess panel:
//   * Upper Cup   = the panel region ABOVE the apex line (the sweetheart top edge
//                   down to the cup seam);
//   * Lower Cup   = the short under-bust band from the cup seam DOWN TO THE WAIST;
//   * Front Body  = the panel region BELOW the waist seam (waist down to the hem).
// It acts on the drawn geometry: the cup-seam y is READ from the panel's own bust-
// apex match notch (the notch makePrincessPieces stamps at the apex), and the
// waist-seam y is READ from the drafted natural-waist level (passed in as a
// measured offset below that apex — waistBelowApex — so BOTH seams are measured,
// never a hardcoded mm). The two NEW cut edges at each seam are the SAME
// horizontal line by construction, so they are length-matched to <0.5 mm and sew
// together; a matching notch is stamped at each end of every seam so the sewer
// pairs them. When the panel does NOT extend below the waist (a bodice-length
// dress front, or a cropped top, whose lower edge IS the waist), the waist cut
// finds no fabric below it and is honestly skipped — that panel stays a two-piece
// Upper Cup + Lower Cup, exactly as before.
//
// It is an OPT-IN post-pass exactly like peplum / pocket / strap / collar / tie /
// slit / open-back: GarmentSpec.cupSeam == CupSeam::None off by default, and with
// it off the drafted pattern is BYTE-IDENTICAL (the golden dump is unchanged).
//
// HOST (honest boundary): it only acts on a PRINCESS-seamed FRONT whose top edge
// is a strapless / sweetheart class (the Corset Bustier). If the host is not that
// — a skirt, a dart-shaped bodice, a crew/high-necked princess top — it does
// NOTHING and leaves a documented honest guide note (never a silent no-op), just
// like every other block refuses a non-matching host. A moulded/foam bra cup, a
// spiral-boned full corset, and gored/multi-panel cup seams are DIFFERENT
// constructions that stay in the honesty layer (missing.js), not faked here.
#include "geometry.hpp"

namespace stitchu {

// Neckline / SleeveStyle / SleeveCap live in measurements.hpp; forward-declare so
// this header stays light (the .cpp includes measurements.hpp for the full defs).
enum class Neckline;
enum class SleeveStyle;
enum class SleeveCap;

// Cup-seam treatment. None = no cup seam (byte-identical default);
// Horizontal = split each princess front panel into Upper Cup + Lower Cup at the
// bust apex (the classic bustier cup seam).
enum class CupSeam { None, Horizontal };

namespace CupSeamBlock {

inline constexpr double SA = constants::kSeamAllowanceMM; // seam allowance per edge (constants.yaml)

// The strapless-bustier CLASS the cup seam belongs to (encoded once, here, so the
// gate is a named construction rule — not an ad-hoc neckline list). A horizontal
// cup seam is a STRAPLESS-SUPPORT construction: it cups the bust and lets the
// bodice stand up WITHOUT shoulder support. So the host must be BOTH:
//   (1) STRAPLESS = no shoulder-supported sleeve. Sleeveless qualifies; a cap
//       sleeve qualifies (a cap is a decorative wing off the armhole, it carries
//       no weight — the front is still cup-supported). A real set-in / straight /
//       balloon sleeve is a shoulder-carried bodice and is NOT the bustier class.
//   (2) a bustier TOP EDGE = a neckline that sits ABOVE the bust apex so there is
//       a real Upper Cup to split. Sweetheart, square (straight), scoop and HALTER
//       all do; each keeps its own top-edge shape through the split (the cup seam
//       is a HORIZONTAL cut at the apex and never reshapes the neckline above it).
//       A halter is a strapless-support garment — the neck band replaces the
//       straps, the shoulders are bare, and the bust is held by the cups — so it
//       belongs to the class (a halter WITH a real sleeve is a contradiction and
//       still fails (1)). A neckline that plunges BELOW the apex (v-neck / cowl)
//       leaves no upper cup and is excluded; a crew / boat / high neck is a
//       shoulder-supported bodice shape, not a strapless bustier, and is excluded.
// Returns true only when BOTH hold. `cap` is whether the (only) sleeve is a cap
// sleeve; when true it counts as strapless even though sleeveStyle != None.
bool isStraplessBustierClass(Neckline neckline, SleeveStyle sleeve, bool cap);

// Applies the cup seam. Does nothing for CupSeam::None. Returns false (with an
// honest guide note) when the draft is not the strapless-bustier class or has no
// matching princess FRONT host — never fails silently. `neckline`/`sleeve`/`cap`
// describe the drafted top edge so the block can confirm the strapless-bustier
// class (see isStraplessBustierClass), passed from the drafter like the other
// blocks pass their trued scalars. `waistBelowApex` is the measured vertical
// distance from the bust apex down to the natural-waist level (drafted natural-
// waist Y minus the drafted apex Y — a frame-invariant offset that survives each
// piece's local rebase, since a piece's apex notch and its waist sit in the same
// frame). It drives the SECOND (waist) cut that separates the short Lower Cup from
// the Front Body below the waist. If <= 0, or if a panel does not reach past the
// waist, the waist cut is honestly skipped and that panel stays Upper + Lower cup.
bool apply(DraftedPattern& pattern, CupSeam style, Neckline neckline,
           SleeveStyle sleeve, bool cap, double waistBelowApex);

} // namespace CupSeamBlock
} // namespace stitchu
