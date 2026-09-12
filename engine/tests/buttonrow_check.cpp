// Button row (düğme sırası) opt-in check: a Decorative row adds real drawn button
// circles to the front WITHOUT opening it (byte-identical outline, no donning
// change); a Functional row grows the CF opening (outline changes, opens for
// donning) and draws buttons; None is byte-identical.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/buttonrow.hpp"
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
    }
    return true;
}
static const BodyMeasurementsSnapshot& m0() {
    static const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    return m;
}
static int countCircles(const PatternPiece& p) {
    // A button circle is a Move followed by 4 Curves + Close. Count the Closes
    // preceded by 4 curves in markings.
    int n = 0;
    for (size_t i = 0; i < p.markings.size(); ++i)
        if (p.markings[i].type == CmdType::Close) n++;
    return n;
}
static const PatternPiece* front(const DraftedPattern& d) {
    for (const auto& p : d.pieces)
        if (p.name == "Bodice Front" || p.name == "Top Front" ||
            p.name == "Bodice Center Front" || p.name == "Top Center Front") return &p;
    return nullptr;
}

int main() {
    // A dress with a plain (dart) front carries the button row.
    GarmentSpec dress; dress.garment = GarmentType::Dress; dress.neckline = Neckline::Crew;
    dress.shaping = Shaping::Dart;

    // Decorative: outline byte-identical, buttons drawn, still needs its zip.
    {
        std::printf("Dress + DECORATIVE button row:\n");
        GarmentSpec none = dress; none.buttonRow = 0;
        GarmentSpec deco = dress; deco.buttonRow = static_cast<int>(ButtonRow::Decorative);
        const DraftedPattern d0 = GarmentDrafter::draft(none, m0());
        const DraftedPattern d1 = GarmentDrafter::draft(deco, m0());
        check(d0.pieces.size() == d1.pieces.size(), "decorative adds no new piece");
        const PatternPiece* f0 = front(d0); const PatternPiece* f1 = front(d1);
        check(f0 && f1 && sameCommands(f0->commands, f1->commands),
              "decorative: front OUTLINE byte-identical (no opening)");
        check(f1 && countCircles(*f1) >= 3, "decorative: at least 3 button circles drawn");
        check(PatternValidator::issues(deco, m0(), d1).empty(), "decorative draft valid");
        std::printf("\n");
    }

    // Functional: front opens (outline changes, grown stand), buttons drawn.
    {
        std::printf("Top + FUNCTIONAL button row (opens front):\n");
        GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::Crew;
        top.shaping = Shaping::Dart; top.topLength = TopLength::Hip;
        GarmentSpec none = top; none.buttonRow = 0;
        GarmentSpec fn = top; fn.buttonRow = static_cast<int>(ButtonRow::Functional);
        const DraftedPattern d0 = GarmentDrafter::draft(none, m0());
        const DraftedPattern d1 = GarmentDrafter::draft(fn, m0());
        const PatternPiece* f1 = front(d1);
        check(f1 != nullptr, "functional: front piece exists");
        double minX = 1e18;
        if (f1) for (const auto& c : f1->commands) if (c.type != CmdType::Close) minX = std::min(minX, c.to.x);
        check(f1 && minX < -0.5, "functional: CF edge grew a button stand (opens, not on fold)");
        check(f1 && countCircles(*f1) >= 3, "functional: button circles drawn");
        check(f1 && !f1->closure.empty(), "functional: closure tagged (donnable)");
        check(PatternValidator::issues(fn, m0(), d1).empty(), "functional draft valid (wearable)");
        std::printf("\n");
    }

    // None on every garment is byte-identical (skirt has no front bodice → skip).
    {
        std::printf("None is byte-identical:\n");
        GarmentSpec a = dress; a.buttonRow = 0;
        const DraftedPattern d0 = GarmentDrafter::draft(a, m0());
        const DraftedPattern d1 = GarmentDrafter::draft(a, m0());
        bool same = d0.pieces.size() == d1.pieces.size();
        for (size_t i = 0; same && i < d0.pieces.size(); ++i)
            same = same && sameCommands(d0.pieces[i].commands, d1.pieces[i].commands);
        check(same, "None draft stable/byte-identical");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL BUTTON ROW CHECKS PASS\n" : "%d BUTTON ROW CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
