// surface-pattern: emits the single-surface sheath as a GarmentCode-shaped
// specification.json. Boundary polylines are fitted to cubic Bézier edges so a
// panel carries a handful of smooth pattern edges (what printpack's notch and
// allowance machinery expects), not hundreds of 8mm stubs. Panel names carry
// the walk.py roles: ftorso/btorso -> torso, skirt_* -> skirt.
//
// Pairing safety: princess and side seams join panels that are exact mirror or
// rotation copies, so their fitted chains match segment for segment. The waist
// stitch joins two DIFFERENT curves (bodice vs skirt), so its two sides need a
// SHARED segmentation — the union of both sides' natural breakpoints, refitted
// on both. That is the same device the princess and side seams already use.
//
// It used to be done differently and wrongly: each waist run was forced to a
// SINGLE cubic with tolerance 1e9, i.e. kFitTolMM was bypassed on exactly the
// edge that carries the dress's defining ring. The stated reason was "one
// stitch, one edge", but the real constraint was narrower — the stitch pairing
// below only ever read waist[r][0], so a multi-edge waist chain would have left
// every edge past the first unsewn. The waist is ONE CURVE; nothing requires it
// to be one cubic. A 33-point back waist forced into one cubic missed its own
// polyline by 7.17mm (48x the tolerance) and, because the referee measures the
// EDGE, reported the bodice waist 5.35mm shorter than the skirt waist it is
// sewn to. Curve stays one curve, cubics are as many as the tolerance needs,
// and the pairing walks the chain.
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
    // Distance from each source point to the sampled fitted chain.
    //
    // The sampling used to be a FIXED 97 points per segment, which is a trap:
    // one cubic spanning a 400mm side seam then has its samples 4.1mm apart, and
    // the nearest-SAMPLE distance carries up to half of that as pure sampling
    // error. It reported 2.0583mm on a chain the fitter had accepted at
    // 0.1256mm and made the cut line look 16x worse than it is. Sample density
    // now follows arc length, so the number measures the CURVE and not the ruler.
    std::vector<Vec2> samp;
    for (const CubicSeg& s : segs) {
        const int n = std::max(96, static_cast<int>(std::ceil(cubicLength(s, 64) / 0.01)));
        for (int i = 0; i <= n; ++i) {
            const double t = static_cast<double>(i) / n, u = 1 - t;
            samp.push_back({u * u * u * s.p0.x + 3 * u * u * t * s.c1.x + 3 * u * t * t * s.c2.x + t * t * t * s.p3.x,
                            u * u * u * s.p0.y + 3 * u * u * t * s.c1.y + 3 * u * t * t * s.c2.y + t * t * t * s.p3.y});
        }
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
std::vector<int> emitChain(SpecPanel& sp, const std::vector<Vec2>& pts, bool singleCubic,
                           const std::vector<int>* forcedBreaks = nullptr) {
    const std::vector<CubicSeg> segs =
        forcedBreaks ? fitCubicsAtBreaks(pts, *forcedBreaks)
                     : fitCubics(pts, singleCubic ? 1e9 : kFitTolMM);
    const double dev = fitDeviation(segs, pts);
    if (const char* dn = std::getenv("STITCHU_FIT_DUMP"))
        if (sp.name == dn) {
            std::fprintf(stderr, "DUMP %s n=%zu\n", sp.name.c_str(), pts.size());
            for (const Vec2& q : pts) std::fprintf(stderr, "P %.6f %.6f\n", q.x, q.y);
        }
    if (std::getenv("STITCHU_FIT_DEBUG"))
        std::fprintf(stderr, "  FIT %-18s %-11s n=%3zu segs=%2zu dev=%8.4fmm\n",
                     sp.name.c_str(),
                     forcedBreaks ? "PAYLASILAN" : (singleCubic ? "tek-kubik" : "serbest"),
                     pts.size(), segs.size(), dev);
    sp.worstFitMM = std::max(sp.worstFitMM, dev);
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

// Raw polyline of one tagged side, walked in CONTOUR ORDER.
//
// The edge LISTS are stored row-ascending, but seam0 runs DOWN the contour, so
// its indices descend. buildSpecPanel always walks the contour ascending, so the
// breakpoints have to be computed on that same polyline — reading the stored
// list in its own order builds a different (and, at the seam0 end, off-by-one)
// curve, and the breaks then land nowhere near where the fit needs them. That
// mistake cost 1.57mm of fit deviation and looked like a tangent problem.
std::vector<Vec2> sidePoints(const SurfacePanel& p, const std::vector<int>& edges) {
    std::vector<Vec2> pts;
    const int n = static_cast<int>(p.contour.size());
    if (edges.empty()) return pts;
    int lo = edges.front(), hi = edges.front();
    for (int e : edges) { lo = std::min(lo, e); hi = std::max(hi, e); }
    for (int k = lo; k <= hi + 1; ++k) pts.push_back(p.contour[k % n]);
    return pts;
}

SpecPanel buildSpecPanel(const SurfacePanel& p,
                         const std::vector<int>* seam0Breaks = nullptr,
                         const std::vector<int>* seam1Breaks = nullptr,
                         const std::vector<std::vector<int>>* waistBreaks = nullptr) {
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
            const std::vector<int>* forced =
                t.k == S0   ? seam0Breaks
                : t.k == S1 ? seam1Breaks
                : (t.k == W && waistBreaks && t.id < static_cast<int>(waistBreaks->size()))
                            ? &(*waistBreaks)[t.id]
                            : nullptr;
            const std::vector<int> chain = emitChain(sp, pts, /*singleCubic=*/false, forced);
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

    // ---- SHARED SEGMENTATION FOR EVERY SEAM ----
    //
    // A seam's two sides are sewn point for point, so they have to be described
    // with the SAME breakpoints. Left to itself the adaptive fit chooses its own
    // per edge, and while the front and the back panels were identical shapes
    // that happened to agree; the moment the body got a front and a back it
    // stopped ("chain mismatch right_skirt_front(40) vs left_skirt_back(29)").
    // So: fit each side, take the UNION of the two sides' breakpoints, refit
    // both there. Orientation is MEASURED, not assumed — a mirrored panel runs
    // its seam the other way, and pairing break i with break i in that case
    // would quietly put the notches on backwards.
    const int NP = static_cast<int>(pat.panels.size());
    std::vector<std::vector<int>> brk0(NP), brk1(NP);
    // ---- THE ZIP END IS A NOTCH, SO IT HAS TO BE A BREAK ----
    //
    // The engine marks the top run of the centre-back seam Opening, one mesh
    // edge at a time. The spec describes that seam as a handful of cubics, so
    // unless the point where the opening STOPS is a breakpoint, the zip end
    // falls in the middle of a curve — no vertex to notch, and no way to say
    // "stitch from here down, leave the rest for the zip". Forcing the break
    // makes the zip end a real corner of the pattern, which is what a notch is.
    // Nothing is measured twice: the count comes from the engine's own Opening
    // marks, never from re-walking the seam against a length here.
    std::vector<int> openMeshEdges(NP, 0);
    for (const SurfaceStitch& s : pat.stitches)
        if (s.kind == SurfaceStitch::Opening) ++openMeshEdges[s.pa];
    std::vector<int> openSpecEdges(NP, 0);  // how many spec seam edges are open
    std::vector<std::vector<std::vector<int>>> wbrk(NP);  // waist breaks, per run
    {
        auto naturalBreaks = [&](const SurfacePanel& p, const std::vector<int>& edges) {
            std::vector<int> b;
            const std::vector<Vec2> pts = sidePoints(p, edges);
            if (pts.size() >= 2) {
                const std::vector<CubicSeg> segs = fitCubics(pts, kFitTolMM, &b);
                if (std::getenv("STITCHU_FIT_DEBUG"))
                    std::fprintf(stderr, "  DOGAL %-18s n=%3zu segs=%2zu breaks=%2zu dev=%8.4fmm\n",
                                 p.name.c_str(), pts.size(), segs.size(), b.size(),
                                 fitDeviation(segs, pts));
            }
            return b;
        };
        auto cumulative = [&](const std::vector<Vec2>& pts) {
            std::vector<double> c(pts.size(), 0.0);
            for (size_t i = 1; i < pts.size(); ++i)
                c[i] = c[i - 1] + std::hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
            return c;
        };
        // the fixed seam graph of the four-panel sheath, both layers
        struct Pair { int pa, pb; };
        std::vector<Pair> seams;
        for (int base : {0, 4}) {
            seams.push_back({base + 0, base + 1});
            seams.push_back({base + 2, base + 3});
            seams.push_back({base + 1, base + 2});
            seams.push_back({base + 3, base + 0});
        }
        for (const Pair& q : seams) {
            const SurfacePanel& A = pat.panels[q.pa];
            const SurfacePanel& B = pat.panels[q.pb];
            const std::vector<Vec2> pa = sidePoints(A, A.seam1Edges);
            const std::vector<Vec2> pb = sidePoints(B, B.seam0Edges);
            if (pa.size() != pb.size() || pa.size() < 2) continue;
            const int n = static_cast<int>(pa.size());
            const std::vector<double> ca = cumulative(pa), cb = cumulative(pb);
            double direct = 0, rev = 0;
            for (int i = 0; i < n; ++i) {
                direct += std::fabs(ca[i] - cb[i]);
                rev += std::fabs(ca[i] - (cb.back() - cb[n - 1 - i]));
            }
            const bool reversed = rev < direct;
            std::vector<int> u = naturalBreaks(A, A.seam1Edges);
            for (int b : naturalBreaks(B, B.seam0Edges))
                u.push_back(reversed ? n - 1 - b : b);
            // The opening runs DOWN from the neckline, and sidePoints walks the
            // seam upward, so on the bodice the open edges are the LAST ones and
            // the zip end sits at (n-1) - count; on the skirt the run continues
            // downward from the waist, which is that panel's FIRST edges, so the
            // zip end sits at the count itself. Both are the same point on the
            // dress — the seam simply changes which panel it belongs to.
            int zipEnd = -1;
            if (openMeshEdges[q.pa] > 0) {
                zipEnd = q.pa < 4 ? (n - 1) - openMeshEdges[q.pa] : openMeshEdges[q.pa];
                if (zipEnd > 0 && zipEnd < n - 1) u.push_back(zipEnd);
            }
            std::sort(u.begin(), u.end());
            u.erase(std::unique(u.begin(), u.end()), u.end());
            if (zipEnd >= 0) {
                // segment k of the fit spans cut[k]..cut[k+1] with cut =
                // {0, interior breaks..., n-1}; count the segments on the open
                // side of the zip end
                int interior = 0, before = 0;
                for (int b : u)
                    if (b > 0 && b < n - 1) {
                        ++interior;
                        if (b < zipEnd) ++before;
                    }
                openSpecEdges[q.pa] = q.pa < 4
                                          ? (interior + 1) - (before + (zipEnd > 0 ? 1 : 0))
                                          : before + 1;
            }
            if (std::getenv("STITCHU_FIT_DEBUG"))
                std::fprintf(stderr,
                             "  BIRLESIM %-16s <-> %-16s n=%3d ters=%d "
                             "dogal(%zu,%zu) -> birlesim=%zu\n",
                             A.name.c_str(), B.name.c_str(), n, reversed ? 1 : 0,
                             naturalBreaks(A, A.seam1Edges).size(),
                             naturalBreaks(B, B.seam0Edges).size(), u.size());
            brk1[q.pa] = u;
            std::vector<int> v;
            for (int b : u) v.push_back(reversed ? n - 1 - b : b);
            std::sort(v.begin(), v.end());
            brk0[q.pb] = v;
        }

        // ---- THE WAIST GETS THE SAME TREATMENT ----
        //
        // Bodice sub s and skirt sub s are sewn along waist run r. They are two
        // DIFFERENT curves (the bodice develops the ring one way, the skirt the
        // other), so neither may pick its own segmentation and neither may be
        // exempted from kFitTolMM. Union of both sides' natural breaks, refit
        // both there, and the chains pair edge for edge like any other seam.
        for (int s = 0; s < 4; ++s) {
            const SurfacePanel& A = pat.panels[s];      // torso sub s
            const SurfacePanel& B = pat.panels[4 + s];  // skirt sub s
            wbrk[s].assign(A.waistRuns.size(), {});
            wbrk[4 + s].assign(B.waistRuns.size(), {});
            const size_t R = std::min(A.waistRuns.size(), B.waistRuns.size());
            for (size_t r = 0; r < R; ++r) {
                const std::vector<Vec2> pa = sidePoints(A, A.waistRuns[r]);
                const std::vector<Vec2> pb = sidePoints(B, B.waistRuns[r]);
                if (pa.size() != pb.size() || pa.size() < 2) continue;
                const int n = static_cast<int>(pa.size());
                const std::vector<double> ca = cumulative(pa), cb = cumulative(pb);
                double direct = 0, rev = 0;
                for (int i = 0; i < n; ++i) {
                    direct += std::fabs(ca[i] - cb[i]);
                    rev += std::fabs(ca[i] - (cb.back() - cb[n - 1 - i]));
                }
                const bool reversed = rev < direct;
                std::vector<int> u = naturalBreaks(A, A.waistRuns[r]);
                for (int b : naturalBreaks(B, B.waistRuns[r]))
                    u.push_back(reversed ? n - 1 - b : b);
                std::sort(u.begin(), u.end());
                u.erase(std::unique(u.begin(), u.end()), u.end());
                std::vector<int> v;
                for (int b : u) v.push_back(reversed ? n - 1 - b : b);
                std::sort(v.begin(), v.end());
                if (std::getenv("STITCHU_FIT_DEBUG"))
                    std::fprintf(stderr, "  BEL %-18s <-> %-18s n=%3d ters=%d birlesim=%zu\n",
                                 A.name.c_str(), B.name.c_str(), n, reversed ? 1 : 0, u.size());
                wbrk[s][r] = u;
                wbrk[4 + s][r] = v;
            }
        }
    }

    std::vector<SpecPanel> panels;
    double worstFit = 0;
    for (int i = 0; i < NP; ++i) {
        panels.push_back(buildSpecPanel(pat.panels[i], &brk0[i], &brk1[i], &wbrk[i]));
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
    // waist: torso sub s run r <-> skirt sub s run r, edge for edge. It used to
    // pair waist[r][0] only, which is why the run had to be one cubic; with a
    // shared segmentation the chain pairs like every other seam and chainPair
    // still measures (never assumes) which way round the two sides run.
    for (int s = 0; s < 4; ++s)
        for (size_t r = 0; r < panels[T + s].waist.size(); ++r)
            chainPair(T + s, panels[T + s].waist[r], S + s, panels[S + s].waist[r]);
    // stitch indices that are NOT sewn — the back opening. Recorded here rather
    // than searched for later: chainPair emits one stitch per spec seam edge in
    // seam order, so the open ones are the last k on the bodice (the run starts
    // at the neckline) and the first k on the skirt (it continues past the
    // waist). Same physical opening, two panels.
    std::vector<int> openStitch;
    for (int base : {T, S}) {
        chainPair(base + 0, panels[base + 0].seam1, base + 1, panels[base + 1].seam0);  // front princess
        const int cbBase = static_cast<int>(st.size());
        chainPair(base + 2, panels[base + 2].seam1, base + 3, panels[base + 3].seam0);  // back princess
        const int m = static_cast<int>(panels[base + 2].seam1.size());
        for (int i = 0; i < openSpecEdges[base + 2] && i < m; ++i)
            openStitch.push_back(base == T ? cbBase + (m - 1 - i) : cbBase + i);
        chainPair(base + 1, panels[base + 1].seam1, base + 2, panels[base + 2].seam0);  // side phi=pi
        chainPair(base + 3, panels[base + 3].seam1, base + 0, panels[base + 0].seam0);  // side phi=2pi
    }
    std::sort(openStitch.begin(), openStitch.end());
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
    // The back opening: indices into "stitches" that are NOT sewn. Additive on
    // purpose — every existing reader sees the same stitch list it always saw,
    // and the two sides of the opening stay a PAIR so the walk still checks
    // they are the same length, which is exactly what a zip needs. The last
    // index is the zip end, and that vertex is where the notch goes.
    std::printf("\n  ],\n  \"openings\": {\"kind\": \"centre_back_zip\", \"length_mm\": %.4f,"
                " \"stitches\": [",
                pat.backOpeningMM);
    for (size_t i = 0; i < openStitch.size(); ++i)
        std::printf("%s%d", i ? ", " : "", openStitch[i]);
    std::printf("]},\n  \"panel_order\": [");
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
