// 0509-olcek_check.cpp — OLCEK GECIDI birim testi (A2b, brief madde 1b).
// graf.hpp/kalipsvg.hpp olcekDogrula: gercek bedende degerlenen grafin MUTLAK giysi
// yuksekligi contract/body-v1.json olcekAraligi.giysiYuksekligiMM disinda ise
// ERR_SCALE_MISMATCH. Test esik UYDURMAZ: sinirlari contract'tan okur ve
//   (a) taban graf ARALIK ICINDE, olculen deger sinirlarin arasinda
//   (b) araligi 1 mm'lik bir pencereye DARALTILMIS contract kopyasiyla ayni graf ADIYLA reddedilir
//       (hata metni ERR_SCALE_MISMATCH tasir ve olculen degeri basar)
//   (c) olcekAraligi olmayan contract -> ERR_SCALE_NO_CONTRACT (sessiz default yok)
// argv: <contract/body-v1.json> <graf.json>
#include <cstdio>
#include <fstream>
#include <sstream>
#include <string>

#include "../src/body.hpp"
#include "../src/graf.hpp"
#include "../src/kalipsvg.hpp"

using namespace stitchu;
using namespace stitchu::graf;

static int fails = 0;
static void ok(bool c, const std::string& m) { std::printf("  [%s] %s\n", c ? "ok" : "FAIL", m.c_str()); if (!c) ++fails; }
static std::string readFile(const std::string& p) {
    std::ifstream f(p);
    if (!f) { std::fprintf(stderr, "okunamadi: %s\n", p.c_str()); std::exit(2); }
    std::stringstream ss; ss << f.rdbuf(); return ss.str();
}

int main(int argc, char** argv) {
    if (argc < 3) { std::fprintf(stderr, "kullanim: 0509-olcek_check <body-v1.json> <graf.json>\n"); return 2; }
    JVal bodyContract; std::string err;
    if (!parse(readFile(argv[1]), bodyContract, err)) { std::fprintf(stderr, "body-v1: %s\n", err.c_str()); return 2; }
    Garment g;
    if (!fromJSONText(readFile(argv[2]), g, err)) { std::fprintf(stderr, "graf: %s\n", err.c_str()); return 2; }
    Body body = Body::fromContract("gercek36");

    const JVal* ar = bodyContract.get("olcekAraligi");
    const JVal* gy = ar && ar->isObj() ? ar->get("giysiYuksekligiMM") : nullptr;
    if (!gy || !gy->isObj()) { std::fprintf(stderr, "contract olcekAraligi.giysiYuksekligiMM yok\n"); return 2; }
    const double lo = gy->numOr("min", -1), hi = gy->numOr("max", -1);
    ok(lo > 0 && hi > lo, "contract araligi okundu: [" + std::to_string(lo) + ", " + std::to_string(hi) + "] mm");

    // (a) taban graf aralik icinde
    double olculen = 0; std::string hata;
    bool r = olcekDogrula(g, body, bodyContract, false, olculen, hata);
    ok(r, "(a) taban graf gercek36'da aralik icinde: " + hata);
    ok(olculen >= lo && olculen <= hi, "(a) olculen " + std::to_string(olculen) + " mm sinirlarin arasinda");

    // (b) aralik 1 mm'lik pencereye daraltilinca ADIYLA reddedilir (esik gevsetme DEGIL, tersi:
    //     kapinin gercekten hukum verdigini kanitlar)
    {
        JVal dar = bodyContract;
        JVal yeni = JVal::obj();
        yeni.set("min", JVal::num(olculen + 100.0));
        yeni.set("max", JVal::num(olculen + 101.0));
        JVal ara = JVal::obj();
        ara.set("giysiYuksekligiMM", yeni);
        dar.set("olcekAraligi", ara);
        double o2 = 0; std::string h2;
        bool r2 = olcekDogrula(g, body, dar, false, o2, h2);
        ok(!r2, "(b) daraltilmis aralikta reddedildi");
        ok(h2.find("ERR_SCALE_MISMATCH") != std::string::npos, "(b) hata ADIYLA: " + h2);
        ok(o2 == olculen, "(b) olculen deger her iki durumda ayni (ret olcumu bozmaz)");
    }

    // (c) olcekAraligi olmayan contract -> ERR_SCALE_NO_CONTRACT
    {
        JVal bos = JVal::obj();
        double o3 = 0; std::string h3;
        bool r3 = olcekDogrula(g, body, bos, false, o3, h3);
        ok(!r3 && h3.find("ERR_SCALE_NO_CONTRACT") != std::string::npos, "(c) sozlesmesiz cagri ADIYLA reddedildi: " + h3);
    }

    std::printf("%s (%d fail)\n", fails ? "FAIL" : "PASS", fails);
    return fails ? 1 : 0;
}
