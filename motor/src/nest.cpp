#include "nest.hpp"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <sstream>

#include "dxf.hpp"

namespace stitchu {
namespace nest {

namespace {

// Motor mm formatter — the same %.4f the golden dump / dxf writer use, so the
// marker coordinates are the motor mm at the pinned precision.
std::string num(double v) {
    char buf[64];
    std::snprintf(buf, sizeof(buf), "%.4f", v);
    return buf;
}

// The BOUNDARY polygon of a piece for nesting: the flattened cut line when the
// piece has one, otherwise the seamline (strip pieces carry no cut line — same
// honest rule as dxf::flattenPiece, which never fabricates a boundary). We take
// the LARGEST closed subpath (the piece outline), ignoring internal marking loops
// that dxf keeps on other layers. Points come back in the MOTOR frame (y-down):
// dxf::flattenPiece negates y for the DXF frame, so we negate back.
std::vector<Point> boundaryPolygon(const PatternPiece& piece, int steps) {
    const dxf::DxfPiece flat = dxf::flattenPiece(piece, steps);
    // dxf layer "1" = boundary (cut line); "8" = seamline. Prefer boundary.
    const std::vector<Point>* best = nullptr;
    size_t bestN = 0;
    auto consider = [&](const dxf::DxfPolyline& pl) {
        if (!pl.closed) return;
        if (pl.points.size() > bestN) { best = &pl.points; bestN = pl.points.size(); }
    };
    for (const auto& pl : flat.polylines)
        if (pl.layer == dxf::Layers::kBoundary) consider(pl);
    if (!best) // no cut line (strip piece): fall back to the seamline outline
        for (const auto& pl : flat.polylines)
            if (pl.layer == dxf::Layers::kSeamline) consider(pl);
    std::vector<Point> out;
    if (best) {
        out.reserve(best->size());
        for (const auto& p : *best) out.push_back({p.x, -p.y}); // DXF y-up -> motor y-down
    }
    return out;
}

// Orientation of the ordered triple (a,b,c): >0 ccw, <0 cw, 0 collinear.
double orient(Point a, Point b, Point c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

bool onSegment(Point a, Point b, Point p) {
    return std::min(a.x, b.x) - 1e-9 <= p.x && p.x <= std::max(a.x, b.x) + 1e-9 &&
           std::min(a.y, b.y) - 1e-9 <= p.y && p.y <= std::max(a.y, b.y) + 1e-9;
}

// Proper OR improper segment intersection (endpoints/collinear-overlap count).
bool segmentsIntersect(Point p1, Point p2, Point p3, Point p4) {
    const double d1 = orient(p3, p4, p1);
    const double d2 = orient(p3, p4, p2);
    const double d3 = orient(p1, p2, p3);
    const double d4 = orient(p1, p2, p4);
    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0)))
        return true;
    if (std::abs(d1) < 1e-9 && onSegment(p3, p4, p1)) return true;
    if (std::abs(d2) < 1e-9 && onSegment(p3, p4, p2)) return true;
    if (std::abs(d3) < 1e-9 && onSegment(p1, p2, p3)) return true;
    if (std::abs(d4) < 1e-9 && onSegment(p1, p2, p4)) return true;
    return false;
}

// Is point q strictly inside the closed polygon (even-odd ray cast)?
bool pointInPolygon(const std::vector<Point>& poly, Point q) {
    bool inside = false;
    const size_t n = poly.size();
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

} // namespace

double polygonArea(const std::vector<Point>& pts) {
    if (pts.size() < 3) return 0.0;
    double a = 0.0;
    for (size_t i = 0, j = pts.size() - 1; i < pts.size(); j = i++)
        a += (pts[j].x + pts[i].x) * (pts[j].y - pts[i].y);
    return std::abs(a) * 0.5;
}

Rect polygonBounds(const std::vector<Point>& pts) {
    if (pts.empty()) return {};
    double minX = pts[0].x, minY = pts[0].y, maxX = pts[0].x, maxY = pts[0].y;
    for (const auto& p : pts) {
        minX = std::min(minX, p.x); minY = std::min(minY, p.y);
        maxX = std::max(maxX, p.x); maxY = std::max(maxY, p.y);
    }
    return {minX, minY, maxX - minX, maxY - minY};
}

std::vector<PiecePolygon> piecePolygons(const DraftedPattern& pattern, int steps) {
    std::vector<PiecePolygon> out;
    for (const auto& piece : pattern.pieces) {
        std::vector<Point> pts = boundaryPolygon(piece, steps);
        if (pts.size() < 3) continue; // no drawable boundary — skip honestly
        PiecePolygon pp;
        pp.name = piece.name;
        pp.pts = std::move(pts);
        pp.area = polygonArea(pp.pts);
        out.push_back(std::move(pp));
    }
    return out;
}

bool polygonsOverlap(const std::vector<Point>& a, const std::vector<Point>& b) {
    if (a.size() < 3 || b.size() < 3) return false;
    // Cheap bbox reject first.
    const Rect ra = polygonBounds(a), rb = polygonBounds(b);
    if (ra.x + ra.width < rb.x || rb.x + rb.width < ra.x ||
        ra.y + ra.height < rb.y || rb.y + rb.height < ra.y)
        return false;
    // Any edge pair crossing => overlap.
    for (size_t i = 0, ni = a.size(); i < ni; ++i) {
        const Point a1 = a[i], a2 = a[(i + 1) % ni];
        for (size_t j = 0, nj = b.size(); j < nj; ++j) {
            const Point b1 = b[j], b2 = b[(j + 1) % nj];
            if (segmentsIntersect(a1, a2, b1, b2)) {
                // A shared/touching boundary is NOT overlap: only count it if it
                // is a PROPER crossing. Grazing edges are filtered by requiring a
                // vertex of one inside the other (below) — but a proper crossing
                // is unambiguous, so accept it here.
                const double d1 = orient(b1, b2, a1);
                const double d2 = orient(b1, b2, a2);
                const double d3 = orient(a1, a2, b1);
                const double d4 = orient(a1, a2, b2);
                const bool proper =
                    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
                    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
                if (proper) return true;
            }
        }
    }
    // No crossing: one may be fully nested inside the other. Test a vertex.
    if (pointInPolygon(b, a[0])) return true;
    if (pointInPolygon(a, b[0])) return true;
    return false;
}

std::vector<Point> placedPolygon(const std::vector<PiecePolygon>& polys,
                                 const Placement& pl) {
    std::vector<Point> out;
    if (pl.pieceIndex < 0 || pl.pieceIndex >= (int)polys.size()) return out;
    const auto& src = polys[pl.pieceIndex].pts;
    out.reserve(src.size());
    for (const auto& p : src) {
        // 90° CW about origin: (x, y) -> (y, -x). Then translate.
        const Point r = pl.rotated90 ? Point{p.y, -p.x} : p;
        out.push_back({r.x + pl.dx, r.y + pl.dy});
    }
    return out;
}

NestResult nestPieces(const std::vector<PiecePolygon>& polys,
                      double fabricWidthMM,
                      const NestOptions& opts) {
    NestResult r;
    r.fabricWidthMM = fabricWidthMM;
    if (fabricWidthMM <= 0) { r.error = "fabric width must be > 0"; return r; }

    // Sort by descending oriented bounding-box height for a tidy shelf pack;
    // stable so ties keep input (document) order — determinism.
    struct Item { int idx; double w, h; bool rot; }; // w,h = footprint AFTER best fit
    std::vector<int> order(polys.size());
    for (size_t i = 0; i < polys.size(); ++i) order[i] = (int)i;

    // Per-piece: choose the orientation whose WIDTH fits the fabric; prefer the
    // shorter height (packs the roll shorter). If neither fits, honest refuse.
    auto footprint = [&](int idx, bool rot) -> Rect {
        // 90° CW: (x,y)->(y,-x); bbox width<->height swap, so just swap dims of
        // the un-rotated bbox.
        const Rect b = polygonBounds(polys[idx].pts);
        return rot ? Rect{0, 0, b.height, b.width} : Rect{0, 0, b.width, b.height};
    };
    std::vector<Item> items;
    items.reserve(polys.size());
    for (int idx : order) {
        const Rect f0 = footprint(idx, false);
        const Rect f1 = footprint(idx, true);
        const bool fit0 = f0.width <= fabricWidthMM + 1e-6;
        const bool fit1 = opts.rotate && f1.width <= fabricWidthMM + 1e-6;
        if (!fit0 && !fit1) {
            r.error = "piece '" + polys[idx].name + "' (" + num(f0.width) +
                      "mm wide) does not fit fabric width " + num(fabricWidthMM) + "mm";
            return r;
        }
        bool rot;
        Rect f;
        if (fit0 && fit1) { // both fit: take the orientation that is shorter (roll-saving)
            if (f1.height < f0.height) { rot = true;  f = f1; }
            else                       { rot = false; f = f0; }
        } else if (fit0)   { rot = false; f = f0; }
        else               { rot = true;  f = f1; }
        items.push_back({idx, f.width, f.height, rot});
    }
    std::stable_sort(items.begin(), items.end(),
                     [](const Item& a, const Item& b) { return a.h > b.h; });

    // Shelf pack: fill a shelf left-to-right; when the next piece won't fit the
    // remaining width, open a new shelf below (shelf y advances by prev shelf
    // height + gap). x advances by piece width + gap.
    const double gap = opts.gapMM;
    double shelfY = 0.0;      // top of current shelf (min y)
    double shelfH = 0.0;      // tallest piece on current shelf
    double cursorX = 0.0;     // left edge for the next piece
    double maxY = 0.0;
    for (const Item& it : items) {
        if (cursorX > 0 && cursorX + it.w > fabricWidthMM + 1e-6) {
            // new shelf
            shelfY += shelfH + gap;
            shelfH = 0.0;
            cursorX = 0.0;
        }
        // Translate the piece so its (rotated) bbox min-corner lands at
        // (cursorX, shelfY). Rotation is about origin; compute the rotated bbox
        // min so the translation is exact.
        Placement pl;
        pl.pieceIndex = it.idx;
        pl.rotated90 = it.rot;
        // rotated polygon bbox min:
        double minX = 1e18, minY = 1e18;
        for (const auto& p : polys[it.idx].pts) {
            const Point rp = it.rot ? Point{p.y, -p.x} : p;
            minX = std::min(minX, rp.x);
            minY = std::min(minY, rp.y);
        }
        pl.dx = cursorX - minX;
        pl.dy = shelfY - minY;
        r.placements.push_back(pl);

        cursorX += it.w + gap;
        shelfH = std::max(shelfH, it.h);
        maxY = std::max(maxY, shelfY + it.h);
    }

    r.ok = true;
    r.usedLengthMM = maxY;
    double area = 0.0;
    for (const auto& pp : polys) area += pp.area;
    r.usedAreaMM2 = area;
    const double denom = fabricWidthMM * (maxY > 0 ? maxY : 1.0);
    r.efficiency = denom > 0 ? area / denom : 0.0;
    return r;
}

std::string nestSVG(const std::vector<PiecePolygon>& polys, const NestResult& result) {
    std::ostringstream o;
    const double W = result.fabricWidthMM;
    const double H = result.usedLengthMM > 0 ? result.usedLengthMM : 1.0;
    const double pad = 20.0;
    o << "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" << num(W + 2 * pad)
      << "mm\" height=\"" << num(H + 2 * pad) << "mm\" viewBox=\""
      << num(-pad) << " " << num(-pad) << " " << num(W + 2 * pad) << " "
      << num(H + 2 * pad) << "\">";
    // fabric strip
    o << "<rect x=\"0\" y=\"0\" width=\"" << num(W) << "\" height=\"" << num(H)
      << "\" fill=\"#f5efe3\" stroke=\"#b9a88a\" stroke-width=\"1.5\"/>";
    for (const auto& pl : result.placements) {
        const auto poly = placedPolygon(polys, pl);
        if (poly.empty()) continue;
        o << "<path d=\"M " << num(poly[0].x) << " " << num(poly[0].y);
        for (size_t i = 1; i < poly.size(); ++i)
            o << " L " << num(poly[i].x) << " " << num(poly[i].y);
        o << " Z\" fill=\"#d8c7a8\" fill-opacity=\"0.55\" stroke=\"#3a2f1e\" stroke-width=\"1.2\"/>";
        const Rect b = polygonBounds(poly);
        o << "<text x=\"" << num(b.x + b.width / 2) << "\" y=\"" << num(b.y + b.height / 2)
          << "\" font-family=\"monospace\" font-size=\"14\" fill=\"#2a2213\" "
          << "text-anchor=\"middle\">" << polys[pl.pieceIndex].name << "</text>";
    }
    o << "</svg>";
    return o.str();
}

std::string nestDXF(const std::vector<PiecePolygon>& polys, const NestResult& result) {
    // One DxfPiece per placement: the placed cut polygon on the boundary layer.
    std::vector<dxf::DxfPiece> pieces;
    pieces.reserve(result.placements.size());
    for (const auto& pl : result.placements) {
        const auto poly = placedPolygon(polys, pl);
        if (poly.size() < 3) continue;
        dxf::DxfPiece dp;
        dp.name = polys[pl.pieceIndex].name;
        dxf::DxfPolyline line;
        line.layer = dxf::Layers::kBoundary;
        line.closed = true;
        for (const auto& p : poly) line.points.push_back({p.x, -p.y}); // motor y-down -> DXF y-up
        dp.polylines.push_back(std::move(line));
        // label at the polygon's DXF top-left
        double minX = poly[0].x, maxY = -poly[0].y;
        for (const auto& p : poly) { minX = std::min(minX, p.x); maxY = std::max(maxY, -p.y); }
        dxf::DxfText t;
        t.layer = dxf::Layers::kAnnotation;
        t.at = {minX, maxY + 8.0};
        t.height = 12.0;
        t.text = dp.name;
        dp.texts.push_back(std::move(t));
        pieces.push_back(std::move(dp));
    }
    return dxf::writeDocument(pieces);
}

} // namespace nest
} // namespace stitchu
