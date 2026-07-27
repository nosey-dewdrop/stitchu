// recipe_golden_dump: Gate 1(b) — the RECIPE path drafts skirt.aline.dart for
// the three PINNED golden bodies × mini/midi/maxi and dumps golden CSV lines.
// Number production is the INTERPRETER (engine/src/recipe.cpp), never the
// motor; the CSV text format is the ONE shared writer (golden_writer.hpp), so
// a format difference can never fake an alarm or a pass (RECETE-SPEC §5b).
// recipe_golden_check.sh compares this output byte-for-byte against the
// `grep '|skirt/aLine/'` subset of the REPO PIN engine/golden-reference.csv.
#include <cstdio>
#include <string>
#include <utility>
#include <vector>

#include "../src/contract.gen.hpp"
#include "../src/recipe.hpp"
#include "golden_writer.hpp"

using namespace stitchu;

int main(int argc, char** argv) {
    if (argc < 2) {
        std::fprintf(stderr, "usage: recipe_golden_dump <recipe.json>\n");
        return 2;
    }
    const auto loaded = recipe::loadRecipeFile(argv[1]);
    if (!loaded.ok) {
        std::fprintf(stderr, "recipe parse failed: %s\n", loaded.error.c_str());
        return 1;
    }
    const recipe::Recipe& rcp = loaded.value;

    // the three pinned golden bodies (golden_dump.cpp:37-41, verbatim).
    const std::vector<std::pair<std::string, BodyMeasurementsSnapshot>> bodies = {
        {"EU38", {88, 70, 94, 37, 40.5, 58, 35}},
        {"pear", {96, 70, 116, 37, 41, 58, 36}},
        {"bigNeckSmallShoulder", {100, 84, 104, 30, 40, 58, 50}},
    };
    // mini/midi/maxi mm from the K1 contract table (the same single source the
    // motor's SkirtLength table reads, contract.gen.hpp ← tables.json).
    const std::vector<std::pair<SkirtLength, double>> lengths = {
        {SkirtLength::Mini, contract::kSkirtLength_mini},
        {SkirtLength::Midi, contract::kSkirtLength_midi},
        {SkirtLength::Maxi, contract::kSkirtLength_maxi},
    };

    // golden label built from the SEALED kernel block + the loop length enum —
    // no recipeId→enum mapping (RECETE-SPEC §2.2).
    const GarmentSpec kernel = recipe::kernelSpec(rcp);
    for (const auto& [bodyName, m] : bodies) {
        for (const auto& [lengthEnum, lengthMM] : lengths) {
            const std::string label =
                std::string("skirt/") + raw(kernel.skirtStyle) + "/" + raw(lengthEnum);
            const auto drafted = recipe::draftRecipe(rcp, m, {{"lengthMM", lengthMM}});
            if (!drafted.ok) {
                std::fprintf(stderr, "draftRecipe(%s, %s) failed: %s\n",
                             bodyName.c_str(), label.c_str(), drafted.error.c_str());
                return 1;
            }
            // fabric line = the kernel service output carried in the drafted
            // pattern (skirt garment: no facing subtraction, golden_dump.cpp:109).
            goldenwriter::dumpFabricLine(bodyName, label, drafted.value.fabricMeters140);
            size_t p = 0;
            for (const auto& piece : drafted.value.pieces) {
                const std::string prefix = goldenwriter::piecePrefix(bodyName, label, p, piece.name);
                goldenwriter::dumpCommands("outline", piece.commands, prefix);
                goldenwriter::dumpCommands("marking", piece.markings, prefix);
                ++p;
            }
        }
    }
    return 0;
}
