// kalipsvg.cpp — bkz. kalipsvg.hpp. Cizgi/centik/etiket sayilarinin HEPSI
// contract/pattern-sheet-v1.json'dan okunur; bu dosyada olcu sabiti yoktur.
#include "kalipsvg.hpp"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <sstream>

namespace stitchu {
namespace graf {

namespace {

std::string f3(double v) {
    if (!(v == v)) return "0.000";
    if (v == 0.0) v = 0.0;
    char b[48];
    std::snprintf(b, sizeof b, "%.3f", v);
    return b;
}

// Sozlesmeden sayi; yoksa hata ADIYLA (sessiz default yok).
bool say(const JVal& root, const std::vector<std::string>& yol, double& out, std::string& hata) {
    const JVal* c = &root;
    std::string p;
    for (const std::string& k : yol) {
        p += (p.empty() ? "" : ".") + k;
        if (!c->isObj() || !c->get(k)) { hata = "ERR_SHEET_CONTRACT: contract/pattern-sheet-v1.json " + p + " yok"; return false; }
        c = c->get(k);
    }
    if (!c->isNum()) { hata = "ERR_SHEET_CONTRACT: " + p + " sayi degil"; return false; }
    out = c->n;
    return true;
}

std::string esc(const std::string& s) {
    std::string o;
    for (char c : s) {
        if (c == '&') o += "&amp;";
        else if (c == '<') o += "&lt;";
        else if (c == '>') o += "&gt;";
        else o += c;
    }
    return o;
}

std::string pathD(const std::vector<PathCommand>& cmds, double dx, double dy) {
    std::string d;
    for (const PathCommand& c : cmds) {
        switch (c.type) {
            case CmdType::Move: d += "M " + f3(c.to.x + dx) + " " + f3(c.to.y + dy); break;
            case CmdType::Line: d += " L " + f3(c.to.x + dx) + " " + f3(c.to.y + dy); break;
            case CmdType::Curve:
                d += " C " + f3(c.cp1.x + dx) + " " + f3(c.cp1.y + dy) + " " + f3(c.cp2.x + dx) + " " +
                     f3(c.cp2.y + dy) + " " + f3(c.to.x + dx) + " " + f3(c.to.y + dy);
                break;
            case CmdType::Close: d += " Z"; break;
        }
    }
    return d;
}

Rect bboxOf(const std::vector<PathCommand>& cmds) {
    bool first = true;
    double x0 = 0, y0 = 0, x1 = 0, y1 = 0;
    Point cur{ 0, 0 };
    auto add = [&](Point p) {
        if (first) { x0 = x1 = p.x; y0 = y1 = p.y; first = false; return; }
        x0 = std::min(x0, p.x); x1 = std::max(x1, p.x);
        y0 = std::min(y0, p.y); y1 = std::max(y1, p.y);
    };
    for (const PathCommand& c : cmds) {
        if (c.type == CmdType::Close) continue;
        if (c.type == CmdType::Curve) for (Point q : flattenCubic(cur, c.to, c.cp1, c.cp2, 24)) add(q);
        else add(c.to);
        cur = c.to;
    }
    return { x0, y0, x1 - x0, y1 - y0 };
}

}  // namespace

std::string kalipSVG(const Garment& g, const Body& body, const std::string& bodyId,
                     const JVal& sheet, const KalipOpts& opts, std::string& hata) {
    hata.clear();
    if (g.panels.empty()) { hata = "ERR_EMPTY_GARMENT: graf panelsiz"; return {}; }

    // ---- sozlesme sayilari (hicbiri kodda yazili degil)
    double wKesim = 0, wDikis = 0, wIc = 0, wKat = 0, wGrain = 0, grainOkBasi = 0, grainOran = 0;
    double dashDikisOn = 0, centikUz = 0, centikGen = 0, centikCift = 0;
    double dpGovde = 0, dpEtek = 0, tParcaAdi = 0, tGovde = 0, tKat = 0;
    if (!say(sheet, { "cizgiStilleri", "kesim", "kalinlikMM" }, wKesim, hata)) return {};
    if (!say(sheet, { "cizgiStilleri", "dikis", "kalinlikMM" }, wDikis, hata)) return {};
    if (!say(sheet, { "cizgiStilleri", "icCizgi", "kalinlikMM" }, wIc, hata)) return {};
    if (!say(sheet, { "cizgiStilleri", "katCizgisi", "kalinlikMM" }, wKat, hata)) return {};
    if (!say(sheet, { "cizgiStilleri", "grainOku", "kalinlikMM" }, wGrain, hata)) return {};
    if (!say(sheet, { "cizgiStilleri", "grainOku", "ucOkBasiMM" }, grainOkBasi, hata)) return {};
    if (!say(sheet, { "cizgiStilleri", "grainOku", "uzunlukOran" }, grainOran, hata)) return {};
    if (!say(sheet, { "centik", "uzunlukMM" }, centikUz, hata)) return {};
    if (!say(sheet, { "centik", "genislikMM" }, centikGen, hata)) return {};
    if (!say(sheet, { "centik", "ciftAralikMM" }, centikCift, hata)) return {};
    if (!say(sheet, { "dikisPayi", "govdeMM" }, dpGovde, hata)) return {};
    if (!say(sheet, { "dikisPayi", "etekUcuMM" }, dpEtek, hata)) return {};
    if (!say(sheet, { "parcaEtiketi", "tipografi", "parcaAdiMM" }, tParcaAdi, hata)) return {};
    if (!say(sheet, { "parcaEtiketi", "tipografi", "govdeMM" }, tGovde, hata)) return {};
    if (!say(sheet, { "parcaEtiketi", "tipografi", "katKenariYazisiMM" }, tKat, hata)) return {};
    {   // dikis cizgisi dash: cizgiStilleri.dikis.dash[0]
        const JVal* cs = sheet.get("cizgiStilleri");
        const JVal* dk = cs && cs->isObj() ? cs->get("dikis") : nullptr;
        const JVal* dv = dk && dk->isObj() ? dk->get("dash") : nullptr;
        if (!dv || !dv->isArr() || dv->a.empty() || !dv->a[0].isNum()) {
            hata = "ERR_SHEET_CONTRACT: cizgiStilleri.dikis.dash[0] yok";
            return {};
        }
        dashDikisOn = dv->a[0].n;
    }

    // ---- her panel KENDI duzleminde; satira dizilir (poz UYGULANMAZ: kalip parcasi tek basina kesilir)
    struct Parca {
        const Panel* p = nullptr;
        std::vector<PathCommand> dikisHatti, kesimHatti, katHatti;
        Rect kutu;
        double dx = 0, dy = 0;
        double dp = 0;
    };
    std::vector<Parca> parcalar;
    double curX = opts.kenarBoslukMM, maxH = 0;
    for (const Panel& p : g.panels) {
        Parca pr;
        pr.p = &p;
        EvalCtx ctx = p.ctxFor(body, opts.onArkaEsit);
        pr.dikisHatti = p.outline(ctx);
        if (pr.dikisHatti.empty()) { hata = "ERR_EMPTY_OUTLINE: " + p.id; return {}; }
        // dikis payi: panelin kendi degeri 0 ise sozlesme govde payi; etek ucu rolu tasiyan
        // kenari olan parcaya sozlesmenin etekUcuMM'i (ikisinden buyugu, tek pay cizilir).
        pr.dp = p.seamAllowanceMM > 0 ? p.seamAllowanceMM : dpGovde;
        for (const Edge& e : p.edges)
            if (e.role.find("hem") != std::string::npos && p.seamAllowanceMM <= 0) pr.dp = std::max(pr.dp, dpEtek);
        pr.kesimHatti = offsetOutline(pr.dikisHatti, pr.dp, p.onFold);
        if (p.onFold) pr.katHatti = foldLineOf(pr.dikisHatti);
        pr.kutu = bboxOf(pr.kesimHatti.empty() ? pr.dikisHatti : pr.kesimHatti);
        pr.dx = curX - pr.kutu.x;
        pr.dy = opts.kenarBoslukMM - pr.kutu.y;
        curX += pr.kutu.width + opts.parcaArasiMM;
        maxH = std::max(maxH, pr.kutu.height);
        parcalar.push_back(pr);
    }
    const double W = curX - opts.parcaArasiMM + opts.kenarBoslukMM;
    const double H = maxH + 2 * opts.kenarBoslukMM;

    std::ostringstream s;
    s << "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 " << f3(W) << " " << f3(H) << "\""
      << " width=\"" << f3(W) << "mm\" height=\"" << f3(H) << "mm\""
      << " data-scale=\"1:1\" data-unit-mm=\"1\" data-sheet=\"stitchu-pattern-sheet-v1\""
      << " data-graf=\"" << g.id << "\" data-body=\"" << bodyId << "\""
      << " data-parca=\"" << parcalar.size() << "\">\n";
    s << "  <title>" << esc(g.id) << " kalip @ " << esc(bodyId) << "</title>\n";
    s << "  <rect width=\"" << f3(W) << "\" height=\"" << f3(H) << "\" fill=\"#ffffff\"/>\n";
    s << "  <g font-family=\"Helvetica,Arial,sans-serif\" fill=\"none\" stroke=\"#111111\">\n";

    for (const Parca& pr : parcalar) {
        const Panel& p = *pr.p;
        s << "  <g data-panel=\"" << esc(p.id) << "\">\n";
        // katman 1: kesim cizgisi
        if (!pr.kesimHatti.empty())
            s << "    <path data-katman=\"1\" data-tur=\"kesim\" stroke-width=\"" << f3(wKesim)
              << "\" d=\"" << pathD(pr.kesimHatti, pr.dx, pr.dy) << "\"/>\n";
        // katman 14: dikis cizgisi (kesikli)
        s << "    <path data-katman=\"14\" data-tur=\"dikis\" stroke-width=\"" << f3(wDikis)
          << "\" stroke-dasharray=\"" << f3(dashDikisOn) << " " << f3(dashDikisOn)
          << "\" d=\"" << pathD(pr.dikisHatti, pr.dx, pr.dy) << "\"/>\n";
        // katman 6: kat cizgisi (mirror line) + yazisi
        if (!pr.katHatti.empty()) {
            s << "    <path data-katman=\"6\" data-tur=\"kat\" stroke-width=\"" << f3(wKat)
              << "\" stroke-dasharray=\"" << f3(dashDikisOn) << " " << f3(dashDikisOn)
              << "\" d=\"" << pathD(pr.katHatti, pr.dx, pr.dy) << "\"/>\n";
            double ky = pr.kutu.y + pr.kutu.height * 0.5 + pr.dy;
            double kx = pr.katHatti[0].to.x + pr.dx;
            s << "    <text data-katman=\"15\" x=\"" << f3(kx + tKat * 0.4) << "\" y=\"" << f3(ky)
              << "\" font-size=\"" << f3(tKat) << "\" fill=\"#111111\" stroke=\"none\""
              << " transform=\"rotate(-90 " << f3(kx + tKat * 0.4) << " " << f3(ky) << ")\">ON FOLD</text>\n";
        }
        // katman 8: ic cizgiler (pens bacaklari)
        for (const Edge& e : p.edges) {
            if (e.kind != "dartLeg") continue;
            EvalCtx ctx = p.ctxFor(body, opts.onArkaEsit);
            s << "    <path data-katman=\"8\" data-tur=\"pens\" data-edge=\"" << esc(e.id)
              << "\" stroke-width=\"" << f3(wIc) << "\" d=\"" << pathD(e.path(ctx), pr.dx, pr.dy) << "\"/>\n";
        }
        // katman 4: centikler (kenara dik, kesim cizgisine dogru; on 1 / arka 2 cizgi)
        {
            EvalCtx ctx = p.ctxFor(body, opts.onArkaEsit);
            for (const Edge& e : p.edges) {
                for (double t : e.notches) {
                    Point a = e.at(ctx, std::max(0.0, t - 0.01)), b2 = e.at(ctx, std::min(1.0, t + 0.01));
                    Point tg{ b2.x - a.x, b2.y - a.y };
                    double L = std::sqrt(tg.x * tg.x + tg.y * tg.y);
                    if (L < 1e-9) continue;
                    Point n{ -tg.y / L, tg.x / L };
                    Point m = e.at(ctx, t);
                    // Kesim cizgisi yonu: panel merkezinden DISARI
                    Point c{ pr.kutu.x + pr.kutu.width / 2, pr.kutu.y + pr.kutu.height / 2 };
                    if ((m.x - c.x) * n.x + (m.y - c.y) * n.y < 0) { n.x = -n.x; n.y = -n.y; }
                    int adet = e.role.find("back") != std::string::npos ? 2 : 1;
                    for (int k = 0; k < adet; ++k) {
                        double off = (adet == 1) ? 0.0 : (k == 0 ? -centikCift / 2 : centikCift / 2);
                        Point o{ m.x + (tg.x / L) * off, m.y + (tg.y / L) * off };
                        s << "    <path data-katman=\"4\" data-tur=\"centik\" data-edge=\"" << esc(e.id)
                          << "\" stroke-width=\"" << f3(centikGen) << "\" d=\"M " << f3(o.x + pr.dx) << " " << f3(o.y + pr.dy)
                          << " L " << f3(o.x + n.x * centikUz + pr.dx) << " " << f3(o.y + n.y * centikUz + pr.dy) << "\"/>\n";
                    }
                }
            }
        }
        // katman 7: grain oku (grainDeg; uzunluk = parca boyunun uzunlukOran'i)
        {
            double cx = pr.kutu.x + pr.kutu.width * 0.5 + pr.dx;
            double cy = pr.kutu.y + pr.kutu.height * 0.5 + pr.dy;
            double len = pr.kutu.height * grainOran;
            double rad = p.grainDeg * M_PI / 180.0;
            double ux = std::sin(rad), uy = std::cos(rad);   // 0 deg = duz cozgu (asagi)
            double x1 = cx - ux * len / 2, y1 = cy - uy * len / 2;
            double x2 = cx + ux * len / 2, y2 = cy + uy * len / 2;
            s << "    <path data-katman=\"7\" data-tur=\"grain\" stroke-width=\"" << f3(wGrain)
              << "\" d=\"M " << f3(x1) << " " << f3(y1) << " L " << f3(x2) << " " << f3(y2) << "\"/>\n";
            for (int u = 0; u < 2; ++u) {
                double sx = u ? x2 : x1, sy = u ? y2 : y1, dsx = u ? ux : -ux, dsy = u ? uy : -uy;
                double px = -dsy, py = dsx;
                s << "    <path data-katman=\"7\" data-tur=\"grainOk\" stroke-width=\"" << f3(wGrain)
                  << "\" d=\"M " << f3(sx - dsx * grainOkBasi + px * grainOkBasi * 0.4) << " "
                  << f3(sy - dsy * grainOkBasi + py * grainOkBasi * 0.4) << " L " << f3(sx) << " " << f3(sy)
                  << " L " << f3(sx - dsx * grainOkBasi - px * grainOkBasi * 0.4) << " "
                  << f3(sy - dsy * grainOkBasi - py * grainOkBasi * 0.4) << "\"/>\n";
            }
        }
        // katman 15: parca etiketi (contract parcaEtiketi.satirlar sirasi)
        {
            double tx = pr.kutu.x + pr.kutu.width * 0.5 + pr.dx;
            double ty = pr.kutu.y + pr.dy + pr.kutu.height * 0.22;
            const char* kesimTal = p.onFold ? "CUT 1X ON FOLD" : (p.cutCount >= 2 ? "CUT 2X MIRRORED" : "CUT 1X");
            s << "    <text data-katman=\"15\" x=\"" << f3(tx) << "\" y=\"" << f3(ty) << "\" text-anchor=\"middle\""
              << " font-size=\"" << f3(tParcaAdi) << "\" fill=\"#111111\" stroke=\"none\">" << esc(p.id) << "</text>\n";
            const std::string satirlar[3] = {
                std::string(kesimTal) + (p.cutCount > 1 && !p.onFold ? "" : ""),
                bodyId,
                "Seam Allowance " + f3(pr.dp) + " mm"
            };
            for (int i = 0; i < 3; ++i)
                s << "    <text data-katman=\"15\" x=\"" << f3(tx) << "\" y=\"" << f3(ty + tGovde * 1.5 * (i + 1))
                  << "\" text-anchor=\"middle\" font-size=\"" << f3(tGovde) << "\" fill=\"#111111\" stroke=\"none\">"
                  << esc(satirlar[i]) << "</text>\n";
        }
        s << "  </g>\n";
    }
    s << "  </g>\n</svg>\n";
    return s.str();
}

}  // namespace graf
}  // namespace stitchu
