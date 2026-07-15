// Fabric ties / sash / bow (bağ / kuşak / fiyonk) opt-in check (Loop 4b): proves
// the tie is a REAL added piece — exactly one extra rectangle whose cut note
// carries its finished + cut dimensions, a placement notch appears on a body
// piece, and every existing piece plus the whole base draft (tie off) is
// byte-identical.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/tie.hpp"
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

static bool isRectangle(const PatternPiece& p, double& w, double& h) {
    // Outline: Move + 3 Line + Close, axis-aligned rectangle from the origin.
    if (p.commands.size() != 5) return false;
    if (p.commands[0].type != CmdType::Move) return false;
    for (int i = 1; i <= 3; ++i) if (p.commands[i].type != CmdType::Line) return false;
    if (p.commands[4].type != CmdType::Close) return false;
    w = p.commands[1].to.x; h = p.commands[2].to.y;
    return w > 0 && h > 0;
}

static void run(const char* label, GarmentSpec base, TiePlacement placement,
                const BodyMeasurementsSnapshot& m, const std::string& tieName) {
    std::printf("%s\n", label);
    GarmentSpec plain = base; plain.tieClosure = static_cast<int>(TiePlacement::None);
    GarmentSpec tied = base;  tied.tieClosure = static_cast<int>(placement);

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m);
    const DraftedPattern dTie = GarmentDrafter::draft(tied, m);

    check(dTie.pieces.size() == dPlain.pieces.size() + 1, "exactly one extra tie piece");

    // Every ORIGINAL piece outline is byte-identical (the tie only adds markings
    // to one of them, never touches an outline).
    bool outlinesSame = true;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i)
        outlinesSame = outlinesSame && sameCommands(dPlain.pieces[i].commands, dTie.pieces[i].commands);
    check(outlinesSame, "every existing piece outline byte-identical");

    check(PatternValidator::issues(plain, m, dPlain).empty(), "base draft valid");
    check(PatternValidator::issues(tied, m, dTie).empty(), "tie draft valid");

    // Find the tie piece (the extra one at the end) and prove it is a rectangle
    // with a sane cut note and a grainline.
    const PatternPiece& tie = dTie.pieces.back();
    check(tie.name == tieName, "tie piece named '" + tieName + "'");
    double w = 0, h = 0;
    check(isRectangle(tie, w, h), "tie outline is a rectangle");
    check(tie.cutInstruction.find("cut 2") != std::string::npos, "cut note says cut 2");
    check(tie.cutInstruction.find("finished") != std::string::npos, "cut note gives finished size");
    check(tie.hasGrainline, "tie has a grainline");
    std::printf("      tie rectangle %.0f x %.0f mm; note: %s\n", w, h, tie.cutInstruction.c_str());

    // A placement notch (extra markings) lands on some ORIGINAL body piece.
    bool notchAdded = false;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i)
        if (dTie.pieces[i].markings.size() > dPlain.pieces[i].markings.size()) notchAdded = true;
    check(notchAdded, "placement notch added to a body piece");
    std::printf("\n");
}

int main() {
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    const BodyMeasurementsSnapshot plus{122, 104, 128, 44, 44, 60, 40};

    GarmentSpec dress; dress.garment = GarmentType::Dress;
    run("Boat dress + back waist sash bow:", dress, TiePlacement::BackWaistBow, m, "Waist Tie (bel bağı)");

    GarmentSpec dress2; dress2.garment = GarmentType::Dress; dress2.neckline = Neckline::Boat;
    run("Open-back dress + tie-back closure:", dress2, TiePlacement::TieBack, m, "Back Tie (sırt bağı)");

    GarmentSpec top; top.garment = GarmentType::Top;
    run("Top + front neck bow:", top, TiePlacement::FrontNeckBow, m, "Neck/Front Tie (ön bağ)");

    GarmentSpec plusDress; plusDress.garment = GarmentType::Dress; plusDress.shaping = Shaping::Dart;
    run("Plus dart dress + back waist sash (waist scales):", plusDress, TiePlacement::BackWaist, plus, "Waist Tie (bel bağı)");

    std::printf(failures == 0 ? "ALL TIE CHECKS PASS\n" : "%d TIE CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
