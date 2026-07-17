#pragma once
// Wearability invariants — the "can a human actually put this on and wear it?"
// oracle. The existing validator proves INTERNAL CONSISTENCY (seams sew, curves
// don't fold, waists match). These checks prove EXTERNAL WEARABILITY, the thing
// an outside LLM caught while every internal test was green: a front-buttoned
// blouse redrawn as "cut on fold" with no opening and a neck too small for a
// head to pass. "Passed the tests" was false confidence because the tests
// measured the wrong thing.
//
// Every rule here is a wearing FAILURE, not a drafting inconsistency:
//   1. HEAD ENTRY      — a closed-neck garment with no opening must let a head
//                        through the finished neckline, or it cannot be donned.
//   2. FOLD vs OPENING — a piece that carries a real opening (placket/tie/back
//                        cutout) can NOT be cut on the fold on that same edge.
//   3. EDGE FINISH     — a sleeveless armhole must have a finish (binding/facing)
//                        or an honest guide note telling the sewist to add one.
//   4. WOVEN EASE      — a woven garment can't have zero/negative chest ease
//                        (it would not close over the body).
//
// Rules 1–3 are BLOCKING (they gate the draft the way keyhole/facing rules do:
// an issue here means the pattern is genuinely unwearable and must not reach a
// PDF). Rule 4 is a WARN surfaced only in the ctest, because the woven ease is
// already enforced upstream by the chest-width invariant; here it is a redundant
// sanity net measured directly off the finished neckline for the test report.
//
// Thresholds are justified in FORMULAS.md "Wearability invariants" against
// Aldrich / Armstrong tolerances so a real, tight-but-wearable draft never trips.

#include <string>
#include <vector>

#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {

struct GarmentSpec;      // measurements.hpp
struct ValidationIssue;  // validator.hpp

namespace Wearability {

// A closed-neck garment with no other opening must let a head through its
// finished neck OPENING (= 2*(front half-neck + back half-neck), measured off
// the drafted center pieces). We deliberately keep this a DEGENERACY guard, not
// a "does a head fit" estimator, because the finished perimeter is a noisy head
// oracle: a wide-shallow boat/bateau neck legitimately draws a perimeter WELL
// under the neck girth (it sits across the collarbones, off the neck base), and
// the shoulder clamp shrinks it further on a broad-neck / narrow-shoulder body —
// all perfectly wearable. Any perimeter-vs-body threshold above trivia therefore
// false-positives on real drafts (measured: a legit boat top can sit at 455 mm
// on a 500 mm neck). So the gate fires ONLY when the opening has collapsed to a
// near-nothing hole no neck — let alone head — could pass: the geometric residue
// of a dropped/corrupt neckline. The floor sits far under the smallest real
// draft (267 mm across every body/neckline in the harness), so no legitimate
// pattern is ever refused; it catches only a genuinely sealed, un-donnable tube.
// The strong, body-independent wearability gates are rules 2 (fold vs opening)
// and 3 (edge finish); this rule is the honest, narrow safety net for a
// collapsed opening.
inline constexpr double neckOpeningDegenerateMM = 150.0; // collapsed-opening floor
// Woven garments need real breathing room at the bust; below this the chest is
// eaten and it won't close. Knits live on a looser (can be ~0) budget.
inline constexpr double wovenChestEaseMinMM = 20.0; // total, ~5 mm per quarter

// All wearability issues for a finished draft. spec + measurements + the drafted
// pieces are the only inputs; the checks read the ACTUAL geometry the engine
// produced (finished neckline off the front/back center pieces), never a
// recomputed ideal — so they catch a draft that drifted from its own intent.
std::vector<ValidationIssue> issues(
    const GarmentSpec& spec,
    const BodyMeasurementsSnapshot& m,
    const DraftedPattern& draft);

// Finished neck-opening perimeter (mm) measured off the drafted center pieces,
// or a negative sentinel when the pieces can't be read. Exposed for the test.
double finishedNeckOpeningMM(const GarmentSpec& spec, const DraftedPattern& draft);

// True when the garment has ANY way in other than the neck opening (a CB zipper,
// a front placket, a back cutout/tie, a halter nape closure). Exposed for the
// test so it can assert the head-entry rule fires only on a sealed garment.
bool hasDonningOpening(const GarmentSpec& spec, const DraftedPattern& draft);

} // namespace Wearability
} // namespace stitchu
