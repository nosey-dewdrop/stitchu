// FAZ 1 gate for the volume run. A body built from the seven size-chart numbers
// has to (1) measure back the girths it was calibrated to, (2) close as a
// single smooth surface and say so through Gauss-Bonnet, and (3) grade
// monotonically in volume across EU34-52. Anything else fails.
#include <cmath>
#include <cstdio>

#include "../src/bodysurface.hpp"
#include "../src/sizechart.hpp"
#include "../src/volume.hpp"

using namespace stitchu;

namespace {

constexpr double kPi = 3.14159265358979323846;
constexpr double kStatureMM = 1680.0;  // ASSUMPTION: standard block stature, flat across sizes
constexpr double kCapMM = 60.0;

int failures = 0;

void report(const char* label, double got, double want, double tol, const char* unit) {
    const double err = std::fabs(got - want);
    const bool ok = err <= tol;
    if (!ok) ++failures;
    std::printf("  %-26s %14.6f %-4s  sapma %.3e  %s\n", label, got, unit, err, ok ? "ok" : "FAIL");
}

// Ramanujan's second approximation, used ONLY as an outside witness that the
// perimeter integral is measuring what it claims to measure.
double ramanujan(double a, double b) {
    const double h = ((a - b) * (a - b)) / ((a + b) * (a + b));
    return kPi * (a + b) * (1.0 + 3.0 * h / (10.0 + std::sqrt(4.0 - 3.0 * h)));
}

}  // namespace

int main() {
    std::printf("KAPI 1 — cevre integrali disaridan taniklaniyor\n");
    {
        const double a = 140.0, b = 100.0;
        const double got = ellipsePerimeter(a, b, 16);
        report("elips cevresi mm", got, ramanujan(a, b), 1e-6, "mm");
    }

    const SizeChartEntry* eu38 = euSize("EU38");
    if (!eu38) {
        std::printf("EU38 chart entry missing\n");
        return 1;
    }

    std::printf("KAPI 2 — EU38 govdesi kendi cevrelerini geri olcuyor\n");
    const BodySurface body(eu38->body, kStatureMM, kCapMM);
    for (const BodyLevel& lv : body.levels()) {
        report(lv.name.c_str(), body.measuredGirthMM(lv), lv.girthMM, 1e-6, "mm");
    }

    std::printf("KAPI 3 — kapalilik ve topoloji, olcumle ayni gecisten\n");
    const SurfaceIntegrals s =
        integrateSurface(body.surface(), 0.0, kPi, 0.0, 2.0 * kPi, 24, 24, 10);
    report("euler karakteristigi", s.eulerCharacteristic, 2.0, 1e-3, "");
    std::printf("  %-26s %14.1f cm3\n", "govde hacmi", s.volume / 1000.0);
    std::printf("  %-26s %14.1f cm2\n", "govde yuzeyi", s.area / 100.0);
    std::printf("  %-26s %14.1f mm\n", "agirlik merkezi z", s.centroid.z);

    std::printf("KAPI 4 — grade monoton mu (EU34-52)\n");
    double previous = -1.0;
    for (const SizeChartEntry& e : euSizeChart()) {
        const BodySurface b(e.body, kStatureMM, kCapMM);
        const SurfaceIntegrals si =
            integrateSurface(b.surface(), 0.0, kPi, 0.0, 2.0 * kPi, 20, 20, 8);
        const double litres = si.volume / 1e6;
        const bool rising = si.volume > previous;
        if (!rising) ++failures;
        std::printf("  %-8s hacim %8.3f L   yuzey %8.1f cm2   chi %8.5f   %s\n", e.label.c_str(),
                    litres, si.area / 100.0, si.eulerCharacteristic, rising ? "artan" : "FAIL");
        previous = si.volume;
    }

    std::printf("body_volume_check: %s\n", failures == 0 ? "PASS" : "FAIL");
    return failures == 0 ? 0 : 1;
}
