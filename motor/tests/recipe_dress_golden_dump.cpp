// recipe_dress_golden_dump: the v1.1 top-kernel byte gate feed (RECETE-SPEC
// §6). Drafts the shift-dress recipe for the three PINNED golden bodies at
// extendMM = belowWaist(Tunic) — the pinned overlap point — and dumps golden
// CSV OUTLINE lines for the two body pieces, label built from the sealed
// kernel enums exactly as golden_dump.cpp builds it.
//
// DECLARED EXCLUSIONS (why only outline lines):
//   - fabric line: the pin is the Facing-era Swift surface with the facing
//     meters subtracted (golden_dump.cpp:88-91); the recipe path carries the
//     default bias binding + the strap share — a different, post-Swift finish.
//   - marking lines: the pinned combo draws none (the extended top clears its
//     darts); the recipe path carries StrapBlock placement notches — that
//     pass is the motor's own shared code, judged in recipe_dress_check's
//     cross-parity, not here.
// Number production is the INTERPRETER; the CSV writer is the ONE shared
// golden_writer (format can't fake an alarm or a pass).
#include <cstdio>
#include <string>
#include <utility>
#include <vector>

#include "../src/recipe.hpp"
#include "golden_writer.hpp"

using namespace stitchu;

int main(int argc, char** argv) {
    if (argc < 2) {
        std::fprintf(stderr, "usage: recipe_dress_golden_dump <recipe.json>\n");
        return 2;
    }
    const auto loaded = recipe::loadRecipeFile(argv[1]);
    if (!loaded.ok) {
        std::fprintf(stderr, "recipe parse failed: %s\n", loaded.error.c_str());
        return 1;
    }
    const recipe::Recipe& rcp = loaded.value;

    // the three pinned golden bodies (golden_dump.cpp:16-19, verbatim).
    const std::vector<std::pair<std::string, BodyMeasurementsSnapshot>> bodies = {
        {"EU38", {88, 70, 94, 37, 40.5, 58, 35}},
        {"pear", {96, 70, 116, 37, 41, 58, 36}},
        {"bigNeckSmallShoulder", {100, 84, 104, 30, 40, 58, 50}},
    };

    // golden label from the SEALED kernel block (golden_dump.cpp:78 verbatim);
    // the pinned extension point is the motor's own TopLength table.
    const GarmentSpec kernel = recipe::kernelSpec(rcp);
    const std::string label = std::string("top/") + raw(kernel.neckline) + "/" +
                              raw(kernel.topLength) + "/" + raw(kernel.sleeveStyle) +
                              "." + raw(kernel.sleeveLength);
    const double extendMM = belowWaist(kernel.topLength);

    for (const auto& [bodyName, m] : bodies) {
        const auto drafted = recipe::draftRecipe(rcp, m, {{"extendMM", extendMM}});
        if (!drafted.ok) {
            std::fprintf(stderr, "draftRecipe(%s, %s) failed: %s\n",
                         bodyName.c_str(), label.c_str(), drafted.error.c_str());
            return 1;
        }
        size_t p = 0;
        for (const auto& piece : drafted.value.pieces) {
            if (piece.name != "Top Front" && piece.name != "Top Back") continue;
            const std::string prefix = goldenwriter::piecePrefix(bodyName, label, p, piece.name);
            goldenwriter::dumpCommands("outline", piece.commands, prefix);
            ++p;
        }
    }
    return 0;
}
