#pragma once
// golden_writer: THE golden CSV writer, shared by golden_dump (motor path) and
// recipe_golden_dump (recipe path). Gate 1(b) demands AUTHOR commonality
// (docs/RECETE-SPEC.md §5b): number production stays independent (motor vs
// interpreter), but the CSV text format — %.4f, the `body|label|fabric,...`
// line, the `body|label|pieceN:Name` prefix — is ONE piece of code, so a
// format difference can never fake an alarm or fake a pass.
#include <cstdio>
#include <string>
#include <vector>

#include "../src/geometry.hpp"

namespace stitchu {
namespace goldenwriter {

// Command lines. Extracted verbatim from golden_dump.cpp (the format the
// repo pin engine/golden-reference.csv was written with).
inline void dumpCommands(const char* kind, const std::vector<PathCommand>& commands, const std::string& prefix) {
    for (size_t i = 0; i < commands.size(); ++i) {
        const auto& cmd = commands[i];
        switch (cmd.type) {
            case CmdType::Move:
                std::printf("%s,%s,%zu,move,%.4f,%.4f\n", prefix.c_str(), kind, i, cmd.to.x, cmd.to.y);
                break;
            case CmdType::Line:
                std::printf("%s,%s,%zu,line,%.4f,%.4f\n", prefix.c_str(), kind, i, cmd.to.x, cmd.to.y);
                break;
            case CmdType::Curve:
                std::printf("%s,%s,%zu,curve,%.4f,%.4f,%.4f,%.4f,%.4f,%.4f\n", prefix.c_str(), kind, i,
                            cmd.to.x, cmd.to.y, cmd.cp1.x, cmd.cp1.y, cmd.cp2.x, cmd.cp2.y);
                break;
            case CmdType::Close:
                std::printf("%s,%s,%zu,close\n", prefix.c_str(), kind, i);
                break;
        }
    }
}

// The per-combo fabric line (the FIRST line of every body|label block).
inline void dumpFabricLine(const std::string& body, const std::string& label, double fabric) {
    std::printf("%s|%s|fabric,%.4f\n", body.c_str(), label.c_str(), fabric);
}

// The per-piece line prefix.
inline std::string piecePrefix(const std::string& body, const std::string& label,
                               size_t index, const std::string& name) {
    return body + "|" + label + "|piece" + std::to_string(index) + ":" + name;
}

} // namespace goldenwriter
} // namespace stitchu
