// armhole-basis-probe — sevk edilen `garment` hattının kol oyuğunu, Buğra'nın
// ölçülen zemin tablosuyla AYNI TEMELDE basar.
//
// NEDEN VAR: 22 Ağu'da ölçüldü ki iki sayı aynı temelde değil.
//   bodice.hpp:36   armholeLength — "one arm, front half + back half, SEWING line"
//   docs/H1.0-KAPI.md:25  Buğra zemin tablosu — "kesim çizgisi"
// Oyuk İÇBÜKEY olduğu için 10mm iç ofset onu UZATIR (+34.3…+36.2mm, 8 bedende
// ölçülü: knowledge/cap-ease-isareti-2026-08-17.md:17). Yani kesim çizgisindeki
// bir sayıyı dikiş çizgisindeki bir sayıyla kıyaslamak ~35mm bizi KAYIRIR.
// Bu prob iki temeli de basar ve farkı ikisinde de gösterir; hangi sütuna
// bakıldığı okuyucuya bırakılmaz.
//
// Buğra sayıları docs/H1.0-KAPI.md §0 zemin tablosundan, kesim çizgisi, tek kol
// oyuğu (ön + arka). Fikstürdeki kopyasıyla aynı: h10_gate_check.cpp:41.

#include <cstdio>
#include <string>

#include "../src/bodice.hpp"
#include "../src/sizechart.hpp"

using namespace stitchu;

namespace {

// docs/H1.0-KAPI.md §0 — Buğra Locket, KESİM çizgisi, tek kol oyuğu (ön+arka).
constexpr int kSizes[8] = {34, 36, 38, 40, 42, 44, 46, 48};
constexpr double kBugraCutMM[8] = {424.50, 428.91, 432.99, 447.80,
                                   457.83, 466.83, 474.64, 486.48};

// knowledge/cap-ease-isareti-2026-08-17.md:17 — 10mm iç ofset içbükey oyuğu
// +34.3…+36.2mm uzatır. Orta değer; bant uçları raporda ayrıca basılır.
constexpr double kOffsetLoMM = 34.3;
constexpr double kOffsetHiMM = 36.2;

}  // namespace

int main() {
    std::printf(
        "beden | bizim DIKIS | Bugra DIKIS (kesim+ofset) | fark mm | fark %% | "
        "Bugra KESIM\n");
    std::printf(
        "------|-------------|---------------------------|---------|--------|"
        "-----------\n");

    for (int i = 0; i < 8; ++i) {
        const std::string label = "EU" + std::to_string(kSizes[i]);
        const SizeChartEntry* e = euSize(label);
        if (!e) { std::printf("%s: beden tablosunda YOK\n", label.c_str()); continue; }
        const BodyMeasurementsSnapshot m = e->body;

        BodiceBlock::BodiceOptions o;  // varsayılan nesne — §0.14 ürün hattı
        const BodiceDraft d = BodiceBlock::draft(m, o);

        const double ours = d.armholeLength;  // dikiş çizgisi, tek kol, on+arka
        const double bugraSewLo = kBugraCutMM[i] + kOffsetLoMM;
        const double bugraSewHi = kBugraCutMM[i] + kOffsetHiMM;
        const double bugraSewMid = 0.5 * (bugraSewLo + bugraSewHi);

        const double diff = ours - bugraSewMid;
        const double pct = 100.0 * diff / bugraSewMid;

        std::printf("EU%2d  | %11.2f | %9.2f (%.2f..%.2f) | %+7.2f | %+5.1f%% | %10.2f\n",
                    kSizes[i], ours, bugraSewMid, bugraSewLo, bugraSewHi, diff, pct,
                    kBugraCutMM[i]);
    }

    std::printf(
        "\ntemel: bizim = bodice.hpp:36 armholeLength (dikis cizgisi, tek kol, "
        "on+arka)\n"
        "       Bugra  = docs/H1.0-KAPI.md SS0 kesim cizgisi + %.1f..%.1fmm "
        "icbukey ofset\n"
        "       ofset kaynagi: knowledge/cap-ease-isareti-2026-08-17.md:17 "
        "(8 bedende olculu)\n",
        kOffsetLoMM, kOffsetHiMM);
    return 0;
}
