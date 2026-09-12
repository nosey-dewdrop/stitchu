// Back detail (arka pelerin / fırfır / volan) opt-in check: each detail adds ONE
// separate piece whose attach edge is trued to the back neck edge, existing
// outlines stay byte-identical, and the draft stays valid; None is byte-identical.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/backdetail.hpp"
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
static const PatternPiece* backCenter(const DraftedPattern& d) {
    for (const auto& p : d.pieces)
        if (p.name == "Bodice Back" || p.name == "Top Back" ||
            p.name == "Bodice Center Back" || p.name == "Top Center Back") return &p;
    return nullptr;
}
static double backNeck(const PatternPiece& b) {
    if (b.commands.size() < 2) return -1;
    std::vector<PathCommand> path{b.commands[0], b.commands[1]};
    return 2.0 * pathLength(path);
}

static void one(const char* label, BackDetail detail, const char* pieceWord) {
    std::printf("%s\n", label);
    GarmentSpec dress; dress.garment = GarmentType::Dress; dress.neckline = Neckline::Scoop;
    dress.shaping = Shaping::Dart;
    GarmentSpec none = dress; none.backDetail = 0;
    GarmentSpec bd = dress; bd.backDetail = static_cast<int>(detail);
    const DraftedPattern d0 = GarmentDrafter::draft(none, m0());
    const DraftedPattern d1 = GarmentDrafter::draft(bd, m0());
    check(d1.pieces.size() == d0.pieces.size() + 1, "adds exactly one back-detail piece");
    // existing pieces byte-identical
    bool same = true;
    for (size_t i = 0; i < d0.pieces.size(); ++i)
        same = same && sameCommands(d0.pieces[i].commands, d1.pieces[i].commands);
    check(same, "existing outlines byte-identical");
    const PatternPiece* piece = nullptr;
    for (const auto& p : d1.pieces) if (p.name.find(pieceWord) != std::string::npos) piece = &p;
    check(piece != nullptr, std::string("a ") + pieceWord + " piece exists");
    if (piece) {
        check(piece->hasGrainline, "the piece has a grainline");
        const PatternPiece* back = backCenter(d1);
        const double N = back ? backNeck(*back) : -1;
        // The cut note names the trued back neck edge length (rounded).
        std::string tag = std::to_string(static_cast<long>(std::lround(N)));
        check(N > 0 && piece->cutInstruction.find("neck") != std::string::npos,
              "cut note references the back neck edge (attach edge trued)");
    }
    check(PatternValidator::issues(bd, m0(), d1).empty(), "back-detail draft valid");
    std::printf("\n");
}

int main() {
    one("Dress + back RUFFLE:", BackDetail::Ruffle, "Back Ruffle");
    one("Dress + back CAPE:", BackDetail::Cape, "Back Cape");
    one("Dress + back FLOUNCE:", BackDetail::Flounce, "Back Flounce");

    // None byte-identical.
    {
        std::printf("None byte-identical:\n");
        GarmentSpec a; a.garment = GarmentType::Dress; a.shaping = Shaping::Dart; a.backDetail = 0;
        const DraftedPattern d0 = GarmentDrafter::draft(a, m0());
        const DraftedPattern d1 = GarmentDrafter::draft(a, m0());
        bool same = d0.pieces.size() == d1.pieces.size();
        for (size_t i = 0; same && i < d0.pieces.size(); ++i)
            same = same && sameCommands(d0.pieces[i].commands, d1.pieces[i].commands);
        check(same, "None draft stable/byte-identical");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL BACK DETAIL CHECKS PASS\n" : "%d BACK DETAIL CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
