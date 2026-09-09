#pragma once
// grafop.hpp — GRAF OP'LARI (F2a). Saf fonksiyonlar: Garment -> Garment. Hicbiri girdiyi
// degistirmez; dokunmadigi paneller BAYT-AYNI kalir (edit-locality, contract/edit-locality-v1
// yasasi grafa tasindi: bolge = op'un adiyla dokundugu panel(ler)). Her op kaydini
// Garment.ops'a ekler; applyOp(kayit) ayni sonucu verir (tekrar oynatilabilir fark —
// spec-diff deseni). F3c dogal dilden bu kayitlari dolduracak.
//
// Op'lar mm'ye dusmez: kesir, oran, landmark ile calisir. `fitLength` bir KISIT op'udur
// (karar 6): grafa "bu kubik kenar, su dikisi kapatir" yazar (Edge.fitSeam + Seam.ratio/easeMM);
// kontrol noktasi kaymasi (mm) grafa YAZILMAZ, degerleme aninda verilen Body'de `cozumle`
// ile bisection'la cozulur. Ayni beden -> ayni cozum -> ayni cikti; graf bedene referansli kalir.
//
// Aralik sayilari (buzgu orani, klos katsayisi) ve cozucu sinirlari (fitLength dMax/tol)
// contract/graf-v1.json `araliklar` / `cozucu` bloklarindan gelir (OpCtx::fromContract).
// NaN kalirsa op ADIYLA reddeder.
#include <string>
#include <vector>

#include "graf.hpp"
#include "solver_utils.hpp"

namespace stitchu {
namespace graf {

struct OpCtx {
    double ratioMin = 0, ratioMax = 0;      // gather / seam ratio
    double flareMin = 0, flareMax = 0;      // flare factor
    double fitDMaxMM = 0, fitTolMM = 0;     // cozucu.fitLength: kontrol kaymasi arama siniri, uzunluk toleransi
    bool dolu = false;
    static OpCtx fromContract(const JVal& contract);
};

struct OpResult {
    bool ok = false;
    std::string hata;       // ok=false ise neden, adiyla
    Garment g;
};

// Tek giris: kayit adi + JSON arg. Bilinmeyen op adiyla reddedilir.
OpResult applyOp(const Garment& g, const OpRecord& rec, const OpCtx& ctx);
// Kayit dizisini sirayla oynatir; ilk hatada durur.
OpResult replay(const Garment& base, const std::vector<OpRecord>& ops, const OpCtx& ctx);
std::vector<std::string> opAdlari();

// Tipli sarmalayicilar (args'i kurar, applyOp'a verir). Hepsi kaydi ekler.
OpResult subdivide(const Garment& g, const std::string& panel, const std::string& edge, const std::vector<double>& fractions, const OpCtx& ctx);
// suppress (contract/primitives-v1.json op.suppress adi; pens = kenara uygulanan operator, HEDEF 1.9). trueLegs=true:
// apeks x'i pens agzinin orta noktasindan (dik ortay) kurulur, verilen apeks yalniz y'yi verir -> bacaklar INSADAN esit
// (yatay agizda tam; egik agizda dogrulayicinin kenar_turu dartLeg kurali yargilar). false: apeks oldugu gibi.
OpResult suppress(const Garment& g, const std::string& panel, const std::string& edge, double atFraction, double intakeFraction,
                  const RefPoint& apex, const std::string& legId, bool trueLegs, const OpCtx& ctx);
OpResult gather(const Garment& g, const std::string& panel, const std::string& edge, double ratio, const OpCtx& ctx);
OpResult flare(const Garment& g, const std::string& panel, const std::string& edge, double factor, const OpCtx& ctx);
OpResult extend(const Garment& g, const std::string& panel, const std::string& edge, double deltaMM, const OpCtx& ctx);
OpResult shorten(const Garment& g, const std::string& panel, const std::string& edge, double deltaMM, const OpCtx& ctx);
OpResult extendTo(const Garment& g, const std::string& panel, const std::string& edge, const std::string& yLandmark, double yOffsetMM, const OpCtx& ctx);
OpResult split(const Garment& g, const std::string& panel, const std::string& vertexA, const std::string& vertexB,
               const std::string& panelA, const std::string& panelB, const std::string& seam, double seamRatio, const OpCtx& ctx);
OpResult overlay(const Garment& g, const std::string& host, const std::vector<std::string>& edges, double excessRatio,
                 const std::string& newPanel, const std::string& seamPrefix, const OpCtx& ctx);
OpResult attach(const Garment& g, const std::string& hostPanel, const std::string& hostEdge, const Panel& newPanel,
                const std::string& newEdge, double ratio, const std::string& seam, const OpCtx& ctx);
OpResult reshapeEdge(const Garment& g, const std::string& panel, const std::string& edge, const RefPoint* from, const RefPoint* to,
                     const std::vector<RefPoint>* control, const OpCtx& ctx);
OpResult moveVertex(const Garment& g, const std::string& panel, const std::string& edge, const RefPoint& to, const OpCtx& ctx);
OpResult mirror(const Garment& g, const std::string& panel, const std::string& newId, const OpCtx& ctx);
OpResult closure(const Garment& g, const std::string& seam, const std::string& type, double fromFraction, double toFraction, const OpCtx& ctx);
// KISIT: kubik kenar `panel/edge`, `seam` dikisini len(a) = ratio x len(b) + easeMM ile kapatir. Op dikisin
// ratio/easeMM'ini yazar, kenara fitSeam baglar; mm YAZMAZ. Kenar o dikisin bir tarafinda olmali; iki tarafi da
// kisitli dikis (dongu) reddedilir.
OpResult fitLength(const Garment& g, const std::string& panel, const std::string& edge, const std::string& seam,
                   double ratio, double easeMM, const OpCtx& ctx);

// DEGERLEME-ANI COZUM (karar 6). fitSeam tasiyan her kubik kenar icin verilen Body'de: hedef = kenarin tarafinin
// dikis hedefi (a: ratio x len(b) + ease; b: (len(a) - ease)/ratio) eksi ayni taraftaki kisitsiz kenarlar, kisitli
// kenar sayisina bolunur; kontrol noktalari kiris normali boyunca d mm kaydirilir, d bisection ile (|d| <= dMaxMM,
// |len - hedef| <= tolMM). Sonuc DEGERLENMIS graf kopyasi (mm kaymalar yalniz kopyada); grafin kendisi degismez.
struct Cozum { std::string panel, edge, seam; double hedefMM = 0, dMM = 0, artikMM = 0; };
struct CozumSonucu { bool ok = false; std::string hata; Garment g; std::vector<Cozum> cozumler; };
CozumSonucu cozumle(const Garment& g, const Body& body, bool onArkaEsit, const OpCtx& ctx);

// PENS AGZINI KISIT COZUCUSUYLE COZ (2026-09-08). Bel dikisinin iki tarafinin uzunluk
// esitligini SERT KISIT olarak solver_utils'e verir; pens agzi bilinmeyendir. Cozum
// kenar uclarinin xOffsetMM'ine yazilir (mm grafa gomulmez: ofset landmark'a bagli kalir).
// Cozulemezse graf DEGISMEZ ve hata ADIYLA doner. seamId genelde "bel".
CozumSonucu cozPens(const Garment& g, const Body& body, bool onArkaEsit,
                    const solver::SolverCtx& sctx, const std::string& seamId);

// SILUET HEDEFI (2026-09-09, hakem A3 kusur 1: okumanin olcumu motora girmiyordu). vision-graf-v1 hedefler[]:
// {ring, ratioTo, ratio, kaynak, uyari}. hedefUygula: hedef orani halka bolluguna cevirir (Panel.ease mm) ve
// contract cozucu.hedef sinirina kirpar; her hedef icin rapor satiri (istenen / gereken / uygulanan / sapma).
// hedefOlc: grafi DEGISTIRMEDEN ayni satirlari olcer (grafdogrula --hedef). Oran grafa yazilmaz (yasa 3).
struct HedefSatir { std::string ring, ratioTo, kaynak, uyari; double istenen = 0, gerekenMM = 0, uygulananMM = 0, oncekiMM = 0, giysiOran = 0, sapma = 0; bool kirpildi = false; std::string metin; };
std::vector<HedefSatir> hedefUygula(Garment& g, const JVal& hedefler, const Body& body, const JVal& contract, std::string& hata);
std::vector<HedefSatir> hedefOlc(const Garment& g, const JVal& hedefler, const Body& body, std::string& hata);
// Cizim/olcum icin COZULMUS graf (cozumle + cozPens, dogrulayiciyla ayni sira). not_: cozulemeyen kalemler adiyla (bos = hepsi cozuldu).
// pensCoz=false: yalniz fitLength cozulur, pens agzi/yan tepe DOKUNULMAZ (croquis flat: giyilmis izdusumde bel dikisi yanda surekli;
// yan tepe kaydirmasi kalip cozumudur — 2026-09-09 kor hakem tur 7: "bel bandi ile etek arasinda yan dikis kopuk")
Garment cozulmusGraf(const Garment& g, const Body& body, bool onArkaEsit, const JVal& contract, const JVal& bodyContract, std::string& not_, bool pensCoz = true);

} // namespace graf
} // namespace stitchu
