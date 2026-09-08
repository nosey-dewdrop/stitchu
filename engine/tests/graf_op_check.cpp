// graf_op_check.cpp — F2a kapisi 2: her op icin (1) EDIT-LOCALITY: dokunulmayan paneller BAYT-AYNI,
// (2) op'un kendi degismezi, (3) adiyla reddedilen negatif ornek; + replay (kayitlar yeniden
// oynatilinca ayni JSON) + bilinmeyen op reddi. Girdi: KOSU/ciktilar/graf-ilk/graf.json (taban),
// contract/graf-v1.json (araliklar). Uzunluklar gercek36'da (body_check fixture'i).
// argv: <contract/graf-v1.json> <graf.json>
#include <cmath>
#include <cstdio>
#include <fstream>
#include <set>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

#include "../src/body.hpp"
#include "../src/graf.hpp"
#include "../src/grafdogrula.hpp"
#include "../src/grafop.hpp"

using namespace stitchu;
using namespace stitchu::graf;

static int fails = 0;
static void ok(bool c, const std::string& msg) { std::printf("  [%s] %s\n", c ? "ok" : "FAIL", msg.c_str()); if (!c) ++fails; }
static std::string f2(double v) { char b[32]; std::snprintf(b, sizeof b, "%.2f", v); return b; }
static std::string readFile(const std::string& p) { std::ifstream f(p); if (!f) throw std::runtime_error("okunamadi: " + p); std::stringstream ss; ss << f.rdbuf(); return ss.str(); }

// dokunulmayan paneller bayt-ayni; dokunulanlar degismis (ya da yeni)
static bool locality(const Garment& g0, const Garment& g1, const std::set<std::string>& touched, std::string& why) {
    for (const Panel& p : g0.panels) {
        const Panel* q = g1.panel(p.id);
        if (touched.count(p.id)) continue;
        if (!q) { why = p.id + " kayboldu"; return false; }
        if (panelJSONText(p) != panelJSONText(*q)) { why = p.id + " degisti (dokunulmamasi gerekiyordu)"; return false; }
    }
    return true;
}
static double len(const Garment& g, const std::string& pid, const std::string& eid, const Body& b) {
    const Panel* p = g.panel(pid); const Edge* e = p ? p->edge(eid) : nullptr;
    if (!e) throw std::runtime_error("len: yok " + pid + "/" + eid);
    return e->length(p->ctxFor(b));
}
static Point pt(const Garment& g, const std::string& pid, const RefPoint& r, const Body& b) { return eval(r, g.panel(pid)->ctxFor(b)); }
static bool hasRef(const std::vector<EdgeRef>& v, const std::string& p, const std::string& e) { for (const EdgeRef& r : v) if (r.panel == p && r.edge == e) return true; return false; }

int main(int argc, char** argv) {
    if (argc < 3) { std::fprintf(stderr, "kullanim: graf_op_check <graf-v1.json> <graf.json>\n"); return 2; }
    JVal contract; std::string err;
    if (!parse(readFile(argv[1]), contract, err)) { std::fprintf(stderr, "contract: %s\n", err.c_str()); return 2; }
    Garment g;
    if (!fromJSONText(readFile(argv[2]), g, err)) { std::fprintf(stderr, "graf.json: %s\n", err.c_str()); return 2; }
    const OpCtx ctx = OpCtx::fromContract(contract);
    const Body body = Body::fromContract("gercek36");
    const size_t ops0 = g.ops.size();
    std::string why;
    std::printf("graf_op_check — taban %s: %zu panel, %zu dikis, %zu op kaydi; beden %s\n", g.id.c_str(), g.panels.size(), g.seams.size(), ops0, body.id().c_str());

    // ---- subdivide
    { const double L0 = len(g, "on_beden", "armhole_front.1", body);
      OpResult r = subdivide(g, "on_beden", "armhole_front.1", {0.4}, ctx);
      ok(r.ok, "subdivide armhole_front.1 @0.4: " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      const Panel* p = r.g.panel("on_beden");
      ok(p->edgeIndex("armhole_front.1") < 0 && p->edge("armhole_front.1.1") && p->edge("armhole_front.1.2"), "  kenar .1.1/.1.2 oldu, eski id gitti");
      ok(p->edge("armhole_front.1.1")->rolePart == 1 && p->edge("armhole_front.1.2")->rolePart == 2 && p->edge("armhole_front.1.2")->roleCount == 4 && p->edge("armhole_front.1.2")->role == "armhole_front", "  rol PARCALI: armhole_front 1/2 -> 1/4, 2/4 (K2/K5 kok sebebi kapali)");
      const double L1 = len(r.g, "on_beden", "armhole_front.1.1", body) + len(r.g, "on_beden", "armhole_front.1.2", body);
      ok(std::fabs(L1 - L0) < 0.5, "  toplam uzunluk korunur " + f2(L1) + " ~ " + f2(L0));
      const Seam* s = r.g.seam("kol_oyugu");
      ok(hasRef(s->b, "on_beden", "armhole_front.1.1") && hasRef(s->b, "on_beden", "armhole_front.1.2") && !hasRef(s->b, "on_beden", "armhole_front.1"), "  dikis referanslari parcalara acildi (kol_oyugu.b)");
      ok(hasRef(r.g.rings[1].edges, "on_beden", "armhole_front.1.2"), "  halka referanslari parcalara acildi (kol_oyugu_halka)");
      ok(p->closed(&why), "  panel kapali: " + why);
      ok(locality(g, r.g, {"on_beden"}, why), "  locality: diger 4 panel bayt-ayni " + why);
      ok(r.g.ops.size() == ops0 + 1 && r.g.ops.back().op == "subdivide", "  op kaydi eklendi");
      OpResult n = subdivide(g, "on_beden", "armhole_front.1", {1.2}, ctx);
      ok(!n.ok && n.hata.find("(0,1)") != std::string::npos, "  negatif: kesir 1.2 adiyla reddedildi: " + n.hata);
      OpResult n2 = subdivide(g, "on_beden", "yok", {0.5}, ctx);
      ok(!n2.ok && n2.hata.find("yok") != std::string::npos, "  negatif: olmayan kenar: " + n2.hata); }

    // ---- suppress (primitives-v1 op.suppress; karar 2)
    // apeks y: gogus ucu -> bel dususunun 0.15'i. trueLegs=true: x agiz ortasindan kurulur (verilen x yok sayilir) -> bacaklar insadan esit
    Anchor apexA; apexA.landmark = "landmark.waist"; apexA.xOf = "ringQuarter"; apexA.xFactor = 0.5; apexA.yLandmark = "landmark.bustApex"; apexA.yLandmark2 = "landmark.waist"; apexA.yLerp = 0.15;
    const RefPoint apex = RefPoint::of(apexA);
    Garment gDart;
    { const double W0 = len(g, "on_beden", "waist_front.2", body); const size_t n0 = g.panel("on_beden")->edges.size();
      OpResult r = suppress(g, "on_beden", "waist_front.2", 0.5, 0.2, apex, "pens_bel", true, ctx);
      ok(r.ok, "suppress waist_front @0.5 intake 0.2 trueLegs: " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      ok(r.g.ops.back().op == "suppress" && r.g.ops.back().args.boolOr("trueLegs", false), "  kayit adi 'suppress' (primitives-v1 op.suppress), trueLegs true");
      gDart = r.g;
      const Panel* p = r.g.panel("on_beden");
      ok(p->edges.size() == n0 + 3, "  kenar sayisi " + std::to_string(n0) + " -> " + std::to_string(p->edges.size()) + " (+3: sol, 2 bacak, sag)");
      const Edge* l1 = p->edge("pens_bel.1"); const Edge* l2 = p->edge("pens_bel.2");
      ok(l1 && l2 && l1->kind == "dartLeg" && l2->kind == "dartLeg" && l1->to == l2->from, "  iki dartLeg, ortak apeks");
      const double a = l1->length(p->ctxFor(body)), b2 = l2->length(p->ctxFor(body));
      ok(std::fabs(a - b2) < 1e-6, "  bacaklar esit " + f2(a) + " / " + f2(b2) + " mm (insadan)");
      const double W1 = len(r.g, "on_beden", "waist_front.2.1", body) + len(r.g, "on_beden", "waist_front.2.3", body);
      ok(std::fabs(W1 - 0.8 * W0) < 1e-6, "  bel kenari 0.8 x eski: " + f2(W1) + " == " + f2(0.8 * W0));
      ok(p->closed(&why), "  panel kapali: " + why);
      const Seam* s = r.g.seam("bel");
      ok(hasRef(s->a, "on_beden", "waist_front.2.1") && hasRef(s->a, "on_beden", "waist_front.2.3") && !hasRef(s->a, "on_beden", "waist_front.2"), "  bel dikisi referanslari sol/sag parcaya");
      ok(locality(g, r.g, {"on_beden"}, why), "  locality " + why);
      OpResult n = suppress(g, "on_beden", "cf", 0.5, 0.2, apex, "x", true, ctx);
      ok(!n.ok && n.hata.find("fold") != std::string::npos, "  negatif: kat kenarina pens reddi: " + n.hata);
      OpResult n2 = suppress(g, "on_beden", "waist_front.2", 0.5, 1.2, apex, "x", true, ctx);
      ok(!n2.ok, "  negatif: intake 1.2 reddi: " + n2.hata);
      OpResult n3 = suppress(g, "on_beden", "waist_front.2", 0.95, 0.2, apex, "x", true, ctx);
      ok(!n3.ok && n3.hata.find("disina") != std::string::npos, "  negatif: agiz kenar disina tasar: " + n3.hata);
      // trueLegs=true agiz ortasini kullanir: kaydirilmis x'li apeks de esit bacak verir; trueLegs=false ayni apeks esit vermez
      Anchor off = apexA; off.xFactor = 0.8; const RefPoint apexOff = RefPoint::of(off);
      OpResult t1 = suppress(g, "on_beden", "waist_front.2", 0.5, 0.2, apexOff, "p", true, ctx);
      OpResult t0 = suppress(g, "on_beden", "waist_front.2", 0.5, 0.2, apexOff, "p", false, ctx);
      const Panel* p1 = t1.g.panel("on_beden"); const Panel* p0 = t0.g.panel("on_beden");
      const double d1 = std::fabs(p1->edge("p.1")->length(p1->ctxFor(body)) - p1->edge("p.2")->length(p1->ctxFor(body)));
      const double d0 = std::fabs(p0->edge("p.1")->length(p0->ctxFor(body)) - p0->edge("p.2")->length(p0->ctxFor(body)));
      ok(t1.ok && t0.ok && d1 < 1e-6 && d0 > 1.0, "  trueLegs: kaydirilmis apeks x'i ile bacak farki true " + f2(d1) + " / false " + f2(d0) + " mm (insa vs verilen)");
      OpResult n4 = suppress(g, "on_beden", "waist_front.2", 0.5, 0.2, lerp(apex, RefPoint::of(off), 0.5), "q", true, ctx);
      ok(!n4.ok && n4.hata.find("tek landmark") != std::string::npos, "  negatif: trueLegs ile cok terimli apeks reddi: " + n4.hata); }

    // ---- gather
    { const double W0 = len(g, "on_etek", "waist_front.2", body);
      OpResult r = gather(g, "on_etek", "waist_front.2", 1.5, ctx);
      ok(r.ok, "gather on_etek/waist_front x1.5: " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      const double W1 = len(r.g, "on_etek", "waist_front.2", body);
      ok(std::fabs(W1 - 1.5 * W0) < 1e-6, "  kenar 1.5 kat: " + f2(W1) + " == " + f2(1.5 * W0));
      const Seam* s = r.g.seam("bel");
      ok(std::fabs(s->ratio - 1.5) < 1e-9 && hasRef(s->a, "on_etek", "waist_front.2"), "  dikis orani 1.5, buzulen taraf a'ya gecti (etek)");
      ok(r.g.panel("on_etek")->edge("waist_front.2")->gatherRatio == 1.5, "  edge.gatherRatio 1.5 (bilgi)");
      ok(r.g.panel("on_etek")->closed(&why), "  panel kapali " + why);
      ok(locality(g, r.g, {"on_etek"}, why), "  locality " + why);
      OpResult n = gather(g, "on_etek", "waist_front.2", 5.0, ctx);
      ok(!n.ok && n.hata.find("aralig") != std::string::npos, "  negatif: oran 5.0 contract araligi disinda: " + n.hata);
      OpResult n2 = gather(g, "on_etek", "cf", 1.5, ctx);
      ok(!n2.ok, "  negatif: kat kenari buzulmez: " + n2.hata); }

    // ---- flare
    { const double H0 = len(g, "on_etek", "hem_front", body);
      OpResult r = flare(g, "on_etek", "hem_front", 1.6, ctx);
      ok(r.ok, "flare hem_front x1.6: " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      ok(std::fabs(len(r.g, "on_etek", "hem_front", body) - 1.6 * H0) < 1e-6, "  etek ucu 1.6 kat (" + f2(1.6 * H0) + ")");
      ok(len(r.g, "on_etek", "side_front.1", body) > len(g, "on_etek", "side_front.1", body), "  yan kenar disa acildi (uzadi)");
      ok(locality(g, r.g, {"on_etek"}, why), "  locality " + why);
      OpResult n = flare(g, "on_etek", "waist_front.2", 1.6, ctx);
      ok(!n.ok && n.hata.find("gather") != std::string::npos, "  negatif: dikisli kenara flare reddi (gather onerir): " + n.hata);
      OpResult n2 = flare(g, "on_etek", "hem_front", 9.0, ctx);
      ok(!n2.ok, "  negatif: katsayi 9 aralik disi: " + n2.hata); }

    // ---- extend / shorten / extendTo
    { const Point h0 = pt(g, "on_etek", g.panel("on_etek")->edge("hem_front")->from, body);
      OpResult r = extend(g, "on_etek", "hem_front", 50.0, ctx);
      ok(r.ok, "extend hem_front +50: " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      const Point h1 = pt(r.g, "on_etek", r.g.panel("on_etek")->edge("hem_front")->from, body);
      const Point h1b = pt(r.g, "on_etek", r.g.panel("on_etek")->edge("hem_front")->to, body);
      ok(std::fabs(h1.y - h0.y - 50.0) < 1e-9 && std::fabs(h1b.y - h0.y - 50.0) < 1e-9, "  etek ucu iki kosesi +50 mm (" + f2(h0.y) + " -> " + f2(h1.y) + ")");
      ok(std::fabs(len(r.g, "on_etek", "side_front.1", body) - len(g, "on_etek", "side_front.1", body) - 50.0) < 1e-9, "  yan kenar +50 uzadi (dusey kenar)");
      ok(len(r.g, "on_etek", "cf", body) > len(g, "on_etek", "cf", body), "  kat kenari uzadi");
      ok(locality(g, r.g, {"on_etek"}, why), "  locality " + why);
      OpResult r2 = shorten(r.g, "on_etek", "hem_front", 30.0, ctx);
      const Point h2 = pt(r2.g, "on_etek", r2.g.panel("on_etek")->edge("hem_front")->from, body);
      ok(r2.ok && std::fabs(h2.y - h0.y - 20.0) < 1e-9, "  shorten 30 -> net +20 (" + f2(h2.y) + ")");
      OpResult n = shorten(g, "on_etek", "hem_front", -5.0, ctx);
      ok(!n.ok, "  negatif: shorten negatif mm reddi: " + n.hata);
      OpResult r3 = extendTo(g, "on_etek", "hem_front", "landmark.ankle", 0.0, ctx);
      const Point h3 = pt(r3.g, "on_etek", r3.g.panel("on_etek")->edge("hem_front")->from, body);
      ok(r3.ok && std::fabs(h3.y - body.landmark("landmark.ankle").y) < 1e-9, "  extendTo landmark.ankle: etek ucu y == ankle.y " + f2(h3.y) + " (diz -> bilek, landmark ile)");
      ok(locality(g, r3.g, {"on_etek"}, why), "  locality " + why); }

    // ---- split (once subdivide ile iki kose ac: kol oyugu ortasi + CB ortasi) -> roba
    { OpResult s1 = subdivide(g, "arka_beden", "armhole_back.1", {0.5}, ctx);
      OpResult s2 = subdivide(s1.g, "arka_beden", "cb", {0.5}, ctx);
      ok(s1.ok && s2.ok, "split hazirlik: armhole_back.1 ve cb 0.5'te bolundu");
      const size_t n0 = s2.g.panel("arka_beden")->edges.size();
      OpResult r = split(s2.g, "arka_beden", "cb.2", "armhole_back.1.2", "arka_ust", "arka_alt", "roba", 1.0, ctx);
      ok(r.ok, "split arka_beden cb.2 <-> armhole_back.1.2 -> arka_ust + arka_alt, dikis roba: " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      const Panel* pu = r.g.panel("arka_ust"); const Panel* pa = r.g.panel("arka_alt");
      ok(pu && pa && !r.g.panel("arka_beden"), "  eski panel gitti, iki yeni panel var");
      ok(pu->edges.size() + pa->edges.size() == n0 + 2, "  kenar toplami n+2 (" + std::to_string(pu->edges.size()) + " + " + std::to_string(pa->edges.size()) + ")");
      ok(pu->closed(&why) && pa->closed(&why), "  iki panel de kapali " + why);
      const std::string pOf1 = r.g.panelOfEdge("armhole_back.1.1"), pOf2 = r.g.panelOfEdge("armhole_back.1.2");
      ok(!pOf1.empty() && !pOf2.empty() && pOf1 != pOf2, "  oyuk parcalari iki ayri panelde: .1.1 -> " + pOf1 + ", .1.2 -> " + pOf2);
      ok(r.g.edge({pOf1, "armhole_back.1.1"})->role == "armhole_back" && r.g.edge({pOf2, "armhole_back.1.2"})->role == "armhole_back" && r.g.edge({pOf2, "armhole_back.1.2"})->rolePart == 2 && r.g.edge({pOf2, "armhole_back.1.2"})->roleCount == 4, "  rol iki panelde de armhole_back, parcali (1/4, 2/4; .2 = 3/4..4/4 ayni panelde)");
      // 2026-09-07: arka orta artik KAT DEGIL, kapanma dikisi (fermuar) — arka_beden
      // onFold=false, cutCount=2. Bolunen iki parca da bu ozelligi MIRAS ALIR; olculen
      // sey "bolme, panelin orta-ekseni ozelligini koruyor mu" idi, o korunuyor.
      ok(!pu->onFold && !pa->onFold && pu->cutCount == 2 && pa->cutCount == 2,
         "  iki panel de arka orta kapanmasini miras aldi (onFold=false, cutCount=2)");
      const Seam* roba = r.g.seam("roba");
      ok(roba && roba->a.size() == 1 && roba->b.size() == 1 && r.g.edge(roba->a[0]) && r.g.edge(roba->b[0]), "  roba dikisi iki yeni kesim kenarini bagliyor");
      ok(std::fabs(len(r.g, roba->a[0].panel, roba->a[0].edge, body) - len(r.g, roba->b[0].panel, roba->b[0].edge, body)) < 1e-9, "  kesim kenarlari esit uzunlukta");
      const Seam* oyuk = r.g.seam("kol_oyugu");
      ok(hasRef(oyuk->b, pOf1, "armhole_back.1.1") && hasRef(oyuk->b, pOf2, "armhole_back.1.2"), "  kol_oyugu dikisi referanslari yeni panellere tasindi");
      { const EdgeRef& rb = r.g.seam("omuz")->b[0]; ok((rb.panel == "arka_ust" || rb.panel == "arka_alt") && rb.edge == "shoulder" && r.g.edge(rb), "  omuz dikisi referansi yeni panele tasindi (" + rb.panel + "/" + rb.edge + ")"); }
      ok(locality(s2.g, r.g, {"arka_beden"}, why), "  locality: on_beden/etekler/kol bayt-ayni " + why);
      OpResult n = split(s2.g, "arka_beden", "cb.2", "waist_back.1", "x", "y", "z", 1.0, ctx);   // 2026-09-07: bel kenari pens icin bolundu; cb'nin komsusu artik waist_back.1
      ok(!n.ok && n.hata.find("komsu") != std::string::npos, "  negatif: komsu koseler (mevcut kenarla cakisir): " + n.hata);
      OpResult n2 = split(s2.g, "arka_beden", "cb.2", "cb.2", "x", "y", "z", 1.0, ctx);
      ok(!n2.ok, "  negatif: ayni kose: " + n2.hata);
      OpResult n3 = split(s2.g, "arka_beden", "cb.2", "armhole_back.2", "on_beden", "y", "z", 1.0, ctx);
      ok(!n3.ok, "  negatif: var olan panel id: " + n3.hata); }

    // ---- overlay (buzgulu ust katman: puf kol)
    { const double C0 = len(g, "kol", "cap_front", body) + len(g, "kol", "cap_back", body);
      OpResult r = overlay(g, "kol", {"cap_front", "cap_back"}, 1.29, "kol_ust", "puf", ctx);
      ok(r.ok, "overlay kol cap x1.29 -> kol_ust: " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      const Panel* q = r.g.panel("kol_ust");
      ok(q && q->closed(&why), "  ust katman paneli var ve kapali " + why);
      const double C1 = len(r.g, "kol_ust", "cap_front", body) + len(r.g, "kol_ust", "cap_back", body);
      ok(std::fabs(C1 - 1.29 * C0) < 1e-6, "  ust kapak 1.29 x konak kapak (" + f2(C1) + " vs " + f2(1.29 * C0) + ") — homoteti, egri de tam olcekler");
      ok(r.g.seam("puf.cap_front") && r.g.seam("puf.cap_back") && std::fabs(r.g.seam("puf.cap_front")->ratio - 1.29) < 1e-9, "  iki dikis, ratio 1.29 (ust -> konak)");
      ok(panelJSONText(*g.panel("kol")) == panelJSONText(*r.g.panel("kol")), "  konak panel BAYT-AYNI");
      ok(locality(g, r.g, {}, why), "  locality: hicbir eski panel degismedi " + why);
      OpResult n = overlay(g, "kol", {"cap_front"}, 1.29, "kol", "p", ctx);
      ok(!n.ok, "  negatif: var olan panel id: " + n.hata); }

    // ---- attach (volan: kol agzina buzgulu serit)
    { Panel volan; volan.id = "volan"; volan.cutCount = 2; volan.reason = "kol agzi volani"; volan.ease = g.panel("kol")->ease;   // ayni halka bollugu: kol agziyla ayni G
      Anchor a0; a0.landmark = "landmark.underarm"; a0.xOf = "ringQuarter"; a0.ring = "girth.biceps"; a0.xFactor = -3.0; a0.yLandmark = "landmark.elbow";
      Anchor a1 = a0; a1.xFactor = 3.0;
      Anchor a2 = a1; a2.yLandmark = "landmark.elbow"; a2.yLandmark2 = "landmark.wrist"; a2.yLerp = 0.3;
      Anchor a3 = a0; a3.yLandmark = "landmark.elbow"; a3.yLandmark2 = "landmark.wrist"; a3.yLerp = 0.3;
      Edge top; top.id = "top"; top.kind = "seam"; top.role = "flounce_top"; top.from = RefPoint::of(a0); top.to = RefPoint::of(a1);
      Edge s1; s1.id = "side1"; s1.kind = "seam"; s1.from = RefPoint::of(a1); s1.to = RefPoint::of(a2);
      Edge bot; bot.id = "bottom"; bot.kind = "cut"; bot.finish = "rolled"; bot.from = RefPoint::of(a2); bot.to = RefPoint::of(a3);
      Edge s2; s2.id = "side2"; s2.kind = "seam"; s2.from = RefPoint::of(a3); s2.to = RefPoint::of(a0);
      volan.edges = {top, s1, bot, s2};
      const double hem = len(g, "kol", "hem", body);
      OpResult r = attach(g, "kol", "hem", volan, "top", 1.5, "volan_kol", ctx);
      ok(r.ok, "attach volan -> kol/hem ratio 1.5: " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      ok(r.g.panel("volan") && r.g.seam("volan_kol") && hasRef(r.g.seam("volan_kol")->a, "volan", "top") && hasRef(r.g.seam("volan_kol")->b, "kol", "hem"), "  yeni panel + dikis (a=volan.top, b=kol.hem)");
      ok(std::fabs(len(r.g, "volan", "top", body) - 1.5 * hem) < 1e-6, "  volan ust kenari 1.5 x kol agzi (" + f2(len(r.g, "volan", "top", body)) + ")");
      ok(locality(g, r.g, {}, why), "  locality: konak dahil hicbir eski panel degismedi " + why);
      Panel acik = volan; acik.edges.pop_back();
      OpResult n = attach(g, "kol", "hem", acik, "top", 1.5, "v2", ctx);
      ok(!n.ok && n.hata.find("kapali") != std::string::npos, "  negatif: acik panel reddi: " + n.hata);
      OpResult n2 = attach(g, "kol", "hem", volan, "top", 1.5, "kol_alti", ctx);
      ok(!n2.ok, "  negatif: var olan dikis id: " + n2.hata); }

    // ---- moveVertex / reshapeEdge (yakayi 20 mm derinlestir)
    { Anchor deep; deep.landmark = "landmark.neckFront"; deep.xFactor = 0.0; deep.yOffsetMM = 20.0;
      const Point y0 = pt(g, "on_beden", g.panel("on_beden")->edge("cf")->from, body);
      OpResult r = moveVertex(g, "on_beden", "cf", RefPoint::of(deep), ctx);
      ok(r.ok, "moveVertex on_beden/cf.from (yaka on ortasi) +20 mm: " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      const Panel* p = r.g.panel("on_beden");
      const Point y1 = pt(r.g, "on_beden", p->edge("cf")->from, body);
      ok(std::fabs(y1.y - y0.y - 20.0) < 1e-9 && p->edge("neck_front")->to == p->edge("cf")->from, "  yaka 20 mm derin (" + f2(y0.y) + " -> " + f2(y1.y) + "), komsu kenar (neck_front.to) birlikte tasindi");
      ok(p->closed(&why), "  panel kapali " + why);
      ok(locality(g, r.g, {"on_beden"}, why), "  locality: arka/etek/kol bayt-ayni " + why);
      std::vector<RefPoint> ctl = {p->edge("neck_front")->from, p->edge("neck_front")->to};   // duze yakin yaka
      OpResult r2 = reshapeEdge(r.g, "on_beden", "neck_front", nullptr, nullptr, &ctl, ctx);
      ok(r2.ok && r2.g.panel("on_beden")->edge("neck_front")->control.size() == 2, "  reshapeEdge: kontrol noktalari yeniden yazildi");
      OpResult n = reshapeEdge(g, "on_beden", "neck_front", nullptr, nullptr, nullptr, ctx);
      ok(!n.ok, "  negatif: bos reshape reddi: " + n.hata); }

    // ---- mirror
    { OpResult r = mirror(g, "kol", "kol_sol", ctx);
      ok(r.ok, "mirror kol -> kol_sol: " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      const Panel* q = r.g.panel("kol_sol");
      const Point a = pt(g, "kol", g.panel("kol")->edge("underarm_front")->from, body);
      const Point b = pt(r.g, "kol_sol", q->edge("underarm_front")->to, body);
      ok(q && q->edges.size() == g.panel("kol")->edges.size() && std::fabs(a.x + b.x) < 1e-9 && std::fabs(a.y - b.y) < 1e-9, "  x aynalandi (" + f2(a.x) + " -> " + f2(b.x) + "), kenar sayisi ayni");
      ok(q->closed(&why), "  ayna panel kapali " + why);
      ok(locality(g, r.g, {}, why), "  locality " + why); }

    // ---- closure
    { OpResult r = closure(g, "yan_beden", "zipper", 0.0, 0.6, ctx);
      ok(r.ok && r.g.seam("yan_beden")->closure.type == "zipper" && r.g.seam("yan_beden")->closure.toFraction == 0.6, "closure yan_beden zipper 0..0.6: " + (r.ok ? "ok" : r.hata));
      ok(locality(g, r.g, {}, why), "  locality: paneller bayt-ayni (dikis ozelligi) " + why);
      OpResult n = closure(g, "yan_beden", "zipper", 0.7, 0.6, ctx);
      ok(!n.ok, "  negatif: from > to reddi: " + n.hata);
      OpResult n2 = closure(g, "yok", "zipper", 0.0, 0.6, ctx);
      ok(!n2.ok, "  negatif: olmayan dikis: " + n2.hata); }

    // ---- fitLength KISIT (karar 6): mm yok; cozum bedende. Taban kisitini SILIP yeniden koy: ayni JSON'a doner
    { Garment g0 = g; for (Panel& p : g0.panels) for (Edge& e : p.edges) e.fitSeam.clear(); g0.ops.clear();
      OpResult r = fitLength(g0, "kol", "cap_front", "kol_oyugu", 1.04, 0.0, ctx);
      ok(r.ok, "fitLength cap_front -> kol_oyugu ratio 1.04: " + (r.ok ? "kisit kaydedildi" : r.hata)); if (!r.ok) return 1;
      ok(r.g.panel("kol")->edge("cap_front")->fitSeam == "kol_oyugu" && r.g.seam("kol_oyugu")->ratio == 1.04, "  Edge.fitSeam yazildi, Seam.ratio 1.04");
      ok(r.g.ops.back().op == "fitLength" && r.g.ops.back().args.get("target") && r.g.ops.back().args.get("target")->strOr("seam", "") == "kol_oyugu", "  kayit: fitLength {panel, edge, target{seam, ratio, easeMM}} — bodyId/mm yok");
      ok(locality(g0, r.g, {"kol"}, why), "  locality " + why);
      OpResult r2 = fitLength(r.g, "kol", "cap_back", "kol_oyugu", 1.04, 0.0, ctx);
      ok(r2.ok && toJSONText(r2.g) == toJSONText(g), "  iki kisit -> taban graf.json ile bayt-ayni (kisit = graf durumu)");
      // ayni graf uc bedende: her birinde kapak = 1.04 x oyuk, kaymalar farkli
      double dPrev = NAN; bool allOk = true; std::string ds;
      for (const std::string& bid : {std::string("gercek36"), std::string("EU38"), std::string("croquis36")}) {
          const Body b = bid == "gercek36" ? body : bid == "croquis36" ? Body::fromContract("croquis36") : Body::graded(bid);
          const bool oe = bid == "croquis36";
          CozumSonucu cz = cozumle(r2.g, b, oe, ctx);
          if (!cz.ok) { allOk = false; ds += bid + ": " + cz.hata + " "; continue; }
          const double capF = cz.g.panel("kol")->edge("cap_front")->length(cz.g.panel("kol")->ctxFor(b, oe));
          const double arm = chainLength(cz.g, {{"arka_beden", "armhole_back.1"}, {"arka_beden", "armhole_back.2"}, {"on_beden", "armhole_front.2"}, {"on_beden", "armhole_front.1"}}, b, oe);
          if (std::fabs(capF - 1.04 * arm / 2.0) > 0.05) allOk = false;
          ds += bid + " d=" + f2(cz.cozumler[0].dMM) + " "; if (!std::isnan(dPrev) && std::fabs(cz.cozumler[0].dMM - dPrev) < 1e-6) allOk = false; dPrev = cz.cozumler[0].dMM;
      }
      ok(allOk, "  cozumle uc bedende: kapak yarisi = 1.04 x oyuk / 2 (0.05 mm), kaymalar bedene gore farkli: " + ds);
      OpResult n = fitLength(g0, "on_beden", "shoulder", "omuz", 1.0, 0.0, ctx);
      ok(!n.ok && n.hata.find("kubik") != std::string::npos, "  negatif: dogru kenara kisit reddi: " + n.hata);
      OpResult n2 = fitLength(g0, "kol", "cap_front", "bel", 1.0, 0.0, ctx);
      ok(!n2.ok && n2.hata.find("tarafinda degil") != std::string::npos, "  negatif: kenar dikisin tarafinda degil: " + n2.hata);
      OpResult n3 = fitLength(r2.g, "on_beden", "armhole_front.1", "kol_oyugu", 1.04, 0.0, ctx);
      ok(!n3.ok && n3.hata.find("dongu") != std::string::npos, "  negatif: obur taraf da kisitli (dongu) reddi: " + n3.hata);
      OpResult n4 = fitLength(g0, "kol", "cap_front", "kol_oyugu", 3.5, 0.0, ctx);
      CozumSonucu cz4 = cozumle(n4.g, body, false, ctx);
      ok(n4.ok && !cz4.ok && cz4.hata.find("ulasilamadi") != std::string::npos, "  negatif: ratio 3.5 kisiti bu bedende cozulemez, adiyla: " + cz4.hata);
      OpCtx bos; CozumSonucu cz5 = cozumle(g, body, false, bos);
      ok(!cz5.ok && cz5.hata.find("OpCtx") != std::string::npos, "  negatif: contract cozucu yuklenmeden cozumle reddi: " + cz5.hata); }

    // ---- 2026-09-09 primitifler (Damla karari): sew / merge / drop / addPanel / reshapeEdge kind
    // JSON arg ile (applyOp), grafuygula ve grafciz --ops'un kullandigi yol.
    auto J = [&](const std::string& metin) { JVal v; std::string e; if (!parse(metin, v, e)) throw std::runtime_error("test json: " + e); return v; };
    auto ap = [&](const Garment& g0, const std::string& op, const std::string& args) { return applyOp(g0, {op, J(args)}, ctx); };
    // sew: on orta kat kenari kendi ayna kopyasiyla dikilir (on kapanma) -> fold->seam, onFold=false, cutCount 2
    Garment gSew;
    { OpResult r = ap(g, "sew", R"({"seam":"on_orta","a":[{"panel":"on_beden","edge":"cf"},{"panel":"on_etek","edge":"cf"}],"b":[{"panel":"on_beden","edge":"cf"},{"panel":"on_etek","edge":"cf"}],"reverse":true,"ratio":1})");
      ok(r.ok, "sew on_orta (cf x2, kendi aynasiyla): " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      const Panel* p = r.g.panel("on_beden"); const Panel* q = r.g.panel("on_etek");
      ok(p->edge("cf")->kind == "seam" && q->edge("cf")->kind == "seam", "  cf kenarlari fold -> seam");
      ok(!p->onFold && p->cutCount == 2 && !q->onFold && q->cutCount == 2, "  kat acildi: onFold=false, cutCount=2");
      ok(r.g.seam("on_orta") && r.g.seam("on_orta")->a.size() == 2 && r.g.seam("on_orta")->reverse, "  dikis eklendi (2 kenarli zincir, reverse ilan edildi)");
      ok(locality(g, r.g, {"on_beden", "on_etek"}, why), "  locality: diger 3 panel bayt-ayni " + why);
      OpResult c = ap(r.g, "closure", R"({"seam":"on_orta","type":"buttons","fromFraction":0.05,"toFraction":0.8})");
      ok(c.ok, "  closure buttons on_orta: " + (c.ok ? "ok" : c.hata));
      gSew = c.g;
      { DogrulamaRaporu R2 = dogrula(c.g, body, contract); int topo = 0; for (const Hukum& h : R2.hukumler) if (h.kural == "topoloji" && !h.gecti) ++topo;
        ok(topo == 0, "  dogrulayici topoloji: ayna kapanmasi kabul (0 topoloji kirmizisi)"); }
      OpResult n = ap(g, "sew", R"({"seam":"x","a":[{"panel":"on_beden","edge":"dart_on_beden.1"}],"b":[{"panel":"on_beden","edge":"cf"}],"reverse":false})");
      ok(!n.ok && n.hata.find("pens bacagi") != std::string::npos, "  negatif: dartLeg dikise girmez: " + n.hata);
      OpResult n2 = ap(g, "sew", R"({"seam":"x","a":[{"panel":"on_beden","edge":"cf"}],"b":[{"panel":"on_beden","edge":"cf"}]})");
      ok(!n2.ok && n2.hata.find("reverse") != std::string::npos, "  negatif: reverse ilansiz red: " + n2.hata);
      OpResult n3 = ap(g, "sew", R"({"seam":"omuz","a":[{"panel":"on_beden","edge":"cf"}],"b":[{"panel":"on_beden","edge":"cf"}],"reverse":true})");
      ok(!n3.ok && n3.hata.find("zaten var") != std::string::npos, "  negatif: var olan dikis id: " + n3.hata); }

    // merge: on beden + on etek bel boyunca tek panel; bel dikisi arka icin kalir, ikinci merge ile kalkar
    { OpResult r = ap(g, "merge", R"({"seam":"bel","panelA":"on_beden","panelB":"on_etek","panel":"on_govde"})");
      ok(r.ok, "merge on_beden+on_etek (bel): " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      const Panel* m = r.g.panel("on_govde");
      ok(m && !r.g.panel("on_beden") && !r.g.panel("on_etek") && r.g.panels.size() == 4, "  4 panel: on_govde var, on_beden/on_etek yok");
      ok(m && m->closed(&why), "  birlesik panel kapali: " + why);
      ok(m && m->edge("cf.1") && m->edge("cf.2") && m->edge("hem_front") && m->edge("neck_front") && !m->edge("waist_front.1"), "  kenarlar: cf.1/cf.2 (catisma), hem_front, neck_front; bel kenarlari gitti");
      ok(m && m->darts.size() == 1 && m->reason.find("balik pensi") != std::string::npos && m->reason.find("dart_on_beden.1") != std::string::npos, "  kosudaki pens ciftleri IC HALKA PENS oldu (1 balik pensi), reason'da ADIYLA");
      { DogrulamaRaporu R2 = dogrula(r.g, body, contract); bool sup = true; std::string sat;
        for (const Hukum& h : R2.hukumler) if (h.kural == "supresyon") { sup = h.gecti; sat = h.deger; }
        ok(sup, "  supresyon kapisi ic pensi sayiyor (yesil): " + sat.substr(0, 120));
        Garment back; std::string e2; ok(fromJSONText(toJSONText(r.g), back, e2) && back.panel("on_govde")->darts.size() == 1, "  darts JSON gidis-donus " + e2); }
      const Seam* bel = r.g.seam("bel");
      ok(bel && bel->a.size() == 2 && bel->b.size() == 2 && bel->a[0].panel == "arka_beden", "  bel dikisi arka icin kaldi (2+2 kenar)");
      bool ringOk = false; for (const Ring& ri : r.g.rings) if (ri.id == "etek_ucu") for (const EdgeRef& e : ri.edges) if (e.panel == "on_govde" && e.edge == "hem_front") ringOk = true;
      ok(ringOk, "  halka referanslari yeni panele tasindi (etek_ucu -> on_govde/hem_front)");
      bool belHalka = false; for (const Ring& ri : r.g.rings) if (ri.id == "bel_halka") for (const EdgeRef& e : ri.edges) if (e.panel == "on_govde") belHalka = true;
      ok(!belHalka, "  bel halkasinda on_govde yok (bel kenarlari dustu)");
      ok(locality(g, r.g, {"on_beden", "on_etek"}, why), "  locality: arka_beden/arka_etek/kol bayt-ayni " + why);
      double easeHip = 0, easeBust = 0; for (const RingEase& re : m->ease) { if (re.ring == "girth.hip") easeHip = re.mm; if (re.ring == "girth.bust") easeBust = re.mm; }
      ok(easeHip > 0 && easeBust > 0, "  bolluk birlesti: gogus " + f2(easeBust) + " + kalca " + f2(easeHip));
      OpResult r2 = ap(r.g, "merge", R"({"seam":"bel","panelA":"arka_beden","panelB":"arka_etek","panel":"arka_govde"})");
      ok(r2.ok && !r2.g.seam("bel") && r2.g.panels.size() == 3, "  ikinci merge: bel dikisi kalkti, 3 panel: " + (r2.ok ? "ok" : r2.hata));
      { DogrulamaRaporu R2 = dogrula(r2.g, body, contract); int topo = 0; for (const Hukum& h : R2.hukumler) if (h.kural == "topoloji" && !h.gecti) ++topo;
        ok(topo == 0, "  dogrulayici topoloji 0 kirmizi (kapali, bagli)"); }
      OpResult n = ap(g, "merge", R"({"seam":"bel","panelA":"on_beden","panelB":"arka_etek","panel":"x"})");
      ok(!n.ok, "  negatif: kavsak yapisal esit degil / yanlis cift: " + n.hata);
      OpResult n2 = ap(g, "merge", R"({"seam":"omuz","panelA":"on_beden","panelB":"on_etek","panel":"x"})");
      ok(!n2.ok && n2.hata.find("tasimiyor") != std::string::npos, "  negatif: dikis o panelleri tasimiyor: " + n2.hata); }

    // drop: kol kaldir -> kol_oyugu dikisi gider, oyuk kenarlari cut/faced, kol_agzi halkasi gider
    { OpResult r = ap(g, "drop", R"({"panel":"kol","finish":"faced"})");
      ok(r.ok, "drop kol: " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      ok(!r.g.panel("kol") && !r.g.seam("kol_oyugu") && r.g.seams.size() == g.seams.size() - 2, "  kol yok; kol_oyugu ve kol_alti dikisleri gitti");
      const Edge* e = r.g.panel("on_beden")->edge("armhole_front.1");
      ok(e && e->kind == "cut" && e->finish == "faced" && e->fitSeam.empty(), "  oyuk kenari cut/faced");
      bool agzi = false; for (const Ring& ri : r.g.rings) if (ri.id == "kol_agzi") agzi = true;
      ok(!agzi && r.g.rings.size() == g.rings.size() - 1, "  kol_agzi halkasi gitti, digerleri duruyor");
      { DogrulamaRaporu R2 = dogrula(r.g, body, contract); int topo = 0; for (const Hukum& h : R2.hukumler) if (h.kural == "topoloji" && !h.gecti) ++topo;
        ok(topo == 0, "  dogrulayici topoloji 0 kirmizi (kolsuz giysi bagli)"); }
      OpResult n = ap(g, "drop", R"({"panel":"yok","finish":"faced"})");
      ok(!n.ok && n.hata.find("yok") != std::string::npos, "  negatif: olmayan panel: " + n.hata);
      OpResult n2 = ap(g, "drop", R"({"panel":"kol"})");
      ok(!n2.ok && n2.hata.find("finish") != std::string::npos, "  negatif: finish zorunlu: " + n2.hata); }

    // addPanel onto: on_beden yuzune dikdortgen parca (aplike) -> komsuluk bagli, poz konaktan
    { const char* yama = R"({"onto":"on_beden","panel":{"id":"on_yama","grainDeg":0,"onFold":false,"cutCount":2,"seamAllowanceMM":0,"reason":"test yama","edges":[
        {"id":"ust","kind":"cut","finish":"hem","from":{"landmark":"landmark.waist","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.3,"yLandmark":"landmark.bustLine"},"to":{"landmark":"landmark.waist","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.8,"yLandmark":"landmark.bustLine"}},
        {"id":"dis","kind":"cut","finish":"hem","from":{"landmark":"landmark.waist","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.8,"yLandmark":"landmark.bustLine"},"to":{"landmark":"landmark.waist","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.8,"yLandmark":"landmark.underbust"}},
        {"id":"alt","kind":"cut","finish":"hem","from":{"landmark":"landmark.waist","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.8,"yLandmark":"landmark.underbust"},"to":{"landmark":"landmark.waist","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.3,"yLandmark":"landmark.underbust"}},
        {"id":"ic","kind":"cut","finish":"hem","from":{"landmark":"landmark.waist","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.3,"yLandmark":"landmark.underbust"},"to":{"landmark":"landmark.waist","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.3,"yLandmark":"landmark.bustLine"}}]}})";
      OpResult r = ap(g, "addPanel", yama);
      ok(r.ok, "addPanel on_yama onto on_beden: " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      ok(r.g.panels.size() == 6 && r.g.panel("on_yama")->onto == "on_beden", "  6 panel, onto=on_beden");
      ok(locality(g, r.g, {}, why), "  locality: 5 taban paneli bayt-ayni " + why);
      { DogrulamaRaporu R2 = dogrula(r.g, body, contract); int topo = 0; bool poz = false;
        for (const Hukum& h : R2.hukumler) { if (h.kural == "topoloji" && !h.gecti) ++topo; if (h.kural == "yerlestirme" && h.hedef == "on_yama" && h.gecti) poz = true; }
        ok(topo == 0, "  dogrulayici: komsuluk bagli (onto konak uzerinden), 0 topoloji kirmizisi");
        ok(poz, "  yerlestirme: on_yama konagin pozunu aldi"); }
      ok(toJSONText(r.g).find("\"onto\": \"on_beden\"") != std::string::npos, "  JSON gidis: onto alani yazildi");
      Garment back; std::string e2; ok(fromJSONText(toJSONText(r.g), back, e2) && back.panel("on_yama")->onto == "on_beden", "  JSON donus: onto okundu " + e2);
      OpResult n = ap(g, "addPanel", R"({"onto":"yok","panel":{"id":"p","grainDeg":0,"onFold":false,"cutCount":1,"seamAllowanceMM":0,"edges":[]}})");
      ok(!n.ok, "  negatif: acik panel / olmayan konak: " + n.hata); }

    // reshapeEdge kind: kat kenarinin ust parcasi serbest kenar (yarik) -> cut+finish, panel hala onFold (cf.2 fold)
    { OpResult s1 = subdivide(g, "on_beden", "cf", {0.35}, ctx);
      OpResult r = ap(s1.g, "reshapeEdge", R"({"panel":"on_beden","edge":"cf.1","kind":"cut","finish":"faced"})");
      ok(s1.ok && r.ok, "reshapeEdge cf.1 kind=cut finish=faced (yarik): " + (r.ok ? "ok" : r.hata)); if (!r.ok) return 1;
      const Panel* p = r.g.panel("on_beden");
      ok(p->edge("cf.1")->kind == "cut" && p->edge("cf.1")->finish == "faced" && p->edge("cf.2")->kind == "fold" && p->onFold, "  cf.1 cut/faced, cf.2 fold, panel onFold");
      OpResult r2 = ap(s1.g, "reshapeEdge", R"({"panel":"on_beden","edge":"cf.1","kind":"cut"})");
      ok(!r2.ok && r2.hata.find("finish") != std::string::npos, "  negatif: cut finish'siz red: " + r2.hata);
      OpResult r3 = ap(g, "reshapeEdge", R"({"panel":"on_beden","edge":"dart_on_beden.1","kind":"cut","finish":"hem"})");
      ok(!r3.ok && r3.hata.find("dartLeg") != std::string::npos, "  negatif: dartLeg turu degismez: " + r3.hata);
      OpResult r4 = ap(g, "reshapeEdge", R"({"panel":"on_beden","edge":"cf","kind":"seam"})");
      ok(r4.ok && !r4.g.panel("on_beden")->onFold && r4.g.panel("on_beden")->cutCount == 2, "  kind=seam: kat kalmadi -> onFold=false, cutCount=2"); }

    // replay: yeni op'lar da kayittan yeniden oynatilir (spec-diff)
    { OpResult a1 = ap(g, "merge", R"({"seam":"bel","panelA":"on_beden","panelB":"on_etek","panel":"on_govde"})");
      OpResult a2 = ap(a1.g, "sew", R"({"seam":"on_orta","a":[{"panel":"on_govde","edge":"cf.1"},{"panel":"on_govde","edge":"cf.2"}],"b":[{"panel":"on_govde","edge":"cf.1"},{"panel":"on_govde","edge":"cf.2"}],"reverse":true})");
      OpResult a3 = ap(a2.g, "drop", R"({"panel":"kol","finish":"faced"})");
      ok(a1.ok && a2.ok && a3.ok, "replay hazirlik: merge + sew + drop");
      std::vector<OpRecord> recs(a3.g.ops.begin() + static_cast<long>(ops0), a3.g.ops.end());
      OpResult rr = replay(g, recs, ctx);
      ok(rr.ok && toJSONText(rr.g) == toJSONText(a3.g), "replay(taban, 3 yeni kayit) == zincir sonucu (bayt-ayni)"); }

    // ---- replay + bilinmeyen op
    { OpResult a1 = subdivide(g, "on_beden", "armhole_front.1", {0.4}, ctx);
      OpResult a2 = suppress(a1.g, "on_beden", "waist_front.2", 0.5, 0.2, apex, "pens_bel", true, ctx);
      OpResult a3 = gather(a2.g, "on_etek", "waist_front.2", 1.5, ctx);
      OpResult a4 = extend(a3.g, "on_etek", "hem_front", 50.0, ctx);
      ok(a1.ok && a2.ok && a3.ok && a4.ok, "replay hazirlik: 4 op zinciri");
      std::vector<OpRecord> recs(a4.g.ops.begin() + static_cast<long>(ops0), a4.g.ops.end());
      OpResult rr = replay(g, recs, ctx);
      ok(rr.ok && toJSONText(rr.g) == toJSONText(a4.g), "replay(taban, 4 kayit) == zincir sonucu (bayt-ayni)");
      OpRecord bad; bad.op = "teleport"; bad.args = JVal::obj();
      OpResult n = applyOp(g, bad, ctx);
      ok(!n.ok && n.hata.find("teleport") != std::string::npos, "bilinmeyen op adiyla reddedildi: " + n.hata);
      OpCtx bos; OpResult n2 = gather(g, "on_etek", "waist_front.2", 1.5, bos);
      ok(!n2.ok && n2.hata.find("OpCtx") != std::string::npos, "contract araligi yuklenmeden gather reddi: " + n2.hata); }

    // suppress sonrasi dikilebilirlik: bel dikisi ADIYLA kirmizi (etekte pens yok) — op'un durust sonucu
    { DogrulamaRaporu R = dogrula(gDart, body, contract);
      bool belRed = false; std::string satir;
      for (const Hukum& h : R.hukumler) if (h.kural == "dikis_uzunluk" && h.hedef == "bel" && !h.gecti) { belRed = true; satir = h.deger; }
      ok(belRed, "suppress yalniz govdede -> dogrulayici bel dikisini adiyla kirmizi yakar: " + satir); }

    std::printf("%s graf_op_check — %d kirmizi\n", fails ? "FAIL" : "PASS", fails);
    return fails ? 1 : 0;
}
