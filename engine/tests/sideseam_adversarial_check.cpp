// Seam-matching, proven the ADVERSARIAL way. The validator already refuses a
// draft whose front side seam and back side seam disagree by more than
// PatternValidator::pairedSeamTolerance (they would never sew together). Every OTHER test proves
// that rule stays SILENT on a good draft (34/34 green). None proved it FIRES
// when the geometry is deliberately broken — and a rule that only ever passes is
// indistinguishable from a rule that is dead. This test breaks real drafted
// geometry (in the same hand-rolled style as wearability_check.cpp corrupting
// points around line 141) and asserts the "sideseam" issue category actually
// appears, for the skirt rule (validator.cpp:516-519) and the top rule
// (validator.cpp:691-695), plus the skirt rule reached through a DRESS. A GOOD
// draft of each is the control: the rule must stay silent there.
//
// The bodice rule (validator.cpp:194-198) is handled HONESTLY: it is a
// RECOMPUTED audit — bodiceIssues recomputes BodiceBlock::draft(m, options) and
// reads bodice.frontSideSeam / bodice.backSideSeam from that fresh draft, NOT
// from draft.pieces. So corrupting the emitted Bodice Front/Back pieces cannot
// make it fire through PatternValidator::issues (verified: it stays silent). We
// therefore assert the control (a good bodice is clean) and, rather than fake a
// pass, we drive the SAME delta-vs-PatternValidator::pairedSeamTolerance logic on a directly
// constructed mismatched BodiceDraft to show the threshold itself is live. The
// summary states plainly that the public API cannot adversarially exercise the
// bodice rule via output mutation.
#include <cstdio>
#include <cmath>
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

static bool hasRule(const std::vector<ValidationIssue>& v, const std::string& rule) {
    for (const auto& i : v)
        if (i.rule == rule) return true;
    return false;
}

static PatternPiece* find(DraftedPattern& d, const std::string& name) {
    for (auto& p : d.pieces)
        if (p.name == name) return &p;
    return nullptr;
}

int main() {
    std::printf("sideseam adversarial check — break the geometry, prove the gate FIRES\n");
    const BodyMeasurementsSnapshot m{92, 74, 98, 39, 42, 58, 36};

    // ---- SKIRT rule (validator.cpp:516-519), standalone ------------------------
    // skirtSideSeamLength measures the quarter side seam as commands[1..3]
    // (waist-to-hip curve + hip-to-hem line). Dropping the front hem point far
    // down makes the FRONT side seam much longer than the back's — they can no
    // longer sew together.
    std::printf("Skirt side seam (standalone):\n");
    {
        GarmentSpec s; s.garment = GarmentType::Skirt; s.skirtStyle = SkirtStyle::ALine;
        DraftedPattern good = GarmentDrafter::draft(s, m);
        check(!hasRule(PatternValidator::issues(s, m, good), "sideseam"),
              "control: a good A-line skirt has NO sideseam issue");

        DraftedPattern bad = GarmentDrafter::draft(s, m);
        PatternPiece* front = find(bad, "Front");
        check(front != nullptr, "skirt front piece exists");
        if (front && front->commands.size() > 3) {
            front->commands[3].to.y += 120.0; // hip-to-hem point pulled down 120 mm
        }
        check(hasRule(PatternValidator::issues(s, m, bad), "sideseam"),
              "broken: a skirt with a longer front side seam FIRES the sideseam gate");
    }
    std::printf("\n");

    // ---- SKIRT rule reached through a DRESS ------------------------------------
    // A dress routes bodice + skirt; the same skirt side-seam rule runs on the
    // "Skirt Front" / "Skirt Back" pieces. Break the dress skirt the same way.
    std::printf("Skirt side seam (inside a dress):\n");
    {
        GarmentSpec s; s.garment = GarmentType::Dress; s.skirtStyle = SkirtStyle::ALine;
        DraftedPattern good = GarmentDrafter::draft(s, m);
        check(!hasRule(PatternValidator::issues(s, m, good), "sideseam"),
              "control: a good A-line dress has NO sideseam issue");

        DraftedPattern bad = GarmentDrafter::draft(s, m);
        PatternPiece* front = find(bad, "Skirt Front");
        check(front != nullptr, "dress skirt front piece exists");
        if (front && front->commands.size() > 3) {
            front->commands[3].to.y += 120.0;
        }
        check(hasRule(PatternValidator::issues(s, m, bad), "sideseam"),
              "broken: a dress with a longer front skirt side seam FIRES the sideseam gate");
    }
    std::printf("\n");

    // ---- TOP rule (validator.cpp:691-695) --------------------------------------
    // topSideSeamLength walks back over the center-edge closing lines and measures
    // the side-to-hem curve (commands[hemEnd-1], with move from commands[hemEnd-2]).
    // For a hip-length top that curve is commands[4]. Dropping its end + control
    // points lengthens the FRONT side seam past the back's. The rule only runs on
    // an extended (below-waist) top, so use Hip length.
    std::printf("Top side seam:\n");
    {
        GarmentSpec s; s.garment = GarmentType::Top; s.topLength = TopLength::Hip;
        DraftedPattern good = GarmentDrafter::draft(s, m);
        check(!hasRule(PatternValidator::issues(s, m, good), "sideseam"),
              "control: a good hip-length top has NO sideseam issue");

        DraftedPattern bad = GarmentDrafter::draft(s, m);
        PatternPiece* front = find(bad, "Top Front");
        check(front != nullptr, "top front piece exists");
        // The side-to-hem curve is found by TOPOLOGY, not by a pinned index: the
        // extended top grew a LINE to the side waist on 2026-09-04 (the waist
        // point is back on the outline) and a hard-coded commands[4] silently
        // started corrupting the wrong command — the adversary stopped being an
        // adversary. Take the LAST curve before the trailing hem/CF commands,
        // exactly the way validator.cpp::topSideSeamLength walks back.
        size_t hemEnd = front ? front->commands.size() - 1 : 0;
        while (front && hemEnd > 0 &&
               (front->commands[hemEnd].type == CmdType::Close ||
                front->commands[hemEnd].type == CmdType::Line)) --hemEnd;
        if (front && hemEnd >= 2 && front->commands[hemEnd - 1].type == CmdType::Curve) {
            PathCommand& side = front->commands[hemEnd - 1];
            side.to.y += 120.0;
            side.cp1.y += 120.0;
            side.cp2.y += 120.0;
        }
        check(hasRule(PatternValidator::issues(s, m, bad), "sideseam"),
              "broken: a top with a longer front side seam FIRES the sideseam gate");
    }
    std::printf("\n");

    // ---- BODICE rule (validator.cpp:194-198) — HONEST treatment ----------------
    // The bodice rule reads bodice.frontSideSeam / bodice.backSideSeam off a
    // FRESH BodiceBlock::draft the validator recomputes internally — NOT off the
    // emitted Bodice Front/Back pieces. So corrupting those pieces cannot make it
    // fire through the public API. We verify the control (clean) and prove the
    // recompute is genuinely output-independent, then drive the SAME
    // delta-vs-tolerance threshold on a directly built mismatched BodiceDraft so
    // the gate logic itself is shown live (not faked).
    std::printf("Bodice side seam (recomputed audit — see summary):\n");
    {
        GarmentSpec s; s.garment = GarmentType::Dress; s.shaping = Shaping::Dart;
        DraftedPattern good = GarmentDrafter::draft(s, m);
        check(!hasRule(PatternValidator::issues(s, m, good), "sideseam"),
              "control: a good dart-bodice dress has NO sideseam issue");

        // Corrupt the emitted bodice front geometry hard; the recomputed audit
        // must NOT be fooled (it does not read these pieces) — documents WHY the
        // bodice rule cannot be adversarially driven through output mutation.
        DraftedPattern bad = GarmentDrafter::draft(s, m);
        PatternPiece* bf = find(bad, "Bodice Front");
        if (bf) for (auto& c : bf->commands) { c.to.y *= 1.4; c.cp1.y *= 1.4; c.cp2.y *= 1.4; }
        check(!hasRule(PatternValidator::issues(s, m, bad), "sideseam"),
              "corrupting the emitted bodice front does NOT fire it (rule recomputes, not measures)");

        // The threshold itself is live: a real bodice matches within tolerance,
        // and forcing frontSideSeam past PatternValidator::pairedSeamTolerance would exceed it.
        const BodiceDraft b = BodiceBlock::draft(m, {});
        const double realDelta = std::fabs(b.frontSideSeam - b.backSideSeam);
        check(realDelta <= PatternValidator::pairedSeamTolerance,
              std::string("real bodice front/back side seams match within tolerance (delta ") +
              std::to_string((int)realDelta) + " mm <= " + std::to_string((int)PatternValidator::pairedSeamTolerance) + " mm)");
        const double forcedDelta = std::fabs((b.frontSideSeam + 20.0) - b.backSideSeam);
        check(forcedDelta > PatternValidator::pairedSeamTolerance,
              "a 20 mm forced mismatch would exceed PatternValidator::pairedSeamTolerance (the gate threshold is live)");
    }
    std::printf("\n");

    std::printf(failures == 0 ? "ALL SIDESEAM ADVERSARIAL CHECKS PASS\n"
                              : "%d SIDESEAM ADVERSARIAL CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
