#pragma once
// ---- THE OPERATOR PROGRAM: op.split / op.suppress / op.rotate ON THE PLAN ----
//                                          (GECE7 / F5-D, borç 45 + 49 + 51, K46)
//
// WHAT WAS WRONG, AND IT WAS MEASURED BY THE REFEREE THREE TIMES.
//
//     panelsplit.hpp · dartsuppress.hpp · dartrotate.hpp
//       ->  garment.cpp / wasm/bindings.cpp / web/js/*   :  ZERO LINES IN ALL THREE
//
// Three sub-cards built three real operators, each with its own gate, and a user
// could not reach any of them: no panel could be divided, no dart opened, no
// dart moved. `op.X` existed only inside `tools/X-op.cpp`, a driver that prints
// JSON for a gate. "It is in the engine" is not a product (CLAUDE.md's only
// test), so this file is the wire: ONE call that asks all three operators about
// a SeamPlan and writes what they answer back INTO the plan.
//
// ---------------------------------------------------------------------------
// THE THREE RULES THIS FILE OBEYS, AND NONE OF THEM IS A PREFERENCE.
//
// 1. NO OPERATOR'S GEOMETRY IS TOUCHED (K36/K41, F5-D's DEĞİŞMEZLER).
//    splitPanel() still takes a panel and nothing else, suppressPanel() still
//    has no angle argument, rotateDart() is called exactly as tools/rotate-op
//    calls it. This file adds no dial: every choice it makes (which column the
//    dart's mouth sits on, how deep the apex runs, which boundary vertex the
//    transfer targets) is READ off the plan — `plan.opt.bodiceApexFrac`, the
//    panel's own waist/far runs, the plan's own stitch kinds — using the same
//    rules the three drivers already state.
//
// 2. A REFUSAL IS AN ANSWER AND IT TRAVELS (RULES 1, §0B).
//    The shipped garment is a cone: op.suppress refuses it (deficit -1.9628 deg
//    on left_ftorso, -0.1116 on left_btorso) and op.split refuses the back and
//    the skirt (flat column profile). Those refusals are the product's real
//    answer to "divide this" and they are carried out to the user WITH THE
//    NUMBER, not swallowed into an empty result.
//
// 3. THE SHIPPED READING DOES NOT MOVE (RULES 4, opt-in / default OFF).
//    runOperatorProgram() takes a COPY of the plan. planJSON() and flatJSON()
//    are untouched, `nodeId()` is untouched, and the golden pattern the site
//    ships today is byte-identical. What the program produces is published on
//    its own surface (opsJSON) and reached by its own binding.
//
// ---------------------------------------------------------------------------
// ⭐ WHAT "WRITTEN BACK" ACTUALLY MEANS HERE, because the phrase is cheap.
//
// splitPanel() returns two contours and until today they went NOWHERE (borç 51).
// A divided panel that does not enter the plan is a drawing of a division. So:
//
//   - piece A REPLACES the panel it came from and piece B is APPENDED, so the
//     plan holds the two pieces instead of the whole — the cloth is not doubled.
//   - EVERY STITCH THAT REFERENCED THE DIVIDED PANEL IS RE-ADDRESSED, not
//     dropped. The two pieces are contiguous slices of one closed boundary, so
//     the map from an old edge index to (piece, edge index) is total and exact;
//     it is written out in planops.cpp and it is what keeps the plan a plan.
//   - THE CUT ITSELF BECOMES A SEAM: the closing edge of piece A and the closing
//     edge of piece B are declared as one pair, because they join the same two
//     coordinates and the garment is sewn back together along them.
//   - THAT SEAM CARRIES A `reason` — the first `reason` layer in the repo, and
//     the thing H4 has been waiting nine phases for (§3.6: "sebebi olmayan dikiş
//     sayısı"). The reason is not prose: it is the measured deficit the division
//     answered.
//
// ⚠ AND WHAT IT IS NOT CALLED. This cut is NOT named a princess seam or a cup
// seam on any surface a user reads (K42 md.2) — no publication was found binding
// a panel seam to the balanced-load column. `SurfaceStitch::Kind` is reused as a
// TOPOLOGY tag inside the engine because that enum already means "a vertical
// seam between two torso panels"; the JSON says `panel_bolme`, and the
// maximum-curvature column is printed beside the cut so the other rule is a
// number rather than a footnote (K42 md.3).
//
// UNITS mm; angles in degrees.
#include <cstddef>
#include <string>
#include <vector>

#include "seamplan.hpp"

namespace stitchu {

// One question asked of one operator about one panel, and its answer. `applied`
// false with an EMPTY refusal is impossible by construction (RULES 1).
struct OpStep {
    std::string op;       // "op.split" | "op.suppress" | "op.rotate"
    std::string panel;    // the panel it was asked about, by name
    bool applied = false;
    // ⭐ APPLIED IS NOT WRITTEN BACK, AND THE TWO ARE PRINTED SEPARATELY.
    // A panel is either divided or suppressed — both take the same curvature
    // out and doing both suppresses it twice, which suppress-op measured (the
    // panel self-intersects). So an operator can honestly succeed and still not
    // be the answer that entered the plan, and saying "applied" for both would
    // hide which one the user actually gets.
    bool writtenBack = false;
    std::string refusal;  // non-empty EXACTLY when applied == false
    // ⭐ WHY THIS EDIT EXISTS, as a measured sentence. H4's layer.
    std::string reason;

    // ---- op.split, all measured off the two contours that came out ---------
    std::string pieceA, pieceB;   // the names the two pieces entered the plan as
    std::size_t colsN = 0, atColumn = 0;
    double atFractionMeasured = 0.0;
    std::size_t maxCurvatureColumn = 0;   // K42 md.3 — printed BESIDE, never used
    double maxCurvatureDeg = 0.0;
    double deficitWholeDeg = 0.0, deficitADeg = 0.0, deficitBDeg = 0.0;
    double cancelledWholeDeg = 0.0;
    // THE SEAM PAIR. Two lengths measured on two different contours — if this
    // file measured once and copied, the pair would be equal by typing.
    double cutLenAMM = 0.0, cutLenBMM = 0.0;
    long long stitchIndex = -1;   // where the pair landed in plan.pattern.stitches

    // ---- op.suppress -------------------------------------------------------
    double deficitDeg = 0.0;      // what the SURFACE asked for
    double wedgeMeasuredDeg = 0.0;  // what the resulting boundary actually subtends
    double areaRemovedMM2 = 0.0;

    // ---- op.rotate ---------------------------------------------------------
    double wedgeBeforeDeg = 0.0, wedgeAfterDeg = 0.0;
    double areaBeforeMM2 = 0.0, areaAfterMM2 = 0.0;
    // ⭐ THE TWO CONTOURS THEMSELVES (GECE7 / F5-E İŞ 0, borç 66 / K49).
    //
    // The four numbers above are what `rotateDart()` SAYS about its own work, and
    // a gate that reads only them is checking an IDENTITY ("this step was asked,
    // applied and written back") rather than a CORRECTNESS ("the transfer moved
    // cloth without manufacturing any"). The referee measured the difference:
    // `theta * 0.90` in dartrotate.cpp burned `rotate_check` EXIT 1 (area
    // 32473.1791 -> 36134.0402 mm², 3660.86 mm² of cloth out of nothing) and left
    // `op_program_check` EXIT 0 — a K30-class hole standing on the product path.
    //
    // So the boundary the transfer ACTUALLY produced travels out with the step,
    // and the gate re-derives the area and the wedge angle from it. Those two
    // numbers then cannot agree with a lying report, because the report is no
    // longer their source: `areaAfterMM2` is dartrotate's shoelace, and the
    // gate's is the gate's own, walked over coordinates that were rotated.
    //
    // ⚠ NOT A SECOND GEOMETRY. Nothing here is computed; `contourBefore` is
    // exactly what op.suppress handed op.rotate and `contourAfter` is exactly
    // what op.rotate wrote into the plan (`pat.panels[pi].contour`). Both are
    // printed at full double precision, so what the gate reads back IS what the
    // engine held (a 6-decimal print would put the round-trip error above the
    // 1e-6 mm² epsilon rotate_check already uses, and inventing a looser epsilon
    // to cover a printing choice is exactly §3.10 / K29).
    std::vector<Vec2> contourBefore, contourAfter;
    std::size_t apexBeforeIdx = 0, apexAfterIdx = 0;
};

struct OpProgram {
    std::vector<OpStep> steps;
    std::size_t panelsBefore = 0, panelsAfter = 0;
    std::size_t stitchesBefore = 0, stitchesAfter = 0;
    std::size_t applied = 0, refused = 0;
};

// ⭐ Ask all three operators about `plan` and write back what they answer.
// MUTATES `plan` — hand it a copy. Never throws on a geometrically honest "no";
// a refusal comes back as a step with `applied = false` and a reason carrying a
// number.
OpProgram runOperatorProgram(SeamPlan& plan);

// The program as the product surface: builds the plan for `sizeLabel`, copies
// it, runs the program, and serializes both the answers (refusals included) and
// the resulting panels + seam pairs. Throws std::invalid_argument on an unknown
// size, exactly as buildSeamPlan does — never a silent default.
std::string opsJSON(const std::string& sizeLabel, double neckDropMM);

// The same program on BOTH declared surfaces — the shipped cone (where
// op.suppress and op.rotate refuse, measured) and the body-following bodice
// (where they act). The gate reads this one, because a reading that can only
// ever show refusals leaves the applied path of two operators unmeasured.
std::string opsJSONAll(const std::string& sizeLabel, double neckDropMM);

}  // namespace stitchu
