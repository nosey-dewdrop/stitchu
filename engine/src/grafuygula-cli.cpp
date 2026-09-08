// grafuygula-cli.cpp — TABAN + PRIMITIF EMIR LISTESI -> GRAF (2026-09-09, Damla karari).
//   engine/build/grafuygula <taban.json> <ops.json> [--id <grafId>]   -> graf JSON stdout
// ops.json: [{"op": "...", "args": {...}, ...}] — graf-v1 ops[] bicimi; op/args disindaki alanlar
// (neden gibi) okunmaz. Bos liste ERR_NO_OPS (exit 2): motor taban elbiseyi degil, taban + emir
// listesini uygular; emir yoksa uretilecek sey yoktur. Bir op reddedilirse ERR_OP <sira> <ad>: <neden>
// (exit 1), graf YAZILMAZ; sessiz atlama yok. Sonuc grafin ops[] alani tabanin kayitlari + uygulanan
// emirlerdir (replay(taban, ops) == graf; graf_ir_check (e)).
#include <cstdio>
#include <fstream>
#include <sstream>
#include <string>

#include "../src/graf.hpp"
#include "../src/grafop.hpp"

using namespace stitchu;
using namespace stitchu::graf;

static bool readFile(const std::string& p, std::string& out) {
    std::ifstream f(p); if (!f) return false;
    std::stringstream ss; ss << f.rdbuf(); out = ss.str(); return true;
}

// ops.json'u OpRecord listesine cevirir; hata metni adiyla. Bos liste = hata (ERR_NO_OPS).
bool opsOku(const std::string& yol, std::vector<OpRecord>& out, std::string& err) {
    std::string t; if (!readFile(yol, t)) { err = "ERR_READ: " + yol; return false; }
    JVal v; if (!parse(t, v, err)) { err = "ERR_OPS_PARSE: " + err; return false; }
    const JVal* arr = v.isArr() ? &v : v.get("ops");
    if (!arr || !arr->isArr()) { err = "ERR_OPS_PARSE: dizi ya da {ops:[...]} bekleniyor"; return false; }
    if (arr->a.empty()) { err = "ERR_NO_OPS: emir listesi bos — taban tek basina cizilmez"; return false; }
    for (size_t i = 0; i < arr->a.size(); ++i) {
        const JVal& o = arr->a[i];
        const JVal* op = o.get("op"); const JVal* args = o.get("args");
        if (!op || !op->isStr() || !args || !args->isObj()) { err = "ERR_OPS_PARSE: [" + std::to_string(i) + "] {op, args} bekleniyor"; return false; }
        out.push_back({op->s, *args});
    }
    return true;
}

int main(int argc, char** argv) {
    if (argc < 3) { std::fprintf(stderr, "kullanim: grafuygula <taban.json> <ops.json> [--id <grafId>]\n"); return 2; }
    std::string id;
    for (int i = 3; i + 1 < argc; ++i) if (std::string(argv[i]) == "--id") id = argv[i + 1];
    std::string metin, err;
    if (!readFile(argv[1], metin)) { std::fprintf(stderr, "ERR_READ: %s\n", argv[1]); return 2; }
    Garment taban;
    if (!fromJSONText(metin, taban, err)) { std::fprintf(stderr, "ERR_GRAF_PARSE: %s\n", err.c_str()); return 2; }
    std::vector<OpRecord> ops;
    if (!opsOku(argv[2], ops, err)) { std::fprintf(stderr, "%s\n", err.c_str()); return 2; }
    std::string ct; JVal contract;
    if (!readFile("contract/graf-v1.json", ct) || !parse(ct, contract, err)) { std::fprintf(stderr, "ERR_READ: contract/graf-v1.json (repo kokunden calistir)\n"); return 2; }
    const OpCtx ctx = OpCtx::fromContract(contract);
    OpResult r; r.ok = true; r.g = taban;
    for (size_t i = 0; i < ops.size(); ++i) {
        r = applyOp(r.g, ops[i], ctx);
        if (!r.ok) { std::fprintf(stderr, "ERR_OP %zu %s: %s\n", i, ops[i].op.c_str(), r.hata.c_str()); return 1; }
    }
    if (!id.empty()) r.g.id = id;
    r.g.notes = taban.notes + (taban.notes.empty() ? "" : "\n") + "grafuygula: taban " + taban.id + " + " + std::to_string(ops.size()) + " emir (" + argv[2] + ")";
    const std::string out = toJSONText(r.g);
    std::fwrite(out.data(), 1, out.size(), stdout);
    std::fprintf(stderr, "uygulanan %zu op; %zu panel, %zu dikis\n", ops.size(), r.g.panels.size(), r.g.seams.size());
    return 0;
}
