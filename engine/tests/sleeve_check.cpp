// Sleeve biceps-fit check: proves the set-in sleeve is always at least as wide
// as the biceps girth + ease (or it binds / won't close at the underarm), while
// the cap still eases into the armhole inside the 1-9% window. Guards the
// length-only cap fit from ever silently returning a too-narrow sleeve — the
// exact defect the audit found: width fell out of length-matching and ignored
// the arm, so every sleeve ran 8-20% narrow while the matrix stayed green.
#include <cstdio>
#include <string>
#include <vector>

#include "../src/bodice.hpp"
#include "../src/sleeve.hpp"
#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static bool check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
    return ok;
}

static const PatternPiece* sleevePiece(const DraftedPattern& d) {
    for (const auto& p : d.pieces)
        if (p.name.find("Sleeve") != std::string::npos && p.name.find("Cuff") == std::string::npos)
            return &p;
    return nullptr;
}

// Body corners: min, max, mid, and a big-bust/narrow-shoulder stress body.
struct Body { double bu, wa, hi, sh, bl, al, ne; const char* name; };
static const std::vector<Body> BODIES = {
    {60, 48, 63, 26, 28, 40, 26, "min"},
    {160, 128, 168, 52, 55, 75, 55, "max"},
    {92, 74, 98, 39, 42, 58, 36, "mid"},
    {130, 104, 120, 34, 46, 60, 40, "big-bust narrow-shoulder"},
};

int main() {
    std::printf("sleeve biceps-fit check\n");

    for (const Body& b : BODIES) {
        const BodyMeasurementsSnapshot m{b.bu, b.wa, b.hi, b.sh, b.bl, b.al, b.ne};
        for (Fabric fabric : {Fabric::Woven, Fabric::Knit}) {
            for (SleeveLength len : {SleeveLength::Short, SleeveLength::Elbow, SleeveLength::Long}) {
                for (SleeveStyle style : {SleeveStyle::Straight, SleeveStyle::Balloon}) {
                    GarmentSpec spec;
                    spec.garment = GarmentType::Dress;
                    spec.sleeveStyle = style;
                    spec.sleeveLength = len;
                    spec.fabric = fabric;
                    const DraftedPattern d = GarmentDrafter::draft(spec, m);
                    const PatternPiece* s = sleevePiece(d);
                    const std::string tag = std::string(b.name) +
                        (fabric == Fabric::Knit ? " knit" : " woven") +
                        (style == SleeveStyle::Balloon ? " balloon" : " straight");

                    if (!check(s != nullptr, tag + ": sleeve piece drafted")) continue;

                    // The cap chord capLeft -> capRight IS the finished biceps width.
                    const double capWidth = distance(s->commands[0].to, s->commands[2].to);
                    const double biceps =
                        m.bustMM() * SleeveBlock::bicepsRatio * (1 + SleeveBlock::bicepsEaseFor(fabric));
                    check(capWidth >= biceps - 1.0,
                        tag + ": sleeve " + std::to_string((int)capWidth) +
                        " mm >= biceps " + std::to_string((int)biceps) + " mm");

                    // Cap still eases into the armhole inside the 1-9% window.
                    const double capLen = pathLength({
                        PathCommand::move(s->commands[0].to), s->commands[1], s->commands[2]});
                    BodiceBlock::BodiceOptions o;
                    o.fabric = fabric;
                    const BodiceDraft bod = BodiceBlock::draft(m, o);
                    const double ease = capLen / bod.armholeLength - 1;
                    check(ease >= 0.01 && ease <= 0.09,
                        tag + ": cap ease " + std::to_string((int)(ease * 100)) + "% in 1-9%");

                    // The validator agrees: no biceps or cap issue on any of these.
                    const auto issues = PatternValidator::issues(spec, m, d);
                    bool clean = true;
                    for (const auto& e : issues)
                        if (e.rule == "biceps" || e.rule == "cap") clean = false;
                    check(clean, tag + ": validator reports no sleeve issue");
                }
            }
        }
    }

    // Sleeveless is unaffected: no sleeve piece, no biceps issue.
    {
        const BodyMeasurementsSnapshot m{92, 74, 98, 39, 42, 58, 36};
        GarmentSpec spec;
        spec.garment = GarmentType::Dress;
        spec.sleeveStyle = SleeveStyle::None;
        const DraftedPattern d = GarmentDrafter::draft(spec, m);
        check(sleevePiece(d) == nullptr, "sleeveless: no sleeve piece");
        const auto issues = PatternValidator::issues(spec, m, d);
        bool clean = true;
        for (const auto& e : issues) if (e.rule == "biceps") clean = false;
        check(clean, "sleeveless: no biceps issue");
    }

    std::printf(failures ? "\nFAILED %d checks\n" : "\nall sleeve checks pass\n", failures);
    return failures ? 1 : 0;
}
