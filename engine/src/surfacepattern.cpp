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
    std::vector<Ring> rings;  // descending height: neck, bust, waist, hip

    // easeMM: girth ease per ring, in ring order (neck, bust, waist, hip). A
    // garment with zero ease is skin and cannot be put on; the offset is the
    // OUTER PARALLEL CURVE of the body section (garmentshell.cpp theorem:
    // perimeter grows by exactly 2*pi*d, so d = ease/(2*pi), no fitted constant).
    //
    // The NECK ring is what lets a garment exist above the bust at all. Until
    // now the top ring was the bust and profile() returned the bust section
    // unchanged for every height above it — a straight cylinder of bust width
    // where the chest, shoulder and neck belong. That was invisible while the
    // dress was strapless, because nothing was ever cut up there.
    static GarmentSurf fromBody(const BodySurface& body, const double easeMM[4]) {
        GarmentSurf s;
        int k = 0;
        for (const char* name : {"neck", "bust", "waist", "hip"}) {
            for (const BodyLevel& lv : body.levels())
                if (lv.name == name) {
                    const Section sec = body.sectionAt(body.parameterFor(lv.heightMM));
                    s.rings.push_back({lv.heightMM, sec.a, sec.bm, sec.bd,
                                       easeMM[k] / (2 * kPi)});
                }
            ++k;
        }
        if (s.rings.size() != 4) throw std::runtime_error("need neck/bust/waist/hip rings");
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

    Vec3 at(double h, double phi) const {
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
// Stage one: FLAT, exactly at the bust, which reproduces the strapless sheath
// byte for byte. The mechanism lands and is proved neutral before the shape
// goes in, so that when the numbers move it is the neckline moving and not a
// refactor.
double topProfile(double phi, double bustH) {
    (void)phi;
    return bustH;
}

PanelGrid buildGrid(const GarmentSurf& surf,
                    const std::vector<Vec3>& ringSeg, double waistH,
                    const std::vector<double>& topH,
                    double phi0, double phi1, double rowStepMM) {
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
            g.rows[i][j] = surf.at(waistH + (topH[j] - waistH) * i / rowsN, phi);
        }
    }
    return g;
}

double dist3(Vec3 a, Vec3 b) { return std::sqrt(dot(a - b, a - b)); }
double dist2(Vec2 a, Vec2 b) { return std::hypot(a.x - b.x, a.y - b.y); }

// A dart as a mesh SLIT: the column is split from the waist row up to (not
// including) the apex row. The flatten opens the slit into a wedge — the
// develop-deficit surfacing as geometry, not as a formula (G2).
struct Slit {
    int col = 0;
    int apexRow = 0;
};

// PER-COLUMN DEVELOP-DEFICIT of an un-slit panel grid, in radians.
//
// A panel flattens without stretch only where the surface is developable.
// Everywhere else the Gaussian curvature has to leave through a cut, and the
// discrete amount that wants out at a vertex is its angle defect: 2*pi minus the
// angles of the triangles around it. Summing that per COLUMN says where the cuts
// belong — which is how a drafter decides where a dart goes, except measured.
std::vector<double> columnDeficit(const PanelGrid& g) {
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
    for (int i = 1; i < rowsN; ++i)
        for (int j = 1; j < cols; ++j) perCol[j] += 2 * kPi - sum[idx(i, j)];
    return perCol;
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
};

std::vector<DerivedDart> dartColumnsFromDeficit(const PanelGrid& g, double capRad) {
    const std::vector<double> def = columnDeficit(g);
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
    if (total <= 0.0 || weighted <= 0.0) return {};

    // The COUNT still follows the load the darts actually have to carry.
    const int n = std::max(1, static_cast<int>(std::ceil(weighted / capRad - 1e-9)));
    std::vector<DerivedDart> out;
    double run = 0.0;
    int k = 0;
    for (int j = 1; j < cols && k < n; ++j) {
        run += w[j];
        while (k < n && run >= (k + 0.5) / n * weighted) {
            if (out.empty() || out.back().col != j) out.push_back({j, total / n});
            ++k;
        }
    }
    return out;
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
    // right-side copies of split vertices
    std::map<std::pair<int, int>, int> dup;  // (i, col) -> vertex id
    for (const Slit& s : slits)
        for (int i = 0; i < s.apexRow; ++i) {
            dup[{i, s.col}] = static_cast<int>(mesh.V.size());
            mesh.V.push_back(g.rows[i][s.col]);
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

    // pin away from any slit so the anchor never sits on a dart leg
    std::vector<Vec2> P = arapFlatten(mesh, P0, base[gi(rowsN, cols / 2)], opt.arapRounds);
    // polish with the metric LOCKED onto cut lines: boundary edges (incl. dart
    // legs) carry the sewing contract, the interior carries the ease budget
    std::vector<char> onCut(mesh.V.size(), 0);
    for (int j = 0; j <= cols; ++j) onCut[base[gi(0, j)]] = onCut[base[gi(rowsN, j)]] = 1;
    for (int i = 0; i <= rowsN; ++i) onCut[base[gi(i, 0)]] = onCut[base[gi(i, cols)]] = 1;
    for (const Slit& s : slits)
        for (int i = 0; i <= s.apexRow; ++i) onCut[vid(i, s.col, false)] = onCut[vid(i, s.col, true)] = 1;
    strainPolishWeighted(mesh, P, onCut, opt.cutEmphasis, base[gi(rowsN, cols / 2)], opt.polishIters);

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
    std::map<int, const Slit*> slitAt;
    for (const Slit& s : slits) slitAt[s.col] = &s;
    std::set<int> breakAt(breakCols.begin(), breakCols.end());
    for (const Slit& s : slits) breakAt.insert(s.col);
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
        std::vector<int> far;
        for (int j = cols - 1; j >= 0; --j) push(base[gi(rowsN, j)], &far);
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
        const Vec2 apex = P[base[gi(s.apexRow, s.col)]];
        const Vec2 wl = P[vid(0, s.col, false)], wr = P[vid(0, s.col, true)];
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
    const double easeMM[4] = {opt.easeNeckMM, opt.easeBustMM, opt.easeWaistMM, opt.easeHipMM};
    GarmentSurf surf = GarmentSurf::fromBody(body, easeMM);
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
        if (!L.isSkirt)
            for (int j = 0; j <= NR; ++j) L.topH[j] = topProfile(2 * kPi * j / NR, bustH);
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
                                                  opt.rowStepMM);
                    for (const DerivedDart& d : dartColumnsFromDeficit(g, opt.maxDartDeg * kPi / 180.0))
                        abs.push_back({c0 + d.col, d.loadRad});
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
            const bool mirrorable = [&] {
                if (bounds.size() != 3 || bounds[1] * 2 != half) return false;
                std::vector<int> lc, rc;
                for (const DerivedDart& d : dartCols[&L]) {
                    if (d.col > colBase && d.col < colBase + bounds[1]) lc.push_back(d.col - colBase);
                    else if (d.col > colBase + bounds[1] && d.col < colBase + half)
                        rc.push_back(d.col - colBase - bounds[1]);
                }
                if (lc.size() != rc.size()) return false;
                const int w = bounds[1];
                for (size_t i = 0; i < lc.size(); ++i)
                    if (lc[lc.size() - 1 - i] != w - rc[i]) return false;
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
                const PanelGrid g = buildGrid(surf, seg, waistH, topSeg, phi0, phi1, opt.rowStepMM);
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
                std::vector<Slit> slits;
                for (const DerivedDart& d : dartCols[&L])
                    if (d.col > c0 && d.col < c1) slits.push_back({d.col - c0, apex});
                // the waist seam breaks wherever EITHER layer darts, so run r
                // spans the same ring arc on both sides of the waist stitch.
                // With derived darts the two layers no longer dart in the same
                // columns at all, which makes this pre-pass mandatory rather
                // than a convenience.
                std::vector<int> breaks;
                for (const GarmentLayer& other : layers) {
                    // darts of the other layer...
                    for (const DerivedDart& d : dartCols[&other])
                        if (d.col > c0 && d.col < c1) breaks.push_back(d.col - c0);
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
    // princess seams within a half + side seams between halves
    for (const GarmentLayer& L : layers) {
        for (int h = 0; h < 2; ++h) {
            const std::vector<int>& subs = h == 0 ? L.frontSubs : L.backSubs;
            for (size_t s = 0; s + 1 < subs.size(); ++s) {
                const SurfacePanel& a = pat.panels[subs[s]];
                const SurfacePanel& b = pat.panels[subs[s + 1]];
                for (size_t i = 0; i < a.seam1Edges.size(); ++i)
                    pat.stitches.push_back({subs[s], a.seam1Edges[i],
                                            subs[s + 1], b.seam0Edges[i], SurfaceStitch::Princess});
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
    return pat;
}

}  // namespace stitchu
