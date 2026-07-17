#include "placket.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace PlacketBlock {

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

// Shift a point's x outward (negative = away from the fold, into the stand).
inline Point outward(Point p, double dx) { return {p.x + dx, p.y}; }

} // namespace

bool apply(DraftedPattern& pattern, double bustApexY, double offsetMM) {
    PatternPiece* front = frontCenter(pattern);
    if (!front || front->commands.empty() || front->commands[0].type != CmdType::Move) {
        pattern.guideSteps.push_back(
            "Front placket: skipped — this garment has no front bodice piece to carry it.");
        return false;
    }
    // An ASYMMETRIC placket carries the closure off the center front. The whole
    // closure — fold line, buttons, buttonholes and the grown edge — shifts out by
    // `offsetMM`. offsetMM == 0 is the classic symmetric CF placket, and every
    // expression below collapses to the original values, so that path stays
    // byte-identical. Guard against a nonsense negative offset.
    const bool asymmetric = offsetMM > 0.01;
    if (offsetMM < 0) offsetMM = 0;
    // The finished edge must grow by the offset PLUS the button stand, so the
    // stand still sits proud of the shifted fold line.
    const double edgeGrow = standWidth + offsetMM;
    const double foldX = -offsetMM;   // fold line x (0 when symmetric)

    // CF geometry. The outline starts at centerNeck {0..centerTakeIn, neckY} and
    // its LAST curve (before close) returns to that neck point along x ~ 0 — that
    // curve IS the center-front edge. We grow the whole CF edge outward by
    // standWidth so the finished front edge lands at x = -standWidth; the button
    // stand and its fold-back facing live between there and the CF fold at x = 0.
    const double neckY = front->commands[0].to.y;
    double cfBottom = neckY;
    for (const auto& cmd : front->commands)
        if (cmd.type != CmdType::Close && cmd.to.x < 20)
            cfBottom = std::max(cfBottom, cmd.to.y);
    const double cfRun = cfBottom - neckY;
    if (cfRun < 60) {
        pattern.guideSteps.push_back(
            "Front placket: skipped — the front is too short below this neckline "
            "to carry a button placket.");
        return false;
    }

    // Rebuild the outline: ONLY the CF edge (the last curve, which returns from
    // the waist up to the neck point) grows outward by standWidth. The opening
    // neck point and the whole neckline stay put, so the neck facing still
    // matches. A short horizontal jog at the top joins the grown stand edge back
    // to the true neck point — that is the top of the button stand.
    std::vector<PathCommand>& cmds = front->commands;
    const Point neckPointCF = cmds[0].to; // the true CF neck point (unchanged)
    std::vector<PathCommand> grown;
    grown.reserve(cmds.size() + 1);
    for (size_t i = 0; i < cmds.size(); ++i) {
        PathCommand c = cmds[i];
        const bool isCloseEdge = (c.type == CmdType::Curve && // final CF edge curve
                                  c.to.x < 20 && i + 2 >= cmds.size());
        if (isCloseEdge) {
            // Offset the CF-edge curve outward; it now arrives at (-edgeGrow,
            // neckY) instead of the neck point, and a line closes the top jog.
            // edgeGrow == standWidth when symmetric (byte-identical).
            c.to = outward(c.to, -edgeGrow);
            c.cp1 = outward(c.cp1, -edgeGrow);
            c.cp2 = outward(c.cp2, -edgeGrow);
            grown.push_back(c);
            grown.push_back(PathCommand::line(neckPointCF)); // stand top -> neck point
        } else {
            grown.push_back(c);
        }
    }
    front->commands = grown;

    const double firstY = neckY + topFromNeck;
    const double lastY = cfBottom - hemClearance;

    // Prefer the bust-apex NOTCH the bodice already stamped on this piece
    // (princess and dart both mark it) — read it from the ORIGINAL markings,
    // BEFORE we append any placket markings. Otherwise use the caller's
    // body-frame bust level.
    double bustY = bustApexY;
    for (size_t i = 0; i + 1 < front->markings.size(); ++i) {
        const auto& mk = front->markings[i];
        if (mk.type == CmdType::Move && mk.to.y > firstY && mk.to.y < lastY &&
            std::abs(mk.to.x) < 200) {
            bustY = mk.to.y;
            break;
        }
    }
    // Clamp the bust anchor into the run; if it sits outside (empire waist seam
    // above the apex), fall back to even spacing centered in the run.
    if (bustY < firstY + 10 || bustY > lastY - 10) bustY = (firstY + lastY) / 2;

    // Fold line marking at the closure fold (foldX = 0 when symmetric, shifted
    // off CF when asymmetric), from the neck edge to the bottom.
    front->markings.push_back(PathCommand::move({foldX, neckY}));
    front->markings.push_back(PathCommand::line({foldX, cfBottom}));
    // Fold-back facing edge marking (stand + facing turn back onto the front,
    // inward from the fold line). facingX == standWidth when symmetric.
    const double facingX = foldX + standWidth; // facing folds back this far inside the fold
    front->markings.push_back(PathCommand::move({facingX, neckY + 4}));
    front->markings.push_back(PathCommand::line({facingX, cfBottom - 4}));

    // Buttons ON the CF line; buttonholes 3 mm past CF into the stand. Anchor the
    // run at the mandatory bust-level button (prevents gaping — Aldrich/Armstrong)
    // and space the rest evenly between the top button and the hem clearance.

    // Even spacing that lands a button exactly on the bust level. Choose a count
    // so the nearest slot hits bustY, then snap the whole run to it.
    const double span = lastY - firstY;
    int gaps = std::max(3, static_cast<int>(std::round(span / 90.0))); // ~9 cm target
    const double step = span / gaps;
    // Shift the run so a button coincides with the bust level.
    const double kBust = std::round((bustY - firstY) / step);
    const double shift = (bustY - firstY) - kBust * step;
    std::vector<double> ys;
    for (int i = 0; i <= gaps; ++i) {
        double y = firstY + shift + step * i;
        if (y >= neckY + 8 && y <= cfBottom - 8) ys.push_back(y);
    }
    // Half a buttonhole length so the marked slit is centered on its button.
    const double half = buttonholeLength / 2;
    for (double y : ys) {
        // Button: a short cross tick centered on the fold (closure) line.
        front->markings.push_back(PathCommand::move({foldX - 4, y}));
        front->markings.push_back(PathCommand::line({foldX + 4, y}));
        // Buttonhole: a horizontal slit starting 3 mm past the fold (toward the
        // edge, i.e. more negative x on this frame) and running its length outward.
        const double holeStart = foldX - buttonholeOffset;
        front->markings.push_back(PathCommand::move({holeStart, y}));
        front->markings.push_back(PathCommand::line({holeStart - buttonholeLength, y}));
        (void)half;
    }

    // For an asymmetric placket, ALSO mark the true center front (x = 0) as a
    // reference line so the sewer sees how far off-center the closure sits.
    if (asymmetric) {
        front->markings.push_back(PathCommand::move({0, neckY}));
        front->markings.push_back(PathCommand::line({0, cfBottom}));
    }

    front->cutInstruction = front->cutInstruction; // (front stays cut 1 on fold at the true CF)

    pattern.guideSteps.push_back(asymmetric
        ? std::string("Asymmetric front placket: the closure is carried ") +
            std::to_string(static_cast<long>(std::lround(offsetMM))) +
            " mm to one side of the center front (both the fold/button line and "
            "the grown-on 18 mm button stand are shifted off center — the true "
            "center front is marked as a reference line). Interface the stand. "
            "Mark the buttonholes on THIS front along the shifted fold line — one "
            "at the bust level to stop gaping — and the buttons on the under front "
            "to match. Cut the mirror (under) front to the same offset so the two "
            "fronts overlap correctly. Change the button size to suit and re-space."
        : std::string("Front placket: this front carries an 18 mm grown-on button stand past "
            "the center front (marked fold line at CF, fold-back facing line inside). "
            "Interface the stand. Mark the buttonholes on THIS (right) front — one is "
            "placed at the bust level to stop gaping — and the buttons on the LEFT "
            "front on the center-front line (women's fronts lap right over left). Cut "
            "horizontal buttonholes starting 3 mm past the center front toward the "
            "edge, 21 mm long. Change the button size to suit and re-space if needed."));

    // The stand + fold-back facing add fabric on the front edge.
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.1, 1);
    return true;
}

} // namespace PlacketBlock
} // namespace stitchu
