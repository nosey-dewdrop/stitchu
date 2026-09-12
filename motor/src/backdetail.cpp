#include "backdetail.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace BackDetailBlock {

namespace {

// The back center piece carries the CB fold at x = 0; commands[0] is the CB nape
// (neck) point and commands[1] returns to the shoulder neck point along the neck
// edge — the same sub-path the wearability neck-opening invariant measures.
PatternPiece* backCenter(DraftedPattern& pattern) {
    for (const char* name : {"Bodice Center Back", "Bodice Back",
                             "Top Center Back", "Top Back"}) {
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    }
    return nullptr;
}

// Length of the finished BACK NECK edge on the back center piece: the sub-path
// from the CB nape point through the first command (the neck edge to the shoulder
// neck point). Doubled = the full back neck (both halves, cut 2 / on fold).
double backNeckEdge(const PatternPiece& back) {
    if (back.commands.size() < 2 || back.commands[0].type != CmdType::Move) return -1;
    std::vector<PathCommand> path{back.commands[0], back.commands[1]};
    return 2.0 * pathLength(path);
}

// Stamp a placement notch (a short cross tick) on the back center piece near its
// CB nape point so the sewer knows where the detail seams on.
void placementNotch(PatternPiece* piece) {
    if (!piece || piece->commands.empty()) return;
    const Point at = piece->commands[0].to; // CB nape
    piece->markings.push_back(PathCommand::move({at.x - 6, at.y}));
    piece->markings.push_back(PathCommand::line({at.x + 6, at.y}));
    piece->markings.push_back(PathCommand::move({at.x, at.y - 6}));
    piece->markings.push_back(PathCommand::line({at.x, at.y + 6}));
}

// A gathered ruffle strip cut LONGER than the finished attach edge so it gathers
// down to N. Cut = (N·fullness + 2·SA) long × (depth + hem + SA) deep. Attach
// edge (top) length after gathering == N (trued). Drawn at CUT size.
PatternPiece ruffleStrip(double N) {
    const double cutL = std::round(N * ruffleFullness) + 2 * SA;
    const double cutD = ruffleDepth + SA + 12; // + narrow hem allowance
    PatternPiece p;
    p.name = "Back Ruffle (arka fırfır)";
    p.cutInstruction = "cut 1 rectangle " +
        std::to_string(static_cast<long>(std::lround(cutL))) + " x " +
        std::to_string(static_cast<long>(std::lround(cutD))) +
        " mm, gather the top edge down to the back neck edge (" +
        std::to_string(static_cast<long>(std::lround(N))) + " mm)";
    p.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({cutL, 0}),
        PathCommand::line({cutL, cutD}),
        PathCommand::line({0, cutD}),
        PathCommand::close(),
    };
    // Gather line along the top attach edge.
    p.markings.push_back(PathCommand::move({SA, SA * 0.5}));
    p.markings.push_back(PathCommand::line({cutL - SA, SA * 0.5}));
    p.hasGrainline = true;
    p.grainline = Grainline{{cutL / 2, SA + 6}, {cutL / 2, cutD - SA - 6}};
    p.seamAllowance = SA;
    return p;
}

// A flat cape panel: N wide (the full back neck) at the attach edge, capeDrop
// long, hem softly widened + curved so it falls like a small back cape.
PatternPiece capePanel(double N) {
    const double topW = N;
    const double hemW = N * 1.5;   // flares out toward the hem
    const double drop = capeDrop;
    const double over = (hemW - topW) / 2;
    PatternPiece p;
    p.name = "Back Cape (arka pelerin)";
    p.cutInstruction = "cut 1 on fold (center back) — the attach edge equals the back neck edge";
    // Cut on the CB fold: draw the half, mirrored across x = 0 gives the full cape.
    // x = 0 is the CB fold; attach edge across the top, curved hem at the bottom.
    p.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({topW / 2, 0}),                 // top attach edge to shoulder
        PathCommand::line({topW / 2 + over, drop}),        // side edge flares out
        PathCommand::curve({0, drop + 20}, {topW / 2 + over, drop + 20},
                           {topW / 4, drop + 20}),          // curved hem to CB
        PathCommand::close(),
    };
    p.hasGrainline = true;
    p.grainline = Grainline{{6, 12}, {6, drop - 12}};
    p.seamAllowance = SA;
    return p;
}

// A circular flounce: an annular sector whose INNER (attach) arc = N and outer
// arc is longer, so it ripples without gathering (Aldrich circular flare worn at
// the back neck). Drawn as a part-circle half against x = 0 (cut on fold), inner
// arc trued to N.
PatternPiece flouncePanel(double N) {
    // Worn as a HALF circle (the flounce spans the back neck, k = 0.5): inner arc
    // per drawn (half) piece = N; r0 = N / π. Swept angle = π.
    const double r0 = N / M_PI;
    const double rOut = r0 + flounceDepth;
    const int seg = 48;
    PatternPiece p;
    p.name = "Back Flounce (arka volan)";
    p.cutInstruction = "cut 1 on fold (center back) — inner arc trued to the back neck edge (" +
        std::to_string(static_cast<long>(std::lround(N))) + " mm)";
    std::vector<PathCommand> cmds;
    // Inner (attach) arc, angle 0..π, centred at origin, drawn below (y grows).
    for (int i = 0; i <= seg; ++i) {
        const double a = M_PI * i / seg;
        const Point pt{r0 * std::cos(a), r0 * std::sin(a)};
        if (i == 0) cmds.push_back(PathCommand::move(pt));
        else cmds.push_back(PathCommand::line(pt));
    }
    // Down the radial side to the outer arc.
    cmds.push_back(PathCommand::line({rOut * std::cos(M_PI), rOut * std::sin(M_PI)}));
    // Outer (hem) arc back from π to 0.
    for (int i = seg; i >= 0; --i) {
        const double a = M_PI * i / seg;
        cmds.push_back(PathCommand::line({rOut * std::cos(a), rOut * std::sin(a)}));
    }
    cmds.push_back(PathCommand::close());
    p.commands = cmds;
    p.hasGrainline = true;
    p.grainline = Grainline{{0, r0 + 6}, {0, rOut - 6}};
    p.seamAllowance = SA;
    return p;
}

} // namespace

bool apply(DraftedPattern& pattern, BackDetail detail) {
    if (detail == BackDetail::None) return true;
    PatternPiece* back = backCenter(pattern);
    if (!back) {
        pattern.guideSteps.push_back(
            "Back detail: skipped — this garment has no back body piece to attach it to.");
        return false;
    }
    const double N = backNeckEdge(*back);
    if (N <= 0) {
        pattern.guideSteps.push_back(
            "Back detail: skipped — the back neck edge could not be measured.");
        return false;
    }

    PatternPiece piece;
    const char* step = "";
    switch (detail) {
        case BackDetail::Ruffle:
            piece = ruffleStrip(N);
            step = "Back ruffle: cut the strip as labelled, run two rows of gathering along the "
                   "top edge and pull it down to the back neck edge, matching the notch at the "
                   "center back. Sew it to the back neck seam right sides together, press up, then "
                   "finish its free edge with a narrow hem so it frills down the back.";
            break;
        case BackDetail::Cape:
            piece = capePanel(N);
            step = "Back cape: cut the cape panel on the center-back fold. Its top (attach) edge "
                   "equals the back neck edge; pin it to the back neck matching the center-back "
                   "notch and catch it into the neckline seam/binding so it drapes down the back. "
                   "Hem the curved lower edge narrow.";
            break;
        case BackDetail::Flounce:
            piece = flouncePanel(N);
            step = "Back flounce: cut the flounce on the center-back fold — its inner (attach) arc "
                   "equals the back neck edge, its longer outer arc ripples on its own (no "
                   "gathering). Seam the inner arc to the back neck matching the center-back notch, "
                   "press up, hem the outer edge narrow.";
            break;
        case BackDetail::None:
            return true;
    }
    pattern.pieces.push_back(piece);
    // Re-resolve after the push_back (may have reallocated) and stamp the notch.
    placementNotch(backCenter(pattern));
    pattern.guideSteps.push_back(step);
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.25, 1);
    return true;
}

} // namespace BackDetailBlock
} // namespace stitchu
