#pragma once
// Numeric validation of drafted patterns — the runtime safety net AND the
// harness oracle. Port of the Swift PatternValidator, invariant for invariant.
#include <string>
#include <vector>

#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {

struct ValidationIssue {
    std::string rule;
    std::string piece;
    std::string detail;

    std::string description() const { return "[" + rule + "] " + piece + ": " + detail; }
};

namespace PatternValidator {

// Tolerances in mm unless noted.
inline constexpr double pairedSeamTolerance = 3.0;
inline constexpr double princessSeamTolerance = 2.5; // center vs side panel edge of one seam
inline constexpr double waistJoinTolerance = 12.0;   // absorbable by easing while sewing
inline constexpr double dartSumTolerance = 2.0;
inline constexpr double chestWidthTolerance = 1.5;
inline constexpr double capLengthTolerance = 2.5;
inline constexpr double capEaseMin = 0.01;           // sane set-in ease window
inline constexpr double capEaseMax = 0.09;
inline constexpr double kinkAngleDegrees = 25.0;     // max turn per flattened curve step
inline constexpr double maxPieceSpan = 3000.0;       // sanity cap for tiled A4 printing
inline constexpr double markingSlack = 8.0;

std::vector<ValidationIssue> issues(
    const GarmentSpec& spec,
    const BodyMeasurementsSnapshot& m,
    const DraftedPattern& draft);

std::vector<ValidationIssue> geometryIssues(const PatternPiece& piece);

} // namespace PatternValidator
} // namespace stitchu
