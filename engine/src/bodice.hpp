#pragma once
// Parametric bodice block (FreeSewing Bella + Muller & Sohn). See FORMULAS.md.
#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {

struct BodiceDraft {
    PatternPiece back;
    PatternPiece front;
    double backWaistHalf = 0;
    double frontWaistHalf = 0;
    double frontLength = 0;
    double backLength = 0;
    double armholeLength = 0;   // one arm, front half + back half, sewing line
    double armholeDepth = 0;
    double sideWaistY = 0;      // shared side waist basis (= backLength)
    // Audit values consumed by the validator.
    double frontSideSeam = 0;
    double backSideSeam = 0;
    double frontSewnWaist = 0;  // along drafted curve, dart intake excluded
    double backSewnWaist = 0;
    double frontStraightWaist = 0;
    double backStraightWaist = 0;
    double frontChestWidth = 0;
    double backChestWidth = 0;
};

namespace BodiceBlock {

inline constexpr double chestEase = 0.11;
inline constexpr double waistEase = 0.05;
inline constexpr double armholeDepthFactor = 0.44;
inline constexpr double backNeckWidthFactor = 0.197;
inline constexpr double frontNeckWidthFactor = 0.17;
inline constexpr double backNeckCutoutFactor = 0.06;
inline constexpr double centerBackReduction = 0.35;
inline constexpr double underbustOffset = 70;      // ASSUMPTION: B/C cup
inline constexpr double shoulderDropFactor = 0.23; // ASSUMPTION: ~13 deg
inline constexpr double frontBalanceDrop = 40;     // M&S front balance
inline constexpr double backWaistShare = 0.48;     // ASSUMPTION
inline constexpr double maxNeckShoulderShare = 0.72;

BodiceDraft draft(const BodyMeasurementsSnapshot& m, Neckline neckline = Neckline::Crew);

} // namespace BodiceBlock

} // namespace stitchu
