#pragma once
// ── KUMAŞ = SPEC'İN EKSENİ (F-H, 2026-08-23) ─────────────────────────────────
//
// Until tonight the whole material layer was two words: `fabric: woven | knit`
// (contract/primitives-v1.json called this out as the material gap). Two words
// cannot answer "aynı spec, farklı kumaş → farklı kalıp": a 5%-stretch ponte and
// a 90%-stretch swim knit both landed on ONE set of ease numbers.
//
// So the enum keeps its job (it decides SEWING: zigzag/ballpoint/no zipper) and a
// CONTINUOUS axis is added next to it: `FabricAxis.stretchPct`, the fabric's
// crosswise stretch in percent, measured by the 10 cm / 4 inch stretch test the
// guide now prints. That number moves the drafted ease, so the cut pieces differ.
//
// PUBLISHED BAND (F-H card §İŞ 1; cross-read against knowledge/stitchu.db
// `fabrics.stretch` for jersey, sourced to UNL "Sewing With Knits" 4-inch test
// https://digitalcommons.unl.edu/extensionhist/1186):
//     woven          ~0%      positive ease MANDATORY
//     stable knit     0–25%   small positive ease
//     moderate       26–50%   about −3%   (negative)
//     stretchy       51–75%   about −5%
//     super            76%+   about −10%, darts drop out
// ⚠ The two sources do not agree on where the bands sit: UNL's 4-inch test calls
// stable <12.5%, moderate ~30%, super 50%+, i.e. UNL's "super" starts where the
// card's "moderate" ends. The CARD's band is the one implemented (it is the
// instruction); UNL is recorded here as the cross-reference, NOT averaged in.
//
// RECOVERY — why the negative branch is NOT a raw formula. A fabric that stretches
// 50% could in principle be cut 1/1.5 = 33% smaller. It is not, and no published
// draft does that: RECOVERY (how much of that stretch the fabric gives back) and
// the wearer's comfort cap the reduction an order of magnitude lower. The −3/−5/
// −10% above ARE the tempered figures. Nothing here divides by (1+stretch).
//
// ANCHOR PLACEMENT. Each published figure is pinned at the MIDPOINT of its band
// and the engine interpolates linearly between anchors, so ease is continuous in
// stretch (a step function would jump 7 mm of girth at 25.0 vs 25.1% stretch).
// The two legacy engine numbers are themselves anchors:
//     stretch 0    = today's woven ease   (BodiceBlock::chestEase etc.)
//     stretch 12.5 = today's knit ease    (BodiceBlock::knitChestEase etc.)
// so an undeclared `woven` and an undeclared `knit` reproduce the old draft
// EXACTLY — the golden surface cannot move unless a spec declares a stretch.
#include <algorithm>
#include <array>
#include <cmath>

#include "measurements.hpp"

namespace stitchu {
namespace FabricBand {

// Band edges, percent crosswise stretch (F-H card).
inline constexpr double kStableMaxPct   = 25.0;
inline constexpr double kModerateMaxPct = 50.0;
inline constexpr double kStretchyMaxPct = 75.0;
// Above this the published rule drops the darts (see dartsDropOut()).
inline constexpr double kSuperMinPct    = 76.0;

// The stretch a fabric is assumed to have when the spec only says the WORD.
inline constexpr double kWovenDefaultPct = 0.0;
inline constexpr double kKnitDefaultPct  = 12.5;  // midpoint of the stable band
// FabricAxis::effectiveStretchPct() repeats these two literals (measurements.hpp
// cannot include this header). If one side ever moves, the build stops here.
static_assert(FabricAxis(Fabric::Woven).effectiveStretchPct() == kWovenDefaultPct,
              "woven default stretch drifted from FabricAxis");
static_assert(FabricAxis(Fabric::Knit).effectiveStretchPct() == kKnitDefaultPct,
              "knit default stretch drifted from FabricAxis");

// Which girth the ease applies to. Each has its own woven/stable anchors because
// the legacy engine had its own number per region; from the moderate band up the
// published figure is ONE garment-wide negative ease, so the regions converge.
enum class Girth { Chest, WaistBodice, WaistSkirt, HipSkirt, Biceps, SleeveCap };

struct Anchor {
    double stretchPct;
    double ease;  // fraction of the body girth
};

inline constexpr int kAnchorCount = 5;
using AnchorRow = std::array<Anchor, kAnchorCount>;

// Band midpoints: woven 0, stable 12.5, moderate 38, stretchy 63, super 88.
inline constexpr AnchorRow kChest = {
    Anchor{0.0, 0.11}, {12.5, 0.04}, {38.0, -0.03}, {63.0, -0.05}, {88.0, -0.10}};
inline constexpr AnchorRow kWaistBodice = {
    Anchor{0.0, 0.05}, {12.5, 0.02}, {38.0, -0.03}, {63.0, -0.05}, {88.0, -0.10}};
inline constexpr AnchorRow kWaistSkirt = {
    Anchor{0.0, 0.02}, {12.5, 0.01}, {38.0, -0.03}, {63.0, -0.05}, {88.0, -0.10}};
inline constexpr AnchorRow kHipSkirt = {
    Anchor{0.0, 0.02}, {12.5, 0.01}, {38.0, -0.03}, {63.0, -0.05}, {88.0, -0.10}};
inline constexpr AnchorRow kBiceps = {
    Anchor{0.0, 0.15}, {12.5, 0.06}, {38.0, -0.03}, {63.0, -0.05}, {88.0, -0.10}};
// CAP ease is not body ease: it is the sleeve-head length eased into the armhole
// seam. You cannot ease MORE into a stretchy knit head — a knit cap is set flat
// (Aldrich knit block, UNL). So it decays to 0 and stops; it never goes negative,
// because a short cap would pull the armhole up.
inline constexpr AnchorRow kCap = {
    Anchor{0.0, 0.04}, {12.5, 0.02}, {38.0, 0.00}, {63.0, 0.00}, {88.0, 0.00}};

inline constexpr const AnchorRow& anchors(Girth g) {
    return g == Girth::Chest        ? kChest
         : g == Girth::WaistBodice  ? kWaistBodice
         : g == Girth::WaistSkirt   ? kWaistSkirt
         : g == Girth::HipSkirt     ? kHipSkirt
         : g == Girth::Biceps       ? kBiceps
                                    : kCap;
}

// Piecewise-linear over the anchors, clamped flat outside them.
inline constexpr double easeAt(Girth g, double stretchPct) {
    const AnchorRow& a = anchors(g);
    if (stretchPct <= a[0].stretchPct) return a[0].ease;
    if (stretchPct >= a[kAnchorCount - 1].stretchPct) return a[kAnchorCount - 1].ease;
    for (int i = 1; i < kAnchorCount; ++i) {
        // Land EXACTLY on an anchor when the stretch IS the anchor. Without this
        // the interpolation returns 0.11 + 1.0*(0.04-0.11) = 0.04000000000000001
        // and the legacy knit draft would move by a float ulp — i.e. the golden
        // surface would shift for a spec that declared nothing.
        if (stretchPct == a[i].stretchPct) return a[i].ease;
        if (stretchPct <= a[i].stretchPct) {
            const double t = (stretchPct - a[i - 1].stretchPct) /
                             (a[i].stretchPct - a[i - 1].stretchPct);
            return a[i - 1].ease + t * (a[i].ease - a[i - 1].ease);
        }
    }
    return a[kAnchorCount - 1].ease;
}

// ── RECOVERY IS A CONDITION, NOT A MULTIPLIER (F6, 2026-08-27) ──────────────
// §1D: no authoritative publication combines stretch + recovery + growth into one
// formula, so this file does not contain one. What IS published is a set of
// MINIMUMS, and a minimum is a yes/no. ASTM D3107 (the kumaş catalog's
// `standards.astm-d3107`, thresholds carried from KOSU-v7.md §F6 — the standard's
// body is paywalled and the three numbers are marked DOĞRULANMADI-YARIM there):
//     growth   at most  3 %
//     recovery at least 75 % after 15 s, 85 % after 30 min
// Cloth that fails those does not give the stretch back. Cutting it SMALLER
// than the body would make the garment permanently tight, so the negative branch
// is refused outright: the ease is clamped at 0. The positive branch is untouched
// (cloth that sags does not need LESS room).
//
// ⚠ THE GAP IS DECLARED, NOT HIDDEN: a spec that says nothing about recovery does
// not fire this rule at all, so an undeclared knit still takes negative ease
// unmeasured. Closing that would move every legacy knit draft (RULES 4 / golden).
inline constexpr double kGrowthMaxPct        = 3.0;
inline constexpr double kRecovery15sMinPct   = 75.0;
inline constexpr double kRecovery30minMinPct = 85.0;

// true  = the axis is silent (rule does not apply) OR it meets every published
//         minimum it declared.
// false = it declared a number and that number fails D3107 -> no negative ease.
inline constexpr bool recoveryQualifies(const FabricAxis& f) {
    if (!f.recoveryDeclared()) return true;
    if (f.growthPct >= 0.0 && f.growthPct > kGrowthMaxPct) return false;
    if (f.recovery15sPct >= 0.0 && f.recovery15sPct < kRecovery15sMinPct) return false;
    if (f.recovery30minPct >= 0.0 && f.recovery30minPct < kRecovery30minMinPct) return false;
    return true;
}

// Ease for a declared axis. An UNDECLARED stretch falls back to the word, and
// the word's default sits exactly on a legacy anchor -> byte-identical draft.
inline constexpr double easeFor(Girth g, const FabricAxis& f) {
    const double e = easeAt(g, f.effectiveStretchPct());
    if (e < 0.0 && !recoveryQualifies(f)) return 0.0;
    return e;
}

// ── FABRIC WIDTH -> YARDAGE (F6) ────────────────────────────────────────────
// The engine's one yardage number is metres at 140 cm. A narrower bolt needs
// proportionally more length for the same total piece area; this is arithmetic,
// not a publication (catalog `width_rule`). A bolt that IS 140 cm reproduces the
// legacy number exactly, and an undeclared width does not enter here at all.
inline constexpr double kRefWidthCM = 140.0;
inline double metersAtWidth(double meters140, const FabricAxis& f) {
    if (!f.widthDeclared()) return meters140;
    const double m = meters140 * (kRefWidthCM / f.widthCM);
    // Same 0.1 m rounding the engine already publishes yardage in.
    return std::floor(m * 10.0 + 0.5) / 10.0;
}

// Published rule: above 76% stretch the darts drop out — the fabric absorbs the
// bust/waist difference, so a dart would over-fit. DECLARED HERE, NOT YET WIRED
// into the bodice: dropping the intake needs engine/src/bodice.cpp, which is
// owned by another shift tonight. See DAMLA-KUYRUK.md.
inline bool dartsDropOut(const FabricAxis& f) {
    return f.effectiveStretchPct() >= kSuperMinPct;
}

// Human band name, printed in the guide.
inline const char* bandName(const FabricAxis& f) {
    const double s = f.effectiveStretchPct();
    if (s <= 0.0) return "woven";
    if (s <= kStableMaxPct) return "stable knit";
    if (s <= kModerateMaxPct) return "moderate stretch";
    if (s <= kStretchyMaxPct) return "stretchy";
    return "super stretch";
}

}  // namespace FabricBand
}  // namespace stitchu
