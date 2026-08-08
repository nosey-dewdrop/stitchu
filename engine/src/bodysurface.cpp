#include "bodysurface.hpp"

#include <cmath>
#include <stdexcept>

namespace stitchu {
namespace {

constexpr double kPi = 3.14159265358979323846;

// Vertical placement of the levels. Only the WAIST is derived from the chart
// (nape minus back length); the rest are declared block proportions and are
// flagged as such, the same convention constants.yaml uses.
constexpr double kNapeHeightFraction = 0.860;   // ASSUMPTION: nape at 86% of stature
constexpr double kNapeToBustFraction = 0.650;   // ASSUMPTION: Aldrich block, nape->bust over nape->waist
constexpr double kWaistToHipMM = 205.0;         // ASSUMPTION: Aldrich hip depth 20.5 cm

// Section aspect (side-to-side over front-to-back). ASSUMPTION per level; the
// chart carries girths only, never a shape. These are the first numbers a
// scanned body would overwrite.
constexpr double kAspectNeck = 1.05;
constexpr double kAspectBust = 1.35;
constexpr double kAspectWaist = 1.30;
constexpr double kAspectHip = 1.40;

void gaussLegendreNodes(int n, std::vector<double>& xs, std::vector<double>& ws) {
    xs.assign(n, 0.0);
    ws.assign(n, 0.0);
    for (int i = 0; i < n; ++i) {
        double x = std::cos(kPi * (i + 0.75) / (n + 0.5));
        double p = 0.0, dp = 0.0;
        for (int it = 0; it < 100; ++it) {
            double p0 = 1.0, p1 = x;
            for (int k = 2; k <= n; ++k) {
                const double pk = ((2.0 * k - 1.0) * x * p1 - (k - 1.0) * p0) / k;
                p0 = p1;
                p1 = pk;
            }
            p = p1;
            dp = n * (x * p1 - p0) / (x * x - 1.0);
            const double dx = -p / dp;
            x += dx;
            if (std::fabs(dx) < 1e-15) break;
        }
        xs[i] = x;
        ws[i] = 2.0 / ((1.0 - x * x) * dp * dp);
    }
}

}  // namespace

double ellipsePerimeter(double a, double b, int order) {
    std::vector<double> xs, ws;
    gaussLegendreNodes(order, xs, ws);
    // Split the full turn into four cells; the integrand has two humps per turn
    // and a single polynomial rule over [0, 2pi] would have to work too hard.
    const int cells = 4;
    const double cell = 2.0 * kPi / cells;
    double total = 0.0;
    for (int c = 0; c < cells; ++c) {
        const double mid = cell * (c + 0.5);
        for (int i = 0; i < order; ++i) {
            const double phi = mid + 0.5 * cell * xs[i];
            const double dx = -a * std::sin(phi);
            const double dy = b * std::cos(phi);
            total += std::sqrt(dx * dx + dy * dy) * ws[i] * 0.5 * cell;
        }
    }
    return total;
}

double BodySurface::Spline::at(double x) const {
    const int n = static_cast<int>(t.size());
    if (n == 0) return 0.0;
    if (n == 1) return y[0];
    // Natural spline: the second derivative is zero at both ends, so extending
    // the end tangent straight out stays C² and the poles keep their smoothness.
    if (x <= t.front()) {
        const double h = t[1] - t[0];
        const double slope = (y[1] - y[0]) / h - h * m[1] / 6.0;
        return y[0] + slope * (x - t[0]);
    }
    if (x >= t.back()) {
        const double h = t[n - 1] - t[n - 2];
        const double slope = (y[n - 1] - y[n - 2]) / h + h * m[n - 2] / 6.0;
        return y[n - 1] + slope * (x - t[n - 1]);
    }
    int lo = 0, hi = n - 1;
    while (hi - lo > 1) {
        const int mid = (lo + hi) / 2;
        if (t[mid] > x) hi = mid; else lo = mid;
    }
    const double h = t[hi] - t[lo];
    const double A = (t[hi] - x) / h;
    const double B = (x - t[lo]) / h;
    return A * y[lo] + B * y[hi] +
           ((A * A * A - A) * m[lo] + (B * B * B - B) * m[hi]) * (h * h) / 6.0;
}

namespace {

void buildNatural(std::vector<double> t, std::vector<double> y,
                  std::vector<double>& outT, std::vector<double>& outY,
                  std::vector<double>& outM) {
    const int n = static_cast<int>(t.size());
    std::vector<double> m(n, 0.0), u(n, 0.0);
    for (int i = 1; i < n - 1; ++i) {
        const double sig = (t[i] - t[i - 1]) / (t[i + 1] - t[i - 1]);
        const double p = sig * m[i - 1] + 2.0;
        m[i] = (sig - 1.0) / p;
        u[i] = (y[i + 1] - y[i]) / (t[i + 1] - t[i]) - (y[i] - y[i - 1]) / (t[i] - t[i - 1]);
        u[i] = (6.0 * u[i] / (t[i + 1] - t[i - 1]) - sig * u[i - 1]) / p;
    }
    for (int i = n - 2; i >= 0; --i) m[i] = m[i] * m[i + 1] + u[i];
    outT = std::move(t);
    outY = std::move(y);
    outM = std::move(m);
}

}  // namespace

BodySurface::BodySurface(const BodyMeasurementsSnapshot& body, double statureMM, double capMM) {
    const double napeZ = statureMM * kNapeHeightFraction;
    const double waistZ = napeZ - body.backLengthMM();
    const double bustZ = napeZ - kNapeToBustFraction * body.backLengthMM();
    const double hipZ = waistZ - kWaistToHipMM;

    // Ordered by increasing t, i.e. top of the body first: t = 0 is the neck
    // pole, t = pi the hip pole, matching the sphere convention in volume.cpp
    // so that r_t x r_phi points OUT and the enclosed volume comes back positive.
    levels_ = {
        {"neck", napeZ, body.neckMM(), kAspectNeck},
        {"bust", bustZ, body.bustMM(), kAspectBust},
        {"waist", waistZ, body.waistMM(), kAspectWaist},
        {"hip", hipZ, body.hipMM(), kAspectHip},
    };

    const double zTop = napeZ + capMM;
    const double zBot = hipZ - capMM;
    zCentre_ = 0.5 * (zTop + zBot);
    zHalf_ = 0.5 * (zTop - zBot);

    std::vector<double> ts, sigmas, aspects;
    for (const BodyLevel& lv : levels_) {
        const double t = parameterFor(lv.heightMM);
        // Unit-scale section: semi-axes (aspect, 1). Perimeter scales linearly,
        // so the calibration is one division and it is exact.
        const double unit = ellipsePerimeter(lv.widthToDepth, 1.0, 16);
        const double scale = lv.girthMM / unit;
        const double s = std::sin(t);
        if (s <= 0.0) throw std::runtime_error("level sits on a pole; widen capMM");
        ts.push_back(t);
        sigmas.push_back(scale / s);
        aspects.push_back(lv.widthToDepth);
    }
    knotT_ = ts;
    buildNatural(ts, sigmas, sigmaHat_.t, sigmaHat_.y, sigmaHat_.m);
    buildNatural(ts, aspects, aspect_.t, aspect_.y, aspect_.m);
}

double BodySurface::parameterFor(double heightMM) const {
    double c = (heightMM - zCentre_) / zHalf_;
    if (c > 1.0) c = 1.0;
    if (c < -1.0) c = -1.0;
    return std::acos(c);
}

Surface BodySurface::surface() const {
    // Captured by value: the returned closure outlives the caller's frame in
    // every use site (test harness, grading sweep).
    const Spline sigma = sigmaHat_;
    const Spline aspect = aspect_;
    const double zc = zCentre_;
    const double zh = zHalf_;
    return [sigma, aspect, zc, zh](double t, double phi) {
        const double scale = sigma.at(t) * std::sin(t);
        const double rho = aspect.at(t);
        return Vec3{scale * rho * std::cos(phi), scale * std::sin(phi), zc + zh * std::cos(t)};
    };
}

double BodySurface::measuredGirthMM(const BodyLevel& level, int order) const {
    const double t = parameterFor(level.heightMM);
    const double scale = sigmaHat_.at(t) * std::sin(t);
    const double rho = aspect_.at(t);
    return ellipsePerimeter(scale * rho, scale, order);
}

}  // namespace stitchu
