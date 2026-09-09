// grafciz-cli.cpp — GRAFTAN CIZIM CLI (0509 A2b).
//   engine/build/grafciz <graf.json> <bodyId> flat|kalip                  -> SVG stdout
//   engine/build/grafciz <taban.json> --ops <ops.json> <bodyId> flat|kalip -> ops uygulanir, SONRA cizilir
// --ops (2026-09-09, Damla karari): cizici taban + primitif emir listesini uygular ve ops sonrasi grafi
// cizer. Bos emir listesi ERR_NO_OPS (exit 2): op'suz cizim KIRMIZI. Reddedilen op ERR_OP (exit 1).
// SVG kokune data-ops="<uygulanan op sayisi>" yazilir; --ops'suz cizimde data-ops yoktur.
// bodyId: "gercek36" | "croquis36" | "EU34".."EU44" (Body::fromContract / Body::graded).
// Bilinmeyen mod/beden -> stderr'e ADIYLA hata, exit 2. Sessiz default yok.
#include <cstdio>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>

#include "../src/body.hpp"
#include "../src/flatsvg.hpp"
#include "../src/graf.hpp"
#include "../src/grafop.hpp"
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
    std::string grafYol, opsYol, hedefYol, bodyId, mod;
    { std::vector<std::string> pos;
      for (int i = 1; i < argc; ++i) {
          if (std::string(argv[i]) == "--ops") { if (i + 1 >= argc) { std::fprintf(stderr, "ERR_NO_OPS: --ops dosya yolu bekliyor\n"); return 2; } opsYol = argv[++i]; }
          else if (std::string(argv[i]) == "--hedef") { if (i + 1 >= argc) { std::fprintf(stderr, "ERR_HEDEF: --hedef dosya yolu bekliyor\n"); return 2; } hedefYol = argv[++i]; }
          else pos.push_back(argv[i]);
      }
      if (pos.size() < 3) {
          std::fprintf(stderr, "kullanim: grafciz <graf.json> [--ops <ops.json>] <bodyId> flat|kalip\n");
          return 2;
      }
      grafYol = pos[0]; bodyId = pos[1]; mod = pos[2]; }
    if (mod != "flat" && mod != "kalip") {
        std::fprintf(stderr, "ERR_UNKNOWN_MODE: '%s' (flat|kalip)\n", mod.c_str());
        return 2;
    }
    std::string metin;
    if (!readFile(grafYol, metin)) { std::fprintf(stderr, "ERR_READ: %s\n", grafYol.c_str()); return 2; }
    Garment g;
    std::string err;
    if (!fromJSONText(metin, g, err)) { std::fprintf(stderr, "ERR_GRAF_PARSE: %s\n", err.c_str()); return 2; }

    // --ops: taban + emir listesi -> graf (grafuygula ile ayni yol: applyOp sirayla, ilk hatada dur)
    size_t opSayisi = 0;
    if (!opsYol.empty()) {
        std::string ot; JVal ov;
        if (!readFile(opsYol, ot)) { std::fprintf(stderr, "ERR_READ: %s\n", opsYol.c_str()); return 2; }
        if (!parse(ot, ov, err)) { std::fprintf(stderr, "ERR_OPS_PARSE: %s\n", err.c_str()); return 2; }
        const JVal* arr = ov.isArr() ? &ov : ov.get("ops");
        if (!arr || !arr->isArr() || arr->a.empty()) { std::fprintf(stderr, "ERR_NO_OPS: emir listesi bos — op'suz cizim yok\n"); return 2; }
        JVal contract;
        if (!readContract("contract/graf-v1.json", contract)) { std::fprintf(stderr, "ERR_READ: contract/graf-v1.json (repo kokunden calistir)\n"); return 2; }
        const OpCtx octx = OpCtx::fromContract(contract);
        for (size_t i = 0; i < arr->a.size(); ++i) {
            const JVal& o = arr->a[i];
            const JVal* op = o.get("op"); const JVal* args = o.get("args");
            if (!op || !op->isStr() || !args || !args->isObj()) { std::fprintf(stderr, "ERR_OPS_PARSE: [%zu] {op, args} bekleniyor\n", i); return 2; }
            OpResult r = applyOp(g, {op->s, *args}, octx);
            if (!r.ok) { std::fprintf(stderr, "ERR_OP %zu %s: %s\n", i, op->s.c_str(), r.hata.c_str()); return 1; }
            g = r.g;
        }
        opSayisi = arr->a.size();
    }

    Body body;
    try {
        if (bodyId.rfind("EU", 0) == 0) body = Body::graded(bodyId);
        else body = Body::fromContract(bodyId);
    } catch (const std::exception& e) {
        std::fprintf(stderr, "ERR_UNKNOWN_BODY: %s (%s)\n", bodyId.c_str(), e.what());
        return 2;
    }

    // --hedef (2026-09-09): siluet orani ops SONRASI bolluga cevrilir (grafop.hpp hedefUygula); cizim o grafla.
    if (!hedefYol.empty()) {
        std::string ht; JVal hv, contract;
        if (!readFile(hedefYol, ht) || !parse(ht, hv, err)) { std::fprintf(stderr, "ERR_READ: %s (%s)\n", hedefYol.c_str(), err.c_str()); return 2; }
        if (!readContract("contract/graf-v1.json", contract)) { std::fprintf(stderr, "ERR_READ: contract/graf-v1.json\n"); return 2; }
        std::string hh; const std::vector<HedefSatir> hs = hedefUygula(g, hv, body, contract, hh);
        if (!hh.empty()) { std::fprintf(stderr, "ERR_HEDEF: %s\n", hh.c_str()); return 1; }
        for (const HedefSatir& h : hs) std::fprintf(stderr, "hedef: %s\n", h.metin.c_str());
    }

    // COZULMUS GRAF (A4): cizici dogrulayicinin olctugu grafi cizer (fitLength + pens agzi bu bedende cozulur).
    {
        JVal contract, bodyContract; std::string cozNot;
        if (!readContract("contract/graf-v1.json", contract) || !readContract("contract/body-v1.json", bodyContract)) { std::fprintf(stderr, "ERR_READ: contract/graf-v1.json ya da body-v1.json\n"); return 2; }
        g = cozulmusGraf(g, body, bodyId == "croquis36", contract, bodyContract, cozNot);
        if (!cozNot.empty()) std::fprintf(stderr, "cozum: %s (graf o kalemde HAM cizildi)\n", cozNot.c_str());
        else std::fprintf(stderr, "cozum: fitLength + pens agzi %s bedeninde cozuldu, cizim cozulmus grafla\n", bodyId.c_str());
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
        // KAVIS (A4 tur 6): sayilar contract/flat-convention-v1.json kavis blogundan; blok yoksa ADIYLA hata (sessiz duz cizim yok)
        {
            JVal fc;
            if (!readContract("contract/flat-convention-v1.json", fc)) { std::fprintf(stderr, "ERR_READ: contract/flat-convention-v1.json\n"); return 2; }
            const JVal* kv = fc.get("kavis");
            if (!kv || !kv->isObj()) { std::fprintf(stderr, "ERR_CONTRACT: flat-convention-v1.json kavis blogu yok\n"); return 2; }
            o.kavis = true;
            o.kavisMinDyMM = kv->numOr("minDyMM", -1); o.kavisTolMM = kv->numOr("tolMM", -1); o.etekUcuSagOverWidth = kv->numOr("etekUcuSagOverWidth", -1);
            if (o.kavisMinDyMM < 0 || o.kavisTolMM <= 0 || o.etekUcuSagOverWidth < 0) { std::fprintf(stderr, "ERR_CONTRACT: kavis.minDyMM/tolMM/etekUcuSagOverWidth eksik\n"); return 2; }
        }
        svg = flatSVG(g, body, bodyId, contract, bodyContract, o, hata);
    } else {
        JVal sheet, bodyContract;
        if (!readContract("contract/pattern-sheet-v1.json", sheet)) {
            std::fprintf(stderr, "ERR_READ: contract/pattern-sheet-v1.json (repo kokunden calistir)\n");
            return 2;
        }
        // OLCEK GECIDI: kalip GERCEK bir bedende cizilir; mutlak sinir kutusu contract
        // araliginin disindaysa ERR_SCALE_MISMATCH ile ADIYLA reddedilir (croquis birimi
        // ya da olceksiz kullanici birimi kalip diye sevk edilmesin). croquis36 muaftir:
        // o beden mankendir, mutlak insan olcegi iddiasi tasimaz.
        if (bodyId != "croquis36") {
            if (!readContract("contract/body-v1.json", bodyContract)) {
                std::fprintf(stderr, "ERR_READ: contract/body-v1.json (repo kokunden calistir)\n");
                return 2;
            }
            double olculen = 0;
            std::string sHata;
            if (!olcekDogrula(g, body, bodyContract, false, olculen, sHata)) {
                std::fprintf(stderr, "%s\n", sHata.c_str());
                return 1;
            }
            std::fprintf(stderr, "olcek_check: %s giysi yuksekligi %.2f mm, contract araliginda\n", bodyId.c_str(), olculen);
        }
        KalipOpts o;
        svg = kalipSVG(g, body, bodyId, sheet, o, hata);
    }
    if (svg.empty()) { std::fprintf(stderr, "%s\n", hata.empty() ? "ERR_EMPTY_SVG" : hata.c_str()); return 1; }
    if (opSayisi > 0) {
        const size_t k = svg.find("<svg");
        if (k != std::string::npos) svg.insert(k + 4, " data-ops=\"" + std::to_string(opSayisi) + "\"");
        std::fprintf(stderr, "ops: %zu emir uygulandi, graf ops sonrasi cizildi\n", opSayisi);
    }
    std::fwrite(svg.data(), 1, svg.size(), stdout);
    return 0;
}
