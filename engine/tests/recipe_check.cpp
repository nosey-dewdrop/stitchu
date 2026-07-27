// recipe_check: Gate 1 machine judge for the recipe path (docs/RECETE-SPEC.md §5).
//   (a) same recipe + two PINNED golden bodies -> two DIFFERENT correct
//       patterns, difference in the right direction: hip quarter / waistline
//       width / dart topology (EU38 = 2 darts vs bigNeckSmallShoulder = 1)
//       follow the body; sewn waist per quarter lands on waistQuarter;
//       validator clean on both.
//   (c) seam equalization on the RECIPE output (measured, never trusted from
//       formula similarity): front vs back side-seam arc, 4-quarter sewn waist
//       vs eased full waist, the validator's MEASURING waistband check, the
//       lengthMM clamp/range enforcement, full PatternValidator::issues clean
//       on 3 bodies x 3 lengths.
//   plus: Err-path enforcement (RULES invariant 1 — unknown key/name, kernel
//       drift, shadowing, forward reference, missing measurement, param out of
//       range are all Err, never a silent default) and the K0 const parity
//       latch (RECETE-SPEC §2.3: recipe consts == motor header values).
//   usage: recipe_check <recipes/skirt-aline-dart.json>
#include <cmath>
#include <cstdio>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>

#include "../src/constants.gen.hpp"
#include "../src/recipe.hpp"
#include "../src/skirt.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

// pinned golden bodies (golden_dump.cpp:37-41).
static const BodyMeasurementsSnapshot kEU38{88, 70, 94, 37, 40.5, 58, 35};
static const BodyMeasurementsSnapshot kPear{96, 70, 116, 37, 41, 58, 36};
static const BodyMeasurementsSnapshot kBigNeck{100, 84, 104, 30, 40, 58, 50};

static const PatternPiece* findPiece(const DraftedPattern& p, const std::string& name) {
    for (const auto& piece : p.pieces)
        if (piece.name == name) return &piece;
    return nullptr;
}

// waist arc of a quarter piece, measured along the drafted curve (the
// validator's own measuring convention: bel = commands[1], validator.cpp:389-400).
static double waistArc(const PatternPiece& piece) {
    return pathLength({PathCommand::move(piece.commands[0].to), piece.commands[1]});
}
// side seam = commands[1].to -> curve[2] -> line[3] (validator.cpp:412-418).
static double sideSeamArc(const PatternPiece& piece) {
    return pathLength({PathCommand::move(piece.commands[1].to), piece.commands[2], piece.commands[3]});
}
// dart intake = sum of near-horizontal 3-command marking triples' widths.
static double dartIntake(const PatternPiece& piece) {
    double intake = 0;
    for (size_t i = 0; i + 2 < piece.markings.size(); i += 3)
        intake += std::fabs(piece.markings[i + 2].to.x - piece.markings[i].to.x);
    return intake;
}

static std::string slurp(const std::string& path) {
    std::ifstream in(path);
    std::ostringstream buf;
    buf << in.rdbuf();
    return buf.str();
}
// targeted single-occurrence surgery on the real document (Err-path probes).
static std::string replaceOnce(const std::string& text, const std::string& needle,
                               const std::string& replacement) {
    const size_t pos = text.find(needle);
    if (pos == std::string::npos) {
        std::printf("  [FAIL] err-probe needle not found in recipe: %s\n", needle.c_str());
        failures++;
        return text;
    }
    std::string out = text;
    out.replace(pos, needle.size(), replacement);
    return out;
}

int main(int argc, char** argv) {
    if (argc < 2) {
        std::fprintf(stderr, "usage: recipe_check <recipe.json>\n");
        return 2;
    }
    const std::string recipePath = argv[1];
    const std::string recipeText = slurp(recipePath);

    std::printf("== parse ==\n");
    const auto loaded = recipe::parseRecipe(recipeText);
    check(loaded.ok, "recipe parses: " + (loaded.ok ? recipe::recipeId(loaded.value) : loaded.error));
    if (!loaded.ok) return 1;
    const recipe::Recipe& rcp = loaded.value;
    const GarmentSpec spec = recipe::kernelSpec(rcp);
    check(spec.garment == GarmentType::Skirt && spec.skirtStyle == SkirtStyle::ALine &&
          spec.shaping == Shaping::Dart && spec.fabric == Fabric::Woven,
          "sealed kernel block resolves to skirt/aLine/dart/woven");

    std::printf("== K0 const parity latch (recipe consts vs motor headers) ==\n");
    {
        const auto& consts = recipe::recipeConsts(rcp);
        auto latch = [&](const char* name, double motorValue) {
            const auto it = consts.find(name);
            const bool ok = it != consts.end() && it->second == motorValue;
            char line[160];
            std::snprintf(line, sizeof(line), "const %s == motor %.4f (recipe %.4f)",
                          name, motorValue, it != consts.end() ? it->second : NAN);
            check(ok, line);
        };
        latch("waistEase", SkirtBlock::waistEase);
        latch("hipEase", SkirtBlock::hipEase);
        latch("hipDepthMM", SkirtBlock::hipDepth);
        latch("maxSideTake", SkirtBlock::maxSideTake);
        latch("minDartWidth", SkirtBlock::minDartWidth);
        latch("maxSingleDart", SkirtBlock::maxSingleDart);
        // sideWaistRise/flareOut/hemSideRise are function-local constants in
        // skirt.cpp (no header symbol to latch onto); their parity judge is
        // recipe_golden_check's byte comparison against the repo pin.
    }

    std::printf("== (a) same recipe + two bodies -> two different correct patterns ==\n");
    {
        const auto a = recipe::draftRecipe(rcp, kEU38, {{"lengthMM", 450}});
        const auto b = recipe::draftRecipe(rcp, kBigNeck, {{"lengthMM", 450}});
        check(a.ok, "EU38 drafts: " + (a.ok ? "ok" : a.error));
        check(b.ok, "bigNeckSmallShoulder drafts: " + (b.ok ? "ok" : b.error));
        if (!a.ok || !b.ok) return 1;
        const PatternPiece* fa = findPiece(a.value, "Front");
        const PatternPiece* fb = findPiece(b.value, "Front");
        check(fa && fb && a.value.pieces.size() == 3 && b.value.pieces.size() == 3,
              "both patterns carry Front/Back/Waistband");
        if (!fa || !fb) return 1;

        // dart topology follows the body: EU38 intake 36.2 > maxSingleDart ->
        // TWO darts (6 marking commands); bigNeck intake 26.0 -> ONE (3).
        char line[200];
        std::snprintf(line, sizeof(line),
                      "dart topology flips with the body: EU38 %zu marking cmds (2 darts), bigNeck %zu (1 dart)",
                      fa->markings.size(), fb->markings.size());
        check(fa->markings.size() == 6 && fb->markings.size() == 3, line);

        // direction: bigger waist/hip body -> wider waistline + deeper hip quarter.
        const double waistlineA = fa->commands[1].to.x;
        const double waistlineB = fb->commands[1].to.x;
        const double hipQA = fa->commands[2].to.x;
        const double hipQB = fb->commands[2].to.x;
        std::snprintf(line, sizeof(line),
                      "widths follow the body: waistline %.1f vs %.1f, hip quarter %.1f vs %.1f (bigNeck larger)",
                      waistlineA, waistlineB, hipQA, hipQB);
        check(waistlineB > waistlineA && hipQB > hipQA, line);

        // sewn waist per quarter (arc minus dart intake) lands on waistQuarter.
        struct Case { const char* bodyName; const BodyMeasurementsSnapshot* body; const DraftedPattern* draft; };
        const Case cases[] = {{"EU38", &kEU38, &a.value}, {"bigNeckSmallShoulder", &kBigNeck, &b.value}};
        for (const Case& kase : cases) {
            const char* bodyName = kase.bodyName;
            const BodyMeasurementsSnapshot* body = kase.body;
            const DraftedPattern* draft = kase.draft;
            const double waistQuarter = body->waistMM() * (1 + SkirtBlock::waistEase) / 4;
            for (const char* name : {"Front", "Back"}) {
                const PatternPiece* piece = findPiece(*draft, name);
                const double sewn = waistArc(*piece) - dartIntake(*piece);
                std::snprintf(line, sizeof(line),
                              "%s %s sewn waist %.2f vs waist quarter %.2f (|d| %.2f <= %.1f)",
                              bodyName, name, sewn, waistQuarter, std::fabs(sewn - waistQuarter),
                              PatternValidator::pairedSeamTolerance);
                check(std::fabs(sewn - waistQuarter) <= PatternValidator::pairedSeamTolerance, line);
            }
            const auto issues = PatternValidator::issues(spec, *body, *draft);
            std::snprintf(line, sizeof(line), "%s validator clean (%zu issues)", bodyName, issues.size());
            check(issues.empty(), line);
            for (const auto& issue : issues) std::printf("    validator: %s\n", issue.description().c_str());
        }
    }

    std::printf("== (c) seam equalization on the recipe output ==\n");
    {
        char line[220];
        const std::vector<std::pair<const char*, const BodyMeasurementsSnapshot*>> bodies = {
            {"EU38", &kEU38}, {"pear", &kPear}, {"bigNeckSmallShoulder", &kBigNeck}};
        for (const double lengthMM : {450.0, 650.0, 900.0}) {
            for (const auto& [bodyName, body] : bodies) {
                const auto drafted = recipe::draftRecipe(rcp, *body, {{"lengthMM", lengthMM}});
                if (!drafted.ok) {
                    check(false, std::string(bodyName) + " draft failed: " + drafted.error);
                    continue;
                }
                const DraftedPattern& p = drafted.value;
                const PatternPiece* front = findPiece(p, "Front");
                const PatternPiece* back = findPiece(p, "Back");
                // front/back side seams sew together: measured arc, not formula trust.
                const double sf = sideSeamArc(*front);
                const double sb = sideSeamArc(*back);
                std::snprintf(line, sizeof(line), "%s @%.0fmm side seams front %.2f vs back %.2f (|d| <= %.1f)",
                              bodyName, lengthMM, sf, sb, PatternValidator::pairedSeamTolerance);
                check(std::fabs(sf - sb) <= PatternValidator::pairedSeamTolerance, line);
                // four sewn quarters close the eased waist.
                const double sewnWaist =
                    (waistArc(*front) - dartIntake(*front)) * 2 + (waistArc(*back) - dartIntake(*back)) * 2;
                const double target = body->waistMM() * (1 + SkirtBlock::waistEase);
                std::snprintf(line, sizeof(line), "%s @%.0fmm sewn waist %.1f vs eased waist %.1f (|d| <= %.1f)",
                              bodyName, lengthMM, sewnWaist, target, PatternValidator::waistJoinTolerance);
                check(std::fabs(sewnWaist - target) <= PatternValidator::waistJoinTolerance, line);
                // waistband judge is the validator's MEASURING check
                // (bandTotal = bbox*2 - 60 vs sewnWaist, validator.cpp:496-503),
                // exercised via the full validator run — no tautology against
                // the band's own defining formula.
                const auto issues = PatternValidator::issues(spec, *body, p);
                std::snprintf(line, sizeof(line), "%s @%.0fmm validator clean incl. waistband (%zu issues)",
                              bodyName, lengthMM, issues.size());
                check(issues.empty(), line);
                for (const auto& issue : issues) std::printf("    validator: %s\n", issue.description().c_str());
                // cut lines exist (printable pre-condition, RULES invariant 5).
                bool cutLines = true;
                for (const auto& piece : p.pieces) cutLines = cutLines && !piece.cutLine.empty();
                std::snprintf(line, sizeof(line), "%s @%.0fmm every piece carries a cut line", bodyName, lengthMM);
                check(cutLines, line);
            }
        }
        // param range is ENFORCED by the interpreter (RECETE-SPEC §2.2).
        check(!recipe::draftRecipe(rcp, kEU38, {{"lengthMM", 200}}).ok, "lengthMM 200 below min -> Err");
        check(!recipe::draftRecipe(rcp, kEU38, {{"lengthMM", 1300}}).ok, "lengthMM 1300 above max -> Err");
        check(recipe::draftRecipe(rcp, kEU38, {{"lengthMM", 250}}).ok, "lengthMM 250 (min) -> ok");
        check(recipe::draftRecipe(rcp, kEU38, {{"lengthMM", 1200}}).ok, "lengthMM 1200 (max) -> ok");
        check(!recipe::draftRecipe(rcp, kEU38, {}).ok, "missing lengthMM -> Err");
        check(!recipe::draftRecipe(rcp, kEU38, {{"lengthMM", 450}, {"knob", 1}}).ok,
              "undeclared param key -> Err");
    }

    std::printf("== Err paths (RULES invariant 1: no silent default, no coercion) ==\n");
    {
        auto expectParseErr = [&](const std::string& doc, const std::string& what) {
            const auto r = recipe::parseRecipe(doc);
            check(!r.ok, what + (r.ok ? " (WRONGLY accepted)" : " -> " + r.error.substr(0, 90)));
        };
        expectParseErr(R"({"recipeVersion": 2})", "unknown recipeVersion");
        expectParseErr(R"({"recipeVersion": 1, "sihirliAnahtar": 1})", "unknown root key");
        expectParseErr(replaceOnce(recipeText, "\"shaping\": \"dart\"", "\"shaping\": \"dartz\""),
                       "unknown kernel enum value");
        expectParseErr(replaceOnce(recipeText, "\"garment\": \"skirt\"", "\"garment\": \"skirt\", \"extra\": \"x\""),
                       "extra key inside the sealed kernel block");
        expectParseErr(replaceOnce(recipeText, "\"waistEase\": 0.02", "\"waistEase\": 0.02, \"waistMM\": 1"),
                       "const shadowing a measurement name");
        expectParseErr(replaceOnce(recipeText, "\"f\": \"waistMM * (1 + waistEase)\"", "\"f\": \"waistQuarter\""),
                       "forward reference between scalars");
        expectParseErr(replaceOnce(recipeText, "\"f\": \"fullWaist / 4\"", "\"f\": \"fullWaistX / 4\""),
                       "unknown identifier in a formula");
        expectParseErr(replaceOnce(recipeText, "\"op\": \"close\"", "\"op\": \"arc\""),
                       "unknown outline op");
        // measurement <= 0 = Err at draft (fields default to 0 in the snapshot).
        BodyMeasurementsSnapshot noWaist = kEU38;
        noWaist.waistCM = 0;
        const auto r = recipe::draftRecipe(rcp, noWaist, {{"lengthMM", 450}});
        check(!r.ok, std::string("waist 0 -> Err") + (r.ok ? " (WRONGLY accepted)" : ": " + r.error.substr(0, 90)));
    }

    std::printf("%s\n", failures == 0 ? "recipe_check: ALL PASS" : "recipe_check: FAILURES");
    return failures == 0 ? 0 : 1;
}
