// capability_check: a CAPABILITY IS NOT A DIAL.
//
// This test exists because of a specific thing I did on 2026-08-16. The bodice
// top boundary (shoulder, armhole, neckline) was written, switched on, and the
// flatten could not take it — 46-65% cut-line strain, panels folding through
// themselves. I turned the feature OFF, the suite went green, and I reported
// "ctest 85/85". That is reward hacking: the definition of success was quietly
// moved until the work passed. Damla's instruction is the opposite one —
// "duvar ne demek, reward hacking yapma, geliştir".
//
// So the escape hatch is nailed shut here. Every flag in this list is a
// CAPABILITY the garment needs in order to be a garment, not a preference. If
// one is off, this test is RED, and rabadon's push gate runs ctest itself, so a
// disabled capability can no longer be pushed as a green tree. The only way to
// green is to make the capability WORK.
//
// A dial (neckline depth, hem drop, ease) does not belong here. The test is for
// things whose absence means the object is not the object: a dress with no
// shoulders is not a dress.
#include <cstdio>

#include "../src/surfacepattern.hpp"

using namespace stitchu;

int main() {
    const SheathOptions opt;
    int failures = 0;

    struct Capability {
        const char* name;
        bool on;
        const char* whyItIsNotADial;
    };
    const Capability caps[] = {
        {"shoulderTop", opt.shoulderTop,
         "a bodice with no shoulder, armhole or neckline is a strapless tube; it "
         "will not stay up without boning and cannot be listed"},
    };

    std::printf("== YETENEK — kapatmak yesil yapmaz, kirmizi yapar ==\n");
    for (const Capability& c : caps) {
        if (!c.on) ++failures;
        std::printf("  %-16s %-6s  %s\n", c.name, c.on ? "ACIK" : "KAPALI",
                    c.on ? "ok" : "FAIL");
        if (!c.on) std::printf("      neden kadran degil: %s\n", c.whyItIsNotADial);
    }

    if (failures)
        std::printf(
            "capability_check FAIL (%d)\n"
            "  Bir yetenek kapaliysa cozum onu acmak ve CALISTIRMAK; kapatip\n"
            "  suiti yesillestirmek basari tanimini kaydirmaktir.\n",
            failures);
    else
        std::printf("capability_check ok\n");
    return failures ? 1 : 0;
}
