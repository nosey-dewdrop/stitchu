// graf.cpp — GRAF IR: JSON, landmark noktasi, Edge/Panel/Seam/Garment, sema. Bkz. graf.hpp.
#include "graf.hpp"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <stdexcept>

namespace stitchu {
namespace graf {

// ============================================================================ JSON
bool JVal::has(const std::string& k) const { return get(k) != nullptr; }
const JVal* JVal::get(const std::string& k) const {
    if (tip != Obj) return nullptr;
    for (const auto& kv : o) if (kv.first == k) return &kv.second;
    return nullptr;
}
JVal& JVal::set(const std::string& k, JVal v) {
    tip = Obj;
    for (auto& kv : o) if (kv.first == k) { kv.second = std::move(v); return kv.second; }
    o.emplace_back(k, std::move(v));
    return o.back().second;
}
double JVal::numOr(const std::string& k, double d) const { const JVal* v = get(k); return (v && v->tip == Num) ? v->n : d; }
std::string JVal::strOr(const std::string& k, const std::string& d) const { const JVal* v = get(k); return (v && v->tip == Str) ? v->s : d; }
bool JVal::boolOr(const std::string& k, bool d) const { const JVal* v = get(k); return (v && v->tip == Bool) ? v->b : d; }

std::string fmtNum(double v) {
    if (std::isnan(v) || std::isinf(v)) throw std::runtime_error("graf json: sayi NaN/inf yazilamaz");
    if (v == 0.0) return "0";
    char buf[40];
    for (int p = 1; p <= 17; ++p) {
        std::snprintf(buf, sizeof buf, "%.*g", p, v);
        if (std::strtod(buf, nullptr) == v) break;
    }
    return buf;
}

namespace {
std::string escapeStr(const std::string& s) {
    std::string out = "\"";
    for (unsigned char c : s) {
        switch (c) {
            case '"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\n': out += "\\n"; break;
            case '\t': out += "\\t"; break;
            case '\r': out += "\\r"; break;
            default:
                if (c < 0x20) { char b[8]; std::snprintf(b, sizeof b, "\\u%04x", c); out += b; }
                else out += static_cast<char>(c);
        }
    }
    return out + "\"";
}
bool scalarArray(const JVal& v) {
    for (const auto& e : v.a) if (e.tip == JVal::Arr || e.tip == JVal::Obj) return false;
    return true;
}
void emitInto(const JVal& v, int indent, std::string& out) {
    const std::string pad(indent * 2, ' '), pad1((indent + 1) * 2, ' ');
    switch (v.tip) {
        case JVal::Null: out += "null"; return;
        case JVal::Bool: out += v.b ? "true" : "false"; return;
        case JVal::Num: out += fmtNum(v.n); return;
        case JVal::Str: out += escapeStr(v.s); return;
        case JVal::Arr:
            if (v.a.empty()) { out += "[]"; return; }
            if (scalarArray(v)) {
                out += "[";
                for (size_t i = 0; i < v.a.size(); ++i) { if (i) out += ", "; emitInto(v.a[i], indent + 1, out); }
                out += "]";
                return;
            }
            out += "[\n";
            for (size_t i = 0; i < v.a.size(); ++i) {
                out += pad1; emitInto(v.a[i], indent + 1, out);
                out += (i + 1 < v.a.size()) ? ",\n" : "\n";
            }
            out += pad + "]";
            return;
        case JVal::Obj:
            if (v.o.empty()) { out += "{}"; return; }
            out += "{\n";
            for (size_t i = 0; i < v.o.size(); ++i) {
                out += pad1 + escapeStr(v.o[i].first) + ": ";
                emitInto(v.o[i].second, indent + 1, out);
                out += (i + 1 < v.o.size()) ? ",\n" : "\n";
            }
            out += pad + "}";
            return;
    }
}

struct Reader {
    const std::string& t; size_t i = 0; std::string err;
    explicit Reader(const std::string& s) : t(s) {}
    void ws() { while (i < t.size() && (t[i] == ' ' || t[i] == '\n' || t[i] == '\t' || t[i] == '\r')) ++i; }
    bool fail(const std::string& m) { if (err.empty()) err = m + " (konum " + std::to_string(i) + ")"; return false; }
    bool value(JVal& out) {
        ws();
        if (i >= t.size()) return fail("beklenmedik son");
        const char c = t[i];
        if (c == '{') return object(out);
        if (c == '[') return array(out);
        if (c == '"') { out.tip = JVal::Str; return string(out.s); }
        if (t.compare(i, 4, "true") == 0) { i += 4; out = JVal::boolean(true); return true; }
        if (t.compare(i, 5, "false") == 0) { i += 5; out = JVal::boolean(false); return true; }
        if (t.compare(i, 4, "null") == 0) { i += 4; out = JVal::null(); return true; }
        return number(out);
    }
    bool number(JVal& out) {
        const char* start = t.c_str() + i; char* end = nullptr;
        const double v = std::strtod(start, &end);
        if (end == start) return fail("sayi bekleniyordu");
        i += static_cast<size_t>(end - start);
        out = JVal::num(v);
        return true;
    }
    bool string(std::string& s) {
        if (t[i] != '"') return fail("metin bekleniyordu");
        ++i; s.clear();
        while (i < t.size()) {
            const char c = t[i++];
            if (c == '"') return true;
            if (c == '\\') {
                if (i >= t.size()) return fail("kacis kesik");
                const char e = t[i++];
                switch (e) {
                    case '"': s += '"'; break; case '\\': s += '\\'; break; case '/': s += '/'; break;
                    case 'n': s += '\n'; break; case 't': s += '\t'; break; case 'r': s += '\r'; break;
                    case 'b': s += '\b'; break; case 'f': s += '\f'; break;
                    case 'u': {
                        if (i + 4 > t.size()) return fail("\\u kesik");
                        const unsigned cp = static_cast<unsigned>(std::strtoul(t.substr(i, 4).c_str(), nullptr, 16)); i += 4;
                        if (cp < 0x80) s += static_cast<char>(cp);
                        else if (cp < 0x800) { s += static_cast<char>(0xC0 | (cp >> 6)); s += static_cast<char>(0x80 | (cp & 0x3F)); }
                        else { s += static_cast<char>(0xE0 | (cp >> 12)); s += static_cast<char>(0x80 | ((cp >> 6) & 0x3F)); s += static_cast<char>(0x80 | (cp & 0x3F)); }
                        break;
                    }
                    default: return fail("bilinmeyen kacis");
                }
            } else s += c;
        }
        return fail("metin kapanmadi");
    }
    bool array(JVal& out) {
        out = JVal::arr(); ++i; ws();
        if (i < t.size() && t[i] == ']') { ++i; return true; }
        while (true) {
            JVal e; if (!value(e)) return false; out.a.push_back(std::move(e));
            ws(); if (i >= t.size()) return fail("dizi kapanmadi");
            if (t[i] == ',') { ++i; continue; }
            if (t[i] == ']') { ++i; return true; }
            return fail("dizide , ya da ] bekleniyordu");
        }
    }
    bool object(JVal& out) {
        out = JVal::obj(); ++i; ws();
        if (i < t.size() && t[i] == '}') { ++i; return true; }
        while (true) {
            ws(); std::string k; if (!string(k)) return false;
            ws(); if (i >= t.size() || t[i] != ':') return fail("nesnede : bekleniyordu"); ++i;
            JVal v; if (!value(v)) return false;
            for (const auto& kv : out.o) if (kv.first == k) return fail("tekrar eden anahtar: " + k);
            out.o.emplace_back(k, std::move(v));
            ws(); if (i >= t.size()) return fail("nesne kapanmadi");
            if (t[i] == ',') { ++i; continue; }
            if (t[i] == '}') { ++i; return true; }
            return fail("nesnede , ya da } bekleniyordu");
        }
    }
};
} // namespace

std::string emit(const JVal& v, int indent) { std::string out; emitInto(v, indent, out); return out; }
bool parse(const std::string& text, JVal& out, std::string& err) {
    Reader r(text);
    if (!r.value(out)) { err = r.err; return false; }
    r.ws();
    if (r.i != text.size()) { err = "belge sonunda fazlalik (konum " + std::to_string(r.i) + ")"; return false; }
    return true;
}

// ============================================================================ Nokta
namespace {
bool feq(double a, double b) { return std::fabs(a - b) <= 1e-9 * std::max(1.0, std::max(std::fabs(a), std::fabs(b))); }
int cmpAnchor(const Anchor& x, const Anchor& y) {
    if (x.landmark != y.landmark) return x.landmark < y.landmark ? -1 : 1;
    if (x.xOf != y.xOf) return x.xOf < y.xOf ? -1 : 1;
    if (x.ring != y.ring) return x.ring < y.ring ? -1 : 1;
    if (!feq(x.oran, y.oran)) return x.oran < y.oran ? -1 : 1;
    if (!feq(x.ofsetMM, y.ofsetMM)) return x.ofsetMM < y.ofsetMM ? -1 : 1;
    if (x.yLandmark != y.yLandmark) return x.yLandmark < y.yLandmark ? -1 : 1;
    if (x.yLandmark2 != y.yLandmark2) return x.yLandmark2 < y.yLandmark2 ? -1 : 1;
    if (!feq(x.yOran, y.yOran)) return x.yOran < y.yOran ? -1 : 1;
    if (!feq(x.yOfsetMM, y.yOfsetMM)) return x.yOfsetMM < y.yOfsetMM ? -1 : 1;
    return 0;
}
} // namespace

bool Anchor::operator==(const Anchor& o) const { return cmpAnchor(*this, o) == 0; }

void RefPoint::normalize() {
    std::vector<Term> out;
    for (const Term& t : terms) {
        bool merged = false;
        for (Term& u : out) if (cmpAnchor(u.a, t.a) == 0) { u.w += t.w; merged = true; break; }
        if (!merged) out.push_back(t);
    }
    out.erase(std::remove_if(out.begin(), out.end(), [](const Term& t) { return std::fabs(t.w) < 1e-12; }), out.end());
    std::sort(out.begin(), out.end(), [](const Term& x, const Term& y) { return cmpAnchor(x.a, y.a) < 0; });
    terms = std::move(out);
}
bool RefPoint::operator==(const RefPoint& o) const {
    RefPoint a = *this, b = o; a.normalize(); b.normalize();
    if (a.terms.size() != b.terms.size()) return false;
    for (size_t i = 0; i < a.terms.size(); ++i)
        if (!feq(a.terms[i].w, b.terms[i].w) || cmpAnchor(a.terms[i].a, b.terms[i].a) != 0) return false;
    return true;
}
bool RefPoint::xSifir() const {
    for (const Term& t : terms) if (!(feq(t.a.oran, 0.0) && feq(t.a.ofsetMM, 0.0))) return false;
    return !terms.empty();
}

RefPoint lerp(const RefPoint& a, const RefPoint& b, double t) { return affine({{1.0 - t, a}, {t, b}}); }
RefPoint affine(const std::vector<std::pair<double, RefPoint>>& terms) {
    RefPoint out; double sum = 0;
    for (const auto& wp : terms) {
        sum += wp.first;
        for (const Term& t : wp.second.terms) out.terms.push_back({wp.first * t.w, t.a});
    }
    if (!feq(sum, 1.0)) throw std::runtime_error("graf: afin birlesim agirliklari 1'e toplanmiyor (" + fmtNum(sum) + ")");
    out.normalize();
    return out;
}
RefPoint scaleX(const RefPoint& p, double k) {
    RefPoint out = p;
    for (Term& t : out.terms) { t.a.oran *= k; t.a.ofsetMM *= k; }
    out.normalize();
    return out;
}
RefPoint shiftY(const RefPoint& p, double dyMM) {
    RefPoint out = p;
    for (Term& t : out.terms) t.a.yOfsetMM += dyMM;   // her terim ayni kaymayi alir: sum w x dy = dy
    out.normalize();
    return out;
}
RefPoint mirrorX(const RefPoint& p) { return scaleX(p, -1.0); }

double EvalCtx::bolluk(const std::string& ring) const {
    for (const auto& kv : bollukMM) if (kv.first == ring) return kv.second;
    return 0.0;
}

Point eval(const Anchor& a, const EvalCtx& ctx) {
    if (!ctx.body) throw std::runtime_error("graf eval: Body yok");
    const Body& body = *ctx.body;
    const BodyPoint L = body.landmark(a.landmark);   // yoksa body firlatir (adiyla)
    const std::string ring = a.ring.empty() ? Body::ringOfLandmark(a.landmark) : a.ring;
    double baseX = 0.0;
    if (a.xOf == "landmark") {
        baseX = L.x;
        if (!ring.empty() && body.hasRing(ring)) {
            const double G = body.ring(ring), E = ctx.bolluk(ring);
            if (G > 0) baseX *= (1.0 + E / G);   // bolluk cevreyi orantili buyutur
        }
    } else if (a.xOf == "ringFront" || a.xOf == "ringBack" || a.xOf == "ringQuarter") {
        if (ring.empty() || !body.hasRing(ring))
            throw std::runtime_error("graf eval: " + a.landmark + " icin halka yok (" + a.xOf + ", ring='" + ring + "', " + body.id() + ")");
        const double G = body.ring(ring) + ctx.bolluk(ring);
        const double backFrac = ctx.onArkaEsit ? 0.5 : body.ringBackFrac(ring);
        const double pay = a.xOf == "ringFront" ? (1.0 - backFrac) : a.xOf == "ringBack" ? backFrac : 0.5;
        baseX = G * pay / 2.0;
    } else if (a.xOf == "scalarHalf") {
        // beden GENISLIK olcusunun yarisi (width.crossFront gibi): ring alani olcunun adini tasir
        if (a.ring.empty() || !body.hasScalar(a.ring))
            throw std::runtime_error("graf eval: " + a.landmark + " icin genislik olcusu yok (scalarHalf, ring='" + a.ring + "', " + body.id() + ")");
        baseX = body.scalar(a.ring) / 2.0;
    } else {
        throw std::runtime_error("graf eval: bilinmeyen xOf '" + a.xOf + "' (" + a.landmark + ")");
    }
    const double x = a.oran * baseX + a.ofsetMM;
    double y = a.yLandmark.empty() ? L.y : body.landmark(a.yLandmark).y;
    if (!a.yLandmark2.empty()) {
        const double y2 = body.landmark(a.yLandmark2).y;
        y = y + a.yOran * (y2 - y);
    }
    y += a.yOfsetMM;
    return {x, y};
}
Point eval(const RefPoint& p, const EvalCtx& ctx) {
    if (p.terms.empty()) throw std::runtime_error("graf eval: bos nokta");
    double x = 0, y = 0, w = 0;
    for (const Term& t : p.terms) { const Point q = eval(t.a, ctx); x += t.w * q.x; y += t.w * q.y; w += t.w; }
    if (!feq(w, 1.0)) throw std::runtime_error("graf eval: nokta agirliklari 1'e toplanmiyor (" + fmtNum(w) + ")");
    return {x, y};
}

// ============================================================================ Edge
Edge Edge::reversed() const {
    Edge e = *this;
    std::swap(e.from, e.to);
    if (e.control.size() == 2) std::swap(e.control[0], e.control[1]);
    for (double& f : e.notches) f = 1.0 - f;
    std::sort(e.notches.begin(), e.notches.end());
    return e;
}

namespace {
// De Casteljau, RefPoint uzayinda: kubigi t'de iki kubige boler.
void splitCubicRef(const RefPoint& p0, const RefPoint& p1, const RefPoint& p2, const RefPoint& p3, double t,
                   std::vector<RefPoint>& first, std::vector<RefPoint>& second) {
    const RefPoint p01 = lerp(p0, p1, t), p12 = lerp(p1, p2, t), p23 = lerp(p2, p3, t);
    const RefPoint p012 = lerp(p01, p12, t), p123 = lerp(p12, p23, t);
    const RefPoint mid = lerp(p012, p123, t);
    first = {p0, p01, p012, mid};
    second = {mid, p123, p23, p3};
}
} // namespace

std::vector<Edge> Edge::subdivide(const std::vector<double>& fractions) const {
    std::vector<double> fr = fractions;
    std::sort(fr.begin(), fr.end());
    for (size_t i = 0; i < fr.size(); ++i) {
        if (!(fr[i] > 0.0 && fr[i] < 1.0)) throw std::runtime_error("graf subdivide: kesir (0,1) disinda: " + fmtNum(fr[i]) + " (" + id + ")");
        if (i && feq(fr[i], fr[i - 1])) throw std::runtime_error("graf subdivide: tekrar eden kesir " + fmtNum(fr[i]) + " (" + id + ")");
    }
    std::vector<Edge> out;
    if (fr.empty()) { out.push_back(*this); return out; }
    // Kalan kubik/dogru: [cur ... to]; tPrev orijinal parametrede su anki baslangic.
    std::vector<RefPoint> cur;
    if (isLine()) cur = {from, to}; else cur = {from, control[0], control[1], to};
    double tPrev = 0.0;
    const int m = static_cast<int>(fr.size()) + 1;
    auto piece = [&](const std::vector<RefPoint>& pts, int k, double t0, double t1) {
        Edge e = *this;
        e.id = id + "." + std::to_string(k);
        e.from = pts.front(); e.to = pts.back();
        e.control.clear();
        if (pts.size() == 4) { e.control = {pts[1], pts[2]}; }
        if (!role.empty()) {
            // parcali rol: k/n ust uste bolunurse (kOld-1) m + k / nOld m
            const int nOld = roleCount > 0 ? roleCount : 1, kOld = rolePart > 0 ? rolePart : 1;
            e.rolePart = (kOld - 1) * m + k; e.roleCount = nOld * m;
        }
        e.notches.clear();
        for (double f : notches) if (f >= t0 - 1e-12 && f < t1 - 1e-12) e.notches.push_back((f - t0) / (t1 - t0));
        out.push_back(e);
    };
    for (size_t i = 0; i < fr.size(); ++i) {
        const double tLocal = (fr[i] - tPrev) / (1.0 - tPrev);
        std::vector<RefPoint> first, second;
        if (cur.size() == 2) { const RefPoint mid = lerp(cur[0], cur[1], tLocal); first = {cur[0], mid}; second = {mid, cur[1]}; }
        else splitCubicRef(cur[0], cur[1], cur[2], cur[3], tLocal, first, second);
        piece(first, static_cast<int>(i) + 1, tPrev, fr[i]);
        cur = second; tPrev = fr[i];
    }
    piece(cur, m, tPrev, 1.0);
    return out;
}

std::vector<PathCommand> Edge::path(const EvalCtx& ctx) const {
    std::vector<PathCommand> p;
    p.push_back(PathCommand::move(eval(from, ctx)));
    if (isLine()) p.push_back(PathCommand::line(eval(to, ctx)));
    else if (control.size() == 2) p.push_back(PathCommand::curve(eval(to, ctx), eval(control[0], ctx), eval(control[1], ctx)));
    else throw std::runtime_error("graf edge " + id + ": kontrol noktasi sayisi 0 ya da 2 olmali (" + std::to_string(control.size()) + ")");
    return p;
}
double Edge::length(const EvalCtx& ctx) const { return pathLength(path(ctx)); }
Point Edge::at(const EvalCtx& ctx, double t) const {
    const Point a = eval(from, ctx), b = eval(to, ctx);
    if (isLine()) return {a.x + t * (b.x - a.x), a.y + t * (b.y - a.y)};
    const PathCommand c = PathCommand::curve(b, eval(control[0], ctx), eval(control[1], ctx));
    return cubicPoint(a, c, t);
}

// ============================================================================ Panel
int Panel::edgeIndex(const std::string& edgeId) const {
    for (size_t i = 0; i < edges.size(); ++i) if (edges[i].id == edgeId) return static_cast<int>(i);
    return -1;
}
const Edge* Panel::edge(const std::string& edgeId) const { const int i = edgeIndex(edgeId); return i < 0 ? nullptr : &edges[i]; }
Edge* Panel::edge(const std::string& edgeId) { const int i = edgeIndex(edgeId); return i < 0 ? nullptr : &edges[i]; }

bool Panel::closed(std::string* why) const {
    if (edges.size() < 3) { if (why) *why = id + ": " + std::to_string(edges.size()) + " kenar (< 3)"; return false; }
    for (size_t i = 0; i < edges.size(); ++i) {
        const Edge& e = edges[i]; const Edge& n = edges[(i + 1) % edges.size()];
        if (e.to != n.from) { if (why) *why = id + ": " + e.id + ".to != " + n.id + ".from"; return false; }
        for (size_t j = i + 1; j < edges.size(); ++j)
            if (edges[j].id == e.id) { if (why) *why = id + ": tekrar eden kenar id " + e.id; return false; }
    }
    return true;
}
void Panel::setVertex(size_t i, const RefPoint& p) {
    const size_t n = edges.size();
    edges[i % n].from = p;
    edges[(i + n - 1) % n].to = p;
}
std::vector<PathCommand> Panel::outline(const EvalCtx& ctx) const {
    std::vector<PathCommand> out;
    if (edges.empty()) return out;
    out.push_back(PathCommand::move(eval(edges[0].from, ctx)));
    for (const Edge& e : edges) {
        const std::vector<PathCommand> p = e.path(ctx);
        out.push_back(p[1]);
    }
    out.push_back(PathCommand::close());
    return out;
}
EvalCtx Panel::ctxFor(const Body& body, bool onArkaEsit) const {
    EvalCtx c; c.body = &body; c.onArkaEsit = onArkaEsit;
    for (const Bolluk& b : bolluk) c.bollukMM.emplace_back(b.ring, b.mm);
    return c;
}

// ============================================================================ Garment
const Panel* Garment::panel(const std::string& pid) const { for (const Panel& p : panels) if (p.id == pid) return &p; return nullptr; }
Panel* Garment::panel(const std::string& pid) { for (Panel& p : panels) if (p.id == pid) return &p; return nullptr; }
const Seam* Garment::seam(const std::string& sid) const { for (const Seam& s : seams) if (s.id == sid) return &s; return nullptr; }
Seam* Garment::seam(const std::string& sid) { for (Seam& s : seams) if (s.id == sid) return &s; return nullptr; }
const Edge* Garment::edge(const EdgeRef& r) const { const Panel* p = panel(r.panel); return p ? p->edge(r.edge) : nullptr; }
Edge* Garment::edge(const EdgeRef& r) { Panel* p = panel(r.panel); return p ? p->edge(r.edge) : nullptr; }
std::string Garment::panelOfEdge(const std::string& edgeId) const {
    for (const Panel& p : panels) if (p.edgeIndex(edgeId) >= 0) return p.id;
    return "";
}

// ============================================================================ JSON gidis-donus
namespace {
void anchorInto(JVal& o, const Anchor& a) {
    o.set("landmark", JVal::str(a.landmark));
    if (a.xOf != "landmark") o.set("xOf", JVal::str(a.xOf));
    if (!a.ring.empty()) o.set("ring", JVal::str(a.ring));
    o.set("oran", JVal::num(a.oran));
    o.set("ofsetMM", JVal::num(a.ofsetMM));
    if (!a.yLandmark.empty()) o.set("yLandmark", JVal::str(a.yLandmark));
    if (!a.yLandmark2.empty()) { o.set("yLandmark2", JVal::str(a.yLandmark2)); o.set("yOran", JVal::num(a.yOran)); }
    if (a.yOfsetMM != 0.0) o.set("yOfsetMM", JVal::num(a.yOfsetMM));
}
bool anchorFrom(const JVal& v, Anchor& a, std::string& err, const char* where, bool allowW) {
    if (!v.isObj()) { err = std::string(where) + ": nokta nesne degil"; return false; }
    static const char* const kAllowed[] = {"landmark", "xOf", "ring", "oran", "ofsetMM", "yLandmark", "yLandmark2", "yOran", "yOfsetMM"};
    for (const auto& kv : v.o) {
        bool ok = allowW && kv.first == "w";
        for (const char* k : kAllowed) if (kv.first == k) ok = true;
        if (!ok) { err = std::string(where) + ": bilinmeyen alan '" + kv.first + "'"; return false; }
    }
    if (!v.get("landmark") || !v.get("landmark")->isStr()) { err = std::string(where) + ": landmark eksik"; return false; }
    a.landmark = v.get("landmark")->s;
    a.xOf = v.strOr("xOf", "landmark");
    a.ring = v.strOr("ring", "");
    if (!v.get("oran") || !v.get("oran")->isNum()) { err = std::string(where) + ": oran eksik (" + a.landmark + ")"; return false; }
    a.oran = v.get("oran")->n;
    a.ofsetMM = v.numOr("ofsetMM", 0.0);
    a.yLandmark = v.strOr("yLandmark", "");
    a.yLandmark2 = v.strOr("yLandmark2", "");
    a.yOran = v.numOr("yOran", 0.0);
    a.yOfsetMM = v.numOr("yOfsetMM", 0.0);
    if (a.yLandmark2.empty() && a.yOran != 0.0) { err = std::string(where) + ": yLandmark2 yokken yOran anlamsiz"; return false; }
    return true;
}
JVal numArr(const std::vector<double>& xs) { JVal a = JVal::arr(); for (double x : xs) a.push(JVal::num(x)); return a; }
bool numArrFrom(const JVal* v, std::vector<double>& out, std::string& err, const std::string& where) {
    out.clear();
    if (!v) return true;
    if (!v->isArr()) { err = where + ": dizi degil"; return false; }
    for (const JVal& e : v->a) { if (!e.isNum()) { err = where + ": sayi degil"; return false; } out.push_back(e.n); }
    return true;
}
bool onlyKeys(const JVal& v, const std::vector<std::string>& keys, std::string& err, const std::string& where) {
    if (!v.isObj()) { err = where + ": nesne degil"; return false; }
    for (const auto& kv : v.o)
        if (std::find(keys.begin(), keys.end(), kv.first) == keys.end()) { err = where + ": bilinmeyen alan '" + kv.first + "'"; return false; }
    return true;
}
bool needStr(const JVal& v, const char* k, std::string& out, std::string& err, const std::string& where) {
    const JVal* x = v.get(k);
    if (!x || !x->isStr()) { err = where + ": '" + k + "' eksik ya da metin degil"; return false; }
    out = x->s; return true;
}
JVal refJSON(const EdgeRef& r) { JVal o = JVal::obj(); o.set("panel", JVal::str(r.panel)); o.set("edge", JVal::str(r.edge)); return o; }
bool refsFrom(const JVal* v, std::vector<EdgeRef>& out, std::string& err, const std::string& where) {
    out.clear();
    if (!v || !v->isArr()) { err = where + ": kenar referans dizisi eksik"; return false; }
    for (const JVal& e : v->a) {
        EdgeRef r;
        if (!onlyKeys(e, {"panel", "edge"}, err, where)) return false;
        if (!needStr(e, "panel", r.panel, err, where) || !needStr(e, "edge", r.edge, err, where)) return false;
        out.push_back(r);
    }
    return true;
}
} // namespace

JVal toJSON(const RefPoint& p0) {
    RefPoint p = p0; p.normalize();
    JVal o = JVal::obj();
    if (p.terms.size() == 1 && feq(p.terms[0].w, 1.0)) { anchorInto(o, p.terms[0].a); return o; }
    JVal combo = JVal::arr();
    for (const Term& t : p.terms) { JVal to = JVal::obj(); to.set("w", JVal::num(t.w)); anchorInto(to, t.a); combo.push(to); }
    o.set("combo", combo);
    return o;
}
bool fromJSON(const JVal& v, RefPoint& out, std::string& err) {
    out.terms.clear();
    if (!v.isObj()) { err = "nokta nesne degil"; return false; }
    if (const JVal* c = v.get("combo")) {
        if (v.o.size() != 1) { err = "combo yaninda baska alan olamaz"; return false; }
        if (!c->isArr() || c->a.empty()) { err = "combo bos"; return false; }
        for (const JVal& t : c->a) {
            Term term;
            if (!t.get("w") || !t.get("w")->isNum()) { err = "combo terimi w tasimiyor"; return false; }
            term.w = t.get("w")->n;
            if (!anchorFrom(t, term.a, err, "combo terimi", true)) return false;
            out.terms.push_back(term);
        }
        double sum = 0; for (const Term& t : out.terms) sum += t.w;
        if (!feq(sum, 1.0)) { err = "combo agirliklari 1'e toplanmiyor (" + fmtNum(sum) + ")"; return false; }
        out.normalize();
        return true;
    }
    Term t; t.w = 1.0;
    if (!anchorFrom(v, t.a, err, "nokta", false)) return false;
    out.terms.push_back(t);
    return true;
}

JVal toJSON(const Edge& e) {
    JVal o = JVal::obj();
    o.set("id", JVal::str(e.id));
    o.set("kind", JVal::str(e.kind));
    if (!e.role.empty()) o.set("role", JVal::str(e.role));
    if (e.roleCount > 0) { o.set("rolePart", JVal::num(e.rolePart)); o.set("roleCount", JVal::num(e.roleCount)); }
    o.set("from", toJSON(e.from));
    o.set("to", toJSON(e.to));
    if (!e.control.empty()) { JVal c = JVal::arr(); for (const RefPoint& p : e.control) c.push(toJSON(p)); o.set("control", c); }
    if (!e.finish.empty()) o.set("finish", JVal::str(e.finish));
    if (!e.notches.empty()) o.set("notches", numArr(e.notches));
    if (e.gatherRatio != 1.0) o.set("gatherRatio", JVal::num(e.gatherRatio));
    return o;
}
bool fromJSON(const JVal& v, Edge& out, std::string& err) {
    out = Edge();
    const std::string where = "Edge " + v.strOr("id", "?");
    if (!onlyKeys(v, {"id", "kind", "role", "rolePart", "roleCount", "from", "to", "control", "finish", "notches", "gatherRatio"}, err, where)) return false;
    if (!needStr(v, "id", out.id, err, where) || !needStr(v, "kind", out.kind, err, where)) return false;
    out.role = v.strOr("role", "");
    out.rolePart = static_cast<int>(v.numOr("rolePart", 0));
    out.roleCount = static_cast<int>(v.numOr("roleCount", 0));
    if ((out.rolePart > 0) != (out.roleCount > 0) || out.rolePart > out.roleCount) { err = where + ": rolePart/roleCount tutarsiz"; return false; }
    if (!v.get("from") || !fromJSON(*v.get("from"), out.from, err)) { err = where + " from: " + err; return false; }
    if (!v.get("to") || !fromJSON(*v.get("to"), out.to, err)) { err = where + " to: " + err; return false; }
    if (const JVal* c = v.get("control")) {
        if (!c->isArr()) { err = where + ": control dizi degil"; return false; }
        for (const JVal& p : c->a) { RefPoint r; if (!fromJSON(p, r, err)) { err = where + " control: " + err; return false; } out.control.push_back(r); }
        if (out.control.size() != 2) { err = where + ": control 0 ya da 2 nokta olmali (" + std::to_string(out.control.size()) + ")"; return false; }
    }
    out.finish = v.strOr("finish", "");
    if (!numArrFrom(v.get("notches"), out.notches, err, where + " notches")) return false;
    for (double f : out.notches) if (!(f > 0.0 && f < 1.0)) { err = where + ": notch kesri (0,1) disinda " + fmtNum(f); return false; }
    out.gatherRatio = v.numOr("gatherRatio", 1.0);
    return true;
}

JVal toJSON(const Panel& p) {
    JVal o = JVal::obj();
    o.set("id", JVal::str(p.id));
    JVal es = JVal::arr(); for (const Edge& e : p.edges) es.push(toJSON(e));
    o.set("edges", es);
    o.set("grainDeg", JVal::num(p.grainDeg));
    o.set("onFold", JVal::boolean(p.onFold));
    o.set("cutCount", JVal::num(p.cutCount));
    o.set("seamAllowanceMM", JVal::num(p.seamAllowanceMM));
    if (!p.bolluk.empty()) {
        JVal b = JVal::arr();
        for (const Bolluk& x : p.bolluk) { JVal bo = JVal::obj(); bo.set("ring", JVal::str(x.ring)); bo.set("mm", JVal::num(x.mm)); b.push(bo); }
        o.set("bolluk", b);
    }
    if (!p.gerekce.empty()) o.set("gerekce", JVal::str(p.gerekce));
    return o;
}
bool fromJSON(const JVal& v, Panel& out, std::string& err) {
    out = Panel();
    const std::string where = "Panel " + v.strOr("id", "?");
    if (!onlyKeys(v, {"id", "edges", "grainDeg", "onFold", "cutCount", "seamAllowanceMM", "bolluk", "gerekce"}, err, where)) return false;
    if (!needStr(v, "id", out.id, err, where)) return false;
    const JVal* es = v.get("edges");
    if (!es || !es->isArr()) { err = where + ": edges eksik"; return false; }
    for (const JVal& e : es->a) { Edge ed; if (!fromJSON(e, ed, err)) { err = where + ": " + err; return false; } out.edges.push_back(ed); }
    out.grainDeg = v.numOr("grainDeg", 0.0);
    out.onFold = v.boolOr("onFold", false);
    out.cutCount = static_cast<int>(v.numOr("cutCount", 1));
    out.seamAllowanceMM = v.numOr("seamAllowanceMM", 0.0);
    if (const JVal* b = v.get("bolluk")) {
        if (!b->isArr()) { err = where + ": bolluk dizi degil"; return false; }
        for (const JVal& x : b->a) {
            Bolluk bo;
            if (!onlyKeys(x, {"ring", "mm"}, err, where + " bolluk")) return false;
            if (!needStr(x, "ring", bo.ring, err, where + " bolluk")) return false;
            if (!x.get("mm") || !x.get("mm")->isNum()) { err = where + " bolluk: mm eksik"; return false; }
            bo.mm = x.get("mm")->n;
            out.bolluk.push_back(bo);
        }
    }
    out.gerekce = v.strOr("gerekce", "");
    return true;
}

JVal toJSON(const Seam& s) {
    JVal o = JVal::obj();
    o.set("id", JVal::str(s.id));
    JVal a = JVal::arr(); for (const EdgeRef& r : s.a) a.push(refJSON(r)); o.set("a", a);
    JVal b = JVal::arr(); for (const EdgeRef& r : s.b) b.push(refJSON(r)); o.set("b", b);
    o.set("ratio", JVal::num(s.ratio));
    o.set("easeMM", JVal::num(s.easeMM));
    if (!s.notchFractions.empty()) o.set("notchFractions", numArr(s.notchFractions));
    if (!s.closure.type.empty()) {
        JVal c = JVal::obj();
        c.set("type", JVal::str(s.closure.type));
        c.set("fromFraction", JVal::num(s.closure.fromFraction));
        c.set("toFraction", JVal::num(s.closure.toFraction));
        o.set("closure", c);
    }
    if (!s.gerekce.empty()) o.set("gerekce", JVal::str(s.gerekce));
    return o;
}
bool fromJSON(const JVal& v, Seam& out, std::string& err) {
    out = Seam();
    const std::string where = "Seam " + v.strOr("id", "?");
    if (!onlyKeys(v, {"id", "a", "b", "ratio", "easeMM", "notchFractions", "closure", "gerekce"}, err, where)) return false;
    if (!needStr(v, "id", out.id, err, where)) return false;
    if (!refsFrom(v.get("a"), out.a, err, where + " a") || !refsFrom(v.get("b"), out.b, err, where + " b")) return false;
    if (out.a.empty() || out.b.empty()) { err = where + ": iki taraf da en az bir kenar tasimali"; return false; }
    out.ratio = v.numOr("ratio", 1.0);
    out.easeMM = v.numOr("easeMM", 0.0);
    if (!numArrFrom(v.get("notchFractions"), out.notchFractions, err, where + " notchFractions")) return false;
    if (const JVal* c = v.get("closure")) {
        if (!onlyKeys(*c, {"type", "fromFraction", "toFraction"}, err, where + " closure")) return false;
        if (!needStr(*c, "type", out.closure.type, err, where + " closure")) return false;
        out.closure.fromFraction = c->numOr("fromFraction", 0.0);
        out.closure.toFraction = c->numOr("toFraction", 1.0);
    }
    out.gerekce = v.strOr("gerekce", "");
    return true;
}

JVal toJSON(const Ring& r) {
    JVal o = JVal::obj();
    o.set("id", JVal::str(r.id));
    o.set("role", JVal::str(r.role));
    JVal es = JVal::arr(); for (const EdgeRef& e : r.edges) es.push(refJSON(e)); o.set("edges", es);
    return o;
}
bool fromJSON(const JVal& v, Ring& out, std::string& err) {
    out = Ring();
    const std::string where = "Ring " + v.strOr("id", "?");
    if (!onlyKeys(v, {"id", "role", "edges"}, err, where)) return false;
    if (!needStr(v, "id", out.id, err, where) || !needStr(v, "role", out.role, err, where)) return false;
    return refsFrom(v.get("edges"), out.edges, err, where + " edges");
}

JVal toJSON(const Garment& g) {
    JVal o = JVal::obj();
    o.set("id", JVal::str(g.id));
    o.set("version", JVal::str("graf-v1"));
    if (!g.notes.empty()) o.set("notes", JVal::str(g.notes));
    JVal ps = JVal::arr(); for (const Panel& p : g.panels) ps.push(toJSON(p)); o.set("panels", ps);
    JVal ss = JVal::arr(); for (const Seam& s : g.seams) ss.push(toJSON(s)); o.set("seams", ss);
    JVal rs = JVal::arr(); for (const Ring& r : g.rings) rs.push(toJSON(r)); o.set("rings", rs);
    JVal os = JVal::arr();
    for (const OpRecord& r : g.ops) { JVal ro = JVal::obj(); ro.set("op", JVal::str(r.op)); ro.set("args", r.args); os.push(ro); }
    o.set("ops", os);
    return o;
}
std::string toJSONText(const Garment& g) { return emit(toJSON(g)) + "\n"; }
std::string panelJSONText(const Panel& p) { return emit(toJSON(p)); }

bool fromJSON(const JVal& v, Garment& out, std::string& err) {
    out = Garment();
    const std::string where = "Garment " + v.strOr("id", "?");
    if (!onlyKeys(v, {"id", "version", "notes", "panels", "seams", "rings", "ops"}, err, where)) return false;
    if (!needStr(v, "id", out.id, err, where)) return false;
    if (v.strOr("version", "") != "graf-v1") { err = where + ": version 'graf-v1' degil"; return false; }
    out.notes = v.strOr("notes", "");
    const JVal* ps = v.get("panels");
    if (!ps || !ps->isArr()) { err = where + ": panels eksik"; return false; }
    for (const JVal& p : ps->a) { Panel pa; if (!fromJSON(p, pa, err)) return false; out.panels.push_back(pa); }
    if (const JVal* ss = v.get("seams")) { if (!ss->isArr()) { err = where + ": seams dizi degil"; return false; }
        for (const JVal& s : ss->a) { Seam se; if (!fromJSON(s, se, err)) return false; out.seams.push_back(se); } }
    if (const JVal* rs = v.get("rings")) { if (!rs->isArr()) { err = where + ": rings dizi degil"; return false; }
        for (const JVal& r : rs->a) { Ring ri; if (!fromJSON(r, ri, err)) return false; out.rings.push_back(ri); } }
    if (const JVal* os = v.get("ops")) {
        if (!os->isArr()) { err = where + ": ops dizi degil"; return false; }
        for (const JVal& r : os->a) {
            OpRecord rec;
            if (!onlyKeys(r, {"op", "args"}, err, where + " ops")) return false;
            if (!needStr(r, "op", rec.op, err, where + " ops")) return false;
            rec.args = r.get("args") ? *r.get("args") : JVal::obj();
            out.ops.push_back(rec);
        }
    }
    // Referans butunlugu: her EdgeRef var olan panel + kenara gitmeli, id'ler tekil
    for (size_t i = 0; i < out.panels.size(); ++i)
        for (size_t j = i + 1; j < out.panels.size(); ++j)
            if (out.panels[i].id == out.panels[j].id) { err = where + ": tekrar eden panel id " + out.panels[i].id; return false; }
    auto checkRefs = [&](const std::vector<EdgeRef>& refs, const std::string& w) {
        for (const EdgeRef& r : refs)
            if (!out.edge(r)) { err = w + ": referans cozulmedi " + r.panel + "/" + r.edge; return false; }
        return true;
    };
    for (const Seam& s : out.seams) if (!checkRefs(s.a, where + " Seam " + s.id) || !checkRefs(s.b, where + " Seam " + s.id)) return false;
    for (const Ring& r : out.rings) if (!checkRefs(r.edges, where + " Ring " + r.id)) return false;
    return true;
}
bool fromJSONText(const std::string& text, Garment& out, std::string& err) {
    JVal v;
    if (!parse(text, v, err)) return false;
    return fromJSON(v, out, err);
}

// ============================================================================ Sema
namespace {
struct Sema {
    const JVal& c; std::vector<std::string>& h;
    const JVal* tipler() const { return c.get("tipler"); }
    const JVal* enumlar() const { return c.get("enumlar"); }
    void hata(const std::string& m) { h.push_back(m); }
    bool enumOk(const std::string& name, const std::string& val) {
        const JVal* e = enumlar() ? enumlar()->get(name) : nullptr;
        if (!e || !e->isArr()) { hata("sema: enum tanimsiz " + name); return false; }
        for (const JVal& x : e->a) if (x.isStr() && x.s == val) return true;
        return false;
    }
    void value(const JVal& v, const std::string& tip, const std::string& yol) {
        if (tip == "json") return;
        if (tip == "string") { if (!v.isStr()) hata(yol + ": metin bekleniyordu"); return; }
        if (tip == "number") { if (!v.isNum()) hata(yol + ": sayi bekleniyordu"); return; }
        if (tip == "integer") { if (!v.isNum() || std::floor(v.n) != v.n) hata(yol + ": tam sayi bekleniyordu"); return; }
        if (tip == "boolean") { if (!v.isBool()) hata(yol + ": bool bekleniyordu"); return; }
        if (tip.rfind("enum:", 0) == 0) {
            const std::string en = tip.substr(5);
            if (!v.isStr()) { hata(yol + ": enum degeri metin degil"); return; }
            if (!enumOk(en, v.s)) hata(yol + ": '" + v.s + "' enum " + en + " icinde yok");
            return;
        }
        if (tip.size() > 2 && tip.compare(tip.size() - 2, 2, "[]") == 0) {
            if (!v.isArr()) { hata(yol + ": dizi bekleniyordu"); return; }
            const std::string el = tip.substr(0, tip.size() - 2);
            for (size_t i = 0; i < v.a.size(); ++i) value(v.a[i], el, yol + "[" + std::to_string(i) + "]");
            return;
        }
        object(v, tip, yol);
    }
    void object(const JVal& v, const std::string& tipAdi, const std::string& yol) {
        std::string t = tipAdi;
        if (t == "RefPoint") t = v.has("combo") ? "RefPointCombo" : "Anchor";
        const JVal* def = tipler() ? tipler()->get(t) : nullptr;
        if (!def) { hata(yol + ": sema tipi tanimsiz " + t); return; }
        if (!v.isObj()) { hata(yol + ": " + t + " nesne bekleniyordu"); return; }
        const JVal* alanlar = def->get("alanlar");
        if (!alanlar || !alanlar->isObj()) { hata("sema: " + t + ".alanlar yok"); return; }
        for (const auto& kv : v.o) {
            const JVal* f = alanlar->get(kv.first);
            if (!f) { hata(yol + ": '" + kv.first + "' " + t + " icin tanimsiz alan"); continue; }
            value(kv.second, f->strOr("tip", "json"), yol + "." + kv.first);
        }
        for (const auto& fk : alanlar->o)
            if (fk.second.boolOr("zorunlu", false) && !v.has(fk.first)) hata(yol + ": zorunlu alan eksik '" + fk.first + "' (" + t + ")");
    }
};
} // namespace

bool semaDogrula(const JVal& doc, const JVal& contract, std::vector<std::string>& hatalar) {
    const size_t before = hatalar.size();
    Sema s{contract, hatalar};
    s.object(doc, contract.strOr("kokTip", "Garment"), "$");
    return hatalar.size() == before;
}
bool semaKapsar(const JVal& contract, const Garment& ornek, std::vector<std::string>& hatalar) {
    return semaDogrula(toJSON(ornek), contract, hatalar);
}

} // namespace graf
} // namespace stitchu
