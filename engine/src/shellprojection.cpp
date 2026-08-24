#include "shellprojection.hpp"

#include <cmath>
#include <stdexcept>

namespace stitchu {

namespace {

constexpr double kPi = 3.14159265358979323846;
// Vertical sample step for the silhouette, mm. DECLARED: it is a display
// resolution, not a drafting number. The engine's own mesh runs at 8mm
// (SheathOptions::rowStepMM); a drawn outline can afford half of that, and the
// fitted chain below is what a consumer actually uses anyway.
constexpr double kSampleStepMM = 4.0;
// Cubic fit tolerance, mm — the same 0.15mm tools/surface-pattern.cpp fits every
// seam chain to. One tolerance for both lines, so a curve does not mean two
// different things depending on which file drew it.
constexpr double kFitTolMM = 0.15;
// Gauss-Legendre order for the section perimeter; bodysurface.cpp's own default.
constexpr int kPerimOrder = 24;

const GarmentSurf::Ring& ringNamed(const GarmentSurf& s, const std::string& name) {
    for (const GarmentSurf::Ring& r : s.rings)
        if (r.name == name) return r;
    throw std::runtime_error("shell has no ring named " + name);
}

// The two readings of the shell at one height, both from effectiveSection so the
// skim run, the A-line hem and the hip blend are applied exactly once, in the
// engine's own code, and never restated here.
double halfWidthAt(const GarmentSurf& s, double h) {
    double d = 0.0;
    const Section sec = s.effectiveSection(h, d);
    return sec.a + d;  // extreme x of the outward offset: normal is horizontal at phi=0
}

double girthAt(const GarmentSurf& s, double h) {
    double d = 0.0;
    const Section sec = s.effectiveSection(h, d);
    // Steiner: the outer parallel curve of a convex section has perimeter
    // P + 2*pi*d exactly. Convexity is decidable (Section::convex), so a section
    // that does not qualify is refused rather than silently measured wrong.
    if (!sec.convex())
        throw std::runtime_error("shell section is not convex at this height: "
                                 "Steiner's perimeter identity does not apply");
    return sec.perimeter(kPerimOrder) + 2.0 * kPi * d;
}

// THE CENTRE-FRONT (or CENTRE-BACK) LINE OF THE SHELL, AS A LENGTH ALONG THE
// CLOTH. Why it exists: body_length used to be shoulder.h - hemZ, a VERTICAL
// HEIGHT DIFFERENCE, and it was compared against the pattern side, which sums
// the arc of the centre-front seam ACROSS THE CLOTH (tools/pattern-measure.mjs).
// Two different quantities, so the -1.9795% the gate printed was not a
// disagreement about one number, it was a wrong verdict about two. Measured
// EU38: flat 743.5050 vs pattern 728.7870.
//
// The line itself is not invented: the shell's own section is
// c(phi) = (a cos phi, bm sin phi + bd sin^2 phi) offset outward by d, so the
// centre front of the garment is phi = +pi/2 and the centre back phi = -pi/2 —
// the same convention surfacepattern.cpp cuts its front/back panels on. The arc
// is the plain integral of |d/dh at(h, phi)| between the same two heights the
// height difference used, and NO correction factor, offset or calibration
// constant is applied to it anywhere.
//
// The step is 0.05mm because that is the step tools/pattern-measure.mjs
// integrates its cubics at; one ruler for both sides, so a difference cannot be
// the sampling. (V3-B measured the pattern side unchanged to four decimals at
// 0.25 / 0.05 / 0.01mm, so the number is the curve's, not the ruler's.)
constexpr double kArcStepMM = 0.05;

double centreLineArc(const GarmentSurf& s, double topZ, double botZ, bool front) {
    if (topZ - botZ <= 1e-9) return 0.0;
    const double phi = front ? 0.5 * kPi : -0.5 * kPi;
    const int n = std::max(2, static_cast<int>(std::ceil((topZ - botZ) / kArcStepMM)));
    double L = 0.0;
    Vec3 prev = s.at(topZ, phi);
    for (int i = 1; i <= n; ++i) {
        const Vec3 cur = s.at(topZ - (topZ - botZ) * i / n, phi);
        L += std::sqrt((cur.x - prev.x) * (cur.x - prev.x) + (cur.y - prev.y) * (cur.y - prev.y) +
                       (cur.z - prev.z) * (cur.z - prev.z));
        prev = cur;
    }
    return L;
}

double polylineLen(const std::vector<Vec2>& p, int a, int b) {
    double L = 0.0;
    for (int i = a; i < b; ++i) L += std::hypot(p[i + 1].x - p[i].x, p[i + 1].y - p[i].y);
    return L;
}

ShellProjection project(const GarmentSurf& surf, bool front) {
    ShellProjection out;
    out.front = front;
    const double sgn = front ? 1.0 : -1.0;

    const GarmentSurf::Ring& neck = ringNamed(surf, "neck");
    const GarmentSurf::Ring& shoulder = ringNamed(surf, "shoulder");
    const GarmentSurf::Ring& bust = ringNamed(surf, "bust");
    const GarmentSurf::Ring& waist = ringNamed(surf, "waist");
    const GarmentSurf::Ring& hip = ringNamed(surf, "hip");
    // The hem is not one of the five body rings — it is where the SHELL stops
    // (GarmentSurf::hemH, set by the A-line sweep). With the sweep off there is
    // no hem ring and the shell's bottom is the hip, which is what a straight
    // sheath is; reported as such rather than invented.
    const bool hasHem = surf.hemScale > 0.0 && surf.hemH > 0.0;
    const double hemZ = hasHem ? surf.hemH : hip.h;

    // ---- THE OUTLINE: shoulder ring down to the hem ----
    //
    // It starts at the SHOULDER ring and not at the neck ring on purpose. Above
    // the shoulder there is no garment: where the cloth actually stops is the
    // top boundary (TopProfile), which is a cut, not a section. Drawing the
    // shell up to the neck ring would draw a silhouette taller than the dress.
    struct Run { const char* name; double top, bot; };
    const Run runs[4] = {
        {"shoulder->bust", shoulder.h, bust.h},
        {"bust->waist", bust.h, waist.h},
        {"waist->hip", waist.h, hip.h},
        {hasHem ? "hip->hem" : "hip->hip", hip.h, hemZ},
    };
    out.topZMM = shoulder.h;
    out.bottomZMM = hemZ;

    for (const Run& r : runs) {
        if (r.top - r.bot <= 1e-9) continue;
        const int n = std::max(2, static_cast<int>(std::ceil((r.top - r.bot) / kSampleStepMM)));
        std::vector<Vec2> pts;
        pts.reserve(n + 1);
        for (int i = 0; i <= n; ++i) {
            const double h = r.top - (r.top - r.bot) * i / n;
            pts.push_back({sgn * halfWidthAt(surf, h), h});
        }
        ShellSpan sp;
        sp.name = r.name;
        sp.firstPt = static_cast<int>(out.outline.size());
        sp.firstSeg = static_cast<int>(out.segs.size());
        // The repo's existing Schneider fit. No new smoothing: the run comes back
        // guaranteed inside kFitTolMM of the sampled silhouette, everywhere.
        const std::vector<CubicSeg> segs = fitCubics(pts, kFitTolMM);
        for (const CubicSeg& s : segs) {
            out.segs.push_back(s);
            out.segSpan.push_back(r.name);
            sp.fitLenMM += cubicLength(s);
        }
        sp.segCount = static_cast<int>(segs.size());
        sp.polyLenMM = polylineLen(pts, 0, static_cast<int>(pts.size()) - 1);
        // HALF-OPEN ON THE WRITE SIDE. Consecutive runs share a boundary height
        // (bust.h ends one run and starts the next), so writing every run closed
        // put that one point into the chain TWICE and left a zero-length segment
        // at each of the three interior ring heights (6 across front+back,
        // measured by tests/flat_artifact_census.mjs). The run is still SAMPLED
        // closed — fitCubics needs both endpoints, and the fitted chain, the
        // span lengths and the drawn geometry are unchanged. Only the duplicate
        // write is dropped: the shared point is written once, by the run that
        // reached it first, and the next run's firstPt names that same index.
        // No point is moved, none is removed, nothing is smoothed.
        size_t i0 = 0;
        if (!out.outline.empty()) {
            const Vec2& prev = out.outline.back();
            if (std::fabs(prev.x - pts[0].x) <= 1e-9 && std::fabs(prev.y - pts[0].y) <= 1e-9) {
                i0 = 1;
                sp.firstPt = static_cast<int>(out.outline.size()) - 1;
            }
        }
        for (size_t i = i0; i < pts.size(); ++i) {
            out.outline.push_back(pts[i]);
            out.ptSpan.push_back(r.name);
        }
        sp.lastPt = static_cast<int>(out.outline.size()) - 1;
        out.spans.push_back(sp);
    }

    // ---- THE SIX MEASURES ----
    out.measures.push_back({"hem_circumference", hasHem ? "hem" : "hip",
                            girthAt(surf, hemZ)});
    out.measures.push_back({"bust_circumference", bust.name, girthAt(surf, bust.h)});
    out.measures.push_back({"waist_circumference", waist.name, girthAt(surf, waist.h)});
    const std::string down = "shoulder->" + std::string(hasHem ? "hem" : "hip");
    out.measures.push_back({"body_length", down, centreLineArc(surf, shoulder.h, hemZ, front)});
    out.measures.push_back({"neck_opening_width", neck.name, 2.0 * halfWidthAt(surf, neck.h)});
    out.measures.push_back({"shoulder_width", shoulder.name,
                            2.0 * halfWidthAt(surf, shoulder.h)});
    // NOT DELETED, MOVED OUT OF THE GATE. The vertical drop is a real and useful
    // number — it is what a size chart calls a garment length — but it is not the
    // quantity the pattern side can produce, so it is reported under its own name
    // and no gate compares it to a length along the cloth.
    out.measures.push_back({"body_height_projected", down, shoulder.h - hemZ});
    return out;
}

}  // namespace

ShellProjection projectFront(const GarmentSurf& surf) { return project(surf, true); }
ShellProjection projectBack(const GarmentSurf& surf) { return project(surf, false); }

}  // namespace stitchu
