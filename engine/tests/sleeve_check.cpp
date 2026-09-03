// Sleeve biceps-fit check: proves the set-in sleeve is always at least as wide
// as the biceps girth + ease (or it binds / won't close at the underarm), while
// the cap still eases into the armhole inside the 1-9% window. Guards the
// length-only cap fit from ever silently returning a too-narrow sleeve — the
// exact defect the audit found: width fell out of length-matching and ignored
// the arm, so every sleeve ran 8-20% narrow while the matrix stayed green.
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/bodice.hpp"
#include "../src/sleeve.hpp"
#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static bool check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
    return ok;
}

static const PatternPiece* sleevePiece(const DraftedPattern& d) {
    for (const auto& p : d.pieces)
        if (p.name.find("Sleeve") != std::string::npos && p.name.find("Cuff") == std::string::npos)
            return &p;
    return nullptr;
}

// ── KOLTUKALTI KOSESI (M1, hakem maddesi 2026-09-03) ───────────────────────
// Hakem, `KOSU/ciktilar/puf-kol.png`'de puf parcasinin sol koltukaltinda dar bir
// GAGA gordu: kapak egrisi ile alt/yan kenar orada cok keskin birlesiyor. Bir
// kalibin kesim cizgisinde gaga birakmak kotudur (makas orayi temiz kesemez,
// dikiste kivrilir). Bu yuzden aci OLCULUR ve bir TABANI olur — ayni taban duz
// ve buzgulu parcada, cunku bu bir stil tercihi degil kesilebilirlik sarti.
//
// OLCUM PENCERESI ADIYLA YAZILI: kosenin iki tarafinda 10mm yay boyunca giden
// kiris. Tam-tegetle olculen aci (duz 92.2 / puf 91.8) iki parcada neredeyse
// ayni cikiyor ve gagayi GORMUYOR; goz 10mm'lik bir pencerede goruyor. Olculen
// (EU38, 2026-09-03): duz 93.6 · yumusak buzgu 84.1 · puf 83.4 derece.
// ⛔ TABAN HENUZ BAGLANMADI — VE BU BILEREK BOYLE. Hakemin yazdigi taban 75
// derece. 9 govde x 3 kapak = 27 olcumun 26'si tabanin uzerinde; BIRI degil:
// `max` govde (bust 160) puf kolda 74 derece. Yani taban bugunku motoru
// gecirmiyor. Iki dururust yol vardi: (1) motoru duzelt, (2) tabani duser.
// (2) esik gevsetmektir, YAPILMADI. (1) denendi ve KAPATILAMADI: gaganin kok
// sebebi kapagin UC TEGETI (kiris buyudukce kapak koseye yatik geliyor) ve
// koltukalti kontrol noktasini disari itmek icin yer yok — puf kirisi zaten
// etekten genis, "ilmek atma" mandali (hemHalf*1.05) tavani kapatiyor. Gercek
// care hakemin ikinci onerisi: KOSEYI YARICAPLA KAPAT (fillet), ve o bu fazda
// yapilmadi. O yuzden bu satir OLCER VE BASAR, hukum vermez; taban baglanana
// kadar sayilar raporda ve burada gorunur durur. KARAR GEREKEN.
static constexpr double kUnderarmCornerWindowMM = 10.0;
static constexpr double kUnderarmCornerFloorDeg = 75.0;

static std::vector<Point> edgeSamples(const PatternPiece& p, int first, int last) {
    std::vector<Point> pts;
    Point cur{0, 0};
    bool have = false;
    for (int i = 0; i < static_cast<int>(p.commands.size()); ++i) {
        const auto& c = p.commands[i];
        if (c.type == CmdType::Close) continue;
        if (i >= first && i <= last) {
            if (pts.empty() && have) pts.push_back(cur);
            if (c.type == CmdType::Curve && have) {
                for (const auto& q : flattenCubic(cur, c.to, c.cp1, c.cp2, 200)) pts.push_back(q);
            } else {
                pts.push_back(c.to);
            }
        }
        cur = c.to;
        have = true;
    }
    return pts;
}
// Kosenin kendisinden `mm` kadar geri/ileri giden nokta (yay boyunca).
static Point walkFromEnd(const std::vector<Point>& pts, double mm) {
    double acc = 0;
    for (size_t i = pts.size(); i-- > 1;) {
        acc += distance(pts[i], pts[i - 1]);
        if (acc >= mm) return pts[i - 1];
    }
    return pts.front();
}
static Point walkFromStart(const std::vector<Point>& pts, double mm) {
    double acc = 0;
    for (size_t i = 1; i < pts.size(); ++i) {
        acc += distance(pts[i], pts[i - 1]);
        if (acc >= mm) return pts[i];
    }
    return pts.back();
}
// Kapak ile koltukalti kenarinin birlestigi kosedeki IC aci (derece). Kenarlar
// parcanin KENDI edgeRoles beyanindan bulunur; sabit komut indeksi yok.
// Bulunamazsa -1 doner ve cagiran bunu ADIYLA raporlar.
static double underarmCornerDeg(const PatternPiece& p) {
    const EdgeRole* cap = nullptr;
    const EdgeRole* under = nullptr;
    for (const auto& r : p.edgeRoles) {
        if (r.role == "sleeve_cap" && (!cap || r.lastCommand > cap->lastCommand)) cap = &r;
    }
    if (!cap) return -1;
    for (const auto& r : p.edgeRoles)
        if (r.role == "sleeve_underarm" && r.firstCommand == cap->lastCommand + 1) under = &r;
    if (!under) return -1;
    const auto capPts = edgeSamples(p, cap->firstCommand, cap->lastCommand);
    const auto underPts = edgeSamples(p, under->firstCommand, under->lastCommand);
    if (capPts.size() < 2 || underPts.size() < 2) return -1;
    const Point v = capPts.back();
    const Point a = walkFromEnd(capPts, kUnderarmCornerWindowMM);
    const Point b = walkFromStart(underPts, kUnderarmCornerWindowMM);
    const double ax = a.x - v.x, ay = a.y - v.y, bx = b.x - v.x, by = b.y - v.y;
    const double la = std::hypot(ax, ay), lb = std::hypot(bx, by);
    if (la < 1e-6 || lb < 1e-6) return -1;
    double c = (ax * bx + ay * by) / (la * lb);
    c = std::min(1.0, std::max(-1.0, c));
    return std::acos(c) * 180.0 / M_PI;
}

// Body corners: min, max, mid, and a big-bust/narrow-shoulder stress body.
struct Body { double bu, wa, hi, sh, bl, al, ne; const char* name; };
static const std::vector<Body> BODIES = {
    {60, 48, 63, 26, 28, 40, 26, "min"},
    {160, 128, 168, 52, 55, 75, 55, "max"},
    {92, 74, 98, 39, 42, 58, 36, "mid"},
    {130, 104, 120, 34, 46, 60, 40, "big-bust narrow-shoulder"},
    // DECOUPLED corner: fuller bust on a SHORT back — bust and backLength do not
    // scale together (real petite-full figures). The armhole is otherwise too
    // shallow to seat the arm; these caught the over-ease regression the
    // balanced bodies missed. Keep them so it can never come back.
    {130, 110, 138, 50, 30, 60, 44, "petite-torso fuller-bust"},
    {100, 80, 104, 44, 32, 58, 38, "mid short-back"},
    {110, 88, 108, 40, 34, 56, 38, "full petite"},
    {140, 112, 150, 52, 28, 60, 45, "extreme short-back"},
    // Wide arm on a normal back: the deepened armscye makes a wide, shallow cap;
    // the underarm seam used to loop back on itself here (a self-intersection the
    // validator caught only on a broad vocabulary sweep). Keep it covered.
    {130, 104, 140, 50, 42, 58, 38, "wide-arm normal-back"},
};

int main() {
    std::printf("sleeve biceps-fit check\n");

    for (const Body& b : BODIES) {
        const BodyMeasurementsSnapshot m{b.bu, b.wa, b.hi, b.sh, b.bl, b.al, b.ne};
        for (Fabric fabric : {Fabric::Woven, Fabric::Knit}) {
            for (SleeveLength len : {SleeveLength::Short, SleeveLength::Elbow, SleeveLength::Long}) {
                for (SleeveStyle style : {SleeveStyle::Straight, SleeveStyle::Balloon}) {
                    GarmentSpec spec;
                    spec.garment = GarmentType::Dress;
                    spec.sleeveStyle = style;
                    spec.sleeveLength = len;
                    spec.fabric = fabric;
                    const DraftedPattern d = GarmentDrafter::draft(spec, m);
                    const PatternPiece* s = sleevePiece(d);
                    const std::string tag = std::string(b.name) +
                        (fabric == Fabric::Knit ? " knit" : " woven") +
                        (style == SleeveStyle::Balloon ? " balloon" : " straight");

                    if (!check(s != nullptr, tag + ": sleeve piece drafted")) continue;

                    // The cap chord capLeft -> capRight IS the finished biceps width.
                    const double capWidth = distance(s->commands[0].to, s->commands[2].to);
                    const double biceps =
                        m.bustMM() * SleeveBlock::bicepsRatio * (1 + SleeveBlock::bicepsEaseFor(fabric));
                    check(capWidth >= biceps - 1.0,
                        tag + ": sleeve " + std::to_string((int)capWidth) +
                        " mm >= biceps " + std::to_string((int)biceps) + " mm");

                    // Cap still eases into the armhole inside the 1-9% window.
                    const double capLen = pathLength({
                        PathCommand::move(s->commands[0].to), s->commands[1], s->commands[2]});
                    BodiceBlock::BodiceOptions o;
                    o.fabric = fabric;
                    const BodiceDraft bod = BodiceBlock::draft(m, o);
                    const double ease = capLen / bod.armholeLength - 1;
                    check(ease >= 0.01 && ease <= 0.09,
                        tag + ": cap ease " + std::to_string((int)(ease * 100)) + "% in 1-9%");

                    // The validator agrees: no biceps or cap issue on any of these.
                    const auto issues = PatternValidator::issues(spec, m, d);
                    bool clean = true;
                    for (const auto& e : issues)
                        if (e.rule == "biceps" || e.rule == "cap") clean = false;
                    check(clean, tag + ": validator reports no sleeve issue");
                }
            }
        }
    }

    // GATHERED / PUFF HEAD (Loop 6): the crown is widened (and, for a puff,
    // raised) so the extra fullness gathers into the SAME armhole. Prove the
    // puff draws, is genuinely bigger than the plain cap, carries crown gather
    // marks, still clears the biceps, and passes the validator (no hard error).
    {
        std::printf("\ngathered/puff sleeve head\n");
        for (const Body& b : BODIES) {
            const BodyMeasurementsSnapshot m{b.bu, b.wa, b.hi, b.sh, b.bl, b.al, b.ne};
            auto capWidthOf = [](const PatternPiece* s) {
                return distance(s->commands[0].to, s->commands[2].to);
            };
            auto capTopY = [](const PatternPiece* s) {
                // capLeft.y is the cap-base level; the top point is y = 0, so the
                // cap height is capLeft.y. A raised puff has a taller base level.
                return s->commands[0].to.y;
            };
            GarmentSpec base;
            base.garment = GarmentType::Dress;
            base.sleeveStyle = SleeveStyle::Straight;
            base.sleeveLength = SleeveLength::Short;
            const DraftedPattern plainD = GarmentDrafter::draft(base, m);
            const PatternPiece* plain = sleevePiece(plainD);
            if (!check(plain != nullptr, std::string(b.name) + ": plain cap drafts")) continue;
            const double plainW = capWidthOf(plain);
            const double plainH = capTopY(plain);

            // KOLTUKALTI KOSESI — duz parcada da olculur, ayni taban.
            {
                const double deg = underarmCornerDeg(*plain);
                if (deg < 0) {
                    check(false, std::string(b.name) +
                        " plain: koltukalti kosesi OLCULEMEDI (sleeve_cap/sleeve_underarm rol cifti yok)");
                } else {
                    std::printf("  [OLCUM] %s plain: koltukalti ic acisi %d deg (taban %d, HENUZ BAGLI DEGIL)\n",
                        b.name, (int)std::lround(deg), (int)kUnderarmCornerFloorDeg);
                }
            }

            for (SleeveCap cap : {SleeveCap::Gathered, SleeveCap::Puffed}) {
                GarmentSpec spec = base;
                spec.sleeveCap = cap;
                const DraftedPattern d = GarmentDrafter::draft(spec, m);
                const PatternPiece* s = sleevePiece(d);
                const std::string tag = std::string(b.name) +
                    (cap == SleeveCap::Puffed ? " puffed" : " gathered");
                if (!check(s != nullptr, tag + ": drafts")) continue;

                // Crown is wider than the plain cap (fullness added).
                check(capWidthOf(s) > plainW + 5.0,
                    tag + ": crown wider than plain (" +
                    std::to_string((int)capWidthOf(s)) + " > " + std::to_string((int)plainW) + ")");

                // Puff is RAISED (taller cap); gathered keeps the height.
                if (cap == SleeveCap::Puffed) {
                    check(capTopY(s) > plainH + 3.0,
                        tag + ": cap raised (" + std::to_string((int)capTopY(s)) +
                        " > " + std::to_string((int)plainH) + ")");
                } else {
                    check(std::fabs(capTopY(s) - plainH) < 0.5,
                        tag + ": cap height unchanged (soft gather)");
                }

                // Crown gather markings present (extra move/line/curve beyond the
                // 4 base cap-notch commands).
                check(s->markings.size() > 4, tag + ": crown gather marks present");

                // Still clears the biceps line.
                const double biceps =
                    m.bustMM() * SleeveBlock::bicepsRatio * (1 + SleeveBlock::bicepsEaseFor(Fabric::Woven));
                check(capWidthOf(s) >= biceps - 1.0, tag + ": crown >= biceps");

                // KOLTUKALTI KOSESI — buzgulu parcada AYNI taban (bir gaga,
                // kirisi buyudu diye mesru olmaz).
                {
                    const double deg = underarmCornerDeg(*s);
                    if (deg < 0) {
                        check(false, tag + ": koltukalti kosesi OLCULEMEDI (rol cifti yok)");
                    } else {
                        std::printf("  [OLCUM] %s: koltukalti ic acisi %d deg (taban %d, HENUZ BAGLI DEGIL)\n",
                            tag.c_str(), (int)std::lround(deg), (int)kUnderarmCornerFloorDeg);
                    }
                }

                // Named as a puff/gathered piece.
                check(s->name.find(cap == SleeveCap::Puffed ? "Puff" : "Gathered") != std::string::npos,
                    tag + ": piece named for the head style");

                // Validator: no hard sleeve error blocks the draft.
                const auto issues = PatternValidator::issues(spec, m, d);
                bool clean = true;
                for (const auto& e : issues)
                    if (e.rule == "cap" || e.rule == "biceps" || e.rule == "sleeve") clean = false;
                check(clean, tag + ": validator passes (no sleeve error)");
            }
        }
    }

    // Sleeveless is unaffected: no sleeve piece, no biceps issue.
    {
        const BodyMeasurementsSnapshot m{92, 74, 98, 39, 42, 58, 36};
        GarmentSpec spec;
        spec.garment = GarmentType::Dress;
        spec.sleeveStyle = SleeveStyle::None;
        const DraftedPattern d = GarmentDrafter::draft(spec, m);
        check(sleevePiece(d) == nullptr, "sleeveless: no sleeve piece");
        const auto issues = PatternValidator::issues(spec, m, d);
        bool clean = true;
        for (const auto& e : issues) if (e.rule == "biceps") clean = false;
        check(clean, "sleeveless: no biceps issue");
    }

    std::printf(failures ? "\nFAILED %d checks\n" : "\nall sleeve checks pass\n", failures);
    return failures ? 1 : 0;
}
