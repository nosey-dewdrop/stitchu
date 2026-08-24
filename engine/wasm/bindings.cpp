// WASM boundary: garment spec + measurements in, DraftedPattern out as JSON.
// JSON only exists at this boundary; the engine itself stays plain structs.
#include <emscripten/bind.h>

#include <algorithm>
#include <cmath>
#include <string>

#include "../src/dxf.hpp"
#include "../src/garment.hpp"
#include "../src/recipe.hpp"
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

// %.4f prints a non-finite double as the bare token `nan` / `inf`, which is NOT
// JSON: the browser's JSON.parse throws (SyntaxError: Unexpected token 'a')
// BEFORE any caller can read the `issues` array that names the problem. So an
// honest refusal the validator DID produce was destroyed by the writer. The
// writer therefore refuses to emit a non-JSON token and throws instead; the
// draftJSON/gradeJSON catch turns it into {"error": ...} that JSON.parse can
// read. This is a LOUD failure, not a filter — nothing is clipped or hidden.
std::string num(double v) {
    if (!std::isfinite(v))
        throw std::invalid_argument(
            "non-finite coordinate reached the JSON writer (nan/inf); the draft is "
            "corrupt and no pattern is returned");
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
// Print a double the way the caller wrote it (1.5, not 1.500000) so the refusal
// message quotes the value that was actually rejected.
std::string asWritten(double d) {
    if (!std::isfinite(d)) return std::isnan(d) ? "NaN" : (d > 0 ? "Infinity" : "-Infinity");
    char buf[40];
    std::snprintf(buf, sizeof(buf), "%.10g", d);
    return buf;
}

// PLAIN int field (not a vocabulary axis, e.g. ruffleTiers). A fractional count
// is a WRONG value, not a roundable one — same rule as the enum axes below.
int intField(const val& o, const char* key) {
    const val v = o[key];
    if (v.isUndefined() || v.isNull()) return 0;
    const double d = v.as<double>();
    if (!std::isfinite(d) || d != std::floor(d) || d < -2147483648.0 || d > 2147483647.0)
        throw std::invalid_argument(std::string("invalid ") + key + " '" + asWritten(d) +
                                    "' (must be a whole number)");
    return static_cast<int>(d);
}

// INT VOCABULARY AXIS. The bug this replaces (measured on the shipped byte,
// GECE/V0-0D.md §4a): the field was read with v.as<int>(), which truncates
// toward zero INSIDE the JS->C++ conversion, so parseEnumInt never saw the real
// value. sleeveCap=1.5 drafted sleeveCap=1 byte-identically; 0.9 -> 0,
// 2.999 -> 2, -0.5 -> 0. No error, no warning, `issues` unchanged — a silent
// coercion, i.e. RULES.md invariant 1 broken on the shipped path while the
// comment above claimed the opposite. The value is now read as a DOUBLE and a
// non-integral / non-finite / out-of-int-range one is refused BY NAME, in the
// same wording the string axes already use (specparse.hpp vocabError):
//   invalid sleeveCap '1.5' (valid: plain, gathered, puffed, ...)
// Absence (undefined/null) is NOT an error: it keeps the enum default, because
// absence is not a wrong word.
int enumIntField(const val& o, const char* field, const char* const* names, int count) {
    const val v = o[field];
    if (v.isUndefined() || v.isNull()) return 0;
    const double d = v.as<double>();
    if (!std::isfinite(d) || d != std::floor(d) || d < -2147483648.0 || d > 2147483647.0)
        vocabError(field, asWritten(d), names, count);
    return parseEnumInt(field, static_cast<int>(d), names, count);
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
    // KUMAŞ EKSENİ (F-H): the fabric WORD carries an optional crosswise-stretch
    // percentage beside it. ABSENT (or < 0) means UNDECLARED, and undeclared is
    // NOT the same as 0 — undeclared knit keeps the stable-knit band, declared 0
    // is a woven. numField() cannot tell the two apart (it returns 0 for a
    // missing key), so the key is probed directly.
    {
        const val sv = o["fabricStretchPct"];
        if (!sv.isUndefined() && !sv.isNull()) {
            const double s = sv.as<double>();
            if (std::isfinite(s) && s >= 0) spec.fabric.stretchPct = s;
        }
    }
    spec.neckline = necklineFrom(strField(o, "neckline", "crew"));
    spec.sleeveStyle = sleeveStyleFrom(strField(o, "sleeveStyle", "none"));
    spec.sleeveLength = sleeveLengthFrom(strField(o, "sleeveLength", "short"));
    spec.skirtStyle = skirtStyleFrom(strField(o, "skirtStyle", "aLine"));
    spec.skirtLength = skirtLengthFrom(strField(o, "skirtLength", "midi"));
    // Foto-oran kablosu: sürekli etek boyu (mm). Alan yoksa/0 ise tablo sürer;
    // motor 250-1200 kelepçeler. Negatif/NaN 0 sayılır (opt-in kapalı).
    {
        const double lenMM = numField(o, "skirtLengthMM");
        spec.skirtLengthMM = (std::isfinite(lenMM) && lenMM > 0) ? lenMM : 0;
    }
    spec.topLength = topLengthFrom(strField(o, "topLength", "hip"));
    spec.ruffleHem = boolField(o, "ruffleHem");
    const int tiers = intField(o, "ruffleTiers");
    spec.ruffleTiers = tiers ? tiers : 1; // engine clamps 1..5
    spec.keyhole = boolField(o, "keyhole");
    spec.frontPlacket = boolField(o, "frontPlacket");
    // Every int enum range-checked against the generated vocabulary; an
    // out-of-range value is an error, never a silent None/default.
    spec.tieClosure = enumIntField(o, "tieClosure", kTieClosure, kTieClosureCount);
    spec.sleeveCap = static_cast<SleeveCap>(
        enumIntField(o, "sleeveCap", kSleeveCap, kSleeveCapCount));
    spec.collarType = enumIntField(o, "collarType", kCollarType, kCollarTypeCount);
    spec.collarEdge = enumIntField(o, "collarEdge", kCollarEdge, kCollarEdgeCount);
    spec.gatherType = enumIntField(o, "gatherType", kGatherType, kGatherTypeCount);
    spec.gatherZone = enumIntField(o, "gatherZone", kGatherZone, kGatherZoneCount);
    spec.backOpening = enumIntField(o, "backOpening", kBackOpening, kBackOpeningCount);
    spec.laceUpBack = enumIntField(o, "laceUpBack", kLaceUpBack, kLaceUpBackCount);
    spec.wrapFront = enumIntField(o, "wrapFront", kWrapFront, kWrapFrontCount);
    spec.backSlit = enumIntField(o, "backSlit", kBackSlit, kBackSlitCount);
    spec.ruffledStraps = enumIntField(o, "ruffledStraps", kRuffledStraps, kRuffledStrapsCount);
    spec.peplum = enumIntField(o, "peplum", kPeplum, kPeplumCount);
    spec.hemFlounce = enumIntField(o, "hemFlounce", kHemFlounce, kHemFlounceCount);
    spec.placketStyle = enumIntField(o, "placketStyle", kPlacketStyle, kPlacketStyleCount);
    spec.edgeFinish = enumIntField(o, "edgeFinish", kEdgeFinish, kEdgeFinishCount);
    spec.pocketStyle = enumIntField(o, "pocketStyle", kPocketStyle, kPocketStyleCount);
    spec.cuffStyle = enumIntField(o, "cuffStyle", kCuffStyle, kCuffStyleCount);
    spec.hemShape = enumIntField(o, "hemShape", kHemShape, kHemShapeCount);
    spec.shoulderStyle = enumIntField(o, "shoulderStyle", kShoulderStyle, kShoulderStyleCount);
    spec.buttonRow = enumIntField(o, "buttonRow", kButtonRow, kButtonRowCount);
    spec.exposedZip = enumIntField(o, "exposedZip", kExposedZip, kExposedZipCount);
    spec.backDetail = enumIntField(o, "backDetail", kBackDetail, kBackDetailCount);
    spec.bardotStyle = enumIntField(o, "bardotStyle", kBardotStyle, kBardotStyleCount);
    spec.cupSeam = enumIntField(o, "cupSeam", kCupSeam, kCupSeamCount);
    spec.locketTop = enumIntField(o, "locketTop", kLocketTop, kLocketTopCount);
    spec.yoke = enumIntField(o, "yoke", kYoke, kYokeCount);
    spec.boxPleat = enumIntField(o, "boxPleat", kBoxPleat, kBoxPleatCount);
    validateSpecCross(spec); // incoherent combination -> error, not a silent skip
    return spec;
}

// Serialize one already-drafted pattern + its validator verdict as the
// {pattern, issues} JSON — shared by the motor path (draftJSON / gradeJSON)
// and the recipe path (draftRecipeJSON). One writer, no format drift.
std::string draftedJSON(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m,
                        const DraftedPattern& draft) {
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
    // REHBER (F-H İŞ 2): the material/technique layer, each entry with the
    // BASIS that lets it exist. Emitted on the SAME surface as the pieces, which
    // is what "sayfaya basılmayan öneri yok hükmünde" means in practice: an
    // advice the engine builds and does not hand out is an advice that is not
    // there. guide_completeness_check reads this file to prove the wire exists.
    out += R"(],"rehber":[)";
    for (size_t i = 0; i < draft.rehber.size(); ++i) {
        if (i) out += ",";
        out += R"({"id":")" + escape(draft.rehber[i].id) + "\"";
        out += R"(,"text":")" + escape(draft.rehber[i].text) + "\"";
        out += R"(,"basis":")" + escape(draft.rehber[i].basis) + "\"}";
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
        out += R"(,"onFold":)" + std::string(piece.onFold ? "true" : "false");
        out += R"(,"foldLine":)" + commandsJSON(piece.foldLine);
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

// The {pattern, issues} JSON for one drafted body — shared by draftJSON and the
// per-size entries of gradeJSON.
std::string patternJSON(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m) {
    const DraftedPattern draft = GarmentDrafter::draft(spec, m);
    return draftedJSON(spec, m, draft);
}

// A MISSING measurement is not a measurement of zero. numField() cannot tell
// the two apart (absent key -> 0), so a body object with a typo'd or dropped
// key used to arrive as a person 0 cm wide and the engine drafted it: the neck
// facing normalises the shoulder vector by its own length, and with a zero
// shoulder that is 0/0 = NaN (engine/src/bodice.cpp, shoulderEnd). That NaN
// then reached the JSON writer as the bare token `nan`, so JSON.parse threw in
// the browser and the validator's honest "[finite] ... non-finite coordinate"
// verdict could never be read. This is the same class as the enum axes above:
// an unusable input must be refused BY NAME, not coerced.
// upperBust stays optional (0 = "not declared", the documented FBA fallback).
double bodyField(const val& bodyObj, const char* key) {
    const val v = bodyObj[key];
    const double d = (v.isUndefined() || v.isNull()) ? 0.0 : v.as<double>();
    // Same wording the recipe interpreter already refuses with
    // (engine/src/recipe.cpp:938) — one vocabulary for one fault, so a caller
    // never has to learn two ways of being told the body is unusable.
    if (!std::isfinite(d) || d <= 0)
        throw std::invalid_argument(
            std::string("invalid body: measurement '") + key +
            "' is missing or non-positive (" + asWritten(d) + ") - every body "
            "measurement must be a positive length in cm");
    return d;
}

BodyMeasurementsSnapshot bodyFrom(const val& bodyObj) {
    BodyMeasurementsSnapshot m{
        bodyField(bodyObj, "bust"), bodyField(bodyObj, "waist"), bodyField(bodyObj, "hip"),
        bodyField(bodyObj, "shoulder"), bodyField(bodyObj, "backLength"),
        bodyField(bodyObj, "armLength"), bodyField(bodyObj, "neck")};
    m.upperBustCM = numField(bodyObj, "upperBust"); // optional FBA; 0 = old behaviour
    if (!std::isfinite(m.upperBustCM) || m.upperBustCM < 0)
        throw std::invalid_argument(
            "invalid body: upperBust '" + asWritten(m.upperBustCM) +
            "'; leave it out (or 0) when it is not measured, otherwise give a positive cm value");
    return m;
}

std::string draftJSON(val specObj, val bodyObj) {
    try {
        const GarmentSpec spec = buildSpec(specObj);
        const BodyMeasurementsSnapshot m = bodyFrom(bodyObj);
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
    // The catch spans the WHOLE run, not just buildSpec: the JSON writer refuses
    // a non-finite coordinate by throwing, and that refusal must reach the caller
    // as JSON too (a half-written "sizes" string would be unparseable).
    try {
    GarmentSpec spec;
    spec = buildSpec(specObj);
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
    } catch (const std::exception& e) {
        return std::string(R"({"error":")") + escape(e.what()) +
               R"(","sizes":[],"issues":[")" + escape(e.what()) + "\"]}";
    }
}

// Recipe path (PIPELINE Aşama 2, kanvas): recipe JSON text + measurements +
// params in, the SAME {pattern, issues} JSON out as draftJSON, so render/sheet/
// print consume both paths identically. The interpreter (engine/src/recipe.cpp,
// contract docs/RECETE-SPEC.md) enforces everything — unknown key/param,
// out-of-range param, missing measurement all come back as an honest error,
// never a silent default (RULES invariant 1). No LLM, no guessed numbers:
// the recipe document carries formulas, the kernel evaluates them.
std::string draftRecipeJSON(std::string recipeText, val bodyObj, val paramsObj) {
    const auto errJSON = [](const std::string& msg) {
        return std::string(R"({"error":")") + escape(msg) +
               R"(","pattern":null,"issues":[")" + escape(msg) + "\"]}";
    };
    // bodyFrom() and the JSON writer now REFUSE by throwing (an unusable body,
    // a non-finite coordinate). This boundary hands JavaScript a JSON string,
    // never an unwrapped C++ throw, so every refusal is caught here and comes
    // back through the same errJSON the interpreter's refusals use.
    try {
        const auto parsed = recipe::parseRecipe(recipeText);
        if (!parsed.ok) return errJSON(parsed.error);

        // params: every own key of the JS object is handed to the interpreter,
        // which rejects undeclared keys and enforces declared [min, max] ranges.
        recipe::RecipeParams params;
        const val keys = val::global("Object").call<val>("keys", paramsObj);
        const int n = keys["length"].as<int>();
        for (int i = 0; i < n; ++i) {
            const std::string key = keys[i].as<std::string>();
            params[key] = paramsObj[key.c_str()].as<double>();
        }

        const BodyMeasurementsSnapshot m = bodyFrom(bodyObj);
        const auto drafted = recipe::draftRecipe(parsed.value, m, params);
        if (!drafted.ok) return errJSON(drafted.error);
        // Validator verdict with the GarmentSpec built ONLY from the recipe's
        // sealed kernel block (no magic recipeId→enum mapping).
        return draftedJSON(recipe::kernelSpec(parsed.value), m, drafted.value);
    } catch (const std::exception& e) {
        return errJSON(e.what());
    }
}

// DXF-AAMA/ASTM export at the recipe boundary (PIPELINE Aşama 5, in-browser).
// Same production path as draftRecipeJSON — parse the recipe, draft the SAME
// DraftedPattern for this body + params — then serialize it with the SAME
// dxf::exportPattern the native dxf-export tool uses. So the DXF a shopper
// downloads for their own measurement is the motor's mm geometry, not a redraw:
// the wasm string is byte-identical to the native dxf-export output for the same
// recipe + body + param (proven by the dxf_wasm_parity ctest). Returns
// {"dxf": "<escaped R12 text>"} on success or {"error": ...} on any honest
// refusal (unknown recipe/param/measurement) — never a silent default.
std::string dxfRecipeJSON(std::string recipeText, val bodyObj, val paramsObj) {
    const auto errJSON = [](const std::string& msg) {
        return std::string(R"({"error":")") + escape(msg) + R"(","dxf":null})";
    };
    // Same reason as draftRecipeJSON: an unusable body is refused, and a
    // refusal must arrive as JSON, not as an unwrapped C++ throw.
    try {
        const auto parsed = recipe::parseRecipe(recipeText);
        if (!parsed.ok) return errJSON(parsed.error);

        recipe::RecipeParams params;
        const val keys = val::global("Object").call<val>("keys", paramsObj);
        const int n = keys["length"].as<int>();
        for (int i = 0; i < n; ++i) {
            const std::string key = keys[i].as<std::string>();
            params[key] = paramsObj[key.c_str()].as<double>();
        }

        const BodyMeasurementsSnapshot m = bodyFrom(bodyObj);
        const auto drafted = recipe::draftRecipe(parsed.value, m, params);
        if (!drafted.ok) return errJSON(drafted.error);

        // A validator-blocked draft must not hand out an "industry" DXF: refuse
        // it the same way the studio refuses the SVG/PDF when issues are non-empty.
        const auto issues = PatternValidator::issues(recipe::kernelSpec(parsed.value), m, drafted.value);
        if (!issues.empty()) return errJSON(issues.front().description());

        const std::string doc = dxf::exportPattern(drafted.value);
        return std::string(R"({"dxf":")") + escape(doc) + "\"}";
    } catch (const std::exception& e) {
        return errJSON(e.what());
    }
}

} // namespace

EMSCRIPTEN_BINDINGS(stitchu_engine) {
    emscripten::function("draftJSON", &draftJSON);
    emscripten::function("gradeJSON", &gradeJSON);
    emscripten::function("draftRecipeJSON", &draftRecipeJSON);
    emscripten::function("dxfRecipeJSON", &dxfRecipeJSON);
}
