// Open-back cutout (açık sırt oyuğu) opt-in check (Loop 9b): proves the cutout
// is a REAL added facing piece on the BACK, that the facing's inner (opening)
// stitch line is byte-identical to the opening marked on the back piece
// (truing 0.00 mm — the facing can never drift from the hole it finishes), that
// the facing solid is wider than the opening (it must cover it + margin), that
// each of the four shapes draws, that a tie-back (Loop 4b) and an open-back
// cutout can coexist on the same garment, and that every existing piece plus the
// whole base draft (backOpening off) stays byte-identical.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/openback.hpp"
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

static double maxAbsX(const std::vector<PathCommand>& cmds) {
    double mx = 0;
    for (const auto& c : cmds) {
        if (c.type == CmdType::Close) continue;
        mx = std::max(mx, std::fabs(c.to.x));
    }
    return mx;
}

static void base(const char* label, GarmentSpec spec, BackOpening shape,
                 const std::string& facingName) {
    std::printf("%s\n", label);
    GarmentSpec plain = spec; plain.backOpening = static_cast<int>(BackOpening::None);
    GarmentSpec ob = spec;    ob.backOpening = static_cast<int>(shape);

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m0());
    const DraftedPattern dOb = GarmentDrafter::draft(ob, m0());

    // F5-parca (48871b3e): the CB zipper is a MEASURED decision (gecis kurali).
    // A plain woven dress keeps a zipper + SPLIT skirt; a back shape that opens
    // for donning (low-V) drops the zipper and the skirt merges into one
    // "Skirt Front & Back" (cut 2 on fold). Net: +1 facing -1 merge = same
    // count. The declared zipper coupling (contract/edit-locality-v1.json
    // 1.1.0) is judged by NAME so it can never hide a locality leak. (The old
    // positional facing lookup pieces[plain.size()] read past the vector end
    // exactly here — the facing is now found by NAME.)
    const bool zipFlip = dPlain.cbZipper && !dOb.cbZipper;
    auto findByName = [](const DraftedPattern& d, const std::string& n) -> const PatternPiece* {
        for (const auto& p : d.pieces) if (p.name == n) return &p;
        return nullptr;
    };
    if (zipFlip) {
        std::printf("      gecis kurali: plain '%s' | open-back '%s'\n",
                    dPlain.cbZipperGerekce.c_str(), dOb.cbZipperGerekce.c_str());
        check(dOb.pieces.size() == dPlain.pieces.size(),
              "exactly 1 extra facing piece (+1 facing, -1 declared skirt merge, F5 gecis kurali)");
        check(findByName(dPlain, "Skirt Front") && findByName(dPlain, "Skirt Back") &&
                  findByName(dOb, "Skirt Front & Back"),
              "the -1 is exactly the declared skirt merge (split -> one on fold)");
    } else {
        check(dOb.pieces.size() == dPlain.pieces.size() + 1, "exactly 1 extra facing piece");
    }

    bool outlinesSame = true;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i) {
        const PatternPiece& pp = dPlain.pieces[i];
        if (zipFlip && pp.name.rfind("Skirt", 0) == 0) continue;
        const PatternPiece* q = findByName(dOb, pp.name);
        outlinesSame = outlinesSame && q && sameCommands(pp.commands, q->commands);
    }
    check(outlinesSame, "every existing piece OUTLINE byte-identical");

    check(PatternValidator::issues(plain, m0(), dPlain).empty(), "base draft valid");
    check(PatternValidator::issues(ob, m0(), dOb).empty(), "open-back draft valid");

    const PatternPiece* facingP = findByName(dOb, facingName);
    check(facingP != nullptr, "facing piece named '" + facingName + "'");
    if (!facingP) { std::printf("\n"); return; }
    const PatternPiece& facing = *facingP;
    check(facing.seamAllowance == 0, "facing sewn on the marked line (SA 0)");

    // Find the back piece and the opening marking added to it.
    const PatternPiece* backPlain = nullptr;
    const PatternPiece* backOb = nullptr;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i) {
        const std::string& n = dPlain.pieces[i].name;
        if (n == "Bodice Center Back" || n == "Bodice Back" ||
            n == "Top Center Back" || n == "Top Back") {
            backPlain = &dPlain.pieces[i]; backOb = &dOb.pieces[i];
        }
    }
    check(backOb != nullptr, "a back piece exists to carry the cutout");
    if (backOb) {
        check(backOb->markings.size() > backPlain->markings.size(),
              "opening marking added to the back piece");

        // TRUING: the facing's marked opening line == the opening marking added
        // to the back (both are the fold-side half against the CB seam). The
        // facing carries the exact opening it finishes → 0.00 mm, can't drift.
        const size_t added = backOb->markings.size() - backPlain->markings.size();
        std::vector<PathCommand> backOpen(
            backOb->markings.begin() + backPlain->markings.size(),
            backOb->markings.end());
        std::vector<PathCommand> facingOpen(
            facing.markings.begin(), facing.markings.begin() + std::min(added, facing.markings.size()));
        check(sameCommands(backOpen, facingOpen),
              "facing opening line == back opening line (truing 0.00 mm)");

        // The facing solid must be WIDER than the opening it covers (margin out).
        check(maxAbsX(facing.commands) > maxAbsX(backOpen),
              "facing solid wider than the opening (covers it + margin)");
    }
    std::printf("      facing cut note: %s\n\n", facing.cutInstruction.c_str());
}

int main() {
    GarmentSpec dress; dress.garment = GarmentType::Dress; dress.neckline = Neckline::Crew;
    base("Crew dress + ROUND back cutout:", dress, BackOpening::RoundCutout,
         "Open Back Facing (round)");
    base("Crew dress + LOW-V back:", dress, BackOpening::LowV,
         "Open Back Facing (low-V)");
    base("Crew dress + SQUARE back scoop:", dress, BackOpening::Square,
         "Open Back Facing (square)");
    base("Crew dress + KEYHOLE back:", dress, BackOpening::Keyhole,
         "Open Back Facing (keyhole)");

    GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::Scoop;
    base("Scoop top + ROUND back cutout:", top, BackOpening::RoundCutout,
         "Open Back Facing (round)");

    // A tie-back (Loop 4b) and an open-back cutout coexist: the tie draws the
    // closure, the cutout draws the opening it fastens over. Both pieces present.
    {
        std::printf("Tie-back + open-back cutout coexist (Tie Back Mini Dress):\n");
        GarmentSpec d; d.garment = GarmentType::Dress; d.neckline = Neckline::Crew;
        d.tieClosure = 2;  // a back tie placement (non-None)
        GarmentSpec tieOnly = d;
        GarmentSpec both = d; both.backOpening = static_cast<int>(BackOpening::RoundCutout);
        const DraftedPattern pTie = GarmentDrafter::draft(tieOnly, m0());
        const DraftedPattern pBoth = GarmentDrafter::draft(both, m0());
        check(pBoth.pieces.size() == pTie.pieces.size() + 1,
              "open-back adds a facing ON TOP of the tie pieces");
        bool tie = false, facing = false;
        for (const auto& pc : pBoth.pieces) {
            if (pc.name.find("Tie") != std::string::npos || pc.name.find("Sash") != std::string::npos
                || pc.name.find("Bow") != std::string::npos) tie = true;
            if (pc.name.find("Open Back Facing") != std::string::npos) facing = true;
        }
        check(tie, "tie piece still present (Loop 4b rule intact)");
        check(facing, "open-back facing present alongside the tie");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL OPEN-BACK CHECKS PASS\n" : "%d OPEN-BACK CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
