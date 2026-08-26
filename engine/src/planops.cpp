// The operator program. The header carries the law; this file carries the wire.
#include "planops.hpp"

#include <cmath>
#include <cstdio>
#include <exception>
#include <sstream>
#include <string>
#include <vector>

#include "dartrotate.hpp"
#include "dartsuppress.hpp"
#include "panelsplit.hpp"

namespace stitchu {
namespace {

std::string num(double v, int dp = 6) {
    char b[64];
    std::snprintf(b, sizeof b, "%.*f", dp, v);
    return b;
}

// A contour as [[x,y],...] at ROUND-TRIP precision (borç 66 / K49). %.17g is the
// shortest form guaranteed to read back as the same double, so the gate's
// shoelace runs on the engine's own coordinates rather than on a rounded picture
// of them — the difference matters because the epsilon it is judged against is
// rotate_check's 1e-6 mm² and a 6-decimal print already exceeds it on a
// 500 mm-wide panel.
std::string contourJSON(const std::vector<Vec2>& c) {
    std::string o = "[";
    char b[64];
    for (std::size_t i = 0; i < c.size(); ++i) {
        if (i) o += ",";
        std::snprintf(b, sizeof b, "[%.17g,%.17g]", c[i].x, c[i].y);
        o += b;
    }
    return o + "]";
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

// ⭐ THE TOTAL MAP FROM ONE BOUNDARY TO ITS TWO HALVES.
//
// panelsplit.cpp cuts the closed contour at two of its own vertices lo < hi:
//   piece A = contour[lo .. hi]                       (hi-lo+1 points)
//   piece B = contour[hi .. n-1] ++ contour[0 .. lo]  (n-hi+lo+1 points)
// Both are stored closed-implicitly, so each one's LAST edge is the cut.
//
// Old edge e joins contour[e] -> contour[e+1 mod n]. Every such edge is an edge
// of exactly one piece, and this says which. Getting it wrong would not crash —
// it would silently sew the waist to the armhole, which is precisely the class
// of bug a plan exists to make impossible. So it is written once, here, and the
// gate re-derives it from the published contours rather than trusting it.
struct EdgeAddr { bool onA = false; std::size_t edge = 0; };

EdgeAddr mapEdge(std::size_t e, std::size_t lo, std::size_t hi, std::size_t n) {
    EdgeAddr a;
    if (e >= lo && e < hi) { a.onA = true; a.edge = e - lo; return a; }
    a.onA = false;
    // B's vertex k is contour[hi + k] for k <= n-1-hi, then contour[k - (n-hi)].
    if (e >= hi) a.edge = e - hi;                 // includes the wrap edge n-1 -> 0
    else a.edge = (n - hi) + e;                   // e < lo
    return a;
}

// The mouth / apex of a dart, ASKED OF THE PANEL. Identical rule to
// tools/suppress-op.cpp's middleColumn(): waist arc k and far arc k are the two
// ends of one ring column, the mouth is the waist end of the middle column, and
// the depth is the engine's own declared fraction read off the plan. No constant
// is copied here (F5-A's HM1 is the reason that sentence is worth writing).
struct Mouth {
    bool ok = false;
    std::size_t waistIdx = 0, farIdx = 0;
    double apexDepthMM = 0.0;
};

Mouth mouthOf(const SeamPlan& plan, const SurfacePanel& p) {
    Mouth m;
    if (p.waistEdges.empty() || p.waistEdges.size() != p.farEdges.size()) return m;
    const std::size_t k = p.waistEdges.size() / 2;
    m.waistIdx = static_cast<std::size_t>(p.waistEdges[k]);
    m.farIdx = static_cast<std::size_t>(p.farEdges[k]);
    if (m.waistIdx >= p.contour.size() || m.farIdx >= p.contour.size()) return m;
    const double colLen = std::hypot(p.contour[m.farIdx].x - p.contour[m.waistIdx].x,
                                     p.contour[m.farIdx].y - p.contour[m.waistIdx].y);
    m.apexDepthMM = plan.opt.bodiceApexFrac * colLen;
    m.ok = true;
    return m;
}

}  // namespace

OpProgram runOperatorProgram(SeamPlan& plan) {
    OpProgram prog;
    SurfacePattern& pat = plan.pattern;
    prog.panelsBefore = pat.panels.size();
    prog.stitchesBefore = pat.stitches.size();

    // ⭐ THE PROGRAM IS TWO PASSES, AND THE ORDER IS A MEASUREMENT, NOT A TASTE.
    //
    // DIVIDE FIRST, THEN SUPPRESS EACH HALF. That is the whole reason a division
    // operator exists next to a suppression one, and split_check's SP8 already
    // measures it: on EU38 the body-following front panel wants 55.1735 deg out
    // through ONE wedge, and after the division the same load falls to
    // 26.8401 + 28.3334 (total conserved). Suppressing the WHOLE panel and then
    // dividing it would take the curvature out twice — suppress-op's
    // `cift_bastirma` row measures what that does: the panel SELF-INTERSECTS
    // (residual deficit 27.8788 deg, 11417 mm2 removed against a 24427 mm2
    // sector, because the second cut eats the first darts' legs).
    //
    // Pass 1 walks a SNAPSHOTTED bound: a piece that came out of a division is
    // not asked to divide itself again. One call of the operator is one division.
    const std::size_t n0 = pat.panels.size();
    for (std::size_t pi = 0; pi < n0; ++pi) {
        // A COPY. This loop writes into pat.panels[pi] and pushes onto
        // pat.panels; a reference would dangle or silently start reading the
        // edited contour halfway through.
        const SurfacePanel whole = pat.panels[pi];
        OpStep sp;
        sp.op = "op.split";
        sp.panel = whole.name;
        SplitReport r;
        try {
            r = splitPanel(whole);
        } catch (const std::exception& e) {
            sp.refusal = std::string("op.split panelin bicimini reddetti: ") + e.what();
            sp.reason = "GECERSIZ PANEL — bolme denenmedi";
        }
        sp.colsN = r.colsN;
        sp.deficitWholeDeg = r.deficitWholeDeg;
        sp.cancelledWholeDeg = r.cancelledWholeDeg;
        if (!r.split) {
            if (sp.refusal.empty()) {
                sp.refusal = r.refusal;
                sp.reason = "BOLUNMEDI: panelin mutlak sutun-deficit profili " +
                            num(r.absColumnSumDeg) + " deg, motorun kendi tabani " +
                            num(splitFloorDeg(), 2) +
                            " deg'in altinda — profil DUZ, hicbir sutun bir kesim yeri "
                            "adlandirmiyor. Kusur degil, olculmus bir CEVAP.";
            }
            prog.refused++;
            prog.steps.push_back(sp);
            continue;
        }

        sp.applied = true;
        sp.writtenBack = true;
        sp.atColumn = r.atColumn;
        sp.atFractionMeasured = r.atFractionMeasured;
        sp.maxCurvatureColumn = r.maxCurvatureColumn;
        sp.maxCurvatureDeg = r.maxCurvatureDeg;
        sp.deficitADeg = r.deficitADeg;
        sp.deficitBDeg = r.deficitBDeg;
        sp.cutLenAMM = r.cutLenAMM;
        sp.cutLenBMM = r.cutLenBMM;
        sp.reason = "op.split: panelin KENDI olculen sutun-deficit profili sutun " +
                    std::to_string(r.atColumn) + "/" + std::to_string(r.colsN) +
                    " adlandirdi (dengeli yuk: " + num(r.deficitADeg) + " deg + " +
                    num(r.deficitBDeg) + " deg = " + num(r.deficitSumDeg) +
                    " deg, KORUNDU). Dikis bu bolmenin iki tarafi; kesir parametresi YOK. "
                    "Maksimum egrilik sutunu " + std::to_string(r.maxCurvatureColumn) + " (" +
                    num(r.maxCurvatureDeg) + " deg) YAN YANA basilir, kesim ona TASINMAZ (K42).";

        const std::size_t n = whole.contour.size();
        const std::size_t lo = std::min(r.cutIdxWaist, r.cutIdxFar);
        const std::size_t hi = std::max(r.cutIdxWaist, r.cutIdxFar);

        SurfacePanel A = whole, B = whole;
        A.name = whole.name + "#a";
        B.name = whole.name + "#b";
        A.contour = r.pieceA;
        B.contour = r.pieceB;
        // Each half carries its OWN measured share of the deficit. Anything that
        // was a property of the WHOLE and is no longer a property of a half is
        // CLEARED rather than copied: a half that inherited the whole's column
        // profile would hand the next consumer a profile that is not its own —
        // the exact fault borç 56 is about.
        A.developDeficitDeg = r.deficitADeg;
        B.developDeficitDeg = r.deficitBDeg;
        A.deficitColumnDeg.clear(); B.deficitColumnDeg.clear();
        A.deficitBandDeg.clear();   B.deficitBandDeg.clear();
        A.deficitGrid3D.clear();    B.deficitGrid3D.clear();
        // ⭐ THE BOUNDARY RUNS ARE CARRIED ONTO THE PIECES, NOT DROPPED. This is
        // what lets op.suppress be asked of a HALF in pass 2 — a piece with no
        // waist/far run could never be asked where a dart's mouth sits. The map
        // is the same total one the stitches use, so a piece's runs ARE the
        // whole's runs restricted: nothing is re-derived, no second topology is
        // born. `waistRuns` IS dropped: it is a GROUPING whose breaks fall at the
        // opposing layer's dart columns, and that grouping restricted to half a
        // panel is not that grouping. Dropped rather than half-copied.
        A.waistRuns.clear(); B.waistRuns.clear();
        auto carry = [&](const std::vector<int>& run, std::vector<int>& toA,
                         std::vector<int>& toB) {
            toA.clear(); toB.clear();
            for (int e : run) {
                const EdgeAddr a = mapEdge(static_cast<std::size_t>(e), lo, hi, n);
                (a.onA ? toA : toB).push_back(static_cast<int>(a.edge));
            }
        };
        carry(whole.waistEdges, A.waistEdges, B.waistEdges);
        carry(whole.farEdges, A.farEdges, B.farEdges);
        carry(whole.seam0Edges, A.seam0Edges, B.seam0Edges);
        carry(whole.seam1Edges, A.seam1Edges, B.seam1Edges);

        pat.panels[pi] = A;
        pat.panels.push_back(B);
        const std::size_t bi = pat.panels.size() - 1;
        sp.pieceA = A.name;
        sp.pieceB = B.name;

        // every seam that touched the whole panel is RE-ADDRESSED, not dropped
        for (SurfaceStitch& s : pat.stitches) {
            if (static_cast<std::size_t>(s.pa) == pi) {
                const EdgeAddr a = mapEdge(static_cast<std::size_t>(s.ea), lo, hi, n);
                s.pa = static_cast<int>(a.onA ? pi : bi);
                s.ea = static_cast<int>(a.edge);
            }
            if (static_cast<std::size_t>(s.pb) == pi) {
                const EdgeAddr b = mapEdge(static_cast<std::size_t>(s.eb), lo, hi, n);
                s.pb = static_cast<int>(b.onA ? pi : bi);
                s.eb = static_cast<int>(b.edge);
            }
        }

        // THE CUT BECOMES A SEAM. Each piece's closing edge IS the cut
        // (panelsplit.cpp), i.e. edge index size-1 on a closed-implicit contour,
        // and the two join the same two coordinates.
        SurfaceStitch cut;
        cut.pa = static_cast<int>(pi);
        cut.ea = static_cast<int>(A.contour.size() - 1);
        cut.pb = static_cast<int>(bi);
        cut.eb = static_cast<int>(B.contour.size() - 1);
        cut.kind = SurfaceStitch::Princess;  // topology tag only, NOT a name (K42)
        sp.stitchIndex = static_cast<long long>(pat.stitches.size());
        pat.stitches.push_back(cut);

        prog.applied++;
        prog.steps.push_back(sp);
    }

    // ---- PASS 2: op.suppress ON EVERY PANEL AS IT NOW STANDS, AND op.rotate
    //              ON THE DART op.suppress JUST OPENED ----------------------
    for (std::size_t pi = 0; pi < pat.panels.size(); ++pi) {
        const SurfacePanel whole = pat.panels[pi];

        OpStep su;
        su.op = "op.suppress";
        su.panel = whole.name;
        su.deficitDeg = whole.developDeficitDeg;
        SuppressReport sup;
        const Mouth m = mouthOf(plan, whole);
        if (!m.ok) {
            su.refusal = "panel kendi bel/uzak kosusunu tasimiyor; pensin agzinin oturacagi "
                         "sutun bu nesneden SORULAMAZ ve koordinattan TAHMIN EDILMEZ";
            su.reason = "SORULAMADI: sinir kosulari yok.";
        } else {
            try {
                sup = suppressPanel(whole, m.waistIdx, m.apexDepthMM, whole.contour[m.farIdx]);
            } catch (const std::exception& e) {
                su.refusal = std::string("op.suppress istegi gecersiz: ") + e.what();
                su.reason = "GECERSIZ ISTEK";
            }
            if (sup.opened) {
                su.applied = true;
                su.writtenBack = true;
                su.wedgeMeasuredDeg = sup.wedgeMeasuredDeg;
                su.areaRemovedMM2 = sup.areaRemovedMM2;
                su.reason = "op.suppress: pens acisi panelin KENDI develop-deficit'i (" +
                            num(sup.deficitDeg) + " deg); aci parametresi YOK. Sonucun "
                            "sinirindan geri okunan aci " + num(sup.wedgeMeasuredDeg) +
                            " deg, cikan kumas " + num(sup.areaRemovedMM2) + " mm2.";
                pat.panels[pi].contour = sup.contour;
            } else if (su.refusal.empty()) {
                su.refusal = sup.refusal;
                su.reason = "PENS ACILMADI: panelin kendi develop-deficit'i " +
                            num(sup.deficitDeg) +
                            " deg. Sevk edilen govde bir KONIDIR ve koni tam acilir; "
                            "bastirilacak egrilik YOK. Kusur degil, olculmus bir CEVAP (K28).";
            }
        }
        if (su.applied) prog.applied++; else prog.refused++;
        prog.steps.push_back(su);

        OpStep ro;
        ro.op = "op.rotate";
        ro.panel = whole.name;
        if (!su.applied) {
            ro.refusal = "tasinacak bir pens YOK: op.suppress bu panelde acmadi";
            ro.reason = "TASINMADI: op.rotate var olan bir pensi tasir, pens UYDURMAZ "
                        "(tools/rotate-op.cpp ayni cevabi verir).";
            prog.refused++;
            prog.steps.push_back(ro);
            continue;
        }
        // The target is the panel's own SIDE SEAM, taken from the plan's own
        // stitch list rather than from coordinates — the plan is built with its
        // seams, so asking it is asking the object. Carried across by POINT,
        // because suppressWedge reorders the contour, and a target the wedge ate
        // is REFUSED rather than silently replaced by a neighbour.
        std::vector<int> sideE;
        for (const SurfaceStitch& s : pat.stitches) {
            if (s.kind != SurfaceStitch::Side) continue;
            if (static_cast<std::size_t>(s.pa) == pi) sideE.push_back(s.ea);
            if (static_cast<std::size_t>(s.pb) == pi) sideE.push_back(s.eb);
        }
        if (sideE.empty()) {
            ro.refusal = "plan bu panelde bir YAN DIKIS ilan etmiyor; hedef kenar nesnenin "
                         "kendisinden okunamiyor";
            ro.reason = "TASINMADI: hedef kenar planin dikis listesinde YOK.";
            prog.refused++;
            prog.steps.push_back(ro);
            continue;
        }
        const std::size_t se = static_cast<std::size_t>(sideE[sideE.size() / 2]);
        if (se >= whole.contour.size()) {
            ro.refusal = "planin ilan ettigi yan dikis kenari bu panelin sinirinda degil";
            ro.reason = "TASINMADI: hedef kenar indeksi panelin disinda.";
            prog.refused++;
            prog.steps.push_back(ro);
            continue;
        }
        const Vec2 target = whole.contour[se];
        std::size_t ti = sup.contour.size();
        for (std::size_t i = 0; i < sup.contour.size(); ++i)
            if (sup.contour[i].x == target.x && sup.contour[i].y == target.y) { ti = i; break; }
        if (ti == sup.contour.size()) {
            ro.refusal = "hedef kose pensin kendisi tarafindan yutuldu; komsusuyla SESSIZCE "
                         "degistirilmiyor";
            ro.reason = "TASINMADI: hedef kose artik sinirda degil.";
            prog.refused++;
            prog.steps.push_back(ro);
            continue;
        }
        try {
            const RotateReport rot = rotateDart(sup.contour, sup.apexIdx, ti);
            ro.applied = true;
            ro.writtenBack = true;
            ro.wedgeBeforeDeg = rot.wedgeBeforeDeg;
            ro.wedgeAfterDeg = rot.wedgeAfterDeg;
            ro.areaBeforeMM2 = rot.areaBeforeMM2;
            ro.areaAfterMM2 = rot.areaAfterMM2;
            // borç 66 / K49 — the two boundaries travel with the step so the gate
            // can measure them instead of believing the four numbers above.
            ro.contourBefore = sup.contour;
            ro.apexBeforeIdx = sup.apexIdx;
            ro.contourAfter = rot.contour;
            ro.apexAfterIdx = rot.apexIdx;
            ro.reason = "op.rotate: ayni pens apeks etrafinda YAN DIKISE tasindi. Aci " +
                        num(rot.wedgeBeforeDeg) + " -> " + num(rot.wedgeAfterDeg) +
                        " deg, alan " + num(rot.areaBeforeMM2) + " -> " +
                        num(rot.areaAfterMM2) +
                        " mm2 — tasima RIJIT bir harekettir, kumas URETILMEZ.";
            pat.panels[pi].contour = rot.contour;
            prog.applied++;
        } catch (const std::exception& e) {
            ro.refusal = std::string("op.rotate istegi gecersiz: ") + e.what();
            ro.reason = "TASINMADI: istek gecersiz.";
            prog.refused++;
        }
        prog.steps.push_back(ro);
    }

    prog.panelsAfter = pat.panels.size();
    prog.stitchesAfter = pat.stitches.size();
    return prog;
}



namespace {

std::string readingJSON(const std::string& etiket, const std::string& yuzey, SeamPlan plan);

}  // namespace

std::string opsJSON(const std::string& sizeLabel, double neckDropMM) {
    SheathOptions opt;
    opt.frontNeckDropCoefCM += neckDropMM / 10.0;
    return readingJSON("sevk_edilen", "skimBodice=ON (sevk edilen giysi)",
                       buildSeamPlan(sizeLabel, opt));
}

// ⭐ TWO SURFACES, AND THE SECOND IS NOT A HIDDEN DIAL — the same declaration
// tools/split-op.cpp and tools/suppress-op.cpp make. The shipped bodice is a
// CONE and a cone develops exactly, so op.suppress REFUSES it and op.rotate has
// nothing to move: a reading that only ever shows refusals would leave the
// applied path of two operators unmeasured, and an unmeasured path rots. The
// body-following bodice (skimBodice OFF, the engine's own darts off so the panel
// arrives WHOLE) is the surface where they do act. Both are built by the SAME
// buildSeamPlan from the SAME body and which one is which is printed on every
// reading.
std::string opsJSONAll(const std::string& sizeLabel, double neckDropMM) {
    SheathOptions shipped;
    shipped.frontNeckDropCoefCM += neckDropMM / 10.0;
    SheathOptions following = shipped;
    following.skimBodice = false;
    following.maxDartDeg = 0.0;
    std::ostringstream o;
    o << "{\n  \"op\": \"program\",\n  \"beden\": " << quote(sizeLabel) << ",\n";
    o << "  \"okumalar\": [\n";
    o << readingJSON("sevk_edilen", "skimBodice=ON (sevk edilen giysi)",
                     buildSeamPlan(sizeLabel, shipped));
    o << ",\n";
    o << readingJSON("vucudu_izleyen",
                     "skimBodice=OFF, maxDartDeg=0 (motorun kendi pensi YOK)",
                     buildSeamPlan(sizeLabel, following));
    o << "\n  ]\n}\n";
    return o.str();
}

namespace {

std::string readingJSON(const std::string& etiket, const std::string& yuzey, SeamPlan plan) {
    // The node id of the plan the program STARTED from. The program mutates its
    // own copy, so this token still addresses the shipped object — which is what
    // makes "these operators ran on the garment you are looking at" checkable.
    const std::string dugum = plan.nodeId();
    const OpProgram prog = runOperatorProgram(plan);

    std::ostringstream o;
    o << "    {\n";
    o << "  \"okuma\": \"operator_programi\",\n";
    o << "  \"etiket\": " << quote(etiket) << ",\n";
    o << "  \"yuzey\": " << quote(yuzey) << ",\n";
    o << "  \"dugum\": " << quote(dugum) << ",\n";
    o << "  \"beden\": " << quote(plan.size) << ",\n";
    o << "  \"kaynak\": \"engine/src/planops.cpp — op.split / op.suppress / op.rotate SEVK "
         "EDILEN dikis planinin BIR KOPYASI uzerinde kosar. planJSON ve flatJSON "
         "DEGISMEZ (RULES 4): bu okuma opt-in bir yuzeydir.\",\n";
    o << "  \"panel_once\": " << prog.panelsBefore << ", \"panel_sonra\": " << prog.panelsAfter
      << ",\n";
    o << "  \"dikis_once\": " << prog.stitchesBefore << ", \"dikis_sonra\": "
      << prog.stitchesAfter << ",\n";
    o << "  \"uygulanan\": " << prog.applied << ", \"reddedilen\": " << prog.refused << ",\n";
    o << "  \"ret_yasasi\": \"Bir RET bir cevaptir ve SAYIYLA tasinir (RULES 1, §0B). Sessizce "
         "bos donmek yasak.\",\n";
    o << "  \"adimlar\": [\n";
    for (std::size_t i = 0; i < prog.steps.size(); ++i) {
        const OpStep& s = prog.steps[i];
        o << "    {\"op\": " << quote(s.op) << ", \"panel\": " << quote(s.panel)
          << ", \"uygulandi\": " << (s.applied ? "true" : "false")
          << ", \"plana_yazildi\": " << (s.writtenBack ? "true" : "false")
          << ", \"ret_gerekcesi\": " << quote(s.refusal) << ",\n";
        o << "     \"sebep\": " << quote(s.reason);
        if (s.op == "op.split") {
            o << ",\n     \"sutun_sayisi\": " << s.colsN << ", \"kesim_sutunu\": " << s.atColumn
              << ", \"kesim_kesri_OLCULEN\": " << num(s.atFractionMeasured, 9)
              << ",\n     \"en_egri_sutun\": " << s.maxCurvatureColumn
              << ", \"en_egri_deg\": " << num(s.maxCurvatureDeg)
              // ⚠ DOKUZ BASAMAK, VE SEBEBİ BİR ÖLÇÜM (split-op'un aynı dersi):
              // bu üç sayı bir KORUNUM kimliğinin iki tarafı, ve altı basamakta
              // kimlik yazdırma yuvarlamasında kırılıyor — ölçülen fark 1e-6
              // derece, yani geometride değil printf'te. Kapıyı gevşetmek
              // yerine (§3.8 md.4) çözünürlük büyütüldü.
              << ",\n     \"deficit_butun_deg\": " << num(s.deficitWholeDeg, 9)
              << ", \"deficit_a_deg\": " << num(s.deficitADeg, 9)
              << ", \"deficit_b_deg\": " << num(s.deficitBDeg, 9)
              << ", \"iptal_olan_deg\": " << num(s.cancelledWholeDeg);
            if (s.applied) {
                o << ",\n     \"parca_a\": " << quote(s.pieceA)
                  << ", \"parca_b\": " << quote(s.pieceB)
                  << ",\n     \"dikis_cifti\": {\"tur\": \"panel_bolme\", \"indeks\": "
                  << s.stitchIndex << ", \"a_mm\": " << num(s.cutLenAMM, 9)
                  << ", \"b_mm\": " << num(s.cutLenBMM, 9) << ", \"fark_mm\": "
                  << num(std::fabs(s.cutLenAMM - s.cutLenBMM), 9)
                  << ", \"ad_yasasi\": \"bu kesim hicbir yuzeyde 'prenses dikisi' ya da 'kup "
                     "dikisi' diye ADLANDIRILMAZ — YAYIN BULUNAMADI (K42)\"}";
            }
        } else if (s.op == "op.suppress") {
            o << ",\n     \"deficit_deg\": " << num(s.deficitDeg)
              << ", \"olculen_kama_deg\": " << num(s.wedgeMeasuredDeg)
              << ", \"cikan_alan_mm2\": " << num(s.areaRemovedMM2);
        } else {
            o << ",\n     \"kama_once_deg\": " << num(s.wedgeBeforeDeg)
              << ", \"kama_sonra_deg\": " << num(s.wedgeAfterDeg)
              << ", \"alan_once_mm2\": " << num(s.areaBeforeMM2)
              << ", \"alan_sonra_mm2\": " << num(s.areaAfterMM2);
            if (s.applied) {
                // borç 66 / K49 — RAW GEOMETRY, at round-trip precision. The gate
                // walks these itself; the four numbers above are the claim, these
                // two contours are the evidence, and they are not the same source.
                o << ",\n     \"apeks_once\": " << s.apexBeforeIdx
                  << ", \"apeks_sonra\": " << s.apexAfterIdx
                  << ",\n     \"kontur_once\": " << contourJSON(s.contourBefore)
                  << ",\n     \"kontur_sonra\": " << contourJSON(s.contourAfter);
            }
        }
        o << "}" << (i + 1 == prog.steps.size() ? "" : ",") << "\n";
    }
    o << "  ],\n";
    o << "  \"paneller\": [\n";
    for (std::size_t i = 0; i < plan.pattern.panels.size(); ++i) {
        const SurfacePanel& p = plan.pattern.panels[i];
        double per = 0.0;
        for (std::size_t k = 0; k < p.contour.size(); ++k)
            per += std::hypot(p.contour[(k + 1) % p.contour.size()].x - p.contour[k].x,
                              p.contour[(k + 1) % p.contour.size()].y - p.contour[k].y);
        o << "    {\"ad\": " << quote(p.name) << ", \"nokta\": " << p.contour.size()
          << ", \"cevre_mm\": " << num(per, 4)
          << ", \"deficit_deg\": " << num(p.developDeficitDeg) << "}"
          << (i + 1 == plan.pattern.panels.size() ? "" : ",") << "\n";
    }
    o << "  ]\n    }";
    return o.str();
}

}  // namespace

}  // namespace stitchu
