#pragma once
// Spec-string/int -> enum parsing for every boundary (WASM bindings, tests,
// future native CLIs). One rule: an unknown value is an ERROR, never a silent
// default — the documented "never silently dropped" guarantee lives HERE, in
// code. Tables come generated from engine/vocab.json (vocab.gen.hpp); value
// order == enum declaration order, so index == enum value.
#include <stdexcept>
#include <string>

#include "measurements.hpp"

namespace stitchu {

[[noreturn]] inline void vocabError(const char* field, const std::string& got,
                                    const char* const* names, int count) {
    std::string msg = std::string("invalid ") + field + " '" + got + "' (valid: ";
    for (int i = 0; i < count; ++i) {
        if (i) msg += ", ";
        msg += names[i];
    }
    msg += ")";
    throw std::invalid_argument(msg);
}

// String field -> enum. values[] order == enum order, so the matched index IS
// the enum value.
template <typename E>
E parseEnum(const char* field, const std::string& s, const char* const* names, int count) {
    for (int i = 0; i < count; ++i)
        if (s == names[i]) return static_cast<E>(i);
    vocabError(field, s, names, count);
}

// Int field: value must be a real enum member (0..count-1). Returns the value
// so int-typed GarmentSpec fields can take it directly.
inline int parseEnumInt(const char* field, int v, const char* const* names, int count) {
    if (v < 0 || v >= count) vocabError(field, std::to_string(v), names, count);
    return v;
}

// Cross-field coherence. Each value may be individually valid while the
// COMBINATION asks for something the engine would silently skip (a puffed cap
// on a sleeveless bodice drew nothing and said nothing). An incoherent spec is
// an error, never a silent no-op.
inline void validateSpecCross(const GarmentSpec& spec) {
    if (spec.sleeveCap != SleeveCap::Plain && spec.sleeveStyle == SleeveStyle::None)
        throw std::invalid_argument(
            "invalid spec: sleeveCap requires a sleeve: set sleeveStyle to 'straight' or 'balloon'");
    if (spec.cuffStyle != 0 && spec.sleeveStyle == SleeveStyle::None)
        throw std::invalid_argument(
            "invalid spec: cuffStyle requires a sleeve: set sleeveStyle to 'straight' or 'balloon'");
    if (spec.ruffledStraps != 0 && spec.sleeveStyle != SleeveStyle::None)
        throw std::invalid_argument(
            "invalid spec: ruffledStraps needs bare shoulders: set sleeveStyle to 'none'");
    if (spec.garment == GarmentType::Skirt &&
        (spec.sleeveStyle != SleeveStyle::None || spec.neckline != Neckline::Crew))
        throw std::invalid_argument(
            "invalid spec: a skirt has no bodice: leave sleeveStyle 'none' and neckline 'crew'");
    // K2 composition contract (2026-07-19): these combinations used to fall
    // through the dispatcher's host gates in garment.cpp SILENTLY — the field
    // was set, nothing was drawn, nothing was said. Same doctrine as above: an
    // incoherent spec is an error, never a silent no-op. The web pickers already
    // hide/reset every one of these, so only raw API/spec callers see them.
    if (spec.garment == GarmentType::Skirt) {
        const char* bodiceField =
            spec.keyhole                                          ? "keyhole" :
            (spec.frontPlacket || spec.placketStyle != 0)         ? "placket" :
            spec.collarType != 0                                  ? "collarType" :
            spec.gatherType != 0                                  ? "gatherType" :
            spec.backOpening != 0                                 ? "backOpening" :
            spec.ruffledStraps != 0                               ? "ruffledStraps" :
            spec.peplum != 0                                      ? "peplum" :
            spec.bardotStyle != 0                                 ? "bardotStyle" :
            spec.buttonRow != 0                                   ? "buttonRow" :
            spec.backDetail != 0                                  ? "backDetail" :
            spec.shoulderStyle != 0                               ? "shoulderStyle" :
            spec.edgeFinish != 0                                  ? "edgeFinish" : nullptr;
        if (bodiceField)
            throw std::invalid_argument(
                std::string("invalid spec: a skirt has no bodice to carry ") + bodiceField +
                ": leave it at its default");
    }
    if (spec.garment == GarmentType::Top && spec.backSlit != 0)
        throw std::invalid_argument(
            "invalid spec: a top has no skirt hem: leave backSlit 'none'");
    // A hem ruffle needs a hem: a top has none UNLESS it carries a peplum, whose
    // outer edge the ruffle trims (id51/84 class — peplum + fırfır hem).
    if (spec.garment == GarmentType::Top && spec.ruffleHem &&
        spec.peplum == 0 /* PeplumStyle::None */)
        throw std::invalid_argument(
            "invalid spec: a hem ruffle attaches to a skirt or peplum hem, which a plain top does not have: leave ruffleHem off (or add a peplum)");
    if (spec.backSlit != 0 && spec.garment != GarmentType::Top &&
        spec.skirtStyle != SkirtStyle::Straight && spec.skirtStyle != SkirtStyle::ALine)
        throw std::invalid_argument(
            "invalid spec: a gathered/pleated/half-circle skirt walks freely and hosts no back slit: "
            "leave backSlit 'none' or pick a straight/A-line skirt");
    if (spec.hemShape != 0 && spec.garment != GarmentType::Top &&
        spec.skirtStyle != SkirtStyle::Straight && spec.skirtStyle != SkirtStyle::ALine)
        throw std::invalid_argument(
            "invalid spec: a gathered/pleated/half-circle skirt has no fitted side hem to reshape: "
            "leave hemShape 'straight' or pick a straight/A-line skirt");
}

} // namespace stitchu
