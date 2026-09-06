#pragma once
// flatsvg.hpp — GRAFTAN FLAT (0509 A2b). HEDEF: "ayni graf gercek36'da kalip, croquis36'da flat".
//
// TEK CUMLE: bir Garment grafi bir Body'de degerlenir, dogrulayicinin ZATEN hesapladigi 2B
// yerlestirme pozlari (grafdogrula.hpp PanelPoz, dikis agaci BFS) kullanilarak paneller tek
// duzleme oturtulur ve teknik cizim (flat) SVG'si yazilir. Burada YENI GEOMETRI ICAT EDILMEZ:
// nokta = graf.hpp eval, poz = grafdogrula.hpp dogrula. Bu dosya yalniz SVG METNI uretir.
//
// KATMANLAR (contract/flat-convention-v1.json + KOSU/sinyal.sh kabul_P1 katman() kapisi):
//   <g id="outline">    panel konturlari (kalin)
//   <g id="seams">      dikis kenarlari (ince)
//   <g id="topstitch">  ust dikis izi (kesikli) — dikis kenarlarinin ic ofseti
//   <g id="details">    pens bacaklari, centikler, kat cizgisi
// Kok <svg> data-scale / data-unit-mm ve croquis landmark ilanlarini (data-y-waist/bust/hip)
// tasir; sayilar contract'tan ve Body'den okunur, kodda sabit uydurulmaz.
//
// DETERMINIZM: ayni graf + ayni beden -> BAYT-AYNI SVG (kabul_P1 ciz_iki_kez). Sayilar tek
// bicimle (%.3f) yazilir, panel/kenar sirasi grafin kendi sirasidir.
#include <string>

#include "body.hpp"
#include "graf.hpp"

namespace stitchu {
namespace graf {

struct FlatOpts {
    double kenarBoslukMM = 20.0;   // viewBox pay
    bool onArkaEsit = false;
};

// contract: contract/graf-v1.json (toleranslar + dogrulayici icin). bodyContract: contract/body-v1.json
// (landmark ilanlari icin; bos JVal verilirse ilan satiri yazilmaz).
// Hata durumunda bos string dondurur ve hata'yi ADIYLA doldurur (sessiz default yok).
std::string flatSVG(const Garment& g, const Body& body, const std::string& bodyId,
                    const JVal& contract, const JVal& bodyContract,
                    const FlatOpts& opts, std::string& hata);

}  // namespace graf
}  // namespace stitchu
