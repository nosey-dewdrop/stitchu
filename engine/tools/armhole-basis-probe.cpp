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

#include <cmath>
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

// Buğra'nın oyuğunun TERİM TERİM ölçümü — aynı ring/seamgraph verisinden,
// patterns_real/geometry/geometry-full.json + seamgraph.json, `OYUK-on` ve
// `OYUK-arka` kenarları. Sütunlar, her yarı için:
//   dx (yatay açıklık), dy (dikey derinlik), kiriş, yay (=kesim mm), yay/kiriş.
// Yay sütunları docs/H1.0-KAPI.md §0'ın oyuk-ön / oyuk-arka sütunlarıyla
// birebir aynı sayıyı basıyor (205.50 / 219.00 ...) — aynı zemin.
// Üretim: patterns_real/tools/trace-match.py ile aynı resample(1mm) yolu.
constexpr double kBugraHalf[8][10] = {
    {58.82, 162.21, 166.06, 205.50, 1.24, 48.24, 185.81, 186.16, 219.00, 1.18},  // EU34
    {62.60, 163.12, 168.55, 207.99, 1.23, 51.81, 186.67, 187.71, 220.92, 1.18},  // EU36
    {67.92, 163.35, 171.65, 210.99, 1.23, 55.84, 186.58, 188.91, 222.00, 1.18},  // EU38
    {76.13, 166.04, 175.80, 221.80, 1.26, 58.83, 189.35, 192.56, 226.00, 1.17},  // EU40
    {81.64, 168.19, 180.86, 226.98, 1.25, 63.45, 192.36, 197.24, 230.85, 1.17},  // EU42
    {87.13, 170.21, 186.02, 231.97, 1.25, 67.61, 194.62, 201.37, 234.86, 1.17},  // EU44
    {91.63, 171.77, 189.96, 235.95, 1.24, 71.24, 196.80, 205.01, 238.69, 1.16},  // EU46
    {100.44, 174.01, 197.18, 242.63, 1.23, 77.69, 198.72, 210.10, 243.85, 1.16},  // EU48
};

// Buğra'nın KENDİ beden tablosu (geometry-full.json:sizeChartMM) — bizimkiyle
// aynı etikette AYNI BEDEN DEĞİL. Buğra EU34 büst 840mm, bizim EU34 800mm.
// Kıyas yapılırken bu ofset raporda basılır, sessizce yutulmaz.
constexpr double kBugraBustMM[8] = {840, 880, 920, 960, 1000, 1040, 1080, 1120};

}  // namespace

int main() {
    // --- REJIM TABLOSU -------------------------------------------------------
    // bodice.cpp:642  armholeY = min(cap, max(torsoArmholeY, armholeDepthForArm))
    // Iki rejim FARKLI hizda buyuyor: torso backLength'e, arm bust'a bagli.
    // max() iki farkli egimli dogruyu birlestirdiginde gecis noktasinda KIRILIR.
    // Bu tablo o gecisin hangi bedende oldugunu basar; kol oyugu adimindaki
    // sicrama orada aranir, ozel-durum if'iyle yamanmaz.
    std::printf("--- derinlik rejimi (bodice.cpp:642) ---\n");
    std::printf("beden |    bust | backLen | torso*.44 |  arm b*.18 |  cap*.72 | rejim\n");
    for (int i = 0; i < 8; ++i) {
        const std::string label = "EU" + std::to_string(kSizes[i]);
        const SizeChartEntry* e = euSize(label);
        if (!e) continue;
        const BodyMeasurementsSnapshot m = e->body;
        const double drop = BodiceBlock::shoulderSeamTargetMM *
                            std::sin(BodiceBlock::shoulderSlopeDeg * M_PI / 180.0);
        const double torso = m.backLengthMM() * BodiceBlock::armholeDepthFactor + drop;
        const double arm = m.bustMM() * BodiceBlock::bicepsRatioForArmscye *
                               BodiceBlock::armscyeArmFactor + drop;
        const double cap = m.backLengthMM() * BodiceBlock::armscyeMaxDepthShare + drop;
        const double y = std::min(cap, std::max(torso, arm));
        const char* which = (std::fabs(y - cap) < 1e-9) ? "CAP"
                          : (arm > torso ? "ARM" : "TORSO");
        std::printf("EU%2d  | %7.1f | %7.1f | %9.2f | %10.2f | %8.2f | %s\n",
                    kSizes[i], m.bustMM(), m.backLengthMM(), torso, arm, cap, which);
    }
    std::printf("\n");

    // --- TERIM TERIM AYRISTIRMA ---------------------------------------------
    // Toplam farkin nereden geldigini soyler: genislik (dx), derinlik (dy),
    // yoksa egrinin OYULMASI (yay/kiris) mi?
    std::printf("--- oyuk terim terim (bizim vs Bugra, ayni yari) ---\n");
    std::printf("beden | yari  |    dx  |  Bdx  |    dy  |  Bdy  | kiris | Bkiris"
                " |  yay  |  Byay | y/k  | By/k\n");
    for (int i = 0; i < 8; ++i) {
        const std::string label = "EU" + std::to_string(kSizes[i]);
        const SizeChartEntry* e = euSize(label);
        if (!e) continue;
        BodiceBlock::BodiceOptions o;
        const BodiceDraft d = BodiceBlock::draft(e->body, o);
        for (int h = 0; h < 2; ++h) {
            const double dx = (h == 0 ? d.frontChestWidth : d.backChestWidth) -
                              (h == 0 ? d.frontShoulderTipX : d.backShoulderTipX);
            const double dy = d.armholeUnderarmY -
                              (h == 0 ? d.frontShoulderTipY : d.backShoulderTipY);
            const double arc = h == 0 ? d.frontArmholeLength : d.backArmholeLength;
            const double chord = std::hypot(dx, dy);
            const double* B = &kBugraHalf[i][h * 5];
            std::printf("EU%2d  | %s | %6.2f | %5.2f | %6.2f | %5.2f | %5.1f | %5.1f "
                        "| %5.1f | %5.1f | %.3f | %.3f\n",
                        kSizes[i], h == 0 ? "on   " : "arka ", dx, B[0], dy, B[1],
                        chord, B[2], arc, B[3], arc / chord, B[4]);
        }
    }
    std::printf("\nBugra kendi beden tablosu bizimkiyle ayni degil (mm bust):\n");
    for (int i = 0; i < 8; ++i) {
        const SizeChartEntry* e = euSize("EU" + std::to_string(kSizes[i]));
        std::printf("  EU%2d bizim %6.1f | Bugra %6.1f | fark %+5.1f\n", kSizes[i],
                    e ? e->body.bustMM() : 0.0, kBugraBustMM[i],
                    (e ? e->body.bustMM() : 0.0) - kBugraBustMM[i]);
    }
    std::printf("\n");

    std::printf(
        "beden | bizim DIKIS | Bugra DIKIS (kesim+ofset) | fark mm | fark %% | "
        "Bugra KESIM\n");
    std::printf(
        "------|-------------|---------------------------|---------|--------|"
        "-----------\n");

    double prevOurs = 0.0;
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

        std::printf("EU%2d  | %11.2f | %9.2f (%.2f..%.2f) | %+7.2f | %+5.1f%% | %10.2f",
                    kSizes[i], ours, bugraSewMid, bugraSewLo, bugraSewHi, diff, pct,
                    kBugraCutMM[i]);
        if (i > 0) std::printf("  adim %+6.2f", ours - prevOurs);
        std::printf("\n");
        prevOurs = ours;
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
