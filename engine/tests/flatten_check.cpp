// flatten_check: the C++ ARAP port is held to the SAME analytic certification
// gates as flatten-research/15-arap-proper.py (Faz C / G1). The Python file is
// the proof of record; if this test and that script ever disagree, the port is
// wrong, not the proof.
//
//   G1a CONE FRUSTUM (K=0, developable): full band with one generator cut →
//       max strain < 0.1% AND the unrolled sector angle within ±0.05° of the
//       analytic value (dart = 0: the material angle survives whole).
//   G1b SPHERE CALOTTE, 12 GORES (a=70, h=28, the research-02 experiment):
//       dart total within ±1° of the analytic develop-deficit 2π(1−sinθ/θ),
//       max strain ≤ 0.5% (the garment gate).
#include <array>
#include <cmath>
#include <cstdio>
#include <map>
#include <vector>

#include "../src/flatten.hpp"

using namespace stitchu;

namespace {

constexpr double kPi = 3.14159265358979323846;
int failures = 0;

void gate(const char* label, double got, double bound, bool ok) {
    if (!ok) ++failures;
    std::printf("  %-24s %12.6f  (kapı %g)  %s\n", label, got, bound, ok ? "ok" : "FAIL");
}

double polyLen2(const std::vector<Vec2>& pts) {
    double s = 0.0;
    for (size_t i = 1; i < pts.size(); ++i) s += std::hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    return s;
}

}  // namespace

int main() {
    // ---------------------------------------------------------- G1a cone
    std::printf("== G1a KONİ FRUSTUM ==\n");
    const double r0 = 40.0, r1 = 80.0, h = 60.0;
    const double slant = std::hypot(r1 - r0, h);
    const double s0 = r0 * slant / (r1 - r0);  // apex → top ring, slant distance
    const int nu = 24, nv = 96;
    TriMesh cone;
    for (int i = 0; i <= nu; ++i)
        for (int j = 0; j <= nv; ++j) {
            const double r = r0 + (r1 - r0) * i / nu;
            const double th = 2 * kPi * j / nv;  // j=0 and j=nv are SEPARATE vertices ⇒ cut band
            cone.V.push_back({r * std::cos(th), r * std::sin(th), h * i / nu});
        }
    for (int i = 0; i < nu; ++i)
        for (int j = 0; j < nv; ++j) {
            const int k = i * (nv + 1) + j;
            cone.F.push_back({k, k + nv + 1, k + 1});
            cone.F.push_back({k + 1, k + nv + 1, k + nv + 2});
        }
    std::vector<Vec2> P0(cone.V.size());
    for (int i = 0; i <= nu; ++i) {
        const double s = s0 + (slant / nu) * i;
        const double r = r0 + (r1 - r0) * i / nu;
        const double arc = 2 * kPi * r / nv;
        for (int j = 0; j <= nv; ++j) {
            const double th = (j - nv / 2.0) * arc / std::max(s, 1e-9);
            P0[i * (nv + 1) + j] = {s * std::cos(th), s * std::sin(th)};
        }
    }
    std::vector<Vec2> P = arapFlatten(cone, P0, 0, 40);
    const double st = maxStrain(cone, P);
    const Vec2 v0 = P[nu * (nv + 1)], v1 = P[nu * (nv + 1) + nv];
    const double ang = std::fabs(std::atan2(v0.y, v0.x) - std::atan2(v1.y, v1.x)) * 180.0 / kPi;
    const double analytic = (2 * kPi * r1 / (s0 + slant)) * 180.0 / kPi;
    std::printf("  sektör %0.3f°  analitik %0.3f°\n", ang, analytic);
    gate("max strain %", st * 100, 0.1, st < 0.001);
    gate("sektör sapması °", std::fabs(ang - analytic), 0.05, std::fabs(ang - analytic) <= 0.05);

    // ---------------------------------------------------------- G1b calotte
    std::printf("== G1b KÜRE KALOTU 12 DİLİM ==\n");
    const double a = 70.0, hh = 28.0;
    const double R = (a * a + hh * hh) / (2 * hh);
    const double TH = std::asin(a / R);
    const double deficit = (2 * kPi * (1 - std::sin(TH) / TH)) * 180.0 / kPi;
    const int K = 12, Ncap = 28, cols = 6;  // cols = max(3, 72/K)
    double material = 0.0, worst = 0.0;
    for (int k = 0; k < K; ++k) {
        const double p0 = 2 * kPi * k / K, p1 = 2 * kPi * (k + 1) / K;
        auto cap = [&](double u, double v) -> Vec3 {
            const double phi = TH * u, psi = p0 + (p1 - p0) * v;
            return {R * std::sin(phi) * std::cos(psi), R * std::sin(phi) * std::sin(psi), R * std::cos(phi)};
        };
        // apex is a SINGLE vertex (zero-length grid edges gave inf strain once)
        TriMesh g;
        g.V.push_back(cap(0, 0));
        std::map<std::pair<int, int>, int> idx;
        for (int i = 1; i <= Ncap; ++i)
            for (int j = 0; j <= cols; ++j) {
                idx[{i, j}] = static_cast<int>(g.V.size());
                g.V.push_back(cap(static_cast<double>(i) / Ncap, static_cast<double>(j) / cols));
            }
        for (int j = 0; j < cols; ++j) g.F.push_back({0, idx[{1, j}], idx[{1, j + 1}]});
        for (int i = 1; i < Ncap; ++i)
            for (int j = 0; j < cols; ++j) {
                g.F.push_back({idx[{i, j}], idx[{i + 1, j}], idx[{i, j + 1}]});
                g.F.push_back({idx[{i, j + 1}], idx[{i + 1, j}], idx[{i + 1, j + 1}]});
            }
        std::vector<Vec2> Q0(g.V.size());
        for (int i = 1; i <= Ncap; ++i) {
            const double s = R * TH * i / Ncap;
            const Vec3 d = cap(static_cast<double>(i) / Ncap, 0.0) - cap(static_cast<double>(i) / Ncap, 1.0 / cols);
            const double arc = std::sqrt(dot(d, d));
            for (int j = 0; j <= cols; ++j) {
                const double th = (j - cols / 2.0) * arc / s;
                Q0[idx[{i, j}]] = {s * std::cos(th), s * std::sin(th)};
            }
        }
        std::vector<Vec2> Q = arapFlatten(g, Q0, 0, 40);
        strainPolish(g, Q, 0);
        worst = std::max(worst, maxStrain(g, Q));
        const Vec2 w0 = Q[idx[{Ncap, 0}]], w1 = Q[idx[{Ncap, cols}]];
        double sp = std::atan2(w1.y, w1.x) - std::atan2(w0.y, w0.x);
        sp = std::fmod(sp + kPi, 2 * kPi);
        if (sp < 0) sp += 2 * kPi;  // python's % is non-negative; fmod is not
        material += std::fabs(sp - kPi);
    }
    const double dartTotal = 360.0 - material * 180.0 / kPi;
    std::printf("  pens toplamı %0.2f°  develop-deficit %0.2f°\n", dartTotal, deficit);
    gate("pens sapması °", std::fabs(dartTotal - deficit), 1.0, std::fabs(dartTotal - deficit) <= 1.0);
    gate("max strain %", worst * 100, 0.5, worst <= 0.005);

    if (failures) {
        std::printf("flatten_check FAIL (%d)\n", failures);
        return 1;
    }
    std::printf("flatten_check OK: C++ ARAP portu Python-15 sertifika kapılarını geçti\n");
    return 0;
}
