#include "offshoulder.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace OffShoulderBlock {

namespace {

PatternPiece* findPiece(DraftedPattern& pattern, std::initializer_list<const char*> names) {
    for (const char* name : names)
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    return nullptr;
}

// Index of the outline vertex at the greatest x (the armhole-bottom / side-seam
// top corner) — the point where the top/armhole edge meets the side seam. The
// top edge is everything from commands[0] up to and including this vertex.
int armholeBottomIndex(const PatternPiece& p) {
    int best = -1;
    double bestX = -1e18;
    for (size_t i = 0; i < p.commands.size(); ++i) {
        if (p.commands[i].type == CmdType::Close) continue;
        if (p.commands[i].to.x > bestX) { bestX = p.commands[i].to.x; best = static_cast<int>(i); }
    }
    return best;
}

// The shoulder point y = the smallest y on the outline (the top of the piece).
double topY(const PatternPiece& p) {
    double y = 1e18;
    for (const auto& c : p.commands)
        if (c.type != CmdType::Close) y = std::min(y, c.to.y);
    return y;
}

// Reshape one bodice half's top edge into a straight bardot band dropped `drop`
// below the shoulder point. Returns the width of the dropped top edge (CF to the
// armhole point) so the caller can true the elastic/frill to it; -1 on failure.
double reshapeTop(PatternPiece& p, double drop) {
    if (p.commands.empty() || p.commands[0].type != CmdType::Move) return -1;
    const int ai = armholeBottomIndex(p);
    if (ai < 1) return -1;
    const Point armPt = p.commands[ai].to;      // armhole bottom / side top
    const double shoulderY = topY(p);
    const double bandY = shoulderY + drop;      // dropped top edge level
    // The band must sit above the armhole bottom (else there's no body left).
    if (bandY >= armPt.y - 20) return -1;
    const double cfX = p.commands[0].to.x;      // CF x (≈ 0)

    // Rebuild: start at the CF at the dropped band level, run straight across to
    // the armhole point at the same level, then continue the ORIGINAL outline from
    // the armhole point onward (side seam, waist, back up CF). This removes the
    // neck + shoulder + upper armhole and replaces them with a straight bardot band.
    std::vector<PathCommand> rebuilt;
    rebuilt.push_back(PathCommand::move({cfX, bandY}));       // CF top of band
    rebuilt.push_back(PathCommand::line({armPt.x, bandY}));    // straight across to armhole
    rebuilt.push_back(PathCommand::line(armPt));               // down to the real armhole point
    for (size_t i = ai + 1; i < p.commands.size(); ++i)
        rebuilt.push_back(p.commands[i]);
    // The original outline closed by returning UP the CF edge to the old nape
    // point (0, neckY) which now sits ABOVE the new band top (0, bandY) — that
    // stray segment crosses the band. Retarget the final CF-returning command to
    // end at the new band-top CF point so the CF edge stops cleanly at the band.
    for (int i = static_cast<int>(rebuilt.size()) - 1; i >= 0; --i) {
        if (rebuilt[i].type == CmdType::Close) continue;
        if (std::abs(rebuilt[i].to.x - cfX) < 2.0) {          // returns to the CF
            rebuilt[i].to.y = bandY;
            if (rebuilt[i].type == CmdType::Curve) {           // keep the curve tame
                rebuilt[i].cp1.y = std::min(rebuilt[i].cp1.y, bandY + 40);
                rebuilt[i].cp2.y = std::min(rebuilt[i].cp2.y, bandY + 40);
            }
        }
        break; // only the last real (CF-closing) vertex
    }
    p.commands = rebuilt;

    // Elastic casing marking: a line parallel to and just below the band top edge
    // (the channel the elastic runs through).
    p.markings.push_back(PathCommand::move({cfX, bandY + casingDepth}));
    p.markings.push_back(PathCommand::line({armPt.x, bandY + casingDepth}));

    return armPt.x - cfX; // half-width of the dropped top edge for this piece
}

} // namespace

bool apply(DraftedPattern& pattern, BardotStyle style) {
    if (style == BardotStyle::None) return true;

    PatternPiece* front = findPiece(pattern, {"Bodice Front", "Top Front"});
    PatternPiece* back = findPiece(pattern, {"Bodice Back", "Top Back"});
    // Off-shoulder needs a plain (unsplit) bodiced front + back to reshape a clean
    // straight band. A princess-split bodice or a garment with no bodice stays honest.
    if (!front || !back) {
        pattern.guideSteps.push_back(
            "Off-shoulder: skipped — this garment has no plain bodiced front + back to reshape "
            "into an off-shoulder band (a princess-split or skirt-only garment is left honest).");
        return false;
    }

    const double fHalf = reshapeTop(*front, dropMM);
    const double bHalf = reshapeTop(*back, dropMM);
    if (fHalf < 0 || bHalf < 0) {
        pattern.guideSteps.push_back(
            "Off-shoulder: skipped — the bodice top edge could not be lowered cleanly below the "
            "shoulder (too short a bodice above the bust).");
        return false;
    }

    // The finished top-edge circumference (both halves front + back, cut 2 / on
    // fold) = 2·(front half + back half). The elastic is cut shorter so it holds
    // the wide edge onto the body.
    const double topEdge = 2.0 * (fHalf + bHalf);
    const double elastic = std::round(topEdge * 0.85);

    // Elastic casing as a cut length (a strip/notion piece: it's the elastic).
    PatternPiece elasticPiece;
    elasticPiece.name = "Off-shoulder Elastic (bardot lastik)";
    elasticPiece.cutInstruction =
        "cut elastic ~" + std::to_string(static_cast<long>(std::lround(elastic))) +
        " mm long, 15 mm wide — thread through the casing at the top edge so the band holds "
        "off the shoulders (fit to your own chest before joining the ends)";
    elasticPiece.seamAllowance = 0;
    // Draw the elastic as a simple rectangle at finished length so it shows on the
    // sheet (it's a notion, no grainline/notches — annotateTechnical skips strips).
    elasticPiece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({elastic, 0}),
        PathCommand::line({elastic, 15}),
        PathCommand::line({0, 15}),
        PathCommand::close(),
    };
    pattern.pieces.push_back(elasticPiece);

    if (style == BardotStyle::Frill) {
        // A bardot ruffle flounce above the band: a strip topEdge·fullness long
        // × frillDepth, gathered down to the top edge and flipped up to frame the
        // shoulders. Trued: gathered top == topEdge.
        const double cutL = std::round(topEdge * frillFullness) + 2 * SA;
        const double cutD = frillDepth + SA + 12;
        PatternPiece frill;
        frill.name = "Bardot Frill (bardot fırfır)";
        frill.cutInstruction =
            "cut 1 rectangle " + std::to_string(static_cast<long>(std::lround(cutL))) + " x " +
            std::to_string(static_cast<long>(std::lround(cutD))) +
            " mm, gather the top edge down to the off-shoulder top edge (" +
            std::to_string(static_cast<long>(std::lround(topEdge))) + " mm)";
        frill.commands = {
            PathCommand::move({0, 0}),
            PathCommand::line({cutL, 0}),
            PathCommand::line({cutL, cutD}),
            PathCommand::line({0, cutD}),
            PathCommand::close(),
        };
        frill.markings.push_back(PathCommand::move({SA, SA * 0.5}));
        frill.markings.push_back(PathCommand::line({cutL - SA, SA * 0.5}));
        frill.hasGrainline = true;
        frill.grainline = Grainline{{cutL / 2, SA + 6}, {cutL / 2, cutD - SA - 6}};
        frill.seamAllowance = SA;
        pattern.pieces.push_back(frill);
    }

    pattern.guideSteps.push_back(
        std::string("Off-shoulder (bardot): the front and back top edges are cut STRAIGHT ") +
        "across below the shoulder line so the shoulders are bare — there are no shoulder seams "
        "and no sleeves at the top edge. Sew the side seams, then fold the top edge under to "
        "form an elastic casing on the marked line and thread the elastic through it, joining "
        "the elastic ends to the length that holds the band up on your chest and back." +
        (style == BardotStyle::Frill
             ? " Bardot frill: gather the frill strip down to the top edge and sew it into the "
               "casing seam so it flips up and frames the shoulders."
             : "") +
        " The wide elastic top stretches over the shoulders to put the garment on.");
    pattern.fabricMeters140 = roundToPlaces(
        pattern.fabricMeters140 + (style == BardotStyle::Frill ? 0.3 : 0.05), 1);
    return true;
}

} // namespace OffShoulderBlock
} // namespace stitchu
