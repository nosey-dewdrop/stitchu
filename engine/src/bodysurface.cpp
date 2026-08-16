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

// Gauss-Legendre over [p0,p1] split into `cells` panels. The section speed has
// two humps per turn, so one polynomial rule over a whole turn works far too
// hard; ellipsePerimeter already uses four cells per turn for the same reason.
double integrateSpeed(const Section& sec, double p0, double p1, int order, int cells) {
    std::vector<double> xs, ws;
    gaussLegendreNodes(order, xs, ws);
    const double cell = (p1 - p0) / cells;
    double total = 0.0;
    for (int c = 0; c < cells; ++c) {
        const double mid = p0 + cell * (c + 0.5);
        for (int i = 0; i < order; ++i)
            total += sec.speed(mid + 0.5 * cell * xs[i]) * ws[i] * 0.5 * cell;
    }
    return total;
}

}  // namespace

double Section::arcLength(double phi0, double phi1, int order) const {
    // one cell per quarter turn, minimum two
    const int cells = std::max(2, 2 * static_cast<int>(std::ceil(std::fabs(phi1 - phi0) / (kPi / 2))));
    return integrateSpeed(*this, phi0, phi1, order, cells);
}

double Section::perimeter(int order) const { return arcLength(0.0, 2.0 * kPi, order); }

double Section::backArc(int order) const { return arcLength(kPi, 2.0 * kPi, order); }

double Section::area(int order) const {
    std::vector<double> xs, ws;
    gaussLegendreNodes(order, xs, ws);
    const int cells = 8;
    const double cell = 2.0 * kPi / cells;
    double total = 0.0;
    for (int c = 0; c < cells; ++c) {
        const double mid = cell * (c + 0.5);
        for (int i = 0; i < order; ++i) {
            const double p = mid + 0.5 * cell * xs[i];
            total += (x(p) * dy(p) - y(p) * dx(p)) * ws[i] * 0.5 * cell;
        }
    }
    return 0.5 * total;
}

void Section::normal(double phi, double& nx, double& ny) const {
    const double u = dx(phi), v = dy(phi);
    const double L = std::sqrt(u * u + v * v);
    nx = v / L;
    ny = -u / L;
}

void Section::offsetPoint(double d, double phi, double& px, double& py) const {
    double nx = 0, ny = 0;
    normal(phi, nx, ny);
    px = x(phi) + d * nx;
    py = y(phi) + d * ny;
}

double Section::minRadiusOfCurvature(int order) const {
    // kappa is smooth and its extremes sit near the axes; a dense sweep is cheap
    // and honest here — this number only gates the shell's refusal to exist, it
    // is not in a hot loop, and a closed-form extremum would be a second thing
    // to keep true.
    const int n = std::max(720, order * 16);
    double worst = std::numeric_limits<double>::infinity();
    for (int i = 0; i < n; ++i) {
        const double k = curvature(2.0 * kPi * i / n);
        if (k <= 0.0) return 0.0;  // not convex: no offset distance is safe
        worst = std::min(worst, 1.0 / k);
    }
    return worst;
}

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

// Solve k = bd/bm so the unit section's BACK arc is the given fraction of its
// perimeter. backArc/perimeter is continuous and strictly decreasing in k (more
// front depth lengthens the front half and shortens the back's share), so
// bisection is the whole method — no seed, no tuning, and it either brackets or
// it says so. The bracket is the CONVEXITY limit |k| < 1/2 (see Section), kept
// a hair inside so the returned section is strictly convex.
double solveAsymmetry(double aspect, double backFraction) {
    auto share = [&](double k) {
        const Section s{aspect, 1.0, k};
        return s.backArc(16) / s.perimeter(16);
    };
    double lo = -0.499, hi = 0.499;
    const double fLo = share(lo), fHi = share(hi);
    // share(lo) is the LARGEST back share, share(hi) the smallest
    if (backFraction >= fLo || backFraction <= fHi)
        throw std::runtime_error("backArcFraction outside what a convex section can express");
    for (int i = 0; i < 80; ++i) {
        const double mid = 0.5 * (lo + hi);
        if (share(mid) > backFraction) lo = mid; else hi = mid;
    }
    return 0.5 * (lo + hi);
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
    // A back share of 0 means the caller supplied none; fall back to 0.5, which
    // is the symmetric section this model replaced — so an omission shows up as
    // "no front and no back" rather than as a silently invented asymmetry.
    auto backFrac = [](double f) { return f > 0.0 ? f : 0.5; };
    levels_ = {
        // the neck has NO published front/back split; symmetric, declared
        {"neck", napeZ, body.neckMM(), kAspectNeck, 0.5},
        {"bust", bustZ, body.bustMM(), kAspectBust, backFrac(body.bustBackFrac)},
        {"waist", waistZ, body.waistMM(), kAspectWaist, backFrac(body.waistBackFrac)},
        {"hip", hipZ, body.hipMM(), kAspectHip, backFrac(body.hipBackFrac)},
    };

    const double zTop = napeZ + capMM;
    const double zBot = hipZ - capMM;
    zCentre_ = 0.5 * (zTop + zBot);
    zHalf_ = 0.5 * (zTop - zBot);

    std::vector<double> ts, sigmas, aspects, asyms;
    for (const BodyLevel& lv : levels_) {
        const double t = parameterFor(lv.heightMM);
        const double s = std::sin(t);
        if (s <= 0.0) throw std::runtime_error("level sits on a pole; widen capMM");

        // TWO constraints, THREE unknowns (a, bm, bd), one declared assumption.
        //   1. total perimeter        = chart girth
        //   2. back arc / perimeter   = level.backArcFraction  (measured)
        //   3. a / bm                 = level.widthToDepth     (ASSUMPTION)
        // The shape parameter k = bd/bm is SCALE-FREE, so constraint 2 solves on
        // the unit section alone and constraint 1 is then a single division —
        // exactly the structure the ellipse calibration had, one root find wider.
        const double k = solveAsymmetry(lv.widthToDepth, lv.backArcFraction);
        const Section unitSec{lv.widthToDepth, 1.0, k};
        const double scale = lv.girthMM / unitSec.perimeter(16);

        ts.push_back(t);
        sigmas.push_back(scale / s);
        aspects.push_back(lv.widthToDepth);
        asyms.push_back(k);
    }
    knotT_ = ts;
    buildNatural(ts, sigmas, sigmaHat_.t, sigmaHat_.y, sigmaHat_.m);
    buildNatural(ts, aspects, aspect_.t, aspect_.y, aspect_.m);
    buildNatural(ts, asyms, asym_.t, asym_.y, asym_.m);
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
    const Spline asym = asym_;
    const double zc = zCentre_;
    const double zh = zHalf_;
    return [sigma, aspect, asym, zc, zh](double t, double phi) {
        // The pole-closure trick is untouched: the section SCALE still vanishes
        // as sigmaHat(t)*sin(t), so both poles close C-2 the way a sphere does
        // and Gauss-Bonnet still reports chi = 2. Asymmetry rides on the shape
        // parameter k, which is scale-free and stays finite at the poles.
        const double scale = sigma.at(t) * std::sin(t);
        const Section s{scale * aspect.at(t), scale, scale * asym.at(t)};
        return Vec3{s.x(phi), s.y(phi), zc + zh * std::cos(t)};
    };
}

Section BodySurface::sectionAt(double t) const {
    const double scale = sigmaHat_.at(t) * std::sin(t);
    return Section{scale * aspect_.at(t), scale, scale * asym_.at(t)};
}

void BodySurface::sectionSemiAxes(double t, double& a, double& b) const {
    const Section s = sectionAt(t);
    a = s.a;
    b = s.bm;
}

double BodySurface::heightAt(double t) const { return zCentre_ + zHalf_ * std::cos(t); }

double BodySurface::measuredGirthMM(const BodyLevel& level, int order) const {
    // The girth is the arc length of the SECTION CURVE, whatever that curve is.
    // It used to be an ellipse perimeter; the definition never was.
    return sectionAt(parameterFor(level.heightMM)).perimeter(order);
}

double BodySurface::measuredBackArcMM(const BodyLevel& level, int order) const {
    return sectionAt(parameterFor(level.heightMM)).backArc(order);
}

}  // namespace stitchu
