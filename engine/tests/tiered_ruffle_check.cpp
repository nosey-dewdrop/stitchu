// Tiered ruffle (kademeli fırfır) check: proves the cascade is REAL — tier i
// gathers onto edge x fullness^(i-1) and is cut at edge x fullness^i, tiers=1
// stays byte-identical to the single ruffle, the base draft never changes and
// every piece stays printable + valid.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/ruffle.hpp"
#include "../src/skirt.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static std::vector<const PatternPiece*> rufflePieces(const DraftedPattern& d) {
    std::vector<const PatternPiece*> out;
    for (const auto& p : d.pieces)
        if (p.name.find("Ruffle") != std::string::npos) out.push_back(&p);
    return out;
}

static bool samePiece(const PatternPiece& a, const PatternPiece& b) {
    if (a.name != b.name || a.cutInstruction != b.cutInstruction) return false;
    if (a.commands.size() != b.commands.size() || a.markings.size() != b.markings.size()) return false;
    auto samePts = [](const std::vector<PathCommand>& x, const std::vector<PathCommand>& y) {
        for (size_t i = 0; i < x.size(); ++i)
            if (std::fabs(x[i].to.x - y[i].to.x) > 1e-9 || std::fabs(x[i].to.y - y[i].to.y) > 1e-9)
                return false;
        return true;
    };
    return samePts(a.commands, b.commands) && samePts(a.markings, b.markings);
}

int main() {
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36}; // EU ~38, cm
    const double FULLNESS = 2.0, DEPTH = 90;
    const int TIERS = 3;

    GarmentSpec base;
    base.garment = GarmentType::Dress;
    base.skirtStyle = SkirtStyle::ALine;
    base.skirtLength = SkirtLength::Midi;

    const double hem = SkirtBlock::hemCircumferenceMM(
        m, base.skirtStyle, base.skirtLength, base.shaping, base.fabric);

    std::printf("A-line midi dress, %d ruffle tiers (fullness %.1f):\n", TIERS, FULLNESS);

    GarmentSpec plain = base;
    GarmentSpec single = base;
    single.ruffleHem = true; single.ruffleFullness = FULLNESS; single.ruffleDepthMM = DEPTH;
    GarmentSpec tiered = single;
    tiered.ruffleTiers = TIERS;

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m);
    const DraftedPattern dSingle = GarmentDrafter::draft(single, m);
    const DraftedPattern dTiered = GarmentDrafter::draft(tiered, m);

    // Opt-in: default draft untouched, tiers only active with ruffleHem on.
    GarmentSpec tiersNoHem = base; tiersNoHem.ruffleTiers = TIERS;
    check(rufflePieces(dPlain).empty(), "default draft has no ruffle pieces");
    check(rufflePieces(GarmentDrafter::draft(tiersNoHem, m)).empty(),
          "ruffleTiers alone (ruffleHem=false) adds nothing");

    // tiers=1 == the single ruffle, byte for byte.
    check(dSingle.pieces.size() == dPlain.pieces.size() + 1 &&
          samePiece(dSingle.pieces.back(),
                    RuffleBlock::draft(hem, FULLNESS, DEPTH)),
          "ruffleTiers=1 stays byte-identical to the single ruffle");

    // The cascade adds exactly TIERS pieces on an unchanged base.
    check(dTiered.pieces.size() == dPlain.pieces.size() + TIERS,
          "tiers add exactly one piece per tier");
    bool baseSame = true;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i)
        baseSame = baseSame && samePiece(dPlain.pieces[i], dTiered.pieces[i]);
    check(baseSame, "existing pieces are identical with the tiers on");

    // Validity for all three drafts.
    check(PatternValidator::issues(plain, m, dPlain).empty(), "base draft valid");
    check(PatternValidator::issues(single, m, dSingle).empty(), "single-ruffle draft valid");
    check(PatternValidator::issues(tiered, m, dTiered).empty(), "tiered draft valid");

    // The math per tier: cut length = hem x fullness^i, segmented evenly and
    // printable; only the last tier carries the rolled-hem depth.
    const auto tiers = rufflePieces(dTiered);
    for (int i = 1; i <= TIERS && i <= (int)tiers.size(); ++i) {
        const PatternPiece& p = *tiers[i - 1];
        const double total = hem * std::pow(FULLNESS, i);
        const int segs = std::max(1, (int)std::ceil(total / 1400.0));
        const double segLen = total / segs;
        const Rect box = boundingBox(p.commands);
        std::printf("      tier %d: edge %.0f -> cut %.0f mm = %d segment(s) x %.0f mm\n",
                    i, total / FULLNESS, total, segs, box.width);
        check(p.name.find("Ruffle tier " + std::to_string(i)) != std::string::npos,
              "tier " + std::to_string(i) + " named for the validator's trim exclusion");
        check(std::fabs(box.width - segLen) < 1.0,
              "tier " + std::to_string(i) + " piece = one even segment of hem x fullness^" + std::to_string(i));
        check(box.width <= 3000.0, "tier " + std::to_string(i) + " printable (<= 3000 mm cap)");
        const double expectH = DEPTH + 12 + (i == TIERS ? 10 : 12);
        check(std::fabs(box.height - expectH) < 0.5,
              "tier " + std::to_string(i) + (i == TIERS ? " ends in the rolled hem" : " ends in the seam that receives the next tier"));
        check(p.hasGrainline && !p.markings.empty(),
              "tier " + std::to_string(i) + " has a grainline + gather notches");
    }

    // Fabric estimate grows with the cascade.
    check(dTiered.fabricMeters140 > dSingle.fabricMeters140,
          "fabric estimate grows with the tiers");

    std::printf(failures == 0 ? "ALL TIERED RUFFLE CHECKS PASS\n" : "%d TIERED RUFFLE CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
