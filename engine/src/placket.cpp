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

// The skirt front of a DRESS, when the draft has one. A button front that stops
// at the waist seam is not a button front: the wearer cannot get into the skirt
// through it and, drawn, it reads as a half-length zip. Measured on K4 (EU38):
// the closure ran y = 133.14 .. 424.76 on a garment 1205 mm tall (referee,
// 2026-09-03). So the placket continues onto the skirt front, which grows the
// same stand and carries the same fold/facing/button run.
PatternPiece* skirtFront(DraftedPattern& pattern) {
    for (const char* name : {"Skirt Center Front", "Skirt Front"}) {
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    }
    return nullptr;
}

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

    // Rebuild the outline so the WHOLE center-front edge grows outward by
    // standWidth. The CF edge is every outline vertex that sits on the fold line
    // (x ~ 0) — whether the draft returns to CF along a curve (bodice dress) or a
    // straight line (extended top) — EXCEPT the true neck point cmds[0], which
    // must stay put so the neckline and the neck facing still match. The finished
    // front edge then lands at x = -standWidth all the way from hem to neck. A
    // short horizontal jog at the top joins the grown stand back to the true neck
    // point — that is the top of the button stand.
    //
    // The old index-based heuristic (offset only "the final curve, i+2 >= size")
    // silently missed the extended-top topology (its CF edge is a LINE, not a
    // curve) — that draft grew NO stand yet still stamped buttonholes past CF, so
    // the sewing line spilled past the cut line and the piece was unwearable. This
    // geometry-driven rule handles every front topology (external audit fix,
    // 2026-07-17).
    constexpr double kCfEps = 1.0; // a vertex is "on the CF" within 1 mm of x = 0
    std::vector<PathCommand>& cmds = front->commands;
    const Point neckPointCF = cmds[0].to; // the true CF neck point (unchanged)
    const bool neckOnCF = std::abs(neckPointCF.x) < kCfEps;
    std::vector<PathCommand> grown;
    grown.reserve(cmds.size() + 1);
    // edgeGrow == standWidth when symmetric (byte-identical); standWidth+offsetMM
    // when the closure is carried off center. Every CF vertex grows by edgeGrow.
    for (size_t i = 0; i < cmds.size(); ++i) {
        PathCommand c = cmds[i];
        if (c.type == CmdType::Close) { grown.push_back(c); continue; }
        // Does this command ARRIVE at the true neck point? (last CF-edge vertex.)
        const bool arrivesAtNeck = i != 0 && neckOnCF &&
                                   std::abs(c.to.x - neckPointCF.x) < kCfEps &&
                                   std::abs(c.to.y - neckPointCF.y) < kCfEps;
        // Grow any control point that sits on the CF (keeps a grown curve smooth).
        if (c.type == CmdType::Curve) {
            if (std::abs(c.cp1.x) < kCfEps) c.cp1 = outward(c.cp1, -edgeGrow);
            if (std::abs(c.cp2.x) < kCfEps) c.cp2 = outward(c.cp2, -edgeGrow);
        }
        if (arrivesAtNeck) {
            // This command now arrives at the grown stand top (-edgeGrow, neckY);
            // a jog line closes it back to the true neck point.
            c.to = outward(c.to, -edgeGrow);
            grown.push_back(c);
            grown.push_back(PathCommand::line(neckPointCF)); // stand top -> neck point
        } else if (i != 0 && std::abs(c.to.x) < kCfEps) {
            // Any other CF vertex (e.g. the hem corner at x = 0) grows outward.
            c.to = outward(c.to, -edgeGrow);
            grown.push_back(c);
        } else {
            grown.push_back(c);
        }
    }
    front->commands = grown;

    // A front button placket OPENS at the center front — it cannot be cut on the
    // fold (a fold has no opening, and buttons/buttonholes on a fold are
    // nonsense: the finished garment would not go over the head). Placket and
    // "cut on fold" are MUTUALLY EXCLUSIVE. Flip the front (and its neck facing,
    // which mirrors the front's cut) to "cut 2 (center front opening)".
    auto openCF = [](std::string& cut) {
        const auto fold = cut.find("on fold");
        if (fold == std::string::npos) return; // already cut 2 (e.g. princess side)
        std::string tail; // preserve any trailing note (", interface")
        const auto comma = cut.find(',', fold);
        if (comma != std::string::npos) tail = cut.substr(comma);
        cut = "cut 2 (center front opening)" + tail;
    };
    openCF(front->cutInstruction);
    for (auto& piece : pattern.pieces)
        if (piece.name == "Front Neck Facing") openCF(piece.cutInstruction);

    // Record the opening on the front piece so the pattern's metadata reports an
    // honest closure. The buttons/buttonholes drawn below ARE the closure that
    // lets a head enter a non-stretch front — without this tag the front reads
    // as having no way in even though the geometry opens.
    front->closure = asymmetric
        ? "button placket (off-center front)"
        : "button placket (center front)";

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

    // ⭐ THE PLACKET REACHES THE HEM (referee, 2026-09-03). Up to here the stand
    // lived on the BODICE only, so a dress buttoned from the neck to the waist
    // seam and no further — unwearable through the front, and drawn it read as a
    // half-length opening. If the draft has a separate skirt front, it grows the
    // SAME stand, gets the SAME fold/facing lines and the button run CONTINUES
    // across the waist seam at the same spacing (no new number is chosen: the
    // step and the phase both come from the bodice run computed above).
    if (PatternPiece* skirt = skirtFront(pattern)) {
        std::vector<PathCommand> sg;
        sg.reserve(skirt->commands.size());
        for (const auto& c0 : skirt->commands) {
            PathCommand c = c0;
            if (c.type == CmdType::Close) { sg.push_back(c); continue; }
            if (c.type == CmdType::Curve) {
                if (std::abs(c.cp1.x) < kCfEps) c.cp1 = outward(c.cp1, -edgeGrow);
                if (std::abs(c.cp2.x) < kCfEps) c.cp2 = outward(c.cp2, -edgeGrow);
            }
            if (std::abs(c.to.x) < kCfEps) c.to = outward(c.to, -edgeGrow);
            sg.push_back(c);
        }
        skirt->commands = sg;
        openCF(skirt->cutInstruction);
        skirt->closure = front->closure;
        double sTop = sg.empty() ? 0.0 : sg[0].to.y, sBottom = sTop;
        for (const auto& c : sg) {
            if (c.type == CmdType::Close) continue;
            sTop = std::min(sTop, c.to.y);
            if (c.to.x < 20) sBottom = std::max(sBottom, c.to.y);
        }
        skirt->markings.push_back(PathCommand::move({foldX, sTop}));
        skirt->markings.push_back(PathCommand::line({foldX, sBottom}));
        const double sFacingX = foldX + standWidth;
        skirt->markings.push_back(PathCommand::move({sFacingX, sTop + 4}));
        skirt->markings.push_back(PathCommand::line({sFacingX, sBottom - 4}));
        // Carry the run across the seam: the gap left over from the last bodice
        // button to the waist is spent first, then the same step continues.
        const double kalan = ys.empty() ? step : (cfBottom - ys.back());
        for (double y = sTop + (step - kalan); y <= sBottom - hemClearance; y += step) {
            skirt->markings.push_back(PathCommand::move({foldX - 4, y}));
            skirt->markings.push_back(PathCommand::line({foldX + 4, y}));
            const double holeStart = foldX - buttonholeOffset;
            skirt->markings.push_back(PathCommand::move({holeStart, y}));
            skirt->markings.push_back(PathCommand::line({holeStart - buttonholeLength, y}));
        }
        if (asymmetric) {
            skirt->markings.push_back(PathCommand::move({0, sTop}));
            skirt->markings.push_back(PathCommand::line({0, sBottom}));
        }
        pattern.guideSteps.push_back(
            "The button front runs the WHOLE length: the skirt front carries the same "
            "grown-on stand, fold line and facing as the bodice, and the buttons keep "
            "their spacing across the waist seam. Cut the skirt front as TWO fronts.");
    } else if (PatternPiece* merged = [&]() -> PatternPiece* {
                   for (auto& p : pattern.pieces)
                       if (p.name == "Skirt Front & Back" || p.name == "Front & Back") return &p;
                   return nullptr;
               }()) {
        (void)merged;
        pattern.guideSteps.push_back(
            "Front placket: it stops at the waist seam — this draft merges the skirt "
            "front and back into ONE piece (\"Skirt Front & Back\"), which cannot open "
            "down the front. To button to the hem, draft the skirt front separately "
            "(give the skirt its own front/back split).");
    }

    // The front now OPENS at the closure (openCF flipped it to cut 2 above);
    // both the symmetric and asymmetric guides say so.
    pattern.guideSteps.push_back(asymmetric
        ? std::string("Asymmetric front placket: the front OPENS off-center — cut it "
            "as TWO fronts (cut 2), NOT on the fold. The closure is carried ") +
            std::to_string(static_cast<long>(std::lround(offsetMM))) +
            " mm to one side of the center front (both the fold/button line and "
            "the grown-on 18 mm button stand are shifted off center — the true "
            "center front is marked as a reference line). Interface the stand. "
            "Mark the buttonholes on THIS front along the shifted fold line — one "
            "at the bust level to stop gaping — and the buttons on the under front "
            "to match. Cut the mirror (under) front to the same offset so the two "
            "fronts overlap correctly. Change the button size to suit and re-space."
        : std::string("Front placket: the front now OPENS at the center front — cut it "
            "as TWO mirror-image fronts (cut 2), NOT on the fold, because the buttons "
            "open the garment. Each front carries an 18 mm grown-on button stand past "
            "the center front (marked fold line at CF, fold-back facing line inside). "
            "Interface the stand. Mark the buttonholes on the RIGHT front — one is "
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
