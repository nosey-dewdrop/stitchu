// surface-pattern: emits the single-surface sheath as a GarmentCode-shaped
// specification.json, so the EXISTING referees (h3b-rings.py, walk.py
// edge_length_mm) judge the new line with no referee changes. Panel names
// carry the walk.py roles: ftorso/btorso -> torso, skirt_* -> skirt.
//
// Usage: surface-pattern [size] [--svg out.svg] > spec.json    (coords in cm)
#include <cstdio>
#include <algorithm>
#include <cmath>
#include <cstring>
#include <string>
#include <vector>

#include "../src/bodysurface.hpp"
#include "../src/sizechart.hpp"
#include "../src/surfacepattern.hpp"

using namespace stitchu;

namespace {

constexpr double kStatureMM = 1680.0;  // ASSUMPTION: as in body_volume_check
constexpr double kCapMM = 60.0;

void emitPanel(const SurfacePanel& p, bool last) {
    std::printf("    \"%s\": {\n", p.name.c_str());
    std::printf("      \"translation\": [0.0, 0.0, 0.0],\n");
    std::printf("      \"rotation\": [0.0, 0.0, 0.0],\n");
    std::printf("      \"label\": \"%s\",\n", p.name.c_str());
    std::printf("      \"vertices\": [");
    for (size_t i = 0; i < p.contour.size(); ++i)
        std::printf("%s[%.6f, %.6f]", i ? ", " : "", p.contour[i].x / 10.0, p.contour[i].y / 10.0);
    std::printf("],\n      \"edges\": [");
    const int n = static_cast<int>(p.contour.size());
    for (int k = 0; k < n; ++k)
        std::printf("%s{\"endpoints\": [%d, %d]}", k ? ", " : "", k, (k + 1) % n);
    std::printf("]\n    }%s\n", last ? "" : ",");
}

void writeSvg(const char* path, const SurfacePattern& pat) {
    FILE* f = std::fopen(path, "w");
    if (!f) return;
    // lay panels left to right, normalized to each bounding box
    double x0 = 20;
    std::string body;
    double maxH = 0;
    std::vector<std::string> parts;
    for (const SurfacePanel& p : pat.panels) {
        double mnx = 1e18, mny = 1e18, mxx = -1e18, mxy = -1e18;
        for (const Vec2& v : p.contour) {
            mnx = std::min(mnx, v.x); mny = std::min(mny, v.y);
            mxx = std::max(mxx, v.x); mxy = std::max(mxy, v.y);
        }
        std::string pts;
        char buf[64];
        for (const Vec2& v : p.contour) {
            std::snprintf(buf, sizeof buf, "%.2f,%.2f ", x0 + v.x - mnx, 20 + v.y - mny);
            pts += buf;
        }
        std::snprintf(buf, sizeof buf, "%.1f", x0);
        parts.push_back("<polygon points=\"" + pts +
                        "\" fill=\"none\" stroke=\"black\" stroke-width=\"1\"/>"
                        "<text x=\"" + buf + "\" y=\"14\" font-size=\"11\">" + p.name + "</text>");
        x0 += (mxx - mnx) + 30;
        maxH = std::max(maxH, mxy - mny);
    }
    std::fprintf(f, "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"%.0f\" height=\"%.0f\" "
                    "viewBox=\"0 0 %.0f %.0f\">\n", x0, maxH + 50, x0, maxH + 50);
    for (const auto& s : parts) std::fprintf(f, "%s\n", s.c_str());
    std::fprintf(f, "</svg>\n");
    std::fclose(f);
}

}  // namespace

int main(int argc, char** argv) {
    std::string size = "EU38";
    const char* svgPath = nullptr;
    for (int i = 1; i < argc; ++i) {
        if (!std::strcmp(argv[i], "--svg") && i + 1 < argc) svgPath = argv[++i];
        else size = argv[i];
    }
    const SizeChartEntry* entry = euSize(size);
    if (!entry) {
        std::fprintf(stderr, "unknown size: %s\n", size.c_str());
        return 1;
    }
    const BodySurface body(entry->body, kStatureMM, kCapMM);
    const SurfacePattern pat = buildSheathPattern(body);

    std::printf("{\n  \"pattern\": {\n  \"panels\": {\n");
    for (size_t i = 0; i < pat.panels.size(); ++i)
        emitPanel(pat.panels[i], i + 1 == pat.panels.size());
    std::printf("  },\n  \"stitches\": [");
    for (size_t i = 0; i < pat.stitches.size(); ++i) {
        const SurfaceStitch& st = pat.stitches[i];
        std::printf("%s\n    [{\"panel\": \"%s\", \"edge\": %d}, {\"panel\": \"%s\", \"edge\": %d}]",
                    i ? "," : "", pat.panels[st.pa].name.c_str(), st.ea,
                    pat.panels[st.pb].name.c_str(), st.eb);
    }
    std::printf("\n  ],\n  \"panel_order\": [");
    for (size_t i = 0; i < pat.panels.size(); ++i)
        std::printf("%s\"%s\"", i ? ", " : "", pat.panels[i].name.c_str());
    std::printf("]\n  },\n");
    std::printf("  \"properties\": {\"units_in_meter\": 100, \"origin\": \"stitchu surface motor\"}\n}\n");

    if (svgPath) writeSvg(svgPath, pat);

    std::fprintf(stderr,
                 "ring %.4fmm | bodice waist %.4fmm | skirt waist %.4fmm | diff %+.4fmm\n",
                 pat.ringGirthMM, pat.bodiceWaistSumMM, pat.skirtWaistSumMM,
                 pat.bodiceWaistSumMM - pat.skirtWaistSumMM);
    return 0;
}
