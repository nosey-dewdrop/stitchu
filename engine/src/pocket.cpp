#include "pocket.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace PocketBlock {

namespace {

constexpr double PI = 3.14159265358979323846;

PatternPiece* findPiece(DraftedPattern& pattern, std::initializer_list<const char*> names) {
    for (const char* name : names)
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    return nullptr;
}

// The garment reads "Skirt ..." names on a dress, plain names on a standalone
// skirt, "Bodice/Top ..." on the top half. Pick the front-most panel that best
// carries a hip/chest patch: prefer a skirt front (patch sits on the hip), then
// a bodice/top front. Returns nullptr if none.
PatternPiece* frontPanel(DraftedPattern& pattern) {
    return findPiece(pattern, {"Skirt Center Front", "Skirt Front",
                               "Center Front", "Front",
                               "Bodice Center Front", "Bodice Front",
                               "Top Center Front", "Top Front"});
}

// A SIDE panel whose side seam (the max-x edge) can host an in-seam pocket. On a
// princess draft the "Side Front" carries the side seam; on a dart draft the
// single front piece does. Prefer the skirt/lower half (a side-seam pocket sits
// at the hip).
PatternPiece* sidePanel(DraftedPattern& pattern) {
    return findPiece(pattern, {"Skirt Side Front", "Side Front",
                               "Bodice Side Front", "Skirt Front",
                               "Front", "Bodice Front", "Top Front"});
}

// Stamp an L-bracket placement mark (two short tick runs meeting at a corner) at
// the pocket's top-left seat on a body panel, so the sewer knows where to sit the
// patch. `at` is the top-left corner of where the pocket mouth sits; `w`/`h` the
// pocket size.
void patchPlacementMark(PatternPiece* piece, const Point& at, double w, double h) {
    if (!piece) return;
    // Top edge tick run (the mouth line) + left edge tick run (down the side),
    // dashed as two short strokes each so it reads as a placement guide, not a
    // seam. Corner marks at the two lower corners too.
    auto tick = [&](Point a, Point b) {
        piece->markings.push_back(PathCommand::move(a));
        piece->markings.push_back(PathCommand::line(b));
    };
    tick({at.x, at.y}, {at.x + w, at.y});                 // mouth line
    tick({at.x, at.y}, {at.x, at.y + h});                 // left seat line
    tick({at.x + w, at.y}, {at.x + w, at.y + h * 0.35});  // right seat hint (short)
    tick({at.x, at.y + h}, {at.x + w, at.y + h});         // bottom seat line
}

// A rounded / square / pointed lower corner from (x0,topY) rectangle of size w×h.
// The top edge carries a folded self-hem: the piece is cut taller by hemDepth and
// a fold line is marked. Outline runs: down the left side, across the lower edge
// (with the chosen corner), up the right side, across the top (cut edge).
PatternPiece patchPiece(double w, double h, PatchCorner corner, double frontWidthMM) {
    PatternPiece piece;
    piece.name = "Patch Pocket (yama cep)";

    const char* cornerWord =
        corner == PatchCorner::Rounded ? "rounded" :
        corner == PatchCorner::Pointed ? "pointed" : "square";
    piece.cutInstruction =
        "cut 2 rectangle(s) " +
        std::to_string(static_cast<long>(std::lround(w))) + " x " +
        std::to_string(static_cast<long>(std::lround(h + patchHemDepth))) +
        " mm (" + std::string(cornerWord) +
        " lower corners, fold the top " +
        std::to_string(static_cast<long>(std::lround(patchHemDepth))) +
        " mm to the inside for the mouth hem; sized to " +
        std::to_string(static_cast<long>(std::lround(frontWidthMM))) +
        " mm front panel)";

    std::vector<PathCommand>& c = piece.commands;
    const double topY = 0;                 // cut top (folds down to the mouth)
    const double mouthY = patchHemDepth;   // finished mouth after the fold
    const double botY = patchHemDepth + h; // lower edge
    const double r = std::min(patchCornerR, std::min(w, h) * 0.4);

    // Start top-left, down the left side to the lower-left corner.
    c.push_back(PathCommand::move({0, topY}));
    c.push_back(PathCommand::line({0, botY - (corner == PatchCorner::Rounded ? r : 0)}));
    if (corner == PatchCorner::Rounded) {
        // quarter-circle lower-left, then across, then lower-right quarter-circle.
        c.push_back(PathCommand::curve({r, botY}, {0, botY - r * 0.45}, {r * 0.45, botY}));
        c.push_back(PathCommand::line({w - r, botY}));
        c.push_back(PathCommand::curve({w, botY - r}, {w - r * 0.45, botY}, {w, botY - r * 0.45}));
    } else if (corner == PatchCorner::Pointed) {
        // lower edge dips to a centre point (a Western/utility patch).
        c.push_back(PathCommand::line({0, botY - h * 0.18}));
        c.push_back(PathCommand::line({w / 2, botY}));
        c.push_back(PathCommand::line({w, botY - h * 0.18}));
    } else {
        c.push_back(PathCommand::line({0, botY}));
        c.push_back(PathCommand::line({w, botY}));
    }
    c.push_back(PathCommand::line({w, topY}));  // up the right side to the cut top
    c.push_back(PathCommand::close());

    // Fold line for the mouth hem (across the piece at the fold).
    piece.markings.push_back(PathCommand::move({0, mouthY}));
    piece.markings.push_back(PathCommand::line({w, mouthY}));

    piece.hasGrainline = true;
    piece.grainline = Grainline{{w / 2, mouthY + 10}, {w / 2, botY - 10}};
    piece.seamAllowance = SA;
    return piece;
}

// One in-seam pocket bag: a mirrored teardrop that seams to its pair along the
// curved edge and sews into the side seam along its straight edge. The straight
// (side-seam) edge runs down the left (x = 0); the bag bulges right toward CF.
// `mouth` = the hand-opening length on the seam, `depth` = bag length below the
// opening bottom, measured from the host seam.
PatternPiece pocketBag(double mouth, double reach, double depth) {
    PatternPiece piece;
    piece.name = "Pocket Bag (yan dikiş cebi)";
    piece.cutInstruction =
        "cut 2 pairs (4 total: 2 mirrored bags per side); the straight edge "
        "sews into the side seam over the " +
        std::to_string(static_cast<long>(std::lround(mouth))) +
        " mm hand opening, the curved edge seams to its mate";

    const double top = 0;                  // top of the opening (matched to seam)
    const double openBot = mouth;          // bottom of the hand opening
    const double bagBot = mouth + depth;   // deepest point of the bag

    std::vector<PathCommand>& c = piece.commands;
    // Straight side-seam edge: down x=0 from the opening top past the opening
    // bottom, then the bag curves out and around back up.
    c.push_back(PathCommand::move({0, top}));
    c.push_back(PathCommand::line({0, bagBot - reach * 0.35}));
    // Round the bottom of the bag out to its reach and back up toward the mouth.
    c.push_back(PathCommand::curve({reach, bagBot},
                                   {0, bagBot}, {reach * 0.55, bagBot}));
    c.push_back(PathCommand::curve({reach, openBot},
                                   {reach, bagBot - depth * 0.4}, {reach, openBot + depth * 0.5}));
    // Back to the seam at the opening bottom (the mouth), closing the bag.
    c.push_back(PathCommand::curve({0, top},
                                   {reach * 0.5, openBot}, {reach * 0.35, top}));
    c.push_back(PathCommand::close());

    piece.hasGrainline = true;
    piece.grainline = Grainline{{reach * 0.35, top + 20}, {reach * 0.35, bagBot - 20}};
    piece.seamAllowance = SA;
    return piece;
}

} // namespace

bool apply(DraftedPattern& pattern, PocketStyle style, double frontWidthMM) {
    if (style == PocketStyle::None) return true;

    if (style == PocketStyle::Patch) {
        PatternPiece* front = frontPanel(pattern);
        if (!front || front->commands.empty()) {
            pattern.guideSteps.push_back(
                "Patch pocket: skipped — this draft has no front panel to sit a "
                "patch pocket on. Add one by hand if you want it.");
            return false;
        }
        // Size the patch to the MEASURED front-panel width so it grows with the
        // body (trued to frontWidthMM, not a bare scalar), clamped to a sensible
        // patch window.
        const double w = std::round(std::clamp(frontWidthMM * patchWidthFrac, patchMinW, patchMaxW));
        const double h = std::round(w * patchAspect);
        // A hip patch reads rounded by default (the most common).
        const PatchCorner corner = PatchCorner::Rounded;

        // Seat the placement mark on the front panel: centred left-right within the
        // panel's own outline, in the upper-hip band. Read the panel bbox from its
        // own commands (each piece is drafted in local coordinates).
        const Rect r = boundingBox(front->commands);
        const double seatX = std::clamp(r.x + r.width * 0.5 - w / 2, r.x + 5, r.x + r.width - w - 5);
        const double seatY = std::clamp(r.y + r.height * 0.30, r.y + 5, r.y + r.height - h - 5);
        // Stamp the mark BEFORE adding the piece (push_back can reallocate and
        // invalidate `front`).
        patchPlacementMark(front, {seatX, seatY}, w, h);

        pattern.pieces.push_back(patchPiece(w, h, corner, frontWidthMM));

        pattern.guideSteps.push_back(
            "Patch pocket (yama cep): cut the patch piece(s) as labelled. Fold the "
            "top hem allowance to the inside and stitch it down for a clean mouth. "
            "Turn the side and lower seam allowances under (clip the curves on a "
            "rounded corner so they lie flat), press, then pin the pocket to the "
            "front at the placement mark and edge-stitch around the sides and "
            "bottom — leave the top open. Backstitch the top corners to take the "
            "strain of a hand going in.");
        pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.1, 1);
        return true;
    }

    // SideSeam: measure the host side seam and set an in-seam bag on it.
    PatternPiece* side = sidePanel(pattern);
    if (!side || side->commands.empty()) {
        pattern.guideSteps.push_back(
            "Side-seam pocket: skipped — this draft has no side-seam panel to hide "
            "an in-seam pocket in. Add one by hand if you want it.");
        return false;
    }
    // The side seam is the max-x edge of the side panel; its usable length is the
    // panel height (waist→hem on this piece). Measure from the panel's own
    // outline so the mark is trued to the real seam, not a scalar.
    const Rect r = boundingBox(side->commands);
    const double sideLen = r.height;
    if (sideLen < minSeamForBag) {
        pattern.guideSteps.push_back(
            "Side-seam pocket: skipped — the side seam is too short to hide an "
            "in-seam pocket (a cropped top can't carry one). Add one by hand.");
        return false;
    }
    const double seamX = r.x + r.width;      // the side-seam edge
    const double mouthTop = r.y + std::min(mouthBelowWaist, sideLen * 0.25);
    const double mouth = std::min(mouthOpening, sideLen - (mouthTop - r.y) - 40);
    const double mouthBot = mouthTop + mouth;

    // Mouth-opening mark: two ticks that bracket the hand opening on the side seam
    // (the seam is sewn above and below these, left open between them), plus a
    // short inward tick at each so they read as the opening ends.
    auto bracket = [&](double y) {
        side->markings.push_back(PathCommand::move({seamX, y}));
        side->markings.push_back(PathCommand::line({seamX - 18, y}));
    };
    bracket(mouthTop);
    bracket(mouthBot);
    // A dashed run down the seam between the ticks = the open section.
    side->markings.push_back(PathCommand::move({seamX - 3, mouthTop}));
    side->markings.push_back(PathCommand::line({seamX - 3, mouthBot}));

    // The bag depth is measured from the host seam: it hangs bagBelowMouth below
    // the opening but never past the panel hem.
    const double depth = std::min(bagBelowMouth, (r.y + sideLen) - mouthBot - 20);
    pattern.pieces.push_back(pocketBag(mouth, bagWidth, std::max(80.0, depth)));

    pattern.guideSteps.push_back(
        "Side-seam pocket (yan dikiş cebi): cut 4 pocket bags (2 mirrored per "
        "side). Before you sew the side seams, stitch one bag to the front side "
        "seam and one to the back side seam between the two opening marks, right "
        "sides together. Then sew the side seam above and below the opening marks, "
        "leaving the marked hand opening free, and stitch the two bags together "
        "around their curved edge to close the pouch. Press the bag toward the "
        "front; understitch the front edge so the lining doesn't roll out.");
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.2, 1);
    return true;
}

} // namespace PocketBlock
} // namespace stitchu
