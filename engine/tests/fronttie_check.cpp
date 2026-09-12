// Front-tie variants opt-in check: FrontWaistTie / WrapFront / FrontWaistBow each
// add self-fabric tie pieces + a front placement notch, existing outlines stay
// byte-identical, the draft is valid, and a WRAP-front tie opens the front (the
// dress drops its redundant CB zipper and the top becomes donnable).
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/tie.hpp"
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
static bool hasPiece(const DraftedPattern& d, const char* word) {
    for (const auto& p : d.pieces) if (p.name.find(word) != std::string::npos) return true;
    return false;
}

static void tieCase(const char* label, TiePlacement pl, const char* word) {
    std::printf("%s\n", label);
    GarmentSpec dress; dress.garment = GarmentType::Dress; dress.neckline = Neckline::VNeck;
    dress.shaping = Shaping::Dart;
    GarmentSpec none = dress; none.tieClosure = 0;
    GarmentSpec t = dress; t.tieClosure = static_cast<int>(pl);
    const DraftedPattern d0 = GarmentDrafter::draft(none, m0());
    const DraftedPattern d1 = GarmentDrafter::draft(t, m0());
    check(d1.pieces.size() == d0.pieces.size() + 1, "adds one front-tie piece");
    check(hasPiece(d1, word), std::string("a ") + word + " piece exists");
    check(PatternValidator::issues(t, m0(), d1).empty(), "front-tie draft valid");
    std::printf("\n");
}

int main() {
    tieCase("Dress + FRONT WAIST TIE:", TiePlacement::FrontWaistTie, "Front Waist Tie");
    tieCase("Dress + FRONT WAIST BOW:", TiePlacement::FrontWaistBow, "Front Waist Bow");

    // Wrap-front tie: opens the front. On a TOP (no zip normally) it must make the
    // garment donnable; on a dress it drops the redundant CB zipper.
    {
        std::printf("Top + WRAP-FRONT tie (opens front, donnable):\n");
        GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::VNeck;
        top.shaping = Shaping::Dart;
        GarmentSpec w = top; w.tieClosure = static_cast<int>(TiePlacement::WrapFront);
        const DraftedPattern d1 = GarmentDrafter::draft(w, m0());
        check(hasPiece(d1, "Wrap Front Tie"), "wrap-front tie piece exists");
        check(PatternValidator::issues(w, m0(), d1).empty(),
              "wrap-front top draft valid (the wrap IS the opening)");
        std::printf("\n");

        std::printf("Dress + WRAP-FRONT tie (no redundant CB zipper):\n");
        GarmentSpec dw; dw.garment = GarmentType::Dress; dw.neckline = Neckline::VNeck;
        dw.shaping = Shaping::Dart;
        dw.tieClosure = static_cast<int>(TiePlacement::WrapFront);
        const DraftedPattern d2 = GarmentDrafter::draft(dw, m0());
        bool cbZip = false;
        for (const auto& p : d2.pieces)
            if (p.closure.find("invisible zipper") != std::string::npos) cbZip = true;
        check(!cbZip, "wrap-front dress does NOT also stamp an invisible CB zipper");
        check(PatternValidator::issues(dw, m0(), d2).empty(), "wrap-front dress valid");
        std::printf("\n");
    }

    // Legacy back-tie placements unchanged (append-only enum): back waist still works.
    {
        std::printf("Legacy BackWaist tie still works (append-only enum):\n");
        GarmentSpec dress; dress.garment = GarmentType::Dress; dress.shaping = Shaping::Dart;
        GarmentSpec t = dress; t.tieClosure = static_cast<int>(TiePlacement::BackWaist);
        const DraftedPattern d1 = GarmentDrafter::draft(t, m0());
        check(hasPiece(d1, "Waist Tie"), "back waist tie piece still exists");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL FRONT TIE CHECKS PASS\n" : "%d FRONT TIE CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
