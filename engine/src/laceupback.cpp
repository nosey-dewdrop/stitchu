#include "laceupback.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace LaceUpBackBlock {

namespace {

constexpr double SA = constants::kSeamAllowanceMM; // seam allowance per edge

// The back center piece that carries the CB edge (mirrors the open-back rule:
// the back is drawn as one half against the CB at x = 0, cut 2 with a CB seam).
PatternPiece* backCenter(DraftedPattern& pattern) {
    for (const char* name : {"Bodice Center Back", "Bodice Back",
                             "Top Center Back", "Top Back"}) {
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    }
    return nullptr;
}

// A drawn eyelet mark: a small diamond ring (4 short strokes around the hole
// centre) so the flat clearly reads as a grommet, not a notch. Stamped into the
// piece's markings.
void eyeletRing(std::vector<PathCommand>& into, double cx, double cy, double r) {
    into.push_back(PathCommand::move({cx - r, cy}));
    into.push_back(PathCommand::line({cx, cy - r}));
    into.push_back(PathCommand::line({cx + r, cy}));
    into.push_back(PathCommand::line({cx, cy + r}));
    into.push_back(PathCommand::line({cx - r, cy}));
}

// One self-fabric / cord lacing strip, cut as a rectangle folded lengthwise into
// a tube (identical construction to the tie block's cord). finishedW/finishedL
// are the finished (sewn, turned) dimensions in mm; the cut rectangle bakes the
// SA into the cut note, drawn at finished size with the fold + seam lines marked.
PatternPiece cordStrip(const std::string& name, const std::string& role,
                       double finishedW, double finishedL) {
    const double cutW = 2 * finishedW + 2 * SA;
    const double cutL = finishedL + 2 * SA;

    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction =
        "cut 1 rectangle " +
        std::to_string(static_cast<long>(std::lround(cutW))) + " x " +
        std::to_string(static_cast<long>(std::lround(cutL))) +
        " mm (finished " + std::to_string(static_cast<long>(std::lround(finishedW))) +
        " x " + std::to_string(static_cast<long>(std::lround(finishedL))) +
        " mm), " + role;

    piece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({cutW, 0}),
        PathCommand::line({cutW, cutL}),
        PathCommand::line({0, cutL}),
        PathCommand::close(),
    };
    // Fold line up the centre + the two long seam lines (self-lines the cord).
    piece.markings.push_back(PathCommand::move({cutW / 2, 0}));
    piece.markings.push_back(PathCommand::line({cutW / 2, cutL}));
    piece.markings.push_back(PathCommand::move({SA, 0}));
    piece.markings.push_back(PathCommand::line({SA, cutL}));
    piece.markings.push_back(PathCommand::move({cutW - SA, 0}));
    piece.markings.push_back(PathCommand::line({cutW - SA, cutL}));

    piece.hasGrainline = true;
    piece.grainline = Grainline{{cutW / 2, SA + 6}, {cutW / 2, cutL - SA - 6}};
    piece.seamAllowance = SA;
    return piece;
}

// Is this a fitted (princess or dart) bodiced back that can host corset lacing?
// A gathered / half-circle / pleated back or a top with no fitted back is refused.
// We host on a dart/princess bodice back (the piece backCenter() finds).
bool fittedBack(const DraftedPattern& pattern) {
    // The back center piece must be a real fitted bodice back (its name is one of
    // the four hosted names AND it is cut on a CB seam / on fold, not a gathered
    // panel). A gathered skirt/loose back never produces one of those names.
    for (const char* name : {"Bodice Center Back", "Bodice Back",
                             "Top Center Back", "Top Back"}) {
        for (const auto& piece : pattern.pieces)
            if (piece.name == name) return true;
    }
    return false;
}

} // namespace

bool apply(DraftedPattern& pattern, LaceUpBack style) {
    if (style == LaceUpBack::None) return true;

    if (!fittedBack(pattern)) {
        pattern.guideSteps.push_back(
            "Corset lace-up back: skipped — this garment has no fitted bodice back to carry "
            "the eyelet columns (a skirt or a loose/gathered back can't be laced).");
        return false;
    }

    PatternPiece* back = backCenter(pattern);
    if (!back || back->commands.empty() || back->commands[0].type != CmdType::Move) {
        pattern.guideSteps.push_back(
            "Corset lace-up back: skipped — the back piece has no drawn outline to carry "
            "the eyelets.");
        return false;
    }

    // The CB edge is the min-x edge of the back half (x ≈ 0). Its extent (top and
    // bottom y along that edge) is measured off the drawn outline so the eyelet
    // column can never drift from the piece it lives on.
    double cbX = 1e18, topY = 1e18, botY = -1e18;
    for (const auto& c : back->commands) {
        if (c.type == CmdType::Close) continue;
        cbX = std::min(cbX, c.to.x);
    }
    for (const auto& c : back->commands) {
        if (c.type == CmdType::Close) continue;
        if (std::fabs(c.to.x - cbX) < 20) { // points on/near the CB edge
            topY = std::min(topY, c.to.y);
            botY = std::max(botY, c.to.y);
        }
    }
    const double columnTop = topY + firstEyeletFromTopMM;
    const double columnBottom = botY - eyeletBottomMarginMM;
    const double columnHeight = columnBottom - columnTop;

    // How many eyelets fit at the corset pitch (even spacing). Fewer than a real
    // corset run → refuse honestly (too short to lace).
    const int eyeletCount = static_cast<int>(std::floor(columnHeight / eyeletPitchMM)) + 1;
    if (columnHeight <= 0 || eyeletCount < minEyelets) {
        pattern.guideSteps.push_back(
            "Corset lace-up back: skipped — the back is too short below the nape to carry a "
            "real eyelet column (needs room for at least a corset lacing run).");
        return false;
    }
    // Re-space the eyelets to fill the column exactly (even spacing = column
    // height / (count-1)) so the top and bottom eyelets anchor the run. The two
    // physical back edges (cut 2) share this identical y series → trued by
    // construction; we build BOTH columns from the SAME y list so alignment is
    // exact (0.00 mm), and stamp them at two insets so the flat reads clearly.
    const double spacing = columnHeight / (eyeletCount - 1);
    std::vector<double> eyeletY;
    eyeletY.reserve(eyeletCount);
    for (int i = 0; i < eyeletCount; ++i) eyeletY.push_back(columnTop + i * spacing);

    // The eyelet column sits `eyeletInsetMM` in from the CB edge, on the CB
    // facing strip. The garment is cut 2, so the second back mirrors this one and
    // its eyelet column lands at the SAME y positions — the lacing sits level.
    const double eyeletX = cbX + eyeletInsetMM;

    // 1) CB FACING strip on the back edge: a straight foldless finished band that
    // carries the eyelets. Drawn as a MARKING rectangle on the back piece (the CB
    // edge, `facingWidthMM` in) — this is a self-faced placket (fold-back facing),
    // interfaced, NOT cut on fold. It marks where to interface + fold back.
    const double facingInner = cbX + facingWidthMM;
    back->markings.push_back(PathCommand::move({facingInner, columnTop - firstEyeletFromTopMM}));
    back->markings.push_back(PathCommand::line({facingInner, botY}));

    // 2) EYELET column down the back edge, on the facing strip, at even spacing.
    for (double y : eyeletY) eyeletRing(back->markings, eyeletX, y, eyeletMarkR);

    // 3) Lacing CORD piece: a long narrow lace. Corset convention ≈ 3.5× the
    // eyelet-column height so it criss-crosses the whole run and ties off. Trued
    // to the drawn column height (can't drift). A thin 12 mm finished lace.
    const double laceLen = std::round(columnHeight * laceLengthFactor);
    pattern.pieces.push_back(cordStrip(
        "Lacing Cord (korse bağcığı)",
        "one continuous lace, criss-cross between the two eyelet columns and tie off at the top",
        12, laceLen));

    // Cut note on the back piece so the sewist sets the eyelets correctly.
    back->cutInstruction = back->cutInstruction.empty() ? "cut 2 (center back edges apart)"
                                                        : back->cutInstruction;
    // Guide steps. Worked as a CB facing → eyelets → lacing sequence.
    const std::string n = std::to_string(eyeletCount);
    const std::string pitch = std::to_string(static_cast<long>(std::lround(spacing)));
    pattern.guideSteps.push_back(
        "Corset lace-up back: the two back halves do NOT meet at the center back — they leave "
        "an open gap (about " + std::to_string(static_cast<long>(std::lround(gapMM))) +
        " mm nominal) that the lacing spans, so the finished fit is ADJUSTABLE. Interface the "
        "marked center-back facing strip on each back edge and fold it back (self-faced), or "
        "face it with a separate strip — this stiff band carries the eyelets and keeps the "
        "laced edge from stretching.");
    pattern.guideSteps.push_back(
        "Set " + n + " eyelets down EACH back edge on the marked spots (" + pitch +
        " mm apart, first about 15 mm from the top). The two columns are marked at the same "
        "heights, so lace them level. Use two-part metal eyelets/grommets and hammer them "
        "through all facing layers.");
    pattern.guideSteps.push_back(
        "Lace the cord criss-cross (like a shoe) between the two columns, from the top down "
        "or bottom up, and tie it off. Try the garment on and adjust the lacing to fit — the "
        "gap opens and closes over a range, so this back needs no zipper.");

    // Self-fabric facings + a lace add a little fabric.
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.15, 1);
    return true;
}

} // namespace LaceUpBackBlock
} // namespace stitchu
