#include "yoke.hpp"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "contract.gen.hpp"

namespace stitchu {
namespace YokeBlock {

namespace {

// Babydoll / swing fullness: the flat body top edge is cut this many times the
// yoke lower edge, then gathered back down to it. Reuses the SAME 2:1 shirred
// gather ratio the gather block reads from the K1 contract (contract/tables.json
// draft.gatherRatios.shirred = 2) — one source, not a wild invented number. 2:1 is
// the Aldrich / high-street shirred-bodice convention and the classic babydoll
// gather-into-yoke fullness.
constexpr double kGatheredYokeRatio = contract::kGatherRatio_shirred;

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

// GATHERED yoke: FLARE the lower body's TOP (yoke-seam) edge outward so its flat top
// width is `ratio` times the yoke-seam width, then it gathers back down to the yoke
// edge. The loop is in its own rebased frame; its top edge is the two corners at the
// minimum y — `lL` (fold / centre side, smaller x) and `lR` (side-seam side, larger
// x). We push each side-seam corner outward by the extra half-width, and TAPER that
// horizontal shift linearly to zero over the top `flareBand` fraction of the panel's
// height — so the side seam angles smoothly out toward the gathered top instead of
// spiking at a single vertex (a spike makes the cut-line offset self-intersect). On a
// cut-on-fold piece the fold edge (x==0) must not move, so all the extra width goes to
// the side-seam corner; a cut-2 piece splits it symmetrically. Only the upper band of
// the side seams flares; the hem and the fold stay put, and the Yoke piece (a separate
// piece) — which carries the head opening / armhole / neck — is untouched.
constexpr double kFlareBand = 0.30; // taper the flare over the top 30% of the panel
void widenTopEdgeForGather(std::vector<Point>& loop, Point& lL, Point& lR,
                           double seamLen, double ratio, bool onFold) {
    const double extra = seamLen * (ratio - 1.0);
    if (extra <= 0) return;
    double topY = 1e30, botY = -1e30;
    for (const auto& p : loop) { topY = std::min(topY, p.y); botY = std::max(botY, p.y); }
    const double h = botY - topY;
    if (h <= 0) return;
    const double addLeft = onFold ? 0.0 : extra / 2.0;   // fold stays put
    const double addRight = onFold ? extra : extra / 2.0;
    const double midX = (lL.x + lR.x) / 2.0;
    const double bandH = h * kFlareBand;
    // Shift a point outward from the centre by `add`, faded to 0 at bandH below top.
    auto flare = [&](Point& p) {
        const double f = std::max(0.0, 1.0 - (p.y - topY) / bandH); // 1 at top -> 0
        if (f <= 0) return;
        const double add = (p.x >= midX) ? addRight : addLeft;
        if (add == 0) return;
        const double dir = (p.x >= midX) ? 1.0 : -1.0;
        p.x += dir * add * f;
    };
    for (auto& p : loop) flare(p);
    lL.x -= addLeft;   // the top corners themselves take the full shift (f==1)
    lR.x += addRight;
}

// Split ONE bodice panel horizontally at its own measured yoke line into a Yoke
// (upper) + a lower body piece. The panel is REPLACED in pattern.pieces by the two
// resulting pieces. Returns false (leaving the panel untouched) if the panel cannot
// be found or the yoke line does not cleanly divide it. `outSeamLen` is the trued
// yoke-seam length (identical for both pieces by construction). When `gathered`, the
// lower body's top edge is drawn wider (babydoll fullness) and gathered to fit the
// yoke's lower edge (the sewn length still equals `outSeamLen`).
bool splitOnePanel(DraftedPattern& pattern, const std::string& panelName,
                   const std::string& yokeName, const std::string& lowerName,
                   double& outSeamLen, bool gathered) {
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
    std::string bodyNote =
        cutCount + onFold + " (below the yoke — the yoke seam down to the hem; the "
        "top edge is your " + seamStr +
        " mm yoke seam, matched to the Yoke at the notches)";
    if (gathered) {
        // Widen the body's top edge to `ratio`x the yoke edge, then gather it back
        // down to the yoke edge — the swing / babydoll fullness. The SEWN (gathered)
        // length still equals seamLen, so it trues to the Yoke's lower edge.
        widenTopEdgeForGather(lower, lL, lR, seamLen, kGatheredYokeRatio, onFold.empty() ? false : true);
        const double flatW = seamLen * kGatheredYokeRatio;
        const std::string flatStr = std::to_string(static_cast<long>(std::lround(flatW)));
        // Ratio "N:1" with one decimal (2:1 -> "2.0"), read from the contract.
        char ratioBuf[16];
        std::snprintf(ratioBuf, sizeof(ratioBuf), "%.1f", kGatheredYokeRatio);
        bodyNote =
            cutCount + onFold + " (below the yoke — the yoke seam down to the hem; the "
            "top edge is cut " + flatStr + " mm wide, gathered down to your " + seamStr +
            " mm yoke seam (ratio " + ratioBuf + ":1) and matched to the Yoke at the "
            "notches — the babydoll fullness swings from the yoke)";
    }
    PatternPiece body = bandPiece(
        lowerName, bodyNote,
        lower, &lL, &lR, nullptr, nullptr);
    if (gathered) {
        // Gather distribution ticks along the (now wider) top edge — short downward
        // ticks between the two seam-end notches so the sewer spreads the fullness
        // evenly. Purely markings; the outline / trued sewn length are unaffected.
        const double topY = std::min(lL.y, lR.y);
        const double x0 = std::min(lL.x, lR.x), x1 = std::max(lL.x, lR.x);
        const int ticks = 3;
        for (int i = 1; i <= ticks; ++i) {
            const double x = x0 + (x1 - x0) * i / (ticks + 1);
            body.markings.push_back(PathCommand::move({x, topY}));
            body.markings.push_back(PathCommand::line({x, topY + 8}));
        }
    }

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
               double& outSeamLen, bool gathered) {
    // Dart mode: a single panel ("Bodice Front" / "Top Front", etc.).
    for (const char* n : dartNames)
        if (splitOnePanel(pattern, n, side + " Yoke", side + " Body", outSeamLen, gathered))
            return true;
    // Princess mode: center + side panels both carry the yoke seam.
    bool any = false;
    for (const char* n : centerNames)
        if (splitOnePanel(pattern, n, side + " Yoke Center", side + " Body Center", outSeamLen, gathered)) { any = true; break; }
    for (const char* n : sideNames) {
        double s = 0;
        if (splitOnePanel(pattern, n, side + " Yoke Side", side + " Body Side", s, gathered)) {
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

    const bool gathered = (style == Yoke::Gathered);
    double frontSeam = 0, backSeam = 0;
    const bool splitFront = splitHalf(
        pattern, "Front",
        {"Bodice Front", "Top Front"},
        {"Bodice Center Front", "Top Center Front"},
        {"Bodice Side Front", "Top Side Front"},
        frontSeam, gathered);
    const bool splitBack = splitHalf(
        pattern, "Back",
        {"Bodice Back", "Top Back"},
        {"Bodice Center Back", "Top Center Back"},
        {"Bodice Side Back", "Top Side Back"},
        backSeam, gathered);

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
        (gathered
             ? ". The lower body is cut WIDER at its top edge (2:1 babydoll fullness): "
               "run two rows of gathering stitch along that edge and draw it up to the "
               "yoke-seam length marked on the piece, spreading the fullness evenly "
               "between the gather ticks. "
             : ". ") +
        "Stay-stitch each yoke seam edge, then pin the Yoke's lower edge to the "
        "lower body's top edge right sides together, matching the two notches" +
        (gathered ? " (adjust the gathers so the wider body edge fits the yoke edge)" : "") +
        ", and sew. Press the seam up into the yoke and topstitch if you want it "
        "crisp. The yoke carries the shoulders while the body below it hangs and "
        "swings free.");
    return true;
}

} // namespace YokeBlock
} // namespace stitchu
