#include "boxpleat.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace BoxPleatBlock {

namespace {

// The pleat underlay on the DRAWN (on-fold) half: 2 × depth of extra fabric folded
// back behind the pleat past the CF fold. The whole mirrored piece adds 4 × depth
// (both halves' underlays meet at the center), and the finished (folded-out) width
// returns to the original — the truing.
constexpr double kUnderlayHalf = 2.0 * depthMM;   // 80 mm past the CF fold
constexpr double kCfEps = 1.0;                     // a vertex is "on the CF" within 1 mm

// The host is the CF-foldable front panel. On a plain dress/top it is the bodice/
// top front; after a yoke split the lower front is renamed "Front Body" (a swing
// top is yoke + box-pleat body), so we accept that too. A princess CENTER front
// is cut on fold at the CF and can host the pleat; a princess SIDE panel cannot
// (it has no CF fold). We look for the on-fold CF piece by name in priority order.
PatternPiece* frontFoldPanel(DraftedPattern& pattern) {
    for (const char* name : {"Front Body", "Front Body Center",
                             "Bodice Center Front", "Bodice Front",
                             "Top Center Front", "Top Front"}) {
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    }
    return nullptr;
}

// The minimum x reached by the outline (the CF fold line, ~0 in every block).
double minOutlineX(const PatternPiece& p) {
    double mn = 1e30;
    for (const auto& c : p.commands)
        if (c.type != CmdType::Close) mn = std::min(mn, c.to.x);
    return mn;
}

// The y-extent of the CF edge (the run of vertices on the fold line).
void cfEdgeExtent(const PatternPiece& p, double cfX, double& topY, double& botY) {
    topY = 1e30; botY = -1e30;
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Close) continue;
        if (std::abs(c.to.x - cfX) < kCfEps) {
            topY = std::min(topY, c.to.y);
            botY = std::max(botY, c.to.y);
        }
    }
}

inline Point outward(Point p, double dx) { return {p.x - dx, p.y}; } // dx>0 => -x

} // namespace

bool growCfPleat(PatternPiece& front, double yLo, double yHi, bool protectNeckPoint) {
    if (front.commands.empty() || front.commands[0].type != CmdType::Move) return false;
    const double cfX = minOutlineX(front);
    if (std::abs(cfX) > 40.0) return false;              // no CF fold near x = 0
    double cfTopY, cfBotY;
    cfEdgeExtent(front, cfX, cfTopY, cfBotY);
    if (!(cfBotY > cfTopY)) return false;               // CF edge degenerate

    // Restrict the grown region to the CF vertices whose y sits in [yLo, yHi],
    // clamped to the CF edge. A full-edge caller passes [cfTopY, cfBotY] so every
    // CF vertex qualifies (byte-identical with the original apply()).
    const double lo = std::max(yLo, cfTopY);
    const double hi = std::min(yHi, cfBotY);
    if (!(hi > lo)) return false;
    // A vertex on the CF is grown only when its y is inside the pleat region. An
    // eps of kCfEps keeps the region-edge vertices consistent.
    auto inRegion = [&](double y) { return y >= lo - kCfEps && y <= hi + kCfEps; };

    // The true neck point is cmds[0] on a bodice/top front (the neckline lives on
    // this piece). It must NOT move — the neckline + neck facing still match there.
    // On a yoke "Front Body" (below the yoke) there is no neckline, but keeping the
    // first vertex fixed and jogging back to it is harmless (it stays a clean
    // corner). We grow every OTHER CF vertex outward by the half-underlay. A
    // skirt/lower panel (protectNeckPoint == false) has no neckline on its top edge.
    const Point neckPointCF = front.commands[0].to;
    const bool neckOnCF = protectNeckPoint && std::abs(neckPointCF.x - cfX) < kCfEps;

    std::vector<PathCommand>& cmds = front.commands;
    std::vector<PathCommand> grown;
    grown.reserve(cmds.size() + 1);
    for (size_t i = 0; i < cmds.size(); ++i) {
        PathCommand c = cmds[i];
        if (c.type == CmdType::Close) { grown.push_back(c); continue; }
        // Keep a grown curve smooth: any control point on the CF (inside the region)
        // grows with it.
        if (c.type == CmdType::Curve) {
            if (std::abs(c.cp1.x - cfX) < kCfEps && inRegion(c.cp1.y)) c.cp1 = outward(c.cp1, kUnderlayHalf);
            if (std::abs(c.cp2.x - cfX) < kCfEps && inRegion(c.cp2.y)) c.cp2 = outward(c.cp2, kUnderlayHalf);
        }
        // Does this command ARRIVE at the true neck point? (the last CF vertex on a
        // bodice/top front). Grow to the widened stand top, then jog back to the
        // true neck point so the neckline is untouched.
        const bool arrivesAtNeck = i != 0 && neckOnCF &&
                                   std::abs(c.to.x - neckPointCF.x) < kCfEps &&
                                   std::abs(c.to.y - neckPointCF.y) < kCfEps;
        if (arrivesAtNeck && inRegion(c.to.y)) {
            c.to = outward(c.to, kUnderlayHalf);
            grown.push_back(c);
            grown.push_back(PathCommand::line(neckPointCF)); // stand top -> neck point
        } else if (i != 0 && std::abs(c.to.x - cfX) < kCfEps && inRegion(c.to.y)) {
            c.to = outward(c.to, kUnderlayHalf);
            grown.push_back(c);
        } else {
            grown.push_back(c);
        }
    }
    front.commands = grown;

    // The piece stays CUT ON FOLD (the pleat presses to the CF fold), so we do NOT
    // flip it to cut 2 (that is the placket's behaviour, and a box pleat is the
    // opposite — it closes the center rather than opening it).

    // Pleat fold-line markings, from the region top to bottom:
    //   * the CENTER line at x = cfX  — the fold the pleat presses to (the two
    //     mirrored halves meet here on the right side);
    //   * the UNDERLAY fold at x = cfX - kUnderlayHalf — where the underlay turns
    //     back behind the pleat.
    const double topY = lo, botY = hi;
    front.markings.push_back(PathCommand::move({cfX, topY}));
    front.markings.push_back(PathCommand::line({cfX, botY}));            // center fold
    const double underlayX = cfX - kUnderlayHalf;
    front.markings.push_back(PathCommand::move({underlayX, topY + 4}));
    front.markings.push_back(PathCommand::line({underlayX, botY - 4}));  // underlay fold
    // A short arrow at the top pointing the underlay toward center — "fold to
    // center" — so the direction of the inverted pleat is unambiguous.
    const double arrowY = topY + std::min(30.0, (botY - topY) * 0.15);
    front.markings.push_back(PathCommand::move({underlayX, arrowY}));
    front.markings.push_back(PathCommand::line({cfX, arrowY}));
    front.markings.push_back(PathCommand::move({cfX - 8, arrowY - 4}));
    front.markings.push_back(PathCommand::line({cfX, arrowY}));
    front.markings.push_back(PathCommand::move({cfX - 8, arrowY + 4}));
    front.markings.push_back(PathCommand::line({cfX, arrowY}));

    // Record the construction on the piece so the metadata is honest about the
    // extra fold (a pressed pleat is a real construction feature).
    const long deep = std::lround(depthMM);
    front.closure = "inverted box pleat (center front, " + std::to_string(deep) + " mm deep)";
    return true;
}

bool apply(DraftedPattern& pattern, BoxPleat style) {
    if (style == BoxPleat::None) return true;

    PatternPiece* front = frontFoldPanel(pattern);
    if (!front || front->commands.empty() || front->commands[0].type != CmdType::Move) {
        pattern.guideSteps.push_back(
            "Box pleat: skipped — this garment has no center-front foldable panel to "
            "carry a center inverted box pleat (a skirt-only draft, or a front cut in "
            "two halves with no CF fold). Add the pleat by hand if you want one.");
        return false;
    }

    // The pleat is centered on the CF fold. Confirm the piece is cut ON THE FOLD —
    // a cut-2 front (an opened placket / princess side) has no single fold to press
    // the pleat to, so it is an honest skip.
    if (front->cutInstruction.find("on fold") == std::string::npos) {
        pattern.guideSteps.push_back(
            "Box pleat: skipped — the front piece is not cut on the fold, so there is "
            "no center-front fold to press an inverted box pleat to. (An opened front "
            "placket or a cut-in-two front cannot also carry a center box pleat.)");
        return false;
    }

    const double cfX = minOutlineX(*front);
    if (std::abs(cfX) > 40.0) {
        // The panel's fold edge is nowhere near x = 0 — an unexpected topology; do
        // not risk widening the wrong edge.
        pattern.guideSteps.push_back(
            "Box pleat: skipped — could not locate the center-front fold on this "
            "front piece.");
        return false;
    }
    double cfTopY, cfBotY;
    cfEdgeExtent(*front, cfX, cfTopY, cfBotY);
    if (!(cfBotY > cfTopY)) {
        pattern.guideSteps.push_back(
            "Box pleat: skipped — the center-front edge is too short to host a pleat.");
        return false;
    }

    // Grow the FULL CF edge (the box pleat runs the whole length of the panel) and
    // stamp the fold lines. protectNeckPoint keeps the neckline trued on a bodice/
    // top front. Passing [cfTopY, cfBotY] makes the reusable primitive act on every
    // CF vertex — byte-identical with the original inline loop.
    growCfPleat(*front, cfTopY, cfBotY, /*protectNeckPoint=*/true);

    // The piece stays CUT ON FOLD (the pleat presses to the CF fold), so we do NOT
    // flip it to cut 2 (that is the placket's behaviour, and a box pleat is the
    // opposite — it closes the center rather than opening it).

    const long deep = std::lround(depthMM);
    pattern.guideSteps.push_back(
        std::string("Center inverted box pleat: this front is cut ON THE FOLD but "
        "WIDER at the center front by ") +
        std::to_string(static_cast<long>(std::lround(kUnderlayHalf))) +
        " mm (the pleat underlay). Fold the underlay back behind the fabric on the "
        "two marked fold lines so the extra width tucks UNDER and the two folds meet "
        "at the center-front line — this is an inverted box pleat " +
        std::to_string(deep) +
        " mm deep on each side. Press the pleat flat, baste across the top edge to "
        "hold it, then treat the folded (finished) width as the normal center front "
        "when you join the panel — the finished width equals the un-pleated width, "
        "so the yoke/waist seam still trues. The pleat hangs closed at the top and "
        "swings open below for the swing/doll silhouette.");

    // A center box pleat adds its underlay of self-fabric down the front.
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.1, 1);
    return true;
}

} // namespace BoxPleatBlock
} // namespace stitchu
