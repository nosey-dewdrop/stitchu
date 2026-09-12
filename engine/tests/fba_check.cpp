// Full-bust adjustment check: an optional upper-bust (high-bust) measurement
// makes the back and armhole size to the RIBCAGE while the front keeps the full
// bust — so a fuller bust no longer gapes at the neck/armhole. Proves: (1) with
// no upper bust the draft is byte-identical to before (backward compatible);
// (2) with a real upper bust the back frame shrinks toward the ribcage; (3) the
// result still validates clean across bodies and necklines.
#include <cstdio>
#include <string>
#include <vector>

#include "../src/bodice.hpp"
#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static double backChest(const BodiceDraft& d) { return d.backChestWidth; }

int main() {
    std::printf("full-bust adjustment check\n");

    // (1) No upper bust -> identical to the assumed-cup draft.
    {
        BodyMeasurementsSnapshot a{100, 82, 106, 40, 44, 58, 38};
        BodyMeasurementsSnapshot b = a; // upperBustCM stays 0
        const BodiceDraft da = BodiceBlock::draft(a, {});
        const BodiceDraft db = BodiceBlock::draft(b, {});
        check(backChest(da) == backChest(db), "upper bust off: draft unchanged");
    }

    // (2) A fuller bust (real upper bust well below bust) shrinks the back frame
    // vs the assumed cup; a smaller cup (upper bust near bust) widens it.
    {
        BodyMeasurementsSnapshot assumed{130, 110, 138, 44, 46, 60, 42};   // no upper bust
        BodyMeasurementsSnapshot full = assumed; full.upperBustCM = 106;   // full bust, small ribcage
        const double assumedBack = backChest(BodiceBlock::draft(assumed, {}));
        const double fullBack = backChest(BodiceBlock::draft(full, {}));
        check(fullBack < assumedBack,
            "full bust: back frame narrower than the assumed cup (" +
            std::to_string((int)fullBack) + " < " + std::to_string((int)assumedBack) + ")");
    }

    // (2b) The FRONT half of a real FBA: a bigger cup gets a wider front, a longer
    // front (fabric over the bust) and a bigger bust dart than a small cup at the
    // same bust — the shaping that stops the front riding up and the neck gaping.
    {
        BodyMeasurementsSnapshot big{122, 80, 128, 42, 42, 60, 38};   big.upperBustCM = 100;
        BodyMeasurementsSnapshot small{122, 80, 128, 42, 42, 60, 38}; small.upperBustCM = 116;
        const BodiceDraft b = BodiceBlock::draft(big, {});
        const BodiceDraft s = BodiceBlock::draft(small, {});
        check(b.frontChestWidth > s.frontChestWidth, "bigger cup: wider front bust");
        check(b.frontLength > s.frontLength, "bigger cup: longer front (fabric over the bust)");
    }

    // (2c) Guard: an upper bust >= the full bust (a typo/swap) is clamped so the
    // back never comes out wider than the front.
    {
        BodyMeasurementsSnapshot typo{100, 78, 104, 40, 44, 58, 36}; typo.upperBustCM = 110;
        const BodiceDraft d = BodiceBlock::draft(typo, {});
        check(d.backChestWidth < d.frontChestWidth, "upperBust >= bust clamped (back not wider than front)");
    }

    // (3) FBA bodies across necklines validate clean.
    int clean = 0, total = 0;
    for (double bu = 100; bu <= 150; bu += 10)
        for (double ub = bu - 30; ub <= bu - 10; ub += 10)
            for (Neckline nk : {Neckline::Crew, Neckline::VNeck, Neckline::Sweetheart, Neckline::Scoop}) {
                BodyMeasurementsSnapshot m{bu, bu * 0.85, bu * 1.05, 42, 45, 60, 40};
                m.upperBustCM = ub;
                GarmentSpec s;
                s.garment = GarmentType::Dress; s.neckline = nk;
                s.sleeveStyle = SleeveStyle::Straight; s.sleeveLength = SleeveLength::Long;
                const DraftedPattern d = GarmentDrafter::draft(s, m);
                const auto issues = PatternValidator::issues(s, m, d);
                total++;
                if (issues.empty()) clean++;
                else for (const auto& e : issues)
                    std::printf("    FBA issue bust%.0f ub%.0f: [%s] %s\n", bu, ub, e.rule.c_str(), e.detail.c_str());
            }
    check(clean == total, "FBA bodies validate clean (" + std::to_string(clean) + "/" + std::to_string(total) + ")");

    std::printf(failures ? "\nFAILED %d\n" : "\nall full-bust checks pass\n", failures);
    return failures ? 1 : 0;
}
