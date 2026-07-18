#include "gather.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace GatherBlock {

namespace {

constexpr double SA = constants::kSeamAllowanceMM; // seam allowance per edge (constants.yaml)

// Gather ratios (flat cut width / finished gathered width) — FORMULAS.md
// "Drawstring / shirred / smocked gathering". Values live in the K1 contract
// (contract/tables.json draft.gatherRatios); same numbers, one source.
constexpr double drawstringRatio = contract::kGatherRatio_drawstring;  // couture drawstring waist / babydoll neck
constexpr double shirredRatio = contract::kGatherRatio_shirred;        // Aldrich shirred bodice, 2:1
constexpr double smockedRatio = contract::kGatherRatio_smocked;        // couture smocking, 3:1

// Panel depth (the un-gathered dimension) per zone, in mm.
constexpr double neckPanelDepth = 130;   // a babydoll/milkmaid gathered yoke panel
constexpr double bustPanelDepth = 110;   // a gathered bust panel
constexpr double waistPanelDepth = 90;   // a gathered waist band panel
constexpr double sleevePanelDepth = 120; // a gathered sleeve

constexpr double casingDepth = 22;       // drawstring channel: cord + ease
constexpr double shirRowGap = 12;        // spacing of shirring rows

PatternPiece* findPiece(DraftedPattern& pattern, std::initializer_list<const char*> names) {
    for (const char* name : names)
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    return nullptr;
}

// The neckline runs from commands[0] (centre-neck) up to the neck point at the
// shoulder — that neck point is the outline vertex with the SMALLEST y. Sum the
// sewing-line length of exactly those leading commands: HALF the piece's
// neckline on the drafted curve (same technique the collar block uses). 0 if
// degenerate.
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

// The full width of a piece (max x - min x over its outline) at, or near, a
// given y band — used for the bust/waist/hem gathered edge. `yLo`/`yHi` bound
// the band; if none of the outline falls inside we fall back to the overall
// horizontal extent so the measurement is never zero for a real piece.
double widthInBand(const PatternPiece* piece, double yLo, double yHi) {
    if (!piece || piece->commands.empty()) return 0;
    double minX = 1e30, maxX = -1e30, gMinX = 1e30, gMaxX = -1e30;
    for (const auto& c : piece->commands) {
        if (c.type == CmdType::Close) continue;
        gMinX = std::min(gMinX, c.to.x); gMaxX = std::max(gMaxX, c.to.x);
        if (c.to.y >= yLo && c.to.y <= yHi) {
            minX = std::min(minX, c.to.x); maxX = std::max(maxX, c.to.x);
        }
    }
    if (maxX < minX) { minX = gMinX; maxX = gMaxX; }
    return (maxX < minX) ? 0 : (maxX - minX);
}

// y-extent (min,max) of a piece's outline.
void yExtent(const PatternPiece* piece, double& minY, double& maxY) {
    minY = 1e30; maxY = -1e30;
    if (!piece) return;
    for (const auto& c : piece->commands) {
        if (c.type == CmdType::Close) continue;
        minY = std::min(minY, c.to.y); maxY = std::max(maxY, c.to.y);
    }
}

// The finished (gathered) edge length the panel must shrink to, measured off the
// drafted front/back body pieces for the chosen zone. Returns 0 if unmeasurable.
double finishedEdgeMM(DraftedPattern& pattern, GatherZone zone) {
    if (zone == GatherZone::Neckline) {
        // Full neckline = 2*front-half + 2*back-half (each front/back is on fold).
        const PatternPiece* front = findPiece(pattern,
            {"Bodice Center Front", "Bodice Front", "Top Center Front", "Top Front"});
        const PatternPiece* back = findPiece(pattern,
            {"Bodice Back", "Bodice Center Back", "Top Back", "Top Center Back"});
        return 2 * halfNecklineLen(front) + 2 * halfNecklineLen(back);
    }
    if (zone == GatherZone::Sleeve) {
        const PatternPiece* sl = findPiece(pattern, {"Sleeve", "Bodice Sleeve", "Top Sleeve"});
        if (!sl) return 0;
        double minY, maxY; yExtent(sl, minY, maxY);
        // Bicep band near the top of the sleeve.
        return widthInBand(sl, minY, minY + (maxY - minY) * 0.25);
    }
    // Bust or waist band: the finished circumference at that level. The bodice is
    // split (princess: Center + Side; dart: one Front), so we sum the side-seam x
    // (the max x over the front pieces in the relevant y band) across front AND
    // back, then double (each is a half cut on fold). Summing the pieces' widths
    // at the band captures the full half-body regardless of the split, and the
    // band tolerates curved outlines because widthInBand falls back to the full
    // extent when few vertices land inside.
    const PatternPiece* front = findPiece(pattern,
        {"Bodice Center Front", "Bodice Front", "Top Center Front", "Top Front"});
    const PatternPiece* frontSide = findPiece(pattern,
        {"Bodice Side Front", "Top Side Front"});
    const PatternPiece* back = findPiece(pattern,
        {"Bodice Center Back", "Bodice Back", "Top Center Back", "Top Back"});
    const PatternPiece* backSide = findPiece(pattern,
        {"Bodice Side Back", "Top Side Back"});
    double fMinY, fMaxY; yExtent(front, fMinY, fMaxY);
    const double lo = (zone == GatherZone::Bust) ? fMinY + (fMaxY - fMinY) * 0.30
                                                 : fMaxY - (fMaxY - fMinY) * 0.20;
    const double hi = (zone == GatherZone::Bust) ? fMinY + (fMaxY - fMinY) * 0.60
                                                 : fMaxY + 1;
    // Half-front width = the outermost side-seam x reached by the front pieces in
    // the band; same for the back. widthInBand on a single on-fold piece already
    // returns (maxX - minX) with minX ~ 0 at the fold, so summing Center + Side
    // over-counts the shared seam; instead take the MAX side-seam x each side.
    auto sideSeamX = [&](const PatternPiece* a, const PatternPiece* b) {
        double mx = 0;
        for (const PatternPiece* p : {a, b}) {
            if (!p) continue;
            for (const auto& c : p->commands) {
                if (c.type == CmdType::Close) continue;
                if (c.to.y >= lo && c.to.y <= hi) mx = std::max(mx, c.to.x);
            }
        }
        return mx;
    };
    const double halfFront = sideSeamX(front, frontSide);
    const double halfBack = sideSeamX(back, backSide);
    if (halfFront <= 0 && halfBack <= 0) {
        // Band caught no vertices — fall back to the full extents.
        const double fW = widthInBand(front, -1e9, 1e9) + (frontSide ? widthInBand(frontSide, -1e9, 1e9) : 0);
        return 2 * fW;
    }
    return 2 * halfFront + 2 * halfBack;  // full circumference at that level
}

// The flat gathered panel: a rectangle `cutW` wide (= finished x ratio, + SA on
// the two side seams) by `cutH` tall (panel depth + SA top & bottom). The
// gathered edge is the TOP. `marks` draws the control lines (casing / shirring
// rows / smocking grid) inside the panel; `note` explains the finish.
constexpr double maxFabricWidth = 1400;  // one 140 cm fabric width

PatternPiece gatheredPanel(const std::string& name, const std::string& role,
                           double finishedW, double ratio, double depth,
                           GatherType type) {
    const double flatW = finishedW * ratio;   // total gathered (top) edge, finished
    // A very wide gathered panel is cut in SEGMENTS no wider than one fabric
    // width and joined at the sides (standard practice — the same way a long
    // ruffle strip is pieced). The DRAWN tile is one segment; the note says how
    // many segments to cut and their total flat width, so it packs sanely and
    // the sewer still gets the full gathered length.
    const int segments = std::max(1, static_cast<int>(std::ceil(flatW / maxFabricWidth)));
    const double segFlatW = flatW / segments;
    const double cutW = segFlatW + 2 * SA;
    const double cutH = depth + 2 * SA;

    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction =
        "cut " + std::to_string(segments) + " rectangle(s) " +
        std::to_string(static_cast<long>(std::lround(cutW))) + " x " +
        std::to_string(static_cast<long>(std::lround(cutH))) +
        " mm (join to a " +
        std::to_string(static_cast<long>(std::lround(flatW))) +
        " mm flat top edge that gathers down to " +
        std::to_string(static_cast<long>(std::lround(finishedW))) +
        " mm), " + role;

    piece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({cutW, 0}),
        PathCommand::line({cutW, cutH}),
        PathCommand::line({0, cutH}),
        PathCommand::close(),
    };

    // Gathered (top) seam line = the top edge just inside the SA.
    const double topY = SA;

    if (type == GatherType::Drawstring) {
        // A casing folded down from the top: the top raw edge turns under and a
        // channel is stitched `casingDepth` below the seam line. Draw the casing
        // fold line + the channel stitch line + two eyelet marks at the centre
        // where the cord exits.
        piece.markings.push_back(PathCommand::move({SA, topY}));
        piece.markings.push_back(PathCommand::line({cutW - SA, topY}));            // seam line
        piece.markings.push_back(PathCommand::move({SA, topY + casingDepth}));
        piece.markings.push_back(PathCommand::line({cutW - SA, topY + casingDepth})); // channel
        // Two eyelets side by side at centre front where the cord comes out.
        const double cx = cutW / 2;
        for (double dx : {-18.0, 18.0}) {
            piece.markings.push_back(PathCommand::move({cx + dx - 4, topY + casingDepth / 2}));
            piece.markings.push_back(PathCommand::line({cx + dx + 4, topY + casingDepth / 2}));
            piece.markings.push_back(PathCommand::move({cx + dx, topY + casingDepth / 2 - 4}));
            piece.markings.push_back(PathCommand::line({cx + dx, topY + casingDepth / 2 + 4}));
        }
    } else {
        // Shirred / smocked: parallel gathering rows across the panel. Shirred
        // uses evenly spaced rows; smocked adds a dot grid between the rows to
        // gauge the pleats. Rows start at the seam line and march down.
        const int rows = (type == GatherType::Smocked) ? 6 : 4;
        for (int r = 0; r < rows; ++r) {
            const double y = topY + r * shirRowGap;
            if (y > cutH - SA) break;
            piece.markings.push_back(PathCommand::move({SA, y}));
            piece.markings.push_back(PathCommand::line({cutW - SA, y}));
        }
        if (type == GatherType::Smocked) {
            // Smocking gauge dots: a grid of short ticks between the top rows.
            const double gridBot = topY + (rows - 1) * shirRowGap;
            for (double y = topY + shirRowGap / 2; y < gridBot; y += shirRowGap) {
                for (double x = SA + 20; x < cutW - SA; x += 20) {
                    piece.markings.push_back(PathCommand::move({x - 2, y}));
                    piece.markings.push_back(PathCommand::line({x + 2, y}));
                }
            }
        }
    }

    piece.hasGrainline = true;  // grain runs vertically (down the panel)
    piece.grainline = Grainline{{cutW / 2, topY + 8}, {cutW / 2, cutH - SA - 8}};
    piece.seamAllowance = SA;
    return piece;
}

// A drawstring cord: a long narrow self-fabric tube, cut as a rectangle and
// folded lengthwise (same construction as a tie). Length = finished edge + a
// generous pull-through/tie margin.
PatternPiece drawstringCord(double finishedEdgeW) {
    const double finishedW = 12;                                   // narrow cord
    const double finishedL = std::round(finishedEdgeW + 500.0);    // + tie margin
    const double cutW = 2 * finishedW + 2 * SA;
    const double cutL = finishedL + 2 * SA;

    PatternPiece piece;
    piece.name = "Drawstring Cord (büzgü bağı)";
    piece.cutInstruction =
        "cut 1 rectangle " +
        std::to_string(static_cast<long>(std::lround(cutW))) + " x " +
        std::to_string(static_cast<long>(std::lround(cutL))) +
        " mm (finished " + std::to_string(static_cast<long>(std::lround(finishedW))) +
        " x " + std::to_string(static_cast<long>(std::lround(finishedL))) +
        " mm), self-fabric cord threaded through the casing";
    piece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({cutW, 0}),
        PathCommand::line({cutW, cutL}),
        PathCommand::line({0, cutL}),
        PathCommand::close(),
    };
    piece.markings.push_back(PathCommand::move({cutW / 2, 0}));
    piece.markings.push_back(PathCommand::line({cutW / 2, cutL}));   // lengthwise fold
    piece.hasGrainline = true;
    piece.grainline = Grainline{{cutW / 2, SA + 6}, {cutW / 2, cutL - SA - 6}};
    piece.seamAllowance = SA;
    return piece;
}

// Stamp a placement notch (a short cross tick) on the body piece at the point of
// its outline nearest the anchor — the sewer knows the panel joins there.
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

bool apply(DraftedPattern& pattern, GatherType type, GatherZone zone) {
    if (type == GatherType::None) return true;

    const double finishedW = finishedEdgeMM(pattern, zone);
    if (finishedW < 60) {
        pattern.guideSteps.push_back(
            "Gathering: skipped — no measurable edge at this zone to gather a panel onto.");
        return false;
    }

    const double ratio = (type == GatherType::Drawstring) ? drawstringRatio
                       : (type == GatherType::Smocked)    ? smockedRatio
                                                          : shirredRatio;
    const double depth = (zone == GatherZone::Neckline) ? neckPanelDepth
                       : (zone == GatherZone::Bust)     ? bustPanelDepth
                       : (zone == GatherZone::Sleeve)   ? sleevePanelDepth
                                                        : waistPanelDepth;

    const char* typeName = (type == GatherType::Drawstring) ? "drawstring"
                         : (type == GatherType::Smocked)    ? "smocked"
                                                            : "shirred";
    const char* zoneName = (zone == GatherZone::Neckline) ? "neckline"
                         : (zone == GatherZone::Bust)     ? "bust"
                         : (zone == GatherZone::Sleeve)   ? "sleeve"
                                                          : "waist";
    const std::string name =
        std::string(type == GatherType::Drawstring ? "Drawstring "
                    : type == GatherType::Smocked ? "Smocked " : "Shirred ") +
        (zone == GatherZone::Neckline ? "Yoke Panel (büzgü yaka panosu)"
         : zone == GatherZone::Bust   ? "Bust Panel (büzgü büst panosu)"
         : zone == GatherZone::Sleeve ? "Sleeve Panel (büzgü kol panosu)"
                                      : "Waist Panel (büzgü bel panosu)");
    const std::string role =
        std::string("gathered ") + typeName + " at the " + zoneName;

    pattern.pieces.push_back(gatheredPanel(name, role, finishedW, ratio, depth, type));

    if (type == GatherType::Drawstring) {
        pattern.pieces.push_back(drawstringCord(finishedW));
    }

    // Placement notch on the body piece the gathered edge joins.
    PatternPiece* body = (zone == GatherZone::Sleeve)
        ? findPiece(pattern, {"Sleeve", "Bodice Sleeve", "Top Sleeve"})
        : findPiece(pattern, {"Bodice Center Front", "Bodice Front",
                              "Top Center Front", "Top Front"});
    if (body) {
        double minY, maxY; yExtent(body, minY, maxY);
        const double anchorY = (zone == GatherZone::Waist) ? maxY : minY;
        placementNotch(body, 0, anchorY);
    }

    // Guide step per sub-type.
    if (type == GatherType::Drawstring) {
        pattern.guideSteps.push_back(
            "Drawstring gathering (büzgü): cut the panel and the cord. Fold the "
            "panel's top edge under to form a casing (marked channel line) and "
            "stitch it, leaving the two centre eyelets open. Fold the cord in "
            "half lengthwise right sides together, stitch, turn, and thread it "
            "through the casing. Gather the panel down to the marked finished "
            "length by pulling the cord, distribute the fullness evenly, then "
            "join the gathered edge to the body at the placement notch.");
    } else if (type == GatherType::Smocked) {
        pattern.guideSteps.push_back(
            "Smocked gathering (büzgü/smok): cut the panel. Transfer the smocking "
            "dot grid to the wrong side. Pick up the dots row by row to pleat the "
            "fabric down to the marked finished length (3:1), then smock the "
            "pleats with your chosen embroidery. Join the gathered edge to the "
            "body at the placement notch, matching the finished length.");
    } else {
        pattern.guideSteps.push_back(
            "Shirred gathering (büzgü): cut the panel. Wind elastic thread on the "
            "bobbin and sew along each marked shirring row (right side up); the "
            "elastic pulls the panel down to about half its flat width (2:1) as "
            "you sew the rows. Steam to tighten. Join the gathered edge to the "
            "body at the placement notch, matching the finished length.");
    }

    // A gathered panel uses noticeably more fabric than a plain one.
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.2, 1);
    return true;
}

} // namespace GatherBlock
} // namespace stitchu
