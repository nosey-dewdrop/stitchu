// arapconv-probe — DIAGNOSTIC ONLY, no production path touches this.
//
// The tur-4 waistfold-probe answered WHERE the waist fold comes from (the ARAP
// solve, not the contour and not the hard projection). This probe answers
// whether the convergence stop fixed it, and it prints the three numbers that
// have to move together for that claim to hold, per size, in one line:
//
//   * worst waist turn angle over the torso panels — the fold itself;
//   * bodiceWaistSum − ringGirth — the h3c residual in mm;
//   * maxStrain per panel, worst and where — the separate 28-35% red measured
//     on exactly the same three sizes (EU42/46/48), which may or may not share
//     the fold's root cause.
//
// Usage: arapconv-probe [EU34 EU36 ...]
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "bodysurface.hpp"
#include "sizechart.hpp"
#include "surfacepattern.hpp"

using namespace stitchu;

namespace {

// Copy of waistfold-probe's turn measure, so the two probes are comparable.
// Dart legs sit BETWEEN two waist arcs, so consecutive waistEdges entries are
// only adjacent when their edge indices differ by exactly one.
double worstTurnDeg(const SurfacePanel& p) {
    const int n = static_cast<int>(p.contour.size());
    const std::vector<int>& w = p.waistEdges;
    double worst = 0.0;
    for (size_t k = 0; k + 1 < w.size(); ++k) {
        const int e0 = w[k], e1 = w[k + 1];
        if (e1 != e0 + 1) continue;
        const double ax = p.contour[(e0 + 1) % n].x - p.contour[e0].x;
        const double ay = p.contour[(e0 + 1) % n].y - p.contour[e0].y;
        const double bx = p.contour[(e1 + 1) % n].x - p.contour[e1].x;
        const double by = p.contour[(e1 + 1) % n].y - p.contour[e1].y;
        const double t = std::atan2(ax * by - ay * bx, ax * bx + ay * by) * 180.0 / M_PI;
        if (std::fabs(t) > std::fabs(worst)) worst = t;
    }
    return worst;
}

constexpr double kStatureMM = 1680.0;
constexpr double kCapMM = 60.0;

}  // namespace

int main(int argc, char** argv) {
    std::vector<std::string> sizes;
    for (int i = 1; i < argc; ++i) sizes.push_back(argv[i]);
    if (sizes.empty())
        sizes = {"EU34", "EU36", "EU38", "EU40", "EU42", "EU44", "EU46", "EU48"};

    for (const std::string& s : sizes) {
        const SizeChartEntry* entry = euSize(s);
        if (!entry) {
            std::fprintf(stderr, "unknown size: %s\n", s.c_str());
            continue;
        }
        const BodySurface body(entry->body, kStatureMM, kCapMM);
        const SheathOptions opt;
        const SurfacePattern pat = buildSheathPattern(body, opt);

        double turn = 0.0;
        double strain = 0.0;
        std::string strainPanel = "-";
        for (const SurfacePanel& p : pat.panels) {
            if (p.maxStrain > strain) {
                strain = p.maxStrain;
                strainPanel = p.name;
            }
            if (p.name.find("torso") == std::string::npos) continue;
            const double t = worstTurnDeg(p);
            if (std::fabs(t) > std::fabs(turn)) turn = t;
        }
        std::printf("%-6s waistTurn %+8.2f deg  bodiceWaist-ring %+9.4f mm"
                    "  maxStrain %7.4f%%  (%s)\n",
                    s.c_str(), turn, pat.bodiceWaistSumMM - pat.ringGirthMM,
                    strain * 100.0, strainPanel.c_str());
    }
    return 0;
}
