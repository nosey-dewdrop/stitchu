#include "flatten.hpp"

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <set>

namespace stitchu {

namespace {

struct RefFrame {
    // reference 2D corners of a triangle laid flat in its own plane:
    // (0,0), (l1,0), (x2,y2) — an isometric copy, so cotan weights and target
    // edges computed from it are exact.
    double l1 = 0.0, x2 = 0.0, y2 = 0.0;
    double w01 = 0.0, w02 = 0.0, w12 = 0.0;  // cotan weights per edge
};

double norm3(Vec3 v) { return std::sqrt(dot(v, v)); }

RefFrame refFrame(const TriMesh& mesh, const std::array<int, 3>& f) {
    const Vec3 p0 = mesh.V[f[0]], p1 = mesh.V[f[1]], p2 = mesh.V[f[2]];
    const Vec3 e1 = p1 - p0, e2 = p2 - p0;
    RefFrame r;
    r.l1 = norm3(e1);
    r.x2 = dot(e2, e1) / r.l1;
    const Vec3 perp = e2 - e1 * (r.x2 / r.l1);
    r.y2 = norm3(perp);
    // cot(angle at a) between rays (b-a) and (c-a), on the flat copy
    const double v0x = 0.0, v0y = 0.0, v1x = r.l1, v1y = 0.0, v2x = r.x2, v2y = r.y2;
    auto cot = [](double ax, double ay, double bx, double by, double cx, double cy) {
        const double ux = bx - ax, uy = by - ay, wx = cx - ax, wy = cy - ay;
        const double cr = ux * wy - uy * wx;
        return (ux * wx + uy * wy) / std::max(std::fabs(cr), 1e-12);
    };
    r.w12 = cot(v0x, v0y, v1x, v1y, v2x, v2y);  // angle at corner 0 ⇒ edge (1,2)
    r.w02 = cot(v1x, v1y, v0x, v0y, v2x, v2y);  // edge (0,2)
    r.w01 = cot(v2x, v2y, v0x, v0y, v1x, v1y);  // edge (0,1)
    return r;
}

std::vector<std::array<int, 2>> uniqueEdges(const TriMesh& mesh) {
    std::set<std::pair<int, int>> es;
    for (const auto& f : mesh.F)
        for (auto [a, b] : {std::pair{f[0], f[1]}, std::pair{f[1], f[2]}, std::pair{f[0], f[2]}})
            es.insert({std::min(a, b), std::max(a, b)});
    std::vector<std::array<int, 2>> out;
    out.reserve(es.size());
    for (auto [a, b] : es) out.push_back({a, b});
    return out;
}

}  // namespace

std::vector<Vec2> arapFlatten(const TriMesh& mesh, const std::vector<Vec2>& init,
                              int pin, int rounds, double cgTol) {
    const int n = static_cast<int>(mesh.V.size());
    const int m = static_cast<int>(mesh.F.size());
    std::vector<RefFrame> ref(m);
    for (int t = 0; t < m; ++t) ref[t] = refFrame(mesh, mesh.F[t]);

    // the three in-face edges, as (cornerA, cornerB, weight accessor)
    struct EdgeSpec {
        int a, b;
        double RefFrame::*w;
    };
    const EdgeSpec kEdges[3] = {{0, 1, &RefFrame::w01}, {0, 2, &RefFrame::w02}, {1, 2, &RefFrame::w12}};

    auto refCorner = [](const RefFrame& r, int c) -> Vec2 {
        if (c == 0) return {0.0, 0.0};
        if (c == 1) return {r.l1, 0.0};
        return {r.x2, r.y2};
    };

    // fixed cotan Laplacian as an assembled matvec over directed edge triples
    struct Lij {
        int i, j;
        double w;
    };
    std::vector<Lij> L;
    L.reserve(static_cast<size_t>(m) * 6);
    for (int t = 0; t < m; ++t)
        for (const auto& e : kEdges) {
            const int va = mesh.F[t][e.a], vb = mesh.F[t][e.b];
            const double w = ref[t].*(e.w);
            L.push_back({va, vb, w});
            L.push_back({vb, va, w});
        }

    auto matvec = [&](const std::vector<Vec2>& x, std::vector<Vec2>& y) {
        std::fill(y.begin(), y.end(), Vec2{});
        for (const Lij& l : L) {
            y[l.i].x += l.w * (x[l.i].x - x[l.j].x);
            y[l.i].y += l.w * (x[l.i].y - x[l.j].y);
        }
    };

    std::vector<Vec2> P = init;
    std::vector<Vec2> B(n), r(n), p(n), Ap(n);

    auto cg = [&](const std::vector<Vec2>& rhs, std::vector<Vec2>& x) {
        matvec(x, Ap);
        for (int i = 0; i < n; ++i) {
            r[i].x = rhs[i].x - Ap[i].x;
            r[i].y = rhs[i].y - Ap[i].y;
        }
        r[pin] = {0.0, 0.0};
        p = r;
        double rs = 0.0;
        for (int i = 0; i < n; ++i) rs += r[i].x * r[i].x + r[i].y * r[i].y;
        for (int it = 0; it < 2000 && rs >= cgTol; ++it) {
            matvec(p, Ap);
            Ap[pin] = {0.0, 0.0};
            double pAp = 0.0;
            for (int i = 0; i < n; ++i) pAp += p[i].x * Ap[i].x + p[i].y * Ap[i].y;
            const double al = rs / std::max(pAp, 1e-300);
            double rs2 = 0.0;
            for (int i = 0; i < n; ++i) {
                x[i].x += al * p[i].x;
                x[i].y += al * p[i].y;
                r[i].x -= al * Ap[i].x;
                r[i].y -= al * Ap[i].y;
                rs2 += r[i].x * r[i].x + r[i].y * r[i].y;
            }
            const double beta = rs2 / rs;
            for (int i = 0; i < n; ++i) {
                p[i].x = r[i].x + beta * p[i].x;
                p[i].y = r[i].y + beta * p[i].y;
            }
            rs = rs2;
        }
    };

    for (int round = 0; round < rounds; ++round) {
        // LOCAL: per-triangle best rotation, closed-form 2x2 polar of the
        // weighted covariance S = Σ w (ref edge)(current edge)^T
        std::fill(B.begin(), B.end(), Vec2{});
        for (int t = 0; t < m; ++t) {
            double s00 = 0, s01 = 0, s10 = 0, s11 = 0;
            for (const auto& e : kEdges) {
                const double w = ref[t].*(e.w);
                const Vec2 ra = refCorner(ref[t], e.a), rb = refCorner(ref[t], e.b);
                const double rex = rb.x - ra.x, rey = rb.y - ra.y;
                const Vec2 ca = P[mesh.F[t][e.a]], cb = P[mesh.F[t][e.b]];
                const double cex = cb.x - ca.x, cey = cb.y - ca.y;
                s00 += w * rex * cex;
                s01 += w * rex * cey;
                s10 += w * rey * cex;
                s11 += w * rey * cey;
            }
            double ca = s00 + s11, sa = s01 - s10;
            const double nm = std::sqrt(ca * ca + sa * sa) + 1e-300;
            ca /= nm;
            sa /= nm;
            // GLOBAL rhs: B += Σ w R^T (ref edge), scattered to both endpoints.
            // R = [[ca,sa],[-sa,ca]] ⇒ R^T e = (ca*ex − sa*ey, sa*ex + ca*ey).
            for (const auto& e : kEdges) {
                const double w = ref[t].*(e.w);
                const Vec2 ra = refCorner(ref[t], e.a), rb = refCorner(ref[t], e.b);
                const double rex = rb.x - ra.x, rey = rb.y - ra.y;
                const double tx = ca * rex - sa * rey;
                const double ty = sa * rex + ca * rey;
                B[mesh.F[t][e.b]].x += w * tx;
                B[mesh.F[t][e.b]].y += w * ty;
                B[mesh.F[t][e.a]].x -= w * tx;
                B[mesh.F[t][e.a]].y -= w * ty;
            }
        }
        cg(B, P);
    }
    return P;
}

namespace {

void polishImpl(const TriMesh& mesh, std::vector<Vec2>& P, const std::vector<double>& W,
                int pin, int iters, double step) {
    const auto E = uniqueEdges(mesh);
    std::vector<double> L0(E.size());
    for (size_t e = 0; e < E.size(); ++e) L0[e] = norm3(mesh.V[E[e][0]] - mesh.V[E[e][1]]);
    double wmax = 1.0;
    for (size_t e = 0; e < E.size(); ++e) wmax = std::max(wmax, W.empty() ? 1.0 : W[e]);
    const Vec2 anchor = P[pin];
    std::vector<Vec2> g(P.size());
    for (int it = 0; it < iters; ++it) {
        std::fill(g.begin(), g.end(), Vec2{});
        for (size_t e = 0; e < E.size(); ++e) {
            const double dx = P[E[e][0]].x - P[E[e][1]].x;
            const double dy = P[E[e][0]].y - P[E[e][1]].y;
            const double ln = std::sqrt(dx * dx + dy * dy) + 1e-12;
            const double f = (W.empty() ? 1.0 : W[e]) * (ln - L0[e]) / ln;
            g[E[e][0]].x += f * dx;
            g[E[e][0]].y += f * dy;
            g[E[e][1]].x -= f * dx;
            g[E[e][1]].y -= f * dy;
        }
        const double s = step / wmax;  // stability under the heaviest weight
        for (size_t i = 0; i < P.size(); ++i) {
            P[i].x -= s * g[i].x;
            P[i].y -= s * g[i].y;
        }
        P[pin] = anchor;
    }
}

}  // namespace

void strainPolish(const TriMesh& mesh, std::vector<Vec2>& P, int pin, int iters, double step) {
    polishImpl(mesh, P, {}, pin, iters, step);
}

void strainPolishWeighted(const TriMesh& mesh, std::vector<Vec2>& P,
                          const std::vector<char>& flagged, double emphasis,
                          int pin, int iters, double step) {
    const auto E = uniqueEdges(mesh);
    std::vector<double> W(E.size(), 1.0);
    for (size_t e = 0; e < E.size(); ++e)
        if (flagged[E[e][0]] && flagged[E[e][1]]) W[e] = emphasis;
    polishImpl(mesh, P, W, pin, iters, step);
}

double maxStrain(const TriMesh& mesh, const std::vector<Vec2>& P) {
    double worst = 0.0;
    for (const auto& e : uniqueEdges(mesh)) {
        const double l3 = norm3(mesh.V[e[0]] - mesh.V[e[1]]);
        const double dx = P[e[0]].x - P[e[1]].x;
        const double dy = P[e[0]].y - P[e[1]].y;
        const double l2 = std::sqrt(dx * dx + dy * dy);
        worst = std::max(worst, std::fabs(l2 - l3) / std::max(l3, 1e-9));
    }
    return worst;
}

}  // namespace stitchu
