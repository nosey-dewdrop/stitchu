// graf_dikilebilir_check.cpp — F2a kapisi 3: DOGRULAYICI + SANAL DIKIS.
//  (a) taban graf gercek36'da DIKILEBILIR (0 kirmizi hukum): panel kapali, referans, kenar turu,
//      dikis uzunluk (6 dikis), centik (bel 2 + yan 1), kendini kesme (5 panel), halka kapanma (5 halka)
//  (b) her kural icin onu KIRAN bir ornek, kural ADIYLA kirmizi (yalniz o kural + ondan turemesi
//      beklenenler); sanal dikis: yan dikis uzatilinca kol oyugu ve bel halkalari kavsakta acilir,
//      omuz dikisi silinince yaka halkasi KOPUK
//  (c) tolerans sozlesmeden: toleranslar bloğu bosaltilmis contract ile dogrulayici ADIYLA reddeder
//  (d) EU38 ve croquis36'da AYNI graf 0 kirmizi (karar 6): kapak kisiti her bedende degerleme aninda cozulur,
//      kol_oyugu artigi uc bedende de tolerans icinde; istisna yok
//  (e) karar 7: dikis_zincir 6 dikiste yesil; zincir sirasi bozulunca adiyla kirmizi; reverse yanlis ilan edilince
//      halka (kol agzi) KOPUK
//  (f) karar 4a/5: rapor 'uydurma' kalemlerini (notes DOGRULANMADI) ve esik+kaynak tablosunu tasir
//  --emit: KOSU/ciktilar/graf-ilk/dikilebilir-<beden>.json/.md + dikilebilir-negatif.md yazar
// argv: <contract/graf-v1.json> <graf.json> <cikti-dizini> [--emit]
#include <cmath>
#include <cstdio>
#include <fstream>
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
static void writeFile(const std::string& p, const std::string& s) { std::ofstream f(p); f << s; }

static std::vector<std::string> reds(const DogrulamaRaporu& R, const std::string& kural = "") {
    std::vector<std::string> out;
    for (const Hukum& h : R.hukumler) if (!h.bilgi && !h.gecti && (kural.empty() || h.kural == kural)) out.push_back(h.kural + " | " + h.hedef + " | " + h.deger);
    return out;
}
static std::string join(const std::vector<std::string>& v) { std::string s; for (const std::string& x : v) s += (s.empty() ? "" : " ;; ") + x; return s; }

struct Negatif { std::string kural, ornek; std::vector<std::string> kirmizi; bool hedefKuralKirmizi; };

int main(int argc, char** argv) {
    if (argc < 4) { std::fprintf(stderr, "kullanim: graf_dikilebilir_check <graf-v1.json> <graf.json> <cikti-dizini> [--emit]\n"); return 2; }
    const bool emitMode = argc > 4 && std::string(argv[4]) == "--emit";
    const std::string outDir = argv[3];
    JVal contract; std::string err;
    if (!parse(readFile(argv[1]), contract, err)) { std::fprintf(stderr, "contract: %s\n", err.c_str()); return 2; }
    Garment g;
    if (!fromJSONText(readFile(argv[2]), g, err)) { std::fprintf(stderr, "graf.json: %s\n", err.c_str()); return 2; }
    const OpCtx ctx = OpCtx::fromContract(contract);
    const Body gercek = Body::fromContract("gercek36");

    // (a) taban dikilebilir
    DogrulamaRaporu R = dogrula(g, gercek, contract);
    std::printf("graf_dikilebilir_check — %s @ %s: %zu hukum, %d kirmizi\n", g.id.c_str(), gercek.id().c_str(), R.hukumler.size(), R.kirmizi());
    for (const Hukum& h : R.hukumler) if (!h.bilgi && !h.gecti) std::printf("      KIRMIZI %s | %s | %s\n", h.kural.c_str(), h.hedef.c_str(), h.deger.c_str());
    ok(R.dikilebilir(), "taban graf gercek36'da DIKILEBILIR (0 kirmizi)");
    auto count = [&](const std::string& k, bool onlyPass) { int n = 0; for (const Hukum& h : R.hukumler) if (h.kural == k && !h.bilgi && (!onlyPass || h.gecti)) ++n; return n; };
    ok(count("dikis_uzunluk", true) == 6, "6 dikis uzunluk hukmu yesil (" + std::to_string(count("dikis_uzunluk", true)) + ")");
    ok(count("centik", true) == 3, "3 centik hukmu yesil (bel 0.25/0.75 + yan 0.5)");
    ok(count("kendini_kesme", true) == 5, "5 panel kendini kesmiyor");
    ok(count("halka_kapanma", true) == 5, "5 halka kapaniyor (yaka, kol oyugu, bel, etek ucu, kol agzi)");
    ok(count("panel_kapali", true) == 5, "5 panel kapali");
    ok(count("dikis_zincir", true) == 6, "6 dikis zinciri yapisal cozuldu (karar 7): " + std::to_string(count("dikis_zincir", true)));
    ok(R.uydurmalar.size() >= 2 && R.toJSON().get("uydurma") && R.toJSON().get("uydurma")->a.size() == R.uydurmalar.size() && R.toMarkdown().find("## Uydurma") != std::string::npos,
       "rapor 'uydurma' bolumu: " + std::to_string(R.uydurmalar.size()) + " DOGRULANMADI kalemi (JSON + markdown)");
    for (const std::string& u : R.uydurmalar) std::printf("      uydurma: %s\n", u.c_str());
    ok(R.toleranslar.size() == 4 && R.toMarkdown().find("| tolerans | mm | kaynak |") != std::string::npos, "rapor basliginda 4 esik kaynak sutunuyla (karar 5)");
    { int fit = 0; for (const Hukum& h : R.hukumler) if (h.kural == "kisit" && h.bilgi && h.gecti && h.hedef.rfind("kol/", 0) == 0) ++fit;
      ok(fit == 2, "2 kisit (cap_front/cap_back) gercek36'da cozuldu, bilgi satirinda kontrol kaymasi mm"); }
    for (const DikisSatir& d : R.dikisler) std::printf("      dikis %-12s a %8.2f hedef %8.2f artik %+7.3f  uc-bosluk %6.2f\n", d.seam.c_str(), d.lenA, d.hedefA, d.artikMM, d.ucBoslukMM);
    for (const HalkaSatir& h : R.halkalar) std::printf("      halka %-16s %-11s toplam %8.2f kapanma %6.3f  %s\n", h.ring.c_str(), h.role.c_str(), h.toplamMM, h.kapanmaMM, h.kavsaklar.c_str());
    bool allPlaced = true; for (const PanelPoz& p : R.pozlar) if (!p.yerlesti) allPlaced = false;
    ok(allPlaced, "sanal dikis: 5 panel de dikis agacinda rijit yerlesti (kopuk parca yok)");
    { const DikisSatir* oy = nullptr; for (const DikisSatir& d : R.dikisler) if (d.seam == "kol_oyugu") oy = &d;
      ok(oy && std::fabs(oy->artikMM) <= 0.1, "kol kapagi = 1.04 x oyuk gercek36'da (artik " + (oy ? f2(oy->artikMM) : "?") + " mm; fitLength kaydi ops'ta)"); }
    if (emitMode) { writeFile(outDir + "/dikilebilir-gercek36.json", emit(R.toJSON()) + "\n"); writeFile(outDir + "/dikilebilir-gercek36.md", R.toMarkdown()); }

    // (d) diger bedenler: AYNI graf, 0 kirmizi (karar 6: kisit her bedende cozulur)
    for (const std::string& bid : {std::string("EU38"), std::string("croquis36")}) {
        const Body b = bid == "croquis36" ? Body::fromContract("croquis36") : Body::graded(bid);
        DogrulamaRaporu Rb = dogrula(g, b, contract, bid == "croquis36");
        const DikisSatir* oy = nullptr; for (const DikisSatir& d : Rb.dikisler) if (d.seam == "kol_oyugu") oy = &d;
        std::printf("      %s: %d kirmizi; kol_oyugu a %.2f hedef %.2f artik %+.3f mm (kisit bu bedende cozuldu)\n", bid.c_str(), Rb.kirmizi(), oy ? oy->lenA : NAN, oy ? oy->hedefA : NAN, oy ? oy->artikMM : NAN);
        for (const std::string& s : reds(Rb)) std::printf("        KIRMIZI %s\n", s.c_str());
        ok(Rb.dikilebilir(), bid + ": 0 kirmizi — ayni graf bu bedende de DIKILEBILIR (istisna yok)");
        ok(oy && std::fabs(oy->artikMM) <= 0.1, bid + ": kol kapagi = 1.04 x oyuk (artik " + (oy ? f2(oy->artikMM) : "?") + " mm)");
        if (emitMode) { writeFile(outDir + "/dikilebilir-" + bid + ".json", emit(Rb.toJSON()) + "\n"); writeFile(outDir + "/dikilebilir-" + bid + ".md", Rb.toMarkdown()); }
    }

    // (b) negatif ornekler — kural adiyla
    std::vector<Negatif> negs;
    auto neg = [&](const std::string& kural, const std::string& ornek, const Garment& gx) {
        DogrulamaRaporu Rx = dogrula(gx, gercek, contract);
        Negatif n{kural, ornek, reds(Rx), !reds(Rx, kural).empty()};
        negs.push_back(n);
        ok(n.hedefKuralKirmizi, "negatif [" + kural + "] " + ornek + " -> " + (n.hedefKuralKirmizi ? reds(Rx, kural)[0] : "KURAL KIRMIZI DEGIL (" + join(n.kirmizi) + ")"));
    };
    { Garment x = g; Panel* p = x.panel("on_etek"); p->edges[1].from = p->edges[2].from;   // hem.from != cf.to
      neg("panel_kapali", "on_etek hem_front.from koparildi", x); }
    { Garment x = g; x.seams[0].b[0].edge = "yok_boyle"; neg("referans", "omuz.b -> arka_beden/yok_boyle", x); }
    { Garment x = g; x.panel("on_etek")->edge("hem_front")->finish.clear(); neg("kenar_turu", "on_etek/hem_front cut kenarinin finish'i silindi", x); }
    { Garment x = g; x.seams.erase(x.seams.begin());   // omuz dikisi yok
      neg("kenar_turu", "omuz dikisi silindi -> shoulder seam-kenarlari dikissiz", x);
      DogrulamaRaporu Rx = dogrula(x, gercek, contract); bool yakaKopuk = false;
      for (const Hukum& h : Rx.hukumler) if (h.kural == "halka_kapanma" && h.hedef.rfind("yaka", 0) == 0 && !h.gecti && h.deger.find("KOPUK") != std::string::npos) yakaKopuk = true;
      ok(yakaKopuk, "negatif [halka_kapanma] omuz dikisi yokken yaka halkasi KAVSAK YOK ile KOPUK");
      negs.push_back({"halka_kapanma", "omuz dikisi silindi -> yaka halkasi kopuk", reds(Rx), yakaKopuk}); }
    { Garment x = g; x.panel("on_beden")->onFold = false; neg("kenar_turu", "on_beden onFold=false ama cf fold kenari", x); }
    { Anchor apexA; apexA.landmark = "landmark.waist"; apexA.xOf = "ringQuarter"; apexA.oran = 0.5; apexA.yLandmark = "landmark.bustApex"; apexA.yLandmark2 = "landmark.waist"; apexA.yOran = 0.15;
      OpResult d = suppress(g, "on_beden", "waist_front", 0.5, 0.2, RefPoint::of(apexA), "pens", true, ctx);
      ok(d.ok, "negatif hazirlik: govdeye pens acildi");
      neg("dikis_uzunluk", "yalniz govdede bel pensi (etekte yok) -> bel dikisi kisa", d.g);
      Garment x = d.g; Panel* p = x.panel("on_beden"); Edge* l1 = p->edge("pens.1");
      Anchor a2 = apexA; a2.yOran = 0.3; l1->to = RefPoint::of(a2);   // yalniz 1. bacagin apeksi kaydi -> apeks ortak degil
      neg("kenar_turu", "pens 1. bacaginin apeksi tek basina kaydirildi", x); }
    { Garment x = g; x.seam("bel")->ratio = 1.3; neg("dikis_uzunluk", "bel.ratio elle 1.3 (kenar uzatilmadan)", x); }
    { Garment x = g; x.seam("bel")->ratio = 9.0; neg("dikis_uzunluk", "bel.ratio 9.0 aralik disi", x); }
    { Garment x = g; x.panel("on_beden")->edge("side_front")->notches = {0.6}; neg("centik", "on_beden/side_front centigi 0.6'ya kaydi (arka 0.5)", x); }
    { Garment x = g; Panel* p = x.panel("on_etek"); const RefPoint a = p->vertex(2), b = p->vertex(3); p->setVertex(2, b); p->setVertex(3, a);
      neg("kendini_kesme", "on_etek etek-ucu ve kalca koseleri yer degistirdi (papyon)", x); }
    { OpResult e = extend(g, "on_beden", "waist_front", 25.0, ctx);
      ok(e.ok, "negatif hazirlik: on govde bel kenari 25 mm asagi (yan dikis on tarafta uzadi)");
      neg("halka_kapanma", "on yan dikis 25 mm uzun -> kol oyugu / bel halkalari kavsakta acik", e.g);
      DogrulamaRaporu Rx = dogrula(e.g, gercek, contract);
      const HalkaSatir* oy = nullptr; for (const HalkaSatir& h : Rx.halkalar) if (h.ring == "kol_oyugu_halka") oy = &h;
      const DikisSatir* yan = nullptr; for (const DikisSatir& d : Rx.dikisler) if (d.seam == "yan_beden") yan = &d;
      ok(oy && yan && !oy->gecti && std::fabs(oy->kapanmaMM - std::fabs(yan->artikMM)) < 1e-6 && oy->kapanmaMM > 20.0 && oy->enKotuKavsak.find("armhole") != std::string::npos,
         "  kol oyugu halkasi kapanma " + (oy ? f2(oy->kapanmaMM) : "?") + " mm == yan_beden artigi " + (yan ? f2(yan->artikMM) : "?") + " @ " + (oy ? oy->enKotuKavsak : "") + " (dikis artigi kavsaga tasindi; egik yan dikis 25 mm dusey kaymayla 24.3 uzar)"); }
    // karar 7 negatifleri: zincir sirasi bozuk -> dikis_zincir; reverse yanlis ilan -> halka KOPUK
    { Garment x = g; Seam* s = x.seam("kol_oyugu"); std::swap(s->b[1], s->b[2]);   // back.1, front.2, back.2, front.1
      neg("dikis_zincir", "kol_oyugu.b sirasi bozuldu (armhole_back.1, armhole_front.2, ...) -> tepe paylasmiyor", x); }
    { Garment x = g; x.seam("kol_alti")->reverse = false;
      DogrulamaRaporu Rx = dogrula(x, gercek, contract); bool agizKopuk = false; std::string satir;
      for (const Hukum& h : Rx.hukumler) if (h.kural == "halka_kapanma" && h.hedef.rfind("kol_agzi", 0) == 0 && !h.gecti) { agizKopuk = true; satir = h.deger; }
      ok(agizKopuk, "negatif [halka_kapanma] kol_alti reverse=false ilan edilince (kose<->agiz dikilmis olur) kol agzi halkasi kapanmaz: " + satir);
      negs.push_back({"halka_kapanma", "kol_alti reverse yanlis ilan -> kol agzi kopuk", reds(Rx), agizKopuk}); }
    // (c) tolerans yoksa reddet
    { JVal c2 = contract; c2.set("toleranslar", JVal::obj());
      DogrulamaRaporu Rx = dogrula(g, gercek, c2);
      ok(!Rx.dikilebilir() && !Rx.hukumler.empty() && Rx.hukumler[0].kural == "tolerans" && !Rx.hukumler[0].gecti, "tolerans bloğu bos contract -> dogrulayici adiyla reddetti: " + Rx.hukumler[0].deger); }

    if (emitMode) {
        std::string m = "# Dikilebilirlik — negatif ornekler (graf_dikilebilir_check)\n\nHer satir bir kurali KIRAN ornek ve dogrulayicinin bastigi kirmizi hukumler (gercek36).\n\n| kural | ornek | hedef kural kirmizi? | kirmizi hukumler |\n|---|---|---|---|\n";
        for (const Negatif& n : negs) m += "| " + n.kural + " | " + n.ornek + " | " + (n.hedefKuralKirmizi ? "evet" : "HAYIR") + " | " + join(n.kirmizi) + " |\n";
        writeFile(outDir + "/dikilebilir-negatif.md", m);
        std::printf("  yazildi: %s/dikilebilir-{gercek36,EU38,croquis36}.{json,md}, dikilebilir-negatif.md\n", outDir.c_str());
    }
    std::printf("%s graf_dikilebilir_check — %d kirmizi\n", fails ? "FAIL" : "PASS", fails);
    return fails ? 1 : 0;
}
