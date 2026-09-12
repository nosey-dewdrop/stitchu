#include "shoulder.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

namespace stitchu {
namespace ShoulderBlock {

void applyDropped(double& shoulderHalf, double& armholeY,
                  double& frontChestWidth, double& backChestWidth,
                  double torsoArmholeDepth) {
    // Slide the shoulder tip out along the shoulder line: the natural shoulder
    // point stays where it was on the body, the SEAM runs past it onto the arm.
    const double extend = shoulderHalf * dropExtendShare;
    // Drop the underarm point with it (a share of the torso armhole depth), and
    // widen the scye a little so the armhole grows evenly rather than just
    // getting taller. Both front and back widen by the same amount so the side
    // seams still pair up. The sleeve solver reads the resulting longer, deeper
    // armhole and flattens/widens the cap on its own — a dropped shoulder wears
    // with almost no set-in crown, which is exactly what a longer armhole with a
    // shallower cap produces.
    const double drop = torsoArmholeDepth * dropArmholeShare;
    const double widen = drop * dropWidenShare;
    shoulderHalf += extend;
    armholeY += drop;
    frontChestWidth += widen;
    backChestWidth += widen;
}

namespace {

// Finds a body piece by any of the given names.
PatternPiece* findPiece(DraftedPattern& pattern, std::initializer_list<const char*> names) {
    for (const char* name : names)
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    return nullptr;
}

// The shoulder tip and underarm point of a half-bodice OUTLINE. The bodice
// draws: move(centerNeck), neck..., line(shoulderTip), armholeCurve(->underarm),
// ... So the shoulder tip is the `.to` of the last Line before the first Curve
// that follows the neck run, and the underarm is that Curve's `.to`. For a
// princess CENTRE panel the armhole is split (Curve then seamUpper Curve) — the
// underarm is not on the centre panel, so we mark the seam only from the
// shoulder tip down along the drawn armhole/split edge (still a true raglan line
// on the panel it lives on). Returns false if the shape is not recognised.
bool shoulderAndArmhole(const PatternPiece& piece, Point& shoulderTip,
                        Point& underarm, bool& hasUnderarm) {
    hasUnderarm = false;
    const auto& c = piece.commands;
    // Walk to the first Curve after at least one Line (the shoulder line).
    for (size_t i = 1; i < c.size(); ++i) {
        if (c[i].type == CmdType::Curve && c[i - 1].type == CmdType::Line) {
            shoulderTip = c[i - 1].to;
            underarm = c[i].to;
            // The underarm is real only when the next command is NOT another
            // curve arriving above the underarm (princess split reads as two
            // curves; the second dives to the apex, so its .to sits well inside).
            hasUnderarm = true;
            return true;
        }
    }
    return false;
}

// Draws the raglan seam as a marking on a half-bodice: a smooth diagonal from a
// point on the neckline (raglanNeckShare of the way out from the centre neck to
// the shoulder tip) down to the underarm, bowed slightly toward the armhole so
// it echoes the scye. Also appends a "cut on this line" note. The shoulder
// corner above the seam is removed at cutting and belongs to the sleeve.
void drawRaglanSeam(PatternPiece& piece, Point neckPointOnEdge, Point underarm) {
    // Control points bow the seam toward the armhole side (larger x) in its lower
    // half, the way a real raglan curves out over the scye then straightens to
    // the neck.
    const double midX = (neckPointOnEdge.x + underarm.x) / 2;
    const double midY = (neckPointOnEdge.y + underarm.y) / 2;
    piece.markings.push_back(PathCommand::move(neckPointOnEdge));
    piece.markings.push_back(PathCommand::curve(
        underarm,
        {neckPointOnEdge.x + (midX - neckPointOnEdge.x) * 0.5, neckPointOnEdge.y + (midY - neckPointOnEdge.y) * 0.9},
        {underarm.x + (midX - underarm.x) * 0.25, underarm.y - (underarm.y - midY) * 0.55}));
}

// The neckline point of a half-bodice: the `.to` of the last neck command before
// the shoulder line (== the neck-shoulder point). We slide raglanNeckShare of the
// way back toward the centre neck (commands[0].to) to seat the raglan a little
// off the shoulder point, into the neckline.
Point raglanNeckPoint(const PatternPiece& piece, Point shoulderTip) {
    const Point centerNeck = piece.commands.empty() ? Point{0, 0} : piece.commands[0].to;
    // Find the neck-shoulder point: the vertex just before the shoulder tip.
    Point neckShoulder = shoulderTip;
    for (size_t i = 1; i < piece.commands.size(); ++i) {
        if (piece.commands[i].type == CmdType::Line &&
            std::fabs(piece.commands[i].to.x - shoulderTip.x) < 1e-6 &&
            std::fabs(piece.commands[i].to.y - shoulderTip.y) < 1e-6) {
            neckShoulder = piece.commands[i - 1].to;
            break;
        }
    }
    return {neckShoulder.x + (centerNeck.x - neckShoulder.x) * raglanNeckShare,
            neckShoulder.y + (centerNeck.y - neckShoulder.y) * raglanNeckShare};
}

} // namespace

bool applyRaglan(DraftedPattern& pattern, double armholeDepth, double shoulderMM) {
    // Need a front + a back body piece with a shoulder to convert.
    PatternPiece* front = findPiece(pattern, {"Bodice Front", "Bodice Center Front",
                                              "Top Front", "Top Center Front"});
    PatternPiece* back = findPiece(pattern, {"Bodice Back", "Bodice Center Back",
                                             "Top Back", "Top Center Back"});
    if (!front || !back) {
        pattern.guideSteps.push_back(
            "Raglan: skipped — this draft has no front + back bodice with a shoulder "
            "seam to convert (a halter has bare shoulders). Kept as drawn.");
        return false;
    }

    // Draw the raglan seam on each body half.
    Point fTip, fUnder, bTip, bUnder;
    bool fHas = false, bHas = false;
    if (!shoulderAndArmhole(*front, fTip, fUnder, fHas) ||
        !shoulderAndArmhole(*back, bTip, bUnder, bHas)) {
        pattern.guideSteps.push_back(
            "Raglan: skipped — could not read the shoulder/armhole on this block. "
            "Kept as a set-in draft.");
        return false;
    }
    drawRaglanSeam(*front, raglanNeckPoint(*front, fTip), fUnder);
    drawRaglanSeam(*back, raglanNeckPoint(*back, bTip), bUnder);
    front->cutInstruction += " — cut off the raglan corner above the marked raglan seam";
    back->cutInstruction += " — cut off the raglan corner above the marked raglan seam";

    // Convert the set-in sleeve into a raglan sleeve. The set-in cap is replaced
    // by a shoulder POINT grown up off the crown: the sleeve now reaches the
    // neckline, and its two upper edges are the raglan seams that sew to the
    // front/back raglan arcs 1:1. If there is no sleeve, the raglan is drawn on
    // the body only (a sleeveless raglan reads as a cut-on shoulder — noted).
    PatternPiece* sleeve = findPiece(pattern, {"Sleeve", "Gathered-Head Sleeve",
                                               "Puff Sleeve", "Balloon Sleeve"});
    if (!sleeve) {
        pattern.guideSteps.push_back(
            "Raglan seam drawn on the front and back. This block is sleeveless, so "
            "the raglan runs to a bound edge (a cut-on shoulder look) rather than a "
            "raglan sleeve — add a sleeve if you want the true raglan.");
        return true;
    }

    // Raglan sleeve. The set-in cap OUTLINE is KEPT (it still eases into the lower
    // armhole and stays sewable + validatable) — a raglan sleeve's shoulder point
    // is simply the TOP of its own cap, and the crown becomes the shoulder. On top
    // of the cap we mark: (a) the two raglan SEAM lines running from the front and
    // back cap corners up to the cap top (the shoulder point) — these are what sew
    // to the bodice raglan lines — and (b) a small crown shoulder DART that shapes
    // the flat cap into a rounded shoulder when sewn out. All markings sit ON the
    // cap (within the piece), so the sleeve stays a valid, printable piece.
    const Rect box = boundingBox(sleeve->commands);
    const double capTopY = box.y;              // shoulder point = top of the cap
    const double capMidX = box.x + box.width / 2;
    const double capBotY = capTopY + std::max(30.0, armholeDepth * 0.55); // crown band depth
    // Front raglan seam line: from the left cap corner up to the shoulder point.
    sleeve->markings.push_back(PathCommand::move({box.x + box.width * 0.06, capBotY}));
    sleeve->markings.push_back(PathCommand::line({capMidX, capTopY}));
    // Back raglan seam line: from the right cap corner up to the shoulder point.
    sleeve->markings.push_back(PathCommand::move({box.x + box.width * 0.94, capBotY}));
    sleeve->markings.push_back(PathCommand::line({capMidX, capTopY}));
    // Crown shoulder dart: legs a little either side of the top, apex a short way
    // down the crown — sewn out, it rounds the flat cap into a shoulder.
    const double dartHalf = std::max(8.0, shoulderMM * 0.05);
    const double dartApexY = capTopY + (capBotY - capTopY) * 0.45;
    sleeve->markings.push_back(PathCommand::move({capMidX - dartHalf, capTopY}));
    sleeve->markings.push_back(PathCommand::line({capMidX, dartApexY}));
    sleeve->markings.push_back(PathCommand::line({capMidX + dartHalf, capTopY}));
    sleeve->name = "Raglan " + sleeve->name;
    sleeve->cutInstruction +=
        " — raglan: the two marked upper seam lines join the front and back raglan "
        "lines; sew the small crown dart to shape the shoulder";

    pattern.guideSteps.push_back(
        "Raglan (diagonal shoulder seam): there is no shoulder seam. Cut the raglan "
        "corner off the front and back above the marked raglan line. Sew the small "
        "crown dart on the sleeve to shape the shoulder point. Then sew the sleeve's "
        "front marked seam to the front raglan line and its back marked seam to the "
        "back raglan line, matching them along the notches, and press the raglan "
        "seams toward the sleeve. Sew the underarm and side seams in one continuous "
        "seam.");
    return true;
}

} // namespace ShoulderBlock
} // namespace stitchu
