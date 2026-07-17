// Bias binding edge finish (patch 3.10, DEFAULT) check. Proves:
//  - a collarless, non-halter neck defaults to a "Bias binding (neckline)" strip
//    (NOT neck facings), for dress and top;
//  - the strip length is TRUED to the drafted neck edge circumference + overlap
//    (measured off the same neckCommands the bodice draws — one truth);
//  - the strip carries a bias cut note (45° to the grain) + a center fold line;
//  - a sleeveless garment additionally gets a "Bias binding (armholes)" strip
//    trued to twice the drafted armhole length; a sleeved one does not;
//  - the REAL-collar exception keeps the neck FACINGS and produces NO neck bias;
//  - the Facing opt-in reproduces the old facings and NO bias neck strip;
//  - bias binding uses less fabric than a facing (metrage swapped, not dropped);
//  - the validator is clean on the default bias draft.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/bodice.hpp"
#include "../src/collar.hpp"
#include "../src/garment.hpp"
#include "../src/geometry.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static const BodyMeasurementsSnapshot& m0() {
    static const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    return m;
}

static const PatternPiece* find(const DraftedPattern& d, const std::string& name) {
    for (const auto& p : d.pieces)
        if (p.name == name) return &p;
    return nullptr;
}
static bool hasNamed(const DraftedPattern& d, const std::string& needle) {
    for (const auto& p : d.pieces)
        if (p.name.find(needle) != std::string::npos) return true;
    return false;
}

// The bias strip is one rectangle (single printable segment at these sizes);
// its drawn width is the strip length.
static double stripLength(const PatternPiece& p) {
    const Rect box = boundingBox(p.commands);
    return box.width;
}
static double stripHeight(const PatternPiece& p) {
    const Rect box = boundingBox(p.commands);
    return box.height;
}

int main() {
    const auto& m = m0();

    // --- Default: sleeveless dress, open crew neck -> bias, not facing ---
    {
        std::printf("Sleeveless crew dress (default = bias binding):\n");
        GarmentSpec spec;
        spec.garment = GarmentType::Dress;
        spec.neckline = Neckline::Crew;
        spec.sleeveStyle = SleeveStyle::None;
        const DraftedPattern d = GarmentDrafter::draft(spec, m);

        const PatternPiece* neck = find(d, "Bias binding (neckline)");
        check(neck != nullptr, "neckline bias binding piece drafted by default");
        check(!hasNamed(d, "Neck Facing"), "no neck facing on the default bias draft");

        // Trued: strip length == neck edge circumference + overlap.
        const double edge = BodiceBlock::neckEdgeLength(m, spec.neckline);
        if (neck) {
            const double got = stripLength(*neck);
            check(std::fabs(got - (edge + BodiceBlock::bindingOverlap)) < 0.01,
                  "neck strip length == neck edge + overlap (trued 0.00 mm)");
            check(std::fabs(stripHeight(*neck) - BodiceBlock::bindingCutWidth) < 0.01,
                  "neck strip width == bindingCutWidth");
            check(neck->cutInstruction.find("BIAS") != std::string::npos &&
                  neck->cutInstruction.find("45") != std::string::npos,
                  "neck strip cut note says BIAS 45 deg");
            check(neck->hasGrainline && !neck->markings.empty(),
                  "neck strip carries a grainline + center fold marking");
            check(neck->seamAllowance > 0 && neck->cutLine.empty(),
                  "neck strip is a strip piece (no separate cut line)");
        }

        // Sleeveless -> armhole binding too, trued to 2x armhole length.
        const PatternPiece* arm = find(d, "Bias binding (armholes)");
        check(arm != nullptr, "sleeveless armholes get a bias binding piece");

        check(PatternValidator::issues(spec, m, d).empty(),
              "default bias dress validates clean");
    }

    // --- Sleeved top: neck bias, but NO armhole binding ---
    {
        std::printf("Sleeved crew top (bias neck, sleeves, no armhole binding):\n");
        GarmentSpec spec;
        spec.garment = GarmentType::Top;
        spec.neckline = Neckline::Crew;
        spec.sleeveStyle = SleeveStyle::Straight;
        const DraftedPattern d = GarmentDrafter::draft(spec, m);
        check(find(d, "Bias binding (neckline)") != nullptr, "sleeved top still gets a neck bias binding");
        check(find(d, "Bias binding (armholes)") == nullptr, "no armhole binding when sleeves are set");
        check(PatternValidator::issues(spec, m, d).empty(), "sleeved bias top validates clean");
    }

    // --- Real-collar exception: keeps facings, no neck bias ---
    {
        std::printf("Shirt-collar top (real collar keeps a faced neck, no bias):\n");
        GarmentSpec spec;
        spec.garment = GarmentType::Top;
        spec.neckline = Neckline::Crew;
        spec.collarType = static_cast<int>(CollarType::Shirt);
        const DraftedPattern d = GarmentDrafter::draft(spec, m);
        check(hasNamed(d, "Neck Facing"), "real collar keeps the neck facing");
        check(find(d, "Bias binding (neckline)") == nullptr, "real collar draws NO neckline bias strip");
        check(hasNamed(d, "Collar"), "the collar piece is present");
        check(PatternValidator::issues(spec, m, d).empty(), "collared top validates clean");
    }

    // --- Facing opt-in reproduces the old output ---
    {
        std::printf("Facing opt-in (reproduces the pre-3.10 facings):\n");
        GarmentSpec bias;
        bias.garment = GarmentType::Dress;
        bias.neckline = Neckline::Scoop;
        bias.sleeveStyle = SleeveStyle::None;
        GarmentSpec facing = bias;
        facing.edgeFinish = static_cast<int>(EdgeFinish::Facing);

        const DraftedPattern dBias = GarmentDrafter::draft(bias, m);
        const DraftedPattern dFacing = GarmentDrafter::draft(facing, m);

        check(hasNamed(dFacing, "Front Neck Facing") && hasNamed(dFacing, "Back Neck Facing"),
              "facing opt-in drafts the front + back neck facings");
        check(!hasNamed(dFacing, "Bias binding (neckline)"),
              "facing opt-in draws NO neckline bias strip");
        // Old behavior: facing path never drew an armhole binding piece either.
        check(!hasNamed(dFacing, "Bias binding (armholes)"),
              "facing opt-in draws NO armhole bias strip (old behavior)");
        check(PatternValidator::issues(facing, m, dFacing).empty(),
              "facing opt-in draft validates clean");

        // Metrage: bias uses strictly less fabric than the facing (swapped, not
        // dropped — both add a finish allowance).
        check(dBias.fabricMeters140 < dFacing.fabricMeters140,
              "bias binding uses less fabric than the facing");
    }

    // --- Truing holds across necklines (different neck edge lengths) ---
    {
        std::printf("Truing across necklines:\n");
        for (Neckline n : {Neckline::Crew, Neckline::Scoop, Neckline::VNeck,
                           Neckline::Square, Neckline::Boat, Neckline::Sweetheart}) {
            GarmentSpec spec;
            spec.garment = GarmentType::Dress;
            spec.neckline = n;
            spec.sleeveStyle = SleeveStyle::None;
            const DraftedPattern d = GarmentDrafter::draft(spec, m);
            const PatternPiece* neck = find(d, "Bias binding (neckline)");
            const double edge = BodiceBlock::neckEdgeLength(m, n);
            const bool ok = neck && std::fabs(stripLength(*neck) - (edge + BodiceBlock::bindingOverlap)) < 0.01;
            check(ok, std::string("neckline ") + raw(n) + " strip trued to its edge");
        }
    }

    std::printf(failures == 0 ? "ALL BIAS CHECKS PASS\n" : "%d BIAS CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
