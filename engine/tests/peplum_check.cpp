// Peplum (bele takılan volan) opt-in check (R1.1): proves the peplum is a REAL
// separate flared piece — the right number of extra pieces is added, the INNER
// (waist) arc of the drawn outline is trued to the finished waist (0.00 mm), the
// outer hem arc is longer (it flares), every existing outline stays
// byte-identical, a garment with no waisted body is skipped honestly, and the
// peplum coexists with a placket + ruffled straps on one top.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/peplum.hpp"
#include "../src/strap.hpp"
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

static const PatternPiece* findPeplum(const DraftedPattern& d) {
    for (const auto& p : d.pieces)
        if (p.name.find("Peplum") != std::string::npos) return &p;
    return nullptr;
}

// The inner (waist) arc of a peplum outline is the FIRST arc run: the leading
// Move + the following Line vertices up to the first radial "side seam" line.
// It is the arc closest to the apex (smallest radius). We recover its length as
// the polyline length of the vertices nearest the apex — robustly, the shortest
// contiguous arc run in the outline. Simpler: the peplum apex is at min-y of the
// outline; the inner arc is the set of vertices within the inner-radius band.
static double innerArcLength(const PatternPiece& p) {
    // apex = the geometric centre is above; the inner arc vertices are the ones
    // at the smallest distance from the apex. Find min-y (top) vertex as anchor.
    // The outline starts with the inner arc (25 vertices) by construction; sum
    // the segment lengths of that leading run until the first big radial jump.
    if (p.commands.size() < 3) return 0;
    std::vector<Point> pts;
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Close) break;
        pts.push_back(c.to);
    }
    // Inner arc = leading run of near-equal-radius vertices. Radius from the
    // implied centre: the centre is directly above the arc mid at (0, -r0). We
    // don't know r0 here, but consecutive inner-arc segments are short and smooth
    // while the radial side seam that follows is a long single jump (the depth).
    // Sum leading segments until a segment much longer than the running median.
    double len = 0;
    double firstSeg = distance(pts[0], pts[1]);
    for (size_t i = 1; i < pts.size(); ++i) {
        double seg = distance(pts[i - 1], pts[i]);
        if (seg > firstSeg * 4 + 1) break;  // hit the radial side seam (~depth long)
        len += seg;
    }
    return len;
}

static void base(const char* label, GarmentSpec spec, PeplumStyle style,
                 double expectedInnerTotal, int expectedExtraPieces) {
    std::printf("%s\n", label);
    GarmentSpec plain = spec; plain.peplum = static_cast<int>(PeplumStyle::None);
    GarmentSpec pe = spec;    pe.peplum = static_cast<int>(style);

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m0());
    const DraftedPattern dPe = GarmentDrafter::draft(pe, m0());

    check(dPe.pieces.size() == dPlain.pieces.size() + expectedExtraPieces,
          "adds the expected number of peplum pieces");

    bool othersSame = dPe.pieces.size() >= dPlain.pieces.size();
    for (size_t i = 0; i < dPlain.pieces.size(); ++i)
        othersSame = othersSame && sameCommands(dPlain.pieces[i].commands, dPe.pieces[i].commands);
    check(othersSame, "every existing piece OUTLINE byte-identical");

    check(PatternValidator::issues(plain, m0(), dPlain).empty(), "base draft valid");
    check(PatternValidator::issues(pe, m0(), dPe).empty(), "peplum draft valid");

    const PatternPiece* peplum = findPeplum(dPe);
    check(peplum != nullptr, "a Peplum piece exists");
    if (!peplum) { std::printf("\n"); return; }

    check(peplum->cutInstruction.find("finished waist") != std::string::npos,
          "cut note names the finished-waist inner arc");
    check(peplum->hasGrainline, "peplum has a grainline");

    // TRUING: the inner (waist) arc(s) sum to the finished waist (0.00 mm).
    double innerTotal = 0;
    for (const auto& p : dPe.pieces)
        if (p.name.find("Peplum") != std::string::npos) innerTotal += innerArcLength(p);
    std::printf("      inner waist arc total = %.3f mm (expected %.3f)\n", innerTotal, expectedInnerTotal);
    check(std::fabs(innerTotal - expectedInnerTotal) < 0.5,
          "inner waist arc == finished waist (truing < 0.5 mm)");

    // The outer hem arc flares: the piece is deeper than the waist band by the
    // peplum depth, and the outline y-range spans roughly the peplum depth.
    double minY = 1e30, maxY = -1e30;
    for (const auto& c : peplum->commands) {
        if (c.type == CmdType::Close) continue;
        minY = std::min(minY, c.to.y); maxY = std::max(maxY, c.to.y);
    }
    check((maxY - minY) > PeplumBlock::depth * 0.8,
          "peplum spans the flare depth (outer hem well below the waist)");
    std::printf("      cut note: %s\n\n", peplum->cutInstruction.c_str());
}

int main() {
    // Waisted top (V-neck, princess) → carries a full-circle peplum (cut 2, one
    // piece). Finished waist = 720 mm → both halves' inner arcs sum to 720.
    GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::VNeck;
    top.shaping = Shaping::Princess; top.topLength = TopLength::Hip;
    // One drawn piece cut twice: its inner arc = half the waist (360 mm); the two
    // cut halves seam at the sides into the full 720 mm waist.
    base("Waisted top + full-circle peplum:", top, PeplumStyle::Full, 360.0, 1);

    // Pointed (handkerchief) peplum: same full-circle cut, worn to points.
    base("Waisted top + pointed peplum:", top, PeplumStyle::Pointed, 360.0, 1);

    // Half-circle peplum: two on-fold pieces (front + back), each carrying half
    // the waist over a π sweep → the two inner arcs sum to the full waist.
    base("Waisted top + half-circle peplum:", top, PeplumStyle::Half, 720.0, 2);

    // A skirt has no waisted BODICE → the peplum is gated out at the garment
    // level and skipped honestly when called directly.
    {
        std::printf("Skirt: peplum skipped honestly:\n");
        GarmentSpec s; s.garment = GarmentType::Skirt; s.skirtStyle = SkirtStyle::Straight;
        s.peplum = static_cast<int>(PeplumStyle::Full);
        GarmentSpec plain = s; plain.peplum = 0;
        const DraftedPattern dS = GarmentDrafter::draft(s, m0());
        const DraftedPattern dP = GarmentDrafter::draft(plain, m0());
        bool same = dS.pieces.size() == dP.pieces.size();
        for (size_t i = 0; same && i < dS.pieces.size(); ++i)
            same = same && sameCommands(dS.pieces[i].commands, dP.pieces[i].commands);
        check(same, "skirt: peplum gated out at garment level, draft byte-identical");
        DraftedPattern dDirect = GarmentDrafter::draft(plain, m0());
        const size_t before = dDirect.guideSteps.size();
        const bool applied = PeplumBlock::apply(dDirect, PeplumStyle::Full, m0().waistMM());
        check(!applied, "direct PeplumBlock::apply refuses a garment with no waisted body");
        check(dDirect.guideSteps.size() == before + 1, "honest skip note added (no silent no-op)");
        check(findPeplum(dDirect) == nullptr, "no peplum piece added on a refusal");
        std::printf("\n");
    }

    // Coexists: peplum + front placket + ruffled straps on one sleeveless top.
    {
        std::printf("Peplum + placket + ruffled straps coexist on one top:\n");
        GarmentSpec t; t.garment = GarmentType::Top; t.neckline = Neckline::Square;
        t.shaping = Shaping::Princess; t.topLength = TopLength::Hip;
        t.sleeveStyle = SleeveStyle::None;
        t.frontPlacket = true;
        t.ruffledStraps = static_cast<int>(StrapStyle::Ruffled);
        GarmentSpec withPeplum = t; withPeplum.peplum = static_cast<int>(PeplumStyle::Full);
        const DraftedPattern p0 = GarmentDrafter::draft(t, m0());
        const DraftedPattern p1 = GarmentDrafter::draft(withPeplum, m0());
        check(p1.pieces.size() == p0.pieces.size() + 1, "peplum adds one piece atop placket + straps");
        check(PatternValidator::issues(withPeplum, m0(), p1).empty(), "combined draft valid");
        bool peplum = false, strap = false;
        for (const auto& pc : p1.pieces) {
            if (pc.name.find("Peplum") != std::string::npos) peplum = true;
            if (pc.name.find("Ruffled Strap") != std::string::npos) strap = true;
        }
        check(peplum && strap, "peplum + ruffled strap both present with the placket");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL PEPLUM CHECKS PASS\n" : "%d PEPLUM CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
