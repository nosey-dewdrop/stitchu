// WASM boundary: garment spec + measurements in, DraftedPattern out as JSON.
// JSON only exists at this boundary; the engine itself stays plain structs.
#include <emscripten/bind.h>

#include <algorithm>
#include <string>

#include "../src/garment.hpp"
#include "../src/sizechart.hpp"
#include "../src/validator.hpp"

namespace {

using namespace stitchu;

std::string escape(const std::string& s) {
    std::string out;
    out.reserve(s.size() + 8);
    for (char c : s) {
        if (c == '"' || c == '\\') { out.push_back('\\'); out.push_back(c); }
        else if (c == '\n') { out += "\\n"; }
        else { out.push_back(c); }
    }
    return out;
}

std::string num(double v) {
    char buf[32];
    std::snprintf(buf, sizeof(buf), "%.4f", v);
    return buf;
}

std::string commandsJSON(const std::vector<PathCommand>& commands) {
    std::string out = "[";
    for (size_t i = 0; i < commands.size(); ++i) {
        const auto& cmd = commands[i];
        if (i) out += ",";
        switch (cmd.type) {
            case CmdType::Move:
                out += R"({"type":"move","x":)" + num(cmd.to.x) + R"(,"y":)" + num(cmd.to.y) + "}";
                break;
            case CmdType::Line:
                out += R"({"type":"line","x":)" + num(cmd.to.x) + R"(,"y":)" + num(cmd.to.y) + "}";
                break;
            case CmdType::Curve:
                out += R"({"type":"curve","x":)" + num(cmd.to.x) + R"(,"y":)" + num(cmd.to.y) +
                       R"(,"cp1x":)" + num(cmd.cp1.x) + R"(,"cp1y":)" + num(cmd.cp1.y) +
                       R"(,"cp2x":)" + num(cmd.cp2.x) + R"(,"cp2y":)" + num(cmd.cp2.y) + "}";
                break;
            case CmdType::Close:
                out += R"({"type":"close"})";
                break;
        }
    }
    return out + "]";
}

Neckline necklineFrom(const std::string& s) {
    if (s == "scoop") return Neckline::Scoop;
    if (s == "vNeck") return Neckline::VNeck;
    if (s == "square") return Neckline::Square;
    if (s == "boat") return Neckline::Boat;
    if (s == "sweetheart") return Neckline::Sweetheart;
    if (s == "halter") return Neckline::Halter;
    return Neckline::Crew;
}
SkirtStyle skirtStyleFrom(const std::string& s) {
    if (s == "pleated") return SkirtStyle::Pleated;
    if (s == "straight") return SkirtStyle::Straight;
    if (s == "gathered") return SkirtStyle::Gathered;
    if (s == "halfCircle") return SkirtStyle::HalfCircle;
    return SkirtStyle::ALine;
}
SkirtLength skirtLengthFrom(const std::string& s) {
    if (s == "mini") return SkirtLength::Mini;
    if (s == "maxi") return SkirtLength::Maxi;
    return SkirtLength::Midi;
}
SleeveStyle sleeveStyleFrom(const std::string& s) {
    if (s == "straight") return SleeveStyle::Straight;
    if (s == "balloon") return SleeveStyle::Balloon;
    return SleeveStyle::None;
}
SleeveLength sleeveLengthFrom(const std::string& s) {
    if (s == "elbow") return SleeveLength::Elbow;
    if (s == "long") return SleeveLength::Long;
    return SleeveLength::Short;
}
GarmentType garmentFrom(const std::string& s) {
    if (s == "skirt") return GarmentType::Skirt;
    if (s == "top") return GarmentType::Top;
    return GarmentType::Dress;
}
TopLength topLengthFrom(const std::string& s) {
    if (s == "cropped") return TopLength::Cropped;
    if (s == "tunic") return TopLength::Tunic;
    return TopLength::Hip;
}
Shaping shapingFrom(const std::string& s) {
    if (s == "dart") return Shaping::Dart;
    return Shaping::Princess;
}
Waistline waistlineFrom(const std::string& s) {
    if (s == "empire") return Waistline::Empire;
    return Waistline::Natural;
}
Fabric fabricFrom(const std::string& s) {
    if (s == "knit") return Fabric::Knit;
    return Fabric::Woven;
}

// Returns {"pattern": {...}, "issues": [...]} — issues non-empty means the
// runtime safety net caught an invalid draft; the UI must not show the PDF.
GarmentSpec buildSpec(
    const std::string& garment, const std::string& shaping, const std::string& waistline,
    const std::string& fabric, const std::string& neckline,
    const std::string& sleeveStyle, const std::string& sleeveLength,
    const std::string& skirtStyle, const std::string& skirtLength, const std::string& topLength,
    bool ruffleHem, int ruffleTiers, bool keyhole
) {
    GarmentSpec spec;
    spec.garment = garmentFrom(garment);
    spec.shaping = shapingFrom(shaping);
    spec.waistline = waistlineFrom(waistline);
    spec.fabric = fabricFrom(fabric);
    spec.neckline = necklineFrom(neckline);
    spec.sleeveStyle = sleeveStyleFrom(sleeveStyle);
    spec.sleeveLength = sleeveLengthFrom(sleeveLength);
    spec.skirtStyle = skirtStyleFrom(skirtStyle);
    spec.skirtLength = skirtLengthFrom(skirtLength);
    spec.topLength = topLengthFrom(topLength);
    spec.ruffleHem = ruffleHem;
    spec.ruffleTiers = ruffleTiers; // engine clamps 1..5; fullness/depth stay engine defaults
    spec.keyhole = keyhole;
    return spec;
}

// The {pattern, issues} JSON for one drafted body — shared by draftJSON and the
// per-size entries of gradeJSON.
std::string patternJSON(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m) {
    const DraftedPattern draft = GarmentDrafter::draft(spec, m);
    const auto issues = PatternValidator::issues(spec, m, draft);

    std::string out = R"({"pattern":{"garment":")" + escape(draft.garment) + "\"";
    out += R"(,"fabricAdviceKey":")" + escape(draft.fabricAdviceKey) + "\"";
    out += R"(,"fabricMeters140":)" + num(draft.fabricMeters140);
    out += R"(,"guideSteps":[)";
    for (size_t i = 0; i < draft.guideSteps.size(); ++i) {
        if (i) out += ",";
        out += "\"" + escape(draft.guideSteps[i]) + "\"";
    }
    out += R"(],"pieces":[)";
    for (size_t i = 0; i < draft.pieces.size(); ++i) {
        const auto& piece = draft.pieces[i];
        if (i) out += ",";
        out += R"({"name":")" + escape(piece.name) + "\"";
        out += R"(,"cutInstruction":")" + escape(piece.cutInstruction) + "\"";
        out += R"(,"seamAllowance":)" + num(piece.seamAllowance);
        if (piece.hasGrainline) {
            out += R"(,"grainline":{"fromX":)" + num(piece.grainline.from.x) +
                   R"(,"fromY":)" + num(piece.grainline.from.y) +
                   R"(,"toX":)" + num(piece.grainline.to.x) +
                   R"(,"toY":)" + num(piece.grainline.to.y) + "}";
        }
        out += R"(,"commands":)" + commandsJSON(piece.commands);
        out += R"(,"markings":)" + commandsJSON(piece.markings);
        out += R"(,"cutLine":)" + commandsJSON(piece.cutLine);
        out += "}";
    }
    out += R"(]},"issues":[)";
    for (size_t i = 0; i < issues.size(); ++i) {
        if (i) out += ",";
        out += "\"" + escape(issues[i].description()) + "\"";
    }
    out += "]}";
    return out;
}

std::string draftJSON(
    std::string garment, std::string shaping, std::string waistline, std::string fabric,
    std::string neckline,
    std::string sleeveStyle, std::string sleeveLength,
    std::string skirtStyle, std::string skirtLength, std::string topLength,
    bool ruffleHem, int ruffleTiers, bool keyhole,
    double bustCM, double waistCM, double hipCM, double shoulderCM,
    double backLengthCM, double armLengthCM, double neckCM,
    double upperBustCM
) {
    const GarmentSpec spec = buildSpec(garment, shaping, waistline, fabric, neckline,
        sleeveStyle, sleeveLength, skirtStyle, skirtLength, topLength, ruffleHem, ruffleTiers, keyhole);
    BodyMeasurementsSnapshot m{bustCM, waistCM, hipCM, shoulderCM, backLengthCM, armLengthCM, neckCM};
    m.upperBustCM = upperBustCM; // optional full-bust adjustment; 0 = old behaviour
    return patternJSON(spec, m);
}

// Grade one design across a range of standard EU sizes (fromLabel..toLabel,
// inclusive). Returns {"sizes":[{"size":"EU38","pattern":{...},"issues":[...]}, ...]}.
// This is the seller/brand deliverable: one design, a whole size run, from the
// same engine that fits a custom body — no manual grade rules to maintain.
std::string gradeJSON(
    std::string garment, std::string shaping, std::string waistline, std::string fabric,
    std::string neckline,
    std::string sleeveStyle, std::string sleeveLength,
    std::string skirtStyle, std::string skirtLength, std::string topLength,
    bool ruffleHem, int ruffleTiers, bool keyhole,
    std::string fromLabel, std::string toLabel
) {
    const GarmentSpec spec = buildSpec(garment, shaping, waistline, fabric, neckline,
        sleeveStyle, sleeveLength, skirtStyle, skirtLength, topLength, ruffleHem, ruffleTiers, keyhole);

    const auto& chart = euSizeChart();
    // Find the index range; default to the whole chart if a label is unknown.
    size_t lo = 0, hi = chart.size() ? chart.size() - 1 : 0;
    for (size_t i = 0; i < chart.size(); ++i) {
        if (chart[i].label == fromLabel) lo = i;
        if (chart[i].label == toLabel) hi = i;
    }
    if (lo > hi) std::swap(lo, hi);

    std::string out = R"({"sizes":[)";
    for (size_t i = lo; i <= hi && i < chart.size(); ++i) {
        if (i > lo) out += ",";
        const auto& b = chart[i].body;
        out += R"({"size":")" + escape(chart[i].label) + "\"";
        // The standard body for this size (cm) — the buyer picks their size by
        // their own measurements, so the size run must publish this chart.
        out += R"(,"body":{"bust":)" + num(b.bustCM) + R"(,"waist":)" + num(b.waistCM) +
               R"(,"hip":)" + num(b.hipCM) + "}";
        out += R"(,"draft":)";
        out += patternJSON(spec, b);
        out += "}";
    }
    out += "]}";
    return out;
}

} // namespace

EMSCRIPTEN_BINDINGS(stitchu_engine) {
    emscripten::function("draftJSON", &draftJSON);
    emscripten::function("gradeJSON", &gradeJSON);
}
