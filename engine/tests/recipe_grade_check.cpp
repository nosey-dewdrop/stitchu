// recipe_grade_check: GRADING the parametric recipe across the standard EU size
// run (PIPELINE Aşama 5 grading, recipe-path proof — complements the motor-path
// grade_check.cpp). A pattern seller grades ONE design (one recipe document)
// into a whole size series; the CAD promise is that the SAME recipe, re-evaluated
// against each standard body in euSizeChart(), yields a full graded set where
// every size is (1) validator-clean (no size may be unsewable) and (2) its
// front/back side seams sew together (seam-match measured, never trusted from
// formula). It must also (3) GROW monotonically size to size — a graded run that
// repeats one pattern relabeled would silently ship wrong sizes — and (4) keep
// its dart topology constant across the whole series: RECETE-SPEC §2.1 warns a
// `when`-branch (dart 1↔2) flipping mid-series breaks point matching, so the run
// is refused-or-honest, never silently mis-graded. This is the engine-side proof
// that the recipe is a real graded CAD document, not a single-size draft.
//
// Byte pins already fix the shape at the pinned bodies (recipe_golden_check,
// recipe_dress_golden_check); this test fixes the WHOLE RUN's grade behaviour.
//   usage: recipe_grade_check <skirt-aline-dart.json> <shift-dress-square-spaghetti.json>
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/recipe.hpp"
#include "../src/sizechart.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static const PatternPiece* findPiece(const DraftedPattern& p, const std::string& name) {
    for (const auto& piece : p.pieces)
        if (piece.name == name) return &piece;
    return nullptr;
}

// Total graded width: the summed bbox width of the SHAPED body panels. Strip /
// notion pieces (bias binding, straps, ties, cords, waistband) are cut-to-length
// and drawn at a capped/fold-halved width — their drawn width is NOT a grade
// dimension — so they are excluded from the monotonic-growth measure (same
// convention as motor-path grade_check.cpp:29-39).
static double gradedWidth(const DraftedPattern& d) {
    double w = 0.0;
    for (const auto& piece : d.pieces) {
        if (piece.name.find("Bias binding") != std::string::npos ||
            piece.name.find("Binding") != std::string::npos ||
            piece.name.find("Strap") != std::string::npos ||
            piece.name.find("Tie") != std::string::npos ||
            piece.name.find("Cord") != std::string::npos ||
            piece.name.find("Waistband") != std::string::npos) continue;
        w += boundingBox(piece.commands).width;
    }
    return w;
}

// --- skirt side-seam walk: commands[1].to -> curve[2] -> line[3]
// (validator.cpp:412-418, the validator's own measuring convention). ---
static double skirtSideSeamArc(const PatternPiece& piece) {
    return pathLength({PathCommand::move(piece.commands[1].to), piece.commands[2], piece.commands[3]});
}
// --- top side-seam walk: underarm -> hem side, the last drawn side-to-hem cubic
// before the trailing line/close (validator.cpp topSideSeamLength; same walk as
// recipe_dress_check.cpp:52-57). ---
static double topSideSeamArc(const PatternPiece& piece) {
    size_t hemEnd = piece.commands.size() - 1;
    while (hemEnd > 0 && (piece.commands[hemEnd].type == CmdType::Close ||
                          piece.commands[hemEnd].type == CmdType::Line)) --hemEnd;
    return pathLength({PathCommand::move(piece.commands[hemEnd - 2].to), piece.commands[hemEnd - 1]});
}

// Grade one recipe across the full EU chart; assert clean + seam-match + grow +
// constant dart topology at every size. `sideSeamArc` and the piece names are the
// per-garment convention passed by the caller.
static void gradeRecipe(const char* recipePath, const std::string& param, double paramValue,
                        const char* frontName, const char* backName,
                        double (*sideSeamArc)(const PatternPiece&), const char* label) {
    std::printf(" %s (%s)\n", label, recipePath);
    const auto loaded = recipe::loadRecipeFile(recipePath);
    check(loaded.ok, std::string(label) + ": recipe loads: " +
                         (loaded.ok ? recipe::recipeId(loaded.value) : loaded.error));
    if (!loaded.ok) return;
    const recipe::Recipe& rcp = loaded.value;
    const GarmentSpec spec = recipe::kernelSpec(rcp);

    const auto& chart = euSizeChart();
    double prevWidth = -1.0;
    size_t prevFrontMarkings = 0;
    size_t prevBackMarkings = 0;
    int cleanSizes = 0, seamSizes = 0;
    bool monotonic = true, dartTopologyStable = true, allDrafted = true;
    char line[240];

    for (size_t si = 0; si < chart.size(); ++si) {
        const SizeChartEntry& entry = chart[si];
        const auto drafted = recipe::draftRecipe(rcp, entry.body, {{param, paramValue}});
        if (!drafted.ok) {
            allDrafted = false;
            std::printf("    %s DRAFT ERR: %s\n", entry.label.c_str(), drafted.error.c_str());
            continue;
        }
        const DraftedPattern& p = drafted.value;

        // (1) every size validates clean.
        const auto issues = PatternValidator::issues(spec, entry.body, p);
        if (issues.empty()) cleanSizes++;
        else
            for (const auto& iss : issues)
                std::printf("    %s NOT clean: %s\n", entry.label.c_str(), iss.description().c_str());

        // (2) front/back side seams sew together at this size (measured arc).
        const PatternPiece* front = findPiece(p, frontName);
        const PatternPiece* back = findPiece(p, backName);
        double sf = 0, sb = 0;
        bool seamOk = false;
        if (front && back) {
            sf = sideSeamArc(*front);
            sb = sideSeamArc(*back);
            seamOk = std::fabs(sf - sb) <= PatternValidator::pairedSeamTolerance;
        }
        if (seamOk) seamSizes++;

        // (3) monotonic growth vs the previous (smaller) size.
        const double w = gradedWidth(p);
        if (prevWidth >= 0.0 && !(w > prevWidth)) {
            monotonic = false;
            std::snprintf(line, sizeof(line), "    %s did not grow: %.2f <= %.2f",
                          entry.label.c_str(), w, prevWidth);
            std::printf("%s\n", line);
        }

        // (4) dart topology constant across the series (RECETE-SPEC §2.1): the
        // marking command count (dart legs) must not flip mid-run, or point
        // matching between graded sizes would silently break.
        if (si > 0 && front && back &&
            (front->markings.size() != prevFrontMarkings || back->markings.size() != prevBackMarkings)) {
            dartTopologyStable = false;
            std::snprintf(line, sizeof(line),
                          "    %s dart topology flipped: front %zu->%zu, back %zu->%zu marking cmds",
                          entry.label.c_str(), prevFrontMarkings, front->markings.size(),
                          prevBackMarkings, back->markings.size());
            std::printf("%s\n", line);
        }

        std::printf("    %-6s clean=%d seam(|d|=%.2f) width=%.2f grow=%+.2f pieces=%zu\n",
                    entry.label.c_str(), issues.empty(), std::fabs(sf - sb), w,
                    prevWidth < 0 ? 0.0 : w - prevWidth, p.pieces.size());

        prevWidth = w;
        if (front) prevFrontMarkings = front->markings.size();
        if (back) prevBackMarkings = back->markings.size();
    }

    const int n = static_cast<int>(chart.size());
    check(allDrafted, std::string(label) + ": recipe drafts at every EU size");
    std::snprintf(line, sizeof(line), "%s: every EU size validates clean (%d/%d)", label, cleanSizes, n);
    check(cleanSizes == n, line);
    std::snprintf(line, sizeof(line), "%s: front/back side seams match at every size (%d/%d, tol %.1f)",
                  label, seamSizes, n, PatternValidator::pairedSeamTolerance);
    check(seamSizes == n, line);
    check(monotonic, std::string(label) + ": graded pattern grows monotonically EU34->EU52");
    check(dartTopologyStable, std::string(label) + ": dart topology constant across the whole series");
}

int main(int argc, char** argv) {
    if (argc < 3) {
        std::fprintf(stderr, "usage: recipe_grade_check <skirt.json> <shift-dress.json>\n");
        return 2;
    }
    std::printf("recipe grade check (EU size run, recipe path)\n");

    // The v1 A-line skirt: waist/hip only, dart shaping (the golden-pinned style).
    gradeRecipe(argv[1], "lengthMM", 450, "Front", "Back", skirtSideSeamArc, "skirt A-line dart");
    // The v1.1 damar-içi shift dress: top kernel, square neck, spaghetti straps.
    gradeRecipe(argv[2], "extendMM", 380, "Top Front", "Top Back", topSideSeamArc, "shift dress square spaghetti");

    std::printf("%s\n", failures == 0 ? "recipe_grade_check: ALL PASS" : "recipe_grade_check: FAILURES");
    return failures == 0 ? 0 : 1;
}
