#pragma once
// ---- op.split — PANEL DIVISION (GECE7 / F5-C, contract/primitives-v1.json) ----
//
// WHAT THIS IS. §4A's queue named `op.split` as the operator blocking the most
// real garments (4 of the 5 in the H8-ifade denominator, measured by
// expressability_check), and the primitives contract states what it does in one
// line: divide one panel along a line into two panels and leave a seam between
// them. Yoke, cup seam, princess, raglan are all this.
//
// ⭐ THE DIVISION LINE FALLS OUT OF A NUMBER. IT IS NOT WRITTEN.
//
// This is the whole difference between an operator and a preset, and it is the
// same rule `op.suppress` obeys: suppressPanel() has no angle argument because
// the angle is the panel's own develop-deficit. splitPanel() has no fraction
// argument because the place is read off the panel's own measured PER-COLUMN
// develop-deficit (SurfacePanel::deficitColumnDeg). The contract's draft
// carried an `atFraction` parameter; a fraction is a DIAL, it turns a division
// back into a preset, and it has been removed rather than defaulted.
//
// The rule, stated so it can be re-run by anyone holding the printed profile:
//
//     C(c) = sum of deficitColumnDeg[0..c]        (running load, signed)
//     T    = C(colsN) = the panel's whole deficit
//     cut  = the interior column c that MINIMISES max(|C(c)|, |T - C(c)|)
//
// i.e. the cut that leaves the two pieces carrying the most equal suppression
// load. It is an argmin over measured numbers: no threshold, no fraction, no
// tolerance. split_check recomputes it from the profile the tool prints and
// compares, so a constant put in its place burns red.
//
// ⚠ WHAT THIS RULE DOES NOT CLAIM (§3.10). It does NOT claim a drafter's
// princess seam lands here. A princess seam is usually placed THROUGH the bust
// point, i.e. at the column of maximum curvature, and no publication was found
// on this machine binding a panel seam to a balanced-load column. So the
// balanced cut is used because it is what DIVIDING means and because it is the
// thing borç 44 asks to be answered with a number, and the whole per-column
// profile is printed next to it so the alternative can be read off the same
// output. "YAYIN BULUNAMADI" for the drafting rule; the arithmetic is ours.
//
// ---------------------------------------------------------------------------
// ⭐ THE THING NO GATE IN THIS REPO WAS MEASURING (F5-B referee, DOĞRULANMADI).
//
// `SurfacePanel::developDeficitDeg` is a SIGNED sum. A panel that wants +30 deg
// out at one place and -30 at another prints 0, and every consumer — including
// op.suppress, whose refusal threshold reads exactly this number — treats it as
// "nothing to take out". MEASURED, EU38 left_ftorso, skimBodice off:
//
//     signed total          +55.1735 deg
//     sum of |bands|         78.83   deg
//     cancelled inside       23.66   deg   <- invisible to every gate before F5-C
//
// (bands ... +8.881, -11.654, +5.646 ...; the -11.654 is a real saddle band.)
// Division is exactly the operation that exposes this, so SplitReport carries
// it on BOTH axes and split_check prints it whether or not anybody asked.
//
// UNITS mm; angles in degrees.
#include <cstddef>
#include <string>
#include <vector>

#include "surfacepattern.hpp"  // SurfacePanel, Vec2

namespace stitchu {

// The engine's own "there is no measurable place to cut" floor, in degrees of
// TOTAL ABSOLUTE column deficit. NOT a new number: it is the same
// kNothingToAbsorbDeg (0.5) dartsuppress.hpp already declares, and that one is
// itself surfacepattern.cpp's own dart floor. One threshold, one authority. A
// panel whose entire column profile sums (in absolute value) below it has a
// FLAT profile, every column is as good as every other, and an argmin over
// noise is a coin toss dressed as a measurement — so splitPanel REFUSES.
double splitFloorDeg();

// What a division has to answer for. Every number is measured off the panel or
// off the two contours that came out; none is passed in.
struct SplitReport {
    bool split = false;
    // Non-empty EXACTLY when split == false (RULES invariant 1).
    std::string refusal;

    std::string panel;
    // The only axis today. A split along the ring columns leaves a seam that
    // runs waist-to-far, which is what a princess / cup / panel seam is. A
    // horizontal (row) split is the yoke case and needs the ROW profile plus a
    // second correspondence between the two side seams; it is NOT implemented
    // and is not claimed to be — it stays in the queue with its own name.
    std::string axis = "vertical";

    // ---- where the cut came from -------------------------------------------
    std::vector<double> columnDeficitDeg;  // the panel's own profile, printed whole
    std::size_t colsN = 0;
    std::size_t atColumn = 0;              // the argmin above
    double atFractionMeasured = 0.0;       // atColumn / colsN — REPORTED so a
                                           // reader can see it is not 0.5, never
                                           // used as an input

    // ---- the deficit, and what the cut does to it --------------------------
    double deficitWholeDeg = 0.0;   // panel.developDeficitDeg, as the engine reads it
    double columnSumDeg = 0.0;      // sum of the column profile; MUST equal the above
    double deficitADeg = 0.0;       // columns [0, atColumn]
    double deficitBDeg = 0.0;       // columns (atColumn, colsN]
    double deficitSumDeg = 0.0;     // A + B; conservation, measured not asserted

    // ⭐ SIGN CANCELLATION, the quantity nothing was measuring.
    double absColumnSumDeg = 0.0;     // sum of |column|
    double cancelledWholeDeg = 0.0;   // absColumnSum - |signed total|
    double absSumADeg = 0.0, absSumBDeg = 0.0;
    double cancelledADeg = 0.0, cancelledBDeg = 0.0;

    // ---- borç 44 / K38: is the suppression load actually DIVIDED? ----------
    // What op.suppress opens is the deficit itself (it has no angle argument),
    // so these ARE the wedges, read through the same floor dartsuppress uses.
    // Zero means that piece refuses, which is an answer, not a gap.
    double wedgeWholeDeg = 0.0, wedgeADeg = 0.0, wedgeBDeg = 0.0;
    double wedgeMaxAfterDeg = 0.0;   // max(|A|,|B|) — the number borç 44 wants
    double engineMaxDartDeg = 0.0;   // SheathOptions::maxDartDeg, printed BESIDE,
                                     // never tuned towards (K38, §3.10)

    // ---- the two pieces ----------------------------------------------------
    std::vector<Vec2> pieceA, pieceB;
    std::size_t cutIdxWaist = 0, cutIdxFar = 0;  // contour indices the cut joins
    double areaWholeMM2 = 0.0, areaAMM2 = 0.0, areaBMM2 = 0.0, areaSumMM2 = 0.0;
    double perimWholeMM = 0.0, perimAMM = 0.0, perimBMM = 0.0;
    // THE CUT EDGE, MEASURED ON EACH PIECE SEPARATELY rather than once and
    // copied. The two pieces are sewn back to each other along it, so this is
    // the walk's own question and it is asked of the two contours that came
    // out, not of the chord that went in.
    double cutLenAMM = 0.0, cutLenBMM = 0.0;
    bool aSelfIntersects = false, bSelfIntersects = false;
};

// ⭐ op.split. Divide the panel into two along the ring column its own measured
// per-column develop-deficit picks out.
//
// There is no fraction argument and there will not be one. Returns a report
// whose `split` is false, with a reason, when the panel has fewer than four
// columns or when its whole absolute column profile falls below splitFloorDeg()
// — a flat profile names no column, and that is a refusal, not a failure.
// Throws std::invalid_argument only on a malformed panel (empty contour, a
// waist/far run whose lengths disagree, boundary runs that do not close).
SplitReport splitPanel(const SurfacePanel& panel);

}  // namespace stitchu
