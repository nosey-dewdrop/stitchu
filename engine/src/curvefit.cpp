#include "curvefit.hpp"
#include <algorithm>
#include <cstdio>
#include <cstdlib>
#include <cmath>

namespace stitchu {

namespace {

Vec2 lerp(Vec2 a, Vec2 b, double t) { return {a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t}; }

Vec2 evalCubic(const CubicSeg& s, double t) {
    const double u = 1 - t;
    const double b0 = u * u * u, b1 = 3 * u * u * t, b2 = 3 * u * t * t, b3 = t * t * t;
    return {b0 * s.p0.x + b1 * s.c1.x + b2 * s.c2.x + b3 * s.p3.x,
            b0 * s.p0.y + b1 * s.c1.y + b2 * s.c2.y + b3 * s.p3.y};
}

// One least-squares cubic over pts[i0..i1] with chord parametrisation and
// free inner control points (endpoints fixed). Solves the 2x2 normal system
// for the scalar weights along the end tangent directions.
CubicSeg fitOne(const std::vector<Vec2>& pts, int i0, int i1,
                Vec2 t0, Vec2 t1, const std::vector<double>& u) {
    double c00 = 0, c01 = 0, c11 = 0, x0 = 0, x1 = 0;
    for (int i = i0; i <= i1; ++i) {
        const double t = u[i - i0];
        const double v = 1 - t;
        const double b0 = v * v * v, b1 = 3 * v * v * t, b2 = 3 * v * t * t, b3 = t * t * t;
        const Vec2 a1{t0.x * b1, t0.y * b1};
        const Vec2 a2{t1.x * b2, t1.y * b2};
        c00 += a1.x * a1.x + a1.y * a1.y;
        c01 += a1.x * a2.x + a1.y * a2.y;
        c11 += a2.x * a2.x + a2.y * a2.y;
        const Vec2 base{pts[i0].x * (b0 + b1) + pts[i1].x * (b2 + b3),
                        pts[i0].y * (b0 + b1) + pts[i1].y * (b2 + b3)};
        const Vec2 d{pts[i].x - base.x, pts[i].y - base.y};
        x0 += a1.x * d.x + a1.y * d.y;
        x1 += a2.x * d.x + a2.y * d.y;
    }
    const double det = c00 * c11 - c01 * c01;
    double al = 0, be = 0;
    if (std::fabs(det) > 1e-12) {
        al = (x0 * c11 - x1 * c01) / det;
        be = (c00 * x1 - c01 * x0) / det;
    }
    const double chord = std::hypot(pts[i1].x - pts[i0].x, pts[i1].y - pts[i0].y);
    if (al <= 1e-9 || be <= 1e-9) al = be = chord / 3.0;  // Wu/Barsky fallback
    CubicSeg s;
    s.p0 = pts[i0];
    s.p3 = pts[i1];
    s.c1 = {pts[i0].x + t0.x * al, pts[i0].y + t0.y * al};
    s.c2 = {pts[i1].x + t1.x * be, pts[i1].y + t1.y * be};
    return s;
}

Vec2 unit(Vec2 v) {
    const double n = std::hypot(v.x, v.y);
    return n > 1e-12 ? Vec2{v.x / n, v.y / n} : Vec2{0, 0};
}

void fitRange(const std::vector<Vec2>& pts, int i0, int i1, Vec2 t0, Vec2 t1,
              double tolMM, std::vector<CubicSeg>& out, int depth,
              std::vector<int>* breaks) {
    if (i1 - i0 == 1) {
        CubicSeg s;
        s.p0 = pts[i0];
        s.p3 = pts[i1];
        s.c1 = lerp(pts[i0], pts[i1], 1.0 / 3.0);
        s.c2 = lerp(pts[i0], pts[i1], 2.0 / 3.0);
        out.push_back(s);
        return;
    }
    // chord parametrisation
    std::vector<double> u(i1 - i0 + 1, 0.0);
    for (int i = i0 + 1; i <= i1; ++i)
        u[i - i0] = u[i - i0 - 1] + std::hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    const double total = u.back();
    for (double& v : u) v /= (total > 1e-12 ? total : 1.0);

    const CubicSeg s = fitOne(pts, i0, i1, t0, t1, u);
    double worst = 0;
    int split = (i0 + i1) / 2;
    for (int i = i0 + 1; i < i1; ++i) {
        const Vec2 q = evalCubic(s, u[i - i0]);
        const double d = std::hypot(q.x - pts[i].x, q.y - pts[i].y);
        if (d > worst) {
            worst = d;
            split = i;
        }
    }
    if (worst <= tolMM || depth > 12) {
        if (std::getenv("STITCHU_FIT_DEBUG") && depth == 0)
            std::fprintf(stderr, "    fitRange KABUL depth=%d worst=%.4f tol=%.4f n=%d\n",
                         depth, worst, tolMM, i1 - i0);
        out.push_back(s);
        return;
    }
    const Vec2 tc = unit({pts[split + 1].x - pts[split - 1].x, pts[split + 1].y - pts[split - 1].y});
    fitRange(pts, i0, split, t0, tc, tolMM, out, depth + 1, breaks);
    if (breaks) breaks->push_back(split);
    fitRange(pts, split, i1, tc, t1, tolMM, out, depth + 1, breaks);
}

}  // namespace

std::vector<CubicSeg> fitCubics(const std::vector<Vec2>& pts, double tolMM,
                               std::vector<int>* breaksOut) {
    std::vector<CubicSeg> out;
    if (pts.size() < 2) return out;
    const int n = static_cast<int>(pts.size());
    const Vec2 t0 = unit({pts[1].x - pts[0].x, pts[1].y - pts[0].y});
    const Vec2 t1 = unit({pts[n - 2].x - pts[n - 1].x, pts[n - 2].y - pts[n - 1].y});
    fitRange(pts, 0, n - 1, t0, t1, tolMM, out, 0, breaksOut);
    if (breaksOut) std::sort(breaksOut->begin(), breaksOut->end());
    return out;
}

// Fit with the breakpoints DICTATED instead of discovered.
//
// The two sides of a seam are two polylines that get sewn to each other point
// for point. If each side chooses its own breakpoints, the two sides come back
// with different numbers of edges and the stitch plan has nothing to pair —
// which is exactly what happened the moment the body got a front and a back and
// the front and back panels stopped being the same shape ("chain mismatch
// right_skirt_front(40) vs left_skirt_back(29)"). Feeding both sides the UNION
// of their breakpoints makes the segmentation shared, so edge k on one side is
// edge k on the other by construction, and notches land where they are meant to.
std::vector<CubicSeg> fitCubicsAtBreaks(const std::vector<Vec2>& pts,
                                        const std::vector<int>& breaks) {
    std::vector<CubicSeg> out;
    const int n = static_cast<int>(pts.size());
    if (n < 2) return out;
    std::vector<int> cut = {0};
    for (int b : breaks)
        if (b > cut.back() && b < n - 1) cut.push_back(b);
    cut.push_back(n - 1);
    // Tangent at an INTERIOR break is centred and SHARED by the two runs that
    // meet there, exactly as the recursive fit does it — so the chain stays C1
    // across a break. Using a one-sided tangent instead put a visible kink at
    // every shared break and tripled the fit deviation (0.51mm -> 1.57mm).
    auto tangentAt = [&](int i, bool forward) {
        if (i > 0 && i < n - 1)
            return unit({pts[i + 1].x - pts[i - 1].x, pts[i + 1].y - pts[i - 1].y});
        if (forward) return unit({pts[1].x - pts[0].x, pts[1].y - pts[0].y});
        return unit({pts[n - 2].x - pts[n - 1].x, pts[n - 2].y - pts[n - 1].y});
    };
    for (size_t k = 0; k + 1 < cut.size(); ++k) {
        const int i0 = cut[k], i1 = cut[k + 1];
        const Vec2 t0 = tangentAt(i0, true);
        Vec2 t1 = tangentAt(i1, false);
        // fitRange wants the END tangent pointing back INTO the run
        if (i1 > 0 && i1 < n - 1) t1 = {-t1.x, -t1.y};
        // tolerance 1e9: never subdivide further, the breakpoints are the answer
        fitRange(pts, i0, i1, t0, t1, 1e9, out, 0, nullptr);
    }
    return out;
}

double cubicLength(const CubicSeg& s, int steps) {
    double len = 0;
    Vec2 prev = s.p0;
    for (int i = 1; i <= steps; ++i) {
        const Vec2 q = evalCubic(s, static_cast<double>(i) / steps);
        len += std::hypot(q.x - prev.x, q.y - prev.y);
        prev = q;
    }
    return len;
}

}  // namespace stitchu
