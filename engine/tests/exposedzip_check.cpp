// Exposed / visible zipper opt-in check: a CF/CB exposed zip draws a teeth glyph
// on the seam edge, tags the closure, opens the seam (cut 2, not on fold), and
// keeps the draft valid + donnable; None is byte-identical.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/exposedzip.hpp"
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
    for (size_t i = 0; i < a.size(); ++i)
        if (a[i].type != b[i].type ||
            std::fabs(a[i].to.x - b[i].to.x) > 1e-9 || std::fabs(a[i].to.y - b[i].to.y) > 1e-9)
            return false;
    return true;
}
static const BodyMeasurementsSnapshot& m0() {
    static const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    return m;
}

int main() {
    GarmentSpec dress; dress.garment = GarmentType::Dress; dress.neckline = Neckline::Crew;
    dress.shaping = Shaping::Dart;

    // Exposed CF zip: front pieces get a teeth glyph + closure + open seam.
    {
        std::printf("Dress + EXPOSED center-front zip:\n");
        GarmentSpec none = dress; none.exposedZip = 0;
        GarmentSpec ez = dress; ez.exposedZip = static_cast<int>(ExposedZip::CenterFront);
        const DraftedPattern d0 = GarmentDrafter::draft(none, m0());
        const DraftedPattern d1 = GarmentDrafter::draft(ez, m0());
        // F5-parca: an exposed zip is a DONNING opening, so the invisible CB
        // zipper falls away and the zipperless skirt merges to one "Front &
        // Back" piece — the count may DROP by one, it must never RISE.
        check(d1.pieces.size() <= d0.pieces.size(), "exposed zip adds no new piece (it may drop the CB-zip skirt split, F5)");
        bool tagged = false, opened = false, teeth = false;
        for (const auto& p : d1.pieces) {
            if (p.name.find("Front") != std::string::npos &&
                (p.name.find("Bodice") != std::string::npos || p.name.find("Skirt") != std::string::npos)) {
                if (p.closure.find("exposed") != std::string::npos) tagged = true;
                if (p.cutInstruction.find("center front opening") != std::string::npos) opened = true;
                if (p.notches.size() >= 4) teeth = true;
            }
        }
        check(tagged, "a front piece tags an exposed zipper closure");
        check(opened, "the front seam opens (cut 2, not on fold)");
        check(teeth, "a zipper teeth glyph is drawn on the front seam");
        check(PatternValidator::issues(ez, m0(), d1).empty(), "exposed CF zip draft valid (donnable)");
        std::printf("\n");
    }

    // Exposed CB zip on a top (which normally has NO donning opening) makes it
    // donnable and valid.
    {
        std::printf("Top + EXPOSED center-back zip (makes a top donnable):\n");
        GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::Crew;
        top.shaping = Shaping::Dart;
        GarmentSpec ez = top; ez.exposedZip = static_cast<int>(ExposedZip::CenterBack);
        const DraftedPattern d1 = GarmentDrafter::draft(ez, m0());
        bool tagged = false;
        for (const auto& p : d1.pieces)
            if (p.closure.find("exposed") != std::string::npos) tagged = true;
        check(tagged, "back piece tags exposed CB zip");
        check(PatternValidator::issues(ez, m0(), d1).empty(), "exposed CB top draft valid");
        std::printf("\n");
    }

    // None byte-identical.
    {
        std::printf("None byte-identical:\n");
        GarmentSpec a = dress; a.exposedZip = 0;
        const DraftedPattern d0 = GarmentDrafter::draft(a, m0());
        const DraftedPattern d1 = GarmentDrafter::draft(a, m0());
        bool same = d0.pieces.size() == d1.pieces.size();
        for (size_t i = 0; same && i < d0.pieces.size(); ++i)
            same = same && sameCommands(d0.pieces[i].commands, d1.pieces[i].commands);
        check(same, "None draft stable/byte-identical");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL EXPOSED ZIP CHECKS PASS\n" : "%d EXPOSED ZIP CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
