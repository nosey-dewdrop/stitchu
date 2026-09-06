#pragma once
// kalipsvg.hpp — GRAFTAN KALIP SAYFASI (0509 A2b). "Ayni graf gercek36'da KALIP."
//
// TEK CUMLE: bir Garment grafi gercek bir Body'de degerlenir; her panel KENDI duzleminde
// (poz uygulanmadan, kalip parcasi kendi basina kesilir) bir satira dizilir; her parca
// kesim/dikis cizgisi, grain oku, centikler, kat cizgisi ve contract/pattern-sheet-v1.json'un
// yazdigi etiket satirlarini tasir.
//
// SAYILAR SOZLESMEDEN (contract/pattern-sheet-v1.json): cizgiStilleri.{kesim,dikis,icCizgi,
// katCizgisi,grainOku}, centik.{uzunlukMM,genislikMM,onArka,ciftAralikMM}, dikisPayi.{govdeMM,
// etekUcuMM}, parcaEtiketi.tipografi.{parcaAdiMM,govdeMM,katKenariYazisiMM}. Eksik alan -> hata
// ADIYLA (ERR_SHEET_CONTRACT), sessiz default yok.
#include <string>

#include "body.hpp"
#include "graf.hpp"

namespace stitchu {
namespace graf {

struct KalipOpts {
    double parcaArasiMM = 40.0;
    double kenarBoslukMM = 30.0;
    bool onArkaEsit = false;
};

// sheet: contract/pattern-sheet-v1.json. Hata -> bos string + hata ADIYLA.
std::string kalipSVG(const Garment& g, const Body& body, const std::string& bodyId,
                     const JVal& sheet, const KalipOpts& opts, std::string& hata);

// OLCEK GECIDI (A2 brief madde 1b). Gercek bir bedende degerlenen grafin MUTLAK giysi
// yuksekligi (butun panellerin ortak sinir kutusunun yuksekligi, omuz cizgisinden etek
// ucuna) contract/body-v1.json olcekAraligi.giysiYuksekligiMM araliginin disinda ise
// ERR_SCALE_MISMATCH. Amac birim kaymasini (mm/cm, croquis 1:3, olceksiz kullanici birimi)
// topolojiden BAGIMSIZ yakalamak. Aralik contract'tan okunur; kodda sabit yok.
// olculenMM her durumda doldurulur. true = aralik icinde.
bool olcekDogrula(const Garment& g, const Body& body, const JVal& bodyContract,
                  bool onArkaEsit, double& olculenMM, std::string& hata);

}  // namespace graf
}  // namespace stitchu
