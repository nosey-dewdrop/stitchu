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
// `edgeLabel` names the edge in the measured sentence: the same grain-drop
// serves the garment hem ("etek ucu") and the sleeve wrist ("kol agzi").
EditStep extendOne(PatternPiece& piece, double mm, const char* opName = "op.extend",
                   const char* edgeLabel = "etek ucu") {
    EditStep st;
    st.op = opName;
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
        st.refusal = std::string("parca bir kontur tasimiyor; ") + edgeLabel + " SORULAMAZ";
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
    st.reason = std::string(opName) + ": " + edgeLabel + " GRAIN yonunde " + num(mm, 4) +
                " mm asagi tasindi. Kenarin kendi yay uzunlugu " +
                num(st.hemLenBeforeMM, 4) + " -> " + num(st.hemLenAfterMM, 4) +
                " mm (TASIMA, sekil degismedi); parcanin boyu " +
                num(st.heightBeforeMM, 4) + " -> " + num(st.heightAfterMM, 4) +
                " mm; cevre " + num(st.perimeterBeforeMM, 4) + " -> " +
                num(st.perimeterAfterMM, 4) + " mm. Uzatma YAN DIKISI degil GRAIN'i "
                "izler: yan dikisi izlemek klos'u da buyuturdu, yani 'uzat' istegi "
                "sessizce 'genislet' olurdu (§0B md.3, en kisitlayici okuma).";
    return st;
}

// ---- op.shorten on ONE piece -----------------------------------------------
// NOT extendOne with a minus sign. Shortening REMOVES a grain-parallel band at
// the hem: the two edges adjacent to the hem are trimmed back ALONG THEIR OWN
// DRAWN DIRECTION (so an A-line's flare angle survives and its sweep narrows,
// which is what folding out a lengthen/shorten line does on paper), and the hem
// edge itself is carried up by the affine map that sends its two old endpoints
// to the two trimmed ones. Exact for line-adjacent hems; a curve-adjacent hem
// is REFUSED BY NAME rather than approximated.
EditStep shortenOne(PatternPiece& piece, double mm) {
    EditStep st;
    st.op = "op.shorten";
    st.piece = piece.name;
    st.requestedMM = mm;
    if (!(mm > 0.0)) {
        st.refusal = "kisaltma mm'si pozitif degil; negatif kisaltma UZATMAKTIR ve o ayri bir "
                     "operatordur (op.extend), sessizce cevrilmez — uzatmak icin uzat alanini kullanin";
        st.reason = "KISALTILMADI: istenen " + num(mm, 4) + " mm.";
        return st;
    }
    const int h = hemCommandIndex(piece);
    if (h < 1 || static_cast<std::size_t>(h) + 1 >= piece.commands.size()) {
        st.refusal = "etek ucunun iki yaninda kirpilacak kenar yok (kontur cok kisa); "
                     "bu parca kisaltilamaz";
        st.reason = "KISALTILMADI: komsu kenar bulunamadi.";
        return st;
    }
    const PathCommand& prev = piece.commands[h - 1];
    const PathCommand& next = piece.commands[h + 1];
    if (prev.type != CmdType::Line || next.type != CmdType::Line) {
        st.refusal = "etek ucuna komsu kenarlardan biri duz cizgi degil (egri); kirpma noktasi "
                     "egri uzerinde COZULMEDEN kisaltma yapilmaz — once etek stilini duz kenarli "
                     "bir stile alin ya da daha kucuk bir boy secin";
        st.reason = "KISALTILMADI: komsu kenar egri.";
        return st;
    }
    const Point P = startOf(piece.commands, h - 1);  // prev line runs P -> A
    const Point A = prev.to;                          // hem start
    const Point B = piece.commands[h].to;             // hem end; next line runs B -> Q
    const Point Q = next.to;
    const double dropA = A.y - P.y;
    const double riseB = B.y - Q.y;
    if (!(dropA > mm) || !(riseB > mm)) {
        st.refusal = "istenen kisaltma komsu kenarin kendi dusumunden buyuk (yan " +
                     num(dropA, 4) + " mm, on/arka orta " + num(riseB, 4) + " mm, istenen " +
                     num(mm, 4) + " mm); bu kadar kisaltmak parcayi yok eder — daha kucuk bir "
                     "mm isteyin";
        st.reason = "KISALTILMADI: olculen sinir asildi.";
        return st;
    }
    st.hemCmdIndex = h;
    st.hemLenBeforeMM = cmdLength(A, piece.commands[h]);
    st.perimeterBeforeMM = perimeterOf(piece.commands);
    st.heightBeforeMM = boundingBox(piece.commands).height;

    // Trim points, ON the two drawn lines (vertical parameterisation is exact
    // because both guards above force a strictly descending / ascending line).
    const double tA = mm / dropA;
    const Point A2{A.x + (P.x - A.x) * tA, A.y - mm};
    const double tB = mm / riseB;
    const Point B2{B.x + (Q.x - B.x) * tB, B.y - mm};

    piece.commands[h - 1].to = A2;
    PathCommand& hem = piece.commands[h];
    const double spanX = B.x - A.x;
    const auto mapX = [&](double x) {
        if (std::abs(spanX) < 1e-9) return x + (A2.x - A.x);
        return A2.x + (x - A.x) * (B2.x - A2.x) / spanX;
    };
    if (hem.type == CmdType::Curve) {
        hem.cp1 = Point{mapX(hem.cp1.x), hem.cp1.y - mm};
        hem.cp2 = Point{mapX(hem.cp2.x), hem.cp2.y - mm};
    }
    hem.to = B2;

    st.hemLenAfterMM = cmdLength(A2, hem);
    st.perimeterAfterMM = perimeterOf(piece.commands);
    st.heightAfterMM = boundingBox(piece.commands).height;
    st.applied = true;
    st.writtenBack = true;
    st.reason = "op.shorten: etek ucu " + num(mm, 4) +
                " mm yukari alindi; iki komsu dikis kendi CIZILI dogrultusunda kirpildi "
                "(yani A-line'in aci/kloşu korunur, etek agzi kendiliginden daralir). Etek ucu "
                "yay uzunlugu " + num(st.hemLenBeforeMM, 4) + " -> " + num(st.hemLenAfterMM, 4) +
                " mm; parca boyu " + num(st.heightBeforeMM, 4) + " -> " +
                num(st.heightAfterMM, 4) + " mm; cevre " + num(st.perimeterBeforeMM, 4) +
                " -> " + num(st.perimeterAfterMM, 4) + " mm.";
    return st;
}

// ---- op.neckDeepen on ONE front piece ---------------------------------------
// The CF neck point is the outline's own MOVE anchor (the front bodice is drawn
// from the CF neck point, round the neck to the shoulder, and the closing CF
// edge returns to that same point — both facts are CHECKED below, not assumed).
// Deepening moves that anchor down the fold by mm; the neck curve's CF-side
// control point moves with it so the curve still meets the fold at the same
// angle, and the shoulder end does not move at all.
EditStep neckDeepenOne(PatternPiece& piece, double mm) {
    EditStep st;
    st.op = "op.neckDeepen";
    st.piece = piece.name;
    st.requestedMM = mm;
    if (!(mm > 0.0)) {
        st.refusal = "derinlestirme mm'si pozitif degil; yakayi YUKSELTMEK ayri bir islemdir ve "
                     "sessizce yapilmaz — oyugu kucultmek icin neckline eksenini degistirin";
        st.reason = "DERINLESTIRILMEDI: istenen " + num(mm, 4) + " mm.";
        return st;
    }
    if (piece.commands.size() < 4 || piece.commands[0].type != CmdType::Move) {
        st.refusal = "parca konturu MOVE ile baslamiyor; CF yaka noktasi nesneden okunamiyor";
        st.reason = "DERINLESTIRILMEDI: kontur okunamadi.";
        return st;
    }
    // Last drawn command (before Close): must return to the move anchor.
    int L = -1;
    for (int i = static_cast<int>(piece.commands.size()) - 1; i >= 1; --i)
        if (piece.commands[i].type != CmdType::Close) { L = i; break; }
    const Point M = piece.commands[0].to;
    if (L < 2 || std::abs(piece.commands[L].to.x - M.x) > 1e-6 ||
        std::abs(piece.commands[L].to.y - M.y) > 1e-6) {
        st.refusal = "kontur CF yaka noktasina kapanmiyor (son kenar " +
                     num(piece.commands[L < 0 ? 0 : L].to.x, 4) + "," +
                     num(piece.commands[L < 0 ? 0 : L].to.y, 4) + " != " + num(M.x, 4) + "," +
                     num(M.y, 4) + "); bu cizimde yaka derinlestirme desteklenmiyor";
        st.reason = "DERINLESTIRILMEDI: CF kapanisi bulunamadi.";
        return st;
    }
    PathCommand& neck = piece.commands[1];
    if (neck.type != CmdType::Curve && neck.type != CmdType::Line) {
        st.refusal = "ilk kenar yaka oyugu olarak okunamadi (ne egri ne cizgi)";
        st.reason = "DERINLESTIRILMEDI: yaka kenari yok.";
        return st;
    }
    // Depth room, MEASURED on the CF edge itself: how far down the fold the
    // neck point may travel before it runs into the CF edge's own geometry.
    PathCommand& cf = piece.commands[L];
    const double room = (cf.type == CmdType::Curve ? cf.cp2.y : startOf(piece.commands, L).y) - M.y;
    if (!(mm < room)) {
        st.refusal = "istenen derinlik CF kenarinin olculen payindan buyuk (" + num(mm, 4) +
                     " mm istendi, pay " + num(room, 4) + " mm); yaka govdeye tasar — daha "
                     "kucuk bir mm isteyin";
        st.reason = "DERINLESTIRILMEDI: olculen sinir asildi.";
        return st;
    }
    st.cfDepthBeforeMM = M.y;
    st.neckArcBeforeMM = cmdLength(M, neck);
    st.perimeterBeforeMM = perimeterOf(piece.commands);

    piece.commands[0].to.y += mm;
    if (neck.type == CmdType::Curve) neck.cp1.y += mm;  // CF tangent travels with the point
    cf.to.y += mm;

    st.cfDepthAfterMM = piece.commands[0].to.y;
    st.neckArcAfterMM = cmdLength(piece.commands[0].to, neck);
    st.perimeterAfterMM = perimeterOf(piece.commands);
    st.applied = true;
    st.writtenBack = true;
    st.reason = "op.neckDeepen: CF yaka noktasi kumas katinda " + num(mm, 4) +
                " mm asagi alindi (" + num(st.cfDepthBeforeMM, 4) + " -> " +
                num(st.cfDepthAfterMM, 4) + " mm); omuz ucu HIC kimildamadi, egrinin CF "
                "tegeti noktayla birlikte tasindi. Yarim yaka yayi " +
                num(st.neckArcBeforeMM, 4) + " -> " + num(st.neckArcAfterMM, 4) + " mm.";
    return st;
}

// The front piece that CARRIES the neckline, priority order — the same
// name-for-name discipline as kHemHosts above.
const char* const kNeckHostsFront[] = {
    "Bodice Front", "Top Center Front", "Top Front", "Front Body"};

// Sleeve pieces, by their drafted names (sleeve.cpp:249-252 + cap).
const char* const kSleeveHosts[] = {
    "Sleeve", "Balloon Sleeve", "Puff Sleeve", "Gathered-Head Sleeve"};

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

    // ---- op.shorten ------------------------------------------------------
    if (spec.editShortenMM != 0.0) {
        const int fi = findPieceIndex(pattern, kHemHostsFront,
                                      sizeof kHemHostsFront / sizeof kHemHostsFront[0]);
        const int bi = findPieceIndex(pattern, kHemHostsBack,
                                      sizeof kHemHostsBack / sizeof kHemHostsBack[0]);
        if (fi < 0 && bi < 0) {
            EditStep st;
            st.op = "op.shorten";
            st.piece = "(yok)";
            st.requestedMM = spec.editShortenMM;
            st.refusal = "bu kalipta etek ucunu tasiyan bir parca YOK (ne etek ne govde) — "
                         "kisaltilacak kenar nesnenin kendisinden okunamiyor";
            st.reason = "KISALTILMADI: ev sahibi parca bulunamadi.";
            prog.refused++;
            prog.steps.push_back(st);
        } else {
            // FRONT and BACK are shortened by the SAME mm, or the side seams
            // stop matching — the same law op.extend already carries.
            for (int idx : {fi, bi}) {
                if (idx < 0) continue;
                EditStep st = shortenOne(pattern.pieces[idx], spec.editShortenMM);
                if (st.applied) prog.applied++; else prog.refused++;
                prog.steps.push_back(st);
            }
        }
    }

    // ---- op.sleeveExtend -------------------------------------------------
    if (spec.editSleeveExtendMM != 0.0) {
        const int si = findPieceIndex(pattern, kSleeveHosts,
                                      sizeof kSleeveHosts / sizeof kSleeveHosts[0]);
        if (si < 0) {
            EditStep st;
            st.op = "op.sleeveExtend";
            st.piece = "(yok)";
            st.requestedMM = spec.editSleeveExtendMM;
            st.refusal = "bu kalipta kol YOK — uzatilacak kol agzi nesnenin kendisinden "
                         "okunamiyor; once bir kol secin (sleeveStyle: straight ya da balloon)";
            st.reason = "UZATILMADI: kol parcasi bulunamadi.";
            prog.refused++;
            prog.steps.push_back(st);
        } else {
            EditStep st = extendOne(pattern.pieces[si], spec.editSleeveExtendMM,
                                    "op.sleeveExtend", "kol agzi");
            if (st.applied) prog.applied++; else prog.refused++;
            prog.steps.push_back(st);
        }
    }

    // ---- op.neckDeepen ---------------------------------------------------
    if (spec.editNeckDeepenMM != 0.0) {
        EditStep st;
        // A collared or faced neckline carries a SECOND piece drafted off the
        // old curve; deepening the hole without redrafting that piece would
        // ship two parts that no longer sew together. Refused BY NAME, with the
        // next step in the sentence (no silent mismatch).
        std::string blocker;
        for (const auto& pc : pattern.pieces)
            if (pc.name.find("Collar") != std::string::npos ||
                pc.name.find("Neck Facing") != std::string::npos) { blocker = pc.name; break; }
        const int ni = findPieceIndex(pattern, kNeckHostsFront,
                                      sizeof kNeckHostsFront / sizeof kNeckHostsFront[0]);
        if (!blocker.empty()) {
            st.op = "op.neckDeepen";
            st.piece = blocker;
            st.requestedMM = spec.editNeckDeepenMM;
            st.refusal = "yakada '" + blocker + "' parcasi var; oyuk derinlesince o parca eski "
                         "egriye gore kesilmis kalir ve ikisi dikilemez — once collarType/"
                         "edgeFinish'i kapatin (bias binding'e donun), sonra derinlestirin";
            st.reason = "DERINLESTIRILMEDI: yaka parcasi engeli.";
            prog.refused++;
            prog.steps.push_back(st);
        } else if (ni < 0) {
            st.op = "op.neckDeepen";
            st.piece = "(yok)";
            st.requestedMM = spec.editNeckDeepenMM;
            st.refusal = "bu kalipta yakayi tasiyan bir on govde parcasi YOK — derinlestirilecek "
                         "oyuk nesnenin kendisinden okunamiyor (etek-tek kalipta yaka yoktur)";
            st.reason = "DERINLESTIRILMEDI: ev sahibi parca bulunamadi.";
            prog.refused++;
            prog.steps.push_back(st);
        } else {
            st = neckDeepenOne(pattern.pieces[ni], spec.editNeckDeepenMM);
            if (st.applied) {
                // The bias binding strip is cut to the MEASURED edge; the edge
                // just grew, so the strip grows by the same measured amount
                // (x2: the drawn front is half a fold). Appended to the cut
                // note in words — a lengthened strip with an old total would be
                // a silent lie on the cutting table.
                const double fold =
                    pattern.pieces[ni].cutInstruction.find("on fold") != std::string::npos
                        ? 2.0 : 1.0;
                const double delta = (st.neckArcAfterMM - st.neckArcBeforeMM) * fold;
                for (auto& pc : pattern.pieces) {
                    if (pc.name != "Bias binding (neckline)") continue;
                    double maxX = 0.0;
                    for (const auto& c : pc.commands)
                        if (c.type != CmdType::Close) maxX = std::max(maxX, c.to.x);
                    for (auto& c : pc.commands)
                        if (c.type != CmdType::Close && std::abs(c.to.x - maxX) < 1e-6)
                            c.to.x += delta;
                    for (auto& c : pc.markings)
                        if (c.type != CmdType::Close && std::abs(c.to.x - maxX) < 1e-6)
                            c.to.x += delta;
                    pc.cutInstruction += " | op.neckDeepen: strip lengthened by " +
                                         num(delta, 1) + " mm (measured off the deepened "
                                         "neck curve); the totals above are superseded";
                    st.bindingDeltaMM = delta;
                    break;
                }
                st.reason += st.bindingDeltaMM != 0.0
                    ? " Bias serit ayni olcumle " + num(st.bindingDeltaMM, 4) + " mm uzatildi."
                    : " (Bu kalipta bias yaka seridi yok; uzatilacak serit de yok.)";
                prog.applied++;
            } else {
                prog.refused++;
            }
            prog.steps.push_back(st);
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
    o << "  \"kaynak\": \"engine/src/patternedit.cpp — op.extend / op.shorten / "
         "op.sleeveExtend / op.neckDeepen / op.attach INDIRILEN kalibin uzerinde kosar. "
         "Opt-in: bes edit alani da 0 iken bu dosya HIC KOSMAZ ve golden bayt-birebirdir "
         "(RULES 4).\",\n";
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
        if (s.op == "op.neckDeepen") {
            o << ",\n     \"istenen_mm\": " << num(s.requestedMM, 6)
              << ", \"cf_derinlik_once_mm\": " << num(s.cfDepthBeforeMM, 6)
              << ", \"cf_derinlik_sonra_mm\": " << num(s.cfDepthAfterMM, 6)
              << ",\n     \"yarim_yaka_yayi_once_mm\": " << num(s.neckArcBeforeMM, 6)
              << ", \"yarim_yaka_yayi_sonra_mm\": " << num(s.neckArcAfterMM, 6)
              << ",\n     \"bias_serit_uzatma_mm\": " << num(s.bindingDeltaMM, 6)
              << ", \"cevre_once_mm\": " << num(s.perimeterBeforeMM, 6)
              << ", \"cevre_sonra_mm\": " << num(s.perimeterAfterMM, 6);
        } else if (s.op == "op.extend" || s.op == "op.shorten" || s.op == "op.sleeveExtend") {
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
