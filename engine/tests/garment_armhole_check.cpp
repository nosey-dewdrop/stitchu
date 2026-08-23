// garment_armhole_check — SEVK EDİLEN hattın kol oyuğu + yaka kapısı.
// Kart: GECE/KART/F-M-olcut.md · ortak kural: GECE/KART/ORTAK.md
//
// NE YARGILANIYOR: `BodiceBlock::draft(body, BodiceOptions{})` — varsayılan
// nesne, yani müşteriye giden hat. Sekiz beden EU34..EU48.
//
// ══ 2026-08-23 · F-M — K1 ÜÇE AYRILDI, ÇÜNKÜ TEK KAPI YANLIŞ KURULMUŞTU ══════
// Eski hâli 40–44cm bandını SEKİZ bedene birden kapı yapıyordu. Ölçüldü
// (F-F, 23 Ağu; aşağıda "BILGI" bloğu aynı sayıyı her koşuda basar): satın
// alınmış Buğra kalıbının KENDİSİ o bantla dikiş çizgisinde 8/8 DIŞARIDA
// (459–522mm). Referans kalıbın geçemediği bant bir kapı değildir. Bandı veren
// cümlenin dosya adı da tek beden: `knowledge/drafting-math-eu38.md:38` —
// "Armhole ÇEVRESİ Aldrich'te yok — çizilen scye'den ölçülür. Sanity çapa:
// toplam armhole ~40-44cm (≈42), MED." → **eu38**. Bu bir BEDEN-BAŞI çapasıdır.
//
// İki AYRI büyüklük vardır, tek kapıya sıkıştırılamaz
// (`knowledge/POM-TOLERANS-URBN-2026-08-23.md`):
//   TASARIM BANDI    — hangi blok çizilmiş. Aldrich 40–44cm, TABAN bedende.
//   ÜRETİM TOLERANSI — aynı spec'in iki kopyası ne kadar ayrışabilir.
//                      URBN AH01 "Armhole - düz", dokuma Seviye 1 (W1):
//                      3/16" = 4.76mm. Koda bağlı, yayınlanmış.
//
// ── ÜÇ ALT KAPI ─────────────────────────────────────────────────────────────
// K1  TABAN BEDEN. EU38'de tek kol oyuğu çevresi 40–44cm, DİKİŞ çizgisinde.
//     TEK beden yargılanır (bandın kaynağı tek beden). Diğer yedi beden
//     BASILIR, hüküm vermez.
//
//     ★ BANDIN HANGİ ÇİZGİDE OLDUĞU — KARAR + GEREKÇE (2026-08-23):
//     **DİKİŞ (net) çizgisi.** Üç sebep:
//     (1) Aldrich blokları NET çizilir; dikiş payını çizen kişi sonradan ekler.
//         Bandı veren cümle "çizilen scye'den ölçülür" diyor — çizilen scye o
//         net hattır.
//     (2) Bizim sayımız zaten dikiş çizgisi (bodice.hpp "sewing line").
//         Aynı temel, dönüştürme yok, dönüştürme hatası da yok.
//     (3) Bu bizim ALEYHİMİZE olan okuma. Oyuk İÇBÜKEY: 10mm iç ofset onu
//         +34.3..36.2mm UZATIR (8 bedende ölçülü,
//         knowledge/cap-ease-isareti-2026-08-17.md:17). Sayımıza "kesim
//         çizgisi" deseydik bandı ~35mm daha yukarıdan yakalardık, yani
//         kendimizi kayırırdık. Kayırmıyoruz.
//
// K1b GRADE TUTARLILIĞI. Bandın yerine sekiz bedeni yargılayan şey budur.
//     URBN sevkiyat kuralı, birebir: "GARMENTS MUST HAVE AN APPARENT GRADE
//     BETWEEN SIZES FOR SHIPMENT TO BE ACCEPTABLE"
//     (`knowledge/POM-TOLERANS-URBN-2026-08-23.md`, "İki kural"). İki şart:
//     her adım > 0 (görünür grade) VE max/medyan <= 1.6 (tek beden atlaması
//     olmasın). 1.6 tavanı kartın şartı (F-M-olcut.md); ölçülen 1.619'un
//     ALTINA konmuştur, motorun çıktısından TÜRETİLMEMİŞTİR.
//
// K1c ÜRETİM TOLERANSI = DETERMİNİZM. Aynı spec iki kez "üretilince" fark
//     <= 4.76mm (AH01 W1). Vakum olmasın diye iki koşu FARKLI SIRADA yapılır
//     (ileri EU34..EU48, geri EU48..EU34); saklı durum / sıra bağımlılığı
//     böyle yakalanır. Bizim gerçek hedefimiz 0.00mm; kapı yayınlanmış
//     toleransta.
//
// K3  Yaka deliği >= boyun çevresi. Aldrich'te asgari YOK — doğrulanmış
//     yokluk (knowledge/yaka-kolsuz-armhole-2026-08-16.md §3). Alt sınırı
//     uydurmadan veren tek ölçüm: Buğra 38 deliği 350.41mm, sözleşme boynu
//     350.00mm (docs/H1.0-KAPI.md §0). Buğra 8 bedenin 7'sinde >= boyun.
//
// ── BUĞRA = PARİTE, KAPI DEĞİL (v5 §C, ORTAK.md md.4) ───────────────────────
// Buğra sütunları BASILIR, hiçbir hüküm vermez. Satın alınmış tek bir kalıp
// bir ölçüt değil bir tanıktır.
//
// ★★ EŞLEŞTİRME BÜST ÜZERİNDEN, ETİKET ÜZERİNDEN DEĞİL. Buğra'nın yayınlanmış
//    beden tablosu (`patterns_real/Locket Top/1 Sizes.jpg`, satıcının kendi
//    çizelgesi) bizimkiyle AYNI DEĞİL: her etikette **+40mm büst** taşıyor.
//      Buğra 34..48 büst: 84 88 92 96 100 104 108 112 cm
//      bizim EU34..48 :   80 84 88 92  96 100 104 110 cm  (contract/tables.json)
//    Yani "aynı bedende" diye kıyaslanan her satır bir beden kaymıştı. Aşağıdaki
//    parite tablosu artık BÜSTLE eşleştirir; büsti tutmayan satır boş kalır.
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

// K1 — KAYNAKLI, Aldrich sanity bandı, dikiş çizgisi, TABAN BEDEN.
constexpr const char* kBaseSize = "EU38";
constexpr double kArmholeMinMM = 400.0;
constexpr double kArmholeMaxMM = 440.0;
// K1b — URBN "apparent grade" + kartın tavanı (GECE/KART/F-M-olcut.md).
constexpr double kStepRatioMax = 1.6;
// K1c — URBN AH01 dokuma Seviye 1 (W1) = 3/16 inç.
constexpr double kProdTolMM = 3.0 / 16.0 * 25.4;  // 4.7625

// PARİTE — ÖLÇÜLDÜ, Buğra Locket, KESİM çizgisi (docs/H1.0-KAPI.md §0).
// Etiketler BUĞRA'NIN kendi etiketleri; büstleri satıcının kendi çizelgesinden.
const char* kBugraLabel[8] = {"B34", "B36", "B38", "B40", "B42", "B44", "B46", "B48"};
constexpr double kBugraBustCM[8] = {84, 88, 92, 96, 100, 104, 108, 112};
constexpr double kBugraArmholeCutMM[8] = {424.50, 428.91, 432.99, 447.80,
                                          457.83, 466.83, 474.64, 486.48};
constexpr double kBugraNeckCutMM[8] = {346.75, 350.29, 350.41, 363.98,
                                       373.88, 380.75, 384.60, 389.17};
// ÖLÇÜLDÜ — oyuk içbükey olduğu için 10mm iç ofset onu UZATIR, 8 bedende
// +34.3..36.2mm (knowledge/cap-ease-isareti-2026-08-17.md:17). Kesim -> dikiş.
constexpr double kCutToSewMinMM = 34.3;
constexpr double kCutToSewMaxMM = 36.2;

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

// Büstü tutan Buğra bedeninin indeksi; yoksa -1. Tolerans 0.5cm: iki çizelge de
// tam sayı cm basıyor, ara değer yok.
int bugraByBust(double bustCM) {
    for (int i = 0; i < 8; ++i)
        if (std::fabs(kBugraBustCM[i] - bustCM) < 0.5) return i;
    return -1;
}

}  // namespace

int main() {
    std::vector<double> armhole, neck, bustCM;
    std::printf("== garment_armhole_check — sevk edilen hat, EU34..EU48 ==\n\n");

    for (int i = 0; i < 8; ++i) {
        const SizeChartEntry* e = euSize(kSizes[i]);
        if (!e) { std::printf("%s: beden tablosunda YOK\n", kSizes[i]); return 1; }
        BodiceBlock::BodiceOptions o;  // varsayilan nesne = sevk edilen hat
        const BodiceDraft d = BodiceBlock::draft(e->body, o);
        armhole.push_back(d.armholeLength);
        neck.push_back(BodiceBlock::neckEdgeLength(e->body, Neckline::Crew));
        bustCM.push_back(e->body.bustCM);
    }

    // ── PARİTE: eşleştirme BÜSTLE ────────────────────────────────────────────
    std::printf("-- PARITE RAPORU (KAPI DEGIL) — ESLESTIRME BUST UZERINDEN, ETIKET UZERINDEN DEGIL --\n");
    std::printf("   Bugra beden tablosu bizimkiyle ayni degil: her etikette +40mm bust\n");
    std::printf("   (patterns_real/Locket Top/1 Sizes.jpg vs contract/tables.json).\n");
    std::printf("bizim | bust | Bugra | bust | bizim oyuk(dikis) | Bugra oyuk(kesim) | Bugra oyuk(dikis~) | fark(dikis)\n");
    for (int i = 0; i < 8; ++i) {
        const int b = bugraByBust(bustCM[i]);
        if (b < 0) {
            std::printf("%-5s | %4.0f | %-5s | %4s | %17.2f | %17s | %18s | %s\n", kSizes[i],
                        bustCM[i], "-", "-", armhole[i], "-", "-", "ayni bustte Bugra bedeni YOK");
            continue;
        }
        const double bugraSew = kBugraArmholeCutMM[b] + 0.5 * (kCutToSewMinMM + kCutToSewMaxMM);
        std::printf("%-5s | %4.0f | %-5s | %4.0f | %17.2f | %17.2f | %18.2f | %+9.2f\n", kSizes[i],
                    bustCM[i], kBugraLabel[b], kBugraBustCM[b], armhole[i],
                    kBugraArmholeCutMM[b], bugraSew, armhole[i] - bugraSew);
    }
    std::printf("   yaka: ");
    for (int i = 0; i < 8; ++i) {
        const int b = bugraByBust(bustCM[i]);
        if (b < 0) continue;
        std::printf("%s/%s %.2f vs %.2f  ", kSizes[i], kBugraLabel[b], neck[i], kBugraNeckCutMM[b]);
    }
    std::printf("\n");

    // ── BİLGİ: bandın kendisi neden kapı olamaz ──────────────────────────────
    // Satın alınmış kalıbı aynı dikiş-çizgisi bandına sokunca ne oluyor? Bu bir
    // kapı DEĞİL; K1'in neden TEK bedene indirildiğinin her koşuda basılan
    // kanıtı. Buğra'nın kesim sayısına ölçülen içbükey ofsetin ORTASI eklenir.
    std::printf("\n-- BILGI (hukum degil): K1 bandi SATIN ALINMIS kalibi gecirir mi? --\n");
    {
        int inSew = 0, inCut = 0;
        for (int i = 0; i < 8; ++i) {
            const double sew = kBugraArmholeCutMM[i] + 0.5 * (kCutToSewMinMM + kCutToSewMaxMM);
            const bool okS = sew >= kArmholeMinMM && sew <= kArmholeMaxMM;
            const bool okC = kBugraArmholeCutMM[i] >= kArmholeMinMM &&
                             kBugraArmholeCutMM[i] <= kArmholeMaxMM;
            if (okS) ++inSew;
            if (okC) ++inCut;
            std::printf("  %-4s dikis %7.2fmm -> %s | kesim %7.2fmm -> %s\n", kBugraLabel[i], sew,
                        okS ? "ICINDE" : "DISINDA", kBugraArmholeCutMM[i],
                        okC ? "ICINDE" : "DISINDA");
        }
        std::printf("  -> dikis cizgisinde 8 bedenin %d'i bantta, kesimde %d'i.\n", inSew, inCut);
        std::printf("  -> 40-44cm SEKIZ bedenlik bir kapi olsaydi, referans kalip da duserdi.\n");
    }

    // ── K1: TABAN BEDEN ──────────────────────────────────────────────────────
    std::printf("\n-- K1: TABAN BEDEN %s, kol oyugu %.0f-%.0fmm (Aldrich sanity, dikis cizgisi) --\n",
                kBaseSize, kArmholeMinMM, kArmholeMaxMM);
    for (int i = 0; i < 8; ++i) {
        if (std::string(kSizes[i]) != kBaseSize) {
            std::printf("  %-5s %-10s %-5s %s\n", kSizes[i], "K1 oyuk", "bilgi",
                        (mm(armhole[i]) + " (taban beden degil, yargilanmiyor)").c_str());
            continue;
        }
        const bool ok = armhole[i] >= kArmholeMinMM && armhole[i] <= kArmholeMaxMM;
        verdict(kSizes[i], "K1 oyuk", ok, mm(armhole[i]));
    }

    // ── K1b: GRADE TUTARLILIĞI ───────────────────────────────────────────────
    std::printf("\n-- K1b: grade gorunur (adim > 0) + max/medyan <= %.1f (URBN sevkiyat kurali) --\n",
                kStepRatioMax);
    std::vector<double> steps;
    for (int i = 1; i < 8; ++i) {
        const double s = armhole[i] - armhole[i - 1];
        steps.push_back(s);
        verdict(kSizes[i], "K1b adim", s > 0.0, mm(s) + " (gorunur grade mi)");
    }
    std::vector<double> sorted = steps;
    std::sort(sorted.begin(), sorted.end());
    const double median = sorted[sorted.size() / 2];  // 7 adim -> tam orta
    const double maxStep = sorted.back();
    const double ratio = median > 0 ? maxStep / median : 1e9;
    {
        char buf[160];
        std::snprintf(buf, sizeof(buf), "max %.2f / medyan %.2f = %.3f", maxStep, median, ratio);
        verdict("hepsi", "K1b oran", ratio <= kStepRatioMax, buf);
    }

    // ── K1c: ÜRETİM TOLERANSI = DETERMİNİZM ──────────────────────────────────
    // Aynı spec ikinci kez, TERS SIRADA üretilir. Sıra bağımlılığı / saklı
    // durum varsa fark burada çıkar.
    std::printf("\n-- K1c: uretim toleransi (AH01 W1 = 3/16\" = %.4fmm), ayni spec iki kez --\n",
                kProdTolMM);
    {
        std::vector<double> again(8, 0.0);
        for (int i = 7; i >= 0; --i) {
            const SizeChartEntry* e = euSize(kSizes[i]);
            BodiceBlock::BodiceOptions o;
            again[i] = BodiceBlock::draft(e->body, o).armholeLength;
        }
        for (int i = 0; i < 8; ++i) {
            const double diff = std::fabs(again[i] - armhole[i]);
            char buf[160];
            std::snprintf(buf, sizeof(buf), "kosu1 %.4f vs kosu2(ters sira) %.4f = %.4fmm",
                          armhole[i], again[i], diff);
            verdict(kSizes[i], "K1c tekrar", diff <= kProdTolMM, buf);
        }
    }

    // ── K3: YAKA ─────────────────────────────────────────────────────────────
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
