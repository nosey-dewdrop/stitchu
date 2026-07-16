#include "strap.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace StrapBlock {

namespace {

PatternPiece* findPiece(DraftedPattern& pattern, std::initializer_list<const char*> names) {
    for (const char* name : names)
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    return nullptr;
}

// The shoulder point of a bodice/top front (or back): the outline vertex at the
// top of the piece (min y) FURTHEST from the centre fold (max x) — where the
// strap meets the body. Used both to size the strap span and to place the notch.
Point shoulderPoint(const PatternPiece* piece) {
    if (!piece || piece->commands.empty()) return {0, 0};
    double minY = piece->commands[0].to.y;
    for (const auto& c : piece->commands)
        if (c.type != CmdType::Close) minY = std::min(minY, c.to.y);
    // Among the vertices on (near) the top edge, take the one at the widest x.
    Point best = piece->commands[0].to;
    double bestX = -1e30;
    for (const auto& c : piece->commands) {
        if (c.type == CmdType::Close) continue;
        if (std::fabs(c.to.y - minY) < 25 && c.to.x > bestX) { bestX = c.to.x; best = c.to; }
    }
    return best;
}

// Stamp a small placement notch (a short cross tick) at (x, y) on a body piece.
void placementNotch(PatternPiece* piece, const Point& at) {
    if (!piece) return;
    piece->markings.push_back(PathCommand::move({at.x - 6, at.y}));
    piece->markings.push_back(PathCommand::line({at.x + 6, at.y}));
    piece->markings.push_back(PathCommand::move({at.x, at.y - 6}));
    piece->markings.push_back(PathCommand::line({at.x, at.y + 6}));
}

// One ruffled-strap strip, cut LONGER than the finished span so it gathers back
// down to `span`. finishedW / span are finished (sewn) dimensions in mm; the cut
// rectangle is (2·finishedW + 2·SA) wide × (span·fullness + 2·SA) long, so the
// lengthwise fold self-lines it and the extra length becomes the ruffle. The
// piece IS the cut rectangle (SA baked into the cut note, like the tie strip),
// with the lengthwise fold line + a gather line up the middle.
PatternPiece ruffledStrip(double span) {
    const double cutW = 2 * finishedWidth + 2 * SA;
    const double cutL = std::round(span * fullness) + 2 * SA;

    PatternPiece piece;
    piece.name = "Ruffled Strap (fırfırlı askı)";
    piece.cutInstruction =
        "cut 2 rectangle(s) " +
        std::to_string(static_cast<long>(std::lround(cutW))) + " x " +
        std::to_string(static_cast<long>(std::lround(cutL))) +
        " mm (finished " + std::to_string(static_cast<long>(std::lround(finishedWidth))) +
        " mm wide, gathered down to a " +
        std::to_string(static_cast<long>(std::lround(span))) +
        " mm strap), each gathers from the front shoulder over to the back";

    // Outline at CUT size: a rectangle.
    piece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({cutW, 0}),
        PathCommand::line({cutW, cutL}),
        PathCommand::line({0, cutL}),
        PathCommand::close(),
    };

    // Lengthwise fold line up the centre (self-lines the strap) + the two long
    // seam lines, like the tie tube.
    piece.markings.push_back(PathCommand::move({cutW / 2, 0}));
    piece.markings.push_back(PathCommand::line({cutW / 2, cutL}));
    piece.markings.push_back(PathCommand::move({SA, 0}));
    piece.markings.push_back(PathCommand::line({SA, cutL}));
    piece.markings.push_back(PathCommand::move({cutW - SA, 0}));
    piece.markings.push_back(PathCommand::line({cutW - SA, cutL}));

    // Gather line: a dashed run along one long edge marks where the two rows of
    // gathering pull the strip down from cutL to the finished span. Drawn just
    // inside the seam line so it reads as the gathering channel, not the fold.
    piece.markings.push_back(PathCommand::move({cutW - SA - 6, SA}));
    piece.markings.push_back(PathCommand::line({cutW - SA - 6, cutL - SA}));

    piece.hasGrainline = true;  // grain runs the length of the strap
    piece.grainline = Grainline{{cutW / 2, SA + 6}, {cutW / 2, cutL - SA - 6}};
    piece.seamAllowance = SA;
    return piece;
}

} // namespace

bool apply(DraftedPattern& pattern, StrapStyle style) {
    if (style == StrapStyle::None) return true;

    // A ruffled strap sits on a SLEEVELESS bodice/top — find the front + back top
    // edges. A sleeved or halter garment carries no shoulder strap; report honest.
    PatternPiece* front = findPiece(pattern, {"Bodice Center Front", "Bodice Front",
                                              "Top Center Front", "Top Front"});
    PatternPiece* back = findPiece(pattern, {"Bodice Center Back", "Bodice Back",
                                             "Top Center Back", "Top Back"});
    bool hasSleeve = false;
    for (const auto& p : pattern.pieces)
        if (p.name.find("Sleeve") != std::string::npos) hasSleeve = true;

    if (!front || !back || hasSleeve) {
        pattern.guideSteps.push_back(
            "Ruffled straps: skipped — this garment has no sleeveless shoulder edge "
            "to carry a separate frilled strap (sleeves or a halter frame the shoulder "
            "instead). Add a gathered frill strip by hand if you want one.");
        return false;
    }

    // Finished strap span = over-shoulder run. Trued to the front piece's shoulder
    // point height so the strap length tracks the real armhole depth, clamped to a
    // sensible strap window. defaultSpan is the couture/babydoll over-shoulder run.
    const Point fs = shoulderPoint(front);
    const Point bs = shoulderPoint(back);
    // The over-shoulder span rides the shoulder seam; the two shoulder points sit
    // at similar heights, so a plain over-shoulder allowance on the default span is
    // the honest finished length. Nudge with the front shoulder x (wider shoulder →
    // slightly longer strap) but keep it inside [minSpan, maxSpan].
    const double shoulderX = std::max(fs.x, bs.x);
    // Round the finished span to a whole mm so the cut note and the trued cut
    // length are derived from the SAME value (no float-vs-printed drift).
    const double span = std::round(std::clamp(defaultSpan + shoulderX * 0.15, minSpan, maxSpan));

    // Placement notch at each shoulder point (front + back) so the sewer knows
    // where each gathered strap end is caught. Stamp these BEFORE adding the strap
    // piece — push_back can reallocate pattern.pieces and invalidate front/back.
    placementNotch(front, fs);
    placementNotch(back, bs);

    pattern.pieces.push_back(ruffledStrip(span));

    pattern.guideSteps.push_back(
        "Ruffled straps (fırfırlı askı): cut the two strap rectangles as labelled. "
        "Fold each in half lengthwise right sides together, stitch the long edge and "
        "one short end, turn right side out and press. Run two rows of gathering along "
        "the marked gather line and pull each strip down to the marked strap span so it "
        "ruffles evenly. Stitch each gathered end to its shoulder placement notch — one "
        "end at the front, the other at the back — catching it in the top-edge seam. "
        "The strap is self-fabric; cut on the straight grain.");

    // Self-fabric ruffled straps add a little fabric (a pair of gathered strips).
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.1, 1);
    return true;
}

} // namespace StrapBlock
} // namespace stitchu
