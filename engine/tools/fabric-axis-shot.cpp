// fabric-axis-shot — ÇIKTI (F-H, 2026-08-23).
//   build: cmake --build engine/build-fh --target fabric-axis-shot
//   run:   ./engine/build-fh/fabric-axis-shot GECE/log/F-H.shots
//
// Two artefacts, both regenerable from this file (never hand-edit the output):
//   F-H-before-after.svg  the SAME spec drawn on two fabrics, overlaid. This is
//                         the whole claim of İŞ 1 made visible: before tonight
//                         these two outlines were the same line.
//   F-H-rehber.pdf        one printed page of the REHBER for the stretch draft,
//                         each advice with the basis that lets it exist (İŞ 2).
//
// The PDF is written by hand (Helvetica, one content stream, manual xref) because
// the repo has no raster/PDF converter installed — that is also why there is no
// PNG here. An SVG opens in any browser at full fidelity; a fake PNG would not.
#include <cmath>
#include <cstdio>
#include <fstream>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/sizechart.hpp"

using namespace stitchu;

static std::vector<Point> outlinePoints(const std::vector<PathCommand>& cmds) {
    std::vector<Point> pts;
    Point cur{0, 0};
    for (const auto& c : cmds) {
        switch (c.type) {
            case CmdType::Move: cur = c.to; pts.push_back(cur); break;
            case CmdType::Line: cur = c.to; pts.push_back(cur); break;
            case CmdType::Curve: {
                const auto seg = flattenCubic(cur, c.to, c.cp1, c.cp2, 24);
                for (size_t i = 1; i < seg.size(); ++i) pts.push_back(seg[i]);
                cur = c.to;
                break;
            }
            case CmdType::Close: if (!pts.empty()) pts.push_back(pts.front()); break;
        }
    }
    return pts;
}

static std::string polyline(const std::vector<PathCommand>& cmds, double dx, double dy,
                            const char* stroke, const char* dash) {
    const auto pts = outlinePoints(cmds);
    if (pts.size() < 2) return "";
    std::string d = "M";
    char buf[64];
    for (size_t i = 0; i < pts.size(); ++i) {
        std::snprintf(buf, sizeof buf, "%s%.2f %.2f", i ? " L" : "", pts[i].x + dx, pts[i].y + dy);
        d += buf;
    }
    return std::string("<path d=\"") + d + "\" fill=\"none\" stroke=\"" + stroke +
           "\" stroke-width=\"1.6\"" + (dash[0] ? std::string(" stroke-dasharray=\"") + dash + "\"" : "") + "/>\n";
}

// ── minimal PDF, one page, Helvetica ────────────────────────────────────────
static std::string pdfEscape(const std::string& s) {
    std::string out;
    for (unsigned char c : s) {
        if (c == '(' || c == ')' || c == '\\') { out += '\\'; out += static_cast<char>(c); }
        else if (c < 128) out += static_cast<char>(c);
        // Non-ASCII (the Turkish ü/ı/ö and the box-drawing dashes) is dropped
        // rather than mojibaked: WinAnsi would print garbage for them.
    }
    return out;
}

static std::vector<std::string> wrap(const std::string& s, size_t width) {
    std::vector<std::string> lines;
    std::string line, word;
    for (size_t i = 0; i <= s.size(); ++i) {
        const char c = i < s.size() ? s[i] : ' ';
        if (c == ' ' || i == s.size()) {
            if (line.empty()) line = word;
            else if (line.size() + 1 + word.size() <= width) line += " " + word;
            else { lines.push_back(line); line = word; }
            word.clear();
        } else {
            word += c;
        }
    }
    if (!line.empty()) lines.push_back(line);
    return lines;
}

static void writePDF(const std::string& path, const std::string& title,
                     const std::vector<GuideAdvice>& rehber) {
    std::string content = "BT\n/F2 15 Tf\n56 780 Td 16 TL\n(" + pdfEscape(title) + ") Tj\nET\n";
    double y = 754;
    char buf[256];
    for (const auto& a : rehber) {
        if (y < 70) break;
        std::snprintf(buf, sizeof buf, "BT\n/F2 9 Tf\n56 %.0f Td\n(%s) Tj\nET\n", y, pdfEscape(a.id).c_str());
        content += buf;
        y -= 12;
        for (const auto& ln : wrap(a.text, 96)) {
            if (y < 70) break;
            std::snprintf(buf, sizeof buf, "BT\n/F1 8.5 Tf\n56 %.0f Td\n(%s) Tj\nET\n", y, pdfEscape(ln).c_str());
            content += buf;
            y -= 10;
        }
        for (const auto& ln : wrap("BASIS " + a.basis, 96)) {
            if (y < 70) break;
            std::snprintf(buf, sizeof buf, "BT\n/F1 7 Tf\n0.45 g\n56 %.0f Td\n(%s) Tj\n0 g\nET\n", y, pdfEscape(ln).c_str());
            content += buf;
            y -= 9;
        }
        y -= 6;
    }

    std::vector<std::string> objs;
    objs.push_back("<< /Type /Catalog /Pages 2 0 R >>");
    objs.push_back("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    objs.push_back("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
                   "/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>");
    objs.push_back("<< /Length " + std::to_string(content.size()) + " >>\nstream\n" + content + "endstream");
    objs.push_back("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    objs.push_back("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

    std::string pdf = "%PDF-1.4\n";
    std::vector<size_t> offsets;
    for (size_t i = 0; i < objs.size(); ++i) {
        offsets.push_back(pdf.size());
        pdf += std::to_string(i + 1) + " 0 obj\n" + objs[i] + "\nendobj\n";
    }
    const size_t xref = pdf.size();
    pdf += "xref\n0 " + std::to_string(objs.size() + 1) + "\n0000000000 65535 f \n";
    for (const size_t off : offsets) {
        std::snprintf(buf, sizeof buf, "%010zu 00000 n \n", off);
        pdf += buf;
    }
    pdf += "trailer\n<< /Size " + std::to_string(objs.size() + 1) + " /Root 1 0 R >>\nstartxref\n" +
           std::to_string(xref) + "\n%%EOF\n";
    std::ofstream(path, std::ios::binary) << pdf;
}

int main(int argc, char** argv) {
    const std::string outDir = argc > 1 ? argv[1] : "GECE/log/F-H.shots";
    const SizeChartEntry* eu38 = euSize("EU38");
    if (!eu38) { std::fprintf(stderr, "no EU38\n"); return 1; }

    GarmentSpec spec;
    spec.garment = GarmentType::Top;
    spec.shaping = Shaping::Dart;
    spec.neckline = Neckline::Crew;

    GarmentSpec woven = spec;                                  // BEFORE: the only draft that existed
    GarmentSpec stretch = spec;
    stretch.fabric = FabricAxis(Fabric::Knit, 63.0);           // AFTER: a stretchy knit, same spec

    const DraftedPattern a = GarmentDrafter::draft(woven, eu38->body);
    const DraftedPattern b = GarmentDrafter::draft(stretch, eu38->body);

    std::string svg =
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1100\" height=\"760\" viewBox=\"0 0 1100 760\">\n"
        "<rect width=\"1100\" height=\"760\" fill=\"#ffffff\"/>\n"
        "<text x=\"40\" y=\"40\" font-family=\"Helvetica\" font-size=\"19\">F-H — ayni spec, iki kumas (EU38 top, crew, dart)</text>\n"
        "<text x=\"40\" y=\"64\" font-family=\"Helvetica\" font-size=\"13\" fill=\"#444\">"
        "solid = woven (0% stretch, +11.0% bust ease)   ·   dashed = knit 63% stretch (-5.0% bust ease). "
        "Before tonight these were the same line.</text>\n";
    double dx = 70, dy = 130;
    const size_t n = a.pieces.size() < b.pieces.size() ? a.pieces.size() : b.pieces.size();
    for (size_t i = 0; i < n; ++i) {
        const Rect box = boundingBox(a.pieces[i].commands);
        svg += polyline(a.pieces[i].commands, dx - box.x, dy - box.y, "#111111", "");
        svg += polyline(b.pieces[i].commands, dx - box.x, dy - box.y, "#c0392b", "6 4");
        char lbl[256];
        std::snprintf(lbl, sizeof lbl,
                      "<text x=\"%.0f\" y=\"%.0f\" font-family=\"Helvetica\" font-size=\"11\">%s</text>\n",
                      dx, dy - 10, a.pieces[i].name.c_str());
        svg += lbl;
        dx += box.width + 60;
        if (dx > 900) { dx = 70; dy += 300; }
    }
    svg += "</svg>\n";
    std::ofstream(outDir + "/F-H-before-after.svg") << svg;

    writePDF(outDir + "/F-H-rehber.pdf",
             "REHBER - EU38 top, knit 63% stretch (F-H IS 2)", b.rehber);
    writePDF(outDir + "/F-H-rehber-woven.pdf",
             "REHBER - EU38 top, woven (F-H IS 2)", a.rehber);

    std::printf("wrote %s/F-H-before-after.svg, F-H-rehber.pdf, F-H-rehber-woven.pdf\n", outDir.c_str());
    std::printf("woven rehber: %zu advices   knit-63%% rehber: %zu advices\n", a.rehber.size(), b.rehber.size());
    return 0;
}
