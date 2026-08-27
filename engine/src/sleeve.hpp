#pragma once
// Set-in sleeve block, cap fitted by bisection to the armhole. See FORMULAS.md.
#include "fabricease.hpp"
#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {
namespace SleeveBlock {

inline constexpr double bicepsRatio = constants::kBicepsBustRatio; // ASSUMPTION (constants.yaml: refuted vs Aldrich top arm)
inline constexpr double bicepsEase = 0.15;   // verified Brian default
inline constexpr double capEase = 0.04;      // classic 3-5% cap ease for setting in
inline constexpr double knitBicepsEase = 0.06; // knits stretch around the arm
inline constexpr double knitCapEase = 0.02;    // knits ease in with far less cap
inline constexpr double convergenceTolerance = 0.5;
// Legacy constants above = the stretch-0 and stretch-12.5 anchors of the
// continuous fabric axis (fabricease.hpp); undeclared specs are byte-identical.
static_assert(FabricBand::easeAt(FabricBand::Girth::Biceps, 0.0) == bicepsEase, "woven biceps anchor drifted");
static_assert(FabricBand::easeAt(FabricBand::Girth::Biceps, FabricBand::kKnitDefaultPct) == knitBicepsEase, "knit biceps anchor drifted");
static_assert(FabricBand::easeAt(FabricBand::Girth::SleeveCap, 0.0) == capEase, "woven cap anchor drifted");
static_assert(FabricBand::easeAt(FabricBand::Girth::SleeveCap, FabricBand::kKnitDefaultPct) == knitCapEase, "knit cap anchor drifted");
// ⭐ borç 93 / K68 — THE THREE HIGH-STRETCH CAP ANCHORS WERE UNSEALED, AND F7
// PUT THEM UNDER LOAD. Until F7 the cap axis only drove the sleeve's TARGET cap
// ease and a hard `capEaseMin = 0.01` floor stood behind it; F7's borç-86 fix
// made the floor itself `min(capEaseMin, capEase)`, i.e. the floor now READS
// these anchors. The F7 referee measured the hole (HM-1b): moving kCap's 38%
// anchor 0.00 -> 0.05 rebuilt clean, MOVED the wasm bundle (756783b7 ->
// b3c896a0) and left all SEVEN phase gates green. The woven and stable-knit
// anchors above were already compile-time sealed and that seal is exactly what
// refused the referee's HM-1; the >= 38% band had no equivalent. It does now.
//
// 🚨 NO NUMBER IS INVENTED HERE (§3.10 · CLAUDE.md "patternmaking sayılarını
// tahmin etme"). fabricease.hpp's kCap already ships {38.0, 0.00} {63.0, 0.00}
// {88.0, 0.00}; these lines pin TODAY'S SHIPPED VALUE and nothing else. The
// reading behind the zero is fabric_ease_check's own published band table
// (moderate / stretchy / super): a knit that stretches takes no cap ease,
// because the cap eases itself in. Moving the value stays possible — it just
// stops being possible ACCIDENTALLY.
inline constexpr double highStretchCapEase = 0.00;  // knit >= 38% stretch: the cap eases itself in
static_assert(FabricBand::easeAt(FabricBand::Girth::SleeveCap, 38.0) == highStretchCapEase,
              "knit >=38% cap anchor drifted");
static_assert(FabricBand::easeAt(FabricBand::Girth::SleeveCap, 63.0) == highStretchCapEase,
              "knit >=63% cap anchor drifted");
static_assert(FabricBand::easeAt(FabricBand::Girth::SleeveCap, 88.0) == highStretchCapEase,
              "knit >=88% cap anchor drifted");
// And the CONSEQUENCE F7 introduced, pinned as its own sentence rather than
// left as a comment: `min(capEaseMin, capEase)` can only ever move the floor
// DOWN from capEaseMin. An anchor that rose ABOVE the woven value would make
// that expression stop being a floor at all, silently. The compiler says so.
static_assert(FabricBand::easeAt(FabricBand::Girth::SleeveCap, 38.0) <= capEase &&
              FabricBand::easeAt(FabricBand::Girth::SleeveCap, 63.0) <= capEase &&
              FabricBand::easeAt(FabricBand::Girth::SleeveCap, 88.0) <= capEase,
              "cap ease axis is no longer monotone-down across the knit band");
inline double bicepsEaseFor(const FabricAxis& f) { return FabricBand::easeFor(FabricBand::Girth::Biceps, f); }
inline double capEaseFor(const FabricAxis& f) { return FabricBand::easeFor(FabricBand::Girth::SleeveCap, f); }

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

// Cap sleeve (kısa kanat cap, R1.2). A cap sleeve is NOT a short straight sleeve
// — it is a little WING that covers the top of the shoulder and dies away at the
// underarm with no underarm seam. Its head is the ordinary set-in cap (so it
// matches the armhole 1:1 and sets in like any sleeve), but instead of running
// down to a hem the outer edge sweeps back up to the underarm points a short
// depth below the cap. `capWingDepth` is how far the wing hangs below the cap
// crown at the shoulder point (the classic 60–90 mm couture cap).
inline constexpr double capWingDepth = constants::kCapWingDepthMM; // wing drop below the crown (constants.yaml)

// Returns the sleeve pieces (sleeve + cuff for balloon); empty for sleeveless.
// `cap` adds a gathered/puff head; Plain keeps the classic set-in cap exactly.
std::vector<PatternPiece> draft(
    const BodyMeasurementsSnapshot& m,
    SleeveStyle style,
    SleeveLength length,
    double armholeLength,
    double armholeDepth,
    FabricAxis fabric = Fabric::Woven,
    SleeveCap cap = SleeveCap::Plain);

} // namespace SleeveBlock
} // namespace stitchu
