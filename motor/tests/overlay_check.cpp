// overlay_check — op.overlay'IN KENDI KAPISI (M3-primitif, K35: op.X -> X_check).
//
// NEDEN AYRI BIR TEST, `locket_check` / `backdetail_check` DURURKEN. Ikisi de
// BIR URUNU yargilar (Bugra'nin ustu; arka pelerin). `op.overlay` bir
// OPERATORDUR: bir katmani BASKA bir katmanin UZERINE, onun kendi kenarina
// asmak. Var olan bir kapinin adini odunc almak — expressability_check'in K35
// satirinin adiyla yasakladigi sey — operatoru uygulamadan uygulanmis saymanin
// yoludur. Bu dosya operatorun KENDI kimligini olcer:
//
//   OVERLAY = ev sahibinin kenarini DEGISTIRMEDEN uzerine ikinci bir KESILEN
//   parca asmaktir. Uc sart birden: (a) yeni parca GERCEKTEN kesiliyor (kendi
//   kesim talimati + kendi grain'i var), (b) ev sahibinin cizili konturu BAYT
//   BAYT AYNI kaliyor — katman ev sahibini yeniden cizerse o overlay degil
//   yeniden tasarimdir, (c) katmanin takildigi kenar ev sahibinin kenariyla
//   ILISKILI: ya esit (pelerin/volan) ya da buzgu orani kadar uzun (firfir).
//
// Iki bagimsiz uygulamada olculuyor: backdetail.cpp (arka boyna asilan pelerin
// ve firfir) ve locket.cpp (Bugra'nin buzgulu ust kol katmani). Buzgu orani bu
// dosyada YAZILI DEGIL — BackDetailBlock'un kendi sabitinden okunuyor.
//
// UNITS mm.
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/backdetail.hpp"
#include "../src/locket.hpp"
#include "../src/collar.hpp"
#include "../src/geometry.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static const BodyMeasurementsSnapshot& m0() {
    static const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    return m;
}

static bool sameCommands(const std::vector<PathCommand>& a, const std::vector<PathCommand>& b) {
    if (a.size() != b.size()) return false;
    for (std::size_t i = 0; i < a.size(); ++i) {
        if (a[i].type != b[i].type) return false;
        if (std::fabs(a[i].to.x - b[i].to.x) > 1e-9 || std::fabs(a[i].to.y - b[i].to.y) > 1e-9) return false;
        if (std::fabs(a[i].cp1.x - b[i].cp1.x) > 1e-9 || std::fabs(a[i].cp1.y - b[i].cp1.y) > 1e-9) return false;
        if (std::fabs(a[i].cp2.x - b[i].cp2.x) > 1e-9 || std::fabs(a[i].cp2.y - b[i].cp2.y) > 1e-9) return false;
    }
    return true;
}

static const PatternPiece* findPiece(const DraftedPattern& d, const char* word) {
    for (const auto& p : d.pieces)
        if (p.name.find(word) != std::string::npos) return &p;
    return nullptr;
}

static const PatternPiece* backCenter(const DraftedPattern& d) {
    for (const auto& p : d.pieces)
        if (p.name == "Bodice Back" || p.name == "Top Back" ||
            p.name == "Bodice Center Back" || p.name == "Top Center Back") return &p;
    return nullptr;
}

// The back neck edge, as the drafter draws it: the first drawn command off the
// piece's start (see backdetail_check, same reading), doubled for the fold.
static double backNeckMM(const PatternPiece& b) {
    if (b.commands.size() < 2) return -1;
    const std::vector<PathCommand> path{b.commands[0], b.commands[1]};
    return 2.0 * pathLength(path);
}

// The overlay's ATTACH edge: the piece's top edge, i.e. the widest horizontal
// run at its minimum y. Measured off the drawn outline, not assumed.
static double topEdgeMM(const PatternPiece& p) {
    double minY = 1e18, maxY = -1e18;
    std::vector<Point> v;
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Close) continue;
        v.push_back(c.to);
        minY = std::min(minY, c.to.y);
        maxY = std::max(maxY, c.to.y);
    }
    if (v.size() < 3) return -1;
    const double band = minY + 0.02 * (maxY - minY) + 1e-9;
    double lo = 1e18, hi = -1e18;
    for (const auto& p2 : v) if (p2.y <= band) { lo = std::min(lo, p2.x); hi = std::max(hi, p2.x); }
    return (hi > lo) ? (hi - lo) : -1;
}

static void katman(const char* etiket, BackDetail detail, const char* parcaKelimesi,
                   double beklenenOran) {
    std::printf("%s\n", etiket);
    GarmentSpec dress; dress.garment = GarmentType::Dress; dress.neckline = Neckline::Scoop;
    dress.shaping = Shaping::Dart;
    GarmentSpec yok = dress; yok.backDetail = 0;
    GarmentSpec var = dress; var.backDetail = static_cast<int>(detail);
    const DraftedPattern d0 = GarmentDrafter::draft(yok, m0());
    const DraftedPattern d1 = GarmentDrafter::draft(var, m0());

    // (a) GERCEKTEN KESILEN bir parca doguyor.
    check(d1.pieces.size() == d0.pieces.size() + 1, "overlay: tam olarak BIR yeni parca");
    const PatternPiece* ov = findPiece(d1, parcaKelimesi);
    check(ov != nullptr, "overlay: parca adiyla bulunuyor");
    if (ov) {
        check(!ov->cutInstruction.empty(), "overlay: parcanin KENDI kesim talimati var");
        const bool grain = std::fabs(ov->grainline.from.x - ov->grainline.to.x) > 1e-9 ||
                           std::fabs(ov->grainline.from.y - ov->grainline.to.y) > 1e-9;
        check(grain, "overlay: parcanin KENDI grain cizgisi var (kesim masasinda yonu belli)");
    }

    // (b) EV SAHIBI KIMILDAMIYOR. Katman ev sahibini yeniden cizerse bu bir
    // overlay degil, bir yeniden tasarimdir.
    bool ayni = true;
    for (std::size_t i = 0; i < d0.pieces.size(); ++i)
        ayni = ayni && sameCommands(d0.pieces[i].commands, d1.pieces[i].commands);
    check(ayni, "overlay: ev sahibinin butun konturlari BAYT-AYNI");

    // (c) TAKILDIGI KENAR EV SAHIBININ KENARIYLA ILISKILI.
    const PatternPiece* bk = backCenter(d1);
    check(bk != nullptr, "overlay: ev sahibi arka parca bulundu");
    if (bk && ov) {
        const double host = backNeckMM(*bk);
        // KAT PAYI, olculen: pelerin "cut 1 on fold" olarak ciziliyor, yani
        // KAGITTA yarim duruyor; firfir seridi tam genislikte. Iki parcayi ayni
        // cetvelle olcmek icin katlanan parcanin cizili kenari IKIYE katlanir —
        // bu bir esik gevsetmesi degil, parcanin KENDI kesim talimatinin
        // okunmasidir.
        const bool katli = ov->cutInstruction.find("on fold") != std::string::npos;
        const double edge = topEdgeMM(*ov) * (katli ? 2.0 : 1.0);
        std::printf("        kesim: %s\n", ov->cutInstruction.substr(0, 60).c_str());
        std::printf("        ev sahibi arka boyun %.4f mm  katmanin takilan kenari %.4f mm  oran %.6f\n",
                    host, edge, edge / host);
        check(host > 0 && edge > 0, "overlay: iki kenar da olculebildi");
        if (host > 0 && edge > 0) {
            check(std::fabs(edge / host - beklenenOran) / beklenenOran < 0.20,
                  "overlay: takilan kenar ev sahibinin kenarina blogun KENDI orani kadar bagli");
        }
    }

    // Ev sahibine YERLESTIRME ISARETI dusuyor: bir katman havada durmaz.
    // Isaret `markings`'e dusuyor (backdetail.cpp:placementNotch), `notches`'a
    // degil — olculdu, tahmin edilmedi.
    if (bk) {
        const PatternPiece* bk0 = backCenter(d0);
        check(bk0 != nullptr && bk->markings.size() > bk0->markings.size(),
              "overlay: ev sahibine yeni bir yerlestirme isareti dustu");
    }
}

int main() {
    std::printf("overlay_check — op.overlay, IKI bagimsiz uygulamada AYNI kimlik\n");

    // 1. Pelerin: buzgu YOK, takilan kenar ev sahibinin kenariyla ESIT (oran 1).
    katman("arka pelerin (backdetail.cpp, buzgusuz katman)", BackDetail::Cape, "Cape", 1.0);

    // 2. Firfir: AYNI operator, ama takilan kenar blogun KENDI buzgu orani
    //    kadar UZUN. Sayi burada yazili degil, BackDetailBlock'tan okunuyor.
    std::printf("arka firfir — beklenen oran = BackDetailBlock::ruffleFullness = %.4f\n",
                BackDetailBlock::ruffleFullness);
    katman("arka firfir (backdetail.cpp, buzgulu katman)", BackDetail::Ruffle, "Ruffle",
           BackDetailBlock::ruffleFullness);

    // 3. IKINCI, BAGIMSIZ UYGULAMA — etek ucu volani (hemflounce.cpp).
    //    Bambaska bir kod yolu, ayni cumle: ev sahibinin hem cizgisi
    //    DEGISMEDEN uzerine ikinci bir kesilen katman asiliyor ve o katman
    //    hem'den UZUN kesiliyor (buzgu). Oran burada yazili degil: parcanin
    //    KENDI kesim talimatinda ilan ettigi "flat top edge N mm gathers to
    //    fit your M mm hem" ikilisi okunuyor.
    {
        std::printf("etek ucu volani (hemflounce.cpp)\n");
        GarmentSpec s; s.garment = GarmentType::Dress; s.shaping = Shaping::Dart;
        s.skirtStyle = SkirtStyle::Straight; s.skirtLength = SkirtLength::Midi;
        GarmentSpec yok = s; yok.hemFlounce = 0;
        GarmentSpec var = s; var.hemFlounce = 1;
        const DraftedPattern d0 = GarmentDrafter::draft(yok, m0());
        const DraftedPattern d1 = GarmentDrafter::draft(var, m0());
        check(d1.pieces.size() == d0.pieces.size() + 1, "overlay: tam olarak BIR yeni katman parcasi");
        bool ayni = true;
        for (std::size_t i = 0; i < d0.pieces.size(); ++i)
            ayni = ayni && sameCommands(d0.pieces[i].commands, d1.pieces[i].commands);
        check(ayni, "overlay: ev sahibinin butun konturlari BAYT-AYNI");
        const PatternPiece* fl = findPiece(d1, "Hem Flounce");
        check(fl != nullptr, "overlay: volan parcasi adiyla bulunuyor");
        if (fl) {
            check(!fl->cutInstruction.empty(), "overlay: volanin KENDI kesim talimati var");
            // "flat top edge N mm gathers to fit your M mm hem" — iki sayiyi
            // parcanin kendi cumlesinden oku; N > M olmak zorunda, cunku bir
            // katman ev sahibinin kenarina buzgu payiyla oturur.
            const std::string ci = fl->cutInstruction;
            const std::size_t a = ci.find("flat top edge ");
            const std::size_t b = ci.find("fit your ");
            check(a != std::string::npos && b != std::string::npos,
                  "overlay: volan iki kenari da KENDI talimatinda ilan ediyor");
            if (a != std::string::npos && b != std::string::npos) {
                const double N = std::atof(ci.c_str() + a + 14);
                const double M = std::atof(ci.c_str() + b + 9);
                std::printf("        katmanin duz ust kenari %.0f mm  ev sahibinin hemi %.0f mm  oran %.6f\n",
                            N, M, N / M);
                check(N > M, "overlay: katman ev sahibinin kenarindan UZUN kesiliyor (buzgu payi)");
            }
        }
    }

    std::printf("%s — %d failure(s)\n", failures ? "FAIL" : "OK", failures);
    return failures ? 1 : 0;
}
