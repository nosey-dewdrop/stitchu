// Engine validation harness: drafts every garment spec the app can produce
// across a realistic EU 34-52 size matrix plus edge-case bodies, and runs the
// validator on each result. Port of engine-check/main.swift — same 2805 drafts.
#include <cstdio>
#include <map>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

namespace {

struct Body {
    std::string name;
    BodyMeasurementsSnapshot m;
};

Body body(const char* name, double bust, double waist, double hip, double shoulder,
          double backLength, double arm, double neck) {
    return {name, {bust, waist, hip, shoulder, backLength, arm, neck}};
}

} // namespace

int main() {
    // EU size chart (German convention) + edge cases.
    const std::vector<Body> bodies = {
        body("EU34", 80, 62, 86, 36, 39.5, 57, 34),
        body("EU36", 84, 66, 90, 36.5, 40, 57.5, 34.5),
        body("EU38", 88, 70, 94, 37, 40.5, 58, 35),
        body("EU40", 92, 74, 98, 37.5, 41, 58.5, 36),
        body("EU42", 96, 78, 102, 38, 41.5, 59, 36.5),
        body("EU44", 100, 82, 106, 38.5, 42, 59.5, 37),
        body("EU46", 104, 86, 110, 39, 42, 60, 38),
        body("EU48", 110, 92, 116, 40, 42.5, 60.5, 39),
        body("EU50", 116, 98, 122, 41, 43, 61, 40),
        body("EU52", 122, 104, 128, 42, 43.5, 61.5, 41),
        body("tall", 92, 74, 98, 39, 47, 66, 36),
        body("petite", 84, 64, 90, 34, 33, 49, 33),
        body("pear", 96, 70, 116, 37, 41, 58, 36),
        body("apple", 118, 112, 104, 40, 42, 60, 40),
        body("bigNeckSmallShoulder", 100, 84, 104, 30, 40, 58, 50),
    };

    const std::vector<SkirtStyle> skirtStyles = {
        SkirtStyle::ALine, SkirtStyle::Straight, SkirtStyle::Gathered, SkirtStyle::HalfCircle};
    const std::vector<SkirtLength> skirtLengths = {SkirtLength::Mini, SkirtLength::Midi, SkirtLength::Maxi};
    const std::vector<Neckline> necklines = {
        Neckline::Crew, Neckline::Scoop, Neckline::VNeck, Neckline::Square, Neckline::Boat};
    const std::vector<TopLength> topLengths = {TopLength::Cropped, TopLength::Hip, TopLength::Tunic};
    const std::vector<std::pair<SleeveStyle, SleeveLength>> sleeveCombos = {
        {SleeveStyle::None, SleeveLength::Short},
        {SleeveStyle::Straight, SleeveLength::Short},
        {SleeveStyle::Straight, SleeveLength::Long},
        {SleeveStyle::Balloon, SleeveLength::Short},
        {SleeveStyle::Balloon, SleeveLength::Elbow},
    };

    // Shaped garments run in BOTH shapings: princess (default) and dart
    // (advanced + golden-diff reference). Tops draft dart-only for now.
    const std::vector<Shaping> shapings = {Shaping::Princess, Shaping::Dart};

    std::vector<std::pair<std::string, GarmentSpec>> specs;
    for (auto shaping : shapings) {
        for (auto style : skirtStyles) {
            for (auto length : skirtLengths) {
                GarmentSpec spec;
                spec.garment = GarmentType::Skirt;
                spec.shaping = shaping;
                spec.skirtStyle = style;
                spec.skirtLength = length;
                specs.push_back({std::string("skirt/") + raw(shaping) + "/" + raw(style) + "/" + raw(length), spec});
            }
        }
    }
    for (auto neckline : necklines) {
        for (auto shaping : shapings) {
            for (auto style : skirtStyles) {
                for (const auto& [sleeve, sleeveLength] : sleeveCombos) {
                    GarmentSpec spec;
                    spec.garment = GarmentType::Dress;
                    spec.shaping = shaping;
                    spec.neckline = neckline;
                    spec.skirtStyle = style;
                    spec.skirtLength = SkirtLength::Midi;
                    spec.sleeveStyle = sleeve;
                    spec.sleeveLength = sleeveLength;
                    specs.push_back({std::string("dress/") + raw(shaping) + "/" + raw(neckline) + "/" + raw(style) + "/" + raw(sleeve) + "." + raw(sleeveLength), spec});
                }
            }
        }
        for (auto shaping : shapings) {
            for (auto topLength : topLengths) {
                for (const auto& [sleeve, sleeveLength] : sleeveCombos) {
                    GarmentSpec spec;
                    spec.garment = GarmentType::Top;
                    spec.shaping = shaping;
                    spec.neckline = neckline;
                    spec.topLength = topLength;
                    spec.sleeveStyle = sleeve;
                    spec.sleeveLength = sleeveLength;
                    specs.push_back({std::string("top/") + raw(shaping) + "/" + raw(neckline) + "/" + raw(topLength) + "/" + raw(sleeve) + "." + raw(sleeveLength), spec});
                }
            }
        }
    }

    int drafts = 0;
    int failures = 0;
    std::map<std::string, int> ruleCounts;
    std::vector<std::string> examples;

    for (const auto& b : bodies) {
        for (const auto& [label, spec] : specs) {
            const DraftedPattern draft = GarmentDrafter::draft(spec, b.m);
            const auto issues = PatternValidator::issues(spec, b.m, draft);
            ++drafts;
            if (!issues.empty()) {
                ++failures;
                for (const auto& issue : issues) {
                    ruleCounts[issue.rule] += 1;
                    if (examples.size() < 40) {
                        examples.push_back(b.name + " " + label + ": " + issue.description());
                    }
                }
            }
        }
    }

    std::printf("engine check: %d drafts across %zu bodies x %zu specs\n", drafts, bodies.size(), specs.size());
    if (failures == 0) {
        std::printf("ALL PASS\n");
        return 0;
    }
    std::printf("FAILED drafts: %d\n", failures);
    for (const auto& [rule, count] : ruleCounts) {
        std::printf("  rule %s: %d violations\n", rule.c_str(), count);
    }
    std::printf("examples:\n");
    for (const auto& example : examples) {
        std::printf("  %s\n", example.c_str());
    }
    return 1;
}
