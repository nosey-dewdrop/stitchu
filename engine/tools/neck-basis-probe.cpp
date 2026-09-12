// neck-basis-probe — armhole-basis-probe'un yaka ikizi.
//
// SORU (F-F kartı): yaka DELİĞİ mi sapıyor, collar PARÇASI mı?
// Bu prob ikisini AYRI basar, ve hangisinin hangi çizgide ölçüldüğünü yazar —
// okuyucuya bırakılmaz.
//
// TEMEL:
//   bizim delik  = BodiceBlock::neckEdgeLength (bodice.hpp:287) — DRAWN edge,
//                  ön yaka kenarı + arka yaka kenarı, iki yaka da tam.
//                  Motorumuz kesim çizgisini çiziyor (docs/H1.0-KAPI.md §0 ile
//                  aynı temel), yani bu KESİM çizgisi sayısıdır.
//   Buğra delik  = docs/H1.0-KAPI.md §0 zemin tablosu, yaka-ön + yaka-arka,
//                  kesim çizgisi, ÖLÇÜLDÜ (PDF vektör).
//   çapa         = yaka deliği >= boyun ÇEVRESİ. Aldrich'te asgari YOK
//                  (doğrulanmış yokluk: knowledge/yaka-kolsuz-armhole-2026-08-16.md §3);
//                  alt sınırı uydurmadan veren tek ölçüm Buğra EU38'in
//                  350.41mm deliği ile sözleşmenin 350mm boynu (0.41mm).
//
// OFSETİN YÖNÜ — KARAR VE GEREKÇE (2026-08-23):
//   Yaka deliği parçadan DIŞARI oyulmuş bir çukurdur: parçanın içinden bakınca
//   kenar İÇBÜKEY. Kol oyuğu da öyle, ve orada ölçüldü ki 10mm iç ofset içbükey
//   kenarı UZATIR (+34.3..36.2mm, 8 beden — knowledge/cap-ease-isareti-2026-08-17.md:17).
//   Aynı işaret yakada da geçerli: dikiş çizgisindeki yaka deliği, kesim
//   çizgisindekinden UZUNDUR. Bu yüzden bir dikiş payı ekleyip kesim sayısını
//   yükseltmek bize AVANTAJ yazar — bu prob ofset EKLEMEZ, iki tarafı da kesim
//   çizgisinde tutar, ve çapayı kesim çizgisinde yargılar. (Buğra'nın 350.41 vs
//   350mm'si de kesim çizgisindeydi; çapa oradan geliyor.)
//   Sayısal teyit aşağıda: her yarının yay/kiriş oranı basılıyor; oran > 1 ise
//   kenar düz değil, ve kirişin hangi tarafında kaldığı içbükeyliği söylüyor.

#include <cmath>
#include <cstdio>
#include <string>

#include "../src/bodice.hpp"
#include "../src/collar.hpp"
#include "../src/garment.hpp"
#include "../src/sizechart.hpp"

using namespace stitchu;

namespace {

constexpr int kSizes[8] = {34, 36, 38, 40, 42, 44, 46, 48};

// docs/H1.0-KAPI.md §0 — Buğra Locket, KESİM çizgisi. {yaka-ön, yaka-arka}.
constexpr double kBugraNeckMM[8][2] = {
    {216.00, 130.75}, {218.79, 131.50}, {218.75, 131.66}, {225.76, 138.22},
    {231.66, 142.22}, {234.73, 146.02}, {237.60, 147.00}, {239.93, 149.24},
};

}  // namespace

int main() {
    std::printf("--- yaka DELIGI (kesim cizgisi, tam delik) ---\n");
    std::printf("beden | boyun cevresi | bizim delik | delik-boyun | Bugra delik"
                " | Bugra-boyun | bizim/Bugra\n");
    double prev = 0.0;
    for (int i = 0; i < 8; ++i) {
        const SizeChartEntry* e = euSize("EU" + std::to_string(kSizes[i]));
        if (!e) { std::printf("EU%2d: beden tablosunda YOK\n", kSizes[i]); continue; }
        const BodyMeasurementsSnapshot m = e->body;
        const double ours = BodiceBlock::neckEdgeLength(m, Neckline::Crew);
        const double bugra = kBugraNeckMM[i][0] + kBugraNeckMM[i][1];
        std::printf("EU%2d  | %13.2f | %11.2f | %+11.2f | %11.2f | %+11.2f | %6.3f",
                    kSizes[i], m.neckMM(), ours, ours - m.neckMM(), bugra,
                    bugra - m.neckMM(), ours / bugra);
        if (i > 0) std::printf("  adim %+6.2f", ours - prev);
        std::printf("\n");
        prev = ours;
    }

    // --- COLLAR PARCASI ------------------------------------------------------
    // collar.hpp:65 — collar boyun kenari INSAAT GEREGI yakaya trued. Iddiaya
    // guvenmiyoruz: burada gercekten olculuyor. Sapma varsa DELIKTE degil
    // PARCADA demektir; 0.00 ise parca aklanir ve butun sapma delige duser.
    std::printf("\n--- collar PARCASI (necklineLengthMM vs neckEdgeLength) ---\n");
    std::printf("beden | pattern yaka | bodice yaka | fark mm\n");
    for (int i = 0; i < 8; ++i) {
        const SizeChartEntry* e = euSize("EU" + std::to_string(kSizes[i]));
        if (!e) continue;
        const BodyMeasurementsSnapshot m = e->body;
        GarmentSpec spec;
        spec.neckline = Neckline::Crew;
        const DraftedPattern p = GarmentDrafter::draft(spec, m);
        const double fromPieces = CollarBlock::necklineLengthMM(p);
        const double fromBodice = BodiceBlock::neckEdgeLength(m, Neckline::Crew);
        std::printf("EU%2d  | %12.2f | %11.2f | %+7.2f\n", kSizes[i], fromPieces,
                    fromBodice, fromPieces - fromBodice);
    }

    std::printf(
        "\ntemel: iki taraf da KESIM cizgisi. Ofset EKLENMEDI — yaka deligi\n"
        "       icbukey, ic ofset onu UZATIR, yani ofset eklemek bizi KAYIRIR.\n"
        "       capa: yaka deligi >= boyun cevresi (Aldrich'te asgari YOK,\n"
        "       dogrulanmis yokluk; tek olcum Bugra EU38 350.41 vs 350.00mm).\n");
    return 0;
}
