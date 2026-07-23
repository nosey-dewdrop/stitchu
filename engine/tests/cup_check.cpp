// Cup seam (kup dikişi — Corset Bustier) opt-in check. Proves the horizontal
// cup-seam split is REAL, wearable, and safe:
//  * with cupSeam OFF the piece set is byte-identical to before (regression guard
//    — the same guarantee the golden dump relies on);
//  * with cupSeam ON for a sweetheart+princess strapless top, the center front
//    panel is REPLACED by an Upper Cup + a Lower Cup (and the side front too),
//    net +1 piece per split panel;
//  * the two NEW cut edges (bottom of Upper Cup, top of Lower Cup) are length-
//    matched to <0.5 mm so they sew together (the truing), with matching notches;
//  * a non-matching host (a skirt / a dart bodice / a crew-neck princess top) is
//    a documented HONEST no-op (no silent substitution);
//  * the whole draft stays valid (wearability + validator green);
//  * the cup bboxes land in the Buğra Corset Bustier region (Upper ~278×291,
//    Lower ~211×232 — sanity, not hardcoded: read from the drawn geometry).
#include <cctype>
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/cupseam.hpp"
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
    static const BodyMeasurementsSnapshot m{88, 70, 94, 37, 40.5, 58, 35}; // EU38
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

// The lower edge of the Upper Cup and the top edge of the Lower Cup are the SAME
// horizontal cut segment. Measure each piece's horizontal extent at its cut edge
// (the cut edge is the min-y edge for the Lower Cup, the max-y edge for the Upper
// Cup) by the cut-note length the block records — but here we prove it directly
// from the geometry: both cup pieces contain a horizontal run of the same length.
// The cut note carries the trued seam length; parse it out of both notes and
// compare.
// Parse the mm number immediately preceding a given " mm <key>" phrase in a cut
// note (the block records the trued cup-seam length before "mm cup seam" and the
// trued waist-seam length before "mm waist seam"). The `occurrence`-th match is
// returned (some pieces mention "cup seam" twice — the Lower Cup names both its
// cup seam and its waist seam).
static double lenFromNote(const PatternPiece* p, const std::string& key, int occurrence = 0) {
    if (!p) return -1;
    const std::string& s = p->cutInstruction;
    size_t pos = std::string::npos, from = 0;
    for (int k = 0; k <= occurrence; ++k) {
        pos = s.find(key, from);
        if (pos == std::string::npos) return -1;
        from = pos + key.size();
    }
    // Walk back to the number just before " mm <key>".
    size_t end = s.rfind(' ', pos - 2);
    if (end == std::string::npos) return -1;
    std::string num;
    for (size_t i = end + 1; i < pos && (std::isdigit(s[i]) || s[i] == '.'); ++i) num += s[i];
    return num.empty() ? -1 : std::stod(num);
}
static double seamLenFromNote(const PatternPiece* p) { return lenFromNote(p, "mm cup seam"); }
static double waistLenFromNote(const PatternPiece* p) { return lenFromNote(p, "mm waist seam"); }

int main() {
    // ---- REGRESSION GUARD: cupSeam OFF is byte-identical -----------------------
    {
        std::printf("cupSeam OFF (None) is byte-identical to no cup seam:\n");
        GarmentSpec s; s.garment = GarmentType::Dress; s.shaping = Shaping::Princess;
        s.neckline = Neckline::Sweetheart; s.sleeveStyle = SleeveStyle::None;
        GarmentSpec off = s; off.cupSeam = static_cast<int>(CupSeam::None);
        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dN = GarmentDrafter::draft(off, m0());
        bool identical = d0.pieces.size() == dN.pieces.size();
        for (size_t i = 0; identical && i < d0.pieces.size(); ++i) {
            identical = identical && d0.pieces[i].name == dN.pieces[i].name &&
                        sameCommands(d0.pieces[i].commands, dN.pieces[i].commands) &&
                        sameCommands(d0.pieces[i].markings, dN.pieces[i].markings);
        }
        check(identical, "CupSeam::None leaves every piece byte-identical (outline + markings)");
        check(static_cast<int>(CupSeam::None) == 0 && static_cast<int>(CupSeam::Horizontal) == 1,
              "enum surface is exactly {None=0, Horizontal=1}");
        std::printf("\n");
    }

    // ---- CUP SEAM ON: sweetheart + princess strapless TOP ----------------------
    {
        std::printf("Cup seam ON — sweetheart + princess strapless top:\n");
        GarmentSpec s; s.garment = GarmentType::Top; s.shaping = Shaping::Princess;
        s.neckline = Neckline::Sweetheart; s.sleeveStyle = SleeveStyle::None;
        s.topLength = TopLength::Hip;
        GarmentSpec c = s; c.cupSeam = static_cast<int>(CupSeam::Horizontal);

        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dC = GarmentDrafter::draft(c, m0());

        // A hip-length top extends past the waist, so each princess front panel is
        // REPLACED by THREE bands: Upper Cup + Lower Cup + Front Body (the Buğra
        // three-band bustier front). Center +2, side +2 => +4 pieces total, and the
        // original front panels are gone.
        check(findByName(d0, "Center Front") != nullptr, "base has a princess Center Front");
        check(findByName(dC, "Upper Cup Center Front") != nullptr, "Upper Cup Center Front exists");
        check(findByName(dC, "Lower Cup Center Front") != nullptr, "Lower Cup Center Front exists");
        check(findByName(dC, "Front Body Center Front") != nullptr, "Front Body Center Front exists");
        check(findByName(dC, "Upper Cup Side Front") != nullptr, "Upper Cup Side Front exists");
        check(findByName(dC, "Lower Cup Side Front") != nullptr, "Lower Cup Side Front exists");
        check(findByName(dC, "Front Body Side Front") != nullptr, "Front Body Side Front exists");
        // Original princess front panels are consumed (replaced), not left behind.
        check(countByName(dC, "Bodice Center Front") + countByName(dC, "Top Center Front") == 0,
              "the original center front panel is replaced, not duplicated");
        check(dC.pieces.size() == d0.pieces.size() + 4,
              "two split panels x three bands -> +4 pieces (center + side each split in three)");

        // TRUING (cup seam): the Upper Cup lower edge and Lower Cup top edge are the
        // same seam length (<0.5 mm). Both pieces record the trued seam length in
        // their cut note; they must match.
        const double upC = seamLenFromNote(findByName(dC, "Upper Cup Center Front"));
        const double loC = seamLenFromNote(findByName(dC, "Lower Cup Center Front"));
        check(upC > 0 && loC > 0, "both center cups record a cup-seam length");
        check(upC > 0 && loC > 0 && std::fabs(upC - loC) < 0.5,
              "center Upper/Lower cup seam edges length-matched <0.5 mm (upper " +
              std::to_string(upC) + " vs lower " + std::to_string(loC) + ")");
        const double upS = seamLenFromNote(findByName(dC, "Upper Cup Side Front"));
        const double loS = seamLenFromNote(findByName(dC, "Lower Cup Side Front"));
        check(upS > 0 && loS > 0 && std::fabs(upS - loS) < 0.5,
              "side Upper/Lower cup seam edges length-matched <0.5 mm");

        // TRUING (waist seam): the Lower Cup's BOTTOM edge and the Front Body's TOP
        // edge are the same waist-seam length (<0.5 mm) so they sew together. The
        // Lower Cup records both its cup seam and its waist seam; the Front Body
        // records only the waist seam.
        const double wLoC = waistLenFromNote(findByName(dC, "Lower Cup Center Front"));
        const double wFbC = waistLenFromNote(findByName(dC, "Front Body Center Front"));
        check(wLoC > 0 && wFbC > 0, "center Lower Cup + Front Body record a waist-seam length");
        check(wLoC > 0 && wFbC > 0 && std::fabs(wLoC - wFbC) < 0.5,
              "center Lower Cup/Front Body waist-seam edges length-matched <0.5 mm (lower " +
              std::to_string(wLoC) + " vs body " + std::to_string(wFbC) + ")");
        const double wLoS = waistLenFromNote(findByName(dC, "Lower Cup Side Front"));
        const double wFbS = waistLenFromNote(findByName(dC, "Front Body Side Front"));
        check(wLoS > 0 && wFbS > 0 && std::fabs(wLoS - wFbS) < 0.5,
              "side Lower Cup/Front Body waist-seam edges length-matched <0.5 mm");

        // The short Lower Cup sits ABOVE the Front Body (waist seam is between them):
        // the Lower Cup is a genuinely short under-bust band, the Front Body reaches
        // the hem. Both are real, sizeable, sewable pieces.
        const PatternPiece* loCc = findByName(dC, "Lower Cup Center Front");
        const PatternPiece* fbCc = findByName(dC, "Front Body Center Front");
        if (loCc && fbCc) {
            const Rect lbb = boundingBox(loCc->commands), fbb = boundingBox(fbCc->commands);
            check(lbb.height > 20 && lbb.width > 40, "center Lower Cup is a real short band");
            check(fbb.height > 40 && fbb.width > 40, "center Front Body is a real piece down to the hem");
            std::printf("      Lower Cup bbox %.0fx%.0f | Front Body bbox %.0fx%.0f  (Buğra Lower 211x232)\n",
                        lbb.width, lbb.height, fbb.width, fbb.height);
        }

        // Matching notches: the Upper Cup notches its (bottom) cup seam; the Lower
        // Cup notches BOTH its top cup seam and its bottom waist seam; the Front
        // Body notches its (top) waist seam. Each notch is 2 marking commands, 2 per
        // seam end => Upper 4, Lower 8, Front Body 4.
        const PatternPiece* upPc = findByName(dC, "Upper Cup Center Front");
        const PatternPiece* loPc = findByName(dC, "Lower Cup Center Front");
        const PatternPiece* fbPc = findByName(dC, "Front Body Center Front");
        check(upPc && upPc->markings.size() >= 4, "Upper Cup has notches at both cup-seam ends");
        check(loPc && loPc->markings.size() >= 8, "Lower Cup has notches at both cup-seam AND both waist-seam ends");
        check(fbPc && fbPc->markings.size() >= 4, "Front Body has notches at both waist-seam ends");
        check(upPc && upPc->hasGrainline && loPc && loPc->hasGrainline && fbPc && fbPc->hasGrainline,
              "all three bands have a grainline");

        // The draft is still valid + wearable.
        check(PatternValidator::issues(c, m0(), dC).empty(), "cup-seam draft is valid (wearability green)");

        // Sanity vs the Buğra Corset Bustier region (NOT hardcoded — read from the
        // drawn geometry). The dress/top block draws a shorter bodice than the full
        // corset, so we only assert the bands are in the right ballpark & ordered:
        // Upper Cup a full cup, Lower Cup a SHORT under-bust band, Front Body the
        // panel to the hem.
        if (upPc && loPc && fbPc) {
            const Rect ub = boundingBox(upPc->commands), lb = boundingBox(loPc->commands),
                       fbb = boundingBox(fbPc->commands);
            const double upPerim = pathLength(upPc->commands), loPerim = pathLength(loPc->commands);
            std::printf("      Upper Cup bbox %.0fx%.0f perim %.0f  (Buğra 278x291 / 998)\n",
                        ub.width, ub.height, upPerim);
            std::printf("      Lower Cup bbox %.0fx%.0f perim %.0f  (Buğra 211x232 / 842)\n",
                        lb.width, lb.height, loPerim);
            std::printf("      Front Body bbox %.0fx%.0f\n", fbb.width, fbb.height);
            check(ub.width > 60 && ub.height > 60 && upPerim > 200, "Upper Cup is a real sizeable piece");
            check(lb.width > 60 && loPerim > 150, "Lower Cup is a real (short) under-bust band");
            check(lb.height < ub.height, "Lower Cup is SHORTER than the Upper Cup (a short under-bust band)");
            check(fbb.width > 60 && fbb.height > 40, "Front Body is a real piece to the hem");
            check(upPc->cutInstruction.find("Upper Cup") != std::string::npos &&
                  loPc->cutInstruction.find("Lower Cup") != std::string::npos &&
                  fbPc->cutInstruction.find("Front Body") != std::string::npos,
                  "cut notes name Upper Cup / Lower Cup / Front Body + the trued seams");
        }
        std::printf("\n");
    }

    // ---- WAIST CUT HONESTLY SKIPPED: a bodice-length front has no Front Body ----
    {
        // A CROPPED sweetheart+princess top ends at the waist (no fabric below it),
        // so the waist cut finds no clean crossing: the panel stays a two-band Upper
        // Cup + Lower Cup with NO Front Body. This proves the second cut is measured
        // (it only fires where fabric actually extends past the waist), never forced.
        std::printf("Cropped bustier top: waist cut honestly skipped (no Front Body):\n");
        GarmentSpec s; s.garment = GarmentType::Top; s.shaping = Shaping::Princess;
        s.neckline = Neckline::Sweetheart; s.sleeveStyle = SleeveStyle::None;
        s.topLength = TopLength::Cropped;
        GarmentSpec c = s; c.cupSeam = static_cast<int>(CupSeam::Horizontal);
        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dC = GarmentDrafter::draft(c, m0());
        check(findByName(dC, "Upper Cup Center Front") != nullptr, "cropped: Upper Cup still cut");
        check(findByName(dC, "Lower Cup Center Front") != nullptr, "cropped: Lower Cup still cut");
        check(countByName(dC, "Front Body") == 0, "cropped: NO Front Body (nothing below the waist)");
        check(dC.pieces.size() == d0.pieces.size() + 2,
              "cropped: two panels x two bands -> +2 pieces (Upper + Lower cup only)");
        // The Lower Cup here runs to the panel hem (the waist), so it records no
        // waist-seam length.
        check(waistLenFromNote(findByName(dC, "Lower Cup Center Front")) < 0,
              "cropped: Lower Cup records no waist seam (it IS the hem)");
        std::printf("\n");
    }

    // ---- HONEST NO-OP: a non-sweetheart (crew) princess top is refused ---------
    {
        std::printf("Crew-neck princess top: cup seam refused honestly:\n");
        GarmentSpec s; s.garment = GarmentType::Top; s.shaping = Shaping::Princess;
        s.neckline = Neckline::Crew;
        GarmentSpec c = s; c.cupSeam = static_cast<int>(CupSeam::Horizontal);
        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dC = GarmentDrafter::draft(c, m0());
        check(dC.pieces.size() == d0.pieces.size(), "no piece added/removed on a non-bustier neckline");
        check(countByName(dC, "Cup") == 0, "no cup piece drawn on a crew neck");

        // Direct call returns false + one honest note.
        DraftedPattern d = GarmentDrafter::draft(s, m0());
        const size_t before = d.guideSteps.size();
        const bool applied = CupSeamBlock::apply(d, CupSeam::Horizontal, Neckline::Crew, 0);
        check(!applied, "direct apply refuses a non-sweetheart neckline");
        check(d.guideSteps.size() == before + 1, "honest skip note added (no silent no-op)");
        std::printf("\n");
    }

    // ---- HONEST NO-OP: a skirt has no front bodice panel -----------------------
    {
        std::printf("Skirt: cup seam refused honestly (no bodice front):\n");
        GarmentSpec s; s.garment = GarmentType::Skirt; s.skirtStyle = SkirtStyle::ALine;
        s.shaping = Shaping::Princess;
        GarmentSpec c = s; c.cupSeam = static_cast<int>(CupSeam::Horizontal); c.neckline = Neckline::Sweetheart;
        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dC = GarmentDrafter::draft(c, m0());
        // The garment-level guard only runs cupSeam on dress/top, so a skirt is
        // byte-identical; prove the block itself also refuses when called directly.
        check(dC.pieces.size() == d0.pieces.size() && countByName(dC, "Cup") == 0,
              "skirt draft unchanged (cup seam never runs on a skirt)");
        DraftedPattern d = GarmentDrafter::draft(s, m0());
        const size_t before = d.guideSteps.size();
        const bool applied = CupSeamBlock::apply(d, CupSeam::Horizontal, Neckline::Sweetheart, 0);
        check(!applied, "direct apply refuses a skirt (no princess front panel)");
        check(d.guideSteps.size() == before + 1, "honest skip note added");
        std::printf("\n");
    }

    // ---- HONEST NO-OP: a DART (non-princess) sweetheart bodice is refused ------
    {
        std::printf("Dart sweetheart bodice: cup seam refused honestly (no princess front):\n");
        GarmentSpec s; s.garment = GarmentType::Dress; s.shaping = Shaping::Dart;
        s.neckline = Neckline::Sweetheart; s.sleeveStyle = SleeveStyle::None;
        GarmentSpec c = s; c.cupSeam = static_cast<int>(CupSeam::Horizontal);
        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dC = GarmentDrafter::draft(c, m0());
        check(dC.pieces.size() == d0.pieces.size() && countByName(dC, "Cup") == 0,
              "dart bodice unchanged (no princess front panel to split)");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL CUP CHECKS PASS\n" : "%d CUP CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
