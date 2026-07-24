#include "ruffle.hpp"

#include <algorithm>
#include <cmath>
#include <string>

namespace stitchu {
namespace RuffleBlock {

namespace {

constexpr double HEM = 10;      // rolled bottom hem allowance (mm)
constexpr double SA = constants::kSeamAllowanceRuffleJoinMM; // gathered/joined edge SA (constants.yaml)
constexpr double SEG_MAX = 1400; // one fabric-width segment (well under the 3000 mm print cap)

// One gathered strip. bottomIsHem: the bottom edge is finished with a rolled
// hem; otherwise it is a plain seam that receives the next tier's gathers.
PatternPiece strip(const std::string& name, const std::string& gatherTarget,
                   double totalLen, double depthMM, int notches, bool bottomIsHem) {
    const double bottomAllowance = bottomIsHem ? HEM : SA;
    // A strip this long is cut in fabric-width segments and joined end to end;
    // the pattern piece IS one segment (printable), the cut note gives the count.
    const int segments = std::max(1, static_cast<int>(std::ceil(totalLen / SEG_MAX)));
    const double stripLen = totalLen / segments; // even segment length
    const double stripH = depthMM + bottomAllowance + SA;

    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction =
        "cut " + std::to_string(segments) + " strip(s) " +
        std::to_string(static_cast<long>(std::lround(stripLen))) + " x " +
        std::to_string(static_cast<long>(std::lround(stripH))) +
        " mm, join end to end (total " + std::to_string(static_cast<long>(std::lround(totalLen))) +
        " mm), then gather to " + gatherTarget;

    // Outline: a rectangle strip.
    piece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({stripLen, 0}),
        PathCommand::line({stripLen, stripH}),
        PathCommand::line({0, stripH}),
        PathCommand::close(),
    };

    // Markings: gather notches on the top edge, the gather (seam) line and the
    // bottom hemline/seamline. Gathering the top edge between the notches evenly
    // pulls the strip down to the edge it trims.
    for (int i = 1; i < notches; ++i) {
        const double x = (stripLen * i) / notches;
        piece.markings.push_back(PathCommand::move({x, 0}));
        piece.markings.push_back(PathCommand::line({x, 14}));
    }
    piece.markings.push_back(PathCommand::move({0, SA}));           // gather here
    piece.markings.push_back(PathCommand::line({stripLen, SA}));
    piece.markings.push_back(PathCommand::move({0, stripH - bottomAllowance}));
    piece.markings.push_back(PathCommand::line({stripLen, stripH - bottomAllowance}));

    piece.hasGrainline = true;
    piece.grainline = Grainline{{stripLen * 0.5, SA + 6}, {stripLen * 0.5, stripH - bottomAllowance - 6}};
    piece.seamAllowance = SA;
    return piece;
}

} // namespace

PatternPiece draft(double edgeMM, double fullness, double depthMM, int notches) {
    fullness = std::max(1.5, std::min(4.0, fullness));
    notches = std::max(2, std::min(12, notches));
    return strip("Ruffle strip (fırfır)", "the hem", edgeMM * fullness, depthMM, notches,
                 /*bottomIsHem=*/true);
}

std::vector<PatternPiece> draftTiers(
    double edgeMM, double fullness, double depthMM, int tiers, int notches) {
    tiers = std::max(1, std::min(5, tiers));
    if (tiers == 1) return {draft(edgeMM, fullness, depthMM, notches)};

    fullness = std::max(1.5, std::min(4.0, fullness));
    notches = std::max(2, std::min(12, notches));

    std::vector<PatternPiece> pieces;
    pieces.reserve(tiers);
    double edge = edgeMM; // the edge tier i gathers onto: edgeMM x fullness^(i-1)
    for (int i = 1; i <= tiers; ++i) {
        const bool last = i == tiers;
        const std::string target = i == 1
            ? "the hem"
            : ("tier " + std::to_string(i - 1) + "'s bottom edge");
        pieces.push_back(strip("Ruffle tier " + std::to_string(i) + " (fırfır)",
                               target, edge * fullness, depthMM, notches, last));
        edge *= fullness;
    }
    return pieces;
}

} // namespace RuffleBlock
} // namespace stitchu
