// F-N diagnostic (scratch): draft ONE cell and dump the Bodice Side Front
// outline command by command, plus whether selfintersect fires. Fast enough to
// drive a git bisect. argv[1] = body name (default EU38).
#include <cstdio>
#include <cstring>
#include <string>
#include <vector>

#include "../../engine/src/garment.hpp"
#include "../../engine/src/geometry.hpp"
#include "../../engine/src/validator.hpp"

using namespace stitchu;

int main(int argc, char** argv) {
    const std::string which = argc > 1 ? argv[1] : "EU38";
    BodyMeasurementsSnapshot m{88, 70, 94, 37, 40.5, 58, 35};       // EU38
    if (which == "EU36") m = {84, 66, 90, 36.5, 40, 57.5, 34.5};
    if (which == "petite") m = {84, 64, 90, 34, 33, 49, 33};
    if (which == "EU40") m = {92, 74, 98, 37.5, 41, 58.5, 36};

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
    int si = 0;
    for (const auto& iss : PatternValidator::issues(spec, m, draft))
        if (iss.rule == "selfintersect") {
            ++si;
            std::printf("SELFINTERSECT %s :: %s\n", iss.piece.c_str(), iss.detail.c_str());
        }
    std::printf("%s selfintersect=%d\n", which.c_str(), si);

    if (argc > 2 && std::strcmp(argv[2], "--dump") == 0) {
        for (const auto& p : draft.pieces) {
            if (p.name != "Bodice Side Front") continue;
            std::printf("\n-- %s (%zu cmds)\n", p.name.c_str(), p.commands.size());
            for (size_t i = 0; i < p.commands.size(); ++i) {
                const auto& c = p.commands[i];
                const char* t = c.type == CmdType::Move ? "M" :
                                c.type == CmdType::Line ? "L" :
                                c.type == CmdType::Curve ? "C" : "Z";
                if (c.type == CmdType::Curve)
                    std::printf("  %2zu %s (%8.3f,%8.3f)  cp1(%8.3f,%8.3f) cp2(%8.3f,%8.3f)\n",
                                i, t, c.to.x, c.to.y, c.cp1.x, c.cp1.y, c.cp2.x, c.cp2.y);
                else
                    std::printf("  %2zu %s (%8.3f,%8.3f)\n", i, t, c.to.x, c.to.y);
            }
        }
    }
    return si ? 1 : 0;
}
