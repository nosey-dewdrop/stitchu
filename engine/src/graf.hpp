#pragma once
// graf.hpp — GRAF IR (F2a, 2026-09-05). HEDEF.md madde 9 (Edge/Panel/Stitch primitifleri,
// sabit menu yok), madde 4-5 (bir giysi grafi, iki beden), madde 2 (edit = grafa op).
//
// TEK CUMLE: bir giysi, kenarlari mm ile DEGIL beden LANDMARK'i + oranla tanimlanan bir
// Edge/Panel/Seam grafidir. Ayni graf gercek bedende (Body "gercek36" / graded EU34-44)
// degerlenince KALIP, croquis bedende ("croquis36") degerlenince FLAT cikar. Bu dosya
// yalniz IR'dir: tipler, JSON gidis-donus (bayt-ayni), bir Body verilince degerleme
// (nokta -> mm, kenar -> yay uzunlugu). CIZIM burada YOK (F2b), op'lar grafop.hpp'de,
// dogrulama + sanal dikis grafdogrula.hpp'de.
//
// KOORDINAT (contract/body-v1.json koordinat blogu ile ayni cumle): x=0 CF/CB, y=0 omuz
// cizgisi (neckBase), +y asagi, mm. Bir Anchor'un x'i "xFactor x taban + xOffsetMM"dir; taban
// ya landmark'in kendi x'i (croquis: cevre/4 tup) ya da halka cevresinden turetilen
// on/arka/ceyrek pay (kalip: gercek bedende landmark.x govde IZDUSUMUDUR, kalip parcasi
// ise cevrenin payini tasir). Bolluk (kumas payi) DEGERLEME baglaminda halka basina mm
// olarak gelir ve cevreyi orantili buyutur: "kumas = bedene bolluk alani".
//
// NOKTA = LANDMARK TERIMLERININ AFIN BIRLESIMI (RefPoint). Tek terim gunluk hal
// ({"landmark":"landmark.waist","xFactor":0.23,"xOffsetMM":0}); De Casteljau bolme, lerp ve
// olcekleme gibi islemler agirliklari 1'e toplanan cok terimli nokta uretir. Bu sayede
// bir kenari kesirle bolmek ya da bir kenari buzgu oraniyla uzatmak grafi mm'ye
// dusurmez: sonuc yine landmark'a bagli kalir ve baska bedende yeniden degerlenir.
//
// SOZLESME: contract/graf-v1.json (alan adlari, enum'lar, toleranslar, op tablosu).
// Sayilar koda gomulmez: tolerans Tolerans::fromContract ile okunur, NaN kalirsa
// dogrulayici ADIYLA reddeder.
#include <string>
#include <utility>
#include <vector>

#include "body.hpp"
#include "geometry.hpp"

namespace stitchu {
namespace graf {

// ---------------------------------------------------------------- JSON (kucuk, deterministik)
struct JVal {
    enum Tip { Null, Bool, Num, Str, Arr, Obj };
    Tip tip = Null;
    bool b = false;
    double n = 0;
    std::string s;
    std::vector<JVal> a;
    std::vector<std::pair<std::string, JVal>> o;  // sirali anahtarlar (emit sirasi = ekleme sirasi)

    static JVal null() { return JVal(); }
    static JVal boolean(bool v) { JVal j; j.tip = Bool; j.b = v; return j; }
    static JVal num(double v) { JVal j; j.tip = Num; j.n = v; return j; }
    static JVal str(const std::string& v) { JVal j; j.tip = Str; j.s = v; return j; }
    static JVal arr() { JVal j; j.tip = Arr; return j; }
    static JVal obj() { JVal j; j.tip = Obj; return j; }

    bool isNull() const { return tip == Null; }
    bool isObj() const { return tip == Obj; }
    bool isArr() const { return tip == Arr; }
    bool isNum() const { return tip == Num; }
    bool isStr() const { return tip == Str; }
    bool isBool() const { return tip == Bool; }
    bool has(const std::string& k) const;
    const JVal* get(const std::string& k) const;      // nullptr yoksa
    JVal& set(const std::string& k, JVal v);           // var olani degistirir, yoksa ekler
    JVal& push(JVal v) { a.push_back(std::move(v)); return a.back(); }
    double numOr(const std::string& k, double d) const;
    std::string strOr(const std::string& k, const std::string& d) const;
    bool boolOr(const std::string& k, bool d) const;
};
// Kanonik metin: 2 bosluk girinti, anahtarlar ekleme sirasinda, sayilar en kisa gidis-donus
// (%.15g..%.17g), yalniz-sayi/yalniz-metin dizileri tek satirda. Ayni JVal -> ayni bayt.
std::string emit(const JVal& v, int indent = 0);
bool parse(const std::string& text, JVal& out, std::string& err);
std::string fmtNum(double v);

// ---------------------------------------------------------------- Nokta: landmark + xFactor (oran)
struct Anchor {
    std::string landmark;          // "landmark.waist" (contract/body-v1.json adlari)
    std::string xOf = "landmark";  // landmark | ringFront | ringBack | ringQuarter | widthHalf (contract enum xOf)
    std::string ring;              // YALNIZ xOf ring* icin halka adi (bos -> Body::ringOfLandmark(landmark)); baska xOf'ta dolu olmasi sema hatasi
    std::string width;             // YALNIZ xOf widthHalf icin beden genislik olcusu adi ("width.crossFront"); x tabani = olcu/2 (karar 3: bir alan tek anlam)
    double xFactor = 1.0;             // x = xFactor x taban(x) + xOffsetMM
    double xOffsetMM = 0.0;
    std::string yLandmark;         // y tabani; bos -> landmark
    std::string yLandmark2;        // dolu ise y = y1 + yLerp x (y2 - y1)
    double yLerp = 0.0;
    double yOffsetMM = 0.0;
    bool operator==(const Anchor& o) const;
};
struct Term { double w = 1.0; Anchor a; };
struct RefPoint {
    std::vector<Term> terms;       // agirliklar 1'e toplanir (afin birlesim)
    static RefPoint of(const Anchor& a) { RefPoint p; p.terms.push_back({1.0, a}); return p; }
    bool operator==(const RefPoint& o) const;
    bool operator!=(const RefPoint& o) const { return !(*this == o); }
    bool tekTerim() const { return terms.size() == 1; }
    // Yapisal: butun terimler x'te 0 mi (xFactor 0 ve xOffsetMM 0 -> CF/CB kat cizgisi)
    bool xSifir() const;
    void normalize();              // ayni Anchor'lu terimleri birlestir, sifir agirliklari at
};
RefPoint lerp(const RefPoint& a, const RefPoint& b, double t);            // (1-t)a + tb
RefPoint affine(const std::vector<std::pair<double, RefPoint>>& terms);  // sum w_i p_i, sum w_i == 1
RefPoint scaleX(const RefPoint& p, double k);                            // x -> k x, y sabit (kat ekseni x=0 etrafinda)
RefPoint shiftY(const RefPoint& p, double dyMM);                         // yOffsetMM += dy
RefPoint mirrorX(const RefPoint& p);                                     // x -> -x
// Karar 3: xOf/ring/width tek anlam — carpik kombinasyon adiyla (parse ve sema ayni kural)
bool anchorXOfTutarli(const std::string& xOf, const std::string& ring, const std::string& width, std::string& why);

// Degerleme baglami: beden + halka basina bolluk (cevre mm). onArkaEsit: on/arka payi 0.5
// say (croquis flat: on+arka ust uste iki kat — body.gen.hpp kCroquisOmuzHukmu cumlesi).
struct EvalCtx {
    const Body* body = nullptr;
    std::vector<std::pair<std::string, double>> ringEaseMM;  // {"girth.waist", 40}
    bool onArkaEsit = false;
    double ringEase(const std::string& ring) const;
};
// Landmark yoksa std::runtime_error (adiyla). Sessiz default yok.
Point eval(const Anchor& a, const EvalCtx& ctx);
Point eval(const RefPoint& p, const EvalCtx& ctx);

// ---------------------------------------------------------------- Edge / Panel / Seam / Garment
struct Edge {
    std::string id;
    std::string kind;              // contract enum edgeKind: cut | seam | fold | dartLeg
    std::string role;              // mevcut edgeRoles ile uyumlu ad ("armhole_front", "sleeve_cap", ...)
    int rolePart = 0;              // 0/0 = tam kenar; k/n = bolunmus rolun k. parcasi (K2/K5 kok sebep)
    int roleCount = 0;
    RefPoint from, to;
    std::vector<RefPoint> control; // 0 (dogru) ya da 2 (kubik)
    std::string finish;            // cut kenar icin bitirme gerekcesi (contract enum finish); dikisli kenarda bos
    std::vector<double> notches;   // kenar uzerinde kesir (0..1), yay uzunluguyla
    double gatherRatio = 1.0;      // bu kenar buzgu icin oranla uzatildiysa (op.gather/overlay) — bilgi, dikis orani Seam'de
    std::string fitSeam;           // dolu ise KISIT (op fitLength, karar 6): bu kubik kenarin kontrolleri degerleme aninda, verilen
                                   // Body'de, fitSeam dikisinin len(a) = ratio x len(b) + easeMM esitligini kapatacak sekilde cozulur
                                   // (grafop.hpp cozumle). mm grafa yazilmaz; ayni beden -> ayni cozum.

    bool isLine() const { return control.empty(); }
    Edge reversed() const;
    // Kenari verilen kesirlerde boler (parametre t; dogruda t == yay kesri). Rol her parcaya
    // PARCALI tasinir (rolePart/roleCount). notches ilgili parcaya yeniden kesirlenir.
    std::vector<Edge> subdivide(const std::vector<double>& fractions) const;
    std::vector<PathCommand> path(const EvalCtx& ctx) const;   // Move + Line/Curve
    double length(const EvalCtx& ctx) const;                    // mm, pathLength (24 adim)
    Point at(const EvalCtx& ctx, double t) const;               // parametre t'de nokta
};

struct RingEase { std::string ring; double mm = 0.0; };

struct Panel {
    std::string id;
    std::vector<Edge> edges;       // kapali halka: edges[i].to == edges[i+1].from
    double grainDeg = 0.0;         // 0 = duz cozgu, 45 = verev
    bool onFold = false;           // x=0 kat cizgisi (fold kenarlari)
    int cutCount = 1;
    double seamAllowanceMM = 0.0;  // 0 = contract varsayilani F2b'de doldurur; burada sayi uydurulmaz
    std::vector<RingEase> ease;    // halka basina cevre bollugu, mm (kumas = bedene bolluk alani)
    std::string reason;           // parca neden var (parca_sayisi yasasi)

    int edgeIndex(const std::string& edgeId) const;   // -1 yoksa
    const Edge* edge(const std::string& edgeId) const;
    Edge* edge(const std::string& edgeId);
    bool closed(std::string* why = nullptr) const;
    RefPoint vertex(size_t i) const { return edges[i % edges.size()].from; }
    void setVertex(size_t i, const RefPoint& p);      // edges[i].from ve edges[i-1].to birlikte
    std::vector<PathCommand> outline(const EvalCtx& ctx) const;  // Move ... Close
    EvalCtx ctxFor(const Body& body, bool onArkaEsit = false) const;
};

struct EdgeRef {
    std::string panel, edge;
    bool operator==(const EdgeRef& o) const { return panel == o.panel && edge == o.edge; }
};
struct Closure {
    std::string type;              // contract enum closureType; bos = kapama yok
    double fromFraction = 0.0;     // dikisin bu kesirleri arasi kapamadir
    double toFraction = 1.0;
};
struct Seam {
    std::string id;
    std::vector<EdgeRef> a;        // buzulen taraf (ratio >= 1). SIRALI ZINCIR: ardisik kenarlar bir tepe paylasir (karar 7)
    std::vector<EdgeRef> b;        // SIRALI ZINCIR
    bool reverse = false;          // false: a'nin basi b'nin BASIYLA dikilir; true: a'nin basi b'nin SONUYLA (karar 7, GarmentCode Interface.reverse)
    double ratio = 1.0;            // len(a) = ratio x len(b) + easeMM
    double easeMM = 0.0;
    std::vector<double> notchFractions;  // dikis boyunca kesir, a'nin BASINDAN olculur; b'ye reverse ile tasinir
    Closure closure;
    std::string reason;
};
struct Ring {
    std::string id;
    std::string role;              // "neck" | "armhole" | "hem" | "sleeve_hem" | "waist" ... (edgeRoles ile uyumlu)
    std::vector<EdgeRef> edges;    // giysi dikildiginde ardisik; kat cizgisine dayanan uclar ayna ile kapanir
};
struct OpRecord {
    std::string op;
    JVal args;                     // grafop.hpp: applyOp(g, rec) ayni sonucu verir (tekrar oynatilabilir fark)
};
struct Garment {
    std::string id;
    std::string notes;
    std::vector<Panel> panels;
    std::vector<Seam> seams;
    std::vector<Ring> rings;
    std::vector<OpRecord> ops;

    const Panel* panel(const std::string& id) const;
    Panel* panel(const std::string& id);
    const Seam* seam(const std::string& id) const;
    Seam* seam(const std::string& id);
    const Edge* edge(const EdgeRef& r) const;
    Edge* edge(const EdgeRef& r);
    // (panel, edge) referansi hangi panelde: split sonrasi kenar tasinirsa refs yeniden yazilir
    std::string panelOfEdge(const std::string& edgeId) const;
};

// ---------------------------------------------------------------- JSON gidis-donus
JVal toJSON(const RefPoint& p);
JVal toJSON(const Edge& e);
JVal toJSON(const Panel& p);
JVal toJSON(const Seam& s);
JVal toJSON(const Ring& r);
JVal toJSON(const Garment& g);
std::string toJSONText(const Garment& g);
std::string panelJSONText(const Panel& p);   // edit-locality kiyasi icin

bool fromJSON(const JVal& v, RefPoint& out, std::string& err);
bool fromJSON(const JVal& v, Edge& out, std::string& err);
bool fromJSON(const JVal& v, Panel& out, std::string& err);
bool fromJSON(const JVal& v, Seam& out, std::string& err);
bool fromJSON(const JVal& v, Ring& out, std::string& err);
bool fromJSON(const JVal& v, Garment& out, std::string& err);
bool fromJSONText(const std::string& text, Garment& out, std::string& err);

// ---------------------------------------------------------------- Sema (contract/graf-v1.json)
// Belgeyi sozlesmenin `tipler` tablosuna karsi yurur: bilinmeyen alan, eksik zorunlu alan,
// enum disi deger, tip uyusmazligi ADIYLA hatalar'a yazilir. true = temiz.
bool semaDogrula(const JVal& doc, const JVal& contract, std::vector<std::string>& hatalar);
// Emit'in yazdigi her alan sozlesmede tanimli mi (sema ile kod ayni dili konusuyor mu).
bool semaKapsar(const JVal& contract, const Garment& ornek, std::vector<std::string>& hatalar);

} // namespace graf
} // namespace stitchu
