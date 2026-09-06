// grafdogrula.cpp — GRAF DOGRULAYICI + SANAL DIKIS. Bkz. grafdogrula.hpp.
#include "grafdogrula.hpp"

#include <algorithm>
#include <cctype>
#include <cmath>
#include <cstdio>
#include <functional>
#include <limits>
#include <set>
#include <stdexcept>

#include "grafop.hpp"

namespace stitchu {
namespace graf {

Tolerans Tolerans::fromContract(const JVal& contract) {
    Tolerans t;
    const double nan = std::numeric_limits<double>::quiet_NaN();
    t.dikisUzunlukMM = t.centikMM = t.halkaKapanmaMM = t.pensBacakMM = t.ratioMin = t.ratioMax = nan;
    if (const JVal* tl = contract.get("toleranslar")) {
        auto rd = [&](const char* k, double& out) {
            const JVal* v = tl->get(k); if (!v) return;
            const JVal* d = v->get("deger"); if (d && d->isNum()) out = d->n;
            t.tablo.push_back({k, v->strOr("kaynak", "KAYNAK YOK"), (d && d->isNum()) ? d->n : nan});
        };
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

std::vector<std::string> uydurmaKalemleri(const std::string& notes) {
    // ';' ve '. ' sinirlarinda bol; DOGRULANMADI gecen parcalari kirp ve dondur
    std::vector<std::string> parts; std::string cur;
    for (size_t i = 0; i < notes.size(); ++i) {
        const char c = notes[i];
        if (c == ';' || (c == '.' && i + 1 < notes.size() && notes[i + 1] == ' ' && !(i > 0 && std::isdigit(static_cast<unsigned char>(notes[i - 1])) && i + 2 < notes.size() && std::isdigit(static_cast<unsigned char>(notes[i + 2]))))) {
            parts.push_back(cur); cur.clear();
        } else cur += c;
    }
    parts.push_back(cur);
    std::vector<std::string> out;
    for (std::string p : parts) {
        if (p.find("DOGRULANMADI") == std::string::npos) continue;
        const size_t b = p.find_first_not_of(" \t\n"), e = p.find_last_not_of(" \t\n");
        if (b == std::string::npos) continue;
        out.push_back(p.substr(b, e - b + 1));
    }
    return out;
}

namespace {
std::string f2(double v) { char b[48]; std::snprintf(b, sizeof b, "%.2f", v); return b; }
std::string f4(double v) { char b[48]; std::snprintf(b, sizeof b, "%.4f", v); return b; }
std::string rs(const EdgeRef& r) { return r.panel + "/" + r.edge; }

// Kenar konturunu noktalara ac (24 adim, motorun pathLength adimi)
std::vector<Point> flattenEdge(const Edge& e, const EvalCtx& ctx) {
    const Point a = eval(e.from, ctx), b = eval(e.to, ctx);
    if (e.isLine()) return {a, b};
    return flattenCubic(a, b, eval(e.control[0], ctx), eval(e.control[1], ctx), 24);
}
struct Chain {   // bir dikis tarafi YURUYUS yonunde: kenarlar, kumulatif uzunluklar, yerel noktalar
    std::vector<ZincirKenar> kenarlar;
    std::vector<std::vector<Point>> pts;   // her kenar icin duzlestirilmis noktalar (yerel; ters kenar ters sirada)
    std::vector<std::vector<double>> notch; // her kenar icin yuruyus yonunde centik kesirleri
    std::vector<double> cum;               // cum[i] = i. kenarin baslangicinin yay konumu
    double total = 0;
};
Chain chainOf(const Garment& g, const Zincir& z, const Body& body, bool onArkaEsit) {
    Chain c; c.kenarlar = z.kenarlar;
    for (const ZincirKenar& zk : z.kenarlar) {
        const Panel* p = g.panel(zk.ref.panel); const Edge* e = g.edge(zk.ref);
        if (!p || !e) throw std::runtime_error("chain: referans cozulmedi " + rs(zk.ref));
        std::vector<Point> pts = flattenEdge(*e, p->ctxFor(body, onArkaEsit));
        std::vector<double> nf = e->notches;
        if (zk.ters) { std::reverse(pts.begin(), pts.end()); for (double& f : nf) f = 1.0 - f; }
        double L = 0; for (size_t i = 1; i < pts.size(); ++i) L += distance(pts[i - 1], pts[i]);
        c.cum.push_back(c.total); c.pts.push_back(pts); c.notch.push_back(nf); c.total += L;
    }
    return c;
}
Zincir duzZincir(const std::vector<EdgeRef>& refs) {   // yon cozumu olmadan (uzunluk icin yeter)
    Zincir z; for (const EdgeRef& r : refs) z.kenarlar.push_back({r, false}); z.ok = true; return z;
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
struct Pose { double a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0; bool set = false; bool ayna = false; std::string by; };
Point apply(const Pose& p, Point q) { return {p.a * q.x + p.b * q.y + p.tx, p.c * q.x + p.d * q.y + p.ty}; }
// q0->A, yon (q1-q0) -> (B-A): rijit (olceksiz); ayna=true ise once q0q1 dogrusuna gore yansit
Pose poseFrom(Point q0, Point q1, Point A, Point B, bool ayna) {
    Pose p; p.set = true; p.ayna = ayna;
    // (1) istenirse q0q1 dogrusuna gore yansitma: x' = M x + tr, dogru ustundeki noktalar sabit
    double ma = 1, mb = 0, mc = 0, md = 1, trx = 0, tr_y = 0;
    if (ayna) {
        const double ux = q1.x - q0.x, uy = q1.y - q0.y, L2 = ux * ux + uy * uy;
        if (L2 > 0) {
            ma = (ux * ux - uy * uy) / L2; mb = 2 * ux * uy / L2; mc = mb; md = (uy * uy - ux * ux) / L2;
            trx = q0.x - (ma * q0.x + mb * q0.y); tr_y = q0.y - (mc * q0.x + md * q0.y);
        }
    }
    // (2) yon hizalama donusu (yansitma dogru yonunu korur) + q0 -> A otelemesi
    const double a1 = std::atan2(q1.y - q0.y, q1.x - q0.x), a2 = std::atan2(B.y - A.y, B.x - A.x);
    const double th = a2 - a1, cs = std::cos(th), sn = std::sin(th);
    p.a = cs * ma - sn * mc; p.b = cs * mb - sn * md; p.c = sn * ma + cs * mc; p.d = sn * mb + cs * md;
    const double rtx = cs * trx - sn * tr_y, rty = sn * trx + cs * tr_y;      // Rot x tr
    const double rq0x = cs * q0.x - sn * q0.y, rq0y = sn * q0.x + cs * q0.y;  // Rot x q0 (yansitma q0'i sabit tutar)
    p.tx = rtx + (A.x - rq0x); p.ty = rty + (A.y - rq0y);
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
Point centroid(const std::vector<Point>& P) { Point c{0, 0}; if (P.empty()) return c; for (const Point& p : P) { c.x += p.x; c.y += p.y; } c.x /= P.size(); c.y /= P.size(); return c; }

// ---------------------------------------------------------------- kavsak tanima (karar 7)
// Tepe (panel, RefPoint) ile tepe (panel, RefPoint) bulusur mu: ayni panelde esitlik (kose), ilan
// edilen dikis esi (dikis), iki kat cizgisi ucu (kat). Oncelik: kose > dikis > kat (kat ancak baska
// baglanti yoksa; iki x=0 ucunun rastlantisi degil, halkanin ayna kapanisi olsun diye).
Kavsak kavsakBul(const Garment& g, const std::string& pi, const RefPoint& A, const std::string& pj, const RefPoint& B, const ZincirCozumu& cz, bool katIzin) {
    if (pi == pj && A == B) return {"kose", ""};
    for (const ZincirCozumu::Es& e : cz.esler) {
        if ((e.panelP == pi && e.P == A && e.panelQ == pj && e.Q == B) || (e.panelQ == pi && e.Q == A && e.panelP == pj && e.P == B)) return {"dikis", e.dikis};
    }
    if (katIzin) {
        const Panel* P = g.panel(pi); const Panel* Q = g.panel(pj);
        if (P && Q && P->onFold && Q->onFold && A.xSifir() && B.xSifir()) return {"kat", ""};
    }
    return {"", ""};
}
} // namespace

std::string Zincir::metin() const {
    std::string s;
    for (size_t i = 0; i < kenarlar.size(); ++i) { if (i) s += (kavsaklar.size() > i - 1 && kavsaklar[i - 1].tur == "dikis" ? " =" + kavsaklar[i - 1].dikis + "= " : " "); s += rs(kenarlar[i].ref) + (kenarlar[i].ters ? "<" : ">"); }
    return s;
}

Zincir zincirCoz(const Garment& g, const std::vector<EdgeRef>& refs, const ZincirCozumu& cz, bool halka) {
    Zincir z;
    if (refs.empty()) { z.hata = "bos zincir"; return z; }
    for (const EdgeRef& r : refs) if (!g.edge(r)) { z.hata = "referans cozulmedi " + rs(r); return z; }
    const size_t n = refs.size();
    auto entry = [&](const EdgeRef& r, bool ters) -> RefPoint { const Edge* e = g.edge(r); return ters ? e->to : e->from; };
    auto exit_ = [&](const EdgeRef& r, bool ters) -> RefPoint { const Edge* e = g.edge(r); return ters ? e->from : e->to; };
    // ilk kenarin yonu: tek kenar -> duz. Cok kenar -> (duz, sonraki) once, (ters, sonraki) sonra; kose>dikis>kat onceligi
    std::vector<bool> ters(n, false); std::vector<Kavsak> kav;
    if (n == 1) {
        z.kenarlar.push_back({refs[0], false});
        if (halka) {
            const Kavsak k = kavsakBul(g, refs[0].panel, exit_(refs[0], false), refs[0].panel, entry(refs[0], false), cz, true);
            // tek kenarli halkada kose (from==to) zaten kapali kenar olamaz; dikis ya da kat
            if (k.tur.empty()) { z.hata = "tek kenarli halka kapanmiyor: " + rs(refs[0]) + " iki ucu dikis/kat ile bulusmuyor"; }
            else z.ok = true;
            z.kavsaklar.push_back(k);
        } else z.ok = true;
        z.basPanel = z.sonPanel = refs[0].panel; z.bas = entry(refs[0], false); z.son = exit_(refs[0], false);
        return z;
    }
    auto rank = [](const std::string& t) { return t == "kose" ? 0 : t == "dikis" ? 1 : t == "kat" ? 2 : 9; };
    // i = 0: dort kombinasyon icinden EN IYI kavsak (tur onceligi, esitlikte duz-duz)
    {
        int best = 9; bool bt0 = false, bt1 = false; Kavsak bk;
        for (bool t0 : {false, true}) for (bool t1 : {false, true}) {
            const Kavsak k = kavsakBul(g, refs[0].panel, exit_(refs[0], t0), refs[1].panel, entry(refs[1], t1), cz, false);
            if (k.tur.empty()) continue;
            if (rank(k.tur) < best) { best = rank(k.tur); bt0 = t0; bt1 = t1; bk = k; }
        }
        if (best == 9) { z.hata = "zincir kopuk: " + rs(refs[0]) + " -> " + rs(refs[1]) + " tepe paylasmiyor (kose/dikis yok)"; for (const EdgeRef& r : refs) z.kenarlar.push_back({r, false}); return z; }
        ters[0] = bt0; ters[1] = bt1; kav.push_back(bk);
    }
    for (size_t i = 1; i + 1 < n; ++i) {
        int best = 9; bool bt = false; Kavsak bk;
        for (bool t1 : {false, true}) {
            const Kavsak k = kavsakBul(g, refs[i].panel, exit_(refs[i], ters[i]), refs[i + 1].panel, entry(refs[i + 1], t1), cz, false);
            if (k.tur.empty()) continue;
            if (rank(k.tur) < best) { best = rank(k.tur); bt = t1; bk = k; }
        }
        if (best == 9) { z.hata = "zincir kopuk: " + rs(refs[i]) + (ters[i] ? "<" : ">") + " -> " + rs(refs[i + 1]) + " tepe paylasmiyor"; for (size_t j = 0; j < n; ++j) z.kenarlar.push_back({refs[j], ters[j]}); z.kavsaklar = kav; return z; }
        ters[i + 1] = bt; kav.push_back(bk);
    }
    for (size_t j = 0; j < n; ++j) z.kenarlar.push_back({refs[j], ters[j]});
    z.basPanel = refs[0].panel; z.bas = entry(refs[0], ters[0]);
    z.sonPanel = refs[n - 1].panel; z.son = exit_(refs[n - 1], ters[n - 1]);
    if (halka) {
        const Kavsak k = kavsakBul(g, z.sonPanel, z.son, z.basPanel, z.bas, cz, true);
        if (k.tur.empty()) { z.hata = "halka kapanmiyor: " + rs(refs[n - 1]) + " -> " + rs(refs[0]) + " kavsak yok (dikis/kose/kat)"; z.kavsaklar = kav; z.kavsaklar.push_back(k); return z; }
        kav.push_back(k);
    }
    z.kavsaklar = kav; z.ok = true;
    return z;
}

ZincirCozumu zincirleriCoz(const Garment& g) {
    ZincirCozumu cz;
    std::set<std::string> done;
    bool progress = true;
    while (progress && done.size() < g.seams.size()) {
        progress = false;
        for (const Seam& s : g.seams) {
            if (done.count(s.id)) continue;
            DikisZincir dz; dz.a = zincirCoz(g, s.a, cz, false); dz.b = zincirCoz(g, s.b, cz, false);
            if (!dz.a.ok || !dz.b.ok) { dz.hata = (!dz.a.ok ? "a: " + dz.a.hata : "") + (!dz.b.ok ? (dz.a.ok ? "" : " | ") + std::string("b: ") + dz.b.hata : ""); cz.dikisler[s.id] = dz; continue; }
            dz.ok = true; cz.dikisler[s.id] = dz; done.insert(s.id); progress = true;
            // ilan edilen uc esleri: reverse=false -> bas<->bas, son<->son; true -> bas<->son, son<->bas
            const Zincir& A = dz.a; const Zincir& B = dz.b;
            if (!s.reverse) { cz.esler.push_back({A.basPanel, B.basPanel, s.id, A.bas, B.bas}); cz.esler.push_back({A.sonPanel, B.sonPanel, s.id, A.son, B.son}); }
            else { cz.esler.push_back({A.basPanel, B.sonPanel, s.id, A.bas, B.son}); cz.esler.push_back({A.sonPanel, B.basPanel, s.id, A.son, B.bas}); }
        }
    }
    for (const Seam& s : g.seams) if (!done.count(s.id)) cz.ok = false;
    return cz;
}

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
    return chainOf(g, duzZincir(refs), body, onArkaEsit).total;
}

DogrulamaRaporu dogrula(const Garment& g0, const Body& body, const JVal& contract, bool onArkaEsit) {
    DogrulamaRaporu R; R.grafId = g0.id; R.bodyId = body.id(); R.onArkaEsit = onArkaEsit;
    auto H = [&](const std::string& k, const std::string& hedef, const std::string& deger, bool gecti, bool bilgi = false) {
        R.hukumler.push_back({k, hedef, deger, gecti, bilgi});
    };
    const Tolerans tol = Tolerans::fromContract(contract);
    R.toleranslar = tol.tablo;
    if (!tol.dolu) { H("tolerans", "contract", "toleranslar/araliklar eksik ya da NaN — dogrulayici reddetti", false); return R; }
    H("tolerans", "contract", "dikis " + f2(tol.dikisUzunlukMM) + " · centik " + f2(tol.centikMM) + " · halka " + f2(tol.halkaKapanmaMM) + " · pens " + f2(tol.pensBacakMM) + " mm; ratio [" + f2(tol.ratioMin) + ", " + f2(tol.ratioMax) + "] (kaynaklar tablo basliginda)", true, true);
    R.uydurmalar = uydurmaKalemleri(g0.notes);
    for (const std::string& u : R.uydurmalar) H("uydurma", g0.id, u, true, true);
    if (R.uydurmalar.empty()) H("uydurma", g0.id, "notes'ta DOGRULANMADI kalemi yok", true, true);

    // ---- sema
    { std::vector<std::string> hs; const bool ok = semaDogrula(toJSON(g0), contract, hs);
      H("sema", g0.id, ok ? "sozlesmeyle uyumlu" : (std::to_string(hs.size()) + " hata: " + hs.front()), ok); }

    // ---- panel_kapali + referans
    std::set<std::string> pids;
    for (const Panel& p : g0.panels) {
        std::string why; const bool ok = p.closed(&why);
        H("panel_kapali", p.id, ok ? (std::to_string(p.edges.size()) + " kenar, halka kapali") : why, ok);
        if (!pids.insert(p.id).second) H("referans", p.id, "tekrar eden panel id", false);
    }
    auto refsOk = [&](const std::vector<EdgeRef>& refs, const std::string& hedef) {
        for (const EdgeRef& r : refs) if (!g0.edge(r)) { H("referans", hedef, "cozulmeyen referans " + rs(r), false); return false; }
        return true;
    };
    bool refsAllOk = true;
    for (const Seam& s : g0.seams) { if (!refsOk(s.a, "seam " + s.id) || !refsOk(s.b, "seam " + s.id)) refsAllOk = false; }
    for (const Ring& r : g0.rings) if (!refsOk(r.edges, "ring " + r.id)) refsAllOk = false;
    if (!refsAllOk) return R;   // gerisi referanssiz olculemez
    H("referans", g0.id, std::to_string(g0.seams.size()) + " dikis, " + std::to_string(g0.rings.size()) + " halka; tum referanslar cozuldu", true);

    // ---- topoloji (A2c/E1): dikilemez GRAF, cizim denenmeden ADIYLA reddedilir.
    // Dort kural, hepsi contract/graf-v1.json _yasa'sindan turer; uydurma tablo YOK:
    //   kenar_rolu       (_yasa 3+4) dikisin iki tarafi da kind=="seam" kenardir; fold/cut/dartLeg
    //                    bir dikise giremez (fold kat cizgisi, cut serbest kenar, dartLeg pens).
    //   dikis_cifti      (_yasa 4)   bir kenar birden cok dikiste OLAMAZ, ayni dikisin iki tarafinda
    //                    hic olamaz: dikis ciftleri benzersizdir.
    //   kapanma          (_yasa 3)   kind=="seam" her kenar TAM BIR dikiste olmalidir; acik kalan
    //                    seam kenari kapanmayan giysidir.
    //   komsuluk_bagli   (_yasa 7)   dikislerle baglanan paneller TEK bilesen olmalidir; kopuk panel
    //                    ayni giysiye dikilemez.
    // Hukum yazisi ERR_IMPOSSIBLE_TOPOLOGY ile baslar ve hangi KURAL + hangi KENAR oldugunu soyler.
    {
        auto topoRet = [&](const char* kural, const std::string& hedef, const std::string& neden) {
            H("topoloji", hedef, std::string("ERR_IMPOSSIBLE_TOPOLOGY: ") + kural + " — " + neden, false);
        };
        // kenar kind haritasi (g0: cozumden ONCE, topoloji cozumden bagimsizdir)
        std::map<std::string, std::string> kind;            // "panel/edge" -> kind
        for (const Panel& p : g0.panels) for (const Edge& e : p.edges) kind[p.id + "/" + e.id] = e.kind;

        int hataSayisi = 0;
        std::map<std::string, std::vector<std::string>> kenarDikisleri;   // "panel/edge" -> seam id (tekrarli)
        for (const Seam& s : g0.seams) {
            std::set<std::string> buDikiste;
            auto taraf = [&](const std::vector<EdgeRef>& refs, const char* yan) {
                for (const EdgeRef& r : refs) {
                    const std::string key = rs(r);
                    kenarDikisleri[key].push_back(s.id);
                    // kural 1: kenar rolu uyumlulugu
                    auto it = kind.find(key);
                    if (it != kind.end() && it->second != "seam") {
                        topoRet("kenar_rolu", key, "dikis " + s.id + " tarafi " + yan + " '" + it->second + "' kenari tasiyor; dikise yalniz kind=seam kenar girer (_yasa 3)");
                        ++hataSayisi;
                    }
                    // kural 2a: ayni dikisin iki tarafinda ayni kenar
                    if (!buDikiste.insert(key).second) {
                        topoRet("dikis_cifti", key, "kenar dikis " + s.id + " icinde iki kez geciyor; dikis cifti benzersizdir (_yasa 4)");
                        ++hataSayisi;
                    }
                }
            };
            taraf(s.a, "a"); taraf(s.b, "b");
        }
        // kural 2b: bir kenar birden cok DIKISTE
        for (const auto& kv : kenarDikisleri) {
            std::set<std::string> farkli(kv.second.begin(), kv.second.end());
            if (farkli.size() > 1) {
                std::string liste; for (const std::string& d : farkli) { if (!liste.empty()) liste += ", "; liste += d; }
                topoRet("dikis_cifti", kv.first, "kenar " + std::to_string(farkli.size()) + " ayri dikiste (" + liste + "); bir kenar tek bir dikise aittir (_yasa 4)");
                ++hataSayisi;
            }
        }
        // kural 3: kapanma zorunlulugu — kind=seam her kenar TAM BIR dikiste
        for (const auto& kv : kind) {
            if (kv.second != "seam") continue;
            if (!kenarDikisleri.count(kv.first)) {
                topoRet("kapanma", kv.first, "kind=seam kenar hicbir dikiste degil; giysi bu kenardan KAPANMIYOR (_yasa 3)");
                ++hataSayisi;
            }
        }
        // kural 4: komsuluk grafi bagli (union-find, dikisler kenar)
        if (!g0.panels.empty()) {
            std::map<std::string, std::string> ebeveyn;
            for (const Panel& p : g0.panels) ebeveyn[p.id] = p.id;
            std::function<std::string(const std::string&)> bul = [&](const std::string& x) -> std::string {
                std::string k = x; while (ebeveyn[k] != k) k = ebeveyn[k]; ebeveyn[x] = k; return k;
            };
            for (const Seam& s : g0.seams) {
                std::string ilk;
                auto birlestir = [&](const std::vector<EdgeRef>& refs) {
                    for (const EdgeRef& r : refs) {
                        if (!ebeveyn.count(r.panel)) continue;
                        if (ilk.empty()) { ilk = r.panel; continue; }
                        const std::string a = bul(ilk), b = bul(r.panel);
                        if (a != b) ebeveyn[a] = b;
                    }
                };
                birlestir(s.a); birlestir(s.b);
            }
            std::set<std::string> kokler;
            for (const Panel& p : g0.panels) kokler.insert(bul(p.id));
            if (kokler.size() > 1) {
                // kopuk paneli ADIYLA soyle: en kucuk bilesenin ilk paneli
                std::map<std::string, std::vector<std::string>> bilesenler;
                for (const Panel& p : g0.panels) bilesenler[bul(p.id)].push_back(p.id);
                const std::vector<std::string>* enKucuk = nullptr;
                for (const auto& kv : bilesenler) if (!enKucuk || kv.second.size() < enKucuk->size()) enKucuk = &kv.second;
                topoRet("komsuluk_bagli", enKucuk ? enKucuk->front() : g0.id,
                        std::to_string(kokler.size()) + " kopuk panel bileseni; dikisler butun panelleri TEK giysiye baglamiyor (_yasa 7)");
                ++hataSayisi;
            }
        }
        if (hataSayisi == 0)
            H("topoloji", g0.id, "kenar_rolu · dikis_cifti · kapanma · komsuluk_bagli: dort kural da gecti (" + std::to_string(g0.panels.size()) + " panel, " + std::to_string(g0.seams.size()) + " dikis)", true);
    }

    // ---- kisit: fitLength kisitlari bu bedende cozulur (karar 6); cozulen graf G ile olculur
    const OpCtx octx = OpCtx::fromContract(contract);
    CozumSonucu cz = cozumle(g0, body, onArkaEsit, octx);
    const Garment& g = cz.ok ? cz.g : g0;
    if (!cz.ok) H("kisit", g0.id, cz.hata, false);
    else for (const Cozum& c : cz.cozumler) H("kisit", c.panel + "/" + c.edge, "dikis " + c.seam + ": hedef " + f2(c.hedefMM) + " mm, kontrol kaymasi " + f2(c.dMM) + " mm @ " + body.id() + ", artik " + f4(c.artikMM) + " mm", true, true);
    if (cz.ok && cz.cozumler.empty()) H("kisit", g0.id, "fitLength kisiti yok", true, true);

    // ---- kenar_turu
    std::map<std::string, std::vector<std::string>> inSeam;   // "panel/edge" -> seam ids
    for (const Seam& s : g.seams) { for (const EdgeRef& r : s.a) inSeam[rs(r)].push_back(s.id); for (const EdgeRef& r : s.b) inSeam[rs(r)].push_back(s.id); }
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
    std::map<std::string, Point> merkez;
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
            pz.alanMM2 = std::fabs(A) / 2.0; pz.cevreMM = L; merkez[p.id] = centroid(P);
        }
        R.pozlar.push_back(pz);
    }

    // ---- dikis_zincir (karar 7): yapisal, beden gerekmez
    const ZincirCozumu zc = zincirleriCoz(g);
    for (const Seam& s : g.seams) {
        const DikisZincir& dz = zc.dikisler.at(s.id);
        H("dikis_zincir", s.id, dz.ok ? ("a: " + dz.a.metin() + " | b: " + dz.b.metin() + " | reverse " + (s.reverse ? "true (a.bas<->b.son)" : "false (a.bas<->b.bas)")) : dz.hata, dz.ok);
    }

    // ---- dikis_uzunluk + centik (zincir yonunde; b tarafi reverse ile)
    std::map<std::string, double> seamArtik;
    std::map<std::string, std::pair<Chain, Chain>> chains;
    for (const Seam& s : g.seams) {
        DikisSatir d; d.seam = s.id; d.reverse = s.reverse;
        const DikisZincir& dz = zc.dikisler.at(s.id);
        Chain ca, cb;
        try { ca = chainOf(g, dz.ok ? dz.a : duzZincir(s.a), body, onArkaEsit); cb = chainOf(g, dz.ok ? dz.b : duzZincir(s.b), body, onArkaEsit); }
        catch (const std::exception& ex) { H("dikis_uzunluk", s.id, std::string("degerlenemedi: ") + ex.what(), false); continue; }
        d.lenA = ca.total; d.lenB = cb.total; d.hedefA = s.ratio * cb.total + s.easeMM; d.artikMM = ca.total - d.hedefA;
        const bool ratioOk = s.ratio >= tol.ratioMin && s.ratio <= tol.ratioMax;
        d.gecti = ratioOk && std::fabs(d.artikMM) <= tol.dikisUzunlukMM;
        seamArtik[s.id] = std::fabs(d.artikMM);
        H("dikis_uzunluk", s.id, "a " + f2(d.lenA) + " mm, hedef " + f2(d.hedefA) + " (ratio " + f4(s.ratio) + " x b " + f2(d.lenB) + " + ease " + f2(s.easeMM) + "), artik " + f2(d.artikMM) + " mm" + (ratioOk ? "" : " — ratio aralik disi"), d.gecti);
        // uc boslugu (bilgi): kiris uyumsuzlugu
        if (!ca.pts.empty() && !cb.pts.empty()) {
            const Point A0 = ca.pts.front().front(), A1 = ca.pts.back().back();
            const Point B0 = cb.pts.front().front(), B1 = cb.pts.back().back();
            d.ucBoslukMM = std::fabs(distance(A0, A1) - distance(B0, B1) * s.ratio);
        }
        // centikler: a'nin basindan f; b'de reverse ise (1-f)
        for (double f : s.notchFractions) {
            double worst = 0; bool okN = f > 0.0 && f < 1.0 && dz.ok;
            for (int side = 0; side < 2 && okN; ++side) {
                const Chain& c = side == 0 ? ca : cb;
                const double fs = (side == 1 && s.reverse) ? (1.0 - f) : f;
                const double target = fs * c.total;
                double best = std::numeric_limits<double>::infinity();
                for (size_t i = 0; i < c.kenarlar.size(); ++i) {
                    const double L = (i + 1 < c.kenarlar.size() ? c.cum[i + 1] : c.total) - c.cum[i];
                    for (double nf : c.notch[i]) best = std::min(best, std::fabs(c.cum[i] + nf * L - target));
                }
                worst = std::max(worst, best);
            }
            if (!(worst <= tol.centikMM)) okN = false;
            d.centikArtikMM.push_back(worst);
            H("centik", s.id + " @" + f4(f), !dz.ok ? "zincir cozulmedi, centik yeri tanimsiz" : std::isinf(worst) ? "bir tarafta panel centigi yok" : ("iki tarafta en kotu sapma " + f2(worst) + " mm" + (s.reverse ? " (b'de 1-f)" : "")), okN);
        }
        R.dikisler.push_back(d);
        chains[s.id] = {ca, cb};
    }

    // ---- sanal dikis: 2B yerlestirme (bilgi), ilan edilen eslesmeyle; gerekirse ayna (kitap gibi acilis)
    if (!g.panels.empty()) {
        poses[g.panels[0].id] = Pose{1, 0, 0, 1, 0, 0, true, false, "kok"};
        bool progress = true;
        while (progress) {
            progress = false;
            for (const Seam& s : g.seams) {
                if (!chains.count(s.id) || !zc.dikisler.at(s.id).ok) continue;
                for (int dir = 0; dir < 2; ++dir) {
                    const Chain& cx = dir == 0 ? chains[s.id].first : chains[s.id].second;   // yerlesik taraf
                    const Chain& cy = dir == 0 ? chains[s.id].second : chains[s.id].first;   // yerlestirilecek
                    bool xPlaced = !cx.kenarlar.empty(); for (const ZincirKenar& zk : cx.kenarlar) if (!poses[zk.ref.panel].set) xPlaced = false;
                    if (!xPlaced || cx.total <= 0 || cy.total <= 0) continue;
                    for (size_t i = 0; i < cy.kenarlar.size(); ++i) {
                        const std::string& yp = cy.kenarlar[i].ref.panel;
                        if (poses[yp].set) continue;
                        const double s0 = cy.cum[i], s1 = (i + 1 < cy.kenarlar.size() ? cy.cum[i + 1] : cy.total);
                        const double k = cx.total / cy.total;
                        // ilan edilen eslesme: reverse=false -> bas<->bas (ayni yon); true -> bas<->son
                        auto mapS = [&](double sy) { return s.reverse ? (cx.total - sy * k) : (sy * k); };
                        size_t ex0 = 0, ex1 = 0;
                        const Point T0l = chainPointAt(cx, mapS(s0), &ex0), T1l = chainPointAt(cx, mapS(s1), &ex1);
                        const Point T0 = apply(poses[cx.kenarlar[ex0].ref.panel], T0l), T1 = apply(poses[cx.kenarlar[ex1].ref.panel], T1l);
                        const Point q0 = cy.pts[i].front(), q1 = cy.pts[i].back();
                        // iki aday: rijit / aynali; parcanin merkezi dikis dogrusunun OBUR yanina dusen alinir (acilmis kitap)
                        const Point cX = apply(poses[cx.kenarlar[ex0].ref.panel], merkez[cx.kenarlar[ex0].ref.panel]);
                        auto side = [&](Point P) { return (T1.x - T0.x) * (P.y - T0.y) - (T1.y - T0.y) * (P.x - T0.x); };
                        Pose pr = poseFrom(q0, q1, T0, T1, false), pm = poseFrom(q0, q1, T0, T1, true);
                        const double sX = side(cX), sR = side(apply(pr, merkez[yp]));
                        Pose pz = (sX * sR > 0) ? pm : pr; pz.by = s.id;
                        poses[yp] = pz; progress = true;
                    }
                }
            }
        }
        for (PanelPoz& pz : R.pozlar) {
            const Pose& p = poses[pz.panel];
            pz.yerlesti = p.set; pz.a = p.a; pz.b = p.b; pz.c = p.c; pz.d = p.d; pz.tx = p.tx; pz.ty = p.ty; pz.ayna = p.ayna; pz.yerlestiren = p.by;
            H("yerlestirme", pz.panel, p.set ? ("2B poz (" + p.by + ") theta " + f2(std::atan2(p.c, p.a) * 180.0 / M_PI) + " deg" + (p.ayna ? " AYNA" : "") + ", t (" + f2(p.tx) + ", " + f2(p.ty) + "); alan " + f2(pz.alanMM2 / 100.0) + " cm2, cevre " + f2(pz.cevreMM) + " mm") : "dikis agacina bagli degil (kopuk parca)", p.set, true);
        }
    }

    // ---- halka_kapanma (sanal dikis kavsaklari, ilan edilen yonle)
    for (const Ring& ring : g.rings) {
        HalkaSatir hs; hs.ring = ring.id; hs.role = ring.role;
        if (ring.edges.empty()) { H("halka_kapanma", ring.id, "halkada kenar yok", false); R.halkalar.push_back(hs); continue; }
        try { hs.toplamMM = chainLength(g, ring.edges, body, onArkaEsit); } catch (const std::exception& ex) { H("halka_kapanma", ring.id, std::string("degerlenemedi: ") + ex.what(), false); R.halkalar.push_back(hs); continue; }
        const Zincir z = zincirCoz(g, ring.edges, zc, true);
        double worst = 0; std::string desc;
        const size_t n = ring.edges.size();
        for (size_t i = 0; i < z.kavsaklar.size(); ++i) {
            const Kavsak& k = z.kavsaklar[i];
            const EdgeRef& ri = z.kenarlar[i].ref; const EdgeRef& rj = z.kenarlar[(i + 1) % n].ref;
            const double gap = k.tur == "dikis" ? (seamArtik.count(k.dikis) ? seamArtik[k.dikis] : 0.0) : 0.0;
            if (gap > worst) { worst = gap; hs.enKotuKavsak = rs(ri) + " -> " + rs(rj); }
            if (!desc.empty()) desc += " | ";
            desc += rs(ri) + (z.kenarlar[i].ters ? "<" : ">") + " -> " + rs(rj) + ": " + (k.tur.empty() ? "KAVSAK YOK" : k.tur == "dikis" ? "dikis " + k.dikis + " (" + f2(gap) + ")" : k.tur == "kat" ? "kat aynasi" : "kose");
        }
        hs.kapanmaMM = worst; hs.kavsaklar = z.ok ? desc : (z.hata + (desc.empty() ? "" : " | " + desc));
        hs.gecti = z.ok && worst <= tol.halkaKapanmaMM;
        H("halka_kapanma", ring.id + " (" + ring.role + ")", !z.ok ? ("halka KOPUK: " + hs.kavsaklar) : ("toplam " + f2(hs.toplamMM) + " mm, en buyuk kavsak boslugu " + f2(worst) + " mm" + (worst > 0 ? " @ " + hs.enKotuKavsak : "") + " — " + desc), hs.gecti);
        R.halkalar.push_back(hs);
    }
    return R;
}

JVal DogrulamaRaporu::toJSON() const {
    JVal o = JVal::obj();
    o.set("graf", JVal::str(grafId)); o.set("body", JVal::str(bodyId)); o.set("onArkaEsit", JVal::boolean(onArkaEsit));
    o.set("dikilebilir", JVal::boolean(dikilebilir())); o.set("kirmizi", JVal::num(kirmizi()));
    JVal ts = JVal::arr();
    for (const ToleransSatir& t : toleranslar) { JVal x = JVal::obj(); x.set("ad", JVal::str(t.ad)); x.set("mm", JVal::num(t.deger)); x.set("kaynak", JVal::str(t.kaynak)); ts.push(x); }
    o.set("toleranslar", ts);
    JVal us = JVal::arr(); for (const std::string& u : uydurmalar) us.push(JVal::str(u)); o.set("uydurma", us);
    JVal hs = JVal::arr();
    for (const Hukum& h : hukumler) { JVal x = JVal::obj(); x.set("kural", JVal::str(h.kural)); x.set("hedef", JVal::str(h.hedef)); x.set("deger", JVal::str(h.deger)); x.set("gecti", JVal::boolean(h.gecti)); x.set("bilgi", JVal::boolean(h.bilgi)); hs.push(x); }
    o.set("hukumler", hs);
    JVal ds = JVal::arr();
    for (const DikisSatir& d : dikisler) { JVal x = JVal::obj(); x.set("seam", JVal::str(d.seam)); x.set("reverse", JVal::boolean(d.reverse)); x.set("lenA", JVal::num(d.lenA)); x.set("lenB", JVal::num(d.lenB)); x.set("hedefA", JVal::num(d.hedefA)); x.set("artikMM", JVal::num(d.artikMM)); x.set("gecti", JVal::boolean(d.gecti)); x.set("ucBoslukMM", JVal::num(d.ucBoslukMM)); JVal c = JVal::arr(); for (double v : d.centikArtikMM) c.push(JVal::num(std::isinf(v) ? -1 : v)); x.set("centikArtikMM", c); ds.push(x); }
    o.set("dikisler", ds);
    JVal rs_ = JVal::arr();
    for (const HalkaSatir& h : halkalar) { JVal x = JVal::obj(); x.set("ring", JVal::str(h.ring)); x.set("role", JVal::str(h.role)); x.set("toplamMM", JVal::num(h.toplamMM)); x.set("kapanmaMM", JVal::num(h.kapanmaMM)); x.set("enKotuKavsak", JVal::str(h.enKotuKavsak)); x.set("gecti", JVal::boolean(h.gecti)); x.set("kavsaklar", JVal::str(h.kavsaklar)); rs_.push(x); }
    o.set("halkalar", rs_);
    JVal ps = JVal::arr();
    for (const PanelPoz& p : pozlar) { JVal x = JVal::obj(); x.set("panel", JVal::str(p.panel)); x.set("yerlesti", JVal::boolean(p.yerlesti)); x.set("a", JVal::num(p.a)); x.set("b", JVal::num(p.b)); x.set("c", JVal::num(p.c)); x.set("d", JVal::num(p.d)); x.set("tx", JVal::num(p.tx)); x.set("ty", JVal::num(p.ty)); x.set("ayna", JVal::boolean(p.ayna)); x.set("yerlestiren", JVal::str(p.yerlestiren)); x.set("alanMM2", JVal::num(p.alanMM2)); x.set("cevreMM", JVal::num(p.cevreMM)); ps.push(x); }
    o.set("pozlar", ps);
    return o;
}

std::string DogrulamaRaporu::toMarkdown() const {
    std::string m;
    m += "# Dikilebilirlik — " + grafId + " @ " + bodyId + (onArkaEsit ? " (on/arka esit)" : "") + "\n\n";
    m += std::string("**Sonuc: ") + (dikilebilir() ? "DIKILEBILIR" : "DIKILEBILIR DEGIL") + "** — kirmizi hukum " + std::to_string(kirmizi()) + " / " + std::to_string(hukumler.size()) + " satir.\n\n";
    m += "## Esikler (contract/graf-v1.json toleranslar)\n\n| tolerans | mm | kaynak |\n|---|---|---|\n";
    for (const ToleransSatir& t : toleranslar) m += "| " + t.ad + " | " + f2(t.deger) + " | " + t.kaynak + " |\n";
    m += "\n## Uydurma (grafin notes'unda DOGRULANMADI — HEDEF §2: uydurdugunu soyle)\n\n";
    if (uydurmalar.empty()) m += "- yok\n";
    for (const std::string& u : uydurmalar) m += "- " + u + "\n";
    m += "\n## Dikisler\n\n| dikis | reverse | a (mm) | hedef = ratio x b + ease | artik (mm) | uc boslugu (bilgi) | centik sapma (mm) | hukum |\n|---|---|---|---|---|---|---|---|\n";
    for (const DikisSatir& d : dikisler) {
        std::string c; for (double v : d.centikArtikMM) { if (!c.empty()) c += ", "; c += std::isinf(v) ? "yok" : f2(v); }
        m += "| " + d.seam + " | " + (d.reverse ? "true" : "false") + " | " + f2(d.lenA) + " | " + f2(d.hedefA) + " (b " + f2(d.lenB) + ") | " + f2(d.artikMM) + " | " + f2(d.ucBoslukMM) + " | " + (c.empty() ? "-" : c) + " | " + (d.gecti ? "gecti" : "KIRMIZI") + " |\n";
    }
    m += "\n## Halkalar (sanal dikis)\n\n| halka | rol | toplam (mm) | kapanma (mm) | kavsaklar | hukum |\n|---|---|---|---|---|---|\n";
    for (const HalkaSatir& h : halkalar) m += "| " + h.ring + " | " + h.role + " | " + f2(h.toplamMM) + " | " + f2(h.kapanmaMM) + " | " + h.kavsaklar + " | " + (h.gecti ? "gecti" : "KIRMIZI") + " |\n";
    m += "\n## Paneller (2B yerlestirme, bilgi)\n\n| panel | yerlesti | dikis | theta (deg) | ayna | t (mm) | alan (cm2) | cevre (mm) |\n|---|---|---|---|---|---|---|---|\n";
    for (const PanelPoz& p : pozlar) m += "| " + p.panel + " | " + (p.yerlesti ? "evet" : "HAYIR") + " | " + p.yerlestiren + " | " + f2(std::atan2(p.c, p.a) * 180.0 / M_PI) + " | " + (p.ayna ? "evet" : "-") + " | (" + f2(p.tx) + ", " + f2(p.ty) + ") | " + f2(p.alanMM2 / 100.0) + " | " + f2(p.cevreMM) + " |\n";
    m += "\n## Hukumler\n\n| kural | hedef | deger | sonuc |\n|---|---|---|---|\n";
    for (const Hukum& h : hukumler) m += "| " + h.kural + " | " + h.hedef + " | " + h.deger + " | " + (h.bilgi ? "bilgi" : (h.gecti ? "gecti" : "KIRMIZI")) + " |\n";
    return m;
}

} // namespace graf
} // namespace stitchu
