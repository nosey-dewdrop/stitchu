#pragma once
// grafop.hpp — GRAF OP'LARI (F2a). Saf fonksiyonlar: Garment -> Garment. Hicbiri girdiyi
// degistirmez; dokunmadigi paneller BAYT-AYNI kalir (edit-locality, contract/edit-locality-v1
// yasasi grafa tasindi: bolge = op'un adiyla dokundugu panel(ler)). Her op kaydini
// Garment.ops'a ekler; applyOp(kayit) ayni sonucu verir (tekrar oynatilabilir fark —
// spec-diff deseni). F3c dogal dilden bu kayitlari dolduracak.
//
// Op'lar mm'ye dusmez: kesir, oran, landmark ile calisir. Tek istisna `bulge`: bir
// bedende dikis kapanmasi icin sayisal cozulen kontrol noktasi kaymasi (mm) — kaydi
// hedef uzunlugu ve bedeni de tasir, denetlenebilir.
//
// Aralik sayilari (buzgu orani, klos katsayisi) contract/graf-v1.json `araliklar`
// blogundan gelir (OpCtx::fromContract). NaN kalirsa op ADIYLA reddeder.
#include <string>
#include <vector>

#include "graf.hpp"

namespace stitchu {
namespace graf {

struct OpCtx {
    double ratioMin = 0, ratioMax = 0;      // gather / seam ratio
    double flareMin = 0, flareMax = 0;      // flare factor
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
OpResult dart(const Garment& g, const std::string& panel, const std::string& edge, double atFraction, double intakeOran,
              const RefPoint& apex, const std::string& legId, const OpCtx& ctx);
OpResult gather(const Garment& g, const std::string& panel, const std::string& edge, double ratio, const OpCtx& ctx);
OpResult flare(const Garment& g, const std::string& panel, const std::string& edge, double factor, const OpCtx& ctx);
OpResult extend(const Garment& g, const std::string& panel, const std::string& edge, double deltaMM, const OpCtx& ctx);
OpResult shorten(const Garment& g, const std::string& panel, const std::string& edge, double deltaMM, const OpCtx& ctx);
OpResult extendTo(const Garment& g, const std::string& panel, const std::string& edge, const std::string& yLandmark, double yOfsetMM, const OpCtx& ctx);
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
// Kontrol noktalarini (nx, ny) yonunde dMM kaydirir (kubik kenar). Kaydi hedefMM/bodyId tasir (bilgi).
OpResult bulge(const Garment& g, const std::string& panel, const std::string& edge, double dMM, double nx, double ny,
               double hedefMM, const std::string& bodyId, const OpCtx& ctx);
// SAYISAL COZUM: kubik kenarin yay uzunlugunu verilen bedende hedefe getiren bulge'i bisection ile
// bulur (kiris normali boyunca, |d| <= dMaxMM), sonucu bulge op'u olarak uygular. Bulunamazsa adiyla reddeder.
OpResult fitLength(const Garment& g, const std::string& panel, const std::string& edge, double hedefMM, const Body& body,
                   bool onArkaEsit, double dMaxMM, double tolMM, const OpCtx& ctx);

} // namespace graf
} // namespace stitchu
