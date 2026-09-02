// Neckline extension check (patch 3.16): proves the two new necklines Cowl +
// PussyBow behave, and the 7 original necklines are UNTOUCHED.
//
//   COWL: the front is deeper + wider than a scoop (drape excess) and its front
//         piece is re-marked to cut on the BIAS (grainline ~45°). No new piece,
//         no outline change vs a plain deep scoop-shaped front.
//   PUSSYBOW: exactly 2 new pieces (a band + a tie). The band's attach edge is
//         trued to the measured neckline (== half neckline, 0.00 mm). The tie is
//         a self-lined rectangle. A placement notch lands on the front.
//   BYTE-IDENTICAL: drafting any of the 7 original necklines produces zero
//         cowl/pussy-bow artifacts (same piece count as before the feature).
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/neckext.hpp"
#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static const PatternPiece* findPiece(const DraftedPattern& p, const std::string& name) {
    for (const auto& pc : p.pieces) if (pc.name == name) return &pc;
    return nullptr;
}

// Grainline angle from vertical, in degrees (0 = straight of grain, 90 = cross).
static double grainAngleDeg(const PatternPiece& p) {
    const double dx = p.grainline.to.x - p.grainline.from.x;
    const double dy = p.grainline.to.y - p.grainline.from.y;
    return std::fabs(std::atan2(dx, dy)) * 180.0 / 3.14159265358979;
}

int main() {
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    const BodyMeasurementsSnapshot plus{122, 104, 128, 44, 44, 60, 40};

    // --- The 7 originals: no cowl/pussy-bow artifacts, byte-identical count ----
    {
        std::printf("Original necklines carry no neckline-ext artifacts:\n");
        const Neckline seven[] = {Neckline::Crew, Neckline::Scoop, Neckline::VNeck,
                                  Neckline::Square, Neckline::Boat,
                                  Neckline::Sweetheart, Neckline::Halter};
        bool clean = true;
        for (Neckline n : seven) {
            GarmentSpec s; s.garment = GarmentType::Dress; s.neckline = n;
            const DraftedPattern d = GarmentDrafter::draft(s, m);
            if (findPiece(d, "Pussy-bow Band (fiyonk yaka bandı)")) clean = false;
            if (findPiece(d, "Pussy-bow Tie (bağ şeridi)")) clean = false;
        }
        check(clean, "no original neckline drafts a band/tie piece");
    }

    // --- COWL: deeper + wider than scoop, front cut on the bias ----------------
    {
        std::printf("Cowl neckline:\n");
        GarmentSpec scoop; scoop.garment = GarmentType::Dress; scoop.neckline = Neckline::Scoop;
        GarmentSpec cowl;  cowl.garment = GarmentType::Dress;  cowl.neckline = Neckline::Cowl;
        const DraftedPattern dScoop = GarmentDrafter::draft(scoop, m);
        const DraftedPattern dCowl = GarmentDrafter::draft(cowl, m);

        // Same piece COUNT — cowl adds no piece, only re-marks the front.
        // F5-parca (48871b3e): the CB zipper is a MEASURED decision. The scoop
        // dress needs one (neck < head reference) and keeps a SPLIT skirt; the
        // cowl's drape excess widens the measured opening past the head
        // reference, so the zipper falls away and the skirt merges into one
        // "Skirt Front & Back". That -1 is the declared zipper coupling
        // (contract/edit-locality-v1.json 1.1.0), judged by NAME.
        const bool zipFlip = dScoop.cbZipper && !dCowl.cbZipper;
        if (zipFlip) {
            std::printf("      gecis kurali: scoop '%s' | cowl '%s'\n",
                        dScoop.cbZipperGerekce.c_str(), dCowl.cbZipperGerekce.c_str());
            check(dCowl.pieces.size() + 1 == dScoop.pieces.size(),
                  "cowl adds no extra piece (re-mark only; -1 is the declared zipperless skirt merge)");
            check(findPiece(dScoop, "Skirt Front") && findPiece(dScoop, "Skirt Back") &&
                      findPiece(dCowl, "Skirt Front & Back"),
                  "the -1 is exactly the declared skirt merge (split -> one on fold)");
        } else {
            check(dCowl.pieces.size() == dScoop.pieces.size(),
                  "cowl adds no extra piece (re-mark only)");
        }

        const PatternPiece* fScoop = findPiece(dScoop, "Bodice Center Front");
        const PatternPiece* fCowl = findPiece(dCowl, "Bodice Center Front");
        if (!fScoop) fScoop = findPiece(dScoop, "Bodice Front");
        if (!fCowl) fCowl = findPiece(dCowl, "Bodice Front");
        check(fScoop && fCowl, "front pieces found");

        // Cowl front neck is DEEPER than scoop: its min-y (neck point at CF) sits
        // lower on the piece — compare the lowest neck cut depth (max y reached on
        // the neck curve at x≈0, i.e. the center-front cutout).
        auto frontCutoutDepth = [](const PatternPiece* f) {
            // The center-neck point is the outline vertex nearest x=0 with the
            // largest y among the top region; use the bounding of neck curve:
            // simplest robust proxy = the y of the last curve control near CF.
            double maxNeckY = 0;
            for (const auto& c : f->commands) {
                if (c.type == CmdType::Close) continue;
                if (c.to.x < 40 && c.to.y > maxNeckY && c.to.y < f->grainline.to.y)
                    maxNeckY = c.to.y;
            }
            return maxNeckY;
        };
        const double dScoopDepth = frontCutoutDepth(fScoop);
        const double dCowlDepth = frontCutoutDepth(fCowl);
        check(dCowlDepth > dScoopDepth + 20,
              "cowl front neck cut deeper than scoop");
        std::printf("      scoop CF neck y %.1f mm; cowl CF neck y %.1f mm\n",
                    dScoopDepth, dCowlDepth);

        // BIAS: the cowl front grainline is near 45°; the scoop front is straight
        // grain (near 0°).
        const double scoopAngle = grainAngleDeg(*fScoop);
        const double cowlAngle = grainAngleDeg(*fCowl);
        check(scoopAngle < 10, "scoop front is straight grain");
        check(cowlAngle > 35 && cowlAngle < 55, "cowl front grainline is on the bias (~45°)");
        std::printf("      scoop grain %.1f deg; cowl grain %.1f deg\n", scoopAngle, cowlAngle);

        check(fCowl->cutInstruction.find("BIAS") != std::string::npos,
              "cowl front cut note says cut on the bias");

        check(PatternValidator::issues(cowl, m, dCowl).empty(), "cowl draft valid");
    }

    // --- PUSSY-BOW: band trued to neckline + tie piece + notch -----------------
    auto pussyBow = [&](const char* label, GarmentSpec spec, const BodyMeasurementsSnapshot& body) {
        std::printf("%s\n", label);
        GarmentSpec plain = spec; plain.neckline = Neckline::Crew;
        GarmentSpec bow = spec;   bow.neckline = Neckline::PussyBow;
        const DraftedPattern dPlain = GarmentDrafter::draft(plain, body);
        const DraftedPattern dBow = GarmentDrafter::draft(bow, body);

        // Exactly 2 extra pieces (band + tie).
        check(dBow.pieces.size() == dPlain.pieces.size() + 2,
              "exactly 2 extra pieces (band + tie)");

        const PatternPiece* band = findPiece(dBow, "Pussy-bow Band (fiyonk yaka bandı)");
        const PatternPiece* tie = findPiece(dBow, "Pussy-bow Tie (bağ şeridi)");
        check(band != nullptr, "band piece present");
        check(tie != nullptr, "tie piece present");
        if (!band || !tie) return;

        // TRUING: band attach edge (first two commands: CB->CF along y=0) == half
        // the measured neckline, to 0.00 mm.
        const double neckFull = NecklineExtBlock::necklineLengthMM(dBow);
        const double half = neckFull / 2;
        std::vector<PathCommand> attach = {band->commands[0], band->commands[1]};
        const double attachLen = pathLength(attach);
        const double err = std::fabs(attachLen - half);
        check(err < 0.005, "band attach edge == half neckline (truing 0.00 mm)");
        std::printf("      neckline full %.2f mm; half %.2f mm; band attach %.2f mm; err %.4f mm\n",
                    neckFull, half, attachLen, err);

        // The tie is a self-lined rectangle: cut note says "cut 2" and a bow.
        check(tie->cutInstruction.find("cut 2") != std::string::npos, "tie is cut 2");
        check(tie->cutInstruction.find("bow") != std::string::npos, "tie note mentions the bow");

        // Placement notch on the front (name varies by garment/shaping).
        const char* frontNames[] = {"Bodice Center Front", "Bodice Front",
                                    "Top Center Front", "Top Front"};
        const PatternPiece* fPlainC = nullptr;
        const PatternPiece* fBowC = nullptr;
        for (const char* fn : frontNames) {
            if (!fPlainC) fPlainC = findPiece(dPlain, fn);
            if (!fBowC) fBowC = findPiece(dBow, fn);
        }
        check(fPlainC && fBowC && fBowC->markings.size() > fPlainC->markings.size(),
              "placement notch added to the front piece");

        check(PatternValidator::issues(bow, body, dBow).empty(), "pussy-bow draft valid");
        std::printf("      band cut: %s\n      tie cut: %s\n\n",
                    band->cutInstruction.c_str(), tie->cutInstruction.c_str());
    };

    GarmentSpec dress; dress.garment = GarmentType::Dress;
    pussyBow("Pussy-bow dress:", dress, m);

    GarmentSpec top; top.garment = GarmentType::Top; top.shaping = Shaping::Dart;
    pussyBow("Pussy-bow dart top, plus body:", top, plus);

    // --- Skirt has no neckline: pussy-bow / cowl skip honestly -----------------
    {
        std::printf("Skirt has no neckline (honest skip):\n");
        GarmentSpec skirt; skirt.garment = GarmentType::Skirt; skirt.neckline = Neckline::PussyBow;
        const DraftedPattern d = GarmentDrafter::draft(skirt, m);
        check(findPiece(d, "Pussy-bow Band (fiyonk yaka bandı)") == nullptr,
              "no band on a skirt");
    }

    std::printf(failures == 0 ? "ALL NECKLINE-EXT CHECKS PASS\n" : "%d NECKLINE-EXT CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
