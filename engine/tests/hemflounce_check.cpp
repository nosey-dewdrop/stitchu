// All-around hem flounce (etek ucu volanı) opt-in check: proves the flounce is a
// REAL separate gathered piece hung from the WHOLE hem — with it off every draft
// is byte-identical; with it on exactly one flounce piece is added whose flat
// (gathered) top edge is WIDER than the hem and gathers back to the finished hem
// length trued to the drafted front + back bottom edges (< 0.5 mm); every existing
// outline stays byte-identical; the draft stays wearable (0 issues); and a garment
// with no measurable hosting hem (a gathered skirt) is skipped honestly.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/hemflounce.hpp"
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
    static const BodyMeasurementsSnapshot m{88, 70, 94, 37, 40, 58, 35};
    return m;
}

static const PatternPiece* findFlounce(const DraftedPattern& d) {
    for (const auto& p : d.pieces)
        if (p.name.find("Hem Flounce") != std::string::npos) return &p;
    return nullptr;
}

static const PatternPiece* byName(const DraftedPattern& d, std::initializer_list<const char*> ns) {
    for (const char* n : ns)
        for (const auto& p : d.pieces)
            if (p.name == n) return &p;
    return nullptr;
}

// Independently re-measure the finished hem off a piece's own bottom 8 % band —
// the same convention the block uses (outermost side-seam x near max-y).
static double hemHalf(const PatternPiece* p) {
    if (!p || p->commands.empty()) return 0;
    double minY = 1e30, maxY = -1e30;
    for (const auto& c : p->commands) {
        if (c.type == CmdType::Close) continue;
        minY = std::min(minY, c.to.y); maxY = std::max(maxY, c.to.y);
    }
    if (maxY <= minY) return 0;
    const double lo = maxY - (maxY - minY) * 0.08;
    double mx = 0;
    for (const auto& c : p->commands) {
        if (c.type == CmdType::Close) continue;
        if (c.to.y >= lo) mx = std::max(mx, c.to.x);
    }
    return mx;
}

static double finishedHem(const DraftedPattern& d) {
    const PatternPiece* front = byName(d, {"Skirt Front", "Skirt Center Front",
        "Top Center Front", "Top Front", "Bodice Front"});
    const PatternPiece* frontSide = byName(d, {"Top Side Front", "Bodice Side Front"});
    const PatternPiece* back = byName(d, {"Skirt Back", "Skirt Center Back",
        "Top Center Back", "Top Back", "Bodice Back"});
    const PatternPiece* backSide = byName(d, {"Top Side Back", "Bodice Side Back"});
    const double hf = std::max(hemHalf(front), hemHalf(frontSide));
    const double hb = std::max(hemHalf(back), hemHalf(backSide));
    return 2 * hf + 2 * hb;
}

// Width of the flounce rectangle's TOP edge inside the seam allowance = the flat
// gathered edge PER SEGMENT. The note carries the total flat top across all
// segments; recover it: (cutW - 2*SA) * segments. We read segments from the note.
static double flatTopEdge(const PatternPiece& p) {
    double minX = 1e30, maxX = -1e30;
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Close) continue;
        minX = std::min(minX, c.to.x); maxX = std::max(maxX, c.to.x);
    }
    const double SA = 15.0;
    const double segFlat = (maxX - minX) - 2 * SA;
    // segment count from "cut N rectangle(s)"
    int segs = 1;
    const std::string& note = p.cutInstruction;
    const std::string key = "cut ";
    auto pos = note.find(key);
    if (pos != std::string::npos) segs = std::atoi(note.c_str() + pos + key.size());
    if (segs < 1) segs = 1;
    return segFlat * segs;
}

static void hostCase(const char* label, GarmentSpec spec) {
    std::printf("%s\n", label);
    GarmentSpec plain = spec; plain.hemFlounce = static_cast<int>(HemFlounce::None);
    GarmentSpec fl = spec;    fl.hemFlounce = static_cast<int>(HemFlounce::Gathered);

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m0());
    const DraftedPattern dFl = GarmentDrafter::draft(fl, m0());

    check(dFl.pieces.size() == dPlain.pieces.size() + 1, "adds exactly one flounce piece");

    bool othersSame = dFl.pieces.size() >= dPlain.pieces.size();
    for (size_t i = 0; i < dPlain.pieces.size(); ++i)
        othersSame = othersSame && sameCommands(dPlain.pieces[i].commands, dFl.pieces[i].commands);
    check(othersSame, "every existing piece OUTLINE byte-identical");

    check(PatternValidator::issues(plain, m0(), dPlain).empty(), "base draft wearable (0 issues)");
    check(PatternValidator::issues(fl, m0(), dFl).empty(), "flounce draft wearable (0 issues)");

    const PatternPiece* fp = findFlounce(dFl);
    check(fp != nullptr, "a Hem Flounce piece exists");
    if (!fp) { std::printf("\n"); return; }

    check(fp->cutInstruction.find("gathers to fit") != std::string::npos,
          "cut note says it gathers to fit the hem");
    check(fp->cutInstruction.find("all around") != std::string::npos,
          "cut note says attach all around");
    check(fp->hasGrainline, "flounce has a grainline");

    // TRUING: the flat gathered top edge = finished hem × fullness (2:1), so the
    // gathered-down length (flatTop / fullness) == the hem measured off the body.
    const double hem = finishedHem(dPlain);
    const double flatTop = flatTopEdge(*fp);
    const double gatheredDown = flatTop / 2.0;   // fullness = shirred 2:1
    std::printf("      finished hem = %.3f mm, flat top = %.3f mm, gathers down to %.3f mm\n",
                hem, flatTop, gatheredDown);
    check(flatTop > hem + 1.0, "flat top edge is WIDER than the hem (gathered)");
    check(std::fabs(gatheredDown - hem) < 0.5,
          "gathered-down length == finished hem (truing < 0.5 mm)");

    // A guide step names the flounce.
    bool guide = false;
    for (const auto& s : dFl.guideSteps)
        if (s.find("Hem flounce") != std::string::npos || s.find("etek ucu") != std::string::npos) guide = true;
    check(guide, "a flounce guide step is present");
    std::printf("      cut note: %s\n\n", fp->cutInstruction.c_str());
}

int main() {
    // Dropped-waist / straight dress hem (dart) → hosts an all-around gathered
    // flounce trued to the whole skirt hem.
    {
        GarmentSpec s; s.garment = GarmentType::Dress; s.neckline = Neckline::Scoop;
        s.shaping = Shaping::Dart; s.skirtStyle = SkirtStyle::Straight;
        s.skirtLength = SkirtLength::Midi; s.sleeveStyle = SleeveStyle::None;
        hostCase("Straight dress hem + gathered all-around flounce:", s);
    }

    // A-line top hem (dart) → hosts the flounce trued to the top hem.
    {
        GarmentSpec t; t.garment = GarmentType::Top; t.neckline = Neckline::Scoop;
        t.shaping = Shaping::Dart; t.topLength = TopLength::Hip;
        t.sleeveStyle = SleeveStyle::None;
        hostCase("A-line top hem + gathered all-around flounce:", t);
    }

    // Princess top hem (the half-hem lives on the SIDE panel) → still trued.
    {
        GarmentSpec t; t.garment = GarmentType::Top; t.neckline = Neckline::Scoop;
        t.shaping = Shaping::Princess; t.topLength = TopLength::Hip;
        t.sleeveStyle = SleeveStyle::None;
        hostCase("Princess top hem + gathered all-around flounce:", t);
    }

    // A gathered skirt already ripples and has no fitted hem to gather onto →
    // gated out at the garment level (skirt) AND refused honestly when called
    // directly on a draft with no measurable front/back body hem.
    {
        std::printf("Gathered skirt: flounce gated out / skipped honestly:\n");
        GarmentSpec s; s.garment = GarmentType::Skirt; s.skirtStyle = SkirtStyle::Gathered;
        s.hemFlounce = static_cast<int>(HemFlounce::Gathered);
        GarmentSpec plain = s; plain.hemFlounce = 0;
        const DraftedPattern dS = GarmentDrafter::draft(s, m0());
        const DraftedPattern dP = GarmentDrafter::draft(plain, m0());
        bool same = dS.pieces.size() == dP.pieces.size();
        for (size_t i = 0; same && i < dS.pieces.size(); ++i)
            same = same && sameCommands(dS.pieces[i].commands, dP.pieces[i].commands);
        check(same, "skirt: flounce gated out at garment level, draft byte-identical");

        // Called directly on a skirt draft (no bodice/top front+back) → honest skip.
        DraftedPattern dDirect = GarmentDrafter::draft(plain, m0());
        const size_t before = dDirect.guideSteps.size();
        const bool applied = HemFlounceBlock::apply(dDirect, HemFlounce::Gathered);
        check(!applied, "direct apply refuses a draft with no measurable hosting hem");
        check(dDirect.guideSteps.size() == before + 1, "honest skip note added (no silent no-op)");
        check(findFlounce(dDirect) == nullptr, "no flounce piece added on a refusal");
        std::printf("\n");
    }

    // None is byte-identical vs a draft that never touched the flounce at all.
    {
        std::printf("HemFlounce::None on a dress is a total no-op:\n");
        GarmentSpec s; s.garment = GarmentType::Dress; s.neckline = Neckline::Scoop;
        s.shaping = Shaping::Dart; s.skirtStyle = SkirtStyle::ALine;
        const DraftedPattern d0 = GarmentDrafter::draft(s, m0());
        GarmentSpec sNone = s; sNone.hemFlounce = static_cast<int>(HemFlounce::None);
        const DraftedPattern d1 = GarmentDrafter::draft(sNone, m0());
        bool same = d0.pieces.size() == d1.pieces.size();
        for (size_t i = 0; same && i < d0.pieces.size(); ++i)
            same = same && sameCommands(d0.pieces[i].commands, d1.pieces[i].commands);
        check(same && d0.guideSteps.size() == d1.guideSteps.size(),
              "None adds nothing (byte-identical)");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL HEM FLOUNCE CHECKS PASS\n" : "%d HEM FLOUNCE CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
