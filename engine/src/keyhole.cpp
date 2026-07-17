#include "keyhole.hpp"

#include <algorithm>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace KeyholeBlock {

namespace {

// The front center piece carries the CF edge at x = 0 in every block.
PatternPiece* frontCenter(DraftedPattern& pattern) {
    for (const char* name : {"Bodice Center Front", "Bodice Front",
                             "Top Center Front", "Top Front"}) {
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    }
    return nullptr;
}

// Half teardrop against the CF fold (x = 0): slit-narrow at the top, round at
// the bottom. Mirrored on CF it reads as the keyhole.
std::vector<PathCommand> teardrop(double yTop, double length, double halfW) {
    const double yMid = yTop + length * 0.62;
    const double yBottom = yTop + length;
    return {
        PathCommand::move({0, yTop}),
        PathCommand::curve({halfW, yMid}, {halfW * 0.9, yTop + length * 0.15},
                           {halfW, yTop + length * 0.38}),
        PathCommand::curve({0, yBottom}, {halfW, yTop + length * 0.85},
                           {halfW * 0.55, yBottom}),
    };
}

} // namespace

bool apply(DraftedPattern& pattern) {
    PatternPiece* front = frontCenter(pattern);
    if (!front || front->commands.empty() || front->commands[0].type != CmdType::Move) {
        pattern.guideSteps.push_back(
            "Keyhole: skipped — this garment has no front bodice piece to carry it.");
        return false;
    }

    const double neckY = front->commands[0].to.y; // CF neck edge (centerNeck)
    // The CF edge bottom: the deepest outline point near the fold.
    double cfBottom = neckY;
    for (const auto& cmd : front->commands)
        if (cmd.type != CmdType::Close && cmd.to.x < 20)
            cfBottom = std::max(cfBottom, cmd.to.y);

    const double yTop = neckY + gapBelowNeck;
    const double available = cfBottom - yTop - waistClearance;
    if (available < minLength) {
        pattern.guideSteps.push_back(
            "Keyhole: skipped — the bodice front is too short below this neckline "
            "to fit a keyhole opening.");
        return false;
    }
    const double length = std::min(maxLength, available);
    const double halfW = length * 0.26;

    // Stitch line on the garment front.
    for (const auto& cmd : teardrop(yTop, length, halfW)) front->markings.push_back(cmd);

    // Facing: a solid piece covering the opening plus margin, cut on the same
    // fold, with the stitch line marked so it lines up with the front.
    PatternPiece facing;
    facing.name = "Keyhole Facing";
    facing.cutInstruction = "cut 1 on fold, interface";
    const double fTop = yTop - facingMargin;
    const double fBottom = yTop + length + facingMargin;
    const double fHalfW = halfW + facingMargin;
    const double fMid = yTop + length * 0.62;
    facing.commands = {
        PathCommand::move({0, fTop}),
        PathCommand::curve({fHalfW, fMid}, {fHalfW * 0.9, fTop + (fMid - fTop) * 0.3},
                           {fHalfW, fTop + (fMid - fTop) * 0.7}),
        PathCommand::curve({0, fBottom}, {fHalfW, fBottom - (fBottom - fMid) * 0.5},
                           {fHalfW * 0.55, fBottom}),
        PathCommand::close(),
    };
    for (const auto& cmd : teardrop(yTop, length, halfW)) facing.markings.push_back(cmd);
    facing.hasGrainline = true;
    facing.grainline = Grainline{{fHalfW * 0.55, fTop + 14}, {fHalfW * 0.55, fBottom - 14}};
    facing.seamAllowance = 0; // sewn ON the marked line, then slashed
    pattern.pieces.push_back(facing);

    // Construction goes right after the neckline facing is finished
    // (understitch step) — a keyhole is worked before side seams close.
    const std::vector<std::string> steps{
        "Keyhole: fuse interfacing to the keyhole facing and finish its outer edge.",
        "Pin the keyhole facing to the front RIGHT sides together, matching the marked "
        "teardrop. Stitch exactly on the marked line all the way around.",
        "Slash the opening inside the stitched line (through both layers), to within 2 mm "
        "of the stitching at the top point; clip the curves.",
        "Turn the facing through the opening to the inside, roll the seam to the edge, "
        "press, then understitch or topstitch 2 mm from the opening edge.",
    };
    // Anchor the keyhole steps right after the neckline is finished — whether
    // that finish is a facing ("Understitch:") or the default bias binding
    // ("Bind the neckline ..."), patch 3.10.
    auto insertAt = pattern.guideSteps.end();
    for (auto it = pattern.guideSteps.begin(); it != pattern.guideSteps.end(); ++it) {
        if (it->rfind("Understitch:", 0) == 0 ||
            it->rfind("Bind the neckline", 0) == 0) { insertAt = it + 1; break; }
    }
    pattern.guideSteps.insert(insertAt, steps.begin(), steps.end());

    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.1, 1);
    return true;
}

} // namespace KeyholeBlock
} // namespace stitchu
