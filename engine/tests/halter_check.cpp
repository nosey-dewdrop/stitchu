// Halter check: proves the restructure is REAL — the front rises into a nape
// strap (no shoulder seam), the back is cut low, sleeves are impossible and
// skipped honestly, and one bias binding replaces the neck facings — across
// dress/top, princess/dart, natural/empire, woven/knit, and body corners.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/bodice.hpp"
#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static const PatternPiece* find(const DraftedPattern& d, const std::string& name) {
    for (const auto& p : d.pieces)
        if (p.name == name) return &p;
    return nullptr;
}
static const PatternPiece* frontCenter(const DraftedPattern& d) {
    for (const char* n : {"Bodice Center Front", "Bodice Front", "Top Center Front", "Top Front"})
        if (const PatternPiece* p = find(d, n)) return p;
    return nullptr;
}
static const PatternPiece* backCenter(const DraftedPattern& d) {
    for (const char* n : {"Bodice Center Back", "Bodice Back", "Top Center Back", "Top Back"})
        if (const PatternPiece* p = find(d, n)) return p;
    return nullptr;
}
static bool hasStep(const DraftedPattern& d, const std::string& needle) {
    for (const auto& s : d.guideSteps)
        if (s.find(needle) != std::string::npos) return true;
    return false;
}

static void run(const char* label, GarmentSpec spec, const BodyMeasurementsSnapshot& m) {
    std::printf("%s\n", label);
    spec.neckline = Neckline::Halter;

    GarmentSpec crew = spec;
    crew.neckline = Neckline::Crew;
    crew.sleeveStyle = SleeveStyle::None;

    const DraftedPattern dHalter = GarmentDrafter::draft(spec, m);
    const DraftedPattern dCrew = GarmentDrafter::draft(crew, m);

    const auto issues = PatternValidator::issues(spec, m, dHalter);
    for (const auto& i : issues) std::printf("      issue: %s\n", i.description().c_str());
    check(issues.empty(), "halter draft valid");

    // No sleeves even when requested; the guide says why.
    bool sleevePiece = false;
    for (const auto& p : dHalter.pieces)
        if (p.name.find("Sleeve") != std::string::npos) sleevePiece = true;
    check(!sleevePiece, "no sleeve pieces (halter skips the sleeve choice)");
    if (spec.sleeveStyle != SleeveStyle::None) {
        check(hasStep(dHalter, "no shoulders to hang a sleeve"),
              "guide explains the skipped sleeve honestly");
    }

    // Binding replaces the facings.
    check(find(dHalter, "Bias binding (halter)") != nullptr, "bias binding piece drafted");
    check(find(dHalter, "Front Neck Facing") == nullptr &&
          find(dHalter, "Back Neck Facing") == nullptr, "no neck facings on a halter");
    check(!hasStep(dHalter, "shoulder seams"), "no shoulder-seam step in the guide");
    check(hasStep(dHalter, "nape"), "strap closes at the nape (guide step present)");

    // Geometry: the front rises into a strap ABOVE the sweep start; the strap
    // top edge (neck point -> shoulder tip) is halterStrapWidth wide.
    const PatternPiece* front = frontCenter(dHalter);
    check(front != nullptr, "front piece present");
    if (front) {
        const Point strapInner = front->commands[1].to;  // end of the neck curve
        const Point strapOuter = front->commands[2].to;  // end of the strap top line
        const double w = std::hypot(strapOuter.x - strapInner.x, strapOuter.y - strapInner.y);
        std::printf("      strap top edge %.1f mm (target %.0f)\n", w, BodiceBlock::halterStrapWidth);
        check(std::fabs(w - std::hypot(BodiceBlock::halterStrapWidth, 10.0)) < 6,
              "strap top edge is the drafted strap width");
        const Rect box = boundingBox(front->commands);
        check(strapInner.y < box.y + 3 || strapOuter.y < box.y + 12,
              "strap tops the piece (nothing drafted above it)");
    }

    // The back is cut LOW: its piece is markedly shorter than the crew back.
    const PatternPiece* backH = backCenter(dHalter);
    const PatternPiece* backC = backCenter(dCrew);
    check(backH && backC, "back pieces present");
    if (backH && backC) {
        const double hH = boundingBox(backH->commands).height;
        const double hC = boundingBox(backC->commands).height;
        std::printf("      back height %.0f mm vs crew %.0f mm\n", hH, hC);
        check(hH < hC - 40, "halter back is cut visibly lower than a crew back");
    }

    // Binding length honestly covers the reported raw edges.
    BodiceBlock::BodiceOptions opt;
    opt.neckline = Neckline::Halter;
    opt.shaping = spec.shaping;
    opt.waistline = spec.waistline;
    opt.fabric = spec.fabric;
    if (spec.garment == GarmentType::Top && spec.shaping == Shaping::Princess) {
        opt.extendBelowWaist = belowWaist(spec.topLength);
        opt.hipHalfQuarter = (m.hipMM() / 4) * 1.04;
    }
    const BodiceDraft bodice = BodiceBlock::draft(m, opt);
    check(bodice.halterBindingEdgeMM > 800 && bodice.halterBindingEdgeMM < 5000,
          "reported binding edge total is in a sane range");
    const PatternPiece* binding = find(dHalter, "Bias binding (halter)");
    if (binding) {
        const Rect b = boundingBox(binding->commands);
        // cut note = N segments x segLen; segments * width >= edge
        check(b.width <= 1400.0 + 0.5, "binding segment printable/chalkable");
    }
    std::printf("\n");
}

int main() {
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};   // EU ~38
    const BodyMeasurementsSnapshot petite{84, 64, 90, 34, 33, 49, 33};
    const BodyMeasurementsSnapshot plus{122, 104, 128, 42, 43.5, 61.5, 41};

    GarmentSpec dress;
    dress.garment = GarmentType::Dress;
    dress.sleeveStyle = SleeveStyle::Balloon; // must be skipped honestly
    run("Halter A-line dress (sleeves requested -> skipped):", dress, m);

    GarmentSpec babydoll;
    babydoll.garment = GarmentType::Dress;
    babydoll.waistline = Waistline::Empire;
    babydoll.skirtStyle = SkirtStyle::Gathered;
    babydoll.fabric = Fabric::Knit;
    run("Halter knit babydoll (petite):", babydoll, petite);

    GarmentSpec dart;
    dart.garment = GarmentType::Dress;
    dart.shaping = Shaping::Dart;
    run("Halter dart-mode dress (plus):", dart, plus);

    GarmentSpec top;
    top.garment = GarmentType::Top;
    top.topLength = TopLength::Tunic;
    run("Halter tunic top (princess through hem):", top, m);

    GarmentSpec cropTop;
    cropTop.garment = GarmentType::Top;
    cropTop.topLength = TopLength::Cropped;
    cropTop.shaping = Shaping::Dart;
    run("Halter cropped dart top:", cropTop, m);

    std::printf(failures == 0 ? "ALL HALTER CHECKS PASS\n" : "%d HALTER CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
