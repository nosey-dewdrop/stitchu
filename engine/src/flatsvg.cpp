// flatsvg.cpp — bkz. flatsvg.hpp. Cizim, GEOMETRI ICAT ETMEDEN, iki var olan katmandan turer:
//   nokta  : graf.hpp eval (landmark + oran -> mm)
//   yerlesim: grafdogrula.hpp dogrula(...).pozlar (dikis agaci BFS, ilan edilen eslesme)
#include "flatsvg.hpp"

#include <algorithm>
#include <cmath>
#include <functional>
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
    // AYNA GORUNUMUN kat ekseninde alinir (aynaX), panelin kendi x'inde DEGIL. Fark
    // kat kenari OLMAYAN panelde ortaya cikar: kol kendi duzleminde yansitilirsa iki kopya
    // da ayni oyuga yapisir (olculdu: iki path'in ilk noktasi ayni); gorunum ekseninde
    // yansitilinca sag ve sol kol karsilikli iki oyuga oturur.
    bool ayna = false;
    double aynaX = 0;    // gorunumun kat ekseni (SVG koordinatinda)
    Point ap(Point p) const {
        double X = a * p.x + b * p.y + tx, Y = c * p.x + d * p.y + ty;
        return { ayna ? (2 * aynaX - X) : X, Y };
    }
};

// Bir panelin GORUNUMU: hangi kat kenarini tasiyorsa o. Kat kenari olmayan panel (kol gibi)
// dikildigi panelin gorunumunu alir. Giysi tipine bakan bir dal YOK: yalniz kenar rolu ve
// dikis grafi okunur (madde: sabit menu yok).
std::string foldRoluOf(const Panel& p) {
    for (const Edge& e : p.edges) if (e.kind == "fold") return e.role;
    return {};
}

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

    // 1) GORUNUM AYRIMI (bu adimin kok degisikligi). Onceki hal panelleri dogrulayicinin
    // dikis-agaci pozlariyla "acilmis kitap" gibi diziyordu: her parca yerli yerindeydi ama
    // sayfa bir GIYSI gibi okunmuyordu. Teknik flat, giysinin ON ve ARKA gorunumudur.
    // Kural yapisal: bir panel hangi KAT kenarini tasiyorsa o gorunume girer (rol "cf" -> on,
    // "cb" -> arka); kat kenari olmayan panel (kol) dikildigi panelin gorunumunu alir.
    // Gorunum icinde panel KENDI beden koordinatlarinda durur (poz birim) — hepsi ayni
    // landmark kumesinden degerlendigi icin bel/omuz cizgileri zaten cakisir — ve x=0 kat
    // ekseninde AYNALANIR: yarim panelden butun giysi.
    DogrulamaRaporu R = dogrula(g, body, contract, opts.onArkaEsit);
    std::map<std::string, std::string> gorunum;   // panel id -> fold rolu ("cf"/"cb")
    for (const Panel& p : g.panels) {
        std::string r = foldRoluOf(p);
        if (!r.empty()) gorunum[p.id] = r;
    }
    // Kat kenari olmayan paneller: dikis grafinden yayilim (sabit nokta, en fazla panel sayisi tur).
    for (std::size_t tur = 0; tur < g.panels.size(); ++tur) {
        bool degisti = false;
        for (const Seam& sm : g.seams) {
            std::string bul;
            for (const std::vector<EdgeRef>* yan : { &sm.a, &sm.b })
                for (const EdgeRef& r2 : *yan)
                    if (bul.empty() && gorunum.count(r2.panel)) bul = gorunum[r2.panel];
            if (bul.empty()) continue;
            for (const std::vector<EdgeRef>* yan : { &sm.a, &sm.b })
                for (const EdgeRef& r2 : *yan)
                    if (!gorunum.count(r2.panel)) { gorunum[r2.panel] = bul; degisti = true; }
        }
        if (!degisti) break;
    }
    // Gorunum sirasi: grafin panel sirasindaki ilk gorulme sirasi (deterministik, alfabetik degil).
    std::vector<std::string> gorunumSira;
    for (const Panel& p : g.panels) {
        auto it = gorunum.find(p.id);
        if (it == gorunum.end()) continue;
        if (std::find(gorunumSira.begin(), gorunumSira.end(), it->second) == gorunumSira.end())
            gorunumSira.push_back(it->second);
    }
    if (gorunumSira.empty()) { hata = "ERR_NO_VIEW: hicbir panel kat kenari tasimiyor, gorunum kurulamadi"; return {}; }

    // 2) Her gorunumun kendi sinir kutusu (aynali: x -> [-w, +w]); gorunumler yan yana dizilir.
    std::map<std::string, EvalCtx> ctxs;
    std::map<std::string, Point> merkezler;
    std::map<std::string, Rect> gKutu;
    for (const Panel& p : g.panels) {
        EvalCtx ctx = p.ctxFor(body, opts.onArkaEsit);
        ctxs[p.id] = ctx;
        std::vector<PathCommand> o = p.outline(ctx);
        merkezler[p.id] = centroidOf(o);
    }
    // TEMEL POZ. Kat kenari TASIYAN panel kendi beden koordinatlarinda durur (birim poz):
    // hepsi ayni landmark kumesinden degerlendigi icin bel/omuz cizgileri zaten cakisir.
    // Kat kenari OLMAYAN panel (kol gibi) kendi basina bir yer bilmez; dogrulayicinin
    // dikis agacindan cikardigi 2B pozla, dikildigi panelin oyugundan ACILARAK oturur.
    // Bu bir giysi-tipi dali degil: "kat kenarin varsa kendi eksenindesin, yoksa dikisin
    // seni tasidigi yerdesin" cumlesi grafin kendi yapisindan okunur.
    std::map<std::string, Poz> temelPoz;
    for (const PanelPoz& pz : R.pozlar) {
        Poz z; z.var = true;
        const Panel* pp = g.panel(pz.panel);
        if (pp && foldRoluOf(*pp).empty()) {
            if (!pz.yerlesti) { z.var = false; }
            else { z.a = pz.a; z.b = pz.b; z.c = pz.c; z.d = pz.d; z.tx = pz.tx; z.ty = pz.ty; }
        }
        temelPoz[pz.panel] = z;
    }
    for (const Panel& p : g.panels) if (!temelPoz.count(p.id)) { Poz z; z.var = true; temelPoz[p.id] = z; }

    for (const std::string& gv : gorunumSira) {
        Rect r; bool ilk = true;
        for (const Panel& p : g.panels) {
            if (!gorunum.count(p.id) || gorunum[p.id] != gv) continue;
            if (!temelPoz[p.id].var) continue;
            growCmds(r, p.outline(ctxs[p.id]), temelPoz[p.id], ilk);
        }
        if (ilk) { hata = "ERR_EMPTY_OUTLINE: gorunum " + gv + " bos"; return {}; }
        // ayna: x ekseninde simetrik kutu
        double w = std::max(std::fabs(r.x), std::fabs(r.x + r.width));
        r.x = -w; r.width = 2 * w;
        gKutu[gv] = r;
    }
    // Gorunum kaydirmalari (yan yana, aralarinda pay).
    std::map<std::string, Poz> pozlar;   // panel id -> gorunumunun kaydirmasi (ayna DISINDA)
    double gx = 0, yUst = 0, yAlt = 0;
    for (const std::string& gv : gorunumSira) {
        const Rect& r = gKutu[gv];
        double dx = gx - r.x;
        for (const Panel& p : g.panels) {
            if (!gorunum.count(p.id) || gorunum[p.id] != gv) continue;
            Poz z = temelPoz[p.id];
            if (!z.var) continue;   // dikis agacina baglanmayan kat kenarsiz panel: CIZILMEZ (uydurma yer yok)
            z.tx += dx;
            z.aynaX = dx;           // gorunumun kat ekseni: panel x=0'in bu gorunumdeki yeri
            pozlar[p.id] = z;
        }
        yUst = std::min(yUst, r.y);
        yAlt = std::max(yAlt, r.y + r.height);
        gx += r.width + opts.gorunumArasiMM;
    }
    const int yerlesen = static_cast<int>(pozlar.size());
    if (yerlesen == 0) { hata = "ERR_NO_PLACEMENT: hicbir panel gorunume dusmedi"; return {}; }

    Rect bb;
    bb.x = 0; bb.y = yUst; bb.width = gx - opts.gorunumArasiMM; bb.height = yAlt - yUst;

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

    // AYNA: her panel iki kez cizilir — kendisi ve x=0 kat ekseninde yansimasi. Yarim
    // panelden BUTUN giysi bu sayede cikar (web/lib/flat-from-pattern.js'in "sag yari +
    // ayna" konvansiyonu, C++'a tasindi). data-yan ile hangi yari oldugu ilan edilir.
    auto ciftler = [&](const Panel& p, const std::function<void(const Poz&, const char*)>& yaz) {
        auto it = pozlar.find(p.id);
        if (it == pozlar.end() || !it->second.var) return;
        Poz sag = it->second, sol = it->second;
        sol.ayna = true;
        yaz(sag, "sag");
        yaz(sol, "sol");
    };

    // ---- katman: outline
    s << "  <g id=\"outline\" fill=\"none\" stroke=\"#111111\" stroke-width=\"" << f3(wOutline)
      << "\" stroke-linejoin=\"round\">\n";
    for (const Panel& p : g.panels)
        ciftler(p, [&](const Poz& z, const char* yan) {
            s << "    <path data-panel=\"" << p.id << "\" data-yan=\"" << yan
              << "\" data-gorunum=\"" << gorunum[p.id] << "\" d=\"" << pathD(p.outline(ctxs[p.id]), z) << "\"/>\n";
        });
    s << "  </g>\n";

    // ---- katman: seams (kind == seam olan kenarlar)
    s << "  <g id=\"seams\" fill=\"none\" stroke=\"#111111\" stroke-width=\"" << f3(wSeam) << "\">\n";
    for (const Panel& p : g.panels)
        ciftler(p, [&](const Poz& z, const char* yan) {
            for (const Edge& e : p.edges) {
                if (e.kind != "seam") continue;
                s << "    <path data-panel=\"" << p.id << "\" data-yan=\"" << yan << "\" data-edge=\"" << e.id
                  << "\" data-role=\"" << e.role << "\" d=\"" << edgeD(e, ctxs[p.id], z) << "\"/>\n";
            }
        });
    s << "  </g>\n";

    // ---- katman: topstitch (dikisli kenarin panel icine kaymis izi; kesikli)
    const double ofsMM = birim / 150.0;
    s << "  <g id=\"topstitch\" fill=\"none\" stroke=\"#111111\" stroke-width=\"" << f3(wDetail)
      << "\" stroke-dasharray=\"" << f3(birim / 120.0) << " " << f3(birim / 200.0) << "\">\n";
    for (const Panel& p : g.panels)
        ciftler(p, [&](const Poz& z, const char* yan) {
            Point mrk = merkezler.count(p.id) ? merkezler[p.id] : Point{ 0, 0 };
            for (const Edge& e : p.edges) {
                if (e.kind != "seam") continue;
                Point n = normalIn(e, ctxs[p.id], mrk);
                if (n.x == 0 && n.y == 0) continue;
                // Ofset panelin KENDI duzleminde uygulanir (aynadan once), boylece ayna
                // yarisinda da ic tarafa dogru kayar.
                // Ofset panelin KENDI duzleminde uygulanir (poz ve aynadan once), boylece
                // iki yaride de panel icine dogru kayar.
                Poz zo = z;
                zo.tx += z.a * n.x * ofsMM + z.b * n.y * ofsMM;
                zo.ty += z.c * n.x * ofsMM + z.d * n.y * ofsMM;
                s << "    <path data-panel=\"" << p.id << "\" data-yan=\"" << yan << "\" data-edge=\"" << e.id
                  << "\" d=\"" << edgeD(e, ctxs[p.id], zo) << "\"/>\n";
            }
        });
    s << "  </g>\n";

    // ---- katman: details (pens bacaklari, kat cizgisi, centikler)
    s << "  <g id=\"details\" fill=\"none\" stroke=\"#111111\" stroke-width=\"" << f3(wDetail) << "\">\n";
    const double centikMM = birim / 100.0;
    for (const Panel& p : g.panels)
        ciftler(p, [&](const Poz& z, const char* yan) {
            const EvalCtx& ctx = ctxs[p.id];
            Point mrk = merkezler.count(p.id) ? merkezler[p.id] : Point{ 0, 0 };
            for (const Edge& e : p.edges) {
                // Kat kenari YALNIZ bir kez cizilir (iki yari ayni cizgiye oturur; iki kez
                // basmak sayfaya kalinlasmis sahte bir cizgi koyar).
                if (e.kind == "fold") {
                    if (std::string(yan) == "sag")
                        s << "    <path data-panel=\"" << p.id << "\" data-edge=\"" << e.id
                          << "\" data-tur=\"kat\" stroke-dasharray=\"" << f3(birim / 60.0) << " " << f3(birim / 90.0)
                          << " " << f3(birim / 300.0) << " " << f3(birim / 90.0) << "\" d=\"" << edgeD(e, ctx, z) << "\"/>\n";
                } else if (e.kind == "dartLeg") {
                    s << "    <path data-panel=\"" << p.id << "\" data-yan=\"" << yan << "\" data-edge=\"" << e.id
                      << "\" data-tur=\"pens\" d=\"" << edgeD(e, ctx, z) << "\"/>\n";
                }
                for (double t : e.notches) {
                    Point m = e.at(ctx, t);
                    Point n = normalIn(e, ctx, mrk);
                    Point A = z.ap(m);
                    Point B = z.ap({ m.x + n.x * centikMM, m.y + n.y * centikMM });
                    s << "    <path data-panel=\"" << p.id << "\" data-yan=\"" << yan << "\" data-edge=\"" << e.id
                      << "\" data-tur=\"centik\" d=\"M " << f3(A.x) << " " << f3(A.y)
                      << " L " << f3(B.x) << " " << f3(B.y) << "\"/>\n";
                }
            }
        });
    s << "  </g>\n";
    s << "</svg>\n";
    return s.str();
}

}  // namespace graf
}  // namespace stitchu
