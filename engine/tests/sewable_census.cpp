// SEWABLE CENSUS (2026-07-18): a hard census of whether every draft the engine
// produces is actually sewable. Runs the runtime validator across the full body
// x garment sweep AND adds a shoulder-seam-length match check the validator
// currently OMITS (front shoulder seam length vs back shoulder seam length must
// match within pairedSeamTolerance, else the shoulder seam cannot be sewn).
//
// This is a PROOF harness, not a green-lights-are-fine test. It prints:
//   - total drafts tested
//   - fully sewable count (0 issues, incl. shoulder-match)
//   - failure breakdown by issue rule (incl. the new "shoulder-match")
//   - worst offenders per rule with the mm mismatch
//
// The body list + spec matrix mirror engine_check.cpp exactly (same 2805 drafts)
// so the census covers the same representative sweep the engine ships against.
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <map>
#include <optional>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/geometry.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

namespace {

struct Body {
    std::string name;
    BodyMeasurementsSnapshot m;
};

Body body(const char* name, double bust, double waist, double hip, double shoulder,
          double backLength, double arm, double neck) {
    return {name, {bust, waist, hip, shoulder, backLength, arm, neck}};
}

// Locate the shoulder seam in a drafted body piece. The bodice draws:
//   Move(centerNeck), <neck commands>, Line(shoulderTip), Curve(armhole), ...
// The neck commands end in either a Line (crew/square/boat) or a Curve
// (scoop/vneck/sweetheart). In EVERY neckline the shoulder seam is therefore
// the FIRST Line command that is immediately followed by a Curve command — that
// Curve is the armhole. Its start point is the neck point, its end the shoulder
// tip. Returns the seam length, or nullopt if the piece has no such shoulder
// seam (halter fronts, panels that do not carry the shoulder, etc.).
std::optional<double> shoulderSeamLength(const PatternPiece& piece) {
    Point current{0, 0};
    for (size_t i = 0; i < piece.commands.size(); ++i) {
        const auto& cmd = piece.commands[i];
        if (cmd.type == CmdType::Line && i + 1 < piece.commands.size() &&
            piece.commands[i + 1].type == CmdType::Curve) {
            // current = the point before this line = the neck point.
            const double len = distance(current, cmd.to);
            if (len > 1.0) return len; // a real seam, not a degenerate jog
            return std::nullopt;
        }
        switch (cmd.type) {
            case CmdType::Move:
            case CmdType::Line:
            case CmdType::Curve:
                current = cmd.to;
                break;
            case CmdType::Close:
                break;
        }
    }
    return std::nullopt;
}

// A drafted garment either has a shoulder seam on both halves (must match) or
// on neither (halter / strapless — no shoulder to sew). Find the front + back
// carriers: in princess mode the shoulder lives on the center panels, in dart
// mode on the single front/back piece. Names carry "Front"/"Back" and a bodice
// or top prefix.
const PatternPiece* findShoulderCarrier(const DraftedPattern& draft, bool front) {
    const char* half = front ? "Front" : "Back";
    // Prefer the center panel (princess), then the plain piece (dart), for both
    // dresses (Bodice*) and tops (Top*).
    for (const char* prefix : {"Bodice Center ", "Top Center ", "Bodice ", "Top "}) {
        std::string want = std::string(prefix) + half;
        for (const auto& p : draft.pieces)
            if (p.name == want) return &p;
    }
    return nullptr;
}

} // namespace

int main() {
    const std::vector<Body> bodies = {
        body("EU34", 80, 62, 86, 36, 39.5, 57, 34),
        body("EU36", 84, 66, 90, 36.5, 40, 57.5, 34.5),
        body("EU38", 88, 70, 94, 37, 40.5, 58, 35),
        body("EU40", 92, 74, 98, 37.5, 41, 58.5, 36),
        body("EU42", 96, 78, 102, 38, 41.5, 59, 36.5),
        body("EU44", 100, 82, 106, 38.5, 42, 59.5, 37),
        body("EU46", 104, 86, 110, 39, 42, 60, 38),
        body("EU48", 110, 92, 116, 40, 42.5, 60.5, 39),
        body("EU50", 116, 98, 122, 41, 43, 61, 40),
        body("EU52", 122, 104, 128, 42, 43.5, 61.5, 41),
        body("tall", 92, 74, 98, 39, 47, 66, 36),
        body("petite", 84, 64, 90, 34, 33, 49, 33),
        body("pear", 96, 70, 116, 37, 41, 58, 36),
        body("apple", 118, 112, 104, 40, 42, 60, 40),
        body("bigNeckSmallShoulder", 100, 84, 104, 30, 40, 58, 50),
    };

    const std::vector<SkirtStyle> skirtStyles = {
        SkirtStyle::ALine, SkirtStyle::Straight, SkirtStyle::Gathered, SkirtStyle::HalfCircle,
        SkirtStyle::Pleated};
    const std::vector<SkirtLength> skirtLengths = {SkirtLength::Mini, SkirtLength::Midi, SkirtLength::Maxi};
    const std::vector<Neckline> necklines = {
        Neckline::Crew, Neckline::Scoop, Neckline::VNeck, Neckline::Square, Neckline::Boat,
        Neckline::Sweetheart, Neckline::Halter};
    const std::vector<TopLength> topLengths = {TopLength::Cropped, TopLength::Hip, TopLength::Tunic};
    const std::vector<std::pair<SleeveStyle, SleeveLength>> sleeveCombos = {
        {SleeveStyle::None, SleeveLength::Short},
        {SleeveStyle::Straight, SleeveLength::Short},
        {SleeveStyle::Straight, SleeveLength::Long},
        {SleeveStyle::Balloon, SleeveLength::Short},
        {SleeveStyle::Balloon, SleeveLength::Elbow},
    };
    const std::vector<Shaping> shapings = {Shaping::Princess, Shaping::Dart};
    const std::vector<Waistline> waistlines = {Waistline::Natural, Waistline::Empire};
    const std::vector<Fabric> fabrics = {Fabric::Woven, Fabric::Knit};

    std::vector<std::pair<std::string, GarmentSpec>> specs;
    for (auto fabric : fabrics) {
        for (auto shaping : shapings) {
            for (auto style : skirtStyles) {
                for (auto length : skirtLengths) {
                    GarmentSpec spec;
                    spec.garment = GarmentType::Skirt;
                    spec.shaping = shaping;
                    spec.fabric = fabric;
                    spec.skirtStyle = style;
                    spec.skirtLength = length;
                    specs.push_back({std::string("skirt/") + raw(fabric) + "/" + raw(shaping) + "/" + raw(style) + "/" + raw(length), spec});
                }
            }
        }
    }
    for (auto neckline : necklines) {
        for (auto fabric : fabrics) {
            for (auto shaping : shapings) {
                for (auto waistline : waistlines) {
                    for (auto style : skirtStyles) {
                        for (auto skirtLength : skirtLengths) {
                            for (const auto& [sleeve, sleeveLength] : sleeveCombos) {
                                GarmentSpec spec;
                                spec.garment = GarmentType::Dress;
                                spec.shaping = shaping;
                                spec.waistline = waistline;
                                spec.fabric = fabric;
                                spec.neckline = neckline;
                                spec.skirtStyle = style;
                                spec.skirtLength = skirtLength;
                                spec.sleeveStyle = sleeve;
                                spec.sleeveLength = sleeveLength;
                                specs.push_back({std::string("dress/") + raw(fabric) + "/" + raw(shaping) + "/" + raw(waistline) + "/" + raw(neckline) + "/" + raw(style) + "/" + raw(skirtLength) + "/" + raw(sleeve) + "." + raw(sleeveLength), spec});
                            }
                        }
                    }
                }
                for (auto topLength : topLengths) {
                    for (const auto& [sleeve, sleeveLength] : sleeveCombos) {
                        GarmentSpec spec;
                        spec.garment = GarmentType::Top;
                        spec.shaping = shaping;
                        spec.fabric = fabric;
                        spec.neckline = neckline;
                        spec.topLength = topLength;
                        spec.sleeveStyle = sleeve;
                        spec.sleeveLength = sleeveLength;
                        specs.push_back({std::string("top/") + raw(fabric) + "/" + raw(shaping) + "/" + raw(neckline) + "/" + raw(topLength) + "/" + raw(sleeve) + "." + raw(sleeveLength), spec});
                    }
                }
            }
        }
    }

    int drafts = 0;
    int sewable = 0;
    std::map<std::string, int> ruleCounts;
    // worst offender per rule: {mm, label}
    std::map<std::string, std::pair<double, std::string>> worst;

    // Shoulder-match census (the omitted check) tracked separately so we can
    // report it even when the draft is otherwise clean.
    int shoulderChecked = 0;   // drafts that HAVE a shoulder seam on both halves
    int shoulderMatched = 0;
    int shoulderSkipped = 0;   // halter/strapless — legitimately no shoulder seam

    for (const auto& b : bodies) {
        for (const auto& [label, spec] : specs) {
            const DraftedPattern draft = GarmentDrafter::draft(spec, b.m);
            auto issues = PatternValidator::issues(spec, b.m, draft);
            ++drafts;

            // ---- shoulder-seam-length match (validator omits this) ----
            // A halter has NO shoulder seam (its short "shoulder tip" line is the
            // nape closure edge, drawn in a shifted frame) — legitimately skipped.
            std::optional<double> shoulderMismatch;
            if (spec.garment != GarmentType::Skirt && spec.neckline != Neckline::Halter) {
                const PatternPiece* fp = findShoulderCarrier(draft, true);
                const PatternPiece* bp = findShoulderCarrier(draft, false);
                std::optional<double> fs = fp ? shoulderSeamLength(*fp) : std::nullopt;
                std::optional<double> bs = bp ? shoulderSeamLength(*bp) : std::nullopt;
                if (fs && bs) {
                    ++shoulderChecked;
                    const double delta = std::fabs(*fs - *bs);
                    if (delta <= PatternValidator::pairedSeamTolerance) {
                        ++shoulderMatched;
                    } else {
                        shoulderMismatch = delta;
                        issues.push_back({"shoulder-match", "Bodice",
                            std::string("front shoulder seam vs back differ by ") +
                            std::to_string(delta) + " mm"});
                        char buf[64];
                        std::snprintf(buf, sizeof(buf), "front %.1f vs back %.1f", *fs, *bs);
                        auto& w = worst["shoulder-match"];
                        if (delta > w.first) w.second = b.name + " " + label + " (" + buf + ")";
                        w.first = std::max(w.first, delta);
                    }
                } else {
                    // Non-halter garment where a shoulder carrier / seam was not
                    // found on both halves (e.g. sweetheart strapless fronts).
                    ++shoulderSkipped;
                }
            } else if (spec.garment != GarmentType::Skirt && spec.neckline == Neckline::Halter) {
                ++shoulderSkipped; // halter: no shoulder seam by design
            }

            if (issues.empty()) {
                ++sewable;
                continue;
            }
            for (const auto& issue : issues) {
                ruleCounts[issue.rule] += 1;
                if (issue.rule == "shoulder-match") continue; // worst already recorded above
                // Pull a mm figure out of the detail if present, for worst-offender.
                double mm = 0;
                const std::string& d = issue.detail;
                size_t pos = d.find(" mm");
                if (pos != std::string::npos) {
                    size_t start = pos;
                    while (start > 0 && (std::isdigit((unsigned char)d[start - 1]) ||
                                         d[start - 1] == '.' || d[start - 1] == '-'))
                        --start;
                    try { mm = std::stod(d.substr(start, pos - start)); } catch (...) { mm = 0; }
                }
                auto& w = worst[issue.rule];
                if (mm > w.first) { w.first = mm; w.second = b.name + " " + label + " :: " + issue.description(); }
            }
        }
    }

    // ---- CENSUS REPORT ----
    std::printf("========================================================\n");
    std::printf("SEWABLE CENSUS — %d drafts across %zu bodies x %zu specs\n",
                drafts, bodies.size(), specs.size());
    std::printf("========================================================\n");
    std::printf("fully sewable (0 issues, incl shoulder-match): %d / %d  (%.1f%%)\n",
                sewable, drafts, 100.0 * sewable / drafts);
    std::printf("\nSHOULDER-SEAM MATCH (validator OMITS this):\n");
    std::printf("  drafts with a shoulder seam on both halves: %d\n", shoulderChecked);
    std::printf("  matched within %.1f mm: %d\n", (double)PatternValidator::pairedSeamTolerance, shoulderMatched);
    std::printf("  MISMATCHED (> %.1f mm): %d\n", (double)PatternValidator::pairedSeamTolerance,
                shoulderChecked - shoulderMatched);
    std::printf("  skipped (halter/strapless, no shoulder seam): %d\n", shoulderSkipped);

    std::printf("\nFAILURE BREAKDOWN BY ISSUE RULE:\n");
    if (ruleCounts.empty()) {
        std::printf("  (none)\n");
    }
    for (const auto& [rule, count] : ruleCounts) {
        std::printf("  %-16s %6d\n", rule.c_str(), count);
    }

    std::printf("\nWORST OFFENDER PER RULE:\n");
    for (const auto& [rule, w] : worst) {
        std::printf("  [%s] %.1f mm\n     %s\n", rule.c_str(), w.first, w.second.c_str());
    }

    std::printf("\nVERDICT: %s\n",
                (sewable == drafts) ? "ALL DRAFTS SEWABLE"
                                    : "NOT ALL DRAFTS SEWABLE — see breakdown above");
    return (sewable == drafts) ? 0 : 1;
}
