// Ruffled shoulder straps (fırfırlı askı) opt-in check (queue #3): proves the
// ruffled strap is a REAL separate cut piece — exactly ONE extra strap piece is
// added, cut LONGER than the finished span by the fullness ratio (trued:
// cutLength - 2·SA == round(span · fullness), and span within [minSpan, maxSpan]),
// with a lengthwise fold + gather line + grainline, a placement notch on the front
// AND back, every existing outline byte-identical, a sleeved / halter garment is
// skipped honestly, and it coexists with a hem slit + open-back on one dress.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/strap.hpp"
#include "../src/openback.hpp"
#include "../src/slit.hpp"
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

static const PatternPiece* findStrap(const DraftedPattern& d) {
    for (const auto& p : d.pieces)
        if (p.name.find("Ruffled Strap") != std::string::npos) return &p;
    return nullptr;
}

// Parse the "gathered down to a NNN mm strap" span + the "NNN x NNN mm" cut size
// out of the cut note so truing is checked against the actual piece.
static void parseCut(const std::string& note, double& cutW, double& cutL, double& span) {
    cutW = cutL = span = 0;
    // cut ... "W x L mm ("
    const auto x = note.find(" x ");
    if (x != std::string::npos) {
        // W is the integer ending just before " x "
        size_t ws = x; while (ws > 0 && (isdigit(note[ws - 1]))) ws--;
        cutW = std::atof(note.substr(ws, x - ws).c_str());
        size_t ls = x + 3;
        cutL = std::atof(note.substr(ls).c_str());
    }
    const auto s = note.find("down to a ");
    if (s != std::string::npos) span = std::atof(note.substr(s + 10).c_str());
}

static void base(const char* label, GarmentSpec spec) {
    std::printf("%s\n", label);
    GarmentSpec plain = spec; plain.ruffledStraps = static_cast<int>(StrapStyle::None);
    GarmentSpec st = spec;    st.ruffledStraps = static_cast<int>(StrapStyle::Ruffled);

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m0());
    const DraftedPattern dSt = GarmentDrafter::draft(st, m0());

    // Exactly ONE extra piece (the strap pair, cut 2 from one piece).
    check(dSt.pieces.size() == dPlain.pieces.size() + 1, "exactly one extra strap piece");

    // Every original piece OUTLINE byte-identical (the strap only ADDS a piece +
    // notches; it never reshapes an existing outline).
    bool othersSame = dSt.pieces.size() >= dPlain.pieces.size();
    for (size_t i = 0; i < dPlain.pieces.size(); ++i)
        othersSame = othersSame && sameCommands(dPlain.pieces[i].commands, dSt.pieces[i].commands);
    check(othersSame, "every existing piece OUTLINE byte-identical");

    check(PatternValidator::issues(plain, m0(), dPlain).empty(), "base draft valid");
    check(PatternValidator::issues(st, m0(), dSt).empty(), "strap draft valid");

    const PatternPiece* strap = findStrap(dSt);
    check(strap != nullptr, "a Ruffled Strap piece exists");
    if (!strap) { std::printf("\n"); return; }

    // Cut note names cut 2, the cut size, the finished width + the strap span.
    check(strap->cutInstruction.find("cut 2") != std::string::npos, "cut note says cut 2");
    check(strap->cutInstruction.find("gathered down to a") != std::string::npos,
          "cut note names the finished strap span");

    double cutW = 0, cutL = 0, span = 0;
    parseCut(strap->cutInstruction, cutW, cutL, span);
    std::printf("      cutW=%.0f cutL=%.0f span=%.0f mm\n", cutW, cutL, span);

    // Span within the drafting window.
    check(span >= StrapBlock::minSpan - 1e-6 && span <= StrapBlock::maxSpan + 1e-6,
          "strap span within [minSpan, maxSpan]");
    // TRUING: the cut length carries the fullness — cutL - 2·SA == round(span·fullness).
    const double expectedCut = std::round(span * StrapBlock::fullness) + 2 * StrapBlock::SA;
    check(std::fabs(cutL - expectedCut) < 1e-6,
          "cut length == round(span · fullness) + 2·SA (truing 0.00 mm)");
    // Cut width self-lines: 2·finishedWidth + 2·SA.
    check(std::fabs(cutW - (2 * StrapBlock::finishedWidth + 2 * StrapBlock::SA)) < 1e-6,
          "cut width == 2·W + 2·SA (self-lined tube)");

    // A gather line + fold line + grainline exist on the strap.
    check(strap->hasGrainline, "strap has a grainline (grain runs the length)");
    check(strap->markings.size() >= 8, "strap carries fold + seam + gather markings");

    // A placement notch was added to BOTH front and back (2 cross ticks each = 4
    // markings each). Count markings on the front + back vs the plain draft.
    auto markingsOf = [](const DraftedPattern& d, std::initializer_list<const char*> names) {
        for (const char* n : names)
            for (const auto& p : d.pieces)
                if (p.name == n) return p.markings.size();
        return static_cast<size_t>(0);
    };
    const size_t frontPlain = markingsOf(dPlain, {"Bodice Center Front", "Bodice Front", "Top Center Front", "Top Front"});
    const size_t frontSt = markingsOf(dSt, {"Bodice Center Front", "Bodice Front", "Top Center Front", "Top Front"});
    const size_t backPlain = markingsOf(dPlain, {"Bodice Center Back", "Bodice Back", "Top Center Back", "Top Back"});
    const size_t backSt = markingsOf(dSt, {"Bodice Center Back", "Bodice Back", "Top Center Back", "Top Back"});
    check(frontSt > frontPlain, "placement notch added to the front");
    check(backSt > backPlain, "placement notch added to the back");
    std::printf("      cut note: %s\n\n", strap->cutInstruction.c_str());
}

int main() {
    // Sleeveless dress (square neck, no sleeve → carries ruffled straps).
    GarmentSpec dress; dress.garment = GarmentType::Dress; dress.neckline = Neckline::Square;
    dress.sleeveStyle = SleeveStyle::None; dress.skirtStyle = SkirtStyle::Gathered;
    dress.waistline = Waistline::Empire;
    base("Sleeveless babydoll dress + ruffled straps:", dress);

    // Sleeveless top (dart shaping).
    GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::Square;
    top.sleeveStyle = SleeveStyle::None; top.shaping = Shaping::Dart;
    base("Sleeveless top + ruffled straps:", top);

    // A SLEEVED garment: no shoulder edge for a separate strap → skipped honestly.
    {
        std::printf("Sleeved dress: ruffled straps skipped honestly:\n");
        GarmentSpec s; s.garment = GarmentType::Dress; s.neckline = Neckline::Crew;
        s.sleeveStyle = SleeveStyle::Straight;
        s.ruffledStraps = static_cast<int>(StrapStyle::Ruffled);
        GarmentSpec plain = s; plain.ruffledStraps = 0;
        const DraftedPattern dS = GarmentDrafter::draft(s, m0());
        const DraftedPattern dP = GarmentDrafter::draft(plain, m0());
        // The strap is gated out → on == off byte-identical.
        bool same = dS.pieces.size() == dP.pieces.size();
        for (size_t i = 0; same && i < dS.pieces.size(); ++i)
            same = same && sameCommands(dS.pieces[i].commands, dP.pieces[i].commands) &&
                   sameCommands(dS.pieces[i].markings, dP.pieces[i].markings);
        check(same, "sleeved dress: strap gated out, draft byte-identical");
        // Direct call also refuses + leaves an honest note.
        DraftedPattern dDirect = GarmentDrafter::draft(plain, m0());
        const size_t before = dDirect.guideSteps.size();
        const bool applied = StrapBlock::apply(dDirect, StrapStyle::Ruffled);
        check(!applied, "direct StrapBlock::apply refuses a sleeved garment");
        check(dDirect.guideSteps.size() == before + 1, "honest skip note added (no silent no-op)");
        check(findStrap(dDirect) == nullptr, "no strap piece added on a refusal");
        std::printf("\n");
    }

    // Coexists: ruffled straps + hem slit + open-back on one dress (each its own
    // opt-in post-pass; the strap sits on the bodice, the slit on the back skirt).
    {
        std::printf("Ruffled straps + hem slit + open-back coexist on one dress:\n");
        GarmentSpec d; d.garment = GarmentType::Dress; d.neckline = Neckline::Square;
        d.sleeveStyle = SleeveStyle::None; d.skirtStyle = SkirtStyle::Straight;
        d.shaping = Shaping::Dart;
        d.backOpening = static_cast<int>(BackOpening::RoundCutout);
        d.backSlit = static_cast<int>(HemSlit::Vent);
        GarmentSpec withStrap = d; withStrap.ruffledStraps = static_cast<int>(StrapStyle::Ruffled);
        const DraftedPattern p0 = GarmentDrafter::draft(d, m0());
        const DraftedPattern p1 = GarmentDrafter::draft(withStrap, m0());
        check(p1.pieces.size() == p0.pieces.size() + 1, "strap adds one piece atop slit + open-back");
        check(PatternValidator::issues(withStrap, m0(), p1).empty(), "combined draft valid");
        bool strap = false, facing = false;
        for (const auto& pc : p1.pieces) {
            if (pc.name.find("Ruffled Strap") != std::string::npos) strap = true;
            if (pc.name.find("Open Back Facing") != std::string::npos) facing = true;
        }
        check(strap && facing, "strap + open-back facing both present with the slit");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL STRAP CHECKS PASS\n" : "%d STRAP CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
