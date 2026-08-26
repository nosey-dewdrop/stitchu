// suppress-op: run `op.suppress` against the LIVE seam plan (GECE7 / F5-B).
//
// THIS TOOL HOLDS NO GEOMETRY AND NO ANGLE. The panel is the front torso panel
// of the shipped EU38 SeamPlan — the same object seam-plan, rotate-op, the wasm
// bindings and web/lib/flat-from-plan.js read — and the suppression angle comes
// out of src/dartsuppress.cpp, which reads it off the panel. There is nowhere in
// this file a number could be typed. Same rule tools/seam-plan.cpp already
// states: if this tool and create.html ever disagree, one of them is not
// calling the engine.
//
// ⚠ THE MEASURED FACT THAT SHAPES THIS TOOL, AND IT IS THE UNCOMFORTABLE ONE.
// The shipped class is named `top/dart/woven` and the shipped plan carries ZERO
// darts (K28: all eight EU38 panels print "pens": 0). F5-A had to DECLARE the
// dart rotate transfers, as a fixture, because nothing produced one. This tool
// says why in a number rather than in a sentence: the shipped bodice's
// develop-deficit is NEGATIVE, so `op.suppress` refuses, and a refusal is the
// correct answer, not a gap. skimBodice turns the bodice into a CONE and a cone
// develops exactly (surfacepattern.hpp says so in its own words).
//
// So the tool runs the operator on BOTH surfaces the engine can build and
// prints both answers side by side:
//
//   sevk_edilen    skimBodice ON  (what ships)  -> REFUSED, deficit <= 0
//   vucudu_izleyen skimBodice OFF               -> OPENED, deficit measured
//
// and both next to 41.48 deg, the real Buğra Locket dart measured as
// develop-deficit (flatten-research/16). Neither of them is 41.48. That is
// written down, not tuned towards: 41.48 belongs to a different garment on a
// different body, and moving a dial until a measurement matched a number
// borrowed from another pattern is exactly what KOSU-v7 §3.10 forbids.
//
// ---------------------------------------------------------------------------
// ⏱ `-o <dosya>` — SÜİT SÜRESİ (GECE7 / F5-C İŞ 0a, borç 43 / K37).
//
// ÖLÇÜLDÜ, bu makinede, temiz Release: bu aracın üç plan kurulumundan İKİSİ
// ucuz ve BİRİ değil —
//     shipped   (skimBodice=ON)                      ~5 sec
//     following (skimBodice=OFF, maxDartDeg=0)        ~8 sec
//     doubled   (skimBodice=OFF, maxDartDeg=14)     ~360 sec   <- burası
// çünkü motorun kendi türettiği pensler AÇIKKEN ızgara slit'lerle dolu ve ARAP
// yakınsaması uzuyor. Aracın kendi toplamı 375.74 sec (hakem ölçtü).
//
// VE O 375 SANİYE SÜİTTE İKİ KEZ ÖDENİYORDU: `suppress_check` bu aracı
// koşuyor, `rotate_check` de R0 çapraz-ölçümü için AYNI aracı bir kez daha
// koşuyordu (rotate-op'un kendisi yalnız 13.4 sec). Süitin 1080.09 sn'sinin
// 767.08'i bu iki kapıydı ve yarısı AYNI hesabın tekrarıydı.
//
// ÇÖZÜM BİR KAPIYI SİLMEK DEĞİL (§3.8 md.4 bunu yasaklıyor): araç bir ctest
// FIXTURES_SETUP testinde BİR KEZ koşar, çıktısını `-o` ile dosyaya yazar, üç
// kapı (`suppress_check` · `rotate_check` · `split_check`) o dosyayı okur.
// Ölçülen sayıların HİÇBİRİ değişmez — aynı ikili, aynı plan, aynı JSON; yalnız
// ikinci koşum kalkar. R0 hâlâ ÇAPRAZ bir ölçümdür (K36): rotate_check'in
// kıyasladığı sayı hâlâ suppress-op'un motordan okuduğu sayıdır, bir sabit
// değil.
//
// Usage: suppress-op [EU38] [-o dosya]      -> JSON on stdout (ya da dosyaya)
#include <cmath>
#include <cstdio>
#include <cstring>
#include <exception>
#include <string>
#include <vector>

#include "../src/dartsuppress.hpp"
#include "../src/seamplan.hpp"

using namespace stitchu;

namespace {

// The real Buğra Locket dart, measured as develop-deficit
// (flatten-research/16-dart-conservation.py; CLAUDE.md "gerçek Buğra pensi
// 41.5° = develop-deficit 41.48°"). REPORTED FOR COMPARISON ONLY. Nothing in
// this file or in dartsuppress.cpp uses it as an input, and no gate makes a
// measurement match it.
constexpr double kBugraLocketDartDeg = 41.48;

std::string num(double v, int dp = 4) {
    char b[64];
    std::snprintf(b, sizeof b, "%.*f", dp, v);
    return b;
}

std::string esc(const std::string& s) {
    std::string o;
    for (char c : s) {
        if (c == '"' || c == '\\') o += '\\';
        if (c == '\n') { o += "\\n"; continue; }
        o += c;
    }
    return o;
}

const SurfacePanel& panelNamed(const SeamPlan& plan, const std::string& want) {
    for (const SurfacePanel& q : plan.pattern.panels)
        if (q.name == want) return q;
    throw std::runtime_error("suppress-op: the plan has no panel named " + want);
}

// WHERE THE DART OPENS AND WHERE ITS TIP GOES — asked of the PANEL, not chosen.
//
// waistEdges and farEdges are both listed phi-ascending with the same count, so
// waist arc k and far arc k are the two ends of one ring column: the same
// object surfacepattern.cpp opens its own slits on ("dart columns are stored as
// ABSOLUTE RING COLUMNS"). The mouth is the waist end of the middle column, the
// apex runs towards the far end, and the depth is the engine's own declared
// fraction of that column — SheathOptions::bodiceApexFrac, READ off the plan
// (plan.opt) rather than copied into a constant here.
struct Column {
    std::size_t waistIdx = 0, farIdx = 0;
    double lenMM = 0.0, apexDepthMM = 0.0;
};

Column middleColumn(const SeamPlan& plan, const SurfacePanel& p) {
    if (p.waistEdges.size() != p.farEdges.size())
        throw std::runtime_error("suppress-op: waist and far runs are not the same length; the "
                                 "column correspondence this tool relies on is gone");
    if (p.waistEdges.empty()) throw std::runtime_error("suppress-op: panel has no waist run");
    Column c;
    const std::size_t kMid = p.waistEdges.size() / 2;  // the engine's own default 0.5 cut
    c.waistIdx = static_cast<std::size_t>(p.waistEdges[kMid]);
    c.farIdx = static_cast<std::size_t>(p.farEdges[kMid]);
    c.lenMM = std::hypot(p.contour[c.farIdx].x - p.contour[c.waistIdx].x,
                         p.contour[c.farIdx].y - p.contour[c.waistIdx].y);
    c.apexDepthMM = plan.opt.bodiceApexFrac * c.lenMM;
    return c;
}

void emit(const char* etiket, const char* yuzey, const SeamPlan& plan, const SurfacePanel& p,
          bool last, bool kesismeBekleniyor = false) {
    const Column col = middleColumn(plan, p);
    const SuppressReport r = suppressPanel(p, col.waistIdx, col.apexDepthMM, p.contour[col.farIdx]);
    std::printf(
        "    {\"etiket\": \"%s\", \"yuzey\": \"%s\", \"panel\": \"%s\",\n"
        "     \"dugum\": \"%s\", \"panel_nokta\": %zu, \"planda_pens_sayisi\": %zu,\n"
        "     \"deficit_deg\": %s, \"esik_deg\": %s,\n"
        "     \"apeks_frac\": %s, \"apeks_frac_kaynak\": \"SheathOptions::bodiceApexFrac, "
        "plan.opt'tan OKUNDU\",\n"
        "     \"sutun_uzunluk_mm\": %s, \"apeks_derinlik_mm\": %s,\n"
        "     \"kama_olculen_deg\": %s,\n"
        "     \"acildi\": %s, \"kama_deg\": %s,\n"
        "     \"ret_gerekcesi\": \"%s\",\n"
        "     \"alan_once_mm2\": %s, \"alan_sonra_mm2\": %s, \"alan_giden_mm2\": %s,\n"
        "     \"kama_sektor_alani_mm2\": %s,\n"
        "     \"cevre_once_mm\": %s, \"cevre_sonra_mm\": %s,\n"
        "     \"bacak_a_mm\": %s, \"bacak_b_mm\": %s, \"bacak_true_mm\": %s,\n"
        "     \"kendini_kesiyor\": %s, \"kesisme_bekleniyor\": %s,\n"
        "     \"bugra_locket_pens_deg\": %s, \"bugra_ile_fark_deg\": %s,\n"
        "     \"deficit_bant_deg\": [",
        etiket, yuzey, p.name.c_str(), plan.nodeId().c_str(), p.contour.size(), p.darts.size(),
        num(r.deficitDeg).c_str(), num(kNothingToAbsorbDeg, 2).c_str(),
        num(plan.opt.bodiceApexFrac, 9).c_str(), num(col.lenMM, 9).c_str(),
        num(col.apexDepthMM, 9).c_str(), num(r.wedgeMeasuredDeg).c_str(),
        r.opened ? "true" : "false", num(r.wedgeDeg).c_str(),
        esc(r.refusal).c_str(), num(r.areaBeforeMM2).c_str(), num(r.areaAfterMM2).c_str(),
        num(r.areaRemovedMM2).c_str(), num(r.sectorAreaMM2).c_str(),
        num(r.perimeterBeforeMM).c_str(), num(r.perimeterAfterMM).c_str(), num(r.legAMM).c_str(),
        num(r.legBMM).c_str(), num(std::fabs(r.legAMM - r.legBMM), 9).c_str(),
        r.selfIntersects ? "true" : "false", kesismeBekleniyor ? "true" : "false",
        num(kBugraLocketDartDeg, 2).c_str(),
        num(r.deficitDeg - kBugraLocketDartDeg).c_str());
    for (std::size_t i = 0; i < p.deficitBandDeg.size(); ++i)
        std::printf("%s%s", i ? ", " : "", num(p.deficitBandDeg[i], 3).c_str());
    std::printf("]}%s\n", last ? "" : ",");
}

}  // namespace

int main(int argc, char** argv) {
    std::string size = "EU38";
    const char* outPath = nullptr;
    for (int i = 1; i < argc; ++i) {
        if (!std::strcmp(argv[i], "-o") && i + 1 < argc) outPath = argv[++i];
        else size = argv[i];
    }
    if (outPath && !std::freopen(outPath, "w", stdout)) {
        std::fprintf(stderr, "suppress-op: cikti dosyasi acilamadi: %s\n", outPath);
        return 1;
    }
    try {
        // ⚠ THE SECOND SURFACE IS NOT A HIDDEN DIAL. skimBodice is a field of
        // SheathOptions with its own paragraph in surfacepattern.hpp; both
        // plans below are built by the SAME buildSeamPlan from the SAME body,
        // and which one is which is printed on every row.
        SheathOptions bodyFollowing;
        bodyFollowing.skimBodice = false;
        // ⚠ AND THE ENGINE'S OWN DERIVED DARTS ARE OFF, WHICH IS NOT A DODGE —
        // it is the measurement below. `maxDartDeg = 0` is SheathOptions' own
        // documented switch back to the declared fraction lists, and
        // bodiceDartFracs is empty, so the torso is cut WHOLE and arrives at
        // op.suppress still carrying its deficit. Leaving the derived darts on
        // means the panel is suppressed TWICE — once by the engine's slits and
        // again by this operator — and that is exactly what the fourth row
        // below reports: EU38 left_ftorso, both on, residual deficit 27.8788
        // deg, the wedge opens and the panel SELF-INTERSECTS (area removed
        // 11417 mm2 against a sector of 24427, i.e. the cut ate its neighbours'
        // dart legs). Measured, printed, and the reason this configuration is
        // the one op.suppress is asked to work on.
        bodyFollowing.maxDartDeg = 0.0;
        SheathOptions doublySuppressed;
        doublySuppressed.skimBodice = false;
        const SeamPlan shipped = buildSeamPlan(size);
        const SeamPlan following = buildSeamPlan(size, bodyFollowing);
        const SeamPlan doubled = buildSeamPlan(size, doublySuppressed);

        std::printf("{\n");
        std::printf("  \"op\": \"suppress\",\n");
        std::printf("  \"beden\": \"%s\",\n", size.c_str());
        std::printf("  \"aci_kaynagi\": \"panelin KENDİ develop-deficit'i "
                    "(SurfacePanel::developDeficitDeg) — suppressPanel()'in aci parametresi YOK\",\n");
        std::printf("  \"kosumlar\": [\n");
        emit("sevk_edilen", "skimBodice=ON (sevk edilen giysi)", shipped,
             panelNamed(shipped, "left_ftorso"), false);
        emit("sevk_edilen_arka", "skimBodice=ON (sevk edilen giysi)", shipped,
             panelNamed(shipped, "left_btorso"), false);
        emit("vucudu_izleyen", "skimBodice=OFF, maxDartDeg=0 (motorun kendi pensi YOK)",
             following, panelNamed(following, "left_ftorso"), false);
        emit("vucudu_izleyen_arka", "skimBodice=OFF, maxDartDeg=0 (motorun kendi pensi YOK)",
             following, panelNamed(following, "left_btorso"), false);
        emit("cift_bastirma", "skimBodice=OFF, motorun kendi pensleri ACIK — CIFT BASTIRMA",
             doubled, panelNamed(doubled, "left_ftorso"), true, /*kesismeBekleniyor=*/true);
        std::printf("  ]\n}\n");
        return 0;
    } catch (const std::exception& e) {
        std::fprintf(stderr, "suppress-op: %s\n", e.what());
        return 1;
    }
}
