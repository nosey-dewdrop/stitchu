// grafdogrula.cpp — GRAF DOGRULAYICI + SANAL DIKIS. Bkz. grafdogrula.hpp.
#include "grafdogrula.hpp"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <limits>
#include <map>
#include <set>
#include <stdexcept>

namespace stitchu {
namespace graf {

Tolerans Tolerans::fromContract(const JVal& contract) {
    Tolerans t;
    const double nan = std::numeric_limits<double>::quiet_NaN();
    t.dikisUzunlukMM = t.centikMM = t.halkaKapanmaMM = t.pensBacakMM = t.ratioMin = t.ratioMax = nan;
    if (const JVal* tl = contract.get("toleranslar")) {
        auto rd = [&](const char* k, double& out) { const JVal* v = tl->get(k); if (v) { const JVal* d = v->get("deger"); if (d && d->isNum()) out = d->n; } };
        rd("dikisUzunlukMM", t.dikisUzunlukMM); rd("centikMM", t.centikMM); rd("halkaKapanmaMM", t.halkaKapanmaMM); rd("pensBacakMM", t.pensBacakMM);
    }
    if (const JVal* ar = contract.get("araliklar")) {
        const JVal* r = ar->get("ratio");
        const JVal* a = r ? r->get("aralik") : nullptr;
        if (a && a->isArr() && a->a.size() == 2) { t.ratioMin = a->a[0].n; t.ratioMax = a->a[1].n; }
    }
    t.dolu = !std::isnan(t.dikisUzunlukMM) && !std::isnan(t.centikMM) && !std::isnan(t.halkaKapanmaMM) && !std::isnan(t.pensBacakMM) &&
             !std::isnan(t.ratioMin) && !std::isnan(t.ratioMax);
    return t;
}

int DogrulamaRaporu::kirmizi() const { int n = 0; for (const Hukum& h : hukumler) if (!h.bilgi && !h.gecti) ++n; return n; }

namespace {
std::string f2(double v) { char b[48]; std::snprintf(b, sizeof b, "%.2f", v); return b; }
std::string f4(double v) { char b[48]; std::snprintf(b, sizeof b, "%.4f", v); return b; }

// Kenar konturunu noktalara ac (24 adim, motorun pathLength adimi)
std::vector<Point> flattenEdge(const Edge& e, const EvalCtx& ctx) {
    const Point a = eval(e.from, ctx), b = eval(e.to, ctx);
    if (e.isLine()) return {a, b};
    return flattenCubic(a, b, eval(e.control[0], ctx), eval(e.control[1], ctx), 24);
}
struct Chain {   // bir dikis tarafi: kenarlar, kumulatif uzunluklar, dunya noktalari (poz uygulanmamis)
    std::vector<EdgeRef> refs;
    std::vector<std::vector<Point>> pts;   // her kenar icin duzlestirilmis noktalar (yerel)
    std::vector<double> cum;               // cum[i] = i. kenarin baslangicinin yay konumu
    double total = 0;
};
Chain chainOf(const Garment& g, const std::vector<EdgeRef>& refs, const Body& body, bool onArkaEsit) {
    Chain c; c.refs = refs;
    for (const EdgeRef& r : refs) {
        const Panel* p = g.panel(r.panel); const Edge* e = g.edge(r);
        if (!p || !e) throw std::runtime_error("chain: referans cozulmedi " + r.panel + "/" + r.edge);
        const std::vector<Point> pts = flattenEdge(*e, p->ctxFor(body, onArkaEsit));
        double L = 0; for (size_t i = 1; i < pts.size(); ++i) L += distance(pts[i - 1], pts[i]);
        c.cum.push_back(c.total); c.pts.push_back(pts); c.total += L;
    }
    return c;
}
// Zincir uzerinde yay konumu s'deki nokta (yerel, kenarin panel koordinatinda) + hangi kenar
Point chainPointAt(const Chain& c, double s, size_t* edgeIdx) {
    if (c.pts.empty()) throw std::runtime_error("chain bos");
    s = std::max(0.0, std::min(s, c.total));
    for (size_t i = 0; i < c.pts.size(); ++i) {
        const double end = (i + 1 < c.pts.size()) ? c.cum[i + 1] : c.total;
        if (s <= end + 1e-9 || i + 1 == c.pts.size()) {
            double rem = s - c.cum[i];
            const std::vector<Point>& P = c.pts[i];
            for (size_t k = 1; k < P.size(); ++k) {
                const double d = distance(P[k - 1], P[k]);
                if (rem <= d || k + 1 == P.size()) {
                    const double t = d > 0 ? std::max(0.0, std::min(1.0, rem / d)) : 0.0;
                    if (edgeIdx) *edgeIdx = i;
                    return {P[k - 1].x + t * (P[k].x - P[k - 1].x), P[k - 1].y + t * (P[k].y - P[k - 1].y)};
                }
                rem -= d;
            }
        }
    }
    if (edgeIdx) *edgeIdx = c.pts.size() - 1;
    return c.pts.back().back();
}
struct Pose { double c = 1, s = 0, tx = 0, ty = 0; bool set = false; std::string by; };
Point apply(const Pose& p, Point q) { return {p.c * q.x - p.s * q.y + p.tx, p.s * q.x + p.c * q.y + p.ty}; }
// q0->A, yon (q1-q0) -> (B-A): rijit (olceksiz)
Pose rigidFrom(Point q0, Point q1, Point A, Point B) {
    Pose p; p.set = true;
    const double a1 = std::atan2(q1.y - q0.y, q1.x - q0.x), a2 = std::atan2(B.y - A.y, B.x - A.x);
    const double th = a2 - a1; p.c = std::cos(th); p.s = std::sin(th);
    const Point r = apply(Pose{p.c, p.s, 0, 0, true, ""}, q0);
    p.tx = A.x - r.x; p.ty = A.y - r.y;
    return p;
}

// dogru parcasi kesisimi (uc noktalari haric, gercek kesisme)
bool segIntersect(Point a, Point b, Point c, Point d) {
    auto cross = [](Point o, Point p, Point q) { return (p.x - o.x) * (q.y - o.y) - (p.y - o.y) * (q.x - o.x); };
    const double d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
    return ((d1 > 1e-9 && d2 < -1e-9) || (d1 < -1e-9 && d2 > 1e-9)) && ((d3 > 1e-9 && d4 < -1e-9) || (d3 < -1e-9 && d4 > 1e-9));
}
std::vector<Point> flattenOutline(const std::vector<PathCommand>& cmds, int steps) {
    std::vector<Point> out; Point cur{}, start{};
    for (const PathCommand& c : cmds) {
        switch (c.type) {
            case CmdType::Move: cur = start = c.to; out.push_back(cur); break;
            case CmdType::Line: cur = c.to; out.push_back(cur); break;
            case CmdType::Curve: { const std::vector<Point> f = flattenCubic(cur, c.to, c.cp1, c.cp2, steps); out.insert(out.end(), f.begin() + 1, f.end()); cur = c.to; break; }
            case CmdType::Close: break;
        }
    }
    if (!out.empty() && distance(out.front(), out.back()) < 1e-9) out.pop_back();
    return out;
}
} // namespace

bool outlineSelfIntersects(const std::vector<PathCommand>& outline, std::string* where) {
    // 16 adim: motorun kendini-kesme konvansiyonu (docs/ARCHITECTURE.md §1)
    const std::vector<Point> P = flattenOutline(outline, 16);
    const size_t n = P.size();
    if (n < 4) return false;
    for (size_t i = 0; i < n; ++i) {
        for (size_t j = i + 2; j < n; ++j) {
            if (i == 0 && j == n - 1) continue;   // komsu (kapanis)
            if (segIntersect(P[i], P[(i + 1) % n], P[j], P[(j + 1) % n])) {
                if (where) *where = "parca " + std::to_string(i) + " x parca " + std::to_string(j);
                return true;
            }
        }
    }
    return false;
}

double chainLength(const Garment& g, const std::vector<EdgeRef>& refs, const Body& body, bool onArkaEsit) {
    return chainOf(g, refs, body, onArkaEsit).total;
}

DogrulamaRaporu dogrula(const Garment& g, const Body& body, const JVal& contract, bool onArkaEsit) {
    DogrulamaRaporu R; R.grafId = g.id; R.bodyId = body.id(); R.onArkaEsit = onArkaEsit;
    auto H = [&](const std::string& k, const std::string& hedef, const std::string& deger, bool gecti, bool bilgi = false) {
        R.hukumler.push_back({k, hedef, deger, gecti, bilgi});
    };
    const Tolerans tol = Tolerans::fromContract(contract);
    if (!tol.dolu) { H("tolerans", "contract", "toleranslar/araliklar eksik ya da NaN — dogrulayici reddetti", false); return R; }
    H("tolerans", "contract", "dikis " + f2(tol.dikisUzunlukMM) + " · centik " + f2(tol.centikMM) + " · halka " + f2(tol.halkaKapanmaMM) + " · pens " + f2(tol.pensBacakMM) + " mm; ratio [" + f2(tol.ratioMin) + ", " + f2(tol.ratioMax) + "]", true, true);

    // ---- sema
    { std::vector<std::string> hs; const bool ok = semaDogrula(toJSON(g), contract, hs);
      H("sema", g.id, ok ? "sozlesmeyle uyumlu" : (std::to_string(hs.size()) + " hata: " + hs.front()), ok); }

    // ---- panel_kapali + referans
    std::set<std::string> pids;
    for (const Panel& p : g.panels) {
        std::string why; const bool ok = p.closed(&why);
        H("panel_kapali", p.id, ok ? (std::to_string(p.edges.size()) + " kenar, halka kapali") : why, ok);
        if (!pids.insert(p.id).second) H("referans", p.id, "tekrar eden panel id", false);
    }
    auto refsOk = [&](const std::vector<EdgeRef>& refs, const std::string& hedef) {
        for (const EdgeRef& r : refs) if (!g.edge(r)) { H("referans", hedef, "cozulmeyen referans " + r.panel + "/" + r.edge, false); return false; }
        return true;
    };
    bool refsAllOk = true;
    for (const Seam& s : g.seams) { if (!refsOk(s.a, "seam " + s.id) || !refsOk(s.b, "seam " + s.id)) refsAllOk = false; }
    for (const Ring& r : g.rings) if (!refsOk(r.edges, "ring " + r.id)) refsAllOk = false;
    if (!refsAllOk) return R;   // gerisi referanssiz olculemez
    H("referans", g.id, std::to_string(g.seams.size()) + " dikis, " + std::to_string(g.rings.size()) + " halka; tum referanslar cozuldu", true);

    // ---- kenar_turu
    std::map<std::string, std::vector<std::string>> inSeam;   // "panel/edge" -> seam ids
    for (const Seam& s : g.seams) { for (const EdgeRef& r : s.a) inSeam[r.panel + "/" + r.edge].push_back(s.id); for (const EdgeRef& r : s.b) inSeam[r.panel + "/" + r.edge].push_back(s.id); }
    const JVal* finishEnum = contract.get("enumlar") ? contract.get("enumlar")->get("finish") : nullptr;
    for (const Panel& p : g.panels) {
        const EvalCtx ctx = p.ctxFor(body, onArkaEsit);
        for (size_t i = 0; i < p.edges.size(); ++i) {
            const Edge& e = p.edges[i]; const std::string key = p.id + "/" + e.id;
            const size_t nS = inSeam.count(key) ? inSeam[key].size() : 0;
            if (e.kind == "seam") {
                H("kenar_turu", key, nS ? ("seam kenari, dikis: " + inSeam[key][0]) : "seam kenari HIC BIR dikiste degil", nS >= 1);
            } else if (e.kind == "cut") {
                bool fin = !e.finish.empty();
                if (fin && finishEnum) { fin = false; for (const JVal& v : finishEnum->a) if (v.isStr() && v.s == e.finish) fin = true; }
                const bool ok = nS == 0 && fin;
                H("kenar_turu", key, ok ? ("cut kenari, bitirme: " + e.finish) : (nS ? "cut kenari bir dikiste (" + inSeam[key][0] + ")" : "cut kenarinin finish gerekcesi yok ya da enum disi '" + e.finish + "'"), ok);
            } else if (e.kind == "fold") {
                const bool ok = p.onFold && e.from.xSifir() && e.to.xSifir() && e.control.empty() && nS == 0;
                H("kenar_turu", key, ok ? "kat kenari x=0, panel onFold" : (!p.onFold ? "fold kenari ama panel onFold=false" : "fold kenari x=0'da degil / egri / dikiste"), ok);
            } else if (e.kind == "dartLeg") {
                const Edge& n = p.edges[(i + 1) % p.edges.size()];
                if (n.kind == "dartLeg") {
                    const double l1 = e.length(ctx), l2 = n.length(ctx);
                    const bool apexOk = e.to == n.from;
                    const bool ok = apexOk && std::fabs(l1 - l2) <= tol.pensBacakMM && nS == 0;
                    H("kenar_turu", key + "+" + n.id, ok ? ("pens bacaklari " + f2(l1) + " / " + f2(l2) + " mm, ortak apeks") : (apexOk ? ("bacak farki " + f2(std::fabs(l1 - l2)) + " > " + f2(tol.pensBacakMM)) : "iki bacagin apeksi ortak degil"), ok);
                    ++i;   // cift islendi
                } else {
                    const Edge& pv = p.edges[(i + p.edges.size() - 1) % p.edges.size()];
                    if (pv.kind != "dartLeg") H("kenar_turu", key, "tek dartLeg, cifti yok", false);
                }
            } else {
                H("kenar_turu", key, "bilinmeyen kind '" + e.kind + "'", false);
            }
        }
    }

    // ---- kendini_kesme + alan/cevre
    std::map<std::string, Pose> poses;
    for (const Panel& p : g.panels) {
        const EvalCtx ctx = p.ctxFor(body, onArkaEsit);
        std::string where; bool si = false, evalOk = true; std::vector<PathCommand> ol;
        try { ol = p.outline(ctx); si = outlineSelfIntersects(ol, &where); } catch (const std::exception& ex) { evalOk = false; where = ex.what(); }
        H("kendini_kesme", p.id, evalOk ? (si ? ("kontur kendini kesiyor: " + where) : "kontur temiz") : ("degerlenemedi: " + where), evalOk && !si);
        PanelPoz pz; pz.panel = p.id;
        if (evalOk) {
            const std::vector<Point> P = flattenOutline(ol, 24);
            double A = 0, L = 0;
            for (size_t i = 0; i < P.size(); ++i) { const Point& a = P[i]; const Point& b = P[(i + 1) % P.size()]; A += a.x * b.y - b.x * a.y; L += distance(a, b); }
            pz.alanMM2 = std::fabs(A) / 2.0; pz.cevreMM = L;
        }
        R.pozlar.push_back(pz);
    }

    // ---- dikis_uzunluk + centik
    std::map<std::string, double> seamArtik;
    for (const Seam& s : g.seams) {
        DikisSatir d; d.seam = s.id;
        Chain ca, cb;
        try { ca = chainOf(g, s.a, body, onArkaEsit); cb = chainOf(g, s.b, body, onArkaEsit); }
        catch (const std::exception& ex) { H("dikis_uzunluk", s.id, std::string("degerlenemedi: ") + ex.what(), false); continue; }
        d.lenA = ca.total; d.lenB = cb.total; d.hedefA = s.ratio * cb.total + s.easeMM; d.artikMM = ca.total - d.hedefA;
        const bool ratioOk = s.ratio >= tol.ratioMin && s.ratio <= tol.ratioMax;
        d.gecti = ratioOk && std::fabs(d.artikMM) <= tol.dikisUzunlukMM;
        seamArtik[s.id] = std::fabs(d.artikMM);
        H("dikis_uzunluk", s.id, "a " + f2(d.lenA) + " mm, hedef " + f2(d.hedefA) + " (ratio " + f4(s.ratio) + " x b " + f2(d.lenB) + " + ease " + f2(s.easeMM) + "), artik " + f2(d.artikMM) + " mm" + (ratioOk ? "" : " — ratio aralik disi"), d.gecti);
        // uc boslugu (bilgi): b'yi a'nin basina rijit hizala, obur uc farki
        if (!ca.pts.empty() && !cb.pts.empty()) {
            const Point A0 = ca.pts.front().front(), A1 = ca.pts.back().back();
            const Point B0 = cb.pts.front().front(), B1 = cb.pts.back().back();
            const double chordA = distance(A0, A1), chordB = distance(B0, B1);
            d.ucBoslukMM = std::fabs(chordA - chordB * s.ratio);
        }
        // centikler
        for (double f : s.notchFractions) {
            double worst = 0; bool okN = f > 0.0 && f < 1.0;
            for (int side = 0; side < 2 && okN; ++side) {
                const Chain& c = side == 0 ? ca : cb; const double target = f * c.total;
                double best = std::numeric_limits<double>::infinity();
                for (size_t i = 0; i < c.refs.size(); ++i) {
                    const Edge* e = g.edge(c.refs[i]);
                    const double L = (i + 1 < c.refs.size() ? c.cum[i + 1] : c.total) - c.cum[i];
                    for (double nf : e->notches) best = std::min(best, std::fabs(c.cum[i] + nf * L - target));
                }
                worst = std::max(worst, best);
            }
            if (!(worst <= tol.centikMM)) okN = false;
            d.centikArtikMM.push_back(worst);
            H("centik", s.id + " @" + f4(f), std::isinf(worst) ? "bir tarafta panel centigi yok" : ("iki tarafta en kotu sapma " + f2(worst) + " mm"), okN);
        }
        R.dikisler.push_back(d);
    }

    // ---- sanal dikis: rijit yerlestirme (bilgi)
    if (!g.panels.empty()) {
        poses[g.panels[0].id] = Pose{1, 0, 0, 0, true, "kok"};
        bool progress = true;
        while (progress) {
            progress = false;
            for (const Seam& s : g.seams) {
                for (int dir = 0; dir < 2; ++dir) {
                    const std::vector<EdgeRef>& X = dir == 0 ? s.a : s.b;   // yerlesik taraf
                    const std::vector<EdgeRef>& Y = dir == 0 ? s.b : s.a;   // yerlestirilecek
                    bool xPlaced = !X.empty(); for (const EdgeRef& r : X) if (!poses[r.panel].set) xPlaced = false;
                    if (!xPlaced) continue;
                    Chain cx, cy;
                    try { cx = chainOf(g, X, body, onArkaEsit); cy = chainOf(g, Y, body, onArkaEsit); } catch (...) { continue; }
                    if (cx.total <= 0 || cy.total <= 0) continue;
                    for (size_t i = 0; i < Y.size(); ++i) {
                        if (poses[Y[i].panel].set) continue;
                        const double s0 = cy.cum[i], s1 = (i + 1 < Y.size() ? cy.cum[i + 1] : cy.total);
                        const double k = cx.total / cy.total;   // oran: b tarafi a'ya yayilir
                        // karsi zincirde ters yon (iki parca kitap gibi acilir)
                        size_t ex0 = 0, ex1 = 0;
                        const Point T0l = chainPointAt(cx, cx.total - s0 * k, &ex0), T1l = chainPointAt(cx, cx.total - s1 * k, &ex1);
                        const Point T0 = apply(poses[X[ex0].panel], T0l), T1 = apply(poses[X[ex1].panel], T1l);
                        const Point q0 = cy.pts[i].front(), q1 = cy.pts[i].back();
                        Pose pz = rigidFrom(q0, q1, T0, T1); pz.by = s.id;
                        poses[Y[i].panel] = pz; progress = true;
                    }
                }
            }
        }
        for (PanelPoz& pz : R.pozlar) {
            const Pose& p = poses[pz.panel];
            pz.yerlesti = p.set; pz.cosT = p.c; pz.sinT = p.s; pz.tx = p.tx; pz.ty = p.ty; pz.yerlestiren = p.by;
            H("yerlestirme", pz.panel, p.set ? ("rijit poz (" + p.by + ") theta " + f2(std::atan2(p.s, p.c) * 180.0 / M_PI) + " deg, t (" + f2(p.tx) + ", " + f2(p.ty) + "); alan " + f2(pz.alanMM2 / 100.0) + " cm2, cevre " + f2(pz.cevreMM) + " mm") : "dikis agacina bagli degil (kopuk parca)", p.set, true);
        }
    }

    // ---- halka_kapanma (sanal dikis kavsaklari)
    for (const Ring& ring : g.rings) {
        HalkaSatir hs; hs.ring = ring.id; hs.role = ring.role;
        if (ring.edges.empty()) { H("halka_kapanma", ring.id, "halkada kenar yok", false); R.halkalar.push_back(hs); continue; }
        try { hs.toplamMM = chainLength(g, ring.edges, body, onArkaEsit); } catch (const std::exception& ex) { H("halka_kapanma", ring.id, std::string("degerlenemedi: ") + ex.what(), false); R.halkalar.push_back(hs); continue; }
        const size_t n = ring.edges.size();
        double worst = 0; bool broken = false; std::string desc;
        // Kavsak: ardisik iki halka kenarinin BIRER ucu ayni yerde bulusur. Halka yuruyusu kenarin
        // kendi yonuyle ters de olabilir; bu yuzden dort uc kombinasyonu denenir ve bir onceki
        // kavsakta kullanilan uc (giris) disindaki uc (cikis) tercih edilir.
        auto identify = [&](const EdgeRef& ri, const RefPoint& A, const EdgeRef& rj, const RefPoint& B, double& gap) -> std::string {
            gap = 0.0;
            if (ri.panel == rj.panel && A == B) return "kose";
            for (const Seam& s : g.seams) {
                for (int dir = 0; dir < 2; ++dir) {
                    const std::vector<EdgeRef>& X = dir == 0 ? s.a : s.b; const std::vector<EdgeRef>& Y = dir == 0 ? s.b : s.a;
                    bool xi = false, yj = false;
                    for (const EdgeRef& r : X) { const Edge* e = g.edge(r); if (r.panel == ri.panel && (e->from == A || e->to == A)) xi = true; }
                    for (const EdgeRef& r : Y) { const Edge* e = g.edge(r); if (r.panel == rj.panel && (e->from == B || e->to == B)) yj = true; }
                    if (xi && yj) { gap = seamArtik.count(s.id) ? seamArtik[s.id] : 0.0; return "dikis " + s.id; }
                }
            }
            const Panel* P = g.panel(ri.panel); const Panel* Q = g.panel(rj.panel);
            if (P->onFold && Q->onFold && A.xSifir() && B.xSifir()) return "kat aynasi";
            return "";
        };
        // Yuruyus: her kenara bir uctan girilir, OBUR uctan cikilir (ayni ucu iki kez kullanmak halkayi
        // sahte kapatir). Ilk kenarin cikis ucu bilinmez: iki aday yuruyus denenir, kapanan alinir.
        auto walk = [&](int startExit, double& worstOut, std::string& descOut, std::string& worstJunction) -> bool {
            worstOut = 0; descOut.clear(); worstJunction.clear();
            int exitEnd = startExit; bool okAll = true; int entry0 = -1;
            for (size_t i = 0; i < n; ++i) {
                const EdgeRef& ri = ring.edges[i]; const EdgeRef& rj = ring.edges[(i + 1) % n];
                const Edge* ei = g.edge(ri); const Edge* ej = g.edge(rj);
                const RefPoint A = exitEnd == 0 ? ei->from : ei->to;
                std::string how; double gap = 0; int usedB = -1;
                for (int b : {0, 1}) {
                    if (n == 1 && b == exitEnd) continue;   // tek kenarli halka: obur uca baglanmali
                    double gp; const std::string h = identify(ri, A, rj, b == 0 ? ej->from : ej->to, gp);
                    if (!h.empty()) { how = h; gap = gp; usedB = b; break; }
                }
                if (how.empty()) { okAll = false; how = "KAVSAK YOK"; }
                if (i + 1 == n) entry0 = usedB;
                exitEnd = usedB < 0 ? 1 : 1 - usedB;
                if (gap > worstOut) { worstOut = gap; worstJunction = ri.panel + "/" + ri.edge + " -> " + rj.panel + "/" + rj.edge; }
                if (!descOut.empty()) descOut += " | ";
                descOut += ri.panel + "/" + ri.edge + " -> " + rj.panel + "/" + rj.edge + ": " + how + (how.rfind("dikis", 0) == 0 ? " (" + f2(gap) + ")" : "");
            }
            if (okAll && n > 1 && entry0 >= 0 && entry0 != 1 - startExit) { okAll = false; descOut += " | ilk kenara donus ucu tutmuyor"; }
            return okAll;
        };
        std::string desc1, wj1; double w1 = 0; const bool ok1 = walk(1, w1, desc1, wj1);
        if (ok1) { worst = w1; desc = desc1; hs.enKotuKavsak = wj1; }
        else {
            std::string desc0, wj0; double w0 = 0; const bool ok0 = walk(0, w0, desc0, wj0);
            if (ok0) { worst = w0; desc = desc0; hs.enKotuKavsak = wj0; }
            else { broken = true; worst = std::max(w0, w1); desc = desc1; hs.enKotuKavsak = wj1; }
        }
        hs.kapanmaMM = worst; hs.kavsaklar = desc;
        hs.gecti = !broken && worst <= tol.halkaKapanmaMM;
        H("halka_kapanma", ring.id + " (" + ring.role + ")", broken ? ("halka KOPUK: " + desc) : ("toplam " + f2(hs.toplamMM) + " mm, en buyuk kavsak boslugu " + f2(worst) + " mm" + (worst > 0 ? " @ " + hs.enKotuKavsak : "")), hs.gecti);
        R.halkalar.push_back(hs);
    }
    return R;
}

JVal DogrulamaRaporu::toJSON() const {
    JVal o = JVal::obj();
    o.set("graf", JVal::str(grafId)); o.set("body", JVal::str(bodyId)); o.set("onArkaEsit", JVal::boolean(onArkaEsit));
    o.set("dikilebilir", JVal::boolean(dikilebilir())); o.set("kirmizi", JVal::num(kirmizi()));
    JVal hs = JVal::arr();
    for (const Hukum& h : hukumler) { JVal x = JVal::obj(); x.set("kural", JVal::str(h.kural)); x.set("hedef", JVal::str(h.hedef)); x.set("deger", JVal::str(h.deger)); x.set("gecti", JVal::boolean(h.gecti)); x.set("bilgi", JVal::boolean(h.bilgi)); hs.push(x); }
    o.set("hukumler", hs);
    JVal ds = JVal::arr();
    for (const DikisSatir& d : dikisler) { JVal x = JVal::obj(); x.set("seam", JVal::str(d.seam)); x.set("lenA", JVal::num(d.lenA)); x.set("lenB", JVal::num(d.lenB)); x.set("hedefA", JVal::num(d.hedefA)); x.set("artikMM", JVal::num(d.artikMM)); x.set("gecti", JVal::boolean(d.gecti)); x.set("ucBoslukMM", JVal::num(d.ucBoslukMM)); JVal c = JVal::arr(); for (double v : d.centikArtikMM) c.push(JVal::num(std::isinf(v) ? -1 : v)); x.set("centikArtikMM", c); ds.push(x); }
    o.set("dikisler", ds);
    JVal rs = JVal::arr();
    for (const HalkaSatir& h : halkalar) { JVal x = JVal::obj(); x.set("ring", JVal::str(h.ring)); x.set("role", JVal::str(h.role)); x.set("toplamMM", JVal::num(h.toplamMM)); x.set("kapanmaMM", JVal::num(h.kapanmaMM)); x.set("enKotuKavsak", JVal::str(h.enKotuKavsak)); x.set("gecti", JVal::boolean(h.gecti)); x.set("kavsaklar", JVal::str(h.kavsaklar)); rs.push(x); }
    o.set("halkalar", rs);
    JVal ps = JVal::arr();
    for (const PanelPoz& p : pozlar) { JVal x = JVal::obj(); x.set("panel", JVal::str(p.panel)); x.set("yerlesti", JVal::boolean(p.yerlesti)); x.set("cosT", JVal::num(p.cosT)); x.set("sinT", JVal::num(p.sinT)); x.set("tx", JVal::num(p.tx)); x.set("ty", JVal::num(p.ty)); x.set("yerlestiren", JVal::str(p.yerlestiren)); x.set("alanMM2", JVal::num(p.alanMM2)); x.set("cevreMM", JVal::num(p.cevreMM)); ps.push(x); }
    o.set("pozlar", ps);
    return o;
}

std::string DogrulamaRaporu::toMarkdown() const {
    std::string m;
    m += "# Dikilebilirlik — " + grafId + " @ " + bodyId + (onArkaEsit ? " (on/arka esit)" : "") + "\n\n";
    m += std::string("**Sonuc: ") + (dikilebilir() ? "DIKILEBILIR" : "DIKILEBILIR DEGIL") + "** — kirmizi hukum " + std::to_string(kirmizi()) + " / " + std::to_string(hukumler.size()) + " satir.\n\n";
    m += "## Dikisler\n\n| dikis | a (mm) | hedef = ratio x b + ease | artik (mm) | uc boslugu (bilgi) | centik sapma (mm) | hukum |\n|---|---|---|---|---|---|---|\n";
    for (const DikisSatir& d : dikisler) {
        std::string c; for (double v : d.centikArtikMM) { if (!c.empty()) c += ", "; c += std::isinf(v) ? "yok" : f2(v); }
        m += "| " + d.seam + " | " + f2(d.lenA) + " | " + f2(d.hedefA) + " (b " + f2(d.lenB) + ") | " + f2(d.artikMM) + " | " + f2(d.ucBoslukMM) + " | " + (c.empty() ? "-" : c) + " | " + (d.gecti ? "gecti" : "KIRMIZI") + " |\n";
    }
    m += "\n## Halkalar (sanal dikis)\n\n| halka | rol | toplam (mm) | kapanma (mm) | kavsaklar | hukum |\n|---|---|---|---|---|---|\n";
    for (const HalkaSatir& h : halkalar) m += "| " + h.ring + " | " + h.role + " | " + f2(h.toplamMM) + " | " + f2(h.kapanmaMM) + " | " + h.kavsaklar + " | " + (h.gecti ? "gecti" : "KIRMIZI") + " |\n";
    m += "\n## Paneller (rijit 2B yerlestirme, bilgi)\n\n| panel | yerlesti | dikis | theta (deg) | t (mm) | alan (cm2) | cevre (mm) |\n|---|---|---|---|---|---|---|\n";
    for (const PanelPoz& p : pozlar) m += "| " + p.panel + " | " + (p.yerlesti ? "evet" : "HAYIR") + " | " + p.yerlestiren + " | " + f2(std::atan2(p.sinT, p.cosT) * 180.0 / M_PI) + " | (" + f2(p.tx) + ", " + f2(p.ty) + ") | " + f2(p.alanMM2 / 100.0) + " | " + f2(p.cevreMM) + " |\n";
    m += "\n## Hukumler\n\n| kural | hedef | deger | sonuc |\n|---|---|---|---|\n";
    for (const Hukum& h : hukumler) m += "| " + h.kural + " | " + h.hedef + " | " + h.deger + " | " + (h.bilgi ? "bilgi" : (h.gecti ? "gecti" : "KIRMIZI")) + " |\n";
    return m;
}

} // namespace graf
} // namespace stitchu
