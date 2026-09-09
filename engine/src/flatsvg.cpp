// flatsvg.cpp — bkz. flatsvg.hpp. GRAFTAN FASHION FLAT (0509 A4, 2026-09-09, Damla karari: "flat emsal
// flat'lerin yanina konunca ayni turden bir fashion flat gibi gorunmeli; kalip parcalarinin kagida
// serilmis hali DEGIL").
//
// KURALLAR (hepsi grafin kendi yapisindan ve Body'den okunur; giysi-tipi dali YOK):
//   1. GORUNUM = KAT EKSENI. Panel x=0'da bir kat kenari ya da x=0 dikisi tasiyorsa (rol cf* -> on,
//      cb* -> arka) o gorunumun paneli; kendi beden koordinatinda durur, x=0'da aynalanir.
//   2. EKSENSIZ PANEL (kol gibi) DIKILDIGI GORUNUMLERDE SARKAR. Dikis partneri eksenli panelin
//      kenarlari (kol oyugu) gorunumde S (en ust: omuz ucu) ve U (en alt: koltukalti) noktalarini
//      verir. Tup, U'dan bedenin kol ekseni dogrultusunda (croquis: shoulderTip->wrist) asagi iner;
//      gorunur genisligi panel genisligi / pi (tup capi: yandan bakilan silindir capini gosterir,
//      duz serilmis yarimi degil — GIRDI/iyi-flat 07'de olculdu: kol gorunur genisligi 0.49 x
//      gogus yarimi, cevre/pi ile uyumlu, cevre/2 ile degil). Kapak basi S->O disbukey kubik.
//   3. CIZGI HIYERARSISI = DIKIS PARTNERININ GORUNUMU. Kenarin dikis partneri AYNI gorunumde
//      ciziliyorsa ic dikis (ince), obur gorunumdeyse ya da kesim kenariysa siluet (kalin);
//      ust dikis izi (kesikli) yalniz bitirmeli kesim kenarinda (hem/faced). Pens tek cizgi
//      (agiz ortasi -> apeks), agiz kopru cizgisiyle kapanir. Centik flat'te yoktur.
//   4. CROQUIS SILUETI olcum yolu: her gorunumde Body landmark'larindan (neckBase, shoulderTip,
//      koltukalti, gogus hatti, gogus alti, bel, ust kalca, kalca) cizilen gorunmez yol
//      (data-rol="siluet"); KAPI B (flat_ayni_insan_check) bel/gogus/kalca yarimini oradan olcer.
//      Giysi degil BEDEN olculur: HEDEF 5 "ayni insan" iddiasi giysinin bollugundan bagimsizdir.
//   Koordinat: gorunum grubu <g transform="translate(gx 0)">, grup ici x=0 CF/CB, y=0 omuz cizgisi
//   (neckBase), birim mm — contract/body-v1.json ayniInsan.svgNitelikleri.
//
// DETERMINIZM: ayni graf + ayni beden -> BAYT-AYNI SVG. Sayilar %.3f, sira grafin kendi sirasi.
#include "flatsvg.hpp"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <functional>
#include <map>
#include <set>
#include <sstream>

#include "grafdogrula.hpp"

namespace stitchu {
namespace graf {

namespace {

const double kPi = 3.14159265358979323846;

std::string f3(double v) {
    if (!(v == v)) return "0.000";
    if (v == 0.0) v = 0.0;
    char b[48];
    std::snprintf(b, sizeof b, "%.3f", v);
    return b;
}

// Afin poz: x' = a x + b y + tx, y' = c x + d y + ty; ayna: x' -> -x' (gorunum ekseni x=0).
struct Poz {
    double a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0;
    bool ayna = false;
    Point ap(Point p) const {
        double X = a * p.x + b * p.y + tx, Y = c * p.x + d * p.y + ty;
        return { ayna ? -X : X, Y };
    }
};

std::string pathD(const std::vector<PathCommand>& cmds, const Poz& z) {
    std::string d;
    for (const PathCommand& c : cmds) {
        switch (c.type) {
            case CmdType::Move: { Point p = z.ap(c.to); d += "M " + f3(p.x) + " " + f3(p.y); break; }
            case CmdType::Line: { Point p = z.ap(c.to); d += " L " + f3(p.x) + " " + f3(p.y); break; }
            case CmdType::Curve: {
                Point p1 = z.ap(c.cp1), p2 = z.ap(c.cp2), p = z.ap(c.to);
                d += " C " + f3(p1.x) + " " + f3(p1.y) + " " + f3(p2.x) + " " + f3(p2.y) + " " + f3(p.x) + " " + f3(p.y);
                break;
            }
            case CmdType::Close: d += " Z"; break;
        }
    }
    return d;
}

void grow(Rect& r, Point p, bool& first) {
    if (first) { r.x = p.x; r.y = p.y; r.width = 0; r.height = 0; first = false; return; }
    double x0 = std::min(r.x, p.x), y0 = std::min(r.y, p.y);
    double x1 = std::max(r.x + r.width, p.x), y1 = std::max(r.y + r.height, p.y);
    r.x = x0; r.y = y0; r.width = x1 - x0; r.height = y1 - y0;
}

std::vector<Point> flatPts(const std::vector<PathCommand>& cmds) {
    std::vector<Point> out;
    Point cur{ 0, 0 };
    for (const PathCommand& c : cmds) {
        if (c.type == CmdType::Close) continue;
        if (c.type == CmdType::Curve) { for (Point q : flattenCubic(cur, c.to, c.cp1, c.cp2, 24)) out.push_back(q); }
        else out.push_back(c.to);
        cur = c.to;
    }
    return out;
}

void growCmds(Rect& r, const std::vector<PathCommand>& cmds, const Poz& z, bool& first) {
    for (Point q : flatPts(cmds)) { grow(r, z.ap(q), first); Poz m = z; m.ayna = !z.ayna; grow(r, m.ap(q), first); }
}

// Panelin gorunum ekseni: kat kenari ya da x=0 dikisi (rol cb* -> "cb", degilse "cf"). Yoksa bos.
std::string eksenOf(const Panel& p) {
    for (const Edge& e : p.edges) if (e.kind == "fold") return e.role.rfind("cb", 0) == 0 ? "cb" : "cf";
    // x=0'da duran her kenar (dikis, kesim: dugme paci, pervazli yaka bandi orta arkasi) eksendir; rol cb* -> arka, degilse on.
    // Kol gibi eksensiz panel x=0 kenar tasimaz (A4 hakem kusur 3: boyun bandi cut cb kenariyla eksenliydi, tup gibi ciziliyordu).
    for (const Edge& e : p.edges)
        if (e.kind != "dartLeg" && e.from.xSifir() && e.to.xSifir()) return e.role.rfind("cb", 0) == 0 ? "cb" : "cf";
    return {};
}

struct KenarSinif { bool kalin = false; bool ciz = true; };

}  // namespace

std::string flatSVG(const Garment& g, const Body& body, const std::string& bodyId,
                    const JVal& contract, const JVal& bodyContract,
                    const FlatOpts& opts, std::string& hata) {
    hata.clear();
    (void)contract; (void)bodyContract;
    if (g.panels.empty()) { hata = "ERR_EMPTY_GARMENT: graf panelsiz"; return {}; }

    // ---- 1) gorunumler
    std::map<std::string, std::string> eksen;          // eksenli panel -> "cf"/"cb"
    for (const Panel& p : g.panels) { std::string e = eksenOf(p); if (!e.empty()) eksen[p.id] = e; }
    // onto: konagin gorunumu (konak eksenli ya da onto zinciri)
    for (std::size_t tur = 0; tur < g.panels.size(); ++tur) {
        bool degisti = false;
        for (const Panel& p : g.panels)
            if (!p.onto.empty() && !eksen.count(p.id) && eksen.count(p.onto)) { eksen[p.id] = eksen[p.onto]; degisti = true; }
        if (!degisti) break;
    }
    std::vector<std::string> gorunumSira;
    for (const Panel& p : g.panels) {
        auto it = eksen.find(p.id);
        if (it == eksen.end()) continue;
        if (std::find(gorunumSira.begin(), gorunumSira.end(), it->second) == gorunumSira.end()) gorunumSira.push_back(it->second);
    }
    if (gorunumSira.empty()) { hata = "ERR_NO_VIEW: hicbir panel kat kenari tasimiyor, gorunum kurulamadi"; return {}; }
    std::stable_sort(gorunumSira.begin(), gorunumSira.end(), [](const std::string& a, const std::string& b) {
        return (a.rfind("cf", 0) == 0) && !(b.rfind("cf", 0) == 0);   // on once, arka sonra
    });

    std::map<std::string, EvalCtx> ctxs;
    for (const Panel& p : g.panels) ctxs[p.id] = p.ctxFor(body, opts.onArkaEsit);

    // ---- 2) eksensiz panel (kol): gorunum basina sarkma pozu
    struct Sarkma {
        Poz poz;                                  // panel -> gorunum (afin: n/pi, d)
        std::vector<PathCommand> kapakBasi;       // S -> O kubik
        std::set<std::string> kapakKenar;         // dikise giren (cizilmeyen) kenarlar
    };
    std::map<std::string, std::map<std::string, Sarkma>> sarkma;   // panel -> gorunum -> poz
    // kol ekseni: croquis'te shoulderTip->wrist (sevkPoz kolAcisiDeg), yoksa duz asagi
    Point dKol{ 0, 1 };
    if (body.hasLandmark("landmark.shoulderTip") && body.hasLandmark("landmark.wrist")) {
        BodyPoint s = body.landmark("landmark.shoulderTip"), w = body.landmark("landmark.wrist");
        double L = std::hypot(w.x - s.x, w.y - s.y);
        if (L > 1e-9) dKol = { (w.x - s.x) / L, (w.y - s.y) / L };
    }
    const Point nKol{ dKol.y, -dKol.x };   // disa (+x) bakan normal
    for (const Panel& p : g.panels) {
        if (eksen.count(p.id)) continue;
        // bu panelin kenarlarini tasiyan dikisler; partner eksenli panel kenarlari gorunume gore
        std::map<std::string, std::vector<Point>> partnerPts;   // gorunum -> partner kenar noktalari
        std::set<std::string> kapak;
        for (const Seam& sm : g.seams) {
            for (int yan = 0; yan < 2; ++yan) {
                const std::vector<EdgeRef>& bu = yan == 0 ? sm.a : sm.b;
                const std::vector<EdgeRef>& obur = yan == 0 ? sm.b : sm.a;
                bool benim = false;
                for (const EdgeRef& r : bu) if (r.panel == p.id) benim = true;
                if (!benim) continue;
                bool partnerEksenli = false;
                for (const EdgeRef& r : obur) {
                    if (!eksen.count(r.panel) || r.panel == p.id) continue;
                    const Panel* q = g.panel(r.panel); const Edge* e = q ? q->edge(r.edge) : nullptr;
                    if (!e) continue;
                    partnerEksenli = true;
                    for (Point pt : flatPts(e->path(ctxs[q->id]))) partnerPts[eksen[r.panel]].push_back(pt);
                }
                if (partnerEksenli) for (const EdgeRef& r : bu) if (r.panel == p.id) kapak.insert(r.edge);
            }
        }
        if (partnerPts.empty()) continue;   // eksenli panele dikili degil: CIZILMEZ (uydurma yer yok)
        // panelin kapak uclari: kapak kenarlarinin uc noktalari -> x araligi ve alt seviye (yBic)
        double xcMin = 1e9, xcMax = -1e9, yBic = -1e9;
        for (const Edge& e : p.edges) {
            if (!kapak.count(e.id)) continue;
            for (Point q : { eval(e.from, ctxs[p.id]), eval(e.to, ctxs[p.id]) }) { xcMin = std::min(xcMin, q.x); xcMax = std::max(xcMax, q.x); yBic = std::max(yBic, q.y); }
        }
        if (!(xcMax > xcMin)) continue;
        const double wB = (xcMax - xcMin) / kPi;
        for (auto& kv : partnerPts) {
            Point S = kv.second.front(), U = kv.second.front();
            for (Point q : kv.second) { if (q.y < S.y) S = q; if (q.y > U.y) U = q; }
            Sarkma sk;
            // M(x,y) = U + (y - yBic) d + ((x - xcMin)/pi) n
            sk.poz.a = nKol.x / kPi; sk.poz.b = dKol.x; sk.poz.c = nKol.y / kPi; sk.poz.d = dKol.y;
            sk.poz.tx = U.x - xcMin * nKol.x / kPi - yBic * dKol.x;
            sk.poz.ty = U.y - xcMin * nKol.y / kPi - yBic * dKol.y;
            const Point O{ U.x + wB * nKol.x, U.y + wB * nKol.y };
            const double an = (O.x - S.x) * nKol.x + (O.y - S.y) * nKol.y;   // disa uzanim
            const double bd = (O.x - S.x) * dKol.x + (O.y - S.y) * dKol.y;   // asagi uzanim
            const Point c1{ S.x + 0.55 * an * nKol.x + 0.02 * bd * dKol.x, S.y + 0.55 * an * nKol.y + 0.02 * bd * dKol.y };
            const Point c2{ O.x - 0.45 * bd * dKol.x, O.y - 0.45 * bd * dKol.y };
            sk.kapakBasi = { PathCommand::move(S), PathCommand::curve(O, c1, c2) };
            sk.kapakKenar = kapak;
            sarkma[p.id][kv.first] = sk;
        }
    }

    // gorunumde cizilen paneller
    auto gorunumde = [&](const std::string& panel, const std::string& gv) {
        auto it = eksen.find(panel);
        if (it != eksen.end()) return it->second == gv;
        auto s = sarkma.find(panel);
        return s != sarkma.end() && s->second.count(gv) > 0;
    };

    // ---- 3) kenar sinifi (kalin/ince) — dikis partnerinin gorunumu
    auto sinifla = [&](const Panel& p, const Edge& e, const std::string& gv) {
        KenarSinif k;
        if (e.kind == "fold") { k.ciz = false; return k; }
        if (e.kind == "dartLeg") { k.ciz = false; return k; }
        if (e.kind == "cut") { k.kalin = e.finish != "raw"; return k; }
        // seam: partner ayni gorunumde ciziliyorsa ince
        bool partnerBurada = false, dikili = false;
        for (const Seam& sm : g.seams)
            for (int yan = 0; yan < 2; ++yan) {
                const std::vector<EdgeRef>& bu = yan == 0 ? sm.a : sm.b;
                const std::vector<EdgeRef>& obur = yan == 0 ? sm.b : sm.a;
                bool benim = false;
                for (const EdgeRef& r : bu) if (r.panel == p.id && r.edge == e.id) benim = true;
                if (!benim) continue;
                dikili = true;
                for (const EdgeRef& r : obur) if (gorunumde(r.panel, gv)) partnerBurada = true;
            }
        k.kalin = !(dikili && partnerBurada);
        return k;
    };

    // ---- 4) gorunum kutulari
    std::map<std::string, Rect> gKutu;
    for (const std::string& gv : gorunumSira) {
        Rect r; bool ilk = true;
        for (const Panel& p : g.panels) {
            if (!gorunumde(p.id, gv)) continue;
            if (eksen.count(p.id)) { Poz z; growCmds(r, p.outline(ctxs[p.id]), z, ilk); }
            else {
                const Sarkma& sk = sarkma[p.id][gv];
                growCmds(r, sk.kapakBasi, Poz{}, ilk);
                for (const Edge& e : p.edges) if (!sk.kapakKenar.count(e.id)) growCmds(r, e.path(ctxs[p.id]), sk.poz, ilk);
            }
        }
        if (ilk) { hata = "ERR_EMPTY_OUTLINE: gorunum " + gv + " bos"; return {}; }
        // croquis silueti de kutuya girer (olcum yolu, gorunmez)
        for (const char* lm : { "landmark.neckBase", "landmark.shoulderTip", "landmark.underarm", "landmark.bustLine", "landmark.waist", "landmark.hip" })
            if (body.hasLandmark(lm)) { BodyPoint b = body.landmark(lm); grow(r, { b.x, b.y }, ilk); grow(r, { -b.x, b.y }, ilk); }
        gKutu[gv] = r;
    }
    std::map<std::string, double> gx;
    double x0 = 0, yUst = 0, yAlt = 0;
    for (const std::string& gv : gorunumSira) {
        const Rect& r = gKutu[gv];
        gx[gv] = x0 - r.x;
        yUst = std::min(yUst, r.y); yAlt = std::max(yAlt, r.y + r.height);
        x0 += r.width + opts.gorunumArasiMM;
    }
    const double pad = opts.kenarBoslukMM;
    const double vx = -pad, vy = yUst - pad, vw = (x0 - opts.gorunumArasiMM) + 2 * pad, vh = (yAlt - yUst) + 2 * pad;
    const double birim = std::max(vw, vh);
    // kontur : ic dikis : ust dikis = 4 : 2 : 1 (flat-convention sevkPoz.topstitch)
    const double wOutline = birim / 400.0, wSeam = wOutline / 2.0, wTop = wOutline / 4.0;

    int yerlesen = 0;
    for (const Panel& p : g.panels) if (eksen.count(p.id) || sarkma.count(p.id)) ++yerlesen;

    std::ostringstream s;
    s << "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\""
      << f3(vx) << " " << f3(vy) << " " << f3(vw) << " " << f3(vh) << "\""
      << " data-scale=\"1:1\" data-unit-mm=\"1\""
      << " data-graf=\"" << g.id << "\" data-body=\"" << bodyId << "\" data-size=\"" << bodyId << "\""
      << " data-panel=\"" << yerlesen << "\" data-gorunum=\"" << gorunumSira.size() << "\"";
    struct LmIlan { const char* attr; const char* lm; };
    const LmIlan ilanlar[] = { { "data-y-waist", "landmark.waist" }, { "data-y-bust", "landmark.bustLine" }, { "data-y-hip", "landmark.hip" } };
    for (const LmIlan& li : ilanlar)
        if (body.hasLandmark(li.lm)) s << " " << li.attr << "=\"" << f3(body.landmark(li.lm).y) << "\"";
    s << ">\n";
    s << "  <title>" << g.id << " flat @ " << bodyId << "</title>\n";
    s << "  <rect x=\"" << f3(vx) << "\" y=\"" << f3(vy) << "\" width=\"" << f3(vw) << "\" height=\"" << f3(vh) << "\" fill=\"#ffffff\"/>\n";

    auto viewAd = [](const std::string& gv) { return gv.rfind("cb", 0) == 0 ? "back" : "front"; };
    auto grupAc = [&](const std::string& gv) {
        s << "    <g data-view=\"" << viewAd(gv) << "\" data-eksen=\"" << gv << "\" transform=\"translate(" << f3(gx[gv]) << " 0)\">\n";
    };

    // ---- katman: croquis (olcum yolu, gorunmez) — KAPI B siluet secicisi
    s << "  <g id=\"croquis\" fill=\"none\" stroke=\"none\">\n";
    for (const std::string& gv : gorunumSira) {
        grupAc(gv);
        std::vector<Point> sag;
        for (const char* lm : { "landmark.neckBase", "landmark.shoulderTip", "landmark.underarm", "landmark.bustLine", "landmark.underbust", "landmark.waist", "landmark.highHip", "landmark.hip" })
            if (body.hasLandmark(lm)) { BodyPoint b = body.landmark(lm); sag.push_back({ b.x, b.y }); }
        std::string d;
        for (std::size_t i = 0; i < sag.size(); ++i) d += (i ? " L " : "M ") + f3(sag[i].x) + " " + f3(sag[i].y);
        for (std::size_t i = sag.size(); i-- > 0;) d += " L " + f3(-sag[i].x) + " " + f3(sag[i].y);
        d += " Z";
        double belYarim = body.hasLandmark("landmark.waist") ? body.landmark("landmark.waist").x : 0;
        s << "      <path data-rol=\"siluet\" data-view=\"" << viewAd(gv) << "\" data-kaynak=\"croquis-landmark\"";
        if (body.hasLandmark("landmark.bustLine")) s << " data-manken-bust-y=\"" << f3(body.landmark("landmark.bustLine").y) << "\"";
        if (body.hasLandmark("landmark.underarm")) s << " data-manken-koltukalti-y=\"" << f3(body.landmark("landmark.underarm").y) << "\"";
        if (body.hasLandmark("landmark.waist")) s << " data-manken-bel-y=\"" << f3(body.landmark("landmark.waist").y) << "\"";
        if (body.hasLandmark("landmark.hip")) s << " data-manken-kalca-y=\"" << f3(body.landmark("landmark.hip").y) << "\"";
        if (body.hasLandmark("landmark.shoulderTip")) { BodyPoint t = body.landmark("landmark.shoulderTip"); s << " data-omuz-uc=\"" << f3(t.x) << " " << f3(t.y) << "\""; }
        s << " data-manken-bel-yarim-mm=\"" << f3(belYarim) << "\" d=\"" << d << "\"/>\n";
        s << "    </g>\n";
    }
    s << "  </g>\n";

    // her gorunum icin kenar cizimi: kalin/ince/ustdikis/pens
    struct Cizgi { std::string d, panel, edge, tur; };
    std::map<std::string, std::vector<Cizgi>> kalin, ince, ust, pens;
    for (const std::string& gv : gorunumSira) {
        for (const Panel& p : g.panels) {
            if (!gorunumde(p.id, gv)) continue;
            const EvalCtx& ctx = ctxs[p.id];
            const bool eksenli = eksen.count(p.id) > 0;
            const Sarkma* sk = eksenli ? nullptr : &sarkma[p.id][gv];
            const Poz z = eksenli ? Poz{} : sk->poz;
            auto yazPoz = [&](std::map<std::string, std::vector<Cizgi>>& katman, const std::vector<PathCommand>& cmds, const std::string& edge, const std::string& tur, const Poz& zp) {
                for (int yan = 0; yan < 2; ++yan) { Poz zz = zp; zz.ayna = yan == 1; katman[gv].push_back({ pathD(cmds, zz), p.id, edge, tur }); }
            };
            auto yaz = [&](std::map<std::string, std::vector<Cizgi>>& katman, const std::vector<PathCommand>& cmds, const std::string& edge, const std::string& tur) { yazPoz(katman, cmds, edge, tur, z); };
            if (sk) yazPoz(kalin, sk->kapakBasi, "kapak_basi", "kapak", Poz{});   // kapak basi ZATEN gorunum koordinatinda
            for (std::size_t i = 0; i < p.edges.size(); ++i) {
                const Edge& e = p.edges[i];
                if (sk && sk->kapakKenar.count(e.id)) continue;
                if (e.kind == "dartLeg") {
                    // pens cifti: bacak1 (agiz a -> apeks), bacak2 (apeks -> agiz b) — tek cizgi agiz ortasi -> apeks, kopru a -> b
                    if (i + 1 < p.edges.size() && p.edges[i + 1].kind == "dartLeg") {
                        const Edge& e2 = p.edges[i + 1];
                        const Point a = eval(e.from, ctx), apex = eval(e.to, ctx), b = eval(e2.to, ctx);
                        const Point orta{ (a.x + b.x) / 2, (a.y + b.y) / 2 };
                        yaz(pens, { PathCommand::move(orta), PathCommand::line(apex) }, e.id, "pens");
                        // kopru: komsu kenarin sinifinda
                        const KenarSinif ks = i > 0 ? sinifla(p, p.edges[i - 1], gv) : KenarSinif{};
                        yaz(ks.kalin ? kalin : ince, { PathCommand::move(a), PathCommand::line(b) }, e.id, "pens_agzi");
                        ++i;
                    }
                    continue;
                }
                const KenarSinif ks = sinifla(p, e, gv);
                if (!ks.ciz) continue;
                const std::vector<PathCommand> cmds = e.path(ctx);
                if (sk) yaz(kalin, cmds, e.id, "kol");   // sarkan tup: dis/ic/agiz hepsi siluet
                else yaz(ks.kalin ? kalin : ince, cmds, e.id, e.kind);
                // ust dikis izi: bitirmeli kesim kenari (hem/faced), panel icine ofset
                if (e.kind == "cut" && (e.finish == "hem" || e.finish == "faced" || e.finish == "topstitch")) {
                    // kenar ortasindaki ic normal (panel merkezine dogru)
                    const std::vector<Point> pts = flatPts(cmds);
                    Point mrk{ 0, 0 }; { std::vector<Point> o = flatPts(p.outline(ctx)); for (Point q : o) { mrk.x += q.x; mrk.y += q.y; } if (!o.empty()) { mrk.x /= o.size(); mrk.y /= o.size(); } }
                    Point A = e.at(ctx, 0.45), B = e.at(ctx, 0.55);
                    Point t{ B.x - A.x, B.y - A.y }; double L = std::hypot(t.x, t.y);
                    if (L > 1e-9) {
                        Point n{ -t.y / L, t.x / L }; Point m = e.at(ctx, 0.5);
                        if ((mrk.x - m.x) * n.x + (mrk.y - m.y) * n.y < 0) { n.x = -n.x; n.y = -n.y; }
                        const double ofs = birim / 150.0;
                        std::vector<PathCommand> oc = cmds;
                        for (PathCommand& c : oc) { c.to.x += n.x * ofs; c.to.y += n.y * ofs; c.cp1.x += n.x * ofs; c.cp1.y += n.y * ofs; c.cp2.x += n.x * ofs; c.cp2.y += n.y * ofs; }
                        yaz(ust, oc, e.id, "ustdikis");
                    }
                }
            }
            // ic halka pensler (balik): tek dikey cizgi apexUst -> apexAlt, agiz kopru
            for (const IcPens& dd : p.darts) {
                const Point a = eval(dd.a, ctx), b = eval(dd.b, ctx), au = eval(dd.apexUst, ctx), aa = eval(dd.apexAlt, ctx);
                yaz(pens, { PathCommand::move(au), PathCommand::line(aa) }, dd.id, "pens");
                (void)a; (void)b;
            }
        }
    }

    auto katman = [&](const char* id, std::map<std::string, std::vector<Cizgi>>& m, double w, const char* ek) {
        s << "  <g id=\"" << id << "\" fill=\"none\" stroke=\"#111111\" stroke-width=\"" << f3(w) << "\" stroke-linejoin=\"round\" stroke-linecap=\"round\"" << ek << ">\n";
        for (const std::string& gv : gorunumSira) {
            grupAc(gv);
            for (const Cizgi& c : m[gv])
                s << "      <path data-panel=\"" << c.panel << "\" data-edge=\"" << c.edge << "\" data-tur=\"" << c.tur << "\" d=\"" << c.d << "\"/>\n";
            s << "    </g>\n";
        }
        s << "  </g>\n";
    };
    katman("outline", kalin, wOutline, "");
    katman("seams", ince, wSeam, "");
    const std::string dash = " stroke-dasharray=\"" + f3(birim / 120.0) + " " + f3(birim / 200.0) + "\"";
    katman("topstitch", ust, wTop, dash.c_str());
    katman("details", pens, wSeam, "");
    s << "</svg>\n";
    return s.str();
}

}  // namespace graf
}  // namespace stitchu
