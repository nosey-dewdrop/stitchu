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
        case SkirtStyle::HalfCircle:
        case SkirtStyle::Pleated: return 0;
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
    double dartLength,
    double hipDepthMM
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
    const Point hipPoint{hipQuarter, hipDepthMM};
    const Point hemSide{hemX, length - hemSideRise};
    const Point hemCenter{0, length};

    const std::vector<PathCommand> commands{
        PathCommand::move(centerWaist),
        PathCommand::curve(sideWaist,
                           {waistlineWidth * 0.45, 0},
                           {waistlineWidth * 0.8, -sideWaistRise * 0.8}),
        PathCommand::curve(hipPoint,
                           {waistlineWidth + (hipQuarter - waistlineWidth) * 0.6, hipDepthMM * 0.3 - sideWaistRise},
                           {hipQuarter, hipDepthMM * 0.65}),
        PathCommand::line(hemSide),
        PathCommand::curve(hemCenter,
                           {hemX * 0.6, length},
                           {hemX * 0.3, length}),
        PathCommand::line(centerWaist),
        PathCommand::close(),
    };

    std::vector<PathCommand> markings;
    // A single waist dart wider than ~30 mm CONES over the hip (Aldrich): it
    // makes a point instead of a smooth curve. Split any intake above the cap
    // into TWO darts, each carrying half — one nearer center front, one nearer
    // the side. The side dart is drafted a little shorter (it sits over the
    // higher hip curve), per standard skirt-block practice.
    auto oneDart = [&](double centerX, double width, double length) {
        const double legY = -sideWaistRise * (centerX / waistlineWidth) * 0.5;
        markings.push_back(PathCommand::move({centerX - width / 2, legY}));
        markings.push_back(PathCommand::line({centerX, length}));
        markings.push_back(PathCommand::line({centerX + width / 2, legY}));
    };
    if (dartWidth > 0) {
        if (dartWidth > maxSingleDart) {
            // Two darts at 1/3 and 2/3 of the waist span, splitting the intake.
            const double each = dartWidth / 2;
            oneDart(waistlineWidth / 3, each, dartLength);
            oneDart(waistlineWidth * 2 / 3, each, dartLength * 0.82);
        } else {
            oneDart(waistlineWidth / 2, dartWidth, dartLength);
        }
    }

    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction = "cut 1 on fold";
    piece.commands = commands;
    piece.markings = markings;
    piece.hasGrainline = true;
    piece.grainline = Grainline{{40, hipDepthMM}, {40, length - 60}};
    piece.seamAllowance = constants::kSeamAllowanceMM;
    return piece;
}

// Extra width each gore panel gains at the hem (per edge). A-line gores flare
// like the side seam does; straight skirts keep the seam vertical.
double goreFlare(SkirtStyle style) {
    return style == SkirtStyle::ALine ? 40 : 0;
}

// Princess/gore version of draftQuarter: the waist dart becomes a seam from
// the waist through the old dart tip straight down to the hem, splitting the
// quarter into a center and a side panel. Falls back to the plain quarter
// when the intake is too small to be worth a seam.
std::vector<PatternPiece> goreQuarter(
    const std::string& baseName,
    double waistQuarter,
    double hipQuarter,
    double length,
    SkirtStyle style,
    double dartLength,
    double hipDepthMM,
    double seamArcTarget = 0 // >0: put the gore seam at this arc from the center edge
) {
    const double suppression = std::max(0.0, hipQuarter - waistQuarter);
    double sideTake = std::min(suppression * 0.6, maxSideTake);
    double dartWidth = suppression - sideTake;
    if (dartWidth < minDartWidth) {
        return {draftQuarter(baseName, waistQuarter, hipQuarter, length, style, dartLength, hipDepthMM)};
    }

    const double waistlineWidth = waistQuarter + dartWidth;
    const double sideWaistRise = 12;
    const double flareOut = flare(style);
    const double hemX = hipQuarter + flareOut;
    const double hemSideRise = flareOut > 0 ? 18 : 0;

    const Point centerWaist{0, 0};
    const Point sideWaist{waistlineWidth, -sideWaistRise};
    const Point hipPoint{hipQuarter, hipDepthMM};
    const Point hemSide{hemX, length - hemSideRise};
    const Point hemCenter{0, length};

    const PathCommand waistCurve = PathCommand::curve(
        sideWaist,
        {waistlineWidth * 0.45, 0},
        {waistlineWidth * 0.8, -sideWaistRise * 0.8});

    // Gore seam position: centered by default; a dress passes the bodice's
    // princess-seam arc so the two seams line up when the waist is sewn.
    double legAX = waistlineWidth / 2 - dartWidth / 2;
    if (seamArcTarget > 0) {
        // walk the waist curve until the sewn arc reaches the target
        const auto samples = flattenCubic(centerWaist, waistCurve.to, waistCurve.cp1, waistCurve.cp2, 64);
        double arc = 0;
        Point prev = centerWaist;
        for (const Point& q : samples) {
            const double step = distance(prev, q);
            if (arc + step >= seamArcTarget) { legAX = prev.x + (q.x - prev.x) * ((seamArcTarget - arc) / std::max(step, 1e-6)); break; }
            arc += step;
            prev = q;
            legAX = q.x;
        }
        legAX = std::min(std::max(legAX, 15.0), waistlineWidth - dartWidth - 15.0);
    }
    const double cx = legAX + dartWidth / 2;
    const CubicSplit waistAtA = splitCubic(centerWaist, waistCurve, cubicTForX(centerWaist, waistCurve, legAX));
    const CubicSplit waistAtB = splitCubic(centerWaist, waistCurve, cubicTForX(centerWaist, waistCurve, legAX + dartWidth));
    const Point legA = waistAtA.at;
    const Point legB = waistAtB.at;
    const Point tip{cx, dartLength};
    const double gf = goreFlare(style);
    const Point goreHemCenter{cx + gf, length};
    const Point goreHemSide{cx - gf, length};

    // True the gore seam: the waist rises toward the side, so the raw side
    // edge would come up short against the center edge. Drop the side panel's
    // waist end until both edges measure the same and re-blend its curve.
    const double targetLegLen = distance(tip, legA);
    const double legDrop = std::sqrt(std::max(0.0, targetLegLen * targetLegLen - (dartWidth / 2) * (dartWidth / 2)));
    const Point legBTrued{legB.x, tip.y - legDrop};
    PathCommand sideWaistEdge = waistAtB.second; // legB -> sideWaist
    // The start point lives in the preceding move; keep the departure tangent.
    sideWaistEdge.cp1.y += legBTrued.y - legB.y;

    // ---- center panel ----
    PatternPiece center;
    center.name = "Center " + baseName;
    center.cutInstruction = "cut 1 on fold";
    center.commands = {
        PathCommand::move(centerWaist),
        waistAtA.first,               // waist: center -> legA
        PathCommand::line(tip),       // gore seam upper (old dart leg)
        PathCommand::line(goreHemCenter),
        PathCommand::line(hemCenter),
        PathCommand::line(centerWaist),
        PathCommand::close(),
    };
    center.markings = {PathCommand::move(tip), PathCommand::line({tip.x - 12, tip.y + 4})};
    center.hasGrainline = true;
    center.grainline = Grainline{{40, hipDepthMM}, {40, length - 60}};
    center.seamAllowance = constants::kSeamAllowanceMM;

    // ---- side panel ----
    PatternPiece side;
    side.name = "Side " + baseName;
    side.cutInstruction = "cut 2";
    const double hemT = goreHemSide.x;
    side.commands = {
        PathCommand::move(legBTrued),
        sideWaistEdge,                // waist: legB (trued) -> side
        PathCommand::curve(hipPoint,
                           {waistlineWidth + (hipQuarter - waistlineWidth) * 0.6, hipDepthMM * 0.3 - sideWaistRise},
                           {hipQuarter, hipDepthMM * 0.65}),
        PathCommand::line(hemSide),
        PathCommand::curve(goreHemSide,
                           {hemT + (hemX - hemT) * 0.6, length},
                           {hemT + (hemX - hemT) * 0.3, length}),
        PathCommand::line(tip),
        PathCommand::line(legBTrued),
        PathCommand::close(),
    };
    side.markings = {PathCommand::move(tip), PathCommand::line({tip.x + 12, tip.y + 4})};
    side.hasGrainline = true;
    const double grainX = (legB.x + hipQuarter) / 2;
    side.grainline = Grainline{{grainX, hipDepthMM + 10}, {grainX, length - 60}};
    side.seamAllowance = constants::kSeamAllowanceMM;
    const Rect sideBox = boundingBox(side.commands);
    translatePiece(side, -sideBox.x, -sideBox.y);

    return {center, side};
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
    piece.seamAllowance = constants::kSeamAllowanceMM;
    return piece;
}

// Knife-pleated skirt: a rectangle 3x the sewn width. Markings are the pleat
// lines for the top 140 mm: fold on the solid pair's SECOND line, bring it to
// the FIRST (the guide explains the direction); pleats are basted, then the
// panel behaves like a straight panel.
PatternPiece pleatedPanel(double waistQuarter, double length) {
    const int pleats = std::max(3, static_cast<int>(std::lround(waistQuarter / 55.0)));
    const double face = waistQuarter / pleats;
    const double width = waistQuarter * pleatRatio;
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
    const double markDepth = 140;
    for (int i = 0; i < pleats; ++i) {
        const double unit = i * face * 3;
        piece.markings.push_back(PathCommand::move({unit, 0}));
        piece.markings.push_back(PathCommand::line({unit, markDepth}));
        piece.markings.push_back(PathCommand::move({unit + face * 2, 0}));
        piece.markings.push_back(PathCommand::line({unit + face * 2, markDepth}));
    }
    piece.hasGrainline = true;
    piece.grainline = Grainline{{width - 50, 80}, {width - 50, length - 80}};
    piece.seamAllowance = constants::kSeamAllowanceMM;
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
    piece.seamAllowance = constants::kSeamAllowanceMM;
    return piece;
}

} // namespace

PatternPiece waistbandPiece(double waistMM, Fabric fabric) {
    const double bandLength = waistMM * (1 + waistEaseFor(fabric)) / 2 + 30; // half band (cut 2) + button stand
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
    piece.seamAllowance = constants::kSeamAllowanceBandMM;
    return piece;
}

std::vector<PatternPiece> pieces(
    const BodyMeasurementsSnapshot& m,
    SkirtStyle style,
    SkirtLength length,
    bool includeWaistband,
    std::optional<double> targetWaistMM,
    Shaping shaping,
    Fabric fabric,
    double lengthExtraMM,
    const SkirtJoin* join
) {
    const double fullWaist = targetWaistMM.value_or(m.waistMM() * (1 + waistEaseFor(fabric)));
    const double waistQuarter = fullWaist / 4;
    // The skirt must pass over the waist: for waist > hip bodies the widest
    // drafting line is the waist itself.
    const double hipQuarter = std::max(m.hipMM() * (1 + hipEaseFor(fabric)) / 4, waistQuarter);
    // Empire dresses: the seam sits higher, so the skirt runs longer and the
    // hip line sits deeper below the seam.
    const double len = millimeters(length) + lengthExtraMM;
    const double hipDepthMM = hipDepth + lengthExtraMM;

    std::vector<PatternPiece> result;
    switch (style) {
        case SkirtStyle::ALine:
        case SkirtStyle::Straight:
            if (shaping == Shaping::Princess) {
                // With a join, each quarter matches ITS bodice half exactly and
                // the gore seam sits where the princess seam lands.
                const double fq = join ? join->frontQuarterWaist : waistQuarter;
                const double bq = join ? join->backQuarterWaist : waistQuarter;
                const double fArc = join ? join->frontSeamArc : 0;
                const double bArc = join ? join->backSeamArc : 0;
                const double fHip = std::max(m.hipMM() * (1 + hipEaseFor(fabric)) / 4, fq);
                const double bHip = std::max(m.hipMM() * (1 + hipEaseFor(fabric)) / 4, bq);
                for (auto& piece : goreQuarter("Front", fq, fHip, len, style, 90, hipDepthMM, fArc)) result.push_back(piece);
                for (auto& piece : goreQuarter("Back", bq, bHip, len, style, 130, hipDepthMM, bArc)) result.push_back(piece);
            } else {
                result.push_back(draftQuarter("Front", waistQuarter, hipQuarter, len, style, 90, hipDepthMM));
                result.push_back(draftQuarter("Back", waistQuarter, hipQuarter, len, style, 130, hipDepthMM));
            }
            break;
        case SkirtStyle::Gathered: {
            PatternPiece panel = gatheredPanel(waistQuarter, len);
            PatternPiece back = panel;
            back.name = "Back";
            result.push_back(panel);
            result.push_back(back);
            break;
        }
        case SkirtStyle::Pleated: {
            PatternPiece panel = pleatedPanel(waistQuarter, len);
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
        result.push_back(waistbandPiece(m.waistMM(), fabric));
    }
    return result;
}

double fabricEstimate(const BodyMeasurementsSnapshot& m, SkirtStyle style, SkirtLength length,
                      Shaping shaping, Fabric fabric, double lengthExtraMM) {
    const double len = millimeters(length) + lengthExtraMM;
    double meters = 0;
    switch (style) {
        case SkirtStyle::ALine:
        case SkirtStyle::Straight: {
            const double hemWidth = m.hipMM() * (1 + hipEaseFor(fabric)) / 4 + flare(style) +
                                    (shaping == Shaping::Princess ? 2 * goreFlare(style) : 0);
            const double piecesPerWidth = hemWidth * 2 < 700 ? 2.0 : 1.0;
            meters = ((len * 2) / piecesPerWidth + 120) * 1.10 / 1000;
            break;
        }
        case SkirtStyle::Gathered: {
            const double panelWidth = m.waistMM() * (1 + waistEaseFor(fabric)) / 4 * gatherRatio * 2;
            const double piecesPerWidth = panelWidth < 700 ? 2.0 : 1.0;
            meters = ((len * 2) / piecesPerWidth + 120) * 1.10 / 1000;
            break;
        }
        case SkirtStyle::Pleated: {
            const double panelWidth = m.waistMM() * (1 + waistEaseFor(fabric)) / 4 * pleatRatio * 2;
            const double piecesPerWidth = panelWidth < 700 ? 2.0 : 1.0;
            meters = ((len * 2) / piecesPerWidth + 120) * 1.10 / 1000;
            break;
        }
        case SkirtStyle::HalfCircle: {
            const double R = m.waistMM() * (1 + waistEaseFor(fabric)) / M_PI + len;
            meters = (R * 2 + 120) * 1.10 / 1000;
            break;
        }
    }
    return roundToPlaces(meters, 1);
}

double hemCircumferenceMM(const BodyMeasurementsSnapshot& m, SkirtStyle style, SkirtLength length,
                          Shaping shaping, Fabric fabric, double lengthExtraMM) {
    const double len = millimeters(length) + lengthExtraMM;
    switch (style) {
        case SkirtStyle::ALine:
        case SkirtStyle::Straight: {
            // quarter hem width (mirrors fabricEstimate) x 4 quarters
            const double hemQuarter = m.hipMM() * (1 + hipEaseFor(fabric)) / 4 + flare(style) +
                                      (shaping == Shaping::Princess ? 2 * goreFlare(style) : 0);
            return hemQuarter * 4;
        }
        case SkirtStyle::Gathered:
            return m.waistMM() * (1 + waistEaseFor(fabric)) / 4 * gatherRatio * 4;
        case SkirtStyle::Pleated:
            return m.waistMM() * (1 + waistEaseFor(fabric)) / 4 * pleatRatio * 4;
        case SkirtStyle::HalfCircle: {
            const double R = m.waistMM() * (1 + waistEaseFor(fabric)) / M_PI + len;
            return M_PI * R; // half-circle hem is the outer arc
        }
    }
    return 0;
}

std::vector<std::string> guide(SkirtStyle style, Shaping shaping, Fabric fabric) {
    std::vector<std::string> steps{
        "Print the pattern and check the 3 cm calibration square with a ruler before cutting anything.",
    };
    if (fabric == Fabric::Knit) {
        steps.push_back("Knit fabric: sew with a narrow zigzag or stretch stitch and a ballpoint/stretch needle so the seams stretch with the fabric.");
    }
    switch (style) {
        case SkirtStyle::ALine:
        case SkirtStyle::Straight:
            if (shaping == Shaping::Princess) {
                steps.insert(steps.end(), {
                    "Cut the panels as labelled: center panels on the fold, side panels twice. Cut 2 waistband pieces, interface 1.",
                    "Sew each gore seam (center panel to its side panel), matching the notch at the seam tip. Press the seams toward the center.",
                    "Stitch the side seams (1.5 cm seam allowance), leaving the top 20 cm of the left seam open for the zipper.",
                    "Insert an invisible zipper in the left seam: install the zipper BEFORE closing the seam below it, then close the seam.",
                    "Attach the interfaced waistband, right sides together, then fold and topstitch or hand-finish the inside.",
                    "Try it on. Adjust side seams if needed, then finish the hem with a 2 cm double-fold.",
                });
            } else {
                steps.insert(steps.end(), {
                    "Fold your fabric and cut the front and back on the fold. Cut 2 waistband pieces, interface 1.",
                    "Sew any darts first, pressing them toward the center.",
                    "Stitch the side seams (1.5 cm seam allowance), leaving the top 20 cm of the left seam open for the zipper.",
                    "Insert an invisible zipper in the left seam: install the zipper BEFORE closing the seam below it, then close the seam.",
                    "Attach the interfaced waistband, right sides together, then fold and topstitch or hand-finish the inside.",
                    "Try it on. Adjust side seams if needed, then finish the hem with a 2 cm double-fold.",
                });
            }
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
        case SkirtStyle::Pleated:
            steps.insert(steps.end(), {
                "Cut front and back panels on the fold. Cut 2 waistband pieces, interface 1.",
                "Form the knife pleats along the marked line pairs: fold the fabric on the SECOND line of each pair and bring the fold to the FIRST line, all pleats facing the same direction (toward the center). Pin as you go.",
                "Baste across the top of the pleats inside the seam allowance, then press the folds sharply through the marked depth.",
                "Sew the side seams, leaving the top 20 cm of the left seam open for the zipper.",
                "Insert an invisible zipper in the left seam BEFORE closing the seam below it.",
                "Attach the interfaced waistband over the basted pleats, then finish the inside.",
                "Hem with a 2 cm double-fold, then press the pleat creases again from hip to hem if you want sharp pleats all the way down.",
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

DraftedPattern draft(const BodyMeasurementsSnapshot& m, SkirtStyle style, SkirtLength length,
                     Shaping shaping, Fabric fabric) {
    DraftedPattern pattern;
    pattern.garment = std::string(title(style)) + " skirt";
    pattern.pieces = pieces(m, style, length, /*includeWaistband=*/true, std::nullopt, shaping, fabric);
    pattern.fabricAdviceKey = "skirt";
    pattern.fabricMeters140 = fabricEstimate(m, style, length, shaping, fabric);
    // The guide derives from what was DRAFTED, not from what was requested: on
    // a body with no waist-to-hip shaping the princess gore split resolves to
    // plain panels, and a guide sewing gore seams that don't exist is a lie
    // (found by the guideCoverage gate, 2026-07-18).
    bool goreSplit = false;
    for (const auto& piece : pattern.pieces)
        if (piece.name.find("Center ") != std::string::npos) goreSplit = true;
    pattern.guideSteps = guide(style, goreSplit ? Shaping::Princess : Shaping::Dart, fabric);
    if (shaping == Shaping::Princess && !goreSplit) {
        pattern.guideSteps.insert(pattern.guideSteps.begin() + 1,
            "Princess gore seams were requested, but this body has no waist-to-hip shaping to split over — the skirt is drafted as clean single panels instead (nothing was skipped that the fit needs).");
    }
    return pattern;
}

} // namespace SkirtBlock
} // namespace stitchu
