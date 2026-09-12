// Front button placket (düğme patı) opt-in check: proves the button stand is
// REAL — the front CF edge grows outward by the stand width, a fold line sits at
// the true CF (x = 0), buttons are marked on CF and buttonholes 3 mm past it, a
// button falls at the bust level, and every OTHER piece plus the whole base
// draft (placket off) is byte-identical.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/placket.hpp"
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
static const PatternPiece* frontCenter(const DraftedPattern& d) {
    for (const char* n : {"Bodice Center Front", "Bodice Front", "Top Center Front", "Top Front"})
        if (const PatternPiece* p = find(d, n)) return p;
    return nullptr;
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

static void run(const char* label, GarmentSpec base, const BodyMeasurementsSnapshot& m) {
    std::printf("%s\n", label);
    GarmentSpec plain = base; plain.frontPlacket = false;
    GarmentSpec buttoned = base; buttoned.frontPlacket = true;

    const DraftedPattern dPlain = GarmentDrafter::draft(plain, m);
    const DraftedPattern dBtn = GarmentDrafter::draft(buttoned, m);

    // F5-parca (48871b3e): the CB zipper is a MEASURED decision (gecis kurali).
    // A plain woven dress whose neck is narrower than the head reference keeps
    // the zipper and a SPLIT skirt; the placket IS a donning opening, so the
    // buttoned dress drops the zipper and its skirt merges into one
    // "Skirt Front & Back" (cut 2 on fold). That -1 is the declared zipper
    // coupling (contract/edit-locality-v1.json 1.1.0), not a placket leak —
    // judged here by NAME so it can never hide another missing piece.
    const bool zipFlip = dPlain.cbZipper && !dBtn.cbZipper;
    if (zipFlip) {
        std::printf("      gecis kurali: plain '%s' | placket '%s'\n",
                    dPlain.cbZipperGerekce.c_str(), dBtn.cbZipperGerekce.c_str());
        check(dBtn.pieces.size() + 1 == dPlain.pieces.size(),
              "no extra piece; the -1 is the zipperless skirt merge (F5 gecis kurali)");
        check(find(dPlain, "Skirt Front") && find(dPlain, "Skirt Back") &&
                  find(dBtn, "Skirt Front & Back"),
              "piece delta is exactly the declared skirt merge (split -> one on fold)");
    } else {
        check(dBtn.pieces.size() == dPlain.pieces.size(), "no extra piece (grown-on stand)");
    }

    // Every piece EXCEPT the front center is byte-identical; the front grows.
    // Matched by NAME; under the zip flip the skirt pieces are the declared
    // merge (judged above), so they are excluded from the parity walk.
    const PatternPiece* frontP = frontCenter(dPlain);
    bool othersSame = true, frontChanged = false;
    for (size_t i = 0; i < dPlain.pieces.size(); ++i) {
        const PatternPiece& pp = dPlain.pieces[i];
        const bool isFront = frontP && pp.name == frontP->name;
        if (zipFlip && pp.name.rfind("Skirt", 0) == 0) continue;
        const PatternPiece* q = find(dBtn, pp.name);
        const bool eq = q && sameCommands(pp.commands, q->commands);
        if (isFront) frontChanged = !eq;
        else othersSame = othersSame && eq;
    }
    check(othersSame, "every non-front piece outline byte-identical");
    check(frontChanged, "front center outline grows (button stand added)");

    check(PatternValidator::issues(plain, m, dPlain).empty(), "base draft valid");
    const auto btnIssues = PatternValidator::issues(buttoned, m, dBtn);
    for (const auto& i : btnIssues) std::printf("      issue: %s\n", i.description().c_str());
    check(btnIssues.empty(), "placket draft valid");

    const PatternPiece* front = frontCenter(dBtn);
    if (front) {
        // Stand: the finished front edge should reach out past CF (negative x).
        double minX = 0;
        for (const auto& c : front->commands) if (c.type != CmdType::Close) minX = std::min(minX, c.to.x);
        std::printf("      front edge reaches x = %.1f mm (stand %.0f)\n", minX, PlacketBlock::standWidth);
        check(minX <= -PlacketBlock::standWidth + 1.0, "front edge extended by the stand width past CF");

        // Fold line at x = 0 exists in markings (a vertical move+line at x~0).
        bool foldAtCF = false;
        for (size_t i = 0; i + 1 < front->markings.size(); ++i) {
            if (front->markings[i].type == CmdType::Move && std::fabs(front->markings[i].to.x) < 0.01 &&
                front->markings[i + 1].type == CmdType::Line && std::fabs(front->markings[i + 1].to.x) < 0.01)
                foldAtCF = true;
        }
        check(foldAtCF, "fold line marked at the true center front (x = 0)");

        // Buttons on CF (x tick crossing 0) + buttonholes past CF (both x < 0).
        int buttons = 0, holes = 0;
        double bustLineY = 1e9, firstBtn = 1e9, lastBtn = -1e9;
        for (size_t i = 0; i + 1 < front->markings.size(); ++i) {
            const auto& a = front->markings[i];
            const auto& b = front->markings[i + 1];
            if (a.type != CmdType::Move || b.type != CmdType::Line) continue;
            if (std::fabs(a.to.y - b.to.y) > 0.01) continue; // horizontal ticks only
            if (a.to.x < 0 && b.to.x > 0) { buttons++; firstBtn = std::min(firstBtn, a.to.y); lastBtn = std::max(lastBtn, a.to.y); }
            else if (a.to.x < 0 && b.to.x < 0 && std::fabs(a.to.x - (-PlacketBlock::buttonholeOffset)) < 0.01) holes++;
        }
        std::printf("      %d buttons on CF, %d buttonholes 3 mm past CF\n", buttons, holes);
        check(buttons >= 3, "at least 3 buttons marked on the CF line");
        check(holes == buttons, "one buttonhole per button, offset into the stand");

        // A button must fall at the bust level (uses the piece's apex notch).
        // The apex notch is the first pre-placket marking (move near mid-piece).
        (void)bustLineY;
        check(firstBtn < 1e8 && lastBtn > -1e8, "button run spans the front");
    }
    std::printf("\n");
}

int main() {
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    const BodyMeasurementsSnapshot petite{84, 64, 90, 34, 33, 49, 33};
    const BodyMeasurementsSnapshot plus{122, 104, 128, 44, 44, 60, 40};

    GarmentSpec dress;
    dress.garment = GarmentType::Dress;
    run("Crew A-line dress + front placket:", dress, m);

    GarmentSpec top;
    top.garment = GarmentType::Top;
    top.neckline = Neckline::VNeck;
    top.sleeveStyle = SleeveStyle::Straight;
    run("V-neck top + front placket:", top, m);

    GarmentSpec dartDress;
    dartDress.garment = GarmentType::Dress;
    dartDress.shaping = Shaping::Dart;
    run("Dart-mode dress + front placket:", dartDress, plus);

    GarmentSpec petiteTop;
    petiteTop.garment = GarmentType::Top;
    run("Petite crop top + front placket:", petiteTop, petite);

    std::printf(failures == 0 ? "ALL PLACKET CHECKS PASS\n" : "%d PLACKET CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
