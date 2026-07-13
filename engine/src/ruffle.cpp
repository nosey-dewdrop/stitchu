#include "ruffle.hpp"

#include <algorithm>
#include <cmath>
#include <string>

namespace stitchu {
namespace RuffleBlock {

PatternPiece draft(double edgeMM, double fullness, double depthMM, int notches) {
    const double HEM = 10;   // rolled bottom hem allowance (mm)
    const double SA = 12;    // seam allowance at the gathered (top) edge
    const double SEG_MAX = 1400; // one fabric-width segment (well under the 3000 mm print cap)
    fullness = std::max(1.5, std::min(4.0, fullness));
    notches = std::max(2, std::min(12, notches));
    const double totalLen = edgeMM * fullness;
    // A ruffle this long is cut in fabric-width segments and joined end to end;
    // the pattern piece IS one segment (printable), the cut note gives the count.
    const int segments = std::max(1, static_cast<int>(std::ceil(totalLen / SEG_MAX)));
    const double stripLen = totalLen / segments; // even segment length
    const double stripH = depthMM + HEM + SA;

    PatternPiece piece;
    piece.name = "Ruffle strip (fırfır)";
    piece.cutInstruction =
        "cut " + std::to_string(segments) + " strip(s) " +
        std::to_string(static_cast<long>(std::lround(stripLen))) + " x " +
        std::to_string(static_cast<long>(std::lround(stripH))) +
        " mm, join end to end (total " + std::to_string(static_cast<long>(std::lround(totalLen))) +
        " mm), then gather to the hem";

    // Outline: a rectangle strip.
    piece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({stripLen, 0}),
        PathCommand::line({stripLen, stripH}),
        PathCommand::line({0, stripH}),
        PathCommand::close(),
    };

    // Markings: gather notches on the top edge, the gather (seam) line and the
    // hemline. Gathering the top edge between the notches evenly pulls the strip
    // down to `edgeMM`.
    for (int i = 1; i < notches; ++i) {
        const double x = (stripLen * i) / notches;
        piece.markings.push_back(PathCommand::move({x, 0}));
        piece.markings.push_back(PathCommand::line({x, 14}));
    }
    piece.markings.push_back(PathCommand::move({0, SA}));           // gather here
    piece.markings.push_back(PathCommand::line({stripLen, SA}));
    piece.markings.push_back(PathCommand::move({0, stripH - HEM})); // fold hem here
    piece.markings.push_back(PathCommand::line({stripLen, stripH - HEM}));

    piece.hasGrainline = true;
    piece.grainline = Grainline{{stripLen * 0.5, SA + 6}, {stripLen * 0.5, stripH - HEM - 6}};
    piece.seamAllowance = SA;
    return piece;
}

} // namespace RuffleBlock
} // namespace stitchu
