// FAZ 2 gate for the drawing engine. A garment is the body's outer parallel
// body: ease is an OFFSET, and Steiner's formulae make the conversion from a
// declared girth ease exact rather than fitted.
//
// The gates, in order:
//   1. Steiner as a witness. The shell is BUILT on P_d = P + 2*pi*d and
//      A_d = A + d*P + pi*d^2; both are re-measured off the drawn curve.
//   2. A declared girth ease comes back at the ring it was declared at. If a
//      draftsman asks for 80 mm of bust ease, the garment measures 80 mm more.
//   3. The ease VOLUME is positive, and it grows monotonically with the ease.
//      This is the number the industry does not have: room as a volume.
//   4. Zero ease reproduces the body exactly — a garment with no ease is skin.
//   5. The shell refuses to exist when the offset reaches the section's
//      smallest radius of curvature, and says where.
#include <cmath>
#include <cstdio>
#include <vector>

#include "../src/bodysurface.hpp"
#include "../src/garmentshell.hpp"
#include "../src/sizechart.hpp"

using namespace stitchu;

namespace {

constexpr double kPi = 3.14159265358979323846;
constexpr double kStatureMM = 1680.0;  // ASSUMPTION: as in body_volume_check
constexpr double kCapMM = 60.0;

int failures = 0;

void report(const char* label, double got, double want, double tol, const char* unit) {
    const double err = std::fabs(got - want);
    const bool ok = err <= tol;
    if (!ok) ++failures;
    std::printf("  %-30s %14.6f %-4s  sapma %.3e  %s\n", label, got, unit, err,
                ok ? "ok" : "FAIL");
}

void check(const char* label, bool ok, const char* detail) {
    if (!ok) ++failures;
    std::printf("  %-30s %-28s  %s\n", label, detail, ok ? "ok" : "FAIL");
}

}  // namespace

int main() {
    const SizeChartEntry* eu38 = euSize("EU38");
    if (!eu38) {
        std::printf("EU38 chart entry missing\n");
        return 1;
    }
    const BodySurface body(eu38->body, kStatureMM, kCapMM);

    // The garment: a sleeveless fitted top. It starts under the neck ring and
    // stops at the hip ring — both are DESIGN choices and are written as such.
    double neckZ = 0, bustZ = 0, waistZ = 0, hipZ = 0;
    for (const BodyLevel& lv : body.levels()) {
        if (lv.name == "neck") neckZ = lv.heightMM;
        if (lv.name == "bust") bustZ = lv.heightMM;
        if (lv.name == "waist") waistZ = lv.heightMM;
        if (lv.name == "hip") hipZ = lv.heightMM;
    }
    const double topZ = neckZ - 40.0;   // DESIGN: neckline drop below the nape ring
    const double hemZ = hipZ + 10.0;    // DESIGN: hem just above the hip ring

    // Aldrich close-fitting bodice ease, declared as girth at named rings.
    const std::vector<EaseRing> ease = {
        {"neck", 0.0}, {"bust", 80.0}, {"waist", 60.0}, {"hip", 60.0}};

    const GarmentShell shell(body, ease, topZ, hemZ);

    std::printf("KAPI 1 — Steiner insaat degil, tanik\n");
    const ShellMeasurement m = shell.measure(32, 32, 10);
    report("cevre kimligi P+2pi.d", m.worstSteinerGirthMM, 0.0, 1e-6, "mm");
    report("alan kimligi A+dP+pi.d2", m.worstSteinerAreaMM2, 0.0, 1e-4, "mm2");

    std::printf("KAPI 2 — beyan edilen bolluk halkasinda geri geliyor\n");
    for (const BodyLevel& lv : body.levels()) {
        double want = 0.0;
        for (const EaseRing& e : ease) {
            if (e.level == lv.name) want = e.girthEaseMM;
        }
        const double t = body.parameterFor(lv.heightMM);
        if (t < shell.tTop() || t > shell.tBottom()) continue;
        const double got = shell.sectionGirthMM(t, 24) - body.measuredGirthMM(lv, 24);
        report((lv.name + " bollugu").c_str(), got, want, 1e-6, "mm");
    }

    std::printf("KAPI 3 — bolluk bir HACIM ve bollukla birlikte buyuyor\n");
    std::printf("  %-30s %14.1f cm3\n", "giysi hacmi", m.garmentVolumeMM3 / 1000.0);
    std::printf("  %-30s %14.1f cm3\n", "govde hacmi (ayni bolge)", m.bodyVolumeMM3 / 1000.0);
    std::printf("  %-30s %14.1f cm3\n", "BOLLUK HACMI", m.easeVolumeMM3 / 1000.0);
    check("bolluk pozitif", m.easeVolumeMM3 > 0.0, "giysi govdeyi kapsiyor");

    double previous = -1.0;
    bool monotone = true;
    for (double scale : {0.0, 0.5, 1.0, 1.5, 2.0, 3.0}) {
        std::vector<EaseRing> scaled;
        for (const EaseRing& e : ease) scaled.push_back({e.level, e.girthEaseMM * scale});
        const GarmentShell s(body, scaled, topZ, hemZ);
        const ShellMeasurement sm = s.measure(24, 24, 8);
        if (sm.easeVolumeMM3 <= previous) monotone = false;
        std::printf("  bolluk x%-4.1f  %10.1f cm3   yuzey %8.1f cm2\n", scale,
                    sm.easeVolumeMM3 / 1000.0, sm.areaMM2 / 100.0);
        previous = sm.easeVolumeMM3;
    }
    check("hacim bollukla monoton", monotone, "x0 -> x3 artan");

    std::printf("KAPI 4 — sifir bolluk govdenin ta kendisi\n");
    {
        std::vector<EaseRing> none;
        for (const EaseRing& e : ease) none.push_back({e.level, 0.0});
        const GarmentShell s(body, none, topZ, hemZ);
        const ShellMeasurement sm = s.measure(32, 32, 10);
        report("sifir bolluk hacmi", sm.easeVolumeMM3, 0.0, 1e-3, "mm3");
    }

    std::printf("KAPI 5 — kabuk kendini keserse REDDEDIYOR\n");
    {
        const PinchReport ok = shell.pinch();
        std::printf("  %-30s %14.4f mm (t=%.4f, z=%.1f mm)\n", "en dar pay", ok.marginMM, ok.t,
                    ok.heightMM);
        check("gercek giysi gecerli", ok.ok, "pay pozitif");

        // Deliberately impossible: an ease far past the smallest radius of
        // curvature of the waist section.
        const std::vector<EaseRing> absurd = {
            {"neck", 0.0}, {"bust", 6000.0}, {"waist", 6000.0}, {"hip", 6000.0}};
        const GarmentShell bad(body, absurd, topZ, hemZ);
        const PinchReport pr = bad.pinch();
        std::printf("  %-30s d=%.2f mm > rMin=%.2f mm\n", "asiri bollukta", pr.offsetMM,
                    pr.minRadiusMM);
        check("asiri bolluk reddediliyor", !pr.ok, "kabuk kendini kesiyor");
    }

    std::printf("garment_shell_check: %s\n", failures == 0 ? "PASS" : "FAIL");
    return failures == 0 ? 0 : 1;
}
