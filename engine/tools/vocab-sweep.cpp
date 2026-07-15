// Vocabulary x body sweep — the coverage the 3-body golden and the balanced
// matrix miss. engine_check sweeps the vocabulary but only on bodies where bust
// and back length scale together; golden_dump checks just 3 bodies. Real fit
// bugs (the sleeve underarm self-intersection, the halter kink) live on the
// DECOUPLED grid: a wide arm on a normal back, a fuller bust on a short torso.
//
// This drafts the full dress vocabulary across a broad, decoupled body grid and
// asserts ZERO sewability failures (self-intersection, kink, princess/side-seam
// mismatch, cap ease, biceps). Honest blocks (impossible proportions,
// undraftable) are NOT failures — they are the validator doing its job.
//
// Run after any engine change:
//   c++ -std=c++17 -I engine/src engine/tools/vocab-sweep.cpp engine/src/*.cpp -o /tmp/sweep && /tmp/sweep
#include <cstdio>

#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

int main() {
    const char* sewRules[] = {"princess", "sideseam", "waistjoin", "cap", "biceps", "selfintersect", "kink"};
    int total = 0, clean = 0, fails = 0, honestBlocks = 0;
    int shown = 0;

    const Neckline necks[] = {Neckline::Crew, Neckline::Sweetheart, Neckline::Halter,
                              Neckline::VNeck, Neckline::Square, Neckline::Scoop, Neckline::Boat};
    const SkirtStyle skirts[] = {SkirtStyle::ALine, SkirtStyle::Straight, SkirtStyle::Gathered,
                                 SkirtStyle::HalfCircle, SkirtStyle::Pleated};
    const SleeveStyle sleeves[] = {SleeveStyle::None, SleeveStyle::Straight, SleeveStyle::Balloon};

    // Decoupled grid: bust, back length and shoulder vary INDEPENDENTLY — the
    // combinations the balanced matrix never reaches.
    for (double bu = 70; bu <= 150; bu += 20)
        for (double bl = 30; bl <= 52; bl += 11)
            for (double sh = 30; sh <= 50; sh += 10)
                for (const Neckline nk : necks)
                    for (const SkirtStyle sk : skirts)
                        for (const SleeveStyle sl : sleeves)
                            for (const Waistline wl : {Waistline::Natural, Waistline::Empire})
                                for (const Shaping shp : {Shaping::Princess, Shaping::Dart})
                                    for (const bool ruf : {false, true}) {
                                        const BodyMeasurementsSnapshot m{bu, bu * 0.8, bu * 1.08, sh, bl, 58, 38};
                                        GarmentSpec s;
                                        s.garment = GarmentType::Dress;
                                        s.neckline = nk; s.skirtStyle = sk; s.sleeveStyle = sl;
                                        s.sleeveLength = SleeveLength::Long;
                                        s.waistline = wl; s.shaping = shp;
                                        s.ruffleHem = ruf; s.ruffleTiers = ruf ? 3 : 1;
                                        const DraftedPattern d = GarmentDrafter::draft(s, m);
                                        const auto issues = PatternValidator::issues(s, m, d);
                                        total++;

                                        bool sewFail = false, honest = false;
                                        for (const auto& e : issues) {
                                            bool isSew = false;
                                            for (const char* r : sewRules) if (e.rule == r) isSew = true;
                                            if (isSew) sewFail = true;
                                            else honest = true; // proportion / undraftable / print etc.
                                        }
                                        if (sewFail) {
                                            fails++;
                                            if (shown++ < 10) {
                                                std::printf("SEW FAIL bust%.0f bl%.0f sh%.0f nk%d sk%d sl%d: ",
                                                            bu, bl, sh, (int)nk, (int)sk, (int)sl);
                                                for (const auto& e : issues) {
                                                    for (const char* r : sewRules) if (e.rule == r)
                                                        std::printf("[%s] %s  ", e.rule.c_str(), e.detail.c_str());
                                                }
                                                std::printf("\n");
                                            }
                                        } else if (honest) {
                                            honestBlocks++;
                                        } else {
                                            clean++;
                                        }
                                    }

    std::printf("\nvocab sweep: %d drafts | %d sewable | %d honestly blocked | %d SEWABILITY FAILURES\n",
                total, clean, honestBlocks, fails);
    return fails ? 1 : 0;
}
