// Cutting-line check: proves the seam allowance is REAL geometry — every cut
// line vertex sits between SA-tol and miterCap*SA+tol away from the sewing
// outline, fold edges are never crossed, strips stay single-line, and every
// piece still prints. Sampled DEEP here (the validator keeps only the cheap
// bbox invariant so the 70k matrix stays fast).
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

// Flatten a command path to a polygon.
static std::vector<Point> flatten(const std::vector<PathCommand>& cmds) {
    std::vector<Point> poly;
    Point cur{0, 0};
    for (const auto& c : cmds) {
        if (c.type == CmdType::Move) { cur = c.to; poly.push_back(cur); }
        else if (c.type == CmdType::Line) { poly.push_back(c.to); cur = c.to; }
        else if (c.type == CmdType::Curve) {
            const auto pts = flattenCubic(cur, c.to, c.cp1, c.cp2, 24);
            for (size_t i = 1; i < pts.size(); ++i) poly.push_back(pts[i]);
            cur = c.to;
        }
    }
    return poly;
}

static double pointToSegment(Point p, Point a, Point b) {
    const double abx = b.x - a.x, aby = b.y - a.y;
    const double len2 = abx * abx + aby * aby;
    double t = len2 < 1e-12 ? 0 : ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2;
    t = std::max(0.0, std::min(1.0, t));
    return distance(p, {a.x + t * abx, a.y + t * aby});
}

static double distToPoly(Point p, const std::vector<Point>& poly) {
    double best = 1e18;
    for (size_t i = 0; i < poly.size(); ++i)
        best = std::min(best, pointToSegment(p, poly[i], poly[(i + 1) % poly.size()]));
    return best;
}

static void audit(const char* label, const GarmentSpec& spec, const BodyMeasurementsSnapshot& m) {
    std::printf("%s\n", label);
    const DraftedPattern d = GarmentDrafter::draft(spec, m);
    check(PatternValidator::issues(spec, m, d).empty(), "draft valid (cutline rule included)");

    int audited = 0;
    double worstLow = 1e18, worstHigh = 0;
    for (const auto& piece : d.pieces) {
        const bool strip = piece.name.find("Ruffle") != std::string::npos ||
                           piece.name.find("Bias binding") != std::string::npos;
        if (strip || piece.seamAllowance <= 0.01) {
            check(piece.cutLine.empty(), piece.name + ": single-line by design");
            continue;
        }
        check(!piece.cutLine.empty(), piece.name + ": has a cutting line");
        if (piece.cutLine.empty()) continue;
        audited++;

        const auto sewAll = flatten(piece.commands);
        const auto cut = flatten(piece.cutLine);
        const bool onFold = piece.cutInstruction.find("on fold") != std::string::npos;
        const double sa = piece.seamAllowance;
        // The fold is not a seam: measure against non-fold outline edges only
        // (mirror of the engine's own envelope rule), and skip points sitting
        // ON the fold — their invariant is the x >= 0 clamp below.
        std::vector<Point> sew;
        for (size_t i = 0; i < sewAll.size(); ++i) {
            const Point& a = sewAll[i];
            const Point& b = sewAll[(i + 1) % sewAll.size()];
            if (onFold && a.x < 0.5 && b.x < 0.5) continue;
            sew.push_back(a); sew.push_back(b);
        }
        double lo = 1e18, hi = 0, minX = 1e18;
        for (const auto& p : cut) {
            minX = std::min(minX, p.x);
            if (onFold && p.x < 0.1) continue;
            double dist = 1e18;
            for (size_t i = 0; i + 1 < sew.size(); i += 2)
                dist = std::min(dist, pointToSegment(p, sew[i], sew[i + 1]));
            lo = std::min(lo, dist);
            hi = std::max(hi, dist);
        }
        worstLow = std::min(worstLow, lo);
        worstHigh = std::max(worstHigh, hi / sa);
        if (lo < sa - 1.5) {
            check(false, piece.name + ": cut line dips under the allowance (" +
                         std::to_string(lo) + " mm)");
        }
        if (hi > sa * 2.5 + 1.5) {
            check(false, piece.name + ": miter spike beyond the clamp (" +
                         std::to_string(hi) + " mm)");
        }
        if (onFold && minX < -0.1) {
            check(false, piece.name + ": cut line crosses the fold");
        }
    }
    std::printf("      %d pieces audited; min offset %.2f mm, max %.2fx allowance\n",
                audited, worstLow, worstHigh);
    check(audited >= 3, "a real set of pieces was audited");
    std::printf("\n");
}

int main() {
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    const BodyMeasurementsSnapshot plus{122, 104, 128, 42, 43.5, 61.5, 41};

    GarmentSpec dress;
    dress.garment = GarmentType::Dress;
    dress.shaping = Shaping::Princess; // opt-in princess: proves the split panels still get cut lines
    dress.sleeveStyle = SleeveStyle::Balloon;
    dress.sleeveLength = SleeveLength::Elbow;
    audit("Princess A-line dress + balloon sleeves:", dress, m);

    GarmentSpec halter;
    halter.garment = GarmentType::Dress;
    halter.neckline = Neckline::Halter;
    halter.skirtStyle = SkirtStyle::HalfCircle;
    audit("Halter half-circle dress (strap tips = sharp corners):", halter, m);

    GarmentSpec ruffled;
    ruffled.garment = GarmentType::Skirt;
    ruffled.skirtStyle = SkirtStyle::Pleated;
    ruffled.ruffleHem = true;
    ruffled.ruffleTiers = 3;
    audit("Pleated skirt + tiered ruffle (strips stay single-line):", ruffled, plus);

    GarmentSpec keyed;
    keyed.garment = GarmentType::Top;
    keyed.shaping = Shaping::Princess; // opt-in princess: multiple cut pieces surround the single-line keyhole facing
    keyed.neckline = Neckline::Sweetheart;
    keyed.keyhole = true;
    keyed.topLength = TopLength::Tunic;
    audit("Sweetheart tunic + keyhole (facing stays single-line):", keyed, m);

    std::printf(failures == 0 ? "ALL CUTLINE CHECKS PASS\n" : "%d CUTLINE CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
