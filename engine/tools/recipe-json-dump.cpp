// recipe-json-dump (Gate 1d tool): drafts a recipe for one body + length and
// prints the pattern as the SAME JSON shape the wasm draftJSON emits
// (wasm/bindings.cpp), so web/js/sheet.js can pack it into A4 print sheets and
// engine/tools/render-recipe.mjs can render the PNG visual proof (RULES
// invariant 3: the PNG path goes in the report, or the step did not happen).
//   usage: recipe-json-dump <recipe.json> <EU38|pear|bigNeckSmallShoulder> <paramMM>
//   (paramMM binds to the recipe's SINGLE declared param — lengthMM for the
//   skirt recipe, extendMM for the shift-dress recipe; no hardcoded name.)
#include <cstdio>
#include <cstdlib>
#include <string>
#include <vector>

#include "../src/recipe.hpp"

using namespace stitchu;

namespace {

std::string num(double v) {
    char buf[32];
    std::snprintf(buf, sizeof(buf), "%.4f", v);
    return buf;
}

std::string escape(const std::string& s) {
    std::string out;
    for (char c : s) {
        if (c == '"' || c == '\\') { out += '\\'; out += c; }
        else out += c;
    }
    return out;
}

// same command serialization as wasm/bindings.cpp commandsJSON.
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

} // namespace

int main(int argc, char** argv) {
    if (argc < 4) {
        std::fprintf(stderr, "usage: recipe-json-dump <recipe.json> <EU38|pear|bigNeckSmallShoulder> <paramMM>\n");
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
    const DraftedPattern& p = drafted.value;

    std::string out = R"({"garment":")" + escape(p.garment) + "\"";
    out += R"(,"fabricMeters140":)" + num(p.fabricMeters140);
    out += R"(,"pieces":[)";
    for (size_t i = 0; i < p.pieces.size(); ++i) {
        const auto& piece = p.pieces[i];
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
        out += R"(,"cutLine":)" + commandsJSON(piece.cutLine);
        out += "}";
    }
    out += "]}";
    std::printf("%s\n", out.c_str());
    return 0;
}
