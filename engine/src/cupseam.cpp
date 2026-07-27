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

// ---------------------------------------------------------------------------
// Bugra Buttoned Corset Bustier construction (CupSeam::Bugra).
//
// Every proportion below is MEASURED off the purchased Buğra pattern's size-36
// vector geometry (patterns_real/geometry/geometry-full.json; the six corrected
// piece identities are proven in the 2026-07-27 föy IoU matching) and expressed
// as a SHARE of the draft's own measured spans (apex→waist drop, apex→shoulder
// crown, underarm level) so the construction scales with any body instead of
// replaying the size-36 millimetres. The two strap band widths and the hem drop
// are style constants of the garment itself (like empireDrop / frontBalanceDrop)
// — a corset hem depth does not scale with height the way a seam does.

namespace {

std::vector<Point> translated(std::vector<Point> v, double dx, double dy) {
    for (auto& p : v) { p.x += dx; p.y += dy; }
    return v;
}

Point rotatedPoint(Point p, Point about, double angle) {
    const double c = std::cos(angle), s = std::sin(angle);
    const double x = p.x - about.x, y = p.y - about.y;
    return {about.x + c * x - s * y, about.y + s * x + c * y};
}

// Build a finished Bugra piece from commands drawn in the shared body frame:
// notch ticks become markings, a vertical grainline is placed, and the piece is
// rebased to a local top-left origin like every other drafted piece.
PatternPiece bugraPiece(const std::string& name, const std::string& cutNote,
                        std::vector<PathCommand> cmds,
                        const std::vector<std::pair<Point, Point>>& notchTicks) {
    PatternPiece p;
    p.name = name;
    p.cutInstruction = cutNote;
    p.commands = std::move(cmds);
    for (const auto& t : notchTicks) {
        p.markings.push_back(PathCommand::move(t.first));
        p.markings.push_back(PathCommand::line(t.second));
    }
    const Rect b = boundingBox(p.commands);
    p.hasGrainline = true;
    const double gx = b.x + b.width * 0.5;
    p.grainline = Grainline{{gx, b.y + b.height * 0.15}, {gx, b.y + b.height * 0.85}};
    p.seamAllowance = SA;
    translatePiece(p, -b.x, -b.y);
    return p;
}

// Carry the host panel's own markings (the grown button-placket fold line,
// facing line and buttonhole ticks the placket block drew BEFORE this pass)
// into a band piece: marking pairs fully inside [y0, y1] are kept, and a
// vertical line that spans the band (the fold/facing line) is clamped to it.
// Appended to `into` in the shared frame (bugraPiece rebases afterwards? no —
// callers append BEFORE construction, so pass-through happens via notchTicks?
// — no: this appends move/line pairs directly; call it on the piece AFTER
// bugraPiece() with the frame shift applied by the caller).
void clipMarkPairsInto(std::vector<PathCommand>& into,
                       const std::vector<PathCommand>& markings,
                       double y0, double y1, double dx, double dy) {
    for (size_t i = 0; i + 1 < markings.size(); i += 2) {
        if (markings[i].type != CmdType::Move || markings[i + 1].type != CmdType::Line) continue;
        Point a = markings[i].to, b = markings[i + 1].to;
        const double lo = std::min(a.y, b.y), hi = std::max(a.y, b.y);
        if (hi < y0 || lo > y1) continue; // outside the band
        const bool vertical = std::fabs(a.x - b.x) < 0.5 && (hi - lo) > 30;
        if (vertical) { // fold / facing line: clamp to the band
            a.y = std::max(a.y, y0); a.y = std::min(a.y, y1);
            b.y = std::max(b.y, y0); b.y = std::min(b.y, y1);
        } else if (lo < y0 || hi > y1) {
            continue; // a short tick straddling the cut: drop, do not distort
        }
        into.push_back(PathCommand::move({a.x + dx, a.y + dy}));
        into.push_back(PathCommand::line({b.x + dx, b.y + dy}));
    }
}


// Honest structural refusal for the Bugra pass: every guard that bails leaves
// a note naming WHERE the geometry did not map (never a silent no-op).
bool bugraRefuse(DraftedPattern& pattern, const std::string& where) {
    pattern.guideSteps.push_back(
        "Bugra corset: skipped — the drafted geometry did not map at: " + where +
        ". Nothing changed.");
    return false;
}

std::string mmStr(double v) {
    return std::to_string(static_cast<long>(std::lround(v)));
}

// The full six-piece Buğra corset restructure. Returns false with an honest
// guide note whenever the host is not the (princess, strapless-bustier,
// below-waist) draft the construction needs — never a silent no-op.
bool applyBugra(DraftedPattern& pattern, Neckline neckline, SleeveStyle sleeve,
                bool cap, double waistBelowApex, double backWaistY) {
    // The Buğra corset is a strapless-CLASS bodice (its cut-on straps replace
    // separate straps, the support is still the cups). A halter's shifted frame
    // is a different construction and is refused honestly.
    if (neckline == Neckline::Halter ||
        !isStraplessBustierClass(neckline, sleeve, cap)) {
        pattern.guideSteps.push_back(
            "Bugra corset: skipped — this construction needs a sleeveless (or cap-"
            "sleeve) princess bodice with a sweetheart, square or scoop top edge "
            "(the strapless bustier class; halter keeps its own frame). Nothing changed.");
        return false;
    }
    PatternPiece* fc = findPiece(pattern, {"Top Center Front", "Bodice Center Front"});
    PatternPiece* fs = findPiece(pattern, {"Top Side Front", "Bodice Side Front"});
    PatternPiece* bc = findPiece(pattern, {"Top Center Back", "Bodice Center Back"});
    PatternPiece* bs = findPiece(pattern, {"Top Side Back", "Bodice Side Back"});
    if (!fc || !fs || !bc || !bs ||
        fc->markings.empty() || fs->markings.empty() ||
        bc->markings.empty() || bs->markings.empty()) {
        pattern.guideSteps.push_back(
            "Bugra corset: skipped — the draft has no full princess front + back "
            "(center and side panels with their apex notches) to rebuild from. "
            "Draft it princess-seamed. Nothing changed.");
        return false;
    }
    if (waistBelowApex <= 0 || backWaistY <= 0) {
        pattern.guideSteps.push_back(
            "Bugra corset: skipped — the corset body runs from the underbust down "
            "PAST the waist to a high-hip hem, so it needs a top that extends below "
            "the waist (topLength hip or tunic). Nothing changed.");
        return false;
    }

    // ---- FRONT: shared frame = the center panel's own (un-rebased) frame ----
    const Point apexF = fc->markings[0].to;
    const Point apexFS = fs->markings[0].to;
    const std::vector<Point> loopC = flattenOutline(fc->commands);
    const std::vector<Point> loopS =
        translated(flattenOutline(fs->commands), apexF.x - apexFS.x, apexF.y - apexFS.y);
    if (loopC.size() < 4 || loopS.size() < 4) return bugraRefuse(pattern, "front panel outlines");

    const double apexY = apexF.y;
    const double waistY = apexY + waistBelowApex;
    const double underbustY = apexY + bugra::cupDepthShare * waistBelowApex;
    const double hemY = waistY + bugra::hemBelowWaistMM;
    double frontMaxY = -1e18;
    for (const auto& p : loopC) frontMaxY = std::max(frontMaxY, p.y);
    if (hemY > frontMaxY - 5) {
        pattern.guideSteps.push_back(
            "Bugra corset: skipped — the drafted front does not reach the corset "
            "hem (waist + " + mmStr(bugra::hemBelowWaistMM) +
            " mm). Draft with topLength hip or tunic. Nothing changed.");
        return false;
    }

    // Center panel: cut at the underbust, the hem, and the cup seam (apex).
    std::vector<Point> cAbove, cBelow, cBody, cTail;
    Point cUbL{}, cUbR{}, cHemL{}, cHemR{};
    if (!splitLoopAtY(loopC, underbustY, cAbove, cBelow, cUbL, cUbR)) return bugraRefuse(pattern, "front center underbust cut");
    if (!splitLoopAtY(cBelow, hemY, cBody, cTail, cHemL, cHemR)) return bugraRefuse(pattern, "front center hem cut");
    // Side panel: same two cuts in the shared frame.
    std::vector<Point> sAbove, sBelow, sBody, sTail;
    Point sUbL{}, sUbR{}, sHemL{}, sHemR{};
    if (!splitLoopAtY(loopS, underbustY, sAbove, sBelow, sUbL, sUbR)) return bugraRefuse(pattern, "front side underbust cut");
    if (!splitLoopAtY(sBelow, hemY, sBody, sTail, sHemL, sHemR)) return bugraRefuse(pattern, "front side hem cut");

    // ---- 1. UPPER CUP + 2. LOWER CUP: the crescent cup seam ---------------
    // The Bugra cup seam is NOT a horizontal cut: the pattern-cutting foy (piece
    // 1/2) shows an ARC that sits AT the bust point under the bust and dips to
    // the underbust line at both ends — a short blunt edge at CF and a POINT at
    // the side seam. The Lower Cup is the true under-bust CRESCENT between that
    // arc and the straight underbust seam (thickest under the bust, vanishing
    // at the side). Both pieces draw the SAME arc, so the cup seam is trued by
    // construction; the crescent's bottom edge is the same underbust line the
    // two Front Body pieces carry (the princess intake width between them is
    // taken out of the crescent's side end so the sewn lengths match).
    double topYF = 1e18;
    for (const auto& p : cAbove) topYF = std::min(topYF, p.y);
    for (const auto& p : sAbove) topYF = std::min(topYF, p.y);
    const double crownH = apexY - topYF;                // apex->shoulder-line span
    // The CUPS sew at the true center front (x = 0): the grown button stand
    // belongs to the Front Body Center below the underbust; the cup region
    // closes at a CF seam, so the cup pieces start at x = 0, not at the stand.
    const double xCF = 0.0;
    const double xTip = sUbR.x;                         // side seam x at the underbust
    const double cfRise = bugra::cfRiseShare * crownH;  // (kept for the note only)
    (void)cfRise;
    const double bodyH = bugra::crownShare * crownH;    // cup height at the strap
    const double sw = bugra::strapFrontW;
    const double strapTopY = topYF + bugra::strapFrontTopInsetMM;
    // The strap sits over the BUST POINT (share of CF->side measured off Bugra),
    // not over the princess seam - the corset seam is a style line moved toward
    // the side, while the strap must still rise over the bust.
    const double strapCX = xCF + bugra::strapCenterShare * (xTip - xCF);
    const double sx0 = strapCX - sw / 2, sx1 = strapCX + sw / 2;
    const double lean = bugra::frontStrapLeanMM; // top of the strap toward CF/neck
    const double strapRun = (apexY - bodyH) - strapTopY;

    // Cup-seam arc anchors: CF end (short blunt edge), bust point, side tip.
    const Point aCF{xCF, underbustY - bugra::crescentCFDepthMM};
    const Point aBust{strapCX, apexY};
    const Point aTip{xTip, underbustY - bugra::cupSeamTipDepthMM};
    // The arc drawn CF -> bust -> tip (the crescent top edge); the Upper Cup
    // draws it tip -> bust -> CF (same cubics reversed = identical geometry).
    const PathCommand arcCFtoBust = PathCommand::curve(
        aBust,
        {xCF + (strapCX - xCF) * 0.35, aCF.y - (aCF.y - apexY) * 0.10},
        {strapCX - (strapCX - xCF) * 0.30, apexY});
    const PathCommand arcBustToTip = PathCommand::curve(
        aTip,
        {strapCX + (xTip - strapCX) * 0.30, apexY},
        {xTip - (xTip - strapCX) * 0.25, aTip.y - (aTip.y - apexY) * 0.15});
    const double cupSeamLen =
        pathLength({PathCommand::move(aCF), arcCFtoBust, arcBustToTip});

    std::vector<PathCommand> up;
    up.push_back(PathCommand::move(aCF));
    up.push_back(PathCommand::line({xCF, aCF.y - bugra::cfEdgeHMM}));      // CF edge
    up.push_back(PathCommand::curve({sx0, apexY - bodyH},                   // top edge to strap
                                    {xCF + (sx0 - xCF) * 0.55, aCF.y - bugra::cfEdgeHMM - 14},
                                    {sx0 - 10, apexY - bodyH + 36}));
    up.push_back(PathCommand::curve({sx0 + lean, strapTopY},                // strap front edge
                                    {sx0 + lean * 0.2, apexY - bodyH - strapRun * 0.4},
                                    {sx0 + lean * 0.9, strapTopY + strapRun * 0.35}));
    up.push_back(PathCommand::line({sx1 + lean, strapTopY}));               // strap top
    up.push_back(PathCommand::curve({sx1, apexY - bodyH},                   // strap back edge
                                    {sx1 + lean * 0.9, strapTopY + strapRun * 0.35},
                                    {sx1 + lean * 0.2, apexY - bodyH - strapRun * 0.4}));
    const Point sideTop{xTip, aTip.y - bugra::sideEndHMM};                  // blunt side end top (above the seam tip)
    up.push_back(PathCommand::curve(sideTop,                                 // top edge dives right after the strap
                                    {sx1 + (xTip - sx1) * 0.05,
                                     (apexY - bodyH) + (sideTop.y - (apexY - bodyH)) * 0.55},
                                    {xTip - (xTip - sx1) * 0.45, sideTop.y - 5}));
    up.push_back(PathCommand::line(aTip));                                   // short blunt side edge
    up.push_back(reverseCubic(aBust, arcBustToTip));                        // cup seam: tip -> bust
    up.push_back(reverseCubic(aCF, arcCFtoBust));                           // cup seam: bust -> CF
    up.push_back(PathCommand::close());

    PatternPiece pUpper = bugraPiece(
        "Upper Cup",
        "cut 2 mirrored (Upper Cup — ONE piece across the whole front cup, no "
        "center/side split, with a grown cut-on strap over the bust; the lower "
        "edge is your " + mmStr(cupSeamLen) +
        " mm crescent cup seam, matched to the Lower Cup at the notches)",
        up,
        {{aCF, {aCF.x + 12, aCF.y - 8}}, {{aBust.x, aBust.y}, {aBust.x - 12, aBust.y - 8}}});

    // Lower Cup: the crescent. Top edge = the same arc; bottom edge = the
    // straight underbust seam, its length = the two Front Body top edges summed
    // (the princess intake between them is taken out of the side end).
    // Center underbust seam measured from the CF FOLD LINE (x = 0): the grown
    // stand region folds under, it is not sewn seam length.
    const double ubCenterLen = cUbR.x;
    const double ubSideLen = sUbR.x - sUbL.x;
    const double gapW = std::max(0.0, sUbL.x - cUbR.x);
    // The crescent tapers OUT before the side seam (crescentSpanShare): from its
    // tip to the side seam the Upper Cup's seam tail sews DIRECTLY onto the
    // outer top edge of the Front Body Side. Its own tip is thinner than the
    // cup seam's side end, giving the true banana shape.
    const double xC = xCF + bugra::crescentSpanShare * (xTip - xCF);
    const Point cTip{xC, underbustY - bugra::crescentTipDepthMM};
    const PathCommand cresBustToTip = PathCommand::curve(
        cTip,
        {strapCX + (xC - strapCX) * 0.30, apexY},
        {xC - (xC - strapCX) * 0.25, cTip.y - (cTip.y - apexY) * 0.15});
    std::vector<PathCommand> cres;
    cres.push_back(PathCommand::move(aCF));
    cres.push_back(arcCFtoBust);
    cres.push_back(cresBustToTip);
    cres.push_back(PathCommand::line({xC - gapW, underbustY}));    // tip end (intake removed)
    cres.push_back(PathCommand::line({xCF, underbustY}));          // underbust seam back to CF
    cres.push_back(PathCommand::close());                          // CF end up to aCF
    PatternPiece pLower = bugraPiece(
        "Lower Cup",
        "cut 2 mirrored (Lower Cup — the under-bust crescent; the top edge is your " +
        mmStr(cupSeamLen) + " mm crescent cup seam matched to the Upper Cup, the "
        "bottom edge is your " + mmStr(ubCenterLen) + " + " + mmStr(ubSideLen) +
        " mm underbust seam matched to the Front Body Center and Front Body Side "
        "at the notches)",
        cres,
        {{aCF, {aCF.x + 12, aCF.y + 8}},
         {cTip, {cTip.x - 12, cTip.y + 8}},
         {{xCF, underbustY}, {xCF + 12, underbustY - 8}},
         {{xC - gapW, underbustY}, {xC - gapW - 12, underbustY - 8}}});

    // ---- 3./4. FRONT BODY CENTER + SIDE: underbust seam → corset hem --------
    PatternPiece pFBC = bugraPiece(
        "Front Body Center",
        "cut 2 mirrored (Front Body Center — underbust seam to the corset hem; the "
        "center-front edge is the grown button-placket edge, the top edge is your " +
        mmStr(ubCenterLen) + " mm underbust seam matched to the Lower Cup at the notches)",
        outlineFromLoop(cBody),
        {{cUbL, {cUbL.x + 12, cUbL.y + 8}}, {cUbR, {cUbR.x - 12, cUbR.y + 8}}});
    // Carry the placket fold/facing lines + buttonholes (drawn on the host front
    // before this pass) into the band, clipped to it, so the buttoned CF edge
    // stays a REAL drawn closure, not a lost marking. The piece was rebased by
    // bugraPiece; shift the clipped markings by the same delta.
    {
        const Rect bb = boundingBox(outlineFromLoop(cBody));
        clipMarkPairsInto(pFBC.markings, fc->markings, underbustY, hemY, -bb.x, -bb.y);
    }
    PatternPiece pFBS = bugraPiece(
        "Front Body Side",
        "cut 2 mirrored (Front Body Side — underbust seam to the corset hem, "
        "starting AT the underbust; the top edge is your " + mmStr(ubSideLen) +
        " mm underbust seam matched to the Lower Cup at the notches)",
        outlineFromLoop(sBody),
        {{sUbL, {sUbL.x + 12, sUbL.y + 8}}, {sUbR, {sUbR.x - 12, sUbR.y + 8}}});

    // ---- BACK: shared frame = the center back panel's frame -----------------
    const Point apexB = bc->markings[0].to;
    const Point apexBS = bs->markings[0].to;
    const std::vector<Point> loopBC = flattenOutline(bc->commands);
    const std::vector<Point> loopBS =
        translated(flattenOutline(bs->commands), apexB.x - apexBS.x, apexB.y - apexBS.y);
    // The underarm point is READ from the drafted side-back panel itself: a
    // princess side panel always starts move(split) + the armhole cubic down to
    // the underarm, so commands[1].to IS the drafted underarm (measured, never a
    // hardcoded level). A max-x scan would be fooled by the hip flare below.
    if (bs->commands.size() < 2 || bs->commands[1].type != CmdType::Curve)
        return bugraRefuse(pattern, "back underarm point");
    const Point underarm{bs->commands[1].to.x + (apexB.x - apexBS.x),
                         bs->commands[1].to.y + (apexB.y - apexBS.y)};
    const double backTopY = underarm.y - bugra::backTopAboveUnderarmMM;
    const double backHemY = backWaistY + bugra::hemBelowWaistMM;
    double backMaxY = -1e18;
    for (const auto& p : loopBC) backMaxY = std::max(backMaxY, p.y);
    if (backHemY > backMaxY - 5 || backTopY <= 0) {
        pattern.guideSteps.push_back(
            "Bugra corset: skipped — the drafted back does not span the corset back "
            "(top edge under the shoulder blade to a high-hip hem). Nothing changed.");
        return false;
    }

    // ---- 6. BACK BODY CENTER: the SHORT corset back, cut on fold ------------
    std::vector<Point> bcTop, bcRest, bcBody, bcTail;
    Point bcTopL{}, bcTopR{}, bcHemL{}, bcHemR{};
    if (!splitLoopAtY(loopBC, backTopY, bcTop, bcRest, bcTopL, bcTopR)) return bugraRefuse(pattern, "back center top cut");
    if (!splitLoopAtY(bcRest, backHemY, bcBody, bcTail, bcHemL, bcHemR)) return bugraRefuse(pattern, "back center hem cut");
    // The CB edge becomes the FOLD: straighten the small drafted CB take-in onto
    // x = 0 so the piece is honestly cuttable on the fold.
    for (auto& p : bcBody) if (p.x < 15.0) p.x = 0;
    PatternPiece pBBC = bugraPiece(
        "Back Body Center",
        "cut 1 on fold (Back Body Center — the SHORT corset back; the top edge ends "
        "under the shoulder blade, the center back is the fold — this is not a "
        "shoulder-to-hip tank back)",
        outlineFromLoop(bcBody), {});

    // ---- 5. BACK BODY SIDE: body + armhole sweep + cut-on strap, one piece --
    std::vector<Point> bsTop, bsRest, bsBody, bsTail;
    Point bsTopL{}, bsTopR{}, bsHemL{}, bsHemR{};
    if (!splitLoopAtY(loopBS, backTopY, bsTop, bsRest, bsTopL, bsTopR)) return bugraRefuse(pattern, "back side top cut");
    if (!splitLoopAtY(bsRest, backHemY, bsBody, bsTail, bsHemL, bsHemR)) return bugraRefuse(pattern, "back side hem cut");
    // Locate the two top-cut corners in the body loop so the strap + armhole
    // sweep can replace the straight top edge between them.
    const size_t nBS = bsBody.size();
    size_t iL = nBS, iR = nBS;
    for (size_t i = 0; i < nBS; ++i) {
        if (std::fabs(bsBody[i].y - backTopY) > 1e-6) continue;
        if (std::fabs(bsBody[i].x - bsTopL.x) < 1e-6) iL = i;
        if (std::fabs(bsBody[i].x - bsTopR.x) < 1e-6) iR = i;
    }
    if (iL == nBS || iR == nBS || iL == iR) return bugraRefuse(pattern, "back side top-cut corners");
    // The armhole SWEEP replaces the drafted armhole fragment: it lands directly
    // on the drafted underarm point, so start the body walk there (the drafted
    // armhole points between the top cut and the underarm are consumed).
    size_t iU = iR;
    double bestD = 1e18;
    for (size_t i = 0; i < nBS; ++i) {
        const double d = std::hypot(bsBody[i].x - underarm.x, bsBody[i].y - underarm.y);
        if (d < bestD) { bestD = d; iU = i; }
    }
    double topYB = 1e18;
    for (const auto& p : loopBC) topYB = std::min(topYB, p.y);
    const double sbw = bugra::strapBackW;
    const double strapTopYB = topYB + bugra::strapTopInsetMM + 8;
    // The strap leans toward the center back as it rises (Bugra foy piece 5).
    const Point innerTop{bsTopL.x + 2 - bugra::backStrapLeanMM, strapTopYB};
    const Point outerTop{innerTop.x + sbw, strapTopYB};
    const Point sweepStart{bsTopL.x + sbw, backTopY - bugra::sweepRiseMM};
    std::vector<PathCommand> bsc;
    bsc.push_back(PathCommand::move(innerTop));
    bsc.push_back(PathCommand::line(outerTop));
    bsc.push_back(PathCommand::curve(
        sweepStart,
        {outerTop.x + 4, strapTopYB + (sweepStart.y - strapTopYB) * 0.4},
        {sweepStart.x - 2, sweepStart.y - 30}));
    // The concave armhole sweep runs from the strap edge DOWN INTO the drafted
    // underarm point in one curve (the corset armhole).
    bsc.push_back(PathCommand::curve(
        bsBody[iU],
        {sweepStart.x + 8, backTopY + (bsBody[iU].y - backTopY) * 0.45},
        {bsBody[iU].x - (bsBody[iU].x - sweepStart.x) * 0.35, bsBody[iU].y - 10}));
    for (size_t i = (iU + 1) % nBS;; i = (i + 1) % nBS) {
        bsc.push_back(PathCommand::line(bsBody[i]));
        if (i == iL) break;
    }
    bsc.push_back(PathCommand::curve(
        innerTop,
        {bsTopL.x - 4, backTopY - (backTopY - strapTopYB) * 0.4},
        {innerTop.x + 2, strapTopYB + (backTopY - strapTopYB) * 0.3}));
    bsc.push_back(PathCommand::close());
    PatternPiece pBBS = bugraPiece(
        "Back Body Side",
        "cut 2 mirrored (Back Body Side — body, lower armhole sweep and grown "
        "cut-on strap in ONE piece; the strap runs over the shoulder and joins the "
        "Upper Cup strap — try on and pin to length before sewing the join)",
        bsc,
        {{innerTop, {innerTop.x + 10, innerTop.y + 10}}});

    // ---- Replace the four princess panels (and the binding strip) -----------
    size_t insertAt = pattern.pieces.size();
    for (size_t i = 0; i < pattern.pieces.size(); ++i)
        if (&pattern.pieces[i] == fc) { insertAt = i; break; }
    std::vector<PatternPiece> kept;
    kept.reserve(pattern.pieces.size());
    std::vector<PatternPiece> six{pUpper, pLower, pFBC, pFBS, pBBS, pBBC};
    bool inserted = false;
    for (size_t i = 0; i < pattern.pieces.size(); ++i) {
        const PatternPiece& pc = pattern.pieces[i];
        const bool consumed = (&pc == fc || &pc == fs || &pc == bc || &pc == bs ||
                               pc.name.find("Bias binding") != std::string::npos ||
                               pc.name.find("Neck Facing") != std::string::npos);
        if (i == insertAt) {
            kept.insert(kept.end(), six.begin(), six.end());
            inserted = true;
        }
        if (!consumed) kept.push_back(pc);
    }
    if (!inserted) kept.insert(kept.end(), six.begin(), six.end());
    pattern.pieces = std::move(kept);

    // Drop the now-moot finish steps: the corset has no shoulder seam and no
    // bias strip (the full-lining step below replaces them honestly).
    pattern.guideSteps.erase(
        std::remove_if(pattern.guideSteps.begin(), pattern.guideSteps.end(),
                       [](const std::string& s) {
                           return s.find("bias strip") != std::string::npos ||
                                  s.find("shoulder seams") != std::string::npos;
                       }),
        pattern.guideSteps.end());

    // ---- Guide: the corset sews in this order (names every piece) -----------
    pattern.guideSteps.push_back(
        "Bugra corset construction: the front is built in three horizontal bands — "
        "sew the Upper Cup's lower edge to the Lower Cup's top edge along the " +
        mmStr(cupSeamLen) + " mm cup seam, matching the notches; then sew the Lower "
        "Cup's bottom edge to the Front Body Center and Front Body Side along the "
        "underbust seam, matching the notches. Sew the Front Body Center to the "
        "Front Body Side along the princess seam below the underbust.");
    pattern.guideSteps.push_back(
        "Back: sew the Back Body Center (cut on the fold — the short corset back) "
        "to the Back Body Side along the back princess seam, then close the side "
        "seams. The Back Body Side's grown strap runs over the shoulder; try the "
        "corset on, pin each back strap to its Upper Cup strap at the shoulder to "
        "length, then sew the strap join.");
    pattern.guideSteps.push_back(
        "Corset finish (Bugra): cut EVERY piece a second time in self fabric as a "
        "full lining and bag the corset out — the lining finishes every raw edge "
        "(the top edge, the armholes and the straps), so no bias binding strip is "
        "cut. Close the buttoned front last: the Front Body Center's placket edge "
        "carries the fold line and buttonholes.");
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
    // reshape. Sweetheart, square (straight strapless), scoop and HALTER qualify.
    // A halter is a strapless-support garment: the neck band replaces the straps,
    // the shoulders are bare, and the bust is held by the cups — exactly what the
    // cup seam is for. Its front neckline hugs the neck band / rises off the CF
    // plunge, sitting above the bust apex like a sweetheart, so a real Upper Cup
    // exists to split. V-neck / cowl plunge below the apex (no upper cup); crew /
    // boat / etc. are shoulder-shaped, not strapless bustier tops. (If for a given
    // body a halter front dips below the apex the horizontal cut finds no clean
    // upper region and splitOnePanel refuses that panel honestly, exactly like a
    // v-neck — the gate permits the class, the geometry keeps the truing honest.)
    return neckline == Neckline::Sweetheart ||
           neckline == Neckline::Square ||
           neckline == Neckline::Scoop ||
           neckline == Neckline::Halter;
}

bool apply(DraftedPattern& pattern, CupSeam style, Neckline neckline,
           SleeveStyle sleeve, bool cap, double waistBelowApex,
           double backWaistY) {
    if (style == CupSeam::None) return true;

    // The Bugra variant is the full six-piece corset restructure (front cups +
    // front bodies + short fold back + strapped side back), not a per-panel
    // split — it has its own honest gates and never falls through to the
    // Horizontal path.
    if (style == CupSeam::Bugra)
        return applyBugra(pattern, neckline, sleeve, cap, waistBelowApex, backWaistY);

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
        : neckline == Neckline::Halter ? "halter (neck-band top edge, bare shoulders)"
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
