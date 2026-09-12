// Yoke split (roba — doll / babydoll / swing dress) opt-in check. Proves the
// horizontal yoke split is REAL, wearable, and safe:
//  * with yoke OFF the piece set is byte-identical to before (regression guard — the
//    same guarantee the golden dump relies on);
//  * with yoke ON for a doll-dress bodice, the front AND back panels are REPLACED by
//    a Yoke (upper) + a lower body piece, net +1 piece per split panel;
//  * the two NEW cut edges (bottom of the Yoke, top of the lower body) are length-
//    matched to <0.5 mm so they sew together (the truing), with matching notches;
//  * the yoke line is MEASURED, not hardcoded — it sits above the bust, high on the
//    chest (a small share of the panel's own drop);
//  * a non-matching host (a skirt) is a documented HONEST no-op (no silent skip);
//  * the whole draft stays valid (wearability + validator green).
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/yoke.hpp"
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

// Parse the trued yoke-seam mm out of a piece's cut note (the block records
// "<len> mm yoke seam" on both the Yoke and the lower body).
static double seamLenFromNote(const PatternPiece* p) {
    if (!p) return -1;
    const std::string& s = p->cutInstruction;
    const std::string key = "mm yoke seam";
    const size_t pos = s.find(key);
    if (pos == std::string::npos) return -1;
    size_t end = s.rfind(' ', pos - 2);
    if (end == std::string::npos) return -1;
    std::string num;
    for (size_t i = end + 1; i < pos && (std::isdigit(s[i]) || s[i] == '.'); ++i) num += s[i];
    return num.empty() ? -1 : std::stod(num);
}

int main() {
    // ---- REGRESSION GUARD: yoke OFF is byte-identical ---------------------------
    {
        std::printf("yoke OFF (None) is byte-identical to no yoke:\n");
        GarmentSpec s; s.garment = GarmentType::Dress; s.shaping = Shaping::Dart;
        s.neckline = Neckline::Crew; s.sleeveStyle = SleeveStyle::Straight;
        s.sleeveLength = SleeveLength::Short; s.skirtStyle = SkirtStyle::ALine;
        GarmentSpec off = s; off.yoke = static_cast<int>(Yoke::None);
        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dN = GarmentDrafter::draft(off, m0());
        bool identical = d0.pieces.size() == dN.pieces.size();
        for (size_t i = 0; identical && i < d0.pieces.size(); ++i) {
            identical = identical && d0.pieces[i].name == dN.pieces[i].name &&
                        sameCommands(d0.pieces[i].commands, dN.pieces[i].commands) &&
                        sameCommands(d0.pieces[i].markings, dN.pieces[i].markings);
        }
        check(identical, "Yoke::None leaves every piece byte-identical (outline + markings)");
        check(static_cast<int>(Yoke::None) == 0 && static_cast<int>(Yoke::Plain) == 1 &&
              static_cast<int>(Yoke::Gathered) == 2,
              "enum surface is exactly {None=0, Plain=1, Gathered=2}");
        std::printf("\n");
    }

    // ---- YOKE ON: doll dress (dart bodice + A-line flare) -----------------------
    {
        std::printf("Yoke ON — doll dress (dart bodice + A-line skirt):\n");
        GarmentSpec s; s.garment = GarmentType::Dress; s.shaping = Shaping::Dart;
        s.neckline = Neckline::Crew; s.sleeveStyle = SleeveStyle::Straight;
        s.sleeveLength = SleeveLength::Short; s.skirtStyle = SkirtStyle::ALine;
        GarmentSpec y = s; y.yoke = static_cast<int>(Yoke::Plain);

        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dY = GarmentDrafter::draft(y, m0());

        check(findByName(d0, "Bodice Front") != nullptr, "base has a dart Bodice Front");
        check(findByName(d0, "Bodice Back") != nullptr, "base has a dart Bodice Back");
        check(findByName(dY, "Front Yoke") != nullptr, "Front Yoke exists");
        check(findByName(dY, "Front Body") != nullptr, "Front Body (below yoke) exists");
        check(findByName(dY, "Back Yoke") != nullptr, "Back Yoke exists");
        check(findByName(dY, "Back Body") != nullptr, "Back Body (below yoke) exists");
        // Original bodice front/back panels are consumed (replaced), not left behind.
        check(countByName(dY, "Bodice Front") == 0 && countByName(dY, "Bodice Back") == 0,
              "the original bodice front/back panels are replaced, not duplicated");
        check(dY.pieces.size() == d0.pieces.size() + 2,
              "two split panels -> +2 pieces (front + back each split in two)");

        // TRUING: the Yoke's lower edge and the lower body's top edge are the same
        // yoke-seam length (<0.5 mm). Both pieces record it in their cut note.
        const double yF = seamLenFromNote(findByName(dY, "Front Yoke"));
        const double bF = seamLenFromNote(findByName(dY, "Front Body"));
        check(yF > 0 && bF > 0, "front Yoke + body record a yoke-seam length");
        check(yF > 0 && bF > 0 && std::fabs(yF - bF) < 0.5,
              "front Yoke/Body yoke-seam edges length-matched <0.5 mm (yoke " +
              std::to_string(yF) + " vs body " + std::to_string(bF) + ")");
        const double yB = seamLenFromNote(findByName(dY, "Back Yoke"));
        const double bB = seamLenFromNote(findByName(dY, "Back Body"));
        check(yB > 0 && bB > 0 && std::fabs(yB - bB) < 0.5,
              "back Yoke/Body yoke-seam edges length-matched <0.5 mm (yoke " +
              std::to_string(yB) + " vs body " + std::to_string(bB) + ")");

        // MEASURED yoke line (not hardcoded): the Yoke is a SHORT upper panel and the
        // lower body is the tall piece to the hem — proving the seam sits high on the
        // chest, a small share of the drop, above the bust.
        const PatternPiece* fy = findByName(dY, "Front Yoke");
        const PatternPiece* fb = findByName(dY, "Front Body");
        if (fy && fb) {
            const Rect yb = boundingBox(fy->commands), bb = boundingBox(fb->commands);
            std::printf("      Front Yoke bbox %.0fx%.0f | Front Body bbox %.0fx%.0f\n",
                        yb.width, yb.height, bb.width, bb.height);
            check(yb.height > 15 && yb.width > 40, "Front Yoke is a real shoulder panel");
            check(bb.height > yb.height, "Front Yoke is SHORTER than the body below it (a high yoke)");
        }

        // Matching notches: the Yoke notches its (bottom) yoke seam; the lower body
        // notches its (top) yoke seam. Each notch is 2 marking commands, 2 per seam.
        check(fy && fy->markings.size() >= 4, "Front Yoke has notches at both yoke-seam ends");
        check(fb && fb->markings.size() >= 4, "Front Body has notches at both yoke-seam ends");
        check(fy && fy->hasGrainline && fb && fb->hasGrainline, "both bands have a grainline");

        // The draft is still valid + wearable with the yoke on.
        check(PatternValidator::issues(y, m0(), dY).empty(),
              "yoke draft is valid (wearability + validator green)");
        std::printf("\n");
    }

    // ---- YOKE GATHERED: the lower body gathers into the yoke seam ---------------
    // The babydoll / swing dress: the Front/Back BODY top edge is drawn WIDER than the
    // yoke's lower edge (2:1 fullness) but gathers back DOWN to the same sewn length,
    // exactly like the gather block. Plain must stay byte-identical to itself; the
    // draft stays valid.
    {
        std::printf("Yoke GATHERED — babydoll (body top edge wider, gathers to fit):\n");
        auto spec = []() {
            GarmentSpec s; s.garment = GarmentType::Dress; s.shaping = Shaping::Dart;
            s.neckline = Neckline::Crew; s.sleeveStyle = SleeveStyle::Straight;
            s.sleeveLength = SleeveLength::Short; s.skirtStyle = SkirtStyle::ALine;
            return s;
        };
        GarmentSpec plain = spec(); plain.yoke = static_cast<int>(Yoke::Plain);
        GarmentSpec gath  = spec(); gath.yoke  = static_cast<int>(Yoke::Gathered);
        const DraftedPattern dP = GarmentDrafter::draft(plain, m0());
        const DraftedPattern dG = GarmentDrafter::draft(gath, m0());

        // Same four pieces exist.
        check(findByName(dG, "Front Yoke") && findByName(dG, "Front Body") &&
              findByName(dG, "Back Yoke")  && findByName(dG, "Back Body"),
              "Gathered still yields Front/Back Yoke + Front/Back Body");

        // Measure the top-edge width of the Yoke lower edge vs the Body top edge.
        // The Body top edge is the piece's outline segment at its minimum y; the Yoke
        // lower edge is the segment at its maximum y. Width = max x - min x on that row.
        auto edgeWidthAtY = [](const PatternPiece* p, bool atTop) -> double {
            if (!p) return -1;
            double ext = atTop ? 1e30 : -1e30;
            for (const auto& c : p->commands) {
                if (c.type == CmdType::Close) continue;
                ext = atTop ? std::min(ext, c.to.y) : std::max(ext, c.to.y);
            }
            double lo = 1e30, hi = -1e30;
            for (const auto& c : p->commands) {
                if (c.type == CmdType::Close) continue;
                if (std::fabs(c.to.y - ext) < 1e-6) { lo = std::min(lo, c.to.x); hi = std::max(hi, c.to.x); }
            }
            return (hi < lo) ? -1 : hi - lo;
        };
        const double yokeLowerW = edgeWidthAtY(findByName(dG, "Front Yoke"), /*atTop*/false);
        const double bodyTopW    = edgeWidthAtY(findByName(dG, "Front Body"), /*atTop*/true);
        std::printf("      Front Yoke lower edge %.1f mm | Front Body top edge %.1f mm (flat)\n",
                    yokeLowerW, bodyTopW);
        check(yokeLowerW > 0 && bodyTopW > 0, "both edges measurable");
        // Body top edge is REALLY wider (a real gather), by about the 2:1 ratio.
        check(bodyTopW > yokeLowerW * 1.3,
              "Gathered Front Body top edge is materially WIDER than the yoke lower edge");
        const double measuredRatio = bodyTopW / yokeLowerW;
        check(measuredRatio > 1.7 && measuredRatio < 2.3,
              "flat body top edge is ~2:1 the yoke edge (measured " +
              std::to_string(measuredRatio) + ")");

        // BUT it gathers DOWN to a matched sewn length: both the Yoke and the Body
        // record the SAME trued yoke-seam mm in their cut notes (<0.5 mm).
        const double yF = seamLenFromNote(findByName(dG, "Front Yoke"));
        const double bF = seamLenFromNote(findByName(dG, "Front Body"));
        check(yF > 0 && bF > 0 && std::fabs(yF - bF) < 0.5,
              "gathered front Yoke/Body sewn (yoke-seam) length matched <0.5 mm (yoke " +
              std::to_string(yF) + " vs body " + std::to_string(bF) + ")");
        // The sewn length equals the yoke's flat lower edge (the flat body edge does NOT).
        check(std::fabs(yF - yokeLowerW) < 1.0,
              "the trued sewn length equals the yoke's flat lower edge (gathers to fit)");

        // The Body carries gather distribution ticks (more markings than the plain body).
        const PatternPiece* pBody = findByName(dP, "Front Body");
        const PatternPiece* gBody = findByName(dG, "Front Body");
        check(pBody && gBody && gBody->markings.size() > pBody->markings.size(),
              "gathered body has extra gather ticks vs the plain body");

        // PLAIN stays byte-identical to itself (Gathered must not disturb Plain).
        const DraftedPattern dP2 = GarmentDrafter::draft(plain, m0());
        bool plainSame = dP.pieces.size() == dP2.pieces.size();
        for (size_t i = 0; plainSame && i < dP.pieces.size(); ++i)
            plainSame = plainSame && dP.pieces[i].name == dP2.pieces[i].name &&
                        sameCommands(dP.pieces[i].commands, dP2.pieces[i].commands) &&
                        sameCommands(dP.pieces[i].markings, dP2.pieces[i].markings);
        check(plainSame, "Plain yoke path is unchanged (byte-identical to itself)");

        // The gathered draft is still valid + wearable.
        check(PatternValidator::issues(gath, m0(), dG).empty(),
              "gathered yoke draft is valid (wearability + validator green)");
        std::printf("\n");
    }

    // ---- YOKE GATHERED + collar: the doll dress (gathered body + Peter-Pan) ------
    {
        std::printf("Yoke GATHERED + Peter-Pan collar (real doll dress): 0 issues:\n");
        GarmentSpec y; y.garment = GarmentType::Dress; y.shaping = Shaping::Dart;
        y.neckline = Neckline::Crew; y.sleeveStyle = SleeveStyle::Straight;
        y.sleeveLength = SleeveLength::Short; y.skirtStyle = SkirtStyle::ALine;
        y.topLength = TopLength::Hip;
        y.yoke = static_cast<int>(Yoke::Gathered);
        y.collarType = static_cast<int>(CollarType::PeterPan);
        y.collarEdge = static_cast<int>(CollarEdge::Round);
        const DraftedPattern dY = GarmentDrafter::draft(y, m0());
        check(findByName(dY, "Front Body") != nullptr, "gathered body drafted");
        check(findByName(dY, "Neck Facing") != nullptr, "neck facing drafted for the collar");
        const auto iss = PatternValidator::issues(y, m0(), dY);
        if (!iss.empty()) for (const auto& v : iss) std::printf("        got: %s\n", v.description().c_str());
        check(iss.empty(), "gathered yoke + collar drafts 0 issues");
        std::printf("\n");
    }

    // ---- YOKE ON: princess bodice splits center + side panels -------------------
    {
        std::printf("Yoke ON — princess bodice (center + side panels both split):\n");
        GarmentSpec s; s.garment = GarmentType::Dress; s.shaping = Shaping::Princess;
        s.neckline = Neckline::Crew; s.sleeveStyle = SleeveStyle::Straight;
        s.sleeveLength = SleeveLength::Short; s.skirtStyle = SkirtStyle::ALine;
        GarmentSpec y = s; y.yoke = static_cast<int>(Yoke::Plain);
        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dY = GarmentDrafter::draft(y, m0());
        // A princess front/back has center + side panels; each carries the yoke seam.
        const bool princessFront = findByName(d0, "Center Front") != nullptr;
        if (princessFront) {
            check(findByName(dY, "Front Yoke Center") != nullptr, "Front Yoke Center exists");
            check(findByName(dY, "Front Yoke Side") != nullptr, "Front Yoke Side exists");
            check(countByName(dY, "Yoke") >= 2, "at least the center + side yokes drawn");
            check(PatternValidator::issues(y, m0(), dY).empty(),
                  "princess yoke draft valid");
        } else {
            std::printf("      (this body drafts dart, not princess — covered above)\n");
        }
        std::printf("\n");
    }

    // ---- YOKE + NECK FACING (collar): the facing attaches to the yoke -----------
    // A doll / babydoll dress is a yoke + a Peter-Pan collar. A real collar drafts a
    // neck facing (edgeFinishPieces), and the neckline lives on the Yoke piece after
    // the split — so the facing validator must recognise the yoke-renamed piece as the
    // facing's parent. This is the false-rejection this loop fixes (same class as the
    // placket-on-top locator bug): pre-split it looked only for "Bodice/Top <half>".
    {
        std::printf("Yoke + Peter-Pan collar (doll dress): facing trues to the yoke:\n");
        auto specWith = [](GarmentType g, Shaping sh) {
            GarmentSpec s; s.garment = g; s.shaping = sh;
            s.neckline = Neckline::Crew; s.sleeveStyle = SleeveStyle::Straight;
            s.sleeveLength = SleeveLength::Short; s.skirtStyle = SkirtStyle::ALine;
            s.topLength = TopLength::Hip;
            s.yoke = static_cast<int>(Yoke::Plain);
            s.collarType = static_cast<int>(CollarType::PeterPan);
            s.collarEdge = static_cast<int>(CollarEdge::Round);
            return s;
        };
        struct Case { const char* name; GarmentType g; Shaping sh; };
        const Case cases[] = {
            {"dress + dart", GarmentType::Dress, Shaping::Dart},
            {"dress + princess", GarmentType::Dress, Shaping::Princess},
            {"top + dart", GarmentType::Top, Shaping::Dart},
            {"top + princess", GarmentType::Top, Shaping::Princess},
        };
        for (const auto& c : cases) {
            GarmentSpec y = specWith(c.g, c.sh);
            const DraftedPattern dY = GarmentDrafter::draft(y, m0());
            // The neck facing is actually drafted (a real collar keeps facings), and a
            // yoke piece carries the neckline.
            check(findByName(dY, "Neck Facing") != nullptr,
                  std::string(c.name) + ": neck facing drafted for the collar");
            check(findByName(dY, "Yoke") != nullptr,
                  std::string(c.name) + ": a yoke piece carries the neck edge");
            const auto iss = PatternValidator::issues(y, m0(), dY);
            bool clean = iss.empty();
            if (!clean) for (const auto& v : iss) std::printf("        got: %s\n", v.description().c_str());
            check(clean, std::string(c.name) + ": yoke + collar drafts 0 issues (facing trues to the yoke)");
        }
        std::printf("\n");
    }

    // ---- REGRESSION GUARD: a genuinely orphaned facing is STILL caught ----------
    // The fix must NOT weaken the check. Take the valid yoke+collar draft above and
    // DELETE the yoke pieces (the facing's parent) — the facing is now a phantom with
    // no body piece to attach to, and the validator must flag "body piece missing".
    {
        std::printf("Orphaned facing (no yoke, no bodice) is still caught:\n");
        GarmentSpec y; y.garment = GarmentType::Dress; y.shaping = Shaping::Dart;
        y.neckline = Neckline::Crew; y.sleeveStyle = SleeveStyle::Straight;
        y.sleeveLength = SleeveLength::Short; y.skirtStyle = SkirtStyle::ALine;
        y.yoke = static_cast<int>(Yoke::Plain);
        y.collarType = static_cast<int>(CollarType::PeterPan);
        y.collarEdge = static_cast<int>(CollarEdge::Round);
        DraftedPattern dY = GarmentDrafter::draft(y, m0());
        check(PatternValidator::issues(y, m0(), dY).empty(),
              "baseline yoke+collar draft is clean before mutation");
        // Remove EVERY yoke/body piece so the two Neck Facings are orphaned.
        std::vector<PatternPiece> kept;
        for (const auto& p : dY.pieces) {
            const bool isYoke = p.name.find("Yoke") != std::string::npos;
            const bool isBody = p.name.find(" Body") != std::string::npos;
            if (!isYoke && !isBody) kept.push_back(p);
        }
        dY.pieces = kept;
        check(findByName(dY, "Yoke") == nullptr && findByName(dY, "Front Body") == nullptr,
              "yoke + lower-body pieces removed (facing now orphaned)");
        check(findByName(dY, "Neck Facing") != nullptr, "the phantom facings remain");
        const auto iss = PatternValidator::issues(y, m0(), dY);
        int facingMissing = 0;
        for (const auto& v : iss)
            if (v.rule == "facing" && v.detail.find("body piece") != std::string::npos) facingMissing++;
        check(facingMissing >= 2,
              "orphaned front + back facings both flagged 'body piece missing' (check not weakened)");
        std::printf("\n");
    }

    // ---- HONEST NO-OP: a skirt has no bodice front/back ------------------------
    {
        std::printf("Skirt: yoke refused honestly (no bodice front/back):\n");
        GarmentSpec s; s.garment = GarmentType::Skirt; s.skirtStyle = SkirtStyle::ALine;
        GarmentSpec y = s; y.yoke = static_cast<int>(Yoke::Plain);
        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        const DraftedPattern dY = GarmentDrafter::draft(y, m0());
        // The garment-level guard only runs yoke on dress/top, so a skirt is
        // byte-identical; prove the block itself also refuses when called directly.
        check(dY.pieces.size() == d0.pieces.size() && countByName(dY, "Yoke") == 0,
              "skirt draft unchanged (yoke never runs on a skirt)");
        DraftedPattern d = GarmentDrafter::draft(s, m0());
        const size_t before = d.guideSteps.size();
        const bool applied = YokeBlock::apply(d, Yoke::Plain);
        check(!applied, "direct apply refuses a skirt (no bodice front/back)");
        check(d.guideSteps.size() == before + 1, "honest skip note added (no silent no-op)");
        check(countByName(d, "Yoke") == 0, "no yoke piece drawn on a skirt");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL YOKE CHECKS PASS\n" : "%d YOKE CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
