#include "bodice.hpp"

#include <algorithm>
#include <cmath>
#include <limits>

namespace stitchu {
namespace {

double frontNeckDepth(Neckline neckline, double neckW) {
    switch (neckline) {
        case Neckline::Crew: return neckW + 15;
        case Neckline::Scoop: return neckW + 50;
        case Neckline::VNeck: return neckW + 75;
        case Neckline::Square: return neckW + 40;
        case Neckline::Boat: return 28;
    }
    return neckW + 15;
}

// Neck segment from the center-neck point up to the shoulder-neck point.
std::vector<PathCommand> neckCommands(Neckline neckline, Point centerNeck, Point neckPoint) {
    const double w = neckPoint.x;
    const double d = centerNeck.y;
    switch (neckline) {
        case Neckline::VNeck:
            return {PathCommand::line(neckPoint)};
        case Neckline::Square:
            return {PathCommand::line({w, d}), PathCommand::line(neckPoint)};
        case Neckline::Boat:
            return {PathCommand::curve(neckPoint, {w * 0.5, d}, {w * 0.85, d * 0.5})};
        case Neckline::Crew:
        case Neckline::Scoop:
            return {PathCommand::curve(neckPoint, {w * 0.55, d}, {w * 0.9, d * 0.35})};
    }
    return {PathCommand::line(neckPoint)};
}

struct HalfBodice {
    PatternPiece piece;
    double armholeLength = 0;
    double sideSeam = 0;
    double sewnWaist = 0;
    double straightWaist = 0;
};

// y on the waist bezier at a given x (the curve is monotonic in x).
double waistCurveY(double x, Point sideWaist, const PathCommand& curve) {
    if (curve.type != CmdType::Curve) return sideWaist.y;
    Point best = sideWaist;
    double bestDistance = std::numeric_limits<double>::max();
    const int steps = 32;
    for (int i = 0; i <= steps; ++i) {
        const double t = static_cast<double>(i) / steps;
        const double mt = 1 - t;
        const double px = mt * mt * mt * sideWaist.x + 3 * mt * mt * t * curve.cp1.x + 3 * mt * t * t * curve.cp2.x + t * t * t * curve.to.x;
        const double py = mt * mt * mt * sideWaist.y + 3 * mt * mt * t * curve.cp1.y + 3 * mt * t * t * curve.cp2.y + t * t * t * curve.to.y;
        const double d = std::fabs(px - x);
        if (d < bestDistance) {
            bestDistance = d;
            best = {px, py};
        }
    }
    return best.y;
}

// Shared half-bodice outline: center edge at x=0. The side waist sits at
// sideWaistY (same for front and back so side seams match); the center waist
// sits at centerWaistY (front carries the M&S balance drop there).
HalfBodice makePiece(
    const std::string& name,
    const std::string& cutInstruction,
    Neckline neckline,
    double neckW,
    double neckCutout,
    double shoulderHalf,
    double shoulderDrop,
    double chestWidth,
    double armholeY,
    double sideWaistY,
    double centerWaistY,
    double waistlineWidth,
    double dartWidth,
    double dartLength,
    double centerTakeIn
) {
    const Point centerNeck{0, neckCutout};
    const Point neckPoint{neckW, 0};
    const Point shoulderTip{shoulderHalf, shoulderDrop};
    const Point armholeBottom{chestWidth, armholeY};
    const Point sideWaist{waistlineWidth, sideWaistY - 8};
    const Point centerWaist{centerTakeIn, centerWaistY};

    const PathCommand armholeCurve = PathCommand::curve(
        armholeBottom,
        {shoulderHalf + (chestWidth - shoulderHalf) * 0.25, shoulderDrop + (armholeY - shoulderDrop) * 0.55},
        {chestWidth - (chestWidth - shoulderHalf) * 0.45, armholeY - (armholeY - shoulderDrop) * 0.12});
    const double armholeLen = pathLength({PathCommand::move(shoulderTip), armholeCurve});

    const double waistSpan = waistlineWidth - centerTakeIn;
    const PathCommand waistCurve = PathCommand::curve(
        centerWaist,
        {centerTakeIn + waistSpan * 0.6, sideWaist.y + (centerWaist.y - sideWaist.y) * 0.55},
        {centerTakeIn + waistSpan * 0.25, centerWaist.y});

    std::vector<PathCommand> commands{PathCommand::move(centerNeck)};
    for (const auto& cmd : neckCommands(neckline, centerNeck, neckPoint)) commands.push_back(cmd);
    commands.push_back(PathCommand::line(shoulderTip));
    commands.push_back(armholeCurve);
    commands.push_back(PathCommand::line(sideWaist));
    commands.push_back(waistCurve);
    // Control points interpolate between waist and neck cutout so a deep
    // neckline on a short body can never fold the edge back.
    commands.push_back(PathCommand::curve(
        centerNeck,
        {centerTakeIn * 0.6, neckCutout + (centerWaistY - neckCutout) * 0.6},
        {0, neckCutout + (centerWaistY - neckCutout) * 0.3}));
    commands.push_back(PathCommand::close());

    std::vector<PathCommand> markings;
    if (dartWidth > 0) {
        const double dartCenterX = centerTakeIn + waistSpan * 0.5;
        // Put the dart legs on the drafted waist curve.
        const double legAX = dartCenterX - dartWidth / 2;
        const double legBX = dartCenterX + dartWidth / 2;
        const Point legA{legAX, waistCurveY(legAX, sideWaist, waistCurve)};
        const Point legB{legBX, waistCurveY(legBX, sideWaist, waistCurve)};
        const Point apex{dartCenterX, std::min(legA.y, legB.y) - dartLength};
        markings.push_back(PathCommand::move(legA));
        markings.push_back(PathCommand::line(apex));
        markings.push_back(PathCommand::line(legB));
    }

    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction = cutInstruction;
    piece.commands = commands;
    piece.markings = markings;
    piece.hasGrainline = true;
    piece.grainline = Grainline{
        {std::max(centerTakeIn, 20.0) + 20, armholeY},
        {std::max(centerTakeIn, 20.0) + 20, sideWaistY - 30}};
    piece.seamAllowance = 15;

    HalfBodice half;
    half.piece = piece;
    half.armholeLength = armholeLen;
    half.sideSeam = std::hypot(sideWaist.x - armholeBottom.x, sideWaist.y - armholeBottom.y);
    half.sewnWaist = pathLength({PathCommand::move(sideWaist), waistCurve}) - dartWidth;
    half.straightWaist = waistSpan - dartWidth;
    return half;
}

struct PrincessHalf {
    PatternPiece center;
    PatternPiece side;
    double armholeLength = 0;
    double sideSeam = 0;
    double sewnWaist = 0;      // center part + side part, along the drafted curve
    double centerArc = 0;      // center-edge -> princess-seam leg, along the curve
    double straightWaist = 0;  // waist span minus intake, same basis as dart mode
    double seamCenterLen = 0;  // princess edge on the center panel
    double seamSideLen = 0;    // princess edge on the side panel
};

// Princess split of the same half-bodice skeleton makePiece draws: the waist
// dart becomes a seam from the armhole through the bust apex to the waist.
// Above the apex both panel edges share one cubic (identical length); below it
// the old dart legs become the panel edges, so the intake is sewn out exactly
// like the dart it replaces.
// extendBelowWaist > 0 (tops): the panels flow THROUGH the waist to the hem —
// the seam gap closes toward hip depth and the side seam flares to
// hipHalfQuarter, so the top stays fitted where the dart-mode extension goes
// boxy. Trued legs end at the same y, so the below-waist edges mirror exactly.
PrincessHalf makePrincessPieces(
    const std::string& baseName,
    const std::string& centerCut,
    const std::string& sideCut,
    Neckline neckline,
    double neckW,
    double neckCutout,
    double shoulderHalf,
    double shoulderDrop,
    double chestWidth,
    double armholeY,
    double sideWaistY,
    double centerWaistY,
    double waistlineWidth,
    double dartWidth,
    double dartLength,
    double centerTakeIn,
    double extendBelowWaist = 0,
    double hipHalfQuarter = 0
) {
    const Point centerNeck{0, neckCutout};
    const Point neckPoint{neckW, 0};
    const Point shoulderTip{shoulderHalf, shoulderDrop};
    const Point armholeBottom{chestWidth, armholeY};
    const Point sideWaist{waistlineWidth, sideWaistY - 8};
    const Point centerWaist{centerTakeIn, centerWaistY};

    const PathCommand armholeCurve = PathCommand::curve(
        armholeBottom,
        {shoulderHalf + (chestWidth - shoulderHalf) * 0.25, shoulderDrop + (armholeY - shoulderDrop) * 0.55},
        {chestWidth - (chestWidth - shoulderHalf) * 0.45, armholeY - (armholeY - shoulderDrop) * 0.12});
    const double armholeLen = pathLength({PathCommand::move(shoulderTip), armholeCurve});

    const double waistSpan = waistlineWidth - centerTakeIn;
    const PathCommand waistCurve = PathCommand::curve(
        centerWaist,
        {centerTakeIn + waistSpan * 0.6, sideWaist.y + (centerWaist.y - sideWaist.y) * 0.55},
        {centerTakeIn + waistSpan * 0.25, centerWaist.y});

    // Old dart geometry becomes the seam geometry.
    const double dartCenterX = centerTakeIn + waistSpan * 0.5;
    const CubicSplit waistAtA = splitCubic(sideWaist, waistCurve, cubicTForX(sideWaist, waistCurve, dartCenterX - dartWidth / 2));
    const CubicSplit waistAtB = splitCubic(sideWaist, waistCurve, cubicTForX(sideWaist, waistCurve, dartCenterX + dartWidth / 2));
    const Point legA = waistAtA.at; // center-side seam end on the waist
    const Point legB = waistAtB.at; // side-panel seam end on the waist
    const Point apex{dartCenterX, std::min(legA.y, legB.y) - dartLength};

    // True the seam: the waist curve sits deeper on the center side (front
    // balance drop), so the raw legB edge would be shorter than the legA edge
    // by up to ~10 mm — fine folded as a dart, unsewable as a seam. Drop the
    // side panel's waist end until both seam edges measure the same, and
    // re-blend its waist curve into the new end point.
    const double targetLegLen = distance(apex, legA);
    const double legDrop = std::sqrt(std::max(0.0, targetLegLen * targetLegLen - (dartWidth / 2) * (dartWidth / 2)));
    const Point legBTrued{legB.x, apex.y + legDrop};
    PathCommand sideWaistEdge = waistAtB.first; // sideWaist -> legB
    sideWaistEdge.cp2.y += legBTrued.y - legB.y;
    sideWaistEdge.to = legBTrued;

    // Where the seam leaves the armhole: a fixed share of the armhole depth,
    // but always safely above the apex.
    const double splitTargetY = std::max(
        shoulderDrop + 15.0,
        std::min(shoulderDrop + (armholeY - shoulderDrop) * BodiceBlock::princessArmholeShare,
                 apex.y - BodiceBlock::princessApexClearance));
    const CubicSplit armSplit = splitCubic(shoulderTip, armholeCurve, cubicTForY(shoulderTip, armholeCurve, splitTargetY));
    const Point split = armSplit.at;

    // Shared upper seam cubic, arriving at the apex near-vertically so it
    // flows into the straight leg below.
    const PathCommand seamUpper = PathCommand::curve(
        apex,
        {split.x + (apex.x - split.x) * 0.3, split.y + (apex.y - split.y) * 0.25},
        {apex.x, apex.y - (apex.y - split.y) * 0.30});
    const double seamUpperLen = pathLength({PathCommand::move(split), seamUpper});

    // Below-waist continuation (tops): the seam gap shrinks linearly to zero
    // at hip depth; the sewn hem totals hipHalfQuarter exactly.
    const double extra = extendBelowWaist;
    const double hipBlendDepth = 200; // waist-to-hip drafting depth, as in the skirt block
    const double gapHem = extra > 0 ? dartWidth * std::max(0.0, 1.0 - extra / hipBlendDepth) : 0;
    const double hemSeamY = sideWaistY + extra;
    const Point seamHemCenter{dartCenterX - gapHem / 2, hemSeamY};
    const Point seamHemSide{dartCenterX + gapHem / 2, hemSeamY};
    const Point hemCenter{centerTakeIn, centerWaistY + extra};
    const double sideHemX = hipHalfQuarter + gapHem;
    const Point hemSide{sideHemX, sideWaistY + extra - 10};
    // Lower seam edges: mirrored cubics (legs share one y after truing).
    const PathCommand lowerSeamCenter = PathCommand::curve(
        seamHemCenter, {legA.x, legA.y + extra * 0.35}, {seamHemCenter.x, legA.y + extra * 0.7});
    const PathCommand lowerSeamSide = PathCommand::curve(
        legBTrued, {seamHemSide.x, legBTrued.y + extra * 0.7}, {legBTrued.x, legBTrued.y + extra * 0.35});

    // ---- center panel ----
    std::vector<PathCommand> centerCommands{PathCommand::move(centerNeck)};
    for (const auto& cmd : neckCommands(neckline, centerNeck, neckPoint)) centerCommands.push_back(cmd);
    centerCommands.push_back(PathCommand::line(shoulderTip));
    centerCommands.push_back(armSplit.first);
    centerCommands.push_back(seamUpper);
    centerCommands.push_back(PathCommand::line(legA));
    if (extra > 0) {
        centerCommands.push_back(lowerSeamCenter);
        const double hemSpan = seamHemCenter.x - centerTakeIn;
        centerCommands.push_back(PathCommand::curve(
            hemCenter,
            {centerTakeIn + hemSpan * 0.6, seamHemCenter.y + (hemCenter.y - seamHemCenter.y) * 0.55},
            {centerTakeIn + hemSpan * 0.25, hemCenter.y}));
        centerCommands.push_back(PathCommand::line(centerWaist));
    } else {
        centerCommands.push_back(waistAtA.second);
    }
    centerCommands.push_back(PathCommand::curve(
        centerNeck,
        {centerTakeIn * 0.6, neckCutout + (centerWaistY - neckCutout) * 0.6},
        {0, neckCutout + (centerWaistY - neckCutout) * 0.3}));
    centerCommands.push_back(PathCommand::close());

    PatternPiece center;
    center.name = "Bodice Center " + baseName;
    center.cutInstruction = centerCut;
    center.commands = centerCommands;
    // Bust-apex match notch, pointing into the panel.
    center.markings = {PathCommand::move(apex), PathCommand::line({apex.x - 12, apex.y + 3})};
    center.hasGrainline = true;
    center.grainline = Grainline{
        {std::max(centerTakeIn, 20.0) + 20, armholeY},
        {std::max(centerTakeIn, 20.0) + 20, sideWaistY - 30}};
    center.seamAllowance = 15;

    // ---- side panel ----
    std::vector<PathCommand> sideCommands{PathCommand::move(split)};
    sideCommands.push_back(armSplit.second);
    if (extra > 0) {
        // Side seam nips at the waist and flares out to the hip in one curve
        // (same construction the dart-mode top extension uses).
        sideCommands.push_back(PathCommand::curve(
            hemSide,
            {sideWaist.x, sideWaistY + extra * 0.35},
            {sideHemX, sideWaistY + extra * 0.7}));
        const double hemSpan = hemSide.x - seamHemSide.x;
        sideCommands.push_back(PathCommand::curve(
            seamHemSide,
            {seamHemSide.x + hemSpan * 0.6, hemSide.y + (seamHemSide.y - hemSide.y) * 0.55},
            {seamHemSide.x + hemSpan * 0.25, seamHemSide.y}));
        sideCommands.push_back(lowerSeamSide);
    } else {
        sideCommands.push_back(PathCommand::line(sideWaist));
        sideCommands.push_back(sideWaistEdge);
    }
    sideCommands.push_back(PathCommand::line(apex));
    sideCommands.push_back(reverseCubic(split, seamUpper));
    sideCommands.push_back(PathCommand::close());

    PatternPiece side;
    side.name = "Bodice Side " + baseName;
    side.cutInstruction = sideCut;
    side.commands = sideCommands;
    side.markings = {PathCommand::move(apex), PathCommand::line({apex.x + 12, apex.y + 3})};
    side.hasGrainline = true;
    const double grainX = (legB.x + chestWidth) / 2;
    side.grainline = Grainline{
        {grainX, std::max(armholeY, apex.y) + 25},
        {grainX, sideWaistY + (extra > 0 ? extra - 40 : -30)}};
    side.seamAllowance = 15;
    // Rebase to a local top-left origin like every other piece.
    const Rect sideBox = boundingBox(side.commands);
    translatePiece(side, -sideBox.x, -sideBox.y);

    PrincessHalf half;
    half.center = center;
    half.side = side;
    half.armholeLength = armholeLen;
    half.sideSeam = extra > 0
        ? pathLength({PathCommand::move(armholeBottom), sideCommands[2]})
        : std::hypot(sideWaist.x - armholeBottom.x, sideWaist.y - armholeBottom.y);
    half.sewnWaist = pathLength({PathCommand::move(legA), waistAtA.second}) +
                     pathLength({PathCommand::move(sideWaist), sideWaistEdge});
    half.centerArc = pathLength({PathCommand::move(legA), waistAtA.second});
    half.straightWaist = waistSpan - dartWidth;
    half.seamCenterLen = seamUpperLen + distance(apex, legA) +
        (extra > 0 ? pathLength({PathCommand::move(legA), lowerSeamCenter}) : 0);
    half.seamSideLen = seamUpperLen + distance(apex, legBTrued) +
        (extra > 0 ? pathLength({PathCommand::move(seamHemSide), lowerSeamSide}) : 0);
    return half;
}

// Below this intake a princess seam adds pieces without adding shape; the
// half stays a single dart-mode piece (the dart itself may also be ~zero).
constexpr double minPrincessIntake = 12;

} // namespace

namespace BodiceBlock {

BodiceDraft draft(const BodyMeasurementsSnapshot& m, Neckline neckline, Shaping shaping,
                  double extendBelowWaist, double hipHalfQuarter) {
    BodiceOptions options;
    options.neckline = neckline;
    options.shaping = shaping;
    options.extendBelowWaist = extendBelowWaist;
    options.hipHalfQuarter = hipHalfQuarter;
    return draft(m, options);
}

BodiceDraft draft(const BodyMeasurementsSnapshot& m, const BodiceOptions& options) {
    const Neckline neckline = options.neckline;
    const Shaping shaping = options.shaping;
    const double extendBelowWaist = options.extendBelowWaist;
    const double hipHalfQuarter = options.hipHalfQuarter;
    const double chestEase = chestEaseFor(options.fabric);
    const double waistEase = waistEaseFor(options.fabric);

    const double neck = m.neckMM();
    const double backLength = m.backLengthMM();
    const double shoulderHalf = m.shoulderCM * 10 / 2;
    const double underbust = std::max(m.bustMM() - underbustOffset, m.waistMM());

    const double shoulderDrop = shoulderHalf * shoulderDropFactor;
    const double armholeY = backLength * armholeDepthFactor + shoulderDrop;

    // Empire: the seam sits just under the bust and the target girth is the
    // underbust line, not the waist. Both halves share the side seam level.
    const bool empire = options.waistline == Waistline::Empire;
    const double seamSideY = empire ? armholeY + empireDrop : backLength;
    const double frontSeamCenterY = empire ? seamSideY + empireBalanceDrop : backLength + frontBalanceDrop;
    const double girth = empire ? underbust : m.waistMM();

    // Boat necks widen on both front and back.
    const double widthMultiplier = neckline == Neckline::Boat ? 1.35 : 1.0;

    // ---- BACK (cut 2, center back seam carries part of the suppression) ----
    const double backNeckW = std::min(neck * backNeckWidthFactor * widthMultiplier, shoulderHalf * maxNeckShoulderShare);
    const double backCutout = neck * backNeckCutoutFactor;
    const double backWidth = (underbust / 4) * (1 + chestEase);
    const double backWaistTarget = (girth * backWaistShare / 2) * (1 + waistEase);
    const double backReduction = std::max(0.0, backWidth - backWaistTarget);
    double backDart = backReduction * (1 - centerBackReduction * 0.5);
    const double cbTakeIn = backReduction * centerBackReduction * 0.5;
    if (backDart <= 0) backDart = 0;
    // Waist edge spans from the CB take-in to the side; folding the dart out
    // leaves exactly the waist target: cbTakeIn + target + dart.
    const double backWaistlineWidth = cbTakeIn + backWaistTarget + backDart;

    // Empire: the back blade apex stays at armholeY - 40, measured from the
    // raised seam; natural keeps the classic formula bit for bit.
    const double backDartLength = empire ? (seamSideY - 8) - (armholeY - 40) : backLength - armholeY + 40;
    const bool backPrincess = shaping == Shaping::Princess && backDart >= minPrincessIntake;

    HalfBodice back;
    PrincessHalf backSplit;
    if (backPrincess) {
        backSplit = makePrincessPieces(
            "Back", "cut 2", "cut 2",
            Neckline::Crew, // back neckline stays a shallow curve for every style
            backNeckW, backCutout, shoulderHalf, shoulderDrop,
            backWidth, armholeY,
            seamSideY, seamSideY,
            backWaistlineWidth, backDart,
            backDartLength,
            cbTakeIn,
            extendBelowWaist, hipHalfQuarter);
    } else {
        back = makePiece(
            "Bodice Back", "cut 2",
            Neckline::Crew,
            backNeckW, backCutout, shoulderHalf, shoulderDrop,
            backWidth, armholeY,
            seamSideY, seamSideY,
            backWaistlineWidth, backDart,
            backDartLength,
            cbTakeIn);
    }

    // ---- FRONT (cut 1 on fold, suppression in the waist dart + side seam) ----
    const double frontNeckW = std::min(neck * frontNeckWidthFactor * widthMultiplier, shoulderHalf * maxNeckShoulderShare);
    const double frontCutout = frontNeckDepth(neckline, frontNeckW);
    const double frontLength = frontSeamCenterY;
    const double frontWidth = (m.bustMM() / 4) * (1 + chestEase);
    const double frontWaistTarget = (girth * (1 - backWaistShare) / 2) * (1 + waistEase);
    const double frontReduction = std::max(0.0, frontWidth - frontWaistTarget);
    // Up to 15mm of the reduction slants the side seam in at the WAIST (never
    // at the chest — that would eat the bust ease), rest is dart.
    const double sideTake = std::min(frontReduction, 15.0);
    const double frontDart = frontReduction - sideTake;
    const double frontWaistlineWidth = frontWaistTarget + frontDart;

    // Empire: the bust apex stays put, so the leg from the raised seam up to
    // it is short; natural keeps the classic formula bit for bit.
    const double frontDartLength = empire
        ? std::max(12.0, (seamSideY - 8) - (armholeY + 40))
        : frontLength - armholeY - 40;
    const bool frontPrincess = shaping == Shaping::Princess && frontDart >= minPrincessIntake;

    HalfBodice front;
    PrincessHalf frontSplit;
    if (frontPrincess) {
        frontSplit = makePrincessPieces(
            "Front", "cut 1 on fold", "cut 2",
            neckline,
            frontNeckW, frontCutout, shoulderHalf, shoulderDrop,
            frontWidth, armholeY,
            seamSideY, frontLength,
            frontWaistlineWidth, frontDart,
            frontDartLength,
            0,
            extendBelowWaist, hipHalfQuarter);
    } else {
        front = makePiece(
            "Bodice Front", "cut 1 on fold",
            neckline,
            frontNeckW, frontCutout, shoulderHalf, shoulderDrop,
            frontWidth, armholeY,
            seamSideY, frontLength,
            frontWaistlineWidth, frontDart,
            frontDartLength,
            0);
    }

    // A half that stays unsplit under princess+extension is extended later by
    // the top block's classic extension; report the matching side-seam length
    // so the front/back audit compares like with like.
    auto extendedDartSideLen = [&](double waistlineWidth, double chestW) {
        const Point armholeBottom{chestW, armholeY};
        return pathLength({PathCommand::move(armholeBottom), PathCommand::curve(
            {hipHalfQuarter, seamSideY + extendBelowWaist - 10},
            {waistlineWidth, seamSideY + extendBelowWaist * 0.35},
            {hipHalfQuarter, seamSideY + extendBelowWaist * 0.7})});
    };

    BodiceDraft draft;
    draft.frontPrincess = frontPrincess;
    draft.backPrincess = backPrincess;
    if (backPrincess) {
        draft.back = backSplit.center;
        draft.backSide = backSplit.side;
        draft.backSideSeam = backSplit.sideSeam;
        draft.backSewnWaist = backSplit.sewnWaist;
        draft.backStraightWaist = backSplit.straightWaist;
        draft.backSeamCenterLen = backSplit.seamCenterLen;
        draft.backSeamSideLen = backSplit.seamSideLen;
        draft.backWaistCenterArc = backSplit.centerArc;
    } else {
        draft.back = back.piece;
        draft.backSideSeam = (shaping == Shaping::Princess && extendBelowWaist > 0)
            ? extendedDartSideLen(backWaistlineWidth, backWidth)
            : back.sideSeam;
        draft.backSewnWaist = back.sewnWaist;
        draft.backStraightWaist = back.straightWaist;
    }
    if (frontPrincess) {
        draft.front = frontSplit.center;
        draft.frontSide = frontSplit.side;
        draft.frontSideSeam = frontSplit.sideSeam;
        draft.frontSewnWaist = frontSplit.sewnWaist;
        draft.frontStraightWaist = frontSplit.straightWaist;
        draft.frontSeamCenterLen = frontSplit.seamCenterLen;
        draft.frontSeamSideLen = frontSplit.seamSideLen;
        draft.frontWaistCenterArc = frontSplit.centerArc;
    } else {
        draft.front = front.piece;
        draft.frontSideSeam = (shaping == Shaping::Princess && extendBelowWaist > 0)
            ? extendedDartSideLen(frontWaistlineWidth, frontWidth)
            : front.sideSeam;
        draft.frontSewnWaist = front.sewnWaist;
        draft.frontStraightWaist = front.straightWaist;
    }
    draft.backWaistHalf = backWaistTarget;
    draft.frontWaistHalf = frontWaistTarget;
    draft.frontLength = frontLength;
    draft.backLength = seamSideY; // back piece length (= natural backLength unless empire)
    draft.armholeLength = (backPrincess ? backSplit.armholeLength : back.armholeLength) +
                          (frontPrincess ? frontSplit.armholeLength : front.armholeLength);
    draft.armholeDepth = armholeY - shoulderDrop;
    draft.sideWaistY = seamSideY;
    draft.waistSeamY = seamSideY;
    draft.frontChestWidth = frontWidth;
    draft.backChestWidth = backWidth;
    return draft;
}

namespace {

// One facing piece. Inner edge = the garment's neckline commands verbatim
// (seam match by construction). Outer edge = the neckline flattened to a
// polyline and offset facingDepth along averaged vertex normals, oriented
// away from the neck opening (which sits toward the local origin).
PatternPiece makeFacing(
    const std::string& name,
    const std::string& cutInstruction,
    Neckline neckline,
    double neckW,
    double neckCutout,
    Point shoulderTip
) {
    const Point centerNeck{0, neckCutout};
    const Point neckPoint{neckW, 0};
    const auto inner = neckCommands(neckline, centerNeck, neckPoint);

    // Flatten the inner path centerNeck -> neckPoint.
    std::vector<Point> pts{centerNeck};
    Point current = centerNeck;
    for (const auto& cmd : inner) {
        if (cmd.type == CmdType::Curve) {
            const auto samples = flattenCubic(current, cmd.to, cmd.cp1, cmd.cp2, 12);
            pts.insert(pts.end(), samples.begin() + 1, samples.end());
        } else {
            pts.push_back(cmd.to);
        }
        current = cmd.to;
    }

    // Averaged vertex normals, flipped to point away from the origin corner.
    std::vector<Point> outer(pts.size());
    for (size_t i = 0; i < pts.size(); ++i) {
        const Point& prev = pts[i == 0 ? 0 : i - 1];
        const Point& next = pts[i + 1 < pts.size() ? i + 1 : pts.size() - 1];
        double dx = next.x - prev.x, dy = next.y - prev.y;
        const double len = std::hypot(dx, dy);
        if (len < 1e-6) { dx = 1; dy = 0; }
        else { dx /= len; dy /= len; }
        double nx = -dy, ny = dx;
        if (nx * pts[i].x + ny * pts[i].y < 0) { nx = -nx; ny = -ny; }
        outer[i] = {pts[i].x + nx * BodiceBlock::facingDepth, pts[i].y + ny * BodiceBlock::facingDepth};
    }

    // Shoulder end: walk facingDepth from the neck point toward the shoulder
    // tip so the facing rides on the shoulder seam.
    double sx = shoulderTip.x - neckPoint.x, sy = shoulderTip.y - neckPoint.y;
    const double shoulderLen = std::hypot(sx, sy);
    const double along = std::min(BodiceBlock::facingDepth, shoulderLen * 0.6);
    const Point shoulderEnd{neckPoint.x + sx / shoulderLen * along, neckPoint.y + sy / shoulderLen * along};

    std::vector<PathCommand> commands{PathCommand::move(centerNeck)};
    for (const auto& cmd : inner) commands.push_back(cmd);
    commands.push_back(PathCommand::line(shoulderEnd));
    for (size_t i = outer.size() - 1; i-- > 0;) {
        commands.push_back(PathCommand::line(outer[i]));
    }
    commands.push_back(PathCommand::close()); // back up the center edge to centerNeck

    PatternPiece facing;
    facing.name = name;
    facing.cutInstruction = cutInstruction;
    facing.commands = commands;
    facing.hasGrainline = true;
    // Midway between inner and outer near the center edge: always inside.
    const size_t g1 = pts.size() > 3 ? 1 : 0;
    const size_t g2 = pts.size() > 3 ? 3 : pts.size() - 1;
    facing.grainline = Grainline{
        {(pts[g1].x + outer[g1].x) / 2, (pts[g1].y + outer[g1].y) / 2},
        {(pts[g2].x + outer[g2].x) / 2, (pts[g2].y + outer[g2].y) / 2}};
    facing.seamAllowance = 15;
    return facing;
}

} // namespace

std::vector<PatternPiece> neckFacings(const BodyMeasurementsSnapshot& m, Neckline neckline,
                                      const std::string& frontCut, const std::string& backCut) {
    const double neck = m.neckMM();
    const double shoulderHalf = m.shoulderCM * 10 / 2;
    const double shoulderDrop = shoulderHalf * shoulderDropFactor;
    const double widthMultiplier = neckline == Neckline::Boat ? 1.35 : 1.0;
    const Point shoulderTip{shoulderHalf, shoulderDrop};

    const double frontNeckW = std::min(neck * frontNeckWidthFactor * widthMultiplier, shoulderHalf * maxNeckShoulderShare);
    const double frontCutout = frontNeckDepth(neckline, frontNeckW);
    const double backNeckW = std::min(neck * backNeckWidthFactor * widthMultiplier, shoulderHalf * maxNeckShoulderShare);
    const double backCutout = neck * backNeckCutoutFactor;

    return {
        makeFacing("Front Neck Facing", frontCut, neckline, frontNeckW, frontCutout, shoulderTip),
        makeFacing("Back Neck Facing", backCut, Neckline::Crew, backNeckW, backCutout, shoulderTip),
    };
}

} // namespace BodiceBlock
} // namespace stitchu
