// The edit layer. The header carries the law; this file carries the geometry.
#include "patternedit.hpp"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <sstream>
#include <string>
#include <vector>

#include "tie.hpp"

namespace stitchu {
namespace {

std::string num(double v, int dp = 6) {
    char b[64];
    std::snprintf(b, sizeof b, "%.*f", dp, v);
    return b;
}

std::string quote(const std::string& s) {
    std::string o = "\"";
    for (char c : s) {
        if (c == '"' || c == '\\') o += '\\';
        if (c == '\n') { o += "\\n"; continue; }
        o += c;
    }
    return o + "\"";
}

// The start point of command `i` on a closed-implicit outline: the endpoint of
// the previous non-Close command. Asked of the object, never guessed.
Point startOf(const std::vector<PathCommand>& c, int i) {
    for (int k = i - 1; k >= 0; --k)
        if (c[k].type != CmdType::Close) return c[k].to;
    return c.empty() ? Point{0, 0} : c[0].to;
}

// Arc length of ONE command starting at `from`, with the engine's own
// primitives (flattenCubic at the same 24 steps pathLength uses).
double cmdLength(Point from, const PathCommand& cmd) {
    if (cmd.type == CmdType::Line) return distance(from, cmd.to);
    if (cmd.type == CmdType::Curve) {
        const std::vector<Point> pts = flattenCubic(from, cmd.to, cmd.cp1, cmd.cp2, 24);
        double L = 0.0;
        for (std::size_t i = 1; i < pts.size(); ++i) L += distance(pts[i - 1], pts[i]);
        return L;
    }
    return 0.0;
}

// The whole closed outline's perimeter, measured the same way.
double perimeterOf(const std::vector<PathCommand>& c) {
    double L = 0.0;
    Point cur{0, 0};
    Point sub{0, 0};
    bool have = false;
    for (const auto& cmd : c) {
        if (cmd.type == CmdType::Move) { cur = sub = cmd.to; have = true; continue; }
        if (cmd.type == CmdType::Close) { if (have) L += distance(cur, sub); cur = sub; continue; }
        L += cmdLength(cur, cmd);
        cur = cmd.to;
    }
    return L;
}

// The priority list of pieces that CARRY THE GARMENT'S HEM. Not invented here:
// it is the list `hemflounce.cpp` already walks to find the same edge, copied
// name for name so two blocks cannot disagree about where the hem of a garment
// is. Front first, then back.
const char* const kHemHostsFront[] = {
    "Skirt Front", "Skirt Center Front", "Top Center Front", "Top Front", "Bodice Front"};
const char* const kHemHostsBack[] = {
    "Skirt Back", "Skirt Center Back", "Top Center Back", "Top Back", "Bodice Back"};

int findPieceIndex(const DraftedPattern& p, const char* const* names, std::size_t n) {
    for (std::size_t k = 0; k < n; ++k)
        for (std::size_t i = 0; i < p.pieces.size(); ++i)
            if (p.pieces[i].name == names[k]) return static_cast<int>(i);
    return -1;
}

// A short cross tick, the same glyph tie.cpp stamps, at a MEASURED point.
void crossNotch(std::vector<PathCommand>& into, Point at) {
    into.push_back(PathCommand::move({at.x - 6, at.y}));
    into.push_back(PathCommand::line({at.x + 6, at.y}));
    into.push_back(PathCommand::move({at.x, at.y - 6}));
    into.push_back(PathCommand::line({at.x, at.y + 6}));
}

}  // namespace

int hemCommandIndex(const PatternPiece& piece) {
    int best = -1;
    double bestY = -1e30;
    for (std::size_t i = 0; i < piece.commands.size(); ++i) {
        const PathCommand& c = piece.commands[i];
        if (c.type == CmdType::Close || c.type == CmdType::Move) continue;
        // >= so a flat hem drawn as several segments resolves to its LAST one:
        // the operator then inserts its extension at the two ends of the whole
        // flat run's final segment rather than in the middle of it.
        if (c.to.y >= bestY) { bestY = c.to.y; best = static_cast<int>(i); }
    }
    return best;
}

Point edgeMidpointByArc(Point from, const PathCommand& edge, double* edgeLenMM, double* atMM) {
    const double total = cmdLength(from, edge);
    if (edgeLenMM) *edgeLenMM = total;
    const double half = total / 2.0;
    if (edge.type == CmdType::Line) {
        if (atMM) *atMM = half;
        if (total <= 0.0) return edge.to;
        const double t = half / total;
        return Point{from.x + (edge.to.x - from.x) * t, from.y + (edge.to.y - from.y) * t};
    }
    if (edge.type != CmdType::Curve) {
        if (atMM) *atMM = 0.0;
        return from;
    }
    // WALK the flattened curve; do NOT take t = 0.5. On a curve the parameter
    // midpoint and the ARC midpoint are different points, and the second is the
    // one a sewer's tape measure finds.
    const std::vector<Point> pts = flattenCubic(from, edge.to, edge.cp1, edge.cp2, 24);
    double run = 0.0;
    for (std::size_t i = 1; i < pts.size(); ++i) {
        const double seg = distance(pts[i - 1], pts[i]);
        if (run + seg >= half && seg > 0.0) {
            const double t = (half - run) / seg;
            if (atMM) *atMM = half;
            return Point{pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t,
                         pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t};
        }
        run += seg;
    }
    if (atMM) *atMM = run;
    return edge.to;
}

namespace {

// ---- op.extend on ONE piece ------------------------------------------------
EditStep extendOne(PatternPiece& piece, double mm) {
    EditStep st;
    st.op = "op.extend";
    st.piece = piece.name;
    st.requestedMM = mm;
    if (!(mm > 0.0)) {
        st.refusal = "uzatma mm'si pozitif degil; bir kalibi negatif uzatmak KISALTMAKTIR ve "
                     "bu operator kisaltmaz — ayri bir islemdir, sessizce yapilmaz";
        st.reason = "UZATILMADI: istenen " + num(mm, 4) + " mm.";
        return st;
    }
    const int h = hemCommandIndex(piece);
    if (h < 0) {
        st.refusal = "parca bir kontur tasimiyor; etek ucu SORULAMAZ";
        st.reason = "SORULAMADI: konturda kenar yok.";
        return st;
    }
    const Point A = startOf(piece.commands, h);
    const Point B = piece.commands[h].to;
    st.hemCmdIndex = h;
    st.hemLenBeforeMM = cmdLength(A, piece.commands[h]);
    st.perimeterBeforeMM = perimeterOf(piece.commands);
    st.heightBeforeMM = boundingBox(piece.commands).height;

    std::vector<PathCommand> out;
    out.reserve(piece.commands.size() + 2);
    for (int i = 0; i < h; ++i) out.push_back(piece.commands[i]);
    // (1) drop straight down the GRAIN by exactly mm
    out.push_back(PathCommand::line({A.x, A.y + mm}));
    // (2) the hem edge itself, translated — same shape, same arc length
    PathCommand hem = piece.commands[h];
    hem.to.y += mm;
    if (hem.type == CmdType::Curve) { hem.cp1.y += mm; hem.cp2.y += mm; }
    out.push_back(hem);
    // (3) back UP to B, so every command after the hem is byte-identical and
    //     every named edge keeps both of its endpoint anchors
    out.push_back(PathCommand::line(B));
    for (std::size_t i = static_cast<std::size_t>(h) + 1; i < piece.commands.size(); ++i)
        out.push_back(piece.commands[i]);
    piece.commands = out;

    st.insertedAMM = cmdLength(A, out[h]);
    st.insertedBMM = cmdLength({B.x, B.y + mm}, out[h + 2]);
    st.hemLenAfterMM = cmdLength({A.x, A.y + mm}, out[h + 1]);
    st.perimeterAfterMM = perimeterOf(piece.commands);
    st.heightAfterMM = boundingBox(piece.commands).height;
    st.applied = true;
    st.writtenBack = true;
    st.reason = "op.extend: etek ucu GRAIN yonunde " + num(mm, 4) +
                " mm asagi tasindi. Etek ucunun kendi yay uzunlugu " +
                num(st.hemLenBeforeMM, 4) + " -> " + num(st.hemLenAfterMM, 4) +
                " mm (TASIMA, sekil degismedi); parcanin boyu " +
                num(st.heightBeforeMM, 4) + " -> " + num(st.heightAfterMM, 4) +
                " mm; cevre " + num(st.perimeterBeforeMM, 4) + " -> " +
                num(st.perimeterAfterMM, 4) + " mm. Uzatma YAN DIKISI degil GRAIN'i "
                "izler: yan dikisi izlemek klos'u da buyuturdu, yani 'uzat' istegi "
                "sessizce 'genislet' olurdu (§0B md.3, en kisitlayici okuma).";
    return st;
}

}  // namespace

EditProgram runEditProgram(DraftedPattern& pattern, const GarmentSpec& spec,
                           const BodyMeasurementsSnapshot& body) {
    (void)body;
    EditProgram prog;
    prog.piecesBefore = pattern.pieces.size();
    prog.piecesAfter = pattern.pieces.size();

    // ---- op.extend -------------------------------------------------------
    if (spec.editExtendMM != 0.0) {
        const int fi = findPieceIndex(pattern, kHemHostsFront,
                                      sizeof kHemHostsFront / sizeof kHemHostsFront[0]);
        const int bi = findPieceIndex(pattern, kHemHostsBack,
                                      sizeof kHemHostsBack / sizeof kHemHostsBack[0]);
        if (fi < 0 && bi < 0) {
            EditStep st;
            st.op = "op.extend";
            st.piece = "(yok)";
            st.requestedMM = spec.editExtendMM;
            st.refusal = "bu kalipta etek ucunu tasiyan bir parca YOK (ne etek ne govde) — "
                         "uzatilacak kenar nesnenin kendisinden okunamiyor";
            st.reason = "UZATILMADI: ev sahibi parca bulunamadi.";
            prog.refused++;
            prog.steps.push_back(st);
        } else {
            // FRONT and BACK are lengthened by the SAME mm, or the side seams
            // stop matching. Both steps are reported, each with its own numbers.
            for (int idx : {fi, bi}) {
                if (idx < 0) continue;
                EditStep st = extendOne(pattern.pieces[idx], spec.editExtendMM);
                if (st.applied) prog.applied++; else prog.refused++;
                prog.steps.push_back(st);
            }
        }
    }

    // ---- op.attach -------------------------------------------------------
    const AttachComponent comp = static_cast<AttachComponent>(spec.editAttach);
    if (comp != AttachComponent::None) {
        EditStep st;
        st.op = "op.attach";
        const int hi = findPieceIndex(pattern, kHemHostsFront,
                                      sizeof kHemHostsFront / sizeof kHemHostsFront[0]);
        if (hi < 0) {
            st.piece = "(yok)";
            st.refusal = "fiyonkun tutturulacagi ON parca YOK; tutturma noktasi dikis "
                         "grafiginden DUSMUYOR ve elle YAZILMIYOR (§3.10)";
            st.reason = "TAKILMADI: ev sahibi parca bulunamadi.";
            prog.refused++;
            prog.steps.push_back(st);
        } else {
            st.piece = pattern.pieces[hi].name;
            const int h = hemCommandIndex(pattern.pieces[hi]);
            if (h < 0) {
                st.refusal = "ev sahibi parca bir kontur tasimiyor; tutturma kenari SORULAMAZ";
                st.reason = "TAKILMADI: konturda kenar yok.";
                prog.refused++;
                prog.steps.push_back(st);
            } else {
                const Point from = startOf(pattern.pieces[hi].commands, h);
                double edgeLen = 0.0, at = 0.0;
                const Point anchor =
                    edgeMidpointByArc(from, pattern.pieces[hi].commands[h], &edgeLen, &at);
                st.hostEdgeMM = edgeLen;
                st.anchor = anchor;
                st.anchorAtMM = at;
                st.hostNotchesBefore = static_cast<int>(pattern.pieces[hi].notches.size());
                st.metersBefore = pattern.fabricMeters140;

                // The component: the bow tie.cpp already ships, at tie.cpp's own
                // published finished dimensions. No new patternmaking number.
                const TieBlock::Finished f = TieBlock::finishedBow();
                PatternPiece bow = TieBlock::strip(
                    "Bow (fiyonk, op.attach)",
                    "attach at the marked notch on " + pattern.pieces[hi].name +
                        " and knot into a bow",
                    f.widthMM, f.lengthMM, f.count);

                // THE NOTCH PAIR. One tick on the host at the MEASURED anchor,
                // one on the component at ITS attaching edge's own arc midpoint.
                // Two measurements on two different outlines: if this file
                // measured once and copied, the pair would match by typing.
                crossNotch(pattern.pieces[hi].notches, anchor);
                const int bh = hemCommandIndex(bow);
                double bowEdge = 0.0, bowAt = 0.0;
                const Point bowAnchor =
                    bh >= 0 ? edgeMidpointByArc(startOf(bow.commands, bh), bow.commands[bh],
                                                &bowEdge, &bowAt)
                            : Point{0, 0};
                crossNotch(bow.notches, bowAnchor);
                st.componentNotches = static_cast<int>(bow.notches.size());

                const Rect box = boundingBox(bow.commands);
                st.componentAreaMM2 = box.width * box.height;
                st.component = bow.name;
                pattern.pieces.push_back(bow);

                // METREAGE. The component's OWN cut run along the bolt, measured
                // off its bounding box, not a flat constant.
                pattern.fabricMeters140 =
                    roundToPlaces(pattern.fabricMeters140 + box.height / 1000.0, 1);
                st.metersAfter = pattern.fabricMeters140;
                st.hostNotchesAfter = static_cast<int>(pattern.pieces[hi].notches.size());

                pattern.guideSteps.push_back(
                    "Bow (fiyonk): cut the bow rectangle as labelled, fold it in half "
                    "lengthwise right sides together, stitch the long edge and one short "
                    "end, turn right side out and press. Match the cross notch on the bow "
                    "to the cross notch on " + pattern.pieces[hi].name +
                    " and stitch it there, then knot the bow.");

                st.applied = true;
                st.writtenBack = true;
                st.reason = "op.attach: fiyonk " + pattern.pieces[hi].name +
                            " parcasinin etek ucu kenarina takildi. Tutturma noktasi o "
                            "kenarin KENDI yay uzunlugunun yarisinda OLCULDU (" +
                            num(at, 4) + " / " + num(edgeLen, 4) + " mm) — kutu ortasi "
                            "DEGIL, yay ortasi; egri bir etek ucunda ikisi ayri noktadir "
                            "ve elle bir sayi YAZILMADI (§3.10). Yeni parca kesim planina "
                            "girdi, cift centik dustu (" +
                            std::to_string(st.hostNotchesBefore) + " -> " +
                            std::to_string(st.hostNotchesAfter) + " ev sahibinde, " +
                            std::to_string(st.componentNotches) +
                            " fiyonkta) ve metraj " + num(st.metersBefore, 4) + " -> " +
                            num(st.metersAfter, 4) + " m oldu.";
                prog.applied++;
                prog.steps.push_back(st);
            }
        }
    }

    prog.piecesAfter = pattern.pieces.size();
    return prog;
}

std::string editJSON(const EditProgram& prog) {
    std::ostringstream o;
    o << "{\n  \"okuma\": \"edit_programi\",\n";
    o << "  \"kaynak\": \"engine/src/patternedit.cpp — op.extend / op.attach INDIRILEN "
         "kalibin uzerinde kosar. Opt-in: editExtendMM == 0 ve editAttach == 0 iken bu "
         "dosya HIC KOSMAZ ve golden bayt-birebirdir (RULES 4).\",\n";
    o << "  \"parca_once\": " << prog.piecesBefore << ", \"parca_sonra\": " << prog.piecesAfter
      << ",\n";
    o << "  \"uygulanan\": " << prog.applied << ", \"reddedilen\": " << prog.refused << ",\n";
    o << "  \"adimlar\": [\n";
    for (std::size_t i = 0; i < prog.steps.size(); ++i) {
        const EditStep& s = prog.steps[i];
        o << "    {\"op\": " << quote(s.op) << ", \"parca\": " << quote(s.piece)
          << ", \"uygulandi\": " << (s.applied ? "true" : "false")
          << ", \"plana_yazildi\": " << (s.writtenBack ? "true" : "false")
          << ", \"ret_gerekcesi\": " << quote(s.refusal) << ",\n";
        o << "     \"sebep\": " << quote(s.reason);
        if (s.op == "op.extend") {
            o << ",\n     \"istenen_mm\": " << num(s.requestedMM, 6)
              << ", \"etek_ucu_kenar_indeksi\": " << s.hemCmdIndex
              << ",\n     \"etek_ucu_once_mm\": " << num(s.hemLenBeforeMM, 6)
              << ", \"etek_ucu_sonra_mm\": " << num(s.hemLenAfterMM, 6)
              << ",\n     \"boy_once_mm\": " << num(s.heightBeforeMM, 6)
              << ", \"boy_sonra_mm\": " << num(s.heightAfterMM, 6)
              << ",\n     \"cevre_once_mm\": " << num(s.perimeterBeforeMM, 6)
              << ", \"cevre_sonra_mm\": " << num(s.perimeterAfterMM, 6)
              << ",\n     \"eklenen_a_mm\": " << num(s.insertedAMM, 6)
              << ", \"eklenen_b_mm\": " << num(s.insertedBMM, 6);
        } else {
            o << ",\n     \"bilesen\": " << quote(s.component)
              << ", \"ev_sahibi_kenar_mm\": " << num(s.hostEdgeMM, 6)
              << ",\n     \"capa_x\": " << num(s.anchor.x, 6)
              << ", \"capa_y\": " << num(s.anchor.y, 6)
              << ", \"capa_yay_mm\": " << num(s.anchorAtMM, 6)
              << ",\n     \"bilesen_alan_mm2\": " << num(s.componentAreaMM2, 6)
              << ", \"metraj_once\": " << num(s.metersBefore, 4)
              << ", \"metraj_sonra\": " << num(s.metersAfter, 4)
              << ",\n     \"centik_ev_once\": " << s.hostNotchesBefore
              << ", \"centik_ev_sonra\": " << s.hostNotchesAfter
              << ", \"centik_bilesen\": " << s.componentNotches;
        }
        o << "}" << (i + 1 == prog.steps.size() ? "" : ",") << "\n";
    }
    o << "  ]\n}\n";
    return o.str();
}

}  // namespace stitchu
