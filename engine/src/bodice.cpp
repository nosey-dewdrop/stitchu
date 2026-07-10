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

} // namespace

namespace BodiceBlock {

BodiceDraft draft(const BodyMeasurementsSnapshot& m, Neckline neckline) {
    const double neck = m.neckMM();
    const double backLength = m.backLengthMM();
    const double shoulderHalf = m.shoulderCM * 10 / 2;
    const double underbust = std::max(m.bustMM() - underbustOffset, m.waistMM());

    const double shoulderDrop = shoulderHalf * shoulderDropFactor;
    const double armholeY = backLength * armholeDepthFactor + shoulderDrop;

    // Boat necks widen on both front and back.
    const double widthMultiplier = neckline == Neckline::Boat ? 1.35 : 1.0;

    // ---- BACK (cut 2, center back seam carries part of the suppression) ----
    const double backNeckW = std::min(neck * backNeckWidthFactor * widthMultiplier, shoulderHalf * maxNeckShoulderShare);
    const double backCutout = neck * backNeckCutoutFactor;
    const double backWidth = (underbust / 4) * (1 + chestEase);
    const double backWaistTarget = (m.waistMM() * backWaistShare / 2) * (1 + waistEase);
    const double backReduction = std::max(0.0, backWidth - backWaistTarget);
    double backDart = backReduction * (1 - centerBackReduction * 0.5);
    const double cbTakeIn = backReduction * centerBackReduction * 0.5;
    if (backDart <= 0) backDart = 0;
    // Waist edge spans from the CB take-in to the side; folding the dart out
    // leaves exactly the waist target: cbTakeIn + target + dart.
    const double backWaistlineWidth = cbTakeIn + backWaistTarget + backDart;

    const HalfBodice back = makePiece(
        "Bodice Back", "cut 2",
        Neckline::Crew, // back neckline stays a shallow curve for every style
        backNeckW, backCutout, shoulderHalf, shoulderDrop,
        backWidth, armholeY,
        backLength, backLength,
        backWaistlineWidth, backDart,
        backLength - armholeY + 40,
        cbTakeIn);

    // ---- FRONT (cut 1 on fold, suppression in the waist dart + side seam) ----
    const double frontNeckW = std::min(neck * frontNeckWidthFactor * widthMultiplier, shoulderHalf * maxNeckShoulderShare);
    const double frontCutout = frontNeckDepth(neckline, frontNeckW);
    const double frontLength = backLength + frontBalanceDrop;
    const double frontWidth = (m.bustMM() / 4) * (1 + chestEase);
    const double frontWaistTarget = (m.waistMM() * (1 - backWaistShare) / 2) * (1 + waistEase);
    const double frontReduction = std::max(0.0, frontWidth - frontWaistTarget);
    // Up to 15mm of the reduction slants the side seam in at the WAIST (never
    // at the chest — that would eat the bust ease), rest is dart.
    const double sideTake = std::min(frontReduction, 15.0);
    const double frontDart = frontReduction - sideTake;
    const double frontWaistlineWidth = frontWaistTarget + frontDart;

    const HalfBodice front = makePiece(
        "Bodice Front", "cut 1 on fold",
        neckline,
        frontNeckW, frontCutout, shoulderHalf, shoulderDrop,
        frontWidth, armholeY,
        backLength, frontLength,
        frontWaistlineWidth, frontDart,
        frontLength - armholeY - 40,
        0);

    BodiceDraft draft;
    draft.back = back.piece;
    draft.front = front.piece;
    draft.backWaistHalf = backWaistTarget;
    draft.frontWaistHalf = frontWaistTarget;
    draft.frontLength = frontLength;
    draft.backLength = backLength;
    draft.armholeLength = back.armholeLength + front.armholeLength;
    draft.armholeDepth = armholeY - shoulderDrop;
    draft.sideWaistY = backLength;
    draft.frontSideSeam = front.sideSeam;
    draft.backSideSeam = back.sideSeam;
    draft.frontSewnWaist = front.sewnWaist;
    draft.backSewnWaist = back.sewnWaist;
    draft.frontStraightWaist = front.straightWaist;
    draft.backStraightWaist = back.straightWaist;
    draft.frontChestWidth = frontWidth;
    draft.backChestWidth = backWidth;
    return draft;
}

} // namespace BodiceBlock
} // namespace stitchu
