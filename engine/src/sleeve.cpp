#include "sleeve.hpp"

#include <algorithm>
#include <cmath>

namespace stitchu {
namespace SleeveBlock {
namespace {

// Classic S-shaped half cap: hollow near the underarm, full near the top.
std::vector<PathCommand> capCurve(Point from, Point to, bool front) {
    const double dx = to.x - from.x;
    const double dy = to.y - from.y;
    const double hollow = front ? 0.24 : 0.18;
    return {PathCommand::curve(
        to,
        {from.x + dx * hollow, from.y + dy * 0.02},
        {from.x + dx * 0.55, from.y + dy * 0.98})};
}

double capCurveLength(double width, double capHeight) {
    const Point left{-width / 2, capHeight};
    const Point right{width / 2, capHeight};
    const Point top{0, 0};
    std::vector<PathCommand> cmds{PathCommand::move(left)};
    for (const auto& c : capCurve(left, top, true)) cmds.push_back(c);
    for (const auto& c : capCurve(top, right, false)) cmds.push_back(c);
    return pathLength(cmds);
}

double totalLength(SleeveLength length, double armLengthMM, double capHeight) {
    switch (length) {
        case SleeveLength::Short: return capHeight + 90;
        case SleeveLength::Elbow: return capHeight + armLengthMM * 0.35;
        case SleeveLength::Long: return armLengthMM * 0.96;
    }
    return capHeight + 90;
}

} // namespace

std::vector<PatternPiece> draft(
    const BodyMeasurementsSnapshot& m,
    SleeveStyle style,
    SleeveLength length,
    double armholeLength,
    double armholeDepth,
    Fabric fabric
) {
    if (style == SleeveStyle::None) return {};

    const double bicepsEstimate = m.bustMM() * bicepsRatio * (1 + bicepsEaseFor(fabric));
    double capHeight = armholeDepth * 0.75;
    const double targetCapLength = armholeLength * (1 + capEaseFor(fabric));

    // Fit the cap to the armhole while keeping the sleeve wide enough for the
    // arm. The biceps line is the HARD floor: a sleeve narrower than the biceps
    // girth + ease binds or won't close at the underarm. Classic set-in drafting
    // (Aldrich/Brian) draws the biceps line first, then trues the cap to the
    // armhole by adjusting the cap HEIGHT — not the width.
    //
    // Step 1: solve width by length-matching at the default cap height. Cap
    // length grows monotonically with width, so bisect (a multiplicative walk
    // oscillates and can miss the tolerance).
    double lo = 60.0;
    double hi = std::max(bicepsEstimate, 200.0) * 3;
    while (capCurveLength(hi, capHeight) < targetCapLength && hi < 8000) {
        hi *= 1.5;
    }
    double width = std::max(bicepsEstimate, 200.0);
    for (int i = 0; i < 60; ++i) {
        width = (lo + hi) / 2;
        const double delta = capCurveLength(width, capHeight) - targetCapLength;
        if (std::fabs(delta) <= convergenceTolerance) break;
        if (delta > 0) hi = width; else lo = width;
    }

    // Step 2: if that width is below the biceps floor (the common case — a
    // length-matched cap on the default height comes out too narrow for the
    // arm), widen to the biceps and instead lower the cap height until the cap
    // length matches again. A wider sleeve on a shallower cap is the correct,
    // sewable relaxed-set trade; the cap ease stays inside the validator window.
    if (width < bicepsEstimate) {
        width = bicepsEstimate;
        double chLo = 20.0, chHi = capHeight; // shallower cap => shorter cap length
        // At width=biceps the default height overshoots the target, so the
        // answer sits below capHeight; bisect the height down to the target.
        for (int i = 0; i < 60; ++i) {
            capHeight = (chLo + chHi) / 2;
            const double delta = capCurveLength(width, capHeight) - targetCapLength;
            if (std::fabs(delta) <= convergenceTolerance) break;
            if (delta > 0) chHi = capHeight; else chLo = capHeight;
        }
    }

    const double sleeveLength = totalLength(length, m.armLengthCM * 10, capHeight);
    const bool balloon = style == SleeveStyle::Balloon;

    const double hemY = sleeveLength;
    const double hemHalf = balloon ? width * 0.52 : width * 0.40;
    const double midBulge = balloon ? width * 0.62 : width * 0.46;

    const double capHalf = width / 2;
    const Point capLeft{-capHalf, capHeight};
    const Point capRight{capHalf, capHeight};
    const Point top{0, 0};
    const Point hemLeft{-hemHalf, hemY};
    const Point hemRight{hemHalf, hemY};

    // The underarm control point nearest the cap must not sit INSIDE the cap
    // corner, or on a wide sleeve with a shallow cap (the biceps-floor + deepened
    // armscye regime) the seam overshoots inward and the cubic loops back on
    // itself. Anchor it at least as wide as the cap corner. For a balloon the
    // bulge stays outboard as intended.
    const double capSideX = balloon ? midBulge : std::max(midBulge, capHalf);
    std::vector<PathCommand> commands{PathCommand::move(capLeft)};
    for (const auto& c : capCurve(capLeft, top, true)) commands.push_back(c);
    for (const auto& c : capCurve(top, capRight, false)) commands.push_back(c);
    // underarm seams (bowed out for balloon)
    commands.push_back(PathCommand::curve(
        hemRight,
        {capSideX, capHeight + (hemY - capHeight) * 0.4},
        {hemHalf * 1.05, hemY - (hemY - capHeight) * 0.2}));
    commands.push_back(PathCommand::line(hemLeft));
    commands.push_back(PathCommand::curve(
        capLeft,
        {-hemHalf * 1.05, hemY - (hemY - capHeight) * 0.2},
        {-capSideX, capHeight + (hemY - capHeight) * 0.4}));
    commands.push_back(PathCommand::close());

    // Gather notches on the cap; balloon also gathers into the hem.
    std::vector<PathCommand> markings{
        PathCommand::move({-width * 0.18, capHeight * 0.18}),
        PathCommand::line({-width * 0.18, capHeight * 0.05}),
        PathCommand::move({width * 0.18, capHeight * 0.18}),
        PathCommand::line({width * 0.18, capHeight * 0.05}),
    };
    if (balloon) {
        markings.push_back(PathCommand::move({-hemHalf, hemY - 25}));
        markings.push_back(PathCommand::line({hemHalf, hemY - 25}));
    }

    PatternPiece sleeve;
    sleeve.name = balloon ? "Balloon Sleeve" : "Sleeve";
    sleeve.cutInstruction = "cut 2";
    sleeve.commands = commands;
    sleeve.markings = markings;
    sleeve.hasGrainline = true;
    sleeve.grainline = Grainline{{0, capHeight * 0.4}, {0, hemY - 40}};
    sleeve.seamAllowance = 15;

    if (!balloon) return {sleeve};

    // Cuff band: wrist-ish circumference derived from biceps estimate.
    const double cuffLength = bicepsEstimate * 0.62 + 20;
    const double cuffHeight = 60;
    PatternPiece cuff;
    cuff.name = "Sleeve Cuff";
    cuff.cutInstruction = "cut 2, interface";
    cuff.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({cuffLength, 0}),
        PathCommand::line({cuffLength, cuffHeight}),
        PathCommand::line({0, cuffHeight}),
        PathCommand::close(),
    };
    cuff.markings = {
        PathCommand::move({0, cuffHeight / 2}),
        PathCommand::line({cuffLength, cuffHeight / 2}),
    };
    cuff.hasGrainline = true;
    cuff.grainline = Grainline{{20, cuffHeight / 2}, {cuffLength - 20, cuffHeight / 2}};
    cuff.seamAllowance = 10;
    return {sleeve, cuff};
}

} // namespace SleeveBlock
} // namespace stitchu
