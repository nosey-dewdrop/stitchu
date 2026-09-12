// seam-plan: prints ONE seam plan's two readings — the KALIP and the FLAT.
//
// This tool exists so the F3 gate can ask its question of the shipped code
// instead of of a re-implementation. It holds no geometry of its own: every
// number it prints comes out of src/seamplan.cpp, which is the same
// translation unit the wasm bindings call. If this tool and create.html ever
// disagree, one of them is not calling the engine.
//
// Usage:
//   seam-plan [EU38] --kalip            the pattern reading, JSON
//   seam-plan [EU38] --flat             the flat reading, JSON
//   seam-plan [EU38] --neck-drop <mm>   drop the FRONT neck edge by <mm> first
//
// --neck-drop is not a hidden dial: it is the one spec change the phase gate
// makes, expressed in millimetres because that is what the question is asked
// in ("deepen the neck edge by 20mm"). It maps onto SheathOptions'
// frontNeckDropCoefCM, which Aldrich states in cm off one fifth of the neck
// measurement; +1cm of coefficient is +10mm of drop at every size, so the
// conversion is exact and carries no fitted constant.
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <exception>
#include <string>

#include "../src/seamplan.hpp"

using namespace stitchu;

int main(int argc, char** argv) {
    std::string size = "EU38";
    bool wantFlat = false, wantPlan = false;
    double neckDropMM = 0.0;
    for (int i = 1; i < argc; ++i) {
        if (!std::strcmp(argv[i], "--flat")) wantFlat = true;
        else if (!std::strcmp(argv[i], "--kalip")) wantPlan = true;
        else if (!std::strcmp(argv[i], "--neck-drop") && i + 1 < argc) neckDropMM = std::atof(argv[++i]);
        else size = argv[i];
    }
    if (wantFlat == wantPlan) {
        std::fprintf(stderr, "seam-plan: pick exactly one of --kalip / --flat\n");
        return 2;
    }
    try {
        SheathOptions opt;
        // mm -> Aldrich's cm coefficient. surfacepattern.cpp:1321 reads
        // `frontDropMM = fifthNeck + frontNeckDropCoefCM * 10`, i.e. the
        // coefficient is ADDED, so a deeper neck edge is a larger coefficient.
        // MEASURED, not reasoned: the first version of this line subtracted and
        // the flat's centre-front moved 1349.7702 -> 1369.7702mm, i.e. exactly
        // 20mm the WRONG WAY. The magnitude was already exact (the mapping
        // carries no fitted constant); only the sign was wrong.
        opt.frontNeckDropCoefCM += neckDropMM / 10.0;
        const SeamPlan plan = buildSeamPlan(size, opt);
        std::fputs((wantFlat ? flatJSON(plan) : planJSON(plan)).c_str(), stdout);
        return 0;
    } catch (const std::exception& e) {
        // An unknown size is an honest refusal, never a silent EU38 (RULES 1).
        std::fprintf(stderr, "seam-plan: %s\n", e.what());
        return 1;
    }
}
