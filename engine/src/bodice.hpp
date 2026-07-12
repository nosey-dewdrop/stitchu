#pragma once
// Parametric bodice block (FreeSewing Bella + Muller & Sohn). See FORMULAS.md.
#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {

struct BodiceDraft {
    // Dart mode: back + front only. Princess mode: back/front are the CENTER
    // panels and backSide/frontSide carry the side panels (princess = true).
    PatternPiece back;
    PatternPiece front;
    PatternPiece backSide;
    PatternPiece frontSide;
    bool frontPrincess = false; // a half with near-zero intake stays unsplit
    bool backPrincess = false;
    // Princess seam lengths (split point -> apex -> waist leg) per panel edge;
    // the two edges of one seam must match to be sewable.
    double frontSeamCenterLen = 0;
    double frontSeamSideLen = 0;
    double backSeamCenterLen = 0;
    double backSeamSideLen = 0;
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

// Princess split: where the seam leaves the armhole, as a share of the
// armhole depth below the shoulder tip (kept above the bust apex).
inline constexpr double princessArmholeShare = 0.38;
inline constexpr double princessApexClearance = 30; // split at least this far above apex

BodiceDraft draft(const BodyMeasurementsSnapshot& m, Neckline neckline = Neckline::Crew,
                  Shaping shaping = Shaping::Princess);

} // namespace BodiceBlock

} // namespace stitchu
