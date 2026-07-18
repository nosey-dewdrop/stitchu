#pragma once
// Spec-string/int -> enum parsing for every boundary (WASM bindings, tests,
// future native CLIs). One rule: an unknown value is an ERROR, never a silent
// default — the documented "never silently dropped" guarantee lives HERE, in
// code. Tables come generated from engine/vocab.json (vocab.gen.hpp); value
// order == enum declaration order, so index == enum value.
#include <stdexcept>
#include <string>

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

} // namespace stitchu
