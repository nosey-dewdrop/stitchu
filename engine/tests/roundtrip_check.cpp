// Round-trip check: every vocabulary value must survive string -> enum -> raw()
// -> string unchanged, every unknown value must THROW (never fall to a silent
// default — 'puff' once drafted a sleeveless dress this way), and a spec that
// asks for a sleeve treatment must actually produce a Sleeve piece.
#include <cstdio>
#include <stdexcept>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/measurements.hpp"
#include "../src/specparse.hpp"
#include "../src/vocab.gen.hpp"

using namespace stitchu;
using namespace stitchu::vocab;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

template <typename E>
static void stringField(const char* field, const char* const* names, int count,
                        const char* (*rawFn)(E)) {
    for (int i = 0; i < count; ++i) {
        E e{};
        bool threw = false;
        try { e = parseEnum<E>(field, names[i], names, count); } catch (...) { threw = true; }
        check(!threw && static_cast<int>(e) == i,
              std::string(field) + " '" + names[i] + "' parses to enum " + std::to_string(i));
        check(!threw && std::string(rawFn(e)) == names[i],
              std::string(field) + " enum " + std::to_string(i) + " raw()s back to '" + names[i] + "'");
    }
}

template <typename E>
static bool throwsOn(const char* field, const std::string& s, const char* const* names, int count) {
    try { (void)parseEnum<E>(field, s, names, count); } catch (const std::invalid_argument&) { return true; }
    return false;
}

static void intField(const char* field, const char* const* names, int count) {
    for (int i = 0; i < count; ++i)
        check(parseEnumInt(field, i, names, count) == i,
              std::string(field) + " " + std::to_string(i) + " ('" + names[i] + "') accepted as itself");
    bool over = false, neg = false;
    try { (void)parseEnumInt(field, count, names, count); } catch (const std::invalid_argument&) { over = true; }
    try { (void)parseEnumInt(field, -1, names, count); } catch (const std::invalid_argument&) { neg = true; }
    check(over, std::string(field) + " " + std::to_string(count) + " (out of range) throws");
    check(neg, std::string(field) + " -1 throws");
}

int main() {
    std::printf("roundtrip_check: vocabulary round-trip + unknown-value rejection\n");

    // ---- positive: every value of every string field round-trips ------------
    std::printf(" string fields (value -> enum -> raw -> value)\n");
    stringField<GarmentType>("garment", kGarment, kGarmentCount, raw);
    stringField<Shaping>("shaping", kShaping, kShapingCount, raw);
    stringField<Waistline>("waistline", kWaistline, kWaistlineCount, raw);
    stringField<Fabric>("fabric", kFabric, kFabricCount, raw);
    stringField<Neckline>("neckline", kNeckline, kNecklineCount, raw);
    stringField<SleeveStyle>("sleeveStyle", kSleeveStyle, kSleeveStyleCount, raw);
    stringField<SleeveLength>("sleeveLength", kSleeveLength, kSleeveLengthCount, raw);
    stringField<SkirtStyle>("skirtStyle", kSkirtStyle, kSkirtStyleCount, raw);
    stringField<SkirtLength>("skirtLength", kSkirtLength, kSkirtLengthCount, raw);
    stringField<TopLength>("topLength", kTopLength, kTopLengthCount, raw);

    // ---- positive: every int field accepts exactly 0..count-1 ---------------
    std::printf(" int fields (0..count-1 accepted, count and -1 rejected)\n");
    intField("tieClosure", kTieClosure, kTieClosureCount);
    intField("sleeveCap", kSleeveCap, kSleeveCapCount);
    intField("collarType", kCollarType, kCollarTypeCount);
    intField("collarEdge", kCollarEdge, kCollarEdgeCount);
    intField("gatherType", kGatherType, kGatherTypeCount);
    intField("gatherZone", kGatherZone, kGatherZoneCount);
    intField("backOpening", kBackOpening, kBackOpeningCount);
    intField("backSlit", kBackSlit, kBackSlitCount);
    intField("ruffledStraps", kRuffledStraps, kRuffledStrapsCount);
    intField("peplum", kPeplum, kPeplumCount);
    intField("placketStyle", kPlacketStyle, kPlacketStyleCount);
    intField("edgeFinish", kEdgeFinish, kEdgeFinishCount);
    intField("pocketStyle", kPocketStyle, kPocketStyleCount);
    intField("cuffStyle", kCuffStyle, kCuffStyleCount);
    intField("hemShape", kHemShape, kHemShapeCount);
    intField("shoulderStyle", kShoulderStyle, kShoulderStyleCount);
    intField("buttonRow", kButtonRow, kButtonRowCount);
    intField("exposedZip", kExposedZip, kExposedZipCount);
    intField("backDetail", kBackDetail, kBackDetailCount);
    intField("bardotStyle", kBardotStyle, kBardotStyleCount);

    // ---- negative: known-bad strings must throw on EVERY string field -------
    std::printf(" unknown values throw (no silent default)\n");
    const std::vector<std::string> bad = {"puff", "puffed", "vneck", "blouse", ""};
    for (const auto& s : bad) {
        const std::string label = "'" + s + "' throws on ";
        check(throwsOn<GarmentType>("garment", s, kGarment, kGarmentCount), label + "garment");
        check(throwsOn<Shaping>("shaping", s, kShaping, kShapingCount), label + "shaping");
        check(throwsOn<Waistline>("waistline", s, kWaistline, kWaistlineCount), label + "waistline");
        check(throwsOn<Fabric>("fabric", s, kFabric, kFabricCount), label + "fabric");
        check(throwsOn<Neckline>("neckline", s, kNeckline, kNecklineCount), label + "neckline");
        check(throwsOn<SleeveStyle>("sleeveStyle", s, kSleeveStyle, kSleeveStyleCount), label + "sleeveStyle");
        check(throwsOn<SleeveLength>("sleeveLength", s, kSleeveLength, kSleeveLengthCount), label + "sleeveLength");
        check(throwsOn<SkirtStyle>("skirtStyle", s, kSkirtStyle, kSkirtStyleCount), label + "skirtStyle");
        check(throwsOn<SkirtLength>("skirtLength", s, kSkirtLength, kSkirtLengthCount), label + "skirtLength");
        check(throwsOn<TopLength>("topLength", s, kTopLength, kTopLengthCount), label + "topLength");
    }

    // ---- spec -> pieces: a requested sleeve treatment must be DRAWN ---------
    std::printf(" spec -> pieces (sleeveCap != Plain must yield a Sleeve piece)\n");
    const BodyMeasurementsSnapshot m{88, 70, 94, 37, 40.5, 58, 35};
    for (int cap = 1; cap < kSleeveCapCount; ++cap) {
        GarmentSpec spec;
        spec.garment = GarmentType::Dress;
        spec.sleeveStyle = SleeveStyle::Straight;
        spec.sleeveCap = static_cast<SleeveCap>(cap);
        const DraftedPattern draft = GarmentDrafter::draft(spec, m);
        bool hasSleeve = false;
        for (const auto& piece : draft.pieces)
            if (piece.name.find("Sleeve") != std::string::npos) hasSleeve = true;
        check(hasSleeve, std::string("sleeveCap '") + kSleeveCap[cap] + "' draft contains a Sleeve piece");
    }

    std::printf("roundtrip_check: %s (%d failures)\n", failures ? "FAIL" : "ALL PASS", failures);
    return failures ? 1 : 0;
}
