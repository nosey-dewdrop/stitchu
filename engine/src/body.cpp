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
    const double bustDepth = G("length.bustDepth");
    const double apexY = std::sqrt(bustDepth * bustDepth - (apexX - neckHalf) * (apexX - neckHalf));
    const double hipY = waistY + G("length.waistToHip");
    const double arm = G("length.arm");
    const double underbustOran = gradeConst("girth.underbust_oran");

    b.set("landmark.nape", 0.0, -napeDrop);
    b.set("landmark.neckBase", r1(neckHalf), 0.0);
    b.set("landmark.neckFront", 0.0, r1(neckHalf * gradeConst("neckFrontOverHalfNeck")));
    b.set("landmark.shoulderTip", r1(tipX), r1(tipY));
    b.set("landmark.underarm", bust / 4.0, r1(underarmY));
    b.set("landmark.bustApex", r1(apexX), r1(apexY));
    b.set("landmark.bustLine", bust / 4.0, r1(apexY));
    b.set("landmark.underbust", r1(bust * underbustOran / 4.0), r1(r1(apexY) + gradeConst("underbustApexDropMM")));
    b.set("landmark.waist", waist / 4.0, r1(waistY));
    b.set("landmark.highHip", G("girth.highHip") / 4.0, r1(waistY + gradeConst("length.waistToHighHip")));
    b.set("landmark.hip", hip / 4.0, r1(hipY));
    b.set("landmark.crotch", 0.0, r1(waistY + G("length.bodyRise")));
    b.set("landmark.knee", 0.0, r1(waistY + G("length.waistToKnee")));
    b.set("landmark.ankle", 0.0, r1(waistY + G("length.waistToFloor") - gradeConst("ankleFloor")));
    // Kol sarkik, govdenin yanina bitisik: eksen x = koltukalti yarimi + ustkol yari kalinligi
    // (girth.biceps / 2pi, daire kesit — contract'ta DOGRULANMADI beyanli). Eski x = shoulderTip.x
    // govdenin icinden geciyordu (F1 hakem kusuru); gercek36 landmark.elbow/wrist kaynak alaninda.
    const double armX = r1(bust / 4.0 + G("girth.biceps") / (2.0 * kPi));
    b.set("landmark.elbow", armX, r1(r1(tipY) + r1(gradeConst("length.shoulderToElbow_oran") * arm)));
    b.set("landmark.wrist", armX, r1(r1(tipY) + arm));

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
    const double bustHalf = real.landmark("landmark.bustLine").x;
    const double hipHalf = real.landmark("landmark.hip").x;
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
    const double cw = r1(croquisOran("waistHalfOverBustHalf") * bustHalf);
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
    b.set("landmark.highHip", real.landmark("landmark.highHip").x, r1(waistY + gradeConst("length.waistToHighHip") * stretch));
    b.set("landmark.hip", hipHalf, hipY);
    for (const char* n : {"landmark.crotch", "landmark.knee", "landmark.ankle"}) b.set(n, 0.0, r1(real.landmark(n).y * stretch));
    // Kol: sevkPoz kol acisi (croquisOranlar.kolAcisiDeg = flat-convention sevkPoz.kolAcisiDeg.taban,
    // gen-contract --check esitligi dogrular), yatayin altina; kol boyu gercek ile ayni. Flat'in
    // kolu bu eksende cizilir (cizim_giysi_mi data-kol-aci), croquis kolu onunla ayni yerde durur.
    { const double th = croquisOran("kolAcisiDeg") * kPi / 180.0;
      const double toElbow = real.scalar("length.shoulderToElbow"), arm = real.scalar("length.arm");
      b.set("landmark.elbow", r1(ctip + toElbow * std::cos(th)), r1(ctipY + toElbow * std::sin(th)));
      b.set("landmark.wrist", r1(ctip + arm * std::cos(th)), r1(ctipY + arm * std::sin(th))); }

    for (const auto& n : real.ringNames()) b.setRing(n, real.ring(n), real.ringBackFrac(n));
    b.setRing("girth.waist", r1(4.0 * cw), real.ringBackFrac("girth.waist"));
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

// Kesit elipsi: cevre = ring, a/b = halkaKesitOran (contract, DOGRULANMADI beyanli).
// landmark.x KULLANILMAZ: o duz-serili yari genislik (cevre/4), 3B yari eksen degil.
double Body::ringHalfWidth(const std::string& ringName) const {
    if (!hasRing(ringName)) throw std::runtime_error("body: halkanin cevresi yok: " + ringName);
    const double P = ring(ringName), k = ringAspect(ringName);
    // ramanujan(a, a/k) a ile dogrusal olcekler: a = P / ramanujan(1, 1/k)
    return P / ellipsePerimeterRamanujan(1.0, 1.0 / k);
}
double Body::ringHalfDepth(const std::string& ringName) const { return ringHalfWidth(ringName) / ringAspect(ringName); }

BodyPoint Body::point(const std::string& ringName, double aciDeg) const {
    const std::string lm = landmarkOfRing(ringName);
    if (lm.empty()) throw std::runtime_error("body: halkanin landmark'i yok: " + ringName);
    const BodyPoint c = landmark(lm);
    const double a = ringHalfWidth(ringName), b = ringHalfDepth(ringName);
    const double t = aciDeg * kPi / 180.0;
    // arka yay payi: arka yarim (z<0) derinligi backFrac/0.5, on yarim (1-backFrac)/0.5 ile olceklenir
    const double bf = ringBackFrac(ringName);
    const double bz = std::sin(t) >= 0 ? b * (1.0 - bf) / 0.5 : b * bf / 0.5;
    return {a * std::cos(t), c.y, bz * std::sin(t)};
}

std::vector<std::string> Body::landmarkNames() const {
    std::vector<std::string> out; for (const auto& l : lm_) out.push_back(l.name); return out;
}
std::vector<std::string> Body::ringNames() const {
    std::vector<std::string> out; for (const auto& r : rg_) out.push_back(r.name); return out;
}

} // namespace stitchu
