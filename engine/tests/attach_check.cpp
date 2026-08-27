// ⭐ attach_check — op.attach's OWN gate (GECE7 / F7, K35: `op.X -> X_check`).
//
// THE F7 CARD'S WORDING IS THE SPEC: "fiyonk ekle" YENİ BİR PARÇA doğurur ve o
// parça KESİM PLANINA, ÇENTİK GRAFİĞİNE ve METRAJA girer. **Girmiyorsa
// eklenmemiştir.** So this gate refuses to look at a drawing; it looks at the
// three places a piece has to show up before a shopper can cut it.
//
//   LEG 1  OFF is OFF (RULES 4): editAttach == 0 draws the byte-identical
//          default, same piece count, same coordinates.
//   LEG 2  A REAL PIECE. Piece count +1, and the new piece carries a cut
//          instruction, a closed outline and a grainline — the three things
//          that make a shape cuttable rather than decorative.
//   LEG 3  IT ENTERS THE CUT PLAN. The new piece gets a CUTTING LINE from the
//          same pass that gives every other piece one (garment.cpp), i.e. the
//          edit ran BEFORE that pass and not after it.
//   LEG 4  THE NOTCH GRAPH. A MATCHED PAIR: the host gained notches it did not
//          have, and the component carries its own. One without the other is a
//          mark, not a match.
//   LEG 5  🚨 THE NOTCH IS MEASURED, NOT WRITTEN (F7 card · §3.10). The gate
//          re-walks the host's hem edge itself and re-derives the arc midpoint,
//          then checks the stamped notch sits there. It ALSO checks that this
//          point is NOT the bounding-box midpoint of the edge — on the drafted
//          A-line hem the two differ, so a lazy implementation that took the box
//          centre (or the curve's t=0.5) would burn here.
//   LEG 6  THE METREAGE MOVED, BY THE COMPONENT'S OWN SIZE. The added metres
//          equal the component's own measured bolt run, not a flat constant.
//   LEG 7  THE HOST OUTLINE IS UNTOUCHED. Attaching hangs a piece; it does not
//          redraw the garment.
//   LEG 8  A HOSTLESS PATTERN IS REFUSED WITH A REASON, never silently skipped.
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "garment.hpp"
#include "measurements.hpp"
#include "patternedit.hpp"
#include "sizechart.hpp"

using namespace stitchu;

namespace {

int checks = 0, failures = 0;
void ok() { ++checks; }
void fail(const std::string& why) {
    ++checks;
    ++failures;
    std::printf("  [FAIL] %s\n", why.c_str());
}

GarmentSpec baseSpec() {
    GarmentSpec s;
    s.garment = GarmentType::Dress;
    s.shaping = Shaping::Dart;
    s.waistline = Waistline::Natural;
    s.fabric = Fabric::Woven;
    s.neckline = Neckline::Crew;
    s.sleeveStyle = SleeveStyle::Straight;
    s.sleeveLength = SleeveLength::Short;
    s.skirtStyle = SkirtStyle::ALine;
    s.skirtLength = SkirtLength::Midi;
    s.topLength = TopLength::Hip;
    return s;
}

const PatternPiece* byName(const DraftedPattern& p, const std::string& n) {
    for (const auto& pc : p.pieces)
        if (pc.name == n) return &pc;
    return nullptr;
}

bool sameCmd(const PathCommand& a, const PathCommand& b) {
    return a.type == b.type && a.to.x == b.to.x && a.to.y == b.to.y &&
           a.cp1.x == b.cp1.x && a.cp1.y == b.cp1.y && a.cp2.x == b.cp2.x && a.cp2.y == b.cp2.y;
}

// The point every notch glyph is centred on: the cross tick is four commands
// (move/line horizontal, move/line vertical) around one point.
bool notchCentre(const std::vector<PathCommand>& n, size_t at, Point* out) {
    if (at + 3 >= n.size()) return false;
    out->x = n[at + 2].to.x;
    out->y = (n[at + 2].to.y + n[at + 3].to.y) / 2.0;
    return true;
}

}  // namespace

int main() {
    std::printf("attach_check: op.attach — fiyonk YENI BIR PARCA, ve o parca kesim planinda\n");
    const SizeChartEntry* eu38 = euSize("EU38");
    if (!eu38) { std::printf("  [FAIL] size chart has no EU38\n"); return 1; }
    const BodyMeasurementsSnapshot m = eu38->body;

    const DraftedPattern off = GarmentDrafter::draft(baseSpec(), m);
    GarmentSpec edited = baseSpec();
    edited.editAttach = static_cast<int>(AttachComponent::Bow);
    const DraftedPattern on = GarmentDrafter::draft(edited, m);

    // ---- LEG 1: OFF is OFF -------------------------------------------------
    {
        GarmentSpec zero = baseSpec();
        zero.editAttach = 0;
        const DraftedPattern again = GarmentDrafter::draft(zero, m);
        bool same = again.pieces.size() == off.pieces.size();
        for (size_t i = 0; same && i < off.pieces.size(); ++i) {
            same = again.pieces[i].name == off.pieces[i].name &&
                   again.pieces[i].commands.size() == off.pieces[i].commands.size();
            for (size_t k = 0; same && k < off.pieces[i].commands.size(); ++k)
                same = sameCmd(again.pieces[i].commands[k], off.pieces[i].commands[k]);
        }
        if (!same) fail("editAttach == 0 did not draw the byte-identical default (RULES 4)");
        else ok();
    }

    // ---- LEG 2: a REAL piece ----------------------------------------------
    if (on.pieces.size() != off.pieces.size() + 1)
        fail("op.attach did not add exactly ONE piece; " + std::to_string(off.pieces.size()) +
             " -> " + std::to_string(on.pieces.size()) +
             ". A bow that is drawn on the host instead of cut is not attached, it is printed");
    else ok();

    const PatternPiece* bow = byName(on, "Bow (fiyonk, op.attach)");
    if (!bow) {
        std::printf("  [FAIL] the attached piece is not in the pattern by name\n");
        std::printf("attach_check: %d checks, %d failures\n", checks + 1, failures + 1);
        return 1;
    }
    ok();

    if (bow->cutInstruction.empty())
        fail("the attached piece carries NO cut instruction — a cutter cannot cut it");
    else ok();
    if (bow->commands.size() < 4)
        fail("the attached piece has no closed outline");
    else ok();
    if (!bow->hasGrainline)
        fail("the attached piece declares no grainline — a self-fabric strip cut off grain "
             "stretches and the bow will not press flat");
    else ok();

    // ---- LEG 3: it enters the CUT PLAN ------------------------------------
    if (bow->cutLine.empty())
        fail("the attached piece has NO cutting line: the edit ran AFTER garment.cpp's cut-line "
             "pass, so the piece exists on screen and not on the cutting table");
    else ok();

    // ---- LEGS 4 + 5: the notch graph, and the anchor is MEASURED ----------
    const PatternPiece* hostOff = byName(off, "Skirt Front");
    const PatternPiece* hostOn = byName(on, "Skirt Front");
    if (!hostOff || !hostOn) fail("the host piece 'Skirt Front' is not in the draft");
    else {
        if (hostOn->notches.size() != hostOff->notches.size() + 4)
            fail("the host did not gain exactly one cross notch (4 commands); " +
                 std::to_string(hostOff->notches.size()) + " -> " +
                 std::to_string(hostOn->notches.size()));
        else ok();
        if (bow->notches.size() != 4)
            fail("the component carries " + std::to_string(bow->notches.size()) +
                 " notch commands, not the 4 of one cross tick — a notch on one side of a seam "
                 "and nothing on the other is a mark, not a match");
        else ok();

        // 🚨 THE GATE RE-DERIVES THE ANCHOR ITSELF.
        const int h = hemCommandIndex(*hostOff);
        if (h < 0) fail("the host has no hem edge to hang anything on");
        else {
            Point from = hostOff->commands[0].to;
            for (int k = h - 1; k >= 0; --k)
                if (hostOff->commands[k].type != CmdType::Close) { from = hostOff->commands[k].to; break; }
            double edgeLen = 0, at = 0;
            const Point want = edgeMidpointByArc(from, hostOff->commands[h], &edgeLen, &at);
            Point got{0, 0};
            const bool have = notchCentre(hostOn->notches, hostOff->notches.size(), &got);
            if (!have) fail("the host's new notch is not a readable cross tick");
            else if (std::hypot(got.x - want.x, got.y - want.y) > 1e-6)
                fail("the notch is NOT at the measured arc midpoint of the host's hem edge — it "
                     "sits at (" + std::to_string(got.x) + ", " + std::to_string(got.y) +
                     ") and the walk says (" + std::to_string(want.x) + ", " +
                     std::to_string(want.y) + "). A hand-written anchor is §3.10");
            else ok();

            // AND IT IS NOT THE CHEAP ANSWER. On this drafted hem the arc
            // midpoint and the bounding-box midpoint are different points; a
            // gate that could not tell them apart would pass a fake.
            const Rect box = boundingBox({PathCommand::move(from), hostOff->commands[h]});
            const Point boxMid{box.x + box.width / 2, box.y + box.height / 2};
            const double apart = std::hypot(boxMid.x - want.x, boxMid.y - want.y);
            if (!(apart > 1.0))
                fail("on this hem the arc midpoint and the box midpoint are within " +
                     std::to_string(apart) +
                     " mm of each other, so leg 5 cannot tell a measured anchor from a guessed "
                     "one — the gate says so instead of claiming a proof it does not have");
            else ok();
            std::printf("\n  CAPA OLCULDU: kenar %.4f mm, yarisi %.4f mm -> (%.4f, %.4f)\n",
                        edgeLen, at, want.x, want.y);
            std::printf("  KUTU ORTASI  : (%.4f, %.4f) — arada %.4f mm (ayni nokta DEGIL)\n",
                        boxMid.x, boxMid.y, apart);
        }

        // ---- LEG 7: the host OUTLINE is untouched -------------------------
        bool same = hostOff->commands.size() == hostOn->commands.size();
        for (size_t k = 0; same && k < hostOff->commands.size(); ++k)
            same = sameCmd(hostOff->commands[k], hostOn->commands[k]);
        if (!same)
            fail("op.attach REDREW the host outline — attaching hangs a piece, it does not "
                 "reshape the garment");
        else ok();
    }

    // ---- LEG 6: the metreage moved, by the component's own size -----------
    {
        const Rect box = boundingBox(bow->commands);
        const double expected = roundToPlaces(off.fabricMeters140 + box.height / 1000.0, 1);
        if (!(on.fabricMeters140 > off.fabricMeters140))
            fail("the metreage did not move: the shopper is told to buy the same cloth for a "
                 "garment that now has one more piece in it");
        else ok();
        if (std::fabs(on.fabricMeters140 - expected) > 1e-9)
            fail("the metreage grew by something other than the component's OWN measured bolt "
                 "run: " + std::to_string(on.fabricMeters140 - off.fabricMeters140) +
                 " m added, the piece measures " + std::to_string(box.height / 1000.0) + " m");
        else ok();
        std::printf("  METRAJ       : %.4f -> %.4f m (bilesen %.1f x %.1f mm)\n",
                    off.fabricMeters140, on.fabricMeters140, box.width, box.height);
    }

    // ---- LEG 8: a hostless pattern is REFUSED with a reason ---------------
    {
        DraftedPattern empty;
        GarmentSpec s = baseSpec();
        s.editAttach = static_cast<int>(AttachComponent::Bow);
        const EditProgram prog = runEditProgram(empty, s, m);
        bool refusedWithReason = prog.refused == 1 && prog.applied == 0;
        for (const auto& st : prog.steps)
            if (!st.applied && st.refusal.empty()) refusedWithReason = false;
        if (!refusedWithReason)
            fail("a pattern with no host piece did not produce a REFUSAL carrying a reason — a "
                 "silently empty answer is the RULES 1 failure");
        else ok();
        if (!empty.pieces.empty())
            fail("op.attach appended a piece to a pattern it had already refused");
        else ok();
    }

    std::printf("\nattach_check: %d checks, %d failures\n", checks, failures);
    return failures ? 1 : 0;
}
