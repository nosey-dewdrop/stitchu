#include "hem.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "boxpleat.hpp"   // BoxPleatBlock::growCfPleat — reused for the kick pleat
#include "curvefit.hpp"   // fitCubicsAtBreaks — the lift is fit through SAMPLES

namespace stitchu {
namespace HemBlock {

namespace {

// A piece is a shirttail/high-low host if it is a fitted lower body panel with a
// real hem band that TAPERS (a shaped side edge), not a plain gathered/pleated
// rectangle or a circle arc. We reshape the hem of the front/back skirt/dress-
// skirt/top pieces only.
bool isBodyLowerPiece(const PatternPiece& p) {
    const std::string& n = p.name;
    // Circle-skirt / gathered / pleated panels read as "Panel" / plain rectangles.
    if (n.find("Panel") != std::string::npos) return false;
    // The waistband, ruffles, ties, collars, plackets, peplums, facings etc. are
    // not body lower panels. A DRESS bodice ("Bodice …") is the UPPER piece — its
    // waist joins the skirt and it carries darts, so the hem shape reshapes only
    // the dress's "Skirt …" pieces, never the bodice.
    static const char* skip[] = {"Waistband", "Ruffle", "Peplum", "Tie", "Collar",
                                  "Facing", "Strap", "Sleeve", "Cuff", "Cord",
                                  "Panel", "Placket", "Bodice"};
    for (const char* s : skip)
        if (n.find(s) != std::string::npos) return false;
    // Must name a front/back skirt/top body piece (a standalone-skirt "Center
    // Front" / "Front", a dress "Skirt …", or a "Top …").
    const bool named = n.find("Front") != std::string::npos ||
                       n.find("Back") != std::string::npos;
    return named;
}

bool isFront(const PatternPiece& p) { return p.name.find("Front") != std::string::npos; }
bool isBack(const PatternPiece& p) { return p.name.find("Back") != std::string::npos; }

// Reject a plain rectangle (gathered/pleated): waist width == hem width, all
// straight. A fitted panel either curves or tapers. Defense in depth beside the
// garment-level gate.
bool tapers(const PatternPiece& p) {
    bool allStraight = true;
    double minY = 1e18, maxY = -1e18;
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Curve) allStraight = false;
        if (c.type == CmdType::Close) continue;
        minY = std::min(minY, c.to.y);
        maxY = std::max(maxY, c.to.y);
    }
    if (!allStraight) return true;
    double waistMaxX = 0, hemMaxX = 0;
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Close) continue;
        if (std::fabs(c.to.y - minY) < 1e-6) waistMaxX = std::max(waistMaxX, c.to.x);
        if (std::fabs(c.to.y - maxY) < 1e-6) hemMaxX = std::max(hemMaxX, c.to.x);
    }
    return std::fabs(waistMaxX - hemMaxX) > 1.0;
}

// The hem band = vertices within `band` mm of the piece's lowest point (max y).
// The center edge = the min-x hem vertex; the side edge = the max-x hem vertex.
struct HemGeom { double maxY; double cx; double sx; };

HemGeom hemGeom(const PatternPiece& p, double band) {
    double maxY = -1e18, minX = 1e18, maxX = -1e18;
    for (const auto& c : p.commands)
        if (c.type != CmdType::Close) maxY = std::max(maxY, c.to.y);
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Close) continue;
        if (c.to.y > maxY - band) { minX = std::min(minX, c.to.x); maxX = std::max(maxX, c.to.x); }
    }
    return {maxY, minX, maxX};
}

// Lift one point that sits in the hem band. `sideRise` lifts the side edge (x=sx)
// up by that much; the center edge (x=cx) is offset by `centerDelta` (0 for a
// shirttail; a rise for the high-low FRONT, a negative drop for the high-low
// BACK). Points between blend smoothly by their normalized x. Points above the
// band (y <= maxY - band) are untouched. y grows DOWN, so a rise SUBTRACTS y.
void liftPoint(Point& q, const HemGeom& g, double band, double sideRise, double centerDelta) {
    if (q.y <= g.maxY - band) return;                 // above the hem band: untouched
    const double span = std::max(g.sx - g.cx, 1e-6);
    double t = (q.x - g.cx) / span;                   // 0 at center edge, 1 at side edge
    t = std::clamp(t, 0.0, 1.0);
    // Smooth ease so the hem curve stays soft, not a straight ramp.
    const double e = t * t * (3.0 - 2.0 * t);         // smoothstep
    const double delta = centerDelta + (sideRise - centerDelta) * e;
    // Depth-weight: points at the very bottom move the full delta; points near the
    // top of the band (side seam) taper to zero so the side seam length is
    // preserved and the curve blends into the existing side edge.
    const double depth = std::clamp((q.y - (g.maxY - band)) / band, 0.0, 1.0);
    q.y -= delta * depth;
}

// ⭐ THE LIFT IS APPLIED TO THE CURVE, NOT TO ITS CONTROL POLYGON (2026-09-03).
//
// Until today `reshape` called `liftPoint` on a cubic's cp1/cp2 directly. A
// cubic's control points are NOT points of the curve, so lifting them by the
// value smoothstep happens to have at the CONTROL's x does not lift the curve
// by the law — and it destroys the one property the shirttail law is made of:
// delta'(0) == 0, i.e. the hem must leave the centre HORIZONTALLY so the
// mirrored halves close into a round tail. Measured on EU38 aLine midi, front
// skirt: the drafted hem's last curve arrived at CF with tangent (-89.91, 0)
// before the lift and (-89.91, +25.92) after it — a 16.1 deg kink at x = 0,
// which the flat then mirrored into the sharp "V of two straight lines" the
// referee named (KOSU/ciktilar/primitif-K4-*-flat.svg, round 1).
//
// The fix is the repo's own tool: SAMPLE the command's curve, lift every sample
// EXACTLY by the law, and refit ONE cubic through the lifted samples
// (curvefit.cpp, Schneider, endpoints interpolated exactly). One command in,
// one command out — the piece's command count, its topology and every
// downstream consumer (cutplan pairing, notch walk, stitch plan) are untouched.
constexpr int kLiftSamples = 33;   // 32 intervals over one command

Point cubicAt(const Point& p0, const Point& c1, const Point& c2, const Point& p3, double t) {
    const double u = 1.0 - t;
    const double a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return {a * p0.x + b * c1.x + c * c2.x + d * p3.x,
            a * p0.y + b * c1.y + c * c2.y + d * p3.y};
}

// Does this command's run touch the hem band at all?
bool inBand(const Point& a, const Point& b, const HemGeom& g, double band) {
    return a.y > g.maxY - band || b.y > g.maxY - band;
}

// Reshape one piece's hem. Returns the actual side rise applied (so front/back can
// be checked equal for shirttail truing).
void reshape(PatternPiece& p, double band, double sideRise, double centerDelta) {
    const HemGeom g = hemGeom(p, band);
    std::vector<PathCommand> out;
    out.reserve(p.commands.size());
    Point cur{0, 0};
    for (auto& c : p.commands) {
        if (c.type == CmdType::Close) { out.push_back(c); continue; }
        if (c.type == CmdType::Move) {
            PathCommand m = c;
            liftPoint(m.to, g, band, sideRise, centerDelta);
            cur = c.to;
            out.push_back(m);
            continue;
        }
        const Point p0 = cur, p3 = c.to;
        cur = c.to;
        // ⛔ A LINE STAYS A LINE. The gore-pair rule in validator.cpp:711 reads
        // the panel layout by COMMAND TYPE (center [2],[3] Line, side [5],[6]
        // Line); turning a straight seam leg into a curve makes the gore seam
        // unmeasurable ("unexpected gore panel layout" x2, measured). A straight
        // edge also has nothing to bend: lifting its two ends IS the exact lift,
        // because the law is linear along a straight run only in the sense that
        // a seam leg must stay straight to still match its partner.
        if (c.type != CmdType::Curve || !inBand(p0, p3, g, band)) {
            PathCommand k = c;
            liftPoint(k.to, g, band, sideRise, centerDelta);
            if (k.type == CmdType::Curve) {
                liftPoint(k.cp1, g, band, sideRise, centerDelta);
                liftPoint(k.cp2, g, band, sideRise, centerDelta);
            }
            out.push_back(k);
            continue;
        }
        const Point c1 = c.cp1, c2 = c.cp2;
        std::vector<Vec2> pts;
        pts.reserve(kLiftSamples);
        for (int i = 0; i < kLiftSamples; ++i) {
            Point q = cubicAt(p0, c1, c2, p3, static_cast<double>(i) / (kLiftSamples - 1));
            liftPoint(q, g, band, sideRise, centerDelta);
            pts.push_back({q.x, q.y});
        }
        const std::vector<CubicSeg> fit =
            fitCubicsAtBreaks(pts, {0, kLiftSamples - 1});
        if (fit.size() != 1) {   // never expected; keep the honest fallback
            PathCommand k = c;
            liftPoint(k.to, g, band, sideRise, centerDelta);
            if (k.type == CmdType::Curve) {
                liftPoint(k.cp1, g, band, sideRise, centerDelta);
                liftPoint(k.cp2, g, band, sideRise, centerDelta);
            }
            out.push_back(k);
            continue;
        }
        const CubicSeg& s = fit[0];
        out.push_back(PathCommand::curve({s.p3.x, s.p3.y}, {s.c1.x, s.c1.y},
                                         {s.c2.x, s.c2.y}));
    }
    p.commands = out;

    // ⭐ WHAT IS DRAWN ON THE PIECE MOVES WITH THE PIECE. The lift is a
    // point-wise deformation of the hem band, so every marking that reaches
    // into that band has to ride it — otherwise a line drawn to the OLD hem
    // hangs off the reshaped panel. Measured (compose_check, 2026-09-03): with
    // the button front now running to the hem, `placket.standard +
    // hemShape.highLow` left the fold line at (-0.0, 650.0) and the asymmetric
    // one at (-55.0, 650.0), both outside a piece whose front hem had just been
    // raised — "marking point falls outside the piece", twice. PlacketBlock
    // draws at garment.cpp:1067 and HemBlock reshapes at :1274, so the markings
    // were drawn against a hem that no longer existed.
    //
    // Same `liftPoint`, same band, same rises as the outline above: a marking
    // above the band is untouched (dart legs at the waist do not move), and one
    // that ran to the old hem now stops at the new one.
    for (auto& m : p.markings) {
        if (m.type == CmdType::Close) continue;
        liftPoint(m.to, g, band, sideRise, centerDelta);
        if (m.type == CmdType::Curve) {
            liftPoint(m.cp1, g, band, sideRise, centerDelta);
            liftPoint(m.cp2, g, band, sideRise, centerDelta);
        }
    }
}

} // namespace

bool apply(DraftedPattern& pattern, HemShape shape) {
    if (shape == HemShape::Straight) return true;

    // Collect the fitted lower body pieces.
    std::vector<PatternPiece*> hosts;
    for (auto& p : pattern.pieces)
        if (isBodyLowerPiece(p) && tapers(p)) hosts.push_back(&p);

    if (hosts.empty()) {
        pattern.guideSteps.push_back(
            "Hem shape: skipped — this draft has no fitted straight/A-line lower "
            "edge to curve (a gathered, pleated or circle skirt has no shaped side "
            "hem to lift). Shape the hem by hand if you want a shirt-tail or "
            "high-low look.");
        return false;
    }

    // A very short host (a cropped top) has no real hem to curve — reshaping it
    // would eat the side seam and let the front/back seam-length curves diverge.
    // Refuse the whole reshape honestly rather than draw an unbalanced hem.
    double minHostH = 1e18;
    for (const auto* p : hosts) minHostH = std::min(minHostH, boundingBox(p->commands).height);
    if (minHostH < minHostLength) {
        pattern.guideSteps.push_back(
            "Hem shape: skipped — this garment is too short (a cropped length) to "
            "carry a shirt-tail or high-low curve without unbalancing the side "
            "seams. Lengthen it, or shape a shallow curve by hand.");
        return false;
    }

    // Adaptive scale: cap every rise to a safe fraction of the SHORTEST host's
    // below-waist length, scaling ALL rises by the same factor so front and back
    // still lift together (side seam stays balanced).
    const double maxRise = std::max(shirttailSideRise, highLowFrontRise);
    // Keep the deepest rise under ~45% of the shortest host so the curve stays a
    // hem detail, not a re-cut. 1.0 = no scaling for a normal-length garment.
    const double scale = std::min(1.0, (minHostH * 0.45) / std::max(maxRise, 1.0));
    const double shRise = shirttailSideRise * scale;
    const double hlFront = highLowFrontRise * scale;
    const double hlBack = highLowBackDrop * scale;
    // The corset/basque point drop, adaptive-scaled by the same shortest-host cap so
    // the point stays a hem detail, never eats the side seam.
    const double pvDrop = pointedVCenterDrop * scale;

    // The hem band: how far up from the lowest point we reshape. Deep enough to
    // clear the deepest rise so the lifted curve stays smooth into the side seam,
    // but never deeper than the shortest host (so it stays a hem, not the waist).
    const double band = std::min(std::max({shRise, hlFront, pvDrop}) + 60, minHostH * 0.9);

    // A princess skirt splits each half into a "Center …" panel (spanning the
    // center fold to the gore seam) and a "Side …" panel (the gore seam to the
    // side seam). Each panel's OWN min-x is its center-side edge (the fold for a
    // center panel / plain quarter; the gore seam for a side panel), and its max-x
    // is its outer edge. Lifting each panel from its own min-x (t=0) to max-x (t=1)
    // keeps the shared GORE SEAM matched: the center panel's gore edge (its max-x)
    // and the side panel's gore edge (its min-x) both carry the SAME centerDelta.
    auto isCenterPanel = [](const PatternPiece& p) {
        return p.name.find("Center ") != std::string::npos;
    };

    if (shape == HemShape::Shirttail) {
        // Center front + center back stay long; both sides lift by the SAME rise,
        // so a front and its matching back still meet at the side seam. A gore
        // Center panel spans fold→gore seam and stays entirely long (no lift); a
        // gore Side panel lifts from its gore edge (0) to its outer edge (full
        // rise) — so both edges of every gore seam stay unlifted and matched. A
        // plain (non-gore) quarter lifts from the fold (0) to the side (full rise).
        for (auto* p : hosts) {
            if (isCenterPanel(*p)) continue;                 // center panel: all long
            reshape(*p, band, shRise, /*centerDelta=*/0.0);
        }
        pattern.guideSteps.push_back(
            "Shirt-tail hem: the lower edge curves up at the side seams and stays "
            "long at the center front and center back. Sew the side seams as usual "
            "(both sides lift by the same amount, so they still match), then finish "
            "the whole curved hem with a narrow rolled or bias-faced hem so it turns "
            "cleanly around the curve.");
    } else if (shape == HemShape::HighLow) {
        // Front raised (short), back dropped (long). The front and back SIDE hems
        // meet at a shared height (sideCommon) so the side seam stays balanced. On
        // a gore skirt the Center panel shifts UNIFORMLY by its centerDelta (front
        // up / back down) and the Side panel blends from that same centerDelta at
        // its gore edge to sideCommon at its outer edge — so every gore seam's two
        // edges carry the SAME centerDelta and still match.
        const double sideCommon = (hlFront - hlBack) / 2.0; // shared side hem level
        for (auto* p : hosts) {
            const double centerDelta = isFront(*p) ? hlFront : -hlBack;
            const double sideRise = isCenterPanel(*p) ? centerDelta : sideCommon;
            reshape(*p, band, sideRise, centerDelta);
        }
        pattern.guideSteps.push_back(
            "High-low hem: the front hem is short and the back hem is long, blending "
            "at the side seams (front and back meet at the same height there, so the "
            "side seams still match). Sew the side seams, then finish the curved hem "
            "with a narrow rolled or bias-faced hem. Let the garment hang for 24 "
            "hours before finishing the back hem — the longer back drops on the bias.");
    } else if (shape == HemShape::PointedV) {
        // Corset / basque point: the CENTER hem (center front + center back) DROPS to
        // a point while the SIDES stay level. This is the inverse of the shirttail —
        // instead of lifting the sides, we drop the center by pvDrop (a NEGATIVE
        // centerDelta lowers the point; sideRise 0 keeps the side hem level). On a
        // gore skirt only the "Center …" panel carries the drop: its fold edge (min-x,
        // t=0) drops the full pvDrop to the point, its gore edge (max-x, t=1) stays
        // level (0). The "Side …" panel is untouched (both its gore edge and its side
        // edge stay level at 0) — so every gore seam's two edges carry the SAME 0
        // delta and still match. A plain (dart) quarter drops from the fold (full) to
        // the side (0). The two mirrored halves meet cleanly at the CF/CB fold (both
        // fold edges drop by exactly pvDrop → the point trues on the fold line).
        for (auto* p : hosts) {
            if (!isCenterPanel(*p) && !tapers(*p)) continue; // safety (already gated)
            // On a gore skirt only the center panel drops; a plain quarter (no gore)
            // has no "Side …" sibling, so it must drop too. Detect a gore split by a
            // matching "Side …" name — but simpler: a center panel OR a plain quarter
            // (a piece that is NOT a "Side …" panel) drops. A "Side …" panel stays.
            if (p->name.find("Side ") != std::string::npos) continue; // side panel: level
            reshape(*p, band, /*sideRise=*/0.0, /*centerDelta=*/-pvDrop);
        }
        pattern.guideSteps.push_back(
            "Pointed / corset (basque) hem: the lower edge dips to a POINT at the "
            "center front and center back while the sides stay level — the classic "
            "corset-bottom V. The two halves of the point meet on the center fold "
            "line, so the point is symmetric. Stitch the side seams as usual, then "
            "finish the pointed hem with a narrow rolled or bias-faced hem, clipping "
            "carefully at the center point so it turns crisply. Understitch or add a "
            "tiny anchor stitch at the point so the V holds its shape.");
    } else { // BoxPleatHem
        // A kick pleat: an inverted box pleat released at the center of the hem for
        // kick/flare. REUSE the box-pleat underlay primitive (boxpleat.cpp
        // growCfPleat): the center panel is grown WIDER at its CF/CB fold by the
        // pleat underlay (2 × depth), folded behind, so the finished (pressed) width
        // trues back to the original. v1 releases the pleat over the LOWER hem region
        // of the CF-fold center panel — it reads as a hem kick pleat. Only a panel
        // cut ON THE FOLD (a single fold to press the pleat to) hosts it.
        const double kickHeight = std::min(std::max(300.0, band), minHostH * 0.6);
        bool any = false;
        for (auto* p : hosts) {
            if (p->name.find("Side ") != std::string::npos) continue; // no CF fold
            if (p->cutInstruction.find("on fold") == std::string::npos) continue;
            const double pieceMaxY = boundingBox(p->commands).y + boundingBox(p->commands).height;
            const double yLo = pieceMaxY - kickHeight;
            if (BoxPleatBlock::growCfPleat(*p, yLo, pieceMaxY, /*protectNeckPoint=*/false))
                any = true;
        }
        if (!any) {
            pattern.guideSteps.push_back(
                "Box-pleat hem: skipped — this draft has no center-fold panel to "
                "release a center kick pleat into (a cut-in-two front, or a "
                "gathered/pleated panel, has no single CF/CB fold to press an inverted "
                "box pleat to). Add a kick pleat by hand if you want one.");
            return false;
        }
        pattern.guideSteps.push_back(
            "Box-pleat (kick) hem: the center panel is cut WIDER at the center fold "
            "over the lower hem region by the marked underlay. Fold the underlay back "
            "behind the fabric on the two marked fold lines so the extra width tucks "
            "UNDER and the two folds meet on the center line — an inverted box pleat "
            "released at the hem for kick and flare. Press the pleat, baste across the "
            "top of the pleat to hold it closed, then finish the hem as usual; the "
            "finished (folded) width equals the un-pleated width, so the side seams "
            "still true. The pleat hangs closed and springs open as you walk.");
    }
    return true;
}

} // namespace HemBlock
} // namespace stitchu
