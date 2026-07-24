#include "pocket.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"

namespace stitchu {
namespace PocketBlock {

namespace {

constexpr double PI = 3.14159265358979323846;

PatternPiece* findPiece(DraftedPattern& pattern, std::initializer_list<const char*> names) {
    for (const char* name : names)
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    return nullptr;
}

// The garment reads "Skirt ..." names on a dress, plain names on a standalone
// skirt, "Bodice/Top ..." on the top half. Pick the front-most panel that best
// carries a hip/chest patch: prefer a skirt front (patch sits on the hip), then
// a bodice/top front. Returns nullptr if none.
PatternPiece* frontPanel(DraftedPattern& pattern) {
    return findPiece(pattern, {"Skirt Center Front", "Skirt Front",
                               "Center Front", "Front",
                               "Bodice Center Front", "Bodice Front",
                               "Top Center Front", "Top Front"});
}

// A SIDE panel whose side seam (the max-x edge) can host an in-seam pocket. On a
// princess draft the "Side Front" carries the side seam; on a dart draft the
// single front piece does. Prefer the skirt/lower half (a side-seam pocket sits
// at the hip).
PatternPiece* sidePanel(DraftedPattern& pattern) {
    return findPiece(pattern, {"Skirt Side Front", "Side Front",
                               "Bodice Side Front", "Skirt Front",
                               "Front", "Bodice Front", "Top Front"});
}

// Stamp an L-bracket placement mark (two short tick runs meeting at a corner) at
// the pocket's top-left seat on a body panel, so the sewer knows where to sit the
// patch. `at` is the top-left corner of where the pocket mouth sits; `w`/`h` the
// pocket size.
void patchPlacementMark(PatternPiece* piece, const Point& at, double w, double h) {
    if (!piece) return;
    // Top edge tick run (the mouth line) + left edge tick run (down the side),
    // dashed as two short strokes each so it reads as a placement guide, not a
    // seam. Corner marks at the two lower corners too.
    auto tick = [&](Point a, Point b) {
        piece->markings.push_back(PathCommand::move(a));
        piece->markings.push_back(PathCommand::line(b));
    };
    tick({at.x, at.y}, {at.x + w, at.y});                 // mouth line
    tick({at.x, at.y}, {at.x, at.y + h});                 // left seat line
    tick({at.x + w, at.y}, {at.x + w, at.y + h * 0.35});  // right seat hint (short)
    tick({at.x, at.y + h}, {at.x + w, at.y + h});         // bottom seat line
}

// A rounded / square / pointed lower corner from (x0,topY) rectangle of size w×h.
// The top edge carries a folded self-hem: the piece is cut taller by hemDepth and
// a fold line is marked. Outline runs: down the left side, across the lower edge
// (with the chosen corner), up the right side, across the top (cut edge).
PatternPiece patchPiece(double w, double h, PatchCorner corner, double frontWidthMM) {
    PatternPiece piece;
    piece.name = "Patch Pocket (yama cep)";

    const char* cornerWord =
        corner == PatchCorner::Rounded ? "rounded" :
        corner == PatchCorner::Pointed ? "pointed" : "square";
    piece.cutInstruction =
        "cut 2 rectangle(s) " +
        std::to_string(static_cast<long>(std::lround(w))) + " x " +
        std::to_string(static_cast<long>(std::lround(h + patchHemDepth))) +
        " mm (" + std::string(cornerWord) +
        " lower corners, fold the top " +
        std::to_string(static_cast<long>(std::lround(patchHemDepth))) +
        " mm to the inside for the mouth hem; sized to " +
        std::to_string(static_cast<long>(std::lround(frontWidthMM))) +
        " mm front panel)";

    std::vector<PathCommand>& c = piece.commands;
    const double topY = 0;                 // cut top (folds down to the mouth)
    const double mouthY = patchHemDepth;   // finished mouth after the fold
    const double botY = patchHemDepth + h; // lower edge
    const double r = std::min(patchCornerR, std::min(w, h) * 0.4);

    // Start top-left, down the left side to the lower-left corner.
    c.push_back(PathCommand::move({0, topY}));
    c.push_back(PathCommand::line({0, botY - (corner == PatchCorner::Rounded ? r : 0)}));
    if (corner == PatchCorner::Rounded) {
        // quarter-circle lower-left, then across, then lower-right quarter-circle.
        c.push_back(PathCommand::curve({r, botY}, {0, botY - r * 0.45}, {r * 0.45, botY}));
        c.push_back(PathCommand::line({w - r, botY}));
        c.push_back(PathCommand::curve({w, botY - r}, {w - r * 0.45, botY}, {w, botY - r * 0.45}));
    } else if (corner == PatchCorner::Pointed) {
        // lower edge dips to a centre point (a Western/utility patch).
        c.push_back(PathCommand::line({0, botY - h * 0.18}));
        c.push_back(PathCommand::line({w / 2, botY}));
        c.push_back(PathCommand::line({w, botY - h * 0.18}));
    } else {
        c.push_back(PathCommand::line({0, botY}));
        c.push_back(PathCommand::line({w, botY}));
    }
    c.push_back(PathCommand::line({w, topY}));  // up the right side to the cut top
    c.push_back(PathCommand::close());

    // Fold line for the mouth hem (across the piece at the fold).
    piece.markings.push_back(PathCommand::move({0, mouthY}));
    piece.markings.push_back(PathCommand::line({w, mouthY}));

    piece.hasGrainline = true;
    piece.grainline = Grainline{{w / 2, mouthY + 10}, {w / 2, botY - 10}};
    piece.seamAllowance = SA;
    return piece;
}

// One in-seam pocket bag: a mirrored teardrop that seams to its pair along the
// curved edge and sews into the side seam along its straight edge. The straight
// (side-seam) edge runs down the left (x = 0); the bag bulges right toward CF.
// `mouth` = the hand-opening length on the seam, `depth` = bag length below the
// opening bottom, measured from the host seam.
PatternPiece pocketBag(double mouth, double reach, double depth) {
    PatternPiece piece;
    piece.name = "Pocket Bag (yan dikiş cebi)";
    piece.cutInstruction =
        "cut 2 pairs (4 total: 2 mirrored bags per side); the straight edge "
        "sews into the side seam over the " +
        std::to_string(static_cast<long>(std::lround(mouth))) +
        " mm hand opening, the curved edge seams to its mate";

    const double top = 0;                  // top of the opening (matched to seam)
    const double openBot = mouth;          // bottom of the hand opening
    const double bagBot = mouth + depth;   // deepest point of the bag

    std::vector<PathCommand>& c = piece.commands;
    // Straight side-seam edge: down x=0 from the opening top past the opening
    // bottom, then the bag curves out and around back up.
    c.push_back(PathCommand::move({0, top}));
    c.push_back(PathCommand::line({0, bagBot - reach * 0.35}));
    // Round the bottom of the bag out to its reach and back up toward the mouth.
    c.push_back(PathCommand::curve({reach, bagBot},
                                   {0, bagBot}, {reach * 0.55, bagBot}));
    c.push_back(PathCommand::curve({reach, openBot},
                                   {reach, bagBot - depth * 0.4}, {reach, openBot + depth * 0.5}));
    // Back to the seam at the opening bottom (the mouth), closing the bag.
    c.push_back(PathCommand::curve({0, top},
                                   {reach * 0.5, openBot}, {reach * 0.35, top}));
    c.push_back(PathCommand::close());

    piece.hasGrainline = true;
    piece.grainline = Grainline{{reach * 0.35, top + 20}, {reach * 0.35, bagBot - 20}};
    piece.seamAllowance = SA;
    return piece;
}

// --- Slash (angled front-hip) pocket helpers --------------------------------

// Flatten a closed outline to a dense polyline (cubics -> 24 segments) in the
// piece's own local coordinates. Used to read the waist edge and side seam of
// the host front panel so the slash mouth is trued to the real outline, never a
// bare scalar.
std::vector<Point> flattenOutline(const std::vector<PathCommand>& cmds) {
    std::vector<Point> pts;
    Point cur{0, 0}, start{0, 0};
    bool have = false;
    for (const auto& c : cmds) {
        if (c.type == CmdType::Move) {
            cur = c.to; start = c.to; have = true; pts.push_back(cur);
        } else if (c.type == CmdType::Line) {
            pts.push_back(c.to); cur = c.to;
        } else if (c.type == CmdType::Curve) {
            auto seg = flattenCubic(cur, c.to, c.cp1, c.cp2, 24);
            for (size_t i = 1; i < seg.size(); ++i) pts.push_back(seg[i]);
            cur = c.to;
        } else if (c.type == CmdType::Close) {
            if (have) pts.push_back(start);
        }
    }
    return pts;
}

// The x of the side seam (the max-x / right edge of the front panel) at a given
// y, read from the flattened outline by linear interpolation between the two
// polyline points that straddle `y` on the right side. Falls back to the bbox
// right edge when no straddling pair is found (degenerate).
double sideSeamXAtY(const std::vector<Point>& poly, double y, double fallbackX) {
    double best = -1e30;
    for (size_t i = 0; i + 1 < poly.size(); ++i) {
        const Point& a = poly[i];
        const Point& b = poly[i + 1];
        const double lo = std::min(a.y, b.y), hi = std::max(a.y, b.y);
        if (y < lo - 1e-9 || y > hi + 1e-9) continue;
        double x;
        if (std::fabs(b.y - a.y) < 1e-9) x = std::max(a.x, b.x);
        else x = a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y);
        best = std::max(best, x);
    }
    return best > -1e29 ? best : fallbackX;
}

// The pocket FACING: a curved piece that follows the slash mouth and finishes
// its raw edge on the front. Its long (mouth) edge is the SAME diagonal segment
// the front carries — length-matched by construction. `mouthLen` = the marked
// slash length on the front; `depth` = how deep the facing reaches behind it.
// Cut with the diagonal as one edge, a curved inner edge parallel to it.
PatternPiece slashFacing(double mouthLen, double depth) {
    PatternPiece piece;
    piece.name = "Pocket Facing (cep ağzı pervazı)";
    piece.cutInstruction =
        "cut 2 (mirrored, 1 per side); the straight (diagonal) edge is the pocket "
        "mouth — it matches the " +
        std::to_string(static_cast<long>(std::lround(mouthLen))) +
        " mm slash marked on the front. Stitch this edge to the front slash edge, "
        "right sides together, then turn to the inside and understitch for a clean "
        "mouth";

    // Draft the facing in a local frame: the mouth edge runs straight from
    // (0,0) to (0,mouthLen) so it is EXACTLY mouthLen long (== the front slash
    // edge), and the inner edge curves back parallel at `depth`.
    std::vector<PathCommand>& c = piece.commands;
    c.push_back(PathCommand::move({0, 0}));
    c.push_back(PathCommand::line({0, mouthLen}));                 // the mouth edge (== slash)
    c.push_back(PathCommand::curve({depth, mouthLen * 0.5},        // curved inner edge
                                   {depth * 0.6, mouthLen},
                                   {depth, mouthLen * 0.75}));
    c.push_back(PathCommand::curve({0, 0},
                                   {depth, mouthLen * 0.25},
                                   {depth * 0.6, 0}));
    c.push_back(PathCommand::close());

    piece.hasGrainline = true;
    piece.grainline = Grainline{{depth * 0.4, mouthLen * 0.25}, {depth * 0.4, mouthLen * 0.75}};
    piece.seamAllowance = SA;
    return piece;
}

} // namespace

bool apply(DraftedPattern& pattern, PocketStyle style, double frontWidthMM) {
    if (style == PocketStyle::None) return true;

    if (style == PocketStyle::Patch) {
        PatternPiece* front = frontPanel(pattern);
        if (!front || front->commands.empty()) {
            pattern.guideSteps.push_back(
                "Patch pocket: skipped — this draft has no front panel to sit a "
                "patch pocket on. Add one by hand if you want it.");
            return false;
        }
        // Size the patch to the MEASURED front-panel width so it grows with the
        // body (trued to frontWidthMM, not a bare scalar), clamped to a sensible
        // patch window.
        const double w = std::round(std::clamp(frontWidthMM * patchWidthFrac, patchMinW, patchMaxW));
        const double h = std::round(w * patchAspect);
        // A hip patch reads rounded by default (the most common).
        const PatchCorner corner = PatchCorner::Rounded;

        // Seat the placement mark on the front panel: centred left-right within the
        // panel's own outline, in the upper-hip band. Read the panel bbox from its
        // own commands (each piece is drafted in local coordinates).
        const Rect r = boundingBox(front->commands);
        const double seatX = std::clamp(r.x + r.width * 0.5 - w / 2, r.x + 5, r.x + r.width - w - 5);
        const double seatY = std::clamp(r.y + r.height * 0.30, r.y + 5, r.y + r.height - h - 5);
        // Stamp the mark BEFORE adding the piece (push_back can reallocate and
        // invalidate `front`).
        patchPlacementMark(front, {seatX, seatY}, w, h);

        pattern.pieces.push_back(patchPiece(w, h, corner, frontWidthMM));

        pattern.guideSteps.push_back(
            "Patch pocket (yama cep): cut the patch piece(s) as labelled. Fold the "
            "top hem allowance to the inside and stitch it down for a clean mouth. "
            "Turn the side and lower seam allowances under (clip the curves on a "
            "rounded corner so they lie flat), press, then pin the pocket to the "
            "front at the placement mark and edge-stitch around the sides and "
            "bottom — leave the top open. Backstitch the top corners to take the "
            "strain of a hand going in.");
        pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.1, 1);
        return true;
    }

    if (style == PocketStyle::Slash) {
        // The angled front-hip pocket lives on the LOWER body (the hip), so the
        // host must be a SKIRT / lower front panel that carries a real waist (top)
        // AND a side seam (max-x) on the SAME piece — the whole front on a dart
        // draft, the Side Front on a princess draft. A bodice-only top has no hip
        // (its top edge is the neckline, not a waist), so it is an honest no-op;
        // a gathered / no-waist rectangle front is refused below.
        PatternPiece* front = findPiece(pattern, {"Skirt Side Front", "Skirt Front",
                                                  "Side Front", "Front"});
        if (!front || front->commands.empty()) {
            pattern.guideSteps.push_back(
                "Slash pocket: skipped — this draft has no skirt/hip front panel "
                "with a waist and a side seam to cut an angled front pocket into (a "
                "bodice-only top has no hip). Add one by hand if you want it.");
            return false;
        }
        const std::vector<Point> poly = flattenOutline(front->commands);
        const Rect r = boundingBox(front->commands);
        if (r.height < slashMinSideForDrop + slashDrop || poly.size() < 4) {
            pattern.guideSteps.push_back(
                "Slash pocket: skipped — this panel is too short to drop an angled "
                "front pocket from the waist to the side seam (a cropped front has "
                "no room). Add one by hand.");
            return false;
        }

        // Find the waist line = the panel's TOP edge. The waist runs from the CF
        // (inner) top corner to the side-seam top corner. Read both corners in a
        // TIGHT band just below the minimum y (the true waist edge — not a
        // fraction of the whole skirt length, which on a long skirt would reach
        // well below the waist and drag the mouth down). The inner corner is the
        // min-x point on the waist; the side corner is the max-x point on the
        // waist (where the waist turns into the side seam).
        double topY = 1e30;
        for (const auto& p : poly) topY = std::min(topY, p.y);
        const double waistBandBot = topY + 45.0; // the waist edge is within ~45 mm of the top
        double innerX = 1e30, sideX = -1e30, sideCornerY = 0, innerCornerY = 0;
        for (const auto& p : poly) {
            if (p.y > waistBandBot) continue;
            if (p.x < innerX) { innerX = p.x; innerCornerY = p.y; }
            if (p.x > sideX) { sideX = p.x; sideCornerY = p.y; }
        }
        const double waistWidth = sideX - innerX;
        if (waistWidth < slashMinWaist) {
            pattern.guideSteps.push_back(
                "Slash pocket: skipped — the front waist is too narrow to cut a "
                "meaningful angled pocket. Add one by hand.");
            return false;
        }
        // A gathered / pleated / rectangle front has NO fitted waist: its side
        // seam is straight (the waist-side corner sits at the panel's full width,
        // the side seam does not narrow going up to the waist). A slash mouth cut
        // into a to-be-gathered rectangle would not sit on a real hip, so refuse
        // it honestly (mirrors the SideSeam / peplum honest-skip discipline).
        if (sideX > (r.x + r.width) - 2.0) {
            pattern.guideSteps.push_back(
                "Slash pocket: skipped — this is a gathered / no-waist rectangle "
                "front with no fitted waist to angle the pocket from. Add one by "
                "hand if you want it.");
            return false;
        }

        // Mouth TOP: on the waist, inset from the side corner toward CF by a third
        // of the waist width (the classic jeans slant origin).
        const double mouthTopX = sideX - slashInsetFrac * waistWidth;
        // Interpolate the waist y at that x between the two waist corners so the
        // point rides the actual (slightly dipped) waist line, not a flat scalar.
        const double t = (sideX - innerX) > 1e-9 ? (sideX - mouthTopX) / (sideX - innerX) : 0.0;
        const double mouthTopY = sideCornerY + (innerCornerY - sideCornerY) * t;
        const Point mouthTop{mouthTopX, mouthTopY};

        // Mouth BOTTOM: on the side seam, slashDrop below the waist-side corner,
        // its x read from the real side-seam edge at that y (handles a flared /
        // A-line side seam — the mouth ends on the true seam, not the bbox edge).
        const double mouthBotY = sideCornerY + slashDrop;
        const double mouthBotX = sideSeamXAtY(poly, mouthBotY, sideX);
        const Point mouthBot{mouthBotX, mouthBotY};

        // Stamp the DIAGONAL mouth line on the front as a marking (a cut/finish
        // line, not a seam in the outline — the outline stays byte-identical so
        // every other draft is unaffected). A little inward tick at each end reads
        // it as the pocket opening.
        front->markings.push_back(PathCommand::move(mouthTop));
        front->markings.push_back(PathCommand::line(mouthBot));
        // Direction of the mouth, for the end ticks (perpendicular, inward).
        const double dx = mouthBot.x - mouthTop.x, dy = mouthBot.y - mouthTop.y;
        const double mouthLen = std::hypot(dx, dy);
        const double nx = mouthLen > 1e-9 ? -dy / mouthLen : -1.0;
        const double ny = mouthLen > 1e-9 ?  dx / mouthLen :  0.0;
        auto endTick = [&](const Point& p) {
            front->markings.push_back(PathCommand::move(p));
            front->markings.push_back(PathCommand::line({p.x - nx * 14, p.y - ny * 14}));
        };
        endTick(mouthTop);
        endTick(mouthBot);

        // The facing finishes the mouth: its straight edge is the SAME length as
        // the marked slash (trued by construction — both are `mouthLen`).
        pattern.pieces.push_back(slashFacing(mouthLen, slashFacingDepth));

        // The bag behind the mouth reuses the in-seam bag geometry (a mirrored
        // pouch), sized to reach across the front hip. Its opening spans the slash
        // mouth; its depth hangs below without passing the panel hem.
        const double bagDepth = std::min(bagBelowMouth,
                                         (r.y + r.height) - mouthBotY - 20);
        PatternPiece bag = pocketBag(mouthLen, bagWidth, std::max(80.0, bagDepth));
        bag.name = "Pocket Bag (eğik cep torbası)";
        bag.cutInstruction =
            "cut 2 (1 mirrored pair per side); the top edge attaches at the front "
            "waist and the straight side edge sews into the side seam over the " +
            std::to_string(static_cast<long>(std::lround(mouthLen))) +
            " mm slash, the curved edge holds the hand";
        pattern.pieces.push_back(std::move(bag));

        pattern.guideSteps.push_back(
            "Slash pocket (eğik cep): cut the front with the diagonal mouth marked, "
            "then cut 2 pocket facings and 2 pocket bags. Stitch a facing to the "
            "front along the diagonal slash edge (right sides together), turn it to "
            "the inside and understitch so the mouth rolls clean. Lay a pocket bag "
            "behind, catch its top edge into the waist seam and its straight side "
            "edge into the side seam, then stitch the bag's curved edge closed to "
            "make the pouch. The mouth stays open between the waist and the side "
            "seam for the hand.");
        pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.15, 1);
        return true;
    }

    // SideSeam: measure the host side seam and set an in-seam bag on it.
    PatternPiece* side = sidePanel(pattern);
    if (!side || side->commands.empty()) {
        pattern.guideSteps.push_back(
            "Side-seam pocket: skipped — this draft has no side-seam panel to hide "
            "an in-seam pocket in. Add one by hand if you want it.");
        return false;
    }
    // The side seam is the max-x edge of the side panel; its usable length is the
    // panel height (waist→hem on this piece). Measure from the panel's own
    // outline so the mark is trued to the real seam, not a scalar.
    const Rect r = boundingBox(side->commands);
    const double sideLen = r.height;
    if (sideLen < minSeamForBag) {
        pattern.guideSteps.push_back(
            "Side-seam pocket: skipped — the side seam is too short to hide an "
            "in-seam pocket (a cropped top can't carry one). Add one by hand.");
        return false;
    }
    const double seamX = r.x + r.width;      // the side-seam edge
    const double mouthTop = r.y + std::min(mouthBelowWaist, sideLen * 0.25);
    const double mouth = std::min(mouthOpening, sideLen - (mouthTop - r.y) - 40);
    const double mouthBot = mouthTop + mouth;

    // Mouth-opening mark: two ticks that bracket the hand opening on the side seam
    // (the seam is sewn above and below these, left open between them), plus a
    // short inward tick at each so they read as the opening ends.
    auto bracket = [&](double y) {
        side->markings.push_back(PathCommand::move({seamX, y}));
        side->markings.push_back(PathCommand::line({seamX - 18, y}));
    };
    bracket(mouthTop);
    bracket(mouthBot);
    // A dashed run down the seam between the ticks = the open section.
    side->markings.push_back(PathCommand::move({seamX - 3, mouthTop}));
    side->markings.push_back(PathCommand::line({seamX - 3, mouthBot}));

    // The bag depth is measured from the host seam: it hangs bagBelowMouth below
    // the opening but never past the panel hem.
    const double depth = std::min(bagBelowMouth, (r.y + sideLen) - mouthBot - 20);
    pattern.pieces.push_back(pocketBag(mouth, bagWidth, std::max(80.0, depth)));

    pattern.guideSteps.push_back(
        "Side-seam pocket (yan dikiş cebi): cut 4 pocket bags (2 mirrored per "
        "side). Before you sew the side seams, stitch one bag to the front side "
        "seam and one to the back side seam between the two opening marks, right "
        "sides together. Then sew the side seam above and below the opening marks, "
        "leaving the marked hand opening free, and stitch the two bags together "
        "around their curved edge to close the pouch. Press the bag toward the "
        "front; understitch the front edge so the lining doesn't roll out.");
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.2, 1);
    return true;
}

} // namespace PocketBlock
} // namespace stitchu
