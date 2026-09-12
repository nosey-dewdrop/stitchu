// nest_check: the MARKER / NESTING gate (PIPELINE Aşama 6 — marker/yerleşim).
// The one claim a marker must earn is GEOMETRIC, not visual: no two placed cut
// pieces overlap. This test proves it on the TRUE cut polygons (flattened with
// the motor's own flattenCubic), pair by pair, with ZERO tolerance — not a
// bounding-box approximation. It also proves the rest of the marker contract:
//   1. overlap = 0 over ALL placement pairs (real polygon intersection).
//   2. every placed piece is inside the fabric width [0, W] (and x >= 0, y >= 0).
//   3. the reported efficiency is the MEASURED piece area ÷ the consumed fabric
//      rectangle (width × roll length), and 0 < efficiency <= 1 (a real marker
//      never claims more usable area than the fabric it consumes).
//   4. determinism: same recipe + body + param + width → the same placements
//      (same rotations + offsets), twice.
//   5. honest refuse (RULES invariant 1): a piece wider than the fabric in both
//      orientations → ok=false with a reason, NEVER a silent drop.
//   6. a controlled overlap IS detected: two copies of one polygon at the same
//      spot report overlap==true (the test's own smoke — a green gate that could
//      not see overlap is worthless).
// Runs on both recipes (skirt.aline.dart + shift-dress top kernel) across the
// pinned bodies and two industry fabric widths (900mm / 1400mm).
//   usage: nest_check <skirt-aline-dart.json> <shift-dress-square-spaghetti.json>
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/nest.hpp"
#include "../src/recipe.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static BodyMeasurementsSnapshot bodyFor(const std::string& id) {
    if (id == "EU38") return {88, 70, 94, 37, 40.5, 58, 35};
    if (id == "pear") return {96, 70, 116, 37, 41, 58, 36};
    if (id == "bigNeckSmallShoulder") return {100, 84, 104, 30, 40, 58, 50};
    return {};
}

// Count overlapping placement pairs on the TRUE placed cut polygons.
static int overlapCount(const std::vector<nest::PiecePolygon>& polys,
                        const nest::NestResult& r) {
    int n = 0;
    std::vector<std::vector<Point>> placed;
    for (const auto& pl : r.placements) placed.push_back(nest::placedPolygon(polys, pl));
    for (size_t i = 0; i < placed.size(); ++i)
        for (size_t j = i + 1; j < placed.size(); ++j)
            if (nest::polygonsOverlap(placed[i], placed[j])) ++n;
    return n;
}

// Are all placed pieces inside the fabric strip [0,W] x [0,inf)?
static bool insideFabric(const std::vector<nest::PiecePolygon>& polys,
                         const nest::NestResult& r) {
    for (const auto& pl : r.placements) {
        const Rect b = nest::polygonBounds(nest::placedPolygon(polys, pl));
        if (b.x < -1e-6) return false;
        if (b.x + b.width > r.fabricWidthMM + 1e-6) return false;
        if (b.y < -1e-6) return false;
    }
    return true;
}

static void runCase(const recipe::Recipe& rc, const std::string& tag,
                    const std::string& bodyId, double paramMM, double widthMM) {
    const auto pn = recipe::recipeParamNames(rc);
    const auto drafted = recipe::draftRecipe(rc, bodyFor(bodyId), {{pn[0], paramMM}});
    if (!drafted.ok) { check(false, tag + " draft: " + drafted.error); return; }
    const auto polys = nest::piecePolygons(drafted.value);
    check(polys.size() >= 2, tag + " has >= 2 nestable pieces (" + std::to_string(polys.size()) + ")");

    const auto r = nest::nestPieces(polys, widthMM);
    if (!r.ok) { check(false, tag + " nest refused: " + r.error); return; }

    // 1) overlap = 0 over all pairs (true polygons).
    const int ov = overlapCount(polys, r);
    check(ov == 0, tag + " overlap==0 over all " +
          std::to_string(r.placements.size()) + " placements (found " +
          std::to_string(ov) + ")");

    // 2) every piece inside fabric width.
    check(insideFabric(polys, r), tag + " every piece inside fabric width [0," +
          std::to_string((long)widthMM) + "]mm");

    // every piece placed (none silently dropped).
    check(r.placements.size() == polys.size(), tag + " all " +
          std::to_string(polys.size()) + " pieces placed");

    // 3) efficiency is measured area / consumed rectangle, in (0, 1].
    double areaSum = 0.0;
    for (const auto& p : polys) areaSum += p.area;
    const double denom = r.fabricWidthMM * r.usedLengthMM;
    const double expectedEff = denom > 0 ? areaSum / denom : 0.0;
    check(std::abs(r.efficiency - expectedEff) < 1e-9,
          tag + " efficiency == measured area/rect");
    check(r.efficiency > 0.0 && r.efficiency <= 1.0 + 1e-9,
          tag + " efficiency in (0,1]: " + std::to_string(r.efficiency * 100.0) + "%");

    // 4) determinism: rerun, same placements.
    const auto r2 = nest::nestPieces(polys, widthMM);
    bool same = r2.ok && r2.placements.size() == r.placements.size();
    for (size_t i = 0; same && i < r.placements.size(); ++i) {
        const auto& a = r.placements[i];
        const auto& b = r2.placements[i];
        same = a.pieceIndex == b.pieceIndex && a.rotated90 == b.rotated90 &&
               std::abs(a.dx - b.dx) < 1e-12 && std::abs(a.dy - b.dy) < 1e-12;
    }
    check(same, tag + " deterministic (identical placements on rerun)");

    std::printf("    -> %s/%s: %.1fmm roll, %.1f%% eff, %zu pcs @ %.0fmm\n",
                tag.c_str(), bodyId.c_str(), r.usedLengthMM, r.efficiency * 100.0,
                r.placements.size(), widthMM);
}

int main(int argc, char** argv) {
    if (argc < 3) {
        std::fprintf(stderr, "usage: nest_check <skirt.json> <dress.json>\n");
        return 2;
    }
    const auto skirt = recipe::loadRecipeFile(argv[1]);
    const auto dress = recipe::loadRecipeFile(argv[2]);
    if (!skirt.ok || !dress.ok) {
        std::fprintf(stderr, "recipe load failed\n");
        return 1;
    }

    // Real marker runs: both recipes, pinned bodies, two industry fabric widths.
    runCase(skirt.value, "skirt", "EU38", 450, 1400);
    runCase(skirt.value, "skirt", "pear", 650, 900);
    runCase(skirt.value, "skirt", "bigNeckSmallShoulder", 900, 1400);
    runCase(dress.value, "dress", "EU38", 300, 1400);
    runCase(dress.value, "dress", "pear", 420, 900);

    // 5) honest refuse: a fabric narrower than the narrowest piece must be Err,
    //    not a silent placement. Use a 1mm-wide fabric — no real piece fits.
    {
        const auto pn = recipe::recipeParamNames(skirt.value);
        const auto d = recipe::draftRecipe(skirt.value, bodyFor("EU38"), {{pn[0], 450}});
        const auto polys = nest::piecePolygons(d.value);
        const auto r = nest::nestPieces(polys, 1.0);
        check(!r.ok && !r.error.empty(), "honest refuse: 1mm fabric -> Err (no silent drop)");
    }

    // 6) smoke: the overlap detector MUST fire on a real overlap. Nest one recipe
    //    normally, then jam a second copy of piece 0 exactly on top of the first
    //    placement — polygonsOverlap must see it.
    {
        const auto pn = recipe::recipeParamNames(skirt.value);
        const auto d = recipe::draftRecipe(skirt.value, bodyFor("EU38"), {{pn[0], 450}});
        const auto polys = nest::piecePolygons(d.value);
        const auto self = polys[0].pts;
        check(nest::polygonsOverlap(self, self),
              "smoke: a polygon overlaps itself (detector is live)");
        // a copy shifted by half its width still overlaps.
        const Rect b = nest::polygonBounds(self);
        std::vector<Point> shifted;
        for (const auto& p : self) shifted.push_back({p.x + b.width * 0.5, p.y});
        check(nest::polygonsOverlap(self, shifted),
              "smoke: half-width-shifted copy overlaps (detector is live)");
        // a copy shifted far away does NOT overlap (no false positive).
        std::vector<Point> away;
        for (const auto& p : self) away.push_back({p.x + b.width + 100.0, p.y});
        check(!nest::polygonsOverlap(self, away),
              "smoke: far-apart copies do NOT overlap (no false positive)");
    }

    std::printf("nest_check: %s (%d failures)\n", failures ? "FAIL" : "PASS", failures);
    return failures ? 1 : 0;
}
