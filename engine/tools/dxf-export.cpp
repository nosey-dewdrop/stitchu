// dxf-export (Aşama 5 tool): drafts a recipe for one body + param and writes a
// DXF-AAMA/ASTM R12 file to stdout — the industry interchange format so an
// independent CAD (Valentina/Seamly2D/ezdxf) can open the motor's geometry.
// Body + param handling mirrors recipe-json-dump.cpp exactly (same pinned
// bodies + custom:7cm; single positional param bound by name). No defaults;
// malformed input is a hard error.
//   usage: dxf-export <recipe.json> <EU38|pear|bigNeckSmallShoulder|custom:...> <paramMM>
#include <cstdio>
#include <cstdlib>
#include <string>

#include "../src/dxf.hpp"
#include "../src/recipe.hpp"

using namespace stitchu;

int main(int argc, char** argv) {
    if (argc < 4) {
        std::fprintf(stderr, "usage: dxf-export <recipe.json> <EU38|pear|bigNeckSmallShoulder|custom:...> <paramMM>\n");
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
    const std::string doc = dxf::exportPattern(drafted.value);
    std::fwrite(doc.data(), 1, doc.size(), stdout);
    return 0;
}
