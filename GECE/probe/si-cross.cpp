// F-N diagnostic (scratch): for the failing cell, flatten the Bodice Side Front
// outline while REMEMBERING which command each segment came from, then report
// every proper crossing as "cmd A x cmd B at (x,y)". Also prints the x-extremum
// (belly) of the armhole sub-curve. Read-only.
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../../engine/src/garment.hpp"
#include "../../engine/src/geometry.hpp"
#include "../../engine/src/validator.hpp"

using namespace stitchu;

struct Seg { Point a, b; size_t cmd; };

int main(int argc, char** argv) {
    const std::string which = argc > 1 ? argv[1] : "EU38";
    BodyMeasurementsSnapshot m{88, 70, 94, 37, 40.5, 58, 35};
    if (which == "EU36") m = {84, 66, 90, 36.5, 40, 57.5, 34.5};
    if (which == "petite") m = {84, 64, 90, 34, 33, 49, 33};
    if (which == "EU40") m = {92, 74, 98, 37.5, 41, 58.5, 36};
    if (which == "EU34") m = {80, 62, 86, 36, 39.5, 57, 34};

    GarmentSpec spec;
    spec.garment = GarmentType::Dress;
    spec.shaping = Shaping::Princess;
    spec.waistline = Waistline::Empire;
    spec.fabric = Fabric::Woven;
    spec.neckline = Neckline::Crew;
    spec.skirtStyle = SkirtStyle::ALine;
    spec.skirtLength = SkirtLength::Mini;
    spec.sleeveStyle = SleeveStyle::None;
    spec.sleeveLength = SleeveLength::Short;

    const DraftedPattern draft = GarmentDrafter::draft(spec, m);
    for (const auto& p : draft.pieces) {
        if (p.name != "Bodice Side Front") continue;
        std::vector<Seg> segs;
        Point cur{0, 0}, start{0, 0};
        for (size_t i = 0; i < p.commands.size(); ++i) {
            const auto& c = p.commands[i];
            if (c.type == CmdType::Move) { cur = start = c.to; continue; }
            if (c.type == CmdType::Line) { segs.push_back({cur, c.to, i}); cur = c.to; continue; }
            if (c.type == CmdType::Curve) {
                const auto s = flattenCubic(cur, c.to, c.cp1, c.cp2, 64);
                for (size_t k = 1; k < s.size(); ++k) segs.push_back({s[k-1], s[k], i});
                cur = c.to; continue;
            }
            segs.push_back({cur, start, i}); cur = start;
        }
        auto orient = [](Point a, Point b, Point c) {
            return (b.x-a.x)*(c.y-a.y) - (b.y-a.y)*(c.x-a.x);
        };
        std::printf("%s  %s: %zu segs\n", which.c_str(), p.name.c_str(), segs.size());
        for (size_t i = 0; i < segs.size(); ++i)
            for (size_t j = i + 2; j < segs.size(); ++j) {
                if (segs[i].cmd == segs[j].cmd) continue;   // same command, ignore
                const double d1 = orient(segs[j].a, segs[j].b, segs[i].a);
                const double d2 = orient(segs[j].a, segs[j].b, segs[i].b);
                const double d3 = orient(segs[i].a, segs[i].b, segs[j].a);
                const double d4 = orient(segs[i].a, segs[i].b, segs[j].b);
                if (!(((d1>0&&d2<0)||(d1<0&&d2>0)) && ((d3>0&&d4<0)||(d3<0&&d4>0)))) continue;
                const double t = d1 / (d1 - d2);
                std::printf("  CROSS cmd%zu x cmd%zu at (%.3f, %.3f)\n",
                            segs[i].cmd, segs[j].cmd,
                            segs[i].a.x + t*(segs[i].b.x-segs[i].a.x),
                            segs[i].a.y + t*(segs[i].b.y-segs[i].a.y));
                i = segs.size(); j = segs.size(); break;
            }
        // belly of cmd 1 (armhole remainder) and reach of the last curve (seam)
        for (size_t i = 0; i < p.commands.size(); ++i) {
            if (p.commands[i].type != CmdType::Curve) continue;
            Point from{0,0};
            { Point c{0,0}, s{0,0};
              for (size_t k = 0; k < i; ++k) {
                const auto& q = p.commands[k];
                if (q.type == CmdType::Move) { c = s = q.to; }
                else if (q.type == CmdType::Close) c = s;
                else c = q.to;
              }
              from = c; }
            double minX = 1e9, minY = 0;
            const auto s = flattenCubic(from, p.commands[i].to, p.commands[i].cp1, p.commands[i].cp2, 200);
            for (const auto& pt : s) if (pt.x < minX) { minX = pt.x; minY = pt.y; }
            std::printf("  cmd%zu curve (%.2f,%.2f)->(%.2f,%.2f)  min x = %.3f at y = %.3f\n",
                        i, from.x, from.y, p.commands[i].to.x, p.commands[i].to.y, minX, minY);
        }
    }
    return 0;
}
