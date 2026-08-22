// garment_armhole_check — SEVK EDİLEN hattın kol oyuğu + yaka kapısı.
// Kart: GECE/KART/F-F-kalip.md · ortak kural: GECE/KART/ORTAK.md
//
// NE YARGILANIYOR: `BodiceBlock::draft(body, BodiceOptions{})` — varsayılan
// nesne, yani müşteriye giden hat. Sekiz beden EU34..EU48.
//
// ── ÖLÇÜT (v5 §C): YAYINLANMIŞ BANT, MOTORUN ÇIKTISI DEĞİL ──────────────────
// K1  Aldrich sanity çapası: tek kol oyuğu çevresi 40–44cm.
//     knowledge/drafting-math-eu38.md:38 — "Armhole ÇEVRESİ Aldrich'te YOK,
//     çizilen scye'den ölçülür. Sanity çapa: toplam armhole ~40-44cm, MED."
//     Formül yok, BANT var. Bant gevşetilmez (ORTAK.md md.2).
//
//     ★ BANDIN HANGİ ÇİZGİDE OLDUĞU — KARAR + GEREKÇE (2026-08-23):
//     **DİKİŞ (net) çizgisi.** Üç sebep:
//     (1) Aldrich blokları NET çizilir; dikiş payını çizen kişi sonradan ekler.
//         Bandı veren cümle "çizilen scye'den ölçülür" diyor — çizilen scye o
//         net hattır.
//     (2) Bizim sayımız zaten dikiş çizgisi (bodice.hpp:36 "sewing line").
//         Aynı temel, dönüştürme yok, dönüştürme hatası da yok.
//     (3) Bu bizim ALEYHİMİZE olan okuma. Oyuk İÇBÜKEY: 10mm iç ofset onu
//         +34.3..36.2mm UZATIR (8 bedende ölçülü,
//         knowledge/cap-ease-isareti-2026-08-17.md:17). Sayımıza "kesim
//         çizgisi" deseydik bandı ~35mm daha yukarıdan yakalardık, yani
//         kendimizi kayırırdık. Kayırmıyoruz.
//
// K2  Grade: adımlar monoton ARTAN ve max/medyan <= 1.6.
//     Tavan kartın kendi şartı (F-F-kalip.md); 22 Ağu'da ölçülen 2.9'un
//     üstüne değil, ALTINA konmuş bir hedef. Motorun çıktısından türetilmedi.
//
// K3  Yaka deliği >= boyun çevresi. Aldrich'te asgari YOK — doğrulanmış
//     yokluk (knowledge/yaka-kolsuz-armhole-2026-08-16.md §3). Alt sınırı
//     uydurmadan veren tek ölçüm: Buğra EU38 deliği 350.41mm, sözleşme boynu
//     350.00mm (docs/H1.0-KAPI.md §0). Buğra 8 bedenin 7'sinde >= boyun.
//
// ── BUĞRA = PARİTE, KAPI DEĞİL (v5 §C) ─────────────────────────────────────
// Buğra sütunları BASILIR, hiçbir hüküm vermez. Satın alınmış tek bir kalıp
// bir ölçüt değil bir tanıktır.
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/bodice.hpp"
#include "../src/sizechart.hpp"

using namespace stitchu;

namespace {

const char* kSizes[8] = {"EU34", "EU36", "EU38", "EU40", "EU42", "EU44", "EU46", "EU48"};

// KAYNAKLI — Aldrich sanity bandı, dikiş çizgisi (yukarıdaki karar).
constexpr double kArmholeMinMM = 400.0;
constexpr double kArmholeMaxMM = 440.0;
// Kartın grade tavanı (GECE/KART/F-F-kalip.md).
constexpr double kStepRatioMax = 1.6;

// PARİTE — ÖLÇÜLDÜ, Buğra Locket, KESİM çizgisi (docs/H1.0-KAPI.md §0).
constexpr double kBugraArmholeCutMM[8] = {424.50, 428.91, 432.99, 447.80,
                                          457.83, 466.83, 474.64, 486.48};
constexpr double kBugraNeckCutMM[8] = {346.75, 350.29, 350.41, 363.98,
                                       373.88, 380.75, 384.60, 389.17};

int fails = 0, judged = 0;

void verdict(const char* size, const char* label, bool ok, const std::string& detail) {
    ++judged;
    if (!ok) ++fails;
    std::printf("  %-5s %-10s %-5s %s\n", size, label, ok ? "ok" : "FAIL", detail.c_str());
}

std::string mm(double v) {
    char buf[64];
    std::snprintf(buf, sizeof(buf), "%.2fmm", v);
    return buf;
}

}  // namespace

int main() {
    std::vector<double> armhole, neck;
    std::printf("== garment_armhole_check — sevk edilen hat, EU34..EU48 ==\n\n");

    std::printf("-- PARITE RAPORU (KAPI DEGIL): Bugra Locket, kesim cizgisi --\n");
    std::printf("beden | bizim oyuk (dikis) | Bugra oyuk (kesim) | bizim yaka | Bugra yaka\n");
    for (int i = 0; i < 8; ++i) {
        const SizeChartEntry* e = euSize(kSizes[i]);
        if (!e) { std::printf("%s: beden tablosunda YOK\n", kSizes[i]); return 1; }
        BodiceBlock::BodiceOptions o;  // varsayilan nesne = sevk edilen hat
        const BodiceDraft d = BodiceBlock::draft(e->body, o);
        const double nk = BodiceBlock::neckEdgeLength(e->body, Neckline::Crew);
        armhole.push_back(d.armholeLength);
        neck.push_back(nk);
        std::printf("%-5s | %18.2f | %18.2f | %10.2f | %10.2f\n", kSizes[i],
                    d.armholeLength, kBugraArmholeCutMM[i], nk, kBugraNeckCutMM[i]);
    }

    // BİLGİ, HÜKÜM DEĞİL: K1'in bandı satın alınmış kalıba da uygulanınca ne
    // oluyor? Buğra'nın kesim sayısına ölçülen içbükey ofsetin ORTASI eklenir
    // (knowledge/cap-ease-isareti-2026-08-17.md:17 — 34.3..36.2mm) ve aynı
    // dikiş-çizgisi bandıyla kıyaslanır. Bu bir kapı DEĞİL; bandın 8 bedeni
    // birden tutup tutamayacağını Damla'nın görmesi için basılıyor.
    std::printf("\n-- BILGI: K1 bandi SATIN ALINMIS kalibi gecirir mi? (hukum degil) --\n");
    {
        int inBand = 0;
        for (int i = 0; i < 8; ++i) {
            const double sew = kBugraArmholeCutMM[i] + 0.5 * (34.3 + 36.2);
            const bool ok = sew >= kArmholeMinMM && sew <= kArmholeMaxMM;
            if (ok) ++inBand;
            std::printf("  %-5s Bugra dikis %7.2fmm  kesim %7.2fmm  -> band(dikis) %s"
                        "  band(kesim) %s\n",
                        kSizes[i], sew, kBugraArmholeCutMM[i], ok ? "ICINDE" : "DISINDA",
                        (kBugraArmholeCutMM[i] >= kArmholeMinMM &&
                         kBugraArmholeCutMM[i] <= kArmholeMaxMM) ? "ICINDE" : "DISINDA");
        }
        std::printf("  -> Bugra dikis cizgisinde 8 bedenin %d'i bantta.\n", inBand);
    }

    std::printf("\n-- K1: kol oyugu %.0f-%.0fmm (Aldrich sanity, dikis cizgisi) --\n",
                kArmholeMinMM, kArmholeMaxMM);
    for (int i = 0; i < 8; ++i) {
        const bool ok = armhole[i] >= kArmholeMinMM && armhole[i] <= kArmholeMaxMM;
        verdict(kSizes[i], "K1 oyuk", ok, mm(armhole[i]));
    }

    std::printf("\n-- K2: grade adimlari monoton + max/medyan <= %.1f --\n", kStepRatioMax);
    std::vector<double> steps;
    for (int i = 1; i < 8; ++i) {
        const double s = armhole[i] - armhole[i - 1];
        steps.push_back(s);
        verdict(kSizes[i], "K2 adim", s > 0.0, mm(s) + " (monoton artan mi)");
    }
    std::vector<double> sorted = steps;
    std::sort(sorted.begin(), sorted.end());
    const double median = sorted[sorted.size() / 2];  // 7 adim -> tam orta
    const double maxStep = sorted.back();
    const double ratio = median > 0 ? maxStep / median : 1e9;
    {
        char buf[160];
        std::snprintf(buf, sizeof(buf), "max %.2f / medyan %.2f = %.3f", maxStep, median, ratio);
        verdict("hepsi", "K2 oran", ratio <= kStepRatioMax, buf);
    }

    std::printf("\n-- K3: yaka deligi >= boyun cevresi --\n");
    for (int i = 0; i < 8; ++i) {
        const SizeChartEntry* e = euSize(kSizes[i]);
        const double girth = e->body.neckMM();
        char buf[160];
        std::snprintf(buf, sizeof(buf), "delik %.2f vs boyun %.2f (%+.2f)", neck[i], girth,
                      neck[i] - girth);
        verdict(kSizes[i], "K3 yaka", neck[i] >= girth, buf);
    }

    std::printf("\n%d yargi, %d FAIL\n", judged, fails);
    return fails == 0 ? 0 : 1;
}
