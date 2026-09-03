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
#include <cstdio>
#include <string>
#include <vector>

#include "fabricease.hpp"
#include "geometry.hpp"
#include "measurements.hpp"

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

inline std::vector<GuideAdvice> build(const DraftedPattern& pattern, const FabricAxis& axis) {
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

    // 3 — NEEDLE. UNL "Sewing With Knits" (knowledge/stitchu.db fabrics row 5).
    if (knit) {
        add("sew.needle",
            "Needle: ballpoint / stretch, 75/11 to 80/12. A sharp needle cuts the knit "
            "loops and the seam runs like a ladder.",
            "source:unl-knits");
    } else {
        add("sew.needle",
            "Needle: universal 80/12 for a medium woven; go finer for a light silk or "
            "satin and heavier for a canvas.",
            "source:nmsu-g401");
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
    if (facingPieces > 0) {
        add("sew.interfacing",
            "Tela / interfacing: this draft has " + num(facingPieces) +
                " shaped piece(s) that hold a shape (facing, collar, band or cuff). Fuse "
                "a lightweight interfacing to each one — without it they roll to the "
                "outside no matter how well they are sewn.",
            "computed:facingPieces=" + num(facingPieces));
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
            "Püf nokta: there are " + num(notches) +
                " notch marks on these pieces and not one of them is decoration — each is "
                "a point where two edges have to meet. Snip them 3 mm into the seam "
                "allowance as you cut, before you move the paper.",
            "computed:notches=" + num(notches) + ";snipMM=3");
    }
    if (!pattern.pieces.empty()) {
        add("tip.seamAllowance",
            "Püf nokta: the outer line on every piece is the CUT line and the inner one is "
            "the SEW line, " + num(pattern.pieces.front().seamAllowance, 1) +
                " mm apart. Sew on the inner line or the whole garment comes out that much "
                "bigger at every seam.",
            "computed:seamAllowanceMM=" + num(pattern.pieces.front().seamAllowance, 1));
    }
    if (longestMM > 0) {
        add("tip.longestPiece",
            "Püf nokta: the largest piece is '" + longestName + "', " + num(longestMM, 0) +
                " mm across. Check that your table and your fabric width take it before "
                "you start pinning.",
            "computed:longestMM=" + num(longestMM, 0) + ";piece=" + longestName);
    }
    if (chestEase < 0) {
        add("tip.negativeEase",
            "Püf nokta: this pattern is deliberately " + num(-chestEase * 100.0, 1) +
                "% SMALLER than your bust. That is not an error — the fabric is meant to "
                "stretch onto the body. Do not add it back when you cut.",
            "computed:negativeEasePct=" + num(-chestEase * 100.0, 1));
    }
    if (FabricBand::dartsDropOut(axis)) {
        add("tip.dartsDropOut",
            "Püf nokta: above " + num(FabricBand::kSuperMinPct, 0) +
                "% stretch the published rule drops the bust dart — the fabric absorbs the "
                "shaping. This engine does not remove it yet; if you are using a super-"
                "stretch knit, sew the dart shallower or leave it out and check the fit.",
            "computed:superMinPct=" + num(FabricBand::kSuperMinPct, 0));
    }

    return out;
}

}  // namespace rehber
}  // namespace stitchu
