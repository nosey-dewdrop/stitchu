// flatsvg.cpp — bkz. flatsvg.hpp. Cizim, GEOMETRI ICAT ETMEDEN, iki var olan katmandan turer:
//   nokta  : graf.hpp eval (landmark + oran -> mm)
//   yerlesim: grafdogrula.hpp dogrula(...).pozlar (dikis agaci BFS, ilan edilen eslesme)
#include "flatsvg.hpp"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <map>
#include <sstream>

#include "grafdogrula.hpp"

namespace stitchu {
namespace graf {

namespace {

std::string f3(double v) {
    if (!(v == v)) return "0.000";        // NaN sessizce yayilmasin
    if (v == 0.0) v = 0.0;                // -0 -> 0 (bayt-ayni cikti)
    char b[48];
    std::snprintf(b, sizeof b, "%.3f", v);
    return b;
}

struct Poz {
    double a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0;
    bool var = false;
    Point ap(Point p) const { return { a * p.x + b * p.y + tx, c * p.x + d * p.y + ty }; }
};

// Bir panelin degerlenmis konturunu poz altinda SVG path metnine cevirir.
std::string pathD(const std::vector<PathCommand>& cmds, const Poz& z) {
    std::string d;
    Point cur{ 0, 0 };
    for (const PathCommand& c : cmds) {
        switch (c.type) {
            case CmdType::Move: { Point p = z.ap(c.to); d += "M " + f3(p.x) + " " + f3(p.y); cur = c.to; break; }
            case CmdType::Line: { Point p = z.ap(c.to); d += " L " + f3(p.x) + " " + f3(p.y); cur = c.to; break; }
            case CmdType::Curve: {
                Point p1 = z.ap(c.cp1), p2 = z.ap(c.cp2), p = z.ap(c.to);
                d += " C " + f3(p1.x) + " " + f3(p1.y) + " " + f3(p2.x) + " " + f3(p2.y) + " " + f3(p.x) + " " + f3(p.y);
                cur = c.to; break;
            }
            case CmdType::Close: d += " Z"; break;
        }
    }
    (void)cur;
    return d;
}

// Kenarin kendi yolu (Move + segment) — dikis/detay katmanlari icin.
std::string edgeD(const Edge& e, const EvalCtx& ctx, const Poz& z) {
    return pathD(e.path(ctx), z);
}

void grow(Rect& r, Point p, bool& first) {
    if (first) { r.x = p.x; r.y = p.y; r.width = 0; r.height = 0; first = false; return; }
    double x0 = std::min(r.x, p.x), y0 = std::min(r.y, p.y);
    double x1 = std::max(r.x + r.width, p.x), y1 = std::max(r.y + r.height, p.y);
    r.x = x0; r.y = y0; r.width = x1 - x0; r.height = y1 - y0;
}

void growCmds(Rect& r, const std::vector<PathCommand>& cmds, const Poz& z, bool& first) {
    Point cur{ 0, 0 };
    for (const PathCommand& c : cmds) {
        if (c.type == CmdType::Close) continue;
        if (c.type == CmdType::Curve) {
            // Kubik: 24 adim duzlestirme (geometry.hpp ile ayni cozunurluk) — kontrol
            // noktasi kutuyu sismedigi icin gercek egri ornekleniyor.
            for (Point q : flattenCubic(cur, c.to, c.cp1, c.cp2, 24)) grow(r, z.ap(q), first);
        } else {
            grow(r, z.ap(c.to), first);
        }
        cur = c.to;
    }
}

// Kenarin ortasinda, panelin icine dogru kisa bir normal (centik / topstitch yonu icin).
Point normalIn(const Edge& e, const EvalCtx& ctx, Point merkez) {
    Point a = e.at(ctx, 0.45), b = e.at(ctx, 0.55);
    Point t{ b.x - a.x, b.y - a.y };
    double L = std::sqrt(t.x * t.x + t.y * t.y);
    if (L < 1e-9) return { 0, 0 };
    Point n{ -t.y / L, t.x / L };
    Point m = e.at(ctx, 0.5);
    if ((merkez.x - m.x) * n.x + (merkez.y - m.y) * n.y < 0) { n.x = -n.x; n.y = -n.y; }
    return n;
}

Point centroidOf(const std::vector<PathCommand>& cmds) {
    double sx = 0, sy = 0; int n = 0;
    Point cur{ 0, 0 };
    for (const PathCommand& c : cmds) {
        if (c.type == CmdType::Close) continue;
        sx += c.to.x; sy += c.to.y; ++n; cur = c.to;
    }
    (void)cur;
    return n ? Point{ sx / n, sy / n } : Point{ 0, 0 };
}

}  // namespace

std::string flatSVG(const Garment& g, const Body& body, const std::string& bodyId,
                    const JVal& contract, const JVal& bodyContract,
                    const FlatOpts& opts, std::string& hata) {
    hata.clear();
    if (g.panels.empty()) { hata = "ERR_EMPTY_GARMENT: graf panelsiz"; return {}; }

    // 1) Yerlesim: dogrulayicinin ZATEN hesapladigi 2B pozlar. Cizim kendi yerlesimini icat etmez.
    DogrulamaRaporu R = dogrula(g, body, contract, opts.onArkaEsit);
    std::map<std::string, Poz> pozlar;
    int yerlesen = 0;
    for (const PanelPoz& p : R.pozlar) {
        Poz z; z.a = p.a; z.b = p.b; z.c = p.c; z.d = p.d; z.tx = p.tx; z.ty = p.ty; z.var = p.yerlesti;
        if (p.yerlesti) ++yerlesen;
        pozlar[p.panel] = z;
    }
    if (yerlesen == 0) { hata = "ERR_NO_PLACEMENT: hicbir panel dikis agacina baglanmadi"; return {}; }

    // 2) Sinir kutusu (yalniz yerlesen paneller).
    Rect bb; bool first = true;
    std::map<std::string, EvalCtx> ctxs;
    std::map<std::string, Point> merkezler;
    for (const Panel& p : g.panels) {
        EvalCtx ctx = p.ctxFor(body, opts.onArkaEsit);
        ctxs[p.id] = ctx;
        const Poz& z = pozlar[p.id];
        if (!z.var) continue;
        std::vector<PathCommand> o = p.outline(ctx);
        growCmds(bb, o, z, first);
        merkezler[p.id] = centroidOf(o);
    }
    if (first) { hata = "ERR_EMPTY_OUTLINE: yerlesen panelin konturu bos"; return {}; }

    const double pad = opts.kenarBoslukMM;
    const double vx = bb.x - pad, vy = bb.y - pad;
    const double vw = bb.width + 2 * pad, vh = bb.height + 2 * pad;

    // 3) Cizgi kalinliklari: mutlak mm degil, cizimin buyuklugune orantili (her bedende ayni okunur).
    const double birim = std::max(vw, vh);
    const double wOutline = birim / 400.0, wSeam = birim / 800.0, wDetail = birim / 1200.0;

    std::ostringstream s;
    s << "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\""
      << f3(vx) << " " << f3(vy) << " " << f3(vw) << " " << f3(vh) << "\""
      << " data-scale=\"1:1\" data-unit-mm=\"1\""
      << " data-graf=\"" << g.id << "\" data-body=\"" << bodyId << "\""
      << " data-panel=\"" << yerlesen << "\"";

    // croquis landmark ILANI (kabul_P1 1.5): sayilar Body'den, +-0 sapmayla.
    // bodyContract yalniz kaynagi belgelemek icin gecer; deger her zaman degerlenen Body'dendir.
    (void)bodyContract;
    struct LmIlan { const char* attr; const char* lm; };
    const LmIlan ilanlar[] = { { "data-y-waist", "landmark.waist" },
                               { "data-y-bust", "landmark.bustLine" },
                               { "data-y-hip", "landmark.hip" } };
    for (const LmIlan& li : ilanlar) {
        try {
            BodyPoint bp = body.landmark(li.lm);
            s << " " << li.attr << "=\"" << f3(bp.y) << "\"";
        } catch (const std::exception&) { /* landmark yoksa ILAN EDILMEZ (uydurma sayi yok) */ }
    }
    s << ">\n";
    s << "  <title>" << g.id << " flat @ " << bodyId << "</title>\n";
    s << "  <rect x=\"" << f3(vx) << "\" y=\"" << f3(vy) << "\" width=\"" << f3(vw)
      << "\" height=\"" << f3(vh) << "\" fill=\"#ffffff\"/>\n";

    // ---- katman: outline
    s << "  <g id=\"outline\" fill=\"none\" stroke=\"#111111\" stroke-width=\"" << f3(wOutline)
      << "\" stroke-linejoin=\"round\">\n";
    for (const Panel& p : g.panels) {
        const Poz& z = pozlar[p.id];
        if (!z.var) continue;
        s << "    <path data-panel=\"" << p.id << "\" d=\"" << pathD(p.outline(ctxs[p.id]), z) << "\"/>\n";
    }
    s << "  </g>\n";

    // ---- katman: seams (kind == seam olan kenarlar)
    s << "  <g id=\"seams\" fill=\"none\" stroke=\"#111111\" stroke-width=\"" << f3(wSeam) << "\">\n";
    for (const Panel& p : g.panels) {
        const Poz& z = pozlar[p.id];
        if (!z.var) continue;
        for (const Edge& e : p.edges) {
            if (e.kind != "seam") continue;
            s << "    <path data-panel=\"" << p.id << "\" data-edge=\"" << e.id
              << "\" data-role=\"" << e.role << "\" d=\"" << edgeD(e, ctxs[p.id], z) << "\"/>\n";
        }
    }
    s << "  </g>\n";

    // ---- katman: topstitch (dikisli kenarin panel icine kaymis izi; kesikli)
    const double ofsMM = birim / 150.0;
    s << "  <g id=\"topstitch\" fill=\"none\" stroke=\"#111111\" stroke-width=\"" << f3(wDetail)
      << "\" stroke-dasharray=\"" << f3(birim / 120.0) << " " << f3(birim / 200.0) << "\">\n";
    for (const Panel& p : g.panels) {
        const Poz& z = pozlar[p.id];
        if (!z.var) continue;
        Point mrk = merkezler.count(p.id) ? merkezler[p.id] : Point{ 0, 0 };
        for (const Edge& e : p.edges) {
            if (e.kind != "seam") continue;
            Point n = normalIn(e, ctxs[p.id], mrk);
            if (n.x == 0 && n.y == 0) continue;
            Poz zo = z; zo.tx += z.a * n.x * ofsMM + z.b * n.y * ofsMM;
            zo.ty += z.c * n.x * ofsMM + z.d * n.y * ofsMM;
            s << "    <path data-panel=\"" << p.id << "\" data-edge=\"" << e.id
              << "\" d=\"" << edgeD(e, ctxs[p.id], zo) << "\"/>\n";
        }
    }
    s << "  </g>\n";

    // ---- katman: details (pens bacaklari, kat cizgisi, centikler)
    s << "  <g id=\"details\" fill=\"none\" stroke=\"#111111\" stroke-width=\"" << f3(wDetail) << "\">\n";
    const double centikMM = birim / 100.0;
    for (const Panel& p : g.panels) {
        const Poz& z = pozlar[p.id];
        if (!z.var) continue;
        const EvalCtx& ctx = ctxs[p.id];
        Point mrk = merkezler.count(p.id) ? merkezler[p.id] : Point{ 0, 0 };
        for (const Edge& e : p.edges) {
            if (e.kind == "dartLeg")
                s << "    <path data-panel=\"" << p.id << "\" data-edge=\"" << e.id
                  << "\" data-tur=\"pens\" d=\"" << edgeD(e, ctx, z) << "\"/>\n";
            else if (e.kind == "fold")
                s << "    <path data-panel=\"" << p.id << "\" data-edge=\"" << e.id
                  << "\" data-tur=\"kat\" stroke-dasharray=\"" << f3(birim / 60.0) << " " << f3(birim / 90.0)
                  << " " << f3(birim / 300.0) << " " << f3(birim / 90.0) << "\" d=\"" << edgeD(e, ctx, z) << "\"/>\n";
            for (double t : e.notches) {
                Point m = e.at(ctx, t);
                Point n = normalIn(e, ctx, mrk);
                Point A = z.ap(m);
                Point B = z.ap({ m.x + n.x * centikMM, m.y + n.y * centikMM });
                s << "    <path data-panel=\"" << p.id << "\" data-edge=\"" << e.id
                  << "\" data-tur=\"centik\" d=\"M " << f3(A.x) << " " << f3(A.y)
                  << " L " << f3(B.x) << " " << f3(B.y) << "\"/>\n";
            }
        }
    }
    s << "  </g>\n";
    s << "</svg>\n";
    return s.str();
}

}  // namespace graf
}  // namespace stitchu
