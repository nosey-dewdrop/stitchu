#pragma once
// Parametric skirt block (FreeSewing Titan philosophy). See FORMULAS.md.
#include <optional>

#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {
namespace SkirtBlock {

inline constexpr double waistEase = 0.02;
inline constexpr double hipEase = 0.02;
inline constexpr double knitEase = 0.01;     // knits stretch over waist and hip
inline constexpr double hipDepth = 200;      // waist-to-hip drafting depth
inline constexpr double maxSideTake = 25;    // per quarter
inline constexpr double minDartWidth = 8;    // below this the dart folds into the side seam
inline constexpr double gatherRatio = 1.9;
inline constexpr double pleatRatio = 3.0;    // knife pleats take 3x their sewn width
inline double waistEaseFor(Fabric f) { return f == Fabric::Knit ? knitEase : waistEase; }
inline double hipEaseFor(Fabric f) { return f == Fabric::Knit ? knitEase : hipEase; }

// Dress-mode join targets (princess shaping only): each quarter drafts
// against its own bodice half-waist and places the gore seam at the same arc
// as the bodice princess seam, so the two seams MEET at the waist join.
struct SkirtJoin {
    double frontQuarterWaist = 0; // bodice front sewn half-waist, mm
    double backQuarterWaist = 0;
    double frontSeamArc = 0;      // center edge -> princess seam, along the waist
    double backSeamArc = 0;
};

DraftedPattern draft(const BodyMeasurementsSnapshot& m, SkirtStyle style, SkirtLength length,
                     Shaping shaping = Shaping::Princess, Fabric fabric = Fabric::Woven);

// Skirt pieces alone, reusable by the dress block (waistband optional).
// The dress block passes the bodice's measured sewn waist as targetWaistMM so
// the skirt waist seam matches the seam it attaches to; an empire dress also
// passes lengthExtraMM (the seam sits higher, the skirt runs longer and the
// hip line sits deeper below the seam).
std::vector<PatternPiece> pieces(
    const BodyMeasurementsSnapshot& m,
    SkirtStyle style,
    SkirtLength length,
    bool includeWaistband,
    std::optional<double> targetWaistMM = std::nullopt,
    Shaping shaping = Shaping::Princess,
    Fabric fabric = Fabric::Woven,
    double lengthExtraMM = 0,
    const SkirtJoin* join = nullptr);

PatternPiece waistbandPiece(double waistMM, Fabric fabric = Fabric::Woven);

// Rough estimate for 140cm-wide fabric, 10% cutting margin.
double fabricEstimate(const BodyMeasurementsSnapshot& m, SkirtStyle style, SkirtLength length,
                      Shaping shaping = Shaping::Princess, Fabric fabric = Fabric::Woven,
                      double lengthExtraMM = 0);

// Finished (sewn) hem circumference in mm — the edge a hem ruffle trims.
double hemCircumferenceMM(const BodyMeasurementsSnapshot& m, SkirtStyle style, SkirtLength length,
                          Shaping shaping = Shaping::Princess, Fabric fabric = Fabric::Woven,
                          double lengthExtraMM = 0);

std::vector<std::string> guide(SkirtStyle style, Shaping shaping = Shaping::Princess,
                               Fabric fabric = Fabric::Woven);

} // namespace SkirtBlock
} // namespace stitchu
