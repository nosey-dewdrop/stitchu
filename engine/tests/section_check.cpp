// section_check: the body has a FRONT and a BACK, and every claim that came
// with that is a gate here rather than a sentence in a commit message.
//
// The model this replaced made every cross section a centred ellipse, symmetric
// about both axes. The printpack referee had been reporting the consequence
// since 12 August — "8 panels in the specification -> 2 pieces drawn", all four
// torso panels one shape to 0.0000mm — and no real dress is cut that way.
//
//   S1 GIRTH        the section's arc length IS the chart girth. It used to be
//                   an ellipse perimeter; the definition never was.
//   S2 BACK SHARE   the back's arc is the published fraction of that girth.
//                   Source is not a guess: GarmentCode's own programs use
//                   back_width as an arc of the girth (bodice.py:22,
//                   bands.py:50, circle_skirt.py:150).
//   S3 CONVEXITY    strictly convex everywhere, by the closed form
//                   x'y'' - y'x'' = a(bm + 2 bd sin^3), i.e. bm > 2|bd|. Both
//                   Steiner and the shell's refusal law need this.
//   S4 STEINER      the outer parallel curve's perimeter is P + 2*pi*d EXACTLY,
//                   for any convex curve. This is the whole reason ease can be
//                   a division (d = ease/2pi) and never a fitted constant, and
//                   it is the identity that had to survive losing the ellipse's
//                   closed-form offset.
//   S5 SMOOTHNESS   the tangent is continuous and non-vanishing at phi = 0 and
//                   pi — the side points, where the side seam lives. A kink
//                   there would be a crease the flatten could never absorb.
//   S6 ASYMMETRY    front depth and back depth actually DIFFER. Without this
//                   gate every other one above would still pass on the old
//                   symmetric body, and the bug would come back silently.
//   S7 NO CUSP      the wearing-ease offset stays under the smallest radius of
//                   curvature, so the parallel curve never folds through itself.
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/bodysurface.hpp"
#include "../src/sizechart.hpp"

using namespace stitchu;

namespace {

constexpr double kPi = 3.14159265358979323846;
constexpr double kStatureMM = 1719.9;
constexpr double kCapMM = 120.0;
int failures = 0;

void gate(const char* label, double got, double bound, bool ok) {
    if (!ok) ++failures;
    std::printf("  %-34s %13.6f  (kapı %g)  %s\n", label, got, bound, ok ? "ok" : "FAIL");
}

// the back share the chart publishes for a named ring, 0.5 when none
double publishedBackFrac(const BodyMeasurementsSnapshot& b, const std::string& ring) {
    if (ring == "bust") return b.bustBackFrac > 0 ? b.bustBackFrac : 0.5;
    if (ring == "waist") return b.waistBackFrac > 0 ? b.waistBackFrac : 0.5;
    if (ring == "hip") return b.hipBackFrac > 0 ? b.hipBackFrac : 0.5;
    return 0.5;
}

}  // namespace

int main() {
    const char* sizes[] = {"EU34", "EU36", "EU38", "EU40", "EU42", "EU44", "EU46", "EU48"};

    double worstGirth = 0, worstShare = 0, worstSteiner = 0, worstKink = 0;
    double leastConvexMargin = 1e300, leastCuspMargin = 1e300, leastAsym = 1e300;
    double worstWidth = 0;

    for (const char* label : sizes) {
        const SizeChartEntry* e = euSize(label);
        if (!e) {
            std::printf("  bilinmeyen beden %s\n", label);
            ++failures;
            continue;
        }
        const BodySurface body(e->body, kStatureMM, kCapMM);

        for (const BodyLevel& lv : body.levels()) {
            const Section s = body.sectionAt(body.parameterFor(lv.heightMM));

            // A level promises EITHER a girth or a width, never both. The
            // shoulder is the width case — a size chart gives shoulder-to-
            // shoulder across the body and never a girth around it — so its
            // girth is derived and gating it against a chart number it never
            // had would be gating against zero. Each level is held to what it
            // actually promised.
            if (lv.halfWidthMM > 0.0) {
                // S1w — the width-driven level hits its width exactly
                worstWidth = std::max(worstWidth, std::fabs(s.a - lv.halfWidthMM));
            } else {
                // S1 — the arc length of the section curve is the chart girth
                worstGirth = std::max(worstGirth, std::fabs(s.perimeter(24) - lv.girthMM));
                // S2 — the back's share of that arc is what the contract publishes
                const double share = s.backArc(24) / s.perimeter(24);
                worstShare = std::max(worstShare,
                                      std::fabs(share - publishedBackFrac(e->body, lv.name)));
            }

            // S3 — strictly convex, closed form
            leastConvexMargin = std::min(leastConvexMargin, s.bm - 2.0 * std::fabs(s.bd));

            // S6 — front and back depth really differ (except the neck, which
            // has no published split and is symmetric BY DECLARATION)
            if (lv.name != "neck" && lv.name != "shoulder")
                leastAsym = std::min(leastAsym, std::fabs(s.bd) / s.bm);

            // S5 — no KINK at the side points (phi = 0, pi), where the side seam
            // lives. Measuring |speed(phi+h) - speed(phi-h)| at one h measures
            // the DERIVATIVE, not a kink, and a smooth curve fails that by
            // construction — the first version of this gate did exactly that.
            // A kink is a jump that does NOT vanish with h, so shrink h by 100
            // and the difference must shrink by ~100 too. Ratio near 1 = kink.
            for (double phi : {0.0, kPi}) {
                const double dCoarse =
                    std::fabs(s.speed(phi + 1e-4) - s.speed(phi - 1e-4));
                const double dFine =
                    std::fabs(s.speed(phi + 1e-6) - s.speed(phi - 1e-6));
                // report the surviving jump: what is left after the linear part
                // is divided out. 0 for a smooth curve, ~dCoarse for a kink.
                worstKink = std::max(worstKink, dFine * 100.0 - dCoarse);
                if (!(s.speed(phi) > 1e-9)) ++failures;
            }

            // S4 — Steiner, measured INDEPENDENTLY of the formula under test.
            //
            // The first version integrated |c_d'| = |c'|(1 + d*kappa), which is
            // the very identity offsetPoint() is built on, so it could only ever
            // agree with itself. This walks the actual offset POINTS and sums
            // chords: if offsetPoint() put a point in the wrong place, this sees
            // it. Chord sum converges from below as O(1/n^2), so n is large and
            // the bound is microns rather than 1e-6.
            const double rMin = s.minRadiusOfCurvature();
            for (double frac : {0.05, 0.2, 0.5}) {
                const double d = frac * rMin;
                const int n = 65536;
                double len = 0, px = 0, py = 0, x0 = 0, y0 = 0;
                for (int i = 0; i <= n; ++i) {
                    double cx = 0, cy = 0;
                    s.offsetPoint(d, 2 * kPi * i / n, cx, cy);
                    if (i == 0) { x0 = cx; y0 = cy; }
                    else len += std::hypot(cx - px, cy - py);
                    px = cx;
                    py = cy;
                }
                (void)x0; (void)y0;
                const double predicted = s.perimeter(24) + 2 * kPi * d;
                worstSteiner = std::max(worstSteiner, std::fabs(len - predicted));
            }

            // S7 — the wearing ease actually used never reaches the cusp radius.
            // Ease is declared as girth mm; d = ease/(2*pi). The sheath uses
            // 60/25/50mm at bust/waist/hip, so take the largest of those.
            const double dUsed = 60.0 / (2 * kPi);
            leastCuspMargin = std::min(leastCuspMargin, rMin - dUsed);
        }
    }

    std::printf("== KESIT — vucudun onu ve arkasi (8 beden x 4 halka) ==\n");
    gate("S1 cevre - chart cevresi mm", worstGirth, 0.01, worstGirth < 0.01);
    gate("S2 arka pay - kontrat payi", worstShare, 1e-6, worstShare < 1e-6);
    gate("S1w genislik - chart genisligi mm", worstWidth, 1e-9, worstWidth < 1e-9);
    gate("S3 konvekslik payi bm-2|bd|", leastConvexMargin, 0.0, leastConvexMargin > 0.0);
    gate("S4 Steiner P_d-(P+2pi d) mm", worstSteiner, 1e-3, worstSteiner < 1e-3);
    gate("S5 yan noktada kink artigi", worstKink, 1e-4, std::fabs(worstKink) < 1e-4);
    gate("S6 en kucuk asimetri |bd|/bm", leastAsym, 0.01, leastAsym > 0.01);
    gate("S7 cusp payi rMin-d mm", leastCuspMargin, 0.0, leastCuspMargin > 0.0);

    std::printf(failures ? "section_check FAIL (%d)\n" : "section_check ok\n", failures);
    return failures ? 1 : 0;
}
