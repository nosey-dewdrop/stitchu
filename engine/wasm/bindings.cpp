// WASM boundary: garment spec + measurements in, DraftedPattern out as JSON.
// JSON only exists at this boundary; the engine itself stays plain structs.
#include <emscripten/bind.h>

#include <algorithm>
#include <string>

#include "../src/garment.hpp"
#include "../src/sizechart.hpp"
#include "../src/specparse.hpp"
#include "../src/validator.hpp"
#include "../src/vocab.gen.hpp"

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

// Every value parses through the generated vocabulary (engine/vocab.json).
// Unknown value -> std::invalid_argument, caught at the draftJSON/gradeJSON
// top level and returned as {"error": ...}. No silent defaults.
using namespace stitchu::vocab;
Neckline necklineFrom(const std::string& s) { return parseEnum<Neckline>("neckline", s, kNeckline, kNecklineCount); }
SkirtStyle skirtStyleFrom(const std::string& s) { return parseEnum<SkirtStyle>("skirtStyle", s, kSkirtStyle, kSkirtStyleCount); }
SkirtLength skirtLengthFrom(const std::string& s) { return parseEnum<SkirtLength>("skirtLength", s, kSkirtLength, kSkirtLengthCount); }
SleeveStyle sleeveStyleFrom(const std::string& s) { return parseEnum<SleeveStyle>("sleeveStyle", s, kSleeveStyle, kSleeveStyleCount); }
SleeveLength sleeveLengthFrom(const std::string& s) { return parseEnum<SleeveLength>("sleeveLength", s, kSleeveLength, kSleeveLengthCount); }
SleeveCap sleeveCapFrom(int v) { return static_cast<SleeveCap>(parseEnumInt("sleeveCap", v, kSleeveCap, kSleeveCapCount)); }
GarmentType garmentFrom(const std::string& s) { return parseEnum<GarmentType>("garment", s, kGarment, kGarmentCount); }
TopLength topLengthFrom(const std::string& s) { return parseEnum<TopLength>("topLength", s, kTopLength, kTopLengthCount); }
Shaping shapingFrom(const std::string& s) { return parseEnum<Shaping>("shaping", s, kShaping, kShapingCount); }
Waistline waistlineFrom(const std::string& s) { return parseEnum<Waistline>("waistline", s, kWaistline, kWaistlineCount); }
Fabric fabricFrom(const std::string& s) { return parseEnum<Fabric>("fabric", s, kFabric, kFabricCount); }

// Returns {"pattern": {...}, "issues": [...]} — issues non-empty means the
// runtime safety net caught an invalid draft; the UI must not show the PDF.
GarmentSpec buildSpec(
    const std::string& garment, const std::string& shaping, const std::string& waistline,
    const std::string& fabric, const std::string& neckline,
    const std::string& sleeveStyle, const std::string& sleeveLength,
    const std::string& skirtStyle, const std::string& skirtLength, const std::string& topLength,
    bool ruffleHem, int ruffleTiers, bool keyhole, bool frontPlacket, int tieClosure,
    int sleeveCap, int collarType, int collarEdge, int gatherType, int gatherZone,
    int backOpening, int backSlit, int ruffledStraps, int peplum, int placketStyle,
    int edgeFinish, int pocketStyle, int cuffStyle, int hemShape,
    int shoulderStyle,
    int buttonRow, int exposedZip, int backDetail, int bardotStyle
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
    spec.frontPlacket = frontPlacket;
    // Every int enum range-checked against the generated vocabulary; an
    // out-of-range value is an error, never a silent None/default.
    spec.tieClosure = parseEnumInt("tieClosure", tieClosure, kTieClosure, kTieClosureCount);
    spec.sleeveCap = sleeveCapFrom(sleeveCap);
    spec.collarType = parseEnumInt("collarType", collarType, kCollarType, kCollarTypeCount);
    spec.collarEdge = parseEnumInt("collarEdge", collarEdge, kCollarEdge, kCollarEdgeCount);
    spec.gatherType = parseEnumInt("gatherType", gatherType, kGatherType, kGatherTypeCount);
    spec.gatherZone = parseEnumInt("gatherZone", gatherZone, kGatherZone, kGatherZoneCount);
    spec.backOpening = parseEnumInt("backOpening", backOpening, kBackOpening, kBackOpeningCount);
    spec.backSlit = parseEnumInt("backSlit", backSlit, kBackSlit, kBackSlitCount);
    spec.ruffledStraps = parseEnumInt("ruffledStraps", ruffledStraps, kRuffledStraps, kRuffledStrapsCount);
    spec.peplum = parseEnumInt("peplum", peplum, kPeplum, kPeplumCount);
    spec.placketStyle = parseEnumInt("placketStyle", placketStyle, kPlacketStyle, kPlacketStyleCount);
    spec.edgeFinish = parseEnumInt("edgeFinish", edgeFinish, kEdgeFinish, kEdgeFinishCount);
    spec.pocketStyle = parseEnumInt("pocketStyle", pocketStyle, kPocketStyle, kPocketStyleCount);
    spec.cuffStyle = parseEnumInt("cuffStyle", cuffStyle, kCuffStyle, kCuffStyleCount);
    spec.hemShape = parseEnumInt("hemShape", hemShape, kHemShape, kHemShapeCount);
    spec.shoulderStyle = parseEnumInt("shoulderStyle", shoulderStyle, kShoulderStyle, kShoulderStyleCount);
    spec.buttonRow = parseEnumInt("buttonRow", buttonRow, kButtonRow, kButtonRowCount);
    spec.exposedZip = parseEnumInt("exposedZip", exposedZip, kExposedZip, kExposedZipCount);
    spec.backDetail = parseEnumInt("backDetail", backDetail, kBackDetail, kBackDetailCount);
    spec.bardotStyle = parseEnumInt("bardotStyle", bardotStyle, kBardotStyle, kBardotStyleCount);
    validateSpecCross(spec); // incoherent combination -> error, not a silent skip
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
        out += R"(,"notches":)" + commandsJSON(piece.notches);
        if (!piece.closure.empty()) out += R"(,"closure":")" + escape(piece.closure) + "\"";
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
    double upperBustCM,
    bool frontPlacket, // appended so existing positional callers stay valid
    int tieClosure,    // Loop 4b: fabric ties / sash / bow; 0 = None
    int sleeveCap,     // Loop 6: gathered/puff sleeve head; 0 = Plain
    int collarType,    // Loop 7/8: collar family; 0 = None
    int collarEdge,    // Loop 7/8: flat-family outer edge; 0 = Round
    int gatherType,    // Loop 8: drawstring/shirred/smocked gathering; 0 = None
    int gatherZone,    // Loop 8: gather zone; 0 = Neckline
    int backOpening,   // Loop 9b: open-back cutout; 0 = None
    int backSlit,      // Loop M1: back hem slit / walking vent; 0 = None
    int ruffledStraps, // queue #3: ruffled shoulder straps; 0 = None
    int peplum,        // R1.1: peplum flare; 0 = None
    int placketStyle,  // R1.2: asymmetric placket; 0 = None 1 = Standard 2 = Asymmetric
    int edgeFinish,    // patch 3.10: edge finish; 0 = BiasBinding (default), 1 = Facing
    int pocketStyle,   // patch 3.12: pocket; 0 = None 1 = Patch 2 = SideSeam
    int cuffStyle,     // patch 3.13: sleeve-end cuff; 0 = None 1 = Button 2 = Ribbed
    int hemShape,      // patch 3.15: hem shape; 0 = Straight 1 = Shirttail 2 = HighLow
    int shoulderStyle, // patch 3.13: shoulder/sleeve join; 0 = Set 1 = Dropped 2 = Raglan
    int buttonRow,     // vocab: button row; 0 = None 1 = Functional 2 = Decorative
    int exposedZip,    // vocab: exposed zipper; 0 = None 1 = CenterFront 2 = CenterBack
    int backDetail,    // vocab: back detail; 0 = None 1 = Ruffle 2 = Cape 3 = Flounce
    int bardotStyle    // vocab: off-shoulder/bardot; 0 = None 1 = Plain 2 = Frill
) {
    try {
        const GarmentSpec spec = buildSpec(garment, shaping, waistline, fabric, neckline,
            sleeveStyle, sleeveLength, skirtStyle, skirtLength, topLength, ruffleHem, ruffleTiers, keyhole, frontPlacket, tieClosure, sleeveCap, collarType, collarEdge, gatherType, gatherZone, backOpening, backSlit, ruffledStraps, peplum, placketStyle, edgeFinish, pocketStyle, cuffStyle, hemShape, shoulderStyle, buttonRow, exposedZip, backDetail, bardotStyle);
        BodyMeasurementsSnapshot m{bustCM, waistCM, hipCM, shoulderCM, backLengthCM, armLengthCM, neckCM};
        m.upperBustCM = upperBustCM; // optional full-bust adjustment; 0 = old behaviour
        return patternJSON(spec, m);
    } catch (const std::exception& e) {
        // Invalid spec: no pattern, the message names the field and the accepted
        // values. issues carries it too so every existing "issues non-empty ->
        // no PDF" guard blocks the draft without new plumbing.
        return std::string(R"({"error":")") + escape(e.what()) +
               R"(","pattern":null,"issues":[")" + escape(e.what()) + "\"]}";
    }
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
    std::string fromLabel, std::string toLabel,
    bool frontPlacket, // appended so existing positional callers stay valid
    int tieClosure,    // Loop 4b: fabric ties / sash / bow; 0 = None
    int sleeveCap,     // Loop 6: gathered/puff sleeve head; 0 = Plain
    int collarType,    // Loop 7/8: collar family; 0 = None
    int collarEdge,    // Loop 7/8: flat-family outer edge; 0 = Round
    int gatherType,    // Loop 8: drawstring/shirred/smocked gathering; 0 = None
    int gatherZone,    // Loop 8: gather zone; 0 = Neckline
    int backOpening,   // Loop 9b: open-back cutout; 0 = None
    int backSlit,      // Loop M1: back hem slit / walking vent; 0 = None
    int ruffledStraps, // queue #3: ruffled shoulder straps; 0 = None
    int peplum,        // R1.1: peplum flare; 0 = None
    int placketStyle,  // R1.2: asymmetric placket; 0 = None 1 = Standard 2 = Asymmetric
    int edgeFinish,    // patch 3.10: edge finish; 0 = BiasBinding (default), 1 = Facing
    int pocketStyle,   // patch 3.12: pocket; 0 = None 1 = Patch 2 = SideSeam
    int cuffStyle,     // patch 3.13: sleeve-end cuff; 0 = None 1 = Button 2 = Ribbed
    int hemShape,      // patch 3.15: hem shape; 0 = Straight 1 = Shirttail 2 = HighLow
    int shoulderStyle, // patch 3.13: shoulder/sleeve join; 0 = Set 1 = Dropped 2 = Raglan
    int buttonRow,     // vocab: button row; 0 = None 1 = Functional 2 = Decorative
    int exposedZip,    // vocab: exposed zipper; 0 = None 1 = CenterFront 2 = CenterBack
    int backDetail,    // vocab: back detail; 0 = None 1 = Ruffle 2 = Cape 3 = Flounce
    int bardotStyle    // vocab: off-shoulder/bardot; 0 = None 1 = Plain 2 = Frill
) {
    GarmentSpec spec;
    try {
        spec = buildSpec(garment, shaping, waistline, fabric, neckline,
            sleeveStyle, sleeveLength, skirtStyle, skirtLength, topLength, ruffleHem, ruffleTiers, keyhole, frontPlacket, tieClosure, sleeveCap, collarType, collarEdge, gatherType, gatherZone, backOpening, backSlit, ruffledStraps, peplum, placketStyle, edgeFinish, pocketStyle, cuffStyle, hemShape, shoulderStyle, buttonRow, exposedZip, backDetail, bardotStyle);
    } catch (const std::exception& e) {
        return std::string(R"({"error":")") + escape(e.what()) +
               R"(","sizes":[],"issues":[")" + escape(e.what()) + "\"]}";
    }

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
