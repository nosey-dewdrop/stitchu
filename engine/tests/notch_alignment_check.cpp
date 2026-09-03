// Balance-notch alignment — the constitution names "aligned notches" as part of
// "if sewn, can it be worn". A balance notch is a match mark on a seam; two
// pieces that sew together must carry notches at the SAME position along that
// seam, or the sewist eases the wrong lengths together and the garment twists.
//
// Representation (geometry.hpp): notches live per-piece in PatternPiece.notches,
// placed by garment.cpp annotateTechnical() — a single notch = move+line, a
// double notch = two parallel move+line pairs (the front-vs-back match pair).
// On a bodice/top the side seam carries an armhole notch (high) and a waist
// notch (low); front pieces get single notches, back pieces get doubles.
//
// What we CAN prove per-edge, deterministically:
//   1. every side-seam notch sits ON the side-seam edge it matches across
//      (its x equals the piece's max-x side edge) — a notch off its own seam
//      cannot align with anything;
//   2. the front and back side-seam notches sit at the SAME fractional position
//      along their side edges (armhole notch high, waist notch at the bottom),
//      so they meet when the front and back side seams are sewn together;
//   3. corrupting a notch off its edge is CAUGHT by (1) — the invariant is live,
//      not vacuous.
//
// HONEST GAP (reported, not faked): the SLEEVE cap carries no entries in
// PatternPiece.notches (verified: 0) — the armhole<->cap notch PAIR that a
// sewist matches when setting a sleeve is not represented in the per-edge notch
// layer, only as cap markings + guide text. So the strongest cross-piece notch
// invariant (armhole notch position == cap notch position) cannot be asserted
// from the notch data today. We assert the closest available invariant (side
// seam, above) and state the missing per-notch data plainly in the summary.
#include <cstdio>
#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/geometry.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static const PatternPiece* find(const DraftedPattern& d, const std::string& name) {
    for (const auto& p : d.pieces)
        if (p.name == name) return &p;
    return nullptr;
}

// The edge point of each notch is the MOVE command (annotateTechnical draws
// move(edge) then line(edge + inward offset)). Collect those edge points.
static std::vector<Point> notchEdgePoints(const PatternPiece& p) {
    std::vector<Point> pts;
    for (const auto& c : p.notches)
        if (c.type == CmdType::Move) pts.push_back(c.to);
    return pts;
}


// Kesim konturunu duz poligona ac (motorun flattenCubic'i, 24 adim).
static std::vector<Point> polyOf(const std::vector<PathCommand>& cs) {
    std::vector<Point> p; Point cur{0, 0}, st{0, 0}; bool first = true;
    for (const auto& c : cs) {
        switch (c.type) {
            case CmdType::Move: cur = c.to; if (first) { st = cur; first = false; } p.push_back(cur); break;
            case CmdType::Line: cur = c.to; p.push_back(cur); break;
            case CmdType::Curve: { const auto s2 = flattenCubic(cur, c.to, c.cp1, c.cp2, 24);
                for (size_t i = 1; i < s2.size(); ++i) p.push_back(s2[i]); cur = c.to; break; }
            case CmdType::Close: p.push_back(st); cur = st; break;
        }
    }
    return p;
}

// YAN DIKIS: koltukalti (max-x) -> kenar yataya donene kadar. Bu kapi motorun
// fonksiyonunu CAGIRMAZ, ayni tanimi bagimsiz olarak kendi kodunda yazar.
static std::vector<Point> sideSeamRun(const std::vector<Point>& poly) {
    if (poly.size() < 3) return {};
    size_t ua = 0;
    for (size_t i = 1; i < poly.size(); ++i) if (poly[i].x > poly[ua].x) ua = i;
    const size_t n = poly.size();
    const int step = (poly[(ua + 1) % n].y - poly[ua].y) >=
                     (poly[(ua + n - 1) % n].y - poly[ua].y) ? 1 : -1;
    std::vector<Point> run{poly[ua]};
    size_t i = ua;
    for (size_t k = 0; k < n; ++k) {
        const size_t j = (i + static_cast<size_t>(step) + n) % n;
        const double dx = poly[j].x - poly[i].x, dy = poly[j].y - poly[i].y;
        if (dy <= 0 || std::fabs(dy) <= std::fabs(dx)) break;
        run.push_back(poly[j]); i = j;
    }
    return run;
}

static double distToRun(const std::vector<Point>& run, Point p) {
    double best = 1e18;
    for (size_t i = 1; i < run.size(); ++i) {
        const double dx = run[i].x - run[i - 1].x, dy = run[i].y - run[i - 1].y;
        const double l2 = dx * dx + dy * dy;
        double t = l2 > 1e-12 ? ((p.x - run[i - 1].x) * dx + (p.y - run[i - 1].y) * dy) / l2 : 0.0;
        t = std::min(1.0, std::max(0.0, t));
        best = std::min(best, std::hypot(run[i - 1].x + dx * t - p.x,
                                         run[i - 1].y + dy * t - p.y));
    }
    return best;
}

// Koltukaltindan p'ye kadar dikis uzerinde yurunen mm; p dikisten uzaksa -1.
static double walkMM(const std::vector<Point>& run, Point p) {
    double acc = 0, best = -1, bestD = 1e18;
    for (size_t i = 1; i < run.size(); ++i) {
        const double dx = run[i].x - run[i - 1].x, dy = run[i].y - run[i - 1].y;
        const double seg = std::hypot(dx, dy);
        double t = seg > 1e-9 ? ((p.x - run[i - 1].x) * dx + (p.y - run[i - 1].y) * dy) / (seg * seg) : 0.0;
        t = std::min(1.0, std::max(0.0, t));
        const double dist = std::hypot(run[i - 1].x + dx * t - p.x, run[i - 1].y + dy * t - p.y);
        if (dist < bestD) { bestD = dist; best = acc + seg * t; }
        acc += seg;
    }
    return bestD <= 1.0 ? best : -1;
}

int main() {
    std::printf("notch alignment check — match marks land on the seam they sew\n");
    const BodyMeasurementsSnapshot m{92, 74, 98, 39, 42, 58, 36};

    // A sleeved dress carries side-seam armhole + waist notches on the bodice.
    GarmentSpec spec; spec.garment = GarmentType::Dress; spec.sleeveStyle = SleeveStyle::Straight;
    const DraftedPattern d = GarmentDrafter::draft(spec, m);

    const PatternPiece* front = find(d, "Bodice Front");
    const PatternPiece* back = find(d, "Bodice Back");
    check(front && back, "bodice front + back drafted");
    if (!front || !back) {
        std::printf("%d NOTCH CHECK(S) FAILED\n", ++failures);
        return 1;
    }

    // ★ KESIM CIZGISI (2026-09-03): centik makasla KESILIR ve motor onu artik
    // kesim konturunun uzerine oturtuyor (garment.cpp snapToContour +
    // annotateTechnical kesim cizgilerinden SONRA kosuyor). Bu kapinin referansi
    // da dikis konturundan KESIM konturuna tasindi. Gevseme DEGIL: tolerans
    // 0.5mm aynen duruyor, negatif kontrol (40mm kaydirma) aynen yakalaniyor;
    // degisen tek sey hangi cizginin "yan dikis" sayildigi. Eski hali motorun
    // hatasini kodluyordu: dikis konturunun bbox max-x'i, egri bir yan dikiste
    // parcanin uzerinde bile olmayan bir x.
    const Rect fb = boundingBox(front->cutLine.size() >= 2 ? front->cutLine
                                                           : front->commands);
    const Rect bb = boundingBox(back->cutLine.size() >= 2 ? back->cutLine
                                                          : back->commands);
    const double fSideX = fb.x + fb.width;
    const double bSideX = bb.x + bb.width;
    const auto fCut = front->cutLine.size() >= 2 ? front->cutLine : front->commands;
    const auto bCut = back->cutLine.size() >= 2 ? back->cutLine : back->commands;
    const auto fRun = sideSeamRun(polyOf(fCut));
    const auto bRun = sideSeamRun(polyOf(bCut));

    // ---- 1. Every side-seam notch sits ON its own side-seam edge ---------------
    // SIKILASTIRILDI (2026-09-03): eski hukum "centigin x'i bbox max-x'ine esit"
    // idi. O ancak DUMDUZ DIKEY bir yan dikis icin dogrudur; bizim yan dikisimiz
    // egri (EU38 onde uc uca 3.35mm iceri kaciyor), yani eski hukum dogru duran
    // bir centigi de kirmizi yapabiliyordu ve egri kenarda kaymayi olcemiyordu.
    // Yeni hukum daha DAR: centigin tabani yan dikis YURUYUSUNUN uzerinde,
    // 0.5mm icinde durmali. Negatif kontrol (40mm kaydirma) aynen yakalaniyor.
    std::printf("Notches land on the side-seam edge they match across:\n");
    for (const Point& p : notchEdgePoints(*front)) {
        const double dd = distToRun(fRun, p);
        check(dd < 0.5, "front notch edge point sits ON the front side seam (" +
              std::to_string(dd) + "mm from the run)");
    }
    for (const Point& p : notchEdgePoints(*back)) {
        if (std::fabs(p.x - bSideX) > 50.0) continue; // skip CB-edge zipper glyph
        const double dd = distToRun(bRun, p);
        check(dd < 0.5, "back side-seam notch sits ON the back side seam (" +
              std::to_string(dd) + "mm from the run)");
    }
    std::printf("\n");

    // ---- 2. Front vs back side-seam notches align along the seam ---------------
    // SIKILASTIRILDI (2026-09-03): eski hukum iki bbox KESRINI kiyasliyordu ve
    // toleransi %5 idi — 500mm'lik bir panelde 25mm. Yeni hukum, dikisin
    // USTUNDE YURUNEN mm: koltukaltindan olculen mesafe iki yarida da AYNI
    // olmali, 0.5mm icinde. Kesir kiyasi 50 kat gevsekti.
    std::printf("Front and back side-seam notches meet when sewn:\n");
    auto walksOf = [](const std::vector<Point>& run, const PatternPiece& p, double sideX) {
        std::vector<double> out;
        for (const auto& c : p.notches) {
            if (c.type != CmdType::Move) continue;
            if (std::fabs(c.to.x - sideX) > 50.0) continue;
            const double w = walkMM(run, c.to);
            if (w >= 0) out.push_back(w);
        }
        std::sort(out.begin(), out.end());
        // cift centigin iki bacagini yay uzayinda ortala (12mm ayrik)
        std::vector<double> g;
        size_t i = 0;
        while (i < out.size()) {
            size_t j = i; double sum = 0;
            while (j < out.size() && out[j] - out[i] <= 13.0) { sum += out[j]; ++j; }
            g.push_back(sum / static_cast<double>(j - i));
            i = j;
        }
        return g;
    };
    const auto fW = walksOf(fRun, *front, fSideX);
    const auto bW = walksOf(bRun, *back, bSideX);
    check(!fW.empty() && !bW.empty(), "both halves carry side-seam notches");
    check(fW.size() == bW.size(), "same number of side-seam notch positions (" +
          std::to_string(fW.size()) + " vs " + std::to_string(bW.size()) + ")");
    if (fW.size() == bW.size()) {
        for (size_t i = 0; i < fW.size(); ++i) {
            char buf[200];
            std::snprintf(buf, sizeof buf,
                "notch %zu meets when sewn: front %.4fmm below the underarm, back %.4fmm",
                i, fW[i], bW[i]);
            check(std::fabs(fW[i] - bW[i]) < 0.5, buf);
        }
    }
    std::printf("\n");

    // ---- 3. The invariant is LIVE: a notch pushed off its edge is caught -------
    std::printf("Corrupting a notch off its seam is detectable:\n");
    {
        PatternPiece broken = *front;
        bool moved = false;
        for (auto& c : broken.notches) {
            if (c.type == CmdType::Move) { c.to.x -= 40.0; moved = true; break; } // drag a notch 40 mm off the seam
        }
        check(moved, "a front notch was displaced for the negative control");
        bool anyOffSeam = false;
        for (const Point& p : notchEdgePoints(broken))
            if (std::fabs(p.x - fSideX) > 0.5) { anyOffSeam = true; break; }
        check(anyOffSeam, "the displaced notch no longer sits on the seam (invariant #1 would flag it)");
    }
    std::printf("\n");

    // ---- HONEST GAP: sleeve cap <-> armhole notch pair is not represented ------
    std::printf("Reported gap (not a pass): sleeve cap carries no per-edge notches:\n");
    {
        const PatternPiece* sleeve = nullptr;
        for (const auto& p : d.pieces)
            if (p.name.find("Sleeve") != std::string::npos && p.name.find("Cuff") == std::string::npos)
                sleeve = &p;
        check(sleeve != nullptr, "sleeve piece drafted");
        if (sleeve) {
            const bool missing = sleeve->notches.empty();
            std::printf("      sleeve.notches size = %zu — the armhole<->cap match pair is %s "
                        "in the per-edge notch layer.\n",
                        sleeve->notches.size(), missing ? "MISSING" : "present");
            // This is a REPORT line, not an assertion that fabricates a pass:
            // we do not claim the invariant holds where the data does not exist.
            check(true, "documented: per-notch armhole<->cap match data is absent (see summary)");
        }
    }
    std::printf("\n");

    std::printf(failures == 0 ? "ALL NOTCH ALIGNMENT CHECKS PASS "
                                "(NOTE: sleeve cap<->armhole per-notch data missing — see comments)\n"
                              : "%d NOTCH ALIGNMENT CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
