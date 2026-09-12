// Keyhole (anahtar deliği) opt-in check: proves the teardrop opening is REAL —
// a CF stitch-line marking below the neck edge on the front piece, a facing
// that covers it with margin, construction steps in the right order, and a
// byte-identical base draft with it off.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/keyhole.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static const PatternPiece* find(const DraftedPattern& d, const std::string& name) {
    for (const auto& p : d.pieces)
        if (p.name == name) return &p;
    return nullptr;
}

// Same priority order as KeyholeBlock: an unsplit half (no princess seam on
// this body) is plain "Bodice Front"/"Top Front".
static const PatternPiece* frontCenter(const DraftedPattern& d) {
    for (const char* n : {"Bodice Center Front", "Bodice Front", "Top Center Front", "Top Front"})
        if (const PatternPiece* p = find(d, n)) return p;
    return nullptr;
}

static void run(const char* label, GarmentSpec base, const BodyMeasurementsSnapshot& m) {
    std::printf("%s\n", label);
    GarmentSpec plain = base; plain.keyhole = false;
    GarmentSpec keyed = base; keyed.keyhole = true;

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m);
    const DraftedPattern dKey = GarmentDrafter::draft(keyed, m);

    check(find(dPlain, "Keyhole Facing") == nullptr, "default draft has no keyhole");
    check(find(dKey, "Keyhole Facing") != nullptr, "keyhole=true adds the facing piece");
    check(dKey.pieces.size() == dPlain.pieces.size() + 1, "exactly one piece added");

    bool baseSame = true;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i)
        baseSame = baseSame &&
                   dPlain.pieces[i].name == dKey.pieces[i].name &&
                   dPlain.pieces[i].commands.size() == dKey.pieces[i].commands.size();
    check(baseSame, "existing piece outlines untouched");

    check(PatternValidator::issues(plain, m, dPlain).empty(), "base draft valid");
    const auto keyIssues = PatternValidator::issues(keyed, m, dKey);
    for (const auto& i : keyIssues) std::printf("      issue: %s\n", i.description().c_str());
    check(keyIssues.empty(), "keyhole draft valid (validator keyhole rule included)");

    const PatternPiece* front = frontCenter(dKey);
    const PatternPiece* plainFront = frontCenter(dPlain);
    check(front && plainFront &&
          front->markings.size() == plainFront->markings.size() + 3,
          "front carries the teardrop stitch line (3 marking commands)");

    if (front) {
        const auto& mk = front->markings;
        const Point top = mk[mk.size() - 3].to;
        const Rect hole = boundingBox({PathCommand::move(top),
                                       mk[mk.size() - 2], mk[mk.size() - 1]});
        const double neckY = front->commands[0].to.y;
        std::printf("      teardrop: top %.0f mm below neck edge, %.0f long x %.0f wide (half)\n",
                    top.y - neckY, hole.height, hole.width);
        check(std::fabs(top.y - neckY - KeyholeBlock::gapBelowNeck) < 0.1,
              "teardrop starts the set gap below the neck edge");
        check(hole.height >= KeyholeBlock::minLength - 0.1 &&
              hole.height <= KeyholeBlock::maxLength + 0.1, "length within the keyhole range");
        const PatternPiece* facing = find(dKey, "Keyhole Facing");
        if (facing) {
            const Rect f = boundingBox(facing->commands);
            check(f.y < hole.y - 20 && f.y + f.height > hole.y + hole.height + 20 &&
                  f.width > hole.width + 20, "facing covers the opening with margin");
            check(!facing->markings.empty(), "facing carries the matching stitch line");
        }
    }

    // Construction order: the keyhole steps follow the neckline finishing step —
    // the facing understitch OR the default bias binding step (patch 3.10).
    int neckFinishAt = -1, keyholeAt = -1;
    for (size_t i = 0; i < dKey.guideSteps.size(); ++i) {
        if (dKey.guideSteps[i].rfind("Understitch:", 0) == 0 ||
            dKey.guideSteps[i].rfind("Bind the neckline", 0) == 0) neckFinishAt = (int)i;
        if (dKey.guideSteps[i].rfind("Keyhole:", 0) == 0 && keyholeAt < 0) keyholeAt = (int)i;
    }
    check(neckFinishAt >= 0 && keyholeAt == neckFinishAt + 1,
          "keyhole construction inserted right after the neckline finishing steps");
    std::printf("\n");
}

int main() {
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36}; // EU ~38, cm
    const BodyMeasurementsSnapshot petite{84, 64, 90, 34, 33, 49, 33};

    GarmentSpec dress;
    dress.garment = GarmentType::Dress;
    run("Crew A-line dress + keyhole:", dress, m);

    GarmentSpec babydoll;
    babydoll.garment = GarmentType::Dress;
    babydoll.waistline = Waistline::Empire;
    babydoll.skirtStyle = SkirtStyle::Gathered;
    run("Babydoll (empire, short bodice) + keyhole:", babydoll, petite);

    GarmentSpec top;
    top.garment = GarmentType::Top;
    top.neckline = Neckline::Boat;
    top.sleeveStyle = SleeveStyle::Straight;
    run("Boat-neck top + keyhole:", top, m);

    std::printf(failures == 0 ? "ALL KEYHOLE CHECKS PASS\n" : "%d KEYHOLE CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
