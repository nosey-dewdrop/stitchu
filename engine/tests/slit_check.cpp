// Back hem slit / walking vent (arka etek yırtmacı) opt-in check (Loop M1):
// proves the vent/slit is a REAL change to the back CENTER-BACK piece — the cut
// note flips to a CB seam, a top-point bar tack is marked at hemY - height, a
// Vent grows a folded-back extension exactly ventExtension wide (fold-to-edge,
// trued 0.00 mm), only a straight/A-line back hosts it (gathered skirt skipped
// honestly), it coexists with a tie-back + open-back, and the whole base draft
// (backSlit off) plus every piece OUTLINE stays byte-identical.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/slit.hpp"
#include "../src/openback.hpp"
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

static const PatternPiece* findBack(const DraftedPattern& d) {
    for (const char* name : {"Skirt Center Back", "Skirt Back", "Center Back", "Back"})
        for (const auto& p : d.pieces)
            if (p.name == name) return &p;
    return nullptr;
}

// hemY = deepest CB outline point (x < 20).
static double hemOf(const PatternPiece& p) {
    double y = p.commands.empty() ? 0 : p.commands[0].to.y;
    for (const auto& c : p.commands)
        if (c.type != CmdType::Close && c.to.x < 20) y = std::max(y, c.to.y);
    return y;
}

static void base(const char* label, GarmentSpec spec, HemSlit finish, bool expectExtension) {
    std::printf("%s\n", label);
    GarmentSpec plain = spec; plain.backSlit = static_cast<int>(HemSlit::None);
    GarmentSpec sl = spec;    sl.backSlit = static_cast<int>(finish);

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m0());
    const DraftedPattern dSl = GarmentDrafter::draft(sl, m0());

    // A slit adds NO piece (grown-on extension / marked opening on the back).
    check(dSl.pieces.size() == dPlain.pieces.size(), "no extra piece (grown-on/marked)");

    const PatternPiece* bPlain = findBack(dPlain);
    const PatternPiece* bSl = findBack(dSl);
    check(bPlain && bSl, "a back piece exists to carry the slit");
    if (!bPlain || !bSl) { std::printf("\n"); return; }

    // Every piece byte-identical EXCEPT the back: a plain Slit changes only the
    // back's cut note + markings; a Vent also grows the extension onto the back
    // outline. Every OTHER piece outline stays byte-identical.
    bool othersSame = true;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i) {
        if (&dPlain.pieces[i] == bPlain) continue;
        if (dPlain.pieces[i].name == bSl->name) continue;
        othersSame = othersSame && sameCommands(dPlain.pieces[i].commands, dSl.pieces[i].commands);
    }
    check(othersSame, "every NON-back piece OUTLINE byte-identical");
    if (!expectExtension) // a plain slit does not touch the outline at all
        check(sameCommands(bPlain->commands, bSl->commands), "plain slit: back outline untouched");

    check(PatternValidator::issues(plain, m0(), dPlain).empty(), "base draft valid");
    check(PatternValidator::issues(sl, m0(), dSl).empty(), "slit draft valid");

    // Cut note flips to a CB seam.
    check(bSl->cutInstruction.find("center back seam") != std::string::npos,
          "back cut note now a center-back seam");

    // Top-point bar tack: a marking at y = hemY - height. Find it (a horizontal
    // segment at x=0). The first added marking after the plain markings is the
    // bar tack move to {0, topY}.
    check(bSl->markings.size() > bPlain->markings.size(), "slit markings added to the back");
    const double hemY = hemOf(*bSl);
    const PathCommand& barTack = bSl->markings[bPlain->markings.size()];
    check(barTack.type == CmdType::Move && std::fabs(barTack.to.x) < 1e-9,
          "bar tack starts on the CB (x=0)");
    const double topY = barTack.to.y;
    check(topY < hemY - 1, "top point sits above the hem");
    // The rise is the clamped default (or the available-limited value); it must be
    // a real walking rise within [minHeight, maxHeight].
    const double rise = hemY - topY;
    check(rise >= SlitBlock::minHeight - 1e-6 && rise <= SlitBlock::maxHeight + 1e-6,
          "slit rise within [minHeight, maxHeight]");
    std::printf("      hemY=%.1f topY=%.1f rise=%.1f mm\n", hemY, topY, rise);

    if (expectExtension) {
        // VENT extension is real fabric → it lives in the OUTLINE (like the
        // placket's grown-on stand). TRUING: the extension edge is the CB offset
        // OUT by exactly ventExtension. Widest negative-x outline point = 40.00 mm.
        double maxNegX = 0;
        for (const auto& c : bSl->commands)
            if (c.type != CmdType::Close) maxNegX = std::max(maxNegX, -c.to.x);
        check(std::fabs(maxNegX - SlitBlock::ventExtension) < 1e-9,
              "vent extension width == ventExtension (truing 0.00 mm)");
        // The 45 degree top corner: the extension reaches full width at
        // topY + ventExtension (rise == run). Confirm an outline point there.
        bool corner = false;
        for (const auto& c : bSl->commands)
            if (std::fabs(c.to.x + SlitBlock::ventExtension) < 1e-9 &&
                std::fabs(c.to.y - (topY + SlitBlock::ventExtension)) < 1e-9) corner = true;
        check(corner, "45\xC2\xB0 top corner at (-ext, topY+ext)");
    } else {
        // SLIT: no extension anywhere (outline or markings) beyond the bar tack.
        double maxNegX = 0;
        for (const auto& c : bSl->commands)
            if (c.type != CmdType::Close) maxNegX = std::max(maxNegX, -c.to.x);
        for (const auto& c : bSl->markings)
            if (c.type != CmdType::Close) maxNegX = std::max(maxNegX, -c.to.x);
        check(maxNegX < 1e-9, "plain slit has no extension flap");
    }
    std::printf("      back cut note: %s\n\n", bSl->cutInstruction.c_str());
}

int main() {
    // Straight fitted dress skirt (dart shaping → a plain "Skirt Back" panel).
    GarmentSpec straightDart; straightDart.garment = GarmentType::Dress;
    straightDart.skirtStyle = SkirtStyle::Straight; straightDart.shaping = Shaping::Dart;
    base("Straight-skirt dress + VENT:", straightDart, HemSlit::Vent, true);
    base("Straight-skirt dress + plain SLIT:", straightDart, HemSlit::Slit, false);

    // Default A-line princess dress (Skirt Center Back gore).
    GarmentSpec aline; aline.garment = GarmentType::Dress; aline.skirtStyle = SkirtStyle::ALine;
    base("A-line princess dress + VENT (Center Back gore):", aline, HemSlit::Vent, true);

    // Standalone straight skirt.
    GarmentSpec skirt; skirt.garment = GarmentType::Skirt;
    skirt.skirtStyle = SkirtStyle::Straight; skirt.shaping = Shaping::Dart;
    base("Standalone straight skirt + VENT:", skirt, HemSlit::Vent, true);

    // A gathered skirt has walking ease already → SlitBlock (via the garment.cpp
    // gate) never runs; even if called directly it skips honestly. Prove the gate:
    {
        std::printf("Gathered skirt: gate skips the vent honestly:\n");
        GarmentSpec g; g.garment = GarmentType::Dress; g.skirtStyle = SkirtStyle::Gathered;
        g.backSlit = static_cast<int>(HemSlit::Vent);
        GarmentSpec gPlain = g; gPlain.backSlit = 0;
        const DraftedPattern dG = GarmentDrafter::draft(g, m0());
        const DraftedPattern dGp = GarmentDrafter::draft(gPlain, m0());
        // The garment.cpp gate excludes gathered, so on==off byte-identical.
        bool same = dG.pieces.size() == dGp.pieces.size();
        for (size_t i = 0; same && i < dG.pieces.size(); ++i) {
            same = same && sameCommands(dG.pieces[i].commands, dGp.pieces[i].commands) &&
                   dG.pieces[i].cutInstruction == dGp.pieces[i].cutInstruction &&
                   sameCommands(dG.pieces[i].markings, dGp.pieces[i].markings);
        }
        check(same, "gathered skirt: vent gated out, draft byte-identical");
        // Direct call also refuses + leaves an honest note (call the block itself).
        DraftedPattern dDirect = GarmentDrafter::draft(gPlain, m0());
        const size_t stepsBefore = dDirect.guideSteps.size();
        const bool applied = SlitBlock::apply(dDirect, HemSlit::Vent);
        check(!applied, "direct SlitBlock::apply refuses a gathered back");
        check(dDirect.guideSteps.size() == stepsBefore + 1, "honest skip note added (no silent no-op)");
        std::printf("\n");
    }

    // Coexists: a back tie (Loop 4b) + open-back cutout (Loop 9b) + hem slit all
    // on one dress. The slit only touches the back skirt; the others sit above.
    {
        std::printf("Tie-back + open-back + hem slit coexist on one dress:\n");
        GarmentSpec d; d.garment = GarmentType::Dress; d.skirtStyle = SkirtStyle::Straight;
        d.shaping = Shaping::Dart; d.tieClosure = 2;
        d.backOpening = static_cast<int>(BackOpening::RoundCutout);
        GarmentSpec withSlit = d; withSlit.backSlit = static_cast<int>(HemSlit::Vent);
        const DraftedPattern p0 = GarmentDrafter::draft(d, m0());
        const DraftedPattern p1 = GarmentDrafter::draft(withSlit, m0());
        check(p1.pieces.size() == p0.pieces.size(), "slit adds no piece atop tie + open-back");
        check(PatternValidator::issues(withSlit, m0(), p1).empty(), "combined draft valid");
        bool tie = false, facing = false;
        for (const auto& pc : p1.pieces) {
            if (pc.name.find("Tie") != std::string::npos || pc.name.find("Sash") != std::string::npos
                || pc.name.find("Bow") != std::string::npos) tie = true;
            if (pc.name.find("Open Back Facing") != std::string::npos) facing = true;
        }
        check(tie && facing, "tie + open-back facing both still present with the slit");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL SLIT CHECKS PASS\n" : "%d SLIT CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
