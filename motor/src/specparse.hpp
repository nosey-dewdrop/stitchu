#pragma once
// Spec-string/int -> enum parsing for every boundary (WASM bindings, tests,
// future native CLIs). One rule: an unknown value is an ERROR, never a silent
// default — the documented "never silently dropped" guarantee lives HERE, in
// code. Tables come generated from engine/vocab.json (vocab.gen.hpp); value
// order == enum declaration order, so index == enum value.
#include <stdexcept>
#include <string>

#include "measurements.hpp"
#include "vocab.gen.hpp"

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

// ---------------------------------------------------------------------------
// ⭐ THE INT-VALUED SPEC AXES, AS DATA (H2 second pass).
//
// WHY THIS TABLE EXISTS, and it is a measurement rather than a preference.
// Every axis below used to be spelled TWICE in hand-written C++: once at the
// wasm boundary, to read it off the incoming object, and once in seamplan.cpp,
// to refuse it by name. The second spelling is a FRESH REFERENCE TO A CLOSED
// ENUM, which is the one thing engine/tests/vocab_reference_check.sh forbids:
// the ratchet's direction is BREADTH -> DEPTH, the menu may shrink and may not
// grow, and it counted nine new lines the moment the refusal list was typed out
// by hand. Both readings still need the same list, so the list is written ONCE,
// here, as data, and the parser and the refusal both WALK it. Nobody types one
// of these words a second time; adding or removing one is a single-line data
// edit in one place.
//
// `slot` is a pointer-to-member, so the walk can both write the parsed value in
// and read the chosen value back out without a switch.
//
// `guard` is an INDEX INTO THIS TABLE (or -1): the entry it names must be
// non-zero for this one to be worth refusing. One axis uses it — the zone an
// engine would gather along means nothing when nothing is being gathered, and
// naming it would refuse something the shopper never asked for.
//
// ORDER IS THE WIRE ORDER, i.e. the order these were parsed in before the
// table existed, so the refusal list keeps the sequence a reader already knows.
struct SpecIntAxis {
    const char* key;
    int GarmentSpec::*slot;
    const char* const* names;
    int count;
    int guard;
};

inline constexpr SpecIntAxis kSpecIntAxes[] = {
    {"tieClosure", &GarmentSpec::tieClosure, vocab::kTieClosure, vocab::kTieClosureCount, -1},
    {"collarType", &GarmentSpec::collarType, vocab::kCollarType, vocab::kCollarTypeCount, -1},
    {"collarEdge", &GarmentSpec::collarEdge, vocab::kCollarEdge, vocab::kCollarEdgeCount, -1},
    {"gatherType", &GarmentSpec::gatherType, vocab::kGatherType, vocab::kGatherTypeCount, -1},
    {"gatherZone", &GarmentSpec::gatherZone, vocab::kGatherZone, vocab::kGatherZoneCount, 3},
    {"backOpening", &GarmentSpec::backOpening, vocab::kBackOpening, vocab::kBackOpeningCount, -1},
    {"laceUpBack", &GarmentSpec::laceUpBack, vocab::kLaceUpBack, vocab::kLaceUpBackCount, -1},
    {"wrapFront", &GarmentSpec::wrapFront, vocab::kWrapFront, vocab::kWrapFrontCount, -1},
    {"backSlit", &GarmentSpec::backSlit, vocab::kBackSlit, vocab::kBackSlitCount, -1},
    {"ruffledStraps", &GarmentSpec::ruffledStraps, vocab::kRuffledStraps, vocab::kRuffledStrapsCount, -1},
    {"peplum", &GarmentSpec::peplum, vocab::kPeplum, vocab::kPeplumCount, -1},
    {"hemFlounce", &GarmentSpec::hemFlounce, vocab::kHemFlounce, vocab::kHemFlounceCount, -1},
    {"placketStyle", &GarmentSpec::placketStyle, vocab::kPlacketStyle, vocab::kPlacketStyleCount, -1},
    {"edgeFinish", &GarmentSpec::edgeFinish, vocab::kEdgeFinish, vocab::kEdgeFinishCount, -1},
    {"pocketStyle", &GarmentSpec::pocketStyle, vocab::kPocketStyle, vocab::kPocketStyleCount, -1},
    {"cuffStyle", &GarmentSpec::cuffStyle, vocab::kCuffStyle, vocab::kCuffStyleCount, -1},
    {"hemShape", &GarmentSpec::hemShape, vocab::kHemShape, vocab::kHemShapeCount, -1},
    {"shoulderStyle", &GarmentSpec::shoulderStyle, vocab::kShoulderStyle, vocab::kShoulderStyleCount, -1},
    {"buttonRow", &GarmentSpec::buttonRow, vocab::kButtonRow, vocab::kButtonRowCount, -1},
    {"exposedZip", &GarmentSpec::exposedZip, vocab::kExposedZip, vocab::kExposedZipCount, -1},
    {"backDetail", &GarmentSpec::backDetail, vocab::kBackDetail, vocab::kBackDetailCount, -1},
    {"bardotStyle", &GarmentSpec::bardotStyle, vocab::kBardotStyle, vocab::kBardotStyleCount, -1},
    {"cupSeam", &GarmentSpec::cupSeam, vocab::kCupSeam, vocab::kCupSeamCount, -1},
    {"locketTop", &GarmentSpec::locketTop, vocab::kLocketTop, vocab::kLocketTopCount, -1},
    {"yoke", &GarmentSpec::yoke, vocab::kYoke, vocab::kYokeCount, -1},
    {"boxPleat", &GarmentSpec::boxPleat, vocab::kBoxPleat, vocab::kBoxPleatCount, -1},
};
inline constexpr int kSpecIntAxisCount =
    static_cast<int>(sizeof(kSpecIntAxes) / sizeof(kSpecIntAxes[0]));

// The BOOL axes, same law and same reason: one place, walked twice. A false is
// "not asked for", so only a true is ever read back out.
struct SpecBoolAxis {
    const char* key;
    bool GarmentSpec::*slot;
};
inline constexpr SpecBoolAxis kSpecBoolAxes[] = {
    {"ruffleHem", &GarmentSpec::ruffleHem},
    {"keyhole", &GarmentSpec::keyhole},
    {"frontPlacket", &GarmentSpec::frontPlacket},
};
inline constexpr int kSpecBoolAxisCount =
    static_cast<int>(sizeof(kSpecBoolAxes) / sizeof(kSpecBoolAxes[0]));

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
            spec.wrapFront != 0                                   ? "wrapFront" :
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
