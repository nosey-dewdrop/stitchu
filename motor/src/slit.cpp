#include "slit.hpp"

#include <algorithm>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace SlitBlock {

namespace {

// The back skirt/dress piece carries the CB at x = 0. A slit needs a CB SEAM
// (not a fold), so only a straight/fitted back qualifies. Gathered/pleated/
// half-circle panels have walking ease already and no CB seam candidate.
PatternPiece* backPiece(DraftedPattern& pattern) {
    // Prefer a princess Center Back panel, then a plain Back panel, at either the
    // dress ("Skirt ...") or standalone-skirt naming.
    for (const char* name : {"Skirt Center Back", "Skirt Back",
                             "Center Back", "Back"}) {
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    }
    return nullptr;
}

// Gathered/pleated/half-circle panels read as full-width rectangles/arcs, not a
// fitted back with a CB seam. A gathered/pleated panel is a plain rectangle: a
// Move + three axis-aligned Lines + Close, with the waist width == the hem width
// (no waist/hip/side shaping). A fitted back tapers (its side edge curves in from
// hem to waist). Refuse a vent on a rectangle so it is never forced into a
// fabric-gathered panel (defense in depth; the caller also gates on skirtStyle).
bool hostsVent(const PatternPiece& p) {
    if (p.name.find("Panel") != std::string::npos) return false; // half-circle arc
    // Detect a plain rectangle: every outline command is a Move or Line, and the
    // width at the waist (min y) equals the width at the hem (max y).
    bool allStraight = true;
    double waistMaxX = 0, hemMaxX = 0, minY = 1e18, maxY = -1e18;
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Curve) allStraight = false;
        if (c.type == CmdType::Close) continue;
        minY = std::min(minY, c.to.y);
        maxY = std::max(maxY, c.to.y);
    }
    if (!allStraight) return true; // a shaped (curved) fitted back hosts a vent
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Close) continue;
        if (std::fabs(c.to.y - minY) < 1e-6) waistMaxX = std::max(waistMaxX, c.to.x);
        if (std::fabs(c.to.y - maxY) < 1e-6) hemMaxX = std::max(hemMaxX, c.to.x);
    }
    // A rectangle (gathered/pleated): waist width == hem width, no shaping.
    return std::fabs(waistMaxX - hemMaxX) > 1.0;
}

} // namespace

bool apply(DraftedPattern& pattern, HemSlit finish) {
    if (finish == HemSlit::None) return true;

    PatternPiece* back = backPiece(pattern);
    if (!back || back->commands.empty() || back->commands[0].type != CmdType::Move ||
        !hostsVent(*back)) {
        pattern.guideSteps.push_back(
            "Back slit: skipped — this skirt has no straight center-back seam to "
            "carry a walking vent (a gathered or flared skirt walks freely without one).");
        return false;
    }

    // The hem is the deepest CB outline point (x < 20, largest y); the waist is
    // the shallowest CB point. Both come from the piece's own drawn outline so the
    // slit is trued to the real hem, not a scalar.
    const double waistY = back->commands[0].to.y;
    double hemY = waistY;
    for (const auto& cmd : back->commands)
        if (cmd.type != CmdType::Close && cmd.to.x < 20)
            hemY = std::max(hemY, cmd.to.y);

    const double backLength = hemY - waistY;
    // Keep the top point below the seat (hip line ≈ upper third) and give a real
    // walking rise; clamp to the drafting window.
    const double available = backLength - seatClearance;
    if (available < minHeight) {
        pattern.guideSteps.push_back(
            "Back slit: skipped — the skirt is too short below the seat to carry a "
            "walking slit (raise the hem or drop the slit).");
        return false;
    }
    const double height = std::clamp(defaultHeight, minHeight, std::min(maxHeight, available));
    const double topY = hemY - height; // seam stops here, opening below

    // 1) The back is now cut with a CENTER-BACK SEAM (no fold): the seam is sewn
    // from the waist to the top point and left open below it.
    back->cutInstruction = "cut 2 (center back seam, leave open below the slit mark)";

    // 2) Top-point bar tack: a short horizontal mark at the seam stop, the single
    // most-missed vent detail. Runs from the CB (x = 0) in a little way. Stays
    // inside the piece bounds.
    back->markings.push_back(PathCommand::move({0, topY}));
    back->markings.push_back(PathCommand::line({std::min(30.0, ventExtension), topY}));

    if (finish == HemSlit::Vent) {
        // 3) VENT: a folded-back extension grown onto the CB below the top point.
        // Like the placket's grown-on stand, the extension is real fabric so it
        // belongs to the OUTLINE, not a marking: the CB edge (the last line, from
        // the hem up to the waist at x = 0) is rebuilt to detour out to the
        // extension edge (x = -ventExtension) below the top point, with a 45° top
        // corner (rise == run == ventExtension). The fold line stays ON the CB
        // (x = 0) as a marking; the two backs lap closed on it when standing.
        const double corner = topY + ventExtension; // 45°: rise == run == ventExtension
        std::vector<PathCommand>& cmds = back->commands;
        // Find the CB edge: the final Line returning to {0, waistY}. Replace it
        // with the extension detour + the CB rise to the waist.
        std::vector<PathCommand> grown;
        grown.reserve(cmds.size() + 3);
        bool rebuilt = false;
        for (size_t i = 0; i < cmds.size(); ++i) {
            const PathCommand& c = cmds[i];
            const bool isCBReturn = c.type == CmdType::Line &&
                                    std::fabs(c.to.x) < 1e-9 && std::fabs(c.to.y - waistY) < 1e-9;
            // Only the CB return that departs from the hem ({0, hemY}) qualifies.
            const bool fromHem = i > 0 && std::fabs(cmds[i - 1].to.x) < 1e-9 &&
                                 std::fabs(cmds[i - 1].to.y - hemY) < 1e-9;
            if (isCBReturn && fromHem && !rebuilt) {
                grown.push_back(PathCommand::line({-ventExtension, hemY}));   // out at the hem
                grown.push_back(PathCommand::line({-ventExtension, corner})); // up the extension edge
                grown.push_back(PathCommand::line({0, topY}));               // 45° back to the CB top point
                grown.push_back(PathCommand::line({0, waistY}));             // up the CB seam to the waist
                rebuilt = true;
            } else {
                grown.push_back(c);
            }
        }
        if (rebuilt) back->commands = grown;
        // The CB fold line of the extension (it folds back on the CB) — a marking.
        back->markings.push_back(PathCommand::move({0, topY}));
        back->markings.push_back(PathCommand::line({0, hemY}));

        pattern.guideSteps.push_back(
            "Back vent: cut the two backs WITH the extension (the flap beside the "
            "center-back seam below the slit mark). Stitch the center-back seam from "
            "the waist down to the slit mark and bar-tack there. Below the mark, fold "
            "each extension to the inside on the center-back line and press; the two "
            "extensions lap so the vent lies closed. Fold the 45\xC2\xB0 top corner "
            "under, hem the skirt, then tack the top corner down through all layers.");
    } else {
        // SLIT: a plain faced opening — the seam stops at the top point, both edges
        // turn under with the hem allowance. No extension.
        pattern.guideSteps.push_back(
            "Back slit: stitch the center-back seam from the waist down to the slit "
            "mark and bar-tack there. Below the mark, press each seam allowance to the "
            "inside and turn it under, mitring the corner where it meets the hem; "
            "topstitch the open edges. Hem the skirt last.");
    }

    // A vent adds an extension flap; both finishes add a touch of fabric.
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.1, 1);
    return true;
}

} // namespace SlitBlock
} // namespace stitchu
