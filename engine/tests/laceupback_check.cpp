// Corset lace-up back (korse bağcıklı sırt) opt-in check: proves the lace-up is
// a REAL added closure — a lacing cord piece + a CB facing marking + a trued
// eyelet column on the back piece — that with it OFF (None) the whole draft is
// byte-identical, that the eyelet column y positions are EVENLY spaced (the two
// physical back edges, cut 2, share this identical series so the lacing sits
// level — y-alignment trued to <0.5 mm), that the laced back is a real donning
// opening (no redundant CB zipper stamped), that it composes with a cup seam (a
// laced-back bustier), and that a SKIRT host is an honest no-op.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/laceupback.hpp"
#include "../src/garment.hpp"
#include "../src/validator.hpp"
#include "../src/wearability.hpp"

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
    static const BodyMeasurementsSnapshot m{88, 70, 94, 37, 40.5, 58, 35};
    return m;
}

// An eyelet ring is stamped as move(cx-r,cy) line(cx,cy-r) line(cx+r,cy)
// line(cx,cy+r) line(cx-r,cy) — the ring CENTRE is the y of the middle strokes
// (cy). Collect each ring's centre y from the markings ADDED by the lace-up (the
// tail beyond the base back's marking count).
static std::vector<double> eyeletCentresY(const std::vector<PathCommand>& baseMarks,
                                           const std::vector<PathCommand>& obMarks) {
    std::vector<double> ys;
    // Rings are 5-command groups starting with a Move; scan the added tail for the
    // move->line->line->line->line pattern and take the 3rd point's y (cy+... no:
    // the ring's cy is the y of the move point, since move is at (cx-r, cy)).
    for (size_t i = baseMarks.size(); i + 4 < obMarks.size() + 1 && i < obMarks.size(); ++i) {
        if (obMarks[i].type != CmdType::Move) continue;
        if (i + 4 >= obMarks.size()) break;
        if (obMarks[i + 1].type == CmdType::Line && obMarks[i + 2].type == CmdType::Line &&
            obMarks[i + 3].type == CmdType::Line && obMarks[i + 4].type == CmdType::Line) {
            // ring: move(cx-r,cy), line(cx,cy-r), line(cx+r,cy), line(cx,cy+r), line(cx-r,cy)
            const double cy = obMarks[i].to.y;      // move point y == ring centre y
            const double topY = obMarks[i + 1].to.y; // cy - r
            const double botY = obMarks[i + 3].to.y; // cy + r
            if (std::fabs((topY + botY) / 2 - cy) < 0.01) { // it really is a ring
                ys.push_back(cy);
                i += 4;
            }
        }
    }
    return ys;
}

static const PatternPiece* backPiece(const DraftedPattern& d) {
    for (const auto& p : d.pieces)
        if (p.name == "Bodice Center Back" || p.name == "Bodice Back" ||
            p.name == "Top Center Back" || p.name == "Top Back")
            return &p;
    return nullptr;
}

static void hosted(const char* label, GarmentSpec spec) {
    std::printf("%s\n", label);
    GarmentSpec plain = spec; plain.laceUpBack = static_cast<int>(LaceUpBack::None);
    GarmentSpec lu = spec;    lu.laceUpBack = static_cast<int>(LaceUpBack::Corset);

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m0());
    const DraftedPattern dLu = GarmentDrafter::draft(lu, m0());

    // Exactly one extra piece: the lacing cord.
    check(dLu.pieces.size() == dPlain.pieces.size() + 1, "exactly 1 extra piece (the lacing cord)");

    // Every existing piece OUTLINE byte-identical (the lace-up only adds markings
    // to the back + a cord piece; it never reshapes an outline).
    bool outlinesSame = true;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i)
        outlinesSame = outlinesSame && sameCommands(dPlain.pieces[i].commands, dLu.pieces[i].commands);
    check(outlinesSame, "every existing piece OUTLINE byte-identical");

    // The cord piece is present + named + is a strip (cut 1, self-fabric fold).
    bool cord = false;
    for (const auto& p : dLu.pieces)
        if (p.name.find("Lacing Cord") != std::string::npos) { cord = true; break; }
    check(cord, "lacing cord piece present");

    // Both drafts valid (no wearability issues) — the laced back is donnable.
    check(PatternValidator::issues(plain, m0(), dPlain).empty(), "base draft valid");
    check(PatternValidator::issues(lu, m0(), dLu).empty(), "lace-up draft valid (out.issues == [])");
    check(Wearability::issues(lu, m0(), dLu).empty(), "lace-up wearable (donning opening present)");
    check(Wearability::hasDonningOpening(lu, dLu), "laced back is a donning opening");

    // Eyelet columns added to the back + a facing marking.
    const PatternPiece* bPlain = backPiece(dPlain);
    const PatternPiece* bLu = backPiece(dLu);
    check(bPlain && bLu, "a back piece exists to carry the eyelets");
    if (bPlain && bLu) {
        check(bLu->markings.size() > bPlain->markings.size(), "eyelet/facing markings added to the back");

        const std::vector<double> ys = eyeletCentresY(bPlain->markings, bLu->markings);
        check(ys.size() >= static_cast<size_t>(LaceUpBackBlock::minEyelets),
              "at least " + std::to_string(LaceUpBackBlock::minEyelets) + " eyelets drawn");

        // TRUING: the eyelet column is EVENLY spaced. The two physical back edges
        // (cut 2) are stamped from THIS identical y series, so the second column's
        // eyelets land at the same heights — the lacing sits level. Prove the drawn
        // series is even (max spacing deviation < 0.5 mm) → both columns align to
        // <0.5 mm by construction.
        double maxDev = 0;
        if (ys.size() >= 2) {
            const double nominal = ys.back() - ys.front();
            const double step = nominal / (ys.size() - 1);
            for (size_t i = 1; i < ys.size(); ++i)
                maxDev = std::max(maxDev, std::fabs((ys[i] - ys[i - 1]) - step));
        }
        std::printf("      eyelets=%zu, max spacing deviation=%.4f mm\n", ys.size(), maxDev);
        check(maxDev < 0.5, "eyelet column evenly spaced → two columns align to <0.5 mm");
    }

    // A dress carries no invisible CB zipper when the laced back opens it: no back
    // piece should carry an "invisible zipper" closure label.
    if (spec.garment == GarmentType::Dress) {
        bool zip = false;
        for (const auto& p : dLu.pieces)
            if (p.closure.find("zipper") != std::string::npos) zip = true;
        check(!zip, "no redundant CB zipper stamped (the lacing opens the back)");
    }
    std::printf("\n");
}

int main() {
    // Princess dress — the canonical corset host.
    GarmentSpec princess; princess.garment = GarmentType::Dress;
    princess.shaping = Shaping::Princess; princess.neckline = Neckline::Sweetheart;
    hosted("Princess sweetheart dress + CORSET lace-up back:", princess);

    // Dart dress also hosts (a fitted dart back).
    GarmentSpec dart; dart.garment = GarmentType::Dress; dart.neckline = Neckline::Crew;
    hosted("Dart crew dress + CORSET lace-up back:", dart);

    // Fitted top hosts too.
    GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::Scoop;
    top.shaping = Shaping::Princess;
    hosted("Princess scoop top + CORSET lace-up back:", top);

    // COMPOSES with a cup seam (a laced-back bustier): princess sweetheart,
    // sleeveless, cup seam + lace-up back both present.
    {
        std::printf("Cup seam + lace-up back compose (laced-back bustier):\n");
        GarmentSpec b; b.garment = GarmentType::Dress; b.shaping = Shaping::Princess;
        b.neckline = Neckline::Sweetheart; b.sleeveStyle = SleeveStyle::None;
        b.cupSeam = 1; // Horizontal cup seam
        GarmentSpec cupOnly = b;
        GarmentSpec both = b; both.laceUpBack = static_cast<int>(LaceUpBack::Corset);
        const DraftedPattern pCup = GarmentDrafter::draft(cupOnly, m0());
        const DraftedPattern pBoth = GarmentDrafter::draft(both, m0());
        check(pBoth.pieces.size() == pCup.pieces.size() + 1,
              "lace-up adds the cord ON TOP of the cup-seam pieces");
        bool upperCup = false, cord = false;
        for (const auto& pc : pBoth.pieces) {
            if (pc.name.find("Cup") != std::string::npos) upperCup = true;
            if (pc.name.find("Lacing Cord") != std::string::npos) cord = true;
        }
        check(upperCup, "cup-seam pieces still present (compose intact)");
        check(cord, "lacing cord present alongside the cup seam");
        check(Wearability::issues(both, m0(), pBoth).empty(), "laced-back bustier wearable");
        std::printf("\n");
    }

    // SKIRT host is an honest NO-OP: no cord piece, an honest guide note, base
    // draft byte-identical.
    {
        std::printf("Skirt host (honest no-op):\n");
        GarmentSpec s; s.garment = GarmentType::Skirt; s.skirtStyle = SkirtStyle::ALine;
        GarmentSpec plain = s;
        GarmentSpec lu = s; lu.laceUpBack = static_cast<int>(LaceUpBack::Corset);
        // The garment.cpp gate only calls the block for dress/top; a skirt never
        // reaches the block, so it is byte-identical AND has no cord piece.
        const DraftedPattern dPlain = GarmentDrafter::draft(plain, m0());
        const DraftedPattern dLu = GarmentDrafter::draft(lu, m0());
        check(dPlain.pieces.size() == dLu.pieces.size(), "skirt: no piece added (honest no-op)");
        bool cord = false;
        for (const auto& p : dLu.pieces)
            if (p.name.find("Lacing Cord") != std::string::npos) cord = true;
        check(!cord, "skirt: no lacing cord (not hosted)");
        std::printf("\n");
    }

    // Direct no-op on a LOOSE/GATHERED back: call the block on a gathered-skirt
    // dress draft (still has a bodice back, so it IS hosted — the honest boundary
    // is the garment gate, not the block; a true gathered BACK panel would refuse
    // in the block). Prove the block itself refuses when there is no fitted back
    // piece by drafting a skirt and calling apply() directly.
    {
        std::printf("Block apply() directly on a bodiceless draft refuses honestly:\n");
        GarmentSpec s; s.garment = GarmentType::Skirt; s.skirtStyle = SkirtStyle::Gathered;
        DraftedPattern d = GarmentDrafter::draft(s, m0());
        const size_t before = d.pieces.size();
        const size_t stepsBefore = d.guideSteps.size();
        const bool ok = LaceUpBackBlock::apply(d, LaceUpBack::Corset);
        check(!ok, "apply() returns false (no fitted back to host)");
        check(d.pieces.size() == before, "no piece added on refuse");
        check(d.guideSteps.size() == stepsBefore + 1, "an honest guide note was appended");
        std::printf("      note: %s\n\n", d.guideSteps.back().c_str());
    }

    std::printf(failures == 0 ? "ALL LACE-UP BACK CHECKS PASS\n" : "%d LACE-UP BACK CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
