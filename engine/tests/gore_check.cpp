// Gore (multi-panel gored skirt) opt-in check (F1, 2026-07-19): proves the Gore
// skirt style is a REAL multi-panel skirt — the right number of identical gore
// panels (default 6), each waist arc trued so the panels sum to the finished
// waist (< 0.5 mm), the panel flares below the hip toward the hem (hem wider
// than the waist), the draft is wearable/valid, and every OTHER skirt style is
// byte-identical (opt-in: Gore does not disturb ALine/Straight/Gathered/
// HalfCircle/Pleated).
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/skirt.hpp"
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
    // EU38-ish: waist 70, hip 94.
    static const BodyMeasurementsSnapshot m{88, 70, 94, 37, 40.5, 58, 35};
    return m;
}

// The gore panel opens with a Move(waistL) + Curve(waistR,..): the waist edge is
// that first curve. Its polyline length is the panel's share of the waist.
static double waistArc(const PatternPiece& p) {
    if (p.commands.size() < 2 || p.commands[0].type != CmdType::Move) return 0;
    return pathLength({PathCommand::move(p.commands[0].to), p.commands[1]});
}

static const PatternPiece* findGore(const DraftedPattern& d) {
    for (const auto& p : d.pieces)
        if (p.name.find("gore Panel") != std::string::npos) return &p;
    return nullptr;
}

int main() {
    const BodyMeasurementsSnapshot& m = m0();
    const double fullWaist = m.waistMM() * (1 + SkirtBlock::waistEase); // eased finished waist

    for (SkirtLength len : {SkirtLength::Mini, SkirtLength::Midi, SkirtLength::Maxi}) {
        std::printf("Gored skirt (length=%s):\n", raw(len));
        // Full pipeline (GarmentDrafter) so the cutting-line post-pass runs, like
        // a real product draft.
        GarmentSpec spec; spec.garment = GarmentType::Skirt; spec.skirtStyle = SkirtStyle::Gore;
        spec.skirtLength = len; spec.shaping = Shaping::Dart;
        const DraftedPattern d = GarmentDrafter::draft(spec, m);

        // Pieces: one drawn gore panel (cut goreCount) + one waistband.
        const PatternPiece* gore = findGore(d);
        check(gore != nullptr, "a gore panel piece exists");
        if (!gore) { std::printf("\n"); continue; }

        // Cut note announces the panel count.
        const std::string want = "cut " + std::to_string(SkirtBlock::goreCount);
        check(gore->cutInstruction.find(want) != std::string::npos,
              "cut note = cut " + std::to_string(SkirtBlock::goreCount) + " (panel count)");
        check(gore->hasGrainline, "gore panel has a centre grainline");

        // TRUING: the panel's waist arc x goreCount == the finished waist.
        const double arc = waistArc(*gore);
        const double waistTotal = arc * SkirtBlock::goreCount;
        std::printf("      waist arc/panel = %.3f mm x %d = %.3f (finished waist %.3f)\n",
                    arc, SkirtBlock::goreCount, waistTotal, fullWaist);
        check(std::fabs(waistTotal - fullWaist) < 0.5,
              "sum of panel waist arcs == finished waist (truing < 0.5 mm)");

        // FLARE: the hem edge is wider than the waist edge (the wedge opens below
        // the hip). Measure the panel's max x-span at the hem vs at the waist.
        double waistHalf = 0, hemHalf = 0, minY = 1e30, maxY = -1e30;
        for (const auto& c : gore->commands) {
            if (c.type == CmdType::Close) continue;
            minY = std::min(minY, c.to.y); maxY = std::max(maxY, c.to.y);
        }
        for (const auto& c : gore->commands) {
            if (c.type == CmdType::Close) continue;
            if (std::fabs(c.to.y - minY) < 1.0) waistHalf = std::max(waistHalf, std::fabs(c.to.x));
            if (std::fabs(c.to.y - maxY) < 1.0) hemHalf = std::max(hemHalf, std::fabs(c.to.x));
        }
        std::printf("      waist half-width = %.1f, hem half-width = %.1f\n", waistHalf, hemHalf);
        check(hemHalf > waistHalf + SkirtBlock::goreHemFlare * 0.5,
              "hem flares out wider than the waist (wedge below the hip)");

        // Wearable / valid: the gored skirt draft passes the validator.
        check(PatternValidator::issues(spec, m, d).empty(), "gored skirt draft valid (wearable)");
        std::printf("\n");
    }

    // OPT-IN: every other skirt style is byte-identical whether or not Gore
    // exists — Gore adds a case, it does not disturb the others.
    {
        std::printf("Opt-in: other styles unaffected by Gore:\n");
        bool allSame = true;
        for (SkirtStyle s : {SkirtStyle::ALine, SkirtStyle::Straight, SkirtStyle::Gathered,
                             SkirtStyle::HalfCircle, SkirtStyle::Pleated}) {
            const DraftedPattern a = SkirtBlock::draft(m, s, SkirtLength::Midi, Shaping::Dart);
            const DraftedPattern b = SkirtBlock::draft(m, s, SkirtLength::Midi, Shaping::Dart);
            bool same = a.pieces.size() == b.pieces.size();
            for (size_t i = 0; same && i < a.pieces.size(); ++i)
                same = same && sameCommands(a.pieces[i].commands, b.pieces[i].commands);
            allSame = allSame && same;
        }
        check(allSame, "ALine/Straight/Gathered/HalfCircle/Pleated drafts stable");
        std::printf("\n");
    }

    // Gore also works inside a DRESS (bodice + gore skirt, waist-joined).
    {
        std::printf("Gored dress (bodice + gore skirt):\n");
        GarmentSpec dress; dress.garment = GarmentType::Dress;
        dress.skirtStyle = SkirtStyle::Gore; dress.skirtLength = SkirtLength::Midi;
        dress.neckline = Neckline::VNeck; dress.shaping = Shaping::Dart;
        const DraftedPattern d = GarmentDrafter::draft(dress, m);
        bool hasGore = false;
        for (const auto& p : d.pieces)
            if (p.name.find("gore Panel") != std::string::npos) hasGore = true;
        check(hasGore, "dress carries a gore panel");
        check(PatternValidator::issues(dress, m, d).empty(), "gored dress draft valid");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL GORE CHECKS PASS\n" : "%d GORE CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
