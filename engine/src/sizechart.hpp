#pragma once
// The standard EU size chart — the grade rules (how a body grows size to size).
// One source of truth for grading: the engine drafts any body, so grading a
// design = drafting it against each of these standard bodies. Values match the
// EU (German) convention used by the engine_check matrix (bust, waist, hip,
// shoulder, backLength, armLength, neck — all cm).
//
// ★★ TUR 18B — WHERE THESE 70 NUMBERS CAME FROM, AND WHICH OF THEM STILL HAVE
//    NO SOURCE. That "EU (German) convention" sentence one line above was, from
//    7 Jul 2026 to 17 Aug 2026, the ONLY provenance the chart had — and it was
//    copied here from a TEST HARNESS. Measured from git: the numbers first
//    appear in 77193d5, engine-check/main.swift, in the same array as the
//    hand-invented bodies tall/petite/pear/apple/bigNeckSmallShoulder; 1eafc16
//    lifted the ten EU rows verbatim into this file and made them the engine's
//    body, adding no citation. A guessed pattern number once cost 07-sleeve; a
//    guessed BODY number is worn by a person.
//    WHAT IS SOURCED NOW (contract/tables.json draft.euSizeChart._sources):
//      bust / waist / hip  — EXACT 10/10 against burda style's published
//        "Damen Maßtabellen", NORMALE DAMENGRÖSSEN, Körpergröße 168. So the
//        +6.0cm regime above EU46 (the 4,4,4,4,4,4,6,6,6 step pattern doubted
//        since Tur 7) is REAL AND DELIBERATE, corroborated by Aldrich's own
//        "4cm and 6cm Increments (European Sizing)" table. Not a typo.
//      shoulder / backLength / armLength / neck — NO PUBLISHED SOURCE FOUND.
//        A verified absence, recorded rather than deleted. In particular the
//        flat backLength step at EU44->EU46 (42.0, 42.0 — Tur 16 traced the
//        body SHORTENING there to exactly this cell) matches no published
//        table: every one of them grades nape-to-waist smoothly (+0.4 or +0.5),
//        and the flat runs that do exist sit at the ENDS of a series and never
//        resume. neck's .5/.5/1/.5/.5/1/1/1/1 matches nothing either, and it is
//        what drives K5's neck-girth floor (8 of 8 sizes FAIL). shoulder is
//        worse than unsourced: every drafting standard defines "shoulder" as
//        the single SEAM (11-14cm), so 36-42cm is a different QUANTITY.
//    THE CHART WAS NOT EDITED. Fixing a body measurement without a source
//    breaks a buyer's body; the four open columns are questions for Damla in
//    DAMLA-KUYRUK K10. Gate: engine/tests/sizechart_source_check.mjs (born red,
//    4 of 7 columns). Full record: knowledge/eu-beden-cizelgesi-kaynak-2026-08-17.md
#include <string>
#include <vector>

#include "measurements.hpp"
#include "shaperatios.gen.hpp"

namespace stitchu {

struct SizeChartEntry {
    std::string label;              // "EU38"
    BodyMeasurementsSnapshot body;  // the standard body for that size
};

// EU 34–52 (10 sizes). A pattern seller grades a design across these.
// Values live in contract/tables.json (draft.euSizeChart) — the K1 single
// contract; the X-macro below is generated into contract.gen.hpp. Same
// numbers, one source (backend EU_SIZES reads the same table).
inline const std::vector<SizeChartEntry>& euSizeChart() {
    static const std::vector<SizeChartEntry> chart = [] {
        std::vector<SizeChartEntry> c = {
#define X(label, bust, waist, hip, shoulder, backLen, armLen, neck) \
        {label, {bust, waist, hip, shoulder, backLen, armLen, neck}},
            STITCHU_CONTRACT_EU_SIZE_CHART(X)
#undef X
        };
        // The chart carries GIRTHS and a SHOULDER WIDTH; it has never carried a
        // shape. The back's share of each girth arc comes from the graded body
        // (shaperatios.gen.hpp) and is grafted on here so there is still ONE
        // lookup for callers. Sizes with no published ratio (EU50/EU52) keep 0
        // and the surface falls back to the symmetric section, visibly.
        //
        // ★★ TUR 16A — THE SWITCH TO THE CHART COLUMN WAS MADE, MEASURED IN FULL,
        //    AND THEN BACKED OUT. THIRTEENTH PRECEDENT. The line below still reads
        //    shaperatios' width, and everything from here down is the record of why
        //    the better shoulder is not shipped yet. Read the whole note before
        //    trying it again — it has been tried, and the number that stops it is
        //    NOT in h10.
        //
        //    THE THING THAT STOPS IT: spec_census's cross-size stitch-count
        //    constancy. With the chart column the eight specs carry 29/29/27/27/
        //    27/27/26/26 stitches instead of one constant count (panels stay 8/8),
        //    so "tarif tek tarif değil" fires and THREE SHIPPED GATES GO RED AT
        //    ONCE off that single judgment: edgemono_check, walkgate_check (green
        //    since Tur 14) and cutplan_check. Measured both ways in engine/build-16a
        //    Release: with shaperatios' width 'ctest -R' over the three reads
        //    100% tests passed, 0 tests failed out of 3; with the chart column all
        //    three fail. h10 itself does NOT get worse (44/63 either way) — the
        //    switch trades four K5-girth FAILs for three K6 and one K2 — so h10
        //    alone would call this a wash, and it is the census that refuses it.
        //
        // ★ AND THE SHOULDER IS STILL WRONG. Measured, eight sizes (15B's probe,
        //   184860c, and the table in HEDEF.md §TUR 15): shaperatios' shoulderWidthCM (the
        //   GarmentCode mean body, graded +1cm/size off an EU44 anchor) puts the
        //   shoulder tip so far in that the shoulder line runs -19.3...-10.6mm
        //   SHORT of Aldrich in ALL EIGHT sizes; the chart's own shoulderCM lands
        //   within +5.2...-2.9mm. One measurement missing in the same direction in
        //   eight sizes out of eight is a wrong measurement, not a tolerance. That
        //   verdict is UNCHANGED by the revert: what is shipped below is the worse
        //   of the two numbers, knowingly, because the better one costs three gates.
        //
        //   WHAT THE SWITCH BOUGHT, MEASURED (h10_gate_check, build-16a Release, 943f313
        //   against 94ab73d): shoulder line neck->tip 106.84 -> 125.904mm at EU38,
        //   and against Aldrich the eight-size band goes -19.3...-10.6mm (8/8 SHORT)
        //   to +5.2...-2.9mm. With the crest fold on (STITCHU_SHOULDER_SEAM=1, the
        //   y-sweep removed, i.e. the tape-comparable number) EU38 goes 91.69 ->
        //   109.01mm against Aldrich's sleeveless 112.5: 18.5% short -> 3.1% short.
        //   K5-girth closes 8/8 (4 FAIL -> 0). K2's step stops oscillating
        //   (+9.24/+4.88/+9.54 -> a flat +6.50...+6.97).
        //
        //   WHAT IT COST, AND NEITHER COST IS IN THIS NUMBER:
        //   (1) K6 fails EU42/44/46. ROOT MEASURED, and it is a SAMPLING artefact,
        //       not the shoulder: the top boundary turns over within half a
        //       millimetre of the K6 query x, and the two columns that bracket the
        //       turn are ~18mm apart in z (EU42: j=6 x=179.895 z=1354.923 on the
        //       ARMHOLE branch, j=7 x=179.449 z=1373.472 on the SHOULDER branch,
        //       query x=180.0). surfacepattern.cpp's crossing branch already knows
        //       this and keeps the HIGHER of the two by its own written rule; its
        //       "never reached: nearest column" FALLBACK does not, so when the
        //       boundary misses the query x by a tenth of a millimetre the armhole
        //       column wins on |dx| and K6 reads 18mm low. EU40 (+4.12) and EU42
        //       (-14.35) are the same geometry read on opposite sides of that
        //       corner. NOT FIXED HERE: the fallback lives in surfacepattern.cpp,
        //       which this turn does not own, and the gate is not ours to paint.
        //   (2) K2 fails EU48 (-15.823mm; the armhole SHRINKS, 347.03 -> 331.21mm).
        //       ROOT MEASURED, and it is the chart's own step regime: shoulderCM
        //       goes +0.5cm per size for seven steps and then +1.0cm at EU46->EU48,
        //       the same edge where bust goes +6.0cm (Tur 7, DAMLA-KUYRUK K10). A
        //       probe holding EU48 at a continued +0.5 (39.5cm) moves K2 EU48 from
        //       -15.823 to +11.297mm = ok, 7/7, and puts the zone census back to
        //       oyuk 14+14 / omuz 34+34. So the EU48 break is the SHOULDER column's
        //       jump, not the bust's. THE PROBE'S 39.5 IS INVENTED AND IS NOT
        //       SHIPPED; it is a diagnostic and the chart is left alone.
        //   ⚠ AND THE PROBE FOUND THE TRADE: at 39.5 EU48's K5-girth FALLS OVER
        //       (total stays 44 either way). Shipped EU48 neck girth is 390.59mm
        //       against a floor of 390.00 — a margin of 0.59mm in 390. K5-girth's
        //       8/8 close is NOT robust at EU48; one number carries both conditions
        //       and they point opposite ways.
        //
        //   NEXT TURN, IN ORDER, AND NONE OF IT IS A THRESHOLD CHANGE:
        //   (a) the stitch count must stop moving with size before this switch can
        //       ship. That is the same class of defect Tur 15 already found in the
        //       shipped motor (ftorso/btorso edge counts jumping by 2 with size);
        //       the wider shoulder does not create it, it makes it worse in a place
        //       spec_census can see. Owner: surfacepattern.cpp.
        //   (b) K6's fallback branch should keep the HIGHER bracketing column, the
        //       rule the crossing branch a few lines above it already follows.
        //       Owner: surfacepattern.cpp. This is not gate painting — the gate's
        //       threshold, question and fixture are untouched; what is wrong is
        //       which point of the boundary the engine calls the shoulder point.
        //   (c) only then is the chart column worth re-trying, and (2)'s EU48 step
        //       is a question for the CHART, i.e. for Damla, not for a probe.
        //   ⚠ THE SWITCH IS ONE TOKEN: r.shoulderWidthCM -> e.body.shoulderCM.
        for (SizeChartEntry& e : c)
            for (const contract::BackArcRow& r : contract::kBackArcFraction)
                if (e.label == r.label) {
                    e.body.bustBackFrac = r.bust;
                    e.body.waistBackFrac = r.waist;
                    e.body.hipBackFrac = r.hip;
                    e.body.shoulderWidthCM = r.shoulderWidthCM;
                    e.body.shoulderInclDeg = r.shoulderInclDeg;
                }
        return c;
    }();
    return chart;
}

// Look up one size by label (e.g. "EU42"); returns nullptr if not a known size.
inline const SizeChartEntry* euSize(const std::string& label) {
    for (const auto& e : euSizeChart())
        if (e.label == label) return &e;
    return nullptr;
}

} // namespace stitchu
