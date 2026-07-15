#include "openback.hpp"

#include <algorithm>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace OpenBackBlock {

namespace {

// The back center piece carries the CB fold at x = 0 in every block (mirrors the
// keyhole's frontCenter). commands[0] is the CB nape edge.
PatternPiece* backCenter(DraftedPattern& pattern) {
    for (const char* name : {"Bodice Center Back", "Bodice Back",
                             "Top Center Back", "Top Back"}) {
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    }
    return nullptr;
}

// The opening's half-outline against the CB fold (x = 0), running from its top
// point at {0, yTop} down to its bottom point at {0, yBottom}. Mirrored across
// x = 0 it reads as the full symmetric cutout. Shape decides the silhouette.
std::vector<PathCommand> openingHalf(BackOpening shape, double yTop, double length,
                                     double halfW) {
    const double yBottom = yTop + length;
    switch (shape) {
        case BackOpening::RoundCutout: {
            // A wide oval: bulge out to halfW at mid-height, round back to the CB.
            const double yMid = yTop + length * 0.5;
            return {
                PathCommand::move({0, yTop}),
                PathCommand::curve({halfW, yMid}, {halfW * 0.75, yTop},
                                   {halfW, yTop + length * 0.22}),
                PathCommand::curve({0, yBottom}, {halfW, yTop + length * 0.78},
                                   {halfW * 0.75, yBottom}),
            };
        }
        case BackOpening::LowV: {
            // Narrow at the nape, widens as it drops, meets at a low point.
            return {
                PathCommand::move({0, yTop}),
                PathCommand::line({halfW, yTop + length * 0.55}),
                PathCommand::line({0, yBottom}),
            };
        }
        case BackOpening::Square: {
            // A rectangular scoop with softened bottom corner.
            return {
                PathCommand::move({0, yTop}),
                PathCommand::line({halfW, yTop}),
                PathCommand::line({halfW, yBottom - halfW * 0.25}),
                PathCommand::curve({0, yBottom}, {halfW, yBottom},
                                   {halfW * 0.5, yBottom}),
            };
        }
        case BackOpening::Keyhole:
        default: {
            // Teardrop: slit-narrow at the top, round at the bottom (like the
            // front keyhole, mirrored onto the back).
            const double yMid = yTop + length * 0.62;
            return {
                PathCommand::move({0, yTop}),
                PathCommand::curve({halfW, yMid}, {halfW * 0.9, yTop + length * 0.15},
                                   {halfW, yTop + length * 0.38}),
                PathCommand::curve({0, yBottom}, {halfW, yTop + length * 0.85},
                                   {halfW * 0.55, yBottom}),
            };
        }
    }
}

// The facing half-outline: the same silhouette pushed OUT by `margin` on every
// side (top up, bottom down, width out), so the facing is a solid shape that
// covers the opening plus a seam-allowance-free margin. Closed on the CB fold.
std::vector<PathCommand> facingHalf(BackOpening shape, double yTop, double length,
                                    double halfW, double margin) {
    const double fTop = yTop - margin;
    const double fLen = length + 2 * margin;
    const double fHalfW = halfW + margin;
    std::vector<PathCommand> half = openingHalf(shape, fTop, fLen, fHalfW);
    half.push_back(PathCommand::close());
    return half;
}

const char* shapeTitle(BackOpening shape) {
    switch (shape) {
        case BackOpening::RoundCutout: return "round";
        case BackOpening::LowV:        return "low-V";
        case BackOpening::Square:      return "square";
        case BackOpening::Keyhole:     return "keyhole";
        default:                       return "";
    }
}

double halfWidthFrac(BackOpening shape) {
    switch (shape) {
        case BackOpening::RoundCutout: return roundHalfW;
        case BackOpening::LowV:        return vHalfW;
        case BackOpening::Square:      return squareHalfW;
        case BackOpening::Keyhole:     return keyholeHalfW;
        default:                       return roundHalfW;
    }
}

} // namespace

bool apply(DraftedPattern& pattern, BackOpening shape) {
    if (shape == BackOpening::None) return true;

    PatternPiece* back = backCenter(pattern);
    if (!back || back->commands.empty() || back->commands[0].type != CmdType::Move) {
        pattern.guideSteps.push_back(
            "Open back: skipped — this garment has no back bodice piece to carry a cutout.");
        return false;
    }

    const double napeY = back->commands[0].to.y; // CB nape edge (center back neck)
    // The CB edge bottom: the deepest outline point near the fold (x < 20).
    double cbBottom = napeY;
    for (const auto& cmd : back->commands)
        if (cmd.type != CmdType::Close && cmd.to.x < 20)
            cbBottom = std::max(cbBottom, cmd.to.y);

    const double yTop = napeY + gapBelowNape;
    const double available = cbBottom - yTop - waistClearance;
    if (available < minLength) {
        pattern.guideSteps.push_back(
            "Open back: skipped — the back is too short below the nape to carry an "
            "open-back cutout.");
        return false;
    }
    const double length = std::min(maxLength, available);
    const double halfW = length * halfWidthFrac(shape);

    // 1) Opening stitch line on the back piece — the HALF against the CB fold
    // (x = 0..+halfW). The back is cut on the fold, so this half unfolds into the
    // full symmetric cutout in fabric (same convention as the keyhole). Drawing
    // only the fold-side half keeps every marking inside the piece outline.
    const std::vector<PathCommand> half = openingHalf(shape, yTop, length, halfW);
    for (const auto& cmd : half) back->markings.push_back(cmd);

    // 2) Facing piece — a solid shape covering the opening plus margin, cut on
    // the same CB fold, with the opening stitch line marked so it lines up.
    // TRUING: the facing's inner (opening) edge = the opening edge, measured.
    PatternPiece facing;
    facing.name = std::string("Open Back Facing (") + shapeTitle(shape) + ")";
    facing.cutInstruction = "cut 1 on fold, interface";
    facing.commands = facingHalf(shape, yTop, length, halfW, facingMargin);
    for (const auto& cmd : half) facing.markings.push_back(cmd);
    facing.hasGrainline = true;
    facing.grainline = Grainline{{(halfW + facingMargin) * 0.5, yTop - facingMargin + 14},
                                 {(halfW + facingMargin) * 0.5, yTop + length + facingMargin - 14}};
    facing.seamAllowance = 0; // sewn ON the marked opening line, then slashed
    pattern.pieces.push_back(facing);

    // Construction: worked before the side/shoulder seams close, right after the
    // neckline facing is understitched (same slot as the keyhole).
    const std::string t = shapeTitle(shape);
    const std::vector<std::string> steps{
        "Open back: fuse interfacing to the open-back facing and finish its outer edge.",
        "Pin the open-back facing to the back RIGHT sides together, matching the marked "
        "" + t + " opening. Stitch exactly on the marked line all the way around.",
        "Slash the opening inside the stitched line (through both layers); clip the "
        "curves and corners to within 2 mm of the stitching.",
        "Turn the facing through the opening to the inside, roll the seam to the edge, "
        "press, then understitch or topstitch 2 mm from the opening edge.",
    };
    auto insertAt = pattern.guideSteps.end();
    for (auto it = pattern.guideSteps.begin(); it != pattern.guideSteps.end(); ++it) {
        if (it->rfind("Understitch:", 0) == 0) { insertAt = it + 1; break; }
    }
    pattern.guideSteps.insert(insertAt, steps.begin(), steps.end());

    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.1, 1);
    return true;
}

} // namespace OpenBackBlock
} // namespace stitchu
