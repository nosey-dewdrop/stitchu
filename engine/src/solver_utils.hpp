#pragma once
// solver_utils.hpp — KISIT COZUCU ISKELETI (0509 A2a). Algoritma DIKTE EDILDI, burada
// matematik ICAT EDILMEZ: iteratif yay-kutle gevsetmesi.
//
// TEK CUMLE: bir dugum kumesi (2B nokta, mm) verilir; YUMUSAK hedefler (oran hedefleri) birer
// yay gibi cekerek dugumleri yaklastirir, SERT kisitlar (dikis cifti uzunluk esitligi, panel
// kapaliligi, mutlak insan olcegi) her iterasyonda PROJEKSIYONLA zorlanir. Yumusak olan
// birakilabilir, sert olan birakilamaz.
//
// KIM KULLANIR: A2b'nin PanelKaynak/Halka2B'si. Halka cevrelerinden ve landmark'lardan cikan
// 2B ILK TAHMIN dugum olur; panel kenar uzunluklari ve dikis cifti esitligi sert kisit,
// hedef oranlar (bel/gogus payi gibi) yumusak hedef olarak baglanir. Bu dosya GRAFI BILMEZ:
// yalniz dugum + kisit gorur, boylece A12'nin Yuzey3B'si de ayni cozucuyu doldurur.
//
// SAYILAR SOZLESMEDEN: contract/graf-v1.json cozucu.gevsetme (maxIter, sureTavaniMS, adimBoyu,
// yakinsamaMM) ve olcek siniri contract/body-v1.json olcekAraligi.giysiYuksekligiMM.
// Kodda sabit yok; yuklenmemis ctx ile cagrilirsa ADIYLA reddeder (ERR_SOLVER_NO_CONTRACT).
//
// GARANTILER (birim testi engine/tests/0509-solver_check.cpp):
//   1. ASLA ASILI KALMAZ: maxIter VE sureTavaniMS iki bagimsiz tavandir; hangisi once dolarsa
//      cozucu doner.
//   2. Tavan dolunca yumusak hedefler BIRAKILIR (hangileri: birakilanHedefler[]), sert kisitlar
//      son bir projeksiyon turuyla korunur.
//   3. MUTLAK INSAN OLCEGI SERT: cozucu dikisi kapatmak icin olcegi bozamaz. Olcek siniri
//      disina cikmadan sert kisitlar saglanamiyorsa ERR_UNSOLVABLE (A1'in ERR_SCALE_MISMATCH'i
//      ile pinpon yok: olcek gevsetilecek bir hedef degil, korunan bir sinirdir).
//   4. Cozum yoksa: durum = ERR_UNSOLVABLE + EN YAKIN COZUM (son dugum konumlari) + hangi
//      kisitin gevsetilmesi gerektigi (gevsetilmesiGereken, en buyuk artigi tasiyan sert kisit).
#include <cstddef>
#include <string>
#include <vector>

#include "geometry.hpp"

namespace stitchu {
namespace graf { struct JVal; }

namespace solver {

// ---------------------------------------------------------------- sozlesme sinirlari
struct SolverCtx {
    int maxIter = 0;             // cozucu.gevsetme.maxIter
    double sureTavaniMS = 0;     // cozucu.gevsetme.sureTavaniMS
    double adimBoyu = 0;         // cozucu.gevsetme.adimBoyu (0 < k <= 1)
    double yakinsamaMM = 0;      // cozucu.gevsetme.yakinsamaMM
    double olcekMinMM = 0;       // body-v1 olcekAraligi.giysiYuksekligiMM.min (SERT)
    double olcekMaxMM = 0;       // ... .max (SERT)
    bool dolu = false;
    // graf-v1 contract + body-v1 contract; eksik/NaN alan -> dolu=false, hata ADIYLA doldurulur
    static SolverCtx fromContract(const graf::JVal& grafContract, const graf::JVal& bodyContract, std::string& hata);
};

// ---------------------------------------------------------------- dugumler ve kisitlar
struct Dugum {
    std::string ad;              // "on_beden/waist_side" — hata mesajlari bu adi tasir
    Point p;                     // mm, calisma konumu (girdi = ilk tahmin, cikti = cozum)
    bool sabit = false;          // true: hicbir kuvvet/projeksiyon oynatamaz (CF kati, landmark cakmasi)
};

// SERT: iki dugum arasi uzaklik hedefi. Bir panel kenari (kendi uzunlugu) ya da bir dikis
// ciftinin iki tarafi (uzunluk esitligi) buna dusurulur.
struct SertUzunluk {
    std::string ad;              // kisit adi (raporda ve gevsetilmesiGereken'de gorunur)
    std::size_t i = 0, j = 0;    // dugum indisleri
    double hedefMM = 0;          // |p_i - p_j| = hedefMM
};

// SERT: kapalilik. Sirali dugum halkasinin ilk ve son dugumu ayni noktaya oturur (panel
// kapali halka). Ayri bir tur cunku artigi "kapanma boslugu" olarak raporlanir.
struct SertKapalilik {
    std::string ad;
    std::vector<std::size_t> halka;   // sirali dugum indisleri; halka[son] ile halka[ilk] cakisir
};

// YUMUSAK: iki dugum arasi uzaklik icin ORAN hedefi (yay). agirlik buyudukce daha cok ceker;
// tavan dolunca ilk BIRAKILAN bunlardir.
struct YumusakHedef {
    std::string ad;
    std::size_t i = 0, j = 0;
    double hedefMM = 0;
    double agirlik = 1.0;        // > 0
};

struct Problem {
    std::vector<Dugum> dugumler;
    std::vector<SertUzunluk> sertUzunluklar;
    std::vector<SertKapalilik> sertKapaliliklar;
    std::vector<YumusakHedef> yumusakHedefler;
    // Mutlak insan olcegi bu dugum kumesine uygulanacak mi (giysi grafi: evet; soyut test: hayir).
    // false ise olcek projeksiyonu atlanir ama ctx yine dolu olmali (sessiz default yok).
    bool olcekKisiti = false;
};

// ---------------------------------------------------------------- sonuc
enum class Durum { OK, YUMUSAK_BIRAKILDI, ERR_UNSOLVABLE, ERR_SOLVER_NO_CONTRACT, ERR_PROBLEM_BOZUK };
const char* durumAdi(Durum d);

struct Sonuc {
    Durum durum = Durum::ERR_PROBLEM_BOZUK;
    std::string hata;                          // durum != OK ise ADIYLA neden
    std::vector<Point> noktalar;               // EN YAKIN COZUM: her durumda doldurulur (dugum sirasinda)
    int iterasyon = 0;
    double sureMS = 0;
    double enBuyukSertArtikMM = 0;             // sert kisitlarin en kotu artigi
    std::string enKotuSertKisit;               // o kisitin adi
    std::string gevsetilmesiGereken;           // ERR_UNSOLVABLE'da: hangi kisit gevsetilmeli
    std::vector<std::string> birakilanHedefler;// tavan dolunca birakilan yumusak hedef adlari
    // Durum kodu bir CIKTI ETIKETIDIR; cagiran taraf da akisini enum karsilastirmasina
    // baglamasin diye kullanisli yordamlar ADIYLA verilir (durumAdi ile birlikte).
    bool hataVar() const { return !hata.empty() && noktalar.empty(); }
};

// TEK GIRIS. Girdi problem DEGISTIRILMEZ (saf); ilk tahmin problem.dugumler[].p'dir.
// ctx.dolu degilse ERR_SOLVER_NO_CONTRACT; indis tasmasi/NaN/bos halka ERR_PROBLEM_BOZUK.
Sonuc coz(const Problem& problem, const SolverCtx& ctx);

}  // namespace solver
}  // namespace stitchu
