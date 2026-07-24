#include "collar.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

namespace stitchu {
namespace CollarBlock {

namespace {

constexpr double SA = constants::kSeamAllowanceMM; // seam allowance (constants.yaml)

// --- collar dimensions (FORMULAS.md "Collar family") -------------------------
constexpr double standBandH = 35;   // full stand-up band height
constexpr double mockBandH = 30;    // shorter mock/mandarin band
constexpr double cfRise = 15;       // centre-front rise: hugs the neck
constexpr double flatWidth = 60;    // finished flat/peter-pan collar width
constexpr double shirtStandH = 28;  // shirt collar stand height
constexpr double shirtBladeH = 48;  // shirt collar blade (= stand + 20, covers seam)

PatternPiece* findPiece(DraftedPattern& pattern, std::initializer_list<const char*> names) {
    for (const char* name : names)
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    return nullptr;
}

// The neckline runs from commands[0] (centre-neck) up to the neck point at the
// shoulder — that neck point is the outline vertex with the SMALLEST y (the
// bodice draws neckPoint at y = 0, then a line down/out to the shoulder tip).
// Sum the sewing-line length of exactly those commands: that is HALF the front
// (or back) neckline, on the drafted curve. Returns 0 if degenerate.
double halfNecklineLen(const PatternPiece* piece) {
    if (!piece || piece->commands.size() < 3) return 0;
    const auto& c = piece->commands;
    if (c[0].type != CmdType::Move) return 0;
    // Index of the neck point = minimum-y vertex among the leading commands.
    // Scan from 1 forward until y stops decreasing (the neck point), so we never
    // walk past the neckline into the shoulder/armhole.
    size_t neckEnd = 1;
    double minY = c[0].to.y;
    for (size_t i = 1; i < c.size(); ++i) {
        if (c[i].type == CmdType::Close) break;
        if (c[i].to.y <= minY + 1e-6) { minY = c[i].to.y; neckEnd = i; }
        else break;  // y turned back down toward the shoulder — neckline ended
    }
    std::vector<PathCommand> neck;
    neck.reserve(neckEnd + 1);
    neck.push_back(PathCommand::move(c[0].to));
    for (size_t i = 1; i <= neckEnd; ++i) neck.push_back(c[i]);
    return pathLength(neck);
}

// One collar stand/band. The bottom (attach) SEAM edge is drafted STRAIGHT to
// the exact neckline length `neckLen` (CB fold at x = 0 to CF at x = neckLen, on
// the y = 0 line) — that is the trued seam that sews to the neckline, so its
// length equals the neckline to 0.00 mm. The band then stands `bandH` tall; the
// CF end tilts inward by `rise` at the TOP edge so the finished band hugs the
// neck (Aldrich/M&S: raise/tilt the front to close the band round the throat).
// The bottom seam stays straight/measured; only the free top edge is shaped.
PatternPiece standBand(const std::string& name, double neckLen, double bandH,
                       double rise, const std::string& role) {
    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction = "cut 2 on fold at centre back (1 self + 1 interfacing), " + role;

    // Bottom (attach) SEAM edge: a straight line CB(0,0) -> CF(neckLen,0). Its
    // length is exactly neckLen (the neckline). Top edge sits bandH above and
    // tilts in `rise` at CF so the band closes round the neck.
    const Point cbBot{0, 0};
    const Point cfBot{neckLen, 0};
    const Point cfTop{neckLen - rise, -bandH};   // CF top pulled in by `rise` = hug
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

// One flat-family collar half (peter-pan / flat): neck edge length = `neckLen`
// (CB fold at x = 0 to CF at x = neckLen along a shallow arc matching the
// neckline), outer edge offset `width` outward and shaped per `edge`. Drawn as a
// gentle arc so the neck edge is not a dead-straight line (it hugs the round
// neckline). CB on fold at x = 0.
PatternPiece flatCollar(const std::string& name, double neckLen, double width,
                        CollarEdge edge, const std::string& role) {
    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction = "cut 2 + interfacing (1 upper, 1 under + interfacing), " + role;

    // Neck (attach) SEAM edge: a STRAIGHT line CB(0,0) -> CF(neckLen,0). Its
    // length is exactly neckLen (the neckline) — trued to 0.00 mm. In a real flat
    // collar the neck edge is a shallow arc traced off the overlapped shoulders;
    // its LENGTH still equals the neckline, which is what truing measures, so we
    // draft the seam straight-to-length and shape the free OUTER edge below it.
    const Point cbNeck{0, 0};
    const Point cfNeck{neckLen, 0};
    const Point cfOuter{neckLen, width};   // CF end, down the collar depth
    const Point cbOuter{0, width};         // CB end

    std::vector<PathCommand> cmds;
    cmds.push_back(PathCommand::move(cbNeck));
    cmds.push_back(PathCommand::line(cfNeck));    // straight neck seam, length = neckLen
    cmds.push_back(PathCommand::line(cfOuter));   // CF corner down

    if (edge == CollarEdge::Pointed) {
        // A pointed outer edge: dip to a point partway, classic collar corner.
        const Point pt{neckLen * 0.5, width + 22};
        cmds.push_back(PathCommand::line(pt));
        cmds.push_back(PathCommand::line(cbOuter));
    } else if (edge == CollarEdge::Scallop) {
        // Scalloped outer edge: a run of small arcs CF->CB.
        const int scallops = 4;
        Point prev = cfOuter;
        for (int i = 1; i <= scallops; ++i) {
            const double t = static_cast<double>(i) / scallops;
            const double x = neckLen * (1 - t);
            const double dip = 14;  // scallop depth
            const Point next{x, width};
            const double midY = width + dip;
            cmds.push_back(PathCommand::curve(next, {prev.x, midY}, {next.x, midY}));
            prev = next;
        }
    } else {  // Round (peter-pan)
        cmds.push_back(PathCommand::curve(
            cbOuter, {neckLen * 0.72, width + 10}, {neckLen * 0.28, width - 4}));
    }
    cmds.push_back(PathCommand::close());
    piece.commands = cmds;

    // CB fold line + roll line (parallel to the neck edge, ~6 mm out).
    piece.markings.push_back(PathCommand::move({0, 0}));
    piece.markings.push_back(PathCommand::line({0, width}));
    piece.hasGrainline = true;
    piece.grainline = Grainline{{6, 4}, {6, width - 6}};
    piece.seamAllowance = SA;
    return piece;
}

// Stamp a short cross-tick placement notch on the neckline of a body piece at
// its centre-neck vertex (commands[0]), so the sewer knows the collar attaches
// there. Body-frame independent.
void necklineNotch(PatternPiece* piece) {
    if (!piece || piece->commands.empty()) return;
    const Point p = piece->commands[0].to;
    piece->markings.push_back(PathCommand::move({p.x - 6, p.y}));
    piece->markings.push_back(PathCommand::line({p.x + 6, p.y}));
    piece->markings.push_back(PathCommand::move({p.x, p.y - 6}));
    piece->markings.push_back(PathCommand::line({p.x, p.y + 6}));
}

} // namespace

double necklineLengthMM(const DraftedPattern& pattern) {
    // Front is cut 1 on fold (or centre front piece) — its neckline is HALF the
    // front neckline; ×2 for the full front. Same for back. Sum both.
    // Use a non-const scan.
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
    const double frontHalf = halfNecklineLen(front);
    const double backHalf = halfNecklineLen(back);
    return 2 * frontHalf + 2 * backHalf;
}

bool apply(DraftedPattern& pattern, CollarType type, CollarEdge edge) {
    if (type == CollarType::None) return true;

    const double neckFull = necklineLengthMM(pattern);
    if (neckFull < 60) {
        pattern.guideSteps.push_back(
            "Collar: skipped — this garment has no measurable neckline to carry a "
            "collar.");
        return false;
    }
    // The collar spans HALF the pattern draft (CB fold to CF): the neckline we
    // draft against is measured full, so each on-fold band/collar half covers
    // half the neckline (neckFull / 2), self-mirrored across the CB fold.
    const double half = neckFull / 2;

    switch (type) {
        case CollarType::Stand:
        case CollarType::Mock: {
            const double bandH = (type == CollarType::Stand) ? standBandH : mockBandH;
            const char* label = (type == CollarType::Stand)
                ? "Stand Collar (dik yaka)" : "Mock Collar (mandarin yaka)";
            pattern.pieces.push_back(standBand(
                label, half, bandH, cfRise,
                "band stands at the neckline; ease none — the bottom edge equals the neckline"));
            pattern.guideSteps.push_back(
                std::string("Collar (") + label +
                "): the band's bottom edge is drafted to the exact neckline length "
                "and curved up at centre front so it hugs the neck. Interface one "
                "layer, fold right sides together along the top edge, stitch the "
                "ends, turn, then sew the bottom edge to the neckline matching the "
                "centre-back fold and shoulder notches. No ease — the seam lines are "
                "equal length.");
            break;
        }
        case CollarType::Flat:
        case CollarType::PeterPan: {
            const char* label = (type == CollarType::PeterPan)
                ? "Peter Pan Collar (bebe yaka)" : "Flat Collar (yatık yaka)";
            const char* edgeName = edge == CollarEdge::Pointed ? "pointed"
                                 : edge == CollarEdge::Scallop ? "scalloped" : "rounded";
            pattern.pieces.push_back(flatCollar(
                label, half, flatWidth, edge,
                std::string("lies flat on the shoulders, ") + edgeName + " outer edge"));
            pattern.guideSteps.push_back(
                std::string("Collar (") + label +
                "): drafted so its neck edge equals the garment neckline and its "
                "outer edge is " + edgeName +
                ". Interface the under-collar, sew upper to under-collar right sides "
                "together along the outer edge, clip the curves"
                + (edge == CollarEdge::Scallop ? " into each scallop point" : "") +
                ", turn and press so the seam rolls under. Sew the neck edge to the "
                "neckline matching centre back and the shoulder notches, then finish "
                "with a facing or bias binding.");
            break;
        }
        case CollarType::Shirt: {
            // Two pieces: a stand band (as mock) + a turnover blade slightly
            // wider so it covers the stand seam. Neck edge of the band = neckline.
            pattern.pieces.push_back(standBand(
                "Shirt Collar Stand (yaka bandı)", half, shirtStandH, cfRise * 0.6,
                "the button-end band the blade rolls over"));
            pattern.pieces.push_back(flatCollar(
                "Shirt Collar Blade (yaka yaprağı)", half, shirtBladeH,
                CollarEdge::Pointed, "the turnover blade; sits on the stand and rolls over the seam"));
            pattern.guideSteps.push_back(
                "Collar (Shirt Collar / gömlek yaka): a two-piece convertible collar "
                "— a stand band drafted to the neckline length plus a turnover blade "
                "cut a little deeper so it covers the stand seam. Interface both under "
                "layers. Make the blade first (stitch outer edge, clip the points, "
                "turn), sandwich it between the two stand layers, stitch the stand top "
                "edge, then sew the stand's bottom edge to the neckline matching centre "
                "back and shoulder notches.");
            break;
        }
        case CollarType::None:
            return true;
    }

    // Re-find the front AFTER pushing pieces (push_back may have reallocated the
    // vector, invalidating any earlier pointer) and stamp the placement notch.
    PatternPiece* front = findPiece(pattern, {"Bodice Center Front", "Bodice Front",
                                              "Top Center Front", "Top Front"});
    if (front) necklineNotch(front);

    // A collar adds a little self-fabric + interfacing.
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.15, 1);
    return true;
}

} // namespace CollarBlock
} // namespace stitchu
