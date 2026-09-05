#pragma once
// grafdogrula.hpp — GRAF DOGRULAYICI + SANAL DIKIS (F2a). Bir Garment grafi bir Body'de
// degerlenir ve DIKILEBILIR mi diye yargilanir. Kurallar (contract/graf-v1.json _yasa 3-7):
//   sema            belge sozlesmeyle ayni dili konusuyor (alan/enum/tip)
//   panel_kapali    edges[i].to == edges[i+1].from (yapisal), >= 3 kenar, tekil id
//   referans        her EdgeRef var olan panel/kenara gider
//   kenar_turu      seam -> bir Seam'de; cut -> dikissiz + finish; fold -> onFold + x=0;
//                   dartLeg -> ciftler, ortak apeks, esit bacak (pensBacakMM)
//   dikis_uzunluk   |len(a) - (ratio x len(b) + easeMM)| <= dikisUzunlukMM; ratio araligi
//   centik          seam.notchFractions iki tarafta da panel centigiyle bulusur (centikMM)
//   kendini_kesme   degerlenen panel konturu kendini kesmez
//   halka_kapanma   SANAL DIKIS: halkanin ardisik kenarlari kavsaklarda (dikis / kose / kat
//                   aynasi) bulusur; kavsak boslugu = o dikisin uzunluk artigi (rijit 2B
//                   yerlestirmede iki parca ayni ucta baslar, artik obur ucta birikir);
//                   en buyuk bosluk <= halkaKapanmaMM. Kavsagi olmayan halka KOPUKTUR.
// Bilgi satirlari (hukum degil): rijit 2B yerlestirme pozlari (BFS, dikis agaci), dikis uc
// boslugu (kiris uyumsuzlugu — egri/dogru dikilebilir, sekil bilgisi), panel alan/cevre.
// Toleranslar contract'tan (Tolerans::fromContract); NaN kalirsa dogrulayici adiyla reddeder.
// Cikti bir TABLO: JSON + markdown (F6 paketine girer).
#include <string>
#include <vector>

#include "graf.hpp"

namespace stitchu {
namespace graf {

struct Tolerans {
    double dikisUzunlukMM = 0, centikMM = 0, halkaKapanmaMM = 0, pensBacakMM = 0;
    double ratioMin = 0, ratioMax = 0;
    bool dolu = false;
    static Tolerans fromContract(const JVal& contract);
};

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
    double cosT = 1, sinT = 0, tx = 0, ty = 0;
    std::string yerlestiren;  // hangi dikisle
    double alanMM2 = 0, cevreMM = 0;
};
struct DogrulamaRaporu {
    std::string garment, bodyId;
    bool onArkaEsit = false;
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

} // namespace graf
} // namespace stitchu
