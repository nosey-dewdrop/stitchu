#include "volume.hpp"

#include <cmath>
#include <vector>

namespace stitchu {
namespace {

constexpr double kPi = 3.14159265358979323846;

// Legendre P_n and P_n' by the three-term recurrence.
void legendre(int n, double x, double& p, double& dp) {
    if (n == 0) {
        p = 1.0;
        dp = 0.0;
        return;
    }
    double p0 = 1.0, p1 = x;
    for (int k = 2; k <= n; ++k) {
        const double pk = ((2.0 * k - 1.0) * x * p1 - (k - 1.0) * p0) / k;
        p0 = p1;
        p1 = pk;
    }
    p = p1;
    dp = n * (x * p1 - p0) / (x * x - 1.0);
}

// Gauss-Legendre nodes/weights on [-1,1], Newton-refined off the Chebyshev
// seed. Hits machine precision in about four iterations.
void gaussLegendre(int n, std::vector<double>& xs, std::vector<double>& ws) {
    xs.assign(n, 0.0);
    ws.assign(n, 0.0);
    for (int i = 0; i < n; ++i) {
        double x = std::cos(kPi * (i + 0.75) / (n + 0.5));
        for (int it = 0; it < 100; ++it) {
            double p = 0.0, dp = 0.0;
            legendre(n, x, p, dp);
            const double dx = -p / dp;
            x += dx;
            if (std::fabs(dx) < 1e-15) break;
        }
        double p = 0.0, dp = 0.0;
        legendre(n, x, p, dp);
        xs[i] = x;
        ws[i] = 2.0 / ((1.0 - x * x) * dp * dp);
    }
}

}  // namespace

SurfaceIntegrals integrateSurface(const Surface& r,
                                  double u0, double u1, double v0, double v1,
                                  int cellsU, int cellsV, int order) {
    SurfaceIntegrals out;
    if (cellsU < 1 || cellsV < 1 || order < 2) return out;

    std::vector<double> xs, ws;
    gaussLegendre(order, xs, ws);

    const double spanU = u1 - u0;
    const double spanV = v1 - v0;
    // Two step sizes on purpose. The five-point first derivative is O(h⁴), so a
    // loose h keeps roundoff away while truncation stays near 1e-11. The second
    // derivative is O(h²) and divides by h², so it needs its own tighter h or
    // the curvature term drowns in cancellation noise.
    const double h1 = 1e-3 * std::fmax(std::fabs(spanU), std::fabs(spanV));
    const double h2 = 1e-4 * std::fmax(std::fabs(spanU), std::fabs(spanV));

    const double duCell = spanU / cellsU;
    const double dvCell = spanV / cellsV;
    const double jac = 0.25 * duCell * dvCell;  // half-span in each axis

    Vec3 momentSum;  // ∮ xᵢ² nᵢ dA, later halved and divided by V

    for (int cu = 0; cu < cellsU; ++cu) {
        const double uMid = u0 + duCell * (cu + 0.5);
        for (int cv = 0; cv < cellsV; ++cv) {
            const double vMid = v0 + dvCell * (cv + 0.5);
            for (int i = 0; i < order; ++i) {
                const double u = uMid + 0.5 * duCell * xs[i];
                for (int j = 0; j < order; ++j) {
                    const double v = vMid + 0.5 * dvCell * xs[j];
                    const double w = ws[i] * ws[j] * jac;

                    const Vec3 p = r(u, v);

                    // Five-point central first derivatives.
                    const Vec3 up2 = r(u + 2 * h1, v), up1 = r(u + h1, v);
                    const Vec3 um1 = r(u - h1, v), um2 = r(u - 2 * h1, v);
                    const Vec3 vp2 = r(u, v + 2 * h1), vp1 = r(u, v + h1);
                    const Vec3 vm1 = r(u, v - h1), vm2 = r(u, v - 2 * h1);
                    const Vec3 ru = (um2 - up2 + (up1 - um1) * 8.0) * (1.0 / (12.0 * h1));
                    const Vec3 rv = (vm2 - vp2 + (vp1 - vm1) * 8.0) * (1.0 / (12.0 * h1));

                    // n dA in one object: no normalisation needed for area or
                    // volume, and its length is exactly sqrt(EG - F²).
                    const Vec3 ndA = cross(ru, rv);
                    const double ndAlen = std::sqrt(dot(ndA, ndA));

                    out.area += ndAlen * w;
                    out.volume += dot(p, ndA) * w / 3.0;

                    momentSum.x += p.x * p.x * ndA.x * w;
                    momentSum.y += p.y * p.y * ndA.y * w;
                    momentSum.z += p.z * p.z * ndA.z * w;

                    if (ndAlen <= 0.0) continue;  // degenerate point, no curvature

                    const Vec3 a2u = r(u + h2, v), b2u = r(u - h2, v);
                    const Vec3 a2v = r(u, v + h2), b2v = r(u, v - h2);
                    const Vec3 ruu = (a2u + b2u - p * 2.0) * (1.0 / (h2 * h2));
                    const Vec3 rvv = (a2v + b2v - p * 2.0) * (1.0 / (h2 * h2));
                    const Vec3 ruv = (r(u + h2, v + h2) - r(u + h2, v - h2) -
                                      r(u - h2, v + h2) + r(u - h2, v - h2)) *
                                     (1.0 / (4.0 * h2 * h2));

                    const Vec3 unit = ndA * (1.0 / ndAlen);
                    const double L = dot(ruu, unit);
                    const double M = dot(ruv, unit);
                    const double N = dot(rvv, unit);

                    // K dA = ((LN - M²) / (EG - F²)) · sqrt(EG - F²)
                    //      = (LN - M²) / |r_u × r_v|
                    out.gaussCurvatureTotal += ((L * N - M * M) / ndAlen) * w;
                }
            }
        }
    }

    if (out.volume != 0.0) {
        out.centroid = momentSum * (0.5 / out.volume);
    }
    out.eulerCharacteristic = out.gaussCurvatureTotal / (2.0 * kPi);
    return out;
}

}  // namespace stitchu
