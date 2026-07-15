#include "garment.hpp"

#include <cmath>

#include "keyhole.hpp"
#include "placket.hpp"
#include "ruffle.hpp"
#include "skirt.hpp"
#include "sleeve.hpp"
#include "tie.hpp"

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
    BodiceBlock::BodiceOptions options;
    options.neckline = spec.neckline;
    options.shaping = spec.shaping;
    options.waistline = spec.waistline;
    options.fabric = spec.fabric;
    const BodiceDraft bodice = BodiceBlock::draft(m, options);
    const bool empire = spec.waistline == Waistline::Empire;
    // Empire: the seam sits above the natural waist, so the skirt makes up
    // the difference to keep the hem where the chosen length puts it.
    const double skirtExtra = std::max(0.0, m.backLengthMM() - bodice.waistSeamY);
    // The skirt is drafted against the bodice's measured sewn waist so the
    // waist seam lengths agree exactly where the two join. Princess mode goes
    // further: each quarter matches its bodice half and the gore seam is
    // placed at the princess seam's arc, so the seams MEET when sewn.
    const double bodiceSewnWaist = (bodice.frontSewnWaist + bodice.backSewnWaist) * 2;
    SkirtBlock::SkirtJoin join;
    join.frontQuarterWaist = bodice.frontSewnWaist;
    join.backQuarterWaist = bodice.backSewnWaist;
    join.frontSeamArc = bodice.frontPrincess ? bodice.frontWaistCenterArc : 0;
    join.backSeamArc = bodice.backPrincess ? bodice.backWaistCenterArc : 0;
    const bool useJoin = spec.shaping == Shaping::Princess;
    std::vector<PatternPiece> skirtPieces = SkirtBlock::pieces(
        m, spec.skirtStyle, spec.skirtLength, /*includeWaistband=*/false, bodiceSewnWaist,
        spec.shaping, spec.fabric, skirtExtra, useJoin ? &join : nullptr);
    for (auto& piece : skirtPieces) {
        const std::string original = piece.name;
        // Half-circle panels already carry the word; avoid "Skirt Skirt Panel".
        if (original.rfind("Skirt", 0) != 0) piece.name = "Skirt " + original;
        // The invisible zipper continues from the bodice center back into the
        // skirt, so the skirt back needs a CB seam (no fold).
        if (original == "Back" || original == "Center Back") {
            piece.cutInstruction = "cut 2 (center back seam)";
        }
    }
    // Halter: shoulders bare by construction — sleeves are impossible, and one
    // bias strip binds every raw edge instead of the neck facings.
    const bool halter = spec.neckline == Neckline::Halter;
    const std::vector<PatternPiece> facings = halter
        ? std::vector<PatternPiece>{BodiceBlock::halterBinding(bodice.halterBindingEdgeMM)}
        : BodiceBlock::neckFacings(m, spec.neckline, "cut 1 on fold, interface", "cut 2, interface");
    const std::vector<PatternPiece> sleeves = SleeveBlock::draft(
        m, halter ? SleeveStyle::None : spec.sleeveStyle, spec.sleeveLength,
        bodice.armholeLength, bodice.armholeDepth, spec.fabric, spec.sleeveCap);

    double meters = SkirtBlock::fabricEstimate(m, spec.skirtStyle, spec.skirtLength, spec.shaping, spec.fabric, skirtExtra) + 0.7 + BodiceBlock::facingFabricMeters;
    if (!sleeves.empty()) meters += spec.sleeveLength == SleeveLength::Long ? 0.7 : 0.4;

    const bool sleeveless = sleeves.empty();
    const bool princess = bodice.frontPrincess || bodice.backPrincess;
    std::vector<std::string> steps{
        "Print and check the 3 cm calibration square before cutting.",
        std::string("This block uses standard assumptions for shoulder slope, underbust") +
            (sleeveless ? "" : " and arm width") +
            " — sew a quick muslin (test version) from cheap fabric first and adjust before cutting your real fabric.",
        std::string("Cut every piece as labelled: pieces marked 'on fold' on the fabric fold, 'cut 2' twice") +
            (sleeveless ? "" : ", sleeves twice") + ".",
    };
    if (halter) {
        if (spec.sleeveStyle != SleeveStyle::None) {
            steps.push_back("A halter has no shoulders to hang a sleeve from — the sleeve choice was skipped.");
        }
        steps.push_back("Staystitch the neckline, the strap edges and the back top edge just inside the seam line — every one of these is a bias-ish raw edge that stretches if you look at it wrong.");
    } else {
        steps.push_back("Fuse interfacing to the neck facings.");
        steps.push_back("Staystitch the neckline just inside the seam line so it doesn't stretch while you work.");
    }
    if (spec.fabric == Fabric::Knit) {
        steps.insert(steps.begin() + 2,
            "Knit fabric: sew with a narrow zigzag or stretch stitch and a ballpoint/stretch needle so the seams stretch with the fabric.");
    }
    if (princess) {
        steps.push_back("Staystitch the curved princess edges too, for the same reason.");
        steps.push_back("Sew each bodice princess seam: pin center panel to side panel matching the bust notch, sew, clip the side panel's curve over the bust inside the seam allowance, press toward the center.");
        if (!bodice.frontPrincess || !bodice.backPrincess) {
            steps.push_back("Sew the remaining waist darts (where a panel wasn't split), pressing toward the center.");
        }
    } else {
        steps.push_back("Sew all darts first, pressing toward the center.");
    }
    if (halter) {
        // No shoulder seams; one bias strip binds neckline, straps, sweep and
        // back top edge. Ends stay free at the CB for the zipper, like facings.
        steps.push_back("Sew the bodice side seams.");
        steps.push_back("Sew the bias strip ends together as needed and press it in half lengthwise along the marked fold line.");
        steps.push_back("Bind the raw edges with the bias strip in one continuous run where you can — up one strap, around the neckline, up the other strap, then each underarm sweep and the back top edge — leaving the last 2 cm free at each center back edge (the zipper goes there later). Stretch the binding VERY slightly on the inner curves so it lies flat; trim the excess as you go.");
        steps.push_back("Run a stay tape or clear elastic inside the back top edge binding so the low back hugs the body instead of gaping.");
        steps.push_back("Close the straps at the nape: try the dress on, pin the strap ends to length, then sew hooks (or a button) — or extend the binding into ties if you prefer a tied halter.");
    } else {
        steps.push_back("Sew the bodice shoulder seams and press them open.");
        steps.push_back("Sew the front and back neck facings together at the shoulders; finish the facing's outer edge (zigzag, overlock or turn 5 mm and stitch).");
        steps.push_back("Attach the facing to the neckline right sides together, leaving the last 2 cm free at each center back edge (the zipper goes there later). Trim to 6 mm, clip into the curve every 2 cm.");
        steps.push_back("Understitch: press the seam allowance toward the facing and stitch it to the facing 2 mm from the seam — this keeps the facing rolled inside. Turn, press, tack at the shoulder seams.");
        steps.push_back("Sew the bodice side seams.");
        if (sleeveless) {
            steps.push_back("Finish armholes with bias binding (sleeveless).");
        }
    }
    if (spec.skirtStyle == SkirtStyle::Gathered) {
        steps.push_back("Gather the skirt panels along the marked line until they match the bodice waist.");
    }
    if (spec.skirtStyle == SkirtStyle::Pleated) {
        steps.push_back("Form the knife pleats along the marked line pairs (fold on the second line of each pair, bring it to the first, all pleats toward the center), baste across the top and press.");
    }
    if (spec.skirtStyle == SkirtStyle::HalfCircle) {
        steps.push_back("Place the two skirt panel seams at center front and center back (cut the panels flat, not on fold) so the zipper can continue into the back seam.");
    }
    if (princess && (spec.skirtStyle == SkirtStyle::ALine || spec.skirtStyle == SkirtStyle::Straight)) {
        steps.push_back("Sew each skirt gore seam (center panel to side panel, matching the tip notch), pressing toward the center.");
    }
    steps.push_back(std::string("Sew the skirt seams (leave the center back seam open where the zipper will go), then join bodice to skirt at the ") +
        (empire ? "underbust seam (the empire line sits right under the bust)" : "waist seam") + ", matching side seams" +
        std::string(princess ? " and lining the gore seams up with the bodice princess seams as closely as possible" : "") + ".");
    steps.push_back(std::string("Insert an invisible zipper in the center back through bodice and skirt: install the zipper BEFORE closing the seam below it, then close the rest of the seam.") +
        (spec.fabric == Fabric::Knit ? " (Very stretchy knit? Baste the back seam closed first and test pulling the dress on — you may be able to skip the zipper and just sew the seam.)" : ""));
    steps.push_back(std::string("Fold the free ") + (halter ? "binding" : "facing") +
        " ends back over the zipper tape and hand-tack them down so the edge sits clean against the zipper.");
    if (!sleeveless) {
        steps.push_back("Sew each sleeve seam. Run gathering stitches between the cap notches, ease the cap into the armhole and set the sleeves in.");
        if (spec.sleeveCap != SleeveCap::Plain) {
            steps.push_back(std::string("Puff/gathered head: run two rows of gathering along the marked crown line between the two crown notches, then pull them up to fit the armhole between those notches so the extra fullness ") +
                (spec.sleeveCap == SleeveCap::Puffed ? "stands up over the shoulder" : "sits as a soft gather") + " — the length below the notches matches the armhole 1:1, so ease only the crown.");
        }
        if (spec.sleeveStyle == SleeveStyle::Balloon) {
            steps.push_back("Gather the sleeve hem along the marked line and attach the interfaced cuffs.");
        }
    }
    if (spec.skirtStyle == SkirtStyle::HalfCircle) {
        steps.push_back("Let the dress hang for 24 hours before hemming — bias areas drop. Then trim even and hem narrow.");
    } else {
        steps.push_back("Try it on, then hem with a 2 cm double fold.");
    }

    const std::string sleeveWord = halter
        ? "halter "
        : (spec.sleeveStyle == SleeveStyle::None ? "" : std::string(title(spec.sleeveStyle)) + "-sleeve ");

    DraftedPattern pattern;
    pattern.garment = empire
        ? (spec.skirtStyle == SkirtStyle::Gathered
               ? sleeveWord + "babydoll dress"
               : "empire " + std::string(title(spec.skirtStyle)) + " " + sleeveWord + "dress")
        : std::string(title(spec.skirtStyle)) + " " + sleeveWord + "dress";
    pattern.pieces = {bodice.front};
    if (bodice.frontPrincess) pattern.pieces.push_back(bodice.frontSide);
    pattern.pieces.push_back(bodice.back);
    if (bodice.backPrincess) pattern.pieces.push_back(bodice.backSide);
    pattern.pieces.insert(pattern.pieces.end(), facings.begin(), facings.end());
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
    const double extra = belowWaist(spec.topLength);
    const double hipHalfQuarter = (m.hipMM() / 4) * 1.04;
    // Princess panels extend through the waist inside the bodice block and
    // stay fitted; dart-mode pieces use the classic (boxy) hem extension.
    BodiceBlock::BodiceOptions options;
    options.neckline = spec.neckline;
    options.shaping = spec.shaping;
    options.fabric = spec.fabric;
    options.extendBelowWaist = extra;
    options.hipHalfQuarter = hipHalfQuarter;
    const BodiceDraft bodice = BodiceBlock::draft(m, options);

    std::vector<PatternPiece> tops;
    if (bodice.frontPrincess) {
        PatternPiece center = bodice.front;
        center.name = replaceBodice(center.name);
        PatternPiece side = bodice.frontSide;
        side.name = replaceBodice(side.name);
        tops.push_back(center);
        tops.push_back(side);
    } else {
        tops.push_back(extendPiece(bodice.front, bodice.frontPieceWaistY, bodice.frontPieceLength, extra, hipHalfQuarter));
    }
    if (bodice.backPrincess) {
        PatternPiece center = bodice.back;
        center.name = replaceBodice(center.name);
        PatternPiece side = bodice.backSide;
        side.name = replaceBodice(side.name);
        tops.push_back(center);
        tops.push_back(side);
    } else {
        tops.push_back(extendPiece(bodice.back, bodice.backPieceWaistY, bodice.backPieceLength, extra, hipHalfQuarter));
    }
    const bool halter = spec.neckline == Neckline::Halter;
    const std::vector<PatternPiece> facings = halter
        ? std::vector<PatternPiece>{BodiceBlock::halterBinding(bodice.halterBindingEdgeMM)}
        : BodiceBlock::neckFacings(m, spec.neckline, "cut 1 on fold, interface", "cut 2, interface");
    const std::vector<PatternPiece> sleeves = SleeveBlock::draft(
        m, halter ? SleeveStyle::None : spec.sleeveStyle, spec.sleeveLength,
        bodice.armholeLength, bodice.armholeDepth, spec.fabric, spec.sleeveCap);

    double meters = (bodice.frontLength + extra) * 2 * 1.15 / 1000 + BodiceBlock::facingFabricMeters;
    if (!sleeves.empty()) meters += spec.sleeveLength == SleeveLength::Long ? 0.7 : 0.4;

    const bool sleeveless = sleeves.empty();
    const bool princess = bodice.frontPrincess || bodice.backPrincess;
    std::vector<std::string> steps{
        "Print and check the 3 cm calibration square before cutting.",
        "This block uses standard assumptions for shoulder slope and underbust — sew a quick muslin first and adjust before cutting your real fabric.",
        std::string("Cut every piece as labelled ('on fold' on the fabric fold, 'cut 2' twice)") +
            (sleeveless ? "" : ", sleeves twice") +
            (halter ? ". The neck strap closes at the nape, so this top slips on without a head-opening worry."
                    : ". Check the neck opening against your head circumference — a top has no zipper, it must slip over your head."),
    };
    if (halter) {
        if (spec.sleeveStyle != SleeveStyle::None) {
            steps.push_back("A halter has no shoulders to hang a sleeve from — the sleeve choice was skipped.");
        }
        steps.push_back("Staystitch the neckline, the strap edges and the back top edge just inside the seam line — every one of these is a bias-ish raw edge that stretches if you look at it wrong.");
    } else {
        steps.push_back("Fuse interfacing to the neck facings.");
        steps.push_back("Staystitch the neckline just inside the seam line so it doesn't stretch while you work.");
    }
    if (spec.fabric == Fabric::Knit) {
        steps.insert(steps.begin() + 2,
            "Knit fabric: sew with a narrow zigzag or stretch stitch and a ballpoint/stretch needle so the seams stretch with the fabric.");
    }
    if (princess) {
        steps.push_back("Sew each princess seam: pin center panel to side panel matching the bust notch, sew from armhole to hem in one pass, clip the curve over the bust inside the seam allowance, press toward the center.");
        if (!bodice.frontPrincess || !bodice.backPrincess) {
            steps.push_back(extra == 0
                ? "Sew the remaining waist darts (where a panel wasn't split), pressing toward the center."
                : "The unsplit half has no waist shaping below the bust — that is expected at this intake.");
        }
    } else if (extra == 0) {
        steps.push_back("Sew the waist darts, pressing toward the center.");
    }
    if (halter) {
        steps.push_back("Sew the side seams.");
        steps.push_back("Press the bias strip in half lengthwise along the marked fold line.");
        steps.push_back("Bind the raw edges with the bias strip in one continuous run where you can — up one strap, around the neckline, up the other strap, then each underarm sweep and the back top edge. Stretch the binding VERY slightly on the inner curves so it lies flat; trim the excess as you go.");
        steps.push_back("Run a stay tape or clear elastic inside the back top edge binding so the low back hugs the body instead of gaping.");
        steps.push_back("Close the straps at the nape: try it on, pin the strap ends to length, then sew hooks (or a button) — or extend the binding into ties.");
    } else {
    steps.push_back("Sew the shoulder seams and press them open.");
    steps.push_back("Sew the front and back neck facings together at the shoulders; finish the facing's outer edge (zigzag, overlock or turn 5 mm and stitch).");
    steps.push_back("Attach the facing to the neckline right sides together, sewing exactly on the seam line. Trim to 6 mm, clip into the curve every 2 cm.");
    steps.push_back("Understitch: press the seam allowance toward the facing and stitch it to the facing 2 mm from the seam — this is what keeps the facing rolled inside. Turn, press, and tack the facing down at the shoulder seams.");
    steps.push_back("Sew the side seams.");
    }
    if (halter) {
        // binding covered the armhole sweeps above; nothing to add
    } else if (sleeveless) {
        steps.push_back("Finish the armholes with bias binding.");
    } else {
        steps.push_back("Sew each sleeve seam, ease the cap between the notches and set the sleeves in.");
        if (spec.sleeveCap != SleeveCap::Plain) {
            steps.push_back(std::string("Puff/gathered head: run two rows of gathering along the marked crown line between the two crown notches, then pull them up to fit the armhole between those notches so the extra fullness ") +
                (spec.sleeveCap == SleeveCap::Puffed ? "stands up over the shoulder" : "sits as a soft gather") + " — the length below the notches matches the armhole 1:1, so ease only the crown.");
        }
        if (spec.sleeveStyle == SleeveStyle::Balloon) {
            steps.push_back("Gather the sleeve hem along the marked line and attach the interfaced cuffs.");
        }
    }
    steps.push_back("Hem with a 2 cm double fold.");

    const std::string sleeveWord =
        spec.sleeveStyle == SleeveStyle::None ? "" : std::string(" ") + title(spec.sleeveStyle) + "-sleeve";

    DraftedPattern pattern;
    pattern.garment = std::string(raw(spec.topLength)) + sleeveWord + " top";
    pattern.pieces = tops;
    pattern.pieces.insert(pattern.pieces.end(), facings.begin(), facings.end());
    pattern.pieces.insert(pattern.pieces.end(), sleeves.begin(), sleeves.end());
    pattern.fabricAdviceKey = "top";
    pattern.fabricMeters140 = roundToPlaces(meters, 1);
    pattern.guideSteps = steps;
    return pattern;
}

} // namespace TopBlock

namespace GarmentDrafter {

DraftedPattern draft(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m) {
    DraftedPattern pattern;
    switch (spec.garment) {
        case GarmentType::Skirt:
            pattern = SkirtBlock::draft(m, spec.skirtStyle, spec.skirtLength, spec.shaping, spec.fabric);
            break;
        case GarmentType::Dress:
            pattern = DressBlock::draft(spec, m);
            break;
        case GarmentType::Top:
            pattern = TopBlock::draft(spec, m);
            break;
    }
    // Opt-in keyhole: a teardrop opening below the front neckline. Post-pass
    // like the ruffle, so the base draft is byte-identical with it off.
    if (spec.keyhole &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        KeyholeBlock::apply(pattern);
    }
    // Opt-in front button placket (düğme patı): grown-on button stand + fold line
    // + buttons/buttonholes on the front. Post-pass on the finished front piece,
    // so the base draft is byte-identical with it off. The bust level is read
    // from the piece's own apex notch inside PlacketBlock (0 = "use the notch /
    // fall back to the run midpoint").
    if (spec.frontPlacket &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        PlacketBlock::apply(pattern, 0.0);
    }
    // Opt-in fabric ties / sash / bow (bağ / kuşak / fiyonk, Loop 4b): adds
    // separate tie pieces + a placement notch. Post-pass on the finished draft,
    // so the base is byte-identical with it off (tieClosure == None). Only
    // simple applied ties are drawn — drawstring-gathered types stay honest.
    if (spec.tieClosure != static_cast<int>(TiePlacement::None)) {
        TieBlock::apply(pattern, static_cast<TiePlacement>(spec.tieClosure), m.waistMM());
    }
    // Opt-in hem ruffle: attaches to a skirt/dress hem. Off by default, so every
    // existing draft is byte-identical. (halfCircle uses skirt length; an empire
    // half-circle dress ruffle is approximate — noted, not silently wrong.)
    if (spec.ruffleHem &&
        (spec.garment == GarmentType::Skirt || spec.garment == GarmentType::Dress)) {
        const double hemMM = SkirtBlock::hemCircumferenceMM(
            m, spec.skirtStyle, spec.skirtLength, spec.shaping, spec.fabric);
        const auto ruffles = RuffleBlock::draftTiers(
            hemMM, spec.ruffleFullness, spec.ruffleDepthMM, spec.ruffleTiers);
        pattern.pieces.insert(pattern.pieces.end(), ruffles.begin(), ruffles.end());
        if (ruffles.size() == 1) {
            pattern.guideSteps.push_back(
                "Ruffle: cut the long ruffle strip as labelled. Gather its top edge with two rows "
                "of gathering stitches and pull it down to the hem length, matching the notches so "
                "the gathers sit evenly. Sew it to the hem right sides together, press the seam up, "
                "then finish the strip's bottom edge with a narrow 1 cm hem.");
        } else {
            pattern.guideSteps.push_back(
                "Tiered ruffle: cut every tier strip as labelled. Gather tier 1's top edge with "
                "two rows of gathering stitches down to the hem length, matching the notches, and "
                "sew it to the hem right sides together; press the seam up. Gather each next tier "
                "onto the bottom edge of the tier above it the same way. Only the last tier gets a "
                "narrow 1 cm rolled hem — the other tiers' bottom edges disappear into the seam "
                "that receives the next tier.");
        }
        // Fabric: each tier is hem x fullness^i long and (depth + margins) deep.
        double lenMultiplier = 0, f = 1;
        for (size_t i = 0; i < ruffles.size(); ++i) { f *= spec.ruffleFullness; lenMultiplier += f; }
        pattern.fabricMeters140 = roundToPlaces(
            pattern.fabricMeters140 +
                hemMM * lenMultiplier * (spec.ruffleDepthMM + 25) / 1.0e6 * 1.1,
            1);
    }
    // CUTTING LINES (last, so every post-pass piece is covered): each real
    // piece gets its sewing line offset outward by its seam allowance — cut on
    // the outer line, sew on the inner. Strip pieces (ruffle, bias binding)
    // carry every allowance inside their cut note, and zero-allowance pieces
    // (keyhole facing) are sewn ON the drawn line, so those stay single-line.
    for (auto& piece : pattern.pieces) {
        if (piece.name.find("Ruffle") != std::string::npos ||
            piece.name.find("Bias binding") != std::string::npos) continue;
        const bool onFold = piece.cutInstruction.find("on fold") != std::string::npos;
        piece.cutLine = offsetOutline(piece.commands, piece.seamAllowance, onFold);
    }
    return pattern;
}

} // namespace GarmentDrafter

} // namespace stitchu
