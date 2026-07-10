#pragma once
// Set-in sleeve block, cap fitted by bisection to the armhole. See FORMULAS.md.
#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {
namespace SleeveBlock {

inline constexpr double bicepsRatio = 0.30;  // ASSUMPTION (anthropometric)
inline constexpr double bicepsEase = 0.15;   // verified Brian default
inline constexpr double capEase = 0.04;      // classic 3-5% cap ease for setting in
inline constexpr double convergenceTolerance = 0.5;

// Returns the sleeve pieces (sleeve + cuff for balloon); empty for sleeveless.
std::vector<PatternPiece> draft(
    const BodyMeasurementsSnapshot& m,
    SleeveStyle style,
    SleeveLength length,
    double armholeLength,
    double armholeDepth);

} // namespace SleeveBlock
} // namespace stitchu
