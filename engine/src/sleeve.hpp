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

// Returns the sleeve pieces (sleeve + cuff for balloon); empty for sleeveless.
std::vector<PatternPiece> draft(
    const BodyMeasurementsSnapshot& m,
    SleeveStyle style,
    SleeveLength length,
    double armholeLength,
    double armholeDepth,
    Fabric fabric = Fabric::Woven);

} // namespace SleeveBlock
} // namespace stitchu
