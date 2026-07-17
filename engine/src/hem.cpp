#include "hem.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

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

// Reshape one piece's hem. Returns the actual side rise applied (so front/back can
// be checked equal for shirttail truing).
void reshape(PatternPiece& p, double band, double sideRise, double centerDelta) {
    const HemGeom g = hemGeom(p, band);
    for (auto& c : p.commands) {
        if (c.type == CmdType::Close) continue;
        liftPoint(c.to, g, band, sideRise, centerDelta);
        if (c.type == CmdType::Curve) {
            liftPoint(c.cp1, g, band, sideRise, centerDelta);
            liftPoint(c.cp2, g, band, sideRise, centerDelta);
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

    // The hem band: how far up from the lowest point we reshape. Deep enough to
    // clear the deepest rise so the lifted curve stays smooth into the side seam,
    // but never deeper than the shortest host (so it stays a hem, not the waist).
    const double band = std::min(std::max(shRise, hlFront) + 60, minHostH * 0.9);

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
    } else { // HighLow
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
    }
    return true;
}

} // namespace HemBlock
} // namespace stitchu
