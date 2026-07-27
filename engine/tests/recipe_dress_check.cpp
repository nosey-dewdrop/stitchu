// recipe_dress_check: machine judge for the v1.1 top kernel + the damar-içi
// shift-dress recipe (docs/RECETE-SPEC.md §6, Vol2 #8).
//   1. K0 const parity latch: every recipe const == its motor counterpart
//      (bodice.hpp headers; trig consts == std::sin/std::cos as DOUBLES).
//   2. MOTOR CROSS-PARITY at extendMM = belowWaist(Tunic): the recipe path
//      (independent interpreter) reproduces GarmentDrafter::draft for the
//      same sealed spec — pieces, commands (<= 1e-6 mm), markings, notches,
//      cut lines, guide text, fabric. The live second-path proof next to the
//      pinned-golden byte gate (recipe_dress_golden_check).
//   3. (a) same recipe + two bodies -> two different correct patterns; widths
//      follow the body; validator clean (incl. wearability + guide audit).
//   4. (c) seam equalization MEASURED on the recipe output across 3 bodies x
//      3 extensions + the drawn-neck-vs-declared-enum coupling + param range
//      enforcement.
//   5. Err paths (RULES invariant 1): every v1.1 seal violation refuses.
//   usage: recipe_dress_check <recipes/shift-dress-square-spaghetti.json>
#include <cmath>
#include <cstdio>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>

#include "../src/bodice.hpp"
#include "../src/constants.gen.hpp"
#include "../src/garment.hpp"
#include "../src/recipe.hpp"
#include "../src/strap.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

// pinned golden bodies (golden_dump.cpp:16-19).
static const BodyMeasurementsSnapshot kEU38{88, 70, 94, 37, 40.5, 58, 35};
static const BodyMeasurementsSnapshot kPear{96, 70, 116, 37, 41, 58, 36};
static const BodyMeasurementsSnapshot kBigNeck{100, 84, 104, 30, 40, 58, 50};

static const PatternPiece* findPiece(const DraftedPattern& p, const std::string& name) {
    for (const auto& piece : p.pieces)
        if (piece.name == name) return &piece;
    return nullptr;
}

// the canonical-order side seam walk (validator.cpp topSideSeamLength):
// underarm -> hem side, measured along the drawn side-to-hem cubic.
static double sideSeamArc(const PatternPiece& piece) {
    size_t hemEnd = piece.commands.size() - 1;
    while (hemEnd > 0 && (piece.commands[hemEnd].type == CmdType::Close ||
                          piece.commands[hemEnd].type == CmdType::Line)) --hemEnd;
    return pathLength({PathCommand::move(piece.commands[hemEnd - 2].to), piece.commands[hemEnd - 1]});
}

static std::string slurp(const std::string& path) {
    std::ifstream in(path);
    std::ostringstream buf;
    buf << in.rdbuf();
    return buf.str();
}
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

static bool cmdsClose(const std::vector<PathCommand>& a, const std::vector<PathCommand>& b,
                      double tol) {
    if (a.size() != b.size()) return false;
    for (size_t i = 0; i < a.size(); ++i) {
        if (a[i].type != b[i].type) return false;
        if (std::fabs(a[i].to.x - b[i].to.x) > tol || std::fabs(a[i].to.y - b[i].to.y) > tol) return false;
        if (a[i].type == CmdType::Curve &&
            (std::fabs(a[i].cp1.x - b[i].cp1.x) > tol || std::fabs(a[i].cp1.y - b[i].cp1.y) > tol ||
             std::fabs(a[i].cp2.x - b[i].cp2.x) > tol || std::fabs(a[i].cp2.y - b[i].cp2.y) > tol))
            return false;
    }
    return true;
}

int main(int argc, char** argv) {
    if (argc < 2) {
        std::fprintf(stderr, "usage: recipe_dress_check <recipe.json>\n");
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
    check(spec.garment == GarmentType::Top && spec.neckline == Neckline::Square &&
          spec.topLength == TopLength::Tunic && spec.shaping == Shaping::Dart &&
          spec.fabric == Fabric::Woven &&
          spec.ruffledStraps == static_cast<int>(StrapStyle::Spaghetti) &&
          spec.sleeveStyle == SleeveStyle::None,
          "sealed kernel block resolves to top/square/tunic/spaghetti/dart/woven, sleeveless");

    std::printf("== K0 const parity latch (recipe consts vs motor sources) ==\n");
    {
        const auto& consts = recipe::recipeConsts(rcp);
        auto latch = [&](const char* name, double motorValue) {
            const auto it = consts.find(name);
            const bool ok = it != consts.end() && it->second == motorValue;
            char line[200];
            std::snprintf(line, sizeof(line), "const %s == motor %.17g (recipe %.17g)",
                          name, motorValue, it != consts.end() ? it->second : NAN);
            check(ok, line);
        };
        latch("chestEase", BodiceBlock::chestEase);
        latch("waistEase", BodiceBlock::waistEase);
        latch("underbustOffset", BodiceBlock::underbustOffset);
        latch("frontNeckWidthFactor", BodiceBlock::frontNeckWidthFactor);
        latch("backNeckWidthFactor", BodiceBlock::backNeckWidthFactor);
        latch("backNeckCutoutFactor", BodiceBlock::backNeckCutoutFactor);
        latch("maxNeckShoulderShare", BodiceBlock::maxNeckShoulderShare);
        // trig: DOUBLE equality against the exact runtime libm values the
        // motor computes (bodice.cpp:578-579) — not a decimal approximation.
        latch("sinShoulderSlope", std::sin(BodiceBlock::shoulderSlopeDeg * M_PI / 180.0));
        latch("cosShoulderSlope", std::cos(BodiceBlock::shoulderSlopeDeg * M_PI / 180.0));
        latch("shoulderSeamTargetMM", BodiceBlock::shoulderSeamTargetMM);
        latch("armholeDepthFactor", BodiceBlock::armholeDepthFactor);
        latch("bicepsRatioForArmscye", BodiceBlock::bicepsRatioForArmscye);
        latch("armscyeArmFactor", BodiceBlock::armscyeArmFactor);
        latch("armscyeMaxDepthShare", BodiceBlock::armscyeMaxDepthShare);
        latch("backWaistShare", BodiceBlock::backWaistShare);
        latch("centerBackReduction", BodiceBlock::centerBackReduction);
        latch("frontBalanceDrop", BodiceBlock::frontBalanceDrop);
        latch("cutInMM", BodiceBlock::sleevelessShoulderCutInMM);
        latch("underarmRaiseMM", BodiceBlock::sleevelessUnderarmRaiseMM);
        latch("hollowShareFront", BodiceBlock::armholeHollowShareFront);
        latch("hollowShareBack", BodiceBlock::armholeHollowShareBack);
        latch("tangentShare", BodiceBlock::armholeShoulderTangentShare);
        latch("lowerDropShare", BodiceBlock::armholeLowerDropShare);
        // function-local motor constants with no header symbol — the literal
        // is the source; their real judge is the cross-parity block below.
        latch("neckWidthMult", 1.0);   // neckWidthMultiplier(Square), bodice.cpp:19-26
        latch("extSideTakeCap", 15.0); // extended-top side take, bodice.cpp:706
        latch("squareNeckDrop", 40.0); // frontNeckDepth(Square) offset, bodice.cpp:33
        latch("hipExtendEase", 1.04);  // hip half-quarter ease, garment.cpp:448
    }

    std::printf("== motor cross-parity at extendMM = belowWaist(tunic) ==\n");
    {
        const double pinExtend = belowWaist(TopLength::Tunic);
        const std::vector<std::pair<const char*, const BodyMeasurementsSnapshot*>> bodies = {
            {"EU38", &kEU38}, {"pear", &kPear}, {"bigNeckSmallShoulder", &kBigNeck}};
        for (const auto& [bodyName, body] : bodies) {
            const DraftedPattern motor = GarmentDrafter::draft(spec, *body);
            const auto rec = recipe::draftRecipe(rcp, *body, {{"extendMM", pinExtend}});
            char line[240];
            if (!rec.ok) {
                check(false, std::string(bodyName) + " recipe draft failed: " + rec.error);
                continue;
            }
            const DraftedPattern& r = rec.value;
            std::snprintf(line, sizeof(line), "%s garment '%s' == motor '%s'",
                          bodyName, r.garment.c_str(), motor.garment.c_str());
            check(r.garment == motor.garment, line);
            std::snprintf(line, sizeof(line), "%s piece count %zu == motor %zu",
                          bodyName, r.pieces.size(), motor.pieces.size());
            check(r.pieces.size() == motor.pieces.size(), line);
            for (size_t i = 0; i < std::min(r.pieces.size(), motor.pieces.size()); ++i) {
                const auto& a = r.pieces[i];
                const auto& b = motor.pieces[i];
                const bool meta = a.name == b.name && a.cutInstruction == b.cutInstruction &&
                                  a.seamAllowance == b.seamAllowance;
                const bool grain = a.hasGrainline == b.hasGrainline &&
                    std::fabs(a.grainline.from.x - b.grainline.from.x) <= 1e-6 &&
                    std::fabs(a.grainline.from.y - b.grainline.from.y) <= 1e-6 &&
                    std::fabs(a.grainline.to.x - b.grainline.to.x) <= 1e-6 &&
                    std::fabs(a.grainline.to.y - b.grainline.to.y) <= 1e-6;
                const bool geom = cmdsClose(a.commands, b.commands, 1e-6) &&
                                  cmdsClose(a.markings, b.markings, 1e-6) &&
                                  cmdsClose(a.notches, b.notches, 1e-6) &&
                                  cmdsClose(a.cutLine, b.cutLine, 1e-6);
                std::snprintf(line, sizeof(line),
                              "%s piece '%s': meta %s, grainline %s, geometry (outline+markings+notches+cutline) %s <= 1e-6 mm",
                              bodyName, a.name.c_str(), meta ? "ok" : "DIFFERS",
                              grain ? "ok" : "DIFFERS", geom ? "ok" : "DIFFERS");
                check(meta && grain && geom, line);
                check(a.seamAllowance == constants::kSeamAllowanceMM ||
                          a.name.find("Bias binding") != std::string::npos ||
                          a.name.find("Strap") != std::string::npos,
                      std::string(bodyName) + " " + a.name + " seam allowance latched to constants.gen");
            }
            std::snprintf(line, sizeof(line), "%s fabric %.4f == motor %.4f", bodyName,
                          r.fabricMeters140, motor.fabricMeters140);
            check(std::fabs(r.fabricMeters140 - motor.fabricMeters140) <= 1e-9, line);
            const bool guideEqual = r.guideSteps == motor.guideSteps;
            std::snprintf(line, sizeof(line), "%s guide steps identical (%zu vs %zu)",
                          bodyName, r.guideSteps.size(), motor.guideSteps.size());
            check(guideEqual, line);
        }
    }

    std::printf("== (a) same recipe + two bodies -> two different correct patterns ==\n");
    {
        const auto a = recipe::draftRecipe(rcp, kEU38, {{"extendMM", 420}});
        const auto b = recipe::draftRecipe(rcp, kBigNeck, {{"extendMM", 420}});
        check(a.ok, std::string("EU38 drafts: ") + (a.ok ? "ok" : a.error));
        check(b.ok, std::string("bigNeckSmallShoulder drafts: ") + (b.ok ? "ok" : b.error));
        if (!a.ok || !b.ok) return 1;
        check(a.value.pieces.size() == 4 && b.value.pieces.size() == 4,
              "both patterns carry Top Front/Top Back + bias binding + spaghetti strap (4 pieces)");
        const PatternPiece* fa = findPiece(a.value, "Top Front");
        const PatternPiece* fb = findPiece(b.value, "Top Front");
        if (!fa || !fb) { check(false, "Top Front missing"); return 1; }
        char line[240];
        // widths follow the body: the underarm x IS the drafted front chest
        // quarter (bust/4 * (1+ease)); the bigger bust is wider.
        const double underarmA = fa->commands[4].to.x;
        const double underarmB = fb->commands[4].to.x;
        std::snprintf(line, sizeof(line),
                      "front chest quarter follows the body: EU38 %.1f vs bigNeck %.1f (motor formula %.1f / %.1f)",
                      underarmA, underarmB,
                      kEU38.bustMM() / 4 * (1 + BodiceBlock::chestEase),
                      kBigNeck.bustMM() / 4 * (1 + BodiceBlock::chestEase));
        check(underarmB > underarmA &&
                  std::fabs(underarmA - kEU38.bustMM() / 4 * (1 + BodiceBlock::chestEase)) <= 1e-6 &&
                  std::fabs(underarmB - kBigNeck.bustMM() / 4 * (1 + BodiceBlock::chestEase)) <= 1e-6,
              line);
        // regeneration reaches the hem: front piece height = frontLength + extendMM.
        for (const auto& [name, body, draft] :
             std::vector<std::tuple<const char*, const BodyMeasurementsSnapshot*, const DraftedPattern*>>{
                 {"EU38", &kEU38, &a.value}, {"bigNeckSmallShoulder", &kBigNeck, &b.value}}) {
            const PatternPiece* front = findPiece(*draft, "Top Front");
            const double height = boundingBox(front->commands).height;
            const double expected = body->backLengthMM() + BodiceBlock::frontBalanceDrop + 420;
            std::snprintf(line, sizeof(line), "%s front height %.1f == backLength + balance + extendMM %.1f",
                          name, height, expected);
            check(std::fabs(height - expected) <= 0.5, line);
        }
    }

    std::printf("== (c) seam equalization + validator on the recipe output ==\n");
    {
        char line[240];
        const std::vector<std::pair<const char*, const BodyMeasurementsSnapshot*>> bodies = {
            {"EU38", &kEU38}, {"pear", &kPear}, {"bigNeckSmallShoulder", &kBigNeck}};
        for (const double extendMM : {300.0, 380.0, 460.0}) {
            for (const auto& [bodyName, body] : bodies) {
                const auto drafted = recipe::draftRecipe(rcp, *body, {{"extendMM", extendMM}});
                if (!drafted.ok) {
                    check(false, std::string(bodyName) + " draft failed: " + drafted.error);
                    continue;
                }
                const DraftedPattern& p = drafted.value;
                const PatternPiece* front = findPiece(p, "Top Front");
                const PatternPiece* back = findPiece(p, "Top Back");
                // front/back side seams sew together: measured arc, not formula trust.
                const double sf = sideSeamArc(*front);
                const double sb = sideSeamArc(*back);
                std::snprintf(line, sizeof(line), "%s @%.0fmm side seams front %.2f vs back %.2f (|d| <= %.1f)",
                              bodyName, extendMM, sf, sb, PatternValidator::pairedSeamTolerance);
                check(std::fabs(sf - sb) <= PatternValidator::pairedSeamTolerance, line);
                // the DRAWN neck edge must be the edge the declared kernel
                // neckline promises — the bias binding is trued against
                // neckEdgeLength(m, neckline), so a drawn/declared drift would
                // produce a binding that does not fit the garment.
                const double drawnFrontHalf = pathLength(
                    {front->commands[0], front->commands[1], front->commands[2]});
                const double drawnBackHalf = pathLength({back->commands[0], back->commands[1]});
                const double declared = BodiceBlock::neckEdgeLength(*body, spec.neckline);
                std::snprintf(line, sizeof(line),
                              "%s @%.0fmm drawn neck edge %.1f vs declared-enum edge %.1f (|d| <= 0.5)",
                              bodyName, extendMM, 2 * (drawnFrontHalf + drawnBackHalf), declared);
                check(std::fabs(2 * (drawnFrontHalf + drawnBackHalf) - declared) <= 0.5, line);
                // full validator (topIssues + facing/binding + wearability +
                // guide audit) clean, spec from the sealed kernel block.
                const auto issues = PatternValidator::issues(spec, *body, p);
                std::snprintf(line, sizeof(line), "%s @%.0fmm validator clean (%zu issues)",
                              bodyName, extendMM, issues.size());
                check(issues.empty(), line);
                for (const auto& issue : issues) std::printf("    validator: %s\n", issue.description().c_str());
                bool cutLines = true;
                for (const auto& piece : p.pieces)
                    if (piece.name.find("Bias binding") == std::string::npos)
                        cutLines = cutLines && !piece.cutLine.empty();
                std::snprintf(line, sizeof(line), "%s @%.0fmm every real piece carries a cut line", bodyName, extendMM);
                check(cutLines, line);
            }
        }
        // param range is ENFORCED by the interpreter (RECETE-SPEC §2.2).
        check(!recipe::draftRecipe(rcp, kEU38, {{"extendMM", 250}}).ok, "extendMM 250 below min -> Err");
        check(!recipe::draftRecipe(rcp, kEU38, {{"extendMM", 500}}).ok, "extendMM 500 above max -> Err");
        check(recipe::draftRecipe(rcp, kEU38, {{"extendMM", 300}}).ok, "extendMM 300 (min) -> ok");
        check(recipe::draftRecipe(rcp, kEU38, {{"extendMM", 480}}).ok, "extendMM 480 (max) -> ok");
        check(!recipe::draftRecipe(rcp, kEU38, {}).ok, "missing extendMM -> Err");
        check(!recipe::draftRecipe(rcp, kEU38, {{"extendMM", 380}, {"knob", 1}}).ok,
              "undeclared param key -> Err");
    }

    std::printf("== Err paths (RULES invariant 1 + the v1.1 seal) ==\n");
    {
        auto expectParseErr = [&](const std::string& doc, const std::string& what) {
            const auto r = recipe::parseRecipe(doc);
            check(!r.ok, what + (r.ok ? " (WRONGLY accepted)" : " -> " + r.error.substr(0, 90)));
        };
        expectParseErr(replaceOnce(recipeText, "\"neckline\": \"square\"", "\"neckline\": \"vNeck\""),
                       "neckline outside the v1.1 seal");
        expectParseErr(replaceOnce(recipeText, "\"topLength\": \"tunic\"", "\"topLength\": \"hip\""),
                       "topLength outside the v1.1 seal");
        expectParseErr(replaceOnce(recipeText, "\"straps\": \"spaghetti\"", "\"straps\": \"wide\""),
                       "straps outside the v1.1 seal");
        expectParseErr(replaceOnce(recipeText, "\"fabric\": \"woven\"", "\"fabric\": \"knit\""),
                       "knit on the top kernel");
        expectParseErr(replaceOnce(recipeText, "\"shaping\": \"dart\"", "\"shaping\": \"princess\""),
                       "princess on the top kernel");
        expectParseErr(replaceOnce(recipeText, "\"garment\": \"top\"", "\"garment\": \"dress\""),
                       "dress kernel (not built yet)");
        expectParseErr(replaceOnce(recipeText, "\"garment\": \"top\"",
                                   "\"garment\": \"top\", \"skirtStyle\": \"aLine\""),
                       "skirt key inside the top kernel block");
        expectParseErr(replaceOnce(recipeText, "\"name\": \"Top Front\"", "\"name\": \"Front\""),
                       "non-canonical top piece name");
        expectParseErr(replaceOnce(recipeText, "\"extendMM\": { \"min\": 300, \"max\": 480 }",
                                   "\"extendMM\": { \"min\": 300, \"max\": 480, \"table\": \"draft.skirtLengthMM\" }"),
                       "K1 table binding on a top param");
        expectParseErr(replaceOnce(recipeText, "hypot(dx, dy)", "hypot(dx)"),
                       "hypot arity");
        // upper bust given -> honest refusal (the recipe is sealed to the
        // 7-measurement fallback frame; silence would mis-fit the bust).
        BodyMeasurementsSnapshot withUpperBust = kEU38;
        withUpperBust.upperBustCM = 80;
        const auto ub = recipe::draftRecipe(rcp, withUpperBust, {{"extendMM", 380}});
        check(!ub.ok, std::string("upperBust > 0 -> Err") +
                          (ub.ok ? " (WRONGLY accepted)" : ": " + ub.error.substr(0, 90)));
        // missing measurement = numeric (snapshot defaults to 0) -> Err.
        BodyMeasurementsSnapshot noShoulder = kEU38;
        noShoulder.shoulderCM = 0;
        const auto ns = recipe::draftRecipe(rcp, noShoulder, {{"extendMM", 380}});
        check(!ns.ok, std::string("shoulder 0 -> Err") +
                          (ns.ok ? " (WRONGLY accepted)" : ": " + ns.error.substr(0, 90)));
    }

    std::printf("%s\n", failures == 0 ? "recipe_dress_check: ALL PASS" : "recipe_dress_check: FAILURES");
    return failures == 0 ? 0 : 1;
}
