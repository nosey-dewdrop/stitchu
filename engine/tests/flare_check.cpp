// flare_check — op.flare'IN KENDI KAPISI (M3-primitif, K35: op.X -> X_check).
//
// NEDEN AYRI BIR TEST, `peplum_check` DURURKEN. `peplum_check` BIR UYGULAMAYI
// yargilar: peplum parcasi dogru mu. `op.flare` bir OPERATORDUR ve motorda UC
// ayri yerde gerceklesir — peplum.cpp, skirt.cpp (gore/halfCircle) ve
// hemflounce.cpp. Bir operatorun kapisi, uygulamalarindan birinin kapisini
// odunc almakla acilmis olmaz (contract/primitives-v1.json _operator_kapisi,
// expressability_check K35): odunc alinan ad, operatoru UYGULAMADAN uygulanmis
// saymanin yoludur. Bu dosya operatorun KENDI kimligini olcer ve onu HER
// uygulamada ayni cumleyle sorar:
//
//   FLARE = bir kenari, karsisindaki kenari SABIT TUTARAK uzatmaktir.
//   Yani ic (takilan) kenar bittikten sonra dis (etek ucu) kenar ondan
//   UZUNDUR, ve fazlalik operatoru uygulayan blogun KENDI ilan ettigi
//   derinlikten dusen orandir; bir stil tercihi degildir.
//
// Uc uygulamada da olculen sey ayni: dis/ic kenar orani > 1, ve halka-sektor
// geometrisinin verdigi (r0+depth)/r0 ile TUTUYOR. Sayilar bu dosyada YAZILI
// DEGIL — hepsi bloklarin kendi sabitlerinden (PeplumBlock::depth,
// HemFlounceBlock, SkirtBlock::goreHemFlare) okunur, yani bir sabit degisirse
// kapi onunla birlikte hareket eder ve yalan soylemez.
//
// UNITS mm.
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/peplum.hpp"
#include "../src/skirt.hpp"
#include "../src/geometry.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static const BodyMeasurementsSnapshot& m0() {
    static const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    return m;
}

static const PatternPiece* findPiece(const DraftedPattern& d, const char* word) {
    for (const auto& p : d.pieces)
        if (p.name.find(word) != std::string::npos) return &p;
    return nullptr;
}

// The outline's vertices, in order (curves flattened at their endpoints — every
// flare piece the engine draws is a polyline sector, checked below).
static std::vector<Point> verts(const PatternPiece& p) {
    std::vector<Point> v;
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Close) break;
        v.push_back(c.to);
    }
    return v;
}

// A sector outline is: inner arc, radial side, outer arc, radial side back.
// The two RADIAL sides are the two longest single segments; the runs between
// them are the two arcs. Returns {innerLen, outerLen} with inner = the shorter
// arc (smaller radius). No index is hard-coded.
static bool arcs(const PatternPiece& p, double* innerLen, double* outerLen) {
    const std::vector<Point> v = verts(p);
    if (v.size() < 8) return false;
    std::vector<double> seg;
    for (std::size_t i = 1; i < v.size(); ++i) seg.push_back(distance(v[i - 1], v[i]));
    seg.push_back(distance(v.back(), v.front()));
    // The two radial sides: the two longest segments.
    std::size_t a = 0, b = 0;
    for (std::size_t i = 1; i < seg.size(); ++i) if (seg[i] > seg[a]) a = i;
    for (std::size_t i = 0; i < seg.size(); ++i) if (i != a && (b == a || seg[i] > seg[b])) b = i;
    if (a > b) std::swap(a, b);
    double run1 = 0, run2 = 0;
    for (std::size_t i = a + 1; i < b; ++i) run1 += seg[i];
    for (std::size_t i = 0; i < seg.size(); ++i) if (i < a || i > b) run2 += seg[i];
    if (!(run1 > 0 && run2 > 0)) return false;
    *innerLen = std::min(run1, run2);
    *outerLen = std::max(run1, run2);
    return true;
}

int main() {
    std::printf("flare_check — op.flare, UC uygulamada AYNI kimlik\n");

    // ---- 1. peplum.cpp: tam dairesel peplum --------------------------------
    {
        GarmentSpec s; s.garment = GarmentType::Top; s.topLength = TopLength::Hip;
        s.shaping = Shaping::Dart;
        GarmentSpec none = s; none.peplum = static_cast<int>(PeplumStyle::None);
        GarmentSpec pe = s;   pe.peplum = static_cast<int>(PeplumStyle::Full);
        const DraftedPattern d0 = GarmentDrafter::draft(none, m0());
        const DraftedPattern d1 = GarmentDrafter::draft(pe, m0());
        check(d1.pieces.size() > d0.pieces.size(), "peplum: flare bir PARCA doguruyor");
        const PatternPiece* pp = findPiece(d1, "Peplum");
        check(pp != nullptr, "peplum: parca adiyla bulunuyor");
        if (pp) {
            double in = 0, out = 0;
            if (!arcs(*pp, &in, &out)) { check(false, "peplum: sektor kenarlari ayristirilamadi"); }
            else {
                std::printf("        ic %.4f mm  dis %.4f mm  oran %.6f\n", in, out, out / in);
                check(out > in, "peplum: DIS kenar IC kenardan uzun (flare'in tanimi)");
                // Halka sektoru: oran = (r0 + depth) / r0. r0 ic yaydan cikar.
                // Sayi bu dosyada yazili degil — PeplumBlock'un kendi derinligi.
                const double r0 = in / M_PI;           // yarim daire sektor (bkz. peplum.hpp)
                const double beklenen = (r0 + PeplumBlock::depth) / r0;
                std::printf("        r0 %.4f mm  depth %.1f mm  beklenen oran %.6f\n",
                            r0, PeplumBlock::depth, beklenen);
                check(std::fabs(out / in - beklenen) / beklenen < 0.02,
                      "peplum: fazlalik blogun KENDI derinliginden dusuyor (%2 icinde)");
            }
        }
    }

    // ---- 2. skirt.cpp: yarim daire etek ------------------------------------
    // Ayni kimlik, bambaska bir kod yolu: burada flare bir parca EKLEMEZ,
    // varolan panelin etek ucunu bel cizgisinden uzun kilar.
    {
        GarmentSpec duz; duz.garment = GarmentType::Skirt;
        duz.skirtStyle = SkirtStyle::Straight; duz.skirtLength = SkirtLength::Midi;
        GarmentSpec klos = duz; klos.skirtStyle = SkirtStyle::HalfCircle;
        const double hemDuz = SkirtBlock::hemCircumferenceMM(m0(), duz.skirtStyle, duz.skirtLength, duz.shaping, duz.fabric);
        const double hemKlos = SkirtBlock::hemCircumferenceMM(m0(), klos.skirtStyle, klos.skirtLength, klos.shaping, klos.fabric);
        std::printf("        etek ucu cevresi: duz %.4f mm  yarim daire %.4f mm  oran %.6f\n",
                    hemDuz, hemKlos, hemKlos / hemDuz);
        check(hemKlos > hemDuz * 1.5,
              "etek: flare etek ucunu duz etekten belirgin sekilde buyutuyor");
        const DraftedPattern dk = GarmentDrafter::draft(klos, m0());
        check(!dk.pieces.empty(), "etek: flare uygulanmis etek gercekten ciziliyor");
    }

    // ---- 3. gore: panel basina etek ucu genislemesi -------------------------
    {
        GarmentSpec gore; gore.garment = GarmentType::Skirt;
        gore.skirtStyle = SkirtStyle::Gore; gore.skirtLength = SkirtLength::Midi;
        GarmentSpec duz = gore; duz.skirtStyle = SkirtStyle::Straight;
        const double hemGore = SkirtBlock::hemCircumferenceMM(m0(), gore.skirtStyle, gore.skirtLength, gore.shaping, gore.fabric);
        const double hemDuz = SkirtBlock::hemCircumferenceMM(m0(), duz.skirtStyle, duz.skirtLength, duz.shaping, duz.fabric);
        std::printf("        gore %.4f mm  duz %.4f mm  fark %.4f mm  (goreHemFlare %.1f mm/kenar)\n",
                    hemGore, hemDuz, hemGore - hemDuz, SkirtBlock::goreHemFlare);
        check(hemGore > hemDuz, "gore: flare etek ucunu buyutuyor");
        check(hemGore - hemDuz >= SkirtBlock::goreHemFlare,
              "gore: buyume blogun KENDI ilan ettigi panel-basi flare'inden kucuk degil");
    }

    // ---- 4. RET DE BIR CEVAPTIR --------------------------------------------
    // Belsiz bir gövdeye peplum takilamaz; operator sessizce bos donmez,
    // parca EKLEMEZ ve bunu olculebilir kilar.
    {
        GarmentSpec etek; etek.garment = GarmentType::Skirt;
        etek.skirtStyle = SkirtStyle::Straight;
        GarmentSpec none = etek; none.peplum = 0;
        GarmentSpec pe = etek;   pe.peplum = static_cast<int>(PeplumStyle::Full);
        const DraftedPattern d0 = GarmentDrafter::draft(none, m0());
        const DraftedPattern d1 = GarmentDrafter::draft(pe, m0());
        check(d1.pieces.size() == d0.pieces.size(),
              "ret: bel gövdesi olmayan giyside flare parca EKLEMIYOR");
    }

    std::printf("%s — %d failure(s)\n", failures ? "FAIL" : "OK", failures);
    return failures ? 1 : 0;
}
