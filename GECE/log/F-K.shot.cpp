// F-K.shot.cpp — F-K'nin ONCE/SONRA cekimi. CMake'e girmez, elle derlenir:
//
//   c++ -std=c++17 -O1 -I engine/src GECE/log/F-K.shot.cpp engine/build/libengine.a \
//       -o /tmp/fk-shot && /tmp/fk-shot <cikti-dizini> <etiket>
//
// AYNI dosya HEAD'in (once) ve calisma agacinin (sonra) libengine.a'sina karsi
// derilir; ikisi arasindaki TEK fark motorun kendisidir, cizim kodu degil.
//
// Iki panel yazar:
//   (A) Yaka parcasi TEK BASINA. Boyun (dikis) kenari kalin, kirisi kesikli,
//       sagitta oku olculu.
//   (B) Yaka GIYSIYE DIKILMIS hali: giysinin kendi yaka cizgisi CB'den omuza
//       (arka beden) + omuzdan CF'e (on beden, omuzda 2 cm bindirilmis) diye
//       kurulur -- yani duz yakanin cizim kanunu -- ve yakanin boyun kenari
//       onun uzerine bindirilir. Iki egri ne kadar ustuste binerse yaka o kadar
//       yatiyor demektir; duz bir serit burada kirisin uzerinde kalir.
#include <cmath>
#include <cstdio>
#include <fstream>
#include <string>
#include <vector>

#include "collar.hpp"
#include "garment.hpp"

using namespace stitchu;

namespace {

std::vector<Point> walk(const std::vector<PathCommand>& cmds, int steps = 96) {
    std::vector<Point> pts;
    Point cur{0, 0};
    bool started = false;
    for (const auto& c : cmds) {
        if (c.type == CmdType::Move) { cur = c.to; pts.push_back(cur); started = true; }
        else if (c.type == CmdType::Line) {
            if (!started) { cur = c.to; pts.push_back(cur); started = true; continue; }
            pts.push_back(c.to); cur = c.to;
        } else if (c.type == CmdType::Curve) {
            if (!started) { cur = c.to; pts.push_back(cur); started = true; continue; }
            const std::vector<Point> seg = flattenCubic(cur, c.to, c.cp1, c.cp2, steps);
            for (size_t i = 1; i < seg.size(); ++i) pts.push_back(seg[i]);
            cur = c.to;
        }
    }
    return pts;
}

std::vector<PathCommand> necklineRun(const PatternPiece& p) {
    const auto& c = p.commands;
    if (c.size() < 3 || c[0].type != CmdType::Move) return {};
    size_t end = 1;
    double minY = c[0].to.y;
    for (size_t i = 1; i < c.size(); ++i) {
        if (c[i].type == CmdType::Close) break;
        if (c[i].to.y <= minY + 1e-6) { minY = c[i].to.y; end = i; }
        else break;
    }
    std::vector<PathCommand> run{PathCommand::move(c[0].to)};
    for (size_t i = 1; i <= end; ++i) run.push_back(c[i]);
    return run;
}

const PatternPiece* findByName(const DraftedPattern& d, const char* needle) {
    for (const auto& p : d.pieces)
        if (p.name.find(needle) != std::string::npos) return &p;
    return nullptr;
}

double turning(const std::vector<Point>& pts) {
    if (pts.size() < 3) return 0;
    double total = 0, px = 0, py = 0; bool have = false;
    for (size_t i = 1; i < pts.size(); ++i) {
        const double dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
        const double n = std::sqrt(dx*dx + dy*dy);
        if (n < 1e-12) continue;
        const double ux = dx/n, uy = dy/n;
        if (have) total += std::atan2(px*uy - py*ux, px*ux + py*uy);
        px = ux; py = uy; have = true;
    }
    return std::fabs(total);
}

// Rigid-place `src` (optionally mirrored about its own x axis) so src[0] lands on
// `anchor` and its start tangent points along `dir`, then spin it by `extra` rad.
std::vector<Point> place(std::vector<Point> src, bool mirror, Point anchor,
                         double dirAng, double extra) {
    if (src.size() < 2) return src;
    if (mirror) for (auto& p : src) p.y = -p.y;
    const double a0 = std::atan2(src[1].y - src[0].y, src[1].x - src[0].x);
    const double rot = dirAng - a0 + extra;
    const double c = std::cos(rot), s = std::sin(rot);
    const Point o = src[0];
    std::vector<Point> out;
    out.reserve(src.size());
    for (const auto& p : src) {
        const double x = p.x - o.x, y = p.y - o.y;
        out.push_back(Point{anchor.x + x*c - y*s, anchor.y + x*s + y*c});
    }
    return out;
}

struct Poly {
    std::vector<Point> pts;
    std::string stroke;
    double w = 0.8;
    std::string dash;
};

void writeSvg(const std::string& path, const std::string& title,
              const std::string& subtitle, const std::vector<Poly>& polys,
              const std::vector<std::string>& notes) {
    double x0 = 1e18, y0 = 1e18, x1 = -1e18, y1 = -1e18;
    for (const auto& q : polys) for (const auto& p : q.pts) {
        x0 = std::min(x0, p.x); y0 = std::min(y0, p.y);
        x1 = std::max(x1, p.x); y1 = std::max(y1, p.y);
    }
    const double pad = 24, topBar = 54, botBar = 20 + 16 * static_cast<double>(notes.size());
    // Fit the TEXT too, not just the drawing — a clipped caption is not proof.
    double textW = title.size() * 7.6;
    textW = std::max(textW, subtitle.size() * 4.7);
    for (const auto& n : notes) textW = std::max(textW, n.size() * 4.5);
    const double w = std::max((x1 - x0) + 2 * pad, textW + 2 * pad);
    const double h = (y1 - y0) + 2 * pad + topBar + botBar;
    std::ofstream f(path);
    f << "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" << (w * 3)
      << "\" height=\"" << (h * 3) << "\" viewBox=\"0 0 " << w << ' ' << h << "\">\n";
    f << "<rect width=\"100%\" height=\"100%\" fill=\"#fbfaf7\"/>\n";
    f << "<text x=\"" << pad << "\" y=\"22\" font-family=\"Helvetica,Arial\" font-size=\"14\""
      << " fill=\"#111\">" << title << "</text>\n";
    f << "<text x=\"" << pad << "\" y=\"40\" font-family=\"Helvetica,Arial\" font-size=\"9\""
      << " fill=\"#666\">" << subtitle << "</text>\n";
    f << "<g transform=\"translate(" << (pad - x0) << ',' << (pad + topBar - y0) << ")\">\n";
    for (const auto& q : polys) {
        if (q.pts.size() < 2) continue;
        f << "<polyline fill=\"none\" stroke=\"" << q.stroke << "\" stroke-width=\"" << q.w
          << "\" stroke-linejoin=\"round\"";
        if (!q.dash.empty()) f << " stroke-dasharray=\"" << q.dash << '"';
        f << " points=\"";
        for (const auto& p : q.pts) f << p.x << ',' << p.y << ' ';
        f << "\"/>\n";
    }
    f << "</g>\n";
    double ty = pad + topBar + (y1 - y0) + 18;
    for (const auto& n : notes) {
        f << "<text x=\"" << pad << "\" y=\"" << ty
          << "\" font-family=\"Helvetica,Arial\" font-size=\"8.5\" fill=\"#333\">" << n
          << "</text>\n";
        ty += 16;
    }
    f << "</svg>\n";
}

std::string mm(double v, int d = 2) {
    char b[64]; std::snprintf(b, sizeof(b), "%.*f", d, v); return b;
}

} // namespace

int main(int argc, char** argv) {
    const std::string outDir = argc > 1 ? argv[1] : ".";
    const std::string tag = argc > 2 ? argv[2] : "shot";

    const BodyMeasurementsSnapshot body{90, 72, 98, 38, 40, 58, 36};
    GarmentSpec spec;
    spec.garment = GarmentType::Top;
    spec.neckline = Neckline::Crew;
    spec.shaping = Shaping::Dart;
    spec.edgeFinish = static_cast<int>(EdgeFinish::Facing);
    spec.collarType = static_cast<int>(CollarType::PeterPan);
    spec.collarEdge = static_cast<int>(CollarEdge::Round);
    const DraftedPattern d = GarmentDrafter::draft(spec, body);

    const PatternPiece* collar = findByName(d, "Collar");
    const PatternPiece* front = findByName(d, "Front");
    const PatternPiece* back = findByName(d, "Back");
    if (!collar || !front || !back) { std::fprintf(stderr, "pieces missing\n"); return 2; }

    const std::vector<PathCommand> neckCmds{collar->commands[0], collar->commands[1]};
    const std::vector<Point> neck = walk(neckCmds, 256);
    const std::vector<Point> outline = walk(collar->commands, 96);
    const double neckLen = pathLength(neckCmds);

    // sagitta about the neck edge's own chord
    const Point A = neck.front(), B = neck.back();
    const double cx = B.x - A.x, cy = B.y - A.y;
    const double clen = std::hypot(cx, cy);
    double sag = 0; Point apex = A;
    for (const auto& p : neck) {
        const double s = ((p.x-A.x)*cy - (p.y-A.y)*cx) / clen;
        if (std::fabs(s) > std::fabs(sag)) { sag = s; apex = p; }
    }
    Point apexFoot = A;
    {   // foot of the apex on the chord
        const double t = ((apex.x-A.x)*cx + (apex.y-A.y)*cy) / (clen*clen);
        apexFoot = Point{A.x + t*cx, A.y + t*cy};
    }

    // ---- PANEL A: the collar piece on its own ------------------------------
    {
        std::vector<Poly> polys;
        polys.push_back({outline, "#222", 0.7, ""});
        polys.push_back({neck, "#c0392b", 2.0, ""});
        polys.push_back({{A, B}, "#888", 0.6, "3 2"});
        polys.push_back({{apexFoot, apex}, "#c0392b", 0.9, "2 1.5"});
        writeSvg(outDir + "/" + tag + "-parca.svg",
                 "F-K " + tag + " — Peter Pan yaka parcasi (yarim, CB katta)",
                 "kirmizi = boyun (dikis) kenari · gri kesikli = kendi kirisi · "
                 "kirmizi kesikli = sagitta",
                 polys,
                 {"boyun kenari uzunlugu " + mm(neckLen, 4) + " mm  (yaka cizgisinin yarisi)",
                  "kiris " + mm(clen) + " mm · SAGITTA " + mm(std::fabs(sag), 3) + " mm",
                  "sagitta 0 ise boyun kenari DUZ CIZGIDIR -> yaka yatmaz, band gibi kalkar"});
    }

    // ---- PANEL B: the collar sewn onto the garment's own neckline ----------
    {
        const std::vector<Point> bk = walk(necklineRun(*back), 256);   // CB -> shoulder
        std::vector<Point> fr = walk(necklineRun(*front), 256);        // CF -> shoulder
        std::vector<Point> frRev(fr.rbegin(), fr.rend());              // shoulder -> CF

        // Shoulder seam = the command that leaves the neck point. Measured HERE,
        // not asked of collar.cpp, so this one file compiles unchanged against
        // both the ONCE (HEAD) and SONRA engines.
        double shoulderMM = 0;
        {
            const auto& c = front->commands;
            const size_t runN = necklineRun(*front).size();  // move + runN-1 cmds
            if (runN >= 2 && runN < c.size()) {
                std::vector<PathCommand> seg{PathCommand::move(c[runN - 1].to), c[runN]};
                shoulderMM = pathLength(seg);
            }
        }
        const double alpha = shoulderMM > 1 ? 20.0 / shoulderMM : 0.0;

        // Continue the back neckline's end tangent, then close the 2 cm shoulder
        // overlap by spinning the front back by alpha. The front is mirrored when
        // it is joined at the shoulder; pick the handedness whose combined curve
        // TURNS MORE (the two necklines ring the same hole the same way, so the
        // right choice is the one where their turnings add, not cancel).
        const Point anchor = bk.back();
        const double dirAng = std::atan2(bk.back().y - bk[bk.size()-2].y,
                                         bk.back().x - bk[bk.size()-2].x);
        auto assemble = [&](bool mirror, double extra) {
            std::vector<Point> ph = place(frRev, mirror, anchor, dirAng, extra);
            std::vector<Point> seam = bk;
            for (size_t i = 1; i < ph.size(); ++i) seam.push_back(ph[i]);
            return seam;
        };
        // 1) handedness: the joined necklines must ring the hole the SAME way,
        //    i.e. their turnings add -> the mirror choice that turns MORE.
        const bool mir = turning(assemble(true, 0.0)) > turning(assemble(false, 0.0));
        // 2) the 2 cm overlap CLOSES the draft, so it must REDUCE that turning.
        const double ext = turning(assemble(mir, +alpha)) < turning(assemble(mir, -alpha))
                               ? +alpha : -alpha;
        std::vector<Point> bestSeam = assemble(mir, ext);
        const double bestTurn = turning(bestSeam);

        // Lay the collar's neck edge on that seam: same start point, same CHORD
        // direction (the fair overlay — a start-tangent overlay would let a tiny
        // angle at one end bloom into a big offset at the other). Nothing is
        // scaled: both curves are the same length, so if they agree, they agree.
        const double seamDir = std::atan2(bestSeam.back().y - bestSeam[0].y,
                                          bestSeam.back().x - bestSeam[0].x)
                             - std::atan2(neck.back().y - neck[0].y,
                                          neck.back().x - neck[0].x)
                             + std::atan2(neck[1].y - neck[0].y, neck[1].x - neck[0].x);
        std::vector<Point> collarSeam = place(neck, false, bestSeam[0], seamDir, 0.0);
        std::vector<Point> collarBody = place(outline, false, bestSeam[0], seamDir, 0.0);
        // place() aligns on outline[0..1]; the outline starts on the neck edge, so
        // re-place the whole outline with the neck edge's own transform instead.
        {
            const double a0 = std::atan2(neck[1].y - neck[0].y, neck[1].x - neck[0].x);
            const double rot = seamDir - a0, c = std::cos(rot), s = std::sin(rot);
            collarBody.clear();
            for (const auto& p : outline) {
                const double x = p.x - neck[0].x, y = p.y - neck[0].y;
                collarBody.push_back(Point{bestSeam[0].x + x*c - y*s,
                                           bestSeam[0].y + x*s + y*c});
            }
        }

        double gap = 0;   // worst distance from the collar seam to the garment seam
        for (const auto& p : collarSeam) {
            double best = 1e18;
            for (const auto& q : bestSeam) best = std::min(best, std::hypot(p.x-q.x, p.y-q.y));
            gap = std::max(gap, best);
        }

        std::vector<Poly> polys;
        polys.push_back({collarBody, "#999", 0.6, ""});
        polys.push_back({bestSeam, "#1a6b3c", 2.2, ""});
        polys.push_back({collarSeam, "#c0392b", 1.4, "3 2"});
        polys.push_back({{bestSeam.front(), bestSeam.back()}, "#bbb", 0.5, "2 2"});
        writeSvg(outDir + "/" + tag + "-dikilmis.svg",
                 "F-K " + tag + " — yaka GIYSIYE dikilmis (yaka cizgisi ustunde)",
                 "yesil = giysinin kendi yaka cizgisi (arka CB->omuz + on omuz->CF, "
                 "omuzda 2 cm bindirilmis) · kirmizi kesikli = yakanin boyun kenari",
                 polys,
                 {"giysi yaka cizgisi donmesi " + mm(bestTurn * 57.2957795) +
                      " deg · yaka boyun kenari donmesi " + mm(turning(collarSeam) * 57.2957795) + " deg",
                  "en kotu ayrilma " + mm(gap, 3) + " mm  (yaka cizgisinden yakanin boyun kenarina)",
                  "duz bir boyun kenari burada yesil egrinin kirisi boyunca gider ve "
                  "ayrilma sagitta kadar buyur"});

        std::printf("%s: neckLen %.4f mm · sagitta %.4f mm · garment neck turn %.3f deg"
                    " · collar seam turn %.3f deg · worst gap %.4f mm\n",
                    tag.c_str(), neckLen, std::fabs(sag), bestTurn * 57.2957795,
                    turning(collarSeam) * 57.2957795, gap);
    }
    return 0;
}
