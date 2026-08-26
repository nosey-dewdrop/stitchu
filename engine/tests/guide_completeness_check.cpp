// guide_completeness_check — KAPI (F-H İŞ 2, 2026-08-23).
//
// THE LAW: "sayfaya basılmayan öneri YOK hükmünde." An advice that is not
// printed does not exist — and, the other way round, an advice that IS printed
// with no computation and no source behind it is filler wearing a lab coat.
// This gate enforces both directions over a broad spec sweep.
//
// SIX LEGS
//   1  WIRED TO THE PAGE. The engine's rehber must be emitted on the same JSON
//      surface as the pieces. Proven by reading engine/wasm/bindings.cpp: if the
//      emit block is deleted, the advice silently stops reaching the buyer and
//      this gate goes red instead of the product quietly getting worse.
//   2  EVERY ADVICE HAS A BASIS, and the basis is one of the two allowed kinds.
//   3  EVERY CITED SOURCE EXISTS in contract/guide-sources.json.
//   4  EVERY PRINTED NUMBER IS ACCOUNTED FOR: it is either a value this draft
//      computed (present in the computed basis) or a value the cited source is
//      registered as carrying. A number that appears in neither is an invented
//      number, which is the exact failure mode this card was written about.
//   5  THE REQUIRED SECTIONS ARE THERE in EVERY draft — fabric, the 10 cm
//      stretch test, needle, stitch, seam class, edge finish, cut plan, yardage,
//      and at least two püf noktalar.
//   6  IT TRACKS THE FABRIC AXIS. A negative-ease draft must warn that it is cut
//      smaller than the body; a woven draft must NOT carry that warning. This is
//      what stops the rehber from being one frozen paragraph.
#include <cctype>
#include <cstdio>
#include <fstream>
#include <set>
#include <sstream>
#include <string>
#include <vector>

#include "../src/fabricease.hpp"
#include "../src/garment.hpp"
#include "../src/sizechart.hpp"

using namespace stitchu;

#ifndef STITCHU_REPO_ROOT
#define STITCHU_REPO_ROOT "."
#endif

static int failures = 0;
static int checked = 0;

static void fail(const std::string& msg) {
    std::printf("  [FAIL] %s\n", msg.c_str());
    failures++;
}

static std::string slurp(const std::string& path) {
    std::ifstream in(path);
    if (!in) return {};
    std::ostringstream ss;
    ss << in.rdbuf();
    return ss.str();
}

// Numeric tokens as a HUMAN reads them off the page: 10, 1.5, 75, 1.01.01.
// A '.' is kept only when it sits between digits, so a sentence-ending period
// does not become part of the number.
static std::vector<std::string> numbersIn(const std::string& s) {
    std::vector<std::string> out;
    for (size_t i = 0; i < s.size();) {
        if (!std::isdigit(static_cast<unsigned char>(s[i]))) { ++i; continue; }
        size_t j = i;
        while (j < s.size()) {
            if (std::isdigit(static_cast<unsigned char>(s[j]))) { ++j; continue; }
            if (s[j] == '.' && j + 1 < s.size() && std::isdigit(static_cast<unsigned char>(s[j + 1]))) { ++j; continue; }
            break;
        }
        out.push_back(s.substr(i, j - i));
        i = j;
    }
    return out;
}

// The `values` array of one registry entry, read straight out of the JSON text.
// A hand parser on purpose: the engine has no JSON reader and pulling one in for
// a gate would be a bigger change than the gate.
static std::set<std::string> registeredValues(const std::string& registry, const std::string& sourceId) {
    std::set<std::string> vals;
    const size_t key = registry.find("\"" + sourceId + "\": {");
    if (key == std::string::npos) return vals;
    const size_t vpos = registry.find("\"values\"", key);
    if (vpos == std::string::npos) return vals;
    const size_t open = registry.find('[', vpos);
    const size_t close = registry.find(']', open);
    if (open == std::string::npos || close == std::string::npos) return vals;
    const std::string body = registry.substr(open + 1, close - open - 1);
    size_t i = 0;
    while (true) {
        const size_t a = body.find('"', i);
        if (a == std::string::npos) break;
        const size_t b = body.find('"', a + 1);
        if (b == std::string::npos) break;
        vals.insert(body.substr(a + 1, b - a - 1));
        i = b + 1;
    }
    return vals;
}

// "source:a+b;computed:x=1" -> {"a+b"} plus the sub-ids a and b, because one
// advice may legitimately stand on two documents.
static std::vector<std::string> citedSources(const std::string& basis) {
    std::vector<std::string> ids;
    size_t pos = 0;
    while ((pos = basis.find("source:", pos)) != std::string::npos) {
        pos += 7;
        const size_t end = basis.find(';', pos);
        const std::string full = basis.substr(pos, end == std::string::npos ? std::string::npos : end - pos);
        ids.push_back(full);
        size_t p = 0, q;
        while ((q = full.find('+', p)) != std::string::npos) {
            ids.push_back(full.substr(p, q - p));
            p = q + 1;
        }
        if (p > 0) ids.push_back(full.substr(p));
        if (end == std::string::npos) break;
        pos = end;
    }
    return ids;
}

static const std::vector<std::string> kRequired = {
    "fabric.band", "fabric.stretchTest", "sew.needle", "sew.stitch",
    "sew.seamClass", "sew.edgeFinish", "cut.yardage", "cut.pieces",
};

static void auditDraft(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m,
                       const std::string& label, const std::string& registry) {
    const DraftedPattern p = GarmentDrafter::draft(spec, m);
    std::set<std::string> ids;
    int tips = 0;

    for (const auto& a : p.rehber) {
        checked++;
        if (a.id.empty() || a.text.empty()) {
            fail(label + ": an advice has an empty id or empty text");
            continue;
        }
        if (!ids.insert(a.id).second) fail(label + ": advice id '" + a.id + "' printed twice");
        if (a.id.rfind("tip.", 0) == 0) tips++;

        // LEG 2 — the basis exists and is one of the two allowed kinds.
        const bool hasComputed = a.basis.find("computed:") != std::string::npos;
        const auto sources = citedSources(a.basis);
        if (!hasComputed && sources.empty()) {
            fail(label + ": advice '" + a.id +
                 "' has no basis — it is neither computed from this draft nor sourced. "
                 "Unprintable by law: \"" + a.text + "\"");
            continue;
        }

        // LEG 3 + collect the numbers each cited source is allowed to print.
        std::set<std::string> allowed;
        for (const auto& sid : sources) {
            if (registry.find("\"" + sid + "\": {") == std::string::npos) {
                fail(label + ": advice '" + a.id + "' cites source '" + sid +
                     "' which is not in contract/guide-sources.json");
                continue;
            }
            for (const auto& v : registeredValues(registry, sid)) allowed.insert(v);
        }

        // LEG 4 — every number on the page is accounted for.
        for (const auto& n : numbersIn(a.text)) {
            const bool inComputed = a.basis.find(n) != std::string::npos;
            const bool inSource = allowed.count(n) > 0;
            if (!inComputed && !inSource) {
                fail(label + ": advice '" + a.id + "' prints the number " + n +
                     " which this draft did not compute and no cited source carries — "
                     "an invented number");
            }
        }
    }

    // LEG 5 — the required sections, in every single draft.
    for (const auto& req : kRequired)
        if (!ids.count(req)) fail(label + ": rehber is missing the required section '" + req + "'");
    if (tips < 2) fail(label + ": rehber carries " + std::to_string(tips) +
                       " püf nokta — the card asks for the places THIS pattern will fight the sewer");

    // LEG 6 — the rehber follows the fabric axis, it is not a frozen paragraph.
    const double ease = FabricBand::easeFor(FabricBand::Girth::Chest, spec.fabric);
    if (ease < 0 && !ids.count("tip.negativeEase"))
        fail(label + ": drafted with NEGATIVE ease and the rehber never says so — "
                     "the buyer will 'correct' it back and the garment will not fit");
    if (ease > 0 && ids.count("tip.negativeEase"))
        fail(label + ": positive-ease draft warns about negative ease");
    if (FabricBand::dartsDropOut(spec.fabric) && !ids.count("tip.dartsDropOut"))
        fail(label + ": super-stretch draft does not mention the dart rule");
}

int main() {
    std::printf("guide_completeness_check: every printed advice is computed or sourced\n");

    const std::string root = STITCHU_REPO_ROOT;
    const std::string registry = slurp(root + "/contract/guide-sources.json");
    if (registry.empty()) {
        fail("contract/guide-sources.json missing or empty at " + root);
        std::printf("guide_completeness_check: %d checks, %d failures\n", checked, failures);
        return 1;
    }

    // LEG 1 — the print wire. If the emit block leaves bindings.cpp, the advice
    // stops reaching the page and this goes red.
    {
        const std::string bindings = slurp(root + "/engine/wasm/bindings.cpp");
        if (bindings.empty()) fail("engine/wasm/bindings.cpp not readable at " + root);
        else if (bindings.find("\"rehber\"") == std::string::npos ||
                 bindings.find("draft.rehber[i].text") == std::string::npos)
            fail("engine/wasm/bindings.cpp no longer emits the rehber — the engine would build "
                 "advice nobody is ever shown (sayfaya basılmayan öneri YOK hükmünde)");
        else checked++;
    }

    // LEG 1b (F6) — THE OTHER HALF OF THE SAME LAW. Until F6 the engine emitted
    // the rehber on the JSON surface and NO PAGE EVER PRINTED IT, which by this
    // gate's own law meant it did not exist. Emitting is not printing; the result
    // screen has to render both the text AND the basis, because a sentence whose
    // reason is hidden reads exactly like a sentence that has none.
    {
        const std::string render = slurp(root + "/web/js/render.js");
        if (render.empty()) fail("web/js/render.js not readable at " + root);
        else if (render.find("p.rehber") == std::string::npos ||
                 render.find("a.basis") == std::string::npos)
            fail("web/js/render.js no longer prints the rehber with its basis — the advice "
                 "would exist in JSON and nowhere a buyer can read it");
        else checked++;
    }

    const std::vector<double> bands = {0.0, 12.5, 38.0, 63.0, 88.0};
    for (const auto& size : euSizeChart()) {
        if (size.label != "EU34" && size.label != "EU38" && size.label != "EU48") continue;
        for (const double s : bands) {
            const FabricAxis f(s <= 0.0 ? Fabric::Woven : Fabric::Knit, s);
            for (const auto garment : {GarmentType::Dress, GarmentType::Top, GarmentType::Skirt}) {
                for (const auto neck : {Neckline::Crew, Neckline::VNeck, Neckline::Halter}) {
                    for (const auto sleeve : {SleeveStyle::None, SleeveStyle::Straight}) {
                        for (const auto shaping : {Shaping::Dart, Shaping::Princess}) {
                            GarmentSpec spec;
                            spec.garment = garment;
                            spec.fabric = f;
                            spec.neckline = neck;
                            spec.sleeveStyle = sleeve;
                            spec.shaping = shaping;
                            auditDraft(spec, size.body,
                                       size.label + "/" + raw(garment) + "/" + raw(neck) + "/" +
                                           raw(sleeve) + "/" + raw(shaping) + "/stretch" +
                                           std::to_string(static_cast<int>(s)),
                                       registry);
                        }
                    }
                }
            }
        }
    }

    // Undeclared woven and undeclared knit go through the same audit — the two
    // words the whole material layer used to be.
    for (const auto fab : {Fabric::Woven, Fabric::Knit}) {
        GarmentSpec spec;
        spec.fabric = fab;
        auditDraft(spec, euSizeChart()[2].body, std::string("undeclared/") + raw(fab), registry);
    }

    // F6 — THE OTHER THREE NUMBERS. The sweep above only ever declares stretch,
    // so the recovery / drape / bolt-width sentences would never be audited. These
    // axes exercise all of their branches: recovery that PASSES the published
    // minimum, recovery that FAILS it, growth over the maximum, drape declared,
    // and a bolt narrower and wider than the 140 cm reference. They are fixtures,
    // not a claim about any real fabric — the fabric numbers live in
    // contract/fabric-catalog-v1.json and are audited by fabric_catalog_check.
    {
        struct Case { const char* label; Fabric cls; double stretch, r15, r30, growth, gsm, bl, width; };
        const Case cases[] = {
            {"f6/recovery-passes", Fabric::Knit,  50.0, 78.0, 88.0,  2.5, 150.0, 11.0, 165.0},
            {"f6/recovery-fails",  Fabric::Knit,  50.0, 70.0, 80.0,  2.5, 150.0, 11.0, 165.0},
            {"f6/growth-over",     Fabric::Knit,  50.0, 90.0, 95.0,  9.0, 150.0, 11.0, 165.0},
            {"f6/stiff-woven",     Fabric::Woven,  0.0,   -1,   -1,   -1, 120.0, 22.0, 112.0},
            {"f6/drapey-woven",    Fabric::Woven,  0.0,   -1,   -1,   -1, 110.0, 13.0, 140.0},
            {"f6/no-drape-narrow", Fabric::Woven,  0.0,   -1,   -1,   -1,    -1,   -1,  90.0},
        };
        for (const auto& c : cases) {
            FabricAxis f(c.cls, c.stretch);
            f.recovery15sPct = c.r15;
            f.recovery30minPct = c.r30;
            f.growthPct = c.growth;
            f.weightGSM = c.gsm;
            f.bendingLengthMM = c.bl;
            f.widthCM = c.width;
            for (const auto garment : {GarmentType::Dress, GarmentType::Top, GarmentType::Skirt}) {
                GarmentSpec spec;
                spec.garment = garment;
                spec.fabric = f;
                auditDraft(spec, euSizeChart()[2].body,
                           std::string(c.label) + "/" + raw(garment), registry);
            }
        }
    }

    std::printf("guide_completeness_check: %d checks, %d failures\n", checked, failures);
    return failures == 0 ? 0 : 1;
}
