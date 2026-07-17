// Closed-tube proof — a wearable garment is a CLOSED loop: the front and back
// pieces join along their declared side seams into a tube, with every raw
// structural edge either sewn to a mate or given a finish (binding/facing/hem).
// A pattern with a missing structural half is an open flap, not a garment — it
// cannot be worn no matter how clean each surviving piece is.
//
// This reuses the EXISTING wearability + structural logic rather than inventing a
// second topology engine:
//   * Wearability::issues (wearability.cpp rule 3) proves the raw edges are
//     finished — no leftover raw structural edge (binding/edge-finish excepted,
//     which is exactly the allowed exception the constitution names);
//   * the garment-type structural rules (validator.cpp top/skirt/facing) prove
//     both halves of the tube are present — a top with no back half fires the
//     "top: Back piece missing" rule, a dress with no skirt back fires the skirt
//     + zipper rules. Together: "no blocking issue" == the tube is closed and
//     finished.
//
// We assert a normal dress and top are CLOSED (no such issue), and that removing
// a structural piece makes the garment NOT closed (a blocking issue appears).
// The blocking issue is what a raw open edge / missing seam mate looks like to
// the existing gate.
#include <cstdio>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/validator.hpp"
#include "../src/wearability.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static bool has(const DraftedPattern& d, const std::string& name) {
    for (const auto& p : d.pieces) if (p.name == name) return true;
    return false;
}

static void removePiece(DraftedPattern& d, const std::string& name) {
    std::vector<PatternPiece> kept;
    for (const auto& p : d.pieces) if (p.name != name) kept.push_back(p);
    d.pieces = kept;
}

// "Closed" oracle: no wearability blocker (raw edges finished) AND no structural
// rule flagging a missing tube half. Any such issue means an open/raw edge.
static bool isClosed(const GarmentSpec& s, const BodyMeasurementsSnapshot& m, const DraftedPattern& d) {
    for (const auto& i : Wearability::issues(s, m, d)) {
        (void)i;
        return false; // any wearability issue => a raw/unfinished/un-donnable edge
    }
    for (const auto& i : PatternValidator::issues(s, m, d)) {
        // Structural rules that mean a tube half / seam mate is missing or open.
        if (i.rule == "top" || i.rule == "skirt" || i.rule == "pieces" ||
            i.rule == "facing" || i.rule == "wearability" || i.rule == "zipper") return false;
    }
    return true;
}

int main() {
    std::printf("closed garment check — the pieces join into a wearable tube\n");
    const BodyMeasurementsSnapshot m{92, 74, 98, 39, 42, 58, 36};

    // ---- Normal top is a closed tube -------------------------------------------
    std::printf("Top:\n");
    {
        GarmentSpec s; s.garment = GarmentType::Top; s.topLength = TopLength::Hip;
        s.sleeveStyle = SleeveStyle::Straight;
        const DraftedPattern good = GarmentDrafter::draft(s, m);
        check(has(good, "Top Front") && has(good, "Top Back"),
              "top has front + back halves (the two sides of the tube)");
        check(isClosed(s, m, good), "control: a normal hip-length top is a CLOSED, finished tube");

        // Remove a structural half — the tube can no longer close.
        DraftedPattern bad = GarmentDrafter::draft(s, m);
        removePiece(bad, "Top Back");
        check(!isClosed(s, m, bad),
              "removing the back half makes the top NOT closed (an open, un-wearable flap)");
    }
    std::printf("\n");

    // ---- Normal dress is a closed tube -----------------------------------------
    std::printf("Dress:\n");
    {
        GarmentSpec s; s.garment = GarmentType::Dress;
        const DraftedPattern good = GarmentDrafter::draft(s, m);
        check(has(good, "Bodice Front") && has(good, "Bodice Back"),
              "dress bodice has front + back halves");
        check(has(good, "Skirt Front") && has(good, "Skirt Back"),
              "dress skirt has front + back halves");
        check(isClosed(s, m, good), "control: a normal A-line dress is a CLOSED, finished tube");

        // Remove the skirt back — the lower tube loses its seam mate + the CB
        // zipper has nothing to run into. The gate must refuse it.
        DraftedPattern bad = GarmentDrafter::draft(s, m);
        removePiece(bad, "Skirt Back");
        check(!isClosed(s, m, bad),
              "removing the skirt back makes the dress NOT closed (lower tube left open)");
    }
    std::printf("\n");

    // ---- Sleeveless armhole finish is part of being closed ---------------------
    // A closed tube still has raw armhole edges when sleeveless; the edge-finish
    // rule (binding/facing/honest note) is what closes them. Strip the finish and
    // the note and the garment is no longer closed.
    std::printf("Sleeveless armhole finish (raw-edge closure):\n");
    {
        GarmentSpec s; s.garment = GarmentType::Top; s.neckline = Neckline::Scoop;
        s.sleeveStyle = SleeveStyle::None;
        const DraftedPattern good = GarmentDrafter::draft(s, m);
        check(isClosed(s, m, good),
              "control: a sleeveless top with its honest armhole binding is closed");

        DraftedPattern bad = GarmentDrafter::draft(s, m);
        std::vector<PatternPiece> keptPieces;
        for (const auto& p : bad.pieces) {
            if (p.name.find("Bias binding") != std::string::npos ||
                p.name.find("Armhole Facing") != std::string::npos) continue;
            keptPieces.push_back(p);
        }
        bad.pieces = keptPieces;
        std::vector<std::string> keptSteps;
        for (const auto& step : bad.guideSteps) {
            const bool armholeFinish = (step.find("armhole") != std::string::npos) &&
                (step.find("bind") != std::string::npos || step.find("binding") != std::string::npos ||
                 step.find("bias") != std::string::npos || step.find("facing") != std::string::npos);
            if (!armholeFinish) keptSteps.push_back(step);
        }
        bad.guideSteps = keptSteps;
        check(!isClosed(s, m, bad),
              "stripping the armhole finish leaves a raw edge — NOT closed");
    }
    std::printf("\n");

    std::printf(failures == 0 ? "ALL CLOSED-GARMENT CHECKS PASS\n"
                              : "%d CLOSED-GARMENT CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
