#pragma once
// Set-in sleeve block, cap fitted by bisection to the armhole. See FORMULAS.md.
#include "buzgu.hpp"
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

// GATHERED / PUFF HEAD — A BÜZGÜ, NOT AN INVENTED SPREAD (M1-puf, 2026-09-02).
//
// ⛔ WHAT WAS HERE UNTIL TODAY, AND WHY IT WENT. Two constants:
//     gatheredSpreadFrac = 0.20   // added crown width / cap width
//     puffedSpreadFrac   = 0.45
// Neither had a source. They were not "the gather ratio" of anything — they
// were a chosen widening, and the surplus that reached the armhole was
// WHATEVER FELL OUT of that widening. So the one number that decides whether a
// sleeve reads as a puff (how much longer than the armhole the cap is drawn)
// was never stated, never measured and never checked; the validator could only
// judge it against a band derived from the same invented number.
//
// ⭐ WHAT REPLACED THEM. The quantity that defines a gathered seam, stated
// directly: BUZGU ORANI = drawn cap arc / armhole it is sewn onto. Both values
// are MEASURED on the purchased Bugra Locket (contract/tables.json
// draft.gatherRatios._sleeveCapSource, from knowledge/cap-ease-isareti-2026-08-17.md):
// the Upper Sleeve's top edge runs into its own armhole with +23.5 ... +29.9%
// surplus across 8 sizes, +29.0% at EU38. That surplus is a gather, not ease.
//   Puffed   1.290 — the EU38 measured value.
//   Gathered 1.235 — the LOW end of the same measured band (the least full
//                    member of the measured family), not a taste pick.
// The operator that applies it is engine/src/buzgu.cpp; sleeve.cpp drafts the
// PLAIN armhole-fitted cap first and then gathers that named edge, so the
// number above is what the drawn edge actually measures, to floating point.
inline double capBuzguRatio(SleeveCap c) {
    return c == SleeveCap::Puffed ? contract::kGatherRatio_sleeveCapPuffed
         : c == SleeveCap::Gathered ? contract::kGatherRatio_sleeveCapGathered : 0.0;
}
// ⭐ WHERE THE GATHER GOES — THE CAP-HEIGHT CEILING (round 3, 2026-09-03).
//
// The ratio above says HOW MUCH surplus. This says WHERE it may sit. Round 2
// put all of it in the cap height and produced an EU38 cap 202.7 mm tall
// against a published band of 130-150 mm, and turned `sleeve_check` red 45
// times ("crown wider than plain (217 > 217)"). The ceiling here is that
// published band's TOP, and nothing above it:
//
//   PUFFED   contract kGatherRatio_sleeveCapPuffedLift — Aldrich's EU38 sleeve
//            cap-height band top 150.0 mm over the engine's own drafted EU38
//            plain cap height 136.49 mm. A puff head may rise to the top of the
//            band; the surplus that does not fit under it goes into the chord,
//            which is what the measured Bugra puff does too (chord x1.459).
//   GATHERED 1.0 — a soft gathered head keeps the drafted cap HEIGHT and puts
//            the whole gather on the biceps line. This is not a pick either:
//            `sleeve_check`'s own law for this style is "cap height unchanged
//            (soft gather)", and that is the difference between the two styles.
inline double capBuzguPerpMax(SleeveCap c) {
    return c == SleeveCap::Puffed ? contract::kGatherRatio_sleeveCapPuffedLift : 1.0;
}
// Gather marks along the gathered cap. THREE, and the number is measured, not
// picked: the Bugra Locket's Lower Sleeve carries exactly three notches with no
// counterpart on the plain cap — arc 127, 412, 446 — and CLAUDE.md names them
// "buzgulu Upper Sleeve hizalama isaretleri", i.e. the marks that distribute
// the gathered layer's fullness. The engine draws the same count.
inline constexpr int capBuzguNotchCount = 3;

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
// `capBuzgu` / `hemBuzgu` (optional) report what the büzgü operator actually
// did to the cap edge and to the balloon hem — including a NAMED refusal. A
// caller that passes them can put the numbers in the sewing guide; a caller
// that does not is unaffected, and a Plain cap never touches them.
std::vector<PatternPiece> draft(
    const BodyMeasurementsSnapshot& m,
    SleeveStyle style,
    SleeveLength length,
    double armholeLength,
    double armholeDepth,
    FabricAxis fabric = Fabric::Woven,
    SleeveCap cap = SleeveCap::Plain,
    BuzguResult* capBuzgu = nullptr,
    BuzguResult* hemBuzgu = nullptr);

// ⭐ M6-zaten — THE GARMENT TITLE MUST NAME THE SLEEVE THAT IS DRAWN.
//
// MEASURED 2026-09-04: `puff sleeve gathered waist midi dress` produced the
// heading "Gathered STRAIGHT-SLEEVE dress" and the file names
// stitchu-gathered-straight-sleeve-dress-*.svg/.dxf/-a4.pdf, while the piece
// list on the same screen said "Puff Sleeve · cut 2" and the drawing showed a
// puffed cap. The title read SleeveStyle (the silhouette axis) and never
// SleeveCap (the head axis); two axes describe one piece and the name saw one.
// A buyer files a pattern by its name; a name that contradicts the drawing is
// a wrong pattern on the shelf.
//
// This is the SAME word source the piece name uses (sleeve.cpp `sleeve.name`),
// stated once so the two can no longer drift apart.
inline const char* titleWord(SleeveStyle style, SleeveCap cap) {
    if (style == SleeveStyle::None) return "";
    if (style == SleeveStyle::Balloon) return "balloon";
    switch (cap) {
        case SleeveCap::Puffed:   return "puff";
        case SleeveCap::Gathered: return "gathered-head";
        case SleeveCap::Cap:      return "cap";
        default:                  return "straight";
    }
}

} // namespace SleeveBlock
} // namespace stitchu
