#include "tie.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace TieBlock {

namespace {

constexpr double SA = 15;  // 15 mm seam allowance per edge (Aldrich/Armstrong)

// One self-fabric tie strip, cut as a rectangle folded lengthwise into a tube.
// finishedW / finishedL are the finished (sewn, turned) dimensions in mm; the
// cut rectangle is (2·finishedW + 2·SA) wide × (finishedL + 2·SA) long, so the
// lengthwise fold self-lines it. The piece IS the cut rectangle (SA baked into
// the cut note, like the ruffle strip), drawn at finished size with the fold
// line + seam lines marked.
PatternPiece tieStrip(const std::string& name, const std::string& role,
                      double finishedW, double finishedL, int count) {
    const double cutW = 2 * finishedW + 2 * SA;
    const double cutL = finishedL + 2 * SA;

    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction =
        "cut " + std::to_string(count) + " rectangle(s) " +
        std::to_string(static_cast<long>(std::lround(cutW))) + " x " +
        std::to_string(static_cast<long>(std::lround(cutL))) +
        " mm (finished " + std::to_string(static_cast<long>(std::lround(finishedW))) +
        " x " + std::to_string(static_cast<long>(std::lround(finishedL))) +
        " mm), " + role;

    // Outline at CUT size: a rectangle. The fold line runs lengthwise up the
    // middle; the tube is sewn along the long open edge + one short end, then
    // turned right side out.
    piece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({cutW, 0}),
        PathCommand::line({cutW, cutL}),
        PathCommand::line({0, cutL}),
        PathCommand::close(),
    };

    // Fold line up the centre (self-lines the tie), and the two long seam lines.
    piece.markings.push_back(PathCommand::move({cutW / 2, 0}));
    piece.markings.push_back(PathCommand::line({cutW / 2, cutL}));
    piece.markings.push_back(PathCommand::move({SA, 0}));
    piece.markings.push_back(PathCommand::line({SA, cutL}));
    piece.markings.push_back(PathCommand::move({cutW - SA, 0}));
    piece.markings.push_back(PathCommand::line({cutW - SA, cutL}));

    piece.hasGrainline = true;  // grain runs the length of the tie
    piece.grainline = Grainline{{cutW / 2, SA + 6}, {cutW / 2, cutL - SA - 6}};
    piece.seamAllowance = SA;
    return piece;
}

// Stamp a small placement notch (a short cross tick) on a body piece at the
// point of its outline nearest (targetX, targetY) in that piece's own frame.
// Body-frame independent: we just find the outline vertex closest to the anchor
// so the notch lands on a real edge whatever block drew the piece.
void placementNotch(PatternPiece* piece, double targetX, double targetY) {
    if (!piece || piece->commands.empty()) return;
    Point best = piece->commands[0].to;
    double bestD = 1e30;
    for (const auto& c : piece->commands) {
        if (c.type == CmdType::Close) continue;
        const double d = (c.to.x - targetX) * (c.to.x - targetX) +
                         (c.to.y - targetY) * (c.to.y - targetY);
        if (d < bestD) { bestD = d; best = c.to; }
    }
    piece->markings.push_back(PathCommand::move({best.x - 6, best.y}));
    piece->markings.push_back(PathCommand::line({best.x + 6, best.y}));
    piece->markings.push_back(PathCommand::move({best.x, best.y - 6}));
    piece->markings.push_back(PathCommand::line({best.x, best.y + 6}));
}

PatternPiece* findPiece(DraftedPattern& pattern, std::initializer_list<const char*> names) {
    for (const char* name : names)
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    return nullptr;
}

// The lowest edge (largest y) of a piece is its waist/hem edge; return a point
// on it near the centre-of-that-edge for a placement notch anchor.
Point waistEdgeAnchor(PatternPiece* piece) {
    if (!piece || piece->commands.empty()) return {0, 0};
    double maxY = piece->commands[0].to.y, minX = 1e30, maxX = -1e30;
    for (const auto& c : piece->commands) {
        if (c.type == CmdType::Close) continue;
        maxY = std::max(maxY, c.to.y);
        minX = std::min(minX, c.to.x);
        maxX = std::max(maxX, c.to.x);
    }
    return {(minX + maxX) / 2, maxY};
}

} // namespace

bool apply(DraftedPattern& pattern, TiePlacement placement, double waistMM) {
    if (placement == TiePlacement::None) return true;

    // Finished dimensions per placement (mm) — from FORMULAS.md "Fabric ties /
    // sashes". Back sash length scales a little with the waist so the two halves
    // reach round to knot at the back.
    double finishedW = 30, finishedL = 320;
    int count = 2;
    const char* role = "";
    std::string name;
    PatternPiece* body = nullptr;

    switch (placement) {
        case TiePlacement::BackWaist:
        case TiePlacement::BackWaistBow: {
            // A self-fabric sash: two halves caught at the back waist that knot
            // into a bow. Each half must reach from the side/back seam round to
            // the centre back plus enough to tie — half the waist + a bow margin.
            finishedW = 30;
            finishedL = std::round(std::max(300.0, waistMM * 0.5 + 250.0));
            count = 2;
            name = "Waist Tie (bel bağı)";
            role = "each ties from the side seam round to a bow at centre back";
            body = findPiece(pattern, {"Bodice Back", "Bodice Side Back",
                                       "Top Back", "Top Side Back"});
            break;
        }
        case TiePlacement::TieBack: {
            // Open-back tie-back closure: shorter ties attached at the back
            // waist edges that cross and knot to close the back.
            finishedW = 25;
            finishedL = 300;
            count = 2;
            name = "Back Tie (sırt bağı)";
            role = "attach at each back waist edge, cross and knot to close the back";
            body = findPiece(pattern, {"Bodice Back", "Bodice Side Back",
                                       "Top Back", "Top Side Back"});
            break;
        }
        case TiePlacement::FrontNeckBow: {
            // A narrower bow at the front neckline / centre-front bust.
            finishedW = 25;
            finishedL = 350;
            count = 2;
            name = "Neck/Front Tie (ön bağ)";
            role = "attach at the front neckline/centre front and knot into a bow";
            body = findPiece(pattern, {"Bodice Center Front", "Bodice Front",
                                       "Top Center Front", "Top Front"});
            break;
        }
        case TiePlacement::CuffTies: {
            // Narrow ties at each sleeve cuff / opening.
            finishedW = 15;
            finishedL = 180;
            count = 2;
            name = "Cuff Tie (manşet bağı)";
            role = "attach at each sleeve opening and knot round the arm";
            body = findPiece(pattern, {"Sleeve", "Bodice Sleeve", "Top Sleeve"});
            break;
        }
        case TiePlacement::None:
            return true;
    }

    pattern.pieces.push_back(tieStrip(name, role, finishedW, finishedL, count));

    // Placement notch on the body piece so the sewer knows where the tie is
    // caught. Anchored to the waist/hem edge (back sash / tie-back) or nearest
    // outline point; harmless if the target piece is missing.
    if (body) {
        if (placement == TiePlacement::BackWaist ||
            placement == TiePlacement::BackWaistBow ||
            placement == TiePlacement::TieBack) {
            const Point a = waistEdgeAnchor(body);
            placementNotch(body, a.x, a.y);
        } else {
            // front neck bow / cuff: notch near the top edge (smallest y).
            double minY = body->commands.empty() ? 0 : body->commands[0].to.y;
            for (const auto& c : body->commands)
                if (c.type != CmdType::Close) minY = std::min(minY, c.to.y);
            placementNotch(body, 0, minY);
        }
    }

    pattern.guideSteps.push_back(
        "Ties (bağ): cut the tie rectangle(s) as labelled, fold each in half "
        "lengthwise right sides together, stitch the long edge and one short end, "
        "turn right side out and press. Stitch the raw end to the marked placement "
        "notch (right sides together, caught in the seam), then knot into a bow. "
        "The tie is self-fabric — cut on the straight grain.");

    // Self-fabric ties add a little fabric.
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.15, 1);
    return true;
}

} // namespace TieBlock
} // namespace stitchu
