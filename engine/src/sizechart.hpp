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
        // The chart carries GIRTHS and nothing else — it has never carried a
        // shape. The back's share of each girth arc comes from the graded body
        // (shaperatios.gen.hpp) and is grafted on here so there is still ONE
        // lookup for callers. Sizes with no published ratio (EU50/EU52) keep 0
        // and the surface falls back to the symmetric section, visibly.
        for (SizeChartEntry& e : c)
            for (const contract::BackArcRow& r : contract::kBackArcFraction)
                if (e.label == r.label) {
                    e.body.bustBackFrac = r.bust;
                    e.body.waistBackFrac = r.waist;
                    e.body.hipBackFrac = r.hip;
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
