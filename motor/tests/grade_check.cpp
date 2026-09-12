// Grading check: one design drafted across the standard EU size run must (1)
// validate CLEAN at every size (a seller ships the whole run, so no size may be
// unsewable), and (2) GROW monotonically size to size — a graded run that
// repeats the same pattern relabeled would silently ship wrong sizes. This test
// is the engine-side proof behind the /api/grade endpoint and the web size run.
#include <cstdio>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/geometry.hpp"
#include "../src/sizechart.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

// Total drafted width of a pattern: the summed bounding-box width of its GRADED
// panels. A larger body grades to a wider pattern, so this must rise size to
// size. Strip/notion pieces (bias binding, ties, cords) are cut-to-length and
// drawn at a capped segment width — their drawn width is NOT a grade dimension
// (a long strip splits into more segments, shrinking one segment's width), so
// they are excluded from the monotonic-growth measure.
static double totalWidth(const DraftedPattern& d) {
    double w = 0.0;
    for (const auto& piece : d.pieces) {
        if (piece.name.find("Bias binding") != std::string::npos ||
            piece.name.find("Tie") != std::string::npos ||
            piece.name.find("Cord") != std::string::npos ||
            piece.name.find("Binding") != std::string::npos) continue;
        w += boundingBox(piece.commands).width;
    }
    return w;
}

// Draft `spec` across the whole EU chart; assert clean + growing.
static void gradeRuns(const GarmentSpec& spec, const std::string& label) {
    std::printf(" %s\n", label.c_str());
    const auto& chart = euSizeChart();
    double prev = -1.0;
    int cleanSizes = 0;
    bool monotonic = true;
    for (const auto& entry : chart) {
        const DraftedPattern d = GarmentDrafter::draft(spec, entry.body);
        const auto issues = PatternValidator::issues(spec, entry.body, d);
        if (issues.empty()) cleanSizes++;
        else {
            std::printf("    %s NOT clean: %s\n", entry.label.c_str(), issues[0].description().c_str());
        }
        const double w = totalWidth(d);
        if (prev >= 0.0 && !(w > prev)) {
            monotonic = false;
            std::printf("    %s did not grow: %.2f <= %.2f\n", entry.label.c_str(), w, prev);
        }
        prev = w;
    }
    check(cleanSizes == static_cast<int>(chart.size()), label + ": every EU size validates clean");
    check(monotonic, label + ": pattern grows monotonically EU34->EU52");
}

int main() {
    std::printf("grade check (EU size run)\n");

    // A representative seller design: princess-seamed sweetheart dress.
    {
        GarmentSpec spec;
        spec.garment = GarmentType::Dress;
        spec.shaping = Shaping::Princess;
        spec.neckline = Neckline::Sweetheart;
        gradeRuns(spec, "sweetheart princess dress");
    }
    // A simpler garment on a different block: an A-line skirt.
    {
        GarmentSpec spec;
        spec.garment = GarmentType::Skirt;
        spec.skirtStyle = SkirtStyle::ALine;
        gradeRuns(spec, "A-line skirt");
    }
    // A top with a set-in sleeve — grades the sleeve block too.
    {
        GarmentSpec spec;
        spec.garment = GarmentType::Top;
        spec.sleeveStyle = SleeveStyle::Straight;
        spec.sleeveLength = SleeveLength::Short;
        gradeRuns(spec, "short-sleeve top");
    }

    std::printf(failures ? "\nGRADE CHECK FAILED (%d)\n" : "\ngrade check passed\n", failures);
    return failures ? 1 : 0;
}
