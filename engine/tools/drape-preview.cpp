// drape-preview (Aşama 2/6 tool): drafts a recipe for one body + param, drapes
// ONE named piece in 3D as a mass-spring cloth (drape.hpp), prints the measured
// diagnostics as JSON to stdout, and writes the projected drape SVG to a file.
// This is the FIRST real attempt at a 3D drape preview off the deterministic
// pattern geometry — it is NOT a physical/CLO3D simulation, it is a geometric
// preview (see drape.hpp scope note). The SVG is rasterized to PNG by
// tools/tracer/svg2png.mjs for the visual proof (RULES invariant 3).
//
//   usage: drape-preview <recipe.json> <EU38|pear|bigNeckSmallShoulder|custom:..>
//          <paramMM> <pieceName> <out.svg>
//
// A malformed input or a piece that cannot be draped is a hard error (no
// fabricated preview): nonzero exit + an honest message on stderr.
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <fstream>
#include <string>
#include <vector>

#include "../src/drape.hpp"
#include "../src/recipe.hpp"

using namespace stitchu;

namespace {
std::string num(double v) {
    char buf[64];
    std::snprintf(buf, sizeof(buf), "%.4f", v);
    return buf;
}
} // namespace

int main(int argc, char** argv) {
    if (argc < 6) {
        std::fprintf(stderr,
            "usage: drape-preview <recipe.json> <body> <paramMM> <pieceName> <out.svg>\n");
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
        double v[7]; int n = 0;
        const char* s = body.c_str() + 7; char* end = nullptr;
        while (n < 7) {
            v[n] = std::strtod(s, &end);
            if (end == s) break;
            ++n; s = end;
            if (*s == ',') ++s; else break;
        }
        if (n != 7 || *s != '\0') {
            std::fprintf(stderr, "custom body needs 7 CM values\n");
            return 2;
        }
        m = {v[0], v[1], v[2], v[3], v[4], v[5], v[6]};
    } else { std::fprintf(stderr, "unknown body '%s'\n", body.c_str()); return 2; }

    const double paramMM = std::strtod(argv[3], nullptr);
    const std::string pieceName = argv[4];
    const std::string outSvg = argv[5];

    const auto paramNames = recipe::recipeParamNames(loaded.value);
    if (paramNames.size() != 1) {
        std::fprintf(stderr, "recipe declares %zu params; tool binds one\n", paramNames.size());
        return 2;
    }
    const auto drafted = recipe::draftRecipe(loaded.value, m, {{paramNames[0], paramMM}});
    if (!drafted.ok) {
        std::fprintf(stderr, "draftRecipe failed: %s\n", drafted.error.c_str());
        return 1;
    }

    const PatternPiece* piece = nullptr;
    for (const auto& p : drafted.value.pieces)
        if (p.name == pieceName) { piece = &p; break; }
    if (!piece) {
        std::fprintf(stderr, "piece '%s' not in pattern. pieces:", pieceName.c_str());
        for (const auto& p : drafted.value.pieces) std::fprintf(stderr, " '%s'", p.name.c_str());
        std::fprintf(stderr, "\n");
        return 2;
    }

    // Body cylinder from the piece's own waist width: the pinned (top) edge span
    // is (a half of) the waist; a "cut on fold" piece is HALF the body, so the
    // full waist circumference ~ 2 * 2 * topSpan. Radius = circumference / 2pi.
    // We measure the top span from the flattened outline directly so the cylinder
    // matches THIS piece, never a magic constant.
    drape::DrapeOptions opts;
    opts.cellMM = 25.0;
    // Peek the polygon to size the body: reuse buildCloth to get it.
    drape::ClothMesh probe = drape::buildCloth(*piece, opts);
    if (!probe.ok) {
        std::fprintf(stderr, "buildCloth failed: %s\n", probe.error.c_str());
        return 1;
    }
    // Top-row (pinned) X span in the pattern frame -> half of it is half a body
    // quarter... keep it honest and simple: use the pinned span as an arc, and a
    // gentle radius so the drape wraps visibly without ballooning.
    double topMinX = 1e18, topMaxX = -1e18, topMinY = 1e18;
    for (size_t i = 0; i < probe.source2D.size(); ++i)
        topMinY = std::min(topMinY, probe.source2D[i].y);
    double centreX = 0.0; int topN = 0;
    for (size_t i = 0; i < probe.source2D.size(); ++i) {
        if (probe.pinned[i]) {
            topMinX = std::min(topMinX, probe.source2D[i].x);
            topMaxX = std::max(topMaxX, probe.source2D[i].x);
            centreX += probe.source2D[i].x; ++topN;
        }
    }
    const double topSpan = (topMaxX > topMinX) ? (topMaxX - topMinX) : 100.0;
    if (topN > 0) centreX /= topN;
    // Body cylinder sized so the pinned waist arc wraps its FRONT stretch-free:
    // a "cut on fold" front panel spans a QUARTER of the waist, so the full waist
    // circumference ~ 4 * topSpan and the radius is circumference / 2pi. This is
    // derived from THIS piece's own geometry, never a magic constant.
    const double circumference = 4.0 * topSpan;
    opts.bodyRadiusMM = circumference / (2.0 * 3.14159265358979323846);
    opts.bodyCenterX = centreX;
    // Place the body so the flat sheet (Z=0) sits just INSIDE the cylinder's front
    // by ~20% of the radius: the body-collision then PUSHES the cloth forward into
    // a real 3D wrap during settling (no rest-length-corrupting pre-wrap). The
    // wrap depth is bounded by the fabric — a panel narrower than the body arc
    // stops wrapping and hangs, which the strain diagnostic reports honestly.
    opts.bodyCenterZ = -opts.bodyRadiusMM * 0.80;
    opts.initialWrap = 0.0;   // build FLAT: rest lengths are the true fabric mm
    // A settle stiff enough to hold the fabric while the body pushes it round.
    opts.gravity = 30.0;
    opts.steps = 500;
    opts.kStructural = 1.0;
    opts.constraintPasses = 12;
    opts.damping = 0.06;

    const drape::DrapeResult res = drape::drapePiece(*piece, opts);
    if (!res.ok) {
        std::fprintf(stderr, "drape failed: %s\n", res.error.c_str());
        return 1;
    }

    // Write the projected SVG.
    const std::string svg = drape::drapeSVG(res, opts);
    std::ofstream out(outSvg, std::ios::binary);
    if (!out) { std::fprintf(stderr, "cannot write %s\n", outSvg.c_str()); return 1; }
    out << svg;
    out.close();

    // Emit diagnostics JSON to stdout (measured, not asserted).
    std::printf(
        "{\"recipe\":\"%s\",\"body\":\"%s\",\"piece\":\"%s\",\"paramMM\":%s,"
        "\"bodyRadiusMM\":%s,\"particles\":%d,\"springs\":%d,\"pinned\":%d,"
        "\"maxPinDriftMM\":%s,\"maxSpringStrain\":%s,\"bodyPenetrationMM\":%s,"
        "\"finalHeightMM\":%s,\"dropFromFlatMM\":%s,\"zSpreadMM\":%s,"
        "\"anyNaN\":%s,\"svg\":\"%s\"}\n",
        recipe::recipeId(loaded.value).c_str(), body.c_str(), pieceName.c_str(),
        num(paramMM).c_str(), num(opts.bodyRadiusMM).c_str(),
        res.particleCount, res.springCount, res.pinnedCount,
        num(res.maxPinDriftMM).c_str(), num(res.maxSpringStrain).c_str(),
        num(res.bodyPenetrationMM).c_str(), num(res.finalHeightMM).c_str(),
        num(res.dropFromFlatMM).c_str(), num(res.zSpreadMM).c_str(),
        res.anyNaN ? "true" : "false",
        outSvg.c_str());
    return 0;
}
