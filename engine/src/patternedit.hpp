#pragma once
// ---- THE EDIT LAYER: op.extend / op.attach ON A DRAFTED PATTERN ------------
//                                              (GECE7 / F7, §4A, K35 · borç 45)
//
// WHAT THIS IS, AND WHY IT IS NOT `planops.cpp` AGAIN.
//
// `planops.cpp` runs op.split / op.suppress / op.rotate on a SeamPlan — the
// engine's internal surface object. It is a real product surface (opsJSON) but
// it is NOT the thing a shopper carries home: the DXF, the SVG and the metreage
// come out of `DraftedPattern` (garment.cpp). §3.12's sentence for this phase is
// "contract var, hat bağlanacak", and the wire that was missing is the one from
// an EDIT to the FILE ON DISK. So these two operators run on `DraftedPattern`,
// after the draft, and the file the user downloads changes because of them.
//
// ---------------------------------------------------------------------------
// op.extend — "10 cm UZAT". WHAT MOVES, AND WHAT PROVABLY DOES NOT.
//
// The extension is inserted AT THE HEM and it runs ALONG THE GRAIN, which each
// piece already declares (`PatternPiece::grainline`, vertical in the drafting
// frame). It is not run along the SIDE SEAM, and that choice is the restrictive
// one on purpose (§0B md.3): continuing the side seam would also continue the
// A-line FLARE, i.e. a request to lengthen would silently widen the sweep too.
// No publication was found fixing the position of a commercial pattern's
// lengthen/shorten line for this block — YAYIN BULUNAMADI — so the line is put
// where it changes the least: the hem itself, below every drafted landmark.
//
// The rewrite is surgical and its byte-level claim is checkable:
//
//     ... prev edge, ENDING at A ...            <- UNTOUCHED
//     + line to (A.x, A.y + mm)                 <- inserted, length EXACTLY mm
//       the hem edge, every point +mm in y      <- TRANSLATED (same arc length)
//     + line to B                               <- inserted, length EXACTLY mm
//     ... next edges, starting at B ...         <- UNTOUCHED
//
// Because the second inserted segment lands back on B, EVERY command after the
// hem is byte-identical and every named edge on the piece keeps its anchors.
// The measured consequences are therefore exact rather than approximate:
// hem arc length UNCHANGED, perimeter +2*mm, bounding-box height +mm. The gate
// re-derives all four off the drawn commands.
//
// ---------------------------------------------------------------------------
// op.attach — "FİYONK EKLE". A NEW PIECE, OR IT DID NOT HAPPEN.
//
// F7's card: the attached thing must enter the CUT PLAN, the NOTCH GRAPH and the
// METREAGE. A drawing that appears on screen and nowhere on the cutting table is
// not an attachment. So op.attach:
//   1. appends a real `PatternPiece` with its own cut instruction and grainline;
//   2. stamps a MATCHED NOTCH PAIR — one on the host, one on the component;
//   3. adds the component's OWN MEASURED bolt run to `fabricMeters140`.
//
// ⚠ THE NOTCH IS NOT WRITTEN BY HAND (F7 card · §3.10 · CLAUDE.md "patternmaking
// sayılarını tahmin etme"). The anchor is the point at HALF THE ARC LENGTH of
// the host's own hem edge, walked with the engine's own flattenCubic/pathLength
// primitives. Half is the restrictive reading of "at the centre of the edge",
// and it is a MEASUREMENT on the drawn curve, not a bounding-box midpoint and
// not a coordinate constant: on a curved hem the two differ.
//
// ⚠ THE COMPONENT'S DIMENSIONS ARE NOT INVENTED EITHER. They are read from
// `TieBlock::finishedBow()`, i.e. the figures tie.cpp already ships with its
// FORMULAS.md citation. This operator adds NO new patternmaking number.
//
// ---------------------------------------------------------------------------
// RULES 4 — OPT-IN, DEFAULT OFF. `GarmentSpec::editExtendMM == 0` and
// `editAttach == 0` mean this file does not run at all and the golden dump is
// byte-identical. That is not a promise, it is `golden_check`.
//
// UNITS mm.
#include <string>
#include <vector>

#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {

// Which component op.attach hangs on the host. APPEND-only (the wire is
// positional). 0 = None keeps the whole file switched off.
enum class AttachComponent { None, Bow };

struct EditStep {
    std::string op;        // "op.extend" | "op.shorten" | "op.sleeveExtend" | "op.neckDeepen" | "op.attach"
    std::string piece;     // the HOST piece, by name
    bool applied = false;
    bool writtenBack = false;
    std::string refusal;   // non-empty EXACTLY when applied == false
    std::string reason;    // why this edit exists, as a measured sentence

    // ---- op.extend, all re-derivable off the drawn commands ---------------
    double requestedMM = 0.0;
    int hemCmdIndex = -1;
    double hemLenBeforeMM = 0.0, hemLenAfterMM = 0.0;
    double heightBeforeMM = 0.0, heightAfterMM = 0.0;
    double perimeterBeforeMM = 0.0, perimeterAfterMM = 0.0;
    // The two segments the operator inserted, measured back off the result.
    double insertedAMM = 0.0, insertedBMM = 0.0;

    // ---- op.neckDeepen, measured off the drawn neck curve -----------------
    double neckArcBeforeMM = 0.0, neckArcAfterMM = 0.0;   // half-arc (drawn, on fold)
    double cfDepthBeforeMM = 0.0, cfDepthAfterMM = 0.0;   // CF neck point y
    double bindingDeltaMM = 0.0;                          // strip lengthened by

    // ---- op.attach --------------------------------------------------------
    std::string component;          // the name the new piece entered under
    double hostEdgeMM = 0.0;        // arc length of the edge it was hung on
    Point anchor{0, 0};             // MEASURED at half that arc length
    double anchorAtMM = 0.0;        // the arc length the walk stopped at
    double componentAreaMM2 = 0.0;  // the cut rectangle's own area
    double metersBefore = 0.0, metersAfter = 0.0;
    int hostNotchesBefore = 0, hostNotchesAfter = 0;
    int componentNotches = 0;
};

struct EditProgram {
    std::vector<EditStep> steps;
    std::size_t piecesBefore = 0, piecesAfter = 0;
    std::size_t applied = 0, refused = 0;
};

// The index of the outline command that CARRIES the piece's hem: the command
// whose endpoint sits lowest (largest y). Ties resolve to the LAST such command
// so a flat hem drawn as several segments still yields its final one. Returns
// -1 when the piece has no usable outline. Shared by both operators on purpose:
// they must be talking about the same edge of the same object.
int hemCommandIndex(const PatternPiece& piece);

// Walk `edge` (one command, starting at `from`) to half its own arc length and
// return the point there, writing the total length into `edgeLenMM` and the
// distance actually walked into `atMM`. Uses flattenCubic/pathLength — the same
// primitives every other measurement in the engine uses.
Point edgeMidpointByArc(Point from, const PathCommand& edge, double* edgeLenMM, double* atMM);

// Run the edit program `spec` declares on `pattern`. MUTATES `pattern`. Never
// throws on an honest "no": a refusal comes back as a step with applied=false
// and a reason carrying a number (RULES 1). Does nothing at all when the spec
// declares no edit.
EditProgram runEditProgram(DraftedPattern& pattern, const GarmentSpec& spec,
                           const BodyMeasurementsSnapshot& body);

// The program as a product surface, for the gates and for the download screen.
std::string editJSON(const EditProgram& prog);

}  // namespace stitchu
