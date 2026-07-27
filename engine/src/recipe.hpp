#pragma once
// Recipe interpreter — PIPELINE Aşama 1 (CAD çekirdeği). Contract:
// docs/RECETE-SPEC.md v1. The recipe path REBUILDS PathCommands from a formula
// document (Valentina file logic) as a second, INDEPENDENT production path
// proven against the PINNED golden — never a recorder replay of the motor's
// own draw calls (that would be regen-vs-regen, DERSLER.md:12).
//
// v1 scope seal (RECETE-SPEC §4): ops move/line/curve/close, dart, marking
// move/line, grainline, piece meta; formulas + - * / unary minus parens and
// min/max/clamp/gate; `when` only on marking entries; one recipe
// (skirt.aline.dart). v1.1 (RECETE-SPEC §6, 2026-07-28): + hypot, + shoulderMM,
// + the sealed `top` kernel (square / tunic / spaghetti / dart / woven — the
// shift-dress recipe). Nothing else parses — unknown anything is Err.
#include <map>
#include <memory>
#include <string>
#include <vector>

#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {
namespace recipe {

// Honest-refusal carrier (RULES invariant 1): unknown or unsupported input is
// Err with a reason, never a silent default or coercion.
template <typename T>
struct Result {
    bool ok = false;
    T value{};
    std::string error;
    static Result Ok(T v) { Result r; r.ok = true; r.value = std::move(v); return r; }
    static Result Err(std::string msg) { Result r; r.error = std::move(msg); return r; }
};

struct RecipeDoc; // parsed + statically validated document (recipe.cpp)

struct Recipe {
    std::shared_ptr<const RecipeDoc> doc;
};

// Caller-supplied continuous inputs, e.g. {{"lengthMM", 450}}. Every declared
// param must be present and inside its declared [min, max] — out-of-range or
// missing = Err (the interpreter ENFORCES the range, RECETE-SPEC §2.2); an
// undeclared key = Err (no smuggled knobs).
using RecipeParams = std::map<std::string, double>;

// Parse + statically validate a recipe JSON document (RECETE-SPEC §2.2 schema):
// unknown key / op / function / identifier, name shadowing in one visible
// scope chain, forward reference, bad enum in the sealed kernel block, wrong
// recipeVersion/units — all Err at parse time.
Result<Recipe> parseRecipe(const std::string& jsonText);
Result<Recipe> loadRecipeFile(const std::string& path);

// The sealed `kernel` block (§2.2) is the ONLY source for the GarmentSpec and
// for every kernel-service enum argument (fabricEstimate / validator / guide /
// golden label). No magic recipeId→enum mapping exists anywhere.
GarmentSpec kernelSpec(const Recipe& recipe);
const std::string& recipeId(const Recipe& recipe);

// Declared consts, for the K0 parity latch (§2.3): recipe_check compares each
// against its motor-header counterpart so an un-pinned recipe cannot drift
// silently when skirt.hpp / constants.gen.hpp move.
const std::map<std::string, double>& recipeConsts(const Recipe& recipe);

// Declared param names in document order. Tools that bind ONE positional value
// (recipe-json-dump) resolve it against a single-param recipe through this —
// no hardcoded param-name mapping.
std::vector<std::string> recipeParamNames(const Recipe& recipe);

// Execute (RECETE-SPEC §3, fixed order): bind measurements (listed value <= 0
// = Err) + params (range-enforced), evaluate consts → global scalars → piece
// scalars → points, emit PathCommands in document order (dart expands to
// exactly three commands when its `when` holds, none otherwise), then run the
// kernel's own post services on the result: cutLine = offsetOutline, fabric
// estimate + guide via the sealed kernel enums. Deterministic: same recipe +
// snapshot + params → the same doubles (per-op evaluation, no reassociation —
// FP-contraction boundary measured in RECETE-SPEC §2.1).
Result<DraftedPattern> draftRecipe(
    const Recipe& recipe,
    const BodyMeasurementsSnapshot& m,
    const RecipeParams& params);

} // namespace recipe
} // namespace stitchu
