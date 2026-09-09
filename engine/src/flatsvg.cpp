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

#include "curvefit.hpp"
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


// ---- KAVIS (A4 tur 6, 2026-09-09, Damla: "kavisli yan dikis, yumusak kum saati, hafif kavisli etek ucu").
// Croquis = giysi MANKENE GIYILMIS izdusum. Grafta iki halka arasi duz cizilen kenar (bel->gogus yan dikisi,
// kalca->bel), mankenin uzerinde iki halka ARASINDAKI kesitleri de izler: x(t) = k(t) x xBeden(y(t)), k = giysi/beden
// orani uclarda olculur ve arada dogrusal gecer (bolluk iki halka arasinda orantili). Beden silueti torso landmark'lari
// (koltukalti, gogus, gogus alti, bel, ust kalca, kalca) arasinda Catmull-Rom; disinda SABIT (kalca altinda etek
// bedeni izlemez: kalcadan etek ucuna dogru cizgi; koltukaltinin ustunde omuz dogru). Graf DEGISMEZ, kalip DEGISMEZ:
// bu yalniz croquis gorunumudur (gercek36 kalip cevre/4 duz kalir). Sonuc kubik(ler): curvefit fitCubics, tol mm.
struct BedenSilueti {
    std::vector<Point> lm;   // y artan sirada (x = kesit yarimi)
    bool bos() const { return lm.size() < 2; }
    double x(double y) const {
        if (bos()) return 0;
        if (y <= lm.front().y) return lm.front().x;
        if (y >= lm.back().y) return lm.back().x;
        std::size_t i = 0;
        while (i + 1 < lm.size() && lm[i + 1].y < y) ++i;
        const Point p1 = lm[i], p2 = lm[i + 1];
        const Point p0 = i > 0 ? lm[i - 1] : Point{ 2 * p1.x - p2.x, 2 * p1.y - p2.y };
        const Point p3 = i + 2 < lm.size() ? lm[i + 2] : Point{ 2 * p2.x - p1.x, 2 * p2.y - p1.y };
        const double t = (y - p1.y) / (p2.y - p1.y), t2 = t * t, t3 = t2 * t;
        // Catmull-Rom (x'te; y parametresi dogrusal)
        return 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
    }
};
BedenSilueti bedenSilueti(const Body& body) {
    BedenSilueti b;
    // koltukalti -> bel -> ust kalca -> kalca. Gogus/gogus alti kesitleri ALINMAZ: yan dikiste gogus kabarigi S cizgisi
    // yapiyordu (kor hakem tur 6 kusur: "yan dikis S/dalgali"); satici flat'inde yan dikis koltukaltindan bele tek icbukey yay.
    for (const char* lm : { "landmark.underarm", "landmark.waist", "landmark.highHip", "landmark.hip" })
        if (body.hasLandmark(lm)) { BodyPoint p = body.landmark(lm); if (p.x > 0 && (b.lm.empty() || p.y > b.lm.back().y)) b.lm.push_back({ p.x, p.y }); }
    return b;
}
std::vector<PathCommand> kubikler(const std::vector<Point>& pts, double tolMM) {
    std::vector<Vec2> v; v.reserve(pts.size());
    for (Point p : pts) v.push_back({ p.x, p.y });
    std::vector<PathCommand> out{ PathCommand::move(pts.front()) };
    for (const CubicSeg& c : fitCubics(v, tolMM)) out.push_back(PathCommand::curve({ c.p3.x, c.p3.y }, { c.c1.x, c.c1.y }, { c.c2.x, c.c2.y }));
    return out;
}
// Duz kenar -> bedeni izleyen kubik. Kosul: eksenli panel, kontrolsuz, iki ucu da x>0 (kat/eksen degil), dikey uzanim
// esigin ustunde ve beden silueti bu y araliginda SABIT DEGIL (yoksa dogru dogru kalir).
std::vector<PathCommand> bedeniIzle(const Edge& e, const Point& a, const Point& b, const BedenSilueti& bs, double minDyMM, double tolMM, bool& kavisli) {
    kavisli = false;
    const std::vector<PathCommand> duz{ PathCommand::move(a), PathCommand::line(b) };
    if (!e.isLine() || bs.bos()) return duz;
    if (std::fabs(b.y - a.y) < minDyMM) return duz;
    const double xa = std::fabs(a.x), xb = std::fabs(b.x);
    if (xa < 1e-6 || xb < 1e-6) return duz;
    const double sgn = a.x < 0 ? -1.0 : 1.0;
    if ((b.x < 0) != (a.x < 0)) return duz;
    const double ba = bs.x(a.y), bb = bs.x(b.y);
    if (ba <= 0 || bb <= 0) return duz;
    const double ka = xa / ba, kb = xb / bb;
    // KALCA ALTI C1 GECIS (hakem tur 6: "etek kalcada kirilarak aciliyor"): kenarin ust ucu son kesit (kalca) hizasindaysa,
    // kenar kalcadaki beden tegetiyle baslar ve D = %40 boyda dogruya yumusakca oturur: ofset(d) = (mB - mL) d (1 - d/D)^2.
    const Point& ust = a.y < b.y ? a : b; const Point& alt = a.y < b.y ? b : a;
    const double kUst = a.y < b.y ? ka : kb;
    const bool kalcaAlti = std::fabs(ust.y - bs.lm.back().y) < 2.0 && alt.y > ust.y + minDyMM;
    const double mB = kalcaAlti ? kUst * (bs.x(ust.y) - bs.x(ust.y - 5.0)) / 5.0 : 0.0;   // beden egimi dx/dy (mutlak x)
    const double mL = kalcaAlti ? (std::fabs(alt.x) - std::fabs(ust.x)) / (alt.y - ust.y) : 0.0;
    const double D = kalcaAlti ? 0.4 * (alt.y - ust.y) : 0.0;
    const int N = 32;
    std::vector<Point> pts; pts.reserve(N + 1);
    double sapma = 0;
    for (int i = 0; i <= N; ++i) {
        const double t = double(i) / N, y = a.y + t * (b.y - a.y);
        double x;
        if (kalcaAlti) {
            const double d = y - ust.y;
            const double xd = std::fabs(ust.x) + mL * d;
            const double of = d < D ? (mB - mL) * d * (1.0 - d / D) * (1.0 - d / D) : 0.0;
            x = sgn * (xd + of);
        } else {
            x = sgn * ((1 - t) * ka + t * kb) * bs.x(y);
        }
        const double xd = a.x + t * (b.x - a.x);
        sapma = std::max(sapma, std::fabs(x - xd));
        pts.push_back({ x, y });
    }
    if (sapma < tolMM) return duz;   // beden bu aralikta duz: dogru kalir (bayt-ayni kalsin)
    kavisli = true;
    return kubikler(pts, tolMM);
}
// Yatay etek ucu (cut, finish hem) -> hafif kavis: ortada (x=0) sagOverWidth x tam genislik kadar asagi sarkan parabol
// (kubik esdegeri). Kosul: eksenli panel, kontrolsuz, |dy| kucuk, bir ucu x=0'da.
std::vector<PathCommand> etekUcuKavis(const Edge& e, const Point& a, const Point& b, double sagOverWidth, bool& kavisli) {
    kavisli = false;
    const std::vector<PathCommand> duz{ PathCommand::move(a), PathCommand::line(b) };
    if (!e.isLine() || e.kind != "cut" || e.finish != "hem" || sagOverWidth <= 0) return duz;
    if (std::fabs(b.y - a.y) > 1.0) return duz;
    const bool aMerkez = std::fabs(a.x) < 1e-6, bMerkez = std::fabs(b.x) < 1e-6;
    if (aMerkez == bMerkez) return duz;
    const Point m = aMerkez ? a : b, u = aMerkez ? b : a;   // merkez, uc
    const double w = std::fabs(u.x), s = sagOverWidth * 2.0 * w;
    if (w < 1e-6 || s < 0.05) return duz;
    // merkezde yatay teget (ayna surekliligi), KOSEDE DUSEY teget: etek ucu yan dikise dik girer (kor hakem tur 7: parabolun
    // kosede egik tegeti klos etekte "disa kirilan sivri uc / kanat" yapiyordu). Kubik: P0=merkez(y+s), c1=(w/2, y+s), c2=(w, y+0.45 s), P3=uc.
    const Point P0{ m.x, u.y + s }, c1{ u.x / 2.0, u.y + s }, c2{ u.x, u.y + 0.45 * s }, P3{ u.x, u.y };
    kavisli = true;
    if (aMerkez) return { PathCommand::move(P0), PathCommand::curve(P3, c1, c2) };
    return { PathCommand::move(P3), PathCommand::curve(P0, c2, c1) };
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

    auto ctx_of = [&](const Panel& p) -> const EvalCtx& { return ctxs[p.id]; };
    const bool croquis = body.id().rfind("croquis", 0) == 0;

    // BUZGU SIKISMASI (A4 tur 6, 2026-09-09): croquis = giyilmis izdusum; buzgulu kenar (Edge.gatherRatio > 1, op gather /
    // split seamRatio) grafta ratio kat UZUNDUR (kalip icin dogru), giyilince partnerinin boyuna buzulur. Cizimde o kenarin
    // uclari grafop scaleEdges'in TERSIYLE geri alinir: kat eksenine dayanan kenar x'te 1/ratio (x=0 etrafinda), degilse uc
    // noktalarinin agirlik merkezi etrafinda 1/ratio homoteti. Komsu kenarlar ayni tepeyi kullandigi icin panel kapali kalir.
    // Kalip (gercek36) dokunulmaz. Buzgu isaretleri (kirisik cizgi) cizilmez: graf'ta yok, uydurulmaz.
    struct TepeKaydir { std::map<std::string, Point> m; };   // "x|y" -> yeni nokta
    std::map<std::string, TepeKaydir> buzgu;
    auto anahtar = [](Point q) { return f3(q.x) + "|" + f3(q.y); };
    if (croquis) {
        for (const Panel& p : g.panels) {
            if (!eksen.count(p.id)) continue;
            bool eksenVar = p.onFold;
            for (const Edge& e : p.edges) if (e.from.xSifir() && e.to.xSifir()) eksenVar = true;
            for (const Edge& e : p.edges) {
                if (!(e.gatherRatio > 1.0 + 1e-9)) continue;
                const double k = 1.0 / e.gatherRatio;
                const Point a = eval(e.from, ctx_of(p)), b = eval(e.to, ctx_of(p));
                const bool katli = eksenVar && (e.from.xSifir() || e.to.xSifir());
                const Point c{ (a.x + b.x) / 2, (a.y + b.y) / 2 };
                auto tr = [&](Point q) { return katli ? Point{ q.x * k, q.y } : Point{ c.x + (q.x - c.x) * k, c.y + (q.y - c.y) * k }; };
                buzgu[p.id].m[anahtar(a)] = tr(a);
                buzgu[p.id].m[anahtar(b)] = tr(b);
            }
        }
    }
    auto kaydir = [&](const Panel& p, Point q) -> Point {
        auto it = buzgu.find(p.id); if (it == buzgu.end()) return q;
        auto jt = it->second.m.find(anahtar(q)); return jt == it->second.m.end() ? q : jt->second;
    };
    // kenar yolunun uclarini (ve buzgulu kenarin kontrollerini) kaydirilmis tepeye tasi
    auto buzguUygula = [&](const Panel& p, const Edge& e, std::vector<PathCommand> cmds) -> std::vector<PathCommand> {
        if (!buzgu.count(p.id) || cmds.empty()) return cmds;
        const Point a = eval(e.from, ctx_of(p)), b = eval(e.to, ctx_of(p));
        const Point a2 = kaydir(p, a), b2 = kaydir(p, b);
        if (a2.x == a.x && a2.y == a.y && b2.x == b.x && b2.y == b.y) return cmds;
        // afin: a->a2, b->b2 (dogru boyunca olcek + kaydirma); kontroller ayni donusumle
        const double L2 = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
        auto tr = [&](Point q) {
            if (L2 < 1e-12) return Point{ q.x + (a2.x - a.x), q.y + (a2.y - a.y) };
            const double t = ((q.x - a.x) * (b.x - a.x) + (q.y - a.y) * (b.y - a.y)) / L2;   // dogru boyunca oran
            const Point onLine{ a.x + t * (b.x - a.x), a.y + t * (b.y - a.y) };
            const Point off{ q.x - onLine.x, q.y - onLine.y };                                 // dogruya dik sapma korunur
            return Point{ a2.x + t * (b2.x - a2.x) + off.x, a2.y + t * (b2.y - a2.y) + off.y };
        };
        for (PathCommand& c : cmds) { c.to = tr(c.to); if (c.type == CmdType::Curve) { c.cp1 = tr(c.cp1); c.cp2 = tr(c.cp2); } }
        return cmds;
    };
    // KAVIS (yalniz croquis): beden silueti + eksenli panel kenar yolu (duz -> bedeni izleyen kubik / etek ucu kavisi)
    const BedenSilueti bs = croquis && opts.kavis ? bedenSilueti(body) : BedenSilueti{};
    // EKSEN KIRPMASI (A4 tur 6, pantolon tabani): eksenli panelin x<0'a gecen noktalari (ag uzantisi) on izdusumde bacagin
    // ARKASINDA kalir; croquis'te eksene (x=0) kirpilir. Giysi dali degil, izdusum kurali; elbise panellerinde x<0 nokta yok.
    auto eksenKirp = [&](std::vector<PathCommand> c) {
        if (!croquis) return c;
        for (PathCommand& k : c) { if (k.to.x < 0) k.to.x = 0; if (k.type == CmdType::Curve) { if (k.cp1.x < 0) k.cp1.x = 0; if (k.cp2.x < 0) k.cp2.x = 0; } }
        return c;
    };
    auto kenarYolu = [&](const Panel& p, const Edge& e) -> std::vector<PathCommand> {
        if (!croquis || !opts.kavis || !e.isLine()) return eksenKirp(buzguUygula(p, e, e.path(ctx_of(p))));
        // duz kenar: uclar buzgu kaydirmasi UYGULANMIS halleriyle (kaydirilmis uc + beden orani; aksi halde buzgulu uc 1.25x'te
        // hesaplanip sonra geri cekiliyordu, yan kenar disari bombeleniyordu — hakem tur 6 "bant yan tasmasi")
        const Point a = kaydir(p, eval(e.from, ctx_of(p))), b = kaydir(p, eval(e.to, ctx_of(p)));
        bool k = false;
        std::vector<PathCommand> c = etekUcuKavis(e, a, b, opts.etekUcuSagOverWidth, k);
        if (!k) c = bedeniIzle(e, a, b, bs, opts.kavisMinDyMM, opts.kavisTolMM, k);
        return eksenKirp(c);
    };

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
        // croquis (manken): panel genisligi zaten izdusum (graf.cpp eval ringQuarter) -> tup capi = panel/2;
        // gercek beden: panel = duz serilmis cevre -> cap = cevre/pi
        const double bol = body.id().rfind("croquis", 0) == 0 ? 2.0 : kPi;   // tup capi boleni; poz olcegi de AYNI bolen (hakem tur 6: agiz tupten uzundu, "L kancasi")
        const double wB = (xcMax - xcMin) / bol;
        for (auto& kv : partnerPts) {
            Point S = kv.second.front(), U = kv.second.front();
            for (Point q : kv.second) { if (q.y < S.y) S = q; if (q.y > U.y) U = q; }
            Sarkma sk;
            // M(x,y) = U + (y - yBic) d + ((x - xcMin)/pi) n
            sk.poz.a = nKol.x / bol; sk.poz.b = dKol.x; sk.poz.c = nKol.y / bol; sk.poz.d = dKol.y;
            sk.poz.tx = U.x - xcMin * nKol.x / bol - yBic * dKol.x;
            sk.poz.ty = U.y - xcMin * nKol.y / bol - yBic * dKol.y;
            const Point O{ U.x + wB * nKol.x, U.y + wB * nKol.y };
            // KAPAK BASI (A4 tur 8): omuz ucundan DISA teget cikar, tup ekseni boyunca asagi donup O'ya iner (disbukey yay).
            // Eski kurulus disa uzanim (an) ~0 ya da negatifken duz diyagonal cikiyordu (kor hakem tur 7: "kol omuz uzantisi").
            const double L = std::hypot(O.x - S.x, O.y - S.y);
            const Point c1{ S.x + 0.55 * L * nKol.x, S.y + 0.55 * L * nKol.y };
            const Point c2{ O.x - 0.55 * L * dKol.x, O.y - 0.55 * L * dKol.y };
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
            if (eksen.count(p.id)) { Poz z; for (const Edge& e : p.edges) growCmds(r, kenarYolu(p, e), z, ilk); }
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
      << " data-panel=\"" << yerlesen << "\" data-gorunum=\"" << gorunumSira.size() << "\""
      << " data-kavis=\"" << (croquis && opts.kavis ? "beden" : "yok") << "\"";
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
                        const Point a = kaydir(p, eval(e.from, ctx)), apex = eval(e.to, ctx), b = kaydir(p, eval(e2.to, ctx));
                        // PENS = V (iki bacak, ince): satici flat'lerinde pens agizdan apekse iki bacakli okunur; tek cizgi "pili"
                        // okunuyordu (kor hakem tur 6 + tur 7, ayni kusur iki kez).
                        yaz(pens, { PathCommand::move(a), PathCommand::line(apex), PathCommand::line(b) }, e.id, "pens");
                        // kopru: komsu kenarin sinifinda
                        const KenarSinif ks = i > 0 ? sinifla(p, p.edges[i - 1], gv) : KenarSinif{};
                        yaz(ks.kalin ? kalin : ince, { PathCommand::move(a), PathCommand::line(b) }, e.id, "pens_agzi");
                        ++i;
                    }
                    continue;
                }
                const KenarSinif ks = sinifla(p, e, gv);
                if (!ks.ciz) continue;
                const std::vector<PathCommand> cmds = sk ? e.path(ctx) : kenarYolu(p, e);
                if (sk) yaz(kalin, cmds, e.id, "kol");   // sarkan tup: dis/ic/agiz hepsi siluet
                else yaz(ks.kalin ? kalin : ince, cmds, e.id, e.kind);
                // ust dikis izi: bitirmeli kesim kenari (hem/faced), panel icine ofset
                if (e.kind == "cut" && (e.finish == "hem" || e.finish == "faced" || e.finish == "topstitch")) {
                    // kenar ortasindaki ic normal (panel merkezine dogru)
                    const std::vector<Point> pts = flatPts(cmds);
                    Point mrk{ 0, 0 }; { std::vector<Point> o = flatPts(p.outline(ctx)); for (Point q : o) { mrk.x += q.x; mrk.y += q.y; } if (!o.empty()) { mrk.x /= o.size(); mrk.y /= o.size(); } }
                    // Kenar yolu (kavisli olabilir) yay uzunluguyla orneklenir; her noktada yerel normal boyunca ic ofset; iki uc
                    // %5 kirpilir ki iz kose disina tasmasin (kontrol noktasi otelemesi omuz ucunda/etek kosesinde disari cikiyordu).
                    if (pts.size() >= 2) {
                        std::vector<double> sArc(pts.size(), 0.0);
                        for (std::size_t i2 = 1; i2 < pts.size(); ++i2) sArc[i2] = sArc[i2 - 1] + std::hypot(pts[i2].x - pts[i2 - 1].x, pts[i2].y - pts[i2 - 1].y);
                        const double Ltop = sArc.back();
                        if (Ltop > 1e-6) {
                            auto at = [&](double sd) -> Point {
                                std::size_t i2 = 1; while (i2 + 1 < pts.size() && sArc[i2] < sd) ++i2;
                                const double seg = sArc[i2] - sArc[i2 - 1]; const double u = seg > 1e-12 ? (sd - sArc[i2 - 1]) / seg : 0.0;
                                return { pts[i2 - 1].x + u * (pts[i2].x - pts[i2 - 1].x), pts[i2 - 1].y + u * (pts[i2].y - pts[i2 - 1].y) };
                            };
                            // ic yon: orta noktadaki normalin panel merkezine bakan tarafi
                            const Point m0 = at(0.49 * Ltop), m1 = at(0.51 * Ltop);
                            Point tm{ m1.x - m0.x, m1.y - m0.y }; const double Lm = std::hypot(tm.x, tm.y);
                            if (Lm > 1e-9) {
                                double yon = 1.0; { const Point nm{ -tm.y / Lm, tm.x / Lm }; const Point m = at(0.5 * Ltop); if ((mrk.x - m.x) * nm.x + (mrk.y - m.y) * nm.y < 0) yon = -1.0; }
                                const double ofs = birim / 150.0;
                                const int M = 24; std::vector<PathCommand> oc;
                                for (int k2 = 0; k2 <= M; ++k2) {
                                    const double sd = (0.05 + 0.90 * double(k2) / M) * Ltop;
                                    const Point q0 = at(std::max(0.0, sd - 0.5)), q1 = at(std::min(Ltop, sd + 0.5)), q = at(sd);
                                    Point tq{ q1.x - q0.x, q1.y - q0.y }; const double Lq = std::hypot(tq.x, tq.y);
                                    if (Lq < 1e-9) continue;
                                    const Point nq{ -tq.y / Lq * yon, tq.x / Lq * yon };
                                    const Point o{ q.x + nq.x * ofs, q.y + nq.y * ofs };
                                    oc.push_back(oc.empty() ? PathCommand::move(o) : PathCommand::line(o));
                                }
                                if (oc.size() >= 2) yaz(ust, oc, e.id, "ustdikis");
                            }
                        }
                    }
                }
            }
            // ic halka pensler (balik): tek dikey cizgi apexUst -> apexAlt, agiz kopru
            for (const IcPens& dd : p.darts) {   // balik pensi: ELMAS (ust apeks -> a -> alt apeks -> b), satici flat dili
                const Point a = eval(dd.a, ctx), b = eval(dd.b, ctx), au = eval(dd.apexUst, ctx), aa = eval(dd.apexAlt, ctx);
                yaz(pens, { PathCommand::move(au), PathCommand::line(a), PathCommand::line(aa), PathCommand::line(b), PathCommand::close() }, dd.id, "pens");
            }
        }
    }

    // KAPAMA SEMBOLLERI (hakem tur 6: "hicbir arkada fermuar/kapama yok"): closure tasiyan dikisin a zinciri boyunca
    // fromFraction..toFraction araliginda — fermuar: zincire paralel iki kesikli cizgi (+-4 mm, ayna ile) ve ustte cekecek karesi;
    // dugme: esit aralikli daireler (r 3.5 mm, 60 mm'de bir, en az 2). Zincir eksenli panelde ciziliyorsa (eksen gorunumu).
    for (const Seam& sm : g.seams) {
        if (sm.closure.type != "zipper" && sm.closure.type != "buttons") continue;
        struct Parca { const Panel* p; const Edge* e; double L; };
        std::vector<Parca> zincir; double toplam = 0; std::string gv;
        for (const EdgeRef& r : sm.a) {
            const Panel* pp = g.panel(r.panel); const Edge* ee = pp ? pp->edge(r.edge) : nullptr;
            if (!pp || !ee || !eksen.count(pp->id)) { zincir.clear(); break; }
            if (gv.empty()) gv = eksen[pp->id];
            const double L = ee->length(ctxs[pp->id]); zincir.push_back({ pp, ee, L }); toplam += L;
        }
        if (zincir.empty() || toplam < 1e-6) continue;
        auto noktaVeNormal = [&](double f, Point& q, Point& n) {   // zincir kesri f (0..1) -> nokta + birim normal (yerel, panel koordinati)
            double sd = f * toplam;
            for (const Parca& pc : zincir) {
                if (sd > pc.L && &pc != &zincir.back()) { sd -= pc.L; continue; }
                const double t = pc.L > 1e-9 ? std::min(1.0, std::max(0.0, sd / pc.L)) : 0.0;
                const EvalCtx& c = ctxs[pc.p->id];
                q = pc.e->at(c, t);
                const Point q0 = pc.e->at(c, std::max(0.0, t - 0.02)), q1 = pc.e->at(c, std::min(1.0, t + 0.02));
                const double L2 = std::hypot(q1.x - q0.x, q1.y - q0.y);
                n = L2 > 1e-9 ? Point{ -(q1.y - q0.y) / L2, (q1.x - q0.x) / L2 } : Point{ 1, 0 };
                return;
            }
        };
        const double f0 = std::min(sm.closure.fromFraction, sm.closure.toFraction), f1 = std::max(sm.closure.fromFraction, sm.closure.toFraction);
        if (sm.closure.type == "buttons") {
            const int nB = std::max(2, int(std::lround((f1 - f0) * toplam / 60.0)));
            const double r = 3.5;
            for (int i = 0; i < nB; ++i) {
                Point q, n; noktaVeNormal(f0 + (f1 - f0) * (nB == 1 ? 0.5 : double(i) / (nB - 1)), q, n);
                // daire: dort kubik yay (kappa)
                const double k = 0.5523;
                std::vector<PathCommand> c{ PathCommand::move({ q.x + r, q.y }),
                    PathCommand::curve({ q.x, q.y + r }, { q.x + r, q.y + k * r }, { q.x + k * r, q.y + r }),
                    PathCommand::curve({ q.x - r, q.y }, { q.x - k * r, q.y + r }, { q.x - r, q.y + k * r }),
                    PathCommand::curve({ q.x, q.y - r }, { q.x - r, q.y - k * r }, { q.x - k * r, q.y - r }),
                    PathCommand::curve({ q.x + r, q.y }, { q.x + k * r, q.y - r }, { q.x + r, q.y - k * r }) };
                Poz z; pens[gv].push_back({ pathD(c, z), zincir.front().p->id, sm.id, "dugme" });
            }
        } else {
            const double ofs = 4.0; const int M = 24;
            std::vector<PathCommand> c;
            for (int i = 0; i <= M; ++i) { Point q, n; noktaVeNormal(f0 + (f1 - f0) * double(i) / M, q, n); const Point o{ q.x + n.x * ofs, q.y + n.y * ofs }; c.push_back(c.empty() ? PathCommand::move(o) : PathCommand::line(o)); }
            for (int yan = 0; yan < 2; ++yan) { Poz z; z.ayna = yan == 1; ust[gv].push_back({ pathD(c, z), zincir.front().p->id, sm.id, "fermuar" }); }
            Point q, n; noktaVeNormal(f0, q, n);   // cekecek: 5 x 8 mm kare, zincirin ust ucunda
            const Point t{ -n.y, n.x };
            std::vector<PathCommand> ck{ PathCommand::move({ q.x - n.x * 2.5, q.y - n.y * 2.5 }), PathCommand::line({ q.x + n.x * 2.5, q.y + n.y * 2.5 }),
                PathCommand::line({ q.x + n.x * 2.5 + t.x * 8, q.y + n.y * 2.5 + t.y * 8 }), PathCommand::line({ q.x - n.x * 2.5 + t.x * 8, q.y - n.y * 2.5 + t.y * 8 }), PathCommand::close() };
            Poz z; pens[gv].push_back({ pathD(ck, z), zincir.front().p->id, sm.id, "fermuar_cekecek" });
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
