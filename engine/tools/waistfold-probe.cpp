// waistfold-probe — DIAGNOSTIC ONLY, no production path touches this.
//
// Why it exists (T9/h3c, tur 4): the flattened waist polygon of the torso
// panels folds back on itself in its LAST one or two arcs on exactly three of
// the eight sizes (EU42 front, EU46 back, EU48 front). Every arc keeps its 3D
// length (boundary strain stays at 0.09-0.15%), so the defect is not a metric
// error and not a length error — it is a DIRECTION error: the turn angle at the
// corner where the waist meets the side seam jumps from ~0.7 deg to 40-90 deg.
//
// Three hypotheses were on the table: (a) the flatten solver, (b) the contour
// `cv` ordering, (c) an off-by-one in the waist/side boundary labelling. (b)
// and (c) are settled by construction in surfacepattern.cpp (the waist columns
// are pushed in a strictly ascending j loop, and push() records the edge index
// before it appends, so the last waist edge cannot be a side edge). This probe
// settles (a) EMPIRICALLY: it re-runs buildSheathPattern with solver knobs that
// must not change the geometry (round counts, iteration counts) and prints the
// fold. If the fold moves, appears or vanishes under a knob that carries no
// geometric meaning, the fold belongs to the solver.
//
// Usage: waistfold-probe [EU34 EU36 ...]
#include <cmath>
#include <cstdio>
#include <cstring>
#include <string>
#include <vector>

#include "bodysurface.hpp"
#include "sizechart.hpp"
#include "surfacepattern.hpp"

using namespace stitchu;

namespace {

struct Fold {
    double maxTurnDeg = 0.0;
    int at = -1;        // waist arc index of the worst turn
    int nBig = 0;       // arcs whose turn exceeds 5 deg
    double lenMM = 0.0;
};

// The turn angle between waist arc k and waist arc k+1. Dart legs sit BETWEEN
// two waist arcs in the contour, so consecutive waistEdges entries are only
// adjacent when their edge indices differ by exactly one; anywhere else the
// waist is legitimately interrupted and no turn is defined.
Fold foldOf(const SurfacePanel& p) {
    Fold f;
    const int n = static_cast<int>(p.contour.size());
    const std::vector<int>& w = p.waistEdges;
    for (size_t k = 0; k + 1 < w.size(); ++k) {
        const int e0 = w[k], e1 = w[k + 1];
        f.lenMM += std::hypot(p.contour[(e0 + 1) % n].x - p.contour[e0].x,
                              p.contour[(e0 + 1) % n].y - p.contour[e0].y);
        if (e1 != e0 + 1) continue;
        const double ax = p.contour[(e0 + 1) % n].x - p.contour[e0].x;
        const double ay = p.contour[(e0 + 1) % n].y - p.contour[e0].y;
        const double bx = p.contour[(e1 + 1) % n].x - p.contour[e1].x;
        const double by = p.contour[(e1 + 1) % n].y - p.contour[e1].y;
        const double t = std::atan2(ax * by - ay * bx, ax * bx + ay * by) * 180.0 / M_PI;
        if (std::fabs(t) > 5.0) ++f.nBig;
        if (std::fabs(t) > std::fabs(f.maxTurnDeg)) {
            f.maxTurnDeg = t;
            f.at = static_cast<int>(k);
        }
    }
    if (!w.empty()) {
        const int e = w.back();
        f.lenMM += std::hypot(p.contour[(e + 1) % n].x - p.contour[e].x,
                              p.contour[(e + 1) % n].y - p.contour[e].y);
    }
    return f;
}

// same two constants the production tool uses (tools/surface-pattern.cpp)
constexpr double kStatureMM = 1680.0;
constexpr double kCapMM = 60.0;

void run(const std::string& size, const char* label, const SheathOptions& opt) {
    const SizeChartEntry* entry = euSize(size);
    if (!entry) {
        std::fprintf(stderr, "unknown size: %s\n", size.c_str());
        return;
    }
    const BodySurface body(entry->body, kStatureMM, kCapMM);
    const SurfacePattern pat = buildSheathPattern(body, opt);
    double worst = 0.0;
    std::string worstPanel = "-";
    int worstAt = -1, worstN = 0;
    for (const SurfacePanel& p : pat.panels) {
        if (p.name.find("torso") == std::string::npos) continue;
        const Fold f = foldOf(p);
        if (std::fabs(f.maxTurnDeg) > std::fabs(worst)) {
            worst = f.maxTurnDeg;
            worstPanel = p.name;
            worstAt = f.at;
        }
        worstN += f.nBig;
    }
    std::printf("%-6s %-16s worst turn %+8.2f deg  panel %-14s arc %3d  arcs>5deg %2d"
                "  bodiceWaist-ring %+8.4fmm\n",
                size.c_str(), label, worst, worstPanel.c_str(), worstAt, worstN,
                pat.bodiceWaistSumMM - pat.ringGirthMM);
}

}  // namespace

int main(int argc, char** argv) {
    std::vector<std::string> sizes;
    for (int i = 1; i < argc; ++i) sizes.push_back(argv[i]);
    if (sizes.empty())
        sizes = {"EU34", "EU36", "EU38", "EU40", "EU42", "EU44", "EU46", "EU48"};

    for (const std::string& s : sizes) {
        const SheathOptions base;
        run(s, "base", base);
        {  // one extra alternation of {relax, project} — geometry unchanged
            SheathOptions o = base;
            o.cutRounds = base.cutRounds + 1;
            run(s, "cutRounds+1", o);
        }
        {  // one extra ARAP local/global round — geometry unchanged
            SheathOptions o = base;
            o.arapRounds = base.arapRounds + 1;
            run(s, "arapRounds+1", o);
        }
        {  // the hard length projection turned OFF: if the fold is the
           // projection's doing, it goes away here (and the lengths go wrong)
            SheathOptions o = base;
            o.cutSweeps = 0;
            run(s, "cutSweeps=0", o);
        }
        {  // the boundary emphasis dropped to the interior's weight
            SheathOptions o = base;
            o.cutEmphasis = 1.0;
            run(s, "cutEmphasis=1", o);
        }
        std::printf("\n");
    }
    return 0;
}
