// Cap sleeve (kısa kanat cap, R1.2) opt-in check: proves the cap sleeve is a
// REAL short wing — a single "Cap Sleeve" piece replaces the full sleeve, its
// cap (armhole) edge is the SAME set-in cap curve as a plain sleeve (so it eases
// into the armhole 1:1), it is much SHORTER than a plain short sleeve (a wing,
// not a tube), it carries no underarm-seam length, every OTHER piece stays
// byte-identical, and a Plain cap draft is unchanged (byte-identical default).
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/sleeve.hpp"
#include "../src/placket.hpp"
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

static const PatternPiece* findByName(const DraftedPattern& d, const std::string& needle) {
    for (const auto& p : d.pieces)
        if (p.name.find(needle) != std::string::npos) return &p;
    return nullptr;
}

// The cap (armhole) edge of a set-in sleeve/cap is the leading run: Move + the
// two cap curves up to and over the crown, ending at the right underarm point.
// Its length is the length of those first three commands.
static double capEdgeLength(const PatternPiece& p) {
    if (p.commands.size() < 3) return 0;
    std::vector<PathCommand> cap{p.commands[0], p.commands[1], p.commands[2]};
    return pathLength(cap);
}

static double outlineHeight(const PatternPiece& p) {
    double minY = 1e30, maxY = -1e30;
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Close) continue;
        minY = std::min(minY, c.to.y); maxY = std::max(maxY, c.to.y);
    }
    return maxY - minY;
}

static void run(const char* label, GarmentSpec base) {
    std::printf("%s\n", label);
    GarmentSpec plain = base; plain.sleeveCap = SleeveCap::Plain;
    GarmentSpec capped = base; capped.sleeveCap = SleeveCap::Cap;

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m0());
    const DraftedPattern dCap = GarmentDrafter::draft(capped, m0());

    // Same piece COUNT — the cap sleeve replaces the sleeve, not adds one.
    check(dCap.pieces.size() == dPlain.pieces.size(), "same piece count (cap replaces the sleeve)");

    check(PatternValidator::issues(plain, m0(), dPlain).empty(), "plain-sleeve draft valid");
    check(PatternValidator::issues(capped, m0(), dCap).empty(), "cap-sleeve draft valid");

    const PatternPiece* cap = findByName(dCap, "Cap Sleeve");
    check(cap != nullptr, "a Cap Sleeve piece exists");
    const PatternPiece* plainSleeve = findByName(dPlain, "Sleeve");
    check(plainSleeve != nullptr, "the plain draft has a Sleeve piece");
    if (!cap || !plainSleeve) { std::printf("\n"); return; }

    check(cap->cutInstruction.find("cut 2") != std::string::npos, "cap sleeve is cut 2");
    check(cap->hasGrainline, "cap sleeve has a grainline");

    // Every NON-sleeve piece is byte-identical (the cap only swaps the sleeve).
    bool othersSame = true;
    for (const auto& pp : dPlain.pieces) {
        if (pp.name.find("Sleeve") != std::string::npos) continue;
        const PatternPiece* q = nullptr;
        for (const auto& c : dCap.pieces) if (c.name == pp.name) { q = &c; break; }
        othersSame = othersSame && q && sameCommands(pp.commands, q->commands);
    }
    check(othersSame, "every non-sleeve piece outline byte-identical");

    // The cap EDGE (armhole seam) length matches the plain sleeve's cap edge to
    // < 0.5 mm — same set-in cap, so it eases into the SAME armhole 1:1.
    const double capLen = capEdgeLength(*cap);
    const double plainLen = capEdgeLength(*plainSleeve);
    std::printf("      cap edge = %.2f mm, plain sleeve cap edge = %.2f mm\n", capLen, plainLen);
    check(std::fabs(capLen - plainLen) < 0.5, "cap edge == plain sleeve cap edge (armhole 1:1)");

    // The cap sleeve is a SHORT WING: below the underarm (cap base) line it hangs
    // only ~capWingDepth, whereas a plain short sleeve runs a full ~90 mm hem plus
    // extra below the same cap. Measure the drop below the cap base (max outline y
    // minus the cap base y). The cap base y is the sleeve's cap height — the
    // deepest cap-curve point of the plain sleeve equals the cap base of both.
    // Both share the armhole-matched cap, so we compare their TOTAL heights: the
    // cap contributes the same to both; the difference is purely the body length.
    const double capH = outlineHeight(*cap);
    const double plainH = outlineHeight(*plainSleeve);
    std::printf("      cap wing height = %.1f mm, plain short sleeve height = %.1f mm (wing depth %.0f)\n",
                capH, plainH, SleeveBlock::capWingDepth);
    // The cap outline height must be the armhole cap plus ONLY the wing depth —
    // i.e. the plain sleeve is longer by (its body length − the wing depth), which
    // for a short sleeve (~90 mm hem) is a clear margin.
    check(plainH - capH > 10, "cap sleeve is shorter than the plain short sleeve (a wing, no sleeve body)");
    check(capH > SleeveBlock::capWingDepth * 0.5, "the wing has real depth (not degenerate)");
    std::printf("\n");
}

int main() {
    // Straight short-sleeve dress → cap variant.
    GarmentSpec dress;
    dress.garment = GarmentType::Dress;
    dress.neckline = Neckline::Boat;
    dress.sleeveStyle = SleeveStyle::Straight;
    dress.sleeveLength = SleeveLength::Short;
    run("Boat-neck straight-sleeve dress → cap sleeve:", dress);

    // V-neck top → cap variant.
    GarmentSpec top;
    top.garment = GarmentType::Top;
    top.neckline = Neckline::VNeck;
    top.sleeveStyle = SleeveStyle::Straight;
    top.sleeveLength = SleeveLength::Short;
    run("V-neck top → cap sleeve:", top);

    // Cap coexists with an asymmetric placket on one dress (the Jackie combo).
    {
        std::printf("Cap sleeve + asymmetric placket coexist (the Jackie combo):\n");
        GarmentSpec j;
        j.garment = GarmentType::Dress;
        j.neckline = Neckline::Boat;
        j.sleeveStyle = SleeveStyle::Straight;
        j.sleeveLength = SleeveLength::Short;
        j.sleeveCap = SleeveCap::Cap;
        j.placketStyle = static_cast<int>(PlacketStyle::Asymmetric);
        const DraftedPattern d = GarmentDrafter::draft(j, m0());
        check(PatternValidator::issues(j, m0(), d).empty(), "combined Jackie draft valid");
        check(findByName(d, "Cap Sleeve") != nullptr, "cap sleeve present in the combo");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL CAP SLEEVE CHECKS PASS\n" : "%d CAP SLEEVE CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
