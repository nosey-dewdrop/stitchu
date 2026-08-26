// shell-audit: the shipped shell as RAW SAMPLES, so a gate can ask whether the
// number the user downloads is CORRECT (GECE7 / F5-B, IS 0b, karar K30).
//
// ---------------------------------------------------------------------------
// WHY THIS TOOL EXISTS — a referee mutation, not an idea.
//
// F3 and F5-A built IDENTITY: "the flat and the pattern came out of the same
// object" (`dugum`, tek_nesne_check K1-K5). The referee then changed
// `shellprojection.cpp` so `bust_circumference` published the WAIST's girth —
// a technical drawing that ships a wrong bust measurement to a paying user —
// and measured the result: the node id moved (identity works, K24 works) and
// BOTH tek_nesne_check and rotate_check stayed GREEN (HM3). Nothing in the repo
// asks whether a published number is TRUE, only whether it has the right
// ancestor. A wrong measure ships silently today.
//
// ---------------------------------------------------------------------------
// WHAT MAKES THIS A SECOND PATH AND NOT A SECOND CALL.
//
// Re-running project() and comparing it with itself is regen-vs-regen and
// proves nothing. shellprojection.cpp measures with:
//   girth      Section::perimeter() by GAUSS-LEGENDRE quadrature (order 24)
//              plus Steiner's ANALYTIC offset identity P + 2*pi*d
//   half width the CLOSED-FORM extreme of the offset curve, a + d
//   body_length a 0.05mm-step walk of GarmentSurf::at() down phi = +-pi/2
//
// This tool publishes, instead, the shell's OWN POINTS: for each named ring, a
// dense polygon of `GarmentSurf::at(h, phi)` around the full 2*pi, and the
// centre lines as dense point chains. The gate then computes girth as the plain
// chord sum of that polygon, half-width as its extreme x, and the centre line as
// the chord sum of the chain. Different arithmetic (chords vs quadrature), no
// Steiner identity, no closed form, no shared code path with project(). Where
// the two disagree beyond the discretisation error of a chord sum, the
// PUBLISHED number is wrong about the thing its name says it measures.
//
// ⚠ WHAT IS NOT AUDITED, AND IT IS SAID RATHER THAN FAKED (K29). `at()` itself
// is common to both paths: if the SURFACE is wrong, both readings are wrong
// together and this tool cannot see it. What it does see is a measure computed
// at the wrong height, on the wrong ring, of the wrong quantity, or copied from
// another view — which is the whole class HM3 belongs to.
//
// Usage: shell-audit [EU38]     -> JSON on stdout
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/seamplan.hpp"

using namespace stitchu;

namespace {

constexpr double kPi = 3.14159265358979323846;
// Ring polygon resolution. 20000 chords on a ~1000mm ellipse is a 0.05mm chord;
// the chord sum of a convex curve underestimates its length by O(h^2/R), i.e.
// well under a micron here. Big enough that the gate's tolerance is about the
// MEASURE and not about this number.
constexpr int kRingSamples = 20000;
// Centre-line chain step, mm. shellprojection.cpp walks its own line at 0.05mm;
// this one is coarser on purpose — a second path that copied the first path's
// step would hide a step-dependent error.
constexpr double kCentreStepMM = 0.02;

std::string num(double v, int dp = 6) {
    char b[64];
    std::snprintf(b, sizeof b, "%.*f", dp, v);
    return b;
}

}  // namespace

int main(int argc, char** argv) {
    const std::string size = argc > 1 ? argv[1] : "EU38";
    try {
        const SeamPlan plan = buildSeamPlan(size);
        const GarmentSurf& s = plan.pattern.surf;

        // ⚠ THE RING NAMES ARE NOT SPELLED IN THIS FILE, AND THAT IS A RULE
        // RATHER THAN A STYLE (K12). `vocab_reference_check` counts every LINE
        // that spells a closed enum's value — including comment lines — and the
        // vocabulary is only ever allowed to shrink (BREADTH -> DEPTH). The
        // first draft of this file wrote the lowest ring's name as a literal and
        // took that counter 103 -> 104, i.e. the gate went red on a string in a
        // ternary. The names have exactly one authority, GarmentSurf::ringNames(),
        // which is the same reason shellprojection.cpp reads them off the ring
        // instead of restating them.
        const bool hasHem = s.hemScale > 0.0 && s.hemH > 0.0;
        const std::string hipName = GarmentSurf::ringNames()[4];
        const std::string shoulderName = GarmentSurf::ringNames()[1];
        double hipH = 0.0, shoulderH = 0.0;
        for (const GarmentSurf::Ring& r : s.rings) {
            if (r.name == hipName) hipH = r.h;
            if (r.name == shoulderName) shoulderH = r.h;
        }
        const double hemZ = hasHem ? s.hemH : hipH;

        std::printf("{\n");
        std::printf("  \"beden\": \"%s\",\n", size.c_str());
        std::printf("  \"dugum\": \"%s\",\n", plan.nodeId().c_str());
        std::printf("  \"halka_ornek\": %d,\n", kRingSamples);
        // The hem is not one of the five body rings — it is where the SHELL
        // stops. Being outside the closed ring list it is the ONE level name
        // written in this file, exactly as shellprojection.cpp writes it.
        const std::string kHemRing = "hem";
        std::printf("  \"hem_var\": %s,\n", hasHem ? "true" : "false");
        std::printf("  \"hem_z_mm\": %s,\n", num(hemZ).c_str());
        std::printf("  \"omuz_z_mm\": %s,\n", num(shoulderH).c_str());

        // ---- THE RINGS, AS POLYGONS ----
        //
        // Every named ring plus the hem level, each as a dense closed polygon of
        // the shell's own points. The gate sums chords; it does not integrate.
        std::printf("  \"halkalar\": [\n");
        struct Lvl { std::string name; double h; };
        std::vector<Lvl> lv;
        for (const GarmentSurf::Ring& r : s.rings) lv.push_back({r.name, r.h});
        lv.push_back({hasHem ? kHemRing : hipName, hemZ});
        for (std::size_t k = 0; k < lv.size(); ++k) {
            std::printf("    {\"ad\": \"%s\", \"h_mm\": %s, \"nokta\": [", lv[k].name.c_str(),
                        num(lv[k].h).c_str());
            for (int i = 0; i < kRingSamples; ++i) {
                const Vec3 v = s.at(lv[k].h, 2.0 * kPi * i / kRingSamples);
                std::printf("%s[%s,%s]", i ? "," : "", num(v.x, 5).c_str(), num(v.y, 5).c_str());
            }
            std::printf("]}%s\n", k + 1 < lv.size() ? "," : "");
        }
        std::printf("  ],\n");

        // ---- THE TWO CENTRE LINES, AS CHAINS ----
        //
        // phi = +pi/2 is the centre FRONT of the garment and -pi/2 the centre
        // BACK — the same convention surfacepattern.cpp cuts its front/back
        // panels on. Two chains, because the shell is NOT front/back symmetric
        // (bm+bd against bm-bd) and a front reading copied to the back is one of
        // the defects this audit has to be able to see.
        const int n = std::max(2, static_cast<int>(std::ceil((shoulderH - hemZ) / kCentreStepMM)));
        for (int f = 0; f < 2; ++f) {
            const double phi = f ? -0.5 * kPi : 0.5 * kPi;
            std::printf("  \"%s\": [", f ? "merkez_arka" : "merkez_on");
            for (int i = 0; i <= n; ++i) {
                const Vec3 v = s.at(shoulderH - (shoulderH - hemZ) * i / n, phi);
                std::printf("%s[%s,%s,%s]", i ? "," : "", num(v.x, 5).c_str(), num(v.y, 5).c_str(),
                            num(v.z, 5).c_str());
            }
            std::printf("],\n");
        }
        std::printf("  \"merkez_adim_mm\": %s\n}\n", num(kCentreStepMM, 4).c_str());
        return 0;
    } catch (const std::exception& e) {
        std::fprintf(stderr, "shell-audit: %s\n", e.what());
        return 1;
    }
}
