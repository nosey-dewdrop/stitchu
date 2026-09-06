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
    std::string bicim = "md";
    for (int i = 3; i < argc; ++i) {
        if (!std::strcmp(argv[i], "--json")) bicim = "json";
        else if (!std::strcmp(argv[i], "--md")) bicim = "md";
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
        R = dogrula(g, body, contract, bodyId == "croquis36");
    } catch (const std::exception& e) {
        std::fprintf(stderr, "ERR_VALIDATE: %s\n", e.what());
        return 2;
    }
    std::string out = (bicim == "json") ? emit(R.toJSON()) : R.toMarkdown();
    std::fwrite(out.data(), 1, out.size(), stdout);
    return R.kirmizi() == 0 ? 0 : 1;
}
