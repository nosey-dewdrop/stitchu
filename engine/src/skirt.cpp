#include "skirt.hpp"

#include <algorithm>
#include <cmath>

namespace stitchu {
namespace SkirtBlock {
namespace {

double flare(SkirtStyle style) {
    switch (style) {
        case SkirtStyle::ALine: return 60;
        case SkirtStyle::Straight:
        case SkirtStyle::Gathered:
        case SkirtStyle::HalfCircle: return 0;
    }
    return 0;
}

// Drafts one quarter (half of front or back, cut on fold).
PatternPiece draftQuarter(
    const std::string& name,
    double waistQuarter,
    double hipQuarter,
    double length,
    SkirtStyle style,
    double dartLength
) {
    const double suppression = std::max(0.0, hipQuarter - waistQuarter);
    double sideTake = std::min(suppression * 0.6, maxSideTake);
    double dartWidth = suppression - sideTake;
    if (dartWidth < minDartWidth) {
        sideTake = std::min(suppression, maxSideTake);
        dartWidth = 0;
    }
    (void)sideTake; // absorbed by the waist edge geometry below, like Swift

    const double waistlineWidth = waistQuarter + dartWidth;
    const double sideWaistRise = 12;
    const double flareOut = flare(style);
    const double hemX = hipQuarter + flareOut;
    const double hemSideRise = flareOut > 0 ? 18 : 0;

    const Point centerWaist{0, 0};
    const Point sideWaist{waistlineWidth, -sideWaistRise};
    const Point hipPoint{hipQuarter, hipDepth};
    const Point hemSide{hemX, length - hemSideRise};
    const Point hemCenter{0, length};

    const std::vector<PathCommand> commands{
        PathCommand::move(centerWaist),
        PathCommand::curve(sideWaist,
                           {waistlineWidth * 0.45, 0},
                           {waistlineWidth * 0.8, -sideWaistRise * 0.8}),
        PathCommand::curve(hipPoint,
                           {waistlineWidth + (hipQuarter - waistlineWidth) * 0.6, hipDepth * 0.3 - sideWaistRise},
                           {hipQuarter, hipDepth * 0.65}),
        PathCommand::line(hemSide),
        PathCommand::curve(hemCenter,
                           {hemX * 0.6, length},
                           {hemX * 0.3, length}),
        PathCommand::line(centerWaist),
        PathCommand::close(),
    };

    std::vector<PathCommand> markings;
    if (dartWidth > 0) {
        const double dartCenterX = waistlineWidth / 2;
        const Point dartTip{dartCenterX, dartLength};
        const double legY = -sideWaistRise * (dartCenterX / waistlineWidth) * 0.5;
        markings.push_back(PathCommand::move({dartCenterX - dartWidth / 2, legY}));
        markings.push_back(PathCommand::line(dartTip));
        markings.push_back(PathCommand::line({dartCenterX + dartWidth / 2, legY}));
    }

    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction = "cut 1 on fold";
    piece.commands = commands;
    piece.markings = markings;
    piece.hasGrainline = true;
    piece.grainline = Grainline{{40, hipDepth}, {40, length - 60}};
    piece.seamAllowance = 15;
    return piece;
}

// Gathered skirt: a simple rectangle, fabric = waist * gather ratio.
PatternPiece gatheredPanel(double waistQuarter, double length) {
    const double width = waistQuarter * gatherRatio;
    PatternPiece piece;
    piece.name = "Front";
    piece.cutInstruction = "cut 1 on fold";
    piece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({width, 0}),
        PathCommand::line({width, length}),
        PathCommand::line({0, length}),
        PathCommand::close(),
    };
    piece.markings = {PathCommand::move({0, 18}), PathCommand::line({width, 18})};
    piece.hasGrainline = true;
    piece.grainline = Grainline{{50, 80}, {50, length - 80}};
    piece.seamAllowance = 15;
    return piece;
}

// Half-circle skirt: two quarter-circle panels cut FLAT (not on fold — on
// fold the two panels would unfold into a full circle with twice the waist).
// Waist radius r = eased waist / pi (half-circle geometry).
PatternPiece halfCirclePanel(double easedWaistMM, double length) {
    const double r = easedWaistMM / M_PI;
    const double R = r + length;
    const double k = 0.5523; // circle-to-bezier kappa

    PatternPiece piece;
    piece.name = "Skirt Panel (quarter circle)";
    piece.cutInstruction = "cut 2";
    piece.commands = {
        PathCommand::move({r, 0}),
        // waist arc (quarter circle)
        PathCommand::curve({0, r}, {r, r * k}, {r * k, r}),
        // straight seam edge out to hem
        PathCommand::line({0, R}),
        // hem arc back
        PathCommand::curve({R, 0}, {R * k, R}, {R, R * k}),
        PathCommand::close(),
    };
    piece.hasGrainline = true;
    piece.grainline = Grainline{{r * 0.8, r * 0.8}, {R * 0.62, R * 0.62}};
    piece.seamAllowance = 15;
    return piece;
}

} // namespace

PatternPiece waistbandPiece(double waistMM) {
    const double bandLength = waistMM * (1 + waistEase) / 2 + 30; // half band (cut 2) + button stand
    const double bandHeight = 80;                                 // folds to 4cm
    PatternPiece piece;
    piece.name = "Waistband";
    piece.cutInstruction = "cut 2, interface 1";
    piece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({bandLength, 0}),
        PathCommand::line({bandLength, bandHeight}),
        PathCommand::line({0, bandHeight}),
        PathCommand::close(),
    };
    piece.markings = {
        PathCommand::move({0, bandHeight / 2}),
        PathCommand::line({bandLength, bandHeight / 2}),
    };
    piece.hasGrainline = true;
    piece.grainline = Grainline{{30, bandHeight / 2}, {bandLength - 30, bandHeight / 2}};
    piece.seamAllowance = 10;
    return piece;
}

std::vector<PatternPiece> pieces(
    const BodyMeasurementsSnapshot& m,
    SkirtStyle style,
    SkirtLength length,
    bool includeWaistband,
    std::optional<double> targetWaistMM
) {
    const double fullWaist = targetWaistMM.value_or(m.waistMM() * (1 + waistEase));
    const double waistQuarter = fullWaist / 4;
    // The skirt must pass over the waist: for waist > hip bodies the widest
    // drafting line is the waist itself.
    const double hipQuarter = std::max(m.hipMM() * (1 + hipEase) / 4, waistQuarter);
    const double len = millimeters(length);

    std::vector<PatternPiece> result;
    switch (style) {
        case SkirtStyle::ALine:
        case SkirtStyle::Straight:
            result.push_back(draftQuarter("Front", waistQuarter, hipQuarter, len, style, 90));
            result.push_back(draftQuarter("Back", waistQuarter, hipQuarter, len, style, 130));
            break;
        case SkirtStyle::Gathered: {
            PatternPiece panel = gatheredPanel(waistQuarter, len);
            PatternPiece back = panel;
            back.name = "Back";
            result.push_back(panel);
            result.push_back(back);
            break;
        }
        case SkirtStyle::HalfCircle:
            result.push_back(halfCirclePanel(fullWaist, len));
            break;
    }
    if (includeWaistband) {
        result.push_back(waistbandPiece(m.waistMM()));
    }
    return result;
}

double fabricEstimate(const BodyMeasurementsSnapshot& m, SkirtStyle style, SkirtLength length) {
    const double len = millimeters(length);
    double meters = 0;
    switch (style) {
        case SkirtStyle::ALine:
        case SkirtStyle::Straight: {
            const double hemWidth = m.hipMM() * (1 + hipEase) / 4 + flare(style);
            const double piecesPerWidth = hemWidth * 2 < 700 ? 2.0 : 1.0;
            meters = ((len * 2) / piecesPerWidth + 120) * 1.10 / 1000;
            break;
        }
        case SkirtStyle::Gathered: {
            const double panelWidth = m.waistMM() * (1 + waistEase) / 4 * gatherRatio * 2;
            const double piecesPerWidth = panelWidth < 700 ? 2.0 : 1.0;
            meters = ((len * 2) / piecesPerWidth + 120) * 1.10 / 1000;
            break;
        }
        case SkirtStyle::HalfCircle: {
            const double R = m.waistMM() * (1 + waistEase) / M_PI + len;
            meters = (R * 2 + 120) * 1.10 / 1000;
            break;
        }
    }
    return roundToPlaces(meters, 1);
}

std::vector<std::string> guide(SkirtStyle style) {
    std::vector<std::string> steps{
        "Print the pattern and check the 3 cm calibration square with a ruler before cutting anything.",
    };
    switch (style) {
        case SkirtStyle::ALine:
        case SkirtStyle::Straight:
            steps.insert(steps.end(), {
                "Fold your fabric and cut the front and back on the fold. Cut 2 waistband pieces, interface 1.",
                "Sew any darts first, pressing them toward the center.",
                "Stitch the side seams (1.5 cm seam allowance), leaving the top 20 cm of the left seam open for the zipper.",
                "Insert an invisible zipper in the left seam: install the zipper BEFORE closing the seam below it, then close the seam.",
                "Attach the interfaced waistband, right sides together, then fold and topstitch or hand-finish the inside.",
                "Try it on. Adjust side seams if needed, then finish the hem with a 2 cm double-fold.",
            });
            break;
        case SkirtStyle::Gathered:
            steps.insert(steps.end(), {
                "Cut front and back panels on the fold. Cut 2 waistband pieces, interface 1.",
                "Sew the side seams, leaving the top 20 cm of the left seam open for the zipper.",
                "Run two rows of long gathering stitches along the marked line at the top edge.",
                "Pull the bobbin threads and gather each panel until it matches the waistband length, distributing gathers evenly.",
                "Insert an invisible zipper in the left seam BEFORE closing the seam below it.",
                "Attach the interfaced waistband over the gathers, then finish the inside.",
                "Hem with a 2 cm double-fold.",
            });
            break;
        case SkirtStyle::HalfCircle:
            steps.insert(steps.end(), {
                "Cut 2 quarter-circle panels (flat, not on fold). Cut 2 waistband pieces, interface 1.",
                "Stitch the two side seams, leaving the top 20 cm of the left seam open for the zipper.",
                "Staystitch the curved waist edge so it doesn't stretch while you work.",
                "Insert an invisible zipper in the left seam BEFORE closing the seam below it.",
                "Attach the interfaced waistband.",
                "IMPORTANT: let the skirt hang for 24 hours before hemming — bias-cut areas drop, then trim the hem even and finish with a narrow 1 cm hem.",
            });
            break;
    }
    return steps;
}

DraftedPattern draft(const BodyMeasurementsSnapshot& m, SkirtStyle style, SkirtLength length) {
    DraftedPattern pattern;
    pattern.garment = std::string(title(style)) + " skirt";
    pattern.pieces = pieces(m, style, length, /*includeWaistband=*/true);
    pattern.fabricAdviceKey = "skirt";
    pattern.fabricMeters140 = fabricEstimate(m, style, length);
    pattern.guideSteps = guide(style);
    return pattern;
}

} // namespace SkirtBlock
} // namespace stitchu
