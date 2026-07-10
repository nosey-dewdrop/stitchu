#include "garment.hpp"

#include <cmath>

#include "skirt.hpp"
#include "sleeve.hpp"

namespace stitchu {

namespace {

std::string replaceBodice(const std::string& name) {
    std::string result = name;
    const std::string from = "Bodice";
    const auto pos = result.find(from);
    if (pos != std::string::npos) result.replace(pos, from.size(), "Top");
    return result;
}

// Extends a bodice half-piece below the waist: side seam flows out to the hip
// width, hem squares back to the center edge. The hem side sits at the SAME
// depth for front and back (measured from the shared side waist) so the side
// seams stay equal; the front's center hem keeps the balance drop.
PatternPiece extendPiece(const PatternPiece& piece, double sideWaistY, double centerWaistY, double extra, double hipWidth) {
    if (extra <= 0) {
        PatternPiece cropped = piece;
        cropped.name = replaceBodice(piece.name);
        return cropped;
    }
    PatternPiece result = piece;
    result.name = replaceBodice(piece.name);
    // A waist dart's legs must sit on a seam edge; once the piece extends past
    // the waist there is no edge there, so the top goes boxy.
    result.markings.clear();

    std::vector<PathCommand> commands;
    size_t index = 0;
    while (index < result.commands.size()) {
        const PathCommand& cmd = result.commands[index];
        if (cmd.type == CmdType::Line && std::fabs(cmd.to.y - (sideWaistY - 8)) < 0.5) {
            const Point hemSide{hipWidth, sideWaistY + extra - 10};
            const Point hemCenter{0, centerWaistY + extra};
            commands.push_back(PathCommand::curve(
                hemSide,
                {cmd.to.x, sideWaistY + extra * 0.35},
                {hipWidth, sideWaistY + extra * 0.7}));
            commands.push_back(PathCommand::curve(
                hemCenter,
                {hipWidth * 0.6, hemCenter.y},
                {hipWidth * 0.25, hemCenter.y}));
            index += 2;
            if (index < result.commands.size() &&
                result.commands[index].type == CmdType::Curve &&
                result.commands[index].to.y < sideWaistY) {
                commands.push_back(PathCommand::line({0, result.commands[index].to.y}));
                index += 1;
            }
            continue;
        }
        commands.push_back(cmd);
        index += 1;
    }
    result.commands = commands;
    return result;
}

} // namespace

namespace DressBlock {

DraftedPattern draft(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m) {
    const BodiceDraft bodice = BodiceBlock::draft(m, spec.neckline);
    // The skirt is drafted against the bodice's measured sewn waist so the
    // waist seam lengths agree exactly where the two join.
    const double bodiceSewnWaist = (bodice.frontSewnWaist + bodice.backSewnWaist) * 2;
    std::vector<PatternPiece> skirtPieces = SkirtBlock::pieces(
        m, spec.skirtStyle, spec.skirtLength, /*includeWaistband=*/false, bodiceSewnWaist);
    for (auto& piece : skirtPieces) {
        const std::string original = piece.name;
        piece.name = "Skirt " + original;
        // The invisible zipper continues from the bodice center back into the
        // skirt, so the skirt back needs a CB seam (no fold).
        if (original == "Back") {
            piece.cutInstruction = "cut 2 (center back seam)";
        }
    }
    const std::vector<PatternPiece> sleeves = SleeveBlock::draft(
        m, spec.sleeveStyle, spec.sleeveLength, bodice.armholeLength, bodice.armholeDepth);

    double meters = SkirtBlock::fabricEstimate(m, spec.skirtStyle, spec.skirtLength) + 0.7;
    if (!sleeves.empty()) meters += spec.sleeveLength == SleeveLength::Long ? 0.7 : 0.4;

    const bool sleeveless = sleeves.empty();
    std::vector<std::string> steps{
        "Print and check the 3 cm calibration square before cutting.",
        std::string("This block uses standard assumptions for shoulder slope, underbust") +
            (sleeveless ? "" : " and arm width") +
            " — sew a quick muslin (test version) from cheap fabric first and adjust before cutting your real fabric.",
        std::string("Cut bodice front on fold, bodice back twice, skirt pieces as labelled") +
            (sleeveless ? "" : ", sleeves twice") + ".",
        "Sew all darts first, pressing toward the center.",
        "Sew bodice shoulder and side seams.",
    };
    if (sleeveless) {
        steps.push_back("Finish armholes with bias binding (sleeveless).");
    }
    if (spec.skirtStyle == SkirtStyle::Gathered) {
        steps.push_back("Gather the skirt panels along the marked line until they match the bodice waist.");
    }
    if (spec.skirtStyle == SkirtStyle::HalfCircle) {
        steps.push_back("Place the two skirt panel seams at center front and center back (cut the panels flat, not on fold) so the zipper can continue into the back seam.");
    }
    steps.push_back("Sew the skirt seams (leave the center back seam open where the zipper will go), then join bodice to skirt at the waist seam, matching side seams.");
    steps.push_back("Insert an invisible zipper in the center back through bodice and skirt: install the zipper BEFORE closing the seam below it, then close the rest of the seam.");
    if (!sleeveless) {
        steps.push_back("Sew each sleeve seam. Run gathering stitches between the cap notches, ease the cap into the armhole and set the sleeves in.");
        if (spec.sleeveStyle == SleeveStyle::Balloon) {
            steps.push_back("Gather the sleeve hem along the marked line and attach the interfaced cuffs.");
        }
    }
    if (spec.skirtStyle == SkirtStyle::HalfCircle) {
        steps.push_back("Let the dress hang for 24 hours before hemming — bias areas drop. Then trim even and hem narrow.");
    } else {
        steps.push_back("Try it on, then hem with a 2 cm double fold.");
    }

    const std::string sleeveWord =
        spec.sleeveStyle == SleeveStyle::None ? "" : std::string(title(spec.sleeveStyle)) + "-sleeve ";

    DraftedPattern pattern;
    pattern.garment = std::string(title(spec.skirtStyle)) + " " + sleeveWord + "dress";
    pattern.pieces = {bodice.front, bodice.back};
    pattern.pieces.insert(pattern.pieces.end(), skirtPieces.begin(), skirtPieces.end());
    pattern.pieces.insert(pattern.pieces.end(), sleeves.begin(), sleeves.end());
    pattern.fabricAdviceKey = "dress";
    pattern.fabricMeters140 = roundToPlaces(meters, 1);
    pattern.guideSteps = steps;
    return pattern;
}

} // namespace DressBlock

namespace TopBlock {

DraftedPattern draft(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m) {
    const BodiceDraft bodice = BodiceBlock::draft(m, spec.neckline);
    const double extra = belowWaist(spec.topLength);
    const double hipHalfQuarter = (m.hipMM() / 4) * 1.04;

    const PatternPiece front = extendPiece(bodice.front, bodice.sideWaistY, bodice.frontLength, extra, hipHalfQuarter);
    const PatternPiece back = extendPiece(bodice.back, bodice.sideWaistY, bodice.backLength, extra, hipHalfQuarter);
    const std::vector<PatternPiece> sleeves = SleeveBlock::draft(
        m, spec.sleeveStyle, spec.sleeveLength, bodice.armholeLength, bodice.armholeDepth);

    double meters = (bodice.frontLength + extra) * 2 * 1.15 / 1000;
    if (!sleeves.empty()) meters += spec.sleeveLength == SleeveLength::Long ? 0.7 : 0.4;

    const bool sleeveless = sleeves.empty();
    std::vector<std::string> steps{
        "Print and check the 3 cm calibration square before cutting.",
        "This block uses standard assumptions for shoulder slope and underbust — sew a quick muslin first and adjust before cutting your real fabric.",
        std::string("Cut front on fold, back twice (or on fold if it slips over your head — check the neck opening against your head circumference)") +
            (sleeveless ? "" : ", sleeves twice") + ".",
    };
    if (extra == 0) {
        steps.push_back("Sew the waist darts, pressing toward the center.");
    }
    steps.push_back("Sew shoulder seams, then side seams.");
    steps.push_back("Finish the neckline with bias binding.");
    if (sleeveless) {
        steps.push_back("Finish the armholes with bias binding.");
    } else {
        steps.push_back("Sew each sleeve seam, ease the cap between the notches and set the sleeves in.");
        if (spec.sleeveStyle == SleeveStyle::Balloon) {
            steps.push_back("Gather the sleeve hem along the marked line and attach the interfaced cuffs.");
        }
    }
    steps.push_back("Hem with a 2 cm double fold.");

    const std::string sleeveWord =
        spec.sleeveStyle == SleeveStyle::None ? "" : std::string(" ") + title(spec.sleeveStyle) + "-sleeve";

    DraftedPattern pattern;
    pattern.garment = std::string(raw(spec.topLength)) + sleeveWord + " top";
    pattern.pieces = {front, back};
    pattern.pieces.insert(pattern.pieces.end(), sleeves.begin(), sleeves.end());
    pattern.fabricAdviceKey = "top";
    pattern.fabricMeters140 = roundToPlaces(meters, 1);
    pattern.guideSteps = steps;
    return pattern;
}

} // namespace TopBlock

namespace GarmentDrafter {

DraftedPattern draft(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m) {
    switch (spec.garment) {
        case GarmentType::Skirt:
            return SkirtBlock::draft(m, spec.skirtStyle, spec.skirtLength);
        case GarmentType::Dress:
            return DressBlock::draft(spec, m);
        case GarmentType::Top:
            return TopBlock::draft(spec, m);
    }
    return {};
}

} // namespace GarmentDrafter

} // namespace stitchu
