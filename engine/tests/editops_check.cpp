// ⭐ editops_check — op.shorten / op.sleeveExtend / op.neckDeepen'in KENDI
// kapilari (F7-edit, K35 konvansiyonu: `op.X -> X_check`). Tek binary, uc
// add_test: argv[1] hangi operatorun yargilanacagini secer, boylece her
// operatorun kapisi KENDI adini tasir ve extend_check'in dersi korunur: hicbir
// sayi operatorun kendi raporundan geri okunmaz, hepsi CIZILEN komutlardan iki
// kez (edit kapali / acik) yeniden turetilir ve karsilastirilir.
//
//   shorten_check      "2 cm kisalt" — tam o mm iner, komsu dikisler kendi
//                      dogrultusunda kirpilir, etek agzi DARALIR (A-line'da
//                      kacinilmaz sonuc), bolge disi bayt-ayni, negatif ve
//                      olculen-siniri-asan istek ADIYLA reddedilir.
//   sleeveExtend_check "kolu 2 cm uzat" — kol agzi grain'de iner, govde/etek
//                      bayt-ayni, kolsuz kalipta ret bir CEVAPTIR.
//   neckDeepen_check   "yakayi 2 cm derinlestir" — CF yaka noktasi tam o mm
//                      iner, omuz ucu KIMILDAMAZ, bias serit OLCULEN yeni yay
//                      kadar uzar, yakali (collar/facing) kalipta ret ADIYLA.
#include <cmath>
#include <cstdio>
#include <cstring>
#include <string>
#include <vector>

#include "garment.hpp"
#include "measurements.hpp"
#include "patternedit.hpp"
#include "sizechart.hpp"

using namespace stitchu;

namespace {

int checks = 0, failures = 0;
void ok() { ++checks; }
void fail(const std::string& why) {
    ++checks;
    ++failures;
    std::printf("  [FAIL] %s\n", why.c_str());
}

GarmentSpec baseSpec() {
    GarmentSpec s;
    s.garment = GarmentType::Dress;
    s.shaping = Shaping::Dart;
    s.waistline = Waistline::Natural;
    s.fabric = Fabric::Woven;
    s.neckline = Neckline::Crew;
    s.sleeveStyle = SleeveStyle::Straight;
    s.sleeveLength = SleeveLength::Long;
    s.skirtStyle = SkirtStyle::ALine;
    s.skirtLength = SkirtLength::Midi;
    s.topLength = TopLength::Hip;
    return s;
}

const PatternPiece* byName(const DraftedPattern& p, const std::string& n) {
    for (const auto& pc : p.pieces)
        if (pc.name == n) return &pc;
    return nullptr;
}

bool sameCmd(const PathCommand& a, const PathCommand& b) {
    return a.type == b.type && a.to.x == b.to.x && a.to.y == b.to.y &&
           a.cp1.x == b.cp1.x && a.cp1.y == b.cp1.y && a.cp2.x == b.cp2.x && a.cp2.y == b.cp2.y;
}

bool samePiece(const PatternPiece& a, const PatternPiece& b) {
    if (a.commands.size() != b.commands.size()) return false;
    for (size_t k = 0; k < a.commands.size(); ++k)
        if (!sameCmd(a.commands[k], b.commands[k])) return false;
    return true;
}

// Butun parcalar komut komut ayni mi (RULES 4 / ret sonrasi dokunulmamislik).
bool samePattern(const DraftedPattern& a, const DraftedPattern& b) {
    if (a.pieces.size() != b.pieces.size()) return false;
    for (size_t i = 0; i < a.pieces.size(); ++i) {
        if (a.pieces[i].name != b.pieces[i].name) return false;
        if (!samePiece(a.pieces[i], b.pieces[i])) return false;
    }
    return true;
}

double edgeLen(Point from, const PathCommand& c) {
    std::vector<PathCommand> path;
    PathCommand mv = PathCommand::move(from);
    path.push_back(mv);
    path.push_back(c);
    return pathLength(path);
}

// ---- op.shorten ------------------------------------------------------------
int checkShorten(const BodyMeasurementsSnapshot& m) {
    std::printf("shorten_check: op.shorten — 2 cm kisalt, ve SADECE o mm indi\n");
    const double MM = 20.0;
    const DraftedPattern off = GarmentDrafter::draft(baseSpec(), m);
    GarmentSpec e = baseSpec();
    e.editShortenMM = MM;
    const DraftedPattern on = GarmentDrafter::draft(e, m);

    if (on.pieces.size() != off.pieces.size())
        fail("op.shorten parca SAYISINI degistirdi");
    else ok();

    const char* hosts[] = {"Skirt Front", "Skirt Back"};
    for (const char* h : hosts) {
        const PatternPiece* a = byName(off, h);
        const PatternPiece* b = byName(on, h);
        if (!a || !b) { fail(std::string(h) + ": iki okumadan birinde yok"); continue; }
        const Rect ra = boundingBox(a->commands), rb = boundingBox(b->commands);
        if (std::fabs((ra.height - rb.height) - MM) > 1e-9)
            fail(std::string(h) + ": " + std::to_string(MM) + " mm istendi, cizilen parca " +
                 std::to_string(ra.height - rb.height) + " mm indi");
        else ok();
        if (b->commands.size() != a->commands.size())
            fail(std::string(h) + ": kisaltma komut sayisini degistirdi (kirpma ekleme degildir)");
        else ok();
        const int hi = hemCommandIndex(*a);
        // Etek ucundan onceki komsu haric ONCEKI her komut ve etek ucundan
        // SONRAKI her komut bayt-ayni (bolge disi dokunulmamislik, komut komut).
        bool clean = true;
        for (size_t k = 0; k < a->commands.size(); ++k) {
            if (static_cast<int>(k) == hi || static_cast<int>(k) == hi - 1) continue;
            if (!sameCmd(a->commands[k], b->commands[k])) clean = false;
        }
        if (!clean) fail(std::string(h) + ": etek ucu ve komsusu DISINDA bir komut oynadi");
        else ok();
        // A-line'da etek agzi DARALMALI: kirpma dikisin kendi dogrultusunda.
        if (!(rb.width < ra.width))
            fail(std::string(h) + ": kisaltmada A-line etek agzi daralmadi (" +
                 std::to_string(ra.width) + " -> " + std::to_string(rb.width) + ")");
        else ok();
    }
    // Kol ev sahibi degil: bayt-ayni.
    {
        const PatternPiece* a = byName(off, "Sleeve");
        const PatternPiece* b = byName(on, "Sleeve");
        if (!a || !b || !samePiece(*a, *b)) fail("Sleeve (bolge disi) bayt-ayni degil");
        else ok();
    }
    // Retler: negatif ve olculen siniri asan istek — kalip DOKUNULMAMIS kalir
    // ve program raporu operatorun adiyla ret tasir.
    for (double bad : {-5.0, 5000.0}) {
        GarmentSpec r = baseSpec();
        r.editShortenMM = bad;
        const DraftedPattern rp = GarmentDrafter::draft(r, m);
        if (!samePattern(rp, off))
            fail("reddedilmesi gereken kisaltma (" + std::to_string(bad) + " mm) kalibi OYNATTI");
        else ok();
        if (rp.editProgramJSON.find("op.shorten") == std::string::npos ||
            rp.editProgramJSON.find("\"uygulandi\": false") == std::string::npos)
            fail("ret (" + std::to_string(bad) + " mm) program raporunda ADIYLA durmuyor");
        else ok();
    }
    return failures;
}

// ---- op.sleeveExtend -------------------------------------------------------
int checkSleeveExtend(const BodyMeasurementsSnapshot& m) {
    std::printf("sleeveExtend_check: op.sleeveExtend — kolu 2 cm uzat\n");
    const double MM = 20.0;
    const DraftedPattern off = GarmentDrafter::draft(baseSpec(), m);
    GarmentSpec e = baseSpec();
    e.editSleeveExtendMM = MM;
    const DraftedPattern on = GarmentDrafter::draft(e, m);

    const PatternPiece* a = byName(off, "Sleeve");
    const PatternPiece* b = byName(on, "Sleeve");
    if (!a || !b) { fail("Sleeve iki okumadan birinde yok"); return failures; }
    const Rect ra = boundingBox(a->commands), rb = boundingBox(b->commands);
    if (std::fabs((rb.height - ra.height) - MM) > 1e-9)
        fail("kol " + std::to_string(MM) + " mm istendi, " +
             std::to_string(rb.height - ra.height) + " mm uzadi");
    else ok();
    if (b->commands.size() != a->commands.size() + 2)
        fail("op.sleeveExtend tam IKI dikey parca eklemedi");
    else ok();
    // Govde ve etek bayt-ayni.
    for (const char* h : {"Bodice Front", "Bodice Back", "Skirt Front", "Skirt Back"}) {
        const PatternPiece* x = byName(off, h);
        const PatternPiece* y = byName(on, h);
        if (!x || !y || !samePiece(*x, *y)) fail(std::string(h) + " (bolge disi) bayt-ayni degil");
        else ok();
    }
    // Kolsuz kalip: ret bir cevaptir, kalip dokunulmamis kalir.
    {
        GarmentSpec s = baseSpec();
        s.sleeveStyle = SleeveStyle::None;
        const DraftedPattern noff = GarmentDrafter::draft(s, m);
        s.editSleeveExtendMM = MM;
        const DraftedPattern non = GarmentDrafter::draft(s, m);
        if (!samePattern(non, noff)) fail("kolsuz kalipta ret kalibi OYNATTI");
        else ok();
        if (non.editProgramJSON.find("op.sleeveExtend") == std::string::npos ||
            non.editProgramJSON.find("kol YOK") == std::string::npos)
            fail("kolsuz ret, kullaniciya sonraki adimiyla ADIYLA soylenmiyor");
        else ok();
    }
    return failures;
}

// ---- op.neckDeepen ---------------------------------------------------------
int checkNeckDeepen(const BodyMeasurementsSnapshot& m) {
    std::printf("neckDeepen_check: op.neckDeepen — yakayi 2 cm derinlestir\n");
    const double MM = 20.0;
    const DraftedPattern off = GarmentDrafter::draft(baseSpec(), m);
    GarmentSpec e = baseSpec();
    e.editNeckDeepenMM = MM;
    const DraftedPattern on = GarmentDrafter::draft(e, m);

    const PatternPiece* a = byName(off, "Bodice Front");
    const PatternPiece* b = byName(on, "Bodice Front");
    if (!a || !b) { fail("Bodice Front iki okumadan birinde yok"); return failures; }
    if (a->commands.empty() || b->commands.empty() ||
        a->commands[0].type != CmdType::Move || b->commands[0].type != CmdType::Move) {
        fail("kontur MOVE ile baslamiyor");
        return failures;
    }
    // CF yaka noktasi TAM mm indi, x'i kimildamadi.
    if (std::fabs((b->commands[0].to.y - a->commands[0].to.y) - MM) > 1e-9 ||
        std::fabs(b->commands[0].to.x - a->commands[0].to.x) > 1e-9)
        fail("CF yaka noktasi (" + std::to_string(MM) + " mm istendi) " +
             std::to_string(b->commands[0].to.y - a->commands[0].to.y) + " mm indi");
    else ok();
    // Omuz ucu (yaka egrisinin obur ucu) HIC kimildamadi.
    if (!(std::fabs(b->commands[1].to.x - a->commands[1].to.x) < 1e-9 &&
          std::fabs(b->commands[1].to.y - a->commands[1].to.y) < 1e-9))
        fail("omuz ucu kimildadi — derinlestirme omuza tasti");
    else ok();
    // Yaka egrisi + CF kenari DISINDA her komut bayt-ayni.
    {
        bool clean = a->commands.size() == b->commands.size();
        int L = -1;
        for (int i = static_cast<int>(a->commands.size()) - 1; i >= 1; --i)
            if (a->commands[i].type != CmdType::Close) { L = i; break; }
        for (size_t k = 2; clean && k < a->commands.size(); ++k) {
            if (static_cast<int>(k) == L) continue;
            if (!sameCmd(a->commands[k], b->commands[k])) clean = false;
        }
        if (!clean) fail("yaka egrisi ve CF kenari DISINDA bir komut oynadi");
        else ok();
    }
    // Etek + kol bayt-ayni (bolge disi).
    for (const char* h : {"Skirt Front", "Skirt Back", "Sleeve"}) {
        const PatternPiece* x = byName(off, h);
        const PatternPiece* y = byName(on, h);
        if (!x || !y || !samePiece(*x, *y)) fail(std::string(h) + " (bolge disi) bayt-ayni degil");
        else ok();
    }
    // Bias serit OLCULEN yeni yay kadar uzadi: delta(serit) == 2 * delta(yarim yay)
    // (on govde kumas katinda cizilir). Iki olcum iki ayri konturda.
    {
        const PatternPiece* sa = byName(off, "Bias binding (neckline)");
        const PatternPiece* sb = byName(on, "Bias binding (neckline)");
        if (!sa || !sb) fail("bias yaka seridi iki okumadan birinde yok");
        else {
            const double arcA = edgeLen(a->commands[0].to, a->commands[1]);
            const double arcB = edgeLen(b->commands[0].to, b->commands[1]);
            const double stripA = boundingBox(sa->commands).width;
            const double stripB = boundingBox(sb->commands).width;
            if (std::fabs((stripB - stripA) - 2.0 * (arcB - arcA)) > 1e-6)
                fail("bias serit " + std::to_string(stripB - stripA) +
                     " mm uzadi, olculen yay farki 2x" + std::to_string(arcB - arcA) + " mm");
            else ok();
            if (sb->cutInstruction.find("op.neckDeepen") == std::string::npos)
                fail("seridin kesim notu uzatildigini SOYLEMIYOR (kesim masasinda sessiz yalan)");
            else ok();
        }
    }
    // Yakali kalip: ret ADIYLA, kalip dokunulmamis.
    {
        GarmentSpec s = baseSpec();
        s.collarType = 4;  // CollarType::PeterPan (collar.hpp:48; spec alanı int taşır)
        const DraftedPattern coff = GarmentDrafter::draft(s, m);
        s.editNeckDeepenMM = MM;
        const DraftedPattern con = GarmentDrafter::draft(s, m);
        if (!samePattern(con, coff)) fail("yakali kalipta ret kalibi OYNATTI");
        else ok();
        if (con.editProgramJSON.find("op.neckDeepen") == std::string::npos ||
            con.editProgramJSON.find("\"uygulandi\": false") == std::string::npos)
            fail("yakali ret program raporunda ADIYLA durmuyor");
        else ok();
    }
    return failures;
}

}  // namespace

int main(int argc, char** argv) {
    const SizeChartEntry* eu38 = euSize("EU38");
    if (!eu38) { std::printf("  [FAIL] size chart has no EU38\n"); return 1; }
    const BodyMeasurementsSnapshot m = eu38->body;
    const char* which = argc > 1 ? argv[1] : "";
    if (std::strcmp(which, "shorten") == 0) checkShorten(m);
    else if (std::strcmp(which, "sleeveExtend") == 0) checkSleeveExtend(m);
    else if (std::strcmp(which, "neckDeepen") == 0) checkNeckDeepen(m);
    else { std::printf("kullanim: editops_check <shorten|sleeveExtend|neckDeepen>\n"); return 2; }
    std::printf("  %d yargi, %d KIRMIZI\n", checks, failures);
    return failures ? 1 : 0;
}
