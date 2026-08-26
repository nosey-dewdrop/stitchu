// rotate-op: run `op.rotate` (dart transfer / pivot) against the LIVE seam plan.
//
// This tool holds no geometry. The panel it works on is the front torso panel
// of the shipped EU38 SeamPlan — the same object seam-plan, the wasm bindings
// and web/lib/flat-from-plan.js read — and every number below comes out of
// src/dartrotate.cpp. If this tool and create.html ever disagree, one of them
// is not calling the engine (the rule tools/seam-plan.cpp already states).
//
// ⚠ THE MEASURED FACT THAT SHAPES THIS TOOL, AND IT IS NOT COMFORTABLE.
// The shipped class is named `top/dart/woven`, but the shipped seam plan
// carries ZERO darts: all eight panels of EU38 print `"pens": 0`, with the
// shoulder seam on or off and at every maxDartDeg. surfacepattern.cpp says so
// in its own words ("the torso derives NO waist darts at all") — the
// suppression is carried by PANEL SEAMS, not by darts. So the dart this
// operator transfers is DECLARED here, by op.suppress, and both of its numbers
// are sourced rather than chosen:
//
//   wedge 41.48 deg  = the real Buğra Locket dart, measured as develop-deficit
//                      (flatten-research/16-*.py; CLAUDE.md "gerçek Buğra pensi
//                      41.5° = develop-deficit 41.48°"). Not a round number and
//                      not ours.
//   apex at 0.80     = SheathOptions::bodiceApexFrac, the engine's own declared
//                      fraction of the shaped region, with its own drafting
//                      reason written next to it ("a dart run all the way to
//                      the bust point makes a cone tip; every drafting text
//                      ends it 2-3cm before").
//
// op.suppress becoming a real operator is a QUEUE item and is NOT claimed here
// (§4A: an unresolved name stays and is written into the queue).
//
// Usage: rotate-op [EU38]      -> JSON on stdout
#include <cmath>
#include <cstdio>
#include <exception>
#include <string>
#include <utility>
#include <vector>

#include "../src/dartrotate.hpp"
#include "../src/seamplan.hpp"

using namespace stitchu;

namespace {

// Sourced, not chosen — see the header comment.
constexpr double kBugraDartDeg = 41.48;
constexpr double kApexFracOfPanel = 0.80;  // SheathOptions::bodiceApexFrac

std::string num(double v, int dp = 4) {
    char b[64];
    std::snprintf(b, sizeof b, "%.*f", dp, v);
    return b;
}

// The START vertex of the edge that sits at `frac` along a named edge run. The
// runs are the panel's OWN lists (waistEdges / farEdges / seam0Edges /
// seam1Edges), so a target is named by construction instead of being found by
// looking at coordinates — which is how a "side seam" quietly becomes whatever
// edge happened to be leftmost.
std::size_t vertexOn(const std::vector<int>& run, double frac) {
    if (run.empty()) throw std::runtime_error("rotate-op: empty edge run");
    const std::size_t k = static_cast<std::size_t>(frac * (run.size() - 1) + 0.5);
    return static_cast<std::size_t>(run[k]);
}

void emitTarget(const char* ad, const std::vector<Vec2>& darted, std::size_t apexIdx,
                std::size_t target, bool last) {
    const RotateReport r = rotateDart(darted, apexIdx, target);
    const double legErrBefore = std::fabs(r.legBeforeAMM - r.legBeforeBMM);
    const double legErrAfter = std::fabs(r.legAfterAMM - r.legAfterBMM);
    std::printf(
        "    {\"hedef\": \"%s\", \"hedef_nokta\": [%s, %s],\n"
        "     \"cevre_once_mm\": %s, \"cevre_sonra_mm\": %s,\n"
        "     \"bacak_once_mm\": %s, \"bacak_sonra_mm\": %s,\n"
        "     \"cevre_kimlik_artigi_mm\": %s,\n"
        "     \"alan_once_mm2\": %s, \"alan_sonra_mm2\": %s, \"alan_farki_mm2\": %s,\n"
        "     \"aci_once_deg\": %s, \"aci_sonra_deg\": %s, \"aci_farki_deg\": %s,\n"
        "     \"bacak_true_once_mm\": %s, \"bacak_true_sonra_mm\": %s,\n"
        "     \"kendini_kesiyor\": %s}%s\n",
        ad, num(darted[target].x).c_str(), num(darted[target].y).c_str(),
        num(r.perimeterBeforeMM).c_str(), num(r.perimeterAfterMM).c_str(),
        num(0.5 * (r.legBeforeAMM + r.legBeforeBMM)).c_str(),
        num(0.5 * (r.legAfterAMM + r.legAfterBMM)).c_str(),
        num(r.perimeterIdentityResidualMM, 9).c_str(), num(r.areaBeforeMM2).c_str(),
        num(r.areaAfterMM2).c_str(), num(std::fabs(r.areaAfterMM2 - r.areaBeforeMM2), 9).c_str(),
        num(r.wedgeBeforeDeg, 6).c_str(), num(r.wedgeAfterDeg, 6).c_str(),
        num(std::fabs(r.wedgeAfterDeg - r.wedgeBeforeDeg), 9).c_str(), num(legErrBefore, 9).c_str(),
        num(legErrAfter, 9).c_str(), r.selfIntersects ? "true" : "false", last ? "" : ",");
}

}  // namespace

int main(int argc, char** argv) {
    const std::string size = argc > 1 ? argv[1] : "EU38";
    try {
        const SeamPlan plan = buildSeamPlan(size);
        const SurfacePanel* p = nullptr;
        for (const SurfacePanel& q : plan.pattern.panels)
            if (q.name == "left_ftorso") p = &q;
        if (!p) throw std::runtime_error("rotate-op: the plan has no left_ftorso panel");

        // ---- THE DART'S OWN COLUMN ----
        //
        // The flattened panel is NOT axis-aligned in cut space (measured: its
        // waist run spans y 383..567 while its far run spans y 313..490), so
        // "up" is not +y and a dart pointed at +y would not be a dart at all.
        // The direction is the panel's own COLUMN: waistEdges and farEdges are
        // both listed phi-ascending with the same count, so waist arc k and far
        // arc k are the two ends of one ring column — which is exactly the
        // object surfacepattern.cpp opens its own slits on ("dart columns are
        // stored as ABSOLUTE RING COLUMNS").
        if (p->waistEdges.size() != p->farEdges.size())
            throw std::runtime_error("rotate-op: waist and far runs are not the same length; "
                                     "the column correspondence this tool relies on is gone");
        const std::size_t kMid = p->waistEdges.size() / 2;  // the engine's own default 0.5 cut
        const std::size_t waistIdx = static_cast<std::size_t>(p->waistEdges[kMid]);
        const std::size_t farIdx = static_cast<std::size_t>(p->farEdges[kMid]);
        const double colLen = std::hypot(p->contour[farIdx].x - p->contour[waistIdx].x,
                                         p->contour[farIdx].y - p->contour[waistIdx].y);
        const double apexDepth = kApexFracOfPanel * colLen;
        std::size_t apexIdx = 0;
        const std::vector<Vec2> darted = suppressWedge(p->contour, waistIdx, apexDepth,
                                                       p->contour[farIdx], kBugraDartDeg, &apexIdx);

        // ---- THE THREE TARGETS, NAMED BY THE PLAN'S OWN STITCH KINDS ----
        //
        // Not by looking at coordinates. SurfaceStitch::Kind already carries
        // Side / Shoulder / Princess, and the plan is BUILT with its seams
        // ("seam matching is construction, not search"), so asking the stitch
        // list which edges of this panel are the side seam and which are the
        // shoulder is asking the object, not guessing from a bounding box.
        // The ARMHOLE is what is left: a far edge that carries NO stitch is a
        // free top boundary, and the free stretch on the SIDE-seam side of the
        // panel is the armhole (the free stretch on the centre side is the
        // neck edge — which is why the run index, not the label, decides).
        std::size_t pi = 0;
        for (std::size_t i = 0; i < plan.pattern.panels.size(); ++i)
            if (&plan.pattern.panels[i] == p) pi = i;
        std::vector<int> sideE, shoulderE;
        int nShoulderStitch = 0;
        std::vector<bool> stitched(p->contour.size(), false);
        for (const SurfaceStitch& s : plan.pattern.stitches) {
            if (s.kind == SurfaceStitch::Shoulder) ++nShoulderStitch;
            if (static_cast<std::size_t>(s.pa) == pi) {
                stitched[static_cast<std::size_t>(s.ea)] = true;
                if (s.kind == SurfaceStitch::Side) sideE.push_back(s.ea);
                if (s.kind == SurfaceStitch::Shoulder) shoulderE.push_back(s.ea);
            }
            if (static_cast<std::size_t>(s.pb) == pi) {
                stitched[static_cast<std::size_t>(s.eb)] = true;
                if (s.kind == SurfaceStitch::Side) sideE.push_back(s.eb);
                if (s.kind == SurfaceStitch::Shoulder) shoulderE.push_back(s.eb);
            }
        }
        // Which END of farEdges is the side-seam end: the end whose contour
        // vertex is nearer the side seam's own vertices. One number, no guess.
        auto nearestSideDist = [&](std::size_t v) {
            double best = 1e18;
            for (int e : sideE)
                best = std::min(best, std::hypot(p->contour[static_cast<std::size_t>(e)].x -
                                                     p->contour[v].x,
                                                 p->contour[static_cast<std::size_t>(e)].y -
                                                     p->contour[v].y));
            return best;
        };
        std::vector<int> freeFar;
        for (int e : p->farEdges)
            if (!stitched[static_cast<std::size_t>(e)]) freeFar.push_back(e);
        if (sideE.empty() || freeFar.size() < 3)
            throw std::runtime_error("rotate-op: the plan declares no side seam or no free far "
                                     "edge on this panel — there is nothing to transfer a dart to");
        const bool frontIsSide =
            nearestSideDist(static_cast<std::size_t>(freeFar.front())) <
            nearestSideDist(static_cast<std::size_t>(freeFar.back()));
        // Armhole end and neck end of the free top boundary. One step in from
        // each end, so the target is a vertex of the run and not its corner.
        const int armE = frontIsSide ? freeFar[1] : freeFar[freeFar.size() - 2];
        const int neckE = frontIsSide ? freeFar[freeFar.size() - 2] : freeFar[1];

        // suppressWedge REORDERS and SHORTENS the contour (it drops every vertex
        // the wedge sweeps and starts the ring after them), so an index into the
        // original panel means nothing in the darted one. Targets are carried
        // across by their POINT, and a target the suppression ate is refused
        // rather than silently replaced by its neighbour.
        auto shifted = [&](int e) {
            const Vec2& q = p->contour[static_cast<std::size_t>(e)];
            for (std::size_t i = 0; i < darted.size(); ++i)
                if (darted[i].x == q.x && darted[i].y == q.y) return i;
            throw std::runtime_error("rotate-op: target vertex was consumed by the dart itself");
        };
        const std::size_t iSide = shifted(sideE[sideE.size() / 2]);
        const std::size_t iArm = shifted(armE);
        const std::size_t iNeck = shifted(neckE);

        std::printf("{\n");
        std::printf("  \"op\": \"rotate\",\n");
        std::printf("  \"beden\": \"%s\",\n", size.c_str());
        std::printf("  \"dugum\": \"%s\",\n", plan.nodeId().c_str());
        std::printf("  \"panel\": \"%s\",\n", p->name.c_str());
        std::printf("  \"panel_nokta\": %zu,\n", p->contour.size());
        std::printf("  \"canli_planda_pens_sayisi\": %zu,\n", p->darts.size());
        std::printf("  \"fikstur\": {\"op\": \"suppress\", \"aci_deg\": %s, "
                    "\"kaynak\": \"flatten-research/16 — Bugra Locket develop-deficit 41.48 deg\", "
                    "\"apeks_frac\": %s, \"apeks_kaynak\": \"SheathOptions::bodiceApexFrac\", "
                    "\"apeks_derinlik_mm\": %s, \"bel_noktasi\": [%s, %s]},\n",
                    num(kBugraDartDeg, 2).c_str(), num(kApexFracOfPanel, 2).c_str(),
                    num(apexDepth).c_str(), num(p->contour[waistIdx].x).c_str(),
                    num(p->contour[waistIdx].y).c_str());
        // ⚠ MEASURED AND REPORTED, NOT WORKED AROUND: the card asks for the
        // dart to reach the SHOULDER too, and the shipped plan cannot name a
        // shoulder — `SheathOptions::shoulderSeam` is off by default, so
        // `fold.on` is false and the plan emits ZERO SurfaceStitch::Shoulder.
        // Naming a "shoulder" target anyway would be sticking a label on
        // whatever far edge looked right. It stays in the queue with its count.
        std::printf("  \"omuz_dikisi_sayisi\": %d,\n", nShoulderStitch);
        std::printf("  \"omuz_hedefi\": \"YOK — plan hicbir SurfaceStitch::Shoulder "
                    "bildirmiyor (SheathOptions::shoulderSeam varsayilan KAPALI); "
                    "uydurulmadi, kuyruga yazildi\",\n");
        std::printf("  \"serbest_ust_sinir_kenari\": %zu,\n", freeFar.size());
        // The four named runs with their own bounding boxes. A target called
        // "armhole" that turns out to sit at the waist is a labelling error, and
        // the only way a reader catches it is if the run's own extent is printed
        // next to the label.
        {
            const std::pair<const char*, const std::vector<int>*> runs[4] = {
                {"waistEdges", &p->waistEdges}, {"farEdges", &p->farEdges},
                {"seam0Edges", &p->seam0Edges}, {"seam1Edges", &p->seam1Edges}};
            std::printf("  \"kenar_kumeleri\": {");
            for (int i = 0; i < 4; ++i) {
                double a0 = 1e18, a1 = -1e18, b0 = 1e18, b1 = -1e18;
                for (int e : *runs[i].second) {
                    const Vec2& v = p->contour[static_cast<std::size_t>(e)];
                    a0 = std::min(a0, v.x); a1 = std::max(a1, v.x);
                    b0 = std::min(b0, v.y); b1 = std::max(b1, v.y);
                }
                std::printf("%s\"%s\": {\"kenar\": %zu, \"kutu\": [%s, %s, %s, %s]}",
                            i ? ", " : "", runs[i].first, runs[i].second->size(),
                            num(a0).c_str(), num(a1).c_str(), num(b0).c_str(), num(b1).c_str());
            }
            std::printf("},\n");
        }
        std::printf("  \"transferler\": [\n");
        emitTarget("yan_dikis", darted, apexIdx, iSide, false);
        emitTarget("kol_oyugu", darted, apexIdx, iArm, false);
        emitTarget("yaka_kenari", darted, apexIdx, iNeck, true);
        std::printf("  ]\n}\n");
        return 0;
    } catch (const std::exception& e) {
        std::fprintf(stderr, "rotate-op: %s\n", e.what());
        return 1;
    }
}
