// plan-ops: run THE OPERATOR PROGRAM against the shipped seam plan.
//
// THIS TOOL HOLDS NO GEOMETRY AND NO CHOICE. It calls src/planops.cpp's
// `opsJSON`, which is the SAME function `wasm/bindings.cpp` exposes to the
// browser and `web/js/engine.js` reaches. If this tool and create.html ever
// disagree, one of them is not calling the engine — the rule tools/seam-plan.cpp
// and tools/split-op.cpp already state.
//
// Usage: plan-ops [EU38] [--neck-drop MM] [-o dosya]
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <exception>
#include <string>

#include "../src/planops.hpp"

using namespace stitchu;

int main(int argc, char** argv) {
    std::string size = "EU38";
    double neckDropMM = 0.0;
    const char* outPath = nullptr;
    for (int i = 1; i < argc; ++i) {
        if (!std::strcmp(argv[i], "-o") && i + 1 < argc) outPath = argv[++i];
        else if (!std::strcmp(argv[i], "--neck-drop") && i + 1 < argc) neckDropMM = std::atof(argv[++i]);
        else size = argv[i];
    }
    if (outPath && !std::freopen(outPath, "w", stdout)) {
        std::fprintf(stderr, "plan-ops: cikti dosyasi acilamadi: %s\n", outPath);
        return 1;
    }
    try {
        std::fputs(opsJSONAll(size, neckDropMM).c_str(), stdout);
        return 0;
    } catch (const std::exception& e) {
        std::fprintf(stderr, "plan-ops: %s\n", e.what());
        return 1;
    }
}
