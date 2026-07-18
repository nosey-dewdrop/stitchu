// Paper-sloper comparison (K4, 2026-07-19) — the engine's first EXTERNAL fit
// signal. One known body (EU38: 88/70/94, back length 40.5, neck 35) is
// drafted by the engine (fitted dart bodice + straight skirt) and the SAME
// landmarks are compared against an INDEPENDENT hand draft of the Aldrich
// block (Metric Pattern Cutting for Women's Wear, 6th ed method; chart column
// bust 88: back width 34.4, chest 32.4, shoulder 12.25, dart 7, armscye depth
// 21, waist-to-hip 20.6, top arm 28.4). The Aldrich numbers below were
// hand-calculated from the published steps — NOT derived from any engine
// formula — and are pinned here as reference constants, so this test is a
// ratchet: if a future change moves a landmark past its confirmed bound, it
// fails. Full mm table + step-by-step Aldrich arithmetic:
// reports/2026-07-19-stitchu-k4-sabitler-sloper.md
//
// This does NOT claim "fits a human" (that is the FAZ 1 muslin). It claims:
// the engine's EU38 block lands within stated mm of a published drafting
// system, landmark by landmark — measured off the drawn outlines.
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/bodice.hpp"
#include "../src/garment.hpp"
#include "../src/geometry.hpp"
#include "../src/skirt.hpp"

using namespace stitchu;

static int failures = 0;
static bool check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
    return ok;
}

// One landmark row: engine measurement vs the independent Aldrich reference.
// tolMM <= 0 → report-only (assumed/diverging-by-design landmark, no gate).
static void landmark(const char* name, double engine, double aldrich, double tolMM) {
    const double err = engine - aldrich;
    std::printf("  %-38s engine %8.1f   aldrich %8.1f   err %+7.1f mm%s\n",
                name, engine, aldrich, err, tolMM > 0 ? "" : "   (report-only)");
    if (tolMM > 0) {
        check(std::fabs(err) <= tolMM,
              std::string(name) + " within " + std::to_string((int)tolMM) + " mm of the Aldrich draft");
    }
}

// Sum of dart intakes read off a piece's marking triplets (move/line/line
// where the legs sit near one y and the apex away from it).
static double dartIntake(const PatternPiece& p, int* count = nullptr) {
    double total = 0;
    int n = 0;
    for (size_t i = 0; i + 2 < p.markings.size(); ++i) {
        if (p.markings[i].type == CmdType::Move && p.markings[i + 1].type == CmdType::Line &&
            p.markings[i + 2].type == CmdType::Line) {
            const Point a = p.markings[i].to, apex = p.markings[i + 1].to, b = p.markings[i + 2].to;
            const double spread = std::fabs(b.x - a.x);
            const double drop = std::fabs(apex.y - (a.y + b.y) / 2);
            if (spread > 2 && drop > spread) { total += spread; n++; i += 2; }
        }
    }
    if (count) *count = n;
    return total;
}

int main() {
    std::printf("sloper check — engine EU38 vs independent Aldrich hand draft (mm)\n");

    // Engine EU38 body (engine/src/sizechart.hpp row).
    const BodyMeasurementsSnapshot m{88, 70, 94, 37, 40.5, 58, 35};

    // ---- Aldrich reference (hand-drafted from the published method) ----------
    // Bodice (close-fitting block), body: bust 880, waist 700, neck 350;
    // chart at bust 88: armscye depth 210, back width 344, shoulder 122.5.
    const double A_scyeDepthFromNape = 210 + 5;          // armscye depth + 0.5 cm
    const double A_backNeckWidth = 350.0 / 5;            // neck/5 = 70
    const double A_frontNeckWidth = 350.0 / 5 - 5;       // neck/5 - 0.5 cm = 65
    const double A_shoulderSeam = 122.5;                 // chart shoulder (net, dart closed)
    // Back shoulder-tip drop below the nape line: armscye/5 - 0.7 = 35; the
    // neck point sits ~15 above the nape line → tip drop below the NECK-POINT
    // line ≈ 50 (medium confidence: the 1.5 cm rise varies by edition).
    const double A_tipDropBelowNeckLine = 50;
    const double A_bustGirth = 880 + 100;                // close-fitting: bust/2 + 5 cm per half
    const double A_waistGirth = 700 + 20;                // waist + 2 cm ease
    // Straight (tailored) skirt block, body: waist 700, hip 940; chart
    // waist-to-hip 206.
    const double A_skirtHipGirth = 940 + 30;             // hip/2 + 1.5 cm per half
    const double A_skirtWaistGirth = 700 + 10;           // quarter + 0.25 ease ×4
    const double A_skirtHipDepth = 206;                  // chart waist-to-hip
    const double A_skirtSideRise = 12.5;                 // side waist raised 1.25 cm
    const double A_skirtBackDartTotal = 40;              // two 2 cm back darts / quarter

    // ---- Engine draft: fitted dart bodice (sleeved frame = the block) --------
    BodiceBlock::BodiceOptions opt;
    opt.shaping = Shaping::Dart; // the classic single-dart block = the Aldrich comparison frame
    const BodiceDraft bod = BodiceBlock::draft(m, opt);
    const PatternPiece& back = bod.back;
    const PatternPiece& front = bod.front;
    const bool layout = back.commands.size() > 5 && front.commands.size() > 5 &&
                        back.commands[3].type == CmdType::Curve;
    check(layout, "EU38 bodice drafted with the expected outline layout");
    if (!layout) return 1;

    const Point bNape = back.commands[0].to;        // (0, back neck cutout)
    const Point bNeckPt = back.commands[1].to;      // (back neck width, 0)
    const Point bTip = back.commands[2].to;         // shoulder tip
    const Point bUnderarm = back.commands[3].to;    // (chest width, armhole y)
    const Point fUnderarm = front.commands[3].to;
    const double drawnShoulder = std::hypot(bTip.x - bNeckPt.x, bTip.y - bNeckPt.y);

    std::printf("\n bodice landmarks\n");
    landmark("back neck width", bNeckPt.x, A_backNeckWidth, 5);
    landmark("front neck width", front.commands[1].to.x, A_frontNeckWidth, 0);
    landmark("scye depth below nape", bUnderarm.y - bNape.y, A_scyeDepthFromNape, 15);
    landmark("shoulder seam (drawn)", drawnShoulder, A_shoulderSeam, 10);
    landmark("shoulder tip drop", bTip.y, A_tipDropBelowNeckLine, 8);
    landmark("bust-line girth (sewn)", (bUnderarm.x + fUnderarm.x) * 2, A_bustGirth, 0);
    // Engine waist ease is 5% (+35 mm at EU38) vs Aldrich's flat +20 mm — a
    // deliberate design difference, so the bound pins the CURRENT gap (+26 mm
    // measured along the drawn waist curve) with a small margin, not parity.
    landmark("waist girth (sewn)", (bod.frontSewnWaist + bod.backSewnWaist) * 2, A_waistGirth, 35);
    // Aldrich front waist shaping ≈ suppression third (43.3); the engine's
    // single front dart carries slightly more because its side-seam slant is
    // capped at 5 mm. Report-only: the front also differs structurally (the
    // engine has no shoulder bust dart — see the report's honest-limits list).
    landmark("front waist dart intake", dartIntake(front), 130.0 / 3, 0);
    landmark("back waist dart intake", dartIntake(back), 130.0 / 3, 12);  // suppression third

    // The bust-line girth is report-only BY DESIGN (ribcage frame: the back
    // drafts to the underbust, deliberately closer-fitting than Aldrich's
    // uniform bust/2+5) — but it must stay a real positive-ease band.
    const double bustGirth = (bUnderarm.x + fUnderarm.x) * 2;
    check(bustGirth > m.bustMM() + 30 && bustGirth < m.bustMM() + 120,
          "bust-line girth inside the positive-ease band (bust+30 .. bust+120)");
    // Front/back balance: engine carries the M&S +40 mm CF drop.
    check(std::fabs((bod.frontLength - bod.backLength) - 40.0) < 0.5,
          "front/back balance carries the 40 mm CF drop (M&S)");

    // ---- Engine draft: straight skirt (dart shaping) -------------------------
    const auto skirt = SkirtBlock::pieces(m, SkirtStyle::Straight, SkirtLength::Midi,
                                          /*includeWaistband=*/false, std::nullopt, Shaping::Dart);
    check(skirt.size() == 2, "straight skirt drafts as front + back quarters");
    if (skirt.size() == 2) {
        const PatternPiece& q = skirt[1]; // Back quarter
        const Point sideWaist = q.commands[1].to;
        const Point hipPt = q.commands[2].to;
        int backDarts = 0;
        const double backDartTotal = dartIntake(q, &backDarts);
        const double waistCurveLen =
            pathLength({PathCommand::move(q.commands[0].to), q.commands[1]});
        const double sewnQuarter = waistCurveLen - backDartTotal;

        std::printf("\n skirt landmarks\n");
        landmark("skirt waist girth (sewn)", sewnQuarter * 4, A_skirtWaistGirth, 12);
        landmark("skirt hip girth", hipPt.x * 4, A_skirtHipGirth, 20);
        landmark("skirt hip depth", hipPt.y, A_skirtHipDepth, 10);
        landmark("skirt side waist rise", -sideWaist.y, A_skirtSideRise, 2);
        landmark("skirt back dart total / quarter", backDartTotal, A_skirtBackDartTotal, 8);
        check(backDarts == 2,
              "back quarter splits its intake into two darts (Aldrich: two back darts)");
    }

    std::printf(failures ? "\nFAILED %d sloper checks\n"
                         : "\nall sloper checks pass — EU38 block within the pinned Aldrich bounds\n",
                failures);
    return failures ? 1 : 0;
}
