#pragma once
// Set-in sleeve block, cap fitted by bisection to the armhole. See FORMULAS.md.
#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {
namespace SleeveBlock {

inline constexpr double bicepsRatio = 0.30;  // ASSUMPTION (anthropometric)
inline constexpr double bicepsEase = 0.15;   // verified Brian default
inline constexpr double capEase = 0.04;      // classic 3-5% cap ease for setting in
inline constexpr double knitBicepsEase = 0.06; // knits stretch around the arm
inline constexpr double knitCapEase = 0.02;    // knits ease in with far less cap
inline constexpr double convergenceTolerance = 0.5;
inline double bicepsEaseFor(Fabric f) { return f == Fabric::Knit ? knitBicepsEase : bicepsEase; }
inline double capEaseFor(Fabric f) { return f == Fabric::Knit ? knitCapEase : capEase; }

// Gathered / puff sleeve HEAD (Loop 6). The classic slash-and-spread adds
// fullness across the crown ONLY (above the notches); the length below the
// notches stays matched 1:1 to the armhole. VERIFIED invariant (dresspatternmaking,
// M.Müller): cap-height RAISE == the total spread for a puff. The gather ratio
// (finished crown arc / original crown arc) is the fullness the spread produces.
//   Gathered (soft, high-street): spread ~0.20*W, cap NOT raised.
//   Puffed  (full, couture gigot): spread ~0.45*W, cap raised by the spread.
inline constexpr double gatheredSpreadFrac = 0.20; // added crown width / cap width
inline constexpr double puffedSpreadFrac   = 0.45;
inline double capSpreadFrac(SleeveCap c) {
    return c == SleeveCap::Puffed ? puffedSpreadFrac
         : c == SleeveCap::Gathered ? gatheredSpreadFrac : 0.0;
}

// Returns the sleeve pieces (sleeve + cuff for balloon); empty for sleeveless.
// `cap` adds a gathered/puff head; Plain keeps the classic set-in cap exactly.
std::vector<PatternPiece> draft(
    const BodyMeasurementsSnapshot& m,
    SleeveStyle style,
    SleeveLength length,
    double armholeLength,
    double armholeDepth,
    Fabric fabric = Fabric::Woven,
    SleeveCap cap = SleeveCap::Plain);

} // namespace SleeveBlock
} // namespace stitchu
