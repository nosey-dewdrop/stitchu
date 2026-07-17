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
    Fabric fabric,
    SleeveCap cap
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

    // GATHERED / PUFF HEAD (Loop 6). Slash-and-spread across the crown: the cap
    // is widened by `spread` and the top point is drawn HIGHER so the extra arc
    // is gathered/eased into the SAME armhole (crown gather between the notches;
    // the underarm-to-notch length still matches the armhole 1:1). VERIFIED rule
    // (dresspatternmaking / M.Müller): a puff RAISES the cap by the spread amount;
    // a plain gathered head keeps the height. The biceps/hem width below is left
    // on the fitted base `width` so the sleeve still clears the arm. See FORMULAS.
    const double spread = capSpreadFrac(cap) * width;      // 0 when Plain / Cap
    const double capWidth = width + spread;                // widened crown
    const double capRise = (cap == SleeveCap::Puffed) ? spread : 0.0;
    capHeight += capRise;                                  // Plain/Cap: +0 → identical

    // CAP SLEEVE WING (R1.2). A cap sleeve keeps the ordinary set-in cap head
    // (the same cap curve, fitted to the armhole above so it sets in 1:1) but has
    // NO underarm seam and NO length — the outer edge sweeps a short depth below
    // the crown and back up to the underarm points, so a small wing covers the
    // top of the shoulder and dies at the underarm. We draw it here as its own
    // outline and return early; the full-sleeve body below is skipped. Only a
    // Short cap is a cap sleeve — length is ignored (a cap has no length axis).
    if (cap == SleeveCap::Cap) {
        const double cHalf = width / 2;         // the fitted cap width (armhole-matched)
        const Point cl{-cHalf, capHeight};      // left underarm point (cap base)
        const Point cr{cHalf, capHeight};       // right underarm point
        const Point apex{0, 0};                 // cap crown
        // The wing hangs capWingDepth below the crown at the shoulder point and
        // tapers to nothing at the underarm points, so the outer edge is a shallow
        // arc from cl down past (0, capHeight + capWingDepth) back to cr.
        const double wingY = capHeight + capWingDepth;
        std::vector<PathCommand> capCmds{PathCommand::move(cl)};
        // cap head (armhole edge): left underarm → crown → right underarm, the
        // SAME S-curve the plain cap uses, so it eases into the armhole identically.
        for (const auto& c : capCurve(cl, apex, true)) capCmds.push_back(c);
        for (const auto& c : capCurve(apex, cr, false)) capCmds.push_back(c);
        // outer wing edge: right underarm → wing point → left underarm (a shallow
        // hem arc a short depth below the crown; the underarm ends meet the cap
        // base so there is no seam to sew shut).
        capCmds.push_back(PathCommand::curve(
            {0, wingY}, {cHalf * 0.7, capHeight + capWingDepth * 0.55}, {cHalf * 0.35, wingY}));
        capCmds.push_back(PathCommand::curve(
            cl, {-cHalf * 0.35, wingY}, {-cHalf * 0.7, capHeight + capWingDepth * 0.55}));
        capCmds.push_back(PathCommand::close());

        // Notches on the cap so it matches the armhole notches when set in.
        std::vector<PathCommand> capMarks{
            PathCommand::move({-width * 0.18, capHeight * 0.18}),
            PathCommand::line({-width * 0.18, capHeight * 0.05}),
            PathCommand::move({width * 0.18, capHeight * 0.18}),
            PathCommand::line({width * 0.18, capHeight * 0.05}),
        };

        PatternPiece capPiece;
        capPiece.name = "Cap Sleeve";
        capPiece.cutInstruction = "cut 2";
        capPiece.commands = capCmds;
        capPiece.markings = capMarks;
        capPiece.hasGrainline = true;
        capPiece.grainline = Grainline{{0, capHeight * 0.35}, {0, wingY - 12}};
        capPiece.seamAllowance = 15;
        return {capPiece};
    }

    const double sleeveLength = totalLength(length, m.armLengthCM * 10, capHeight);
    const bool balloon = style == SleeveStyle::Balloon;

    const double hemY = sleeveLength;
    const double hemHalf = balloon ? width * 0.52 : width * 0.40;
    const double midBulge = balloon ? width * 0.62 : width * 0.46;

    const double capHalf = capWidth / 2;
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
    // Puff/gathered head: mark the crown gather span. The gather runs between the
    // two crown notches ACROSS the top (the underarm-to-notch length stays matched
    // to the armhole, so the sleeve still sets in). Notches sit at ±capWidth*0.30
    // — roughly the 7.5–9 cm-from-underarm placement on a real cap — with a dashed
    // gather line across the crown at the notch height so the sewer knows exactly
    // where to run the two gathering rows and ease the fullness in.
    if (cap != SleeveCap::Plain) {
        const double gx = capHalf * 0.60;          // crown notch x
        const double gy = capHeight * 0.42;        // notch depth from the top edge
        // left crown notch
        markings.push_back(PathCommand::move({-gx, gy + capHeight * 0.10}));
        markings.push_back(PathCommand::line({-gx, gy - capHeight * 0.02}));
        // right crown notch
        markings.push_back(PathCommand::move({gx, gy + capHeight * 0.10}));
        markings.push_back(PathCommand::line({gx, gy - capHeight * 0.02}));
        // gather line across the crown, dipping toward the raised top
        markings.push_back(PathCommand::move({-gx, gy}));
        markings.push_back(PathCommand::curve(
            {gx, gy}, {-gx * 0.4, gy * 0.35}, {gx * 0.4, gy * 0.35}));
    }
    if (balloon) {
        markings.push_back(PathCommand::move({-hemHalf, hemY - 25}));
        markings.push_back(PathCommand::line({hemHalf, hemY - 25}));
    }

    PatternPiece sleeve;
    sleeve.name = balloon ? "Balloon Sleeve"
                : cap == SleeveCap::Puffed ? "Puff Sleeve"
                : cap == SleeveCap::Gathered ? "Gathered-Head Sleeve"
                : "Sleeve";
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
