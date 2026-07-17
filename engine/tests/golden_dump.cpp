// C++ side of the golden dump: identical CSV format to engine-check/dump.swift.
// engine/golden-diff.py compares the two outputs within 0.1 mm.
#include <cstdio>
#include <string>
#include <vector>

#include "../src/garment.hpp"

using namespace stitchu;

namespace {

void dumpCommands(const char* kind, const std::vector<PathCommand>& commands, const std::string& prefix) {
    for (size_t i = 0; i < commands.size(); ++i) {
        const auto& cmd = commands[i];
        switch (cmd.type) {
            case CmdType::Move:
                std::printf("%s,%s,%zu,move,%.4f,%.4f\n", prefix.c_str(), kind, i, cmd.to.x, cmd.to.y);
                break;
            case CmdType::Line:
                std::printf("%s,%s,%zu,line,%.4f,%.4f\n", prefix.c_str(), kind, i, cmd.to.x, cmd.to.y);
                break;
            case CmdType::Curve:
                std::printf("%s,%s,%zu,curve,%.4f,%.4f,%.4f,%.4f,%.4f,%.4f\n", prefix.c_str(), kind, i,
                            cmd.to.x, cmd.to.y, cmd.cp1.x, cmd.cp1.y, cmd.cp2.x, cmd.cp2.y);
                break;
            case CmdType::Close:
                std::printf("%s,%s,%zu,close\n", prefix.c_str(), kind, i);
                break;
        }
    }
}

} // namespace

int main() {
    const std::vector<std::pair<std::string, BodyMeasurementsSnapshot>> bodies = {
        {"EU38", {88, 70, 94, 37, 40.5, 58, 35}},
        {"pear", {96, 70, 116, 37, 41, 58, 36}},
        {"bigNeckSmallShoulder", {100, 84, 104, 30, 40, 58, 50}},
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

    // The golden reference is the validated Swift engine, which drafts darts;
    // every spec pins shaping to Dart so the diff stays meaningful.
    std::vector<std::pair<std::string, GarmentSpec>> specs;
    for (auto style : skirtStyles) {
        for (auto length : skirtLengths) {
            GarmentSpec spec;
            spec.garment = GarmentType::Skirt;
            spec.shaping = Shaping::Dart; // + default natural waistline / woven fabric
            spec.skirtStyle = style;
            spec.skirtLength = length;
            specs.push_back({std::string("skirt/") + raw(style) + "/" + raw(length), spec});
        }
    }
    for (auto neckline : necklines) {
        for (auto style : skirtStyles) {
            for (const auto& [sleeve, sleeveLength] : sleeveCombos) {
                GarmentSpec spec;
                spec.garment = GarmentType::Dress;
                spec.shaping = Shaping::Dart;
                // Patch 3.10 made bias binding the default edge finish; the Swift
                // reference predates it and drafted facings. Pin Facing here so
                // the golden surface stays byte-identical AND this proves the
                // Facing opt-in reproduces the pre-3.10 output exactly.
                spec.edgeFinish = static_cast<int>(EdgeFinish::Facing);
                spec.neckline = neckline;
                spec.skirtStyle = style;
                spec.skirtLength = SkirtLength::Midi;
                spec.sleeveStyle = sleeve;
                spec.sleeveLength = sleeveLength;
                specs.push_back({std::string("dress/") + raw(neckline) + "/" + raw(style) + "/" + raw(sleeve) + "." + raw(sleeveLength), spec});
            }
        }
        for (auto topLength : topLengths) {
            for (const auto& [sleeve, sleeveLength] : sleeveCombos) {
                GarmentSpec spec;
                spec.garment = GarmentType::Top;
                spec.shaping = Shaping::Dart;
                spec.edgeFinish = static_cast<int>(EdgeFinish::Facing); // see dress note (3.10)
                spec.neckline = neckline;
                spec.topLength = topLength;
                spec.sleeveStyle = sleeve;
                spec.sleeveLength = sleeveLength;
                specs.push_back({std::string("top/") + raw(neckline) + "/" + raw(topLength) + "/" + raw(sleeve) + "." + raw(sleeveLength), spec});
            }
        }
    }

    for (const auto& [bodyName, m] : bodies) {
        for (const auto& [label, spec] : specs) {
            const DraftedPattern draft = GarmentDrafter::draft(spec, m);
            // Compare only the surface shared with the Swift reference: skip
            // the (post-Swift) neck facings and subtract their fabric adder.
            const double fabric = spec.garment == GarmentType::Skirt
                ? draft.fabricMeters140
                : draft.fabricMeters140 - BodiceBlock::facingFabricMeters;
            std::printf("%s|%s|fabric,%.4f\n", bodyName.c_str(), label.c_str(), fabric);
            size_t p = 0;
            for (const auto& piece : draft.pieces) {
                if (piece.name.find("Facing") != std::string::npos) continue;
                // The Swift reference carries a double-prefix bug ("Skirt Skirt
                // Panel...") that the C++ engine fixed post-port; mirror it so
                // the name metadata lines up and the diff stays about geometry.
                std::string dumpName = piece.name;
                if (spec.garment == GarmentType::Dress && dumpName == "Skirt Panel (quarter circle)") {
                    dumpName = "Skirt Skirt Panel (quarter circle)";
                }
                const std::string prefix = bodyName + "|" + label + "|piece" + std::to_string(p) + ":" + dumpName;
                dumpCommands("outline", piece.commands, prefix);
                dumpCommands("marking", piece.markings, prefix);
                ++p;
            }
        }
    }
    return 0;
}
