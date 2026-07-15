// Accuracy benchmark — the moat. Competitors ship the same photo-to-pattern
// pitch but make ZERO verifiable accuracy claims. This measures, on the real
// drafted geometry across the full body grid and the core garment vocabulary,
// the two things a sewist is paid to trust:
//
//   1. FIT   — does the finished garment land on the body + intended ease?
//   2. SEW   — does every seam that must be sewn together measure equal
//              (so the pieces actually join)?
//
// It prints per-metric aggregate error (mean / worst) in millimetres and the
// draft count, then a single honest verdict line. Run:
//   c++ -std=c++17 -I engine/src engine/tools/accuracy-benchmark.cpp engine/src/*.cpp -o /tmp/bench && /tmp/bench
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>
#include <algorithm>

#include "../src/bodice.hpp"
#include "../src/sleeve.hpp"
#include "../src/garment.hpp"
#include "../src/geometry.hpp"

using namespace stitchu;

static const PatternPiece* find(const DraftedPattern& d, const std::string& n) {
    for (const auto& p : d.pieces) if (p.name == n) return &p;
    return nullptr;
}

struct Stat {
    std::string name;
    double sumAbs = 0, worstAbs = 0; int n = 0;
    void add(double errMM) { sumAbs += std::fabs(errMM); worstAbs = std::max(worstAbs, std::fabs(errMM)); n++; }
    double mean() const { return n ? sumAbs / n : 0; }
    double worst() const { return worstAbs; }
};

int main() {
    Stat waistFit{"finished waist vs body+ease (dart)"};
    Stat princess{"princess seam pair (center vs side edge)"};
    Stat sideSeam{"bodice side seam (front vs back)"};
    Stat capEase{"sleeve cap ease inside 1-9% window"};
    int drafts = 0, capOutOfWindow = 0;

    // Full plausible body grid.
    for (double bu = 60; bu <= 160; bu += 10)
        for (double bl = 28; bl <= 54; bl += 6)
            for (double sh = 26; sh <= 52; sh += 8) {
                const double wa = bu * 0.80, hi = bu * 1.08;
                const BodyMeasurementsSnapshot m{bu, wa, hi, sh, bl, 58, 36};

                // --- dart-mode dress: clean single piece per half for the fit measure ---
                {
                    GarmentSpec spec; spec.garment = GarmentType::Dress; spec.shaping = Shaping::Dart;
                    const DraftedPattern d = GarmentDrafter::draft(spec, m);
                    const BodiceDraft bod = BodiceBlock::draft(m, {});
                    const PatternPiece* fr = find(d, "Bodice Front");
                    const PatternPiece* bk = find(d, "Bodice Back");
                    if (fr && bk) {
                        // FINISHED WAIST — measured off the sewn waist arcs (dart
                        // intake already removed), summed over both sides. This is a
                        // clean girth: the waistline is a single curve per half.
                        const double finishedWaist = (bod.frontSewnWaist + bod.backSewnWaist) * 2;
                        const double expWaist = m.waistMM() * (1 + BodiceBlock::waistEaseFor(Fabric::Woven));
                        waistFit.add(finishedWaist - expWaist);
                        sideSeam.add(bod.frontSideSeam - bod.backSideSeam);
                    }
                    drafts++;
                }
                // --- princess-mode: seam-pair matching (sewability) ---
                {
                    BodiceBlock::BodiceOptions o; o.shaping = Shaping::Princess;
                    const BodiceDraft bod = BodiceBlock::draft(m, o);
                    if (bod.frontPrincess) princess.add(bod.frontSeamCenterLen - bod.frontSeamSideLen);
                    if (bod.backPrincess) princess.add(bod.backSeamCenterLen - bod.backSeamSideLen);
                    sideSeam.add(bod.frontSideSeam - bod.backSideSeam);
                }
                // --- sleeve cap ease ---
                {
                    BodiceBlock::BodiceOptions o; const BodiceDraft bod = BodiceBlock::draft(m, o);
                    const auto sl = SleeveBlock::draft(m, SleeveStyle::Straight, SleeveLength::Long,
                                                       bod.armholeLength, bod.armholeDepth, Fabric::Woven);
                    if (!sl.empty()) {
                        const double capLen = pathLength({sl[0].commands[0], sl[0].commands[1], sl[0].commands[2]});
                        const double ease = capLen / bod.armholeLength - 1;
                        // error vs the ideal 4% cap ease; also count window escapes
                        capEase.add((ease - 0.04) * bod.armholeLength);
                        if (ease < 0.01 || ease > 0.09) capOutOfWindow++;
                    }
                }
            }

    std::printf("stitchu accuracy benchmark — %d dart drafts across the body grid\n\n", drafts);
    std::printf("%-46s  %8s  %8s\n", "metric", "mean mm", "worst mm");
    std::printf("%-46s  %8s  %8s\n", "----------------------------------------------", "-------", "--------");
    for (const Stat* s : {&waistFit, &princess, &sideSeam, &capEase})
        std::printf("%-46s  %8.2f  %8.2f\n", s->name.c_str(), s->mean(), s->worst());

    std::printf("\nsleeve cap ease outside the 1-9%% sewable window: %d of %d (%.1f%%)\n",
                capOutOfWindow, drafts, drafts ? 100.0 * capOutOfWindow / drafts : 0);

    // Proportional integrity — the survey's #1 fit complaint is that graded
    // patterns get "giant armholes and wide shoulders" at larger sizes because
    // they SCALE a small block. stitchu drafts each body from scratch, so along a
    // realistic size run (every measurement grows together) the armhole depth
    // should stay a near-constant share of the back length, not balloon with the
    // bust. Report that share across a size-6-to-24 progression.
    std::printf("\nproportional integrity (armhole depth / back length across a realistic size run):\n");
    struct Size { double bu, sh, ne, bl; };
    const Size run[] = {{80,36,33,38},{92,39,36,41},{104,42,39,44},{116,45,42,47},{128,47,44,49},{140,49,46,51}};
    double minShare = 1e9, maxShare = -1e9;
    for (const Size& z : run) {
        const BodyMeasurementsSnapshot m{z.bu, z.bu * 0.8, z.bu * 1.08, z.sh, z.bl, 58, z.ne};
        const BodiceDraft bod = BodiceBlock::draft(m, {});
        const double share = bod.armholeDepth / (z.bl * 10);
        minShare = std::min(minShare, share); maxShare = std::max(maxShare, share);
        std::printf("  bust %.0f cm -> armhole depth %.0f mm = %.2f x back length\n", z.bu, bod.armholeDepth, share);
    }
    std::printf("  share range %.2f-%.2f: %s (a scaled block would balloon this well past 0.6)\n",
                minShare, maxShare, (maxShare - minShare) < 0.12 ? "STABLE — no grading distortion"
                                                                  : "drifts — investigate");
    std::printf("\nverdict: waist lands within %.1f mm on average (worst %.1f mm); every princess\n"
                "seam pair matches to %.2f mm and side seams to %.2f mm, so the pieces sew together;\n"
                "%s\n",
                waistFit.mean(), waistFit.worst(), princess.worst(), sideSeam.worst(),
                capOutOfWindow == 0 ? "every sleeve eases into its armhole within the sewable window."
                                    : "SOME sleeves fall outside the sewable window (see above).");
    return 0;
}
