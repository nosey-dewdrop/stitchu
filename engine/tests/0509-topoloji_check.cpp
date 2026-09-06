// 0509-topoloji_check.cpp — TOPOLOJIK MANTIK birim testi (A2c/E1, brief madde 1b).
// grafdogrula.hpp dogrula(): cizim DENENMEDEN once graf dikilebilir bir TOPOLOJI mi?
// Dort kural, hepsi contract/graf-v1.json _yasa'sindan turer (uydurma tablo yok):
//   kenar_rolu       (_yasa 3+4) dikisin iki tarafi da kind=="seam" kenardir
//   dikis_cifti      (_yasa 4)   bir kenar birden cok dikiste / ayni dikisin iki tarafinda olamaz
//   kapanma          (_yasa 3)   kind=="seam" her kenar TAM BIR dikiste olmalidir
//   komsuluk_bagli   (_yasa 7)   dikislerle baglanan paneller TEK bilesen olmalidir
// Bozuk graf ADIYLA reddedilir: hukum metni "ERR_IMPOSSIBLE_TOPOLOGY: <kural> — ..." tasir
// ve hedef alani hangi KENAR/panel oldugunu soyler (sessiz default yok, HEDEF §2).
// Test contract'i DEGISTIRMEZ, esik gevsetmez: yalniz taban grafi BOZAR ve reddi olcer.
// argv: <contract/graf-v1.json> <graf.json>
#include <cstdio>
#include <fstream>
#include <sstream>
#include <string>

#include "../src/body.hpp"
#include "../src/graf.hpp"
#include "../src/grafdogrula.hpp"

using namespace stitchu;
using namespace stitchu::graf;

static int fails = 0;
static void ok(bool c, const std::string& m) { std::printf("  [%s] %s\n", c ? "ok" : "FAIL", m.c_str()); if (!c) ++fails; }
static std::string readFile(const std::string& p) {
    std::ifstream f(p);
    if (!f) { std::fprintf(stderr, "okunamadi: %s\n", p.c_str()); std::exit(2); }
    std::stringstream ss; ss << f.rdbuf(); return ss.str();
}

// Rapordaki topoloji hukumlerinden KIRMIZI olanlari toplar.
struct TopoSonuc { int kirmizi = 0; std::string ilkMetin, ilkHedef; bool gectiSatiri = false; };
static TopoSonuc topo(const DogrulamaRaporu& R) {
    TopoSonuc t;
    for (const Hukum& h : R.hukumler) {
        if (h.kural != "topoloji") continue;
        if (h.gecti) { t.gectiSatiri = true; continue; }
        if (t.kirmizi == 0) { t.ilkMetin = h.deger; t.ilkHedef = h.hedef; }
        ++t.kirmizi;
    }
    return t;
}
static bool icerir(const std::string& h, const std::string& p) { return h.find(p) != std::string::npos; }

int main(int argc, char** argv) {
    if (argc < 3) { std::fprintf(stderr, "kullanim: 0509-topoloji_check <graf-v1.json> <graf.json>\n"); return 2; }
    JVal contract; std::string err;
    if (!parse(readFile(argv[1]), contract, err)) { std::fprintf(stderr, "graf-v1: %s\n", err.c_str()); return 2; }
    Garment taban;
    if (!fromJSONText(readFile(argv[2]), taban, err)) { std::fprintf(stderr, "graf: %s\n", err.c_str()); return 2; }
    Body body = Body::fromContract("gercek36");

    // (a) TABAN graf: dort kural da gecer, tek YESIL topoloji satiri, kirmizi yok
    {
        const DogrulamaRaporu R = dogrula(taban, body, contract);
        const TopoSonuc t = topo(R);
        ok(t.kirmizi == 0, "(a) taban graf topolojisi temiz (kirmizi topoloji hukmu: " + std::to_string(t.kirmizi) + ")");
        ok(t.gectiSatiri, "(a) taban grafta YESIL topoloji satiri var");
    }

    // (b) kenar_rolu: bir dikisin a tarafindaki kenarin kind'ini "cut"a cevir -> ERR_IMPOSSIBLE_TOPOLOGY
    {
        Garment g = taban;
        bool bozuldu = false; std::string hedef;
        if (!g.seams.empty() && !g.seams[0].a.empty()) {
            const EdgeRef r = g.seams[0].a[0];
            for (Panel& p : g.panels) if (p.id == r.panel) { Edge* e = p.edge(r.edge); if (e) { e->kind = "cut"; e->finish = "clean_finish"; bozuldu = true; hedef = p.id + "/" + e->id; } }
        }
        ok(bozuldu, "(b) taban grafta bozulacak bir dikis kenari bulundu: " + hedef);
        const TopoSonuc t = topo(dogrula(g, body, contract));
        ok(t.kirmizi >= 1, "(b) kenar_rolu ihlali ADIYLA reddedildi");
        ok(icerir(t.ilkMetin, "ERR_IMPOSSIBLE_TOPOLOGY"), "(b) hata kodu ERR_IMPOSSIBLE_TOPOLOGY: " + t.ilkMetin);
        ok(icerir(t.ilkMetin, "kenar_rolu"), "(b) hangi KURAL soylendi (kenar_rolu)");
        ok(t.ilkHedef == hedef, "(b) hangi KENAR soylendi (" + t.ilkHedef + ")");
    }

    // (c) dikis_cifti: ayni kenari ikinci bir dikise de koy -> benzersizlik ihlali
    {
        Garment g = taban;
        bool bozuldu = false; std::string hedef;
        if (g.seams.size() >= 2 && !g.seams[0].a.empty()) {
            const EdgeRef r = g.seams[0].a[0];
            g.seams[1].a.push_back(r); bozuldu = true; hedef = r.panel + "/" + r.edge;
        }
        ok(bozuldu, "(c) ikinci dikise eklenecek kenar bulundu: " + hedef);
        const TopoSonuc t = topo(dogrula(g, body, contract));
        ok(t.kirmizi >= 1, "(c) dikis_cifti ihlali ADIYLA reddedildi");
        ok(icerir(t.ilkMetin, "ERR_IMPOSSIBLE_TOPOLOGY") && icerir(t.ilkMetin, "dikis_cifti"),
           "(c) kod + kural metinde: " + t.ilkMetin);
    }

    // (d) kapanma: bir dikisi tamamen KALDIR -> o dikisin seam kenarlari acikta kalir
    {
        Garment g = taban;
        bool bozuldu = false;
        if (!g.seams.empty()) { g.seams.erase(g.seams.begin()); bozuldu = true; }
        ok(bozuldu, "(d) kaldirilacak dikis bulundu");
        const TopoSonuc t = topo(dogrula(g, body, contract));
        ok(t.kirmizi >= 1, "(d) kapanmayan seam kenari ADIYLA reddedildi");
        ok(icerir(t.ilkMetin, "ERR_IMPOSSIBLE_TOPOLOGY") && icerir(t.ilkMetin, "kapanma"),
           "(d) kod + kural metinde: " + t.ilkMetin);
        ok(!t.ilkHedef.empty(), "(d) acik kalan KENAR adiyla: " + t.ilkHedef);
    }

    // (e) komsuluk_bagli: butun dikisleri sil -> paneller kopuk bilesen olur
    {
        Garment g = taban;
        g.seams.clear();
        const TopoSonuc t = topo(dogrula(g, body, contract));
        bool bagliIhlali = false; std::string metin;
        for (const Hukum& h : dogrula(g, body, contract).hukumler)
            if (h.kural == "topoloji" && !h.gecti && icerir(h.deger, "komsuluk_bagli")) { bagliIhlali = true; metin = h.deger; }
        ok(t.kirmizi >= 1, "(e) dikissiz graf reddedildi");
        ok(g.panels.size() < 2 || bagliIhlali, "(e) kopuk bilesen ADIYLA: " + metin);
    }

    std::printf("%s (%d hata)\n", fails ? "FAIL" : "OK", fails);
    return fails ? 1 : 0;
}
