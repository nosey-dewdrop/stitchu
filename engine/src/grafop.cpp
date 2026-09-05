// grafop.cpp — GRAF OP'LARI. Bkz. grafop.hpp. Her op: (1) hedefi adiyla bul, yoksa reddet;
// (2) yalniz hedef paneli/dikisi degistir; (3) kaydi ekle.
#include "grafop.hpp"

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
    Seam s; s.id = sid; s.a = {{pA, cut1.id}}; s.b = {{pB, cut2.id}}; s.ratio = 1.0; s.reason = "split of " + pid;
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
    if (!any) return fail("reshapeEdge: from/to/control'dan en az biri gerekli");
    return done(g, "reshapeEdge", a);
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
