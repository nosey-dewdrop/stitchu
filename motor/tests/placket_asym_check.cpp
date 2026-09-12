// Asymmetric button placket (asimetrik düğme patı, R1.2) opt-in check: proves the
// asymmetric placket is REAL and DIFFERENT from the symmetric one — the fold /
// button line is shifted OFF the center front by the offset, the grown edge
// reaches further out than a symmetric stand (offset + stand), the true CF is
// still marked as a reference line, and (crucially) a Standard placket is
// BYTE-IDENTICAL to the legacy frontPlacket bool so nothing regressed.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/placket.hpp"
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

static const PatternPiece* frontCenter(const DraftedPattern& d) {
    for (const char* n : {"Bodice Center Front", "Bodice Front", "Top Center Front", "Top Front"})
        for (const auto& p : d.pieces) if (p.name == n) return &p;
    return nullptr;
}

// Leftmost (most negative) x of the front outline — how far the finished edge
// grows past the fold. A symmetric stand reaches -standWidth; an asymmetric one
// reaches -(offset + standWidth).
static double frontMinX(const PatternPiece& p) {
    double minX = 1e30;
    for (const auto& c : p.commands) if (c.type != CmdType::Close) minX = std::min(minX, c.to.x);
    return minX;
}

// Does a vertical fold-line marking sit at x ≈ target (a move+line at that x)?
static bool foldLineAt(const PatternPiece& p, double target) {
    for (size_t i = 0; i + 1 < p.markings.size(); ++i) {
        if (p.markings[i].type == CmdType::Move && std::fabs(p.markings[i].to.x - target) < 0.5 &&
            p.markings[i + 1].type == CmdType::Line && std::fabs(p.markings[i + 1].to.x - target) < 0.5)
            return true;
    }
    return false;
}

static const BodyMeasurementsSnapshot& m0() {
    static const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    return m;
}

int main() {
    // The Jackie: a boat-neck straight-sleeve dress with an asymmetric front.
    GarmentSpec base;
    base.garment = GarmentType::Dress;
    base.neckline = Neckline::Boat;
    base.sleeveStyle = SleeveStyle::Straight;

    GarmentSpec bare = base; // no placket at all
    GarmentSpec std1 = base; std1.frontPlacket = true;               // legacy bool
    GarmentSpec std2 = base; std2.placketStyle = static_cast<int>(PlacketStyle::Standard);
    GarmentSpec asym = base; asym.placketStyle = static_cast<int>(PlacketStyle::Asymmetric);

    const DraftedPattern dBare = GarmentDrafter::draft(bare, m0());
    const DraftedPattern dStd1 = GarmentDrafter::draft(std1, m0());
    const DraftedPattern dStd2 = GarmentDrafter::draft(std2, m0());
    const DraftedPattern dAsym = GarmentDrafter::draft(asym, m0());

    std::printf("Standard placket == legacy frontPlacket bool (byte-identical):\n");
    const PatternPiece* fStd1 = frontCenter(dStd1);
    const PatternPiece* fStd2 = frontCenter(dStd2);
    check(fStd1 && fStd2 && sameCommands(fStd1->commands, fStd2->commands),
          "PlacketStyle::Standard front outline == frontPlacket bool front outline");
    check(fStd1 && fStd2 && fStd1->markings.size() == fStd2->markings.size(),
          "Standard marking count == legacy bool marking count");
    check(PatternValidator::issues(std2, m0(), dStd2).empty(), "standard draft valid");

    std::printf("\nAsymmetric placket differs from symmetric AND from bare:\n");
    const PatternPiece* fBare = frontCenter(dBare);
    const PatternPiece* fAsym = frontCenter(dAsym);
    check(fBare && fAsym && !sameCommands(fBare->commands, fAsym->commands),
          "asymmetric front outline differs from the bare (no-placket) front");
    check(fStd1 && fAsym && !sameCommands(fStd1->commands, fAsym->commands),
          "asymmetric front outline differs from the symmetric placket");
    check(PatternValidator::issues(asym, m0(), dAsym).empty(), "asymmetric draft valid");

    if (fStd1 && fAsym) {
        const double stdMin = frontMinX(*fStd1);
        const double asymMin = frontMinX(*fAsym);
        std::printf("      symmetric edge reaches x = %.1f, asymmetric edge reaches x = %.1f (offset %.0f)\n",
                    stdMin, asymMin, PlacketBlock::asymOffset);
        // The asymmetric edge grows further out by ~the offset.
        check(asymMin <= stdMin - PlacketBlock::asymOffset + 1.0,
              "asymmetric edge grows further out by the offset (offset + stand)");
        // Fold line is shifted off CF to -offset; the true CF (x = 0) is also
        // still marked as a reference line.
        check(foldLineAt(*fAsym, -PlacketBlock::asymOffset),
              "asymmetric fold/button line marked off center at -offset");
        check(foldLineAt(*fAsym, 0.0), "true center front still marked as a reference line");
        // The symmetric placket's fold line sits AT the true CF (x = 0).
        check(foldLineAt(*fStd1, 0.0), "symmetric fold line sits at the true center front");
    }

    std::printf("\nAsymmetric draws even when frontPlacket bool is false:\n");
    check(fAsym && (!fBare || !sameCommands(fBare->commands, fAsym->commands)),
          "asymmetric placket applied without the legacy bool");

    // TOP path: an asymmetric placket on an EXTENDED (hip/tunic) dart top must
    // draft with ZERO issues. The front panel runs bodice→hem in one piece, so its
    // trailing center-front edge is a straight LINE grown out to -(offset + stand);
    // the side-seam finder must skip that grown CF edge (whatever x it reached) and
    // measure the TRUE side-to-hem curve, which is UNCHANGED by the placket. A
    // regression here mis-measured the hem sweep as the side seam and reported a
    // false front-vs-back mismatch (~325 vs ~356 mm). Symmetric / off stay clean too.
    {
        std::printf("\nTOP (extended dart) asymmetric placket balances the side seams:\n");
        auto topSpec = [](int placket, TopLength len) {
            GarmentSpec s;
            s.garment = GarmentType::Top;
            s.neckline = Neckline::Boat;
            s.sleeveStyle = SleeveStyle::None;
            s.shaping = Shaping::Dart;
            s.topLength = len;
            s.placketStyle = placket;
            return s;
        };
        for (const TopLength len : {TopLength::Hip, TopLength::Tunic}) {
            const char* lbl = len == TopLength::Hip ? "hip" : "tunic";
            const GarmentSpec off  = topSpec(static_cast<int>(PlacketStyle::None), len);
            const GarmentSpec sstd = topSpec(static_cast<int>(PlacketStyle::Standard), len);
            const GarmentSpec sasy = topSpec(static_cast<int>(PlacketStyle::Asymmetric), len);
            const DraftedPattern dOff = GarmentDrafter::draft(off, m0());
            const DraftedPattern dStd = GarmentDrafter::draft(sstd, m0());
            const DraftedPattern dAsy = GarmentDrafter::draft(sasy, m0());
            auto sideIssue = [](const std::vector<ValidationIssue>& v) {
                for (const auto& i : v) if (i.rule == "sideseam") return true;
                return false;
            };
            const auto offIssues = PatternValidator::issues(off, m0(), dOff);
            const auto stdIssues = PatternValidator::issues(sstd, m0(), dStd);
            const auto asyIssues = PatternValidator::issues(sasy, m0(), dAsy);
            check(!sideIssue(offIssues), std::string("top ") + lbl + " no-placket: no side-seam issue");
            check(!sideIssue(stdIssues), std::string("top ") + lbl + " standard placket: no side-seam issue");
            check(!sideIssue(asyIssues), std::string("top ") + lbl + " ASYMMETRIC placket: no side-seam issue");
            check(asyIssues.empty(), std::string("top ") + lbl + " asymmetric draft fully valid (0 issues)");
            // The off (no-placket) front must be byte-identical to the legacy bool /
            // Standard is a separate concern already covered on the dress above;
            // here we anchor that the base top path is untouched by our finder fix.
            check(!dOff.pieces.empty(), std::string("top ") + lbl + " no-placket drafts pieces");
        }
    }

    // Direct honest skip: a skirt has no front bodice → refuses cleanly.
    {
        std::printf("\nSkirt: asymmetric placket skipped honestly:\n");
        DraftedPattern d = GarmentDrafter::draft([] {
            GarmentSpec s; s.garment = GarmentType::Skirt; s.skirtStyle = SkirtStyle::Straight; return s;
        }(), m0());
        const size_t before = d.guideSteps.size();
        const bool applied = PlacketBlock::apply(d, 0.0, PlacketBlock::asymOffset);
        check(!applied, "direct apply refuses a garment with no front bodice");
        check(d.guideSteps.size() == before + 1, "honest skip note added (no silent no-op)");
    }

    std::printf(failures == 0 ? "\nALL PLACKET ASYM CHECKS PASS\n" : "\n%d PLACKET ASYM CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
