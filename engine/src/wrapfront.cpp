#include "wrapfront.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace WrapFrontBlock {

namespace {

// A vertex "on the center front" sits within this many mm of x = 0. The CF edge
// of a bodice front is drafted along x = 0 (the fold), so every CF-edge vertex is
// within a hair of it.
constexpr double kCfEps = 1.0;

// The front CENTER piece that carries the CF edge, in the same priority order the
// facing / placket rules use: an unsplit half is "Bodice Front" / "Top Front", a
// princess half is the "... Center Front" panel (it carries the CF fold + the
// neck edge). Returned as an INDEX so it survives a later push_back reallocation.
int frontCenterIndex(DraftedPattern& pattern) {
    for (const char* name : {"Bodice Center Front", "Bodice Front",
                             "Top Center Front", "Top Front"}) {
        for (size_t i = 0; i < pattern.pieces.size(); ++i)
            if (pattern.pieces[i].name == name) return static_cast<int>(i);
    }
    return -1;
}

// Flip an "on fold" cut note to "cut 2 (mirror wrap)": a wrap front OPENS at the
// center front (the two fronts cross over), so it can never be cut on the fold —
// each front is a full asymmetric panel and the pair are mirror images. Preserves
// any trailing note (", interface"). Identical spirit to placket.cpp's openCF.
void openFold(std::string& cut, const std::string& tail) {
    const auto fold = cut.find("on fold");
    if (fold == std::string::npos) {
        // A princess SIDE panel is already "cut 2"; leave it, the wrap only
        // reshapes the center panel's CF edge.
        return;
    }
    std::string keep;
    const auto comma = cut.find(',', fold);
    if (comma != std::string::npos) keep = cut.substr(comma);
    cut = "cut 2 (mirror wrap — right laps over left)" + keep + tail;
}

} // namespace

bool apply(DraftedPattern& pattern, WrapFront style, double frontChestWidth) {
    if (style == WrapFront::None) return true;

    const int idx = frontCenterIndex(pattern);
    if (idx < 0) {
        pattern.guideSteps.push_back(
            "Wrap / surplice front: skipped — a wrap crosses the two FRONT bodice "
            "panels over each other, so it needs a front bodice to reshape. This draft "
            "has none (it's a skirt, or has no front panel). Nothing changed.");
        return false;
    }

    PatternPiece& front = pattern.pieces[idx];
    if (front.commands.size() < 4 || front.commands[0].type != CmdType::Move) {
        pattern.guideSteps.push_back(
            "Wrap / surplice front: skipped — the front piece has no drawn outline to "
            "reshape into a wrap.");
        return false;
    }

    // The CF neck point is the move vertex (the top of the CF edge, at x ~ 0). It
    // MUST stay put — the neck edge (commands[0]..[1]) is the drafted surplice-V
    // neckline, and the neck facing is trued to it, so touching it would break the
    // facing match. We reshape only the CF edge BELOW the neck point.
    const Point cfNeck = front.commands[0].to;
    if (std::fabs(cfNeck.x) > kCfEps) {
        // The center piece isn't drafted against x = 0 (unexpected topology) —
        // refuse honestly rather than reshape the wrong edge.
        pattern.guideSteps.push_back(
            "Wrap / surplice front: skipped — the front center edge is not on the "
            "center-front line, so a clean wrap edge can't be measured. Nothing changed.");
        return false;
    }

    // The CF-WAIST corner is the outline vertex on the CF (x ~ 0) with the LARGEST
    // y — the bottom of the CF edge where the waist/hem edge meets it. Find its
    // command index; every command AFTER it that also lands on the CF is the CF
    // edge climbing back up to the neck point (the run we replace with the wrap
    // diagonal). The move (index 0) is excluded.
    int waistCornerCmd = -1;
    double maxCfY = -1e18;
    for (size_t i = 1; i < front.commands.size(); ++i) {
        const PathCommand& c = front.commands[i];
        if (c.type == CmdType::Close) continue;
        if (std::fabs(c.to.x) < kCfEps && c.to.y > maxCfY) {
            maxCfY = c.to.y;
            waistCornerCmd = static_cast<int>(i);
        }
    }
    if (waistCornerCmd < 0) {
        pattern.guideSteps.push_back(
            "Wrap / surplice front: skipped — couldn't find the center-front waist "
            "corner to build the wrap edge from. Nothing changed.");
        return false;
    }

    // Wrap allowance: how far PAST the center front each panel laps. A share of the
    // drafted front-chest width (Aldrich/Armstrong wrap block), clamped to a sane,
    // always-covered band. Extending the CF/waist corner to NEGATIVE x carries the
    // panel across the body centerline; cut 2 mirror-image, the two fronts overlap
    // by `wrapPastCF` on each side of CF (proven in wrapfront_check).
    const double wrapPastCF = std::min(
        kWrapPastCFMaxMM,
        std::max(kWrapPastCFMinMM, frontChestWidth * kWrapPastCFShare));

    // Rebuild the outline:
    //   keep commands[0 .. waistCornerCmd-1] verbatim (neck edge, shoulder, armhole,
    //     side seam, waist curve up to the CF-waist corner);
    //   the waist-corner command KEEPS its curve/line shape but its endpoint (and
    //     any CF control point) is pushed out to x = -wrapPastCF — this drags the
    //     waist/hem edge across CF into the wrap corner;
    //   then a single straight WRAP EDGE (a clean diagonal) runs from that wrap
    //     corner up to the CF neck point — the surplice line;
    //   close.
    std::vector<PathCommand> out;
    out.reserve(front.commands.size() + 1);
    for (int i = 0; i < waistCornerCmd; ++i) out.push_back(front.commands[i]);

    PathCommand corner = front.commands[waistCornerCmd];
    const Point wrapCorner{-wrapPastCF, corner.to.y};
    if (corner.type == CmdType::Curve) {
        // Slide any control point sitting on the CF outward with the endpoint so the
        // waist curve still flows smoothly into the wrap corner (mirror of how the
        // placket grows its CF control points).
        if (std::fabs(corner.cp1.x) < kCfEps) corner.cp1.x -= wrapPastCF;
        if (std::fabs(corner.cp2.x) < kCfEps) corner.cp2.x -= wrapPastCF;
        corner.to = wrapCorner;
    } else {
        corner.to = wrapCorner;
    }
    out.push_back(corner);

    // The diagonal wrap edge: wrap corner -> CF neck point. A single clean line =
    // the surplice edge that crosses the body.
    out.push_back(PathCommand::line(cfNeck));
    out.push_back(PathCommand::close());
    front.commands = out;

    // A wrap front OPENS at the CF (the two fronts cross), so it can't be cut on the
    // fold — flip the center front to cut 2 mirror. The neck facing mirrors the
    // front's cut, so flip it too (a wrap needs a facing per side).
    openFold(front.cutInstruction, "");
    for (auto& piece : pattern.pieces)
        if (piece.name == "Front Neck Facing") openFold(piece.cutInstruction, "");

    // Record the wrap as this piece's closure so the pattern reports an honest
    // donning opening (the wrap IS how the body gets in — no zip needed).
    front.closure = "wrap / surplice front (right laps over left)";

    // A grainline down the (now wider) panel. Keep it inside the body region so it
    // stays a real grain arrow; the panel now spans from -wrapPastCF to the side.
    const Rect bb = boundingBox(front.commands);
    front.hasGrainline = true;
    front.grainline = Grainline{{std::max(0.0, bb.x) + 20, bb.y + bb.height * 0.20},
                                {std::max(0.0, bb.x) + 20, bb.y + bb.height * 0.80}};

    // A wrap adds fabric (each front now laps past CF).
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.2, 1);

    const std::string wrapStr =
        std::to_string(static_cast<long>(std::lround(wrapPastCF)));
    pattern.guideSteps.push_back(
        "Wrap / surplice front (kruvaze): the front is a CROSSED double front — cut it "
        "as TWO mirror-image fronts (cut 2, NOT on the fold). Each front laps about " +
        wrapStr + " mm PAST the center front, so worn, the RIGHT front laps over the "
        "left (women's convention) and the two diagonal edges form the surplice V. Cut "
        "one panel right-side up and its mirror right-side down. Stay-stitch the "
        "diagonal wrap edge (it's a bias-ish edge that stretches) and finish it with a "
        "self facing or a narrow turn. Overlap the two fronts at the center front, "
        "matching the shoulders and side seams to the back, and catch the wrap at the "
        "side-seam / waist with a tie (add the wrap-front tie if you want it to cinch). "
        "The overlap gives modest coverage and the tie holds it — no zip needed.");
    return true;
}

} // namespace WrapFrontBlock
} // namespace stitchu
