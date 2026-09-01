#pragma once
// Parametric skirt block (FreeSewing Titan philosophy). See FORMULAS.md.
#include <optional>

#include "geometry.hpp"
#include "fabricease.hpp"
#include "measurements.hpp"

namespace stitchu {
namespace SkirtBlock {

inline constexpr double waistEase = 0.02;
inline constexpr double hipEase = 0.02;
inline constexpr double knitEase = 0.01;     // knits stretch over waist and hip
inline constexpr double hipDepth = 200;      // waist-to-hip drafting depth
inline constexpr double maxSideTake = 25;    // per quarter
inline constexpr double minDartWidth = 8;    // below this the dart folds into the side seam
inline constexpr double maxSingleDart = 30;  // wider than this cones the hip -> split into two
inline constexpr double gatherRatio = 1.9;
inline constexpr double pleatRatio = 3.0;    // knife pleats take 3x their sewn width
inline constexpr int    goreCount = 6;       // default number of vertical gore panels
inline constexpr double goreHemFlare = 90;   // extra width per panel edge added at the hem (below hip)
static_assert(FabricBand::easeAt(FabricBand::Girth::WaistSkirt, 0.0) == waistEase, "woven skirt waist anchor drifted");
static_assert(FabricBand::easeAt(FabricBand::Girth::WaistSkirt, FabricBand::kKnitDefaultPct) == knitEase, "knit skirt waist anchor drifted");
static_assert(FabricBand::easeAt(FabricBand::Girth::HipSkirt, 0.0) == hipEase, "woven skirt hip anchor drifted");
static_assert(FabricBand::easeAt(FabricBand::Girth::HipSkirt, FabricBand::kKnitDefaultPct) == knitEase, "knit skirt hip anchor drifted");
inline double waistEaseFor(const FabricAxis& f) { return FabricBand::easeFor(FabricBand::Girth::WaistSkirt, f); }
inline double hipEaseFor(const FabricAxis& f) { return FabricBand::easeFor(FabricBand::Girth::HipSkirt, f); }

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
                     Shaping shaping = Shaping::Princess, FabricAxis fabric = Fabric::Woven,
                     double lengthOverrideMM = 0);

// Skirt pieces alone, reusable by the dress block (waistband optional).
// The dress block passes the bodice's measured sewn waist as targetWaistMM so
// the skirt waist seam matches the seam it attaches to; an empire dress also
// passes lengthExtraMM (the seam sits higher, the skirt runs longer and the
// hip line sits deeper below the seam).
// lengthOverrideMM (foto-oran kablosu): >0 replaces the mini/midi/maxi table
// value with a continuous target length (clamped 250-1200); hip depth stays
// governed by lengthExtraMM alone. 0 = off, byte-identical.
std::vector<PatternPiece> pieces(
    const BodyMeasurementsSnapshot& m,
    SkirtStyle style,
    SkirtLength length,
    bool includeWaistband,
    std::optional<double> targetWaistMM = std::nullopt,
    Shaping shaping = Shaping::Princess,
    FabricAxis fabric = Fabric::Woven,
    double lengthExtraMM = 0,
    const SkirtJoin* join = nullptr,
    double lengthOverrideMM = 0,
    // F5-parca: true = the DRESS block proved no CB zipper is needed and no
    // spec feature needs a distinct back panel, so front+back collapse to ONE
    // identical piece ("Front & Back", cut 2 on fold). Only the simple styles
    // (aLine/straight non-princess, gathered, pleated) honor it; the rest
    // ignore the flag (their panel structure is not a front/back mirror).
    bool merged = false);

PatternPiece waistbandPiece(double waistMM, FabricAxis fabric = Fabric::Woven);

// Rough estimate for 140cm-wide fabric, 10% cutting margin.
double fabricEstimate(const BodyMeasurementsSnapshot& m, SkirtStyle style, SkirtLength length,
                      Shaping shaping = Shaping::Princess, FabricAxis fabric = Fabric::Woven,
                      double lengthExtraMM = 0, double lengthOverrideMM = 0);

// Finished (sewn) hem circumference in mm — the edge a hem ruffle trims.
double hemCircumferenceMM(const BodyMeasurementsSnapshot& m, SkirtStyle style, SkirtLength length,
                          Shaping shaping = Shaping::Princess, FabricAxis fabric = Fabric::Woven,
                          double lengthExtraMM = 0, double lengthOverrideMM = 0);

std::vector<std::string> guide(SkirtStyle style, Shaping shaping = Shaping::Princess,
                               FabricAxis fabric = Fabric::Woven);

} // namespace SkirtBlock
} // namespace stitchu
