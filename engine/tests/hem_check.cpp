// Hem shape (etek ucu / alt kenar şekli) opt-in check (patch 3.15): proves the
// shirttail / high-low hem is a REAL reshape of the fitted lower edge — the side
// hem lifts while the center hem stays put (shirttail), the front lifts and the
// back drops (high-low), the front and back SIDE hems lift to the SAME height so
// the side seam stays balanced (truing), a gathered skirt is refused honestly,
// every draft with hemShape == Straight is byte-identical, and the waist edge is
// never touched.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/hem.hpp"
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
    static const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    return m;
}

static const PatternPiece* named(const DraftedPattern& d, const std::string& sub) {
    for (const auto& p : d.pieces)
        if (p.name.find(sub) != std::string::npos) return &p;
    return nullptr;
}

// The lowest (max-y) point of a piece = the center hem for a straight/A-line
// quarter (center edge is longest).
static double maxY(const PatternPiece& p) {
    double y = -1e18;
    for (const auto& c : p.commands) if (c.type != CmdType::Close) y = std::max(y, c.to.y);
    return y;
}
// The min-y (waist) point.
static double minY(const PatternPiece& p) {
    double y = 1e18;
    for (const auto& c : p.commands) if (c.type != CmdType::Close) y = std::min(y, c.to.y);
    return y;
}
// The center hem y = the max-y vertex at the min-x (center edge).
static double centerHemY(const PatternPiece& p) {
    double minX = 1e18;
    for (const auto& c : p.commands) if (c.type != CmdType::Close) minX = std::min(minX, c.to.x);
    double y = -1e18;
    for (const auto& c : p.commands)
        if (c.type != CmdType::Close && std::fabs(c.to.x - minX) < 20.0) y = std::max(y, c.to.y);
    return y;
}
// The side hem y = the max-y vertex at the max-x (side edge).
static double sideHemY(const PatternPiece& p) {
    double maxX = -1e18;
    for (const auto& c : p.commands) if (c.type != CmdType::Close) maxX = std::max(maxX, c.to.x);
    double y = -1e18, best = -1e18;
    for (const auto& c : p.commands)
        if (c.type != CmdType::Close && std::fabs(c.to.x - maxX) < 20.0) { best = std::max(best, c.to.y); }
    y = best;
    return y;
}

int main() {
    // A fitted straight skirt (princess) — front + back both host the reshape.
    GarmentSpec skirt; skirt.garment = GarmentType::Skirt; skirt.skirtStyle = SkirtStyle::Straight;
    skirt.shaping = Shaping::Princess;

    // 1) Straight default: every piece byte-identical to no-hem draft.
    {
        std::printf("Straight default byte-identical:\n");
        GarmentSpec off = skirt; off.hemShape = static_cast<int>(HemShape::Straight);
        const DraftedPattern a = GarmentDrafter::draft(skirt, m0());
        const DraftedPattern b = GarmentDrafter::draft(off, m0());
        bool same = a.pieces.size() == b.pieces.size();
        for (size_t i = 0; same && i < a.pieces.size(); ++i)
            same = same && sameCommands(a.pieces[i].commands, b.pieces[i].commands);
        check(same, "hemShape Straight leaves every piece outline byte-identical");
        std::printf("\n");
    }

    // 2) Shirttail: side hem lifts, center hem stays, waist untouched.
    {
        std::printf("Shirttail: sides up, center + waist unchanged:\n");
        GarmentSpec sh = skirt; sh.hemShape = static_cast<int>(HemShape::Shirttail);
        const DraftedPattern base = GarmentDrafter::draft(skirt, m0());
        const DraftedPattern d = GarmentDrafter::draft(sh, m0());
        check(d.pieces.size() == base.pieces.size(), "shirttail adds no piece (reshape only)");
        check(PatternValidator::issues(sh, m0(), d).empty(), "shirttail draft valid");

        // Center panels stay long; the SIDE panels carry the side-hem lift.
        const PatternPiece* cfBase = named(base, "Center Front");
        const PatternPiece* cfSh = named(d, "Center Front");
        const PatternPiece* sfBase = named(base, "Side Front");
        const PatternPiece* sfSh = named(d, "Side Front");
        const PatternPiece* sbBase = named(base, "Side Back");
        const PatternPiece* sbSh = named(d, "Side Back");
        check(cfBase && cfSh && sfBase && sfSh && sbBase && sbSh, "center + side panels found");
        if (cfBase && cfSh && sfBase && sfSh && sbBase && sbSh) {
            const double centerBefore = centerHemY(*cfBase);
            const double centerAfter = centerHemY(*cfSh);
            std::printf("      front center hem: %.2f -> %.2f (should hold)\n", centerBefore, centerAfter);
            check(std::fabs(centerAfter - centerBefore) < 1.0, "front center panel stays long (unchanged)");

            const double rise = sideHemY(*sfBase) - sideHemY(*sfSh); // y decreases upward
            std::printf("      front SIDE-panel outer hem lifted by %.2f mm\n", rise);
            check(rise > HemBlock::shirttailSideRise * 0.5, "front side hem lifts a real amount");

            // waist edge (min y) of the side panel untouched.
            check(std::fabs(minY(*sfSh) - minY(*sfBase)) < 1e-6, "waist edge (min y) untouched");

            // TRUING: front and back SIDE hems lift by the SAME amount → the side
            // seam stays balanced.
            const double frontRise = sideHemY(*sfBase) - sideHemY(*sfSh);
            const double backRise = sideHemY(*sbBase) - sideHemY(*sbSh);
            std::printf("      side-seam balance: front rise %.2f vs back rise %.2f\n", frontRise, backRise);
            check(std::fabs(frontRise - backRise) < 0.5,
                  "front + back side hems lift equally (side seam trued)");
        }
        std::printf("\n");
    }

    // 3) High-low: front hem short (up), back hem long (down), side seams meet.
    {
        std::printf("High-low: front short, back long, sides meet:\n");
        GarmentSpec hl = skirt; hl.hemShape = static_cast<int>(HemShape::HighLow);
        const DraftedPattern base = GarmentDrafter::draft(skirt, m0());
        const DraftedPattern d = GarmentDrafter::draft(hl, m0());
        check(PatternValidator::issues(hl, m0(), d).empty(), "high-low draft valid");

        const PatternPiece* cfBase = named(base, "Center Front");
        const PatternPiece* cfHl = named(d, "Center Front");
        const PatternPiece* cbBase = named(base, "Center Back");
        const PatternPiece* cbHl = named(d, "Center Back");
        const PatternPiece* sfHl = named(d, "Side Front");
        const PatternPiece* sbHl = named(d, "Side Back");
        if (cfBase && cfHl && cbBase && cbHl && sfHl && sbHl) {
            const double frontCenterRise = centerHemY(*cfBase) - centerHemY(*cfHl);
            const double backCenterDrop = centerHemY(*cbHl) - centerHemY(*cbBase);
            std::printf("      front center RISE %.2f mm, back center DROP %.2f mm\n",
                        frontCenterRise, backCenterDrop);
            check(frontCenterRise > HemBlock::highLowFrontRise * 0.5, "front hem raised (short)");
            check(backCenterDrop > HemBlock::highLowBackDrop * 0.5, "back hem dropped (long)");

            // Outer side hems of front and back SIDE panels meet at the same height.
            const double frontSide = sideHemY(*sfHl);
            const double backSide = sideHemY(*sbHl);
            std::printf("      side hem: front %.2f vs back %.2f\n", frontSide, backSide);
            check(std::fabs(frontSide - backSide) < 1.0, "front + back side hems meet (side seam trued)");
        }
        std::printf("\n");
    }

    // 4) Gathered skirt refused honestly (no fitted side hem to lift).
    {
        std::printf("Gathered skirt: hem shape refused honestly:\n");
        GarmentSpec g; g.garment = GarmentType::Skirt; g.skirtStyle = SkirtStyle::Gathered;
        g.hemShape = static_cast<int>(HemShape::Shirttail);
        GarmentSpec off = g; off.hemShape = 0;
        const DraftedPattern d = GarmentDrafter::draft(g, m0());
        const DraftedPattern b = GarmentDrafter::draft(off, m0());
        // Garment-level gate refuses gathered: byte-identical.
        bool same = d.pieces.size() == b.pieces.size();
        for (size_t i = 0; same && i < d.pieces.size(); ++i)
            same = same && sameCommands(d.pieces[i].commands, b.pieces[i].commands);
        check(same, "gathered skirt gated out at garment level, byte-identical");

        // Direct call also refuses honestly (defense in depth).
        DraftedPattern dd = GarmentDrafter::draft(off, m0());
        const size_t before = dd.guideSteps.size();
        const bool applied = HemBlock::apply(dd, HemShape::Shirttail);
        check(!applied, "direct HemBlock::apply refuses a gathered panel");
        check(dd.guideSteps.size() == before + 1, "honest skip note added (no silent no-op)");
        std::printf("\n");
    }

    // 5) A fitted A-line dress hosts the shirttail on its skirt pieces.
    {
        std::printf("A-line dress: shirttail on the skirt pieces:\n");
        GarmentSpec dress; dress.garment = GarmentType::Dress; dress.skirtStyle = SkirtStyle::ALine;
        dress.shaping = Shaping::Princess; dress.hemShape = static_cast<int>(HemShape::Shirttail);
        GarmentSpec off = dress; off.hemShape = 0;
        const DraftedPattern d = GarmentDrafter::draft(dress, m0());
        const DraftedPattern b = GarmentDrafter::draft(off, m0());
        check(PatternValidator::issues(dress, m0(), d).empty(), "A-line dress shirttail valid");
        const PatternPiece* skBase = named(b, "Skirt Side Front");
        const PatternPiece* skSh = named(d, "Skirt Side Front");
        if (skBase && skSh) {
            const double rise = sideHemY(*skBase) - sideHemY(*skSh);
            std::printf("      skirt side hem lifted %.2f mm\n", rise);
            check(rise > 1.0, "dress skirt side hem lifts");
        }
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL HEM CHECKS PASS\n" : "%d HEM CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
