// drape_check (Aşama 2/6 gate — hakem: makine): proves the 3D drape preview is a
// REAL, deterministic geometric result off the motor's pattern geometry, not a
// fabricated picture. It never asserts "it looks right" (that is Damla's eye at
// Kapı 2) — it proves the physics ran and the invariants a mass-spring settle
// MUST hold:
//   1. determinism: same recipe piece + same options -> byte-identical 3D verts.
//   2. pinned edge held: the waist/neck row does not move (drift ~ 0).
//   3. no NaN/Inf: an unstable sim would produce them; a real one must not.
//   4. it actually drapes: the hem falls BELOW the flat lay (dropFromFlat > 0)
//      and the mesh has real particles + springs.
//   5. body collision works: with a body cylinder, no particle sits meaningfully
//      INSIDE it (penetration ~ 0); AND the detector is not blind — a flat sheet
//      started inside the cylinder is pushed OUT (a green gate that can't see
//      penetration is worthless).
//   6. honest refuse: a piece with no outline / a too-coarse cell is Err, never a
//      silent empty preview.
//
// Bodies + recipe come from the pinned trio (recipe-json-dump/golden), so the
// geometry is the SAME deterministic motor draft the whole suite trusts.
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/drape.hpp"
#include "../src/recipe.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool cond, const std::string& msg) {
    if (!cond) { std::printf("FAIL: %s\n", msg.c_str()); ++failures; }
    else std::printf("ok: %s\n", msg.c_str());
}

static BodyMeasurementsSnapshot bodyEU38() { return {88, 70, 94, 37, 40.5, 58, 35}; }
static BodyMeasurementsSnapshot bodyPear()  { return {96, 70, 116, 37, 41, 58, 36}; }

// Draft a recipe piece by name (hard-fails the test if it's missing).
static const PatternPiece* draftPiece(const recipe::Recipe& r,
                                      const BodyMeasurementsSnapshot& m, double paramMM,
                                      const std::string& pieceName,
                                      DraftedPattern& out) {
    const auto names = recipe::recipeParamNames(r);
    if (names.size() != 1) return nullptr;
    const auto d = recipe::draftRecipe(r, m, {{names[0], paramMM}});
    if (!d.ok) { std::printf("FAIL: draft: %s\n", d.error.c_str()); ++failures; return nullptr; }
    out = d.value;
    for (const auto& p : out.pieces) if (p.name == pieceName) {
        for (const auto& q : out.pieces) if (&q == &p) return &q;
    }
    return nullptr;
}

// FLAT HANG regime: build the mesh flat (rest lengths = true fabric mm), no body,
// let it settle under gravity. This is the STABLE reference — a skirt panel pinned
// at the waist that hangs straight. Springs must settle tightly (low strain).
static drape::DrapeOptions flatHangOpts() {
    drape::DrapeOptions o;
    o.cellMM = 25.0;
    o.steps = 300;
    o.gravity = 30.0;
    o.kStructural = 1.0;
    o.constraintPasses = 12;
    o.damping = 0.06;
    o.bodyRadiusMM = 0.0;   // no body: pure hang
    o.initialWrap = 0.0;    // FLAT build: rest lengths are the real fabric mm
    return o;
}

// BODY-WRAP regime: same flat build, but a body cylinder placed so the flat sheet
// starts just inside its front. The collision then pushes the cloth into a real
// 3D wrap during settling. The wrap depth is bounded by the fabric width (a panel
// narrower than the body arc stops wrapping), so strain stays moderate.
static drape::DrapeOptions bodyWrapOpts() {
    drape::DrapeOptions o = flatHangOpts();
    o.steps = 500;
    o.bodyRadiusMM = 150.0;   // ~waist body radius
    o.bodyCenterX = 100.0;    // ~front panel centre
    o.bodyCenterZ = -120.0;   // body front inside the flat sheet -> wraps forward
    return o;
}

int main(int argc, char** argv) {
    if (argc < 2) { std::fprintf(stderr, "usage: drape_check <skirt-recipe.json>\n"); return 2; }
    const auto loaded = recipe::loadRecipeFile(argv[1]);
    if (!loaded.ok) { std::fprintf(stderr, "recipe load: %s\n", loaded.error.c_str()); return 2; }

    DraftedPattern pat38, patPear;
    const PatternPiece* front38 = draftPiece(loaded.value, bodyEU38(), 450, "Front", pat38);
    check(front38 != nullptr, "drafted skirt Front for EU38");
    if (!front38) return 1;

    const drape::DrapeOptions flat = flatHangOpts();
    const drape::DrapeOptions wrap = bodyWrapOpts();

    // --- 1. determinism: two independent runs must be byte-identical ---
    const drape::DrapeResult r1 = drape::drapePiece(*front38, flat);
    const drape::DrapeResult r2 = drape::drapePiece(*front38, flat);
    check(r1.ok, "flat-hang run 1 ok");
    check(r2.ok, "flat-hang run 2 ok");
    bool identical = r1.particles.size() == r2.particles.size();
    if (identical) {
        for (size_t i = 0; i < r1.particles.size(); ++i) {
            const auto& a = r1.particles[i];
            const auto& b = r2.particles[i];
            // bit-for-bit: the settle is a pure deterministic function.
            if (a.x != b.x || a.y != b.y || a.z != b.z) { identical = false; break; }
        }
    }
    check(identical, "two runs are byte-identical (deterministic settle)");
    // determinism must hold for the body-wrap regime too (collision is deterministic).
    const drape::DrapeResult w1 = drape::drapePiece(*front38, wrap);
    const drape::DrapeResult w2 = drape::drapePiece(*front38, wrap);
    bool wrapIdentical = w1.ok && w2.ok && w1.particles.size() == w2.particles.size();
    if (wrapIdentical)
        for (size_t i = 0; i < w1.particles.size(); ++i)
            if (w1.particles[i].x != w2.particles[i].x || w1.particles[i].y != w2.particles[i].y ||
                w1.particles[i].z != w2.particles[i].z) { wrapIdentical = false; break; }
    check(wrapIdentical, "body-wrap settle is also byte-identical across runs");

    // --- 2. pinned edge held fixed ---
    check(r1.pinnedCount > 0, "some particles pinned (the waist edge)");
    check(r1.maxPinDriftMM < 1e-6, "pinned edge did not move (drift < 1e-6 mm)");
    check(w1.maxPinDriftMM < 1e-6, "pinned edge held under body wrap too");

    // --- 3. no NaN/Inf (both regimes) ---
    check(!r1.anyNaN, "no NaN/Inf in flat-hang mesh (stable sim)");
    check(!w1.anyNaN, "no NaN/Inf in body-wrap mesh (stable sim)");

    // --- 4. real cloth that actually drapes ---
    check(r1.particleCount >= 3, "mesh has >= 3 particles");
    check(r1.springCount > r1.particleCount, "mesh has more springs than particles (connected cloth)");
    check(r1.dropFromFlatMM > 0.0, "hem fell below the flat lay (gravity drape happened)");
    check(r1.finalHeightMM > 0.0, "the piece hangs (final height > 0)");
    // A pinned-at-waist vertical panel is near equilibrium in the flat lay, so the
    // settle must be TIGHT — springs stay near rest length (this is the physical
    // truth being proven, not a loosened threshold).
    check(r1.maxSpringStrain < 0.05, "flat hang settled tight (max spring strain < 5%)");

    // --- 4b. THE ATTACK: the cloth actually wraps into 3D around the body ---
    check(w1.zSpreadMM > 50.0, "cloth wraps into 3D around the body (Z spread > 50 mm)");
    check(std::abs(r1.zSpreadMM) < 1.0, "the flat hang stays flat (Z spread ~ 0) — wrap is body-driven, not noise");
    // The body-wrap regime pushes cloth past pure rest (real fabric resisting a
    // body wider than the panel arc); strain rises but must stay bounded (a stable
    // wrap, not an explosion). Honest measured bound.
    check(w1.maxSpringStrain < 0.5, "body wrap stays stable (max spring strain < 50%)");

    // --- 5a. body collision: no meaningful penetration in the settled wrap ---
    check(w1.bodyPenetrationMM < 1.0, "no particle sits inside the body cylinder (penetration < 1 mm)");

    // --- 5b. the penetration detector is NOT blind: a flat sheet started deep
    //         inside a big cylinder is SEEN deep, and settling reduces it. ---
    {
        drape::DrapeOptions swallow = flat;
        swallow.bodyRadiusMM = 2000.0; // huge cylinder around the flat sheet
        swallow.bodyCenterX = 100.0;
        swallow.bodyCenterZ = -50.0;   // just behind the sheet -> sheet deep inside

        drape::DrapeOptions zeroStep = swallow;
        zeroStep.steps = 0;            // no relaxation -> penetration NOT fixed
        const drape::DrapeResult deep = drape::drapePiece(*front38, zeroStep);
        const drape::DrapeResult fixed = drape::drapePiece(*front38, swallow);
        check(deep.bodyPenetrationMM > 100.0,
              "detector sees penetration: unsettled flat sheet is deep inside the cylinder");
        check(fixed.bodyPenetrationMM < deep.bodyPenetrationMM,
              "settling REDUCES penetration (collision push works)");
    }

    // --- 6. honest refuse ---
    {
        PatternPiece empty;
        empty.name = "Empty";
        const drape::ClothMesh badMesh = drape::buildCloth(empty, flat);
        check(!badMesh.ok, "empty piece refused (no closed outline)");
        const drape::DrapeResult bad = drape::drapePiece(empty, flat);
        check(!bad.ok, "drapePiece on empty piece is Err (no fabricated preview)");

        drape::DrapeOptions tooCoarse = flat;
        tooCoarse.cellMM = 100000.0;
        const drape::DrapeResult coarse = drape::drapePiece(*front38, tooCoarse);
        check(!coarse.ok, "absurdly coarse cell refused (fewer than 3 particles)");
    }

    // --- cross-body: a different body drapes to a DIFFERENT 3D shape ---
    DraftedPattern patPearOut;
    const PatternPiece* frontPear = draftPiece(loaded.value, bodyPear(), 450, "Front", patPearOut);
    check(frontPear != nullptr, "drafted skirt Front for pear body");
    if (frontPear) {
        const drape::DrapeResult rp = drape::drapePiece(*frontPear, flat);
        check(rp.ok, "pear drape ok");
        const bool differ = rp.particleCount != r1.particleCount ||
                            std::abs(rp.dropFromFlatMM - r1.dropFromFlatMM) > 0.5;
        check(differ, "a different body drapes to a measurably different 3D shape");
    }

    // --- SVG is produced and non-trivial (has drawn polygons) ---
    {
        const std::string svg = drape::drapeSVG(w1, wrap);
        check(svg.find("<polygon") != std::string::npos, "drape SVG contains rendered cloth polygons");
        check(svg.find("nan") == std::string::npos && svg.find("inf") == std::string::npos,
              "drape SVG has no nan/inf coordinates");
    }

    std::printf("\n%s: %d checks failed\n", failures == 0 ? "PASS" : "FAIL", failures);
    return failures == 0 ? 0 : 1;
}
