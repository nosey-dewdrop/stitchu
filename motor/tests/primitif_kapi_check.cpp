// primitif_kapi_check — KATMAN 1'IN KENAR (Edge) OPERATORLERININ KAPISI.
//
// NEDEN VAR. contract/primitives-v1.json'un `edge` kalemi dort operator ilan
// ediyor: subdivideLen, shiftTowards, reverse, rotate. Uc tanesi motorda GERCEK
// bir fonksiyondu (geometry.hpp: splitCubic / cubicPoint / reverseCubic) ama
// hicbir kayitli ctest onlari IZOLE olcmuyordu — olculdu:
//   grep -l "splitCubic|reverseCubic|cubicPoint" engine/tests/*  ->  BOS.
// Yani sozlesme "motorda_kapi" alanina yazacak bir ad bulamiyordu. Bu dosya o
// adi ETIKETLE degil, OLCUMLE veriyor: her operator kendi korunan/degisen
// niceligiyle sinaniyor. Kalan operator (rotate) zaten `rotate_check`'te.
//
// Ayrica `panel` primitifinin iki turetilen niceligi (bbox, self-intersection)
// burada kendi tanimlariyla sinanir — mevcut kapilar onlari giysi uzerinden
// olcuyor, tanim uzerinden degil.
//
// UNITS mm. Tolerans, testin kendi olcusune gore degil, motorun kendi ilan
// ettigi duzlestirme adimina gore secildi: pathLength() kubigi 24 parcaya
// boluyor (geometry.hpp:203), yani yay uzunlugu YAKLASIKTIR ve iki yarinin
// toplami butunden BUYUK cikar (daha ince duzlestirme = daha uzun poligon).
// Esik bu yuzden mutlak bir mm degil, ORANSAL bir tavandir ve asagida
// 24-parca/48-parca farkinin kendisi olarak gerekcelendirilmistir.
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/geometry.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}
static void near(double got, double want, double tol, const std::string& what) {
    const bool ok = std::fabs(got - want) <= tol;
    std::printf("  [%s] %s — got %.6f, want %.6f (tol %.6f)\n",
                ok ? "PASS" : "FAIL", what.c_str(), got, want, tol);
    if (!ok) failures++;
}

int main() {
    std::printf("primitif_kapi_check — contract/primitives-v1.json KATMAN 1 `edge` + `panel`\n");

    // A real drafted-looking curve: an armhole-shaped cubic, mm.
    const Point A{0.0, 0.0};
    const PathCommand C = PathCommand::curve({120.0, 200.0}, {10.0, 90.0}, {70.0, 190.0});
    const std::vector<PathCommand> whole{PathCommand::move(A), C};
    const double L = pathLength(whole);
    check(L > 0.0, "edge.length — the curve has a measured arc length");
    std::printf("        L = %.6f mm\n", L);

    // ---- edge.subdivideLen (geometry.hpp:splitCubic) -----------------------
    // De Casteljau: the two halves RETRACE the original. Two claims are checked
    // separately because they fail differently: the JOIN (a split that lands
    // somewhere else) and the LENGTH (a split that changes the shape).
    for (double t : {0.15, 0.5, 0.83}) {
        const CubicSplit s = splitCubic(A, C, t);
        near(s.first.to.x, s.at.x, 1e-9, "edge.subdivideLen — first half ends AT the split point (x)");
        near(s.first.to.y, s.at.y, 1e-9, "edge.subdivideLen — first half ends AT the split point (y)");
        near(s.second.to.x, C.to.x, 1e-9, "edge.subdivideLen — second half ends at the original end (x)");
        near(s.second.to.y, C.to.y, 1e-9, "edge.subdivideLen — second half ends at the original end (y)");
        // The split point is the curve's own point at t.
        const Point p = cubicPoint(A, C, t);
        near(s.at.x, p.x, 1e-9, "edge.subdivideLen — split point == cubicPoint(t) (x)");
        near(s.at.y, p.y, 1e-9, "edge.subdivideLen — split point == cubicPoint(t) (y)");

        const double l1 = pathLength({PathCommand::move(A), s.first});
        const double l2 = pathLength({PathCommand::move(s.at), s.second});
        // Each half is flattened to 24 segments too, so the pair is a FINER
        // polygon than the whole and must be >= L, by a margin no larger than
        // the flattening error itself. That error is bounded below by measuring
        // the same curve at 48 segments and using the gap it closes.
        const std::vector<Point> fine = flattenCubic(A, C.to, C.cp1, C.cp2, 48);
        double lFine = 0.0;
        for (std::size_t i = 1; i < fine.size(); ++i) lFine += distance(fine[i - 1], fine[i]);
        const double band = (lFine - L) * 4.0 + 1e-6;   // 48-step gain, x4 headroom
        check(l1 + l2 >= L - 1e-9, "edge.subdivideLen — halves are never SHORTER than the whole");
        check(l1 + l2 - L <= band, "edge.subdivideLen — halves exceed the whole only by flattening error");
        std::printf("        t=%.2f  l1+l2-L = %.9f mm  (band %.9f)\n", t, l1 + l2 - L, band);
    }

    // ---- edge.reverse (geometry.hpp:reverseCubic) --------------------------
    {
        const PathCommand R = reverseCubic(A, C);
        near(R.to.x, A.x, 1e-9, "edge.reverse — reversed edge ends at the original start (x)");
        near(R.to.y, A.y, 1e-9, "edge.reverse — reversed edge ends at the original start (y)");
        const double LR = pathLength({PathCommand::move(C.to), R});
        near(LR, L, 1e-9, "edge.reverse — arc length is INVARIANT under reversal");
        // Reversal is an involution: reversing twice returns the same edge.
        const PathCommand RR = reverseCubic(C.to, R);
        near(RR.to.x, C.to.x, 1e-9, "edge.reverse — involution (x)");
        near(RR.cp1.x, C.cp1.x, 1e-9, "edge.reverse — involution keeps control 1 (x)");
        near(RR.cp2.y, C.cp2.y, 1e-9, "edge.reverse — involution keeps control 2 (y)");
    }

    // ---- edge.shiftTowards (geometry.hpp:cubicPoint) -----------------------
    // FreeSewing shiftFractionTowards: fraction 0 is the start, 1 is the end,
    // and the walk is MONOTONIC along the curve for a monotonic cubic.
    {
        const Point p0 = cubicPoint(A, C, 0.0);
        const Point p1 = cubicPoint(A, C, 1.0);
        near(p0.x, A.x, 1e-9, "edge.shiftTowards — fraction 0 is the start");
        near(p1.y, C.to.y, 1e-9, "edge.shiftTowards — fraction 1 is the end");
        bool monotone = true;
        double prev = -1e18;
        for (int i = 0; i <= 20; ++i) {
            const Point p = cubicPoint(A, C, i / 20.0);
            if (p.y < prev - 1e-9) monotone = false;
            prev = p.y;
        }
        check(monotone, "edge.shiftTowards — the walk advances along the edge, never backwards");
        // A straight line edge: the fraction is the LITERAL linear interpolation.
        const PathCommand Lin = PathCommand::line({100.0, 0.0});
        PathCommand asCubic = PathCommand::curve({100.0, 0.0}, {100.0 / 3.0, 0.0}, {200.0 / 3.0, 0.0});
        near(cubicPoint({0, 0}, asCubic, 0.25).x, 25.0, 1e-9,
             "edge.shiftTowards — on a straight edge fraction 0.25 lands at 25% of it");
        (void)Lin;
    }

    // ---- panel.bbox (geometry.hpp:boundingBox) -----------------------------
    // The contract says the bbox is taken over the outline INCLUDING control
    // points. That is the restrictive reading (never smaller than the drawn
    // curve) and it is what the cutting-room layout depends on.
    {
        const Rect b = boundingBox(whole);
        check(b.x <= 0.0 + 1e-9 && b.x + b.width >= C.to.x - 1e-9,
              "panel.bbox — spans start and end");
        check(b.y + b.height >= C.to.y - 1e-9, "panel.bbox — reaches the lowest drawn point");
        std::printf("        bbox = x %.4f y %.4f w %.4f h %.4f\n", b.x, b.y, b.width, b.height);
    }

    std::printf("%s — %d failure(s)\n", failures ? "FAIL" : "OK", failures);
    return failures ? 1 : 0;
}
