// Guide <-> piece two-way check: across a broad spec sweep, (a) no ORPHAN
// piece (drafted but never mentioned by a guide step), (b) no PHANTOM step
// (names a separable piece category the draft doesn't contain), (c) a dart
// draft's guide never says princess/gore.
#include <cstdio>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/guiderefs.hpp"

using namespace stitchu;

static int failures = 0;
static int checked = 0;

static void audit(const GarmentSpec& spec, const std::string& label) {
    const BodyMeasurementsSnapshot m{88, 70, 94, 37, 40.5, 58, 35};
    const DraftedPattern p = GarmentDrafter::draft(spec, m);
    const GuideAudit a = auditGuide(p);
    checked++;
    for (const auto& orphan : a.orphanPieces) {
        std::printf("  [FAIL] %s: ORPHAN piece '%s' (no guide step mentions it)\n", label.c_str(), orphan.c_str());
        failures++;
    }
    for (const auto& phantom : a.phantomSteps) {
        std::printf("  [FAIL] %s: PHANTOM step: %s\n", label.c_str(), phantom.c_str());
        failures++;
    }
    if (spec.shaping == Shaping::Dart) {
        for (const auto& step : p.guideSteps) {
            if (step.find("princess") != std::string::npos || step.find("gore") != std::string::npos) {
                std::printf("  [FAIL] %s: dart guide mentions princess/gore: %s\n", label.c_str(), step.c_str());
                failures++;
            }
        }
    }
}

int main() {
    std::printf("guide_check: guide <-> piece two-way audit\n");

    for (const auto shaping : {Shaping::Dart, Shaping::Princess}) {
        // dresses: necklines x sleeves x skirt styles
        for (const auto neck : {Neckline::Crew, Neckline::VNeck, Neckline::Sweetheart,
                                Neckline::Halter, Neckline::Cowl, Neckline::PussyBow}) {
            for (const auto sleeve : {SleeveStyle::None, SleeveStyle::Straight, SleeveStyle::Balloon}) {
                for (const auto skirt : {SkirtStyle::ALine, SkirtStyle::Gathered, SkirtStyle::Pleated,
                                         SkirtStyle::HalfCircle}) {
                    GarmentSpec s;
                    s.garment = GarmentType::Dress;
                    s.shaping = shaping;
                    s.neckline = neck;
                    s.sleeveStyle = sleeve;
                    s.skirtStyle = skirt;
                    audit(s, std::string("dress/") + raw(shaping) + "/" + raw(neck) + "/" + raw(sleeve) + "/" + raw(skirt));
                }
            }
        }
        // skirts + tops (plain)
        for (const auto skirt : {SkirtStyle::ALine, SkirtStyle::Straight, SkirtStyle::Gathered,
                                 SkirtStyle::HalfCircle, SkirtStyle::Pleated}) {
            GarmentSpec s;
            s.garment = GarmentType::Skirt;
            s.shaping = shaping;
            s.skirtStyle = skirt;
            audit(s, std::string("skirt/") + raw(shaping) + "/" + raw(skirt));
        }
        {
            GarmentSpec s;
            s.garment = GarmentType::Top;
            s.shaping = shaping;
            s.sleeveStyle = SleeveStyle::Straight;
            audit(s, std::string("top/") + raw(shaping));
        }
    }

    // opt-in post-passes, one at a time on a host dress (sleeved where needed)
    auto host = [](void (*mutate)(GarmentSpec&), const char* label) {
        GarmentSpec s;
        s.garment = GarmentType::Dress;
        mutate(s);
        audit(s, label);
    };
    host([](GarmentSpec& s) { s.ruffleHem = true; s.ruffleTiers = 2; }, "opt/ruffleHem");
    host([](GarmentSpec& s) { s.keyhole = true; }, "opt/keyhole");
    host([](GarmentSpec& s) { s.frontPlacket = true; }, "opt/frontPlacket");
    host([](GarmentSpec& s) { s.tieClosure = 2; }, "opt/backWaistBow");
    host([](GarmentSpec& s) { s.sleeveStyle = SleeveStyle::Straight; s.sleeveCap = SleeveCap::Puffed; }, "opt/puffedCap");
    host([](GarmentSpec& s) { s.sleeveStyle = SleeveStyle::Straight; s.sleeveCap = SleeveCap::Cap; }, "opt/capSleeve");
    host([](GarmentSpec& s) { s.collarType = 4; }, "opt/peterPan");
    host([](GarmentSpec& s) { s.gatherType = 2; s.gatherZone = 0; }, "opt/shirredNeck");
    host([](GarmentSpec& s) { s.backOpening = 1; }, "opt/openBack");
    host([](GarmentSpec& s) { s.backSlit = 2; s.skirtStyle = SkirtStyle::Straight; }, "opt/backSlit");
    host([](GarmentSpec& s) { s.ruffledStraps = 1; }, "opt/ruffledStraps");
    host([](GarmentSpec& s) { s.peplum = 1; s.garment = GarmentType::Top; }, "opt/peplumTop");
    host([](GarmentSpec& s) { s.placketStyle = 2; }, "opt/asymPlacket");
    host([](GarmentSpec& s) { s.edgeFinish = 1; }, "opt/facingFinish");
    host([](GarmentSpec& s) { s.pocketStyle = 1; }, "opt/patchPocket");
    host([](GarmentSpec& s) { s.pocketStyle = 2; }, "opt/sideSeamPocket");
    host([](GarmentSpec& s) { s.sleeveStyle = SleeveStyle::Straight; s.sleeveLength = SleeveLength::Long; s.cuffStyle = 1; }, "opt/buttonCuff");
    host([](GarmentSpec& s) { s.hemShape = 1; }, "opt/shirttail");
    host([](GarmentSpec& s) { s.sleeveStyle = SleeveStyle::Straight; s.shoulderStyle = 2; }, "opt/raglan");
    host([](GarmentSpec& s) { s.buttonRow = 1; }, "opt/buttonRowFunctional");
    host([](GarmentSpec& s) { s.exposedZip = 2; }, "opt/exposedZipCB");
    host([](GarmentSpec& s) { s.backDetail = 2; }, "opt/backCape");
    host([](GarmentSpec& s) { s.bardotStyle = 2; }, "opt/bardotFrill");

    std::printf("guide_check: %d drafts audited, %s (%d failures)\n",
                checked, failures ? "FAIL" : "ALL PASS", failures);
    return failures ? 1 : 0;
}
