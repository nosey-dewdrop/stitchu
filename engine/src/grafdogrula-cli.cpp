// grafdogrula-cli.cpp — DOGRULAYICI CLI (0509 A2b).
//   engine/build/grafdogrula <graf.json> <bodyId> [--json|--md]
// exit 0 = 0 kirmizi hukum (dikilebilir), 1 = kirmizi var, 2 = girdi/beden okunamadi.
#include <cstdio>
#include <cstring>
#include <fstream>
#include <sstream>
#include <string>

#include "../src/body.hpp"
#include "../src/graf.hpp"
#include "../src/grafdogrula.hpp"
#include "../src/grafop.hpp"

using namespace stitchu;
using namespace stitchu::graf;

static bool readFile(const std::string& p, std::string& out) {
    std::ifstream f(p);
    if (!f) return false;
    std::stringstream ss;
    ss << f.rdbuf();
    out = ss.str();
    return true;
}

int main(int argc, char** argv) {
    if (argc < 3) {
        std::fprintf(stderr, "kullanim: grafdogrula <graf.json> <bodyId> [--json|--md]\n");
        return 2;
    }
    const std::string grafYol = argv[1], bodyId = argv[2];
    std::string bicim = "md", hedefYol;
    for (int i = 3; i < argc; ++i) {
        if (!std::strcmp(argv[i], "--json")) bicim = "json";
        else if (!std::strcmp(argv[i], "--md")) bicim = "md";
        else if (!std::strcmp(argv[i], "--hedef") && i + 1 < argc) hedefYol = argv[++i];
        else { std::fprintf(stderr, "ERR_UNKNOWN_FLAG: %s\n", argv[i]); return 2; }
    }
    std::string metin, contractMetin;
    if (!readFile(grafYol, metin)) { std::fprintf(stderr, "ERR_READ: %s\n", grafYol.c_str()); return 2; }
    if (!readFile("contract/graf-v1.json", contractMetin)) {
        std::fprintf(stderr, "ERR_READ: contract/graf-v1.json (repo kokunden calistir)\n");
        return 2;
    }
    JVal contract;
    std::string err;
    if (!parse(contractMetin, contract, err)) { std::fprintf(stderr, "ERR_CONTRACT_PARSE: %s\n", err.c_str()); return 2; }
    // body-v1: kisit cozucusunun mutlak insan olcegi siniri (2026-09-08). Okunamazsa
    // cozucu yuklenmez ve pens kisit cozumu ADIYLA atlanir (rapor "pens_cozum" satirinda).
    JVal bodyContract;
    { std::string bm; if (readFile("contract/body-v1.json", bm)) { std::string be; parse(bm, bodyContract, be); } }
    Garment g;
    if (!fromJSONText(metin, g, err)) { std::fprintf(stderr, "ERR_GRAF_PARSE: %s\n", err.c_str()); return 2; }
    Body body;
    try {
        if (bodyId.rfind("EU", 0) == 0) body = Body::graded(bodyId);
        else body = Body::fromContract(bodyId);
    } catch (const std::exception& e) {
        std::fprintf(stderr, "ERR_UNKNOWN_BODY: %s (%s)\n", bodyId.c_str(), e.what());
        return 2;
    }
    DogrulamaRaporu R;
    try {
        R = dogrula(g, body, contract, bodyId == "croquis36", bodyContract);
    } catch (const std::exception& e) {
        std::fprintf(stderr, "ERR_VALIDATE: %s\n", e.what());
        return 2;
    }
    // --hedef (2026-09-09, hakem A3 kusur 1): siluet hedefi grafin bollugundan olculur; sapma satiri (bilgi).
    // Hedef grafta uygulanmadiysa (grafuygula --hedef kosmadi) sapma buyuk cikar ve bu SATIRDA gorunur.
    if (!hedefYol.empty()) {
        std::string ht, herr; JVal hv;
        if (!readFile(hedefYol, ht) || !parse(ht, hv, herr)) { std::fprintf(stderr, "ERR_READ: %s (%s)\n", hedefYol.c_str(), herr.c_str()); return 2; }
        const std::vector<HedefSatir> hs = hedefOlc(g, hv, body, herr);
        if (!herr.empty()) { std::fprintf(stderr, "ERR_HEDEF: %s\n", herr.c_str()); return 2; }
        for (const HedefSatir& h : hs) { Hukum hk; hk.kural = "hedef"; hk.hedef = h.ring; hk.deger = h.metin + (h.metin.find("SINIRA") != std::string::npos ? "" : ""); hk.gecti = true; hk.bilgi = true; R.hukumler.push_back(hk); }
        if (hs.empty()) { Hukum hk; hk.kural = "hedef"; hk.hedef = g.id; hk.deger = "hedefler[] bos: okuma siluet olcumu tasimiyor"; hk.gecti = true; hk.bilgi = true; R.hukumler.push_back(hk); }
    }
    std::string out = (bicim == "json") ? emit(R.toJSON()) : R.toMarkdown();
    std::fwrite(out.data(), 1, out.size(), stdout);
    return R.kirmizi() == 0 ? 0 : 1;
}
