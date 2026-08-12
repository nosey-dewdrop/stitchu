// surface-pattern: emits the single-surface sheath as a GarmentCode-shaped
// specification.json. Boundary polylines are fitted to cubic Bézier edges so a
// panel carries a handful of smooth pattern edges (what printpack's notch and
// allowance machinery expects), not hundreds of 8mm stubs. Panel names carry
// the walk.py roles: ftorso/btorso -> torso, skirt_* -> skirt.
//
// Pairing safety: princess and side seams join panels that are exact mirror or
// rotation copies, so their fitted chains match segment for segment. The waist
// stitch joins two DIFFERENT curves (bodice vs skirt), so each waist run is
// forced to a SINGLE cubic on both sides — one stitch, one edge, both referees
// re-measure the result.
//
// Usage: surface-pattern [size] [--svg out.svg] > spec.json    (coords in cm)
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstring>
#include <cstdlib>
#include <string>
#include <vector>

#include "../src/bodysurface.hpp"
#include "../src/curvefit.hpp"
#include "../src/sizechart.hpp"
#include "../src/surfacepattern.hpp"

using namespace stitchu;

namespace {

constexpr double kStatureMM = 1680.0;  // ASSUMPTION: as in body_volume_check
constexpr double kCapMM = 60.0;
constexpr double kFitTolMM = 0.15;     // max fit deviation for seam chains

struct SpecEdge {
    int v0 = 0, v1 = 0;
    bool isLine = false;
    double r0x = 0, r0y = 0, r1x = 0, r1y = 0;  // rel control points (walk convention)
};

struct SpecPanel {
    std::string name;
    std::vector<Vec2> verts;              // mm
    std::vector<SpecEdge> edges;
    // chains of spec-edge indices per logical side
    std::vector<std::vector<int>> waist;  // one chain per waist run (single edge each)
    std::vector<std::array<int, 2>> dartLegs;
    std::vector<int> seam0, seam1, far;
    double worstFitMM = 0.0;
};

// abs control point -> walk.py rel coords: c = a + r0*(b-a) + r1*perp(b-a)
void relCoords(Vec2 a, Vec2 b, Vec2 c, double& r0, double& r1) {
    const double ex = b.x - a.x, ey = b.y - a.y;
    const double vx = c.x - a.x, vy = c.y - a.y;
    const double det = ex * ex + ey * ey;
    r0 = (vx * ex + vy * ey) / det;
    r1 = (ex * vy - ey * vx) / det;
}

double fitDeviation(const std::vector<CubicSeg>& segs, const std::vector<Vec2>& pts) {
    // distance from each source point to the densely sampled fitted chain
    std::vector<Vec2> samp;
    for (const CubicSeg& s : segs)
        for (int i = 0; i <= 96; ++i) {
            const double t = i / 96.0, u = 1 - t;
            samp.push_back({u * u * u * s.p0.x + 3 * u * u * t * s.c1.x + 3 * u * t * t * s.c2.x + t * t * t * s.p3.x,
                            u * u * u * s.p0.y + 3 * u * u * t * s.c1.y + 3 * u * t * t * s.c2.y + t * t * t * s.p3.y});
        }
    double worst = 0;
    for (const Vec2& p : pts) {
        double best = 1e18;
        for (const Vec2& q : samp) best = std::min(best, std::hypot(p.x - q.x, p.y - q.y));
        worst = std::max(worst, best);
    }
    return worst;
}

// appends a fitted chain for `pts`; returns spec-edge indices
std::vector<int> emitChain(SpecPanel& sp, const std::vector<Vec2>& pts, bool singleCubic) {
    const std::vector<CubicSeg> segs = fitCubics(pts, singleCubic ? 1e9 : kFitTolMM);
    sp.worstFitMM = std::max(sp.worstFitMM, fitDeviation(segs, pts));
    std::vector<int> out;
    for (size_t i = 0; i < segs.size(); ++i) {
        const CubicSeg& s = segs[i];
        const int v0 = i == 0 ? static_cast<int>(sp.verts.size()) - 1
                              : static_cast<int>(sp.verts.size()) - 1;
        sp.verts.push_back(s.p3);
        const int v1 = static_cast<int>(sp.verts.size()) - 1;
        SpecEdge e;
        e.v0 = v0;
        e.v1 = v1;
        relCoords(s.p0, s.p3, s.c1, e.r0x, e.r0y);
        double s0, s1;
        relCoords(s.p0, s.p3, s.c2, s0, s1);
        e.r1x = s0;
        e.r1y = s1;
        out.push_back(static_cast<int>(sp.edges.size()));
        sp.edges.push_back(e);
    }
    return out;
}

int emitLine(SpecPanel& sp, Vec2 to) {
    const int v0 = static_cast<int>(sp.verts.size()) - 1;
    sp.verts.push_back(to);
    SpecEdge e;
    e.v0 = v0;
    e.v1 = static_cast<int>(sp.verts.size()) - 1;
    e.isLine = true;
    sp.edges.push_back(e);
    return static_cast<int>(sp.edges.size()) - 1;
}

SpecPanel buildSpecPanel(const SurfacePanel& p) {
    SpecPanel sp;
    sp.name = p.name;
    const int n = static_cast<int>(p.contour.size());

    // tag every contour edge with (kind, id)
    enum Kind { W, LA, LB, S1, F, S0, NONE };
    struct Tag {
        Kind k = NONE;
        int id = 0;
    };
    std::vector<Tag> tag(n);
    for (size_t r = 0; r < p.waistRuns.size(); ++r)
        for (int e : p.waistRuns[r]) tag[e] = {W, static_cast<int>(r)};
    for (size_t d = 0; d < p.darts.size(); ++d) {
        for (int e : p.darts[d].legA) tag[e] = {LA, static_cast<int>(d)};
        for (int e : p.darts[d].legB) tag[e] = {LB, static_cast<int>(d)};
    }
    for (int e : p.seam1Edges) tag[e] = {S1, 0};
    for (int e : p.farEdges) tag[e] = {F, 0};
    for (int e : p.seam0Edges) tag[e] = {S0, 0};

    sp.dartLegs.assign(p.darts.size(), {-1, -1});
    sp.verts.push_back(p.contour[0]);
    int e = 0;
    while (e < n) {
        int last = e;
        while (last + 1 < n && tag[last + 1].k == tag[e].k && tag[last + 1].id == tag[e].id) ++last;
        std::vector<Vec2> pts;
        for (int k = e; k <= last + 1; ++k) pts.push_back(p.contour[k % n]);
        const Tag t = tag[e];
        if (t.k == LA)
            sp.dartLegs[t.id][0] = emitLine(sp, pts.back());
        else if (t.k == LB)
            sp.dartLegs[t.id][1] = emitLine(sp, pts.back());
        else {
            const bool single = (t.k == W);
            const std::vector<int> chain = emitChain(sp, pts, single);
            if (t.k == W) sp.waist.push_back(chain);
            if (t.k == S1) sp.seam1 = chain;
            if (t.k == S0) sp.seam0 = chain;
            if (t.k == F) sp.far = chain;
        }
        e = last + 1;
    }
    // close the loop: last emitted vertex duplicates contour[0]
    sp.verts.pop_back();
    if (!sp.edges.empty()) sp.edges.back().v1 = 0;
    return sp;
}

void printPanel(const SpecPanel& sp, bool last) {
    std::printf("    \"%s\": {\n", sp.name.c_str());
    std::printf("      \"translation\": [0.0, 0.0, 0.0],\n");
    std::printf("      \"rotation\": [0.0, 0.0, 0.0],\n");
    std::printf("      \"label\": \"%s\",\n", sp.name.c_str());
    std::printf("      \"vertices\": [");
    for (size_t i = 0; i < sp.verts.size(); ++i)
        std::printf("%s[%.6f, %.6f]", i ? ", " : "", sp.verts[i].x / 10.0, sp.verts[i].y / 10.0);
    std::printf("],\n      \"edges\": [");
    for (size_t k = 0; k < sp.edges.size(); ++k) {
        const SpecEdge& e = sp.edges[k];
        if (e.isLine)
            std::printf("%s{\"endpoints\": [%d, %d]}", k ? ", " : "", e.v0, e.v1);
        else
            std::printf("%s{\"endpoints\": [%d, %d], \"curvature\": {\"type\": \"cubic\", "
                        "\"params\": [[%.8f, %.8f], [%.8f, %.8f]]}}",
                        k ? ", " : "", e.v0, e.v1, e.r0x, e.r0y, e.r1x, e.r1y);
    }
    std::printf("]\n    }%s\n", last ? "" : ",");
}

void writeSvg(const char* path, const std::vector<SpecPanel>& panels) {
    FILE* f = std::fopen(path, "w");
    if (!f) return;
    double x0 = 20, maxH = 0;
    std::vector<std::string> parts;
    char buf[160];
    for (const SpecPanel& sp : panels) {
        double mnx = 1e18, mny = 1e18, mxx = -1e18, mxy = -1e18;
        for (const Vec2& v : sp.verts) {
            mnx = std::min(mnx, v.x);
            mny = std::min(mny, v.y);
            mxx = std::max(mxx, v.x);
            mxy = std::max(mxy, v.y);
        }
        // y is flipped so the waist reads the right way up on screen
        auto X = [&](double x) { return x0 + x - mnx; };
        auto Y = [&](double y) { return 20 + (mxy - y); };
        std::string d;
        for (size_t k = 0; k < sp.edges.size(); ++k) {
            const SpecEdge& e = sp.edges[k];
            const Vec2 a = sp.verts[e.v0], b = sp.verts[e.v1];
            if (k == 0) {
                std::snprintf(buf, sizeof buf, "M %.2f %.2f ", X(a.x), Y(a.y));
                d += buf;
            }
            if (e.isLine) {
                std::snprintf(buf, sizeof buf, "L %.2f %.2f ", X(b.x), Y(b.y));
            } else {
                const double ex = b.x - a.x, ey = b.y - a.y;
                const Vec2 c1{a.x + e.r0x * ex - e.r0y * ey, a.y + e.r0x * ey + e.r0y * ex};
                const Vec2 c2{a.x + e.r1x * ex - e.r1y * ey, a.y + e.r1x * ey + e.r1y * ex};
                std::snprintf(buf, sizeof buf, "C %.2f %.2f %.2f %.2f %.2f %.2f ",
                              X(c1.x), Y(c1.y), X(c2.x), Y(c2.y), X(b.x), Y(b.y));
            }
            d += buf;
        }
        d += "Z";
        std::snprintf(buf, sizeof buf, "%.1f", x0);
        parts.push_back("<path d=\"" + d + "\" fill=\"none\" stroke=\"black\" stroke-width=\"1\"/>"
                        "<text x=\"" + buf + "\" y=\"14\" font-size=\"11\">" + sp.name + "</text>");
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
    const SheathOptions opt;
    const SurfacePattern pat = buildSheathPattern(body, opt);

    std::vector<SpecPanel> panels;
    double worstFit = 0;
    for (const SurfacePanel& p : pat.panels) {
        panels.push_back(buildSpecPanel(p));
        worstFit = std::max(worstFit, panels.back().worstFitMM);
    }

    // ---- stitches, one per logical seam side ----
    struct St {
        int pa, ea, pb, eb;
    };
    std::vector<St> st;
    auto edgeLen = [&](int pi, int ei) {
        const SpecEdge& e = panels[pi].edges[ei];
        const Vec2 a = panels[pi].verts[e.v0], b = panels[pi].verts[e.v1];
        if (e.isLine) return std::hypot(b.x - a.x, b.y - a.y);
        const double ex = b.x - a.x, ey = b.y - a.y;
        CubicSeg s;
        s.p0 = a;
        s.p3 = b;
        s.c1 = {a.x + e.r0x * ex - e.r0y * ey, a.y + e.r0x * ey + e.r0y * ex};
        s.c2 = {a.x + e.r1x * ex - e.r1y * ey, a.y + e.r1x * ey + e.r1y * ex};
        return cubicLength(s);
    };
    auto chainPair = [&](int pa, const std::vector<int>& a, int pb, const std::vector<int>& b) {
        if (a.size() != b.size()) {
            std::fprintf(stderr, "chain mismatch %s(%zu) vs %s(%zu)\n",
                         panels[pa].name.c_str(), a.size(), panels[pb].name.c_str(), b.size());
            exit(2);
        }
        // a mirrored panel's swapped seam list runs the OPPOSITE way along the
        // physical seam — do not guess the orientation, measure it: take the
        // alignment (direct vs reversed) whose segment lengths agree
        const int m = static_cast<int>(a.size());
        double dDirect = 0, dRev = 0;
        for (int i = 0; i < m; ++i) {
            dDirect += std::fabs(edgeLen(pa, a[i]) - edgeLen(pb, b[i]));
            dRev += std::fabs(edgeLen(pa, a[i]) - edgeLen(pb, b[m - 1 - i]));
        }
        for (int i = 0; i < m; ++i)
            st.push_back({pa, a[i], pb, dDirect <= dRev ? b[i] : b[m - 1 - i]});
    };
    // panel order: [lF rF lB rB] torso, then skirt — as built (front subs then back subs per layer)
    const int T = 0, S = 4;  // first torso / skirt panel index
    // waist: torso sub s run r <-> skirt sub s run r
    for (int s = 0; s < 4; ++s)
        for (size_t r = 0; r < panels[T + s].waist.size(); ++r)
            st.push_back({T + s, panels[T + s].waist[r][0], S + s, panels[S + s].waist[r][0]});
    for (int base : {T, S}) {
        chainPair(base + 0, panels[base + 0].seam1, base + 1, panels[base + 1].seam0);  // front princess
        chainPair(base + 2, panels[base + 2].seam1, base + 3, panels[base + 3].seam0);  // back princess
        chainPair(base + 1, panels[base + 1].seam1, base + 2, panels[base + 2].seam0);  // side phi=pi
        chainPair(base + 3, panels[base + 3].seam1, base + 0, panels[base + 0].seam0);  // side phi=2pi
    }
    for (const auto& sp : panels)
        for (const auto& legs : sp.dartLegs)
            st.push_back({static_cast<int>(&sp - panels.data()), legs[0],
                          static_cast<int>(&sp - panels.data()), legs[1]});

    std::printf("{\n  \"pattern\": {\n  \"panels\": {\n");
    for (size_t i = 0; i < panels.size(); ++i) printPanel(panels[i], i + 1 == panels.size());
    std::printf("  },\n  \"stitches\": [");
    for (size_t i = 0; i < st.size(); ++i)
        std::printf("%s\n    [{\"panel\": \"%s\", \"edge\": %d}, {\"panel\": \"%s\", \"edge\": %d}]",
                    i ? "," : "", panels[st[i].pa].name.c_str(), st[i].ea,
                    panels[st[i].pb].name.c_str(), st[i].eb);
    std::printf("\n  ],\n  \"panel_order\": [");
    for (size_t i = 0; i < panels.size(); ++i)
        std::printf("%s\"%s\"", i ? ", " : "", panels[i].name.c_str());
    std::printf("]\n  },\n");
    std::printf("  \"properties\": {\"units_in_meter\": 100, \"origin\": \"stitchu surface motor\"}\n}\n");

    if (svgPath) writeSvg(svgPath, panels);

    std::fprintf(stderr,
                 "ring %.4fmm | bodice waist %.4fmm | skirt waist %.4fmm | diff %+.4fmm | worst fit %.4fmm\n",
                 pat.ringGirthMM, pat.bodiceWaistSumMM, pat.skirtWaistSumMM,
                 pat.bodiceWaistSumMM - pat.skirtWaistSumMM, worstFit);
    return 0;
}
