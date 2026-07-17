#include "wearability.hpp"

#include <algorithm>
#include <cmath>
#include <optional>

#include "tie.hpp"
#include "openback.hpp"
#include "validator.hpp"

namespace stitchu {
namespace Wearability {
namespace {

bool contains(const std::string& s, const std::string& needle) {
    return s.find(needle) != std::string::npos;
}

// The front/back center piece that carries the finished neckline edge, in the
// same priority order the facing rule uses (an unsplit half is plain
// "Bodice Front" / "Top Front", a princess half is the "... Center ..." panel).
const PatternPiece* centerPiece(const DraftedPattern& draft, bool front) {
    const char* frontNames[4] = {"Bodice Center Front", "Bodice Front", "Top Center Front", "Top Front"};
    const char* backNames[4] = {"Bodice Center Back", "Bodice Back", "Top Center Back", "Top Back"};
    const char* const* wanted = front ? frontNames : backNames;
    for (int i = 0; i < 4; ++i) {
        for (const auto& p : draft.pieces)
            if (p.name == wanted[i]) return &p;
    }
    return nullptr;
}

// Length of the neck edge on a center piece: from move(centerNeck) through the
// first k commands (k=2 for the two-segment square front, else 1) — the same
// sub-path the facing invariant measures the neckline against.
std::optional<double> halfNeckLength(const PatternPiece& piece, size_t k) {
    if (piece.commands.size() < k + 1 || piece.commands[0].type != CmdType::Move) return std::nullopt;
    std::vector<PathCommand> path{piece.commands[0]};
    for (size_t i = 1; i <= k; ++i) path.push_back(piece.commands[i]);
    return pathLength(path);
}

} // namespace

double finishedNeckOpeningMM(const GarmentSpec& spec, const DraftedPattern& draft) {
    const PatternPiece* front = centerPiece(draft, true);
    const PatternPiece* back = centerPiece(draft, false);
    if (!front || !back) return -1.0;
    // Square FRONT is drawn as two segments (across + down); every other neck
    // edge (incl. every back) is a single command after the move.
    const size_t kFront = (spec.neckline == Neckline::Square) ? 2 : 1;
    const auto fHalf = halfNeckLength(*front, kFront);
    const auto bHalf = halfNeckLength(*back, 1);
    if (!fHalf || !bHalf) return -1.0;
    // Each center piece carries HALF the neck edge (CF/CB to the shoulder neck
    // point); the finished opening is the full loop = 2*(front half + back half).
    return 2.0 * (*fHalf + *bHalf);
}

bool hasDonningOpening(const GarmentSpec& spec, const DraftedPattern& draft) {
    // A dress always gets an invisible center-back zipper (garment.cpp inserts it
    // through bodice + skirt), so it never has to pass over the head.
    if (spec.garment == GarmentType::Dress) return true;
    // A halter closes at the nape — the neck loop opens there.
    if (spec.neckline == Neckline::Halter) return true;
    // A front button placket is a real front opening.
    if (spec.frontPlacket) return true;
    // A keyhole is a small opening but it releases the neck edge (the tie/button
    // at the top lets the head through a crew that would otherwise be sealed).
    if (spec.keyhole) return true;
    // A back opening (round/low-V/square/keyhole cutout) opens the back.
    if (spec.backOpening != static_cast<int>(BackOpening::None)) return true;
    // A back tie-back or back-waist closure opens/ties at the back; a front-neck
    // bow or cuff tie is decorative and does NOT let a head through.
    const auto tie = static_cast<TiePlacement>(spec.tieClosure);
    if (tie == TiePlacement::TieBack || tie == TiePlacement::BackWaist ||
        tie == TiePlacement::BackWaistBow) return true;
    // A guide step that spells out an INSERTED closure (belt-and-suspenders:
    // catches a future opening block that sets a note before an enum). Match the
    // specific "insert ... zipper" phrasing, NOT the plain word "zipper" — a top's
    // guide says "a top has no zipper, it must slip over your head", which is the
    // OPPOSITE of having one.
    for (const auto& step : draft.guideSteps) {
        if (contains(step, "Insert an invisible zipper") ||
            contains(step, "install the zipper")) return true;
    }
    return false;
}

std::vector<ValidationIssue> issues(
    const GarmentSpec& spec,
    const BodyMeasurementsSnapshot& m,
    const DraftedPattern& draft
) {
    std::vector<ValidationIssue> out;
    if (draft.pieces.empty()) return out; // the base validator already flags this

    // RULE 1 — HEAD ENTRY (collapsed-opening guard). A closed-neck garment that
    // must slip over the head (a top with no zipper, placket, tie or back opening)
    // is un-donnable if its finished neck opening has collapsed to a near-nothing
    // hole. We fire only on that degenerate case (opening below any real draft),
    // not on a "does a head fit" estimate — the finished perimeter is too noisy a
    // head oracle to threshold higher without refusing legitimate wide-shallow
    // necklines (see wearability.hpp). Dresses get a CB zipper, halters open at
    // the nape, plackets/ties/cutouts open elsewhere — hasDonningOpening() exempts
    // all of those.
    if (!hasDonningOpening(spec, draft)) {
        const double opening = finishedNeckOpeningMM(spec, draft);
        if (opening >= 0 && opening < neckOpeningDegenerateMM) {
            out.push_back({"wearability", draft.garment,
                std::string("the finished neck opening has collapsed to a hole too small to pass a "
                            "head through, and the garment has no zipper, placket, tie or back "
                            "opening — it cannot be put on. The neckline was dropped; restore it "
                            "or add a closure.")});
        }
    }

    // RULE 2 — FOLD vs OPENING. A declared front opening (button placket) must
    // NOT collapse back to a plain center-front fold with nothing to open. When
    // the placket is drawn the engine grows the front edge outward past the CF
    // (to x = -standWidth) and adds button/buttonhole + fold-line markings; if
    // frontPlacket is set but the front piece is still a plain fold at x = 0 with
    // no stand, the opening was silently dropped — exactly the outside-LLM bug
    // (drawn front-buttoned, saved as cut-on-fold, nothing opens).
    if (spec.frontPlacket) {
        const PatternPiece* front = centerPiece(draft, true);
        if (front) {
            double minX = 1e18;
            for (const auto& c : front->commands) {
                if (c.type == CmdType::Close) continue;
                minX = std::min(minX, c.to.x);
            }
            const bool grownStand = minX < -0.5;                 // edge grew past CF
            const bool hasMarks = front->markings.size() >= 4;    // fold line + facing + buttons
            const bool onFold = contains(front->cutInstruction, "on fold");
            if (!grownStand && !hasMarks && onFold) {
                out.push_back({"wearability", front->name,
                    "a front button placket was requested but the front is still cut on the fold "
                    "with no button stand or markings — the closure was dropped, so nothing opens."});
            }
        }
    }

    // RULE 3 — EDGE FINISH (sleeveless armhole). A garment drafted with no
    // sleeves leaves the armhole a raw edge; it must be finished by a binding or
    // facing, or the guide must honestly tell the sewist to bind it. The engine
    // emits a "bias binding (sleeveless)" guide step; if a sleeveless garment has
    // neither a binding/facing piece NOR that honest note, the armhole is
    // unfinished and would fray/gape.
    // A skirt has no armhole; only a bodiced garment (dress/top) can be sleeveless.
    const bool sleeveless = spec.garment != GarmentType::Skirt &&
                            spec.sleeveStyle == SleeveStyle::None &&
                            spec.neckline != Neckline::Halter;
    if (sleeveless) {
        bool finished = false;
        for (const auto& p : draft.pieces) {
            if (contains(p.name, "Bias binding") || contains(p.name, "Armhole Facing")) { finished = true; break; }
        }
        if (!finished) {
            for (const auto& step : draft.guideSteps) {
                const std::string s = step;
                if ((contains(s, "armhole") || contains(s, "armholes")) &&
                    (contains(s, "bind") || contains(s, "binding") || contains(s, "facing") ||
                     contains(s, "bias"))) { finished = true; break; }
            }
        }
        if (!finished) {
            out.push_back({"wearability", draft.garment,
                "sleeveless garment: the armhole has no binding/facing piece and no guide note "
                "telling the sewist to finish it — it would be a raw, fraying edge."});
        }
    }

    (void)m; // rule 4 (woven ease) lives in the ctest as a WARN, not a blocker.
    return out;
}

} // namespace Wearability
} // namespace stitchu
