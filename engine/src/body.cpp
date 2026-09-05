// body.cpp — bkz. body.hpp. Sayilar body.gen.hpp'den (contract/body-v1.json).
#include "body.hpp"

#include <algorithm>
#include <stdexcept>

#include "body.gen.hpp"

namespace stitchu {

namespace {
constexpr double kPi = 3.14159265358979323846;
bool none(double v) { return std::isnan(v); }

double gradeCol(const char* name, int col) {
    for (const auto& c : contract::kBodyGradeCols)
        if (std::string(c.name) == name) return c.v[col];
    throw std::runtime_error(std::string("body: gradeTablosu sutunu yok: ") + name);
}
double gradeConst(const char* name) {
    for (const auto& c : contract::kBodyGradeConst)
        if (std::string(c.name) == name) return c.v;
    throw std::runtime_error(std::string("body: gradeTablosu sabiti yok: ") + name);
}
double croquisOran(const char* name) {
    for (const auto& c : contract::kCroquisOran)
        if (std::string(c.name) == name) return c.v;
    throw std::runtime_error(std::string("body: croquisOranlar yok: ") + name);
}
double r1(double v) { return std::round(v * 10.0) / 10.0; }
// croquis tek genislik yasasi (F1 tur 5): bolluk yalniz contract'ta yazili halkada, yoksa 0.
double croquisBolluk(const std::string& ring) {
    for (const auto& c : contract::kCroquisBolluk) if (ring == c.name) return c.v;
    return 0.0;
}
} // namespace

double ellipsePerimeterRamanujan(double a, double b) {
    const double h = ((a - b) * (a - b)) / ((a + b) * (a + b));
    return kPi * (a + b) * (1.0 + 3.0 * h / (10.0 + std::sqrt(4.0 - 3.0 * h)));
}

double ellipseHalfDepthFor(double perimeter, double a) {
    double lo = 0.0, hi = a * 4.0 + perimeter;
    for (int i = 0; i < 80; ++i) {
        const double mid = 0.5 * (lo + hi);
        if (ellipsePerimeterRamanujan(a, mid) < perimeter) lo = mid; else hi = mid;
    }
    return 0.5 * (lo + hi);
}

void Body::set(const std::string& name, double x, double y) {
    for (auto& l : lm_) if (l.name == name) { l.x = x; l.y = y; return; }
    lm_.push_back({name, x, y});
}
void Body::setRing(const std::string& name, double g, double bf) {
    for (auto& r : rg_) if (r.name == name) { r.girth = g; r.backFrac = bf; return; }
    rg_.push_back({name, g, bf});
}
void Body::setScalar(const std::string& name, double v) {
    for (auto& s : sc_) if (s.name == name) { s.v = v; return; }
    sc_.push_back({name, v});
}

std::vector<std::string> Body::gradeSizes() {
    std::vector<std::string> out;
    for (int i = 0; i < contract::kBodyGradeCount; ++i) out.push_back(contract::kBodyGradeSizes[i]);
    return out;
}

Body Body::fromContract(const std::string& id) {
    Body b; b.id_ = id;
    auto load = [&](const auto& lms, const auto& rgs, const auto& scs) {
        for (const auto& l : lms) b.set(l.name, l.x, l.y);
        for (const auto& r : rgs) b.setRing(r.name, r.girthMM, r.backFrac);
        for (const auto& s : scs) b.setScalar(s.name, s.v);
    };
    if (id == "gercek36") load(contract::kBodyLandmarks_gercek36, contract::kBodyGirths_gercek36, contract::kBodyScalars_gercek36);
    else if (id == "croquis36") load(contract::kBodyLandmarks_croquis36, contract::kBodyGirths_croquis36, contract::kBodyScalars_croquis36);
    else throw std::runtime_error("body: fromContract bilinmeyen beden kimligi: " + id);
    return b;
}

// Gercek beden: gradeTablosu sutunlarindan, contract/body-v1.json gercek36
// landmark satirlarindaki AYNI formullerle (kaynak alanlarinda yazili).
Body Body::graded(const std::string& size) {
    int col = -1;
    for (int i = 0; i < contract::kBodyGradeCount; ++i)
        if (size == contract::kBodyGradeSizes[i]) col = i;
    if (col < 0) throw std::runtime_error("body: gradeTablosu'nda olmayan beden: " + size);
    Body b; b.id_ = size;
    auto G = [&](const char* n) { return gradeCol(n, col); };
    const double bust = G("girth.bust"), waist = G("girth.waist"), hip = G("girth.hip");
    const double neckHalf = G("width.neckBase") / 2.0;
    const double shoulder = G("length.shoulder");
    const double slope = G("angle.shoulderSlope");
    const double napeDrop = gradeConst("length.napeToShoulderLine");
    const double tipX = neckHalf + shoulder * std::cos(slope * kPi / 180.0);
    const double tipY = shoulder * std::sin(slope * kPi / 180.0);
    const double waistY = G("length.backNapeToWaist") - napeDrop;
    const double underarmY = G("length.armholeDepth") - napeDrop;
    const double apexX = gradeConst("width.apexToApex_oran") * bust / 2.0;
    // Gogus ucu dikeyi: ANSUR II (cervicale -> gogus ucu) / (cervicale -> bel) orani x arka boy (F1 tur 5).
    // Brusttiefe (length.bustDepth) YUZEY olcusudur, apex.y ondan turetilmez (eski sqrt formulu 59 mm hataliydi).
    const double apexY = gradeConst("cervicaleToApexOverNapeToWaist") * G("length.backNapeToWaist") - napeDrop;
    const double hipY = waistY + G("length.waistToHip");
    const double arm = G("length.arm");
    const double underbustOran = gradeConst("girth.underbust_oran");

    // Halkalar ONCE: landmark x'leri ringHalfWidth'ten okunur (tek genislik tanimi, F1 tur 4).
    b.setRing("girth.neckBase", G("girth.neckBase"), 0.5);
    b.setRing("girth.upperBust", bust - gradeConst("girth.upperBust_fark"), contract::kNoValue);
    b.setRing("girth.bust", bust, G("arkaPay.bust"));
    b.setRing("girth.underbust", r1(bust * underbustOran), contract::kNoValue);
    b.setRing("girth.waist", waist, G("arkaPay.waist"));
    b.setRing("girth.highHip", G("girth.highHip"), contract::kNoValue);
    b.setRing("girth.hip", hip, G("arkaPay.hip"));
    b.setRing("girth.biceps", G("girth.biceps"), contract::kNoValue);
    b.setRing("girth.elbow", contract::kNoValue, contract::kNoValue);
    b.setRing("girth.wrist", G("girth.wrist"), contract::kNoValue);
    b.setRing("girth.armhole", contract::kNoValue, contract::kNoValue);
    b.setRing("girth.knee", contract::kNoValue, contract::kNoValue);

    b.set("landmark.nape", 0.0, -napeDrop);
    b.set("landmark.neckBase", r1(neckHalf), 0.0);
    b.set("landmark.neckFront", 0.0, r1(neckHalf * gradeConst("neckFrontOverHalfNeck")));
    b.set("landmark.shoulderTip", r1(tipX), r1(tipY));
    // Gercek bedenin ON IZDUSUMU: x = kesit yari genisligi (ANSUR II breadthOverGirth x cevre/2),
    // cevre/4 (tup yasasi) DEGIL — o flat'in (croquis) genisligidir (F1 hakem tur 3 kusur 1).
    b.set("landmark.underarm", r1(b.ringHalfWidth("girth.upperBust")), r1(underarmY));
    b.set("landmark.bustApex", r1(apexX), r1(apexY));
    b.set("landmark.bustLine", r1(b.ringHalfWidth("girth.bust")), r1(apexY));
    b.set("landmark.underbust", r1(b.ringHalfWidth("girth.underbust")), r1(r1(apexY) + gradeConst("underbustApexDropMM")));
    b.set("landmark.waist", r1(b.ringHalfWidth("girth.waist")), r1(waistY));
    b.set("landmark.highHip", r1(b.ringHalfWidth("girth.highHip")), r1(waistY + gradeConst("length.waistToHighHip")));
    b.set("landmark.hip", r1(b.ringHalfWidth("girth.hip")), r1(hipY));
    b.set("landmark.crotch", 0.0, r1(waistY + G("length.bodyRise")));
    b.set("landmark.knee", 0.0, r1(waistY + G("length.waistToKnee")));
    b.set("landmark.ankle", 0.0, r1(waistY + G("length.waistToFloor") - gradeConst("ankleFloor")));
    // Kol sarkik: eksen omuz ucundan duz asagi (x = shoulderTip.x). Omuz ucu gogus yarimindan
    // genis oldugu icin (ANSUR II biacromial/2 179 > chestbreadth/2 125) kol govdenin disinda
    // kalir; eski 'koltukalti yarimi + biceps/2pi' (253.0) tup yariminin artefaktiydi (F1 tur 3).
    const double armX = r1(tipX);
    b.set("landmark.elbow", armX, r1(r1(tipY) + r1(gradeConst("length.shoulderToElbow_oran") * arm)));
    b.set("landmark.wrist", armX, r1(r1(tipY) + arm));

    for (const auto& c : contract::kBodyGradeCols) {
        const std::string n = c.name;
        if (n.rfind("girth.", 0) == 0 || n.rfind("arkaPay.", 0) == 0) continue;
        b.setScalar(n, c.v[col]);
    }
    b.setScalar("length.napeToShoulderLine", napeDrop);
    b.setScalar("length.waistToHighHip", gradeConst("length.waistToHighHip"));
    b.setScalar("length.waistToAnkle", G("length.waistToFloor") - gradeConst("ankleFloor"));
    b.setScalar("length.shoulderToElbow", r1(gradeConst("length.shoulderToElbow_oran") * arm));
    b.setScalar("length.frontNeckToWaist", contract::kNoValue);
    b.setScalar("width.shoulderToShoulder", r1(2.0 * tipX));
    b.setScalar("width.apexToApex", r1(2.0 * apexX));
    return b;
}

Body Body::croquisOf(const Body& real) {
    Body b; b.id_ = "croquis@" + real.id();
    // Croquis = duz serilmis giysinin bedeni: girth landmark x'leri cevre/4 (tup yasasi, on+arka
    // ust uste), gercek bedenin izdusumu (ringHalfWidth) DEGIL. Omuz cizgisi duz serilince
    // ikiye katlanmaz, o yuzden croquis omuz ucu (sevkPoz 0.875 x gogus yarimi) gogus yariminin
    // icinde kalir — gercek bedende tersi (body_check g).
    const double bustHalf = real.ring("girth.bust") / 4.0;
    const double hipHalf = real.ring("girth.hip") / 4.0;
    const double stretch = croquisOran("dikeyUzatma");
    const double torso = real.landmark("landmark.waist").y * stretch;
    // Yatay oranlarin paydasi omuz ucu x'idir, bust yarimi degil (F1 duzeltme
    // turu): Zoe Hong sablonunun 'tam govde' paydasi kol-dis-kenardan
    // kol-dis-kenara olculmus izdusum genisligidir; tup yarimina (cevre/4)
    // uygulanamaz. croquisOranlar._neden_yeniden_turetildi.
    const double ctip = r1(croquisOran("shoulderTipXOverBustHalf") * bustHalf);
    const double cneck = r1(croquisOran("neckHalfOverShoulderTipX") * ctip);
    const double cslope = croquisOran("shoulderSlopeDeg");
    const double ctipY = r1(std::tan(cslope * kPi / 180.0) * (ctip - cneck));
    const double cApexX = r1(croquisOran("apexXOverShoulderTipX") * ctip);
    const double cApex = r1(croquisOran("apexDropOverTorso") * torso);
    const double cUnder = r1(croquisOran("underarmOverTorso") * torso);
    // Tek genislik yasasi (F1 tur 5): her girth x = cevre/4 x (1 + croquisBolluk); bolluk yalniz belde
    // (sablon/satilan flat bel/gogus 0.812 vs beden 0.786 = %3.3 giysi bollugu). waistHalfOverBustHalf artik bilgi.
    const double cw = r1(real.ring("girth.waist") / 4.0 * (1.0 + croquisBolluk("girth.waist")));
    const double waistY = r1(torso);
    const double hipY = r1(real.landmark("landmark.hip").y * stretch);
    const double napeY = real.landmark("landmark.nape").y;

    b.set("landmark.nape", 0.0, napeY);
    b.set("landmark.neckBase", cneck, 0.0);
    b.set("landmark.neckFront", 0.0, r1(cneck * gradeConst("neckFrontOverHalfNeck")));
    b.set("landmark.shoulderTip", ctip, ctipY);
    b.set("landmark.underarm", bustHalf, cUnder);
    b.set("landmark.bustApex", cApexX, cApex);
    b.set("landmark.bustLine", bustHalf, cApex);
    b.set("landmark.underbust", r1(bustHalf * gradeConst("girth.underbust_oran")), r1(cApex + croquisOran("underbustDropMM")));
    b.set("landmark.waist", cw, waistY);
    b.set("landmark.highHip", real.ring("girth.highHip") / 4.0, r1(waistY + gradeConst("length.waistToHighHip") * stretch));
    b.set("landmark.hip", hipHalf, hipY);
    for (const char* n : {"landmark.crotch", "landmark.knee", "landmark.ankle"}) b.set(n, 0.0, r1(real.landmark(n).y * stretch));
    // Kol: sevkPoz kol acisi (croquisOranlar.kolAcisiDeg = flat-convention sevkPoz.kolAcisiDeg.taban,
    // gen-contract --check esitligi dogrular), yatayin altina; kol boyu gercek ile ayni. Flat'in
    // kolu bu eksende cizilir (cizim_giysi_mi data-kol-aci), croquis kolu onunla ayni yerde durur.
    { const double th = croquisOran("kolAcisiDeg") * kPi / 180.0;
      const double toElbow = real.scalar("length.shoulderToElbow"), arm = real.scalar("length.arm");
      b.set("landmark.elbow", r1(ctip + toElbow * std::cos(th)), r1(ctipY + toElbow * std::sin(th)));
      b.set("landmark.wrist", r1(ctip + arm * std::cos(th)), r1(ctipY + arm * std::sin(th))); }

    for (const auto& n : real.ringNames()) b.setRing(n, real.ring(n), real.ringBackFrac(n));   // halkalar BEDENIN cevresi (bel 660 dahil)
    for (const auto& s : real.sc_) b.setScalar(s.name, s.v);
    b.setScalar("length.shoulder", r1(std::hypot(ctip - cneck, ctipY)));
    b.setScalar("length.bustDepth", r1(std::hypot(cApexX - cneck, cApex)));
    b.setScalar("width.shoulderToShoulder", r1(2.0 * ctip));
    const double cross = croquisOran("crossOverShoulderToShoulder");   // contract, koda gomulu degil
    b.setScalar("width.crossFront", r1(2.0 * ctip * cross));
    b.setScalar("width.crossBack", r1(2.0 * ctip * cross));
    b.setScalar("width.apexToApex", r1(2.0 * cApexX));
    b.setScalar("width.neckBase", r1(2.0 * cneck));
    b.setScalar("angle.shoulderSlope", cslope);
    return b;
}

bool Body::hasLandmark(const std::string& name) const {
    for (const auto& l : lm_) if (l.name == name) return !none(l.x) && !none(l.y);
    return false;
}
BodyPoint Body::landmark(const std::string& name) const {
    for (const auto& l : lm_) if (l.name == name) return {l.x, l.y, 0.0};
    throw std::runtime_error("body: landmark yok: " + name + " (" + id_ + ")");
}
bool Body::hasRing(const std::string& name) const {
    for (const auto& r : rg_) if (r.name == name) return !none(r.girth);
    return false;
}
double Body::ring(const std::string& name) const {
    for (const auto& r : rg_) if (r.name == name) return r.girth;
    throw std::runtime_error("body: halka yok: " + name + " (" + id_ + ")");
}
double Body::ringBackFrac(const std::string& name) const {
    for (const auto& r : rg_) if (r.name == name) return none(r.backFrac) ? 0.5 : r.backFrac;
    throw std::runtime_error("body: halka yok: " + name + " (" + id_ + ")");
}
bool Body::hasScalar(const std::string& name) const {
    for (const auto& s : sc_) if (s.name == name) return !none(s.v);
    return false;
}
double Body::scalar(const std::string& name) const {
    for (const auto& s : sc_) if (s.name == name) return s.v;
    throw std::runtime_error("body: uzunluk/genislik/aci yok: " + name + " (" + id_ + ")");
}

std::string Body::ringOfLandmark(const std::string& lm) {
    static const char* pairs[][2] = {{"landmark.neckBase", "girth.neckBase"}, {"landmark.bustLine", "girth.bust"}, {"landmark.underbust", "girth.underbust"},
        {"landmark.waist", "girth.waist"}, {"landmark.highHip", "girth.highHip"}, {"landmark.hip", "girth.hip"}, {"landmark.elbow", "girth.elbow"},
        {"landmark.wrist", "girth.wrist"}, {"landmark.knee", "girth.knee"}, {"landmark.underarm", "girth.upperBust"}};
    for (const auto& p : pairs) if (lm == p[0]) return p[1];
    return "";
}
std::string Body::landmarkOfRing(const std::string& ring) {
    for (const char* n : {"landmark.neckBase", "landmark.bustLine", "landmark.underbust", "landmark.waist", "landmark.highHip", "landmark.hip", "landmark.elbow", "landmark.wrist", "landmark.knee", "landmark.underarm"})
        if (ringOfLandmark(n) == ring) return n;
    return "";
}

double Body::ringAspect(const std::string& ringName) {
    for (const auto& c : contract::kBodyKesitOran)
        if (std::string(c.name) == ringName) return c.v;
    throw std::runtime_error("body: halkaKesitOran yok: " + ringName);
}

namespace {
bool kesitVal(const char* prefix, const std::string& ring, double& out) {
    const std::string key = std::string(prefix) + ring;
    for (const auto& c : contract::kBodyKesitOran)
        if (key == c.name) { out = c.v; return true; }
    return false;
}
// Superelips |x/a|^n + |z/b|^n = 1 parametrik: x = a sgn(cos t)|cos t|^(2/n), z = b sgn(sin t)|sin t|^(2/n).
double sePow(double c, double e) { return (c < 0 ? -1.0 : 1.0) * std::pow(std::fabs(c), e); }
} // namespace

bool Body::ringHasBreadth(const std::string& ringName) { double v; return kesitVal("breadthOverGirth.", ringName, v); }

// Kesit (contract halkaKesitOran, F1 tur 4):
//  - ANSUR II'li halka: a = breadthOverGirth x cevre/2 (on izdusum yari genisligi = landmark.x),
//    b = depthOverGirth x cevre/2; superelips ustelini ringExponent cevreye gore cozer.
//  - diger halka: elips, a/b = halkaKesitOran, a = P / ramanujan(1, 1/k).
double Body::ringHalfWidth(const std::string& ringName) const {
    if (!hasRing(ringName)) throw std::runtime_error("body: halkanin cevresi yok: " + ringName);
    const double P = ring(ringName);
    double bo;
    if (kesitVal("breadthOverGirth.", ringName, bo)) return bo * P / 2.0;
    const double k = ringAspect(ringName);
    return P / ellipsePerimeterRamanujan(1.0, 1.0 / k);
}
// On lob (F1 tur 5, halkaKesitOran.lobYukseklikMM.<halka>): yoksa 0.
double Body::ringLobHeight(const std::string& ringName) const {
    double h; return kesitVal("lobYukseklikMM.", ringName, h) ? h : 0.0;
}
double Body::ringLobSigma(const std::string& ringName) const {
    if (ringLobHeight(ringName) <= 0) return 0.0;
    double k; if (!kesitVal("lobSigmaOverApexX", "", k)) throw std::runtime_error("body: halkaKesitOran lobSigmaOverApexX yok");
    return k * landmark("landmark.bustApex").x;
}
// Kaburga yari derinligi: lob'lu halkada (D - h)/2, D = 2 x ringHalfDepth (ANSUR chest depth gogus ucuna kadar).
double Body::ringRibHalfDepth(const std::string& ringName) const { return ringHalfDepth(ringName) - ringLobHeight(ringName) / 2.0; }

double Body::ringHalfDepth(const std::string& ringName) const {
    double dg;
    if (kesitVal("depthOverGirth.", ringName, dg)) return dg * ring(ringName) / 2.0;
    return ringHalfWidth(ringName) / ringAspect(ringName);
}

namespace {
struct Sec { double a, b, bf, n, h, sig, ax; };
// Kesit noktasi: superelips kaburga (arka pay ile on/arka derinlik olcekli) + ON yarimda iki Gauss lob
// (merkez +-ax, sigma sig, yukseklik h; sin(t) ile yanlarda sifira iner). h=0 -> eski superelips.
BodyPoint secPoint(const Sec& s, double t) {
    const double sn = std::sin(t);
    const double bz = sn >= 0 ? s.b * (1.0 - s.bf) / 0.5 : s.b * s.bf / 0.5;
    const double x = s.a * sePow(std::cos(t), 2.0 / s.n);
    double z = bz * sePow(sn, 2.0 / s.n);
    if (s.h > 0 && sn > 0) z += s.h * sn * (std::exp(-((x - s.ax) * (x - s.ax)) / (2 * s.sig * s.sig)) + std::exp(-((x + s.ax) * (x + s.ax)) / (2 * s.sig * s.sig)));
    return {x, 0.0, z};
}
// point() ile ayni orneklemede kesit cevresi; body_check (a) da 2000 adimla olcer.
double sectionPerimeter(const Sec& s) {
    const int N = 2000; double per = 0; BodyPoint p0 = secPoint(s, 0);
    for (int k = 1; k <= N; ++k) { BodyPoint p = secPoint(s, 2.0 * kPi * k / N); per += std::hypot(p.x - p0.x, p.z - p0.z); p0 = p; }
    return per;
}
} // namespace

double Body::ringExponent(const std::string& ringName) const {
    if (!ringHasBreadth(ringName)) return 2.0;
    for (const auto& c : expCache_) if (c.first == ringName) return c.second;
    const double P = ring(ringName);
    const double h = ringLobHeight(ringName);
    Sec s{ringHalfWidth(ringName), ringRibHalfDepth(ringName), ringBackFrac(ringName), 2.0, h, ringLobSigma(ringName), h > 0 ? landmark("landmark.bustApex").x : 0.0};
    // n=2 elips cevreyi eksik kapatir (ANSUR: %5-13), n->inf dikdortgen 4(a+b) fazla; arada tek kok (cevre n'de monoton).
    // Lob'lu halkada (gogus) lob cevreye dahil: h=60'ta n 5.43 -> ~4.98 (halkaKesitOran._lob: n<=3 ANSUR sayilariyla olanaksiz).
    double lo = 2.0, hi = 40.0;
    s.n = lo; if (sectionPerimeter(s) > P) hi = lo;               // elips zaten fazla: n=2 kalir (sapma body_check'te gorunur)
    for (int i = 0; i < 60 && hi - lo > 1e-9; ++i) {
        s.n = 0.5 * (lo + hi);
        if (sectionPerimeter(s) < P) lo = s.n; else hi = s.n;
    }
    const double n = 0.5 * (lo + hi);
    expCache_.push_back({ringName, n});
    return n;
}

BodyPoint Body::point(const std::string& ringName, double aciDeg) const {
    const std::string lm = landmarkOfRing(ringName);
    if (lm.empty()) throw std::runtime_error("body: halkanin landmark'i yok: " + ringName);
    const BodyPoint c = landmark(lm);
    // arka yay payi: arka yarim (z<0) derinligi backFrac/0.5, on yarim (1-backFrac)/0.5 ile olceklenir; gogus halkasinda on lob eklenir
    const double h = ringLobHeight(ringName);
    Sec s{ringHalfWidth(ringName), ringRibHalfDepth(ringName), ringBackFrac(ringName), ringExponent(ringName), h, ringLobSigma(ringName), h > 0 ? landmark("landmark.bustApex").x : 0.0};
    BodyPoint p = secPoint(s, aciDeg * kPi / 180.0);
    return {p.x, c.y, p.z};
}

std::vector<std::string> Body::landmarkNames() const {
    std::vector<std::string> out; for (const auto& l : lm_) out.push_back(l.name); return out;
}
std::vector<std::string> Body::ringNames() const {
    std::vector<std::string> out; for (const auto& r : rg_) out.push_back(r.name); return out;
}

} // namespace stitchu
