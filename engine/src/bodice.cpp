#include "bodice.hpp"

#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <cstdio>
#include <cstdlib>

#include "shoulder.hpp"
#include "validator.hpp"  // kinkAngleDegrees — motorun kendi kink kurali

namespace stitchu {
namespace {

// Boat (bateau) necks are WIDE and shallow — the neckline runs almost straight
// across from shoulder tip to shoulder tip. Sweetheart opens the shoulders a
// little so the heart lobes have width to live in. Both sides widen together so
// the shoulder seams keep matching. ONE definition — the bodice and the facings
// must never disagree on this. (2026-07-17 external audit: the old 1.35 boat
// read like a wide round neck, ~166 mm front opening; a true bateau opens to the
// shoulders ~200-240 mm. Raised to 1.85, still under the shoulder-share clamp.)
double neckWidthMultiplier(Neckline neckline) {
    if (neckline == Neckline::Boat) return 1.85;
    if (neckline == Neckline::Sweetheart) return 1.2;
    // Cowl widens the neck so the drape excess has span to fold across (Aldrich
    // cowl: add width AND depth). Wider than boat, measured not maximal.
    if (neckline == Neckline::Cowl) return 1.4;
    return 1.0;
}

double frontNeckDepth(Neckline neckline, double neckW) {
    switch (neckline) {
        case Neckline::Crew: return neckW + 15;
        case Neckline::Scoop: return neckW + 50;
        case Neckline::VNeck: return neckW + 75;
        case Neckline::Square: return neckW + 40;
        case Neckline::Boat: return 28;
        // neckW already carries the 1.2 width multiplier, so a smaller offset
        // still lands the cleft between scoop and v-neck.
        case Neckline::Sweetheart: return neckW + 50;
        // Plunge below the old shoulder line; the caller adds the strap rise
        // because the halter front frame is shifted down by it.
        case Neckline::Halter: return neckW + 65;
        // Cowl drapes deep: the extra drop is the fabric that falls into folds.
        // Measured (deeper than scoop, shy of a plunge) so it reads as a soft
        // cowl, not a gaping hole.
        case Neckline::Cowl: return neckW + 90;
        // Pussy-bow sits high on the throat (the band + bow live there), so the
        // neckline itself is a shallow crew-depth opening.
        case Neckline::PussyBow: return neckW + 15;
    }
    return neckW + 15;
}

// Neck segment from the center-neck point up to the shoulder-neck point.
std::vector<PathCommand> neckCommands(Neckline neckline, Point centerNeck, Point neckPoint) {
    const double w = neckPoint.x;
    const double d = centerNeck.y;
    switch (neckline) {
        case Neckline::VNeck:
            return {PathCommand::line(neckPoint)};
        case Neckline::Square:
            return {PathCommand::line({w, d}), PathCommand::line(neckPoint)};
        case Neckline::Boat:
            return {PathCommand::curve(neckPoint, {w * 0.5, d}, {w * 0.85, d * 0.5})};
        // Heart shape: the tangent at center front is steep, so the mirrored
        // halves meet in the cleft notch; the curve then arcs convexly over
        // the bust (the lobe) and eases into the shoulder strap.
        case Neckline::Sweetheart:
            return {PathCommand::curve(neckPoint, {w * 0.22, d * 0.48}, {w * 0.5, d * 0.12})};
        // Halter front: the frame is shifted so the strap top edge sits at
        // local y = 0 — the plunge rises from the CF and hugs the strap's
        // inner edge on its way up to the nape.
        case Neckline::Halter:
            return {PathCommand::curve(neckPoint, {w * 0.75, d * 0.5}, {w, d * 0.08})};
        // Cowl: a deep, softly rounded scoop-like drape. The excess depth (from
        // frontNeckDepth) plus the bias grain lets the fabric fall into folds;
        // the seam line itself is a smooth deep curve so the raw drape edge is
        // clean. Rounder/deeper than scoop.
        case Neckline::Cowl:
            return {PathCommand::curve(neckPoint, {w * 0.5, d}, {w * 0.92, d * 0.28})};
        // Pussy-bow neckline is a plain crew-shape opening; the band + bow are
        // separate pieces (post-pass). Same curve as crew/scoop.
        case Neckline::PussyBow:
        case Neckline::Crew:
        case Neckline::Scoop:
            return {PathCommand::curve(neckPoint, {w * 0.55, d}, {w * 0.9, d * 0.35})};
    }
    return {PathCommand::line(neckPoint)};
}

// Length of a neck half from centerNeck to neckPoint, flattening the drafted
// neckline commands exactly as makeFacing does — same samples, same truth.
double halfNeckLength(Neckline neckline, Point centerNeck, Point neckPoint) {
    const auto inner = neckCommands(neckline, centerNeck, neckPoint);
    double len = 0;
    Point current = centerNeck;
    for (const auto& cmd : inner) {
        if (cmd.type == CmdType::Curve) {
            const auto s = flattenCubic(current, cmd.to, cmd.cp1, cmd.cp2, 12);
            for (size_t i = 1; i < s.size(); ++i)
                len += std::hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y);
        } else {
            len += std::hypot(cmd.to.x - current.x, cmd.to.y - current.y);
        }
        current = cmd.to;
    }
    return len;
}

// ── YAKA DELİĞİ BOYUNDAN KISA OLAMAZ (geometrik zorunluluk, v5 §C-c) ────────
// Yaka deliği boynu ÇEVRELEYEN kapalı bir eğridir; boyun o delikten geçmek
// zorunda olduğu için deliğin uzunluğu boyun çevresinden küçük olamaz. Bu bir
// stil tercihi değil, giyilebilirlik şartı.
// ÖLÇÜLDÜ 2026-08-23 (neck-basis-probe + garment_armhole_check K3): sekiz
// bedenin BEŞİNDE delik boyundan KISAydı (-0.35 .. -2.42mm), ve sapan şey
// collar PARÇASI değil DELİĞİN kendisiydi (parça 8 bedende 0.12..0.14mm trued).
// KÖK SEBEP: crew derinliği `neckW + 15` — o 15mm SABİT, boyunla büyümüyor, o
// yüzden delik/boyun oranı bedenle düşüyor (EU34 1.003 -> EU48 0.994).
// DÜZELTME YÖNÜ — GENİŞLİK DEĞİL DERİNLİK: yaka noktası (neckW) aynı zamanda
// omuz dikişinin başlangıcıdır; onu dışarı itmek omuz ucunu, dolayısıyla kol
// oyuğunu taşır. Derinlik CF'de, hiçbir başka kenarı hareket ettirmez. Ölçülen
// bedel sekiz bedende en çok +2.4mm ön derinlik.
double neckClearanceDropMM(Neckline neckline, double neckGirth, double frontNeckW,
                           double frontCutout, double backNeckW, double backCutout) {
    const auto holeFor = [&](double add) {
        return 2.0 * (halfNeckLength(neckline, {0, frontCutout + add}, {frontNeckW, 0}) +
                      halfNeckLength(Neckline::Crew, {0, backCutout}, {backNeckW, 0}));
    };
    if (holeFor(0.0) >= neckGirth) return 0.0;
    double lo = 0.0, hi = 4.0;
    while (hi < 512.0 && holeFor(hi) < neckGirth) hi *= 2.0;
    if (holeFor(hi) < neckGirth) return hi;  // ulaşılamıyorsa kapı K3'te kırmızı görür
    for (int i = 0; i < 48; ++i) {
        const double mid = 0.5 * (lo + hi);
        if (holeFor(mid) < neckGirth) lo = mid; else hi = mid;
    }
    // Aralığın YETEN ucu döner (lo hep kısa, hi hep >= boyun). Orta noktayı
    // dönmek 48 adım sonra bile yuvarlamayla eksi tarafa düşebiliyor (ölçüldü:
    // EU40 -0.00mm). Bu bir pay değil, bisection'ın doğru ucu.
    return hi;
}

struct HalfBodice {
    PatternPiece piece;
    double armholeLength = 0;
    double sideSeam = 0;
    double sewnWaist = 0;
    double straightWaist = 0;
};

// The armhole cubic both piece builders share — ONE definition so the halter
// binding measure can never drift from the drawn geometry, and the princess
// split (splitCubic) can keep assuming a single cubic.
//
// This is a proper scye, not a lazy diagonal (the old control points produced a
// near-straight bulge). The curve leaves the shoulder tip TANGENT-CONTINUOUS
// with the shoulder seam (no angular V-kink at the shoulder point — the old
// cp1 dived straight down while the shoulder seam ran out nearly horizontal, a
// ~77 degree corner the external render-audit flagged as a "spike"), rolls
// smoothly downward, hollows INWARD in the middle (the concave scye), and
// arrives at the underarm near-tangent to the side seam so the underarm is a
// smooth turn. The FRONT scye is scooped deeper than the BACK (anatomy).
// Rendered as a native SVG cubic, so it is perfectly smooth; the control points
// carry both the tangent continuity and the scye hollow.
//   neckPoint — the shoulder-neck point; shoulderTip->this direction reversed is
//               the shoulder seam's incoming tangent, which the curve leaves along.
//   isFront   — deeper hollow on the front piece.
//   sleeveless — cut the shoulder tip in and raise the underarm so a bare
//                shoulder edge sits close to the body instead of gaping.
//   scyeInnerX — YAYINLANMIŞ scye genişlik çizgisi (Aldrich p.11, bodice.hpp
//                scyeBackWidthHalf*/scyeChestWidthHalf*), katlama çizgisinden
//                mutlak x. Oyuğun KARNI bu çizgiye oturur. 0 verilirse çizgi
//                yok sayılır ve eski arc/chord hedefi çalışır (halter gibi
//                kendi çerçevesini kuran stiller).
PathCommand armholeCurveFor(double shoulderHalf, double shoulderDrop,
                            const Point& armholeBottomIn, const Point& neckPoint,
                            bool isFront, bool sleeveless, bool setIn = false,
                            double scyeInnerX = 0.0, double scyeMaxInset = 1e9) {
    Point shoulder{shoulderHalf, shoulderDrop};
    Point armholeBottom = armholeBottomIn;
    if (sleeveless) {
        // Cut the armhole in: pull the shoulder tip toward the neck and raise the
        // underarm point, so the finished (bias-bound) edge hugs the body.
        shoulder.x -= BodiceBlock::sleevelessShoulderCutInMM;
        armholeBottom.y -= BodiceBlock::sleevelessUnderarmRaiseMM;
    }
    const double dx = armholeBottom.x - shoulder.x;   // horizontal span (>0)
    const double dy = armholeBottom.y - shoulder.y;   // vertical drop   (>0)
    const double chord = std::hypot(dx, dy);
    // HOW DEEP the scye hollows is not a free constant any more. The hollow SHARE
    // is only a bisection seed; the drawn curve is SOLVED so its arc/chord equals
    // the ratio MEASURED on the bought Bugra pattern (bodice.hpp armholeArcChord*,
    // 8 sizes, per half). The share alone left the shipped scye at arc/chord 1.01
    // — a straight diagonal wearing the word "scye".
    // cp2 is the only free point: it sits near the underarm, pulled INSIDE the
    // chord (the concave scye belly), rising toward the underarm near-vertically
    // so the turn into the side seam is smooth.
    const double targetArc = chord * (isFront ? BodiceBlock::armholeArcChordFront
                                              : BodiceBlock::armholeArcChordBack);
    // YAYINLANMIŞ İÇ ÇİZGİ (Aldrich p.11) — oyuğun karnının oturacağı x. Omuz
    // ucundan daha içeride olmak ZORUNDA (yayın öyle diyor: büst 88'de arka
    // 172.0mm, omuz ucu 185.0mm); değilse (halter/kesik omuz çerçeveleri) çizgi
    // devre dışı kalır ve eski arc/chord hedefi sürer.
    // ★ OYUK BLOĞUN MALI, STİLİN DEĞİL. Omuz ucunu bilerek dışarı iten stiller
    // (düşük omuz, bateau yaka) sabit vücut çizgisine kadar oyulunca panel
    // kendini kesiyor (ölçüldü 2026-08-23: `[selfintersect] Bodice Side Front`,
    // 2339 draft). Doğru okuma: scye kavisi bloğun bir özelliğidir; omuz ucu
    // dışarı kayınca oyuk ONUNLA BİRLİKTE kayar, daha derin oyulmaz. Bu yüzden
    // karnın omuz ucundan içeri girebileceği mesafe, DOĞAL bloktaki mesafeyle
    // sınırlıdır (scyeMaxInset, draft()'te doğal omuz ucundan hesaplanır).
    const double innerLimit = std::max(scyeInnerX, shoulder.x - scyeMaxInset);
    const bool useWidthLine = scyeInnerX > 0.0 &&
                              innerLimit < shoulder.x - 1.0 &&
                              innerLimit < armholeBottom.x - 1.0;
    // cp1Of(h) lets a branch grow its OWN control arm with the hollow. A cubic
    // kinks when one control arm is long and the other short; the tangent branch
    // uses this to keep the two arms balanced (see below).
    const auto solveHollow = [&](const std::function<Point(double)>& cp1Of,
                                 double cp2Y, double seed) {
        const auto arcFor = [&](double h) {
            const Point c2{armholeBottom.x - dx * 0.06 - h, cp2Y};
            return pathLength({PathCommand::move(shoulder),
                               PathCommand::curve(armholeBottom, cp1Of(h), c2)});
        };
        // KARIN: çizilen eğrinin ulaştığı en küçük x. Kontrol noktası değil,
        // EĞRİNİN kendisi — yayınlanan genişlik çizgisi kalıbın kenarına konur,
        // kontrol poligonuna değil.
        const auto bellyFor = [&](double h) {
            const Point c1 = cp1Of(h);
            const Point c2{armholeBottom.x - dx * 0.06 - h, cp2Y};
            double minX = std::min(shoulder.x, armholeBottom.x);
            for (int i = 0; i <= 200; ++i) {
                const double t = static_cast<double>(i) / 200.0;
                const double mt = 1 - t;
                const double x = mt * mt * mt * shoulder.x + 3 * mt * mt * t * c1.x +
                                 3 * mt * t * t * c2.x + t * t * t * armholeBottom.x;
                minX = std::min(minX, x);
            }
            return minX;
        };
        // KINK: motorun kendi doğrulayıcısının kuralı (validator.hpp
        // kinkAngleDegrees = 25 derece, düzleştirilmiş adım başına). Oyuk
        // yayınlanmış çizgiye kadar açılır AMA çizilen eğri kendi kapımızın
        // kink kuralını ihlal edemez — ihlal eden bir kalıp zaten sevk
        // edilemez. Bu bir gevşetme değil: tavan bizim yayınlanmış İÇ kuralımız,
        // ve bağladığında sonucu K1'de seviye açığı olarak GÖRÜNÜR.
        const auto maxTurnFor = [&](const std::function<Point(double)>& cp1Of,
                                    double cp2Y, double h) {
            const Point c1 = cp1Of(h);
            const Point c2{armholeBottom.x - dx * 0.06 - h, cp2Y};
            const auto samples = flattenCubic(shoulder, armholeBottom, c1, c2, 24);
            double worst = 0.0;
            bool hasPrev = false;
            Point prev{0, 0};
            for (size_t i = 1; i < samples.size(); ++i) {
                const double sx = samples[i].x - samples[i - 1].x;
                const double sy = samples[i].y - samples[i - 1].y;
                if (std::hypot(sx, sy) <= 0.3) continue;
                if (hasPrev) {
                    const double dot = prev.x * sx + prev.y * sy;
                    const double mag = std::hypot(prev.x, prev.y) * std::hypot(sx, sy);
                    if (mag > 0) {
                        const double c = std::min(1.0, std::max(-1.0, dot / mag));
                        worst = std::max(worst, std::acos(c) * 180.0 / M_PI);
                    }
                }
                prev = Point{sx, sy};
                hasPrev = true;
            }
            return worst;
        };
        // ÖLÇÜLDÜ VE REDDEDİLDİ (2026-08-23): eğrinin KENDİ ilmeğini arayan bir
        // kelepçe de yazıldı (48 örnek, kesişen segment testi) — kalan 225
        // selfintersect draftının HİÇBİRİNİ düşürmedi, yani katlanan şey kübiğin
        // kendisi değil. Kesişme oyuk ile panelin BAŞKA bir kenarı arasında;
        // sonraki aday makePrincessPieces içinde, bölme noktası bilinirken.
        const auto kinkClamp = [&](const std::function<Point(double)>& cp1Of,
                                   double cp2Y, double h) {
            const auto clean = [&](double v) {
                return maxTurnFor(cp1Of, cp2Y, v) <= PatternValidator::kinkAngleDegrees;
            };
            if (clean(h)) return h;
            double lo = 0.0, hi = h;   // lo hep temiz (h=0 düz çizgi), hi kirli
            for (int i = 0; i < 48; ++i) {
                const double mid = 0.5 * (lo + hi);
                if (clean(mid)) lo = mid; else hi = mid;
            }
            return lo;
        };
        if (useWidthLine) {
            // h büyüdükçe karın küçülür (monoton). Çizgiye ulaşılamıyorsa
            // ulaşılabilen en derin oyuk çizilir ve kapı bunu K1'de kırmızı görür.
            //
            // ★ AMA ARAMANIN TAVANI YOKTU (düzeltildi 2026-08-23). Aşağıdaki dal
            // bir GEOMETRİK tavan taşıyor, bu dal hiç taşımıyordu: `hi` 4*dx idi,
            // yani bir sınır değil bir başlangıç sayısı. Sonuç, ULAŞILAMAZ bir
            // çizgiyi kovalayan bir arama (ölçüldü, EU38 ön kolsuz: innerX=162.00
            // omuz ucunun sadece 2.08mm içinde -> useWidthLine açılıyor; h 199.73'e
            // çıkıyor, cp1=(354.8,129.6) cp2=(39.7,185.6) — kontrol poligonu
            // katlanmış). Ve çizgiye yine ULAŞILMIYOR: h=199.73'te bile eğrinin en
            // küçük x'i 164.08, yani omuz ucunun ta kendisi. Ulaşamaz da: oyuk
            // uçtan omuz dikişinin teğetiyle, yani DIŞARI doğru ayrılıyor.
            //
            // Katlanan poligonun bedeli: eğri önce dışarı taşıyor, sonra içeri
            // dönüyor, sonra yine dışarı — DIŞ-İÇ-DIŞ. O ortadaki dönüş, oyuğu
            // kendi panelinin prenses dikişinin soluna sokuyor ve panel kendini
            // kesiyordu (`sewable_census` 270 draft, hepsi `[selfintersect]
            // Bodice Side Front`, hepsi KOLSUZ — çünkü çizgiyi omuz ucunun içine
            // düşüren şey kolsuz kesimin omuzdan aldığı paydır).
            //
            // TAVAN = KATLANMAMA ŞARTININ KENDİSİ. Aşağıdaki dalın "cp2 omuz
            // ucunu geçemez" (h <= 0.94*dx) kuralı bu şartın kontrol-poligonu
            // üzerinden yazılmış bir VEKİLİ. Burada vekile gerek yok, şartın
            // kendisi yazılabiliyor: kübiğin x(t)'si (0,1) aralığında EN FAZLA BİR
            // kez dönebilir. Bir dönüş = "oyul, sonra koltukaltına çık" (doğru
            // oyuk). İki dönüş = DIŞ-İÇ-DIŞ, yani katlanma. x'(t) bir parabol,
            // kökleri kapalı formda sayılıyor — örnekleme değil.
            // Ölçüm neden vekil değil de şartın kendisi: ikisi de kesişmeyi
            // sıfırlıyor (82980/82980), ama vekil EU38'in oyuğunu 398.26mm'ye
            // düşürüp K1'i (400-440mm) kırıyor, şartın kendisi 404.26mm'de
            // bırakıyor. Vekil, ölçtüğü şeyden fazlasını kesiyordu.
            const auto turnsFor = [&](double h) {
                const Point c1 = cp1Of(h);
                const Point c2{armholeBottom.x - dx * 0.06 - h, cp2Y};
                // x'(t)/3 = qa*t^2 + qb*t + qc  (Bezier turev kontrol farklari)
                const double A = c1.x - shoulder.x;
                const double B = c2.x - c1.x;
                const double C = armholeBottom.x - c2.x;
                const double qa = A - 2 * B + C, qb = 2 * B - 2 * A, qc = A;
                const auto interior = [](double t) { return t > 1e-9 && t < 1 - 1e-9; };
                int n = 0;
                if (std::fabs(qa) < 1e-12) {
                    if (std::fabs(qb) > 1e-12 && interior(-qc / qb)) n = 1;
                } else {
                    const double disc = qb * qb - 4 * qa * qc;
                    if (disc > 0) {
                        const double sd = std::sqrt(disc);
                        if (interior((-qb - sd) / (2 * qa))) ++n;
                        if (interior((-qb + sd) / (2 * qa))) ++n;
                    }
                }
                return n;
            };
            // Katlanmama tavanı: tek dönüşün korunduğu en büyük h.
            double foldLo = 0.0, foldHi = std::max(4.0 * dx, 4.0 * (armholeBottom.x - scyeInnerX));
            if (turnsFor(foldHi) <= 1) {
                foldLo = foldHi;
            } else {
                for (int i = 0; i < 64; ++i) {
                    const double mid = 0.5 * (foldLo + foldHi);
                    if (turnsFor(mid) <= 1) foldLo = mid; else foldHi = mid;
                }
            }
            double lo = 0.0, hi = foldLo;
            if (bellyFor(hi) > innerLimit) return kinkClamp(cp1Of, cp2Y, hi);
            for (int i = 0; i < 64; ++i) {
                const double mid = 0.5 * (lo + hi);
                if (bellyFor(mid) > innerLimit) lo = mid; else hi = mid;
            }
            return kinkClamp(cp1Of, cp2Y, 0.5 * (lo + hi));
        }
        // GEOMETRİK TAVAN — ayarlanmış bir sayı değil: cp2 omuz ucunun İÇİNE
        // geçemez. Geçince oyuğun karnı panelin kendi kenarını kesiyor; ölçüldü
        // 2026-08-23, `[selfintersect] Upper Cup Side Front` (kap dikişli
        // princess paneli). Kontrol poligonu [omuz ucu, koltukaltı] açıklığında
        // kalır: cp2.x = bottom.x - 0.06*dx - h, shoulder.x = bottom.x - dx
        //   => cp2.x >= shoulder.x  <=>  h <= 0.94 * dx.
        // Tavan bağlarsa ölçülen oran TUTTURULAMAZ; bu bir gevşetme değil, kapıya
        // kırmızı olarak yansır (garment_armhole_check K1).
        (void)seed;
        double lo = 0.0;
        double hi = 0.94 * dx;
        if (arcFor(hi) < targetArc) return hi;
        for (int i = 0; i < 64; ++i) {
            const double mid = 0.5 * (lo + hi);
            if (arcFor(mid) < targetArc) lo = mid; else hi = mid;
        }
        return 0.5 * (lo + hi);
    };
    if (setIn) {
        // Set-in-sleeve scye: cp1 breaks from the shoulder seam and heads
        // DOWN into the armhole — a real set-in armhole corners at the tip and the
        // sleeve cap covers it. Deeper hollow than the sleeveless/tangent scye.
        // No tangent lock (that lock is what a single cubic could not reconcile
        // with a set-in scye — the measured 20.6 mm structural residual).
        const Point cp1In{
            shoulder.x + dx * BodiceBlock::setInArmholeCp1OutShare,
            shoulder.y + dy * BodiceBlock::setInArmholeUpperDropShare};
        const double cp2YIn = shoulder.y + dy * BodiceBlock::setInArmholeLowerDropShare;
        const double seedIn = (isFront ? BodiceBlock::setInArmholeHollowShareFront
                                       : BodiceBlock::setInArmholeHollowShareBack) * dx;
        const Point cp2In{
            armholeBottom.x - dx * 0.06 -
                solveHollow([&](double) { return cp1In; }, cp2YIn, seedIn),
            cp2YIn};
        return PathCommand::curve(armholeBottom, cp1In, cp2In);
    }
    const double hollowSeed = (isFront ? BodiceBlock::armholeHollowShareFront
                                       : BodiceBlock::armholeHollowShareBack) * dx;

    // Shoulder-seam tangent AT the tip: the seam runs neckPoint -> shoulderTip,
    // so its outgoing direction (continuing past the tip) is that unit vector.
    // The armhole leaves the tip ALONG this direction so the seam and the scye
    // share a tangent — no corner. cp1 sits a modest reach out along it, then
    // the hollow pulls it back inward so the curve still dives into the scye.
    double stx = shoulder.x - neckPoint.x;
    double sty = shoulder.y - neckPoint.y;
    const double slen = std::hypot(stx, sty);
    if (slen > 1e-6) { stx /= slen; sty /= slen; }
    else { stx = 1.0; sty = 0.0; }
    // cp1 leaves the tip PURELY along the shoulder-seam tangent — nothing pulls
    // it sideways, so the seam and the scye share a tangent and the old ~77 deg
    // spike is gone. The scye hollow is carried entirely by cp2 (mid/lower),
    // which keeps the belly concave without breaking the shoulder tangent.
    // ...but the reach GROWS with the hollow. A cubic kinks where one control arm
    // is long and the other short: loading a deep scye hollow onto cp2 alone made
    // the validator's kink rule fire ("curve turns 25 deg in one step", measured
    // on halter/cup/grade 2026-08-23). Keeping the two arms the same LENGTH is a
    // geometric rule, not a tuned number — the floor stays the old tangent share
    // so a shallow scye is byte-unchanged in shape family.
    const double cp2Y = shoulder.y + dy * BodiceBlock::armholeLowerDropShare;
    const double tanFloor = chord * BodiceBlock::armholeShoulderTangentShare;
    const auto cp1Of = [&](double h) {
        const Point c2{armholeBottom.x - dx * 0.06 - h, cp2Y};
        const double arm = std::hypot(armholeBottom.x - c2.x, armholeBottom.y - c2.y);
        const double reach = std::max(tanFloor, arm);
        return Point{shoulder.x + stx * reach, shoulder.y + sty * reach};
    };
    const double hollow = solveHollow(cp1Of, cp2Y, hollowSeed);
    const Point cp2{armholeBottom.x - dx * 0.06 - hollow, cp2Y};
    if (std::getenv("STITCHU_SCYE_DEBUG")) {
        const auto s = flattenCubic(shoulder, armholeBottom, cp1Of(hollow), cp2, 200);
        double maxX = shoulder.x, minX = shoulder.x;
        for (const auto& p : s) { maxX = std::max(maxX, p.x); minX = std::min(minX, p.x); }
        std::fprintf(stderr,
            "[scye] front=%d tip=(%.2f,%.2f) bottom=(%.2f,%.2f) dx=%.2f innerX=%.2f "
            "maxInset=%.2f innerLimit=%.2f useWidth=%d hollow=%.2f (0.94dx=%.2f) "
            "cp1=(%.2f,%.2f) cp2=(%.2f,%.2f) minX=%.2f maxX=%.2f\n",
            (int)isFront, shoulder.x, shoulder.y, armholeBottom.x, armholeBottom.y, dx,
            scyeInnerX, scyeMaxInset, innerLimit, (int)useWidthLine, hollow, 0.94 * dx,
            cp1Of(hollow).x, cp1Of(hollow).y, cp2.x, cp2.y, minX, maxX);
    }
    return PathCommand::curve(armholeBottom, cp1Of(hollow), cp2);
}

// y on the waist bezier at a given x (the curve is monotonic in x).
double waistCurveY(double x, Point sideWaist, const PathCommand& curve) {
    if (curve.type != CmdType::Curve) return sideWaist.y;
    Point best = sideWaist;
    double bestDistance = std::numeric_limits<double>::max();
    const int steps = 32;
    for (int i = 0; i <= steps; ++i) {
        const double t = static_cast<double>(i) / steps;
        const double mt = 1 - t;
        const double px = mt * mt * mt * sideWaist.x + 3 * mt * mt * t * curve.cp1.x + 3 * mt * t * t * curve.cp2.x + t * t * t * curve.to.x;
        const double py = mt * mt * mt * sideWaist.y + 3 * mt * mt * t * curve.cp1.y + 3 * mt * t * t * curve.cp2.y + t * t * t * curve.to.y;
        const double d = std::fabs(px - x);
        if (d < bestDistance) {
            bestDistance = d;
            best = {px, py};
        }
    }
    return best.y;
}

// Shared half-bodice outline: center edge at x=0. The side waist sits at
// sideWaistY (same for front and back so side seams match); the center waist
// sits at centerWaistY (front carries the M&S balance drop there).
HalfBodice makePiece(
    const std::string& name,
    const std::string& cutInstruction,
    Neckline neckline,
    double neckW,
    double neckCutout,
    double shoulderHalf,
    double shoulderDrop,
    double chestWidth,
    double armholeY,
    double sideWaistY,
    double centerWaistY,
    double waistlineWidth,
    double dartWidth,
    double dartLength,
    double centerTakeIn,
    bool isFront = false,
    bool sleeveless = false,
    bool setIn = false,
    double scyeInnerX = 0.0,  // Aldrich p.11 genislik cizgisi (bodice.hpp)
    double scyeMaxInset = 1e9 // karnin omuz ucundan iceri girebilecegi tavan
) {
    const Point centerNeck{0, neckCutout};
    const Point neckPoint{neckW, 0};
    // Sleeveless: cut the shoulder tip in and raise the underarm so a bare-
    // shoulder armhole hugs the body (a real sleeveless scye). Sleeved keeps the
    // full width so the sleeve cap seats. The shoulder VERTEX moves so the drawn
    // outline itself carries the cut-in (not just the curve control points).
    const double shoulderTipX = sleeveless
        ? shoulderHalf - BodiceBlock::sleevelessShoulderCutInMM : shoulderHalf;
    const double underarmY = sleeveless
        ? armholeY - BodiceBlock::sleevelessUnderarmRaiseMM : armholeY;
    const Point shoulderTip{shoulderTipX, shoulderDrop};
    const Point armholeBottom{chestWidth, underarmY};
    const Point sideWaist{waistlineWidth, sideWaistY - 8};
    const Point centerWaist{centerTakeIn, centerWaistY};

    const PathCommand armholeCurve = armholeCurveFor(shoulderTipX, shoulderDrop, armholeBottom, neckPoint, isFront, /*sleeveless=*/false, /*setIn=*/setIn, scyeInnerX, scyeMaxInset);
    const double armholeLen = pathLength({PathCommand::move(shoulderTip), armholeCurve});

    const double waistSpan = waistlineWidth - centerTakeIn;
    const PathCommand waistCurve = PathCommand::curve(
        centerWaist,
        {centerTakeIn + waistSpan * 0.6, sideWaist.y + (centerWaist.y - sideWaist.y) * 0.55},
        {centerTakeIn + waistSpan * 0.25, centerWaist.y});

    std::vector<PathCommand> commands{PathCommand::move(centerNeck)};
    for (const auto& cmd : neckCommands(neckline, centerNeck, neckPoint)) commands.push_back(cmd);
    commands.push_back(PathCommand::line(shoulderTip));
    commands.push_back(armholeCurve);
    commands.push_back(PathCommand::line(sideWaist));
    commands.push_back(waistCurve);
    // Control points interpolate between waist and neck cutout so a deep
    // neckline on a short body can never fold the edge back.
    commands.push_back(PathCommand::curve(
        centerNeck,
        {centerTakeIn * 0.6, neckCutout + (centerWaistY - neckCutout) * 0.6},
        {0, neckCutout + (centerWaistY - neckCutout) * 0.3}));
    commands.push_back(PathCommand::close());

    std::vector<PathCommand> markings;
    if (dartWidth > 0) {
        const double dartCenterX = centerTakeIn + waistSpan * 0.5;
        // Put the dart legs on the drafted waist curve.
        const double legAX = dartCenterX - dartWidth / 2;
        const double legBX = dartCenterX + dartWidth / 2;
        const Point legA{legAX, waistCurveY(legAX, sideWaist, waistCurve)};
        const Point legB{legBX, waistCurveY(legBX, sideWaist, waistCurve)};
        const Point apex{dartCenterX, std::min(legA.y, legB.y) - dartLength};
        markings.push_back(PathCommand::move(legA));
        markings.push_back(PathCommand::line(apex));
        markings.push_back(PathCommand::line(legB));
    }

    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction = cutInstruction;
    piece.commands = commands;
    piece.markings = markings;
    piece.hasGrainline = true;
    piece.grainline = Grainline{
        {std::max(centerTakeIn, 20.0) + 20, armholeY},
        {std::max(centerTakeIn, 20.0) + 20, sideWaistY - 30}};
    piece.seamAllowance = constants::kSeamAllowanceMM;

    HalfBodice half;
    half.piece = piece;
    half.armholeLength = armholeLen;
    half.sideSeam = std::hypot(sideWaist.x - armholeBottom.x, sideWaist.y - armholeBottom.y);
    half.sewnWaist = pathLength({PathCommand::move(sideWaist), waistCurve}) - dartWidth;
    half.straightWaist = waistSpan - dartWidth;
    return half;
}

struct PrincessHalf {
    PatternPiece center;
    PatternPiece side;
    double armholeLength = 0;
    double sideSeam = 0;
    double sewnWaist = 0;      // center part + side part, along the drafted curve
    double centerArc = 0;      // center-edge -> princess-seam leg, along the curve
    double straightWaist = 0;  // waist span minus intake, same basis as dart mode
    double seamCenterLen = 0;  // princess edge on the center panel
    double seamSideLen = 0;    // princess edge on the side panel
};

// Princess split of the same half-bodice skeleton makePiece draws: the waist
// dart becomes a seam from the armhole through the bust apex to the waist.
// Above the apex both panel edges share one cubic (identical length); below it
// the old dart legs become the panel edges, so the intake is sewn out exactly
// like the dart it replaces.
// extendBelowWaist > 0 (tops): the panels flow THROUGH the waist to the hem —
// the seam gap closes toward hip depth and the side seam flares to
// hipHalfQuarter, so the top stays fitted where the dart-mode extension goes
// boxy. Trued legs end at the same y, so the below-waist edges mirror exactly.
PrincessHalf makePrincessPieces(
    const std::string& baseName,
    const std::string& centerCut,
    const std::string& sideCut,
    Neckline neckline,
    double neckW,
    double neckCutout,
    double shoulderHalf,
    double shoulderDrop,
    double chestWidth,
    double armholeY,
    double sideWaistY,
    double centerWaistY,
    double waistlineWidth,
    double dartWidth,
    double dartLength,
    double centerTakeIn,
    double extendBelowWaist = 0,
    double hipHalfQuarter = 0,
    bool isFront = false,
    bool sleeveless = false,
    double princessShare = 0.5,
    bool setIn = false,
    double scyeInnerX = 0.0,  // Aldrich p.11 genislik cizgisi (bodice.hpp)
    double scyeMaxInset = 1e9 // karnin omuz ucundan iceri girebilecegi tavan
) {
    const Point centerNeck{0, neckCutout};
    const Point neckPoint{neckW, 0};
    // Sleeveless cut-in (see makePiece): shoulder in, underarm up.
    const double shoulderTipX = sleeveless
        ? shoulderHalf - BodiceBlock::sleevelessShoulderCutInMM : shoulderHalf;
    const double underarmY = sleeveless
        ? armholeY - BodiceBlock::sleevelessUnderarmRaiseMM : armholeY;
    const Point shoulderTip{shoulderTipX, shoulderDrop};
    const Point armholeBottom{chestWidth, underarmY};
    const Point sideWaist{waistlineWidth, sideWaistY - 8};
    const Point centerWaist{centerTakeIn, centerWaistY};

    const PathCommand armholeCurve = armholeCurveFor(shoulderTipX, shoulderDrop, armholeBottom, neckPoint, isFront, /*sleeveless=*/false, /*setIn=*/setIn, scyeInnerX, scyeMaxInset);
    const double armholeLen = pathLength({PathCommand::move(shoulderTip), armholeCurve});

    const double waistSpan = waistlineWidth - centerTakeIn;
    const PathCommand waistCurve = PathCommand::curve(
        centerWaist,
        {centerTakeIn + waistSpan * 0.6, sideWaist.y + (centerWaist.y - sideWaist.y) * 0.55},
        {centerTakeIn + waistSpan * 0.25, centerWaist.y});

    // Old dart geometry becomes the seam geometry. princessShare = 0.5 is the
    // classic dart-center seam (byte-identical); the Bugra corset construction
    // moves the front seam toward the side and the back seam toward the fold
    // (measured off the purchased pattern, see cupseam.hpp bugra::).
    const double dartCenterX = centerTakeIn + waistSpan * princessShare;
    const CubicSplit waistAtA = splitCubic(sideWaist, waistCurve, cubicTForX(sideWaist, waistCurve, dartCenterX - dartWidth / 2));
    const CubicSplit waistAtB = splitCubic(sideWaist, waistCurve, cubicTForX(sideWaist, waistCurve, dartCenterX + dartWidth / 2));
    const Point legA = waistAtA.at; // center-side seam end on the waist
    const Point legB = waistAtB.at; // side-panel seam end on the waist
    const Point apex{dartCenterX, std::min(legA.y, legB.y) - dartLength};

    // True the seam: the waist curve sits deeper on the center side (front
    // balance drop), so the raw legB edge would be shorter than the legA edge
    // by up to ~10 mm — fine folded as a dart, unsewable as a seam. Drop the
    // side panel's waist end until both seam edges measure the same, and
    // re-blend its waist curve into the new end point.
    const double targetLegLen = distance(apex, legA);
    const double legDrop = std::sqrt(std::max(0.0, targetLegLen * targetLegLen - (dartWidth / 2) * (dartWidth / 2)));
    const Point legBTrued{legB.x, apex.y + legDrop};
    PathCommand sideWaistEdge = waistAtB.first; // sideWaist -> legB
    sideWaistEdge.cp2.y += legBTrued.y - legB.y;
    sideWaistEdge.to = legBTrued;

    // Where the seam leaves the armhole: a fixed share of the armhole depth,
    // but always safely above the apex.
    const double splitTargetY = std::max(
        shoulderDrop + 15.0,
        std::min(shoulderDrop + (armholeY - shoulderDrop) * BodiceBlock::princessArmholeShare,
                 apex.y - BodiceBlock::princessApexClearance));
    const CubicSplit armSplit = splitCubic(shoulderTip, armholeCurve, cubicTForY(shoulderTip, armholeCurve, splitTargetY));
    const Point split = armSplit.at;

    // Shared upper seam cubic, arriving at the apex near-vertically so it
    // flows into the straight leg below. The vertical lead of the apex-side
    // control point is normally 30% of the seam's height, but on a compressed
    // back (halter drops the whole frame) that height shrinks while the
    // horizontal reach to the apex does not — the curve then stays too flat and
    // snaps vertical only in its last step (a kink). Floor the lead at a third
    // of the horizontal reach so the turn spreads across the whole cubic. On a
    // normal back the height term dominates, so the golden is untouched; the
    // floor only engages when the frame is genuinely cramped.
    const double seamUpperLead = std::max((apex.y - split.y) * 0.30,
                                          std::abs(apex.x - split.x) * 0.34);
    const PathCommand seamUpper = PathCommand::curve(
        apex,
        {split.x + (apex.x - split.x) * 0.3, split.y + (apex.y - split.y) * 0.25},
        {apex.x, apex.y - seamUpperLead});
    const double seamUpperLen = pathLength({PathCommand::move(split), seamUpper});

    // Below-waist continuation (tops): the seam gap shrinks linearly to zero
    // at hip depth; the sewn hem totals hipHalfQuarter exactly.
    const double extra = extendBelowWaist;
    const double hipBlendDepth = 200; // waist-to-hip drafting depth, as in the skirt block
    const double gapHem = extra > 0 ? dartWidth * std::max(0.0, 1.0 - extra / hipBlendDepth) : 0;
    const double hemSeamY = sideWaistY + extra;
    const Point seamHemCenter{dartCenterX - gapHem / 2, hemSeamY};
    const Point seamHemSide{dartCenterX + gapHem / 2, hemSeamY};
    const Point hemCenter{centerTakeIn, centerWaistY + extra};
    const double sideHemX = hipHalfQuarter + gapHem;
    const Point hemSide{sideHemX, sideWaistY + extra - 10};
    // Lower seam edges: mirrored cubics (legs share one y after truing).
    const PathCommand lowerSeamCenter = PathCommand::curve(
        seamHemCenter, {legA.x, legA.y + extra * 0.35}, {seamHemCenter.x, legA.y + extra * 0.7});
    const PathCommand lowerSeamSide = PathCommand::curve(
        legBTrued, {seamHemSide.x, legBTrued.y + extra * 0.7}, {legBTrued.x, legBTrued.y + extra * 0.35});

    // ---- center panel ----
    std::vector<PathCommand> centerCommands{PathCommand::move(centerNeck)};
    for (const auto& cmd : neckCommands(neckline, centerNeck, neckPoint)) centerCommands.push_back(cmd);
    centerCommands.push_back(PathCommand::line(shoulderTip));
    centerCommands.push_back(armSplit.first);
    centerCommands.push_back(seamUpper);
    centerCommands.push_back(PathCommand::line(legA));
    if (extra > 0) {
        centerCommands.push_back(lowerSeamCenter);
        const double hemSpan = seamHemCenter.x - centerTakeIn;
        centerCommands.push_back(PathCommand::curve(
            hemCenter,
            {centerTakeIn + hemSpan * 0.6, seamHemCenter.y + (hemCenter.y - seamHemCenter.y) * 0.55},
            {centerTakeIn + hemSpan * 0.25, hemCenter.y}));
        centerCommands.push_back(PathCommand::line(centerWaist));
    } else {
        centerCommands.push_back(waistAtA.second);
    }
    centerCommands.push_back(PathCommand::curve(
        centerNeck,
        {centerTakeIn * 0.6, neckCutout + (centerWaistY - neckCutout) * 0.6},
        {0, neckCutout + (centerWaistY - neckCutout) * 0.3}));
    centerCommands.push_back(PathCommand::close());

    PatternPiece center;
    center.name = "Bodice Center " + baseName;
    center.cutInstruction = centerCut;
    center.commands = centerCommands;
    // Bust-apex match notch, pointing into the panel.
    center.markings = {PathCommand::move(apex), PathCommand::line({apex.x - 12, apex.y + 3})};
    center.hasGrainline = true;
    center.grainline = Grainline{
        {std::max(centerTakeIn, 20.0) + 20, armholeY},
        {std::max(centerTakeIn, 20.0) + 20, sideWaistY - 30}};
    center.seamAllowance = constants::kSeamAllowanceMM;

    // ---- side panel ----
    std::vector<PathCommand> sideCommands{PathCommand::move(split)};
    sideCommands.push_back(armSplit.second);
    if (extra > 0) {
        // Side seam nips at the waist and flares out to the hip in one curve
        // (same construction the dart-mode top extension uses).
        sideCommands.push_back(PathCommand::curve(
            hemSide,
            {sideWaist.x, sideWaistY + extra * 0.35},
            {sideHemX, sideWaistY + extra * 0.7}));
        const double hemSpan = hemSide.x - seamHemSide.x;
        sideCommands.push_back(PathCommand::curve(
            seamHemSide,
            {seamHemSide.x + hemSpan * 0.6, hemSide.y + (seamHemSide.y - hemSide.y) * 0.55},
            {seamHemSide.x + hemSpan * 0.25, seamHemSide.y}));
        sideCommands.push_back(lowerSeamSide);
    } else {
        sideCommands.push_back(PathCommand::line(sideWaist));
        sideCommands.push_back(sideWaistEdge);
    }
    sideCommands.push_back(PathCommand::line(apex));
    sideCommands.push_back(reverseCubic(split, seamUpper));
    sideCommands.push_back(PathCommand::close());

    PatternPiece side;
    side.name = "Bodice Side " + baseName;
    side.cutInstruction = sideCut;
    side.commands = sideCommands;
    side.markings = {PathCommand::move(apex), PathCommand::line({apex.x + 12, apex.y + 3})};
    side.hasGrainline = true;
    const double grainX = (legB.x + chestWidth) / 2;
    side.grainline = Grainline{
        {grainX, std::max(armholeY, apex.y) + 25},
        {grainX, sideWaistY + (extra > 0 ? extra - 40 : -30)}};
    side.seamAllowance = constants::kSeamAllowanceMM;
    // Rebase to a local top-left origin like every other piece.
    const Rect sideBox = boundingBox(side.commands);
    translatePiece(side, -sideBox.x, -sideBox.y);

    PrincessHalf half;
    half.center = center;
    half.side = side;
    half.armholeLength = armholeLen;
    half.sideSeam = extra > 0
        ? pathLength({PathCommand::move(armholeBottom), sideCommands[2]})
        : std::hypot(sideWaist.x - armholeBottom.x, sideWaist.y - armholeBottom.y);
    half.sewnWaist = pathLength({PathCommand::move(legA), waistAtA.second}) +
                     pathLength({PathCommand::move(sideWaist), sideWaistEdge});
    half.centerArc = pathLength({PathCommand::move(legA), waistAtA.second});
    half.straightWaist = waistSpan - dartWidth;
    half.seamCenterLen = seamUpperLen + distance(apex, legA) +
        (extra > 0 ? pathLength({PathCommand::move(legA), lowerSeamCenter}) : 0);
    half.seamSideLen = seamUpperLen + distance(apex, legBTrued) +
        (extra > 0 ? pathLength({PathCommand::move(seamHemSide), lowerSeamSide}) : 0);
    return half;
}

// Below this intake a princess seam adds pieces without adding shape; the
// half stays a single dart-mode piece (the dart itself may also be ~zero).
constexpr double minPrincessIntake = 12;

// Small-body dart fallback (mirrors how the real BugraPatterns XXS variant uses
// a dart instead of a panel): on a small frame whose suppression is only
// marginal, a princess panel is sewable but its curve is too shallow to earn
// the extra seam — draft an honest dart instead. Above these it stays a panel.
constexpr double princessSmallBustMM = 840;   // ~EU34/XS full-bust girth = "small size"
constexpr double princessCleanIntakeMM = 20;  // suppression a small-frame panel needs to earn its curve

} // namespace

namespace BodiceBlock {

// The scye cubic, exposed so the RECIPE INTERPRETER draws it with THIS code
// instead of a DSL copy of it. The hollow is no longer a closed-form share: it
// is bisected against the measured arc/chord target under a published width
// line, a fold cap and the validator's own kink rule (armholeCurveFor above).
// A JSON DSL cannot carry a solver, and a second hand-written cubic in the
// recipe is exactly the drift recipe_dress_check exists to catch — so the two
// paths share the function, not the number.
PathCommand scyeCurve(const Point& shoulderTip, const Point& armholeBottom,
                      const Point& neckPoint, bool isFront,
                      double scyeInnerX, double scyeMaxInset) {
    // sleeveless=false: the caller passes the ALREADY cut-in tip / raised
    // underarm (the recipe applies cutInMM / underarmRaiseMM in its own points),
    // so the cut must not be applied twice.
    return armholeCurveFor(shoulderTip.x, shoulderTip.y, armholeBottom, neckPoint, isFront,
                           /*sleeveless=*/false, /*setIn=*/false, scyeInnerX, scyeMaxInset);
}

BodiceDraft draft(const BodyMeasurementsSnapshot& m, Neckline neckline, Shaping shaping,
                  double extendBelowWaist, double hipHalfQuarter) {
    BodiceOptions options;
    options.neckline = neckline;
    options.shaping = shaping;
    options.extendBelowWaist = extendBelowWaist;
    options.hipHalfQuarter = hipHalfQuarter;
    return draft(m, options);
}

BodiceDraft draft(const BodyMeasurementsSnapshot& m, const BodiceOptions& options) {
    const Neckline neckline = options.neckline;
    const Shaping shaping = options.shaping;
    const double extendBelowWaist = options.extendBelowWaist;
    const double hipHalfQuarter = options.hipHalfQuarter;
    // Sleeveless scye cut-in applies to the front + back pieces (not halter,
    // which has its own bare-shoulder frame). Front deeper than back either way.
    const bool sleevelessScye = options.sleeveless && neckline != Neckline::Halter;
    // Set-in scye: a SLEEVED garment (not sleeveless, not halter) gets the set-in
    // armhole — cp1 breaks from the shoulder seam into the scye, so the sleeve cap
    // seats into a real set-in armhole instead of the sleeveless tangent curve.
    // The sleeve cap re-matches automatically (SleeveBlock fits the cap by
    // bisection to armholeLength). Sleeveless keeps its smooth bare-shoulder scye.
    const bool setInScye = !options.sleeveless && neckline != Neckline::Halter;
    // Corset fit (Bugra, opt-in): a fitted buttoned corset is drafted at ZERO
    // wearing ease (the purchased Bugra pieces measure no ease band). Default
    // false -> the fabric table drives, byte-identical.
    const double chestEase = options.corsetEase ? options.corsetChestEase
                                                : chestEaseFor(options.fabric);
    const double waistEase = options.corsetEase ? options.corsetWaistEase
                                                : waistEaseFor(options.fabric);

    const double neck = m.neckMM();
    const double backLength = m.backLengthMM();
    // Dropped shoulder (patch 3.13) extends the shoulder tip out along the
    // shoulder line, so the half-shoulder used to place the tip grows — but the
    // shoulder SLOPE (shoulderDrop) is taken from the natural shoulder below, so
    // the seam runs roughly straight out onto the arm instead of steepening.
    // Set/Raglan leave shoulderHalf exactly as before → byte-identical.
    const bool droppedShoulder = options.shoulderStyle == ShoulderStyle::Dropped;
    double naturalShoulderHalf = m.shoulderCM * 10 / 2;
    double shoulderHalf = naturalShoulderHalf;
    // The frame girth (back + armhole size to this). Prefer the REAL upper-bust
    // measurement when the user gave it — that's the full-bust adjustment. Only
    // fall back to the bust-minus-cup-offset assumption when it's absent, so an
    // existing 7-measurement draft is unchanged.
    // The upper bust is the frame ABOVE the bust, so it must be smaller than the
    // full bust. Clamp it (a typo entering the full bust here would otherwise make
    // the back wider than the front); keep at least a 20 mm cup so a near-equal
    // value doesn't degenerate to a no-cup body.
    const double rawFrame = m.upperBustMM() > 0 ? m.upperBustMM()
                                                : (m.bustMM() - underbustOffset);
    const double frameGirth = std::min(rawFrame, m.bustMM() - 20.0);
    const double underbust = std::max(frameGirth, m.waistMM());
    // Cup fullness = how far the bust projects past the ribcage frame. Drives the
    // front-only full-bust adjustment below (extra front width + a bigger bust
    // dart + a little front length) so a fuller bust does not ride up and gape.
    const double cupFullness = std::max(0.0, m.bustMM() - underbust); // mm of extra bust girth

    // Shoulder slope (2026-07-18, Aldrich pass): the seam from the neck point to
    // the shoulder tip must run at ~22 deg from horizontal over an Aldrich-length
    // seam (~118 mm for EU38), NOT a fixed drop tied only to shoulderHalf. The old
    // `shoulderHalf * 0.23` gave a fixed drop; on a WIDE neckline (boat pushes the
    // neck point out to x=110) the run collapsed, so the seam came out short AND
    // steep (78 mm / 33 deg). We anchor the tip to the FRONT neck point instead:
    // walk out `shoulderSeamTarget` mm at `shoulderSlopeDeg` from the neck point.
    // frontNeckWEarly is computed just below in the byte-identical order; mirror
    // its formula here (ONE source stays the min() at frontNeckWEarly).
    const double frontNeckWForSlope = std::min(
        neck * frontNeckWidthFactor * neckWidthMultiplier(neckline),
        shoulderHalf * maxNeckShoulderShare);
    const double shoulderSlopeRad = BodiceBlock::shoulderSlopeDeg * M_PI / 180.0;
    // ★ 2026-08-23: omuz DİKİŞİ ARTIK BEDENLE BÜYÜYOR. Sabit 126mm bir tek bedende
    // doğruydu; sekiz bedende omuz ucu neredeyse yerinde durup koltukaltı büstle
    // dışa kaçtığı için oyuk büyük bedenlerde açılıp uzuyordu (ölçüldü: EU48 oyuk
    // 496.7mm, yayınlanmış bandın 57mm üstü). Aldrich p.11 omuz boyunu da büste
    // karşı yayınlıyor — 12.25cm @ büst 88 · 12.5cm @ büst 92 — o iki noktadan
    // geçen doğru bodice.hpp shoulderSeamPerBust/InterceptMM'de.
    const double shoulderSeamMM = m.bustMM() * BodiceBlock::shoulderSeamPerBust +
                                  BodiceBlock::shoulderSeamInterceptMM;
    const double shoulderDrop = shoulderSeamMM * std::sin(shoulderSlopeRad);
    // Tip x = neck point + horizontal run of the target-length seam at target slope.
    shoulderHalf = frontNeckWForSlope + shoulderSeamMM * std::cos(shoulderSlopeRad);
    naturalShoulderHalf = shoulderHalf; // dropped-shoulder extends off the new tip
    // Dropped shoulder: slide the tip out now that the slope is fixed. The
    // armhole point drop + widen is applied to armholeY and the chest widths
    // below (all gated on droppedShoulder → Set is byte-identical).
    if (droppedShoulder) shoulderHalf += naturalShoulderHalf * ShoulderBlock::dropExtendShare;
    // The torso-only armhole depth (before any arm deepening). The empire seam is
    // anchored to THIS, not the deepened armhole — the empire/babydoll line sits
    // just under the BUST, and must not move when the armhole is lowered to seat a
    // fuller arm (else on a fuller-bust short-back body the "empire" seam slides
    // down to or below the natural waist and it stops being an empire dress).
    // Aldrich p.11 scye depth against BUST (bodice.hpp scyeDepth*): the old
    // backLength * 0.44 rode an unsourced size-table column that STALLS at
    // EU44->46, which is where the armhole grade broke. Aldrich measures the
    // depth FROM THE NAPE; our y origin is the neck-point line and the nape is
    // backNeckCutoutFactor * neck below it, so that offset is added back.
    const double napeBelowNeckLine = m.neckMM() * backNeckCutoutFactor;
    const double torsoArmholeY =
        m.bustMM() * scyeDepthPerBust + scyeDepthInterceptMM + napeBelowNeckLine;
    double armholeY = torsoArmholeY;
    // Deepen the armscye when the arm needs it. The torso-only depth
    // (backLength * 0.44) leaves the armhole too shallow to seat a fuller arm on
    // a short-backed body — the set-in sleeve then can't ease its biceps into
    // the armhole and the draft is refused. A real pattern-maker lowers the
    // underarm point for a fuller arm. The armhole circumference must be able to
    // accept the biceps line (bust * bicepsRatio); floor the armhole depth so it
    // does. armholeLength runs roughly linear in depth, so scale the floor to
    // the biceps and clamp it so the underarm never drops past the waist.
    // YAYINLANMIŞ scye genişlik çizgileri (Aldrich p.11, bodice.hpp'de iki nokta
    // ve doğrusu yazılı). Oyuğun karnı bunlara oturur; büstle büyürler, yani
    // KAYNAKLI bir kolona bağlıdırlar (kaynaksız beden kolonlarına değil).
    // Doğal blok omuz ucu: yaka çarpanı 1.0 (crew) ve düşük-omuz uzatması YOK.
    // Sadece scyeMaxInset için kullanılır, çizime girmez.
    const double naturalTipXForScye =
        std::min(neck * frontNeckWidthFactor, naturalShoulderHalf * maxNeckShoulderShare) +
        (m.bustMM() * BodiceBlock::shoulderSeamPerBust + BodiceBlock::shoulderSeamInterceptMM) *
            std::cos(BodiceBlock::shoulderSlopeDeg * M_PI / 180.0);
    const double backScyeInnerX  = m.bustMM() * BodiceBlock::scyeBackWidthHalfPerBust +
                                   BodiceBlock::scyeBackWidthHalfInterceptMM;
    const double frontScyeInnerX = m.bustMM() * BodiceBlock::scyeChestWidthHalfPerBust +
                                   BodiceBlock::scyeChestWidthHalfInterceptMM;
    const double backScyeMaxInset  = std::max(0.0, naturalTipXForScye - backScyeInnerX);
    const double frontScyeMaxInset = std::max(0.0, naturalTipXForScye - frontScyeInnerX);
    const double bicepsGirth = m.bustMM() * BodiceBlock::bicepsRatioForArmscye;
    const double armholeDepthForArm = bicepsGirth * armscyeArmFactor + shoulderDrop;
    double armholeDepthCap = backLength * armscyeMaxDepthShare + shoulderDrop;

    // Empire: the seam sits just under the bust and the target girth is the
    // underbust line, not the waist. Both halves share the side seam level. The
    // seam anchors to the TORSO armhole (bust line), not the arm-deepened one, so
    // the babydoll line stays just under the bust on every body.
    const bool empire = options.waistline == Waistline::Empire;
    const double seamSideY = empire ? torsoArmholeY + empireDrop : backLength;
    // The empire bodice ENDS at that seam, so the (possibly deepened) armhole must
    // stay above it — otherwise the armhole curve runs past the waist seam and the
    // piece self-intersects. Tighten the deepening cap for empire.
    if (empire) armholeDepthCap = std::min(armholeDepthCap, seamSideY - 8);
    armholeY = std::min(armholeDepthCap, std::max(armholeY, armholeDepthForArm));
    // Dropped shoulder: lower the underarm point with the extended shoulder, still
    // clamped above the waist seam so the armhole never runs past it. The chest
    // widths widen a touch below (both halves equally, side seams still pair).
    const double droppedArmholeAdd = droppedShoulder
        ? std::min(torsoArmholeY * ShoulderBlock::dropArmholeShare,
                   std::max(0.0, armholeDepthCap - armholeY))
        : 0.0;
    armholeY += droppedArmholeAdd;
    const double droppedWiden = droppedArmholeAdd * ShoulderBlock::dropWidenShare;

    // A fuller bust also needs a little extra FRONT LENGTH at center front — the
    // fabric that goes up and over the bust — or the front rides up and pulls the
    // neckline open. Add a share of the cup fullness to the front balance drop.
    const double cupFrontDrop = m.upperBustMM() > 0 ? std::max(0.0, m.bustMM() - underbust) * 0.15 : 0.0;
    const double frontSeamCenterY = empire ? seamSideY + empireBalanceDrop
                                           : backLength + frontBalanceDrop + cupFrontDrop;
    const double girth = empire ? underbust : m.waistMM();

    const double widthMultiplier = neckWidthMultiplier(neckline);

    // Halter restructures both halves but reuses the same skeleton through a
    // FRAME SHIFT. Front: the strap top edge becomes the local "shoulder line"
    // (y = 0) — the whole front drops by halterStrapRise, the "neck point"
    // becomes the strap's inner top corner, the "shoulder tip" its outer
    // corner (that short line = the nape closure edge), and the "armhole"
    // becomes the bare-shoulder sweep down to the underarm. Back: the low top
    // edge becomes y = 0 — a wide shallow "neckline", a stub of a "shoulder"
    // and a short "armhole" down to the same underarm point. All returned
    // scalars stay in body frame; only lengths cross halves and lengths are
    // translation-invariant.
    const bool halter = neckline == Neckline::Halter;
    const double halterBackTopY = halter ? armholeY * halterBackDropShare : 0;

    // ---- BACK (cut 2, center back seam carries part of the suppression) ----
    const double backNeckW = halter
        ? ((underbust / 4) * (1 + chestEase)) * 0.7
        : std::min(neck * backNeckWidthFactor * widthMultiplier, shoulderHalf * maxNeckShoulderShare);
    const double backCutout = halter ? 8 : neck * backNeckCutoutFactor;
    // Side-seam walk (Bugra Locket, opt-in): move sideSeamShiftMM from the back
    // quarter into the front quarter at chest AND waist — girth + suppression
    // totals unchanged, only the seam position. 0 (default) = byte-identical.
    const double sideShift = options.sideSeamShiftMM;
    const double backWidth = (underbust / 4) * (1 + chestEase) + droppedWiden - sideShift;

    // SHOULDER TRUING (2026-07-13, precision pass): the back neck is wider
    // than the front (anatomy), so with a shared shoulder tip the back seam
    // came out 8-10 mm SHORTER than the front it must sew onto. Slide the back
    // tip outward along its own seam direction until both measure the same.
    // Halter has no shoulder seam and keeps its own frame.
    const double frontNeckWEarly = std::min(neck * frontNeckWidthFactor * widthMultiplier,
                                            shoulderHalf * maxNeckShoulderShare);
    double bTipHalf = shoulderHalf, bTipDrop = shoulderDrop;
    if (!halter) {
        const double frontShoulderLen = std::hypot(shoulderHalf - frontNeckWEarly, shoulderDrop);
        const double backRunX = shoulderHalf - backNeckW;
        const double backLen = std::hypot(backRunX, shoulderDrop);
        const double scale = backLen > 1e-9 ? frontShoulderLen / backLen : 1.0;
        bTipHalf = backNeckW + backRunX * scale;
        bTipDrop = shoulderDrop * scale;
    }
    const double backWaistTarget = (girth * backWaistShare / 2) * (1 + waistEase) - sideShift;
    const double backReduction = std::max(0.0, backWidth - backWaistTarget);
    double backDart = backReduction * (1 - centerBackReduction * 0.5);
    const double cbTakeIn = backReduction * centerBackReduction * 0.5;
    if (backDart <= 0) backDart = 0;
    // Waist edge spans from the CB take-in to the side; folding the dart out
    // leaves exactly the waist target: cbTakeIn + target + dart.
    const double backWaistlineWidth = cbTakeIn + backWaistTarget + backDart;

    // Front waist numbers, needed EARLY for the side-seam truing below.
    // Front bust width. On a full bust the girth is NOT evenly split front/back —
    // the bust projects forward, so the front quarter needs extra. Add a share of
    // the cup fullness to the front (it flows into a bigger bust dart below, which
    // is where a full-bust adjustment puts the extra: dart intake, not a wider
    // silhouette). Only engages when the real upper bust was given.
    const double frontCupAdd = m.upperBustMM() > 0 ? cupFullness * 0.35 : 0.0;
    const double frontWidth = (m.bustMM() / 4) * (1 + chestEase) + frontCupAdd + droppedWiden + sideShift;
    const double frontWaistTarget = (girth * (1 - backWaistShare) / 2) * (1 + waistEase) + sideShift;
    const double frontReduction = std::max(0.0, frontWidth - frontWaistTarget);
    // Bust dart (2026-07-18, Aldrich pass): a B-cup for an 88 bust wants a
    // 15-18 deg bust dart. The old code bled up to 15 mm of the front
    // suppression into the side seam, which flattened the single waist->apex
    // dart to ~11.5 deg / 38 mm. Keep only a small side slant so most of the
    // suppression stays in the dart (deepening it toward the Aldrich intake).
    // Extended tops (hip/tunic) sew a below-waist EXTENSION curve that is not
    // side-trued (see below); their waist X drives that curve's control point,
    // so keep the old 15 mm side-take there to leave the front/back extension
    // seams paired exactly as before (their fit isn't the bodice bust dart).
    const double sideTakeCap = extendBelowWaist > 0 ? 15.0 : BodiceBlock::frontSideTakeMM;
    const double sideTake = std::min(frontReduction, sideTakeCap);
    const double frontDart = frontReduction - sideTake;
    const double frontWaistlineWidth = frontWaistTarget + frontDart;

    // (SIDE-SEAM TRUING moved below: it now needs BOTH halves' frames and the
    // princess/dart decision, because it measures the seam each half will
    // actually draw. See "SIDE-SEAM TRUING" after frontPrincess.)

    // Halter back frame: local y = 0 at the low top edge.
    const double bShoulderHalf = halter ? backWidth * 0.85 : bTipHalf;
    const double bShoulderDrop = halter ? 2 : bTipDrop;
    const double bArmholeY = armholeY - halterBackTopY;
    const double bSeamSideY = seamSideY - halterBackTopY;

    // Empire: the back blade apex stays at armholeY - 40, measured from the
    // raised seam; natural keeps the classic formula bit for bit. (The halter
    // shift cancels out of both variants.)
    const double backDartLength = empire ? (bSeamSideY - 8) - (bArmholeY - 40)
                                         : bSeamSideY - bArmholeY + 40;
    // Halter's low back can get too short for a princess seam: when the seam's
    // exit point would be forced down against the blade apex, the shared cubic
    // has to turn too hard (kink). No room -> honest dart mode for that half.
    const double backApexY = (bSeamSideY - 8) - backDartLength;
    const bool backCramped =
        bShoulderDrop + (bArmholeY - bShoulderDrop) * princessArmholeShare >
        backApexY - princessApexClearance;
    const bool smallBody = m.bustMM() < princessSmallBustMM;
    const bool backPrincess = shaping == Shaping::Princess && backDart >= minPrincessIntake &&
                              (!halter || !backCramped) &&
                              !(smallBody && backDart < princessCleanIntakeMM);
    // Halter front frame values the truing below needs (the rest of the front
    // frame is set where the front is drawn).
    const double fArmholeY = halter ? armholeY + halterStrapRise : armholeY;
    const double fSeamSideY = halter ? seamSideY + halterStrapRise : seamSideY;
    const bool frontPrincess = shaping == Shaping::Princess && frontDart >= minPrincessIntake &&
                               !(smallBody && frontDart < princessCleanIntakeMM);

    // SIDE-SEAM TRUING (2026-07-13, precision pass): the two halves slant
    // inward by different amounts, so on short (empire) bodices the seams
    // mismatched by up to ~2 mm. Drop the SHORTER half's side-waist end until
    // both measure the same — the legBTrued move, applied to the side seam.
    const double sideH = (seamSideY - 8) - armholeY; // frame shifts cancel
    const double runF = frontWidth - frontWaistlineWidth;
    const double runB = backWidth - backWaistlineWidth;
    const double sideLenF = std::hypot(runF, sideH);
    const double sideLenB = std::hypot(runB, sideH);
    double deltaBack = 0, deltaFront = 0;
    // ── EXTENDED TOPS ARE TRUED TOO (2026-08-23) ──────────────────────────────
    // This block used to be skipped whenever extendBelowWaist > 0, on the claim
    // that "the extension curves already pair up". MEASURED FALSE: an extended
    // half sews a CURVED seam from the underarm all the way to the hem, and its
    // length is not the hypotenuse the closed form above assumes — the two hem
    // ends carry different dart-gap widths and different waist slants. Across
    // the census sweep 146 body x style cells missed by more than 1 mm and
    // pear/knit/princess/crew/hip missed by 3.0 mm, i.e. exactly on the
    // pairedSeamTolerance ceiling, which is the [sideseam] red the sewable
    // census and engine_check were both reporting.
    // The fix is not a looser ceiling and not a special case: the seam is trued
    // against the seam the half will ACTUALLY draw. For the closed (cropped /
    // dress) case that seam IS the hypotenuse, so the branch below is byte-for-
    // byte the old code; only the extended branch is new.
    const double hipBlendDepth = 200; // = makePrincessPieces (waist-to-hip depth)
    // The drawn side seam of an extended half, as a function of its side-waist
    // level. Mirrors makePrincessPieces' side panel (princess) and the top
    // block's classic extension (dart fallback) command for command.
    const auto extendedSideLen = [&](bool princess, double chestW, double aY, double sY,
                                     double waistlineWidth, double dartW) {
        if (princess) {
            const double underarmY = sleevelessScye ? aY - sleevelessUnderarmRaiseMM : aY;
            const double gapHem = dartW * std::max(0.0, 1.0 - extendBelowWaist / hipBlendDepth);
            const double sideHemX = hipHalfQuarter + gapHem;
            return pathLength({PathCommand::move({chestW, underarmY}), PathCommand::curve(
                {sideHemX, sY + extendBelowWaist - 10},
                {waistlineWidth, sY + extendBelowWaist * 0.35},
                {sideHemX, sY + extendBelowWaist * 0.7})});
        }
        return pathLength({PathCommand::move({chestW, aY}), PathCommand::curve(
            {hipHalfQuarter, sY + extendBelowWaist - 10},
            {waistlineWidth, sY + extendBelowWaist * 0.35},
            {hipHalfQuarter, sY + extendBelowWaist * 0.7})});
    };
    if (extendBelowWaist <= 0) {
        if (sideLenF > sideLenB) {
            deltaBack = std::sqrt(std::max(0.0, sideLenF * sideLenF - runB * runB)) - sideH;
        } else if (sideLenB > sideLenF) {
            deltaFront = std::sqrt(std::max(0.0, sideLenB * sideLenB - runF * runF)) - sideH;
        }
    } else if (frontPrincess && backPrincess) {
        // BOTH halves must draw the seam HERE for this to be truing rather than
        // guessing. A half that falls back to a dart under princess+extension is
        // extended later by the top block; the length reported for it below is a
        // MIRROR of that extension, not the drawn seam (measured on the apple
        // body: mirror 331.7 mm vs drawn 341.0 mm — 9.3 mm apart). Matching the
        // other half to a mirror moves the REAL seams apart: measured, it opened
        // apple/princess/hip from paired to 5.9 mm and lit [sideseam] Top on 24
        // drafts. Mixed halves therefore stay untrued (they pair today) and the
        // mirror's own error is logged as an open item, not hidden here.
        // Dropping the side-waist level lengthens the drawn curve monotonically
        // (start point fixed, end point and both control points move down), so
        // the drop that makes the shorter half reach the longer one is a plain
        // bisection — no tuned constant, no tolerance.
        const double lenF = extendedSideLen(frontPrincess, frontWidth, fArmholeY, fSeamSideY,
                                            frontWaistlineWidth, frontDart);
        const double lenB = extendedSideLen(backPrincess, backWidth, bArmholeY, bSeamSideY,
                                            backWaistlineWidth, backDart);
        const auto dropTo = [&](bool princess, double chestW, double aY, double sY,
                                double waistlineWidth, double dartW, double target) {
            double lo = 0.0, hi = 1.0;
            while (hi < 512.0 &&
                   extendedSideLen(princess, chestW, aY, sY + hi, waistlineWidth, dartW) < target)
                hi *= 2.0;
            for (int i = 0; i < 60; ++i) {
                const double mid = 0.5 * (lo + hi);
                if (extendedSideLen(princess, chestW, aY, sY + mid, waistlineWidth, dartW) < target)
                    lo = mid;
                else
                    hi = mid;
            }
            return 0.5 * (lo + hi);
        };
        if (lenF > lenB) {
            deltaBack = dropTo(backPrincess, backWidth, bArmholeY, bSeamSideY,
                               backWaistlineWidth, backDart, lenF);
        } else if (lenB > lenF) {
            deltaFront = dropTo(frontPrincess, frontWidth, fArmholeY, fSeamSideY,
                                frontWaistlineWidth, frontDart, lenB);
        }
    }

    HalfBodice back;
    PrincessHalf backSplit;
    if (backPrincess) {
        backSplit = makePrincessPieces(
            "Back", "cut 2", "cut 2",
            Neckline::Crew, // back top edge stays a shallow curve for every style
            backNeckW, backCutout, bShoulderHalf, bShoulderDrop,
            backWidth, bArmholeY,
            bSeamSideY + deltaBack, bSeamSideY,
            backWaistlineWidth, backDart,
            backDartLength,
            cbTakeIn,
            extendBelowWaist, hipHalfQuarter,
            /*isFront=*/false, sleevelessScye, options.princessShareBack, /*setIn=*/setInScye,
            backScyeInnerX, backScyeMaxInset);
    } else {
        back = makePiece(
            "Bodice Back", "cut 2",
            Neckline::Crew,
            backNeckW, backCutout, bShoulderHalf, bShoulderDrop,
            backWidth, bArmholeY,
            bSeamSideY + deltaBack, bSeamSideY,
            backWaistlineWidth, backDart,
            backDartLength,
            cbTakeIn,
            /*isFront=*/false, sleevelessScye, /*setIn=*/setInScye, backScyeInnerX, backScyeMaxInset);
    }

    // ---- FRONT (cut 1 on fold, suppression in the waist dart + side seam) ----
    const double frontNeckW = frontNeckWEarly; // ONE source (shoulder truing read it)
    // Halter front frame: local y = 0 at the strap top edge, so the whole
    // front shifts DOWN by the strap rise and the strap corners take the
    // neck-point / shoulder-tip roles.
    const double fNeckW = halter ? frontNeckW * 0.55 : frontNeckW;
    const double fShoulderHalf = halter ? fNeckW + halterStrapWidth : shoulderHalf;
    const double fShoulderDrop = halter ? 10 : shoulderDrop;
    // Yaka deliği boyundan kısa çıkıyorsa ÖN derinlik açılır (yukarıdaki
    // neckClearanceDropMM: geometrik zorunluluk, genişlik değil derinlik).
    // Halter kendi çerçevesini kurar (omuz dikişi yok, delik boynu çevrelemez).
    const double neckClearAdd = halter ? 0.0
        : neckClearanceDropMM(neckline, neck, frontNeckW,
                              frontNeckDepth(neckline, frontNeckW), backNeckW, backCutout);
    const double frontCutout = frontNeckDepth(neckline, frontNeckW) + neckClearAdd +
                               (halter ? halterStrapRise : 0);
    const double frontLength = frontSeamCenterY + (halter ? halterStrapRise : 0);
    // (front waist numbers were computed above, before the side-seam truing)

    // Empire: the bust apex stays put, so the leg from the raised seam up to
    // it is short; natural keeps the classic formula bit for bit. (The halter
    // shift cancels out of both variants.)
    const double frontDartLength = empire
        ? std::max(12.0, (fSeamSideY - 8) - (fArmholeY + 40))
        : frontLength - fArmholeY - 40;
    HalfBodice front;
    PrincessHalf frontSplit;
    if (frontPrincess) {
        frontSplit = makePrincessPieces(
            "Front", "cut 1 on fold", "cut 2",
            neckline,
            fNeckW, frontCutout, fShoulderHalf, fShoulderDrop,
            frontWidth, fArmholeY,
            fSeamSideY + deltaFront, frontLength,
            frontWaistlineWidth, frontDart,
            frontDartLength,
            0,
            extendBelowWaist, hipHalfQuarter,
            /*isFront=*/true, sleevelessScye, options.princessShareFront, /*setIn=*/setInScye,
            frontScyeInnerX, frontScyeMaxInset);
    } else {
        front = makePiece(
            "Bodice Front", "cut 1 on fold",
            neckline,
            fNeckW, frontCutout, fShoulderHalf, fShoulderDrop,
            frontWidth, fArmholeY,
            fSeamSideY + deltaFront, frontLength,
            frontWaistlineWidth, frontDart,
            frontDartLength,
            0,
            /*isFront=*/true, sleevelessScye, /*setIn=*/setInScye, frontScyeInnerX, frontScyeMaxInset);
    }

    // A half that stays unsplit under princess+extension is extended later by
    // the top block's classic extension; report the matching side-seam length
    // so the front/back audit compares like with like. Same lambda the truing
    // solved against (one formula, one truth) — and it reads the TRUED waist
    // level, because that is where the piece was actually drawn.
    auto extendedDartSideLen = [&](double waistlineWidth, double chestW, double aY, double sY) {
        return extendedSideLen(/*princess=*/false, chestW, aY, sY, waistlineWidth, 0.0);
    };

    BodiceDraft draft;
    draft.frontPrincess = frontPrincess;
    draft.backPrincess = backPrincess;
    if (backPrincess) {
        draft.back = backSplit.center;
        draft.backSide = backSplit.side;
        draft.backSideSeam = backSplit.sideSeam;
        draft.backSewnWaist = backSplit.sewnWaist;
        draft.backStraightWaist = backSplit.straightWaist;
        draft.backSeamCenterLen = backSplit.seamCenterLen;
        draft.backSeamSideLen = backSplit.seamSideLen;
        draft.backWaistCenterArc = backSplit.centerArc;
    } else {
        draft.back = back.piece;
        draft.backSideSeam = (shaping == Shaping::Princess && extendBelowWaist > 0)
            ? extendedDartSideLen(backWaistlineWidth, backWidth, bArmholeY, bSeamSideY + deltaBack)
            : back.sideSeam;
        draft.backSewnWaist = back.sewnWaist;
        draft.backStraightWaist = back.straightWaist;
    }
    if (frontPrincess) {
        draft.front = frontSplit.center;
        draft.frontSide = frontSplit.side;
        draft.frontSideSeam = frontSplit.sideSeam;
        draft.frontSewnWaist = frontSplit.sewnWaist;
        draft.frontStraightWaist = frontSplit.straightWaist;
        draft.frontSeamCenterLen = frontSplit.seamCenterLen;
        draft.frontSeamSideLen = frontSplit.seamSideLen;
        draft.frontWaistCenterArc = frontSplit.centerArc;
    } else {
        draft.front = front.piece;
        draft.frontSideSeam = (shaping == Shaping::Princess && extendBelowWaist > 0)
            ? extendedDartSideLen(frontWaistlineWidth, frontWidth, fArmholeY, fSeamSideY + deltaFront)
            : front.sideSeam;
        draft.frontSewnWaist = front.sewnWaist;
        draft.frontStraightWaist = front.straightWaist;
    }
    draft.backWaistHalf = backWaistTarget;
    draft.frontWaistHalf = frontWaistTarget;
    draft.frontLength = frontSeamCenterY; // body frame (halter pieces are frame-shifted)
    draft.backLength = seamSideY; // back piece length (= natural backLength unless empire)
    // Piece-frame waist levels: what the drawn geometry actually uses (halter
    // frame shifts + the side-seam truing deltas included).
    draft.frontPieceWaistY = fSeamSideY + deltaFront;
    draft.backPieceWaistY = bSeamSideY + deltaBack;
    draft.frontPieceLength = frontLength;
    draft.backPieceLength = bSeamSideY;
    draft.backArmholeLength = backPrincess ? backSplit.armholeLength : back.armholeLength;
    draft.frontArmholeLength = frontPrincess ? frontSplit.armholeLength : front.armholeLength;
    draft.armholeLength = draft.backArmholeLength + draft.frontArmholeLength;
    draft.armholeDepth = armholeY - shoulderDrop;
    draft.frontShoulderTipX = fShoulderHalf;
    draft.frontShoulderTipY = fShoulderDrop;
    draft.backShoulderTipX = bShoulderHalf;
    draft.backShoulderTipY = bShoulderDrop;
    draft.armholeUnderarmY = armholeY;
    draft.sideWaistY = seamSideY;
    draft.waistSeamY = seamSideY;
    draft.frontChestWidth = frontWidth;
    draft.backChestWidth = backWidth;
    draft.droppedWiden = droppedWiden;
    if (halter) {
        // Raw edges the binding covers, measured with the exact curves the
        // pieces were drawn with (armhole lengths come back from the builders).
        const double frontNeckLen = pathLength(
            [&] {
                std::vector<PathCommand> path{PathCommand::move({0, frontCutout})};
                for (const auto& cmd : neckCommands(neckline, {0, frontCutout}, {fNeckW, 0}))
                    path.push_back(cmd);
                return path;
            }());
        const double strapTopLen = distance({fNeckW, 0}, {fShoulderHalf, fShoulderDrop});
        const double frontSweepLen = frontPrincess ? frontSplit.armholeLength : front.armholeLength;
        const double backTopLen = pathLength(
            [&] {
                std::vector<PathCommand> path{PathCommand::move({0, backCutout})};
                for (const auto& cmd : neckCommands(Neckline::Crew, {0, backCutout}, {backNeckW, 0}))
                    path.push_back(cmd);
                return path;
            }());
        const double backStubLen = distance({backNeckW, 0}, {bShoulderHalf, bShoulderDrop}) +
                                   (backPrincess ? backSplit.armholeLength : back.armholeLength);
        draft.halterBindingEdgeMM =
            2 * (frontNeckLen + strapTopLen + frontSweepLen + backTopLen + backStubLen) + 150;
    }
    return draft;
}

PatternPiece halterBinding(double edgeMM) {
    constexpr double SEG_MAX = 1400; // printable / chalk-note segment
    const int segments = std::max(1, static_cast<int>(std::ceil(edgeMM / SEG_MAX)));
    const double segLen = edgeMM / segments;

    PatternPiece piece;
    piece.name = "Bias binding (halter)";
    piece.cutInstruction =
        "cut " + std::to_string(segments) + " strip(s) " +
        std::to_string(static_cast<long>(std::lround(segLen))) + " x " +
        std::to_string(static_cast<long>(std::lround(halterBindingWidth))) +
        " mm ON THE BIAS (45\xc2\xb0 to the grain), join end to end (total " +
        std::to_string(static_cast<long>(std::lround(edgeMM))) +
        " mm), trim the excess as you bind";
    piece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({segLen, 0}),
        PathCommand::line({segLen, halterBindingWidth}),
        PathCommand::line({0, halterBindingWidth}),
        PathCommand::close(),
    };
    // Center fold line: the strip folds double before it wraps the edge.
    piece.markings = {
        PathCommand::move({0, halterBindingWidth / 2}),
        PathCommand::line({segLen, halterBindingWidth / 2}),
    };
    piece.hasGrainline = true; // drawn on the strip; the cut note says bias
    piece.grainline = Grainline{{segLen * 0.5 - 40, halterBindingWidth / 2},
                                {segLen * 0.5 + 40, halterBindingWidth / 2}};
    piece.seamAllowance = 6;
    return piece;
}

// Thin bias binding strip (patch 3.10 default finish). Same self-lined-tube
// construction as the halter binding but sized for a plain curved edge: length
// = finished edge circumference + overlap, width = bindingCutWidth. The strip
// draws flat on the fabric; the cut note says BIAS (45° to grain) because the
// give of the bias is what lets it wrap a curve without puckering.
PatternPiece biasBinding(double edgeMM, const std::string& label) {
    const double total = edgeMM + bindingOverlap;
    constexpr double SEG_MAX = 1400; // printable / chalk-note segment
    const int segments = std::max(1, static_cast<int>(std::ceil(total / SEG_MAX)));
    const double segLen = total / segments;

    PatternPiece piece;
    piece.name = "Bias binding (" + label + ")";
    piece.cutInstruction =
        "cut " + std::to_string(segments) + " strip(s) " +
        std::to_string(static_cast<long>(std::lround(segLen))) + " x " +
        std::to_string(static_cast<long>(std::lround(bindingCutWidth))) +
        " mm ON THE BIAS (45\xc2\xb0 to the grain), join end to end (total " +
        std::to_string(static_cast<long>(std::lround(total))) +
        " mm = edge " + std::to_string(static_cast<long>(std::lround(edgeMM))) +
        " mm + overlap), press in half, wrap the edge and trim the excess";
    piece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({segLen, 0}),
        PathCommand::line({segLen, bindingCutWidth}),
        PathCommand::line({0, bindingCutWidth}),
        PathCommand::close(),
    };
    // Center fold line: the strip folds double before it wraps the edge.
    piece.markings = {
        PathCommand::move({0, bindingCutWidth / 2}),
        PathCommand::line({segLen, bindingCutWidth / 2}),
    };
    piece.hasGrainline = true; // drawn on the strip; the cut note says bias 45°
    piece.grainline = Grainline{{segLen * 0.5 - 40, bindingCutWidth / 2},
                                {segLen * 0.5 + 40, bindingCutWidth / 2}};
    piece.seamAllowance = 6;
    return piece;
}

namespace {


// One facing piece. Inner edge = the garment's neckline commands verbatim
// (seam match by construction). Outer edge = the neckline flattened to a
// polyline and offset facingDepth along averaged vertex normals, oriented
// away from the neck opening (which sits toward the local origin).
PatternPiece makeFacing(
    const std::string& name,
    const std::string& cutInstruction,
    Neckline neckline,
    double neckW,
    double neckCutout,
    Point shoulderTip
) {
    const Point centerNeck{0, neckCutout};
    const Point neckPoint{neckW, 0};
    const auto inner = neckCommands(neckline, centerNeck, neckPoint);

    // Flatten the inner path centerNeck -> neckPoint.
    std::vector<Point> pts{centerNeck};
    Point current = centerNeck;
    for (const auto& cmd : inner) {
        if (cmd.type == CmdType::Curve) {
            const auto samples = flattenCubic(current, cmd.to, cmd.cp1, cmd.cp2, 12);
            pts.insert(pts.end(), samples.begin() + 1, samples.end());
        } else {
            pts.push_back(cmd.to);
        }
        current = cmd.to;
    }

    // Averaged vertex normals, flipped to point away from the origin corner.
    std::vector<Point> outer(pts.size());
    for (size_t i = 0; i < pts.size(); ++i) {
        const Point& prev = pts[i == 0 ? 0 : i - 1];
        const Point& next = pts[i + 1 < pts.size() ? i + 1 : pts.size() - 1];
        double dx = next.x - prev.x, dy = next.y - prev.y;
        const double len = std::hypot(dx, dy);
        if (len < 1e-6) { dx = 1; dy = 0; }
        else { dx /= len; dy /= len; }
        double nx = -dy, ny = dx;
        if (nx * pts[i].x + ny * pts[i].y < 0) { nx = -nx; ny = -ny; }
        outer[i] = {pts[i].x + nx * BodiceBlock::facingDepth, pts[i].y + ny * BodiceBlock::facingDepth};
    }

    // Shoulder end: walk facingDepth from the neck point toward the shoulder
    // tip so the facing rides on the shoulder seam.
    double sx = shoulderTip.x - neckPoint.x, sy = shoulderTip.y - neckPoint.y;
    const double shoulderLen = std::hypot(sx, sy);
    const double along = std::min(BodiceBlock::facingDepth, shoulderLen * 0.6);
    const Point shoulderEnd{neckPoint.x + sx / shoulderLen * along, neckPoint.y + sy / shoulderLen * along};

    std::vector<PathCommand> commands{PathCommand::move(centerNeck)};
    for (const auto& cmd : inner) commands.push_back(cmd);
    commands.push_back(PathCommand::line(shoulderEnd));
    for (size_t i = outer.size() - 1; i-- > 0;) {
        commands.push_back(PathCommand::line(outer[i]));
    }
    commands.push_back(PathCommand::close()); // back up the center edge to centerNeck

    PatternPiece facing;
    facing.name = name;
    facing.cutInstruction = cutInstruction;
    facing.commands = commands;
    facing.hasGrainline = true;
    // Midway between inner and outer near the center edge: always inside.
    const size_t g1 = pts.size() > 3 ? 1 : 0;
    const size_t g2 = pts.size() > 3 ? 3 : pts.size() - 1;
    facing.grainline = Grainline{
        {(pts[g1].x + outer[g1].x) / 2, (pts[g1].y + outer[g1].y) / 2},
        {(pts[g2].x + outer[g2].x) / 2, (pts[g2].y + outer[g2].y) / 2}};
    facing.seamAllowance = constants::kSeamAllowanceMM;
    return facing;
}

} // namespace

std::vector<PatternPiece> neckFacings(const BodyMeasurementsSnapshot& m, Neckline neckline,
                                      const std::string& frontCut, const std::string& backCut) {
    const double neck = m.neckMM();
    const double shoulderHalf = m.shoulderCM * 10 / 2;
    const double shoulderDrop = shoulderHalf * shoulderDropFactor;
    const double widthMultiplier = neckWidthMultiplier(neckline);
    const Point shoulderTip{shoulderHalf, shoulderDrop};

    const double frontNeckW = std::min(neck * frontNeckWidthFactor * widthMultiplier, shoulderHalf * maxNeckShoulderShare);
    const double backNeckW = std::min(neck * backNeckWidthFactor * widthMultiplier, shoulderHalf * maxNeckShoulderShare);
    const double backCutout = neck * backNeckCutoutFactor;
    // draft() ile AYNI açma (neckClearanceDropMM): delik boyundan kısa olamaz.
    const double frontCutout = frontNeckDepth(neckline, frontNeckW) +
        (neckline == Neckline::Halter ? 0.0
         : neckClearanceDropMM(neckline, neck, frontNeckW,
                               frontNeckDepth(neckline, frontNeckW), backNeckW, backCutout));

    return {
        makeFacing("Front Neck Facing", frontCut, neckline, frontNeckW, frontCutout, shoulderTip),
        makeFacing("Back Neck Facing", backCut, Neckline::Crew, backNeckW, backCutout, shoulderTip),
    };
}

double neckEdgeLength(const BodyMeasurementsSnapshot& m, Neckline neckline) {
    // Same front/back neck width + depth math the facings use — one truth. Each
    // neckCommands path spans centerNeck->neckPoint (one half, drawn on fold),
    // so the full front/back edge is twice that half.
    const double neck = m.neckMM();
    const double shoulderHalf = m.shoulderCM * 10 / 2;
    const double widthMultiplier = neckWidthMultiplier(neckline);

    const double frontNeckW = std::min(neck * frontNeckWidthFactor * widthMultiplier, shoulderHalf * maxNeckShoulderShare);
    const double backNeckW = std::min(neck * backNeckWidthFactor * widthMultiplier, shoulderHalf * maxNeckShoulderShare);
    const double backCutout = neck * backNeckCutoutFactor;
    // draft()/neckFacings ile AYNI acma (neckClearanceDropMM): delik boyundan
    // kisa olamaz - boyun oradan gecer.
    const double frontCutout = frontNeckDepth(neckline, frontNeckW) +
        (neckline == Neckline::Halter ? 0.0
         : neckClearanceDropMM(neckline, neck, frontNeckW,
                               frontNeckDepth(neckline, frontNeckW), backNeckW, backCutout));

    const double frontHalf = halfNeckLength(neckline, {0, frontCutout}, {frontNeckW, 0});
    const double backHalf = halfNeckLength(Neckline::Crew, {0, backCutout}, {backNeckW, 0});
    return (frontHalf + backHalf) * 2;
}

} // namespace BodiceBlock
} // namespace stitchu
