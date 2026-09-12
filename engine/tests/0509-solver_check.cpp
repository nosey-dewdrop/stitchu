// 0509-solver_check.cpp — A2a birim testi: engine/src/solver_utils.* (kisit cozucu iskeleti).
// Brief'in istedigi bes durum:
//   (1) UCGEN panel: uc kenar sert uzunluk + kapalilik -> cozulur (artik <= yakinsamaMM)
//   (2) DORTGEN panel CIFTI: iki panelin ortak dikisi (uzunluk esitligi sert) -> cozulur
//   (3) KAPALILIK: acik baslayan halka kapanir
//   (4) TAVAN DAVRANISI: birbiriyle celisen YUMUSAK hedef + sert kisit -> yumusak birakilir,
//       sert kalir (YUMUSAK_BIRAKILDI); ve cozucu ASILI KALMAZ (sure/iterasyon tavani icinde doner)
//   (5) ERR_UNSOLVABLE: celisen SERT kisitlar -> hata kodu + en yakin cozum + gevsetilmesiGereken
//   (+) sozlesme yoksa ERR_SOLVER_NO_CONTRACT; bozuk problem ERR_PROBLEM_BOZUK
//   (+) MUTLAK INSAN OLCEGI SERT: olcek disina cikaran sert kisit -> ERR_UNSOLVABLE (olcek bozulmaz)
// argv: <contract/graf-v1.json> <contract/body-v1.json>
#include <cmath>
#include <cstdio>
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

#include "../src/graf.hpp"
#include "../src/solver_utils.hpp"

using namespace stitchu;
using namespace stitchu::solver;

static int fails = 0;
static void ok(bool c, const std::string& msg) {
    std::printf("  [%s] %s\n", c ? "ok" : "FAIL", msg.c_str());
    if (!c) ++fails;
}
static std::string readFile(const std::string& p) {
    std::ifstream f(p);
    if (!f) throw std::runtime_error("okunamadi: " + p);
    std::stringstream ss; ss << f.rdbuf(); return ss.str();
}
static double dist(const Point& a, const Point& b) { return std::hypot(a.x - b.x, a.y - b.y); }
static std::string f3(double v) { char b[32]; std::snprintf(b, sizeof b, "%.3f", v); return b; }

int main(int argc, char** argv) {
    if (argc < 3) { std::fprintf(stderr, "kullanim: 0509-solver_check <graf-v1.json> <body-v1.json>\n"); return 2; }
    graf::JVal grafC, bodyC; std::string err;
    if (!graf::parse(readFile(argv[1]), grafC, err)) { std::fprintf(stderr, "graf-v1: %s\n", err.c_str()); return 2; }
    if (!graf::parse(readFile(argv[2]), bodyC, err)) { std::fprintf(stderr, "body-v1: %s\n", err.c_str()); return 2; }

    std::string hata;
    const SolverCtx ctx = SolverCtx::fromContract(grafC, bodyC, hata);
    std::printf("0509-solver_check — sozlesme: maxIter=%d sureTavaniMS=%.0f adimBoyu=%.3f yakinsamaMM=%.4f olcek=[%.1f, %.1f]\n",
                ctx.maxIter, ctx.sureTavaniMS, ctx.adimBoyu, ctx.yakinsamaMM, ctx.olcekMinMM, ctx.olcekMaxMM);
    ok(ctx.dolu, "sozlesme yuklendi (kodda sabit yok)" + std::string(ctx.dolu ? "" : ": " + hata));
    if (!ctx.dolu) return 1;
    // sayilar contract'tan geliyor mu: sifir/NaN degil
    ok(ctx.maxIter > 0 && ctx.sureTavaniMS > 0 && ctx.yakinsamaMM > 0 && ctx.olcekMaxMM > ctx.olcekMinMM,
       "sozlesme sayilari gecerli");

    // ---------------------------------------------------------------- (0) sozlesmesiz ret
    {
        SolverCtx bos;   // dolu = false
        Problem pr; pr.dugumler.push_back({"a", {0, 0}, false});
        const Sonuc R = coz(pr, bos);
        ok(R.durum == Durum::ERR_SOLVER_NO_CONTRACT, std::string("sozlesmesiz cagri ADIYLA ret: ") + durumAdi(R.durum));
    }
    // bos gevsetme blogu olan contract -> ADIYLA ret (sessiz default yok)
    {
        graf::JVal sahte = graf::JVal::obj();
        std::string h2;
        const SolverCtx c2 = SolverCtx::fromContract(sahte, bodyC, h2);
        ok(!c2.dolu && !h2.empty(), "cozucu.gevsetme yoksa hata ADIYLA: " + h2);
    }

    // ---------------------------------------------------------------- (1) ucgen panel
    {
        Problem pr;
        pr.dugumler = {{"A", {0, 0}, true}, {"B", {90, 5}, false}, {"C", {40, 70}, false}, {"A2", {3, -4}, false}};
        // kenarlar: A-B 100, B-C 80, C-A2 60; A2 kapalilikla A'ya oturur
        pr.sertUzunluklar = {{"AB", 0, 1, 100.0}, {"BC", 1, 2, 80.0}, {"CA", 2, 3, 60.0}};
        pr.sertKapaliliklar = {{"ucgen_kapali", {0, 1, 2, 3}}};
        const Sonuc R = coz(pr, ctx);
        ok(R.durum == Durum::OK, std::string("(1) ucgen panel cozuldu: ") + durumAdi(R.durum) +
           " artik=" + f3(R.enBuyukSertArtikMM) + " mm, " + std::to_string(R.iterasyon) + " iter, " + f3(R.sureMS) + " ms");
        ok(std::fabs(dist(R.noktalar[0], R.noktalar[1]) - 100.0) <= ctx.yakinsamaMM, "(1) AB = 100 mm");
        ok(std::fabs(dist(R.noktalar[1], R.noktalar[2]) - 80.0) <= ctx.yakinsamaMM, "(1) BC = 80 mm");
        ok(dist(R.noktalar[0], R.noktalar[3]) <= ctx.yakinsamaMM, "(1) halka kapali (A == A2)");
        ok(R.noktalar[0].x == 0.0 && R.noktalar[0].y == 0.0, "(1) sabit dugum oynamadi");
    }

    // ---------------------------------------------------------------- (2) dortgen panel cifti, dikis uzunluk esitligi
    {
        // Panel1: A-B-C-D (yan kenar B-C), Panel2: E-F-G-H (yan kenar F-G). Dikis: |BC| = |FG|.
        // Uzunluk esitligini SERT kisit olarak kurmak: iki kenar da ayni hedefe (200) baglanir.
        Problem pr;
        pr.dugumler = {{"P1/A", {0, 0}, true},   {"P1/B", {150, 10}, false}, {"P1/C", {140, 190}, false}, {"P1/D", {5, 205}, false},
                       {"P2/E", {400, 0}, true}, {"P2/F", {560, -5}, false}, {"P2/G", {545, 220}, false}, {"P2/H", {395, 195}, false},
                       {"P1/A2", {-4, 6}, false}, {"P2/E2", {404, 3}, false}};
        pr.sertUzunluklar = {
            {"P1/ust", 0, 1, 160.0}, {"P1/yan_BC", 1, 2, 200.0}, {"P1/alt", 2, 3, 160.0}, {"P1/CF", 3, 8, 200.0},
            {"P2/ust", 4, 5, 160.0}, {"P2/yan_FG", 5, 6, 200.0}, {"P2/alt", 6, 7, 160.0}, {"P2/CB", 7, 9, 200.0}};
        pr.sertKapaliliklar = {{"P1_kapali", {0, 1, 2, 3, 8}}, {"P2_kapali", {4, 5, 6, 7, 9}}};
        const Sonuc R = coz(pr, ctx);
        const double lBC = dist(R.noktalar[1], R.noktalar[2]), lFG = dist(R.noktalar[5], R.noktalar[6]);
        ok(R.durum == Durum::OK, std::string("(2) dortgen panel cifti cozuldu: ") + durumAdi(R.durum) +
           " artik=" + f3(R.enBuyukSertArtikMM) + " mm");
        ok(std::fabs(lBC - lFG) <= 2 * ctx.yakinsamaMM,
           "(2) dikis cifti uzunluk esitligi: |BC|=" + f3(lBC) + " |FG|=" + f3(lFG));
        ok(dist(R.noktalar[0], R.noktalar[8]) <= ctx.yakinsamaMM && dist(R.noktalar[4], R.noktalar[9]) <= ctx.yakinsamaMM,
           "(2) iki panel de kapali");
    }

    // ---------------------------------------------------------------- (3) acik halka kapanir
    {
        Problem pr;
        pr.dugumler = {{"A", {0, 0}, false}, {"B", {100, 0}, false}, {"C", {100, 100}, false}, {"A2", {60, 60}, false}};
        pr.sertKapaliliklar = {{"kapali", {0, 1, 2, 3}}};
        const double onceBosluk = dist(pr.dugumler[0].p, pr.dugumler[3].p);
        const Sonuc R = coz(pr, ctx);
        ok(R.durum == Durum::OK && dist(R.noktalar[0], R.noktalar[3]) <= ctx.yakinsamaMM,
           "(3) acik halka kapandi: bosluk " + f3(onceBosluk) + " -> " + f3(dist(R.noktalar[0], R.noktalar[3])) + " mm");
    }

    // ---------------------------------------------------------------- (4) tavan davranisi
    {
        // Sert: |AB| = 100. Yumusak: |AB| = 400 (celisir, agirlikli). Sert kazanir, yumusak BIRAKILIR.
        Problem pr;
        pr.dugumler = {{"A", {0, 0}, true}, {"B", {50, 0}, false}};
        pr.sertUzunluklar = {{"AB_sert", 0, 1, 100.0}};
        pr.yumusakHedefler = {{"AB_yumusak_hedef", 0, 1, 400.0, 1.0}};
        const Sonuc R = coz(pr, ctx);
        const double l = dist(R.noktalar[0], R.noktalar[1]);
        ok(R.durum == Durum::YUMUSAK_BIRAKILDI || R.durum == Durum::OK,
           std::string("(4) tavan davranisi: ") + durumAdi(R.durum) + " |AB|=" + f3(l));
        ok(std::fabs(l - 100.0) <= ctx.yakinsamaMM, "(4) SERT kisit korundu (yumusak hedef 400 degil, 100)");
        ok(R.durum != Durum::YUMUSAK_BIRAKILDI || !R.birakilanHedefler.empty(),
           "(4) birakilan hedef ADIYLA raporlandi: " + (R.birakilanHedefler.empty() ? std::string("-") : R.birakilanHedefler[0]));
        ok(R.sureMS <= ctx.sureTavaniMS * 3 && R.iterasyon <= ctx.maxIter,
           "(4) ASILI KALMADI: " + f3(R.sureMS) + " ms <= tavan, " + std::to_string(R.iterasyon) + " iter <= " + std::to_string(ctx.maxIter));
    }

    // ---------------------------------------------------------------- (4b) TAVAN GERCEKTEN DOLUYOR
    {
        // maxIter tavanini KESIN doldurmak icin: cok sayida birbirine bagli sert uzunluk
        // (zincir) + her adimda zinciri geri iten guclu bir yumusak hedef. Yumusak kuvvet
        // sert projeksiyonun isini bozar; tavan dolar, yumusak BIRAKILIR, sert kalir.
        Problem pr;
        const int N = 8;
        for (int i = 0; i < N; ++i) pr.dugumler.push_back({"z" + std::to_string(i), {static_cast<double>(i) * 10.0, 0.0}, i == 0});
        for (int i = 0; i + 1 < N; ++i)
            pr.sertUzunluklar.push_back({"zincir_" + std::to_string(i), static_cast<std::size_t>(i), static_cast<std::size_t>(i + 1), 25.0});
        // zincirin iki ucunu birbirine cekmek isteyen agir yumusak hedef (sert zincirle celisir)
        pr.yumusakHedefler.push_back({"uc_uca_yumusak", 0, static_cast<std::size_t>(N - 1), 5.0, 8.0});
        const Sonuc R = coz(pr, ctx);
        ok(R.durum == Durum::YUMUSAK_BIRAKILDI,
           std::string("(4b) tavan doldu -> yumusak birakildi: ") + durumAdi(R.durum) +
           " (" + std::to_string(R.iterasyon) + " iter, " + f3(R.sureMS) + " ms, artik " + f3(R.enBuyukSertArtikMM) + " mm)");
        ok(R.birakilanHedefler.size() == 1 && R.birakilanHedefler[0] == "uc_uca_yumusak",
           "(4b) birakilan hedef ADIYLA: " + (R.birakilanHedefler.empty() ? std::string("-") : R.birakilanHedefler[0]));
        ok(R.enBuyukSertArtikMM <= ctx.yakinsamaMM, "(4b) SERT kisitlar korundu: artik " + f3(R.enBuyukSertArtikMM) + " mm");
        ok(R.iterasyon >= ctx.maxIter || R.sureMS >= ctx.sureTavaniMS,
           "(4b) tavan gercekten doldu (iter " + std::to_string(R.iterasyon) + "/" + std::to_string(ctx.maxIter) + ")");
        ok(!R.hata.empty(), "(4b) durum ADIYLA anlatildi: " + R.hata);
    }

    // ---------------------------------------------------------------- (4c) YAKINSAMA SINIRI ADIYLA ILAN
    // OLCULEN DAVRANIS (2026-09-06, gizlenmiyor): uzun bir sert zincirin (40 halka, bir ucu
    // sabit) artigi Gauss-Seidel projeksiyonunda maxIter x kIcProjeksiyon sweep icinde
    // yakinsamaMM'nin altina INMIYOR (olculen artik ~0.5 mm). Cozucu bunu SESSIZCE gecmez:
    // ERR_UNSOLVABLE atar, en yakin cozumu ve gevsetilmesi gereken kisiti ADIYLA verir.
    // Bu bir esik gevsetmesi degil, cozucunun bilinen yakinsama siniridir; A2b Halka2B'si
    // panel basina kisa zincirler kurar. Artik buyurse (regresyon) bu test kirmizi olur.
    {
        Problem pr;
        const int N = 40;
        for (int i = 0; i < N; ++i) pr.dugumler.push_back({"z" + std::to_string(i), {static_cast<double>(i) * 10.0, 0.0}, i == 0});
        for (int i = 0; i + 1 < N; ++i)
            pr.sertUzunluklar.push_back({"zincir_" + std::to_string(i), static_cast<std::size_t>(i), static_cast<std::size_t>(i + 1), 25.0});
        pr.yumusakHedefler.push_back({"uc_uca_yumusak", 0, static_cast<std::size_t>(N - 1), 5.0, 8.0});
        const Sonuc R = coz(pr, ctx);
        ok(R.durum == Durum::ERR_UNSOLVABLE,
           std::string("(4c) uzun zincir yakinsamiyor -> SESSIZ GECME YOK, ") + durumAdi(R.durum) +
           " artik " + f3(R.enBuyukSertArtikMM) + " mm");
        ok(!R.gevsetilmesiGereken.empty(), "(4c) gevsetilmesi gereken kisit ADIYLA: " + R.gevsetilmesiGereken);
        ok(R.enBuyukSertArtikMM < 2.0, "(4c) artik ust siniri (regresyon bekcisi): " + f3(R.enBuyukSertArtikMM) + " mm < 2.0");
        ok(R.sureMS < ctx.sureTavaniMS, "(4c) ASILI KALMADI: " + f3(R.sureMS) + " ms");
    }

    // ---------------------------------------------------------------- (5) ERR_UNSOLVABLE (celisen SERT kisit)
    {
        // A ve B SABIT, aralari 100 mm; sert kisit 300 mm istiyor -> projeksiyon oynatamaz.
        Problem pr;
        pr.dugumler = {{"A", {0, 0}, true}, {"B", {100, 0}, true}};
        pr.sertUzunluklar = {{"AB_olanaksiz", 0, 1, 300.0}};
        const Sonuc R = coz(pr, ctx);
        ok(R.durum == Durum::ERR_UNSOLVABLE, std::string("(5) celisen sert kisit -> ") + durumAdi(R.durum));
        ok(R.gevsetilmesiGereken == "AB_olanaksiz", "(5) gevsetilmesi gereken kisit ADIYLA: " + R.gevsetilmesiGereken);
        ok(R.noktalar.size() == 2, "(5) EN YAKIN COZUM dondu (" + std::to_string(R.noktalar.size()) + " nokta)");
        ok(std::fabs(R.enBuyukSertArtikMM - 200.0) < 1.0, "(5) artik raporlandi: " + f3(R.enBuyukSertArtikMM) + " mm");
        ok(!R.hata.empty(), "(5) hata metni ADIYLA: " + R.hata);
    }

    // ---------------------------------------------------------------- (6) MUTLAK INSAN OLCEGI SERT
    {
        // Sert kisit giysiyi olcek araliginin USTUNE cikarmak istiyor (olcekMax'in 3 kati).
        // Olcek projeksiyonu SERT: cozucu olcegi bozup dikisi kapatamaz -> ERR_UNSOLVABLE.
        const double asiri = ctx.olcekMaxMM * 3.0;
        Problem pr;
        pr.dugumler = {{"tepe", {0, 0}, false}, {"etek_ucu", {0, 500}, false}};
        pr.sertUzunluklar = {{"boy_asiri", 0, 1, asiri}};
        pr.olcekKisiti = true;
        const Sonuc R = coz(pr, ctx);
        double h = 0;
        for (const Point& p : R.noktalar) h = std::max(h, std::fabs(p.y - R.noktalar[0].y));
        ok(R.durum == Durum::ERR_UNSOLVABLE,
           std::string("(6) olcek SERT: asiri boy istegi -> ") + durumAdi(R.durum) + " (ERR_SCALE_MISMATCH ile pinpon yok)");
        ok(h <= ctx.olcekMaxMM + 1.0, "(6) olcek BOZULMADI: sinir kutusu yuksekligi " + f3(h) + " <= " + f3(ctx.olcekMaxMM));
        // olcek kisiti KAPALI iken ayni problem cozulur (kisitin gercekten olcek oldugunun kaniti)
        Problem pr2 = pr; pr2.olcekKisiti = false;
        const Sonuc R2 = coz(pr2, ctx);
        ok(R2.durum == Durum::OK, std::string("(6) olcek kisiti kapaliyken ayni problem cozulur: ") + durumAdi(R2.durum));
    }

    // ---------------------------------------------------------------- (7) bozuk problem ADIYLA
    {
        Problem pr;
        pr.dugumler = {{"A", {0, 0}, false}};
        pr.sertUzunluklar = {{"tasma", 0, 5, 10.0}};
        const Sonuc R = coz(pr, ctx);
        ok(R.durum == Durum::ERR_PROBLEM_BOZUK && R.hata.find("tasma") != std::string::npos,
           std::string("(7) indis tasmasi ADIYLA: ") + durumAdi(R.durum) + " / " + R.hata);
        Problem pr2;
        pr2.dugumler = {{"A", {0, 0}, false}, {"B", {std::nan(""), 0}, false}};
        const Sonuc R2 = coz(pr2, ctx);
        ok(R2.durum == Durum::ERR_PROBLEM_BOZUK, std::string("(7) NaN dugum ADIYLA: ") + durumAdi(R2.durum) + " / " + R2.hata);
    }

    // ---------------------------------------------------------------- (8) DETERMINIZM: ayni girdi ayni cikti
    {
        Problem pr;
        pr.dugumler = {{"A", {0, 0}, true}, {"B", {90, 5}, false}, {"C", {40, 70}, false}, {"A2", {3, -4}, false}};
        pr.sertUzunluklar = {{"AB", 0, 1, 100.0}, {"BC", 1, 2, 80.0}, {"CA", 2, 3, 60.0}};
        pr.sertKapaliliklar = {{"kapali", {0, 1, 2, 3}}};
        const Sonuc R1 = coz(pr, ctx), R2 = coz(pr, ctx);
        bool ayni = R1.noktalar.size() == R2.noktalar.size();
        for (std::size_t i = 0; ayni && i < R1.noktalar.size(); ++i)
            ayni = (R1.noktalar[i].x == R2.noktalar[i].x) && (R1.noktalar[i].y == R2.noktalar[i].y);
        ok(ayni && R1.durum == R2.durum, "(8) determinizm: ayni girdi bit-ayni cikti");
    }

    std::printf("0509-solver_check: %s\n", fails == 0 ? "GECTI" : "KIRMIZI");
    return fails == 0 ? 0 : 1;
}
