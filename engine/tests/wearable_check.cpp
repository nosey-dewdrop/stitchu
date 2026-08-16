// wearable_check: CAN A PERSON PUT THIS ON?
//
// Written on 2026-08-16 after the engine produced a dress, eight sizes, every
// geometric gate green — cut-line strain 0.0096%, waist deed +0.0006mm, walk
// 801/801 — and a print pack ready to cut. The neck opening measured 352.5mm.
//
//   "It is essential that the neck opening is not made less than 22 inches in
//    size all round, otherwise the wearer will find difficulty in getting her
//    head through the opening."
//        — Ladies' Garment Cutting and Making, Ch. X, Dress Cutting (1940s),
//          transcribed by the Vintage Sewing Reference Library
//
// 352.5mm is 13.88 inches. The head does not go through. Every number in the
// engine was green and the garment could not be worn, and the next step was to
// print it and cut cloth. No geometric gate can catch this, because nothing is
// geometrically wrong: it is a garment fact, and it belongs in a garment gate.
//
// The rule has a companion the 1960s pattern envelopes make explicit — every
// A-line dress of the period lists a closure: "22 inch neckline zipper" (Vogue
// 6900, Vogue Couturier 2063), "16 inch neck zipper" (Simplicity 7129 Jiffy).
// The 22-inch minimum is for a garment you PULL ON. With a back opening the
// neckline may be as small as the design wants, because the opening is the zip.
//
// So the gate is: EITHER the neck opening clears 22 inches, OR the garment has
// a closure. A dress that fails both cannot be listed and must not be printed.
#include <cmath>
#include <cstdio>

#include "../src/surfacepattern.hpp"
#include "../src/sizechart.hpp"

using namespace stitchu;

namespace {
constexpr double kPi = 3.14159265358979323846;
constexpr double kStatureMM = 1719.9;
constexpr double kCapMM = 120.0;
// 22 inches, the sourced minimum for a garment pulled on over the head.
constexpr double kHeadThroughMM = 22.0 * 25.4;
int failures = 0;

void gate(const char* label, double got, double bound, bool ok, const char* unit) {
    if (!ok) ++failures;
    std::printf("  %-38s %10.2f %-4s (kapı %g)  %s\n", label, got, unit, bound,
                ok ? "ok" : "FAIL");
}
}  // namespace

int main() {
    const char* sizes[] = {"EU34", "EU36", "EU38", "EU40", "EU42", "EU44", "EU46", "EU48"};
    std::printf("== GIYILEBILIR MI — kafa gecer mi, yoksa kapama var mi ==\n");

    double worstOpening = 1e9;
    const char* worstSize = "";
    bool haveClosure = false;

    for (const char* label : sizes) {
        const SizeChartEntry* e = euSize(label);
        if (!e) { ++failures; continue; }
        const BodySurface body(e->body, kStatureMM, kCapMM);
        const SheathOptions opt;
        haveClosure = opt.backOpeningMM > 0.0;

        double napeZ = 0, shH = 0, shHalf = 0;
        for (const BodyLevel& lv : body.levels()) {
            if (lv.name == "neck") napeZ = lv.heightMM;
            if (lv.name == "shoulder") { shH = lv.heightMM; shHalf = lv.halfWidthMM; }
        }
        if (shHalf <= 0.0) { ++failures; continue; }
        const double tanIncl = (napeZ - shH) / shHalf;

        // walk the neckline arc: the stretch of the top boundary inside the
        // neck width, measured on the garment surface in 3D
        const int N = 40000;
        double len = 0, px = 0, py = 0, pz = 0;
        bool have = false;
        for (int i = 0; i <= N; ++i) {
            const double phi = 2 * kPi * i / N;
            const double x = std::fabs(shHalf * std::cos(phi));
            if (x >= opt.neckHalfWidthMM) { have = false; continue; }
            const double neckPointZ = napeZ - tanIncl * opt.neckHalfWidthMM;
            const double drop = std::sin(phi) > 0 ? opt.frontNeckDropMM : opt.backNeckDropMM;
            const double h =
                neckPointZ - drop * 0.5 * (1.0 + std::cos(kPi * x / opt.neckHalfWidthMM));
            const Section s = body.sectionAt(body.parameterFor(h));
            double cx = 0, cy = 0;
            s.offsetPoint(0.0, phi, cx, cy);
            if (have) {
                const double dx = cx - px, dy = cy - py, dz = h - pz;
                len += std::sqrt(dx * dx + dy * dy + dz * dz);
            }
            px = cx; py = cy; pz = h; have = true;
        }
        if (len < worstOpening) { worstOpening = len; worstSize = label; }
    }

    std::printf("  en dar yaka açıklığı: %s\n", worstSize);
    gate("yaka açıklığı (kapamasız asgari)", worstOpening, kHeadThroughMM,
         haveClosure || worstOpening >= kHeadThroughMM, "mm");
    std::printf("  %-38s %10.2f inç\n", "  (aynısı inç olarak)", worstOpening / 25.4);
    std::printf("  %-38s %s\n", "arka kapama var mı",
                haveClosure ? "EVET — 22 inç kuralı düşer" : "YOK — 22 inç kuralı bağlar");

    if (failures)
        std::printf(
            "wearable_check FAIL (%d)\n"
            "  Bu kalıp basılmamalı: giyen kişi giysiyi üstüne geçiremez.\n"
            "  Çözüm ya yakayı 22 inçe açmak ya da arkaya kapama koymak.\n",
            failures);
    else
        std::printf("wearable_check ok\n");
    return failures ? 1 : 0;
}
