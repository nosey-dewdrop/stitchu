#pragma once
// grafdogrula.hpp — GRAF DOGRULAYICI + SANAL DIKIS (F2a). Bir Garment grafi bir Body'de
// degerlenir ve DIKILEBILIR mi diye yargilanir. Kurallar (contract/graf-v1.json _yasa 3-7):
//   sema            belge sozlesmeyle ayni dili konusuyor (alan/enum/tip; xOf-ring-width tek anlam)
//   panel_kapali    edges[i].to == edges[i+1].from (yapisal), >= 3 kenar, tekil id
//   referans        her EdgeRef var olan panel/kenara gider
//   kenar_turu      seam -> bir Seam'de; cut -> dikissiz + finish; fold -> onFold + x=0;
//                   dartLeg -> ciftler, ortak apeks, esit bacak (pensBacakMM)
//   kisit           fitLength kisitlari bu bedende cozuldu (cozulemeyen adiyla kirmizi)
//   dikis_zincir    Seam.a ve Seam.b SIRALI zincir: ardisik kenarlar bir tepe paylasir (ayni panelde
//                   kose; panel gecisinde baska bir dikisin ILAN EDILEN uc esleri); yon zincirden
//                   turetilir, reverse a.bas <-> b.bas/b.son eslesmesini ilan eder (karar 7)
//   dikis_uzunluk   |len(a) - (ratio x len(b) + easeMM)| <= dikisUzunlukMM; ratio araligi
//   centik          seam.notchFractions (a'nin basindan) iki tarafta da panel centigiyle bulusur;
//                   b tarafinda reverse ile tasinir (centikMM)
//   kendini_kesme   degerlenen panel konturu kendini kesmez
//   halka_kapanma   SANAL DIKIS: halkanin ardisik kenarlari kavsaklarda (dikisin ilan edilen uc
//                   esi / kose / kat aynasi) bulusur; kavsak boslugu = o dikisin uzunluk artigi;
//                   en buyuk bosluk <= halkaKapanmaMM. Kavsagi olmayan halka KOPUKTUR. Tahmin yok:
//                   yon zincirden ve ilan edilen reverse'ten okunur.
// Bilgi satirlari (hukum degil): kisit cozumleri (kontrol kaymasi mm, bu bedende), 2B yerlestirme
// pozlari (BFS, dikis agaci; ilan edilen eslesmeyle, gerekirse ayna), dikis uc boslugu, panel
// alan/cevre, grafin notes'undaki DOGRULANMADI kalemleri ("uydurma" bolumu, karar 4a).
// Toleranslar contract'tan kaynak sutunuyla (Tolerans::fromContract); NaN kalirsa adiyla ret.
// Cikti bir TABLO: JSON + markdown (F6 paketine girer; basligi tolerans + kaynak tablosu).
#include <map>
#include <string>
#include <vector>

#include "graf.hpp"

namespace stitchu {
namespace graf {

struct ToleransSatir { std::string ad, kaynak; double deger = 0; };
struct Tolerans {
    double dikisUzunlukMM = 0, centikMM = 0, halkaKapanmaMM = 0, pensBacakMM = 0;
    double ratioMin = 0, ratioMax = 0;
    bool dolu = false;
    std::vector<ToleransSatir> tablo;   // ad + deger + kaynak (contract'tan oldugu gibi)
    static Tolerans fromContract(const JVal& contract);
};

// ---------------------------------------------------------------- zincir (karar 7)
struct ZincirKenar { EdgeRef ref; bool ters = false; };   // ters: kenar kendi from->to yonune karsi yuruyor
struct Kavsak { std::string tur; std::string dikis; };   // tur: kose | dikis | kat | "" (yok)
struct Zincir {
    std::vector<ZincirKenar> kenarlar;
    std::vector<Kavsak> kavsaklar;      // kenarlar[i] -> kenarlar[i+1] (halkada son -> ilk de dahil)
    bool ok = false;
    std::string hata;
    std::string basPanel, sonPanel;      // zincirin ilk giris / son cikis tepesi
    RefPoint bas, son;
    std::string metin() const;           // "on_beden/armhole_front.1 > on_beden/armhole_front.2 < ..."
};
struct DikisZincir { Zincir a, b; bool ok = false; std::string hata; };
struct ZincirCozumu {
    std::map<std::string, DikisZincir> dikisler;   // seam id -> iki taraf
    // dikilen tepe esleri: (panelP, P) <-> (panelQ, Q) via seam
    struct Es { std::string panelP, panelQ, dikis; RefPoint P, Q; };
    std::vector<Es> esler;
    bool ok = true;
};
// Butun dikislerin zincirlerini yapisal olarak cozer (beden gerekmez); cozulemeyen dikis adiyla.
ZincirCozumu zincirleriCoz(const Garment& g);
// Bir kenar dizisini (dikis tarafi ya da halka) verilen eslerle zincire cozer; halka=true ise son -> ilk kavsagi da arar.
Zincir zincirCoz(const Garment& g, const std::vector<EdgeRef>& refs, const ZincirCozumu& cz, bool halka);

// ---------------------------------------------------------------- rapor
struct Hukum {
    std::string kural;    // "panel_kapali" ...
    std::string hedef;    // panel/kenar/dikis adi
    std::string deger;    // olculen (metin)
    bool gecti = false;
    bool bilgi = false;   // true = hukum disi bilgi satiri
};
struct DikisSatir {
    std::string seam;
    double lenA = 0, lenB = 0, hedefA = 0, artikMM = 0;
    bool gecti = false;
    bool reverse = false;
    double ucBoslukMM = 0;             // bilgi: rijit hizalamada obur ucun kiris farki
    std::vector<double> centikArtikMM; // seam notch basina iki tarafin en kotusu
};
struct HalkaSatir {
    std::string ring, role;
    double toplamMM = 0;      // halkanin kenar uzunluklari toplami (tek yarim; kat aynasi katlanmaz)
    double kapanmaMM = 0;     // en buyuk kavsak boslugu
    std::string enKotuKavsak; // hangi kavsak
    bool gecti = false;
    std::string kavsaklar;    // "on/waist->arka/waist: dikis yan (0.0) | ..."
};
struct PanelPoz {
    std::string panel;
    bool yerlesti = false;
    double a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0;   // x' = a x + b y + tx; y' = c x + d y + ty (det +-1)
    bool ayna = false;        // det -1: ilan edilen eslesme icin panel ters cevrildi (kitap gibi acilis)
    std::string yerlestiren;  // hangi dikisle
    double alanMM2 = 0, cevreMM = 0;
};
struct DogrulamaRaporu {
    std::string grafId, bodyId;
    bool onArkaEsit = false;
    std::vector<ToleransSatir> toleranslar;   // baslik tablosu: ad, deger, kaynak (karar 5)
    std::vector<std::string> uydurmalar;      // grafin notes'unda DOGRULANMADI tasiyan kalemler (karar 4a)
    std::vector<Hukum> hukumler;
    std::vector<DikisSatir> dikisler;
    std::vector<HalkaSatir> halkalar;
    std::vector<PanelPoz> pozlar;
    int kirmizi() const;
    bool dikilebilir() const { return kirmizi() == 0; }
    JVal toJSON() const;
    std::string toMarkdown() const;
};

DogrulamaRaporu dogrula(const Garment& g, const Body& body, const JVal& contract, bool onArkaEsit = false);

// Yardimcilar (testler de kullanir)
double chainLength(const Garment& g, const std::vector<EdgeRef>& refs, const Body& body, bool onArkaEsit);
bool outlineSelfIntersects(const std::vector<PathCommand>& outline, std::string* where = nullptr);
// notes metninden DOGRULANMADI tasiyan kalemleri ayirir (';' ve '. ' ile bolunmus)
std::vector<std::string> uydurmaKalemleri(const std::string& notes);

} // namespace graf
} // namespace stitchu
