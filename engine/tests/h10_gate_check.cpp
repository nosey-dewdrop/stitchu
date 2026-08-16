// h10_gate_check — H1.0'ın KABUL KAPISI. Tanım: docs/H1.0-KAPI.md
//
// Bu bir kod testi değil, bir BİTİŞ TANIMI. H1.0 (giyilebilirlik) 25-45 saatlik
// yapısal bir iş ve o saatlerin yön seçebilmesi için "bitti"nin ölçüsü lazım.
// Altı şart, sekiz beden, 48 hüküm. Her sayının kaynağı docs/H1.0-KAPI.md § 0'da
// ÖLÇÜLDÜ / KAYNAKLI / TÜRETİLMİŞ diye etiketli; burada sadece uygulanıyor.
//
//   K1 kol oyuğu çevresi      [Bugra_beden - 40mm, Bugra_beden]
//   K2 kol oyuğu grade adımı  [+4.0mm, +14.0mm], monoton
//   K3 omuz dikişi VAR        ön üst-sınır kenarı <-> arka üst-sınır kenarı, >= 2 dikiş
//   K4 omuz dengesi           arka - ön in [+0.5mm, +12.0mm] (isaret KANUN: arka uzun)
//   K5 yaka                   KAPALI delik + cevre [boyun, 1.60 x boyun]
//   K6 taşıyıcı yüzey         omuz ucunda üst sınır, omuz seviyesinin <=5mm altında
//
// K6 bugün ÖLÇÜLEMİYOR: SurfacePattern üst-sınır yüksekliğini dışarı bildirmiyor
// (GarmentSurf/TopProfile .cpp içinde kapalı). Bu bir kaçamak değil, H1.0'ın bir
// kalemi: motorun bu soruya cevap verebilmesi de teslimata dahil. FAIL basar.
//
// KIRMIZI OLMASI DOĞRUDUR. Kapı bugünün motorunu geçirseydi yanlış yazılmıştı.
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/bodysurface.hpp"
#include "../src/sizechart.hpp"
#include "../src/surfacepattern.hpp"

using namespace stitchu;

namespace {

constexpr double kStatureMM = 1680.0;  // surface_pattern_check ile aynı varsayım
constexpr double kCapMM = 60.0;
constexpr double kPi = 3.14159265358979323846;

const char* kSizes[8] = {"EU34", "EU36", "EU38", "EU40", "EU42", "EU44", "EU46", "EU48"};

// ÖLÇÜLDÜ — Buğra Locket, kesim çizgisi, patterns_real/geometry/{geometry-full,
// seamgraph}.json, oyuk-ön + oyuk-arka. Üretimi: patterns_real/tools/trace-match.py
const double kBugraArmholeMM[8] = {424.50, 428.91, 432.99, 447.80,
                                   457.83, 466.83, 474.64, 486.48};

constexpr double kSleevelessTakeMM = 40.0;  // TÜRETİLMİŞ, Aldrich s.28 dört x 1cm
constexpr double kGradeMinMM = 4.0;         // ölçülen en küçük Buğra adımı (4.41), yuvarlanmış
constexpr double kGradeMaxMM = 14.0;        // ölçülen en büyük Buğra adımı (14.81), yuvarlanmış
constexpr double kBladeMinMM = 0.5;         // ölçülen +0.95'in altı; 0 veya negatif = T11 kusuru
constexpr double kBladeMaxMM = 12.0;        // CLAUDE.md 29 Tem alan kaydı, kürek payı 6-12mm
constexpr double kNeckMaxRatio = 1.60;      // TÜRETİLMİŞ tavan, omuzdan kayan yakayı dışarıda tutar
constexpr double kCarryMaxDropMM = 5.0;

int fails = 0, judged = 0;

void verdict(const char* size, const char* label, bool ok, const char* detail) {
    ++judged;
    if (!ok) ++fails;
    std::printf("  %-5s %-18s %-6s %s\n", size, label, ok ? "ok" : "FAIL", detail);
}

double levelOf(const BodySurface& b, const char* name, bool girth) {
    for (const BodyLevel& lv : b.levels())
        if (lv.name == name) return girth ? lv.girthMM : lv.halfWidthMM;
    return 0.0;
}

struct FarSplit {
    double armhole = 0.0, shoulder = 0.0, neck = 0.0;
};

// Üst sınırın rejimi phi'nin fonksiyonu (surfacepattern.cpp TopProfile::at):
//   x = |shoulderHalf * cos phi|;  x >= strapHalf -> KOL OYUĞU
//                                  x >= neckHalf  -> OMUZ
//                                  aksi           -> YAKA
// Panel kolonu k, halka kolonu (ringOffset + k) demektir; phi = 2*pi*kolon/NR.
// "right_" panelleri aynalı KOPYA (contour.x negatiflenmiş, kenar sırası aynı
// kalmış), o yüzden onların k=0'ı kendi kolon aralığının SONUNA denk düşer.
FarSplit splitFar(const SurfacePanel& p, int NR, double shoulderHalf, double strapHalf,
                  double neckHalf) {
    FarSplit s;
    const int n = static_cast<int>(p.farEdges.size());
    const bool mirrored = p.name.rfind("right_", 0) == 0;
    for (int k = 0; k < n; ++k) {
        const int col = mirrored ? p.ringOffset + n - k : p.ringOffset + k;
        const double phi = 2 * kPi * (col + (mirrored ? -0.5 : 0.5)) / NR;
        const double x = std::fabs(shoulderHalf * std::cos(phi));
        const int e = p.farEdges[k];
        const Vec2 a = p.contour[e];
        const Vec2 b = p.contour[(e + 1) % p.contour.size()];
        const double len = std::hypot(a.x - b.x, a.y - b.y);
        if (x >= strapHalf) s.armhole += len;
        else if (x >= neckHalf) s.shoulder += len;
        else s.neck += len;
    }
    return s;
}

bool isFrontTorso(const std::string& n) { return n.find("ftorso") != std::string::npos; }
bool isBackTorso(const std::string& n) { return n.find("btorso") != std::string::npos; }

}  // namespace

int main() {
    std::printf("== H1.0 KABUL KAPISI (docs/H1.0-KAPI.md) — 8 beden x 6 şart ==\n");
    double armhole[8] = {0};
    bool armholeOK[8] = {false};

    for (int si = 0; si < 8; ++si) {
        const SizeChartEntry* e = euSize(kSizes[si]);
        if (!e) {
            std::printf("  %-5s CHART YOK\n", kSizes[si]);
            fails += 6;
            judged += 6;
            continue;
        }
        const BodySurface body(e->body, kStatureMM, kCapMM);
        const SheathOptions opt;
        const SurfacePattern pat = buildSheathPattern(body, opt);

        const double shoulderHalf = levelOf(body, "shoulder", false);
        const double neckGirth = levelOf(body, "neck", true);
        const double strapHalf = shoulderHalf - opt.shoulderNarrowMM;
        const double neckHalf = neckGirth / 5.0 + opt.neckWidthCoefCM * 10.0;

        FarSplit front, back;
        for (const SurfacePanel& p : pat.panels) {
            if (!isFrontTorso(p.name) && !isBackTorso(p.name)) continue;
            const FarSplit s = splitFar(p, opt.ringSamples, shoulderHalf, strapHalf, neckHalf);
            FarSplit& t = isFrontTorso(p.name) ? front : back;
            t.armhole += s.armhole;
            t.shoulder += s.shoulder;
            t.neck += s.neck;
        }

        // --- K1: kol oyuğu çevresi. Giyside İKİ oyuk var, gövde simetrik. ---
        const double ah = (front.armhole + back.armhole) / 2.0;
        armhole[si] = ah;
        const double lo = kBugraArmholeMM[si] - kSleevelessTakeMM, hi = kBugraArmholeMM[si];
        const bool k1 = ah >= lo && ah <= hi;
        armholeOK[si] = k1;
        char buf[256];
        std::snprintf(buf, sizeof buf, "%8.2fmm  kapı [%.2f, %.2f]  (ön %.2f / arka %.2f, BİLGİ)",
                      ah, lo, hi, front.armhole / 2.0, back.armhole / 2.0);
        verdict(kSizes[si], "K1 armhole", k1, buf);

        // --- K3: omuz dikişi. Ön gövdenin üst kenarı arka gövdenin üst kenarına dikili mi? ---
        int shoulderSeams = 0;
        for (const SurfaceStitch& st : pat.stitches) {
            const SurfacePanel& A = pat.panels[st.pa];
            const SurfacePanel& B = pat.panels[st.pb];
            const bool cross = (isFrontTorso(A.name) && isBackTorso(B.name)) ||
                               (isBackTorso(A.name) && isFrontTorso(B.name));
            if (!cross) continue;
            auto onFar = [](const SurfacePanel& p, int ed) {
                for (int f : p.farEdges)
                    if (f == ed) return true;
                return false;
            };
            if (onFar(A, st.ea) && onFar(B, st.eb)) ++shoulderSeams;
        }
        const bool k3 = shoulderSeams >= 2;
        std::snprintf(buf, sizeof buf, "%d dikiş (ön üst-kenar <-> arka üst-kenar), kapı >= 2",
                      shoulderSeams);
        verdict(kSizes[si], "K3 shoulder-seam", k3, buf);

        // --- K4: omuz dengesi. İşaret kanun: ARKA uzun. ---
        const double dShoulder = back.shoulder - front.shoulder;
        const bool k4 = dShoulder >= kBladeMinMM && dShoulder <= kBladeMaxMM;
        std::snprintf(buf, sizeof buf, "arka-ön %+8.3fmm  kapı [%.1f, %.1f]  (ön %.2f arka %.2f)",
                      dShoulder, kBladeMinMM, kBladeMaxMM, front.shoulder, back.shoulder);
        verdict(kSizes[si], "K4 shoulder-bal", k4, buf);

        // --- K5.1: yaka KAPALI delik mi? Kapanma omuz dikişinden geçer. ---
        const bool k51 = k3 && front.neck > 0.0 && back.neck > 0.0;
        std::snprintf(buf, sizeof buf, "%s (ön yay %.2f + arka yay %.2f, omuz dikişi %d)",
                      k51 ? "kapalı çevrim" : "AÇIK — iki ayrı çukur, delik değil",
                      front.neck, back.neck, shoulderSeams);
        verdict(kSizes[si], "K5 neck-closed", k51, buf);

        // --- K5.2: yaka çevresi ---
        const double neck = front.neck + back.neck;
        const bool k52 = neck >= neckGirth && neck <= kNeckMaxRatio * neckGirth;
        std::snprintf(buf, sizeof buf, "%8.2fmm  kapı [%.2f, %.2f] (boyun %.1f)", neck, neckGirth,
                      kNeckMaxRatio * neckGirth, neckGirth);
        verdict(kSizes[si], "K5 neck-girth", k52, buf);

        // --- K6: omzun üstünden geçen taşıyıcı yüzey ---
        // ARTIK SORULABİLİYOR (Tur 5): SurfacePattern.shoulderCarryMM. Eşik
        // DEĞİŞMEDİ — docs/H1.0-KAPI.md § K6, omuz seviyesinin en fazla 5.0mm
        // altı. Değişen tek şey, motorun soruya cevap verebiliyor olması; kapı
        // aynı kapı. İşaret: + omuz seviyesinin ÜSTÜ, - ALTI.
        const double carry = pat.shoulderCarryMM;
        const bool k6 = carry >= -kCarryMaxDropMM;
        std::snprintf(buf, sizeof buf,
                      "%+8.2fmm  kapı >= %.1f  (ön %+.2f arka %+.2f, omuz sev. %.1f, "
                      "soru x=%.1f, yüzeyin ulaştığı x=%.1f)",
                      carry, -kCarryMaxDropMM, pat.frontCarryMM, pat.backCarryMM,
                      pat.shoulderLevelMM, pat.shoulderPointXMM, pat.carryReachXMM);
        verdict(kSizes[si], "K6 shoulder-carry", k6, buf);
    }

    // --- K2: grade. Tüm bedenler ölçüldükten sonra. ---
    std::printf("== K2 grade (ardışık beden farkı) ==\n");
    for (int si = 1; si < 8; ++si) {
        const double step = armhole[si] - armhole[si - 1];
        const bool k2 = step >= kGradeMinMM && step <= kGradeMaxMM;
        char buf[192];
        std::snprintf(buf, sizeof buf, "%+8.3fmm  kapı [%.1f, %.1f]  (Buğra %+6.2f)", step,
                      kGradeMinMM, kGradeMaxMM, kBugraArmholeMM[si] - kBugraArmholeMM[si - 1]);
        verdict(kSizes[si], "K2 grade", k2, buf);
    }

    std::printf("\n== HÜKÜM: %d yargıdan %d FAIL ==\n", judged, fails);
    if (fails == 0)
        std::printf("KAPI YEŞİL. docs/H1.0-KAPI.md okunmadan bu satıra inanılmaz.\n");
    else
        std::printf("KAPI KIRMIZI — H1.0 açık.\n");
    return fails == 0 ? 0 : 1;
}
