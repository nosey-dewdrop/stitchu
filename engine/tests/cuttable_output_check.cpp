// cuttable_output_check — "bu çıktı MAKASA gidebilir mi?"
//
// knowledge/TEKNOLOJI-2026-08-23.md:368-383 altı malzemeyi sayıyor ve şunu
// diyor: bunlar olmadan çıktı KESİLEMEZ. Bu kapı o cümleyi bir dosya değil bir
// koşu hâline getirir: EU38 Locket çıktısında kesim için gereken üç işaretin
// GEOMETRİ olarak var olduğunu ve çentiklerin eşleştiğini ölçer.
//
// Ölçülen dört iddia (hepsi eşiksiz ya da YAYINLANMIŞ eşikle):
//   1. DİKİŞ PAYI (FreeSewing `sa`, ASTM katman 1 vs 14): her kesilen parçanın
//      cutLine'ı DOLU, dikiş çizgisinin HER köşesi kesim poligonunun İÇİNDE ve
//      kesim çevresi dikiş çevresinden UZUN. Eşik yok — topolojik iddia.
//   2. GRAIN LINE (ASTM katman 7, FreeSewing `grainline`): her parça bir yön
//      oku taşır ve okun boyu sıfır değil. Yönsüz parça kumaşa yatırılamaz.
//   3. CUT-ON-FOLD (ASTM katman 6 mirror line): kesim notu "on fold" diyen her
//      parçanın x=0'da ÇİZİLİ bir kat çizgisi var (foldLine), ve "on fold"
//      DEMEYEN parçanın kat çizgisi YOK (uydurma yok, iki yönlü iddia).
//   4. ÇENTİK EŞLEŞMESİ (ASTM katman 4, "walk pieces"): Front Body ve Back Body
//      yan dikiş çentikleri kendi yan kenarları üzerinde ve AYNI kesirsel
//      konumda. Eşik = 0.79375mm (1/32"), reponun ilan ettiği üretim standardı
//      (CLAUDE.md) — motorun kendi çıktısından türetilmedi.
//
// ANTI-HACK: yeşilden sonra aynı kalıbın KOPYASI dört ayrı şekilde bozulur
// (cutLine sil · grainline sil · foldLine sil · çentiği kenarından kaydır) ve
// kapının her seferinde KIRMIZI düştüğü loglanır. Bozulunca düşmeyen bir kapı
// vakumdur; burada vakum olmadığı çalıştırma çıktısıyla duruyor.
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/collar.hpp"
#include "../src/garment.hpp"
#include "../src/geometry.hpp"
#include "../src/locket.hpp"
#include "../src/sizechart.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

// ---------------------------------------------------------------- fixtures

// The Bugra Locket spec (same six-piece top locket_check drafts), drafted on the
// EU38 standard body from the K1 size chart (contract/tables.json).
static GarmentSpec locketSpec() {
    GarmentSpec s;
    s.garment = GarmentType::Top;
    s.shaping = Shaping::Dart;
    s.neckline = Neckline::Crew;
    s.sleeveStyle = SleeveStyle::Straight;
    s.sleeveLength = SleeveLength::Short;
    s.sleeveCap = SleeveCap::Puffed;
    s.fabric = Fabric::Woven;
    s.topLength = TopLength::Cropped;
    s.frontPlacket = true;
    s.collarType = static_cast<int>(CollarType::Crescent);
    s.locketTop = static_cast<int>(LocketTop::Bugra);
    return s;
}

static BodyMeasurementsSnapshot eu38() {
    for (const auto& e : euSizeChart())
        if (e.label == "EU38") return e.body;
    std::printf("  [FAIL] EU38 not in the size chart\n");
    failures++;
    return BodyMeasurementsSnapshot{};
}

// Strip pieces carry every allowance inside their cut note (garment.cpp), so
// they are single-line BY DESIGN and are not judged for a cutting line.
static bool isStrip(const PatternPiece& p) {
    return p.name.find("Ruffle") != std::string::npos ||
           p.name.find("Bias binding") != std::string::npos;
}

// ---------------------------------------------------------------- geometry

static std::vector<Point> flattenToPoly(const std::vector<PathCommand>& cmds) {
    std::vector<Point> pts;
    Point cur{0, 0};
    for (const auto& c : cmds) {
        switch (c.type) {
            case CmdType::Move: cur = c.to; pts.push_back(cur); break;
            case CmdType::Line: cur = c.to; pts.push_back(cur); break;
            case CmdType::Curve: {
                const auto fl = flattenCubic(cur, c.to, c.cp1, c.cp2, 24);
                pts.insert(pts.end(), fl.begin() + 1, fl.end());
                cur = c.to;
                break;
            }
            case CmdType::Close: break;
        }
    }
    while (pts.size() > 1 && distance(pts.front(), pts.back()) < 1e-6) pts.pop_back();
    return pts;
}

static double perimeter(const std::vector<Point>& poly) {
    double s = 0;
    for (size_t i = 0; i < poly.size(); ++i) s += distance(poly[i], poly[(i + 1) % poly.size()]);
    return s;
}

static bool insidePoly(const std::vector<Point>& pg, Point p) {
    bool in = false;
    for (size_t i = 0, j = pg.size() - 1; i < pg.size(); j = i++) {
        const Point& a = pg[i];
        const Point& b = pg[j];
        if ((a.y > p.y) != (b.y > p.y) &&
            p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) in = !in;
    }
    return in;
}

// Distance from a point to the nearest vertex of a polyline set — used to place
// a notch on its own edge (the same test notch_alignment_check uses per-edge).
static double maxX(const std::vector<Point>& poly) {
    double m = poly.empty() ? 0 : poly[0].x;
    for (const auto& p : poly) if (p.x > m) m = p.x;
    return m;
}

// Notch tick geometry: notches are move+line pairs. Return each tick's midpoint.
static std::vector<Point> notchPoints(const PatternPiece& p) {
    std::vector<Point> out;
    Point last{0, 0};
    bool have = false;
    for (const auto& c : p.notches) {
        if (c.type == CmdType::Move) { last = c.to; have = true; }
        else if (c.type == CmdType::Line && have) {
            out.push_back({(last.x + c.to.x) / 2, (last.y + c.to.y) / 2});
            have = false;
        }
    }
    return out;
}

// A single notch is ONE tick; a double notch is TWO ticks STRADDLING the same
// seam position (garment.cpp notch2: sepY = 12mm, so ±6mm along the seam) — the
// sewist matches the pair's middle. So the thing that must line up is the notch
// POSITION, not the tick count: sort the ticks along the seam, group ticks that
// sit closer than the 12mm double-notch separation, and return each group's
// midpoint, top to bottom.
static std::vector<Point> notchPositions(const PatternPiece& p) {
    std::vector<Point> ticks = notchPoints(p);
    for (size_t i = 0; i + 1 < ticks.size(); ++i)
        for (size_t j = i + 1; j < ticks.size(); ++j)
            if (ticks[j].y < ticks[i].y) std::swap(ticks[i], ticks[j]);
    std::vector<Point> out;
    size_t i = 0;
    while (i < ticks.size()) {
        size_t j = i;
        double sx = 0, sy = 0;
        while (j < ticks.size() && ticks[j].y - ticks[i].y <= 13.0) {
            sx += ticks[j].x; sy += ticks[j].y; ++j;
        }
        const double n = static_cast<double>(j - i);
        out.push_back({sx / n, sy / n});
        i = j;
    }
    return out;
}

// ---------------------------------------------------------------- the gate

// Published production tolerance this repo already declares (1/32 inch), NOT a
// number read off the motor's own output.
static constexpr double kProdTolMM = 0.79375;

// Runs the four cuttability claims over a pattern and returns the failures as
// text. Same function judges the pristine draft AND the sabotaged copies, so
// the anti-hack proof uses the identical yardstick.
static std::vector<std::string> cuttabilityFailures(const DraftedPattern& d) {
    std::vector<std::string> bad;

    for (const auto& piece : d.pieces) {
        // ---- 1. seam allowance (cutting line) --------------------------
        if (!isStrip(piece) && piece.seamAllowance > 0.01) {
            if (piece.cutLine.empty()) {
                bad.push_back(piece.name + ": no cutting line (seam allowance not drawn)");
            } else {
                const auto sew = flattenToPoly(piece.commands);
                const auto cut = flattenToPoly(piece.cutLine);
                if (sew.size() < 3 || cut.size() < 3) {
                    bad.push_back(piece.name + ": degenerate cut/sew outline");
                } else {
                    size_t outside = 0;
                    for (const auto& s : sew) if (!insidePoly(cut, s)) ++outside;
                    if (outside > 0)
                        bad.push_back(piece.name + ": " + std::to_string(outside) +
                                      " sewing-line vertices fall OUTSIDE the cutting line");
                    if (perimeter(cut) <= perimeter(sew))
                        bad.push_back(piece.name + ": cutting perimeter not longer than sewing perimeter");
                }
            }
        }

        // ---- 2. grain line ---------------------------------------------
        if (!piece.hasGrainline) {
            bad.push_back(piece.name + ": no grain line (fabric direction unknown)");
        } else if (distance(piece.grainline.from, piece.grainline.to) < 1.0) {
            bad.push_back(piece.name + ": grain line shorter than 1mm (not drawable)");
        }

        // ---- 3. cut on fold --------------------------------------------
        const bool noteSaysFold =
            piece.cutInstruction.find("on fold") != std::string::npos;
        if (noteSaysFold) {
            if (!piece.onFold)
                bad.push_back(piece.name + ": cut note says 'on fold' but onFold flag is false");
            if (piece.foldLine.empty()) {
                bad.push_back(piece.name + ": cut note says 'on fold' but no fold line is drawn");
            } else {
                const auto fl = flattenToPoly(piece.foldLine);
                if (fl.size() < 2) {
                    bad.push_back(piece.name + ": fold line is not a segment");
                } else {
                    for (const auto& p : fl)
                        if (std::fabs(p.x) > kProdTolMM)
                            bad.push_back(piece.name + ": fold line off the x=0 mirror axis");
                    if (std::fabs(fl.front().y - fl.back().y) < 1.0)
                        bad.push_back(piece.name + ": fold line shorter than 1mm");
                }
            }
        } else if (!piece.foldLine.empty()) {
            bad.push_back(piece.name + ": fold line drawn on a piece that is NOT cut on fold");
        }
    }

    // ---- 4. notches match across the side seam --------------------------
    const PatternPiece* front = nullptr;
    const PatternPiece* back = nullptr;
    for (const auto& p : d.pieces) {
        if (p.name.find("Front Body") != std::string::npos) front = &p;
        if (p.name.find("Back Body") != std::string::npos) back = &p;
    }
    if (!front || !back) {
        bad.push_back("Front/Back Body missing — the side seam cannot be walked");
    } else {
        const auto fPoly = flattenToPoly(front->commands);
        const auto bPoly = flattenToPoly(back->commands);
        const double fSide = maxX(fPoly), bSide = maxX(bPoly);
        const auto fN = notchPositions(*front);
        const auto bN = notchPositions(*back);
        if (fN.empty()) bad.push_back("Front Body: no balance notches on the side seam");
        if (bN.empty()) bad.push_back("Back Body: no balance notches on the side seam");
        // every notch sits ON its own side edge (its tick starts at the seam)
        for (const auto& n : fN)
            if (std::fabs(n.x - fSide) > 12.0)  // tick length, not a position tolerance
                bad.push_back("Front Body: a notch sits off the side seam edge");
        for (const auto& n : bN)
            if (std::fabs(n.x - bSide) > 12.0)
                bad.push_back("Back Body: a notch sits off the side seam edge");
        if (fN.size() != bN.size())
            bad.push_back("side seam carries " + std::to_string(fN.size()) +
                          " front notch positions but " + std::to_string(bN.size()) +
                          " back ones — they cannot pair up");
        // The two sides must MATCH: the same notch position, the same fraction
        // down its own side edge. The fraction is dimensionless and each side
        // computes it from its own piece, so this is an invariant, not a
        // tolerance the motor gets to pick. 1e-3 of the side edge = 0.2mm on a
        // 200mm seam, inside the 0.79375mm (1/32") production band this repo
        // already declares.
        if (fN.size() == bN.size()) {
            const Rect fbb = boundingBox(front->commands);
            const Rect bbb = boundingBox(back->commands);
            for (size_t i = 0; i < fN.size(); ++i) {
                const double fFrac = fbb.height > 0 ? (fN[i].y - fbb.y) / fbb.height : -1;
                const double bFrac = bbb.height > 0 ? (bN[i].y - bbb.y) / bbb.height : -1;
                if (std::fabs(fFrac - bFrac) > 1e-3) {
                    char buf[240];
                    std::snprintf(buf, sizeof buf,
                        "side-seam notch %zu does not match: front at %.6f of its side "
                        "edge, back at %.6f (d=%.6f > 1e-3)",
                        i, fFrac, bFrac, std::fabs(fFrac - bFrac));
                    bad.push_back(buf);
                }
            }
        }
    }
    return bad;
}

// ---------------------------------------------------------------- main

int main() {
    std::printf("cuttable_output_check — EU38 Locket, cuttable-output gate\n");

    const auto body = eu38();
    const DraftedPattern d = GarmentDrafter::draft(locketSpec(), body);
    std::printf("  pieces drafted: %zu\n", d.pieces.size());

    // Inventory (numbers, not adjectives).
    size_t withCut = 0, withGrain = 0, onFold = 0, withFoldLine = 0, notchTicks = 0;
    for (const auto& p : d.pieces) {
        if (!p.cutLine.empty()) ++withCut;
        if (p.hasGrainline) ++withGrain;
        if (p.cutInstruction.find("on fold") != std::string::npos) ++onFold;
        if (!p.foldLine.empty()) ++withFoldLine;
        notchTicks += notchPoints(p).size();
    }
    std::printf("  cutting lines: %zu/%zu · grain lines: %zu/%zu · "
                "on-fold pieces: %zu (fold lines drawn: %zu) · notch ticks: %zu\n",
                withCut, d.pieces.size(), withGrain, d.pieces.size(),
                onFold, withFoldLine, notchTicks);

    // REPORTED, NOT GATED (honest gap): the notch layer is placed as a FRACTION
    // of each panel's bounding box (garment.cpp annotateTechnical), so what can
    // be proven is fraction-equality. The industrial claim — "walk the pieces",
    // i.e. equal mm ALONG the sewn side edge — is a different, stronger number
    // and the representation does not carry it yet. Printed so nobody mistakes
    // a green gate for a walked seam.
    for (const auto& p : d.pieces) {
        if (p.name != "Front Body" && p.name != "Back Body") continue;
        const Rect bb = boundingBox(p.commands);
        for (const auto& n : notchPositions(p))
            std::printf("    notch: %-12s y=%.4fmm  frac=%.6f  (hem %.4fmm above)\n",
                        p.name.c_str(), n.y, (n.y - bb.y) / bb.height, bb.y + bb.height - n.y);
    }

    const auto bad = cuttabilityFailures(d);
    for (const auto& b : bad) std::printf("    ! %s\n", b.c_str());
    check(bad.empty(), "EU38 Locket output is cuttable (seam allowance + grain + fold + notches)");
    check(onFold > 0, "at least one piece is cut on fold (the claim is not vacuous)");
    check(withFoldLine == onFold, "every on-fold piece carries a drawn fold line");

    // -------- ANTI-HACK: break one thing at a time, the gate must go red ----
    struct Sabotage { const char* what; void (*apply)(DraftedPattern&); };
    const Sabotage sabotages[] = {
        {"cutLine cleared on the first cuttable piece", [](DraftedPattern& p) {
            for (auto& pc : p.pieces)
                if (!isStrip(pc) && !pc.cutLine.empty()) { pc.cutLine.clear(); return; }
        }},
        {"grain line removed from the first piece", [](DraftedPattern& p) {
            for (auto& pc : p.pieces)
                if (pc.hasGrainline) { pc.hasGrainline = false; return; }
        }},
        {"fold line erased from the on-fold piece", [](DraftedPattern& p) {
            for (auto& pc : p.pieces)
                if (!pc.foldLine.empty()) { pc.foldLine.clear(); return; }
        }},
        {"fold line invented on a piece that is not on fold", [](DraftedPattern& p) {
            for (auto& pc : p.pieces)
                if (pc.cutInstruction.find("on fold") == std::string::npos) {
                    pc.foldLine = { PathCommand::move({0, 0}), PathCommand::line({0, 100}) };
                    return;
                }
        }},
        {"a side-seam notch shifted 5mm along the seam", [](DraftedPattern& p) {
            for (auto& pc : p.pieces) {
                if (pc.name.find("Front Body") == std::string::npos) continue;
                for (auto& c : pc.notches) { c.to.y += 5.0; }
                return;
            }
        }},
    };
    for (const auto& s : sabotages) {
        DraftedPattern mut = d;
        s.apply(mut);
        const auto mb = cuttabilityFailures(mut);
        std::printf("    anti-hack [%s] -> %zu failure(s)%s%s\n", s.what, mb.size(),
                    mb.empty() ? "" : ": ", mb.empty() ? "" : mb[0].c_str());
        check(!mb.empty(), std::string("ANTI-HACK caught: ") + s.what);
    }

    std::printf("%s\n", failures == 0 ? "cuttable_output_check OK"
                                      : "cuttable_output_check FAILED");
    return failures == 0 ? 0 : 1;
}
