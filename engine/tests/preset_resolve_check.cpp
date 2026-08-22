// PRESET RESOLVE CHECK — the price of admission into the vocabulary.
//
// Damla (SSB-4): "surekli ayni havuzdan urun deniyoruz ... senin kelime
// sozlugunun hala heart, peplum gibi seyler olmasi". A Layer-3 name
// ("sweetheart") is a MENU item. This gate makes every menu name pay for its
// place: it must (a) resolve into a bundle of Layer-1 primitives declared in
// contract/primitives-v1.json, and (b) that resolution must actually DRAW a
// panel chain in this engine, distinct from every other name in its own field.
//
// A name that cannot do both is not deleted and not invented around — it is
// marked `absent` in contract/vocab-resolution-v1.json with a reason.
//
// What the gate asserts (no numeric threshold is invented here; every rule is
// structural, so nothing is derived from the engine's own output and turned
// into its own gate):
//   1. BIJECTION  every (field,value) in engine/vocab.json has exactly one
//      entry in the resolution table, and the table has no entry that the
//      vocabulary does not contain.  <- a fake name fails HERE
//   2. BUNDLE     status=resolved => non-empty bundle, every op named in it
//      exists in contract/primitives-v1.json, every param it sets is declared
//      for that op.  <- an emptied bundle fails HERE
//   3. DRAWS      status=resolved => drafting its host spec with that value
//      succeeds, yields >=1 piece, and every piece outline is a real closed
//      chain (>=3 commands, positive path length).
//   4. EFFECT     the declared engineEffect (base|newPanel|reshape) equals the
//      measured one, relative to the field's reference value.
//   5. DISTINCT   two resolved names in the same field may not draft the same
//      pattern. Same geometry under two names = one of them is free.
//   6. HONESTY    status=absent => a non-empty absentReason.
//                 status=sentinel => empty bundle (absence has no geometry).
//
// Host profiles live HERE (hostFor), not in the table: the host is a property
// of the field (a cuff needs a sleeve, a cup seam needs a princess bustier),
// not of the style name, and keeping it in code stops the table from being
// able to shop for a host that flatters it.
//
// Run with --probe to print the measurement without judging (used to author
// the table honestly).
#include <cmath>
#include <cstdio>
#include <cstdint>
#include <cstring>
#include <fstream>
#include <map>
#include <set>
#include <sstream>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/measurements.hpp"

using namespace stitchu;

// ---------------------------------------------------------------- mini JSON
namespace mj {

struct Value;
using Object = std::vector<std::pair<std::string, Value>>;
using Array = std::vector<Value>;

struct Value {
    enum Type { Null, Bool, Num, Str, Arr, Obj } type = Null;
    bool b = false;
    double num = 0;
    std::string str;
    Array arr;
    Object obj;

    const Value* find(const std::string& key) const {
        if (type != Obj) return nullptr;
        for (const auto& kv : obj)
            if (kv.first == key) return &kv.second;
        return nullptr;
    }
    std::string s(const std::string& key, const std::string& dflt = "") const {
        const Value* v = find(key);
        return (v && v->type == Str) ? v->str : dflt;
    }
};

struct Parser {
    const std::string& src;
    size_t i = 0;
    std::string err;
    explicit Parser(const std::string& s) : src(s) {}

    void ws() {
        while (i < src.size() && (src[i] == ' ' || src[i] == '\t' || src[i] == '\n' || src[i] == '\r')) ++i;
    }
    bool lit(const char* t) {
        size_t n = std::strlen(t);
        if (src.compare(i, n, t) == 0) { i += n; return true; }
        return false;
    }
    bool parseString(std::string& out) {
        if (i >= src.size() || src[i] != '"') { err = "expected string"; return false; }
        ++i;
        out.clear();
        while (i < src.size() && src[i] != '"') {
            char c = src[i++];
            if (c == '\\' && i < src.size()) {
                char e = src[i++];
                switch (e) {
                    case 'n': out += '\n'; break;
                    case 't': out += '\t'; break;
                    case 'r': out += '\r'; break;
                    case 'b': out += '\b'; break;
                    case 'f': out += '\f'; break;
                    case 'u': {
                        // keep the escape verbatim; we never compare on these
                        out += "\\u";
                        for (int k = 0; k < 4 && i < src.size(); ++k) out += src[i++];
                        break;
                    }
                    default: out += e;
                }
            } else {
                out += c;
            }
        }
        if (i >= src.size()) { err = "unterminated string"; return false; }
        ++i;
        return true;
    }
    bool parse(Value& v) {
        ws();
        if (i >= src.size()) { err = "unexpected end"; return false; }
        char c = src[i];
        if (c == '{') {
            ++i; v.type = Value::Obj;
            ws();
            if (i < src.size() && src[i] == '}') { ++i; return true; }
            while (true) {
                ws();
                std::string key;
                if (!parseString(key)) return false;
                ws();
                if (i >= src.size() || src[i] != ':') { err = "expected ':'"; return false; }
                ++i;
                Value child;
                if (!parse(child)) return false;
                v.obj.emplace_back(key, std::move(child));
                ws();
                if (i < src.size() && src[i] == ',') { ++i; continue; }
                if (i < src.size() && src[i] == '}') { ++i; return true; }
                err = "expected ',' or '}'";
                return false;
            }
        }
        if (c == '[') {
            ++i; v.type = Value::Arr;
            ws();
            if (i < src.size() && src[i] == ']') { ++i; return true; }
            while (true) {
                Value child;
                if (!parse(child)) return false;
                v.arr.push_back(std::move(child));
                ws();
                if (i < src.size() && src[i] == ',') { ++i; continue; }
                if (i < src.size() && src[i] == ']') { ++i; return true; }
                err = "expected ',' or ']'";
                return false;
            }
        }
        if (c == '"') { v.type = Value::Str; return parseString(v.str); }
        if (lit("true")) { v.type = Value::Bool; v.b = true; return true; }
        if (lit("false")) { v.type = Value::Bool; v.b = false; return true; }
        if (lit("null")) { v.type = Value::Null; return true; }
        {
            size_t start = i;
            if (i < src.size() && (src[i] == '-' || src[i] == '+')) ++i;
            while (i < src.size() && (std::isdigit(static_cast<unsigned char>(src[i])) || src[i] == '.' ||
                                      src[i] == 'e' || src[i] == 'E' || src[i] == '-' || src[i] == '+'))
                ++i;
            if (start == i) { err = std::string("unexpected char '") + c + "'"; return false; }
            v.type = Value::Num;
            v.num = std::stod(src.substr(start, i - start));
            return true;
        }
    }
};

inline bool load(const std::string& path, Value& out, std::string& err) {
    std::ifstream f(path);
    if (!f) { err = "cannot open " + path; return false; }
    std::stringstream ss;
    ss << f.rdbuf();
    std::string text = ss.str();
    Parser p(text);
    if (!p.parse(out)) { err = path + ": " + p.err; return false; }
    return true;
}

} // namespace mj

// ---------------------------------------------------------------- reporting
static int failures = 0;
static void fail(const std::string& what) {
    std::printf("  [FAIL] %s\n", what.c_str());
    failures++;
}

// ---------------------------------------------------------------- host specs
// A host is a property of the FIELD: the smallest legal garment in which that
// field can express itself at all. Documented per field.
static BodyMeasurementsSnapshot body() {
    return BodyMeasurementsSnapshot{90, 72, 98, 38, 40, 58, 36};
}

static GarmentSpec hostFor(const std::string& field) {
    GarmentSpec s;                       // dress, dart, natural, woven, crew, sleeveless
    s.garment = GarmentType::Dress;
    s.skirtStyle = SkirtStyle::ALine;
    s.skirtLength = SkirtLength::Midi;

    auto topBase = [&]() {
        s.garment = GarmentType::Top;
        s.topLength = TopLength::Hip;
    };
    auto sleeved = [&]() {
        s.sleeveStyle = SleeveStyle::Straight;
        s.sleeveLength = SleeveLength::Long;
    };

    if (field == "garment") return s;                       // reference = skirt
    if (field == "shaping" || field == "waistline" || field == "fabric") return s;
    if (field == "neckline") { topBase(); return s; }
    if (field == "sleeveStyle") { topBase(); s.sleeveLength = SleeveLength::Long; return s; }
    if (field == "sleeveLength") { topBase(); sleeved(); return s; }
    if (field == "sleeveCap") { topBase(); sleeved(); return s; }
    if (field == "cuffStyle") { topBase(); sleeved(); return s; }
    if (field == "shoulderStyle") { topBase(); sleeved(); return s; }
    if (field == "skirtStyle" || field == "skirtLength") { s.garment = GarmentType::Skirt; return s; }
    if (field == "topLength") { topBase(); return s; }
    if (field == "tieClosure") return s;
    if (field == "collarType") { topBase(); return s; }
    if (field == "collarEdge") { topBase(); s.collarType = 3 /* flat */; return s; }
    if (field == "gatherType") { topBase(); s.gatherZone = 2 /* waist */; return s; }
    if (field == "gatherZone") { topBase(); s.gatherType = 2 /* shirred */; return s; }
    if (field == "backOpening") return s;
    if (field == "laceUpBack") return s;
    if (field == "wrapFront") return s;
    if (field == "backSlit") { s.skirtStyle = SkirtStyle::Straight; return s; }
    if (field == "ruffledStraps") return s;                 // sleeveless dress
    if (field == "peplum") { topBase(); return s; }
    if (field == "hemFlounce") { s.skirtStyle = SkirtStyle::Straight; return s; }
    if (field == "placketStyle") { topBase(); return s; }
    if (field == "edgeFinish") { topBase(); return s; }
    if (field == "pocketStyle") return s;
    if (field == "hemShape") { s.skirtStyle = SkirtStyle::Straight; return s; }
    if (field == "buttonRow") { topBase(); return s; }
    if (field == "exposedZip") return s;
    if (field == "backDetail") return s;
    if (field == "bardotStyle") return s;                   // sleeveless dress
    if (field == "yoke") { topBase(); return s; }
    if (field == "boxPleat") { topBase(); return s; }
    if (field == "cupSeam") {                               // strapless princess bustier
        topBase();
        s.shaping = Shaping::Princess;
        s.neckline = Neckline::Sweetheart;
        return s;
    }
    if (field == "locketTop") {                             // the purchased Bugra host class
        topBase();
        s.topLength = TopLength::Cropped;                   // locket.cpp:208 waist-length
        s.sleeveStyle = SleeveStyle::Straight;
        s.sleeveLength = SleeveLength::Short;
        s.sleeveCap = SleeveCap::Puffed;
        s.collarType = 6 /* crescent */;
        s.frontPlacket = true;
        s.buttonRow = 1 /* functional */;
        return s;
    }
    return s;
}

static bool setField(GarmentSpec& s, const std::string& f, int idx) {
    if (f == "garment") { s.garment = static_cast<GarmentType>(idx); return true; }
    if (f == "shaping") { s.shaping = static_cast<Shaping>(idx); return true; }
    if (f == "waistline") { s.waistline = static_cast<Waistline>(idx); return true; }
    if (f == "fabric") { s.fabric = static_cast<Fabric>(idx); return true; }
    if (f == "neckline") { s.neckline = static_cast<Neckline>(idx); return true; }
    if (f == "sleeveStyle") { s.sleeveStyle = static_cast<SleeveStyle>(idx); return true; }
    if (f == "sleeveLength") { s.sleeveLength = static_cast<SleeveLength>(idx); return true; }
    if (f == "sleeveCap") { s.sleeveCap = static_cast<SleeveCap>(idx); return true; }
    if (f == "skirtStyle") { s.skirtStyle = static_cast<SkirtStyle>(idx); return true; }
    if (f == "skirtLength") { s.skirtLength = static_cast<SkirtLength>(idx); return true; }
    if (f == "topLength") { s.topLength = static_cast<TopLength>(idx); return true; }
    if (f == "tieClosure") { s.tieClosure = idx; return true; }
    if (f == "collarType") { s.collarType = idx; return true; }
    if (f == "collarEdge") { s.collarEdge = idx; return true; }
    if (f == "gatherType") { s.gatherType = idx; return true; }
    if (f == "gatherZone") { s.gatherZone = idx; return true; }
    if (f == "backOpening") { s.backOpening = idx; return true; }
    if (f == "laceUpBack") { s.laceUpBack = idx; return true; }
    if (f == "wrapFront") { s.wrapFront = idx; return true; }
    if (f == "backSlit") { s.backSlit = idx; return true; }
    if (f == "ruffledStraps") { s.ruffledStraps = idx; return true; }
    if (f == "peplum") { s.peplum = idx; return true; }
    if (f == "hemFlounce") { s.hemFlounce = idx; return true; }
    if (f == "placketStyle") { s.placketStyle = idx; s.frontPlacket = (idx == 1); return true; }
    if (f == "edgeFinish") { s.edgeFinish = idx; return true; }
    if (f == "pocketStyle") { s.pocketStyle = idx; return true; }
    if (f == "cuffStyle") { s.cuffStyle = idx; return true; }
    if (f == "hemShape") { s.hemShape = idx; return true; }
    if (f == "shoulderStyle") { s.shoulderStyle = idx; return true; }
    if (f == "buttonRow") { s.buttonRow = idx; return true; }
    if (f == "exposedZip") { s.exposedZip = idx; return true; }
    if (f == "backDetail") { s.backDetail = idx; return true; }
    if (f == "bardotStyle") { s.bardotStyle = idx; return true; }
    if (f == "cupSeam") { s.cupSeam = idx; return true; }
    if (f == "locketTop") { s.locketTop = idx; return true; }
    if (f == "yoke") { s.yoke = idx; return true; }
    if (f == "boxPleat") { s.boxPleat = idx; return true; }
    return false;
}

// ---------------------------------------------------------------- measuring
struct Draw {
    bool ok = false;
    std::string error;
    size_t pieceCount = 0;
    std::set<std::string> pieceNames;
    uint64_t hash = 0;
    bool allChainsReal = true;   // every outline: >=3 commands and positive length
};

static void mix(uint64_t& h, const std::string& s) {
    for (char c : s) { h ^= static_cast<uint64_t>(static_cast<unsigned char>(c)); h *= 1099511628211ull; }
}
static void mix(uint64_t& h, double d) {
    // 1e-6 mm quantisation: below any geometry this engine claims to control.
    long long q = static_cast<long long>(std::llround(d * 1e6));
    mix(h, std::to_string(q));
}
static void mixPath(uint64_t& h, const std::vector<PathCommand>& cmds) {
    for (const auto& c : cmds) {
        mix(h, static_cast<double>(static_cast<int>(c.type)));
        mix(h, c.to.x); mix(h, c.to.y);
        mix(h, c.cp1.x); mix(h, c.cp1.y);
        mix(h, c.cp2.x); mix(h, c.cp2.y);
    }
}

static double outlineLength(const std::vector<PathCommand>& cmds) {
    double L = 0;
    Point prev{0, 0};
    bool have = false;
    for (const auto& c : cmds) {
        if (have) L += std::hypot(c.to.x - prev.x, c.to.y - prev.y);
        prev = c.to;
        have = true;
    }
    return L;
}

static Draw measure(const std::string& field, int idx) {
    Draw d;
    GarmentSpec spec = hostFor(field);
    if (!setField(spec, field, idx)) { d.error = "unknown field"; return d; }
    try {
        DraftedPattern p = GarmentDrafter::draft(spec, body());
        d.ok = true;
        d.pieceCount = p.pieces.size();
        uint64_t h = 1469598103934665603ull;
        mix(h, p.garment);
        for (const auto& pc : p.pieces) {
            d.pieceNames.insert(pc.name);
            mix(h, pc.name);
            mix(h, pc.cutInstruction);
            mix(h, pc.closure);
            mixPath(h, pc.commands);
            mixPath(h, pc.markings);
            mixPath(h, pc.notches);
            if (pc.commands.size() < 3 || outlineLength(pc.commands) <= 0.0) d.allChainsReal = false;
        }
        d.hash = h;
    } catch (const std::exception& e) {
        d.error = e.what();
    } catch (...) {
        d.error = "unknown exception";
    }
    return d;
}

// ---------------------------------------------------------------- main
int main(int argc, char** argv) {
    std::string vocabPath, primPath, resPath;
    bool probe = false;
    for (int i = 1; i < argc; ++i) {
        std::string a = argv[i];
        if (a == "--probe") probe = true;
        else if (vocabPath.empty()) vocabPath = a;
        else if (primPath.empty()) primPath = a;
        else resPath = a;
    }
    if (vocabPath.empty() || primPath.empty() || resPath.empty()) {
        std::printf("usage: preset_resolve_check <vocab.json> <primitives-v1.json> <vocab-resolution-v1.json> [--probe]\n");
        return 2;
    }

    mj::Value vocab, prim, table;
    std::string err;
    if (!mj::load(vocabPath, vocab, err) || !mj::load(primPath, prim, err) || !mj::load(resPath, table, err)) {
        std::printf("  [FAIL] %s\n", err.c_str());
        return 1;
    }

    const mj::Value* fields = vocab.find("fields");
    const mj::Value* prims = prim.find("primitifler");
    const mj::Value* entries = table.find("resolutions");
    if (!fields || fields->type != mj::Value::Obj) { fail("engine/vocab.json: fields missing"); return 1; }
    if (!prims || prims->type != mj::Value::Obj) { fail("primitives-v1.json: primitifler missing"); return 1; }
    if (!entries || entries->type != mj::Value::Obj) { fail("vocab-resolution-v1.json: resolutions missing"); return 1; }

    // op name -> declared parameter names
    std::map<std::string, std::set<std::string>> opParams;
    for (const auto& kv : prims->obj) {
        std::set<std::string> ps;
        const mj::Value* pp = kv.second.find("parametreler");
        if (pp && pp->type == mj::Value::Obj)
            for (const auto& p : pp->obj) ps.insert(p.first);
        const mj::Value* ops = kv.second.find("operatorler");
        if (ops && ops->type == mj::Value::Obj)
            for (const auto& p : ops->obj) ps.insert(p.first);
        opParams[kv.first] = ps;
    }

    // ---- PROBE: measure only, judge nothing.
    if (probe) {
        for (const auto& f : fields->obj) {
            const mj::Value* vals = f.second.find("values");
            if (!vals) continue;
            std::map<uint64_t, std::string> seen;
            Draw ref = measure(f.first, 0);
            for (size_t i = 0; i < vals->arr.size(); ++i) {
                const std::string& name = vals->arr[i].str;
                Draw d = measure(f.first, static_cast<int>(i));
                std::string effect;
                if (!d.ok) effect = std::string("THROW: ") + d.error;
                else if (i == 0) effect = "base";
                else if (!ref.ok) effect = "refThrow";
                else if (d.pieceNames != ref.pieceNames) effect = "newPanel";
                else if (d.hash != ref.hash) effect = "reshape";
                else effect = "none";
                std::string dup;
                if (d.ok) {
                    auto it = seen.find(d.hash);
                    if (it != seen.end()) dup = " DUP-OF=" + it->second;
                    else seen[d.hash] = name;
                }
                std::printf("%s.%s pieces=%zu chains=%s effect=%s%s\n", f.first.c_str(), name.c_str(),
                            d.pieceCount, d.allChainsReal ? "ok" : "BROKEN", effect.c_str(), dup.c_str());
            }
        }
        return 0;
    }

    // ---- 1. BIJECTION
    std::set<std::string> vocabKeys;
    for (const auto& f : fields->obj) {
        const mj::Value* vals = f.second.find("values");
        if (!vals || vals->type != mj::Value::Arr) { fail("vocab field without values: " + f.first); continue; }
        for (const auto& v : vals->arr) vocabKeys.insert(f.first + "." + v.str);
    }
    std::set<std::string> tableKeys;
    for (const auto& e : entries->obj) tableKeys.insert(e.first);

    for (const auto& k : vocabKeys)
        if (!tableKeys.count(k)) fail("vocabulary value has NO resolution entry: " + k);
    for (const auto& k : tableKeys)
        if (!vocabKeys.count(k))
            fail("resolution table names a preset the vocabulary does not have: " + k +
                 " (a name with no vocabulary value cannot resolve to anything)");
    std::printf("  [PASS] bijection vocab<->table (%zu vocabulary values)\n", vocabKeys.size());

    // ---- 2..6 per entry
    int resolved = 0, absent = 0, sentinel = 0;
    std::map<std::string, std::map<uint64_t, std::string>> drawnByField;

    for (const auto& f : fields->obj) {
        const std::string& field = f.first;
        const mj::Value* vals = f.second.find("values");
        if (!vals) continue;

        Draw ref = measure(field, 0);
        int referenceCount = 0;

        for (size_t i = 0; i < vals->arr.size(); ++i) {
            const std::string name = vals->arr[i].str;
            const std::string key = field + "." + name;
            const mj::Value* e = entries->find(key);
            if (!e) continue;   // already reported by the bijection rule
            const std::string status = e->s("status");
            const mj::Value* bundle = e->find("bundle");

            if (status == "sentinel") {
                sentinel++;
                if (bundle && bundle->type == mj::Value::Arr && !bundle->arr.empty())
                    fail(key + ": sentinel (absence) must carry an EMPTY bundle — absence has no geometry");
                continue;
            }
            if (status == "absent") {
                absent++;
                if (e->s("absentReason").empty())
                    fail(key + ": status=absent needs a non-empty absentReason (honest, not silent)");
                continue;
            }
            if (status != "resolved") {
                fail(key + ": unknown status '" + status + "'");
                continue;
            }
            resolved++;

            // 2. BUNDLE
            if (!bundle || bundle->type != mj::Value::Arr || bundle->arr.empty()) {
                fail(key + ": status=resolved with an EMPTY primitive bundle — a name with no "
                           "primitives is exactly the menu item this gate exists to refuse");
                continue;
            }
            bool bundleOk = true;
            for (const auto& step : bundle->arr) {
                const std::string op = step.s("op");
                auto it = opParams.find(op);
                if (it == opParams.end()) {
                    fail(key + ": bundle names primitive '" + op + "' which contract/primitives-v1.json does not define");
                    bundleOk = false;
                    continue;
                }
                const mj::Value* params = step.find("params");
                if (params && params->type == mj::Value::Obj)
                    for (const auto& p : params->obj)
                        if (!it->second.count(p.first)) {
                            fail(key + ": primitive '" + op + "' has no parameter '" + p.first + "'");
                            bundleOk = false;
                        }
            }
            if (!bundleOk) continue;

            // 3. DRAWS
            Draw d = measure(field, static_cast<int>(i));
            if (!d.ok) {
                fail(key + ": status=resolved but the engine refuses to draft its host: " + d.error);
                continue;
            }
            if (d.pieceCount == 0) {
                fail(key + ": status=resolved but the draft has ZERO pieces");
                continue;
            }
            if (!d.allChainsReal) {
                fail(key + ": a drafted piece outline is not a real chain (<3 commands or zero length)");
                continue;
            }

            // 4. EFFECT
            std::string measured;
            if (i == 0) measured = "base";
            else if (!ref.ok) measured = "refThrow";
            else if (d.pieceNames != ref.pieceNames) measured = "newPanel";
            else if (d.hash != ref.hash) measured = "reshape";
            else measured = "none";
            const std::string declared = e->s("engineEffect");
            if (declared != measured)
                fail(key + ": declared engineEffect='" + declared + "' but the engine measures '" + measured + "'");
            if (measured == "base") referenceCount++;
            if (measured == "none")
                fail(key + ": status=resolved but drafting it changes NOTHING vs the field reference — "
                           "mark it absent (engine-no-op) instead of charging nothing for it");

            // 5. DISTINCT
            auto& seen = drawnByField[field];
            auto it = seen.find(d.hash);
            if (it != seen.end())
                fail(key + ": drafts the SAME pattern as " + field + "." + it->second +
                     " — two names, one geometry: one of them is free");
            else
                seen[d.hash] = name;
        }
        if (referenceCount > 1) fail(field + ": more than one reference value");
    }

    std::printf("  [INFO] resolved=%d absent=%d sentinel=%d (total %d)\n",
                resolved, absent, sentinel, resolved + absent + sentinel);
    if (failures == 0) std::printf("  [PASS] every resolved preset decomposes into primitives AND draws a distinct panel chain\n");
    std::printf("%s: %d failure(s)\n", failures ? "FAIL" : "PASS", failures);
    return failures ? 1 : 0;
}
