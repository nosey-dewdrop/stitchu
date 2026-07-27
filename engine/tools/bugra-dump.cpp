// Bugra corset micro-loop dump: drafts the Buttoned Corset Bustier spec
// (cupSeam = bugra) on the Bugra-36 body and prints the pieces as JSON
// polygons (sewing line + cutting line, cubics flattened to 24 segments) so
// patterns_real-style overlay tooling can measure piece-by-piece IoU against
// the purchased pattern's size-36 rings (patterns_real/geometry/
// geometry-full.json). Also prints the validator verdict so every loop
// iteration sees wearability, not just shape.
#include <cstdio>
#include <string>
#include <vector>

#include "../src/cupseam.hpp"
#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

namespace {

std::vector<Point> flattenOutline(const std::vector<PathCommand>& cmds) {
    std::vector<Point> poly;
    Point current{0, 0}, start{0, 0};
    bool have = false;
    auto push = [&](Point p) {
        if (poly.empty() || std::fabs(poly.back().x - p.x) > 1e-6 ||
            std::fabs(poly.back().y - p.y) > 1e-6)
            poly.push_back(p);
    };
    for (const auto& cmd : cmds) {
        switch (cmd.type) {
            case CmdType::Move: current = cmd.to; start = cmd.to; have = true; push(current); break;
            case CmdType::Line: push(cmd.to); current = cmd.to; break;
            case CmdType::Curve: {
                const auto pts = flattenCubic(current, cmd.to, cmd.cp1, cmd.cp2, 24);
                for (size_t i = 1; i < pts.size(); ++i) push(pts[i]);
                current = cmd.to; break;
            }
            case CmdType::Close: if (have) push(start); break;
        }
    }
    return poly;
}

void printPoly(const char* key, const std::vector<PathCommand>& cmds) {
    const auto poly = flattenOutline(cmds);
    std::printf("\"%s\":[", key);
    for (size_t i = 0; i < poly.size(); ++i)
        std::printf("%s[%.3f,%.3f]", i ? "," : "", poly[i].x, poly[i].y);
    std::printf("]");
}

} // namespace

int main() {
    // Bugra size-36 body (BASAR-IKI-KALIP.md): bust 88 / waist 68 / hip 94,
    // EU38 demo frame: shoulder 37, back 40, arm 58, neck 35.
    const BodyMeasurementsSnapshot m{88, 68, 94, 37, 40, 58, 35};

    GarmentSpec spec;
    spec.garment = GarmentType::Top;
    spec.shaping = Shaping::Princess;
    spec.neckline = Neckline::Square;
    spec.sleeveStyle = SleeveStyle::None;
    spec.fabric = Fabric::Woven;
    spec.topLength = TopLength::Hip;
    spec.frontPlacket = true; // the buttoned CF (grown placket, drawn pre-split)
    spec.cupSeam = static_cast<int>(CupSeam::Bugra);

    const DraftedPattern d = GarmentDrafter::draft(spec, m);
    const auto issues = PatternValidator::issues(spec, m, d);

    std::printf("{\"garment\":\"%s\",\"pieces\":[", d.garment.c_str());
    for (size_t i = 0; i < d.pieces.size(); ++i) {
        const auto& p = d.pieces[i];
        std::printf("%s{\"name\":\"%s\",\"cut\":\"%s\",", i ? "," : "", p.name.c_str(),
                    p.cutInstruction.c_str());
        printPoly("sewPoly", p.commands);
        std::printf(",");
        printPoly("cutPoly", p.cutLine.empty() ? p.commands : p.cutLine);
        std::printf("}");
    }
    std::printf("],\"issues\":[");
    for (size_t i = 0; i < issues.size(); ++i)
        std::printf("%s{\"kind\":\"%s\",\"piece\":\"%s\",\"detail\":\"%s\"}", i ? "," : "",
                    issues[i].rule.c_str(), issues[i].piece.c_str(), issues[i].detail.c_str());
    std::printf("],\"guideSteps\":%zu}\n", d.guideSteps.size());
    return 0;
}
