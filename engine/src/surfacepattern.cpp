#include "surfacepattern.hpp"
#include <cstdlib>

#include <algorithm>
#include <array>
#include <cmath>
#include <map>
#include <set>
#include <stdexcept>

namespace stitchu {

namespace {

constexpr double kPi = 3.14159265358979323846;

double levelHeight(const BodySurface& body, const std::string& name) {
    for (const BodyLevel& lv : body.levels())
        if (lv.name == name) return lv.heightMM;
    throw std::runtime_error("body level missing: " + name);
}

// The GARMENT surface is not the body surface. Cloth bridges between the
// anatomical rings — it does not enter the waist hollow (the body there has
// K<0, measured -17.8deg per bodice half; a fitted bodice skims it). So the
// garment is the RULED surface through the level rings: section semi-axes
// interpolated linearly bust->waist->hip, the hip section continued straight
// down below (sheath skirt cylinder). This is the certified model of
// flatten-research/17 generalized to the chart rings; curvature concentrates
// on the rings themselves, which is exactly where darts point.
struct GarmentSurf {
    struct Ring {
        double h;
        double a, bm, bd;  // BODY section: width, mean depth, front/back asymmetry
        double d = 0.0;    // wearing-ease offset, d = ease/(2*pi) — Steiner-exact
    };
    std::vector<Ring> rings;  // descending height: neck, shoulder, bust, waist, hip

    // easeMM: girth ease per ring, in ring order (neck, shoulder, bust, waist,
    // hip). A
    // garment with zero ease is skin and cannot be put on; the offset is the
    // OUTER PARALLEL CURVE of the body section (garmentshell.cpp theorem:
    // perimeter grows by exactly 2*pi*d, so d = ease/(2*pi), no fitted constant).
    //
    // The NECK ring is what lets a garment exist above the bust at all. Until
    // now the top ring was the bust and profile() returned the bust section
    // unchanged for every height above it — a straight cylinder of bust width
    // where the chest, shoulder and neck belong. That was invisible while the
    // dress was strapless, because nothing was ever cut up there.
    //
    // ★ THE SHOULDER IS THE FIFTH RING (Tur 5). It was the missing one, and its
    // absence was not a detail: the shoulder is the WIDEST level of this body
    // (bodysurface.cpp measured EU38 tip at 167.28mm against a bust of 159.57),
    // so a garment surface interpolated neck->bust straight through it was
    // NARROWER at shoulder height than the shoulder it is supposed to sit on.
    // Every top-boundary zone (TopProfile) is decided by a distance ACROSS the
    // body, x = shoulderHalf*cos(phi) — a shoulder-wide model — while the
    // surface being cut was a neck->bust cone. The two disagreed, and the
    // neckline, the shoulder strap and the armhole were all cut on the wrong
    // width because of it. The ring closes that gap by construction: at
    // shoulder height the garment surface is now exactly as wide as the
    // shoulder the chart declares.
    static GarmentSurf fromBody(const BodySurface& body, const double easeMM[5]) {
        GarmentSurf s;
        int k = 0;
        for (const char* name : {"neck", "shoulder", "bust", "waist", "hip"}) {
            for (const BodyLevel& lv : body.levels())
                if (lv.name == name) {
                    const Section sec = body.sectionAt(body.parameterFor(lv.heightMM));
                    // A level the chart gives as a WIDTH (the shoulder) carries
                    // its half-width as law; the lofted surface may round it off
                    // between knots, and a shoulder that is not shoulder-wide is
                    // the whole failure this ring exists to end.
                    const double a = lv.halfWidthMM > 0.0 ? lv.halfWidthMM : sec.a;
                    s.rings.push_back({lv.heightMM, a, sec.bm, sec.bd,
                                       easeMM[k] / (2 * kPi)});
                }
            ++k;
        }
        if (s.rings.size() != 5)
            throw std::runtime_error("need neck/shoulder/bust/waist/hip rings");
        return s;
    }

    double blendMM = 50.0;  // hip-corner rounding half-width (the drafting "hip curve")

    // piecewise-linear profile value with the HIP corner rounded C¹: neither a
    // body nor cloth creases sharply, and a sharp cone->cylinder ring carries
    // singular curvature no finite dart set can absorb. sel: 0=a, 1=bm, 2=bd, 3=d.
    double profile(double h, int sel) const {
        auto val = [&](const Ring& r) {
            return sel == 0 ? r.a : sel == 1 ? r.bm : sel == 2 ? r.bd : r.d;
        };
        auto lin = [&](size_t k, double hh) {  // value on segment k..k+1 (extended)
            const double u = (rings[k].h - hh) / (rings[k].h - rings[k + 1].h);
            return val(rings[k]) + (val(rings[k + 1]) - val(rings[k])) * u;
        };
        const double hipH = rings.back().h;
        if (h > hipH + blendMM) {
            if (h >= rings.front().h) return val(rings.front());
            size_t k = 0;
            while (h < rings[k + 1].h) ++k;
            return lin(k, h);
        }
        if (h < hipH - blendMM) return val(rings.back());  // cylinder below the hip
        // quadratic corner rounding: endpoints on the two lines at hip±blend,
        // control point at the corner itself (tangent-matching at both ends)
        const double t = (hipH + blendMM - h) / (2 * blendMM);
        const double pTop = lin(rings.size() - 2, hipH + blendMM);
        const double pC = val(rings.back());
        return (1 - t) * (1 - t) * pTop + 2 * t * (1 - t) * pC + t * t * pC;
    }

    // The BODY section at this height (before ease).
    Section section(double h) const {
        return Section{profile(h, 0), profile(h, 1), profile(h, 2)};
    }

    // SKIM MODE. A 1960s shift does not follow the body: it hangs from the
    // shoulders and skims. Sourced from the envelope copy of the period — the
    // Big 4 describe these as "semi-fitted", "lightly fitted and flared",
    // "four panel", and the flare is carried by PANEL SEAMS, not by dart
    // suppression (McCall's 7229, P-22, 8808; Butterick 3393; Vogue 2063).
    //
    // Geometrically that is the whole difference. A surface that follows the
    // bust and then tapers to the neck is doubly curved and its quarter panel
    // carried +52.5 deg of develop-deficit — unflattenable with waist darts
    // alone. A straight run from the waist ring to the shoulder ring is a CONE,
    // and a cone develops exactly. The shift silhouette is not a way of dodging
    // the hard problem; it is the garment whose construction the period sources
    // actually describe, and its geometry is why it could be sewn by anyone.
    double skimTopH = 0.0;   // 0 = off, follow the body as before
    double skimBaseH = 0.0;  // the waist ring — named, not searched for
    // A-LINE SKIRT: below the waist the garment does not follow the hip either.
    // It opens straight from the waist ring to a prescribed hem sweep, which is
    // what "A-line" means and is why the period patterns could be sewn flat.
    // The sweep is SOURCED, not chosen: 1960s Big-4 envelope backs print
    // "width at lower edge" for these dresses at 48.5-52.5 inches over a 36 inch
    // hip (Simplicity 7129, Vogue 6900, Vogue Couturier 2063 / Valentino).
    double hemH = 0.0, hemScale = 0.0;

    Vec3 at(double h, double phi) const {
        if (skimTopH > 0.0 && h > skimBaseH) {
            // straight (conical) run from the waist ring up to the shoulder, so
            // nothing in between bulges out to meet the bust
            const double waistH = skimBaseH, topH = skimTopH;
            {
                const double u = (h - waistH) / (topH - waistH);
                const Section a0 = section(waistH), a1 = section(topH);
                const Section mid{a0.a + (a1.a - a0.a) * u, a0.bm + (a1.bm - a0.bm) * u,
                                  a0.bd + (a1.bd - a0.bd) * u};
                const double d = profile(waistH, 3) + (profile(topH, 3) - profile(waistH, 3)) * u;
                double px = 0, py = 0;
                mid.offsetPoint(d, phi, px, py);
                return {px, py, h};
            }
        }
        if (hemScale > 0.0 && h < skimBaseH && skimBaseH > 0.0) {
            const double u = (skimBaseH - h) / (skimBaseH - hemH);
            const Section w = section(skimBaseH);
            const double k = 1.0 + (hemScale - 1.0) * u;
            const Section mid{w.a * k, w.bm * k, w.bd * k};
            double px = 0, py = 0;
            mid.offsetPoint(profile(skimBaseH, 3) * k, phi, px, py);
            return {px, py, h};
        }
        return atBody(h, phi);
    }

    Vec3 atBody(double h, double phi) const {
        // Outer parallel curve of the body section at distance d. The old code
        // had this in closed form because the section was a centred ellipse;
        // the section now has a front and a back, so the offset is taken along
        // the TRUE unit normal. Steiner is unharmed — the identity
        // P_d = P + 2*pi*d holds for ANY convex curve, which is exactly why the
        // ease conversion d = ease/(2*pi) still needs no fitted constant.
        const Section sec = section(h);
        double px = 0, py = 0;
        sec.offsetPoint(profile(h, 3), phi, px, py);
        return {px, py, h};
    }
};

struct PanelGrid {
    // rows.front() is the waist row and is SHARED ring storage, never resampled
    std::vector<std::vector<Vec3>> rows;  // rows[i][j], j across phi
};

// Rows from the waist ring outward (up for the bodice, down for the skirt).
// row 0 is copied verbatim from the single ring sample.
// THE TOP BOUNDARY of the bodice as a function of phi.
//
// A bodice panel's top edge really is single-valued across the body, which is
// why this can be a function at all: starting at the side it leaves the
// underarm, curves up and over the armhole to the shoulder tip, runs in along
// the shoulder to the neck point, and drops into the neckline at the centre.
// Reading it here by the section's own x coordinate (phi = 0 and pi are the
// SIDES, pi/2 the centre front, 3pi/2 the centre back) puts every zone boundary
// where a drafter would put it: at a distance across the body, not at an angle.
//
// The SHOULDER is entirely sourced. The line drops from the nape by its own
// slope over the distance travelled outward, which is the construction
// GarmentCode draws in 2D, and both numbers were verified rather than assumed:
// shoulder_w/2 is the shoulder tip's x (bodice.py:58, base_classes.py:37) and
// shoulder_incl is in DEGREES (body_params.py; every use site deg2rads it).
//
// The NECKLINE is NOT sourced and is not pretending to be. A neckline depth is
// a design decision, not a body measurement -- the same body wears a crew and a
// scoop -- so it is a declared dial with the back shallower than the front,
// which is the one thing about it that is universal.
// THE TOP BOUNDARY: neckline, shoulder, and — as of this operator — an ARMHOLE.
//
// Until now the shoulder line ran all the way out to the side seam, so the
// garment had no armhole at all: it was a strap closed from the neck to the
// side. That is not a sleeveless dress, it is a yoke, and no amount of getting
// the neckline right would have made it one.
//
// The armhole lives where |cos phi| is largest, which is the side. Going from
// the side seam toward the front, the boundary RISES from the underarm to the
// shoulder strap; the same happens toward the back. So it is single-valued in
// phi and fits this profile without redesigning it — a worry that turned out to
// be arithmetic, not geometry. Measured on EU38: the strap sits at phi = ±19.9
// deg, which is ±56mm around the side, and a real armhole is 10-11cm front to
// back. The span is right because it is the same span.
//
// Both numbers are Aldrich's, from the block she actually publishes for this:
//
//   "3 The close fitting sleeveless block" (Metric Pattern Cutting, 5th ed. p.28)
//     Draw new armscye depth line 1 cm above original line.
//     Mark points 3 and 4 1 cm in from shoulder edge.
//
//   and the sleeved line it moves from, p.16:
//     1-2 armscye depth measurement plus 0.5 cm
//     0-1 1.5 cm
//
//   so the sleeveless underarm sits at nape - 1.5cm - (armscye depth - 0.5cm).
//
// Armscye depth is not in our chart, and is NOT invented: Aldrich's own size
// chart is exactly linear in bust girth, 19.8 + 0.1*(bust_cm - 76), verified
// against all eight of her printed rows at zero error. So it grades itself out
// of the bust the size already carries.
//
// NOT APPLIED, and the reason is written down rather than the rule half-copied:
// the same page also removes 1.5cm from each side seam. That belongs to her
// CLOSE FITTING block, which is a fitted bodice; this garment is a 1960s skim
// whose width comes from the shift silhouette, not from a fitted block. Taking
// 3cm out of its bust girth would be copying a number across a garment it was
// not measured on.
struct TopProfile {
    double napeZ;        // the shoulder line starts here, at the centre back neck
    double tanIncl;      // shoulder slope
    double neckHalfMM;   // half the neckline WIDTH, where the shoulder starts
    double frontDropMM;  // design dial
    double backDropMM;   // design dial
    double shoulderHalfMM;
    double strapHalfMM = 0.0;  // where the shoulder ENDS and the armhole begins
    double underarmZ = 0.0;    // 0 = no armhole, shoulder runs to the side seam

    // THE ZONE IS DECIDED BY A DISTANCE THE CLOTH ACTUALLY REACHES.
    //
    // at(phi) used to compute x = shoulderHalf*cos(phi) itself and hand that to
    // the zone test. That x belongs to the SHOULDER-LEVEL section — but the
    // point being cut sits at the boundary height, where the garment section
    // has semi-axis a(z), and a(z) <= shoulderHalf everywhere below the
    // shoulder. So every zone boundary was placed at a distance across the body
    // that the surface never got to: the armhole was scooped starting from a
    // column that was really further IN than the model believed, and K6 read
    // the cloth at the shoulder point as 17-64mm low because that column was
    // already falling into the armhole.
    //
    // x and z depend on each other (the boundary height picks the section, the
    // section gives x), so the caller solves the fixed point on the real
    // surface and passes the x it converged on. The three-zone law below is
    // untouched; only the question "how far across is this column" got an
    // honest answer.
    double zAt(double x, bool front) const {
        if (underarmZ > 0.0 && x >= strapHalfMM) {
            // ARMHOLE: scoop from the strap end down to the underarm at the side
            const double strapZ = napeZ - tanIncl * strapHalfMM;
            const double span = shoulderHalfMM - strapHalfMM;
            const double u = span > 1e-9 ? (x - strapHalfMM) / span : 1.0;
            // same cosine easing as the neckline, and for the same reason: it
            // leaves the shoulder with a flat tangent instead of a corner the
            // flatten would have to absorb as a singularity, and it is flat
            // again at the side seam where the front and back arcs meet
            return strapZ - (strapZ - underarmZ) * 0.5 * (1.0 - std::cos(kPi * u));
        }
        if (x >= neckHalfMM) return napeZ - tanIncl * x;   // shoulder line
        // inside the neck width: drop below the neck point, front deeper
        const double neckPointZ = napeZ - tanIncl * neckHalfMM;
        const double drop = front ? frontDropMM : backDropMM;
        const double u = neckHalfMM > 1e-9 ? x / neckHalfMM : 1.0;
        return neckPointZ - drop * 0.5 * (1.0 + std::cos(kPi * u));
    }
};

// The fixed point: the boundary height decides the section, the section decides
// how far across the body this column is, and that distance decides which zone
// the column is in and so its height. Damped by halves.
//
// ★ THE ARMHOLE IS NOT PART OF THE FIXED POINT, and this was measured the hard
// way. Solving all three zones together lifted the underarm until the section
// happened to be as wide as the strap, and the armhole lost its depth: the
// gate's K1 fell from 332mm to 128mm — a third of a real armhole — while the
// FAIL count went DOWN, which is exactly the kind of improvement that is not
// one. The armscye depth is a drafting law (Aldrich: nape - 1.5cm - (armscye
// depth - 0.5cm)) and no section width gets to overrule it.
//
// So the fixed point runs on the shoulder and neckline branches only, where z
// really is a function of the distance across the body. The strap end is the
// place where THAT solved boundary is strapHalf wide, found by bisection, and
// the armhole is then scooped from there down to the underarm depth — in the
// angle, which is the coordinate the armhole actually has.
double solveTopH(const GarmentSurf& surf, const TopProfile& top, double phi) {
    const bool front = std::sin(phi) > 0;
    const double c = std::fabs(std::cos(phi));
    TopProfile bare = top;
    bare.underarmZ = 0.0;  // shoulder + neckline only
    // The section's x is a(z)*cos(phi) by construction, so the half-width at a
    // height is one evaluation at phi = 0 and the angle drops out of the solve.
    auto aOf = [&](double z) { return std::fabs(surf.at(z, 0.0).x); };
    auto fp = [&](double cc) {
        double x = top.shoulderHalfMM * cc;
        double z = bare.zAt(x, front);
        for (int it = 0; it < 24; ++it) {
            const double xn = 0.5 * (x + aOf(z) * cc);
            const double zn = bare.zAt(xn, front);
            const bool done = std::fabs(zn - z) < 1e-6 && std::fabs(xn - x) < 1e-6;
            x = xn;
            z = zn;
            if (done) break;
        }
        return std::pair<double, double>{x, z};
    };
    if (top.underarmZ <= 0.0) return fp(c).second;
    // widest the solved shoulder line ever gets: if it never reaches the strap
    // there is no armhole to cut and the shoulder simply runs to the side seam
    if (fp(1.0).first <= top.strapHalfMM) return fp(c).second;
    double lo = 0.0, hi = 1.0;  // fp(.).first is increasing in cc
    for (int it = 0; it < 60; ++it) {
        const double mid = 0.5 * (lo + hi);
        (fp(mid).first < top.strapHalfMM ? lo : hi) = mid;
    }
    const double cStrap = 0.5 * (lo + hi);
    if (c <= cStrap) return fp(c).second;
    const double strapZ = fp(cStrap).second;
    const double u = (c - cStrap) / std::max(1.0 - cStrap, 1e-9);
    return strapZ - (strapZ - top.underarmZ) * 0.5 * (1.0 - std::cos(kPi * u));
}

// ---- THE SHOULDER CREST FOLD (H1.0, K3/K4/K5) ----
//
// The zone coordinate is x = shoulderHalf * |cos phi|, which is the SAME
// coordinate TopProfile uses to decide neckline / shoulder / armhole and the
// same one the gate uses to classify the far arcs. It is a distance across the
// body at SHOULDER level, which is where the shoulder line is drafted, and
// keeping the fold on it means the engine and the gate cannot disagree about
// where the shoulder is. (The fixed point in solveTopH answers a different
// question — how HIGH the boundary is — and stays as it is.)
//
// weight(phi): 1 across the shoulder band [neckHalf, strapHalf], easing to 0
// at the centre and at the shoulder edge. Those two zeros are not softening:
// they are the neck hole and the armhole. The seam ends where the hole begins.
struct CrestFold {
    bool on = false;
    double neckHalfMM = 0.0, strapHalfMM = 0.0, shoulderHalfMM = 0.0;
    double seamYMM = 0.0;
    double bandMM = 0.0;

    static double ease(double u) { return 0.5 * (1.0 - std::cos(kPi * u)); }

    double weight(double phi) const {
        if (!on || bandMM <= 0.0) return 0.0;
        const double x = std::fabs(shoulderHalfMM * std::cos(phi));
        if (x >= neckHalfMM && x <= strapHalfMM) return 1.0;
        if (x < neckHalfMM) return neckHalfMM > 1e-9 ? ease(x / neckHalfMM) : 0.0;
        const double sp = shoulderHalfMM - strapHalfMM;
        if (sp <= 1e-9 || x >= shoulderHalfMM) return 0.0;
        return ease((shoulderHalfMM - x) / sp);
    }

    // Bend y onto the seam line over the top bandMM of THIS column. Nothing
    // below the band moves, so the waist ring — the one shared curve — is
    // untouched by construction, and x and z are untouched everywhere: the
    // fold is a fold, not a re-draft of the boundary.
    Vec3 apply(Vec3 p, double phi, double topZ) const {
        const double w = weight(phi);
        if (w <= 0.0) return p;
        double t = (p.z - (topZ - bandMM)) / bandMM;
        t = std::max(0.0, std::min(1.0, t));
        p.y += (seamYMM - p.y) * w * ease(t);
        return p;
    }
};

PanelGrid buildGrid(const GarmentSurf& surf,
                    const std::vector<Vec3>& ringSeg, double waistH,
                    const std::vector<double>& topH,
                    double phi0, double phi1, double rowStepMM,
                    const CrestFold& fold = {}) {
    const int cols = static_cast<int>(ringSeg.size()) - 1;
    // RAGGED TOP. topH[j] is where THIS column ends, so the far boundary can dip
    // for a neckline, ride over a shoulder and scoop for an armhole while the
    // waist row stays exactly the sampled ring. rowsN stays GLOBAL and row i of
    // every column sits at the same FRACTION of its own span — that is what
    // keeps the grid topologically rectangular, and it is why the contour walk
    // and the seam0/seam1 index pairing below keep working untouched.
    double span = 0.0;
    for (int j = 0; j <= cols; ++j) span = std::max(span, std::fabs(topH[j] - waistH));
    const int rowsN = std::max(12, static_cast<int>(std::ceil(span / rowStepMM)));
    PanelGrid g;
    g.rows.resize(rowsN + 1);
    g.rows[0] = ringSeg;  // << the single sampled ring; no second waist source exists
    for (int i = 1; i <= rowsN; ++i) {
        g.rows[i].resize(cols + 1);
        for (int j = 0; j <= cols; ++j) {
            const double phi = phi0 + (phi1 - phi0) * j / cols;
            g.rows[i][j] = fold.apply(surf.at(waistH + (topH[j] - waistH) * i / rowsN, phi),
                                      phi, topH[j]);
        }
    }
    return g;
}

double dist3(Vec3 a, Vec3 b) { return std::sqrt(dot(a - b, a - b)); }
double dist2(Vec2 a, Vec2 b) { return std::hypot(a.x - b.x, a.y - b.y); }

// A dart as a mesh SLIT: the column is split from one BOUNDARY row to (not
// including) the apex row. The flatten opens the slit into a wedge — the
// develop-deficit surfacing as geometry, not as a formula (G2).
//
// TWO ANCHORS. A waist slit runs rows [0, apexRow) and opens on the waist ring;
// a TOP slit runs rows (apexRow, rowsN] and opens on the far boundary — the
// neckline/shoulder/armhole edge. The second one is the shoulder dart and the
// neckline dart, which a bodice with shoulders needs and which could not be
// expressed at all while every slit was anchored at the waist.
struct Slit {
    int col = 0;
    int apexRow = 0;
    bool fromTop = false;  // anchor on the far row instead of the waist row
};

// PER-COLUMN DEVELOP-DEFICIT of an un-slit panel grid, in radians.
//
// A panel flattens without stretch only where the surface is developable.
// Everywhere else the Gaussian curvature has to leave through a cut, and the
// discrete amount that wants out at a vertex is its angle defect: 2*pi minus the
// angles of the triangles around it. Summing that per COLUMN says where the cuts
// belong — which is how a drafter decides where a dart goes, except measured.
//
// ROW BAND. A dart can only absorb curvature it can REACH: a waist-anchored slit
// runs from the waist row up to its apex and cannot let out anything that sits
// above it, and a top-anchored slit cannot reach below its own tip. So the same
// per-column defect is summed over a row range [iLo, iHi) rather than over the
// whole panel, and each band is answered by the darts that can get to it.
// iLo/iHi default to the full interior, which is the original behaviour.
std::vector<double> columnDeficitRows(const PanelGrid& g, int iLo, int iHi) {
    const int rowsN = static_cast<int>(g.rows.size()) - 1;
    const int cols = static_cast<int>(g.rows[0].size()) - 1;
    std::vector<double> perCol(cols + 1, 0.0);
    auto ang = [](Vec3 A, Vec3 B, Vec3 C) {
        const Vec3 u = B - A, v = C - A;
        const double lu = std::sqrt(dot(u, u)), lv = std::sqrt(dot(v, v));
        if (lu < 1e-12 || lv < 1e-12) return 0.0;
        return std::acos(std::max(-1.0, std::min(1.0, dot(u, v) / (lu * lv))));
    };
    // same triangulation as flattenGrid: (v00,v10,v01) and (v01,v10,v11)
    std::vector<double> sum((rowsN + 1) * (cols + 1), 0.0);
    auto idx = [&](int i, int j) { return i * (cols + 1) + j; };
    for (int i = 0; i < rowsN; ++i)
        for (int j = 0; j < cols; ++j) {
            const Vec3 v00 = g.rows[i][j], v10 = g.rows[i + 1][j];
            const Vec3 v01 = g.rows[i][j + 1], v11 = g.rows[i + 1][j + 1];
            sum[idx(i, j)] += ang(v00, v10, v01);
            sum[idx(i + 1, j)] += ang(v10, v01, v00);
            sum[idx(i, j + 1)] += ang(v01, v00, v10);
            sum[idx(i, j + 1)] += ang(v01, v10, v11);
            sum[idx(i + 1, j)] += ang(v10, v11, v01);
            sum[idx(i + 1, j + 1)] += ang(v11, v01, v10);
        }
    const int lo = std::max(1, iLo), hi = std::min(rowsN, iHi);
    for (int i = lo; i < hi; ++i)
        for (int j = 1; j < cols; ++j) perCol[j] += 2 * kPi - sum[idx(i, j)];
    return perCol;
}

std::vector<double> columnDeficit(const PanelGrid& g) {
    return columnDeficitRows(g, 1, static_cast<int>(g.rows.size()) - 1);
}

// Dart columns DERIVED from that deficit rather than declared as fractions.
//
// This is the step the symmetric-ellipse body never needed: with a front and a
// back, the two halves no longer carry the same amount. Measured on EU38, the
// skirt back wants +23.09 deg out and the skirt front only +7.64 — three times
// as much through the same two darts, which is where the interior strain came
// from. So the count follows the load: enough darts that none carries more than
// capRad, each sitting at the centroid of its own share of the deficit.
// Negative (saddle) bands are clamped to zero for placement: a dart cannot fix a
// saddle, and pretending it can would move the real darts to the wrong columns.
struct DerivedDart {
    int col;
    double loadRad;  // the share of the panel's deficit this dart has to carry
    bool fromTop = false;  // anchored on the far boundary, not on the waist ring
};

std::vector<DerivedDart> dartColumnsFromDeficitRows(const PanelGrid& g, double capRad, int iLo,
                                                   int iHi, bool fromTop) {
    const std::vector<double> def = columnDeficitRows(g, iLo, iHi);
    const int cols = static_cast<int>(def.size()) - 1;
    if (cols < 4 || capRad <= 0.0) return {};

    // A PANEL EDGE IS ITSELF A SEAM, and a seam absorbs suppression next to it —
    // that is why a drafter never puts a dart hard against a side seam. The two
    // vertical edges of this sub-panel are the princess/centre and the side
    // seam, both free to curve, so the deficit lying near them leaves through
    // them and wants no dart at all. Weighting each column's deficit by its
    // distance to the nearer edge says that in one line.
    //
    // This was found by measurement, not by taste: placing the back skirt's
    // darts at plain equal-deficit quantiles put them 8 columns from the edges
    // and the interior strain went 3.58% -> 16.35%, worse than the single
    // middle dart it replaced, while the FRONT improved 3.39% -> 0.86%. Equal
    // shares are the wrong law; distance to a seam is the missing term.
    std::vector<double> w(cols + 1, 0.0);
    double total = 0.0, weighted = 0.0;
    for (int j = 1; j < cols; ++j) {
        const double d = std::max(0.0, def[j]);
        total += d;
        w[j] = d * std::min(j, cols - j) / (0.5 * cols);  // 0 at a seam, 1 mid-panel
        weighted += w[j];
    }
    // A DART WITH NOTHING TO ABSORB IS NOT A DART. Once the garment surface is
    // conical the deficit is zero, and a slit opened anyway is a degenerate
    // wedge: it splits the waist run, so the bodice run and the skirt run stop
    // spanning the same ring arc and the waist deed jumped to +1.4812mm. Below
    // half a degree there is nothing to let out and the panel is cut whole.
    const double kNothingToAbsorbRad = 0.5 * kPi / 180.0;
    if (total <= kNothingToAbsorbRad || weighted <= 0.0) return {};

    // The COUNT still follows the load the darts actually have to carry.
    const int n = std::max(1, static_cast<int>(std::ceil(weighted / capRad - 1e-9)));
    std::vector<DerivedDart> out;
    double run = 0.0;
    int k = 0;
    for (int j = 1; j < cols && k < n; ++j) {
        run += w[j];
        while (k < n && run >= (k + 0.5) / n * weighted) {
            if (out.empty() || out.back().col != j) out.push_back({j, total / n, fromTop});
            ++k;
        }
    }
    return out;
}

std::vector<DerivedDart> dartColumnsFromDeficit(const PanelGrid& g, double capRad) {
    return dartColumnsFromDeficitRows(g, capRad, 1, static_cast<int>(g.rows.size()) - 1, false);
}

SurfacePanel flattenGrid(const PanelGrid& g, const std::string& name,
                         const std::vector<Slit>& slits, const std::vector<int>& breakCols,
                         const SheathOptions& opt) {
    const int rowsN = static_cast<int>(g.rows.size()) - 1;
    const int cols = static_cast<int>(g.rows[0].size()) - 1;

    // ---- mesh with duplicated slit columns ----
    TriMesh mesh;
    std::vector<int> base((rowsN + 1) * (cols + 1), -1);
    auto gi = [&](int i, int j) { return i * (cols + 1) + j; };
    for (int i = 0; i <= rowsN; ++i)
        for (int j = 0; j <= cols; ++j) {
            base[gi(i, j)] = static_cast<int>(mesh.V.size());
            mesh.V.push_back(g.rows[i][j]);
        }
    // right-side copies of split vertices. A waist slit duplicates rows
    // [0, apexRow); a top slit duplicates (apexRow, rowsN]. The apex vertex
    // itself is never duplicated — that is what makes it the tip of a wedge
    // rather than a second cut.
    std::map<std::pair<int, int>, int> dup;  // (i, col) -> vertex id
    for (const Slit& s : slits) {
        const int lo = s.fromTop ? s.apexRow + 1 : 0;
        const int hi = s.fromTop ? rowsN : s.apexRow - 1;
        for (int i = lo; i <= hi; ++i) {
            dup[{i, s.col}] = static_cast<int>(mesh.V.size());
            mesh.V.push_back(g.rows[i][s.col]);
        }
    }
    auto vid = [&](int i, int j, bool fromRight) {
        if (fromRight) {
            auto it = dup.find({i, j});
            if (it != dup.end()) return it->second;
        }
        return base[gi(i, j)];
    };
    for (int i = 0; i < rowsN; ++i)
        for (int j = 0; j < cols; ++j) {
            // a cell's LEFT edge lies on column j: use right copies there;
            // its right edge (column j+1) is approached from the left.
            const int v00 = vid(i, j, true), v10 = vid(i + 1, j, true);
            const int v01 = vid(i, j + 1, false), v11 = vid(i + 1, j + 1, false);
            mesh.F.push_back({v00, v10, v01});
            mesh.F.push_back({v01, v10, v11});
        }

    // proven development init: per-row cumulative chord for x, height for y
    std::vector<Vec2> P0(mesh.V.size());
    for (int i = 0; i <= rowsN; ++i) {
        double x = 0.0;
        for (int j = 0; j <= cols; ++j) {
            if (j) x += dist3(g.rows[i][j], g.rows[i][j - 1]);
            P0[base[gi(i, j)]] = {x, g.rows[i][j].z - g.rows[0][j].z};
        }
    }
    for (const auto& [key, id] : dup) P0[id] = P0[base[gi(key.first, key.second)]];

    // pin away from any slit so the anchor never sits on a dart leg. The far
    // row used to be slit-free by construction; with top anchors it is not, so
    // the pin walks off any top slit column instead of assuming.
    int pinCol = cols / 2;
    auto topSlitAtCol = [&](int c) {
        for (const Slit& s : slits)
            if (s.fromTop && s.col == c) return true;
        return false;
    };
    while (pinCol > 0 && topSlitAtCol(pinCol)) --pinCol;
    const int pinV = base[gi(rowsN, pinCol)];
    std::vector<Vec2> P = arapFlatten(mesh, P0, pinV, opt.arapRounds);
    // polish with the metric LOCKED onto cut lines: boundary edges (incl. dart
    // legs) carry the sewing contract, the interior carries the ease budget
    std::vector<char> onCut(mesh.V.size(), 0);
    for (int j = 0; j <= cols; ++j) onCut[base[gi(0, j)]] = onCut[base[gi(rowsN, j)]] = 1;
    for (int i = 0; i <= rowsN; ++i) onCut[base[gi(i, 0)]] = onCut[base[gi(i, cols)]] = 1;
    for (const Slit& s : slits) {
        const int lo = s.fromTop ? s.apexRow : 0;
        const int hi = s.fromTop ? rowsN : s.apexRow;
        for (int i = lo; i <= hi; ++i)
            onCut[vid(i, s.col, false)] = onCut[vid(i, s.col, true)] = 1;
    }
    // ALTERNATE, do not yank at the end.
    //
    // Projecting the cut edges onto their 3D lengths only AFTER the energy has
    // finished gets the lengths exactly right and leaves the seam zigzagging:
    // every edge is correct and the polyline is not smooth, so the curve fitter
    // chases the wiggle and a side seam came out as 42 segments over 48 points.
    // A pattern edge is meant to be a handful of curves.
    //
    // So the constraint moves inside the loop, which is what position-based
    // dynamics does: relax a little, project, relax again. The interior settles
    // INTO the constrained boundary instead of being pulled away from it, and
    // the seam ends up both exact and smooth.
    {
        const int pin = pinV;
        const int rounds = std::max(1, opt.cutRounds);
        for (int r = 0; r < rounds; ++r) {
            strainPolishWeighted(mesh, P, onCut, opt.cutEmphasis, pin,
                                 std::max(1, opt.polishIters / rounds));
            enforceCutLengths(mesh, P, onCut, pin, opt.cutSweeps / rounds);
        }
    }

    SurfacePanel out;
    out.name = name;
    out.maxStrain = maxStrain(mesh, P);

    if (std::getenv("STITCHU_SP_DEBUG")) {
        // WHERE THE DEFICIT IS, band by band. A panel can only be flattened
        // without stretch where the surface is developable; everywhere else the
        // Gaussian curvature has to leave through a cut. Summing the discrete
        // angle defect (2*pi minus the incident angles) over the INTERIOR
        // vertices of each row band says exactly how much wants out and where —
        // and the darts' measured openings say how much actually got out. If the
        // two disagree, the difference is the interior strain, by definition.
        std::vector<double> defBand(13, 0.0);
        std::vector<double> angSum(mesh.V.size(), 0.0);
        std::vector<char> onBoundary(mesh.V.size(), 0);
        for (const auto& f : mesh.F) {
            const int id[3] = {f[0], f[1], f[2]};
            for (int c = 0; c < 3; ++c) {
                const Vec3 A = mesh.V[id[c]], B = mesh.V[id[(c + 1) % 3]], C = mesh.V[id[(c + 2) % 3]];
                const Vec3 u = B - A, v = C - A;
                const double lu = std::sqrt(dot(u, u)), lv = std::sqrt(dot(v, v));
                if (lu > 1e-12 && lv > 1e-12)
                    angSum[id[c]] += std::acos(std::max(-1.0, std::min(1.0, dot(u, v) / (lu * lv))));
            }
        }
        for (int i = 0; i <= rowsN; ++i)
            for (int j = 0; j <= cols; ++j)
                if (i == 0 || i == rowsN || j == 0 || j == cols)
                    onBoundary[base[gi(i, j)]] = 1;
        for (const auto& [key, id] : dup) { onBoundary[id] = 1; onBoundary[base[gi(key.first, key.second)]] = 1; }
        for (int i = 0; i <= rowsN; ++i)
            for (int j = 0; j <= cols; ++j) {
                const int v = base[gi(i, j)];
                if (onBoundary[v]) continue;
                const int band = std::min(12, i * 12 / std::max(1, rowsN));
                defBand[band] += 2 * kPi - angSum[v];
            }
        double defTotal = 0;
        for (double d : defBand) defTotal += d;
        std::fprintf(stderr, "  [%s] DEFICIT toplam %+8.4f deg | bant:", name.c_str(),
                     defTotal * 180.0 / kPi);
        for (double d : defBand) std::fprintf(stderr, " %+.2f", d * 180.0 / kPi);
        std::fprintf(stderr, "\n");

        // strain map by row band: where does the residual live?
        for (int i = 0; i <= rowsN; i += std::max(1, rowsN / 12)) {
            double hor = 0, ver = 0;
            for (int j = 0; j < cols; ++j) {
                const int a = vid(i, j, true), b = vid(i, j + 1, false);
                const double l3 = dist3(mesh.V[a], mesh.V[b]);
                const double l2 = std::hypot(P[a].x - P[b].x, P[a].y - P[b].y);
                hor = std::max(hor, std::fabs(l2 - l3) / l3);
                if (i < rowsN) {
                    const int c = vid(i, j, true), d = vid(i + 1, j, true);
                    const double m3 = dist3(mesh.V[c], mesh.V[d]);
                    const double m2 = std::hypot(P[c].x - P[d].x, P[c].y - P[d].y);
                    ver = std::max(ver, std::fabs(m2 - m3) / m3);
                }
            }
            std::fprintf(stderr, "  [%s] row %3d  hor %6.3f%%  ver %6.3f%%\n",
                         name.c_str(), i, hor * 100, ver * 100);
        }
    }

    // ---- contour walk: waist row with dart excursions, then round the panel ----
    std::vector<int> cv;                      // contour as mesh vertex ids
    auto push = [&](int meshId, std::vector<int>* sink) {
        if (!cv.empty() && sink) sink->push_back(static_cast<int>(cv.size()) - 1);
        cv.push_back(meshId);
    };
    // A TOP slit never touches the waist row, so it neither appears in the waist
    // walk nor breaks a waist seam run. That is the whole point of the anchor:
    // suppression can now be taken out of the garment without cutting the one
    // shared ring.
    std::map<int, const Slit*> slitAt, topSlitAt;
    for (const Slit& s : slits) (s.fromTop ? topSlitAt : slitAt)[s.col] = &s;
    std::set<int> breakAt(breakCols.begin(), breakCols.end());
    for (const auto& [c, s] : slitAt) breakAt.insert(c);
    std::vector<int> run;  // the current waist seam-run

    // dart legs are TRUED: each leg is one straight contour edge from its ring
    // point to the apex, exactly how a drafter draws a dart. Straight legs of
    // a proper wedge cannot self-intersect, and the referee (walk.py) sees the
    // one-edge-per-leg shape a generator dart has. The 3D reference length of
    // a leg is the slit column's surface polyline, kept in legRef3D.
    std::map<int, double> legRef3D;  // contour edge index -> 3D reference mm
    std::vector<int> apexPos;        // contour position of each dart apex
    push(vid(0, 0, false), nullptr);
    std::vector<SurfacePanel::Dart> darts(slits.size());
    for (int j = 1; j <= cols; ++j) {
        push(vid(0, j, false), &out.waistEdges);  // ring arc — the shared source
        run.push_back(out.waistEdges.back());
        if ((breakAt.count(j) && j < cols) || j == cols) {
            out.waistRuns.push_back(run);
            run.clear();
        }
        auto it = slitAt.find(j);
        if (it != slitAt.end() && j < cols) {
            const Slit& s = *it->second;
            size_t d = 0;
            while (slits[d].col != s.col) ++d;
            double colLen = 0.0;
            for (int i = 0; i < s.apexRow; ++i) colLen += dist3(g.rows[i][j], g.rows[i + 1][j]);
            apexPos.push_back(static_cast<int>(cv.size()));  // trued after P lands
            push(base[gi(s.apexRow, j)], &darts[d].legA);  // straight leg up
            legRef3D[darts[d].legA.back()] = colLen;
            std::vector<int> down;
            push(vid(0, j, true), &down);                  // straight leg down
            legRef3D[down.back()] = colLen;
            darts[d].legB = down;
        }
    }
    for (int i = 1; i <= rowsN; ++i) push(base[gi(i, cols)], &out.seam1Edges);
    {
        // The far row is walked with phi DESCENDING, so a top slit is met from
        // its RIGHT side first (the duplicated copy), goes down to the apex, and
        // comes back up on the left (base) — the mirror image of the waist walk,
        // and consistent with the triangulation, where column j's left-hand cell
        // takes the base copy and its right-hand cell takes the duplicate.
        std::vector<int> far;
        for (int j = cols - 1; j >= 0; --j) {
            auto it = topSlitAt.find(j);
            if (it != topSlitAt.end() && j > 0) {
                const Slit& s = *it->second;
                size_t d = 0;
                while (slits[d].col != s.col || !slits[d].fromTop) ++d;
                double colLen = 0.0;
                for (int i = s.apexRow; i < rowsN; ++i)
                    colLen += dist3(g.rows[i][j], g.rows[i + 1][j]);
                push(vid(rowsN, j, true), &far);   // far arc into the right leg top
                apexPos.push_back(static_cast<int>(cv.size()));
                push(base[gi(s.apexRow, j)], &darts[d].legA);  // straight leg down
                legRef3D[darts[d].legA.back()] = colLen;
                std::vector<int> up;
                push(base[gi(rowsN, j)], &up);                 // straight leg up
                legRef3D[up.back()] = colLen;
                darts[d].legB = up;
                continue;
            }
            push(base[gi(rowsN, j)], &far);
        }
        std::reverse(far.begin(), far.end());                       // phi ascending
        out.farEdges = far;
    }
    std::vector<int> side0;
    for (int i = rowsN - 1; i >= 1; --i) push(vid(i, 0, false), &side0);
    side0.push_back(static_cast<int>(cv.size()) - 1);               // closing edge
    std::reverse(side0.begin(), side0.end());                       // row ascending
    out.seam0Edges = side0;

    out.contour.reserve(cv.size());
    for (int id : cv) out.contour.push_back(P[id]);
    const int n = static_cast<int>(out.contour.size());

    // TRUE each dart, the way a drafter does: the apex moves onto the
    // perpendicular bisector of its two waist points at the mean leg length,
    // so the two legs a sewist brings together are EQUAL by construction.
    for (size_t d = 0; d < apexPos.size(); ++d) {
        const int ap = apexPos[d];
        const Vec2 wl = out.contour[(ap - 1 + n) % n], wr = out.contour[(ap + 1) % n];
        const Vec2 apx = out.contour[ap];
        const double lm = 0.5 * (std::hypot(apx.x - wl.x, apx.y - wl.y) +
                                 std::hypot(apx.x - wr.x, apx.y - wr.y));
        const Vec2 mid{0.5 * (wl.x + wr.x), 0.5 * (wl.y + wr.y)};
        double px = -(wr.y - wl.y), py = wr.x - wl.x;
        const double pn = std::hypot(px, py);
        if (pn > 1e-9) {
            px /= pn;
            py /= pn;
            if (px * (apx.x - mid.x) + py * (apx.y - mid.y) < 0) { px = -px; py = -py; }
            const double half = 0.5 * std::hypot(wr.x - wl.x, wr.y - wl.y);
            const double drop = std::sqrt(std::max(lm * lm - half * half, 0.0));
            out.contour[ap] = {mid.x + px * drop, mid.y + py * drop};
        }
    }

    for (int k = 0; k < n; ++k) {
        const auto ref = legRef3D.find(k);
        const double l3 = ref != legRef3D.end()
                              ? ref->second
                              : dist3(mesh.V[cv[k]], mesh.V[cv[(k + 1) % n]]);
        const double l2 = dist2(out.contour[k], out.contour[(k + 1) % n]);
        out.boundaryStrain = std::max(out.boundaryStrain, std::fabs(l2 - l3) / std::max(l3, 1e-9));
    }

    if (std::getenv("STITCHU_SP_DEBUG")) {
        auto sideWorst = [&](const std::vector<int>& edges) {
            double w = 0;
            for (int e : edges) {
                const double l3 = dist3(mesh.V[cv[e]], mesh.V[cv[(e + 1) % n]]);
                const double l2 = dist2(out.contour[e], out.contour[(e + 1) % n]);
                w = std::max(w, std::fabs(l2 - l3) / std::max(l3, 1e-9));
            }
            return w * 100;
        };
        double legW = 0;
        for (const auto& d : darts) {
            legW = std::max(legW, sideWorst(d.legA) / 100);
            legW = std::max(legW, sideWorst(d.legB) / 100);
        }
        std::fprintf(stderr, "  [%s] sınır: bel %.3f%%  yan0 %.3f%%  yan1 %.3f%%  uç %.3f%%  pens %.3f%%\n",
                     name.c_str(), sideWorst(out.waistEdges), sideWorst(out.seam0Edges),
                     sideWorst(out.seam1Edges), sideWorst(out.farEdges), legW * 100);
    }

    for (int e : out.waistEdges)
        out.waistLenMM += dist2(out.contour[e], out.contour[(e + 1) % n]);

    // measured wedge opening per dart (chord angle waist->apex, both legs)
    for (size_t d = 0; d < slits.size(); ++d) {
        const Slit& s = slits[d];
        const int mouth = s.fromTop ? rowsN : 0;  // the row the wedge opens on
        const Vec2 apex = P[base[gi(s.apexRow, s.col)]];
        const Vec2 wl = P[vid(mouth, s.col, false)], wr = P[vid(mouth, s.col, true)];
        const double angL = std::atan2(wl.y - apex.y, wl.x - apex.x);
        const double angR = std::atan2(wr.y - apex.y, wr.x - apex.x);
        double sp = std::fmod(angL - angR + kPi, 2 * kPi);
        if (sp < 0) sp += 2 * kPi;
        darts[d].openingDeg = std::fabs(sp - kPi) * 180.0 / kPi;
    }
    out.darts = darts;
    return out;
}

}  // namespace

SurfacePattern buildSheathPattern(const BodySurface& body, const SheathOptions& opt) {
    const double bustH = levelHeight(body, "bust");
    const double waistH = levelHeight(body, "waist");
    const double hipH = levelHeight(body, "hip");
    const double hemH = hipH - opt.hemDropBelowHipMM;

    // The neck ring carries ZERO wearing ease and that is a declaration, not an
    // omission: a neckline is CUT, not fitted, so there is no girth to ease at
    // that ring. It exists to give the surface a shape above the bust.
    // The SHOULDER ring carries zero wearing ease for the same reason the neck
    // does, and it is a declaration: the shoulder half-width is a WIDTH the
    // chart gives, not a girth to be eased, and a garment does not stand off
    // the shoulder — it rests on it.
    const double easeMM[5] = {opt.easeNeckMM, 0.0, opt.easeBustMM, opt.easeWaistMM,
                              opt.easeHipMM};
    GarmentSurf surf = GarmentSurf::fromBody(body, easeMM);

    // the top boundary, built once from the chart's own shoulder numbers
    const double napeZ = levelHeight(body, "neck");
    double shoulderHalf = 0.0, tanIncl = 0.0, shoulderLevelH = 0.0;
    for (const BodyLevel& lv : body.levels())
        if (lv.name == "shoulder") {
            shoulderHalf = lv.halfWidthMM;
            shoulderLevelH = lv.heightMM;
            tanIncl = (napeZ - lv.heightMM) / shoulderHalf;  // exactly the slope used to place it
        }
    if (shoulderHalf <= 0.0)
        throw std::runtime_error("body has no shoulder level: a bodice cannot be cut");
    // THE NECKLINE IS DRAFTED FROM THE NECK MEASUREMENT, not chosen. Aldrich
    // works off one fifth of the neck size (5th ed. p.16), so every size draws
    // its own neckline out of its own chart row and there is no constant to go
    // stale between sizes. See SheathOptions for the three sources that agree.
    double neckGirthMM = 0.0;
    for (const BodyLevel& lv : body.levels())
        if (lv.name == "neck") neckGirthMM = lv.girthMM;
    if (neckGirthMM <= 0.0)
        throw std::runtime_error("body has no neck girth: the neckline cannot be drafted");
    const double fifthNeck = neckGirthMM / 5.0;
    const double neckHalfMM = fifthNeck + opt.neckWidthCoefCM * 10.0;
    const double frontDropMM = fifthNeck + opt.frontNeckDropCoefCM * 10.0;
    // ARMHOLE (Aldrich sleeveless block, p.28 + p.16 — see TopProfile).
    // armscye depth grades itself out of the bust: 19.8 + 0.1*(bust_cm - 76) cm,
    // which reproduces all eight of Aldrich's printed rows exactly.
    double bustGirthMM = 0.0;
    for (const BodyLevel& lv : body.levels())
        if (lv.name == "bust") bustGirthMM = lv.girthMM;
    const double armscyeDepthMM = 198.0 + 1.0 * (bustGirthMM / 10.0 - 76.0);
    const double strapHalfMM = shoulderHalf - opt.shoulderNarrowMM;
    const double underarmZ = opt.armhole
                                 ? napeZ - 15.0 - (armscyeDepthMM - 5.0)
                                 : 0.0;
    const TopProfile top{napeZ,        tanIncl,          neckHalfMM, frontDropMM,
                         opt.backNeckDropMM, shoulderHalf, strapHalfMM, underarmZ};
    CrestFold fold;
    fold.on = opt.shoulderTop && opt.shoulderSeam && opt.armhole;
    fold.neckHalfMM = neckHalfMM;
    fold.strapHalfMM = strapHalfMM;
    fold.shoulderHalfMM = shoulderHalf;
    fold.seamYMM = opt.shoulderSeamForwardMM;
    fold.bandMM = opt.shoulderCrestBandMM;
    if (opt.skimBodice) {
        surf.skimTopH = napeZ - tanIncl * shoulderHalf;  // shoulder tip
        surf.skimBaseH = waistH;                          // the single shared ring
        if (opt.hemSweepMM > 0.0) {
            surf.hemH = hemH;
            // scale the waist section until its perimeter reaches the sourced sweep
            const Section w = surf.section(waistH);
            const double base = w.perimeter(24) + 2 * kPi * surf.profile(waistH, 3);
            surf.hemScale = opt.hemSweepMM / base;
        }
    }
    surf.blendMM = opt.hipBlendMM;

    // THE ring: sampled once, at the waist, over the full circle.
    const int NR = opt.ringSamples;
    if (NR % 2) throw std::runtime_error("ringSamples must be even (two halves)");
    std::vector<Vec3> ring(NR + 1);
    for (int j = 0; j <= NR; ++j) ring[j] = surf.at(waistH, 2 * kPi * j / NR);

    SurfacePattern pat;
    for (int j = 0; j < NR; ++j) pat.ringGirthMM += dist3(ring[j], ring[j + 1]);
    const int half = NR / 2;

    // ---- cut each half into sub-panels at the declared princess columns ----
    struct GarmentLayer {
        bool isSkirt;
        double farH;                   // representative far height (dart apex scale)
        std::vector<double> topH;      // per RING COLUMN, size NR+1 — the second law
        const char* fname;  // front half base name
        const char* bname;  // back half base name
        const std::vector<double>* cutFracs;
        const std::vector<double>* dartFracs;
        // panel indices per half, in phi order — for princess/side stitches
        std::vector<int> frontSubs, backSubs;
    };
    GarmentLayer layers[2] = {
        {false, bustH, {}, "ftorso", "btorso", &opt.bodiceCutFracs, &opt.bodiceDartFracs, {}, {}},
        {true, hemH, {}, "skirt_front", "skirt_back", &opt.skirtCutFracs, &opt.skirtDartFracs, {}, {}},
    };
    // ★ SECOND LAW: the top boundary is sampled ONCE over the whole circle, on
    // the same NR columns as the waist ring, and every panel CUTS its own top
    // out of that one array. The waist ring law killed a 2.947mm class of error
    // by removing the second source of the waist number; a top boundary each
    // panel computed for itself would let the same class back in from above.
    for (GarmentLayer& L : layers) {
        L.topH.assign(NR + 1, L.farH);
        if (!L.isSkirt && opt.shoulderTop)
            for (int j = 0; j <= NR; ++j) L.topH[j] = solveTopH(surf, top, 2 * kPi * j / NR);
    }

    // ---- K6: THE ENGINE CAN NOW BE ASKED WHETHER IT CARRIES (docs/H1.0-KAPI.md) ----
    //
    // The gate's sixth condition is whether the garment's top boundary reaches
    // the shoulder, and until this line the engine could not be asked: the top
    // boundary lived entirely inside this .cpp. Refusing to answer is not a
    // pass and is not a fail — it is a missing instrument, and H1.0 owes the
    // instrument as much as it owes the geometry.
    //
    // MEASURED ON THE SURFACE, NOT ON THE MODEL. The zone model (TopProfile)
    // decides where the shoulder is by x = shoulderHalf*cos(phi); the SURFACE
    // puts the same column at x = a(h)*cos(phi). Asking the model would answer
    // a question about itself. So the columns are evaluated as 3D points and
    // the one whose |x| lands nearest the shoulder point (Aldrich's 1 cm in
    // from the shoulder edge, the same inset the armhole uses) is the one the
    // question is about. Front and back halves are measured separately and the
    // WORSE of the two is reported: a garment held up on one side only is not
    // held up.
    //
    // INTERPOLATED, NOT SNAPPED, and that is not a nicety. The armhole scoop
    // begins at exactly this x, so the boundary height has a corner there: one
    // ring column inside it is the shoulder line, one column outside it is
    // already falling toward the underarm. Snapping to the nearest column makes
    // the answer depend on which side of the corner 128 columns happen to land
    // — measured, EU46 read +4.35mm and EU48 read -60.68mm on the same
    // geometry. So the two columns that BRACKET the shoulder point are found
    // and the height is read between them.
    {
        const double xTarget = shoulderHalf - opt.shoulderNarrowMM;
        double bestZ[2] = {0.0, 0.0}, bestDx[2] = {1e18, 1e18};
        double bestX[2] = {0.0, 0.0};
        const std::vector<double>& tH = layers[0].topH;
        double prevX[2] = {-1.0, -1.0}, prevZ[2] = {0.0, 0.0};
        for (int j = 0; j <= NR; ++j) {
            const double phi = 2 * kPi * j / NR;
            const Vec3 p = surf.at(tH[j], phi);
            const int half2 = std::sin(phi) >= 0.0 ? 0 : 1;  // 0 front, 1 back
            const double x = std::fabs(p.x);
            bestX[half2] = std::max(bestX[half2], x);
            // bracket: consecutive columns of the same half straddling xTarget
            if (prevX[half2] >= 0.0 &&
                ((prevX[half2] - xTarget) * (x - xTarget) <= 0.0) &&
                std::fabs(x - prevX[half2]) > 1e-9) {
                const double u = (xTarget - prevX[half2]) / (x - prevX[half2]);
                bestZ[half2] = prevZ[half2] + (p.z - prevZ[half2]) * u;
                bestDx[half2] = 0.0;
                if (std::getenv("STITCHU_TOP_DEBUG"))
                    std::fprintf(stderr, "  XCROSS j=%3d half=%d prevX=%8.3f x=%8.3f u=%.4f z=%9.3f\n",
                                 j, half2, prevX[half2], x, u, bestZ[half2]);
            } else if (bestDx[half2] > 0.0 && std::fabs(x - xTarget) < bestDx[half2]) {
                bestDx[half2] = std::fabs(x - xTarget);  // never reached: nearest column
                bestZ[half2] = p.z;
            }
            prevX[half2] = x;
            prevZ[half2] = p.z;
        }
        if (std::getenv("STITCHU_TOP_DEBUG")) {
            for (int j = 0; j <= NR / 4; ++j) {
                const double phi = 2 * kPi * j / NR;
                const Vec3 p = surf.at(tH[j], phi);
                std::fprintf(stderr,
                             "  TOP j=%3d phi=%7.3fdeg  x=%8.3f y=%8.3f z=%9.3f  "
                             "carry=%+8.3f  modelx=%8.3f\n",
                             j, phi * 180.0 / kPi, p.x, p.y, p.z, p.z - shoulderLevelH,
                             shoulderHalf * std::cos(phi));
            }
            std::fprintf(stderr, "  TOP nape=%.3f shoulderH=%.3f tanIncl=%.5f strap=%.3f neck=%.3f underarmZ=%.3f\n",
                         napeZ, shoulderLevelH, tanIncl, strapHalfMM, neckHalfMM, underarmZ);
        }
        pat.shoulderLevelMM = shoulderLevelH;
        pat.shoulderPointXMM = xTarget;
        pat.frontCarryMM = bestZ[0] - shoulderLevelH;
        pat.backCarryMM = bestZ[1] - shoulderLevelH;
        pat.carryReachXMM = std::max(bestX[0], bestX[1]);
        pat.shoulderCarryMM = std::min(pat.frontCarryMM, pat.backCarryMM);
    }

    // ---- sub-panel column bounds, shared by both passes ----
    auto boundsFor = [&](const GarmentLayer& L) {
        std::vector<int> b = {0};
        for (double f : *L.cutFracs) {
            const int c = static_cast<int>(std::lround(half * f));
            if (c > b.back() && c < half) b.push_back(c);
        }
        b.push_back(half);
        return b;
    };

    // ---- PASS A: where do the darts go? ----
    // Measure first, cut second. Each sub-panel's grid is built (cheap; the
    // flatten is the expensive half) and its develop-deficit decides the dart
    // columns. This has to happen for BOTH layers before either is flattened,
    // because the waist seam must break wherever either layer darts — otherwise
    // a bodice run and a skirt run would span different ring arcs and the one
    // shared waist curve would stop being shared.
    // Dart columns are stored as ABSOLUTE RING COLUMNS, not as offsets inside a
    // sub-panel. The two layers may be cut into different numbers of panels, so
    // a sub-panel index means nothing across layers — and the waist seam has to
    // break wherever EITHER layer darts, which is a statement about the ring.
    std::map<const GarmentLayer*, std::vector<DerivedDart>> dartCols;
    for (const GarmentLayer& L : layers) {
        const std::vector<int> bounds = boundsFor(L);
        for (int h = 0; h < 2; ++h) {
            auto& abs = dartCols[&L];
            for (size_t s = 0; s + 1 < bounds.size(); ++s) {
                const int c0 = h * half + bounds[s], c1 = h * half + bounds[s + 1];
                if (opt.maxDartDeg > 0.0) {
                    const std::vector<Vec3> seg(ring.begin() + c0, ring.begin() + c1 + 1);
                    const std::vector<double> topSeg(L.topH.begin() + c0, L.topH.begin() + c1 + 1);
                    const PanelGrid g = buildGrid(surf, seg, waistH, topSeg,
                                                  2 * kPi * c0 / NR, 2 * kPi * c1 / NR,
                                                  opt.rowStepMM, L.isSkirt ? CrestFold{} : fold);
                    // TWO BANDS, TWO ANCHORS. Only a bodice with a real top
                    // boundary has anywhere for a top dart to open: a skirt's
                    // far edge is the hem, and a hem dart is not a thing. So
                    // the split is asked for exactly where it means something,
                    // and everywhere else the call is the original whole-panel
                    // one, unchanged.
                    const int gRows = static_cast<int>(g.rows.size()) - 1;
                    const bool twoBand =
                        !L.isSkirt && opt.shoulderTop && opt.topDartSplitFrac < 1.0;
                    const int split =
                        twoBand ? std::max(2, static_cast<int>(std::lround(
                                                 gRows * opt.topDartSplitFrac)))
                                : gRows;
                    const double capRad = opt.maxDartDeg * kPi / 180.0;
                    for (const DerivedDart& d :
                         dartColumnsFromDeficitRows(g, capRad, 1, split, false))
                        abs.push_back({c0 + d.col, d.loadRad, false});
                    if (twoBand)
                        for (const DerivedDart& d :
                             dartColumnsFromDeficitRows(g, capRad, split, gRows, true))
                            abs.push_back({c0 + d.col, d.loadRad, true});
                    if (std::getenv("STITCHU_SP_DEBUG")) {
                        const std::vector<double> d = columnDeficit(g);
                        double tot = 0;
                        for (size_t q = 1; q + 1 < d.size(); ++q) tot += std::max(0.0, d[q]);
                        std::fprintf(stderr, "  PASS-A %s h%d s%zu  cols0..%d  deficit %+.3f deg  darts:",
                                     L.isSkirt ? "skirt" : "torso", h, s,
                                     c1 - c0, tot * 180.0 / kPi);
                        for (const DerivedDart& q : dartColumnsFromDeficit(g, opt.maxDartDeg * kPi / 180.0))
                            std::fprintf(stderr, " %d(%.1f°)", q.col, q.loadRad * 180.0 / kPi);
                        std::fprintf(stderr, "\n");
                    }
                } else {
                    for (double f : *L.dartFracs) {
                        const int c = static_cast<int>(std::lround(half * f));
                        if (c > bounds[s] && c < bounds[s + 1]) abs.push_back({h * half + c, 0.0});
                    }
                }
            }
        }
    }

    // ---- PASS B: build ----
    for (GarmentLayer& L : layers) {
        for (int h = 0; h < 2; ++h) {                    // 0 front (phi 0..pi), 1 back
            const int colBase = h * half;
            std::vector<int> bounds = {0};
            for (double f : *L.cutFracs) {
                const int c = static_cast<int>(std::lround(half * f));
                if (c > bounds.back() && c < half) bounds.push_back(c);
            }
            bounds.push_back(half);
            // "cut 2, one mirrored": when the layout is symmetric about the
            // half's centre (our default single 0.5 cut with symmetric darts),
            // the right sub-panel IS the left one reflected — a drafter draws
            // it once. Deriving it by mirroring makes the two panels exactly
            // congruent (their princess seam matches bit for bit) instead of
            // two independent solver runs that land in different minima.
            // Mirroring is only legal when the two sub-panels really are
            // reflections. With derived darts that is a question about the
            // DERIVED columns, not about the declared fractions: sub-panel 1's
            // darts must be sub-panel 0's darts reflected about the shared cut.
            // The two anchor classes are checked SEPARATELY. A waist dart and a
            // top dart that happen to land on reflected columns are not each
            // other's mirror image — they are two different cuts — so mixing
            // them into one list could declare a mirror that is not one.
            const bool mirrorable = [&] {
                if (bounds.size() != 3 || bounds[1] * 2 != half) return false;
                for (int anchor = 0; anchor < 2; ++anchor) {
                    std::vector<int> lc, rc;
                    for (const DerivedDart& d : dartCols[&L]) {
                        if (d.fromTop != (anchor == 1)) continue;
                        if (d.col > colBase && d.col < colBase + bounds[1])
                            lc.push_back(d.col - colBase);
                        else if (d.col > colBase + bounds[1] && d.col < colBase + half)
                            rc.push_back(d.col - colBase - bounds[1]);
                    }
                    if (lc.size() != rc.size()) return false;
                    const int w = bounds[1];
                    for (size_t i = 0; i < lc.size(); ++i)
                        if (lc[lc.size() - 1 - i] != w - rc[i]) return false;
                }
                return true;
            }();
            std::vector<int>& subs = h == 0 ? L.frontSubs : L.backSubs;
            for (size_t s = 0; s + 1 < bounds.size(); ++s) {
                if (mirrorable && s == 1) {
                    const SurfacePanel& src = pat.panels[subs[0]];
                    SurfacePanel p = src;  // congruent copy
                    for (Vec2& v : p.contour) v.x = -v.x;  // reflect
                    std::swap(p.seam0Edges, p.seam1Edges);  // cut seam swaps sides
                    p.name = "right_" + std::string(h == 0 ? L.fname : L.bname);
                    p.ringOffset = colBase + bounds[1];
                    subs.push_back(static_cast<int>(pat.panels.size()));
                    pat.panels.push_back(std::move(p));
                    continue;
                }
                const int c0 = colBase + bounds[s], c1 = colBase + bounds[s + 1];
                const std::vector<Vec3> seg(ring.begin() + c0, ring.begin() + c1 + 1);
                const double phi0 = 2 * kPi * c0 / NR, phi1 = 2 * kPi * c1 / NR;
                const std::vector<double> topSeg(L.topH.begin() + c0, L.topH.begin() + c1 + 1);
                const PanelGrid g = buildGrid(surf, seg, waistH, topSeg, phi0, phi1, opt.rowStepMM,
                                              L.isSkirt ? CrestFold{} : fold);
                const int rowsN = static_cast<int>(g.rows.size()) - 1;
                // Where the dart ENDS is geometry, not a dial.
                //
                // A dart exists to absorb the surface's develop-deficit, and a
                // skirt sheds deficit only while the section is still changing:
                // below hip - blend the garment is a straight cylinder and
                // carries none. So the apex must REACH the bottom of the shaped
                // region. It used to be a fraction (skirtApexFrac 1.35), and on
                // the asymmetric body that fraction fell 17mm SHORT of where the
                // shaping ends — the leftover deficit had nowhere to go and
                // surfaced as a 2.55% interior strain spike in the single row
                // band just under the apex, while its neighbours sat near 0.9%.
                // Deriving the height instead of tuning the fraction removes the
                // whole class: the dart now ends exactly where the shaping does.
                // MEASURED, NOT ASSUMED: reaching the apex all the way down to
                // hip - blend was tried and made it WORSE (front interior strain
                // 3.39% -> 5.70%), so "the dart must reach the end of the
                // shaping" is FALSE here and is not the root. Reverted; the
                // fraction stands until an instrument says what is.
                int apex;
                if (L.isSkirt) {
                    const double hipFrac = (waistH - hipH) / (waistH - hemH);
                    apex = std::max(2, static_cast<int>(std::lround(rowsN * hipFrac * opt.skirtApexFrac)));
                } else {
                    // The bodice dart is the one that must STOP SHORT: a dart run
                    // all the way to the bust point makes a cone tip, and every
                    // drafting text ends it 2-3cm before. That shortfall is
                    // intentional, so it stays a declared fraction.
                    apex = std::max(2, static_cast<int>(std::lround(rowsN * opt.bodiceApexFrac)));
                }
                // DART LENGTH FOLLOWS ITS INTAKE — the oldest rule in drafting
                // ("a bigger dart is a longer dart"), and the geometric reason is
                // the same one: the wedge angle at the tip is the intake divided
                // by the length, so a dart that carries more deficit over the
                // same length ends in a sharper cone, and the cone is exactly
                // where the flatten piles up strain. On EU38 the skirt back dart
                // carries 23.6 deg and the front 10.2, and until now both were
                // cut the same length.
                // MEASURED, NOT ASSUMED. Two length laws were tried on the
                // asymmetric body and BOTH made it worse, so neither is the
                // root and neither is in the code:
                //   * apex reaching the end of the shaping (hip - blend):
                //     skirt front interior 3.39% -> 5.70%
                //   * apex proportional to the dart's own intake (the drafting
                //     rule "a bigger dart is a longer dart"): back 3.31% -> 4.32%
                // A sweep of the length also came back NON-MONOTONE (2.87% at
                // 1.75, 4.32% at 1.95), which is a noisy optimiser landscape and
                // not a law — picking the minimum out of it would be fitting the
                // gate, not the geometry. The uniform apex stands until an
                // instrument says what actually governs the tip.
                // A TOP dart's tip is a declared height (topDartApexFrac), for
                // the same reason the bodice waist dart's is: a shoulder dart
                // that runs to the apex makes a cone tip, and drafting texts end
                // it short. The two tips sit on the same fraction scale, so the
                // cuts cannot cross by construction.
                const int topApex =
                    std::min(rowsN - 2,
                             std::max(1, static_cast<int>(
                                             std::lround(rowsN * opt.topDartApexFrac))));
                std::vector<Slit> slits;
                for (const DerivedDart& d : dartCols[&L])
                    if (d.col > c0 && d.col < c1)
                        slits.push_back({d.col - c0, d.fromTop ? topApex : apex, d.fromTop});
                // the waist seam breaks wherever EITHER layer darts, so run r
                // spans the same ring arc on both sides of the waist stitch.
                // With derived darts the two layers no longer dart in the same
                // columns at all, which makes this pre-pass mandatory rather
                // than a convenience.
                std::vector<int> breaks;
                for (const GarmentLayer& other : layers) {
                    // darts of the other layer... but only the WAIST-anchored
                    // ones. A top dart does not reach the ring, so it does not
                    // break a waist run, and breaking one there would split the
                    // shared arc for nothing.
                    for (const DerivedDart& d : dartCols[&other])
                        if (!d.fromTop && d.col > c0 && d.col < c1) breaks.push_back(d.col - c0);
                    // ...AND its panel cuts. A waist run must span the same ring
                    // arc on both sides of the stitch, so it breaks wherever
                    // EITHER layer has a boundary — a dart or a seam, no
                    // difference. Missing the cuts cost +1.4822mm on the waist
                    // pair the moment the two layers stopped being cut alike.
                    const std::vector<int> ob = boundsFor(other);
                    for (int hh = 0; hh < 2; ++hh)
                        for (size_t q = 1; q + 1 < ob.size(); ++q) {
                            const int c = hh * half + ob[q];
                            if (c > c0 && c < c1) breaks.push_back(c - c0);
                        }
                }
                // the referee's naming vocabulary (seamrules.py): a two-way
                // split is left_/right_, anything finer stays numbered
                std::string name = std::string(h == 0 ? L.fname : L.bname);
                if (bounds.size() == 3)
                    name = (s == 0 ? "left_" : "right_") + name;
                else if (bounds.size() > 3)
                    name += "_" + std::to_string(s + 1);
                SurfacePanel p = flattenGrid(g, name, slits, breaks, opt);
                p.ringOffset = c0;
                subs.push_back(static_cast<int>(pat.panels.size()));
                pat.panels.push_back(std::move(p));
            }
        }
    }

    for (const SurfacePanel& p : pat.panels) {
        if (p.name.find("skirt") != std::string::npos)
            pat.skirtWaistSumMM += p.waistLenMM;
        else
            pat.bodiceWaistSumMM += p.waistLenMM;
    }

    // ---- the stitch plan, built from construction ----
    // waist: bodice arc k and skirt arc k are the SAME ring arc
    std::vector<std::pair<int, int>> torsoArc(NR, {-1, -1}), skirtArc(NR, {-1, -1});
    for (size_t pi = 0; pi < pat.panels.size(); ++pi) {
        const SurfacePanel& p = pat.panels[pi];
        auto& sink = p.name.find("skirt") != std::string::npos ? skirtArc : torsoArc;
        for (size_t k = 0; k < p.waistEdges.size(); ++k)
            sink[p.ringOffset + k] = {static_cast<int>(pi), p.waistEdges[k]};
    }
    for (int k = 0; k < NR; ++k)
        pat.stitches.push_back({torsoArc[k].first, torsoArc[k].second,
                                skirtArc[k].first, skirtArc[k].second, SurfaceStitch::Waist});
    // princess seams within a half + side seams between halves.
    // The centre-back seam is recorded AS IT IS EMITTED: it is the princess
    // seam of the back half whose right-hand panel begins at the centre-back
    // ring column, and it is the only seam a back zip can live in. Finding it
    // by construction rather than by searching the finished plan for "the seam
    // nearest the back" keeps it correct when the cut fractions change.
    std::vector<int> cbBodice, cbSkirt;
    for (const GarmentLayer& L : layers) {
        for (int h = 0; h < 2; ++h) {
            const std::vector<int>& subs = h == 0 ? L.frontSubs : L.backSubs;
            for (size_t s = 0; s + 1 < subs.size(); ++s) {
                const SurfacePanel& a = pat.panels[subs[s]];
                const SurfacePanel& b = pat.panels[subs[s + 1]];
                const bool isCentreBack = h == 1 && b.ringOffset == 3 * NR / 4;
                std::vector<int>& cb = L.isSkirt ? cbSkirt : cbBodice;
                for (size_t i = 0; i < a.seam1Edges.size(); ++i) {
                    if (isCentreBack) cb.push_back(static_cast<int>(pat.stitches.size()));
                    pat.stitches.push_back({subs[s], a.seam1Edges[i],
                                            subs[s + 1], b.seam0Edges[i], SurfaceStitch::Princess});
                }
            }
        }
        const SurfacePanel& fLast = pat.panels[L.frontSubs.back()];
        const SurfacePanel& bFirst = pat.panels[L.backSubs.front()];
        const SurfacePanel& bLast = pat.panels[L.backSubs.back()];
        const SurfacePanel& fFirst = pat.panels[L.frontSubs.front()];
        for (size_t i = 0; i < fLast.seam1Edges.size(); ++i) {
            pat.stitches.push_back({L.frontSubs.back(), fLast.seam1Edges[i],
                                    L.backSubs.front(), bFirst.seam0Edges[i], SurfaceStitch::Side});
            pat.stitches.push_back({L.backSubs.back(), bLast.seam1Edges[i],
                                    L.frontSubs.front(), fFirst.seam0Edges[i], SurfaceStitch::Side});
        }
    }
    // darts: the two legs of one wedge sew to each other
    for (size_t pi = 0; pi < pat.panels.size(); ++pi)
        for (const SurfacePanel::Dart& d : pat.panels[pi].darts)
            for (size_t i = 0; i < d.legA.size(); ++i)
                pat.stitches.push_back({static_cast<int>(pi), d.legA[i],
                                        static_cast<int>(pi), d.legB[i], SurfaceStitch::Dart});

    // ---- THE SHOULDER SEAM (H1.0 K3, and with it K5's closed neck hole) ----
    //
    // The fold put the front and the back top boundaries onto ONE curve across
    // the shoulder band; this sews them. The pairing is the fold's own mirror:
    // ring column c and ring column NR-c are the same distance across the body
    // on opposite faces, so front arc [c, c+1] and back arc [NR-c-1, NR-c] are
    // the same piece of the seam line. Nothing is searched for.
    //
    // The "right_" panels are MIRRORED copies — the contour was reflected but
    // the edge lists were not reindexed — so their far edge k spans the arc
    // [ringOffset + n-k-1, ringOffset + n-k], not [ringOffset+k, +k+1].
    // Getting that backwards sews the shoulder to the neckline, so the ring
    // arc is derived per panel rather than assumed.
    //
    // The seam runs only where the fold's weight is 1 at BOTH ends of the arc,
    // which is exactly the shoulder band [neckHalf, strapHalf]. Outside it the
    // two edges are meant to part: into the neckline at the centre and into the
    // armhole at the side. Sewing there would close the holes the garment is
    // put on through.
    if (fold.on) {
        std::vector<std::pair<int, int>> arcOf(NR, {-1, -1});
        auto indexFar = [&](const std::vector<int>& subs) {
            for (int pi : subs) {
                const SurfacePanel& p = pat.panels[pi];
                const int n = static_cast<int>(p.farEdges.size());
                const bool mirrored = p.name.rfind("right_", 0) == 0;
                for (int k = 0; k < n; ++k) {
                    const int lo = mirrored ? p.ringOffset + n - k - 1 : p.ringOffset + k;
                    if (lo >= 0 && lo < NR) arcOf[lo] = {pi, p.farEdges[k]};
                }
            }
        };
        indexFar(layers[0].frontSubs);
        indexFar(layers[0].backSubs);
        auto inBand = [&](int col) {
            const double x = std::fabs(shoulderHalf * std::cos(2 * kPi * col / NR));
            return x >= neckHalfMM && x <= strapHalfMM;
        };
        for (int c = 0; c < NR / 2; ++c) {
            const int d = NR - 1 - c;
            if (!inBand(c) || !inBand(c + 1)) continue;
            if (arcOf[c].first < 0 || arcOf[d].first < 0) continue;
            pat.stitches.push_back({arcOf[c].first, arcOf[c].second, arcOf[d].first,
                                    arcOf[d].second, SurfaceStitch::Shoulder});
        }
    }

    // ---- THE BACK OPENING: the closure stops being a declaration ----
    //
    // wearable_check gates the neck opening against the sourced 22-inch
    // head-through minimum OR a closure, and the dress passes on the closure
    // arm. That arm was, at first, only a number in the options — a flag that
    // satisfied a gate while the pattern still had every seam sewn shut from
    // hem to neckline. Here the closure becomes geometry.
    //
    // The seam already exists: the back half's princess seam runs down the
    // centre back, which is exactly where the period envelopes put the zip.
    // So no new cut is invented. What changes is that its top run is marked
    // Opening instead of Princess, walking DOWN from the neckline — through
    // the bodice, across the waist, and into the skirt if the zip is longer
    // than the bodice, which at 22 inches it is.
    //
    // Length is measured on the FLATTENED seam, because that is the length the
    // printed pattern shows and the length the zip has to live in.
    //
    // The run stops at the first whole edge that REACHES the requested length,
    // so the opening lands at or OVER it, never under. That is the reverse of
    // how this was first written, and the reason is what a person does with the
    // number: they go and buy a zip. Zips are sold in whole inches -- 18, 20,
    // 22, 24 -- and stopping UNDER the target gave 21.7-21.9 inches across the
    // eight sizes, so the pack said "21 inch or shorter". No such zip exists,
    // and since a zip longer than its opening cannot be sewn in, the buyer
    // drops to 20 and loses two inches of opening for nothing. Landing at or
    // over 22 makes the 22 inch zip fit -- which is exactly what the period
    // envelopes call for (Vogue 6900, Vogue Couturier 2063). The few
    // millimetres of opening past the zip end get stitched, as on any real
    // garment.
    if (opt.backOpeningMM > 0.0) {
        std::vector<int> topDown;
        // bodice seam edges are row-ascending (waist upward), so the neckline
        // end is the LAST one — walk it backwards, then continue into the skirt
        topDown.insert(topDown.end(), cbBodice.rbegin(), cbBodice.rend());
        topDown.insert(topDown.end(), cbSkirt.begin(), cbSkirt.end());
        double run = 0.0;
        for (int si : topDown) {
            SurfaceStitch& st = pat.stitches[si];
            const SurfacePanel& p = pat.panels[st.pa];
            const Vec2& u = p.contour[st.ea];
            const Vec2& v = p.contour[(st.ea + 1) % p.contour.size()];
            const double len = std::hypot(v.x - u.x, v.y - u.y);
            run += len;
            st.kind = SurfaceStitch::Opening;
            if (run >= opt.backOpeningMM) break;
        }
        pat.backOpeningMM = run;
    }
    return pat;
}

}  // namespace stitchu
