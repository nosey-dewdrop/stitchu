// Volume kernel ratchet. The integrator is checked against solids whose area,
// volume, centroid and total curvature are known in closed form, so "the
// integral is right" is a measured relative error and not a claim.
//
// Gauss-Bonnet is the interesting column: the same pass that measures a shape
// also reports its Euler characteristic, so a closed surface says out loud
// whether it is a sphere (χ=2) or a torus (χ=0) without anyone labelling it.
#include <cmath>
#include <cstdio>

#include "../src/volume.hpp"

using stitchu::integrateSurface;
using stitchu::Surface;
using stitchu::SurfaceIntegrals;
using stitchu::Vec3;

namespace {

constexpr double kPi = 3.14159265358979323846;

int failures = 0;

double relative(double got, double want) {
    if (want == 0.0) return std::fabs(got);
    return std::fabs(got - want) / std::fabs(want);
}

void expectRelative(const char* label, double got, double want, double tol) {
    const double err = relative(got, want);
    const bool ok = err <= tol;
    if (!ok) ++failures;
    std::printf("  %-28s got %18.6f  want %18.6f  rel %.3e  %s\n", label, got, want, err,
                ok ? "ok" : "FAIL");
}

void expectAbsolute(const char* label, double got, double want, double tol) {
    const double err = std::fabs(got - want);
    const bool ok = err <= tol;
    if (!ok) ++failures;
    std::printf("  %-28s got %18.9f  want %18.9f  abs %.3e  %s\n", label, got, want, err,
                ok ? "ok" : "FAIL");
}

}  // namespace

int main() {
    const int cells = 12;
    const int order = 8;

    // ---- sphere, pushed off the origin so the centroid test has teeth ------
    {
        const double R = 100.0;
        const Vec3 c{30.0, -40.0, 55.0};
        Surface sphere = [&](double t, double p) {
            return Vec3{c.x + R * std::sin(t) * std::cos(p), c.y + R * std::sin(t) * std::sin(p),
                        c.z + R * std::cos(t)};
        };
        std::printf("sphere R=%.0fmm centre (%.0f, %.0f, %.0f)\n", R, c.x, c.y, c.z);
        const SurfaceIntegrals s = integrateSurface(sphere, 0.0, kPi, 0.0, 2.0 * kPi, cells, cells, order);
        expectRelative("area mm2", s.area, 4.0 * kPi * R * R, 1e-8);
        expectRelative("volume mm3", s.volume, 4.0 / 3.0 * kPi * R * R * R, 1e-8);
        expectAbsolute("centroid x mm", s.centroid.x, c.x, 1e-6);
        expectAbsolute("centroid y mm", s.centroid.y, c.y, 1e-6);
        expectAbsolute("centroid z mm", s.centroid.z, c.z, 1e-6);
        expectAbsolute("euler characteristic", s.eulerCharacteristic, 2.0, 1e-4);
    }

    // ---- ellipsoid: volume closed form, area is not, curvature still 4π ----
    {
        const double a = 180.0, b = 120.0, cc = 90.0;
        Surface ellipsoid = [&](double t, double p) {
            return Vec3{a * std::sin(t) * std::cos(p), b * std::sin(t) * std::sin(p), cc * std::cos(t)};
        };
        std::printf("ellipsoid %.0f x %.0f x %.0f mm\n", a, b, cc);
        const SurfaceIntegrals s =
            integrateSurface(ellipsoid, 0.0, kPi, 0.0, 2.0 * kPi, cells, cells, order);
        expectRelative("volume mm3", s.volume, 4.0 / 3.0 * kPi * a * b * cc, 1e-8);
        expectAbsolute("centroid x mm", s.centroid.x, 0.0, 1e-6);
        expectAbsolute("euler characteristic", s.eulerCharacteristic, 2.0, 1e-4);
    }

    // ---- torus: the genus-1 case, where χ has to come back 0 ---------------
    {
        const double R = 200.0, a = 60.0;
        Surface torus = [&](double u, double v) {
            return Vec3{(R + a * std::cos(v)) * std::cos(u), (R + a * std::cos(v)) * std::sin(u),
                        a * std::sin(v)};
        };
        std::printf("torus R=%.0fmm tube=%.0fmm\n", R, a);
        const SurfaceIntegrals s =
            integrateSurface(torus, 0.0, 2.0 * kPi, 0.0, 2.0 * kPi, cells, cells, order);
        expectRelative("area mm2", s.area, 4.0 * kPi * kPi * R * a, 1e-8);
        expectRelative("volume mm3", s.volume, 2.0 * kPi * kPi * R * a * a, 1e-8);
        expectAbsolute("euler characteristic", s.eulerCharacteristic, 0.0, 1e-4);
    }

    // ---- ease as a VOLUME: the shell between body and garment -------------
    // Pattern software reports ease as a few millimetres at a few girths. With
    // an integrator the same garment reports the air it actually holds, which
    // is a single number over the whole surface. Two concentric spheres make
    // the identity checkable: the shell is the difference of two exact volumes.
    {
        const double body = 100.0, shell = 106.0;
        Surface outer = [&](double t, double p) {
            return Vec3{shell * std::sin(t) * std::cos(p), shell * std::sin(t) * std::sin(p),
                        shell * std::cos(t)};
        };
        Surface inner = [&](double t, double p) {
            return Vec3{body * std::sin(t) * std::cos(p), body * std::sin(t) * std::sin(p),
                        body * std::cos(t)};
        };
        const SurfaceIntegrals o = integrateSurface(outer, 0.0, kPi, 0.0, 2.0 * kPi, cells, cells, order);
        const SurfaceIntegrals i = integrateSurface(inner, 0.0, kPi, 0.0, 2.0 * kPi, cells, cells, order);
        const double easeVolume = o.volume - i.volume;
        const double want = 4.0 / 3.0 * kPi * (shell * shell * shell - body * body * body);
        std::printf("ease shell %.0fmm over a %.0fmm body\n", shell - body, body);
        expectRelative("ease volume mm3", easeVolume, want, 1e-8);
        std::printf("  %-28s %.2f cm3\n", "ease volume cm3", easeVolume / 1000.0);
    }

    std::printf("volume_check: %s\n", failures == 0 ? "PASS" : "FAIL");
    return failures == 0 ? 0 : 1;
}
