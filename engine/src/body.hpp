#pragma once
// body.hpp — IKI BEDEN, TEK SOZLESME (HEDEF.md madde 4-5; F1, 2026-09-05).
//
// Bir giysi GRAFI, iki BEDEN, iki CIKTI. Graf kenarlari mm ile degil beden
// LANDMARK'i + oranla tanimlanir; graf gercek bedende degerlenince KALIP,
// croquis bedende degerlenince FLAT cikar. Bu sinif o iki bedenin (ve kalip
// serisi 34-44'un) TEK tipidir: ayni landmark adlari, ayni halka adlari, iki
// ayri deger kumesi. Sayilar contract/body-v1.json'dan uretilen
// body.gen.hpp'den okunur — koda gomulu sayi yok.
//
// Koordinat (contract koordinat blogu ile ayni cumle): x=0 CF/CB, y=0 omuz
// cizgisi (neckBase, SNP hizasi), +y asagi, mm. Landmark x = yari-genislik.
#include <cmath>
#include <string>
#include <vector>

namespace stitchu {

struct BodyPoint { double x = 0, y = 0, z = 0; };

class Body {
public:
    // "gercek36" | "croquis36": contract'taki degerler birebir.
    static Body fromContract(const std::string& id);
    // "EU34".."EU44": gradeTablosu sutunlarindan degerlenen gercek beden
    // (EU36 == fromContract("gercek36"), body_check bunu kanitlar).
    static Body graded(const std::string& size);
    // Gercek bedenden croquis: croquisOranlar ile degerlenir
    // (croquisOf(graded("EU36")) == fromContract("croquis36"), body_check).
    static Body croquisOf(const Body& real);
    static std::vector<std::string> gradeSizes();

    const std::string& id() const { return id_; }
    bool hasLandmark(const std::string& name) const;
    BodyPoint landmark(const std::string& name) const;          // z = 0 (on duzlem)
    bool hasRing(const std::string& name) const;                 // "girth.bust" ...
    double ring(const std::string& name) const;                  // cevre, mm
    double ringBackFrac(const std::string& name) const;          // arka yay payi (0.5 yoksa)
    double scalar(const std::string& name) const;                // "length.arm", "width.crossBack", "angle.shoulderSlope"
    bool hasScalar(const std::string& name) const;
    // Halka uzerinde nokta: halkanin y'sinde, yari-genislik a = ayni adli
    // landmark'in x'i, yari-derinlik b cevreden cozulur (elips cevre formulu).
    // aciDeg 0 = sag yan (+x), 90 = on (+z), 180 = sol, 270 = arka.
    BodyPoint point(const std::string& ringName, double aciDeg) const;
    double ringHalfWidth(const std::string& ringName) const;     // a, mm (3B yari eksen; landmark.x degil)
    double ringHalfDepth(const std::string& ringName) const;     // b, mm
    static double ringAspect(const std::string& ringName);       // a/b, contract halkaKesitOran
    std::vector<std::string> landmarkNames() const;
    std::vector<std::string> ringNames() const;

    // Landmark'in ait oldugu halka adi ("landmark.waist" -> "girth.waist"); yoksa "". Landmark adlari contract/body-v1.json ile ayni: "landmark.<ad>" (karar ajani 4, namespace).
    static std::string ringOfLandmark(const std::string& landmark);
    static std::string landmarkOfRing(const std::string& ring);

private:
    struct LM { std::string name; double x, y; };
    struct RG { std::string name; double girth, backFrac; };
    struct SC { std::string name; double v; };
    std::string id_;
    std::vector<LM> lm_;
    std::vector<RG> rg_;
    std::vector<SC> sc_;
    void set(const std::string& name, double x, double y);
    void setRing(const std::string& name, double g, double bf);
    void setScalar(const std::string& name, double v);
    friend struct BodyBuilder;
};

// Ramanujan elips cevresi (yari eksenler a, b).
double ellipsePerimeterRamanujan(double a, double b);
// Verilen cevre ve yari-genislik a icin yari-derinlik b (bisection).
double ellipseHalfDepthFor(double perimeter, double a);

} // namespace stitchu
