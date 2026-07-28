#include "dxf.hpp"

#include <cstdio>
#include <sstream>

namespace stitchu {
namespace dxf {

namespace {

// Motor mm (y-down) -> DXF frame (y-up). x unchanged, y negated.
inline Point toDxf(Point p) { return {p.x, -p.y}; }

// %.4f — the same precision the golden dump / recipe-json-dump use, so the DXF
// coordinates are the motor mm at the pinned precision (no extra rounding path).
std::string num(double v) {
    char buf[64];
    std::snprintf(buf, sizeof(buf), "%.4f", v);
    return buf;
}

// Flatten a command path into a list of subpath polylines (motor frame),
// marking each closed/open. A Move starts a new subpath; Close closes the
// current one. Curves flatten via the motor's flattenCubic (dropping the
// duplicated first sample so vertices are not repeated).
struct Sub {
    bool closed = false;
    std::vector<Point> pts; // motor frame
};

std::vector<Sub> flattenPath(const std::vector<PathCommand>& cmds, int steps) {
    std::vector<Sub> subs;
    Sub cur;
    bool open = false;
    Point current{0.0, 0.0};
    Point start{0.0, 0.0};
    auto flush = [&](bool closed) {
        if (open && cur.pts.size() >= 2) {
            cur.closed = closed;
            subs.push_back(std::move(cur));
        }
        cur = Sub{};
        open = false;
    };
    for (const auto& c : cmds) {
        switch (c.type) {
            case CmdType::Move:
                flush(false);
                cur.pts.push_back(c.to);
                current = c.to;
                start = c.to;
                open = true;
                break;
            case CmdType::Line:
                if (open) cur.pts.push_back(c.to);
                current = c.to;
                break;
            case CmdType::Curve: {
                const auto samples = flattenCubic(current, c.to, c.cp1, c.cp2, steps);
                // samples[0] == current (already pushed); append the rest.
                for (size_t i = 1; i < samples.size(); ++i) cur.pts.push_back(samples[i]);
                current = c.to;
                break;
            }
            case CmdType::Close:
                flush(true);
                current = start;
                break;
        }
    }
    flush(false);
    return subs;
}

void appendPolylines(std::vector<DxfPolyline>& out, const std::string& layer,
                     const std::vector<PathCommand>& cmds, int steps) {
    for (auto& sub : flattenPath(cmds, steps)) {
        DxfPolyline pl;
        pl.layer = layer;
        pl.closed = sub.closed;
        pl.points.reserve(sub.pts.size());
        for (const auto& p : sub.pts) pl.points.push_back(toDxf(p));
        out.push_back(std::move(pl));
    }
}

// R12 DXF group-code writer helpers.
void gc(std::ostream& o, int code, const std::string& val) { o << code << "\n" << val << "\n"; }
void gc(std::ostream& o, int code, double val) { o << code << "\n" << num(val) << "\n"; }
void gc(std::ostream& o, int code, int val) { o << code << "\n" << val << "\n"; }

} // namespace

DxfPiece flattenPiece(const PatternPiece& piece, int steps) {
    DxfPiece out;
    out.name = piece.name;
    // Boundary = cutting line when present (strip pieces have empty cutLine —
    // then no boundary layer for them; we do NOT fabricate one).
    if (!piece.cutLine.empty())
        appendPolylines(out.polylines, Layers::kBoundary, piece.cutLine, steps);
    // Seamline = the sewing outline (always present).
    appendPolylines(out.polylines, Layers::kSeamline, piece.commands, steps);
    // Internal lines = darts + fold lines.
    appendPolylines(out.polylines, Layers::kInternal, piece.markings, steps);
    // Balance notches.
    appendPolylines(out.polylines, Layers::kNotch, piece.notches, steps);
    // Grainline (a single straight segment) as a 2-point polyline.
    if (piece.hasGrainline) {
        DxfPolyline g;
        g.layer = Layers::kGrainline;
        g.closed = false;
        g.points.push_back(toDxf(piece.grainline.from));
        g.points.push_back(toDxf(piece.grainline.to));
        out.polylines.push_back(std::move(g));
    }
    // Annotation: piece name at the piece's top-left (min x, top y in DXF frame).
    if (!out.polylines.empty()) {
        double minX = out.polylines[0].points[0].x;
        double maxY = out.polylines[0].points[0].y;
        for (const auto& pl : out.polylines)
            for (const auto& p : pl.points) {
                if (p.x < minX) minX = p.x;
                if (p.y > maxY) maxY = p.y;
            }
        DxfText t;
        t.layer = Layers::kAnnotation;
        t.at = {minX, maxY + 8.0};
        t.height = 12.0;
        t.text = piece.name;
        out.texts.push_back(std::move(t));
    }
    return out;
}

std::string writeDocument(const std::vector<DxfPiece>& pieces) {
    std::ostringstream o;

    // Compute the drawing extents across all pieces (for $EXTMIN/$EXTMAX).
    bool any = false;
    double minX = 0, minY = 0, maxX = 0, maxY = 0;
    auto bump = [&](Point p) {
        if (!any) { minX = maxX = p.x; minY = maxY = p.y; any = true; return; }
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    };
    for (const auto& pc : pieces) {
        for (const auto& pl : pc.polylines) for (const auto& p : pl.points) bump(p);
        for (const auto& t : pc.texts) bump(t.at);
    }

    // ---- HEADER ----
    gc(o, 0, std::string("SECTION"));
    gc(o, 2, std::string("HEADER"));
    gc(o, 9, std::string("$ACADVER")); gc(o, 1, std::string("AC1009")); // R12
    gc(o, 9, std::string("$INSUNITS")); gc(o, 70, 4);                    // 4 = millimeters
    gc(o, 9, std::string("$EXTMIN"));
    gc(o, 10, minX); gc(o, 20, minY);
    gc(o, 9, std::string("$EXTMAX"));
    gc(o, 10, maxX); gc(o, 20, maxY);
    gc(o, 0, std::string("ENDSEC"));

    // ---- TABLES: layer definitions (AAMA/ASTM layer names) ----
    struct LayerDef { const char* name; int color; };
    const LayerDef layerDefs[] = {
        {Layers::kBoundary,   7},  // white/black
        {Layers::kSeamline,   1},  // red
        {Layers::kGrainline,  3},  // green
        {Layers::kNotch,      5},  // blue
        {Layers::kInternal,   2},  // yellow
        {Layers::kAnnotation, 4},  // cyan
    };
    gc(o, 0, std::string("SECTION"));
    gc(o, 2, std::string("TABLES"));
    gc(o, 0, std::string("TABLE"));
    gc(o, 2, std::string("LAYER"));
    gc(o, 70, static_cast<int>(sizeof(layerDefs) / sizeof(layerDefs[0])));
    for (const auto& ld : layerDefs) {
        gc(o, 0, std::string("LAYER"));
        gc(o, 2, std::string(ld.name));
        gc(o, 70, 0);
        gc(o, 62, ld.color);
        gc(o, 6, std::string("CONTINUOUS"));
    }
    gc(o, 0, std::string("ENDTAB"));
    gc(o, 0, std::string("ENDSEC"));

    // ---- ENTITIES ----
    gc(o, 0, std::string("SECTION"));
    gc(o, 2, std::string("ENTITIES"));
    for (const auto& pc : pieces) {
        for (const auto& pl : pc.polylines) {
            gc(o, 0, std::string("POLYLINE"));
            gc(o, 8, pl.layer);
            gc(o, 66, 1);                        // vertices follow
            gc(o, 70, pl.closed ? 1 : 0);        // 1 = closed
            for (const auto& p : pl.points) {
                gc(o, 0, std::string("VERTEX"));
                gc(o, 8, pl.layer);
                gc(o, 10, p.x);
                gc(o, 20, p.y);
                gc(o, 30, 0.0);
            }
            gc(o, 0, std::string("SEQEND"));
        }
        for (const auto& t : pc.texts) {
            gc(o, 0, std::string("TEXT"));
            gc(o, 8, t.layer);
            gc(o, 10, t.at.x);
            gc(o, 20, t.at.y);
            gc(o, 30, 0.0);
            gc(o, 40, t.height);
            gc(o, 1, t.text);
        }
    }
    gc(o, 0, std::string("ENDSEC"));

    gc(o, 0, std::string("EOF"));
    return o.str();
}

std::string exportPattern(const DraftedPattern& pattern, int steps) {
    std::vector<DxfPiece> pieces;
    pieces.reserve(pattern.pieces.size());
    for (const auto& p : pattern.pieces) pieces.push_back(flattenPiece(p, steps));
    return writeDocument(pieces);
}

} // namespace dxf
} // namespace stitchu
