// Collar family (yaka) opt-in check (Loop 7/8): proves the collar is a REAL added
// piece whose NECK EDGE is trued to the garment neckline (0.00 mm), the stand/
// mock/flat/peter-pan geometries differ correctly, the flat outer edge takes the
// round/pointed/scallop shape, a placement notch appears on the neckline, and
// every existing piece plus the whole base draft (collar off) stays byte-identical.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/collar.hpp"
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

// The collar's neck (attach) edge = the FIRST two commands of the collar outline
// (move + first edge command: bottom edge for a band, neck arc for a flat).
static double collarNeckEdgeLen(const PatternPiece& collar) {
    if (collar.commands.size() < 2) return 0;
    std::vector<PathCommand> edge = {collar.commands[0], collar.commands[1]};
    return pathLength(edge);
}

static void base(const char* label, GarmentSpec spec, CollarType type, CollarEdge edge,
                 const BodyMeasurementsSnapshot& m, const std::string& collarName,
                 int extraPieces) {
    std::printf("%s\n", label);
    GarmentSpec plain = spec; plain.collarType = static_cast<int>(CollarType::None);
    GarmentSpec coll = spec;  coll.collarType = static_cast<int>(type);
                              coll.collarEdge = static_cast<int>(edge);

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m);
    const DraftedPattern dColl = GarmentDrafter::draft(coll, m);

    check(dColl.pieces.size() == dPlain.pieces.size() + extraPieces,
          "exactly " + std::to_string(extraPieces) + " extra collar piece(s)");

    // Every ORIGINAL piece outline byte-identical (collar only adds a notch marking).
    bool outlinesSame = true;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i)
        outlinesSame = outlinesSame && sameCommands(dPlain.pieces[i].commands, dColl.pieces[i].commands);
    check(outlinesSame, "every existing piece outline byte-identical");

    check(PatternValidator::issues(plain, m, dPlain).empty(), "base draft valid");
    check(PatternValidator::issues(coll, m, dColl).empty(), "collar draft valid");

    // TRUING: the collar neck edge (half the pattern = half the neckline) == the
    // measured neckline / 2, to 0.00 mm. This is the governing constraint.
    const double neckFull = CollarBlock::necklineLengthMM(dColl);
    const double half = neckFull / 2;
    const PatternPiece& collar = dColl.pieces[dPlain.pieces.size()]; // first added piece
    check(collar.name == collarName, "first collar piece named '" + collarName + "'");
    const double neckEdge = collarNeckEdgeLen(collar);
    const double truingErr = std::fabs(neckEdge - half);
    check(truingErr < 0.005, "collar neck edge == half neckline (truing 0.00 mm)");
    std::printf("      neckline full %.2f mm; half %.2f mm; collar neck edge %.2f mm; truing err %.4f mm\n",
                neckFull, half, neckEdge, truingErr);

    // Placement notch added to a body piece.
    bool notchAdded = false;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i)
        if (dColl.pieces[i].markings.size() > dPlain.pieces[i].markings.size()) notchAdded = true;
    check(notchAdded, "neckline placement notch added to a body piece");
    std::printf("      collar cut note: %s\n\n", collar.cutInstruction.c_str());
}

int main() {
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    const BodyMeasurementsSnapshot petite{82, 64, 90, 35, 38, 55, 33};
    const BodyMeasurementsSnapshot plus{122, 104, 128, 44, 44, 60, 40};

    GarmentSpec dress; dress.garment = GarmentType::Dress; dress.neckline = Neckline::Crew;
    base("Crew dress + STAND collar:", dress, CollarType::Stand, CollarEdge::Round, m,
         "Stand Collar (dik yaka)", 1);

    GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::Crew;
    base("Crew top + MOCK collar:", top, CollarType::Mock, CollarEdge::Round, m,
         "Mock Collar (mandarin yaka)", 1);

    GarmentSpec dress2; dress2.garment = GarmentType::Dress; dress2.neckline = Neckline::Crew;
    base("Crew dress + PETER PAN collar (round):", dress2, CollarType::PeterPan, CollarEdge::Round, m,
         "Peter Pan Collar (bebe yaka)", 1);

    GarmentSpec top2; top2.garment = GarmentType::Top; top2.neckline = Neckline::Crew;
    base("Crew top + FLAT collar (pointed):", top2, CollarType::Flat, CollarEdge::Pointed, petite,
         "Flat Collar (yatık yaka)", 1);

    GarmentSpec top3; top3.garment = GarmentType::Top; top3.neckline = Neckline::Crew; top3.shaping = Shaping::Dart;
    base("Dart top + PETER PAN collar (scallop), plus body:", top3, CollarType::PeterPan, CollarEdge::Scallop, plus,
         "Peter Pan Collar (bebe yaka)", 1);

    GarmentSpec shirt; shirt.garment = GarmentType::Top; shirt.neckline = Neckline::Crew;
    base("Crew top + SHIRT collar (stand + blade = 2 pieces):", shirt, CollarType::Shirt, CollarEdge::Pointed, m,
         "Shirt Collar Stand (yaka bandı)", 2);

    // Geometry differentiation: a stand band is TALLER-vertically-narrow and its
    // outline is a curved band; a flat collar is WIDE (~60 mm) and lies out. The
    // flat collar's bounding box height (its width out from the neck) must exceed
    // the stand band's height.
    {
        std::printf("Stand vs flat geometry:\n");
        GarmentSpec d; d.garment = GarmentType::Dress; d.neckline = Neckline::Crew;
        GarmentSpec ds = d; ds.collarType = static_cast<int>(CollarType::Stand);
        GarmentSpec df = d; df.collarType = static_cast<int>(CollarType::PeterPan);
        const DraftedPattern ps = GarmentDrafter::draft(ds, m);
        const DraftedPattern pf = GarmentDrafter::draft(df, m);
        const Rect rs = boundingBox(ps.pieces.back().commands);
        const Rect rf = boundingBox(pf.pieces.back().commands);
        check(rf.height > rs.height + 15, "flat collar sits wider off the neck than the stand band");
        std::printf("      stand band bbox %.0fx%.0f; flat collar bbox %.0fx%.0f\n\n",
                    rs.width, rs.height, rf.width, rf.height);
    }

    // Scallop edge really adds curves: a scalloped flat collar has MORE curve
    // commands than a plain round one.
    {
        std::printf("Scallop edge shape:\n");
        GarmentSpec d; d.garment = GarmentType::Top; d.neckline = Neckline::Crew;
        GarmentSpec rnd = d; rnd.collarType = static_cast<int>(CollarType::PeterPan); rnd.collarEdge = static_cast<int>(CollarEdge::Round);
        GarmentSpec scl = d; scl.collarType = static_cast<int>(CollarType::PeterPan); scl.collarEdge = static_cast<int>(CollarEdge::Scallop);
        const DraftedPattern pr = GarmentDrafter::draft(rnd, m);
        const DraftedPattern psc = GarmentDrafter::draft(scl, m);
        int curvesR = 0, curvesS = 0;
        for (const auto& c : pr.pieces.back().commands) if (c.type == CmdType::Curve) curvesR++;
        for (const auto& c : psc.pieces.back().commands) if (c.type == CmdType::Curve) curvesS++;
        check(curvesS > curvesR, "scalloped outer edge has more curve segments than round");
        std::printf("      round curves %d; scallop curves %d\n\n", curvesR, curvesS);
    }

    std::printf(failures == 0 ? "ALL COLLAR CHECKS PASS\n" : "%d COLLAR CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
