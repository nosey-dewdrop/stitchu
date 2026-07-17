#include "buttonrow.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"
#include "placket.hpp"

namespace stitchu {
namespace ButtonRowBlock {

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

// Draw one round button as a small circle (4 cubic quarter-arcs) centered at
// (cx, cy) with radius r, appended to `into` (markings). A real drawn button
// glyph — not just a tick — so the pattern SHOWS the buttons the way a commercial
// sketch does. Closed sub-path so it renders as a circle, not a stray line.
void buttonCircle(std::vector<PathCommand>& into, double cx, double cy, double r) {
    const double k = 0.5522847498 * r; // cubic circle constant
    into.push_back(PathCommand::move({cx + r, cy}));
    into.push_back(PathCommand::curve({cx, cy + r}, {cx + r, cy + k}, {cx + k, cy + r}));
    into.push_back(PathCommand::curve({cx - r, cy}, {cx - k, cy + r}, {cx - r, cy + k}));
    into.push_back(PathCommand::curve({cx, cy - r}, {cx - r, cy - k}, {cx - k, cy - r}));
    into.push_back(PathCommand::curve({cx + r, cy}, {cx + k, cy - r}, {cx + r, cy - k}));
    into.push_back(PathCommand::close());
}

} // namespace

bool apply(DraftedPattern& pattern, ButtonRow row) {
    if (row == ButtonRow::None) return true;

    PatternPiece* front = frontCenter(pattern);
    if (!front || front->commands.empty() || front->commands[0].type != CmdType::Move) {
        pattern.guideSteps.push_back(
            "Button row: skipped — this garment has no front bodice piece to carry it.");
        return false;
    }

    // A FUNCTIONAL button row is a real CF opening. Reuse the placket geometry
    // (grown CF stand + fold line + buttonholes + opens for donning) so the front
    // is genuinely donnable, then draw the actual round button glyphs on top. This
    // keeps ONE source for the CF-stand geometry (no drift) and satisfies the
    // wearability fold-vs-opening invariant exactly like a placket.
    if (row == ButtonRow::Functional) {
        const bool opened = PlacketBlock::apply(pattern, 0.0, 0.0);
        if (!opened) return false; // placket already logged the honest skip
        // Re-resolve the front (apply() may have rebuilt its outline in place).
        front = frontCenter(pattern);
        if (!front) return false;
    }

    // Find the vertical run for the buttons: from a little below the neck to a
    // little above the bottom, on the CF line (x = 0 = the closure/fold line).
    const double neckY = front->commands[0].to.y;
    double bottomY = neckY;
    for (const auto& c : front->commands)
        if (c.type != CmdType::Close) bottomY = std::max(bottomY, c.to.y);
    const double firstY = neckY + 25;
    const double lastY = bottomY - 25;
    const double runLen = lastY - firstY;
    if (runLen < spacing) {
        pattern.guideSteps.push_back(
            "Button row: skipped — the front is too short to carry a sensible row of buttons.");
        return false;
    }

    const int gaps = std::max(2, static_cast<int>(std::round(runLen / spacing)));
    const double step = runLen / gaps;
    const double r = buttonDia / 2.0;
    // Where the buttons sit horizontally. A FUNCTIONAL row grew a stand to
    // negative x (the CF at x = 0 sits ON the piece), so the buttons ride the CF
    // line at x = 0. A DECORATIVE row has no stand: the piece begins at the CF
    // fold (x = 0) on its +x side, so a circle centred on x = 0 would spill off
    // the piece — nudge the button centre inward by its radius + a margin so the
    // whole circle stays on the fabric.
    const double buttonX = (row == ButtonRow::Functional) ? 0.0 : (r + 4.0);
    // Draw the buttons down the CF. A functional row also has the placket's
    // buttonhole ticks (drawn by PlacketBlock); these circles are the buttons
    // themselves so the row is visible on the pattern.
    int drawn = 0;
    for (int i = 0; i <= gaps; ++i) {
        const double y = firstY + step * i;
        if (y < neckY + 8 || y > bottomY - 8) continue;
        buttonCircle(front->markings, buttonX, y, r);
        ++drawn;
    }

    if (row == ButtonRow::Decorative) {
        // Decorative: buttons sewn ON the surface for looks, no opening. The tube
        // still needs its own closure (the CB zipper stays — a decorative row does
        // NOT set hasDonningOpening). Note it honestly.
        pattern.guideSteps.push_back(
            std::string("Decorative button row: sew ") + std::to_string(drawn) +
            " round buttons (18 mm) down the center front on the marked circles, evenly "
            "spaced ~9 cm apart. These are DECORATIVE — they do not open the garment (there "
            "are no buttonholes), so the garment still closes with its zipper. Swap the "
            "button size and re-space to taste.");
        pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140, 1);
    } else {
        pattern.guideSteps.push_back(
            std::string("Functional button row: the ") + std::to_string(drawn) +
            " marked buttons run down the center-front opening drawn above. Sew a button on "
            "the marked circle for every buttonhole so the front closes with buttons.");
    }
    return true;
}

} // namespace ButtonRowBlock
} // namespace stitchu
