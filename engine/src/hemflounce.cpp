#include "hemflounce.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "contract.gen.hpp"
#include "measurements.hpp"

namespace stitchu {
namespace HemFlounceBlock {

namespace {

constexpr double SA = constants::kSeamAllowanceMM;   // seam allowance per edge (constants.yaml)

// Gathered flounce fullness (flat cut width / finished hem length). Read from the
// K1 contract (contract/tables.json draft.gatherRatios.shirred = 2:1) — the same
// source the gather block uses, so a hem flounce gathers the same 2:1 as a shirred
// panel. One number, one place.
constexpr double fullness = contract::kGatherRatio_shirred;  // 2:1 gathered flounce

constexpr double depth = 200;         // flounce drop below the hem (mm)
constexpr double hemAllowance = 15;    // extra length for the flounce's own bottom hem
constexpr double maxFabricWidth = 1400; // one 140 cm fabric width — strip is pieced
constexpr double minHem = 300;         // shortest sensible hosting hem circumference
constexpr double maxHem = 4000;        // ceiling (very full/long hem)

PatternPiece* findPiece(DraftedPattern& pattern, std::initializer_list<const char*> names) {
    for (const char* name : names)
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    return nullptr;
}

// The outline's y-extent (min,max) — the top and bottom of a piece.
void yExtent(const PatternPiece* piece, double& minY, double& maxY) {
    minY = 1e30; maxY = -1e30;
    if (!piece) return;
    for (const auto& c : piece->commands) {
        if (c.type == CmdType::Close) continue;
        minY = std::min(minY, c.to.y); maxY = std::max(maxY, c.to.y);
    }
}

// The half-width of a piece's HEM (bottom edge): the outermost side-seam x reached
// within the bottom 8 % band of the piece's own y-extent. On an on-fold body
// piece the fold sits at x ≈ 0, so this max-x is the finished half-hem for that
// panel (the same technique the gather block uses at the bust/waist band, applied
// to the piece's own bottom rather than a shared band — front and back can differ
// in length). Returns 0 for a degenerate/empty piece.
double hemHalf(const PatternPiece* piece) {
    if (!piece || piece->commands.empty()) return 0;
    double minY, maxY; yExtent(piece, minY, maxY);
    if (maxY <= minY) return 0;
    const double lo = maxY - (maxY - minY) * 0.08;
    double mx = 0;
    for (const auto& c : piece->commands) {
        if (c.type == CmdType::Close) continue;
        if (c.to.y >= lo) mx = std::max(mx, c.to.x);
    }
    return mx;
}

// The finished hem circumference, measured off the drafted front + back bottom
// edges. For a dress the hem is the SKIRT bottom; for a top it is the bodice/top
// bottom. A princess split carries the half-hem on the SIDE panel (its outer edge
// is the true side seam), so take the max over Center + Side each side. Each panel
// is a half cut on fold → double both halves for the whole ring. 0 if unmeasurable.
double finishedHemMM(DraftedPattern& pattern) {
    // Prefer a real skirt hem (dress), else the top/bodice bottom.
    PatternPiece* front = findPiece(pattern,
        {"Skirt Front", "Skirt Center Front",
         "Top Center Front", "Top Front", "Bodice Front"});
    PatternPiece* frontSide = findPiece(pattern, {"Top Side Front", "Bodice Side Front"});
    PatternPiece* back = findPiece(pattern,
        {"Skirt Back", "Skirt Center Back",
         "Top Center Back", "Top Back", "Bodice Back"});
    PatternPiece* backSide = findPiece(pattern, {"Top Side Back", "Bodice Side Back"});
    if (!front || !back) return 0;
    const double halfFront = std::max(hemHalf(front), hemHalf(frontSide));
    const double halfBack = std::max(hemHalf(back), hemHalf(backSide));
    if (halfFront <= 0 && halfBack <= 0) return 0;
    return 2 * halfFront + 2 * halfBack;   // whole hem circumference
}

// The flat gathered flounce strip: cut = hem × fullness wide (top edge, finished)
// by depth + hemAllowance + SA tall. It gathers to the whole hem, all the way
// around, so it is pieced in fabric-width SEGMENTS joined into one ring (the DRAWN
// tile is one segment; the note carries the segment count + the total flat width).
// Gather notches march across the top edge so the fullness is distributed evenly.
PatternPiece flounceStrip(double hemMM) {
    const double flatTop = hemMM * fullness;    // total gathered top edge, finished
    const int segments = std::max(1, static_cast<int>(std::ceil(flatTop / maxFabricWidth)));
    const double segFlat = flatTop / segments;
    const double cutW = segFlat + 2 * SA;        // one segment + side-seam SA
    const double cutH = depth + hemAllowance + SA; // flounce drop + its hem + top SA

    PatternPiece piece;
    piece.name = "Hem Flounce (etek ucu volanı)";
    piece.cutInstruction =
        "cut " + std::to_string(segments) + " rectangle(s) " +
        std::to_string(static_cast<long>(std::lround(cutW))) + " x " +
        std::to_string(static_cast<long>(std::lround(cutH))) +
        " mm and join into one ring (flat top edge " +
        std::to_string(static_cast<long>(std::lround(flatTop))) +
        " mm gathers to fit your " +
        std::to_string(static_cast<long>(std::lround(hemMM))) +
        " mm hem, attach all around)";

    piece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({cutW, 0}),
        PathCommand::line({cutW, cutH}),
        PathCommand::line({0, cutH}),
        PathCommand::close(),
    };

    // Gathered (top) seam line just inside the SA, with evenly spaced gather
    // notches across it so the fullness is distributed all the way around the hem.
    const double topY = SA;
    piece.markings.push_back(PathCommand::move({SA, topY}));
    piece.markings.push_back(PathCommand::line({cutW - SA, topY}));   // top seam line
    const int notches = 8;                                            // per segment
    for (int i = 1; i < notches; ++i) {
        const double x = SA + (cutW - 2 * SA) * (static_cast<double>(i) / notches);
        piece.markings.push_back(PathCommand::move({x, topY - 4}));
        piece.markings.push_back(PathCommand::line({x, topY + 4}));   // gather notch
    }

    piece.hasGrainline = true;   // grain runs vertically (down the flounce drop)
    piece.grainline = Grainline{{cutW / 2, topY + 8}, {cutW / 2, cutH - SA - 8}};
    piece.seamAllowance = SA;
    return piece;
}

// Stamp a placement notch (a short cross tick) on the body piece at the point of
// its outline nearest the anchor — the sewer knows the flounce joins there.
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

} // namespace

bool apply(DraftedPattern& pattern, HemFlounce style) {
    if (style == HemFlounce::None) return true;

    // Measure the finished hem off the drafted front + back bottom edges (like the
    // peplum reads the waist / the gather block reads its zone). A garment with no
    // measurable hosting hem (no front+back body / bottom edge) is refused honestly.
    const double hemMM = std::clamp(finishedHemMM(pattern), 0.0, maxHem);
    if (hemMM < minHem) {
        pattern.guideSteps.push_back(
            "Hem flounce: skipped — this draft has no measurable all-around hem to "
            "hang a gathered flounce from (a gathered/flared skirt already ripples; "
            "add a hem flounce by hand if you want one).");
        return false;
    }

    // The flounce's gathered top edge = hem × fullness, trued to the measured hem.
    pattern.pieces.push_back(flounceStrip(hemMM));

    // Placement notch on the front body's hem (the point nearest CF at the bottom).
    PatternPiece* front = findPiece(pattern,
        {"Skirt Front", "Skirt Center Front",
         "Top Center Front", "Top Front", "Bodice Front"});
    if (front) {
        double minY, maxY; yExtent(front, minY, maxY);
        placementNotch(front, 0, maxY);
    }

    pattern.guideSteps.push_back(
        "Hem flounce (etek ucu volanı): cut the flounce segment(s) as labelled and "
        "join them into one continuous ring at the side seams. Run two rows of "
        "gathering stitches along the top edge, then draw it up to fit your hem, "
        "matching the gather notches so the fullness sits evenly all the way around. "
        "Pin it to the garment hem right sides together, matching centre front, "
        "centre back and the side seams, and sew all around. Press the seam up into "
        "the garment. Let the flounce hang for 24 hours, then finish its bottom edge "
        "with a narrow rolled hem.");

    // A gathered flounce ring eats a fair bit of fabric (2:1 all the way around).
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.3, 1);
    return true;
}

} // namespace HemFlounceBlock
} // namespace stitchu
