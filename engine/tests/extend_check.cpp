// ⭐ extend_check — op.extend's OWN gate (GECE7 / F7, K35: `op.X -> X_check`).
//
// WHAT IT JUDGES, AND WHY EACH LEG CAN GO RED.
//
// op.extend claims one thing: "10 cm uzat" inserts EXACTLY that much cloth at
// the hem, along the grain, and NOTHING ELSE MOVES. A gate that read the
// operator's own report back would be checking an identity, not a correctness
// (the K30/K49 lesson). So every number here is re-derived from the DRAWN
// commands of the drafted pieces, twice: once with the edit off, once with it
// on, and the two are compared.
//
//   LEG 1  OFF is OFF. editExtendMM == 0 draws the piece byte-identically —
//          same command count, same coordinates. If this leg cannot go red,
//          RULES 4 is a sentence rather than a property.
//   LEG 2  The requested mm ARRIVES. Bounding-box height +mm exactly, on the
//          front AND the back hem piece, and by the SAME amount (unequal front
//          and back would leave the side seams unsewable).
//   LEG 3  THE HEM IS TRANSLATED, NOT RESHAPED. The hem edge's own arc length
//          is unchanged to 1e-9 mm, and its every point moved by exactly +mm
//          in y and 0 in x.
//   LEG 4  EVERYTHING ELSE IS BYTE-IDENTICAL. Every command after the hem is
//          the same command it was, coordinate for coordinate — this is the
//          F7 card's "bölge dışındaki panellerin çıktısı bayt-aynı" and it is
//          checked at the command level, not by eye.
//   LEG 5  THE PERIMETER IDENTITY. perimeter_after == perimeter_before + 2*mm,
//          because exactly two segments of length mm were inserted. An
//          approximate widening would break this and a translation cannot.
//   LEG 6  A PIECE THAT IS NOT A HEM HOST DOES NOT MOVE. The sleeve is drafted
//          in the same run and must come out identical.
//   LEG 7  THE REFUSAL IS AN ANSWER. A negative request is refused with a
//          number rather than silently shortening the garment (RULES 1).
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

}  // namespace

int main() {
    std::printf("extend_check: op.extend — 10 cm uzat, ve SADECE o mm oynadi\n");
    const SizeChartEntry* eu38 = euSize("EU38");
    if (!eu38) { std::printf("  [FAIL] size chart has no EU38\n"); return 1; }
    const BodyMeasurementsSnapshot m = eu38->body;

    const double MM = 100.0;  // "10 cm uzat"

    const DraftedPattern off = GarmentDrafter::draft(baseSpec(), m);
    GarmentSpec edited = baseSpec();
    edited.editExtendMM = MM;
    const DraftedPattern on = GarmentDrafter::draft(edited, m);

    // ---- LEG 1: OFF is OFF ------------------------------------------------
    {
        GarmentSpec zero = baseSpec();
        zero.editExtendMM = 0.0;
        const DraftedPattern again = GarmentDrafter::draft(zero, m);
        bool same = again.pieces.size() == off.pieces.size();
        for (size_t i = 0; same && i < off.pieces.size(); ++i) {
            same = again.pieces[i].name == off.pieces[i].name &&
                   again.pieces[i].commands.size() == off.pieces[i].commands.size();
            for (size_t k = 0; same && k < off.pieces[i].commands.size(); ++k)
                same = sameCmd(again.pieces[i].commands[k], off.pieces[i].commands[k]);
        }
        if (!same) fail("editExtendMM == 0 did not draw the byte-identical default (RULES 4)");
        else ok();
    }

    if (on.pieces.size() != off.pieces.size())
        fail("op.extend changed the PIECE COUNT — it lengthens, it does not add pieces");
    else ok();

    // ---- LEGS 2-5, on both hem hosts --------------------------------------
    const char* hosts[] = {"Skirt Front", "Skirt Back"};
    double heights[2] = {0, 0};
    for (int hi = 0; hi < 2; ++hi) {
        const PatternPiece* a = byName(off, hosts[hi]);
        const PatternPiece* b = byName(on, hosts[hi]);
        if (!a || !b) { fail(std::string(hosts[hi]) + ": drafted in neither reading"); continue; }

        const Rect ba = boundingBox(a->commands), bb = boundingBox(b->commands);
        heights[hi] = bb.height - ba.height;
        if (std::fabs((bb.height - ba.height) - MM) > 1e-9)
            fail(std::string(hosts[hi]) + ": asked for " + std::to_string(MM) +
                 " mm, the drawn piece grew " + std::to_string(bb.height - ba.height) + " mm");
        else ok();

        // The hem edge, before and after. hemCommandIndex is the operator's own
        // finder; the gate uses it so both are talking about the same edge, and
        // then measures the RESULT itself.
        const int ha = hemCommandIndex(*a);
        if (ha < 0) { fail(std::string(hosts[hi]) + ": no hem edge found"); continue; }
        if (b->commands.size() != a->commands.size() + 2)
            fail(std::string(hosts[hi]) + ": op.extend must insert exactly TWO segments; it "
                 "changed the command count by " +
                 std::to_string(static_cast<long>(b->commands.size()) -
                                static_cast<long>(a->commands.size())));
        else ok();

        if (b->commands.size() == a->commands.size() + 2) {
            // LEG 3 — the hem edge is the SAME command, translated by +mm in y.
            const PathCommand& hOld = a->commands[ha];
            const PathCommand& hNew = b->commands[ha + 1];
            bool translated = hOld.type == hNew.type &&
                              std::fabs(hNew.to.x - hOld.to.x) < 1e-12 &&
                              std::fabs((hNew.to.y - hOld.to.y) - MM) < 1e-9;
            if (hOld.type == CmdType::Curve)
                translated = translated &&
                             std::fabs(hNew.cp1.x - hOld.cp1.x) < 1e-12 &&
                             std::fabs((hNew.cp1.y - hOld.cp1.y) - MM) < 1e-9 &&
                             std::fabs(hNew.cp2.x - hOld.cp2.x) < 1e-12 &&
                             std::fabs((hNew.cp2.y - hOld.cp2.y) - MM) < 1e-9;
            if (!translated)
                fail(std::string(hosts[hi]) + ": the hem edge was RESHAPED, not translated — a "
                     "lengthening must not change the sweep of the hem");
            else ok();

            // LEG 4 — every command AFTER the hem is byte-identical, and every
            // command BEFORE it too. Only the two inserted ones are new.
            bool untouched = true;
            for (int k = 0; k < ha; ++k)
                if (!sameCmd(a->commands[k], b->commands[k])) untouched = false;
            for (size_t k = static_cast<size_t>(ha) + 1; k < a->commands.size(); ++k)
                if (!sameCmd(a->commands[k], b->commands[k + 2])) untouched = false;
            if (!untouched)
                fail(std::string(hosts[hi]) + ": a command OUTSIDE the hem moved — the F7 card's "
                     "'bölge dışındaki çıktı bayt-aynı' is broken");
            else ok();

            // LEG 5 — the perimeter identity: +2*mm, no more, no less.
            const double pa = pathLength(a->commands), pb = pathLength(b->commands);
            if (std::fabs((pb - pa) - 2 * MM) > 1e-6)
                fail(std::string(hosts[hi]) + ": perimeter grew " + std::to_string(pb - pa) +
                     " mm, but two inserted segments of " + std::to_string(MM) +
                     " mm can only grow it by " + std::to_string(2 * MM));
            else ok();
        }
    }

    // Front and back must grow by the SAME amount or the side seams stop matching.
    if (std::fabs(heights[0] - heights[1]) > 1e-9)
        fail("front and back hem pieces grew by different amounts (" +
             std::to_string(heights[0]) + " vs " + std::to_string(heights[1]) +
             " mm) — the side seams would no longer meet");
    else ok();

    // ---- LEG 6: a NON-host piece is untouched ------------------------------
    {
        const PatternPiece* sa = byName(off, "Sleeve");
        const PatternPiece* sb = byName(on, "Sleeve");
        if (!sa || !sb) fail("the sleeve was not drafted in both readings");
        else {
            bool same = sa->commands.size() == sb->commands.size();
            for (size_t k = 0; same && k < sa->commands.size(); ++k)
                same = sameCmd(sa->commands[k], sb->commands[k]);
            if (!same) fail("op.extend moved the SLEEVE — it targets the hem hosts only");
            else ok();
        }
    }

    // ---- LEG 7: the refusal is an answer -----------------------------------
    {
        DraftedPattern p = GarmentDrafter::draft(baseSpec(), m);
        GarmentSpec neg = baseSpec();
        neg.editExtendMM = -50.0;
        const EditProgram prog = runEditProgram(p, neg, m);
        bool refusedWithReason = prog.refused > 0 && prog.applied == 0;
        for (const auto& s : prog.steps)
            if (!s.applied && s.refusal.empty()) refusedWithReason = false;
        if (!refusedWithReason)
            fail("a NEGATIVE extend was not refused with a stated reason — an operator that "
                 "silently shortens a garment is the RULES 1 failure");
        else ok();
    }

    // ---- what the phase card asks to be PRINTED, hangi mm --------------------
    {
        DraftedPattern p = GarmentDrafter::draft(baseSpec(), m);
        GarmentSpec s = baseSpec();
        s.editExtendMM = MM;
        const EditProgram prog = runEditProgram(p, s, m);
        std::printf("\n  HANGI MM OYNADI (op.extend, %.1f mm istendi)\n", MM);
        std::printf("  %-14s %12s %12s %12s %12s %10s\n", "parca", "boy_once", "boy_sonra",
                    "etek_once", "etek_sonra", "cevre_farki");
        for (const auto& st : prog.steps) {
            if (st.op != "op.extend") continue;
            std::printf("  %-14s %12.4f %12.4f %12.4f %12.4f %+10.4f\n", st.piece.c_str(),
                        st.heightBeforeMM, st.heightAfterMM, st.hemLenBeforeMM, st.hemLenAfterMM,
                        st.perimeterAfterMM - st.perimeterBeforeMM);
        }
        std::printf("\n");
    }

    std::printf("extend_check: %d checks, %d failures\n", checks, failures);
    return failures ? 1 : 0;
}
