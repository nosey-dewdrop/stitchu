// fabric_catalog_check — KAPI (F6, 2026-08-27; F4-kumas 2026-09-01: the catalog
// became the FIVE sourced fabrics of GIRDI/kumaslar.md and every unmeasured
// field became null+OLCULMEDI instead of an invented number).
//
// CLAIM UNDER TEST: aynı spec, katalogdaki BEŞ kumaş, ölçülebilir farklı kalıp.
// Fark bir cümle değil bir SAYI. This gate drafts ONE spec on every fabric
// contract/fabric-catalog-v1.json names, prints bel / kol oyuğu / büzgü /
// metraj in mm and m for each, and refuses to pass if the catalog and the
// engine ever stop saying the same thing.
//
// The catalog is READ, not restated: here the catalog is the LAW and the
// engine is the thing being audited against it.
//
// LEGS
//   1  THE CATALOG PARSES and carries its provenance blocks. A catalog whose
//      `_olcum_kunyesi` / `_yayin_bulunamadi` blocks are gone is a catalog
//      that has started claiming publications it does not have.
//   2  THE PUBLISHED THRESHOLDS AGREE: the referee's recovery/growth minimums
//      in the JSON are the same three numbers fabricease.hpp clamps on.
//   3  DRAPE IS HONEST: none of the five bolts has a published bending length,
//      so the catalog must say null and the axis must compute NO rigidity —
//      an invented drape number here is exactly what the card forbids.
//   4  FIVE DRAFTS, MEASURED. The knit must be measurably smaller than a woven
//      in bel, kol oyuğu and büzgü; yardage must follow bolt width among the
//      equal-area wovens.
//   5  RECOVERY REALLY BITES. The jersey with a declared failing recovery must
//      lose its negative ease.
//   6  WIDTH ARITHMETIC and the reference width no-op.
//   7  FIVE REHBERS: no drape sentence without a measured input, recovery
//      sentence follows declaration, yardage quotes each bolt's own width.
//   8  THE BROWSER'S COPY MAY NOT DRIFT.
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>

#include "../src/bodice.hpp"
#include "../src/fabricease.hpp"
#include "../src/garment.hpp"
#include "../src/geometry.hpp"
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
static void ok() { checked++; }

static std::string slurp(const std::string& path) {
    std::ifstream in(path);
    if (!in) return {};
    std::ostringstream ss;
    ss << in.rdbuf();
    return ss.str();
}

// ── hand JSON reader ────────────────────────────────────────────────────────
// The engine has no JSON parser and pulling one in for a gate would be a bigger
// change than the gate (the same call guide_completeness_check made). These two
// helpers read a numeric field inside a named object, and report NOT FOUND rather
// than defaulting to 0 — a silently defaulted threshold is how a contract dies.
static bool objectSpan(const std::string& doc, const std::string& key, size_t& begin, size_t& end) {
    const size_t k = doc.find("\"" + key + "\": {");
    if (k == std::string::npos) return false;
    const size_t open = doc.find('{', k);
    int depth = 0;
    for (size_t i = open; i < doc.size(); ++i) {
        if (doc[i] == '{') depth++;
        else if (doc[i] == '}') {
            depth--;
            if (depth == 0) { begin = open; end = i; return true; }
        }
    }
    return false;
}

// Returns false when the field is absent OR json-null; `isNull` distinguishes.
static bool numberIn(const std::string& doc, size_t begin, size_t end, const std::string& field,
                     double& out, bool& isNull) {
    isNull = false;
    const size_t k = doc.find("\"" + field + "\":", begin);
    if (k == std::string::npos || k > end) return false;
    size_t p = doc.find(':', k) + 1;
    while (p < end && (doc[p] == ' ' || doc[p] == '\t')) p++;
    if (doc.compare(p, 4, "null") == 0) { isNull = true; return false; }
    try {
        out = std::stod(doc.substr(p, 40));
    } catch (...) {
        return false;
    }
    return true;
}

struct CatalogFabric {
    std::string id;
    std::string ad;
    std::string sinif;
    double stretchPct = -1, stretchLengthwisePct = -1;
    double recovery15sPct = -1, recovery30minPct = -1, growthPct = -1;
    double weightGSM = -1, bendingLengthMM = -1, widthCM = -1, bendingRigidityUNm = -1;
};

static FabricAxis axisOf(const CatalogFabric& c) {
    FabricAxis f(c.sinif == "Fabric::Knit" ? Fabric::Knit : Fabric::Woven, c.stretchPct);
    f.recovery15sPct = c.recovery15sPct;
    f.recovery30minPct = c.recovery30minPct;
    f.growthPct = c.growthPct;
    f.weightGSM = c.weightGSM;
    f.bendingLengthMM = c.bendingLengthMM;
    f.widthCM = c.widthCM;
    return f;
}

// ── the ONE spec, drafted three times ───────────────────────────────────────
// A dress with a sleeve (so there is a kol oyuğu) and a gathered skirt (so there
// is a büzgü). Everything except `fabric` is frozen across the three draws.
static GarmentSpec theSpec() {
    GarmentSpec s;
    s.garment = GarmentType::Dress;
    s.shaping = Shaping::Dart;
    s.skirtStyle = SkirtStyle::Gathered;
    s.skirtLength = SkirtLength::Midi;
    s.sleeveStyle = SleeveStyle::Straight;
    s.sleeveLength = SleeveLength::Short;
    s.neckline = Neckline::Crew;
    return s;
}

struct Measured {
    double waistMM = 0;     // bel — drafted bodice waist girth
    double armholeMM = 0;   // kol oyuğu — one arm, front + back, sewing line
    double gatherMM = 0;    // büzgü — the gathered skirt's cut top edge
    double meters = 0;      // metraj at THIS fabric's own bolt width
    int pieces = 0;
};

static Measured measure(const FabricAxis& f, const BodyMeasurementsSnapshot& m) {
    Measured out;
    BodiceBlock::BodiceOptions o;
    o.shaping = Shaping::Dart;
    o.fabric = f;
    const BodiceDraft d = BodiceBlock::draft(m, o);
    out.waistMM = 2.0 * (d.frontStraightWaist + d.backStraightWaist);
    // The bodice's own measured armhole (one arm, front half + back half, sewing
    // line) — the same quantity the sleeve is fitted against.
    out.armholeMM = d.armholeLength;

    GarmentSpec s = theSpec();
    s.fabric = f;
    const DraftedPattern p = GarmentDrafter::draft(s, m);
    out.pieces = static_cast<int>(p.pieces.size());
    out.meters = FabricBand::metersAtWidth(p.fabricMeters140, f);
    // The gathered skirt panel's cut width IS the gathered edge: it is the length
    // of cloth that gets pulled up onto the waist seam.
    for (const auto& piece : p.pieces) {
        if (piece.name.find("Skirt") == std::string::npos) continue;
        const Rect box = boundingBox(piece.commands);
        if (box.width > out.gatherMM) out.gatherMM = box.width;
    }
    return out;
}

int main() {
    std::printf("fabric_catalog_check: one spec, five fabrics, measured patterns\n");
    const std::string root = STITCHU_REPO_ROOT;
    const std::string doc = slurp(root + "/contract/fabric-catalog-v1.json");
    if (doc.empty()) {
        std::printf("  [FAIL] contract/fabric-catalog-v1.json is missing or empty\n");
        return 1;
    }

    // ── LEG 1: the provenance blocks are still there ────────────────────────
    for (const char* must : {"_olcum_kunyesi", "_yayin_bulunamadi", "drape_rule",
                             "recovery_rule", "width_rule", "astm-d3107", "fast-2",
                             /* F6 referee K63 */ "esikler_hakem_karari", "esik_vermez",
                             /* F6 referee K62 */ "_hakem_karari",
                             /* F4-kumas: sourced formula + ceilings + refusal */
                             "negative_ease_rule", "dusuk_recovery", "stretch_etiket",
                             "kaynak", "OLCULMEDI"}) {
        if (doc.find(must) == std::string::npos)
            fail(std::string("catalog has lost the block '") + must +
                 "' — every number in it would then be an unattributed number");
        else ok();
    }

    // ── LEG 2: the published thresholds are the SAME on both sides ──────────
    size_t b = 0, e = 0;
    if (!objectSpan(doc, "esikler", b, e)) {
        fail("catalog has no `esikler` block — the referee's recovery/growth floor (K63) is unstated");
    } else {
        struct { const char* field; double engine; } t[] = {
            {"growthMaxPct", FabricBand::kGrowthMaxPct},
            {"recovery15sMinPct", FabricBand::kRecovery15sMinPct},
            {"recovery30minMinPct", FabricBand::kRecovery30minMinPct},
        };
        for (const auto& row : t) {
            double v = 0; bool isNull = false;
            if (!numberIn(doc, b, e, row.field, v, isNull)) {
                fail(std::string("catalog `esikler` is missing ") + row.field);
            } else if (std::fabs(v - row.engine) > 1e-9) {
                char buf[192];
                std::snprintf(buf, sizeof buf,
                              "%s: catalog says %.4f, fabricease.hpp clamps on %.4f — "
                              "the contract and the engine have drifted",
                              row.field, v, row.engine);
                fail(buf);
            } else ok();
        }
    }

    // ── read the five fabrics (GIRDI/kumaslar.md, F4-kumas) ─────────────────
    const char* kIds[5] = {"viscose-crepe", "cotton-modal-jersey", "viscose-challis",
                           "cotton-lawn", "cotton-velveteen"};
    std::vector<CatalogFabric> fabrics;
    for (const char* id : kIds) {
        size_t fb = 0, fe = 0;
        if (!objectSpan(doc, id, fb, fe)) {
            fail(std::string("catalog has no fabric '") + id + "'");
            continue;
        }
        CatalogFabric c;
        c.id = id;
        const size_t sk = doc.find("\"sinif\":", fb);
        if (sk != std::string::npos && sk < fe) {
            const size_t q1 = doc.find('"', doc.find(':', sk) + 1);
            const size_t q2 = doc.find('"', q1 + 1);
            c.sinif = doc.substr(q1 + 1, q2 - q1 - 1);
        }
        struct { const char* field; double* slot; bool required; } rows[] = {
            {"stretchPct", &c.stretchPct, true},
            {"stretchLengthwisePct", &c.stretchLengthwisePct, true},
            {"recovery15sPct", &c.recovery15sPct, false},
            {"recovery30minPct", &c.recovery30minPct, false},
            {"growthPct", &c.growthPct, false},
            {"weightGSM", &c.weightGSM, true},
            // OLCULMEDI for all five bolts (no published D1388) — null, never a
            // number nobody measured. LEG 3 asserts the honesty.
            {"bendingLengthMM", &c.bendingLengthMM, false},
            {"widthCM", &c.widthCM, true},
            {"bendingRigidityUNm", &c.bendingRigidityUNm, false},
        };
        for (const auto& r : rows) {
            double v = 0; bool isNull = false;
            if (numberIn(doc, fb, fe, r.field, v, isNull)) *r.slot = v;
            else if (r.required && !isNull)
                fail(std::string(id) + ": the catalog does not carry `" + r.field + "`");
        }
        fabrics.push_back(c);
    }
    if (fabrics.size() != 5) {
        std::printf("  [FAIL] the catalog must name exactly five fabrics; read %zu\n", fabrics.size());
        return 1;
    }
    // The one knit and a woven baseline, found by class, not by index.
    int knitIdx = -1, wovenIdx = -1;
    for (size_t i = 0; i < fabrics.size(); ++i) {
        if (fabrics[i].sinif == "Fabric::Knit" && knitIdx < 0) knitIdx = static_cast<int>(i);
        if (fabrics[i].sinif == "Fabric::Woven" && wovenIdx < 0) wovenIdx = static_cast<int>(i);
    }
    if (knitIdx < 0 || wovenIdx < 0) {
        std::printf("  [FAIL] the catalog must carry at least one knit and one woven\n");
        return 1;
    }

    // ── LEG 3: DRAPE IS HONEST — no measured input, no invented rigidity ────
    // None of the five bolts has a published bending length (ASTM D1388 —
    // GIRDI/kumaslar.md documents the search). So the catalog must carry null,
    // the axis must refuse to compute a rigidity, and if a bending length IS
    // ever measured and added, the written rigidity must be FAST-2 of the
    // inputs, not a copied table value.
    for (const auto& c : fabrics) {
        const FabricAxis f = axisOf(c);
        const double br = f.bendingRigidityUNm();
        if (c.bendingLengthMM < 0) {
            if (br >= 0) fail(c.id + ": bending length is OLCULMEDI but the axis computes a rigidity");
            else if (c.bendingRigidityUNm >= 0)
                fail(c.id + ": catalog writes a rigidity with no measured bending length — an unsourced number");
            else ok();
            continue;
        }
        if (br < 0) { fail(c.id + ": drape inputs declared but no rigidity computed"); continue; }
        if (std::fabs(br - c.bendingRigidityUNm) > 5e-4) {
            char buf[224];
            std::snprintf(buf, sizeof buf,
                          "%s: FAST-2 on (%.1f g/m2, %.1f mm) gives %.6f uNm, catalog says %.6f",
                          c.id.c_str(), c.weightGSM, c.bendingLengthMM, br, c.bendingRigidityUNm);
            fail(buf);
        } else ok();
    }

    // ── LEG 4: three drafts, measured, printed ──────────────────────────────
    const SizeChartEntry* eu38 = euSize("EU38");
    if (!eu38) { std::printf("  [FAIL] size chart has no EU38\n"); return 1; }
    const BodyMeasurementsSnapshot m = eu38->body;

    std::printf("\n  AYNI SPEC, BES KUMAS (EU38, dart-shaped gathered dress, straight sleeve)\n");
    std::printf("  %-16s %10s %10s %10s %8s %6s %10s\n",
                "kumas", "bel(mm)", "oyuk(mm)", "buzgu(mm)", "metraj", "parca", "rijitlik");
    std::vector<Measured> got;
    for (const auto& c : fabrics) {
        const FabricAxis f = axisOf(c);
        const Measured x = measure(f, m);
        got.push_back(x);
        std::printf("  %-16s %10.4f %10.4f %10.4f %8.1f %6d %10.4f\n", c.id.c_str(), x.waistMM,
                    x.armholeMM, x.gatherMM, x.meters, x.pieces, f.bendingRigidityUNm());
    }
    // Deltas against the first fabric, in mm — the card asks for a NUMBER, and
    // "0.0000" is a number too. It is printed rather than hidden.
    std::printf("\n  FARK (kumas 1 = %s):\n", fabrics[0].id.c_str());
    for (size_t i = 1; i < got.size(); ++i) {
        std::printf("  %-16s bel %+10.4f  oyuk %+10.4f  buzgu %+10.4f  metraj %+6.1f\n",
                    fabrics[i].id.c_str(), got[i].waistMM - got[0].waistMM,
                    got[i].armholeMM - got[0].armholeMM, got[i].gatherMM - got[0].gatherMM,
                    got[i].meters - got[0].meters);
    }
    std::printf("\n");

    // The gate: the three cannot all be the same object. It does NOT demand that
    // every column separate — the catalog's `drape_rule` records, with the search
    // that failed, why two 0%-stretch wovens still share a bel and a kol oyuğu.
    bool anyDifferent = false;
    for (size_t i = 1; i < got.size(); ++i) {
        if (std::fabs(got[i].waistMM - got[0].waistMM) > 1e-6 ||
            std::fabs(got[i].armholeMM - got[0].armholeMM) > 1e-6 ||
            std::fabs(got[i].gatherMM - got[0].gatherMM) > 1e-6 ||
            std::fabs(got[i].meters - got[0].meters) > 1e-9)
            anyDifferent = true;
    }
    if (!anyDifferent)
        fail("all three fabrics produced the SAME pattern and the SAME yardage — "
             "the fabric axis does not reach the object the buyer downloads");
    else ok();

    // The knit MUST separate from the wovens on the sourced axis: it declares
    // 50% stretch (class-typical band floor), so its bel is smaller than a woven's.
    if (!(got[knitIdx].waistMM < got[wovenIdx].waistMM - 1.0))
        fail("the jersey draft is not measurably smaller in the waist than the woven draft — "
             "the sourced negative-ease law is not reaching the draft");
    else ok();
    // ⭐ BORÇ 88 (GECE7 / F7) — OYUK AND BÜZGÜ WERE PRINTED, NOT GATED.
    // The F6 card asked for "bel · oyuk · büzgü" and only BEL had a condition
    // above; the other two columns were pretty-printed and nothing could make
    // them red. The referee found it with his own mutation (HM-1) and named it.
    // The two conditions below are the SAME condition the waist already carries,
    // applied to the two columns that were free: a negative-ease knit must come
    // out measurably smaller than the woven on the armhole it is drafted with,
    // and on the skirt edge it gathers onto that waist. Both floors are 1.0 mm
    // — the same floor the waist leg uses, not a new number — and both are far
    // under the measured separation (oyuk −27.6852 mm, büzgü −28.9938 mm), so
    // the gate judges DIRECTION and PRESENCE, never a fitted constant.
    if (!(got[knitIdx].armholeMM < got[wovenIdx].armholeMM - 1.0))
        fail("the jersey draft is not measurably smaller in the ARMHOLE than the woven draft — "
             "the fabric axis reaches the waist but stops before the armhole the sleeve is "
             "set into (borç 88: this column used to be printed and never judged)");
    else ok();
    if (!(got[knitIdx].gatherMM < got[wovenIdx].gatherMM - 1.0))
        fail("the jersey draft gathers the SAME width of cloth onto a smaller waist as the "
             "woven does — the gathered edge is not following the fabric axis "
             "(borç 88: this column used to be printed and never judged)");
    else ok();
    // And every bolt must ask for its own metreage. The comparison is made ONLY
    // among the WOVENS: they draft the same piece area (equal stretch class), so
    // any yardage difference is pure width arithmetic. Comparing the knit here
    // would conflate area (negative ease) with width. Ties are legal — the
    // engine rounds to 0.1 m, and 139.7 vs 140.0 cm can land on the same figure.
    for (size_t i = 0; i < fabrics.size(); ++i) {
        for (size_t j = 0; j < fabrics.size(); ++j) {
            if (fabrics[i].sinif != "Fabric::Woven" || fabrics[j].sinif != "Fabric::Woven") continue;
            if (fabrics[i].widthCM < fabrics[j].widthCM - 1e-9 && got[i].meters < got[j].meters) {
                char buf[192];
                std::snprintf(buf, sizeof buf,
                              "%s (%.1f cm) asks for FEWER metres than %s (%.1f cm) — a narrower "
                              "bolt can never need less cloth for the same pieces",
                              fabrics[i].id.c_str(), fabrics[i].widthCM,
                              fabrics[j].id.c_str(), fabrics[j].widthCM);
                fail(buf);
            }
        }
    }
    ok();
    // The narrowest woven (velveteen, 106.7 cm) must STRICTLY ask for more than
    // the widest woven (lawn, 142 cm) — the ordering above allows ties, this
    // pins that the axis is not flat.
    {
        int nar = wovenIdx, wid = wovenIdx;
        for (size_t i = 0; i < fabrics.size(); ++i) {
            if (fabrics[i].sinif != "Fabric::Woven") continue;
            if (fabrics[i].widthCM < fabrics[nar].widthCM) nar = static_cast<int>(i);
            if (fabrics[i].widthCM > fabrics[wid].widthCM) wid = static_cast<int>(i);
        }
        if (!(got[nar].meters > got[wid].meters))
            fail("the narrowest bolt does not ask for more metres than the widest — "
                 "the width axis never reached the yardage");
        else ok();
    }

    // ── LEG 5: the recovery condition really bites ──────────────────────────
    {
        FabricAxis good = axisOf(fabrics[knitIdx]);
        FabricAxis bad = good;
        bad.recovery30minPct = FabricBand::kRecovery30minMinPct - 1.0;  // 84 %
        const double eGood = FabricBand::easeFor(FabricBand::Girth::Chest, good);
        const double eBad = FabricBand::easeFor(FabricBand::Girth::Chest, bad);
        if (!(eGood < 0.0)) fail("the jersey preset does not draft with negative ease at all");
        else if (!(eBad == 0.0))
            fail("a fabric that FAILS the published recovery minimum still takes negative ease — "
                 "recovery is decoration, not a condition");
        else {
            ok();
            const Measured mGood = measure(good, m);
            const Measured mBad = measure(bad, m);
            std::printf("  RECOVERY SARTI: ilan yok (OLCULMEDI) -> bel %.4f mm  |  84%% ilan "
                        "(esik alti) -> bel %.4f mm  (fark %+.4f mm)\n",
                        mGood.waistMM, mBad.waistMM, mBad.waistMM - mGood.waistMM);
            if (std::fabs(mBad.waistMM - mGood.waistMM) < 1e-6)
                fail("the recovery clamp changes the ease but not the drafted waist");
            else ok();
        }
        // A fabric that declares GROWTH above the published 3% loses it too.
        FabricAxis grew = good;
        grew.growthPct = FabricBand::kGrowthMaxPct + 0.1;
        if (FabricBand::easeFor(FabricBand::Girth::Chest, grew) != 0.0)
            fail("growth above the published maximum does not refuse the negative branch");
        else ok();
    }

    // ── LEG 6: width arithmetic, and the reference width is a no-op ─────────
    {
        FabricAxis ref(Fabric::Woven, 0.0);
        ref.widthCM = FabricBand::kRefWidthCM;
        if (FabricBand::metersAtWidth(2.4, ref) != 2.4)
            fail("declaring the reference bolt width changes the yardage — it must not");
        else ok();
        FabricAxis silent(Fabric::Woven, 0.0);
        if (FabricBand::metersAtWidth(2.4, silent) != 2.4)
            fail("an undeclared width changes the yardage — the legacy number must stand");
        else ok();
        FabricAxis narrow(Fabric::Woven, 0.0);
        narrow.widthCM = 90.0;
        if (!(FabricBand::metersAtWidth(2.4, narrow) > 2.4))
            fail("a 90 cm bolt does not ask for more metres than a 140 cm bolt");
        else ok();
    }

    // ── LEG 7: FIVE FABRICS -> honest rehbers. guide_completeness_check owns
    // the general law; what is proven HERE: no drape sentence without a measured
    // input, recovery sentence follows the declaration, yardage quotes each
    // bolt's own width, and the knit does not share the wovens' paragraph.
    std::printf("\n  REHBER (ayni spec, bes kumas):\n");
    std::vector<std::string> texts;
    for (const auto& c : fabrics) {
        GarmentSpec s = theSpec();
        s.fabric = axisOf(c);
        const DraftedPattern p = GarmentDrafter::draft(s, m);
        std::string joined, yardage;
        int noBasis = 0;
        bool hasRecovery = false, hasDrape = false;
        for (const auto& a : p.rehber) {
            joined += a.id + "|" + a.text + "\n";
            if (a.basis.empty()) noBasis++;
            if (a.id == "fabric.recovery") hasRecovery = true;
            if (a.id == "fabric.drape") hasDrape = true;
            if (a.id == "cut.yardage") yardage = a.text;
        }
        texts.push_back(joined);
        std::printf("  %-16s %2zu cumle, dayanaksiz %d, recovery=%s, drape=%s\n     -> %s\n",
                    c.id.c_str(), p.rehber.size(), noBasis, hasRecovery ? "VAR" : "yok",
                    hasDrape ? "VAR" : "yok", yardage.c_str());
        if (noBasis != 0)
            fail(c.id + ": " + std::to_string(noBasis) + " rehber sentence(s) with NO basis");
        else ok();
        // No bolt has a measured bending length (OLCULMEDI), so NO fabric may
        // print a drape number — a drape sentence here would be an invented one.
        const bool wantDrape = axisOf(c).bendingRigidityUNm() >= 0.0;
        if (hasDrape != wantDrape)
            fail(c.id + (wantDrape ? ": declares FAST-2 inputs but prints no drape advice"
                                   : ": prints a drape sentence with NO measured bending length"));
        else ok();
        // Recovery: none of the five declares it, and the sentence must follow.
        const bool wantRecovery = axisOf(c).recoveryDeclared();
        if (wantRecovery != hasRecovery)
            fail(c.id + ": recovery advice presence does not follow the declaration");
        else ok();
        // The yardage sentence must carry THIS bolt's width, not the reference.
        char want[32];
        std::snprintf(want, sizeof want, "%.0f cm wide", c.widthCM);
        if (yardage.find(want) == std::string::npos)
            fail(c.id + ": the cut plan does not quote this fabric's own bolt width (" +
                 std::string(want) + ")");
        else ok();
    }
    // The knit must not share a paragraph with any woven. Two WOVENS are allowed
    // to coincide when every bound axis coincides after rounding (crepe 140.0 vs
    // challis 139.7 cm: same quoted width, same 0.1 m yardage; weight differs
    // but weight has no bound behaviour without a bending length — that gap is
    // declared in the catalog, not hidden here).
    for (size_t i = 0; i < texts.size(); ++i) {
        if (static_cast<int>(i) == knitIdx) continue;
        if (texts[i] == texts[knitIdx])
            fail(fabrics[i].id + ": a woven printed the IDENTICAL rehber to the knit");
        else ok();
    }

    // ── LEG 8: THE BROWSER'S COPY MAY NOT DRIFT ────────────────────────────
    // web/js/fabric-catalog.js carries the same twelve numbers so a shopper can
    // pick a fabric without owning a bending-length rig. Two copies of a number
    // is two chances to be wrong, so the copy is GATED rather than trusted: the
    // gate reads both files and compares. (It is a copy and not a generated
    // module on purpose — the generated surface is pinned by
    // contract/generated-paths.sha256 and adding a path there is the bigger
    // change. The guard is this leg.)
    {
        const std::string web = slurp(root + "/web/js/fabric-catalog.js");
        if (web.empty()) {
            fail("web/js/fabric-catalog.js is missing — the browser cannot offer the catalog");
        } else if (web.find("applyFabricPreset") == std::string::npos) {
            fail("web/js/fabric-catalog.js no longer exports applyFabricPreset — nothing folds "
                 "the chosen fabric into the spec the engine drafts from");
        } else {
            for (const auto& c : fabrics) {
                const size_t k = web.find("'" + c.id + "': {");
                if (k == std::string::npos) {
                    fail(c.id + ": the browser catalog does not offer this fabric");
                    continue;
                }
                const size_t stop = web.find("},", k);
                struct { const char* key; double want; } rows[] = {
                    {"fabricStretchPct", c.stretchPct},
                    {"fabricStretchLengthwisePct", c.stretchLengthwisePct},
                    {"fabricRecovery15sPct", c.recovery15sPct},
                    {"fabricRecovery30minPct", c.recovery30minPct},
                    {"fabricGrowthPct", c.growthPct},
                    {"fabricWeightGSM", c.weightGSM},
                    {"fabricBendingLengthMM", c.bendingLengthMM},
                    {"fabricWidthCM", c.widthCM},
                };
                for (const auto& r : rows) {
                    const size_t kk = web.find(std::string(r.key) + ":", k);
                    if (kk == std::string::npos || kk > stop) {
                        fail(c.id + ": browser catalog is missing " + r.key);
                        continue;
                    }
                    double v = 0;
                    try { v = std::stod(web.substr(web.find(':', kk) + 1, 40)); }
                    catch (...) { fail(c.id + ": browser catalog " + r.key + " is not a number"); continue; }
                    if (std::fabs(v - r.want) > 1e-9) {
                        char buf[224];
                        std::snprintf(buf, sizeof buf,
                                      "%s.%s: browser says %.4f, contract says %.4f — the two "
                                      "catalogs have drifted",
                                      c.id.c_str(), r.key, v, r.want);
                        fail(buf);
                    } else ok();
                }
            }
        }
    }

    std::printf("\nfabric_catalog_check: %d checks, %d failures\n", checked, failures);
    return failures == 0 ? 0 : 1;
}
