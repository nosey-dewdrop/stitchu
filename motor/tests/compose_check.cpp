// compose_check — the K2 composition contract's regression guard (2026-07-19).
//
// contract/composition.json DECLARES, for every drawable component, its
// attachment point, z-order (dispatcher post-pass order) and conflict class,
// plus the full component x host and component x component conflict matrix:
//   allowed   draws, PatternValidator-clean
//   excluded  refused at the spec boundary (validateSpecCross) with a named error
//   validator drafts but PatternValidator blocks it with a named issue
//             (the PDF is withheld; an honest, visible refusal channel)
//   honest    the block skips itself and says so in the guide ("skipped —")
//   ignored   the field is not applicable on this host and the engine ignores
//             it silently BY DOCUMENTED DESIGN (halter shoulder/edge-finish
//             family only). Any OTHER silent no-op fails this test.
//
// The test derives the observed class for every host x feature single and
// every feature x feature pair by actually drafting, then compares against the
// declared matrix (generated into composition.gen.hpp by gen-contract.mjs).
// The matrix declares behavior; it never changes it. A drift in either
// direction — code stops refusing what the matrix declares excluded, or a new
// silent no-op appears — fails loudly.
//
// Pass --dump to print the observed non-allowed combos (matrix authoring aid).
#include <cstdio>
#include <cstring>
#include <functional>
#include <map>
#include <string>
#include <vector>

#include "../src/composition.gen.hpp"
#include "../src/garment.hpp"
#include "../src/specparse.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

namespace {

BodyMeasurementsSnapshot body() {
    return BodyMeasurementsSnapshot{88, 70, 94, 37, 40.5, 58, 35};
}

GarmentSpec dressBase(bool sleeved) {
    GarmentSpec s;
    s.garment = GarmentType::Dress;
    s.neckline = Neckline::Crew;
    s.sleeveStyle = sleeved ? SleeveStyle::Straight : SleeveStyle::None;
    s.sleeveLength = SleeveLength::Long;
    s.skirtStyle = SkirtStyle::ALine;
    s.skirtLength = SkirtLength::Midi;
    s.topLength = TopLength::Hip;
    s.shaping = Shaping::Dart;
    s.waistline = Waistline::Natural;
    s.fabric = Fabric::Woven;
    return s;
}

struct Host {
    const char* id;
    std::function<GarmentSpec()> make;
};

struct Feature {
    const char* id;
    bool needsSleeve;      // only meaningful on a sleeved host
    bool needsSleeveless;  // only meaningful on a sleeveless host
    std::function<void(GarmentSpec&)> set;
};

// Fingerprint of everything a draft says/draws, for silent-no-op detection.
std::string fingerprint(const DraftedPattern& d) {
    std::string f = d.garment + "|";
    for (const auto& p : d.pieces) {
        f += p.name + ";" + p.cutInstruction + ";";
        char buf[64];
        for (const auto& c : p.commands) {
            std::snprintf(buf, sizeof buf, "%.3f,%.3f;", c.to.x, c.to.y);
            f += buf;
        }
        std::snprintf(buf, sizeof buf, "m%zu n%zu|", p.markings.size(), p.notches.size());
        f += buf;
    }
    for (const auto& g : d.guideSteps) f += g + "|";
    return f;
}

// Observed class for one spec against its host base draft.
std::string classify(const GarmentSpec& s, const std::string& baseFp, std::string* detail) {
    try {
        validateSpecCross(s);
        const DraftedPattern d = GarmentDrafter::draft(s, body());
        const auto issues = PatternValidator::issues(s, body(), d);
        if (!issues.empty()) {
            if (detail) *detail = "[" + issues[0].rule + "] " + issues[0].detail.substr(0, 70);
            return "validator";
        }
        for (const auto& g : d.guideSteps) {
            if (g.find("skipped") != std::string::npos) {
                if (detail) *detail = g.substr(0, 70);
                return "honest";
            }
        }
        if (fingerprint(d) == baseFp) return "ignored";  // silent no-op
        return "allowed";
    } catch (const std::exception& e) {
        if (detail) *detail = e.what();
        return "excluded";
    }
}

} // namespace

int main(int argc, char** argv) {
    const bool dump = argc > 1 && std::strcmp(argv[1], "--dump") == 0;

    std::vector<Host> hosts = {
        {"dress", [] { return dressBase(false); }},
        {"dress.sleeved", [] { return dressBase(true); }},
        {"dress.halter", [] { GarmentSpec s = dressBase(false); s.neckline = Neckline::Halter; return s; }},
        {"dress.gathered", [] { GarmentSpec s = dressBase(false); s.skirtStyle = SkirtStyle::Gathered; return s; }},
        {"dress.princess", [] { GarmentSpec s = dressBase(false); s.shaping = Shaping::Princess; return s; }},
        {"top", [] { GarmentSpec s = dressBase(false); s.garment = GarmentType::Top; return s; }},
        {"top.cropped", [] { GarmentSpec s = dressBase(false); s.garment = GarmentType::Top; s.topLength = TopLength::Cropped; return s; }},
        {"skirt", [] { GarmentSpec s = dressBase(false); s.garment = GarmentType::Skirt; return s; }},
    };

    std::vector<Feature> feats = {
        {"keyhole", false, false, [](GarmentSpec& s) { s.keyhole = true; }},
        {"neckline.cowl", false, false, [](GarmentSpec& s) { s.neckline = Neckline::Cowl; }},
        {"neckline.pussyBow", false, false, [](GarmentSpec& s) { s.neckline = Neckline::PussyBow; }},
        {"neckline.halter", false, true, [](GarmentSpec& s) { s.neckline = Neckline::Halter; }},
        {"placket.standard", false, false, [](GarmentSpec& s) { s.placketStyle = 1; }},
        {"placket.asymmetric", false, false, [](GarmentSpec& s) { s.placketStyle = 2; }},
        {"tie.frontNeckBow", false, false, [](GarmentSpec& s) { s.tieClosure = 3; }},
        {"tie.tieBack", false, false, [](GarmentSpec& s) { s.tieClosure = 4; }},
        {"tie.wrapFront", false, false, [](GarmentSpec& s) { s.tieClosure = 7; }},
        {"collar.peterPan", false, false, [](GarmentSpec& s) { s.collarType = 4; }},
        {"gather.shirredBust", false, false, [](GarmentSpec& s) { s.gatherType = 2; s.gatherZone = 1; }},
        {"gather.drawstringSleeve", true, false, [](GarmentSpec& s) { s.gatherType = 1; s.gatherZone = 3; }},
        {"openBack.round", false, false, [](GarmentSpec& s) { s.backOpening = 1; }},
        {"backSlit.vent", false, false, [](GarmentSpec& s) { s.backSlit = 1; }},
        {"ruffledStraps", false, true, [](GarmentSpec& s) { s.ruffledStraps = 1; }},
        {"peplum.full", false, false, [](GarmentSpec& s) { s.peplum = 1; }},
        {"pocket.patch", false, false, [](GarmentSpec& s) { s.pocketStyle = 1; }},
        {"pocket.sideSeam", false, false, [](GarmentSpec& s) { s.pocketStyle = 2; }},
        {"cuff.button", true, false, [](GarmentSpec& s) { s.cuffStyle = 1; }},
        {"hemShape.highLow", false, false, [](GarmentSpec& s) { s.hemShape = 2; }},
        {"ruffleHem", false, false, [](GarmentSpec& s) { s.ruffleHem = true; s.ruffleTiers = 1; }},
        {"bardot.plain", false, false, [](GarmentSpec& s) { s.bardotStyle = 1; }},
        {"buttonRow.functional", false, false, [](GarmentSpec& s) { s.buttonRow = 1; }},
        {"buttonRow.decorative", false, false, [](GarmentSpec& s) { s.buttonRow = 2; }},
        {"exposedZip.centerBack", false, false, [](GarmentSpec& s) { s.exposedZip = 2; }},
        {"backDetail.cape", false, false, [](GarmentSpec& s) { s.backDetail = 2; }},
        {"sleeveCap.puffed", true, false, [](GarmentSpec& s) { s.sleeveCap = SleeveCap::Puffed; }},
        {"sleeveCap.cap", true, false, [](GarmentSpec& s) { s.sleeveCap = SleeveCap::Cap; }},
        {"shoulder.dropped", false, false, [](GarmentSpec& s) { s.shoulderStyle = 1; }},
        {"shoulder.raglan", false, false, [](GarmentSpec& s) { s.shoulderStyle = 2; }},
        {"edgeFinish.facing", false, false, [](GarmentSpec& s) { s.edgeFinish = 1; }},
    };

    // Declared expectations from the generated contract.
    std::map<std::string, std::string> declaredHost, declaredPair;
    for (const auto& r : contract::kComposeHostRules)
        declaredHost[std::string(r.host) + "|" + r.feature] = r.cls;
    for (const auto& r : contract::kComposePairRules)
        declaredPair[std::string(r.a) + "|" + r.b] = r.cls;
    // Every declared rule must name a known host/feature (typo guard).
    int failures = 0;
    auto knownFeature = [&](const std::string& id) {
        for (const auto& f : feats) if (id == f.id) return true;
        return false;
    };
    for (const auto& r : contract::kComposeHostRules) {
        bool hostKnown = false;
        for (const auto& h : hosts) if (r.host == std::string(h.id)) hostKnown = true;
        if (!hostKnown) { std::printf("FAIL matrix names unknown host '%s'\n", r.host); failures++; }
        if (!knownFeature(r.feature)) { std::printf("FAIL matrix names unknown feature '%s'\n", r.feature); failures++; }
    }
    for (const auto& r : contract::kComposePairRules) {
        if (!knownFeature(r.a)) { std::printf("FAIL matrix names unknown feature '%s'\n", r.a); failures++; }
        if (!knownFeature(r.b)) { std::printf("FAIL matrix names unknown feature '%s'\n", r.b); failures++; }
    }

    // ---- singles: every host x feature -------------------------------------
    int singles = 0, pairs = 0;
    std::map<std::string, int> observedCount;
    for (const auto& h : hosts) {
        const GarmentSpec base = h.make();
        std::string baseFp;
        try {
            validateSpecCross(base);
            baseFp = fingerprint(GarmentDrafter::draft(base, body()));
        } catch (const std::exception& e) {
            std::printf("FAIL host %s itself refused: %s\n", h.id, e.what());
            failures++;
            continue;
        }
        for (const auto& f : feats) {
            GarmentSpec s = base;
            f.set(s);
            std::string detail;
            const std::string observed = classify(s, baseFp, &detail);
            singles++;
            observedCount[observed]++;
            const auto it = declaredHost.find(std::string(h.id) + "|" + f.id);
            const std::string declared = it != declaredHost.end() ? it->second : "allowed";
            if (observed != declared) {
                failures++;
                std::printf("FAIL single %s x %s: declared %s, observed %s  %s\n",
                            h.id, f.id, declared.c_str(), observed.c_str(), detail.c_str());
            }
            if (dump && observed != "allowed")
                std::printf("DUMP single {\"host\":\"%s\",\"feature\":\"%s\",\"class\":\"%s\"}  %s\n",
                            h.id, f.id, observed.c_str(), detail.c_str());
        }
    }

    // ---- pairs: every feature x feature on the canonical dress host --------
    // Sleeve-needing features force the sleeved host; a pair that needs both a
    // sleeve and bare shoulders runs on the SLEEVED host (the cross-rule must
    // refuse it — that refusal IS the declared behavior).
    const GarmentSpec plainBase = dressBase(false);
    const GarmentSpec sleevedBase = dressBase(true);
    const std::string plainFp = fingerprint(GarmentDrafter::draft(plainBase, body()));
    const std::string sleevedFp = fingerprint(GarmentDrafter::draft(sleevedBase, body()));
    for (size_t a = 0; a < feats.size(); ++a) {
        for (size_t b = a + 1; b < feats.size(); ++b) {
            const bool sleeved = feats[a].needsSleeve || feats[b].needsSleeve;
            GarmentSpec s = sleeved ? sleevedBase : plainBase;
            feats[a].set(s);
            feats[b].set(s);
            std::string detail;
            const std::string observed = classify(s, sleeved ? sleevedFp : plainFp, &detail);
            pairs++;
            const auto it = declaredPair.find(std::string(feats[a].id) + "|" + feats[b].id);
            const std::string declared = it != declaredPair.end() ? it->second : "allowed";
            if (observed != declared) {
                failures++;
                std::printf("FAIL pair %s + %s: declared %s, observed %s  %s\n",
                            feats[a].id, feats[b].id, declared.c_str(), observed.c_str(), detail.c_str());
            }
            if (dump && observed != "allowed")
                std::printf("DUMP pair {\"a\":\"%s\",\"b\":\"%s\",\"class\":\"%s\"}  %s\n",
                            feats[a].id, feats[b].id, observed.c_str(), detail.c_str());
        }
    }

    std::printf("\ncompose check: %d singles + %d pairs swept | declared host rules %zu, pair rules %zu | "
                "observed allowed %d, excluded %d, validator %d, honest %d, ignored %d | %d FAILURES\n",
                singles, pairs,
                sizeof(contract::kComposeHostRules) / sizeof(contract::kComposeHostRules[0]),
                sizeof(contract::kComposePairRules) / sizeof(contract::kComposePairRules[0]),
                observedCount["allowed"], observedCount["excluded"], observedCount["validator"],
                observedCount["honest"], observedCount["ignored"], failures);
    return failures ? 1 : 0;
}
