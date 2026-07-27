// Recipe interpreter (docs/RECETE-SPEC.md v1). Three layers, all in this file:
//   1. a minimal strict JSON reader (ordered keys, duplicate keys = Err),
//   2. the v1 formula language (+ - * / unary minus, parens, min/max/clamp/gate)
//      parsed into small expression trees, names resolved STATICALLY at parse
//      time (unknown identifier / shadowing / forward reference = Err),
//   3. the executor: consts → scalars → piece scalars → points → PathCommands
//      in document order, then the kernel's own post services (offsetOutline
//      cut line, fabricEstimate, guide) with enums from the sealed `kernel`
//      block only.
// Evaluation is PER-OP (no reassociation, no fused contraction) — the byte
// gate against the pinned golden rests on this (RECETE-SPEC §2.1 probe).
#include "recipe.hpp"

#include <algorithm>
#include <cctype>
#include <cstdlib>
#include <fstream>
#include <set>
#include <sstream>

#include "skirt.hpp"

namespace stitchu {
namespace recipe {
namespace {

// ---------------------------------------------------------------------------
// error transport: internal throw, caught at every public API boundary.
struct RecipeError {
    std::string msg;
};
[[noreturn]] void fail(const std::string& msg) { throw RecipeError{msg}; }

// ---------------------------------------------------------------------------
// 1. JSON reader (strict subset: object/array/string/number/bool/null,
//    ordered object keys, duplicate key = Err, trailing garbage = Err).
struct JValue {
    enum class T { Null, Bool, Num, Str, Arr, Obj };
    T t = T::Null;
    bool b = false;
    double num = 0;
    std::string str;
    std::vector<JValue> arr;
    std::vector<std::pair<std::string, JValue>> obj;

    const JValue* find(const std::string& key) const {
        for (const auto& kv : obj)
            if (kv.first == key) return &kv.second;
        return nullptr;
    }
};

class JsonReader {
public:
    explicit JsonReader(const std::string& text) : s_(text) {}

    JValue parse() {
        JValue v = value();
        skipWs();
        if (i_ != s_.size()) fail("json: trailing characters after document (offset " + std::to_string(i_) + ")");
        return v;
    }

private:
    const std::string& s_;
    size_t i_ = 0;

    void skipWs() {
        while (i_ < s_.size() && (s_[i_] == ' ' || s_[i_] == '\t' || s_[i_] == '\n' || s_[i_] == '\r')) ++i_;
    }
    char peek() {
        skipWs();
        if (i_ >= s_.size()) fail("json: unexpected end of document");
        return s_[i_];
    }
    void expect(char c) {
        if (peek() != c) fail(std::string("json: expected '") + c + "' at offset " + std::to_string(i_));
        ++i_;
    }

    JValue value() {
        const char c = peek();
        if (c == '{') return object();
        if (c == '[') return array();
        if (c == '"') { JValue v; v.t = JValue::T::Str; v.str = string(); return v; }
        if (c == 't' || c == 'f') return boolean();
        if (c == 'n') { literal("null"); return JValue{}; }
        return number();
    }

    void literal(const char* word) {
        for (const char* p = word; *p; ++p) {
            if (i_ >= s_.size() || s_[i_] != *p) fail(std::string("json: bad literal, expected '") + word + "'");
            ++i_;
        }
    }
    JValue boolean() {
        JValue v; v.t = JValue::T::Bool;
        if (s_[i_] == 't') { literal("true"); v.b = true; }
        else { literal("false"); v.b = false; }
        return v;
    }
    JValue number() {
        const size_t start = i_;
        if (i_ < s_.size() && s_[i_] == '-') ++i_;
        while (i_ < s_.size() && (std::isdigit(static_cast<unsigned char>(s_[i_])) || s_[i_] == '.' ||
                                  s_[i_] == 'e' || s_[i_] == 'E' || s_[i_] == '+' || s_[i_] == '-')) ++i_;
        if (i_ == start) fail("json: expected a value at offset " + std::to_string(start));
        char* end = nullptr;
        const std::string tok = s_.substr(start, i_ - start);
        const double d = std::strtod(tok.c_str(), &end);
        if (!end || *end != '\0') fail("json: bad number '" + tok + "'");
        JValue v; v.t = JValue::T::Num; v.num = d;
        return v;
    }
    std::string string() {
        expect('"');
        std::string out;
        while (true) {
            if (i_ >= s_.size()) fail("json: unterminated string");
            const char c = s_[i_++];
            if (c == '"') break;
            if (c == '\\') {
                if (i_ >= s_.size()) fail("json: unterminated escape");
                const char e = s_[i_++];
                switch (e) {
                    case '"': out += '"'; break;
                    case '\\': out += '\\'; break;
                    case '/': out += '/'; break;
                    case 'b': out += '\b'; break;
                    case 'f': out += '\f'; break;
                    case 'n': out += '\n'; break;
                    case 'r': out += '\r'; break;
                    case 't': out += '\t'; break;
                    default: fail(std::string("json: unsupported escape '\\") + e + "'");
                }
            } else {
                out += c;
            }
        }
        return out;
    }
    JValue array() {
        expect('[');
        JValue v; v.t = JValue::T::Arr;
        if (peek() == ']') { ++i_; return v; }
        while (true) {
            v.arr.push_back(value());
            const char c = peek();
            if (c == ',') { ++i_; continue; }
            if (c == ']') { ++i_; break; }
            fail("json: expected ',' or ']' at offset " + std::to_string(i_));
        }
        return v;
    }
    JValue object() {
        expect('{');
        JValue v; v.t = JValue::T::Obj;
        if (peek() == '}') { ++i_; return v; }
        while (true) {
            const std::string key = string();
            for (const auto& kv : v.obj)
                if (kv.first == key) fail("json: duplicate key '" + key + "'");
            expect(':');
            v.obj.emplace_back(key, value());
            const char c = peek();
            if (c == ',') { ++i_; continue; }
            if (c == '}') { ++i_; break; }
            fail("json: expected ',' or '}' at offset " + std::to_string(i_));
        }
        return v;
    }
};

// Every object is checked against a closed key list (the recipe-side
// additionalProperties:false — no smuggled knobs, RECETE-SPEC §2.2).
void checkKeys(const JValue& obj, const std::set<std::string>& allowed, const std::string& where) {
    for (const auto& kv : obj.obj)
        if (!allowed.count(kv.first)) fail(where + ": unknown key '" + kv.first + "'");
}
const JValue& need(const JValue& obj, const std::string& key, const std::string& where) {
    const JValue* v = obj.find(key);
    if (!v) fail(where + ": missing key '" + key + "'");
    return *v;
}
const std::string& asStr(const JValue& v, const std::string& where) {
    if (v.t != JValue::T::Str) fail(where + ": expected a string");
    return v.str;
}
double asNum(const JValue& v, const std::string& where) {
    if (v.t != JValue::T::Num) fail(where + ": expected a number");
    return v.num;
}
const JValue& asObj(const JValue& v, const std::string& where) {
    if (v.t != JValue::T::Obj) fail(where + ": expected an object");
    return v;
}
const JValue& asArr(const JValue& v, const std::string& where) {
    if (v.t != JValue::T::Arr) fail(where + ": expected an array");
    return v;
}

// ---------------------------------------------------------------------------
// 2. formula language (RECETE-SPEC §2.1).
struct Expr {
    enum class K { Num, Var, Add, Sub, Mul, Div, Neg, Min, Max, Clamp, Gate };
    K k = K::Num;
    double num = 0;
    std::string name;        // Var
    std::vector<Expr> kids;  // operands, in order
};

class FormulaParser {
public:
    explicit FormulaParser(const std::string& text, const std::string& where)
        : s_(text), where_(where) {}

    Expr parse() {
        Expr e = expr();
        skipWs();
        if (i_ != s_.size()) fail(where_ + ": trailing characters in formula '" + s_ + "'");
        return e;
    }

private:
    const std::string& s_;
    std::string where_;
    size_t i_ = 0;

    void skipWs() { while (i_ < s_.size() && s_[i_] == ' ') ++i_; }
    bool eat(char c) {
        skipWs();
        if (i_ < s_.size() && s_[i_] == c) { ++i_; return true; }
        return false;
    }

    Expr expr() {
        Expr left = term();
        while (true) {
            if (eat('+')) { Expr e; e.k = Expr::K::Add; e.kids = {std::move(left), term()}; left = std::move(e); }
            else if (eat('-')) { Expr e; e.k = Expr::K::Sub; e.kids = {std::move(left), term()}; left = std::move(e); }
            else break;
        }
        return left;
    }
    Expr term() {
        Expr left = factor();
        while (true) {
            if (eat('*')) { Expr e; e.k = Expr::K::Mul; e.kids = {std::move(left), factor()}; left = std::move(e); }
            else if (eat('/')) { Expr e; e.k = Expr::K::Div; e.kids = {std::move(left), factor()}; left = std::move(e); }
            else break;
        }
        return left;
    }
    Expr factor() {
        if (eat('-')) { Expr e; e.k = Expr::K::Neg; e.kids = {factor()}; return e; }
        return primary();
    }
    Expr primary() {
        skipWs();
        if (i_ >= s_.size()) fail(where_ + ": formula '" + s_ + "' ends unexpectedly");
        const char c = s_[i_];
        if (c == '(') {
            ++i_;
            Expr e = expr();
            if (!eat(')')) fail(where_ + ": missing ')' in formula '" + s_ + "'");
            return e;
        }
        if (std::isdigit(static_cast<unsigned char>(c)) || c == '.') return numberTok();
        if (std::isalpha(static_cast<unsigned char>(c))) return identTok();
        fail(where_ + ": unexpected character '" + std::string(1, c) + "' in formula '" + s_ + "'");
    }
    Expr numberTok() {
        const size_t start = i_;
        while (i_ < s_.size() && (std::isdigit(static_cast<unsigned char>(s_[i_])) || s_[i_] == '.')) ++i_;
        char* end = nullptr;
        const std::string tok = s_.substr(start, i_ - start);
        const double d = std::strtod(tok.c_str(), &end);
        if (!end || *end != '\0') fail(where_ + ": bad number '" + tok + "' in formula '" + s_ + "'");
        Expr e; e.k = Expr::K::Num; e.num = d;
        return e;
    }
    Expr identTok() {
        const size_t start = i_;
        while (i_ < s_.size() && (std::isalnum(static_cast<unsigned char>(s_[i_])) || s_[i_] == '_')) ++i_;
        const std::string name = s_.substr(start, i_ - start);
        skipWs();
        if (i_ < s_.size() && s_[i_] == '(') {
            ++i_;
            std::vector<Expr> args;
            if (!eat(')')) {
                while (true) {
                    args.push_back(expr());
                    if (eat(',')) continue;
                    if (eat(')')) break;
                    fail(where_ + ": expected ',' or ')' in call to '" + name + "'");
                }
            }
            Expr e;
            if (name == "min") e.k = Expr::K::Min;
            else if (name == "max") e.k = Expr::K::Max;
            else if (name == "clamp") e.k = Expr::K::Clamp;
            else if (name == "gate") e.k = Expr::K::Gate;
            else fail(where_ + ": unknown function '" + name + "' (v1 allows min/max/clamp/gate only)");
            const size_t arity = (e.k == Expr::K::Clamp) ? 3 : 2;
            if (args.size() != arity)
                fail(where_ + ": '" + name + "' takes " + std::to_string(arity) + " arguments, got " + std::to_string(args.size()));
            e.kids = std::move(args);
            return e;
        }
        Expr e; e.k = Expr::K::Var; e.name = name;
        return e;
    }
};

Expr parseFormula(const JValue& v, const std::string& where) {
    if (v.t == JValue::T::Num) { Expr e; e.k = Expr::K::Num; e.num = v.num; return e; }
    if (v.t != JValue::T::Str) fail(where + ": expected a formula string");
    return FormulaParser(v.str, where).parse();
}

// static name check: every Var must already be in scope (forward reference and
// unknown identifier are the same failure seen from here).
void checkVars(const Expr& e, const std::set<std::string>& scope, const std::string& where) {
    if (e.k == Expr::K::Var && !scope.count(e.name))
        fail(where + ": unknown or not-yet-defined name '" + e.name + "'");
    for (const Expr& kid : e.kids) checkVars(kid, scope, where);
}

double evalExpr(const Expr& e, const std::map<std::string, double>& env) {
    switch (e.k) {
        case Expr::K::Num: return e.num;
        case Expr::K::Var: return env.at(e.name);
        case Expr::K::Add: return evalExpr(e.kids[0], env) + evalExpr(e.kids[1], env);
        case Expr::K::Sub: return evalExpr(e.kids[0], env) - evalExpr(e.kids[1], env);
        case Expr::K::Mul: return evalExpr(e.kids[0], env) * evalExpr(e.kids[1], env);
        case Expr::K::Div: return evalExpr(e.kids[0], env) / evalExpr(e.kids[1], env);
        case Expr::K::Neg: return -evalExpr(e.kids[0], env);
        case Expr::K::Min: return std::min(evalExpr(e.kids[0], env), evalExpr(e.kids[1], env));
        case Expr::K::Max: return std::max(evalExpr(e.kids[0], env), evalExpr(e.kids[1], env));
        case Expr::K::Clamp: {
            const double x = evalExpr(e.kids[0], env);
            const double lo = evalExpr(e.kids[1], env);
            const double hi = evalExpr(e.kids[2], env);
            return std::clamp(x, lo, hi);
        }
        case Expr::K::Gate: {
            // gate(x, t) = x >= t ? x : 0 — the motor's "a dart below the
            // minimum folds into the side seam" rule (skirt.cpp:43-46).
            const double x = evalExpr(e.kids[0], env);
            const double t = evalExpr(e.kids[1], env);
            return x >= t ? x : 0.0;
        }
    }
    return 0.0;
}

// `when` comparisons: both sides are ATOMS (identifier or decimal constant),
// operators > >= < <= only, list entries joined by AND (RECETE-SPEC §2.1).
struct Cmp {
    enum class Op { Gt, Ge, Lt, Le };
    Op op = Op::Gt;
    Expr lhs, rhs;
};

Cmp parseCmp(const std::string& text, const std::string& where) {
    const size_t gt = text.find('>');
    const size_t lt = text.find('<');
    if ((gt == std::string::npos) == (lt == std::string::npos))
        fail(where + ": comparison '" + text + "' needs exactly one of > >= < <=");
    const size_t pos = gt != std::string::npos ? gt : lt;
    Cmp cmp;
    size_t opLen = 1;
    if (pos + 1 < text.size() && text[pos + 1] == '=') opLen = 2;
    if (gt != std::string::npos) cmp.op = opLen == 2 ? Cmp::Op::Ge : Cmp::Op::Gt;
    else cmp.op = opLen == 2 ? Cmp::Op::Le : Cmp::Op::Lt;
    auto atom = [&](std::string side, const char* which) -> Expr {
        // trim
        while (!side.empty() && side.front() == ' ') side.erase(side.begin());
        while (!side.empty() && side.back() == ' ') side.pop_back();
        if (side.empty()) fail(where + ": comparison '" + text + "' missing its " + which + " side");
        Expr e = FormulaParser(side, where).parse();
        if (e.k != Expr::K::Var && e.k != Expr::K::Num)
            fail(where + ": comparison side '" + side + "' must be an identifier or a number (no expressions in when)");
        return e;
    };
    cmp.lhs = atom(text.substr(0, pos), "left");
    cmp.rhs = atom(text.substr(pos + opLen), "right");
    return cmp;
}

bool evalCmp(const Cmp& c, const std::map<std::string, double>& env) {
    const double a = evalExpr(c.lhs, env);
    const double b = evalExpr(c.rhs, env);
    switch (c.op) {
        case Cmp::Op::Gt: return a > b;
        case Cmp::Op::Ge: return a >= b;
        case Cmp::Op::Lt: return a < b;
        case Cmp::Op::Le: return a <= b;
    }
    return false;
}

// ---------------------------------------------------------------------------
// document structures.
struct ScalarDef {
    std::string id;
    Expr f;
};
struct PointDef {
    std::string id;
    Expr x, y;
};
struct PathTarget {
    bool isPoint = false;
    std::string point;
    Expr x, y;
};
struct OutlineOp {
    enum class K { Move, Line, Curve, Close };
    K k = K::Close;
    PathTarget to;
    Expr cp1x, cp1y, cp2x, cp2y;  // Curve only
};
struct MarkingOp {
    enum class K { Move, Line, Dart };
    K k = K::Move;
    PathTarget to;                // Move/Line
    std::vector<Cmp> when;        // Dart (optional)
    Expr centerX, width, depth, legY;  // Dart
};
struct PieceDef {
    std::string name;
    std::string cut;
    double seamAllowanceMM = 0;
    std::vector<ScalarDef> scalars;
    std::vector<PointDef> points;
    std::vector<OutlineOp> outline;
    std::vector<MarkingOp> markings;
    Expr grainFromX, grainFromY, grainToX, grainToY;
};
struct ParamDef {
    std::string name;
    double min = 0;
    double max = 0;
    std::string table;  // optional K1 reference
};

} // namespace

struct RecipeDoc {
    std::string id;
    std::string title;
    // sealed kernel block — the only enum source (RECETE-SPEC §2.2).
    GarmentType garment = GarmentType::Skirt;
    SkirtStyle skirtStyle = SkirtStyle::ALine;
    Shaping shaping = Shaping::Dart;
    Fabric fabric = Fabric::Woven;
    std::vector<std::string> measurements;
    std::vector<ParamDef> params;
    std::string lengthParam;  // the param bound to draft.skirtLengthMM
    std::vector<std::pair<std::string, double>> consts;  // ordered
    std::map<std::string, double> constsMap;             // accessor copy
    std::vector<ScalarDef> scalars;
    std::vector<PieceDef> pieces;
};

namespace {

// closed measurement vocabulary: the snapshot's mm getters (measurements.hpp).
double measurementValue(const BodyMeasurementsSnapshot& m, const std::string& name) {
    if (name == "bustMM") return m.bustMM();
    if (name == "waistMM") return m.waistMM();
    if (name == "hipMM") return m.hipMM();
    if (name == "backLengthMM") return m.backLengthMM();
    if (name == "neckMM") return m.neckMM();
    if (name == "upperBustMM") return m.upperBustMM();
    return -1;  // unreachable after parse-time validation
}
bool knownMeasurement(const std::string& name) {
    return name == "bustMM" || name == "waistMM" || name == "hipMM" ||
           name == "backLengthMM" || name == "neckMM" || name == "upperBustMM";
}

GarmentType parseGarmentEnum(const std::string& s) {
    if (s == "skirt") return GarmentType::Skirt;
    if (s == "dress") return GarmentType::Dress;
    if (s == "top") return GarmentType::Top;
    fail("kernel.garment: unknown value '" + s + "'");
}
SkirtStyle parseSkirtStyleEnum(const std::string& s) {
    if (s == "aLine") return SkirtStyle::ALine;
    if (s == "straight") return SkirtStyle::Straight;
    if (s == "gathered") return SkirtStyle::Gathered;
    if (s == "halfCircle") return SkirtStyle::HalfCircle;
    if (s == "pleated") return SkirtStyle::Pleated;
    if (s == "gore") return SkirtStyle::Gore;
    fail("kernel.skirtStyle: unknown value '" + s + "'");
}
Shaping parseShapingEnum(const std::string& s) {
    if (s == "dart") return Shaping::Dart;
    if (s == "princess") return Shaping::Princess;
    fail("kernel.shaping: unknown value '" + s + "'");
}
Fabric parseFabricEnum(const std::string& s) {
    if (s == "woven") return Fabric::Woven;
    if (s == "knit") return Fabric::Knit;
    fail("kernel.fabric: unknown value '" + s + "'");
}

// one shared "add a name to the visible scope chain" step: collision anywhere
// in the chain = Err (no shadowing, no priority order — RECETE-SPEC §2.1).
void addName(std::set<std::string>& scope, const std::string& name, const std::string& where) {
    if (name.empty()) fail(where + ": empty name");
    if (!scope.insert(name).second)
        fail(where + ": name '" + name + "' collides with an earlier definition in the same scope chain");
}

PathTarget parseTarget(const JValue& v, const std::set<std::string>& pointIds,
                       const std::set<std::string>& scope, const std::string& where) {
    PathTarget t;
    if (v.t == JValue::T::Str) {
        t.isPoint = true;
        t.point = v.str;
        if (!pointIds.count(t.point)) fail(where + ": unknown point '" + t.point + "'");
        return t;
    }
    const JValue& arr = asArr(v, where);
    if (arr.arr.size() != 2) fail(where + ": coordinate target needs exactly [xFormula, yFormula]");
    t.x = parseFormula(arr.arr[0], where + ".x");
    t.y = parseFormula(arr.arr[1], where + ".y");
    checkVars(t.x, scope, where + ".x");
    checkVars(t.y, scope, where + ".y");
    return t;
}

Expr parseCoord(const JValue& v, const std::set<std::string>& scope, const std::string& where) {
    Expr e = parseFormula(v, where);
    checkVars(e, scope, where);
    return e;
}

PieceDef parsePiece(const JValue& jv, const std::set<std::string>& globalScope, size_t index) {
    const std::string where = "pieces[" + std::to_string(index) + "]";
    const JValue& obj = asObj(jv, where);
    checkKeys(obj, {"name", "cut", "seamAllowanceMM", "scalars", "points", "outline", "markings", "grainline"}, where);

    PieceDef piece;
    piece.name = asStr(need(obj, "name", where), where + ".name");
    if (piece.name.empty()) fail(where + ".name: empty");
    piece.cut = asStr(need(obj, "cut", where), where + ".cut");
    piece.seamAllowanceMM = asNum(need(obj, "seamAllowanceMM", where), where + ".seamAllowanceMM");
    if (piece.seamAllowanceMM <= 0) fail(where + ".seamAllowanceMM: must be > 0");

    // piece-local value scope: the global chain + local scalars (sequential).
    std::set<std::string> scope = globalScope;
    const JValue& scalars = asArr(need(obj, "scalars", where), where + ".scalars");
    for (size_t i = 0; i < scalars.arr.size(); ++i) {
        const std::string sw = where + ".scalars[" + std::to_string(i) + "]";
        const JValue& sv = asObj(scalars.arr[i], sw);
        checkKeys(sv, {"id", "f"}, sw);
        ScalarDef def;
        def.id = asStr(need(sv, "id", sw), sw + ".id");
        def.f = parseFormula(need(sv, "f", sw), sw + ".f");
        checkVars(def.f, scope, sw + ".f");
        addName(scope, def.id, sw);
        piece.scalars.push_back(std::move(def));
    }

    // points: a separate id namespace (they are path anchors, not formula
    // values); duplicate point id = Err, formulas see the value scope only.
    std::set<std::string> pointIds;
    const JValue& points = asArr(need(obj, "points", where), where + ".points");
    for (size_t i = 0; i < points.arr.size(); ++i) {
        const std::string pw = where + ".points[" + std::to_string(i) + "]";
        const JValue& pv = asObj(points.arr[i], pw);
        checkKeys(pv, {"id", "x", "y"}, pw);
        PointDef def;
        def.id = asStr(need(pv, "id", pw), pw + ".id");
        if (!pointIds.insert(def.id).second) fail(pw + ": duplicate point id '" + def.id + "'");
        def.x = parseCoord(need(pv, "x", pw), scope, pw + ".x");
        def.y = parseCoord(need(pv, "y", pw), scope, pw + ".y");
        piece.points.push_back(std::move(def));
    }

    const JValue& outline = asArr(need(obj, "outline", where), where + ".outline");
    if (outline.arr.empty()) fail(where + ".outline: empty");
    for (size_t i = 0; i < outline.arr.size(); ++i) {
        const std::string ow = where + ".outline[" + std::to_string(i) + "]";
        const JValue& ov = asObj(outline.arr[i], ow);
        const std::string op = asStr(need(ov, "op", ow), ow + ".op");
        OutlineOp out;
        if (op == "move" || op == "line") {
            checkKeys(ov, {"op", "to"}, ow);
            out.k = op == "move" ? OutlineOp::K::Move : OutlineOp::K::Line;
            out.to = parseTarget(need(ov, "to", ow), pointIds, scope, ow + ".to");
        } else if (op == "curve") {
            checkKeys(ov, {"op", "to", "cp1", "cp2"}, ow);
            out.k = OutlineOp::K::Curve;
            out.to = parseTarget(need(ov, "to", ow), pointIds, scope, ow + ".to");
            const JValue& cp1 = asArr(need(ov, "cp1", ow), ow + ".cp1");
            const JValue& cp2 = asArr(need(ov, "cp2", ow), ow + ".cp2");
            if (cp1.arr.size() != 2 || cp2.arr.size() != 2) fail(ow + ": cp1/cp2 need exactly [xFormula, yFormula]");
            out.cp1x = parseCoord(cp1.arr[0], scope, ow + ".cp1.x");
            out.cp1y = parseCoord(cp1.arr[1], scope, ow + ".cp1.y");
            out.cp2x = parseCoord(cp2.arr[0], scope, ow + ".cp2.x");
            out.cp2y = parseCoord(cp2.arr[1], scope, ow + ".cp2.y");
        } else if (op == "close") {
            checkKeys(ov, {"op"}, ow);
            out.k = OutlineOp::K::Close;
        } else {
            fail(ow + ": unknown op '" + op + "'");
        }
        piece.outline.push_back(std::move(out));
    }

    const JValue& markings = asArr(need(obj, "markings", where), where + ".markings");
    for (size_t i = 0; i < markings.arr.size(); ++i) {
        const std::string mw = where + ".markings[" + std::to_string(i) + "]";
        const JValue& mv = asObj(markings.arr[i], mw);
        const std::string op = asStr(need(mv, "op", mw), mw + ".op");
        MarkingOp mark;
        if (op == "move" || op == "line") {
            checkKeys(mv, {"op", "to"}, mw);
            mark.k = op == "move" ? MarkingOp::K::Move : MarkingOp::K::Line;
            mark.to = parseTarget(need(mv, "to", mw), pointIds, scope, mw + ".to");
        } else if (op == "dart") {
            checkKeys(mv, {"op", "when", "centerX", "width", "depth", "legY"}, mw);
            mark.k = MarkingOp::K::Dart;
            if (const JValue* when = mv.find("when")) {
                const JValue& wa = asArr(*when, mw + ".when");
                for (size_t j = 0; j < wa.arr.size(); ++j) {
                    const std::string ww = mw + ".when[" + std::to_string(j) + "]";
                    Cmp cmp = parseCmp(asStr(wa.arr[j], ww), ww);
                    checkVars(cmp.lhs, scope, ww);
                    checkVars(cmp.rhs, scope, ww);
                    mark.when.push_back(std::move(cmp));
                }
            }
            mark.centerX = parseCoord(need(mv, "centerX", mw), scope, mw + ".centerX");
            mark.width = parseCoord(need(mv, "width", mw), scope, mw + ".width");
            mark.depth = parseCoord(need(mv, "depth", mw), scope, mw + ".depth");
            mark.legY = parseCoord(need(mv, "legY", mw), scope, mw + ".legY");
        } else {
            fail(mw + ": unknown op '" + op + "' (markings allow move/line/dart)");
        }
        piece.markings.push_back(std::move(mark));
    }

    const std::string gw = where + ".grainline";
    const JValue& grain = asObj(need(obj, "grainline", where), gw);
    checkKeys(grain, {"from", "to"}, gw);
    const JValue& gf = asArr(need(grain, "from", gw), gw + ".from");
    const JValue& gt = asArr(need(grain, "to", gw), gw + ".to");
    if (gf.arr.size() != 2 || gt.arr.size() != 2) fail(gw + ": from/to need exactly [xFormula, yFormula]");
    piece.grainFromX = parseCoord(gf.arr[0], scope, gw + ".from.x");
    piece.grainFromY = parseCoord(gf.arr[1], scope, gw + ".from.y");
    piece.grainToX = parseCoord(gt.arr[0], scope, gw + ".to.x");
    piece.grainToY = parseCoord(gt.arr[1], scope, gw + ".to.y");
    return piece;
}

std::shared_ptr<const RecipeDoc> parseDoc(const std::string& jsonText) {
    const JValue root = JsonReader(jsonText).parse();
    const std::string where = "recipe";
    const JValue& obj = asObj(root, where);
    checkKeys(obj, {"recipeVersion", "id", "title", "units", "kernel", "measurements",
                    "params", "consts", "scalars", "pieces"}, where);

    const double version = asNum(need(obj, "recipeVersion", where), where + ".recipeVersion");
    if (version != 1) fail(where + ": unknown recipeVersion " + std::to_string(version) + " (v1 only)");

    auto doc = std::make_shared<RecipeDoc>();
    doc->id = asStr(need(obj, "id", where), where + ".id");
    if (doc->id.empty()) fail(where + ".id: empty");
    doc->title = asStr(need(obj, "title", where), where + ".title");
    const std::string units = asStr(need(obj, "units", where), where + ".units");
    if (units != "mm") fail(where + ".units: '" + units + "' is not supported (mm only)");

    // sealed kernel block: fixed closed-enum quadruple, nothing else.
    const std::string kw = where + ".kernel";
    const JValue& kernel = asObj(need(obj, "kernel", where), kw);
    checkKeys(kernel, {"garment", "skirtStyle", "shaping", "fabric"}, kw);
    doc->garment = parseGarmentEnum(asStr(need(kernel, "garment", kw), kw + ".garment"));
    doc->skirtStyle = parseSkirtStyleEnum(asStr(need(kernel, "skirtStyle", kw), kw + ".skirtStyle"));
    doc->shaping = parseShapingEnum(asStr(need(kernel, "shaping", kw), kw + ".shaping"));
    doc->fabric = parseFabricEnum(asStr(need(kernel, "fabric", kw), kw + ".fabric"));

    // one visible scope chain: measurements + params + consts + global scalars.
    std::set<std::string> scope;
    const JValue& meas = asArr(need(obj, "measurements", where), where + ".measurements");
    if (meas.arr.empty()) fail(where + ".measurements: empty");
    for (size_t i = 0; i < meas.arr.size(); ++i) {
        const std::string mw = where + ".measurements[" + std::to_string(i) + "]";
        const std::string name = asStr(meas.arr[i], mw);
        if (!knownMeasurement(name)) fail(mw + ": unknown measurement '" + name + "'");
        addName(scope, name, mw);
        doc->measurements.push_back(name);
    }

    const std::string paw = where + ".params";
    const JValue& params = asObj(need(obj, "params", where), paw);
    for (const auto& kv : params.obj) {
        const std::string pw = paw + "." + kv.first;
        const JValue& pv = asObj(kv.second, pw);
        checkKeys(pv, {"min", "max", "table"}, pw);
        ParamDef def;
        def.name = kv.first;
        def.min = asNum(need(pv, "min", pw), pw + ".min");
        def.max = asNum(need(pv, "max", pw), pw + ".max");
        if (!(def.min < def.max)) fail(pw + ": min must be < max");
        if (const JValue* table = pv.find("table")) {
            def.table = asStr(*table, pw + ".table");
            // v1 seal: the only known K1 table reference.
            if (def.table != "draft.skirtLengthMM")
                fail(pw + ".table: unknown table '" + def.table + "'");
            if (!doc->lengthParam.empty())
                fail(pw + ".table: draft.skirtLengthMM already bound to param '" + doc->lengthParam + "'");
            doc->lengthParam = def.name;
        }
        addName(scope, def.name, pw);
        doc->params.push_back(std::move(def));
    }

    const std::string cw = where + ".consts";
    const JValue& consts = asObj(need(obj, "consts", where), cw);
    for (const auto& kv : consts.obj) {
        const double v = asNum(kv.second, cw + "." + kv.first);
        addName(scope, kv.first, cw + "." + kv.first);
        doc->consts.emplace_back(kv.first, v);
        doc->constsMap[kv.first] = v;
    }

    const JValue& scalars = asArr(need(obj, "scalars", where), where + ".scalars");
    for (size_t i = 0; i < scalars.arr.size(); ++i) {
        const std::string sw = where + ".scalars[" + std::to_string(i) + "]";
        const JValue& sv = asObj(scalars.arr[i], sw);
        checkKeys(sv, {"id", "f"}, sw);
        ScalarDef def;
        def.id = asStr(need(sv, "id", sw), sw + ".id");
        def.f = parseFormula(need(sv, "f", sw), sw + ".f");
        checkVars(def.f, scope, sw + ".f");  // forward reference = unknown name here
        addName(scope, def.id, sw);
        doc->scalars.push_back(std::move(def));
    }

    const JValue& pieces = asArr(need(obj, "pieces", where), where + ".pieces");
    if (pieces.arr.empty()) fail(where + ".pieces: empty");
    std::set<std::string> pieceNames;
    for (size_t i = 0; i < pieces.arr.size(); ++i) {
        PieceDef piece = parsePiece(pieces.arr[i], scope, i);
        if (!pieceNames.insert(piece.name).second)
            fail("pieces[" + std::to_string(i) + "]: duplicate piece name '" + piece.name + "'");
        doc->pieces.push_back(std::move(piece));
    }

    // a skirt kernel's fabric/guide services need the K1 length wire — declared
    // in the document itself via the table binding, not by any hidden mapping.
    if (doc->garment == GarmentType::Skirt && doc->lengthParam.empty())
        fail(where + ".params: a skirt recipe needs one param bound to table draft.skirtLengthMM");

    return doc;
}

Point evalTarget(const PathTarget& t, const std::map<std::string, Point>& points,
                 const std::map<std::string, double>& env) {
    if (t.isPoint) return points.at(t.point);
    return Point{evalExpr(t.x, env), evalExpr(t.y, env)};
}

} // namespace

// ---------------------------------------------------------------------------
// public API.

Result<Recipe> parseRecipe(const std::string& jsonText) {
    try {
        Recipe r;
        r.doc = parseDoc(jsonText);
        return Result<Recipe>::Ok(std::move(r));
    } catch (const RecipeError& e) {
        return Result<Recipe>::Err(e.msg);
    }
}

Result<Recipe> loadRecipeFile(const std::string& path) {
    std::ifstream in(path);
    if (!in) return Result<Recipe>::Err("recipe: cannot open file '" + path + "'");
    std::ostringstream buf;
    buf << in.rdbuf();
    return parseRecipe(buf.str());
}

GarmentSpec kernelSpec(const Recipe& recipe) {
    // built ONLY from the sealed kernel block; every other field keeps its
    // GarmentSpec default (all opt-ins off).
    GarmentSpec spec;
    spec.garment = recipe.doc->garment;
    spec.shaping = recipe.doc->shaping;
    spec.fabric = recipe.doc->fabric;
    spec.skirtStyle = recipe.doc->skirtStyle;
    return spec;
}

const std::string& recipeId(const Recipe& recipe) { return recipe.doc->id; }

const std::map<std::string, double>& recipeConsts(const Recipe& recipe) {
    return recipe.doc->constsMap;
}

Result<DraftedPattern> draftRecipe(
    const Recipe& recipe,
    const BodyMeasurementsSnapshot& m,
    const RecipeParams& params
) {
    using R = Result<DraftedPattern>;
    const RecipeDoc& doc = *recipe.doc;
    try {
        // v1 interpreter executes skirt kernels; anything else is refused
        // honestly (the drawing layer is generic, the kernel services are not).
        if (doc.garment != GarmentType::Skirt)
            fail("draft: kernel garment '" + std::string(raw(doc.garment)) + "' is not supported by the v1 interpreter (skirt only)");

        // params: enforced range, no missing, no smuggled keys (RULES inv 1).
        for (const auto& kv : params) {
            bool declared = false;
            for (const auto& def : doc.params) declared = declared || def.name == kv.first;
            if (!declared) fail("draft: param '" + kv.first + "' is not declared by recipe '" + doc.id + "'");
        }
        std::map<std::string, double> env;
        for (const auto& def : doc.params) {
            const auto it = params.find(def.name);
            if (it == params.end()) fail("draft: missing param '" + def.name + "'");
            if (it->second < def.min || it->second > def.max)
                fail("draft: param '" + def.name + "' = " + std::to_string(it->second) +
                     " outside declared range [" + std::to_string(def.min) + ", " + std::to_string(def.max) + "]");
            env[def.name] = it->second;
        }

        // measurements: fields default to 0 in the snapshot, so "missing" is
        // numeric — a listed measurement <= 0 is Err (RECETE-SPEC §2.2).
        for (const std::string& name : doc.measurements) {
            const double v = measurementValue(m, name);
            if (v <= 0) fail("draft: measurement '" + name + "' is missing or non-positive (" + std::to_string(v) + ")");
            env[name] = v;
        }

        for (const auto& kv : doc.consts) env[kv.first] = kv.second;
        for (const ScalarDef& def : doc.scalars) env[def.id] = evalExpr(def.f, env);

        DraftedPattern pattern;
        pattern.garment = std::string(title(doc.skirtStyle)) + " skirt";
        for (const PieceDef& def : doc.pieces) {
            std::map<std::string, double> penv = env;
            for (const ScalarDef& sdef : def.scalars) penv[sdef.id] = evalExpr(sdef.f, penv);
            std::map<std::string, Point> points;
            for (const PointDef& pdef : def.points)
                points[pdef.id] = Point{evalExpr(pdef.x, penv), evalExpr(pdef.y, penv)};

            PatternPiece piece;
            piece.name = def.name;
            piece.cutInstruction = def.cut;
            piece.seamAllowance = def.seamAllowanceMM;
            for (const OutlineOp& op : def.outline) {
                switch (op.k) {
                    case OutlineOp::K::Move:
                        piece.commands.push_back(PathCommand::move(evalTarget(op.to, points, penv)));
                        break;
                    case OutlineOp::K::Line:
                        piece.commands.push_back(PathCommand::line(evalTarget(op.to, points, penv)));
                        break;
                    case OutlineOp::K::Curve:
                        piece.commands.push_back(PathCommand::curve(
                            evalTarget(op.to, points, penv),
                            Point{evalExpr(op.cp1x, penv), evalExpr(op.cp1y, penv)},
                            Point{evalExpr(op.cp2x, penv), evalExpr(op.cp2y, penv)}));
                        break;
                    case OutlineOp::K::Close:
                        piece.commands.push_back(PathCommand::close());
                        break;
                }
            }
            for (const MarkingOp& op : def.markings) {
                if (op.k == MarkingOp::K::Move) {
                    piece.markings.push_back(PathCommand::move(evalTarget(op.to, points, penv)));
                } else if (op.k == MarkingOp::K::Line) {
                    piece.markings.push_back(PathCommand::line(evalTarget(op.to, points, penv)));
                } else {
                    bool holds = true;
                    for (const Cmp& cmp : op.when) holds = holds && evalCmp(cmp, penv);
                    if (!holds) continue;
                    // a dart expands to EXACTLY three commands — the motor's
                    // oneDart lambda verbatim (skirt.cpp:83-88).
                    const double cx = evalExpr(op.centerX, penv);
                    const double w = evalExpr(op.width, penv);
                    const double d = evalExpr(op.depth, penv);
                    const double ly = evalExpr(op.legY, penv);
                    piece.markings.push_back(PathCommand::move({cx - w / 2, ly}));
                    piece.markings.push_back(PathCommand::line({cx, d}));
                    piece.markings.push_back(PathCommand::line({cx + w / 2, ly}));
                }
            }
            piece.hasGrainline = true;
            piece.grainline = Grainline{
                {evalExpr(def.grainFromX, penv), evalExpr(def.grainFromY, penv)},
                {evalExpr(def.grainToX, penv), evalExpr(def.grainToY, penv)}};
            pattern.pieces.push_back(std::move(piece));
        }

        // ---- kernel post services, verbatim policy (RECETE-SPEC §3 step 6).
        // fabric estimate + guide: enum args from the sealed kernel block; the
        // continuous length rides the param DECLARED as draft.skirtLengthMM in
        // the document (no hidden mapping). The SkirtLength enum argument is
        // dead when the override is > 0 (resolvedLength, skirt.cpp:12-16).
        const double lengthMM = env.at(doc.lengthParam);
        pattern.fabricAdviceKey = "skirt";
        pattern.fabricMeters140 = SkirtBlock::fabricEstimate(
            m, doc.skirtStyle, SkirtLength::Mini, doc.shaping, doc.fabric,
            /*lengthExtraMM=*/0, /*lengthOverrideMM=*/lengthMM);
        // guide shaping derives from what was DRAFTED (gore split present or
        // not), mirroring SkirtBlock::draft (skirt.cpp:643-653).
        bool goreSplit = false;
        for (const auto& piece : pattern.pieces)
            if (piece.name.find("Center ") != std::string::npos) goreSplit = true;
        pattern.guideSteps = SkirtBlock::guide(
            doc.skirtStyle, goreSplit ? Shaping::Princess : Shaping::Dart, doc.fabric);
        if (doc.shaping == Shaping::Princess && !goreSplit) {
            pattern.guideSteps.insert(pattern.guideSteps.begin() + 1,
                "Princess gore seams were requested, but this body has no waist-to-hip shaping to split over — the skirt is drafted as clean single panels instead (nothing was skipped that the fit needs).");
        }
        // technical annotations (garment.cpp annotateTechnical) are a no-op on
        // a standalone skirt whose pieces already carry grainlines: the notch
        // rules key on "Skirt"-prefixed dress piece names and the closure rule
        // on a dress zipper — neither applies here. Nothing to add.
        // cutting lines: the motor's final pass verbatim (garment.cpp:1040-1046).
        for (auto& piece : pattern.pieces) {
            if (piece.name.find("Ruffle") != std::string::npos ||
                piece.name.find("Bias binding") != std::string::npos) continue;
            const bool onFold = piece.cutInstruction.find("on fold") != std::string::npos;
            piece.cutLine = offsetOutline(piece.commands, piece.seamAllowance, onFold);
        }
        return R::Ok(std::move(pattern));
    } catch (const RecipeError& e) {
        return R::Err(e.msg);
    }
}

} // namespace recipe
} // namespace stitchu
