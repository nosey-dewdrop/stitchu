// grafop.cpp — GRAF OP'LARI. Bkz. grafop.hpp. Her op: (1) hedefi adiyla bul, yoksa reddet;
// (2) yalniz hedef paneli/dikisi degistir; (3) kaydi ekle.
#include "grafop.hpp"

#include "solver_utils.hpp"   // 2026-09-08: pens agzi kisit cozucusuyle cozulur (Damla karari (a))

#include <algorithm>
#include <cmath>
#include <limits>
#include <stdexcept>

namespace stitchu {
namespace graf {

OpCtx OpCtx::fromContract(const JVal& contract) {
    OpCtx c;
    const double nan = std::numeric_limits<double>::quiet_NaN();
    c.ratioMin = c.ratioMax = c.flareMin = c.flareMax = c.fitDMaxMM = c.fitTolMM = nan;
    const JVal* ar = contract.get("araliklar");
    if (!ar) return c;
    auto rng = [&](const char* k, double& lo, double& hi) {
        const JVal* v = ar->get(k);
        if (!v) return;
        const JVal* a = v->get("aralik");
        if (a && a->isArr() && a->a.size() == 2 && a->a[0].isNum() && a->a[1].isNum()) { lo = a->a[0].n; hi = a->a[1].n; }
    };
    rng("ratio", c.ratioMin, c.ratioMax);
    rng("flareFactor", c.flareMin, c.flareMax);
    if (const JVal* cz = contract.get("cozucu")) if (const JVal* fl = cz->get("fitLength")) {
        const JVal* a = fl->get("dMaxMM"); const JVal* b = fl->get("tolMM");
        if (a) c.fitDMaxMM = a->numOr("deger", nan);
        if (b) c.fitTolMM = b->numOr("deger", nan);
    }
    c.dolu = !std::isnan(c.ratioMin) && !std::isnan(c.ratioMax) && !std::isnan(c.flareMin) && !std::isnan(c.flareMax) &&
             !std::isnan(c.fitDMaxMM) && !std::isnan(c.fitTolMM);
    return c;
}

namespace {
OpResult fail(const std::string& m) { OpResult r; r.ok = false; r.hata = m; return r; }
OpResult done(Garment g, const std::string& op, const JVal& args) {
    g.ops.push_back({op, args});
    OpResult r; r.ok = true; r.g = std::move(g); return r;
}
bool needS(const JVal& a, const char* k, std::string& out, std::string& err) {
    const JVal* v = a.get(k);
    if (!v || !v->isStr()) { err = std::string("arg '") + k + "' eksik ya da metin degil"; return false; }
    out = v->s; return true;
}
bool needN(const JVal& a, const char* k, double& out, std::string& err) {
    const JVal* v = a.get(k);
    if (!v || !v->isNum()) { err = std::string("arg '") + k + "' eksik ya da sayi degil"; return false; }
    out = v->n; return true;
}
bool needP(const JVal& a, const char* k, RefPoint& out, std::string& err) {
    const JVal* v = a.get(k);
    if (!v) { err = std::string("arg '") + k + "' eksik"; return false; }
    if (!fromJSON(*v, out, err)) { err = std::string("arg '") + k + "': " + err; return false; }
    return true;
}
std::string refStr(const std::string& p, const std::string& e) { return p + "/" + e; }

// Dikislerde (panel, edge) referansini yeni panele tasi (split sonrasi)
void retarget(Garment& g, const std::string& oldPanel, const std::string& edgeId, const std::string& newPanel) {
    for (Seam& s : g.seams) {
        for (EdgeRef& r : s.a) if (r.panel == oldPanel && r.edge == edgeId) r.panel = newPanel;
        for (EdgeRef& r : s.b) if (r.panel == oldPanel && r.edge == edgeId) r.panel = newPanel;
    }
    for (Ring& ri : g.rings) for (EdgeRef& r : ri.edges) if (r.panel == oldPanel && r.edge == edgeId) r.panel = newPanel;
}

// Kenar KUMESINI k kat buyut (buzgu/klos): tek homoteti, merkez kumenin tekil koselerinin afin
// ortalamasi (tek kenarda kiris orta noktasi). Kat kenarina dayanan kume x=0 etrafinda yalniz x'te
// olceklenir. Tek homoteti oldugu icin HER kenarin yay uzunlugu tam k kat olur (egri dahil);
// komsu kenarlarin paylasilan koseleri birlikte tasinir. Iki komsu kenari ayri ayri olceklemek
// ortak koseyi iki kez tasirdi — bu yuzden kume tek seferde.
void scaleEdges(Panel& p, const std::vector<int>& idxs, double k) {
    bool foldAnchored = false;
    std::vector<RefPoint> verts;
    for (int idx : idxs) {
        const Edge& e = p.edges[idx];
        if (p.onFold && (e.from.xSifir() || e.to.xSifir())) foldAnchored = true;
        for (const RefPoint* q : {&e.from, &e.to}) {
            bool dup = false; for (const RefPoint& v : verts) if (v == *q) dup = true;
            if (!dup) verts.push_back(*q);
        }
    }
    std::vector<std::pair<double, RefPoint>> terms;
    for (const RefPoint& v : verts) terms.emplace_back(1.0 / verts.size(), v);
    const RefPoint c = affine(terms);
    auto tr = [&](const RefPoint& q) -> RefPoint {
        if (foldAnchored) return scaleX(q, k);
        return affine({{k, q}, {1.0 - k, c}});
    };
    const size_t n = p.edges.size();
    std::vector<std::pair<size_t, RefPoint>> newVerts;   // once eski degerlerden hesapla, sonra yaz
    for (int idx : idxs) {
        const Edge& e = p.edges[idx];
        newVerts.emplace_back(static_cast<size_t>(idx), tr(e.from));
        newVerts.emplace_back((static_cast<size_t>(idx) + 1) % n, tr(e.to));
    }
    for (int idx : idxs) for (RefPoint& cp : p.edges[idx].control) cp = tr(cp);
    for (const auto& nv : newVerts) p.setVertex(nv.first, nv.second);
}
void scaleEdge(Panel& p, int idx, double k) { scaleEdges(p, {idx}, k); }
// Bu kenari tasiyan dikislerin oranini guncelle: a tarafi buzulen taraf (ratio >= 1)
void bumpSeamRatio(Garment& g, const std::string& panel, const std::string& edge, double k) {
    for (Seam& s : g.seams) {
        bool inA = false, inB = false;
        for (const EdgeRef& r : s.a) if (r.panel == panel && r.edge == edge) inA = true;
        for (const EdgeRef& r : s.b) if (r.panel == panel && r.edge == edge) inB = true;
        if (!inA && !inB) continue;
        if (inA) s.ratio *= k; else s.ratio /= k;
        if (s.ratio < 1.0 - 1e-12) { std::swap(s.a, s.b); s.ratio = 1.0 / s.ratio; }
    }
}
bool checkRatio(double r, const OpCtx& ctx, const char* ad, std::string& err) {
    if (!ctx.dolu) { err = std::string(ad) + ": contract araliklari yuklenmedi (OpCtx bos)"; return false; }
    if (!(r >= ctx.ratioMin && r <= ctx.ratioMax)) {
        err = std::string(ad) + ": oran " + fmtNum(r) + " araligin disinda [" + fmtNum(ctx.ratioMin) + ", " + fmtNum(ctx.ratioMax) + "]";
        return false;
    }
    return true;
}

// ---------------------------------------------------------------- op govdeleri (JSON arg)
OpResult opSubdivide(const Garment& g0, const JVal& a, const OpCtx&) {
    std::string pid, eid, err;
    if (!needS(a, "panel", pid, err) || !needS(a, "edge", eid, err)) return fail("subdivide: " + err);
    const JVal* fr = a.get("fractions");
    if (!fr || !fr->isArr() || fr->a.empty()) return fail("subdivide: fractions eksik");
    std::vector<double> fs; for (const JVal& v : fr->a) { if (!v.isNum()) return fail("subdivide: kesir sayi degil"); fs.push_back(v.n); }
    Garment g = g0;
    Panel* p = g.panel(pid); if (!p) return fail("subdivide: panel yok " + pid);
    const int idx = p->edgeIndex(eid); if (idx < 0) return fail("subdivide: kenar yok " + refStr(pid, eid));
    std::vector<Edge> parts;
    try { parts = p->edges[idx].subdivide(fs); } catch (const std::exception& ex) { return fail(std::string("subdivide: ") + ex.what()); }
    for (const Edge& pe : parts) if (p->edgeIndex(pe.id) >= 0) return fail("subdivide: uretilen kenar id catisiyor " + pe.id);
    p->edges.erase(p->edges.begin() + idx);
    p->edges.insert(p->edges.begin() + idx, parts.begin(), parts.end());
    // Dikis/halka referanslari: bolunen kenar yerine parcalari (sirayla)
    auto expand = [&](std::vector<EdgeRef>& refs) {
        for (size_t i = 0; i < refs.size(); ++i) {
            if (refs[i].panel != pid || refs[i].edge != eid) continue;
            std::vector<EdgeRef> nw; for (const Edge& pe : parts) nw.push_back({pid, pe.id});
            refs.erase(refs.begin() + i);
            refs.insert(refs.begin() + i, nw.begin(), nw.end());
            i += nw.size() - 1;
        }
    };
    for (Seam& s : g.seams) { expand(s.a); expand(s.b); }
    for (Ring& r : g.rings) expand(r.edges);
    return done(g, "subdivide", a);
}

OpResult opSuppress(const Garment& g0, const JVal& a, const OpCtx&) {
    std::string pid, eid, legId, err; double at, intake; RefPoint apex;
    if (!needS(a, "panel", pid, err) || !needS(a, "edge", eid, err) || !needN(a, "atFraction", at, err) ||
        !needN(a, "intakeFraction", intake, err) || !needP(a, "apex", apex, err) || !needS(a, "legId", legId, err)) return fail("suppress: " + err);
    const bool trueLegs = a.boolOr("trueLegs", true);   // primitives-v1 op.suppress.trueLegs varsayilan true
    if (a.has("trueLegs") && !a.get("trueLegs")->isBool()) return fail("suppress: trueLegs bool degil");
    if (!(intake > 0.0 && intake < 1.0)) return fail("suppress: intakeFraction (0,1) disinda " + fmtNum(intake));
    const double f0 = at - intake / 2.0, f1 = at + intake / 2.0;
    if (!(f0 > 0.0 && f1 < 1.0)) return fail("suppress: pens agzi kenarin disina tasiyor [" + fmtNum(f0) + ", " + fmtNum(f1) + "]");
    Garment g = g0;
    Panel* p = g.panel(pid); if (!p) return fail("suppress: panel yok " + pid);
    const int idx = p->edgeIndex(eid); if (idx < 0) return fail("suppress: kenar yok " + refStr(pid, eid));
    if (p->edges[idx].kind == "fold" || p->edges[idx].kind == "dartLeg") return fail("suppress: " + p->edges[idx].kind + " kenarina pens acilmaz");
    if (p->edgeIndex(legId + ".1") >= 0 || p->edgeIndex(legId + ".2") >= 0) return fail("suppress: bacak id catisiyor " + legId);
    std::vector<Edge> parts;
    try { parts = p->edges[idx].subdivide({f0, f1}); } catch (const std::exception& ex) { return fail(std::string("suppress: ") + ex.what()); }
    // parts[0] sol, parts[1] pens agzi (atilir), parts[2] sag
    if (trueLegs) {
        // apeks agzin dik ortayinda: x agiz orta noktasinin terimlerinden, y verilen apeksten (tek terim olmali)
        if (!apex.tekTerim()) return fail("suppress: trueLegs icin apeks tek landmark terimi olmali (y'si okunur)");
        const Anchor ay = apex.terms[0].a;
        RefPoint mid = lerp(parts[1].from, parts[1].to, 0.5);
        for (Term& t : mid.terms) {
            t.a.yLandmark = ay.yLandmark.empty() ? ay.landmark : ay.yLandmark;
            t.a.yLandmark2 = ay.yLandmark2; t.a.yLerp = ay.yLerp; t.a.yOffsetMM = ay.yOffsetMM;
        }
        mid.normalize();
        apex = mid;
    }
    Edge leg1; leg1.id = legId + ".1"; leg1.kind = "dartLeg"; leg1.from = parts[1].from; leg1.to = apex;
    Edge leg2; leg2.id = legId + ".2"; leg2.kind = "dartLeg"; leg2.from = apex; leg2.to = parts[1].to;
    // sol ve sag parcalar orijinal kenarin adini ve rolunu korur (id .1/.2 ile), agiz parcasi kaybolur:
    Edge sol = parts[0], sag = parts[2];
    sol.rolePart = parts[0].rolePart; sag.rolePart = parts[2].rolePart;
    if (p->edgeIndex(sol.id) >= 0 || p->edgeIndex(sag.id) >= 0) return fail("suppress: uretilen kenar id catisiyor");
    p->edges.erase(p->edges.begin() + idx);
    std::vector<Edge> ins = {sol, leg1, leg2, sag};
    p->edges.insert(p->edges.begin() + idx, ins.begin(), ins.end());
    auto expand = [&](std::vector<EdgeRef>& refs) {
        for (size_t i = 0; i < refs.size(); ++i) {
            if (refs[i].panel != pid || refs[i].edge != eid) continue;
            std::vector<EdgeRef> nw = {{pid, sol.id}, {pid, sag.id}};
            refs.erase(refs.begin() + i);
            refs.insert(refs.begin() + i, nw.begin(), nw.end());
            i += 1;
        }
    };
    for (Seam& s : g.seams) { expand(s.a); expand(s.b); }
    for (Ring& r : g.rings) expand(r.edges);
    return done(g, "suppress", a);
}

OpResult opGather(const Garment& g0, const JVal& a, const OpCtx& ctx) {
    std::string pid, eid, err; double ratio;
    if (!needS(a, "panel", pid, err) || !needS(a, "edge", eid, err) || !needN(a, "ratio", ratio, err)) return fail("gather: " + err);
    if (!checkRatio(ratio, ctx, "gather", err)) return fail(err);
    Garment g = g0;
    Panel* p = g.panel(pid); if (!p) return fail("gather: panel yok " + pid);
    const int idx = p->edgeIndex(eid); if (idx < 0) return fail("gather: kenar yok " + refStr(pid, eid));
    if (p->edges[idx].kind == "fold") return fail("gather: kat kenari buzulmez " + eid);
    scaleEdge(*p, idx, ratio);
    p->edges[idx].gatherRatio *= ratio;
    bumpSeamRatio(g, pid, eid, ratio);
    return done(g, "gather", a);
}

OpResult opFlare(const Garment& g0, const JVal& a, const OpCtx& ctx) {
    std::string pid, eid, err; double k;
    if (!needS(a, "panel", pid, err) || !needS(a, "edge", eid, err) || !needN(a, "factor", k, err)) return fail("flare: " + err);
    if (!ctx.dolu) return fail("flare: contract araliklari yuklenmedi");
    if (!(k >= ctx.flareMin && k <= ctx.flareMax)) return fail("flare: katsayi " + fmtNum(k) + " araligin disinda [" + fmtNum(ctx.flareMin) + ", " + fmtNum(ctx.flareMax) + "]");
    Garment g = g0;
    Panel* p = g.panel(pid); if (!p) return fail("flare: panel yok " + pid);
    const int idx = p->edgeIndex(eid); if (idx < 0) return fail("flare: kenar yok " + refStr(pid, eid));
    if (p->edges[idx].kind != "cut") return fail("flare: yalniz serbest (cut) kenar aciliyor; " + eid + " kind=" + p->edges[idx].kind + " — dikisli kenar icin gather");
    for (const Seam& s : g.seams) for (const EdgeRef& r : s.a) if (r.panel == pid && r.edge == eid) return fail("flare: kenar bir dikiste " + s.id);
    scaleEdge(*p, idx, k);
    return done(g, "flare", a);
}

OpResult opExtendImpl(const Garment& g0, const JVal& a, const char* ad, double sign) {
    std::string pid, eid, err; double d;
    if (!needS(a, "panel", pid, err) || !needS(a, "edge", eid, err) || !needN(a, "deltaMM", d, err)) return fail(std::string(ad) + ": " + err);
    if (sign < 0 && d < 0) return fail(std::string(ad) + ": deltaMM negatif; kisaltma pozitif mm alir");
    Garment g = g0;
    Panel* p = g.panel(pid); if (!p) return fail(std::string(ad) + ": panel yok " + pid);
    const int idx = p->edgeIndex(eid); if (idx < 0) return fail(std::string(ad) + ": kenar yok " + refStr(pid, eid));
    Edge& e = p->edges[idx];
    const double dy = sign * d;
    const RefPoint nf = shiftY(e.from, dy), nt = shiftY(e.to, dy);
    for (RefPoint& c : e.control) c = shiftY(c, dy);
    const size_t n = p->edges.size();
    p->setVertex(static_cast<size_t>(idx), nf);
    p->setVertex((static_cast<size_t>(idx) + 1) % n, nt);
    return done(g, ad, a);
}
OpResult opExtend(const Garment& g, const JVal& a, const OpCtx&) { return opExtendImpl(g, a, "extend", +1.0); }
OpResult opShorten(const Garment& g, const JVal& a, const OpCtx&) { return opExtendImpl(g, a, "shorten", -1.0); }

OpResult opExtendTo(const Garment& g0, const JVal& a, const OpCtx&) {
    std::string pid, eid, lm, err; double yo = 0;
    if (!needS(a, "panel", pid, err) || !needS(a, "edge", eid, err) || !needS(a, "yLandmark", lm, err)) return fail("extendTo: " + err);
    yo = a.numOr("yOffsetMM", 0.0);
    Garment g = g0;
    Panel* p = g.panel(pid); if (!p) return fail("extendTo: panel yok " + pid);
    const int idx = p->edgeIndex(eid); if (idx < 0) return fail("extendTo: kenar yok " + refStr(pid, eid));
    Edge& e = p->edges[idx];
    auto retg = [&](RefPoint q) { for (Term& t : q.terms) { t.a.yLandmark = lm; t.a.yLandmark2.clear(); t.a.yLerp = 0; t.a.yOffsetMM = yo; } q.normalize(); return q; };
    const RefPoint nf = retg(e.from), nt = retg(e.to);
    for (RefPoint& c : e.control) c = retg(c);
    const size_t n = p->edges.size();
    p->setVertex(static_cast<size_t>(idx), nf);
    p->setVertex((static_cast<size_t>(idx) + 1) % n, nt);
    return done(g, "extendTo", a);
}

OpResult opSplit(const Garment& g0, const JVal& a, const OpCtx& ctx) {
    std::string pid, vA, vB, pA, pB, sid, err; double ratio = 1.0;
    if (!needS(a, "panel", pid, err) || !needS(a, "vertexA", vA, err) || !needS(a, "vertexB", vB, err) ||
        !needS(a, "panelA", pA, err) || !needS(a, "panelB", pB, err) || !needS(a, "seam", sid, err)) return fail("split: " + err);
    ratio = a.numOr("seamRatio", 1.0);
    if (!checkRatio(ratio, ctx, "split", err)) return fail(err);
    if (pA == pB || pA == pid || pB == pid) return fail("split: yeni panel id'leri farkli ve eskiden farkli olmali");
    if (g0.panel(pA) || g0.panel(pB)) return fail("split: panel id zaten var");
    if (g0.seam(sid)) return fail("split: dikis id zaten var " + sid);
    const Panel* src = g0.panel(pid); if (!src) return fail("split: panel yok " + pid);
    const int iA = src->edgeIndex(vA), iB = src->edgeIndex(vB);
    if (iA < 0 || iB < 0) return fail("split: kose (kenar baslangici) yok " + vA + " / " + vB);
    if (iA == iB) return fail("split: iki kose ayni");
    const int n = static_cast<int>(src->edges.size());
    if ((iA + 1) % n == iB || (iB + 1) % n == iA) return fail("split: kesim mevcut kenarla cakisiyor (" + vA + "-" + vB + " komsu koseler)");
    const RefPoint A = src->edges[iA].from, B = src->edges[iB].from;
    Panel P1 = *src, P2 = *src;
    P1.id = pA; P2.id = pB; P1.edges.clear(); P2.edges.clear();
    for (int i = iA; i != iB; i = (i + 1) % n) P1.edges.push_back(src->edges[i]);
    for (int i = iB; i != iA; i = (i + 1) % n) P2.edges.push_back(src->edges[i]);
    Edge cut1; cut1.id = sid + ".a"; cut1.kind = "seam"; cut1.from = B; cut1.to = A;
    Edge cut2; cut2.id = sid + ".b"; cut2.kind = "seam"; cut2.from = A; cut2.to = B;
    P1.edges.push_back(cut1); P2.edges.push_back(cut2);
    auto hasFold = [](const Panel& p) { for (const Edge& e : p.edges) if (e.kind == "fold") return true; return false; };
    P1.onFold = hasFold(P1); P2.onFold = hasFold(P2);
    P1.reason = src->reason.empty() ? ("split of " + pid) : (src->reason + " | split of " + pid);
    P2.reason = P1.reason;
    Garment g = g0;
    // referanslar: eski panelden yeni panellere
    for (const Edge& e : P1.edges) retarget(g, pid, e.id, pA);
    for (const Edge& e : P2.edges) retarget(g, pid, e.id, pB);
    // eski paneli yerinde degistir (sira korunur): P1 eskinin yerine, P2 hemen arkasina
    for (size_t i = 0; i < g.panels.size(); ++i) if (g.panels[i].id == pid) {
        g.panels[i] = P1; g.panels.insert(g.panels.begin() + static_cast<long>(i) + 1, P2); break;
    }
    // cut1 = B->A (P1), cut2 = A->B (P2): a'nin basi (B) b'nin SONUYLA dikilir -> reverse=true (karar 7).
    // 2026-09-09 olculdu: reverse=false ile zincir cozucu yan dikisi ve bel/gogus halkalarini bolme
    // noktasinda "tepe paylasmiyor" diye KOPUK sayiyordu (foto 3, gogus alti kesme).
    Seam s; s.id = sid; s.a = {{pA, cut1.id}}; s.b = {{pB, cut2.id}}; s.reverse = true; s.ratio = 1.0; s.reason = "split of " + pid;
    g.seams.push_back(s);
    if (ratio != 1.0) {
        Panel* q = g.panel(pA);
        scaleEdge(*q, q->edgeIndex(cut1.id), ratio);
        q->edges[q->edgeIndex(cut1.id)].gatherRatio *= ratio;
        bumpSeamRatio(g, pA, cut1.id, ratio);
    }
    return done(g, "split", a);
}

OpResult opOverlay(const Garment& g0, const JVal& a, const OpCtx& ctx) {
    std::string host, np, sp, err; double r;
    if (!needS(a, "host", host, err) || !needN(a, "excessRatio", r, err) || !needS(a, "panel", np, err) || !needS(a, "seamPrefix", sp, err)) return fail("overlay: " + err);
    const JVal* es = a.get("edges");
    if (!es || !es->isArr() || es->a.empty()) return fail("overlay: edges eksik");
    if (!checkRatio(r, ctx, "overlay", err)) return fail(err);
    if (g0.panel(np)) return fail("overlay: panel id zaten var " + np);
    const Panel* h = g0.panel(host); if (!h) return fail("overlay: konak panel yok " + host);
    Panel q = *h; q.id = np; q.reason = "overlay of " + host;
    Garment g = g0;
    std::vector<int> idxs;
    for (const JVal& ev : es->a) {
        if (!ev.isStr()) return fail("overlay: kenar id metin degil");
        const int idx = q.edgeIndex(ev.s); if (idx < 0) return fail("overlay: konak kenari yok " + refStr(host, ev.s));
        if (q.edges[idx].kind == "fold") return fail("overlay: kat kenari buzulmez " + ev.s);
        idxs.push_back(idx);
        Seam s; s.id = sp + "." + ev.s; s.a = {{np, ev.s}}; s.b = {{host, ev.s}}; s.ratio = r; s.reason = "overlay " + np + " -> " + host;
        if (g.seam(s.id)) return fail("overlay: dikis id zaten var " + s.id);
        g.seams.push_back(s);
    }
    scaleEdges(q, idxs, r);   // tek homoteti: kume birlikte buyur, her kenar tam r kat
    for (int idx : idxs) q.edges[idx].gatherRatio *= r;
    g.panels.push_back(q);
    return done(g, "overlay", a);
}

OpResult opAttach(const Garment& g0, const JVal& a, const OpCtx& ctx) {
    std::string hp, he, ne, sid, err; double r;
    if (!needS(a, "hostPanel", hp, err) || !needS(a, "hostEdge", he, err) || !needS(a, "edge", ne, err) ||
        !needN(a, "ratio", r, err) || !needS(a, "seam", sid, err)) return fail("attach: " + err);
    const JVal* pj = a.get("panel"); if (!pj) return fail("attach: panel eksik");
    Panel np; if (!fromJSON(*pj, np, err)) return fail("attach: panel: " + err);
    std::string why; if (!np.closed(&why)) return fail("attach: yeni panel kapali degil: " + why);
    if (g0.panel(np.id)) return fail("attach: panel id zaten var " + np.id);
    if (g0.seam(sid)) return fail("attach: dikis id zaten var " + sid);
    if (!g0.edge({hp, he})) return fail("attach: konak kenari yok " + refStr(hp, he));
    if (!np.edge(ne)) return fail("attach: yeni panelde kenar yok " + ne);
    if (!checkRatio(r >= 1.0 ? r : 1.0 / r, ctx, "attach", err)) return fail(err);
    Garment g = g0;
    g.panels.push_back(np);
    Seam s; s.id = sid; s.reason = "attach " + np.id + " -> " + hp;
    if (r >= 1.0) { s.a = {{np.id, ne}}; s.b = {{hp, he}}; s.ratio = r; }
    else { s.a = {{hp, he}}; s.b = {{np.id, ne}}; s.ratio = 1.0 / r; }
    g.seams.push_back(s);
    return done(g, "attach", a);
}

OpResult opReshapeEdge(const Garment& g0, const JVal& a, const OpCtx&) {
    std::string pid, eid, err;
    if (!needS(a, "panel", pid, err) || !needS(a, "edge", eid, err)) return fail("reshapeEdge: " + err);
    Garment g = g0;
    Panel* p = g.panel(pid); if (!p) return fail("reshapeEdge: panel yok " + pid);
    const int idx = p->edgeIndex(eid); if (idx < 0) return fail("reshapeEdge: kenar yok " + refStr(pid, eid));
    Edge& e = p->edges[idx];
    bool any = false;
    if (a.has("from")) { RefPoint q; if (!needP(a, "from", q, err)) return fail("reshapeEdge: " + err); p->setVertex(static_cast<size_t>(idx), q); any = true; }
    if (a.has("to")) { RefPoint q; if (!needP(a, "to", q, err)) return fail("reshapeEdge: " + err); p->setVertex((static_cast<size_t>(idx) + 1) % p->edges.size(), q); any = true; }
    if (const JVal* c = a.get("control")) {
        if (!c->isArr()) return fail("reshapeEdge: control dizi degil");
        std::vector<RefPoint> ctl;
        for (const JVal& v : c->a) { RefPoint q; if (!fromJSON(v, q, err)) return fail("reshapeEdge control: " + err); ctl.push_back(q); }
        if (!(ctl.empty() || ctl.size() == 2)) return fail("reshapeEdge: control 0 ya da 2 nokta");
        e.control = ctl; any = true;
    }
    // kind / finish (2026-09-09, Damla karari: primitif kumesi geometri emirleridir; "kenari yeniden
    // yaz" kenarin TURUNU de yazar — kat kenarinin bir bolumu serbest kenar olur (yarik), serbest
    // kenar dikise girer). dartLeg yalniz suppress uretir, burada yazilamaz.
    if (a.has("kind")) {
        std::string k; if (!needS(a, "kind", k, err)) return fail("reshapeEdge: " + err);
        if (k != "cut" && k != "seam" && k != "fold") return fail("reshapeEdge: kind '" + k + "' yazilamaz (cut|seam|fold; dartLeg yalniz suppress)");
        if (e.kind == "dartLeg") return fail("reshapeEdge: dartLeg kenarinin turu degistirilmez " + eid);
        e.kind = k;
        if (k != "cut") e.finish.clear();
        any = true;
    }
    if (a.has("finish")) {
        std::string f; if (!needS(a, "finish", f, err)) return fail("reshapeEdge: " + err);
        if (e.kind != "cut") return fail("reshapeEdge: finish yalniz cut kenara yazilir; " + eid + " kind=" + e.kind);
        e.finish = f; any = true;
    }
    if (e.kind == "cut" && e.finish.empty()) return fail("reshapeEdge: cut kenarinin finish gerekcesi zorunlu " + eid);
    bool foldVar = false; for (const Edge& x : p->edges) if (x.kind == "fold") foldVar = true;
    if (p->onFold && !foldVar) { p->onFold = false; if (p->cutCount < 2) p->cutCount = 2; }
    if (!p->onFold && foldVar) p->onFold = true;
    if (!any) return fail("reshapeEdge: from/to/control/kind/finish'ten en az biri gerekli");
    return done(g, "reshapeEdge", a);
}

// ---------------------------------------------------------------- 2026-09-09 primitifler (Damla karari)
// Kume geometri emirleridir, giysi adi icermez: kes(split) uzat(extend/extendTo) kisalt(shorten)
// genislet(flare) kenari-yeniden-yaz(reshapeEdge) panel-ekle(addPanel) panel-birlestir(merge)
// dik(sew) toplama(gather) kapanma(closure) pens(suppress) ayna(mirror) + panel-kaldir(drop).
// A3 olcumu: bes okumanin tasidigi bilgi motora giremiyordu cunku "dik", "birlestir", "panel ekle"
// ve "kaldir" yoktu; sozluk (setNeckline/addPatch...) ACILMADI, eksik primitifler yazildi.

bool refListesi(const JVal* v, std::vector<EdgeRef>& out, std::string& err) {
    if (!v || !v->isArr() || v->a.empty()) { err = "kenar listesi eksik ya da bos"; return false; }
    for (const JVal& r : v->a) {
        std::string p, e;
        if (!needS(r, "panel", p, err) || !needS(r, "edge", e, err)) return false;
        out.push_back({p, e});
    }
    return true;
}
void katDurumunuGuncelle(Panel& p) {
    bool foldVar = false; for (const Edge& x : p.edges) if (x.kind == "fold") foldVar = true;
    if (p.onFold && !foldVar) { p.onFold = false; if (p.cutCount < 2) p.cutCount = 2; }
    if (!p.onFold && foldVar) p.onFold = true;
}

// DIK: mevcut kenarlari yeni bir dikiste birlestirir. fold -> seam (kat acilir, parca 2 kesilir),
// cut -> seam (finish silinir). Ayni kenar iki tarafta da olabilir (kendi ayna kopyasiyla dikis:
// on/arka orta kapanma); dogrulayici bunu yalniz closure ilan edilince kabul eder.
OpResult opSew(const Garment& g0, const JVal& a, const OpCtx& ctx) {
    std::string sid, err; std::vector<EdgeRef> A, B;
    if (!needS(a, "seam", sid, err)) return fail("sew: " + err);
    if (!refListesi(a.get("a"), A, err)) return fail("sew a: " + err);
    if (!refListesi(a.get("b"), B, err)) return fail("sew b: " + err);
    const JVal* rv = a.get("reverse");
    if (!rv || !rv->isBool()) return fail("sew: reverse (bool) zorunlu — a'nin basi b'nin hangi ucuyla dikiliyor, sessiz varsayim yok");
    const double ratio = a.numOr("ratio", 1.0);
    if (!checkRatio(ratio, ctx, "sew", err)) return fail(err);
    if (g0.seam(sid)) return fail("sew: dikis id zaten var " + sid);
    Garment g = g0;
    std::vector<std::string> paneller;
    for (const std::vector<EdgeRef>* side : {&A, &B}) for (const EdgeRef& r : *side) {
        Panel* p = g.panel(r.panel); Edge* e = p ? p->edge(r.edge) : nullptr;
        if (!e) return fail("sew: kenar yok " + refStr(r.panel, r.edge));
        if (e->kind == "dartLeg") return fail("sew: pens bacagi dikise girmez " + refStr(r.panel, r.edge));
        e->kind = "seam"; e->finish.clear();
        bool var = false; for (const std::string& q : paneller) if (q == r.panel) var = true;
        if (!var) paneller.push_back(r.panel);
    }
    for (const std::string& pid : paneller) katDurumunuGuncelle(*g.panel(pid));
    Seam s; s.id = sid; s.a = A; s.b = B; s.reverse = rv->b; s.ratio = ratio; s.easeMM = a.numOr("easeMM", 0.0);
    s.reason = "sew";
    g.seams.push_back(s);
    return done(g, "sew", a);
}

// PANEL EKLE: kapali yeni panel. onto verilirse panel KONAK panelin yuzune dikilir (aplike/ust-dikis);
// kenarlari dikise girmez, komsuluk konak uzerinden kurulur. onto yoksa panel ancak sonraki bir
// sew ile giysiye baglanir; bagsiz kalirsa dogrulayici komsuluk_bagli ile adiyla reddeder.
OpResult opAddPanel(const Garment& g0, const JVal& a, const OpCtx&) {
    std::string err;
    const JVal* pj = a.get("panel"); if (!pj) return fail("addPanel: panel eksik");
    Panel np; if (!fromJSON(*pj, np, err)) return fail("addPanel: panel: " + err);
    std::string why; if (!np.closed(&why)) return fail("addPanel: yeni panel kapali degil: " + why);
    if (np.edges.size() < 3) return fail("addPanel: en az 3 kenar");
    if (g0.panel(np.id)) return fail("addPanel: panel id zaten var " + np.id);
    if (a.has("onto")) {
        std::string h; if (!needS(a, "onto", h, err)) return fail("addPanel: " + err);
        if (!g0.panel(h)) return fail("addPanel: konak panel yok " + h);
        np.onto = h;
    }
    for (const Edge& e : np.edges) {
        if (e.kind == "cut" && e.finish.empty()) return fail("addPanel: cut kenarinin finish gerekcesi zorunlu " + np.id + "/" + e.id);
        if (e.kind == "dartLeg") return fail("addPanel: dartLeg yalniz suppress uretir " + np.id + "/" + e.id);
    }
    katDurumunuGuncelle(np);
    Garment g = g0; g.panels.push_back(np);
    return done(g, "addPanel", a);
}

// PANEL KALDIR: panel ve ona degen HER dikis kaldirilir; o dikislerde kalan kenarlar serbest (cut)
// olur, finish zorunlu. Halka/kisit referanslari temizlenir. Kaldirilan dikisin obur tarafinda
// baska bir panel yalniz kaliyorsa bu ilan edilmez, dogrulayici komsuluk_bagli ile yakalar.
OpResult opDrop(const Garment& g0, const JVal& a, const OpCtx&) {
    std::string pid, fin, err;
    if (!needS(a, "panel", pid, err) || !needS(a, "finish", fin, err)) return fail("drop: " + err);
    if (!g0.panel(pid)) return fail("drop: panel yok " + pid);
    Garment g = g0;
    std::vector<std::string> silinenDikis;
    for (size_t i = 0; i < g.seams.size();) {
        Seam& s = g.seams[i];
        bool degiyor = false;
        for (const EdgeRef& r : s.a) if (r.panel == pid) degiyor = true;
        for (const EdgeRef& r : s.b) if (r.panel == pid) degiyor = true;
        if (!degiyor) { ++i; continue; }
        for (const std::vector<EdgeRef>* side : {&s.a, &s.b}) for (const EdgeRef& r : *side) {
            if (r.panel == pid) continue;
            Edge* e = g.edge(r); if (!e) continue;
            e->kind = "cut"; e->finish = fin;
        }
        silinenDikis.push_back(s.id);
        g.seams.erase(g.seams.begin() + static_cast<long>(i));
    }
    for (Panel& p : g.panels) for (Edge& e : p.edges)
        for (const std::string& sd : silinenDikis) if (e.fitSeam == sd) e.fitSeam.clear();
    for (size_t i = 0; i < g.rings.size();) {
        Ring& r = g.rings[i];
        for (size_t j = 0; j < r.edges.size();) { if (r.edges[j].panel == pid) r.edges.erase(r.edges.begin() + static_cast<long>(j)); else ++j; }
        if (r.edges.empty()) g.rings.erase(g.rings.begin() + static_cast<long>(i)); else ++i;
    }
    for (Panel& p : g.panels) if (p.onto == pid) return fail("drop: " + p.id + " bu panelin yuzune dikili (onto); once onu kaldir");
    for (size_t i = 0; i < g.panels.size(); ++i) if (g.panels[i].id == pid) { g.panels.erase(g.panels.begin() + static_cast<long>(i)); break; }
    return done(g, "drop", a);
}

// PANEL BIRLESTIR: iki paneli aralarindaki dikis boyunca TEK panele diker; dikis kalkar. Her panelde
// dikise giren kenarlar halkada BITISIK bir kosu olusturmali; kosunun icinde kalan pens bacaklari
// (bel pensi gibi) birlestirmeyle dusuer ve reason'a adiyla yazilir — panel modeli DIS HALKADIR, ic
// (balik) pens tasimaz; bu sinir tamlik tablosunda ilan edilir. Kavsak koseler yapisal esit olmali,
// degilse adiyla reddedilir (sessiz kaydirma yok).
OpResult opMerge(const Garment& g0, const JVal& a, const OpCtx&) {
    std::string sid, pa, pb, np, err;
    if (!needS(a, "seam", sid, err) || !needS(a, "panelA", pa, err) || !needS(a, "panelB", pb, err) || !needS(a, "panel", np, err)) return fail("merge: " + err);
    if (pa == pb) return fail("merge: iki panel ayni");
    if (g0.panel(np) && np != pa && np != pb) return fail("merge: panel id zaten var " + np);
    const Seam* s0 = g0.seam(sid); if (!s0) return fail("merge: dikis yok " + sid);
    const Panel* A = g0.panel(pa); const Panel* B = g0.panel(pb);
    if (!A || !B) return fail("merge: panel yok " + (A ? pb : pa));
    if (A->onto != B->onto) return fail("merge: biri yuze dikili (onto) biri degil");
    // her panelin bu dikisteki kenarlari
    auto refsOf = [&](const std::string& pid) { std::vector<std::string> v; for (const std::vector<EdgeRef>* side : {&s0->a, &s0->b}) for (const EdgeRef& r : *side) if (r.panel == pid) v.push_back(r.edge); return v; };
    const std::vector<std::string> rA = refsOf(pa), rB = refsOf(pb);
    if (rA.empty() || rB.empty()) return fail("merge: dikis " + sid + " iki paneli de tasimiyor (" + pa + ": " + std::to_string(rA.size()) + ", " + pb + ": " + std::to_string(rB.size()) + ")");
    // Iki panel dikisin KARSI taraflarinda ve zincirde AYNI bolgede olmali (on beden on etekle
    // dikilir, arka etekle degil): zincir konumlari orantili araliklar olarak kesismeli (reverse'e gore).
    { auto aralik = [&](const std::vector<EdgeRef>& side, const std::string& pid, double& lo, double& hi) -> bool {
          int mn = -1, mx = -1; for (size_t i = 0; i < side.size(); ++i) if (side[i].panel == pid) { if (mn < 0) mn = static_cast<int>(i); mx = static_cast<int>(i); }
          if (mn < 0 || side.empty()) return false; lo = double(mn) / side.size(); hi = double(mx + 1) / side.size(); return true; };
      double aLo, aHi, bLo, bHi; bool aInA = aralik(s0->a, pa, aLo, aHi), aInB = aralik(s0->b, pa, aLo, aHi);
      bool bInA = aralik(s0->a, pb, bLo, bHi), bInB = aralik(s0->b, pb, bLo, bHi);
      if ((aInA && bInA) || (aInB && bInB)) return fail("merge: " + pa + " ve " + pb + " dikisin AYNI tarafinda; birlestirme karsi taraflar arasinda olur");
      if (s0->reverse) { const double t = bLo; bLo = 1.0 - bHi; bHi = 1.0 - t; }
      if (aHi <= bLo + 1e-9 || bHi <= aLo + 1e-9) return fail("merge: " + pa + " ile " + pb + " dikis " + sid + " zincirinde ayni bolgede degil (" + pa + " [" + fmtNum(aLo) + "," + fmtNum(aHi) + "], " + pb + " [" + fmtNum(bLo) + "," + fmtNum(bHi) + "]); bu ikisi birbirine dikilmiyor"); }
    // kosu: dikis kenarlarini kapsayan en kisa dairesel aralik; icinde yalniz dikis kenari ya da dartLeg olabilir
    struct Kosu { std::vector<Edge> kalan; std::vector<std::string> dusen, dusenPens; };
    auto kosu = [&](const Panel& P, const std::vector<std::string>& refs, Kosu& out, std::string& why) -> bool {
        const int n = static_cast<int>(P.edges.size());
        std::vector<bool> isRef(n, false);
        for (const std::string& e : refs) { const int i = P.edgeIndex(e); if (i < 0) { why = "kenar yok " + P.id + "/" + e; return false; } isRef[i] = true; }
        // baslangic: bir ref kenari ki oncesi (dairesel) ref/dartLeg degil
        int bas = -1;
        for (int i = 0; i < n; ++i) if (isRef[i]) {
            int j = (i + n - 1) % n;
            while (j != i && !isRef[j] && P.edges[j].kind == "dartLeg") j = (j + n - 1) % n;
            if (!isRef[j]) { bas = i; break; }
        }
        if (bas < 0) { why = "dikis kenarlari panelin tamamini kapliyor " + P.id; return false; }
        int son = bas, k = bas, refSeen = 0;
        while (true) {
            if (isRef[k]) { ++refSeen; son = k; }
            else if (P.edges[k].kind == "dartLeg") { /* kosu icinde pens */ }
            else break;
            if (refSeen == static_cast<int>(refs.size())) { // kalan dartLeg'ler kosu disinda kalir
                break;
            }
            k = (k + 1) % n;
            if (k == bas) break;
        }
        if (refSeen != static_cast<int>(refs.size())) { why = "dikis kenarlari bitisik bir kosu degil " + P.id; return false; }
        for (int i = bas; ; i = (i + 1) % n) {
            if (!isRef[i]) out.dusenPens.push_back(P.edges[i].id);
            out.dusen.push_back(P.edges[i].id);
            if (i == son) break;
        }
        for (int i = (son + 1) % n; i != bas; i = (i + 1) % n) out.kalan.push_back(P.edges[i]);
        return true;
    };
    Kosu kA, kB; std::string why;
    if (!kosu(*A, rA, kA, why)) return fail("merge: " + why);
    if (!kosu(*B, rB, kB, why)) return fail("merge: " + why);
    if (kA.kalan.empty() || kB.kalan.empty()) return fail("merge: birlestirmeden sonra kenar kalmiyor");
    // kavsak: A'nin kalaninin sonu B'nin kalaninin basi; B'nin sonu A'nin basi (yapisal)
    if (kA.kalan.back().to != kB.kalan.front().from || kB.kalan.back().to != kA.kalan.front().from)
        return fail("merge: kavsak koseler yapisal esit degil (" + pa + "/" + kA.kalan.back().id + ".to vs " + pb + "/" + kB.kalan.front().id + ".from; " + pb + "/" + kB.kalan.back().id + ".to vs " + pa + "/" + kA.kalan.front().id + ".from)");
    Panel M = *A; M.id = np; M.edges.clear();
    M.reason = (A->reason.empty() ? "" : A->reason + " | ") + "merge " + pa + "+" + pb + " along " + sid;
    // Kosunun icinde kalan pens bacaklari DUSMEZ, IC HALKA PENSE donusur (2026-09-09): A'nin pens
    // cifti (agiz + yukari apeks) B'nin ayni siradaki pens ciftiyle (asagi apeks) eslesir = balik
    // pensi; agiz A'nin agzidir, B'nin apeksi agzin x'ine tasinir (xOffset yok: yalniz y landmark'i
    // B'nin apeksinden alinir, x terimleri agiz ortasindan). Esi yoksa pens ucgen kalir (apexAlt =
    // agiz ortasi) ve reason'a adiyla yazilir.
    struct PensCift { RefPoint a, b, apex; std::string ad; };
    auto pensCiftleri = [&](const Panel& P, const std::vector<std::string>& dusen) {
        std::vector<PensCift> v;
        for (size_t i = 0; i + 1 < dusen.size(); ++i) {
            const Edge* e1 = P.edge(dusen[i]); const Edge* e2 = P.edge(dusen[i + 1]);
            if (!e1 || !e2 || e1->kind != "dartLeg" || e2->kind != "dartLeg" || e1->to != e2->from) continue;
            v.push_back({e1->from, e2->to, e1->to, e1->id + "+" + e2->id}); ++i;
        }
        return v;
    };
    auto apeksYTasi = [](RefPoint agizOrta, const RefPoint& apex) {   // x agiz ortasindan, y apeksten
        if (!apex.tekTerim()) return apex;
        const Anchor ay = apex.terms[0].a;
        for (Term& t : agizOrta.terms) { t.a.yLandmark = ay.yLandmark.empty() ? ay.landmark : ay.yLandmark; t.a.yLandmark2 = ay.yLandmark2; t.a.yLerp = ay.yLerp; t.a.yOffsetMM = ay.yOffsetMM; }
        agizOrta.normalize(); return agizOrta;
    };
    { const std::vector<PensCift> pA = pensCiftleri(*A, kA.dusenPens), pB = pensCiftleri(*B, kB.dusenPens);
      for (size_t i = 0; i < pA.size(); ++i) {
          IcPens d; d.id = "ic_pens_" + std::to_string(M.darts.size() + 1); d.a = pA[i].a; d.b = pA[i].b; d.apexUst = pA[i].apex;
          const RefPoint orta = lerp(pA[i].a, pA[i].b, 0.5);
          if (i < pB.size()) { d.apexAlt = apeksYTasi(orta, pB[i].apex); M.reason += " | ic pens " + d.id + ": " + pa + "/" + pA[i].ad + " + " + pb + "/" + pB[i].ad + " (balik pensi, agiz A'nin)"; }
          else { d.apexAlt = orta; M.reason += " | ic pens " + d.id + ": " + pa + "/" + pA[i].ad + " UCGEN (B'de esi yok)"; }
          M.darts.push_back(d);
      }
      for (size_t i = pA.size(); i < pB.size(); ++i) {
          IcPens d; d.id = "ic_pens_" + std::to_string(M.darts.size() + 1); d.a = pB[i].a; d.b = pB[i].b; d.apexAlt = pB[i].apex;
          d.apexUst = lerp(pB[i].a, pB[i].b, 0.5);
          M.reason += " | ic pens " + d.id + ": " + pb + "/" + pB[i].ad + " UCGEN (A'da esi yok)"; M.darts.push_back(d);
      }
      // kosuda dartLeg olmayan dusen kenar yok (kosu kurali); pens olmayan dusen bacak kalmaz
    }
    for (const IcPens& d : B->darts) M.darts.push_back(d);
    // id catismasi: A'nin kenari .1, B'ninki .2 (retarget haritasi)
    std::vector<std::pair<EdgeRef, EdgeRef>> yeniden;   // eski -> yeni
    auto idVar = [&](const std::string& id) { for (const Edge& e : kA.kalan) if (e.id == id) return true; for (const Edge& e : kB.kalan) if (e.id == id) return true; return false; };
    for (Edge e : kA.kalan) {
        std::string nid = e.id;
        for (const Edge& f : kB.kalan) if (f.id == e.id) nid = e.id + ".1";
        if (nid != e.id && idVar(nid)) return fail("merge: kenar id catisiyor " + nid);
        yeniden.push_back({{pa, e.id}, {np, nid}}); e.id = nid; M.edges.push_back(e);
    }
    for (Edge e : kB.kalan) {
        std::string nid = e.id;
        for (const Edge& f : kA.kalan) if (f.id == e.id) nid = e.id + ".2";
        if (nid != e.id && idVar(nid)) return fail("merge: kenar id catisiyor " + nid);
        yeniden.push_back({{pb, e.id}, {np, nid}}); e.id = nid; M.edges.push_back(e);
    }
    M.cutCount = std::max(A->cutCount, B->cutCount);
    for (const RingEase& re : B->ease) { bool var = false; for (RingEase& x : M.ease) if (x.ring == re.ring) { x.mm = std::max(x.mm, re.mm); var = true; } if (!var) M.ease.push_back(re); }
    katDurumunuGuncelle(M);
    if (!M.closed(&why)) return fail("merge: birlesik panel kapali degil: " + why);
    Garment g = g0;
    // dikis: A/B referanslari dusur; bos kalirsa dikis kalkar
    { Seam* s = g.seam(sid);
      for (std::vector<EdgeRef>* side : {&s->a, &s->b})
          for (size_t j = 0; j < side->size();) { if ((*side)[j].panel == pa || (*side)[j].panel == pb) side->erase(side->begin() + static_cast<long>(j)); else ++j; }
      if (s->a.empty() != s->b.empty()) return fail("merge: dikis " + sid + " tek tarafli kaldi");
      if (s->a.empty()) for (size_t i = 0; i < g.seams.size(); ++i) if (g.seams[i].id == sid) { g.seams.erase(g.seams.begin() + static_cast<long>(i)); break; } }
    auto retgt = [&](EdgeRef& r) { for (const auto& y : yeniden) if (r == y.first) { r = y.second; return true; } return false; };
    for (Seam& s : g.seams) { for (EdgeRef& r : s.a) retgt(r); for (EdgeRef& r : s.b) retgt(r); }
    for (size_t i = 0; i < g.rings.size();) {
        Ring& r = g.rings[i];
        for (size_t j = 0; j < r.edges.size();) {
            EdgeRef& x = r.edges[j];
            if (x.panel == pa || x.panel == pb) { if (!retgt(x)) { r.edges.erase(r.edges.begin() + static_cast<long>(j)); continue; } }
            ++j;
        }
        if (r.edges.empty()) g.rings.erase(g.rings.begin() + static_cast<long>(i)); else ++i;
    }
    for (Panel& p : g.panels) if (p.onto == pa || p.onto == pb) p.onto = np;
    // A'nin yerine M, B silinir
    for (size_t i = 0; i < g.panels.size(); ++i) if (g.panels[i].id == pb) { g.panels.erase(g.panels.begin() + static_cast<long>(i)); break; }
    for (size_t i = 0; i < g.panels.size(); ++i) if (g.panels[i].id == pa) { g.panels[i] = M; break; }
    return done(g, "merge", a);
}

OpResult opMoveVertex(const Garment& g0, const JVal& a, const OpCtx&) {
    std::string pid, eid, err; RefPoint to;
    if (!needS(a, "panel", pid, err) || !needS(a, "edge", eid, err) || !needP(a, "to", to, err)) return fail("moveVertex: " + err);
    Garment g = g0;
    Panel* p = g.panel(pid); if (!p) return fail("moveVertex: panel yok " + pid);
    const int idx = p->edgeIndex(eid); if (idx < 0) return fail("moveVertex: kenar yok " + refStr(pid, eid));
    p->setVertex(static_cast<size_t>(idx), to);
    return done(g, "moveVertex", a);
}

OpResult opMirror(const Garment& g0, const JVal& a, const OpCtx&) {
    std::string pid, nid, err;
    if (!needS(a, "panel", pid, err) || !needS(a, "newId", nid, err)) return fail("mirror: " + err);
    if (g0.panel(nid)) return fail("mirror: panel id zaten var " + nid);
    const Panel* p = g0.panel(pid); if (!p) return fail("mirror: panel yok " + pid);
    Panel q = *p; q.id = nid; q.edges.clear(); q.reason = "mirror of " + pid;
    for (auto it = p->edges.rbegin(); it != p->edges.rend(); ++it) {
        Edge e = it->reversed();
        e.from = mirrorX(e.from); e.to = mirrorX(e.to);
        for (RefPoint& c : e.control) c = mirrorX(c);
        q.edges.push_back(e);
    }
    Garment g = g0; g.panels.push_back(q);
    return done(g, "mirror", a);
}

OpResult opClosure(const Garment& g0, const JVal& a, const OpCtx&) {
    std::string sid, type, err;
    if (!needS(a, "seam", sid, err) || !needS(a, "type", type, err)) return fail("closure: " + err);
    const double f0 = a.numOr("fromFraction", 0.0), f1 = a.numOr("toFraction", 1.0);
    if (!(f0 >= 0.0 && f0 < f1 && f1 <= 1.0)) return fail("closure: kesirler 0 <= from < to <= 1 olmali");
    Garment g = g0;
    Seam* s = g.seam(sid); if (!s) return fail("closure: dikis yok " + sid);
    s->closure.type = type; s->closure.fromFraction = f0; s->closure.toFraction = f1;
    return done(g, "closure", a);
}

// KISIT op'u (karar 6): mm yazmaz; Edge.fitSeam + Seam.ratio/easeMM
OpResult opFitLength(const Garment& g0, const JVal& a, const OpCtx& ctx) {
    std::string pid, eid, err;
    if (!needS(a, "panel", pid, err) || !needS(a, "edge", eid, err)) return fail("fitLength: " + err);
    const JVal* tg = a.get("target");
    if (!tg || !tg->isObj()) return fail("fitLength: target {seam, ratio, easeMM} eksik");
    std::string sid; double ratio, ease;
    if (!needS(*tg, "seam", sid, err) || !needN(*tg, "ratio", ratio, err) || !needN(*tg, "easeMM", ease, err)) return fail("fitLength target: " + err);
    if (!checkRatio(ratio, ctx, "fitLength", err)) return fail(err);
    Garment g = g0;
    Panel* p = g.panel(pid); if (!p) return fail("fitLength: panel yok " + pid);
    Edge* e = p->edge(eid); if (!e) return fail("fitLength: kenar yok " + refStr(pid, eid));
    if (e->control.size() != 2) return fail("fitLength: kenar kubik degil " + eid);
    Seam* s = g.seam(sid); if (!s) return fail("fitLength: dikis yok " + sid);
    bool inA = false, inB = false;
    for (const EdgeRef& r : s->a) if (r.panel == pid && r.edge == eid) inA = true;
    for (const EdgeRef& r : s->b) if (r.panel == pid && r.edge == eid) inB = true;
    if (!inA && !inB) return fail("fitLength: " + refStr(pid, eid) + " dikis " + sid + "'in hic bir tarafinda degil");
    // obur taraf kisitli olamaz (dongu)
    const std::vector<EdgeRef>& other = inA ? s->b : s->a;
    for (const EdgeRef& r : other) { const Edge* oe = g.edge(r); if (oe && !oe->fitSeam.empty()) return fail("fitLength: dikis " + sid + "'in obur tarafi da kisitli (" + r.panel + "/" + r.edge + " -> " + oe->fitSeam + "): dongu"); }
    if (!e->fitSeam.empty() && e->fitSeam != sid) return fail("fitLength: kenar zaten " + e->fitSeam + " dikisine kisitli");
    e->fitSeam = sid; s->ratio = ratio; s->easeMM = ease;
    return done(g, "fitLength", a);
}

struct OpEntry { const char* ad; OpResult (*fn)(const Garment&, const JVal&, const OpCtx&); };
const OpEntry kOps[] = {
    {"subdivide", opSubdivide}, {"suppress", opSuppress}, {"gather", opGather}, {"flare", opFlare},
    {"extend", opExtend}, {"shorten", opShorten}, {"extendTo", opExtendTo}, {"split", opSplit},
    {"overlay", opOverlay}, {"attach", opAttach}, {"reshapeEdge", opReshapeEdge}, {"moveVertex", opMoveVertex},
    {"mirror", opMirror}, {"closure", opClosure}, {"fitLength", opFitLength},
    {"sew", opSew}, {"addPanel", opAddPanel}, {"drop", opDrop}, {"merge", opMerge},
};
JVal A() { return JVal::obj(); }
} // namespace

OpResult applyOp(const Garment& g, const OpRecord& rec, const OpCtx& ctx) {
    for (const OpEntry& e : kOps) if (rec.op == e.ad) return e.fn(g, rec.args, ctx);
    return fail("bilinmeyen op: " + rec.op);
}
OpResult replay(const Garment& base, const std::vector<OpRecord>& ops, const OpCtx& ctx) {
    OpResult r; r.ok = true; r.g = base;
    for (const OpRecord& rec : ops) {
        r = applyOp(r.g, rec, ctx);
        if (!r.ok) { r.hata = "replay durdu (" + rec.op + "): " + r.hata; return r; }
    }
    return r;
}
std::vector<std::string> opAdlari() { std::vector<std::string> v; for (const OpEntry& e : kOps) v.push_back(e.ad); return v; }

// ---------------------------------------------------------------- tipli sarmalayicilar
OpResult subdivide(const Garment& g, const std::string& panel, const std::string& edge, const std::vector<double>& fr, const OpCtx& ctx) {
    JVal a = A(); a.set("panel", JVal::str(panel)); a.set("edge", JVal::str(edge));
    JVal f = JVal::arr(); for (double x : fr) f.push(JVal::num(x)); a.set("fractions", f);
    return applyOp(g, {"subdivide", a}, ctx);
}
OpResult suppress(const Garment& g, const std::string& panel, const std::string& edge, double atFraction, double intakeFraction,
                  const RefPoint& apex, const std::string& legId, bool trueLegs, const OpCtx& ctx) {
    JVal a = A(); a.set("panel", JVal::str(panel)); a.set("edge", JVal::str(edge)); a.set("atFraction", JVal::num(atFraction));
    a.set("intakeFraction", JVal::num(intakeFraction)); a.set("apex", toJSON(apex)); a.set("legId", JVal::str(legId)); a.set("trueLegs", JVal::boolean(trueLegs));
    return applyOp(g, {"suppress", a}, ctx);
}
OpResult gather(const Garment& g, const std::string& panel, const std::string& edge, double ratio, const OpCtx& ctx) {
    JVal a = A(); a.set("panel", JVal::str(panel)); a.set("edge", JVal::str(edge)); a.set("ratio", JVal::num(ratio));
    return applyOp(g, {"gather", a}, ctx);
}
OpResult flare(const Garment& g, const std::string& panel, const std::string& edge, double factor, const OpCtx& ctx) {
    JVal a = A(); a.set("panel", JVal::str(panel)); a.set("edge", JVal::str(edge)); a.set("factor", JVal::num(factor));
    return applyOp(g, {"flare", a}, ctx);
}
OpResult extend(const Garment& g, const std::string& panel, const std::string& edge, double deltaMM, const OpCtx& ctx) {
    JVal a = A(); a.set("panel", JVal::str(panel)); a.set("edge", JVal::str(edge)); a.set("deltaMM", JVal::num(deltaMM));
    return applyOp(g, {"extend", a}, ctx);
}
OpResult shorten(const Garment& g, const std::string& panel, const std::string& edge, double deltaMM, const OpCtx& ctx) {
    JVal a = A(); a.set("panel", JVal::str(panel)); a.set("edge", JVal::str(edge)); a.set("deltaMM", JVal::num(deltaMM));
    return applyOp(g, {"shorten", a}, ctx);
}
OpResult extendTo(const Garment& g, const std::string& panel, const std::string& edge, const std::string& yLandmark, double yOffsetMM, const OpCtx& ctx) {
    JVal a = A(); a.set("panel", JVal::str(panel)); a.set("edge", JVal::str(edge)); a.set("yLandmark", JVal::str(yLandmark)); a.set("yOffsetMM", JVal::num(yOffsetMM));
    return applyOp(g, {"extendTo", a}, ctx);
}
OpResult split(const Garment& g, const std::string& panel, const std::string& vertexA, const std::string& vertexB,
               const std::string& panelA, const std::string& panelB, const std::string& seam, double seamRatio, const OpCtx& ctx) {
    JVal a = A(); a.set("panel", JVal::str(panel)); a.set("vertexA", JVal::str(vertexA)); a.set("vertexB", JVal::str(vertexB));
    a.set("panelA", JVal::str(panelA)); a.set("panelB", JVal::str(panelB)); a.set("seam", JVal::str(seam)); a.set("seamRatio", JVal::num(seamRatio));
    return applyOp(g, {"split", a}, ctx);
}
OpResult overlay(const Garment& g, const std::string& host, const std::vector<std::string>& edges, double excessRatio,
                 const std::string& newPanel, const std::string& seamPrefix, const OpCtx& ctx) {
    JVal a = A(); a.set("host", JVal::str(host));
    JVal es = JVal::arr(); for (const std::string& e : edges) es.push(JVal::str(e)); a.set("edges", es);
    a.set("excessRatio", JVal::num(excessRatio)); a.set("panel", JVal::str(newPanel)); a.set("seamPrefix", JVal::str(seamPrefix));
    return applyOp(g, {"overlay", a}, ctx);
}
OpResult attach(const Garment& g, const std::string& hostPanel, const std::string& hostEdge, const Panel& newPanel,
                const std::string& newEdge, double ratio, const std::string& seam, const OpCtx& ctx) {
    JVal a = A(); a.set("hostPanel", JVal::str(hostPanel)); a.set("hostEdge", JVal::str(hostEdge)); a.set("panel", toJSON(newPanel));
    a.set("edge", JVal::str(newEdge)); a.set("ratio", JVal::num(ratio)); a.set("seam", JVal::str(seam));
    return applyOp(g, {"attach", a}, ctx);
}
OpResult reshapeEdge(const Garment& g, const std::string& panel, const std::string& edge, const RefPoint* from, const RefPoint* to,
                     const std::vector<RefPoint>* control, const OpCtx& ctx) {
    JVal a = A(); a.set("panel", JVal::str(panel)); a.set("edge", JVal::str(edge));
    if (from) a.set("from", toJSON(*from));
    if (to) a.set("to", toJSON(*to));
    if (control) { JVal c = JVal::arr(); for (const RefPoint& p : *control) c.push(toJSON(p)); a.set("control", c); }
    return applyOp(g, {"reshapeEdge", a}, ctx);
}
OpResult moveVertex(const Garment& g, const std::string& panel, const std::string& edge, const RefPoint& to, const OpCtx& ctx) {
    JVal a = A(); a.set("panel", JVal::str(panel)); a.set("edge", JVal::str(edge)); a.set("to", toJSON(to));
    return applyOp(g, {"moveVertex", a}, ctx);
}
OpResult mirror(const Garment& g, const std::string& panel, const std::string& newId, const OpCtx& ctx) {
    JVal a = A(); a.set("panel", JVal::str(panel)); a.set("newId", JVal::str(newId));
    return applyOp(g, {"mirror", a}, ctx);
}
OpResult closure(const Garment& g, const std::string& seam, const std::string& type, double fromFraction, double toFraction, const OpCtx& ctx) {
    JVal a = A(); a.set("seam", JVal::str(seam)); a.set("type", JVal::str(type)); a.set("fromFraction", JVal::num(fromFraction)); a.set("toFraction", JVal::num(toFraction));
    return applyOp(g, {"closure", a}, ctx);
}
OpResult fitLength(const Garment& g, const std::string& panel, const std::string& edge, const std::string& seam,
                   double ratio, double easeMM, const OpCtx& ctx) {
    JVal a = A(); a.set("panel", JVal::str(panel)); a.set("edge", JVal::str(edge));
    JVal t = A(); t.set("seam", JVal::str(seam)); t.set("ratio", JVal::num(ratio)); t.set("easeMM", JVal::num(easeMM)); a.set("target", t);
    return applyOp(g, {"fitLength", a}, ctx);
}

// ---------------------------------------------------------------- degerleme-ani cozum
namespace {
double edgeLen(const Garment& g, const EdgeRef& r, const Body& body, bool onArkaEsit) {
    const Panel* p = g.panel(r.panel); const Edge* e = g.edge(r);
    if (!p || !e) throw std::runtime_error("cozumle: referans cozulmedi " + r.panel + "/" + r.edge);
    return e->length(p->ctxFor(body, onArkaEsit));
}
}

namespace {

// PENS AGZINI KISIT COZUCUSUYLE COZ (2026-09-08, Damla karari (a): solver bagla).
//
// NEDEN: pens agzi 2026-09-07'de `combo` (afin birlesim) ile SABIT AGIRLIKLI bir formulden
// geliyordu. Olcuye bagliydi ama bir KISIT COZUMU degildi; 8 Eyl hakemi bunu adiyla yakaladi:
// "esitlikler hala buyuk olcude aritmetik ozdeslik, sadece daha karmasik bir ozdeslik".
// Belirtileri: ops[] fitLength 2'de kaldi, beden-duzeyi yanlislama 0.73'te takildi,
// engine/src/solver_utils.* yazildi ama HICBIR YERDEN cagrilmadi (olu kod, §0 anlaminda
// oyalama).
//
// NE YAPAR: bel dikisinin iki tarafini SERT UZUNLUK KISITI olarak cozucuye verir ve pens
// agzini (dartLeg ciftinin taban aciklıgı) BILINMEYEN yapar. Cozucu, iki tarafin uzunlugunu
// esitleyen agiz genisligini bulur. Sonuc grafa dMM olarak DEGIL, kenar uclarinin
// xOffsetMM'ine yazilir (mm grafa gomulmez kurali: ofset landmark'a bagli kalir ve baska
// bedende yeniden degerlenir — cozum her bedende yeniden kosulur).
//
// COZULEMEZSE: graf DEGISMEZ ve hata ADIYLA doner (ERR_UNSOLVABLE zinciri). Sessiz
// yaklastirma yok; cagiran taraf ya hatayi tasir ya da combo tabanini kullanmaya devam eder.
struct PensCift { std::string panel; std::string bacak1, bacak2; int ic = -1; };   // ic >= 0: Panel.darts[ic] (ic halka pens)

std::vector<PensCift> pensleriBul(const Garment& g) {
    std::vector<PensCift> out;
    for (const Panel& p : g.panels) {
        const std::size_t n = p.edges.size();
        for (std::size_t i = 0; i < n; ++i) {
            const Edge& e1 = p.edges[i];
            if (e1.kind != "dartLeg") continue;
            const Edge& e2 = p.edges[(i + 1) % n];
            if (e2.kind != "dartLeg" || e1.to != e2.from) continue;
            out.push_back({p.id, e1.id, e2.id, -1});
            ++i;
        }
        // ic halka pensler (2026-09-09): agiz a-b ayni cozucuye girer; cozum b ucunun xOffsetMM'ine yazilir
        for (std::size_t k = 0; k < p.darts.size(); ++k) out.push_back({p.id, p.darts[k].id, p.darts[k].id, static_cast<int>(k)});
    }
    return out;
}

}  // namespace

CozumSonucu cozPens(const Garment& g, const Body& body, bool onArkaEsit,
                    const solver::SolverCtx& sctx, const std::string& seamId) {
    CozumSonucu R; R.g = g;
    if (!sctx.dolu) { R.hata = "cozPens: solver contract yuklenmedi (SolverCtx bos)"; return R; }
    // Bel dikisi OLMAYABILIR (2026-09-09, op merge: bel dikissiz giysi ic halka pensle gelir). Dikis
    // yalniz bilgi icin olculur; kisit bedenden (gogus-bel supresyonu) gelir, dikisten degil.
    const Seam* s = g.seam(seamId);
    const std::vector<PensCift> pensler = pensleriBul(g);
    if (pensler.empty()) { R.hata = "cozPens: grafta pens (dartLeg cifti ya da ic halka pens) yok"; return R; }

    // Dikisin iki tarafinin SU ANKI uzunluklari (pens agzi mevcut haliyle); dikis yoksa 0
    double La = 0, Lb = 0;
    if (s) try {
        for (const EdgeRef& r : s->a) La += edgeLen(g, r, body, onArkaEsit);
        for (const EdgeRef& r : s->b) Lb += edgeLen(g, r, body, onArkaEsit);
    } catch (const std::exception& ex) { R.hata = std::string("cozPens: ") + ex.what(); return R; }

    // PROBLEM: her pens agzi bir dugum ciftidir (sol taban, sag taban). Sert kisit:
    // "a tarafinin toplam uzunlugu = b tarafinin toplam uzunlugu". Bunu dugum uzayina
    // dusurmek icin her pensi tek serbestlikle temsil ediyoruz: agiz genisligi.
    // Cozucu genel amacli oldugu icin problemi 1B kurup (her pens bir dugum cifti,
    // hedef uzaklik = agiz) bel farkini pensler arasinda PAYLASTIRIYORUZ.
    solver::Problem prob;
    std::vector<std::size_t> solIdx, sagIdx;
    std::vector<double> mevcutAgiz;
    for (const PensCift& pc : pensler) {
        const Panel* p = g.panel(pc.panel);
        const RefPoint* solRef = nullptr; const RefPoint* sagRef = nullptr;
        if (p && pc.ic >= 0) { solRef = &p->darts[pc.ic].a; sagRef = &p->darts[pc.ic].b; }
        else {
            const Edge* b1 = p ? p->edge(pc.bacak1) : nullptr;
            const Edge* b2 = p ? p->edge(pc.bacak2) : nullptr;
            if (b1 && b2) { solRef = &b1->from; sagRef = &b2->to; }
        }
        if (!p || !solRef || !sagRef) { R.hata = "cozPens: pens kenari cozulemedi: " + pc.panel; return R; }
        const EvalCtx pctx = p->ctxFor(body, onArkaEsit);
        Point sol, sag;
        try { sol = eval(*solRef, pctx); sag = eval(*sagRef, pctx); }
        catch (const std::exception& ex) { R.hata = std::string("cozPens: ") + ex.what(); return R; }
        const double agiz = std::hypot(sag.x - sol.x, sag.y - sol.y);
        mevcutAgiz.push_back(agiz);
        solIdx.push_back(prob.dugumler.size());
        prob.dugumler.push_back({pc.panel + "/" + pc.bacak1 + ".taban", sol, true});   // sol taban SABIT
        sagIdx.push_back(prob.dugumler.size());
        prob.dugumler.push_back({pc.panel + "/" + pc.bacak2 + ".taban", sag, false});  // sag taban SERBEST
    }

    // HANGI FARK KAPATILIR? (2026-09-08, olculdu — ilk deneme yanlisti ve adiyla yaziliyor)
    //
    // Ilk bagladigimda kisit "bel dikisinin iki tarafi esit olsun" idi (La - Lb). OLCULDU:
    // bu fark her bedende SIFIR, cunku dikisin iki tarafi da ayni girth.waist'ten turuyor —
    // yani cozucunun cozecegi bir sey yok, kosuyor ve hicbir sey degistirmiyordu (EU34/38/44
    // ucunde de agiz tam 9.42 mm, kayma -0.02). Cozucu bagli gorunuyordu ama IS YAPMIYORDU.
    //
    // DOGRU KISIT: pensin isi bel dikisini kapatmak DEGIL, GOGUS-BEL SUPRESYONUNU emmektir.
    // Govde paneli gogus hizasinda genis, bel hizasinda dardir; bu daralmanin bir kismi yan
    // dikisten, kalani PENSTEN alinir. Yani pens agizlarinin toplami = supresyonun pens payi.
    // Supresyon bedenden gelir (gogus cevresi - bel cevresi) ve bedene gore DEGISIR; boylece
    // agiz da degisir ve olcum gercekten olcuye baglanir.
    //
    // Pens payi: supresyonun kalip konvansiyonundaki orani (Aldrich temel blok: supresyon
    // pens ve yan dikis arasinda paylasilir, pens payi tipik 1/3). DOGRULANMADI: birincil
    // kaynak elde olcumle teyit edilmedi; sayi contract'a tasinana kadar burada ADIYLA durur.
    const double kPensPayi = 1.0 / 3.0;
    if (!body.hasRing("girth.bust") || !body.hasRing("girth.waist")) {
        R.hata = "cozPens: bedende girth.bust / girth.waist yok; supresyon hesaplanamaz";
        return R;
    }
    double easeB = 0, easeW = 0;
    for (const Panel& p : g.panels)
        for (const RingEase& re : p.ease) {
            if (re.ring == "girth.bust") easeB = std::max(easeB, re.mm);
            if (re.ring == "girth.waist") easeW = std::max(easeW, re.mm);
        }
    const double supresyonTam = (body.ring("girth.bust") + easeB) - (body.ring("girth.waist") + easeW);
    if (!(supresyonTam > 0)) {
        R.hata = "cozPens: supresyon pozitif degil (" + fmtNum(supresyonTam) + " mm); bu bedende pens gerekmiyor";
        return R;
    }
    // Pensler YARIM panellerde; tam cevredeki pens payi yarim panellere bolunur.
    const double pensPayiTam = supresyonTam * kPensPayi;
    const double payPens = pensPayiTam / 2.0 / static_cast<double>(pensler.size());
    (void)La; (void)Lb;   // bel dikisi esitligi ayri kapida (dikis_uzunluk) olculuyor
    for (std::size_t k = 0; k < pensler.size(); ++k) {
        const double hedefAgiz = payPens;   // agiz DOGRUDAN supresyon payidir (mevcut hale eklenmez)
        if (!(hedefAgiz > 0)) { R.hata = "cozPens: " + pensler[k].panel + " hedef agiz pozitif degil (" + fmtNum(hedefAgiz) + "); pens bu farki ememez"; return R; }
        prob.sertUzunluklar.push_back({pensler[k].panel + ".agiz", solIdx[k], sagIdx[k], hedefAgiz});
    }
    prob.olcekKisiti = false;   // burada olcek kisiti yok: yalniz agiz genisligi cozuluyor

    const solver::Sonuc sc = solver::coz(prob, sctx);
    if (sc.durum == solver::Durum::ERR_UNSOLVABLE || sc.durum == solver::Durum::ERR_PROBLEM_BOZUK ||
        sc.durum == solver::Durum::ERR_SOLVER_NO_CONTRACT) {
        R.hata = std::string("cozPens: ") + solver::durumAdi(sc.durum) + ": " + sc.hata +
                 (sc.gevsetilmesiGereken.empty() ? "" : " (gevsetilmesi gereken: " + sc.gevsetilmesiGereken + ")");
        return R;
    }

    // COZUMU GRAFA YAZ: sag tabanin kaymasi kadar xOffsetMM eklenir. mm landmark'a bagli
    // kalir (Anchor.xOffsetMM), yani baska bedende cozum yeniden kosulur.
    for (std::size_t k = 0; k < pensler.size(); ++k) {
        const Point yeni = sc.noktalar[sagIdx[k]];
        const Point eski = prob.dugumler[sagIdx[k]].p;
        const double dx = yeni.x - eski.x;
        if (std::fabs(dx) < 1e-12) continue;
        Panel* p = R.g.panel(pensler[k].panel);
        if (p && pensler[k].ic >= 0) {   // ic halka pens: agzin b ucu ve asagi/yukari apeks x'i agizla birlikte kaymaz, yalniz b
            IcPens& d = p->darts[pensler[k].ic];
            for (Term& tm : d.b.terms) tm.a.xOffsetMM += dx;
            d.b.normalize();
            R.cozumler.push_back({pensler[k].panel, d.id, seamId, prob.sertUzunluklar[k].hedefMM, dx, sc.enBuyukSertArtikMM});
            continue;
        }
        Edge* b2 = p ? p->edge(pensler[k].bacak2) : nullptr;
        if (!b2) { R.hata = "cozPens: cozum yazilamadi: " + pensler[k].panel; return R; }
        const RefPoint eskiUc = b2->to;
        for (Term& tm : b2->to.terms) tm.a.xOffsetMM += dx;
        b2->to.normalize();
        // KONTUR KAPALILIGI: pens agzinin sag tabani, bitisik bel kenarinin BASLANGICIYLA
        // ayni noktadir. Yalniz pens bacagini kaydirirsak panel konturu ACILIR (panel_kapali
        // kirmizisi). Ayni RefPoint'i tasiyan her kenar ucu birlikte kayar.
        for (Edge& e : p->edges) {
            if (e.id == pensler[k].bacak2) continue;
            if (e.from == eskiUc) { for (Term& tm : e.from.terms) tm.a.xOffsetMM += dx; e.from.normalize(); }
            if (e.to == eskiUc) { for (Term& tm : e.to.terms) tm.a.xOffsetMM += dx; e.to.normalize(); }
        }
        R.cozumler.push_back({pensler[k].panel, pensler[k].bacak2, seamId,
                              prob.sertUzunluklar[k].hedefMM, dx, sc.enBuyukSertArtikMM});
    }
    R.ok = true;
    return R;
}

CozumSonucu cozumle(const Garment& g, const Body& body, bool onArkaEsit, const OpCtx& ctx) {
    CozumSonucu R; R.g = g;
    if (!ctx.dolu) { R.hata = "cozumle: contract cozucu/araliklar yuklenmedi (OpCtx bos)"; return R; }
    const double dMaxMM = ctx.fitDMaxMM, tolMM = ctx.fitTolMM;
    for (const Panel& p : g.panels) for (const Edge& e : p.edges) {
        if (e.fitSeam.empty()) continue;
        const Seam* s = g.seam(e.fitSeam);
        if (!s) { R.hata = "cozumle: " + p.id + "/" + e.id + " fitSeam yok " + e.fitSeam; return R; }
        if (e.control.size() != 2) { R.hata = "cozumle: " + p.id + "/" + e.id + " kubik degil"; return R; }
        bool inA = false; for (const EdgeRef& r : s->a) if (r.panel == p.id && r.edge == e.id) inA = true;
        bool inB = false; for (const EdgeRef& r : s->b) if (r.panel == p.id && r.edge == e.id) inB = true;
        if (!inA && !inB) { R.hata = "cozumle: " + p.id + "/" + e.id + " dikis " + s->id + "'de degil"; return R; }
        const std::vector<EdgeRef>& mine = inA ? s->a : s->b; const std::vector<EdgeRef>& other = inA ? s->b : s->a;
        double Lo = 0, Lu = 0; int nFit = 0;
        try {
            for (const EdgeRef& r : other) { const Edge* oe = g.edge(r); if (oe && !oe->fitSeam.empty()) { R.hata = "cozumle: dikis " + s->id + " iki tarafi kisitli (dongu)"; return R; } Lo += edgeLen(g, r, body, onArkaEsit); }
            for (const EdgeRef& r : mine) { const Edge* me = g.edge(r); if (me && me->fitSeam == s->id) ++nFit; else Lu += edgeLen(g, r, body, onArkaEsit); }
        } catch (const std::exception& ex) { R.hata = ex.what(); return R; }
        const double sideTarget = inA ? (s->ratio * Lo + s->easeMM) : ((Lo - s->easeMM) / s->ratio);
        const double hedef = (sideTarget - Lu) / nFit;
        if (!(hedef > 0)) { R.hata = "cozumle: " + p.id + "/" + e.id + " hedef uzunluk pozitif degil (" + fmtNum(hedef) + ")"; return R; }
        const EvalCtx ectx = p.ctxFor(body, onArkaEsit);
        Point f, t;
        try { f = eval(e.from, ectx); t = eval(e.to, ectx); } catch (const std::exception& ex) { R.hata = std::string("cozumle: ") + ex.what(); return R; }
        const double L = std::hypot(t.x - f.x, t.y - f.y);
        if (L < 1e-9) { R.hata = "cozumle: " + p.id + "/" + e.id + " kiris sifir"; return R; }
        const double nx = -(t.y - f.y) / L, ny = (t.x - f.x) / L;   // kiris normali (sol el)
        auto shifted = [&](double d) { Edge c = e; for (RefPoint& cp : c.control) { for (Term& tm : cp.terms) { tm.a.xOffsetMM += d * nx; tm.a.yOffsetMM += d * ny; } cp.normalize(); } return c; };
        auto lenAt = [&](double d) { return shifted(d).length(ectx); };
        // (len(d) - hedef) isaret degistiren en dar aralik: [-dMax, dMax] uzerinde 80 adimlik tarama, sifira en yakin kok
        const int N = 80; double best = 0, bestErr = std::fabs(lenAt(0) - hedef); bool found = false;
        for (int i = 0; i < N; ++i) {
            const double d0 = -dMaxMM + 2.0 * dMaxMM * i / N, d1 = -dMaxMM + 2.0 * dMaxMM * (i + 1) / N;
            const double f0 = lenAt(d0) - hedef, f1 = lenAt(d1) - hedef;
            if (f0 == 0.0) { if (!found || std::fabs(d0) < std::fabs(best)) { best = d0; bestErr = 0; found = true; } continue; }
            if ((f0 < 0) == (f1 < 0)) continue;
            double lo = d0, hi = d1, flo = f0;
            for (int it = 0; it < 80 && (hi - lo) > 1e-7; ++it) {
                const double mid = 0.5 * (lo + hi), fm = lenAt(mid) - hedef;
                if ((fm < 0) == (flo < 0)) { lo = mid; flo = fm; } else hi = mid;
            }
            const double d = 0.5 * (lo + hi), err = std::fabs(lenAt(d) - hedef);
            if (!found || std::fabs(d) < std::fabs(best)) { best = d; bestErr = err; found = true; }
        }
        if (bestErr > tolMM) { R.hata = "cozumle: " + p.id + "/" + e.id + " (" + s->id + ") hedef " + fmtNum(hedef) + " mm'ye |d| <= " + fmtNum(dMaxMM) + " ile " + body.id() + "'de ulasilamadi (en iyi hata " + fmtNum(bestErr) + " mm)"; return R; }
        *R.g.panel(p.id)->edge(e.id) = shifted(best);
        R.cozumler.push_back({p.id, e.id, s->id, hedef, best, lenAt(best) - hedef});
    }
    R.ok = true;
    return R;
}

} // namespace graf
} // namespace stitchu
