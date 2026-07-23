#include "cupseam.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace CupSeamBlock {

namespace {

// Flatten a piece's outline into a closed polygon of points, matching the engine
// convention (cubics -> 24 segments, close returns to the subpath start). The
// result is a simple closed loop we can cut with a horizontal line. Duplicate
// consecutive points are dropped so edge tests stay clean.
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
    // Drop a trailing duplicate of the start (the close) so the loop is clean.
    if (poly.size() > 1 &&
        std::fabs(poly.front().x - poly.back().x) < 1e-6 &&
        std::fabs(poly.front().y - poly.back().y) < 1e-6)
        poly.pop_back();
    return poly;
}

// Build a closed outline (Move + Lines + Close) from a point loop.
std::vector<PathCommand> outlineFromLoop(const std::vector<Point>& loop) {
    std::vector<PathCommand> out;
    if (loop.empty()) return out;
    out.push_back(PathCommand::move(loop.front()));
    for (size_t i = 1; i < loop.size(); ++i) out.push_back(PathCommand::line(loop[i]));
    out.push_back(PathCommand::close());
    return out;
}

// The two points where the horizontal line y = cutY crosses the polygon, and the
// two vertex indices bracketing each crossing. For a simple bodice front panel a
// horizontal line through the bust apex crosses the loop exactly twice (once on
// the princess-seam / max-x side, once on the CF-fold / x=0 side).
struct Crossing { Point p; size_t before; };  // crossing lies on edge loop[before]->loop[before+1]

std::vector<Crossing> horizontalCrossings(const std::vector<Point>& loop, double cutY) {
    std::vector<Crossing> xs;
    const size_t n = loop.size();
    for (size_t i = 0; i < n; ++i) {
        const Point& a = loop[i];
        const Point& b = loop[(i + 1) % n];
        const double ya = a.y, yb = b.y;
        // Strict straddle so a vertex exactly on the line is counted once (as the
        // start of the edge leaving it), never twice.
        const bool straddle = (ya <= cutY && yb > cutY) || (ya > cutY && yb <= cutY);
        if (!straddle) continue;
        const double t = (cutY - ya) / (yb - ya);
        Point p{a.x + (b.x - a.x) * t, cutY};
        xs.push_back({p, i});
    }
    return xs;
}

// Split a point loop into the sub-loop ABOVE the line (y <= cutY) and the sub-
// loop BELOW it (y >= cutY), inserting the two crossing points so both sub-loops
// close along the SAME horizontal cut segment. Returns false if the line does not
// cleanly cut the loop in two (not a simple bodice panel — refuse honestly).
bool splitLoopAtY(const std::vector<Point>& loop, double cutY,
                  std::vector<Point>& upper, std::vector<Point>& lower,
                  Point& cutL, Point& cutR) {
    const auto xs = horizontalCrossings(loop, cutY);
    if (xs.size() != 2) return false;

    // Rebuild the loop with the two crossing points inserted at their edges so
    // every vertex is either strictly above or strictly below the cut.
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

    // The cut segment endpoints (left = min x, right = max x of the two crossings).
    Point c0 = xs[0].p, c1 = xs[1].p;
    if (c0.x <= c1.x) { cutL = c0; cutR = c1; } else { cutL = c1; cutR = c0; }
    return true;
}

// Rebase a point loop to a local top-left origin (like every drafted piece).
void rebase(std::vector<Point>& loop, double& dx, double& dy) {
    double minx = 1e30, miny = 1e30;
    for (const auto& p : loop) { minx = std::min(minx, p.x); miny = std::min(miny, p.y); }
    dx = minx; dy = miny;
    for (auto& p : loop) { p.x -= minx; p.y -= miny; }
}

PatternPiece* findPiece(DraftedPattern& pattern, std::initializer_list<const char*> names) {
    for (const char* name : names)
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    return nullptr;
}

// Build one horizontal-band piece (Upper Cup, Lower Cup, or Front Body) from a
// rebased loop. `topCut`/`botCut` are that piece's seam endpoints in the same
// rebased frame, each optional (nullptr = that edge is an original panel edge,
// not a new horizontal seam). Stamps a matching notch at each end of every new
// seam so the sewer pairs the two pieces meeting there, a grainline down the
// piece, and the caller's cut note (which carries the trued seam length).
// notchDir points the tick UP (into a lower piece, off the piece's top seam) or
// DOWN (into an upper piece, off the piece's bottom seam) so the paired pieces
// carry mirror-matching notches.
PatternPiece cupPiece(const std::string& name, const std::string& cutNote,
                      std::vector<Point> loop,
                      const Point* topCut0, const Point* topCut1,
                      const Point* botCut0, const Point* botCut1) {
    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction = cutNote;
    piece.commands = outlineFromLoop(loop);

    // Matching notches: a short inward tick at each end of a horizontal seam so
    // the two pieces meeting there pin together at the same two points. A tick on
    // the BOTTOM edge of a piece points up-and-in (into the piece); a tick on the
    // TOP edge points down-and-in — so the piece above and the piece below carry
    // mirror-matched notches at each shared seam.
    auto notch = [&](Point at, bool leftEnd, double vy) {
        const double dir = leftEnd ? 1.0 : -1.0;
        piece.markings.push_back(PathCommand::move(at));
        piece.markings.push_back(PathCommand::line({at.x + dir * 12, at.y + vy}));
    };
    if (botCut0 && botCut1) { notch(*botCut0, true, -8); notch(*botCut1, false, -8); }
    if (topCut0 && topCut1) { notch(*topCut0, true, +8); notch(*topCut1, false, +8); }

    const Rect b = boundingBox(piece.commands);
    piece.hasGrainline = true;
    // Grainline straight down the piece (straight-of-grain runs vertical on a
    // bodice cup, parallel to CF).
    const double gx = b.x + b.width * 0.35;
    piece.grainline = Grainline{{gx, b.y + 12}, {gx, b.y + b.height - 12}};
    piece.seamAllowance = SA;
    return piece;
}

// Split ONE princess front panel into an Upper Cup + a Lower Cup at its own apex
// notch, then cut the lower region AGAIN at the waist so the short under-bust
// Lower Cup separates from the Front Body below the waist (the three-band Buğra
// Corset Bustier front). Returns false (leaving the panel untouched) if the panel
// has no apex notch or the apex cut does not cleanly divide it. On success the
// original panel is REPLACED in `pattern.pieces` by the resulting pieces (Upper
// Cup + Lower Cup, plus a Front Body when the panel extends past the waist).
//
// `waistBelowApex` is the measured drop from the apex to the natural waist. The
// waist cut lands at apexY + waistBelowApex — always measured, never hardcoded.
// When that level is at or below the panel's own hem (a bodice-length dress front
// or a cropped top, whose lower edge IS the waist), splitLoopAtY finds no clean
// second crossing and the Front Body is honestly skipped; the panel stays a
// two-piece Upper + Lower cup, exactly as before.
bool splitOnePanel(DraftedPattern& pattern, const std::string& panelName,
                   const std::string& upperName, const std::string& lowerName,
                   const std::string& bodyName, const std::string& topEdgeWord,
                   double waistBelowApex,
                   double& outSeamLen, double& outWaistSeamLen,
                   double& outUpperPerim, double& outLowerPerim,
                   double& outUpperW, double& outUpperH,
                   double& outLowerW, double& outLowerH,
                   bool& outHasBody) {
    outHasBody = false;
    outWaistSeamLen = 0;
    // Find the panel (copy out its data; we will erase and re-insert).
    int idx = -1;
    for (size_t i = 0; i < pattern.pieces.size(); ++i)
        if (pattern.pieces[i].name == panelName) { idx = static_cast<int>(i); break; }
    if (idx < 0) return false;
    const PatternPiece panel = pattern.pieces[idx];

    // The apex y is READ from the panel's own bust-apex match notch (the notch
    // makePrincessPieces stamps at the apex), so the seam can never drift from a
    // hardcoded mm. markings[0].to == the apex point.
    if (panel.markings.empty()) return false;
    const double apexY = panel.markings[0].to.y;

    const std::vector<Point> loop = flattenOutline(panel.commands);
    if (loop.size() < 4) return false;

    std::vector<Point> upper, lower;
    Point cutL{}, cutR{};
    if (!splitLoopAtY(loop, apexY, upper, lower, cutL, cutR)) return false;

    // The cup seam length is the horizontal cut (identical for both cups by
    // construction — this is the truing that lets the two cups sew together).
    const double seamLen = distance(cutL, cutR);
    outSeamLen = seamLen;

    // Cut notes carry the trued cup-seam length so the sewer matches them.
    const std::string seamStr =
        std::to_string(static_cast<long>(std::lround(seamLen)));
    const std::string onFold = (panel.cutInstruction.find("on fold") != std::string::npos)
                                   ? " on fold" : "";
    const std::string cutCount = (onFold.empty() ? "cut 2" : "cut 1");

    // SECOND CUT: split the lower region at the waist (apexY + measured drop), in
    // the SAME panel frame as the apex cut (before rebasing). This produces the
    // short Lower Cup (cup seam -> waist) and the Front Body (waist -> hem). The
    // waist level is measured, not hardcoded; if it lands at/below the panel hem
    // (a bodice-length front) there is no clean crossing and we keep the single
    // Lower Cup.
    const double waistY = apexY + waistBelowApex;
    std::vector<Point> lowerCup, frontBody;
    Point wL{}, wR{};
    const bool hasBody = waistBelowApex > 0 &&
                         splitLoopAtY(lower, waistY, lowerCup, frontBody, wL, wR);
    const double waistSeamLen = hasBody ? distance(wL, wR) : 0;
    outWaistSeamLen = waistSeamLen;
    const std::string waistStr =
        std::to_string(static_cast<long>(std::lround(waistSeamLen)));

    // Rebase the Upper Cup to a local origin (its cup-seam endpoints move with it).
    Point uL = cutL, uR = cutR;
    double udx, udy;
    rebase(upper, udx, udy); uL.x -= udx; uL.y -= udy; uR.x -= udx; uR.y -= udy;

    PatternPiece up = cupPiece(
        upperName,
        cutCount + onFold + " (Upper Cup — the " + topEdgeWord + " top edge down to "
        "the cup seam; the lower edge is your " + seamStr +
        " mm cup seam, matched to the Lower Cup at the notches)",
        upper,
        /*top*/nullptr, nullptr, /*bot*/&uL, &uR);

    outUpperPerim = pathLength(up.commands);
    const Rect ub = boundingBox(up.commands);
    outUpperW = ub.width; outUpperH = ub.height;

    std::vector<PatternPiece> replacement;
    replacement.push_back(up);

    if (hasBody) {
        outHasBody = true;
        // Short Lower Cup: cup seam on top, waist seam on the bottom.
        Point lcT0 = cutL, lcT1 = cutR, lcB0 = wL, lcB1 = wR;
        double lcdx, lcdy;
        rebase(lowerCup, lcdx, lcdy);
        lcT0.x -= lcdx; lcT0.y -= lcdy; lcT1.x -= lcdx; lcT1.y -= lcdy;
        lcB0.x -= lcdx; lcB0.y -= lcdy; lcB1.x -= lcdx; lcB1.y -= lcdy;
        PatternPiece lo = cupPiece(
            lowerName,
            cutCount + onFold + " (Lower Cup — the short under-bust band from the cup "
            "seam down to the waist seam; the top edge is your " + seamStr +
            " mm cup seam matched to the Upper Cup, the bottom edge is your " + waistStr +
            " mm waist seam matched to the Front Body, both at the notches)",
            lowerCup, &lcT0, &lcT1, &lcB0, &lcB1);
        // Front Body: waist seam on top, hem at the bottom.
        Point fbT0 = wL, fbT1 = wR;
        double fbdx, fbdy;
        rebase(frontBody, fbdx, fbdy);
        fbT0.x -= fbdx; fbT0.y -= fbdy; fbT1.x -= fbdx; fbT1.y -= fbdy;
        PatternPiece fb = cupPiece(
            bodyName,
            cutCount + onFold + " (Front Body — the panel below the waist, from the "
            "waist seam down to the hem; the top edge is your " + waistStr +
            " mm waist seam, matched to the Lower Cup at the notches)",
            frontBody, &fbT0, &fbT1, nullptr, nullptr);

        outLowerPerim = pathLength(lo.commands);
        const Rect lb = boundingBox(lo.commands);
        outLowerW = lb.width; outLowerH = lb.height;

        replacement.push_back(lo);
        replacement.push_back(fb);
    } else {
        // No fabric below the waist (bodice-length front / cropped top): keep the
        // single Lower Cup running from the cup seam to the panel hem.
        Point lL = cutL, lR = cutR;
        double ldx, ldy;
        rebase(lower, ldx, ldy); lL.x -= ldx; lL.y -= ldy; lR.x -= ldx; lR.y -= ldy;
        PatternPiece lo = cupPiece(
            lowerName,
            cutCount + onFold + " (Lower Cup — the cup seam down to the waist; the top "
            "edge is your " + seamStr +
            " mm cup seam, matched to the Upper Cup at the notches)",
            lower, &lL, &lR, nullptr, nullptr);
        outLowerPerim = pathLength(lo.commands);
        const Rect lb = boundingBox(lo.commands);
        outLowerW = lb.width; outLowerH = lb.height;
        replacement.push_back(lo);
    }

    // Replace the original panel with the new bands (top to bottom) in place.
    pattern.pieces.erase(pattern.pieces.begin() + idx);
    pattern.pieces.insert(pattern.pieces.begin() + idx,
                          replacement.begin(), replacement.end());
    return true;
}

} // namespace

// The strapless-bustier class rule (see header). A cup seam is a strapless-support
// construction, so BOTH conditions must hold: strapless (sleeveless or cap sleeve)
// AND a bustier top edge (a neckline that sits above the bust apex — sweetheart,
// square/straight or scoop). Encoded here as one named rule, not an ad-hoc list.
bool isStraplessBustierClass(Neckline neckline, SleeveStyle sleeve, bool cap) {
    // (1) STRAPLESS: no shoulder-carried sleeve. Sleeveless is strapless; a cap
    // sleeve is a weightless wing off the armhole so it still counts; any real
    // set-in / straight / balloon sleeve is a shoulder-supported bodice and fails.
    const bool strapless = sleeve == SleeveStyle::None || cap;
    if (!strapless) return false;
    // (2) BUSTIER TOP EDGE: a neckline whose top edge sits ABOVE the bust apex so a
    // real Upper Cup exists to split, and that the horizontal cup cut does not
    // reshape. Sweetheart, square (straight strapless) and scoop qualify. V-neck /
    // cowl plunge below the apex (no upper cup); crew / boat / halter / etc. are
    // shoulder-shaped, not strapless bustier tops.
    return neckline == Neckline::Sweetheart ||
           neckline == Neckline::Square ||
           neckline == Neckline::Scoop;
}

bool apply(DraftedPattern& pattern, CupSeam style, Neckline neckline,
           SleeveStyle sleeve, bool cap, double waistBelowApex) {
    if (style == CupSeam::None) return true;

    // HOST: only the STRAPLESS-BUSTIER CLASS carries a cup seam — a strapless
    // (sleeveless or cap-sleeve) princess bodice whose top edge is a sweetheart,
    // square or scoop (a top edge above the bust apex). Any bodice with a real
    // shoulder-carried sleeve, or a neckline that isn't a bustier top edge, is
    // refused honestly: a horizontal bust seam only makes sense as strapless
    // support (a crew / high / sleeved bodice shapes the bust through the princess
    // seam alone).
    if (!isStraplessBustierClass(neckline, sleeve, cap)) {
        pattern.guideSteps.push_back(
            "Cup seam: skipped — a horizontal cup seam is the STRAPLESS bustier "
            "construction (a sleeveless or cap-sleeve bodice with a sweetheart, "
            "square or scoop top edge). This draft isn't that class — it has a "
            "shoulder-carried sleeve or a neckline that isn't a strapless bustier "
            "top edge, so the bust is shaped through the princess seam alone. "
            "Nothing changed.");
        return false;
    }

    // The host must be a PRINCESS front (a center + side front panel). A dart
    // bodice has no princess panel to split, so it is refused honestly.
    PatternPiece* center = findPiece(pattern, {"Bodice Center Front", "Top Center Front"});
    if (!center) {
        pattern.guideSteps.push_back(
            "Cup seam: skipped — this draft has no princess FRONT panel to split "
            "into cups (it isn't princess-seamed, or it's a skirt). Draft it "
            "princess-seamed to get the Corset Bustier cup seam.");
        return false;
    }

    // The top-edge word for the Upper Cup cut note — the actual drafted neckline
    // (sweetheart / square / scoop), so the note never lies about the shape the
    // Upper Cup carries. The cup cut is HORIZONTAL at the apex and leaves the top
    // edge exactly as drawn: a square top stays square, a scoop stays scooped.
    const std::string topEdgeWord =
        neckline == Neckline::Square ? "square (straight strapless)"
        : neckline == Neckline::Scoop ? "scooped"
        : "sweetheart";

    // Split the center front panel (always present on a princess front). Split the
    // side front panel too when it exists (a full bustier cups across both the CF
    // and side-front panels, so both carry the horizontal seam). Discard the sizing
    // outs (they only served the earlier signature); we care about the split flags
    // and, per panel, whether a Front Body band was cut off below the waist.
    double s = 0, sw = 0, upP = 0, loP = 0, uW = 0, uH = 0, lW = 0, lH = 0;
    bool bodyCC = false, bodyCT = false, bodySC = false, bodyST = false;
    const bool splitC = splitOnePanel(
        pattern, "Bodice Center Front", "Upper Cup Center Front", "Lower Cup Center Front",
        "Front Body Center Front", topEdgeWord, waistBelowApex,
        s, sw, upP, loP, uW, uH, lW, lH, bodyCC);
    // A Top renames "Bodice" -> "Top"; try that host name too.
    bool splitCtop = false;
    if (!splitC)
        splitCtop = splitOnePanel(
            pattern, "Top Center Front", "Upper Cup Center Front", "Lower Cup Center Front",
            "Front Body Center Front", topEdgeWord, waistBelowApex,
            s, sw, upP, loP, uW, uH, lW, lH, bodyCT);

    if (!splitC && !splitCtop) {
        pattern.guideSteps.push_back(
            "Cup seam: skipped — the front panel could not be split cleanly at the "
            "bust apex (no apex notch found). Nothing changed.");
        return false;
    }

    // Side front cups (optional — present on most princess fronts).
    splitOnePanel(pattern, "Bodice Side Front", "Upper Cup Side Front", "Lower Cup Side Front",
                  "Front Body Side Front", topEdgeWord, waistBelowApex,
                  s, sw, upP, loP, uW, uH, lW, lH, bodySC) ||
        splitOnePanel(pattern, "Top Side Front", "Upper Cup Side Front", "Lower Cup Side Front",
                      "Front Body Side Front", topEdgeWord, waistBelowApex,
                      s, sw, upP, loP, uW, uH, lW, lH, bodyST);

    const bool anyBody = bodyCC || bodyCT || bodySC || bodyST;

    pattern.guideSteps.push_back(
        std::string("Cup seam (kup dikişi — Corset Bustier): each front cup is cut "
        "into an Upper Cup and a Lower Cup meeting at a horizontal seam through the "
        "bust apex") + (anyBody ?
        ", and the Lower Cup is cut again at the waist so a separate Front Body "
        "carries the panel from the waist down to the hem (the three-band bustier "
        "front). Sew the bands from the top down" : "") +
        ". Stay-stitch each seam edge, then pin the Upper Cup's lower edge to the "
        "Lower Cup's top edge right sides together, matching the two notches, and "
        "sew" + (anyBody ?
        "; then pin the Lower Cup's lower edge to the Front Body's top edge the same "
        "way at the waist notches and sew" : "") +
        ". Clip the curves, press the seams open (or up), and topstitch if you want "
        "it crisp. The horizontal cup seam is what cups the bust and lets a strapless "
        "bodice stand up on its own.");
    return true;
}

} // namespace CupSeamBlock
} // namespace stitchu
