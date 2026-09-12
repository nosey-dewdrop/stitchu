// Shoulder / sleeve-join style check (patch 3.13): proves
//   1. Set is the byte-identical default (every piece outline unchanged).
//   2. Dropped shoulder reshapes the armhole: the drawn armhole is LONGER and
//      LOWER than the set-in one, both halves widen by the same amount (side
//      seams still pair), and the whole draft still VALIDATES (the sleeve cap
//      re-fits the dropped armhole, so cap ease stays in window).
//   3. Raglan draws a raglan seam on the front + back, converts the sleeve into a
//      raglan sleeve (renamed, with the seam-line + crown-dart markings), keeps
//      every OTHER outline byte-identical, and still validates.
//   4. Honest limits: a halter (no shoulder seam) is skipped for both styles; a
//      skirt is skipped; a direct raglan on a body with no bodice refuses.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/bodice.hpp"
#include "../src/shoulder.hpp"
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

static const PatternPiece* findByName(const DraftedPattern& d, const std::string& sub) {
    for (const auto& p : d.pieces)
        if (p.name.find(sub) != std::string::npos) return &p;
    return nullptr;
}

int main() {
    // ---- 1. Set is byte-identical to the pre-3.13 default (implicit shoulderStyle=0) ----
    {
        std::printf("Set shoulder is the byte-identical default:\n");
        GarmentSpec base; base.garment = GarmentType::Top; base.neckline = Neckline::Crew;
        base.shaping = Shaping::Princess; base.topLength = TopLength::Hip;
        base.sleeveStyle = SleeveStyle::Straight; base.sleeveLength = SleeveLength::Short;
        GarmentSpec set = base; set.shoulderStyle = static_cast<int>(ShoulderStyle::Set);
        const DraftedPattern d0 = GarmentDrafter::draft(base, m0());  // default 0
        const DraftedPattern dS = GarmentDrafter::draft(set, m0());
        bool same = d0.pieces.size() == dS.pieces.size();
        for (size_t i = 0; same && i < d0.pieces.size(); ++i) {
            same = same && d0.pieces[i].name == dS.pieces[i].name &&
                   sameCommands(d0.pieces[i].commands, dS.pieces[i].commands) &&
                   sameCommands(d0.pieces[i].markings, dS.pieces[i].markings);
        }
        check(same, "explicit Set == default: every outline + marking byte-identical");
        check(PatternValidator::issues(set, m0(), dS).empty(), "set draft valid");
        std::printf("\n");
    }

    // ---- 2. Dropped shoulder: longer, lower armhole; both halves widen; valid ----
    {
        std::printf("Dropped shoulder reshapes the armhole and stays valid:\n");
        BodiceBlock::BodiceOptions oSet; oSet.neckline = Neckline::Crew; oSet.shaping = Shaping::Princess;
        BodiceBlock::BodiceOptions oDrop = oSet; oDrop.shoulderStyle = ShoulderStyle::Dropped;
        const BodiceDraft bSet = BodiceBlock::draft(m0(), oSet);
        const BodiceDraft bDrop = BodiceBlock::draft(m0(), oDrop);
        std::printf("      armhole length set=%.1f dropped=%.1f  depth set=%.1f dropped=%.1f\n",
                    bSet.armholeLength, bDrop.armholeLength, bSet.armholeDepth, bDrop.armholeDepth);
        check(bDrop.armholeLength > bSet.armholeLength + 3.0, "dropped armhole is longer");
        check(bDrop.armholeDepth > bSet.armholeDepth + 3.0, "dropped armhole is deeper");
        check(bDrop.droppedWiden > 0.0, "both halves report a positive widen");
        check(std::fabs((bDrop.frontChestWidth - bSet.frontChestWidth) -
                        (bDrop.backChestWidth - bSet.backChestWidth)) < 1e-6,
              "front and back widen by the same amount (side seams still pair)");
        check(std::fabs(bDrop.frontSideSeam - bDrop.backSideSeam) <= 3.0,
              "dropped side seams still match front to back");

        // Whole-garment: a dropped top with a set-in sleeve must still validate,
        // because the sleeve cap re-fits the longer/deeper dropped armhole.
        GarmentSpec drop; drop.garment = GarmentType::Top; drop.neckline = Neckline::Crew;
        drop.shaping = Shaping::Princess; drop.topLength = TopLength::Hip;
        drop.sleeveStyle = SleeveStyle::Straight; drop.sleeveLength = SleeveLength::Short;
        drop.shoulderStyle = static_cast<int>(ShoulderStyle::Dropped);
        const DraftedPattern dDrop = GarmentDrafter::draft(drop, m0());
        auto issues = PatternValidator::issues(drop, m0(), dDrop);
        for (const auto& i : issues) std::printf("      ISSUE %s/%s: %s\n", i.rule.c_str(), i.piece.c_str(), i.detail.c_str());
        check(issues.empty(), "dropped-shoulder top with a set-in sleeve validates");

        // A dropped DRESS validates too (sleeve + skirt join unaffected).
        GarmentSpec dressDrop; dressDrop.garment = GarmentType::Dress; dressDrop.neckline = Neckline::Scoop;
        dressDrop.shaping = Shaping::Princess; dressDrop.skirtStyle = SkirtStyle::ALine;
        dressDrop.sleeveStyle = SleeveStyle::Straight; dressDrop.sleeveLength = SleeveLength::Long;
        dressDrop.shoulderStyle = static_cast<int>(ShoulderStyle::Dropped);
        const DraftedPattern dDressDrop = GarmentDrafter::draft(dressDrop, m0());
        auto di = PatternValidator::issues(dressDrop, m0(), dDressDrop);
        for (const auto& i : di) std::printf("      DRESS ISSUE %s/%s: %s\n", i.rule.c_str(), i.piece.c_str(), i.detail.c_str());
        check(di.empty(), "dropped-shoulder dress validates");

        // A dropped guide note is added.
        bool noted = false;
        for (const auto& s : dDrop.guideSteps)
            if (s.find("Dropped shoulder") != std::string::npos) noted = true;
        check(noted, "guide explains the dropped shoulder");
        std::printf("\n");
    }

    // ---- 3. Raglan: seam on front+back, raglan sleeve, others byte-identical, valid ----
    {
        std::printf("Raglan draws a raglan seam + raglan sleeve and stays valid:\n");
        GarmentSpec set; set.garment = GarmentType::Top; set.neckline = Neckline::Crew;
        set.shaping = Shaping::Dart; set.topLength = TopLength::Hip;
        set.sleeveStyle = SleeveStyle::Straight; set.sleeveLength = SleeveLength::Short;
        GarmentSpec rag = set; rag.shoulderStyle = static_cast<int>(ShoulderStyle::Raglan);
        const DraftedPattern dSet = GarmentDrafter::draft(set, m0());
        const DraftedPattern dRag = GarmentDrafter::draft(rag, m0());

        check(dRag.pieces.size() == dSet.pieces.size(),
              "raglan adds no NET pieces (it reshapes the existing ones)");

        const PatternPiece* raglanSleeve = findByName(dRag, "Raglan");
        check(raglanSleeve != nullptr, "the sleeve is renamed a Raglan sleeve");
        if (raglanSleeve)
            check(raglanSleeve->markings.size() > findByName(dSet, "Sleeve")->markings.size(),
                  "the raglan sleeve carries extra seam-line + dart markings");

        // Front + back body pieces carry the raglan seam marking (a Move + Curve
        // appended) and a "raglan corner" cut note.
        const PatternPiece* front = findByName(dRag, "Front");
        const PatternPiece* back = findByName(dRag, "Back");
        bool frontNote = front && front->cutInstruction.find("raglan corner") != std::string::npos;
        bool backNote = back && back->cutInstruction.find("raglan corner") != std::string::npos;
        check(frontNote && backNote, "front + back note the raglan corner to cut off");

        // Every piece that is NOT the sleeve keeps its outline byte-identical
        // (raglan only re-marks; it does not move body outlines).
        bool bodiesSame = true;
        for (size_t i = 0; i < dSet.pieces.size(); ++i) {
            if (dSet.pieces[i].name.find("Sleeve") != std::string::npos) continue;
            bodiesSame = bodiesSame && sameCommands(dSet.pieces[i].commands, dRag.pieces[i].commands);
        }
        check(bodiesSame, "every body piece OUTLINE byte-identical (raglan is markings + notes)");

        auto issues = PatternValidator::issues(rag, m0(), dRag);
        for (const auto& i : issues) std::printf("      ISSUE %s/%s: %s\n", i.rule.c_str(), i.piece.c_str(), i.detail.c_str());
        check(issues.empty(), "raglan top validates");

        // Raglan on a princess dress with a long sleeve also validates.
        GarmentSpec rd; rd.garment = GarmentType::Dress; rd.neckline = Neckline::VNeck;
        rd.shaping = Shaping::Princess; rd.skirtStyle = SkirtStyle::Straight;
        rd.sleeveStyle = SleeveStyle::Straight; rd.sleeveLength = SleeveLength::Long;
        rd.shoulderStyle = static_cast<int>(ShoulderStyle::Raglan);
        const DraftedPattern dRD = GarmentDrafter::draft(rd, m0());
        auto rdi = PatternValidator::issues(rd, m0(), dRD);
        for (const auto& i : rdi) std::printf("      DRESS ISSUE %s/%s: %s\n", i.rule.c_str(), i.piece.c_str(), i.detail.c_str());
        check(rdi.empty(), "raglan princess dress validates");
        std::printf("\n");
    }

    // ---- 4. Honest limits ----
    {
        std::printf("Honest limits (halter, skirt, sleeveless, refusal):\n");
        // Halter: no shoulder seam — both styles must be ignored (byte-identical
        // to the plain halter), never silently mis-drawn.
        GarmentSpec halterSet; halterSet.garment = GarmentType::Dress; halterSet.neckline = Neckline::Halter;
        halterSet.shaping = Shaping::Princess; halterSet.skirtStyle = SkirtStyle::ALine;
        GarmentSpec halterDrop = halterSet; halterDrop.shoulderStyle = static_cast<int>(ShoulderStyle::Dropped);
        GarmentSpec halterRag = halterSet; halterRag.shoulderStyle = static_cast<int>(ShoulderStyle::Raglan);
        const DraftedPattern hSet = GarmentDrafter::draft(halterSet, m0());
        const DraftedPattern hDrop = GarmentDrafter::draft(halterDrop, m0());
        const DraftedPattern hRag = GarmentDrafter::draft(halterRag, m0());
        bool halterUnchanged = hSet.pieces.size() == hDrop.pieces.size() &&
                               hSet.pieces.size() == hRag.pieces.size();
        for (size_t i = 0; halterUnchanged && i < hSet.pieces.size(); ++i)
            halterUnchanged = halterUnchanged &&
                sameCommands(hSet.pieces[i].commands, hDrop.pieces[i].commands) &&
                sameCommands(hSet.pieces[i].commands, hRag.pieces[i].commands);
        check(halterUnchanged, "halter ignores both dropped + raglan (byte-identical, no shoulder to move)");

        // Skirt: no bodice — a shoulder style is a no-op at the garment level.
        GarmentSpec skirt; skirt.garment = GarmentType::Skirt; skirt.skirtStyle = SkirtStyle::Straight;
        GarmentSpec skirtRag = skirt; skirtRag.shoulderStyle = static_cast<int>(ShoulderStyle::Raglan);
        const DraftedPattern sSet = GarmentDrafter::draft(skirt, m0());
        const DraftedPattern sRag = GarmentDrafter::draft(skirtRag, m0());
        bool skirtSame = sSet.pieces.size() == sRag.pieces.size();
        for (size_t i = 0; skirtSame && i < sSet.pieces.size(); ++i)
            skirtSame = skirtSame && sameCommands(sSet.pieces[i].commands, sRag.pieces[i].commands);
        check(skirtSame, "skirt: shoulder style is a byte-identical no-op");

        // Sleeveless raglan: the raglan is drawn on the body, honestly noted as a
        // cut-on shoulder (no raglan sleeve to build).
        GarmentSpec sl; sl.garment = GarmentType::Top; sl.neckline = Neckline::Crew;
        sl.shaping = Shaping::Dart; sl.topLength = TopLength::Hip; sl.sleeveStyle = SleeveStyle::None;
        sl.shoulderStyle = static_cast<int>(ShoulderStyle::Raglan);
        const DraftedPattern dSl = GarmentDrafter::draft(sl, m0());
        bool slNote = false;
        for (const auto& s : dSl.guideSteps)
            if (s.find("sleeveless") != std::string::npos && s.find("raglan") != std::string::npos) slNote = true;
        check(slNote, "sleeveless raglan is drawn on the body + honestly noted");
        check(PatternValidator::issues(sl, m0(), dSl).empty(), "sleeveless raglan validates");

        // Direct raglan on a skirt draft (no bodice) refuses with an honest note.
        DraftedPattern skirtDraft = GarmentDrafter::draft(skirt, m0());
        const size_t before = skirtDraft.guideSteps.size();
        const bool applied = ShoulderBlock::applyRaglan(skirtDraft, 100, 380);
        check(!applied, "direct applyRaglan refuses a draft with no front+back bodice");
        check(skirtDraft.guideSteps.size() == before + 1, "honest skip note added (no silent no-op)");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL SHOULDER CHECKS PASS\n" : "%d SHOULDER CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
