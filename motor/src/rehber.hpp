#pragma once
// ── REHBER (F-H İŞ 2, 2026-08-23) ───────────────────────────────────────────
//
// Damla: "insanlar kalıp ve flat alıp gitmeyecekler kanka. REHBER, PÜF NOKTALAR
// vs alacak. bir terzilik hesabı bu." So the product is kalıp + flat + REHBER,
// and all three have to be VISIBLE in the output.
//
// The law this file is written under: **an advice that is not printed on the
// page does not exist.** Every entry therefore carries, next to its text, the
// BASIS it came from — either
//     computed:<key>=<value>;...   a number this very draft measured, or
//     source:<id>                  a row in contract/guide-sources.json
// and guide_completeness_check refuses any entry whose printed numbers are not
// in that basis. A sentence like "use a fine needle" with nothing behind it is
// a red gate, not a nice touch.
//
// NOT a second guide. `DraftedPattern::guideSteps` (the sewing ORDER) is
// untouched — this is the material/technique layer beside it, which is what was
// missing. printpack's "KUMAS SECIMI" page (NMSU G-401 / SDSU / UNL) is likewise
// not overwritten: this extends it with the numbers only the draft knows.
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "fabricease.hpp"
#include "geometry.hpp"
#include "measurements.hpp"
#include "sizechart.hpp"

namespace stitchu {

namespace rehber {

// One number formatter, used for BOTH the text and the basis, so the printed
// number and the recorded number are the same string by construction.
inline std::string num(double v, int places) {
    char buf[64];
    std::snprintf(buf, sizeof buf, "%.*f", places, v);
    return std::string(buf);
}
inline std::string num(int v) { return std::to_string(v); }

inline bool nameHas(const PatternPiece& p, const char* needle) {
    return p.name.find(needle) != std::string::npos;
}

// ── FABRIC WEIGHT CLASS (M5-rehber) ─────────────────────────────────────────
// g/m2 is measured by ISO 3801; the class EDGES below are a published trade
// band (contract/guide-sources.json `fabricuk-gsm-bands`), not a standard. They
// are the only weight bands that were found written down anywhere, and they are
// used for ONE thing: choosing which row of the needle chart to read. Nothing
// in the drafted geometry touches them.
inline constexpr double kLightMaxGSM = 150.0;
inline constexpr double kMediumMaxGSM = 350.0;

// ── THE 10 cm STRETCH TEST ──────────────────────────────────────────────────
// The buyer cannot know their fabric's stretch class from the bolt end, so the
// guide tells them to measure it: mark 10 cm across the grain, pull it against a
// ruler, read the number. That number is the axis this pattern was cut on, which
// is why the window below is DERIVED from the band the draft actually used and
// not from a table of fabric names.
struct StretchWindow {
    double lowPct;
    double highPct;
};
inline StretchWindow windowFor(const FabricAxis& f) {
    const double s = f.effectiveStretchPct();
    if (s <= 0.0) return {0.0, 0.0};
    if (s <= FabricBand::kStableMaxPct) return {0.0, FabricBand::kStableMaxPct};
    if (s <= FabricBand::kModerateMaxPct) return {FabricBand::kStableMaxPct, FabricBand::kModerateMaxPct};
    if (s <= FabricBand::kStretchyMaxPct) return {FabricBand::kModerateMaxPct, FabricBand::kStretchyMaxPct};
    return {FabricBand::kStretchyMaxPct, 100.0};
}

// The SMALLEST bust step the EU chart takes anywhere in its run. Read off the
// chart itself (contract/tables.json draft.euSizeChart, burda "Damen
// Maßtabellen") rather than written down here: the chart steps 4 cm up to EU46
// and 6 cm above it, and the smallest step is the conservative one to compare a
// shrink against.
inline double smallestBustStepCM() {
    const auto& chart = euSizeChart();
    double best = -1.0;
    for (size_t i = 1; i < chart.size(); ++i) {
        const double d = chart[i].body.bustCM - chart[i - 1].body.bustCM;
        if (d > 0.0 && (best < 0.0 || d < best)) best = d;
    }
    return best;
}

// Minimum RADIUS OF CURVATURE along a path, in mm, with the command index it
// occurred at. A cubic's curvature is k = |x'y'' - y'x''| / (x'^2+y'^2)^1.5 and
// R = 1/k; straight segments have infinite R and are skipped. Sampled, not
// solved: 21 stations per curve is far finer than any seam allowance decision.
// Returns -1 when the path has no curvature at all (an all-straight piece).
inline double minCurveRadiusMM(const std::vector<PathCommand>& path) {
    double best = -1.0;
    Point cur{0, 0};
    for (const PathCommand& c : path) {
        if (c.type == CmdType::Curve) {
            const Point p0 = cur, p1 = c.cp1, p2 = c.cp2, p3 = c.to;
            for (int i = 0; i <= 20; ++i) {
                const double t = i / 20.0, u = 1.0 - t;
                const double dx = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) +
                                  3 * t * t * (p3.x - p2.x);
                const double dy = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) +
                                  3 * t * t * (p3.y - p2.y);
                const double ddx = 6 * u * (p2.x - 2 * p1.x + p0.x) + 6 * t * (p3.x - 2 * p2.x + p1.x);
                const double ddy = 6 * u * (p2.y - 2 * p1.y + p0.y) + 6 * t * (p3.y - 2 * p2.y + p1.y);
                const double sp = std::sqrt(dx * dx + dy * dy);
                if (sp < 1e-6) continue;               // a stationary point carries no radius
                const double cross = std::fabs(dx * ddy - dy * ddx);
                if (cross < 1e-9) continue;            // locally straight
                const double r = sp * sp * sp / cross;
                if (r < 1e-3) continue;                // a cusp is not a sewing radius
                if (best < 0.0 || r < best) best = r;
            }
        }
        if (c.type != CmdType::Close) cur = c.to;
    }
    return best;
}

// One measured place where THIS pattern will fight the sewer. `ratio` is the
// point's own limit ratio — how far the measurement has gone past the number
// that makes it hard — and it is DIMENSIONLESS on purpose, so four different
// difficulties can be put in one order and the order can be printed and argued
// with. 1.0 always means "nothing to do here".
struct HardPoint {
    double ratio = 0.0;
    std::string id, text, basis;
};

inline std::vector<GuideAdvice> build(const DraftedPattern& pattern, const FabricAxis& axis,
                                      const BodyMeasurementsSnapshot& body) {
    const double bustCM = body.bustCM;
    const double sizeStepCM = smallestBustStepCM();
    std::vector<GuideAdvice> out;
    const auto add = [&out](const char* id, std::string text, std::string basis) {
        out.push_back({id, std::move(text), std::move(basis)});
    };

    const double stretch = axis.effectiveStretchPct();
    const bool knit = (static_cast<Fabric>(axis) == Fabric::Knit);
    const std::string band = FabricBand::bandName(axis);
    const double chestEase = FabricBand::easeFor(FabricBand::Girth::Chest, axis);
    const StretchWindow w = windowFor(axis);

    // 1 — WHICH FABRIC. The band, and the ease that band bought.
    add("fabric.band",
        "This pattern is cut for a " + band + " fabric: " + num(stretch, 1) +
            "% crosswise stretch, drafted with " + num(chestEase * 100.0, 1) +
            "% ease at the bust. A different stretch class needs a different cut — "
            "re-draft rather than guess.",
        "computed:stretchPct=" + num(stretch, 1) + ";band=" + band +
            ";chestEasePct=" + num(chestEase * 100.0, 1));

    // 2 — THE 10 cm TEST, so the buyer can check their own bolt at home.
    if (w.highPct <= 0.0) {
        add("fabric.stretchTest",
            "10 cm stretch test: mark 10 cm across the grain (selvedge to selvedge) and "
            "pull. A woven barely moves — if your 10 cm reaches past 11 cm, the fabric "
            "has stretch this pattern did not allow for and it will hang loose.",
            "computed:testLenCM=10;maxCM=11;bandHighPct=" + num(w.highPct, 1));
    } else {
        add("fabric.stretchTest",
            "10 cm stretch test: mark 10 cm across the grain and pull it along a ruler. "
            "For this pattern it must reach between " + num(10.0 * (1.0 + w.lowPct / 100.0), 1) +
                " cm and " + num(10.0 * (1.0 + w.highPct / 100.0), 1) +
                " cm (that is " + num(w.lowPct, 1) + "% to " + num(w.highPct, 1) +
                "% stretch). Less than that and it will not go on; more and it will sag.",
            "computed:testLenCM=10;minCM=" + num(10.0 * (1.0 + w.lowPct / 100.0), 1) +
                ";maxCM=" + num(10.0 * (1.0 + w.highPct / 100.0), 1) +
                ";lowPct=" + num(w.lowPct, 1) + ";highPct=" + num(w.highPct, 1));
    }

    // 2b — RECOVERY (F6). The second axis, and the one that decides whether the
    // negative branch is allowed at all. Printed only when the spec DECLARED it,
    // because an advice about a number nobody measured is filler.
    //
    // 2c — DRAPE (F6). FAST-2 rigidity, computed from the buyer's own two
    // measurements. ⚠ It is PRINTED and it does NOT move the draft: a publication
    // mapping rigidity to a gather ratio was searched for and NOT FOUND
    // (contract/fabric-catalog-v1.json `drape_rule`). Saying so out loud is the
    // point — a silently invented multiplier is exactly what §3.10 forbids.
    //
    // Both blocks read the axis through locals bound once: the members are then
    // named in one place and the two advices below stay readable.
    const double r15 = axis.recovery15sPct, r30 = axis.recovery30minPct;
    const double growth = axis.growthPct, gsm = axis.weightGSM;
    const double blen = axis.bendingLengthMM, rigid = axis.bendingRigidityUNm();
    if (axis.recoveryDeclared()) {
        const bool ok = FabricBand::recoveryQualifies(axis);
        std::string decl;
        std::string basis = "computed:";
        if (r15 >= 0.0) {
            decl += num(r15, 1) + "% after 15 seconds";
            basis += "recovery15sPct=" + num(r15, 1) + ";";
        }
        if (r30 >= 0.0) {
            if (!decl.empty()) decl += " and ";
            decl += num(r30, 1) + "% after 30 minutes";
            basis += "recovery30minPct=" + num(r30, 1) + ";";
        }
        if (growth >= 0.0) {
            if (!decl.empty()) decl += ", with ";
            decl += num(growth, 1) + "% growth";
            basis += "growthPct=" + num(growth, 1) + ";";
        }
        basis += "growthMaxPct=" + num(FabricBand::kGrowthMaxPct, 1) +
                 ";recovery15sMinPct=" + num(FabricBand::kRecovery15sMinPct, 1) +
                 ";recovery30minMinPct=" + num(FabricBand::kRecovery30minMinPct, 1) +
                 ";karar=K63;yontem=astm-d3107;yontem2=astm-d2594";
        // 🚨 F6 HAKEMİ (K63): bu cümle eskiden üç sayıyı "the published minimums …
        // (ASTM D3107)" diye basıyordu. Hakem kaynağı açtı: D3107 bir TEST
        // YÖNTEMİDİR, kabul eşiği YAYINLAMAZ (D2594 de öyle). Atıf kesildi;
        // sayılar kaldı ve kimin koyduğu SÖYLENİYOR. Yöntem adı duruyor çünkü
        // ölçümü GERÇEKTEN o tanımlıyor — söylenmeyen tek şey artık bir yalan değil.
        add("fabric.recovery",
            std::string("Recovery: this cloth was declared at ") + decl +
                ". Measure it with ASTM D3107 (woven) or D2594 (knit) — those methods define "
                "the test but publish no pass mark, so the floor below is OURS, not theirs: at least " +
                num(FabricBand::kRecovery15sMinPct, 1) +
                "% at 15 seconds, " + num(FabricBand::kRecovery30minMinPct, 1) +
                "% at 30 minutes and at most " + num(FabricBand::kGrowthMaxPct, 1) +
                "% growth. This one " +
                (ok ? "meets them, which is why the pattern is allowed to be cut smaller than the body."
                    : "does NOT meet them, so the pattern was NOT cut smaller than the body even though "
                      "it stretches — cloth that does not spring back would be permanently tight.") +
                " Stretch and recovery are two different measurements; do not read one off the other.",
            basis);
    }
    if (axis.drapeDeclared()) {
        add("fabric.drape",
            "Drape: " + num(gsm, 1) + " g/m2 weighed against a bending length of " +
                num(blen, 1) + " mm gives a bending rigidity of " + num(rigid, 3) +
                " uNm (FAST-2). That is how stiff the cloth is, and it is what decides whether a "
                "gather stands out or falls in soft folds. This number is reported, not designed "
                "into these pieces: the gather ratio here is the pattern's own, because no published "
                "table maps rigidity to a gather ratio. Sew a test gather before you cut the real one.",
            "computed:weightGSM=" + num(gsm, 1) + ";bendingLengthMM=" +
                num(blen, 1) + ";bendingRigidityUNm=" + num(rigid, 3) + ";fast=2");
    }

    // 3 — NEEDLE, KEYED TO THIS BOLT'S OWN WEIGHT (M5-rehber, 2026-09-03).
    //
    // ⚠ WHAT WAS WRONG BEFORE. This section printed ONE frozen sentence per
    // fabric WORD: every woven got "universal 80/12 for a medium woven" and
    // every knit got "75/11 to 80/12". The catalog carries a MEASURED weight
    // for all five shipped bolts (87 / 110 / 140 / 200 / 230 g/m2) and the
    // sentence ignored it — an 87 g/m2 cotton lawn was being told to use the
    // medium-woven needle. The number was there and the advice did not read it.
    //
    // WHAT IT DOES NOW. Two published tables, composed:
    //   weight class  <- g/m2, ISO 3801 bands (Fabric UK, `fabricuk-gsm-bands`)
    //   size band     <- weight class (University of Fashion needle chart)
    //   point type    <- knit vs woven (SCHMETZ needle guide)
    // and for a knit the SIZE comes from UNL "Sewing With Knits", which
    // publishes knit sizes directly (75/11 light, 80/12 medium, 90/14 heavy) —
    // a knit-specific table beats a general one.
    //
    // ⛔ WHAT IT REFUSES TO DO. Inside a weight class the chart gives a BAND
    // (light = 60/8 .. 70/10), not one number. Three of the five shipped bolts
    // (lawn 87, challis 110, crepe 140) land in the SAME band, so they get the
    // SAME needle band — and that is printed as it stands. Splitting the band
    // finer to make five bolts look like five answers would be an invented
    // sub-rule, which is the one thing this file is not allowed to do.
    // A bolt with NO declared weight gets no size at all: the refusal names
    // itself and hands over the next step (weigh a 10x10 cm swatch).
    if (!(gsm > 0.0)) {
        add("sew.needle",
            std::string("Needle: I cannot name a size. The published chart keys needle size to "
                        "fabric WEIGHT and this fabric was chosen without one, so any number here "
                        "would be invented. Point type is safe to name: ") +
                (knit ? "ballpoint / jersey, because a sharp point cuts the knit loops and the "
                        "seam ladders."
                      : "universal, the general woven point.") +
                " Next step: read the g/m2 off the bolt end, or cut a 10 cm x 10 cm swatch, "
                "weigh it in grams and multiply by 100 — then come back and pick the size for "
                "that weight.",
            std::string("source:schmetz-needle-types;computed:weightDeclared=0;swatchCM=10;"
                        "gsmFactor=100;birim=g/m2;cls=") +
                (knit ? "knit" : "woven"));
    } else {
        const char* wclass = gsm < kLightMaxGSM    ? "light"
                             : gsm < kMediumMaxGSM ? "medium"
                                                   : "heavy";
        const std::string classBasis = ";weightGSM=" + num(gsm, 1) + ";weightClass=" + wclass +
                                       ";lightMaxGSM=" + num(kLightMaxGSM, 0) +
                                       ";mediumMaxGSM=" + num(kMediumMaxGSM, 0) + ";birim=g/m2";
        if (knit) {
            // UNL publishes the knit sizes one per class — a single number, not a band.
            const char* pick = gsm < kLightMaxGSM ? "75/11" : gsm < kMediumMaxGSM ? "80/12" : "90/14";
            add("sew.needle",
                std::string("Needle: ballpoint / jersey, size ") + pick + ". This bolt weighs " +
                    num(gsm, 1) + " g/m2, which is a " + wclass +
                    "-weight knit, and the extension table gives 75/11 light, 80/12 medium, "
                    "90/14 heavy. Use the ballpoint point, not a sharp one: a sharp needle cuts "
                    "the loops and the seam runs like a ladder.",
                "source:unl-knits+fabricuk-gsm-bands+schmetz-needle-types;computed:needle=" +
                    std::string(pick) + classBasis);
        } else {
            // The needle chart gives a BAND per weight class. Printed as a band.
            const char* lo = gsm < kLightMaxGSM ? "60/8" : gsm < kMediumMaxGSM ? "75/11" : "100/16";
            const char* hi = gsm < kLightMaxGSM ? "70/10" : gsm < kMediumMaxGSM ? "95/15" : "110/18";
            add("sew.needle",
                std::string("Needle: universal, size ") + lo + " to " + hi + ". This bolt weighs " +
                    num(gsm, 1) + " g/m2, so by weight it is a " + wclass +
                    "-weight cloth (light under " + num(kLightMaxGSM, 0) + " g/m2, medium up to " +
                    num(kMediumMaxGSM, 0) + "), and that is the size band the chart publishes for "
                    "it. The chart gives a band and not one number, so this does too — start at "
                    "the fine end on a scrap and go up only if the stitch skips.",
                "source:uof-needle-sizes+fabricuk-gsm-bands+schmetz-needle-types;computed:needleLow=" +
                    std::string(lo) + ";needleHigh=" + hi + classBasis);
        }
    }

    // 4 — STITCH. ISO 4915 class, plus the millimetres UNL publishes for knits.
    if (knit) {
        add("sew.stitch",
            "Stitch: a narrow zigzag, 1 mm to 1.5 mm wide, or an overlock (ISO 4915 "
            "class 500). A plain straight lockstitch has no give and will pop the first "
            "time the garment is pulled on.",
            "source:unl-knits+iso-4915");
    } else {
        add("sew.stitch",
            "Stitch: plain lockstitch, ISO 4915 type 301, about 2.5 mm long.",
            "source:coats-seams");
    }

    // 5 — SEAM CLASS. Coats: the seam code and the stitch code are quoted as a
    // PAIR; that pairing is what makes this a tech-pack sentence and not advice.
    add("sew.seamClass",
        "Every straight join in this pattern is a plain superimposed seam: ISO 4916 "
        "seam 1.01.01 with ISO 4915 stitch 301. Quote that pair to a factory and they "
        "know exactly what you mean.",
        "source:coats-seams");

    // 6 — EDGE FINISH.
    add("sew.edgeFinish",
        "Finish the raw edges by serging: ISO 4916 6.01.01. Zigzag over the edge is the "
        "home-machine equivalent.",
        "source:coats-seams");

    // 7 — BOUND EDGES, only when this draft actually cuts a binding strip.
    int bindingPieces = 0, facingPieces = 0, onFold = 0, notches = 0;
    double longestMM = 0;
    std::string longestName;
    for (const auto& p : pattern.pieces) {
        if (nameHas(p, "Bias binding") || nameHas(p, "binding")) bindingPieces++;
        if (nameHas(p, "facing") || nameHas(p, "Facing") || nameHas(p, "Collar") ||
            nameHas(p, "Placket") || nameHas(p, "Waistband") || nameHas(p, "Cuff"))
            facingPieces++;
        if (p.onFold) onFold++;
        notches += static_cast<int>(p.notches.size());
        const Rect box = boundingBox(p.commands);
        const double span = std::max(box.width, box.height);
        if (span > longestMM) { longestMM = span; longestName = p.name; }
    }
    if (bindingPieces > 0) {
        add("sew.boundEdge",
            "The " + num(bindingPieces) +
                " bias strip(s) bind an edge rather than face it: that is ISO 4916 class "
                "3 (bound), the same class industry uses for t-shirt necklines. Stretch "
                "the strip very slightly on inner curves so it lies flat.",
            "source:coats-seams;computed:bindingPieces=" + num(bindingPieces));
    }
    // ⭐ M5-rehber — TELA IS NOW ANSWERED IN EVERY DRAFT, AND IT CARRIES A CEILING.
    // Before: the section appeared only when a shaped piece existed, so "do I
    // need interfacing?" simply went unanswered on the most common draft of all
    // (a plain dress). "No" is an answer and it saves the buyer a purchase.
    // The ceiling is NMSU C208's rule ("select an interfacing that is the same
    // weight or lighter") turned into this bolt's own number.
    if (facingPieces > 0) {
        add("sew.interfacing",
            "Interfacing: this draft has " + num(facingPieces) +
                " shaped piece(s) that hold a shape (facing, collar, band or cuff). Fuse "
                "an interfacing to each one — without it they roll to the outside no matter "
                "how well they are sewn." +
                (gsm > 0.0
                     ? " Weight ceiling: the same as the cloth or lighter, so at most " +
                           num(gsm, 1) +
                           " g/m2. A heavier interfacing takes the garment over and the piece "
                           "stops looking like the fabric you chose."
                     : std::string(" Weight ceiling: the same as the cloth or lighter — this "
                                   "fabric has no declared g/m2, so weigh a 10 cm x 10 cm swatch "
                                   "(grams x 100 = g/m2) and stay at or under that number.")),
            "source:nmsu-c208;computed:facingPieces=" + num(facingPieces) +
                (gsm > 0.0 ? ";weightGSM=" + num(gsm, 1) + ";birim=g/m2"
                           : std::string(";weightDeclared=0;swatchCM=10;gsmFactor=100;birim=g/m2")));
    } else {
        add("sew.interfacing",
            "Interfacing: none, and that is measured, not skipped. This draft has " +
                num(facingPieces) +
                " pieces of the kind that carry interfacing (facing, collar, band, cuff, "
                "placket, waistband) — the shapes are held by seams and darts here. Do not "
                "buy any.",
            "source:nmsu-c208;computed:facingPieces=" + num(facingPieces));
    }

    // ⭐ M5-rehber — ÖN YIKAMA. The number is not borrowed from a shrinkage
    // table (none was found with a citation for these five bolts): it is this
    // pattern's OWN arithmetic. The draft knows the bust it was cut to and the
    // chart knows its own smallest step, so the question "how much shrink costs
    // me a whole size" has an exact answer for THIS garment, and it is small.
    if (bustCM > 0.0 && sizeStepCM > 0.0) {
        const double pct = 100.0 * sizeStepCM / bustCM;
        add("prep.prewash",
            "Prewash before you cut. This pattern was drafted to a " + num(bustCM, 1) +
                " cm bust, and the smallest step in the size chart it grades on is " +
                num(sizeStepCM, 1) + " cm. So a crosswise shrink of just " + num(pct, 1) +
                "% (" + num(sizeStepCM, 1) +
                " cm) puts the finished garment a whole size down — that is how little it "
                "takes. Wash and dry the cloth exactly the way you will wash the finished "
                "garment, then press it, then cut. After cutting there is nothing to do "
                "about it.",
            "computed:bustCM=" + num(bustCM, 1) + ";sizeStepCM=" + num(sizeStepCM, 1) +
                ";oneSizeShrinkPct=" + num(pct, 1));
    } else {
        add("prep.prewash",
            "Prewash before you cut: wash and dry the cloth the way you will wash the "
            "finished garment. I cannot tell you how much shrink costs you a size here, "
            "because this draft came without a bust measurement to compare against. Next "
            "step: draft to a size from the chart and this sentence gets its number.",
            "computed:bustCM=" + num(bustCM, 1) + ";sizeStepCM=" + num(sizeStepCM, 1));
    }

    // 8 — CUT PLAN + YARDAGE, straight off the draft's own estimate. F6: the
    // yardage now follows the DECLARED bolt width — a narrower bolt needs more
    // length for the same pieces, which is arithmetic, not a table.
    const double widthCM = axis.widthDeclared() ? axis.widthCM : FabricBand::kRefWidthCM;
    const double meters = FabricBand::metersAtWidth(pattern.fabricMeters140, axis);

    // ⭐ M4-edge — DAR TOP ENİ + BÜYÜK PARÇA. THE METRE COUNT ABOVE IS PURE
    // ARITHMETIC (metersAtWidth = m140 * 140/width): it scales LENGTH and has
    // never once asked whether a piece FITS ACROSS the bolt. Measured
    // 2026-09-03 over the five shipped bolts (web/js/fabric-catalog.js) x
    // 4 sizes x 6 skirt styles x 3 lengths: **37 combinations draft a piece
    // WIDER THAN THE BOLT** and the guide printed a metre count anyway —
    // e.g. cotton-velveteen (106.7 cm, a real catalog entry) + EU48 pleated
    // skirt = a 1492 mm front panel on a 1067 mm bolt. The buyer buys the
    // fabric, lays out the paper, and finds out at the cutting table.
    //
    // The PATTERN is not wrong and is NOT blocked — it sews perfectly from a
    // wider bolt. What was wrong is the SENTENCE. So the sentence refuses BY
    // NAME and carries the next step (RULES invariant 1 + M4-edge: no silent
    // default, no dead end).
    //
    // Cross-grain extent, conservatively: the CUT line (falls back to the sewing
    // line only when a strip piece carries none), control points included (the
    // control polygon contains the curve, so this can over- but never
    // under-report). An on-fold piece is mirrored about its fold line, so it
    // needs TWICE its distance from that fold.
    double widestMM = 0.0;
    std::string widestName;
    for (const PatternPiece& p : pattern.pieces) {
        const std::vector<PathCommand>& path = p.cutLine.empty() ? p.commands : p.cutLine;
        if (path.empty()) continue;
        double lo = 0, hi = 0;
        bool seen = false;
        const auto eat = [&](const Point& q) {
            if (!seen) { lo = hi = q.x; seen = true; return; }
            lo = std::min(lo, q.x); hi = std::max(hi, q.x);
        };
        for (const PathCommand& c : path) {
            if (c.type == CmdType::Close) continue;
            eat(c.to);
            if (c.type == CmdType::Curve) { eat(c.cp1); eat(c.cp2); }
        }
        if (!seen) continue;
        double need = hi - lo;
        if (p.onFold) {
            // The fold line is the mirror edge; without an explicit one the
            // convention is x = 0 (geometry.hpp foldLine).
            double foldX = 0.0;
            if (!p.foldLine.empty()) foldX = p.foldLine.front().to.x;
            need = 2.0 * std::max(hi - foldX, foldX - lo);
        }
        if (need > widestMM) { widestMM = need; widestName = p.name; }
    }
    // ⛔ ONE ID, TWO SENTENCES — ON PURPOSE. `cut.yardage` is a REQUIRED section
    // (guide_completeness_check kRequired): a draft that simply DROPPED it when
    // the bolt is too narrow would trade a wrong sentence for a missing one.
    // The subject is the same ("what fabric do I buy"), so the id is the same
    // and the ANSWER changes. `fitsBolt=0` in the basis is how a machine (and
    // edge_case_supurme_check) tells a refusal from an advice.
    const double boltMM = widthCM * 10.0;
    const bool fitsBolt = !axis.widthDeclared() || widestMM <= boltMM;
    if (!fitsBolt) {
        add("cut.yardage",
            "I cannot give you a metre count for this bolt: the widest piece (" +
                widestName + ") is " + num(widestMM, 0) + " mm across the grain and your "
                "fabric is only " + num(boltMM, 0) + " mm wide, so that piece does not fit "
                "on it at any length. Next step: use a bolt at least " +
                num(widestMM / 10.0, 0) + " cm wide, or pick a narrower skirt/bodice style "
                "— the pattern itself is sewable, only this fabric is too narrow for it.",
            "computed:fitsBolt=0;widestPieceMM=" + num(widestMM, 0) + ";widestPiece=" +
                widestName + ";boltMM=" + num(boltMM, 0) + ";neededWidthCM=" +
                num(widestMM / 10.0, 0));
    } else {
        add("cut.yardage",
            "Fabric: " + num(meters, 1) + " m at " + num(widthCM, 0) +
                " cm wide, folded lengthwise. Buy a little over if your fabric has "
                "a nap or a one-way print.",
            "computed:fitsBolt=1;fabricMeters140=" + num(pattern.fabricMeters140, 1) +
                ";widthCM=" + num(widthCM, 0) + ";metersAtWidth=" + num(meters, 1) +
                ";refWidthCM=" + num(FabricBand::kRefWidthCM, 0) +
                ";widestPieceMM=" + num(widestMM, 0));
    }
    add("cut.pieces",
        "Cut plan: " + num(static_cast<int>(pattern.pieces.size())) + " pattern piece(s), " +
            num(onFold) + " of them on the fabric fold. Follow each piece's own cut note.",
        "computed:pieces=" + num(static_cast<int>(pattern.pieces.size())) + ";onFold=" + num(onFold));

    // 9 — PÜF NOKTALAR, every one measured off THIS pattern's geometry.
    if (notches > 0) {
        add("tip.notches",
            "Worth knowing: there are " + num(notches) +
                " notch marks on these pieces and not one of them is decoration — each is "
                "a point where two edges have to meet. Snip them 3 mm into the seam "
                "allowance as you cut, before you move the paper.",
            "computed:notches=" + num(notches) + ";snipMM=3");
    }
    if (!pattern.pieces.empty()) {
        add("tip.seamAllowance",
            "Worth knowing: the outer line on every piece is the CUT line and the inner one is "
            "the SEW line, " + num(pattern.pieces.front().seamAllowance, 1) +
                " mm apart. Sew on the inner line or the whole garment comes out that much "
                "bigger at every seam.",
            "computed:seamAllowanceMM=" + num(pattern.pieces.front().seamAllowance, 1));
    }
    if (longestMM > 0) {
        add("tip.longestPiece",
            "Worth knowing: the largest piece is '" + longestName + "', " + num(longestMM, 0) +
                " mm across. Check that your table and your fabric width take it before "
                "you start pinning.",
            "computed:longestMM=" + num(longestMM, 0) + ";piece=" + longestName);
    }
    if (chestEase < 0) {
        add("tip.negativeEase",
            "Worth knowing: this pattern is deliberately " + num(-chestEase * 100.0, 1) +
                "% SMALLER than your bust. That is not an error — the fabric is meant to "
                "stretch onto the body. Do not add it back when you cut.",
            "computed:negativeEasePct=" + num(-chestEase * 100.0, 1));
    }
    if (FabricBand::dartsDropOut(axis)) {
        add("tip.dartsDropOut",
            "Worth knowing: above " + num(FabricBand::kSuperMinPct, 0) +
                "% stretch the published rule drops the bust dart — the fabric absorbs the "
                "shaping. This engine does not remove it yet; if you are using a super-"
                "stretch knit, sew the dart shallower or leave it out and check the fit.",
            "computed:superMinPct=" + num(FabricBand::kSuperMinPct, 0));
    }

    // ── 10 — BU GİYSİNİN BU KUMAŞTAKİ ZOR NOKTALARI (M5-rehber) ─────────────
    //
    // Damla, madde 10: "bu giysinin bu kumaştaki üç zor noktası — ölçülen
    // sayıyla." Not tips in general: the places where THIS draft, on THIS bolt,
    // has already gone past the number that makes a step hard. Every candidate
    // below is measured off the finished pieces and carries a dimensionless
    // limit ratio, so they can be ordered and the order can be checked. Only
    // the ones that are MEASURABLE on this draft are built (a skirt has no
    // sleeve cap, so it has no cap-ease point — an absent measurement is
    // absent, never filled in).
    {
        std::vector<HardPoint> hp;

        // (a) CAP EASE — the classic one. The sleeve head is longer than the
        // hole it goes into, and the difference has to be eased in without a
        // pleat. Measured: the sleeve_cap edge against the armhole edges of the
        // bodice, both on the SEWING line, both from the drafted geometry.
        double capMM = 0.0, armMM = 0.0;
        int capEdges = 0, armEdges = 0;
        for (const PatternPiece& p : pattern.pieces) {
            for (const EdgeRole& r : p.edgeRoles) {
                if (r.role == "sleeve_cap") { capMM += edgeLengthOf(p, r); capEdges++; }
                else if (r.role.rfind("armhole", 0) == 0) { armMM += edgeLengthOf(p, r); armEdges++; }
            }
        }
        if (capEdges > 0 && armEdges > 0 && armMM > 1.0) {
            const double easeMM = capMM - armMM;
            const double easePct = 100.0 * easeMM / armMM;
            hp.push_back({1.0 + std::fabs(easeMM) / armMM, "zor.capEase",
                          "Hard spot — sleeve cap ease: the sleeve cap measures " +
                              num(capMM, 1) + " mm and the armhole it goes into measures " +
                              num(armMM, 1) + " mm, so " + num(std::fabs(easeMM), 1) + " mm (" +
                              num(std::fabs(easePct), 1) + "%) " +
                              (std::fabs(easeMM) < 1.0
                                   ? "apart: they MATCH. Nothing to ease in — pin notch to notch "
                                     "and sew. If you find fullness at the machine, you have "
                                     "stretched one of the two curves handling it; press it back "
                                     "rather than pleating it away."
                                   : (easeMM > 0
                                          ? "of cap has to disappear into the armhole. That "
                                            "fullness collects between the cap notches: run two "
                                            "rows of long stitches there, draw them up until the "
                                            "cap matches the armhole, and distribute it before you "
                                            "pin — pinned first, it becomes a pleat."
                                          : "of armhole is LONGER than the cap. Do not stretch the "
                                            "cap to reach: ease the ARMHOLE onto it between the "
                                            "notches, or the shoulder will pull.")),
                          "computed:capMM=" + num(capMM, 1) + ";armholeMM=" + num(armMM, 1) +
                              ";capEaseMM=" + num(std::fabs(easeMM), 1) + ";capEasePct=" +
                              num(std::fabs(easePct), 1) + ";capEdges=" + num(capEdges) +
                              ";armholeEdges=" + num(armEdges)});
        }

        // (b) CLIPPING — the tightest curve on the paper against the seam
        // allowance that has to lie flat inside it. Ratio > 1 means the
        // allowance is wider than the radius it is turning through: it CANNOT
        // lie flat unclipped. This is geometry, not taste.
        //
        // ⚠ MEASURED ON `commands`, THE SEWING LINE — NOT on cutLine. The cut
        // line is emitted already FLATTENED to straight segments, so it carries
        // no curvature at all and the first version of this point silently
        // never fired (candidates=3, and the clipping one was missing from all
        // five bolts). The allowance is folded inside the SEWN curve anyway, so
        // the sewing line is also the right line to ask.
        double tightR = -1.0, tightSA = 0.0;
        std::string tightName;
        for (const PatternPiece& p : pattern.pieces) {
            if (p.cutLine.empty()) continue;   // a strip cut to a note has no drafted curve
            const double r = minCurveRadiusMM(p.commands);
            if (r > 0.0 && (tightR < 0.0 || r < tightR)) {
                tightR = r; tightName = p.name; tightSA = p.seamAllowance;
            }
        }
        const double saMM = pattern.pieces.empty() ? 0.0 : pattern.pieces.front().seamAllowance;
        if (tightR > 0.0 && tightSA > 0.0) {
            const double saCurve = tightSA;
            hp.push_back({saCurve / tightR, "zor.clip",
                          "Hard spot — clipping: the tightest curve in this pattern "
                          "is on '" + tightName + "', radius " + num(tightR, 1) +
                              " mm, and the seam allowance you have to fold inside it is " +
                              num(saCurve, 1) + " mm. " +
                              (saCurve / tightR >= 1.0
                                   ? "The allowance is WIDER than the curve it turns through, so it "
                                     "physically cannot lie flat: clip into it (stopping 2 mm short "
                                     "of the stitch line) before you turn the piece, or the seam "
                                     "will pucker and no amount of pressing will fix it."
                                   : "The allowance still fits inside the curve, but only just — "
                                     "clip it if the pressed seam pulls.") +
                              " Ratio allowance/radius = " + num(saCurve / tightR, 2) + ".",
                          "computed:tightRadiusMM=" + num(tightR, 1) + ";piece=" + tightName +
                              ";seamAllowanceMM=" + num(saCurve, 1) + ";clipStopMM=2;ratio=" +
                              num(saCurve / tightR, 2)});
        }

        // (c) BOLT ROOM — how much spare width is left across the grain once
        // the widest piece is laid down. This is the difference between a calm
        // cutting table and finding out at the fold.
        if (axis.widthDeclared() && widestMM > 0.0) {
            const double sparMM = boltMM - widestMM;
            hp.push_back({widestMM / boltMM, "zor.boltRoom",
                          "Hard spot — bolt width: the widest piece is '" + widestName + "' at " +
                              num(widestMM, 0) + " mm across the grain and your bolt is " +
                              num(boltMM, 0) + " mm wide, which leaves " + num(sparMM, 0) +
                              " mm of spare width" +
                              (sparMM < 0.0
                                   ? " — that is NEGATIVE, the piece does not fit and no layout "
                                     "saves it."
                                   : (sparMM < 100.0
                                          ? " — under 100 mm, so lay this piece FIRST and square "
                                            "the fabric before anything else; a crooked grain here "
                                            "costs you the piece."
                                          : ". There is room; lay the widest piece first anyway.")) +
                              " Ratio piece/bolt = " + num(widestMM / boltMM, 2) + ".",
                          "computed:widestPieceMM=" + num(widestMM, 0) + ";widestPiece=" +
                              widestName + ";boltMM=" + num(boltMM, 0) + ";spareMM=" +
                              num(sparMM, 0) + ";tightSpareMM=100;ratio=" +
                              num(widestMM / boltMM, 2)});
        }

        // (d) SMALL PIECES — when two seam allowances on opposite sides of a
        // piece are together wider than the piece, there is no flat middle left
        // and the piece has to be handled differently. Ratio = 2*SA / smallest
        // dimension.
        double smallDim = -1.0, smallSA = 0.0;
        std::string smallName;
        for (const PatternPiece& p : pattern.pieces) {
            // A binding/strip piece is cut to a WRITTEN note (its cutInstruction
            // carries every allowance already) and is not laid out as a shape,
            // so it is not a "small piece" difficulty. It also carries its own
            // 6 mm allowance, not the bodice's 15 mm -- charging it the bodice
            // number made a bias binding look like the hardest thing in the box
            // on all five bolts.
            if (p.bitirme || p.cutLine.empty()) continue;
            const Rect box = boundingBox(p.commands);
            const double d = std::min(box.width, box.height);
            if (d > 0.1 && (smallDim < 0.0 || d < smallDim)) {
                smallDim = d; smallName = p.name; smallSA = p.seamAllowance;
            }
        }
        if (smallDim > 0.0 && smallSA > 0.0) {
            const double saSmall = smallSA;
            hp.push_back({2.0 * saSmall / smallDim, "zor.smallPiece",
                          "Hard spot — small piece: the smallest cut piece is '" + smallName +
                              "', " + num(smallDim, 0) + " mm across its narrow side, and it "
                              "carries a " + num(saSmall, 1) +
                              " mm allowance on each side — " + num(2.0 * saSmall, 1) +
                              " mm of the " + num(smallDim, 0) + " mm is allowance. " +
                              (2.0 * saSmall / smallDim >= 1.0
                                   ? "That leaves NO fabric between the two stitch lines: sew this "
                                     "piece to its neighbour before you trim, never after."
                                   : "Keep the paper on it until the moment you sew — small pieces "
                                     "are the ones that get cut a size off.") +
                              " Ratio allowances/width = " + num(2.0 * saSmall / smallDim, 2) + ".",
                          "computed:smallestDimMM=" + num(smallDim, 0) + ";piece=" + smallName +
                              ";seamAllowanceMM=" + num(saSmall, 1) + ";allowancesMM=" +
                              num(2.0 * saSmall, 1) + ";ratio=" + num(2.0 * saSmall / smallDim, 2)});
        }

        // Hardest first, by each point's own limit ratio. THREE are printed —
        // the card asks for three, and a list of everything is a list of
        // nothing. The summary says how many were measured, so a fourth one
        // that lost is not hidden, it is counted.
        std::stable_sort(hp.begin(), hp.end(),
                         [](const HardPoint& a, const HardPoint& b) { return a.ratio > b.ratio; });
        const int shown = static_cast<int>(std::min<size_t>(3, hp.size()));
        if (!hp.empty()) {
            add("zor.ozet",
                "Hard spots: " + num(static_cast<int>(hp.size())) +
                    " difficulties were measured on this pattern in this fabric and the " +
                    num(shown) +
                    " hardest are printed below, ordered by how far each one has gone past its "
                    "own limit (1.00 would mean nothing to do). They are the places this "
                    "particular garment fights back — not general sewing advice.",
                "computed:candidates=" + num(static_cast<int>(hp.size())) + ";shown=" + num(shown) +
                    ";neutralRatio=1.00");
        }
        for (int i = 0; i < shown; ++i) add(hp[i].id.c_str(), hp[i].text, hp[i].basis);
    }

    return out;
}

}  // namespace rehber
}  // namespace stitchu
