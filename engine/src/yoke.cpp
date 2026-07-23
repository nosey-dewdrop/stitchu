#include "yoke.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

namespace stitchu {
namespace YokeBlock {

namespace {

// Flatten a piece's outline into a closed polygon (cubics -> 24 segments, close
// returns to the subpath start), matching the engine convention and the cup-seam
// block. Duplicate consecutive points are dropped so the horizontal cut stays clean.
std::vector<Point> flattenOutline(const std::vector<PathCommand>& cmds) {
    std::vector<Point> poly;
    Point current{0, 0};
    Point start{0, 0};
    bool have = false;
    auto push = [&](Point p) {
        if (poly.empty() ||
            std::fabs(poly.back().x - p.x) > 1e-6 || std::fabs(poly.back().y - p.y) > 1e-6)
            poly.push_back(p);
    };
    for (const auto& cmd : cmds) {
        switch (cmd.type) {
            case CmdType::Move:
                current = cmd.to; start = cmd.to; have = true; push(current); break;
            case CmdType::Line:
                push(cmd.to); current = cmd.to; break;
            case CmdType::Curve: {
                const auto pts = flattenCubic(current, cmd.to, cmd.cp1, cmd.cp2, 24);
                for (size_t i = 1; i < pts.size(); ++i) push(pts[i]);
                current = cmd.to; break;
            }
            case CmdType::Close:
                if (have) push(start);
                break;
        }
    }
    if (poly.size() > 1 &&
        std::fabs(poly.front().x - poly.back().x) < 1e-6 &&
        std::fabs(poly.front().y - poly.back().y) < 1e-6)
        poly.pop_back();
    return poly;
}

std::vector<PathCommand> outlineFromLoop(const std::vector<Point>& loop) {
    std::vector<PathCommand> out;
    if (loop.empty()) return out;
    out.push_back(PathCommand::move(loop.front()));
    for (size_t i = 1; i < loop.size(); ++i) out.push_back(PathCommand::line(loop[i]));
    out.push_back(PathCommand::close());
    return out;
}

// The points where the horizontal line y = cutY crosses the polygon, and the vertex
// index bracketing each crossing. A horizontal line through a bodice panel crosses
// the loop exactly twice (once on the side-seam / max-x side, once on the CF/CB fold
// side).
struct Crossing { Point p; size_t before; };

std::vector<Crossing> horizontalCrossings(const std::vector<Point>& loop, double cutY) {
    std::vector<Crossing> xs;
    const size_t n = loop.size();
    for (size_t i = 0; i < n; ++i) {
        const Point& a = loop[i];
        const Point& b = loop[(i + 1) % n];
        const double ya = a.y, yb = b.y;
        const bool straddle = (ya <= cutY && yb > cutY) || (ya > cutY && yb <= cutY);
        if (!straddle) continue;
        const double t = (cutY - ya) / (yb - ya);
        Point p{a.x + (b.x - a.x) * t, cutY};
        xs.push_back({p, i});
    }
    return xs;
}

// Split a point loop into the sub-loop ABOVE the line (the yoke) and the sub-loop
// BELOW it (the lower body), inserting the two crossing points so both sub-loops
// close along the SAME horizontal cut segment. Returns false if the line does not
// cleanly cut the loop in two.
bool splitLoopAtY(const std::vector<Point>& loop, double cutY,
                  std::vector<Point>& upper, std::vector<Point>& lower,
                  Point& cutL, Point& cutR) {
    const auto xs = horizontalCrossings(loop, cutY);
    if (xs.size() != 2) return false;

    std::vector<Point> ext;
    const size_t n = loop.size();
    for (size_t i = 0; i < n; ++i) {
        ext.push_back(loop[i]);
        for (const auto& c : xs) if (c.before == i) ext.push_back(c.p);
    }

    upper.clear(); lower.clear();
    for (const auto& p : ext) {
        if (p.y <= cutY + 1e-6) upper.push_back(p);
        if (p.y >= cutY - 1e-6) lower.push_back(p);
    }
    if (upper.size() < 3 || lower.size() < 3) return false;

    Point c0 = xs[0].p, c1 = xs[1].p;
    if (c0.x <= c1.x) { cutL = c0; cutR = c1; } else { cutL = c1; cutR = c0; }
    return true;
}

void rebase(std::vector<Point>& loop, double& dx, double& dy) {
    double minx = 1e30, miny = 1e30;
    for (const auto& p : loop) { minx = std::min(minx, p.x); miny = std::min(miny, p.y); }
    dx = minx; dy = miny;
    for (auto& p : loop) { p.x -= minx; p.y -= miny; }
}

// Build one horizontal-band piece (a Yoke or a lower body) from a rebased loop.
// `topCut`/`botCut` are that piece's seam endpoints in the same rebased frame, each
// optional (nullptr = an original panel edge, not a new horizontal seam). Stamps a
// matching notch at each end of every new seam so the paired pieces pin together, a
// grainline down the piece, and the caller's cut note (which carries the trued seam
// length). Mirrors cupseam.cpp's cupPiece.
PatternPiece bandPiece(const std::string& name, const std::string& cutNote,
                       std::vector<Point> loop,
                       const Point* topCut0, const Point* topCut1,
                       const Point* botCut0, const Point* botCut1) {
    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction = cutNote;
    piece.commands = outlineFromLoop(loop);

    auto notch = [&](Point at, bool leftEnd, double vy) {
        const double dir = leftEnd ? 1.0 : -1.0;
        piece.markings.push_back(PathCommand::move(at));
        piece.markings.push_back(PathCommand::line({at.x + dir * 12, at.y + vy}));
    };
    if (botCut0 && botCut1) { notch(*botCut0, true, -8); notch(*botCut1, false, -8); }
    if (topCut0 && topCut1) { notch(*topCut0, true, +8); notch(*topCut1, false, +8); }

    const Rect b = boundingBox(piece.commands);
    piece.hasGrainline = true;
    const double gx = b.x + b.width * 0.35;
    piece.grainline = Grainline{{gx, b.y + 12}, {gx, b.y + b.height - 12}};
    piece.seamAllowance = constants::kSeamAllowanceMM;
    return piece;
}

// Split ONE bodice panel horizontally at its own measured yoke line into a Yoke
// (upper) + a lower body piece. The panel is REPLACED in pattern.pieces by the two
// resulting pieces. Returns false (leaving the panel untouched) if the panel cannot
// be found or the yoke line does not cleanly divide it. `outSeamLen` is the trued
// yoke-seam length (identical for both pieces by construction).
bool splitOnePanel(DraftedPattern& pattern, const std::string& panelName,
                   const std::string& yokeName, const std::string& lowerName,
                   double& outSeamLen) {
    outSeamLen = 0;
    int idx = -1;
    for (size_t i = 0; i < pattern.pieces.size(); ++i)
        if (pattern.pieces[i].name == panelName) { idx = static_cast<int>(i); break; }
    if (idx < 0) return false;
    const PatternPiece panel = pattern.pieces[idx];

    const std::vector<Point> loop = flattenOutline(panel.commands);
    if (loop.size() < 4) return false;

    // MEASURED yoke line: read the panel's own top (shoulder/neck) and bottom (waist/
    // hem) y from the drawn outline, then place the seam a fixed SHARE of that drop
    // below the top. Never a hardcoded mm — it scales with the drafted body, and the
    // front and back land at the same proportional level.
    double topY = 1e30, botY = -1e30;
    for (const auto& p : loop) { topY = std::min(topY, p.y); botY = std::max(botY, p.y); }
    const double drop = botY - topY;
    if (drop <= 0) return false;
    const double yokeY = topY + kYokeDropShare * drop;

    std::vector<Point> upper, lower;
    Point cutL{}, cutR{};
    if (!splitLoopAtY(loop, yokeY, upper, lower, cutL, cutR)) return false;

    // The yoke seam length is the horizontal cut (identical for both pieces by
    // construction — the truing that lets the yoke and lower body sew together).
    const double seamLen = distance(cutL, cutR);
    outSeamLen = seamLen;
    const std::string seamStr =
        std::to_string(static_cast<long>(std::lround(seamLen)));

    const std::string onFold = (panel.cutInstruction.find("on fold") != std::string::npos)
                                   ? " on fold" : "";
    const std::string cutCount = (onFold.empty() ? "cut 2" : "cut 1");

    // Yoke (upper): shoulder edge on top, yoke seam on the bottom.
    Point yL = cutL, yR = cutR;
    double ydx, ydy;
    rebase(upper, ydx, ydy); yL.x -= ydx; yL.y -= ydy; yR.x -= ydx; yR.y -= ydy;
    PatternPiece yoke = bandPiece(
        yokeName,
        cutCount + onFold + " (Yoke — the shoulder line down to the yoke seam; the "
        "lower edge is your " + seamStr +
        " mm yoke seam, matched to the lower body at the notches)",
        upper,
        /*top*/nullptr, nullptr, /*bot*/&yL, &yR);

    // Lower body: yoke seam on top, hem at the bottom.
    Point lL = cutL, lR = cutR;
    double ldx, ldy;
    rebase(lower, ldx, ldy); lL.x -= ldx; lL.y -= ldy; lR.x -= ldx; lR.y -= ldy;
    PatternPiece body = bandPiece(
        lowerName,
        cutCount + onFold + " (below the yoke — the yoke seam down to the hem; the "
        "top edge is your " + seamStr +
        " mm yoke seam, matched to the Yoke at the notches)",
        lower, &lL, &lR, nullptr, nullptr);

    pattern.pieces.erase(pattern.pieces.begin() + idx);
    pattern.pieces.insert(pattern.pieces.begin() + idx, {yoke, body});
    return true;
}

// Split every present panel of one half (front or back): the single dart panel, or
// the princess center + side panels. Returns true if any panel was split. `side`
// names the half ("Front" / "Back") for the piece labels.
bool splitHalf(DraftedPattern& pattern, const std::string& side,
               std::initializer_list<const char*> dartNames,
               std::initializer_list<const char*> centerNames,
               std::initializer_list<const char*> sideNames,
               double& outSeamLen) {
    // Dart mode: a single panel ("Bodice Front" / "Top Front", etc.).
    for (const char* n : dartNames)
        if (splitOnePanel(pattern, n, side + " Yoke", side + " Body", outSeamLen))
            return true;
    // Princess mode: center + side panels both carry the yoke seam.
    bool any = false;
    for (const char* n : centerNames)
        if (splitOnePanel(pattern, n, side + " Yoke Center", side + " Body Center", outSeamLen)) { any = true; break; }
    for (const char* n : sideNames) {
        double s = 0;
        if (splitOnePanel(pattern, n, side + " Yoke Side", side + " Body Side", s)) {
            if (!any) outSeamLen = s;
            any = true;
            break;
        }
    }
    return any;
}

} // namespace

bool apply(DraftedPattern& pattern, Yoke style) {
    if (style == Yoke::None) return true;

    double frontSeam = 0, backSeam = 0;
    const bool splitFront = splitHalf(
        pattern, "Front",
        {"Bodice Front", "Top Front"},
        {"Bodice Center Front", "Top Center Front"},
        {"Bodice Side Front", "Top Side Front"},
        frontSeam);
    const bool splitBack = splitHalf(
        pattern, "Back",
        {"Bodice Back", "Top Back"},
        {"Bodice Center Back", "Top Center Back"},
        {"Bodice Side Back", "Top Side Back"},
        backSeam);

    if (!splitFront && !splitBack) {
        // HOST: no bodice front/back to split (a skirt, or a draft with no bodice).
        pattern.guideSteps.push_back(
            "Yoke: skipped — a yoke is the horizontal shoulder/upper-chest seam a "
            "doll or babydoll dress hangs its body from, so it needs a bodice front "
            "and back to split. This draft has none (it's a skirt, or has no bodice "
            "panel). Nothing changed.");
        return false;
    }

    pattern.guideSteps.push_back(
        std::string("Yoke (roba — doll / babydoll dress): the bodice is cut across "
        "the upper chest into a Yoke (the shoulder panel) and a lower body that hangs "
        "and flares from the yoke seam") +
        (splitFront && splitBack ? ", front and back" :
         splitFront ? " (front only — the back had no panel to split)"
                    : " (back only — the front had no panel to split)") +
        ". Stay-stitch each yoke seam edge, then pin the Yoke's lower edge to the "
        "lower body's top edge right sides together, matching the two notches, and "
        "sew. Press the seam up into the yoke and topstitch if you want it crisp. The "
        "yoke carries the shoulders while the body below it hangs and swings free.");
    return true;
}

} // namespace YokeBlock
} // namespace stitchu
