// nest-marker (Aşama 6 tool — marker/yerleşim): drafts a recipe for one body +
// param, lays the cut pieces onto fabric of a given width WITHOUT overlap, and
// writes the marker. Body + param handling mirrors dxf-export.cpp / recipe-json-
// dump.cpp exactly (same pinned bodies + custom:7cm; single positional param
// bound by name). No defaults; malformed input is a hard error.
//
//   usage: nest-marker <recipe.json> <EU38|pear|bigNeckSmallShoulder|custom:...>
//                      <paramMM> <fabricWidthMM> [--svg PATH] [--dxf PATH]
//
// Default output (stdout) is a deterministic REPORT: fabric width, used roll
// length, total piece area, efficiency %, and per-piece placement (rotation +
// offset). With --svg / --dxf it also writes the marker files. The overlap=0
// invariant is PROVED by ctest nest_check (not asserted here); this tool is the
// producer.
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>

#include "../src/nest.hpp"
#include "../src/recipe.hpp"

using namespace stitchu;

namespace {
bool writeFile(const std::string& path, const std::string& data) {
    FILE* f = std::fopen(path.c_str(), "wb");
    if (!f) return false;
    std::fwrite(data.data(), 1, data.size(), f);
    std::fclose(f);
    return true;
}
} // namespace

int main(int argc, char** argv) {
    if (argc < 5) {
        std::fprintf(stderr,
            "usage: nest-marker <recipe.json> <EU38|pear|bigNeckSmallShoulder|custom:...> "
            "<paramMM> <fabricWidthMM> [--svg PATH] [--dxf PATH]\n");
        return 2;
    }
    const auto loaded = recipe::loadRecipeFile(argv[1]);
    if (!loaded.ok) {
        std::fprintf(stderr, "recipe parse failed: %s\n", loaded.error.c_str());
        return 1;
    }
    const std::string body = argv[2];
    BodyMeasurementsSnapshot m;
    if (body == "EU38") m = {88, 70, 94, 37, 40.5, 58, 35};
    else if (body == "pear") m = {96, 70, 116, 37, 41, 58, 36};
    else if (body == "bigNeckSmallShoulder") m = {100, 84, 104, 30, 40, 58, 50};
    else if (body.rfind("custom:", 0) == 0) {
        double v[7];
        int n = 0;
        const char* s = body.c_str() + 7;
        char* end = nullptr;
        while (n < 7) {
            v[n] = std::strtod(s, &end);
            if (end == s) break;
            ++n;
            s = end;
            if (*s == ',') ++s; else break;
        }
        if (n != 7 || *s != '\0') {
            std::fprintf(stderr, "custom body needs exactly 7 comma-separated CM values "
                                 "(bust,waist,hip,shoulder,backLength,armLength,neck), got '%s'\n",
                         body.c_str());
            return 2;
        }
        m = {v[0], v[1], v[2], v[3], v[4], v[5], v[6]};
    }
    else { std::fprintf(stderr, "unknown body '%s'\n", body.c_str()); return 2; }

    const double paramMM = std::strtod(argv[3], nullptr);
    const double fabricWidthMM = std::strtod(argv[4], nullptr);
    if (fabricWidthMM <= 0) { std::fprintf(stderr, "fabricWidthMM must be > 0\n"); return 2; }

    std::string svgPath, dxfPath;
    for (int i = 5; i + 1 < argc; ++i) {
        if (std::strcmp(argv[i], "--svg") == 0) svgPath = argv[++i];
        else if (std::strcmp(argv[i], "--dxf") == 0) dxfPath = argv[++i];
    }

    const auto paramNames = recipe::recipeParamNames(loaded.value);
    if (paramNames.size() != 1) {
        std::fprintf(stderr, "recipe declares %zu params; this tool binds exactly one positional value\n",
                     paramNames.size());
        return 2;
    }
    const auto drafted = recipe::draftRecipe(loaded.value, m, {{paramNames[0], paramMM}});
    if (!drafted.ok) {
        std::fprintf(stderr, "draftRecipe failed: %s\n", drafted.error.c_str());
        return 1;
    }

    const auto polys = nest::piecePolygons(drafted.value);
    const auto result = nest::nestPieces(polys, fabricWidthMM);
    if (!result.ok) {
        std::fprintf(stderr, "nest failed: %s\n", result.error.c_str());
        return 1;
    }

    if (!svgPath.empty()) {
        if (!writeFile(svgPath, nest::nestSVG(polys, result))) {
            std::fprintf(stderr, "could not write svg '%s'\n", svgPath.c_str());
            return 1;
        }
    }
    if (!dxfPath.empty()) {
        if (!writeFile(dxfPath, nest::nestDXF(polys, result))) {
            std::fprintf(stderr, "could not write dxf '%s'\n", dxfPath.c_str());
            return 1;
        }
    }

    // Deterministic report.
    std::printf("nest-marker: %s | body=%s param=%.1f fabric=%.1fmm\n",
                recipe::recipeId(loaded.value).c_str(), body.c_str(), paramMM, fabricWidthMM);
    std::printf("pieces: %zu | roll length: %.1fmm | piece area: %.1fmm2\n",
                result.placements.size(), result.usedLengthMM, result.usedAreaMM2);
    std::printf("efficiency: %.2f%% (area / (width x length))\n", result.efficiency * 100.0);
    for (const auto& pl : result.placements) {
        const auto poly = nest::placedPolygon(polys, pl);
        const Rect b = nest::polygonBounds(poly);
        std::printf("  [%s] rot=%d x=[%.1f..%.1f] y=[%.1f..%.1f] area=%.1fmm2\n",
                    polys[pl.pieceIndex].name.c_str(), pl.rotated90 ? 90 : 0,
                    b.x, b.x + b.width, b.y, b.y + b.height, polys[pl.pieceIndex].area);
    }
    if (!svgPath.empty()) std::printf("svg: %s\n", svgPath.c_str());
    if (!dxfPath.empty()) std::printf("dxf: %s\n", dxfPath.c_str());
    return 0;
}
