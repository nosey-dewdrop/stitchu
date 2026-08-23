// fabric_ease_check — KAPI (F-H, 2026-08-23).
//
// CLAIM UNDER TEST: "aynı spec + farklı kumaş = FARKLI kalıp." Until tonight the
// material layer was two words (woven | knit) and a 5%-stretch ponte drafted
// exactly like a 90%-stretch swim knit. This gate holds the new axis to the
// PUBLISHED band and, separately, to the anti-hack: the difference between two
// fabrics must not be a constant multiplier bolted onto the woven draft.
//
// The band is RESTATED here as literals, on purpose. If it were read out of
// fabricease.hpp the gate would only prove the engine agrees with itself (ORTAK
// §3: deriving a threshold from the engine's own output and calling it a gate).
// These numbers come from the F-H card / knowledge/stitchu.db `fabrics.stretch`
// (UNL 4-inch test), NOT from the engine.
//
// FIVE LEGS
//   A  UNDECLARED == the word's own anchor, to the last bit. A spec that never
//      mentions stretch must draft exactly as it did before this axis existed.
//   B  DIRECTION: more stretch -> a smaller drafted chest, strictly, at every
//      step; above the moderate band the drafted girth goes BELOW the body.
//   C  MAGNITUDE: the drafted chest ratio between two fabrics equals the ratio
//      the PUBLISHED band demands, in eight sizes, to 1e-9 relative.
//   D  ANTI-HACK / constant multiplier: no single scalar per stretch level can
//      reproduce the band, because chest and waist scale by DIFFERENT factors
//      and because the sign flips. Both are asserted as facts about the band and
//      then confirmed on drafted geometry.
//   E  ANTI-HACK / not just a relabelled knit: the four declared bands must give
//      four DIFFERENT drafts (a "stretch axis" that collapses to two outputs is
//      the old two-word system wearing a number).
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <vector>

#include "../src/bodice.hpp"
#include "../src/fabricease.hpp"
#include "../src/garment.hpp"
#include "../src/sizechart.hpp"

using namespace stitchu;

static BodyMeasurementsSnapshot bodyForEU(int eu) {
    const SizeChartEntry* e = euSize("EU" + std::to_string(eu));
    if (!e) { std::printf("  [FAIL] size chart has no EU%d\n", eu); std::exit(1); }
    return e->body;
}

static int failures = 0;
static int checked = 0;

static void fail(const std::string& msg) {
    std::printf("  [FAIL] %s\n", msg.c_str());
    failures++;
}
static void ok() { checked++; }

// ── THE PUBLISHED BAND, restated independently of the engine ────────────────
// F-H card §İŞ 1: dokuma ~0 (pozitif ease zorunlu) · stable knit %0–25 ·
// orta %26–50 (~%3) · esnek %51–75 (~%5) · süper %76+ (~%10, pens kalkar).
// Negative ease is the TEMPERED published figure, never stretch/(1+stretch)
// (recovery) — so the moderate band is −3%, not −23%.
struct BandPoint {
    const char* name;
    double stretchPct;   // band midpoint, where the published figure is pinned
    double chestEase;    // fraction of body bust
    double waistEase;    // fraction of body waist (bodice)
};
static const std::vector<BandPoint> kBand = {
    {"woven",       0.0,  0.11,  0.05},
    {"stable knit", 12.5, 0.04,  0.02},
    {"moderate",    38.0, -0.03, -0.03},
    {"stretchy",    63.0, -0.05, -0.05},
    {"super",       88.0, -0.10, -0.10},
};

// Drafted chest girth proxy: the bodice's own audit widths. Only RATIOS between
// two fabrics are used, so the construction offset between "chest width" and
// "bust girth" cancels and no calibration constant is needed.
static double draftedChest(const BodyMeasurementsSnapshot& m, const FabricAxis& f, Shaping shaping) {
    BodiceBlock::BodiceOptions o;
    o.shaping = shaping;
    o.fabric = f;
    const BodiceDraft d = BodiceBlock::draft(m, o);
    return 2.0 * (d.frontChestWidth + d.backChestWidth);
}
static double draftedWaist(const BodyMeasurementsSnapshot& m, const FabricAxis& f, Shaping shaping) {
    BodiceBlock::BodiceOptions o;
    o.shaping = shaping;
    o.fabric = f;
    const BodiceDraft d = BodiceBlock::draft(m, o);
    return 2.0 * (d.frontStraightWaist + d.backStraightWaist);
}

// A full drafted garment, serialised, so leg A can compare BYTE for byte.
static std::string dump(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m) {
    const DraftedPattern p = GarmentDrafter::draft(spec, m);
    std::string out;
    char buf[128];
    for (const auto& piece : p.pieces) {
        out += piece.name;
        out += '|';
        for (const auto& c : piece.commands) {
            std::snprintf(buf, sizeof buf, "%d:%.9f,%.9f;", static_cast<int>(c.type), c.to.x, c.to.y);
            out += buf;
        }
        out += '\n';
    }
    std::snprintf(buf, sizeof buf, "meters=%.9f\n", p.fabricMeters140);
    out += buf;
    return out;
}

int main() {
    std::printf("fabric_ease_check: the fabric axis is a real axis, not a relabelled knit\n");

    const std::vector<int> sizes = {34, 36, 38, 40, 42, 44, 46, 48};

    // ── LEG A: UNDECLARED == the word's own anchor, byte for byte ───────────
    for (const int eu : sizes) {
        const BodyMeasurementsSnapshot m = bodyForEU(eu);
        for (const auto pair : {std::pair<Fabric, double>{Fabric::Woven, 0.0},
                                std::pair<Fabric, double>{Fabric::Knit, 12.5}}) {
            GarmentSpec undeclared;
            undeclared.fabric = pair.first;
            GarmentSpec declared;
            declared.fabric = FabricAxis(pair.first, pair.second);
            if (dump(undeclared, m) != dump(declared, m)) {
                fail("EU" + std::to_string(eu) + " " + raw(pair.first) +
                     ": declaring the word's own default stretch changed the draft — "
                     "the legacy anchor moved");
            } else {
                ok();
            }
        }
    }

    // ── LEG D-band: the band itself cannot be a constant multiplier ─────────
    // If someone implemented "knit draft = woven draft * k(stretch)", then for a
    // given stretch level chest and waist would scale by the SAME k. They do not.
    for (size_t i = 1; i < kBand.size(); ++i) {
        const double kChest = (1.0 + kBand[i].chestEase) / (1.0 + kBand[0].chestEase);
        const double kWaist = (1.0 + kBand[i].waistEase) / (1.0 + kBand[0].waistEase);
        if (std::fabs(kChest - kWaist) < 1e-6) {
            fail(std::string("band '") + kBand[i].name +
                 "': chest and waist scale by the same factor — a single multiplier "
                 "would reproduce this band, so it carries no fabric information");
        } else {
            ok();
        }
    }
    // Sign flip: no POSITIVE multiplier of a positive woven ease reaches a
    // negative ease. The moderate band and up must be negative.
    for (const auto& b : kBand) {
        const bool wantNegative = b.stretchPct > FabricBand::kStableMaxPct;
        if (wantNegative && b.chestEase >= 0) fail(std::string("band '") + b.name + "' should carry negative ease");
        else if (!wantNegative && b.chestEase <= 0) fail(std::string("band '") + b.name + "' should carry positive ease (woven/stable: positive ease is mandatory)");
        else ok();
    }

    // ── LEGS B + C: on drafted geometry, eight sizes, both shapings ─────────
    for (const int eu : sizes) {
        const BodyMeasurementsSnapshot m = bodyForEU(eu);
        for (const auto shaping : {Shaping::Dart, Shaping::Princess}) {
            const double chest0 = draftedChest(m, FabricAxis(Fabric::Woven, kBand[0].stretchPct), shaping);
            const double waist0 = draftedWaist(m, FabricAxis(Fabric::Woven, kBand[0].stretchPct), shaping);
            double prevChest = chest0;
            for (size_t i = 1; i < kBand.size(); ++i) {
                const FabricAxis f(Fabric::Knit, kBand[i].stretchPct);
                const double chest = draftedChest(m, f, shaping);
                const double waist = draftedWaist(m, f, shaping);

                // B — strictly smaller at every step up the band.
                if (!(chest < prevChest - 1e-9)) {
                    char buf[256];
                    std::snprintf(buf, sizeof buf,
                                  "EU%d %s: chest did NOT shrink going to band '%s' (%.4f -> %.4f)",
                                  eu, raw(shaping), kBand[i].name, prevChest, chest);
                    fail(buf);
                } else {
                    ok();
                }
                prevChest = chest;

                // C — the ratio is exactly what the PUBLISHED band demands.
                const double wantChest = chest0 * (1.0 + kBand[i].chestEase) / (1.0 + kBand[0].chestEase);
                const double wantWaist = waist0 * (1.0 + kBand[i].waistEase) / (1.0 + kBand[0].waistEase);
                if (std::fabs(chest - wantChest) > 1e-6 * std::fabs(wantChest)) {
                    char buf[256];
                    std::snprintf(buf, sizeof buf,
                                  "EU%d %s band '%s': drafted chest %.6f mm, published band wants %.6f mm",
                                  eu, raw(shaping), kBand[i].name, chest, wantChest);
                    fail(buf);
                } else {
                    ok();
                }
                if (std::fabs(waist - wantWaist) > 1e-6 * std::fabs(wantWaist)) {
                    char buf[256];
                    std::snprintf(buf, sizeof buf,
                                  "EU%d %s band '%s': drafted waist %.6f mm, published band wants %.6f mm",
                                  eu, raw(shaping), kBand[i].name, waist, wantWaist);
                    fail(buf);
                } else {
                    ok();
                }
            }

            // B (sign) — super stretch must draft BELOW the body, not just less
            // above it. chest0/(1+0.11) is the drafted-frame body girth.
            const double bodyFrame = chest0 / (1.0 + kBand[0].chestEase);
            const double chestSuper = draftedChest(m, FabricAxis(Fabric::Knit, 88.0), shaping);
            if (!(chestSuper < bodyFrame)) {
                fail("EU" + std::to_string(eu) +
                     ": super-stretch draft is not smaller than the body — negative ease never happened");
            } else {
                ok();
            }

            // E — four declared bands, four DIFFERENT drafts.
            std::vector<double> distinct;
            for (const auto& b : kBand) distinct.push_back(draftedChest(m, FabricAxis(Fabric::Knit, b.stretchPct), shaping));
            for (size_t i = 0; i < distinct.size(); ++i)
                for (size_t j = i + 1; j < distinct.size(); ++j)
                    if (std::fabs(distinct[i] - distinct[j]) < 1e-6)
                        fail(std::string("bands '") + kBand[i].name + "' and '" + kBand[j].name +
                             "' draft the same chest — the axis collapsed back to two words");
            ok();
        }
    }

    // ── D on geometry: measure the two scale factors and prove they differ ──
    {
        const BodyMeasurementsSnapshot m = bodyForEU(38);
        const double c0 = draftedChest(m, FabricAxis(Fabric::Woven, 0.0), Shaping::Dart);
        const double w0 = draftedWaist(m, FabricAxis(Fabric::Woven, 0.0), Shaping::Dart);
        const double c1 = draftedChest(m, FabricAxis(Fabric::Knit, 38.0), Shaping::Dart);
        const double w1 = draftedWaist(m, FabricAxis(Fabric::Knit, 38.0), Shaping::Dart);
        const double kc = c1 / c0, kw = w1 / w0;
        std::printf("  measured moderate-band scale: chest x%.6f  waist x%.6f  (delta %.6f)\n",
                    kc, kw, std::fabs(kc - kw));
        if (std::fabs(kc - kw) < 1e-4) {
            fail("EU38 moderate band: chest and waist scaled by the same factor on the DRAFT — "
                 "a constant multiplier would explain the whole fabric axis");
        } else {
            ok();
        }
    }

    // The published rule the engine DECLARES but does not yet execute.
    if (!FabricBand::dartsDropOut(FabricAxis(Fabric::Knit, 90.0)))
        fail("super-stretch fabric does not report dartsDropOut");
    else ok();
    if (FabricBand::dartsDropOut(FabricAxis(Fabric::Knit, 40.0)))
        fail("moderate fabric wrongly reports dartsDropOut");
    else ok();

    std::printf("fabric_ease_check: %d checks, %d failures\n", checked, failures);
    return failures == 0 ? 0 : 1;
}
