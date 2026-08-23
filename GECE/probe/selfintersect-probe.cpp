// F-N diagnostic (scratch, not a gate): mirror the sewable_census matrix and
// print WHICH cells the 270 selfintersect drafts fall in — piece, body, and each
// spec axis — plus the crossing coordinates. Read-only; changes no engine code.
#include <cstdio>
#include <map>
#include <string>
#include <vector>

#include "../../engine/src/garment.hpp"
#include "../../engine/src/geometry.hpp"
#include "../../engine/src/validator.hpp"

using namespace stitchu;

struct Body { std::string name; BodyMeasurementsSnapshot m; };
static Body body(const char* n, double bust, double waist, double hip, double sh,
                 double bl, double arm, double neck) {
    return {n, {bust, waist, hip, sh, bl, arm, neck}};
}

int main() {
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
        SkirtStyle::ALine, SkirtStyle::Straight, SkirtStyle::Gathered,
        SkirtStyle::HalfCircle, SkirtStyle::Pleated, SkirtStyle::Gore};
    const std::vector<SkirtLength> skirtLengths = {SkirtLength::Mini, SkirtLength::Midi, SkirtLength::Maxi};
    const std::vector<Neckline> necklines = {
        Neckline::Crew, Neckline::Scoop, Neckline::VNeck, Neckline::Square,
        Neckline::Boat, Neckline::Sweetheart, Neckline::Halter};
    const std::vector<TopLength> topLengths = {TopLength::Cropped, TopLength::Hip, TopLength::Tunic};
    const std::vector<std::pair<SleeveStyle, SleeveLength>> sleeveCombos = {
        {SleeveStyle::None, SleeveLength::Short},
        {SleeveStyle::Straight, SleeveLength::Short},
        {SleeveStyle::Straight, SleeveLength::Long},
        {SleeveStyle::Balloon, SleeveLength::Short},
        {SleeveStyle::Balloon, SleeveLength::Elbow},
    };
    const std::vector<Shaping> shapings = {Shaping::Princess, Shaping::Dart};
    const std::vector<Waistline> waistlines = {Waistline::Natural, Waistline::Empire};
    const std::vector<Fabric> fabrics = {Fabric::Woven, Fabric::Knit};

    std::vector<std::pair<std::string, GarmentSpec>> specs;
    for (auto fabric : fabrics) for (auto shaping : shapings)
    for (auto style : skirtStyles) for (auto length : skirtLengths) {
        GarmentSpec s; s.garment = GarmentType::Skirt; s.shaping = shaping;
        s.fabric = fabric; s.skirtStyle = style; s.skirtLength = length;
        specs.push_back({std::string("skirt/") + raw(fabric) + "/" + raw(shaping) + "/" + raw(style) + "/" + raw(length), s});
    }
    for (auto neckline : necklines) for (auto fabric : fabrics) for (auto shaping : shapings) {
        for (auto waistline : waistlines) for (auto style : skirtStyles)
        for (auto skirtLength : skirtLengths) for (const auto& sc : sleeveCombos) {
            GarmentSpec s; s.garment = GarmentType::Dress; s.shaping = shaping;
            s.waistline = waistline; s.fabric = fabric; s.neckline = neckline;
            s.skirtStyle = style; s.skirtLength = skirtLength;
            s.sleeveStyle = sc.first; s.sleeveLength = sc.second;
            specs.push_back({std::string("dress/") + raw(fabric) + "/" + raw(shaping) + "/" + raw(waistline) + "/" + raw(neckline) + "/" + raw(style) + "/" + raw(skirtLength) + "/" + raw(sc.first) + "." + raw(sc.second), s});
        }
        for (auto topLength : topLengths) for (const auto& sc : sleeveCombos) {
            GarmentSpec s; s.garment = GarmentType::Top; s.shaping = shaping;
            s.fabric = fabric; s.neckline = neckline; s.topLength = topLength;
            s.sleeveStyle = sc.first; s.sleeveLength = sc.second;
            specs.push_back({std::string("top/") + raw(fabric) + "/" + raw(shaping) + "/" + raw(neckline) + "/" + raw(topLength) + "/" + raw(sc.first) + "." + raw(sc.second), s});
        }
    }

    std::map<std::string, int> byPiece, byBody, byGarment, byNeck, bySleeve,
        byShaping, bySkirt, byFabric, byWaist, byTopLen, bySkirtLen, byDetail;
    int hits = 0;
    std::vector<std::string> sample;
    for (const auto& b : bodies) {
        for (const auto& ls : specs) {
            const auto& label = ls.first;
            const auto& spec = ls.second;
            const DraftedPattern draft = GarmentDrafter::draft(spec, b.m);
            for (const auto& iss : PatternValidator::issues(spec, b.m, draft)) {
                if (iss.rule != "selfintersect") continue;
                ++hits;
                byPiece[iss.piece]++;
                byBody[b.name]++;
                byGarment[raw(spec.garment)]++;
                byNeck[raw(spec.neckline)]++;
                bySleeve[std::string(raw(spec.sleeveStyle)) + "." + raw(spec.sleeveLength)]++;
                byShaping[raw(spec.shaping)]++;
                bySkirt[raw(spec.skirtStyle)]++;
                bySkirtLen[raw(spec.skirtLength)]++;
                byFabric[raw(spec.fabric)]++;
                byWaist[raw(spec.waistline)]++;
                byTopLen[raw(spec.topLength)]++;
                byDetail[iss.detail]++;
                if (sample.size() < 12) sample.push_back(b.name + " " + label + " :: " + iss.piece + " :: " + iss.detail);
            }
        }
    }
    auto dump = [](const char* t, const std::map<std::string,int>& m) {
        std::printf("\n%s\n", t);
        for (const auto& kv : m) std::printf("  %-40s %5d\n", kv.first.c_str(), kv.second);
    };
    std::printf("selfintersect hits: %d\n", hits);
    dump("BY PIECE", byPiece);
    dump("BY BODY", byBody);
    dump("BY GARMENT", byGarment);
    dump("BY NECKLINE", byNeck);
    dump("BY SLEEVE", bySleeve);
    dump("BY SHAPING", byShaping);
    dump("BY SKIRT STYLE", bySkirt);
    dump("BY SKIRT LENGTH", bySkirtLen);
    dump("BY TOP LENGTH", byTopLen);
    dump("BY WAISTLINE", byWaist);
    dump("BY FABRIC", byFabric);
    dump("BY DETAIL (crossing site)", byDetail);
    std::printf("\nSAMPLES\n");
    for (const auto& s : sample) std::printf("  %s\n", s.c_str());
    return 0;
}
