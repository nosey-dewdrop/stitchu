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
inline const std::vector<SizeChartEntry>& euSizeChart() {
    static const std::vector<SizeChartEntry> chart = {
        {"EU34", {80, 62, 86, 36, 39.5, 57, 34}},
        {"EU36", {84, 66, 90, 36.5, 40, 57.5, 34.5}},
        {"EU38", {88, 70, 94, 37, 40.5, 58, 35}},
        {"EU40", {92, 74, 98, 37.5, 41, 58.5, 36}},
        {"EU42", {96, 78, 102, 38, 41.5, 59, 36.5}},
        {"EU44", {100, 82, 106, 38.5, 42, 59.5, 37}},
        {"EU46", {104, 86, 110, 39, 42, 60, 38}},
        {"EU48", {110, 92, 116, 40, 42.5, 60.5, 39}},
        {"EU50", {116, 98, 122, 41, 43, 61, 40}},
        {"EU52", {122, 104, 128, 42, 43.5, 61.5, 41}},
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
