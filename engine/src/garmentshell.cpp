#include "garmentshell.hpp"

#include <algorithm>
#include <cmath>
#include <stdexcept>

namespace stitchu {
namespace {

constexpr double kPi = 3.14159265358979323846;

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

// The offset section curve and its first derivative, in closed form.
// c(phi)   = (a cos, b sin)                     the body section
// n_hat    = (b cos, a sin) / L,  L = |c'|      outward unit normal, in plane
// c_d(phi) = ((a + d b/L) cos, (b + d a/L) sin) the parallel curve
struct OffsetPoint {
    double x = 0, y = 0, dx = 0, dy = 0;
};

OffsetPoint offsetPoint(double a, double b, double d, double phi) {
    const double s = std::sin(phi), c = std::cos(phi);
    const double L2 = a * a * s * s + b * b * c * c;
    const double L = std::sqrt(L2);
    const double dL = (a * a - b * b) * s * c / L;

    const double f = a + d * b / L;
    const double g = b + d * a / L;
    const double df = -d * b * dL / L2;
    const double dg = -d * a * dL / L2;

    OffsetPoint p;
    p.x = f * c;
    p.y = g * s;
    p.dx = df * c - f * s;
    p.dy = dg * s + g * c;
    return p;
}

}  // namespace

double GarmentShell::Spline::at(double x) const {
    const int n = static_cast<int>(t.size());
    if (n == 0) return 0.0;
    if (n == 1) return y[0];
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

GarmentShell::GarmentShell(const BodySurface& body,
                           const std::vector<EaseRing>& ease,
                           double topHeightMM,
                           double bottomHeightMM)
    : body_(&body) {
    tTop_ = body.parameterFor(topHeightMM);
    tBottom_ = body.parameterFor(bottomHeightMM);
    if (!(tBottom_ > tTop_)) {
        throw std::runtime_error("garment top must sit above the hem");
    }

    std::vector<double> ts, ds;
    for (const BodyLevel& lv : body.levels()) {
        double girthEase = 0.0;
        bool named = false;
        for (const EaseRing& e : ease) {
            if (e.level == lv.name) {
                girthEase = e.girthEaseMM;
                named = true;
                break;
            }
        }
        (void)named;  // an unnamed ring is zero ease, declared by omission
        ts.push_back(body.parameterFor(lv.heightMM));
        // Steiner: a girth grows by exactly 2*pi*d under an outward offset d.
        ds.push_back(girthEase / (2.0 * kPi));
    }
    if (ts.size() < 2) throw std::runtime_error("need at least two body levels");
    buildNatural(ts, ds, offset_.t, offset_.y, offset_.m);
}

double GarmentShell::offsetMM(double t) const { return offset_.at(t); }

void GarmentShell::sectionAt(double t, double& a, double& b, double& d) const {
    body_->sectionSemiAxes(t, a, b);
    d = offset_.at(t);
}

Surface GarmentShell::surface() const {
    const BodySurface* body = body_;
    const Spline off = offset_;
    return [body, off](double t, double phi) {
        double a = 0, b = 0;
        body->sectionSemiAxes(t, a, b);
        const OffsetPoint p = offsetPoint(a, b, off.at(t), phi);
        return Vec3{p.x, p.y, body->heightAt(t)};
    };
}

double GarmentShell::sectionGirthMM(double t, int order) const {
    double a = 0, b = 0, d = 0;
    sectionAt(t, a, b, d);
    std::vector<double> xs, ws;
    gaussLegendreNodes(order, xs, ws);
    const int cells = 4;
    const double cell = 2.0 * kPi / cells;
    double total = 0.0;
    for (int c = 0; c < cells; ++c) {
        const double mid = cell * (c + 0.5);
        for (int i = 0; i < order; ++i) {
            const OffsetPoint p = offsetPoint(a, b, d, mid + 0.5 * cell * xs[i]);
            total += std::sqrt(p.dx * p.dx + p.dy * p.dy) * ws[i] * 0.5 * cell;
        }
    }
    return total;
}

double GarmentShell::sectionAreaMM2(double t, int order) const {
    double a = 0, b = 0, d = 0;
    sectionAt(t, a, b, d);
    std::vector<double> xs, ws;
    gaussLegendreNodes(order, xs, ws);
    const int cells = 4;
    const double cell = 2.0 * kPi / cells;
    double total = 0.0;
    for (int c = 0; c < cells; ++c) {
        const double mid = cell * (c + 0.5);
        for (int i = 0; i < order; ++i) {
            const OffsetPoint p = offsetPoint(a, b, d, mid + 0.5 * cell * xs[i]);
            total += 0.5 * (p.x * p.dy - p.y * p.dx) * ws[i] * 0.5 * cell;
        }
    }
    return total;
}

PinchReport GarmentShell::pinch(int samples) const {
    PinchReport worst;
    worst.ok = true;
    worst.marginMM = 1e300;
    for (int i = 0; i <= samples; ++i) {
        const double t = tTop_ + (tBottom_ - tTop_) * i / samples;
        double a = 0, b = 0, d = 0;
        sectionAt(t, a, b, d);
        const double major = std::max(a, b);
        const double minor = std::min(a, b);
        // Smallest radius of curvature of an ellipse sits at the end of the
        // major axis and equals minor^2 / major. The parallel curve develops a
        // cusp exactly when the offset reaches it.
        const double rMin = major > 0.0 ? minor * minor / major : 0.0;
        const double margin = rMin - d;
        if (margin < worst.marginMM) {
            worst.marginMM = margin;
            worst.t = t;
            worst.heightMM = body_->heightAt(t);
            worst.offsetMM = d;
            worst.minRadiusMM = rMin;
            worst.ok = margin > 0.0;
        }
    }
    return worst;
}

double GarmentShell::capContribution(double t, double sign) const {
    // A flat cap at height z has outward normal (0,0,sign), so r.n = sign*z and
    // the divergence-theorem integrand contributes (1/3) sign z A.
    return (1.0 / 3.0) * sign * body_->heightAt(t) * sectionAreaMM2(t, 24);
}

ShellMeasurement GarmentShell::measure(int cellsT, int cellsPhi, int order) const {
    ShellMeasurement out;

    const SurfaceIntegrals wall =
        integrateSurface(surface(), tTop_, tBottom_, 0.0, 2.0 * kPi, cellsT, cellsPhi, order);
    out.areaMM2 = wall.area;
    out.garmentVolumeMM3 = wall.volume + capContribution(tTop_, +1.0) + capContribution(tBottom_, -1.0);

    // The same region with zero ease is the body it has to be compared against;
    // an ease volume measured against anything else would be a different solid.
    const BodySurface* body = body_;
    Surface bare = [body](double t, double phi) {
        double a = 0, b = 0;
        body->sectionSemiAxes(t, a, b);
        const OffsetPoint p = offsetPoint(a, b, 0.0, phi);
        return Vec3{p.x, p.y, body->heightAt(t)};
    };
    const SurfaceIntegrals bareWall =
        integrateSurface(bare, tTop_, tBottom_, 0.0, 2.0 * kPi, cellsT, cellsPhi, order);
    double bareVolume = bareWall.volume;
    for (int k = 0; k < 2; ++k) {
        const double t = k == 0 ? tTop_ : tBottom_;
        const double sign = k == 0 ? 1.0 : -1.0;
        double a = 0, b = 0;
        body_->sectionSemiAxes(t, a, b);
        bareVolume += (1.0 / 3.0) * sign * body_->heightAt(t) * kPi * a * b;
    }
    out.bodyVolumeMM3 = bareVolume;
    out.easeVolumeMM3 = out.garmentVolumeMM3 - out.bodyVolumeMM3;

    // Steiner as a witness, not as a hope. The construction assumed
    // P_d = P + 2*pi*d and A_d = A + d*P + pi*d^2; both are now re-measured off
    // the curve that was actually drawn.
    const int rings = 64;
    for (int i = 0; i <= rings; ++i) {
        const double t = tTop_ + (tBottom_ - tTop_) * i / rings;
        double a = 0, b = 0, d = 0;
        sectionAt(t, a, b, d);
        const double basePerimeter = ellipsePerimeter(a, b, 24);
        const double baseArea = kPi * a * b;

        const double girthErr =
            std::fabs(sectionGirthMM(t, 24) - (basePerimeter + 2.0 * kPi * d));
        const double areaErr =
            std::fabs(sectionAreaMM2(t, 24) - (baseArea + d * basePerimeter + kPi * d * d));
        out.worstSteinerGirthMM = std::max(out.worstSteinerGirthMM, girthErr);
        out.worstSteinerAreaMM2 = std::max(out.worstSteinerAreaMM2, areaErr);
    }
    return out;
}

}  // namespace stitchu
