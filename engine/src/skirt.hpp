#pragma once
// Parametric skirt block (FreeSewing Titan philosophy). See FORMULAS.md.
#include <optional>

#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {
namespace SkirtBlock {

inline constexpr double waistEase = 0.02;
inline constexpr double hipEase = 0.02;
inline constexpr double hipDepth = 200;      // waist-to-hip drafting depth
inline constexpr double maxSideTake = 25;    // per quarter
inline constexpr double minDartWidth = 8;    // below this the dart folds into the side seam
inline constexpr double gatherRatio = 1.9;

DraftedPattern draft(const BodyMeasurementsSnapshot& m, SkirtStyle style, SkirtLength length);

// Skirt pieces alone, reusable by the dress block (waistband optional).
// The dress block passes the bodice's measured sewn waist as targetWaistMM so
// the skirt waist seam matches the seam it attaches to.
std::vector<PatternPiece> pieces(
    const BodyMeasurementsSnapshot& m,
    SkirtStyle style,
    SkirtLength length,
    bool includeWaistband,
    std::optional<double> targetWaistMM = std::nullopt);

PatternPiece waistbandPiece(double waistMM);

// Rough estimate for 140cm-wide fabric, 10% cutting margin.
double fabricEstimate(const BodyMeasurementsSnapshot& m, SkirtStyle style, SkirtLength length);

std::vector<std::string> guide(SkirtStyle style);

} // namespace SkirtBlock
} // namespace stitchu
