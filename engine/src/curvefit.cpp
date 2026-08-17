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
//
// THE SOLVE IS CONSTRAINED, and the constraint is the cut line's own law.
// Schneider's original guards only the sign (a negative weight folds the curve
// backwards at its own endpoint) and leaves the magnitude unbounded. Unbounded
// is the other half of the same failure: a weight larger than the chord puts a
// control point BEYOND the far endpoint, and a cubic whose control points are
// out of order along its chord runs past the end and comes back. On a cut line
// that is not an aesthetic defect, it is a line no cutter can follow.
//
// Write the chord as the unit vector uc and project the four control points
// onto it: x0 = 0, x1 = al*(t0.uc), x2 = chord - be*(-t1.uc), x3 = chord. The
// projected curve is a scalar cubic Bezier on (x0,x1,x2,x3); its derivative is
// a quadratic Bezier on the differences, so x0 <= x1 <= x2 <= x3 makes the
// derivative's control values non-negative and the projection monotone. Those
// are three LINEAR inequalities in (al, be), and the fit energy is a convex
// quadratic, so the constrained minimum is exact and cheap: take the
// unconstrained solution when it is feasible, otherwise the minimum sits on a
// face and each face is a one-variable problem solved in closed form. Nothing
// is clipped after the fact — the feasible set is part of the problem.
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

    // forward components of the two inward tangents along the chord
    const Vec2 uc = chord > 1e-12
                        ? Vec2{(pts[i1].x - pts[i0].x) / chord, (pts[i1].y - pts[i0].y) / chord}
                        : Vec2{0, 0};
    const double fa = t0.x * uc.x + t0.y * uc.y;    // start tangent, points forward
    const double fb = -(t1.x * uc.x + t1.y * uc.y);  // end tangent, points backward
    auto E = [&](double a, double b) {
        return 0.5 * (c00 * a * a + 2 * c01 * a * b + c11 * b * b) - x0 * a - x1 * b;
    };
    // A tangent with no forward component cannot carry any weight at all
    // without pushing its control point backwards past its own endpoint.
    const double alMax = fa > 1e-9 ? chord / fa : 0.0;
    const double beMax = fb > 1e-9 ? chord / fb : 0.0;
    auto feasible = [&](double a, double b) {
        return a >= -1e-12 && b >= -1e-12 && fa * a + fb * b <= chord * (1 + 1e-12) &&
               fa * a >= -1e-12 && fb * b >= -1e-12;
    };
    if (chord > 1e-12 && !feasible(al, be)) {
        double bestA = 0, bestB = 0, bestE = E(0, 0);
        auto consider = [&](double a, double b) {
            a = std::max(0.0, std::min(a, alMax));
            b = std::max(0.0, std::min(b, beMax));
            if (fa * a + fb * b > chord) {  // pull back onto the ordering face
                const double sc = chord / (fa * a + fb * b);
                a *= sc;
                b *= sc;
            }
            if (!feasible(a, b)) return;
            const double e = E(a, b);
            if (e < bestE) { bestE = e; bestA = a; bestB = b; }
        };
        // face be = 0, face al = 0
        if (c00 > 1e-12) consider(x0 / c00, 0.0);
        if (c11 > 1e-12) consider(0.0, x1 / c11);
        // face fa*al + fb*be = chord, minimised along its length
        if (fa > 1e-9 && fb > 1e-9) {
            const double r = fa / fb;
            const double K = c00 - 2 * r * c01 + r * r * c11;
            const double L = c01 * chord / fb - x0 - r * (c11 * chord / fb - x1);
            if (K > 1e-12) {
                const double a = -L / K;
                consider(a, (chord - fa * a) / fb);
            }
            consider(0.0, chord / fb);
            consider(chord / fa, 0.0);
        }
        al = bestA;
        be = bestB;
    }

    if (al <= 1e-9 || be <= 1e-9) {  // Wu/Barsky fallback
        al = fa > 1e-9 ? chord / 3.0 : 0.0;
        be = fb > 1e-9 ? chord / 3.0 : 0.0;
    }
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

    CubicSeg s = fitOne(pts, i0, i1, t0, t1, u);

    // REPARAMETERISE, which Schneider's original FitCurve does and this port had
    // omitted. Chord-length gives each sample a guessed parameter; the fitted
    // curve then almost never passes closest to pts[i] AT u[i], so the residual
    // measured at u[i] overstates the true deviation and the subdivision keeps
    // splitting a curve that is already good. Measured before this: a side seam
    // came back as 42 cubics over 48 points while the true nearest-point
    // deviation was 0.026mm against a 0.15mm tolerance. Newton on
    // (Q(u)-p).Q'(u) = 0 moves each parameter onto the actual foot point.
    //
    // THE SWEEP IS JACOBI, NOT GAUSS-SEIDEL, AND THAT IS THE WHOLE OF IT.
    // Updating u[i] in place makes every later point in the sweep see the
    // already-moved u[i-1] through the ordering clamp below, so the sweep
    // carries information one way along the run — and the SAME polyline walked
    // backwards therefore lands on different parameters, a different worst
    // point, a different split, and a different NUMBER of cubics. That is not
    // a cosmetic asymmetry: a garment's right panel is the left one mirrored
    // and traversed the other way, so the two sides of a mirror seam came back
    // with different edge counts and the mirror map gave up on the pair
    // ("edge counts differ (14 vs 13)"). Reading every parameter from the
    // previous pass and writing them all at once makes the sweep order-free.
    // Isolated and measured on 2000 random panel-like polylines fitted forward
    // and backward: segment counts differed on 402, control points on a
    // further 319, worst mismatch 73.695038mm; with the Jacobi sweep BOTH are
    // 0 and the worst mismatch is 6.9e-10mm. The other suspect, the `>` tie
    // in the split search, was measured separately on the same corpus and
    // contributes NOTHING (721/2000 direction-dependent either way) — it was
    // tried and REJECTED, numbers in the shift report.
    std::vector<double> unew;
    for (int pass = 0; pass < 3; ++pass) {
        unew = u;
        for (int i = i0 + 1; i < i1; ++i) {
            const double t = u[i - i0];
            const Vec2 q = evalCubic(s, t);
            // first and second derivatives of the cubic at t
            const double v = 1 - t;
            const Vec2 d1{3 * v * v * (s.c1.x - s.p0.x) + 6 * v * t * (s.c2.x - s.c1.x) +
                              3 * t * t * (s.p3.x - s.c2.x),
                          3 * v * v * (s.c1.y - s.p0.y) + 6 * v * t * (s.c2.y - s.c1.y) +
                              3 * t * t * (s.p3.y - s.c2.y)};
            const Vec2 d2{6 * v * (s.c2.x - 2 * s.c1.x + s.p0.x) +
                              6 * t * (s.p3.x - 2 * s.c2.x + s.c1.x),
                          6 * v * (s.c2.y - 2 * s.c1.y + s.p0.y) +
                              6 * t * (s.p3.y - 2 * s.c2.y + s.c1.y)};
            const double dx = q.x - pts[i].x, dy = q.y - pts[i].y;
            const double num = dx * d1.x + dy * d1.y;
            const double den = d1.x * d1.x + d1.y * d1.y + dx * d2.x + dy * d2.y;
            if (std::fabs(den) < 1e-12) continue;
            double nt = t - num / den;
            // stay inside this run and keep the samples ordered
            const double lo = u[i - i0 - 1] + 1e-9;
            const double hi = (i + 1 <= i1) ? u[i - i0 + 1] - 1e-9 : 1.0;
            if (nt > lo && nt < hi) unew[i - i0] = nt;
        }
        u = unew;
        s = fitOne(pts, i0, i1, t0, t1, u);
    }

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
    // SIGN OF THE SPLIT TANGENT. fitOne places the control points as
    // c1 = p0 + al*t0 and c2 = p3 + be*t1 with al, be >= 0, so BOTH tangents
    // must point INWARD: t0 forward from the start, t1 BACKWARD from the end.
    // `tc` is the centred FORWARD tangent at the split, which is what the
    // second half wants as its start tangent — and the exact opposite of what
    // the first half wants as its end tangent. Schneider's original computes
    // the centre tangent pointing backward, hands it to the first half, and
    // negates it for the second; this port had the sign inverted on both
    // halves and the first half paid for it: with the end tangent pointing
    // forward, every positive be puts c2 BEYOND p3, so the curve runs past its
    // own endpoint and comes back. That is the whole of the edge-monotonicity
    // failure — the returned parameter is not clipped here, it is generated in
    // the right direction and the least squares is solved in the right basis.
    const Vec2 tc = unit({pts[split + 1].x - pts[split - 1].x, pts[split + 1].y - pts[split - 1].y});
    fitRange(pts, i0, split, t0, {-tc.x, -tc.y}, tolMM, out, depth + 1, breaks);
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
