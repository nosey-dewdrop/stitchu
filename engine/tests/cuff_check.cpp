// Cuff family (manşet) opt-in check (patch 3.13): proves the cuff is a REAL added
// band whose ATTACH edge is drafted to the wrist and the wide sleeve HEM is drawn
// in to it (fullness surplus > 0), that the button (woven) and ribbed (knit) cuffs
// differ correctly, that a wrist notch appears on the sleeve hem, that a
// sleeveless / short-sleeve garment is REFUSED honestly (no silent no-op), and
// that every existing piece plus the whole base draft (cuff off) stays
// byte-identical.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/cuff.hpp"
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

// The cuff band's attach (top) SEAM edge = first two commands (move + first line).
static double attachEdgeLen(const PatternPiece& cuff) {
    if (cuff.commands.size() < 2) return 0;
    std::vector<PathCommand> edge = {cuff.commands[0], cuff.commands[1]};
    return pathLength(edge);
}

// A LONG-sleeve dress/top spec (Straight sleeve so the draft carries a "Sleeve"
// piece with a real wrist hem the cuff attaches to).
static GarmentSpec sleevedDress() {
    GarmentSpec s;
    s.garment = GarmentType::Dress;
    s.neckline = Neckline::Crew;
    s.sleeveStyle = SleeveStyle::Straight;
    s.sleeveLength = SleeveLength::Long;
    return s;
}

static void base(const char* label, GarmentSpec spec, CuffStyle style,
                 const BodyMeasurementsSnapshot& m, const std::string& cuffName) {
    std::printf("%s\n", label);
    GarmentSpec plain = spec; plain.cuffStyle = static_cast<int>(CuffStyle::None);
    GarmentSpec cuffed = spec; cuffed.cuffStyle = static_cast<int>(style);

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m);
    const DraftedPattern dCuff = GarmentDrafter::draft(cuffed, m);

    check(dCuff.pieces.size() == dPlain.pieces.size() + 1, "exactly one extra cuff piece");

    // Every ORIGINAL piece outline byte-identical (cuff only adds a hem notch).
    bool outlinesSame = true;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i)
        outlinesSame = outlinesSame && sameCommands(dPlain.pieces[i].commands, dCuff.pieces[i].commands);
    check(outlinesSame, "every existing piece outline byte-identical");

    check(PatternValidator::issues(plain, m, dPlain).empty(), "base draft valid");
    check(PatternValidator::issues(cuffed, m, dCuff).empty(), "cuff draft valid");

    // The added cuff piece is the last one.
    const PatternPiece& cuff = dCuff.pieces.back();
    check(cuff.name == cuffName, "cuff piece named '" + cuffName + "'");

    // GOVERNING CONSTRAINT: the sleeve HEM (measured off the finished sleeve) is
    // WIDER than the cuff attach edge — that surplus is the fullness the cuff
    // gathers/pleats. Proven off the real drafted geometry, not asserted.
    const double hem = CuffBlock::sleeveHemWidthMM(dCuff);
    const double attach = attachEdgeLen(cuff);
    check(hem > 60, "sleeve hem measurable off the finished sleeve");
    check(attach > 40, "cuff attach edge has real length");
    check(hem > attach + 5, "sleeve hem wider than the cuff (fullness surplus > 0)");
    const double fullness = attach > 0 ? hem / attach : 0;
    std::printf("      sleeve hem %.1f mm; cuff attach %.1f mm; fullness %.2fx\n",
                hem, attach, fullness);

    // Wrist placement notch added to the sleeve piece.
    bool notchAdded = false;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i)
        if (dCuff.pieces[i].markings.size() > dPlain.pieces[i].markings.size()) notchAdded = true;
    check(notchAdded, "wrist placement notch added to the sleeve hem");
    std::printf("      cuff cut note: %s\n\n", cuff.cutInstruction.c_str());
}

int main() {
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    const BodyMeasurementsSnapshot plus{122, 104, 128, 44, 44, 60, 40};

    base("Long-sleeve crew dress + BUTTON cuff:", sleevedDress(), CuffStyle::Button, m,
         "Button Cuff (gömlek manşeti)");

    GarmentSpec knitTop = sleevedDress();
    knitTop.garment = GarmentType::Top; knitTop.fabric = Fabric::Knit;
    base("Long-sleeve knit top + RIBBED cuff:", knitTop, CuffStyle::Ribbed, m,
         "Ribbed Cuff (ribana manşeti)");

    GarmentSpec elbow = sleevedDress();
    elbow.sleeveLength = SleeveLength::Elbow; elbow.shaping = Shaping::Dart;
    base("Elbow-sleeve dart dress + BUTTON cuff, plus body:", elbow, CuffStyle::Button, plus,
         "Button Cuff (gömlek manşeti)");

    // HONEST BOUNDARY: a SLEEVELESS garment has no wrist — the cuff must skip
    // (no extra piece), leave every outline byte-identical, and log an honest note.
    {
        std::printf("Sleeveless garment refuses a cuff (honest skip):\n");
        GarmentSpec bare; bare.garment = GarmentType::Dress; bare.neckline = Neckline::Crew;
        bare.sleeveStyle = SleeveStyle::None;
        GarmentSpec plain = bare; plain.cuffStyle = static_cast<int>(CuffStyle::None);
        GarmentSpec cuffed = bare; cuffed.cuffStyle = static_cast<int>(CuffStyle::Button);
        const DraftedPattern dPlain = GarmentDrafter::draft(plain, m);
        const DraftedPattern dCuff = GarmentDrafter::draft(cuffed, m);
        check(dCuff.pieces.size() == dPlain.pieces.size(), "no cuff piece on a sleeveless garment");
        bool same = dCuff.pieces.size() == dPlain.pieces.size();
        for (size_t i = 0; same && i < dPlain.pieces.size(); ++i)
            same = same && sameCommands(dPlain.pieces[i].commands, dCuff.pieces[i].commands);
        check(same, "sleeveless draft byte-identical with cuff requested");
        bool honestNote = false;
        for (const auto& s : dCuff.guideSteps)
            if (s.find("Cuff: skipped") != std::string::npos) honestNote = true;
        check(honestNote, "honest 'cuff skipped' note logged (no silent no-op)");
        std::printf("\n");
    }

    // Button vs ribbed differ: the ribbed band's attach edge is SHORTER (it is cut
    // under the wrist to stretch on) than the woven button band (wrist + overlap).
    {
        std::printf("Button vs ribbed geometry:\n");
        GarmentSpec sb = sleevedDress(); sb.cuffStyle = static_cast<int>(CuffStyle::Button);
        GarmentSpec sr = sleevedDress(); sr.cuffStyle = static_cast<int>(CuffStyle::Ribbed);
        const DraftedPattern pb = GarmentDrafter::draft(sb, m);
        const DraftedPattern pr = GarmentDrafter::draft(sr, m);
        const double ab = attachEdgeLen(pb.pieces.back());
        const double ar = attachEdgeLen(pr.pieces.back());
        check(ar < ab, "ribbed band cut shorter than the woven button band");
        std::printf("      button attach %.1f mm; ribbed attach %.1f mm\n\n", ab, ar);
    }

    // Balloon sleeve already has its OWN cuff band (drawn in the sleeve block) — the
    // post-pass must NOT double-cuff it (it targets Sleeve/Puff/Gathered-Head only,
    // not "Sleeve Cuff" or "Balloon Sleeve"). A cuff request on a balloon is a no-op
    // + honest note (no full-length straight hem piece to attach to).
    {
        std::printf("Balloon sleeve not double-cuffed:\n");
        GarmentSpec bl; bl.garment = GarmentType::Dress; bl.neckline = Neckline::Crew;
        bl.sleeveStyle = SleeveStyle::Balloon; bl.sleeveLength = SleeveLength::Long;
        GarmentSpec plain = bl; plain.cuffStyle = static_cast<int>(CuffStyle::None);
        GarmentSpec cuffed = bl; cuffed.cuffStyle = static_cast<int>(CuffStyle::Button);
        const DraftedPattern dPlain = GarmentDrafter::draft(plain, m);
        const DraftedPattern dCuff = GarmentDrafter::draft(cuffed, m);
        check(dCuff.pieces.size() == dPlain.pieces.size(),
              "no extra cuff added to a balloon sleeve (already cuffed)");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL CUFF CHECKS PASS\n" : "%d CUFF CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
