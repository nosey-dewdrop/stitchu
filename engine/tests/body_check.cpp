// body_check.cpp — F1 kapisi: IKI BEDEN, TEK SOZLESME (HEDEF madde 4-5).
//
// Hukumler (hepsi contract/body-v1.json -> body.gen.hpp'ye karsi; bu dosyada beden SAYISI yok):
//  (a) halka cevreleri: Body::ring == contract cevreMM, iki beden, her halka;
//      point(halka, aci) ile cizilen elipsin cevresi cevreMM'in %0.5'i icinde
//  (b) landmark y sirasi: contract bedenler.<id>.landmarkSirasi (tier dizisi; tier ici esit
//      izinli, tier'lar arasi kesin artan). Sira kaynagin dedigidir, testin varsayimi degil:
//      F1 tur 4: satilan flat olcumu sonrasi iki bedende AYNI sira (koltukalti gogus hattinin ustunde).
//      graded EU34-44 gercek36 sirasini kullanir (ayni formul).
//  (c) iki beden farki: Body(croquis36)-Body(gercek36) == farkTablosu (kapiToleransMM)
//  (d) parametrik: graded("EU36") == fromContract("gercek36") ve
//      croquisOf(graded("EU36")) == fromContract("croquis36") (kapiToleransMM):
//      contract'taki sayilar ELLE degil formulden dogmus, formul kodda TEK
//  (e) grade monoton: 34->44 bust/waist/hip/backNapeToWaist artar, hic bir
//      bedende azalmaz (tables.json'daki EU44->46 duz adim tuzagi burada yok)
//  (f) croquis36 bandlari: body.gen.hpp kCroquisBand (figure-bands.json waist_bust / bust_hip,
//      flat-convention sevkPoz omuzGogusOran / omuzEgimiDeg) — croquis bandlarin DISINA cikamaz;
//      gercek36'da koltukalti gogus hattinin ustunde (Aldrich armscye depth < Brusttiefe)
//  (g) gercek+graded: shoulderTip.x >= bustLine.x ve >= underarm.x (omuz gogsun disinda; ANSUR II), kol ekseni
//      elbow/wrist x >= underarm x (iki beden), landmark.x == ringHalfWidth (tek genislik); croquis girth x == cevre/4
//  (g) croquis: TUM girth landmark'lari x == cevre/4 x (1 + kCroquisBolluk) (tek genislik yasasi, F1 tur 5);
//      croquis omuz istisnasi SOZLESMEDEN okunur ve basilir (kCroquisOmuzHukmu, karar ajani 2)
//  (h) siluet dizisi (fig) bedenin kendi y sirasinda ve monoton — sabit dizi zikzak cizerdi
//  (i) gogus kesiti (F1 tur 5): on lob h contract'ta (MDPI 50-71 bandinda), n basilir; on/arka yay payi
//      arkaPay ile 0.05 icinde (DOGRULANMADI tolerans: arkaPay KALIP payi, beden yay payi degil — halkaKesitOran._lob)
//
// argv[1] verilirse KOSU/ciktilar/beden-iki.svg cizer: iki bedenin on gorunusu
// yan yana (halka cizgileri + landmark etiketleri) + 34-44 serisinin siluetleri.
// Cizim C++'ta (cekirdek kurali), JS yalniz gosterir. Diz/bilek/ag yardimci oranlari
// contract cizimYardimcisi'nden (kBodyCizimYardimcisi), koda gomulu degil.
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

#include "../src/body.hpp"
#include "../src/body.gen.hpp"

using stitchu::Body;
using stitchu::BodyPoint;

static int fails = 0;
static void ok(bool c, const std::string& msg) {
    std::printf("  [%s] %s\n", c ? "ok" : "FAIL", msg.c_str());
    if (!c) ++fails;
}
static std::string f1(double v) { char b[32]; std::snprintf(b, sizeof b, "%.1f", v); return b; }

static std::string kisa(const std::string& n) { return n.rfind("landmark.", 0) == 0 ? n.substr(9) : n; }

// (b) sira contract'tan: kBodyOrder_<id> (tier). graded bedenler gercek36 sirasini kullanir.
template <size_t N>
static void checkOrder(const Body& b, const stitchu::contract::BodyOrderRow (&order)[N], const char* orderId) {
    bool mono = true; std::string bad;
    for (size_t i = 1; i < N; ++i) {
        const double a = b.landmark(order[i - 1].name).y, c = b.landmark(order[i].name).y;
        const bool sameTier = order[i].tier == order[i - 1].tier;
        if (!(sameTier ? std::fabs(c - a) < 1e-9 : c > a)) { mono = false; bad += " " + kisa(order[i - 1].name) + "(" + f1(a) + ")->" + kisa(order[i].name) + "(" + f1(c) + ")"; }
    }
    ok(mono, b.id() + ": landmark y sirasi == contract landmarkSirasi(" + orderId + ")" + (mono ? "" : " — KIRIK:" + bad));
    ok(std::fabs(b.landmark("landmark.neckBase").y) < 1e-9, b.id() + ": neckBase.y == 0 (origin omuz cizgisi)");
    ok(b.landmark("landmark.nape").y < 0, b.id() + ": nape omuz cizgisinin ustunde (y<0)");
}

static void checkRings(const Body& b, const stitchu::contract::BodyGirthRow* rows, size_t n) {
    for (size_t i = 0; i < n; ++i) {
        const std::string name = rows[i].name;
        if (std::isnan(rows[i].girthMM)) { ok(!b.hasRing(name), b.id() + ": " + name + " contract null -> Body 'yok'"); continue; }
        ok(std::fabs(b.ring(name) - rows[i].girthMM) < 1e-9, b.id() + ": " + name + " cevre " + f1(b.ring(name)) + " == contract " + f1(rows[i].girthMM));
        const std::string lm = Body::landmarkOfRing(name);
        if (lm.empty() || !b.hasLandmark(lm)) continue;
        // point(halka, aci) ile cizilen kesitin cevresi (2000 adim)
        double per = 0; BodyPoint prev = b.point(name, 0.0);
        for (int k = 1; k <= 2000; ++k) { BodyPoint p = b.point(name, 360.0 * k / 2000.0); per += std::hypot(p.x - prev.x, p.z - prev.z); prev = p; }
        const double err = std::fabs(per - b.ring(name)) / b.ring(name);
        ok(err < 0.005, b.id() + ": point(" + name + ", aci) kesit cevresi " + f1(per) + " vs " + f1(b.ring(name)) + " (sapma " + f1(err * 100) + "%)");
    }
}

static void checkSame(const Body& a, const Body& b, double tol, const std::string& what) {
    bool same = true; std::string bad;
    for (const auto& n : a.landmarkNames()) {
        if (!b.hasLandmark(n) && !a.hasLandmark(n)) continue;
        const BodyPoint p = a.landmark(n), q = b.landmark(n);
        if (std::fabs(p.x - q.x) > tol || std::fabs(p.y - q.y) > tol) { same = false; bad += " " + n + "(" + f1(p.x) + "," + f1(p.y) + " vs " + f1(q.x) + "," + f1(q.y) + ")"; }
    }
    for (const auto& n : a.ringNames()) {
        if (!a.hasRing(n)) continue;
        if (!b.hasRing(n) || std::fabs(a.ring(n) - b.ring(n)) > tol) { same = false; bad += " " + n; }
    }
    ok(same, what + (same ? "" : " — FARK:" + bad));
}

// ---- SVG -----------------------------------------------------------------------
static double yard(const char* name) {
    for (const auto& r : stitchu::contract::kBodyCizimYardimcisi) if (std::string(r.name) == name) return r.v;
    throw std::runtime_error(std::string("cizimYardimcisi yok: ") + name);
}
// Govde siluet dizisi: neckBase + shoulderTip + govde halkalari, bedenin kendi y'sine gore siralanir.
static std::vector<std::string> siluetSirasi(const Body& b) {
    std::vector<std::string> v = {"landmark.neckBase", "landmark.shoulderTip", "landmark.underarm", "landmark.bustLine", "landmark.underbust", "landmark.waist", "landmark.highHip", "landmark.hip"};
    std::stable_sort(v.begin(), v.end(), [&](const std::string& a, const std::string& c) { return b.landmark(a).y < b.landmark(c).y; });
    return v;
}
static std::string fig(const Body& b, double ox, double oy, double s, bool labels, const std::string& title) {
    std::ostringstream o;
    const double dizDis = yard("bacakDisDizOverHip"), bilekDis = yard("bacakDisBilekOverHip"), dizIc = yard("bacakIcDizOverHip"), bilekIc = yard("bacakIcBilekOverHip"), agYarim = yard("agHalkaYarimOverHip");
    auto X = [&](double x) { return ox + x * s; };
    auto Y = [&](double y) { return oy + y * s; };
    auto P = [&](const char* n) { return b.landmark(n); };
    o << "<g class=\"beden\" data-body=\"" << b.id() << "\">\n";
    o << "<text x=\"" << X(0) << "\" y=\"" << Y(-95) << "\" text-anchor=\"middle\" class=\"baslik\">" << title << "</text>\n";
    // yari siluet (sag) ve aynasi: govde landmark'lari BEDENIN KENDI y sirasinda (siluetSirasi):
    // sabit dizi degil — gercek36'da koltukalti gogus hattinin ustunde, baska bir bedende tersi
    // olabilir; sabit dizi zikzak cizerdi (F1 hakem tur 3 kusur 4).
    const std::vector<std::string> seq = siluetSirasi(b);
    for (int side : {1, -1}) {
        o << "<polyline class=\"siluet\" points=\"";
        for (const auto& n : seq) { BodyPoint p = P(n.c_str()); o << X(side * p.x) << "," << Y(p.y) << " "; }
        BodyPoint h = P("landmark.hip"), c = P("landmark.crotch"), k = P("landmark.knee"), a = P("landmark.ankle");
        // bacak: kalcadan diz ve bilege dogru daralan dis hat (oranlar contract cizimYardimcisi, DOGRULANMADI beyanli)
        o << X(side * h.x * dizDis) << "," << Y(k.y) << " " << X(side * h.x * bilekDis) << "," << Y(a.y) << "\" />\n";
        // ic bacak
        o << "<polyline class=\"siluet\" points=\"" << X(0) << "," << Y(c.y) << " " << X(side * h.x * dizIc) << "," << Y(k.y) << " " << X(side * h.x * bilekIc) << "," << Y(a.y) << "\" />\n";
        // kol: shoulderTip -> elbow -> wrist EKSENI + kalinlik (ustkol yaricapi biceps/2pi, bilek wrist/2pi), AYRI rol
        // (data-rol="kol"): govde siluetiyle ayni cizgi degil (F1 hakem tur 4 kusuru 10: eksen cizgisi kol degildir).
        { BodyPoint t = P("landmark.shoulderTip"), e = P("landmark.elbow"), w = P("landmark.wrist");
          const double rB = b.ring("girth.biceps") / (2.0 * 3.14159265358979323846), rW = b.ring("girth.wrist") / (2.0 * 3.14159265358979323846);
          auto seg = [&](BodyPoint p, BodyPoint q, double rp, double rq, int sgn) {
              const double dx = q.x - p.x, dy = q.y - p.y, L = std::hypot(dx, dy); const double nx = -dy / L, ny = dx / L;
              return std::vector<BodyPoint>{{p.x + sgn * nx * rp, p.y + sgn * ny * rp}, {q.x + sgn * nx * rq, q.y + sgn * ny * rq}}; };
          o << "<polyline class=\"kolEksen\" data-rol=\"kol\" points=\"" << X(side * t.x) << "," << Y(t.y) << " " << X(side * e.x) << "," << Y(e.y) << " " << X(side * w.x) << "," << Y(w.y) << "\" />\n";
          for (int sgn : {1, -1}) {
              auto u = seg(t, e, rB, rB, sgn), v = seg(e, w, rB, rW, sgn);
              o << "<polyline class=\"kol\" data-rol=\"kol\" points=\"" << X(side * u[0].x) << "," << Y(u[0].y) << " " << X(side * u[1].x) << "," << Y(u[1].y) << " " << X(side * v[1].x) << "," << Y(v[1].y) << "\" />\n"; }
          // bilek kapagi
          { auto u = seg(e, w, rW, rW, 1), v = seg(e, w, rW, rW, -1); o << "<line class=\"kol\" data-rol=\"kol\" x1=\"" << X(side * u[1].x) << "\" y1=\"" << Y(u[1].y) << "\" x2=\"" << X(side * v[1].x) << "\" y2=\"" << Y(v[1].y) << "\" />\n"; } }
    }
    // boyun + nape
    { BodyPoint nb = P("landmark.neckBase"), nf = P("landmark.neckFront"), np = P("landmark.nape");
      o << "<path class=\"siluet\" d=\"M" << X(-nb.x) << "," << Y(nb.y) << " Q" << X(0) << "," << Y(nf.y * 1.6) << " " << X(nb.x) << "," << Y(nb.y) << "\" />\n";
      o << "<path class=\"arka\" d=\"M" << X(-nb.x) << "," << Y(nb.y) << " Q" << X(0) << "," << Y(np.y * 1.6) << " " << X(nb.x) << "," << Y(nb.y) << "\" />\n"; }
    // apex
    { BodyPoint a = P("landmark.bustApex"); for (int side : {1, -1}) o << "<circle class=\"apex\" cx=\"" << X(side * a.x) << "\" cy=\"" << Y(a.y) << "\" r=\"" << 3 * s + 1 << "\" />\n"; }
    // halka cizgileri + etiket
    std::vector<std::string> rings = {"landmark.underarm", "landmark.bustLine", "landmark.underbust", "landmark.waist", "landmark.highHip", "landmark.hip", "landmark.crotch", "landmark.knee", "landmark.ankle"};
    std::sort(rings.begin(), rings.end(), [&](const std::string& a, const std::string& c) { return P(a.c_str()).y < P(c.c_str()).y; }); // etiket sirasi bedenin kendi y sirasi (croquis'te koltukalti gogus altinda)
    double lastLabelY = -1e9;
    for (const std::string& nn : rings) { const char* n = nn.c_str();
        BodyPoint p = P(n);
        double hw = p.x > 0 ? p.x : P("landmark.hip").x * (std::string(n) == "landmark.crotch" ? agYarim : std::string(n) == "landmark.knee" ? dizDis : bilekDis);
        o << "<line class=\"halka\" x1=\"" << X(-hw) << "\" y1=\"" << Y(p.y) << "\" x2=\"" << X(hw) << "\" y2=\"" << Y(p.y) << "\" />\n";
        double ly = Y(p.y) + 3; if (ly - lastLabelY < 12) ly = lastLabelY + 12; lastLabelY = ly;
        if (labels) o << "<text class=\"etiket\" data-landmark=\"" << n << "\" x=\"" << X(hw) + 6 << "\" y=\"" << ly << "\">" << kisa(n) << " y=" << f1(p.y) << (p.x > 0 ? " x=" + f1(p.x) : "") << "</text>\n";
    }
    // omuz cizgisi (origin)
    { BodyPoint t = P("landmark.shoulderTip");
      o << "<line class=\"origin\" x1=\"" << X(-t.x - 40) << "\" y1=\"" << Y(0) << "\" x2=\"" << X(t.x + 40) << "\" y2=\"" << Y(0) << "\" />\n";
      if (labels) o << "<text class=\"etiket\" x=\"" << X(t.x) + 6 << "\" y=\"" << Y(0) + 3 << "\">omuz cizgisi y=0 · shoulderTip (" << f1(t.x) << "," << f1(t.y) << ") · neckBase x=" << f1(P("landmark.neckBase").x) << "</text>\n"; }
    // nokta isaretleri
    for (const auto& n : b.landmarkNames()) { BodyPoint p = P(n.c_str()); for (int side : {1, -1}) { o << "<circle class=\"lm\" data-landmark=\"" << n << "\" cx=\"" << X(side * p.x) << "\" cy=\"" << Y(p.y) << "\" r=\"2\" />"; if (p.x == 0) break; } }
    o << "\n</g>\n";
    return o.str();
}

static void writeSvg(const std::string& path) {
    const Body g = Body::fromContract("gercek36"), c = Body::fromContract("croquis36");
    const double s = 0.42; // mm -> px
    std::ostringstream o;
    const int W = 1800, H = 900;
    o << "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" << W << "\" height=\"" << H << "\" viewBox=\"0 0 " << W << " " << H << "\" data-unit-mm=\"" << 1.0 / s << "\">\n";
    o << "<style>text{font:12px -apple-system,Helvetica,Arial,sans-serif;fill:#222}.baslik{font-size:16px;font-weight:600}.etiket{font-size:10.5px;fill:#444}.siluet{fill:none;stroke:#1a1a1a;stroke-width:1.6}.arka{fill:none;stroke:#1a1a1a;stroke-width:0.8;stroke-dasharray:3 3}.kol{fill:none;stroke:#1a1a1a;stroke-width:1.2}.kolEksen{fill:none;stroke:#888;stroke-width:0.6;stroke-dasharray:2 3}.halka{stroke:#b3261e;stroke-width:0.8;stroke-dasharray:4 3}.origin{stroke:#1d4ed8;stroke-width:1}.apex{fill:none;stroke:#b3261e;stroke-width:0.8}.lm{fill:#1d4ed8}.seri .siluet{stroke-width:1}.seri .halka{stroke:#999}.not{font-size:11px;fill:#555}</style>\n";
    o << "<rect width=\"100%\" height=\"100%\" fill=\"#fff\"/>\n";
    o << "<text x=\"20\" y=\"26\" class=\"baslik\">contract/body-v1.json — iki beden, tek sozlesme (mm, y=0 omuz cizgisi, +y asagi)</text>\n";
    o << "<text x=\"20\" y=\"44\" class=\"not\">Sol: gercek36 (kalibin bedeni; Burda/Aldrich/Mueller). Orta: croquis36 (flat'in bedeni; Zoe Hong flat template oranlari + tech-pack poz). Sag: 34-44 kalip serisi (Body::graded). Kirmizi kesik = halka, mavi = omuz cizgisi origin.</text>\n";
    o << fig(g, 300, 150, s, true, "gercek36 — kalip (bust 840 / bel 660 / kalca 900; on izdusum ANSUR II)");
    { double kol = 0; for (const auto& r : stitchu::contract::kCroquisOran) if (std::string(r.name) == "kolAcisiDeg") kol = r.v;
      o << fig(c, 950, 150, s, true, "croquis36 — flat (girth x = cevre/4, bel +%3.3 bolluk; kol satilan flat medyani " + f1(kol) + " derece, n=11)"); }
    // fark tablosu
    { double y = 640; o << "<text class=\"baslik\" x=\"1280\" y=\"" << y << "\" style=\"font-size:13px\">fark croquis36 - gercek36 (dx, dy) mm</text>\n";
      for (const auto& r : stitchu::contract::kBodyFark) { if (r.x == 0 && r.y == 0) continue; y += 15; o << "<text class=\"etiket\" data-landmark=\"" << r.name << "\" x=\"1280\" y=\"" << y << "\">" << kisa(r.name) << ": " << f1(r.x) << ", " << f1(r.y) << "</text>\n"; }
      y += 15; o << "<text class=\"etiket\" x=\"1280\" y=\"" << y << "\">digerleri 0,0 (bel/kalca/diz/ag/boy ayni)</text>\n"; }
    // seri
    o << "<g class=\"seri\">\n<text class=\"baslik\" x=\"1540\" y=\"70\" text-anchor=\"middle\" style=\"font-size:13px\">kalip serisi EU34-44 (Body::graded)</text>\n";
    double x = 1345; const double ss = 0.17;
    for (const auto& sz : Body::gradeSizes()) {
        const Body b = Body::graded(sz);
        o << fig(b, x, 200, ss, false, sz);
        o << "<text class=\"etiket\" x=\"" << x << "\" y=\"" << 200 + 1420 * ss << "\" text-anchor=\"middle\">" << f1(b.ring("girth.bust") / 10) << "/" << f1(b.ring("girth.waist") / 10) << "/" << f1(b.ring("girth.hip") / 10) << "</text>\n";
        x += 78;
    }
    o << "</g>\n";
    o << "<text class=\"not\" x=\"20\" y=\"" << H - 30 << "\">Kaynak: contract/body-v1.json (her sayinin yaninda kaynak; DOGRULANMADI etiketli olanlar orada adiyla). Cizim: engine/tests/body_check.cpp (C++); diz/bilek/ag oranlari contract cizimYardimcisi (DOGRULANMADI, yalniz bu cizim). Gercek x = ANSUR II on izdusum (superelips + on lob kesit), gercek gogus ucu y = ANSUR cervicale->gogus ucu (200.2); croquis x = cevre/4 (duz serilmis giysi), croquis gogus hatti = satilan flat pens/prenses medyani (254.9: giysi gogsu bedenin 55 mm altinda cizer). Kol kalinligi biceps/bilek cevresinden, ayri rol. Sira contract landmarkSirasi.</text>\n";
    o << "<text class=\"not\" x=\"20\" y=\"" << H - 14 << "\">Damla icin: flat'ler ORTADAKI iskelete oturur (omuz/koltukalti/gogus/bel/kalca y'leri her flat'te ayni), kaliplar SAGDAKI serinin ustune cizilir.</text>\n";
    o << "</svg>\n";
    std::ofstream f(path); f << o.str();
    std::printf("  yazildi: %s (%zu bayt)\n", path.c_str(), o.str().size());
}

int main(int argc, char** argv) {
    std::printf("body_check — contract/body-v1.json (body.gen.hpp) vs engine/src/body.cpp\n");
    const double tol = stitchu::contract::kBodyKapiToleransMM;
    const Body g = Body::fromContract("gercek36"), c = Body::fromContract("croquis36");

    std::printf("(a) halka cevreleri\n");
    checkRings(g, stitchu::contract::kBodyGirths_gercek36, sizeof(stitchu::contract::kBodyGirths_gercek36) / sizeof(stitchu::contract::kBodyGirths_gercek36[0]));
    checkRings(c, stitchu::contract::kBodyGirths_croquis36, sizeof(stitchu::contract::kBodyGirths_croquis36) / sizeof(stitchu::contract::kBodyGirths_croquis36[0]));

    std::printf("(b) landmark sirasi (contract landmarkSirasi)\n");
    checkOrder(g, stitchu::contract::kBodyOrder_gercek36, "gercek36"); checkOrder(c, stitchu::contract::kBodyOrder_croquis36, "croquis36");
    for (const auto& sz : Body::gradeSizes()) checkOrder(Body::graded(sz), stitchu::contract::kBodyOrder_gercek36, "gercek36");

    std::printf("(c) iki beden farki == farkTablosu (tolerans %.1f mm)\n", tol);
    { bool same = true; std::string bad;
      for (const auto& r : stitchu::contract::kBodyFark) {
          const BodyPoint p = g.landmark(r.name), q = c.landmark(r.name);
          if (std::fabs((q.x - p.x) - r.x) > tol || std::fabs((q.y - p.y) - r.y) > tol) { same = false; bad += std::string(" ") + r.name; }
      }
      ok(same, "croquis36 - gercek36 farki tabloyla ayni" + (same ? "" : " — FARK:" + bad)); }

    std::printf("(d) parametrik: formul tek, contract sayilari formulden\n");
    checkSame(Body::graded("EU36"), g, tol, "graded(EU36) == fromContract(gercek36)");
    checkSame(Body::croquisOf(Body::graded("EU36")), c, tol, "croquisOf(graded(EU36)) == fromContract(croquis36)");

    std::printf("(e) grade monoton 34->44\n");
    { const char* keys[] = {"girth.bust", "girth.waist", "girth.hip", "girth.neckBase", "girth.biceps"};
      const char* lens[] = {"length.backNapeToWaist", "length.armholeDepth", "length.arm", "length.bustDepth"};
      Body prev = Body::graded("EU34");
      for (size_t i = 1; i < Body::gradeSizes().size(); ++i) {
          Body cur = Body::graded(Body::gradeSizes()[i]);
          for (const char* k : keys) ok(cur.ring(k) > prev.ring(k), std::string(cur.id()) + " " + k + " " + f1(cur.ring(k)) + " > " + prev.id() + " " + f1(prev.ring(k)));
          for (const char* k : lens) ok(cur.scalar(k) >= prev.scalar(k), std::string(cur.id()) + " " + k + " " + f1(cur.scalar(k)) + " >= " + f1(prev.scalar(k)));
          prev = cur;
      } }

    std::printf("(f) croquis36 bandlari (contract: figure-bands, sevkPoz -> kCroquisBand)\n");
    { auto band = [&](const char* name) { for (const auto& r : stitchu::contract::kCroquisBand) if (std::string(r.name) == name) return r; throw std::runtime_error(std::string("kCroquisBand yok: ") + name); };
      auto inBand = [&](const char* name, double v) { const auto r = band(name); ok(v >= r.lo && v <= r.hi, "croquis " + std::string(name) + " " + f1(v * (r.hi <= 1.0 ? 1000 : 1)) + (r.hi <= 1.0 ? "/1000" : "") + " in [" + f1(r.lo * (r.hi <= 1.0 ? 1000 : 1)) + "," + f1(r.hi * (r.hi <= 1.0 ? 1000 : 1)) + "] (" + r.kaynak + ")"); };
      inBand("waistHalfOverBustHalf", c.landmark("landmark.waist").x / c.landmark("landmark.bustLine").x);
      inBand("bustHalfOverHipHalf", c.landmark("landmark.bustLine").x / c.landmark("landmark.hip").x);
      inBand("shoulderTipXOverBustHalf", c.landmark("landmark.shoulderTip").x / c.landmark("landmark.bustLine").x);
      inBand("shoulderSlopeDeg", c.scalar("angle.shoulderSlope"));
      // croquis36 icin koltukalti/gogus hatti sirasi (b)'de contract'tan okunur; burada varsayim yazilmaz (karar ajani 1).
      ok(g.landmark("landmark.underarm").y < g.landmark("landmark.bustLine").y, "gercek koltukalti gogus hattinin USTUNDE (Aldrich armscye depth 206 < Brusttiefe)"); }

    std::printf("(g) omuz gogsun disinda, kol ekseni koltukaltinin disinda (F1 tur 4)\n");
    { // Gercek beden (ve 6 graded): on izdusum — omuz ucu gogus yariminin DISINDA (ANSUR II: 1986/1986 kadinda
      // biacromial > chestbreadth), kol ekseni (elbow/wrist x) koltukalti yariminin disinda/uzerinde.
      std::vector<Body> reals = {g}; for (const auto& sz : Body::gradeSizes()) reals.push_back(Body::graded(sz));
      for (const Body& b : reals) {
          const double side = b.landmark("landmark.underarm").x, bustX = b.landmark("landmark.bustLine").x, tipX = b.landmark("landmark.shoulderTip").x;
          ok(tipX >= bustX && tipX >= side, b.id() + ": shoulderTip.x " + f1(tipX) + " >= bustLine.x " + f1(bustX) + " ve >= underarm.x " + f1(side) + " (omuz gogsun disinda)");
          ok(b.landmark("landmark.elbow").x >= side && b.landmark("landmark.wrist").x >= side,
             b.id() + ": kol ekseni elbow.x " + f1(b.landmark("landmark.elbow").x) + " / wrist.x " + f1(b.landmark("landmark.wrist").x) + " >= koltukalti yarimi " + f1(side));
          ok(std::fabs(b.landmark("landmark.bustLine").x - b.ringHalfWidth("girth.bust")) <= 0.05 + 1e-9 && std::fabs(b.landmark("landmark.waist").x - b.ringHalfWidth("girth.waist")) <= 0.05 + 1e-9 && std::fabs(b.landmark("landmark.hip").x - b.ringHalfWidth("girth.hip")) <= 0.05 + 1e-9,   // contract 0.1 mm yuvarlar
             b.id() + ": landmark.x == ringHalfWidth (tek genislik tanimi; bust " + f1(b.ringHalfWidth("girth.bust")) + " bel " + f1(b.ringHalfWidth("girth.waist")) + " kalca " + f1(b.ringHalfWidth("girth.hip")) + ")");
      }
      // Croquis: duz serilmis giysi — girth x'leri cevre/4 (iki kat), omuz cizgisi katlanmaz; omuz/gogus orani
      // sevkPoz bandinda (f) yargilanir, '>=' burada YANLIS hukum olurdu. Kol ekseni yine koltukaltinin disinda.
      const double cside = c.landmark("landmark.underarm").x;
      ok(c.landmark("landmark.elbow").x >= cside && c.landmark("landmark.wrist").x >= cside,
         c.id() + ": kol ekseni elbow.x " + f1(c.landmark("landmark.elbow").x) + " / wrist.x " + f1(c.landmark("landmark.wrist").x) + " >= koltukalti yarimi " + f1(cside));
      std::printf("  [..] %s\n", stitchu::contract::kCroquisOmuzHukmu);
      auto bolluk = [&](const std::string& ring) { for (const auto& r : stitchu::contract::kCroquisBolluk) if (ring == r.name) return r.v; return 0.0; };
      // TEK GENISLIK YASASI: her girth landmark'i (bel ve gogus alti dahil) x == cevre/4 x (1 + bolluk); bolluk yalniz contract'ta yazili halkada
      for (const char* n : {"landmark.bustLine", "landmark.hip", "landmark.underarm", "landmark.underbust", "landmark.waist", "landmark.highHip"}) {
          const std::string ring = Body::ringOfLandmark(n) == "girth.upperBust" ? "girth.bust" : Body::ringOfLandmark(n);
          const double want = c.ring(ring) / 4.0 * (1.0 + bolluk(ring));
          ok(std::fabs(c.landmark(n).x - want) <= 0.05 + 1e-9,
             c.id() + ": " + std::string(n) + ".x " + f1(c.landmark(n).x) + " == " + ring + "/4 x (1+" + f1(bolluk(ring) * 100) + "%) = " + f1(want) + " (tek genislik yasasi)");
      }
    }

    std::printf("(h) siluet dizisi y'de monoton (beden-iki.svg zikzak yapmaz)\n");
    for (const Body* b : {&g, &c}) {
        const auto seq = siluetSirasi(*b); bool mono = true;
        for (size_t i = 1; i < seq.size(); ++i) if (b->landmark(seq[i]).y < b->landmark(seq[i - 1]).y) mono = false;
        std::string dizi; for (const auto& n : seq) dizi += kisa(n) + "(" + f1(b->landmark(n).y) + ") ";
        ok(mono, b->id() + ": siluet " + dizi);
    }

    std::printf("(i) gogus kesiti: on lob + superelips, on/arka yay payi (F1 tur 5)\n");
    { std::vector<Body> reals = {g}; for (const auto& sz : Body::gradeSizes()) reals.push_back(Body::graded(sz));
      for (const Body& b : reals) {
          const double h = b.ringLobHeight("girth.bust");
          ok(h >= 50.0 && h <= 71.0, b.id() + ": gogus lob yuksekligi " + f1(h) + " mm MDPI 3B tarama bandinda [50, 71] (halkaKesitOran._lob)");
          double on = 0, arka = 0; BodyPoint prev = b.point("girth.bust", 0.0);
          for (int k = 1; k <= 2000; ++k) { BodyPoint p = b.point("girth.bust", 360.0 * k / 2000.0); const double d = std::hypot(p.x - prev.x, p.z - prev.z); if (0.5 * (p.z + prev.z) >= 0) on += d; else arka += d; prev = p; }
          const double pay = arka / (on + arka), bf = b.ringBackFrac("girth.bust");
          // Hukum yalniz gercek36'da (sozlesmenin bedeni); graded bedenlerde arkaPay GarmentCode kalip grade'i, lob h sabit ->
          // pay kucuk bedende buyur (EU34 0.421): karar ajanina acik soru (halkaKesitOran._lob), burada bilgi olarak basilir.
          const std::string msg = b.id() + ": gogus arka yay payi " + f1(pay * 1000) + "/1000 vs arkaPay " + f1(bf * 1000) + "/1000 (fark " + f1(std::fabs(pay - bf) * 1000) + "/1000; n=" + f1(b.ringExponent("girth.bust")) + ", kaburga b=" + f1(b.ringRibHalfDepth("girth.bust")) + ", D/2=" + f1(b.ringHalfDepth("girth.bust")) + ")";
          if (b.id() == "gercek36") ok(std::fabs(pay - bf) <= 0.05, msg + " <= 50/1000 (DOGRULANMADI tolerans)"); else std::printf("  [..] %s (bilgi)\n", msg.c_str());
      } }

    if (argc > 1) writeSvg(argv[1]);
    std::printf("%s — %d FAIL\n", fails ? "FAIL" : "OK", fails);
    return fails ? 1 : 0;
}
