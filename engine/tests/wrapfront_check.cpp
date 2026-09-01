// True wrap / surplice crossover front (kruvaze / surplice ön) opt-in check.
// Proves the wrap is a REAL crossed double front, not a decorative tie:
//   - with it OFF (None) the whole draft is byte-identical (every piece outline);
//   - with it ON (Surplice) the front is REBUILT as a full asymmetric panel whose
//     center-front edge is extended PAST center front (x < 0) into a diagonal
//     WRAP edge, and it is flipped to cut 2 mirror-image (NOT on the fold);
//   - the OVERLAP is real: cut 2 mirror, the two panels together cover the center
//     front and lap `wrapPastCF` mm past it on each side (proven by measuring the
//     panel's most-negative x — the mirror covers +that, so both cover CF);
//   - the surplice V neckline is preserved: the drafted neck edge (commands[0..1])
//     is byte-identical, so the neck facing still trues to it, and the new diagonal
//     wrap edge meets it at the CF-neck point (the surplice V);
//   - the seams still match the back (out.issues == []) and the wrap is a donning
//     opening (no redundant CB zipper);
//   - it composes with a wrap-front TIE and with a cup seam;
//   - a SKIRT host is an honest no-op.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/wrapfront.hpp"
#include "../src/tie.hpp"
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

static const PatternPiece* frontCenter(const DraftedPattern& d) {
    for (const char* name : {"Bodice Center Front", "Bodice Front",
                             "Top Center Front", "Top Front"})
        for (const auto& p : d.pieces)
            if (p.name == name) return &p;
    return nullptr;
}

// Most-negative outline x on a piece (how far it laps PAST the center front at
// x = 0). A wrap panel reaches into x < 0; its mirror (cut 2) reaches +that, so
// the two panels overlap across CF by |minX| on each side.
static double minXOf(const PatternPiece& p) {
    double minx = 1e18;
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Close) continue;
        minx = std::min(minx, c.to.x);
    }
    return minx;
}

static void hosted(const char* label, GarmentSpec spec) {
    std::printf("%s\n", label);
    GarmentSpec plain = spec; plain.wrapFront = static_cast<int>(WrapFront::None);
    GarmentSpec wrap = spec;  wrap.wrapFront = static_cast<int>(WrapFront::Surplice);

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m0());
    const DraftedPattern dWrap = GarmentDrafter::draft(wrap, m0());

    // Piece COUNT: the wrap reshapes an existing panel and adds none. F5-parca:
    // a wrap front IS a donning opening, so on a DRESS the invisible CB zipper
    // falls away and the zipperless skirt merges to one "Front & Back" piece —
    // the count may DROP by one there, it must never RISE.
    const bool dress = spec.garment == GarmentType::Dress;
    check(dress ? dWrap.pieces.size() <= dPlain.pieces.size()
                : dWrap.pieces.size() == dPlain.pieces.size(),
          dress ? "piece count never rises (CB-zip skirt split may drop, F5)"
                : "same piece count (front reshaped, none added)");

    // Every NON-front piece outline is byte-identical (the wrap touches only the
    // front center panel + its neck facing cut note). F5-parca: on a dress the
    // SKIRT pieces legitimately change class (merged, no CB split) because the
    // wrap removed the zipper — compare by NAME, skip skirt pieces on a dress.
    bool othersSame = true;
    for (const auto& pp : dPlain.pieces) {
        const std::string& n = pp.name;
        const bool isFrontBody = (n.find("Front") != std::string::npos &&
                                  n.find("Skirt") == std::string::npos &&
                                  n.find("Facing") == std::string::npos);
        if (isFrontBody) continue; // the wrap intentionally reshapes this
        if (dress && n.find("Skirt") != std::string::npos) continue; // F5: merge
        const PatternPiece* other = nullptr;
        for (const auto& wp : dWrap.pieces) if (wp.name == n) { other = &wp; break; }
        if (!other) continue;
        othersSame = othersSame && sameCommands(pp.commands, other->commands);
    }
    check(othersSame, "every non-front piece outline byte-identical (back/sleeves untouched; dress skirt merge exempt, F5)");

    const PatternPiece* fPlain = frontCenter(dPlain);
    const PatternPiece* fWrap = frontCenter(dWrap);
    check(fPlain && fWrap, "a front center piece exists");
    if (!fPlain || !fWrap) { std::printf("\n"); return; }

    // NECK EDGE PRESERVED: commands[0] (CF-neck move) and commands[1] (the neck
    // edge, k=1 for vNeck) are byte-identical, so the neck facing still trues to
    // the neckline (the whole draft's facing invariant survives).
    check(sameCommands({fPlain->commands[0]}, {fWrap->commands[0]}) &&
          sameCommands({fPlain->commands[1]}, {fWrap->commands[1]}),
          "drafted neck edge byte-identical (facing still trues; surplice V preserved)");

    // WRAP EXTENDS PAST CF: the wrapped front reaches into x < 0 (past the center
    // front at x = 0); the un-wrapped front does not.
    const double plainMinX = minXOf(*fPlain);
    const double wrapMinX = minXOf(*fWrap);
    const double pastCF = -wrapMinX;
    std::printf("      front laps %.1f mm past CF (plain minX=%.1f, wrap minX=%.1f)\n",
                pastCF, plainMinX, wrapMinX);
    check(plainMinX > -0.5, "un-wrapped front does NOT cross CF");
    check(pastCF >= WrapFrontBlock::kWrapPastCFMinMM - 0.5,
          "wrapped front laps a real distance PAST CF (>= the wrap minimum)");
    check(pastCF <= WrapFrontBlock::kWrapPastCFMaxMM + 0.5,
          "wrap stays within the sane maximum");

    // OVERLAP COVERS CF: cut 2 mirror. This panel covers x in [wrapMinX, maxX] with
    // wrapMinX < 0, so it covers CF (x = 0); its mirror covers [-maxX, -wrapMinX]
    // with -wrapMinX > 0, so it ALSO covers CF. The two panels therefore overlap
    // across the whole band [wrapMinX, -wrapMinX] = 2*pastCF wide, centered on CF.
    check(wrapMinX < 0 && -wrapMinX > 0,
          "cut 2 mirror: both fronts cover the center front — the overlap is real (2 x "
          + std::to_string(static_cast<long>(std::lround(pastCF))) + " mm across CF)");

    // CUT 2 MIRROR (not on the fold — a wrap opens at CF).
    check(fWrap->cutInstruction.find("on fold") == std::string::npos,
          "front is NOT cut on the fold (a wrap opens at CF)");
    check(fWrap->cutInstruction.find("cut 2") != std::string::npos,
          "front is cut 2 (mirror wrap)");

    // WRAP EDGE is a clean diagonal: the last outline command before Close is the
    // straight wrap edge running to the CF-neck point.
    const auto& wc = fWrap->commands;
    bool cleanDiag = wc.size() >= 3 &&
                     wc.back().type == CmdType::Close &&
                     wc[wc.size() - 2].type == CmdType::Line &&
                     std::fabs(wc[wc.size() - 2].to.x - fWrap->commands[0].to.x) < 1e-6 &&
                     std::fabs(wc[wc.size() - 2].to.y - fWrap->commands[0].to.y) < 1e-6;
    check(cleanDiag, "wrap edge is a clean diagonal line up to the CF-neck point");

    // WEARABLE + trued to the back: out.issues == [].
    check(PatternValidator::issues(plain, m0(), dPlain).empty(), "base draft valid");
    const auto wIssues = PatternValidator::issues(wrap, m0(), dWrap);
    for (const auto& it : wIssues)
        std::printf("      WRAP ISSUE [%s] %s: %s\n", it.rule.c_str(), it.piece.c_str(), it.detail.c_str());
    check(wIssues.empty(), "wrap draft valid — seams still true to the back (out.issues == [])");
    check(Wearability::issues(wrap, m0(), dWrap).empty(), "wrap wearable (out.issues == [])");
    check(Wearability::hasDonningOpening(wrap, dWrap), "wrap front is a donning opening");
    check(fWrap->closure.find("wrap") != std::string::npos, "front carries a wrap closure label");

    // No redundant CB zipper on a dress (the wrap opens the front).
    if (spec.garment == GarmentType::Dress) {
        bool zip = false;
        for (const auto& p : dWrap.pieces)
            if (p.closure.find("invisible zipper") != std::string::npos) zip = true;
        check(!zip, "no redundant invisible CB zipper (the wrap opens the front)");
    }
    std::printf("\n");
}

int main() {
    // Dart vNeck dress — the canonical surplice/wrap host (the task repro).
    GarmentSpec dart; dart.garment = GarmentType::Dress; dart.shaping = Shaping::Dart;
    dart.neckline = Neckline::VNeck; dart.sleeveStyle = SleeveStyle::Straight;
    dart.skirtStyle = SkirtStyle::ALine;
    hosted("Dart v-neck dress + WRAP/surplice front:", dart);

    // Princess vNeck dress (the center panel carries the CF edge + neckline).
    GarmentSpec princess = dart; princess.shaping = Shaping::Princess;
    hosted("Princess v-neck dress + WRAP/surplice front:", princess);

    // Sleeveless vNeck top (extends through the waist).
    GarmentSpec top; top.garment = GarmentType::Top; top.shaping = Shaping::Dart;
    top.neckline = Neckline::VNeck; top.sleeveStyle = SleeveStyle::None;
    hosted("Dart v-neck sleeveless top + WRAP/surplice front:", top);

    // COMPOSES with a wrap-front TIE (the tie cinches the crossed front).
    {
        std::printf("Wrap front + wrap-front TIE compose (a real tied wrap dress):\n");
        GarmentSpec b; b.garment = GarmentType::Dress; b.shaping = Shaping::Dart;
        b.neckline = Neckline::VNeck; b.sleeveStyle = SleeveStyle::Straight; b.skirtStyle = SkirtStyle::ALine;
        b.wrapFront = static_cast<int>(WrapFront::Surplice);
        GarmentSpec wrapOnly = b;
        GarmentSpec both = b; both.tieClosure = static_cast<int>(TiePlacement::WrapFront);
        const DraftedPattern pWrap = GarmentDrafter::draft(wrapOnly, m0());
        const DraftedPattern pBoth = GarmentDrafter::draft(both, m0());
        check(pBoth.pieces.size() == pWrap.pieces.size() + 1, "the tie adds one piece ON TOP of the wrapped front");
        bool tie = false, wrapClosure = false;
        for (const auto& pc : pBoth.pieces) {
            if (pc.name.find("Wrap Front Tie") != std::string::npos) tie = true;
            if (pc.closure.find("wrap") != std::string::npos) wrapClosure = true;
        }
        check(tie, "wrap-front tie piece present alongside the crossed front");
        check(wrapClosure, "the reshaped wrap front is still there under the tie");
        check(PatternValidator::issues(both, m0(), pBoth).empty(), "tied wrap dress valid (out.issues == [])");
        check(Wearability::issues(both, m0(), pBoth).empty(), "tied wrap dress wearable");
        std::printf("\n");
    }

    // COMPOSES with a cup seam (a wrapped bustier-ish front): the cup seam splits
    // the princess front cups; the wrap reshapes the center panel's CF edge. Both
    // present, draft valid.
    {
        std::printf("Wrap front + cup seam compose (princess sweetheart):\n");
        GarmentSpec b; b.garment = GarmentType::Dress; b.shaping = Shaping::Princess;
        b.neckline = Neckline::Sweetheart; b.sleeveStyle = SleeveStyle::None;
        b.cupSeam = 1; // horizontal cup seam
        GarmentSpec cupOnly = b;
        GarmentSpec both = b; both.wrapFront = static_cast<int>(WrapFront::Surplice);
        const DraftedPattern pCup = GarmentDrafter::draft(cupOnly, m0());
        const DraftedPattern pBoth = GarmentDrafter::draft(both, m0());
        bool cup = false;
        for (const auto& pc : pBoth.pieces)
            if (pc.name.find("Cup") != std::string::npos) cup = true;
        check(cup, "cup-seam pieces still present with the wrap");
        // Both drafts must at least be internally consistent (compose without
        // breaking the validator). We report issues if any surface.
        const auto issCup = PatternValidator::issues(cupOnly, m0(), pCup);
        const auto issBoth = PatternValidator::issues(both, m0(), pBoth);
        for (const auto& it : issBoth)
            std::printf("      COMPOSE ISSUE [%s] %s: %s\n", it.rule.c_str(), it.piece.c_str(), it.detail.c_str());
        check(issCup.empty(), "cup-seam-only draft valid");
        check(issBoth.empty(), "wrap + cup seam compose valid (out.issues == [])");
        std::printf("\n");
    }

    // SKIRT host is an honest NO-OP: the garment gate never calls the block; base
    // draft byte-identical, no wrap closure. Also prove the block itself refuses
    // when called directly on a bodiceless draft.
    {
        std::printf("Skirt host (honest no-op):\n");
        GarmentSpec s; s.garment = GarmentType::Skirt; s.skirtStyle = SkirtStyle::ALine;
        GarmentSpec plain = s;
        GarmentSpec wrap = s; wrap.wrapFront = static_cast<int>(WrapFront::Surplice);
        const DraftedPattern dPlain = GarmentDrafter::draft(plain, m0());
        const DraftedPattern dWrap = GarmentDrafter::draft(wrap, m0());
        check(dPlain.pieces.size() == dWrap.pieces.size(), "skirt: no piece added/reshaped (gate skips it)");
        bool sameAll = dPlain.pieces.size() == dWrap.pieces.size();
        for (size_t i = 0; sameAll && i < dPlain.pieces.size(); ++i)
            sameAll = sameCommands(dPlain.pieces[i].commands, dWrap.pieces[i].commands);
        check(sameAll, "skirt: every piece byte-identical (byte-identical no-op)");

        // Direct block call on a bodiceless draft refuses honestly.
        DraftedPattern d = GarmentDrafter::draft(plain, m0());
        const size_t before = d.pieces.size();
        const size_t stepsBefore = d.guideSteps.size();
        const bool ok = WrapFrontBlock::apply(d, WrapFront::Surplice, m0().bustMM() / 4.0);
        check(!ok, "apply() returns false on a bodiceless draft (no front to wrap)");
        check(d.pieces.size() == before, "no piece added on refuse");
        check(d.guideSteps.size() == stepsBefore + 1, "an honest guide note was appended");
        std::printf("      note: %s\n\n", d.guideSteps.back().c_str());
    }

    std::printf(failures == 0 ? "ALL WRAP FRONT CHECKS PASS\n" : "%d WRAP FRONT CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
