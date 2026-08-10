// Draws the garment shell so a person can judge it. Three axonometric views out
// of ONE surface — the three-quarter is the one a 2D pen cannot fake, which is
// why it is here.
//
// The silhouette is not traced off a mesh. For each ring the section is a convex
// plane curve, so its outline in a given view is the extreme of the projection
// over the ring, found on the curve itself. The body underneath is drawn in the
// same pass with zero ease, so the gap between the two lines IS the ease.
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/bodysurface.hpp"
#include "../src/garmentshell.hpp"
#include "../src/sizechart.hpp"

using namespace stitchu;

namespace {

constexpr double kPi = 3.14159265358979323846;
constexpr double kStatureMM = 1680.0;  // ASSUMPTION: as in body_volume_check
constexpr double kCapMM = 60.0;

struct View {
    const char* label;
    double azimuthDeg;
    double elevationDeg;
};

struct P2 {
    double x = 0, y = 0;
};

P2 project(Vec3 p, double azRad, double elRad) {
    const Vec3 right{-std::sin(azRad), std::cos(azRad), 0.0};
    const Vec3 up{-std::cos(azRad) * std::sin(elRad), -std::sin(azRad) * std::sin(elRad),
                  std::cos(elRad)};
    return P2{dot(p, right), dot(p, up)};
}

std::string path(const std::vector<P2>& pts, bool close) {
    std::string d;
    char buf[64];
    for (size_t i = 0; i < pts.size(); ++i) {
        std::snprintf(buf, sizeof(buf), "%s%.3f %.3f", i == 0 ? "M" : "L", pts[i].x, pts[i].y);
        d += buf;
        if (i + 1 < pts.size()) d += " ";
    }
    if (close) d += " Z";
    return d;
}

}  // namespace

int main(int argc, char** argv) {
    const std::string out = argc > 1 ? argv[1] : "shell.svg";

    const SizeChartEntry* eu38 = euSize("EU38");
    if (!eu38) {
        std::printf("EU38 chart entry missing\n");
        return 1;
    }
    const BodySurface body(eu38->body, kStatureMM, kCapMM);

    double neckZ = 0, hipZ = 0;
    for (const BodyLevel& lv : body.levels()) {
        if (lv.name == "neck") neckZ = lv.heightMM;
        if (lv.name == "hip") hipZ = lv.heightMM;
    }
    const double topZ = neckZ - 40.0;  // DESIGN: neckline drop
    const double hemZ = hipZ + 10.0;   // DESIGN: hem above the hip ring

    const std::vector<EaseRing> ease = {
        {"neck", 0.0}, {"bust", 80.0}, {"waist", 60.0}, {"hip", 60.0}};
    const GarmentShell shell(body, ease, topZ, hemZ);
    const std::vector<EaseRing> none = {
        {"neck", 0.0}, {"bust", 0.0}, {"waist", 0.0}, {"hip", 0.0}};
    const GarmentShell skin(body, none, topZ, hemZ);

    const ShellMeasurement m = shell.measure(32, 32, 10);
    const PinchReport pr = shell.pinch();

    const View views[] = {{"ON", 0.0, 8.0}, {"UC CEYREK", 40.0, 14.0}, {"YAN", 90.0, 8.0}};
    const int kRings = 26;
    const int kMeridians = 24;
    const int kRingSamples = 240;

    // Layout: three panels, one scale for all of them so the views are
    // comparable rather than each fitted to its own box.
    const double pxPerMM = 0.62;
    const double panelW = 260.0;
    const double panelH = 560.0;
    const double margin = 40.0;
    const double totalW = margin * 2 + panelW * 3;
    const double totalH = margin * 2 + panelH + 90.0;
    const double midZ = 0.5 * (topZ + hemZ);

    std::string svg;
    char buf[512];
    std::snprintf(buf, sizeof(buf),
                  "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"%.0f\" height=\"%.0f\" "
                  "viewBox=\"0 0 %.0f %.0f\">\n<rect width=\"100%%\" height=\"100%%\" "
                  "fill=\"#ffffff\"/>\n",
                  totalW, totalH, totalW, totalH);
    svg += buf;
    svg +=
        "<g font-family=\"Helvetica Neue, Helvetica, Arial\" font-size=\"9\" fill=\"#111\" "
        "letter-spacing=\"1.6\">\n";

    for (int v = 0; v < 3; ++v) {
        const double az = views[v].azimuthDeg * kPi / 180.0;
        const double el = views[v].elevationDeg * kPi / 180.0;
        const double cx = margin + panelW * v + panelW * 0.5;
        const double cy = margin + panelH * 0.5;

        auto toScreen = [&](Vec3 p) {
            P2 q = project(p, az, el);
            return P2{cx + q.x * pxPerMM, cy - (q.y - midZ) * pxPerMM};
        };

        std::snprintf(buf, sizeof(buf), "<g id=\"view-%d\">\n", v);
        svg += buf;

        // Body underneath, dashed: the line the ease is measured from.
        for (const GarmentShell* s : {&skin}) {
            for (int i = 0; i <= kRings; ++i) {
                const double t = s->tTop() + (s->tBottom() - s->tTop()) * i / kRings;
                std::vector<P2> ring;
                Surface surf = s->surface();
                for (int k = 0; k <= kRingSamples; ++k) {
                    ring.push_back(toScreen(surf(t, 2.0 * kPi * k / kRingSamples)));
                }
                if (i == 0 || i == kRings) continue;
                svg += "<path d=\"" + path(ring, true) +
                       "\" fill=\"none\" stroke=\"#c9c9c9\" stroke-width=\"0.3\" "
                       "stroke-dasharray=\"2 3\"/>\n";
            }
        }

        // Garment rings.
        Surface surf = shell.surface();
        for (int i = 0; i <= kRings; ++i) {
            const double t = shell.tTop() + (shell.tBottom() - shell.tTop()) * i / kRings;
            std::vector<P2> ring;
            for (int k = 0; k <= kRingSamples; ++k) {
                ring.push_back(toScreen(surf(t, 2.0 * kPi * k / kRingSamples)));
            }
            const bool edge = (i == 0 || i == kRings);
            svg += "<path d=\"" + path(ring, true) +
                   (edge ? "\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.1\"/>\n"
                         : "\" fill=\"none\" stroke=\"#8f8f8f\" stroke-width=\"0.35\"/>\n");
        }

        // Meridians.
        for (int k = 0; k < kMeridians; ++k) {
            const double phi = 2.0 * kPi * k / kMeridians;
            std::vector<P2> line;
            for (int i = 0; i <= 120; ++i) {
                const double t = shell.tTop() + (shell.tBottom() - shell.tTop()) * i / 120;
                line.push_back(toScreen(surf(t, phi)));
            }
            svg += "<path d=\"" + path(line, false) +
                   "\" fill=\"none\" stroke=\"#8f8f8f\" stroke-width=\"0.25\"/>\n";
        }

        // Silhouette: on each ring, the extreme of the projection. The section is
        // convex, so this is the true outline of the surface in this view.
        std::vector<P2> leftEdge, rightEdge;
        for (int i = 0; i <= 200; ++i) {
            const double t = shell.tTop() + (shell.tBottom() - shell.tTop()) * i / 200;
            P2 lo{1e300, 0}, hi{-1e300, 0};
            for (int k = 0; k < 720; ++k) {
                const P2 q = toScreen(surf(t, 2.0 * kPi * k / 720));
                if (q.x < lo.x) lo = q;
                if (q.x > hi.x) hi = q;
            }
            leftEdge.push_back(lo);
            rightEdge.push_back(hi);
        }
        svg += "<path d=\"" + path(leftEdge, false) +
               "\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.6\"/>\n";
        svg += "<path d=\"" + path(rightEdge, false) +
               "\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.6\"/>\n";

        std::snprintf(buf, sizeof(buf),
                      "<text x=\"%.1f\" y=\"%.1f\" text-anchor=\"middle\">%s</text>\n</g>\n", cx,
                      margin + panelH + 18.0, views[v].label);
        svg += buf;
    }

    std::snprintf(buf, sizeof(buf),
                  "<text x=\"%.1f\" y=\"%.1f\" font-size=\"8\" fill=\"#555\">EU38 · bolluk "
                  "gogus 80mm bel 60mm kalca 60mm · BOLLUK HACMI %.1f cm3 · giysi %.1f cm3 · "
                  "govde %.1f cm3 · yuzey %.1f cm2 · en dar pay %.1f mm</text>\n",
                  margin, totalH - 34.0, m.easeVolumeMM3 / 1000.0, m.garmentVolumeMM3 / 1000.0,
                  m.bodyVolumeMM3 / 1000.0, m.areaMM2 / 100.0, pr.marginMM);
    svg += buf;
    std::snprintf(buf, sizeof(buf),
                  "<text x=\"%.1f\" y=\"%.1f\" font-size=\"8\" fill=\"#555\">Steiner tanigi: "
                  "cevre %.1e mm · alan %.1e mm2 · kesikli cizgi govde, duz cizgi giysi</text>\n",
                  margin, totalH - 20.0, m.worstSteinerGirthMM, m.worstSteinerAreaMM2);
    svg += buf;
    svg += "</g>\n</svg>\n";

    FILE* f = std::fopen(out.c_str(), "w");
    if (!f) {
        std::printf("cannot write %s\n", out.c_str());
        return 1;
    }
    std::fwrite(svg.data(), 1, svg.size(), f);
    std::fclose(f);
    std::printf("%s yazildi · bolluk hacmi %.1f cm3 · en dar pay %.2f mm\n", out.c_str(),
                m.easeVolumeMM3 / 1000.0, pr.marginMM);
    return 0;
}
