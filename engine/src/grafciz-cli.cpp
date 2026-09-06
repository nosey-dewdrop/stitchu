// grafciz-cli.cpp — GRAFTAN CIZIM CLI (0509 A2b).
//   engine/build/grafciz <graf.json> <bodyId> flat|kalip   -> SVG stdout
// bodyId: "gercek36" | "croquis36" | "EU34".."EU44" (Body::fromContract / Body::graded).
// Bilinmeyen mod/beden -> stderr'e ADIYLA hata, exit 2. Sessiz default yok.
#include <cstdio>
#include <fstream>
#include <sstream>
#include <string>

#include "../src/body.hpp"
#include "../src/flatsvg.hpp"
#include "../src/graf.hpp"
#include "../src/kalipsvg.hpp"

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

// contract/*.json'u repo kokunden bulur: graf.json'un yolundan yukari degil, CWD'den.
static bool readContract(const char* rel, JVal& out) {
    std::string t;
    if (!readFile(rel, t)) return false;
    std::string err;
    return parse(t, out, err);
}

int main(int argc, char** argv) {
    if (argc < 4) {
        std::fprintf(stderr, "kullanim: grafciz <graf.json> <bodyId> flat|kalip\n");
        return 2;
    }
    const std::string grafYol = argv[1], bodyId = argv[2], mod = argv[3];
    if (mod != "flat" && mod != "kalip") {
        std::fprintf(stderr, "ERR_UNKNOWN_MODE: '%s' (flat|kalip)\n", mod.c_str());
        return 2;
    }
    std::string metin;
    if (!readFile(grafYol, metin)) { std::fprintf(stderr, "ERR_READ: %s\n", grafYol.c_str()); return 2; }
    Garment g;
    std::string err;
    if (!fromJSONText(metin, g, err)) { std::fprintf(stderr, "ERR_GRAF_PARSE: %s\n", err.c_str()); return 2; }

    Body body;
    try {
        if (bodyId.rfind("EU", 0) == 0) body = Body::graded(bodyId);
        else body = Body::fromContract(bodyId);
    } catch (const std::exception& e) {
        std::fprintf(stderr, "ERR_UNKNOWN_BODY: %s (%s)\n", bodyId.c_str(), e.what());
        return 2;
    }

    std::string svg, hata;
    if (mod == "flat") {
        JVal contract, bodyContract;
        if (!readContract("contract/graf-v1.json", contract)) {
            std::fprintf(stderr, "ERR_READ: contract/graf-v1.json (repo kokunden calistir)\n");
            return 2;
        }
        readContract("contract/body-v1.json", bodyContract);
        FlatOpts o;
        // croquis36 flat: on + arka ust uste iki kat (body.gen.hpp kCroquisOmuzHukmu)
        o.onArkaEsit = (bodyId == "croquis36");
        svg = flatSVG(g, body, bodyId, contract, bodyContract, o, hata);
    } else {
        JVal sheet;
        if (!readContract("contract/pattern-sheet-v1.json", sheet)) {
            std::fprintf(stderr, "ERR_READ: contract/pattern-sheet-v1.json (repo kokunden calistir)\n");
            return 2;
        }
        KalipOpts o;
        svg = kalipSVG(g, body, bodyId, sheet, o, hata);
    }
    if (svg.empty()) { std::fprintf(stderr, "%s\n", hata.empty() ? "ERR_EMPTY_SVG" : hata.c_str()); return 1; }
    std::fwrite(svg.data(), 1, svg.size(), stdout);
    return 0;
}
