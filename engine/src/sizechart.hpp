#pragma once
// The standard EU size chart — the grade rules (how a body grows size to size).
// One source of truth for grading: the engine drafts any body, so grading a
// design = drafting it against each of these standard bodies. Values match the
// EU (German) convention used by the engine_check matrix (bust, waist, hip,
// shoulder, backLength, armLength, neck — all cm).
#include <string>
#include <vector>

#include "measurements.hpp"

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
    static const std::vector<SizeChartEntry> chart = {
#define X(label, bust, waist, hip, shoulder, backLen, armLen, neck) \
        {label, {bust, waist, hip, shoulder, backLen, armLen, neck}},
        STITCHU_CONTRACT_EU_SIZE_CHART(X)
#undef X
    };
    return chart;
}

// Look up one size by label (e.g. "EU42"); returns nullptr if not a known size.
inline const SizeChartEntry* euSize(const std::string& label) {
    for (const auto& e : euSizeChart())
        if (e.label == label) return &e;
    return nullptr;
}

} // namespace stitchu
