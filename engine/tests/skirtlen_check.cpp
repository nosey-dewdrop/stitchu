// Continuous skirt length (foto-oran kablosu) opt-in check: proves
// spec.skirtLengthMM is a REAL, exact, clamped override of the mini/midi/maxi
// contract table — and a strict no-op when off. The point of the cable: two
// different photos may both say "midi" as an enum, but their measured ratios
// now draft DIFFERENT hem lengths.
//   1. off (0) -> byte-identical to the plain draft (skirt AND dress)
//   2. override == table value -> byte-identical (same math, same path)
//   3. override table+50 -> every skirt piece grows exactly 50 mm, waistband
//      untouched, validator clean
//   4. clamp: 5000 -> same as 1200; 100 -> same as 250
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

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

static bool identicalDraft(const DraftedPattern& a, const DraftedPattern& b) {
    if (a.pieces.size() != b.pieces.size()) return false;
    for (size_t i = 0; i < a.pieces.size(); ++i) {
        if (a.pieces[i].name != b.pieces[i].name) return false;
        if (!sameCommands(a.pieces[i].commands, b.pieces[i].commands)) return false;
    }
    return true;
}

static const BodyMeasurementsSnapshot& m0() {
    static const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    return m;
}

static double bboxHeight(const PatternPiece& p) {
    double lo = 1e18, hi = -1e18;
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Close) continue;
        lo = std::min(lo, c.to.y);
        hi = std::max(hi, c.to.y);
    }
    return hi - lo;
}

static const PatternPiece* pieceNamed(const DraftedPattern& d, const std::string& needle) {
    for (const auto& p : d.pieces)
        if (p.name.find(needle) != std::string::npos) return &p;
    return nullptr;
}

int main() {
    GarmentSpec skirt;
    skirt.garment = GarmentType::Skirt;
    skirt.skirtStyle = SkirtStyle::ALine;
    skirt.skirtLength = SkirtLength::Midi;

    GarmentSpec dress;
    dress.garment = GarmentType::Dress;
    dress.skirtStyle = SkirtStyle::ALine;
    dress.skirtLength = SkirtLength::Midi;
    dress.neckline = Neckline::Crew;

    std::printf("1. off -> byte-identical\n");
    for (const GarmentSpec* base : {&skirt, &dress}) {
        GarmentSpec off = *base; off.skirtLengthMM = 0;
        const auto plain = GarmentDrafter::draft(*base, m0());
        const auto zeroed = GarmentDrafter::draft(off, m0());
        check(identicalDraft(plain, zeroed),
              std::string(base == &skirt ? "skirt" : "dress") + ": skirtLengthMM=0 == plain (byte-identical)");
    }

    std::printf("2. override at the table value -> byte-identical\n");
    {
        GarmentSpec at = skirt; at.skirtLengthMM = 650; // midi table value
        check(identicalDraft(GarmentDrafter::draft(skirt, m0()), GarmentDrafter::draft(at, m0())),
              "skirt: override 650 == midi table draft");
    }

    std::printf("3. override table+50 -> exact growth, waistband untouched, validator clean\n");
    {
        GarmentSpec longer = skirt; longer.skirtLengthMM = 700;
        const auto plain = GarmentDrafter::draft(skirt, m0());
        const auto grown = GarmentDrafter::draft(longer, m0());
        const auto* f0 = pieceNamed(plain, "Front");
        const auto* f1 = pieceNamed(grown, "Front");
        check(f0 && f1, "front piece found in both drafts");
        if (f0 && f1)
            check(std::fabs((bboxHeight(*f1) - bboxHeight(*f0)) - 50.0) < 1e-6,
                  "front piece exactly 50 mm longer");
        const auto* w0 = pieceNamed(plain, "Waistband");
        const auto* w1 = pieceNamed(grown, "Waistband");
        check(w0 && w1 && sameCommands(w0->commands, w1->commands), "waistband untouched");
        const auto issues = PatternValidator::issues(longer, m0(), grown);
        check(issues.empty(), "validator clean on the grown draft (issues: " + std::to_string(issues.size()) + ")");

        GarmentSpec dLonger = dress; dLonger.skirtLengthMM = 700;
        const auto dPlain = GarmentDrafter::draft(dress, m0());
        const auto dGrown = GarmentDrafter::draft(dLonger, m0());
        const auto* s0 = pieceNamed(dPlain, "Skirt Front");
        const auto* s1 = pieceNamed(dGrown, "Skirt Front");
        check(s0 && s1, "dress skirt front found in both drafts");
        if (s0 && s1)
            check(std::fabs((bboxHeight(*s1) - bboxHeight(*s0)) - 50.0) < 1e-6,
                  "dress skirt front exactly 50 mm longer");
        const auto dIssues = PatternValidator::issues(dLonger, m0(), dGrown);
        check(dIssues.empty(), "validator clean on the grown dress");
    }

    std::printf("4. clamp band 250-1200\n");
    {
        GarmentSpec big = skirt;  big.skirtLengthMM = 5000;
        GarmentSpec cap = skirt;  cap.skirtLengthMM = 1200;
        check(identicalDraft(GarmentDrafter::draft(big, m0()), GarmentDrafter::draft(cap, m0())),
              "5000 clamps to 1200");
        GarmentSpec tiny = skirt;  tiny.skirtLengthMM = 100;
        GarmentSpec floorv = skirt; floorv.skirtLengthMM = 250;
        check(identicalDraft(GarmentDrafter::draft(tiny, m0()), GarmentDrafter::draft(floorv, m0())),
              "100 clamps to 250");
    }

    std::printf("%s (%d failure%s)\n", failures ? "SKIRTLEN CHECK FAILED" : "SKIRTLEN CHECK OK",
                failures, failures == 1 ? "" : "s");
    return failures ? 1 : 0;
}
