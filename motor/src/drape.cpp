#include "drape.hpp"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <map>
#include <sstream>

#include "dxf.hpp"

namespace stitchu {
namespace drape {

namespace {

std::string num(double v) {
    char buf[64];
    std::snprintf(buf, sizeof(buf), "%.4f", v);
    return buf;
}

bool finiteVec(const Vec3& v) {
    return std::isfinite(v.x) && std::isfinite(v.y) && std::isfinite(v.z);
}

// The boundary polygon of a piece (motor frame, y-down): the largest CLOSED
// subpath from the deterministic dxf flatten. Prefer the cut line (boundary
// layer), fall back to the seamline for strip pieces — the SAME honest rule
// nest.cpp uses. dxf negates y for its frame; we negate back to motor y-down.
std::vector<Point> boundaryPolygon(const PatternPiece& piece, int steps) {
    const dxf::DxfPiece flat = dxf::flattenPiece(piece, steps);
    const std::vector<Point>* best = nullptr;
    size_t bestN = 0;
    auto consider = [&](const dxf::DxfPolyline& pl) {
        if (!pl.closed) return;
        if (pl.points.size() > bestN) { best = &pl.points; bestN = pl.points.size(); }
    };
    for (const auto& pl : flat.polylines)
        if (pl.layer == dxf::Layers::kBoundary) consider(pl);
    if (!best)
        for (const auto& pl : flat.polylines)
            if (pl.layer == dxf::Layers::kSeamline) consider(pl);
    std::vector<Point> out;
    if (best) {
        out.reserve(best->size());
        for (const auto& p : *best) out.push_back({p.x, -p.y}); // DXF y-up -> motor y-down
    }
    return out;
}

// Even-odd ray cast: is q strictly inside the closed polygon? (same as nest.cpp)
bool pointInPolygon(const std::vector<Point>& poly, Point q) {
    bool inside = false;
    const size_t n = poly.size();
    if (n < 3) return false;
    for (size_t i = 0, j = n - 1; i < n; j = i++) {
        const Point a = poly[i], b = poly[j];
        const bool between = (a.y > q.y) != (b.y > q.y);
        if (between) {
            const double xCross = a.x + (q.y - a.y) / (b.y - a.y) * (b.x - a.x);
            if (q.x < xCross) inside = !inside;
        }
    }
    return inside;
}

Rect polyBounds(const std::vector<Point>& poly) {
    if (poly.empty()) return {};
    double minx = poly[0].x, maxx = poly[0].x, miny = poly[0].y, maxy = poly[0].y;
    for (const auto& p : poly) {
        minx = std::min(minx, p.x); maxx = std::max(maxx, p.x);
        miny = std::min(miny, p.y); maxy = std::max(maxy, p.y);
    }
    return {minx, miny, maxx - minx, maxy - miny};
}

double dist3(const Vec3& a, const Vec3& b) {
    const double dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
    return std::sqrt(dx * dx + dy * dy + dz * dz);
}

} // namespace

ClothMesh buildCloth(const PatternPiece& piece, const DrapeOptions& opts) {
    ClothMesh mesh;
    // Flatten resolution is fixed at the motor's 24 so the polygon is byte-stable.
    mesh.polygon = boundaryPolygon(piece, 24);
    if (mesh.polygon.size() < 3) {
        mesh.error = "piece has no closed outline to drape";
        return mesh;
    }
    if (opts.cellMM <= 0.0) {
        mesh.error = "cellMM must be > 0";
        return mesh;
    }
    const Rect bb = polyBounds(mesh.polygon);
    // Grid dimensions: cover the bounding box at cellMM spacing. cols/rows are a
    // pure function of the polygon extent + cellMM (deterministic).
    const int cols = std::max(2, static_cast<int>(std::floor(bb.width / opts.cellMM)) + 1);
    const int rows = std::max(2, static_cast<int>(std::floor(bb.height / opts.cellMM)) + 1);

    // grid[r][c] -> particle index, or -1 if that cell is outside the polygon.
    std::vector<std::vector<int>> grid(rows, std::vector<int>(cols, -1));
    // pattern y grows DOWN; row 0 = min y = the TOP (waist/neck) that we pin.
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < cols; ++c) {
            const double px = bb.x + c * opts.cellMM;
            const double py = bb.y + r * opts.cellMM;
            if (!pointInPolygon(mesh.polygon, {px, py})) continue;
            const int idx = static_cast<int>(mesh.particles.size());
            grid[r][c] = idx;
            // Map pattern frame (mm, y-down) to world: X=px centred on body, Z=0
            // (flat sheet start), Y = -py so pattern-down becomes world-down.
            Vec3 p;
            p.x = px;
            p.y = -py;
            p.z = 0.0;
            // Optional pre-wrap: bend the flat sheet around the body cylinder so
            // it starts near the body rather than passing through it. The wrap
            // angle is proportional to horizontal distance from the body centre.
            if (opts.initialWrap > 0.0 && opts.bodyRadiusMM > 0.0) {
                const double arc = (px - opts.bodyCenterX);
                const double theta = (arc / std::max(1.0, opts.bodyRadiusMM)) * opts.initialWrap;
                p.x = opts.bodyCenterX + opts.bodyRadiusMM * std::sin(theta);
                p.z = opts.bodyCenterZ + opts.bodyRadiusMM * (1.0 - std::cos(theta));
            }
            mesh.particles.push_back(p);
            mesh.source2D.push_back({px, py});
        }
    }
    if (mesh.particles.size() < 3) {
        mesh.error = "grid produced fewer than 3 particles (piece too small for cellMM)";
        mesh.particles.clear();
        mesh.source2D.clear();
        return mesh;
    }
    mesh.pinned.assign(mesh.particles.size(), false);

    // PIN the top row: the first grid row (min pattern y) that has any particle
    // is the waist/neckline edge the garment hangs from.
    for (int r = 0; r < rows; ++r) {
        bool anyThisRow = false;
        for (int c = 0; c < cols; ++c) {
            if (grid[r][c] >= 0) { mesh.pinned[grid[r][c]] = true; anyThisRow = true; }
        }
        if (anyThisRow) break; // only the topmost occupied row is pinned
    }

    // Springs. Structural = 4-neighbour (r,c)-(r,c+1) and (r,c)-(r+1,c).
    // Shear = diagonals. Bend = 2-step neighbours (resist folding).
    auto addSpring = [&](int a, int b, SpringKind kind) {
        if (a < 0 || b < 0) return;
        Spring s;
        s.a = a; s.b = b; s.kind = kind;
        s.rest = dist3(mesh.particles[a], mesh.particles[b]);
        // Guard: with pre-wrap two grid neighbours could coincide; skip degenerate.
        if (s.rest < 1e-9) return;
        mesh.springs.push_back(s);
    };
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < cols; ++c) {
            const int me = grid[r][c];
            if (me < 0) continue;
            if (c + 1 < cols) addSpring(me, grid[r][c + 1], SpringKind::Structural);
            if (r + 1 < rows) addSpring(me, grid[r + 1][c], SpringKind::Structural);
            if (c + 1 < cols && r + 1 < rows) addSpring(me, grid[r + 1][c + 1], SpringKind::Shear);
            if (c - 1 >= 0 && r + 1 < rows) addSpring(me, grid[r + 1][c - 1], SpringKind::Shear);
            if (c + 2 < cols) addSpring(me, grid[r][c + 2], SpringKind::Bend);
            if (r + 2 < rows) addSpring(me, grid[r + 2][c], SpringKind::Bend);
        }
    }

    // Render triangles: for every full 2x2 grid cell with all four corners, two
    // triangles. Never affects the sim.
    for (int r = 0; r + 1 < rows; ++r) {
        for (int c = 0; c + 1 < cols; ++c) {
            const int tl = grid[r][c], tr = grid[r][c + 1];
            const int bl = grid[r + 1][c], br = grid[r + 1][c + 1];
            if (tl >= 0 && tr >= 0 && bl >= 0) mesh.tris.push_back({tl, tr, bl});
            if (tr >= 0 && br >= 0 && bl >= 0) mesh.tris.push_back({tr, br, bl});
        }
    }

    mesh.ok = true;
    return mesh;
}

DrapeResult settle(const ClothMesh& mesh, const DrapeOptions& opts) {
    DrapeResult res;
    if (!mesh.ok) {
        res.error = mesh.error.empty() ? "cloth mesh not ok" : mesh.error;
        return res;
    }
    const size_t n = mesh.particles.size();
    if (n < 3 || mesh.springs.empty()) {
        res.error = "cloth mesh too small to settle";
        return res;
    }

    // Verlet needs current + previous positions. Start prev == cur (zero velocity).
    std::vector<Vec3> cur = mesh.particles;
    std::vector<Vec3> prev = mesh.particles;
    const std::vector<Vec3> initial = mesh.particles;

    const double dt2 = opts.dt * opts.dt;
    const double damp = 1.0 - opts.damping;

    auto stiffness = [&](SpringKind k) {
        switch (k) {
            case SpringKind::Structural: return opts.kStructural;
            case SpringKind::Shear:      return opts.kShear;
            case SpringKind::Bend:       return opts.kBend;
        }
        return opts.kStructural;
    };

    for (int step = 0; step < opts.steps; ++step) {
        // 1. Integrate: x' = x + (x - xprev)*damp + a*dt^2. Gravity pulls -Y.
        for (size_t i = 0; i < n; ++i) {
            if (mesh.pinned[i]) continue;
            const Vec3 c = cur[i];
            const Vec3 p = prev[i];
            Vec3 next;
            next.x = c.x + (c.x - p.x) * damp;
            next.y = c.y + (c.y - p.y) * damp - opts.gravity * dt2;
            next.z = c.z + (c.z - p.z) * damp;
            prev[i] = c;
            cur[i] = next;
        }
        // 2. Satisfy spring constraints (Jakobsen relaxation), several passes.
        for (int pass = 0; pass < opts.constraintPasses; ++pass) {
            for (const auto& s : mesh.springs) {
                Vec3& A = cur[s.a];
                Vec3& B = cur[s.b];
                double dx = B.x - A.x, dy = B.y - A.y, dz = B.z - A.z;
                double len = std::sqrt(dx * dx + dy * dy + dz * dz);
                if (len < 1e-9) continue;
                const double diff = (len - s.rest) / len * stiffness(s.kind);
                const double offx = dx * 0.5 * diff;
                const double offy = dy * 0.5 * diff;
                const double offz = dz * 0.5 * diff;
                const bool pa = mesh.pinned[s.a];
                const bool pb = mesh.pinned[s.b];
                if (!pa && !pb) {
                    A.x += offx; A.y += offy; A.z += offz;
                    B.x -= offx; B.y -= offy; B.z -= offz;
                } else if (pa && !pb) {
                    B.x -= 2.0 * offx; B.y -= 2.0 * offy; B.z -= 2.0 * offz;
                } else if (!pa && pb) {
                    A.x += 2.0 * offx; A.y += 2.0 * offy; A.z += 2.0 * offz;
                }
                // both pinned: rigid, no correction.
            }
            // 3. Body collision: push any particle inside the vertical cylinder
            //    OUT to its surface (horizontal push in the XZ plane).
            if (opts.bodyRadiusMM > 0.0) {
                for (size_t i = 0; i < n; ++i) {
                    if (mesh.pinned[i]) continue;
                    double dx = cur[i].x - opts.bodyCenterX;
                    double dz = cur[i].z - opts.bodyCenterZ;
                    double r = std::sqrt(dx * dx + dz * dz);
                    if (r < opts.bodyRadiusMM && r > 1e-9) {
                        const double scale = opts.bodyRadiusMM / r;
                        cur[i].x = opts.bodyCenterX + dx * scale;
                        cur[i].z = opts.bodyCenterZ + dz * scale;
                    } else if (r <= 1e-9) {
                        // Exactly on the axis: push out along +Z deterministically.
                        cur[i].z = opts.bodyCenterZ + opts.bodyRadiusMM;
                    }
                }
            }
        }
    }

    // Assemble result + honest diagnostics (all MEASURED).
    res.particles = cur;
    res.pinned = mesh.pinned;
    res.tris = mesh.tris;
    res.springs = mesh.springs;
    res.particleCount = static_cast<int>(n);
    res.springCount = static_cast<int>(mesh.springs.size());

    double maxPinDrift = 0.0;
    int pinnedCount = 0;
    double minY = cur[0].y, pinY = 0.0;
    double initialMinY = initial[0].y;
    double minZ = cur[0].z, maxZ = cur[0].z;
    bool anyPin = false;
    for (size_t i = 0; i < n; ++i) {
        if (!finiteVec(cur[i])) res.anyNaN = true;
        if (mesh.pinned[i]) {
            ++pinnedCount;
            maxPinDrift = std::max(maxPinDrift, dist3(cur[i], initial[i]));
            if (!anyPin) { pinY = cur[i].y; anyPin = true; }
        }
        minY = std::min(minY, cur[i].y);
        initialMinY = std::min(initialMinY, initial[i].y);
        minZ = std::min(minZ, cur[i].z);
        maxZ = std::max(maxZ, cur[i].z);
    }
    res.pinnedCount = pinnedCount;
    res.maxPinDriftMM = maxPinDrift;
    res.finalHeightMM = anyPin ? (pinY - minY) : 0.0;
    // dropFromFlat: the settled hem is LOWER (more negative Y) than the flat lay
    // by this much — the drape magnitude (0 = didn't move; large = hung).
    res.dropFromFlatMM = initialMinY - minY;
    // zSpread: the depth of the 3D wrap. A cloth still lying in the Z=0 plane
    // reports ~0; a cloth wrapped around the body cylinder reports the wrap depth.
    res.zSpreadMM = maxZ - minZ;

    double maxStrain = 0.0;
    for (const auto& s : mesh.springs) {
        const double len = dist3(cur[s.a], cur[s.b]);
        if (s.rest > 1e-9) maxStrain = std::max(maxStrain, std::abs(len - s.rest) / s.rest);
    }
    res.maxSpringStrain = maxStrain;

    double penetration = 0.0;
    if (opts.bodyRadiusMM > 0.0) {
        for (size_t i = 0; i < n; ++i) {
            if (mesh.pinned[i]) continue;
            const double dx = cur[i].x - opts.bodyCenterX;
            const double dz = cur[i].z - opts.bodyCenterZ;
            const double r = std::sqrt(dx * dx + dz * dz);
            penetration = std::max(penetration, opts.bodyRadiusMM - r);
        }
    }
    res.bodyPenetrationMM = penetration;

    res.ok = !res.anyNaN;
    if (res.anyNaN) res.error = "simulation produced NaN/Inf (unstable)";
    return res;
}

DrapeResult drapePiece(const PatternPiece& piece, const DrapeOptions& opts) {
    const ClothMesh mesh = buildCloth(piece, opts);
    if (!mesh.ok) {
        DrapeResult r;
        r.error = mesh.error;
        return r;
    }
    return settle(mesh, opts);
}

std::string drapeSVG(const DrapeResult& result, const DrapeOptions& opts) {
    // Orthographic 3/4 projection: rotate the world (+Y up) so the Z-wrap shows.
    // Fixed azimuth 35°, elevation 20°. Deterministic.
    const double az = 35.0 * M_PI / 180.0;
    const double el = 20.0 * M_PI / 180.0;
    const double ca = std::cos(az), sa = std::sin(az);
    const double ce = std::cos(el), se = std::sin(el);
    auto project = [&](const Vec3& p) -> Point {
        // rotate about Y (azimuth), then tilt about X (elevation), orthographic.
        const double xr = p.x * ca + p.z * sa;
        const double zr = -p.x * sa + p.z * ca;
        const double yr = p.y * ce - zr * se;
        return {xr, -yr}; // SVG y-down: negate world-up Y
    };
    // Depth (camera-space) for painter's-algorithm ordering + facing shade.
    auto depth = [&](const Vec3& p) -> double {
        const double zr = -p.x * sa + p.z * ca;
        return p.y * se + zr * ce;
    };

    if (!result.ok || result.particles.empty()) {
        std::ostringstream err;
        err << "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='120'>"
            << "<text x='10' y='60' font-family='monospace' font-size='12'>drape failed: "
            << (result.error.empty() ? "empty" : result.error) << "</text></svg>";
        return err.str();
    }

    std::vector<Point> proj(result.particles.size());
    std::vector<double> pdepth(result.particles.size());
    double minx = 1e18, maxx = -1e18, miny = 1e18, maxy = -1e18;
    for (size_t i = 0; i < result.particles.size(); ++i) {
        proj[i] = project(result.particles[i]);
        pdepth[i] = depth(result.particles[i]);
        minx = std::min(minx, proj[i].x); maxx = std::max(maxx, proj[i].x);
        miny = std::min(miny, proj[i].y); maxy = std::max(maxy, proj[i].y);
    }
    const double pad = 30.0;
    const double w = (maxx - minx) + 2 * pad;
    const double h = (maxy - miny) + 2 * pad;
    auto sx = [&](double x) { return x - minx + pad; };
    auto sy = [&](double y) { return y - miny + pad; };

    // Painter's order: sort triangles back-to-front by average depth.
    std::vector<std::pair<double, size_t>> order;
    order.reserve(result.tris.size());
    for (size_t t = 0; t < result.tris.size(); ++t) {
        const auto& tr = result.tris[t];
        const double d = (pdepth[tr.a] + pdepth[tr.b] + pdepth[tr.c]) / 3.0;
        order.push_back({d, t});
    }
    std::sort(order.begin(), order.end(),
              [](const auto& l, const auto& r) { return l.first < r.first; });

    std::ostringstream svg;
    svg << "<svg xmlns='http://www.w3.org/2000/svg' width='" << num(w)
        << "' height='" << num(h) << "' viewBox='0 0 " << num(w) << " " << num(h) << "'>";
    svg << "<rect width='100%' height='100%' fill='#f4efe7'/>";

    for (const auto& od : order) {
        const auto& tr = result.tris[od.second];
        const Point a = proj[tr.a], b = proj[tr.b], c = proj[tr.c];
        // Shade by screen-space signed area sign (facing) + depth for AO feel.
        const double area = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
        const int base = area >= 0 ? 210 : 170; // front vs back face
        // Depth darkening across the piece.
        double d = od.first;
        double dn = (maxy - miny) > 1e-9 ? (d - order.front().first) /
                        std::max(1.0, order.back().first - order.front().first) : 0.5;
        const int shade = std::max(60, std::min(235, base - static_cast<int>(dn * 60.0)));
        svg << "<polygon points='"
            << num(sx(a.x)) << "," << num(sy(a.y)) << " "
            << num(sx(b.x)) << "," << num(sy(b.y)) << " "
            << num(sx(c.x)) << "," << num(sy(c.y))
            << "' fill='rgb(" << shade << "," << (shade - 20) << "," << (shade - 45)
            << ")' stroke='#7a6a55' stroke-width='0.4' stroke-opacity='0.5'/>";
    }

    // Pinned edge highlighted (the waist/neck the garment hangs from).
    for (size_t i = 0; i < result.particles.size(); ++i) {
        if (!result.pinned[i]) continue;
        svg << "<circle cx='" << num(sx(proj[i].x)) << "' cy='" << num(sy(proj[i].y))
            << "' r='1.6' fill='#c0392b'/>";
    }
    (void)opts;
    svg << "</svg>";
    return svg.str();
}

} // namespace drape
} // namespace stitchu
