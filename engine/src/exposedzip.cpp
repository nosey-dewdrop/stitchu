#include "exposedzip.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace ExposedZipBlock {

namespace {

// Draw a visible zipper teeth glyph down a piece edge: a line from (x, top) to
// (x, bot) with short horizontal teeth ticks alternating either side, so it reads
// as an exposed zip on the pattern (distinct from the invisible-zip glyph, which
// is a plain line + ticks one side).
void teethGlyph(std::vector<PathCommand>& into, double x, double top, double bot) {
    into.push_back(PathCommand::move({x, top}));
    into.push_back(PathCommand::line({x, bot}));
    bool right = true;
    for (double y = top; y <= bot; y += 12.0) {
        into.push_back(PathCommand::move({x, y}));
        into.push_back(PathCommand::line({x + (right ? 6 : -6), y}));
        right = !right;
    }
}

// Flip a "cut 1 on fold ..." note to "cut 2 (<opening>) ..." (an exposed zip
// opens the seam, so the piece cannot be cut on the fold). Preserves any trailing
// note after the first comma.
void openSeam(std::string& cut, const char* opening) {
    const auto fold = cut.find("on fold");
    if (fold == std::string::npos) return; // already cut 2
    std::string tail;
    const auto comma = cut.find(',', fold);
    if (comma != std::string::npos) tail = cut.substr(comma);
    cut = std::string("cut 2 (") + opening + ")" + tail;
}

// Find the front OR back body pieces (bodice/top/skirt) for the given side.
std::vector<PatternPiece*> sidePieces(DraftedPattern& pattern, bool front) {
    std::vector<PatternPiece*> out;
    for (auto& p : pattern.pieces) {
        const bool isFront = p.name.find("Front") != std::string::npos;
        const bool isBack = p.name.find("Back") != std::string::npos;
        const bool body = p.name.find("Bodice") != std::string::npos ||
                          p.name.find("Top") != std::string::npos ||
                          p.name.find("Skirt") != std::string::npos;
        if (body && ((front && isFront) || (!front && isBack))) out.push_back(&p);
    }
    return out;
}

} // namespace

bool apply(DraftedPattern& pattern, ExposedZip placement) {
    if (placement == ExposedZip::None) return true;
    const bool front = placement == ExposedZip::CenterFront;
    std::vector<PatternPiece*> pieces = sidePieces(pattern, front);
    if (pieces.empty()) {
        pattern.guideSteps.push_back(
            std::string("Exposed zipper: skipped — this garment has no center-") +
            (front ? "front" : "back") + " body piece to set it into.");
        return false;
    }

    const char* opening = front ? "center front opening" : "center back opening";
    bool anyTagged = false;
    for (PatternPiece* p : pieces) {
        // CF is at x = 0 (fold edge) for a front-center piece; for a CB "cut 2"
        // panel the seam is the min-x edge. Draw the glyph on that seam edge.
        double minX = 1e18, minY = 1e18, maxY = -1e18;
        for (const auto& c : p->commands) {
            if (c.type == CmdType::Close) continue;
            minX = std::min(minX, c.to.x);
            minY = std::min(minY, c.to.y);
            maxY = std::max(maxY, c.to.y);
        }
        const double seamX = minX + 5; // just inside the seam edge
        const double top = minY + (maxY - minY) * 0.02;
        // A dress/bodice exposed zip runs the upper section; a skirt/top runs full.
        const double bot = maxY;
        teethGlyph(p->notches, seamX, top, bot);
        openSeam(p->cutInstruction, opening);
        if (!anyTagged) {
            p->closure = std::string("exposed zipper (center ") + (front ? "front)" : "back)");
            anyTagged = true;
        }
    }

    pattern.guideSteps.push_back(
        std::string("Exposed zipper: this is a VISIBLE design zip set into the center ") +
        (front ? "front" : "back") + " — do NOT cut that edge on the fold (cut 2). Finish the "
        "opening as a faced slot: turn the seam allowance back " +
        std::to_string(static_cast<long>(std::lround(seamAllowance))) +
        " mm on each side, press, then topstitch each folded edge flat over the zipper "
        "tape close to the teeth so the zip shows on the outside. Use a metal or chunky "
        "plastic zip the length of the opening; the marked teeth line shows where it sits.");
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140, 1);
    return true;
}

} // namespace ExposedZipBlock
} // namespace stitchu
