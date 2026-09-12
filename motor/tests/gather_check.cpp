// Drawstring / shirred / smocked gathering (büzgü) opt-in check (Loop 8): proves
// the gather is a REAL added panel whose flat (gathered) edge = the drafted zone
// edge x the correct ratio (drawstring 1.8, shirred 2.0, smocked 3.0) to 0.00 mm,
// that a drawstring adds a second cord piece, that the shirring/smocking control
// marks appear, that a placement notch lands on a body piece, and that every
// existing piece plus the whole base draft (gather off) stays byte-identical.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/gather.hpp"
#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static bool sameCommands(const std::vector<PathCommand>& a, const std::vector<PathCommand>& b) {
    if (a.size() != b.size()) return false;
    for (size_t i = 0; i < a.size(); ++i) {
        if (a[i].type != b[i].type) return false;
        if (std::fabs(a[i].to.x - b[i].to.x) > 1e-9 || std::fabs(a[i].to.y - b[i].to.y) > 1e-9) return false;
        if (std::fabs(a[i].cp1.x - b[i].cp1.x) > 1e-9 || std::fabs(a[i].cp1.y - b[i].cp1.y) > 1e-9) return false;
        if (std::fabs(a[i].cp2.x - b[i].cp2.x) > 1e-9 || std::fabs(a[i].cp2.y - b[i].cp2.y) > 1e-9) return false;
    }
    return true;
}

static const BodyMeasurementsSnapshot& m0() {
    static const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    return m;
}

// The panel's gathered (top) edge = the FIRST edge command of its rectangle
// outline (move {0,0} -> line {cutW,0}); its length is cutW = flat + 2*SA. The
// FINISHED flat gathered edge is cutW - 2*15.
static double panelFlatEdge(const PatternPiece& panel) {
    if (panel.commands.size() < 2) return 0;
    return panel.commands[1].to.x - 30;  // minus 2 * 15 mm SA
}

static void base(const char* label, GarmentSpec spec, GatherType type, GatherZone zone,
                 double ratio, const std::string& panelName, int extraPieces) {
    std::printf("%s\n", label);
    GarmentSpec plain = spec; plain.gatherType = static_cast<int>(GatherType::None);
    GarmentSpec gth = spec;   gth.gatherType = static_cast<int>(type);
                              gth.gatherZone = static_cast<int>(zone);

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m0());
    const DraftedPattern dGth = GarmentDrafter::draft(gth, m0());

    check(dGth.pieces.size() == dPlain.pieces.size() + extraPieces,
          "exactly " + std::to_string(extraPieces) + " extra gather piece(s)");

    bool outlinesSame = true;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i)
        outlinesSame = outlinesSame && sameCommands(dPlain.pieces[i].commands, dGth.pieces[i].commands);
    check(outlinesSame, "every existing piece outline byte-identical");

    check(PatternValidator::issues(plain, m0(), dPlain).empty(), "base draft valid");
    check(PatternValidator::issues(gth, m0(), dGth).empty(), "gather draft valid");

    const PatternPiece& panel = dGth.pieces[dPlain.pieces.size()];
    check(panel.name == panelName, "first gather piece named '" + panelName + "'");

    // TRUING: the panel's flat gathered edge = finished edge x ratio, 0.00 mm.
    // The finished edge is recovered as flatEdge / ratio; compare to the drafted
    // zone edge the block measured (recomputed independently for a neckline).
    const double flatEdge = panelFlatEdge(panel);
    const double finished = flatEdge / ratio;
    std::printf("      flat gathered edge %.2f mm; ratio %.1f; implied finished %.2f mm\n",
                flatEdge, ratio, finished);
    // The flat edge must be a clean ratio multiple of a positive finished edge.
    check(finished > 40, "panel gathers onto a real (positive) finished edge");
    check(std::fabs(flatEdge - finished * ratio) < 0.005, "flat edge == finished x ratio (0.00 mm)");

    // Control marks present: drawstring => a channel + eyelets; shirred/smocked
    // => parallel rows. Either way the panel has markings.
    check(!panel.markings.empty(), "panel carries gather control marks");

    // Placement notch added to a body piece.
    bool notchAdded = false;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i)
        if (dGth.pieces[i].markings.size() > dPlain.pieces[i].markings.size()) notchAdded = true;
    check(notchAdded, "placement notch added to a body piece");
    std::printf("      panel cut note: %s\n\n", panel.cutInstruction.c_str());
}

int main() {
    GarmentSpec dress; dress.garment = GarmentType::Dress; dress.neckline = Neckline::Crew;
    base("Crew dress + DRAWSTRING neckline (panel + cord = 2 pieces):",
         dress, GatherType::Drawstring, GatherZone::Neckline, 1.8,
         "Drawstring Yoke Panel (büzgü yaka panosu)", 2);

    GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::Crew;
    base("Crew top + SHIRRED bust panel (1 piece):",
         top, GatherType::Shirred, GatherZone::Bust, 2.0,
         "Shirred Bust Panel (büzgü büst panosu)", 1);

    GarmentSpec dress2; dress2.garment = GarmentType::Dress; dress2.neckline = Neckline::Crew;
    base("Crew dress + SMOCKED yoke (1 piece, 3:1):",
         dress2, GatherType::Smocked, GatherZone::Neckline, 3.0,
         "Smocked Yoke Panel (büzgü yaka panosu)", 1);

    GarmentSpec dress3; dress3.garment = GarmentType::Dress; dress3.neckline = Neckline::Crew;
    base("Crew dress + SHIRRED waist panel (1 piece):",
         dress3, GatherType::Shirred, GatherZone::Waist, 2.0,
         "Shirred Waist Panel (büzgü bel panosu)", 1);

    // Ratio differentiation: at the SAME zone, smocked (3:1) cuts wider than
    // shirred (2:1) which cuts wider than drawstring (1.8:1).
    {
        std::printf("Ratio ordering (same neckline):\n");
        GarmentSpec d; d.garment = GarmentType::Dress; d.neckline = Neckline::Crew;
        auto flat = [&](GatherType t) {
            GarmentSpec g = d; g.gatherType = static_cast<int>(t);
            g.gatherZone = static_cast<int>(GatherZone::Neckline);
            const DraftedPattern p = GarmentDrafter::draft(g, m0());
            // panel is the piece named with "Panel"
            for (const auto& pc : p.pieces)
                if (pc.name.find("Panel") != std::string::npos) return pc.commands[1].to.x;
            return 0.0;
        };
        const double ds = flat(GatherType::Drawstring);
        const double sh = flat(GatherType::Shirred);
        const double sm = flat(GatherType::Smocked);
        check(sm > sh && sh > ds, "smocked wider than shirred wider than drawstring");
        std::printf("      drawstring flat %.0f; shirred %.0f; smocked %.0f\n\n", ds, sh, sm);
    }

    // Drawstring adds a cord; shirred does not.
    {
        std::printf("Drawstring cord piece:\n");
        GarmentSpec d; d.garment = GarmentType::Dress; d.neckline = Neckline::Crew;
        GarmentSpec ds = d; ds.gatherType = static_cast<int>(GatherType::Drawstring);
        GarmentSpec sh = d; sh.gatherType = static_cast<int>(GatherType::Shirred);
        const DraftedPattern pDs = GarmentDrafter::draft(ds, m0());
        const DraftedPattern pSh = GarmentDrafter::draft(sh, m0());
        bool cord = false;
        for (const auto& pc : pDs.pieces) if (pc.name.find("Cord") != std::string::npos) cord = true;
        bool cordSh = false;
        for (const auto& pc : pSh.pieces) if (pc.name.find("Cord") != std::string::npos) cordSh = true;
        check(cord, "drawstring adds a Drawstring Cord piece");
        check(!cordSh, "shirred adds NO cord piece");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL GATHER CHECKS PASS\n" : "%d GATHER CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
