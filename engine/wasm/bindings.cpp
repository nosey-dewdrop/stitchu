// WASM boundary: garment spec + measurements in, DraftedPattern out as JSON.
// JSON only exists at this boundary; the engine itself stays plain structs.
#include <emscripten/bind.h>

#include <algorithm>
#include <string>

#include "../src/garment.hpp"
#include "../src/sizechart.hpp"
#include "../src/guiderefs.hpp"
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

// Spec arrives as ONE named object (emscripten::val) — the 34-positional
// signature died 2026-07-18: a one-slot shift silently drafted a different
// dress. Absent field = the enum default (absence is not a wrong word);
// present-but-unknown value = error via specparse.
using emscripten::val;

std::string strField(const val& o, const char* key, const char* dflt) {
    const val v = o[key];
    if (v.isUndefined() || v.isNull()) return dflt;
    return v.as<std::string>();
}
int intField(const val& o, const char* key) {
    const val v = o[key];
    if (v.isUndefined() || v.isNull()) return 0;
    return v.as<int>();
}
bool boolField(const val& o, const char* key) {
    const val v = o[key];
    if (v.isUndefined() || v.isNull()) return false;
    return v.as<bool>();
}
double numField(const val& o, const char* key) {
    const val v = o[key];
    if (v.isUndefined() || v.isNull()) return 0;
    return v.as<double>();
}

// Returns {"pattern": {...}, "issues": [...]} — issues non-empty means the
// runtime safety net caught an invalid draft; the UI must not show the PDF.
GarmentSpec buildSpec(const val& o) {
    GarmentSpec spec;
    spec.garment = garmentFrom(strField(o, "garment", "dress"));
    spec.shaping = shapingFrom(strField(o, "shaping", "dart"));
    spec.waistline = waistlineFrom(strField(o, "waistline", "natural"));
    spec.fabric = fabricFrom(strField(o, "fabric", "woven"));
    spec.neckline = necklineFrom(strField(o, "neckline", "crew"));
    spec.sleeveStyle = sleeveStyleFrom(strField(o, "sleeveStyle", "none"));
    spec.sleeveLength = sleeveLengthFrom(strField(o, "sleeveLength", "short"));
    spec.skirtStyle = skirtStyleFrom(strField(o, "skirtStyle", "aLine"));
    spec.skirtLength = skirtLengthFrom(strField(o, "skirtLength", "midi"));
    spec.topLength = topLengthFrom(strField(o, "topLength", "hip"));
    spec.ruffleHem = boolField(o, "ruffleHem");
    const int tiers = intField(o, "ruffleTiers");
    spec.ruffleTiers = tiers ? tiers : 1; // engine clamps 1..5
    spec.keyhole = boolField(o, "keyhole");
    spec.frontPlacket = boolField(o, "frontPlacket");
    // Every int enum range-checked against the generated vocabulary; an
    // out-of-range value is an error, never a silent None/default.
    spec.tieClosure = parseEnumInt("tieClosure", intField(o, "tieClosure"), kTieClosure, kTieClosureCount);
    spec.sleeveCap = sleeveCapFrom(intField(o, "sleeveCap"));
    spec.collarType = parseEnumInt("collarType", intField(o, "collarType"), kCollarType, kCollarTypeCount);
    spec.collarEdge = parseEnumInt("collarEdge", intField(o, "collarEdge"), kCollarEdge, kCollarEdgeCount);
    spec.gatherType = parseEnumInt("gatherType", intField(o, "gatherType"), kGatherType, kGatherTypeCount);
    spec.gatherZone = parseEnumInt("gatherZone", intField(o, "gatherZone"), kGatherZone, kGatherZoneCount);
    spec.backOpening = parseEnumInt("backOpening", intField(o, "backOpening"), kBackOpening, kBackOpeningCount);
    spec.backSlit = parseEnumInt("backSlit", intField(o, "backSlit"), kBackSlit, kBackSlitCount);
    spec.ruffledStraps = parseEnumInt("ruffledStraps", intField(o, "ruffledStraps"), kRuffledStraps, kRuffledStrapsCount);
    spec.peplum = parseEnumInt("peplum", intField(o, "peplum"), kPeplum, kPeplumCount);
    spec.placketStyle = parseEnumInt("placketStyle", intField(o, "placketStyle"), kPlacketStyle, kPlacketStyleCount);
    spec.edgeFinish = parseEnumInt("edgeFinish", intField(o, "edgeFinish"), kEdgeFinish, kEdgeFinishCount);
    spec.pocketStyle = parseEnumInt("pocketStyle", intField(o, "pocketStyle"), kPocketStyle, kPocketStyleCount);
    spec.cuffStyle = parseEnumInt("cuffStyle", intField(o, "cuffStyle"), kCuffStyle, kCuffStyleCount);
    spec.hemShape = parseEnumInt("hemShape", intField(o, "hemShape"), kHemShape, kHemShapeCount);
    spec.shoulderStyle = parseEnumInt("shoulderStyle", intField(o, "shoulderStyle"), kShoulderStyle, kShoulderStyleCount);
    spec.buttonRow = parseEnumInt("buttonRow", intField(o, "buttonRow"), kButtonRow, kButtonRowCount);
    spec.exposedZip = parseEnumInt("exposedZip", intField(o, "exposedZip"), kExposedZip, kExposedZipCount);
    spec.backDetail = parseEnumInt("backDetail", intField(o, "backDetail"), kBackDetail, kBackDetailCount);
    spec.bardotStyle = parseEnumInt("bardotStyle", intField(o, "bardotStyle"), kBardotStyle, kBardotStyleCount);
    spec.cupSeam = parseEnumInt("cupSeam", intField(o, "cupSeam"), kCupSeam, kCupSeamCount);
    spec.yoke = parseEnumInt("yoke", intField(o, "yoke"), kYoke, kYokeCount);
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
    // guideRefs[i] = names of drafted pieces guide step i references (the
    // two-way guide<->piece audit that also gates the validator).
    const GuideAudit guideAudit = auditGuide(draft);
    out += R"(],"guideRefs":[)";
    for (size_t i = 0; i < guideAudit.stepPieces.size(); ++i) {
        if (i) out += ",";
        out += "[";
        for (size_t j = 0; j < guideAudit.stepPieces[i].size(); ++j) {
            if (j) out += ",";
            out += "\"" + escape(guideAudit.stepPieces[i][j]) + "\"";
        }
        out += "]";
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

std::string draftJSON(val specObj, val bodyObj) {
    try {
        const GarmentSpec spec = buildSpec(specObj);
        BodyMeasurementsSnapshot m{
            numField(bodyObj, "bust"), numField(bodyObj, "waist"), numField(bodyObj, "hip"),
            numField(bodyObj, "shoulder"), numField(bodyObj, "backLength"),
            numField(bodyObj, "armLength"), numField(bodyObj, "neck")};
        m.upperBustCM = numField(bodyObj, "upperBust"); // optional FBA; 0 = old behaviour
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
std::string gradeJSON(val specObj, val rangeObj) {
    GarmentSpec spec;
    try {
        spec = buildSpec(specObj);
    } catch (const std::exception& e) {
        return std::string(R"({"error":")") + escape(e.what()) +
               R"(","sizes":[],"issues":[")" + escape(e.what()) + "\"]}";
    }
    const std::string fromLabel = strField(rangeObj, "from", "");
    const std::string toLabel = strField(rangeObj, "to", "");

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
