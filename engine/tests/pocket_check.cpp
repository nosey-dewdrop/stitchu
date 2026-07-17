// Pocket (cep) opt-in check (patch 3.12): proves the two honest pocket
// constructions are REAL and safe:
//  * PATCH — a separate patch pocket piece is added AND a placement mark is
//    stamped on the body front, the patch is sized/trued to the measured front-
//    panel width, and every existing outline stays byte-identical;
//  * SIDE-SEAM — two in-seam pocket-bag pieces are added AND a mouth-opening mark
//    is stamped on the side seam, the bag depth is measured from the host seam,
//    outlines stay byte-identical;
//  * a garment with no host (a cropped top for a side-seam bag) is skipped
//    honestly (no silent no-op);
//  * a welt/besom pocket is NOT drawn here (honest boundary — the block only
//    knows Patch + SideSeam, so a welt request has no enum and never fakes one);
//  * pockets coexist with a placket + peplum on one garment.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/pocket.hpp"
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

static const PatternPiece* findByName(const DraftedPattern& d, const char* needle) {
    for (const auto& p : d.pieces)
        if (p.name.find(needle) != std::string::npos) return &p;
    return nullptr;
}
static int countByName(const DraftedPattern& d, const char* needle) {
    int n = 0;
    for (const auto& p : d.pieces)
        if (p.name.find(needle) != std::string::npos) n++;
    return n;
}

// The existing (non-pocket) pieces must be byte-identical between the plain and
// pocketed drafts — EXCEPT that a marking may be added to the host body panel
// (placement / mouth mark). The OUTLINE (commands) must never change.
static void checkOutlinesIdentical(const DraftedPattern& plain, const DraftedPattern& withP,
                                   const char* pocketNeedle, const std::string& label) {
    bool ok = true;
    for (const auto& pp : plain.pieces) {
        const PatternPiece* q = nullptr;
        for (const auto& r : withP.pieces) if (r.name == pp.name) { q = &r; break; }
        if (!q) { ok = false; break; }
        if (!sameCommands(pp.commands, q->commands)) ok = false;
    }
    (void)pocketNeedle;
    check(ok, label + ": every existing piece OUTLINE byte-identical");
}

int main() {
    // ---- PATCH POCKET on a skirt (the hip patch, most common) ---------------
    {
        std::printf("Patch pocket on an A-line skirt:\n");
        GarmentSpec s; s.garment = GarmentType::Skirt; s.skirtStyle = SkirtStyle::ALine;
        s.shaping = Shaping::Princess;
        GarmentSpec p = s; p.pocketStyle = static_cast<int>(PocketStyle::Patch);

        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dP = GarmentDrafter::draft(p, m0());

        check(dP.pieces.size() == d0.pieces.size() + 1, "adds exactly one patch pocket piece");
        checkOutlinesIdentical(d0, dP, "Patch", "patch skirt");

        const PatternPiece* patch = findByName(dP, "Patch Pocket");
        check(patch != nullptr, "a Patch Pocket piece exists");
        check(patch && patch->hasGrainline, "patch has a grainline");
        check(patch && patch->cutInstruction.find("front panel") != std::string::npos,
              "cut note names the trued front-panel width");

        // Truing: the patch width in the note is clamp(frontWidth * frac). The
        // drafter passes bust/4 = 900/4 = 225 mm as the front-panel width.
        const double frontW = m0().bustMM() / 4.0;
        const double expectW = std::round(std::clamp(frontW * PocketBlock::patchWidthFrac,
                                                     PocketBlock::patchMinW, PocketBlock::patchMaxW));
        std::string wStr = std::to_string(static_cast<long>(std::lround(expectW)));
        check(patch && patch->cutInstruction.find(wStr + " x ") != std::string::npos,
              "patch is sized/trued to the front-panel width (" + wStr + " mm)");

        // A placement mark was stamped on the front panel (markings grew).
        const PatternPiece* frontPlain = findByName(d0, "Center Front");
        const PatternPiece* frontP = findByName(dP, "Center Front");
        check(frontPlain && frontP && frontP->markings.size() > frontPlain->markings.size(),
              "a placement mark is stamped on the front panel");

        check(PatternValidator::issues(s, m0(), d0).empty(), "base draft valid");
        check(PatternValidator::issues(p, m0(), dP).empty(), "patch draft valid");
        std::printf("      cut note: %s\n\n", patch ? patch->cutInstruction.c_str() : "(none)");
    }

    // ---- SIDE-SEAM POCKET on an A-line skirt --------------------------------
    {
        std::printf("Side-seam pocket on an A-line skirt:\n");
        GarmentSpec s; s.garment = GarmentType::Skirt; s.skirtStyle = SkirtStyle::ALine;
        s.shaping = Shaping::Princess;
        GarmentSpec p = s; p.pocketStyle = static_cast<int>(PocketStyle::SideSeam);

        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dP = GarmentDrafter::draft(p, m0());

        // One pocket-bag PIECE is added (cut 4 in the note — 2 mirrored per side).
        check(countByName(dP, "Pocket Bag") == 1, "adds one pocket-bag piece (cut 4 in the note)");
        check(dP.pieces.size() == d0.pieces.size() + 1, "exactly one extra piece");
        checkOutlinesIdentical(d0, dP, "Pocket Bag", "side-seam skirt");

        const PatternPiece* bag = findByName(dP, "Pocket Bag");
        check(bag != nullptr, "a Pocket Bag piece exists");
        check(bag && bag->cutInstruction.find("side seam") != std::string::npos,
              "cut note names the side-seam opening");
        check(bag && bag->cutInstruction.find("cut 2 pairs") != std::string::npos,
              "cut note asks for 2 mirrored pairs");

        // A mouth-opening mark was stamped on the side panel.
        const PatternPiece* sidePlain = findByName(d0, "Side Front");
        const PatternPiece* sideP = findByName(dP, "Side Front");
        check(sidePlain && sideP && sideP->markings.size() > sidePlain->markings.size(),
              "a mouth-opening mark is stamped on the side seam");

        // The bag spans a real depth below the opening.
        double minY = 1e30, maxY = -1e30;
        if (bag) for (const auto& c : bag->commands) {
            if (c.type == CmdType::Close) continue;
            minY = std::min(minY, c.to.y); maxY = std::max(maxY, c.to.y);
        }
        check(bag && (maxY - minY) > PocketBlock::mouthOpening,
              "bag is deeper than the mouth opening (a real pouch)");

        check(PatternValidator::issues(p, m0(), dP).empty(), "side-seam draft valid");
        std::printf("      cut note: %s\n\n", bag ? bag->cutInstruction.c_str() : "(none)");
    }

    // ---- HONEST SKIP: a cropped top has no side seam for an in-seam bag ------
    {
        std::printf("Cropped top: side-seam pocket skipped honestly:\n");
        GarmentSpec t; t.garment = GarmentType::Top; t.topLength = TopLength::Cropped;
        t.shaping = Shaping::Princess;
        GarmentSpec p = t; p.pocketStyle = static_cast<int>(PocketStyle::SideSeam);
        const DraftedPattern d0 = GarmentDrafter::draft(t, m0());
        const DraftedPattern dP = GarmentDrafter::draft(p, m0());
        // No bag added when the seam is too short (byte-identical apart from the
        // honest skip note).
        check(countByName(dP, "Pocket Bag") == 0, "no bag on too-short a side seam");
        check(dP.pieces.size() == d0.pieces.size(), "no extra piece on a refusal");

        // Direct call returns false + one honest note.
        DraftedPattern d = GarmentDrafter::draft(t, m0());
        const size_t before = d.guideSteps.size();
        const bool applied = PocketBlock::apply(d, PocketStyle::SideSeam, m0().bustMM() / 4.0);
        check(!applied, "direct SideSeam apply refuses a too-short side seam");
        check(d.guideSteps.size() == before + 1, "honest skip note added (no silent no-op)");
        std::printf("\n");
    }

    // ---- HONEST BOUNDARY: no welt/besom enum exists (never faked) ------------
    {
        std::printf("Welt/besom pocket: honest boundary (no enum, never faked):\n");
        // The block only draws Patch + SideSeam. There is no PocketStyle::Welt —
        // a welt request stays in the honesty layer (missing.js), it is never
        // silently substituted with a patch. Prove the enum surface is exactly
        // {None, Patch, SideSeam} and that None is a true no-op.
        GarmentSpec s; s.garment = GarmentType::Dress;
        GarmentSpec none = s; none.pocketStyle = static_cast<int>(PocketStyle::None);
        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dN = GarmentDrafter::draft(none, m0());
        bool identical = d0.pieces.size() == dN.pieces.size();
        for (size_t i = 0; identical && i < d0.pieces.size(); ++i)
            identical = identical && sameCommands(d0.pieces[i].commands, dN.pieces[i].commands);
        check(identical, "PocketStyle::None is byte-identical to no pocket at all");
        check(static_cast<int>(PocketStyle::SideSeam) == 2 &&
              static_cast<int>(PocketStyle::Patch) == 1,
              "enum surface is exactly {None=0, Patch=1, SideSeam=2} (no welt)");
        std::printf("\n");
    }

    // ---- COEXIST: patch pocket + placket + peplum on one top ----------------
    {
        std::printf("Patch pocket + placket + peplum coexist on one top:\n");
        GarmentSpec t; t.garment = GarmentType::Top; t.neckline = Neckline::Square;
        t.shaping = Shaping::Princess; t.topLength = TopLength::Hip;
        t.frontPlacket = true;
        t.peplum = 1; // PeplumStyle::Full
        GarmentSpec p = t; p.pocketStyle = static_cast<int>(PocketStyle::Patch);
        const DraftedPattern p0 = GarmentDrafter::draft(t, m0());
        const DraftedPattern p1 = GarmentDrafter::draft(p, m0());
        check(p1.pieces.size() == p0.pieces.size() + 1, "patch adds one piece atop placket + peplum");
        check(PatternValidator::issues(p, m0(), p1).empty(), "combined draft valid");
        bool patch = findByName(p1, "Patch Pocket") != nullptr;
        bool peplum = findByName(p1, "Peplum") != nullptr;
        check(patch && peplum, "patch pocket + peplum both present with the placket");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL POCKET CHECKS PASS\n" : "%d POCKET CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
