// split-op: run `op.split` against the LIVE seam plan (GECE7 / F5-C).
//
// THIS TOOL HOLDS NO GEOMETRY AND NO FRACTION. The panels are the torso panels
// of the shipped EU38 SeamPlan — the same object seam-plan, rotate-op,
// suppress-op, the wasm bindings and web/lib/flat-from-plan.js read — and the
// division column comes out of src/panelsplit.cpp, which reads it off the
// panel's own measured per-column develop-deficit. There is nowhere in this
// file a place a cut could be typed: splitPanel() takes a panel and nothing
// else. Same rule tools/seam-plan.cpp already states — if this tool and
// create.html ever disagree, one of them is not calling the engine.
//
// ---------------------------------------------------------------------------
// ⚠ WHY THREE SURFACES AND NOT ONE, AND WHY THE EXPENSIVE ONE IS NOT HERE.
//
// The shipped bodice is a CONE (skimBodice) and a cone develops exactly, so its
// column profile is nearly flat and its whole deficit is NEGATIVE (-1.9628 deg,
// K28). op.suppress refuses it. op.split still has something to say about it
// and says it, because refusing to print the shipped garment's own answer is
// how a tool hides that the operator does not touch the product. So:
//
//   sevk_edilen    skimBodice ON  (what ships)         -> the product's answer
//   vucudu_izleyen skimBodice OFF, maxDartDeg = 0      -> the loaded panel
//   etek           the shipped skirt panel             -> a measured REFUSAL
//
// The THIRD plan suppress-op builds (skimBodice OFF with the engine's own darts
// on) costs 366 sec on this machine and this tool does not need it: split reads
// the WHOLE panel's profile, and a panel already slit by the engine's derived
// darts is not whole. Leaving it out is the reason split_check runs in seconds
// instead of adding a third 375-second gate to the suite (borç 43 / K37).
//
// ---------------------------------------------------------------------------
// ⭐ AND THE NUMBER NOBODY WAS MEASURING IS PRINTED ON EVERY ROW.
// developDeficitDeg is a SIGNED sum: +30 and -30 in the same panel print 0 and
// every gate, including op.suppress's own refusal threshold, reads that 0 as
// "nothing to take out". This tool prints `iptal_olan_deg` — the absolute
// column sum minus the absolute signed total — for the whole panel and for each
// piece. MEASURED, EU38 left_ftorso, body-following: signed +55.1735 deg
// against an absolute column sum of 93.4063 deg, i.e. 38.2327 deg of curvature
// cancelled inside the one number every gate reads. (The ROW bands of the same
// panel hide 23.66 deg; the columns hide more, because the front and the back
// of the ring want opposite things.) left_btorso: 56.6688 signed, 91.0078
// absolute, 34.3390 cancelled.
//
// Usage: split-op [EU38] [-o dosya]      -> JSON on stdout (or to the file)
#include <cmath>
#include <cstdio>
#include <cstring>
#include <exception>
#include <string>
#include <vector>

#include "../src/panelsplit.hpp"
#include "../src/seamplan.hpp"

using namespace stitchu;

namespace {

// ⚠ DEFAULT 9 BASAMAK, VE SEBEBİ BİR ÖLÇÜM. Bu aracın bastığı sayıların çoğu
// bir KORUNUM kimliğinin iki tarafı (alan A+B ↔ bütün, çevre A+B ↔ bütün+2·kesik,
// |sütun| toplamı ↔ iptal). 4 basamakta basıldıklarında kimlikler yazdırma
// yuvarlamasında kırılıyordu — ölçülen fark 4.5e-5 mm, yani geometride değil
// printf'te. Kapıyı gevşetmek yerine (§3.8 md.4) çözünürlük büyütüldü: eşikler
// 1e-6/1e-9'da duruyor ve artık gerçekten geometriyi yargılıyorlar.
std::string num(double v, int dp = 9) {
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
    throw std::runtime_error("split-op: the plan has no panel named " + want);
}

void emit(const char* etiket, const char* yuzey, const SeamPlan& plan, const SurfacePanel& p,
          bool last) {
    const SplitReport r = splitPanel(p);
    std::printf(
        "    {\"etiket\": \"%s\", \"yuzey\": \"%s\", \"panel\": \"%s\",\n"
        "     \"dugum\": \"%s\", \"panel_nokta\": %zu, \"eksen\": \"%s\",\n"
        "     \"sutun_sayisi\": %zu, \"taban_deg\": %s,\n"
        "     \"bolundu\": %s, \"ret_gerekcesi\": \"%s\",\n"
        "     \"kesim_sutunu\": %zu, \"kesim_kesri_OLCULEN\": %s,\n"
        "     \"kesim_kaynak\": \"panelin KENDI olculen sutun-deficit profili; "
        "splitPanel()'in kesir parametresi YOK\",\n"
        "     \"kontur_a_idx\": %zu, \"kontur_b_idx\": %zu,\n"
        "     \"deficit_butun_deg\": %s, \"sutun_toplami_deg\": %s,\n"
        "     \"deficit_a_deg\": %s, \"deficit_b_deg\": %s, \"deficit_toplam_deg\": %s,\n"
        "     \"mutlak_sutun_toplami_deg\": %s, \"iptal_olan_deg\": %s,\n"
        "     \"mutlak_a_deg\": %s, \"mutlak_b_deg\": %s,\n"
        "     \"iptal_a_deg\": %s, \"iptal_b_deg\": %s,\n"
        "     \"kama_butun_deg\": %s, \"kama_a_deg\": %s, \"kama_b_deg\": %s,\n"
        "     \"kama_en_buyuk_sonra_deg\": %s, \"motor_maxDartDeg\": %s,\n"
        "     \"alan_butun_mm2\": %s, \"alan_a_mm2\": %s, \"alan_b_mm2\": %s, "
        "\"alan_toplam_mm2\": %s,\n"
        "     \"cevre_butun_mm\": %s, \"cevre_a_mm\": %s, \"cevre_b_mm\": %s,\n"
        "     \"kesik_a_mm\": %s, \"kesik_b_mm\": %s,\n"
        "     \"nokta_a\": %zu, \"nokta_b\": %zu,\n"
        "     \"a_kendini_kesiyor\": %s, \"b_kendini_kesiyor\": %s,\n"
        "     \"sutun_deficit_deg\": [",
        etiket, yuzey, p.name.c_str(), plan.nodeId().c_str(), p.contour.size(), r.axis.c_str(),
        r.colsN, num(splitFloorDeg(), 2).c_str(), r.split ? "true" : "false",
        esc(r.refusal).c_str(), r.atColumn, num(r.atFractionMeasured, 9).c_str(), r.cutIdxWaist,
        r.cutIdxFar, num(r.deficitWholeDeg).c_str(), num(r.columnSumDeg).c_str(),
        num(r.deficitADeg).c_str(), num(r.deficitBDeg).c_str(), num(r.deficitSumDeg).c_str(),
        num(r.absColumnSumDeg).c_str(), num(r.cancelledWholeDeg).c_str(),
        num(r.absSumADeg).c_str(), num(r.absSumBDeg).c_str(), num(r.cancelledADeg).c_str(),
        num(r.cancelledBDeg).c_str(), num(r.wedgeWholeDeg).c_str(), num(r.wedgeADeg).c_str(),
        num(r.wedgeBDeg).c_str(), num(r.wedgeMaxAfterDeg).c_str(),
        num(r.engineMaxDartDeg, 2).c_str(), num(r.areaWholeMM2).c_str(), num(r.areaAMM2).c_str(),
        num(r.areaBMM2).c_str(), num(r.areaSumMM2).c_str(), num(r.perimWholeMM).c_str(),
        num(r.perimAMM).c_str(), num(r.perimBMM).c_str(), num(r.cutLenAMM, 9).c_str(),
        num(r.cutLenBMM, 9).c_str(), r.pieceA.size(), r.pieceB.size(),
        r.aSelfIntersects ? "true" : "false", r.bSelfIntersects ? "true" : "false");
    for (std::size_t i = 0; i < r.columnDeficitDeg.size(); ++i)
        std::printf("%s%s", i ? ", " : "", num(r.columnDeficitDeg[i]).c_str());
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
        std::fprintf(stderr, "split-op: cikti dosyasi acilamadi: %s\n", outPath);
        return 1;
    }
    try {
        // ⚠ THE SECOND SURFACE IS NOT A HIDDEN DIAL — same declaration
        // suppress-op makes: skimBodice is a field of SheathOptions with its own
        // paragraph in surfacepattern.hpp, both plans are built by the SAME
        // buildSeamPlan from the SAME body, and which one is which is printed on
        // every row. maxDartDeg = 0 so the panel arrives WHOLE: a panel the
        // engine has already slit is not a panel a division operator can divide.
        SheathOptions bodyFollowing;
        bodyFollowing.skimBodice = false;
        bodyFollowing.maxDartDeg = 0.0;
        const SeamPlan shipped = buildSeamPlan(size);
        const SeamPlan following = buildSeamPlan(size, bodyFollowing);

        std::printf("{\n");
        std::printf("  \"op\": \"split\",\n");
        std::printf("  \"beden\": \"%s\",\n", size.c_str());
        std::printf("  \"kesim_kaynagi\": \"panelin KENDI olculen sutun-deficit'i "
                    "(SurfacePanel::deficitColumnDeg) uzerinde argmin — splitPanel()'in "
                    "kesir parametresi YOK\",\n");
        std::printf("  \"kural\": \"C(c)=sum sutun[0..c]; kesim = max(|C(c)|,|T-C(c)|) "
                    "degerini MINIMIZE eden ic sutun. Esik yok, kesir yok, tolerans yok.\",\n");
        std::printf("  \"kosumlar\": [\n");
        emit("sevk_edilen_on", "skimBodice=ON (sevk edilen giysi)", shipped,
             panelNamed(shipped, "left_ftorso"), false);
        emit("sevk_edilen_arka", "skimBodice=ON (sevk edilen giysi)", shipped,
             panelNamed(shipped, "left_btorso"), false);
        emit("sevk_edilen_etek", "skimBodice=ON (sevk edilen giysi, etek paneli)", shipped,
             panelNamed(shipped, "left_skirt_front"), false);
        emit("vucudu_izleyen_on", "skimBodice=OFF, maxDartDeg=0 (motorun kendi pensi YOK)",
             following, panelNamed(following, "left_ftorso"), false);
        emit("vucudu_izleyen_arka", "skimBodice=OFF, maxDartDeg=0 (motorun kendi pensi YOK)",
             following, panelNamed(following, "left_btorso"), true);
        std::printf("  ]\n}\n");
        return 0;
    } catch (const std::exception& e) {
        std::fprintf(stderr, "split-op: %s\n", e.what());
        return 1;
    }
}
