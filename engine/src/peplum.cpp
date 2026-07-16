#include "peplum.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace PeplumBlock {

namespace {

constexpr double PI = 3.14159265358979323846;

// A circular arc from angle a0 to a1 (radians) at radius r, centred at c, drawn
// as line segments (24 per piece is plenty and keeps the outline a simple
// polyline like the ruffle/tie strips — the cut note carries the true metric).
void appendArc(std::vector<PathCommand>& out, Point c, double r,
               double a0, double a1, int steps, bool asMove) {
    for (int i = 0; i <= steps; ++i) {
        const double t = a0 + (a1 - a0) * (static_cast<double>(i) / steps);
        const Point p{c.x + r * std::cos(t), c.y + r * std::sin(t)};
        if (i == 0 && asMove) out.push_back(PathCommand::move(p));
        else out.push_back(PathCommand::line(p));
    }
}

// One flat circular peplum panel: an annular sector swept through `sweep`
// radians, inner radius r0 (so the inner arc = r0 · sweep = the panel's share of
// the finished waist), outer radius r0 + depth. The centre sits above the panel
// so y grows down onto the hem, matching engine convention. `share` labels how
// much of the finished waist this one piece carries (cut count implied in note).
PatternPiece peplumPanel(const std::string& name, double r0, double sweep,
                         double waistShare, int cutCount, bool pointed) {
    const double rOuter = r0 + depth;
    const Point centre{0, -r0};  // apex above the sector; inner arc at y≈0

    // Sweep centred on the downward axis (angle PI/2 in engine coords) so the
    // panel is symmetric left-right.
    const double a0 = PI / 2 - sweep / 2;
    const double a1 = PI / 2 + sweep / 2;
    // A pointed hem drops the mid-hem to a corner: the outer arc is drawn to a
    // point at the centre of the sweep instead of a smooth arc. Cut identically
    // (same swept angle, same waist), only the hem line changes.

    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction =
        "cut " + std::to_string(cutCount) + " (inner waist arc " +
        std::to_string(static_cast<long>(std::lround(waistShare))) +
        " mm = your finished waist, flares to a " +
        std::to_string(static_cast<long>(std::lround(depth))) +
        " mm deep hem" + (pointed ? ", worn to points at the hem" : "") + ")";

    // Outline: inner waist arc (left→right), down the right side seam to the
    // outer hem, outer hem arc (right→left), up the left side seam, close.
    std::vector<PathCommand>& c = piece.commands;
    appendArc(c, centre, r0, a0, a1, 64, /*asMove=*/true);           // inner waist arc
    // right side seam: inner end → outer end (radial line)
    const Point outerR{centre.x + rOuter * std::cos(a1), centre.y + rOuter * std::sin(a1)};
    c.push_back(PathCommand::line(outerR));
    if (pointed) {
        // hem dips to a point on the downward axis at the outer radius.
        const Point tip{centre.x, centre.y + rOuter};
        c.push_back(PathCommand::line(tip));
        const Point outerL{centre.x + rOuter * std::cos(a0), centre.y + rOuter * std::sin(a0)};
        c.push_back(PathCommand::line(outerL));
    } else {
        appendArc(c, centre, rOuter, a1, a0, 64, /*asMove=*/false);  // outer hem arc back
    }
    c.push_back(PathCommand::close());

    // Grainline runs down the centre (the straight-of-grain sits on the centre
    // radius for an even circular flare).
    piece.hasGrainline = true;
    piece.grainline = Grainline{{centre.x, centre.y + r0 + 10}, {centre.x, centre.y + rOuter - 10}};
    piece.seamAllowance = SA;
    return piece;
}

// Finds a body piece by any of the given names.
PatternPiece* findPiece(DraftedPattern& pattern, std::initializer_list<const char*> names) {
    for (const char* name : names)
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    return nullptr;
}

} // namespace

bool apply(DraftedPattern& pattern, PeplumStyle style, double waistMM) {
    if (style == PeplumStyle::None) return true;

    // A peplum hangs from a WAISTED bodice/top — it needs a front + back body to
    // attach to. (A dress already has a skirt below the waist; a peplum dress
    // reads as a top-plus-skirt, but for this set the peplum lives on tops.)
    PatternPiece* front = findPiece(pattern, {"Top Center Front", "Top Front",
                                              "Bodice Center Front", "Bodice Front"});
    PatternPiece* back = findPiece(pattern, {"Top Center Back", "Top Back",
                                             "Bodice Center Back", "Bodice Back"});
    if (!front || !back) {
        pattern.guideSteps.push_back(
            "Peplum: skipped — this draft has no waisted bodice/top edge to hang a "
            "flared peplum from. Add a circular flounce at the waist by hand if you "
            "want one.");
        return false;
    }

    // The finished waist is the wearer's measured waist (the drafted waist seam
    // is sewn back to this), passed in by the drafter exactly like the tie sash.
    // The peplum's inner arc is trued to it so it drifts by 0.00 mm.
    waistMM = std::clamp(waistMM, minWaist, maxWaist);

    // Circular-flare geometry (Aldrich/Armstrong): the peplum's inner arc equals
    // the finished waist. A full circle sweeps the whole waist through 2π; a half
    // circle spreads the same waist over π (softer flare). The pointed variant is
    // the full-circle cut worn to points.
    if (style == PeplumStyle::Half) {
        // Two on-fold pieces (front + back), each carrying half the waist over a
        // π sweep. Inner radius r0 = (waist/2) / π.
        const double share = waistMM / 2.0;      // per piece (front, back)
        const double r0 = share / PI;            // inner arc = share over π sweep
        pattern.pieces.push_back(
            peplumPanel("Peplum Front (yarım kloş, ön)", r0, PI, share, 1, false));
        pattern.pieces.push_back(
            peplumPanel("Peplum Back (yarım kloş, arka)", r0, PI, share, 1, false));
    } else {
        // Full circle (or pointed = full-circle cut). One piece cut twice, each
        // carrying half the waist over a π sweep so the two halves seam at the
        // sides into a full circle. Inner radius r0 = (waist/2) / π.
        const bool pointed = (style == PeplumStyle::Pointed);
        const double share = waistMM / 2.0;
        const double r0 = share / PI;
        pattern.pieces.push_back(peplumPanel(
            pointed ? "Peplum (sivri etek volanı)" : "Peplum (çember etek volanı)",
            r0, PI, share, 2, pointed));
    }

    pattern.guideSteps.push_back(
        std::string("Peplum (bele takılan volan): cut the peplum piece(s) as "
        "labelled — the curved inner edge is your finished waist, the outer edge "
        "flares out to ripple below the seam. Stay-stitch the inner (waist) curve, "
        "clip it to the seam line, then pin it to the garment waist right sides "
        "together, matching centre front, centre back and the side seams, and sew. "
        "Press the seam up into the bodice. ") +
        (style == PeplumStyle::Pointed
             ? "Let the pointed hem hang for 24 hours before hemming — the bias "
               "corners drop. Then hem narrow so the points stay crisp."
             : "Let it hang for 24 hours before hemming — the bias sections drop. "
               "Then trim the hem even and finish it with a narrow rolled hem."));

    // A circular peplum eats a fair bit of fabric (it is a doughnut of cloth).
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.3, 1);
    return true;
}

} // namespace PeplumBlock
} // namespace stitchu
