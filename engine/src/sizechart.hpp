#pragma once
// The standard EU size chart — the grade rules (how a body grows size to size).
// One source of truth for grading: the engine drafts any body, so grading a
// design = drafting it against each of these standard bodies. Values match the
// EU (German) convention used by the engine_check matrix (bust, waist, hip,
// shoulder, backLength, armLength, neck — all cm).
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
        // ★ TUR 16A — THE SHOULDER WIDTH IS THE CHART'S OWN COLUMN, NOT
        //   shaperatios'. Measured, eight sizes (15B's probe, 184860c, and the
        //   table in HEDEF.md §TUR 15): shaperatios' shoulderWidthCM (the
        //   GarmentCode mean body, graded +1cm/size off an EU44 anchor) puts the
        //   shoulder tip so far in that the shoulder line runs -19.3...-10.6mm
        //   SHORT of Aldrich in ALL EIGHT sizes; the chart's own shoulderCM lands
        //   within +5.2...-2.9mm. One measurement missing in the same direction in
        //   eight sizes out of eight is a wrong measurement, not a tolerance. The
        //   slope (shoulderInclDeg) still comes from shaperatios — it is the only
        //   published source for it — so the ratio row still gates whether this
        //   body gets shoulders at all.
        //
        //   WHAT IT BOUGHT, MEASURED (h10_gate_check, build-16a Release, 943f313
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
        for (SizeChartEntry& e : c)
            for (const contract::BackArcRow& r : contract::kBackArcFraction)
                if (e.label == r.label) {
                    e.body.bustBackFrac = r.bust;
                    e.body.waistBackFrac = r.waist;
                    e.body.hipBackFrac = r.hip;
                    e.body.shoulderWidthCM = e.body.shoulderCM;
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
