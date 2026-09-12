// Center inverted box pleat (orta ters kutu pili) opt-in check. Proves the pleat
// is REAL, wearable, and safe:
//  * with boxPleat OFF the piece set is byte-identical to before (regression guard —
//    the same guarantee the golden dump relies on);
//  * with boxPleat ON for a dress/top front, the CF-foldable front panel is cut
//    WIDER at the center front by exactly the pleat underlay (2 x depth), and the
//    FINISHED (folded-out) width trues back to the original un-pleated width (<0.5 mm);
//  * the piece stays cut ON FOLD (a box pleat presses to the CF fold, it does NOT
//    open the front like a placket) and carries fold-line + "fold to center" markings;
//  * it composes on the yoke "Front Body" of a swing top (yoke + box pleat), still valid;
//  * a non-matching host (a skirt) is a documented HONEST no-op (no silent skip);
//  * the whole draft stays valid (wearability + validator green).
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/boxpleat.hpp"
#include "../src/yoke.hpp"
#include "../src/collar.hpp"
#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static bool sameCommands(const std::vector<PathCommand>& a, const std::vector<PathCommand>& b) {
    if (a.size() != b.size()) return false;
    for (size_t i = 0; i < a.size(); ++i) {
        if (a[i].type != b[i].type) return false;
        if (std::fabs(a[i].to.x - b[i].to.x) > 1e-9 || std::fabs(a[i].to.y - b[i].to.y) > 1e-9) return false;
        if (std::fabs(a[i].cp1.x - b[i].cp1.x) > 1e-9 || std::fabs(a[i].cp1.y - b[i].cp1.y) > 1e-9) return false;
        if (std::fabs(a[i].cp2.x - b[i].cp2.x) > 1e-9 || std::fabs(a[i].cp2.y - b[i].cp2.y) > 1e-9) return false;
    }
    return true;
}

static const BodyMeasurementsSnapshot& m0() {
    static const BodyMeasurementsSnapshot m{88, 70, 94, 37, 40.5, 58, 35}; // EU38
    return m;
}

static const PatternPiece* findByName(const DraftedPattern& d, const char* needle) {
    for (const auto& p : d.pieces)
        if (p.name.find(needle) != std::string::npos) return &p;
    return nullptr;
}
static int countByName(const DraftedPattern& d, const char* needle) {
    int n = 0;
    for (const auto& p : d.pieces)
        if (p.name.find(needle) != std::string::npos) n++;
    return n;
}

// Overall drawn width (max x - min x) of a piece's outline.
static double outlineWidth(const PatternPiece* p) {
    if (!p) return -1;
    double mn = 1e30, mx = -1e30;
    for (const auto& c : p->commands) {
        if (c.type == CmdType::Close) continue;
        mn = std::min(mn, c.to.x); mx = std::max(mx, c.to.x);
    }
    return (mx < mn) ? -1 : mx - mn;
}
// The min x reached by the outline (the CF fold, ~0 before the pleat, negative after).
static double outlineMinX(const PatternPiece* p) {
    if (!p) return 1e30;
    double mn = 1e30;
    for (const auto& c : p->commands)
        if (c.type != CmdType::Close) mn = std::min(mn, c.to.x);
    return mn;
}

int main() {
    const double underlay = BoxPleatBlock::depthMM * 2.0; // 80 mm on the drawn half

    // ---- REGRESSION GUARD: box pleat OFF is byte-identical ----------------------
    {
        std::printf("boxPleat OFF (None) is byte-identical to no pleat:\n");
        GarmentSpec s; s.garment = GarmentType::Dress; s.shaping = Shaping::Dart;
        s.neckline = Neckline::Crew; s.sleeveStyle = SleeveStyle::Straight;
        s.sleeveLength = SleeveLength::Short; s.skirtStyle = SkirtStyle::ALine;
        GarmentSpec off = s; off.boxPleat = static_cast<int>(BoxPleat::None);
        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dN = GarmentDrafter::draft(off, m0());
        bool identical = d0.pieces.size() == dN.pieces.size();
        for (size_t i = 0; identical && i < d0.pieces.size(); ++i) {
            identical = identical && d0.pieces[i].name == dN.pieces[i].name &&
                        sameCommands(d0.pieces[i].commands, dN.pieces[i].commands) &&
                        sameCommands(d0.pieces[i].markings, dN.pieces[i].markings);
        }
        check(identical, "BoxPleat::None leaves every piece byte-identical (outline + markings)");
        check(static_cast<int>(BoxPleat::None) == 0 &&
              static_cast<int>(BoxPleat::CenterInverted) == 1,
              "enum surface is exactly {None=0, CenterInverted=1}");
        std::printf("\n");
    }

    // ---- BOX PLEAT ON: a top front gets the CF underlay, finished width trues ----
    // Use a HIP top so the front is a single extended panel with a real CF edge.
    {
        std::printf("Box pleat ON — top front: CF underlay added, finished width trues:\n");
        GarmentSpec s; s.garment = GarmentType::Top; s.shaping = Shaping::Dart;
        s.neckline = Neckline::Crew; s.sleeveStyle = SleeveStyle::Straight;
        s.sleeveLength = SleeveLength::Short; s.topLength = TopLength::Hip;
        GarmentSpec p = s; p.boxPleat = static_cast<int>(BoxPleat::CenterInverted);

        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dP = GarmentDrafter::draft(p, m0());

        const PatternPiece* plain = findByName(d0, "Top Front");
        const PatternPiece* pleat = findByName(dP, "Top Front");
        check(plain && pleat, "both plain and pleated top fronts exist");

        // The piece count is unchanged (the pleat widens the SAME piece, adds none).
        check(dP.pieces.size() == d0.pieces.size(),
              "pleat adds no new piece (it widens the front in place)");

        const double wPlain = outlineWidth(plain);
        const double wPleat = outlineWidth(pleat);
        std::printf("      plain front width %.2f mm | pleated front width %.2f mm | underlay %.1f\n",
                    wPlain, wPleat, underlay);
        check(wPlain > 0 && wPleat > 0, "both widths measurable");

        // CF grew: the flat piece is wider by EXACTLY the underlay (2 x depth).
        check(std::fabs((wPleat - wPlain) - underlay) < 0.5,
              "flat front is wider by exactly the pleat underlay (2 x depth = " +
              std::to_string((long)std::lround(underlay)) + " mm)");

        // TRUING: the finished (folded-out) width = flat width - underlay = original.
        const double finished = wPleat - underlay;
        check(std::fabs(finished - wPlain) < 0.5,
              "finished folded width trues back to the original un-pleated width <0.5 mm "
              "(finished " + std::to_string(finished) + " vs original " + std::to_string(wPlain) + ")");

        // The CF edge grew INTO negative x (the underlay past the fold) by the underlay.
        check(std::fabs(outlineMinX(pleat) - (outlineMinX(plain) - underlay)) < 0.5,
              "the CF fold edge grew outward by the underlay (into -x)");

        // Stays cut ON FOLD (a box pleat presses to the fold; it does NOT open the front).
        check(pleat->cutInstruction.find("on fold") != std::string::npos,
              "front is still cut on the fold (the pleat is not an opening)");

        // Fold-line + direction markings were stamped (more markings than plain).
        check(pleat->markings.size() > plain->markings.size(),
              "pleat fold-line + 'fold to center' markings added");
        check(pleat->closure.find("box pleat") != std::string::npos,
              "the piece records the inverted box pleat construction");

        // The draft is still valid + wearable with the pleat on.
        const auto iss = PatternValidator::issues(p, m0(), dP);
        if (!iss.empty()) for (const auto& v : iss) std::printf("        got: %s\n", v.description().c_str());
        check(iss.empty(), "box-pleat top draft is valid (wearability + validator green)");
        std::printf("\n");
    }

    // ---- SWING TOP: yoke + center box pleat compose on the "Front Body" ---------
    {
        std::printf("Swing top — yoke + center box pleat (the flat #12 doll/swing top):\n");
        GarmentSpec s; s.garment = GarmentType::Top; s.shaping = Shaping::Dart;
        s.neckline = Neckline::Crew; s.sleeveStyle = SleeveStyle::Straight;
        s.sleeveLength = SleeveLength::Short; s.topLength = TopLength::Hip;
        s.yoke = static_cast<int>(Yoke::Plain);
        GarmentSpec p = s; p.boxPleat = static_cast<int>(BoxPleat::CenterInverted);

        const DraftedPattern dY = GarmentDrafter::draft(s, m0());   // yoke, no pleat
        const DraftedPattern dP = GarmentDrafter::draft(p, m0());   // yoke + pleat

        check(findByName(dP, "Front Body") != nullptr,
              "the yoke's Front Body piece exists (the pleat's host)");

        const PatternPiece* body0 = findByName(dY, "Front Body");
        const PatternPiece* bodyP = findByName(dP, "Front Body");
        const double w0 = outlineWidth(body0), wP = outlineWidth(bodyP);
        std::printf("      Front Body width: no-pleat %.2f | pleat %.2f (underlay %.1f)\n",
                    w0, wP, underlay);
        check(w0 > 0 && wP > 0, "both Front Body widths measurable");
        check(std::fabs((wP - w0) - underlay) < 0.5,
              "the swing Front Body is wider by exactly the pleat underlay");
        check(std::fabs((wP - underlay) - w0) < 0.5,
              "the swing pleat's finished width trues to the un-pleated Front Body");

        const auto iss = PatternValidator::issues(p, m0(), dP);
        if (!iss.empty()) for (const auto& v : iss) std::printf("        got: %s\n", v.description().c_str());
        check(iss.empty(), "yoke + box pleat (swing top) drafts 0 issues");
        std::printf("\n");
    }

    // ---- YOKE + BOX PLEAT stays byte-identical when the pleat is OFF ------------
    {
        std::printf("Yoke path is undisturbed when boxPleat is OFF:\n");
        GarmentSpec y; y.garment = GarmentType::Top; y.shaping = Shaping::Dart;
        y.neckline = Neckline::Crew; y.sleeveStyle = SleeveStyle::Straight;
        y.sleeveLength = SleeveLength::Short; y.topLength = TopLength::Hip;
        y.yoke = static_cast<int>(Yoke::Plain);
        GarmentSpec y2 = y; y2.boxPleat = static_cast<int>(BoxPleat::None);
        const DraftedPattern a = GarmentDrafter::draft(y, m0());
        const DraftedPattern b = GarmentDrafter::draft(y2, m0());
        bool same = a.pieces.size() == b.pieces.size();
        for (size_t i = 0; same && i < a.pieces.size(); ++i)
            same = same && a.pieces[i].name == b.pieces[i].name &&
                   sameCommands(a.pieces[i].commands, b.pieces[i].commands) &&
                   sameCommands(a.pieces[i].markings, b.pieces[i].markings);
        check(same, "yoke draft is byte-identical with boxPleat None (opt-in guard)");
        std::printf("\n");
    }

    // ---- HONEST NO-OP: a skirt has no CF-foldable front panel ------------------
    {
        std::printf("Skirt: box pleat refused honestly (no CF-foldable front panel):\n");
        GarmentSpec s; s.garment = GarmentType::Skirt; s.skirtStyle = SkirtStyle::ALine;
        GarmentSpec p = s; p.boxPleat = static_cast<int>(BoxPleat::CenterInverted);
        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dP = GarmentDrafter::draft(p, m0());
        // The garment-level guard only runs the pleat on dress/top, so a skirt is
        // byte-identical; prove the block itself also refuses when called directly.
        bool skirtSame = dP.pieces.size() == d0.pieces.size();
        for (size_t i = 0; skirtSame && i < d0.pieces.size(); ++i)
            skirtSame = skirtSame && d0.pieces[i].name == dP.pieces[i].name &&
                        sameCommands(d0.pieces[i].commands, dP.pieces[i].commands);
        check(skirtSame, "skirt draft unchanged (pleat never runs on a skirt)");
        DraftedPattern d = GarmentDrafter::draft(s, m0());
        const size_t before = d.guideSteps.size();
        const bool applied = BoxPleatBlock::apply(d, BoxPleat::CenterInverted);
        check(!applied, "direct apply refuses a skirt (no CF-foldable front panel)");
        check(d.guideSteps.size() == before + 1, "honest skip note added (no silent no-op)");
        std::printf("\n");
    }

    // ---- HONEST NO-OP: an OPENED front (placket) cannot also box-pleat ----------
    {
        std::printf("Front placket + box pleat: pleat refused honestly (front is cut 2):\n");
        GarmentSpec s; s.garment = GarmentType::Top; s.shaping = Shaping::Dart;
        s.neckline = Neckline::Crew; s.sleeveStyle = SleeveStyle::Straight;
        s.sleeveLength = SleeveLength::Short; s.topLength = TopLength::Hip;
        s.frontPlacket = true;
        GarmentSpec p = s; p.boxPleat = static_cast<int>(BoxPleat::CenterInverted);
        const DraftedPattern dS = GarmentDrafter::draft(s, m0());   // placket, no pleat
        const DraftedPattern dP = GarmentDrafter::draft(p, m0());   // placket + pleat request
        // The placket opened the front (cut 2), so the pleat must NOT further widen it.
        const PatternPiece* fS = findByName(dS, "Top Front");
        const PatternPiece* fP = findByName(dP, "Top Front");
        check(fS && fP && std::fabs(outlineWidth(fS) - outlineWidth(fP)) < 0.5,
              "an opened placket front is unchanged by the box-pleat request (honest skip)");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL BOX-PLEAT CHECKS PASS\n" : "%d BOX-PLEAT CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
