// shell-flat: the fashion FLAT (front/back technical drawing) computed as an
// orthographic projection of the garment shell — the same GarmentSurf the
// pattern is cut from (src/shellprojection.hpp for the one claim it makes).
//
// The flat's outer contour used to be DRAWN: tools/render-garment-flat.mjs takes
// it from a 2D croquis with zero ease, and at EU38 that croquis says the waist is
// 700.0mm while the pattern line says 724.89mm. Here the contour is COMPUTED, so
// the number the drawing shows and the number the pattern cuts come out of one
// object. Nothing in this tool scales, corrects or nudges a length: whatever the
// shell says is what is printed.
//
// Usage:
//   shell-flat [EU38] > flat.json      six measures + both contours, JSON
//   shell-flat [EU38] --svg > flat.svg the same contours as a 1:1 SVG
#include <cmath>
#include <cstdio>
#include <cstring>
#include <string>
#include <vector>

#include "../src/bodysurface.hpp"
#include "../src/shellprojection.hpp"
#include "../src/sizechart.hpp"
#include "../src/surfacepattern.hpp"

using namespace stitchu;

namespace {

constexpr double kStatureMM = 1680.0;  // ASSUMPTION, as in tools/surface-pattern.cpp
constexpr double kCapMM = 60.0;

void emitJson(const std::string& size, const ShellProjection& f, const ShellProjection& b) {
    std::printf("{\n  \"size\": \"%s\",\n  \"source\": \"GarmentSurf\",\n", size.c_str());
    std::printf("  \"measures\": [\n");
    for (size_t i = 0; i < f.measures.size(); ++i) {
        const ShellMeasure& m = f.measures[i];
        std::printf("    {\"name\": \"%s\", \"ring\": \"%s\", \"mm\": %.4f}%s\n",
                    m.name.c_str(), m.ring.c_str(), m.mm,
                    i + 1 == f.measures.size() ? "" : ",");
    }
    std::printf("  ],\n  \"views\": [\n");
    const ShellProjection* views[2] = {&f, &b};
    for (int v = 0; v < 2; ++v) {
        const ShellProjection& p = *views[v];
        std::printf("    {\n      \"view\": \"%s\",\n", p.front ? "front" : "back");
        std::printf("      \"topZMM\": %.4f,\n      \"bottomZMM\": %.4f,\n", p.topZMM, p.bottomZMM);
        std::printf("      \"spans\": [\n");
        for (size_t i = 0; i < p.spans.size(); ++i) {
            const ShellSpan& s = p.spans[i];
            std::printf("        {\"name\": \"%s\", \"firstPt\": %d, \"lastPt\": %d, "
                        "\"firstSeg\": %d, \"segCount\": %d, \"polyLenMM\": %.4f, "
                        "\"fitLenMM\": %.4f}%s\n",
                        s.name.c_str(), s.firstPt, s.lastPt, s.firstSeg, s.segCount,
                        s.polyLenMM, s.fitLenMM, i + 1 == p.spans.size() ? "" : ",");
        }
        std::printf("      ],\n      \"outline\": [\n");
        for (size_t i = 0; i < p.outline.size(); ++i)
            std::printf("        {\"x\": %.4f, \"z\": %.4f, \"span\": \"%s\"}%s\n",
                        p.outline[i].x, p.outline[i].y, p.ptSpan[i].c_str(),
                        i + 1 == p.outline.size() ? "" : ",");
        std::printf("      ],\n      \"segs\": [\n");
        for (size_t i = 0; i < p.segs.size(); ++i) {
            const CubicSeg& s = p.segs[i];
            std::printf("        {\"span\": \"%s\", \"p0\": [%.4f, %.4f], \"c1\": [%.4f, %.4f], "
                        "\"c2\": [%.4f, %.4f], \"p3\": [%.4f, %.4f]}%s\n",
                        p.segSpan[i].c_str(), s.p0.x, s.p0.y, s.c1.x, s.c1.y, s.c2.x,
                        s.c2.y, s.p3.x, s.p3.y, i + 1 == p.segs.size() ? "" : ",");
        }
        std::printf("      ]\n    }%s\n", v == 0 ? "," : "");
    }
    std::printf("  ]\n}\n");
}

// One closed silhouette: the fitted half from the top down, across the hem, and
// the mirrored half back up. y is flipped once, here, because SVG counts down
// and the shell counts up — declared rather than baked into the geometry.
std::string pathOf(const ShellProjection& p, double x0, double topZ) {
    auto X = [&](double x) { return x0 + x; };
    auto Y = [&](double z) { return topZ - z; };
    char buf[256];
    std::string d;
    std::snprintf(buf, sizeof buf, "M %.4f %.4f", X(p.segs.front().p0.x), Y(p.segs.front().p0.y));
    d += buf;
    for (const CubicSeg& s : p.segs) {
        std::snprintf(buf, sizeof buf, " C %.4f %.4f %.4f %.4f %.4f %.4f", X(s.c1.x), Y(s.c1.y),
                      X(s.c2.x), Y(s.c2.y), X(s.p3.x), Y(s.p3.y));
        d += buf;
    }
    const CubicSeg& last = p.segs.back();
    std::snprintf(buf, sizeof buf, " L %.4f %.4f", X(-last.p3.x), Y(last.p3.y));
    d += buf;
    for (size_t i = p.segs.size(); i-- > 0;) {
        const CubicSeg& s = p.segs[i];
        std::snprintf(buf, sizeof buf, " C %.4f %.4f %.4f %.4f %.4f %.4f", X(-s.c2.x), Y(s.c2.y),
                      X(-s.c1.x), Y(s.c1.y), X(-s.p0.x), Y(s.p0.y));
        d += buf;
    }
    d += " Z";
    return d;
}

void emitSvg(const std::string& size, const ShellProjection& f, const ShellProjection& b) {
    const double h = f.topZMM - f.bottomZMM;
    double wHalf = 0.0;
    for (const Vec2& p : f.outline) wHalf = std::max(wHalf, std::fabs(p.x));
    for (const Vec2& p : b.outline) wHalf = std::max(wHalf, std::fabs(p.x));
    const double pad = 40.0, gap = 80.0;
    const double panelW = 2 * wHalf;
    const double W = 2 * pad + 2 * panelW + gap, H = 2 * pad + h + 30.0;
    const double cxF = pad + wHalf, cxB = pad + panelW + gap + wHalf;
    // data-scale is the meaning of one user unit: 1 = one millimetre, i.e. 1:1.
    std::printf("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"%.2fmm\" height=\"%.2fmm\" "
                "viewBox=\"0 0 %.4f %.4f\" data-scale=\"1\" data-source=\"GarmentSurf\" "
                "data-size=\"%s\">\n",
                W, H, W, H, size.c_str());
    std::printf("  <g fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\">\n");
    std::printf("    <path data-view=\"front\" d=\"%s\"/>\n",
                pathOf(f, cxF, pad + f.topZMM).c_str());
    std::printf("    <path data-view=\"back\" d=\"%s\"/>\n",
                pathOf(b, cxB, pad + b.topZMM).c_str());
    std::printf("  </g>\n");
    std::printf("  <g font-family=\"sans-serif\" font-size=\"14\" text-anchor=\"middle\" "
                "fill=\"#111\">\n");
    std::printf("    <text x=\"%.4f\" y=\"%.4f\">FRONT %s</text>\n", cxF, H - 12.0, size.c_str());
    std::printf("    <text x=\"%.4f\" y=\"%.4f\">BACK %s</text>\n", cxB, H - 12.0, size.c_str());
    std::printf("  </g>\n</svg>\n");
}

}  // namespace

int main(int argc, char** argv) {
    std::string size = "EU38";
    bool svg = false;
    for (int i = 1; i < argc; ++i) {
        if (!std::strcmp(argv[i], "--svg")) svg = true;
        else size = argv[i];
    }
    const SizeChartEntry* entry = euSize(size);
    if (!entry) {
        std::fprintf(stderr, "unknown size: %s\n", size.c_str());
        return 1;
    }
    const BodySurface body(entry->body, kStatureMM, kCapMM);
    const SheathOptions opt;
    // THE SAME SHELL THE PATTERN IS CUT FROM. buildSheathPattern calls this very
    // function; if it stops doing so, this tool is measuring a different dress.
    const GarmentSurf surf = buildGarmentSurf(body, opt);
    const ShellProjection f = projectFront(surf);
    const ShellProjection b = projectBack(surf);
    if (svg) emitSvg(size, f, b);
    else emitJson(size, f, b);
    return 0;
}
