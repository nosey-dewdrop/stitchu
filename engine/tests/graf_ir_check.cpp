// graf_ir_check.cpp — F2a kapisi 1: GRAF IR gidis-donus + sema + degerleme.
//
// Hukumler:
//  (a) taban graf -> JSON -> Garment -> JSON BAYT-AYNI (kanonik emit); anahtar sirasi karisik /
//      varsayilanlari atilmis bir belge de ayni kanonik metne duser
//  (b) sema: toJSON(taban) contract/graf-v1.json'a karsi 0 hata; bilinmeyen alan / enum disi deger /
//      eksik zorunlu alan ADIYLA yakalanir (negatif ornekler)
//  (c) parse reddi: bilinmeyen alan, combo agirligi != 1, cozulmeyen EdgeRef, version farki
//  (d) degerleme: AYNI graf gercek36 ve croquis36'da iki farkli kalip verir (bel kenari x'i farkli),
//      graded EU34..EU44 monoton (bel kenari x artar); kenar uzunlugu > 0; dogru kenar uzunlugu ==
//      iki uc arasi uzaklik (1e-9); subdivide parcalarinin toplami butune esit (kubikte duzlestirme
//      artigi icinde); rol PARCALI tasindi (k/n); bilinmeyen landmark adiyla firlatir
//  (e) op kaydi: taban + kayitli op'lar (replay) == yazilan graf (spec-diff deseni)
//  (f) KOSU/ciktilar/graf-ilk/graf.json: --emit ile yazilir; emit'siz koşuda dosya metni tabanla
//      BAYT-AYNI olmali (pin: taban degisti ama dosya yenilenmedi -> kirmizi)
//
// argv: <contract/graf-v1.json> <contract/garment-spec-v2.json> <KOSU/ciktilar/graf-ilk/graf.json> [--emit]
// Sayilar: bolluk mm contract/garment-spec-v2.json quantities.ease*MM (Threads/RTW + Aldrich kaynakli);
// kol bollugu engine/src/sleeve.hpp bicepsEase 0.15 x biceps (Brian default); Bezier ceyrek daire
// katsayisi kappa = 4(sqrt2 - 1)/3 turetilmis; kol kapagi yuksekligi ORANI 0.6 DOGRULANMADI (asagida notes).
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

#include "../src/body.hpp"
#include "../src/graf.hpp"
#include "../src/grafop.hpp"
#include "../src/grafdogrula.hpp"

using namespace stitchu;
using namespace stitchu::graf;

static int fails = 0;
static void ok(bool c, const std::string& msg) { std::printf("  [%s] %s\n", c ? "ok" : "FAIL", msg.c_str()); if (!c) ++fails; }
static std::string f2(double v) { char b[32]; std::snprintf(b, sizeof b, "%.2f", v); return b; }
static std::string readFile(const std::string& p) { std::ifstream f(p); if (!f) throw std::runtime_error("okunamadi: " + p); std::stringstream ss; ss << f.rdbuf(); return ss.str(); }
static double chainLen(const Garment& g, const std::vector<EdgeRef>& refs, const Body& b) { return chainLength(g, refs, b, false); }
static JVal loadJSON(const std::string& p) { JVal v; std::string err; if (!parse(readFile(p), v, err)) throw std::runtime_error(p + ": " + err); return v; }

// ----------------------------------------------------------------- taban graf
static const double kKappa = 4.0 * (std::sqrt(2.0) - 1.0) / 3.0;   // kubik Bezier ceyrek daire katsayisi (turetilmis)

static Anchor L(const std::string& lm, double oran = 1.0) { Anchor a; a.landmark = lm; a.oran = oran; return a; }
static Anchor Q(const std::string& lm, double oran, const std::string& ring = "") { Anchor a; a.landmark = lm; a.xOf = "ringQuarter"; a.ring = ring; a.oran = oran; return a; }
static Anchor Y(Anchor a, const std::string& y1, const std::string& y2 = "", double yOran = 0.0) { a.yLandmark = y1; a.yLandmark2 = y2; a.yOran = yOran; return a; }
static RefPoint P(const Anchor& a) { return RefPoint::of(a); }
static Edge E(const std::string& id, const std::string& kind, const std::string& role, const RefPoint& from, const RefPoint& to) {
    Edge e; e.id = id; e.kind = kind; e.role = role; e.from = from; e.to = to; return e;
}
static Edge C(Edge e, const RefPoint& c1, const RefPoint& c2) { e.control = {c1, c2}; return e; }

struct Ease { double bust, waist, hip, biceps; };

// Govde yarim paneli: on (nape yok, neckFront var) ya da arka
static Panel govde(bool on, const Ease& ez) {
    Panel p; p.id = on ? "on_beden" : "arka_beden"; p.onFold = true; p.cutCount = 1;
    p.bolluk = {{"girth.bust", ez.bust}, {"girth.waist", ez.waist}};
    p.gerekce = on ? "on govde (kat)" : "arka govde (kat)";
    const std::string top = on ? "landmark.neckFront" : "landmark.nape";
    const RefPoint vTop = P(L(top, 0.0));                                     // CF/CB ust
    const RefPoint vWaistC = P(L("landmark.waist", 0.0));                    // CF/CB bel
    const RefPoint vWaistS = P(Q("landmark.waist", 1.0));                    // yan bel (cevre/4 + bolluk)
    const RefPoint vUnder = P(Q("landmark.underarm", 1.0, "girth.bust"));    // yan koltukalti (gogus/4 + bolluk, koltukalti y)
    const RefPoint vTip = P(L("landmark.shoulderTip"));
    const RefPoint vNeck = P(L("landmark.neckBase"));
    const std::string s = on ? "front" : "back";
    Edge cf = E(on ? "cf" : "cb", "fold", on ? "cf" : "cb", vTop, vWaistC);
    Edge waist = E("waist_" + s, "seam", "waist_" + s, vWaistC, vWaistS); waist.notches = {0.5};
    Edge side = E("side_" + s, "seam", "side_" + s, vWaistS, vUnder); side.notches = {0.5};
    // kol oyugu IKI kenar (rol parcali 1/2, 2/2): alt = koltukaltindan cross-front/back noktasina (yatay ->
    // dusey teget), ust = oradan omuz ucuna (hafif icbukey). Icbukey nokta x = width.crossFront/2 (body-v1
    // genislikler, Aldrich/Mueller), y = koltukalti->omuz ucu dususunun ortasi (0.5, DOGRULANMADI: notes).
    const std::string crossW = on ? "width.crossFront" : "width.crossBack";
    Anchor crossA; crossA.landmark = "landmark.underarm"; crossA.xOf = "scalarHalf"; crossA.ring = crossW; crossA.oran = 1.0;
    const RefPoint vCross = P(Y(crossA, "landmark.underarm", "landmark.shoulderTip", 0.5));
    const RefPoint pCrossUnderY = P(crossA);                                  // cross x, koltukalti y
    const RefPoint a1c1 = affine({{1.0 - kKappa, vUnder}, {kKappa, pCrossUnderY}});
    const RefPoint a1c2 = P(Y(crossA, "landmark.underarm", "landmark.shoulderTip", 0.5 * kKappa));
    Edge arm1 = C(E("armhole_" + s + ".1", "seam", "armhole_" + s, vUnder, vCross), a1c1, a1c2); arm1.rolePart = 1; arm1.roleCount = 2;
    const RefPoint a2c1 = P(Y(crossA, "landmark.underarm", "landmark.shoulderTip", 0.5 + 0.5 * kKappa));
    const RefPoint pCrossTipY = P(Y(crossA, "landmark.shoulderTip"));
    const RefPoint a2c2 = affine({{1.0 - kKappa, vTip}, {kKappa, pCrossTipY}});
    Edge arm2 = C(E("armhole_" + s + ".2", "seam", "armhole_" + s, vCross, vTip), a2c1, a2c2); arm2.rolePart = 2; arm2.roleCount = 2;
    Edge sh = E("shoulder", "seam", "shoulder", vTip, vNeck);
    // yaka: omuz-boyun noktasinda dusey teget, CF/CB'de yatay teget
    const RefPoint n1 = P(Y(L("landmark.neckBase"), "landmark.neckBase", top, kKappa));
    const RefPoint n2 = P(Y(L("landmark.neckBase", kKappa), top));
    Edge neck = C(E("neck_" + s, "cut", "neck_" + s, vNeck, vTop), n1, n2); neck.finish = "faced";
    p.edges = {cf, waist, side, arm1, arm2, sh, neck};
    return p;
}
static Panel etek(bool on, const Ease& ez) {
    Panel p; p.id = on ? "on_etek" : "arka_etek"; p.onFold = true; p.cutCount = 1;
    p.bolluk = {{"girth.waist", ez.waist}, {"girth.hip", ez.hip}};
    p.gerekce = on ? "on etek (kat)" : "arka etek (kat)";
    const std::string s = on ? "front" : "back";
    const RefPoint vWaistC = P(L("landmark.waist", 0.0));
    const RefPoint vHemC = P(L("landmark.knee", 0.0));
    const RefPoint vHemS = P(Y(Q("landmark.hip", 1.0), "landmark.knee"));   // kalca genisligi diz hizasinda (duz etek)
    const RefPoint vHip = P(Q("landmark.hip", 1.0));
    const RefPoint vWaistS = P(Q("landmark.waist", 1.0));
    Edge cf = E(on ? "cf" : "cb", "fold", on ? "cf" : "cb", vWaistC, vHemC);
    Edge hem = E("hem_" + s, "cut", "hem_" + s, vHemC, vHemS); hem.finish = "hem";
    Edge side1 = E("side_" + s + ".1", "seam", "side_" + s, vHemS, vHip); side1.rolePart = 1; side1.roleCount = 2;
    Edge side2 = E("side_" + s + ".2", "seam", "side_" + s, vHip, vWaistS); side2.rolePart = 2; side2.roleCount = 2;
    Edge waist = E("waist_" + s, "seam", "waist_" + s, vWaistS, vWaistC); waist.notches = {0.5};
    p.edges = {cf, hem, side1, side2, waist};
    return p;
}
static Panel kol(const Ease& ez) {
    Panel p; p.id = "kol"; p.onFold = false; p.cutCount = 2;
    p.bolluk = {{"girth.biceps", ez.biceps}};
    p.gerekce = "kol (2 kes)";
    // kapak tepesi: x=0, y koltukalti->omuz ucu dususunun 0.6'si (DOGRULANMADI, notes)
    const double capOran = 0.6;
    const RefPoint vTop = P(Y(Q("landmark.underarm", 0.0, "girth.biceps"), "landmark.underarm", "landmark.shoulderTip", capOran));
    const RefPoint vF = P(Q("landmark.underarm", 2.0, "girth.biceps"));       // on kose (+G/2)
    const RefPoint vB = P(Q("landmark.underarm", -2.0, "girth.biceps"));      // arka kose (-G/2)
    const RefPoint hF = P(Y(Q("landmark.underarm", 2.0, "girth.biceps"), "landmark.elbow"));
    const RefPoint hB = P(Y(Q("landmark.underarm", -2.0, "girth.biceps"), "landmark.elbow"));
    // kapak egrileri: tepede yatay, kosede dusey teget
    const RefPoint cF1 = P(Y(Q("landmark.underarm", 2.0 * kKappa, "girth.biceps"), "landmark.underarm", "landmark.shoulderTip", capOran));
    const RefPoint cF2 = P(Y(Q("landmark.underarm", 2.0, "girth.biceps"), "landmark.underarm", "landmark.shoulderTip", capOran * kKappa));
    const RefPoint cB1 = P(Y(Q("landmark.underarm", -2.0, "girth.biceps"), "landmark.underarm", "landmark.shoulderTip", capOran * kKappa));
    const RefPoint cB2 = P(Y(Q("landmark.underarm", -2.0 * kKappa, "girth.biceps"), "landmark.underarm", "landmark.shoulderTip", capOran));
    Edge capF = C(E("cap_front", "seam", "sleeve_cap", vTop, vF), cF1, cF2); capF.rolePart = 1; capF.roleCount = 2;
    Edge uaF = E("underarm_front", "seam", "sleeve_underarm", vF, hF);
    Edge hem = E("hem", "cut", "sleeve_hem", hF, hB); hem.finish = "hem";
    Edge uaB = E("underarm_back", "seam", "sleeve_underarm", hB, vB);
    Edge capB = C(E("cap_back", "seam", "sleeve_cap", vB, vTop), cB1, cB2); capB.rolePart = 2; capB.roleCount = 2;
    p.edges = {capF, uaF, hem, uaB, capB};
    return p;
}

static Garment tabanBase(const Ease& ez) {
    Garment g; g.id = "taban-elbise";
    g.notes = "TABAN GRAF (F2a fixture). Bolluk: contract/garment-spec-v2.json quantities easeBustMM/easeWaistMM/easeHipMM "
              "(Threads/RTW + Aldrich); kol bollugu engine/src/sleeve.hpp bicepsEase 0.15 x girth.biceps (Brian default). "
              "Yan dikis ve bel iki tarafta cevre/4 (ringQuarter): on/arka yan dikisler insadan esit. Egri kontrol noktalari "
              "kubik ceyrek-daire katsayisi kappa=4(sqrt2-1)/3 ile (turetilmis). UYDURULANLAR ADIYLA: (1) kol kapagi yuksekligi "
              "koltukalti->omuz ucu dususunun 0.6'si — DOGRULANMADI; Aldrich EU38 kapak bandi 130-150 mm'nin altinda kalir, cunku "
              "taban kol oyugu (scye depth bollugu yok) Aldrich 40-44 cm bandinin altinda; oyugun icbukey noktasi width.crossFront/2 "
              "(body-v1), y'si dususun ortasi (0.5, DOGRULANMADI); F2b/F3 oyugu ve kapagi kaynakli kurar. (2) etek duz (kalca genisligi dize kadar). (3) yaka pervazli (faced), etek ucu kivrilir (hem). "
              "Kapak uzunlugu fitLength ile gercek36'da kol oyugu x 1.04'e (sleeve.hpp capEase) cozuldu; kaydi ops'ta (bulge).";
    g.panels = {govde(true, ez), govde(false, ez), etek(true, ez), etek(false, ez), kol(ez)};
    Seam omuz; omuz.id = "omuz"; omuz.a = {{"on_beden", "shoulder"}}; omuz.b = {{"arka_beden", "shoulder"}}; omuz.gerekce = "omuz dikisi";
    Seam yan; yan.id = "yan_beden"; yan.a = {{"on_beden", "side_front"}}; yan.b = {{"arka_beden", "side_back"}}; yan.notchFractions = {0.5}; yan.gerekce = "govde yan dikisi";
    Seam oyuk; oyuk.id = "kol_oyugu"; oyuk.a = {{"kol", "cap_back"}, {"kol", "cap_front"}}; oyuk.b = {{"arka_beden", "armhole_back.1"}, {"arka_beden", "armhole_back.2"}, {"on_beden", "armhole_front.1"}, {"on_beden", "armhole_front.2"}};
    oyuk.ratio = 1.04; oyuk.gerekce = "kol kapagi -> kol oyugu; ratio 1.04 = cap ease (engine/src/sleeve.hpp capEase 0.04, dokuma 3-5%)";
    Seam bel; bel.id = "bel"; bel.a = {{"on_beden", "waist_front"}, {"arka_beden", "waist_back"}}; bel.b = {{"on_etek", "waist_front"}, {"arka_etek", "waist_back"}};
    bel.notchFractions = {0.25, 0.75}; bel.gerekce = "bel dikisi (govde -> etek)";
    Seam yanE; yanE.id = "yan_etek"; yanE.a = {{"on_etek", "side_front.1"}, {"on_etek", "side_front.2"}}; yanE.b = {{"arka_etek", "side_back.1"}, {"arka_etek", "side_back.2"}}; yanE.gerekce = "etek yan dikisi";
    Seam kolAlti; kolAlti.id = "kol_alti"; kolAlti.a = {{"kol", "underarm_front"}}; kolAlti.b = {{"kol", "underarm_back"}}; kolAlti.gerekce = "kol alti dikisi";
    g.seams = {omuz, yan, oyuk, bel, yanE, kolAlti};
    g.rings = {
        {"yaka", "neck", {{"arka_beden", "neck_back"}, {"on_beden", "neck_front"}}},
        {"kol_oyugu_halka", "armhole", {{"on_beden", "armhole_front.1"}, {"on_beden", "armhole_front.2"}, {"arka_beden", "armhole_back.2"}, {"arka_beden", "armhole_back.1"}}},
        {"bel_halka", "waist_ring", {{"on_beden", "waist_front"}, {"arka_beden", "waist_back"}}},
        {"etek_ucu", "hem", {{"on_etek", "hem_front"}, {"arka_etek", "hem_back"}}},
        {"kol_agzi", "sleeve_hem", {{"kol", "hem"}}},
    };
    return g;
}

int main(int argc, char** argv) {
    if (argc < 4) { std::fprintf(stderr, "kullanim: graf_ir_check <graf-v1.json> <garment-spec-v2.json> <graf.json> [--emit]\n"); return 2; }
    const std::string contractPath = argv[1], specPath = argv[2], outPath = argv[3];
    const bool emitMode = argc > 4 && std::string(argv[4]) == "--emit";
    const JVal contract = loadJSON(contractPath);
    const JVal spec = loadJSON(specPath);
    const JVal* q = spec.get("quantities");
    if (!q) { std::fprintf(stderr, "garment-spec-v2.json quantities yok\n"); return 2; }
    const Body gercek = Body::fromContract("gercek36"), croquis = Body::fromContract("croquis36");
    Ease ez;
    ez.bust = q->get("easeBustMM")->numOr("default", NAN); ez.waist = q->get("easeWaistMM")->numOr("default", NAN); ez.hip = q->get("easeHipMM")->numOr("default", NAN);
    ez.biceps = 0.15 * gercek.ring("girth.biceps");   // sleeve.hpp bicepsEase
    std::printf("graf_ir_check — bolluk mm: bust %.1f waist %.1f hip %.1f biceps %.1f (kaynaklar dosya basinda)\n", ez.bust, ez.waist, ez.hip, ez.biceps);
    const OpCtx octx = OpCtx::fromContract(contract);
    ok(octx.dolu, "OpCtx araliklari contract'tan doldu");

    // taban + kapak fit (gercek36)
    Garment base = tabanBase(ez);
    const double armhole = chainLen(base, {{"arka_beden", "armhole_back.1"}, {"arka_beden", "armhole_back.2"}, {"on_beden", "armhole_front.1"}, {"on_beden", "armhole_front.2"}}, gercek);
    const double capTarget = 1.04 * armhole;
    // iki kapak yarisi ayni bulge ile: once on yariya, hedef = capTarget/2
    OpResult r1 = fitLength(base, "kol", "cap_front", capTarget / 2.0, gercek, false, 120.0, 0.05, octx);
    ok(r1.ok, "fitLength cap_front -> " + f2(capTarget / 2.0) + " mm: " + (r1.ok ? "cozuldu" : r1.hata));
    if (!r1.ok) return 1;
    OpResult r2 = fitLength(r1.g, "kol", "cap_back", capTarget / 2.0, gercek, false, 120.0, 0.05, octx);
    ok(r2.ok, "fitLength cap_back  -> " + f2(capTarget / 2.0) + " mm: " + (r2.ok ? "cozuldu" : r2.hata));
    if (!r2.ok) return 1;
    Garment g = r2.g;
    ok(g.ops.size() == 2 && g.ops[0].op == "bulge" && g.ops[1].op == "bulge", "op gecmisi: 2 bulge kaydi");
    { const double capLen = chainLen(g, {{"kol", "cap_back"}, {"kol", "cap_front"}}, gercek);
      ok(std::fabs(capLen - capTarget) <= 0.1, "kol kapagi " + f2(capLen) + " == 1.04 x oyuk " + f2(armhole) + " = " + f2(capTarget) + " (gercek36)"); }

    // (a) gidis-donus bayt-ayni
    const std::string t1 = toJSONText(g);
    Garment g2; std::string err;
    ok(fromJSONText(t1, g2, err), "JSON -> Garment parse: " + (err.empty() ? "ok" : err));
    const std::string t2 = toJSONText(g2);
    ok(t1 == t2, "emit(parse(emit(g))) == emit(g) — " + std::to_string(t1.size()) + " bayt");
    {   // anahtar sirasi karisik + varsayilanlar atilmis belge -> ayni kanonik metin
        JVal v; parse(t1, v, err);
        JVal& panel0 = v.get("panels") ? const_cast<JVal&>(*v.get("panels")).a[0] : v;
        std::reverse(panel0.o.begin(), panel0.o.end());
        JVal& e0 = const_cast<JVal&>(*panel0.get("edges")).a[1];
        std::reverse(e0.o.begin(), e0.o.end());
        std::string shuffled = emit(v);
        Garment g3; ok(fromJSONText(shuffled, g3, err) && toJSONText(g3) == t1, "karisik anahtar sirasi -> ayni kanonik metin");
    }
    // (b) sema
    { std::vector<std::string> hs; ok(semaKapsar(contract, g, hs), "sema: toJSON(taban) contract/graf-v1.json ile 0 hata" + (hs.empty() ? "" : " — " + hs[0]));
      JVal v = toJSON(g); const_cast<JVal&>(*v.get("panels")).a[0].set("uydurma", JVal::num(1)); hs.clear();
      ok(!semaDogrula(v, contract, hs) && !hs.empty() && hs[0].find("uydurma") != std::string::npos, "sema negatif: bilinmeyen alan adiyla yakalandi: " + (hs.empty() ? "" : hs[0]));
      JVal v2 = toJSON(g); const_cast<JVal&>(*const_cast<JVal&>(*v2.get("panels")).a[0].get("edges")).a[0].set("kind", JVal::str("zigzag")); hs.clear();
      ok(!semaDogrula(v2, contract, hs) && !hs.empty() && hs[0].find("zigzag") != std::string::npos, "sema negatif: enum disi kind yakalandi: " + (hs.empty() ? "" : hs[0]));
      JVal v3 = toJSON(g); JVal& s0 = const_cast<JVal&>(*v3.get("seams")).a[0]; s0.o.erase(s0.o.begin() + 3); hs.clear();   // ratio sil
      ok(!semaDogrula(v3, contract, hs) && !hs.empty() && hs[0].find("ratio") != std::string::npos, "sema negatif: eksik zorunlu alan (ratio) yakalandi: " + (hs.empty() ? "" : hs[0]));
      // contract op tablosu == kodun op adlari
      const JVal* oplar = contract.get("oplar"); bool allOps = oplar != nullptr;
      for (const std::string& ad : opAdlari()) if (!oplar || !oplar->get(ad)) { allOps = false; std::printf("      contract oplar eksik: %s\n", ad.c_str()); }
      ok(allOps, "contract oplar tablosu kodun " + std::to_string(opAdlari().size()) + " op adini tasiyor"); }
    // (c) parse reddi
    { Garment x; std::string e2;
      ok(!fromJSONText("{\"id\":\"a\",\"version\":\"graf-v1\",\"panels\":[],\"seams\":[],\"rings\":[],\"ops\":[],\"renk\":1}", x, e2) && e2.find("renk") != std::string::npos, "parse reddi: bilinmeyen alan 'renk' adiyla: " + e2);
      ok(!fromJSONText("{\"id\":\"a\",\"version\":\"graf-v0\",\"panels\":[]}", x, e2) && e2.find("version") != std::string::npos, "parse reddi: version farki: " + e2);
      { JVal cv; std::string ce; parse("{\"combo\":[{\"w\":0.6,\"landmark\":\"landmark.waist\",\"oran\":1,\"ofsetMM\":0},{\"w\":0.6,\"landmark\":\"landmark.hip\",\"oran\":1,\"ofsetMM\":0}]}", cv, ce);
        RefPoint rp; ok(!fromJSON(cv, rp, e2) && e2.find("1'e toplanmiyor") != std::string::npos, "parse reddi: combo agirliklari 1.2: " + e2); }
      std::string bad = t1; const size_t pos = bad.find("\"edge\": \"shoulder\""); bad.replace(pos, 18, "\"edge\": \"yok_boyle\"");
      ok(!fromJSONText(bad, x, e2) && e2.find("yok_boyle") != std::string::npos, "parse reddi: cozulmeyen EdgeRef adiyla: " + e2); }
    // (d) degerleme: iki beden
    { const Panel* on = g.panel("on_beden"); const Edge* w = on->edge("waist_front");
      const Edge* sh = on->edge("shoulder");
      const Point pg = eval(sh->from, on->ctxFor(gercek)), pc = eval(sh->from, on->ctxFor(croquis));
      const Point ug = eval(w->to, on->ctxFor(gercek)), uc = eval(on->edge("side_front")->to, on->ctxFor(croquis));
      ok(std::fabs(pg.x - pc.x) > 1.0 && std::fabs(pg.y - pc.y) > 1.0, "ayni graf, iki beden: omuz ucu gercek36 (" + f2(pg.x) + ", " + f2(pg.y) + ") vs croquis36 (" + f2(pc.x) + ", " + f2(pc.y) + ")");
      ok(std::fabs(eval(on->edge("side_front")->to, on->ctxFor(gercek)).y - uc.y) > 1.0, "ayni graf, iki beden: koltukalti y gercek36 " + f2(eval(on->edge("side_front")->to, on->ctxFor(gercek)).y) + " vs croquis36 " + f2(uc.y) + " (kalip vs flat)");
      const Point pg2 = ug;
      ok(std::fabs(pg2.x - ((gercek.ring("girth.waist") + ez.waist) / 4.0)) < 1e-9, "ringQuarter: yan bel x == (bel cevresi + bolluk)/4 = " + f2(pg2.x) + " (kumas = bedene bolluk alani)");
      double prev = -1; bool mono = true;
      for (const std::string& sz : Body::gradeSizes()) { const Body b = Body::graded(sz); const double x = eval(w->to, on->ctxFor(b)).x; if (x <= prev) mono = false; prev = x; }
      ok(mono, "graded EU34..EU44: yan bel x monoton artar (ayni graf, alti kalip)");
      const Edge* side = on->edge("side_front");
      const EvalCtx cx = on->ctxFor(gercek);
      ok(std::fabs(side->length(cx) - distance(eval(side->from, cx), eval(side->to, cx))) < 1e-9, "dogru kenar uzunlugu == uc uzakligi (" + f2(side->length(cx)) + " mm)");
      const Edge* arm = on->edge("armhole_front.1");
      const std::vector<Edge> parts = arm->subdivide({0.3, 0.7});
      double sum = 0; for (const Edge& e : parts) sum += e.length(cx);
      ok(parts.size() == 3 && std::fabs(sum - arm->length(cx)) < 0.5, "subdivide(0.3,0.7): 3 parca, toplam " + f2(sum) + " ~ butun " + f2(arm->length(cx)) + " (duzlestirme artigi < 0.5 mm)");
      ok(parts[0].role == "armhole_front" && parts[0].rolePart == 1 && parts[0].roleCount == 6 && parts[2].rolePart == 3, "rol PARCALI tasindi: armhole_front 1/2 -> 1/6, 2/6, 3/6 (ust uste bolme)");
      ok(parts[0].to == parts[1].from && parts[1].to == parts[2].from, "parcalar yapisal olarak zincirli (RefPoint esitligi)");
      const Point mid = eval(parts[0].to, cx), midDirect = arm->at(cx, 0.3);
      ok(distance(mid, midDirect) < 1e-6, "De Casteljau bolme noktasi == cubicPoint(0.3) (" + f2(distance(mid, midDirect)) + " mm)");
      Anchor bad = L("landmark.kuyruk"); bool threw = false; std::string what;
      try { eval(bad, cx); } catch (const std::exception& ex) { threw = true; what = ex.what(); }
      ok(threw && what.find("kuyruk") != std::string::npos, "bilinmeyen landmark adiyla firlatir: " + what); }
    // (e) replay
    { OpResult rr = replay(base, g.ops, octx);
      ok(rr.ok && toJSONText(rr.g) == t1, "replay(taban, ops) == graf (spec-diff: kayitlar yeniden oynatilabilir)"); }
    // (f) dosya
    if (emitMode) {
        std::ofstream f(outPath); f << t1; f.close();
        std::printf("  yazildi: %s (%zu bayt)\n", outPath.c_str(), t1.size());
    } else {
        std::string disk; bool okRead = true;
        try { disk = readFile(outPath); } catch (...) { okRead = false; }
        ok(okRead && disk == t1, "KOSU/ciktilar/graf-ilk/graf.json bayt-ayni (degil ise: graf_ir_check ... --emit)");
    }
    std::printf("%s graf_ir_check — %d kirmizi\n", fails ? "FAIL" : "PASS", fails);
    return fails ? 1 : 0;
}
