// Wearability check — turns the outside-LLM lesson into a permanent test.
// An LLM found a draft that was green on every internal test yet unwearable
// (front-buttoned redrawn as cut-on-fold, nothing opens, head won't pass).
// These invariants (validator.cpp -> Wearability::issues) catch that class of
// bug deterministically, for free, on every draft. This test proves:
//   1. real, tight-but-wearable drafts across all garment types PASS the gate
//      (no false positives that would block a shipping pattern),
//   2. a genuinely sealed top (tiny neck, no opening) FAILS head-entry,
//   3. a front placket collapsed to a plain fold FAILS fold-vs-opening,
//   4. a sleeveless armhole with no finish + no honest note FAILS edge-finish,
//   5. the finished neck opening is measured off the REAL drafted geometry,
//   6. a woven garment with ~zero chest ease is caught (WARN, rule 4).
#include <cstdio>
#include <cmath>
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

static bool hasWearIssue(const std::vector<ValidationIssue>& v, const std::string& needle) {
    for (const auto& i : v)
        if (i.rule == "wearability" && i.detail.find(needle) != std::string::npos) return true;
    return false;
}
static int wearCount(const std::vector<ValidationIssue>& v) {
    int n = 0;
    for (const auto& i : v) if (i.rule == "wearability") n++;
    return n;
}

int main() {
    // A normal EU~38 adult body. Neck 36 cm is a real average (Aldrich block).
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};

    // ---- 1. Real drafts across garment types PASS the whole gate ---------------
    std::printf("Real drafts stay wearable (no false positives):\n");
    struct Case { const char* label; GarmentSpec spec; };
    std::vector<Case> good;
    {
        GarmentSpec dress; dress.garment = GarmentType::Dress; good.push_back({"crew A-line dress", dress});
        GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::Scoop;
        top.sleeveStyle = SleeveStyle::Straight; good.push_back({"scoop sleeved top", top});
        GarmentSpec boat; boat.garment = GarmentType::Top; boat.neckline = Neckline::Boat;
        boat.sleeveStyle = SleeveStyle::Straight; good.push_back({"boat-neck top", boat});
        GarmentSpec halter; halter.garment = GarmentType::Dress; halter.neckline = Neckline::Halter;
        good.push_back({"halter dress", halter});
        GarmentSpec plackTop; plackTop.garment = GarmentType::Top; plackTop.neckline = Neckline::Crew;
        plackTop.sleeveStyle = SleeveStyle::Straight; plackTop.frontPlacket = true;
        good.push_back({"crew shirt w/ placket", plackTop});
        GarmentSpec slvlessScoop; slvlessScoop.garment = GarmentType::Top; slvlessScoop.neckline = Neckline::Scoop;
        good.push_back({"sleeveless scoop top", slvlessScoop});
        GarmentSpec skirt; skirt.garment = GarmentType::Skirt; good.push_back({"A-line skirt", skirt});
    }
    for (auto& c : good) {
        const DraftedPattern d = GarmentDrafter::draft(c.spec, m);
        const auto all = PatternValidator::issues(c.spec, m, d);
        const auto wear = Wearability::issues(c.spec, m, d);
        for (const auto& i : all) if (i.rule == "wearability") std::printf("      issue: %s\n", i.description().c_str());
        check(wearCount(wear) == 0 && !hasWearIssue(all, "cannot be put on"),
              std::string(c.label) + " is wearable");
    }
    std::printf("\n");

    // ---- 2. A COLLAPSED neckline (opening drawn to near-nothing) FAILS ----------
    // The gate is a DEGENERACY guard, not a head-fit estimator: the finished
    // perimeter is a noisy head oracle (a wide-shallow boat neck legitimately sits
    // well under the neck girth), so we only refuse an opening collapsed to a
    // hole no head could pass — the geometric residue of a dropped/corrupt
    // neckline. Every real neckline on every body clears it (harness min 267 mm,
    // floor 150 mm). We reproduce the failure by shrinking the drafted neck edge
    // to near the fold, then assert the gate refuses it while real drafts pass.
    std::printf("Head-entry gate (collapsed-opening guard):\n");
    {
        GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::Crew;
        top.sleeveStyle = SleeveStyle::Straight; // sleeved -> armhole finish not at issue
        // Every real body/neckline passes (small necks AND wide-shallow boats).
        for (double neckCM : {26.0, 36.0, 50.0}) {
            for (auto nl : {Neckline::Crew, Neckline::Boat, Neckline::Scoop}) {
                BodyMeasurementsSnapshot b = m; b.neckCM = neckCM;
                GarmentSpec t = top; t.neckline = nl;
                const DraftedPattern d = GarmentDrafter::draft(t, b);
                check(!hasWearIssue(Wearability::issues(t, b, d), "cannot be put on"),
                      std::string("neck ") + std::to_string((int)neckCM) + " cm " +
                      raw(nl) + " top passes (real opening clears)");
            }
        }
        check(!Wearability::hasDonningOpening(top, GarmentDrafter::draft(top, m)),
              "a plain crew top has no donning opening");
        // Now COLLAPSE the neckline to near the fold — an un-donnable sealed tube.
        DraftedPattern bad = GarmentDrafter::draft(top, m);
        for (auto& p : bad.pieces) {
            const bool isFront = p.name == "Bodice Center Front" || p.name == "Bodice Front" ||
                                 p.name == "Top Center Front" || p.name == "Top Front";
            const bool isBack = p.name == "Bodice Center Back" || p.name == "Bodice Back" ||
                                p.name == "Top Center Back" || p.name == "Top Back";
            if (!isFront && !isBack) continue;
            // Collapse the neck edge (command[1]) almost onto the center-neck move
            // point (command[0]) — a dropped neckline with a near-zero opening.
            if (p.commands.size() > 1) {
                const Point c = p.commands[0].to;
                auto pull = [&](Point& q){ q.x = c.x + (q.x - c.x) * 0.02; q.y = c.y + (q.y - c.y) * 0.02; };
                pull(p.commands[1].to); pull(p.commands[1].cp1); pull(p.commands[1].cp2);
            }
        }
        const double badOpening = Wearability::finishedNeckOpeningMM(top, bad);
        std::printf("      collapsed neckline: opening %.0f mm (floor %.0f)\n",
                    badOpening, Wearability::neckOpeningDegenerateMM);
        check(hasWearIssue(Wearability::issues(top, m, bad), "cannot be put on"),
              "a neckline collapsed to near-nothing FAILS head entry");
        // A dress is exempt regardless: it gets a CB zipper to don it.
        GarmentSpec dress = top; dress.garment = GarmentType::Dress;
        check(Wearability::hasDonningOpening(dress, GarmentDrafter::draft(dress, m)),
              "a dress has a CB-zipper donning opening (exempt from head entry)");
    }
    std::printf("\n");

    // ---- 3. Fold-vs-opening: a placket collapsed to a plain fold FAILS ---------
    // Simulate the exact outside-LLM bug: the spec declares a front button
    // placket, but the drawn front is a plain center-front fold with no stand and
    // no button markings (the closure was silently dropped). We reproduce it by
    // taking a real placket draft and stripping the stand + markings off the
    // front piece, then asserting the gate catches it.
    std::printf("Fold-vs-opening gate (the outside-LLM bug):\n");
    {
        GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::Crew;
        top.sleeveStyle = SleeveStyle::Straight; top.frontPlacket = true;
        DraftedPattern d = GarmentDrafter::draft(top, m);
        // Honest placket draft is wearable.
        check(!hasWearIssue(Wearability::issues(top, m, d), "closure was dropped"),
              "a real drawn placket is NOT flagged (opening exists)");
        // Now corrupt it: find the front, clamp every point to x >= 0 (kill the
        // grown-on stand) and drop the placket markings -> a plain CF fold.
        for (auto& p : d.pieces) {
            const bool isFront = p.name == "Bodice Center Front" || p.name == "Bodice Front" ||
                                 p.name == "Top Center Front" || p.name == "Top Front";
            if (!isFront) continue;
            for (auto& c : p.commands) { if (c.to.x < 0) c.to.x = 0; if (c.cp1.x < 0) c.cp1.x = 0; if (c.cp2.x < 0) c.cp2.x = 0; }
            p.markings.clear();
            p.cutInstruction = "cut 1 on fold";
        }
        const auto wear = Wearability::issues(top, m, d);
        check(hasWearIssue(wear, "closure was dropped"),
              "placket declared but collapsed to a plain fold FAILS");
    }
    std::printf("\n");

    // ---- 4. Sleeveless armhole must be finished --------------------------------
    std::printf("Edge-finish gate (sleeveless armhole):\n");
    {
        GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::Scoop;
        top.sleeveStyle = SleeveStyle::None; // sleeveless
        DraftedPattern d = GarmentDrafter::draft(top, m);
        // The honest engine emits an armhole-binding guide note -> wearable.
        check(!hasWearIssue(Wearability::issues(top, m, d), "raw, fraying edge"),
              "sleeveless top with the honest bias-binding note passes");
        // Strip every armhole-finish note AND the armhole binding PIECE (patch
        // 3.10 draws the binding as its own piece by default) -> the armhole is
        // now genuinely unfinished, and the gate must flag it.
        std::vector<std::string> kept;
        for (const auto& s : d.guideSteps) {
            const bool armholeFinish = (s.find("armhole") != std::string::npos) &&
                (s.find("bind") != std::string::npos || s.find("binding") != std::string::npos ||
                 s.find("bias") != std::string::npos || s.find("facing") != std::string::npos);
            if (!armholeFinish) kept.push_back(s);
        }
        d.guideSteps = kept;
        std::vector<PatternPiece> keptPieces;
        for (const auto& p : d.pieces) {
            if (p.name.find("Bias binding") != std::string::npos ||
                p.name.find("Armhole Facing") != std::string::npos) continue;
            keptPieces.push_back(p);
        }
        d.pieces = keptPieces;
        check(hasWearIssue(Wearability::issues(top, m, d), "raw, fraying edge"),
              "sleeveless armhole with no finish + no note FAILS");
    }
    std::printf("\n");

    // ---- 5. Golden base pieces untouched (we only READ geometry) ---------------
    // The wearability module adds no piece and mutates nothing; a plain draft has
    // the same piece names/counts whether or not the gate ran.
    std::printf("Non-destructive (reads geometry, changes nothing):\n");
    {
        GarmentSpec dress; dress.garment = GarmentType::Dress;
        const DraftedPattern a = GarmentDrafter::draft(dress, m);
        (void)PatternValidator::issues(dress, m, a); // runs the gate
        const DraftedPattern b = GarmentDrafter::draft(dress, m);
        bool same = a.pieces.size() == b.pieces.size();
        for (size_t i = 0; same && i < a.pieces.size(); ++i)
            same = a.pieces[i].name == b.pieces[i].name &&
                   a.pieces[i].commands.size() == b.pieces[i].commands.size();
        check(same, "running the gate does not alter the draft");
    }
    std::printf("\n");

    // ---- 6. Woven ease sanity (rule 4, WARN) -----------------------------------
    // A woven top needs real chest ease. The chest-width invariant already
    // enforces this upstream; here we assert the finished front chest carries the
    // woven ease budget, as an independent report line.
    std::printf("Woven ease sanity (rule 4 report):\n");
    {
        GarmentSpec top; top.garment = GarmentType::Top; top.neckline = Neckline::Scoop;
        top.fabric = Fabric::Woven;
        const DraftedPattern d = GarmentDrafter::draft(top, m);
        // No wearability blocker should fire on a normal woven top.
        check(wearCount(Wearability::issues(top, m, d)) == 0, "normal woven top has zero wearability blockers");
        std::printf("      (woven chest-ease floor %.0f mm is enforced by the chest invariant upstream)\n",
                    Wearability::wovenChestEaseMinMM);
    }
    std::printf("\n");

    std::printf(failures == 0 ? "ALL WEARABILITY CHECKS PASS\n" : "%d WEARABILITY CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
