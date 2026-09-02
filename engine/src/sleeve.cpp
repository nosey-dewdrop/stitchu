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
    FabricAxis fabric,
    SleeveCap cap,
    BuzguResult* capBuzgu,
    BuzguResult* hemBuzgu
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

    // GATHERED / PUFF HEAD — DRAFTED PLAIN HERE, GATHERED AT THE END (M1-puf).
    //
    // Until 2026-09-02 this spot widened the crown by an INVENTED fraction of
    // the sleeve width (`capSpreadFrac`, 0.20 / 0.45, no source) and raised the
    // cap by the same amount, and whatever surplus that produced over the
    // armhole was the "gather". Both constants are gone. The cap drawn below is
    // the PLAIN armhole-fitted cap in every case; when `cap` asks for a gather,
    // the finished piece's own `sleeve_cap` edge is handed to the büzgü
    // operator (buzgu.cpp) at the bottom of this function with a MEASURED ratio.
    // That is why the crown is not widened here: a gather is a property of the
    // finished EDGE, and the operator is the only thing allowed to state it.
    const double capWidth = width;

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
        const int capFirst = static_cast<int>(capCmds.size());
        for (const auto& c : capCurve(cl, apex, true)) capCmds.push_back(c);
        for (const auto& c : capCurve(apex, cr, false)) capCmds.push_back(c);
        // NAME THE CAP HERE, where it is drawn (V7-C). A cap sleeve has NO
        // underarm seam, so it names one edge and no `sleeve_underarm` — an
        // absent edge stays absent instead of being invented downstream.
        const EdgeRole capRole{"sleeve_cap", capFirst,
                               static_cast<int>(capCmds.size()) - 1, cl, cr};
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
        capPiece.edgeRoles = {capRole};
        capPiece.markings = capMarks;
        capPiece.hasGrainline = true;
        capPiece.grainline = Grainline{{0, capHeight * 0.35}, {0, wingY - 12}};
        capPiece.seamAllowance = constants::kSeamAllowanceMM;
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
    const int capFirst = static_cast<int>(commands.size());
    for (const auto& c : capCurve(capLeft, top, true)) commands.push_back(c);
    for (const auto& c : capCurve(top, capRight, false)) commands.push_back(c);
    // NAME THE CAP HERE, where it is drawn (V7-C): the whole crown arc, left
    // underarm point to right underarm point. This is the edge that is sewn into
    // the armhole, so `armhole_front` + `armhole_back` and `sleeve_cap` can now
    // be measured against each other as two DRAWN edges.
    std::vector<EdgeRole> sleeveRoles{
        {"sleeve_cap", capFirst, static_cast<int>(commands.size()) - 1, capLeft, capRight}};
    // underarm seams (bowed out for balloon)
    const int underarmRightIndex = static_cast<int>(commands.size());
    commands.push_back(PathCommand::curve(
        hemRight,
        {capSideX, capHeight + (hemY - capHeight) * 0.4},
        {hemHalf * 1.05, hemY - (hemY - capHeight) * 0.2}));
    // The underarm seam is the piece's TWO side edges sewn to each other, so both
    // carry the name: the hem between them is a finished edge, not a seam. Naming
    // only one of them would hide the pair a consumer has to compare.
    sleeveRoles.push_back({"sleeve_underarm", underarmRightIndex, underarmRightIndex,
                           capRight, hemRight});
    const int hemIndex = static_cast<int>(commands.size());
    commands.push_back(PathCommand::line(hemLeft));
    // NAME THE HEM (M1-puf). It was the one unnamed edge on the piece, and it is
    // exactly the edge a balloon sleeve gathers into its cuff — so without a name
    // the second gather of a two-ended sleeve could not even be addressed, let
    // alone measured. Naming it costs no geometry (edgeRoles are not drawn).
    sleeveRoles.push_back({"sleeve_hem", hemIndex, hemIndex, hemRight, hemLeft});
    const int underarmLeftIndex = static_cast<int>(commands.size());
    commands.push_back(PathCommand::curve(
        capLeft,
        {-hemHalf * 1.05, hemY - (hemY - capHeight) * 0.2},
        {-capSideX, capHeight + (hemY - capHeight) * 0.4}));
    sleeveRoles.push_back({"sleeve_underarm", underarmLeftIndex, underarmLeftIndex,
                           hemLeft, capLeft});
    commands.push_back(PathCommand::close());

    // Gather notches on the cap; balloon also gathers into the hem.
    std::vector<PathCommand> markings{
        PathCommand::move({-width * 0.18, capHeight * 0.18}),
        PathCommand::line({-width * 0.18, capHeight * 0.05}),
        PathCommand::move({width * 0.18, capHeight * 0.18}),
        PathCommand::line({width * 0.18, capHeight * 0.05}),
    };
    // ⛔ THE HAND-DRAWN "gather span" THAT USED TO SIT HERE IS GONE (M1-puf).
    // It drew two crown notches at ±capHalf*0.60 and a dashed arc between them —
    // three more numbers with no source, placed on a crown whose width was
    // itself invented. The gather marks are now stamped BY the operator, evenly
    // along the edge it actually lengthened, so their position is a consequence
    // of the gather instead of a decoration next to it.
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
    sleeve.edgeRoles = sleeveRoles;
    sleeve.markings = markings;
    sleeve.hasGrainline = true;
    sleeve.grainline = Grainline{{0, capHeight * 0.4}, {0, hemY - 40}};
    sleeve.seamAllowance = constants::kSeamAllowanceMM;

    // Cuff band: wrist-ish circumference derived from biceps estimate.
    const double cuffLength = bicepsEstimate * 0.62 + 20;
    const double cuffHeight = 60;

    // ---------------------------------------------------------------------
    // BÜZGÜ (M1-puf). The sleeve above is the plain armhole-fitted draft. Now
    // the two edges that a gathered sleeve actually gathers are handed to the
    // operator — the CAP into the armhole, and (balloon) the HEM into the cuff.
    // Both are named edges, so both are addressed rather than guessed at.
    // ---------------------------------------------------------------------
    if (cap != SleeveCap::Plain && cap != SleeveCap::Cap) {
        BuzguResult r = BuzguBlock::gatherEdge(
            sleeve, "sleeve_cap", armholeLength, capBuzguRatio(cap), capBuzguNotchCount,
            capBuzguPerpMax(cap));
        if (capBuzgu) *capBuzgu = r;
        // RE-ANCHOR THE CROWN. The spread is taken about the cap's own chord, so
        // a raised cap pushes the crown ABOVE y = 0 — and the whole sleeve block
        // is written in a frame whose origin IS the crown point (the grainline,
        // the cuff, every consumer of commands[0].to reads the cap height off
        // it). Sliding the piece back down by exactly the rise restores that
        // frame: the crown returns to 0, the biceps line ends up at
        // capHeight x perpScale, and the distance from the biceps line to the
        // hem — the part of the sleeve that covers the arm — is untouched.
        if (r.ok) {
            const double crownY = sleeve.commands[1].to.y;  // the cap apex
            if (crownY < 0) translatePiece(sleeve, 0, -crownY);

            // RE-ANCHOR THE UNDERARM SEAMS ONTO THE WIDENED CORNERS. The rule
            // is not new — it is the one stated 40 lines above, where capSideX
            // is built: "the underarm control point nearest the cap must not
            // sit INSIDE the cap corner, or the seam overshoots inward and the
            // cubic loops back on itself." The büzgü moves the corner outward
            // AFTER that rule was applied, so it has to be applied again with
            // the corner the piece now has. Without this the drawn piece grows
            // a needle-thin spike at each underarm (seen on the first draw of
            // KOSU/ciktilar/puf-kol.png) — the exact loop-back the rule names.
            const Point cL = sleeve.commands[0].to, cR = sleeve.commands[2].to;
            const Point hR = sleeve.commands[static_cast<size_t>(hemIndex) - 1].to;
            const Point hL = sleeve.commands[static_cast<size_t>(hemIndex)].to;
            const double side = std::max(capSideX, std::fabs(cR.x));
            const double hHalf = std::fabs(hR.x);
            PathCommand& ur = sleeve.commands[static_cast<size_t>(underarmRightIndex)];
            ur.cp1 = {side, cR.y + (hR.y - cR.y) * 0.4};
            ur.cp2 = {hHalf * 1.05, hR.y - (hR.y - cR.y) * 0.2};
            PathCommand& ul = sleeve.commands[static_cast<size_t>(underarmLeftIndex)];
            ul.cp1 = {-hHalf * 1.05, hL.y - (hL.y - cL.y) * 0.2};
            ul.cp2 = {-side, cL.y + (hL.y - cL.y) * 0.4};
        }
        // A refusal is NOT swallowed: the piece keeps its plain cap and the
        // caller is told, by name, that this sleeve is not gathered. Drawing a
        // sleeve called "Puff Sleeve" with a plain cap and saying nothing is
        // exactly the silent default this engine is not allowed to have — so
        // the piece is renamed to what it IS.
        if (!r.ok && cap == SleeveCap::Puffed) sleeve.name = "Sleeve (buzgu uygulanamadi)";
    }
    // A balloon hem is drafted WIDER than its cuff already (hemHalf on the
    // fitted width vs a cuff at 0.62 x biceps). So its gather is a MEASUREMENT,
    // not a change: markGatheredEdge stamps the marks and reports the ratio the
    // draft itself produced. Overwriting it with the Bugra cap ratio would
    // replace a real number with a borrowed one — and would SHRINK this hem.
    if (balloon) {
        BuzguResult h = BuzguBlock::markGatheredEdge(
            sleeve, "sleeve_hem", cuffLength, capBuzguNotchCount);
        if (hemBuzgu) *hemBuzgu = h;
    }

    if (!balloon) return {sleeve};

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
    cuff.seamAllowance = constants::kSeamAllowanceBandMM;
    return {sleeve, cuff};
}

} // namespace SleeveBlock
} // namespace stitchu
