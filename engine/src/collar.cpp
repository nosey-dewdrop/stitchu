#include "collar.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

namespace stitchu {
namespace CollarBlock {

namespace {

constexpr double SA = constants::kSeamAllowanceMM; // seam allowance (constants.yaml)

// --- collar dimensions (FORMULAS.md "Collar family") -------------------------
constexpr double standBandH = 35;   // full stand-up band height
constexpr double mockBandH = 30;    // shorter mock/mandarin band
constexpr double cfRise = 15;       // centre-front rise: hugs the neck
constexpr double flatWidth = 60;    // finished flat/peter-pan collar width
constexpr double shirtStandH = 28;  // shirt collar stand height
constexpr double shirtBladeH = 48;  // shirt collar blade (= stand + 20, covers seam)

// --- flat / peter-pan collar: the shoulder overlap (F-K) ---------------------
// A flat collar is NOT drafted as a strip. Front and back bodice are OVERLAPPED
// at the shoulder, pivoting about the neck point, and the neckline is traced
// through the overlap — that trace is the collar's neck edge. The overlap AMOUNT
// is what decides how much the finished collar rolls: overlap 0 = dead flat (and
// prone to ripple), more overlap = more roll.
//
// SOURCE: Aldrich's single hard number for this draft — "overlap the shoulders
// by 2 cm" — recorded in this repo at
//   knowledge/FLAT-DIS-KAYNAKLAR-2026-08-23.md:97
// ⚠ SOURCE STATUS: that line is a research agent's reading of Aldrich; the file's
// own header states the primary editions were NOT opened here, and it carries no
// edition/page. So the ATTRIBUTION is DOĞRULANMADI. The number itself is taken
// from the repo's knowledge layer, not invented, and it is NOT tuned to make any
// gate pass (the gate only asks for sagitta > 0 and the right sign).
constexpr double flatShoulderOverlapMM = 20.0;

// --- Crescent (Bugra Locket) collar dimensions -------------------------------
// Every proportion measured off the purchased Locket Top's size-36 vector rings
// (patterns_real/geometry/geometry-full.json: the 'EXTRA-TL' cluster is the true
// Collar, the 'Collar' cluster is the true Collar Lining — nameNote-proven).
// The U aspect and the two band widths are style constants of the collar (like
// flatWidth); the U SIZE is solved from the garment's own measured neckline, so
// the trued neck edge stays the governing constraint.
constexpr double crescentAspect = 0.95;     // inner-U half-span / inner-U depth (ring fit, /tmp grid vs the size-36 ring)
constexpr double crescentBandW = 30;        // band depth at centre back (sew)
constexpr double crescentBandTip = 22;      // band width at the blunt CF tip ends (sew)
constexpr double crescentTipRise = 0;       // tips sit on the inner tip line (ring fit)
constexpr double crescentTipFlare = 12;     // lining tip flares outward past the inner tip
constexpr double crescentLiningBandW = 62;  // lining band is cut deeper (Bugra piece 4)
constexpr double crescentLiningScale = 0.95; // lining neck edge cut smaller -> seam rolls under
constexpr double crescentLiningAspect = 1.15; // lining half-U inner aspect (a / d)

// Quarter-ellipse cubic from (sx*a, 0) toward (0, d) or back, kappa arc.
constexpr double kKappa = 0.5522847498;

PatternPiece* findPiece(DraftedPattern& pattern, std::initializer_list<const char*> names) {
    for (const char* name : names)
        for (auto& piece : pattern.pieces)
            if (piece.name == name) return &piece;
    return nullptr;
}

// The neckline runs from commands[0] (centre-neck) up to the neck point at the
// shoulder — that neck point is the outline vertex with the SMALLEST y (the
// bodice draws neckPoint at y = 0, then a line down/out to the shoulder tip).
// Return exactly those commands as a sub-path: that is HALF the front (or back)
// neckline, on the drafted curve — its LENGTH is what truing measures and its
// TURNING is what the flat collar has to copy. Empty if degenerate.
std::vector<PathCommand> necklineSubPath(const PatternPiece* piece, size_t* neckEndOut) {
    if (neckEndOut) *neckEndOut = 0;
    if (!piece || piece->commands.size() < 3) return {};
    const auto& c = piece->commands;
    if (c[0].type != CmdType::Move) return {};
    // Index of the neck point = minimum-y vertex among the leading commands.
    // Scan from 1 forward until y stops decreasing (the neck point), so we never
    // walk past the neckline into the shoulder/armhole.
    size_t neckEnd = 1;
    double minY = c[0].to.y;
    for (size_t i = 1; i < c.size(); ++i) {
        if (c[i].type == CmdType::Close) break;
        if (c[i].to.y <= minY + 1e-6) { minY = c[i].to.y; neckEnd = i; }
        else break;  // y turned back down toward the shoulder — neckline ended
    }
    std::vector<PathCommand> neck;
    neck.reserve(neckEnd + 1);
    neck.push_back(PathCommand::move(c[0].to));
    for (size_t i = 1; i <= neckEnd; ++i) neck.push_back(c[i]);
    if (neckEndOut) *neckEndOut = neckEnd;
    return neck;
}

double halfNecklineLen(const PatternPiece* piece) {
    return pathLength(necklineSubPath(piece, nullptr));
}

// Walk a path into a dense polyline so turning/curvature can be measured on the
// SAME geometry the length is measured on (curves included, not just vertices).
std::vector<Point> polyline(const std::vector<PathCommand>& cmds, int steps = 48) {
    std::vector<Point> pts;
    Point cur{0, 0};
    bool started = false;
    for (const auto& c : cmds) {
        if (c.type == CmdType::Move) {
            cur = c.to; pts.push_back(cur); started = true;
        } else if (c.type == CmdType::Line) {
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

// Total turning (rad, absolute) of a polyline: the signed exterior angles summed
// along the walk, then made positive. For a circular arc this is exactly the
// arc's subtended angle, which is what the flat-collar draft needs.
double turningRad(const std::vector<Point>& pts) {
    if (pts.size() < 3) return 0;
    double total = 0;
    double px = 0, py = 0;
    bool have = false;
    for (size_t i = 1; i < pts.size(); ++i) {
        const double dx = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y;
        const double n = std::sqrt(dx * dx + dy * dy);
        if (n < 1e-12) continue;
        const double ux = dx / n, uy = dy / n;
        if (have) {
            const double cross = px * uy - py * ux;
            const double dot = px * ux + py * uy;
            total += std::atan2(cross, dot);
        }
        px = ux; py = uy; have = true;
    }
    return std::fabs(total);
}

// Turning of the piece's neckline run (centre-neck -> shoulder neck point).
double halfNecklineTurn(const PatternPiece* piece) {
    return turningRad(polyline(necklineSubPath(piece, nullptr)));
}

// The drafted shoulder seam: the command that leaves the neck point. The flat
// collar's shoulder overlap is an ARC at the shoulder tip about the neck-point
// pivot, so overlap-in-mm becomes an angle only through this length.
double shoulderSeamLen(const PatternPiece* piece) {
    if (!piece) return 0;
    size_t neckEnd = 0;
    const std::vector<PathCommand> neck = necklineSubPath(piece, &neckEnd);
    if (neck.empty()) return 0;
    const auto& c = piece->commands;
    if (neckEnd + 1 >= c.size()) return 0;
    const PathCommand& sh = c[neckEnd + 1];
    if (sh.type != CmdType::Line && sh.type != CmdType::Curve) return 0;
    std::vector<PathCommand> seg = {PathCommand::move(c[neckEnd].to), sh};
    return pathLength(seg);
}

// One collar stand/band. The bottom (attach) SEAM edge is drafted STRAIGHT to
// the exact neckline length `neckLen` (CB fold at x = 0 to CF at x = neckLen, on
// the y = 0 line) — that is the trued seam that sews to the neckline, so its
// length equals the neckline to 0.00 mm. The band then stands `bandH` tall; the
// CF end tilts inward by `rise` at the TOP edge so the finished band hugs the
// neck (Aldrich/M&S: raise/tilt the front to close the band round the throat).
// The bottom seam stays straight/measured; only the free top edge is shaped.
PatternPiece standBand(const std::string& name, double neckLen, double bandH,
                       double rise, const std::string& role) {
    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction = "cut 2 on fold at centre back (1 self + 1 interfacing), " + role;

    // Bottom (attach) SEAM edge: a straight line CB(0,0) -> CF(neckLen,0). Its
    // length is exactly neckLen (the neckline). Top edge sits bandH above and
    // tilts in `rise` at CF so the band closes round the neck.
    const Point cbBot{0, 0};
    const Point cfBot{neckLen, 0};
    const Point cfTop{neckLen - rise, -bandH};   // CF top pulled in by `rise` = hug
    const Point cbTop{0, -bandH};

    piece.commands = {
        PathCommand::move(cbBot),
        PathCommand::line(cfBot),
        PathCommand::line(cfTop),
        PathCommand::line(cbTop),
        PathCommand::close(),
    };
    // CB fold line + a shoulder-reference notch at the neck-run midpoint.
    piece.markings.push_back(PathCommand::move({0, 0}));
    piece.markings.push_back(PathCommand::line({0, -bandH}));
    piece.markings.push_back(PathCommand::move({neckLen * 0.5, -6}));
    piece.markings.push_back(PathCommand::line({neckLen * 0.5, 6}));
    piece.hasGrainline = true;
    piece.grainline = Grainline{{neckLen * 0.5, -8}, {neckLen * 0.5, -bandH + 8}};
    piece.seamAllowance = SA;
    return piece;
}

// --- flat-collar ARC FRAME (F-K) ---------------------------------------------
// The flat collar is drafted around a circle whose arc IS the neck seam: neck
// edge = arc of radius R subtending `turn`, arc length exactly `neckLen`; every
// other landmark is placed in (u, v) = (fraction along the neck seam, depth out
// from it), so the collar keeps its width and the whole piece curves WITH the
// neckline instead of being a straight strip.
//
// Frame: centre O below the chord; at(0,0) = CB on the fold at the origin,
// at(1,0) = the CF tip on the y = 0 line, at(0.5,0) = the sagitta apex at
// +R(1-cos(turn/2)) — i.e. the neck seam bows INTO the collar's own fabric,
// which is the same way the garment neckline bows into the bodice's fabric
// (both edges ring the same neck hole, fabric on the outside of it).
struct FlatFrame {
    bool straight = true;
    double turn = 0, R = 0, len = 0;
    Point O{0, 0};
    Point at(double u, double v) const {
        if (straight) return Point{len * u, v};
        const double th = -turn * 0.5 + u * turn;
        const double rr = R + v;
        return Point{O.x + rr * std::sin(th), O.y + rr * std::cos(th)};
    }
    // The neck seam as ONE cubic (kappa arc), so the gate can keep reading the
    // neck edge as commands[0..1] exactly as it always did.
    std::vector<PathCommand> neckEdge() const {
        if (straight) return {PathCommand::move(at(0, 0)), PathCommand::line(at(1, 0))};
        const double k = (4.0 / 3.0) * std::tan(turn * 0.25) * R;
        const double ch = std::cos(turn * 0.5), sh = std::sin(turn * 0.5);
        const Point p0 = at(0, 0), p3 = at(1, 0);
        return {PathCommand::move(p0),
                PathCommand::curve(p3, {p0.x + k * ch, p0.y + k * sh},
                                       {p3.x - k * ch, p3.y + k * sh})};
    }
};

// Build the frame and SOLVE R so the DRAWN cubic measures `neckLen` — the kappa
// arc is not exactly circular, so we do not assume R = neckLen/turn, we measure
// the path we actually emit and correct until truing is at machine precision.
FlatFrame makeFlatFrame(double neckLen, double turn) {
    FlatFrame f;
    f.len = neckLen;
    if (!(turn > 1e-6) || !(neckLen > 1e-6)) return f;  // straight (legacy) frame
    f.straight = false;
    f.turn = turn;
    f.R = neckLen / turn;
    for (int i = 0; i < 6; ++i) {
        f.O = Point{f.R * std::sin(turn * 0.5), -f.R * std::cos(turn * 0.5)};
        const double m = pathLength(f.neckEdge());
        if (!(m > 1e-9)) break;
        const double err = std::fabs(m - neckLen);
        f.R *= neckLen / m;
        if (err < 1e-10) break;
    }
    f.O = Point{f.R * std::sin(turn * 0.5), -f.R * std::cos(turn * 0.5)};
    return f;
}

// One flat-family collar half (peter-pan / flat). Neck edge length = `neckLen`
// and its TURNING = `neckTurn` (rad), the measured half-neckline turning less
// the shoulder-overlap pivot. Outer edge sits `width` out from the neck seam,
// following the same arc frame, shaped per `edge`. CB on fold at at(0, ·).
//
// `neckTurn == 0` keeps the old straight seam on purpose — that is the correct
// draft for the SHIRT blade, whose attach edge sews to the stand band's straight
// top edge, not to the neckline.
PatternPiece flatCollar(const std::string& name, double neckLen, double neckTurn,
                        double width, CollarEdge edge, const std::string& role) {
    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction = "cut 2 + interfacing (1 upper, 1 under + interfacing), " + role;

    const FlatFrame f = makeFlatFrame(neckLen, neckTurn);

    // Neck (attach) SEAM edge: the traced arc, length exactly neckLen (trued to
    // 0.00 mm) AND curving the same way as the neckline it sews to. A straight
    // seam here would true perfectly and still be wrong: it makes a rectangular
    // strip that stands up like a band instead of lying on the shoulders.
    std::vector<PathCommand> cmds = f.neckEdge();
    const Point cfOuter = f.at(1, width);  // CF end, out the collar depth
    const Point cbOuter = f.at(0, width);  // CB end
    cmds.push_back(PathCommand::line(cfOuter));   // CF end cut

    if (edge == CollarEdge::Pointed) {
        // A pointed outer edge: dip to a point partway, classic collar corner.
        cmds.push_back(PathCommand::line(f.at(0.5, width + 22)));
        cmds.push_back(PathCommand::line(cbOuter));
    } else if (edge == CollarEdge::Scallop) {
        // Scalloped outer edge: a run of small arcs CF->CB. Each lobe is a REAL
        // circular arc of chord `c` and depth `dip`, so its handles leave the
        // cusp on the arc's own tangent (angle phi/2 off the chord), not square
        // to it. Square handles used to be tolerable on a straight strip; on the
        // curved frame they read as a fold (validator 'kink'). Nothing here is a
        // free constant: phi, R and k all fall out of `c` and `dip`.
        const int scallops = 4;
        const double dip = 14;  // scallop depth
        const double c = neckLen / scallops;
        const double phi = 4 * std::atan(2 * dip / c);
        const double Rl = c / (2 * std::sin(phi * 0.5));
        const double k = (4.0 / 3.0) * std::tan(phi * 0.25) * Rl;
        const double du = k * std::cos(phi * 0.5) / neckLen;  // handle, along the seam
        const double dv = k * std::sin(phi * 0.5);            // handle, out from it
        double uPrev = 1.0;
        for (int i = 1; i <= scallops; ++i) {
            const double u = 1 - static_cast<double>(i) / scallops;
            cmds.push_back(PathCommand::curve(f.at(u, width),
                                              f.at(uPrev - du, width + dv),
                                              f.at(u + du, width + dv)));
            uPrev = u;
        }
    } else {  // Round (peter-pan)
        cmds.push_back(PathCommand::curve(cbOuter, f.at(0.72, width + 10),
                                          f.at(0.28, width - 4)));
    }
    cmds.push_back(PathCommand::close());
    piece.commands = cmds;

    // CB fold line + roll line (parallel to the neck edge, ~6 mm out).
    const double uMark = std::min(0.25, 6.0 / std::max(neckLen, 1.0));
    piece.markings.push_back(PathCommand::move(f.at(0, 0)));
    piece.markings.push_back(PathCommand::line(f.at(0, width)));
    piece.hasGrainline = true;
    piece.grainline = Grainline{f.at(uMark, 4), f.at(uMark, width - 6)};
    piece.seamAllowance = SA;
    return piece;
}

// --- Crescent (Bugra Locket) collar ------------------------------------------

// Inner-U path (full U, tips up on y = 0, bottom at y = d): two quarter-ellipse
// cubics T_R -> bottom -> T_L. Arc length scales linearly with uniform scale, so
// the U is drawn once at a seed size and scaled to put the INNER (neck) edge
// exactly on the measured neck-seam target — truing by construction, and the
// ctest re-measures it.
std::vector<PathCommand> crescentInnerU(double a, double d) {
    const Point tR{a, 0}, tL{-a, 0}, b{0, d};
    return {
        PathCommand::move(tR),
        PathCommand::curve(b, {a, d * kKappa}, {a * kKappa, d}),
        PathCommand::curve(tL, {-a * kKappa, d}, {-a, d * kKappa}),
    };
}

// The full drawn Collar: a deep U-CRESCENT (hilal). Inner edge = the neck seam
// (length `neckTarget`, solved by scale; a/d aspect measured off the size-36
// ring); outer edge = a second half-ellipse `crescentBandW` deeper at centre
// back whose ends MEET the inner tips — the band tapers to a point at each CF
// tip, exactly the purchased ring's crescent profile. Returns the piece;
// outNeckLen = the measured drawn inner-edge length (cut note + ctest).
PatternPiece crescentCollar(double neckTarget, double& outNeckLen) {
    double a = crescentAspect * 50.0, d = 50.0;
    const double len0 = pathLength(crescentInnerU(a, d));
    const double s = len0 > 1e-9 ? neckTarget / len0 : 1.0;
    a *= s; d *= s;
    const double bw = crescentBandW;
    const double D = d + bw;
    const double A = a + crescentBandTip;
    const Point tRin{a, 0}, tLin{-a, 0};
    const Point tRout{A, -crescentTipRise}, tLout{-A, -crescentTipRise};

    std::vector<PathCommand> cmds = crescentInnerU(a, d);  // tR -> bottom -> tL (inner)
    outNeckLen = pathLength(cmds);
    // Blunt CF end cut, then the outer crescent edge: a half-ellipse-class arc
    // (A, D) whose arms rise a touch above the inner tip line — the ring's own
    // arm profile (band `bw` deep at centre back, `crescentBandTip` at the ends).
    cmds.push_back(PathCommand::line(tLout));
    cmds.push_back(PathCommand::curve({0, D},
                                      {-A, D * kKappa - crescentTipRise * 0.5},
                                      {-A * kKappa, D}));
    cmds.push_back(PathCommand::curve(tRout,
                                      {A * kKappa, D},
                                      {A, D * kKappa - crescentTipRise * 0.5}));
    cmds.push_back(PathCommand::close());
    (void)tRin; (void)tLin;

    PatternPiece piece;
    piece.name = "Collar";
    piece.commands = cmds;
    piece.cutInstruction =
        "cut 2 (1 upper + 1 under) + 1 interfacing (Collar — deep U-crescent; the "
        "inner edge is your " + std::to_string(static_cast<long>(std::lround(outNeckLen))) +
        " mm neck seam, sewn from centre front around the back neck to centre "
        "front; the Collar Lining is cut smaller so the outer seam rolls under)";
    // Centre-back line across the band + a CB placement notch on the neck edge.
    piece.markings.push_back(PathCommand::move({0, d}));
    piece.markings.push_back(PathCommand::line({0, D}));
    piece.markings.push_back(PathCommand::move({-8, d + 4}));
    piece.markings.push_back(PathCommand::line({8, d + 4}));
    piece.hasGrainline = true;
    piece.grainline = Grainline{{0, d + bw * 0.2}, {0, D - bw * 0.2}};
    piece.seamAllowance = SA;
    return piece;
}

// The separate Collar Lining (Bugra Locket piece 4): HALF the under-collar,
// cut on the fold at centre back — a thick croissant band. Cut smaller than
// the Collar on purpose (crescentLiningScale) so the outer seam rolls to the
// underside. Returns the piece; outNeckLen = measured drawn inner-edge length
// of the HALF piece (×2 across the fold = the lining neck edge).
PatternPiece crescentLining(double neckTarget, double& outNeckLen) {
    double aL = crescentLiningAspect * 50.0, dL = 50.0;
    // Half inner arc: CB (on the fold) -> tip, one quarter-ellipse cubic.
    auto halfInner = [](double a, double d) {
        return std::vector<PathCommand>{
            PathCommand::move({0, d}),
            PathCommand::curve({a, 0}, {a * kKappa, d}, {a, d * kKappa}),
        };
    };
    const double len0 = pathLength(halfInner(aL, dL));
    const double target = neckTarget * crescentLiningScale / 2.0;
    const double s = len0 > 1e-9 ? target / len0 : 1.0;
    aL *= s; dL *= s;
    const double bw = crescentLiningBandW;
    const double A = aL + bw * 0.6, D = dL + bw;
    const Point tipOut{aL + crescentTipFlare, -crescentTipRise};

    std::vector<PathCommand> cmds = halfInner(aL, dL);     // fold -> tip (inner)
    outNeckLen = pathLength(cmds);
    cmds.push_back(PathCommand::line(tipOut));             // CF end cut
    cmds.push_back(PathCommand::curve({0, D},              // outer edge back to CB
                                      {A, -crescentTipRise + (D + crescentTipRise) * 0.5},
                                      {A * 0.55, D}));
    cmds.push_back(PathCommand::close());                  // straight fold edge x=0

    PatternPiece piece;
    piece.name = "Collar Lining";
    piece.commands = cmds;
    piece.cutInstruction =
        "cut 1 on fold + 1 interfacing on fold (Collar Lining — the under layer, "
        "cut smaller than the Collar on purpose so the outer seam rolls to the "
        "underside; its half neck edge measures " +
        std::to_string(static_cast<long>(std::lround(outNeckLen))) +
        " mm on the drawn piece)";
    piece.markings.push_back(PathCommand::move({0, dL}));
    piece.markings.push_back(PathCommand::line({0, D}));
    piece.hasGrainline = true;
    piece.grainline = Grainline{{aL * 0.35, dL * 0.55}, {aL * 0.35, D - 8}};
    piece.seamAllowance = SA;
    return piece;
}

// Stamp a short cross-tick placement notch on the neckline of a body piece at
// its centre-neck vertex (commands[0]), so the sewer knows the collar attaches
// there. Body-frame independent.
void necklineNotch(PatternPiece* piece) {
    if (!piece || piece->commands.empty()) return;
    const Point p = piece->commands[0].to;
    piece->markings.push_back(PathCommand::move({p.x - 6, p.y}));
    piece->markings.push_back(PathCommand::line({p.x + 6, p.y}));
    piece->markings.push_back(PathCommand::move({p.x, p.y - 6}));
    piece->markings.push_back(PathCommand::line({p.x, p.y + 6}));
}

} // namespace

NecklineShape necklineShapeMM(const DraftedPattern& pattern) {
    // Front is cut 1 on fold (or centre front piece) — its neckline is HALF the
    // front neckline; ×2 for the full front. Same for back. Sum both.
    // Use a non-const scan.
    const PatternPiece* front = nullptr;
    const PatternPiece* back = nullptr;
    for (const auto& p : pattern.pieces) {
        if (!front && (p.name == "Bodice Center Front" || p.name == "Bodice Front" ||
                       p.name == "Top Center Front" || p.name == "Top Front"))
            front = &p;
        if (!back && (p.name == "Bodice Back" || p.name == "Bodice Center Back" ||
                      p.name == "Top Back" || p.name == "Top Center Back"))
            back = &p;
    }
    const double frontHalf = halfNecklineLen(front);
    const double backHalf = halfNecklineLen(back);
    NecklineShape s;
    s.lengthMM = 2 * frontHalf + 2 * backHalf;
    // One on-fold collar half spans CB round the shoulder to CF: half the back
    // neckline plus half the front neckline. The two pieces are mirrored when
    // they are joined at the shoulder, so their turnings ADD (they ring the same
    // neck hole the same rotational way) — take magnitudes, not signed sums.
    s.halfTurnRad = halfNecklineTurn(back) + halfNecklineTurn(front);
    s.shoulderMM = shoulderSeamLen(front);
    return s;
}

double necklineLengthMM(const DraftedPattern& pattern) {
    return necklineShapeMM(pattern).lengthMM;
}

double flatCollarNeckTurnRad(const NecklineShape& shape) {
    // The 2 cm shoulder overlap is an arc at the shoulder TIP about the neck
    // point, so it costs the traced neck curve exactly overlap / shoulderLen
    // radians of turning — one shoulder seam per collar half.
    if (!(shape.shoulderMM > 1.0)) return 0;
    const double pivot = flatShoulderOverlapMM / shape.shoulderMM;
    return std::max(0.0, shape.halfTurnRad - pivot);
}

bool apply(DraftedPattern& pattern, CollarType type, CollarEdge edge) {
    if (type == CollarType::None) return true;

    const NecklineShape shape = necklineShapeMM(pattern);
    const double neckFull = shape.lengthMM;
    if (neckFull < 60) {
        pattern.guideSteps.push_back(
            "Collar: skipped — this garment has no measurable neckline to carry a "
            "collar.");
        return false;
    }
    // The collar spans HALF the pattern draft (CB fold to CF): the neckline we
    // draft against is measured full, so each on-fold band/collar half covers
    // half the neckline (neckFull / 2), self-mirrored across the CB fold.
    const double half = neckFull / 2;

    switch (type) {
        case CollarType::Stand:
        case CollarType::Mock: {
            const double bandH = (type == CollarType::Stand) ? standBandH : mockBandH;
            const char* label = (type == CollarType::Stand)
                ? "Stand Collar (dik yaka)" : "Mock Collar (mandarin yaka)";
            pattern.pieces.push_back(standBand(
                label, half, bandH, cfRise,
                "band stands at the neckline; ease none — the bottom edge equals the neckline"));
            pattern.guideSteps.push_back(
                std::string("Collar (") + label +
                "): the band's bottom edge is drafted to the exact neckline length "
                "and curved up at centre front so it hugs the neck. Interface one "
                "layer, fold right sides together along the top edge, stitch the "
                "ends, turn, then sew the bottom edge to the neckline matching the "
                "centre-back fold and shoulder notches. No ease — the seam lines are "
                "equal length.");
            break;
        }
        case CollarType::Flat:
        case CollarType::PeterPan: {
            const char* label = (type == CollarType::PeterPan)
                ? "Peter Pan Collar (bebe yaka)" : "Flat Collar (yatık yaka)";
            const char* edgeName = edge == CollarEdge::Pointed ? "pointed"
                                 : edge == CollarEdge::Scallop ? "scalloped" : "rounded";
            // F-K: the neck edge is TRACED off the overlapped shoulders, so it
            // curves the way the neckline curves. Length still equals the
            // neckline; the shape condition is new, the truing condition kept.
            const double turn = flatCollarNeckTurnRad(shape);
            pattern.pieces.push_back(flatCollar(
                label, half, turn, flatWidth, edge,
                std::string("lies flat on the shoulders, ") + edgeName + " outer edge"));
            pattern.guideSteps.push_back(
                std::string("Collar (") + label +
                "): drafted the way a flat collar is drafted — front and back "
                "shoulders overlapped 2 cm at the shoulder tip, the neckline traced "
                "through the overlap — so the neck edge is a curve that matches your "
                "neckline (not a straight strip, which would stand up instead of "
                "lying down). Its length still equals the garment neckline and its "
                "outer edge is " + edgeName +
                ". Interface the under-collar, sew upper to under-collar right sides "
                "together along the outer edge, clip the curves"
                + (edge == CollarEdge::Scallop ? " into each scallop point" : "") +
                ", turn and press so the seam rolls under. Sew the neck edge to the "
                "neckline matching centre back and the shoulder notches, then finish "
                "with a facing or bias binding.");
            break;
        }
        case CollarType::Shirt: {
            // Two pieces: a stand band (as mock) + a turnover blade slightly
            // wider so it covers the stand seam. Neck edge of the band = neckline.
            pattern.pieces.push_back(standBand(
                "Shirt Collar Stand (yaka bandı)", half, shirtStandH, cfRise * 0.6,
                "the button-end band the blade rolls over"));
            // The blade does NOT sew to the neckline — it sews to the stand
            // band's TOP edge, which standBand() draws straight. So its attach
            // edge is straight (turn = 0) on purpose, not by omission.
            pattern.pieces.push_back(flatCollar(
                "Shirt Collar Blade (yaka yaprağı)", half, 0.0, shirtBladeH,
                CollarEdge::Pointed, "the turnover blade; sits on the stand and rolls over the seam"));
            pattern.guideSteps.push_back(
                "Collar (Shirt Collar / gömlek yaka): a two-piece convertible collar "
                "— a stand band drafted to the neckline length plus a turnover blade "
                "cut a little deeper so it covers the stand seam. Interface both under "
                "layers. Make the blade first (stitch outer edge, clip the points, "
                "turn), sandwich it between the two stand layers, stitch the stand top "
                "edge, then sew the stand's bottom edge to the neckline matching centre "
                "back and shoulder notches.");
            break;
        }
        case CollarType::Crescent: {
            // The crescent spans the WHOLE neckline (CF tip to CF tip), minus the
            // grown button-stand jog when the front carries one: the collar ends
            // at the centre-front fold line, not at the stand edge. The jog is
            // MEASURED off the drawn front (commands[0] sits at -standWidth on a
            // grown-placket front, at the fold otherwise) — never assumed.
            const PatternPiece* fr = findPiece(pattern,
                {"Bodice Center Front", "Bodice Front", "Top Center Front", "Top Front"});
            double jog = 0;
            if (fr && !fr->commands.empty() && fr->commands[0].type == CmdType::Move)
                jog = std::max(0.0, -fr->commands[0].to.x);
            const double target = std::max(150.0, neckFull - 2 * jog);
            double collarNeck = 0, liningNeck = 0;
            pattern.pieces.push_back(crescentCollar(target, collarNeck));
            pattern.pieces.push_back(crescentLining(target, liningNeck));
            pattern.guideSteps.push_back(
                "Collar (deep U-crescent, Bugra Locket): the Collar's inner edge is "
                "drafted to your " + std::to_string(static_cast<long>(std::lround(collarNeck))) +
                " mm neck seam (centre front to centre front around the back neck); "
                "the separate Collar Lining is cut on the fold and SMALLER on "
                "purpose — sew Collar to Collar Lining right sides together along "
                "the outer edge, easing the collar to the lining, so the seam rolls "
                "to the underside when turned. Interface both per the cut notes, "
                "turn, press, then sew the collar's inner edge to the neckline "
                "matching the centre-back notch.");
            break;
        }
        case CollarType::None:
            return true;
    }

    // Re-find the front AFTER pushing pieces (push_back may have reallocated the
    // vector, invalidating any earlier pointer) and stamp the placement notch.
    PatternPiece* front = findPiece(pattern, {"Bodice Center Front", "Bodice Front",
                                              "Top Center Front", "Top Front"});
    if (front) necklineNotch(front);

    // A collar adds a little self-fabric + interfacing.
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.15, 1);
    return true;
}

} // namespace CollarBlock
} // namespace stitchu
