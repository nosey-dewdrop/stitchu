// F-K GATE — a flat / Peter Pan collar must LIE FLAT, not stand up.
//
// THE DEFECT THIS GATE EXISTS FOR: flatCollar() used to draft the neck (attach)
// seam as a dead-straight line CB(0,0) -> CF(neckLen,0). Its LENGTH was right, so
// truing measured 0.00 mm and every existing check was green — but a straight
// seam makes a RECTANGULAR STRIP. Sewn to a curved neckline a strip cannot lie
// down; it stands up and behaves like a band collar. Truing could never catch it,
// because truing only measures length.
//
// THE LAW (drafting): overlap front and back bodice at the shoulder, pivoting
// about the neck point, trace the neckline through the overlap — that trace is
// the collar's neck edge. So the neck edge is a CURVE whose curvature runs the
// same way as the garment's own neckline, and whose LENGTH still equals the
// neckline.
//
// WHAT IS ASSERTED (nothing loosened; truing keeps collar_check's 0.005 mm):
//   1. the neck edge's sagitta is > 0 — it is not a straight line
//   2. its curvature runs the SAME way as the garment neckline. Both edges ring
//      the same neck hole with the fabric on the outside of it, so the invariant
//      is piece-local and mirror-proof: THE NECK SEAM BOWS INTO ITS OWN PIECE'S
//      FABRIC — probe half a millimetre off the seam's apex each way and the
//      one INSIDE the piece must be the way the seam bows.
//      Checked identically on the collar, the bodice front and the bodice back.
//   3. the drawn turning equals the turning the block derives from the MEASURED
//      neckline (half-neckline turning minus the 2 cm shoulder-overlap pivot) —
//      so the shape comes from the garment, not from a constant
//   4. neck-edge length == half the neckline, within the existing tolerance
//
// PARITY (v5 §C — reported, judges nothing): Bugra Locket's real collar pieces.
//
// ANTI-HACK log: GECE/log/F-K.mutasyon.txt
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/collar.hpp"
#include "../src/garment.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

// Truing tolerance: the SAME 0.005 mm collar_check has always used. Not relaxed.
static constexpr double kTruingTolMM = 0.005;
// A sagitta below this is a drawing artefact, not a drafted curve. The gate is
// "> 0"; this floor only keeps floating-point dust from counting as a pass.
static constexpr double kSagittaFloorMM = 0.05;

// ---- geometry helpers (independent of collar.cpp: the gate re-measures) ------

static std::vector<Point> walk(const std::vector<PathCommand>& cmds, int steps = 64) {
    std::vector<Point> pts;
    Point cur{0, 0};
    bool started = false;
    for (const auto& c : cmds) {
        if (c.type == CmdType::Move) { cur = c.to; pts.push_back(cur); started = true; }
        else if (c.type == CmdType::Line) {
            if (!started) { cur = c.to; pts.push_back(cur); started = true; continue; }
            pts.push_back(c.to); cur = c.to;
        } else if (c.type == CmdType::Curve) {
            if (!started) { cur = c.to; pts.push_back(cur); started = true; continue; }
            const std::vector<Point> seg = flattenCubic(cur, c.to, c.cp1, c.cp2, steps);
            for (size_t i = 1; i < seg.size(); ++i) pts.push_back(seg[i]);
            cur = c.to;
        }
    }
    return pts;
}

// Signed perpendicular offset of P from the directed chord A->B (mm).
static double sideOf(Point a, Point b, Point p) {
    const double dx = b.x - a.x, dy = b.y - a.y;
    const double n = std::sqrt(dx * dx + dy * dy);
    if (n < 1e-12) return 0;
    return ((p.x - a.x) * dy - (p.y - a.y) * dx) / n;
}

// Sagitta of a polyline about its own chord, SIGNED (which side it bows to).
static double signedSagitta(const std::vector<Point>& pts) {
    if (pts.size() < 3) return 0;
    const Point a = pts.front(), b = pts.back();
    double best = 0;
    for (const Point& p : pts) {
        const double s = sideOf(a, b, p);
        if (std::fabs(s) > std::fabs(best)) best = s;
    }
    return best;
}

// Total turning (rad, absolute) along a polyline.
static double turning(const std::vector<Point>& pts) {
    if (pts.size() < 3) return 0;
    double total = 0, px = 0, py = 0;
    bool have = false;
    for (size_t i = 1; i < pts.size(); ++i) {
        const double dx = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y;
        const double n = std::sqrt(dx * dx + dy * dy);
        if (n < 1e-12) continue;
        const double ux = dx / n, uy = dy / n;
        if (have) total += std::atan2(px * uy - py * ux, px * ux + py * uy);
        px = ux; py = uy; have = true;
    }
    return std::fabs(total);
}

static bool inside(const std::vector<Point>& poly, Point p) {
    bool in = false;
    for (size_t i = 0, n = poly.size(), j = n - 1; i < n; j = i++) {
        const Point& a = poly[i];
        const Point& b = poly[j];
        if ((a.y > p.y) != (b.y > p.y) &&
            p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x)
            in = !in;
    }
    return in;
}

// "Does this seam bow INTO its own piece's fabric?"  +1 yes, -1 no, 0 flat.
//
// Decided by PROBING, not by a centroid: step half a millimetre off the seam's
// own apex, once each way along the sagitta, and ask which probe is inside the
// piece. A centroid answers the wrong question on a strongly curved piece (it
// can sit off the fabric entirely, and a collar bent the wrong way wraps its
// own arc centre, which drags the centroid to the wrong side — measured, that
// is exactly how a reversed collar sneaks past a centroid test).
static int bowsIntoFabric(const std::vector<Point>& seam, const std::vector<Point>& outline,
                          double* sagOut) {
    const double sag = signedSagitta(seam);
    if (sagOut) *sagOut = std::fabs(sag);
    if (std::fabs(sag) < 1e-9) return 0;
    const Point A = seam.front(), B = seam.back();
    Point apex = A;
    for (const Point& p : seam)
        if (std::fabs(sideOf(A, B, p)) >= std::fabs(sag) - 1e-12) { apex = p; break; }
    const double dx = B.x - A.x, dy = B.y - A.y, n = std::sqrt(dx * dx + dy * dy);
    if (n < 1e-12) return 0;
    // unit normal pointing the way the seam bows
    const double nx = (dy / n) * (sag > 0 ? 1 : -1), ny = (-dx / n) * (sag > 0 ? 1 : -1);
    const double eps = 0.5;
    const bool bowSideInside = inside(outline, Point{apex.x + nx * eps, apex.y + ny * eps});
    const bool otherSideInside = inside(outline, Point{apex.x - nx * eps, apex.y - ny * eps});
    if (bowSideInside == otherSideInside) return 0;  // undecidable -> not a pass
    return bowSideInside ? 1 : -1;
}

// The piece's neckline run: commands[0] .. the minimum-y vertex (the neck point),
// same convention collar.cpp measures the neckline with.
static std::vector<PathCommand> necklineRun(const PatternPiece& p) {
    const auto& c = p.commands;
    if (c.size() < 3 || c[0].type != CmdType::Move) return {};
    size_t end = 1;
    double minY = c[0].to.y;
    for (size_t i = 1; i < c.size(); ++i) {
        if (c[i].type == CmdType::Close) break;
        if (c[i].to.y <= minY + 1e-6) { minY = c[i].to.y; end = i; }
        else break;
    }
    std::vector<PathCommand> run{PathCommand::move(c[0].to)};
    for (size_t i = 1; i <= end; ++i) run.push_back(c[i]);
    return run;
}

static const PatternPiece* findByName(const DraftedPattern& d, const char* needle) {
    for (const auto& p : d.pieces)
        if (p.name.find(needle) != std::string::npos) return &p;
    return nullptr;
}

// ---- the case ---------------------------------------------------------------

static void oneCase(const char* label, GarmentSpec spec, CollarType type, CollarEdge edge,
                    const BodyMeasurementsSnapshot& m) {
    std::printf("%s\n", label);
    spec.edgeFinish = static_cast<int>(EdgeFinish::Facing);
    spec.collarType = static_cast<int>(type);
    spec.collarEdge = static_cast<int>(edge);
    const DraftedPattern d = GarmentDrafter::draft(spec, m);

    const CollarBlock::NecklineShape shape = CollarBlock::necklineShapeMM(d);
    const double wantTurn = CollarBlock::flatCollarNeckTurnRad(shape);
    const PatternPiece* collar = findByName(d, "Collar");
    if (!collar || collar->commands.size() < 3) {
        check(false, "collar piece present");
        return;
    }

    // Neck (attach) edge = commands[0..1], the same slice collar_check reads.
    const std::vector<PathCommand> neckCmds{collar->commands[0], collar->commands[1]};
    const std::vector<Point> neck = walk(neckCmds, 256);
    const std::vector<Point> outline = walk(collar->commands, 64);

    std::printf("      neckline %.2f mm  halfTurn %.2f deg  shoulder %.2f mm"
                "  -> collar neck turn %.2f deg\n",
                shape.lengthMM, shape.halfTurnRad * 57.2957795, shape.shoulderMM,
                wantTurn * 57.2957795);

    // (4) TRUING — unchanged constraint, unchanged tolerance.
    const double half = shape.lengthMM / 2;
    const double drawnLen = pathLength(neckCmds);
    const double truingErr = std::fabs(drawnLen - half);
    check(truingErr < kTruingTolMM,
          "neck edge length == half neckline (truing kept at 0.005 mm)");

    // (1) NOT STRAIGHT.
    double sag = 0;
    const int bow = bowsIntoFabric(neck, outline, &sag);
    check(sag > kSagittaFloorMM, "neck edge sagitta > 0 (not a straight strip)");

    // (2) DIRECTION — collar and garment must bow the same way.
    const PatternPiece* front = findByName(d, "Front");
    const PatternPiece* back = findByName(d, "Back");
    double sagF = 0, sagB = 0;
    int bowF = 0, bowB = 0;
    if (front) bowF = bowsIntoFabric(walk(necklineRun(*front), 256), walk(front->commands, 64), &sagF);
    if (back) bowB = bowsIntoFabric(walk(necklineRun(*back), 256), walk(back->commands, 64), &sagB);
    check(bow == 1, "collar neck seam bows INTO the collar's fabric");
    check(bowF == 1, "garment front neckline bows INTO the bodice fabric (reference)");
    check(bowB == 1, "garment back neckline bows INTO the bodice fabric (reference)");
    check(bow == bowF && bow == bowB,
          "collar neck curvature runs the SAME way as the garment neckline");

    // (3) THE SHAPE CAME FROM THE GARMENT, not from a constant.
    // Exact turning of the drawn seam = the angle from its start tangent to its
    // end tangent. Read off the emitted command, not off a flattened polyline —
    // a polyline loses ~turn/steps of turning at the two ends (it starts on a
    // chord, not on the tangent) and that artefact is not the engine's error.
    const PathCommand& seam = collar->commands[1];
    const Point p0 = collar->commands[0].to;
    double drawnTurn = 0;
    if (seam.type == CmdType::Curve) {
        const double t0x = seam.cp1.x - p0.x, t0y = seam.cp1.y - p0.y;
        const double t1x = seam.to.x - seam.cp2.x, t1y = seam.to.y - seam.cp2.y;
        drawnTurn = std::fabs(std::atan2(t0x * t1y - t0y * t1x, t0x * t1x + t0y * t1y));
    }
    check(std::fabs(drawnTurn - wantTurn) < 1e-6,
          "drawn turning == measured half-neckline turning - 2 cm shoulder pivot");
    // ...and the seam really sweeps that turning monotonically (no S-wiggle):
    // the flattened walk must land within one flattening step of it.
    const double walkedTurn = turning(neck);
    check(std::fabs(walkedTurn - drawnTurn) < drawnTurn / 200.0 + 1e-9,
          "seam sweeps that turning monotonically (no S-curve)");

    std::printf("      sagitta: collar %.3f mm (turn %.2f deg) | front neckline %.3f mm"
                " | back neckline %.3f mm\n",
                sag, drawnTurn * 57.2957795, sagF, sagB);
    std::printf("      piece '%s', neck edge %.4f mm vs half %.4f mm (err %.6f)\n\n",
                collar->name.c_str(), drawnLen, half, truingErr);
}

int main() {
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    const BodyMeasurementsSnapshot petite{82, 64, 90, 35, 38, 55, 33};
    const BodyMeasurementsSnapshot plus{122, 104, 128, 44, 44, 60, 40};

    std::printf("F-K — flat / Peter Pan collar must LIE FLAT\n\n");

    GarmentSpec dress; dress.garment = GarmentType::Dress; dress.neckline = Neckline::Crew;
    oneCase("Crew dress + PETER PAN (round):", dress, CollarType::PeterPan, CollarEdge::Round, m);

    GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::Crew;
    oneCase("Crew top + FLAT (pointed), petite:", top, CollarType::Flat, CollarEdge::Pointed, petite);

    GarmentSpec top2; top2.garment = GarmentType::Top; top2.neckline = Neckline::Crew;
    top2.shaping = Shaping::Dart;
    oneCase("Dart top + PETER PAN (scallop), plus:", top2, CollarType::PeterPan,
            CollarEdge::Scallop, plus);

    GarmentSpec dress2; dress2.garment = GarmentType::Dress; dress2.neckline = Neckline::Boat;
    oneCase("Boat dress + PETER PAN (round):", dress2, CollarType::PeterPan, CollarEdge::Round, m);

    // ---- PARITY (v5 §C): reported, judges nothing --------------------------
    // Measured off the purchased Bugra Locket's own vector rings by
    // GECE/log/F-K.bugra-sagitta.py (source: patterns_real/geometry/
    // geometry-full.json). These are the FULL collar span (CF tip to CF tip);
    // ours is a HALF collar, so the comparable turning is roughly half of theirs.
    // No threshold is derived from these numbers and no case is judged by them.
    std::printf("PARITY (Bugra Locket, EU38 — reported, judges nothing):\n"
                "      Collar        (defter 'EXTRA-TL'): chord 290.78 mm  sagitta 64.07 mm"
                "  s/c 0.2203  turn 95.13 deg\n"
                "      Collar Lining (defter 'Collar')   : chord 237.39 mm  sagitta 50.77 mm"
                "  s/c 0.2139  turn 92.63 deg\n"
                "      => a real bought flat-collar neck edge is NOT straight. Full log:"
                " GECE/log/F-K.bugra-parite.txt\n\n");

    std::printf(failures == 0 ? "ALL F-K COLLAR-LIES-FLAT CHECKS PASS\n"
                              : "%d F-K CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
