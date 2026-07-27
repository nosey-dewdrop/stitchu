#pragma once
// Bugra Locket Top construction (patterns_real/BUGRA-DEFTER.md, the SECOND
// purchased pattern; BASAR-IKI-KALIP.md locket items 1-5). A forensic overlay
// of the purchased size-36 vector pieces vs the motor proved four structural
// gaps in the motor's "puff-sleeve blouse":
//   1. TWO-PIECE SLEEVE: Bugra cuts the puff sleeve HORIZONTALLY into an Upper
//      Sleeve (the gathered crown band, ruffled edge) + a Lower Sleeve; the
//      motor drew one Puff Sleeve piece.
//   2. WAIST LENGTH + CUT-OPEN SIDE DART: the Locket front is a waist-length
//      fitted front whose bust shaping is a BIG side dart CUT OPEN at the side
//      seam (a wedge), transferred from the waist dart; the motor drew a
//      hip-length boxy front with a folded waist dart.
//   3. BACK ON FOLD: the Locket back is ONE piece cut on the fold with a waist
//      dart; the motor cut 2 with a CB seam.
//   4. COLLAR + SEPARATE LINING: deep U-crescent collar + a SEPARATE smaller
//      Collar Lining (drawn by CollarBlock's Crescent variant); the Locket has
//      NO neck facings — this pass consumes them.
//
// OPT-IN post-pass exactly like the Bugra corset (cupseam.hpp): GarmentSpec.
// locketTop == LocketTop::None off by default, and with it off the drafted
// pattern is BYTE-IDENTICAL (the golden dump is unchanged).
//
// HOST (honest boundary): only the exact Locket host class is rebuilt — a
// WAIST-length (cropped) DART-shaped TOP with a SHORT set-in PUFFED sleeve, a
// buttoned CF opening (grown placket) and the CRESCENT collar. Anything else
// (princess, hip length, sleeveless, halter, no CF opening, another collar) is
// refused with a named honest guide note — never a silent no-op.
#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {

// Locket construction. None = off (byte-identical default); Bugra = the full
// six-piece Locket Top measured off the purchased pattern's size-36 rings.
enum class LocketTop { None, Bugra };

namespace LocketBlock {

// Bugra Locket style lines — every proportion MEASURED off the purchased Locket
// Top's size-36 vector geometry (patterns_real/geometry/geometry-full.json),
// expressed against the draft's own measured spans (fitted cap width/height,
// armhole) so the construction scales with the body. Flat mm values are style
// constants of the garment (like a hem depth), not body proportions.
namespace bugra {
// The Locket side seam sits toward the BACK: size-36 front half ≈ 271 mm sewn
// (incl the 18 mm stand) vs back half ≈ 193 mm — an uneven split the motor's
// even bust/4 halves miss by ~12 mm a side. Applied at chest AND waist so the
// total girth and suppression are unchanged (bodice.hpp sideSeamShiftMM).
inline constexpr double sideSeamShiftMM = 12;
// Upper Sleeve (the gathered crown band; ring 505x207 incl 10 mm SA):
inline constexpr double crownWidthFactor = 1.50; // tip span / fitted cap width (the gather)
inline constexpr double crownDepthShare = 1.00;  // tip drop / fitted cap height
inline constexpr double bandCenterShare = 0.87;  // band lower edge at centre, share of tip drop
inline constexpr double bandSagMM = 45;          // band lower edge sags below the tips near the ends
// Lower Sleeve (ring 326x170 incl SA):
inline constexpr double lowerRiseShare = 0.80;   // top-arc rise at centre, share of cap height
inline constexpr double hemDipMM = 38;           // hem dips below the underarm tips near the ends
inline constexpr double hemCenterRiseMM = 14;    // hem rises above tip level at the centre
} // namespace bugra

// The exact Locket host class, encoded ONCE: a waist-length (cropped) DART top
// with a SHORT set-in STRAIGHT PUFFED sleeve, a buttoned CF opening and the
// CRESCENT collar, not a halter. The base-draft side-seam walk (garment.cpp),
// the validator's reference bodice and the post-pass all gate on THIS, so a
// host the pass refuses is never drafted with a walked seam.
bool isLocketHost(const GarmentSpec& spec);

// Applies the full Locket restructure. Does nothing for LocketTop::None.
// Returns false (with an honest guide note) when the host is not the Locket
// class or a needed drafted piece is missing — never fails silently. Reads the
// armhole frame from pattern.sleeveArmholeLenMM/DepthMM (set by the top block).
bool apply(DraftedPattern& pattern, const GarmentSpec& spec,
           const BodyMeasurementsSnapshot& m);

} // namespace LocketBlock
} // namespace stitchu
