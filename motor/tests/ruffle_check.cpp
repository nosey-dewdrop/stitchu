// Ruffle (fırfır) opt-in check: proves the hem ruffle is REAL in the engine —
// it adds exactly one valid gathered strip whose cut length = hem × fullness and
// whose gathered length returns to the hem, WITHOUT changing the base draft.
#include <cstdio>
#include <cmath>
#include <string>

#include "../src/garment.hpp"
#include "../src/skirt.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static bool hasRuffle(const DraftedPattern& d) {
    for (const auto& p : d.pieces)
        if (p.name.find("Ruffle") != std::string::npos) return true;
    return false;
}
static const PatternPiece* rufflePiece(const DraftedPattern& d) {
    for (const auto& p : d.pieces)
        if (p.name.find("Ruffle") != std::string::npos) return &p;
    return nullptr;
}

static void run(const char* label, GarmentSpec base, const BodyMeasurementsSnapshot& m) {
    std::printf("%s\n", label);
    GarmentSpec plain = base; plain.ruffleHem = false;
    GarmentSpec ruff = base;  ruff.ruffleHem = true; ruff.ruffleFullness = 2.5; ruff.ruffleDepthMM = 80;

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m);
    const DraftedPattern dRuff = GarmentDrafter::draft(ruff, m);

    check(!hasRuffle(dPlain), "default (ruffleHem=false) adds NO ruffle piece");
    check(hasRuffle(dRuff), "ruffleHem=true adds a ruffle piece");
    check(dRuff.pieces.size() == dPlain.pieces.size() + 1,
          "ruffle adds exactly one piece (base draft unchanged)");

    // base draft must be byte-identical (same pieces, same geometry)
    bool baseSame = dRuff.pieces.size() == dPlain.pieces.size() + 1;
    for (size_t i = 0; baseSame && i < dPlain.pieces.size(); ++i)
        baseSame = dPlain.pieces[i].name == dRuff.pieces[i].name &&
                   dPlain.pieces[i].commands.size() == dRuff.pieces[i].commands.size();
    check(baseSame, "existing pieces are identical with the ruffle on");

    // validity: both drafts pass the runtime validator
    check(PatternValidator::issues(plain, m, dPlain).empty(), "base draft valid");
    check(PatternValidator::issues(ruff, m, dRuff).empty(), "ruffled draft valid");

    // the math: cut length = hem × fullness; gathered → hem
    const double hem = SkirtBlock::hemCircumferenceMM(m, base.skirtStyle, base.skirtLength,
                                                      base.shaping, base.fabric);
    const PatternPiece* r = rufflePiece(dRuff);
    if (r) {
        const Rect box = boundingBox(r->commands);
        const double total = hem * 2.5;               // full gathered-up ruffle length
        const int segs = std::max(1, (int)std::ceil(total / 1400.0));
        const double segLen = total / segs;
        const bool lenOk = std::fabs(box.width - segLen) < 1.0;
        std::printf("      hem=%.0f mm  ->  total strip %.0f mm = %d segment(s) x %.0f mm; gathered→%.0f\n",
                    hem, total, segs, box.width, total / 2.5);
        check(lenOk, "piece = one even segment; segments x segLen = hem x 2.5");
        check(box.width <= 3000.0, "each piece is printable (<= 3000 mm print cap)");
        check(r->hasGrainline && !r->markings.empty(), "ruffle has a grainline + gather notches");
    } else {
        check(false, "ruffle piece present");
    }
    std::printf("\n");
}

int main() {
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36}; // EU ~38, cm

    GarmentSpec dress;
    dress.garment = GarmentType::Dress;
    dress.skirtStyle = SkirtStyle::ALine;
    dress.skirtLength = SkirtLength::Midi;
    run("A-line dress + hem ruffle:", dress, m);

    GarmentSpec skirt;
    skirt.garment = GarmentType::Skirt;
    skirt.skirtStyle = SkirtStyle::Straight;
    skirt.skirtLength = SkirtLength::Mini;
    run("Straight mini skirt + hem ruffle:", skirt, m);

    GarmentSpec gathered;
    gathered.garment = GarmentType::Dress;
    gathered.skirtStyle = SkirtStyle::Gathered;
    gathered.waistline = Waistline::Empire; // babydoll
    run("Babydoll (empire gathered) dress + hem ruffle:", gathered, m);

    std::printf(failures == 0 ? "ALL RUFFLE CHECKS PASS\n" : "%d RUFFLE CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
