// tech-pack (Aşama 5/6 aggregation tool — üretim/fabrika paketi): grades ONE
// recipe across the full EU size chart and assembles the industrial production
// package a factory needs, in ONE machine-readable JSON manifest:
//   - size table    : every EU body the design grades against (cm, from the
//                     K1 euSizeChart — the same source recipe_grade_check uses)
//   - cut list      : per size, every piece's name / cut instruction / seam
//                     allowance (mm), straight off the drafted PatternPiece
//   - fabric        : per size, motor's own fabricMeters140 (m at 140 cm wide);
//                     total fabric weight per size when a gramaj (GSM) is given
//                     (deterministic: meters × 1.40 m × gsm), else honest null
//   - marker        : per size, the marker efficiency + consumed roll length at
//                     a given fabric width, from nest::nestPieces on the TRUE
//                     cut polygons (the same overlap=0-proven nesting)
//   - dxf           : per size, a graded DXF-AAMA/ASTM R12 file written next to
//                     the manifest (the graded interchange the factory opens)
//
// EVERYTHING here is compiled from the motor's own deterministic output — no
// invented number, no LLM, no heuristic. Same recipe + param + fabric width +
// gsm → the same manifest bytes (no dates, no randomness). A refused/validator-
// blocked size is reported HONESTLY (draftError / nestError), never dropped.
//
//   usage: tech-pack <recipe.json> <paramMM> <fabricWidthMM> <outDir>
//                    [--gsm <g/m2>]
// Body/param handling: the recipe binds its SINGLE declared param positionally
// (lengthMM for the skirt, extendMM for the shift dress). Bodies come from the
// EU size chart (all 10 sizes), not the pinned trio. Malformed input is a hard
// error, no defaults.
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>

#include "../src/dxf.hpp"
#include "../src/nest.hpp"
#include "../src/recipe.hpp"
#include "../src/sizechart.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

namespace {

// Fixed 4-decimal formatting (same as recipe-json-dump / golden dumps): mm are
// carried at %.4f so the manifest is byte-deterministic and diff-friendly.
std::string num(double v) {
    char buf[40];
    std::snprintf(buf, sizeof(buf), "%.4f", v);
    return buf;
}
std::string num2(double v) {
    char buf[40];
    std::snprintf(buf, sizeof(buf), "%.2f", v);
    return buf;
}

std::string escape(const std::string& s) {
    std::string out;
    for (char c : s) {
        if (c == '"' || c == '\\') { out += '\\'; out += c; }
        else if (c == '\n') out += "\\n";
        else out += c;
    }
    return out;
}

bool writeFile(const std::string& path, const std::string& data) {
    FILE* f = std::fopen(path.c_str(), "wb");
    if (!f) return false;
    std::fwrite(data.data(), 1, data.size(), f);
    std::fclose(f);
    return true;
}

// A safe filename fragment for a size label ("EU38" is already safe; keep it
// deterministic and path-clean).
std::string safeFrag(const std::string& s) {
    std::string out;
    for (char c : s)
        out += (std::isalnum(static_cast<unsigned char>(c)) ? c : '-');
    return out;
}

} // namespace

int main(int argc, char** argv) {
    if (argc < 5) {
        std::fprintf(stderr,
            "usage: tech-pack <recipe.json> <paramMM> <fabricWidthMM> <outDir> [--gsm <g/m2>]\n");
        return 2;
    }
    const std::string recipePath = argv[1];
    const double paramMM = std::strtod(argv[2], nullptr);
    const double fabricWidthMM = std::strtod(argv[3], nullptr);
    const std::string outDir = argv[4];
    if (fabricWidthMM <= 0) { std::fprintf(stderr, "fabricWidthMM must be > 0\n"); return 2; }

    // Optional gramaj (GSM). -1 = not given → total weight reported as null,
    // honestly (the motor does not know the fabric's weight; it is a mill fact).
    double gsm = -1.0;
    for (int i = 5; i + 1 < argc; ++i) {
        if (std::strcmp(argv[i], "--gsm") == 0) {
            gsm = std::strtod(argv[++i], nullptr);
            if (gsm <= 0) { std::fprintf(stderr, "--gsm must be > 0\n"); return 2; }
        }
    }

    const auto loaded = recipe::loadRecipeFile(recipePath);
    if (!loaded.ok) {
        std::fprintf(stderr, "recipe parse failed: %s\n", loaded.error.c_str());
        return 1;
    }
    const recipe::Recipe& rcp = loaded.value;
    const auto paramNames = recipe::recipeParamNames(rcp);
    if (paramNames.size() != 1) {
        std::fprintf(stderr,
            "recipe declares %zu params; this tool binds exactly one positional value\n",
            paramNames.size());
        return 2;
    }
    const std::string paramName = paramNames[0];
    const GarmentSpec spec = recipe::kernelSpec(rcp);
    const std::string id = recipe::recipeId(rcp);

    const auto& chart = euSizeChart();

    // Fabric width in metres (for the deterministic weight computation).
    const double fabricWidthM = fabricWidthMM / 1000.0;

    std::string sizesJson;   // per-size blocks
    int gradedOk = 0;        // sizes that drafted + validated + nested
    int gradedTotal = static_cast<int>(chart.size());

    for (size_t si = 0; si < chart.size(); ++si) {
        const SizeChartEntry& entry = chart[si];
        const std::string frag = safeFrag(entry.label);

        std::string block = "{";
        block += R"("size":")" + escape(entry.label) + "\"";
        // size-table row: the standard body this size grades against (cm).
        block += R"(,"body":{)";
        block += R"("bustCM":)" + num(entry.body.bustCM);
        block += R"(,"waistCM":)" + num(entry.body.waistCM);
        block += R"(,"hipCM":)" + num(entry.body.hipCM);
        block += R"(,"shoulderCM":)" + num(entry.body.shoulderCM);
        block += R"(,"backLengthCM":)" + num(entry.body.backLengthCM);
        block += R"(,"armLengthCM":)" + num(entry.body.armLengthCM);
        block += R"(,"neckCM":)" + num(entry.body.neckCM);
        block += "}";

        const auto drafted = recipe::draftRecipe(rcp, entry.body, {{paramName, paramMM}});
        if (!drafted.ok) {
            // HONEST refuse — reported, never silently dropped.
            block += R"(,"draftError":")" + escape(drafted.error) + "\"";
            block += "}";
            if (!sizesJson.empty()) sizesJson += ",";
            sizesJson += block;
            continue;
        }
        const DraftedPattern& p = drafted.value;

        // Validator gate: a size that does not validate NEVER ships as clean.
        const auto issues = PatternValidator::issues(spec, entry.body, p);
        block += R"(,"validatorClean":)";
        block += issues.empty() ? "true" : "false";
        if (!issues.empty()) {
            block += R"(,"validatorIssues":[)";
            for (size_t i = 0; i < issues.size(); ++i) {
                if (i) block += ",";
                block += "\"" + escape(issues[i].description()) + "\"";
            }
            block += "]";
        }

        // cut list — straight off the drafted pieces.
        block += R"(,"pieces":[)";
        for (size_t i = 0; i < p.pieces.size(); ++i) {
            const auto& piece = p.pieces[i];
            if (i) block += ",";
            const Rect bb = boundingBox(piece.commands);
            block += "{";
            block += R"("name":")" + escape(piece.name) + "\"";
            block += R"(,"cutInstruction":")" + escape(piece.cutInstruction) + "\"";
            block += R"(,"seamAllowanceMM":)" + num(piece.seamAllowance);
            block += R"(,"sewWidthMM":)" + num(bb.width);
            block += R"(,"sewHeightMM":)" + num(bb.height);
            block += "}";
        }
        block += "]";
        block += R"(,"pieceCount":)" + std::to_string(p.pieces.size());

        // fabric — the motor's own estimate; total weight is derived
        // deterministically only when a gramaj was supplied.
        block += R"(,"fabricMeters140":)" + num(p.fabricMeters140);
        if (gsm > 0.0) {
            // weight (g) = meters × width(m) × gsm(g/m^2). Fabric is estimated at
            // 140 cm wide (the motor's own convention), so use 1.40 m regardless
            // of the marker width above — the estimate and the weight share the
            // 140 cm assumption; the marker efficiency uses the real cutting
            // width separately (documented in the manifest header).
            const double grams = p.fabricMeters140 * 1.40 * gsm;
            block += R"(,"fabricWeightG":)" + num2(grams);
        } else {
            block += R"(,"fabricWeightG":null)";
        }

        // marker — nest the TRUE cut polygons onto the given fabric width.
        const auto polys = nest::piecePolygons(p);
        const auto nestResult = nest::nestPieces(polys, fabricWidthMM);
        if (!nestResult.ok) {
            block += R"(,"nestError":")" + escape(nestResult.error) + "\"";
        } else {
            block += R"(,"marker":{)";
            block += R"("fabricWidthMM":)" + num(nestResult.fabricWidthMM);
            block += R"(,"rollLengthMM":)" + num(nestResult.usedLengthMM);
            block += R"(,"pieceAreaMM2":)" + num(nestResult.usedAreaMM2);
            block += R"(,"efficiency":)" + num(nestResult.efficiency);
            block += R"(,"placedPieces":)" + std::to_string(nestResult.placements.size());
            block += "}";
        }

        // graded DXF — write the interchange file for this size next to the
        // manifest; the manifest records its relative path + the motor mm bbox.
        const std::string dxfDoc = dxf::exportPattern(p);
        const std::string dxfName = "dxf/" + id + "." + frag + ".dxf";
        if (!writeFile(outDir + "/" + dxfName, dxfDoc)) {
            std::fprintf(stderr, "could not write DXF '%s' (does %s/dxf exist?)\n",
                         dxfName.c_str(), outDir.c_str());
            return 1;
        }
        block += R"(,"dxf":")" + escape(dxfName) + "\"";
        block += R"(,"dxfBytes":)" + std::to_string(dxfDoc.size());

        block += "}";
        if (!sizesJson.empty()) sizesJson += ",";
        sizesJson += block;

        if (issues.empty() && nestResult.ok) gradedOk++;
    }

    // Assemble the manifest.
    std::string m = "{";
    m += R"("schema":"stitchu.techpack/1")";
    m += R"(,"recipe":")" + escape(id) + "\"";
    m += R"(,"garment":")" + escape(raw(spec.garment)) + "\"";
    m += R"(,"param":{")" + escape(paramName) + R"(":)" + num(paramMM) + "}";
    m += R"(,"markerFabricWidthMM":)" + num(fabricWidthMM);
    m += R"(,"fabricEstimateWidthCM":140)"; // the motor's fabric estimate assumption
    if (gsm > 0.0) m += R"(,"gsm":)" + num2(gsm);
    else m += R"(,"gsm":null)";
    m += R"(,"gradedSizesClean":)" + std::to_string(gradedOk);
    m += R"(,"gradedSizesTotal":)" + std::to_string(gradedTotal);
    m += R"(,"sizes":[)" + sizesJson + "]";
    m += "}\n";

    const std::string manifestPath = outDir + "/manifest.json";
    if (!writeFile(manifestPath, m)) {
        std::fprintf(stderr, "could not write manifest '%s' (does %s exist?)\n",
                     manifestPath.c_str(), outDir.c_str());
        return 1;
    }

    // Deterministic stdout report (no path leakage of absolute dirs beyond what
    // the caller passed).
    std::printf("tech-pack: %s | param %s=%.1f | markerWidth=%.1fmm | gsm=%s\n",
                id.c_str(), paramName.c_str(), paramMM, fabricWidthMM,
                gsm > 0 ? num2(gsm).c_str() : "none");
    std::printf("graded sizes: %d/%d clean+nested | manifest: %s (%zu bytes)\n",
                gradedOk, gradedTotal, manifestPath.c_str(), m.size());
    std::printf("dxf: %s/dxf/ (one graded DXF per drafted size)\n", outDir.c_str());
    return 0;
}
