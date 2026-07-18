#include "neckext.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

namespace stitchu {
namespace NecklineExtBlock {

namespace {

constexpr double SA = constants::kSeamAllowanceMM; // seam allowance per edge (constants.yaml)

// --- pussy-bow dimensions (FORMULAS.md "Cowl + pussy-bow neckline") ----------
constexpr double bandH = 55;      // high neck band height (mm) — tall enough to
                                  // stand and carry the tie ends
constexpr double bandRise = 12;   // CF tilt so the band closes round the throat
constexpr double tieFinishedW = 55;  // finished bow-tie width (mm)

// The neckline runs from commands[0] (centre-neck) up to the neck point at the
// shoulder — the outline vertex with the smallest y. Sum the sewing-line length
// of exactly those commands: HALF the front (or back) neckline on the curve.
double halfNecklineLen(const PatternPiece* piece) {
    if (!piece || piece->commands.size() < 3) return 0;
    const auto& c = piece->commands;
    if (c[0].type != CmdType::Move) return 0;
    size_t neckEnd = 1;
    double minY = c[0].to.y;
    for (size_t i = 1; i < c.size(); ++i) {
        if (c[i].type == CmdType::Close) break;
        if (c[i].to.y <= minY + 1e-6) { minY = c[i].to.y; neckEnd = i; }
        else break;
    }
    std::vector<PathCommand> neck;
    neck.reserve(neckEnd + 1);
    neck.push_back(PathCommand::move(c[0].to));
    for (size_t i = 1; i <= neckEnd; ++i) neck.push_back(c[i]);
    return pathLength(neck);
}

PatternPiece* findFront(DraftedPattern& pattern) {
    for (auto& p : pattern.pieces)
        if (p.name == "Bodice Center Front" || p.name == "Bodice Front" ||
            p.name == "Top Center Front" || p.name == "Top Front")
            return &p;
    return nullptr;
}

// A high stand band, attach edge trued STRAIGHT to the neckline length `neckLen`
// (CB fold x=0 to CF x=neckLen on y=0). CF top tilts in `rise` to hug the neck.
// The band carries the tie: at CF (the throat) the tie ties into a bow.
PatternPiece bowBand(double neckLen) {
    PatternPiece piece;
    piece.name = "Pussy-bow Band (fiyonk yaka bandı)";
    piece.cutInstruction = "cut 2 on fold at centre back (1 self + 1 interfacing)";

    const Point cbBot{0, 0};
    const Point cfBot{neckLen, 0};
    const Point cfTop{neckLen - bandRise, -bandH};
    const Point cbTop{0, -bandH};
    piece.commands = {
        PathCommand::move(cbBot),
        PathCommand::line(cfBot),
        PathCommand::line(cfTop),
        PathCommand::line(cbTop),
        PathCommand::close(),
    };
    // CB fold line + a shoulder-reference notch at the neck-run midpoint.
    piece.markings.push_back(PathCommand::move({0, 0}));
    piece.markings.push_back(PathCommand::line({0, -bandH}));
    piece.markings.push_back(PathCommand::move({neckLen * 0.5, -6}));
    piece.markings.push_back(PathCommand::line({neckLen * 0.5, 6}));
    piece.hasGrainline = true;
    piece.grainline = Grainline{{neckLen * 0.5, -8}, {neckLen * 0.5, -bandH + 8}};
    piece.seamAllowance = SA;
    return piece;
}

// One self-fabric tie strip, cut as a rectangle folded lengthwise into a tube
// (identical construction to tie.cpp: 2W+2SA wide, L+2SA long, self-lined).
PatternPiece bowTie(double finishedW, double finishedL) {
    const double cutW = 2 * finishedW + 2 * SA;
    const double cutL = finishedL + 2 * SA;

    PatternPiece piece;
    piece.name = "Pussy-bow Tie (bağ şeridi)";
    piece.cutInstruction =
        "cut 2 rectangle(s) " +
        std::to_string(static_cast<long>(std::lround(cutW))) + " x " +
        std::to_string(static_cast<long>(std::lround(cutL))) +
        " mm (finished " + std::to_string(static_cast<long>(std::lround(finishedW))) +
        " x " + std::to_string(static_cast<long>(std::lround(finishedL))) +
        " mm); one tie end sews to each centre-front band end, then they knot into a bow";

    piece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({cutW, 0}),
        PathCommand::line({cutW, cutL}),
        PathCommand::line({0, cutL}),
        PathCommand::close(),
    };
    // Fold line up the centre + the two long seam lines (self-lined tube).
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

// Stamp a small placement notch (a cross tick) at the front piece's neck point.
void frontNeckNotch(PatternPiece* front) {
    if (!front || front->commands.empty()) return;
    // Neck point = the min-y outline vertex (where the band CF end lands).
    Point best = front->commands[0].to;
    for (const auto& c : front->commands) {
        if (c.type == CmdType::Close) continue;
        if (c.to.y < best.y) best = c.to;
    }
    front->markings.push_back(PathCommand::move({best.x - 6, best.y}));
    front->markings.push_back(PathCommand::line({best.x + 6, best.y}));
    front->markings.push_back(PathCommand::move({best.x, best.y - 6}));
    front->markings.push_back(PathCommand::line({best.x, best.y + 6}));
}

} // namespace

double necklineLengthMM(const DraftedPattern& pattern) {
    const PatternPiece* front = nullptr;
    const PatternPiece* back = nullptr;
    for (const auto& p : pattern.pieces) {
        if (!front && (p.name == "Bodice Center Front" || p.name == "Bodice Front" ||
                       p.name == "Top Center Front" || p.name == "Top Front"))
            front = &p;
        if (!back && (p.name == "Bodice Back" || p.name == "Bodice Center Back" ||
                      p.name == "Top Back" || p.name == "Top Center Back"))
            back = &p;
    }
    return 2 * halfNecklineLen(front) + 2 * halfNecklineLen(back);
}

bool apply(DraftedPattern& pattern, Neckline neckline, double neckCM) {
    if (neckline == Neckline::Cowl) {
        // The cloth part the outline can't carry: cut the front on the BIAS with
        // drape excess so the deep+wide neck (already drafted) falls into folds.
        PatternPiece* front = findFront(pattern);
        if (!front) {
            pattern.guideSteps.push_back(
                "Cowl: skipped — no front piece to cut on the bias.");
            return false;
        }
        // Re-mark grainline at 45° (bias). Anchor at the piece's own grainline
        // midpoint so the bias arrow lands on the panel.
        const Point a = front->grainline.from;
        const Point b = front->grainline.to;
        const Point mid{(a.x + b.x) * 0.5, (a.y + b.y) * 0.5};
        const double halfLen = std::hypot(b.x - a.x, b.y - a.y) * 0.5;
        const double diag = halfLen * 0.70710678;  // 45° component
        front->grainline = Grainline{{mid.x - diag, mid.y - diag},
                                     {mid.x + diag, mid.y + diag}};
        // Amend the cut note (append, don't replace the fold instruction).
        front->cutInstruction += " — CUT ON THE BIAS (grainline at 45°); the deep "
            "neck is drape excess that falls into soft cowl folds, self-facing "
            "the raw neck edge";
        pattern.guideSteps.push_back(
            "Cowl neckline: the front is cut on the bias so the wide, deep neck "
            "falls into soft self-facing folds. Fold the neck edge back to itself "
            "(no separate facing) — the bias drape holds the folds. Staystitch "
            "nothing on the neck: the bias must move freely to drape.");
        return true;
    }

    if (neckline == Neckline::PussyBow) {
        const double neckFull = necklineLengthMM(pattern);
        if (neckFull < 60) {
            pattern.guideSteps.push_back(
                "Pussy-bow: skipped — no measurable neckline to carry the band.");
            return false;
        }
        // The band spans HALF the draft (CB fold to CF), self-mirrored.
        const double half = neckFull / 2;
        pattern.pieces.push_back(bowBand(half));

        // Tie length: long enough to knot a bow with hanging ends. Off the body:
        // ~2× neck girth so each end reaches round + hangs (measured, not a fixed
        // magic length). Clamped to a sane [700, 1400] mm.
        double tieL = neckCM * 10 * 2.0;
        tieL = std::clamp(tieL, 700.0, 1400.0);
        pattern.pieces.push_back(bowTie(tieFinishedW, tieL));

        frontNeckNotch(findFront(pattern));

        pattern.guideSteps.push_back(
            "Pussy-bow neckline: the band's bottom edge is drafted to the exact "
            "neckline length and curved up at centre front so it stands round the "
            "throat. Interface one band layer, fold, stitch the ends, turn, then "
            "sew the bottom edge to the neckline (match the CB fold + shoulder "
            "notches, no ease). Sew one tie end into each centre-front band end. "
            "Fold each tie lengthwise, stitch the long edge + one short end, turn "
            "and press. Knot the two ties into a bow at the throat.");
        return true;
    }

    return false;  // the 7 original necklines — nothing to do (byte-identical)
}

} // namespace NecklineExtBlock
} // namespace stitchu
